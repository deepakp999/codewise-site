---
title: "Subroutines, Function Modules, and Methods"
description: "Learn ABAP's three modularization approaches: FORM/PERFORM, FUNCTION modules in SE37, and OOP with CLASS/METHOD. Understand when to use each."
order: 12
module: "abap-fundamentals"
module_title: "ABAP Language Fundamentals"
tags: ["abap", "function module", "class", "method", "modularization", "beginner"]
prev_slug: "field-symbols-and-references"
next_slug: "data-dictionary"
---

# Subroutines, Function Modules, and Methods

## What You'll Learn
- FORM/PERFORM — the legacy approach (still everywhere in existing code)
- Function modules (SE37) — SAP's reusable building blocks
- Classes and methods — modern OOP in ABAP
- When to use each and what SAP recommends in 2026

## Three Eras of ABAP Modularization

ABAP evolved over 40 years. Each era introduced a new way to organize code:

```
1980s-1990s: FORM/PERFORM (subroutines)     — still in legacy code
1990s-2010s: Function Modules (SE37)         — SAP's standard API layer
2000s-today: Classes and Methods (SE24)      — modern ABAP, recommended
```

You need to understand all three because you'll encounter all three in real SAP systems. But for new code, always use classes and methods.

## FORM/PERFORM — Subroutines (Legacy)

```abap
REPORT z_modularization.

* Call the subroutine
PERFORM calculate_bonus USING 120000 12.5.
PERFORM calculate_bonus USING 95000 10.0.

* Define the subroutine
FORM calculate_bonus USING pv_salary TYPE i
                           pv_bonus_pct TYPE p.
  DATA: lv_bonus TYPE p DECIMALS 2.
  lv_bonus = pv_salary * pv_bonus_pct / 100.
  WRITE: / |Salary: { pv_salary }, Bonus: { lv_bonus }|.
ENDFORM.
```

### Expected Output
```
Salary: 120000, Bonus: 15000.00
Salary: 95000, Bonus: 9500.00
```

**USING** passes parameters by reference (read-only intent). **CHANGING** passes by reference (read-write). **TABLES** passes internal tables.

**Coming from Python:** `FORM` is like `def`, `PERFORM` is the function call. But FORM is defined below the call (unusual for most languages).

**SAP's recommendation: Don't use FORM/PERFORM in new code.** It's considered obsolete. But you'll see it in thousands of existing programs.

## Function Modules (SE37)

Function modules are reusable units stored in the SAP system — callable from any program, even from external systems via RFC.

You create them in transaction SE37 (Function Builder), not inside your program's source code. They live in **function groups** — containers that hold related functions.

### Calling a Function Module

```abap
* Call a standard SAP function module
DATA: lv_date TYPE d VALUE '20260412',
      lv_day  TYPE string.

CALL FUNCTION 'DAY_IN_WEEK'
  EXPORTING
    datum = lv_date
  IMPORTING
    woession = lv_day.

WRITE: / |Day of week: { lv_day }|.  " Returns 1=Mon, 7=Sun
```

### Function Module Interface

Every function module has four parameter categories:

```
IMPORTING   → Input parameters (passed to the function)
EXPORTING   → Output parameters (returned from the function)
CHANGING    → Parameters that go in AND come back modified
TABLES      → Internal table parameters (legacy — use CHANGING instead)
EXCEPTIONS  → Error conditions the function can raise
```

### Calling with Exception Handling

```abap
CALL FUNCTION 'CONVERSION_EXIT_ALPHA_OUTPUT'
  EXPORTING
    input  = '0000001234'
  IMPORTING
    output = DATA(lv_formatted)
  EXCEPTIONS
    OTHERS = 1.

IF sy-subrc = 0.
  WRITE: / |Formatted: { lv_formatted }|.  " '1234' — leading zeros removed
ELSE.
  WRITE: / 'Conversion failed'.
ENDIF.
```

### Expected Output
```
Formatted: 1234
```

**Coming from Python:** Function modules are like library functions you can call — similar to `import math; math.sqrt(16)`. But they're stored in SAP's database, not in files. And the calling syntax (`CALL FUNCTION ... EXPORTING ... IMPORTING ...`) is verbose compared to Python's `result = function(args)`.

### Important Standard Function Modules

You'll use these frequently:

```
CONVERSION_EXIT_ALPHA_OUTPUT   Remove leading zeros from IDs
CONVERSION_EXIT_ALPHA_INPUT    Add leading zeros to IDs
POPUP_TO_CONFIRM               Show a Yes/No dialog
DATE_COMPUTE_DAY               Get day of week from a date
READ_TEXT                      Read SAP text objects
BAPI_SALESORDER_CREATEFROMDAT2 Create a sales order via BAPI
```

## Classes and Methods (SE24) — Modern ABAP

