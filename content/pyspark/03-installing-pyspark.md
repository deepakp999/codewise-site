---
title: "Installing PySpark"
description: "Step-by-step guide to installing PySpark on Windows, macOS, and Linux. Includes Java setup, environment verification, and troubleshooting."
order: 3
module: "getting-started"
module_title: "Getting Started"
tags: ["pyspark", "installation", "setup"]
prev_slug: "spark-vs-pandas"
next_slug: "first-sparksession"
---

# Installing PySpark

## What You'll Learn
- How to install Java (Spark's runtime dependency)
- How to install PySpark with pip
- How to verify your installation works
- How to troubleshoot common installation issues

## Prerequisites

Before installing PySpark, you need:
1. **Python 3.8+** installed
2. **Java 11 or 17** (Spark runs on the JVM)
3. **pip** (Python's package manager)

## Step 1: Install Java

Spark runs on the Java Virtual Machine (JVM), so you need Java installed first.

### Check if Java is already installed

```bash
java -version
```

### Expected Output
```
openjdk version "17.0.2" 2022-01-18
OpenJDK Runtime Environment (build 17.0.2+8-86)
OpenJDK 64-Bit Server VM (build 17.0.2+8-86, mixed mode, sharing)
```

If you see a version number (11+), you're good. If not, install it:

### macOS

```bash
brew install openjdk@17
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

### Windows

Download from [Adoptium](https://adoptium.net/) and run the installer. Make sure to check "Set JAVA_HOME" during installation.

## Step 2: Install PySpark

With Java ready, installing PySpark is one command:

```bash
pip install pyspark
```

This installs PySpark and bundles a local Spark instance — no cluster setup needed.

### For a specific version

```bash
pip install pyspark==3.5.0
```

### With optional extras (recommended)

```bash
pip install 'pyspark[sql]'
```

## Step 3: Verify the Installation

Open a Python shell and run:

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("InstallTest") \
    .master("local[*]") \
    .getOrCreate()

# Create a simple DataFrame
data = [("Alice", 30), ("Bob", 25), ("Charlie", 35)]
df = spark.createDataFrame(data, ["name", "age"])

df.show()
spark.stop()
```

### Expected Output
```
+-------+---+
|   name|age|
+-------+---+
|  Alice| 30|
|    Bob| 25|
|Charlie| 35|
+-------+---+
```

If you see this table, PySpark is working correctly.

## Step 4: Set Environment Variables (Optional)

For a cleaner setup, set these environment variables:

```bash
# Add to your ~/.bashrc or ~/.zshrc
export SPARK_HOME=$(python -c "import pyspark; print(pyspark.__path__[0])")
export PYSPARK_PYTHON=python3
```

## Troubleshooting

### "Java not found" or "JAVA_HOME is not set"

Set JAVA_HOME explicitly:

```bash
# macOS (Homebrew)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.2.8-hotspot"
```

### "Py4JJavaError" on startup

This usually means Java version mismatch. Spark 3.5 supports Java 11 and 17. Java 8 works but is deprecated. Java 21 is **not** supported yet.

### Slow startup on first run

The first time you create a SparkSession, Spark downloads some files and initializes. This can take 30-60 seconds. Subsequent runs are faster.

## Using Jupyter Notebooks

If you prefer notebooks, PySpark works great with Jupyter:

```bash
pip install jupyter
PYSPARK_DRIVER_PYTHON=jupyter PYSPARK_DRIVER_PYTHON_OPTS="notebook" pyspark
```

Or simply create a SparkSession in any Jupyter notebook after installing PySpark.

## Common Mistakes

- **Forgetting to install Java.** PySpark will install fine with pip, but fail at runtime without Java. Always verify `java -version` first.
- **Using Java 21.** Spark 3.5 doesn't support Java 21 yet. Stick with Java 11 or 17.
- **Installing in the wrong Python environment.** If you use conda or venv, make sure PySpark is installed in the same environment you're running scripts from.

## Key Takeaways
- PySpark needs Java 11 or 17 as a prerequisite
- `pip install pyspark` bundles everything you need for local development
- Always verify with a simple DataFrame test after installation
- First startup is slow; subsequent runs are faster
- Set JAVA_HOME if you encounter Java-related errors

## Next Lesson
Your environment is ready. Let's create your first SparkSession and understand what happens under the hood.
