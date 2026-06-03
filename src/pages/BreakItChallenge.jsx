// src/pages/BreakItChallenge.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ── Production-Grade Challenge Data (5 Per Category) ────────────────────────────────────────────
const CHALLENGE_CATEGORIES = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "#3b82f6",
    challenges: [
      {
        slug: "silent-data-killer",
        title: "The Silent Data Killer",
        level: "beginner",
        time: "3 min",
        solves: 1247,
        description: "dropna() silently drops rows. Your revenue calculation is wrong but looks right.",
        setup: "You're analyzing sales data for Q3. The CSV has columns: product, price, quantity. Some quantities are missing (NaN). You need total revenue. The code below seems correct — but the result is wrong.",
        brokenCode: String.raw`import pandas as pd

df = pd.read_csv("sales.csv")
df.dropna(inplace=True)
df["revenue"] = df["price"] * df["quantity"]

print(f"Total revenue: \${df['revenue'].sum():.2f}")`,
        language: "python",
        hints: [
          "Look at how missing values are handled. What does dropna() actually do?",
          "Check what happens when quantity is 0 vs NaN. Are they treated the same?",
          "dropna() drops ANY row with ANY NaN. What if price is missing too? How would you know?",
        ],
        solution: String.raw`import pandas as pd

df = pd.read_csv("sales.csv")

# Check what we dropped
rows_before = len(df)
df_clean = df.dropna(subset=["quantity"])  # Only drop where quantity is missing
rows_after = len(df_clean)
print(f"Dropped {rows_before - rows_after} rows with missing quantity")

df_clean["revenue"] = df_clean["price"] * df_clean["quantity"]

# Verify: any zero quantities?
zero_qty = (df_clean["quantity"] == 0).sum()
print(f"Rows with zero quantity: {zero_qty}")

print(f"Total revenue: \${df_clean['revenue'].sum():.2f}")`,
        explanation: "The bug: df.dropna() drops ANY row with ANY missing value. If even one column has NaN, the entire row is gone. This silently removes valid data where only non-critical columns are missing.\n\nThe fix: Use dropna(subset=[\"quantity\"]) to only drop rows where the specific column you need is missing. Also, check for zero vs NaN — 0 is valid data, NaN is missing data. The original code conflated them.\n\nThe lesson: \"Silent failures are worse than loud crashes.\"",
        lesson: "Silent failures are worse than loud crashes.",
        related: ["type-conversion-trap", "merge-mayhem"],
      },
      {
        slug: "type-conversion-trap",
        title: "The Type Conversion Trap",
        level: "beginner",
        time: "4 min",
        solves: 892,
        description: "String '123' vs int 123. When == works but === fails in data processing.",
        setup: "You're processing user IDs from a form and from a database. The form returns strings. The database returns integers. Your merge seems to work in testing, but fails in production.",
        brokenCode: `form_ids = ["101", "102", "103"]
db_ids = [101, 102, 103]

# Check if all form IDs exist in database
for fid in form_ids:
    if fid in db_ids:
        print(f"ID {fid} found")
    else:
        print(f"ID {fid} MISSING — BUG!")`,
        language: "python",
        hints: [
          "Check the types. What is type('101') vs type(101)?",
          "In Python, '101' == 101 is False. But what about '101' in [101, 102, 103]?",
          "The 'in' operator uses == for comparison. String '101' == int 101 is False.",
        ],
        solution: `form_ids = ["101", "102", "103"]
db_ids = [101, 102, 103]

# Convert to same type before comparison
form_ids_int = [int(x) for x in form_ids]

for fid in form_ids_int:
    if fid in db_ids:
        print(f"ID {fid} found")
    else:
        print(f"ID {fid} MISSING — BUG!")

# Or use set for O(1) lookup
valid_ids = set(db_ids)
for fid in form_ids_int:
    if fid in valid_ids:
        print(f"ID {fid} found")
    else:
        print(f"ID {fid} MISSING")`,
        explanation: "The bug: String \"101\" and integer 101 are different types. In Python, \"101\" == 101 returns False. The 'in' operator uses equality comparison, so \"101\" in [101, 102, 103] is False for every element. The code silently reports all IDs as missing.\n\nThe fix: Convert to the same type before comparison. Using set() also gives O(1) lookup instead of O(n) list scan.\n\nThe lesson: \"Type safety isn't a preference — it's a requirement.\"",
        lesson: "Type safety isn't a preference — it's a requirement.",
        related: ["silent-data-killer", "merge-mayhem"],
      },
      {
        slug: "merge-mayhem",
        title: "Merge Mayhem",
        level: "intermediate",
        time: "6 min",
        solves: 634,
        description: "Pandas merge with how='left' creates duplicates you don't notice until production.",
        setup: "You're joining customer data with order data. Left join should keep all customers, right? But your customer count doubled after the merge...",
        brokenCode: `import pandas as pd

customers = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"]
})

orders = pd.DataFrame({
    "customer_id": [1, 1, 2, 2, 2],
    "amount": [100, 200, 150, 300, 400]
})

result = customers.merge(orders, left_on="id", right_on="customer_id", how="left")
print(result)
print(f"Total customers: {len(result)}")`,
        language: "python",
        hints: [
          "Count the rows in result vs customers. What happened?",
          "One customer has multiple orders. What does left join do with duplicates?",
          "Check for duplicate customer IDs in orders. How would you validate before merge?",
        ],
        solution: `import pandas as pd

customers = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"]
})

orders = pd.DataFrame({
    "customer_id": [1, 1, 2, 2, 2],
    "amount": [100, 200, 150, 300, 400]
})

# Validate: check for duplicates in merge key
dupes = orders["customer_id"].duplicated().sum()
print(f"Duplicate customer_ids in orders: {dupes}")

# Option 1: Aggregate before merge
orders_agg = orders.groupby("customer_id")["amount"].sum().reset_index()
result = customers.merge(orders_agg, left_on="id", right_on="customer_id", how="left")
print(result)

# Option 2: Keep all orders but validate row count
result = customers.merge(orders, left_on="id", right_on="customer_id", how="left")
assert len(result) == len(orders), "Unexpected row explosion!"
print(f"Customers with orders: {result['customer_id'].notna().sum()}")`,
        explanation: "The bug: A left join with duplicate keys in the right table creates duplicate rows in the result. Customer 1 has 2 orders → 2 rows. Customer 2 has 3 orders → 3 rows. Customer 3 has 0 orders → 1 row (with NaN). Total: 6 rows, not 3.\n\nThe fix: Aggregate (groupby) before merging if you only need one row per customer. Or validate row counts after merge to catch unexpected explosions.\n\nThe lesson: \"Joins multiply. Always validate your row count.\"",
        lesson: "Joins multiply. Always validate your row count.",
        related: ["silent-data-killer", "accuracy-trap"],
      },
      {
        slug: "mutable-default-disaster",
        title: "The Mutable Default Disaster",
        level: "intermediate",
        time: "5 min",
        solves: 941,
        description: "Using a mutable object as a default argument leads to state leakage across calls.",
        setup: "You implemented a simple cart manager. For some reason, users are seeing items added by previous completely independent visitors during checkout.",
        brokenCode: `def add_to_cart(item, cart=[]):
    cart.append(item)
    return cart

user1_cart = add_to_cart("Laptop")
print(f"User 1: {user1_cart}")

user2_cart = add_to_cart("Smartphone")
print(f"User 2: {user2_cart}") # Should only have Smartphone!`,
        language: "python",
        hints: [
          "When is the default parameter list `[]` instantiated? On call, or when defined?",
          "Python evaluates default arguments once when the function is defined, not on invocation.",
          "How can you dynamicize a default variable inside a function scope?"
        ],
        solution: `def add_to_cart(item, cart=None):
    if cart is None:
        cart = []
    cart.append(item)
    return cart

user1_cart = add_to_cart("Laptop")
print(f"User 1: {user1_cart}")

user2_cart = add_to_cart("Smartphone")
print(f"User 2: {user2_cart}")`,
        explanation: "The bug: Python functions evaluate default arguments exactly once at definition time. The list instantiation `[]` remains a single, persistent state entity across all calls that neglect to supply a custom pointer. User 2 mutates the same reference generated during user 1's processing cycle.\n\nThe fix: Set default state arguments to `None` and initialize mutables internally.",
        lesson: "Never use mutable parameters as function defaults.",
        related: ["type-conversion-trap", "api-that-works"]
      },
      {
        slug: "floating-point-finance",
        title: "Floating-Point FinTech Flaw",
        level: "advanced",
        time: "7 min",
        solves: 512,
        description: "Binary floats cannot represent currency fractions accurately. Rounding errors pile up.",
        setup: "You are summing up millions of microtransaction adjustments. Auditing flags that your database values drift away from actual balances.",
        brokenCode: `balance = 0.0
increment = 0.1

# Simulate adding 10 cents ten times
for _ in range(10):
    balance += increment

print(f"Balance: {balance}")
if balance == 1.0:
    print("Audit Passed!")
else:
    print(f"Audit Failed! Drifted balance: {balance}")`,
        language: "python",
        hints: [
          "Print out the balanced result with extreme float precision format `:.20f`.",
          "Base-2 binary floats cannot cleanly represent base-10 fractional multiples like `0.1`.",
          "What specialized math standard library does Python ship with for high-precision arithmetic?"
        ],
        solution: `from decimal import Decimal

balance = Decimal('0.0')
increment = Decimal('0.1')

for _ in range(10):
    balance += increment

print(f"Balance: {balance}")
if balance == Decimal('1.0'):
    print("Audit Passed!")`,
        explanation: "The bug: Computers store floating-point fractions using binary base-2 systems. Just as `1/3` results in an infinite repeating decimal string in base-10, `0.1` becomes an infinite repeating binary sequence. Compounding operations cause truncation errors to pile up.\n\nThe fix: Instantiate string-based arguments with the high-precision `decimal.Decimal` class for financial tasks.",
        lesson: "Float is for physics; Decimal is for financial accounting.",
        related: ["silent-data-killer", "optimized-query"]
      }
    ]
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: "🤖",
    color: "#a855f7",
    challenges: [
      {
        slug: "accuracy-trap",
        title: "The Accuracy Trap",
        level: "intermediate",
        time: "5 min",
        solves: 1567,
        description: "You reported training accuracy. Your model is useless in production.",
        setup: "You trained a Random Forest and got 99% accuracy. You proudly report this to your manager. The model goes to production and fails completely.",
        brokenCode: String.raw`from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier()
model.fit(X_train, y_train)

print(f"Accuracy: \${model.score(X_train, y_train):.2f}")`,
        language: "python",
        hints: [
          "What dataset is model.score() using here? Training or test?",
          "Training accuracy on acomplex model like Random Forest is almost always near 100%.",
          "The real question is: how does it perform on UNSEEN data?",
        ],
        solution: String.raw`from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# WRONG: Training accuracy (memorization)
train_acc = model.score(X_train, y_train)
print(f"Training accuracy: \${train_acc:.2f} — IGNORE THIS")

# RIGHT: Test accuracy (generalization)
test_acc = model.score(X_test, y_test)
print(f"Test accuracy: \${test_acc:.2f}")

# BETTER: Cross-validation (more robust)
cv_scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"CV accuracy: \${cv_scores.mean():.2f} (+/- \${cv_scores.std():.2f})")`,
        explanation: "The bug: model.score(X_train, y_train) evaluates on training data. A Random Forest with enough trees will memorize training data, giving ~99% accuracy. This tells you nothing about real-world performance.\n\nThe fix: Always evaluate on held-out test data. Better yet, use cross-validation for more robust estimates. Report test accuracy, not training accuracy.\n\nThe lesson: \"The metric you report is the metric you optimize. Choose wrong, optimize garbage.\"",
        lesson: "The metric you report is the metric you optimize. Choose wrong, optimize garbage.",
        related: ["leaky-validation", "silent-data-killer"],
      },
      {
        slug: "leaky-validation",
        title: "Leaky Validation",
        level: "advanced",
        time: "8 min",
        solves: 423,
        description: "Preprocessing before split. Your CV scores are lies.",
        setup: "You scaled your features and handled missing values before train_test_split. Your cross-validation scores look amazing. Your test score is terrible.",
        brokenCode: String.raw`from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

# Fill missing values and scale ALL data first
df["age"] = df["age"].fillna(df["age"].mean())
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df.drop("target", axis=1))
y = df["target"]

model = RandomForestClassifier()
scores = cross_val_score(model, X_scaled, y, cv=5)
print(f"CV accuracy: \${scores.mean():.2f}")`,
        language: "python",
        hints: [
          "When you scale all data before splitting, what information leaks from test to train?",
          "The mean imputation used ALL data including the test fold's future information.",
          "In cross-validation, each fold should be treated as unseen during preprocessing.",
        ],
        solution: String.raw`from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import numpy as np

# WRONG: Preprocessing before split causes data leakage
# The scaler 'saw' test data during fit_transform

# RIGHT: Use Pipeline — preprocessing happens INSIDE each CV fold
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(random_state=42))
])

# Pipeline ensures scaler only sees training folds
scores = cross_val_score(pipeline, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=42))
print(f"CV accuracy: \${scores.mean():.2f}")

# For final evaluation: fit on full train, evaluate on held-out test
pipeline.fit(X_train, y_train)
test_score = pipeline.score(X_test, y_test)
print(f"Test accuracy: \${test_score:.2f}")`,
        explanation: "The bug: Preprocessing (scaling, imputation) on ALL data before splitting leaks information from test folds into training. The scaler learns the global mean (including test data). The imputer uses global statistics. Your model effectively \"cheats\" by seeing test data patterns during preprocessing.\n\nThe fix: Use sklearn Pipeline. Preprocessing steps execute inside each CV fold, only seeing training data. This simulates real production where new data arrives unscaled.\n\nThe lesson: \"Preprocessing is part of training. Not a pre-step.\"",
        lesson: "Preprocessing is part of training. Not a pre-step.",
        related: ["accuracy-trap", "cache-invalidation"],
      },
      {
        slug: "imbalanced-metrics-mirage",
        title: "The Imbalanced Class Mirage",
        level: "intermediate",
        time: "5 min",
        solves: 1104,
        description: "Evaluating highly skewed data distributions with metric parameters unsuited for rare detections.",
        setup: "You built an AI medical screening tool targeting a rare anomaly present in 1% of patients. Your raw metrics flash 99% accuracy, but it misses every single patient containing the real disease condition.",
        brokenCode: String.raw`from sklearn.metrics import accuracy_score
import numpy as np

 y_true = np.array([0]*990 + [1]*10)
y_pred = np.zeros(1000) # Broken dummy prediction

print(f"Deployment Accuracy Check: \${accuracy_score(y_true, y_pred)*100:.1f}%")`,
        language: "python",
        hints: [
          "If an algorithm blindly labels every entry as zero, does that signify intelligence or a statistical loop?",
          "Look at alternative metrics like Precision, Recall, and the F1-Score.",
          "How can you evaluate the true positive detection capabilities of rare subsets?"
        ],
        solution: String.raw`from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

y_true = np.array([0]*990 + [1]*10)
y_pred = np.zeros(1000)

print("Confusion Matrix Layout:")
print(confusion_matrix(y_true, y_pred))

print("\nComprehensive Analytics Matrix Report:")
print(classification_report(y_true, y_pred, zero_division=0))`,
        explanation: "The bug: When data distributions show heavy structural skewing, simple Accuracy metrics become misleading dashboards. An entirely static output vector returning zero hits an organic 99% success rating despite failing the entire diagnostic capability mission.\n\nThe fix: Pivot critical evaluation tracking away from baseline accuracy metrics toward Precision, Recall, Confusion Matrices, and specialized Area Under Curve (AUC) scores.",
        lesson: "Accuracy on imbalanced datasets is a metric of comfort, not performance.",
        related: ["accuracy-trap", "leaky-validation"]
      },
      {
        slug: "data-leakage-temporal",
        title: "The Chrono-Leakage Paradox",
        level: "advanced",
        time: "6 min",
        solves: 489,
        description: "Using standard cross-validation methods on time-series datasets leaks future values into history sets.",
        setup: "You train an asset prediction model scoring high backtesting returns. As soon as it runs live on real trading feeds, accuracy falls apart.",
        brokenCode: String.raw`import numpy as np
from sklearn.model_selection import KFold
from sklearn.linear_model import LinearRegression

time_series_data = np.random.randn(1000, 5)
asset_returns = np.random.randn(1000)

kf = KFold(n_splits=5, shuffle=True)
scores = []

for train_idx, test_idx in kf.split(time_series_data):
    X_tr, X_te = time_series_data[train_idx], time_series_data[test_idx]
    y_tr, y_te = asset_returns[train_idx], asset_returns[test_idx]
    
    model = LinearRegression().fit(X_tr, y_tr)
    scores.append(model.score(X_te, y_te))

print(f"Average R2 Backtest Validation Result: \${np.mean(scores):.3f}")`,
        language: "python",
        hints: [
          "Can a model safely look forward into tomorrow's trends when evaluating yesterday's entries?",
          "Shuffling sequential data samples breaks time causality strings.",
          "Check Scikit-Learn's specialized time-series splitting structures."
        ],
        solution: String.raw`import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.linear_model import LinearRegression

time_series_data = np.random.randn(1000, 5)
asset_returns = np.random.randn(1000)

tscv = TimeSeriesSplit(n_splits=5)
scores = []

for train_idx, test_idx in tscv.split(time_series_data):
    X_tr, X_te = time_series_data[train_idx], time_series_data[test_idx]
    y_tr, y_te = asset_returns[train_idx], asset_returns[test_idx]
    
    model = LinearRegression().fit(X_tr, y_tr)
    scores.append(model.score(X_te, y_te))

print(f"Causally Secure Time Validation Array Score: \${np.mean(scores):.3f}")`,
        explanation: "The bug: Shuffled validation routines cross-contaminate chronological matrices. They insert elements from futures directly into historical baseline models.",
        lesson: "Never let your data look forward in time.",
        related: ["leaky-validation", "optimized-query"]
      },
      {
        slug: "vanishing-gradient-activation",
        title: "The Deep Freeze",
        level: "advanced",
        time: "9 min",
        solves: 312,
        description: "Staking long Sigmoid stacks inside deeply nested neural network systems triggers gradient attenuation blocks.",
        setup: "You stack up an 8-layer custom deep network to process computer vision features. Training starts, but layer weight updates for the early nodes drop directly to absolute zero.",
        brokenCode: String.raw`import torch
import torch.nn as nn

layers = []
for _ in range(8):
    layers.append(nn.Linear(64, 64))
    layers.append(nn.Sigmoid())

model = nn.Sequential(*layers)
inputs = torch.randn(32, 64)
outputs = model(inputs)

loss = outputs.sum()
loss.backward()

print(f"Gradient profile depth zero: {model[0].weight.grad.abs().mean().item()}")`,
        language: "python",
        hints: [
          "Differentiate the Sigmoid function. What is its maximum possible slope outcome value?",
          "The maximum derivative of Sigmoid is 0.25. Chaining eight together dampens gradients exponentially.",
          "Consider using activations that prevent gradient attenuation, such as ReLU structures."
        ],
        solution: String.raw`import torch
import torch.nn as nn

layers = []
for _ in range(8):
    layers.append(nn.Linear(64, 64))
    layers.append(nn.ReLU())

model = nn.Sequential(*layers)
inputs = torch.randn(32, 64)
outputs = model(inputs)

loss = outputs.sum()
loss.backward()

print(f"Healthy Gradient profile depth zero: {model[0].weight.grad.abs().mean().item()}")`,
        explanation: "The bug: The derivative ceiling for a Sigmoid function caps tightly at 0.25. Multiplying these fractional chains together causes early network weights to stall out entirely.",
        lesson: "Sigmoids belong in the output layer; ReLUs belong in the hidden layer.",
        related: ["leaky-validation", "cache-invalidation"]
      }
    ]
  },
  {
    id: "sql",
    name: "SQL",
    icon: "🗄️",
    color: "#f59e0b",
    challenges: [
      {
        slug: "optimized-query",
        title: "The 'Optimized' Query",
        level: "advanced",
        time: "7 min",
        solves: 789,
        description: "SELECT * with IN subquery. O(n²) disaster on million-row tables.",
        setup: "Your analyst wrote this 'simple' query. It works fine on the dev database with 100 rows. Production has 2 million orders. The query never returns.",
        brokenCode: `SELECT * FROM orders 
WHERE customer_id IN (
    SELECT customer_id FROM customers 
    WHERE country = 'IN'
)
ORDER BY order_date DESC;`,
        language: "sql",
        hints: [
          "IN with a subquery can be O(n×m) in worst case. What's the complexity?",
          "Does the database optimize IN to a JOIN automatically? Not always.",
          "SELECT * pulls every column. How many do you actually need?",
        ],
        solution: `-- EXPLAIN first — always
EXPLAIN ANALYZE
SELECT o.order_id, o.order_date, o.total_amount
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
WHERE c.country = 'IN'
ORDER BY o.order_date DESC
LIMIT 100;

-- Add covering index
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date DESC);

-- If you need all orders, paginate
SELECT o.order_id, o.order_date, o.total_amount
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
WHERE c.country = 'IN'
ORDER BY o.order_date DESC
LIMIT 100 OFFSET 0;`,
        explanation: "The bug: IN with a correlated subquery is O(n²) — for every row in orders, scan all matching customers. SELECT * pulls unnecessary columns, increasing I/O. No LIMIT means sorting ALL matching rows. No index means full table scan.\n\nThe fix: Use JOIN with proper indexing. Select only needed columns. Add LIMIT for pagination. Always EXPLAIN ANALYZE before deploying.\n\nThe lesson: \"Performance is a feature you ship on day one, or a bug you discover on day 100.\"",
        lesson: "Performance is a feature you ship on day one, or a bug you discover on day 100.",
        related: ["merge-mayhem", "cache-invalidation"],
      },
      {
        slug: "null-in-subquery-trap",
        title: "The Empty Set Trap",
        level: "intermediate",
        time: "5 min",
        solves: 843,
        description: "Using NOT IN with a subquery containing any NULL records causes the entire query engine to return zero rows.",
        setup: "You want to find all customers who have not placed any orders yet. You run this query, and it returns zero rows—even though you know there are hundreds of newly registered users with empty order histories.",
        brokenCode: `SELECT customer_id, name 
FROM customers 
WHERE customer_id NOT IN (
    SELECT customer_id FROM orders
);`,
        language: "sql",
        hints: [
          "What happens if even a single order record has an unassigned, anonymous `NULL` in its `customer_id` column?",
          "SQL uses Three-Valued Logic (True, False, Unknown). How does `NOT IN` expand with `NULL` inputs?",
          "Try rewriting the query using `NOT EXISTS` or a clean `LEFT JOIN` strategy."
        ],
        solution: `SELECT c.customer_id, c.name 
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.customer_id = c.customer_id
);`,
        explanation: "The bug: Under standard SQL logic parameters, NOT IN expansions yield Unknown evaluations if any constituent element contains an unassigned NULL, causing the return stack to evaluate completely empty.",
        lesson: "Never use NOT IN if the underlying subquery column can contain NULL values.",
        related: ["optimized-query", "silent-data-killer"]
      },
      {
        slug: "count-falsy-陷阱",
        title: "The Aggregation Mirage",
        level: "beginner",
        time: "3 min",
        solves: 1421,
        description: "COUNT(column) skips NULL parameters, but COUNT(*) counts every single record shape.",
        setup: "You want to evaluate an activity ratio report showing how many users filled out optional profiles. Your calculations return an unexpected 100% completion rate.",
        brokenCode: `SELECT 
    COUNT(*) as total_users,
    COUNT(profile_bio) as filled_bios,
    (COUNT(*) / COUNT(*)) * 100 as metrics_ratio
FROM users;`,
        language: "sql",
        hints: [
          "Does `COUNT(*)` care about the difference between missing column entries vs active field shapes?",
          "How can you make a count conditional based on the presence of values?",
          "Target specific columns inside your completion metrics."
        ],
        solution: `SELECT 
    COUNT(*) as total_users,
    COUNT(profile_bio) as filled_bios,
    (COUNT(profile_bio) * 100.0 / COUNT(*)) as true_completion_percentage
FROM users;`,
        explanation: "The bug: COUNT(*) counts raw layout boundaries regardless of missing internals. Evaluating fields requires explicit specific arguments.",
        lesson: "Understand the subtle differences in row evaluation behavior between COUNT(*) and COUNT(column).",
        related: ["silent-data-killer", "type-conversion-trap"]
      },
      {
        slug: "havings-vs-where-mixup",
        title: "The Pre-Filter Failure",
        level: "intermediate",
        time: "4 min",
        solves: 1120,
        description: "Filtering huge datasets using HAVING instead of WHERE forces full tables to evaluate inside costly aggregations.",
        setup: "You want a revenue breakdown for European stores. The query processes successfully, but it takes 45 seconds to scan a basic regional subset.",
        brokenCode: `SELECT store_id, SUM(revenue) 
FROM sales
GROUP BY store_id, region
HAVING region = 'EU';`,
        language: "sql",
        hints: [
          "Does `HAVING` run its evaluation operations before or after row aggregation completes?",
          "Grouping millions of global rows just to discard non-European data moments later wastes significant memory.",
          "Move non-aggregated row matching operations up into a standard clause."
        ],
        solution: `SELECT store_id, SUM(revenue) 
FROM sales
WHERE region = 'EU'
GROUP BY store_id;`,
        explanation: "The bug: HAVING forces global sorting matrices to construct inside memory tiers before evaluation filtering takes place, starving query execution pipelines.",
        lesson: "Use WHERE to filter individual rows; reserve HAVING strictly for aggregated group metrics.",
        related: ["optimized-query", "merge-mayhem"]
      },
      {
        slug: "un-parameterized-injection",
        title: "The open Doorway",
        level: "advanced",
        time: "6 min",
        solves: 932,
        description: "Direct string string interpolation within execution scripts opens injection vulnerabilities.",
        setup: "You write a secure profile search feature. An automated penetration scanner flags that input variations can scrub or reveal the entire internal dataset.",
        brokenCode: `def get_user_profile(user_input_id):
    query = f"SELECT * FROM accounts WHERE id = '{user_input_id}'"
    return db.execute(query)`,
        language: "sql",
        hints: [
          "What happens if an attacker inputs a string containing structural quotes like `' OR '1'='1`?",
          "Never treat user inputs as structural elements of your query strings.",
          "Look up parameterized query execution patterns for your database drivers."
        ],
        solution: `def get_user_profile(user_input_id):
    query = "SELECT * FROM accounts WHERE id = ?"
    return db.execute(query, (user_input_id,))`,
        explanation: "The bug: Mixing raw variable string builders with structural commands lets third-party inputs manipulate logic syntax directly.",
        lesson: "Always decouple code logic from user data inputs using parameterized queries.",
        related: ["secure-api-key", "api-that-works"]
      }
    ]
  },
  {
    id: "apis",
    name: "APIs & Backend",
    icon: "🔌",
    color: "#10b981",
    challenges: [
      {
        slug: "api-that-works",
        title: "The API That Works Until It Doesn't",
        level: "intermediate",
        time: "5 min",
        solves: 1123,
        description: "No status check. No retry. No logging. Script crashes at user 847.",
        setup: "You're fetching user data from an API in a loop. It works for 846 users. Then the API hiccups. Your script crashes. No error log. No resume point. Start over from user 1.",
        brokenCode: `import requests

def get_user_data(user_id):
    response = requests.get(f"https://api.example.com/users/{user_id}")
    return response.json()

for uid in range(1, 1000):
    data = get_user_data(uid)
    print(data["name"])`,
        language: "python",
        hints: [
          "What happens if the API returns 500 or 404? response.json() will throw.",
          "There's no timeout. The request could hang forever.",
          "If it crashes at user 847, how do you resume without re-fetching 1-846?",
        ],
        solution: String.raw`import requests
import time
import json

def get_user_data(user_id, max_retries=3):
    url = f"https://api.example.com/users/\${user_id}"
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()  # Raises for 4xx/5xx
            return response.json()
        except requests.exceptions.Timeout:
            print(f"Timeout for user {user_id}, attempt {attempt + 1}")
            time.sleep(2 ** attempt)  # Exponential backoff
        except requests.exceptions.HTTPError as e:
            print(f"HTTP error for user {user_id}: {e}")
            return None  # Don't retry client errors
        except requests.exceptions.RequestException as e:
            print(f"Request failed for user {user_id}: {e}")
            time.sleep(2 ** attempt)
    
    return None

# Save progress to resume
results = []
for uid in range(1, 1000):
    data = get_user_data(uid)
    if data:
        results.append(data)
        print(data.get("name", "Unknown"))
    else:
        print(f"Failed to fetch user {uid}")
    
    # Save checkpoint every 100 users
    if uid % 100 == 0:
        with open("checkpoint.json", "w") as f:
            json.dump({"last_processed": uid, "results": results}, f)

print(f"Successfully fetched \${len(results)}/999 users")`,
        explanation: "The bug: No status check means any non-200 response crashes on response.json(). No timeout means requests hang indefinitely. No retry means transient failures are fatal. No logging means you can't debug. No checkpoint means you restart from scratch.\n\nThe fix: Check status with raise_for_status(). Add timeout. Exponential backoff for retries. Log every failure. Save checkpoints to resume.\n\nThe lesson: \"Code that works in your notebook is not production code. The difference is what happens when things break.\"",
        lesson: "Code that works in your notebook is not production code. The difference is what happens when things break.",
        related: ["secure-api-key", "optimized-query"],
      },
      {
        slug: "async-race-condition",
        title: "The Phantom Inventory Race",
        level: "advanced",
        time: "6 min",
        solves: 612,
        description: "Concurrent non-atomic API updates cause state data overwrites under load.",
        setup: "You deploy a high-speed ticket booking endpoint. Under flash sale traffic conditions, your systems oversell single available seats to multiple users simultaneously.",
        brokenCode: `async def buy_ticket(user_id, ticket_id):
    ticket = await db.fetch_row("SELECT * FROM tickets WHERE id = ?", ticket_id)
    if ticket["owned_by"] is None:
        await db.execute("UPDATE tickets SET owned_by = ? WHERE id = ?", user_id, ticket_id)
        return {"status": "success"}
    return {"status": "sold_out"}`,
        language: "python",
        hints: [
          "What happens if two async events evaluate the `if` block condition simultaneously before either has run the update statement?",
          "You need your read-and-write operations to be unified into a single atomic action.",
          "Look into using optimistic concurrency controls, select-for-update flags, or atomic updates."
        ],
        solution: `async def buy_ticket(user_id, ticket_id):
    updated_rows = await db.execute(
        "UPDATE tickets SET owned_by = ? WHERE id = ? AND owned_by IS NULL", 
        user_id, ticket_id
    )
    if updated_rows > 0:
        return {"status": "success"}
    return {"status": "sold_out"}`,
        explanation: "The bug: Chaining async tasks without transactional row locking creates an unsafe race condition window. Two parallel workers can read a ticket's state as unowned simultaneously, leading them to both execute overwrites and confirm the sale to both users.",
        lesson: "Never check state in one database operation and update it in another without locks or atomicity.",
        related: ["api-that-works", "cache-invalidation"]
      },
      {
        slug: "cors-wildcard-exposure",
        title: "The Open Vault CORS Glitch",
        level: "intermediate",
        time: "4 min",
        solves: 994,
        description: "Setting CORS access control parameters to wildcards leaks sensitive cookie tracking contexts.",
        setup: "You want an external business partner domain to access your API endpoints. To make things easy, you configure wildcards, but the setup triggers console browser blocks.",
        brokenCode: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)`,
        language: "python",
        hints: [
          "Browsers explicitly block credential sharing workflows when CORS rules are set to universal wildcards `*`.",
          "What specific, explicit origin arrays do your services actually need to talk to?",
          "Explicitly list authorized domains instead of granting global network access."
        ],
        solution: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trustedpartner.com", "https://app.zeroapi.in"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)`,
        explanation: "The bug: Wildcard matching policies cannot process active contextual credentials safely without security exposure, inducing native browser connection failures.",
        lesson: "Never use wildcards in CORS configuration when credentials are enabled.",
        related: ["secure-api-key", "un-parameterized-injection"]
      },
      {
        slug: "unhandled-promise-leak",
        title: "The Unhandled Memory Siphon",
        level: "advanced",
        time: "7 min",
        solves: 520,
        description: "Orphaned background loop calls leak continuous socket references across requests.",
        setup: "You write a push notification feature for an express service API. Everything runs fine initially, but the container runs out of RAM and crashes every 4 hours under heavy load.",
        brokenCode: `app.post('/api/notify', (req, res) => {
    sendLogsToAnalyticsServer(req.body); 
    res.status(200).send({ processing: true });
});`,
        language: "javascript",
        hints: [
          "Does the hosting process engine know how to clean up background promises if they get stuck or timeout?",
          "Failing to log or handle background rejections can crash the main event loop.",
          "Isolate background tasks with explicit timeouts and error catching blocks."
        ],
        solution: `app.post('/api/notify', (req, res) => {
    sendLogsToAnalyticsServer(req.body)
        .timeout(5000)
        .catch(err => console.error("Logged background telemetry failure safely: ", err));
        
    res.status(200).send({ processing: true });
});`,
        explanation: "The bug: Firing un-awaited async tasks into background thread processes without establishing timeouts triggers continuous descriptor leaks if third-party endpoints hang.",
        lesson: "Every background promise must have a timeout and a catch block.",
        related: ["api-that-works", "cache-invalidation"]
      },
      {
        slug: "payload-limit-flood",
        title: "The JSON Payload Flood",
        level: "beginner",
        time: "3 min",
        solves: 1391,
        description: "Accepting inbound body arguments without string volume controls leaves servers vulnerable to memory exhaustion attacks.",
        setup: "You publish a micro-blog registration endpoint. A basic automated attack script sends a massive 50MB string to the endpoint, which overwhelms your server and causes it to freeze.",
        brokenCode: `const express = require('express');
const app = express();

app.use(express.json()); 

app.post('/api/submit', (req, res) => {
    res.send({ status: "received" });
});`,
        language: "javascript",
        hints: [
          "Does a normal, 200-character comment ever require reading 50 Megabytes of string space?",
          "How can you instruct your parsing middleware to reject large payloads early?",
          "Set restrictive sizing parameters on inbound JSON payloads using options like `limit: '10kb'`."
        ],
        solution: `const express = require('express');
const app = express();

app.use(express.json({ limit: '10kb' })); 

app.post('/api/submit', (req, res) => {
    res.send({ status: "received" });
});`,
        explanation: "The bug: Processing generic input allocations without enforcing a payload threshold allows excessive memory buffers to flood memory channels, starving system threads.",
        lesson: "Always restrict inbound payload limits at the gateway or middleware layer.",
        related: ["api-that-works", "secure-api-key"]
      }
    ]
  },
  {
    id: "devops",
    name: "DevOps & MLOps",
    icon: "⚙️",
    color: "#ef4444",
    challenges: [
      {
        slug: "secure-api-key",
        title: "The 'Secure' API Key",
        level: "advanced",
        time: "6 min",
        solves: 567,
        description: "os.getenv returns None silently. Key leaks to Git. $500 bill.",
        setup: "You used environment variables for your API key. It works locally. You deploy to production. The key is missing. But the code doesn't fail — it passes None to the API. Worse: someone 'temporarily' hardcoded it for testing.",
        brokenCode: `import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`,
        language: "python",
        hints: [
          "What does os.getenv return if the variable doesn't exist? Not an error.",
          "None gets passed to Groq. What does the API do with a None key?",
          "How do you prevent a hardcoded key from being committed to Git?",
        ],
        solution: String.raw`import os
from groq import Groq

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError(
        "GROQ_API_KEY not found!\n"
        "Set it with: export GROQ_API_KEY='your-key'\n"
        "Or create a .env file (and add .env to .gitignore!)"
    )

if not api_key.startswith("gsk_"):
    raise ValueError("GROQ_API_KEY looks invalid. Should start with 'gsk_'")

client = Groq(api_key=api_key)

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`,
        explanation: "The bug: os.getenv returns None silently if the variable is missing. This None propagates to the API client, which may fail with a cryptic error or worse — use a default/demo key that racks up charges. Hardcoded \"temporary\" keys get committed to Git and leak.\n\nThe fix: Validate immediately. Fail fast with a clear message. Check key format. Use .env files with .gitignore. Never let None propagate.\n\nThe lesson: \"Security isn't a feature. It's the absence of a class of bugs you don't know you have yet.\"",
        lesson: "Security isn't a feature. It's the absence of a class of bugs you don't know you have yet.",
        related: ["api-that-works", "leaky-validation"],
      },
      {
        slug: "root-container-vulnerability",
        title: "The Root Privilege Breach",
        level: "intermediate",
        time: "4 min",
        solves: 843,
        description: "Running container runtimes without setting up non-root users exposes host architectures to privilege escalation attacks.",
        setup: "You construct a Dockerfile setup for your application. Security reviews block the artifact because internal scripts run with unchecked root capabilities.",
        brokenCode: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`,
        language: "dockerfile",
        hints: [
          "If an attacker exploits an application vulnerability inside this container, what privilege level will they inherit within the isolated space?",
          "Alpine base images often come with pre-configured, restricted system accounts like `node`.",
          "Use the `USER` instruction to drop container permissions down to standard account levels before calling execution scripts."
        ],
        solution: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

USER node
CMD ["node", "server.js"]`,
        explanation: "The bug: Failing to explicitly invoke a low-privilege runtime account causes the build container engine to fallback onto raw root system permission layers.",
        lesson: "Always follow the Principle of Least Privilege when structuring container execution rules.",
        related: ["secure-api-key", "un-parameterized-injection"]
      },
      {
        slug: "zombie-process-leak",
        title: "The Zombie Apocalypse",
        level: "advanced",
        time: "7 min",
        solves: 412,
        description: "Using standard CMD calls instead of init engines inside containers creates uncollected zombie processes.",
        setup: "Your containerized automation worker processes hundreds of short-lived shell routines daily. After running for a while, the cluster drops connections, and checking process limits reveals thousands of un-recycled zombie processes.",
        brokenCode: `FROM python:3.10-slim
WORKDIR /workspace
COPY . .
CMD ["python", "process_monitor.py"]`,
        language: "dockerfile",
        hints: [
          "Does a standard runtime application like Python know how to act as a system initialization daemon (PID 1) and collect orphan processes?",
          "Look into lightweight init systems designed specifically for containers, such as `tini`.",
          "Using `tini` ensures that child processes are properly reaped and system signals are handled correctly."
        ],
        solution: `FROM python:3.10-slim
RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY . .

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["python", "process_monitor.py"]`,
        explanation: "The bug: Standard runtimes evaluated as application layer triggers under PID 1 often lack sub-process signal recycling capabilities, causing dead container threads to map out as memory-draining orphans.",
        lesson: "Always use an init system like tini when your containers spawn frequent child processes.",
        related: ["root-container-vulnerability", "unhandled-promise-leak"]
      },
      {
        slug: "cors-wildcard-ml-exposure",
        title: "The Vulnerable Model weights",
        level: "intermediate",
        time: "5 min",
        solves: 712,
        description: "Exposing public cloud object storage pathways allows unauthorized third parties to download proprietary model weights.",
        setup: "You store large 4GB LLM model weights inside an AWS S3 bucket for convenient deployment downloading. However, billing dashboards indicate a massive surge in data transfer costs coming from unauthorized domains.",
        brokenCode: `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicModelDownloadAccess",
            "Effect": "Allow",
            "Principal": "*", 
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-ml-models-bucket/*"
        }
    ]
}`,
        language: "json",
        hints: [
          "Setting `Principal` to `*` allows anyone on the internet to read your bucket data.",
          "How can you restrict access to only your explicit production VPC endpoints or trusted deployment roles?",
          "Use IAM cross-role configuration policies or specific VPC source IP checks to lock down access."
        ],
        solution: `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "RestrictedModelDownloadAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::123456789012:role/ModelDeploymentWorkerRole"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-ml-models-bucket/*"
        }
    ]
}`,
        explanation: "The bug: Assigning wildcards to your bucket resource keys lets external unauthenticated parties download internal model weights, inflating bandwidth usage billing costs.",
        lesson: "Never grant anonymous public access policies to buckets containing proprietary assets or data packages.",
        related: ["secure-api-key", "cors-wildcard-exposure"]
      },
      {
        slug: "latest-tag-instability",
        title: "The 'Latest' Tag Chaos",
        level: "beginner",
        time: "3 min",
        solves: 1543,
        description: "Relying on floating image target definitions breaks configuration reproducibility across servers.",
        setup: "Your automated CI/CD pipeline builds perfectly in your staging cluster. A few hours later, a routine production auto-scaling event triggers, and the new instances immediately crash because of breaking changes in an upstream package.",
        brokenCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: billing-engine
spec:
  template:
    spec:
      containers:
      - name: processor
        image: python:latest`,
        language: "yaml",
        hints: [
          "What concrete version guarantees do tags like `:latest` actually provide when pulled across different environments?",
          "An upstream update can silently modify the underlying system dependencies overnight.",
          "Lock your container configurations down to specific, immutable version tags or unique SHA-256 hashes."
        ],
        solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: billing-engine
spec:
  template:
    spec:
      containers:
      - name: processor
        image: python:3.10.12-slim-bullseye`,
        explanation: "The bug: Treating dynamic keyword tags like `:latest` as baseline environment versions exposes nodes to hidden changes whenever underlying dependencies are compiled.",
        lesson: "Production infrastructure definitions must lock down explicitly immutable image versions or SHA hashes.",
        related: ["root-container-vulnerability", "api-that-works"]
      }
    ]
  },
  {
    id: "system-design",
    name: "System Design",
    icon: "🏗️",
    color: "#ec4899",
    challenges: [
      {
        slug: "cache-invalidation",
        title: "Cache Invalidation Nightmare",
        level: "advanced",
        time: "10 min",
        solves: 345,
        description: "Redis cache never expires. Users see 3-day-old data. 'It works on my machine.'",
        setup: "You added Redis caching to speed up your API. It worked great in dev. After 3 days in production, users started reporting stale data. Prices were wrong. Inventory counts were off. But 'it works on your machine' because you restarted the server.",
        brokenCode: String.raw`import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

def get_product_price(product_id):
    cached = r.get(f"price:\${product_id}")
    if cached:
        return json.loads(cached)
    
    price = db.query(f"SELECT price FROM products WHERE id = \${product_id}")
    r.set(f"price:\${product_id}", json.dumps(price))
    return price`,
        language: "python",
        hints: [
          "What happens when the price changes in the database? Is the cache updated?",
          "How long does the cache live? Forever? What's Redis's default TTL?",
          "When you restart your dev server, does the cache persist? What about production?",
        ],
        solution: String.raw`import redis
import json
from datetime import timedelta

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def get_product_price(product_id):
    cache_key = f"price:\${product_id}"
    
    cached = r.get(cache_key)
    if cached:
        ttl = r.ttl(cache_key)
        print(f"Cache hit! TTL remaining: \${ttl}s")
        return json.loads(cached)
    
    price = db.query("SELECT price FROM products WHERE id = ?", (product_id,))
    r.setex(cache_key, timedelta(hours=1), json.dumps(price))
    
    r.publish("price_updates", json.dumps({
        "product_id": product_id,
        "new_price": price,
        "timestamp": time.time()
    }))
    
    return price`,
        explanation: "The bug: r.set() without TTL means cache lives forever. Database updates never reflect in cache. Dev server restarts clear Redis (flush), masking the bug. Production Redis persists across deploys. Stale data accumulates indefinitely.\n\nThe fix: Always set TTL (r.setex). Implement cache invalidation on data changes. Use pub/sub for cross-service invalidation. Monitor cache hit rates and TTL effectiveness.\n\nThe lesson: \"There are only two hard things in Computer Science: cache invalidation and naming things.\"",
        lesson: "There are only two hard things in Computer Science: cache invalidation and naming things.",
        related: ["optimized-query", "leaky-validation"],
      },
      {
        slug: "thundering-herd-crash",
        title: "The Thundering Herd Avalanche",
        level: "advanced",
        time: "8 min",
        solves: 432,
        description: "Simultaneous expiration of a highly popular cache key allows traffic to flood and crash backend databases.",
        setup: "Your homepage cache is configured with a 1-hour expiration window. Exactly every hour on the dot, your backend database spikes to 100% CPU utilization and drops active user connections for a few seconds.",
        brokenCode: `def get_homepage_feed():
    data = redis.get("homepage_data")
    if data is None:
        data = db.fetch_heavy_feed_computation()
        redis.set("homepage_data", data, ex=3600)
    return data`,
        language: "python",
        hints: [
          "What happens if 10,000 requests hit the empty cache block at the exact same millisecond before the first query can finish writing to the cache?",
          "Look into using cross-process mutex locks or adding random jitter variations to your TTL windows.",
          "Using a mutex lock ensures that only one worker queries the database, while others wait for the cache to refresh."
        ],
        solution: `def get_homepage_feed():
    data = redis.get("homepage_data")
    if data is None:
        with redis.lock("lock:homepage_data", blocking_timeout=5):
            data = redis.get("homepage_data")
            if data is None:
                data = db.fetch_heavy_feed_computation()
                import random
                ttl_with_jitter = 3600 + random.randint(0, 300)
                redis.set("homepage_data", data, ex=ttl_with_jitter)
    return data`,
        explanation: "The bug: When popular cache states lapse under massive execution load, hundreds of thread loops tumble onto downstream backends at once before the update sequence settles.",
        lesson: "Protect expensive cache misses using distributed locks and randomize your TTL windows with jitter.",
        related: ["cache-invalidation", "optimized-query"]
      },
      {
        slug: "retry-storm-cascade",
        title: "The Cascading Retry Storm",
        level: "advanced",
        time: "9 min",
        solves: 319,
        description: "Immediate, un-attenuated loop retry scripts amplify minor network hiccups into full-scale system outages.",
        setup: "A brief network hiccup slows down your downstream microservices. Instead of recovering smoothly, your client-facing applications start spamming requests, triggering a complete system outage.",
        brokenCode: `import time
import requests

def fetch_with_retry(url):
    for attempt in range(5):
        try:
            return requests.get(url, timeout=2)
        except requests.exceptions.RequestException:
            time.sleep(0) 
    raise Exception("System Failure")`,
        language: "python",
        hints: [
          "Spamming an already overloaded server with rapid retries will make it take longer to recover.",
          "Look into using Exponential Backoff throttling algorithms combined with randomized Jitter variations.",
          "This spreads out retry attempts over time, giving the downstream service breathing room to recover."
        ],
        solution: `import time
import random
import requests

def fetch_with_retry(url):
    for attempt in range(5):
        try:
            return requests.get(url, timeout=2)
        except requests.exceptions.RequestException:
            backoff = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(backoff)
    raise Exception("System Failure")`,
        explanation: "The bug: Rapidly retrying failed connections loop-floods processing channels precisely when backing systems require recovery space, causing small network stutters to swell into outages.",
        lesson: "Always implement exponential backoff and randomized jitter on network client retries.",
        related: ["api-that-works", "thundering-herd-crash"]
      },
      {
        slug: "read-your-own-writes-gap",
        title: "The Mirror Dimension Gap",
        level: "intermediate",
        time: "6 min",
        solves: 712,
        description: "Querying asynchronous read-replicas immediately after writing to a master database serves stale data to users.",
        setup: "You build an update profile bio feature. A user updates their bio, hits refresh, and gets confused because the page still displays their old text.",
        brokenCode: `def update_and_show_profile(user_id, new_bio):
    primary_db.execute("UPDATE users SET bio = ? WHERE id = ?", new_bio, user_id)
    profile = replica_db.fetch_row("SELECT bio FROM users WHERE id = ?", user_id)
    return profile`,
        language: "python",
        hints: [
          "Database replication across primary nodes and secondary replica nodes takes time.",
          "How can you ensure critical user read requests are routed to the source of truth immediately after a write operation?",
          "Route read requests for a user's own updates directly to the primary database for a short window after a write."
        ],
        solution: `def update_and_show_profile(user_id, new_bio):
    primary_db.execute("UPDATE users SET bio = ? WHERE id = ?", new_bio, user_id)
    profile = primary_db.fetch_row("SELECT bio FROM users WHERE id = ?", user_id)
    return profile`,
        explanation: "The bug: Secondary replication arrays operate on asynchronous cycles. Fetching state vectors right after a primary update returns old parameters before sync tasks settle.",
        lesson: "Always route 'read-your-own-writes' requests directly through your primary database.",
        related: ["cache-invalidation", "merge-mayhem"]
      },
      {
        slug: "rate-limit-stateless-bypass",
        title: "The Stateless Gateway Bypass",
        level: "intermediate",
        time: "5 min",
        solves: 894,
        description: "Tracking rate limit counters in-memory inside load-balanced clusters allows users to bypass restriction ceilings.",
        setup: "You configure a rate limiter to allow a maximum of 60 requests per minute. However, malicious actors manage to spam your endpoints with over 200 requests per minute without getting blocked.",
        brokenCode: `LOCAL_RATE_LIMIT_CACHE = {}

def is_rate_limited(client_ip):
    current_count = LOCAL_RATE_LIMIT_CACHE.get(client_ip, 0)
    if current_count >= 60:
        return True
    LOCAL_RATE_LIMIT_CACHE[client_ip] = current_count + 1
    return False`,
        language: "python",
        hints: [
          "If your load balancer routes traffic across 5 isolated application nodes, how can an in-memory dictionary track global usage?",
          "You need a shared, central data store to manage traffic limits across your cluster.",
          "Use a fast distributed key-value store like Redis to handle global rate-limiting counters."
        ],
        solution: `def is_rate_limited(client_ip):
    current_count = redis.incr(f"rate:{client_ip}")
    if current_count == 1:
        redis.expire(f"rate:{client_ip}", 60)
    if current_count > 60:
        return True
    return False`,
        explanation: "The bug: In-memory monitoring scopes lock transaction histories strictly inside local servers, allowing distributed balancer calls to distribute hits across nodes and escape filters.",
        lesson: "Rate-limiting mechanisms in distributed architectures must use a shared, centralized data store.",
        related: ["cache-invalidation", "secure-api-key"]
      }
    ]
  },
  {
    id: "cisco-ideathon",
    name: "Cisco Ideathon Sprint",
    icon: "🌐",
    color: "#00bce4",
    challenges: [
      {
        slug: "cisco-async-leak",
        title: "The Dangling Websocket Listener",
        level: "advanced",
        time: "6 min",
        solves: 2405,
        description: "[Cisco Ideathon 2025] Telemetry sockets leak memory across connection refreshes during router monitoring simulations.",
        setup: "You are designing a core telemetry dashboard tracking Cisco router clusters. The system works fine initially but crashes with an Out-of-Memory (OOM) error after processing 5,000 asynchronous device socket events. Clear the memory leakage pattern inside the server event tracking block.",
        brokenCode: `const WebSocket = require('ws');\nconst wss = new WebSocket.Server({ port: 8080 });\n\nlet telemetryCycles = 0;\n\nwss.on('connection', (ws) => {\n  // TRAP: A new telemetry interval loops indefinitely per connection,\n  // but remains in memory when client nodes disconnect!\n  setInterval(() => {\n    telemetryCycles++;\n    ws.send(JSON.stringify({ telemetryId: telemetryCycles, status: \"ROUTER_OK\" }));\n  }, 100);\n\n  ws.on('close', () => {\n    console.log(\"Cisco Edge Node Disconnected.\");\n  });\n});`,
        language: "javascript",
        hints: [
          "When is the setInterval loop created? Once per connection context.",
          "If 1,000 edge switches connect and reconnect, how many intervals stay running?",
          "Assign setInterval to a local reference variable and invoke clearInterval inside the close event payload."
        ],
        solution: `const WebSocket = require('ws');\nconst wss = new WebSocket.Server({ port: 8080 });\n\nlet telemetryCycles = 0;\n\nwss.on('connection', (ws) => {\n  const telemetryInterval = setInterval(() => {\n    telemetryCycles++;\n    try {\n      ws.send(JSON.stringify({ telemetryId: telemetryCycles, status: \"ROUTER_OK\" }));\n    } catch (e) {\n      clearInterval(telemetryInterval);\n    }\n  }, 100);\n\n  ws.on('close', () => {\n    clearInterval(telemetryInterval);\n    console.log(\"Cisco Edge Node Disconnected Safely.\");\n  });\n});`,
        explanation: "The Bug: Cisco systems demand zero resource wastage. Chaining anonymous event intervals inside an open node network creates an active memory siphon when client channels terminate without clearing intervals from the main Node.js event loop thread.\n\nThe Fix: Save your interval to a reference handler pointer, and cleanly run clearInterval() as soon as the 'close' event fires to free memory space.",
        lesson: "Always tear down active polling configurations when sockets close.",
        related: ["cisco-packet-race", "cisco-dangling-pool"],
        preparationGuide: "/learn/debugging-asynchronous-network-protocols"
      },
      {
        slug: "cisco-packet-race",
        title: "The Out-of-Order Packet Buffer",
        level: "advanced",
        time: "8 min",
        solves: 1102,
        description: "[Cisco Ideathon 2025] High-throughput async routers process packet fragments out of sequence under micro-burst traffic loads.",
        setup: "During network burst conditions, chunks of data payloads hit the router out of sequence. The tracking buffer maps them directly to a string as they arrive, corrupting the final payload stream structure. Implement a structured sequential layout map layer.",
        brokenCode: `let processingBuffer = \"\";\n\nasync function receivedPacketChunk(packetStream) {\n  // TRAP: Appends chunk data straight to the base sequence as they finish resolving,\n  // completely ignoring the chronological structural sequence ids!\n  const chunkData = await fetchPacketPayload(packetStream.id);\n  processingBuffer += chunkData.text;\n  return processingBuffer;\n}`,
        language: "javascript",
        hints: [
          "Async tasks resolve at different times. A larger chunk 1 might resolve after a smaller chunk 2.",
          "You must look at the sequence metadata ID attached to each network stream frame.",
          "Store chunks inside a structured key-value index map object or array before rendering the output sequence."
        ],
        solution: `let orderedBufferMap = {};\n\nasync function receivedPacketChunk(packetStream) {\n  const chunkData = await fetchPacketPayload(packetStream.id);\n  orderedBufferMap[packetStream.sequenceIndex] = chunkData.text;\n  \n  let structuredPayload = \"\";\n  const totalKeys = Object.keys(orderedBufferMap).length;\n  for (let i = 0; i < totalKeys; i++) {\n    if (orderedBufferMap[i]) structuredPayload += orderedBufferMap[i];\n  }\n  return structuredPayload;\n}`,
          explanation: "The Bug: Concurrency does not mean chronologically sequential. High-speed networking data frames often route through varying topologies, arriving completely out of alignment. Appending them blindly triggers packet corruption errors.",
          lesson: "Never assume asynchronous loops settle in structural order under load conditions.",
          related: ["cisco-async-leak", "cisco-token-bucket"],
          preparationGuide: "/learn/network-concurrency-patterns"
        },
        {
          slug: "cisco-subnet-overflow",
          title: "The Classless Subnet Overflow",
          level: "intermediate",
          time: "5 min",
          solves: 1890,
          description: "[Cisco Ideathon 2024] A custom bitwise IP configuration parser crashes completely on specific edge-case subnet masks.",
          setup: "You are parsing inbound network masks to calculate available hosts. When given a boundary mask like /32 or /31, your bitwise calculation causes a bit shift overflow, triggering runtime mathematical crashes.",
          brokenCode: `function getAvailableHosts(cidrSuffix) {\n  // TRAP: Moving bits by 32 positions exceeding base bounds \n  // triggers bitwise shifts overflow loops on boundary constraints!\n  const bitsRemaining = 32 - cidrSuffix;\n  return (1 << bitsRemaining) - 2;\n}`,
          language: "javascript",
          hints: [
            "What happens if cidrSuffix is 32? bitsRemaining becomes 0, 1 << 0 is 1. 1 - 2 is -1 hosts. Valid?",
            "What if cidrSuffix is 0? 1 << 32 in 32-bit signed integer operations wraps around to 1, causing incorrect outputs.",
            "Add protective safety blocks for edge-case CIDR suffixes, or utilize Math.pow rules instead of raw bitwise operators."
          ],
          solution: `function getAvailableHosts(cidrSuffix) {\n  if (cidrSuffix >= 31) return 0;\n  if (cidrSuffix === 0) return Math.pow(2, 32) - 2;\n  return Math.pow(2, 32 - cidrSuffix) - 2;\n}`,
          explanation: "The Bug: Standard bitwise operations in JavaScript operate tightly on 32-bit signed integer boundaries. Attempting to bit-shift parameters across 32 places overflows calculations, turning host counts into negative values.",
          lesson: "Bitwise mathematical algorithms must explicitly guard edge-case parameter limits.",
          related: ["cisco-packet-race", "cisco-slowloris-timeout"],
          preparationGuide: "/learn/bitwise-networking-logic"
        },
        {
          slug: "cisco-unhandled-rejection",
          title: "The Express Network Hang",
          level: "intermediate",
          time: "4 min",
          solves: 3120,
          description: "[Interview Technical Round] Backend microservice server crashes when a physical networking device drops connections abruptly.",
          setup: "Your server calls an external telemetry endpoint. If a field switch loses power and drops offline, your Express router route hangs forever or crashes the entire thread loop because of an unhandled async error state.",
          brokenCode: `const express = require('express');\nconst app = express();\nconst axios = require('axios');\n\napp.get('/api/router/stats', async (req, res) => {\n  // TRAP: No catch block means a network drop crashes your node runtime instance!\n  const statusReport = await axios.get('https://hardware.edge.internal/telemetry');\n  res.send(statusReport.data);\n});`,
          language: "javascript",
          hints: [
            "External devices fail constantly. An API must assume the target endpoint will drop offline.",
            "Wrap your asynchronous await triggers inside comprehensive try/catch blocks.",
            "Always return a clean error status code like 503 Service Unavailable instead of letting the thread hang."
          ],
          solution: `const express = require('express');\nconst app = express();\nconst axios = require('axios');\n\napp.get('/api/router/stats', async (req, res) => {\n  try {\n    const statusReport = await axios.get('https://hardware.edge.internal/telemetry', { timeout: 3000 });\n    return res.status(200).send(statusReport.data);\n  } catch (error) {\n    console.error(\"Safely isolated device network error: \", error.message);\n    return res.status(503).send({ error: \"Device Unreachable. Connection Timeout.\" });\n  }\n});`,
          explanation: "The Bug: Unhandled promise rejections are critical vulnerabilities. If an underlying connection drops, the unhandled exception propagates up to the main Node.js process thread and causes it to crash.",
          lesson: "Every external hardware network call must be bound to a strict timeout and a try/catch error handler.",
          related: ["cisco-async-leak", "cisco-deadlock-queue"],
          preparationGuide: "/learn/microservice-fault-tolerance"
        },
        {
          slug: "cisco-deadlock-queue",
          title: "The Thread Lock Deadlock",
          level: "advanced",
          time: "7 min",
          solves: 894,
          description: "[Cisco Ideathon 2023] Parallel package analytical components lock up indefinitely trying to access sharing telemetry streams.",
          setup: "Two structural multi-threaded controller worker queues are processing parallel packet analytics. They both attempt to lock resource pools A and B simultaneously in inverted sequences, causing a complete system deadlock.",
          brokenCode: `async function processRouteA(resourceA, resourceB) {\n  await resourceA.lock();\n  await resourceB.lock();\n  resourceB.unlock(); resourceA.unlock();\n}\n\nasync function processRouteB(resourceA, resourceB) {\n  await resourceB.lock();\n  await resourceA.lock();\n  resourceA.unlock(); resourceB.unlock();\n}`,
          language: "javascript",
          hints: [
            "This is the classic Dining Philosophers deadlock scenario.",
            "Deadlocks occur when resources are acquired in a conflicting order across separate threads.",
            "Ensure that both execution tracks lock their required resources in the exact same sequence."
          ],
          solution: `async function processRouteA(resourceA, resourceB) {\n  await resourceA.lock();\n  await resourceB.lock();\n  resourceB.unlock(); resourceA.unlock();\n}\n\nasync function processRouteB(resourceA, resourceB) {\n  await resourceA.lock();\n  await resourceB.lock();\n  resourceB.unlock(); resourceA.unlock();\n}`,
          explanation: "The Bug: Inverted locking hierarchies across concurrent worker queues create a cyclic dependency chain. Thread 1 locks resource A and waits for B, while Thread 2 locks resource B and waits for A, freezing both threads indefinitely.",
          lesson: "Always acquire shared multi-resource locks in a consistent, standardized global sequence.",
          related: ["cisco-unhandled-rejection", "cisco-dangling-pool"],
          preparationGuide: "/learn/concurrent-system-architecture"
        },
        {
          slug: "cisco-slowloris-timeout",
          title: "The Corrupt HTTP Gateway",
          level: "intermediate",
          time: "5 min",
          solves: 1450,
          description: "[Cisco Ideathon 2024] Network load balancer keeps connections open forever when attackers send partial HTTP headers.",
          setup: "Your system's HTTP socket layer keeps sockets open indefinitely for inbound streams, leaving your platform vulnerable to connection starvation attacks like Slowloris. Enforce explicit stream limits.",
          brokenCode: `const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'text/plain' });\n  res.end('Gateway Connection Acknowledged');\n});\n\nserver.listen(8080);`,
          language: "javascript",
          hints: [
            "If an attacker sends HTTP headers extremely slowly, the connection stays open indefinitely.",
            "You must explicitly restrict header parsing windows at the server configuration level.",
            "Leverage parameters like headersTimeout and requestTimeout to terminate unresponsive connections early."
          ],
          solution: `const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'text/plain' });\n  res.end('Gateway Connection Acknowledged');\n});\n\nserver.headersTimeout = 5000;\nserver.requestTimeout = 10000;\n\server.listen(8080);`,
          explanation: "The Bug: Failing to enforce clear socket parsing timeout ceilings allows slow connection streams to consume your system's entire file descriptor allocation pool, blocking legitimate traffic.",
          lesson: "Production network routing gateways must enforce strict timeout limits on connection requests.",
          related: ["cisco-subnet-overflow", "cisco-token-bucket"],
          preparationGuide: "/learn/hardening-network-gateways"
        },
        {
          slug: "cisco-checksum-failure",
          title: "The Malformed Checksum Matcher",
          level: "beginner",
          time: "3 min",
          solves: 4120,
          description: "[Cisco Ninja Track] Base-16 hexadecimal frame verification returns false due to un-trimmed string allocations.",
          setup: "Your frame parser reads validation strings from an incoming network log. Even when the payload values are correct, the conditional check fails because of trailing carriage returns embedded inside the stream parsing layer.",
          brokenCode: `function verifyFrameChecksum(logLine, expectedChecksum) {\n  const extractedChecksum = logLine.split('|')[3];\n  if (extractedChecksum === expectedChecksum) {\n    return \"FRAME_VALID\";\n  }\n  return \"FRAME_CORRUPTED\";\n}`,
          language: "javascript",
          hints: [
            "Network logging streams frequently append invisible spacing bytes like \\n or \\r.",
            "Use console.log(JSON.stringify(extractedChecksum)) to reveal any hidden whitespace characters.",
            "Sanitize parsed data entries using the native .trim() method before evaluating equality checks."
          ],
          solution: `function verifyFrameChecksum(logLine, expectedChecksum) {\n  if (!logLine || !expectedChecksum) return \"FRAME_CORRUPTED\";\n  const extractedChecksum = logLine.split('|')[3];\n  if (extractedChecksum && extractedChecksum.trim().toLowerCase() === expectedChecksum.trim().toLowerCase()) {\n    return \"FRAME_VALID\";\n  }\n  return \"FRAME_CORRUPTED\";\n}`,
          explanation: "The Bug: Raw string manipulations on network log streams routinely pass trailing spacing tokens along with data values. These hidden characters break strict equality checks, causing valid frames to be dropped.",
          lesson: "Always sanitize and trim raw string data parsed from external network sources.",
          related: ["cisco-packet-race", "cisco-dns-cache-poison"],
          preparationGuide: "/learn/string-parsing-performance"
        },
        {
          slug: "cisco-token-bucket",
          title: "The Exploded Rate Limiter",
          level: "advanced",
          time: "6 min",
          solves: 978,
          description: "[Cisco Ideathon 2025] High-speed gateway bypass lets traffic slip past strict packet-per-second constraints.",
          setup: "You implement a Token Bucket tracking method to protect a routing gateway. Under heavy multithreaded loads, race conditions allow bursts of parallel traffic to bypass your traffic limitation metrics entirely.",
          brokenCode: `let availableTokens = 100;\n\nfunction allowPacketRoute() {\n  if (availableTokens > 0) {\n    availableTokens = availableTokens - 1;\n    return true;\n  }\n  return false;\n}`,
          language: "javascript",
          hints: [
            "This is a classic non-atomic state operation race condition.",
            "Multiple asynchronous threads can read availableTokens as > 0 before any single thread updates the count.",
            "In corporate network environments, token deductions must execute as a single, atomic operation."
          ],
          solution: `let availableTokens = 100;\n\nfunction allowPacketRoute() {\n  if (availableTokens > 0) {\n    availableTokens--;\n    return true;\n  }\n  return false;\n}`,
          explanation: "The Bug: Decoupling conditional boundary evaluations from assignment modifications creates an execution gap. Under high concurrency, hundreds of operations can slip through this gap before your application updates its state variables.",
          lesson: "Rate-limiting check-and-modify steps must execute as a unified, atomic operation.",
          related: ["cisco-packet-race", "cisco-slowloris-timeout"],
          preparationGuide: "/learn/building-distributed-rate-limiters"
        },
        {
          slug: "cisco-dangling-pool",
          title: "The Orphaned Thread Pool",
          level: "advanced",
          time: "9 min",
          solves: 531,
          description: "[Interview System Round] Background packet analyzer worker threads remain allocated without releasing kernel loops.",
          setup: "To handle expensive deep packet inspection tasks, you spawn dynamic system sub-processes. Your analysis loop completes its work, but the application forgets to terminate the child processes, leading to kernel thread starvation.",
          brokenCode: `const { fork } = require('child_process');\n\nfunction analyzePacketData(packetPayload) {\n  const worker = fork('packetWorker.js');\n  worker.send({ payload: packetPayload });\n  worker.on('message', (result) => {\n    console.log(\"Analysis Completed: \", result);\n  });\n}`,
          language: "javascript",
          hints: [
            "Spawning a separate OS thread or sub-process requires explicit lifecycle management.",
            "If your application processes thousands of packets per second, orphaned child processes will quickly exhaust host system memory.",
            "Invoke the child process's .kill() method as soon as your message callback completes."
          ],
          solution: `const { fork } = require('child_process');\n\nfunction analyzePacketData(packetPayload) {\n  const worker = fork('packetWorker.js');\n  worker.send({ payload: packetPayload });\n  worker.on('message', (result) => {\n    console.log(\"Analysis Completed: \", result);\n    worker.kill();\n  });\n  worker.on('error', (err) => { worker.kill(); });\n}`,
          explanation: "The Bug: Child processes do not clean themselves up automatically when their parent execution block finishes. Leaving sub-processes open keeps file handles and memory resources allocated indefinitely, causing system crashes under production loads.",
          lesson: "Always explicitly terminate sub-process threads once their computational work is done.",
          related: ["cisco-async-leak", "cisco-deadlock-queue"],
          preparationGuide: "/learn/mastering-node-child-processes"
        },
        {
          slug: "cisco-dns-cache-poison",
          title: "The Stateless DNS Lookup Bypass",
          level: "intermediate",
          time: "6 min",
          solves: 1340,
          description: "[Cisco Ideathon 2024] Dynamic nameserver lookups bypass local cache configurations, flooding external DNS nodes.",
          setup: "Your system runs custom network name lookups dynamically for every inbound data request. Because your custom lookup wrapper bypasses your operating system's built-in DNS cache, it creates a massive I/O performance bottleneck.",
          brokenCode: `const dns = require('dns');\n\nfunction lookupTargetServer(domainUrl) {\n  dns.lookup(domainUrl, (err, address) => {\n    console.log('Resolved destination pointer: ', address);\n  });\n}`,
          language: "javascript",
          hints: [
            "Node's default dns.lookup calls the underlying OS getaddrinfo system, which can cause thread pool blocking under heavy load.",
            "To mitigate this performance hit, wrap your network calls with an internal, in-memory caching layer."
          ],
          solution: `const dns = require('dns');\nconst cacheableMap = new Map();\n\nfunction lookupTargetServer(domainUrl) {\n  if (cacheableMap.has(domainUrl)) {\n    return console.log('Resolved destination from Cache: ', cacheableMap.get(domainUrl));\n  }\n  dns.lookup(domainUrl, (err, address) => {\n    if (!err) cacheableMap.set(domainUrl, address);\n    console.log('Resolved destination via Network: ', address);\n  });\n}`,
          explanation: "The Bug: Bypassing local lookups to resolve addresses over the network for every transaction introduces a significant I/O performance bottleneck. This behavior degrades system throughput and makes your app vulnerable to outbound network starvation under load.",
          lesson: "Always cache your system's outbound domain resolution lookups.",
          related: ["cisco-checksum-failure", "cisco-token-bucket"],
          preparationGuide: "/learn/optimizing-network-io"
        }
      ]
    },
    // ── 2. PASTE THE NEW EXTENDED TCS TRACK HERE ──
    {
      id: "tcs-digital-ninja",
      name: "TCS Digital / Ninja",
      icon: "💻",
      color: "#6366f1",
      challenges: [
        {
          slug: "tcs-time-complexity",
          title: "Optimizing the Subarray Sum",
          level: "advanced",
          time: "6 min",
          solves: 4210,
          description: "[TCS Digital 2025] A brute-force nested loop times out on large input profiles ($N > 10^5$) inside the compiler.",
          setup: "Given an array of integers, you must calculate the maximum sum of a contiguous subarray of size K. The brute-force code below passes small test cases but fails with a Time Limit Exceeded (TLE) error on large evaluation profiles ($N > 10^5$). Refactor the algorithm to achieve optimal linear performance.",
          brokenCode: `function maxSubarraySum(arr, k) {\n  let maxVolumeSum = -Infinity;\n  for (let i = 0; i <= arr.length - k; i++) {\n    let currentWindowSum = 0;\n    for (let j = 0; j < k; j++) {\n      currentWindowSum += arr[i + j];\n    }\n    if (currentWindowSum > maxVolumeSum) maxVolumeSum = currentWindowSum;\n  }\n  return maxVolumeSum;\n}`,
          language: "javascript",
          hints: [
            "TCS Digital advanced tracks use large test inputs to deliberately break nested loops ($O(N^2)$ or $O(N \times K)$).",
            "Instead of recalculating the entire window sum from scratch, can you reuse the sum from the previous window?",
            "Subtract the element leaving the window and add the new element entering it. This is the Sliding Window technique."
          ],
          solution: `function maxSubarraySum(arr, k) {\n  if (arr.length < k) return 0;\n  let maxVolumeSum = 0, currentWindowSum = 0;\n  for (let i = 0; i < k; i++) currentWindowSum += arr[i];\n  maxVolumeSum = currentWindowSum;\n  for (let i = k; i < arr.length; i++) {\n    currentWindowSum += arr[i] - arr[i - k];\n    if (currentWindowSum > maxVolumeSum) maxVolumeSum = currentWindowSum;\n  }\n  return maxVolumeSum;\n}`,
          explanation: "The Bug: Re-summing overlapping window segments inside a nested loop structure forces the compiler to re-process identical data elements repeatedly. This drops performance to an inefficient $O(N \times K)$ time complexity, triggering TLE failures on large datasets.\n\nThe Fix: Convert the algorithm to a Sliding Window pattern. Reusing the previous window's sum reduces your runtime complexity to a highly efficient, single-pass linear $O(N)$ execution path.",
          lesson: "When dealing with continuous array slices, replace nested loops with a Sliding Window approach.",
          related: ["tcs-integer-overflow", "tcs-hash-collision"],
          preparationGuide: "/learn/cracking-tcs-digital-time-complexity-bottlenecks"
        },
        {
          slug: "tcs-integer-overflow",
          title: "The Product Array Overflow",
          level: "intermediate",
          time: "5 min",
          solves: 2980,
          description: "[TCS Digital 2025] Accumulator scripts break and output negative numbers when running extreme test configurations.",
          setup: "You are writing a factorial accumulator function to compute large dataset combinations. Your logic works fine for low number ranges, but outputs corrupted negative values when processing larger test cases in the compiler environment.",
          brokenCode: `function accumulateProduct(numArray) {\n  let productResult = 1;\n  for (let i = 0; i < numArray.length; i++) {\n    productResult = productResult * numArray[i];\n  }\n  return productResult;\n}`,
          language: "javascript",
          hints: [
            "JavaScript's default Number type loses precision above Number.MAX_SAFE_INTEGER ($2^{53} - 1$).",
            "Use the native BigInt data type to safely store arbitrarily large integer products."
          ],
          solution: `function accumulateProduct(numArray) {\n  if (numArray.length === 0) return 0n;\n  let productResult = 1n;\n  for (let i = 0; i < numArray.length; i++) {\n    productResult = productResult * BigInt(numArray[i]);\n  }\n  return productResult;\n}`,
          explanation: "The Bug: Standard JavaScript numeric types wrap around into invalid negative values when bitwise multiplications overflow the 32-bit signed integer boundary limit, corrupting your calculation results.",
          lesson: "Always use BigInt arrays when multiplying large factors that can exceed standard integer boundaries.",
          related: ["tcs-time-complexity", "tcs-float-precision"],
          preparationGuide: "/learn/handling-integer-overflow"
        },
        {
          slug: "tcs-string-leak",
          title: "The Silent String Churn",
          level: "beginner",
          time: "4 min",
          solves: 5120,
          description: "[TCS Ninja 2024] Repeated character string concatenation runs out of memory on standard compiler environments.",
          setup: "You are building a custom report formatting engine that processes large text data streams. Appending single text characters in a standard loop causes memory usage to skyrocket, crashing the compiler with an out-of-memory error.",
          brokenCode: `function constructReportString(characterList) {\n  let outputReport = \"\";\n  for (let i = 0; i < characterList.length; i++) {\n    outputReport += characterList[i];\n  }\n  return outputReport;\n}`,
          language: "javascript",
          hints: [
            "Because strings are immutable, `+=` allocates a brand new string copy in memory every single time it runs.",
            "Collect your character array components in a mutable array list first, then combine them in a single operation using `.join('')`."
          ],
          solution: `function constructReportString(characterList) {\n  let trackingArrayBuffer = [];\n  for (let i = 0; i < characterList.length; i++) trackingArrayBuffer.push(characterList[i]);\n  return trackingArrayBuffer.join('');\n}`,
          explanation: "The Bug: Because strings are immutable primitives, appending data inside a loop forces your application to allocate memory for a brand new string copy on every single iteration. This churn quickly triggers memory exhaustion crashes on large inputs.",
          lesson: "Avoid string concatenation inside loops; collect elements in an array buffer and apply .join() instead.",
          related: ["tcs-matrix-boundary", "tcs-type-evaluation"],
          preparationGuide: "/learn/javascript-memory-optimization"
        },
        {
          slug: "tcs-matrix-boundary",
          title: "The Empty Matrix Search Collapse",
          level: "beginner",
          time: "3 min",
          solves: 6410,
          description: "[TCS Ninja 2025] Grid tracking calculations trigger unexpected index errors when processing dynamic empty array inputs.",
          setup: "You are writing a grid search algorithm to locate targets inside a 2D coordinate space. Your logic handles populated coordinates perfectly but throws fatal runtime exceptions when evaluated against empty or missing row configurations.",
          brokenCode: `function locateMatrixTarget(matrixGrid, targetValue) {\n  const totalRows = matrixGrid.length;\n  const totalCols = matrixGrid[0].length;\n  return false;\n}`,
          language: "javascript",
          hints: [
            "Before checking column dimensions, you must verify that your matrix array actually contains valid data rows.",
            "Implement early-exit validation guards to gracefully catch empty matrices before querying internal indices."
          ],
          solution: `function locateMatrixTarget(matrixGrid, targetValue) {\n  if (!matrixGrid || matrixGrid.length === 0 || matrixGrid[0].length === 0) return false;\n  const totalRows = matrixGrid.length;\n  const totalCols = matrixGrid[0].length;\n  return false;\n}`,
          explanation: "The Bug: Accessing properties like `.length` on unverified array indices (`matrixGrid[0]`) will crash your application with a `TypeError` if the parent array wrapper structure is empty.",
          lesson: "Always implement explicit boundary check guards before querying nested multi-dimensional array indices.",
          related: ["tcs-string-leak", "tcs-binary-search-edge"],
          preparationGuide: "/learn/defensive-programming-basics"
        },
        {
          slug: "tcs-float-precision",
          title: "The Broken Currency Rounder",
          level: "intermediate",
          time: "4 min",
          solves: 3205,
          description: "[TCS Digital 2024] Base-2 float accumulator logic drifts and miscalculates salary metrics during high-volume loops.",
          setup: "Your system loops through and adds up micro-bonus percentage distributions for corporate payroll accounts. Due to underlying floating-point arithmetic tracking limits, your final calculations drift and fail strict compiler equality assertions.",
          brokenCode: `function calculatePayrollTotal(baseBonus, employeeCount) {\n  let payrollAccumulator = 0.0;\n  for (let i = 0; i < employeeCount; i++) payrollAccumulator += baseBonus;\n  return payrollAccumulator;\n}`,
          language: "javascript",
          hints: [
            "Computers represent fractional numbers using binary base-2 floating-point storage formats.",
            "Fix the issue by rounding your final result using functions like `.toFixed()`."
          ],
          solution: `function calculatePayrollTotal(baseBonus, employeeCount) {\n  let payrollAccumulator = 0.0;\n  for (let i = 0; i < employeeCount; i++) payrollAccumulator += baseBonus;\n  return parseFloat(payrollAccumulator.toFixed(2));\n}`,
          explanation: "The Bug: Computers store floating-point fractions using binary base-2 structures. Compounding fractional operations introduces subtle precision truncation errors that accumulate over time and cause code to fail exact data matches.",
          lesson: "Always apply precise epsilon thresholds or use .toFixed() formatting when evaluating floating-point arithmetic values.",
          related: ["tcs-integer-overflow", "tcs-recursion-stack"],
          preparationGuide: "/learn/floating-point-math-quirks"
        },
        {
          slug: "tcs-hash-collision",
          title: "The Plunging Hash Retrieval",
          level: "advanced",
          time: "7 min",
          solves: 1150,
          description: "[Interview Advanced Track] Custom lookup logic drops from $O(1)$ to a linear $O(N)$ lookup speed because of collision leaks.",
          setup: "You implement a custom hashing algorithm designed to index user tokens into bucketing arrays at constant $O(1)$ speeds. However, under load testing, lookup speeds plunge to a slow, linear $O(N)$ retrieval loop.",
          brokenCode: `class BasicHashBucket {\n  constructor() { this.storageSlots = new Array(16).fill(null).map(() => []); }\n  getHashIndex(tokenKey) {\n    return tokenKey.length % 16;\n  }\n  insertToken(key, value) {\n    const slotId = this.getHashIndex(key);\n    this.storageSlots[slotId].push({ key, value });\n  }\n}`,
          language: "javascript",
          hints: [
            "If multiple distinct keys generate the exact same index remainder hash value, they get lumped into the same storage bucket.",
            "Implement a more robust hashing algorithm (like DJB2 style) to distribute keys evenly."
          ],
          solution: `class BasicHashBucket {\n  constructor() { this.storageSlots = new Array(1024).fill(null).map(() => []); }\n  getHashIndex(tokenKey) {\n    let generatedHash = 5381;\n    for (let i = 0; i < tokenKey.length; i++) generatedHash = (generatedHash * 33) ^ tokenKey.charCodeAt(i);\n    return Math.abs(generatedHash) % 1024;\n  }\n  insertToken(key, value) {\n    const slotId = this.getHashIndex(key);\n    this.storageSlots[slotId].push({ key, value });\n  }\n}`,
          explanation: "The Bug: Simplistic hashing operations frequently cluster completely distinct keys into identical storage buckets. This behavior degrades your constant-time lookups into a slow, sequential linear search loop.",
          lesson: "Always implement robust, high-entropy distribution keys to prevent performance-degrading hash collisions.",
          related: ["tcs-time-complexity", "tcs-graph-cycle"],
          preparationGuide: "/learn/advanced-data-structure-optimization"
        },
        {
          slug: "tcs-binary-search-edge",
          title: "The Missing End Index",
          level: "intermediate",
          time: "4 min",
          solves: 2890,
          description: "[TCS Ninja 2025] Custom optimized binary search logic fails to check the final array boundary element correctly.",
          setup: "You implement a custom binary search algorithm to scan sorted data arrays quickly. Your logic successfully finds middle values but consistently fails to locate elements stored at the very end of your data arrays.",
          brokenCode: `function executeBinarySearch(sortedArray, targetItem) {\n  let leftIdx = 0, rightIdx = sortedArray.length - 1;\n  while (leftIdx < rightIdx) {\n    let midPoint = Math.floor((leftIdx + rightIdx) / 2);\n    if (sortedArray[midPoint] === targetItem) return midPoint;\n    if (sortedArray[midPoint] < targetItem) leftIdx = midPoint + 1;\n    else rightIdx = midPoint - 1;\n  }\n  return -1;\n}`,
          language: "javascript",
          hints: [
            "When both pointers converge, the strict leftIdx < rightIdx condition evaluates to false, causing the loop to terminate without checking that position.",
            "Fix the issue by updating your loop condition to use an inclusive less-than-or-equal-to check (leftIdx <= rightIdx)."
          ],
          solution: `function executeBinarySearch(sortedArray, targetItem) {\n  let leftIdx = 0, rightIdx = sortedArray.length - 1;\n  while (leftIdx <= rightIdx) {\n    let midPoint = Math.floor((leftIdx + rightIdx) / 2);\n    if (sortedArray[midPoint] === targetItem) return midPoint;\n    if (sortedArray[midPoint] < targetItem) leftIdx = midPoint + 1;\n    else rightIdx = midPoint - 1;\n  }\n  return -1;\n}`,
          explanation: "The Bug: Employing a strict less-than check terminates your binary search loop the moment your array boundary pointers converge. This cuts the search short, completely missing target items stored at the final index position.",
          lesson: "Always use a less-than-or-equal-to condition (<=) when writing standard binary search loops.",
          related: ["tcs-matrix-boundary", "tcs-type-evaluation"],
          preparationGuide: "/learn/binary-search-edge-cases"
        },
        {
          slug: "tcs-recursion-stack",
          title: "The Un-Memoized Fibonacci Stack",
          level: "intermediate",
          time: "5 min",
          solves: 3760,
          description: "[Interview Logic Round] Recursive dynamic programming functions hit maximum stack size limits without memoization buffers.",
          setup: "You write a recursive function to compute values in a Fibonacci sequence. When testing larger values, the massive explosion of redundant sub-calls quickly exhausts the engine's call stack limits, triggering a crash.",
          brokenCode: `function calculateFibonacci(n) {\n  if (n <= 1) return n;\n  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);\n}`,
          language: "javascript",
          hints: [
            "Without caching, calculating fib(5) forces your code to recompute the same values multiple times from scratch.",
            "Implement a simple memoization object hash map to store and reuse previous calculations."
          ],
          solution: `function calculateFibonacci(n, calculationCache = {}) {\n  if (n <= 1) return n;\n  if (calculationCache[n] !== undefined) return calculationCache[n];\n  calculationCache[n] = calculateFibonacci(n - 1, calculationCache) + calculateFibonacci(n - 2, calculationCache);\n  return calculationCache[n];\n}`,
          explanation: "The Bug: Branching recursive functions without internal state caching trigger an exponential explosion of redundant processing cycles. This quickly overwhelms the compiler engine's call stack allocation limits.",
          lesson: "Always implement memoization caching filters when writing deep recursive branching functions.",
          related: ["tcs-float-precision", "tcs-graph-cycle"],
          preparationGuide: "/learn/mastering-dynamic-programming"
        },
        {
          slug: "tcs-graph-cycle",
          title: "The Infinite Dependency Loop",
          level: "advanced",
          time: "8 min",
          solves: 945,
          description: "[TCS Digital 2024] Route analytical loops hang indefinitely when mapping components containing cyclic nodes.",
          setup: "You are writing a dependency graph parsing script to sequence software module compilations. If the codebase contains a circular dependency loop, your traversal function spins endlessly and freezes the compiler.",
          brokenCode: `function discoverDependencyTree(currentNode, adjacencyList) {\n  const connectedNodes = adjacencyList[currentNode] || [];\n  for (let i = 0; i < connectedNodes.length; i++) {\n    discoverDependencyTree(connectedNodes[i], adjacencyList);\n  }\n}`,
          language: "javascript",
          hints: [
            "Pass a tracking Set or hash map along with your recursive function calls to maintain a history of visited nodes.",
            "If your traversal encounters a node that is already marked in your visited set, exit early."
          ],
          solution: `function discoverDependencyTree(currentNode, adjacencyList, visitedSet = new Set()) {\n  if (visitedSet.has(currentNode)) return;\n  visitedSet.add(currentNode);\n  const connectedNodes = adjacencyList[currentNode] || [];\n  for (let i = 0; i < connectedNodes.length; i++) {\n    discoverDependencyTree(connectedNodes[i], adjacencyList, visitedSet);\n  }\n}`,
          explanation: "The Bug: Graph traversal algorithms that operate without state tracking sets are completely blind to circular paths. When they encounter cyclic dependencies, they re-process identical nodes endlessly, freezing the thread runtime.",
          lesson: "Always use a tracking set to log visited elements when writing graph traversal algorithms.",
          related: ["tcs-hash-collision", "tcs-recursion-stack"],
          preparationGuide: "/learn/graph-traversal-fundamentals"
        },
        {
          slug: "tcs-type-evaluation",
          title: "The Loose Type Validation Slip",
          level: "beginner",
          time: "3 min",
          solves: 4890,
          description: "[TCS Ninja 2024] Dynamic input comparisons evaluate invalid user data models safely instead of throwing errors.",
          setup: "Your code validates user identification entry numbers passed from a frontend form. Because it uses loose equality operators, string versions slip past validation parameters, leading to data type corruption in downstream operations.",
          brokenCode: `function validateSystemCode(inputCodeId) {\n  if (inputCodeId == false) return \"INVALID_CODE_FORMAT\";\n  return \"VALID_PROCEED_LOGIC\";\n}`,
          language: "javascript",
          hints: [
            "JavaScript's loose equality operator performs automatic type coercion behind the scenes.",
            "Replace loose equality checks with strict equality operators (===) to enforce precise value and type verification."
          ],
          solution: `function validateSystemCode(inputCodeId) {\n  if (inputCodeId === false) return \"INVALID_CODE_FORMAT\";\n  return \"VALID_PROCEED_LOGIC\";\n}`,
          explanation: "The Bug: Loose equality operators run implicit type coercion filters before evaluating statements. This allows mismatched input types to bypass security validations, leading to type pollution errors down the line.",
          lesson: "Always employ strict equality operators (===) to protect the data integrity of validation routines.",
          related: ["tcs-string-leak", "tcs-binary-search-edge"],
          preparationGuide: "/learn/javascript-type-coercion-pitfalls"
        }
      ]
    }
];

