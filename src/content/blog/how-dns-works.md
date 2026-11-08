---
title: "How DNS Actually Works — Step by Step"
description: "What really happens when your app calls api.farmerapp.com — every actor, every step, caching, TTL, record types, security, and what breaks in production."
date: 2026-08-29
tags: ["dns", "networking", "backend", "infrastructure", "system-design"]
---

## Why DNS matters

Every request your application makes to `api.farmerapp.com` starts with one question: what network address does this name use?

DNS answers that question. It translates human-friendly names into the records clients need before they can connect.

DNS sits before almost every network connection. If DNS is slow, wrong, blocked, or misconfigured, the application may never receive the request at all.

DNS is also cached by design. That makes it fast and scalable — but it also means changes are not instant everywhere.

---

## The sequence diagram

![DNS resolution sequence for api.farmerapp.com — full flow from application through stub resolver, recursive resolver, root, TLD, and authoritative DNS](/dns-resolution-sequence.svg)

---

## How DNS is organised — the tree

DNS is a tree.

```
.                          ← root
└── com                    ← TLD
    └── farmerapp          ← your domain
        └── api            ← your subdomain
```

The root points resolvers to TLD servers (`.com`, `.org`, `.net`).
The `.com` registry points resolvers to the name servers for `farmerapp.com`.
Those name servers hold the actual records.

Each handoff is called a **delegation** — "ask these name servers for the next part of the answer."

There are 13 logical root server names (A through M). Each is served by many physical machines worldwide using anycast, so clients reach a nearby instance.

---

## The actors

Most applications do not talk to the final DNS server directly. There are several layers involved.

| Actor | What it is |
|---|---|
| **Application** | Your Spring Boot service, browser, or any program making a network call |
| **Stub Resolver** | The small DNS client built into the OS or runtime. Forwards queries, does not recurse |
| **Recursive Resolver** | Does the full lookup on your behalf — your ISP, company resolver, or a public resolver like `1.1.1.1` or `8.8.8.8` |
| **Root Server** | Knows where every TLD server is. Returns referrals only |
| **TLD Server** | Holds the NS records for every registered domain under `.com` |
| **Authoritative DNS** | Your DNS — the source of truth for `farmerapp.com`. Holds A, CNAME, MX, TXT records |

Common recursive resolvers:
- ISP resolvers
- Enterprise / corporate resolvers
- Cloud VPC resolvers (AWS Route 53 Resolver, GCP Cloud DNS)
- Kubernetes DNS (`kube-dns` / CoreDNS)
- Public resolvers: Cloudflare `1.1.1.1`, Google `8.8.8.8`

---

## Step by step — resolving api.farmerapp.com

### Step 1 — Application asks the OS

```
Application → OS stub resolver
"resolve api.farmerapp.com"
```

Your application calls a system function like `getaddrinfo("api.farmerapp.com")`.
It hands the problem to the OS and blocks until it gets an IP back.
The app has no idea what happens next.

---

### Step 2 — Stub resolver asks the recursive resolver

```
Stub resolver → Recursive resolver
"Query A / AAAA for api.farmerapp.com"
```

The stub resolver checks its own tiny local cache first.
On a cache hit — TTL still valid — it returns immediately. No network call.

On a cache miss, it forwards the query to the **recursive resolver** configured on the machine (via DHCP, VPN, `/etc/resolv.conf`, or platform settings).

An **A record** is IPv4. An **AAAA record** is IPv6. The stub asks for both.

---

### Step 3 — Recursive resolver asks the Root

```
Recursive resolver → Root server
"Where is .com?"
```

The recursive resolver also checks its cache. On a miss it starts at the top of the tree.

It asks a root server: "I need to resolve `api.farmerapp.com`. Where do I find `.com`?"

The root does not know the IP. It only knows where the `.com` TLD servers are.

---

### Step 4 — Root returns a referral

```
Root → Recursive resolver
"Ask the .com name servers — here are their addresses"
```

This is a **referral**, not an answer. The root says "I don't know, but go ask these servers."

The resolver caches the `.com` NS records and moves on.

---

### Step 5 — Recursive resolver asks the TLD

```
Recursive resolver → TLD (.com) server
"Where is farmerapp.com?"
```

