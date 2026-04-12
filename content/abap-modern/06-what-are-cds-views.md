---
title: "What Are CDS Views? Creating Your First CDS View Entity"
description: "Learn what Core Data Services (CDS) views are, how they replace DDIC views, and create your first CDS view entity for TechMart's product catalog."
order: 6
module: "cds-views"
module_title: "CDS Views"
tags: ["cds views", "cds view entity", "core data services", "abap", "data modeling"]
prev_slug: "abap-oop-for-rap"
next_slug: "cds-joins-and-associations"
---

# What Are CDS Views? Your First CDS View Entity

## What You'll Learn
- What CDS views are and why they replaced DDIC views
- The difference between `DEFINE VIEW` (old) and `DEFINE VIEW ENTITY` (new)
- How to create a CDS view entity in ADT
- Basic SELECT, field aliasing, and key definitions
- How CDS views execute on the database (code pushdown)

## Why CDS Views?

In Classic ABAP, you modeled data in SE11 — tables, views, structures, data elements, domains. It worked, but it had limits. DDIC views couldn't have calculated fields. They couldn't define associations (only joins). They couldn't carry metadata about how the data should be displayed in a UI.

CDS views solve all of these problems. They are the **single data modeling layer** for modern SAP applications. Everything flows through CDS:

```
Database Tables → CDS Views → RAP Business Objects → OData Services → Fiori Apps
```

Think of CDS views as intelligent windows into your data. A DDIC view was a static JOIN. A CDS view is a JOIN + calculated fields + annotations + associations + access control + parameter support — all defined in one place, executed on the database.

## DEFINE VIEW vs DEFINE VIEW ENTITY

You'll see two syntaxes in the SAP ecosystem:

```sql
-- OLD syntax (still works, but don't use for new development)
@AbapCatalog.sqlViewName: 'ZV_TM_PROD'
DEFINE VIEW ZI_TM_Product AS SELECT FROM ztm_product { ... }

-- NEW syntax (use this — it's the standard for ABAP Cloud)
DEFINE VIEW ENTITY ZI_TM_Product AS SELECT FROM ztm_product { ... }
```

**Always use `DEFINE VIEW ENTITY`** for new development. The old `DEFINE VIEW` requires an SQL view name and has limitations. View entities are the standard for RAP and ABAP Cloud.

## Creating Your First CDS View Entity

Let's model TechMart's product catalog. Assume we have this database table (from the Classic course):

```abap
" Table: ZTM_PRODUCT
" Fields: product_id, name, category, price, currency, stock_quantity,
"         created_by, created_at, last_changed_by, last_changed_at
```

In ADT: Right-click `ZTECHMART_MODERN` → **New → Data Definition**

Name: `ZI_TM_Product`
Description: `TechMart Product - Interface View`

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'TechMart Product'

DEFINE VIEW ENTITY ZI_TM_Product
  AS SELECT FROM ztm_product
{
  key product_id     AS ProductId,
      name           AS ProductName,
      category       AS Category,
      price          AS Price,
      currency       AS Currency,
      stock_quantity AS StockQuantity,
      created_by     AS CreatedBy,
      created_at     AS CreatedAt,
      last_changed_by AS LastChangedBy,
      last_changed_at AS LastChangedAt
}
```

Activate with **Ctrl+F3**.

### Expected Output (Data Preview in ADT)

Right-click the CDS view → **Open With → Data Preview**:

```
| ProductId | ProductName | Category    | Price  | Currency | StockQuantity |
|-----------|-------------|-------------|--------|----------|---------------|
| WIDGET-A  | Widget Pro  | ELECTRONICS | 49.99  | USD      | 500           |
| WIDGET-B  | Widget Lite | ELECTRONICS | 29.99  | USD      | 1200          |
| GADGET-X  | Gadget Max  | GADGETS     | 199.99 | USD      | 85            |
```

## Naming Conventions

SAP has strict naming conventions for CDS views:

| Prefix | Type | Example |
|---|---|---|
| `ZI_` | Interface view (base data model) | `ZI_TM_Product` |
| `ZC_` | Consumption/Projection view (exposed to UI) | `ZC_TM_Product` |
| `ZR_` | Root view for RAP BO | `ZR_TM_SalesOrder` |
| `ZA_` | Abstract entity (for action parameters) | `ZA_TM_ApproveParams` |

We use `ZI_` for now because this is an interface view — the foundation. Later, we'll create `ZC_` projections that select specific fields from `ZI_` views for different use cases.

## Key Fields

The `key` keyword marks the primary key. CDS requires at least one key field:

```sql
{
  key product_id AS ProductId,    -- This is the primary key
      name       AS ProductName,  -- Not a key field
}
```

For composite keys, mark multiple fields:

```sql
{
  key order_id AS OrderId,
  key item_id  AS ItemId,
      ...
}
```

## Field Aliasing with AS

Always alias your fields to CamelCase names. This is mandatory for Fiori compatibility and the convention in CDS:

```sql
-- Database column name     →  CDS alias (CamelCase)
   product_id               →  ProductId
   stock_quantity            →  StockQuantity
   last_changed_at           →  LastChangedAt
