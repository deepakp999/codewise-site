---
title: "Spark vs Pandas — When to Use Which"
description: "Compare Apache Spark and Pandas side-by-side. Learn when to use each tool based on data size, complexity, and performance needs."
order: 2
module: "getting-started"
module_title: "Getting Started"
tags: ["pyspark", "pandas", "comparison"]
prev_slug: "what-is-spark"
next_slug: "installing-pyspark"
---

# Spark vs Pandas — When to Use Which

## What You'll Learn
- The fundamental differences between Spark and Pandas
- Performance characteristics at different data scales
- How to decide which tool to use for your project
- Common patterns for migrating from Pandas to Spark

## The Core Difference

**Pandas** runs on a single machine and stores data in memory. It's fast, intuitive, and perfect for exploratory data analysis.

**Spark** distributes data across a cluster of machines. It handles massive datasets but has more overhead for small tasks.

Think of it this way: Pandas is a sports car (fast, nimble, limited cargo). Spark is a freight train (slower to start, but moves mountains of data).

## Side-by-Side Comparison

| Feature | Pandas | PySpark |
|---------|--------|---------|
| Data size | Up to ~10GB | Terabytes+ |
| Execution | Single machine | Distributed cluster |
| API style | Eager (runs immediately) | Lazy (builds a plan, runs later) |
| Learning curve | Lower | Higher |
| Best for | EDA, prototyping, small data | ETL, big data, production pipelines |

## The Same Task in Both

### Reading a CSV and computing averages

**Pandas approach:**

```python
import pandas as pd

df = pd.read_csv("sales_data.csv")
avg_revenue = df.groupby("product")["revenue"].mean()
print(avg_revenue)
```

**PySpark approach:**

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import avg

spark = SparkSession.builder.appName("Compare").getOrCreate()
df = spark.read.csv("sales_data.csv", header=True, inferSchema=True)
avg_revenue = df.groupBy("product").agg(avg("revenue"))
avg_revenue.show()
```

### Expected Output
```
+---------+------------------+
| product |   avg(revenue)   |
+---------+------------------+
|  Widget |           29.99  |
|  Gadget |           49.99  |
|  Gizmo  |           19.99  |
+---------+------------------+
```

## Lazy vs Eager Evaluation

This is the biggest conceptual difference. Pandas executes operations immediately:

```python
# Pandas: this runs RIGHT NOW
filtered = df[df["revenue"] > 30]
```

Spark builds a plan but doesn't execute it until you ask for results:

```python
# PySpark: this just creates a plan
filtered = df.filter(df["revenue"] > 30)

# THIS triggers execution
filtered.show()
```

This lazy approach lets Spark optimize the entire pipeline before running it — like a GPS planning the fastest route before you start driving.

## When to Use Each

### Use Pandas when:
- Your data fits in memory (< 10GB)
- You're doing exploratory data analysis
- You need quick, interactive results
- You're prototyping before building a pipeline

### Use Spark when:
- Your data exceeds a single machine's memory
- You need to process data on a schedule (ETL)
- You're joining multiple large datasets
- You need real-time streaming capabilities

## The Migration Path

Many teams start with Pandas for prototyping, then migrate to Spark for production. PySpark's DataFrame API is intentionally similar to Pandas to make this transition smoother.

```python
# Pandas
df.groupby("product")["revenue"].mean()

# PySpark — very similar!
df.groupBy("product").agg(avg("revenue"))
```

## Common Mistakes

- **Using Spark for a 100MB file.** Spark's startup time alone might be longer than Pandas processing the whole file. Use the right tool for the scale.
- **Collecting all Spark data to the driver.** `df.collect()` pulls all data to a single machine — defeating the purpose. Use `.show()` or `.take(n)` instead.
- **Assuming identical APIs.** While similar, there are differences. For example, Pandas uses `df['col']` for selection, PySpark uses `df.select('col')`.

## Key Takeaways
- Pandas is best for datasets under ~10GB on a single machine
- Spark is best for large-scale distributed data processing
- Spark uses lazy evaluation, Pandas uses eager evaluation
- The APIs are similar by design to ease migration
- Start with Pandas, move to Spark when data outgrows it

## Next Lesson
Now that you know when to use Spark, let's get it installed on your machine.
