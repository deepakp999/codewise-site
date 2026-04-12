---
title: "Setting Up ADT (Eclipse) for ABAP Cloud Development"
description: "Step-by-step guide to install Eclipse, add ABAP Development Tools, connect to SAP BTP ABAP Environment trial, and write your first ABAP Cloud program."
order: 3
module: "modern-abap-landscape"
module_title: "The Modern ABAP Landscape"
tags: ["adt", "eclipse", "abap development tools", "btp trial", "setup"]
prev_slug: "abap-cloud-development-model"
next_slug: "modern-abap-syntax"
---

# Setting Up ADT (Eclipse) for ABAP Development

## What You'll Learn
- How to install Eclipse IDE and ABAP Development Tools (ADT)
- How to create a free SAP BTP ABAP Environment trial account
- How to connect ADT to your cloud system
- How to create your first ABAP Cloud project and package
- Your first "Hello World" in ABAP Cloud

## Goodbye SE80, Hello Eclipse

If you've been using SE80 your entire ABAP career, this lesson is a significant shift. Eclipse with ADT is not just a different editor — it's a different way of working. You'll have code completion, inline error checking, refactoring tools, integrated testing, and the ability to work on multiple objects simultaneously in tabs.

Think of the shift like this: SE80 is a flip phone. It makes calls, it sends texts, it works. Eclipse ADT is a smartphone — same core functions, but with a modern interface that makes you dramatically more productive once you get past the learning curve.

## Step 1 — Install Eclipse

Download Eclipse IDE for Java Developers (yes, Java — ADT runs as an Eclipse plugin):

1. Go to `https://www.eclipse.org/downloads/`
2. Download **Eclipse IDE for Java Developers** (latest release)
3. Install it — accept the defaults
4. Launch Eclipse and choose a workspace directory (e.g., `C:\eclipse-workspace\abap`)

**Important:** Use the "Java Developers" package, not "Enterprise Java" or "C/C++". ADT is compatible with the Java Developers package.

## Step 2 — Install ABAP Development Tools (ADT)

ADT is an Eclipse plugin provided by SAP:

1. In Eclipse, go to **Help → Install New Software**
2. Click **Add** and enter:
   - Name: `ABAP Development Tools`
   - URL: `https://tools.hana.ondemand.com/latest`
3. Check **ABAP Development Tools** from the list
4. Click **Next**, accept the license, and finish the installation
5. Restart Eclipse when prompted

After restart, you should see ABAP-specific perspectives and menu options.

### Expected Output (ADT Installed Successfully)

```
Eclipse Menu Bar now shows:
  File | Edit | Navigate | Search | Project | Run | ABAP | Window | Help

ABAP Perspective available:
  Window → Perspective → Open Perspective → Other → ABAP
```

## Step 3 — Create a SAP BTP ABAP Environment Trial

SAP provides a free trial system — no cost, no credit card:

1. Go to `https://www.sap.com/products/technology-platform/trial.html`
2. Create a SAP Universal ID (or log in if you have one)
3. Activate the **SAP BTP Trial** in your preferred region
4. From the BTP cockpit, navigate to **Instances and Subscriptions**
5. Create an instance of **SAP BTP, ABAP Environment** (trial plan)
6. Wait for provisioning (~10 minutes)

Once provisioned, you'll see a service key with connection details.

**Note:** The trial has limitations (storage, runtime quotas), but it's more than enough for this entire course. TechMart's training environment uses the same trial system.

## Step 4 — Connect ADT to Your BTP System

1. In Eclipse, switch to the **ABAP Perspective** (Window → Perspective → Open Perspective → ABAP)
2. In the Project Explorer, right-click → **New → ABAP Cloud Project**
3. Select **SAP BTP ABAP Environment**
4. Enter your service key or use the **SAP Logon Service URL** from the BTP cockpit
5. Log in with your SAP Universal ID
6. Name your project (e.g., `TECHMART_CLOUD`)
7. Click **Finish**

You should now see the system in your Project Explorer with expandable nodes for packages, dictionary objects, and more.

### Expected Output (Connected to BTP)

```
Project Explorer:
  ▼ TECHMART_CLOUD [your-system-id]
    ▼ Favorite Packages
    ▼ Released Objects
      ▼ Core Data Services
      ▼ Classes/Interfaces
      ▼ ...
```

## Step 5 — Create Your Package

Every object in ABAP Cloud lives in a package. Let's create TechMart's development package:

