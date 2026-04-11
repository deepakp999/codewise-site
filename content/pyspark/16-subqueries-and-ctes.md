---
title: "Subqueries and CTEs in Spark SQL"
description: "Write complex Spark SQL queries using subqueries, Common Table Expressions (WITH clause), and correlated subqueries with practical examples."
order: 16
module: "spark-sql"
module_title: "Spark SQL"
tags: ["pyspark", "subquery", "cte", "with clause", "spark sql", "intermediate"]
prev_slug: "joins"
next_slug: "udfs"
---

# Subqueries and CTEs in Spark SQL

## What You'll Learn
- How to use subqueries in WHERE, FROM, and SELECT clauses
- How to write readable queries with CTEs (WITH clause)
- When to use subqueries vs CTEs vs multiple views
- How to think about query structure for maintainability

## Setup

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("SubqueriesCTEs").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

orders_data = [
    (1, 101, "laptop", 999.99, "2024-01-15"),
    (2, 102, "phone", 699.99, "2024-01-16"),
    (3, 101, "tablet", 449.99, "2024-01-17"),
    (4, 103, "laptop", 999.99, "2024-02-01"),
    (5, 104, "keyboard", 79.99, "2024-02-05"),
    (6, 101, "mouse", 29.99, "2024-02-10"),
    (7, 102, "laptop", 999.99, "2024-03-01"),
    (8, 105, "phone", 699.99, "2024-03-15"),
]
orders = spark.createDataFrame(orders_data, ["order_id", "customer_id", "product", "amount", "order_date"])
orders.createOrReplaceTempView("orders")

customers_data = [
    (101, "Alice", "Mumbai"),
    (102, "Bob", "Delhi"),
    (103, "Charlie", "Bangalore"),
    (104, "Diana", "Chennai"),
    (105, "Eve", "Pune"),
]
customers = spark.createDataFrame(customers_data, ["customer_id", "name", "city"])
customers.createOrReplaceTempView("customers")
```

## Subqueries in WHERE

The most common use: filter based on a value computed from another query.

```python
# Find orders above the average order amount
spark.sql("""
    SELECT order_id, product, amount
    FROM orders
    WHERE amount > (SELECT AVG(amount) FROM orders)
    ORDER BY amount DESC
""").show()
```

### Expected Output
```
+--------+-------+------+
|order_id|product|amount|
+--------+-------+------+
|       1| laptop|999.99|
|       4| laptop|999.99|
|       7| laptop|999.99|
|       2|  phone|699.99|
|       8|  phone|699.99|
+--------+-------+------+
```

### Subquery with IN

```python
# Find customers who have placed at least one order
spark.sql("""
    SELECT name, city
    FROM customers
    WHERE customer_id IN (SELECT DISTINCT customer_id FROM orders)
""").show()
```

### Expected Output
```
+-------+---------+
|   name|     city|
+-------+---------+
|  Alice|   Mumbai|
|    Bob|    Delhi|
|Charlie|Bangalore|
|  Diana|  Chennai|
|    Eve|     Pune|
+-------+---------+
```

### Subquery with NOT IN

```python
# Customers who have NOT placed any order above 500
spark.sql("""
    SELECT name, city
    FROM customers
    WHERE customer_id NOT IN (
        SELECT DISTINCT customer_id 
        FROM orders 
        WHERE amount > 500
    )
""").show()
```

### Expected Output
```
+-----+-------+
| name|   city|
+-----+-------+
|Diana|Chennai|
+-----+-------+
```

## Subqueries in FROM (Derived Tables)

Use a subquery as a temporary table inside FROM:

```python
# Revenue per customer, then filter to top spenders
spark.sql("""
    SELECT name, total_spent
    FROM (
        SELECT customer_id, SUM(amount) as total_spent
        FROM orders
        GROUP BY customer_id
    ) AS customer_totals
    JOIN customers ON customer_totals.customer_id = customers.customer_id
    WHERE total_spent > 1000
    ORDER BY total_spent DESC
""").show()
```

### Expected Output
```
+-----+-----------+
| name|total_spent|
+-----+-----------+
|Alice|    1479.97|
|  Bob|    1699.98|
+-----+-----------+
```

## CTEs: The Clean Alternative (WITH Clause)

CTEs (Common Table Expressions) do the same thing as derived tables, but are much more readable:

```python
spark.sql("""
    WITH customer_totals AS (
        SELECT customer_id, SUM(amount) as total_spent, COUNT(*) as order_count
        FROM orders
        GROUP BY customer_id
    )
    SELECT c.name, c.city, ct.total_spent, ct.order_count
    FROM customer_totals ct
    JOIN customers c ON ct.customer_id = c.customer_id
    WHERE ct.total_spent > 500
    ORDER BY ct.total_spent DESC
""").show()
```

### Expected Output
```
+-------+---------+-----------+-----------+
|   name|     city|total_spent|order_count|
+-------+---------+-----------+-----------+
|    Bob|    Delhi|    1699.98|          2|
|  Alice|   Mumbai|    1479.97|          3|
|Charlie|Bangalore|     999.99|          1|
|    Eve|     Pune|     699.99|          1|
+-------+---------+-----------+-----------+
```

### Multiple CTEs

You can define several CTEs, each building on the previous:

```python
spark.sql("""
    WITH monthly_revenue AS (
        SELECT 
            SUBSTRING(order_date, 1, 7) as month,
            SUM(amount) as revenue,
            COUNT(*) as order_count
        FROM orders
        GROUP BY SUBSTRING(order_date, 1, 7)
    ),
    ranked_months AS (
        SELECT 
            month,
            revenue,
            order_count,
            RANK() OVER (ORDER BY revenue DESC) as revenue_rank
        FROM monthly_revenue
    )
    SELECT * FROM ranked_months
    ORDER BY month
""").show()
```

### Expected Output
```
+-------+-------+-----------+------------+
|  month|revenue|order_count|revenue_rank|
+-------+-------+-----------+------------+
|2024-01|2149.97|          3|           2|
|2024-02|1109.97|          3|           3|
|2024-03|1699.98|          2|           1|
+-------+-------+-----------+------------+
```

Each CTE is defined once and can be referenced by the CTEs that follow it or by the final query. This is much cleaner than nested subqueries.

## Subqueries in SELECT (Scalar Subqueries)

Add a computed value from another query as a column:

```python
spark.sql("""
    SELECT 
        order_id,
        product,
        amount,
        ROUND(amount / (SELECT AVG(amount) FROM orders), 2) as ratio_to_avg
    FROM orders
    ORDER BY ratio_to_avg DESC
""").show()
```

### Expected Output
```
+--------+--------+------+------------+
|order_id| product|amount|ratio_to_avg|
+--------+--------+------+------------+
|       1|  laptop|999.99|        1.78|
|       4|  laptop|999.99|        1.78|
|       7|  laptop|999.99|        1.78|
|       2|   phone|699.99|        1.24|
|       8|   phone|699.99|        1.24|
|       3|  tablet|449.99|         0.8|
|       5|keyboard| 79.99|        0.14|
|       6|   mouse| 29.99|        0.05|
+--------+--------+------+------------+
```

## CTEs vs Subqueries vs Multiple Views

All three achieve the same result. Here's when to use each:

**CTEs (WITH clause):** Best for complex queries within a single SQL statement. Self-contained, readable, no side effects.

**Subqueries:** Fine for simple, one-off filtering. Gets unreadable when nested more than 2 levels deep.

**Multiple views (createOrReplaceTempView):** Best when different parts of your pipeline need to access intermediate results independently, or when mixing SQL and DataFrame API.

```python
# Same logic, three styles:

