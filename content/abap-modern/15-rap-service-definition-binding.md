---
title: "Service Definition and Service Binding — Exposing Your RAP App"
description: "Learn how to create OData services from RAP business objects, bind them to OData V2 or V4, and preview your app in Fiori Elements."
order: 15
module: "rap-fundamentals"
module_title: "RAP Fundamentals"
tags: ["service definition", "service binding", "odata", "fiori preview", "rap"]
prev_slug: "rap-managed-bo"
next_slug: "rap-eml"
---

# Service Definition and Service Binding

## What You'll Learn
- What service definitions and service bindings are
- Creating an OData V4 service for TechMart's Sales Order
- Testing with Fiori Elements preview
- The difference between OData V2 and V4
- How annotations drive the generated UI

## Service Definition — What to Expose

The service definition lists which entities from your projection are available via OData:

In ADT: Right-click package → **New → Service Definition**

```
@EndUserText.label: 'TechMart Sales Order Service'
define service ZSD_TM_SALESORDER {
  expose ZC_TM_SalesOrder as SalesOrder;
  expose ZC_TM_SalesOrderItem as SalesOrderItem;
  expose ZI_TM_Customer as Customer;
  expose ZI_TM_Product as Product;
}
```

You expose projection views (for transactional entities) and interface views (for reference data like Customer and Product). The `as` alias becomes the entity set name in OData.

## Service Binding — How to Expose

The service binding connects the definition to a protocol:

In ADT: Right-click package → **New → Service Binding**

- Name: `ZSB_TM_SALESORDER_V4`
- Binding Type: **OData V4 - UI**
- Service Definition: `ZSD_TM_SALESORDER`

After activation, click **Publish** in the service binding editor. This registers the OData service.

Then click **Preview** next to the `SalesOrder` entity set. ADT launches a browser with a fully functional Fiori Elements list report + object page — generated entirely from your CDS annotations.

### Expected Output (Fiori Preview)

```
┌─────────────────────────────────────────────────────┐
│  Sales Orders                          [Create] [⋮]  │
├─────────────────────────────────────────────────────┤
│  Filters: [Customer ID ▾] [Status ▾]    [Go]  [▾]  │
├──────┬──────────┬────────┬───────────┬──────────────┤
│ ID   │ Customer │ Date   │ Status    │ Total Amount │
├──────┼──────────┼────────┼───────────┼──────────────┤
│ 1001 │ CUST-42  │ Jan 15 │ New       │ 5,499.99 USD │
│ 1002 │ CUST-07  │ Mar 20 │ Completed │ 24,000.00 USD│
└──────┴──────────┴────────┴───────────┴──────────────┘
```

You can create, edit, and delete orders right from this preview. No frontend code written.

## OData V2 vs V4

| Feature | OData V2 | OData V4 |
|---|---|---|
| Draft support | Yes | Yes |
| Deep insert (parent+child) | Limited | Full support |
| Batch requests | Yes | Enhanced |
| Fiori Elements support | Full | Full |
| When to use | Legacy apps, integration | New apps (recommended) |

**Default to OData V4** for all new development.

## Common Mistakes

- **Exposing interface views for transactional entities** — Expose projection views (`ZC_`) for entities with CRUD. Interface views (`ZI_`) can be exposed for read-only reference data.
- **Forgetting to Publish** — Activating the service binding is not enough. You must click **Publish** to register the OData service.
- **Missing UI annotations** — The Fiori preview generates UI from annotations. If your fields have no `@UI.lineItem`, the list is empty.
- **Wrong binding type** — Use "OData V4 - UI" for Fiori apps. "OData V4 - Web API" is for programmatic consumption without UI.

## Key Takeaways

- Service definition lists WHICH entities to expose. Service binding defines HOW (OData V2/V4).
- Fiori Elements preview generates a complete UI from CDS annotations — no frontend code.
- Default to OData V4 for new apps.
- Publish the service binding after activation.
- The Fiori preview is your primary testing tool during RAP development.

## Next Lesson

The Fiori preview lets users interact with data through the UI. But sometimes you need to manipulate business objects programmatically — in background jobs, integrations, or custom logic. In Lesson 16, we'll learn **EML (Entity Manipulation Language)** — the ABAP way to read, create, update, and delete RAP business objects from code.
