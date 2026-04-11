---
title: "Catalyst Optimizer — How Spark Rewrites Your Queries"
description: "Understand PySpark's Catalyst optimizer: predicate pushdown, column pruning, join reordering, and how to read query plans with explain()."
order: 21
module: "spark-internals"
module_title: "Spark Internals"
tags: ["pyspark", "catalyst", "optimizer", "explain", "query plan", "intermediate"]
prev_slug: "shuffles"
next_slug: "repartition-vs-coalesce"
---

# Catalyst Optimizer — How Spark Rewrites Your Queries

## What You'll Learn
- What the Catalyst optimizer does and why it matters
- The four phases of query optimization
- Key optimizations: predicate pushdown, column pruning, join reordering
- How to read the output of `explain(True)`
- Why UDFs and RDDs break Catalyst's optimizations

## The Payoff Lesson

This is the lesson where several things from earlier in the course click together:

- **Lesson 7** — we said "explicit schemas help Spark optimize." Now you'll see how.
- **Lesson 17** — we said "UDFs are slow because they break the optimizer." Now you'll see why.
- **Lesson 18** — we said "Spark waits so it can optimize." Now you'll see what it does with that time.

## What Catalyst Does

When you write a PySpark query (DataFrame API or SQL), you're writing a **logical description** of what you want. Catalyst's job is to find the most efficient **physical way** to execute it.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg

spark = SparkSession.builder.appName("Catalyst").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [(i, f"dept_{i % 5}", i * 100, f"city_{i % 10}") for i in range(10000)]
df = spark.createDataFrame(data, ["id", "department", "salary", "city"])
```

## The Four Phases

```python
# Write a query
result = df.select("id", "department", "salary", "city") \
    .filter(col("salary") > 50000) \
    .groupBy("department") \
    .avg("salary")

# See all four phases
result.explain(True)
```

The output shows:

### Phase 1: Parsed Logical Plan
What you wrote, translated into Spark's internal representation. No optimization yet.

### Phase 2: Analyzed Logical Plan
Spark resolves column names, checks data types, and validates that everything exists. If you reference a column that doesn't exist, this is where the error comes from.

### Phase 3: Optimized Logical Plan
**This is where the magic happens.** Catalyst applies optimization rules:

### Phase 4: Physical Plan
The actual execution strategy — which join algorithm to use, how to sort, which partitions to scan.

## Key Optimizations

### 1. Predicate Pushdown

Catalyst pushes filters as close to the data source as possible:

```python
# You write this — filter AFTER select
result = df.select("id", "department", "salary") \
    .filter(col("salary") > 50000)

# Catalyst rewrites it to — filter DURING scan
# Equivalent to: scan only rows where salary > 50000, then select columns
result.explain()
```

With file formats like Parquet, predicate pushdown means Spark can skip entire file blocks that don't contain matching rows. If your Parquet is partitioned by `department` and you filter `WHERE department = 'Engineering'`, Spark only reads the Engineering directory. It doesn't even open the other files.

### 2. Column Pruning

Catalyst only reads the columns you actually use:

```python
# You select 3 out of 4 columns
result = df.select("id", "department", "salary")
result.explain()
```

In the physical plan, you'll see the scan only reads `id`, `department`, and `salary` — not `city`. With Parquet's columnar format, this means Spark physically skips the city column's data blocks. On a table with 50 columns where you only need 3, this is a 94% reduction in I/O.

**This is why explicit schemas matter** (Lesson 7): when Spark knows the exact schema, it can prune columns at the storage level. With `inferSchema`, it may need to read more data to determine types.

### 3. Constant Folding

Catalyst evaluates constant expressions at planning time:

```python
# You write this
df.filter(col("salary") > 365 * 24 * 100)

# Catalyst replaces it with
df.filter(col("salary") > 876000)
```

The multiplication happens once during planning, not for every row.

### 4. Join Reordering

When joining multiple tables, the order matters for performance. Catalyst can rearrange joins:

```python
# You write: A join B join C
# If B is tiny, Catalyst might rewrite it as: A join C join (broadcast B)
```

### 5. Filter Pushdown Through Joins

```python
# You write: join first, then filter
result = orders.join(customers, on="customer_id") \
    .filter(col("city") == "Mumbai")

