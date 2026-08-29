---
title: "Multi-Tenancy in Spring Boot"
description: "How one app serves multiple shops with strict data isolation — Hibernate filters, ThreadLocal, AOP, and the super admin bypass."
date: 2026-08-29
tags: ["backend", "spring-boot", "java", "database", "architecture"]
---

## What is Multi-tenancy?

This app is sold to multiple shops. RK Enterprises is one shop (tenant). Tomorrow another shop signs up — they become another tenant.

Both shops use the same database. Same tables. Same code.

But shop A must never see shop B's farmers, sales, or payments.

That is multi-tenancy. One app, multiple customers, strict data isolation.

---

## How tenant_id works in the DB

Every table that holds tenant-specific data has a `tenant_id` column.

```sql
-- farmers table
id          UUID
tenant_id   UUID    -- which shop owns this farmer
name        TEXT
```

Farmer "Ram" owned by shop A has `tenant_id = shop-A-uuid`.
The same name at shop B has `tenant_id = shop-B-uuid`. Two separate rows.

Without filtering, `SELECT * FROM farmers` returns farmers from ALL tenants. That is a data leak.

---

## Architecture diagram

![Multi-tenancy architecture — Hibernate filter, ThreadLocal, AOP aspect, and tenant isolation flow](/multi-tenancy-architecture.svg)

---

## The Problem — you cannot manually add WHERE every time

15 repositories, 30+ queries. If you manually add `WHERE tenant_id = ?` to every query:
- You will forget one someday
- That one forgotten query leaks data across tenants
- That is a security incident

So this project uses Hibernate Filters — a mechanism that automatically appends
`WHERE tenant_id = :tenantId` to every query for every entity that opts in.

---

## How it is built — 4 pieces

### Piece 1 — FilterDef (define the filter once globally)

**File:** `domain/package-info.java`

```java
@FilterDef(
    name = "tenantFilter",
    parameters = @ParamDef(name = "tenantId", type = UUID.class),
    defaultCondition = "tenant_id = :tenantId"
)
package com.rke.backend.domain;
```

Defines the filter globally. Says — "there is a filter called `tenantFilter`.
When enabled, append `tenant_id = :tenantId` to every query."

Defined once in `package-info.java` — applies to the entire domain package.

---

### Piece 2 — @Filter on each entity (opt in)

**File:** `domain/Farmer.java`

```java
@Entity
@Table(name = "farmers")
@Filter(name = TenantFilters.NAME)
public class Farmer extends TenantScopedEntity {
```

Every entity with `@Filter(name = "tenantFilter")` gets `WHERE tenant_id = :tenantId`
automatically appended to all queries.

Entities without `@Filter` — like `Village` — are global. All tenants share them.

---

### Piece 3 — TenantContext (ThreadLocal carrier)

**File:** `tenant/TenantContext.java`

```java
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT = new ThreadLocal<>();

    public static void setTenantId(UUID tenantId) { CURRENT.set(tenantId); }
    public static UUID getTenantId() { return CURRENT.get(); }
    public static void clear() { CURRENT.remove(); }
}
```

`ThreadLocal` means each request thread has its own isolated copy of this value.

Thread 1 handles shop A's request → holds shop A's tenantId.
Thread 2 handles shop B's request at the same time → holds shop B's tenantId.
They never interfere with each other.

`TenantContextFilter` sets this at the start of every request from the logged-in user's principal.
`clear()` is called in `finally` after every request so the value does not leak to the next request.

---

### Piece 4 — TenantFilterAspect (activates the filter automatically)

**File:** `tenant/TenantFilterAspect.java`

```java
@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* com.rke.backend..repository..*(..))")
    public void enableTenantFilter() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return;  // super_admin — no filter, can see all tenants
        }
        Session session = entityManager.unwrap(Session.class);
        session.enableFilter(TenantFilters.NAME).setParameter(TenantFilters.PARAM, tenantId);
    }
}
```

AOP — Aspect Oriented Programming. The `@Before` means — before any repository method runs,
execute this code first.

