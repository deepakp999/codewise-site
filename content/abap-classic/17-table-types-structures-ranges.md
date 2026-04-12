---
title: "Table Types, Structures, and Ranges"
description: "Learn reusable ABAP type definitions: TYPE TABLE OF, nested structures, RANGE for flexible selections, and organizing complex data models."
order: 17
module: "data-dictionary"
module_title: "Data Dictionary & Database"
tags: ["abap", "table types", "structures", "ranges", "type definitions", "intermediate"]
prev_slug: "modifying-data"
next_slug: "selection-screens"
---

# Table Types, Structures, and Ranges

## What You'll Learn
- Defining reusable structures with TYPES
- Table types for method parameters
- Nested structures and deep structures
- The RANGE type for flexible selections
- Using ranges in SELECT statements

## Defining Structures with TYPES

```abap
REPORT z_type_definitions.

* Define a structure type (reusable blueprint)
TYPES: BEGIN OF ty_order,
         order_id    TYPE vbeln,
         customer_id TYPE kunnr,
         order_date  TYPE datum,
         amount      TYPE netwr_ap,
         status      TYPE c LENGTH 1,
       END OF ty_order.

* Use it to declare variables
DATA: ls_order  TYPE ty_order,          " One row
      lt_orders TYPE TABLE OF ty_order. " Table of rows
```

`TYPES` defines a blueprint. `DATA` creates actual variables from that blueprint. You can reuse `ty_order` throughout your program — any change to the type definition automatically updates all variables using it.

## Table Types

A table type explicitly defines the table's access type and key:

```abap
* Standard table (most common)
TYPES: tt_orders TYPE STANDARD TABLE OF ty_order WITH DEFAULT KEY.

* Sorted table with explicit key
TYPES: tt_orders_sorted TYPE SORTED TABLE OF ty_order WITH UNIQUE KEY order_id.

* Hashed table
TYPES: tt_orders_hashed TYPE HASHED TABLE OF ty_order WITH UNIQUE KEY order_id.

* Use in method signatures
CLASS lcl_processor DEFINITION.
  PUBLIC SECTION.
    METHODS: process_orders IMPORTING it_orders TYPE tt_orders.
ENDCLASS.
```

Table types are essential for method parameters — you can't pass `TYPE TABLE OF ty_order` directly to a method, you need a named table type.

## Nested Structures

```abap
TYPES: BEGIN OF ty_address,
         street TYPE string,
         city   TYPE string,
         zip    TYPE string,
         country TYPE land1,
       END OF ty_address.

TYPES: BEGIN OF ty_customer_full,
         customer_id TYPE kunnr,
         name        TYPE string,
         address     TYPE ty_address,           " Nested structure
         orders      TYPE TABLE OF ty_order WITH DEFAULT KEY, " Deep structure
       END OF ty_customer_full.

DATA: ls_customer TYPE ty_customer_full.

ls_customer-name = 'Alice'.
ls_customer-address-city = 'Mumbai'.
ls_customer-address-country = 'IN'.
```

Nested structures access fields with chained dashes: `ls_customer-address-city`. Deep structures (structures containing internal tables) are common in complex business objects.

## RANGES — Flexible Selection Criteria

A RANGE is an internal table that represents a set of selection conditions — like a WHERE clause stored in a variable:

```abap
* Define a range for customer numbers
DATA: lr_kunnr TYPE RANGE OF kunnr.

* Add conditions: single value
lr_kunnr = VALUE #(
  ( sign = 'I' option = 'EQ' low = '0000001001' )
  ( sign = 'I' option = 'EQ' low = '0000001002' )
  ( sign = 'I' option = 'EQ' low = '0000001003' )
).

* Use in a SELECT
SELECT * FROM kna1
  INTO TABLE @DATA(lt_customers)
  WHERE kunnr IN @lr_kunnr.
```

### Range Components

Each range row has four fields:

