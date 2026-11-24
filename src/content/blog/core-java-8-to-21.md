---
title: "Core Java 8 to 21 — Language Features, OOP, JVM, and Concurrency"
description: "Detailed answers with code covering Java 8 through 21 features, OOP fundamentals, JVM internals, and multithreading — written as interview preparation material."
date: 2026-11-08
tags: ["java", "spring-boot", "concurrency", "jvm", "interview", "backend"]
---

## Java Language & Version Features

### 86. Java 8: lambdas, functional interfaces, default/static methods, Optional, Streams, Date-Time API

- **Lambdas** — anonymous functions; enable passing behaviour as data
- **Functional interfaces** — `Function<T,R>`, `Predicate<T>`, `Consumer<T>`, `Supplier<T>`; use `@FunctionalInterface` to enforce one abstract method
- **Default/static interface methods** — allows adding methods to interfaces without breaking implementations
- **Optional** — container for a value that may be absent; avoids null returns
- **Streams** — declarative data pipelines over collections
- **Date-Time API** — `LocalDate`, `LocalDateTime`, `ZonedDateTime`, `Duration`, `Period`; replaces `java.util.Date`

```java
// Lambda + functional interface
Function<String, Integer> len = String::length;

// Optional
Optional<String> name = Optional.ofNullable(findName());
String result = name.filter(s -> !s.isEmpty()).orElse("unknown");

// Date-Time
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plusDays(7);
long days = ChronoUnit.DAYS.between(today, nextWeek); // 7
```

---

### 87. Java 9: modules, JShell, factory methods, private interface methods

- **Modules (JPMS)** — `module-info.java` declares dependencies and exports; enforces strong encapsulation
- **JShell** — interactive REPL for trying Java expressions without a full project
- **Collection factory methods** — `List.of()`, `Set.of()`, `Map.of()` — immutable, null-hostile
- **Private interface methods** — allows shared helper code inside an interface

```java
// Factory methods — immutable, no nulls allowed
List<String> names = List.of("Alice", "Bob");
Map<String, Integer> scores = Map.of("Alice", 95, "Bob", 87);
```

---

### 88. Java 10: local variable type inference (`var`); limitations of `var`

- **`var` (local variable type inference)** — the compiler infers the type; variable is still statically typed

```java
var list = new ArrayList<String>();   // inferred as ArrayList<String>
var map  = new HashMap<String, Integer>();

// Limitations:
// — only for local variables (not fields, params, return types)
// — cannot use with null, lambdas, or array initialisers without explicit type
// var x = null;        // compile error
// var fn = () -> {};   // compile error
```

---

### 89. Java 11: `HttpClient`, String utility methods, single-file source execution

- **`HttpClient`** — modern, async HTTP client replacing `HttpURLConnection`
- **String utilities** — `isBlank()`, `strip()`, `lines()`, `repeat(n)`
- **Single-file source execution** — `java Hello.java` without prior compilation

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .build();
HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
System.out.println(response.body());

" hello ".strip();      // "hello" (Unicode-aware, unlike trim())
"ha".repeat(3);         // "hahaha"
"line1\nline2".lines(); // Stream<String>
```

---

### 90. Java 14: switch expressions and `yield`; Java 15: text blocks

```java
// Switch expression (Java 14)
String label = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "Weekday";
    case SATURDAY, SUNDAY -> "Weekend";
};

// yield for multi-line arms
int score = switch (grade) {
    case "A" -> 100;
    case "B" -> {
        log("B grade");
        yield 80;
    }
    default -> 0;
};

// Text blocks (Java 15)
String json = """
        {
            "name": "Alice",
            "salary": 95000
        }
        """;
```

---

### 91. Java 16: records and pattern matching for `instanceof`

```java
// Record — immutable data carrier; generates constructor, getters, equals, hashCode, toString
record Point(int x, int y) {}

Point p = new Point(3, 4);
p.x();     // 3
p.y();     // 4

// Pattern matching for instanceof (no explicit cast needed)
Object obj = "Hello World";
if (obj instanceof String s && s.length() > 5) {
    System.out.println(s.toUpperCase());   // s is already String here
}
```

---

### 92. Java 17: sealed classes, records, pattern matching for `instanceof`; LTS changes

```java
// Sealed class restricts which classes can extend it
public sealed class Shape permits Circle, Rectangle, Triangle {}

public final class Circle    extends Shape { double radius; }
public final class Rectangle extends Shape { double width, height; }
public non-sealed class Triangle extends Shape {}  // open for further extension

