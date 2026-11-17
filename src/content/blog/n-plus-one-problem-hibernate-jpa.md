---
title: "Understanding the N+1 Problem in Hibernate / JPA – A Hidden Performance Killer"
description: "ORM frameworks like Hibernate make database interactions look simple. But lazy loading can silently fire hundreds of queries. Here's what the N+1 problem is and how to fix it."
date: 2026-11-08
tags: ["java", "spring-boot", "jpa", "hibernate", "backend", "performance"]
---

While learning Spring Boot, Hibernate, and JPA, I recently came across an interesting database performance issue called the **N+1 Query Problem**.

Initially, ORM frameworks like Hibernate make database interactions look simple. We define entity relationships using annotations such as `@OneToMany`, `@ManyToOne`, and `@OneToOne`, and Hibernate handles the underlying SQL.

But there is a catch. Sometimes, this convenience comes at a performance cost.

Let's understand why.

---

## Architecture diagram

![Understanding the Hibernate N+1 Problem — entity relationships, lazy loading query explosion, and solutions using JOIN FETCH, EntityGraph, and batch fetching](/hibernate-n-plus-one-problem.png)

---

## 🔍 What exactly is the N+1 problem?

Imagine we have two entities: `Department` and `Employee`. One department can have multiple employees.

```java
@Entity
public class Department {

    @Id
    private Long id;

    private String name;

    @OneToMany(mappedBy = "department")
    private List<Employee> employees;
}
```

```java
@Entity
public class Employee {

    @Id
    private Long id;

    private String name;

    @ManyToOne
    private Department department;
}
```

Now, imagine we execute the following code:

```java
List<Department> departments =
    departmentRepository.findAll();

for (Department department : departments) {
    System.out.println(
        department.getEmployees().size()
    );
}
```

Seems perfectly fine, right? But let's look at what happens internally.

---

## ⚠️ What happens behind the scenes?

Assume we have 100 departments.

**Step 1:** Hibernate executes one query to fetch all departments.

```sql
SELECT * FROM department;
```

**Step 2:** When we access `department.getEmployees()`, Hibernate executes another query for each department.

```sql
SELECT * FROM employee WHERE department_id = 1;

SELECT * FROM employee WHERE department_id = 2;

SELECT * FROM employee WHERE department_id = 3;

-- And so on...
```

The result?

- 1 query to fetch departments
- N queries to fetch employees

**Total = 1 + N queries.**

For 100 departments, that's potentially 101 database queries. Now imagine this happens in a production application with thousands of records and multiple concurrent API requests.

The performance impact can be significant.

---

## 🛠️ How can we solve the N+1 problem?

There are multiple approaches.

**1. JOIN FETCH**

Fetch the parent and associated entities in a single SQL query.

```java
@Query("""
    SELECT d
    FROM Department d
    LEFT JOIN FETCH d.employees
    """)
List<Department> findAllWithEmployees();
```

Hibernate retrieves departments and employees together instead of executing an additional query for every department.

**2. Entity Graph**

Use JPA's `@EntityGraph` to define which relationships should be fetched eagerly.

```java
@EntityGraph(attributePaths = {"employees"})
List<Department> findAll();
```

This lets us control the fetch plan without hardcoding `JOIN FETCH` in every JPQL query.

**3. Batch Fetching**

Hibernate can fetch associated entities in batches instead of issuing one query per parent.

```java
@BatchSize(size = 50)
@OneToMany(mappedBy = "department")
private List<Employee> employees;
```

This reduces the number of database round trips significantly.

---

## 💡 Key Takeaways

- ORM abstraction doesn't guarantee optimized SQL
- Lazy loading can introduce unexpected database queries
- Eager loading isn't automatically the solution either
- Always inspect the SQL Hibernate generates when investigating performance issues
- Choose fetching strategies based on actual application use cases

**My biggest learning:**

Writing fewer lines of Java code doesn't necessarily mean executing fewer SQL queries.

As backend engineers, we should understand not just how to use JPA and Hibernate, but also what happens underneath the abstraction.

That's where the difference between writing working code and building performant applications begins.
