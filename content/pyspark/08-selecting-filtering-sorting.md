---
title: "Selecting, Filtering, and Sorting Rows in PySpark"
description: "Master the core PySpark operations: select columns, filter rows with conditions, and sort results. Includes side-by-side pandas comparisons."
order: 8
module: "dataframes-deep-dive"
module_title: "DataFrames Deep Dive"
tags: ["pyspark", "filter", "select", "where", "orderby", "beginner"]
prev_slug: "schemas-and-data-types"
next_slug: "adding-renaming-dropping-columns"
---

# Selecting, Filtering, and Sorting Rows

## What You'll Learn
- How to select specific columns from a DataFrame
- Three ways to filter rows based on conditions
- How to sort results by one or more columns
- The difference between `filter` and `where` (spoiler: there is none)

## Setup: Our Working Dataset

We'll use the same employee dataset throughout this lesson:

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

spark = SparkSession.builder.appName("SelectFilterSort").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [
    ("Alice", "Engineering", 120000, 30),
    ("Bob", "Marketing", 95000, 25),
    ("Charlie", "Engineering", 130000, 35),
    ("Diana", "Sales", 88000, 28),
    ("Eve", "Marketing", 92000, 32),
    ("Frank", "Engineering", 145000, 40),
    ("Grace", "Sales", 97000, 29),
]

df = spark.createDataFrame(data, ["name", "department", "salary", "age"])
df.show()
```

### Expected Output
```
+-------+-----------+------+---+
|   name| department|salary|age|
+-------+-----------+------+---+
|  Alice|Engineering|120000| 30|
|    Bob|  Marketing| 95000| 25|
|Charlie|Engineering|130000| 35|
|  Diana|      Sales| 88000| 28|
|    Eve|  Marketing| 92000| 32|
|  Frank|Engineering|145000| 40|
|  Grace|      Sales| 97000| 29|
+-------+-----------+------+---+
```

## Selecting Columns

### Select specific columns

```python
# Select two columns
df.select("name", "salary").show()
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
|  Frank|145000|
|  Grace| 97000|
+-------+------+
```

### Select with expressions

```python
# Select with a computed column
df.select("name", "salary", (col("salary") / 12).alias("monthly_salary")).show()
```

### Expected Output
```
+-------+------+--------------+
|   name|salary|monthly_salary|
+-------+------+--------------+
|  Alice|120000|       10000.0|
|    Bob| 95000|  7916.666...|
|Charlie|130000| 10833.333...|
|  Diana| 88000|  7333.333...|
|    Eve| 92000|  7666.666...|
|  Frank|145000| 12083.333...|
|  Grace| 97000|  8083.333...|
+-------+------+--------------+
```

### Select all columns except one

```python
# Drop a column (returns a new DataFrame without it)
df.drop("age").show()
```

## Filtering Rows

PySpark gives you three equivalent ways to filter. They all produce the same result.

### Method 1: Using filter() with col()

```python
# Employees earning more than 100,000
df.filter(col("salary") > 100000).show()
```

### Expected Output
```
+-------+-----------+------+---+
|   name| department|salary|age|
+-------+-----------+------+---+
|  Alice|Engineering|120000| 30|
|Charlie|Engineering|130000| 35|
|  Frank|Engineering|145000| 40|
+-------+-----------+------+---+
```

### Method 2: Using filter() with a string expression

```python
# Same result, SQL-like syntax
df.filter("salary > 100000").show()
```

### Method 3: Using where() — it's identical to filter()

```python
# where() is just an alias for filter()
df.where(col("salary") > 100000).show()
```

All three produce the exact same result. `where` exists because it reads more naturally for people coming from SQL. Use whichever you prefer — most teams pick one and stick with it.

### Combining conditions

```python
# AND — use & with parentheses around each condition
df.filter(
    (col("department") == "Engineering") & (col("salary") > 125000)
).show()
```

### Expected Output
```
+-------+-----------+------+---+
|   name| department|salary|age|
+-------+-----------+------+---+
|Charlie|Engineering|130000| 35|
|  Frank|Engineering|145000| 40|
+-------+-----------+------+---+
```

```python
# OR — use | with parentheses
df.filter(
    (col("department") == "Sales") | (col("department") == "Marketing")
).show()
```

### Expected Output
```
+-----+----------+-----+---+
| name|department|salary|age|
+-----+----------+-----+---+
|  Bob| Marketing|95000| 25|
|Diana|     Sales|88000| 28|
|  Eve| Marketing|92000| 32|
|Grace|     Sales|97000| 29|
+-----+----------+-----+---+
```

```python
# NOT — use ~
df.filter(~(col("department") == "Engineering")).show()
```

### Using isin() for multiple values

```python
# Cleaner than chaining OR conditions
df.filter(col("department").isin("Sales", "Marketing")).show()
```

This produces the same result as the OR example above, but is much cleaner when you have many values to check.

### Filtering with string methods

```python
# Names that start with a specific letter
df.filter(col("name").startswith("C")).show()

