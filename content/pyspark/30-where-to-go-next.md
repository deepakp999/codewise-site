---
title: "Where to Go Next — Your PySpark Learning Roadmap"
description: "After mastering PySpark basics, explore Structured Streaming, MLlib, Delta Lake, Databricks, and the broader data engineering ecosystem."
order: 30
module: "interview-prep"
module_title: "Interview Prep & Next Steps"
tags: ["pyspark", "learning path", "career", "data engineering", "guide"]
prev_slug: "performance-tuning-cheatsheet"
next_slug: null
---

# Where to Go Next

## What You've Accomplished

You started this course knowing Python and pandas. You now understand:

- How Spark distributes data across a cluster and why it matters
- The DataFrame API for creating, transforming, filtering, joining, and aggregating data
- Spark SQL for writing queries and combining SQL with Python
- Spark internals: lazy evaluation, DAGs, partitions, shuffles, and the Catalyst optimizer
- Production patterns: ETL pipelines, caching, broadcast joins, data skew, and spark-submit
- Interview preparation for data engineering roles

That's a solid foundation. Here's what to learn next, in priority order based on what data engineering job markets demand.

## Priority 1: SQL Mastery

PySpark is half the job. The other half is SQL. Most data engineering teams use SQL daily — for ad-hoc queries, pipeline logic, and communicating with analysts.

**What to focus on:**
- Window functions (you started in Lesson 10 — go deeper)
- Complex joins and set operations
- Query optimization and index awareness
- Database-specific SQL (PostgreSQL, Snowflake, BigQuery)

**Resources:**
- Codewise SQL course (coming soon)
- PostgreSQL official documentation
- "SQL Performance Explained" by Markus Winand

## Priority 2: Data Pipeline Orchestration (Airflow)

In Lesson 27, you built a pipeline as a Python script. In production, pipelines run on a schedule, have dependencies, and need monitoring. Apache Airflow is the industry standard for orchestrating data pipelines.

**What to learn:**
- DAGs (Directed Acyclic Graphs) for pipeline definition
- Operators: BashOperator, PythonOperator, SparkSubmitOperator
- Task dependencies and scheduling
- Monitoring, alerting, and retry logic
- Connections and variables for configuration

**Why it matters:** Most data engineering job postings list Airflow as a required or preferred skill. It's the tool that ties your PySpark pipelines together.

## Priority 3: Delta Lake and Lakehouse Architecture

Parquet is great (Lesson 12), but it has limitations: no ACID transactions, no schema evolution, no time travel. Delta Lake adds these features on top of Parquet.

**What to learn:**
- ACID transactions on data lakes
- Schema enforcement and evolution
- Time travel (query data as it existed at a previous point in time)
- MERGE (upsert) operations
- Optimize and Z-ORDER for query performance

**Why it matters:** Delta Lake (and similar formats like Apache Iceberg and Apache Hudi) is becoming the standard for modern data lakes. Databricks, the company founded by Spark's creators, built their entire platform on Delta Lake.

## Priority 4: Structured Streaming

Everything in this course was batch processing — read data, transform it, write output. Structured Streaming processes data as it arrives, in near-real-time.

**What to learn:**
- The streaming DataFrame model (same API as batch, different execution)
- Reading from Kafka, file streams, and sockets
- Watermarks and late data handling
- Output modes: append, complete, update
- Checkpointing for fault tolerance

**What it looks like:**

```python
# Streaming looks almost identical to batch — that's the beauty
stream_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "orders") \
    .load()

# Same transformations you already know
orders = stream_df.select(
    col("value").cast("string"),
    col("timestamp")
)

# Write as a continuous query
query = orders.writeStream \
    .format("parquet") \
    .option("checkpointLocation", "/checkpoint/orders") \
    .start("/output/orders")
```

## Priority 5: Cloud Platforms

Most production Spark runs on cloud-managed services, not standalone clusters:

