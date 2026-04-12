---
title: "CDS Access Control — Authorization at the View Level"
description: "Learn how CDS access control (DCL) replaces AUTHORITY-CHECK with declarative, view-level row filtering based on user roles."
order: 12
module: "cds-views"
module_title: "CDS Views"
tags: ["cds access control", "dcl", "authorization", "abap cloud", "row level security"]
prev_slug: "cds-parameters-and-input"
next_slug: "what-is-rap"
---

# CDS Access Control — Authorization at the View Level

## What You'll Learn
- What CDS access control is and how it replaces AUTHORITY-CHECK
- Creating access control objects (DCL — Data Control Language)
- Restricting rows by user, role, and authorization field
- The relationship between access control and RAP authorization
- Granting unrestricted access for development

## From AUTHORITY-CHECK to DCL

In Classic ABAP, authorization was imperative — you wrote checks in your code:

```abap
" CLASSIC — authorization scattered throughout code
AUTHORITY-CHECK OBJECT 'Z_TM_ORD'
  ID 'ACTVT' FIELD '03'
  ID 'ZREGION' FIELD ls_order-region.
IF sy-subrc <> 0.
  RAISE EXCEPTION TYPE cx_tm_not_authorized.
ENDIF.
```

Problems: developers forget to add checks, checks are inconsistent across programs, and there's no central view of who can see what.

CDS access control is **declarative** — you define rules once, attached to the CDS view, and they apply everywhere the view is accessed.

## Creating an Access Control Object

In ADT: Right-click package → **New → Access Control**

Name: `ZI_TM_SalesOrder` (same name as the CDS view it protects)

```sql
@EndUserText.label: 'Access Control for Sales Orders'
@MappingRole: true

DEFINE ROLE ZI_TM_SalesOrder {
  GRANT SELECT ON ZI_TM_SalesOrder
  WHERE ( Country ) =
    ASPECT pfcg_auth ( Z_TM_ORD, ZREGION, ACTVT = '03' );
}
```

This means: a user can only SELECT rows from `ZI_TM_SalesOrder` where the `Country` field matches their authorization value for object `Z_TM_ORD`, field `ZREGION`, with activity `03` (display).

The access control applies automatically — every SELECT from this CDS view filters rows based on the user's authorization. No application code needed.

## How DCL Rules Work

The DCL rule acts as an invisible WHERE clause:

```sql
" What the developer writes:
SELECT * FROM ZI_TM_SalesOrder INTO TABLE @DATA(lt_orders).

" What actually executes (for a user authorized for region 'US'):
SELECT * FROM ZI_TM_SalesOrder 
  WHERE Country = 'US'
  INTO TABLE @DATA(lt_orders).

" For a user authorized for 'US' and 'DE':
SELECT * FROM ZI_TM_SalesOrder 
  WHERE Country IN ('US', 'DE')
  INTO TABLE @DATA(lt_orders).
```

The developer doesn't see the filter. It's applied by the framework.

## Multiple Conditions

```sql
DEFINE ROLE ZI_TM_SalesOrder {
  GRANT SELECT ON ZI_TM_SalesOrder
  WHERE ( Country ) =
    ASPECT pfcg_auth ( Z_TM_ORD, ZREGION, ACTVT = '03' )
  AND ( Status ) NOT IN ( 'X' );  -- Never show cancelled orders
}
```

## Unrestricted Access (for Development)

During development, you might want all rows visible:

```sql
@EndUserText.label: 'Unrestricted Access for Development'
@MappingRole: true

DEFINE ROLE ZI_TM_SalesOrder {
  GRANT SELECT ON ZI_TM_SalesOrder
  WHERE _granted_access;  -- All rows visible (no filter)
}
```

**Important:** Replace `_granted_access` with proper authorization rules before going to production.

## Inherited Access Control

If `ZI_TM_SalesOrder` has access control, what about its child `ZI_TM_SalesOrderItem`? You can inherit:

```sql
@EndUserText.label: 'Access Control for Sales Order Items'
@MappingRole: true

DEFINE ROLE ZI_TM_SalesOrderItem {
  GRANT SELECT ON ZI_TM_SalesOrderItem
  WHERE ( OrderId ) IN (
    SELECT OrderId FROM ZI_TM_SalesOrder
    -- Inherits the parent's access control automatically
  );
}
```

Items are only visible if the user can see the parent order.

## The @AccessControl Annotation

Every CDS view has this annotation controlling authorization behavior:

```sql
@AccessControl.authorizationCheck: #CHECK        -- DCL is required, enforced
@AccessControl.authorizationCheck: #NOT_REQUIRED  -- No DCL needed (open access)
@AccessControl.authorizationCheck: #NOT_ALLOWED   -- DCL must NOT exist
```

Use `#CHECK` for production views. Use `#NOT_REQUIRED` during development (as we've done throughout this course).

## Common Mistakes

- **Leaving `#NOT_REQUIRED` in production** — This means no authorization filter. Every user sees every row. Always switch to `#CHECK` with a proper DCL before go-live.
- **DCL name mismatch** — The access control object MUST have the same name as the CDS view it protects. If the view is `ZI_TM_SalesOrder`, the DCL must also be `ZI_TM_SalesOrder`.
- **Forgetting to test with different users** — Access control is invisible to the developer who has full authorization. Always test with a restricted user.
- **Over-complex DCL rules** — Keep rules simple. If you need complex multi-table authorization, consider restructuring your CDS views.

## Key Takeaways

- CDS access control (DCL) replaces AUTHORITY-CHECK with declarative, view-level row filtering.
- Rules are defined once and apply everywhere the view is accessed — no code changes needed.
- DCL objects must have the same name as the CDS view they protect.
- Use `@AccessControl.authorizationCheck: #CHECK` for production, `#NOT_REQUIRED` for development.
- Child entities can inherit parent access control, ensuring consistent authorization.

## Next Lesson

Module 2 is complete — you can model data with CDS views including joins, associations, compositions, annotations, parameters, and access control. Now it's time to build applications. In Lesson 13, we'll start **Module 3: RAP Fundamentals** — understanding the big picture of the ABAP RESTful Application Programming Model and how CDS views become interactive business applications.
