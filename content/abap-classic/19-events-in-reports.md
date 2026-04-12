---
title: "Events in ABAP Reports"
description: "Understand the ABAP report execution model: INITIALIZATION, AT SELECTION-SCREEN, START-OF-SELECTION, END-OF-SELECTION, and TOP-OF-PAGE."
order: 19
module: "reports-ui"
module_title: "Reports & User Interfaces"
tags: ["abap", "events", "start-of-selection", "report", "execution model", "beginner"]
prev_slug: "selection-screens"
next_slug: "classical-reports"
---

# Events in ABAP Reports

## What You'll Learn
- The event-driven execution model of ABAP reports
- All report events in execution order
- How to structure your report code using events
- The difference between events and normal top-to-bottom execution

## The Report Execution Flow

ABAP reports don't just run top to bottom like a Python script. They follow an event-driven model where SAP calls different blocks of your code at different stages:

```
Program starts
    ↓
LOAD-OF-PROGRAM          (rarely used — program loading)
    ↓
INITIALIZATION            (set dynamic defaults)
    ↓
Selection screen appears → user fills in values
    ↓
AT SELECTION-SCREEN       (validate input)
    ↓
User clicks Execute (F8)
    ↓
START-OF-SELECTION        (main processing — your core logic)
    ↓
END-OF-SELECTION          (final output, cleanup)
    ↓
Output list appears
    ↓
TOP-OF-PAGE               (called before each new page of output)
```

## A Complete Example

```abap
REPORT z_events_demo.

* Selection screen
PARAMETERS: p_dept TYPE c LENGTH 30 DEFAULT 'Engineering'.
SELECT-OPTIONS: s_sal FOR ( CONV i( 0 ) ).

* ──────────────────────────────────────────
INITIALIZATION.
* ──────────────────────────────────────────
  " Set dynamic defaults
  s_sal-sign = 'I'.
  s_sal-option = 'GE'.
  s_sal-low = 80000.
  APPEND s_sal.
  WRITE: / 'INITIALIZATION: defaults set'.  " Won't show — overwritten by selection screen

* ──────────────────────────────────────────
AT SELECTION-SCREEN.
* ──────────────────────────────────────────
  " Validate user input
  IF p_dept IS INITIAL.
    MESSAGE 'Department is required' TYPE 'E'.
  ENDIF.

* ──────────────────────────────────────────
START-OF-SELECTION.
* ──────────────────────────────────────────
  " Main processing — this is where your real logic goes
  WRITE: / |Report for department: { p_dept }|.
  WRITE: / |Salary range: { s_sal[ 1 ]-low } and above|.
  ULINE.

  " In a real report, you'd SELECT from database here
  DATA: lt_employees TYPE TABLE OF string.
  lt_employees = VALUE #(
    ( |Alice - { p_dept } - 120000| )
    ( |Charlie - { p_dept } - 130000| )
    ( |Frank - { p_dept } - 145000| )
  ).

  LOOP AT lt_employees INTO DATA(lv_line).
    WRITE: / lv_line.
  ENDLOOP.

* ──────────────────────────────────────────
END-OF-SELECTION.
* ──────────────────────────────────────────
  " Summary / cleanup
  ULINE.
  WRITE: / |Total employees displayed: { lines( lt_employees ) }|.
  WRITE: / |Report generated at: { sy-uzeit }|.
```

### Expected Output (after selection screen)
```
Report for department: Engineering
Salary range: 80000 and above
──────────────────────────────────────────
Alice - Engineering - 120000
Charlie - Engineering - 130000
Frank - Engineering - 145000
──────────────────────────────────────────
Total employees displayed: 3
Report generated at: 143522
```

## Event Descriptions

### INITIALIZATION
Fires once when the program starts, before the selection screen appears. Use it to set dynamic defaults — for example, setting the default date range to "last 30 days."

### AT SELECTION-SCREEN
Fires when the user clicks Execute on the selection screen. Use it to validate input. If you raise a TYPE 'E' message, the user stays on the selection screen.

### START-OF-SELECTION
The main event — this is where your core logic goes. Database reads, transformations, calculations, and primary output. If you don't specify any events, all code after the selection screen definitions implicitly runs in START-OF-SELECTION.

### END-OF-SELECTION
Fires after START-OF-SELECTION completes. Use it for summaries, totals, footer information, or cleanup tasks like freeing memory or closing files.

### TOP-OF-PAGE
Fires before the first WRITE on each new page of output. Use it for page headers:

```abap
TOP-OF-PAGE.
  WRITE: / 'Employee Report'.
  WRITE: / |Date: { sy-datum }  Page: { sy-pagno }|.
  ULINE.
```

## When Events Are Optional

If your program doesn't use a selection screen (no PARAMETERS or SELECT-OPTIONS), you don't need events at all — code runs top to bottom:

```abap
REPORT z_simple.
WRITE: / 'This runs immediately — no events needed'.
```

But the moment you add a PARAMETERS line, the event model kicks in. Code before START-OF-SELECTION runs during initialization. Code after runs during main processing. Being explicit with events makes your code clearer.

## The Recommended Structure

```abap
REPORT z_well_structured.

* ============================================================
* DATA DECLARATIONS
* ============================================================
TYPES: BEGIN OF ty_result, ... END OF ty_result.
DATA: lt_results TYPE TABLE OF ty_result.

* ============================================================
* SELECTION SCREEN
* ============================================================
SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.
  PARAMETERS: ...
  SELECT-OPTIONS: ...
SELECTION-SCREEN END OF BLOCK b1.

* ============================================================
* INITIALIZATION
* ============================================================
INITIALIZATION.
  " Set defaults

* ============================================================
* INPUT VALIDATION
* ============================================================
AT SELECTION-SCREEN.
  " Validate

* ============================================================
* MAIN PROCESSING
* ============================================================
START-OF-SELECTION.
  " Read data
  " Process data
  " Display results

* ============================================================
* SUMMARY
* ============================================================
END-OF-SELECTION.
  " Show totals
```

## Common Mistakes

- **Putting database SELECTs in INITIALIZATION.** INITIALIZATION runs before the user enters anything — reading the database here wastes resources if the user cancels. Put SELECTs in START-OF-SELECTION.
- **Forgetting that code without events runs in START-OF-SELECTION.** If you have a PARAMETERS line but no explicit events, your WRITE statements run after the user clicks Execute. This is implicit and can be confusing.
- **Using TOP-OF-PAGE with ALV reports.** TOP-OF-PAGE only works with classical WRITE output. ALV reports (Lessons 21-22) handle headers differently.

## Key Takeaways

- ABAP reports use an event-driven model: INITIALIZATION → AT SELECTION-SCREEN → START-OF-SELECTION → END-OF-SELECTION.
- START-OF-SELECTION is where your main logic goes — database reads, processing, output.
- INITIALIZATION sets dynamic defaults. AT SELECTION-SCREEN validates input.
- END-OF-SELECTION handles summaries and cleanup.
- Be explicit with events — it makes your code structure clear and maintainable.

## Next Lesson

You have input from the selection screen and processing logic in events. In **Lesson 20: Classical Reports**, we'll learn how to format output with the WRITE statement — column alignment, headers, and totals.
