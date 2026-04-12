---
title: "Strings and String Operations in ABAP"
description: "Master ABAP string handling: concatenation, FIND, REPLACE, SUBSTRING, string templates, and comparisons — with Python equivalents."
order: 7
module: "abap-fundamentals"
module_title: "ABAP Language Fundamentals"
tags: ["abap", "strings", "string templates", "concatenation", "beginner"]
prev_slug: "variables-and-data-types"
next_slug: "control-flow"
---

# Strings and String Operations

## What You'll Learn
- String concatenation — classic and modern syntax
- Searching and replacing within strings
- Substrings and string length
- String templates (ABAP's f-strings)
- Case conversion, trimming, and splitting

## Two String Types

ABAP has two string types (from Lesson 6):

```abap
DATA: lv_fixed  TYPE c LENGTH 20 VALUE 'Hello',      " Fixed-length, space-padded
      lv_dynamic TYPE string VALUE 'Hello World'.     " Variable-length, no padding
```

For most string operations, use `TYPE string`. Fixed-length `TYPE c` is for SAP-specific fields like material numbers and document IDs.

## Concatenation

### Classic ABAP — CONCATENATE

```abap
DATA: lv_first  TYPE string VALUE 'Hello',
      lv_second TYPE string VALUE 'World',
      lv_result TYPE string.

CONCATENATE lv_first lv_second INTO lv_result SEPARATED BY ' '.
WRITE: / lv_result.
```

### Expected Output
```
Hello World
```

### Modern ABAP — String Templates (The Better Way)

String templates use `|...|` with `{ }` for embedded expressions — like Python's f-strings:

```abap
DATA: lv_name   TYPE string VALUE 'Alice',
      lv_age    TYPE i VALUE 30,
      lv_salary TYPE p DECIMALS 2 VALUE '120000.50'.

DATA(lv_message) = |Employee { lv_name } is { lv_age } years old.|.
WRITE: / lv_message.

* With formatting
DATA(lv_report) = |Salary: { lv_salary DECIMALS = 2 }|.
WRITE: / lv_report.

* Multi-expression
DATA(lv_greeting) = |Hello { lv_name }! You earn { lv_salary } per year.|.
WRITE: / lv_greeting.
```

### Expected Output
```
Employee Alice is 30 years old.
Salary: 120000.50
Hello Alice! You earn 120000.50 per year.
```

**Coming from Python:** Python f-strings use `f"Hello {name}"`. ABAP string templates use `|Hello { name }|`. Same concept, different delimiters.

### String Template Operators

```abap
* && concatenates without spaces
DATA(lv_concat) = 'Hello' && ' ' && 'World'.
WRITE: / lv_concat.
```

### Expected Output
```
Hello World
```

## String Length

```abap
DATA: lv_text TYPE string VALUE 'Hello World'.

DATA(lv_len) = strlen( lv_text ).
WRITE: / 'Length:', lv_len.
```

### Expected Output
```
Length:          11
```

**Watch out with fixed-length strings:**

```abap
DATA: lv_fixed TYPE c LENGTH 20 VALUE 'Hello'.
DATA(lv_len_fixed) = strlen( lv_fixed ).
WRITE: / 'Fixed length:', lv_len_fixed.  " 5, not 20 — strlen ignores trailing spaces
```

## Searching in Strings

### FIND — locate a substring

```abap
DATA: lv_text TYPE string VALUE 'The quick brown fox jumps'.

* Find position of a substring
FIND 'brown' IN lv_text MATCH OFFSET DATA(lv_offset) MATCH LENGTH DATA(lv_match_len).

IF sy-subrc = 0.
  WRITE: / |Found 'brown' at position { lv_offset }, length { lv_match_len }|.
ELSE.
  WRITE: / 'Not found'.
ENDIF.
```

### Expected Output
```
Found 'brown' at position 10, length 5
```

### FIND with COUNT

```abap
DATA: lv_text TYPE string VALUE 'abcabcabc'.

FIND ALL OCCURRENCES OF 'abc' IN lv_text MATCH COUNT DATA(lv_count).
WRITE: / |Found { lv_count } occurrences|.
```

### Expected Output
```
Found 3 occurrences
```

### CS / CN / CA — Classic Comparisons

```abap
DATA: lv_text TYPE string VALUE 'Hello World'.

IF lv_text CS 'world'.  " CS = Contains String (case-insensitive)
  WRITE: / 'Contains "world"'.
ENDIF.

IF lv_text CP '*World'.  " CP = Covers Pattern (wildcard matching)
  WRITE: / 'Ends with "World"'.
ENDIF.
```

### Expected Output
```
Contains "world"
Ends with "World"
```

## Replacing in Strings

```abap
DATA: lv_text TYPE string VALUE 'Hello World'.

* Replace first occurrence
REPLACE 'World' IN lv_text WITH 'ABAP'.
WRITE: / lv_text.

* Replace all occurrences
DATA: lv_text2 TYPE string VALUE 'aaa-bbb-ccc'.
REPLACE ALL OCCURRENCES OF '-' IN lv_text2 WITH '_'.
WRITE: / lv_text2.
```

### Expected Output
```
Hello ABAP
aaa_bbb_ccc
```

## Substrings

```abap
DATA: lv_text TYPE string VALUE 'Hello World'.

* Extract substring — lv_text+offset(length)
DATA(lv_sub) = lv_text+6(5).  " Start at position 6, take 5 chars
WRITE: / 'Substring:', lv_sub.

* Using substring function (modern)
DATA(lv_sub2) = substring( val = lv_text off = 0 len = 5 ).
WRITE: / 'First 5:', lv_sub2.
```

### Expected Output
```
Substring: World
First 5: Hello
```

## Case Conversion

```abap
DATA: lv_text TYPE string VALUE 'Hello World'.

* Convert to uppercase
DATA(lv_upper) = to_upper( lv_text ).
WRITE: / 'Upper:', lv_upper.

* Convert to lowercase
DATA(lv_lower) = to_lower( lv_text ).
WRITE: / 'Lower:', lv_lower.

* Classic syntax (modifies in place)
TRANSLATE lv_text TO UPPER CASE.
WRITE: / 'Translated:', lv_text.
```

### Expected Output
```
Upper: HELLO WORLD
Lower: hello world
Translated: HELLO WORLD
```

## Trimming

```abap
DATA: lv_padded TYPE string VALUE '   Hello   '.

* Trim both sides
DATA(lv_trimmed) = condense( lv_padded ).
WRITE: / |'{ lv_trimmed }'|.

* Trim and remove internal multiple spaces
DATA: lv_spaced TYPE string VALUE 'Hello    World    ABAP'.
DATA(lv_condensed) = condense( lv_spaced ).
WRITE: / |'{ lv_condensed }'|.
```

### Expected Output
```
'Hello'
'Hello World ABAP'
```

`condense` trims leading/trailing spaces AND collapses multiple internal spaces to single spaces. If you only want to trim edges, use `shift` or `substring`.

## Splitting

```abap
DATA: lv_csv TYPE string VALUE 'Alice,30,Engineering,Mumbai'.

SPLIT lv_csv AT ',' INTO DATA(lv_name) DATA(lv_age) DATA(lv_dept) DATA(lv_city).
WRITE: / 'Name:', lv_name.
WRITE: / 'Age:', lv_age.
WRITE: / 'Dept:', lv_dept.
WRITE: / 'City:', lv_city.
```

### Expected Output
```
Name: Alice
Age: 30
Dept: Engineering
City: Mumbai
```

### Split into an internal table

```abap
DATA: lv_text TYPE string VALUE 'one:two:three:four',
      lt_parts TYPE TABLE OF string.

SPLIT lv_text AT ':' INTO TABLE lt_parts.

LOOP AT lt_parts INTO DATA(lv_part).
  WRITE: / lv_part.
ENDLOOP.
```

### Expected Output
```
one
two
three
four
```

## String Comparison Quick Reference

```
Operator    Meaning                    Case Sensitive?
=           Equal                      Yes
<>          Not equal                   Yes
CS          Contains String             No
NS          Not Contains String         No
CP          Covers Pattern (* and +)    No
NP          Not Covers Pattern          No
CA          Contains Any character      Yes
NA          Not Contains Any            Yes
CO          Contains Only               Yes
CN          Not Contains Only           Yes
```

## Common Mistakes

- **Using `CONCATENATE` when string templates are cleaner.** `|Hello { lv_name }|` is more readable than `CONCATENATE 'Hello' lv_name INTO result SEPARATED BY ' '`. Use string templates for modern ABAP.
- **Forgetting that `condense` removes internal spaces too.** If you have `'New  York'` (two spaces) and condense it, you get `'New York'` (one space). Sometimes that's not what you want.
- **Off-by-one errors in substring offsets.** ABAP string positions are zero-based: `'Hello'+0(1)` = `'H'`. This is the same as Python, but the syntax `+offset(length)` is unique to ABAP.
- **Comparing strings without considering case.** `'Hello' = 'hello'` is **false** in ABAP (case-sensitive). Use `to_upper()` on both sides, or use `CS` for case-insensitive containment checks.

## Key Takeaways

- Use `TYPE string` for general text, `TYPE c LENGTH n` for fixed-width SAP fields.
- String templates (`|..{ expr }..|`) are ABAP's f-strings — use them for readable concatenation.
- `FIND` searches, `REPLACE` substitutes, `SPLIT` breaks apart, `condense` trims.
- String positions are zero-based. `strlen()` returns the length excluding trailing spaces.
- `CS` does case-insensitive containment, `=` does case-sensitive exact comparison.
- Modern ABAP functions (`to_upper`, `to_lower`, `substring`, `condense`) are cleaner than classic statements (`TRANSLATE`, `SHIFT`).

## Next Lesson

You can work with variables and strings. In **Lesson 8: Control Flow — IF, CASE, and Loops**, we'll learn how ABAP handles branching and iteration — mapped to the Python/Java constructs you already know.