```
SIGN    'I' = Include, 'E' = Exclude
OPTION  'EQ' = Equal, 'BT' = Between, 'CP' = Pattern, 'GT' = Greater Than
LOW     Start value (or the single value for EQ)
HIGH    End value (only for BT = Between)
```

### Common Range Patterns

```abap
* Include a range of values
lr_kunnr = VALUE #(
  ( sign = 'I' option = 'BT' low = '0000001000' high = '0000001999' )
).

* Include everything EXCEPT specific values
lr_kunnr = VALUE #(
  ( sign = 'I' option = 'BT' low = '0000000001' high = '9999999999' )
  ( sign = 'E' option = 'EQ' low = '0000001050' )  " Exclude this one
).

* Pattern matching
DATA: lr_name TYPE RANGE OF name1_gp.
lr_name = VALUE #(
  ( sign = 'I' option = 'CP' low = '*Corp*' )  " Names containing 'Corp'
).
```

### Why Ranges Are Powerful

Ranges are used everywhere in SAP:
- Selection screens (PARAMETERS and SELECT-OPTIONS) generate ranges automatically
- Function modules accept ranges as parameters
- You can build dynamic WHERE conditions by constructing ranges programmatically

```abap
* Build a range dynamically based on business logic
DATA: lr_status TYPE RANGE OF c LENGTH 1.

IF lv_include_open = abap_true.
  APPEND VALUE #( sign = 'I' option = 'EQ' low = 'O' ) TO lr_status.
ENDIF.
IF lv_include_closed = abap_true.
  APPEND VALUE #( sign = 'I' option = 'EQ' low = 'C' ) TO lr_status.
ENDIF.

SELECT * FROM zorders INTO TABLE @DATA(lt_orders)
  WHERE status IN @lr_status.
```

## INCLUDE TYPE — Reusing Structures

```abap
TYPES: BEGIN OF ty_base_fields,
         created_by   TYPE syuname,
         created_date TYPE datum,
         changed_by   TYPE syuname,
         changed_date TYPE datum,
       END OF ty_base_fields.

TYPES: BEGIN OF ty_order_extended.
         INCLUDE TYPE ty_order.           " Pulls in all fields from ty_order
         INCLUDE TYPE ty_base_fields.     " Adds audit fields
TYPES: END OF ty_order_extended.
```

INCLUDE TYPE inlines all fields from another structure — like composition/inheritance for data types.

## Common Mistakes

- **Forgetting the SIGN field in ranges.** Without `sign = 'I'`, the range condition doesn't include anything. Always set SIGN explicitly.
- **Using an empty range in a SELECT WHERE ... IN.** An empty range (`lr_kunnr IS INITIAL`) matches ALL rows — no filtering happens. Check before using: `IF lr_kunnr IS NOT INITIAL.`
- **Confusing TYPES and DATA.** `TYPES` creates a blueprint (no memory allocated). `DATA` creates an actual variable (memory allocated). You can't WRITE to a TYPE or APPEND to a TYPE — only to DATA variables.
- **Forgetting WITH DEFAULT KEY on table types.** Without a key specification, some table type declarations cause syntax warnings or errors in strict mode.

## Key Takeaways

- `TYPES` defines reusable blueprints for structures and table types.
- Table types with explicit keys are required for method parameters.
- Nested structures use chained dashes: `ls_record-address-city`.
- RANGE tables store flexible selection criteria (SIGN, OPTION, LOW, HIGH).
- Ranges integrate directly with SELECT ... WHERE ... IN — dynamically build your WHERE clauses.
- Use INCLUDE TYPE to compose structures from reusable parts.
- An empty range in WHERE ... IN matches everything — always check IS NOT INITIAL.

## Next Lesson

Module 3 is complete! You can define tables, query data, modify records, and organize complex types. In **Module 4: Reports & User Interfaces**, we start with **Lesson 18: Selection Screens** — how to build user input screens for your ABAP reports.
