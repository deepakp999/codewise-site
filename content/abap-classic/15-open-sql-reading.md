---
title: "Open SQL — Reading from the Database"
description: "Master ABAP's SELECT statement: single records, multiple records, WHERE conditions, INTO TABLE, FOR ALL ENTRIES, joins, and aggregate functions."
order: 15
module: "data-dictionary"
module_title: "Data Dictionary & Database"
tags: ["abap", "open sql", "select", "database", "where", "intermediate"]
prev_slug: "database-tables"
next_slug: "modifying-data"
---

# Open SQL — Reading from the Database

## What You'll Learn
- SELECT for single and multiple records
- WHERE conditions and comparison operators
- INTO TABLE vs INTO work area
- Joins in Open SQL
- FOR ALL ENTRIES — ABAP's unique bulk lookup
- Aggregate functions: COUNT, SUM, AVG, MIN, MAX

## Open SQL vs Native SQL

ABAP uses **Open SQL** — a database-independent SQL dialect. Your SELECT statements work on any database SAP supports (HANA, Oracle, DB2, SQL Server). The ABAP runtime translates Open SQL into the native SQL of your specific database.

This means you write one SELECT, and it works everywhere. The trade-off: Open SQL doesn't support every SQL feature (no window functions in classic ABAP, for example). Modern ABAP on HANA loosens this through CDS views (Course 2).

## SELECT Single Record

```abap
REPORT z_open_sql.

* Read one customer by key
DATA: ls_customer TYPE kna1.

SELECT SINGLE * FROM kna1
  INTO ls_customer
  WHERE kunnr = '0000001001'.

IF sy-subrc = 0.
  WRITE: / |Customer: { ls_customer-name1 }, Country: { ls_customer-land1 }|.
ELSE.
  WRITE: / 'Customer not found'.
ENDIF.
```

`SELECT SINGLE` returns exactly one row. If multiple rows match, it returns the first one found (order not guaranteed). Always check `sy-subrc` — 0 = found, 4 = not found.

### Select Specific Fields

```abap
* Don't read all fields if you only need a few
SELECT SINGLE kunnr name1 land1
  FROM kna1
  INTO ( @DATA(lv_id), @DATA(lv_name), @DATA(lv_country) )
  WHERE kunnr = '0000001001'.

WRITE: / |{ lv_id }: { lv_name } ({ lv_country })|.
```

**Performance rule:** Never use `SELECT *` in production code if you only need 3 out of 50 fields. Specify the fields you need — less data transferred from the database.

## SELECT Multiple Records

```abap
* Read all customers from Germany into an internal table
DATA: lt_customers TYPE TABLE OF kna1.

SELECT * FROM kna1
  INTO TABLE lt_customers
  WHERE land1 = 'DE'.

WRITE: / |Found { lines( lt_customers ) } German customers|.

LOOP AT lt_customers INTO DATA(ls_cust).
  WRITE: / |{ ls_cust-kunnr }: { ls_cust-name1 }|.
ENDLOOP.
```

`INTO TABLE` loads all matching rows into an internal table at once. This is the standard pattern — read from database into internal table, then process in memory.

### Modern Syntax (ABAP 7.40+)

```abap
SELECT kunnr, name1, land1, ort01
  FROM kna1
  WHERE land1 = 'DE'
  INTO TABLE @DATA(lt_german_customers).

LOOP AT lt_german_customers INTO DATA(ls_gc).
  WRITE: / |{ ls_gc-kunnr }: { ls_gc-name1 }, { ls_gc-ort01 }|.
ENDLOOP.
```

The `@DATA(...)` inline declaration creates the internal table with the right structure automatically. The `@` prefix is required in modern syntax for host variables.

## WHERE Conditions

```abap
* Equals
SELECT * FROM kna1 INTO TABLE @lt_customers WHERE land1 = 'US'.

* Not equals
SELECT * FROM kna1 INTO TABLE @lt_customers WHERE land1 <> 'US'.

* Range
SELECT * FROM vbak INTO TABLE @DATA(lt_orders)
  WHERE erdat BETWEEN '20240101' AND '20241231'.

* IN list
SELECT * FROM kna1 INTO TABLE @lt_customers
  WHERE land1 IN ( 'US', 'DE', 'GB' ).

* LIKE pattern
SELECT * FROM kna1 INTO TABLE @lt_customers
  WHERE name1 LIKE '%Corp%'.

* IS NULL / IS NOT NULL
SELECT * FROM kna1 INTO TABLE @lt_customers
  WHERE name2 IS NOT NULL.

* Combined conditions
SELECT * FROM vbak INTO TABLE @DATA(lt_big_orders)
  WHERE erdat >= '20240101'
    AND netwr > 10000
    AND auart = 'TA'.
```

