---
title: "The ABAP Cloud Development Model — Rules, Released APIs, and Clean Core"
description: "Learn the ABAP Cloud development model, understand released APIs, the ABAP Test Cockpit, and the clean core extensibility levels that govern modern SAP development."
order: 2
module: "modern-abap-landscape"
module_title: "The Modern ABAP Landscape"
tags: ["abap cloud", "released apis", "clean core", "atc", "extensibility"]
prev_slug: "why-modern-abap"
next_slug: "setting-up-adt"
---

# The ABAP Cloud Development Model

## What You'll Learn
- What the ABAP Cloud development model is and where it applies
- What "released APIs" are and why they matter
- How the ABAP Test Cockpit (ATC) enforces the rules
- The clean core extensibility levels (A through D)
- What you CAN and CAN'T do in ABAP Cloud

## The Rulebook

In Classic ABAP, you could do almost anything. Access any SAP table. Call any function module. Modify standard includes. It worked, but it created a maintenance nightmare — every SAP upgrade could break your custom code.

ABAP Cloud is the opposite approach: **you can only use what SAP explicitly allows.**

Think of it as the difference between a wild-west town and a gated community. In the wild west (Classic ABAP), you build wherever you want, however you want. In the gated community (ABAP Cloud), there are building codes, approved contractors, and a homeowners' association (the ABAP Test Cockpit) that checks everything.

## Where Does ABAP Cloud Apply?

ABAP Cloud is mandatory in:
- **SAP BTP ABAP Environment** — the cloud-only ABAP runtime
- **S/4HANA Cloud Public Edition** — SAP's SaaS offering

ABAP Cloud is optional (but recommended) in:
- **S/4HANA Cloud Private Edition** — hosted cloud, customer-managed
- **S/4HANA On-Premise** — traditional installation

TechMart is migrating to S/4HANA Cloud, so ABAP Cloud is mandatory for us. But even if your company is on-premise, learning ABAP Cloud now means your code is future-proof.

## Released APIs — The Core Concept

In Classic ABAP, if you needed customer data, you might write:

```abap
" Classic approach — WORKS, but NOT cloud-safe
SELECT * FROM kna1 INTO TABLE @DATA(lt_customers)
  WHERE land1 = 'US'.
```

This accesses `KNA1` directly — an SAP internal table. If SAP restructures this table in a future release, your code breaks.

In ABAP Cloud, you use a **released API** instead:

```abap
" ABAP Cloud approach — uses a released CDS view
SELECT * FROM I_Customer INTO TABLE @DATA(lt_customers)
  WHERE Country = 'US'.
```

`I_Customer` is a CDS view released by SAP. SAP guarantees its interface stability. Even if SAP restructures the underlying tables, `I_Customer` continues to work.

**How to know if something is released:** In ADT, every SAP object has an "API State" property. If it says `Released` with a stability contract (C1 = use in cloud, C2 = use in key user extensibility), it's safe to use. If it doesn't, it's off-limits in ABAP Cloud.

### Expected Output (API State in ADT)

When you open a released CDS view in ADT, you'll see:

```
Properties:
  API State: Released
  Stability Contract: C1 (Use in Cloud Development)
  Visibility: Public
  Release State: Released
```

If you try to use an unreleased object, the ATC flags it immediately.

## The ABAP Test Cockpit (ATC) — Your Gatekeeper

The ATC is a static code analysis tool. In ABAP Cloud, it runs automatically and **blocks transport** if your code violates the rules.

Key checks the ATC performs:
- **Released API check** — Did you use only released objects?
- **Obsolete syntax check** — Did you use deprecated statements?
- **Clean ABAP check** — Does your code follow naming conventions and best practices?

```abap
" This code will FAIL the ATC in ABAP Cloud:
DATA: lv_name TYPE c LENGTH 30.       " Obsolete: use CHARACTER or STRING
MOVE lv_input TO lv_name.             " Obsolete: use assignment operator
CALL FUNCTION 'BAPI_CUSTOMER_GETLIST'. " Not released for cloud
SELECT * FROM kna1.                    " Not released for cloud

" This code will PASS the ATC:
DATA(lv_name) = lv_input.                      " Inline declaration
SELECT * FROM I_Customer INTO TABLE @DATA(lt).  " Released CDS view
```