1. Right-click your project → **New → ABAP Package**
2. Enter:
   - Name: `ZTECHMART_MODERN`
   - Description: `TechMart Modern ABAP Development`
   - Superpackage: `ZLOCAL` (for local development on trial)
3. Click **Next**, select a transport request (or create a new one)
4. Click **Finish**

```
Project Explorer:
  ▼ TECHMART_CLOUD
    ▼ Favorite Packages
      ▼ ZTECHMART_MODERN
        (empty — we'll add objects starting next lesson)
```

## Step 6 — Your First ABAP Cloud Program

Let's write a simple class to confirm everything works:

1. Right-click `ZTECHMART_MODERN` → **New → ABAP Class**
2. Enter:
   - Name: `ZCL_TM_HELLO_CLOUD`
   - Description: `TechMart Hello Cloud`
   - Add interface: `IF_OO_ADT_CLASSRUN`
3. Click **Next** → select transport → **Finish**

The `IF_OO_ADT_CLASSRUN` interface lets you run a class directly from ADT — it's the ABAP Cloud equivalent of a Classic report program.

```abap
CLASS zcl_tm_hello_cloud DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
ENDCLASS.

CLASS zcl_tm_hello_cloud IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.
    out->write( |Welcome to ABAP Cloud, TechMart developer!| ).
    out->write( |Today's date: { cl_abap_context_info=>get_system_date( ) }| ).
    out->write( |Your user: { cl_abap_context_info=>get_user_technical_name( ) }| ).
  ENDMETHOD.
ENDCLASS.
```

Run it: **Right-click the class → Run As → ABAP Application (Console)**

### Expected Output

```
Welcome to ABAP Cloud, TechMart developer!
Today's date: 2026-04-12
Your user: CB9876543210
```

Notice what's different from Classic ABAP:
- No `REPORT` statement — we use a class, not a program
- No `WRITE` statement — we use `out->write()`
- String templates with `| |` instead of concatenation
- `cl_abap_context_info` instead of `sy-datum` and `sy-uname` (those aren't available in ABAP Cloud)

## ADT Tips for SE80 Veterans

| SE80 Habit | ADT Equivalent |
|---|---|
| Double-click to navigate | **Ctrl+Click** on any object name |
| F1 for help | **F2** shows inline documentation |
| SE38 to create a report | Right-click package → New → ABAP Class (with IF_OO_ADT_CLASSRUN) |
| SE11 to view tables | **Ctrl+Shift+A** → search for table/CDS entity name |
| Pretty Printer | **Shift+F1** (ABAP Formatter) |
| SE24 for classes | Just open the class file directly in ADT |
| Activation (Ctrl+F3 in SE80) | **Ctrl+F3** in ADT too (this one stayed the same!) |

**Pro tip:** Learn **Ctrl+Shift+A** (Open ABAP Development Object) immediately. It's the universal search — type any object name and jump to it instantly. This alone makes ADT faster than SE80.

## Common Mistakes

- **Installing the wrong Eclipse package** — The "Eclipse IDE for Enterprise Java and Web Developers" has conflicts with ADT. Use "Eclipse IDE for Java Developers."
- **Not switching to ABAP Perspective** — ADT features only appear in the ABAP perspective. If you don't see ABAP options, check Window → Perspective.
- **Using `sy-` system fields in ABAP Cloud** — `SY-DATUM`, `SY-UNAME`, `SY-SUBRC` after SQL are not available. Use `cl_abap_context_info` for system info and inline error handling for SQL.
- **Creating objects in $TMP** — `$TMP` is for local throwaway objects. Use a proper Z-package for anything you want to keep.
- **Expecting SAP GUI transactions to work** — SE11, SE37, SE80 — none of these are available in the BTP trial. Everything happens in ADT.

## Key Takeaways

- Eclipse with ADT is the mandatory IDE for ABAP Cloud development. SE80 cannot create or edit cloud objects.
- SAP BTP ABAP Environment trial gives you a free cloud system for learning — no cost, no credit card.
- In ABAP Cloud, everything is a class. The `IF_OO_ADT_CLASSRUN` interface replaces classic report programs for console output.
- Learn Ctrl+Shift+A, Ctrl+Click, and F2 immediately — they'll make you productive in ADT fast.
- Classic system fields like `sy-datum` are replaced by `cl_abap_context_info` methods.

## Next Lesson

Now that your environment is ready, let's learn the **modern ABAP syntax** — inline declarations, string templates, constructor operators, and the new internal table expressions. If Classic ABAP was prose, modern ABAP is poetry — same ideas, fewer words. We'll convert TechMart code from Classic to Modern style side by side.