## Joins

```abap
* Inner join — orders with customer names
SELECT v~vbeln, v~erdat, v~netwr, k~name1
  FROM vbak AS v
  INNER JOIN kna1 AS k ON v~kunnr = k~kunnr
  INTO TABLE @DATA(lt_order_details)
  WHERE v~erdat >= '20240101'.

LOOP AT lt_order_details INTO DATA(ls_od).
  WRITE: / |Order { ls_od-vbeln }: { ls_od-name1 }, { ls_od-netwr }|.
ENDLOOP.

* Left outer join — all customers, with order info if available
SELECT k~kunnr, k~name1, v~vbeln, v~netwr
  FROM kna1 AS k
  LEFT OUTER JOIN vbak AS v ON k~kunnr = v~kunnr
  INTO TABLE @DATA(lt_cust_orders)
  WHERE k~land1 = 'DE'.
```

## FOR ALL ENTRIES — ABAP's Unique Bulk Lookup

This is one of ABAP's most distinctive features — and one of its most dangerous.

**Problem:** You have a list of customer IDs and need their details from KNA1. In SQL, you'd use `WHERE kunnr IN (subquery)`. In ABAP, you use FOR ALL ENTRIES.

```abap
* Step 1: Get some order data
SELECT vbeln, kunnr FROM vbak
  INTO TABLE @DATA(lt_orders)
  WHERE erdat >= '20240101'.

* Step 2: Get customer details for those orders
IF lt_orders IS NOT INITIAL.  " CRITICAL — never use FAE with empty table!
  SELECT kunnr, name1, land1 FROM kna1
    INTO TABLE @DATA(lt_customers)
    FOR ALL ENTRIES IN lt_orders
    WHERE kunnr = lt_orders-kunnr.
ENDIF.
```

**The critical rule:** ALWAYS check `IF lt_table IS NOT INITIAL` before FOR ALL ENTRIES. If the driver table is empty, SAP ignores the WHERE condition entirely and returns ALL rows from the target table — potentially millions of records. This is the #1 performance bug in ABAP.

## Aggregate Functions

```abap
* Count records
SELECT COUNT(*) FROM vbak INTO @DATA(lv_count) WHERE erdat >= '20240101'.
WRITE: / |Total orders: { lv_count }|.

* Sum a field
SELECT SUM( netwr ) FROM vbak INTO @DATA(lv_total) WHERE erdat >= '20240101'.
WRITE: / |Total value: { lv_total }|.

* Group by with aggregates
SELECT kunnr, COUNT(*) AS order_count, SUM( netwr ) AS total_value
  FROM vbak
  WHERE erdat >= '20240101'
  GROUP BY kunnr
  HAVING COUNT(*) > 5
  INTO TABLE @DATA(lt_top_customers).
```

## ORDER BY

```abap
SELECT kunnr, name1, land1
  FROM kna1
  ORDER BY name1 ASCENDING
  INTO TABLE @DATA(lt_sorted).
```

**Performance note:** ORDER BY in Open SQL sorts at the database level, which is efficient. But if you're going to process the data further in ABAP anyway, it's sometimes faster to sort the internal table in memory with `SORT`.

## Common Mistakes

- **Using FOR ALL ENTRIES with an empty driver table.** This returns ALL records from the target table. Always wrap with `IF lt_driver IS NOT INITIAL.`
- **Using SELECT * in production code.** Reading all 200 columns of BSEG when you need 5 wastes database I/O, network bandwidth, and memory. Always specify the fields you need.
- **Not checking sy-subrc after SELECT SINGLE.** If the record doesn't exist, your work area contains old data from the previous read. Always check `sy-subrc = 0`.
- **Putting SELECT inside a LOOP.** `LOOP AT lt_orders. SELECT FROM kna1 WHERE kunnr = ls_order-kunnr. ENDLOOP.` executes one database call per row — extremely slow on large tables. Use FOR ALL ENTRIES or a JOIN instead.

## Key Takeaways

- Use `SELECT SINGLE` for one record, `SELECT ... INTO TABLE` for multiple records.
- Always specify needed fields — never `SELECT *` in production.
- FOR ALL ENTRIES is powerful but dangerous — always check the driver table is not empty.
- Use JOINs when you need related data from multiple tables in one query.
- Never put SELECT inside a LOOP — use FOR ALL ENTRIES or JOINs for bulk lookups.
- Always check `sy-subrc` after SELECT SINGLE.

## Next Lesson

You can read data. In **Lesson 16: Modifying Data — INSERT, UPDATE, DELETE, MODIFY**, we'll learn how to write data back to the database safely.
