---
title: "Validations and Determinations — Business Rules in RAP"
description: "Learn to implement RAP validations (reject bad data) and determinations (auto-calculate values) for TechMart's Sales Order app."
order: 19
module: "rap-advanced"
module_title: "RAP Advanced Features"
tags: ["rap validation", "rap determination", "business rules", "on save", "on modify"]
prev_slug: "rap-query-implementation"
next_slug: "rap-actions"
---

# Validations and Determinations — Business Rules in RAP

## What You'll Learn
- Validations: reject invalid data before save
- Determinations: auto-fill or calculate fields
- Trigger timing: `on save` vs `on modify`
- Implementing TechMart business rules
- Error messages and the `failed`/`reported` pattern

## Validations — Reject Bad Data

A validation checks data and rejects the save if something is wrong. It doesn't change data — it only accepts or rejects.

**Step 1: Declare in behavior definition**

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  validation validateCustomer on save { create; update;
    field CustomerId; }
  validation validateStatus on save { create; update;
    field Status; }
}
```

`on save` means the validation runs when the user clicks Save. `field CustomerId` means it triggers when that field changes.

**Step 2: Implement in handler class**

```abap
METHOD validateCustomer.
  " Read the orders being validated
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      FIELDS ( CustomerId )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_orders).

  " Check each order
  LOOP AT lt_orders INTO DATA(ls_order).
    IF ls_order-CustomerId IS INITIAL.
      " Reject — Customer ID is required
      APPEND VALUE #( %tky = ls_order-%tky ) TO failed-salesorder.
      APPEND VALUE #( %tky = ls_order-%tky
        %msg = new_message_with_text(
          severity = if_abap_behv_message=>severity-error
          text = |Customer ID is required| )
        %element-CustomerId = if_abap_behv=>mk-on
      ) TO reported-salesorder.
      
    ELSE.
      " Check if customer exists
      SELECT SINGLE @abap_true FROM ztm_customer
        WHERE customer_id = @ls_order-CustomerId
        INTO @DATA(lv_exists).
        
      IF lv_exists <> abap_true.
        APPEND VALUE #( %tky = ls_order-%tky ) TO failed-salesorder.
        APPEND VALUE #( %tky = ls_order-%tky
          %msg = new_message_with_text(
            severity = if_abap_behv_message=>severity-error
            text = |Customer { ls_order-CustomerId } does not exist| )
          %element-CustomerId = if_abap_behv=>mk-on
        ) TO reported-salesorder.
      ENDIF.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

The `%element-CustomerId = if_abap_behv=>mk-on` highlights the specific field in the Fiori UI with a red error marker.

## Determinations — Auto-Calculate Values

A determination automatically sets field values when data changes. It modifies data — the opposite of a validation.

**Step 1: Declare in behavior definition**

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  determination determineOrderId on save { create; }
  determination determineTotal on modify { field Currency;
    create; }
}
```

`on save` runs once when saving. `on modify` runs immediately when a field changes (useful for real-time calculations in draft mode).

**Step 2: Implement — Generate a human-readable Order ID**

```abap
METHOD determineOrderId.
  " Read orders that need an ID
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      FIELDS ( OrderId )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_orders).

  " Only set ID if it's empty (new orders)
  DELETE lt_orders WHERE OrderId IS NOT INITIAL.
  CHECK lt_orders IS NOT INITIAL.

  " Get the next number
  SELECT MAX( order_id ) FROM ztm_salesorder INTO @DATA(lv_max_id).
  DATA(lv_next) = lv_max_id + 1.

  " Update each new order
  MODIFY ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      UPDATE FIELDS ( OrderId )
      WITH VALUE #(
        FOR ls_order IN lt_orders (
          %tky    = ls_order-%tky
          OrderId = lv_next
        ) )
    REPORTED DATA(ls_reported).
ENDMETHOD.
```

**Step 3: Implement — Auto-calculate total from line items**

```abap
METHOD determineTotal.
  " Read orders and their items
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      ALL FIELDS
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_orders).

  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder BY \_Items
      ALL FIELDS
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_items).

  " Calculate totals
  LOOP AT lt_orders INTO DATA(ls_order).
    DATA(lv_total) = REDUCE ztm_amount(
      INIT sum = CONV ztm_amount( 0 )
      FOR ls_item IN lt_items WHERE ( OrderUUID = ls_order-OrderUUID )
      NEXT sum = sum + ( ls_item-Quantity * ls_item-Price )
    ).

    " Update the order total
    MODIFY ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
      ENTITY SalesOrder
        UPDATE FIELDS ( TotalAmount )
        WITH VALUE #( (
          %tky        = ls_order-%tky
          TotalAmount = lv_total
        ) )
      REPORTED DATA(ls_rep).
  ENDLOOP.
ENDMETHOD.
```

## On Save vs On Modify

| Timing | When It Runs | Best For |
|---|---|---|
| `on save` | User clicks Save | Final checks, number generation, validation |
| `on modify` | Immediately on field change | Real-time calculations, auto-fill, UI responsiveness |

`on modify` is more responsive but runs more often. Keep the logic lightweight.

## Common Mistakes

- **Validations that modify data** — Validations should only check and report. Use determinations to change data.
- **Determinations that reject** — Determinations should only set values. Use validations to reject.
- **Not using IN LOCAL MODE** — Inside handlers, always read/modify with `IN LOCAL MODE` to avoid authorization loops.
- **Heavy logic in on modify** — `on modify` runs on every field change. If your determination does a complex aggregation, it'll fire constantly during editing. Use `on save` for expensive operations.
- **Missing %tky** — Always use `%tky` (transactional key) from the `keys` parameter. Using `%key` can fail in draft scenarios.

## Key Takeaways

- Validations reject bad data (check + report errors). Determinations auto-fill data (read + modify).
- `on save` runs at save time. `on modify` runs immediately on field change.
- Always append to `failed` and `reported` in validations. Use `%element` to highlight specific fields.
- Determinations use `MODIFY ENTITIES IN LOCAL MODE` to update the current BO data.
- Keep `on modify` determinations lightweight; use `on save` for expensive operations.

## Next Lesson

Validations prevent bad data. Determinations auto-calculate values. But users also need custom operations — "Approve this order", "Copy this order", "Generate a report." In Lesson 20, we'll build **RAP Actions** — custom buttons that execute business logic.
