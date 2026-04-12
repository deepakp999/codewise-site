---
title: "Modifying Data — INSERT, UPDATE, DELETE, MODIFY"
description: "Learn how to write data to SAP database tables safely with INSERT, UPDATE, DELETE, MODIFY, COMMIT WORK, and ROLLBACK."
order: 16
module: "data-dictionary"
module_title: "Data Dictionary & Database"
tags: ["abap", "insert", "update", "delete", "commit", "database", "intermediate"]
prev_slug: "open-sql-reading"
next_slug: "table-types-structures-ranges"
---

# Modifying Data — INSERT, UPDATE, DELETE, MODIFY

## What You'll Learn
- INSERT — add new records
- UPDATE — change existing records
- DELETE — remove records
- MODIFY — insert or update (upsert)
- COMMIT WORK and ROLLBACK WORK — transaction control
- Bulk operations for performance

## INSERT — Adding New Records

```abap
REPORT z_modify_data.

DATA: ls_emp TYPE zemployees.

* Insert a single record
ls_emp-mandt = sy-mandt.
ls_emp-employee_id = '0000000003'.
ls_emp-name = 'Charlie Brown'.
ls_emp-department = 'Engineering'.
ls_emp-salary = 130000.
ls_emp-hire_date = '20210320'.

INSERT zemployees FROM ls_emp.

IF sy-subrc = 0.
  WRITE: / 'Record inserted successfully'.
ELSE.
  WRITE: / 'Insert failed — record may already exist'.
ENDIF.
```

`sy-subrc = 0` means success. `sy-subrc = 4` means the primary key already exists.

### Bulk INSERT — from internal table

```abap
DATA: lt_employees TYPE TABLE OF zemployees.

lt_employees = VALUE #(
  ( mandt = sy-mandt employee_id = '0000000004' name = 'Diana' department = 'Sales' salary = 88000 hire_date = '20221110' )
  ( mandt = sy-mandt employee_id = '0000000005' name = 'Eve' department = 'Marketing' salary = 92000 hire_date = '20200805' )
).

INSERT zemployees FROM TABLE lt_employees.

IF sy-subrc = 0.
  WRITE: / |Inserted { lines( lt_employees ) } records|.
ENDIF.
```

Bulk INSERT is much faster than inserting in a loop — one database call instead of many.

## UPDATE — Changing Existing Records

```abap
* Update a single record — must provide the full key
ls_emp-mandt = sy-mandt.
ls_emp-employee_id = '0000000003'.
ls_emp-salary = 140000.  " Give Charlie a raise

UPDATE zemployees FROM ls_emp.

IF sy-subrc = 0.
  WRITE: / 'Record updated'.
ELSE.
  WRITE: / 'Update failed — record not found'.
ENDIF.
```

### UPDATE with SET — change specific fields

```abap
* Update salary for all Engineering employees
UPDATE zemployees SET salary = salary + 10000
  WHERE department = 'Engineering'.

WRITE: / |Updated { sy-dbcnt } records|.  " sy-dbcnt = number of rows affected
```

`sy-dbcnt` tells you how many rows were affected — useful for logging and validation.

## DELETE — Removing Records

```abap
* Delete by key
DELETE FROM zemployees WHERE employee_id = '0000000005'.

* Delete by condition
DELETE FROM zemployees WHERE department = 'Temporary'.

* Delete from internal table (bulk)
DELETE zemployees FROM TABLE lt_employees_to_delete.

WRITE: / |Deleted { sy-dbcnt } records|.
```

## MODIFY — Insert or Update (Upsert)

```abap
* MODIFY inserts if the key doesn't exist, updates if it does
ls_emp-mandt = sy-mandt.
ls_emp-employee_id = '0000000006'.
ls_emp-name = 'Frank'.
ls_emp-department = 'Engineering'.
ls_emp-salary = 145000.
ls_emp-hire_date = '20180412'.

MODIFY zemployees FROM ls_emp.
WRITE: / 'Record inserted or updated'.

* Bulk MODIFY
MODIFY zemployees FROM TABLE lt_employees.
```

MODIFY is convenient but less explicit than separate INSERT/UPDATE. In production, prefer explicit operations so you know whether you're creating or changing data.

## COMMIT WORK and ROLLBACK WORK

Database changes in ABAP are transactional. They're not visible to other users until you COMMIT:

```abap
* Make changes
INSERT zemployees FROM ls_emp_new.
UPDATE zemployees FROM ls_emp_updated.
DELETE FROM zemployees WHERE employee_id = '0000000099'.

* Make changes permanent
COMMIT WORK.

* Or undo all changes since last commit
* ROLLBACK WORK.
```

**Coming from Python/SQL:** This is like `connection.commit()` in Python's DB-API. Without COMMIT WORK, changes are in a pending state and can be rolled back.

**Important:** In most SAP applications, you don't call COMMIT WORK directly. SAP's framework handles it — when a user saves a transaction, SAP commits. Custom programs that run independently (background jobs, interfaces) do need explicit COMMIT WORK.

### COMMIT WORK AND WAIT

```abap
COMMIT WORK AND WAIT.  " Waits until the commit is confirmed by the database
```

Use `AND WAIT` when subsequent code depends on the committed data being available.

## Common Mistakes

- **Forgetting COMMIT WORK in standalone programs.** Without it, your INSERTs and UPDATEs are lost when the program ends. SAP reports that run via SE38 auto-commit on exit, but background jobs and RFC functions do not.
- **Using single INSERT/UPDATE in a loop.** `LOOP AT lt_data. INSERT dbtable FROM ls_data. ENDLOOP.` makes one database call per row. Use `INSERT dbtable FROM TABLE lt_data` for one call total — 100x faster on large datasets.
- **Not checking sy-subrc after INSERT.** If the primary key exists, INSERT fails silently (sy-subrc = 4). Your program continues, thinking the data was saved.
- **Using DELETE without a WHERE clause by accident.** `DELETE FROM ztable.` deletes ALL records. Always double-check your WHERE condition before running DELETE on production tables.

## Key Takeaways

- INSERT adds new records (fails if key exists). UPDATE modifies existing (fails if key missing). MODIFY does both (upsert).
- DELETE removes by key or condition. Always verify the WHERE clause.
- Use bulk operations (FROM TABLE) instead of loops — dramatically faster.
- COMMIT WORK makes changes permanent. ROLLBACK WORK undoes them.
- `sy-subrc` reports success/failure. `sy-dbcnt` reports the number of affected rows.
- Never forget COMMIT WORK in background jobs and interface programs.

## Next Lesson

In **Lesson 17: Table Types, Structures, and Ranges**, we'll learn about reusable type definitions, the powerful RANGE concept for flexible selections, and how to organize complex data structures.
