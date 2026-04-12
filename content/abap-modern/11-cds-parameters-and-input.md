---
title: "CDS Views with Parameters — Configurable Queries"
description: "Learn to create parameterized CDS views that accept input values at runtime, enabling flexible reporting and data filtering in ABAP Cloud."
order: 11
module: "cds-views"
module_title: "CDS Views"
tags: ["cds parameters", "parameterized view", "abap cds", "input parameters"]
prev_slug: "cds-compositions-and-hierarchies"
next_slug: "cds-access-control"
---

# CDS Views with Parameters

## What You'll Learn
- How to define input parameters on CDS views
- Calling parameterized views from ABAP SQL
- Using parameters for date ranges, currency conversion, and filtering
- Parameters with default values
- When to use parameters vs WHERE filters

## Why Parameters?

A regular CDS view always returns the same columns and structure. Filtering happens in the WHERE clause of the consuming ABAP SQL. But sometimes the logic inside the view itself needs to change based on input — a reference date for aging calculations, a target currency for conversion, a fiscal year for period selection.

Parameters let you pass values INTO the CDS view definition, not just filter the output.

## Defining Parameters

```sql
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'TechMart Orders by Date Range'

DEFINE VIEW ENTITY ZI_TM_OrdersByPeriod
  WITH PARAMETERS
    p_date_from : abap.dats,
    p_date_to   : abap.dats
  AS SELECT FROM ztm_salesorder
{
  key order_id   AS OrderId,
      customer_id AS CustomerId,
      order_date  AS OrderDate,
      status     AS Status,
      amount     AS Amount,
      currency   AS Currency,
      
      -- Use parameters in calculated fields
      DATS_DAYS_BETWEEN( order_date, $parameters.p_date_to ) AS DaysUntilEnd,
      
      CASE
        WHEN DATS_DAYS_BETWEEN( order_date, $session.system_date ) > 90
          THEN 'Overdue'
        WHEN DATS_DAYS_BETWEEN( order_date, $session.system_date ) > 30
          THEN 'Aging'
        ELSE 'Current'
      END AS AgingStatus
}
WHERE order_date BETWEEN $parameters.p_date_from
                     AND $parameters.p_date_to
```

Parameters are accessed with `$parameters.parameter_name`.

## Calling from ABAP SQL

```abap
" Pass parameter values when selecting
SELECT * FROM ZI_TM_OrdersByPeriod(
    p_date_from = '20260101',
    p_date_to   = '20260331'
  )
  INTO TABLE @DATA(lt_q1_orders).

" Combine with additional WHERE clause
SELECT * FROM ZI_TM_OrdersByPeriod(
    p_date_from = '20260101',
    p_date_to   = '20260331'
  )
  WHERE Status = 'N'
  INTO TABLE @DATA(lt_q1_new_orders).
```

### Expected Output

```
| OrderId | OrderDate  | Status | Amount   | DaysUntilEnd | AgingStatus |
|---------|------------|--------|----------|--------------|-------------|
| 1042    | 2026-01-15 | N      | 4500.00  | 75           | Aging       |
| 1089    | 2026-03-20 | C      | 1200.00  | 11           | Current     |
```

## Parameters with Default Values

```sql
DEFINE VIEW ENTITY ZI_TM_ProductStock
  WITH PARAMETERS
    @Environment.systemField: #SYSTEM_DATE
    p_reference_date : abap.dats,
    p_min_stock      : abap.int4 DEFAULT 0
  AS SELECT FROM ztm_product
{
  key product_id     AS ProductId,
      name           AS ProductName,
      stock_quantity AS StockQuantity,
      
      CASE
        WHEN stock_quantity <= $parameters.p_min_stock
          THEN 'Reorder'
        ELSE 'OK'
      END AS StockStatus
}
WHERE stock_quantity >= $parameters.p_min_stock
```

The `@Environment.systemField: #SYSTEM_DATE` annotation auto-fills the parameter with today's date when no value is provided.

## Parameters in Associations

You can pass parameters through associations to other parameterized views:

```sql
DEFINE VIEW ENTITY ZI_TM_SalesOrder
  WITH PARAMETERS p_currency : abap.cuky
  AS SELECT FROM ztm_salesorder
  
  ASSOCIATION [0..*] TO ZI_TM_SalesOrderItem( p_currency: $parameters.p_currency )
    AS _Items ON $projection.OrderId = _Items.OrderId
{
  key order_id AS OrderId,
      ...
      _Items
}
```

## When to Use Parameters vs WHERE

| Use Parameters when... | Use WHERE when... |
|---|---|
| The view logic itself changes (calculations, CASE) | You just need to filter output rows |
| You need to pass values to associated views | The filter is simple equality/range |
| The view represents a function with inputs | The view represents a data set |
| Currency/unit conversion needs a target | You're filtering on existing columns |

**Rule of thumb:** If removing the filter would change the *meaning* of the view (not just the number of rows), use a parameter.

## Common Mistakes

- **Too many parameters** — If your view has 8 parameters, it's too complex. Split it into multiple focused views.
- **Forgetting `$parameters.`** — Parameters in the view body must be prefixed with `$parameters.`. Without it, the system looks for a field name.
- **Using parameters where WHERE suffices** — If you just want orders for customer X, add a WHERE clause in ABAP SQL. Don't create a parameter for it.
- **Parameter type mismatches** — The ABAP SQL call must pass values matching the parameter type exactly. `p_date_from = '2026-01-01'` fails — use `'20260101'` (DATS format).

## Key Takeaways

- Parameters let you pass runtime values INTO CDS view logic — calculated fields, CASE expressions, WHERE conditions.
- Access parameters with `$parameters.name` in the view body.
- Call parameterized views with `SELECT FROM ViewName( param = value )`.
- Use `@Environment.systemField` for auto-filled defaults.
- Parameters are for view logic; WHERE is for output filtering. Don't overuse parameters.

## Next Lesson

Data access needs security. In Lesson 12, we'll add **CDS access control** — restricting which rows a user can see based on their authorization, all defined declaratively without AUTHORITY-CHECK statements.
