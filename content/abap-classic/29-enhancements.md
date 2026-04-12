---
title: "Enhancements — User Exits, BADIs, and the Enhancement Framework"
description: "Learn how to extend SAP standard code without modification: user exits, customer exits, BADIs, implicit enhancements, and the Enhancement Framework."
order: 29
module: "real-world-skills"
module_title: "Real-World Skills & Interview Prep"
tags: ["abap", "enhancements", "badi", "user exit", "customer exit", "advanced"]
prev_slug: "debugging"
next_slug: "interview-questions-abap"
---

# Enhancements — User Exits, BADIs, and the Enhancement Framework

## What You'll Learn
- Why you never modify SAP standard code
- User exits and customer exits (legacy)
- BADIs — Business Add-Ins (modern)
- The Enhancement Framework (newest)
- How to find the right enhancement point

## The Golden Rule: Never Modify Standard SAP Code

SAP delivers millions of lines of standard code. When you upgrade SAP, all this code is replaced with the new version. If you modified standard code, your changes are overwritten. If you skip the modification during upgrade, you miss SAP's bug fixes and new features.

**Enhancements solve this:** They provide predefined hook points in standard code where you can insert your custom logic — without touching SAP's code. When SAP upgrades, your enhancements survive.

## Evolution of SAP Enhancements

```
1990s     User Exits (FORM-based, very limited)
1990s-00s Customer Exits (function module-based)
2000s     BADIs (object-oriented, flexible)
2006+     Enhancement Framework (implicit enhancements, BAdI new)
```

Each generation improved on the previous. You'll encounter all of them in existing SAP systems.

## Customer Exits

Customer exits are empty function modules that SAP calls at specific points in standard transactions. You fill in the code:

### Finding Customer Exits

```abap
* Method 1: Search for exits in the transaction's package
* Go to the transaction (e.g., VA01 - Create Sales Order)
* System → Status → note the Program Name
* In SE38, search the program for 'CALL CUSTOMER'

* Method 2: Use transaction SMOD/CMOD
* SMOD — browse available exits by component
* CMOD — create a project to activate exits
```

### Example: Sales Order Exit

The exit `USEREXIT_SAVE_DOCUMENT_PREPARE` in include `MV45AFZZ` is called before a sales order is saved:

```abap
FORM userexit_save_document_prepare.
  " This is called before every sales order save in VA01/VA02
  
  " Example: Validate that all items have a delivery date
  LOOP AT xvbap INTO DATA(ls_item).
    IF ls_item-edatu IS INITIAL.
      MESSAGE 'All items must have a delivery date' TYPE 'E'.
    ENDIF.
  ENDLOOP.
ENDFORM.
```

Customer exits are simple but limited — SAP provides a fixed set of exit points, and you can't add new ones.

## BADIs — Business Add-Ins

BADIs are the modern replacement for customer exits. They use OOP (interfaces and classes) and are more flexible:

### Finding BADIs

```abap
* Method 1: Search in standard code for GET BADI / CALL BADI
* In the debugger, set a breakpoint on CL_EXITHANDLER=>GET_INSTANCE

* Method 2: Use transaction SE18 (BADI Definition) / SE19 (BADI Implementation)
* Search by application component or name

* Method 3: In the debugger
* Set a breakpoint at the beginning of the transaction
* Search the code for 'GET BADI' or 'cl_exithandler'
```

### Implementing a BADI

1. Find the BADI name (e.g., `BADI_SD_SALES`)
2. Go to SE19 (BADI Implementation)
3. Create a new implementation
4. Write your code in the interface methods

```abap
CLASS lcl_badi_impl DEFINITION.
  PUBLIC SECTION.
    INTERFACES: if_ex_badi_sd_sales.
ENDCLASS.

CLASS lcl_badi_impl IMPLEMENTATION.
  METHOD if_ex_badi_sd_sales~save_document.
    " Custom logic before sales order save
    " Same concept as the user exit, but OOP
    LOOP AT ct_items ASSIGNING FIELD-SYMBOL(<ls_item>).
      IF <ls_item>-delivery_date IS INITIAL.
        " Set error
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

### New BADIs (Enhancement Framework)

Since NW 7.0, SAP introduced "new BADIs" with improved features:

```abap
* Finding new BADIs
* Search standard code for: GET BADI lo_badi TYPE badi_name
* Then: CALL BADI lo_badi->method_name

