---
title: "Writing Production-Quality PySpark Code"
description: "Learn how to structure PySpark applications for production: spark-submit, configuration management, logging, error handling, and testing patterns."
order: 27
module: "real-world-patterns"
module_title: "Real-World Patterns"
tags: ["pyspark", "production", "spark-submit", "best practices", "advanced"]
prev_slug: "data-skew"
next_slug: "interview-questions"
---

# Writing Production-Quality PySpark Code

## What You'll Learn
- How to structure a PySpark application for production
- How to use `spark-submit` to run jobs on a cluster
- Configuration management patterns
- Logging and error handling
- How to write testable PySpark code

## From Notebook to Production

Everything in this course so far has been interactive — you write code, run it, see results. Production PySpark is different:

- It runs on a schedule (daily, hourly)
- It runs on a cluster, not your laptop
- Nobody is watching it — it needs to log what happened
- It needs to handle failures gracefully
- It needs to be testable and maintainable

## Structuring a PySpark Application

Here's a clean, production-ready structure:

```python
"""
Daily e-commerce ETL pipeline.
Reads orders, products, and customers; produces enriched order details.

Usage:
    spark-submit --master yarn daily_etl.py --date 2024-01-15
"""
import argparse
import logging
import sys
from datetime import datetime

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_date, trim, lower, round as spark_round
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType


# --- Configuration ---
class Config:
    """Pipeline configuration — all paths and settings in one place."""
    
    def __init__(self, date: str, env: str = "production"):
        self.date = date
        self.env = env
        self.input_path = f"s3://data-lake/{env}/raw"
        self.output_path = f"s3://data-lake/{env}/processed"
        self.shuffle_partitions = 200 if env == "production" else 8
    
    def __repr__(self):
        return f"Config(date={self.date}, env={self.env})"


# --- Logging ---
def setup_logging():
    """Configure structured logging."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    return logging.getLogger("daily_etl")


# --- Spark Session ---
def create_spark_session(config: Config) -> SparkSession:
    """Create and configure SparkSession."""
    return SparkSession.builder \
        .appName(f"DailyETL-{config.date}") \
        .config("spark.sql.shuffle.partitions", config.shuffle_partitions) \
        .config("spark.sql.adaptive.enabled", "true") \
        .getOrCreate()


# --- Extract ---
def extract_orders(spark, config, logger):
    """Read orders for a specific date."""
    path = f"{config.input_path}/orders/date={config.date}"
    logger.info(f"Reading orders from {path}")
    
    schema = StructType([
        StructField("order_id", IntegerType(), False),
        StructField("customer_id", IntegerType(), True),
        StructField("product_id", IntegerType(), True),
        StructField("quantity", IntegerType(), True),
        StructField("amount", DoubleType(), True),
    ])
    
    df = spark.read.schema(schema).parquet(path)
    row_count = df.count()
    logger.info(f"Read {row_count} orders")
    
    if row_count == 0:
        raise ValueError(f"No orders found for date {config.date}")
    
    return df


def extract_products(spark, config, logger):
    """Read product catalog."""
    path = f"{config.input_path}/products"
    logger.info(f"Reading products from {path}")
    return spark.read.parquet(path)


def extract_customers(spark, config, logger):
    """Read customer directory."""
    path = f"{config.input_path}/customers"
    logger.info(f"Reading customers from {path}")
    return spark.read.parquet(path)


# --- Transform ---
def transform(orders, products, customers, logger):
    """Clean, join, and enrich order data."""
    logger.info("Starting transformations")
    
    # Clean
    orders_clean = orders.filter(
        col("quantity") > 0
    ).filter(
        col("amount") > 0
    )
    
    removed = orders.count() - orders_clean.count()
    if removed > 0:
        logger.warning(f"Removed {removed} invalid orders")
    
    # Enrich
    from pyspark.sql.functions import broadcast
    
    enriched = orders_clean \
        .join(broadcast(products), on="product_id", how="left") \
        .join(broadcast(customers), on="customer_id", how="left") \
        .withColumn("revenue", spark_round(col("amount") * col("quantity"), 2))
    
    logger.info(f"Enriched {enriched.count()} order records")
    return enriched


# --- Load ---
def load(df, config, logger):
    """Write enriched data to the output path."""
    output_path = f"{config.output_path}/order_details/date={config.date}"
    logger.info(f"Writing to {output_path}")
    
    df.coalesce(4) \
        .write \
        .mode("overwrite") \
        .parquet(output_path)
    
    logger.info("Write complete")


# --- Main ---
def main():
    logger = setup_logging()
    
    # Parse arguments
    parser = argparse.ArgumentParser(description="Daily ETL Pipeline")
    parser.add_argument("--date", required=True, help="Processing date (YYYY-MM-DD)")
    parser.add_argument("--env", default="production", choices=["production", "staging", "dev"])
    args = parser.parse_args()
    
    config = Config(date=args.date, env=args.env)
    logger.info(f"Starting pipeline with {config}")
    
    spark = None
    try:
        spark = create_spark_session(config)
        
        # Extract
        orders = extract_orders(spark, config, logger)
        products = extract_products(spark, config, logger)
        customers = extract_customers(spark, config, logger)
        
        # Transform
        enriched = transform(orders, products, customers, logger)
        
        # Load
        load(enriched, config, logger)
        
        logger.info("Pipeline completed successfully")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        sys.exit(1)
        
    finally:
        if spark:
            spark.stop()


if __name__ == "__main__":
    main()
```

