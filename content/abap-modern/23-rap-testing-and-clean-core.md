---
title: "Testing RAP Apps and Clean Core Compliance"
description: "Learn to write ABAP Unit tests for RAP business objects, use test doubles for isolation, and run ATC checks for clean core compliance."
order: 23
module: "real-world-patterns"
module_title: "Real-World Patterns & Next Steps"
tags: ["rap testing", "abap unit", "test doubles", "atc", "clean core"]
prev_slug: "rap-feature-control"
next_slug: "rap-extensibility"
---

# Testing RAP Apps and Clean Core Compliance

## What You'll Learn
- ABAP Unit testing for RAP business objects
- Using RAP test doubles (mock framework)
- Test structure: given → when → then
- Running ATC checks for clean core
- TechMart's testing strategy

## Why Test RAP?

In Classic ABAP, testing was often manual — run the transaction, enter data, check the output. That worked when systems were simple. TechMart's Sales Order BO has validations, determinations, actions, draft, and feature control. Manual testing every combination after every change would take days.

ABAP Unit tests run in seconds, catch regressions immediately, and document expected behavior.

## Testing a Validation

Let's test `validateCustomer` — it should reject orders with empty or non-existent customer IDs.

```abap
CLASS ltcl_salesorder_validation DEFINITION FINAL
  FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    CLASS-DATA environment TYPE REF TO if_cds_test_environment.
    DATA cut TYPE REF TO lhc_salesorder.  " Class under test

    CLASS-METHODS class_setup.
    CLASS-METHODS class_teardown.
    METHODS setup.
    
    METHODS validate_empty_customer FOR TESTING.
    METHODS validate_valid_customer FOR TESTING.
    METHODS validate_invalid_customer FOR TESTING.
ENDCLASS.

CLASS ltcl_salesorder_validation IMPLEMENTATION.
  METHOD class_setup.
    " Create test doubles for CDS views
    environment = cl_cds_test_environment=>create(
      i_for_entity = 'ZI_TM_SALESORDER' ).
  ENDMETHOD.

  METHOD class_teardown.
    environment->destroy( ).
  ENDMETHOD.

  METHOD setup.
    environment->clear_doubles( ).
  ENDMETHOD.

  METHOD validate_empty_customer.
    " GIVEN: An order with empty customer ID
    DATA(lt_mock_data) = VALUE #( (
      order_uuid  = cl_system_uuid=>create_uuid_x16_static( )
      customer_id = ''
      status      = 'N'
    ) ).
    environment->insert_test_data( lt_mock_data ).

    " WHEN: Validation runs
    " (Call the validation method with test keys)

    " THEN: Should fail with error message
    " Assert failed-salesorder is not initial
    " Assert reported message contains 'Customer ID is required'
  ENDMETHOD.

  METHOD validate_valid_customer.
    " GIVEN: An order with valid customer ID
    " Insert mock customer + mock order

    " WHEN: Validation runs

    " THEN: No failures
  ENDMETHOD.

  METHOD validate_invalid_customer.
    " GIVEN: An order with non-existent customer ID

    " WHEN: Validation runs

    " THEN: Should fail with 'does not exist' message
  ENDMETHOD.
ENDCLASS.
```

The structure is always: **Given** (set up test data) → **When** (execute the operation) → **Then** (assert the result).

## RAP BO Test Environment

For integration-level testing of RAP BOs, use the BO test environment:

```abap
CLASS ltcl_salesorder_integration DEFINITION FINAL
  FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    CLASS-DATA bo_test_env TYPE REF TO if_botd_txn_buf_test_env.
    
    CLASS-METHODS class_setup.
    METHODS test_create_order FOR TESTING.
    METHODS test_approve_action FOR TESTING.
ENDCLASS.

CLASS ltcl_salesorder_integration IMPLEMENTATION.
  METHOD class_setup.
    bo_test_env = cl_botd_txn_buf_test_env=>create(
      VALUE #( ( 'ZI_TM_SALESORDER' ) ) ).
  ENDMETHOD.

  METHOD test_create_order.
    " Create an order via EML
    MODIFY ENTITIES OF ZI_TM_SalesOrder
      ENTITY SalesOrder
        CREATE FIELDS ( CustomerId OrderDate Status )
        WITH VALUE #( (
          %cid       = 'test_order'
          CustomerId = 'CUST-TEST'
          OrderDate  = '20260412'
          Status     = 'N'
        ) )
      MAPPED DATA(ls_mapped)
      FAILED DATA(ls_failed)
      REPORTED DATA(ls_reported).

    " Assert creation succeeded
    cl_abap_unit_assert=>assert_initial( ls_failed ).
    cl_abap_unit_assert=>assert_not_initial( ls_mapped-salesorder ).
  ENDMETHOD.

  METHOD test_approve_action.
    " Create + approve, then verify status changed
    " ...
  ENDMETHOD.
ENDCLASS.
```

## Running ATC for Clean Core

The ABAP Test Cockpit validates your code is cloud-ready:

1. In ADT: Right-click your package → **Run As → ABAP Test Cockpit With...**
2. Select check variant: **ABAP_CLOUD_DEVELOPMENT**
3. Review findings

ATC checks for:
- Use of unreleased APIs
- Obsolete syntax
- Missing exception handling
- Clean ABAP style violations

**Target: zero Priority 1 and 2 findings.** Priority 3 findings are warnings — fix them when practical.

```
ATC Results:
  ✓ zbp_i_tm_salesorder      — No findings
  ✓ ZI_TM_SalesOrder         — No findings
  ⚠ zcl_tm_product_analytics — P3: Consider using FINAL() instead of DATA()
  ✗ zcl_tm_legacy_helper     — P1: Use of unreleased API: BAPI_CUSTOMER_GETLIST
```

Fix P1 findings immediately. They block cloud deployment.

## TechMart's Testing Strategy

| What to Test | Test Type | Priority |
|---|---|---|
| Validations | Unit test per validation method | High |
| Determinations | Unit test per determination | High |
| Actions | Integration test via EML | High |
| Feature control | Integration test — check returned controls | Medium |
| Draft lifecycle | Integration test — create → edit → activate | Medium |
| CDS view correctness | CDS test environment | Low (views are declarative) |

**Rule of thumb:** Test every validation and every action. These contain your business logic. CDS views and behavior definitions are declarative — they're less likely to have bugs.

## Common Mistakes

- **Not using test doubles** — Testing against real database tables makes tests slow and fragile. Always use `cl_cds_test_environment` or `cl_botd_txn_buf_test_env`.
- **Testing framework behavior** — Don't test that CRUD works (the framework handles it). Test YOUR code — validations, determinations, actions.
- **Ignoring ATC P1 findings** — Priority 1 findings mean your code won't run in ABAP Cloud. Fix them immediately.
- **Testing only happy paths** — Test error cases too: empty fields, invalid references, wrong status transitions.

## Key Takeaways

- ABAP Unit tests validate your business logic (validations, determinations, actions) automatically.
- Use RAP test doubles to isolate tests from the database and other dependencies.
- ATC with ABAP_CLOUD_DEVELOPMENT check variant ensures clean core compliance.
- Test structure: Given (set up) → When (execute) → Then (assert).
- Target zero P1/P2 ATC findings. Priority 3 findings are style improvements.

## Next Lesson

TechMart acquires a company and needs to extend the Sales Order app with new fields — without modifying the original code. In Lesson 24, we'll learn **extensibility** — BADIs, side-by-side extensions, and BTP integration.
