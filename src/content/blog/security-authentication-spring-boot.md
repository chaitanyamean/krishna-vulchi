---
title: "Security & Authentication in Spring Boot"
description: "How session-based auth, BCrypt, Spring Security filter chain, role-based access, tenant scoping, and the proxy all wire together in a real project."
date: 2026-08-29
tags: ["backend", "spring-boot", "java", "security"]
---

## The Big Picture — What happens on every request

```
Browser sends request
        ↓
Spring Security Filter Chain
        ↓
Is this /api/auth/login? → No auth needed, pass through
        ↓
Is there a session cookie? → Yes → restore the logged-in user
        ↓
Is user authenticated? → No → return 401
        ↓
Does user have the right role? → No → return 403
        ↓
TenantContextFilter → set tenantId on the thread
        ↓
Your Controller runs
```

---

## Architecture diagram

![Security and authentication architecture — Spring Security filter chain, session flow, role-based access, and tenant context scoping](/security-authentication-architecture.svg)

---

## Step 1 — Login

**Files:** `AuthController.java` + `AuthService.java`

When the frontend calls `POST /api/auth/login`:

```java
// AuthController.java
@PostMapping("/login")
public UserResponse login(@Valid @RequestBody LoginRequest request,
                          HttpServletRequest httpRequest,
                          HttpServletResponse httpResponse) {
    return authService.login(request, httpRequest, httpResponse);
}
```

Inside `AuthService.login()` — this is what actually happens:

### 1. Find the user by username

```java
List<StaffUser> matches = staffUserRepository.findByUsername(request.username());
```

### 2. Check password using BCrypt

```java
if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
    throw invalidCredentials();  // returns 401
}
```

Passwords are never stored as plain text. BCrypt hashes them.
`passwordEncoder.matches()` hashes the incoming password and compares it to the stored hash.

### 3. Create the Principal and store it in the session

```java
StaffUserPrincipal principal = StaffUserPrincipal.from(user);
UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

SecurityContext context = SecurityContextHolder.createEmptyContext();
context.setAuthentication(authentication);
SecurityContextHolder.setContext(context);
securityContextRepository.saveContext(context, httpRequest, httpResponse); // saved to HTTP session
```

After this, Spring writes a `JSESSIONID` cookie to the browser. Every future request carries that cookie.
Spring reads the session from it and restores the logged-in user automatically — no login needed again.

---

## Step 2 — The Principal

**File:** `StaffUserPrincipal.java`

This is the object that represents the logged-in user for the entire request lifecycle.
It implements Spring's `UserDetails` interface.

```java
public class StaffUserPrincipal implements UserDetails, Serializable {
    private final UUID userId;       // used in audit logs
    private final UUID tenantId;     // used to scope DB queries to the right tenant
    private final String username;
    private final StaffRole role;    // STAFF, ADMIN, or SUPER_ADMIN
    private final boolean active;
}
```

