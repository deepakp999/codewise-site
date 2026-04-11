---
title: "Running SQL Queries on PySpark DataFrames"
description: "Learn how to use SQL syntax to query PySpark DataFrames with createOrReplaceTempView and spark.sql. Includes SELECT, WHERE, GROUP BY examples."
order: 13
module: "spark-sql"
module_title: "Spark SQL"
tags: ["pyspark", "spark sql", "sql query", "temp view", "beginner"]
prev_slug: "reading-files"
next_slug: "temp-views"
---

# Running SQL Queries on DataFrames

## What You'll Learn
- How to register a DataFrame as a SQL table
- How to run SQL queries with `spark.sql()`
- When to use SQL vs the DataFrame API
- How to mix SQL and DataFrame operations in one pipeline

## Why SQL in PySpark?

You already know the DataFrame API — `df.select()`, `df.filter()`, `df.groupBy()`. So why learn SQL too?

Two practical reasons. First, most data teams have analysts who know SQL but not Python. If you expose your DataFrames as SQL tables, they can query them directly. Second, some operations are simply easier to express in SQL — complex joins, subqueries, and CASE statements often read more naturally in SQL than in chained DataFrame calls.

The good news: PySpark's SQL engine uses the exact same optimizer (Catalyst) as the DataFrame API. There's no performance difference. Choose whichever is clearer for the task.

## Step 1: Register a DataFrame as a SQL Table

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("SparkSQL").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [
    ("Alice", "Engineering", 120000, "2020-01-15"),
    ("Bob", "Marketing", 95000, "2019-06-01"),
    ("Charlie", "Engineering", 130000, "2021-03-20"),
    ("Diana", "Sales", 88000, "2022-11-10"),
    ("Eve", "Marketing", 92000, "2020-08-05"),
    ("Frank", "Engineering", 145000, "2018-04-12"),
    ("Grace", "Sales", 97000, "2021-07-22"),
    ("Henry", "Marketing", 105000, "2017-09-30"),
]

df = spark.createDataFrame(data, ["name", "department", "salary", "start_date"])

# Register as a temporary SQL view
df.createOrReplaceTempView("employees")
```

That last line is the key. It tells Spark: "Let me query this DataFrame using the name `employees` in SQL." The data doesn't move or copy — it's just a name pointing to the same DataFrame.

## Step 2: Run SQL Queries

```python
# Simple SELECT
result = spark.sql("SELECT name, salary FROM employees WHERE salary > 100000")
result.show()
```

### Expected Output
```
+-------+------+
|   name|salary|
+-------+------+
|  Alice|120000|
|Charlie|130000|
|  Frank|145000|
|  Henry|105000|
+-------+------+
```

The result of `spark.sql()` is a regular PySpark DataFrame. You can chain DataFrame operations on it, save it, or register it as another view.

## Common SQL Operations

### GROUP BY with aggregations

```python
spark.sql("""
    SELECT 
        department,
        COUNT(*) as headcount,
        ROUND(AVG(salary), 0) as avg_salary,
        MAX(salary) as max_salary
    FROM employees
    GROUP BY department
    ORDER BY avg_salary DESC
""").show()
```

### Expected Output
```
+-----------+---------+----------+----------+
| department|headcount|avg_salary|max_salary|
+-----------+---------+----------+----------+
|Engineering|        3|  131667.0|    145000|
|  Marketing|        3|   97333.0|    105000|
|      Sales|        2|   92500.0|     97000|
+-----------+---------+----------+----------+
```

### CASE WHEN (SQL's if/else)

```python
spark.sql("""
    SELECT 
        name,
        salary,
        CASE 
            WHEN salary >= 120000 THEN 'Senior'
            WHEN salary >= 95000 THEN 'Mid'
            ELSE 'Junior'
        END as level
    FROM employees
    ORDER BY salary DESC
""").show()
```

### Expected Output
```
+-------+------+------+
|   name|salary| level|
+-------+------+------+
|  Frank|145000|Senior|
|Charlie|130000|Senior|
|  Alice|120000|Senior|
|  Henry|105000|   Mid|
|  Grace| 97000|   Mid|
|    Bob| 95000|   Mid|
|    Eve| 92000|Junior|
|  Diana| 88000|Junior|
+-------+------+------+
```

### HAVING (filter after GROUP BY)

```python
# Departments where average salary exceeds 95,000
spark.sql("""
    SELECT department, ROUND(AVG(salary), 0) as avg_salary
    FROM employees
    GROUP BY department
    HAVING AVG(salary) > 95000
""").show()
```

### Expected Output
```
+-----------+----------+
| department|avg_salary|
+-----------+----------+
|Engineering|  131667.0|
|  Marketing|   97333.0|
+-----------+----------+
```

### DISTINCT

```python
spark.sql("SELECT DISTINCT department FROM employees ORDER BY department").show()
```

### Expected Output
```
+-----------+
| department|
+-----------+
|Engineering|
|  Marketing|
|      Sales|
+-----------+
```

## Mixing SQL and DataFrame API

You can freely switch between SQL and DataFrame operations:

```python
# Start with SQL
high_earners = spark.sql("SELECT * FROM employees WHERE salary > 100000")

