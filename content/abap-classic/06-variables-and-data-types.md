---
title: "Variables, Data Types, and Constants in ABAP"
description: "Learn ABAP's type system compared to Python and Java. Master DATA declarations, elementary types, constants, and the TYPE keyword."
order: 6
module: "abap-fundamentals"
module_title: "ABAP Language Fundamentals"
tags: ["abap", "variables", "data types", "constants", "beginner"]
prev_slug: "free-sap-practice-system"
next_slug: "strings-and-string-operations"
---

# Variables, Data Types, and Constants

## What You'll Learn
- How to declare variables with DATA
- All elementary ABAP data types and their Python/Java equivalents
- Constants, inline declarations, and type references
- The difference between value types and reference types
- ABAP's strict typing compared to Python's dynamic typing

## Declaring Variables with DATA

In ABAP, every variable must be declared before use with the `DATA` keyword:

```abap
REPORT z_variables.

* Single variable declaration
DATA lv_name TYPE string.
lv_name = 'Alice'.

* Declaration with initial value
DATA lv_age TYPE i VALUE 30.

* Multiple declarations with chained DATA
DATA: lv_city    TYPE string VALUE 'Mumbai',
      lv_salary  TYPE p DECIMALS 2 VALUE '120000.50',
      lv_active  TYPE abap_bool VALUE abap_true.

WRITE: / 'Name:', lv_name.
WRITE: / 'Age:', lv_age.
WRITE: / 'City:', lv_city.
WRITE: / 'Salary:', lv_salary.
WRITE: / 'Active:', lv_active.
```

### Expected Output
```
Name: Alice
Age:          30
City: Mumbai
Salary:      120,000.50
Active: X
```

**Coming from Python:** In Python you write `name = "Alice"` — no type declaration needed. ABAP requires explicit types: `DATA lv_name TYPE string.` then `lv_name = 'Alice'.` This is closer to Java's `String name = "Alice";` but even more verbose.

## Elementary Data Types

### Numeric Types

```abap
DATA: lv_integer  TYPE i VALUE 42,            " Integer (4 bytes, -2.1B to +2.1B)
      lv_int8     TYPE int8 VALUE 9999999999,  " 8-byte integer (large numbers)
      lv_packed   TYPE p LENGTH 8 DECIMALS 2 VALUE '12345.67', " Packed decimal
      lv_float    TYPE f VALUE '3.14159'.      " Floating point (8 bytes)

WRITE: / 'Integer:', lv_integer.
WRITE: / 'Int8:', lv_int8.
WRITE: / 'Packed:', lv_packed.
WRITE: / 'Float:', lv_float.
```

### Expected Output
```
Integer:          42
Int8:          9,999,999,999
Packed:       12,345.67
Float: 3.1415900000000001E+00
```

**When to use which:**
- `i` — counters, loop indexes, quantities (whole numbers)
- `p` — money, financial calculations (exact decimals, no rounding errors)
- `f` — scientific calculations (rare in business applications)
- `int8` — very large whole numbers

**Critical rule:** Never use `f` (float) for financial data. Use `p` (packed decimal). `0.1 + 0.2` in floating point doesn't equal `0.3` — this matters when your report is for a CFO.

### Character Types

```abap
DATA: lv_char5    TYPE c LENGTH 5 VALUE 'HELLO',  " Fixed-length (padded with spaces)
      lv_string   TYPE string VALUE 'Hello World', " Variable-length
      lv_numc4    TYPE n LENGTH 4 VALUE '0042'.    " Numeric text (preserves leading zeros)

WRITE: / 'Char5:', lv_char5.
WRITE: / 'String:', lv_string.
WRITE: / 'Numc4:', lv_numc4.
```

### Expected Output
```
Char5: HELLO
String: Hello World
Numc4: 0042
```

**`c` vs `string`:** Use `c` (fixed-length) when the data always has the same length — country codes (2 chars), material numbers (18 chars), plant codes (4 chars). Use `string` for free text — names, descriptions, addresses.

**`n` (numeric character):** Looks like a number but is stored as text. Leading zeros are preserved: `'0042'` stays `'0042'`, not `42`. SAP uses this for document numbers, org codes, and IDs.

### Date and Time Types

```abap
DATA: lv_date TYPE d VALUE '20260412',   " Date: YYYYMMDD (always 8 chars)
      lv_time TYPE t VALUE '143000'.     " Time: HHMMSS (always 6 chars)

WRITE: / 'Date:', lv_date.
WRITE: / 'Time:', lv_time.

* System variables for current date and time
WRITE: / 'Today:', sy-datum.
WRITE: / 'Now:', sy-uzeit.
```

### Expected Output
```
Date: 20260412
Time: 143000
Today: 20260412
Now: 153045
```

Dates in ABAP are stored as `YYYYMMDD` strings internally. There's no native date object like Python's `datetime`. You do date arithmetic by treating them as numbers:

```abap
DATA: lv_today    TYPE d,
      lv_tomorrow TYPE d.

lv_today = sy-datum.
lv_tomorrow = lv_today + 1.  " Add one day

WRITE: / 'Today:', lv_today.
WRITE: / 'Tomorrow:', lv_tomorrow.
```

### Boolean Type

```abap
DATA: lv_flag TYPE abap_bool.

lv_flag = abap_true.   " Sets to 'X'
WRITE: / 'Flag:', lv_flag.

IF lv_flag = abap_true.
  WRITE: / 'Flag is true'.
ENDIF.

lv_flag = abap_false.  " Sets to ' ' (space)
```

