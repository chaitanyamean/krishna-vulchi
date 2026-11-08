---
title: "Strategy Pattern + Factory Pattern: A Practical Combination in Spring Boot"
description: "Most tutorials explain design patterns in isolation. Here's how combining Strategy and Factory patterns solved a real driver-matching problem in my Spring Boot ride-sharing app."
date: 2026-11-08
tags: ["java", "spring-boot", "design-patterns", "backend", "software-architecture"]
---

Most tutorials explain design patterns in isolation. But the real value becomes clear when you combine them to solve an actual engineering problem.

While building my **Ride-Sharing Application**, I came across an interesting design challenge: driver matching.

---

## Architecture diagram

![Strategy Pattern + Factory Pattern — a practical combination in a ride-sharing app showing the problem, strategy interface, implementations, factory, and caller flow](/strategy-factory-pattern-architecture.png)

---

## 🚗 The Problem

Different rider categories require different driver-matching strategies:

- **Normal Riders:** Prioritize drivers based on proximity.
- **Elite Riders:** Prioritize drivers based on ratings.

The simplest solution would be to introduce conditional logic directly into the matching service:

```java
if (rider.isElite()) {
    // Find drivers based on rating
} else {
    // Find drivers based on proximity
}
```

It works initially. But as business rules grow, the matching service starts accumulating conditional logic.

Adding more rider categories means more conditions, more responsibilities, and harder-to-maintain code.

I wanted a cleaner approach.

---

## 1️⃣ Strategy Pattern — Encapsulate What Changes

First, I introduced a common interface:

```java
public interface DriverMatchingStrategy {

    List<Driver> findMatchingDrivers(
        Location pickup,
        List<Driver> candidates,
        int maxResults
    );
}
```

Then, I implemented separate strategies:

**Proximity-based matching**

```java
@Component
public class ProximityDriverMatchingStrategy
        implements DriverMatchingStrategy {
    // Prioritize nearest drivers
}
```

**Rating-based matching**

```java
@Component
public class RatingBasedDriverMatchingStrategy
        implements DriverMatchingStrategy {
    // Prioritize highest-rated drivers
}
```

Now, each implementation owns its matching algorithm, and the calling service depends only on the interface.

---

## 2️⃣ Factory Pattern — Centralize Strategy Selection

The next question was: **who decides which strategy should be executed?**

That's where the Factory Pattern comes in.

```java
@Component
public class DriverMatchingStrategyFactory {

    private final DriverMatchingStrategy proximityStrategy;
    private final DriverMatchingStrategy ratingBasedStrategy;
    private final RiderRepository riderRepository;

    public DriverMatchingStrategy getStrategy(String riderId) {

        boolean isElite = riderRepository.findById(riderId)
                .map(Rider::isElite)
                .orElse(false);

        return isElite
                ? ratingBasedStrategy
                : proximityStrategy;
    }
}
```

The factory centralizes the decision-making logic instead of spreading it across different services.

---

## 3️⃣ Clean Orchestration — The Caller Doesn't Need to Know

Now the matching service simply delegates:

```java
DriverMatchingStrategy strategy =
        strategyFactory.getStrategy(ride.getRiderId());

List<Driver> drivers = strategy.findMatchingDrivers(
        pickup,
        candidates,
        3
);
```

The matching service doesn't need to know how each strategy works. It only knows the contract.

---

## 💡 What Did I Learn From Combining These Patterns?

| Strategy Pattern | Factory Pattern |
|---|---|
| Encapsulates interchangeable algorithms | Centralizes implementation selection |
| Defines how matching happens | Decides which matching algorithm to use |
| Reduces conditional logic inside algorithms | Reduces selection logic across callers |

**Strategy defines WHAT varies. Factory decides WHICH variation to use.**

Together, they improve separation of concerns and make the design easier to extend and test.

---

One more important takeaway: the current factory uses a simple conditional. If rider categories continue growing, we can evolve it into a registry-based factory or use configuration-driven strategy selection.

That's the difference between implementing a design pattern and designing for future change.

I'm learning these concepts by applying them to real scenarios in my Spring Boot ride-sharing application rather than just studying textbook examples.

🔗 [GitHub Repository](https://github.com/chaitanyamean/ride-sharing-app)
