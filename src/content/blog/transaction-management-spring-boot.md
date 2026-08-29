---
title: "Transaction Management in Spring Boot"
description: "A deep dive into @Transactional — rollback rules, readOnly, propagation, isolation, and the proxy gotcha that trips everyone up."
date: 2026-08-29
tags: ["backend", "spring-boot", "java", "database"]
---

## What is a Database Transaction?

A transaction is a group of DB operations that must all succeed or all fail together.

Real example from `SalesService.createSale()` in this project:

When a sale is created, the code does:
1. Saves the `Transaction` header
2. Saves each `TransactionItem` (line items)
3. Records in the audit log

If step 2 fails halfway — say 3 items saved, 4th throws an error — the first 3 and the header should all be deleted. The DB goes back to how it was before.

That is what `@Transactional` does.

---

## Architecture diagram

![Transaction management in Spring Boot — request flow through proxy, service, repository layers and into PostgreSQL](/transaction-management-architecture.svg)

---

## Basic Usage

```java
// From SalesService.java in this project

@Transactional
public TransactionResponse createSale(SaleRequest request, TransactionType type) {

    // Step 1 — validate farmer
    farmerRepository.findById(request.farmerId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Farmer not found: " + request.farmerId()));

    // Step 2 — write transaction header
    Transaction tx = Transaction.builder()
            .tenantId(tenantId)
            .farmerId(request.farmerId())
            .grandTotal(grandTotal)
            .status(TransactionStatus.ACTIVE)
            .build();
    transactionRepository.save(tx);

    // Step 3 — write line items
    for (PricedLine line : lines) {
        TransactionItem item = TransactionItem.builder()
                .transactionId(tx.getId())
                .itemId(line.itemId())
                .amount(line.amount())
                .build();
        transactionItemRepository.save(item);
    }

    // Step 4 — audit log
    auditService.record("transactions", tx.getId(), AuditAction.INSERT, null,
            auditService.snapshot(tx));
}
```

All 4 steps are inside one `@Transactional` method. If step 3 fails, step 2 is also rolled back. Nothing is left in a half-saved state.

---

## readOnly = true

Used on methods that only read data — no writes.

```java
// From SalesService.java in this project

@Transactional(readOnly = true)
public TransactionResponse getSale(UUID id, TransactionType expectedType) {
    Transaction tx = requireOwned(id);
    List<TransactionItemResponse> items = transactionItemRepository
            .findByTransactionId(tx.getId()).stream()
            .map(TransactionItemResponse::from)
            .toList();
    return TransactionResponse.from(tx, items);
}
```

Benefits:
- DB skips row locking
- Hibernate skips dirty checking (does not track changes to entities)
- Can use read replicas if configured

Rule: always put `readOnly = true` on methods that do not write anything.

---

## Most Asked Interview Question 1

**"What happens when an exception is thrown inside a @Transactional method?"**

Answer depends on the type of exception.

### Unchecked Exception — rollback happens automatically

```java
@Transactional
public TransactionResponse createSale(SaleRequest request, TransactionType type) {

    farmerRepository.findById(request.farmerId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Farmer not found"));  // ResponseStatusException is unchecked

    // If exception is thrown above:
    // - nothing is saved to DB
    // - transaction is rolled back automatically
}
```

`RuntimeException`, `IllegalArgumentException`, `ResponseStatusException`, `NotFoundException` — all unchecked. All trigger rollback automatically.

### Checked Exception — rollback does NOT happen by default

```java
// This would NOT roll back on IOException
@Transactional
public void doSomething() throws IOException {
    repository.save(entity);   // saved
    throw new IOException();   // transaction commits anyway — entity stays in DB
}

// Fix: force rollback on checked exceptions
@Transactional(rollbackFor = Exception.class)
public void doSomething() throws IOException {
    repository.save(entity);   // saved
    throw new IOException();   // now rolls back
}
```

In this project all exceptions thrown are unchecked so `rollbackFor` is never needed. But interviewers ask about it.

---

## Most Asked Interview Question 2

**"Can you call a @Transactional method from within the same class?"**

Answer: No. It will not work.

### Why

`@Transactional` works through a proxy. Spring wraps your service in a proxy object that intercepts calls and starts/commits/rolls back the transaction. When you call a method from within the same class using `this`, you bypass the proxy. The annotation is ignored.

