---
title: "Internal Tables — ABAP's Most Important Concept"
description: "Master ABAP internal tables: STANDARD, SORTED, and HASHED table types. Learn APPEND, READ TABLE, LOOP AT, and how they compare to Python lists."
order: 9
module: "abap-fundamentals"
module_title: "ABAP Language Fundamentals"
tags: ["abap", "internal tables", "standard table", "sorted table", "beginner"]
prev_slug: "control-flow"
next_slug: "working-with-internal-tables"
---

# Internal Tables — ABAP's Most Important Concept

## What You'll Learn
- What internal tables are and why they're central to ABAP
- Three table types: STANDARD, SORTED, HASHED
- How to declare, fill, and read internal tables
- The line type, work area, and header line concepts
- How internal tables compare to Python lists and Java collections

## Why Internal Tables Matter

If you learn one thing from this course, make it internal tables. Every ABAP program uses them. Every SAP database query returns data into them. Every ALV report displays them. Every interface passes data through them.

An internal table is ABAP's in-memory data structure for holding multiple rows of data — like a Python list of dictionaries, or a Java ArrayList of objects. But internal tables have unique features that don't exist in other languages.

## Creating Your First Internal Table

```abap
REPORT z_internal_tables.

* Step 1: Define the line type (what one row looks like)
TYPES: BEGIN OF ty_employee,
         name       TYPE string,
         department TYPE string,
         salary     TYPE i,
       END OF ty_employee.

* Step 2: Declare the table and a work area
DATA: lt_employees TYPE TABLE OF ty_employee,  " The table (list)
      ls_employee  TYPE ty_employee.            " Work area (one row)

* Step 3: Fill the table row by row
ls_employee-name = 'Alice'.
ls_employee-department = 'Engineering'.
ls_employee-salary = 120000.
APPEND ls_employee TO lt_employees.

ls_employee-name = 'Bob'.
ls_employee-department = 'Marketing'.
ls_employee-salary = 95000.
APPEND ls_employee TO lt_employees.

ls_employee-name = 'Charlie'.
ls_employee-department = 'Engineering'.
ls_employee-salary = 130000.
APPEND ls_employee TO lt_employees.

* Step 4: Read the table
LOOP AT lt_employees INTO ls_employee.
  WRITE: / |{ ls_employee-name } - { ls_employee-department } - { ls_employee-salary }|.
ENDLOOP.
```

### Expected Output
```
Alice - Engineering - 120000
Bob - Marketing - 95000
Charlie - Engineering - 130000
```

**Coming from Python:** This is roughly equivalent to:
```python
employees = []
employees.append({"name": "Alice", "department": "Engineering", "salary": 120000})
employees.append({"name": "Bob", "department": "Marketing", "salary": 95000})
for emp in employees:
    print(f"{emp['name']} - {emp['department']} - {emp['salary']}")
```

But ABAP requires you to define the structure first (`TYPES`), declare the table and work area (`DATA`), and populate via the work area.

## Modern Syntax — VALUE Constructor

Since ABAP 7.40, you can fill tables inline:

```abap
DATA: lt_employees TYPE TABLE OF ty_employee.

lt_employees = VALUE #(
  ( name = 'Alice'   department = 'Engineering' salary = 120000 )
  ( name = 'Bob'     department = 'Marketing'   salary = 95000 )
  ( name = 'Charlie' department = 'Engineering' salary = 130000 )
).

LOOP AT lt_employees INTO DATA(ls_emp).
  WRITE: / |{ ls_emp-name } earns { ls_emp-salary }|.
ENDLOOP.
```

### Expected Output
```
Alice earns 120000
Bob earns 95000
Charlie earns 130000
```

Much cleaner. Use this syntax whenever possible.

## Three Table Types

ABAP has three internal table types, each optimized for different access patterns:

### STANDARD TABLE (default)

```abap
DATA: lt_standard TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
```

- Rows stored in insertion order
- Access by index: fast (`sy-tabix`)
- Access by key: slow (linear scan)
- **Think of it as:** Python's `list` — append at end, loop through, access by position
- **Use when:** you fill once and loop through, or access by row number

### SORTED TABLE

```abap
DATA: lt_sorted TYPE SORTED TABLE OF ty_employee WITH UNIQUE KEY name.
```

- Rows automatically sorted by the specified key
- Access by key: fast (binary search)
- Cannot APPEND — must use INSERT (maintains sort order)
- **Think of it as:** a list that's always sorted — like Python's `bisect.insort`
- **Use when:** you need fast lookups by a known key

### HASHED TABLE

```abap
DATA: lt_hashed TYPE HASHED TABLE OF ty_employee WITH UNIQUE KEY name.
```

