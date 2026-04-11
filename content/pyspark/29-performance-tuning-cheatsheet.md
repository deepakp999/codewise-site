---
title: "PySpark Performance Tuning Cheat Sheet"
description: "A quick-reference guide to PySpark optimization: shuffle reduction, join strategies, partition tuning, caching rules, and key Spark configurations."
order: 29
module: "interview-prep"
module_title: "Interview Prep & Next Steps"
tags: ["pyspark", "performance", "optimization", "cheat sheet", "reference"]
prev_slug: "interview-questions"
next_slug: "where-to-go-next"
---

# PySpark Performance Tuning Cheat Sheet

## What This Page Is

This is a one-page reference — not a lesson. Bookmark it. Come back to it when your PySpark job is slow. Every tip here is explained in detail in earlier lessons (referenced in parentheses).

## Rule 1: Reduce What Gets Shuffled

Shuffles are the #1 performance bottleneck. (Lesson 20)

**Filter early.** Move `filter()` before `groupBy()` and `join()`. Fewer rows = smaller shuffle.

**Select only needed columns.** Before a join, select only the join key plus the columns you actually need. `orders.select("customer_id", "amount").join(...)` shuffles less data than `orders.join(...)`.

**Use `agg()` for multiple aggregations.** `df.groupBy("dept").agg(count("*"), avg("salary"))` shuffles once. Separate `count()` and `avg()` calls shuffle twice.

**Avoid unnecessary `orderBy()`.** Sorting triggers a full shuffle. Only sort at the final output step if the consumer requires ordered data.

## Rule 2: Broadcast Small Tables

If one join table fits in executor memory (< 100 MB), broadcast it. (Lesson 25)

```python
from pyspark.sql.functions import broadcast
result = large_df.join(broadcast(small_df), on="key")
```

Spark auto-broadcasts tables under 10 MB. Override with:
```python
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 50 * 1024 * 1024)  # 50 MB
```

Check `explain()` for `BroadcastHashJoin` to verify.

## Rule 3: Tune Partition Count

Target: 2–4 partitions per core, 100 MB – 1 GB per partition. (Lesson 19)

```python
# Check current partition count
df.rdd.getNumPartitions()

# Set shuffle partition count (default 200 — too many for small data)
spark.conf.set("spark.sql.shuffle.partitions", 8)  # Adjust to your data size

# Reduce partitions without shuffle
df.coalesce(4)

# Redistribute evenly (triggers shuffle)
df.repartition(8)
```

**Signs of wrong partition count:**
- Tasks completing in < 100ms → too many partitions
- One task taking 10x longer than others → data skew or too few partitions
- Executors sitting idle → too few partitions

## Rule 4: Cache Wisely

Cache DataFrames that are expensive AND reused. (Lesson 24)

```python
expensive_df.cache()          # Mark for caching
expensive_df.count()          # Force materialization
# ... use expensive_df multiple times ...
expensive_df.unpersist()      # Free memory when done
```

**Do cache:** Join results used for multiple output tables. Filtered datasets used in multiple aggregations.

**Don't cache:** DataFrames used only once. Cheap operations (simple selects). Very large DataFrames that won't fit in memory.

## Rule 5: Avoid UDFs

Built-in functions are 10–100x faster than Python UDFs. (Lesson 17)

```python
# SLOW: Python UDF
@udf(returnType=StringType())
def get_domain(email):
    return email.split("@")[1]

# FAST: Built-in functions
from pyspark.sql.functions import split, element_at
df.withColumn("domain", element_at(split(col("email"), "@"), 2))
```

If you must use a UDF, use `@pandas_udf` for 5–10x improvement.

## Rule 6: Use the Right File Format

Parquet > JSON > CSV for everything except external interfaces. (Lesson 12)

- **Parquet:** Columnar, compressed, schema-embedded. Supports column pruning and predicate pushdown.
- **CSV:** Only for import/export to non-Spark systems.
- **JSON:** Only for API data ingestion.

Partition output by commonly queried columns:
```python
df.write.partitionBy("year", "month").parquet("output/")
```

## Rule 7: Define Schemas Explicitly

`inferSchema=True` reads the data twice. (Lesson 7)

```python
# SLOW
df = spark.read.csv("data.csv", header=True, inferSchema=True)

# FAST (2-3x for large files)
schema = "id INT, name STRING, salary DOUBLE, date DATE"
df = spark.read.csv("data.csv", header=True, schema=schema)
```

## Rule 8: Fix Data Skew

If one partition is 10x+ larger than others, use salting. (Lesson 26)

**For skewed joins:**
```python
# Add salt to large table, explode small table
orders_salted = orders.withColumn("salt", (rand() * 10).cast("int"))
products_exploded = products.crossJoin(spark.range(10).withColumnRenamed("id", "salt"))
result = orders_salted.join(products_exploded, on=["product_id", "salt"])
```

**For skewed groupBy:** Use two-stage aggregation (partial agg with salt → final agg without salt).

**Enable AQE** for automatic moderate-skew handling:
```python
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
```

## Key Spark Configurations

```python
# Parallelism
spark.conf.set("spark.sql.shuffle.partitions", "200")    # Partitions after shuffle
spark.conf.set("spark.default.parallelism", "200")       # RDD parallelism

# Memory
spark.conf.set("spark.executor.memory", "4g")            # Per-executor RAM
spark.conf.set("spark.driver.memory", "2g")              # Driver RAM
spark.conf.set("spark.memory.fraction", "0.6")           # Fraction of executor memory for Spark

# Joins
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "10485760")  # 10 MB

# Adaptive Query Execution
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

# Serialization
spark.conf.set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
```

## Debugging Checklist

When a PySpark job is slow:

1. **Open the Spark UI** (localhost:4040)
2. **Check stages** — which stage is slowest?
3. **Check shuffle size** — is it disproportionately large?
4. **Check task distribution** — is one task much slower (skew)?
5. **Run `explain()`** — is Spark doing BroadcastHashJoin or SortMergeJoin?
6. **Check partition count** — too many small tasks or too few large ones?
7. **Check for UDFs** — can they be replaced with built-in functions?
8. **Check caching** — are expensive DataFrames recomputed multiple times?

## Next Lesson

You've learned PySpark from zero to production. In **Lesson 30: Where to Go Next**, we'll map out your continued learning path — Structured Streaming, MLlib, Delta Lake, Databricks, and beyond.
