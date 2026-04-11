---
title: "Top 20 PySpark Interview Questions (With Code Answers)"
description: "Prepare for data engineer interviews with the 20 most-asked PySpark questions, organized by difficulty, with runnable code examples and explanations."
order: 28
module: "interview-prep"
module_title: "Interview Prep & Next Steps"
tags: ["pyspark", "interview questions", "data engineer", "career", "reference"]
prev_slug: "production-pyspark"
next_slug: "performance-tuning-cheatsheet"
---

# Top 20 PySpark Interview Questions

## What You'll Learn
- The 20 most commonly asked PySpark questions in data engineering interviews
- Concise answers with code examples
- Which lesson in this course covers each topic in depth

## Beginner Level

### 1. What is PySpark and how does it differ from pandas?

PySpark is the Python API for Apache Spark, a distributed computing framework. The key difference: pandas processes data on a single machine's memory, while PySpark distributes data across a cluster of machines.

PySpark DataFrames are immutable and lazily evaluated. Pandas DataFrames are mutable and execute immediately. Use pandas for data under 10 GB, PySpark when data exceeds single-machine memory.

*Covered in: Lesson 1 (What is Spark) and Lesson 2 (Spark vs Pandas)*

### 2. What is a SparkSession?

SparkSession is the entry point to all PySpark functionality. It manages the connection to the Spark cluster and provides methods to create DataFrames, run SQL queries, and configure Spark settings.

```python
spark = SparkSession.builder \
    .appName("MyApp") \
    .config("spark.sql.shuffle.partitions", 200) \
    .getOrCreate()
```

Always use `.getOrCreate()` to avoid creating multiple sessions.

*Covered in: Lesson 4 (Your First SparkSession)*

### 3. What is the difference between `filter()` and `where()`?

There is no difference. `where()` is an alias for `filter()`. They produce identical execution plans. Use whichever reads more naturally for your team.

*Covered in: Lesson 8 (Selecting, Filtering, and Sorting)*

### 4. How do you handle null values in PySpark?

```python
# Drop rows with nulls
df.dropna()                          # Any column
df.dropna(subset=["name", "email"])  # Specific columns

# Fill nulls
df.fillna({"salary": 0, "department": "Unknown"})

# Check for nulls
df.filter(col("salary").isNull())
```

Use `.isNull()`, not `== None`. Python's `is None` doesn't work with PySpark columns.

*Covered in: Lesson 11 (Handling Nulls)*

### 5. What are the different join types in PySpark?

Inner (matching rows only), left (all left + matching right), right (all right + matching left), full outer (all rows from both), anti (left rows with no right match), cross (all combinations).

```python
df1.join(df2, on="key", how="inner")   # default
df1.join(df2, on="key", how="left")
df1.join(df2, on="key", how="left_anti")
```

*Covered in: Lesson 15 (Joins)*

## Intermediate Level

### 6. What is lazy evaluation?

Transformations (filter, select, join) are not executed immediately. Spark builds a DAG of operations and only executes when an action (show, count, write) is called. This allows the Catalyst optimizer to rearrange and optimize the entire chain before running anything.

*Covered in: Lesson 18 (Lazy Evaluation and the DAG)*

### 7. What is the difference between transformations and actions?

Transformations create a new DataFrame without executing (filter, select, groupBy, join). Actions trigger computation and return results (show, count, collect, write). Every action recomputes the entire chain unless the data is cached.

*Covered in: Lesson 18 (Lazy Evaluation and the DAG)*

### 8. What is a partition in Spark?

A partition is a chunk of data that Spark processes in parallel. One task processes one partition. Spark creates one partition per CPU core by default, or uses `spark.sql.shuffle.partitions` (default 200) after shuffle operations.

Optimal partition size: 100 MB – 1 GB of data per partition.

*Covered in: Lesson 19 (Partitions)*

### 9. What is a shuffle and why is it expensive?

A shuffle occurs when data must move between partitions across machines — triggered by groupBy, join, orderBy, and distinct. It's expensive because it involves disk I/O (writing shuffle files), network transfer (sending data between nodes), and serialization/deserialization.

*Covered in: Lesson 20 (Shuffles)*

### 10. What is the difference between `repartition()` and `coalesce()`?

`repartition(n)` triggers a full shuffle and creates exactly n evenly distributed partitions. Can increase or decrease. `coalesce(n)` avoids a shuffle by combining adjacent partitions. Can only decrease. May produce uneven partitions.

Use `coalesce` to reduce partition count, `repartition` to increase or when you need even distribution.

*Covered in: Lesson 22 (Repartition vs Coalesce)*

### 11. What is a broadcast join?

A broadcast join copies a small table to every executor, eliminating the shuffle for the large table. Spark auto-broadcasts tables under 10 MB. Use `broadcast()` to force it for larger lookup tables.

