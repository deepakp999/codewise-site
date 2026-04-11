---
title: "Schemas and Data Types — Why Explicit Schemas Matter"
description: "Learn how to define PySpark schemas with StructType, understand all data types, and why explicit schemas make your code faster and safer."
order: 7
module: "dataframes-deep-dive"
module_title: "DataFrames Deep Dive"
tags: ["pyspark", "schema", "data types", "structtype", "beginner"]
prev_slug: "creating-dataframes"
next_slug: "selecting-filtering-sorting"
---

# Schemas and Data Types — Why Explicit Schemas Matter

## What You'll Learn
- How to define a schema using StructType and StructField
- All the common PySpark data types and when to use them
- Why explicit schemas are 2-3x faster than inferSchema
- How to check and enforce your schema at read time

## The Problem with inferSchema

In the last lesson, we read a CSV with `inferSchema=True`. It worked, but here's what actually happened:

1. Spark read the **entire file once** just to guess the data types
2. Spark read the **entire file again** to actually load the data
3. Spark guessed wrong on some columns (treating zip codes as integers, for example)

On a 10 GB CSV, that's 20 GB of I/O instead of 10 GB. On a 100 GB file, it's painfully slow. And the guesses aren't always right.

## Defining a Schema

Instead of letting Spark guess, you tell it exactly what to expect:

```python
from pyspark.sql import SparkSession
from pyspark.sql.types import (
    StructType, StructField,
    StringType, IntegerType, DoubleType, DateType, BooleanType
)

spark = SparkSession.builder.appName("SchemaDemo").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# Define the schema explicitly
schema = StructType([
    StructField("name", StringType(), nullable=False),
    StructField("department", StringType(), nullable=True),
    StructField("salary", IntegerType(), nullable=True),
    StructField("start_date", DateType(), nullable=True),
    StructField("is_active", BooleanType(), nullable=True),
])

# Read CSV with explicit schema — no inferSchema needed
df = spark.read.csv("employees.csv", header=True, schema=schema)
df.printSchema()
df.show(3)
```

### Expected Output
```
root
 |-- name: string (nullable = false)
 |-- department: string (nullable = true)
 |-- salary: integer (nullable = true)
 |-- start_date: date (nullable = true)
 |-- is_active: boolean (nullable = true)

+-------+-----------+------+----------+---------+
|   name| department|salary|start_date|is_active|
+-------+-----------+------+----------+---------+
|  Alice|Engineering|120000|2020-01-15|     true|
|    Bob|  Marketing| 95000|2019-06-01|     true|
|Charlie|Engineering|130000|2021-03-20|    false|
+-------+-----------+------+----------+---------+
```

Let's break down each part:

- `StructType([...])` — defines the overall table structure, like a list of column definitions
- `StructField("name", StringType(), nullable=False)` — one column: its name, its type, and whether it allows null values
- `nullable=False` — Spark will flag an error if this column contains null values

## Common Data Types

Here are the PySpark data types you'll use most often:

```python
from pyspark.sql.types import (
    StringType,      # Text: "Alice", "Engineering"
    IntegerType,     # Whole numbers: 1, 42, -100 (32-bit)
    LongType,        # Large whole numbers (64-bit, Spark's default for integers)
    DoubleType,      # Decimal numbers: 3.14, -0.001 (64-bit)
    FloatType,       # Decimal numbers (32-bit, less precision)
    BooleanType,     # True or False
    DateType,        # Date only: 2024-01-15
    TimestampType,   # Date + time: 2024-01-15 14:30:00
    DecimalType,     # Exact decimals for financial data: DecimalType(10, 2)
    ArrayType,       # List of values: [1, 2, 3]
    MapType,         # Key-value pairs: {"a": 1, "b": 2}
)
```

**A practical rule:** Use `StringType` for anything that shouldn't be calculated with (names, IDs, zip codes, phone numbers). Use `IntegerType`/`LongType` for countable things. Use `DoubleType` for measurements. Use `DecimalType` for money.

## Creating DataFrames with Explicit Schemas

You can also use schemas when creating DataFrames from Python data:

```python
schema = StructType([
    StructField("product", StringType(), True),
    StructField("price", DoubleType(), True),
    StructField("quantity", IntegerType(), True),
])

data = [
    ("Laptop", 999.99, 50),
    ("Phone", 699.99, 200),
    ("Tablet", None, 100),  # price is null
]

df = spark.createDataFrame(data, schema)
df.show()
df.printSchema()
```

### Expected Output
```
+-------+------+--------+
|product| price|quantity|
+-------+------+--------+
| Laptop|999.99|      50|
|  Phone|699.99|     200|
| Tablet|  null|     100|
+-------+------+--------+

root
 |-- product: string (nullable = true)
 |-- price: double (nullable = true)
 |-- quantity: integer (nullable = true)
```

## Using DDL Strings (The Shortcut)

If you find StructType verbose, PySpark also accepts DDL-style schema strings:

```python
# DDL string — same result, less code
schema_ddl = "name STRING, department STRING, salary INT, start_date DATE"

df = spark.read.csv("employees.csv", header=True, schema=schema_ddl)
df.printSchema()
```

### Expected Output
```
root
 |-- name: string (nullable = true)
 |-- department: string (nullable = true)
 |-- salary: integer (nullable = true)
 |-- start_date: date (nullable = true)
```

DDL strings are quicker to write but don't support `nullable` settings. Use StructType for production code, DDL strings for quick exploration.

## Checking a Schema After Loading

You can always inspect what schema Spark is using:

```python
# Print the schema tree
df.printSchema()

# Get the schema as a StructType object
print(df.schema)

# Get column names
print(df.columns)

# Get column names and types as a list of tuples
print(df.dtypes)
```

### Expected Output
```
[StructField('name', StringType(), True), StructField('department', StringType(), True), StructField('salary', IntegerType(), True)]
['name', 'department', 'salary']
[('name', 'string'), ('department', 'string'), ('salary', 'int')]
```

## What Happens When the Data Doesn't Match the Schema

If you provide a schema and the data doesn't match, Spark handles it based on a `mode` setting:

```python
# PERMISSIVE (default) — puts bad rows in a _corrupt_record column
df = spark.read.csv("messy.csv", header=True, schema=schema, mode="PERMISSIVE")

# DROPMALFORMED — silently drops bad rows
df = spark.read.csv("messy.csv", header=True, schema=schema, mode="DROPMALFORMED")

# FAILFAST — throws an error on the first bad row
df = spark.read.csv("messy.csv", header=True, schema=schema, mode="FAILFAST")
```

In production, start with `FAILFAST` during development to catch issues early, then switch to `PERMISSIVE` with a `_corrupt_record` column for monitoring in production.

## Common Mistakes

- **Using `IntegerType` when Spark infers `LongType`.** When Spark infers schemas, it defaults to `LongType` for whole numbers. If you define `IntegerType` in your schema but the values exceed 2.1 billion, you'll get nulls or errors. When in doubt, use `LongType`.
- **Treating zip codes and phone numbers as integers.** Zip code `07001` becomes `7001` as an integer — you lose the leading zero. Always use `StringType` for identifiers that happen to look like numbers.
- **Ignoring `nullable`.** If you mark a column as `nullable=False` but your data has nulls, Spark won't throw an error by default — it'll silently allow them. The `nullable` flag is metadata for the optimizer, not strict enforcement. Use `.filter(col("name").isNotNull())` if you need to guarantee no nulls.

## Key Takeaways

- Explicit schemas skip the double-read that `inferSchema` requires — up to 2-3x faster on large files.
- Use `StructType` + `StructField` for production code, DDL strings for quick exploration.
- Choose data types intentionally: `StringType` for identifiers, `LongType` for big numbers, `DecimalType` for money.
- Use `mode="FAILFAST"` during development to catch schema mismatches early.
- The `nullable` flag is advisory, not enforced — validate your data explicitly.

## Next Lesson

You can create DataFrames and define their structure. Now let's work with the data inside them. In **Lesson 8: Selecting, Filtering, and Sorting**, we'll learn the operations you'll use in every single PySpark program.