ABAP doesn't have a native boolean. `abap_bool` is a character field where `'X'` = true and `' '` (space) = false. You'll see this everywhere in SAP — function modules use `'X'` and `' '` for flags.

## Constants

```abap
CONSTANTS: lc_pi       TYPE p DECIMALS 5 VALUE '3.14159',
           lc_company  TYPE string VALUE 'TechMart',
           lc_max_rows TYPE i VALUE 1000.

WRITE: / 'Pi:', lc_pi.
WRITE: / 'Company:', lc_company.

* This would cause a syntax error:
* lc_pi = 3.0.  " Cannot modify a constant
```

Constants use the `lc_` prefix (local constant). They're set at declaration and can never change.

## Inline Declarations (Modern ABAP)

Since ABAP 7.40, you can declare variables inline — closer to how Python works:

```abap
* Classic style
DATA lv_result TYPE i.
lv_result = 42.

* Modern inline style
DATA(lv_result2) = 42.  " Type inferred from the value

* Works with method calls too
DATA(lv_length) = strlen( 'Hello World' ).  " Inferred as TYPE i

WRITE: / 'Result:', lv_result2.
WRITE: / 'Length:', lv_length.
```

### Expected Output
```
Result:          42
Length:          11
```

Inline declarations are cleaner, but classic `DATA` statements are still used everywhere — especially at the top of programs where you declare all variables before the logic begins.

## The TYPE Keyword — Referencing Dictionary Types

You can declare variables using types from the SAP Data Dictionary:

```abap
* Using SAP standard types from the data dictionary
DATA: lv_customer_id TYPE kunnr,     " Customer number (from SAP standard)
      lv_material    TYPE matnr,     " Material number
      lv_amount      TYPE netwr_ap.  " Net value (currency amount)

* Using a structure from a database table
DATA: ls_customer TYPE kna1.  " Structure with ALL fields of table KNA1
```

This is a powerful concept — instead of defining `TYPE c LENGTH 10`, you reference the SAP-defined type `kunnr` (customer number). If SAP ever changes the length of customer numbers, your code automatically adapts.

## System Variables (sy- Fields)

ABAP has built-in system variables accessible via the `sy-` prefix:

```abap
WRITE: / 'Current date:', sy-datum.      " Today's date
WRITE: / 'Current time:', sy-uzeit.      " Current time
WRITE: / 'User name:', sy-uname.         " Logged-in user
WRITE: / 'Program name:', sy-repid.      " Current program name
WRITE: / 'System ID:', sy-sysid.         " SAP system ID (DEV, QAS, PRD)
WRITE: / 'Client:', sy-mandt.            " Current client (100, 200, etc.)
WRITE: / 'Return code:', sy-subrc.       " Last operation return code (0 = success)
```

`sy-subrc` is the most important one — after almost every ABAP operation (database read, table lookup, file open), `sy-subrc` tells you if it succeeded (`0`) or failed (non-zero). You'll check `sy-subrc` hundreds of times in your ABAP career.

## Type Conversion

ABAP converts between compatible types automatically, but you should be explicit:

```abap
DATA: lv_number TYPE i VALUE 42,
      lv_text   TYPE string.

* Implicit conversion (works but not recommended)
lv_text = lv_number.  " lv_text = '42'

* Explicit conversion
lv_text = CONV string( lv_number ).  " Modern ABAP, clearer intent

WRITE: / 'Number as text:', lv_text.
```

## Common Mistakes

- **Using `f` (float) for currency amounts.** Always use `p DECIMALS 2` for money. Floating-point arithmetic has rounding errors: `0.1 + 0.2 = 0.30000000000000004`. Packed decimal is exact.
- **Forgetting that `c` type is space-padded.** A `TYPE c LENGTH 10` variable containing `'Hello'` actually contains `'Hello     '` (5 chars + 5 spaces). Comparisons and concatenations can produce unexpected results if you don't trim.
- **Not initializing variables.** Unlike Python, ABAP initializes variables to type-specific defaults: `i` = 0, `string` = '' (empty), `d` = '00000000'. But relying on defaults makes code unclear — always set initial values explicitly when they matter.
- **Confusing `n` and `i` types.** `TYPE n LENGTH 4` is text that looks like a number — `'0042'` preserves the leading zero. `TYPE i` is an actual integer — `42`. Use `n` for document numbers and codes, `i` for calculations.

## Key Takeaways

- Declare variables with `DATA`, constants with `CONSTANTS`. Use meaningful prefixes (`lv_`, `lc_`, `lt_`).
- Use `p DECIMALS n` for financial calculations, `i` for whole numbers, `string` for free text.
- `TYPE d` stores dates as `YYYYMMDD`, `TYPE t` stores times as `HHMMSS`.
- `sy-subrc` is checked after every operation — 0 means success.
- Inline declarations (`DATA(lv_x) = ...`) are modern ABAP — cleaner but not universal yet.
- Reference SAP Data Dictionary types (`TYPE kunnr`, `TYPE matnr`) instead of raw types when working with SAP data.

## Next Lesson

You can declare variables. Now let's work with text. In **Lesson 7: Strings and String Operations**, we'll learn concatenation, searching, replacing, and ABAP's powerful string templates.
