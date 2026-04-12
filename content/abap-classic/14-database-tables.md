---
title: "Database Tables and Transparent Tables"
description: "Understand how SAP stores data: transparent tables, pooled tables, cluster tables, primary keys, foreign keys, and table relationships."
order: 14
module: "data-dictionary"
module_title: "Data Dictionary & Database"
tags: ["abap", "database", "transparent table", "primary key", "foreign key", "beginner"]
prev_slug: "data-dictionary"
next_slug: "open-sql-reading"
---

# Database Tables and Transparent Tables

## What You'll Learn
- How SAP stores data in the underlying database
- What transparent tables are and why they matter
- Primary keys and foreign keys in SAP
- Table categories: transparent, pooled, and cluster
- How to view table data with SE16N

## Transparent Tables

A **transparent table** is the most common table type in SAP. It has a 1:1 mapping between the dictionary definition in SE11 and the actual database table — same name, same fields, same structure.

```
SE11 Definition: ZEMPLOYEES          Database Table: ZEMPLOYEES
┌──────────────┬──────────────┐     ┌──────────────┬──────────────┐
│ MANDT (key)  │ CLNT(3)      │     │ MANDT        │ VARCHAR(3)   │
│ EMP_ID (key) │ NUMC(10)     │     │ EMP_ID       │ VARCHAR(10)  │
│ NAME         │ CHAR(50)     │     │ NAME         │ VARCHAR(50)  │
│ DEPARTMENT   │ CHAR(30)     │     │ DEPARTMENT   │ VARCHAR(30)  │
│ SALARY       │ CURR(13,2)   │     │ SALARY       │ DECIMAL(13,2)│
└──────────────┴──────────────┘     └──────────────┴──────────────┘
        Dictionary                         Database
```

What you define in SE11 is what exists in the database. When you activate a table in SE11, SAP creates (or alters) the corresponding database table automatically.

## Primary Keys

Every SAP table has a primary key. The first key field is almost always MANDT (client). The remaining key fields uniquely identify a record within that client.

```
Table KNA1 (Customer Master):
  Primary Key: MANDT + KUNNR
  
  MANDT  KUNNR       NAME1              LAND1
  ──────────────────────────────────────────────
  100    0000001001   Acme Corp          US
  100    0000001002   Global Industries  DE
  200    0000001001   Test Customer      US     ← Same KUNNR, different client
```

The combination MANDT + KUNNR is unique. Two rows can have the same KUNNR if they're in different clients (different MANDT values). This is how client isolation works at the database level.

## Foreign Keys

Foreign keys define relationships between tables:

```
VBAK (Sales Order Header)              VBAP (Sales Order Items)
┌────────┬────────┬────────┐          ┌────────┬────────┬────────┬────────┐
│ MANDT  │ VBELN  │ KUNNR  │          │ MANDT  │ VBELN  │ POSNR  │ MATNR  │
│ 100    │ 100001 │ 001001 │───┐      │ 100    │ 100001 │ 000010 │ MAT001 │
│ 100    │ 100002 │ 001002 │   │      │ 100    │ 100001 │ 000020 │ MAT002 │
└────────┴────────┴────────┘   │      │ 100    │ 100002 │ 000010 │ MAT003 │
                               │      └────────┴────────┴────────┴────────┘
                               └──── VBELN links header to items
```

VBAK.VBELN → VBAP.VBELN — every item belongs to a header. This is a standard parent-child relationship, like orders and order_items in any e-commerce database.

## Viewing Table Data with SE16N

Type `/nSE16N`, enter a table name, and press F8 (Execute):

```abap
* SE16N lets you:
* - View all records or filter by specific fields
* - Export data to a spreadsheet
* - Count records matching your criteria
* - Display individual records in detail
```

**SE16N is your best debugging friend.** When an ABAP program produces wrong results, the first question is always: "What's actually in the table?" SE16N answers that.

### Useful SE16N tricks:

- Enter `*` in a field to see all values
- Enter a range like `001000` to `001999` for number ranges
- Use the "Number of Entries" button to count without displaying all rows
- Maximum display is 500 rows by default — change the setting if you need more

## Table Categories in S/4HANA

In modern S/4HANA, only transparent tables exist. But in older SAP systems, you'll encounter:

```
Transparent Table  → 1:1 with database table (99% of what you'll work with)
Pooled Table      → Multiple SAP tables stored in one database table (legacy)
Cluster Table     → Multiple SAP tables stored in one database table, compressed (legacy)
```

Pooled and cluster tables were used for performance in older databases. S/4HANA on HANA doesn't need them — they're all converted to transparent tables during migration.

## Creating Sample Data for Practice

```abap
REPORT z_create_sample_data.

* Define table structure (should match your SE11 table ZEMPLOYEES)
DATA: ls_emp TYPE zemployees.

* Insert records
ls_emp-mandt = sy-mandt.
ls_emp-employee_id = '0000000001'.
ls_emp-name = 'Alice Johnson'.
ls_emp-department = 'Engineering'.
ls_emp-salary = 120000.
ls_emp-hire_date = '20200115'.
INSERT zemployees FROM ls_emp.

ls_emp-employee_id = '0000000002'.
ls_emp-name = 'Bob Smith'.
ls_emp-department = 'Marketing'.
ls_emp-salary = 95000.
ls_emp-hire_date = '20190601'.
INSERT zemployees FROM ls_emp.

IF sy-subrc = 0.
  COMMIT WORK.
  WRITE: / 'Data inserted successfully'.
ELSE.
  WRITE: / 'Insert failed — data may already exist'.
ENDIF.
```

We'll cover INSERT, UPDATE, DELETE in detail in Lesson 16. This is just to create test data for the next lesson.

## Common Mistakes

- **Forgetting that MANDT is part of the key.** When you select data, SAP automatically filters by the current client (sy-mandt). But if you're doing cross-client operations or debugging, remember that the same key can exist in multiple clients.
- **Using SE16 to modify production data.** SE16 can display and (with authorization) modify data directly. This is extremely dangerous in production — changes bypass all application logic, validation, and audit trails. Never modify production data via SE16.
- **Not understanding key fields.** If you try to INSERT a record with the same primary key as an existing record, it fails (sy-subrc = 4). Use MODIFY instead if you want to insert-or-update.

## Key Takeaways

- Transparent tables have a 1:1 mapping between SE11 definition and the database table.
- Primary keys always include MANDT (client) as the first field.
- Foreign keys define relationships between tables (header ↔ items, master ↔ transaction).
- SE16N is your primary tool for viewing table data — essential for debugging.
- In S/4HANA, all tables are transparent. Pooled and cluster tables are legacy concepts.

## Next Lesson

You know how tables are defined and structured. In **Lesson 15: Open SQL — Reading from the Database**, we'll write SELECT statements to query SAP data — the operation you'll perform most often as an ABAP developer.