* Implementing via SE19:
* 1. Enter the Enhancement Spot name
* 2. Create Implementation
* 3. Write your code in the provided class
```

New BADIs support filters (execute only for certain company codes), fallback implementations, and multiple implementations.

## Enhancement Framework — Implicit Enhancements

The Enhancement Framework allows you to add code at specific points in ANY standard program — even where SAP didn't provide explicit exit points:

### Implicit Enhancement Points

SAP automatically provides enhancement points at:
- Beginning and end of every program/include
- Beginning and end of every FORM routine
- Beginning and end of every function module/method
- After certain ABAP statements

```abap
* To use an implicit enhancement:
* 1. Open the standard program in SE38 (display mode)
* 2. Edit → Enhancement Operations → Show Implicit Enhancement Options
* 3. Right-click on a green enhancement point
* 4. Create Enhancement Implementation
* 5. Write your code
```

### Explicit Enhancement Points and Sections

SAP also provides explicit enhancement points in strategic locations:

```abap
* In standard SAP code, you'll see:
ENHANCEMENT-POINT ep_name SPOTS spot_name.   " Insert code here
ENHANCEMENT-SECTION es_name SPOTS spot_name.  " Replace code here
  " Standard code that can be replaced
END-ENHANCEMENT-SECTION.
```

Enhancement points let you INSERT code. Enhancement sections let you REPLACE code.

## Finding the Right Enhancement

Step-by-step approach:

1. **Start with the transaction.** What transaction are you enhancing? (VA01, ME21N, etc.)
2. **Find the program.** System → Status shows the main program.
3. **Debug to find the location.** Set breakpoints, step through, find where your logic should go.
4. **Search for existing BADIs.** Look for `GET BADI` or `CALL BADI` near your target location.
5. **Check customer exits.** Search for `CALL CUSTOMER-FUNCTION` in the program.
6. **Use implicit enhancements** as a last resort if no BADI or exit exists.

## Enhancement Hierarchy — What to Prefer

```
Priority    Type                      Pros                        Cons
─────────   ────────────────────     ──────────────────          ──────────────
1st         New BADI (SE18/SE19)     OOP, filtered, upgrade-safe  May not exist everywhere
2nd         Classic BADI              OOP, widely available        Older interface
3rd         Customer Exit (CMOD)      Simple, stable               Limited locations
4th         Implicit Enhancement      Works anywhere               Can be fragile across upgrades
5th         Modification (NEVER)      Full flexibility             Breaks on upgrade
```

## Common Mistakes

- **Modifying standard code instead of using enhancements.** This is the cardinal sin of SAP development. Modifications are overwritten during upgrades and require manual conflict resolution. Always use enhancements.
- **Not checking if a BADI exists before using implicit enhancements.** Implicit enhancements work but are more fragile. If SAP provides a BADI at the same location, use the BADI — it's the supported extension point.
- **Putting too much logic in an enhancement.** Enhancements should call your custom class or function module — keep the enhancement itself thin. This makes testing and debugging easier.
- **Not documenting your enhancements.** Future developers (including future you) need to know why an enhancement exists. Add clear comments explaining the business requirement.

## Key Takeaways

- Never modify standard SAP code — use enhancements instead.
- BADIs (SE18/SE19) are the modern, preferred enhancement mechanism.
- Customer exits (SMOD/CMOD) are older but still widely used — you'll maintain many existing ones.
- The Enhancement Framework provides implicit enhancement points in every program — use as a last resort.
- Finding the right enhancement point requires debugging the standard transaction.
- Keep enhancement code thin — delegate to your own classes and function modules.

## Next Lesson

You've learned ABAP from orientation to production-level skills. In **Lesson 30: Top 20 ABAP Interview Questions**, we'll cover the questions you'll face when interviewing for SAP ABAP developer roles — with code examples and detailed answers.