- Rows stored in a hash map by key
- Access by key: fastest (O(1) — constant time)
- No index access — can't use `sy-tabix`
- **Think of it as:** Python's `dict` or Java's `HashMap`
- **Use when:** you need very fast lookups by key on large datasets

### Performance Comparison

```
Operation              STANDARD    SORTED     HASHED
──────────────────     ─────────   ─────────  ─────────
APPEND/INSERT          O(1)        O(log n)   O(1)
READ by key            O(n)        O(log n)   O(1)
READ by index          O(1)        O(1)       N/A
LOOP (full scan)       O(n)        O(n)       O(n)
DELETE by key          O(n)        O(log n)   O(1)
```

**For most programs, STANDARD TABLE is fine.** Only switch to SORTED or HASHED when you have large tables (10,000+ rows) and do frequent key lookups.

## Reading a Single Row

### READ TABLE — by key

```abap
* Find Bob in the table
READ TABLE lt_employees INTO ls_employee WITH KEY name = 'Bob'.

IF sy-subrc = 0.
  WRITE: / |Found: { ls_employee-name } earns { ls_employee-salary }|.
ELSE.
  WRITE: / 'Not found'.
ENDIF.
```

### Expected Output
```
Found: Bob earns 95000
```

`sy-subrc = 0` means found. `sy-subrc = 4` means not found. Always check `sy-subrc` after READ TABLE.

### READ TABLE — by index

```abap
* Get the second row
READ TABLE lt_employees INTO ls_employee INDEX 2.

IF sy-subrc = 0.
  WRITE: / |Row 2: { ls_employee-name }|.
ENDIF.
```

### Expected Output
```
Row 2: Bob
```

### Modern syntax — table expressions

```abap
* Direct access with brackets (ABAP 7.40+)
TRY.
    DATA(ls_found) = lt_employees[ name = 'Charlie' ].
    WRITE: / |Found: { ls_found-name }|.
  CATCH cx_sy_itab_line_not_found.
    WRITE: / 'Not found'.
ENDTRY.
```

Table expressions (`lt_table[ key = value ]`) are cleaner than READ TABLE, but they throw an exception if the row isn't found — you need TRY/CATCH.

## Checking if a Row Exists

```abap
* Check without reading the data
IF line_exists( lt_employees[ name = 'Alice' ] ).
  WRITE: / 'Alice exists in the table'.
ENDIF.
```

## Getting the Row Count

```abap
DATA(lv_count) = lines( lt_employees ).
WRITE: / |Table has { lv_count } rows|.
```

### Expected Output
```
Table has 3 rows
```

## The Work Area Pattern

The traditional ABAP pattern uses a work area as a buffer between the program and the table:

```abap
* Fill via work area
CLEAR ls_employee.                        " Reset the work area
ls_employee-name = 'Diana'.
ls_employee-department = 'Sales'.
ls_employee-salary = 88000.
APPEND ls_employee TO lt_employees.        " Copy work area into table

* Read via work area
LOOP AT lt_employees INTO ls_employee.     " Copy each row into work area
  ls_employee-salary = ls_employee-salary * 1.1.  " Modify work area
  MODIFY lt_employees FROM ls_employee.    " Write back to table
ENDLOOP.
```

`CLEAR` resets all fields to their initial values — essential before reusing a work area. Without it, fields from the previous row leak into the next one.

## Common Mistakes

- **Forgetting CLEAR before reusing a work area.** If you APPEND a row, then change only the name field and APPEND again, the department and salary from the first row carry over. Always CLEAR the work area before building a new row.
- **Using READ TABLE without checking sy-subrc.** If the row isn't found, the work area retains its previous values — you'll process stale data without realizing it. Always check `sy-subrc = 0`.
- **Using STANDARD TABLE for frequent key lookups on large data.** READ TABLE on a STANDARD TABLE scans linearly — fine for 100 rows, terrible for 100,000. Use SORTED or HASHED for large lookup tables.
- **Confusing table types after the fact.** You choose the table type at declaration. You can't change a STANDARD TABLE to a HASHED TABLE later. Choose based on your access pattern.

## Key Takeaways

- Internal tables are ABAP's core data structure — like Python lists but with structured rows and typed keys.
- Three types: STANDARD (general purpose), SORTED (fast binary search), HASHED (fastest key lookup).
- Fill with APPEND or VALUE constructor. Read with READ TABLE, table expressions, or LOOP AT.
- Always check `sy-subrc` after READ TABLE — 0 = found, 4 = not found.
- Always CLEAR the work area before building a new row.
- Use `lines()` for count, `line_exists()` for existence checks.

## Next Lesson

You can create and read internal tables. In **Lesson 10: Working with Internal Tables — The Deep Dive**, we'll learn MODIFY, DELETE, SORT, COLLECT, and the advanced operations that make internal tables powerful.
