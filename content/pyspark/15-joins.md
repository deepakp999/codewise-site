---
title: "PySpark Joins — Inner, Left, Right, Anti, and Cross"
description: "Master all PySpark join types with clear examples and expected output. Learn when to use each join type and common pitfalls to avoid."
order: 15
module: "spark-sql"
module_title: "Spark SQL"
tags: ["pyspark", "join", "left join", "inner join", "anti join", "beginner"]
prev_slug: "temp-views"
next_slug: "subqueries-and-ctes"
---

# Joins — Inner, Left, Right, Anti, and Cross

## What You'll Learn
- How joins work conceptually and in PySpark code
- All five join types and when to use each
- How to join using both DataFrame API and SQL
- How to handle duplicate column names after joins
- Why joins trigger shuffles (a preview of Module 4)

## Setup: Two Related Tables

Throughout this course, we've been building toward a realistic e-commerce scenario. Let's set it up now — these same tables will appear in Modules 4 and 5.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

spark = SparkSession.builder.appName("Joins").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# Orders table
orders_data = [
    (1, 101, "laptop", 999.99),
    (2, 102, "phone", 699.99),
    (3, 101, "tablet", 449.99),
    (4, 103, "laptop", 999.99),
    (5, 104, "keyboard", 79.99),
    (6, 999, "mouse", 29.99),   # customer_id 999 doesn't exist in customers
]
orders = spark.createDataFrame(orders_data, ["order_id", "customer_id", "product", "amount"])

# Customers table
customers_data = [
    (101, "Alice", "Mumbai"),
    (102, "Bob", "Delhi"),
    (103, "Charlie", "Bangalore"),
    (104, "Diana", "Chennai"),
    (105, "Eve", "Pune"),         # Eve has no orders
]
customers = spark.createDataFrame(customers_data, ["customer_id", "name", "city"])

orders.show()
customers.show()
```

### Expected Output
```
+--------+-----------+--------+------+
|order_id|customer_id| product|amount|
+--------+-----------+--------+------+
|       1|        101|  laptop|999.99|
|       2|        102|   phone|699.99|
|       3|        101|  tablet|449.99|
|       4|        103|  laptop|999.99|
|       5|        104|keyboard| 79.99|
|       6|        999|   mouse| 29.99|
+--------+-----------+--------+------+

+-----------+-------+---------+
|customer_id|   name|     city|
+-----------+-------+---------+
|        101|  Alice|   Mumbai|
|        102|    Bob|    Delhi|
|        103|Charlie|Bangalore|
|        104|  Diana|  Chennai|
|        105|    Eve|     Pune|
+-----------+-------+---------+
```

Notice: Order 6 has `customer_id=999` (no matching customer), and Eve (`customer_id=105`) has no orders. These edge cases will show how different join types handle mismatches.

## Inner Join (Default)

Returns only rows that have a match in **both** tables.

```python
# DataFrame API
inner = orders.join(customers, on="customer_id", how="inner")
inner.show()
```

### Expected Output
```
+-----------+--------+--------+------+-------+---------+
|customer_id|order_id| product|amount|   name|     city|
+-----------+--------+--------+------+-------+---------+
|        101|       1|  laptop|999.99|  Alice|   Mumbai|
|        101|       3|  tablet|449.99|  Alice|   Mumbai|
|        102|       2|   phone|699.99|    Bob|    Delhi|
|        103|       4|  laptop|999.99|Charlie|Bangalore|
|        104|       5|keyboard| 79.99|  Diana|  Chennai|
+-----------+--------+--------+------+-------+---------+
```

Order 6 (customer 999) is gone — no matching customer. Eve is gone — no matching order. Inner join only keeps matches.

```python
# SQL equivalent
orders.createOrReplaceTempView("orders")
customers.createOrReplaceTempView("customers")