// Exhaustive switch (compiler checks all permitted subtypes)
double area = switch (shape) {
    case Circle c    -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.width() * r.height();
    case Triangle t  -> computeTriangleArea(t);
};
```

Sealed classes + pattern matching together form the foundation for algebraic data types in Java.

---

### 93. Java 21: virtual threads, record patterns, pattern matching for switch, sequenced collections

```java
// Virtual threads (Project Loom) — lightweight threads managed by the JVM
Thread.ofVirtual().start(() -> {
    // blocking I/O here doesn't pin an OS thread
    String result = callExternalApi();
});

// ExecutorService with virtual threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> handleRequest());
}

// Record patterns (deconstruct a record in switch)
record Point(int x, int y) {}
Object obj = new Point(3, 4);
if (obj instanceof Point(int x, int y)) {
    System.out.println(x + ", " + y);
}

// Pattern matching for switch
String format(Object o) {
    return switch (o) {
        case Integer i -> "int: " + i;
        case String s  -> "str: " + s;
        case null      -> "null";
        default        -> "other";
    };
}

// Sequenced collections — guaranteed encounter order with first/last access
SequencedCollection<String> sc = new LinkedHashSet<>(List.of("a","b","c"));
sc.getFirst(); // "a"
sc.getLast();  // "c"
sc.reversed(); // view in reverse order
```

**Production usage:** Virtual threads are ideal for Spring Boot request handling with blocking JDBC or HTTP calls. Each request gets its own virtual thread, allowing tens of thousands of concurrent requests on a small thread pool budget.

### 94. Which Java 17/21 features have you used in production? What problem did they solve?

Sealed classes (Java 17) work well for modelling domain events or command types — the compiler guarantees exhaustive handling in switch expressions, which removes the risk of unhandled cases at runtime. Records eliminate boilerplate for DTOs and value objects.

Virtual threads (Java 21) are the most impactful production feature — enabling high-concurrency Spring Boot services without tuning thread pool sizes or switching to reactive programming.

---

## OOP, Language Fundamentals & JVM

### 95. Explain abstraction, encapsulation, inheritance and polymorphism with backend examples

**Abstraction** — hide complexity, expose a contract.

```java
// JpaRepository hides SQL; you see only save(), findById(), etc.
public interface PaymentService {
    PaymentResult process(PaymentRequest request);
}
```

**Encapsulation** — bundle state and behaviour; control access.

```java
public class BankAccount {
    private double balance;    // private state

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Must be positive");
        this.balance += amount;
    }

    public double getBalance() { return balance; }
}
```

**Inheritance** — reuse and specialise behaviour.

```java
class BaseController {
    protected void validateRequest(HttpRequest req) { ... }
}

class OrderController extends BaseController {
    @PostMapping("/orders")
    ResponseEntity<?> create(HttpRequest req) {
        validateRequest(req);   // inherited
        ...
    }
}
```

**Polymorphism** — same interface, different implementations.

```java
// At runtime, the correct implementation is called
NotificationService service = new EmailNotificationService();
service.send(message);   // calls EmailNotificationService.send()

service = new SmsNotificationService();
service.send(message);   // calls SmsNotificationService.send()
```

---

### 96. Overloading vs overriding; compile-time vs runtime polymorphism

| | Overloading | Overriding |
|---|---|---|
| Resolved at | Compile time | Runtime |
| Polymorphism | Static | Dynamic |
| Signature | Same name, different params | Same name, same params |
| Return type | Can differ | Must be same or covariant |
| Access modifier | Can be anything | Cannot be more restrictive |

```java
// Overloading — compile-time
class Printer {
    void print(String s)  { }
    void print(int n)     { }   // different param type
    void print(String s, int n) { }
}

// Overriding — runtime
class Animal  { String sound() { return "..."; } }
class Dog extends Animal {
    @Override String sound() { return "Woof"; }
}
```

---

### 97. Interface vs abstract class; composition vs inheritance

**Interface:** pure contract, multiple implementation, all methods implicitly `public`, fields are `public static final`. Use when you want to define a capability.

**Abstract class:** partial implementation, single inheritance, can have state and constructors. Use when subclasses share significant common logic.

```java
// Interface — capability
interface Auditable {
    LocalDateTime createdAt();
    LocalDateTime updatedAt();
}

// Abstract class — shared implementation
abstract class BaseEntity implements Auditable {
    private LocalDateTime createdAt = LocalDateTime.now();
    // concrete classes just override what's different
}
```

**Composition over inheritance** — prefer holding a reference to a collaborator rather than extending it. Easier to test, avoids tight coupling, and doesn't expose internal hierarchy.

```java
// Inheritance — Order IS-A BaseEntity (fine)
// Composition — OrderService HAS-A PaymentService (preferred over extending)
class OrderService {
    private final PaymentService paymentService;   // composed
}
```

---

### 98. Immutable class design; String immutability and String pool

```java
public final class Money {                     // 1. final class
    private final long amount;                 // 2. final fields
    private final Currency currency;

