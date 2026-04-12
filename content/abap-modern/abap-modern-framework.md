# ABAP Modern (RAP, CDS, ABAP Cloud) — Course Framework
> **Product:** codewise.lumivoxx.com/abap-modern | **Brand:** Codewise
> **Audience:** ABAP Classic developers (completed our ABAP Classic course) transitioning to S/4HANA Cloud
> **Also for:** Python/Java developers from the ABAP Classic course who now want to learn the modern stack
> **Format:** 25 markdown lessons, 10–15 min each, static Next.js site
> **Recurring example:** "TechMart" — same fictional company from ABAP Classic course
> **Last updated:** April 12, 2026

---

## Prerequisite

Completion of the Codewise ABAP Classic course (or equivalent knowledge of ABAP data types, internal tables, modularization, Open SQL, and basic OOP).

---

## Narrative Arc

The course follows a single storyline: **a Classic ABAP developer at TechMart is told the company is migrating to S/4HANA Cloud. Their SE80 skills are no longer enough — they need to learn CDS views, RAP, and ABAP Cloud to keep their job and build new apps.**

```
Module 1: "The world changed"           → Why modern ABAP exists
Module 2: "Data lives in CDS now"       → CDS views mastery
Module 3: "Apps are built with RAP"     → RAP business objects
Module 4: "Make it production-ready"    → Draft, validations, actions
Module 5: "I can build real cloud apps" → End-to-end + certification prep
```

---

## Module 1 — The Modern ABAP Landscape (Lessons 1–5)

**Goal:** Understand why SAP moved away from Classic ABAP and what the new stack looks like.

**Narrative:** TechMart's CIO announces the S/4HANA Cloud migration. Your manager says: "No more SE80, no more function modules. Learn ADT, learn CDS, learn RAP — or get left behind."

| # | Slug | Lesson Title | Purpose | Builds on (Classic) | Sets up |
|---|------|-------------|---------|---------------------|---------|
| 01 | why-modern-abap | Why Modern ABAP? Classic vs Cloud | Motivation — what changed and why | Entire Classic course | Everything |
| 02 | abap-cloud-development-model | The ABAP Cloud Development Model | ABAP Cloud rules, released APIs, clean core | Classic OOP (L21–25) | 03, all RAP lessons |
| 03 | setting-up-adt | Setting Up ADT (Eclipse) for ABAP Development | Install Eclipse + ADT, connect to BTP trial | SE80 from Classic | All hands-on lessons |
| 04 | modern-abap-syntax | Modern ABAP Syntax — Inline Declarations and Expressions | NEW syntax: inline declarations, string templates, constructor operators | Classic syntax (L01–10) | CDS + RAP code |
| 05 | abap-oop-for-rap | OOP Refresher — Interfaces, Abstract Classes, and the RAP Connection | Bridge Classic OOP to RAP patterns | Classic OOP (L21–25) | RAP behavior (M3) |

**Module 1 exit state:** Learner has ADT set up, understands why ABAP Cloud exists, can write modern ABAP syntax, and sees how OOP connects to RAP.

**Key continuity notes:**
- Lesson 01 must directly reference concepts from ABAP Classic — "Remember function modules? Here's why SAP replaced them." "Remember SE80? Here's why you'll never open it again for cloud development."
- Lesson 03 uses the BTP ABAP Environment trial (free) — same zero-cost philosophy as the rest of Codewise.
- Lesson 04 should show side-by-side comparisons: Classic syntax → Modern syntax for loops, READ TABLE, string operations, internal table operations. Use TechMart examples from the Classic course.
- Lesson 05 bridges to RAP — "RAP behavior implementations are just classes implementing interfaces. You already know how to do this."

**SEO targets:**
| # | Primary keyword |
|---|----------------|
| 01 | classic abap vs modern abap |
| 02 | abap cloud development model |
| 03 | install adt eclipse abap |
| 04 | modern abap syntax inline declaration |
| 05 | abap oop for rap |

---

## Module 2 — CDS Views (Lessons 6–12)

**Goal:** Master Core Data Services — the data modeling layer that replaces DDIC views and classic reporting.

**Narrative:** TechMart needs to rebuild its reporting layer. The old ALV reports pulling from DDIC views are being replaced with CDS views that feed Fiori apps. Your first assignment: model the product catalog and sales data.

| # | Slug | Lesson Title | Purpose | Builds on | Sets up |
|---|------|-------------|---------|-----------|---------|
| 06 | what-are-cds-views | What Are CDS Views? Your First CDS View | CDS basics, DEFINE VIEW ENTITY, SELECT | DDIC from Classic (L11–15) | 07–12 |
| 07 | cds-joins-and-associations | Joins and Associations in CDS | INNER/LEFT joins, association definitions, cardinality | Classic Open SQL joins | 08, 10, 13 |
| 08 | cds-annotations | Annotations — UI, Search, OData, and Metadata Extensions | @UI, @Search, @OData annotations, metadata extensions | 06, 07 | 13, 15 |
| 09 | cds-calculated-fields-and-expressions | Calculated Fields, CASE, CAST, and SQL Functions | Computed columns, type conversions, built-in functions | 06 | 10, 12 |
| 10 | cds-compositions-and-hierarchies | Compositions — Parent-Child Relationships in CDS | COMPOSITION, TO PARENT, hierarchy modeling | 07 | 13, 14 |
| 11 | cds-parameters-and-input | CDS Views with Parameters | Parameterized views, cross-client access | 06, 09 | 12, 25 |
| 12 | cds-access-control | CDS Access Control — Authorization at the View Level | DCL (Data Control Language), role-based access | 06, 11 | 18, 25 |

