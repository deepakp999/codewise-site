---
title: "Why Modern ABAP? Classic vs Cloud Development Explained"
description: "Understand why SAP moved from Classic ABAP to ABAP Cloud, what changed, and why every ABAP developer needs to learn the modern stack."
order: 1
module: "modern-abap-landscape"
module_title: "The Modern ABAP Landscape"
tags: ["abap modern", "abap cloud", "classic vs modern abap", "s4hana", "clean core"]
prev_slug: null
next_slug: "abap-cloud-development-model"
---

# Why Modern ABAP? Classic vs Cloud Development Explained

## What You'll Learn
- Why SAP created a new development model
- What "ABAP Cloud" and "Clean Core" actually mean
- The key differences between Classic ABAP and Modern ABAP
- What happens to your existing Classic ABAP skills
- The TechMart migration story that drives this entire course

## The World Changed — And ABAP Changed With It

If you've completed the ABAP Classic course, you know how to write reports, build function modules, create DDIC objects, and use Open SQL. Those skills got you through decades of SAP R/3 and ECC projects.

Then SAP released S/4HANA. And then S/4HANA Cloud. And suddenly, the rules changed.

Here's what happened at TechMart — the fictional company we've been working with since the Classic course.

TechMart's CIO sends this email to the development team:

```
Subject: S/4HANA Cloud Migration — What This Means for Development

Team,

We are migrating to S/4HANA Cloud Public Edition by Q4. This means:

1. SE80 is no longer available. All development happens in Eclipse (ADT).
2. Function modules and classic dynpros cannot be created in the cloud.
3. Only "released APIs" can be used — no direct access to SAP standard tables.
4. All new apps must be built using CDS views and the RAP framework.
5. Fiori replaces SAP GUI as the primary user interface.

If you're thinking "my old skills are useless" — they're not. ABAP is still ABAP.
But HOW you write it changes significantly.

Please prioritize upskilling. This is not optional.

— CIO, TechMart
```

This course is your response to that email.

## What Exactly Changed?

Let's be concrete. Here's what you knew from Classic ABAP and what replaces it:

```abap
" CLASSIC ABAP — What you learned in the previous course
" ======================================================

" Data Dictionary (SE11)
"   → Tables, data elements, domains, structures
"   → DDIC views for joining tables

" Function Modules (SE37)
"   → Reusable logic with importing/exporting parameters
"   → BAPIs for external integration

" Programs and Transactions (SE38, SE80)
"   → Reports with selection screens
"   → Module pool programs with dynpros

" Authorization
"   → AUTHORITY-CHECK statement in code

" Testing
"   → Manual testing via SE38, SM35, or test transactions
```

```abap
" MODERN ABAP — What you'll learn in THIS course
" ======================================================

" CDS View Entities (ADT)
"   → Replace DDIC views
"   → Define data models with annotations, associations, compositions
"   → Feed Fiori apps directly

" RAP Business Objects (ADT)
"   → Replace function modules and BAPIs
"   → Managed/Unmanaged/Query patterns
"   → Built-in CRUD, draft, validation, actions

" Eclipse ADT
"   → Replaces SE80 for ALL development
"   → Code completion, refactoring, integrated testing

" CDS Access Control (DCL)
"   → Replaces AUTHORITY-CHECK for CDS-based authorization

" ABAP Unit + Test Doubles
"   → Automated testing built into the framework
"   → RAP test doubles for isolated unit tests
```

The language is still ABAP. The database is still tables. The logic is still SELECT, LOOP, IF-ELSE. But the **architecture** around it is completely different.

## Why Did SAP Do This?

Three reasons, and they all matter:

**1. Cloud requires upgrade safety.** In SAP's cloud editions, SAP pushes updates quarterly. If your custom code touches SAP internal tables or uses undocumented APIs, those updates break your code. ABAP Cloud restricts you to "released APIs" — SAP's guarantee that these interfaces won't change during upgrades.

