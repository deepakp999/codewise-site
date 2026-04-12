---
title: "How to Set Up PySpark (Colab or Local Install)"
description: "Get PySpark running in 2 minutes with Google Colab, or install locally on Mac, Windows, or Linux with Java setup and troubleshooting."
order: 3
category: "getting-started"
tags: ["pyspark", "installation", "setup", "beginner", "java", "colab"]
---

# Setting Up PySpark

## What You'll Learn
- How to start using PySpark in 2 minutes with Google Colab (no install needed)
- How to install PySpark locally on your machine
- How to troubleshoot the most common installation errors

## Two Options — Pick One

**Option A: Google Colab (Recommended for beginners)**
Zero setup. PySpark runs in your browser. Free. Start coding in 2 minutes.

**Option B: Local install**
Full control. Runs on your machine. Requires Java setup. Takes 10-15 minutes.

Start with Colab. You can always install locally later when you need it for production work or larger datasets.

---

## Option A: Google Colab (Zero Install)

Google Colab is a free online notebook environment. PySpark works out of the box with one install command.

### Step 1: Open Colab

Go to [colab.research.google.com](https://colab.research.google.com) and create a new notebook.

### Step 2: Install PySpark

In the first cell, run:

```python
!pip install pyspark -q
```

That's it. Java is already installed on Colab's servers.

### Step 3: Verify it works

In the next cell:

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("ColabTest").getOrCreate()

data = [("Alice", 25), ("Bob", 30), ("Charlie", 35)]
df = spark.createDataFrame(data, ["name", "age"])
df.show()

print(f"PySpark version: {spark.version}")
```

### Expected Output
```
+-------+---+
|   name|age|
+-------+---+
|  Alice| 25|
|    Bob| 30|
|Charlie| 35|
+-------+---+

PySpark version: 4.0.0
```

You're ready. Every code example in this course runs in Colab. Just add `!pip install pyspark -q` as the first cell of each notebook.

### Colab Limitations

Colab is great for learning but has limits:
- Sessions time out after ~90 minutes of inactivity
- You get limited RAM (around 12 GB on the free tier)
- Files don't persist between sessions — save your work to Google Drive
- For large datasets (10+ GB), you'll need a local install or a cloud cluster

---

## Option B: Local Install

If you want PySpark on your own machine — for offline work, larger datasets, or production development — follow these steps.

### Prerequisites

PySpark needs two things on your machine:

1. **Python 3.9 or higher** — you probably already have this
2. **Java 17 or 21** — this is the part that trips up most people

Let's check what you have and install what's missing.

## Step 1: Check Your Python Version

Open a terminal (or Command Prompt on Windows) and run:

```bash
python --version
```

### Expected Output
```
Python 3.11.5
```

If you see Python 3.9 or higher, you're good. If not, install Python from [python.org](https://python.org) before continuing.

> **Note:** On some systems, you may need to use `python3` instead of `python`.

## Step 2: Install Java

PySpark runs on the Java Virtual Machine (JVM) under the hood. Even though you'll write Python code, Java needs to be installed. PySpark 4.0 supports Java 17 and Java 21.

### Check if Java Is Already Installed

```bash
java -version
```

### Expected Output (If Installed)
```
openjdk version "17.0.9" 2023-10-17
OpenJDK Runtime Environment (build 17.0.9+9)
OpenJDK 64-Bit Server VM (build 17.0.9+9, mixed mode)
```

If you see version 17 or 21, skip to Step 3. If you get "command not found" or see an older version, install Java:

### Install Java on Mac

```bash
# Using Homebrew (recommended)
brew install openjdk@17

# Add Java to your PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Install Java on Ubuntu / Linux

```bash
sudo apt update
sudo apt install openjdk-17-jdk

# Verify
java -version
```

### Install Java on Windows

1. Download the OpenJDK 17 installer from [adoptium.net](https://adoptium.net)
2. Run the installer — check the box that says "Set JAVA_HOME variable"
3. Restart your Command Prompt
4. Run `java -version` to verify

### Set JAVA_HOME (If PySpark Can't Find Java Later)

Some systems need the `JAVA_HOME` environment variable set explicitly:

```bash
# Mac / Linux — add to ~/.bashrc or ~/.zshrc
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))

# Verify
echo $JAVA_HOME
```

On Windows, set it through System Properties → Environment Variables → New System Variable → `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.0.9+9` (adjust the path to match your install).

## Step 3: Install PySpark

This is the easy part:

```bash
pip install pyspark
```

### Expected Output
```
Collecting pyspark
  Downloading pyspark-4.0.0.tar.gz (425.5 MB)
Installing collected packages: pyspark
Successfully installed pyspark-4.0.0
```

> **Tip:** If you use virtual environments (and you should), create one first:
> ```bash
> python -m venv spark-env
> source spark-env/bin/activate   # Mac/Linux
> spark-env\Scripts\activate      # Windows
> pip install pyspark
> ```

## Step 4: Verify the Installation

Create a file called `test_spark.py` with this content:

```python
from pyspark.sql import SparkSession

# Create a Spark session
spark = SparkSession.builder.appName("InstallTest").getOrCreate()

# Create a simple DataFrame
data = [("Alice", 25), ("Bob", 30), ("Charlie", 35)]
df = spark.createDataFrame(data, ["name", "age"])

# Show the DataFrame
df.show()

# Print Spark version
print(f"PySpark version: {spark.version}")

# Clean up
spark.stop()
```

Run it:

```bash
python test_spark.py
```

### Expected Output
```
+-------+---+
|   name|age|
+-------+---+
|  Alice| 25|
|    Bob| 30|
|Charlie| 35|
+-------+---+

PySpark version: 4.0.0
```

You'll see a bunch of log messages (INFO and WARN lines) before the table appears — that's normal. Spark is verbose by default. We'll quiet those logs down in a moment.

## Step 5: Reduce Log Noise (Optional but Recommended)

Spark outputs a lot of INFO-level logs by default. To reduce the noise, find your Spark configuration directory and update the log level:

```python
# Add this right after creating your SparkSession
spark.sparkContext.setLogLevel("ERROR")
```

Or to set it permanently, find your `log4j2.properties` file:

```bash
# Find where PySpark is installed
python -c "import pyspark; print(pyspark.__path__[0])"
```

Navigate to that directory, then `conf/`, and copy `log4j2.properties.template` to `log4j2.properties`. Change the root logger level from `info` to `warn`:

```
rootLogger.level = warn
```

## Troubleshooting Common Errors

### "Java gateway process exited before sending its port number"

This almost always means Java isn't installed or `JAVA_HOME` isn't set correctly.

Fix:
```bash
# Check if Java is accessible
java -version

# If it works but PySpark still fails, set JAVA_HOME explicitly
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
```

### "JAVA_HOME is not set"

Fix: Follow the JAVA_HOME instructions in Step 2 above for your operating system.

### "Py4JJavaError" or "Py4JNetworkError"

This usually means a version mismatch. Ensure:
- You have Java 17 or 21 (not Java 8 or 11 — PySpark 4.0 dropped support for older versions)
- Your PySpark version matches your Java version

```bash
# Check Java version
java -version

# Check PySpark version
python -c "import pyspark; print(pyspark.__version__)"
```

### "ModuleNotFoundError: No module named 'pyspark'"

You installed PySpark in a different Python environment than the one you're running.

Fix:
```bash
# Make sure pip and python point to the same installation
which python
which pip

# Or use python -m pip to be safe
python -m pip install pyspark
```

## Common Mistakes

- **Installing Java 8 or 11.** PySpark 4.0 requires Java 17 or 21. Older Java versions will cause cryptic errors. Always check the PySpark version's compatibility matrix.
- **Forgetting to restart the terminal after setting environment variables.** After adding `JAVA_HOME` or modifying `PATH`, you must open a new terminal window (or run `source ~/.zshrc`) for the changes to take effect.
- **Running PySpark without enough memory.** Spark's default memory setting is often fine for learning, but if you get `OutOfMemoryError` on larger practice datasets, add this when creating your SparkSession:
    ```python
    spark = SparkSession.builder \
        .appName("MyApp") \
        .config("spark.driver.memory", "4g") \
        .getOrCreate()
    ```

## Key Takeaways

- PySpark requires Python 3.9+ and Java 17 or 21.
- Install with `pip install pyspark` — it includes a built-in standalone Spark for local development.
- The most common installation issue is Java not being installed or `JAVA_HOME` not being set.
- Set the log level to `ERROR` or `WARN` to reduce console noise while learning.

## Next Lesson

PySpark is installed and running. In **Lesson 4: Your First SparkSession**, we'll explore what a SparkSession actually is, what happens when you create one, and write your first real data processing code from scratch.
