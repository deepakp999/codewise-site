---
title: "IDocs — Intermediate Documents for EDI"
description: "Understand SAP IDocs: structure, message types, segments, partner profiles, and how IDocs enable data exchange between SAP and external systems."
order: 26
module: "integration"
module_title: "Integration & Communication"
tags: ["abap", "idoc", "edi", "integration", "ale", "intermediate"]
prev_slug: "rfc"
next_slug: "bdc-lsmw"
---

# IDocs — Intermediate Documents for EDI

## What You'll Learn
- What IDocs are and when they're used
- IDoc structure: control record, data records, status records
- Message types and IDoc types
- Sending and receiving IDocs
- Monitoring IDocs in WE02/WE05/BD87

## What Is an IDoc?

An IDoc (Intermediate Document) is a standard SAP data container used for asynchronous data exchange between systems. Think of it as a structured XML/JSON message — but in SAP's proprietary format, predating both XML and JSON by a decade.

```
System A (SAP)              Middleware           System B (any system)
┌──────────────┐           ┌──────────┐         ┌──────────────┐
│ Create Order  │ → IDoc → │ SAP PI/  │ → EDI → │ Warehouse    │
│ in SAP        │          │ PO/CPI   │         │ Management   │
└──────────────┘           └──────────┘         └──────────────┘
```

**When to use IDocs:**
- EDI (Electronic Data Interchange) with trading partners
- Master data distribution across SAP systems (ALE)
- Integration with non-SAP systems via middleware
- Asynchronous, document-based data exchange

**When NOT to use IDocs:**
- Real-time synchronous communication (use RFC instead)
- Simple data lookups (use BAPIs)
- Modern API integration (use OData/REST APIs in S/4HANA)

## IDoc Structure

Every IDoc has three parts:

```
┌─────────────────────────────────────┐
│ CONTROL RECORD (EDIDC)              │ ← Metadata: sender, receiver, message type
├─────────────────────────────────────┤
│ DATA RECORDS (EDIDD)                │ ← Actual business data in segments
│  ├── Header Segment (E1EDK01)       │
│  ├── Item Segment (E1EDP01)         │
│  │   ├── Schedule Segment (E1EDS01) │
│  │   └── Text Segment (E1EDPT1)    │
│  └── Partner Segment (E1EDKA1)      │
├─────────────────────────────────────┤
│ STATUS RECORDS (EDIDS)              │ ← Processing history: created, sent, received, error
└─────────────────────────────────────┘
```

### Control Record
Contains routing information: who sent it, who receives it, what type of message it is, when it was created.

### Data Records (Segments)
The actual business data, organized in hierarchical segments. Like XML elements — a purchase order has header segments containing item segments containing schedule segments.

### Status Records
An audit trail of everything that happened to the IDoc: created (status 30), sent to port (status 03), received by partner (status 12), processed successfully (status 53), or error (status 51).

## Key IDoc Concepts

### Message Type vs IDoc Type

```
Message Type    What business process        IDoc Type          Segments
────────────    ────────────────────         ──────────         ─────────
ORDERS          Purchase Order send          ORDERS05           E1EDK01, E1EDP01, ...
DESADV          Delivery notification        DELVRY07           E1EDL20, E1EDL24, ...
INVOIC          Invoice                      INVOIC02           E1EDK01, E1EDP01, ...
MATMAS          Material Master              MATMAS05           E1MARAM, E1MAKTM, ...
DEBMAS          Customer Master              DEBMAS07           E1KNA1M, E1KNB1M, ...
```

**Message Type** = what business document (order, invoice, material). **IDoc Type** = the technical format (which segments, which fields).

## Monitoring IDocs

```
Transaction    Purpose
───────────    ──────────────────────────────────
WE02           Display IDoc (view content and status)
WE05           IDoc list (search by date, status, type)
BD87           Process IDocs (reprocess errors)
WE19           Test tool (create test IDocs manually)
WE20           Partner profiles (routing configuration)
WE30           IDoc type definition
WE31           Segment definition
```

### IDoc Status Codes to Know

```
Status    Direction    Meaning
──────    ─────────    ────────────────────────
01        Outbound     IDoc generated
03        Outbound     Data passed to port
30        Outbound     IDoc ready to be sent
53        Inbound      IDoc posted successfully
51        Inbound      Error — application document not posted
56        Inbound      IDoc with errors — added correctly
64        Inbound      IDoc ready to be passed to application
```

**Status 51 is your debugging friend.** When an inbound IDoc fails, status 51 tells you the processing failed. Open the IDoc in WE02 to see the error message, then use BD87 to reprocess after fixing the issue.

## Creating an Outbound IDoc (Simplified)

```abap
DATA: ls_control  TYPE edidc,
      lt_data     TYPE TABLE OF edidd,
      ls_data     TYPE edidd,
      ls_e1kna1m  TYPE e1kna1m.

* Control record
ls_control-mestyp = 'DEBMAS'.         " Message type
ls_control-idoctp = 'DEBMAS07'.       " IDoc type
ls_control-rcvprt = 'LS'.             " Receiver partner type
ls_control-rcvprn = 'EXTERNAL_SYS'.   " Receiver partner

* Fill a segment with customer data
ls_e1kna1m-kunnr = '0000001001'.
ls_e1kna1m-name1 = 'Acme Corporation'.
ls_e1kna1m-land1 = 'US'.

ls_data-segnam = 'E1KNA1M'.          " Segment name
ls_data-sdata  = ls_e1kna1m.         " Segment data
APPEND ls_data TO lt_data.

* Send the IDoc
CALL FUNCTION 'MASTER_IDOC_DISTRIBUTE'
  EXPORTING
    master_idoc_control = ls_control
  TABLES
    communication_idoc_control = DATA(lt_comm_control)
    master_idoc_data           = lt_data
  EXCEPTIONS
    OTHERS = 1.

IF sy-subrc = 0.
  COMMIT WORK.
  WRITE: / 'IDoc created successfully'.
ENDIF.
```

## Common Mistakes

- **Not calling COMMIT WORK after IDoc creation.** Like BAPIs, IDocs need an explicit commit to be persisted and sent.
- **Not checking IDoc status after sending.** Creating an IDoc doesn't mean it was delivered. Monitor in WE05 for status 03 (sent) or errors.
- **Trying to use IDocs for real-time integration.** IDocs are asynchronous — there's no guarantee when the receiver processes them. For real-time needs, use RFC or OData.
- **Ignoring partner profile configuration.** IDocs need proper partner profiles in WE20 to know where to send data. Missing configuration causes IDocs to sit in status 30 forever.

## Key Takeaways

- IDocs are SAP's standard format for asynchronous, document-based data exchange.
- Structure: Control Record (routing) + Data Records (business data in segments) + Status Records (audit trail).
- Message Type = business process, IDoc Type = technical format.
- Monitor IDocs in WE05, debug errors in WE02, reprocess in BD87.
- Status 53 = success, Status 51 = error. Status 51 IDocs can be reprocessed after fixing.
- IDocs are asynchronous — use RFC for real-time, IDocs for batch/document exchange.

## Next Lesson

IDocs handle system-to-system integration. But what about migrating legacy data into SAP? In **Lesson 27: BDC and LSMW — Data Migration**, we'll learn how to load data into SAP by simulating user transactions.
