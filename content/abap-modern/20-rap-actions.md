---
title: "Actions in RAP — Static, Instance, and Factory Actions"
description: "Learn to implement RAP actions for custom business operations like approving orders, copying records, and triggering workflows."
order: 20
module: "rap-advanced"
module_title: "RAP Advanced Features"
tags: ["rap actions", "instance action", "static action", "factory action", "abap rap"]
prev_slug: "rap-validations-determinations"
next_slug: "rap-draft"
---

# Actions — Static, Instance, and Factory Actions

## What You'll Learn
- What actions are and the three types
- Instance actions: operations on a specific record
- Static actions: operations without selecting a record
- Factory actions: creating new records from existing ones
- Action parameters and result types

## What Are Actions?

Actions are custom operations beyond standard CRUD. They appear as buttons in the Fiori UI. TechMart needs:

- **Approve Order** — change status from New to Approved (instance action)
- **Create with Reference** — copy an existing order (factory action)
- **Generate Daily Report** — runs without selecting an order (static action)

## Instance Action — Approve Order

An instance action operates on a selected record.

**Step 1: Declare in behavior definition**

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  action approve result [1] $self;
}
```

`result [1] $self` means the action returns the updated instance.

**Step 2: Implement**

```abap
METHOD approve.
  " Read current status
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      FIELDS ( Status OrderId )
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_orders).

  LOOP AT lt_orders INTO DATA(ls_order).
    " Only New orders can be approved
    IF ls_order-Status <> 'N'.
      APPEND VALUE #( %tky = ls_order-%tky ) TO failed-salesorder.
      APPEND VALUE #( %tky = ls_order-%tky
        %msg = new_message_with_text(
          severity = if_abap_behv_message=>severity-error
          text = |Order { ls_order-OrderId } cannot be approved (status is not New)| )
      ) TO reported-salesorder.
      CONTINUE.
    ENDIF.

    " Update status to Approved
    MODIFY ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
      ENTITY SalesOrder
        UPDATE FIELDS ( Status )
        WITH VALUE #( (
          %tky   = ls_order-%tky
          Status = 'A'
        ) )
      REPORTED DATA(ls_rep).
  ENDLOOP.

  " Return updated instances
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      ALL FIELDS
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_result).
  result = VALUE #( FOR ls_r IN lt_result (
    %tky = ls_r-%tky  %param = ls_r ) ).
ENDMETHOD.
```

## Static Action — No Instance Selection

A static action doesn't need a selected record.

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  static action generateReport;
}
```

```abap
METHOD generateReport.
  " Business logic that doesn't depend on a specific order
  " For example: generate a daily summary, trigger batch processing
  
  APPEND VALUE #(
    %msg = new_message_with_text(
      severity = if_abap_behv_message=>severity-success
      text = |Daily report generation started| )
  ) TO reported-salesorder.
ENDMETHOD.
```

## Factory Action — Create from Existing

A factory action creates a new instance, often by copying an existing one.

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  factory action copyOrder [1];
}
```

```abap
METHOD copyOrder.
  " Read the source order
  READ ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      ALL FIELDS
      WITH CORRESPONDING #( keys )
    RESULT DATA(lt_source).

  DATA(ls_source) = lt_source[ 1 ].

  " Create a copy with New status and today's date
  MODIFY ENTITIES OF ZI_TM_SalesOrder IN LOCAL MODE
    ENTITY SalesOrder
      CREATE FIELDS ( CustomerId OrderDate Status Currency )
      WITH VALUE #( (
        %cid       = 'copy_1'
        CustomerId = ls_source-CustomerId
        OrderDate  = cl_abap_context_info=>get_system_date( )
        Status     = 'N'
        Currency   = ls_source-Currency
      ) )
    MAPPED DATA(ls_mapped).

  " Return the new instance
  mapped-salesorder = ls_mapped-salesorder.
ENDMETHOD.
```

## Actions with Parameters

Actions can accept input. Define an abstract entity for the parameter:

```sql
@EndUserText.label: 'Rejection Reason'
DEFINE ABSTRACT ENTITY ZA_TM_RejectParams
{
  Reason : abap.string(200);
}
```

Declare the action with the parameter:

```
action rejectOrder parameter ZA_TM_RejectParams result [1] $self;
```

Access the parameter in the implementation:

```abap
METHOD rejectOrder.
  DATA(lv_reason) = keys[ 1 ]-%param-Reason.
  " Store reason, update status to Rejected, etc.
ENDMETHOD.
```

## Exposing Actions in the Projection

Actions declared at the interface level must be exposed in the projection:

```
projection;
define behavior for ZC_TM_SalesOrder alias SalesOrder
{
  use action approve;
  use action copyOrder;
  use action rejectOrder;
  use static action generateReport;
}
```

And add UI annotations to show the button:

```sql
@UI.lineItem: [{ type: #FOR_ACTION, dataAction: 'approve',
                  label: 'Approve', position: 10 }]
```

## Common Mistakes

- **Instance action on multiple selections** — RAP actions receive a table of keys. Loop through all of them, don't just process `keys[ 1 ]`.
- **Forgetting to return result** — If the behavior definition says `result [1] $self`, the method MUST populate the `result` parameter. Otherwise the Fiori UI won't refresh.
- **Not exposing in projection** — An action declared at the interface level but not exposed in the projection behavior won't appear in the Fiori app.
- **Mixing action and validation logic** — Actions should execute operations. Put data validation in validations, not in actions.

## Key Takeaways

- Actions are custom operations beyond CRUD — they appear as buttons in Fiori.
- Instance actions operate on selected records. Static actions don't need selection. Factory actions create new records.
- Use abstract entities for action parameters (user input).
- Actions must be exposed in the projection behavior with `use action`.
- Add `@UI.lineItem` annotations with `type: #FOR_ACTION` to display action buttons.

## Next Lesson

TechMart's users want to save partial work and come back later. In Lesson 21, we'll implement **draft handling** — the auto-save mechanism that lets users edit without committing, resuming later where they left off.