The TLD server knows which name servers are registered for `farmerapp.com` — that information was submitted when the domain was registered at a registrar.

---

### Step 6 — TLD returns the authoritative name servers

```
TLD → Recursive resolver
"NS records for farmerapp.com: ns1.farmerapp.com, ns2.farmerapp.com"
```

Another referral. The resolver caches these NS records and moves to the final step.

---

### Step 7 — Recursive resolver asks the Authoritative DNS

```
Recursive resolver → Authoritative DNS
"Resolve api.farmerapp.com"
```

The authoritative DNS server is the one your team controls — Route 53, Cloudflare, or any DNS provider. It is the source of truth. It holds the definitive records for `farmerapp.com`.

---

### Step 8 — Authoritative DNS returns the record and TTL

```
Authoritative DNS → Recursive resolver
A  203.0.113.42  TTL 300
```

The authoritative server returns:
- **Record type** — `A` (IPv4)
- **Value** — `203.0.113.42`
- **TTL** — `300` seconds (5 minutes)

TTL tells every resolver along the chain how long it may cache this answer.

---

### Step 9 — Recursive resolver caches and replies

```
Recursive resolver → Stub resolver
"203.0.113.42"
```

The resolver stores the answer with a 5-minute expiry and returns the IP.

Every other client behind the same recursive resolver benefits from this cache — they skip steps 3–8 entirely until the TTL expires. This is why authoritative DNS providers do not see every single user request — they only see cache misses.

---

### Step 10 — Application gets the address

```
Stub resolver → Application
"203.0.113.42"
```

The OS returns the IP. Your app opens a TCP connection to `203.0.113.42` and the HTTP request goes out.

The full 10-step resolution typically takes **20–120 ms** on first lookup.
Cached lookups return in **under 1 ms**.

---

## Query types — recursive vs iterative

DNS uses two query patterns.

| Type | Who uses it | Behaviour |
|---|---|---|
| **Recursive** | Client → recursive resolver | "Find the final answer for me" |
| **Iterative** | Recursive resolver → root / TLD / authoritative | "Here is the next server to ask" |

Your app sends a **recursive** query to its resolver. The resolver uses **iterative** queries against the DNS tree. This distinction matters when debugging.

If `dig @8.8.8.8 api.farmerapp.com` works but `dig @ns1.farmerapp-dns.com api.farmerapp.com` fails — the public resolver is returning a cached answer while the authoritative server is broken.

---

## DNS record types

| Record | Purpose | Example |
|---|---|---|
| `A` | IPv4 address | `api.farmerapp.com → 203.0.113.42` |
| `AAAA` | IPv6 address | `api.farmerapp.com → 2001:db8::10` |
| `CNAME` | Alias to another name | `www.farmerapp.com → farmerapp.com` |
| `MX` | Mail routing | `farmerapp.com → mail.farmerapp.com` |
| `TXT` | Text — SPF, DKIM, domain verification | SPF policy string |
| `NS` | Delegates a zone to name servers | `farmerapp.com → ns1.provider.net` |
| `SOA` | Zone ownership and timing metadata | Serial, refresh, retry, negative TTL |
| `CAA` | Restricts which CAs may issue certificates | `letsencrypt.org` |

**Two practical notes:**

1. A `CNAME` points to another name, not an IP. After seeing a CNAME the resolver still has to resolve the target — that is an extra round trip.

2. You cannot put a `CNAME` at the root domain (`farmerapp.com`) when SOA and NS records already exist there. This is a DNS protocol rule. Many providers work around it with proprietary record types — ALIAS, ANAME, CNAME flattening.

---

## TTL — the most important number

TTL (Time To Live) is set by you on the authoritative server. It controls how long resolvers cache your record.

```
A  api.farmerapp.com  203.0.113.42  TTL 300
```

| TTL | Behaviour | Tradeoff |
|---|---|---|
| `30–60 s` | Fast changes and failover | More DNS query volume |
| `300–600 s` | Good default for most records | Changes are not immediate |
| `3600+ s` | Cache-friendly, stable | Poor fit for active traffic shifts |

**Low TTL does not mean instant change.** Existing caches keep old answers until they expire. Some resolvers enforce their own minimum TTLs. Some clients cache answers at startup and never refresh.

