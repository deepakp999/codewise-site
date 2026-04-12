---
title: "BDC and LSMW — Data Migration Techniques"
description: "Learn SAP data migration with Batch Data Communication (BDC) and Legacy System Migration Workbench (LSMW) for loading data into SAP transactions."
order: 27
module: "integration"
module_title: "Integration & Communication"
tags: ["abap", "bdc", "lsmw", "data migration", "batch input", "intermediate"]
prev_slug: "idocs"
next_slug: "debugging"
---

# BDC and LSMW — Data Migration Techniques

## What You'll Learn
- What BDC is and how it simulates user transactions
- Recording a transaction with SHDB
- Creating a BDC program from a recording
- LSMW — the configuration-based migration tool
- When to use BDC vs BAPI vs LSMW vs IDocs

## The Data Migration Problem

When a company goes live on SAP (or migrates to S/4HANA), they need to load existing data — customers, materials, open orders, GL balances. This data comes from legacy systems in formats like CSV, Excel, or flat files.

The challenge: SAP transactions have complex validation rules, authorization checks, and workflow triggers. You can't just INSERT into database tables — that bypasses all business logic and leaves the system in an inconsistent state.

**BDC solves this** by simulating what a user would do: open a transaction, fill in fields, click buttons, and save. SAP processes each "session" as if a real user performed it, with all validations intact.

## BDC — Batch Data Communication

### Step 1: Record a Transaction with SHDB

Open transaction SHDB (Transaction Recorder) and create a new recording:

1. Enter a recording name (e.g., `Z_CREATE_CUSTOMER`)
2. Enter the transaction to record (e.g., `XD01` — Create Customer)
3. Click "Start Recording"
4. SAP opens XD01. Fill in the fields as a normal user would.
5. Save the customer. The recording captures every screen, every field, every value.
6. Click "Back" to stop recording.

The recording produces a BDC table — a sequence of screen numbers, field names, and values:

```
Program          Screen    Field Name        Field Value
──────────       ──────    ──────────────    ──────────
SAPMF02D         0100      BDC_CURSOR        RF02D-KUNNR
SAPMF02D         0100      BDC_OKCODE        /00
SAPMF02D         0100      RF02D-KTOKD       0001
SAPMF02D         0110      BDC_CURSOR        KNA1-NAME1
SAPMF02D         0110      KNA1-NAME1        Acme Corp
SAPMF02D         0110      KNA1-SORTL        ACME
SAPMF02D         0110      KNA1-LAND1        US
...
```

### Step 2: Create a BDC Program

```abap
REPORT z_bdc_customer_create.

DATA: lt_bdcdata   TYPE TABLE OF bdcdata,
      ls_bdcdata   TYPE bdcdata,
      lt_messages  TYPE TABLE OF bdcmsgcoll.

* Helper to add screen entries
FORM bdc_dynpro USING program TYPE any dynnr TYPE any.
  CLEAR ls_bdcdata.
  ls_bdcdata-program = program.
  ls_bdcdata-dynpro  = dynnr.
  ls_bdcdata-dynbegin = 'X'.
  APPEND ls_bdcdata TO lt_bdcdata.
ENDFORM.

* Helper to add field entries
FORM bdc_field USING fnam TYPE any fval TYPE any.
  CLEAR ls_bdcdata.
  ls_bdcdata-fnam = fnam.
  ls_bdcdata-fval = fval.
  APPEND ls_bdcdata TO lt_bdcdata.
ENDFORM.

START-OF-SELECTION.
  * Build BDC table for creating a customer
  PERFORM bdc_dynpro USING 'SAPMF02D' '0100'.
  PERFORM bdc_field  USING 'BDC_OKCODE' '/00'.
  PERFORM bdc_field  USING 'RF02D-KTOKD' '0001'.

  PERFORM bdc_dynpro USING 'SAPMF02D' '0110'.
  PERFORM bdc_field  USING 'BDC_OKCODE' '/00'.
  PERFORM bdc_field  USING 'KNA1-NAME1' 'TechMart Inc'.
  PERFORM bdc_field  USING 'KNA1-SORTL' 'TECHMART'.
  PERFORM bdc_field  USING 'KNA1-LAND1' 'US'.
  PERFORM bdc_field  USING 'KNA1-SPRAS' 'EN'.

  * ... more screens as captured in SHDB recording ...

  PERFORM bdc_dynpro USING 'SAPMF02D' '0300'.
  PERFORM bdc_field  USING 'BDC_OKCODE' '=UPDA'.  " Save

  * Execute the transaction
  CALL TRANSACTION 'XD01'
    USING lt_bdcdata
    MODE 'N'          " N = no display, A = display all, E = display on error
    UPDATE 'S'        " S = synchronous, A = asynchronous
    MESSAGES INTO lt_messages.

  * Check result
  IF sy-subrc = 0.
    WRITE: / 'Customer created successfully'.
  ELSE.
    WRITE: / 'Error creating customer'.
    LOOP AT lt_messages INTO DATA(ls_msg) WHERE msgtyp = 'E'.
      WRITE: / |Error: { ls_msg-msgid } { ls_msg-msgnr } { ls_msg-msgv1 }|.
    ENDLOOP.
  ENDIF.
```

