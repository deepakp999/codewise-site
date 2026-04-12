---
title: "Compositions — Parent-Child Relationships in CDS"
description: "Learn how CDS compositions define parent-child hierarchies like Sales Order → Line Items, the foundation for RAP business objects."
order: 10
module: "cds-views"
module_title: "CDS Views"
tags: ["cds composition", "parent child", "hierarchy", "rap business object", "abap"]
prev_slug: "cds-calculated-fields-and-expressions"
next_slug: "cds-parameters-and-input"
---

# Compositions — Parent-Child Relationships in CDS

## What You'll Learn
- What compositions are and how they differ from associations
- COMPOSITION and TO PARENT syntax
- How compositions become RAP business objects
- Modeling TechMart's Sales Order → Line Items hierarchy
- Projection views for different consumption scenarios

## Associations vs Compositions

In Lesson 7, you learned associations — loose relationships between independent entities. A product exists independently of any order.

Compositions are different. They define **ownership**. A line item cannot exist without its sales order. Delete the order, and the items must go too. This is the parent-child pattern.

```
Association: Order ←→ Customer     (independent entities, linked by reference)
Composition: Order ──► Line Items  (parent owns children, lifecycle bound)
```

In database terms: associations link entities with foreign keys. Compositions link entities with existence dependency.

## Defining the Parent — Sales Order

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'TechMart Sales Order'

DEFINE VIEW ENTITY ZI_TM_SalesOrder
  AS SELECT FROM ztm_salesorder AS so
  
  -- This order OWNS its line items
  COMPOSITION [0..*] OF ZI_TM_SalesOrderItem AS _Items
  
  -- This order REFERENCES a customer (not owned)
  ASSOCIATION [0..1] TO ZI_TM_Customer AS _Customer
    ON $projection.CustomerId = _Customer.CustomerId
{
  key so.order_id       AS OrderId,
      so.customer_id    AS CustomerId,
      so.order_date     AS OrderDate,
      so.status         AS Status,
      so.amount         AS TotalAmount,
      so.currency       AS Currency,
      so.created_by     AS CreatedBy,
      so.created_at     AS CreatedAt,
      so.last_changed_by AS LastChangedBy,
      so.last_changed_at AS LastChangedAt,
      
      _Items,       -- expose composition
      _Customer     -- expose association
}
```

## Defining the Child — Line Items

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'TechMart Sales Order Item'

DEFINE VIEW ENTITY ZI_TM_SalesOrderItem
  AS SELECT FROM ztm_soitem AS item
  
  -- This item BELONGS TO a sales order
  ASSOCIATION TO PARENT ZI_TM_SalesOrder AS _SalesOrder
    ON $projection.OrderId = _SalesOrder.OrderId
  
  -- This item REFERENCES a product (not owned)
  ASSOCIATION [1..1] TO ZI_TM_Product AS _Product
    ON $projection.ProductId = _Product.ProductId
{
  key item.order_id   AS OrderId,
  key item.item_id    AS ItemId,
      item.product_id AS ProductId,
      item.quantity   AS Quantity,
      item.price      AS Price,
      item.currency   AS Currency,
      
      _SalesOrder,   -- navigate to parent
      _Product       -- navigate to product
}
```

The critical keywords:
- **`COMPOSITION [0..*] OF`** — in the parent: "I own these children"
- **`ASSOCIATION TO PARENT`** — in the child: "I belong to this parent"

## Why This Matters for RAP

When we build the RAP business object in Module 3, this composition defines the BO structure:

```
RAP Business Object: ZI_TM_SalesOrder
├── Root Entity: Sales Order (CRUD on orders)
└── Child Entity: Sales Order Item (CRUD on items, cascading delete)
```

RAP reads the composition and automatically:
- Creates items when creating an order
- Deletes items when deleting an order
- Locks the entire tree when editing
- Validates parent and children together on save

Without compositions, you'd code all of this manually. With compositions, it's declarative.

## Projection Views — Tailoring for Consumers

Interface views (`ZI_`) define the complete data model. But different consumers need different subsets. **Projection views** (`ZC_`) select specific fields for specific purposes:

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Sales Order - Fiori App'
@Metadata.allowExtensions: true

DEFINE VIEW ENTITY ZC_TM_SalesOrder
  AS PROJECTION ON ZI_TM_SalesOrder
{
  key OrderId,
      CustomerId,
      OrderDate,
      Status,
      TotalAmount,
      Currency,
      
      -- Redirect composition to projected child
      _Items : REDIRECTED TO COMPOSITION CHILD ZC_TM_SalesOrderItem,
      _Customer
}
```

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Sales Order Item - Fiori App'
@Metadata.allowExtensions: true

DEFINE VIEW ENTITY ZC_TM_SalesOrderItem
  AS PROJECTION ON ZI_TM_SalesOrderItem
{
  key OrderId,
  key ItemId,
      ProductId,
      Quantity,
      Price,
      Currency,
      
      _SalesOrder : REDIRECTED TO PARENT ZC_TM_SalesOrder,
      _Product
}
```

The pattern is always: Interface view (`ZI_`) → Projection view (`ZC_`) → Service → Fiori.

```
ZI_TM_SalesOrder (complete data model)
    ↓ PROJECTION ON
ZC_TM_SalesOrder (fields for this specific Fiori app)
    ↓ SERVICE DEFINITION
OData Service
    ↓
Fiori Elements App
```

## Common Mistakes

- **Mixing up COMPOSITION and ASSOCIATION** — If the child entity can't exist without the parent, it's a composition. If both entities are independent, it's an association.
- **Forgetting TO PARENT in the child** — The parent has `COMPOSITION OF child`. The child MUST have `ASSOCIATION TO PARENT parent`. Both sides are required.
- **Wrong key structure** — The child's key must include the parent's key. Sales Order Item has `key OrderId, key ItemId` — not just `key ItemId`.
- **Projecting without REDIRECTED TO** — When creating projection views with compositions, you must redirect the composition to the projected child using `REDIRECTED TO COMPOSITION CHILD`.
- **Deep hierarchies** — RAP supports grandchildren (Order → Item → Schedule Line), but keep hierarchies shallow. Two levels (parent + child) covers most business cases.

## Key Takeaways

- Compositions define ownership hierarchies — the child's lifecycle depends on the parent.
- `COMPOSITION [0..*] OF` in the parent, `ASSOCIATION TO PARENT` in the child.
- Compositions become the structure of RAP business objects — RAP auto-handles cascading create/delete/lock.
- Projection views (`ZC_`) tailor interface views (`ZI_`) for specific consumers.
- The pattern: Interface view → Projection view → Service → Fiori app.

## Next Lesson

Sometimes you need views that accept input — a date range, a customer filter, a plant code. In Lesson 11, we'll create **CDS views with parameters** that behave like configurable queries.
