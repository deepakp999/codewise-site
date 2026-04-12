---
title: "Draft Handling — Save Incomplete Work in RAP"
description: "Learn how RAP draft handling enables auto-save, resume editing, and safe concurrent access in Fiori apps."
order: 21
module: "rap-advanced"
module_title: "RAP Advanced Features"
tags: ["rap draft", "draft handling", "auto save", "fiori draft", "abap rap"]
prev_slug: "rap-actions"
next_slug: "rap-feature-control"
---

# Draft Handling — Save Incomplete Work

## What You'll Learn
- What draft handling is and why it matters
- How draft works technically (draft tables, draft actions)
- The draft lifecycle: new → edit → activate/discard
- Side effects — refresh fields after changes
- Draft-specific behavior features

## Why Draft?

Without draft, users must complete and save in a single session. Close the browser? Data gone. Network hiccup? Data gone. Need approval from a colleague before saving? You can't.

Draft handling stores incomplete data in a separate draft table. Users can:
- Start editing and come back hours later
- Switch devices mid-edit
- Get interrupted without losing work
- Share draft for review before finalizing

Every production Fiori app uses draft. It's not optional — it's expected.

## How We Already Enabled Draft

In Lesson 14, we added `with draft` and `draft table` to the behavior definition:

```
managed implementation in class zbp_i_tm_salesorder unique;
with draft;

define behavior for ZI_TM_SalesOrder alias SalesOrder
persistent table ztm_salesorder
draft table ztm_so_d          -- Draft data goes here
lock master total etag LastChangedAt
{
  ...
}
```

The `draft table` is a copy of the persistent table with additional draft metadata columns. ADT generates it for you — use the quick fix (Ctrl+1) on the behavior definition.

## The Draft Lifecycle

```
1. User clicks CREATE or EDIT
   → Framework creates a draft record in ztm_so_d
   → Persistent table is unchanged

2. User edits fields, adds line items
   → Changes saved to draft table automatically
   → Determinations with "on modify" fire
   → No changes to persistent table yet

3. User clicks SAVE (Activate)
   → Validations run ("on save")
   → If valid: draft → persistent table, draft deleted
   → If invalid: errors shown, draft preserved

4. User clicks DISCARD (Cancel)
   → Draft deleted, no changes to persistent table
```

## Draft Actions in the Behavior Definition

Draft adds these automatic actions:

```
define behavior for ZI_TM_SalesOrder alias SalesOrder
{
  ...
  draft action Edit;               -- Enter edit mode (create draft from active)
  draft action Activate;            -- Save (move draft to active)
  draft action Discard;             -- Cancel (delete draft)
  draft action Resume;              -- Continue editing a saved draft
  draft determine action Prepare;   -- Validate before activating
}
```

These are generated automatically when you declare `with draft`. You don't implement them — the framework handles them.

## The `Prepare` Action

`draft determine action Prepare` runs all `on save` validations when the user clicks Save, BEFORE actually activating the draft. If validations fail, the draft stays, and the user sees error messages.

This is how RAP separates "save draft" (automatic, no validation) from "activate" (validation required).

## Side Effects — Real-Time UI Updates

When a user changes a field, you often want other fields to update immediately. For example: changing an item's quantity should recalculate the order total.

Declare side effects in the behavior definition:

```
define behavior for ZI_TM_SalesOrderItem alias SalesOrderItem
{
  ...
  side effects {
    field Quantity affects field _SalesOrder.TotalAmount;
    field Price affects field _SalesOrder.TotalAmount;
  }
}
```

When `Quantity` changes, the framework:
1. Runs the `determineTotal` determination (on modify)
2. Refreshes the `TotalAmount` field in the Fiori UI

No manual UI refresh needed.

## The %is_draft Indicator

In code, you can check whether you're working with a draft or active instance:

```abap
" In a handler method
LOOP AT lt_orders INTO DATA(ls_order).
  IF ls_order-%is_draft = if_abap_behv=>mk-on.
    " This is a draft — partial data expected
  ELSE.
    " This is an active record — full validation applies
  ENDIF.
ENDLOOP.
```

This is useful for validations that should be lenient in draft mode (e.g., allow empty required fields during editing) but strict on activation.

## Common Mistakes

- **Strict validation in draft mode** — Users expect to save partial work. Don't reject drafts for empty required fields. Validate strictly only in `on save` / Prepare.
- **Forgetting draft tables for children** — Every entity in the BO hierarchy needs its own draft table. Parent AND child.
- **Not declaring `with draft` on associations** — The behavior definition must say `association _Items { create; with draft; }` — the `with draft` is required.
- **Heavy on modify determinations** — In draft mode, `on modify` fires on every field change. Keep these lightweight.
- **Not testing draft → activate flow** — The Fiori preview's Save button activates the draft. Test the full cycle: create → edit → save → verify active data.

## Key Takeaways

- Draft stores incomplete data in a separate table — users can save, leave, and resume.
- Draft is enabled with `with draft` + `draft table` in the behavior definition.
- The lifecycle: Edit → draft saved automatically → Activate (validates + persists) or Discard.
- Side effects refresh related fields in real-time when data changes during editing.
- Validate leniently in draft mode, strictly on activation (Prepare action).

## Next Lesson

The Sales Order app has CRUD, validations, actions, and draft. But there's one more piece: controlling what users CAN and CAN'T do based on the record's state. In Lesson 22, we'll implement **feature control** — hiding the Delete button on approved orders, disabling the Approve button on already-approved orders, and making fields read-only based on status.
