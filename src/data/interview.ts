export interface Question {
  q: string;
  a: string; // markdown-like text; code blocks use ``` fences
}

export interface Topic {
  id: string;
  label: string;
  questions: Question[];
}

export const topics: Topic[] = [
  // ─────────────────────────────────────────────
  // JAVA STREAMS — CODING PROBLEMS
  // ─────────────────────────────────────────────
  {
    id: 'streams-coding',
    label: 'Java Streams — Coding Problems',
    questions: [
      {
        q: 'Given Employee list, find highest, second-highest and Nth-highest salary.',
        a: `All examples use:
\`\`\`java
record Employee(String name, String department, double salary, int age) {}
\`\`\`

\`\`\`java
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
\`\`\`

Key: use \`distinct()\` before \`sorted()\` so equal salaries don't consume multiple positions.`,
      },
      {
        q: 'Find highest-paid employee in each department.',
        a: `\`\`\`java
Map<String, Optional<Employee>> topByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.maxBy(Comparator.comparingDouble(Employee::salary))
    ));

// Without Optional — using merge function
Map<String, Employee> topByDeptDirect = employees.stream()
    .collect(Collectors.toMap(
        Employee::department,
        e -> e,
        (a, b) -> a.salary() >= b.salary() ? a : b
    ));
\`\`\``,
      },
      {
        q: 'Group employees by department; count employees in each department.',
        a: `\`\`\`java
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
\`\`\``,
      },
      {
        q: 'Calculate average salary department-wise; sum salaries by department.',
        a: `\`\`\`java
// Average
Map<String, Double> avgSalary = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.averagingDouble(Employee::salary)
    ));

// Sum
Map<String, Double> sumSalary = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.summingDouble(Employee::salary)
    ));

// Both at once
Map<String, DoubleSummaryStatistics> stats = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.summarizingDouble(Employee::salary)
    ));
// stats.get("Engineering").getAverage(), .getSum(), .getMax()
\`\`\``,
      },
      {
        q: 'Partition employees by salary / age threshold.',
        a: `\`\`\`java
// partitioningBy always produces Map<Boolean, List<T>>

// Salary > 80000
Map<Boolean, List<Employee>> bySalary = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.salary() > 80000));
// true  → high earners
// false → others

// Age >= 30
Map<Boolean, List<Employee>> byAge = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.age() >= 30));
\`\`\`

\`partitioningBy\` is a special case of \`groupingBy\` with exactly two buckets: \`true\` and \`false\`.`,
      },
      {
        q: 'Sort employees by salary descending and name ascending.',
        a: `\`\`\`java
List<Employee> sorted = employees.stream()
    .sorted(Comparator.comparingDouble(Employee::salary).reversed()
        .thenComparing(Employee::name))
    .collect(Collectors.toList());
\`\`\`

\`.reversed()\` flips the salary comparator; \`thenComparing\` breaks ties alphabetically.`,
      },
      {
        q: 'Find duplicate numbers / strings and their frequency using Streams.',
        a: `\`\`\`java
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
\`\`\``,
      },
      {
        q: 'Find first non-repeating character and first repeated character.',
        a: `\`\`\`java
String s = "aabbcde";

// LinkedHashMap preserves insertion order
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
\`\`\``,
      },
      {
        q: 'Find frequency of each character / word in a string.',
        a: `\`\`\`java
String text = "hello world";

// Character frequency
Map<Character, Long> charCount = text.chars()
    .filter(c -> c != ' ')
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(c -> c, Collectors.counting()));

// Word frequency
Map<String, Long> wordCount = Arrays.stream(text.split("\\\\s+"))
    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
\`\`\``,
      },
      {
        q: 'Flatten List<List<Integer>> and transform nested objects using flatMap.',
        a: `\`\`\`java
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

List<String> allSkills = devs.stream()
    .flatMap(d -> d.skills().stream())
    .distinct()
    .collect(Collectors.toList());
\`\`\`

**Rule:** if \`map\` would give \`Stream<Stream<R>>\`, use \`flatMap\` instead.`,
      },
      {
        q: 'Find common elements between two lists; remove duplicates while preserving order.',
        a: `\`\`\`java
List<Integer> a = List.of(1, 2, 3, 4, 5);
List<Integer> b = List.of(3, 4, 5, 6, 7);

// Use Set for O(1) lookup on large lists
Set<Integer> bSet = new HashSet<>(b);
List<Integer> common = a.stream()
    .filter(bSet::contains)
    .collect(Collectors.toList());
// [3, 4, 5]

// Remove duplicates preserving insertion order
List<Integer> withDups = List.of(3, 1, 4, 1, 5, 9, 2, 6, 5);
List<Integer> deduped = withDups.stream()
    .distinct()   // preserves first occurrence order
    .collect(Collectors.toList());
// [3, 1, 4, 5, 9, 2, 6]
\`\`\``,
      },
      {
        q: 'Convert List to Map; handle duplicate keys with a merge function.',
        a: `\`\`\`java
// Unique keys — name → Employee
Map<String, Employee> nameMap = employees.stream()
    .collect(Collectors.toMap(Employee::name, e -> e));

// Duplicate keys — keep the higher-salaried employee per department
Map<String, Employee> deptMap = employees.stream()
    .collect(Collectors.toMap(
        Employee::department,
        e -> e,
        (existing, incoming) -> existing.salary() >= incoming.salary()
                                ? existing : incoming
    ));
\`\`\`

Without a merge function, duplicate keys throw \`IllegalStateException\`. Always provide one when uniqueness isn't guaranteed.`,
      },
      {
        q: 'Find top 3 highest-paid employees; top N elements using sorted and limit.',
        a: `\`\`\`java
int topN = 3;

List<Employee> top3 = employees.stream()
    .sorted(Comparator.comparingDouble(Employee::salary).reversed())
    .limit(topN)
    .collect(Collectors.toList());
\`\`\``,
      },
      {
        q: 'Join names with delimiter; convert list of strings to uppercase.',
        a: `\`\`\`java
// Join with delimiter
String names = employees.stream()
    .map(Employee::name)
    .collect(Collectors.joining(", "));
// "Alice, Bob, Charlie, ..."

// With prefix/suffix
String formatted = employees.stream()
    .map(Employee::name)
    .collect(Collectors.joining(", ", "[", "]"));
// "[Alice, Bob, Charlie, ...]"

// Uppercase
List<String> upper = List.of("hello", "world").stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
\`\`\``,
      },
      {
        q: 'Separate even and odd numbers; find sum, average, min and max.',
        a: `\`\`\`java
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
\`\`\``,
      },
      {
        q: 'Find the longest string; strings beginning with a given prefix.',
        a: `\`\`\`java
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
\`\`\``,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // JAVA STREAMS — CONCEPTS
  // ─────────────────────────────────────────────
  {
    id: 'streams-concepts',
    label: 'Java Streams — Concepts',
    questions: [
      {
        q: 'map() vs flatMap(); filter() vs map(); findFirst() vs findAny().',
        a: `**map()** transforms each element 1-to-1. **flatMap()** transforms each element to a stream and merges all those streams — it flattens one level of nesting.

\`\`\`java
// map → each string becomes its length
List<Integer> lengths = List.of("hi", "world").stream()
    .map(String::length).collect(Collectors.toList()); // [2, 5]

// flatMap → each string becomes a stream of chars
List<Character> chars = List.of("hi", "world").stream()
    .flatMap(s -> s.chars().mapToObj(c -> (char) c))
    .collect(Collectors.toList()); // [h, i, w, o, r, l, d]
\`\`\`

**Rule:** if \`map\` would give \`Stream<Stream<R>>\`, use \`flatMap\`.

**filter()** decides what to **keep** (predicate, type unchanged). **map()** decides how to **transform** (new type or value).

**findFirst()** vs **findAny():** both return \`Optional<T>\`. Difference matters only in parallel streams — \`findFirst()\` respects encounter order (deterministic), \`findAny()\` returns whichever thread finds first (faster but non-deterministic).`,
      },
      {
        q: 'Intermediate vs terminal operations; lazy evaluation; short-circuiting.',
        a: `**Intermediate** (lazy — not executed until a terminal is called): \`filter\`, \`map\`, \`flatMap\`, \`sorted\`, \`distinct\`, \`peek\`, \`limit\`, \`skip\`

**Terminal** (trigger execution): \`collect\`, \`forEach\`, \`reduce\`, \`count\`, \`min\`, \`max\`, \`findFirst\`, \`findAny\`, \`anyMatch\`, \`allMatch\`, \`noneMatch\`

**Lazy evaluation:** no element is processed until a terminal is called, and even then only as many elements as needed.

**Short-circuiting** stops early once the result is known:
- \`findFirst()\` / \`findAny()\` — stop at first match
- \`anyMatch()\` — stops at first \`true\`
- \`limit(n)\` — stops after n elements

\`\`\`java
// Only processes elements until it finds one > 3
boolean found = List.of(1, 2, 3, 4, 5).stream()
    .filter(n -> n > 3)
    .findFirst()
    .isPresent(); // processes 1,2,3,4 then stops
\`\`\``,
      },
      {
        q: 'How does a Stream pipeline execute? Can a stream be reused?',
        a: `A pipeline executes **vertically, one element at a time** — each element passes through all intermediate operations before the next element is pulled. It does NOT process all elements through stage 1 first, then stage 2.

\`\`\`java
// Execution order: filter(1)→map(1)→filter(2)→map(2)→...
List.of(1, 2, 3, 4).stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * 10)
    .forEach(System.out::println);
// Prints: 20, 40
\`\`\`

**A stream cannot be reused.** Once a terminal operation is called, the stream is consumed. Calling any method on it again throws \`IllegalStateException\`. Always create a fresh stream from the source.`,
      },
      {
        q: 'Collectors.toMap(): what happens when duplicate keys exist?',
        a: `Without a merge function, \`toMap()\` throws \`IllegalStateException\` on the first duplicate key.

\`\`\`java
// Safe — always provide a merge function when uniqueness isn't guaranteed
Map<String, Double> salaryMap = employees.stream()
    .collect(Collectors.toMap(
        Employee::name,
        Employee::salary,
        (existing, incoming) -> existing   // keep first
    ));
\`\`\``,
      },
      {
        q: 'groupingBy() vs partitioningBy(); reducing() vs summingInt().',
        a: `| | groupingBy | partitioningBy |
|---|---|---|
| Key type | Any type | Boolean only |
| Buckets | N buckets | Exactly 2 (true/false) |
| Use when | Categorizing by a field | Splitting by a yes/no condition |

\`\`\`java
// groupingBy
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department));

// partitioningBy
Map<Boolean, List<Employee>> highLow = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.salary() > 80000));
\`\`\`

**reducing()** is the general-purpose fold; **summingInt/Double/Long** is a convenience shortcut for simple sums.`,
      },
      {
        q: 'How do you preserve encounter order? Ordered vs unordered streams.',
        a: `A stream has an **encounter order** if its source has one (List does, HashSet does not). Ordered streams guarantee elements are processed in source order.

\`unordered()\` hints the implementation it can ignore order for potential optimisation — useful with \`distinct()\` or \`limit()\` on parallel streams. It never reorders data; it just removes the ordering constraint so the runtime can apply optimisations.`,
      },
      {
        q: 'stream() vs parallelStream(); common ForkJoinPool and thread-safety risks.',
        a: `\`parallelStream()\` splits data across the common ForkJoinPool threads. Can be faster for CPU-bound work on large datasets but risks:

- **Thread safety:** shared mutable state in lambdas causes race conditions
- **Ordering:** non-deterministic unless you use ordered operations
- **Overhead:** for small collections, fork/join cost beats any gain
- **Blocking I/O:** virtual threads are better for I/O; parallel streams are for CPU work

\`\`\`java
// Safe — stateless lambda, immutable result
long count = employees.parallelStream()
    .filter(e -> e.salary() > 80000).count();

// Unsafe — shared mutable list
List<String> names = new ArrayList<>();
employees.parallelStream().forEach(e -> names.add(e.name())); // race condition!

// Safe version
List<String> names = employees.parallelStream()
    .map(Employee::name)
    .collect(Collectors.toList()); // collect is thread-safe
\`\`\``,
      },
      {
        q: 'How do you handle checked exceptions inside lambda expressions?',
        a: `Lambdas can't throw checked exceptions because the functional interface signatures don't declare them. Options:

\`\`\`java
// Option 1: wrap in RuntimeException
employees.stream().map(e -> {
    try { return riskyOperation(e); }
    catch (IOException ex) { throw new RuntimeException(ex); }
});

// Option 2: utility wrapper
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
\`\`\``,
      },
      {
        q: 'Primitive streams: IntStream, LongStream, DoubleStream and boxing overhead.',
        a: `\`Stream<Integer>\` boxes each \`int\` into an \`Integer\` object — heap allocation for every element. Primitive streams avoid this:

\`\`\`java
// No boxing
int sum = IntStream.rangeClosed(1, 100).sum();

// Convert from Stream<Integer>
int sum2 = Stream.of(1, 2, 3).mapToInt(Integer::intValue).sum();

// Convert back
IntStream.of(1, 2, 3).boxed(); // back to Stream<Integer>
\`\`\`

Use \`mapToInt/Double/Long\` to drop into primitive streams and \`boxed()\` to come back.`,
      },
      {
        q: 'When should you prefer a loop over Streams?',
        a: `Prefer a loop when:
- **Performance-critical tight loops** — streams have lambda dispatch overhead
- **Checked exceptions** — loops handle them naturally; streams require wrappers
- **Mutable local state** — streams discourage it; loops make it explicit
- **Early break with complex state** — \`break\`/\`continue\` is cleaner than \`findFirst\` chains
- **Readability** — if the stream chain is longer than the equivalent loop, use a loop

Streams shine for **data transformation pipelines**. Loops shine for **imperative control flow**.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // COLLECTIONS & GENERICS
  // ─────────────────────────────────────────────
  {
    id: 'collections',
    label: 'Collections & Generics',
    questions: [
      {
        q: 'ArrayList vs LinkedList; HashSet vs TreeSet vs LinkedHashSet.',
        a: `| | ArrayList | LinkedList |
|---|---|---|
| Backed by | Dynamic array | Doubly-linked list |
| Random access get(i) | O(1) | O(n) |
| Insert/remove at end | O(1) amortised | O(1) |
| Insert/remove at middle | O(n) | O(n) traversal + O(1) rewire |
| Memory | Compact | Node overhead ~40 bytes each |

Use \`ArrayList\` for almost everything. Use \`LinkedList\` only when you need a \`Deque\`.

| | HashSet | TreeSet | LinkedHashSet |
|---|---|---|---|
| Order | None | Sorted | Insertion order |
| add/contains/remove | O(1) | O(log n) | O(1) |
| Use when | Fast lookup | Need sorted iteration | Need insertion-order iteration |`,
      },
      {
        q: 'HashMap vs Hashtable vs ConcurrentHashMap.',
        a: `| | HashMap | Hashtable | ConcurrentHashMap |
|---|---|---|---|
| Thread-safe | No | Yes (global lock) | Yes (bucket-level locking) |
| Null keys | 1 allowed | Not allowed | Not allowed |
| Performance | Fastest (single-threaded) | Slow (global lock) | Fast under concurrency |

Never use \`Hashtable\` in new code — \`ConcurrentHashMap\` is its replacement.`,
      },
      {
        q: 'How does HashMap work internally? Collision handling, resizing and treeification.',
        a: `A \`HashMap\` is an array of buckets (default 16). Bucket index = \`hash(key) & (capacity - 1)\`.

**Put:**
1. Compute \`hashCode()\`, apply secondary hash to spread bits
2. Find bucket index
3. If empty → insert new node
4. If key exists (via \`equals()\`) → update value
5. Otherwise → add to chain (collision)

**Collision handling:** Java 8+ uses a linked list per bucket up to 8 entries, then converts to a **red-black tree** (treeification) for O(log n) worst-case lookup.

**Resizing:** when \`load factor (0.75) × capacity\` is exceeded, map doubles in size and rehashes all entries.

\`\`\`java
// Keys MUST override both equals() and hashCode()
class Point {
    int x, y;
    @Override public boolean equals(Object o) {
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
}
\`\`\`

**Mutable keys:** mutating a key after inserting it changes its hashCode — the entry becomes unreachable. Always use immutable keys (String, Integer, records).`,
      },
      {
        q: 'equals() and hashCode() contract; mutable keys in HashMap.',
        a: `1. If \`a.equals(b)\` then \`a.hashCode() == b.hashCode()\` **(mandatory)**
2. If \`a.hashCode() == b.hashCode()\` then \`a.equals(b)\` may or may not be true (hash collision is allowed)

Breaking rule 1 means objects that are logically equal land in different buckets and can never be found in a \`HashMap\` or \`HashSet\`.

**Mutable keys:** if you mutate a key after inserting it, its hashCode changes and the entry becomes silently unreachable — always use immutable keys.`,
      },
      {
        q: 'Comparable vs Comparator; fail-fast vs fail-safe iterators.',
        a: `\`\`\`java
// Comparable — natural ordering baked into the class
class Employee implements Comparable<Employee> {
    @Override
    public int compareTo(Employee other) {
        return Double.compare(this.salary, other.salary);
    }
}

// Comparator — external, flexible, multiple orderings
Comparator<Employee> bySalaryDesc = Comparator
    .comparingDouble(Employee::salary).reversed();

Comparator<Employee> byDeptThenSalary = Comparator
    .comparing(Employee::department)
    .thenComparingDouble(Employee::salary);
\`\`\`

Use \`Comparable\` for the single natural order. Use \`Comparator\` for alternate orderings or when you can't modify the class.

**Fail-fast** (most java.util collections): throw \`ConcurrentModificationException\` if the collection is structurally modified during iteration. They track a \`modCount\`.

**Fail-safe** (\`ConcurrentHashMap\`, \`CopyOnWriteArrayList\`): iterate over a snapshot — no exception, but may not reflect the latest state.

\`\`\`java
// Safe: use Iterator.remove()
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() == 2) it.remove();
}
\`\`\``,
      },
      {
        q: 'How does ConcurrentHashMap provide thread safety?',
        a: `Java 8+ uses **lock striping at bucket level** (synchronized on individual bins, not the whole map) plus **CAS operations** for inserts into empty bins. Reads are entirely lock-free because internal nodes are \`volatile\`.

Multiple threads can read and write different buckets simultaneously — far better throughput than \`Hashtable\`'s global lock.

\`compute()\`, \`merge()\`, and \`computeIfAbsent()\` are atomic at the key level.`,
      },
      {
        q: 'Collection vs Collections; List vs Set vs Map.',
        a: `- \`Collection\` — the root interface (\`List\`, \`Set\`, \`Queue\` extend it)
- \`Collections\` — utility class with static helpers: \`sort\`, \`shuffle\`, \`unmodifiableList\`, \`synchronizedList\`, etc.

| | List | Set | Map |
|---|---|---|---|
| Duplicates | Allowed | Not allowed | Keys unique, values can repeat |
| Order | Insertion (ArrayList) | Depends on impl | Depends on impl |
| Access | By index | No index | By key |`,
      },
      {
        q: 'Generics, wildcards, extends vs super, type erasure.',
        a: `\`\`\`java
// Bounded wildcards
void printAll(List<? extends Number> list) { }   // read-only
void addNumbers(List<? super Integer> list) { }  // write-only

// PECS: Producer Extends, Consumer Super
// — if you read from it, use ? extends
// — if you write to it, use ? super
\`\`\`

**Type erasure:** generic type parameters are removed at compile time. At runtime, \`List<String>\` and \`List<Integer>\` are both just \`List\`. This means you cannot do \`new T[]\`, \`instanceof List<String>\`, or catch generic exceptions.

\`\`\`java
// Workaround: pass Class<T> at runtime
<T> T create(Class<T> clazz) throws Exception {
    return clazz.getDeclaredConstructor().newInstance();
}
\`\`\``,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CORE JAVA — LANGUAGE FEATURES (JAVA 8–21)
  // ─────────────────────────────────────────────
  {
    id: 'java-versions',
    label: 'Core Java — Java 8 to 21',
    questions: [
      {
        q: 'Java 8: lambdas, functional interfaces, default/static methods, Optional, Streams, Date-Time API.',
        a: `\`\`\`java
// Lambda + functional interface
Function<String, Integer> len = String::length;

// Optional
Optional<String> name = Optional.ofNullable(findName());
String result = name.filter(s -> !s.isEmpty()).orElse("unknown");

// Date-Time
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plusDays(7);
long days = ChronoUnit.DAYS.between(today, nextWeek); // 7
\`\`\`

Key additions: lambdas, \`@FunctionalInterface\`, default/static interface methods, \`Optional\`, Streams, \`LocalDate\`/\`LocalDateTime\`/\`ZonedDateTime\`.`,
      },
      {
        q: 'Java 9: modules, JShell, factory methods, private interface methods.',
        a: `\`\`\`java
// Collection factory methods — immutable, null-hostile
List<String> names = List.of("Alice", "Bob");
Map<String, Integer> scores = Map.of("Alice", 95, "Bob", 87);
\`\`\`

- **JPMS (modules):** \`module-info.java\` declares dependencies and exports; enforces strong encapsulation
- **JShell:** interactive REPL for trying Java expressions
- **Private interface methods:** allows shared helper code inside an interface`,
      },
      {
        q: 'Java 10: local variable type inference (var); limitations of var.',
        a: `\`\`\`java
var list = new ArrayList<String>();   // inferred as ArrayList<String>
var map  = new HashMap<String, Integer>();
\`\`\`

**Limitations:**
- Only for local variables (not fields, parameters, return types)
- Cannot use with \`null\`, lambdas, or array initialisers without explicit type
- \`var x = null;\` → compile error
- \`var fn = () -> {};\` → compile error`,
      },
      {
        q: 'Java 11: HttpClient, String utility methods, single-file source execution.',
        a: `\`\`\`java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .build();
HttpResponse<String> response = client.send(request, BodyHandlers.ofString());

" hello ".strip();      // "hello" (Unicode-aware, unlike trim())
"ha".repeat(3);         // "hahaha"
"line1\\nline2".lines(); // Stream<String>
\`\`\`

Also: \`isBlank()\`, single-file source execution (\`java Hello.java\` without prior \`javac\`).`,
      },
      {
        q: 'Java 14: switch expressions and yield; Java 15: text blocks.',
        a: `\`\`\`java
// Switch expression
String label = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "Weekday";
    case SATURDAY, SUNDAY -> "Weekend";
};

// yield for multi-line arms
int score = switch (grade) {
    case "A" -> 100;
    case "B" -> { log("B grade"); yield 80; }
    default  -> 0;
};

// Text blocks (Java 15)
String json = """
        {
            "name": "Alice",
            "salary": 95000
        }
        """;
\`\`\``,
      },
      {
        q: 'Java 16: records and pattern matching for instanceof.',
        a: `\`\`\`java
// Record — immutable data carrier
// Auto-generates: constructor, getters, equals, hashCode, toString
record Point(int x, int y) {}

Point p = new Point(3, 4);
p.x(); // 3

// Pattern matching for instanceof — no explicit cast needed
Object obj = "Hello World";
if (obj instanceof String s && s.length() > 5) {
    System.out.println(s.toUpperCase());  // s is already String here
}
\`\`\``,
      },
      {
        q: 'Java 17: sealed classes, records, pattern matching for instanceof; LTS changes.',
        a: `\`\`\`java
// Sealed class restricts which classes can extend it
public sealed class Shape permits Circle, Rectangle, Triangle {}

public final class Circle    extends Shape { double radius; }
public final class Rectangle extends Shape { double width, height; }
public non-sealed class Triangle extends Shape {}

// Exhaustive switch — compiler checks all permitted subtypes
double area = switch (shape) {
    case Circle c    -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.width() * r.height();
    case Triangle t  -> computeTriangleArea(t);
};
\`\`\`

Sealed classes + pattern matching together form the foundation for algebraic data types in Java. Java 17 is an LTS release.`,
      },
      {
        q: 'Java 21: virtual threads, record patterns, pattern matching for switch, sequenced collections.',
        a: `\`\`\`java
// Virtual threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> handleRequest());
}

// Record patterns
record Point(int x, int y) {}
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

// Sequenced collections
SequencedCollection<String> sc = new LinkedHashSet<>(List.of("a","b","c"));
sc.getFirst(); // "a"
sc.getLast();  // "c"
\`\`\`

In Spring Boot 3.2+: \`spring.threads.virtual.enabled=true\` enables virtual threads for all request handling.`,
      },
      {
        q: 'Which Java 17/21 features have you used in production? What problem did they solve?',
        a: `**Sealed classes (Java 17):** used for modelling domain events or command types. The compiler guarantees exhaustive handling in switch expressions, removing the risk of unhandled cases at runtime.

**Records:** eliminate boilerplate for DTOs and value objects — no more writing constructors, getters, equals, hashCode manually.

**Virtual threads (Java 21):** enable high-concurrency Spring Boot services without tuning thread pool sizes or switching to reactive programming. Each blocking request (JDBC, HTTP) suspends the virtual thread instead of blocking an OS thread — the same application can handle 10× more concurrent requests with the same hardware.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // OOP, LANGUAGE FUNDAMENTALS & JVM
  // ─────────────────────────────────────────────
  {
    id: 'oop-jvm',
    label: 'OOP, Language Fundamentals & JVM',
    questions: [
      {
        q: 'Explain abstraction, encapsulation, inheritance and polymorphism with backend examples.',
        a: `**Abstraction** — hide complexity, expose a contract.
\`\`\`java
// JpaRepository hides SQL; you see only save(), findById(), etc.
public interface PaymentService {
    PaymentResult process(PaymentRequest request);
}
\`\`\`

**Encapsulation** — bundle state and behaviour; control access.
\`\`\`java
public class BankAccount {
    private double balance;
    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Must be positive");
        this.balance += amount;
    }
    public double getBalance() { return balance; }
}
\`\`\`

**Inheritance** — reuse and specialise behaviour.
\`\`\`java
class BaseController {
    protected void validateRequest(HttpRequest req) { ... }
}
class OrderController extends BaseController {
    ResponseEntity<?> create(HttpRequest req) {
        validateRequest(req);  // inherited
        ...
    }
}
\`\`\`

**Polymorphism** — same interface, different implementations.
\`\`\`java
NotificationService service = new EmailNotificationService();
service.send(message);   // calls Email impl

service = new SmsNotificationService();
service.send(message);   // calls SMS impl at runtime
\`\`\``,
      },
      {
        q: 'Overloading vs overriding; compile-time vs runtime polymorphism.',
        a: `| | Overloading | Overriding |
|---|---|---|
| Resolved at | Compile time | Runtime |
| Polymorphism | Static | Dynamic |
| Signature | Same name, different params | Same name, same params |
| Return type | Can differ | Must be same or covariant |

\`\`\`java
// Overloading
class Printer {
    void print(String s) {}
    void print(int n)    {}   // different param type
}

// Overriding
class Animal  { String sound() { return "..."; } }
class Dog extends Animal {
    @Override String sound() { return "Woof"; }
}
\`\`\``,
      },
      {
        q: 'Interface vs abstract class; composition vs inheritance.',
        a: `**Interface:** pure contract, multiple implementation, all methods implicitly \`public\`, fields are \`public static final\`. Use when defining a capability.

**Abstract class:** partial implementation, single inheritance, can have state and constructors. Use when subclasses share significant common logic.

\`\`\`java
interface Auditable {
    LocalDateTime createdAt();
    LocalDateTime updatedAt();
}
abstract class BaseEntity implements Auditable {
    private LocalDateTime createdAt = LocalDateTime.now();
}
\`\`\`

**Composition over inheritance:** prefer holding a reference to a collaborator rather than extending it. Easier to test, avoids tight coupling.
\`\`\`java
// Inheritance: Order IS-A BaseEntity (fine)
// Composition: OrderService HAS-A PaymentService (preferred)
class OrderService {
    private final PaymentService paymentService;
}
\`\`\``,
      },
      {
        q: 'Immutable class design; String immutability and String pool.',
        a: `\`\`\`java
public final class Money {              // 1. final class
    private final long amount;          // 2. final fields
    private final Currency currency;

    public Money(long amount, Currency currency) {
        this.amount = amount;
        this.currency = currency;       // 3. no setters
    }

    public long getAmount()       { return amount; }
    public Currency getCurrency() { return currency; }

    // 4. return new instance for derived values
    public Money add(Money other) {
        return new Money(this.amount + other.amount, this.currency);
    }
}
\`\`\`

**String immutability:** String literals are pooled in the String Pool (part of heap since Java 7). \`new String("hello")\` bypasses the pool. \`intern()\` forces pool lookup. Immutability makes strings safe as HashMap keys and in multi-threaded code.`,
      },
      {
        q: '== vs equals(); final vs finally vs finalize(); static keyword.',
        a: `\`\`\`java
String a = "hello", b = "hello", c = new String("hello");
a == b;       // true  — same pool reference
a == c;       // false — different object
a.equals(c);  // true  — same content
\`\`\`

| | Meaning |
|---|---|
| \`final\` | Variable: not reassignable; method: not overridable; class: not extendable |
| \`finally\` | Block that always runs after try/catch, even on exception or return |
| \`finalize()\` | Called by GC before collection — deprecated Java 9, removed Java 18. Use \`Cleaner\` |

**static** belongs to the class, not the instance. Static methods can't access instance fields directly. Static initializer blocks run once when the class is loaded.`,
      },
      {
        q: 'Checked vs unchecked exceptions; custom exception design; try-with-resources.',
        a: `\`\`\`java
// Checked — must be caught or declared
class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String msg) { super(msg); }
}

// Unchecked — runtime errors, don't need to be declared
class InvalidOrderStateException extends RuntimeException {
    public InvalidOrderStateException(String msg) { super(msg); }
}

// Try-with-resources — AutoCloseable is closed automatically
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.execute();
}   // conn and ps closed here, even if exception occurs
\`\`\`

In Spring Boot, prefer unchecked exceptions for domain errors and let \`@ControllerAdvice\` / \`@ExceptionHandler\` translate them to HTTP responses.`,
      },
      {
        q: 'Shallow copy vs deep copy; cloning; serialization basics.',
        a: `**Shallow copy** copies the object but shares references to nested objects. **Deep copy** recursively copies all nested objects.

\`\`\`java
// Deep copy — create new instances for all mutable fields
Employee deepCopy = new Employee(e1.name(), new ArrayList<>(e1.skills()));
\`\`\`

**Serialization:** \`implements Serializable\` allows writing an object to a byte stream. \`transient\` fields are skipped. Always declare \`serialVersionUID\` explicitly to avoid \`InvalidClassException\` after class changes.`,
      },
      {
        q: 'JVM memory areas; heap vs stack; metaspace; class loading process.',
        a: `| Area | Stored | Per thread? |
|---|---|---|
| Heap | Objects, instance variables | No (shared) |
| Stack | Stack frames, local variables | Yes |
| Metaspace | Class metadata, method bytecode | No (shared) |
| PC Register | Current instruction address | Yes |

**Heap generations (G1 and earlier):**
- Young Generation (Eden + 2 Survivor spaces) — short-lived objects
- Old Generation (Tenured) — long-lived objects
- Minor GC collects Young; Major/Full GC collects Old

**Class loading:** Bootstrap → Extension → Application ClassLoader. Each loader delegates to its parent first (parent-first delegation). Classes are loaded lazily on first reference.`,
      },
      {
        q: 'JIT compiler; garbage collection; G1 vs ZGC basics.',
        a: `**JIT:** JVM interprets bytecode initially, identifies hot spots, then compiles them to native machine code. C1 compiles quickly with light optimisation; C2 compiles more aggressively for peak throughput.

| | G1 (default Java 9+) | ZGC (production Java 15+) |
|---|---|---|
| Goal | Balance throughput and latency | Ultra-low pause times (< 1 ms) |
| Pause type | Stop-the-world for minor GC | Mostly concurrent, tiny STW |
| Heap size | Up to ~50 GB | Terabyte-scale heaps |
| Use when | General-purpose | Latency-sensitive services |`,
      },
      {
        q: 'How do you investigate memory leak, high CPU, high GC or OutOfMemoryError?',
        a: `**OutOfMemoryError / Memory Leak:**
1. Enable heap dump: \`-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/\`
2. Analyse with VisualVM, Eclipse MAT, or IntelliJ profiler
3. Look for objects with high retained size (common culprits: static caches, ThreadLocal, event listeners not removed)

**High GC:**
- Enable GC logging: \`-Xlog:gc*:file=/tmp/gc.log\`
- Look for frequent full GCs or long pause times
- Common causes: insufficient heap, too many objects surviving to old gen

**High CPU:**
1. \`jstack <pid>\` — thread dump
2. Find threads in \`RUNNABLE\` state doing CPU work
3. Look for tight loops, String concatenation in loops, regex recompilation`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MULTITHREADING & CONCURRENCY
  // ─────────────────────────────────────────────
  {
    id: 'concurrency',
    label: 'Multithreading & Concurrency',
    questions: [
      {
        q: 'Process vs thread; thread lifecycle; Runnable vs Callable.',
        a: `A **process** has its own memory space. **Threads** share the process memory and are lighter to create.

Thread lifecycle: \`NEW\` → \`RUNNABLE\` → \`BLOCKED/WAITING/TIMED_WAITING\` → \`TERMINATED\`

\`\`\`java
// Runnable — no return value, no checked exception
Runnable r = () -> System.out.println("running");

// Callable — returns a value and can throw checked exceptions
Callable<Integer> c = () -> { Thread.sleep(100); return 42; };

Future<Integer> future = executor.submit(c);
int result = future.get();   // blocks until done
\`\`\``,
      },
      {
        q: 'synchronized vs volatile; intrinsic lock vs ReentrantLock.',
        a: `**volatile** — guarantees visibility (all threads see the latest write) but not atomicity. Use for simple flags.

**synchronized** — guarantees both visibility and atomicity for the guarded block.

\`\`\`java
volatile boolean running = true;   // safe for a stop flag, not for counter++

synchronized void increment() { counter++; }  // safe for counter
\`\`\`

**ReentrantLock** extras over intrinsic locks:
\`\`\`java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try { /* critical section */ } finally { lock.unlock(); }

lock.tryLock(500, TimeUnit.MILLISECONDS);  // timeout
lock.lockInterruptibly();                  // interruptible
// ReadWriteLock — multiple readers can hold simultaneously
ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();
\`\`\``,
      },
      {
        q: 'AtomicInteger and CAS; race condition; deadlock and livelock.',
        a: `**CAS (Compare-And-Swap):** hardware-level atomic operation — update a value only if it currently equals the expected value. \`AtomicInteger\` uses CAS in a loop, avoiding synchronized overhead.

\`\`\`java
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();          // atomic, no lock
counter.compareAndSet(5, 10);       // sets to 10 only if current is 5
\`\`\`

**Race condition:** two threads read-modify-write shared state without synchronisation, producing non-deterministic results.

**Deadlock:** thread A holds lock 1 and waits for lock 2; thread B holds lock 2 and waits for lock 1. Prevention: always acquire locks in the same order, or use \`tryLock\` with timeout.

**Livelock:** threads keep responding to each other but make no progress (like two people in a hallway stepping aside simultaneously forever).`,
      },
      {
        q: 'wait(), notify(), notifyAll(); sleep() vs wait().',
        a: `| | sleep() | wait() |
|---|---|---|
| Defined in | Thread | Object |
| Releases lock | No | Yes |
| Woken by | Timeout or interrupt | notify()/notifyAll() or interrupt |
| Requires synchronized? | No | Yes |

\`\`\`java
// Consumer
synchronized (queue) {
    while (queue.isEmpty()) {
        queue.wait();       // releases lock, waits
    }
    process(queue.poll());
}

// Producer
synchronized (queue) {
    queue.add(item);
    queue.notifyAll();   // wake waiting consumers
}
\`\`\``,
      },
      {
        q: 'ExecutorService; thread pool sizing; rejection policies; graceful shutdown.',
        a: `\`\`\`java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4,                               // corePoolSize
    8,                               // maxPoolSize
    60, TimeUnit.SECONDS,            // keepAliveTime
    new LinkedBlockingQueue<>(100),  // workQueue
    new ThreadPoolExecutor.CallerRunsPolicy()
);
// Rejection policies: AbortPolicy (throws), CallerRunsPolicy (caller runs),
//                     DiscardPolicy (drops silently), DiscardOldestPolicy

// Graceful shutdown
executor.shutdown();
executor.awaitTermination(30, TimeUnit.SECONDS);
\`\`\`

**Sizing rules of thumb:**
- CPU-bound: \`# cores + 1\`
- I/O-bound: \`# cores × (1 + wait_time / compute_time)\` — often 10–50× cores
- With virtual threads: one virtual thread per task, no sizing needed`,
      },
      {
        q: 'Future vs CompletableFuture; thenApply vs thenCompose; allOf vs anyOf.',
        a: `\`\`\`java
// Future — blocking, no composition
Future<String> f = executor.submit(() -> fetchData());
String result = f.get();   // blocks

// CompletableFuture — non-blocking, composable
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> fetchData());

// thenApply — transform result (like map)
CompletableFuture<Integer> length = cf.thenApply(String::length);

// thenCompose — chain another async operation (like flatMap; avoids nesting)
CompletableFuture<Order> order = cf
    .thenCompose(userId -> fetchOrderAsync(userId));

// allOf — wait for ALL
CompletableFuture.allOf(cf1, cf2, cf3).thenRun(() -> System.out.println("done"));

// anyOf — complete when ANY one completes
CompletableFuture.anyOf(cf1, cf2, cf3);

// Error handling
cf.exceptionally(ex -> "default value").thenAccept(System.out::println);
\`\`\``,
      },
      {
        q: 'ConcurrentHashMap internals; BlockingQueue; producer-consumer problem.',
        a: `\`ConcurrentHashMap\` uses lock striping at bucket level plus CAS for empty buckets. Reads are fully lock-free. \`compute()\` and \`merge()\` are atomic per key.

\`\`\`java
// Producer-Consumer with BlockingQueue
BlockingQueue<Task> queue = new LinkedBlockingQueue<>(100);

// Producer
executor.submit(() -> {
    while (true) queue.put(generateTask());   // blocks if full
});

// Consumer
executor.submit(() -> {
    while (true) process(queue.take());        // blocks if empty
});
\`\`\``,
      },
      {
        q: 'CountDownLatch vs CyclicBarrier vs Semaphore.',
        a: `\`\`\`java
// CountDownLatch — wait for N events (one-shot, cannot reset)
CountDownLatch latch = new CountDownLatch(3);
// 3 workers each call latch.countDown() when done
latch.await();   // main thread waits until count = 0

// CyclicBarrier — N threads wait for each other at a sync point (reusable)
CyclicBarrier barrier = new CyclicBarrier(3, () -> System.out.println("phase done"));
// each thread calls barrier.await(); all proceed when all 3 have called it

// Semaphore — limit concurrent access (like a connection pool)
Semaphore semaphore = new Semaphore(5);   // max 5 concurrent
semaphore.acquire();
try { accessSharedResource(); } finally { semaphore.release(); }
\`\`\``,
      },
      {
        q: 'ThreadLocal use cases and memory-leak risks.',
        a: `\`ThreadLocal\` stores a value per thread. Common uses: request-scoped context (tenant ID, user ID, transaction), non-thread-safe utilities (SimpleDateFormat).

\`\`\`java
public class TenantContext {
    private static final ThreadLocal<String> tenantId = new ThreadLocal<>();
    public static void set(String id) { tenantId.set(id); }
    public static String get()        { return tenantId.get(); }
    public static void clear()        { tenantId.remove(); }   // critical!
}
\`\`\`

**Memory-leak risk:** thread pool threads are reused — if \`ThreadLocal.remove()\` is never called, the value lives on the thread indefinitely. Always clean up in a servlet filter or \`@AfterEach\` test method.`,
      },
      {
        q: 'Virtual threads vs platform threads; when not to use virtual threads.',
        a: `**Platform threads** map 1:1 to OS threads. Each consumes ~1–2 MB stack. Blocking one blocks the OS thread.

**Virtual threads** are managed by the JVM, multiplexed onto a small pool of carrier threads. Each costs ~a few KB. Blocking suspends the virtual thread and frees the carrier for another task.

\`\`\`java
// Before
ExecutorService pool = Executors.newFixedThreadPool(200);

// After — unlimited concurrency for I/O-bound tasks
ExecutorService vPool = Executors.newVirtualThreadPerTaskExecutor();
\`\`\`

**When NOT to use virtual threads:**
- CPU-bound work — no benefit; they still need carrier threads
- Code with \`synchronized\` on blocking I/O — pins the carrier; use \`ReentrantLock\` instead
- Native code / JNI — native calls pin the carrier thread

Spring Boot 3.2+: \`spring.threads.virtual.enabled=true\``,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SPRING CORE & BOOT INTERNALS
  // ─────────────────────────────────────────────
  {
    id: 'spring-core',
    label: 'Spring — Core & Boot Internals',
    questions: [
      {
        q: 'What problem does Spring solve? Explain IoC and Dependency Injection.',
        a: `**Spring** solves the problem of tight coupling between components. Without a framework, objects create their own dependencies — making code hard to test, reuse, or swap.

**IoC (Inversion of Control):** instead of objects controlling their own dependencies, control is inverted — the framework creates and wires them. Your code says *what* it needs, not *how* to get it.

**Dependency Injection:** the concrete mechanism of IoC. The framework injects dependencies into a class from the outside.

\`\`\`java
// Without DI — tightly coupled, hard to test
class OrderService {
    private PaymentService payment = new StripePaymentService(); // hardcoded
}

// With DI — loosely coupled, easy to test/swap
@Service
class OrderService {
    private final PaymentService payment;

    public OrderService(PaymentService payment) {  // injected by Spring
        this.payment = payment;
    }
}
\`\`\`

The Spring IoC container (ApplicationContext) manages object creation, wiring, and lifecycle.`,
      },
      {
        q: 'BeanFactory vs ApplicationContext; bean lifecycle and lifecycle callbacks.',
        a: `**BeanFactory** — basic container; lazy initializes beans on first request. Lightweight, rarely used directly.

**ApplicationContext** — extends BeanFactory; eagerly initializes singleton beans at startup, supports events, i18n, AOP, \`@Transactional\`, etc. Use this in all real applications.

**Bean lifecycle:**
1. Instantiation
2. Property injection
3. \`BeanNameAware\`, \`BeanFactoryAware\`, \`ApplicationContextAware\` callbacks
4. \`BeanPostProcessor.postProcessBeforeInitialization()\`
5. \`@PostConstruct\` / \`InitializingBean.afterPropertiesSet()\` / init-method
6. \`BeanPostProcessor.postProcessAfterInitialization()\`
7. Bean is ready for use
8. On shutdown: \`@PreDestroy\` / \`DisposableBean.destroy()\` / destroy-method

\`\`\`java
@Component
class CacheService {
    @PostConstruct
    void init() { /* warm up cache */ }

    @PreDestroy
    void shutdown() { /* flush cache */ }
}
\`\`\``,
      },
      {
        q: '@Component vs @Service vs @Repository vs @Controller.',
        a: `All four are stereotypes — specialisations of \`@Component\`. All cause Spring to detect and register the class as a bean during component scanning.

| Annotation | Purpose | Extra behaviour |
|---|---|---|
| \`@Component\` | Generic Spring-managed bean | None |
| \`@Service\` | Business logic layer | None (semantic marker) |
| \`@Repository\` | Data access layer | Translates persistence exceptions to Spring's \`DataAccessException\` hierarchy |
| \`@Controller\` | Spring MVC web layer | Marks class for request mapping; works with \`DispatcherServlet\` |

\`@RestController\` = \`@Controller\` + \`@ResponseBody\` on every method.`,
      },
      {
        q: '@Bean vs @Component; @Configuration and proxyBeanMethods.',
        a: `**\`@Component\`** — class-level; Spring detects it via classpath scanning.

**\`@Bean\`** — method-level inside a \`@Configuration\` class; you control construction manually. Use when: you don't own the class (third-party library), or need conditional/complex wiring.

\`\`\`java
@Configuration
class AppConfig {
    @Bean
    DataSource dataSource() {
        return new HikariDataSource(hikariConfig());
    }

    @Bean
    HikariConfig hikariConfig() { ... }
}
\`\`\`

**\`proxyBeanMethods = true\` (default):** Spring creates a CGLIB proxy of \`@Configuration\` classes so that calling \`@Bean\` methods directly always returns the same singleton instance. Set to \`false\` for lightweight config classes where inter-bean calls are not needed (faster startup, no proxy overhead).`,
      },
      {
        q: 'Constructor vs setter vs field injection; why is constructor injection preferred?',
        a: `\`\`\`java
// Constructor injection (preferred)
@Service
class OrderService {
    private final PaymentService payment;
    public OrderService(PaymentService payment) {
        this.payment = payment;
    }
}

// Setter injection
@Service
class OrderService {
    private PaymentService payment;
    @Autowired
    public void setPayment(PaymentService payment) { this.payment = payment; }
}

// Field injection (avoid)
@Service
class OrderService {
    @Autowired private PaymentService payment;
}
\`\`\`

**Why constructor injection is preferred:**
- Dependencies are \`final\` → immutable, thread-safe
- Class is **testable without Spring** — just call the constructor
- Makes circular dependencies fail fast at startup (not at runtime)
- Clear contract — all required dependencies are visible at construction time
- Field injection hides dependencies and requires reflection to test`,
      },
      {
        q: 'Singleton, prototype, request and session bean scopes.',
        a: `| Scope | One instance per | Available in |
|---|---|---|
| \`singleton\` (default) | ApplicationContext | Anywhere |
| \`prototype\` | Each injection point / \`getBean()\` call | Anywhere |
| \`request\` | HTTP request | Web context |
| \`session\` | HTTP session | Web context |
| \`application\` | ServletContext | Web context |

\`\`\`java
@Bean
@Scope("prototype")
ReportGenerator reportGenerator() { return new ReportGenerator(); }
\`\`\`

**Prototype in a singleton:** injecting a prototype into a singleton only creates it once — the singleton caches the reference. Use \`ObjectProvider<T>\` or method injection to get a new instance each time.`,
      },
      {
        q: '@Primary vs @Qualifier; @Lazy; circular dependency resolution.',
        a: `\`\`\`java
// Two implementations of PaymentService
@Component @Primary
class StripePaymentService implements PaymentService {}

@Component
class PayPalPaymentService implements PaymentService {}

// @Primary — injected when no qualifier is specified
@Autowired PaymentService payment;  // gets Stripe

// @Qualifier — explicit selection
@Autowired @Qualifier("payPalPaymentService") PaymentService payment;
\`\`\`

**\`@Lazy\`** — delays bean initialization until first use. Useful for heavyweight beans rarely needed, or for breaking circular dependencies.

**Circular dependency resolution:** Spring can resolve circular dependencies with setter/field injection (using proxies), but constructor injection causes a \`BeanCurrentlyInCreationException\`. Solutions:
- Redesign to remove the cycle (best)
- Use \`@Lazy\` on one constructor parameter
- Extract shared logic into a third bean`,
      },
      {
        q: 'How does Spring Boot auto-configuration work? @Conditional annotations.',
        a: `Spring Boot scans \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\` (or \`spring.factories\` pre-Boot 2.7) for auto-configuration classes.

Each class is annotated with conditions that gate its activation:

\`\`\`java
@AutoConfiguration
@ConditionalOnClass(DataSource.class)          // only if DataSource is on classpath
@ConditionalOnMissingBean(DataSource.class)    // only if user hasn't defined their own
@EnableConfigurationProperties(DataSourceProperties.class)
class DataSourceAutoConfiguration {
    @Bean
    DataSource dataSource(DataSourceProperties props) { ... }
}
\`\`\`

**Common \`@Conditional\` variants:**
| Annotation | Activates when |
|---|---|
| \`@ConditionalOnClass\` | Class is present on classpath |
| \`@ConditionalOnMissingBean\` | No bean of that type exists |
| \`@ConditionalOnProperty\` | Property matches a value |
| \`@ConditionalOnWebApplication\` | Running in a web context |

This is why adding \`spring-boot-starter-data-jpa\` to \`pom.xml\` auto-configures EntityManagerFactory, DataSource, and transaction manager — without any XML.`,
      },
      {
        q: 'Spring Boot starters; embedded server; application startup lifecycle.',
        a: `**Starters** are curated dependency bundles — \`spring-boot-starter-web\` brings Tomcat, Spring MVC, Jackson, validation, and their transitive dependencies in compatible versions.

**Embedded server:** Boot ships with Tomcat (default), Jetty, or Undertow as a jar dependency. The main class creates an \`EmbeddedServletContainer\`, registers \`DispatcherServlet\`, and listens on the configured port — no WAR deployment needed.

**Startup lifecycle:**
1. \`SpringApplication.run()\` creates the \`ApplicationContext\`
2. Auto-configuration classes are loaded and filtered by conditions
3. Beans are instantiated and wired
4. \`ApplicationRunner\` / \`CommandLineRunner\` beans execute
5. \`ApplicationReadyEvent\` is published
6. Embedded server starts accepting requests

\`\`\`java
@Component
class StartupTask implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        // runs after context is fully initialized
    }
}
\`\`\``,
      },
      {
        q: 'How do profiles and externalized configuration work?',
        a: `**Profiles** let you define beans or config values that activate only in specific environments.

\`\`\`java
@Component
@Profile("prod")
class ProdEmailService implements EmailService {}

@Component
@Profile("dev")
class StubEmailService implements EmailService {}
\`\`\`

Activate with: \`spring.profiles.active=prod\` or \`-Dspring.profiles.active=prod\`.

**Externalized configuration priority (highest to lowest):**
1. Command-line arguments (\`--server.port=9090\`)
2. Environment variables (\`SERVER_PORT=9090\`)
3. \`application-{profile}.yml\`
4. \`application.yml\` / \`application.properties\`
5. \`@PropertySource\` files
6. Default values in \`@Value\`

\`\`\`yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://prod-db:5432/myapp
\`\`\`

\`\`\`java
@Value("\${app.feature.enabled:false}")
private boolean featureEnabled;

// Or type-safe with @ConfigurationProperties
@ConfigurationProperties(prefix = "app")
record AppProperties(boolean featureEnabled, int maxRetries) {}
\`\`\``,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SPRING MVC, REST & VALIDATION
  // ─────────────────────────────────────────────
  {
    id: 'spring-mvc',
    label: 'Spring — MVC, REST & Validation',
    questions: [
      {
        q: 'Explain request flow from DispatcherServlet to controller and response.',
        a: `1. HTTP request arrives at the **embedded Tomcat** servlet container
2. **\`DispatcherServlet\`** receives the request (registered as the front controller)
3. **\`HandlerMapping\`** finds the matching controller method (e.g., \`RequestMappingHandlerMapping\`)
4. **\`HandlerAdapter\`** invokes the controller method (resolves parameters, handles binding)
5. **Controller method** executes, returns a value or \`ResponseEntity\`
6. **\`HttpMessageConverter\`** (e.g., \`MappingJackson2HttpMessageConverter\`) serializes the response body to JSON
7. **\`HandlerExceptionResolver\`** / \`@ControllerAdvice\` handles any exceptions
8. Response is written back to the client`,
      },
      {
        q: 'Filter vs HandlerInterceptor vs AOP; execution order and use cases.',
        a: `| | Filter (Servlet) | HandlerInterceptor | AOP Advice |
|---|---|---|---|
| Level | Servlet container | Spring MVC | Spring bean proxy |
| Runs for | All requests incl. static files | Only mapped handlers | Any Spring bean method |
| Access to | Raw request/response | Handler object, ModelAndView | Method args, return value |
| Use for | Auth, CORS, compression, logging | Pre/post handler logic, model | Cross-cutting: logging, timing, TX |

**Execution order:**
\`Filter (before)\` → \`DispatcherServlet\` → \`Interceptor.preHandle()\` → \`Controller\` → \`Interceptor.postHandle()\` → \`Interceptor.afterCompletion()\` → \`Filter (after)\`

AOP advice wraps the method call inside the proxy — it runs around the controller or service method call itself.`,
      },
      {
        q: '@Controller vs @RestController; @RequestParam vs @PathVariable vs @RequestBody.',
        a: `**\`@RestController\`** = \`@Controller\` + \`@ResponseBody\` on every method. Return values are serialized directly to the response body (typically JSON) instead of being resolved as view names.

\`\`\`java
// @RequestParam — query string: /search?name=Alice&page=1
@GetMapping("/search")
List<Employee> search(@RequestParam String name,
                      @RequestParam(defaultValue = "0") int page) {}

// @PathVariable — URI segment: /employees/42
@GetMapping("/employees/{id}")
Employee get(@PathVariable Long id) {}

// @RequestBody — JSON body deserialized into object
@PostMapping("/employees")
Employee create(@RequestBody @Valid CreateEmployeeRequest request) {}
\`\`\``,
      },
      {
        q: 'POST vs PUT vs PATCH; idempotency; safe and idempotent HTTP methods.',
        a: `| Method | Idempotent | Safe | Use for |
|---|---|---|---|
| GET | ✓ | ✓ | Read resource |
| POST | ✗ | ✗ | Create resource (server assigns ID) |
| PUT | ✓ | ✗ | Full replacement of a resource |
| PATCH | ✗ (can be) | ✗ | Partial update |
| DELETE | ✓ | ✗ | Delete resource |

**Safe** = no side effects (read-only). **Idempotent** = calling N times has same effect as calling once.

**POST vs PUT:** Use POST when the server assigns the resource ID (\`POST /orders\`). Use PUT when the client knows the full resource URL (\`PUT /orders/42\`). PATCH sends only changed fields.`,
      },
      {
        q: 'How do you design pagination, sorting, filtering and API versioning?',
        a: `\`\`\`java
// Pagination + sorting via Spring Data's Pageable
@GetMapping("/employees")
Page<EmployeeDto> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "name,asc") String[] sort
) {
    Pageable pageable = PageRequest.of(page, size,
        Sort.by(Sort.Direction.fromString(sort[1]), sort[0]));
    return employeeRepository.findAll(pageable).map(mapper::toDto);
}

// Filtering via @RequestParam or JPA Specification
@GetMapping("/employees")
List<EmployeeDto> filter(
    @RequestParam Optional<String> department,
    @RequestParam Optional<Double> minSalary
) { ... }
\`\`\`

**API versioning strategies:**
- **URL path:** \`/api/v1/employees\` — most visible, easy to route
- **Request header:** \`Accept: application/vnd.app.v1+json\` — cleaner URLs
- **Query param:** \`/employees?version=1\` — simple but pollutes params

URL path versioning is most common for REST APIs.`,
      },
      {
        q: 'Global exception handling using @ControllerAdvice and @ExceptionHandler.',
        a: `\`\`\`java
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse("NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.toList());
        return new ErrorResponse("VALIDATION_FAILED", errors.toString());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    ErrorResponse handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return new ErrorResponse("INTERNAL_ERROR", "Something went wrong");
    }
}
\`\`\``,
      },
      {
        q: 'Bean Validation: @Valid vs @Validated; custom validators.',
        a: `\`\`\`java
record CreateEmployeeRequest(
    @NotBlank String name,
    @Email String email,
    @Positive double salary,
    @Min(18) @Max(65) int age
) {}

// @Valid — triggers standard Bean Validation (javax/jakarta)
@PostMapping("/employees")
Employee create(@RequestBody @Valid CreateEmployeeRequest req) {}

// @Validated — Spring's version; also supports validation groups
// and method-level validation on @Service beans
@Validated
@Service
class EmployeeService {
    void update(@Valid UpdateRequest req) {}
}
\`\`\`

**Custom validator:**
\`\`\`java
@Target(FIELD)
@Retention(RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "Email already exists";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {
    @Autowired private UserRepository repo;

    @Override
    public boolean isValid(String email, ConstraintValidatorContext ctx) {
        return !repo.existsByEmail(email);
    }
}
\`\`\``,
      },
      {
        q: 'How do you secure REST APIs? JWT, OAuth2, authentication and authorization.',
        a: `**Authentication** — who are you? **Authorization** — what are you allowed to do?

**JWT flow:**
1. Client sends credentials → server validates → returns signed JWT
2. Client sends JWT in \`Authorization: Bearer <token>\` header on every request
3. Server verifies signature and extracts claims (no DB lookup needed)

\`\`\`java
// Spring Security config (Spring Security 6+)
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
\`\`\`

**OAuth2:** delegate authentication to an external provider (Google, Keycloak). Your API acts as a Resource Server that validates Bearer tokens issued by the Authorization Server.`,
      },
      {
        q: 'CORS vs CSRF; Spring Security filter chain.',
        a: `**CORS (Cross-Origin Resource Sharing):** browser security mechanism — browsers block cross-origin requests unless the server explicitly allows them via \`Access-Control-Allow-Origin\` headers.

\`\`\`java
@Bean
CorsConfigurationSource corsConfiguration() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://my-app.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    // ...
}
\`\`\`

**CSRF (Cross-Site Request Forgery):** attacker tricks a logged-in user into making unintended requests using their session cookie. Mitigated by requiring a CSRF token on state-changing requests.

For **stateless REST APIs using JWT** (no cookies), CSRF protection is not needed — disable it. For session-based apps, keep CSRF enabled.

**Spring Security filter chain:** an ordered list of \`Filter\` implementations. Each filter handles one concern (session management, CORS, CSRF, authentication, authorization). Filters run in a fixed order; your custom filters (\`JwtAuthFilter\`) are inserted at the right position with \`addFilterBefore\`.`,
      },
      {
        q: 'How do you implement API rate limiting and request correlation IDs?',
        a: `**Rate limiting:** limit the number of requests a client can make in a time window.
- Use **Bucket4j** (token bucket algorithm) or **Redis + Lua** for distributed rate limiting
- Apply via a \`Filter\` or \`HandlerInterceptor\`

\`\`\`java
// Filter-based rate limiting with Bucket4j
@Component
class RateLimitFilter implements Filter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        String clientIp = ((HttpServletRequest) req).getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(clientIp, k ->
            Bucket.builder().addLimit(Bandwidth.simple(100, Duration.ofMinutes(1))).build());

        if (bucket.tryConsume(1)) {
            chain.doFilter(req, res);
        } else {
            ((HttpServletResponse) res).setStatus(429);
        }
    }
}
\`\`\`

**Correlation IDs:** unique ID per request for distributed tracing.
\`\`\`java
@Component
class CorrelationIdFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        String correlationId = Optional
            .ofNullable(((HttpServletRequest) req).getHeader("X-Correlation-Id"))
            .orElse(UUID.randomUUID().toString());

        MDC.put("correlationId", correlationId);
        ((HttpServletResponse) res).setHeader("X-Correlation-Id", correlationId);
        try { chain.doFilter(req, res); } finally { MDC.clear(); }
    }
}
\`\`\`

Add \`%X{correlationId}\` to your log pattern to include it in every log line.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SPRING — TRANSACTIONS, JPA & TESTING
  // ─────────────────────────────────────────────
  {
    id: 'spring-transactions-jpa',
    label: 'Spring — Transactions, JPA & Testing',
    questions: [
      {
        q: 'How does @Transactional work internally? Proxy-based behavior and self-invocation.',
        a: `Spring creates a **CGLIB proxy** around \`@Transactional\` beans. When you call a transactional method, the proxy intercepts the call, begins a transaction (or joins an existing one), delegates to the real method, then commits or rolls back.

\`\`\`java
@Service
class OrderService {
    @Transactional
    public void placeOrder(Order order) {
        orderRepo.save(order);
        paymentService.charge(order);  // runs in same transaction
    }
}
\`\`\`

**Self-invocation problem:** calling a \`@Transactional\` method from within the same class bypasses the proxy — the transaction is NOT started.

\`\`\`java
@Service
class OrderService {
    public void process() {
        placeOrder(order);  // calls this.placeOrder() — bypasses proxy, NO transaction!
    }

    @Transactional
    public void placeOrder(Order order) { ... }
}
\`\`\`

**Fixes:** extract the method to a separate bean, inject self (\`@Autowired OrderService self\`), or use \`AopContext.currentProxy()\`.`,
      },
      {
        q: 'Propagation: REQUIRED, REQUIRES_NEW, SUPPORTS, MANDATORY, NOT_SUPPORTED.',
        a: `| Propagation | Behaviour |
|---|---|
| \`REQUIRED\` (default) | Join existing TX if one exists; create new one if not |
| \`REQUIRES_NEW\` | Always create a new TX; suspend the existing one |
| \`SUPPORTS\` | Join TX if exists; run without TX if not |
| \`MANDATORY\` | Must join existing TX; throws if none exists |
| \`NOT_SUPPORTED\` | Always run without TX; suspend any existing TX |
| \`NEVER\` | Must run without TX; throws if one exists |
| \`NESTED\` | Run in a nested TX (savepoint) within the existing one |

\`\`\`java
// Audit log should always commit, even if the outer TX rolls back
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void logAuditEvent(AuditEvent event) {
    auditRepo.save(event);
}
\`\`\``,
      },
      {
        q: 'Isolation levels; dirty read, non-repeatable read and phantom read.',
        a: `| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| \`READ_UNCOMMITTED\` | Possible | Possible | Possible |
| \`READ_COMMITTED\` (default PG) | Prevented | Possible | Possible |
| \`REPEATABLE_READ\` (default MySQL) | Prevented | Prevented | Possible |
| \`SERIALIZABLE\` | Prevented | Prevented | Prevented |

**Dirty read:** reading uncommitted changes from another transaction.
**Non-repeatable read:** reading the same row twice gets different values (another TX committed between reads).
**Phantom read:** a range query returns different rows on the second read (another TX inserted/deleted rows).

\`\`\`java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public Report generateReport() { ... }
\`\`\``,
      },
      {
        q: 'Rollback rules; checked vs unchecked exception behavior.',
        a: `By default, Spring rolls back only on **unchecked exceptions** (RuntimeException and Error). **Checked exceptions do NOT trigger rollback** — they cause commit.

\`\`\`java
// Rollback for a specific checked exception
@Transactional(rollbackFor = InsufficientFundsException.class)
public void transfer(long from, long to, double amount) throws InsufficientFundsException {
    debit(from, amount);
    credit(to, amount);
}

// Never rollback for a specific exception
@Transactional(noRollbackFor = OptimisticLockingFailureException.class)
public void update(Entity e) { ... }
\`\`\`

**Why this default?** Checked exceptions indicate expected business conditions (not system errors), so it was assumed the developer handled them intentionally. Always use \`rollbackFor\` explicitly when dealing with checked exceptions in transactional methods.`,
      },
      {
        q: 'Optimistic vs pessimistic locking; @Version and lost updates.',
        a: `**Optimistic locking:** assumes conflicts are rare. No lock is held during the transaction. At commit time, Hibernate checks if the row was modified by another transaction (via a version column). If yes → throws \`OptimisticLockException\`.

\`\`\`java
@Entity
class Product {
    @Id Long id;
    int quantity;

    @Version
    int version;  // Hibernate checks this on UPDATE
}
\`\`\`

\`\`\`sql
UPDATE product SET quantity = ?, version = 2 WHERE id = ? AND version = 1
-- If 0 rows updated → OptimisticLockException
\`\`\`

**Pessimistic locking:** acquires a DB lock at read time. No other transaction can modify the row until the lock is released. Higher contention but prevents conflicts.

\`\`\`java
// Acquires SELECT ... FOR UPDATE
Product p = productRepo.findById(id, LockModeType.PESSIMISTIC_WRITE);
\`\`\`

**Lost update:** two transactions read the same value, both modify it, and the second write overwrites the first without knowing about it. Both locking strategies prevent this.`,
      },
      {
        q: 'Entity lifecycle; persistence context; dirty checking and flush vs commit.',
        a: `**Entity lifecycle states:**
- **Transient** — new object, not known to Hibernate
- **Managed** — associated with the current persistence context; changes are tracked
- **Detached** — was managed, session is closed or \`evict()\` called
- **Removed** — scheduled for deletion

**Persistence context (first-level cache):** within a session, Hibernate caches all loaded entities. The same row is always returned as the same Java object.

**Dirty checking:** at flush time, Hibernate compares the current state of managed entities with their snapshot at load time. If changed → generates UPDATE automatically. No need to call \`save()\` after modifying a managed entity.

**Flush vs commit:**
- **Flush** — synchronizes entity state changes to the DB (sends SQL) but does not end the transaction
- **Commit** — ends the transaction and makes all changes permanent

\`\`\`java
@Transactional
void update(Long id) {
    Employee e = repo.findById(id).orElseThrow();
    e.setSalary(100000);  // dirty checked — no explicit save() needed
}   // flush + commit happen automatically at method end
\`\`\``,
      },
      {
        q: 'Lazy vs eager loading; N+1 problem; fetch join and entity graphs.',
        a: `**Lazy loading** (\`FetchType.LAZY\`, default for collections): related entities are loaded only when accessed. Requires an open session.

**Eager loading** (\`FetchType.EAGER\`, default for \`@ManyToOne\`): related entities are always loaded with the parent.

**N+1 problem:** fetching a list of departments, then accessing \`department.getEmployees()\` in a loop fires 1 query for departments + N queries for employees.

**Solutions:**

\`\`\`java
// 1. JOIN FETCH in JPQL
@Query("SELECT d FROM Department d LEFT JOIN FETCH d.employees")
List<Department> findAllWithEmployees();

// 2. Entity Graph
@EntityGraph(attributePaths = {"employees"})
List<Department> findAll();

// 3. Batch size (reduces N+1 to N/50+1)
@BatchSize(size = 50)
@OneToMany(mappedBy = "department")
private List<Employee> employees;
\`\`\``,
      },
      {
        q: 'Cascade types vs orphanRemoval; owning side of relationships.',
        a: `**Cascade types** propagate operations from parent to child:
- \`PERSIST\` — saving parent also saves children
- \`MERGE\` — merging parent also merges children
- \`REMOVE\` — deleting parent also deletes children
- \`ALL\` — all of the above

**\`orphanRemoval = true\`:** removes child entities from the DB when they are removed from the parent's collection (even without explicit \`delete()\`).

\`\`\`java
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItem> items;
// order.getItems().remove(item) → Hibernate deletes the item row
\`\`\`

**Owning side:** the side that holds the foreign key column is the owning side. Hibernate only looks at the owning side to determine what SQL to generate. The \`mappedBy\` side is the inverse and is read-only for persistence purposes.

For \`@ManyToOne\` / \`@OneToMany\`: the \`@ManyToOne\` side is always the owner (it has the FK column).`,
      },
      {
        q: 'JPQL vs native SQL vs derived queries vs JPA Specification.',
        a: `\`\`\`java
// Derived query — Spring Data generates JPQL from method name
List<Employee> findByDepartmentAndSalaryGreaterThan(String dept, double salary);

// JPQL — object-oriented, database-agnostic
@Query("SELECT e FROM Employee e WHERE e.department = :dept ORDER BY e.salary DESC")
List<Employee> findByDept(@Param("dept") String dept);

// Native SQL — when you need DB-specific features
@Query(value = "SELECT * FROM employee WHERE salary > :min", nativeQuery = true)
List<Employee> findHighEarners(@Param("min") double min);

// JPA Specification — programmatic, composable criteria (best for dynamic filtering)
Specification<Employee> spec = Specification
    .where(deptEquals(dept))
    .and(salaryGreaterThan(minSalary))
    .and(ageAtMost(maxAge));
employeeRepo.findAll(spec);
\`\`\`

Use **derived queries** for simple cases, **JPQL** for joins/aggregations, **native SQL** for DB-specific features, **Specification** for dynamic multi-filter search pages.`,
      },
      {
        q: 'How do you test controllers, services and repositories? JUnit, Mockito, MockMvc, Testcontainers.',
        a: `\`\`\`java
// Service test — pure unit test with Mockito
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock PaymentService paymentService;
    @InjectMocks OrderService orderService;

    @Test
    void shouldPlaceOrder() {
        when(paymentService.charge(any())).thenReturn(PaymentResult.SUCCESS);
        orderService.placeOrder(new Order());
        verify(paymentService).charge(any());
    }
}

// Controller test — slice test, only MVC layer
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean OrderService orderService;

    @Test
    void shouldReturn201() throws Exception {
        mockMvc.perform(post("/orders")
                .contentType(APPLICATION_JSON)
                .content("{\\"productId\\":1}"))
            .andExpect(status().isCreated());
    }
}

// Repository test — real DB via Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
@Testcontainers
class EmployeeRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
    }

    @Autowired EmployeeRepository repo;

    @Test
    void shouldFindByDepartment() {
        repo.save(new Employee("Alice", "Engineering", 95000, 30));
        assertThat(repo.findByDepartment("Engineering")).hasSize(1);
    }
}
\`\`\``,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MICROSERVICES — ARCHITECTURE & COMMUNICATION
  // ─────────────────────────────────────────────
  {
    id: 'microservices-architecture',
    label: 'Microservices — Architecture & Communication',
    questions: [
      {
        q: 'Monolith vs microservices; when should a monolith not be split?',
        a: `**Monolith:** all code deployed as one unit. Simple to develop, test, and deploy. Becomes painful when: teams are large, deployment frequency is high, and different parts of the system need to scale independently.

**Microservices:** independently deployable services, each owning its data. Enables team autonomy, independent scaling, and polyglot tech — but adds: network latency, distributed failure, operational complexity, and eventual consistency challenges.

**When NOT to split:**
- The team is small (< 10 engineers) — microservices overhead isn't worth it
- The domain is not well understood — splitting premature leads to wrong boundaries that are costly to fix
- The system is not under significant load
- You don't have the operational maturity (observability, CI/CD, container orchestration)

Martin Fowler's rule: start with a **modular monolith**, extract services when you feel the pain of coupling.`,
      },
      {
        q: 'How do you identify service boundaries? Domain-driven design basics.',
        a: `**Bounded Context (DDD):** a boundary within which a particular domain model is consistent and self-contained. Each microservice should correspond to one bounded context.

Key heuristics for service boundaries:
- Cohesion: things that change together belong together
- Team ownership: one team owns one service end-to-end
- Data ownership: a service owns its data store — no shared tables
- Business capability: align to business capabilities (Ordering, Payments, Inventory) not technical layers

**Ubiquitous language:** within a bounded context, use consistent terminology. "Order" in Payments may mean something different than "Order" in Shipping — that's a boundary signal.

**Anti-pattern to avoid:** splitting by technical layer (a "DB service", a "UI service") — this creates chatty dependencies and no autonomy.`,
      },
      {
        q: 'Database per service; why avoid shared databases?',
        a: `**Database per service** is a core microservices principle. Each service owns and exclusively accesses its own data store.

**Why avoid shared databases:**
- **Tight coupling:** a schema change in Service A breaks Service B
- **Deployment coupling:** services can't be deployed independently
- **Lock contention:** one service's slow query impacts all others
- **Technology lock-in:** forces all services to use the same DB technology

**Consequences to manage:**
- Joins across services must be done in application code or via events
- Consistency must be achieved eventually (Saga pattern) rather than with DB transactions
- Each service can choose the best storage technology (relational, document, time-series)`,
      },
      {
        q: 'REST vs gRPC vs messaging; synchronous vs asynchronous communication.',
        a: `| | REST | gRPC | Messaging (Kafka/RabbitMQ) |
|---|---|---|---|
| Protocol | HTTP/1.1, JSON | HTTP/2, Protobuf | TCP (broker) |
| Coupling | Loose (HTTP) | Tight (proto schema) | Very loose |
| Latency | Medium | Low (binary) | Higher (async) |
| Use for | Public APIs, CRUD | Internal high-throughput RPC | Events, decoupled workflows |

**Synchronous (REST/gRPC):** caller waits for response. Simpler but couples availability — if downstream is down, caller fails too.

**Asynchronous (messaging):** caller publishes an event and continues. Downstream processes when ready. Higher resilience, but harder to reason about consistency and ordering.

**Rule of thumb:** use sync for queries (read operations) and async for commands that trigger workflows (order placed → inventory reserved → payment charged → notification sent).`,
      },
      {
        q: 'API Gateway, service discovery, load balancing and centralized configuration.',
        a: `**API Gateway:** single entry point for all clients. Handles: routing, authentication, rate limiting, SSL termination, request aggregation. Examples: Spring Cloud Gateway, Kong, AWS API Gateway.

**Service discovery:** services register themselves; clients look up locations dynamically instead of using hardcoded URLs.
- **Server-side (Kubernetes):** client calls a stable service DNS name; Kubernetes routes to a pod
- **Client-side (Eureka):** client fetches the registry and picks an instance itself

**Load balancing:**
- **Client-side (Ribbon/Spring Cloud LoadBalancer):** client picks an instance from the registry
- **Server-side (Kubernetes Service / AWS ALB):** a proxy distributes requests

**Centralized configuration (Spring Cloud Config / Kubernetes ConfigMaps):** all services read their config from a central store. Enables: environment-specific config without rebuilding images, runtime config refresh via \`@RefreshScope\`.`,
      },
      {
        q: 'How do you handle service-to-service authentication and authorization?',
        a: `**mTLS (Mutual TLS):** both client and server present certificates. Common in service meshes (Istio, Linkerd). Zero-trust by default.

**JWT / OAuth2 (client credentials flow):** service A requests a token from an Authorization Server using its client ID/secret, then includes it in every call to service B. Service B validates the token.

\`\`\`java
// Spring Security resource server — validates incoming JWT
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .build();
}
\`\`\`

**Service mesh:** sidecars (Envoy proxies) handle authentication, TLS, retries, and observability transparently — services don't need to implement it themselves.`,
      },
      {
        q: 'How do you maintain backward compatibility during API changes?',
        a: `**Additive changes are safe:** adding new optional fields, new endpoints, new query parameters — existing clients ignore what they don't know.

**Breaking changes require versioning:** removing fields, changing field types, renaming endpoints.

**Strategies:**
- **API versioning** (\`/v1/\`, \`/v2/\`): run both versions simultaneously during migration
- **Consumer-driven contract testing** (Pact): consumers define what they need; providers verify they satisfy it in CI — catches breaking changes before deployment
- **Tolerant reader pattern:** consumers only use the fields they need and ignore the rest
- **Deprecation headers:** \`Deprecation: true\`, \`Sunset: 2027-01-01\` to signal clients to migrate

For **event schemas** (Kafka), use a **Schema Registry** (Confluent) with Avro/Protobuf to enforce forward/backward compatibility rules.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MICROSERVICES — RELIABILITY, CONSISTENCY & PATTERNS
  // ─────────────────────────────────────────────
  {
    id: 'microservices-reliability',
    label: 'Microservices — Reliability & Patterns',
    questions: [
      {
        q: 'Timeout vs retry vs circuit breaker vs bulkhead; how do they work together.',
        a: `**Timeout:** don't wait forever for a response. Fail fast so resources aren't held.

**Retry:** automatically retry failed requests. Only safe for idempotent operations. Always add exponential backoff + jitter.

**Circuit breaker:** tracks failure rate. When it exceeds a threshold, the circuit "opens" and subsequent calls fail immediately (without calling the downstream service) for a cool-down period. Prevents cascading failure.
- **Closed** → requests flow normally
- **Open** → requests fail immediately (fallback)
- **Half-open** → a probe request tests if downstream recovered

**Bulkhead:** isolate resources (thread pools, semaphores) so a slow dependency only degrades part of the system, not all of it.

**Together:** Timeout → Retry (with backoff) → Circuit Breaker → Bulkhead. Resilience4j implements all four.

\`\`\`java
@CircuitBreaker(name = "inventory", fallbackMethod = "fallback")
@Retry(name = "inventory")
@TimeLimiter(name = "inventory")
Mono<Inventory> getInventory(Long productId) {
    return inventoryClient.get(productId);
}
\`\`\``,
      },
      {
        q: 'Retry with exponential backoff and jitter; when can retries make an outage worse?',
        a: `**Exponential backoff:** wait time doubles with each retry: 1s → 2s → 4s → 8s...

**Jitter:** add randomness to the wait time so all clients don't retry at the same instant — prevents thundering herd.

\`\`\`
wait = min(cap, base * 2^attempt) + random(0, jitter)
\`\`\`

**When retries make things worse:**
- **Non-idempotent operations** — retrying a payment could charge twice
- **Downstream is overloaded** — retries add more load; use circuit breaker instead
- **Without backoff** — synchronised retries from many clients simultaneously hammer the recovering service
- **Cascading retries** — if A retries 3× to B, and B retries 3× to C, one failure generates 9 requests to C`,
      },
      {
        q: 'Fallback strategies; rate limiting; load shedding.',
        a: `**Fallback strategies:**
- Return a cached/stale response
- Return a default/degraded response (empty list, placeholder data)
- Fail fast with a clear error so the UI can show a friendly message
- Route to a secondary service

**Rate limiting:** cap requests per client per time window to protect against abuse and overload. Implement at the API Gateway or with Bucket4j + Redis for distributed enforcement.

**Load shedding:** when the system is overloaded, deliberately reject low-priority requests to protect high-priority ones. Example: reject background batch jobs while still serving user-facing API calls. Kubernetes HPA + circuit breakers + queue depth thresholds all enable load shedding.`,
      },
      {
        q: 'Saga pattern: choreography vs orchestration; compensating transactions.',
        a: `**Saga:** a sequence of local transactions across services, each publishing an event or message. If one step fails, compensating transactions undo the previous steps.

**Choreography:** services react to events from each other. No central coordinator.
- ✓ Loose coupling, services don't know about each other
- ✗ Hard to understand the overall flow; risk of cyclic dependencies

**Orchestration:** a central Saga orchestrator (e.g., Temporal, Camunda, or a custom service) explicitly calls each service and handles failures.
- ✓ Clear flow in one place; easier to reason about
- ✗ Orchestrator becomes a central dependency

\`\`\`
Order Saga (orchestration):
1. Order Service: create order (pending)
2. Inventory Service: reserve stock → success
3. Payment Service: charge card → failure
4. Compensate: Inventory Service: release stock
5. Order Service: mark order as failed
\`\`\`

**Compensating transactions** must be idempotent and always succeed (or be retried until they do).`,
      },
      {
        q: '2-phase commit vs Saga; why distributed transactions are difficult.',
        a: `**2-phase commit (2PC):**
- Phase 1 (Prepare): coordinator asks all participants to prepare and lock resources
- Phase 2 (Commit/Abort): if all prepared → commit; if any failed → abort

**Problems with 2PC:**
- **Blocking protocol:** if coordinator crashes after prepare, participants are stuck holding locks
- **Performance:** locks are held across the network round trip
- **Tight coupling:** all participants must be available simultaneously
- NoSQL/microservices DBs often don't support XA transactions

**Why distributed transactions are hard:** network partitions, process crashes, and clock skew mean you can't get atomicity, isolation, and availability simultaneously (CAP theorem).

**Saga vs 2PC:** Saga trades isolation (no ACID across services) for availability and scalability. Intermediate states are visible. Use Saga for most microservice workflows; 2PC only when truly necessary and all services support XA.`,
      },
      {
        q: 'How do you achieve idempotency? Idempotency keys and deduplication.',
        a: `**Idempotency:** calling an operation multiple times has the same effect as calling it once. Critical for safe retries.

**Idempotency keys:** client generates a unique key per operation and sends it in a header (\`Idempotency-Key: uuid\`). Server stores the result keyed by this ID. On duplicate requests, return the cached result instead of re-executing.

\`\`\`java
@PostMapping("/payments")
ResponseEntity<Payment> charge(
    @RequestHeader("Idempotency-Key") String key,
    @RequestBody PaymentRequest req
) {
    return idempotencyStore.getOrExecute(key, () -> paymentService.charge(req));
}
\`\`\`

**Deduplication in Kafka consumers:** check if the event's unique ID has already been processed (store processed IDs in Redis or DB). If yes, skip processing.

\`\`\`java
if (processedEventStore.contains(event.id())) return;  // already processed
process(event);
processedEventStore.add(event.id(), TTL_7_DAYS);
\`\`\``,
      },
      {
        q: 'At-most-once vs at-least-once vs effectively-once processing.',
        a: `| Semantic | Guarantees | Risk |
|---|---|---|
| At-most-once | Message may be lost | Loss |
| At-least-once | Message delivered ≥1 time | Duplicates |
| Effectively-once (exactly-once) | No loss, no duplicates | Complex |

**At-most-once:** auto-commit offsets before processing. If consumer crashes after commit but before processing → message lost.

**At-least-once:** commit offset only after successful processing. If consumer crashes after processing but before commit → message redelivered → duplicate. Requires idempotent processing.

**Effectively-once:** Kafka transactions + idempotent producer + transactional consumer. Very high overhead; only use when duplicates are truly unacceptable (financial transactions). Most systems use at-least-once + idempotency.`,
      },
      {
        q: 'Outbox pattern; CDC; solving the dual-write problem.',
        a: `**Dual-write problem:** saving to DB and publishing to Kafka in separate operations — if the app crashes between the two, they go out of sync.

\`\`\`java
// WRONG — not atomic
orderRepo.save(order);           // DB write
kafkaTemplate.send("orders", event);  // might fail or not be reached
\`\`\`

**Outbox pattern:** write both the entity and the outbox event in the **same DB transaction**. A separate publisher reads the outbox table and publishes events to Kafka.

\`\`\`java
// CORRECT — both writes in same transaction
@Transactional
void placeOrder(Order order) {
    orderRepo.save(order);
    outboxRepo.save(new OutboxEvent("OrderPlaced", toJson(order)));
}
// Outbox publisher runs separately and reliably publishes events
\`\`\`

**CDC (Change Data Capture):** instead of a polling publisher, tools like **Debezium** stream DB change log (WAL/binlog) directly to Kafka. Atomic by nature — the event IS the DB change. Zero polling overhead.`,
      },
      {
        q: 'CAP theorem; eventual consistency; strong consistency; quorum basics.',
        a: `**CAP theorem:** a distributed system can guarantee at most two of three properties simultaneously:
- **C**onsistency — every read gets the most recent write
- **A**vailability — every request gets a (non-error) response
- **P**artition tolerance — system works despite network partitions

Network partitions are unavoidable in real distributed systems — so you always have P, and must choose between C and A during a partition.

- **CP systems** (HBase, ZooKeeper): return error when partitioned rather than stale data
- **AP systems** (Cassandra, DynamoDB, CouchDB): return potentially stale data rather than an error

**Eventual consistency:** given no new updates, all replicas will converge to the same value. Your UI may show stale data briefly after a write.

**Strong consistency:** any read reflects all previously completed writes.

**Quorum:** in a cluster of N replicas, a write requiring W acknowledgments and a read requiring R responses is strongly consistent when \`R + W > N\`. Example: N=3, W=2, R=2 → any read overlaps with any write by at least one replica.`,
      },
      {
        q: 'Distributed locks, leader election, clock skew and split-brain scenarios.',
        a: `**Distributed locks:** coordinate access to a shared resource across services.
- **Redis (Redlock):** \`SET key uuid NX PX 30000\` — atomic, with TTL to prevent deadlock
- **ZooKeeper / etcd:** stronger guarantees via consensus protocols

\`\`\`java
// Redisson distributed lock
RLock lock = redisson.getLock("inventory:" + productId);
lock.lock(10, TimeUnit.SECONDS);
try { updateInventory(productId, qty); } finally { lock.unlock(); }
\`\`\`

**Leader election:** one node is designated leader to perform singleton tasks (scheduled jobs, partition assignments). Implemented with ZooKeeper, etcd, or Kubernetes lease objects.

**Clock skew:** clocks on different nodes drift. Timestamps from different machines can't be compared reliably. Solutions: use logical clocks (Lamport timestamps), hybrid logical clocks (HLC), or vector clocks for ordering events.

**Split-brain:** network partition causes two nodes to each believe they are the leader and both accept writes → data divergence. Prevention: require quorum before acting as leader; use fencing tokens to invalidate old leaders' writes.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // KAFKA, REDIS & PRODUCTION SCENARIOS
  // ─────────────────────────────────────────────
  {
    id: 'kafka-redis-production',
    label: 'Kafka, Redis & Production Scenarios',
    questions: [
      {
        q: 'Kafka topics, partitions, offsets, brokers, replication and ISR.',
        a: `**Topic:** a named stream of records. Split into **partitions** for parallelism.

**Partition:** an ordered, immutable log. Each record has an **offset** — an incrementing ID within the partition.

**Broker:** a Kafka server that stores partition data. A cluster has multiple brokers.

**Replication:** each partition has one **leader** and N-1 **follower replicas** on other brokers. All reads and writes go to the leader. Followers replicate.

**ISR (In-Sync Replicas):** the set of replicas that are caught up with the leader. A message is considered committed (safe) when all ISRs have acknowledged it (\`acks=all\`).

**Replication factor = 3** is typical in production: tolerates loss of 1 broker without data loss.

\`\`\`
Topic: orders (3 partitions, replication factor 3)
Partition 0: Leader → Broker 1, Follower → Broker 2, Follower → Broker 3
Partition 1: Leader → Broker 2, ...
Partition 2: Leader → Broker 3, ...
\`\`\``,
      },
      {
        q: 'Consumer groups; partition assignment; rebalancing; ordering guarantees.',
        a: `**Consumer group:** a set of consumers sharing the work of reading a topic. Each partition is assigned to exactly one consumer in the group at a time — enabling parallelism without duplicate processing.

**Partition assignment:** Kafka's group coordinator assigns partitions to consumers when the group is first created or when membership changes.

**Rebalancing:** triggered when a consumer joins or leaves the group, or is considered dead (heartbeat timeout). During rebalancing, all consumption pauses (cooperative rebalancing reduces this). Causes duplicate processing if offsets weren't committed before the rebalance.

**Ordering guarantees:** Kafka guarantees **order within a partition**, not across partitions. To guarantee order for a logical entity (e.g., all events for order 42), use a consistent partition key (\`orderId\`) so all events land in the same partition.

\`\`\`java
kafkaTemplate.send("orders", order.getId().toString(), event);
// all events for the same orderId go to the same partition
\`\`\``,
      },
      {
        q: 'Kafka delivery semantics; idempotent producer; transactions and exactly-once caveats.',
        a: `**Producer delivery semantics:**
- \`acks=0\` — fire and forget (at-most-once)
- \`acks=1\` — leader acknowledges (risk of loss if leader crashes before replication)
- \`acks=all\` — all ISRs acknowledge (at-least-once, strongest durability)

**Idempotent producer** (\`enable.idempotence=true\`): adds a producer ID and sequence number to each batch. Brokers deduplicate retries → exactly-once within a single partition, single session.

**Transactions:** wraps reads and writes across multiple partitions/topics into an atomic operation. Used for Kafka Streams and consume-transform-produce pipelines.

**Exactly-once caveats:**
- Only within the Kafka ecosystem (producer → broker → consumer)
- Does NOT cover side effects (DB writes, external API calls)
- Consumer must read with \`isolation.level=read_committed\` to skip uncommitted transactional messages
- Higher latency and overhead — use only when duplicates are truly unacceptable`,
      },
      {
        q: 'Retry topic vs DLQ; poison messages; offset commit strategies.',
        a: `**Poison message:** a message that consistently causes processing to fail (bad schema, null pointer, business rule violation). Without a strategy, it blocks the partition forever.

**Retry topic:** re-publish the failed message to a retry topic (with delays). After N retries, move to DLQ.

**DLQ (Dead Letter Queue):** a separate topic for messages that exhausted retries. Enables: alerting on failures, manual inspection and replay, without blocking the main topic.

\`\`\`
Main Topic → Consumer → Success ✓
                      ↓ Failure
                 Retry Topic (3 attempts, exponential delay)
                      ↓ Still failing
                     DLQ
\`\`\`

**Offset commit strategies:**
- **Auto-commit** (\`enable.auto.commit=true\`): commits on a schedule → at-most-once if crash happens before processing
- **Manual sync** (\`commitSync()\`): commit after processing → at-least-once; blocks until acknowledged
- **Manual async** (\`commitAsync()\`): non-blocking; use with retry on failure callback`,
      },
      {
        q: 'How do you handle duplicate events and out-of-order events?',
        a: `**Duplicate events** (from at-least-once delivery or producer retries):
- Track processed event IDs in Redis or a DB table with TTL
- Make all processing idempotent — the same operation applied twice produces the same result
- For DB operations, use \`INSERT ... ON CONFLICT DO NOTHING\` or upserts

**Out-of-order events** (from multiple partitions, retries, or delayed messages):
- Include an **event timestamp** or **sequence number** in the payload
- Use a **windowing strategy** — buffer events for a time window, then process in order
- For state machines, ignore events that arrive for a state already past
- Include a **version/etag** on the entity and reject updates for older versions

\`\`\`java
// Idempotent upsert
@Modifying
@Query("INSERT INTO order_status (order_id, status, updated_at) " +
       "VALUES (:id, :status, :ts) " +
       "ON CONFLICT (order_id) DO UPDATE SET status = :status, updated_at = :ts " +
       "WHERE order_status.updated_at < :ts")  // only update if newer
void upsertStatus(@Param("id") Long id, @Param("status") String status,
                  @Param("ts") Instant ts);
\`\`\``,
      },
      {
        q: 'How do you monitor consumer lag and troubleshoot a growing backlog?',
        a: `**Consumer lag** = latest offset on the partition - consumer's current offset. It represents how far behind a consumer is.

**Monitoring:**
- \`kafka-consumer-groups.sh --describe --group myGroup\` — shows lag per partition
- Kafka built-in JMX metrics → Prometheus + Grafana dashboards
- Confluent Control Center or LinkedIn Burrow for lag alerting

**Troubleshooting a growing backlog:**
1. **Is the consumer running?** Check for crashes, OOM, unhandled exceptions causing the consumer to stop
2. **Is processing too slow?** Profile the consumer — look for slow DB queries, synchronous external calls, GC pauses
3. **Is the producer sending more than expected?** Check producer throughput
4. **Scale out consumers** — add more consumer instances (up to the number of partitions)
5. **Add more partitions** to the topic (requires rebalancing and care with ordering)
6. **Optimize processing** — batch DB operations, use async calls, reduce per-message overhead`,
      },
      {
        q: 'Redis cache-aside vs write-through; TTL and invalidation.',
        a: `**Cache-aside (lazy loading):** application reads from cache; on miss, reads from DB, stores in cache, returns.
\`\`\`
Read: Cache hit? → return  |  Cache miss → DB → store in cache → return
Write: update DB, delete/update cache
\`\`\`

\`\`\`java
Employee get(Long id) {
    String key = "employee:" + id;
    Employee cached = redis.get(key, Employee.class);
    if (cached != null) return cached;
    Employee emp = db.findById(id);
    redis.setex(key, 300, emp);  // TTL 5 min
    return emp;
}
\`\`\`

**Write-through:** every write goes to both cache and DB atomically. Cache is always consistent but writes are slower.

**TTL (Time-To-Live):** automatic expiry prevents stale data accumulating indefinitely. Set TTL based on acceptable staleness for the data type.

**Cache invalidation strategies:**
- **TTL expiry** — simple, eventually consistent
- **Explicit delete on write** — cache-aside: delete the key after DB update
- **Event-driven** — Kafka event triggers cache invalidation across services
- **Write-through** — always consistent, higher write latency`,
      },
      {
        q: 'Cache stampede, cache penetration, hot keys and distributed caching.',
        a: `**Cache stampede (thundering herd):** a popular cache entry expires → many requests simultaneously miss and all hit the DB. Solutions:
- **Probabilistic early expiration:** refresh the cache slightly before it expires
- **Mutex/lock:** only one thread refreshes; others wait
- **Background refresh:** a background job refreshes before expiry

**Cache penetration:** requests for keys that don't exist in DB (e.g., non-existent user IDs) always miss the cache and hit DB. Solutions:
- Cache null/empty results with a short TTL
- **Bloom filter:** quickly determine if a key could exist before querying DB

**Hot keys:** a single cache key gets disproportionately high traffic (e.g., a viral product page). Solutions:
- **Local in-process cache** (Caffeine) in front of Redis for ultra-hot keys
- **Key sharding:** replicate the value across multiple keys (\`product:42:shard:1\`, \`:shard:2\`) and distribute reads

**Distributed caching (Redis Cluster):** data is sharded across 16384 hash slots, distributed across nodes. Clients route requests to the correct node. Provides horizontal scaling and fault tolerance.`,
      },
      {
        q: 'Production: one downstream service is slow — how do you prevent cascading failure?',
        a: `**The problem:** Service A calls Service B. B is slow → A's threads wait → A's thread pool exhausts → A becomes slow → A's callers fail → cascading failure.

**Prevention layers:**

1. **Timeouts** — don't wait more than N ms for B. Fail fast.
2. **Bulkhead** — isolate B's calls in a separate thread pool. B's slowness can only exhaust its own pool, not A's main pool.
3. **Circuit breaker** — once error/timeout rate exceeds threshold, stop calling B and return fallback immediately. Give B time to recover.
4. **Fallback** — return stale cached data, a default response, or a graceful degradation message.
5. **Retry with backoff + jitter** — don't hammer a struggling service immediately.
6. **Queue-based decoupling** — if the operation is async, put it in Kafka instead of calling B synchronously.

\`\`\`java
// Resilience4j: circuit breaker + timeout + fallback
@CircuitBreaker(name = "inventoryService", fallbackMethod = "cachedInventory")
@TimeLimiter(name = "inventoryService")
CompletableFuture<Inventory> getInventory(Long id) {
    return CompletableFuture.supplyAsync(() -> inventoryClient.get(id));
}

CompletableFuture<Inventory> cachedInventory(Long id, Throwable t) {
    return CompletableFuture.completedFuture(cache.getOrDefault(id, Inventory.EMPTY));
}
\`\`\``,
      },
      {
        q: 'Production: API latency, error rate or Kafka lag suddenly increases — how do you investigate?',
        a: `**Step 1 — Establish scope:**
- Is it one endpoint or all? One service or multiple?
- Did it correlate with a deployment, config change, or traffic spike?

**Step 2 — Check dashboards:**
- **Latency:** P50, P95, P99 — is it one slow endpoint or all?
- **Error rate:** 4xx vs 5xx — 4xx is usually a client issue; 5xx is your code
- **Kafka lag:** which consumer group, which partition?

**Step 3 — Trace the request path:**
- **Distributed tracing** (Jaeger, Zipkin, AWS X-Ray) — find which service/DB query is slow
- Look for: slow SQL queries (check slow query log), external HTTP calls timing out, GC pauses

**Step 4 — Check infrastructure:**
- DB connection pool exhausted?
- CPU/memory spike on any pod?
- Kubernetes pod OOMKilled or restarting?
- Downstream service latency increased? (check service-to-service metrics)

**Step 5 — For Kafka lag specifically:**
- Consumer crashing silently? (check logs, dead-letter queue)
- Processing time per message increased? (profiling)
- Producer throughput suddenly spiked?
- Partition count vs consumer count — are some consumers overloaded?

**Key tools:** Grafana, Prometheus, structured logs (ELK/Loki), distributed tracing, \`jstack\`, \`kubectl top\`.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // AWS — COMPUTE, CONTAINERS & DEPLOYMENT
  // ─────────────────────────────────────────────
  {
    id: 'aws-compute',
    label: 'AWS — Compute, Containers & Deployment',
    questions: [
      {
        q: 'EC2 vs ECS vs EKS vs Lambda; when would you choose each?',
        a: `| Service | Abstraction | Best for |
|---|---|---|
| EC2 | Virtual machines | Full control, stateful apps, custom OS/runtime |
| ECS | Container orchestration (AWS-managed) | Containers without Kubernetes complexity |
| EKS | Managed Kubernetes | Kubernetes workloads, portability, large teams |
| Lambda | Function (serverless) | Event-driven, short-lived, variable traffic |

**Choose EC2** when you need control over the OS, persistent agents, or non-containerised legacy apps.
**Choose ECS (Fargate)** when you want containers without managing cluster nodes — simpler ops than EKS.
**Choose EKS** when you need Kubernetes features (custom schedulers, Helm, service mesh) or portability across clouds.
**Choose Lambda** when: traffic is bursty or low-volume, execution < 15 min, you want zero infra management, and cold start latency is acceptable.`,
      },
      {
        q: 'How does AWS Lambda work? Cold starts, concurrency, timeout and memory settings.',
        a: `Lambda runs your code inside a micro-VM (Firecracker). Each invocation gets an isolated execution environment.

**Cold start:** when no warm environment exists, Lambda must: download the package, start the runtime, run the init code — adds 100ms–2s latency depending on runtime and package size. Subsequent invocations reuse the warm environment.

**Mitigation:** Provisioned Concurrency (pre-warms N environments), SnapStart (Java — snapshots JVM state), smaller package, avoid heavy init code outside the handler.

**Concurrency:** default 1000 concurrent executions per region (soft limit). Each in-flight invocation consumes one unit. Reserved concurrency caps a function's max; Provisioned Concurrency pre-warms environments.

**Timeout:** max 15 minutes. Set as low as your P99 latency + buffer. Prevents runaway invocations consuming concurrency.

**Memory:** 128 MB – 10 GB. CPU is allocated proportionally to memory. For CPU-bound Java functions, increasing memory often reduces duration enough to lower total cost.`,
      },
      {
        q: 'Lambda synchronous vs asynchronous invocation; retries and DLQ / destinations.',
        a: `**Synchronous** (API Gateway, ALB, direct SDK call): caller waits for response. Lambda returns result or error immediately. No built-in retries by Lambda — caller must retry.

**Asynchronous** (S3 events, SNS, EventBridge): Lambda queues the event internally and returns 202 immediately. Lambda retries up to 2 times on failure (3 total attempts) with delays between retries.

**DLQ (Dead Letter Queue):** after all retries fail, Lambda sends the event to an SQS queue or SNS topic for manual inspection/replay.

**Event Destinations** (newer, preferred over DLQ): on success or failure, Lambda forwards the invocation record to SQS, SNS, EventBridge, or another Lambda. More metadata than DLQ.

\`\`\`json
{
  "FunctionResponseTypes": [],
  "DestinationConfig": {
    "OnFailure": { "Destination": "arn:aws:sqs:...:my-dlq" },
    "OnSuccess": { "Destination": "arn:aws:sqs:...:my-success-queue" }
  }
}
\`\`\``,
      },
      {
        q: 'How do you deploy a Spring Boot service on EC2, ECS or EKS?',
        a: `**EC2:**
- Build JAR, copy to EC2 via CodeDeploy or S3
- Run as systemd service; use an ALB in front
- Use an Auto Scaling Group for HA

**ECS (Fargate):**
- Build Docker image → push to ECR
- Define Task Definition (CPU, memory, env vars, image)
- Create ECS Service (desired count, ALB target group)
- Deploy: update Task Definition with new image tag → ECS rolling update

**EKS:**
- Build Docker image → push to ECR
- Write Kubernetes manifests: Deployment, Service, Ingress
- Apply with \`kubectl apply -f\` or Helm chart
- Use Horizontal Pod Autoscaler for scaling

\`\`\`yaml
# Kubernetes Deployment snippet
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: order-service
        image: 123456.dkr.ecr.us-east-1.amazonaws.com/order-service:v2
        resources:
          requests: { cpu: "500m", memory: "512Mi" }
          limits:   { cpu: "1",    memory: "1Gi" }
        livenessProbe:
          httpGet: { path: /actuator/health, port: 8080 }
\`\`\``,
      },
      {
        q: 'Docker image layers, multi-stage builds, health checks and container resource limits.',
        a: `**Image layers:** each Dockerfile instruction creates a layer. Layers are cached — if a layer's input hasn't changed, Docker reuses the cache. Put frequently changing instructions (COPY source code) last; stable instructions (dependency install) first.

**Multi-stage build:** reduces final image size by separating build tools from runtime.

\`\`\`dockerfile
# Stage 1: build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline          # cached layer
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: runtime — only the JAR, no Maven
FROM eclipse-temurin:21-jre-alpine
COPY --from=builder /app/target/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

**Health checks:** Docker or ECS/Kubernetes periodically checks the container. Unhealthy containers are restarted or replaced.

**Resource limits (Kubernetes):**
- **requests** — guaranteed minimum; used for scheduling decisions
- **limits** — hard cap; CPU is throttled at limit; memory OOMKills the container

Always set both. A container without limits can starve its neighbours.`,
      },
      {
        q: 'How does Kubernetes manage pods, deployments, services, ingress and autoscaling?',
        a: `**Pod:** smallest deployable unit; one or more containers sharing network and storage.

**Deployment:** declares desired state (N replicas of image X). The controller continuously reconciles actual state to desired. Rolling updates replace pods gradually.

**Service:** stable DNS name + virtual IP in front of a set of pods (selected by labels). Types: ClusterIP (internal), NodePort, LoadBalancer (provisions AWS NLB/ELB).

**Ingress:** HTTP/HTTPS routing rules (path-based, host-based) to Services. Requires an Ingress Controller (AWS ALB Ingress Controller, nginx).

**HPA (Horizontal Pod Autoscaler):** scales pod count based on CPU/memory or custom metrics (Kafka lag via KEDA).

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target: { type: Utilization, averageUtilization: 60 }
\`\`\``,
      },
      {
        q: 'Blue-green vs canary vs rolling deployment; rollback strategy.',
        a: `**Rolling:** replace pods one-by-one (or in small batches). Zero downtime, gradual. Rollback = redeploy previous image. Default in Kubernetes.

**Blue-green:** run two identical environments (blue = current, green = new). Switch traffic at the load balancer level instantly. Rollback = switch traffic back. Requires double the resources.

**Canary:** route a small percentage of traffic (e.g., 5%) to the new version. Monitor errors/latency. Gradually shift more traffic if healthy. Rollback = route 100% back to old version. Best for de-risking high-impact changes.

| Strategy | Downtime | Rollback speed | Resource cost |
|---|---|---|---|
| Rolling | None | Slow (re-deploy) | Low |
| Blue-green | None | Instant | Double |
| Canary | None | Fast | Low–medium |

In AWS: use **CodeDeploy** for ECS/Lambda canary/blue-green, **ALB weighted target groups** for canary traffic splitting.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // AWS — STORAGE, DATABASES & MESSAGING
  // ─────────────────────────────────────────────
  {
    id: 'aws-storage',
    label: 'AWS — Storage, Databases & Messaging',
    questions: [
      {
        q: 'S3 storage classes, versioning, lifecycle policies, encryption and pre-signed URLs.',
        a: `**Storage classes:**
- **Standard** — frequent access, high availability
- **Standard-IA** — infrequent access, lower cost, retrieval fee
- **Intelligent-Tiering** — auto-moves objects between tiers based on access
- **Glacier Instant/Flexible/Deep Archive** — archival; retrieval from minutes to hours

**Versioning:** keeps all versions of an object. Enables recovery from overwrites/deletes. Delete markers instead of permanent deletion.

**Lifecycle policies:** automatically transition or expire objects. Example: move to Standard-IA after 30 days, Glacier after 90 days, delete after 365 days.

**Encryption:**
- **SSE-S3** — AWS manages keys (AES-256)
- **SSE-KMS** — your KMS key; audit trail in CloudTrail; key rotation
- **SSE-C** — customer provides key on every request
- **Client-side** — encrypt before uploading

**Pre-signed URLs:** grant temporary access to a private object without exposing credentials.
\`\`\`java
S3Presigner presigner = S3Presigner.create();
PresignedGetObjectRequest presigned = presigner.presignGetObject(r -> r
    .signatureDuration(Duration.ofMinutes(15))
    .getObjectRequest(g -> g.bucket("my-bucket").key("report.pdf")));
String url = presigned.url().toString();
\`\`\``,
      },
      {
        q: 'S3 event notifications; avoiding duplicate event processing.',
        a: `S3 can send event notifications (PUT, DELETE, etc.) to: **SQS**, **SNS**, or **Lambda**.

For **fan-out**: S3 → SNS → multiple SQS queues (each consumed by a different service).

**Avoiding duplicates:**
- S3 guarantees **at-least-once** delivery — the same event may arrive more than once
- Make consumers **idempotent**: check if the object has already been processed before acting (store processed S3 key+ETag in DynamoDB or Redis)
- Use SQS FIFO with message deduplication ID = S3 ETag for content-level deduplication
- For Lambda: use the \`requestId\` or S3 object ETag as an idempotency key`,
      },
      {
        q: 'RDS vs DynamoDB; relational vs NoSQL data modeling.',
        a: `| | RDS (PostgreSQL/MySQL) | DynamoDB |
|---|---|---|
| Data model | Relational (tables, joins, FK) | Key-value / document |
| Schema | Fixed (migrations) | Flexible |
| Query flexibility | High (SQL, any column) | Low (primary key + indexes) |
| Scaling | Vertical + read replicas | Horizontal, unlimited |
| Consistency | Strong (ACID) | Eventual (default) or strong |
| Use when | Complex queries, relationships, transactions | High throughput, simple access patterns, global scale |

**Relational modeling:** normalize data to reduce duplication; use joins at query time.

**NoSQL modeling:** design around access patterns first. Denormalize — duplicate data to avoid joins. Use composite keys and GSIs to support multiple access patterns.

**Rule:** if you don't know your access patterns upfront, start with RDS. DynamoDB requires upfront pattern knowledge.`,
      },
      {
        q: 'DynamoDB partition key, sort key, GSI, LSI, hot partitions and capacity modes.',
        a: `**Partition key:** determines which partition stores the item. Must be unique per item (or unique in combination with sort key). High cardinality is essential to avoid hot partitions.

**Sort key:** enables range queries within a partition (\`begins_with\`, \`between\`, \`>\`). Items with same partition key are sorted by sort key.

**GSI (Global Secondary Index):** alternative partition + sort key on the same table. Queries across all partitions. Eventual consistency only. Additional cost.

**LSI (Local Secondary Index):** alternative sort key on the same partition key. Must be defined at table creation. Strongly consistent reads possible.

**Hot partitions:** one partition key receiving disproportionate traffic. Throttles all items on that partition. Prevention: add random suffix to partition key (write sharding), use high-cardinality keys, avoid sequential IDs.

**Capacity modes:**
- **Provisioned:** set read/write capacity units; auto-scaling available; predictable cost
- **On-Demand:** pay-per-request; no capacity planning; best for unpredictable traffic`,
      },
      {
        q: 'DynamoDB conditional writes, transactions, TTL and optimistic locking.',
        a: `**Conditional writes:** only write if a condition is met — prevents overwriting or enforces business rules.
\`\`\`java
// Only update if version matches (optimistic locking)
table.updateItem(r -> r
    .key(Map.of("id", AttributeValue.fromS(orderId)))
    .updateExpression("SET #status = :new, version = :newVer")
    .conditionExpression("version = :currentVer")
    .expressionAttributeValues(Map.of(
        ":new", AttributeValue.fromS("CONFIRMED"),
        ":newVer", AttributeValue.fromN("2"),
        ":currentVer", AttributeValue.fromN("1")
    )));
// Throws ConditionalCheckFailedException if version != 1
\`\`\`

**Transactions:** \`TransactWriteItems\` / \`TransactGetItems\` — up to 100 items across multiple tables atomically. 2× the cost of normal operations.

**TTL:** set a Unix timestamp attribute; DynamoDB automatically deletes expired items within ~48 hours. No cost for deletions. Great for sessions, caches, rate-limit counters.

**Optimistic locking:** use a \`version\` attribute + conditional write. Reject updates where version doesn't match — prevents lost updates in concurrent scenarios.`,
      },
      {
        q: 'SQS Standard vs FIFO; visibility timeout, long polling, DLQ and redrive.',
        a: `| | Standard | FIFO |
|---|---|---|
| Ordering | Best-effort | Strict (per message group) |
| Delivery | At-least-once (duplicates possible) | Exactly-once |
| Throughput | Unlimited | 300 TPS (3000 with batching) |
| Use when | High throughput, order doesn't matter | Ordered processing, no duplicates |

**Visibility timeout:** after a consumer receives a message, it's hidden from others for N seconds. If not deleted within that time, it reappears (re-delivery). Set to > your max processing time.

**Long polling:** instead of returning empty responses immediately, SQS waits up to 20 seconds for a message. Reduces empty responses and cost (\`WaitTimeSeconds=20\`).

**DLQ (Dead Letter Queue):** after \`maxReceiveCount\` failed processing attempts, the message moves to the DLQ. Use for alerting, inspection, and manual replay.

**Redrive:** DLQ redrive policy sends messages back to the source queue for reprocessing after fixing the bug.`,
      },
      {
        q: 'SNS vs SQS; fan-out pattern; SNS to SQS subscription.',
        a: `**SNS (Simple Notification Service):** pub/sub. One message → push to multiple subscribers (SQS, Lambda, HTTP, email). No retention — if subscriber is down, message is lost.

**SQS (Simple Queue Service):** point-to-point queue. Messages persist until consumed or TTL expires. Pull-based. Decouples producer from consumer.

**Fan-out pattern:** S3 event / publisher → SNS topic → multiple SQS queues (one per subscriber service). Each service processes independently at its own pace.

\`\`\`
OrderPlaced event
     │
  SNS Topic
  ┌──┴──┬────────┐
SQS-A  SQS-B  SQS-C
(Email) (Inv.) (Ship.)
\`\`\`

**Why SNS → SQS instead of SNS → Lambda directly?** SQS provides buffering, retry, DLQ, and rate control. Lambda directly on SNS has no retry on processing failure.`,
      },
      {
        q: 'EventBridge vs SNS vs SQS; event-driven architecture use cases.',
        a: `| | SQS | SNS | EventBridge |
|---|---|---|---|
| Model | Queue (pull) | Topic (push) | Event bus (rule-based routing) |
| Filtering | No | Basic attribute filter | Rich content-based rules |
| Sources | Your app | Your app | AWS services, SaaS, your app |
| Targets | Workers | Subscribers | 20+ AWS services |
| Ordering | FIFO only | No | No |

**Use SQS** when: decoupling a producer and consumer, buffering, retry with DLQ.
**Use SNS** when: fan-out to multiple consumers of the same event.
**Use EventBridge** when: routing events from many sources (AWS services, third-party SaaS like Stripe, Shopify) to different targets based on content rules; building complex event-driven pipelines.

EventBridge is essentially a serverless event router with schema discovery and replay capability.`,
      },
      {
        q: 'Kinesis vs Kafka; shards, ordering and consumer scaling.',
        a: `| | Kinesis Data Streams | Apache Kafka (MSK) |
|---|---|---|
| Managed by | AWS fully managed | AWS MSK (managed) or self-hosted |
| Ordering | Per shard | Per partition |
| Retention | 24h default, up to 365 days | Configurable, indefinite |
| Scaling | Add shards (manual or on-demand) | Add partitions/brokers |
| Consumer model | Pull; Enhanced Fan-Out for push | Pull (consumer groups) |
| Use when | AWS-native, low ops overhead | More control, Kafka ecosystem |

**Shards:** a Kinesis stream is split into shards. Each shard handles 1 MB/s write, 2 MB/s read. Records with the same partition key go to the same shard (ordering guarantee).

**Hot shard:** one partition key getting too much traffic — same as Kafka hot partition. Solution: use high-cardinality partition keys.

**Consumer scaling:** one consumer per shard maximum (standard). With Enhanced Fan-Out, up to 5 consumers can read the same shard simultaneously at 2 MB/s each.`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // AWS — SECURITY, NETWORKING, OBSERVABILITY & OPERATIONS
  // ─────────────────────────────────────────────
  {
    id: 'aws-security-ops',
    label: 'AWS — Security, Networking & Observability',
    questions: [
      {
        q: 'IAM users, roles, policies and least-privilege access; role assumption.',
        a: `**IAM User:** a person or application with long-term credentials (access key + secret). Avoid for applications — use roles instead.

**IAM Role:** a temporary identity assumed by a service, EC2 instance, Lambda, or another account. No long-term credentials — AWS STS issues short-lived tokens.

**IAM Policy:** JSON document defining allowed/denied actions on resources.
\`\`\`json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::my-bucket/*"
}
\`\`\`

**Least privilege:** grant only the minimum permissions required. Start with nothing; add permissions as needed. Use IAM Access Analyzer to identify unused permissions.

**Role assumption:** a Lambda function or ECS task has an execution role. AWS injects temporary credentials via the metadata service — your code uses the AWS SDK which automatically picks them up. No hardcoded keys needed.

**Cross-account access:** Account A's Lambda can assume a role in Account B. Account B's role has a trust policy allowing Account A to assume it.`,
      },
      {
        q: 'Secrets Manager vs SSM Parameter Store vs KMS.',
        a: `| | Secrets Manager | SSM Parameter Store | KMS |
|---|---|---|---|
| Purpose | Store and rotate secrets | Store config + secrets | Key management, encryption |
| Rotation | Built-in automatic rotation | Manual only | Key rotation (annual) |
| Cost | ~$0.40/secret/month | Free (Standard) | Per key + API calls |
| Use for | DB passwords, API keys needing rotation | App config, non-sensitive params | Encrypting data, envelopes |

**Secrets Manager:** use for database credentials, API keys, OAuth tokens — anything that needs rotation. Spring Boot integration via \`spring-cloud-aws\`.

**SSM Parameter Store:** use for non-sensitive config (feature flags, endpoint URLs) and sensitive values that don't rotate. SecureString parameters are encrypted with KMS.

**KMS:** use it via other services — SSE-KMS for S3/RDS, Secrets Manager uses KMS under the hood. Direct use: envelope encryption for application-level data encryption.`,
      },
      {
        q: 'How does envelope encryption work? Encrypting data in S3 and RDS.',
        a: `**Envelope encryption:** instead of encrypting data directly with the master key (too slow for large data), you:
1. Generate a **data encryption key (DEK)** using KMS
2. Encrypt your data with the DEK (locally, fast, AES-256)
3. Encrypt the DEK with your KMS master key (CMK)
4. Store the encrypted data + encrypted DEK together

To decrypt: call KMS to decrypt the DEK → use DEK to decrypt data. KMS master key never leaves AWS.

**S3 encryption:**
- **SSE-KMS**: S3 generates a DEK per object, encrypts it with your CMK. Each object access calls KMS (audit trail).
- Enable with bucket policy or default encryption setting.

**RDS encryption:**
- Enable at creation time (can't add later without snapshot + restore)
- Uses KMS CMK to encrypt storage, automated backups, snapshots, and read replicas
- Transparent to the application — connection is the same`,
      },
      {
        q: 'VPC, public/private subnets, route tables, NAT Gateway and Security Groups.',
        a: `**VPC:** isolated virtual network in AWS. You define the IP range (CIDR), subnets, and routing.

**Public subnet:** has a route to an Internet Gateway (IGW). Resources can receive inbound internet traffic (e.g., ALB, bastion host).

**Private subnet:** no direct route to the internet. Resources (RDS, ECS tasks, Lambda) are protected. Outbound internet via NAT Gateway.

**NAT Gateway:** in the public subnet; lets private subnet resources initiate outbound internet requests (e.g., download dependencies, call external APIs) without being reachable from the internet.

**Route table:** defines where traffic goes. Public subnet: 0.0.0.0/0 → IGW. Private subnet: 0.0.0.0/0 → NAT Gateway.

**Security Groups:** stateful virtual firewalls at the resource level. Allow rules only (no explicit deny). Rules reference CIDRs or other Security Groups.

\`\`\`
Internet → IGW → ALB (public subnet, SG: allow 443)
                  ↓
           ECS Task (private subnet, SG: allow 8080 from ALB SG only)
                  ↓
           RDS (private subnet, SG: allow 5432 from ECS SG only)
\`\`\``,
      },
      {
        q: 'ALB vs NLB; health checks and target groups.',
        a: `| | ALB (Application Load Balancer) | NLB (Network Load Balancer) |
|---|---|---|
| Layer | Layer 7 (HTTP/HTTPS) | Layer 4 (TCP/UDP/TLS) |
| Routing | Path, host, header, query | IP + port |
| Use for | HTTP APIs, microservices, WebSocket | Ultra-low latency, non-HTTP, static IP |
| SSL termination | Yes | Yes (TLS passthrough possible) |

**Target groups:** a set of targets (EC2, ECS tasks, Lambda, IPs) that receive traffic. Health checks run against targets; unhealthy ones are removed from rotation.

**ALB health check:** HTTP GET to a path (e.g., \`/actuator/health\`). Returns healthy if HTTP 200. Configure: interval, threshold, timeout.

For Spring Boot: expose \`/actuator/health\` and register it as the ALB health check path. Ensure the endpoint returns 200 only when the app is fully ready (database connection up, caches warm).`,
      },
      {
        q: 'CloudWatch Logs, Metrics, Alarms and dashboards; custom application metrics.',
        a: `**CloudWatch Logs:** centralised log storage. ECS/Lambda stream logs automatically via log drivers. Query with CloudWatch Logs Insights (SQL-like syntax).

**CloudWatch Metrics:** time-series data points. AWS services publish built-in metrics (Lambda duration, ECS CPU, ALB request count). Retained 15 months.

**Alarms:** trigger when a metric breaches a threshold for N consecutive periods. Actions: SNS notification, Auto Scaling, EC2 recovery.

**Custom application metrics:**
\`\`\`java
// Spring Boot Actuator + Micrometer + CloudWatch registry
// Add: micrometer-registry-cloudwatch2 dependency

@Service
class OrderService {
    private final Counter orderCounter;

    OrderService(MeterRegistry registry) {
        this.orderCounter = registry.counter("orders.placed", "env", "prod");
    }

    void placeOrder(Order o) {
        orderCounter.increment();
        // ...
    }
}
\`\`\`

**Dashboards:** combine metrics from multiple services into a single view. Use for SLO tracking (error rate, latency P99, availability).`,
      },
      {
        q: 'CloudTrail vs CloudWatch; tracing with X-Ray / OpenTelemetry.',
        a: `**CloudWatch:** operational monitoring — metrics, logs, alarms for application and infrastructure health.

**CloudTrail:** audit log of every AWS API call (who called what, when, from where). Enabled by default for 90 days; create a Trail for long-term S3 storage. Essential for security audits and compliance.

**X-Ray / OpenTelemetry distributed tracing:**
- Traces a request across multiple services; shows latency breakdown per segment
- X-Ray SDK or OpenTelemetry auto-instrumentation adds trace context to requests
- View service map, identify slow segments, debug errors across microservices

\`\`\`java
// Spring Boot + AWS X-Ray (via OpenTelemetry)
// Add: aws-xray-recorder-sdk-spring + xray-recorder-sdk-aws-sdk-v2

// Or use OpenTelemetry Java agent (zero-code instrumentation):
// -javaagent:opentelemetry-javaagent.jar
// OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
\`\`\``,
      },
      {
        q: 'How do you troubleshoot Lambda timeout, throttling, out-of-memory and permission errors?',
        a: `**Timeout:**
- Check CloudWatch Logs for "Task timed out after X seconds"
- Look for: slow DB queries, synchronous HTTP calls, large file processing
- Fix: increase timeout, optimise code, use async patterns, increase memory (more CPU)

**Throttling (429 TooManyRequestsException):**
- Concurrency limit hit (account limit or reserved concurrency cap)
- Check CloudWatch metric: \`Throttles\`
- Fix: request limit increase, implement SQS in front (Lambda polles SQS, SQS buffers bursts), use provisioned concurrency

**Out-of-memory:**
- CloudWatch Logs: "Runtime exited with error: signal: killed"
- Fix: increase memory setting; check for memory leaks (large static caches, unclosed streams)
- Profile with Lambda Power Tuning tool for optimal memory/cost balance

**Permission errors (AccessDeniedException):**
- Check CloudWatch Logs for the exact denied action and resource ARN
- Fix: add the required permission to the Lambda execution role
- Use IAM Policy Simulator to test permissions before deploying`,
      },
      {
        q: 'How do you design a highly available and fault-tolerant backend on AWS?',
        a: `**Multi-AZ deployment:** deploy across ≥ 2 Availability Zones. ALB spans AZs; ECS/EKS runs tasks in each AZ; RDS Multi-AZ for automatic failover.

**Stateless services:** no local state in the application tier — sessions in ElastiCache, files in S3. Any instance can handle any request.

**Auto Scaling:** scale out on load (HPA in EKS, ECS Service Auto Scaling); scale in when load drops.

**Database HA:**
- RDS Multi-AZ: synchronous standby replica, automatic failover in ~1 min
- Aurora: 6-way replication across 3 AZs, faster failover (~30s), read replicas for read scaling

**Health checks everywhere:** ALB health checks remove unhealthy targets; Kubernetes readiness probes prevent traffic to pods not ready.

**Circuit breakers:** prevent cascade failures when a downstream service degrades.

**Backups and DR:** automated RDS snapshots, S3 versioning + cross-region replication, test restore procedures regularly.

**Multi-region (for RPO/RTO near zero):** Route 53 health checks + latency routing; active-active or active-passive across regions; Global Accelerator for fast failover.`,
      },
      {
        q: 'How do you manage infrastructure using CloudFormation or CDK and deploy through CI/CD?',
        a: `**CloudFormation:** declarative JSON/YAML templates describing AWS resources. AWS manages the state and drift detection. Stacks group related resources.

**CDK (Cloud Development Kit):** write infrastructure in Java/Python/TypeScript; CDK synthesizes CloudFormation templates. Better IDE support, type safety, reusable constructs.

\`\`\`java
// CDK example (Java)
Bucket bucket = Bucket.Builder.create(this, "DataBucket")
    .versioned(true)
    .encryption(BucketEncryption.S3_MANAGED)
    .removalPolicy(RemovalPolicy.RETAIN)
    .build();
\`\`\`

**CI/CD pipeline:**
\`\`\`
Push to main
  → GitHub Actions / CodePipeline
  → Build: mvn package, docker build, push to ECR
  → Test: unit + integration tests
  → CDK synth + CDK diff (review changes)
  → CDK deploy to staging
  → Smoke tests
  → Approval gate (manual or automated)
  → CDK deploy to production (canary or blue-green)
\`\`\`

**Best practices:**
- Store state in S3 + DynamoDB locking (CDK / Terraform)
- One pipeline per environment; promote the same artifact through envs
- Use CDK pipelines (\`CodePipeline\` construct) for self-mutating pipelines`,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SENIOR-LEVEL PROJECT DISCUSSION
  // ─────────────────────────────────────────────
  {
    id: 'senior-project-discussion',
    label: 'Senior-Level Project Discussion',
    questions: [
      {
        q: 'Walk through one backend service you owned: APIs, data model, traffic and dependencies.',
        a: `**How to answer this:**

Structure your answer around: purpose → APIs → data model → traffic numbers → dependencies → what made it challenging.

**Example framework:**
- "I owned the Order Service in our multi-tenant agri-input SaaS platform."
- **APIs:** REST endpoints — \`POST /orders\`, \`GET /orders/{id}\`, \`PATCH /orders/{id}/status\`
- **Data model:** \`orders\` table (id, tenant_id, status, created_at), \`order_items\` (FK to orders, product_id, quantity, price). Soft-delete with \`deleted_at\`. Multi-tenancy enforced via Hibernate filter on tenant_id.
- **Traffic:** ~200 orders/day per tenant, ~15 tenants → peak ~50 req/min; nothing extreme but correctness was critical (financial transactions).
- **Dependencies:** upstream — React frontend via REST; downstream — Inventory Service (stock check, synchronous), Payment Service (charge, synchronous), Notification Service (order confirmation, async via Kafka).
- **Challenges:** ensuring the inventory reservation and payment charge were atomic despite being two separate services → solved with Saga + Outbox pattern.`,
      },
      {
        q: 'Describe a production incident you resolved. What was the root cause and permanent fix?',
        a: `**How to answer this:**

Use the structure: **What happened → Impact → How you investigated → Root cause → Immediate fix → Permanent fix → What you changed in process.**

**Example:**
- **What happened:** 2 AM alert — error rate on Order API spiked to 15%, P99 latency jumped from 300ms to 8s.
- **Investigation:** Distributed traces showed the bottleneck was in the DB layer. Checked RDS slow query log — a query doing \`SELECT * FROM order_items WHERE order_id IN (...)\` was doing a full table scan.
- **Root cause:** a recent migration added a new column to \`order_items\` and the \`CREATE INDEX\` ran on production during peak hours, locking the table.
- **Immediate fix:** killed the index creation; queries returned to normal latency.
- **Permanent fix:** used \`CREATE INDEX CONCURRENTLY\` (non-blocking); added it to a maintenance window; wrote a checklist for schema changes in production.
- **Process change:** added a mandatory slow-query review step before any migration merges to main.`,
      },
      {
        q: 'What performance improvement did you deliver? How did you measure before and after?',
        a: `**How to answer this:**

Be specific about the metric, the baseline, the change, and the result.

**Example:**
- **Problem:** the Sales Report endpoint took 4–6 seconds for tenants with large datasets. Users were complaining.
- **Measurement before:** P95 = 5.8s, P99 = 9s. Measured via CloudWatch / Actuator metrics + Jaeger traces.
- **Investigation:** traces showed 90% of time was in a single JPQL query doing N+1: loading all sales records, then lazy-loading line items one by one.
- **Change:** replaced lazy loading with \`LEFT JOIN FETCH\` on line items; added a composite index on \`(tenant_id, created_at)\` to avoid full scans; added pagination (default 100 records).
- **Measurement after:** P95 = 180ms, P99 = 420ms. 97% reduction in P95 latency.
- **Side effect:** reduced DB CPU from 70% to 15% during report generation peak.`,
      },
      {
        q: 'How did you handle database schema changes without downtime?',
        a: `**Strategy: expand-contract (also called parallel change).**

**Step 1 — Expand:** add the new column/table as nullable or with a default. Deploy. No breaking change.
**Step 2 — Migrate:** backfill existing rows in batches (never one giant UPDATE). Deploy code that writes to both old and new columns.
**Step 3 — Contract:** once all rows are migrated and old code is gone, drop the old column in a future release.

**Tools:**
- **Flyway / Liquibase:** version-controlled, repeatable migrations that run on startup
- \`CREATE INDEX CONCURRENTLY\` — builds indexes without table lock (PostgreSQL)
- Avoid: \`ALTER TABLE ... NOT NULL\` without a default on a large table (locks), renaming columns (use add-new + migrate + drop-old)

**Blue-green deployments** help: deploy new code to green while blue is live; run migration against the shared DB; swap traffic. Both old and new code must work with the intermediate schema simultaneously.`,
      },
      {
        q: 'Explain a design decision you changed after discovering a scaling or reliability issue.',
        a: `**How to answer this:**

Show that you can recognise when a design is wrong and change it pragmatically.

**Example:**
- **Original design:** Order Service called Inventory Service and Payment Service synchronously (REST) in the same request thread. Simple and easy to reason about.
- **Problem discovered:** when Payment Service had a 5-second timeout spike, Order Service threads piled up waiting → thread pool exhausted → Order Service became unavailable even for requests not needing payment.
- **Decision changed:** moved to asynchronous processing. Order creation returns 202 immediately with an order ID. A Kafka consumer picks up the event and coordinates inventory reservation + payment in a Saga. Order status is polled or pushed via WebSocket.
- **Trade-off accepted:** eventual consistency — the order is "pending" for a few seconds. This was acceptable and explained to the product team.
- **Result:** Order Service P99 dropped from 8s (during payment degradation) to 120ms consistently. Payment failures no longer affect order creation throughput.`,
      },
      {
        q: 'How do you review code, mentor engineers and ensure quality across multiple services?',
        a: `**Code reviews:**
- Review for correctness first, then performance, then style
- Ask "why" questions rather than making demands — creates learning moments
- Approve with comments for nitpicks; block only for correctness or security issues
- Keep PR sizes small (< 400 lines) — large PRs get rubber-stamped

**Mentoring:**
- Pair programming on complex problems — don't just hand over solutions
- Ask questions: "what happens if this service is down?", "how would you test this?"
- Share post-mortems and architecture decision records (ADRs) — context builds judgment
- Give specific, actionable feedback: "this query will N+1 because..." rather than "improve the query"

**Quality across services:**
- **Shared standards:** ADRs, coding guidelines, API design conventions in a team wiki
- **Templates and scaffolding:** service templates with logging, metrics, health checks, security already wired — reduces inconsistency
- **Contract testing (Pact):** ensures API changes don't break consumers without coordination
- **Observability standards:** every service must expose health check, structured logs with correlationId, and key business metrics — enforced at PR review`,
      },
    ],
  },
];
