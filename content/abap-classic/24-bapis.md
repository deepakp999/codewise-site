---
title: "BAPIs — SAP's Standard APIs"
description: "Learn what BAPIs are, how to find and call them, handle return messages, and use BAPI_TRANSACTION_COMMIT for data persistence."
order: 24
module: "integration"
module_title: "Integration & Communication"
tags: ["abap", "bapi", "api", "bapi_transaction_commit", "intermediate"]
prev_slug: "function-modules-deep-dive"
next_slug: "rfc"
---

# BAPIs — SAP's Standard APIs

## What You'll Learn
- What BAPIs are and how they differ from regular function modules
- How to find the right BAPI for your task
- Calling BAPIs and handling return messages
- BAPI_TRANSACTION_COMMIT — why you must call it
- Common BAPIs for sales, materials, and finance

## What Is a BAPI?

A BAPI (Business Application Programming Interface) is a standard SAP function module that provides a stable, documented interface to SAP business objects. BAPIs are SAP's official API layer — they're the supported way to create, read, change, and delete business data programmatically.

**BAPI vs regular function module:** BAPIs follow SAP standards — consistent naming, RETURN parameter for messages, transaction handling, and upgrade stability. Regular function modules can be anything.

## Finding BAPIs

### Method 1: BAPI Explorer (Transaction BAPI)

Type `/nBAPI` to open the BAPI Explorer. Browse by business object:

```
Business Object Hierarchy:
├── Cross-Application
├── Sales and Distribution
│   ├── SalesOrder
│   │   ├── CreateFromDat2  → BAPI_SALESORDER_CREATEFROMDAT2
│   │   ├── GetList          → BAPI_SALESORDER_GETLIST
│   │   └── Change           → BAPI_SALESORDER_CHANGE
├── Materials Management
│   ├── PurchaseOrder
│   │   ├── Create1          → BAPI_PO_CREATE1
│   │   └── GetDetail        → BAPI_PO_GETDETAIL
├── Financial Accounting
│   ├── AcctngDocument
│   │   └── Post             → BAPI_ACC_DOCUMENT_POST
```

### Method 2: Search in SE37

Search for `BAPI_*` with wildcards: `BAPI_SALESORDER*`, `BAPI_CUSTOMER*`, `BAPI_MATERIAL*`.

## Calling a BAPI — Reading Data

```abap
REPORT z_bapi_demo.

* Get list of sales orders for a customer
DATA: lt_orders TYPE TABLE OF bapisdhdr.

CALL FUNCTION 'BAPI_SALESORDER_GETLIST'
  EXPORTING
    customer_number = '0000001001'
    sales_organization = '1000'
  TABLES
    sales_orders = lt_orders.

WRITE: / |Found { lines( lt_orders ) } sales orders|.

LOOP AT lt_orders INTO DATA(ls_order).
  WRITE: / |Order: { ls_order-sd_doc } Date: { ls_order-doc_date } Value: { ls_order-net_value }|.
ENDLOOP.
```

## Calling a BAPI — Creating Data

```abap
* Create a sales order via BAPI
DATA: ls_header    TYPE bapisdhd1,
      ls_headerx   TYPE bapisdhd1x,
      lt_items     TYPE TABLE OF bapisditm,
      lt_itemsx    TYPE TABLE OF bapisditmx,
      lt_partners  TYPE TABLE OF bapiparnr,
      lt_return    TYPE TABLE OF bapiret2,
      lv_order_num TYPE vbeln.

* Header data
ls_header-doc_type = 'TA'.           " Standard order
ls_header-sales_org = '1000'.
ls_header-distr_chan = '10'.
ls_header-division = '00'.
ls_header-purch_no_c = 'PO-12345'.   " Customer PO number

ls_headerx-doc_type = 'X'.
ls_headerx-sales_org = 'X'.
ls_headerx-distr_chan = 'X'.
ls_headerx-division = 'X'.
ls_headerx-purch_no_c = 'X'.

* Item data
DATA: ls_item TYPE bapisditm, ls_itemx TYPE bapisditmx.
ls_item-itm_number = '000010'.
ls_item-material = '000000000000001234'.
ls_item-target_qty = 5.
APPEND ls_item TO lt_items.

ls_itemx-itm_number = '000010'.
ls_itemx-material = 'X'.
ls_itemx-target_qty = 'X'.
APPEND ls_itemx TO lt_itemsx.

* Partner data (sold-to party)
DATA: ls_partner TYPE bapiparnr.
ls_partner-partn_role = 'AG'.        " Sold-to party
ls_partner-partn_numb = '0000001001'.
APPEND ls_partner TO lt_partners.

* Call the BAPI
CALL FUNCTION 'BAPI_SALESORDER_CREATEFROMDAT2'
  EXPORTING
    order_header_in  = ls_header
    order_header_inx = ls_headerx
  IMPORTING
    salesdocument    = lv_order_num
  TABLES
    return           = lt_return
    order_items_in   = lt_items
    order_items_inx  = lt_itemsx
    order_partners   = lt_partners.

* Check for errors in the RETURN table
READ TABLE lt_return INTO DATA(ls_return) WITH KEY type = 'E'.
IF sy-subrc = 0.
  * Error found — display all error messages
  LOOP AT lt_return INTO ls_return WHERE type = 'E' OR type = 'A'.
    WRITE: / |Error: { ls_return-message }|.
  ENDLOOP.
  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
ELSE.
  * Success — COMMIT the transaction
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = 'X'.
  WRITE: / |Sales order { lv_order_num } created successfully|.
ENDIF.
```

