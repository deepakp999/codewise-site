---
title: "Shuffles — The Most Expensive Thing in Spark"
description: "Understand what shuffles are in PySpark, what triggers them, how to read shuffle metrics in the Spark UI, and strategies to minimize them."
order: 20
module: "spark-internals"
module_title: "Spark Internals"
tags: ["pyspark", "shuffle", "performance", "spark ui", "intermediate"]
prev_slug: "partitions"
next_slug: "catalyst-optimizer"
---

# Shuffles — The Most Expensive Thing in Spark

## What You'll Learn
- What a shuffle is and why it's expensive
- Which operations trigger shuffles
- How to read shuffle metrics in the Spark UI
- Practical strategies to reduce shuffles
- The concept of narrow vs wide transformations

## What Is a Shuffle?

A shuffle is when Spark needs to move data between partitions across different machines. It's the most expensive operation in Spark — more expensive than reading data from disk, more expensive than any computation.

Think back to the card-sorting analogy. You have 4 friends, each with 13 cards. You ask: "Group all the hearts together." The problem is that hearts are scattered across all 4 piles. Each friend has some hearts. To put all hearts in one pile, cards need to physically move between friends. That's a shuffle.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, sum as spark_sum

spark = SparkSession.builder.appName("Shuffles").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")
spark.conf.set("spark.sql.shuffle.partitions", 4)

data = [(i, f"dept_{i % 3}", i * 100) for i in range(1000)]
df = spark.createDataFrame(data, ["id", "department", "salary"])
```

## Why Shuffles Are Expensive

A shuffle involves three costly steps:

1. **Write** — Each partition writes its data to local disk, organized by the shuffle key (the column you're grouping by)
2. **Transfer** — Data is sent over the network to the machines that need it
3. **Read** — The receiving machines read the shuffled data from disk

Network I/O is the bottleneck. Moving 10 GB of data between machines over a 10 Gbps network takes at minimum 8 seconds — and that's just the transfer, not counting serialization, disk I/O, and reassembly.

## What Triggers a Shuffle?

### Operations that ALWAYS shuffle:

```python
# groupBy — data must be grouped by key across all partitions
df.groupBy("department").count().explain()

# join (most types) — both tables repartitioned by join key
df.join(df, on="id").explain()

# orderBy / sort — global ordering requires comparing across partitions
df.orderBy("salary").explain()

# distinct — must compare all rows across partitions
df.distinct().explain()

# repartition — explicitly reshuffles data
df.repartition(8).explain()
```

### Operations that NEVER shuffle:

```python
# filter — each partition filters its own data independently
df.filter(col("salary") > 50000)

# select / withColumn — column operations within each partition
df.select("id", "salary")

# map-like operations — row-by-row transformations
df.withColumn("bonus", col("salary") * 0.1)

# coalesce (reducing partitions) — combines adjacent partitions, no data transfer
df.coalesce(2)
```

## Narrow vs Wide Transformations

This is the fundamental distinction in Spark:

**Narrow transformations** — each output partition depends on only one input partition. No data movement. Fast.
- `filter`, `select`, `withColumn`, `map`, `coalesce`

**Wide transformations** — each output partition depends on data from multiple input partitions. Requires a shuffle. Slow.
- `groupBy`, `join`, `orderBy`, `distinct`, `repartition`

Spark creates a new **stage** at every wide transformation. Within a stage, everything runs without shuffling. The stage boundary is the shuffle point.

## Reading Shuffle Metrics in the Spark UI

Remember the Spark UI from Lesson 5? Now you know what to look for.

Run a query that involves a shuffle:

```python
result = df.groupBy("department").agg(
    count("*").alias("count"),
    spark_sum("salary").alias("total_salary")
)
result.show()
```

In the Spark UI (localhost:4040), click on the job, then the stage. You'll see:

- **Shuffle Write** — how much data the first stage wrote out for the shuffle
- **Shuffle Read** — how much data the second stage read in
- **Shuffle Spill (Memory)** — data that didn't fit in memory and was spilled to disk
- **Shuffle Spill (Disk)** — how much was actually written to disk

**What to look for:**
- If Shuffle Read is much larger than your actual data, you may have data duplication from the join
- If Shuffle Spill (Disk) is non-zero, you need more memory or fewer partitions
- If one task's shuffle read is 10x larger than others, you have data skew (Lesson 26)

## Strategies to Reduce Shuffles

### 1. Filter before you shuffle

```python
# BAD — shuffles all 1 million rows, then filters
df.groupBy("department").count().filter(col("count") > 100)