    public Money(long amount, Currency currency) {
        this.amount   = amount;
        this.currency = currency;              // 3. no setters
    }

    public long getAmount()      { return amount; }
    public Currency getCurrency(){ return currency; }

    // 4. return new instance for derived values
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) throw new IllegalArgumentException();
        return new Money(this.amount + other.amount, this.currency);
    }
}
```

**String immutability:** `String` literals are pooled in the String Pool (part of heap since Java 7). `new String("hello")` bypasses the pool. `intern()` forces pool lookup. Immutability makes strings safe as `HashMap` keys and in multi-threaded code.

---

### 99. `==` vs `equals()`; `final` vs `finally` vs `finalize()`; `static` keyword

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

a == b;        // true — same pool reference
a == c;        // false — different object
a.equals(c);   // true — same content
```

| | Meaning |
|---|---|
| `final` | Variable: not reassignable; method: not overridable; class: not extendable |
| `finally` | Block that always runs after try/catch, even on exception or return |
| `finalize()` | Called by GC before an object is collected — deprecated in Java 9, removed in 18. Use `Cleaner` instead |

`static` belongs to the class, not the instance. Static methods can't access instance fields directly. Static initializer blocks run once when the class is loaded.

---

### 100. Checked vs unchecked exceptions; custom exception design; try-with-resources

```java
// Checked — must be caught or declared (extends Exception)
class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String msg) { super(msg); }
}

// Unchecked — runtime errors, don't need to be declared (extends RuntimeException)
class InvalidOrderStateException extends RuntimeException {
    public InvalidOrderStateException(String msg) { super(msg); }
}

// Try-with-resources — AutoCloseable is closed automatically
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.execute();
}   // conn and ps are closed here, even if an exception occurs
```

In Spring Boot, prefer unchecked exceptions for domain errors and let a global `@ControllerAdvice` / `@ExceptionHandler` translate them to HTTP responses.

---

### 101. Shallow copy vs deep copy; cloning; serialization basics

**Shallow copy** copies the object but shares references to nested objects. **Deep copy** recursively copies all nested objects.

```java
// Shallow — both copies share the same list reference
Employee e1 = new Employee("Alice", List.of("Java"));
Employee e2 = e1; // same reference
// or via clone() if Cloneable is implemented (default is shallow)

// Deep copy — create new instances for all mutable fields
Employee deepCopy = new Employee(e1.name(), new ArrayList<>(e1.skills()));
```

**Serialization basics:** `implements Serializable` allows an object to be written to a byte stream. `transient` fields are skipped. `serialVersionUID` controls version compatibility — always declare it explicitly to avoid `InvalidClassException` after class changes.

---

### 102. JVM memory areas; heap vs stack; metaspace; class loading process

| Area | Stored | Per thread? |
|---|---|---|
| Heap | Objects, instance variables | No (shared) |
| Stack | Stack frames, local variables, partial results | Yes |
| Metaspace | Class metadata, method bytecode | No (shared) |
| PC Register | Current instruction address | Yes |
| Native Method Stack | Native method state | Yes |

**Heap generations (G1 and earlier):**
- Young Generation (Eden + 2 Survivor spaces) — short-lived objects
- Old Generation (Tenured) — long-lived objects
- Minor GC collects Young; Major/Full GC collects Old

**JIT Compiler:** the JVM interprets bytecode initially, then identifies hot spots and compiles them to native machine code. C1 compiles quickly with light optimisation; C2 compiles more aggressively for peak throughput.

---

### 103. JIT compiler; garbage collection; G1 vs ZGC basics

| | G1 (default since Java 9) | ZGC (production since Java 15) |
|---|---|---|
| Goal | Balance throughput and latency | Ultra-low pause times (< 1 ms) |
| Pause type | Stop-the-world for minor collections | Mostly concurrent, tiny STW pauses |
| Heap size | Up to ~50 GB well | Terabyte-scale heaps |
| When to use | General-purpose workloads | Latency-sensitive services |

---

### 104. How do you investigate memory leak, high CPU, high GC or `OutOfMemoryError`?

**OutOfMemoryError / Memory Leak:**
1. Take a heap dump: `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/`
2. Analyse with VisualVM, Eclipse MAT, or IntelliJ profiler
3. Look for objects with unexpectedly high retained size (often: static caches, ThreadLocal, event listeners not removed)

