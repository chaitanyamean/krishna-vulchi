---
title: "Java Streams & Collections — Coding Problems and Concepts"
description: "Detailed answers with code for Java Streams coding problems, Stream API concepts, Collections internals, and Generics — written as interview preparation material."
date: 2026-11-08
tags: ["java", "streams", "collections", "interview", "backend"]
---

## Stream Coding Problems

All examples use this `Employee` class:

```java
record Employee(String name, String department, double salary, int age) {}

List<Employee> employees = List.of(
    new Employee("Alice",   "Engineering", 95000, 30),
    new Employee("Bob",     "Engineering", 87000, 25),
    new Employee("Charlie", "Marketing",   72000, 35),
    new Employee("Diana",   "Engineering", 95000, 28),
    new Employee("Eve",     "Marketing",   81000, 32),
    new Employee("Frank",   "HR",          60000, 40),
    new Employee("Grace",   "HR",          67000, 29)
);
```

---

### 52. Given Employee list, find highest, second-highest and Nth-highest salary

```java
// Highest salary
double highest = employees.stream()
    .mapToDouble(Employee::salary)
    .max()
    .orElseThrow();

// Second-highest (distinct salaries)
double secondHighest = employees.stream()
    .map(Employee::salary)
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(1)
    .findFirst()
    .orElseThrow();

// Nth-highest (n = 3)
int n = 3;
double nthHighest = employees.stream()
    .map(Employee::salary)
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(n - 1)
    .findFirst()
    .orElseThrow();
```

Key: use `distinct()` before `sorted()` so equal salaries don't consume multiple positions.

---

### 53. Find highest-paid employee in each department

```java
Map<String, Optional<Employee>> topByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.maxBy(Comparator.comparingDouble(Employee::salary))
    ));

// If you want Employee directly (not Optional):
Map<String, Employee> topByDeptDirect = employees.stream()
    .collect(Collectors.toMap(
        Employee::department,
        e -> e,
        (a, b) -> a.salary() >= b.salary() ? a : b   // merge on duplicate dept
    ));
```

---

### 54. Group employees by department; count employees in each department

```java
// Group
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department));

// Count per department
Map<String, Long> countByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.counting()
    ));
// {Engineering=3, Marketing=2, HR=2}
```

---

### 55. Calculate average salary department-wise; sum salaries by department

```java
// Average
Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.averagingDouble(Employee::salary)
    ));

// Sum
Map<String, Double> sumSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.summingDouble(Employee::salary)
    ));

// Both at once using summarizingDouble
Map<String, DoubleSummaryStatistics> statsByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.summarizingDouble(Employee::salary)
    ));
// statsByDept.get("Engineering").getAverage(), .getSum(), .getMax(), etc.
```

---

### 56. Partition employees by salary / age threshold

```java
// partitioningBy always produces a Map<Boolean, List<T>>

// Salary > 80000
Map<Boolean, List<Employee>> bySalary = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.salary() > 80000));
// true  → [Alice, Bob, Diana, Eve]
// false → [Charlie, Frank, Grace]

// Age >= 30
Map<Boolean, List<Employee>> byAge = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.age() >= 30));
```

`partitioningBy` is a special case of `groupingBy` with exactly two buckets: `true` and `false`.

---

### 57. Sort employees by salary descending and name ascending

```java
List<Employee> sorted = employees.stream()
    .sorted(Comparator.comparingDouble(Employee::salary).reversed()
        .thenComparing(Employee::name))
    .collect(Collectors.toList());
```

`.reversed()` flips the salary comparator; `thenComparing` breaks ties alphabetically.

---

### 58. Find duplicate numbers / strings and their frequency using Streams