**Databricks** — the most popular managed Spark platform. Founded by Spark's creators. Adds notebooks, collaboration, Delta Lake, MLflow, and auto-scaling clusters. Free Community Edition available for learning.

**AWS EMR (Elastic MapReduce)** — Amazon's managed Spark service. Integrates with S3, Glue, and the broader AWS ecosystem.

**Google Dataproc** — Google's managed Spark. Integrates with BigQuery, Cloud Storage, and GCP services.

**Azure Synapse / HDInsight** — Microsoft's managed Spark offerings, integrating with Azure Data Lake and the Microsoft ecosystem.

**What to focus on:** Pick one cloud platform (whichever your target company uses) and learn to run Spark on it. The PySpark code is identical — what changes is cluster management, storage paths, and IAM configuration.

## Priority 6: Spark MLlib (If You're Interested in ML)

Spark MLlib is a distributed machine learning library. It's relevant if you're interested in ML engineering or if your data engineering role involves building ML pipelines.

**What to learn:**
- Feature engineering with Spark (VectorAssembler, StringIndexer)
- ML Pipelines (Transformer → Estimator → Model)
- Common algorithms: logistic regression, random forests, k-means
- Model evaluation and hyperparameter tuning
- Saving and loading models

**Note:** Most ML work in industry happens in Python with scikit-learn, PyTorch, or TensorFlow on smaller datasets. MLlib's advantage is when your training data is too large to fit on one machine.

## The Data Engineering Tech Stack (2026)

Here's what a complete data engineering skill set looks like:

```
Core (you have this):
  ✓ Python
  ✓ PySpark / Apache Spark
  ✓ SQL

Pipeline & Orchestration:
  → Apache Airflow
  → dbt (data build tool)

Storage & Formats:
  ✓ Parquet
  → Delta Lake / Iceberg
  → Cloud storage (S3, GCS, ADLS)

Cloud Platforms (pick one):
  → Databricks
  → AWS (EMR, Glue, Redshift)
  → GCP (Dataproc, BigQuery)
  → Azure (Synapse, Data Factory)

Streaming (when needed):
  → Kafka
  → Spark Structured Streaming

Version Control & CI/CD:
  ✓ Git
  → GitHub Actions or similar
  → Docker basics

Data Quality:
  → Great Expectations
  → dbt tests
```

You don't need everything on this list to get hired. PySpark + SQL + one cloud platform + Airflow covers most job postings.

## Building Your Portfolio

The best way to demonstrate your skills:

1. **Build a public project** — an ETL pipeline that processes a real public dataset (NYC taxi data, weather data, stock market data) and produces an analysis
2. **Write about what you learned** — a blog post or README explaining your design decisions
3. **Show your code** — clean, well-structured code on GitHub with a README
4. **Contribute to open source** — even small documentation fixes to PySpark or related projects show engagement

## What Codewise Is Building Next

We're building more free courses following the same format — clear explanations, code with expected output, common mistakes, and a structured path from beginner to job-ready.

**Coming soon:**
- SQL for Data Engineers
- Apache Airflow for Beginners
- dbt Fundamentals

Follow us at [codewise.lumivoxx.com](https://codewise.lumivoxx.com) for updates.

## Key Takeaways

- You now have the PySpark foundation. The next priorities are SQL, Airflow, and a cloud platform.
- Pick technologies based on job postings in your target companies.
- Build a portfolio project that demonstrates end-to-end data engineering skills.
- The PySpark skills you've learned transfer directly to Databricks, EMR, and Dataproc — the code is the same.
- Keep learning. Data engineering evolves fast, but the fundamentals (distributed computing, SQL, pipeline design) are stable.

## Thank You

You made it through 30 lessons. You went from "what is Spark?" to understanding partitions, shuffles, the Catalyst optimizer, broadcast joins, data skew, and production code patterns. That's a real achievement.

Go build something. Get hired. Come back and tell us about it.