spark.sql("""
    SELECT o.order_id, c.name, o.product, o.amount, c.city
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.customer_id
""").show()
```

## Left Join (Left Outer)

Returns all rows from the **left** table, plus matching rows from the right. Non-matches get null.

```python
left = orders.join(customers, on="customer_id", how="left")
left.show()
```

### Expected Output
```
+-----------+--------+--------+------+-------+---------+
|customer_id|order_id| product|amount|   name|     city|
+-----------+--------+--------+------+-------+---------+
|        101|       1|  laptop|999.99|  Alice|   Mumbai|
|        101|       3|  tablet|449.99|  Alice|   Mumbai|
|        102|       2|   phone|699.99|    Bob|    Delhi|
|        103|       4|  laptop|999.99|Charlie|Bangalore|
|        104|       5|keyboard| 79.99|  Diana|  Chennai|
|        999|       6|   mouse| 29.99|   null|     null|
+-----------+--------+--------+------+-------+---------+
```

Order 6 is kept (it's in the left table) but name and city are null (no matching customer). Eve still doesn't appear — she's not in the left table (orders).

**Use this when:** you want all records from your primary table, with optional enrichment from a lookup table.

## Right Join (Right Outer)

Returns all rows from the **right** table, plus matching rows from the left.

```python
right = orders.join(customers, on="customer_id", how="right")
right.show()
```

### Expected Output
```
+-----------+--------+--------+------+-------+---------+
|customer_id|order_id| product|amount|   name|     city|
+-----------+--------+--------+------+-------+---------+
|        101|       1|  laptop|999.99|  Alice|   Mumbai|
|        101|       3|  tablet|449.99|  Alice|   Mumbai|
|        102|       2|   phone|699.99|    Bob|    Delhi|
|        103|       4|  laptop|999.99|Charlie|Bangalore|
|        104|       5|keyboard| 79.99|  Diana|  Chennai|
|        105|    null|    null|  null|    Eve|     Pune|
+-----------+--------+--------+------+-------+---------+
```

Now Eve appears (she's in the right table) with null order fields. Order 6 (customer 999) is gone — it's not in the right table.

**In practice:** Right joins are rarely used. You can always rewrite a right join as a left join by swapping the table order.

## Full Outer Join

Returns all rows from **both** tables. Non-matches get null on the missing side.

```python
full = orders.join(customers, on="customer_id", how="full")
full.show()
```

### Expected Output
```
+-----------+--------+--------+------+-------+---------+
|customer_id|order_id| product|amount|   name|     city|
+-----------+--------+--------+------+-------+---------+
|        101|       1|  laptop|999.99|  Alice|   Mumbai|
|        101|       3|  tablet|449.99|  Alice|   Mumbai|
|        102|       2|   phone|699.99|    Bob|    Delhi|
|        103|       4|  laptop|999.99|Charlie|Bangalore|
|        104|       5|keyboard| 79.99|  Diana|  Chennai|
|        105|    null|    null|  null|    Eve|     Pune|
|        999|       6|   mouse| 29.99|   null|     null|
+-----------+--------+--------+------+-------+---------+
```

Both Order 6 (no customer) and Eve (no orders) appear. Full outer join is like saying "show me everything, and null where there's no match."

## Anti Join (Left Anti)

Returns rows from the left table that have **no match** in the right table. This is incredibly useful for finding missing data.

```python
# Orders with no matching customer
orphan_orders = orders.join(customers, on="customer_id", how="left_anti")
orphan_orders.show()
```

### Expected Output
```
+--------+-----------+-------+------+
|order_id|customer_id|product|amount|
+--------+-----------+-------+------+
|       6|        999|  mouse| 29.99|
+--------+-----------+-------+------+
```

```python
# Customers with no orders
inactive_customers = customers.join(orders, on="customer_id", how="left_anti")
inactive_customers.show()
```

### Expected Output
```
+-----------+----+----+
|customer_id|name|city|
+-----------+----+----+
|        105| Eve|Pune|
+-----------+----+----+
```

**Use this when:** finding orphan records, validating referential integrity, or identifying customers who haven't placed orders.

## Cross Join

Produces every combination of rows from both tables. Use with extreme caution.

```python
# 6 orders × 5 customers = 30 rows
cross = orders.crossJoin(customers)
print(f"Cross join rows: {cross.count()}")  # 30
```

**Use this when:** you genuinely need all combinations (e.g., generating a schedule of every employee × every shift). In most cases, a cross join is a mistake that produces an explosion of rows.

## Joining on Multiple Columns

```python
# Join on two columns
result = df1.join(df2, on=["customer_id", "product_id"], how="inner")
```

## Joining on Different Column Names

```python
# When the join columns have different names in each table
result = orders.join(
    customers,
    orders["customer_id"] == customers["customer_id"],
    how="inner"
).drop(customers["customer_id"])  # Drop the duplicate column
```

## Common Mistakes

- **Duplicate column names after join.** If both tables have a column with the same name (other than the join key), you'll get ambiguous references. Use `on="column"` syntax (which deduplicates automatically) instead of `left["col"] == right["col"]` syntax (which keeps both).
- **Using cross join accidentally.** If you write `orders.join(customers)` without specifying `on`, PySpark does a cross join — 6 × 5 = 30 rows instead of the 5 you expected. Always specify the join key.
- **Not considering the shuffle cost.** Every join shuffles data across the cluster — both tables get repartitioned by the join key. On large tables, this is expensive. In Lesson 20 (Shuffles) and Lesson 25 (Broadcast Joins), we'll learn how to make joins faster.
- **Using inner join when you should use left join.** Inner join silently drops rows that don't match. If you have 1 million orders and 999,990 have matching customers, inner join quietly drops 10 orders. Use left join + null check if you need to detect these.

## Key Takeaways

- **Inner join** — only matching rows. Use when you only want complete data.
- **Left join** — all left rows + matching right. Use for enrichment from a lookup table.
- **Right join** — all right rows + matching left. Rarely used; flip to a left join instead.
- **Full outer join** — all rows from both sides. Use when you need the complete picture.
- **Anti join** — left rows with no right match. Use for finding orphans and missing data.
- **Cross join** — every combination. Use sparingly and intentionally.
- Always specify the `on` parameter to avoid accidental cross joins.
- Joins trigger shuffles — we'll optimize this in Module 4.

## Next Lesson

SQL gets more powerful with subqueries and CTEs. In **Lesson 16: Subqueries and CTEs in Spark SQL**, we'll learn how to write nested queries and use Common Table Expressions for complex analysis.