Think of the ATC as the compiler for cloud-readiness. You wouldn't ship code that doesn't compile. In ABAP Cloud, you can't ship code that doesn't pass ATC.

## Clean Core Extensibility Levels

SAP introduced a graduated model for classifying custom code. This helps companies plan their migration:

**Level A — Fully Cloud-Ready**
- Uses only released APIs (C1 contract)
- Built with ABAP Cloud, CDS, and RAP
- Upgrade-safe, no risk during quarterly updates
- *This is what we build in this course*

**Level B — Stable Classic**
- Uses documented, generally stable SAP APIs
- Not officially released, but unlikely to break
- Acceptable with governance sign-off
- Requires monitoring during upgrades

**Level C — Risky Classic**
- Accesses SAP internal objects
- Meaningful upgrade risk
- Should be on a remediation roadmap

**Level D — Dangerous**
- Modifications to SAP standard code
- Implicit enhancements, direct writes to SAP tables
- Severe upgrade risk
- Should have a retirement timeline

TechMart's goal: all new development at Level A, existing code assessed and migrated from C/D → A/B over time.

## What You CAN'T Do in ABAP Cloud

These Classic ABAP features are not available:

```abap
" NOT available in ABAP Cloud:
" - SE80, SE38, SE37, SE11 (SAP GUI transactions)
" - CALL FUNCTION (classic function modules)
" - FORM/ENDFORM (subroutines)
" - WRITE statements (classic list output)
" - Dynpro programming (MODULE, PBO, PAI)
" - Direct access to unreleased SAP tables
" - Classic BAdI calls (use new BAdI framework)
" - EXEC SQL (native SQL)
" - Memory export/import (EXPORT TO MEMORY)
```

## What You CAN Do in ABAP Cloud

Everything you need for modern application development:

```abap
" Available in ABAP Cloud:
" - CDS view entities (data modeling)
" - RAP business objects (transactional apps)
" - ABAP classes and interfaces (OOP)
" - Modern ABAP SQL (enhanced Open SQL)
" - ABAP Unit tests
" - Released SAP APIs and extension points
" - Released BADIs
" - Background processing (via released APIs)
" - Exception handling (TRY/CATCH)
" - String processing, date/time functions
" - Internal tables with modern syntax
" - HTTP/REST client (via released classes)
```

## Common Mistakes

- **"Released APIs don't cover my use case"** — This is sometimes true in early adoption. SAP releases new APIs with each quarterly update. Check the SAP API Business Hub for the latest. If your API truly doesn't exist, Level B (stable classic) is acceptable with governance sign-off.
- **"ATC is just a recommendation I can ignore"** — In ABAP Cloud, ATC violations block transport. You literally cannot deploy non-compliant code. On-premise, it's configurable — but treat it as mandatory.
- **"I'll learn clean core later"** — Every line of non-compliant code you write today is technical debt tomorrow. Start clean, stay clean.
- **Confusing ABAP Cloud with SAP BTP** — ABAP Cloud is a development model (a set of rules). SAP BTP is a platform. You can use ABAP Cloud on BTP, on S/4HANA Cloud, and on S/4HANA on-premise. They're different things.

## Key Takeaways

- ABAP Cloud restricts you to released APIs — SAP's guarantee of upgrade stability.
- The ABAP Test Cockpit (ATC) enforces these rules automatically and blocks non-compliant code from transport.
- Clean Core extensibility ranges from Level A (fully cloud-ready) to Level D (dangerous modifications). Aim for Level A.
- You lose classic tools (SE80, function modules, dynpros) but gain a safer, more productive development model.
- This course builds everything at Level A — fully cloud-ready, fully upgrade-safe.

## Next Lesson

In Lesson 3, we'll **set up your development environment** — install Eclipse, add ABAP Development Tools (ADT), connect to a free SAP BTP ABAP Environment trial, and write your first "Hello World" in ABAP Cloud. The tooling shift from SE80 to ADT is the first thing you'll feel as a Classic developer.
