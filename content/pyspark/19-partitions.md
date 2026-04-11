---
title: "Partitions — How Spark Splits Your Data"
description: "Learn what PySpark partitions are, why they matter for performance, how to check and control partition count, and the default partition behavior."
order: 19
module: "spark-internals"
module_title: "Spark Internals"
tags: ["pyspark", "partitions", "parallelism", "getNumPartitions", "intermediate"]
prev_slug: "lazy-evaluation-and-dag"
next_slug: "shuffles"
---

# Partitions — How Spark Splits Your Data

## What You'll Learn
- What partitions are and why they exist
- How Spark decides the number of partitions
- How to check and change partition count
- The relationship between partitions, tasks, and parallelism
- Signs of too many or too few partitions

## The Deck of Cards Analogy

In Lesson 1, we introduced the vocabulary word "partition" — a chunk of your data. Now let's understand it properly.

Imagine you have a deck of 52 cards and 4 friends to help sort them. You deal 13 cards to each friend — that's 4 partitions of 13 cards each. Each friend sorts their pile simultaneously. More friends = more parallelism = faster sorting (up to a point).

Spark works the same way. It splits your DataFrame into partitions and processes each partition on a separate CPU core in parallel.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, spark_partition_id

spark = SparkSession.builder.appName("Partitions").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# Create a DataFrame with 1000 rows
data = [(i, f"user_{i}", i * 10) for i in range(1000)]
df = spark.createDataFrame(data, ["id", "name", "score"])

# Check how many partitions Spark created
print(f"Number of partitions: {df.rdd.getNumPartitions()}")
```

### Expected Output
```
Number of partitions: 8
```

The exact number depends on your machine's CPU cores. Spark typically creates one partition per available core.

## Seeing Which Rows Are in Which Partition

```python
# spark_partition_id() tells you which partition each row belongs to
df.withColumn("partition", spark_partition_id()) \
    .groupBy("partition") \
    .count() \
    .orderBy("partition") \
    .show()
```

### Expected Output
```
+---------+-----+
|partition|count|
+---------+-----+
|        0|  125|
|        1|  125|
|        2|  125|
|        3|  125|
|        4|  125|
|        5|  125|
|        6|  125|
|        7|  125|
+---------+-----+
```

1000 rows split evenly across 8 partitions = 125 rows each. This is ideal — every core gets the same amount of work.

## How Spark Decides Partition Count

The default depends on how the data was created:

**From `createDataFrame` or `parallelize`:** Spark uses the number of available CPU cores (typically `spark.default.parallelism`).

**From reading files:** Spark creates roughly one partition per file block. For a 1 GB CSV with 128 MB HDFS block size, that's about 8 partitions. For a directory of 100 Parquet files, that's 100 partitions.

**After a shuffle operation (groupBy, join, orderBy):** Spark uses `spark.sql.shuffle.partitions`, which defaults to **200**. This is often too many for small datasets and too few for very large ones.

```python
# Check the default shuffle partition count
print(spark.conf.get("spark.sql.shuffle.partitions"))  # 200
```

## The Partitions → Tasks → Cores Relationship

```
DataFrame has 8 partitions
    → Spark creates 8 tasks (one per partition)
        → 8 tasks run on available CPU cores in parallel