**2. Fiori needs a different backend.** The old dynpro-based screens are desktop-only. Fiori apps are browser-based, responsive, and run on OData services. CDS views + RAP generate OData services automatically — no manual coding of the service layer.

**3. SAP HANA changes how you think about data.** The old approach was "pull data into ABAP, process it in memory." With HANA, you push logic to the database. CDS views execute on the database layer, which is orders of magnitude faster for large datasets.

## The "Clean Core" Philosophy

You'll hear "Clean Core" everywhere in SAP now. It means one thing: **don't modify SAP's standard code.** Instead, extend it through well-defined extension points.

Think of it like renting an apartment:
- **Classic ABAP** = You owned the house. You knocked down walls, rewired the electricity, built an extension. Your house, your rules. But when the landlord (SAP) needs to renovate, everything you built gets in the way.
- **Clean Core** = You rent the apartment. You can furnish it however you want (extensions), but you can't knock down walls (modify SAP standard). When the landlord renovates, your furniture survives.

In practice, Clean Core means:
- Use only released SAP APIs (checked by the ABAP Test Cockpit)
- Build extensions using RAP and CDS, not modifications
- Use BADIs and extension points, not user exits or implicit enhancements
- Test with ABAP Unit, not manual walkthrough

## What Happens to Your Classic ABAP Skills?

Good news: most of what you learned transfers directly.

| Classic Skill | Still Useful? | How It Maps |
|---|---|---|
| Data types (C, I, N, STRING, etc.) | Yes | Same types, modern syntax for declarations |
| Internal tables | Yes | Same concept, modern syntax (VALUE, FOR, REDUCE) |
| Open SQL (SELECT, INSERT, etc.) | Yes | Now called "ABAP SQL" with enhanced syntax |
| OOP (classes, interfaces) | Critical | RAP behavior is implemented in classes |
| ABAP Debugger | Yes | Works in ADT with enhanced features |
| ALV reporting | Partially | Replaced by CDS + Fiori Elements for new apps |
| Function modules | Partially | Still exist on-premise, not in ABAP Cloud |
| Dynpros / selection screens | No | Replaced entirely by Fiori Elements |
| SE80 / SAP GUI development | No | Replaced entirely by ADT (Eclipse) |

The bottom line: **your ABAP logic skills transfer. Your tooling and architecture knowledge needs updating.**

## Common Mistakes

- **"I'll just keep using SE80"** — You can't. ABAP Cloud objects (CDS entities, RAP artifacts) can only be created in ADT. SE80 literally cannot display them.
- **"Classic ABAP is dead"** — No. Millions of lines of Classic ABAP run in production today. But all NEW development on S/4HANA Cloud must use ABAP Cloud. On-premise systems will gradually adopt it too.
- **"I need to learn a completely new language"** — No. It's still ABAP. The syntax is modernized (more concise, more expressive), but the core logic is the same. If you can write a LOOP and a SELECT, you can learn CDS and RAP.
- **"RAP is just another framework that SAP will replace in 5 years"** — Unlikely. RAP is SAP's strategic programming model. CDS views have been stable since 2014. SAP is investing heavily in RAP tooling, including AI-assisted development with Joule.

## Key Takeaways

- SAP moved from Classic ABAP to ABAP Cloud because cloud operation, Fiori, and HANA require a new architecture.
- "Clean Core" means: don't modify SAP standard, extend through released APIs and well-defined extension points.
- Your Classic ABAP skills (data types, internal tables, SQL, OOP) transfer directly. What changes is the tooling (ADT), the data layer (CDS), and the application framework (RAP).
- This course takes you from Classic to Modern using the same TechMart examples, so the transition feels like an upgrade, not a restart.

## Next Lesson

In Lesson 2, we'll look at the **ABAP Cloud Development Model** in detail — what "released APIs" are, how the ABAP Test Cockpit enforces clean core rules, and the exact boundaries of what you can and can't do in ABAP Cloud. This is the rulebook for everything that follows.
