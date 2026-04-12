---
title: "Function Modules and Function Groups — Deep Dive"
description: "Master SAP function modules: creating them in SE37, parameter types, exception handling, RFC-enabled functions, and function group organization."
order: 23
module: "integration"
module_title: "Integration & Communication"
tags: ["abap", "function module", "se37", "function group", "rfc", "intermediate"]
prev_slug: "alv-oo"
next_slug: "bapis"
---

# Function Modules and Function Groups — Deep Dive

## What You'll Learn
- How to create function modules in SE37
- The four parameter categories (IMPORTING, EXPORTING, CHANGING, TABLES)
- Exception handling patterns
- RFC-enabled function modules for cross-system calls
- Function group organization and global data

## What Are Function Modules?

Function modules are SAP's reusable code units — stored in the system dictionary, callable from any program, and discoverable via SE37. Think of them as globally available functions with a formal interface.

You've already called function modules (REUSE_ALV_GRID_DISPLAY, CONVERSION_EXIT_ALPHA_OUTPUT). Now let's build our own.

## Creating a Function Module in SE37

### Step 1: Create a Function Group

Function modules live in function groups — containers that share global data. In SE37, go to Function Group → Create:

- **Function Group:** `Z_HR_UTILS`
- **Short Text:** "HR Utility Functions"
- **Package:** `$TMP` (for learning)

### Step 2: Create the Function Module

In SE37, enter the name `Z_CALCULATE_BONUS` and click Create:

- **Function Group:** `Z_HR_UTILS`
- **Short Text:** "Calculate employee bonus based on salary and rating"

### Step 3: Define the Interface

On the **Import** tab:
```
Parameter Name    Type         Reference Type    Optional    Description
─────────────     ──────       ──────────────    ─────────   ───────────
IV_SALARY         TYPE         P DECIMALS 2      -           Annual salary
IV_RATING         TYPE         C LENGTH 1        -           Performance rating (A/B/C)
IV_YEARS          TYPE         I                 X           Years of service
```

On the **Export** tab:
```
Parameter Name    Type         Reference Type    Description
─────────────     ──────       ──────────────    ───────────
EV_BONUS          TYPE         P DECIMALS 2      Calculated bonus amount
EV_BONUS_PCT      TYPE         P DECIMALS 1      Bonus percentage applied
```

On the **Exceptions** tab:
```
Exception Name           Description
──────────────           ───────────
INVALID_RATING           Rating must be A, B, or C
SALARY_NOT_POSITIVE      Salary must be greater than zero
```

### Step 4: Write the Code

```abap
FUNCTION z_calculate_bonus.
*"----------------------------------------------------------------------
*"  IMPORTING
*"    VALUE(IV_SALARY) TYPE P DECIMALS 2
*"    VALUE(IV_RATING) TYPE C LENGTH 1
*"    VALUE(IV_YEARS) TYPE I OPTIONAL
*"  EXPORTING
*"    VALUE(EV_BONUS) TYPE P DECIMALS 2
*"    VALUE(EV_BONUS_PCT) TYPE P DECIMALS 1
*"  EXCEPTIONS
*"    INVALID_RATING
*"    SALARY_NOT_POSITIVE
*"----------------------------------------------------------------------

  " Validate inputs
  IF iv_salary <= 0.
    RAISE salary_not_positive.
  ENDIF.

  " Determine bonus percentage based on rating
  CASE iv_rating.
    WHEN 'A'.
      ev_bonus_pct = 20.
    WHEN 'B'.
      ev_bonus_pct = 12.
    WHEN 'C'.
      ev_bonus_pct = 5.
    WHEN OTHERS.
      RAISE invalid_rating.
  ENDCASE.

  " Add loyalty bonus: 0.5% per year of service
  IF iv_years IS SUPPLIED AND iv_years > 0.
    ev_bonus_pct = ev_bonus_pct + ( iv_years * '0.5' ).
  ENDIF.

  " Calculate bonus amount
  ev_bonus = iv_salary * ev_bonus_pct / 100.

ENDFUNCTION.
```

### Step 5: Activate and Test

Activate (Ctrl+F3), then test (F8). SE37 provides a test screen where you enter parameter values and see results — invaluable for debugging.

## Calling Your Function Module