```

## Using CDS Views in ABAP Code

Once activated, you can SELECT from a CDS view just like a table:

```abap
" In an ABAP class
SELECT * FROM ZI_TM_Product
  WHERE Category = 'ELECTRONICS'
  INTO TABLE @DATA(lt_electronics).

" The field names are the CDS aliases, not the table column names
LOOP AT lt_electronics INTO DATA(ls_product).
  out->write( |{ ls_product-ProductName } - { ls_product-Price } { ls_product-Currency }| ).
ENDLOOP.
```

### Expected Output

```
Widget Pro - 49.99 USD
Widget Lite - 29.99 USD
```

**Important:** In ABAP SQL, you use the CDS alias names (`ProductName`), not the database column names (`name`). The CDS view IS the data model.

## Code Pushdown — Why CDS Is Fast

When you SELECT from a CDS view, the query executes on the database. The ABAP application server never sees the raw data — it gets the result set. This is called **code pushdown** — pushing computation to SAP HANA.

```
Classic ABAP approach:
  Database → raw data → ABAP application server → process → result
  
CDS approach:
  Database → CDS view (joins, filters, calculations) → result → ABAP
```

For large datasets, this is dramatically faster. TechMart's sales analysis that took 30 seconds with Classic SELECT + LOOP + COLLECT now takes 2 seconds via a CDS view with aggregation.

## Common Mistakes

- **Forgetting `@AccessControl.authorizationCheck`** — Every CDS view needs this annotation. Use `#NOT_REQUIRED` during development, then add proper access control later (Lesson 12).
- **Using `DEFINE VIEW` instead of `DEFINE VIEW ENTITY`** — The old syntax requires an SQL view name and has limitations. Always use `DEFINE VIEW ENTITY`.
- **Not aliasing fields** — Unaliased fields use database column names, which are often uppercase with underscores. CamelCase aliases are mandatory for Fiori and RAP compatibility.
- **Forgetting to activate** — CDS views must be activated (Ctrl+F3) before they appear in data preview or ABAP SQL.
- **Trying to create CDS in SE11** — CDS views can ONLY be created in ADT. They don't exist in the SE11 world.

## Key Takeaways

- CDS views are the data modeling layer of modern ABAP. Everything — RAP, OData, Fiori — is built on CDS.
- Use `DEFINE VIEW ENTITY` (not the old `DEFINE VIEW`) for all new development.
- Alias fields to CamelCase with `AS`. Mark primary keys with `key`.
- CDS views execute on the database (code pushdown), making them faster than Classic ABAP processing.
- Naming convention: `ZI_` for interface views, `ZC_` for consumption views, `ZR_` for RAP root views.

## Next Lesson

Our product view is a single-table SELECT. Real applications need to combine data from multiple tables. In Lesson 7, we'll add **joins and associations** — connecting TechMart's products to orders, customers, and categories. You'll learn why CDS associations are fundamentally different (and better) than Classic SQL joins.
