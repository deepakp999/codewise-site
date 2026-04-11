---
title: "Lazy Evaluation and the DAG — Why Spark Waits"
description: "Understand PySpark's lazy evaluation model, what the DAG is, the difference between transformations and actions, and how Spark optimizes your code."
order: 18
module: "spark-internals"
module_title: "Spark Internals"
tags: ["pyspark", "lazy evaluation", "dag", "transformations", "actions", "intermediate"]
prev_slug: "udfs"
next_slug: "partitions"
---

# Lazy Evaluation and the DAG — Why Spark Waits

## What You'll Learn
- Why Spark doesn't execute your code immediately
- The difference between transformations and actions
- What the DAG (Directed Acyclic Graph) is
- How lazy evaluation enables Spark's optimizations
- How to use `explain()` to see Spark's execution plan

## The Mystery From Lesson 2

Remember in Lesson 2, we noted that PySpark operations are lazy? You write `df.filter(...)`, and nothing happens until you call `.show()`. At the time, we said "Spark just remembers the instruction." Now let's understand why.

## Transformations vs Actions

Every PySpark operation falls into one of two categories:

**Transformations** — instructions that Spark records but doesn't execute:
- `select()`, `filter()`, `where()`, `groupBy()`, `join()`, `withColumn()`, `orderBy()`, `distinct()`, `union()`, `repartition()`

**Actions** — commands that trigger actual computation:
- `show()`, `count()`, `collect()`, `first()`, `take()`, `write()`, `toPandas()`

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count

spark = SparkSession.builder.appName("LazyEval").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [
    ("Alice", "Engineering", 120000),
    ("Bob", "Marketing", 95000),
    ("Charlie", "Engineering", 130000),
    ("Diana", "Sales", 88000),
    ("Eve", "Marketing", 92000),
]
df = spark.createDataFrame(data, ["name", "department", "salary"])

# These three lines execute NOTHING
filtered = df.filter(col("salary") > 90000)       # Transformation — recorded
selected = filtered.select("name", "salary")       # Transformation — recorded
sorted_df = selected.orderBy(col("salary").desc()) # Transformation — recorded

print("No computation has happened yet!")

# THIS triggers everything
sorted_df.show()  # Action — NOW Spark executes the entire chain
```

### Expected Output
```
No computation has happened yet!
+-------+------+
|   name|salary|
+-------+------+
|Charlie|130000|
|  Alice|120000|
|    Bob| 95000|
|    Eve| 92000|
+-------+------+
```

## Why Does Spark Wait?

Because waiting lets Spark optimize. Consider this example:

```python
# You write this:
result = df.select("name", "department", "salary") \
    .filter(col("department") == "Engineering") \
    .select("name", "salary")
```

A naive engine would: (1) scan all columns, (2) filter rows, (3) drop the department column. Three passes over the data.

Spark's optimizer sees the full chain and realizes: "I only need `name` and `salary` for rows where `department == 'Engineering'`. I can do this in one pass — read only those three columns, filter immediately, and output two columns."

This optimization is only possible because Spark sees the entire chain before executing anything. If it executed each line immediately (like pandas does), it couldn't optimize across operations.

## The DAG

When you call an action like `.show()`, Spark builds a **DAG** — a Directed Acyclic Graph — of all the transformations needed to produce the result.

Think of it like a recipe: instead of executing each step as you write it, Spark collects all the steps, reorganizes them for efficiency, then executes the optimized version.

```
Your code:
  df → filter(salary > 90000) → select(name, salary) → orderBy(salary) → show()

Spark's DAG:
  Stage 1: Scan data → filter → select (one pass, no shuffle)
  Stage 2: Sort by salary (requires shuffle)
  Action: show() displays the result
```

The DAG breaks your transformations into **stages**. A new stage starts whenever data needs to move between machines (a shuffle). Within a stage, everything runs in a single pass.

## Seeing the Plan with explain()

You can see exactly what Spark plans to do:

```python
result = df.filter(col("salary") > 90000) \
    .select("name", "salary") \
    .orderBy(col("salary").desc())

result.explain()
```

### Expected Output
```
== Physical Plan ==
*(2) Sort [salary#2L DESC NULLS LAST], true, 0
+- Exchange rangepartitioning(salary#2L DESC NULLS LAST, 200)
   +- *(1) Filter (salary#2L > 90000)
      +- *(1) Scan ExistingRDD[name#0,department#1,salary#2L]
```

Reading from bottom to top:
1. **Scan** — read the data
2. **Filter** — keep rows where salary > 90000
3. **Exchange** — shuffle data for sorting (stage boundary)
4. **Sort** — order by salary descending

Notice that `select("name", "salary")` doesn't appear as a separate step — Spark folded it into the scan. It only reads the columns it needs. This is called **column pruning** and it's one of the Catalyst optimizer's tricks (Lesson 21).

### explain(True) for the full picture

```python
result.explain(True)
```

This shows four plans:
- **Parsed Plan** — what you wrote
- **Analyzed Plan** — with resolved column names and types
- **Optimized Plan** — after the Catalyst optimizer rearranges things
- **Physical Plan** — the actual execution steps

## Practical Implications

### 1. Don't worry about operation order

```python
# These produce the same execution plan:
df.select("name", "salary").filter(col("salary") > 100000)
df.filter(col("salary") > 100000).select("name", "salary")
```

Spark's optimizer rearranges operations for efficiency regardless of the order you write them. Filter before select, select before filter — Spark will figure out the optimal order. (This is called **predicate pushdown**.)

### 2. Don't call actions unnecessarily

```python
# BAD — triggers two full computations
print(f"Count: {df.filter(col('salary') > 100000).count()}")
df.filter(col("salary") > 100000).show()

# GOOD — compute once, reuse
filtered = df.filter(col("salary") > 100000)
filtered.cache()  # We'll learn about caching in Lesson 24
print(f"Count: {filtered.count()}")
filtered.show()
```

Every action triggers a full recomputation from scratch (unless you cache the result). Two `.show()` calls on the same DataFrame chain = two full executions.

### 3. Use explain() to debug slow queries

Before optimizing a slow query, always check the plan first:

```python
# Is this join doing what I expect?
result = orders.join(customers, on="customer_id")
result.explain()
# Look for: BroadcastHashJoin (fast) vs SortMergeJoin (slower)
```

## Common Mistakes

- **Calling `.count()` to "check" your data between steps.** Each `count()` triggers a full computation of everything above it. Use `.show(5)` or `.limit(5).show()` for quick peeks — they only compute enough data to show 5 rows, not the entire dataset.
- **Thinking transformations are "free."** Transformations don't execute immediately, but they do add steps to the DAG. Extremely long transformation chains can create complex plans that take longer to optimize. This is rarely a problem in practice, but it's worth knowing.
- **Not using `explain()` on slow queries.** If a query is slow, `explain()` is your first debugging tool. It shows you whether Spark is doing unnecessary shuffles, full table scans, or suboptimal join strategies.

## Key Takeaways

- Transformations (filter, select, join, etc.) are recorded but not executed. Actions (show, count, write, etc.) trigger execution.
- Spark builds a DAG of all transformations and optimizes the entire chain before running anything.
- This lazy approach enables optimizations like column pruning, predicate pushdown, and join reordering.
- Use `explain()` to see what Spark actually plans to do — read the physical plan from bottom to top.
- Every action triggers a full recomputation. Use caching (Lesson 24) to avoid redundant work.

## Next Lesson

The DAG breaks your computation into stages, and stages process data in **partitions**. In **Lesson 19: Partitions — How Spark Splits Your Data**, we'll learn what partitions are, why they matter, and how to control them.
