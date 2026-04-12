---
title: "Your First ABAP Program — Hello World in SE38"
description: "Write, activate, and run your first ABAP program. Learn REPORT, WRITE, DATA, and the basic structure of every ABAP program."
order: 4
module: "sap-orientation"
module_title: "SAP & ABAP Orientation"
tags: ["abap", "hello world", "se38", "report", "write", "beginner"]
prev_slug: "navigating-sap-gui"
next_slug: "free-sap-practice-system"
---

# Your First ABAP Program — Hello World in SE38

## What You'll Learn
- How to create, activate, and run an ABAP program in SE38
- The REPORT statement and program structure
- How to declare variables with DATA
- How to output text with WRITE
- The difference between ABAP program types

## Creating a Program Step by Step

### Step 1: Open SE38

Type `/nSE38` in the command field and press Enter. You see a screen with a "Program" input field.

### Step 2: Name Your Program

Type `Z_HELLO_WORLD` in the program field.

The `Z_` prefix is mandatory for custom programs (as we learned in Lesson 2). Program names can be up to 30 characters, letters, numbers, and underscores only.

### Step 3: Click "Create"

SAP asks for program attributes:
- **Title:** "My First ABAP Program" (free text description)
- **Type:** "Executable Program" (this is the most common type)
- **Status:** "Test Program"
- **Application:** leave blank or select any