```java
List<Integer> numbers = List.of(1, 2, 3, 2, 4, 3, 3, 5);

// Frequency map
Map<Integer, Long> freq = numbers.stream()
    .collect(Collectors.groupingBy(n -> n, Collectors.counting()));
// {1=1, 2=2, 3=3, 4=1, 5=1}

// Only duplicates (count > 1)
Map<Integer, Long> duplicates = freq.entrySet().stream()
    .filter(e -> e.getValue() > 1)
    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
// {2=2, 3=3}

// Same for strings
List<String> words = List.of("apple", "banana", "apple", "cherry", "banana");
Map<String, Long> wordFreq = words.stream()
    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
```

---

### 59. Find first non-repeating character and first repeated character

```java
String s = "aabbcde";

// Frequency map (preserving insertion order)
Map<Character, Long> charFreq = s.chars()
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(c -> c, LinkedHashMap::new, Collectors.counting()));

// First non-repeating
Character firstUnique = charFreq.entrySet().stream()
    .filter(e -> e.getValue() == 1)
    .map(Map.Entry::getKey)
    .findFirst()
    .orElse(null);
// 'c'

// First repeated
Character firstRepeated = charFreq.entrySet().stream()
    .filter(e -> e.getValue() > 1)
    .map(Map.Entry::getKey)
    .findFirst()
    .orElse(null);
// 'a'
```

Using `LinkedHashMap::new` as the map factory preserves the order characters were first seen.

---

### 60. Find frequency of each character / word in a string

```java
// Character frequency
String text = "hello world";
Map<Character, Long> charCount = text.chars()
    .filter(c -> c != ' ')
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

// Word frequency
Map<String, Long> wordCount = Arrays.stream(text.split("\\s+"))
    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
```

---

### 61. Flatten `List<List<Integer>>` and transform nested objects using `flatMap`

```java
List<List<Integer>> nested = List.of(
    List.of(1, 2, 3),
    List.of(4, 5),
    List.of(6, 7, 8, 9)
);

List<Integer> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList());
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Nested objects: extract all skills from all employees
record Developer(String name, List<String> skills) {}
List<Developer> devs = List.of(
    new Developer("Alice", List.of("Java", "Spring")),
    new Developer("Bob",   List.of("Java", "Kafka", "Redis"))
);

List<String> allSkills = devs.stream()
    .flatMap(d -> d.skills().stream())
    .distinct()
    .collect(Collectors.toList());
// [Java, Spring, Kafka, Redis]
```

---

### 62. Find common elements between two lists; remove duplicates while preserving order

```java
List<Integer> a = List.of(1, 2, 3, 4, 5);
List<Integer> b = List.of(3, 4, 5, 6, 7);

// Common elements
List<Integer> common = a.stream()
    .filter(b::contains)
    .collect(Collectors.toList());
// [3, 4, 5]

// For large lists, use a Set for O(1) lookup:
Set<Integer> bSet = new HashSet<>(b);
List<Integer> commonFast = a.stream()
    .filter(bSet::contains)
    .collect(Collectors.toList());

// Remove duplicates preserving order
List<Integer> withDups = List.of(3, 1, 4, 1, 5, 9, 2, 6, 5);
List<Integer> deduped = withDups.stream()
    .distinct()   // preserves first occurrence order
    .collect(Collectors.toList());
// [3, 1, 4, 5, 9, 2, 6]
```

---

### 63. Convert List to Map; handle duplicate keys with a merge function

```java
// Unique keys — name → Employee
Map<String, Employee> nameMap = employees.stream()
    .collect(Collectors.toMap(Employee::name, e -> e));

// Duplicate keys — if two employees share a dept, keep higher salary
Map<String, Employee> deptMap = employees.stream()
    .collect(Collectors.toMap(
        Employee::department,
        e -> e,
        (existing, incoming) -> existing.salary() >= incoming.salary()
                                ? existing : incoming
    ));

// Without merge function, duplicate keys throw IllegalStateException.
// Always provide a merge function when uniqueness isn't guaranteed.
```

---

### 64. Find top 3 highest-paid employees; top N elements using sorted and limit

```java
int topN = 3;

List<Employee> top3 = employees.stream()
    .sorted(Comparator.comparingDouble(Employee::salary).reversed())
    .limit(topN)
    .collect(Collectors.toList());
```