```python
from pyspark.sql.functions import broadcast
result = large_df.join(broadcast(small_df), on="key")
```

*Covered in: Lesson 25 (Broadcast Joins)*

### 12. What are window functions?

Window functions compute values across a group of rows related to the current row, without collapsing the data. Used for rankings, running totals, and comparing each row to its group.

```python
from pyspark.sql.window import Window
from pyspark.sql.functions import rank

window = Window.partitionBy("department").orderBy(col("salary").desc())
df.withColumn("rank", rank().over(window))
```

*Covered in: Lesson 10 (GroupBy and Window Functions)*

## Advanced Level

### 13. What is the Catalyst optimizer?

Catalyst is Spark's query optimizer. It transforms your logical query plan into an optimized physical plan through predicate pushdown (filter early), column pruning (read only needed columns), join reordering, and constant folding. UDFs are opaque to Catalyst — it can't optimize through them.

*Covered in: Lesson 21 (Catalyst Optimizer)*

### 14. Why are Python UDFs slow?

Python UDFs require serializing each row from JVM to Python, executing the Python function, and serializing the result back. This row-by-row serialization is 10-100x slower than built-in functions. UDFs also prevent Catalyst from optimizing (no predicate pushdown through UDFs).

Use Pandas UDFs (`@pandas_udf`) for 5-10x improvement over regular UDFs, or find a built-in function equivalent.

*Covered in: Lesson 17 (UDFs)*

### 15. How do you handle data skew?

Data skew means uneven partition sizes — one partition has far more data than others, becoming a bottleneck. Fixes: salting (add random values to the skewed key), two-stage aggregation, filtering hot keys for separate processing, and enabling Adaptive Query Execution.

*Covered in: Lesson 26 (Data Skew)*

### 16. What is the difference between `cache()` and `persist()`?

`cache()` is shorthand for `persist(StorageLevel.MEMORY_AND_DISK)`. `persist()` lets you choose a storage level: MEMORY_ONLY, MEMORY_AND_DISK, DISK_ONLY, or serialized variants. Cache DataFrames that are expensive to compute AND used multiple times.

*Covered in: Lesson 24 (Caching and Persistence)*

### 17. Explain the execution hierarchy: Job → Stage → Task.

A **Job** is created for each action (show, count, write). A job is divided into **Stages** at shuffle boundaries. Each stage is divided into **Tasks** — one per partition. Tasks are the actual units of work that run on executor cores.

*Covered in: Lesson 5 (Understanding the Spark UI)*

### 18. What are narrow vs wide transformations?

Narrow transformations (filter, select, map) process each partition independently — no data movement. Wide transformations (groupBy, join, orderBy) require data from multiple partitions — triggering a shuffle. Every wide transformation creates a new stage boundary.

*Covered in: Lesson 20 (Shuffles)*

### 19. How would you optimize a slow PySpark job?

Systematic approach: (1) Check the Spark UI for shuffle sizes and skew, (2) Reduce shuffles by filtering early and selecting fewer columns before joins, (3) Use broadcast joins for small tables, (4) Tune `spark.sql.shuffle.partitions` for your data size, (5) Cache intermediate results used multiple times, (6) Fix data skew with salting, (7) Replace UDFs with built-in functions, (8) Use `explain()` to verify the optimizer is doing what you expect.

*Covered across: Lessons 20, 21, 24, 25, 26*

### 20. How do you submit a PySpark application to a cluster?

```bash
spark-submit \
    --master yarn \
    --deploy-mode cluster \
    --num-executors 10 \
    --executor-memory 4g \
    --executor-cores 4 \
    my_pipeline.py --date 2024-01-15
```

Use `cluster` deploy mode in production (driver runs on the cluster). Configure executors, memory, and cores based on your data size and cluster resources.

*Covered in: Lesson 27 (Production PySpark)*

## Common Mistakes

- **Giving overly theoretical answers.** Interviewers want to see that you've actually used PySpark. Include code examples and mention real scenarios where you applied each concept.
- **Not mentioning the Spark UI.** When asked about debugging or optimization, always mention checking the Spark UI first — it shows you have practical experience, not just textbook knowledge.
- **Saying "I always use UDFs for custom logic."** This signals you don't understand the performance implications. Always mention trying built-in functions first.

## Key Takeaways

- Know the fundamentals cold: lazy evaluation, transformations vs actions, partitions, shuffles.
- Be ready to write code: joins, window functions, groupBy, handling nulls.
- Demonstrate optimization thinking: broadcast joins, caching, skew handling, Catalyst.
- Reference the Spark UI as your debugging tool.
- Every question maps to a lesson in this course — review the specific lesson for deeper understanding.

## Next Lesson

For a quick-reference guide you can keep open during work, see **Lesson 29: Performance Tuning Cheat Sheet** — a one-page summary of every optimization technique covered in this course.