# GOOD — filters first, shuffles fewer rows
df.filter(col("salary") > 50000).groupBy("department").count()
```

This seems obvious, but it's easy to forget when building complex pipelines. The Catalyst optimizer (Lesson 21) often does this automatically, but explicit filtering early in your chain makes your intent clear.

### 2. Reduce data before joining

```python
# BAD — joins two full tables, then selects columns
result = orders.join(customers, on="customer_id").select("name", "amount")

# GOOD — select only needed columns before joining
orders_slim = orders.select("customer_id", "amount")
customers_slim = customers.select("customer_id", "name")
result = orders_slim.join(customers_slim, on="customer_id")
```

Less data to shuffle = faster shuffle.

### 3. Use broadcast joins for small tables

If one table is small enough to fit in memory on every executor, you can broadcast it — eliminating the shuffle entirely. We'll cover this in depth in Lesson 25, but here's the preview:

```python
from pyspark.sql.functions import broadcast

# Instead of shuffling both tables, send the small table to every executor
result = orders.join(broadcast(customers), on="customer_id")
```

### 4. Set shuffle partitions appropriately

```python
# Default is 200 — way too many for small datasets
spark.conf.set("spark.sql.shuffle.partitions", 8)
```

### 5. Avoid unnecessary shuffles

```python
# BAD — distinct() triggers a shuffle
df.select("department").distinct()

# GOOD — if you just want to see unique values, dropDuplicates is often equivalent
df.select("department").dropDuplicates()

# BAD — orderBy at intermediate steps
df.filter(...).orderBy("salary").groupBy("department").count()

# GOOD — only sort at the final output if needed
df.filter(...).groupBy("department").count().orderBy("count")
```

## How Many Shuffles Is Too Many?

Check the Spark UI Jobs tab. Count the number of stages. Each stage boundary is a shuffle. A simple ETL pipeline might have 2-3 shuffles. A complex pipeline with multiple joins might have 5-8.

If you see 15+ stages, your pipeline is doing too many shuffles. Look for redundant joins, unnecessary sorts, or repeated groupBy operations that could be combined.

## Common Mistakes

- **Calling `orderBy` in the middle of a pipeline.** Sorting triggers a full shuffle. If you sort and then join, you've shuffled for the sort AND the join will re-shuffle everything anyway. Only sort as the final step before output.
- **Not checking shuffle size in the Spark UI.** A query that shuffles 100 GB when your source data is 10 GB usually means a bad join is creating data explosion (a many-to-many join producing more rows than either input).
- **Ignoring shuffle spill.** If the Spark UI shows shuffle spill to disk, your executors don't have enough memory for the shuffle. Either increase executor memory, reduce partition size, or filter data earlier.
- **Assuming the optimizer will fix everything.** The Catalyst optimizer is smart (Lesson 21), but it can't eliminate shuffles that are logically necessary. A `groupBy` always needs a shuffle. Your job is to minimize what gets shuffled.

## Key Takeaways

- A shuffle moves data between machines — it's the most expensive operation in Spark.
- Narrow transformations (filter, select) don't shuffle. Wide transformations (groupBy, join, orderBy) do.
- Every shuffle creates a new stage in the DAG.
- Reduce shuffles by: filtering early, selecting only needed columns, using broadcast joins for small tables, and avoiding unnecessary sorts.
- Use the Spark UI to monitor shuffle read/write sizes and spill metrics.
- The goal isn't zero shuffles (that's impossible for most queries) — it's minimal, efficient shuffles.

## Next Lesson

We keep mentioning the "Catalyst optimizer" that rearranges your queries. In **Lesson 21: Catalyst Optimizer**, we'll finally see how Spark rewrites your code for better performance — and why some things (like UDFs) break this optimization.
