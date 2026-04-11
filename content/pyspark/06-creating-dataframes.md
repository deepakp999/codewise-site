---
title: "Creating DataFrames from Lists, Dicts, and Files"
description: "Learn every way to create a PySpark DataFrame — from Python lists, dictionaries, CSV files, JSON, and Parquet."
order: 6
module: "dataframes-deep-dive"
module_title: "DataFrames Deep Dive"
tags: ["pyspark", "dataframe", "beginner", "create dataframe"]
prev_slug: "understanding-spark-ui"
next_slug: "schemas-and-data-types"
---

# Creating DataFrames from Lists, Dicts, and Files

## What You'll Learn
- Five different ways to create a PySpark DataFrame
- When to use each approach
- How to create DataFrames from CSV, JSON, and Parquet files
- The difference between `inferSchema` and providing your own schema

## Why This Matters

In Lesson 4, we created a simple DataFrame from a list of tuples. That's fine for learning, but in real data engineering, your data comes from files — CSVs exported from databases, JSON from APIs, Parquet files in data lakes. Knowing all the ways to get data into PySpark is the foundation for everything else.

## Way 1: From a List of Tuples (Quick Testing)

You've seen this before, but let's look at it more carefully:

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("CreateDF").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# List of tuples — each tuple is a row
data = [
    ("Alice", "Engineering", 120000),
    ("Bob", "Marketing", 95000),
    ("Charlie", "Engineering", 130000),
]

# Column names as second argument
df = spark.createDataFrame(data, ["name", "department", "salary"])
df.show()
```

### Expected Output
```
+-------+-----------+------+
|   name| department|salary|
+-------+-----------+------+
|  Alice|Engineering|120000|
|    Bob|  Marketing| 95000|
|Charlie|Engineering|130000|
+-------+-----------+------+
```

**Use this when:** you need sample data for testing, prototyping, or writing unit tests.

## Way 2: From a List of Row Objects

PySpark has a `Row` class that lets you create named rows:

```python
from pyspark.sql import Row

data = [
    Row(name="Alice", age=30, city="Mumbai"),
    Row(name="Bob", age=25, city="Delhi"),
    Row(name="Charlie", age=35, city="Bangalore"),
]

df = spark.createDataFrame(data)
df.show()
```

### Expected Output
```
+-------+---+---------+
|   name|age|     city|
+-------+---+---------+
|  Alice| 30|   Mumbai|
|    Bob| 25|    Delhi|
|Charlie| 35|Bangalore|
+-------+---+---------+
```

**Use this when:** you want self-documenting code where each row clearly shows its field names.

## Way 3: From a Pandas DataFrame

If you're transitioning from pandas, you can convert directly:

```python
import pandas as pd

# Create a pandas DataFrame
pdf = pd.DataFrame({
    "product": ["Laptop", "Phone", "Tablet"],
    "price": [999.99, 699.99, 449.99],
    "stock": [50, 200, 100],
})

# Convert to PySpark DataFrame
df = spark.createDataFrame(pdf)
df.show()
df.printSchema()
```

### Expected Output
```
+-------+------+-----+
|product| price|stock|
+-------+------+-----+
| Laptop|999.99|   50|
|  Phone|699.99|  200|
| Tablet|449.99|  100|
+-------+------+-----+

root
 |-- product: string (nullable = true)
 |-- price: double (nullable = true)
 |-- stock: long (nullable = true)
```

**Use this when:** you prototyped in pandas and want to scale to PySpark, or when you need to convert results back and forth.

## Way 4: From a CSV File

This is the most common real-world scenario:

```python
# Read a CSV file
df = spark.read.csv("employees.csv", header=True, inferSchema=True)
df.show(5)
df.printSchema()
```

### Expected Output
```
+-------+-----------+------+----------+
|   name| department|salary|start_date|
+-------+-----------+------+----------+
|  Alice|Engineering|120000|2020-01-15|
|    Bob|  Marketing| 95000|2019-06-01|
|Charlie|Engineering|130000|2021-03-20|
|  Diana|      Sales| 88000|2022-11-10|
|    Eve|  Marketing| 92000|2020-08-05|
+-------+-----------+------+----------+

root
 |-- name: string (nullable = true)
 |-- department: string (nullable = true)
 |-- salary: integer (nullable = true)
 |-- start_date: date (nullable = true)
```

Let's break down the options:

- `header=True` — the first row contains column names (not data)
- `inferSchema=True` — Spark reads through the data to guess column types

You can also use the more verbose format:

```python
df = spark.read \
    .format("csv") \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .option("sep", ",") \
    .load("employees.csv")
```

## Way 5: From JSON Files

JSON is common when working with API data:

```python
# Read a JSON file (one JSON object per line)
df = spark.read.json("orders.json")
df.show(3)
```

### Expected Output
```
+--------+-----------+------+----------+
|order_id|customer_id|amount|order_date|
+--------+-----------+------+----------+
|    1001|        101| 59.99|2024-01-15|
|    1002|        102|129.50|2024-01-16|
|    1003|        101| 24.99|2024-01-17|
+--------+-----------+------+----------+
```

PySpark expects **one JSON object per line** (called JSON Lines or JSONL format), not a single JSON array. If your file is a JSON array, use:

```python
df = spark.read.option("multiLine", "true").json("data.json")
```

## Bonus: From Parquet Files

Parquet is the format data engineers use in production. It's columnar, compressed, and fast. We'll cover why in Lesson 12, but here's how to read it:

```python
# Read Parquet — no options needed, schema is embedded in the file
df = spark.read.parquet("data/sales.parquet")
df.show(3)
```

Notice there's no `header=True` or `inferSchema=True` — Parquet files carry their own schema. This is one reason data engineers prefer Parquet over CSV.

## inferSchema: Convenient but Costly

When you use `inferSchema=True` on a CSV, Spark has to read the entire file once just to figure out the data types, then read it again to actually process it. On a 100 GB CSV, that's two full passes.

In production, you should provide an explicit schema instead. We'll cover this in the next lesson.

## Common Mistakes

- **Forgetting `header=True` when reading CSV.** Without it, Spark treats the first row as data, not column names. Your columns will be named `_c0`, `_c1`, `_c2` and your header row will appear as data.
- **Using `inferSchema=True` on large files in production.** It doubles the read time. Define your schema explicitly instead — we'll show you how in Lesson 7.
- **Assuming JSON means a JSON array.** PySpark expects JSON Lines format (one object per line) by default. A file with `[{...}, {...}]` will fail unless you set `multiLine=true`.

## Key Takeaways

- Use lists/tuples for quick testing, pandas conversion for prototyping, and file reads for real work.
- CSV needs `header=True` to use the first row as column names.
- `inferSchema=True` is convenient but slow on large files — provide an explicit schema in production.
- Parquet is self-describing — no schema options needed.
- JSON Lines (one object per line) is the default JSON format for PySpark.

## Next Lesson

We mentioned that `inferSchema` is costly and that explicit schemas are better. In **Lesson 7: Schemas and Data Types**, we'll learn exactly how to define schemas, what data types PySpark supports, and why this matters for both performance and correctness.
