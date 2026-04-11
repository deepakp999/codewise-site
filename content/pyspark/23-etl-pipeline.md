---
title: "Building an ETL Pipeline from Scratch"
description: "Build a complete PySpark ETL pipeline: extract data from CSV/JSON, transform with joins and aggregations, and load into Parquet. End-to-end project."
order: 23
module: "real-world-patterns"
module_title: "Real-World Patterns"
tags: ["pyspark", "etl", "data pipeline", "project", "intermediate"]
prev_slug: "repartition-vs-coalesce"
next_slug: "caching-and-persistence"
---

# Building an ETL Pipeline from Scratch

## What You'll Learn
- How to structure an ETL pipeline in PySpark
- How to read from multiple sources and join them
- How to apply business logic transformations
- How to write clean, partitioned output
- A complete, runnable pipeline you can adapt for your own projects

## What Is ETL?

ETL stands for Extract, Transform, Load — the three steps of every data pipeline:

1. **Extract** — read raw data from source systems (CSV, JSON, databases, APIs)
2. **Transform** — clean, join, aggregate, and reshape the data
3. **Load** — write the results to a destination (data warehouse, data lake, dashboard)

This is the core of what data engineers do every day. Let's build one.

## The Scenario

You're a data engineer at an e-commerce company. Every day, you receive three data files:

- `orders.csv` — every order placed
- `products.json` — product catalog
- `customers.csv` — customer directory

Your job: build a daily pipeline that produces a clean, enriched `order_details` table with customer names, product info, and revenue metrics, partitioned by date.

## Step 1: Extract

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, sum as spark_sum, count, avg, round as spark_round,
    when, lit, current_date, year, month, dayofmonth, to_date,
    trim, lower, upper
)
from pyspark.sql.types import (
    StructType, StructField, StringType, IntegerType,
    DoubleType, DateType, TimestampType
)

spark = SparkSession.builder \
    .appName("EcommerceETL") \
    .config("spark.sql.shuffle.partitions", 8) \
    .getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# Define schemas explicitly (Lesson 7 — no inferSchema in production)
orders_schema = StructType([
    StructField("order_id", IntegerType(), False),
    StructField("customer_id", IntegerType(), True),
    StructField("product_id", IntegerType(), True),
    StructField("quantity", IntegerType(), True),
    StructField("order_date", StringType(), True),
])

customers_schema = StructType([
    StructField("customer_id", IntegerType(), False),
    StructField("name", StringType(), True),
    StructField("email", StringType(), True),
    StructField("country", StringType(), True),
])

# Read sources
orders = spark.read.csv("data/orders.csv", header=True, schema=orders_schema)
products = spark.read.json("data/products.json")
customers = spark.read.csv("data/customers.csv", header=True, schema=customers_schema)

print(f"Orders: {orders.count()} rows")
print(f"Products: {products.count()} rows")
print(f"Customers: {customers.count()} rows")
```

## Step 2: Transform

### 2a. Clean the data

```python
# Clean orders — drop rows missing critical fields, cast date
orders_clean = orders \
    .filter(col("order_id").isNotNull()) \
    .filter(col("customer_id").isNotNull()) \
    .filter(col("quantity") > 0) \
    .withColumn("order_date", to_date(col("order_date"), "yyyy-MM-dd"))

# Clean customers — trim whitespace, standardize country names
customers_clean = customers \
    .filter(col("customer_id").isNotNull()) \
    .withColumn("name", trim(col("name"))) \
    .withColumn("email", lower(trim(col("email")))) \
    .withColumn("country", upper(trim(col("country"))))

print(f"Orders after cleaning: {orders_clean.count()}")
print(f"Customers after cleaning: {customers_clean.count()}")
```

### 2b. Enrich with joins

```python
# Join orders with products to get product name and price
order_details = orders_clean.join(
    products.select("product_id", "product_name", "price", "category"),
    on="product_id",
    how="left"
)

# Join with customers to get customer name and country
order_details = order_details.join(
    customers_clean.select("customer_id", "name", "country"),
    on="customer_id",
    how="left"
)