**High GC:**
- Enable GC logging: `-Xlog:gc*:file=/tmp/gc.log`
- Look for frequent full GCs or long pause times
- Common causes: large object allocation, insufficient heap, too many short-lived objects surviving to old gen

**High CPU:**
1. `jstack <pid>` or `kill -3 <pid>` — thread dump
2. Find threads in `RUNNABLE` state doing CPU work
3. Look for tight loops, `String` concatenation in loops, regex recompilation

---

## Multithreading & Concurrency

### 105. Process vs thread; thread lifecycle; `Runnable` vs `Callable`

A **process** has its own memory space. **Threads** share the process memory and are lighter to create.

Thread lifecycle: `NEW` → `RUNNABLE` → `BLOCKED/WAITING/TIMED_WAITING` → `TERMINATED`

```java
// Runnable — no return value, no checked exception
Runnable r = () -> System.out.println("running");

// Callable — returns a value and can throw checked exceptions
Callable<Integer> c = () -> {
    Thread.sleep(100);
    return 42;
};

Future<Integer> future = executor.submit(c);
int result = future.get();   // blocks until done
```

---

### 106. `synchronized` vs `volatile`; intrinsic lock vs `ReentrantLock`

**`volatile`** — guarantees visibility (all threads see the latest write) but not atomicity. Use for simple flags or single-variable state.

**`synchronized`** — guarantees both visibility and atomicity for the guarded block. Only one thread holds the intrinsic lock at a time.

```java
// volatile — safe for a stop flag, not for counter++
volatile boolean running = true;
// thread A: running = false;
// thread B: while (running) { ... }  — sees the write immediately

// synchronized — safe for counter
private int counter = 0;
synchronized void increment() { counter++; }
```

**`ReentrantLock`** vs intrinsic lock:

```java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // critical section
} finally {
    lock.unlock();   // must release in finally
}

// Extra capabilities intrinsic locks don't have:
lock.tryLock(500, TimeUnit.MILLISECONDS);  // timeout
lock.lockInterruptibly();                  // interruptible
ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();   // multiple readers can hold simultaneously
```

---

### 107. `AtomicInteger` and CAS; race condition; deadlock and livelock

**CAS (Compare-And-Swap):** hardware-level atomic operation — update a value only if it currently equals the expected value. `AtomicInteger` uses CAS in a loop, avoiding synchronized overhead.

```java
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();   // atomic, no lock needed
counter.compareAndSet(5, 10); // sets to 10 only if current value is 5
```

**Race condition:** two threads read-modify-write shared state without synchronisation, producing non-deterministic results.

**Deadlock:** thread A holds lock 1 and waits for lock 2; thread B holds lock 2 and waits for lock 1. Prevention: always acquire locks in the same order, or use `tryLock` with timeout.

**Livelock:** threads keep responding to each other but make no progress (like two people in a hallway stepping aside simultaneously forever).

---

### 108. `wait()`, `notify()`, `notifyAll()`; `sleep()` vs `wait()`

| | `sleep()` | `wait()` |
|---|---|---|
| Defined in | `Thread` | `Object` |
| Lock | Does NOT release the lock | Releases the lock |
| Woken by | Timeout or interrupt | `notify()`/`notifyAll()` or interrupt |
| Requires synchronized? | No | Yes |

```java
// Classic producer-consumer with wait/notify
synchronized (queue) {
    while (queue.isEmpty()) {
        queue.wait();       // releases lock, waits
    }
    process(queue.poll());
}

// Producer side
synchronized (queue) {
    queue.add(item);
    queue.notifyAll();   // wake waiting consumers
}
```

---

### 109. `ExecutorService`; thread pool sizing; rejection policies; graceful shutdown

```java
// Fixed thread pool
ExecutorService pool = Executors.newFixedThreadPool(10);

// Custom pool with rejection policy
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4,                                // corePoolSize
    8,                                // maxPoolSize
    60, TimeUnit.SECONDS,            // keepAliveTime
    new LinkedBlockingQueue<>(100),   // workQueue
    new ThreadPoolExecutor.CallerRunsPolicy() // rejection policy
);
// Rejection policies: AbortPolicy (throws), CallerRunsPolicy (caller runs it),
//                     DiscardPolicy (silently drops), DiscardOldestPolicy (drops oldest)

// Graceful shutdown
executor.shutdown();                        // stop accepting new tasks
executor.awaitTermination(30, TimeUnit.SECONDS); // wait for running tasks
```

**Thread pool sizing rules of thumb:**
- **CPU-bound:** `# of CPU cores + 1`
- **I/O-bound:** `# of cores × (1 + wait_time / compute_time)` — often 10–50× cores
- With virtual threads: one virtual thread per task, no sizing needed

