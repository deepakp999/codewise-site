---
title: "ALV Reports — The Modern Way to Display Data"
description: "Build professional ALV grid reports with REUSE_ALV_GRID_DISPLAY: field catalogs, layout options, sorting, totals, and colors."
order: 21
module: "reports-ui"
module_title: "Reports & User Interfaces"
tags: ["abap", "alv", "grid", "report", "reuse_alv", "intermediate"]
prev_slug: "classical-reports"
next_slug: "alv-oo"
---

# ALV Reports — The Modern Way to Display Data

## What You'll Learn
- What ALV is and why it replaced classical reports
- Using REUSE_ALV_GRID_DISPLAY for quick ALV output
- Field catalogs — controlling what columns appear and how
- Layout options — sorting, totals, column width
- Colors and conditional formatting

## What Is ALV?

ALV (ABAP List Viewer) is SAP's standard framework for displaying tabular data. It provides:

- Sortable, filterable columns (users can sort by clicking headers)
- Column reordering (drag and drop)
- Subtotals and totals (automatic)
- Export to Excel/CSV (built-in)
- Print formatting (automatic)
- Search within results (Ctrl+F)

All of this comes for free — you just pass your internal table to the ALV function module.

## Quick ALV — Minimum Code

```abap
REPORT z_alv_basic.

TYPES: BEGIN OF ty_employee,
         employee_id TYPE n LENGTH 10,
         name        TYPE string,
         department  TYPE string,
         salary      TYPE p DECIMALS 2,
         hire_date   TYPE d,
       END OF ty_employee.

DATA: lt_employees TYPE TABLE OF ty_employee.

START-OF-SELECTION.
  lt_employees = VALUE #(
    ( employee_id = '0000000001' name = 'Alice Johnson' department = 'Engineering' salary = '120000' hire_date = '20200115' )
    ( employee_id = '0000000002' name = 'Bob Smith' department = 'Marketing' salary = '95000' hire_date = '20190601' )
    ( employee_id = '0000000003' name = 'Charlie Brown' department = 'Engineering' salary = '130000' hire_date = '20210320' )
    ( employee_id = '0000000004' name = 'Diana Prince' department = 'Sales' salary = '88000' hire_date = '20221110' )
    ( employee_id = '0000000005' name = 'Eve Wilson' department = 'Marketing' salary = '92000' hire_date = '20200805' )
  ).

  * Display as ALV — one function call!
  CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
    EXPORTING
      i_structure_name = 'TY_EMPLOYEE'
    TABLES
      t_outtab = lt_employees
    EXCEPTIONS
      OTHERS   = 1.

  IF sy-subrc <> 0.
    MESSAGE 'ALV display failed' TYPE 'E'.
  ENDIF.
```

That's it. One function call and you get a full-featured data grid with sorting, filtering, and Excel export.

## Field Catalog — Controlling Columns

The field catalog tells ALV which columns to show and how:

```abap
DATA: lt_fieldcat TYPE slis_t_fieldcat_alv,
      ls_fieldcat TYPE slis_fieldcat_alv.

* Employee ID column
CLEAR ls_fieldcat.
ls_fieldcat-fieldname = 'EMPLOYEE_ID'.
ls_fieldcat-seltext_m = 'Employee ID'.
ls_fieldcat-col_pos   = 1.
ls_fieldcat-outputlen = 12.
ls_fieldcat-key       = 'X'.          " Key column (frozen, highlighted)
APPEND ls_fieldcat TO lt_fieldcat.

* Name column
CLEAR ls_fieldcat.
ls_fieldcat-fieldname = 'NAME'.
ls_fieldcat-seltext_m = 'Employee Name'.
ls_fieldcat-col_pos   = 2.
ls_fieldcat-outputlen = 25.
APPEND ls_fieldcat TO lt_fieldcat.

* Department column
CLEAR ls_fieldcat.
ls_fieldcat-fieldname = 'DEPARTMENT'.
ls_fieldcat-seltext_m = 'Department'.
ls_fieldcat-col_pos   = 3.
ls_fieldcat-outputlen = 15.
APPEND ls_fieldcat TO lt_fieldcat.

* Salary column
CLEAR ls_fieldcat.
ls_fieldcat-fieldname = 'SALARY'.
ls_fieldcat-seltext_m = 'Salary'.
ls_fieldcat-col_pos   = 4.
ls_fieldcat-outputlen = 15.
ls_fieldcat-do_sum    = 'X'.          " Show total at bottom
APPEND ls_fieldcat TO lt_fieldcat.

* Hire date column
CLEAR ls_fieldcat.
ls_fieldcat-fieldname = 'HIRE_DATE'.
ls_fieldcat-seltext_m = 'Hire Date'.
ls_fieldcat-col_pos   = 5.
ls_fieldcat-outputlen = 12.
APPEND ls_fieldcat TO lt_fieldcat.

* Display with custom field catalog
CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
  EXPORTING
    it_fieldcat = lt_fieldcat
  TABLES
    t_outtab    = lt_employees
  EXCEPTIONS
    OTHERS      = 1.
```

