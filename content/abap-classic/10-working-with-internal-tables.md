---
title: "Working with Internal Tables — The Deep Dive"
description: "Advanced internal table operations: MODIFY, DELETE, SORT, COLLECT, CORRESPONDING, FILTER, and FOR expressions in ABAP."
order: 10
module: "abap-fundamentals"
module_title: "ABAP Language Fundamentals"
tags: ["abap", "internal tables", "modify", "delete", "sort", "intermediate"]
prev_slug: "internal-tables"
next_slug: "field-symbols-and-references"
---

# Working with Internal Tables — The Deep Dive

## What You'll Learn
- Modifying rows in place
- Deleting rows by key, index, and condition
- Sorting internal tables
- COLLECT for aggregation
- CORRESPONDING for mapping between structures
- FOR expressions and FILTER (modern ABAP)

## Setup

```abap
REPORT z_itab_deep_dive.

TYPES: BEGIN OF ty_employee,
         name       TYPE string,
         department TYPE string,
         salary     TYPE i,
       END OF ty_employee.

DATA: lt_employees TYPE TABLE OF ty_employee.

lt_employees = VALUE #(
  ( name = 'Alice'   department = 'Engineering' salary = 120000 )
  ( name = 'Bob'     department = 'Marketing'   salary = 95000 )
  ( name = 'Charlie' department = 'Engineering' salary = 130000 )
  ( name = 'Diana'   department = 'Sales'       salary = 88000 )
  ( name = 'Eve'     department = 'Marketing'   salary = 92000 )
).
```

## Modifying Rows

### MODIFY — update by index

```abap
DATA: ls_employee TYPE ty_employee.

* Read row 2, change salary, write back
READ TABLE lt_employees INTO ls_employee INDEX 2.
ls_employee-salary = 100000.
MODIFY lt_employees FROM ls_employee INDEX 2.

* Verify
READ TABLE lt_employees INTO ls_employee INDEX 2.
WRITE: / |Bob's new salary: { ls_employee-salary }|.
```

### Expected Output
```
Bob's new salary: 100000
```

### MODIFY — update by condition (WHERE)

```abap
* Give all engineers a 10% raise
LOOP AT lt_employees INTO ls_employee WHERE department = 'Engineering'.
  ls_employee-salary = ls_employee-salary * 11 / 10.
  MODIFY lt_employees FROM ls_employee.
ENDLOOP.
```

### MODIFY with transporting specific fields

```abap
* Only update the salary field, leave other fields untouched
ls_employee-salary = 150000.
MODIFY lt_employees FROM ls_employee INDEX 1 TRANSPORTING salary.
```

## Deleting Rows

### DELETE by index

```abap
DELETE lt_employees INDEX 3.  " Remove third row
```

### DELETE by condition (WHERE)

```abap
* Remove all employees earning less than 95000
DELETE lt_employees WHERE salary < 95000.
```

### DELETE ADJACENT DUPLICATES

```abap
* Remove consecutive duplicate rows (table must be sorted first)
SORT lt_employees BY department.
DELETE ADJACENT DUPLICATES FROM lt_employees COMPARING department.
```

## Sorting

```abap
* Sort by salary ascending (default)
SORT lt_employees BY salary.

* Sort by salary descending
SORT lt_employees BY salary DESCENDING.

* Sort by multiple fields
SORT lt_employees BY department ASCENDING salary DESCENDING.

* Verify
LOOP AT lt_employees INTO ls_employee.
  WRITE: / |{ ls_employee-department } - { ls_employee-name } - { ls_employee-salary }|.
ENDLOOP.
```

### Expected Output (sorted by dept asc, salary desc)
```
Engineering - Charlie - 143000
Engineering - Alice - 132000
Marketing - Bob - 100000
Marketing - Eve - 92000
Sales - Diana - 88000
```

## COLLECT — Automatic Aggregation

`COLLECT` is unique to ABAP — no direct Python or Java equivalent. It aggregates numeric fields automatically:

```abap
TYPES: BEGIN OF ty_dept_total,
         department TYPE string,
         salary     TYPE i,
         headcount  TYPE i,
       END OF ty_dept_total.

DATA: lt_totals TYPE TABLE OF ty_dept_total,
      ls_total  TYPE ty_dept_total.

* Reset and rebuild from original data
lt_employees = VALUE #(
  ( name = 'Alice'   department = 'Engineering' salary = 120000 )
  ( name = 'Bob'     department = 'Marketing'   salary = 95000 )
  ( name = 'Charlie' department = 'Engineering' salary = 130000 )
  ( name = 'Diana'   department = 'Sales'       salary = 88000 )
  ( name = 'Eve'     department = 'Marketing'   salary = 92000 )
).

LOOP AT lt_employees INTO DATA(ls_emp).
  ls_total-department = ls_emp-department.
  ls_total-salary = ls_emp-salary.
  ls_total-headcount = 1.
  COLLECT ls_total INTO lt_totals.  " Adds numeric fields for matching keys
ENDLOOP.

LOOP AT lt_totals INTO ls_total.
  WRITE: / |{ ls_total-department }: { ls_total-headcount } employees, total salary { ls_total-salary }|.
ENDLOOP.
```

