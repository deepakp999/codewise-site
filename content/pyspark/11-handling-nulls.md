---
title: "Handling Null Values and Dirty Data in PySpark"
description: "Learn how to detect, drop, fill, and replace null values in PySpark DataFrames. Clean messy data with fillna, dropna, when/otherwise, and type casting."
order: 11
module: "dataframes-deep-dive"
module_title: "DataFrames Deep Dive"
tags: ["pyspark", "null values", "fillna", "dropna", "data cleaning", "beginner"]
prev_slug: "groupby-and-aggregations"
next_slug: "reading-files"
---

# Handling Null Values and Dirty Data

## What You'll Learn
- How to detect null values in your DataFrame
- How to drop rows with nulls (`dropna`)
- How to fill nulls with default values (`fillna`)
- How to use `when`/`otherwise` for custom null handling
- How to deal with bad data types and inconsistent values

## Why This Lesson Matters

Every real dataset has problems. Missing values, wrong types, inconsistent formats, duplicate rows. Data cleaning typically takes 60-80% of a data engineer's time. PySpark gives you tools to handle all of this at scale.

## Setup: A Messy Dataset

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, count, isnan, isnull, coalesce, lit, trim, lower

spark = SparkSession.builder.appName("CleanData").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [
    ("Alice", "Engineering", 120000, "alice@company.com"),
    ("Bob", "Marketing", None, "bob@company.com"),
    ("Charlie", None, 130000, None),
    ("Diana", "Sales", 88000, "diana@company.com"),
    (None, "Marketing", 92000, "eve@company.com"),
    ("Frank", "Engineering", None, None),
    ("Grace", "Sales", 97000, "grace@company.com"),
]

df = spark.createDataFrame(data, ["name", "department", "salary", "email"])
df.show()
```

### Expected Output
```
+-------+-----------+------+-----------------+
|   name| department|salary|            email|
+-------+-----------+------+-----------------+
|  Alice|Engineering|120000|alice@company.com|
|    Bob|  Marketing|  null|  bob@company.com|
|Charlie|       null|130000|             null|
|  Diana|      Sales| 88000|diana@company.com|
|   null|  Marketing| 92000|  eve@company.com|
|  Frank|Engineering|  null|             null|
|  Grace|      Sales| 97000|grace@company.com|
+-------+-----------+------+-----------------+
```

## Detecting Nulls

### Count nulls per column

```python
# Count nulls in each column
df.select([
    count(when(col(c).isNull(), c)).alias(c)
    for c in df.columns
]).show()
```

### Expected Output
```
+----+----------+------+-----+
|name|department|salary|email|
+----+----------+------+-----+
|   1|         1|     2|    2|
+----+----------+------+-----+
```

### Check if a specific column has nulls

```python
# Filter rows where salary is null
df.filter(col("salary").isNull()).show()
```

### Expected Output
```
+-----+-----------+------+---------------+
| name| department|salary|          email|
+-----+-----------+------+---------------+
|  Bob|  Marketing|  null|bob@company.com|
|Frank|Engineering|  null|           null|
+-----+-----------+------+---------------+
```

## Dropping Rows with Nulls

### Drop rows where ANY column is null

```python
df.dropna().show()
```

### Expected Output
```
+-----+-----------+------+-----------------+
| name| department|salary|            email|
+-----+-----------+------+-----------------+
|Alice|Engineering|120000|alice@company.com|
|Diana|      Sales| 88000|diana@company.com|
|Grace|      Sales| 97000|grace@company.com|
+-----+-----------+------+-----------------+
```

That's aggressive — we lost 4 out of 7 rows.

### Drop rows where ALL columns are null

```python
# Only drop rows where every column is null
df.dropna(how="all").show()
```

This keeps all our rows since none of them are entirely null.

### Drop rows based on specific columns

```python
# Only drop rows where name OR department is null
df.dropna(subset=["name", "department"]).show()
```

### Expected Output
```
+-----+-----------+------+-----------------+
| name| department|salary|            email|
+-----+-----------+------+-----------------+
|Alice|Engineering|120000|alice@company.com|
|  Bob|  Marketing|  null|  bob@company.com|
|Diana|      Sales| 88000|diana@company.com|
|Frank|Engineering|  null|             null|
|Grace|      Sales| 97000|grace@company.com|
+-----+-----------+------+-----------------+
```

### Drop rows with a threshold

```python
# Keep rows that have at least 3 non-null values
df.dropna(thresh=3).show()
```

## Filling Null Values

### Fill all nulls with a single value

```python
# Fill all string nulls with "Unknown" and numeric nulls with 0
df_filled = df.fillna("Unknown").fillna(0)
df_filled.show()
```

### Expected Output
```
+-------+-----------+------+-----------------+
|   name| department|salary|            email|
+-------+-----------+------+-----------------+
|  Alice|Engineering|120000|alice@company.com|
|    Bob|  Marketing|     0|  bob@company.com|
|Charlie|    Unknown|130000|          Unknown|
|  Diana|      Sales| 88000|diana@company.com|
|Unknown|  Marketing| 92000|  eve@company.com|
|  Frank|Engineering|     0|          Unknown|
|  Grace|      Sales| 97000|grace@company.com|
+-------+-----------+------+-----------------+
```

### Fill specific columns with specific values

```python
df_filled = df.fillna({
    "name": "Unknown",
    "department": "Unassigned",
    "salary": 0,
    "email": "no-email@company.com",
})
df_filled.show()
```

### Expected Output
```
+-------+-----------+------+--------------------+
|   name| department|salary|               email|
+-------+-----------+------+--------------------+
|  Alice|Engineering|120000|   alice@company.com|
|    Bob|  Marketing|     0|     bob@company.com|
|Charlie| Unassigned|130000|no-email@company.com|
|  Diana|      Sales| 88000|   diana@company.com|
|Unknown|  Marketing| 92000|     eve@company.com|
|  Frank|Engineering|     0|no-email@company.com|
|  Grace|      Sales| 97000|   grace@company.com|
+-------+-----------+------+--------------------+
```

### Fill with column-specific logic using coalesce

`coalesce` returns the first non-null value from a list of columns or expressions:

```python
# If email is null, construct one from the name
df_smart = df.withColumn(
    "email",
    coalesce(
        col("email"),
        when(col("name").isNotNull(),
             lower(col("name")) + lit("@company.com"))
    )
)
df_smart.select("name", "email").show()
```

### Expected Output
```
+-------+-------------------+
|   name|              email|
+-------+-------------------+
|  Alice|  alice@company.com|
|    Bob|    bob@company.com|
|Charlie|charlie@company.com|
|  Diana|  diana@company.com|
|   null|    eve@company.com|
|  Frank|  frank@company.com|
|  Grace|  grace@company.com|
+-------+-------------------+
```

## Handling Duplicates

```python
# Add a duplicate row for demonstration
data_with_dup = data + [("Alice", "Engineering", 120000, "alice@company.com")]
df_dup = spark.createDataFrame(data_with_dup, ["name", "department", "salary", "email"])