### Migration strategy

Lower TTL to 60 *before* you plan to change an IP. Wait for the old (longer) TTL to expire everywhere. Then make the change. Raise TTL back once stable.

Do not lower the TTL at the same moment you need the change — resolvers that already cached the old longer TTL will keep the old answer until it expires.

---

## Negative caching

DNS also caches **failures**. If a resolver gets `NXDOMAIN` ("this name does not exist"), it caches that failure for the duration set in the SOA's negative TTL.

This matters during rollouts. If clients look up `new-api.farmerapp.com` before you create the record, they cache the failure and keep failing for a while even after the record exists.

Keep the SOA negative TTL low (60–300 s) in development environments.

---

## CNAME chains

CNAME chains add extra lookup steps:

```
api.farmerapp.com  →  CNAME  edge.cdn-provider.net
                              ↓
                        CNAME  regional.cdn-provider.net
                              ↓
                        A  203.0.113.42
```

Short chains are normal. Long chains add latency, create more places to fail, and make migrations harder to reason about.

---

## DNS-based traffic steering

DNS can return different answers for the same hostname based on:
- **Weighted records** — send 10% to canary, 90% to stable
- **Geo-based** — return the nearest regional endpoint
- **Latency-based** — return the lowest-latency endpoint
- **Health-check failover** — stop returning an IP when health checks fail

DNS steering is useful but it is a broad tool. It happens when the name is resolved, not on each request. A resolver may cache one answer and reuse it for many clients. DNS does not know CPU load, connection count, queue depth, or HTTP path.

**Rule:** Use DNS to choose a global or regional entry point. Use load balancers, gateways, and application routers for per-request decisions.

Example for `farmerapp.com`:
- DNS routes `api.farmerapp.com` to the nearest healthy region
- The load balancer behind that address decides which backend handles the request

---

## Security

### DNSSEC

DNSSEC signs DNS records so resolvers can verify the answer came from the domain owner and was not tampered with in transit.

DNSSEC does **not** encrypt DNS queries. Someone watching the network can still see which name is being queried. Operationally, broken signatures or expired keys can make a domain fail DNS validation even when the application is healthy.

### DoT and DoH

DNS over TLS (DoT, port 853) and DNS over HTTPS (DoH, port 443) encrypt the traffic between the client and the recursive resolver.

They protect the query path from snooping. They do not hide queries from the recursive resolver itself, and they do not replace DNSSEC.

### Cache poisoning

Cache poisoning tries to trick a resolver into caching a fake answer. Modern resolvers defend against this with random query IDs, random source ports, strict checks on which servers may answer, and DNSSEC validation.

For application teams the lesson is: use reputable DNS providers, enable DNSSEC if you can operate it correctly, protect registrar account access, and monitor domain and certificate changes.

---

## Private DNS

DNS is not only for the public internet. Private DNS is essential in:

- Cloud VPCs (AWS Route 53 private zones, GCP Cloud DNS)
- Kubernetes clusters (CoreDNS)
- Corporate networks
- VPN environments
- Service meshes

**Split-horizon DNS** means the same name can return one answer inside a private network and a different answer outside it. `api.farmerapp.com` might resolve to a private IP on the VPN and a public load balancer IP everywhere else.

**ndots** is a resolver setting that controls when a name is treated as complete versus when search domains are appended. A surprising `ndots` value can turn one DNS lookup into several.

In Kubernetes, DNS is the common service discovery interface. But high-traffic systems still need to understand caching, connection reuse, and service mesh behaviour. Resolving a name on every request is usually a bad design.

---

## What breaks in production

### 1. TTL too high during a migration

You move `api.farmerapp.com` to a new server. Old TTL was 86400. Some users keep hitting the old IP for up to 24 hours.

**Fix:** Lower TTL to 60 before migrations. Wait. Migrate. Raise TTL back.

### 2. Negative caching after a bad rollout

You create `new-api.farmerapp.com` after clients have already queried it and cached `NXDOMAIN`.

**Fix:** Keep SOA negative TTL low in dev. In production, wait for the negative cache to expire before expecting the record to be universally visible.

### 3. JVM DNS caching (Java / Spring Boot specific)

