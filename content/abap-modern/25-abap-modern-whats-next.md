---
title: "What's Next — Certification, CDS Pattern, and Your Career"
description: "Map your path forward as a modern ABAP developer. Prepare for the C_ABAPD_2601 certification, learn about the CDS-only pattern, and explore career opportunities."
order: 25
module: "real-world-patterns"
module_title: "Real-World Patterns & Next Steps"
tags: ["abap certification", "c_abapd_2601", "cds pattern", "joule", "abap career"]
prev_slug: "rap-extensibility"
next_slug: null
---

# What's Next — Certification, CDS Pattern, and Your Career

## What You'll Learn
- How to prepare for the C_ABAPD_2601 ABAP Cloud certification
- The CDS-only pattern — the future of RAP
- SAP Joule AI for ABAP development
- Career paths for modern ABAP developers
- Resources for continued learning

## What You've Accomplished

Let's take stock. In 25 lessons, you went from "I know Classic ABAP" to:

- Understanding why ABAP Cloud exists and what Clean Core means
- Setting up ADT and connecting to a cloud ABAP system
- Writing modern ABAP syntax (inline declarations, constructor operators)
- Modeling data with CDS view entities (joins, associations, compositions, annotations, parameters, access control)
- Building a complete managed RAP business object (CRUD, draft, validations, determinations, actions, feature control)
- Understanding unmanaged and query patterns for legacy and analytics
- Testing with ABAP Unit and ensuring clean core compliance
- Extending applications without modification

That's a real skillset. TechMart's Sales Order app is production-ready.

## The C_ABAPD_2601 Certification

SAP's ABAP Cloud certification validates exactly the skills you've learned. Key facts:

**Exam format:** Hands-on practical coding in a live SAP system. Not multiple choice. You build real artifacts — CDS views, RAP BOs, behavior implementations — directly in ADT.

**Duration:** 3–4 hours of development time (plus preparation time).

**Topics covered:** CDS view entities, associations, compositions, annotations. RAP behavior definitions, validations, determinations, actions. Service definitions and bindings. ABAP Cloud development rules and ATC.

**How to prepare:** You've already covered the core content. Next steps:

1. **Practice on BTP trial** — Build 2–3 more RAP apps beyond TechMart. Different domains (e.g., HR leave requests, inventory management).
2. **SAP's RAP100 course** — Free on SAP Learning. Hands-on exercises that mirror the exam format.
3. **Time management** — The exam is time-constrained. Practice building a complete BO (CDS + behavior + service) in under 60 minutes.
4. **Know the shortcuts** — ADT quick fixes (Ctrl+1) generate skeletons for behavior implementations, draft tables, and service bindings. Use them.

## The CDS-Only Pattern — What's Coming

RAP is evolving. The latest development is the **CDS-only pattern** (also called CDS pattern), where even more artifacts are defined in CDS rather than in separate ABAP objects.

In the CDS-only pattern:
- **Database tables** are replaced by CDS table entities (defined in CDS, not SE11)
- **Data elements and domains** are replaced by CDS simple types
- **DDIC structures** are replaced by CDS abstract entities
- **Draft tables** are auto-generated from CDS definitions

This means fewer artifacts to create and maintain. A complete BO could be defined almost entirely in CDS, with only the business logic remaining in ABAP classes.

The CDS-only pattern is not yet 100% complete (as of 2026, some features like enum support at the UI level are still evolving), but it's SAP's stated direction. Learning it now positions you ahead of most ABAP developers.

## SAP Joule AI for Development

SAP's AI assistant is integrated into ADT. Joule can:

- **Generate code** — Describe what you need in natural language, and Joule generates the ABAP/CDS code
- **Explain code** — Select existing code and ask Joule to explain it
- **Generate unit tests** — Point Joule at a behavior implementation and it creates ABAP Unit test classes
- **Refactor** — Convert old syntax to modern syntax, suggest improvements

Joule doesn't replace understanding — you need to validate what it generates. But it dramatically speeds up the mechanical parts of development (boilerplate, test setup, syntax conversion).

## Career Paths

Modern ABAP developers are in high demand. The global migration to S/4HANA means every SAP customer needs developers who can:

**Path 1: S/4HANA Migration Developer**
- Convert Classic ABAP to ABAP Cloud
- Wrap legacy BAPIs in RAP services
- Clean up technical debt (Level C/D → Level A)
- High demand through 2028+

**Path 2: RAP Application Developer**
- Build new Fiori apps with RAP
- End-to-end: CDS → RAP → OData → Fiori
- Extend standard SAP BOs
- Growing demand as S/4HANA Cloud adoption increases

**Path 3: BTP Extension Developer**
- Side-by-side extensions on SAP BTP
- Integration with non-SAP systems
- AI/ML integration with SAP data
- Highest growth area

**Path 4: SAP Architect**
- Design clean core strategies
- Define extensibility standards
- Govern custom code quality
- Requires deep experience in all paths

## Continued Learning Resources

**Free:**
- SAP BTP ABAP Environment Trial (hands-on practice)
- SAP Learning courses: RAP100, BTP Developer tutorials
- SAP Community blogs and RAP series
- ABAP Cheat Sheets on GitHub (clean-core/abap-cheat-sheets)
- Codewise courses at codewise.lumivoxx.com

**SAP Documentation:**
- SAP Help Portal — ABAP Cloud documentation
- SAP API Business Hub — browse released APIs
- SAP Developer tutorials — step-by-step guides

**Coming soon on Codewise:**
- ABAP for SAP BTP (side-by-side development)
- Fiori Elements Deep Dive
- SAP Integration Suite for ABAP Developers

## Key Takeaways

- The C_ABAPD_2601 certification is hands-on — practice building complete RAP apps under time pressure.
- The CDS-only pattern is SAP's future direction — fewer artifacts, more declarative definitions.
- SAP Joule AI accelerates development but doesn't replace understanding.
- Modern ABAP developers are in high demand across migration, new development, BTP extension, and architecture roles.
- Keep practicing. Build apps beyond TechMart. The skills compound.

## Thank You

You've completed the ABAP Modern course. You went from Classic ABAP — SE80, function modules, dynpros — to CDS views, RAP business objects, draft handling, and clean core extensibility. That's a significant professional upgrade.

The SAP ecosystem is in the middle of its biggest transformation since R/3 → ECC. Developers who can bridge Classic and Modern ABAP are exactly what the market needs.

Go build something. Get certified. Come back and tell us about it.
