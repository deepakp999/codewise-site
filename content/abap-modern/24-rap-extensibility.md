---
title: "Extensibility — BADIs, Side-by-Side, and BTP Integration"
description: "Learn how to extend RAP applications without modifying the original code using released BADIs, side-by-side extensions on BTP, and clean core principles."
order: 24
module: "real-world-patterns"
module_title: "Real-World Patterns & Next Steps"
tags: ["abap extensibility", "badi", "side by side", "btp", "clean core"]
prev_slug: "rap-testing-and-clean-core"
next_slug: "abap-modern-whats-next"
---

# Extensibility — BADIs, Side-by-Side, and BTP Integration

## What You'll Learn
- The extensibility model in ABAP Cloud
- Developer extensibility: on-stack with released BADIs
- Side-by-side extensibility: separate apps on BTP
- Key-user extensibility: no-code extensions
- Choosing the right extensibility approach

## TechMart's Extensibility Challenge

TechMart acquires "GadgetWorld." GadgetWorld needs additional fields on the Sales Order — a warranty flag and a returns policy reference. TechMart's Sales Order BO was built clean. How do you add these fields without modifying the original code?

## Three Extensibility Approaches

### 1. Developer Extensibility (On-Stack)

Add custom logic using released extension points — BADIs, extend behavior definitions, additional CDS fields.

**Extending a CDS view with additional fields:**

```sql
EXTEND VIEW ENTITY ZI_TM_SalesOrder WITH
{
  ztm_salesorder.warranty_flag   AS WarrantyFlag,
  ztm_salesorder.returns_policy  AS ReturnsPolicy
}
```

**Extending a behavior definition:**

You can add new validations, determinations, and actions to an existing BO without modifying the original:

```
extension using interface zif_tm_so_extension
  implementation in class zbp_tm_so_extension;

extend behavior for ZI_TM_SalesOrder
{
  validation validateWarranty on save { field WarrantyFlag; }
  determination determineReturnsPolicy on modify { field ReturnsPolicy; }
}
```

**Using a released BADI:**

SAP standard BOs provide BADIs for extension. These are the officially supported hooks:

```abap
CLASS zcl_tm_order_badi DEFINITION PUBLIC FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_released_badi_for_orders.
ENDCLASS.

CLASS zcl_tm_order_badi IMPLEMENTATION.
  METHOD if_released_badi_for_orders~after_save.
    " Custom logic after order is saved
    " E.g., trigger warranty registration for GadgetWorld orders
  ENDMETHOD.
ENDCLASS.
```

### 2. Side-by-Side Extensibility (BTP)

Build a separate application on SAP BTP that communicates with the core S/4HANA system via released APIs:

```
S/4HANA Core System          SAP BTP
┌────────────────────┐       ┌──────────────────────┐
│ Sales Order BO     │ ←API→ │ Warranty Management  │
│ (unchanged)        │       │ App (custom)          │
│                    │       │                       │
│ Released OData API │───────│ Reads orders via API  │
│                    │       │ Stores warranty data  │
│                    │       │ in BTP database       │
└────────────────────┘       └──────────────────────┘
```

Use side-by-side when:
- The extension is complex (its own data model, workflow, UI)
- The core system shouldn't carry the custom logic load
- You need technologies not available in ABAP (ML models, external APIs)
- The extension has its own lifecycle (different team, different release cycle)

### 3. Key-User Extensibility (No-Code)

For business users who need simple extensions:
- Add custom fields via the Fiori "Custom Fields" app
- Create custom logic with BTP Workflow
- Add custom tiles and pages

No developer involvement needed. Limited but powerful for simple cases.

## Choosing the Right Approach

| Scenario | Approach | Why |
|---|---|---|
| Add a field + simple validation | Developer (on-stack) | Minimal effort, stays in ABAP |
| Build a warranty management app | Side-by-side (BTP) | Separate concerns, own data model |
| Add a field for reporting only | Key-user | No developer needed |
| Integrate with external warranty API | Side-by-side (BTP) | External communication, async |
| Add complex business rules to existing BO | Developer (on-stack) | Deep integration with BO lifecycle |
| Build an ML model for demand forecasting | Side-by-side (BTP) | Different technology stack |

**Rule of thumb:** Start with the simplest approach. Key-user if possible, developer on-stack if business logic is needed, side-by-side only for complex standalone functionality.

## Clean Core and Extensibility Levels

Remember the levels from Lesson 2:

- **Level A** — All extensions use released APIs and extension points. Fully upgrade-safe.
- **Level B** — Uses stable but unreleased APIs. Acceptable with governance.
- **Level C/D** — Uses internal APIs or modifications. Not upgrade-safe.

GadgetWorld's extension should be Level A:
- CDS view extensions (released feature)
- Behavior extensions (released feature)
- Released BADIs (guaranteed stable)
- BTP communication via released OData APIs

## Common Mistakes

- **Modifying the original BO** — The whole point of extensibility is NOT touching the original. If you change `ZI_TM_SalesOrder` directly, you're creating Level C/D technical debt.
- **Using unreleased BADIs** — Not all BADIs are released for cloud. Check the API state in ADT before implementing.
- **Side-by-side for simple fields** — Don't build a BTP app just to add one field. Use on-stack developer extensibility.
- **Ignoring key-user extensibility** — If a business user just needs one extra field for reporting, they can add it themselves. No developer ticket needed.

## Key Takeaways

- ABAP Cloud offers three extensibility approaches: developer (on-stack), side-by-side (BTP), and key-user (no-code).
- CDS views and behavior definitions can be extended without modification using `EXTEND VIEW ENTITY` and `extend behavior`.
- Side-by-side extensions on BTP communicate via released APIs — separate concerns, separate lifecycle.
- Always aim for Level A extensibility — use only released extension points.
- Start simple (key-user), escalate to developer, then side-by-side only when needed.

## Next Lesson

You've built a complete, tested, extensible RAP application. In our final lesson, we'll map your path forward — the **C_ABAPD_2601 certification**, the emerging CDS-only pattern, SAP Joule AI for development, and career paths for modern ABAP developers.
