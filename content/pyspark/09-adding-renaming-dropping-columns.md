---
title: "Adding, Renaming, and Dropping Columns in PySpark"
description: "Learn how to transform PySpark DataFrames by adding computed columns with withColumn, renaming with withColumnRenamed, and dropping columns."
order: 9
module: "dataframes-deep-dive"
module_title: "DataFrames Deep Dive"
tags: ["pyspark", "withcolumn", "rename column", "add column", "beginner"]
prev_slug: "selecting-filtering-sorting"
next_slug: "groupby-and-aggregations"
---

# Adding, Renaming, and Dropping Columns

## What You'll Learn
- How to add new columns with `withColumn`
- How to rename columns with `withColumnRenamed`
- How to drop columns you don't need
- How to use `when`/`otherwise` for conditional logic
- How to cast columns to different data types

## Remember: DataFrames Are Immutable

Before we start — every operation here creates a **new** DataFrame. The original is never modified. This is different from pandas, where `df["new_col"] = ...` changes the DataFrame in place.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, when, upper, round

spark = SparkSession.builder.appName("ColumnOps").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [
    ("Alice", "Engineering", 120000, "2020-01-15"),
    ("Bob", "Marketing", 95000, "2019-06-01"),
    ("Charlie", "Engineering", 130000, "2021-03-20"),
    ("Diana", "Sales", 88000, "2022-11-10"),
    ("Eve", "Marketing", 92000, "2020-08-05"),
]

df = spark.createDataFrame(data, ["name", "department", "salary", "start_date"])
```

## Adding Columns

### Add a computed column

```python
# Add a column that calculates monthly salary
df_with_monthly = df.withColumn("monthly_salary", round(col("salary") / 12, 2))
df_with_monthly.show()
```

### Expected Output
```
+-------+-----------+------+----------+--------------+
|   name| department|salary|start_date|monthly_salary|
+-------+-----------+------+----------+--------------+
|  Alice|Engineering|120000|2020-01-15|       10000.0|
|    Bob|  Marketing| 95000|2019-06-01|       7916.67|
|Charlie|Engineering|130000|2021-03-20|      10833.33|
|  Diana|      Sales| 88000|2022-11-10|       7333.33|
|    Eve|  Marketing| 92000|2020-08-05|       7666.67|
+-------+-----------+------+----------+--------------+
```

### Add a constant column

```python
# Add a column with the same value for every row
df_with_country = df.withColumn("country", lit("India"))
df_with_country.select("name", "country").show()
```

### Expected Output
```
+-------+-------+
|   name|country|
+-------+-------+
|  Alice|  India|
|    Bob|  India|
|Charlie|  India|
|  Diana|  India|
|    Eve|  India|
+-------+-------+
```

`lit()` stands for "literal" — it creates a column with a constant value. You need `lit()` because `withColumn` expects a column expression, not a plain Python value.

### Add a conditional column with when/otherwise

This is PySpark's equivalent of an if/else:

```python
# Categorize employees by salary band
df_banded = df.withColumn(
    "salary_band",
    when(col("salary") >= 120000, "Senior")
    .when(col("salary") >= 95000, "Mid")
    .otherwise("Junior")
)
df_banded.select("name", "salary", "salary_band").show()
```

### Expected Output
```
+-------+------+-----------+
|   name|salary|salary_band|
+-------+------+-----------+
|  Alice|120000|     Senior|
|    Bob| 95000|        Mid|
|Charlie|130000|     Senior|
|  Diana| 88000|     Junior|
|    Eve| 92000|     Junior|
+-------+------+-----------+
```

The `when/otherwise` chain evaluates top to bottom — the first matching condition wins. Always end with `otherwise()` to handle rows that don't match any condition (without it, unmatched rows get `null`).

### Transform an existing column

```python
# Overwrite a column — uppercase the department names
df_upper = df.withColumn("department", upper(col("department")))
df_upper.show()
```

### Expected Output
```
+-------+-----------+------+----------+
|   name| department|salary|start_date|
+-------+-----------+------+----------+
|  Alice|ENGINEERING|120000|2020-01-15|
|    Bob|  MARKETING| 95000|2019-06-01|
|Charlie|ENGINEERING|130000|2021-03-20|
|  Diana|      SALES| 88000|2022-11-10|
|    Eve|  MARKETING| 92000|2020-08-05|
+-------+-----------+------+----------+
```

When you use `withColumn` with an existing column name, it replaces that column.

## Renaming Columns

### Rename a single column

```python
df_renamed = df.withColumnRenamed("salary", "annual_salary")
df_renamed.printSchema()
```

### Expected Output
```
root
 |-- name: string (nullable = true)
 |-- department: string (nullable = true)
 |-- annual_salary: long (nullable = true)
 |-- start_date: string (nullable = true)
