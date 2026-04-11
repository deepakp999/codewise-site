---
title: "GroupBy, Aggregations, and Window Functions in PySpark"
description: "Learn how to use groupBy, agg, and window functions in PySpark to summarize data, compute rankings, and calculate running totals."
order: 10
module: "dataframes-deep-dive"
module_title: "DataFrames Deep Dive"
tags: ["pyspark", "groupby", "window function", "aggregation", "beginner"]
prev_slug: "adding-renaming-dropping-columns"
next_slug: "handling-nulls"
---

# GroupBy, Aggregations, and Window Functions

## What You'll Learn
- How to group data and compute aggregations (count, sum, avg, min, max)
- How to perform multiple aggregations in a single pass
- What window functions are and when to use them
- How to compute rankings, running totals, and row numbers

## Setup

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, sum, avg, min, max, round
from pyspark.sql.window import Window
from pyspark.sql import functions as F

spark = SparkSession.builder.appName("GroupByWindow").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [
    ("Alice", "Engineering", 120000, "2020-01-15"),
    ("Bob", "Marketing", 95000, "2019-06-01"),
    ("Charlie", "Engineering", 130000, "2021-03-20"),
    ("Diana", "Sales", 88000, "2022-11-10"),
    ("Eve", "Marketing", 92000, "2020-08-05"),
    ("Frank", "Engineering", 145000, "2018-04-12"),
    ("Grace", "Sales", 97000, "2021-07-22"),
    ("Henry", "Marketing", 105000, "2017-09-30"),
]

df = spark.createDataFrame(data, ["name", "department", "salary", "start_date"])
```

## GroupBy Basics

Think of `groupBy` like sorting a deck of cards by suit, then doing something with each pile — counting cards, finding the highest value, summing the numbers.

```python
# Count employees per department
df.groupBy("department").count().show()
```

### Expected Output
```
+-----------+-----+
| department|count|
+-----------+-----+
|Engineering|    3|
|  Marketing|    3|
|      Sales|    2|
+-----------+-----+
```

## Multiple Aggregations with agg()

Don't call separate aggregations — do them all in one `agg()`:

```python
dept_stats = df.groupBy("department").agg(
    count("*").alias("headcount"),
    round(avg("salary"), 0).alias("avg_salary"),
    min("salary").alias("min_salary"),
    max("salary").alias("max_salary"),
    sum("salary").alias("total_salary"),
)
dept_stats.show()
```

### Expected Output
```
+-----------+---------+----------+----------+----------+------------+
| department|headcount|avg_salary|min_salary|max_salary|total_salary|
+-----------+---------+----------+----------+----------+------------+
|Engineering|        3|  131667.0|    120000|    145000|      395000|
|  Marketing|        3|   97333.0|     92000|    105000|      292000|
|      Sales|        2|   92500.0|     88000|     97000|      185000|
+-----------+---------+----------+----------+----------+------------+
```

Why use `agg()` instead of separate calls? Because each separate aggregation triggers its own shuffle across the cluster. One `agg()` with multiple aggregations shuffles the data **once**. On a large dataset, this difference is significant.

## GroupBy with Multiple Columns

You can group by more than one column:

```python
# If we had a "level" column, we could group by department AND level
# For demonstration, let's add a seniority column first
from pyspark.sql.functions import when

df_with_level = df.withColumn(
    "level",
    when(col("salary") >= 120000, "Senior").otherwise("Junior")
)

df_with_level.groupBy("department", "level").agg(
    count("*").alias("count"),
    round(avg("salary"), 0).alias("avg_salary"),
).orderBy("department", "level").show()
```

### Expected Output
```
+-----------+------+-----+----------+
| department| level|count|avg_salary|
+-----------+------+-----+----------+
|Engineering|Junior|    0|      null|
|Engineering|Senior|    3|  131667.0|
|  Marketing|Junior|    2|   93500.0|
|  Marketing|Senior|    1|  105000.0|
|      Sales|Junior|    2|   92500.0|
+-----------+------+-----+----------+
```

## Window Functions: The Power Tool

GroupBy collapses rows — you go from 8 employees to 3 department rows. But what if you want to keep every row AND add information about its group? That's what window functions do.

Think of it this way: groupBy says "tell me about each department." Window functions say "tell me about each employee relative to their department."

### Defining a Window

```python
# A window partitioned by department, ordered by salary descending
window_dept = Window.partitionBy("department").orderBy(col("salary").desc())
```

This says: "For each row, look at all other rows in the same department, sorted by salary from highest to lowest."

### Rank Within Each Department

```python
from pyspark.sql.functions import rank, dense_rank, row_number