### Example of what breaks

```java
@Service
public class SalesService {

    // This method is NOT transactional even though createSale has @Transactional
    public void processBulkSales(List<SaleRequest> requests) {
        for (SaleRequest req : requests) {
            createSale(req, TransactionType.CASH_SALE);  // proxy is bypassed
        }
    }

    @Transactional
    public TransactionResponse createSale(SaleRequest request, TransactionType type) {
        // ...
    }
}
```

### Fix

Move the caller into a separate service and inject it.

```java
@Service
public class BulkSalesService {

    private final SalesService salesService;  // injected

    public void processBulkSales(List<SaleRequest> requests) {
        for (SaleRequest req : requests) {
            salesService.createSale(req, TransactionType.CASH_SALE);  // proxy is used
        }
    }
}
```

---

## Most Asked Interview Question 3

**"What is transaction propagation?"**

Propagation controls what happens when a `@Transactional` method calls another `@Transactional` method.

Default is `REQUIRED` — join the existing transaction if one exists, otherwise start a new one.

```java
@Transactional                          // starts transaction A
public TransactionResponse createSale(...) {

    transactionRepository.save(tx);     // inside transaction A

    auditService.record(...);           // AuditService also has @Transactional
                                        // REQUIRED means it joins transaction A
                                        // not start a new one
}
```

So if `createSale` rolls back, the audit record also rolls back — because they share the same transaction.

### Common propagation values

| Value | Meaning |
|---|---|
| `REQUIRED` (default) | Join existing transaction or start new one |
| `REQUIRES_NEW` | Always start a brand new transaction — suspends the current one |
| `SUPPORTS` | Join if exists, run without transaction if not |
| `NOT_SUPPORTED` | Always run without a transaction |
| `NEVER` | Throw exception if a transaction exists |

If you want the audit log saved even when the main transaction rolls back, use `REQUIRES_NEW` on the audit method. In this project the audit rolls back with the sale — which is the correct behavior.

---

## Most Asked Interview Question 4

**"What is isolation level?"**

Isolation controls what one transaction can see from another transaction running at the same time.

Default in most DBs including PostgreSQL is `READ_COMMITTED` — you can only read data that has been committed by other transactions.

```java
@Transactional(isolation = Isolation.READ_COMMITTED)  // default, rarely needed to set explicitly
public TransactionResponse getSale(UUID id, TransactionType expectedType) {
    // ...
}
```

### Common isolation levels

| Level | What you can read |
|---|---|
| `READ_UNCOMMITTED` | Can read uncommitted data from other transactions (dirty reads possible) |
| `READ_COMMITTED` | Can only read committed data (default, safe) |
| `REPEATABLE_READ` | Same read returns same result within the transaction |
| `SERIALIZABLE` | Strictest — transactions run as if serial, one after another |

In practice you will almost never change the isolation level. But interviewers ask what it means.

---

## Why createSale is a good example of correct transaction usage

```java
@Transactional
public TransactionResponse createSale(SaleRequest request, TransactionType type) {

    // All validation BEFORE any write
    farmerRepository.findById(...)...         // read only
    billNumberTypeRepository.findById(...)... // read only
    validateAndPriceLines(...)...             // read only

    // All writes AFTER validation passes
    transactionRepository.save(tx);
    transactionItemRepository.save(item);
    auditService.record(...);
}
```

Pattern to follow:
1. Validate everything first — reads are cheap, writes are expensive
2. Write only after all validation passes
3. One `@Transactional` wraps all writes — all or nothing

---

## Key concepts summary

| Concept | What it means |
|---|---|
| `@Transactional` | All DB writes succeed or all roll back |
| `readOnly = true` | Performance hint for reads — no writes allowed |
| Unchecked exception | Triggers rollback automatically |
| Checked exception | Does NOT trigger rollback by default |
| `rollbackFor` | Force rollback on checked exceptions |
| Same-class call | `@Transactional` is ignored — proxy is bypassed |
| `REQUIRED` propagation | Default — join existing transaction or start new |
| `REQUIRES_NEW` propagation | Always start a new transaction |
| `READ_COMMITTED` isolation | Default — only read committed data |