---

### 65. Join names with delimiter; convert list of strings to uppercase

```java
// Join with delimiter
String names = employees.stream()
    .map(Employee::name)
    .collect(Collectors.joining(", "));
// "Alice, Bob, Charlie, Diana, Eve, Frank, Grace"

// With prefix/suffix
String formatted = employees.stream()
    .map(Employee::name)
    .collect(Collectors.joining(", ", "[", "]"));
// "[Alice, Bob, Charlie, Diana, Eve, Frank, Grace]"

// Uppercase
List<String> upper = List.of("hello", "world").stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

---

### 66. Separate even and odd numbers; find sum, average, min and max

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

Map<Boolean, List<Integer>> evenOdd = nums.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));
// true=[2,4,6,8,10], false=[1,3,5,7,9]

IntSummaryStatistics stats = nums.stream()
    .mapToInt(Integer::intValue)
    .summaryStatistics();

stats.getSum();     // 55
stats.getAverage(); // 5.5
stats.getMin();     // 1
stats.getMax();     // 10
```

---

### 67. Find the longest string; strings beginning with a given prefix

```java
List<String> words = List.of("apple", "apricot", "banana", "avocado", "blueberry");

// Longest string
String longest = words.stream()
    .max(Comparator.comparingInt(String::length))
    .orElseThrow();
// "blueberry"

// Starts with "ap"
List<String> apWords = words.stream()
    .filter(w -> w.startsWith("ap"))
    .collect(Collectors.toList());
// ["apple", "apricot"]
```

---

## Stream API Concepts

### 68. `map()` vs `flatMap()`; `filter()` vs `map()`; `findFirst()` vs `findAny()`

`map()` transforms each element 1-to-1 and returns `Stream<R>`.
`flatMap()` transforms each element to a stream and merges all those streams into one — it "flattens" one level of nesting.

```java
// map — each string becomes its length
List<Integer> lengths = List.of("hi", "world").stream()
    .map(String::length)
    .collect(Collectors.toList());
// [2, 5]

// flatMap — each string becomes a stream of chars
List<Character> chars = List.of("hi", "world").stream()
    .flatMap(s -> s.chars().mapToObj(c -> (char) c))
    .collect(Collectors.toList());
// [h, i, w, o, r, l, d]
```

**Rule of thumb:** if `map` would give you `Stream<Stream<R>>`, use `flatMap` instead.

---

**`filter()` vs `map()`**

- `filter()` — decides what to **keep** (predicate returns boolean, type unchanged)
- `map()` — decides how to **transform** (function returns new type or value)

```java
// filter: keep only seniors
employees.stream().filter(e -> e.age() > 30);

// map: extract salaries
employees.stream().map(Employee::salary);
```

---

**`findFirst()` vs `findAny()`**

Both return an `Optional<T>` with the first matching element. The difference matters only for parallel streams: `findFirst()` respects encounter order (deterministic), `findAny()` returns whichever element the thread happens to find first (non-deterministic but potentially faster).

For sequential streams they behave identically.

---

### 69. Intermediate vs terminal operations; lazy evaluation; short-circuiting

**Intermediate operations** (lazy — not executed until a terminal is called): `filter`, `map`, `flatMap`, `sorted`, `distinct`, `peek`, `limit`, `skip`

**Terminal operations** (trigger execution): `collect`, `forEach`, `reduce`, `count`, `min`, `max`, `findFirst`, `findAny`, `anyMatch`, `allMatch`, `noneMatch`

**Lazy evaluation** means no element is processed until a terminal operation is called, and even then only as many elements as needed are processed.

**Short-circuiting** operations stop processing as soon as the result is known:
- `findFirst()` / `findAny()` — stop at the first match
- `anyMatch()` — stops at the first `true`
- `noneMatch()` / `allMatch()` — stop at the first element that breaks the condition
- `limit(n)` — stops after n elements

