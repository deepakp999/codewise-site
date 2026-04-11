---
title: "Temp Views, Global Views, and When to Use Each"
description: "Understand the difference between createOrReplaceTempView and createGlobalTempView in PySpark, and when to use each one."
order: 14
module: "spark-sql"
module_title: "Spark SQL"
tags: ["pyspark", "temp view", "global view", "createOrReplaceTempView", "beginner"]
prev_slug: "sql-queries-on-dataframes"
next_slug: "joins"
---

# Temp Views, Global Views, and When to Use Each

## What You'll Learn
- The difference between temp views and global temp views
- When each type of view disappears
- How to list, check, and drop views
- Practical patterns for organizing views in a pipeline

## Two Types of Views

PySpark has two ways to register a DataFrame as a SQL table:

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("Views").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [("Alice", 120000), ("Bob", 95000), ("Charlie", 130000)]
df = spark.createDataFrame(data, ["name", "salary"])

# Type 1: Temp View — visible only in THIS SparkSession
df.createOrReplaceTempView("employees")

# Type 2: Global Temp View — visible across ALL SparkSessions in the same app
df.createGlobalTempView("employees_global")
```

## Temp Views (The One You'll Use 99% of the Time)

A temp view lives inside the current SparkSession. It disappears when the session ends.

```python
# Query a temp view — just use the view name
spark.sql("SELECT * FROM employees").show()
```

### Expected Output
```
+-------+------+
|   name|salary|
+-------+------+
|  Alice|120000|
|    Bob| 95000|
|Charlie|130000|
+-------+------+
```

### createOrReplace vs create

```python
# createOrReplaceTempView — overwrites if the view already exists
df.createOrReplaceTempView("employees")  # Safe to call multiple times

# createTempView — throws an error if the view already exists
df.createTempView("new_view")  # Fails if "new_view" already exists
```

Use `createOrReplaceTempView` almost always — it's safer because you don't have to worry about whether the view already exists.

## Global Temp Views (Rarely Needed)

A global temp view is visible across different SparkSessions within the same Spark application. It lives in a special `global_temp` database.

```python
# Query a global temp view — must prefix with global_temp.
spark.sql("SELECT * FROM global_temp.employees_global").show()
```

### Expected Output
```
+-------+------+
|   name|salary|
+-------+------+
|  Alice|120000|
|    Bob| 95000|
|Charlie|130000|
+-------+------+
```

Note the `global_temp.` prefix — this is required. Without it, Spark looks for a regular temp view and won't find it.

**When would you use this?** Almost never in practice. Global temp views matter when you have multiple SparkSessions in the same application (rare) or when different notebooks in the same Spark cluster need to share data. For single-session scripts and pipelines, regular temp views are all you need.

## Managing Views

### List all views

```python
# Show all temp views in the current session
spark.sql("SHOW VIEWS").show()
```

### Check if a view exists

```python
# Check programmatically
print(spark.catalog.tableExists("employees"))       # True
print(spark.catalog.tableExists("nonexistent"))      # False
```

### Drop a view

```python
# Drop a temp view
spark.catalog.dropTempView("employees")

# Drop a global temp view
spark.catalog.dropGlobalTempView("employees_global")
```

Dropping a view does NOT delete any data — it just removes the name. The underlying DataFrame still exists if you have a variable pointing to it.

## Practical Pattern: Pipeline with Multiple Views

In a real ETL pipeline, you often create a chain of views:

```python
# Raw data
orders = spark.read.parquet("data/orders.parquet")
orders.createOrReplaceTempView("raw_orders")

# Cleaned data
clean_orders = spark.sql("""
    SELECT order_id, customer_id, amount, order_date
    FROM raw_orders
    WHERE amount > 0 AND order_date IS NOT NULL
""")
clean_orders.createOrReplaceTempView("clean_orders")

# Aggregated data
daily_summary = spark.sql("""
    SELECT 
        order_date,
        COUNT(*) as order_count,
        SUM(amount) as total_revenue
    FROM clean_orders
    GROUP BY order_date
""")
daily_summary.createOrReplaceTempView("daily_summary")

# Final query using the cleaned and aggregated views
spark.sql("""
    SELECT * FROM daily_summary 
    WHERE total_revenue > 10000
    ORDER BY order_date
""").show()
```

Each view builds on the previous one — `raw_orders` → `clean_orders` → `daily_summary`. This is readable and each intermediate step is queryable for debugging.

## Views vs DataFrames — What's the Difference?

A view IS a DataFrame with a SQL name attached. Under the hood, they're the same thing:

```python
# These are equivalent
df.filter(col("salary") > 100000).show()
spark.sql("SELECT * FROM employees WHERE salary > 100000").show()
```

The only difference is how you access them:
- **DataFrame variable** (`df`) — used in Python code
- **View name** (`"employees"`) — used in SQL strings

Both point to the same data. Both use the same optimizer. Neither copies the data.

## Common Mistakes

- **Forgetting the `global_temp.` prefix for global views.** `SELECT * FROM employees_global` fails. You need `SELECT * FROM global_temp.employees_global`. This is the #1 confusion with global views.
- **Expecting views to survive a session restart.** If your Spark application restarts, all temp views are gone. If you need persistent tables, you need a metastore (Hive) — that's beyond our scope but worth knowing exists.
- **Creating too many views in a complex pipeline.** Views are free (no data copying), but too many make debugging harder. Use views for logical stages in your pipeline — raw, cleaned, aggregated — not for every minor transformation.

## Key Takeaways

- `createOrReplaceTempView` is your go-to — use it for all SQL access to DataFrames.
- Temp views live in the current SparkSession only. Global temp views live across sessions but require the `global_temp.` prefix.
- Views don't copy data — they're just SQL-accessible names for existing DataFrames.
- Use views to create readable pipeline stages: raw → cleaned → aggregated → output.
- Always use `createOrReplaceTempView` over `createTempView` to avoid "view already exists" errors.

## Next Lesson

Views let you query single tables with SQL. But real data engineering requires combining data from multiple sources. In **Lesson 15: Joins**, we'll learn how to combine DataFrames using inner, left, right, anti, and cross joins — the most important operation in data engineering.
