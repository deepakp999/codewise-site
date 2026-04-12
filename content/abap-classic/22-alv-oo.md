---
title: "ALV with OO — CL_SALV_TABLE"
description: "Build modern ALV reports using CL_SALV_TABLE: the object-oriented approach with columns, sorting, aggregation, and event handling."
order: 22
module: "reports-ui"
module_title: "Reports & User Interfaces"
tags: ["abap", "cl_salv_table", "alv", "oop", "modern", "intermediate"]
prev_slug: "alv-reports"
next_slug: "function-modules-deep-dive"
---

# ALV with OO — CL_SALV_TABLE

## What You'll Learn
- Creating ALV with CL_SALV_TABLE — the modern approach
- Customizing columns, sorting, and aggregation via methods
- Adding colors and icons
- The advantages over REUSE_ALV_GRID_DISPLAY

## CL_SALV_TABLE — The Modern Way

```abap
REPORT z_salv_demo.

TYPES: BEGIN OF ty_employee,
         employee_id TYPE n LENGTH 10,
         name        TYPE string,
         department  TYPE string,
         salary      TYPE p DECIMALS 2,
         hire_date   TYPE d,
       END OF ty_employee.

DATA: lt_employees TYPE TABLE OF ty_employee,
      lo_alv       TYPE REF TO cl_salv_table.

START-OF-SELECTION.
  lt_employees = VALUE #(
    ( employee_id = '0000000001' name = 'Alice Johnson' department = 'Engineering' salary = '120000' hire_date = '20200115' )
    ( employee_id = '0000000002' name = 'Bob Smith' department = 'Marketing' salary = '95000' hire_date = '20190601' )
    ( employee_id = '0000000003' name = 'Charlie Brown' department = 'Engineering' salary = '130000' hire_date = '20210320' )
    ( employee_id = '0000000004' name = 'Diana Prince' department = 'Sales' salary = '88000' hire_date = '20221110' )
    ( employee_id = '0000000005' name = 'Eve Wilson' department = 'Marketing' salary = '92000' hire_date = '20200805' )
  ).

  TRY.
      * Create the ALV object
      cl_salv_table=>factory(
        IMPORTING r_salv_table = lo_alv
        CHANGING  t_table      = lt_employees ).

      * Customize and display
      lo_alv->display( ).

    CATCH cx_salv_msg INTO DATA(lo_error).
      MESSAGE lo_error->get_text( ) TYPE 'E'.
  ENDTRY.
```

That's the minimum — 3 lines of real code. But unlike REUSE_ALV, everything is configured through methods on the ALV object.

## Customizing Columns

```abap
* Get the columns object
DATA(lo_columns) = lo_alv->get_columns( ).
lo_columns->set_optimize( ).  " Auto-size columns

* Customize individual columns
TRY.
    DATA(lo_col_name) = lo_columns->get_column( 'NAME' ).
    lo_col_name->set_short_text( 'Name' ).
    lo_col_name->set_medium_text( 'Employee Name' ).
    lo_col_name->set_long_text( 'Full Employee Name' ).
    lo_col_name->set_output_length( 25 ).

    DATA(lo_col_salary) = CAST cl_salv_column_table( lo_columns->get_column( 'SALARY' ) ).
    lo_col_salary->set_short_text( 'Salary' ).

    * Hide a column
    DATA(lo_col_id) = lo_columns->get_column( 'EMPLOYEE_ID' ).
    lo_col_id->set_visible( if_salv_c_bool_sap=>false ).

  CATCH cx_salv_not_found.
    " Column not found — handle gracefully
ENDTRY.
```

## Adding Sorting and Totals

```abap
* Sort by department ascending
DATA(lo_sorts) = lo_alv->get_sorts( ).
TRY.
    lo_sorts->add_sort( columnname = 'DEPARTMENT' position = 1 sequence = if_salv_c_sort=>sort_up subtotal = if_salv_c_bool_sap=>true ).
    lo_sorts->add_sort( columnname = 'SALARY' position = 2 sequence = if_salv_c_sort=>sort_down ).
  CATCH cx_salv_not_found cx_salv_existing cx_salv_data_error.
ENDTRY.

* Add totals for salary column
DATA(lo_aggregations) = lo_alv->get_aggregations( ).
TRY.
    lo_aggregations->add_aggregation( columnname = 'SALARY' aggregation = if_salv_c_aggregation=>total ).
  CATCH cx_salv_not_found cx_salv_existing cx_salv_data_error.
ENDTRY.
```

## Layout and Display Settings

```abap
* Zebra stripes
DATA(lo_display) = lo_alv->get_display_settings( ).
lo_display->set_striped_pattern( if_salv_c_bool_sap=>true ).
lo_display->set_list_header( 'Employee Salary Report' ).

* Enable all standard ALV functions (sort, filter, export, etc.)
DATA(lo_functions) = lo_alv->get_functions( ).
lo_functions->set_all( ).
```