# Continue with DataFrame API
result = high_earners \
    .groupBy("department") \
    .count() \
    .orderBy("count", ascending=False)

result.show()
```

### Expected Output
```
+-----------+-----+
| department|count|
+-----------+-----+
|Engineering|    3|
|  Marketing|    1|
+-----------+-----+
```

You can also go the other direction — take a DataFrame result and register it as a new view:

```python
result.createOrReplaceTempView("dept_counts")
spark.sql("SELECT * FROM dept_counts WHERE count > 1").show()
```

## SQL vs DataFrame API — When to Use Which

Both compile to the same execution plan. The choice is about readability:

```python
# DataFrame API
df.filter(col("department") == "Engineering") \
    .groupBy("department") \
    .agg(avg("salary").alias("avg_salary")) \
    .show()

# SQL — same result, same performance
spark.sql("""
    SELECT department, AVG(salary) as avg_salary
    FROM employees
    WHERE department = 'Engineering'
    GROUP BY department
""").show()
```

**Use SQL when:** the query involves complex joins, subqueries, CASE statements, or when your team thinks in SQL.

**Use DataFrame API when:** you're building a pipeline with many chained transformations, or when you need programmatic column construction (like looping over column names).

**Use both when:** that's what most real codebases do.

## Common Mistakes

- **Forgetting to create the view first.** `spark.sql("SELECT * FROM employees")` will fail with "Table or view not found" if you haven't called `createOrReplaceTempView("employees")`. The view registration step is easy to forget.
- **Using double quotes for SQL strings.** SQL string literals use single quotes: `WHERE name = 'Alice'`, not `WHERE name = "Alice"`. Double quotes in SQL are for column/table names with special characters.
- **Assuming SQL views persist between sessions.** Temp views exist only within the current SparkSession. If you restart Spark, all views are gone. We'll cover persistent views in the next lesson.

## Key Takeaways

- `createOrReplaceTempView("name")` registers a DataFrame as a SQL table.
- `spark.sql("...")` runs SQL and returns a DataFrame — no performance difference from the DataFrame API.
- SQL and DataFrame API use the same Catalyst optimizer — choose whichever reads more clearly.
- The result of `spark.sql()` is a normal DataFrame that you can chain further operations on.
- Most real codebases mix both SQL and DataFrame API freely.

## Next Lesson

We used `createOrReplaceTempView` to make our DataFrame queryable via SQL. But what exactly is a "temp view"? And what's a "global view"? In **Lesson 14: Temp Views, Global Views, and When to Use Each**, we'll understand view scoping and lifecycle.