df_ranked = df.withColumn("rank", rank().over(window_dept))
df_ranked.select("name", "department", "salary", "rank").show()
```

### Expected Output
```
+-------+-----------+------+----+
|   name| department|salary|rank|
+-------+-----------+------+----+
|  Frank|Engineering|145000|   1|
|Charlie|Engineering|130000|   2|
|  Alice|Engineering|120000|   3|
|  Henry|  Marketing|105000|   1|
|    Bob|  Marketing| 95000|   2|
|    Eve|  Marketing| 92000|   3|
|  Grace|      Sales| 97000|   1|
|  Diana|      Sales| 88000|   2|
+-------+-----------+------+----+
```

Frank is rank 1 in Engineering (highest salary), Grace is rank 1 in Sales. Every row is kept — nothing is collapsed.

### Three Ranking Functions

```python
# These differ in how they handle ties
df_ranks = df.withColumn("row_number", row_number().over(window_dept)) \
    .withColumn("rank", rank().over(window_dept)) \
    .withColumn("dense_rank", dense_rank().over(window_dept))

df_ranks.select("name", "department", "salary", "row_number", "rank", "dense_rank").show()
```

The differences matter when there are ties:
- `row_number()` — always gives unique numbers (1, 2, 3). Ties get arbitrary ordering.
- `rank()` — same value gets same rank, but skips numbers (1, 2, 2, 4).
- `dense_rank()` — same value gets same rank, no gaps (1, 2, 2, 3).

### Running Total

```python
# Cumulative salary within each department (ordered by start_date)
window_cumulative = Window.partitionBy("department") \
    .orderBy("start_date") \
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

df_running = df.withColumn(
    "running_total",
    sum("salary").over(window_cumulative)
)
df_running.select("name", "department", "salary", "start_date", "running_total").show()
```

### Expected Output
```
+-------+-----------+------+----------+-------------+
|   name| department|salary|start_date|running_total|
+-------+-----------+------+----------+-------------+
|  Frank|Engineering|145000|2018-04-12|       145000|
|  Alice|Engineering|120000|2020-01-15|       265000|
|Charlie|Engineering|130000|2021-03-20|       395000|
|  Henry|  Marketing|105000|2017-09-30|       105000|
|    Bob|  Marketing| 95000|2019-06-01|       200000|
|    Eve|  Marketing| 92000|2020-08-05|       292000|
|  Diana|      Sales| 88000|2022-11-10|        88000|
|  Grace|      Sales| 97000|2021-07-22|        97000|
+-------+-----------+------+----------+-------------+
```

### Department Average Alongside Each Row

```python
# Add department average without collapsing rows
window_dept_no_order = Window.partitionBy("department")

df_with_avg = df.withColumn(
    "dept_avg_salary",
    round(avg("salary").over(window_dept_no_order), 0)
).withColumn(
    "diff_from_avg",
    col("salary") - col("dept_avg_salary")
)

df_with_avg.select("name", "department", "salary", "dept_avg_salary", "diff_from_avg").show()
```

### Expected Output
```
+-------+-----------+------+---------------+-------------+
|   name| department|salary|dept_avg_salary|diff_from_avg|
+-------+-----------+------+---------------+-------------+
|  Frank|Engineering|145000|       131667.0|      13333.0|
|  Alice|Engineering|120000|       131667.0|     -11667.0|
|Charlie|Engineering|130000|       131667.0|      -1667.0|
|  Henry|  Marketing|105000|        97333.0|       7667.0|
|    Bob|  Marketing| 95000|        97333.0|      -2333.0|
|    Eve|  Marketing| 92000|        97333.0|      -5333.0|
|  Grace|      Sales| 97000|        92500.0|       4500.0|
|  Diana|      Sales| 88000|        92500.0|      -4500.0|
+-------+-----------+------+---------------+-------------+
```

This is incredibly powerful — you can see how each employee compares to their department average without any groupBy.

## Common Mistakes

- **Calling separate aggregation methods instead of using agg().** `df.groupBy("dept").count()` followed by `df.groupBy("dept").avg("salary")` triggers two shuffles. Use `df.groupBy("dept").agg(count("*"), avg("salary"))` for one shuffle.
- **Expecting ordered output from groupBy.** PySpark groupBy results are unordered. If you need sorted output, always add `.orderBy()` explicitly.
- **Using a window with orderBy when you don't need ordering.** For simple aggregations like department average, use `Window.partitionBy("department")` without `.orderBy()`. Adding orderBy changes the behavior — it makes `sum()` compute a running total instead of a grand total.
- **Confusing rank, dense_rank, and row_number.** Use `row_number` when you need unique sequential numbers. Use `rank` when ties should share the same position. Use `dense_rank` when you want no gaps after ties.

## Key Takeaways

- `groupBy().agg()` collapses rows into group summaries — always use `agg()` for multiple aggregations to minimize shuffles.
- Window functions keep every row but add group-level calculations as new columns.
- Define windows with `Window.partitionBy()` (like groupBy) and optionally `.orderBy()` (for rankings and running totals).
- `row_number`, `rank`, and `dense_rank` handle ties differently — choose intentionally.
- Window functions without `orderBy` give you the full group aggregate; with `orderBy` they give running/cumulative results.

## Next Lesson

Real data is messy — it has nulls, missing values, and bad entries. In **Lesson 11: Handling Nulls and Dirty Data**, we'll learn how to detect, remove, and fill missing values in PySpark.
