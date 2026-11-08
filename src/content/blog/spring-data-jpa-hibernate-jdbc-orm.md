---
title: "Understanding Spring Data JPA, Hibernate, JDBC and ORM: What Actually Happens Behind the Scenes?"
description: "JDBC, JPA, Hibernate, Spring Data JPA — they all seem to communicate with a database, but they solve different problems. Here's how they fit together."
date: 2026-11-08
tags: ["java", "spring-boot", "jpa", "hibernate", "backend"]
---

When I started learning Spring Boot and JPA, I came across several terms:

- JDBC
- JPA
- Hibernate
- Spring Data JPA
- JpaRepository
- EntityManager
- ORM

Initially, they all seemed to do the same thing: communicate with a database.

But they actually solve different problems.

Let's understand how they fit together.

---

## Architecture diagram

![From JDBC to Spring Data JPA — the complete picture showing JPA, Hibernate, ORM, architecture flow, save() internals, EntityManager vs Session, and technology stack relationship](/jdbc-to-spring-data-jpa-architecture.png)

---

## 1. First, understand the problem

Imagine we're building an Employee Management System.

We have a Java object:

```java
Employee employee = new Employee();
employee.setId(101L);
employee.setName("Krishna");
employee.setSalary(100000.0);
```

And a corresponding database table:

| id  | name    | salary    |
|-----|---------|-----------|
| 101 | Krishna | 100000    |

Our application needs to perform CRUD operations: create employees, read employee details, update employee information, and delete employees.

The fundamental challenge is:

**How do we convert Java objects into database records and database records back into Java objects?**

This is where JDBC, JPA, and ORM come into the picture.

---

## 2. JDBC – The foundation of database connectivity

JDBC stands for Java Database Connectivity. It is a Java API that allows applications to communicate with relational databases. Using JDBC, we can execute SQL directly:

```java
String sql = "INSERT INTO employee (id, name, salary) VALUES (?, ?, ?)";

Connection connection = dataSource.getConnection();

PreparedStatement statement =
    connection.prepareStatement(sql);

statement.setLong(1, 101L);
statement.setString(2, "Krishna");
statement.setDouble(3, 100000.0);

statement.executeUpdate();
```

This works perfectly. However, imagine writing this code for hundreds of database operations. We repeatedly need to:

- Write SQL queries
- Set query parameters
- Execute statements
- Read `ResultSet` objects
- Convert database records into Java objects
- Manage connections and resources

This introduces a lot of repetitive code. JDBC provides database connectivity, but it doesn't automatically manage object-relational mapping for us.

---

## 3. ORM – Object Relational Mapping

ORM stands for Object Relational Mapping. It provides a mechanism to map Java objects to relational database structures.

Java class:

```java
public class Employee {
    private Long id;
    private String name;
    private Double salary;
}
```

Database table:

```sql
CREATE TABLE employee (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    salary DOUBLE PRECISION
);
```

ORM maps:

- Java class → Database table
- Java object → Database row
- Java field → Database column

Instead of manually converting every database record into a Java object, an ORM framework handles much of this work.

Hibernate is one of the most popular ORM frameworks in Java.

---

## 4. JPA – The specification

JPA stands for Java Persistence API (now Jakarta Persistence).

**JPA is a specification, not an implementation.**

It defines a standard programming model for managing persistent Java objects. It provides concepts and APIs such as `@Entity`, `@Id`, `EntityManager`, `EntityTransaction`, and persistence operations.

```java
@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Double salary;
}
```

JPA defines how these annotations and persistence operations should behave. But we still need an implementation to execute the underlying persistence operations.

---

## 5. Hibernate – The implementation

Think of JPA as a contract and Hibernate as an implementation of that contract.

Similar to Java interfaces:

```java
public interface PaymentService {
    void pay();
}
```

The interface defines what should be implemented. A concrete class provides the implementation.

Similarly:
- JPA defines the persistence contract
- Hibernate implements that contract

Other JPA implementations exist too, such as EclipseLink.

Hibernate handles:
- Entity lifecycle management
- Object-relational mapping
- SQL generation
- Dirty checking
- Persistence context management
- Database interaction through JDBC