**Module 2 exit state:** Learner can create CDS view entities with joins, associations, compositions, annotations, parameters, and access controls. They understand CDS is the foundation for RAP.

**Key continuity notes:**
- Lesson 06 should use the TechMart product table from ABAP Classic. "Remember the ZTM_PRODUCT table we created? Let's model it properly with CDS."
- Lesson 07 joins TechMart products with orders — same data relationships used throughout the RAP modules.
- Lesson 08 annotations are critical — they'll reappear in every RAP lesson. Teach @UI.lineItem, @UI.identification, @UI.selectionField early.
- Lesson 10 (compositions) is the hardest in Module 2. Use TechMart: Sales Order (parent) → Line Items (child). This exact composition becomes the RAP BO in Module 3.

**SEO targets:**
| # | Primary keyword |
|---|----------------|
| 06 | cds view entity abap tutorial |
| 07 | cds associations vs joins abap |
| 08 | cds annotations ui abap |
| 09 | cds calculated fields case cast |
| 10 | cds composition parent child abap |
| 11 | cds view with parameters abap |
| 12 | cds access control dcl abap |

---

## Module 3 — RAP Fundamentals (Lessons 13–18)

**Goal:** Build a complete RAP managed business object — TechMart's Sales Order app.

**Narrative:** TechMart's Fiori team needs a Sales Order management app. You'll build it from scratch using RAP — the business object, behavior definition, service definition, and service binding.

| # | Slug | Lesson Title | Purpose | Builds on | Sets up |
|---|------|-------------|---------|-----------|---------|
| 13 | what-is-rap | What Is RAP? The Big Picture | RAP architecture, managed/unmanaged/query, 3-layer model | 06, 10 | 14–18 |
| 14 | rap-managed-bo | Building Your First RAP Managed Business Object | End-to-end: CDS → Behavior Definition → Projection → Service | 10, 13 | 15–18 |
| 15 | rap-service-definition-binding | Service Definition and Service Binding — Exposing Your App | OData V2/V4, Fiori preview, service testing | 14 | 16, 25 |
| 16 | rap-eml | Entity Manipulation Language (EML) — CRUD Operations in Code | READ, MODIFY, COMMIT ENTITIES | 14, 15 | 17, 18, 21 |
| 17 | rap-unmanaged-bo | Unmanaged RAP — When You Need Full Control | Unmanaged save, legacy integration, custom persistence | 14, 16 | 23 |
| 18 | rap-query-implementation | RAP Query — Read-Only Access Patterns | Query implementation class, custom queries | 12, 13, 16 | 25 |

**Module 3 exit state:** Learner can build a managed RAP BO with CRUD, expose it as OData, test it in Fiori preview, and understands when to use unmanaged or query patterns.

**Key continuity notes:**
- Lesson 13 must connect CDS compositions (L10) to RAP — "The parent-child relationship you defined in CDS? That becomes the business object structure in RAP."
- Lesson 14 is the biggest lesson in the course — building the full Sales Order BO. Keep it focused: CDS root + child → behavior definition with managed implementation → projection → service definition → service binding → Fiori preview. Use TechMart Sales Order + Line Items.
- Lesson 16 (EML) is critical — it's how you programmatically interact with BOs. "This is the new Open SQL for business objects."
- Lesson 17 (unmanaged) should reference Classic ABAP BAPI patterns — "If your company has existing BAPI logic, unmanaged RAP wraps it."

**SEO targets:**
| # | Primary keyword |
|---|----------------|
| 13 | what is rap abap programming model |
| 14 | rap managed business object tutorial |
| 15 | rap service definition service binding |
| 16 | abap eml entity manipulation language |
| 17 | rap unmanaged business object abap |
| 18 | rap query implementation abap |

---

## Module 4 — RAP Advanced Features (Lessons 19–22)

**Goal:** Make the Sales Order app production-ready with validations, determinations, actions, and draft.

**Narrative:** TechMart's business users test your Sales Order app and say: "It crashes when I leave the customer field blank. I need a button to approve orders. And I want to save partial work." Time to add validations, actions, and draft support.

| # | Slug | Lesson Title | Purpose | Builds on | Sets up |
|---|------|-------------|---------|-----------|---------|
| 19 | rap-validations-determinations | Validations and Determinations — Business Rules in RAP | on save/on modify, validate fields, auto-fill fields | 14, 16 | 20, 23 |
| 20 | rap-actions | Actions — Static, Instance, and Factory Actions | Custom buttons, status changes, copy operations | 14, 16, 19 | 21, 23 |
| 21 | rap-draft | Draft Handling — Save Incomplete Work | Draft tables, draft determine action, side effects | 14, 19, 20 | 23, 25 |
| 22 | rap-feature-control | Feature Control and Authorization — Dynamic UI Behavior | Instance/static feature control, field-level control | 19, 20, 21 | 23, 25 |

