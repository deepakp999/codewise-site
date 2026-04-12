---
title: "What Is SAP and Why Does ABAP Exist?"
description: "Understand what SAP is, why enterprises use it, what ABAP does, and how it compares to languages you already know like Python and Java."
order: 1
module: "sap-orientation"
module_title: "SAP & ABAP Orientation"
tags: ["abap", "sap", "beginner", "enterprise", "erp"]
prev_slug: null
next_slug: "sap-system-landscape"
---

# What Is SAP and Why Does ABAP Exist?

## What You'll Learn
- What SAP is and why 77% of the world's transactions touch an SAP system
- What ABAP is and where it fits in the SAP ecosystem
- How ABAP compares to Python and Java
- Why companies pay $140K+ for ABAP developers
- Key vocabulary you'll see throughout this course

## You Already Know How to Code. So Why ABAP?

You know Python. Maybe Java. You can build APIs, write scripts, process data. Why learn a language from 1983 that runs on a "green screen"?

Because SAP runs the world's largest companies — and those companies need developers who speak SAP's language.

Here's the reality: 77% of global business transactions flow through SAP systems. That includes the supply chain that delivers your phone, the payroll system that pays airline pilots, the inventory system at your local supermarket. Companies like Apple, Shell, Siemens, Coca-Cola, and BMW all run on SAP.

And the language they use to customize, extend, and integrate these systems? ABAP.

## What Is SAP?

SAP (Systems, Applications, and Products in Data Processing) is an enterprise software company that builds ERP (Enterprise Resource Planning) systems. An ERP is a single platform that manages a company's core operations:

- **Finance** — general ledger, accounts payable/receivable, asset management
- **Sales** — order processing, pricing, billing, shipping
- **Materials** — procurement, inventory, warehouse management
- **Production** — manufacturing planning, quality management
- **HR** — payroll, employee records, recruitment

Instead of 20 different software systems that don't talk to each other, SAP provides one integrated system. When a customer places an order, it automatically updates inventory, triggers procurement if stock is low, creates an invoice, and posts the accounting entry — all in real time, all in one system.

Think of it like this: if Python/Django is a custom-built house, SAP is a massive prefabricated skyscraper. It comes with floors (modules) already built — finance, sales, HR, manufacturing. Your job as an ABAP developer is to customize the rooms, add new floors, and connect it to other buildings.

## What Is ABAP?

ABAP (Advanced Business Application Programming) is SAP's proprietary programming language. It was created in 1983 — the same era as C++. It's a high-level, statically typed language designed specifically for business data processing.

Here's a simple ABAP program:

```abap
REPORT z_hello_world.

DATA: lv_name TYPE string VALUE 'World'.

WRITE: / 'Hello,', lv_name, '!'.
WRITE: / 'This is my first ABAP program.'.
```

### Expected Output
```
Hello, World !
This is my first ABAP program.
```

