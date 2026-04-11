---
title: "Data Skew — Diagnosing and Fixing Uneven Partitions"
description: "Learn how to detect and fix data skew in PySpark — the #1 cause of slow jobs. Covers salting, repartitioning, and Spark UI diagnosis."
order: 26
module: "real-world-patterns"
module_title: "Real-World Patterns"
tags: ["pyspark", "data skew", "salting", "performance", "advanced"]
prev_slug: "broadcast-joins"
next_slug: "production-pyspark"
---

# Data Skew — Diagnosing and Fixing Uneven Partitions

## What You'll Learn
- What data skew is and why it kills performance
- How to detect skew in the Spark UI and in code
- The salting technique to fix skewed joins
- When to use repartition vs AQE (Adaptive Query Execution)
- Real-world examples of skew and their fixes

## What Is Data Skew?

Data skew means your data is unevenly distributed across partitions. Instead of every partition having roughly the same amount of data, one or two partitions have vastly more than the others.

Imagine 4 friends sorting cards again. But this time, one friend gets 48 cards and the other three get 1 card each. Three friends finish instantly. Everyone waits for the one friend struggling through 48 cards. Your job is only as fast as the slowest partition.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, spark_partition_id, rand, concat, lit

spark = SparkSession.builder.appName("DataSkew").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")
spark.conf.set("spark.sql.shuffle.partitions", 4)

# Create a skewed dataset — 90% of rows have department "Engineering"
data = []
for i in range(100000):
    if i < 90000:
        data.append((i, "Engineering", i * 10))
    elif i < 95000:
        data.append((i, "Marketing", i * 10))
    else:
        data.append((i, "Sales", i * 10))

df = spark.createDataFrame(data, ["id", "department", "salary"])

# See the skew
df.groupBy("department").count().show()
```

### Expected Output
```
+-----------+-----+
| department|count|
+-----------+-----+
|Engineering|90000|
|  Marketing| 5000|
|      Sales| 5000|
+-----------+-----+
```

90% of the data is in one group. When you do a `groupBy("department")`, one partition processes 90,000 rows while others process 5,000. The job takes as long as the slowest partition.

## Detecting Skew

### In the Spark UI

After running a `groupBy` or `join`, look at the stage details:

1. Click on the stage → Summary Metrics
2. Compare **Max** task duration to **Median** task duration
3. If Max is 10x or more than Median, you have skew
4. Look at **Shuffle Read Size** per task — the skewed task reads much more data

### In code

```python
# Check partition sizes after a groupBy
result = df.groupBy("department").count()
result.withColumn("partition", spark_partition_id()) \
    .groupBy("partition") \
    .agg(count("*").alias("groups_in_partition")) \
    .show()

# Check value distribution of your join/group key
df.groupBy("department") \
    .count() \
    .orderBy(col("count").desc()) \
    .show(20)
```

If one value has dramatically more rows than others, any groupBy or join on that column will be skewed.

## Fix 1: Salting (For Skewed Joins)

Salting is the primary technique for fixing skewed joins. The idea: add a random number to the skewed key, spreading it across multiple partitions.

```python
import pyspark.sql.functions as F

# Skewed data: 90% of orders are for product_id = 1
orders_data = [(i, 1 if i < 90000 else i % 100, i * 10.0) for i in range(100000)]
orders = spark.createDataFrame(orders_data, ["order_id", "product_id", "amount"])

# Small products table
products_data = [(i, f"Product_{i}", i * 100.0) for i in range(100)]
products = spark.createDataFrame(products_data, ["product_id", "name", "price"])

# Step 1: Add a salt column (random number 0-9) to the large table
num_salts = 10
orders_salted = orders.withColumn("salt", (F.rand() * num_salts).cast("int"))

# Step 2: Explode the small table with all salt values
from pyspark.sql.functions import explode, array, lit as spark_lit
import pyspark.sql.functions as F

products_exploded = products.crossJoin(
    spark.range(num_salts).withColumnRenamed("id", "salt")
)

