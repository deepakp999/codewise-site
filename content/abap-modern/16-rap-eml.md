---
title: "Entity Manipulation Language (EML) — CRUD Operations in Code"
description: "Learn EML, the ABAP language extension for programmatically reading, creating, updating, and deleting RAP business objects."
order: 16
module: "rap-fundamentals"
module_title: "RAP Fundamentals"
tags: ["eml", "entity manipulation language", "rap crud", "read entities", "modify entities"]
prev_slug: "rap-service-definition-binding"
next_slug: "rap-unmanaged-bo"
---

# Entity Manipulation Language (EML)

## What You'll Learn
- What EML is and when you need it
- READ ENTITIES — fetching BO data
- MODIFY ENTITIES — create, update, delete
- COMMIT ENTITIES — persisting changes
- Using EML inside behavior implementations

## What Is EML?

EML is ABAP's extension for interacting with RAP business objects. Think of it as "Open SQL for business objects." Just as you use SELECT to read database tables, you use READ ENTITIES to read BOs. Just as you use INSERT/UPDATE/DELETE for tables, you use MODIFY ENTITIES for BOs.

The critical difference: EML goes through the RAP framework. Validations fire, determinations execute, authorization checks apply. Direct SQL bypasses all of that.

## READ ENTITIES

```abap
" Read specific fields from a Sales Order
READ ENTITIES OF ZI_TM_SalesOrder
  ENTITY SalesOrder
    FIELDS ( OrderId CustomerId Status TotalAmount )
    WITH VALUE #( ( %key-OrderUUID = lv_order_uuid ) )
  RESULT DATA(lt_orders)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

IF ls_failed-salesorder IS NOT INITIAL.
  " Order not found or authorization failed
  RETURN.
ENDIF.

DATA(ls_order) = lt_orders[ 1 ].
```

Read with association — get order AND its items:

```abap
READ ENTITIES OF ZI_TM_SalesOrder
  ENTITY SalesOrder
    ALL FIELDS WITH VALUE #( ( %key-OrderUUID = lv_order_uuid ) )
  RESULT DATA(lt_orders)
  
  ENTITY SalesOrder BY \_Items
    ALL FIELDS WITH VALUE #( ( %key-OrderUUID = lv_order_uuid ) )
  RESULT DATA(lt_items).
```

## MODIFY ENTITIES — Create

```abap
" Create a new Sales Order with line items
MODIFY ENTITIES OF ZI_TM_SalesOrder
  ENTITY SalesOrder
    CREATE FIELDS ( CustomerId OrderDate Status Currency )
    WITH VALUE #( (
      %cid       = 'new_order_1'
      CustomerId = 'CUST-42'
      OrderDate  = cl_abap_context_info=>get_system_date( )
      Status     = 'N'
      Currency   = 'USD'
    ) )
    
    CREATE BY \_Items FIELDS ( ProductId Quantity Price Currency )
    WITH VALUE #( (
      %cid_ref = 'new_order_1'
      %target  = VALUE #(
        ( %cid = 'item_1' ProductId = 'WIDGET-A' Quantity = 5 Price = '49.99' Currency = 'USD' )
        ( %cid = 'item_2' ProductId = 'GADGET-X' Quantity = 1 Price = '199.99' Currency = 'USD' )
      )
    ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

**`%cid`** (Content ID) is a temporary identifier for entities that don't have a key yet (UUID hasn't been generated). `%cid_ref` links children to their parent by referencing the parent's `%cid`.

## MODIFY ENTITIES — Update

```abap
" Update the status of an order
MODIFY ENTITIES OF ZI_TM_SalesOrder
  ENTITY SalesOrder
    UPDATE FIELDS ( Status )
    WITH VALUE #( (
      %key-OrderUUID = lv_order_uuid
      Status = 'P'  " In Process
    ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## MODIFY ENTITIES — Delete

```abap
" Delete an order (cascades to items via composition)
MODIFY ENTITIES OF ZI_TM_SalesOrder
  ENTITY SalesOrder
    DELETE FROM VALUE #( ( %key-OrderUUID = lv_order_uuid ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## COMMIT ENTITIES

EML operations are transactional. Nothing is persisted until you commit:

```abap
COMMIT ENTITIES
  RESPONSE OF ZI_TM_SalesOrder
    FAILED DATA(ls_commit_failed)
    REPORTED DATA(ls_commit_reported).

IF ls_commit_failed IS INITIAL.
  " Success
ELSE.
  " Handle errors
ENDIF.
```

**Important:** Inside behavior implementations (validations, determinations, actions), you NEVER call COMMIT ENTITIES. The framework manages the transaction. COMMIT is only for standalone EML usage outside the BO lifecycle.

## EML Inside Behavior Implementations

When reading data inside a handler method (e.g., validation), use `IN LOCAL MODE`:

```abap
" Inside a validation method
READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
  ENTITY SalesOrder
    FIELDS ( CustomerId Status )
    WITH CORRESPONDING #( keys )
  RESULT DATA(lt_orders).
```

`IN LOCAL MODE` bypasses authorization and feature control — you're already inside the BO, so re-checking authorization would cause infinite loops.

## The Response Structure

Every EML operation returns three structures:

| Structure | Contains |
|---|---|
| `MAPPED` | Successfully mapped instances with their generated keys |
| `FAILED` | Instances that failed (with `%fail-cause`) |
| `REPORTED` | Messages to display to the user |

```abap
" Check if creation succeeded
IF ls_mapped-salesorder IS NOT INITIAL.
  " Get the generated UUID
  DATA(lv_new_uuid) = ls_mapped-salesorder[ 1 ]-%key-OrderUUID.
ENDIF.
```

## Common Mistakes

- **Calling COMMIT ENTITIES inside a handler** — The framework commits. You don't. Calling COMMIT inside a validation or determination causes a runtime error.
- **Forgetting IN LOCAL MODE** — Without it, EML inside a handler triggers authorization checks and potentially infinite loops.
- **Mixing EML and direct SQL** — Never do `INSERT ztm_salesorder` alongside EML. Use EML exclusively for BO data. Direct SQL bypasses validations and breaks data integrity.
- **Not handling FAILED** — Always check `FAILED` after EML operations. Silent failures lead to data loss.

## Key Takeaways

- EML is the ABAP language extension for RAP business object operations — READ, MODIFY (create/update/delete), COMMIT.
- `%cid` links parent and child during creation before UUIDs are generated.
- Inside behavior implementations, use `IN LOCAL MODE` and never call `COMMIT ENTITIES`.
- Always check FAILED and REPORTED structures after EML operations.
- EML goes through the full RAP lifecycle — validations, determinations, authorization. Direct SQL doesn't.

## Next Lesson

Managed RAP is ideal for new applications. But TechMart has legacy code — BAPIs for order processing that still work fine. In Lesson 17, we'll learn **unmanaged RAP** — wrapping existing persistence logic in a RAP service.
