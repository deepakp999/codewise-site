---
title: "Top 20 ABAP Interview Questions (With Code Answers)"
description: "Prepare for SAP ABAP developer interviews with the 20 most-asked questions, organized by difficulty, with code examples and references to course lessons."
order: 30
module: "real-world-skills"
module_title: "Real-World Skills & Interview Prep"
tags: ["abap", "interview questions", "career", "sap developer", "reference"]
prev_slug: "enhancements"
next_slug: null
---

# Top 20 ABAP Interview Questions

## What You'll Learn
- The 20 most commonly asked ABAP questions in SAP developer interviews
- Concise answers with code examples
- Which lesson covers each topic in depth

## Beginner Level

### 1. What is ABAP and what is it used for?

ABAP (Advanced Business Application Programming) is SAP's proprietary language for developing and customizing applications on the SAP platform. It's used to build custom reports, extend standard SAP functionality, create interfaces between SAP and external systems, and migrate data. ABAP runs on the SAP Application Server, between the user interface and the database.

*Covered in: Lesson 1*

### 2. What are the different data types in ABAP?

Elementary types: `i` (integer), `f` (float), `p` (packed decimal for financial data), `c` (fixed-length character), `string` (variable-length), `n` (numeric text preserving leading zeros), `d` (date YYYYMMDD), `t` (time HHMMSS), `x` (hexadecimal). Use `p DECIMALS n` for money — never `f`, which has floating-point rounding errors.

*Covered in: Lesson 6*

### 3. What is an internal table? Name the three types.

An internal table is an in-memory data structure for holding multiple rows of structured data. Three types: **STANDARD** (sequential access, like a list), **SORTED** (binary search access by key), **HASHED** (constant-time access by key, like a dictionary). STANDARD is the default and most common.

*Covered in: Lesson 9*

### 4. What is the difference between APPEND and INSERT for internal tables?

`APPEND` adds a row to the end of a STANDARD table. `INSERT` adds a row at a specific position or maintains sort order in a SORTED table. You cannot use APPEND on SORTED or HASHED tables — use INSERT.

*Covered in: Lesson 10*

### 5. What is sy-subrc and why is it important?

`sy-subrc` is a system variable that indicates the return code of the last operation. `0` means success, non-zero means failure (usually `4`). You must check `sy-subrc` after: SELECT, READ TABLE, CALL FUNCTION, OPEN DATASET, and most other operations. Not checking `sy-subrc` is one of the most common bugs in ABAP.

*Covered in: Lesson 6*

## Intermediate Level

### 6. What is the difference between a field symbol and a work area?

A work area (`INTO ls_work`) creates a copy of the data — changes don't affect the original table. A field symbol (`ASSIGNING <ls_fs>`) points directly to the memory — changes immediately affect the table. Field symbols are faster (no copy overhead) and preferred for modifying data in loops.

```abap
* Work area (copy)
LOOP AT lt_data INTO ls_data.
  ls_data-status = 'X'.
  MODIFY lt_data FROM ls_data.  " Explicit write-back needed
ENDLOOP.

* Field symbol (direct access — faster)
LOOP AT lt_data ASSIGNING FIELD-SYMBOL(<ls_data>).
  <ls_data>-status = 'X'.  " Directly modifies the table
ENDLOOP.
```

*Covered in: Lesson 11*

### 7. What is FOR ALL ENTRIES and what is the critical rule?

FOR ALL ENTRIES reads database records matching entries in a driver internal table — like a batch WHERE IN clause. **Critical rule:** Always check that the driver table is NOT INITIAL before using FOR ALL ENTRIES. If the driver table is empty, SAP ignores the WHERE clause and returns ALL records from the database.

*Covered in: Lesson 15*

### 8. What is the difference between COMMIT WORK and BAPI_TRANSACTION_COMMIT?

`COMMIT WORK` is the standard ABAP statement for committing database changes. `BAPI_TRANSACTION_COMMIT` is a function module that wraps COMMIT WORK with BAPI-specific logic. After calling a BAPI, always use `BAPI_TRANSACTION_COMMIT` — it ensures all BAPI-internal update tasks are processed correctly.

*Covered in: Lessons 16 and 24*

### 9. Explain the SAP transport system.

Code is written in DEV, tested in QAS, and deployed to PRD. Changes are packaged in **transport requests** — containers holding code, table definitions, and configuration. Transports move forward only (DEV → QAS → PRD, never backward). Transport requests are managed in SE09/SE10 and imported by the Basis team.

*Covered in: Lesson 2*

### 10. What is a BAPI? How does it differ from a regular function module?

A BAPI (Business Application Programming Interface) is an SAP-standard, RFC-enabled function module with a formal interface following SAP conventions. BAPIs have a RETURN parameter (BAPIRET2) for error messages, support transaction handling (BAPI_TRANSACTION_COMMIT), and are upgrade-stable. Regular function modules don't follow these conventions.

*Covered in: Lesson 24*

### 11. What is ALV? Name two approaches.

ALV (ABAP List Viewer) is SAP's standard framework for displaying tabular data with built-in sorting, filtering, totals, and Excel export. Two approaches: **REUSE_ALV_GRID_DISPLAY** (function module, older) and **CL_SALV_TABLE** (OOP class, modern and recommended).

