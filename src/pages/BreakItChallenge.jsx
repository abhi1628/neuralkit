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
        title: "The Dangling Thread Pool Leak",
        level: "advanced",
        time: "6 min",
        solves: 2405,
        description: "[Cisco Ideathon 2025] Telemetry thread workers leak memory across connection refreshes during router monitoring simulations.",
        setup: "You are designing a core telemetry monitoring service in Python tracking Cisco router clusters. The system spawns a background thread executor for every incoming device connection. While testing under network volatility, the host machine crashes with an Out-of-Memory (OOM) error due to un-recycled worker threads.",
        brokenCode: `import threading\nimport socket\nimport time\n\ndef handle_device_telemetry(device_socket):\n    while True:\n        try:\n            # TRAP: If the socket hangs without a timeout loop, the thread \n            # blocks here forever, leaking system memory resources!\n            data = device_socket.recv(1024)\n            if not data:\n                break\n            process_metrics(data)\n        except Exception:\n            pass\n\ndef start_server():\n    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    server.bind(('0.0.0.0', 8080))\n    server.listen(5)\n    while True:\n        client_sock, _ = server.accept()\n        t = threading.Thread(target=handle_device_telemetry, args=(client_sock,))\n        t.start()`,
        language: "python",
        hints: [
          "Threads in Python don't automatically terminate when a client disconnects if the read loop is stuck blocking on a dead socket.",
          "You must implement an explicit connection socket timeout using `device_socket.settimeout(5.0)` to break out of the infinite while loop.",
          "Ensure that your `except` block cleanly executes a `break` or `close()` action when a network anomaly occurs."
        ],
        solution: `import threading\nimport socket\n\ndef handle_device_telemetry(device_socket):\n    # FIX: Enforce an explicit connection timeout ceiling\n    device_socket.settimeout(5.0)\n    try:\n        while True:\n            try:\n                data = device_socket.recv(1024)\n                if not data:\n                    break\n                process_metrics(data)\n            except socket.timeout:\n                print("Connection dead. Exiting thread.")\n                break\n    finally:\n        device_socket.close() # Clean up resource allocations`,
        explanation: "The Bug: Cisco evaluations strictly screen for resource leaks. Firing persistent execution loops without timeout bounds traps the runtime workers in a zombie state inside memory blocks when remote network interfaces go down silently.\n\nThe Fix: Configure a definitive network read timeout parameter (`settimeout`), catch the resulting connection exception, and execute an explicit breakdown sequence (`close()`) to free kernel resources.",
        lesson: "Never spawn network worker threads without establishing strict socket read execution timeouts.",
        related: ["cisco-packet-race", "cisco-deadlock-queue"],
        preparationGuide: "/learn/python-network-concurrency"
      },
      {
        slug: "cisco-packet-race",
        title: "The Packet Buffer Out-Of-Bounds",
        level: "advanced",
        time: "8 min",
        solves: 1102,
        description: "[Cisco Ideathon 2025] High-throughput async routers process packet fragments out of sequence under micro-burst traffic loads.",
        setup: "You are optimizing a low-latency network frame assembler in C++. Incoming packet payloads contain a sequential header index tracking where they belong. Your buffer script writes frames to memory registers as they arrive, but drops transactions or overflows bounds when packet IDs arrive out of sequence.",
        brokenCode: `#include <iostream>\n#include <string>\n\nstd::string globalPacketBuffer[5];\n\n// TRAP: Blindly uses incoming sequence IDs as direct indices for fixed-size arrays \n// without conducting any boundary validation checks!\nvoid insertPacketChunk(int sequenceId, std::string chunkText) {\n    globalPacketBuffer[sequenceId] = chunkText;\n}`,
        language: "cpp",
        hints: [
          "Network frames can arrive completely out of sequence. What happens if a corrupted header carries an index of -5 or 100?",
          "Writing to `globalPacketBuffer[100]` breaks memory boundaries, corrupts adjacent data blocks, and triggers a Segmentation Fault.",
          "Implement defensive guard blocks to verify that the incoming sequence index sits safely within the boundaries of the allocated array tracking range."
        ],
        solution: `#include <iostream>\n#include <string>\n\nstd::string globalPacketBuffer[5];\n\nvoid insertPacketChunk(int sequenceId, std::string chunkText) {\n    // FIX: Restrict transactions within safe layout tracking ranges\n    if (sequenceId < 0 || sequenceId >= 5) {\n        std::cerr << "Alert: Malformed network frame index dropped safely." << std::endl;\n        return; \n    }\n    globalPacketBuffer[sequenceId] = chunkText;\n}`,
        explanation: "The Bug: Hardcoded routing structures do not natively protect memory banks from out-of-order data floods. Processing dynamic network inputs directly as array markers without bounds enforcement exposes your system to deep security vulnerabilities and stability crashes.",
        lesson: "Never write an incoming network parameter to a memory array without enforcing a strict boundary limit validation.",
        related: ["cisco-subnet-overflow", "cisco-deadlock-queue"],
        preparationGuide: "/learn/defensive-cpp-memory-management"
      },
      {
        slug: "cisco-subnet-overflow",
        title: "The Classless Subnet Overflow",
        level: "intermediate",
        time: "5 min",
        solves: 1890,
        description: "[Cisco Ideathon 2024] A custom bitwise IP configuration parser crashes completely on specific edge-case subnet masks.",
        setup: "You are writing a core bitwise subnet analyzer utility in C++ to compute available host capacities within CIDR ranges. When evaluated against boundary masks like /32 or /31, your bitwise left-shift calculations exceed integer register storage maximums, inducing structural compiler errors.",
        brokenCode: `#include <iostream>\n\nunsigned int getAvailableHosts(int cidrSuffix) {\n    // TRAP: Shifting bit strings by 32 places or more on standard \n    // 32-bit integer layouts induces undefined behavioral compilation loops!\n    int bitsRemaining = 32 - cidrSuffix;\n    return (1 << bitsRemaining) - 2;\n}`,
        language: "cpp",
        hints: [
          "In C++, shifting a 32-bit integer by 32 positions or a negative index triggers undefined behavior.",
          "If the `cidrSuffix` is 32, `bitsRemaining` is 0. `1 << 0` is 1, yielding `1 - 2 = -1` which wraps to `4294967295` on an unsigned int.",
          "Add protective guard blocks to handle point-to-point router links (/31 and /32) explicitly before running shifting masks."
        ],
        solution: `#include <iostream>\n\nunsigned int getAvailableHosts(int cidrSuffix) {\n    // FIX: Add strict validation barriers to handle boundary conditions safely\n    if (cidrSuffix >= 31) {\n        return 0; // /31 and /32 subnets contain 0 usable host addresses\n    }\n    if (cidrSuffix == 0) {\n        return 4294967294; // Global default routing space maximum\n    }\n    return (1UL << (32 - cidrSuffix)) - 2;\n}`,
        explanation: "The Bug: Low-level architecture questions are a favorite of Cisco interviewers. Standard signed 32-bit shift manipulations overreach register boundaries when computing full network sizes, throwing arithmetic overflows or negative numbers into execution registers.",
        lesson: "Always implement explicit input guard assertions before processing low-level bitwise operations.",
        related: ["cisco-async-leak", "cisco-packet-race"],
        preparationGuide: "/learn/low-level-bitwise-networking"
      },
      {
        slug: "cisco-unhandled-rejection",
        title: "The Python Connection Hang",
        level: "intermediate",
        time: "4 min",
        solves: 3120,
        description: "[Interview Technical Round] Backend automation scripts hang forever when a physical networking device drops connections abruptly.",
        setup: "You write a Python script that polls hardware data metrics from field routing switches. If a switch loses connection power and drops offline, your synchronization loop hangs indefinitely, freezing your dashboard monitoring daemon.",
        brokenCode: `import urllib.request\n\ndef fetch_switch_status():\n    # TRAP: Calling connection requests without defining an explicit timeout variable\n    # allows socket streams to wait indefinitely on dropped connections!\n    url = "http://192.168.1.50/api/v1/telemetry"\n    response = urllib.request.urlopen(url)\n    return response.read()`,
        language: "python",
        hints: [
          "By default, standard python connection engines wait forever for socket state maps if a host goes silent without cleanly shutting down.",
          "Pass a strict numerical timeout threshold constraint argument to the `.urlopen()` execution query.",
          "Wrap the logic execution stream within explicit try/except safety containers to catch network connectivity issues gracefully."
        ],
        solution: `import urllib.request\nimport urllib.error\n\ndef fetch_switch_status():\n    url = "http://192.168.1.50/api/v1/telemetry"\n    try:\n      # FIX: Bind the request transaction to an explicit 3-second timeout window\n      response = urllib.request.urlopen(url, timeout=3.0)\n      return response.read()\n    except urllib.error.URLError as e:\n      print(f"Isolated connection failure safely: {e.reason}")\n      return None`,
        explanation: "The Bug: Assuming target endpoints stay stable introduces vulnerability loops. If a physical hardware switch fails mid-transmission, the un-timed blocking socket hangs the entire execution loop pipeline.",
        lesson: "Every outbound network transaction must enforce an explicit execution timeout ceiling.",
        related: ["cisco-async-leak", "cisco-slowloris-timeout"],
        preparationGuide: "/learn/handling-hardware-network-timeouts"
      },
      {
        slug: "cisco-deadlock-queue",
        title: "The Thread Lock Deadlock",
        level: "advanced",
        time: "7 min",
        solves: 894,
        description: "[Cisco Ideathon 2023] Parallel packet analytical components lock up indefinitely trying to access shared telemetry streams.",
        setup: "Two tracking sub-threads inside a low-level Python packet controller application process real-time statistics. When high connection volumes hit the router, both tracks lock up simultaneously, freezing your engine process logs.",
        brokenCode: `import threading\n\nlockA = threading.Lock()\nlockB = threading.Lock()\n\n# Thread 1 task runtime channel\ndef process_channel_one():\n    with lockA:\n        with lockB: # TRAP: Waits indefinitely on Thread 2 to drop lockB!\n            print("Channel 1 metrics mapped.")\n\n# Thread 2 task runtime channel\ndef process_channel_two():\n    with lockB:\n        with lockA: # TRAP: Waits indefinitely on Thread 1 to drop lockA!\n            print("Channel 2 metrics mapped.")`,
        language: "python",
        hints: [
          "This condition forms the classic cross-dependency design flaw known as a Deadlock.",
          "Deadlocks occur when independent concurrent processes try to acquire shared resource locks in conflicting orders.",
          "Fix the lock synchronization state by standardizing the acquisition sequence uniformly across both executing threads."
        ],
        solution: `import threading\n\nlockA = threading.Lock()\nlockB = threading.Lock()\n\ndef process_channel_one():\n    with lockA:\n        with lockB:\n            print("Channel 1 metrics mapped.")\n\ndef process_channel_two():\n    # FIX: Standardize locking chain alignment order sequence\n    with lockA:\n        with lockB:\n            print("Channel 2 metrics mapped.")`,
        explanation: "The Bug: Inverted resource acquisition structures inside high-concurrency systems create a circular wait chain. Thread 1 locks A and blocks waiting for B, while Thread 2 locks B and blocks waiting for A, locking up your background execution workers indefinitely.",
        lesson: "Always acquire system multi-resource resource locks in a consistent, standardized global sequence.",
        related: ["cisco-async-leak", "cisco-unhandled-rejection"],
        preparationGuide: "/learn/concurrency-deadlock-prevention"
      },
      {
        slug: "cisco-slowloris-timeout",
        title: "The Un-Timed Socket Starvation",
        level: "intermediate",
        time: "5 min",
        solves: 1450,
        description: "[Cisco Ideathon 2024] Network load balancer keeps connections open forever when attackers send partial HTTP headers.",
        setup: "You are programming a high-speed network parser tracking socket traffic frames in C++. While inspecting telemetry traffic under heavy load conditions, your server runs out of file descriptors because slow, malicious client nodes hold connection sockets open endlessly without transmitting data.",
        brokenCode: `#include <iostream>\n#include <sys/socket.h>\n#include <unistd.h>\n\nvoid listenToIncomingConnection(int serverSocket) {\n    int clientSocket = accept(serverSocket, nullptr, nullptr);\n    char buffer[1024];\n    \n    // TRAP: Raw recv calls block the engine thread indefinitely until data arrives, \n    // letting bad actors starve the socket pool by opening connection loops and sending nothing!\n    int bytesRead = recv(clientSocket, buffer, sizeof(buffer), 0);\n    close(clientSocket);\n}`,
        language: "cpp",
        hints: [
          "By default, standard `recv` implementations block thread execution structures forever until an input packet arrives.",
          "You must configure an explicit timeout value on your socket descriptors using `setsockopt` with the `SO_RCVTIMEO` flag parameter.",
          "This ensures that if a client node fails to send data within a target threshold window, the socket terminates safely."
        ],
        solution: `#include <iostream>\n#include <sys/socket.h>\n#include <unistd.h>\n#include <sys/time.h>\n\nvoid listenToIncomingConnection(int serverSocket) {\n    int clientSocket = accept(serverSocket, nullptr, nullptr);\n    \n    // FIX: Attach an explicit kernel level read timeout to the socket interface descriptor\n    struct timeval tv;\n    tv.tv_sec = 4; // Force a strict 4-second timeout\n    tv.tv_usec = 0;\n    setsockopt(clientSocket, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof(tv));\n    \n    char buffer[1024];\n    int bytesRead = recv(clientSocket, buffer, sizeof(buffer), 0);\n    close(clientSocket);\n}`,
        explanation: "The Bug: Allowing sockets to block indefinitely lets slow connection streams consume your system's file descriptor allocation pool. This exposes your routing gateway to denial-of-service starvation vulnerabilities.",
        lesson: "Always set strict socket-level timeout flags (`SO_RCVTIMEO`) on low-level network processing systems.",
        related: ["cisco-unhandled-rejection", "cisco-subnet-overflow"],
        preparationGuide: "/learn/resilient-socket-programming"
      },
      {
        slug: "cisco-checksum-failure",
        title: "The Malformed Checksum Matcher",
        level: "beginner",
        time: "3 min",
        solves: 4120,
        description: "[Cisco Track] Base-16 hexadecimal frame verification returns false due to un-trimmed string allocations.",
        setup: "Your system reads packet integrity keys from a raw hardware networking log file in Python. Even when the payload values are mathematically correct, your checksum validation loop flags them as corrupted due to hidden carriage return characters (`\\r\\n`) trailing inside your file line readers.",
        brokenCode: `def verify_packet_checksum(log_line, expected_hex_hash):\n    # TRAP: Splitting data entries over string arrays leaves trailing whitespaces\n    # and line breaks intact, causing strict equality checks to fail!\n    data_tokens = log_line.split(",")\n    extracted_hash = data_tokens[2]\n    \n    if extracted_hash == expected_hex_hash:\n        return "CHECKSUM_OK"\n    return "CHECKSUM_CORRUPTED"`,
        language: "python",
        hints: [
          "Network logging logs and raw terminal outputs frequently append invisible line breaks like `\\n` or `\\r` to strings.",
          "Use `print(repr(extracted_hash))` to reveal any hidden whitespace characters sitting inside your variable.",
          "Sanitize the extracted hash variable using the native `.strip()` method before comparing strings."
        ],
        solution: `def verify_packet_checksum(log_line, expected_hex_hash):\n    if not log_line or not expected_hex_hash:\n        return "CHECKSUM_CORRUPTED"\n        \n    data_tokens = log_line.split(",")\n    extracted_hash = data_tokens[2]\n    \n    # FIX: Strip trailing whitespaces and normalize casing structures\n    if extracted_hash.strip().lower() == expected_hex_hash.strip().lower():\n        return "CHECKSUM_OK"\n    return "CHECKSUM_CORRUPTED"`,
        explanation: "The Bug: String parsing routines running on raw system logs pass invisible carriage return characters into your tracking variables. These hidden tokens cause strict equality checks to fail, leading your script to drop valid data packets.",
        lesson: "Always strip trailing whitespace and match text casing when validating strings parsed from external system logs.",
        related: ["cisco-packet-race", "cisco-dns-cache-poison"],
        preparationGuide: "/learn/data-sanitization-techniques"
      },
      {
        slug: "cisco-token-bucket",
        title: "The Racing Rate Limiter",
        level: "advanced",
        time: "6 min",
        solves: 978,
        description: "[Cisco Ideathon 2025] High-speed gateway bypass lets traffic slip past strict packet-per-second constraints.",
        setup: "You implement a Token Bucket mechanism in Python to prevent high-speed traffic flooding. Under heavy multi-threaded stress tests, bursts of parallel client packets successfully bypass your protection ceilings, exposing your application to traffic drops.",
        brokenCode: `import time\n\ntokens_available = 50\n\ndef throttle_traffic_stream():\n    global tokens_available\n    # TRAP: Reading and updating state variables across concurrent operations \n    // without synchronization wrappers lets parallel requests bypass safety limits!\n    if tokens_available > 0:\n        time.sleep(0.001) # Simulate minor internal routing overhead\n        tokens_available -= 1\n        return "FORWARD_PACKET"\n    return "DROP_PACKET"`,
        language: "python",
        hints: [
          "This issue highlights a non-atomic state operation bug known as a Race Condition.",
          "Multiple asynchronous threads can evaluate the condition `tokens_available > 0` simultaneously before any single thread updates the counter.",
          "Wrap your check-and-modify step inside a `threading.Lock()` container to ensure atomicity."
        ],
        solution: `import threading\nimport time\n\ntokens_available = 50\nbucket_lock = threading.Lock()\n\ndef throttle_traffic_stream():\n    global tokens_available\n    # FIX: Wrap state modifications inside a mutual exclusion lock to guarantee atomicity\n    with bucket_lock:\n        if tokens_available > 0:\n            tokens_available -= 1\n            return "FORWARD_PACKET"\n        return "DROP_PACKET"`,
        explanation: "The Bug: Decoupling condition checking steps from variable assignment updates opens an execution window. Under high concurrency, hundreds of operations can slip through this gap before your application updates its state variables.",
        lesson: "State modifications that govern rate-limiting or security filtering blocks must execute as a single, atomic operation.",
        related: ["cisco-deadlock-queue", "cisco-packet-race"],
        preparationGuide: "/learn/thread-safety-in-python"
      },
      {
        slug: "cisco-dangling-pool",
        title: "The Orphaned Process Leak",
        level: "advanced",
        time: "9 min",
        solves: 531,
        description: "[Interview System Round] Background packet analyzer sub-processes remain allocated without releasing system process tracks.",
        setup: "To handle expensive deep packet inspection tasks without blocking your main application loop, you spawn sub-processes using Python's `multiprocessing` library. Everything runs fine initially, but the host system crashes after a few hours because of thousands of uncollected zombie processes.",
        brokenCode: `import multiprocessing\nimport time\n\ndef run_packet_analysis(packet_data):\n    # Simulate deep processing logic layout\n    time.sleep(0.5)\n\ndef on_packet_received(packet_payload):\n    # TRAP: Spawning standalone sub-processes dynamically inside an active loop \n    # without calling join() or terminate() leaves dead tracks in the process table!\n    p = multiprocessing.Process(target=run_packet_analysis, args=(packet_payload,))\n    p.start()`,
        language: "python",
        hints: [
          "Operating systems do not automatically clear down sub-processes when they finish execution if the parent task doesn't acknowledge them.",
          "To clean up finished sub-processes, you must explicitly call `.join()` or leverage a managed process pool.",
          "Refactor your logic to run tasks within a fixed-size `multiprocessing.Pool` structure to recycle system workers automatically."
        ],
        solution: `import multiprocessing\nimport time\n\ndef run_packet_analysis(packet_data):\n    time.sleep(0.5)\n\n# FIX: Initialize a fixed size managed process execution pool canvas\nprocess_pool = multiprocessing.Pool(processes=4)\n\ndef on_packet_received(packet_payload):\n    # Forward tracking components to your managed process pool worker array safely\n    process_pool.apply_async(run_packet_analysis, args=(packet_payload,))`,
        explanation: "The Bug: Spawning unmanaged processes dynamically inside high-volume loops leads to resource leaks. Once the child tasks exit, they remain in the operating system's process table as zombie processes, eventually exhausting the host's process ID allocation limit.",
        lesson: "Always run high-frequency background worker tasks inside a managed process execution pool.",
        related: ["cisco-async-leak", "cisco-deadlock-queue"],
        preparationGuide: "/learn/advanced-python-multiprocessing"
      },
      {
        slug: "cisco-dns-cache-poison",
        title: "The Un-Indexed Array Lookup Bottleneck",
        level: "intermediate",
        time: "6 min",
        solves: 1340,
        description: "[Cisco Ideathon 2024] Sequential routing configuration table scans cause high latency on high-throughput data gateways.",
        setup: "You are programming an internal routing lookup module in C++. Every packet carrying a target device destination ID must match an active port assignment index. Under simulation testing, your lookup engine experiences high processing latency, dropping packet volumes.",
        brokenCode: `#include <iostream>\n#include <vector>\n#include <string>\n\nstruct RouteRule { std::string targetIP; int portMapping; };\nstd::vector<RouteRule> globalRoutingTable;\n\n// TRAP: Linear loop searching through an un-indexed vector layout \n// forces a slow O(N) scan bottleneck for every single passing packet!\nint findTargetPort(std::string destinationIP) {\n    for (const auto& rule : globalRoutingTable) {\n        if (rule.targetIP == destinationIP) return rule.portMapping;\n    }\n    return -1;\n}`,
        language: "cpp",
        hints: [
          "A sequential `for` loop must inspect every element one by one, dropping performance to a slow $O(N)$ runtime complexity curve.",
          "If your routing table scales to thousands of entry markers, matching data fields becomes an expensive operation.",
          "Replace the un-indexed vector storage framework with a highly optimized associative hash structure like `std::unordered_map` to achieve constant-time $O(1)$ lookups."
        ],
        solution: `#include <iostream>\n#include <unordered_map>\n\n// FIX: Migrate your storage infrastructure to a high speed associative hash index mapping layout\nstd::unordered_map<std::string, int> optimizedRoutingTable;\n\nint findTargetPort(std::string destinationIP) {\n    // Conduct lookups at constant O(1) velocity bounds regardless of table volume sizes\n    auto matchPointer = optimizedRoutingTable.find(destinationIP);\n    if (matchPointer != optimizedRoutingTable.end()) {\n        return matchPointer->second;\n    }\n    return -1;\n}`,
        explanation: "The Bug: Employing sequential search metrics inside high-throughput packet processing channels introduces an architectural bottleneck. Scaling table capacities forces your routing engine to burn extensive CPU cycles, lowering data transmission speeds.",
        lesson: "Always use associative hash data structures (`std::unordered_map`) to handle high-frequency system lookups.",
        related: ["cisco-packet-race", "cisco-token-bucket"],
        preparationGuide: "/learn/cpp-data-structure-performance"
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
    },
  {
    id: "cloud-architecture",
    name: "Cloud & Architecture",
    icon: "🏗️",
    color: "#ec4899",
    challenges: [
      {
        slug: "cloud-iam-exposure",
        title: "The Over-Privileged S3 Bucket",
        level: "intermediate",
        time: "5 min",
        solves: 1420,
        description: "[AWS Cloud Track] A misconfigured resource policy exposes proprietary system assets to anonymous external domains.",
        theorySlug: "iam-security-best-practices",
        setup: "You are setting up an AWS S3 bucket access policy to share pre-trained ML model weights with a trusted third-party data analytics cluster. The configuration passes validation checks, but security auditing metrics immediately flag the deployment for violating global compliance parameters.",
        brokenCode: `{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "CrossAccountModelSharing",\n      "Effect": "Allow",\n      "Principal": "*",\n      "Action": "s3:GetObject",\n      "Resource": "arn:aws:s3:::zeroapi-model-weights/*"\n    }\n  ]\n}`,
        language: "json",
        hints: [
          "Setting Principal to a wildcard '*' grants read access to any client or domain across the entire public internet.",
          "To secure the configuration, you must restrict the Principal value to your trusted partner's explicit AWS Account ARN.",
          "Change Principal from '*' to an object mapping directly to an explicit root AWS Account ID structure."
        ],
        solution: `{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "CrossAccountModelSharingSecure",\n      "Effect": "Allow",\n      "Principal": {\n        "AWS": "arn:aws:iam::123456789012:root"\n      },\n      "Action": "s3:GetObject",\n      "Resource": "arn:aws:s3:::zeroapi-model-weights/*"\n    }\n  ]\n}`,
        explanation: "The Bug: Utilizing wildcards within public cloud resource policy definitions creates an unintentional public disclosure gateway. Anyone on the internet can read or scrape your proprietary model weights, introducing severe security compliance failures.\n\nThe Fix: Restrict resource accessibility rules by assigning the Principal property directly to explicit, authorized cross-account AWS identifiers or individual IAM roles.",
        lesson: "Never use public wildcards in access policies unless the resource is genuinely meant to be public.",
        related: ["cloud-ssrf-metadata", "cloud-cors-wildcard"],
        preparationGuide: "/learn/iam-security-best-practices"
      },
      {
        slug: "cloud-cors-wildcard",
        title: "The Open Vault Gateway",
        level: "intermediate",
        time: "4 min",
        solves: 1980,
        description: "[Production Gateway] Combining global origin wildcards with active credential configurations triggers browser blocks.",
        theorySlug: "mastering-cors-architectures",
        setup: "An engineer configures a production backend middleware layout to handle cross-origin traffic easily. However, frontend web users report that user dashboard requests fail with critical browser console authorization blocks.",
        brokenCode: `const express = require('express');\nconst cors = require('cors');\nconst app = express();\n\n// TRAP: Combining wildcard origin rules with credentials allowed flags\n// forces security rejections inside modern browser runtimes!\napp.use(cors({\n  origin: '*',\n  credentials: true\n}));`,
        language: "javascript",
        hints: [
          "Modern web browsers strictly block cross-origin calls that combine wildcard origins with active credentials flags.",
          "To allow credentials safely, you must replace the wildcard origin with an explicit list of trusted web domains.",
          "Enforce strict array checking or absolute string origin maps to allow user cookies to pass through securely."
        ],
        solution: `const express = require('express');\nconst cors = require('cors');\nconst app = express();\n\nconst productionAllowlist = ['https://zeroapi.in', 'https://app.zeroapi.in'];\n\napp.use(cors({\n  origin: (origin, callback) => {\n    if (!origin || productionAllowlist.indexOf(origin) !== -1) {\n      callback(null, true);\n    } else {\n      callback(new Error('CORS Policy Rejection. Origin Unauthorized.'));\n    }\n  },\n  credentials: true\n}));`,
        explanation: "The Bug: Combining standard wildcards with active cookie credentials introduces a dangerous cross-origin vulnerability. To prevent automated authentication scraping, browser engines explicitly reject requests where these configurations are combined.\n\nThe Fix: Define an explicit domain allowlist and map incoming requests to verified origin markers before issuing approval headers.",
        lesson: "Universal wildcards and credential processing are mutually exclusive in secure production environments.",
        related: ["cloud-iam-exposure", "cloud-stateless-bypass"],
        preparationGuide: "/learn/mastering-cors-architectures"
      },
      {
        slug: "cloud-ssrf-metadata",
        title: "The Metadata Siphon",
        level: "advanced",
        time: "7 min",
        solves: 890,
        description: "[Systems Security] Un-sanitized proxy parameters allow attackers to extract internal server credentials.",
        theorySlug: "preventing-ssrf-vulnerabilities",
        setup: "You implement an optimization service that pulls user-submitted image links to generate thumbnail assets. A security review flags that malicious actors can pass specific local parameters to scrape your internal cloud environment credentials.",
        brokenCode: `const express = require('express');\nconst axios = require('axios');\nconst app = express();\n\napp.get('/api/proxy/thumbnail', async (req, res) => {\n  // TRAP: Accepting raw, un-sanitized user inputs directly into your system's \n  // internal HTTP client opens the door to Server-Side Request Forgery (SSRF)!\n  const targetUrl = req.query.url;\n  const response = await axios.get(targetUrl);\n  res.send(response.data);\n});`,
        language: "javascript",
        hints: [
          "What happens if an attacker supplies an internal address like `http://169.254.169.254/latest/meta-data/`?",
          "That IP maps directly to the AWS EC2 Instance Metadata Service, which can leak temporary server keys.",
          "Implement a protective validation regex check or an absolute allowlist to restrict calls strictly to public web protocols."
        ],
        solution: `const express = require('express');\nconst axios = require('axios');\nconst app = express();\nconst { URL } = require('url');\n\napp.get('/api/proxy/thumbnail', async (req, res) => {\n  try {\n    const userUrl = new URL(req.query.url);\n    \n    // Block local lookups and internal infrastructure paths\n    if (['localhost', '127.0.0.1', '169.254.169.254'].includes(userUrl.hostname)) {\n      return res.status(403).send({ error: "Access Denied. Internal Destinations Blocked." });\n    }\n    \n    const response = await axios.get(userUrl.href, { timeout: 3000 });\n    return res.send(response.data);\n  } catch (err) {\n    return res.status(400).send({ error: "Malformed Connection Stream" });\n  }\n});`,
        explanation: "The Bug: Processing user-supplied URLs without validation opens your app to Server-Side Request Forgery (SSRF). Attackers can trick your server into querying its own internal infrastructure, exposed databases, or cloud provider metadata endpoints to steal credentials.\n\nThe Fix: Enforce strict URL structural parsing, sanitize inputs against known internal ranges, and drop connections that point back to private subnets.",
        lesson: "Treat every outbound request initiated by user input as a high-risk connection vector.",
        related: ["cloud-iam-exposure", "cloud-docker-root"],
        preparationGuide: "/learn/preventing-ssrf-vulnerabilities"
      },
      {
        slug: "cloud-docker-root",
        title: "The Root Privilege Breach",
        level: "beginner",
        time: "3 min",
        solves: 3410,
        description: "[Dockerfile Optimization] Building container runtime environments without restricted service users violates least-privilege standards.",
        theorySlug: "hardening-docker-containers",
        setup: "An automation engine compiles a microservice into a Docker container. Staging security checkers block the final deployment artifact because application dependencies run with dangerously high permission privileges inside the host node.",
        brokenCode: `FROM node:18-alpine\nWORKDIR /usr/src/app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 5000\n# TRAP: Omitting a dedicated user allocation forces the engine\n# to run your code with full root permissions by default!\nCMD ["node", "index.js"]`,
        language: "dockerfile",
        hints: [
          "If an attacker exploits a code vulnerability within this application, they will inherit root access to the entire container environment.",
          "Alpine Node base images include a pre-configured low-privilege system account called 'node'.",
          "Add an explicit USER instruction before your entrypoint command to drop execution privileges."
        ],
        solution: `FROM node:18-alpine\nWORKDIR /usr/src/app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 5000\n\n# Safely transition runtime context to a low-privilege system user\nUSER node\nCMD ["node", "index.js"]`,
        explanation: "The Bug: Skipping explicit runtime account declarations causes container execution layers to default to full root access. If the application is compromised, attackers can leverage these high privileges to break isolation boundaries and attack the host cluster node.\n\nThe Fix: Use the USER command to drop process privileges down to non-root accounts before launching your application runtime.",
        lesson: "Containers are not security boundaries. Never run your containerized code with root privileges.",
        related: ["cloud-ssrf-metadata", "cloud-zombie-pid"],
        preparationGuide: "/learn/hardening-docker-containers"
      },
      {
        slug: "cloud-zombie-pid",
        title: "The Zombie Process Apocalypse",
        level: "advanced",
        time: "7 min",
        solves: 645,
        description: "[Container Engineering] Running standalone scripts under PID 1 leaks dead child threads inside host runtimes.",
        theorySlug: "container-process-lifecycles",
        setup: "You deploy a high-frequency automation worker that executes thousands of short-lived shell sub-processes. After a few hours of operation, your container instances freeze up entirely due to a massive buildup of uncollected zombie processes.",
        brokenCode: `FROM python:3.10-slim\nWORKDIR /workspace\nCOPY . .\nRUN pip install -r requirements.txt\n\n// TRAP: Standalone application layers evaluated under PID 1\n// do not automatically pick up and reap dead child processes!\nCMD ["python", "process_scheduler.py"]`,
        language: "dockerfile",
        hints: [
          "In Linux systems, the process assigned to PID 1 is responsible for cleaning up orphan child processes.",
          "Standard application runtimes like Python or Node do not include system init behaviors and will leak resource allocations when child threads exit.",
          "Integrate a lightweight initialization daemon like 'tini' to handle process reaping and system signals cleanly."
        ],
        solution: `FROM python:3.10-slim\n# Install a lightweight system init layer\nRUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*\n\nWORKDIR /workspace\nCOPY . .\nRUN pip install -r requirements.txt\n\n# Bind the init harness to execute under PID 1\nENTRYPOINT ["/usr/bin/tini", "--"]\nCMD ["python", "process_scheduler.py"]`,
        explanation: "The Bug: Standard languages executing under PID 1 inside Linux environments lack system init signal-reaping capabilities. When sub-processes exit, they remain in the process table as dead 'zombie' threads, eventually exhausting the system's available process pool.",
        lesson: "Always use an initialization wrapper like tini when containers spawn frequent child sub-processes.",
        related: ["cloud-docker-root", "cloud-promise-leak"],
        preparationGuide: "/learn/container-process-lifecycles"
      },
      {
        slug: "cloud-k8s-spiral",
        title: "The Liveness Probe Death Spiral",
        level: "advanced",
        time: "8 min",
        solves: 720,
        description: "[Kubernetes Architecture] Pointing automated node health monitoring to heavy processing lanes triggers false restart loops.",
        theorySlug: "kubernetes-probe-orchestration",
        setup: "You configure a Kubernetes deployment structure with automated health validation monitors. During a sudden surge in user traffic, instead of scaling up gracefully, your pods are repeatedly terminated and restarted by the cluster scheduler.",
        brokenCode: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: core-api-service\nspec:\n  template:\n    spec:\n      containers:\n      - name: web-node\n        image: zeroapi/core:v1\n        livenessProbe:\n          httpGet:\n            # TRAP: Pointing health probes to heavy computational operations\n            # triggers false timeouts and restart loops under load conditions!\n            path: /api/v1/analytics/db-sync-check\n            port: 8080\n          initialDelaySeconds: 15\n          periodSeconds: 10`,
        language: "yaml",
        hints: [
          "When traffic surges, heavy operational paths experience processing delays and take longer to respond.",
          "If the livenessProbe requests time out, Kubernetes falsely assumes your application is dead and triggers a forced restart.",
          "Decouple system orchestration health checks from heavy downstream dependencies by using a lightweight, dedicated endpoint."
        ],
        solution: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: core-api-service\nspec:\n  template:\n    spec:\n      containers:\n      - name: web-node\n        image: zeroapi/core:v1\n        livenessProbe:\n          httpGet:\n            # Use an isolated, lightweight endpoint that doesn't hit external databases\n            path: /healthz\n            port: 8080\n          initialDelaySeconds: 5\n          periodSeconds: 10\n        readinessProbe:\n          httpGet:\n            path: /readyz\n            port: 8080\n          initialDelaySeconds: 10\n          periodSeconds: 10`,
        explanation: "The Bug: Binding automated liveness check parameters to database connection steps or intensive analytical tasks introduces a risky architectural dependency. When system resource loads increase, these endpoints fail to respond in time, tricking the cluster into a destructive restart loop.",
        lesson: "Keep your system health checks completely decoupled from heavy application dependencies.",
        related: ["cloud-retry-storm", "cloud-promise-leak"],
        preparationGuide: "/learn/kubernetes-probe-orchestration"
      },
      {
        slug: "cloud-thundering-herd",
        title: "The Thundering Herd Avalanche",
        level: "advanced",
        time: "6 min",
        solves: 1130,
        description: "[Cache Strategy] Simultaneous global key expirations trigger overwhelming traffic floods on downstream backends.",
        theorySlug: "caching-strategies-at-scale",
        setup: "Your system speeds up API response times by caching high-traffic dashboard feeds. However, exactly every hour on the dot, your primary database CPU utilization spikes to 100%, causing transient database connection drops.",
        brokenCode: `async function fetchGlobalMetrics() {\n  const cacheKey = "dashboard:global:stats";\n  let data = await redis.get(cacheKey);\n  \n  // TRAP: When the cache expires, thousands of concurrent requests hit this block\n  // simultaneously, causing a massive traffic flood on your downstream database!\n  if (!data) {\n    data = await database.executeHeavyReportingQuery();\n    await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);\n  }\n  return JSON.parse(data);\n}`,
        language: "javascript",
        hints: [
          "When a popular cache key expires under high traffic loads, thousands of concurrent requests will find a cache miss simultaneously.",
          "This forces all active requests to drop down and query your database at the exact same moment.",
          "Implement a distributed mutual exclusion lock to ensure only one worker thread rebuilds the cache at a time."
        ],
        solution: `async function fetchGlobalMetrics() {\n  const cacheKey = "dashboard:global:stats";\n  const lockKey = "lock:dashboard:global:stats";\n  \n  let data = await redis.get(cacheKey);\n  if (!data) {\n    // Acquire a mutual exclusion lock to protect your database\n    const acquiredLock = await redis.set(lockKey, "LOCKED", "NX", "PX", 5000);\n    \n    if (acquiredLock) {\n      data = await database.executeHeavyReportingQuery();\n      // Add a randomized time jitter to vary expiration windows\n      const randomJitter = Math.floor(Math.random() * 300);\n      await redis.set(cacheKey, JSON.stringify(data), "EX", 3600 + randomJitter);\n      await redis.del(lockKey);\n    } else {\n      // Wait briefly and try pulling from the rebuilt cache again\n      await new Promise(resolve => setTimeout(resolve, 200));\n      return fetchGlobalMetrics();\n    }\n  }\n  return JSON.parse(data);\n}`,
        explanation: "The Bug: Allowing un-throttled, concurrent cache misses to pass through to your database under load creates a serious bottleneck. This thundering herd behavior can quickly crash expensive database infrastructure.",
        lesson: "Protect expensive cache misses with distributed resource locks and introduce entropy using TTL jitter.",
        related: ["cloud-retry-storm", "cloud-stateless-bypass"],
        preparationGuide: "/learn/caching-strategies-at-scale"
      },
      {
        slug: "cloud-retry-storm",
        title: "The Cascading Retry Storm",
        level: "intermediate",
        time: "5 min",
        solves: 2240,
        description: "[Microservice Dynamics] Blind immediate network retry loops multiply a minor timeout glitch into a system-wide outage.",
        theorySlug: "resilient-microservice-architectures",
        setup: "A brief network hiccup introduces high latency into an internal payment confirmation system. Instead of recovering smoothly, the platform's client applications launch continuous, immediate retry requests, causing a complete system outage.",
        brokenCode: `const axios = require('axios');\n\nasync function dispatchPaymentVerification(payload) {\n  // TRAP: Spamming a struggling server with rapid, immediate retries\n  // prevents it from recovering and amplifies minor hiccups into total outages!\n  for (let attempt = 1; attempt <= 5; attempt++) {\n    try {\n      return await axios.post('https://pay.internal/verify', payload);\n    } catch (error) {\n      console.log(\`Connection failure. Launching immediate retry attempt \${attempt}\`);\n    }\n  }\n  throw new Error("Payment Gateway Exhausted");\n}`,
        language: "javascript",
        hints: [
          "Spamming an already overloaded microservice with immediate retries robs it of the processing recovery space it needs to self-heal.",
          "Distribute retry requests over an expanding time frame by implementing an Exponential Backoff strategy.",
          "Add a randomized 'jitter' offset to prevent groups of distinct client processes from retrying at the exact same millisecond."
        ],
        solution: `const axios = require('axios');\n\nasync function dispatchPaymentVerification(payload) {\n  const maxAttempts = 5;\n  for (let attempt = 1; attempt <= maxAttempts; attempt++) {\n    try {\n      return await axios.post('https://pay.internal/verify', payload, { timeout: 2000 });\n    } catch (error) {\n      if (attempt === maxAttempts) throw error;\n      \n      // Implement exponential backoff with randomized jitter tracking\n      const backoffDelay = Math.pow(2, attempt) * 1000;\n      const randomizedJitter = Math.random() * 1000;\n      const executionDelay = backoffDelay + randomizedJitter;\n      \n      console.log(\`Backing off connection for \${executionDelay.toFixed(0)}ms before retry\`);\n      await new Promise(resolve => setTimeout(resolve, executionDelay));\n    }\n  }\n}`,
        explanation: "The Bug: Executing immediate, un-throttled retry loops when systems experience latency failures triggers a dangerous retry storm. This spikes traffic volumes and knocks down recovering downstream targets.",
        lesson: "Always decouple retry algorithms using exponential backoff and randomized network jitter calculations.",
        related: ["cloud-k8s-spiral", "cloud-thundering-herd"],
        preparationGuide: "/learn/resilient-microservice-architectures"
      },
      {
        slug: "cloud-stateless-bypass",
        title: "The Stateless Gateway Bypass",
        level: "intermediate",
        time: "5 min",
        solves: 1670,
        description: "[Distributed Systems] Tracking high-volume rate limits inside local memory blocks lets traffic escape protection layers.",
        theorySlug: "scaling-stateless-gateways",
        setup: "You implement a middleware rate limiter designed to drop abusive traffic exceeding 60 requests per minute per user. The system passes tests locally, but malicious scraping tools bypass it completely in production.",
        brokenCode: `const localRateLimitMap = new Map();\n\nfunction verifyTrafficLimits(clientIp) {\n  // TRAP: Storing tracking data inside local in-memory states \n  // breaks completely when your app is deployed behind a load balancer!\n  const totalHits = localRateLimitMap.get(clientIp) || 0;\n  if (totalHits >= 60) {\n    return false; // Drop request\n  }\n  localRateLimitMap.set(clientIp, totalHits + 1);\n  return true; // Accept request\n}`,
        language: "javascript",
        hints: [
          "Production load balancers distribute incoming traffic across multiple independent application containers.",
          "An in-memory tracking Map cannot share state data across these separate server instances.",
          "Move your counter state data to a fast, shared centralized cache like Redis to maintain a global source of truth."
        ],
        solution: `// Move rate-limiting state management to a shared Redis cluster\nasync function verifyTrafficLimits(clientIp) {\n  const rateKey = \`rate:\${clientIp}\`;\n  \n  // Increment the global request counter atomically\n  const totalHits = await redis.incr(rateKey);\n  \n  if (totalHits === 1) {\n    // Set a strict 60-second sliding expiration window\n    await redis.expire(rateKey, 60);\n  }\n  \n  if (totalHits > 60) {\n    return false; // Rate limit exceeded, reject connection\n  }\n  return true; // Within limits, allow request\n}`,
        explanation: "The Bug: Storing operational data inside local memory maps creates state isolation issues in clustered environments. Because the load balancer distributes requests across nodes, attackers can rotate connections to stay under local limits and exploit your app.",
        lesson: "Rate-limiting and security filtering mechanisms in clustered systems must use shared, centralized data states.",
        related: ["cloud-cors-wildcard", "cloud-thundering-herd"],
        preparationGuide: "/learn/scaling-stateless-gateways"
      },
      {
        slug: "cloud-promise-leak",
        title: "The Dangling Background Leak",
        level: "advanced",
        time: "6 min",
        solves: 910,
        description: "[Runtime Optimization] Firing un-timed background workers without exception catch blocks continuously siphons RAM channels.",
        theorySlug: "asynchronous-resource-management",
        setup: "You add an asynchronous logging module to process user click telemetry data in the background. While initially fast, your production server container consistently runs out of RAM and crashes every 4 hours under heavy user traffic.",
        brokenCode: `const express = require('express');\nconst app = express();\n\napp.post('/api/v1/event/click', (req, res) => {\n  // TRAP: Spawning background promises without timeouts or catch handlers\n  // siphons server memory whenever downstream targets run slowly!\n  dispatchTelemetryToAnalyticsCluster(req.body);\n  \n  res.status(202).send({ processing: true });\n});`,
        language: "javascript",
        hints: [
          "If the analytics endpoint experiences slowdowns, un-awaited background promises will accumulate in your app's memory heap.",
          "Failing to handle async rejections can eventually stall the Node.js event loop or cause memory leaks.",
          "Enforce explicit processing timeouts and wrap background promises with clear exception catch blocks."
        ],
        solution: `const express = require('express');\nconst app = express();\n\napp.post('/api/v1/event/click', (req, res) => {\n  // Handle background execution traces safely using explicit timeouts and error catches\n  Promise.race([\n    dispatchTelemetryToAnalyticsCluster(req.body),\n    new Promise((_, reject) => setTimeout(() => reject(new Error('Telemetry Connection Timeout')), 4000))\n  ])\n  .catch(err => {\n    console.error("Safely isolated background error trace: ", err.message);\n  });\n  \n  // Return an early response to keep user response paths fast\n  return res.status(202).send({ processing: true });\n});`,
        explanation: "The Bug: Spawning un-awaited async operations without tracking constraints introduces an application memory leak. If external targets slow down or hang, these background actions stay allocated in the process heap, exhausting system memory.",
        lesson: "Every background promise must be bound to an explicit execution timeout limit and an exception catch block.",
        related: ["cloud-zombie-pid", "cloud-k8s-spiral"],
        preparationGuide: "/learn/asynchronous-resource-management"
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
            <div style={{ marginBottom: "40px", background: isDark ? "rgba(167,139,250,0.04)" : "rgba(124,58,237,0.05)", border: `1px solid ${ac}22`, borderRadius: "14px", padding: "24px 28px", textAlign: "center" }}>
  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>
    ◆ The Lesson
  </div>
  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: isDark ? "#fff" : "#1a1a1a", lineHeight: 1.5, marginBottom: challenge.theorySlug ? "14px" : "0px" }}>
    "{challenge.lesson}"
  </div>

  {/* NEW: Dynamic theory bridge block link */}
  {challenge.theorySlug && (
    <button 
      onClick={() => navigate(`/learn/${challenge.theorySlug}`)}
      style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${ac}44`, borderRadius: "8px", padding: "6px 16px", color: ac, fontFamily: "'Space Mono',monospace", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = `${ac}15`; }}
      onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"; }}
    >
      📖 Read Complete Preparation & Theory Guide →
    </button>
  )}
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