# Style 1: Nested subquery (hard to read)
spark.sql("""
    SELECT name, total FROM (
        SELECT customer_id, SUM(amount) as total FROM orders GROUP BY customer_id
    ) t JOIN customers c ON t.customer_id = c.customer_id WHERE total > 1000
""")

# Style 2: CTE (readable, self-contained)
spark.sql("""
    WITH totals AS (
        SELECT customer_id, SUM(amount) as total FROM orders GROUP BY customer_id
    )
    SELECT name, total FROM totals JOIN customers USING(customer_id) WHERE total > 1000
""")

# Style 3: Multiple views (reusable)
spark.sql("SELECT customer_id, SUM(amount) as total FROM orders GROUP BY customer_id") \
    .createOrReplaceTempView("totals")
spark.sql("SELECT name, total FROM totals JOIN customers USING(customer_id) WHERE total > 1000")
```

## Common Mistakes

- **Using `NOT IN` with a subquery that might return null.** If the subquery returns any null values, `NOT IN` returns no results at all. Use `NOT EXISTS` instead, or add `WHERE column IS NOT NULL` to the subquery.
- **Over-nesting subqueries.** If you have more than 2 levels of nesting, switch to CTEs. `SELECT * FROM (SELECT * FROM (SELECT * FROM ...))` is a maintenance nightmare.
- **Recomputing the same subquery.** If you reference the same subquery in multiple places within a SQL statement, use a CTE — it's defined once and referenced by name. Spark's optimizer may or may not cache repeated subqueries, but CTEs make your intent clear.

## Key Takeaways

- Subqueries work in WHERE (filtering), FROM (derived tables), and SELECT (scalar values).
- CTEs (WITH clause) are the readable alternative to nested subqueries — use them for any complex query.
- Multiple CTEs can chain together, each building on the previous one.
- Use `NOT EXISTS` instead of `NOT IN` when the subquery might contain nulls.
- CTEs, subqueries, and views all produce the same execution plan — choose based on readability.

## Next Lesson

Sometimes SQL's built-in functions aren't enough and you need custom logic. In **Lesson 17: UDFs — Writing Custom Functions**, we'll learn how to create User Defined Functions in PySpark, and why you should usually avoid them.
