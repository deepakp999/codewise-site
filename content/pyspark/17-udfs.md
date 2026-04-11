---
title: "UDFs — Writing Custom Functions (And Why to Avoid Them)"
description: "Learn how to create PySpark User Defined Functions for custom transformations, and understand why built-in functions are almost always faster."
order: 17
module: "spark-sql"
module_title: "Spark SQL"
tags: ["pyspark", "udf", "custom function", "performance", "intermediate"]
prev_slug: "subqueries-and-ctes"
next_slug: "lazy-evaluation-and-dag"
---

# UDFs — Writing Custom Functions (And Why to Avoid Them)

## What You'll Learn
- How to create and use Python UDFs in PySpark
- How to register UDFs for use in SQL
- Why UDFs are slow and when you genuinely need them
- Alternatives to UDFs using built-in functions

## What Is a UDF?

A UDF (User Defined Function) is a custom Python function that you apply to a PySpark column. When PySpark's 300+ built-in functions don't cover your use case, you write a UDF.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import udf, col, upper, regexp_replace
from pyspark.sql.types import StringType, IntegerType

spark = SparkSession.builder.appName("UDFs").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

data = [
    ("Alice Johnson", "alice.johnson@company.com", 120000),
    ("Bob Smith", "bob.smith@company.com", 95000),
    ("Charlie Brown", "charlie.brown@gmail.com", 130000),
]
df = spark.createDataFrame(data, ["name", "email", "salary"])
```

## Creating a UDF

### Step 1: Write a regular Python function

```python
def extract_domain(email):
    if email and "@" in email:
        return email.split("@")[1]
    return None
```

### Step 2: Register it as a UDF with a return type

```python
extract_domain_udf = udf(extract_domain, StringType())
```

### Step 3: Use it on a column

```python
df_with_domain = df.withColumn("email_domain", extract_domain_udf(col("email")))
df_with_domain.show()
```

### Expected Output
```
+-------------+-----------------------+------+------------+
|         name|                  email|salary|email_domain|
+-------------+-----------------------+------+------------+
|Alice Johnson|alice.johnson@compa...|120000| company.com|
|    Bob Smith|bob.smith@company.com  | 95000| company.com|
|Charlie Brown|charlie.brown@gmail...|130000|   gmail.com|
+-------------+-----------------------+------+------------+
```

## Using the Decorator Syntax

A cleaner way to define UDFs:

```python
@udf(returnType=StringType())
def format_salary(salary):
    if salary is None:
        return "N/A"
    return f"${salary:,}"

df.withColumn("salary_formatted", format_salary(col("salary"))).show()
```

### Expected Output
```
+-------------+-----------------------+------+----------------+
|         name|                  email|salary|salary_formatted|
+-------------+-----------------------+------+----------------+
|Alice Johnson|alice.johnson@compa...|120000|        $120,000|
|    Bob Smith|bob.smith@company.com  | 95000|         $95,000|
|Charlie Brown|charlie.brown@gmail...|130000|        $130,000|
+-------------+-----------------------+------+----------------+
```

## Registering UDFs for SQL

```python
# Register the UDF so you can use it in spark.sql() queries
spark.udf.register("extract_domain", extract_domain, StringType())

df.createOrReplaceTempView("employees")

spark.sql("""
    SELECT name, email, extract_domain(email) as domain
    FROM employees
""").show()
```

## Why UDFs Are Slow

This is the most important section of this lesson. UDFs have a serious performance cost.

When you use a built-in function like `upper()`, Spark runs it inside its optimized JVM engine. When you use a Python UDF, here's what actually happens for every single row:

1. Spark serializes the row data from JVM format to Python format
2. The data is sent to a Python worker process
3. Your Python function runs on that one row
4. The result is serialized back from Python to JVM format
5. Spark receives the result and continues

This serialize → send → execute → send back cycle happens **for every row**. On a million rows, that's a million round trips between JVM and Python. Built-in functions skip all of this — they run entirely inside the JVM.

**Typical performance difference:** A UDF can be 10-100x slower than the equivalent built-in function.

## Always Try Built-in Functions First

Before writing a UDF, check if PySpark already has a function that does what you need. Here are common cases where people write unnecessary UDFs:

### Instead of a UDF for string manipulation:

```python
# BAD: UDF to get email domain
@udf(returnType=StringType())
def get_domain(email):
    return email.split("@")[1] if email else None