**Module 4 exit state:** Learner has a fully functional, draft-enabled Sales Order app with validations, business actions, and dynamic UI behavior.

**Key continuity notes:**
- Lesson 19 validation example: "Customer ID must exist in the customer table" and "Order quantity must be positive" — real TechMart business rules.
- Lesson 19 determination example: auto-calculate total amount from line items, auto-set creation date.
- Lesson 20 actions: "Approve Order" (instance action), "Create with Reference" (factory action), "Generate Report" (static action).
- Lesson 21 (draft) is complex but essential — every production Fiori app needs it. Keep the explanation focused on "why" before "how."
- Lesson 22 ties it together: disable "Approve" button when order is already approved, hide "Delete" for non-admin users.

**SEO targets:**
| # | Primary keyword |
|---|----------------|
| 19 | rap validation determination abap |
| 20 | rap actions static instance factory |
| 21 | rap draft handling abap tutorial |
| 22 | rap feature control authorization |

---

## Module 5 — Real-World Patterns & Next Steps (Lessons 23–25)

**Goal:** Build production-quality code, prepare for certification, and map the path forward.

**Narrative:** You've built the Sales Order app. Now make it enterprise-ready — testing, clean core compliance, and side-by-side extensibility. Then prepare for the C_ABAPD_2601 certification.

| # | Slug | Lesson Title | Purpose | Builds on | Sets up |
|---|------|-------------|---------|-----------|---------|
| 23 | rap-testing-and-clean-core | Testing RAP Apps and Clean Core Compliance | ABAP Unit for RAP, ATC checks, test doubles | 14–22 | 24, 25 |
| 24 | rap-extensibility | Extensibility — BADIs, Side-by-Side, and BTP Integration | Extension points, custom logic injection, BTP overview | 02, 23 | 25 |
| 25 | abap-modern-whats-next | What's Next — Certification, CDS Pattern, and Your Career | C_ABAPD_2601 prep, CDS-only pattern, Joule AI, career paths | All | — |

**Module 5 exit state:** Learner can test RAP applications, understands clean core extensibility, and has a roadmap for certification and career growth.

**Key continuity notes:**
- Lesson 23 should use the TechMart Sales Order BO as the test subject. Show ABAP Unit test for a validation, a determination, and an action.
- Lesson 24 extensibility: "TechMart acquires another company. You need to extend the Sales Order BO with new fields without modifying the original code."
- Lesson 25 should mention the CDS-only pattern (new in 2025/2026) as the future direction, the C_ABAPD_2601 practical exam format, and SAP Joule AI for development.

**SEO targets:**
| # | Primary keyword |
|---|----------------|
| 23 | rap abap unit testing clean core |
| 24 | abap cloud extensibility badi btp |
| 25 | abap cloud certification prep career |

---

## Cross-Course Continuity (ABAP Classic → ABAP Modern)

| Classic Concept (from ABAP Classic course) | Modern Equivalent (this course) |
|---|---|
| SE80 workbench | ADT (Eclipse) — Lesson 03 |
| DDIC tables, data elements, domains | CDS entities, CDS simple types — Lesson 06 |
| DDIC views | CDS view entities — Lesson 06 |
| Function modules, BAPIs | RAP business objects, EML — Lessons 14, 16 |
| ALV reports | CDS + Fiori Elements — Lessons 08, 15 |
| Authorization objects (AUTHORITY-CHECK) | CDS access control (DCL) — Lesson 12 |
| Classic Open SQL | ABAP SQL (modern syntax) — Lesson 04 |
| Dynpro/Selection screens | Fiori Elements (annotation-driven) — Lesson 08 |
| User exits, BADIs (classic) | RAP extensibility, released BADIs — Lesson 24 |

---

## Recurring Example: TechMart

The same fictional company from ABAP Classic. In this course:
- **ZTM_PRODUCT** → becomes CDS entity `ZI_TM_Product`
- **ZTM_SALESORDER** → becomes RAP BO root entity `ZI_TM_SalesOrder`
- **ZTM_SOITEM** → becomes RAP BO child entity `ZI_TM_SalesOrderItem`
- **ZTM_CUSTOMER** → value help and validation reference
- Sales Order lifecycle: Created → Approved → Shipped → Completed

This lifecycle drives validations (L19), actions (L20), feature control (L22), and the capstone in L23.

---

## Template Reminder

Every lesson follows the CMO template:
```
---
frontmatter (title, description, order, module, tags, prev_slug, next_slug)
---
# Title
## What You'll Learn
## Concept (with TechMart analogy)
## Code Example (with expected output or Fiori screenshot description)
## Common Mistakes
## Key Takeaways
## Next Lesson teaser
```
