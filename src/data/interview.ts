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
];