### How roles are exposed to Spring Security

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
}
```

If the user's role is `ADMIN`, this returns `ROLE_ADMIN`.
Spring Security checks this when you write `@PreAuthorize("hasRole('ADMIN')")`.

### Why it implements Serializable

The principal is stored in the HTTP session. Sessions can be serialized to disk or Redis.
If the class is not `Serializable`, the session cannot be stored — the app would break on restart.

---

## Step 3 — SecurityConfig

**File:** `SecurityConfig.java`

This is where you define the rules — which URLs are public, which need authentication.

```java
.authorizeHttpRequests(reg -> reg
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()         // browser preflight — always allow
    .requestMatchers("/api/auth/login", "/api/health").permitAll() // public endpoints
    .anyRequest().authenticated()                                   // everything else needs login
)
```

- `/api/auth/login` → anyone can call, no login needed
- `/api/health` → anyone can call
- Every other `/api/**` endpoint → must be logged in

### Other important settings

```java
.csrf(csrf -> csrf.disable())
```

CSRF disabled because this is a JSON API. CSRF attacks target form-based apps, not JSON APIs.

```java
.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
```

Create a session only when needed — when a user logs in.

```java
.exceptionHandling(eh -> eh
    .authenticationEntryPoint(...)  // returns 401 when not logged in
    .accessDeniedHandler(...)       // returns 403 when logged in but no permission
)
```

### 401 vs 403 — interview favourite

| Code | Meaning |
|---|---|
| 401 Unauthorized | Not logged in at all |
| 403 Forbidden | Logged in but does not have permission |

---

## Step 4 — Role-Based Access Control

Two ways this project restricts access by role:

### Way 1 — @PreAuthorize on controller methods

```java
// ItemController.java
@PostMapping
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public Item create(@Valid @RequestBody ItemRequest request) {
    return service.create(request);
}
```

If a STAFF user calls this, Spring returns 403 before the method even runs.
This works because `@EnableMethodSecurity` is declared on `SecurityConfig`.

Without `@EnableMethodSecurity`, `@PreAuthorize` is silently ignored — common mistake.

### Way 2 — @RequiresFeature custom annotation via AOP

```java
// FeatureGuardAspect.java
@Before("@annotation(requiresFeature)")
public void checkFeature(RequiresFeature requiresFeature) {
    if (!tenantFeatureService.isEnabled(tenantId, requiresFeature.value())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Feature not enabled for this tenant");
    }
}
```

This checks if a feature flag is enabled for the tenant — not just the role.
Even an ADMIN can be blocked if their tenant has not paid for a feature.
This is feature-gating — beyond standard role-based access.

---

## Step 5 — TenantContextFilter

**File:** `TenantContextFilter.java`

Runs on every request after authentication. Sets the `tenantId` on a ThreadLocal
so Hibernate can use it to automatically filter every DB query to the right tenant.

```java
currentUserService.currentPrincipal().ifPresent(principal -> {
    if (principal.getRole() == StaffRole.SUPER_ADMIN) {
        UUID impersonated = (UUID) session.getAttribute(IMPERSONATED_TENANT_ATTR);
        if (impersonated != null) {
            TenantContext.setTenantId(impersonated);
        }
        // else: no tenantId set — super admin can see all tenants
    } else {
        TenantContext.setTenantId(principal.getTenantId());
    }
});
```

Always cleared after the request:

```java
} finally {
    TenantContext.clear();  // prevents tenant leaking to the next request on the same thread
}
```

This `finally` block is critical. Web servers reuse threads. Without clearing the ThreadLocal,
the next user's request on the same thread could accidentally see the previous user's tenant data.

---

## Step 6 — Logout

```java
// AuthController.java
@PostMapping("/logout")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void logout(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session != null) {
        session.invalidate();
    }
    SecurityContextHolder.clearContext();
}
```

Two things happen on logout:
1. Session is invalidated on the server — the `JSESSIONID` cookie becomes useless
2. SecurityContext is cleared from memory

---

## The Full Flow — One request end to end

```
POST /api/items  (a STAFF user tries to create an item)
        ↓
SecurityFilterChain — restores session → user is authenticated
        ↓
authorizeHttpRequests — /api/items needs authentication → passes (user is logged in)
        ↓
TenantContextFilter — sets tenantId = user's tenantId on the thread
        ↓
ItemController.create() is called
        ↓
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')") — user is STAFF → 403 returned
        ↓
Service never runs
```

---

## Session-based vs JWT — interview question

This project uses session-based auth. Many modern apps use JWT. Know the difference.

| | Session-based (this project) | JWT (Bearer token) |
|---|---|---|
| Where is user stored | Server memory / DB | Inside the token itself |
| How is it sent | Cookie (JSESSIONID) | Authorization header |
| Logout | Invalidate session on server | Token stays valid until expiry |
| Scalability | Harder (session must be shared across servers) | Easier (stateless) |
| Security | Cookie is HttpOnly, harder to steal via JS | Token can be stolen from localStorage |

---

## Key Concepts Summary

| Concept | Where in this project |
|---|---|
| Session-based auth | `AuthService.login()` — saves context to HTTP session |
| BCrypt password hashing | `SecurityConfig.passwordEncoder()` |
| Principal (logged-in user) | `StaffUserPrincipal` implements `UserDetails` |
| Public vs protected URLs | `SecurityConfig.authorizeHttpRequests()` |
| Role-based access | `@PreAuthorize` on controller methods |
| Feature-based access | `@RequiresFeature` + `FeatureGuardAspect` |
| Tenant scoping per request | `TenantContextFilter` sets ThreadLocal |
| 401 vs 403 | 401 = not logged in, 403 = logged in but no permission |
| Logout | Invalidate session + clear SecurityContext |