```java
// Only processes elements until it finds one > 3 — not the whole list
boolean found = List.of(1, 2, 3, 4, 5).stream()
    .filter(n -> n > 3)
    .findFirst()
    .isPresent(); // processes 1,2,3,4 then stops
```

---

### 70. How does a Stream pipeline execute? Can a stream be reused?

A pipeline executes **vertically, one element at a time** (not stage by stage). Each element passes through all intermediate operations before the next element is pulled.

```java
// Execution order: filter(1) → map(1) → filter(2) → map(2) → ...
// NOT: filter all → then map all
List.of(1, 2, 3, 4).stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * 10)
    .forEach(System.out::println);
// Prints: 20, 40
```

**A stream cannot be reused.** Once a terminal operation is called, the stream is consumed. Calling any method on it again throws `IllegalStateException`. Always create a fresh stream from the source.

---

### 71. `Collectors.toMap()`: what happens when duplicate keys exist?

Without a merge function, `toMap()` throws `IllegalStateException` on the first duplicate key. Always provide one when uniqueness isn't guaranteed:

```java
// Throws if two employees share a name
Map<String, Double> salaryMap = employees.stream()
    .collect(Collectors.toMap(
        Employee::name,
        Employee::salary,
        (existing, incoming) -> existing   // keep first
    ));
```

---

### 72. `groupingBy()` vs `partitioningBy()`; `reducing()` vs `summingInt()`

| | `groupingBy` | `partitioningBy` |
|---|---|---|
| Key type | Any type (String, Enum, etc.) | Boolean only |
| Buckets | N buckets | Exactly 2 (true/false) |
| Use when | Categorizing by a field | Splitting by a yes/no condition |

```java
// groupingBy: N groups
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department));

// partitioningBy: 2 groups
Map<Boolean, List<Employee>> highLow = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.salary() > 80000));
```

---

**`reducing()` vs `summingInt()`**

`summingInt/Double/Long` is a convenience collector for a specific use case.
`reducing()` is the general-purpose fold operation — use it when summing isn't enough.

```java
// summingDouble — cleaner for simple sum
double totalSalary = employees.stream()
    .collect(Collectors.summingDouble(Employee::salary));

// reducing — for more complex aggregation (e.g. product of salaries)
OptionalDouble product = employees.stream()
    .map(Employee::salary)
    .reduce((a, b) -> a * b);
```

---

### 73. How do you preserve encounter order? Ordered vs unordered streams

A stream has an **encounter order** if its source has one (List does, HashSet does not). Ordered streams guarantee elements are processed in source order. `unordered()` hints the implementation it can ignore order for potential optimisation — useful with `distinct()` or `limit()` on parallel streams.

---

### 74. `stream()` vs `parallelStream()`; common ForkJoinPool and thread-safety risks

`parallelStream()` splits the data across the common ForkJoinPool threads and merges results. It can be faster for CPU-bound work on large datasets but introduces risks:

- **Thread safety:** shared mutable state inside lambdas causes race conditions
- **Ordering:** non-deterministic unless you use ordered operations
- **Overhead:** for small collections, the fork/join overhead beats any gain
- **Blocking I/O:** virtual threads are better for I/O; parallel streams are for CPU work

```java
// Safe — stateless lambda, immutable result
long count = employees.parallelStream()
    .filter(e -> e.salary() > 80000)
    .count();

// Unsafe — shared mutable list
List<String> names = new ArrayList<>();
employees.parallelStream()
    .forEach(e -> names.add(e.name())); // race condition!

// Safe version
List<String> names = employees.parallelStream()
    .map(Employee::name)
    .collect(Collectors.toList()); // collect is thread-safe
```

---

### 75. How do you handle checked exceptions inside lambda expressions?

Lambdas can't throw checked exceptions directly because the functional interface signatures don't declare them. Options:

```java
// Option 1: wrap in a RuntimeException
employees.stream()
    .map(e -> {
        try {
            return riskyOperation(e);
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    });

// Option 2: create a utility wrapper
@FunctionalInterface
interface ThrowingFunction<T, R> {
    R apply(T t) throws Exception;
}

static <T, R> Function<T, R> wrap(ThrowingFunction<T, R> f) {
    return t -> {
        try { return f.apply(t); }
        catch (Exception e) { throw new RuntimeException(e); }
    };
}

employees.stream().map(wrap(e -> riskyOperation(e)));
```

---

### 76. Primitive streams: `IntStream`, `LongStream`, `DoubleStream` and boxing overhead

Using `Stream<Integer>` boxes each `int` into an `Integer` object — heap allocation for every element. Primitive streams avoid this:

```java
// Avoid boxing
int sum = IntStream.rangeClosed(1, 100).sum(); // no boxing

// Convert from Stream<Integer>
Stream<Integer> boxed = Stream.of(1, 2, 3);
int sum2 = boxed.mapToInt(Integer::intValue).sum();

// Convert back
IntStream.of(1, 2, 3).boxed(); // back to Stream<Integer>
```

Use `mapToInt/Double/Long` to drop into primitive streams and `boxed()` to come back.

---

### 77. When should you prefer a loop over Streams?

- **Performance-critical tight loops** — streams have lambda dispatch overhead
- **Checked exceptions** — loops handle them naturally; streams require wrappers
- **Mutable local state** — streams discourage it; loops make it explicit
- **Early break with complex state** — `break`/`continue` in loops is cleaner than `findFirst` chains
- **Readability** — if the stream chain is longer than the loop it replaces, use a loop

Streams shine for **data transformation pipelines** on collections. Loops shine for **imperative control flow**.

---

## Collections & Generics

### 78. `ArrayList` vs `LinkedList`; `HashSet` vs `TreeSet` vs `LinkedHashSet`

| | `ArrayList` | `LinkedList` |
|---|---|---|
| Backed by | Dynamic array | Doubly-linked list |
| Random access `get(i)` | O(1) | O(n) |
| Insert/remove at end | O(1) amortised | O(1) |
| Insert/remove at middle | O(n) | O(n) (traversal) + O(1) (rewire) |
| Memory | Compact | Node overhead (~40 bytes each) |

Use `ArrayList` for almost everything. Use `LinkedList` when you need a `Deque` (double-ended queue), not for random access.

### `HashSet` vs `TreeSet` vs `LinkedHashSet`

| | `HashSet` | `TreeSet` | `LinkedHashSet` |
|---|---|---|---|
| Order | None | Sorted (natural/Comparator) | Insertion order |
| `add`/`contains`/`remove` | O(1) | O(log n) | O(1) |
| Use when | Fast lookup, no order needed | Need sorted iteration | Need insertion-order iteration |

---

### 79. `HashMap` vs `Hashtable` vs `ConcurrentHashMap`

| | `HashMap` | `Hashtable` | `ConcurrentHashMap` |
|---|---|---|---|
| Thread-safe | No | Yes (global lock) | Yes (segment/bucket locking) |
| Null keys | 1 allowed | Not allowed | Not allowed |
| Performance | Fastest (single-threaded) | Slow (global lock) | Fast under concurrency |

Never use `Hashtable` in new code — `ConcurrentHashMap` is its replacement.

---

### 80. How does `HashMap` work internally? Collision handling, resizing and treeification

A `HashMap` is an array of buckets (default 16). The bucket index is `hash(key) & (capacity - 1)`.

**Put:**
1. Compute `hashCode()` of the key, then apply a secondary hash to spread bits
2. Find bucket index
3. If bucket is empty, insert a new node
4. If key already exists (via `equals()`), update value
5. Otherwise, add to the chain (collision)

**Collision handling:** Java 8+ uses a linked list per bucket for up to 8 entries, then converts to a **red-black tree** (treeification) for O(log n) worst-case lookup.

**Resizing:** when load factor (default 0.75) × capacity is exceeded, the map doubles in size and rehashes all entries.

```java
// Objects used as keys MUST override both equals() and hashCode()
// Two objects that are equal must return the same hashCode
class Point {
    int x, y;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
```