### Useful Field Catalog Options

```
fieldname    → internal table field name (must match exactly)
seltext_m    → column header text (medium length)
col_pos      → column position (1, 2, 3...)
outputlen    → display width
key          → 'X' to make it a key column (frozen left)
do_sum       → 'X' to show a total
no_out       → 'X' to hide the column (user can unhide)
edit         → 'X' to make the column editable
emphasize    → 'C110' for color (C = color, 1 = color number, 1 = intensified, 0 = not inverse)
hotspot      → 'X' to make values clickable (like hyperlinks)
```

## Layout Options

```abap
DATA: ls_layout TYPE slis_layout_alv.

ls_layout-zebra       = 'X'.        " Alternating row colors
ls_layout-colwidth_optimize = 'X'.  " Auto-size columns
ls_layout-window_titlebar = 'Employee Report'. " Window title

CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
  EXPORTING
    it_fieldcat  = lt_fieldcat
    is_layout    = ls_layout
  TABLES
    t_outtab     = lt_employees
  EXCEPTIONS
    OTHERS       = 1.
```

## Sorting

```abap
DATA: lt_sort TYPE slis_t_sortinfo_alv,
      ls_sort TYPE slis_sortinfo_alv.

* Sort by department ascending, then salary descending
ls_sort-fieldname = 'DEPARTMENT'.
ls_sort-up        = 'X'.        " Ascending
ls_sort-subtot    = 'X'.        " Show subtotal when department changes
APPEND ls_sort TO lt_sort.

ls_sort-fieldname = 'SALARY'.
ls_sort-down      = 'X'.        " Descending
APPEND ls_sort TO lt_sort.

CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
  EXPORTING
    it_fieldcat  = lt_fieldcat
    is_layout    = ls_layout
    it_sort      = lt_sort
  TABLES
    t_outtab     = lt_employees
  EXCEPTIONS
    OTHERS       = 1.
```

With `subtot = 'X'`, ALV automatically shows salary subtotals for each department group — without you writing any aggregation code.

## ALV Events — Interactive Features

```abap
DATA: lt_events TYPE slis_t_event,
      ls_event  TYPE slis_alv_event.

* Handle double-click
ls_event-name = 'USER_COMMAND'.
ls_event-form = 'HANDLE_USER_COMMAND'.
APPEND ls_event TO lt_events.

CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
  EXPORTING
    it_fieldcat  = lt_fieldcat
    it_events    = lt_events
  TABLES
    t_outtab     = lt_employees
  EXCEPTIONS
    OTHERS       = 1.

* Event handler subroutine
FORM handle_user_command USING pv_ucomm    TYPE sy-ucomm
                               ps_selfield TYPE slis_selfield.
  IF pv_ucomm = '&IC1'.  " Double-click
    READ TABLE lt_employees INTO DATA(ls_emp) INDEX ps_selfield-tabindex.
    IF sy-subrc = 0.
      MESSAGE |You clicked on { ls_emp-name }| TYPE 'I'.
    ENDIF.
  ENDIF.
ENDFORM.
```

## Common Mistakes

- **Not matching fieldname exactly.** The field catalog's `fieldname` must match the internal table field name exactly (case-insensitive but spelling must match). A mismatch causes the column to not appear.
- **Using the function module version instead of OO.** `REUSE_ALV_GRID_DISPLAY` works but is the older approach. Modern ABAP uses `CL_SALV_TABLE` (next lesson). Both work — REUSE is simpler for basic cases, CL_SALV is more flexible.
- **Forgetting to build the field catalog.** If you don't pass `it_fieldcat`, you must pass `i_structure_name` (the name of a dictionary structure). Without either, ALV doesn't know your columns.

## Key Takeaways

- ALV provides sorting, filtering, export, and totals for free — one function call.
- Field catalogs control column display: headers, width, position, totals, visibility.
- Layout options add zebra stripes, auto-sizing, and window titles.
- Sort with subtotals gives you grouped reports without writing aggregation code.
- Events enable interactive features like double-click navigation.
- `REUSE_ALV_GRID_DISPLAY` is the function module approach. `CL_SALV_TABLE` is the OO approach (next lesson).

## Next Lesson

REUSE_ALV_GRID_DISPLAY works, but it's the older approach. In **Lesson 22: ALV with OO — CL_SALV_TABLE**, we'll learn the modern object-oriented ALV that's recommended for new development.