The JVM caches DNS results on top of the OS cache. By default some JDKs cache successful lookups **forever** (`networkaddress.cache.ttl = -1`).

If your load balancer IP changes, your Spring Boot app may keep connecting to the old IP indefinitely.

```java
// Check the current setting
System.out.println(java.security.Security.getProperty("networkaddress.cache.ttl"));
```

**Fix:** Set a sensible TTL in your JVM startup options:

```bash
-Dnetworkaddress.cache.ttl=30
-Dnetworkaddress.cache.negative.ttl=5
```

Or in code at application startup:

```java
java.security.Security.setProperty("networkaddress.cache.ttl", "30");
```

### 4. DNS-based load balancing defeated by long app-side caches

Some architectures return different IPs on each DNS query to spread load. A Spring Boot app with `networkaddress.cache.ttl=-1` defeats this entirely — it pins to one IP and never rotates.

---

## Debugging DNS

```bash
# Basic lookup
dig api.farmerapp.com

# Query a specific resolver
dig @8.8.8.8 api.farmerapp.com

# Query the authoritative server directly (bypasses cache)
dig @ns1.farmerapp.com api.farmerapp.com

# Check TTL on a cached answer
dig +ttlunits api.farmerapp.com

# Trace the full resolution path
dig +trace api.farmerapp.com

# Check SOA (negative TTL is the last number)
dig SOA farmerapp.com
```

When debugging production DNS, compare answers from:
- Public resolver vs corporate resolver
- Inside VPC vs outside VPC
- Authoritative answer vs cached recursive answer
- A and AAAA records separately
- Command-line resolver vs application runtime behaviour

| Symptom | Likely cause |
|---|---|
| `NXDOMAIN` | Name does not exist, wrong zone, or cached failure |
| `SERVFAIL` | DNSSEC failure, authoritative outage, or resolver issue |
| Slow first request | Slow DNS lookup, long CNAME chain, or resolver problem |
| Some users reach old endpoint | Old answers still cached somewhere |
| Works on VPN, not outside | Private DNS or split-horizon dependency |
| Browser works, backend fails | Different resolver path or JVM DNS cache |

---

## Best practices

**Use stable names, not hard-coded IPs.**

```java
// Good
String host = "api.farmerapp.com";

// Bad
String host = "203.0.113.42";
```

Names let you move services, replace infrastructure, change providers, and issue certificates without changing application config.

**Separate DNS from request routing.**

DNS is the right place to choose a region or entry point. It is not the right place to choose the exact backend for each request. Use load balancers, API gateways, and service discovery for per-request decisions.

**Plan TTLs before migrations.** Lower → wait → change → raise.

---

## The interview answer

> "DNS translates a hostname to a typed record. The application asks the OS stub resolver. The stub checks its cache, then forwards to a recursive resolver on a miss. The recursive resolver walks the DNS hierarchy iteratively: root → TLD → authoritative name server. Each step returns a referral until the authoritative server returns the actual record and TTL. The resolver caches the answer — cache hits skip the whole chain. TTL controls propagation speed: low TTL means fast propagation but more DNS queries; high TTL means fewer queries but slow rollout of IP changes. DNS can steer traffic broadly at resolution time, but per-request routing belongs behind the load balancer."

---

## Key concepts summary

| Concept | What it means |
|---|---|
| Stub resolver | OS DNS client — forwards queries, minimal caching |
| Recursive resolver | Does the full lookup on your behalf |
| Root server | Top of the tree — returns referrals to TLD servers |
| TLD server | Returns NS records for registered domains under `.com` |
| Authoritative DNS | Your DNS — holds A, CNAME, MX, TXT records |
| A / AAAA | IPv4 / IPv6 address records |
| CNAME | Alias — points to another name, not an IP |
| TTL | How long resolvers may cache the answer |
| Referral | "I don't know, ask these servers" |
| Negative cache | Failure responses are cached too — NXDOMAIN persists |
| DNSSEC | Signs records for tamper detection — does not encrypt |
| DoT / DoH | Encrypts the query path — does not replace DNSSEC |
| Split-horizon | Same name, different answers inside vs outside a network |
| JVM DNS cache | Java caches DNS on top of the OS — set `networkaddress.cache.ttl` |