# Step 3: Join on both the original key AND the salt
result = orders_salted.join(
    products_exploded,
    on=["product_id", "salt"],
    how="inner"
).drop("salt")

print(f"Result rows: {result.count()}")
```

What happened: Instead of all 90,000 product_id=1 orders going to one partition, they're spread across 10 partitions (one per salt value). The products table is replicated 10x (100 × 10 = 1000 rows — still tiny). The join is now evenly distributed.

## Fix 2: Repartition Before GroupBy

For skewed aggregations (not joins), sometimes repartitioning helps:

```python
# Repartition with more partitions and a different key
result = df.repartition(20, "id") \
    .groupBy("department") \
    .agg(F.avg("salary"))
```

This doesn't solve the fundamental skew (one department still has 90K rows), but distributing the data across more partitions before the shuffle can help.

## Fix 3: Two-Stage Aggregation

For heavily skewed groupBy, aggregate in two stages:

```python
# Stage 1: Add a salt and do partial aggregation
df_salted = df.withColumn("salt", (F.rand() * 10).cast("int"))
partial = df_salted.groupBy("department", "salt").agg(
    F.sum("salary").alias("partial_sum"),
    F.count("*").alias("partial_count")
)

# Stage 2: Aggregate the partial results (now de-skewed)
final = partial.groupBy("department").agg(
    F.sum("partial_sum").alias("total_salary"),
    F.sum("partial_count").alias("total_count")
).withColumn("avg_salary", F.round(col("total_salary") / col("total_count"), 2))

final.show()
```

Stage 1 spreads the hot key ("Engineering") across 10 sub-groups. Stage 2 combines 10 small partial results instead of one massive group.

## Fix 4: Adaptive Query Execution (AQE)

PySpark 3.0+ includes AQE, which can automatically handle some skew at runtime:

```python
# Enable AQE (enabled by default in Spark 3.2+)
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
```

AQE detects skewed partitions during execution and splits them into smaller sub-partitions. It's not a complete solution for all skew problems, but it handles moderate skew automatically.

## Real-World Skew Scenarios

**Null keys:** If 30% of your join key is null, all null rows go to one partition. Fix: filter nulls before the join, process them separately.

**Popular users:** In social media data, celebrity accounts have millions of followers while average users have hundreds. Any join or groupBy on user_id will be skewed. Fix: salting.

**Default values:** A "department" column where 60% of rows have "Unknown" as the department. Fix: filter out "Unknown" rows, process them separately, union the results.

**Time-based data:** All orders on Black Friday go to one day's partition while other days have 1/10th the volume. Fix: partition by hour instead of day.

## Common Mistakes

- **Not diagnosing skew before trying to fix it.** Always confirm skew exists by checking the Spark UI task metrics or value distribution. Many slow jobs are caused by insufficient memory or bad join strategies, not skew.
- **Using too many salt values.** Salting with 100 values on a products table with 10,000 rows creates 1,000,000 rows in the exploded table. Use the minimum salt factor needed — start with 5-10.
- **Assuming AQE fixes all skew.** AQE handles moderate skew in sort-merge joins. It doesn't help with groupBy skew or broadcast joins. For severe skew, manual salting is still necessary.
- **Ignoring null key skew.** Null values in join keys all hash to the same partition. Always filter or handle nulls before joining.

## Key Takeaways

- Data skew = uneven partition sizes. Your job is only as fast as the slowest partition.
- Detect skew in the Spark UI (compare max vs median task duration) or by checking value distributions.
- Salting is the primary fix for skewed joins — add randomness to spread the hot key across partitions.
- Two-stage aggregation fixes skewed groupBy operations.
- AQE can auto-handle moderate skew but isn't a complete solution.
- Common skew sources: null keys, popular entities, default values, time-based hotspots.

## Next Lesson

You know how to build pipelines, optimize joins, and fix skew. In **Lesson 27: Writing Production PySpark**, we'll put it all together — proper code structure, configuration management, logging, testing, and `spark-submit`.
