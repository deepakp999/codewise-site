---
title: "Control Flow — IF, CASE, and Loops in ABAP"
description: "Master ABAP control flow: IF/ELSEIF/ENDIF, CASE, DO loops, WHILE loops, and LOOP AT — with Python and Java comparisons."
order: 8
module: "abap-fundamentals"
module_title: "ABAP Language Fundamentals"
tags: ["abap", "if", "case", "loop", "control flow", "beginner"]
prev_slug: "strings-and-string-operations"
next_slug: "internal-tables"
---

# Control Flow — IF, CASE, and Loops

## What You'll Learn
- IF/ELSEIF/ELSE/ENDIF — conditional branching
- CASE — pattern matching (like switch)
- DO — counted loops
- WHILE — conditional loops
- LOOP AT — iterating internal tables (ABAP's foreach)
- Comparison operators and logical operators

## IF / ELSEIF / ELSE / ENDIF

```abap
REPORT z_control_flow.

DATA: lv_score TYPE i VALUE 85.

IF lv_score >= 90.
  WRITE: / 'Grade: A'.
ELSEIF lv_score >= 80.
  WRITE: / 'Grade: B'.
ELSEIF lv_score >= 70.
  WRITE: / 'Grade: C'.
ELSE.
  WRITE: / 'Grade: F'.
ENDIF.
```

### Expected Output
```
Grade: B
```

**Coming from Python:** Python uses `if/elif/else:` with indentation. ABAP uses `IF/ELSEIF/ELSE.` with explicit `ENDIF.` — no indentation required (but recommended for readability).

**Coming from Java:** Java uses `if/else if/else` with braces `{}`. ABAP replaces braces with `ENDIF.`

### Comparison Operators

```
ABAP     Python    Java      Meaning
=        ==        ==        Equal
<>       !=        !=        Not equal
>        >         >         Greater than
<        <         <         Less than
>=       >=        >=        Greater or equal
<=       <=        <=        Less or equal
```

**Important:** ABAP uses `=` for both assignment AND comparison. The context determines which it is:

```abap
lv_x = 10.                " Assignment (left side of statement)
IF lv_x = 10.             " Comparison (inside IF condition)
```

### Logical Operators

```abap
DATA: lv_age TYPE i VALUE 25,
      lv_salary TYPE i VALUE 95000.

* AND
IF lv_age > 20 AND lv_salary > 90000.
  WRITE: / 'Young and well-paid'.
ENDIF.

* OR
IF lv_age < 20 OR lv_age > 60.
  WRITE: / 'Outside typical working age'.
ENDIF.

* NOT
IF NOT lv_age > 30.
  WRITE: / 'Age is 30 or below'.
ENDIF.
```

### Expected Output
```
Young and well-paid
Age is 30 or below
```

### IS INITIAL — Checking for Default Values

```abap
DATA: lv_name TYPE string,
      lv_count TYPE i.

IF lv_name IS INITIAL.    " Empty string
  WRITE: / 'Name is empty'.
ENDIF.

IF lv_count IS INITIAL.   " Zero
  WRITE: / 'Count is zero'.
ENDIF.
```

`IS INITIAL` checks if a variable has its type-specific default value (0 for numbers, empty for strings, '00000000' for dates). It's ABAP's way of checking "has this been set?"

## CASE — Pattern Matching

```abap
DATA: lv_day TYPE string VALUE 'Monday'.

CASE lv_day.
  WHEN 'Monday' OR 'Tuesday' OR 'Wednesday' OR 'Thursday' OR 'Friday'.
    WRITE: / 'Weekday'.
  WHEN 'Saturday' OR 'Sunday'.
    WRITE: / 'Weekend'.
  WHEN OTHERS.
    WRITE: / 'Unknown day'.
ENDCASE.
```

### Expected Output
```
Weekday
```

**Coming from Python:** Python uses `match/case` (3.10+). ABAP's `CASE/WHEN` is closer to Java's `switch/case`, but without fall-through — each `WHEN` block is independent, no `break` needed.

### CASE with TYPE (checking object types)

```abap
* Used in OOP — check object type
* CASE TYPE OF lo_object.
*   WHEN TYPE zcl_customer.
*     " Handle customer
*   WHEN TYPE zcl_vendor.
*     " Handle vendor
* ENDCASE.
```

## DO — Counted Loops

```abap
* Loop exactly 5 times
DO 5 TIMES.
  WRITE: / |Iteration { sy-index }|.
ENDDO.
```

### Expected Output
```
Iteration 1
Iteration 2
Iteration 3
Iteration 4
Iteration 5
```

`sy-index` is a system variable that contains the current loop counter (1-based, not 0-based like Python's `range()`).

### Infinite Loop with EXIT

```abap
DATA: lv_total TYPE i.

DO.
  lv_total = lv_total + 1.
  IF lv_total > 3.
    EXIT.  " Break out of the loop
  ENDIF.
  WRITE: / |Count: { lv_total }|.
ENDDO.

WRITE: / |Final total: { lv_total }|.
```

### Expected Output
```
Count: 1
Count: 2
Count: 3
Final total: 4
```

`EXIT` is ABAP's `break`. `CONTINUE` is ABAP's `continue` — skip to the next iteration.

## WHILE — Conditional Loops

```abap
DATA: lv_counter TYPE i VALUE 1.

WHILE lv_counter <= 5.
  WRITE: / |Counter: { lv_counter }|.
  lv_counter = lv_counter + 1.
ENDWHILE.
```

### Expected Output
```
Counter: 1
Counter: 2
Counter: 3
Counter: 4
Counter: 5
```

Same as Python's `while` and Java's `while` — just with `ENDWHILE` instead of braces or indentation.

## LOOP AT — Iterating Internal Tables

This is ABAP's most distinctive loop and the one you'll use most. Internal tables (covered in depth in Lesson 9) are ABAP's equivalent of Python lists or Java ArrayLists.

```abap
* Create a simple internal table
DATA: lt_names TYPE TABLE OF string.

APPEND 'Alice' TO lt_names.
APPEND 'Bob' TO lt_names.
APPEND 'Charlie' TO lt_names.

* Loop through the table
LOOP AT lt_names INTO DATA(lv_name).
  WRITE: / |Name: { lv_name }, Row: { sy-tabix }|.
ENDLOOP.
```

### Expected Output
```
Name: Alice, Row: 1
Name: Bob, Row: 2
Name: Charlie, Row: 3
```

`sy-tabix` is the current row index (1-based) within a `LOOP AT`. It's the ABAP equivalent of Python's `enumerate()`.

### LOOP with WHERE condition

```abap
DATA: BEGIN OF ls_employee,
        name TYPE string,
        department TYPE string,
        salary TYPE i,
      END OF ls_employee.

DATA: lt_employees LIKE TABLE OF ls_employee.

ls_employee-name = 'Alice'. ls_employee-department = 'Engineering'. ls_employee-salary = 120000.
APPEND ls_employee TO lt_employees.
ls_employee-name = 'Bob'. ls_employee-department = 'Marketing'. ls_employee-salary = 95000.
APPEND ls_employee TO lt_employees.
ls_employee-name = 'Charlie'. ls_employee-department = 'Engineering'. ls_employee-salary = 130000.
APPEND ls_employee TO lt_employees.

* Loop only over engineers
LOOP AT lt_employees INTO ls_employee WHERE department = 'Engineering'.
  WRITE: / |{ ls_employee-name } earns { ls_employee-salary }|.
ENDLOOP.
```

### Expected Output
```
Alice earns 120000
Charlie earns 130000
```

**Coming from Python:** This is like `for emp in employees if emp.department == 'Engineering':` — but the filtering happens at the loop level, not as a separate filter step.

## Control Statements Summary

```
ABAP              Python              Java
──────────────     ──────────────     ──────────────
IF ... ENDIF       if:                if { }
ELSEIF             elif:              else if { }
CASE ... ENDCASE   match/case:        switch { }
DO n TIMES         for i in range(n)  for (i=0; i<n; i++)
WHILE ... ENDWHILE while:             while { }
LOOP AT ... ENDLOOP for x in list:    for (x : list)
EXIT               break              break
CONTINUE           continue           continue
CHECK              (no equivalent)    (no equivalent)
```

### CHECK — ABAP's Unique Control Statement

```abap
DO 10 TIMES.
  CHECK sy-index MOD 2 = 0.  " Only continue if index is even
  WRITE: / |Even: { sy-index }|.
ENDDO.
```

### Expected Output
```
Even: 2
Even: 4
Even: 6
Even: 8
Even: 10
```

`CHECK` evaluates a condition — if true, execution continues. If false, it skips to the next iteration (like `CONTINUE` with a built-in IF). It's compact but can be hard to read. Many teams prefer explicit `IF/CONTINUE` instead.

## Common Mistakes

- **Forgetting ENDIF, ENDDO, ENDWHILE, ENDCASE.** Every block opener needs its closer. The ABAP editor's syntax check (Ctrl+F2) catches these immediately, but they're still the #1 syntax error for newcomers.
- **Using `=` for comparison in ambiguous contexts.** `IF lv_x = lv_y.` is a comparison. `lv_x = lv_y.` outside an IF is an assignment. This is clear to ABAP developers but confuses Python developers who use `==` for comparison.
- **Forgetting that DO/WHILE loops without EXIT can run forever.** Unlike Python which has no `DO` loop, ABAP's `DO.` without `TIMES` runs indefinitely. Always have an `EXIT` condition.
- **Using `sy-index` outside a DO loop.** `sy-index` is the DO loop counter. Inside a `LOOP AT`, use `sy-tabix` instead. Using the wrong system variable is a common source of bugs.

## Key Takeaways

- `IF/ELSEIF/ELSE/ENDIF` and `CASE/WHEN/ENDCASE` handle branching.
- `DO n TIMES` for counted loops, `WHILE` for conditional loops, `LOOP AT` for iterating tables.
- `sy-index` = current DO loop counter. `sy-tabix` = current LOOP AT row index. Both are 1-based.
- `EXIT` = break, `CONTINUE` = skip to next iteration, `CHECK` = conditional continue.
- `IS INITIAL` checks for default values — ABAP's way of checking "empty" or "unset."
- Every block ends with `END*` — ENDIF, ENDDO, ENDWHILE, ENDCASE, ENDLOOP.

## Next Lesson

You've seen `LOOP AT` and internal tables briefly. In **Lesson 9: Internal Tables — ABAP's Most Important Concept**, we'll dive deep into the data structure that makes ABAP unique — and the one you'll use in every single program you write.
