---
title: "Modern ABAP Syntax — Inline Declarations, Expressions, and Constructor Operators"
description: "Learn modern ABAP syntax with side-by-side comparisons to Classic ABAP. Covers inline declarations, string templates, constructor operators, and new internal table operations."
order: 4
module: "modern-abap-landscape"
module_title: "The Modern ABAP Landscape"
tags: ["modern abap syntax", "inline declaration", "string templates", "constructor operators", "abap expressions"]
prev_slug: "setting-up-adt"
next_slug: "abap-oop-for-rap"
---

# Modern ABAP Syntax — Inline Declarations and Expressions

## What You'll Learn
- Inline declarations with `DATA()` and `FINAL()`
- String templates with `| |`
- Constructor operators: `VALUE`, `NEW`, `CONV`, `COND`, `SWITCH`, `REDUCE`, `FILTER`
- Modern internal table operations: `FOR`, `CORRESPONDING`, table expressions
- Why modern syntax matters for CDS and RAP code

## Why Syntax Matters

You might think: "It's just syntax — the logic is the same." True. But modern ABAP syntax is not cosmetic — it makes your code shorter, safer, and easier for the ATC to analyze. RAP-generated code uses modern syntax exclusively, so reading and writing it fluently is essential.

Let's convert TechMart code from Classic to Modern, side by side.

## Inline Declarations

Classic ABAP requires you to declare variables before using them:

```abap
" CLASSIC
DATA: lv_name TYPE string,
      lt_products TYPE TABLE OF ztm_product,
      ls_product TYPE ztm_product.

SELECT * FROM ztm_product INTO TABLE lt_products.
READ TABLE lt_products INTO ls_product INDEX 1.
lv_name = ls_product-name.
```

Modern ABAP declares variables at the point of first use:

```abap
" MODERN
SELECT * FROM ztm_product INTO TABLE @DATA(lt_products).
DATA(ls_product) = lt_products[ 1 ].
DATA(lv_name) = ls_product-name.
```

Use `FINAL()` instead of `DATA()` when the value should never change:

```abap
" FINAL = immutable (like a constant, but computed at runtime)
FINAL(lv_pi) = '3.14159'.
FINAL(lv_count) = lines( lt_products ).
" lv_count = 99.  " ← This would cause a compilation error
```

**Rule of thumb:** Use `FINAL()` by default. Switch to `DATA()` only if you need to reassign the variable later.

## String Templates

Classic string handling was painful:

```abap
" CLASSIC
DATA: lv_msg TYPE string.
CONCATENATE 'Product' ls_product-name 'costs' ls_product-price 'USD'
  INTO lv_msg SEPARATED BY space.
```

Modern ABAP uses string templates — embed expressions directly in strings:

```abap
" MODERN
DATA(lv_msg) = |Product { ls_product-name } costs { ls_product-price } USD|.
```

You can format values inside the curly braces:

```abap
" Formatting options
DATA(lv_date_msg) = |Order date: { ls_order-date DATE = USER }|.
DATA(lv_num_msg)  = |Total: { lv_total NUMBER = RAW DECIMALS = 2 }|.
DATA(lv_aligned)  = |ID: { ls_product-id WIDTH = 10 ALIGN = LEFT PAD = '0' }|.
```

### Expected Output

```
Product Widget-Pro costs 49.99 USD
Order date: 12.04.2026
Total: 1234.56
ID: 0000000042
```

## Constructor Operators

These are the biggest productivity boost in modern ABAP.

### VALUE — Create Data Objects Inline

```abap
" CLASSIC
DATA: lt_statuses TYPE TABLE OF string.
APPEND 'New' TO lt_statuses.
APPEND 'In Process' TO lt_statuses.
APPEND 'Completed' TO lt_statuses.

" MODERN
DATA(lt_statuses) = VALUE string_table(
  ( |New| ) ( |In Process| ) ( |Completed| )
).
```

For structures and internal tables with named components:

```abap
" Create a structure
DATA(ls_order) = VALUE ztm_salesorder(
  order_id  = '1001'
  customer  = 'TECHMART-42'
  status    = 'NEW'
  amount    = '999.99'
).

" Create an internal table with multiple rows
DATA(lt_items) = VALUE ztm_soitem_tab(
  ( item_id = '10' product = 'WIDGET-A' quantity = 5 price = '49.99' )
  ( item_id = '20' product = 'WIDGET-B' quantity = 3 price = '29.99' )
  ( item_id = '30' product = 'GADGET-X' quantity = 1 price = '199.99' )
).
```

### COND and SWITCH — Conditional Values

```abap
" CLASSIC
IF ls_order-amount > 1000.
  lv_category = 'Premium'.
ELSEIF ls_order-amount > 100.
  lv_category = 'Standard'.
ELSE.
  lv_category = 'Basic'.
ENDIF.

" MODERN — COND
DATA(lv_category) = COND string(
  WHEN ls_order-amount > 1000 THEN |Premium|
  WHEN ls_order-amount > 100  THEN |Standard|
  ELSE |Basic|
).

" SWITCH — when comparing one variable against multiple values
DATA(lv_status_text) = SWITCH string( ls_order-status
  WHEN 'N' THEN |New|
  WHEN 'P' THEN |In Process|
  WHEN 'C' THEN |Completed|
  WHEN 'X' THEN |Cancelled|
  ELSE |Unknown|
).
```

### FOR — Loop Expressions

