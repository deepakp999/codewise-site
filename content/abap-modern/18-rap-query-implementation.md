---
title: "RAP Query — Read-Only Access Patterns"
description: "Learn the RAP query implementation type for read-only OData services, custom data sources, and analytical views."
order: 18
module: "rap-fundamentals"
module_title: "RAP Fundamentals"
tags: ["rap query", "read only", "analytical", "custom query", "abap rap"]
prev_slug: "rap-unmanaged-bo"
next_slug: "rap-validations-determinations"
---

# RAP Query — Read-Only Access Patterns

## What You'll Learn
- When to use RAP query (vs managed/unmanaged)
- Implementing a custom query class
- Handling pagination, filtering, and sorting
- Connecting to non-database sources
- TechMart's product analytics dashboard

## When to Use Query

RAP query is the right choice when:
- Data is **read-only** — no create, update, or delete
- Data comes from a **custom source** (API, calculation, aggregation)
- You need a **custom query** that CDS alone can't express
- Building **analytical dashboards** or reports

For TechMart's product analytics — aggregated sales by category, revenue trends, stock alerts — query is the perfect pattern.

## The Custom Entity

Unlike managed/unmanaged BOs that use CDS view entities, queries use **custom entities** (also called abstract entities for query):

```sql
@EndUserText.label: 'TechMart Product Analytics'
@ObjectModel.query.implementedBy: 'ABAP:ZCL_TM_PRODUCT_ANALYTICS'

DEFINE CUSTOM ENTITY ZI_TM_ProductAnalytics
{
  key Category     : abap.char(20);
      OrderCount   : abap.int4;
      TotalRevenue : abap.curr(15,2);
      AveragePrice : abap.dec(10,2);
      Currency     : abap.cuky;
}
```

The `@ObjectModel.query.implementedBy` annotation points to your ABAP class that fetches the data.

## The Query Implementation Class

```abap
CLASS zcl_tm_product_analytics DEFINITION PUBLIC FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_rap_query_provider.
ENDCLASS.

CLASS zcl_tm_product_analytics IMPLEMENTATION.
  METHOD if_rap_query_provider~select.
    " Get request details
    DATA(lv_top)  = io_request->get_paging( )->get_page_size( ).
    DATA(lv_skip) = io_request->get_paging( )->get_offset( ).
    DATA(lt_filter) = io_request->get_filter( )->get_as_ranges( ).
    DATA(lt_sort)   = io_request->get_sort_elements( ).
    
    " Fetch aggregated data
    SELECT prod~category AS Category,
           COUNT(*) AS OrderCount,
           SUM( item~quantity * item~price ) AS TotalRevenue,
           AVG( item~price ) AS AveragePrice,
           'USD' AS Currency
      FROM ztm_soitem AS item
      INNER JOIN ztm_product AS prod
        ON item~product_id = prod~product_id
      GROUP BY prod~category
      INTO TABLE @DATA(lt_result).
    
    " Apply filtering if requested
    IF lt_filter IS NOT INITIAL.
      " Apply range filters from the OData request
      LOOP AT lt_filter INTO DATA(ls_filter).
        CASE ls_filter-name.
          WHEN 'CATEGORY'.
            DELETE lt_result WHERE category NOT IN ls_filter-range.
        ENDCASE.
      ENDLOOP.
    ENDIF.
    
    " Apply sorting
    IF lt_sort IS NOT INITIAL.
      SORT lt_result BY (lt_sort[ 1 ]-element_name)
        ASCENDING.  " Simplified — production code checks order direction
    ENDIF.
    
    " Apply pagination
    IF lv_top > 0.
      DATA(lt_paged) = VALUE #( FOR i = lv_skip + 1
        WHILE i <= lv_skip + lv_top AND i <= lines( lt_result )
        ( lt_result[ i ] ) ).
      lt_result = lt_paged.
    ENDIF.
    
    " Set the response
    io_response->set_total_number_of_records( lines( lt_result ) ).
    io_response->set_data( lt_result ).
  ENDMETHOD.
ENDCLASS.
```

The class implements `if_rap_query_provider`. The `select` method receives the OData request (filters, sorting, paging) and returns data.

## Exposing the Query

Service definition and binding work exactly like managed/unmanaged:

```
define service ZSD_TM_ANALYTICS {
  expose ZI_TM_ProductAnalytics as ProductAnalytics;
}
```

Bind it to OData V4 and preview. You get a read-only Fiori list report.

## Common Mistakes

- **Using query for simple CDS aggregations** — If a CDS view with GROUP BY can express the query, use a CDS analytical query instead. Custom query is for when CDS isn't enough.
- **Ignoring pagination** — Without pagination support, large result sets cause timeouts. Always implement `get_page_size()` and `get_offset()`.
- **Not setting total count** — Fiori needs `set_total_number_of_records()` for "Showing 1-20 of 342" display.
- **Hardcoding filters** — Read filters from `io_request->get_filter()` and apply them dynamically.

## Key Takeaways

- RAP query is for read-only data from custom sources — analytics, aggregations, external APIs.
- Custom entities define the structure. A query provider class fetches the data.
- Implement `if_rap_query_provider~select` with support for filtering, sorting, and pagination.
- Expose via service definition + binding, just like managed/unmanaged BOs.
- Use CDS views when possible; custom queries when CDS isn't sufficient.

## Next Lesson

Module 3 is complete — you can build managed, unmanaged, and query RAP applications. Now let's make them production-ready. In Lesson 19, we start **Module 4: RAP Advanced Features** with **validations and determinations** — the business rules that prevent bad data and auto-calculate values.
