---
title: "Calculated Fields, CASE, CAST, and SQL Functions in CDS"
description: "Learn to create calculated fields in CDS views using CASE expressions, CAST type conversions, and built-in SQL functions for real-world data transformations."
order: 9
module: "cds-views"
module_title: "CDS Views"
tags: ["cds calculated fields", "case expression", "cast", "sql functions", "abap cds"]
prev_slug: "cds-annotations"
next_slug: "cds-compositions-and-hierarchies"
---

# Calculated Fields, CASE, CAST, and SQL Functions

## What You'll Learn
- How to create calculated/derived fields in CDS views
- CASE expressions for conditional logic
- CAST for type conversion
- Built-in SQL functions (string, date, numeric)
- Aggregation with GROUP BY

## Why Calculated Fields?

Raw database data rarely matches business needs. TechMart stores order status as a single character (`N`, `P`, `C`, `X`), but users want to see "New", "In Process", "Completed", "Cancelled". Classic ABAP handled this in the application layer. In CDS, you handle it in the view — on the database.

## CASE Expressions

```sql
DEFINE VIEW ENTITY ZI_TM_SalesOrder
  AS SELECT FROM ztm_salesorder
{
  key order_id    AS OrderId,
      customer_id AS CustomerId,
      order_date  AS OrderDate,
      status      AS StatusCode,
      
      -- Translate status code to readable text
      CASE status
        WHEN 'N' THEN 'New'
        WHEN 'P' THEN 'In Process'
        WHEN 'C' THEN 'Completed'
        WHEN 'X' THEN 'Cancelled'
        ELSE 'Unknown'
      END AS StatusText,
      
      -- Categorize by amount
      CASE
        WHEN amount > 10000 THEN 'Enterprise'
        WHEN amount > 1000  THEN 'Premium'
        WHEN amount > 100   THEN 'Standard'
        ELSE 'Basic'
      END AS OrderTier,
      
      amount   AS Amount,
      currency AS Currency
}
```

### Expected Output (Data Preview)

```
| OrderId | StatusCode | StatusText  | OrderTier  | Amount   |
|---------|------------|-------------|------------|----------|
| 1001    | N          | New         | Premium    | 5499.99  |
| 1002    | C          | Completed   | Enterprise | 24000.00 |
| 1003    | P          | In Process  | Standard   | 299.50   |
```

## CAST — Type Conversion

CDS is strict about types. When mixing types or exposing fields to OData, you often need explicit conversion:

```sql
{
  -- Convert integer to decimal for calculation
  CAST( stock_quantity AS abap.dec(10,2) ) AS StockDecimal,
  
  -- Convert amount for display
  CAST( amount AS abap.curr(15,2) ) AS FormattedAmount,
  
  -- Convert date to timestamp type
  CAST( order_date AS abap.dats ) AS OrderDate,
  
  -- String length control
  CAST( name AS abap.char(50) ) AS ShortName
}
```

Common types in CDS CAST:
- `abap.char(n)` — character string
- `abap.int4` — 4-byte integer
- `abap.dec(p,s)` — packed decimal
- `abap.curr(p,s)` — currency amount
- `abap.dats` — date (YYYYMMDD)
- `abap.string` — variable-length string

## Built-in SQL Functions

### String Functions

```sql
{
  -- Concatenate first and last name
  CONCAT( first_name, CONCAT( ' ', last_name ) ) AS FullName,
  
  -- Alternative: concat_with_space
  CONCAT_WITH_SPACE( first_name, last_name, 1 ) AS FullName2,
  
  -- Substring
  SUBSTRING( product_id, 1, 3 ) AS ProductPrefix,
  
  -- Length
  LENGTH( name ) AS NameLength,
  
  -- Upper/lower case
  UPPER( category ) AS CategoryUpper,
  LOWER( name ) AS NameLower,
  
  -- Replace
  REPLACE( description, 'old_text', 'new_text' ) AS CleanDescription,
  
  -- Left pad (e.g., pad order numbers with zeros)
  LPAD( order_id, 10, '0' ) AS PaddedOrderId
}
```

### Date Functions

```sql
{
  -- Extract year, month, day
  SUBSTRING( order_date, 1, 4 ) AS OrderYear,
  SUBSTRING( order_date, 5, 2 ) AS OrderMonth,
  
  -- Days between dates
  DATS_DAYS_BETWEEN( order_date, delivery_date ) AS LeadTimeDays,
  
  -- Add days to a date
  DATS_ADD_DAYS( order_date, 30 ) AS PaymentDueDate,
  
  -- Current date
  $session.system_date AS TodayDate
}
```

### Numeric Functions

```sql
{
  -- Arithmetic
  quantity * price AS LineTotal,
  amount * CAST( '0.18' AS abap.dec(3,2) ) AS TaxAmount,
  
  -- Rounding
  ROUND( amount * CAST('1.18' AS abap.dec(3,2)), 2 ) AS TotalWithTax,
  
  -- Absolute value, ceiling, floor
  ABS( balance ) AS AbsoluteBalance,
  CEIL( average_rating ) AS RoundedUpRating,
  FLOOR( discount_percent ) AS RoundedDownDiscount,
  
  -- Division (careful with zero)
  DIVISION( total_amount, quantity, 2 ) AS AveragePrice
}
```

## Aggregation with GROUP BY

```sql
DEFINE VIEW ENTITY ZI_TM_SalesByCategory
  AS SELECT FROM ztm_salesorder AS so
  INNER JOIN ztm_soitem AS item
    ON so.order_id = item.order_id
  INNER JOIN ztm_product AS prod
    ON item.product_id = prod.product_id
{
  key prod.category AS Category,
      COUNT(*)      AS OrderCount,
      SUM( item.quantity * item.price ) AS TotalRevenue,
      AVG( item.price ) AS AveragePrice,
      MIN( item.price ) AS MinPrice,
      MAX( item.price ) AS MaxPrice
}
GROUP BY prod.category
```

### Expected Output

```
| Category    | OrderCount | TotalRevenue | AveragePrice | MinPrice | MaxPrice |
|-------------|------------|--------------|--------------|----------|----------|
| ELECTRONICS | 342        | 156780.50    | 89.99        | 29.99    | 499.99   |
| GADGETS     | 128        | 45230.00     | 153.50       | 49.99    | 399.99   |
```

## Common Mistakes

- **CAST to wrong type** — `CAST(amount AS abap.char(10))` will truncate decimals. Use the appropriate type for the data.
- **Division by zero** — `DIVISION(a, b, 2)` handles zero safely, but plain `a / b` crashes. Always use `DIVISION()` or add a CASE check.
- **CASE without ELSE** — If no WHEN matches and there's no ELSE, the result is NULL. Always include ELSE.
- **Mixing aggregated and non-aggregated fields** — If you use COUNT/SUM/AVG, every non-aggregated field must be in GROUP BY.
- **Calculated field performance** — Complex calculations in CDS push to the database, which is good. But string manipulation on millions of rows can still be slow. Keep calculations targeted.

## Key Takeaways

- CDS calculated fields transform data on the database — no ABAP processing needed.
- CASE expressions replace IF-ELSE logic for field derivation.
- CAST is mandatory when mixing types or exposing data through OData.
- SQL functions (CONCAT, SUBSTRING, DATS_DAYS_BETWEEN, DIVISION) handle common transformations.
- Aggregation views with GROUP BY replace Classic ABAP COLLECT patterns.

## Next Lesson

Single entities are useful, but business data has hierarchy. In Lesson 10, we'll define **compositions** — the parent-child relationships (Sales Order → Line Items) that become the backbone of RAP business objects.
