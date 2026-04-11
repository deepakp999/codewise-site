---
title: "Caching and Persistence — Speed Up Repeated Queries"
description: "Learn when and how to use cache() and persist() in PySpark, understand storage levels, and avoid common caching pitfalls."
order: 24
module: "real-world-patterns"
module_title: "Real-World Patterns"
tags: ["pyspark", "cache", "persist", "storage levels", "performance", "intermediate"]
prev_slug: "etl-pipeline"
next_slug: "broadcast-joins"
---

# Caching and Persistence — Speed Up Repeated Queries

## What You'll Learn
- Why caching matters (the recomputation problem)
- How to use `cache()` and `persist()`
- The different storage levels and when to use each
- When caching helps and when it hurts
- How to monitor cached data in the Spark UI

## The Recomputation Problem

Remember from Lesson 18: every action triggers recomputation from scratch. If you use the same DataFrame in two different actions, Spark computes it twice:

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, avg, sum as spark_sum

spark = SparkSession.builder.appName("Caching").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [(i, f"dept_{i % 5}", i * 100) for i in range(100000)]
df = spark.createDataFrame(data, ["id", "department", "salary"])

# Expensive transformation
enriched = df.filter(col("salary") > 50000) \
    .withColumn("tax", col("salary") * 0.3) \
    .withColumn("net", col("salary") * 0.7)

# Action 1 — Spark computes enriched from scratch
enriched.groupBy("department").avg("salary").show()

# Action 2 — Spark computes enriched from scratch AGAIN
enriched.groupBy("department").count().show()
```

Both actions repeat the filter and withColumn calculations. On a large dataset with complex transformations, this is wasteful.

## The Fix: cache()

```python
# Tell Spark to keep this DataFrame in memory after the first computation
enriched = df.filter(col("salary") > 50000) \
    .withColumn("tax", col("salary") * 0.3) \
    .withColumn("net", col("salary") * 0.7)

enriched.cache()  # Mark for caching (lazy — nothing happens yet)

# Action 1 — computes AND stores in memory
enriched.groupBy("department").avg("salary").show()

# Action 2 — reads from memory, no recomputation
enriched.groupBy("department").count().show()
```

The first action after `cache()` computes the data and stores it in memory. Every subsequent action reads from memory — much faster.

## cache() vs persist()

`cache()` is a shortcut for `persist()` with the default storage level:

```python
# These are identical
df.cache()
df.persist()  # Defaults to MEMORY_AND_DISK

# persist() lets you choose a storage level
from pyspark import StorageLevel

df.persist(StorageLevel.MEMORY_ONLY)
df.persist(StorageLevel.MEMORY_AND_DISK)
df.persist(StorageLevel.DISK_ONLY)
df.persist(StorageLevel.MEMORY_ONLY_SER)
df.persist(StorageLevel.MEMORY_AND_DISK_SER)
```

### Storage Levels Explained

**MEMORY_AND_DISK (default)** — Store in memory. If it doesn't fit, spill to disk. Best general-purpose option.

**MEMORY_ONLY** — Store in memory only. If it doesn't fit, the partitions that overflow are recomputed each time. Use when you have plenty of memory.

**DISK_ONLY** — Store on disk only. Slower than memory but uses no executor memory. Use for very large DataFrames you access occasionally.

**MEMORY_ONLY_SER / MEMORY_AND_DISK_SER** — Store as serialized bytes. Uses less memory but requires CPU to deserialize on each read. Use when memory is tight.

**For most cases, the default (MEMORY_AND_DISK) is the right choice.** Only change it if you have a specific memory constraint.

## When to Cache

Cache when a DataFrame is:
1. **Expensive to compute** (involves joins, groupBy, complex transformations)
2. **Used multiple times** (fed into multiple actions or downstream DataFrames)

```python
# GOOD — expensive to compute, used multiple times
enriched = big_df.join(lookup_table, on="key") \
    .groupBy("category").agg(avg("value"))
enriched.cache()

report_1 = enriched.filter(col("category") == "A")
report_2 = enriched.filter(col("category") == "B")
total = enriched.agg(spark_sum("avg(value)"))
```

## When NOT to Cache

```python
# BAD — used only once, caching wastes memory
df = spark.read.parquet("data.parquet")
df.cache()  # Pointless — only used in the next line
df.groupBy("dept").count().show()

# BAD — data is too large to fit in memory
huge_df = spark.read.parquet("500gb_data.parquet")
huge_df.cache()  # Will spill to disk, may cause memory pressure

# BAD — the transformation is cheap
simple = df.select("id", "name")
simple.cache()  # Reading two columns is fast — caching adds overhead without benefit
```

## Removing Cached Data

```python
# Remove a specific DataFrame from cache
enriched.unpersist()

# Clear all cached data
spark.catalog.clearCache()
```

Always `unpersist()` when you're done with a cached DataFrame. Cached data consumes executor memory that could be used for other operations.

## Monitoring Cache in the Spark UI

Open the Spark UI (localhost:4040) and click the **Storage** tab. You'll see:

- Which DataFrames are cached
- How much memory and disk each uses
- What fraction is cached (if it didn't fully fit in memory)

If you see "Fraction Cached" below 100%, your data is too large for the available memory and some partitions are being recomputed.

## A Production Pattern: Cache the Join Result

```python
# In an ETL pipeline where the enriched data feeds multiple outputs
order_details = orders \
    .join(products, on="product_id") \
    .join(customers, on="customer_id") \
    .withColumn("revenue", col("price") * col("quantity"))

# Cache the join result — it feeds three different outputs
order_details.cache()

# Output 1: Daily summary
order_details.groupBy("order_date").agg(spark_sum("revenue")).write.parquet("daily")

# Output 2: Product summary
order_details.groupBy("product_name").agg(spark_sum("revenue")).write.parquet("products")

# Output 3: Customer summary
order_details.groupBy("customer_id").agg(spark_sum("revenue")).write.parquet("customers")

# Done with the cached data
order_details.unpersist()
```

Without caching, the two joins would be computed three times. With caching, they're computed once and reused.

## Common Mistakes

- **Caching everything "just in case."** Each cached DataFrame consumes memory. Too much caching causes memory pressure, which triggers garbage collection pauses and spills. Only cache DataFrames that are genuinely reused.
- **Forgetting that `cache()` is lazy.** Calling `df.cache()` doesn't compute anything — it just marks the DataFrame for caching. The actual caching happens on the first action. If you want to force caching immediately, call `df.cache().count()`.
- **Not calling `unpersist()`.** Cached data stays in memory until you explicitly remove it or the SparkSession ends. In long-running applications, forgetting to unpersist can cause out-of-memory errors.
- **Caching before a filter.** Cache the filtered result, not the full dataset. `df.cache()` followed by `df.filter(...)` caches everything and then filters — wasting memory on rows you don't need.

## Key Takeaways

- Cache DataFrames that are expensive to compute AND used multiple times.
- `cache()` = `persist(MEMORY_AND_DISK)` — the default is usually fine.
- Caching is lazy — the first action after `cache()` computes and stores the data.
- Always `unpersist()` when done to free executor memory.
- Don't cache everything — over-caching causes memory pressure.
- Monitor cached data in the Spark UI's Storage tab.

## Next Lesson

In Lesson 15 we noted that joins trigger expensive shuffles. What if one of your tables is small enough to fit in memory? In **Lesson 25: Broadcast Joins**, we'll learn how to eliminate the shuffle entirely for small-table joins.