# Catalyst rewrites: filter customers first, then join
# This reduces the right side of the join before shuffling
result.explain()
```

## What Breaks Catalyst

### Python UDFs

```python
from pyspark.sql.functions import udf
from pyspark.sql.types import BooleanType

@udf(returnType=BooleanType())
def is_high_salary(salary):
    return salary > 50000

# Catalyst CANNOT push this filter down to the data source
# Catalyst CANNOT see inside the UDF to optimize it
result = df.filter(is_high_salary(col("salary")))
result.explain()
```

When you use a UDF in a filter, Catalyst can't push it down to the Parquet reader because it doesn't know what the UDF does. It has to read ALL the data, send it to Python, run the UDF, and then filter. Compare this to `col("salary") > 50000`, which Catalyst pushes all the way down to the file reader.

**This is the #1 reason UDFs are slow** — not just the JVM-to-Python overhead, but the loss of all Catalyst optimizations.

### RDDs

If you convert a DataFrame to an RDD (`.rdd`), Catalyst can no longer optimize it. DataFrames have schema information that Catalyst uses. RDDs don't.

```python
# Catalyst optimizes this
df.filter(col("salary") > 50000).select("id", "salary")

# Catalyst CANNOT optimize this
df.rdd.filter(lambda row: row.salary > 50000).map(lambda row: (row.id, row.salary))
```

Always prefer DataFrame API over RDD API unless you have a very specific reason.

## Reading explain() Output Like a Pro

```python
result = df.filter(col("salary") > 50000) \
    .select("id", "department", "salary") \
    .groupBy("department") \
    .avg("salary")

result.explain()
```

Read from bottom to top:

```
== Physical Plan ==
*(2) HashAggregate(keys=[department], functions=[avg(salary)])
+- Exchange hashpartitioning(department, 200)     ← SHUFFLE (stage boundary)
   +- *(1) HashAggregate(keys=[department], functions=[partial_avg(salary)])
      +- *(1) Filter (salary > 50000)              ← Filter pushed down
         +- *(1) Scan ExistingRDD[id, department, salary]  ← Only 3 columns read
```

Key things to notice:
- `Exchange` = shuffle. This is the stage boundary.
- `Filter` is pushed below the aggregation — filter first, aggregate less data.
- `Scan` only reads `id`, `department`, `salary` — column pruning removed `city`.
- `partial_avg` in Stage 1 means Spark computes partial averages per partition before shuffling (combines data locally first to reduce shuffle size).

## Common Mistakes

- **Assuming your query runs exactly as written.** It doesn't. Catalyst rewrites it, often significantly. Use `explain()` to see what actually runs.
- **Manually optimizing what Catalyst already handles.** You don't need to manually reorder `filter` before `select` — Catalyst does predicate pushdown automatically. Focus your optimization effort on things Catalyst can't fix: choosing the right join type, partitioning your data well, and avoiding UDFs.
- **Using UDFs for logic that built-in functions can handle.** Every UDF is a black box to Catalyst. `col("salary") > 50000` gets pushed down to the data source. `is_high_salary_udf(col("salary"))` cannot be.

## Key Takeaways

- Catalyst transforms your logical query into an optimized physical plan through four phases.
- Key optimizations: predicate pushdown (filter early), column pruning (read less), join reordering (join smart), constant folding (compute once).
- UDFs break Catalyst because it can't see inside them — this is a bigger performance hit than the JVM-to-Python overhead alone.
- Use `explain(True)` to see all four optimization phases; use `explain()` for just the physical plan.
- Read physical plans from bottom to top. Look for `Exchange` (shuffles) and verify filters are pushed close to the scan.
- Don't manually micro-optimize what Catalyst already handles — focus on the things it can't fix.

## Next Lesson

We've mentioned `repartition` and `coalesce` several times. In **Lesson 22: Repartition vs Coalesce**, we'll finally explain the difference, when to use each, and common patterns for controlling partition count.
