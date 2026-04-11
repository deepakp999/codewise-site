---
title: "Repartition vs Coalesce — When to Use Which"
description: "Understand the difference between repartition and coalesce in PySpark, when to use each, and practical patterns for controlling partition count."
order: 22
module: "spark-internals"
module_title: "Spark Internals"
tags: ["pyspark", "repartition", "coalesce", "partitions", "performance", "intermediate"]
prev_slug: "catalyst-optimizer"
next_slug: "etl-pipeline"
---

# Repartition vs Coalesce — When to Use Which

## What You'll Learn
- The exact difference between `repartition` and `coalesce`
- When each one triggers (or avoids) a shuffle
- Common patterns: writing fewer output files, pre-join partitioning, fixing skew
- The cost-benefit trade-off for each approach

## The One-Line Answer

- **`repartition(n)`** — full shuffle, creates exactly n evenly distributed partitions. Can increase or decrease.
- **`coalesce(n)`** — no shuffle, combines adjacent partitions. Can only decrease. Partitions may be uneven.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import spark_partition_id, count

spark = SparkSession.builder.appName("RepartitionVsCoalesce").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [(i, f"user_{i}", i * 10) for i in range(1000)]
df = spark.createDataFrame(data, ["id", "name", "score"])
print(f"Original partitions: {df.rdd.getNumPartitions()}")
```

### Expected Output
```
Original partitions: 8
```

## Repartition: Full Shuffle

```python
# Repartition to 4 — triggers a full shuffle
df_repart = df.repartition(4)
print(f"After repartition(4): {df_repart.rdd.getNumPartitions()}")

# Check distribution — should be even
df_repart.withColumn("partition", spark_partition_id()) \
    .groupBy("partition").count().orderBy("partition").show()
```

### Expected Output
```
After repartition(4): 4
+---------+-----+
|partition|count|
+---------+-----+
|        0|  250|
|        1|  250|
|        2|  250|
|        3|  250|
+---------+-----+
```

Perfectly even — 250 rows each. The full shuffle redistributed data evenly.

```python
# Repartition to 16 — can also INCREASE partitions
df_repart_up = df.repartition(16)
print(f"After repartition(16): {df_repart_up.rdd.getNumPartitions()}")
```

## Coalesce: No Shuffle

```python
# Coalesce to 4 — NO shuffle
df_coal = df.coalesce(4)
print(f"After coalesce(4): {df_coal.rdd.getNumPartitions()}")

# Check distribution — may be uneven
df_coal.withColumn("partition", spark_partition_id()) \
    .groupBy("partition").count().orderBy("partition").show()
```

### Expected Output
```
After coalesce(4): 4
+---------+-----+
|partition|count|
+---------+-----+
|        0|  250|
|        1|  250|
|        2|  250|
|        3|  250|
+---------+-----+
```

In this case the distribution looks even because the original 8 partitions were already balanced. But coalesce works by merging adjacent partitions — if the original partitions were uneven, the result would be uneven too.

```python
# Coalesce CANNOT increase partitions — this does nothing
df_coal_up = df.coalesce(16)
print(f"After coalesce(16): {df_coal_up.rdd.getNumPartitions()}")
```

### Expected Output
```
After coalesce(16): 8
```

Still 8 — coalesce silently ignores requests to increase.

## Repartition by Column

You can repartition based on a column value — all rows with the same value end up in the same partition:

```python
# Repartition by department — all "Engineering" rows in one partition
data_dept = [(i, f"dept_{i % 3}", i * 100) for i in range(1000)]
df_dept = spark.createDataFrame(data_dept, ["id", "department", "salary"])

df_by_dept = df_dept.repartition("department")
df_by_dept.withColumn("partition", spark_partition_id()) \
    .groupBy("department", "partition").count() \
    .orderBy("department", "partition").show()
```

This is useful before a join — if both tables are partitioned by the join key, Spark can do a more efficient join.

## The Decision Matrix

```
Situation                              Use
────────────────────────────────────   ──────────────
Need FEWER partitions for output       coalesce(n)
Need MORE partitions for parallelism   repartition(n)
Need EVEN distribution                 repartition(n)
Pre-partitioning for a join            repartition(col)
Writing a single output file           coalesce(1)
After filter removed most data         coalesce(n)
Fixing data skew                       repartition(n)
```

## Common Patterns

### Pattern 1: Writing fewer output files

```python
# Without coalesce: 200 tiny Parquet files (one per shuffle partition)
df.groupBy("department").count().write.parquet("output/counts")

# With coalesce: 1 file
df.groupBy("department").count().coalesce(1).write.parquet("output/counts")
```

### Pattern 2: After a heavy filter

```python
# Original: 100 partitions with 10 million rows
# After filter: 100 partitions with only 1000 rows (99.99% filtered out)
filtered = big_df.filter(col("status") == "error")

# Now most partitions are empty — coalesce to remove the empties
filtered.coalesce(4).write.parquet("output/errors")
```

### Pattern 3: Before writing partitioned data

```python
# Repartition by the write partition key for efficient, non-overlapping files
df.repartition("year", "month") \
    .write.partitionBy("year", "month") \
    .parquet("output/sales")
```

Without the `repartition`, each output partition directory might contain files from many input partitions — creating many small files. With `repartition` by the same columns, each output directory gets one well-sized file.

## Common Mistakes

- **Using `coalesce(1)` on large datasets.** This forces all data through a single partition — one core does all the work. Fine for 1000 rows, dangerous for 10 GB. If you need a single output file from a large dataset, consider: do you really need one file, or can downstream tools handle a directory of files?
- **Using `repartition` when `coalesce` would work.** If you're going from 200 partitions to 10, `coalesce(10)` avoids a shuffle. `repartition(10)` does the same thing but with an unnecessary shuffle. The only reason to prefer `repartition` when reducing is if you need perfectly even partition sizes.
- **Forgetting that `coalesce` can create uneven partitions.** If you have 8 partitions of sizes [100, 100, 100, 100, 100, 100, 100, 900] and coalesce to 4, you might get [200, 200, 200, 1000]. If this unevenness matters, use `repartition` instead.

## Key Takeaways

- `coalesce(n)` — reduces partitions without a shuffle. Fast but may create uneven partitions.
- `repartition(n)` — full shuffle, creates exactly n even partitions. Can increase or decrease.
- `repartition(col)` — partitions by column value. Useful before joins and writes.
- Use `coalesce` to reduce, `repartition` to increase or to get even distribution.
- Always consider partition count when writing output — too many partitions = too many small files.
- The shuffle cost of `repartition` is real — don't use it if `coalesce` achieves the same goal.

## Next Lesson

Module 4 is complete! You now understand Spark's execution model — lazy evaluation, DAGs, partitions, shuffles, and the Catalyst optimizer. In **Module 5: Real-World Patterns**, we start building production-quality PySpark code, beginning with **Lesson 23: Building an ETL Pipeline from Scratch**.