Takes `tenantId` from `TenantContext` (ThreadLocal) and enables the Hibernate filter with that value.
From that point, every Hibernate query for a `@Filter` entity automatically gets
`WHERE tenant_id = :tenantId` appended.

You never write the WHERE clause. It happens automatically.

---

## The Full Flow — one request end to end

```
User logs in (shop A staff member)
        ↓
StaffUserPrincipal stores tenantId = shop-A-uuid
        ↓
TenantContextFilter runs on every request
→ TenantContext.setTenantId(shop-A-uuid)  stored in ThreadLocal
        ↓
Controller calls Service calls Repository
        ↓
TenantFilterAspect runs before repository method
→ enables Hibernate filter with tenantId = shop-A-uuid
        ↓
Hibernate executes: SELECT * FROM farmers WHERE tenant_id = 'shop-A-uuid'
        ↓
Only shop A's farmers returned — shop B's data never touched
        ↓
Request ends → TenantContext.clear()
```

---

## Super Admin — the exception

Super admin manages all shops. They can see all tenants' data.

```java
// TenantContextFilter.java
if (principal.getRole() == StaffRole.SUPER_ADMIN) {
    UUID impersonated = (UUID) session.getAttribute(IMPERSONATED_TENANT_ATTR);
    if (impersonated != null) {
        TenantContext.setTenantId(impersonated);  // impersonating a specific tenant
    }
    // else: TenantContext stays null — filter stays off — sees all tenants
}
```

And in `TenantFilterAspect`:

```java
if (tenantId == null) {
    return;  // filter not enabled — query returns all tenants
}
```

When super admin is not impersonating anyone:
- `tenantId` is null
- filter is off
- they see everything across all tenants

---

## Why ThreadLocal and not a method parameter?

The alternative would be passing `tenantId` as a parameter through every method call:

```java
// Without ThreadLocal — messy
public List<Farmer> search(String name, UUID tenantId) { ... }
public Farmer get(UUID id, UUID tenantId) { ... }
public Farmer create(FarmerRequest request, UUID tenantId) { ... }
```

Every single repository method, every single service method would need it.
15 repositories × average 4 methods = 60+ places to pass the same value.

With `ThreadLocal`:
```java
// With ThreadLocal — clean
public List<Farmer> search(String name) { ... }
public Farmer get(UUID id) { ... }
public Farmer create(FarmerRequest request) { ... }
```

The filter is applied automatically. No parameter needed anywhere.

---

## Common interview questions

**Q: What is multi-tenancy?**

One application serving multiple customers where each customer's data is completely isolated from others.

**Q: How do you implement tenant isolation in Spring Boot?**

Using Hibernate filters. Define a `@FilterDef` globally, add `@Filter` on each tenant-owned entity, activate the filter per request using an AOP aspect that reads the tenant ID from a ThreadLocal.

**Q: What is ThreadLocal and why is it used here?**

ThreadLocal stores a value per thread. In a web application each request runs on a separate thread. So each request gets its own isolated tenantId without passing it as a parameter everywhere.

**Q: What happens if you forget to clear the ThreadLocal?**

Web servers reuse threads. The next user's request running on the same thread will inherit the previous user's tenantId. That means they could see another tenant's data — a data leak.

---

## Key Concepts Summary

| Concept | What it means | Where in this project |
|---|---|---|
| Multi-tenancy | One app, multiple customers, isolated data | Every entity with `tenant_id` column |
| `@FilterDef` | Defines the filter SQL globally | `domain/package-info.java` |
| `@Filter` | Entity opts into tenant filtering | Every `TenantScopedEntity` subclass |
| `ThreadLocal` | Per-thread isolated storage for `tenantId` | `TenantContext.java` |
| `TenantContextFilter` | Sets `tenantId` on thread from logged-in user | `security/TenantContextFilter.java` |
| `TenantFilterAspect` | Activates Hibernate filter before every repo call | `tenant/TenantFilterAspect.java` |
| Super admin bypass | Null `tenantId` = filter off = sees all tenants | `TenantContextFilter.java` |
| `TenantContext.clear()` | Prevents data leak between requests on same thread | `finally` block in `TenantContextFilter` |