# Names that contain a substring
df.filter(col("name").contains("li")).show()

# Pattern matching with like (SQL-style wildcards)
df.filter(col("name").like("%a%")).show()
```

## Sorting Results

### Sort by one column

```python
# Ascending (default)
df.orderBy("salary").show()

# Descending
df.orderBy(col("salary").desc()).show()
```

### Expected Output (Descending)
```
+-------+-----------+------+---+
|   name| department|salary|age|
+-------+-----------+------+---+
|  Frank|Engineering|145000| 40|
|Charlie|Engineering|130000| 35|
|  Alice|Engineering|120000| 30|
|  Grace|      Sales| 97000| 29|
|    Bob|  Marketing| 95000| 25|
|    Eve|  Marketing| 92000| 32|
|  Diana|      Sales| 88000| 28|
+-------+-----------+------+---+
```

### Sort by multiple columns

```python
# Sort by department (ascending), then salary (descending) within each department
df.orderBy("department", col("salary").desc()).show()
```

### Expected Output
```
+-------+-----------+------+---+
|   name| department|salary|age|
+-------+-----------+------+---+
|  Frank|Engineering|145000| 40|
|Charlie|Engineering|130000| 35|
|  Alice|Engineering|120000| 30|
|    Bob|  Marketing| 95000| 25|
|    Eve|  Marketing| 92000| 32|
|  Grace|      Sales| 97000| 29|
|  Diana|      Sales| 88000| 28|
+-------+-----------+------+---+
```

Note: `sort()` and `orderBy()` are identical — use either one.

## Chaining Operations

PySpark operations return new DataFrames, so you can chain them:

```python
# Find top 3 highest-paid engineers
result = df \
    .filter(col("department") == "Engineering") \
    .select("name", "salary") \
    .orderBy(col("salary").desc()) \
    .limit(3)

result.show()
```

### Expected Output
```
+-------+------+
|   name|salary|
+-------+------+
|  Frank|145000|
|Charlie|130000|
|  Alice|120000|
+-------+------+
```

This reads naturally: "take the DataFrame, keep only engineers, pick name and salary, sort by salary descending, take the top 3."

## Common Mistakes

- **Forgetting parentheses in compound conditions.** `col("a") > 1 & col("b") < 5` will break because `&` has higher precedence than `>`. Always wrap each condition: `(col("a") > 1) & (col("b") < 5)`.
- **Using Python's `and`/`or` instead of `&`/`|`.** Python's `and` and `or` don't work with PySpark column expressions. Use `&` for AND, `|` for OR, `~` for NOT.
- **Assuming `orderBy` is free.** Sorting requires a shuffle — Spark has to compare values across all partitions. On large datasets, an unnecessary `orderBy` can be the slowest part of your pipeline. Only sort when you actually need ordered output.

## Key Takeaways

- `select()` picks columns, `filter()`/`where()` picks rows, `orderBy()`/`sort()` orders results.
- `filter()` and `where()` are identical — pick one and be consistent.
- Use `&`, `|`, `~` for combining conditions, with parentheses around each condition.
- Use `isin()` instead of chaining multiple OR conditions.
- Operations chain naturally: `df.filter(...).select(...).orderBy(...)`.
- Sorting triggers a shuffle — don't sort unless you need to.

## Next Lesson

You can read and query data. Now let's change it. In **Lesson 9: Adding, Renaming, and Dropping Columns**, we'll learn how to transform your DataFrame by creating new columns, renaming existing ones, and removing what you don't need.
