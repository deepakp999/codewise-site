---
title: "The ABAP Data Dictionary (SE11)"
description: "Understand SAP's Data Dictionary: tables, data elements, domains, structures, and how they form the metadata layer of every SAP system."
order: 13
module: "data-dictionary"
module_title: "Data Dictionary & Database"
tags: ["abap", "data dictionary", "se11", "tables", "data elements", "beginner"]
prev_slug: "subroutines-functions-methods"
next_slug: "database-tables"
---

# The ABAP Data Dictionary (SE11)

## What You'll Learn
- What the Data Dictionary is and why it's central to SAP
- The hierarchy: domains → data elements → table fields
- How to explore existing tables and create custom ones
- Structures, table types, and search helps

## What Is the Data Dictionary?

The Data Dictionary (transaction SE11) is SAP's metadata layer. It defines every database table, every data type, and every structure in the entire SAP system. If internal tables are ABAP's most important data structure, the Data Dictionary is its most important tool.

Think of it as a schema registry — like a database's `information_schema`, but richer. It defines not just column names and types, but also labels, documentation, validation rules, and relationships.

## The Building Blocks

### Domain → Data Element → Table Field

SAP uses a three-layer type system:

```
Domain          → defines the TECHNICAL properties (type, length, value range)
  └── Data Element → adds SEMANTIC meaning (labels, documentation)
       └── Table Field → uses the data element in a specific table
```

**Example:**

```
Domain: CHAR10           → Type C, Length 10
  └── Data Element: KUNNR  → Label "Customer Number", help text, search help
       └── Table KNA1, field KUNNR  → The customer number column in the customer master
       └── Table VBAK, field KUNNR  → The customer number column in sales order header
```

The beauty: both KNA1 and VBAK reference the same data element KUNNR. If SAP changes the customer number format, both tables adapt automatically. And any program using `TYPE kunnr` gets the change for free.

## Exploring the Data Dictionary in SE11

Type `/nSE11` and enter a table name:

### Viewing a Standard Table

```
Table: KNA1 (Customer Master — General Data)

Key fields:
  MANDT    (Client)           TYPE MANDT
  KUNNR    (Customer Number)  TYPE KUNNR

Other fields:
  NAME1    (Name 1)           TYPE NAME1_GP
  LAND1    (Country)          TYPE LAND1_GP
  ORT01    (City)             TYPE ORT01
  PSTLZ    (Postal Code)     TYPE PSTLZ
  STRAS    (Street)           TYPE STRAS_GP
  ...
```

Click on any field to see its data element. Click on the data element to see its domain. This chain — table → data element → domain — is how you trace any field's definition in SAP.

### Common SAP Tables You'll Work With

```
Table     Module    Description
──────    ──────    ──────────────────────────
KNA1      SD/FI     Customer master (general)
MARA      MM        Material master (general)
VBAK      SD        Sales order header
VBAP      SD        Sales order items
EKKO      MM        Purchase order header
EKPO      MM        Purchase order items
BKPF      FI        Accounting document header
BSEG      FI        Accounting document items
T001      FI        Company codes
```

## Creating a Custom Table

In SE11, enter a table name starting with Z (e.g., `ZEMPLOYEES`) and click "Create."

### Step 1: Delivery and Maintenance

- **Delivery Class:** A (Application table — contains your business data)
- **Data Browser/Table View Maintenance:** choose "Display/Maintenance Allowed"

### Step 2: Define Fields

```
Field Name    Key?   Data Element     Type      Length    Description
───────────   ─────  ──────────────   ────────  ──────   ──────────────
MANDT         ✓      MANDT            CLNT      3        Client
EMPLOYEE_ID   ✓      ZEMPLOYEE_ID     NUMC      10       Employee ID
NAME          -      ZENAME           CHAR      50       Employee Name
DEPARTMENT    -      ZDEPARTMENT      CHAR      30       Department
SALARY        -      ZSALARY          CURR      13,2     Salary
HIRE_DATE     -      ZHIRE_DATE       DATS      8        Hire Date
```

### Step 3: Technical Settings

Every table needs technical settings:
- **Data Class:** APPL0 (master data), APPL1 (transaction data), or APPL2 (configuration)
- **Size Category:** 0-4 (expected number of records)
- **Buffering:** Not buffered (default for transaction data)

### Step 4: Activate

Save and activate (Ctrl+F3). The table is now created in the database — you can write ABAP programs that read and write to it.

## Structures

A structure is a data type without a database table — it defines a row shape but doesn't store data:

```abap
* Using a structure from the dictionary
DATA: ls_customer TYPE kna1.   " Has all fields of table KNA1

* Or define your own in code
TYPES: BEGIN OF ty_order_summary,
         order_id    TYPE vbeln,
         customer    TYPE kunnr,
         total       TYPE netwr_ap,
       END OF ty_order_summary.
```

Structures defined in SE11 are reusable across all programs. Structures defined with `TYPES` in code are local to that program.

## Table Types

A table type defines the type of an internal table — useful for method parameters:

```abap
* In SE11, you'd create a table type ZEMPLOYEE_TAB as:
*   Line Type: ZEMPLOYEES (your table structure)
*   Access: Standard Table
*   Key: EMPLOYEE_ID

* In code, equivalent to:
TYPES: tt_employees TYPE STANDARD TABLE OF zemployees WITH KEY employee_id.
```

## Search Helps

Search helps (F4 help) define the dropdown values when a user presses F4 on an input field. They're defined in SE11 and attached to data elements.

When you press F4 on a customer number field, the search help queries KNA1, shows a list of customers with their names and cities, and lets the user pick one. This is configured in the Data Dictionary, not in program code.

## Using Dictionary Types in Programs

```abap
* Reference a table structure
DATA: ls_customer TYPE kna1.

* Reference a specific field's type
DATA: lv_customer_id TYPE kna1-kunnr.    " Same type as the KUNNR field in KNA1
DATA: lv_name TYPE kna1-name1.           " Same type as NAME1 in KNA1

* Reference a data element directly
DATA: lv_order_number TYPE vbeln.        " Sales document number
```

This is the preferred way to declare variables in production code — reference the dictionary type, not raw types. If SAP changes the field length, your variable adapts automatically.

## Common Mistakes

- **Creating tables without MANDT (client field).** Almost every SAP table has MANDT as the first key field for client isolation. Without it, your data isn't client-dependent, which causes issues in multi-client systems.
- **Using raw types instead of data elements.** `DATA: lv_id TYPE c LENGTH 10.` works, but `DATA: lv_id TYPE kunnr.` is better — it inherits labels, documentation, and search helps from the data element.
- **Forgetting to activate technical settings.** A table without technical settings can't be activated. You must specify data class and size category.
- **Not checking existing SAP tables first.** Before creating a custom table, check if SAP already has one that fits. SAP has thousands of standard tables — duplicating them creates maintenance headaches during upgrades.

## Key Takeaways

- The Data Dictionary (SE11) is SAP's metadata layer — it defines every table, type, and structure.
- The hierarchy is: Domain (technical) → Data Element (semantic) → Table Field (usage).
- Always reference dictionary types in your programs (`TYPE kunnr`) instead of raw types (`TYPE c LENGTH 10`).
- Custom tables start with Z or Y, must have MANDT as first key field, and need technical settings.
- Structures define row shapes without database storage. Table types define internal table types for reuse.
- Explore existing SAP tables before creating custom ones.

## Next Lesson

You know how tables are defined. In **Lesson 14: Database Tables and Transparent Tables**, we'll understand how SAP stores data in the database, primary keys, foreign keys, and the relationship between dictionary tables and actual database tables.