```abap
* Define a local class
CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    METHODS: constructor IMPORTING iv_name TYPE string
                                   iv_salary TYPE i,
             get_name RETURNING VALUE(rv_name) TYPE string,
             get_salary RETURNING VALUE(rv_salary) TYPE i,
             give_raise IMPORTING iv_percentage TYPE p,
             display.

  PRIVATE SECTION.
    DATA: mv_name   TYPE string,
          mv_salary TYPE i.
ENDCLASS.

CLASS lcl_employee IMPLEMENTATION.
  METHOD constructor.
    mv_name = iv_name.
    mv_salary = iv_salary.
  ENDMETHOD.

  METHOD get_name.
    rv_name = mv_name.
  ENDMETHOD.

  METHOD get_salary.
    rv_salary = mv_salary.
  ENDMETHOD.

  METHOD give_raise.
    mv_salary = mv_salary + ( mv_salary * iv_percentage / 100 ).
  ENDMETHOD.

  METHOD display.
    WRITE: / |{ mv_name }: { mv_salary }|.
  ENDMETHOD.
ENDCLASS.

* Use the class
START-OF-SELECTION.
  DATA(lo_alice) = NEW lcl_employee( iv_name = 'Alice' iv_salary = 120000 ).
  lo_alice->display( ).

  lo_alice->give_raise( 10 ).
  lo_alice->display( ).

  WRITE: / |Name: { lo_alice->get_name( ) }|.
```

### Expected Output
```
Alice: 120000
Alice: 132000
Name: Alice
```

**Coming from Java:** This looks very familiar — `DEFINITION` = class declaration, `IMPLEMENTATION` = method bodies, `PUBLIC SECTION` / `PRIVATE SECTION` = access modifiers, `constructor` = constructor, `->` = method call. The main differences are the verbose parameter syntax and the separation of definition and implementation.

**Coming from Python:** `CLASS ... DEFINITION` is like the class header with method signatures. `CLASS ... IMPLEMENTATION` contains the actual method code. Python combines both in one block. ABAP's `mv_` prefix convention is like Python's `self.name` — but using a naming convention instead of an explicit `self` parameter.

### Naming Conventions for OOP

```
lcl_    Local class (defined in a program)
zcl_    Global class (defined in SE24, reusable across programs)
lo_     Local object (instance variable)
mv_     Member variable (instance attribute)
iv_     Importing parameter
ev_     Exporting parameter
rv_     Returning value
cv_     Changing parameter
```

## Static Methods

```abap
CLASS lcl_math DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS: calculate_tax IMPORTING iv_amount TYPE p
                                RETURNING VALUE(rv_tax) TYPE p.
ENDCLASS.

CLASS lcl_math IMPLEMENTATION.
  METHOD calculate_tax.
    rv_tax = iv_amount * 30 / 100.
  ENDMETHOD.
ENDCLASS.

* Call without creating an instance
DATA(lv_tax) = lcl_math=>calculate_tax( iv_amount = CONV #( 100000 ) ).
WRITE: / |Tax: { lv_tax }|.
```

`=>` calls a static method (like Java's `ClassName.method()`). `->` calls an instance method (like Java's `object.method()`).

## Interfaces

```abap
INTERFACE lif_displayable.
  METHODS: display.
ENDINTERFACE.

CLASS lcl_product DEFINITION.
  PUBLIC SECTION.
    INTERFACES: lif_displayable.
    METHODS: constructor IMPORTING iv_name TYPE string.
  PRIVATE SECTION.
    DATA: mv_name TYPE string.
ENDCLASS.

CLASS lcl_product IMPLEMENTATION.
  METHOD lif_displayable~display.
    WRITE: / |Product: { mv_name }|.
  ENDMETHOD.
  METHOD constructor.
    mv_name = iv_name.
  ENDMETHOD.
ENDCLASS.
```

The `lif_displayable~display` syntax means "the display method from interface lif_displayable." The tilde (`~`) links the method to its interface.

## Which Approach for Which Situation?

```
Situation                           Use
──────────────────────────────     ─────────────────────
New code in 2026                    Classes and methods
Code that must be called via RFC    Function module (RFC-enabled)
Working with SAP standard BAPIs     Function modules (they're already FMs)
Modifying legacy code               Match the existing style (usually FORM)
Quick utility in a report           Local class or static method
Reusable across programs            Global class in SE24
```

## Common Mistakes

- **Using FORM/PERFORM in new programs.** It's tempting because it's simpler, but SAP has deprecated it. Use local classes — even a simple static method is better than a FORM.
- **Forgetting exception handling on CALL FUNCTION.** If a function module raises an exception you don't handle, it causes a short dump (runtime crash). Always handle EXCEPTIONS or use TRY/CATCH.
- **Putting everything in PUBLIC SECTION.** Like in any OOP language, minimize public methods. Use PRIVATE SECTION for internal state and helper methods.
- **Confusing `->` and `=>`.** `->` is for instance method calls (`lo_object->method()`). `=>` is for static method calls (`lcl_class=>method()`). Mixing them up causes syntax errors.

## Key Takeaways

- FORM/PERFORM is legacy — read it, don't write new code with it.
- Function modules are SAP's API layer — you'll call them constantly (BAPIs, conversions, popups).
- Classes and methods are modern ABAP — use them for all new development.
- `->` calls instance methods, `=>` calls static methods, `~` links interface methods.
- Function module parameters use IMPORTING/EXPORTING/CHANGING/EXCEPTIONS.
- Method parameters use IMPORTING/EXPORTING/RETURNING/CHANGING/RAISING.

## Next Lesson

Module 2 is complete! You now know ABAP's core language: variables, strings, control flow, internal tables, field symbols, and modularization. In **Module 3**, we go to where the data lives — starting with **Lesson 13: The ABAP Data Dictionary (SE11)**.
