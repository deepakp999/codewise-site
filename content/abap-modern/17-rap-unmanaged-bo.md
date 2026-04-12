---
title: "Unmanaged RAP — When You Need Full Control"
description: "Learn when and how to use unmanaged RAP for wrapping legacy ABAP code, custom persistence, and BAPI integration in modern OData services."
order: 17
module: "rap-fundamentals"
module_title: "RAP Fundamentals"
tags: ["rap unmanaged", "legacy integration", "bapi wrapper", "custom persistence", "abap rap"]
prev_slug: "rap-eml"
next_slug: "rap-query-implementation"
---

# Unmanaged RAP — When You Need Full Control

## What You'll Learn
- When to choose unmanaged over managed RAP
- The unmanaged save sequence
- Wrapping existing BAPI logic in a RAP service
- The interaction phase vs save phase
- Migration path from unmanaged to managed

## When to Use Unmanaged

Managed RAP handles persistence automatically — the framework generates INSERT/UPDATE/DELETE. But what if:

- You have existing BAPI logic for order processing that's been tested for years?
- Your data is stored across multiple tables with complex relationships?
- You need custom locking beyond what managed provides?
- You're integrating with non-ABAP systems?

Unmanaged RAP gives you the RAP service layer (OData, Fiori, EML) while you keep full control of persistence.

## The Behavior Definition

```
unmanaged implementation in class zbp_i_tm_legacy_order unique;
strict ( 2 );

define behavior for ZI_TM_LegacyOrder alias LegacyOrder
lock master
authorization master ( global )
etag master LastChangedAt
{
  create;
  update;
  delete;

  mapping for ztm_legacy_order corresponding { ... }
}
```

The only difference from managed: `unmanaged` instead of `managed` on the first line.

## The Save Sequence

In unmanaged RAP, you implement the save yourself. The framework splits the transaction into two phases:

**Interaction Phase** — User is editing. Data is in a transactional buffer (memory). No database writes yet.

**Save Phase** — User clicks Save. The framework calls your save methods to persist the buffer to the database.

```abap
CLASS lsc_zi_tm_legacyorder DEFINITION INHERITING FROM
  cl_abap_behavior_saver.

  PROTECTED SECTION.
    METHODS save_modified REDEFINITION.
ENDCLASS.

CLASS lsc_zi_tm_legacyorder IMPLEMENTATION.
  METHOD save_modified.
    " Handle creates
    IF create-legacyorder IS NOT INITIAL.
      LOOP AT create-legacyorder INTO DATA(ls_create).
        INSERT ztm_legacy_order FROM @( CORRESPONDING #( ls_create ) ).
      ENDLOOP.
    ENDIF.

    " Handle updates
    IF update-legacyorder IS NOT INITIAL.
      LOOP AT update-legacyorder INTO DATA(ls_update).
        UPDATE ztm_legacy_order FROM @( CORRESPONDING #( ls_update ) ).
      ENDLOOP.
    ENDIF.

    " Handle deletes
    IF delete-legacyorder IS NOT INITIAL.
      LOOP AT delete-legacyorder INTO DATA(ls_delete).
        DELETE ztm_legacy_order FROM @( CORRESPONDING #( ls_delete-%key ) ).
      ENDLOOP.
    ENDIF.
  ENDMETHOD.
ENDCLASS.
```

## Wrapping a BAPI

TechMart's legacy system has a BAPI for order creation. Wrap it in unmanaged RAP:

```abap
METHOD save_modified.
  IF create-legacyorder IS NOT INITIAL.
    LOOP AT create-legacyorder INTO DATA(ls_create).
      " Call the existing BAPI instead of direct SQL
      DATA(ls_header) = VALUE bapi_order_header(
        customer = ls_create-CustomerId
        date     = ls_create-OrderDate
      ).
      
      " Note: In ABAP Cloud, you'd use a released wrapper for the BAPI
      " This is conceptual — actual implementation depends on your system
      CALL FUNCTION 'Z_TM_BAPI_ORDER_CREATE'
        EXPORTING is_header = ls_header
        IMPORTING ev_order_id = DATA(lv_new_id)
        EXCEPTIONS OTHERS = 1.
        
      IF sy-subrc <> 0.
        " Handle error
      ENDIF.
    ENDLOOP.
  ENDIF.
ENDMETHOD.
```

## Managed vs Unmanaged — Decision Matrix

| Scenario | Use Managed | Use Unmanaged |
|---|---|---|
| New application, no legacy code | Yes | — |
| Wrapping existing BAPIs | — | Yes |
| Simple CRUD on single/few tables | Yes | — |
| Complex multi-table persistence | — | Yes |
| Need draft support easily | Yes (built-in) | Possible but complex |
| Custom locking requirements | — | Yes |
| Migrating Classic to RAP | — | Start here, migrate to managed later |

## Migration Path

Many teams start unmanaged (to wrap legacy code) and migrate to managed over time:

1. **Phase 1:** Unmanaged RAP wrapping existing BAPIs → immediate Fiori/OData benefit
2. **Phase 2:** Gradually move persistence logic from BAPIs to managed RAP
3. **Phase 3:** Full managed RAP with validations, actions, draft

This is TechMart's approach for the legacy order system.

## Common Mistakes

- **Starting with unmanaged for new apps** — If there's no legacy code to wrap, use managed. It's less code and more framework support.
- **Forgetting the saver class** — Unmanaged MUST have a saver class with `save_modified`. Without it, nothing persists.
- **Calling COMMIT WORK in the saver** — The framework handles COMMIT. Your saver does INSERT/UPDATE/DELETE only.
- **Not handling all three operations** — Check `create`, `update`, AND `delete` in `save_modified`. Missing one means that operation silently does nothing.

## Key Takeaways

- Unmanaged RAP gives you the service layer (OData, Fiori, EML) while you control persistence.
- You implement `save_modified` in a saver class — handling creates, updates, and deletes to the database.
- Ideal for wrapping legacy BAPIs and complex persistence scenarios.
- Start unmanaged for legacy integration, migrate to managed when ready.
- For new applications with no legacy constraints, always use managed.

## Next Lesson

Not all data needs CRUD. In Lesson 18, we'll learn **RAP Query** — the read-only pattern for analytical views, search results, and data from non-standard sources.