**Mutable keys:** if you mutate a key after inserting it into a `HashMap`, its `hashCode` changes and the entry becomes unreachable — a silent data loss. Always use immutable keys (String, Integer, records).

---

### 81. `equals()` and `hashCode()` contract; mutable keys in `HashMap`

1. If `a.equals(b)` then `a.hashCode() == b.hashCode()` (mandatory)
2. If `a.hashCode() == b.hashCode()` then `a.equals(b)` may or may not be true (hash collision is allowed)

Breaking rule 1 means objects that are logically equal land in different buckets and can never be found in a `HashMap` or `HashSet`.

---

### 82. `Comparable` vs `Comparator`; fail-fast vs fail-safe iterators

```java
// Comparable — natural ordering baked into the class
class Employee implements Comparable<Employee> {
    @Override
    public int compareTo(Employee other) {
        return Double.compare(this.salary, other.salary);
    }
}

// Comparator — external, flexible, can define multiple orderings
Comparator<Employee> bySalaryDesc = Comparator
    .comparingDouble(Employee::salary).reversed();

Comparator<Employee> byDeptThenSalary = Comparator
    .comparing(Employee::department)
    .thenComparingDouble(Employee::salary);
```

Use `Comparable` for the single natural order. Use `Comparator` for alternate orderings or when you can't modify the class.

---

**Fail-Fast vs Fail-Safe Iterators**

**Fail-fast** (most java.util collections): throw `ConcurrentModificationException` if the collection is structurally modified during iteration. They track a `modCount` and check it on each `next()` call.

**Fail-safe** (`ConcurrentHashMap`, `CopyOnWriteArrayList`): iterate over a snapshot or use lock-free algorithms — no exception, but may not reflect the latest state.

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
// Throws ConcurrentModificationException:
for (Integer n : list) {
    if (n == 2) list.remove(n);   // structural modification
}

// Safe: use Iterator.remove()
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() == 2) it.remove();
}
```

---

### 83. How does `ConcurrentHashMap` provide thread safety?

Java 8+ `ConcurrentHashMap` uses **lock striping at bucket level** (synchronized on individual bins, not the whole map) plus **CAS operations** for inserts into empty bins. Reads are entirely lock-free because the internal nodes are `volatile`.

This means multiple threads can read and write different buckets simultaneously — far better throughput than `Hashtable`'s global lock.

`compute()`, `merge()`, and `computeIfAbsent()` are atomic at the key level.

---

### 84. `Collection` vs `Collections`; `List` vs `Set` vs `Map`

- `Collection` — the root interface (`List`, `Set`, `Queue` extend it)
- `Collections` — a utility class with static helper methods (`sort`, `shuffle`, `unmodifiableList`, `synchronizedList`, etc.)

| | `List` | `Set` | `Map` |
|---|---|---|---|
| Duplicates | Allowed | Not allowed | Keys unique, values can repeat |
| Order | Insertion order (ArrayList) | Depends on impl | Depends on impl |
| Access | By index | No index | By key |

---

### 85. Generics, wildcards, `extends` vs `super`, type erasure

```java
// Bounded wildcards
void printAll(List<? extends Number> list) { ... }   // read-only, accepts List<Integer>, List<Double>
void addNumbers(List<? super Integer> list) { ... }  // write-only, accepts List<Integer>, List<Number>

// PECS: Producer Extends, Consumer Super
// — if you read from it, use ? extends
// — if you write to it, use ? super
```

**Type erasure:** generic type parameters are removed at compile time. At runtime, `List<String>` and `List<Integer>` are both just `List`. This means you cannot do `new T[]`, `instanceof List<String>`, or catch generic exceptions.

```java
// This fails at runtime — T is erased
// T obj = new T(); // compile error
// if (obj instanceof List<String>) // compile error

// Workaround: pass Class<T> at runtime
<T> T create(Class<T> clazz) throws Exception {
    return clazz.getDeclaredConstructor().newInstance();
}
```
