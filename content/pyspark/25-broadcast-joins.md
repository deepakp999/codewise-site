---
title: "Broadcast Joins — Eliminating Shuffles for Small Tables"
description: "Learn how PySpark broadcast joins work, when to use them, how to control the broadcast threshold, and the performance gains they provide."
order: 25
module: "real-world-patterns"
module_title: "Real-World Patterns"
tags: ["pyspark", "broadcast join", "performance", "join optimization", "intermediate"]
prev_slug: "caching-and-persistence"
next_slug: "data-skew"
---

# Broadcast Joins — Eliminating Shuffles for Small Tables

## What You'll Learn
- What a broadcast join is and how it works
- When to use broadcast joins vs regular joins
- How to force a broadcast with `broadcast()`
- How to check if Spark is auto-broadcasting
- The broadcast size threshold and how to tune it

## The Problem: Shuffle Joins Are Expensive

In Lesson 15, we joined orders (large) with customers (small). In Lesson 20, we learned that joins trigger shuffles — both tables get redistributed across the cluster by the join key.

But think about it: if the customers table has only 5,000 rows (a few MB), why shuffle 100 million order rows? It's like moving an entire library to find one book.

## The Solution: Send the Small Table Everywhere

A broadcast join copies the small table to every executor. Then each executor can join its local partition of the large table with the complete small table — no shuffle needed.

```
Regular join:
  Orders (100M rows) ──shuffle──┐
                                 ├── Join
  Customers (5K rows) ─shuffle──┘

Broadcast join:
  Orders (100M rows) ─── no shuffle ─── Join
  Customers (5K rows) ── copied to every executor
```

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import broadcast, col

spark = SparkSession.builder.appName("BroadcastJoin").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# Large table: 100,000 orders
orders_data = [(i, i % 100, f"product_{i % 50}", i * 10.0) for i in range(100000)]
orders = spark.createDataFrame(orders_data, ["order_id", "customer_id", "product", "amount"])

# Small table: 100 customers
customers_data = [(i, f"Customer_{i}", f"City_{i % 10}") for i in range(100)]
customers = spark.createDataFrame(customers_data, ["customer_id", "name", "city"])

print(f"Orders: {orders.count()} rows")
print(f"Customers: {customers.count()} rows")
```

## Using broadcast()

```python
# Force broadcast of the small table
result = orders.join(broadcast(customers), on="customer_id", how="inner")
result.explain()
```

### Expected Output (Physical Plan)
```
*(2) BroadcastHashJoin [customer_id], [customer_id], Inner, BuildRight
:- *(2) Scan ExistingRDD [order_id, customer_id, product, amount]
+- BroadcastExchange HashedRelationBroadcastMode(List(customer_id))
   +- *(1) Scan ExistingRDD [customer_id, name, city]
```

Look for `BroadcastHashJoin` — that confirms the broadcast is happening. There's no `Exchange hashpartitioning` (shuffle) on the orders side. Only the small customers table is broadcast.

Compare this to a regular join:

```python
# Without broadcast — both sides shuffle
result_regular = orders.join(customers, on="customer_id", how="inner")
result_regular.explain()
```

You'd see `SortMergeJoin` with `Exchange hashpartitioning` on BOTH sides — two shuffles instead of zero.

## Auto-Broadcasting

Spark automatically broadcasts tables smaller than `spark.sql.autoBroadcastJoinThreshold` (default: 10 MB):

```python
# Check the threshold
print(spark.conf.get("spark.sql.autoBroadcastJoinThreshold"))  # 10485760 (10 MB)
```

If your customers table is under 10 MB, Spark broadcasts it automatically — you don't need `broadcast()`. But there are cases where you should be explicit:

```python
# Force broadcast even if Spark doesn't detect the table is small
# (e.g., after a complex transformation, Spark may overestimate the size)
result = orders.join(broadcast(customers), on="customer_id")

# Increase the auto-broadcast threshold for larger lookup tables
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 50 * 1024 * 1024)  # 50 MB

# Disable auto-broadcasting entirely
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1)
```

## When to Use Broadcast Joins

**Use broadcast when:**
- One table is small enough to fit in executor memory (typically < 100 MB)
- The small table is a lookup/dimension table (products, countries, categories)
- You're joining a large fact table with a small dimension table

**Don't use broadcast when:**
- Both tables are large — broadcasting a 10 GB table to 100 executors means 1 TB of network transfer
- The small table changes frequently — it's broadcast once per query
- Memory is tight — each executor holds a full copy

## Verifying Broadcast in the Spark UI

After running a broadcast join, check the Spark UI:

1. Click on the job → the stage
2. Look at the task metrics
3. **Shuffle Read should be zero (or very small)** — that's the proof the broadcast worked
4. You'll see a "broadcast" stage that's usually very fast (< 1 second for small tables)

## Multiple Broadcast Joins

You can broadcast multiple small tables in the same query:

```python
# Join orders with both products AND customers — broadcast both
result = orders \
    .join(broadcast(products), on="product_id") \
    .join(broadcast(customers), on="customer_id")
```

Each small table is broadcast independently. The orders table is never shuffled.

## Common Mistakes

- **Broadcasting a table that's too large.** If you `broadcast()` a 5 GB table, Spark sends 5 GB to every executor. With 50 executors, that's 250 GB of network transfer — worse than a shuffle. You'll also get out-of-memory errors on executors.
- **Not checking if auto-broadcast kicked in.** Before manually adding `broadcast()`, check `explain()` — Spark might already be broadcasting. Adding `broadcast()` to an already-auto-broadcast join is harmless but unnecessary.
- **Forgetting that broadcast happens per query.** If you run 100 queries that each broadcast the same lookup table, it's broadcast 100 times. For repeated use, cache the broadcast table first.
- **Using broadcast with left/full outer joins incorrectly.** In a left join, only the right side can be broadcast. `orders.join(broadcast(customers), how="left")` works. But `broadcast(orders).join(customers, how="left")` won't broadcast because the left side of a left join can't be broadcast.

## Key Takeaways

- Broadcast joins copy a small table to every executor, eliminating the shuffle on the large table.
- Spark auto-broadcasts tables under 10 MB. Use `broadcast()` to force it for larger tables or when Spark's size estimate is wrong.
- Broadcast joins turn expensive shuffle joins into fast, local joins — the single biggest join optimization.
- Only broadcast tables that fit in executor memory (typically < 100 MB).
- Check `explain()` for `BroadcastHashJoin` to verify the broadcast is happening.

## Next Lesson

Broadcast joins solve the "small table" problem. But what about joins where both tables are large and the data is unevenly distributed? In **Lesson 26: Data Skew**, we'll tackle the hardest performance problem in Spark.
