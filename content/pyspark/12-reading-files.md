---
title: "Reading CSV, JSON, and Parquet Files in PySpark"
description: "Master file I/O in PySpark — read CSV, JSON, and Parquet files with options for schemas, delimiters, multiline, and partitioned data."
order: 12
module: "dataframes-deep-dive"
module_title: "DataFrames Deep Dive"
tags: ["pyspark", "read csv", "read json", "parquet", "file formats", "beginner"]
prev_slug: "handling-nulls"
next_slug: "sql-queries-on-dataframes"
---

# Reading CSV, JSON, and Parquet Files

## What You'll Learn
- How to read CSV files with various options (delimiters, encoding, malformed rows)
- How to read JSON and JSON Lines files
- Why Parquet is the preferred format for data engineers
- How to write data back out in each format
- How to read partitioned data from directories

## The Three Formats You'll Use

In data engineering, you'll encounter three file formats constantly:

- **CSV** — human-readable, universal, but slow and error-prone at scale
- **JSON** — flexible structure, common from APIs, but verbose and slow to parse
- **Parquet** — binary, columnar, compressed, fast. The production standard.

Think of it this way: CSV is a letter, JSON is an email, and Parquet is a database export. You use all three, but for serious work, you want Parquet.

## Reading CSV Files

### Basic read

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("FileIO").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

df = spark.read.csv("data/employees.csv", header=True, inferSchema=True)
df.show(3)
```

### All the CSV options you'll need

```python
df = spark.read \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .option("sep", ",") \
    .option("quote", '"') \
    .option("escape", "\\") \
    .option("nullValue", "NA") \
    .option("emptyValue", "") \
    .option("dateFormat", "yyyy-MM-dd") \
    .option("encoding", "UTF-8") \
    .option("mode", "PERMISSIVE") \
    .csv("data/employees.csv")
```

The most common options explained:

- `sep` — delimiter character. Use `"\t"` for tab-separated, `"|"` for pipe-separated
- `nullValue` — what string represents null. Many files use "NA", "NULL", "None", or empty strings
- `mode` — how to handle malformed rows: `PERMISSIVE` (default, keeps bad rows), `DROPMALFORMED` (drops them), `FAILFAST` (throws error)
- `dateFormat` — how dates are formatted in the file

### Reading a tab-separated file

```python
df_tsv = spark.read.csv("data/export.tsv", header=True, sep="\t", inferSchema=True)
```

### Reading multiple CSV files at once

```python
# Read all CSVs in a directory
df_all = spark.read.csv("data/sales/", header=True, inferSchema=True)

# Read specific files with a glob pattern
df_2024 = spark.read.csv("data/sales/2024-*.csv", header=True, inferSchema=True)
```

Spark merges all matching files into a single DataFrame. Every file must have the same schema (same columns in the same order).

## Reading JSON Files

### JSON Lines (one object per line) — the default

```python
# Each line is a complete JSON object
# {"order_id": 1001, "amount": 59.99, "date": "2024-01-15"}
# {"order_id": 1002, "amount": 129.50, "date": "2024-01-16"}

df = spark.read.json("data/orders.jsonl")
df.show(3)
df.printSchema()
```

### Standard JSON (array of objects)

```python
# File contains: [{"id": 1, ...}, {"id": 2, ...}]
df = spark.read.option("multiLine", "true").json("data/orders.json")
```

### Nested JSON

JSON often has nested structures that CSV can't represent:

```python
# {"user": {"name": "Alice", "address": {"city": "Mumbai"}}, "orders": [1, 2, 3]}
df = spark.read.json("data/users_nested.jsonl")
df.printSchema()
```

### Expected Output
```
root
 |-- user: struct (nullable = true)
 |    |-- name: string (nullable = true)
 |    |-- address: struct (nullable = true)
 |    |    |-- city: string (nullable = true)
 |-- orders: array (nullable = true)
 |    |-- element: long (containsNull = true)
