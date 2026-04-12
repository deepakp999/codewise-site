---
title: "Building Your First RAP Managed Business Object"
description: "Step-by-step guide to building a complete managed RAP business object for TechMart's Sales Order app — from CDS views to Fiori preview."
order: 14
module: "rap-fundamentals"
module_title: "RAP Fundamentals"
tags: ["rap managed", "business object", "behavior definition", "abap rap tutorial"]
prev_slug: "what-is-rap"
next_slug: "rap-service-definition-binding"
---

# Building Your First RAP Managed Business Object

## What You'll Learn
- How to create database tables for RAP (with UUID keys)
- Building the complete CDS view stack (interface + projection)
- Writing a behavior definition
- Creating a behavior implementation class
- The managed BO end-to-end flow

## Step 1 — Database Tables

RAP managed BOs work best with UUID primary keys (not sequential numbers). This avoids numbering conflicts in concurrent systems:

```abap
@EndUserText.label : 'TechMart Sales Order'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
DEFINE TABLE ztm_salesorder {
  key client       : abap.clnt NOT NULL;
  key order_uuid   : sysuuid_x16 NOT NULL;
      order_id     : abap.numc(10);
      customer_id  : abap.char(10);
      order_date   : abap.dats;
      status       : abap.char(1);
      amount       : abap.curr(15,2);
      currency     : abap.cuky;
      created_by   : syuname;
      created_at   : timestampl;
      last_changed_by : syuname;
      last_changed_at : timestampl;
      local_last_changed_at : timestampl;
}
```

**Why UUID?** In managed RAP, the framework creates records before the user clicks "save" (especially with draft). Sequential numbering would create gaps and conflicts. UUIDs are globally unique — no conflicts, no locks needed for number generation.

## Step 2 — Interface CDS Views

You already created these in Module 2. Here's the final version with administrative fields that RAP needs:

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'TechMart Sales Order'

DEFINE ROOT VIEW ENTITY ZI_TM_SalesOrder
  AS SELECT FROM ztm_salesorder
  COMPOSITION [0..*] OF ZI_TM_SalesOrderItem AS _Items
  ASSOCIATION [0..1] TO ZI_TM_Customer AS _Customer
    ON $projection.CustomerId = _Customer.CustomerId
{
  key order_uuid         AS OrderUUID,
      order_id           AS OrderId,
      customer_id        AS CustomerId,
      order_date         AS OrderDate,
      status             AS Status,
      amount             AS TotalAmount,
      currency           AS Currency,
      
      @Semantics.user.createdBy: true
      created_by         AS CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at         AS CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by    AS LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at    AS LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at AS LocalLastChangedAt,
      
      _Items,
      _Customer
}
```

Notice the **`ROOT`** keyword — `DEFINE ROOT VIEW ENTITY`. This tells RAP this entity is the root of the business object.

The `@Semantics` annotations on administrative fields tell the managed framework to auto-fill them. You never write code to set `CreatedBy` or `LastChangedAt` — the framework handles it.

## Step 3 — Behavior Definition

In ADT: Right-click `ZI_TM_SalesOrder` → **New Behavior Definition**

```
managed implementation in class zbp_i_tm_salesorder unique;
strict ( 2 );
with draft;

define behavior for ZI_TM_SalesOrder alias SalesOrder
persistent table ztm_salesorder
draft table ztm_so_d
lock master total etag LastChangedAt
authorization master ( global )
etag master LocalLastChangedAt
{
  field ( readonly ) OrderUUID, CreatedBy, CreatedAt,
                     LastChangedBy, LastChangedAt, LocalLastChangedAt;
  field ( numbering : managed ) OrderUUID;

  create;
  update;
  delete;

  association _Items { create; with draft; }

  mapping for ztm_salesorder corresponding
  {
    OrderUUID = order_uuid;
    OrderId = order_id;
    CustomerId = customer_id;
    OrderDate = order_date;
    Status = status;
    TotalAmount = amount;
    Currency = currency;
    CreatedBy = created_by;
    CreatedAt = created_at;
    LastChangedBy = last_changed_by;
    LastChangedAt = last_changed_at;
    LocalLastChangedAt = local_last_changed_at;
  }
}