`set_all( )` enables every built-in ALV function — sorting, filtering, subtotals, export to Excel, print, column configuration, and more. Without it, some toolbar buttons may be hidden.

## Complete Example

```abap
REPORT z_salv_complete.

TYPES: BEGIN OF ty_employee,
         employee_id TYPE n LENGTH 10,
         name        TYPE string,
         department  TYPE string,
         salary      TYPE p DECIMALS 2,
         hire_date   TYPE d,
       END OF ty_employee.

DATA: lt_employees TYPE TABLE OF ty_employee,
      lo_alv       TYPE REF TO cl_salv_table.

PARAMETERS: p_dept TYPE c LENGTH 30.

START-OF-SELECTION.
  lt_employees = VALUE #(
    ( employee_id = '0000000001' name = 'Alice' department = 'Engineering' salary = '120000' hire_date = '20200115' )
    ( employee_id = '0000000002' name = 'Bob' department = 'Marketing' salary = '95000' hire_date = '20190601' )
    ( employee_id = '0000000003' name = 'Charlie' department = 'Engineering' salary = '130000' hire_date = '20210320' )
    ( employee_id = '0000000004' name = 'Diana' department = 'Sales' salary = '88000' hire_date = '20221110' )
    ( employee_id = '0000000005' name = 'Eve' department = 'Marketing' salary = '92000' hire_date = '20200805' )
  ).

  * Filter by department if specified
  IF p_dept IS NOT INITIAL.
    DELETE lt_employees WHERE department <> p_dept.
  ENDIF.

  TRY.
      cl_salv_table=>factory( IMPORTING r_salv_table = lo_alv CHANGING t_table = lt_employees ).

      * Enable all toolbar functions
      lo_alv->get_functions( )->set_all( ).

      * Optimize column widths
      lo_alv->get_columns( )->set_optimize( ).

      * Zebra pattern
      lo_alv->get_display_settings( )->set_striped_pattern( if_salv_c_bool_sap=>true ).
      lo_alv->get_display_settings( )->set_list_header( |Employee Report — { COND string( WHEN p_dept IS INITIAL THEN 'All Departments' ELSE p_dept ) }| ).

      * Sort and subtotal
      lo_alv->get_sorts( )->add_sort( columnname = 'DEPARTMENT' subtotal = if_salv_c_bool_sap=>true ).
      lo_alv->get_aggregations( )->add_aggregation( columnname = 'SALARY' aggregation = if_salv_c_aggregation=>total ).

      * Display
      lo_alv->display( ).

    CATCH cx_salv_msg cx_salv_not_found cx_salv_existing cx_salv_data_error INTO DATA(lo_err).
      MESSAGE lo_err->get_text( ) TYPE 'E'.
  ENDTRY.
```

## REUSE vs CL_SALV — When to Use Which

```
Feature                    REUSE_ALV    CL_SALV_TABLE
─────────────────────────  ──────────   ─────────────
Approach                   Function     OOP
Field catalog              Manual       Auto-generated
Column customization       Via table    Via methods
Event handling             FORM/PERFORM Class events
Editable grid              Yes          Limited
Recommended for new code   No           Yes
Learning curve             Lower        Moderate
```

**For new programs, use CL_SALV_TABLE.** It's cleaner, more maintainable, and SAP's recommended approach. Use REUSE_ALV only when maintaining existing code that already uses it, or when you need editable grid functionality.

## Common Mistakes

- **Forgetting `get_functions( )->set_all( )`.** Without it, the ALV toolbar is minimal — users can't sort, filter, or export. Always call `set_all()` unless you have a specific reason to restrict functions.
- **Not handling exceptions.** CL_SALV methods throw exceptions for invalid column names, duplicate sorts, etc. Always wrap in TRY/CATCH.
- **Trying to make CL_SALV_TABLE editable.** CL_SALV_TABLE is designed for display, not editing. For editable grids, you need CL_GUI_ALV_GRID (more complex) or the REUSE function module approach.

## Key Takeaways

- CL_SALV_TABLE is the modern OOP approach to ALV — cleaner than REUSE_ALV_GRID_DISPLAY.
- `factory()` creates the ALV, method calls customize it, `display()` shows it.
- Call `get_functions()->set_all()` to enable all toolbar features.
- Use `get_columns()` to customize individual columns.
- Use `get_sorts()` for sorting and `get_aggregations()` for totals.
- Always wrap in TRY/CATCH — CL_SALV methods throw exceptions.

## Next Lesson

Module 4 is complete! You can build selection screens, handle events, create classical reports, and display professional ALV grids. In **Module 5: Integration & Communication**, we start with **Lesson 23: Function Modules and Function Groups** — how to build reusable, callable components in SAP.