```java
entityManager.persist(employee);
```

We call the standard JPA API, while Hibernate performs the underlying persistence work.

---

## 6. Spring Data JPA – Less boilerplate, more productivity

Even with JPA and Hibernate, we could still end up writing repetitive repository implementations:

```java
@Repository
public class EmployeeRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public void save(Employee employee) {
        entityManager.persist(employee);
    }

    public Employee findById(Long id) {
        return entityManager.find(Employee.class, id);
    }
}
```

Imagine implementing these methods for every entity. Spring Data JPA solves this problem.

We can simply write:

```java
public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {
}
```

No manual CRUD implementation required. Spring Data JPA provides `save()`, `findById()`, `findAll()`, `deleteById()`, `count()`, `existsById()`, pagination, and sorting out of the box.

It can also derive queries from method names:

```java
List<Employee> findByName(String name);

List<Employee> findBySalaryGreaterThan(Double salary);
```

Spring Data JPA creates a runtime repository proxy and delegates the operations to `SimpleJpaRepository`.

---

## 7. What actually happens when we call save()?

This is where everything connects.

```java
employeeRepository.save(employee);
```

Here is the internal flow:

1. Spring Data JPA repository proxy receives the call
2. It delegates to `SimpleJpaRepository`
3. `SimpleJpaRepository` checks whether the entity is new
4. If new, it calls `EntityManager.persist()`
5. Otherwise, it calls `EntityManager.merge()`
6. Hibernate manages the entity and prepares the required SQL
7. Hibernate uses JDBC to execute SQL through the database driver
8. The database performs the operation

Simplified internal implementation:

```java
@Transactional
public <S extends T> S save(S entity) {

    if (entityInformation.isNew(entity)) {
        entityManager.persist(entity);
        return entity;
    }

    return entityManager.merge(entity);
}
```

One important detail: calling `save()` does not necessarily mean SQL executes immediately. Hibernate uses a mechanism called **flushing**. SQL execution can be delayed until an explicit flush, transaction commit, or certain queries that require synchronization with the database.

Also, flush and commit are different:
- **Flush** synchronizes changes with the database
- **Commit** completes the database transaction

---

## 8. EntityManager vs Hibernate Session

| EntityManager | Session |
|---|---|
| JPA standard API | Hibernate native API |
| Provider-independent | Hibernate-specific |
| `persist()`, `merge()`, `find()`, `remove()` | Same methods plus Hibernate-specific ones |

When Hibernate is the JPA provider, its `Session` implementation also implements the `EntityManager` contract.

We can access Hibernate's native Session through:

```java
Session session =
    entityManager.unwrap(Session.class);
```

In normal Spring Boot applications, prefer `EntityManager` unless you specifically need Hibernate-specific functionality.

---

## 9. The complete architecture

```
Controller
    |
    v
Service
    |
    v
Repository Interface
    |
    v
Spring Data JPA Proxy
    |
    v
SimpleJpaRepository
    |
    v
JPA EntityManager
    |
    v
Hibernate
    |
    v
JDBC
    |
    v
JDBC Driver
    |
    v
PostgreSQL / MySQL
```

Each technology has a different responsibility:

| Technology | Responsibility |
|---|---|
| JDBC | Database connectivity |
| ORM | Object-relational mapping concept |
| JPA | Persistence specification |
| Hibernate | JPA implementation and ORM |
| EntityManager | Standard entity persistence API |
| Spring Data JPA | Repository abstraction and automation |
| JpaRepository | Ready-made repository contract |

---

## 10. My key takeaway

The biggest learning for me is that these technologies are not competitors or replacements for one another. They operate at different abstraction levels:

- JDBC provides low-level database connectivity
- JPA defines a standard persistence API
- Hibernate implements that API and handles ORM
- Spring Data JPA makes repository development easier by eliminating repetitive code

Understanding these layers makes it easier to debug database issues, understand SQL execution, work with transactions, and optimize application performance.

Don't just learn Spring Boot annotations. Understand what happens behind them.
