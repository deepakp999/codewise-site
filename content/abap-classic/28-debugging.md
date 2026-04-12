---
title: "Debugging ABAP Programs"
description: "Master the ABAP Debugger: breakpoints, watchpoints, step-through execution, variable inspection, and runtime analysis for finding and fixing bugs."
order: 28
module: "real-world-skills"
module_title: "Real-World Skills & Interview Prep"
tags: ["abap", "debugging", "breakpoints", "watchpoints", "runtime analysis", "intermediate"]
prev_slug: "bdc-lsmw"
next_slug: "enhancements"
---

# Debugging ABAP Programs

## What You'll Learn
- Setting breakpoints (static and dynamic)
- Stepping through code line by line
- Inspecting and modifying variables at runtime
- Watchpoints — break when a variable changes
- Debugging common scenarios: short dumps, infinite loops, wrong output

## Starting the Debugger

### Method 1: Set a breakpoint in code

```abap
REPORT z_debug_demo.

DATA: lv_total TYPE i.

BREAK-POINT.  " Hard breakpoint — always stops here

DO 5 TIMES.
  lv_total = lv_total + sy-index.
ENDDO.

WRITE: / |Total: { lv_total }|.
```

When you run this program (F8), it stops at `BREAK-POINT` and opens the debugger.

### Method 2: Set a breakpoint in the editor

In SE38 or Eclipse ADT, click in the margin next to a line number to set a breakpoint (or press the breakpoint button). These are **session breakpoints** — they only apply to your session and disappear when you log off.

### Method 3: Use /h in the command field

Type `/h` in the SAP GUI command field and press Enter. The next action you take (clicking a button, pressing F8) will trigger the debugger. This is invaluable for debugging transactions — type `/h`, then execute the transaction, and you're in the debugger.

## The Debugger Interface

The ABAP Debugger (new debugger, available since NW 7.0) has four main areas:

```
┌──────────────────────────────────────────────────────┐
│ Source Code                                           │ ← Current line highlighted
│   lv_total = lv_total + sy-index.                    │
├──────────────────────────────────────────────────────┤
│ Variables          │ Call Stack                        │
│ lv_total = 6       │ Z_DEBUG_DEMO (line 7)            │
│ sy-index = 3       │                                   │
│ sy-subrc = 0       │                                   │
├──────────────────────────────────────────────────────┤
│ Breakpoints / Watchpoints / Objects                   │
└──────────────────────────────────────────────────────┘
```

## Stepping Through Code

```
F5    Single Step     — execute one line, step INTO subroutines/methods
F6    Execute         — execute one line, step OVER subroutines/methods
F7    Return          — execute until current subroutine/method returns
F8    Continue        — run until next breakpoint (or program ends)
```

**F5 vs F6:** If the current line calls a method, F5 jumps into the method's code. F6 executes the entire method and stops at the next line. Use F5 to debug inside a method, F6 to skip over it.

## Inspecting Variables

In the debugger's variable display area, you can:

- **Double-click** a variable name in the source code to add it to the watch list
- **Type** a variable name in the variable input field and press Enter
- **View internal tables** by double-clicking the table variable — shows all rows

### Viewing Internal Tables

```
Double-click lt_employees in the code
→ Opens table viewer showing all rows and columns
→ You can scroll, filter, and search within the table
```

### Modifying Variables at Runtime

You can change variable values while debugging — useful for testing different scenarios:

1. Double-click the variable to show its value
2. Change the value in the input field
3. Press Enter or click the pencil icon

```
lv_total = 6  → change to 100 → press Enter
Now lv_total = 100 and the program continues with this value
```

**Warning:** Only do this for debugging. Don't "fix" production issues by modifying variables in the debugger — fix the code instead.

## Watchpoints — Break When a Value Changes

Watchpoints stop execution when a specific variable changes value:

1. In the debugger, go to the Watchpoints tab
2. Enter the variable name (e.g., `lv_total`)
3. Optionally set a condition (e.g., `lv_total > 10`)
4. Press F8 (Continue) — execution stops when the condition is met

This is invaluable for finding where a value gets corrupted: "When does `lv_status` change from 'A' to 'X'?" Set a watchpoint and run — the debugger stops at the exact line where the change happens.

## Debugging Common Scenarios

### Short Dump (Runtime Error)

When a program crashes, SAP creates a short dump viewable in ST22:

1. Open ST22
2. Find your dump (sorted by date/time)
3. Read the error type (e.g., `COMPUTE_INT_ZERODIV` = division by zero)
4. Note the program name and line number
5. Open the program, set a breakpoint before that line
6. Run and debug to find the root cause

### Wrong Output

The report runs but shows wrong numbers:

1. Set a breakpoint before the output section
2. Inspect the internal table that feeds the output
3. Step backward through the logic to find where the data goes wrong
4. Check: wrong SELECT? Missing WHERE condition? Wrong calculation?

### Infinite Loop

The program hangs and doesn't complete:

1. In SAP GUI, go to System → Cancel (or press the red X button)
2. SAP may offer to debug — accept
3. Check `sy-index` or the loop counter to see how many iterations happened
4. Inspect the loop condition — why isn't it terminating?

## Performance Debugging — SE30 / SAT

Transaction SE30 (or SAT in newer systems) provides runtime analysis:

```
1. Enter your program name in SE30
2. Click Execute
3. After the program runs, view the analysis:
   - Which statements took the most time?
   - How many database calls were made?
   - Which function modules were called and how often?
```

The analysis shows you exactly where time is spent. If 90% of time is in a SELECT inside a LOOP, you know to use FOR ALL ENTRIES instead.

## Debugging Tips from Senior Developers

1. **Start from the output and work backward.** If the report shows wrong data, start at the WRITE/ALV call and trace the data source backward through the code.

2. **Use the call stack.** The call stack shows you which method called which. If you're lost in nested calls, the call stack is your map.

3. **Keep a notepad open.** Write down variable values at key points. Patterns emerge that you can't see in the debugger alone.

4. **Learn the keyboard shortcuts.** F5/F6/F7/F8 become muscle memory after a week. Clicking buttons is slow.

5. **Debug the standard code too.** When a BAPI returns an error, F5 into the BAPI to see exactly which validation failed. SAP standard code is readable — you're allowed to look at it.

## Common Mistakes

- **Using BREAK-POINT in production code.** `BREAK-POINT` stops execution for every user. Use `BREAK username.` to stop only for your user, or use session breakpoints instead of hard-coded ones.
- **Modifying variables in the debugger and thinking the bug is fixed.** Changing a variable at runtime is a diagnostic tool, not a fix. Fix the source code.
- **Ignoring the call stack.** When you hit a breakpoint in a subroutine and don't know how you got there, check the call stack — it shows the full chain of callers.
- **Not using SE30/SAT for performance issues.** If a program is "slow," don't guess — profile it with SE30. The bottleneck is almost always a database call in a loop.

## Key Takeaways

- F5 (step into), F6 (step over), F7 (return), F8 (continue) are your core debugger controls.
- `/h` in the command field activates debugging for the next action — works on any transaction.
- Watchpoints stop execution when a variable changes — essential for tracking data corruption.
- ST22 shows short dumps (runtime errors) with the exact program, line, and error type.
- SE30/SAT profiles performance — use it before guessing at optimizations.
- Use `BREAK username.` instead of `BREAK-POINT` to avoid stopping other users.

## Next Lesson

Debugging fixes bugs in your custom code. But what about extending SAP standard code? In **Lesson 29: Enhancements — User Exits and BADIs**, we'll learn how to add custom logic to SAP without modifying its source code.