## Running with spark-submit

```bash
# Local mode (development)
spark-submit daily_etl.py --date 2024-01-15 --env dev

# YARN cluster (production)
spark-submit \
    --master yarn \
    --deploy-mode cluster \
    --num-executors 10 \
    --executor-memory 4g \
    --executor-cores 4 \
    --driver-memory 2g \
    --conf spark.sql.shuffle.partitions=200 \
    daily_etl.py --date 2024-01-15

# Kubernetes
spark-submit \
    --master k8s://https://cluster:443 \
    --deploy-mode cluster \
    --conf spark.kubernetes.container.image=my-spark:latest \
    daily_etl.py --date 2024-01-15
```

Key `spark-submit` options:
- `--master` — where to run: `local[*]`, `yarn`, `k8s://...`
- `--deploy-mode` — `client` (driver on your machine) or `cluster` (driver on the cluster)
- `--num-executors` — how many worker processes
- `--executor-memory` — RAM per executor
- `--executor-cores` — CPU cores per executor
- `--conf` — any Spark configuration property

## Error Handling Patterns

### Fail fast on bad input

```python
def validate_input(df, table_name, min_rows=1):
    """Validate a DataFrame meets minimum requirements."""
    row_count = df.count()
    if row_count < min_rows:
        raise ValueError(f"{table_name} has {row_count} rows, expected at least {min_rows}")
    
    # Check for unexpected nulls in critical columns
    null_counts = {c: df.filter(col(c).isNull()).count() for c in df.columns}
    high_null_cols = {c: n for c, n in null_counts.items() if n / row_count > 0.5}
    if high_null_cols:
        raise ValueError(f"{table_name} has >50% nulls in columns: {high_null_cols}")
```

### Write to temp, then rename

```python
def safe_write(df, final_path, logger):
    """Write to a temp path, then rename — prevents partial writes."""
    temp_path = f"{final_path}_temp_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    logger.info(f"Writing to temp path: {temp_path}")
    df.write.mode("overwrite").parquet(temp_path)
    
    # In a real setup, you'd use hadoop fs commands to rename
    # This is pseudo-code for the pattern
    logger.info(f"Renaming {temp_path} → {final_path}")
```

## Writing Testable Code

The key to testable PySpark: separate transformation logic from I/O.

```python
# test_transforms.py
from pyspark.sql import SparkSession
import pytest

@pytest.fixture(scope="session")
def spark():
    """Create a test SparkSession."""
    return SparkSession.builder \
        .master("local[2]") \
        .appName("tests") \
        .getOrCreate()

def test_transform_filters_negative_quantities(spark):
    """Orders with quantity <= 0 should be removed."""
    orders = spark.createDataFrame([
        (1, 101, 1, 10.0),
        (2, 102, -1, 20.0),   # Should be filtered
        (3, 103, 0, 30.0),    # Should be filtered
    ], ["order_id", "customer_id", "quantity", "amount"])
    
    products = spark.createDataFrame([(1, "Laptop", 999.0)], ["product_id", "name", "price"])
    customers = spark.createDataFrame([(101, "Alice")], ["customer_id", "name"])
    
    result = transform(orders, products, customers, logging.getLogger())
    
    assert result.count() == 1
    assert result.first()["order_id"] == 1
```

Run tests with: `pytest test_transforms.py`

## Configuration Best Practices

```python
# DON'T hardcode paths
df = spark.read.parquet("s3://my-bucket/data/2024-01-15/orders.parquet")

# DO use configuration objects
df = spark.read.parquet(f"{config.input_path}/orders/date={config.date}")

# DON'T hardcode Spark settings in the code
spark.conf.set("spark.sql.shuffle.partitions", 200)

# DO pass them via spark-submit
# spark-submit --conf spark.sql.shuffle.partitions=200

# DO use defaults that can be overridden
spark = SparkSession.builder \
    .config("spark.sql.shuffle.partitions",
            spark.conf.get("spark.sql.shuffle.partitions", "200")) \
    .getOrCreate()
```

## Common Mistakes

- **Putting everything in one giant script.** Separate extract, transform, and load into functions. This makes the code testable, readable, and reusable.
- **Not logging enough.** In production, you can't add print statements and re-run. Log row counts after each stage, warn on data quality issues, and error on failures. Future you will thank present you.
- **Using `client` deploy mode in production.** In client mode, the driver runs on the machine that submits the job. If that machine goes down, the job fails. Use `cluster` mode so the driver runs on the cluster.
- **Not validating input data.** If yesterday's data didn't arrive and your pipeline reads zero rows, it should fail loudly — not silently produce empty output that breaks downstream systems.

## Key Takeaways

- Production PySpark has a clear structure: Config → SparkSession → Extract → Transform → Load → Error handling.
- Use `spark-submit` to run on clusters — configure executors, memory, and cores via command-line options.
- Separate transformation logic from I/O for testability.
- Log everything: row counts, data quality warnings, errors with stack traces.
- Validate inputs early — fail fast on bad data rather than producing bad output.
- Use configuration objects instead of hardcoded paths and settings.

## Next Lesson

Module 5 is complete! You can now build, optimize, and deploy production PySpark pipelines. In **Module 6: Interview Prep & Next Steps**, we start with **Lesson 28: Top 20 PySpark Interview Questions** — the questions you'll face when interviewing for data engineer roles.
