---
title: "Selection Screens — PARAMETERS and SELECT-OPTIONS"
description: "Build user input screens for ABAP reports with PARAMETERS for single values, SELECT-OPTIONS for ranges, and screen design techniques."
order: 18
module: "reports-ui"
module_title: "Reports & User Interfaces"
tags: ["abap", "selection screen", "parameters", "select-options", "beginner"]
prev_slug: "table-types-structures-ranges"
next_slug: "events-in-reports"
---

# Selection Screens — PARAMETERS and SELECT-OPTIONS

## What You'll Learn
- PARAMETERS for single input values
- SELECT-OPTIONS for ranges and multiple values
- Screen layout: blocks, comments, and formatting
- Input validation with AT SELECTION-SCREEN
- Making fields mandatory, setting defaults, and adding F4 help

## Why Selection Screens?

Every business report needs user input: "Show me sales orders from January to March for customer X." Selection screens are ABAP's built-in way to collect this input before the report runs.

When you run a report with F8, SAP displays the selection screen first. The user fills in parameters, clicks Execute, and the report processes data based on those inputs.

## PARAMETERS — Single Value Input

```abap
REPORT z_selection_screen.

* Single input fields
PARAMETERS: p_cust  TYPE kunnr,                        " Customer number
            p_date  TYPE datum DEFAULT sy-datum,        " Date with default
            p_dept  TYPE c LENGTH 30 DEFAULT 'Engineering', " Text with default
            p_count TYPE i DEFAULT 100.                 " Number with default

START-OF-SELECTION.
  WRITE: / |Customer: { p_cust }|.
  WRITE: / |Date: { p_date }|.
  WRITE: / |Department: { p_dept }|.
  WRITE: / |Max rows: { p_count }|.
```

When you run this with F8, SAP shows a screen with four input fields. The user fills them in and clicks Execute (F8 again). Then the code after `START-OF-SELECTION` runs.

### Parameter Options

```abap
PARAMETERS: p_name  TYPE string OBLIGATORY,             " Required field
            p_type  TYPE c LENGTH 2 DEFAULT 'TA',       " Default value
            p_check TYPE abap_bool AS CHECKBOX,          " Checkbox
            p_radio1 RADIOBUTTON GROUP grp1 DEFAULT 'X', " Radio button (selected)
            p_radio2 RADIOBUTTON GROUP grp1.             " Radio button (not selected)
```

- `OBLIGATORY` — user must fill this field (shows a checkmark)
- `AS CHECKBOX` — renders as a checkbox instead of an input field
- `RADIOBUTTON GROUP` — groups radio buttons (only one can be selected)

## SELECT-OPTIONS — Range Input

SELECT-OPTIONS are more powerful than PARAMETERS — they accept ranges, patterns, and multiple values:

```abap
* Range input fields
SELECT-OPTIONS: s_kunnr FOR kna1-kunnr,     " Customer number range
                s_date  FOR sy-datum,        " Date range
                s_land  FOR kna1-land1.      " Country range

START-OF-SELECTION.
  * s_kunnr, s_date, s_land are RANGE tables (Lesson 17)
  SELECT kunnr, name1, land1
    FROM kna1
    INTO TABLE @DATA(lt_customers)
    WHERE kunnr IN @s_kunnr
      AND land1 IN @s_land.

  WRITE: / |Found { lines( lt_customers ) } customers|.
  LOOP AT lt_customers INTO DATA(ls_c).
    WRITE: / |{ ls_c-kunnr }: { ls_c-name1 } ({ ls_c-land1 })|.
  ENDLOOP.
```

The `FOR` keyword tells SAP which field the SELECT-OPTION is based on — it inherits the type, F4 help, and description from that field. The user can enter:

- A single value: `1001`
- A range: `1001` to `1999`
- Multiple values (click the multiple selection button)
- Exclusions (toggle Include/Exclude)

