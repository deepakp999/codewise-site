---
title: "SAP System Landscape — Dev, Quality, and Production"
description: "Understand the three-system SAP landscape, how transports move code from development to production, and the client concept."
order: 2
module: "sap-orientation"
module_title: "SAP & ABAP Orientation"
tags: ["abap", "sap", "landscape", "transport", "beginner"]
prev_slug: "what-is-sap-and-abap"
next_slug: "navigating-sap-gui"
---

# SAP System Landscape — Dev, Quality, and Production

## What You'll Learn
- Why SAP uses a three-system landscape (dev → QA → prod)
- What the transport system is and how code moves between systems
- What clients are and how they isolate data
- How this compares to Git-based deployment workflows you already know

## The Three-System Landscape

In web development, you might deploy code like this:
```
laptop → git push → GitHub → CI/CD → staging → production
```

SAP does something similar, but with its own terminology and a much more rigid process:

```
DEV (Development)  →  QAS (Quality Assurance)  →  PRD (Production)
     Write code          Test it                    Users use it
```

Each of these is a separate SAP system — its own server, its own database, its own copy of SAP. They're connected by the **transport system**, which is SAP's version of a deployment pipeline.

### Why Three Systems?

The same reason you don't test in production. SAP runs mission-critical business processes — payroll, financial reporting, supply chain. A bug in production can mean employees don't get paid or financial statements are wrong. The three-system landscape ensures:

- **DEV** — developers write and test code freely. Breaking things here is expected.
- **QAS** — business users test the changes with real-like data. Bugs caught here don't affect real operations.
- **PRD** — the live system. Only tested, approved code reaches here.

**You NEVER write code directly in production.** In SAP, this isn't just a best practice — the system physically prevents it. Production systems are locked for development.

## The Transport System

When you finish writing code in DEV, you don't copy files. You create a **transport request** — a container that holds your changes. Think of it like a commit + pull request + deployment package, all in one.

```
Developer writes code in DEV
    ↓
Creates a transport request (like a commit)
    ↓
Releases the transport (like pushing to a branch)
    ↓
Transport is imported to QAS (like deploying to staging)
    ↓
Business users test in QAS
    ↓
Transport is imported to PRD (like deploying to production)
```

### Transport Request Anatomy

A transport request has:
- A unique ID (e.g., `DEVK900123`)
- An owner (the developer)
- A description ("Add custom pricing validation for US orders")
- One or more tasks (sub-items, one per developer if it's a team effort)
- Objects (the actual code, tables, configurations being transported)

```abap
* You'll see transport requests when you create or modify objects
* SAP asks: "Assign to which transport request?"
* You either create a new one or add to an existing one
```

### Key Rule: Transports Only Move Forward

```
DEV → QAS → PRD     ✓  Forward — this is how it works
PRD → DEV            ✗  Never — you don't import production into development
QAS → DEV            ✗  Never — changes don't flow backward
```

If you need to fix a bug found in QAS, you fix it in DEV, create a new transport, and move it forward again.

## Clients — Data Isolation Within a System

Each SAP system has multiple **clients** — think of them as isolated tenants sharing the same system. Each client has its own data but shares the same code.

```
DEV System
├── Client 100 — Development (your main workspace)
├── Client 200 — Unit testing
└── Client 300 — Sandbox (experimental)

QAS System
├── Client 100 — Integration testing
└── Client 200 — User acceptance testing

PRD System
└── Client 100 — Production (live business data)
```

When you log in to SAP, you specify three things:
1. **System** — which SAP system (DEV, QAS, PRD)
2. **Client** — which client within that system (100, 200, etc.)
3. **User** — your username and password

### Client-Dependent vs Client-Independent

- **Client-dependent data** — business data (customers, orders, invoices). Different in every client.
- **Client-independent data** — programs (ABAP code), data dictionary objects. Same across all clients in a system.

This means when you write ABAP code in Client 100 of DEV, it's automatically visible in Client 200 and 300 of DEV too — because code is client-independent. But the business data you test with is separate in each client.

## Comparing to What You Know

```
SAP Concept          Git/DevOps Equivalent
──────────────────   ──────────────────────────
DEV system           Local development environment
QAS system           Staging / pre-production
PRD system           Production
Transport request    Git commit + pull request + deploy
Client               Database schema or tenant
T-code SE09          Git log / PR dashboard
Transport release    Merge + deploy trigger
Basis administrator  DevOps / platform engineer
```

The biggest difference: in Git-based workflows, deployments are automated and fast (seconds to minutes). In SAP, transports can take 10-30 minutes to import and require a **Basis administrator** (SAP's version of a DevOps engineer) to schedule and execute them.

## The Basis Team

You'll hear "Basis" a lot. The Basis team manages the SAP infrastructure:
- Installing and patching SAP systems
- Managing transports between systems
- Monitoring system performance
- Managing user accounts and authorizations
- Database administration

As an ABAP developer, you don't manage infrastructure. You write code in DEV, create transports, and the Basis team imports them to QAS and PRD. This separation exists because SAP systems are complex — a wrong transport to production can bring down an entire company's operations.

## Your First Transport — What to Expect

When you create your first ABAP program (next lesson), SAP will immediately ask you for a transport request. Here's the flow:

1. Open SE38 (ABAP Editor) in the DEV system
2. Create a new program `Z_MY_FIRST_PROGRAM`
3. SAP prompts: "Assign to transport request?"
4. You either create a new request or use an existing one
5. Write your code, activate it (compile)
6. Test it in DEV
7. When ready, release the transport via SE09 (Transport Organizer)

Don't worry about transports too much right now — we'll handle them naturally as we write programs. Just understand that every change you make is tracked and packaged for deployment.

## The "Z" and "Y" Naming Convention

SAP reserves certain naming prefixes:
- **No prefix** — SAP standard objects (you can't modify these)
- **Z** or **Y** prefix — custom objects (your code goes here)

When you create a program, table, function module, or class, the name must start with Z or Y. This ensures your custom code never conflicts with SAP's standard code, even after upgrades.

```abap
* SAP standard program — you can look but not touch
REPORT SAPMV45A.  " Standard sales order program

* Your custom program — you own this
REPORT Z_CUSTOM_SALES_REPORT.
```

## Common Mistakes

- **Developing in the wrong client.** If you accidentally log into Client 200 (testing) instead of Client 100 (development), your code changes are still visible (code is client-independent), but your test data configurations might be different. Always check which client you're in.
- **Forgetting to release the transport.** You can write code all day, but if you don't release the transport request, nothing moves to QAS. Unreleased transports are the SAP equivalent of uncommitted code.
- **Creating too many transport requests.** Each transport is a deployment unit. If you create 50 transports for one feature, the Basis team has to import 50 transports in the right order. Group related changes into one transport.

## Key Takeaways

- SAP uses a three-system landscape: DEV → QAS → PRD. Code only moves forward.
- The transport system packages your changes and moves them between systems — like a combined commit + deploy.
- Clients isolate data within a system. Code is shared across clients; data is not.
- All custom code starts with Z or Y to avoid conflicts with SAP standard.
- The Basis team manages infrastructure and transports. You write code and create transport requests.

## Next Lesson

You understand the SAP landscape. Now let's actually get inside the system. In **Lesson 3: Navigating SAP GUI and Transaction Codes**, we'll learn how to use the SAP interface — the transaction codes, the menu system, and the key tools you'll use every day as an ABAP developer.