# Calculate revenue
order_details = order_details \
    .withColumn("revenue", spark_round(col("price") * col("quantity"), 2)) \
    .withColumn("year", year(col("order_date"))) \
    .withColumn("month", month(col("order_date")))
```

### 2c. Create summary tables

```python
# Daily revenue summary
daily_summary = order_details.groupBy("order_date").agg(
    count("order_id").alias("total_orders"),
    spark_sum("revenue").alias("total_revenue"),
    spark_round(avg("revenue"), 2).alias("avg_order_value"),
)

# Top products by revenue
top_products = order_details.groupBy("product_name", "category").agg(
    spark_sum("revenue").alias("total_revenue"),
    spark_sum("quantity").alias("total_units"),
).orderBy(col("total_revenue").desc())

# Customer spending summary
customer_summary = order_details.groupBy("customer_id", "name", "country").agg(
    count("order_id").alias("total_orders"),
    spark_sum("revenue").alias("lifetime_value"),
    spark_round(avg("revenue"), 2).alias("avg_order_value"),
).orderBy(col("lifetime_value").desc())
```

## Step 3: Load

```python
# Write enriched order details — partitioned by year and month
order_details \
    .repartition("year", "month") \
    .write \
    .partitionBy("year", "month") \
    .mode("overwrite") \
    .parquet("output/order_details")

# Write daily summary
daily_summary \
    .coalesce(1) \
    .write \
    .mode("overwrite") \
    .parquet("output/daily_summary")

# Write top products
top_products \
    .coalesce(1) \
    .write \
    .mode("overwrite") \
    .parquet("output/top_products")

# Write customer summary
customer_summary \
    .coalesce(1) \
    .write \
    .mode("overwrite") \
    .parquet("output/customer_summary")

print("ETL pipeline complete!")
```

## The Complete Pipeline as a Function

In production, wrap the pipeline in a function so it's testable and reusable:

```python
def run_ecommerce_etl(spark, input_path, output_path):
    """Daily e-commerce ETL pipeline."""
    
    # Extract
    orders = spark.read.csv(f"{input_path}/orders.csv", header=True, schema=orders_schema)
    products = spark.read.json(f"{input_path}/products.json")
    customers = spark.read.csv(f"{input_path}/customers.csv", header=True, schema=customers_schema)
    
    # Transform
    orders_clean = orders.filter(col("quantity") > 0) \
        .withColumn("order_date", to_date(col("order_date")))
    
    order_details = orders_clean \
        .join(products, on="product_id", how="left") \
        .join(customers, on="customer_id", how="left") \
        .withColumn("revenue", spark_round(col("price") * col("quantity"), 2))
    
    # Load
    order_details.write.mode("overwrite").parquet(f"{output_path}/order_details")
    
    return order_details.count()

# Run it
rows_processed = run_ecommerce_etl(spark, "data", "output")
print(f"Processed {rows_processed} rows")
```

## Common Mistakes

- **Not validating input data before transforming.** Always check row counts and null counts after reading. If `orders.count()` returns 0, you want to fail fast — not silently produce empty output tables.
- **Using `mode("overwrite")` without understanding what it overwrites.** Overwrite replaces the entire output directory. If your pipeline fails halfway through writing, you've lost the previous data AND don't have complete new data. Consider writing to a temp directory first, then renaming.
- **Joining without thinking about data size.** If products has 1000 rows and orders has 10 million, broadcast the products table (Lesson 25) instead of doing a full shuffle join.
- **Not partitioning output by commonly queried columns.** If downstream queries always filter by date, partition by year/month so those queries skip irrelevant files.

## Key Takeaways

- ETL pipelines follow a clear structure: Extract (read sources) → Transform (clean, join, aggregate) → Load (write output).
- Always define schemas explicitly for production pipelines.
- Clean data early — filter nulls and bad values before joins and aggregations.
- Partition output by columns that downstream queries filter on.
- Wrap pipelines in functions for testability and reuse.
- Validate input data and use defensive coding practices.

## Next Lesson

Our ETL pipeline joins tables and aggregates data, but what if we run the same aggregation multiple times in the pipeline? In **Lesson 24: Caching and Persistence**, we'll learn how to store intermediate results in memory to avoid recomputing them.
