---
title: "Joins and Associations in CDS Views"
description: "Learn the difference between CDS joins and associations, define relationships between TechMart entities, and understand cardinality and on-demand loading."
order: 7
module: "cds-views"
module_title: "CDS Views"
tags: ["cds associations", "cds joins", "abap", "cardinality", "data modeling"]
prev_slug: "what-are-cds-views"
next_slug: "cds-annotations"
---

# Joins and Associations in CDS Views

## What You'll Learn
- How joins work in CDS (same concept, cleaner syntax)
- What associations are and how they differ from joins
- Cardinality definitions: `[0..1]`, `[1..1]`, `[0..*]`, `[1..*]`
- When to use joins vs associations
- Path expressions — navigating associations in SELECT

## Joins in CDS — Familiar but Cleaner

You know SQL joins from Classic ABAP. CDS joins are the same concept:

```sql
DEFINE VIEW ENTITY ZI_TM_OrderWithCustomer
  AS SELECT FROM ztm_salesorder AS so
  INNER JOIN ztm_customer AS cust
    ON so.customer_id = cust.customer_id
{
  key so.order_id     AS OrderId,
      so.order_date   AS OrderDate,
      so.status       AS Status,
      cust.name       AS CustomerName,
      cust.city       AS CustomerCity,
      cust.country    AS Country
}
```

This works. But there's a problem: the join executes even if you never need the customer fields. If you SELECT only `OrderId` and `Status`, you still pay the cost of joining to `ztm_customer`.

## Associations — Lazy Joins

Associations define a **relationship** without executing a join. The join only happens when you actually access the associated data:

```sql
DEFINE VIEW ENTITY ZI_TM_SalesOrder
  AS SELECT FROM ztm_salesorder AS so
  ASSOCIATION [0..1] TO ZI_TM_Customer AS _Customer
    ON $projection.CustomerId = _Customer.CustomerId
{
  key so.order_id   AS OrderId,
      so.customer_id AS CustomerId,
      so.order_date  AS OrderDate,
      so.status      AS Status,
      so.amount      AS Amount,
      
      _Customer   -- expose the association
}
```

Key differences from joins:
- The association target is another **CDS view** (not a table)
- The prefix `_` is the naming convention for associations
- The join only fires when you access `_Customer` fields
- The association is exposed as a navigation path

### Using Associations in ABAP SQL

```abap
" Only order data — NO join to customer
SELECT OrderId, Status FROM ZI_TM_SalesOrder
  INTO TABLE @DATA(lt_orders).

" Order + customer name — NOW the join fires
SELECT OrderId, Status, \_Customer-CustomerName
  FROM ZI_TM_SalesOrder
  INTO TABLE @DATA(lt_orders_with_cust).
```

The backslash-underscore syntax (`\_Customer-CustomerName`) is a **path expression**. It navigates the association and triggers the join.

## Cardinality — How Many Related Rows?

Cardinality tells the framework the expected ratio between parent and associated rows:

```sql
" One order has exactly one customer (or none)
ASSOCIATION [0..1] TO ZI_TM_Customer AS _Customer
  ON $projection.CustomerId = _Customer.CustomerId

" One order has zero or many line items
ASSOCIATION [0..*] TO ZI_TM_SalesOrderItem AS _Items
  ON $projection.OrderId = _Items.OrderId

" One line item has exactly one product
ASSOCIATION [1..1] TO ZI_TM_Product AS _Product
  ON $projection.ProductId = _Product.ProductId
```

| Cardinality | Meaning | Example |
|---|---|---|
| `[0..1]` | Zero or one related row | Order → Customer (customer might not exist yet) |
| `[1..1]` | Exactly one related row | Line item → Product (product must exist) |
| `[0..*]` | Zero or many related rows | Order → Line items |
| `[1..*]` | One or many related rows | Customer → Orders (at least one) |

Getting cardinality right matters for performance. The framework uses it to choose optimal join strategies.

## When to Use Joins vs Associations

| Use a JOIN when... | Use an ASSOCIATION when... |
|---|---|
| You always need the joined data | The related data is sometimes needed |
| You need to filter on joined fields | You want to expose a navigation path |
| Performance requires a single query | You want on-demand loading |
| Combining data for aggregation | Building a reusable data model |

**Rule of thumb:** Use associations by default. Use joins only when you always need the data and performance requires it.

## Common Mistakes

- **Defining associations ON table fields instead of $projection** — Use `$projection.FieldAlias` in association conditions, not the raw table field names.
- **Wrong cardinality** — `[1..1]` means the framework expects exactly one match. If zero matches are possible, use `[0..1]` to avoid runtime errors.
- **Not exposing associations** — If you define `_Customer` but don't list it in the field list, it's invisible to consumers.
- **Joining tables directly instead of CDS views** — Best practice is to associate TO another CDS view (`ZI_TM_Customer`), not directly to a table. This keeps the layering clean.

## Key Takeaways

- Associations are lazy joins — they define relationships without executing them until needed.
- Path expressions (`\_Association-Field`) navigate associations in ABAP SQL.
- Cardinality (`[0..1]`, `[0..*]`, etc.) describes expected row counts and affects performance.
- Use associations by default, joins only when you always need the data.
- Associations target CDS views, not tables. This keeps your data model layered.

## Next Lesson

Our CDS views have data, but no presentation logic. In Lesson 8, we'll add **annotations** — the metadata that tells Fiori how to display fields, which fields are searchable, and how to expose the view as an OData service. Annotations are what make CDS views "intelligent."