define behavior for ZI_TM_SalesOrderItem alias SalesOrderItem
persistent table ztm_soitem
draft table ztm_soi_d
lock dependent by _SalesOrder
authorization dependent by _SalesOrder
etag master LocalLastChangedAt
{
  field ( readonly ) OrderUUID, ItemUUID;
  field ( numbering : managed ) ItemUUID;

  update;
  delete;

  association _SalesOrder { with draft; }

  mapping for ztm_soitem corresponding
  {
    ItemUUID = item_uuid;
    OrderUUID = order_uuid;
    ProductId = product_id;
    Quantity = quantity;
    Price = price;
    Currency = currency;
    LocalLastChangedAt = local_last_changed_at;
  }
}
```

Let's break down the critical lines:

| Line | Meaning |
|---|---|
| `managed implementation in class` | Framework handles persistence |
| `strict ( 2 )` | Enable latest RAP feature set |
| `with draft` | Enable draft/autosave |
| `persistent table` | Where to store data |
| `draft table` | Where to store draft data |
| `lock master` | This entity controls locking |
| `etag master` | Optimistic concurrency field |
| `field ( readonly )` | Users can't edit these fields |
| `field ( numbering : managed )` | Framework generates UUIDs |
| `create; update; delete;` | Enable CRUD operations |
| `association _Items { create; }` | Allow creating children from parent |
| `mapping for ... corresponding` | Map CDS fields to table columns |

## Step 4 — Behavior Implementation Class

ADT can generate the class skeleton. Click the quick fix (Ctrl+1) on the behavior definition → "Create behavior implementation class."

For a basic managed BO with no custom logic yet, the class is nearly empty:

```abap
CLASS zbp_i_tm_salesorder DEFINITION PUBLIC ABSTRACT FINAL
  FOR BEHAVIOR OF ZI_TM_SalesOrder.
ENDCLASS.

CLASS zbp_i_tm_salesorder IMPLEMENTATION.
ENDCLASS.
```

That's it. The managed framework handles all CRUD operations automatically. We'll add validations, determinations, and actions in Module 4.

## Step 5 — Projection Views and Behavior

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Sales Order - App Projection'
@Metadata.allowExtensions: true

DEFINE ROOT VIEW ENTITY ZC_TM_SalesOrder
  PROVIDER CONTRACT transactional_query
  AS PROJECTION ON ZI_TM_SalesOrder
{
  key OrderUUID,
      OrderId,
      CustomerId,
      OrderDate,
      Status,
      TotalAmount,
      Currency,
      CreatedBy,
      CreatedAt,
      LastChangedBy,
      LastChangedAt,
      LocalLastChangedAt,
      
      _Items : REDIRECTED TO COMPOSITION CHILD ZC_TM_SalesOrderItem,
      _Customer
}
```

Behavior projection (separate file):

```
projection;
strict ( 2 );
use draft;

define behavior for ZC_TM_SalesOrder alias SalesOrder
use etag
{
  use create;
  use update;
  use delete;

  use association _Items { create; with draft; }
}

define behavior for ZC_TM_SalesOrderItem alias SalesOrderItem
use etag
{
  use update;
  use delete;

  use association _SalesOrder { with draft; }
}
```

The projection behavior uses `use` instead of defining new operations — it selects which behaviors from the interface layer this app exposes.

## The Complete Artifact List

After this lesson, you've created:

```
✓ ztm_salesorder        (database table)
✓ ztm_soitem            (database table)
✓ ztm_so_d              (draft table - auto-generated)
✓ ztm_soi_d             (draft table - auto-generated)
✓ ZI_TM_SalesOrder      (interface CDS - root)
✓ ZI_TM_SalesOrderItem  (interface CDS - child)
✓ ZC_TM_SalesOrder      (projection CDS - root)
✓ ZC_TM_SalesOrderItem  (projection CDS - child)
✓ Behavior Definition    (on ZI_TM_SalesOrder)
✓ Behavior Projection    (on ZC_TM_SalesOrder)
✓ zbp_i_tm_salesorder   (behavior implementation class)
```

## Common Mistakes

- **Forgetting the mapping block** — Without `mapping for ... corresponding`, the framework can't save CDS field values to table columns. Activation fails.
- **Missing administrative fields** — `@Semantics.user.createdBy`, `@Semantics.systemDateTime.createdAt`, etc. are required for managed BOs with draft. Skip them and draft breaks.
- **Using sequential keys instead of UUIDs** — Managed numbering works with UUIDs. If you want a human-readable order number, use a determination (Lesson 19) to generate it after creation.
- **Forgetting `lock dependent by`** — Child entities must declare their lock dependency on the parent. Without it, concurrent editing can corrupt data.
- **Not creating the draft tables** — The `draft table` in the behavior definition must exist. ADT can generate them — use the quick fix.

## Key Takeaways

- A managed RAP BO has: database tables, interface CDS views with compositions, behavior definition, behavior implementation class, projection views, and behavior projection.
- The managed framework handles persistence (INSERT/UPDATE/DELETE), locking, draft, UUID numbering, and administrative fields automatically.
- `DEFINE ROOT VIEW ENTITY` marks the BO root. Children use `COMPOSITION`/`TO PARENT`.
- The behavior definition is the central artifact — it declares CRUD, field properties, and maps CDS fields to table columns.
- For a basic managed BO with no custom logic, the implementation class is nearly empty. The framework does the work.

## Next Lesson

You've built the BO but can't see it yet. In Lesson 15, we'll create the **service definition and service binding** — exposing TechMart's Sales Order as an OData V4 service and previewing it in Fiori Elements.
