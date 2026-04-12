---
title: "What Is RAP? The ABAP RESTful Application Programming Model"
description: "Understand the RAP architecture, the three implementation types (managed, unmanaged, query), and how CDS views become interactive business applications."
order: 13
module: "rap-fundamentals"
module_title: "RAP Fundamentals"
tags: ["rap", "abap rap", "restful application programming", "managed", "business object"]
prev_slug: "cds-access-control"
next_slug: "rap-managed-bo"
---

# What Is RAP? The Big Picture

## What You'll Learn
- What RAP is and why SAP created it
- The three-layer architecture: data model, behavior, service
- The three implementation types: managed, unmanaged, query
- How RAP connects to everything you've learned so far
- A visual map of all RAP artifacts

## The Problem RAP Solves

You've built CDS views that model TechMart's data beautifully. But CDS views are read-only. Users can't create a new sales order, update a status, or delete a cancelled order through a CDS view alone.

In Classic ABAP, you'd solve this with BAPIs, function modules, and dynpro transactions — writing hundreds of lines of boilerplate for CRUD operations, locking, authorization, validation, and error handling.

RAP eliminates that boilerplate. You define WHAT your business object does (create, update, delete, validate, execute actions), and the framework handles HOW — the OData service generation, the locking mechanism, the draft handling, the transaction management.

## The Three-Layer Architecture

Every RAP application has three layers:

```
┌──────────────────────────────────────────┐
│  Layer 3: SERVICE                        │
│  Service Definition + Service Binding    │
│  → Exposes the BO as OData V2/V4        │
│  → Consumed by Fiori, external systems   │
├──────────────────────────────────────────┤
│  Layer 2: BEHAVIOR                       │
│  Behavior Definition + Implementation    │
│  → Defines CRUD, validations, actions    │
│  → Business logic lives here             │
├──────────────────────────────────────────┤
│  Layer 1: DATA MODEL                     │
│  CDS View Entities (Interface + Project) │
│  → The foundation you built in Module 2  │
│  → Compositions define the BO structure  │
└──────────────────────────────────────────┘
```

You've already built Layer 1. Modules 3 and 4 build Layers 2 and 3.

## The Three Implementation Types

RAP offers three patterns for different scenarios:

**Managed (this course's focus):**
The framework handles everything — database operations, locking, numbering, draft. You write only business logic (validations, actions, determinations). Best for new applications.

```
You define:  "Sales Order has CRUD, validate customer, action approve"
RAP does:    INSERT/UPDATE/DELETE to database, lock handling, OData plumbing
```

**Unmanaged:**
You handle database operations yourself. The framework provides the OData service and transaction framework, but you write the save logic. Best for wrapping existing code (BAPIs, legacy persistence).

```
You define:  "Sales Order has CRUD" + you implement the SAVE method
RAP does:    OData plumbing, transaction coordination
You do:      INSERT/UPDATE/DELETE to database in your save method
```

**Query:**
Read-only. No CRUD, no behavior. Used for analytical queries, search results, or data that comes from non-ABAP sources. Best for reporting views.

```
You define:  "Product Report has read access"
RAP does:    OData query service
No create, update, or delete
```

For TechMart's Sales Order app, we'll use **managed** — it's the most productive and the recommended approach for new development.

## The Artifact Map

Here's every artifact in a complete RAP application. Don't memorize this — we'll build each one step by step:

```
ZI_TM_SalesOrder (Interface CDS View Entity)
    ↓ defines data model + compositions
ZI_TM_SalesOrderItem (Interface CDS View Entity - child)
    ↓
ZC_TM_SalesOrder (Projection CDS View Entity)
    ↓ selects fields for this specific app
ZC_TM_SalesOrderItem (Projection CDS View Entity - child)
    ↓
Behavior Definition: ZI_TM_SalesOrder
    ↓ defines CRUD, validations, actions
Behavior Projection: ZC_TM_SalesOrder
    ↓ exposes which behaviors this app uses
Behavior Implementation: zbp_i_tm_salesorder
    ↓ ABAP class with business logic
Service Definition: ZSD_TM_SALESORDER
    ↓ lists which entities to expose
Service Binding: ZSB_TM_SALESORDER_V4
    ↓ binds to OData V4 protocol
    ↓
Fiori Elements App (auto-generated from annotations)
```

That's 10+ artifacts, but each one is small and focused. The framework generates skeletons for most of them.

## How It Connects to What You Know

| You've already learned | How it maps to RAP |
|---|---|
| CDS view entities (L06) | = Layer 1 data model |
| Compositions (L10) | = BO structure (root + children) |
| Associations (L07) | = Value helps and navigation |
| Annotations (L08) | = Fiori UI generation |
| Access control (L12) | = Authorization layer |
| OOP interfaces (L05) | = Behavior implementation pattern |
| Modern syntax (L04) | = Used in all implementation code |

RAP is not a new concept — it's the integration layer that connects everything you've already built.

## Common Mistakes

- **Trying to build RAP without understanding CDS** — RAP is built ON CDS. If compositions, associations, and annotations are unclear, go back to Module 2.
- **Starting with unmanaged** — Unmanaged is for legacy integration. Start with managed. It's simpler and teaches the patterns better.
- **Thinking RAP replaces ABAP** — RAP is a framework written in ABAP. Your business logic is still ABAP code in classes. RAP just provides the structure.
- **Skipping the projection layer** — You could expose interface views directly, but projections give you flexibility: one interface view, multiple projections for different apps.

## Key Takeaways

- RAP is SAP's strategic framework for building transactional business applications in ABAP Cloud.
- Three layers: data model (CDS), behavior (validations/actions), service (OData exposure).
- Three types: managed (framework does persistence), unmanaged (you do persistence), query (read-only).
- RAP integrates everything from Module 2 — CDS views, compositions, annotations, access control — into interactive applications.
- Start with managed. It handles 90% of new application scenarios.

## Next Lesson

Theory is over. In Lesson 14, we'll **build TechMart's Sales Order app from scratch** — the complete managed RAP business object, from CDS views through behavior definition to Fiori preview. It's the biggest lesson in the course, and by the end, you'll have a working CRUD application.
