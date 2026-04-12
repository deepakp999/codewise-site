---
title: "Work Areas, Field Symbols, and Data References"
description: "Learn the three ways to access internal table data in ABAP: work areas (copy), field symbols (pointer), and data references. Understand when to use each."
order: 11
module: "abap-fundamentals"
module_title: "ABAP Language Fundamentals"
tags: ["abap", "field symbols", "data references", "work area", "intermediate"]
prev_slug: "working-with-internal-tables"
next_slug: "subroutines-functions-methods"
---

# Work Areas, Field Symbols, and Data References

## What You'll Learn
- Three ways to access data: work areas, field symbols, data references
- Performance implications of each approach
- When to use each one
- How field symbols compare to pointers in C and references in Java

## The Three Approaches

When you read a row from an internal table, you have three choices:

### 1. Work Area (INTO) — Makes a Copy

```abap
REPORT z_access_methods.

TYPES: BEGIN OF ty_employee,
         name   TYPE string,
         salary TYPE i,
       END OF ty_employee.

DATA: lt_employees TYPE TABLE OF ty_employee.
lt_employees = VALUE #(
  ( name = 'Alice' salary = 120000 )
  ( name = 'Bob'   salary = 95000 )
).

* Work area — COPIES the row
DATA: ls_employee TYPE ty_employee.
LOOP AT lt_employees INTO ls_employee.
  ls_employee-salary = ls_employee-salary + 10000.  " Modifies the COPY
  WRITE: / |{ ls_employee-name }: { ls_employee-salary }|.
ENDLOOP.

* Original table is UNCHANGED
WRITE: / '--- Original table ---'.
LOOP AT lt_employees INTO ls_employee.
  WRITE: / |{ ls_employee-name }: { ls_employee-salary }|.
ENDLOOP.
```

### Expected Output
```
Alice: 130000
Bob: 105000
--- Original table ---
Alice: 120000
Bob: 95000
```

The work area is a copy. Changing it doesn't affect the table. To update the table, you need `MODIFY lt_employees FROM ls_employee`.

**Coming from Python:** This is like `for emp in copy.deepcopy(employees)` — you're working with copies, not the originals.

### 2. Field Symbol (ASSIGNING) — Direct Access, No Copy

```abap
* Field symbol — POINTS to the actual row in the table
FIELD-SYMBOLS: <ls_employee> TYPE ty_employee.

LOOP AT lt_employees ASSIGNING <ls_employee>.
  <ls_employee>-salary = <ls_employee>-salary + 10000.  " Modifies the ACTUAL table
  WRITE: / |{ <ls_employee>-name }: { <ls_employee>-salary }|.
ENDLOOP.

* Original table IS changed
WRITE: / '--- Original table ---'.
LOOP AT lt_employees INTO ls_employee.
  WRITE: / |{ ls_employee-name }: { ls_employee-salary }|.
ENDLOOP.
```

### Expected Output
```
Alice: 130000
Bob: 105000
--- Original table ---
Alice: 130000
Bob: 105000
```

Field symbols point directly to the memory where the table row lives. Changing a field symbol changes the table — no MODIFY needed.

**Coming from Java:** Field symbols are like references — `for (Employee emp : employees)` where `emp` points to the actual object, not a copy. Except in ABAP, the distinction is explicit: `INTO` = copy, `ASSIGNING` = reference.

**Coming from C:** Field symbols are like pointers, but dereferenced automatically. You write `<fs>-name`, not `(*fs).name` or `fs->name`.

### 3. Data Reference (REFERENCE INTO) — Typed Pointer

```abap
* Data reference — like a typed pointer
DATA: lr_employee TYPE REF TO ty_employee.

LOOP AT lt_employees REFERENCE INTO lr_employee.
  lr_employee->salary = lr_employee->salary + 5000.  " Also modifies the table
  WRITE: / |{ lr_employee->name }: { lr_employee->salary }|.
ENDLOOP.
```

### Expected Output
```
Alice: 135000
Bob: 110000
```

Data references use `->` to access fields (like Java/C++ object pointers). They also modify the table directly, like field symbols.

## When to Use Each

