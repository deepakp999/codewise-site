---
title: "Feature Control and Authorization — Dynamic UI Behavior in RAP"
description: "Learn to dynamically enable, disable, or hide fields and operations based on business rules using RAP instance and static feature control."
order: 22
module: "rap-advanced"
module_title: "RAP Advanced Features"
tags: ["rap feature control", "dynamic ui", "authorization", "field control", "abap rap"]
prev_slug: "rap-draft"
next_slug: "rap-testing-and-clean-core"
---

# Feature Control and Authorization

## What You'll Learn
- What feature control is and why it matters
- Instance feature control: per-record dynamic behavior
- Static feature control: global operation control
- Field-level control: read-only fields based on status
- RAP authorization checks

## Why Feature Control?

Without feature control, every button and field is always available. Users can try to delete approved orders, edit completed orders, or approve already-approved orders. The validation would reject the action, but the user sees an error instead of not seeing the button at all.

Feature control prevents the action from being offered. No button = no confusion.

## Instance Feature Control

Controls operations per record — "this specific order can/can't be edited."

**Step 1: Declare in behavior definition**

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  action approve result [1] $self;
  
  instance features;  -- Enable instance feature control
}
```

**Step 2: Implement**

```abap
METHOD get_instance_features.
  " Read current state of each order
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      FIELDS ( Status )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_orders).

  result = VALUE #( FOR ls_order IN lt_orders (
    %tky = ls_order-%tky

    " Can only delete New or Cancelled orders
    %delete = COND #(
      WHEN ls_order-Status = 'N' OR ls_order-Status = 'X'
      THEN if_abap_behv=>fc-o-enabled
      ELSE if_abap_behv=>fc-o-disabled )

    " Can only update non-completed orders
    %update = COND #(
      WHEN ls_order-Status = 'C'
      THEN if_abap_behv=>fc-o-disabled
      ELSE if_abap_behv=>fc-o-enabled )

    " Can only approve New orders
    %action-approve = COND #(
      WHEN ls_order-Status = 'N'
      THEN if_abap_behv=>fc-o-enabled
      ELSE if_abap_behv=>fc-o-disabled )
  ) ).
ENDMETHOD.
```

In the Fiori UI:
- Approved orders: no Edit button, no Delete button, no Approve button
- New orders: all buttons visible
- Completed orders: read-only, only Delete visible for admins

## Static Feature Control

Controls operations globally — "can ANY user create new orders?"

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  static features;
}
```

```abap
METHOD get_global_features.
  " Example: disable creation during system maintenance
  " In practice, check a configuration table or system parameter

  DATA(lv_maintenance) = abap_false.  " Would check a real flag

  IF lv_maintenance = abap_true.
    result-%create = if_abap_behv=>fc-o-disabled.
  ENDIF.
ENDMETHOD.
```

## Field-Level Control

Make specific fields read-only based on the record's state:

```abap
" In get_instance_features
result = VALUE #( FOR ls_order IN lt_orders (
    %tky = ls_order-%tky

    " Customer can't be changed after approval
    %field-CustomerId = COND #(
      WHEN ls_order-Status = 'N'
      THEN if_abap_behv=>fc-f-unrestricted
      ELSE if_abap_behv=>fc-f-read_only )

    " Order date is always read-only (set by system)
    %field-OrderDate = if_abap_behv=>fc-f-read_only

    " Status is always read-only (changed by actions only)
    %field-Status = if_abap_behv=>fc-f-read_only
) ).
```

Field control values:
- `fc-f-unrestricted` — fully editable
- `fc-f-read_only` — visible but not editable
- `fc-f-mandatory` — must be filled (shows asterisk in UI)

## RAP Authorization

RAP authorization checks happen separately from feature control:

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
  authorization master ( global, instance )
{
  ...
}
```

```abap
METHOD get_instance_authorizations.
  " Check user authorization for each instance
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      FIELDS ( Country )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_orders).

  LOOP AT lt_orders INTO DATA(ls_order).
    " Check authorization object
    AUTHORITY-CHECK OBJECT 'Z_TM_ORD'
      ID 'ACTVT' FIELD '02'        " Change
      ID 'ZREGION' FIELD ls_order-Country.

    DATA(lv_authorized) = COND #(
      WHEN sy-subrc = 0 THEN if_abap_behv=>auth-allowed
      ELSE if_abap_behv=>auth-unauthorized ).

    APPEND VALUE #(
      %tky = ls_order-%tky
      %update = lv_authorized
      %delete = lv_authorized
      %action-approve = lv_authorized
    ) TO result.
  ENDLOOP.
ENDMETHOD.
```

## Feature Control vs Authorization vs Validation

| Mechanism | Purpose | When It Runs | Effect |
|---|---|---|---|
| Feature Control | UI behavior — show/hide buttons | Before UI renders | Button hidden/disabled |
| Authorization | Access control — who can do what | On operation request | 403 Unauthorized |
| Validation | Data quality — is the data valid | On save | Error message |

All three work together:
1. Feature control hides the Approve button for non-New orders
2. Authorization checks if the user is allowed to approve
3. Validation confirms the data is valid for approval

## Common Mistakes

- **Using validation instead of feature control** — If an operation should never be available for a given status, use feature control to hide the button. Don't let users click it and then show an error.
- **Forgetting to declare `instance features`** — Without this line in the behavior definition, `get_instance_features` is never called.
- **Not returning results for all keys** — The method receives a table of keys. Return feature control for EVERY key, not just the first one.
- **Hardcoding authorization** — Use SAP authorization objects, not hardcoded user checks.

## Key Takeaways

- Feature control dynamically shows/hides operations and fields based on record state.
- Instance feature control: per-record (approved orders can't be deleted). Static feature control: global (maintenance mode disables creation).
- Field-level control: make fields read-only, mandatory, or unrestricted based on status.
- Feature control, authorization, and validation are three complementary mechanisms — use all three.
- Feature control improves UX by preventing impossible actions, not just rejecting them.

## Next Lesson

The Sales Order app is feature-complete. In Lesson 23, we'll make it **production-ready** — writing ABAP Unit tests for our validations and actions, running ATC clean core checks, and ensuring the code is upgrade-safe.