## The RETURN Parameter — BAPI Error Handling

Every BAPI returns a `RETURN` table (type BAPIRET2) with messages:

```
TYPE    Meaning
─────   ─────────────────
S       Success message
E       Error message
W       Warning message
I       Information message
A       Abort (critical error)
```

**Always check the RETURN table for errors.** A BAPI call with `sy-subrc = 0` does NOT mean it succeeded — it only means the function module was called successfully. Business errors are reported in the RETURN table.

## BAPI_TRANSACTION_COMMIT — Critical!

BAPIs don't commit data automatically. After a successful BAPI call, you MUST call:

```abap
CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
  EXPORTING
    wait = 'X'.     " Wait for commit to complete
```

Without this call, the sales order, purchase order, or whatever you created is **not saved to the database**. This is the #1 BAPI mistake.

For errors, call:
```abap
CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
```

## Common BAPIs Reference

```
Business Object        BAPI                              Action
─────────────────     ──────────────────────────────     ──────────
Sales Order           BAPI_SALESORDER_CREATEFROMDAT2     Create
Sales Order           BAPI_SALESORDER_GETLIST            Read list
Sales Order           BAPI_SALESORDER_CHANGE             Modify
Customer              BAPI_CUSTOMER_GETDETAIL2           Read
Material              BAPI_MATERIAL_GETDETAIL            Read
Purchase Order        BAPI_PO_CREATE1                    Create
Purchase Order        BAPI_PO_GETDETAIL                  Read
Accounting Document   BAPI_ACC_DOCUMENT_POST             Create
Company Code          BAPI_COMPANYCODE_GETDETAIL         Read
Cost Center           BAPI_COSTCENTER_GETDETAIL          Read
```

## Common Mistakes

- **Forgetting BAPI_TRANSACTION_COMMIT.** Without it, no data is saved. This is the most common BAPI error — everything looks like it worked, but the data isn't there.
- **Checking sy-subrc instead of the RETURN table.** `sy-subrc = 0` after CALL FUNCTION means the FM was reached, not that the business operation succeeded. Always check RETURN for TYPE 'E' or 'A'.
- **Not understanding the "X" structures.** Many BAPIs have matching "X" structures (like `bapisdhd1x` for `bapisdhd1`). The X structure tells SAP which fields you're actually setting — without it, SAP ignores your values.
- **Calling BAPI_TRANSACTION_COMMIT after an error.** If the RETURN table contains errors, call ROLLBACK, not COMMIT. Committing after an error can leave data in an inconsistent state.

## Key Takeaways

- BAPIs are SAP's official APIs — stable, documented, and upgrade-safe.
- Always check the RETURN table for errors — `sy-subrc = 0` is not enough.
- Always call BAPI_TRANSACTION_COMMIT after successful BAPIs, BAPI_TRANSACTION_ROLLBACK after errors.
- Use the "X" structures to flag which fields you're populating.
- Find BAPIs via BAPI Explorer (transaction BAPI) or by searching `BAPI_*` in SE37.

## Next Lesson

BAPIs work within one SAP system. In **Lesson 25: RFC — Remote Function Calls**, we'll learn how function modules are called across SAP systems and from external programs.