```
Method          Performance   Modifies Table?   Best For
──────────────  ────────────  ────────────────   ───────────────────
INTO (copy)     Slower        No (need MODIFY)   Read-only access, safe
ASSIGNING (fs)  Fastest       Yes (direct)        Modifying table in loops
REFERENCE INTO  Fast          Yes (direct)        Passing to methods, dynamic programming
```

**Rule of thumb:**
- **Reading only?** Use `INTO` — it's safest, no accidental modifications
- **Modifying in a loop?** Use `ASSIGNING` — fastest, no copy overhead
- **Passing to methods or storing for later?** Use `REFERENCE INTO`

## Field Symbol Syntax Details

### Declaration

```abap
* Typed field symbol (preferred)
FIELD-SYMBOLS: <ls_employee> TYPE ty_employee.

* Generic field symbol (any type — use sparingly)
FIELD-SYMBOLS: <lv_any> TYPE any.

* Inline declaration (modern ABAP)
LOOP AT lt_employees ASSIGNING FIELD-SYMBOL(<ls_emp>).
  WRITE: / <ls_emp>-name.
ENDLOOP.
```

### ASSIGN — Pointing a Field Symbol at a Variable

```abap
DATA: lv_value TYPE i VALUE 42.
FIELD-SYMBOLS: <lv_ref> TYPE i.

ASSIGN lv_value TO <lv_ref>.
WRITE: / <lv_ref>.    " 42

<lv_ref> = 100.        " Changes lv_value!
WRITE: / lv_value.     " 100
```

### Checking if a Field Symbol is Assigned

```abap
FIELD-SYMBOLS: <ls_emp> TYPE ty_employee.

READ TABLE lt_employees ASSIGNING <ls_emp> WITH KEY name = 'Nobody'.

IF <ls_emp> IS ASSIGNED.
  WRITE: / 'Found'.
ELSE.
  WRITE: / 'Not found'.   " This will print
ENDIF.
```

Always check `IS ASSIGNED` after READ TABLE with ASSIGNING, just like checking `sy-subrc` with INTO.

## Performance Example

On a table with 100,000 rows:

```abap
* SLOW — copies every row
LOOP AT lt_big_table INTO ls_row.
  ls_row-status = 'X'.
  MODIFY lt_big_table FROM ls_row.  " Two operations: copy + write back
ENDLOOP.

* FAST — modifies in place
LOOP AT lt_big_table ASSIGNING FIELD-SYMBOL(<ls_row>).
  <ls_row>-status = 'X'.  " One operation: direct access
ENDLOOP.
```

The field symbol version is roughly 2x faster because it avoids copying each row and the MODIFY write-back.

## Common Mistakes

- **Modifying a work area and forgetting to MODIFY back.** `LOOP AT ... INTO ls_work. ls_work-field = 'X'.` doesn't change the table — you need `MODIFY lt_table FROM ls_work.` Field symbols don't have this problem.
- **Using a field symbol after the table is cleared.** If you `CLEAR lt_table` while a field symbol still points to a row, the field symbol becomes unassigned. Accessing it causes a runtime error.
- **Confusing `<fs>-field` and `lr->field` syntax.** Field symbols use `-` (dash): `<ls_emp>-name`. Data references use `->` (arrow): `lr_emp->name`. Mixing them up causes syntax errors.
- **Using generic field symbols (`TYPE any`) when typed ones work.** Generic field symbols bypass type checking — you lose compile-time safety. Always use the specific type when you know it.

## Key Takeaways

- INTO copies the row (safe but slower). ASSIGNING points to it (fast, modifies directly). REFERENCE INTO stores a pointer.
- Use field symbols (`ASSIGNING`) in loops where you modify data — 2x faster than copy + MODIFY.
- Use work areas (`INTO`) when you only read data or need a safe copy.
- Field symbols use `<angle_brackets>` and `-` for field access. Data references use `->`.
- Always check `IS ASSIGNED` for field symbols, `sy-subrc` for work areas.
- Inline declaration (`FIELD-SYMBOL(<ls_emp>)`) in loops is the cleanest modern syntax.

## Next Lesson

You can work with data. Now let's organize your code. In **Lesson 12: Subroutines, Function Modules, and Methods**, we'll learn ABAP's three modularization techniques — from the oldest (FORMs) to the newest (classes and methods).