Internally, each SELECT-OPTION is a RANGE table — exactly what we learned in Lesson 17.

## Screen Layout

### Blocks

```abap
SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.
  PARAMETERS: p_cust TYPE kunnr OBLIGATORY.
  SELECT-OPTIONS: s_date FOR sy-datum.
SELECTION-SCREEN END OF BLOCK b1.

SELECTION-SCREEN BEGIN OF BLOCK b2 WITH FRAME TITLE TEXT-002.
  PARAMETERS: p_count TYPE i DEFAULT 100.
  PARAMETERS: p_test AS CHECKBOX DEFAULT 'X'.
SELECTION-SCREEN END OF BLOCK b2.
```

`TEXT-001` and `TEXT-002` are text symbols — you define them via Goto → Text Elements → Text Symbols. For example, TEXT-001 = "Selection Criteria", TEXT-002 = "Output Options".

### Comments and Spacing

```abap
SELECTION-SCREEN SKIP 1.               " Add a blank line
SELECTION-SCREEN COMMENT /1(60) TEXT-003.  " Add text comment
SELECTION-SCREEN ULINE.                " Add a horizontal line
```

## Input Validation

```abap
AT SELECTION-SCREEN.
  * Validate customer exists
  IF p_cust IS NOT INITIAL.
    SELECT SINGLE kunnr FROM kna1 INTO @DATA(lv_check)
      WHERE kunnr = @p_cust.
    IF sy-subrc <> 0.
      MESSAGE |Customer { p_cust } does not exist| TYPE 'E'.
    ENDIF.
  ENDIF.

AT SELECTION-SCREEN ON s_date.
  * Validate date range
  LOOP AT s_date INTO DATA(ls_date).
    IF ls_date-low > sy-datum.
      MESSAGE 'Start date cannot be in the future' TYPE 'E'.
    ENDIF.
  ENDLOOP.
```

`MESSAGE ... TYPE 'E'` displays an error and returns the user to the selection screen. The event `AT SELECTION-SCREEN` fires when the user clicks Execute — before `START-OF-SELECTION`.

## Setting Default Values at Runtime

```abap
INITIALIZATION.
  * Set defaults dynamically
  s_date-sign = 'I'.
  s_date-option = 'BT'.
  s_date-low = sy-datum - 30.   " 30 days ago
  s_date-high = sy-datum.        " Today
  APPEND s_date.
```

The `INITIALIZATION` event fires when the selection screen first appears — before the user sees it.

## Common Mistakes

- **Not using OBLIGATORY for critical fields.** If your report crashes without a customer number, make it mandatory. Users will submit empty selection screens and wonder why nothing happens.
- **Forgetting to use IN for SELECT-OPTIONS in SELECT statements.** `WHERE kunnr = s_kunnr` doesn't work — s_kunnr is a range table. Use `WHERE kunnr IN s_kunnr`.
- **Not validating input in AT SELECTION-SCREEN.** If a user enters a non-existent customer number, the report runs and returns zero results. Validate and show an error message instead.
- **Using PARAMETERS when SELECT-OPTIONS would be better.** If users ever need to enter multiple values or a range, use SELECT-OPTIONS. PARAMETERS only accepts one value.

## Key Takeaways

- PARAMETERS create single-value input fields. SELECT-OPTIONS create range inputs.
- SELECT-OPTIONS generate RANGE tables — use with `WHERE field IN s_option` in SELECT statements.
- OBLIGATORY makes a field required. AS CHECKBOX and RADIOBUTTON GROUP change the control type.
- Group related fields in SELECTION-SCREEN BLOCK for visual organization.
- Validate input in the `AT SELECTION-SCREEN` event — show errors before the report runs.
- Use `INITIALIZATION` to set dynamic defaults when the screen first appears.

## Next Lesson

Selection screens collect input. But when does the actual processing happen? In **Lesson 19: Events in ABAP Reports**, we'll learn the event-driven execution model that controls the flow of every ABAP report.