If you know Python, you'll notice some similarities (it's readable, high-level) and some differences (everything is capitalized by convention, lines end with periods, and there's a lot of explicit typing).

## ABAP vs Python vs Java — Quick Comparison

```
Feature              ABAP                    Python               Java
──────────────────   ─────────────────────   ──────────────────   ──────────────────
Created              1983                    1991                 1995
Typing               Static                 Dynamic              Static
Runs on              SAP Application Server  Any machine          JVM
Primary use          Business applications   General purpose      Enterprise/Android
Syntax style         COBOL-influenced        Indentation-based    C-style braces
OOP support          Yes (since 2001)        Yes                  Yes
Open source          No (proprietary)        Yes                  Yes
Job market           Niche, high-paying      Massive, varied      Large, enterprise
Average US salary    $140K                   $120K                $115K
```

The salary premium exists because ABAP developers are scarce — far fewer people learn ABAP compared to Python, but the demand from large enterprises is steady and growing (especially with S/4HANA migrations).

## What Do ABAP Developers Actually Do?

Day-to-day, an ABAP developer's work includes:

**Building custom reports.** SAP comes with thousands of standard reports, but companies always need custom ones. "Show me all overdue invoices for customers in Germany, sorted by amount, with a traffic light indicator for risk level." That's an ABAP report.

**Extending standard SAP functionality.** SAP's standard code handles 80% of business processes. The other 20% is company-specific logic. ABAP developers add custom validations, calculations, and workflow steps without modifying SAP's core code.

**Building interfaces.** Companies don't run SAP in isolation. They need SAP to talk to their website, their warehouse management system, their bank's payment portal. ABAP developers build these integrations using BAPIs, IDocs, and RFC calls.

**Data migration.** When a company moves to SAP (or upgrades to S/4HANA), billions of records need to be converted and loaded. ABAP developers build the migration programs.

**Debugging production issues.** When the month-end financial close fails at 2 AM because a custom pricing routine has a bug, an ABAP developer gets the call.

## The SAP Ecosystem — Where ABAP Fits

```
┌─────────────────────────────────────────────────────┐
│                     SAP GUI / Fiori                  │  ← User interface
├─────────────────────────────────────────────────────┤
│              SAP Application Server (ABAP)          │  ← Your ABAP code runs here
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │  FI  │ │  SD  │ │  MM  │ │  PP  │ │  HR  │ ... │  ← SAP modules
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │
├─────────────────────────────────────────────────────┤
│              Database (HANA / Oracle / DB2)          │  ← Data layer
└─────────────────────────────────────────────────────┘
```

Your ABAP code runs on the **SAP Application Server** — the middle layer between the user interface and the database. When a user clicks a button in SAP GUI, your ABAP code executes on the application server, reads/writes data from the database, and sends the result back to the screen.

## Key Vocabulary

You'll encounter these terms throughout this course:

- **SAP GUI** — the desktop client used to access SAP systems. The "green screen" (though it's actually grey/white now).
- **Transaction code (T-code)** — a shortcut to access a specific function. `SE38` opens the ABAP editor, `SE11` opens the data dictionary, `VA01` creates a sales order. There are thousands of them.
- **Client** — a self-contained business unit within an SAP system. Client 100 might be "production," Client 200 might be "training." Same system, separate data.
- **Transport** — the mechanism to move code changes from development to production. Like a deployment pipeline, but SAP-specific.
- **Module** — a functional area of SAP: FI (Finance), SD (Sales & Distribution), MM (Materials Management), HR (Human Resources), etc.
- **Customizing** — SAP's term for configuration. Not coding — it's setting parameters, activating features, and defining business rules through configuration tables.
- **Enhancement** — a way to add custom logic to SAP standard code without modifying it. The SAP equivalent of "don't fork the framework."

## Common Mistakes

- **Thinking ABAP is "outdated."** ABAP has evolved dramatically — modern ABAP (which we'll cover in Course 2) supports inline declarations, functional expressions, CDS views, and RESTful APIs. It's not your grandfather's COBOL.
- **Assuming SAP knowledge is just ABAP.** ABAP developers need to understand SAP's business processes — you can't build a good pricing routine without understanding how SAP sales orders work. Technical skill + domain knowledge is the combination that commands premium salaries.
- **Trying to write ABAP like Python.** ABAP has its own idioms — internal tables, field symbols, work areas. Fighting the language's patterns instead of learning them will slow you down. Embrace the ABAP way.

## Key Takeaways

- SAP is the world's dominant enterprise software platform — 77% of global transactions touch SAP.
- ABAP is SAP's programming language, used to customize, extend, and integrate SAP systems.
- ABAP developers earn premium salaries ($140K+ US average) because the skill is niche and the demand is steady.
- Your existing programming knowledge transfers — variables, loops, OOP, databases are all here. The SAP-specific concepts (transactions, transports, modules) are what's new.
- ABAP is evolving — modern ABAP with RAP and CDS views is cloud-ready and nothing like the 1983 original.

## Next Lesson

You know what SAP and ABAP are. Before you write code, you need to understand the environment where that code lives. In **Lesson 2: SAP System Landscape**, we'll learn how SAP systems are organized — development, quality, and production — and how code moves between them.