```

To access nested fields:

```python
df.select(
    col("user.name").alias("user_name"),
    col("user.address.city").alias("city"),
).show()
```

## Reading Parquet Files

### Why Parquet?

Parquet is a columnar format — instead of storing data row by row, it stores data column by column. This matters for three reasons:

1. **Speed** — If you query 3 columns out of 50, Parquet only reads those 3 columns. CSV reads all 50.
2. **Compression** — Similar values in a column compress better than mixed values in a row. Parquet files are typically 5-10x smaller than equivalent CSVs.
3. **Schema embedded** — No `inferSchema` needed. The data types are stored in the file itself.

### Reading Parquet

```python
# No options needed — schema is embedded in the file
df = spark.read.parquet("data/sales.parquet")
df.show(3)
df.printSchema()
```

That's it. No `header`, no `inferSchema`, no `sep`. Parquet just works.

### Reading partitioned Parquet

Production data is often stored in partitioned directories:

```
data/sales/
├── year=2023/
│   ├── month=01/
│   │   └── part-00000.parquet
│   ├── month=02/
│   │   └── part-00000.parquet
├── year=2024/
│   ├── month=01/
│   │   └── part-00000.parquet
```

```python
# Spark automatically discovers partitions
df = spark.read.parquet("data/sales/")
df.printSchema()
```

### Expected Output
```
root
 |-- order_id: long (nullable = true)
 |-- amount: double (nullable = true)
 |-- year: integer (nullable = true)
 |-- month: integer (nullable = true)
```

Spark adds `year` and `month` as columns automatically. When you filter on partition columns, Spark only reads the relevant directories — it doesn't scan the entire dataset. This is called **partition pruning** and it's a major performance optimization.

```python
# This only reads data/sales/year=2024/ — skips all 2023 data
df_2024 = df.filter(col("year") == 2024)
```

## Writing Data

### Write CSV

```python
df.write.csv("output/employees_csv", header=True, mode="overwrite")
```

### Write JSON

```python
df.write.json("output/employees_json", mode="overwrite")
```

### Write Parquet (recommended)

```python
df.write.parquet("output/employees_parquet", mode="overwrite")
```

### Write with partitioning

```python
# Creates year=2023/, year=2024/ subdirectories
df.write.partitionBy("year").parquet("output/sales_partitioned", mode="overwrite")
```

### Write modes

- `overwrite` — replace existing data
- `append` — add to existing data
- `ignore` — do nothing if data already exists
- `error` (default) — throw an error if data already exists

### Controlling output files

```python
# Write as a single file (useful for small datasets)
df.coalesce(1).write.csv("output/single_file", header=True, mode="overwrite")

# Write as 10 files (useful for parallelism)
df.repartition(10).write.parquet("output/ten_files", mode="overwrite")
```

We'll explain `coalesce` and `repartition` in detail in Lesson 22.

## Format Comparison

```
Feature          CSV           JSON          Parquet
─────────────    ──────────    ──────────    ──────────
Human readable   Yes           Yes           No
Schema embedded  No            Partial       Yes
Compression      None          None          Excellent
Column pruning   No            No            Yes
Nested data      No            Yes           Yes
Read speed       Slow          Slow          Fast
File size        Large         Largest       Smallest
Production use   Import/export API data      Data lakes
```

**Rule of thumb:** Read CSV/JSON when you receive data from external sources. Convert to Parquet immediately. Do all processing on Parquet. Only write CSV/JSON when an external system requires it.

## Common Mistakes

- **Writing CSV for internal use.** If both the producer and consumer are PySpark, use Parquet. CSV loses type information, has no compression, and can't do column pruning. The only reason to write CSV is for non-Spark consumers (Excel, humans, legacy systems).
- **Forgetting `multiLine=true` for standard JSON.** PySpark expects one JSON object per line by default. A file with `[{...}, {...}]` will fail silently or produce garbage without this option.
- **Not partitioning large datasets.** If you write 100 GB of sales data as a single Parquet directory and later need "just January 2024," Spark reads all 100 GB. Partitioning by year/month means Spark reads only the ~4 GB it needs.
- **Using `inferSchema` in production.** We covered this in Lesson 7, but it bears repeating: define your schema explicitly. On a CSV with billions of rows, `inferSchema` doubles your read time.

## Key Takeaways

- CSV is for import/export, JSON for API data, Parquet for everything else.
- Parquet is columnar, compressed, and self-describing — use it as your default storage format.
- Partitioned data lets Spark skip irrelevant files (partition pruning) — partition by columns you frequently filter on.
- Read multiple files with directory paths or glob patterns.
- Always define explicit schemas for CSV and JSON in production.
- Write modes control what happens when data already exists: `overwrite`, `append`, `ignore`, `error`.

## Next Lesson

Module 2 is complete! You can now create, inspect, transform, clean, and read/write data in PySpark. In **Module 3**, we'll add SQL to your toolkit. Starting with **Lesson 13: Running SQL Queries on DataFrames**, where you'll learn to query your DataFrames using the SQL language you may already know.