Click Save. SAP then asks for a **package** — this is where your program lives organizationally. For learning, use the `$TMP` package (local, non-transportable — it stays in DEV only and won't be transported to QAS or PRD). For real projects, you'd create a proper package.

### Step 4: Write the Code

The editor opens. Replace any existing content with:

```abap
REPORT z_hello_world.

WRITE: / 'Hello, World!'.
WRITE: / 'This is my first ABAP program.'.
WRITE: / 'I am learning ABAP on Codewise.'.
```

### Step 5: Check Syntax (Ctrl+F2)

Click the "Check" button or press Ctrl+F2. If there are no errors, the status bar at the bottom shows a green message. If there's an error, it highlights the line and shows a description.

### Step 6: Activate (Ctrl+F3)

Click "Activate" or press Ctrl+F3. This compiles the program and makes it executable. You'll see a popup asking what to activate — select your program and confirm.

### Step 7: Run (F8)

Click "Execute" or press F8. The program runs and you see:

### Expected Output
```
Hello, World!
This is my first ABAP program.
I am learning ABAP on Codewise.
```

Congratulations — you just ran your first ABAP program.

## Understanding the Code

### The REPORT Statement

```abap
REPORT z_hello_world.
```

Every executable ABAP program starts with `REPORT`. It tells SAP: "This is a program named z_hello_world." The period at the end is required — ABAP statements end with periods, not semicolons.

### The WRITE Statement

```abap
WRITE: / 'Hello, World!'.
```

`WRITE` outputs text to the screen (called the "list output" in SAP terminology). Breaking it down:

- `WRITE:` — the output command (the colon starts a chained statement)
- `/` — means "start a new line" (like `\n` in Python)
- `'Hello, World!'` — the text to display (single quotes for text literals)
- `.` — end of statement

Without the `/`, everything prints on the same line:

```abap
WRITE 'Hello'.
WRITE 'World'.
```

### Expected Output
```
HelloWorld
```

With `/`:

```abap
WRITE: / 'Hello'.
WRITE: / 'World'.
```

### Expected Output
```
Hello
World
```

## Declaring Variables

ABAP uses the `DATA` statement to declare variables:

```abap
REPORT z_variables_demo.

* Declare variables
DATA: lv_name    TYPE string VALUE 'Alice',
      lv_age     TYPE i VALUE 30,
      lv_salary  TYPE p DECIMALS 2 VALUE '95000.50',
      lv_active  TYPE abap_bool VALUE abap_true.

* Output them
WRITE: / 'Name:', lv_name.
WRITE: / 'Age:', lv_age.
WRITE: / 'Salary:', lv_salary.
WRITE: / 'Active:', lv_active.
```

### Expected Output
```
Name: Alice
Age:          30
Salary:       95,000.50
Active: X
```

### Naming Convention: lv_, lt_, ls_, gv_, gt_, gs_

ABAP has a widely followed naming convention using prefixes:

```
lv_   → Local Variable         (lv_name, lv_count)
lt_   → Local Table            (lt_customers, lt_orders)
ls_   → Local Structure        (ls_customer, ls_order_header)
gv_   → Global Variable        (gv_company_code)
gt_   → Global Table           (gt_all_customers)
gs_   → Global Structure       (gs_current_user)
```

This isn't enforced by the language, but every SAP shop follows it. When you see `lt_orders`, you immediately know: local variable, it's a table (list), named orders.

### Common Data Types

```abap
DATA: lv_text     TYPE string,        " Variable-length text
      lv_char10   TYPE c LENGTH 10,   " Fixed-length text (10 chars)
      lv_integer  TYPE i,             " Integer (4 bytes)
      lv_packed   TYPE p DECIMALS 2,  " Packed decimal (for money)
      lv_float    TYPE f,             " Floating point
      lv_date     TYPE d,             " Date (YYYYMMDD format)
      lv_time     TYPE t,             " Time (HHMMSS format)
      lv_bool     TYPE abap_bool.     " Boolean (X = true, '' = false)
```

**Coming from Python:** Python has `str`, `int`, `float`, `bool`, `datetime`. ABAP has `string`/`c`, `i`, `p`/`f`, `abap_bool`, `d`/`t`. The big difference is ABAP's `p` (packed decimal) type — used for financial calculations where floating-point imprecision is unacceptable. ABAP also has fixed-length strings (`c`), which Python doesn't.

## Comments

```abap
* This is a full-line comment (asterisk in column 1)
WRITE: / 'Hello'. " This is an inline comment (double quote)
```

## A More Complete Example

```abap
REPORT z_employee_info.

* Declare employee data
DATA: lv_name       TYPE string VALUE 'Rahul Kumar',
      lv_department TYPE string VALUE 'Finance',
      lv_salary     TYPE p DECIMALS 2 VALUE '850000.00',
      lv_start_date TYPE d VALUE '20220115',
      lv_bonus_pct  TYPE p DECIMALS 1 VALUE '12.5'.

* Calculate bonus
DATA: lv_bonus TYPE p DECIMALS 2.
lv_bonus = lv_salary * lv_bonus_pct / 100.

* Calculate total compensation
DATA: lv_total TYPE p DECIMALS 2.
lv_total = lv_salary + lv_bonus.

* Output report
WRITE: / '=== Employee Report ==='.
WRITE: / 'Name:', lv_name.
WRITE: / 'Department:', lv_department.
WRITE: / 'Annual Salary:', lv_salary.
WRITE: / 'Bonus (', lv_bonus_pct, '%):', lv_bonus.
WRITE: / 'Total Compensation:', lv_total.
WRITE: / 'Start Date:', lv_start_date.
```

### Expected Output
```
=== Employee Report ===
Name: Rahul Kumar
Department: Finance
Annual Salary:      850,000.00
Bonus (       12.5 %):      106,250.00
Total Compensation:      956,250.00
Start Date: 20220115
```

Notice a few ABAP quirks:
- Numbers are right-aligned and have leading spaces by default
- The date displays as `20220115` (YYYYMMDD) — not formatted. We'll learn to format dates in later lessons.
- The bonus percentage has extra spaces — ABAP's default WRITE formatting is generous with spacing

## ABAP Program Types

We created an "Executable Program" (type 1). There are other types:

```
Type 1  Executable Program (REPORT)  — runs directly with F8, produces list output
Type M  Module Pool                  — dialog programs with screens (less common now)
Type F  Function Group               — container for function modules
Type K  Class Pool                   — container for OOP classes
Type I  Include Program              — reusable code included in other programs
```

For this course, we'll mostly write Type 1 (executable programs). You'll encounter function groups and class pools as we progress.

## The Program Flow

When you press F8 to run a program, here's what happens:

1. SAP loads your activated program from the database
2. The ABAP runtime executes statements top to bottom
3. WRITE statements build a "list buffer" (not shown yet)
4. After execution, the list buffer is displayed on screen
5. The user sees the output

This is different from web development where output streams to a browser in real time. ABAP builds the complete output first, then displays it all at once.

## Common Mistakes

- **Missing period at the end of a statement.** Every ABAP statement ends with a period. Missing it causes a syntax error on the *next* line, which can be confusing — the error is actually on the line above.
- **Using double quotes for text literals.** ABAP uses single quotes for strings: `'Hello'` not `"Hello"`. Double quotes start inline comments: `WRITE 'Hello'. "This prints Hello`.
- **Forgetting to activate before running.** Save (Ctrl+S) stores your source code but doesn't compile it. You must activate (Ctrl+F3) before running (F8). If your changes aren't reflected, you forgot to activate.
- **Starting a program name without Z or Y.** SAP won't let you create objects without the Z/Y prefix in customer namespace. If you get a "namespace" error, check your program name.

## Key Takeaways

- Every executable ABAP program starts with `REPORT program_name.`
- Statements end with periods. Comments use `*` (full line) or `"` (inline).
- `DATA` declares variables. `WRITE` outputs text. `/` starts a new line.
- Use the naming convention: `lv_` for local variables, `lt_` for local tables.
- The workflow is: write → check (Ctrl+F2) → activate (Ctrl+F3) → run (F8).
- Always use the `$TMP` package for practice programs.

## Next Lesson

You've written your first program, but you did it in an SAP system we haven't set up yet. In **Lesson 5: Setting Up a Free SAP Practice System**, we'll get you access to a real SAP environment where you can practice everything in this course — for free.
