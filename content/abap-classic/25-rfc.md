---
title: "RFC — Remote Function Calls"
description: "Understand how SAP systems communicate via RFC: synchronous, asynchronous, transactional RFC, destinations in SM59, and cross-system data exchange."
order: 25
module: "integration"
module_title: "Integration & Communication"
tags: ["abap", "rfc", "remote function call", "sm59", "integration", "intermediate"]
prev_slug: "bapis"
next_slug: "idocs"
---

# RFC — Remote Function Calls

## What You'll Learn
- What RFC is and why it's SAP's primary integration mechanism
- The three RFC types: synchronous, asynchronous, and transactional
- RFC destinations in SM59
- Calling remote function modules from ABAP
- Error handling for remote calls

## What Is RFC?

RFC (Remote Function Call) is SAP's protocol for calling function modules on remote systems. It's how SAP systems talk to each other and how external programs call into SAP.

```
System A (Development)                    System B (Production)
┌───────────────────┐                    ┌───────────────────┐
│ CALL FUNCTION      │  ── RFC call ──>  │ Z_GET_CUSTOMER    │
│  'Z_GET_CUSTOMER'  │                    │   (executes here) │
│  DESTINATION 'PRD' │  <── response ──  │   (returns data)  │
└───────────────────┘                    └───────────────────┘
```

For a function module to be called via RFC, it must be marked as **Remote-Enabled** in SE37.

## RFC Destinations (SM59)

RFC destinations are configured in transaction SM59. They define where a remote call goes:

```
Destination Name    Type    Target System       Description
────────────────    ─────   ──────────────     ──────────────────
RFC_PRODUCTION      3       PRD (SAP system)    Production system
RFC_QUALITY         3       QAS (SAP system)    Quality system
RFC_CRM             3       CRM (SAP system)    CRM system
SAPHTTP_DEST        G       https://api.com     HTTP connection
```

**Connection Type 3** = ABAP-to-ABAP (SAP system to SAP system)
**Connection Type G** = HTTP/HTTPS (SAP to external web service)

You typically don't create RFC destinations — the Basis team does. But you need to know the destination name to use in your code.

## Synchronous RFC (sRFC)

The caller waits for the remote function to complete and return results:

```abap
DATA: lt_customers TYPE TABLE OF bapicustomer_kna1,
      lt_return    TYPE TABLE OF bapiret2.

CALL FUNCTION 'BAPI_CUSTOMER_GETLIST'
  DESTINATION 'RFC_PRODUCTION'
  EXPORTING
    maxrows = 100
  TABLES
    addressdata = lt_customers
    return      = lt_return
  EXCEPTIONS
    communication_failure = 1  MESSAGE DATA(lv_comm_error)
    system_failure        = 2  MESSAGE DATA(lv_sys_error)
    OTHERS                = 3.

CASE sy-subrc.
  WHEN 0.
    WRITE: / |Retrieved { lines( lt_customers ) } customers from production|.
  WHEN 1.
    WRITE: / |Communication error: { lv_comm_error }|.
  WHEN 2.
    WRITE: / |System error: { lv_sys_error }|.
ENDCASE.
```

The `MESSAGE` addition captures the error text from the remote system — essential for debugging.

## Asynchronous RFC (aRFC)

The caller doesn't wait — the remote function runs in the background:

```abap
CALL FUNCTION 'Z_SEND_NOTIFICATION'
  STARTING NEW TASK 'NOTIFY_TASK'
  DESTINATION 'RFC_CRM'
  EXPORTING
    iv_customer = '0000001001'
    iv_message  = 'Order shipped'.

WRITE: / 'Notification sent asynchronously'.
```

aRFC is used when you don't need the result immediately — for example, sending notifications, triggering background processes, or parallel processing.

## Transactional RFC (tRFC)

Guarantees exactly-once delivery — if the remote system is down, SAP retries automatically:

```abap
CALL FUNCTION 'Z_UPDATE_REMOTE_STATUS'
  IN BACKGROUND TASK
  DESTINATION 'RFC_PRODUCTION'
  EXPORTING
    iv_order_id = '0000100001'
    iv_status   = 'SHIPPED'.

COMMIT WORK.  " Required — sends all queued tRFC calls
```

`IN BACKGROUND TASK` queues the call. `COMMIT WORK` sends it. If the remote system is temporarily unavailable, SAP stores the call and retries. You can monitor pending tRFC calls in transaction SM58.

## Testing RFC Connections

```abap
* Test if an RFC destination is reachable
CALL FUNCTION 'RFC_PING'
  DESTINATION 'RFC_PRODUCTION'
  EXCEPTIONS
    communication_failure = 1
    system_failure        = 2.

IF sy-subrc = 0.
  WRITE: / 'Connection to production is working'.
ELSE.
  WRITE: / 'Connection failed'.
ENDIF.
```

You can also test connections in SM59 by selecting a destination and clicking "Connection Test."

## Common Mistakes

- **Not handling communication_failure and system_failure.** Remote calls can fail because the network is down, the remote system is offline, or credentials are wrong. Always handle these exceptions — without them, your program crashes with a short dump.
- **Forgetting COMMIT WORK after tRFC calls.** `IN BACKGROUND TASK` queues the call but doesn't send it. `COMMIT WORK` triggers the actual send. Without it, queued calls are lost.
- **Assuming the same performance as local calls.** RFC calls go over the network — they're 10-100x slower than local function calls. Don't put RFC calls inside loops. Batch data and make one RFC call with a table parameter.
- **Hardcoding destination names.** Store destination names in a configuration table, not in code. Destinations differ between development and production systems.

## Key Takeaways

- RFC is SAP's protocol for cross-system function calls — ABAP-to-ABAP or ABAP-to-external.
- sRFC (synchronous) = wait for result. aRFC (asynchronous) = fire and forget. tRFC (transactional) = guaranteed delivery.
- RFC destinations are configured in SM59. Always handle `communication_failure` and `system_failure` exceptions.
- tRFC requires COMMIT WORK to actually send the queued calls.
- Never put RFC calls in loops — batch your data and make one call.

## Next Lesson

RFC calls function modules directly. For document-based integration (especially with non-SAP systems), SAP uses **IDocs**. In **Lesson 26: IDocs — Intermediate Documents**, we'll learn SAP's standard format for electronic data interchange.