---

### 110. `Future` vs `CompletableFuture`; `thenApply` vs `thenCompose`; `allOf` vs `anyOf`

```java
// Future — blocking, no composition
Future<String> f = executor.submit(() -> fetchData());
String result = f.get();   // blocks

// CompletableFuture — non-blocking, composable
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> fetchData());

// thenApply — transform the result (like map)
CompletableFuture<Integer> length = cf.thenApply(String::length);

// thenCompose — chain another async operation (like flatMap; avoids nesting)
CompletableFuture<Order> order = cf
    .thenCompose(userId -> fetchOrderAsync(userId));  // returns CF<Order>, not CF<CF<Order>>

// allOf — wait for ALL to complete
CompletableFuture<Void> all = CompletableFuture.allOf(cf1, cf2, cf3);
all.thenRun(() -> System.out.println("all done"));

// anyOf — complete when ANY one completes
CompletableFuture<Object> any = CompletableFuture.anyOf(cf1, cf2, cf3);

// Error handling
cf.exceptionally(ex -> "default value")
  .thenAccept(System.out::println);
```

---

### 111. `ConcurrentHashMap` internals; `BlockingQueue`; producer-consumer problem

`ConcurrentHashMap` in Java 8+ uses lock striping — each bucket has its own lock (or CAS for empty buckets). Reads are fully lock-free. `compute()` and `merge()` are atomic per key.

```java
// Producer-Consumer with BlockingQueue
BlockingQueue<Task> queue = new LinkedBlockingQueue<>(100);

// Producer
executor.submit(() -> {
    while (true) {
        queue.put(generateTask());   // blocks if queue is full
    }
});

// Consumer
executor.submit(() -> {
    while (true) {
        Task task = queue.take();    // blocks if queue is empty
        process(task);
    }
});
```

---

### 112. `CountDownLatch` vs `CyclicBarrier` vs `Semaphore`

```java
// CountDownLatch — wait for N events to happen (one-shot, cannot reset)
CountDownLatch latch = new CountDownLatch(3);
// 3 worker threads each call latch.countDown() when done
latch.await();   // main thread waits until count reaches 0

// CyclicBarrier — N threads wait for each other at a sync point (reusable)
CyclicBarrier barrier = new CyclicBarrier(3, () -> System.out.println("phase done"));
// each thread calls barrier.await(); all proceed when all 3 have called it

// Semaphore — limit concurrent access to a resource (like a connection pool)
Semaphore semaphore = new Semaphore(5);   // max 5 concurrent
semaphore.acquire();
try {
    accessSharedResource();
} finally {
    semaphore.release();
}
```

---

### 113. `ThreadLocal` use cases and memory-leak risks

`ThreadLocal` stores a value per thread. Common use cases: request-scoped context (tenant ID, user ID, transaction), SimpleDateFormat per thread (it's not thread-safe).

```java
public class TenantContext {
    private static final ThreadLocal<String> tenantId = new ThreadLocal<>();

    public static void set(String id) { tenantId.set(id); }
    public static String get()        { return tenantId.get(); }
    public static void clear()        { tenantId.remove(); }   // critical!
}
```

**Memory-leak risk:** thread pool threads are reused — if `ThreadLocal.remove()` is not called, the value lives on the thread indefinitely. In Spring, clean up in a servlet filter or `@AfterEach` test method.

---

### 114. Virtual threads vs platform threads; when not to use virtual threads

**Platform threads** map 1:1 to OS threads. Each consumes ~1–2 MB of stack memory. Blocking one blocks the OS thread. Pool sizes are limited (hundreds to low thousands).

**Virtual threads** (Java 21) are managed by the JVM, multiplexed onto a small pool of carrier (OS) threads. Each costs ~a few KB. Blocking suspends the virtual thread and frees the carrier — the carrier picks up another virtual thread.

```java
// Before — thread pool limits concurrency
ExecutorService pool = Executors.newFixedThreadPool(200);

// After — unlimited concurrency for I/O-bound tasks
ExecutorService vPool = Executors.newVirtualThreadPerTaskExecutor();
```

**When NOT to use virtual threads:**
- **CPU-bound work** — virtual threads provide no benefit; they still need carrier threads and can saturate them
- **Code with `synchronized` on blocking I/O** — `synchronized` pins the virtual thread to the carrier; use `ReentrantLock` instead
- **Thread-local caching** — `ThreadLocal` state is per virtual thread and can't be shared across tasks the way a fixed pool might
- **Native code / JNI** — native calls pin the carrier thread

In Spring Boot 3.2+, virtual threads are enabled with a single property:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```
