---
title: "Notes on Farmer API — Full Development Summary"
description: "A step-by-step walkthrough of building an internal notes API: migration, entity, DTO, repository, service, and controller."
date: 2026-08-29
tags: ["backend", "spring-boot", "java", "api"]
---

## What we built

An internal API that allows shop staff to add and view notes on a farmer. Notes are private to the tenant (shop). Farmers never see them.

---

## The golden rule we followed

> **Always start from the data. Work your way up to HTTP.**

```
Migration → Entity → DTO → Repository → Service → Controller
```

---

## Architecture diagram

![Notes on Farmer API — architecture diagram showing the full request flow from client through controller, service, repository, and into PostgreSQL](/notes-on-farmer-architecture.svg)

---

## Step 1 — Migration (Database)

**File:** `src/main/resources/db/migration/V13__add_notes_on_farmer.sql`

This is always the first step. Before writing any Java, define what the table looks like.

```sql
create table notes_on_farmer(
    id          UUID        DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    tenant_id   UUID        NOT NULL REFERENCES tenants(id),
    farmer_id   UUID        NOT NULL REFERENCES farmers(id),
    user_id     UUID        NOT NULL REFERENCES staff_users(id),
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_on_farmer_farmer_id ON notes_on_farmer(farmer_id);
```

**What we learned here:**
- `UUID` not `int` for IDs — matches the rest of the project
- `REFERENCES` is how you define foreign keys in SQL
- `TIMESTAMPTZ` not `date` — you need date + time + timezone
- `DEFAULT gen_random_uuid()` — DB auto-generates the ID
- `DEFAULT now()` — DB auto-fills timestamps
- Index on `farmer_id` because you will always query by it

---

## Step 2 — Entity

**File:** `domain/NoteOnFarmer.java`

Maps the SQL table to a Java class.

- Extends `TenantScopedEntity` — gives you `id`, `tenantId`, `createdAt`, `updatedAt` for free
- `@Filter(name = TenantFilters.NAME)` — applies tenant isolation automatically
- Lombok annotations (`@Data`, `@SuperBuilder` etc.) — no manual getters/setters/constructors
- Fields are `private`, named in camelCase (`farmerId`, `userId`)

**What we learned here:**
- `id`, `tenantId`, `createdAt`, `updatedAt` come from base classes — never declare them again
- Every tenant-owned entity needs `@Filter` otherwise users can see other tenants' data
- Java field naming is camelCase, `@Column(name=...)` handles the snake_case mapping to DB

---

## Step 3 — DTO

**File:** `dto/NotesOnFarmerRequest.java`

What the client sends in the request body.

- `record` not `class` — immutable, concise, matches project style
- Only two fields: `farmerId` and `content`
- `userId` and `tenantId` are NOT here — they come from the logged-in session, never trusted from the client
- `@NotNull` on `farmerId` (UUID cannot be blank)
- `@NotBlank` on `content` (String must not be empty)

**What we learned here:**
- DTO ≠ Entity. The entity has fields the client should never touch
- Validation annotations on DTO = automatic 400 response when client sends bad data

---

## Step 4 — Repository

**File:** `repository/NotesOnFarmerRepository.java`

Database access layer. Just an interface.

- Extends `JpaRepository<NoteOnFarmer, UUID>` — gives `save()`, `findById()`, `existsById()` for free
- One custom method: `findByFarmerIdOrderByCreatedAtDesc(UUID farmerId)` — Spring reads the method name and generates the SQL automatically

**What we learned here:**
- No business logic in the repository — only DB queries
- Spring derives queries from method names: `findBy` + field + `OrderBy` + field + `Desc/Asc`
- Method name must use exact Java field names with capital first letter after `findBy`

---

## Step 5 — Service

**File:** `service/NotesOnFarmerService.java`

The brain. All business logic lives here.

- `create()` — validates farmer exists first, then builds and saves the note
- `listByFarmer()` — fetches all notes for a farmer ordered by newest first
- `tenantId` comes from `currentUserService.getTenantId()` — never from the client
- `userId` comes from `currentUserService.getCurrentUserId()` — never from the client
- `@Transactional` on writes, `@Transactional(readOnly = true)` on reads
- `requireFarmer()` throws `IllegalArgumentException` if farmer does not exist

**What we learned here:**
- Service is where you ask "what can go wrong?" and handle it
- `@Transactional` ensures DB rolls back if anything fails mid-way
- `readOnly = true` is a performance hint to the DB for read operations
- Constructor injection — not `@Autowired` on fields

---

## Step 6 — Controller

**File:** `controller/NotesOnFarmerController.java`

HTTP entry point. Thin — just routing and calling the service.

- `GET /api/notes-on-farmer?farmerId=<uuid>` — list notes for a farmer
- `POST /api/notes-on-farmer` — create a note
- `@Valid` on request body — triggers DTO validation
- `@RequestParam` for query params, `@RequestBody` for request body
- No business logic — only delegates to service

**What we learned here:**
- Controller has zero `if` statements — that belongs in the service
- `@GetMapping` with no path = query param style (`?farmerId=...`)
- `@GetMapping("/{id}")` with `@PathVariable` = path style (`/123`)

---

## How auth works in this project

No Bearer token. Session-based auth via `JSESSIONID` cookie. Login once via `POST /api/auth/login`, the cookie is set automatically. Every subsequent request carries it.

---

## How to run after changes

```bash
docker compose down && docker compose up --build -d
```

`--build` is required to rebuild the image with new code.

---

## The interview answer

> "I start with the migration — define the table. Then the entity that maps to it. Then the DTO for what the client sends. Then the repository for DB access. Then the service for business logic. Finally the controller for the HTTP endpoint. Exceptions are handled centrally in `GlobalExceptionHandler`."
