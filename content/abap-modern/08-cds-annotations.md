---
title: "CDS Annotations — UI, Search, OData, and Metadata Extensions"
description: "Learn how CDS annotations control Fiori UI layout, search behavior, OData exposure, and how metadata extensions keep views clean."
order: 8
module: "cds-views"
module_title: "CDS Views"
tags: ["cds annotations", "ui annotations", "metadata extensions", "fiori elements", "odata"]
prev_slug: "cds-joins-and-associations"
next_slug: "cds-calculated-fields-and-expressions"
---

# Annotations — UI, Search, OData, and Metadata Extensions

## What You'll Learn
- What annotations are and why they're unique to CDS
- @UI annotations for Fiori Elements layout
- @Search annotations for full-text search
- @OData annotations for service behavior
- Metadata extensions — separating UI concerns from data models

## What Are Annotations?

Annotations are metadata that you attach to CDS views and fields. They don't change the data — they tell consumers (Fiori, OData, analytics) **how** to use the data.

Think of annotations like labels on a shipping box. The box content (data) doesn't change, but the labels tell the handler: "Fragile" (display as read-only), "This Side Up" (show in this position on the UI), "Express" (searchable, high priority).

In Classic ABAP, you'd control UI layout in dynpro screen painter or ALV field catalog. In modern ABAP, annotations do this declaratively — no code needed.

## @UI Annotations — Controlling Fiori Layout

```sql
DEFINE VIEW ENTITY ZI_TM_Product
  AS SELECT FROM ztm_product
{
      @UI.facet: [{ id: 'ProductInfo',
                    type: #IDENTIFICATION_REFERENCE,
                    label: 'Product Details',
                    position: 10 }]
                    
  key @UI: { lineItem:       [{ position: 10, importance: #HIGH }],
             identification: [{ position: 10 }],
             selectionField: [{ position: 10 }] }
      product_id AS ProductId,
      
      @UI: { lineItem:       [{ position: 20, importance: #HIGH }],
             identification: [{ position: 20 }] }
      name AS ProductName,
      
      @UI: { lineItem:       [{ position: 30 }],
             selectionField: [{ position: 20 }] }
      category AS Category,
      
      @UI: { lineItem:       [{ position: 40, importance: #MEDIUM }],
             identification: [{ position: 40 }] }
      price AS Price,
      
      @UI.hidden: true
      created_by AS CreatedBy
}
```

What each annotation does:

| Annotation | Effect |
|---|---|
| `@UI.lineItem` | Show this field as a column in the list view |
| `@UI.identification` | Show this field on the object detail page |
| `@UI.selectionField` | Add this field as a filter on the search bar |
| `@UI.hidden` | Don't show this field in the UI |
| `position` | Order of the field (10, 20, 30...) |
| `importance` | `#HIGH` always visible, `#MEDIUM` visible on larger screens, `#LOW` hidden on small screens |

**This single CDS view generates a complete Fiori Elements list report + object page — no frontend code needed.** The Fiori framework reads these annotations and builds the UI automatically.

## @Search Annotations

```sql
@Search.searchable: true

DEFINE VIEW ENTITY ZI_TM_Product AS SELECT FROM ztm_product
{
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      name AS ProductName,
      
      @Search.defaultSearchElement: true
      category AS Category,
      
      product_id AS ProductId
}
```

This enables fuzzy search in Fiori apps. A user typing "widgt" in the search bar will find "Widget Pro" because the fuzziness threshold allows approximate matches.

## Metadata Extensions — Keep Views Clean

Putting dozens of UI annotations directly in a CDS view makes it hard to read. **Metadata extensions** separate UI concerns from data modeling:

```sql
" Step 1: The CDS view stays clean — data only
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'TechMart Product'
@Metadata.allowExtensions: true   -- THIS enables metadata extensions

DEFINE VIEW ENTITY ZI_TM_Product
  AS SELECT FROM ztm_product
{
  key product_id     AS ProductId,
      name           AS ProductName,
      category       AS Category,
      price          AS Price,
      currency       AS Currency,
      stock_quantity AS StockQuantity
}
```

```sql
" Step 2: A separate metadata extension handles UI annotations
@Metadata.layer: #CORE

ANNOTATE VIEW ENTITY ZI_TM_Product WITH
{
  @UI.facet: [{ id: 'ProductInfo',
                type: #IDENTIFICATION_REFERENCE,
                label: 'Product Details',
                position: 10 }]

  @UI: { lineItem:       [{ position: 10, importance: #HIGH }],
         identification: [{ position: 10 }],
         selectionField: [{ position: 10 }] }
  ProductId;
  
  @UI: { lineItem:       [{ position: 20, importance: #HIGH }],
         identification: [{ position: 20 }] }
  ProductName;
  
  @UI: { lineItem:       [{ position: 30 }],
         selectionField: [{ position: 20 }] }
  Category;
  
  @UI: { lineItem:       [{ position: 40 }],
         identification: [{ position: 40 }] }
  Price;
}
```

**Best practice:** Always use metadata extensions for UI annotations. Keep the CDS view entity focused on data modeling. This separation is a Clean Core principle.

## Common Mistakes

- **Embedding UI annotations directly in interface views** — Use metadata extensions instead. Interface views (`ZI_`) should be pure data models.
- **Forgetting `@Metadata.allowExtensions: true`** — Without this, you can't create metadata extensions for the view.
- **Wrong position numbering** — Use increments of 10 (10, 20, 30) so you can insert fields later without renumbering.
- **Overannotating** — Not every field needs to be on every UI facet. Show only what users need.
- **Ignoring `importance`** — On mobile devices, only `#HIGH` importance fields show. If your key fields are `#LOW`, mobile users see an empty list.

## Key Takeaways

- Annotations are metadata that control how CDS data is consumed — by Fiori, OData, analytics, and search.
- @UI annotations generate complete Fiori Elements UIs without frontend code. `lineItem` = list columns, `identification` = detail page, `selectionField` = search filters.
- @Search annotations enable fuzzy full-text search in Fiori apps.
- Metadata extensions separate UI concerns from data models — always use them for UI annotations.
- Annotations are declarative — you describe WHAT you want, not HOW to build it.

## Next Lesson

Fields straight from the database aren't always enough. In Lesson 9, we'll add **calculated fields, CASE expressions, CAST, and SQL functions** — transforming raw TechMart data into business-meaningful values directly in CDS.