### Expected Output
```
Engineering: 2 employees, total salary 250000
Marketing: 2 employees, total salary 187000
Sales: 1 employees, total salary 88000
```

`COLLECT` looks for a row with matching non-numeric fields (department). If found, it adds the numeric fields (salary, headcount). If not found, it inserts a new row. This is like a `GROUP BY SUM()` done entirely in memory.

## CORRESPONDING — Map Between Structures

When two structures have overlapping field names, `CORRESPONDING` copies matching fields:

```abap
TYPES: BEGIN OF ty_person,
         name    TYPE string,
         age     TYPE i,
         city    TYPE string,
       END OF ty_person.

TYPES: BEGIN OF ty_employee_ext,
         name       TYPE string,
         department TYPE string,
         city       TYPE string,
         salary     TYPE i,
       END OF ty_employee_ext.

DATA: ls_person TYPE ty_person VALUE 'Alice',
      ls_emp_ext TYPE ty_employee_ext.

ls_person-name = 'Alice'.
ls_person-age = 30.
ls_person-city = 'Mumbai'.

* Copy matching fields (name, city) — non-matching (age, department, salary) are ignored
ls_emp_ext = CORRESPONDING #( ls_person ).

WRITE: / |Name: { ls_emp_ext-name }, City: { ls_emp_ext-city }, Dept: { ls_emp_ext-department }|.
```

### Expected Output
```
Name: Alice, City: Mumbai, Dept:
```

`name` and `city` matched and were copied. `department` has no match in `ty_person`, so it stays empty. `age` has no match in `ty_employee_ext`, so it's ignored.

## FOR Expressions (Modern ABAP)

Like Python's list comprehensions:

```abap
* Filter — equivalent to Python's [e for e in employees if e.dept == 'Engineering']
DATA(lt_engineers) = VALUE ty_employee_tab(
  FOR ls_e IN lt_employees WHERE ( department = 'Engineering' )
  ( ls_e )
).

* Transform — equivalent to Python's [{"name": e.name} for e in employees]
TYPES: BEGIN OF ty_name_only,
         name TYPE string,
       END OF ty_name_only.
TYPES: ty_name_tab TYPE TABLE OF ty_name_only WITH EMPTY KEY.

DATA(lt_names) = VALUE ty_name_tab(
  FOR ls_e IN lt_employees
  ( name = ls_e-name )
).
```

## FILTER (ABAP 7.40+)

For SORTED and HASHED tables, FILTER is the fastest way to extract subsets:

```abap
DATA: lt_sorted TYPE SORTED TABLE OF ty_employee WITH NON-UNIQUE KEY department.
lt_sorted = lt_employees.

DATA(lt_engineering) = FILTER #( lt_sorted WHERE department = 'Engineering' ).
```

FILTER uses the table's key for efficient lookup — it's faster than LOOP AT with WHERE on sorted/hashed tables.

## Common Mistakes

- **Modifying a table while looping over it without care.** Deleting rows inside a `LOOP AT` changes the table size, causing skipped rows. Use `DELETE WHERE` outside the loop, or loop backward.
- **Forgetting that SORT modifies the table in place.** Unlike Python's `sorted()` which returns a new list, ABAP's `SORT` changes the original table. If you need the original order preserved, copy the table first.
- **Using COLLECT with non-numeric character fields as keys.** COLLECT matches rows by comparing all non-numeric fields. If your "key" includes a string that varies slightly (trailing spaces, case differences), you'll get unexpected duplicate rows instead of aggregation.
- **Assuming FOR expressions work on STANDARD tables with WHERE.** The WHERE clause in FOR works on all table types, but FILTER (more efficient) requires SORTED or HASHED keys.

## Key Takeaways

- MODIFY updates rows by index, condition, or work area. Use TRANSPORTING to update specific fields only.
- DELETE removes by index or WHERE condition. DELETE ADJACENT DUPLICATES needs a sorted table.
- SORT modifies the table in place — sort by multiple fields with ASC/DESC.
- COLLECT auto-aggregates numeric fields for matching non-numeric keys — ABAP's in-memory GROUP BY.
- CORRESPONDING copies fields with matching names between structures.
- FOR expressions are ABAP's list comprehensions. FILTER is optimized for sorted/hashed tables.

## Next Lesson

Internal tables hold data. But how do you access that data efficiently without copying it? In **Lesson 11: Work Areas, Field Symbols, and Data References**, we'll learn the three ways to access data in ABAP — and the critical performance differences between them.