```

If you have 4 cores and 8 partitions, Spark runs 4 tasks at a time, then the other 4. If you have 4 cores and 200 partitions, Spark runs tasks in 50 waves of 4 — lots of overhead from task scheduling.

**The sweet spot:** 2-4 partitions per core, with each partition containing 100 MB – 1 GB of data.

## Too Few Partitions

```python
# Simulate too few partitions
df_one_partition = df.coalesce(1)
print(f"Partitions: {df_one_partition.rdd.getNumPartitions()}")  # 1
```

With 1 partition, only 1 core does any work. The other cores sit idle. On a cluster with 100 cores, you're using 1% of your capacity.

**Signs of too few partitions:**
- Spark UI shows most executors are idle
- One task takes much longer than others
- You're not utilizing available cluster resources

## Too Many Partitions

```python
# Simulate too many partitions
df_many = df.repartition(1000)
print(f"Partitions: {df_many.rdd.getNumPartitions()}")  # 1000
```

With 1000 partitions for 1000 rows, each partition has just 1 row. The overhead of managing 1000 tasks far exceeds the work in each task.

**Signs of too many partitions:**
- Tasks complete in milliseconds (less than 100ms)
- The Spark UI shows a lot of task scheduling overhead
- The overall job takes longer than expected despite low per-task time

## Checking Partition Sizes

```python
# See how much data is in each partition
partition_sizes = df.withColumn("partition", spark_partition_id()) \
    .groupBy("partition") \
    .count() \
    .orderBy("count")

partition_sizes.show()
```

If the counts are wildly uneven (e.g., partition 0 has 900 rows and partition 1 has 100 rows), you have **data skew** — we'll cover this in Lesson 26.

## Changing Partition Count

Two methods, with an important difference:

```python
# repartition(n) — full shuffle, creates exactly n partitions
# Use when: you need MORE partitions, or even distribution
df_8 = df.repartition(8)

# coalesce(n) — no shuffle, can only REDUCE partitions
# Use when: you need FEWER partitions
df_4 = df.coalesce(4)
```

We'll explain the difference in detail in Lesson 22 (Repartition vs Coalesce). For now, the rule is: use `coalesce` to reduce, `repartition` to increase.

## Partition Count After Operations

Different operations change the partition count:

```python
print(f"Original: {df.rdd.getNumPartitions()}")              # 8

# filter doesn't change partition count
filtered = df.filter(col("score") > 500)
print(f"After filter: {filtered.rdd.getNumPartitions()}")     # 8

# groupBy uses spark.sql.shuffle.partitions (default 200)
grouped = df.groupBy("name").count()
print(f"After groupBy: {grouped.rdd.getNumPartitions()}")     # 200

# join also uses shuffle partitions
joined = df.join(df, on="id")
print(f"After join: {joined.rdd.getNumPartitions()}")         # 200
```

That jump from 8 to 200 after a groupBy is why many beginners see their jobs produce hundreds of tiny output files. Setting `spark.sql.shuffle.partitions` to a reasonable number helps:

```python
spark.conf.set("spark.sql.shuffle.partitions", 8)
grouped = df.groupBy("name").count()
print(f"After groupBy: {grouped.rdd.getNumPartitions()}")     # 8
```

## Common Mistakes

- **Leaving `spark.sql.shuffle.partitions` at the default 200 for small datasets.** If your data is a few MB, 200 partitions means each partition has kilobytes of data — pure overhead. Set it to 2-10 for small datasets.
- **Using `repartition` when `coalesce` would work.** Repartition triggers a full shuffle (moving data across the cluster). If you just want fewer partitions, `coalesce` avoids the shuffle by combining adjacent partitions.
- **Ignoring partition count in the Spark UI.** The Tasks column in the Spark UI shows you exactly how many partitions each stage processed. If you see 200 tasks completing in 5ms each, your partition count is too high.

## Key Takeaways

- Partitions are chunks of data that Spark processes in parallel — one task per partition.
- Default partition count depends on the data source and operation type.
- After shuffle operations, Spark uses `spark.sql.shuffle.partitions` (default 200) — tune this for your data size.
- Aim for 2-4 partitions per core, with 100 MB – 1 GB per partition.
- Use `rdd.getNumPartitions()` and `spark_partition_id()` to inspect partitions.
- Too few partitions = wasted cores. Too many = scheduling overhead. Both are bad.

## Next Lesson

We've mentioned "shuffle" several times without fully explaining it. In **Lesson 20: Shuffles — The Most Expensive Thing in Spark**, we'll finally dig into what shuffles are, why they're slow, and how to minimize them.
