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

Maps the SQL table to a Java class. One field per column. No logic.

```java
@Entity
@Table(name = "notes_on_farmer")
@Filter(name = TenantFilters.NAME)       // applies tenant isolation automatically
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class NoteOnFarmer extends TenantScopedEntity {  // gives id, tenantId, createdAt, updatedAt for free

    @Column(name = "farmer_id", nullable = false)
    private UUID farmerId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
}
```

**What we learned here:**
- `id`, `tenantId`, `createdAt`, `updatedAt` come from base classes — never declare them again
- Every tenant-owned entity needs `@Filter` otherwise users can see other tenants' data
- Java field naming is camelCase, `@Column(name=...)` handles the snake_case mapping to DB
- `columnDefinition = "TEXT"` maps to PostgreSQL TEXT type for long content

---

## Step 3 — DTO

**File:** `dto/NotesOnFarmerRequest.java`

What the client sends in the request body. Not the entity.

```java
public record NotesOnFarmerRequest(

    @NotNull(message = "Farmer ID is mandatory")
    UUID farmerId,

    @NotBlank(message = "content is mandatory")
    String content

) {}
```

**What we learned here:**
- DTO ≠ Entity. The entity has `tenantId`, `userId`, `createdAt` — the client should never set those
- `record` not `class` — immutable, concise, matches project style
- `@NotNull` on UUID fields (UUID cannot use `@NotBlank`)
- `@NotBlank` on String fields (rejects null and empty strings)
- Validation annotations on DTO = automatic 400 response when client sends bad data

---

## Step 4 — Repository

**File:** `repository/NotesOnFarmerRepository.java`

Database access layer. Just an interface — no implementation needed.

```java
public interface NotesOnFarmerRepository extends JpaRepository<NoteOnFarmer, UUID> {

    // Spring reads the method name and generates the SQL automatically
    // Generated SQL: SELECT * FROM notes_on_farmer WHERE farmer_id = ? ORDER BY created_at DESC
    List<NoteOnFarmer> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);
}
```

Free methods from `JpaRepository`:
- `save(entity)` — insert or update
- `findById(id)` — returns `Optional<NoteOnFarmer>`
- `existsById(id)` — returns boolean
- `deleteById(id)` — deletes by id

**What we learned here:**
- No business logic in the repository — only DB queries
- Spring derives queries from method names: `findBy` + field + `OrderBy` + field + `Desc/Asc`
- Method name must use exact Java field names with capital first letter after `findBy`

---

## Step 5 — Service

**File:** `service/NotesOnFarmerService.java`

The brain. All business logic lives here.

```java
@Service
public class NotesOnFarmerService {

    private final NotesOnFarmerRepository repository;
    private final FarmerRepository farmerRepository;
    private final CurrentUserService currentUserService;

    // Constructor injection — not @Autowired on fields
    public NotesOnFarmerService(NotesOnFarmerRepository repository,
                                 FarmerRepository farmerRepository,
                                 CurrentUserService currentUserService) {
        this.repository = repository;
        this.farmerRepository = farmerRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public NoteOnFarmer create(NotesOnFarmerRequest request) {
        requireFarmer(request.farmerId());  // validate farmer exists first

        NoteOnFarmer note = NoteOnFarmer.builder()
                .tenantId(currentUserService.getTenantId())       // from session, never from client
                .userId(currentUserService.getCurrentUserId())    // from session, never from client
                .farmerId(request.farmerId())
                .content(request.content().trim())
                .build();

        return repository.save(note);
    }

    @Transactional(readOnly = true)
    public List<NoteOnFarmer> listByFarmer(UUID farmerId) {
        return repository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    private void requireFarmer(UUID farmerId) {
        if (!farmerRepository.existsById(farmerId)) {
            throw new IllegalArgumentException("Farmer Not Found: " + farmerId);
        }
    }
}
```

**What we learned here:**
- Service is where you ask "what can go wrong?" and handle it
- `tenantId` and `userId` always come from `currentUserService` — never trust the client
- `@Transactional` ensures DB rolls back if anything fails mid-way
- `@Transactional(readOnly = true)` is a performance hint for reads — use it always on read methods
- Validate everything before writing — `requireFarmer()` runs before `repository.save()`
- Constructor injection over `@Autowired` on fields

---

## Step 6 — Controller

**File:** `controller/NotesOnFarmerController.java`

HTTP entry point. Thin — just routing and calling the service. No business logic.

```java
@RestController
@RequestMapping("/api/notes-on-farmer")
public class NotesOnFarmerController {

    private final NotesOnFarmerService service;

    public NotesOnFarmerController(NotesOnFarmerService service) {
        this.service = service;
    }

    // GET /api/notes-on-farmer?farmerId=<uuid>
    @GetMapping
    public List<NoteOnFarmer> list(@RequestParam UUID farmerId) {
        return service.listByFarmer(farmerId);
    }

    // POST /api/notes-on-farmer
    @PostMapping
    public NoteOnFarmer create(@Valid @RequestBody NotesOnFarmerRequest request) {
        return service.create(request);
    }
}
```

**What we learned here:**
- Controller has zero `if` statements — that belongs in the service
- `@Valid` on `@RequestBody` triggers DTO validation — missing or invalid fields return 400 automatically
- `@GetMapping` with no path = query param style (`?farmerId=...`)
- `@GetMapping("/{id}")` with `@PathVariable` = path style (`/api/notes-on-farmer/123`)
- `@RequestParam` reads from query string, `@RequestBody` reads from request body

---

## The interview answer

> "I start with the migration — define the table. Then the entity that maps to it. Then the DTO for what the client sends. Then the repository for DB access. Then the service for business logic. Finally the controller for the HTTP endpoint. Exceptions are handled centrally in `GlobalExceptionHandler`."