# Count before
print(f"Before: {df_dup.count()} rows")

# Drop exact duplicate rows
df_deduped = df_dup.dropDuplicates()
print(f"After dropDuplicates: {df_deduped.count()} rows")

# Drop duplicates based on specific columns
df_deduped_name = df_dup.dropDuplicates(["name"])
print(f"After dropDuplicates on name: {df_deduped_name.count()} rows")
```

### Expected Output
```
Before: 8 rows
After dropDuplicates: 7 rows
After dropDuplicates on name: 7 rows
```

## Replacing Values

```python
# Replace specific values
df_replaced = df.replace("Marketing", "Growth", ["department"])
df_replaced.show()
```

### Expected Output
```
+-------+-----------+------+-----------------+
|   name| department|salary|            email|
+-------+-----------+------+-----------------+
|  Alice|Engineering|120000|alice@company.com|
|    Bob|     Growth|  null|  bob@company.com|
|Charlie|       null|130000|             null|
|  Diana|      Sales| 88000|diana@company.com|
|   null|     Growth| 92000|  eve@company.com|
|  Frank|Engineering|  null|             null|
|  Grace|      Sales| 97000|grace@company.com|
+-------+-----------+------+-----------------+
```

## Cleaning String Data

```python
messy_data = [
    ("  Alice  ", "  ENGINEERING  "),
    ("bob", " marketing"),
    ("CHARLIE", "Engineering  "),
]
df_messy = spark.createDataFrame(messy_data, ["name", "department"])

# Trim whitespace and standardize case
df_clean = df_messy \
    .withColumn("name", trim(col("name"))) \
    .withColumn("department", lower(trim(col("department"))))

df_clean.show()
```

### Expected Output
```
+-------+-----------+
|   name| department|
+-------+-----------+
|  Alice|engineering|
|    bob|  marketing|
|CHARLIE|engineering|
+-------+-----------+
```

## Common Mistakes

- **Using `== None` instead of `.isNull()`.** In PySpark, `col("salary") == None` does NOT work. Use `col("salary").isNull()` or `col("salary").isNotNull()`. This is different from Python where `x is None` works.
- **Filling nulls with the wrong type.** `df.fillna("0", subset=["salary"])` fills a numeric column with the string "0" only if the column is a string type. For integer columns, use `df.fillna(0, subset=["salary"])` — the value must match the column's data type.
- **Dropping nulls too aggressively.** Using `dropna()` without `subset` or `thresh` can remove most of your data. Always check how many rows you'll lose first: `df.dropna().count()` vs `df.count()`.

## Key Takeaways

- Always start by counting nulls per column to understand the scope of the problem.
- `dropna(subset=[...])` is safer than `dropna()` — only drop rows where critical columns are null.
- `fillna()` with a dictionary lets you set different defaults for different columns.
- `coalesce()` is powerful for "fall through" logic — use the first available value from multiple sources.
- Clean strings with `trim()` and `lower()` before doing any comparisons or groupBy operations.
- Use `.isNull()` and `.isNotNull()` — never `== None`.

## Next Lesson

Your data is clean. Now how do you get it in the first place? In **Lesson 12: Reading CSV, JSON, and Parquet Files**, we'll dive deep into file formats — when to use each one, how to handle tricky files, and why Parquet is the format every data engineer should know.