// ── Helper: Find challenge by slug ────────────────────────────
function findChallenge(slug) {
  for (const cat of CHALLENGE_CATEGORIES) {
    const ch = cat.challenges.find(c => c.slug === slug);
    if (ch) return { ...ch, category: cat };
  }
  return null;
}

// ── Helper: Find next challenge ─────────────────────────────
function findNextChallenge(currentSlug) {
  const all = CHALLENGE_CATEGORIES.flatMap(c => c.challenges);
  const idx = all.findIndex(c => c.slug === currentSlug);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}

const LEVEL_COLORS = {
  beginner: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
  intermediate: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#b45309" },
  advanced: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171" }
};

// ── BreakIt Challenge Page ────────────────────────────────────
export default function BreakItChallenge({ theme }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ac = isDark ? "#a78bfa" : "#7c3aed";

  const [hintIndex, setHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(() => {
    try { return parseInt(localStorage.getItem("breakit_streak") || "0"); } catch { return 0; }
  });
  const [solvedToday, setSolvedToday] = useState(() => {
    try { return localStorage.getItem("breakit_last_solve") === new Date().toDateString(); } catch { return false; }
  });

  const challenge = findChallenge(slug);
  const nextChallenge = challenge ? findNextChallenge(challenge.slug) : null;

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!challenge) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "3rem" }}>🐛</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a" }}>Challenge not found</div>
        <button onClick={() => navigate("/breakit")} style={{ background: "linear-gradient(135deg,#a78bfa,#0af)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>
          ← All Challenges
        </button>
      </div>
    );
  }

  const lc = LEVEL_COLORS[challenge.level];

  function handleSolve() {
    if (!solved) {
      setSolved(true);
      const today = new Date().toDateString();
      const lastSolve = localStorage.getItem("breakit_last_solve");
      
      let newStreak = streak;
      if (lastSolve === today) {
        // Already solved today
      } else if (lastSolve === new Date(Date.now() - 86400000).toDateString()) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
      
      localStorage.setItem("breakit_streak", newStreak.toString());
      localStorage.setItem("breakit_last_solve", today);
      localStorage.setItem(`breakit_solved_${slug}`, "true");
      setStreak(newStreak);
      setSolvedToday(true);
    }
  }

  function openInPlayground() {
    const encodedCode = encodeURIComponent(challenge.brokenCode);
    navigate(`/?playground=true&lang=${challenge.language}&code=${encodedCode}#playground`);
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", width: "100%" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "100px 24px 80px" }}>
        <button onClick={() => navigate("/breakit")} style={{ background: isDark ? "rgba(167,139,250,0.08)" : "rgba(124,58,237,0.07)", border: `1px solid ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`, borderRadius: "8px", color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "36px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontWeight: 600 }}>
          ← All Challenges
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{ background: `${challenge.category.color}18`, border: `1px solid ${challenge.category.color}33`, borderRadius: "100px", padding: "4px 14px", fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: challenge.category.color }}>
            {challenge.category.icon} {challenge.category.name}
          </span>
          <span style={{ background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: "100px", padding: "4px 14px", fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: lc.text, textTransform: "uppercase" }}>
            {challenge.level}
          </span>
          <span style={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>
            ⏱ {challenge.time} · 🔧 {challenge.solves.toLocaleString()} fixes
          </span>
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "12px", textAlign: "left" }}>
          {challenge.title}
        </h1>
        <p style={{ fontSize: "1.05rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", lineHeight: 1.7, textAlign: "left", marginBottom: "32px" }}>
          {challenge.description}
        </p>

        {(solved || solvedToday) && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px", fontFamily: "'Space Mono',monospace", fontSize: "0.72rem", color: "#34d399" }}>
            🔥 {solvedToday ? "Solved today!" : "Solved!"} · Streak: {streak} days
          </div>
        )}

        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>
            ◆ The Setup
          </div>
          <p style={{ fontSize: "0.95rem", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", lineHeight: 1.8, textAlign: "left", borderLeft: `3px solid ${ac}`, paddingLeft: "16px" }}>
            {challenge.setup}
          </p>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#f87171", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              ◆ Broken Code
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => navigator.clipboard.writeText(challenge.brokenCode)} style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"}`, borderRadius: "8px", padding: "6px 14px", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontFamily: "'Space Mono',monospace", fontSize: "0.72rem", cursor: "pointer" }}>
                📋 Copy
              </button>
              <button onClick={openInPlayground} style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", border: "none", borderRadius: "8px", padding: "6px 18px", color: "#000", fontFamily: "'Space Mono',monospace", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                ▶ Run in Playground
              </button>
            </div>
          </div>
          <pre style={{ background: isDark ? "#0d1117" : "#1a1a2e", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "12px", padding: "20px", margin: 0, overflowX: "auto", fontFamily: "'Space Mono',monospace", fontSize: "0.82rem", lineHeight: 1.8, color: "#e6edf3", whiteSpace: "pre", textAlign: "left" }}>
            <code>{challenge.brokenCode}</code>
          </pre>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>
            ◆ Hints
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {challenge.hints.map((hint, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {i < hintIndex ? (
                  <div style={{ background: isDark ? "rgba(167,139,250,0.06)" : "rgba(124,58,237,0.06)", border: `1px solid ${ac}22`, borderRadius: "10px", padding: "14px 18px" }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.62rem", color: ac, marginBottom: "6px" }}>
                      HINT {i + 1} / {challenge.hints.length}
                    </div>
                    <div style={{ fontSize: "0.88rem", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", lineHeight: 1.6 }}>
                      {hint}
                    </div>
                  </div>
                ) : i === hintIndex ? (
                  <button onClick={() => setHintIndex(i + 1)} style={{ background: isDark ? "rgba(167,139,250,0.08)" : "rgba(124,58,237,0.08)", border: `1px dashed ${ac}44`, borderRadius: "10px", padding: "14px 18px", color: ac, fontFamily: "'Space Mono',monospace", fontSize: "0.82rem", cursor: "pointer", textAlign: "left", width: "100%" }}>
                    💡 Reveal Hint {i + 1} / {challenge.hints.length}
                  </button>
                ) : (
                  <div style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, borderRadius: "10px", padding: "14px 18px", color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)", fontFamily: "'Space Mono',monospace", fontSize: "0.82rem", textAlign: "left" }}>
                    🔒 Hint {i + 1} locked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={handleSolve} disabled={solved} style={{ background: solved ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg, #34d399, #10b981)", border: "none", borderRadius: "12px", padding: "14px 32px", color: solved ? "#34d399" : "#000", fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "0.9rem", cursor: solved ? "default" : "pointer", transition: "all 0.2s" }}>
            {solved ? "✓ Bug Fixed!" : "🐛 I Found the Bug!"}
          </button>
          <button onClick={() => setShowSolution(!showSolution)} style={{ background: "transparent", border: `1px solid ${showSolution ? "#f87171" : ac}44`, borderRadius: "12px", padding: "14px 32px", color: showSolution ? "#f87171" : ac, fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            {showSolution ? "Hide Solution" : "👀 Show Solution"}
          </button>
        </div>

        {showSolution && (
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#34d399", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>
              ◆ The Fix
            </div>
            <pre style={{ background: isDark ? "#0d1117" : "#1a1a2e", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", padding: "20px", margin: 0, overflowX: "auto", fontFamily: "'Space Mono',monospace", fontSize: "0.82rem", lineHeight: 1.8, color: "#e6edf3", whiteSpace: "pre", textAlign: "left", marginBottom: "20px" }}>
              <code>{challenge.solution}</code>
            </pre>
            
            <div style={{ background: isDark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", padding: "20px 24px" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.62rem", color: "#34d399", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
                ◆ Explanation
              </div>
              <div style={{ fontSize: "0.9rem", color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)", lineHeight: 1.8, textAlign: "left", whiteSpace: "pre-line" }}>
                {challenge.explanation}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "40px", background: isDark ? "rgba(167,139,250,0.04)" : "rgba(124,58,237,0.05)", border: `1px solid ${ac}22`, borderRadius: "14px", padding: "24px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>
            ◆ The Lesson
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: isDark ? "#fff" : "#1a1a1a", lineHeight: 1.5 }}>
            "{challenge.lesson}"
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", paddingTop: "32px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}` }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {challenge.related.map(relSlug => {
              const rel = findChallenge(relSlug);
              if (!rel) return null;
              return (
                <button key={relSlug} onClick={() => navigate(`/breakit/${relSlug}`)} style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, borderRadius: "8px", padding: "8px 16px", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontFamily: "'Space Mono',monospace", fontSize: "0.72rem", cursor: "pointer" }}>
                  {rel.title} →
                </button>
              );
            })}
          </div>
          {nextChallenge && (
            <button onClick={() => navigate(`/breakit/${nextChallenge.slug}`)} style={{ background: "linear-gradient(135deg, #a78bfa, #0af)", border: "none", borderRadius: "12px", padding: "12px 24px", color: "#000", fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              Next Challenge: {nextChallenge.title} →
            </button>
          )}
        </div>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
            Share This Challenge
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "𝕏 Twitter", platform: "twitter", bg: "#1a1a1a", color: "#fff" },
              { label: "💬 WhatsApp", platform: "whatsapp", bg: "#25d366", color: "#fff" },
              { label: "💼 LinkedIn", platform: "linkedin", bg: "#0077b5", color: "#fff" },
              { label: "🔗 Copy Link", platform: "copy", bg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: isDark ? "#fff" : "#1a1a1a" },
            ].map(btn => (
              <button key={btn.platform} onClick={() => {
                const url = `https://zeroapi.in/breakit/${challenge.slug}`;
                const text = `I just fixed "${challenge.title}" on ZeroAPI BreakIt! ${url}`;
                if (btn.platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                else if (btn.platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                else if (btn.platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
                else if (btn.platform === "copy") navigator.clipboard.writeText(url);
              }} style={{ background: btn.bg, border: "none", borderRadius: "8px", padding: "9px 18px", color: btn.color, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontWeight: 500 }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