# GOOD: Built-in functions — 10-100x faster
from pyspark.sql.functions import split, element_at

df.withColumn("domain", element_at(split(col("email"), "@"), 2)).show()
```

### Instead of a UDF for conditional logic:

```python
from pyspark.sql.functions import when

# BAD: UDF for salary bands
@udf(returnType=StringType())
def salary_band(salary):
    if salary >= 120000: return "Senior"
    elif salary >= 95000: return "Mid"
    else: return "Junior"

# GOOD: when/otherwise — much faster
df.withColumn("band",
    when(col("salary") >= 120000, "Senior")
    .when(col("salary") >= 95000, "Mid")
    .otherwise("Junior")
).show()
```

### Instead of a UDF for math:

```python
from pyspark.sql.functions import round as spark_round, abs as spark_abs, log, sqrt

# BAD: UDF for percentage
@udf(returnType=StringType())
def pct(val, total):
    return f"{(val/total)*100:.1f}%"

# GOOD: Built-in math + format_string
from pyspark.sql.functions import format_string
df.withColumn("pct", format_string("%.1f%%", col("salary") / 130000 * 100)).show()
```

## When You Actually Need a UDF

Sometimes there's no built-in alternative:

- **Complex business logic** that can't be expressed with `when/otherwise` chains
- **External library calls** (e.g., using a regex library, geocoding, NLP tokenization)
- **Data validation** with rules that are too complex for SQL expressions
- **Legacy code** that must stay in Python

Even then, consider these faster alternatives first:

### Pandas UDFs (Vectorized) — 5-10x faster than regular UDFs

```python
from pyspark.sql.functions import pandas_udf
import pandas as pd

@pandas_udf(StringType())
def extract_domain_fast(emails: pd.Series) -> pd.Series:
    return emails.str.split("@").str[1]

df.withColumn("domain", extract_domain_fast(col("email"))).show()
```

Pandas UDFs process data in batches (as pandas Series) instead of row by row. They use Apache Arrow for efficient data transfer between JVM and Python. They're 5-10x faster than regular UDFs for most operations.

## Common Mistakes

- **Using UDFs when built-in functions exist.** Always check the PySpark functions documentation first. There are 300+ built-in functions covering strings, math, dates, arrays, maps, and more. A 5-minute search can save you a 10x performance penalty.
- **Forgetting to specify the return type.** `udf(my_func)` without a return type defaults to `StringType()`. If your function returns an integer, you'll get strings. Always specify: `udf(my_func, IntegerType())`.
- **Not handling nulls in UDFs.** If your column has null values and your Python function doesn't check for None, you'll get `TypeError` exceptions. Always start your UDF with a null check.
- **Using regular UDFs when Pandas UDFs would work.** If your logic can operate on a pandas Series (most string/math operations can), use `@pandas_udf` for significantly better performance.

## Key Takeaways

- UDFs are 10-100x slower than built-in functions because of JVM ↔ Python serialization overhead.
- Always try to solve the problem with built-in functions (`when/otherwise`, `split`, `regexp_replace`, etc.) before writing a UDF.
- If you must write a UDF, use Pandas UDFs (`@pandas_udf`) for 5-10x better performance over regular UDFs.
- Always specify the return type and handle null values in your UDF.
- Register UDFs with `spark.udf.register()` to use them in SQL queries.
- In Lesson 21 (Catalyst Optimizer), we'll see why UDFs break Spark's query optimization — another reason to avoid them.

## Next Lesson

Module 3 is complete! You can now write SQL queries, create views, join tables, use subqueries, and write custom functions. But so far we've focused on *what* to do with PySpark, not *how Spark actually works*. In **Module 4: Spark Internals**, we start with **Lesson 18: Lazy Evaluation and the DAG** — the key to understanding why Spark behaves the way it does.