*Covered in: Lessons 21 and 22*

### 12. What is a selection screen?

A selection screen is a user input form displayed before a report executes. It's built with `PARAMETERS` (single values) and `SELECT-OPTIONS` (ranges/multiple values). SELECT-OPTIONS generate RANGE tables used in SELECT WHERE ... IN clauses. Input validation happens in the `AT SELECTION-SCREEN` event.

*Covered in: Lesson 18*

## Advanced Level

### 13. What is the difference between user exits, customer exits, and BADIs?

All are enhancement mechanisms to extend SAP standard code without modification. **User exits** are FORM-based (oldest, limited). **Customer exits** are function-module-based (SMOD/CMOD, more flexible). **BADIs** are OOP-based (SE18/SE19, most modern and recommended). BADIs support filters, multiple implementations, and fallback classes.

*Covered in: Lesson 29*

### 14. What is an IDoc?

An IDoc (Intermediate Document) is a standard SAP data format for asynchronous document exchange between systems. Structure: Control Record (routing metadata) + Data Records (business data in segments) + Status Records (processing audit trail). IDocs are used for EDI, ALE master data distribution, and integration with non-SAP systems via middleware.

*Covered in: Lesson 26*

### 15. What is RFC? Name the three types.

RFC (Remote Function Call) is SAP's protocol for calling function modules across systems. **sRFC** (synchronous — caller waits for response), **aRFC** (asynchronous — fire and forget), **tRFC** (transactional — guaranteed exactly-once delivery with automatic retry). tRFC requires COMMIT WORK to actually send queued calls.

*Covered in: Lesson 25*

### 16. How do you debug an ABAP program?

Set breakpoints (click in margin, `BREAK-POINT` statement, or `/h` in command field). Use F5 (step into), F6 (step over), F7 (return), F8 (continue). Inspect variables by double-clicking them. Use watchpoints to break when a value changes. View short dumps in ST22. Profile performance with SE30/SAT.

*Covered in: Lesson 28*

### 17. What is the ABAP Data Dictionary?

The Data Dictionary (SE11) is SAP's metadata layer defining all database tables, data elements, domains, structures, and table types. The hierarchy is: Domain (technical properties) → Data Element (semantic meaning) → Table Field (usage). Programs should reference dictionary types (`TYPE kunnr`) instead of raw types (`TYPE c LENGTH 10`).

*Covered in: Lesson 13*

### 18. What is BDC and when would you use it?

BDC (Batch Data Communication) simulates user transactions programmatically — filling screens and clicking buttons. Use it for data migration when no BAPI exists. Record transactions with SHDB, create a BDC program from the recording, and execute with `CALL TRANSACTION`. Always prefer BAPIs over BDC when available.

*Covered in: Lesson 27*

### 19. What are the differences between MODIFY, UPDATE, and INSERT?

`INSERT` adds a new record — fails if the primary key exists (`sy-subrc = 4`). `UPDATE` changes an existing record — fails if the key doesn't exist. `MODIFY` does both — inserts if the key doesn't exist, updates if it does (upsert). In production, prefer explicit INSERT/UPDATE over MODIFY for clarity.

*Covered in: Lesson 16*

### 20. How would you optimize a slow ABAP program?

1. Profile with SE30/SAT to find the bottleneck
2. Replace SELECT inside LOOP with FOR ALL ENTRIES or JOINs
3. Select only needed fields (no `SELECT *`)
4. Use field symbols instead of work areas in loops
5. Use SORTED or HASHED tables for frequent key lookups
6. Use buffer tables for repeatedly accessed master data
7. Minimize database roundtrips — batch operations
8. Check indexes on database tables used in WHERE clauses

*Covered across: Lessons 9, 11, 15, 28*

## Interview Tips

- **Show you've worked with real SAP systems.** Mention specific transactions (SE38, SE11, SE37, VA01) and table names (KNA1, VBAK, MARA). This proves practical experience.
- **Always mention the safety check.** When discussing FOR ALL ENTRIES, immediately say "check that the driver table is not initial." When discussing BAPIs, immediately mention BAPI_TRANSACTION_COMMIT. These show awareness of common pitfalls.
- **Know the evolution.** When asked about enhancements, explain the progression from user exits → customer exits → BADIs → Enhancement Framework. This shows depth.
- **Reference debugging.** When asked about any "how would you fix" scenario, start with "I'd check ST22 for dumps, then set a breakpoint at..." This shows you have practical debugging experience.

## Course Complete

You've completed 30 lessons covering ABAP from orientation to production-level skills. You understand the SAP ecosystem, the ABAP language, database operations, reports and ALV, integration patterns, debugging, and enhancements.

**Next steps:**
- Practice on a free SAP system (Lesson 5)
- Build a complete report with selection screen, database reads, and ALV display
- Learn Modern ABAP in our **Course 2: Modern ABAP — RAP, CDS, and ABAP Cloud**
- Apply for SAP ABAP developer positions — you have the foundation

Welcome to the SAP world. Go build something.