```

### Rename multiple columns

For renaming many columns at once, chaining `withColumnRenamed` works but gets verbose. A cleaner approach:

```python
# Rename multiple columns using toDF
new_names = ["employee_name", "dept", "annual_salary", "hire_date"]
df_renamed = df.toDF(*new_names)
df_renamed.printSchema()
```

### Expected Output
```
root
 |-- employee_name: string (nullable = true)
 |-- dept: string (nullable = true)
 |-- annual_salary: long (nullable = true)
 |-- hire_date: string (nullable = true)
```

**Warning:** `toDF` renames by position — the first name maps to the first column, second to second, etc. If you get the order wrong, the data won't change but the names will be misleading.

## Dropping Columns

```python
# Drop one column
df.drop("start_date").show()

# Drop multiple columns
df.drop("start_date", "department").show()
```

### Expected Output
```
+-------+------+
|   name|salary|
+-------+------+
|  Alice|120000|
|    Bob| 95000|
|Charlie|130000|
|  Diana| 88000|
|    Eve| 92000|
+-------+------+
```

Dropping a column that doesn't exist does **not** throw an error — it just returns the DataFrame unchanged. This is different from pandas, which raises a `KeyError`.

## Casting Data Types

Sometimes you need to convert a column to a different type:

```python
from pyspark.sql.types import DateType

# Cast string to date
df_typed = df.withColumn("start_date", col("start_date").cast(DateType()))
df_typed.printSchema()
```

### Expected Output
```
root
 |-- name: string (nullable = true)
 |-- department: string (nullable = true)
 |-- salary: long (nullable = true)
 |-- start_date: date (nullable = true)
```

You can also use string shorthand: `col("salary").cast("double")` instead of importing the type class.

## Chaining Multiple Transformations

In real pipelines, you chain several column operations together:

```python
result = df \
    .withColumn("start_date", col("start_date").cast("date")) \
    .withColumn("monthly_salary", round(col("salary") / 12, 2)) \
    .withColumn("salary_band",
        when(col("salary") >= 120000, "Senior")
        .when(col("salary") >= 95000, "Mid")
        .otherwise("Junior")
    ) \
    .withColumnRenamed("salary", "annual_salary") \
    .drop("start_date")

result.show()
```

### Expected Output
```
+-------+-----------+-------------+--------------+-----------+
|   name| department|annual_salary|monthly_salary|salary_band|
+-------+-----------+-------------+--------------+-----------+
|  Alice|Engineering|       120000|       10000.0|     Senior|
|    Bob|  Marketing|        95000|       7916.67|        Mid|
|Charlie|Engineering|       130000|      10833.33|     Senior|
|  Diana|      Sales|        88000|       7333.33|     Junior|
|    Eve|  Marketing|        92000|       7666.67|     Junior|
+-------+-----------+-------------+--------------+-----------+
```

## Common Mistakes

- **Chaining many `withColumn` calls for unrelated columns.** Each `withColumn` creates a new DataFrame object. While Spark optimizes this internally, using `select` with multiple expressions is often cleaner and can be more performant for many columns at once.
- **Forgetting `lit()` for constant values.** `df.withColumn("status", "active")` will throw an error. You need `df.withColumn("status", lit("active"))` because the second argument must be a column expression.
- **Not ending `when` chains with `otherwise()`.** If no condition matches and there's no `otherwise`, the value is `null`. This is often a silent bug — your data looks correct until you realize some rows have unexplained nulls.

## Key Takeaways

- `withColumn` adds or replaces a column — the original DataFrame stays unchanged.
- Use `lit()` for constant values, `when/otherwise` for conditional logic.
- `withColumnRenamed` renames one column at a time; `toDF` renames all at once by position.
- `drop()` silently ignores columns that don't exist.
- Chain transformations for readable, pipeline-style code.

## Next Lesson

You can select, filter, and transform individual rows. In **Lesson 10: GroupBy, Aggregations, and Window Functions**, we'll learn how to summarize data across groups — computing totals, averages, rankings, and running calculations.