```abap
" CLASSIC — extract product names from a table
DATA: lt_names TYPE string_table.
LOOP AT lt_products INTO DATA(ls_prod).
  APPEND ls_prod-name TO lt_names.
ENDLOOP.

" MODERN — FOR expression
DATA(lt_names) = VALUE string_table(
  FOR ls_prod IN lt_products ( ls_prod-name )
).

" FOR with WHERE condition
DATA(lt_expensive) = VALUE ztm_product_tab(
  FOR ls_p IN lt_products WHERE ( price > 100 )
  ( ls_p )
).
```

### REDUCE — Aggregate Values

```abap
" CLASSIC — sum all order amounts
DATA: lv_total TYPE ztm_amount.
LOOP AT lt_orders INTO DATA(ls_ord).
  lv_total = lv_total + ls_ord-amount.
ENDLOOP.

" MODERN — REDUCE
DATA(lv_total) = REDUCE ztm_amount(
  INIT sum = CONV ztm_amount( 0 )
  FOR ls_ord IN lt_orders
  NEXT sum = sum + ls_ord-amount
).
```

### FILTER — Extract Matching Rows (Requires Sorted/Hashed Table)

```abap
" Filter products by category (table must be sorted or hashed on the key)
DATA(lt_electronics) = FILTER #(
  lt_products_sorted WHERE category = 'ELECTRONICS'
).
```

### CORRESPONDING — Map Between Structures

```abap
" CLASSIC
MOVE-CORRESPONDING ls_source TO ls_target.

" MODERN
DATA(ls_target) = CORRESPONDING ztm_target_type( ls_source ).

" With explicit mappings
DATA(ls_mapped) = CORRESPONDING ztm_target_type( ls_source
  MAPPING target_field1 = source_field_a
          target_field2 = source_field_b
).
```

## Modern Internal Table Access

```abap
" Table expressions — read by index
DATA(ls_first) = lt_products[ 1 ].

" Read by key field
DATA(ls_found) = lt_products[ product_id = 'WIDGET-A' ].

" Check if a row exists (without exceptions)
IF line_exists( lt_products[ product_id = 'WIDGET-Z' ] ).
  " Row exists
ENDIF.

" Get a single field value
DATA(lv_price) = lt_products[ product_id = 'WIDGET-A' ]-price.

" Safe access with OPTIONAL (returns initial value if not found)
DATA(ls_maybe) = VALUE #( lt_products[ product_id = 'NOPE' ] OPTIONAL ).
```

## Putting It All Together — A TechMart Example

Classic version of a product report:

```abap
" CLASSIC — 25 lines
DATA: lt_products TYPE TABLE OF ztm_product,
      ls_product  TYPE ztm_product,
      lv_count    TYPE i,
      lv_total    TYPE p DECIMALS 2,
      lv_msg      TYPE string.

SELECT * FROM ztm_product INTO TABLE lt_products
  WHERE category = 'ELECTRONICS'.

DESCRIBE TABLE lt_products LINES lv_count.

LOOP AT lt_products INTO ls_product.
  lv_total = lv_total + ls_product-price.
ENDLOOP.

CONCATENATE 'Found' lv_count 'products, total value:'
  lv_total INTO lv_msg SEPARATED BY space.
```

Modern version:

```abap
" MODERN — 8 lines
SELECT * FROM ztm_product INTO TABLE @DATA(lt_products)
  WHERE category = 'ELECTRONICS'.

DATA(lv_count) = lines( lt_products ).
DATA(lv_total) = REDUCE decfloat34(
  INIT sum = CONV decfloat34( 0 )
  FOR ls_p IN lt_products
  NEXT sum = sum + ls_p-price
).
DATA(lv_msg) = |Found { lv_count } products, total value: { lv_total }|.
```

Same logic. One-third the code. Zero ambiguity.

## Common Mistakes

- **Overusing `DATA()` when `FINAL()` is better** — If you won't reassign the variable, use `FINAL()`. It communicates intent and the compiler can optimize.
- **Forgetting the `@` escape in ABAP SQL** — In modern syntax, host variables in SQL need `@`: `SELECT * FROM table INTO @DATA(lt)`. Classic syntax didn't need it, but modern SQL does.
- **Panicking about table expressions raising exceptions** — `lt_products[ 1 ]` raises `CX_SY_ITAB_LINE_NOT_FOUND` if the table is empty. Use `VALUE #( lt_products[ 1 ] OPTIONAL )` for safe access, or check `line_exists()` first.
- **Using MOVE-CORRESPONDING in new code** — It still works, but `CORRESPONDING #()` is the modern way and supports MAPPING and EXCEPT clauses.
- **Writing modern syntax inside Classic programs** — Modern syntax works in both Classic and Cloud. But if you're writing new code, write it in ABAP Cloud classes, not SE38 reports.

## Key Takeaways

- Modern ABAP syntax is shorter, safer, and more expressive than Classic syntax. It's not optional — RAP and CDS tooling generate modern syntax, and you need to read/write it fluently.
- Use `DATA()` and `FINAL()` for inline declarations. Prefer `FINAL()` when the value won't change.
- String templates (`| |`) replace `CONCATENATE`. Constructor operators (`VALUE`, `COND`, `SWITCH`, `REDUCE`, `FILTER`, `CORRESPONDING`) replace dozens of lines of procedural code.
- Table expressions (`lt[ 1 ]`, `lt[ key = val ]`) replace `READ TABLE`.
- Learn the `@` escape for host variables in ABAP SQL — it's mandatory in modern syntax.

## Next Lesson

In Lesson 5, we'll do a focused **OOP refresher** — interfaces, abstract classes, and the patterns that connect directly to RAP behavior implementation. If Classic OOP was theory, RAP OOP is practice. You'll see exactly why we learned classes and interfaces in the Classic course.