```abap
REPORT z_call_fm.

DATA: lv_bonus     TYPE p DECIMALS 2,
      lv_bonus_pct TYPE p DECIMALS 1.

CALL FUNCTION 'Z_CALCULATE_BONUS'
  EXPORTING
    iv_salary = CONV #( 120000 )
    iv_rating = 'A'
    iv_years  = 5
  IMPORTING
    ev_bonus     = lv_bonus
    ev_bonus_pct = lv_bonus_pct
  EXCEPTIONS
    invalid_rating      = 1
    salary_not_positive = 2
    OTHERS              = 3.

CASE sy-subrc.
  WHEN 0.
    WRITE: / |Bonus: { lv_bonus } ({ lv_bonus_pct }%)|.
  WHEN 1.
    WRITE: / 'Error: Invalid rating'.
  WHEN 2.
    WRITE: / 'Error: Salary must be positive'.
  WHEN OTHERS.
    WRITE: / 'Unknown error'.
ENDCASE.
```

### Expected Output
```
Bonus: 27,000.00 (22.5%)
```

## RFC-Enabled Function Modules

To call a function module from another SAP system (or from an external program), mark it as **RFC-enabled** in the Attributes tab:

```
Processing Type: Remote-Enabled Module
```

RFC-enabled function modules can be called across SAP systems, from Java programs, from Python (using PyRFC), and from web services. This is how SAP systems communicate with each other.

```abap
* Call a function module on a remote SAP system
CALL FUNCTION 'Z_CALCULATE_BONUS'
  DESTINATION 'RFC_PRODUCTION'    " RFC destination configured in SM59
  EXPORTING
    iv_salary = CONV #( 120000 )
    iv_rating = 'A'
  IMPORTING
    ev_bonus = lv_bonus
  EXCEPTIONS
    communication_failure = 1  MESSAGE lv_error_msg
    system_failure        = 2  MESSAGE lv_error_msg
    invalid_rating        = 3
    salary_not_positive   = 4
    OTHERS                = 5.
```

The `DESTINATION` parameter routes the call to a remote system. RFC destinations are configured in transaction SM59 by the Basis team.

## Function Group Global Data

Function modules in the same function group share global data:

```abap
* In the TOP include of function group Z_HR_UTILS:
DATA: gv_company_code TYPE bukrs,
      gt_config       TYPE TABLE OF zhrc_config.
```

All function modules in Z_HR_UTILS can access `gv_company_code` and `gt_config`. This is useful for caching — load configuration once, share across all function calls.

## Finding Standard Function Modules

SE37 has a search function. Common ways to find the right function module:

- **Search by name:** Use wildcards like `*CUSTOMER*CREATE*`
- **Search by function group:** Browse function groups related to your module
- **Google it:** "SAP function module to create sales order" → results usually point you to the right FM
- **SE37 documentation:** Most SAP function modules have inline documentation

## Common Mistakes

- **Not handling all exceptions.** If a function module raises an exception you don't handle, `sy-subrc` gets a non-zero value but your program may not realize something went wrong. Always handle `OTHERS` as a catch-all.
- **Passing the wrong parameter direction.** IMPORTING parameters are input to the function module. EXPORTING parameters are output from it. This is from the function module's perspective — the caller EXPORTS to the FM's IMPORTING and IMPORTS from the FM's EXPORTING. The naming is backwards from the caller's point of view.
- **Making a function module RFC-enabled without considering serialization.** RFC-enabled function modules serialize all parameters across the network. Complex deep structures or large tables can cause performance issues over RFC.
- **Using TABLES parameter instead of CHANGING.** The TABLES parameter is legacy — it uses header lines, which are deprecated. Use CHANGING with a typed table for new function modules.

## Key Takeaways

- Function modules are reusable, callable from any program, and testable in SE37.
- Interface has four categories: IMPORTING (in), EXPORTING (out), CHANGING (in+out), EXCEPTIONS (errors).
- Always handle exceptions — at minimum, handle OTHERS as a catch-all.
- RFC-enabled function modules can be called from remote systems and external programs.
- Function groups share global data across their function modules — useful for caching.
- Test function modules directly in SE37 (F8) before calling them from your program.

## Next Lesson

SAP comes with thousands of standard function modules. The most important ones are **BAPIs**. In **Lesson 24: BAPIs — SAP's Standard APIs**, we'll learn how to use these pre-built APIs to create, read, update, and delete SAP business objects.