### BDC Modes

```
Mode    Behavior
─────   ─────────────────────────────────
'A'     Display All — shows every screen (for debugging)
'E'     Display on Error — shows screen only when an error occurs
'N'     No Display — runs in background (for production migration)
```

Always develop with mode 'A' (see every screen), test with 'E' (see errors), and run production migration with 'N' (fastest).

## LSMW — Legacy System Migration Workbench

LSMW (transaction LSMW) is a wizard-based tool for data migration — no ABAP coding required. It provides:

1. **Source structure** — define the format of your legacy file (CSV, Excel)
2. **Target structure** — map to SAP fields
3. **Field mapping** — connect source fields to target fields with optional transformation rules
4. **Recording** — SHDB recording of the target transaction
5. **Execution** — read file, convert data, run BDC sessions in batch

LSMW is preferred by functional consultants who don't write ABAP. It's slower than custom BDC programs but requires no coding.

## When to Use Which Technique

```
Technique    Best For                        Speed     Coding Required
──────────   ─────────────────────────────   ─────     ───────────────
BAPI         Creating business objects       Fast      Yes (ABAP)
BDC          Screen-based transactions       Medium    Yes (ABAP)
LSMW         Configuration-based migration   Medium    No
IDoc         System-to-system migration      Medium    Minimal
Direct Input SAP-provided programs           Fastest   No
```

**BAPI is preferred** when one exists for your scenario — it's faster and more reliable than BDC. **BDC is necessary** when there's no BAPI (many older transactions lack BAPIs). **LSMW** is for functional consultants doing one-time loads.

## Common Mistakes

- **Not using mode 'A' during development.** Developing BDC blind (mode 'N') means you can't see which screen or field is causing the error. Always develop with mode 'A'.
- **Hardcoding field values from the recording.** A recording captures your specific test data. Replace hardcoded values with variables from your input file or selection screen.
- **Not handling mandatory fields that appear conditionally.** Some SAP screens show different fields based on previous inputs. Your BDC recording may not capture all possible screen variations.
- **Using BDC when a BAPI exists.** BDC is slower, more fragile (breaks if SAP changes screen layouts in upgrades), and harder to error-handle. Always check for a BAPI first.

## Key Takeaways

- BDC simulates user transactions — it fills screens and clicks buttons programmatically.
- Record transactions with SHDB to capture screen sequences and field names.
- Use CALL TRANSACTION for real-time processing, BDC sessions (SM35) for batch processing.
- LSMW is the no-code alternative for data migration — wizard-based, popular with functional consultants.
- Always prefer BAPIs over BDC when available — BAPIs are faster, more stable, and better for error handling.
- Develop in mode 'A', test in mode 'E', run production in mode 'N'.

## Next Lesson

Module 5 is complete! You can build function modules, call BAPIs, communicate via RFC, exchange IDocs, and migrate data with BDC. In **Module 6: Real-World Skills**, we start with **Lesson 28: Debugging ABAP Programs** — the skill that separates junior developers from seniors.
