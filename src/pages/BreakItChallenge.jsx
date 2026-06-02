// src/pages/BreakItChallenge.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";

// ── Challenge Data (same as BreakIt.jsx, but with full code) ──
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
        brokenCode: `import pandas as pd

df = pd.read_csv("sales.csv")
df.dropna(inplace=True)
df["revenue"] = df["price"] * df["quantity"]

print(f"Total revenue: \\${df['revenue'].sum():.2f}")`,
        language: "python",
        hints: [
          "Look at how missing values are handled. What does dropna() actually do?",
          "Check what happens when quantity is 0 vs NaN. Are they treated the same?",
          "dropna() drops ANY row with ANY NaN. What if price is missing too? How would you know?",
        ],
        solution: `import pandas as pd

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

print(f"Total revenue: ${df_clean['revenue'].sum():.2f}")`,
        explanation: `The bug: df.dropna() drops ANY row with ANY missing value. If even one column has NaN, the entire row is gone. This silently removes valid data where only non-critical columns are missing.

The fix: Use dropna(subset=["quantity"]) to only drop rows where the specific column you need is missing. Also, check for zero vs NaN — 0 is valid data, NaN is missing data. The original code conflated them.

The lesson: "Silent failures are worse than loud crashes."`,
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
        explanation: `The bug: String "101" and integer 101 are different types. In Python, "101" == 101 returns False. The 'in' operator uses equality comparison, so "101" in [101, 102, 103] is False for every element. The code silently reports all IDs as missing.

The fix: Convert to the same type before comparison. Using set() also gives O(1) lookup instead of O(n) list scan.

The lesson: "Type safety isn't a preference — it's a requirement."`,
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
        explanation: `The bug: A left join with duplicate keys in the right table creates duplicate rows in the result. Customer 1 has 2 orders → 2 rows. Customer 2 has 3 orders → 3 rows. Customer 3 has 0 orders → 1 row (with NaN). Total: 6 rows, not 3.

The fix: Aggregate (groupby) before merging if you only need one row per customer. Or validate row counts after merge to catch unexpected explosions.

The lesson: "Joins multiply. Always validate your row count."`,
        lesson: "Joins multiply. Always validate your row count.",
        related: ["silent-data-killer", "accuracy-trap"],
      },
    ],
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
        brokenCode: `from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier()
model.fit(X_train, y_train)

print(f"Accuracy: {model.score(X_train, y_train):.2f}")`,
        language: "python",
        hints: [
          "What dataset is model.score() using here? Training or test?",
          "Training accuracy on a complex model like Random Forest is almost always near 100%.",
          "The real question is: how does it perform on UNSEEN data?",
        ],
        solution: `from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# WRONG: Training accuracy (memorization)
train_acc = model.score(X_train, y_train)
print(f"Training accuracy: {train_acc:.2f} — IGNORE THIS")

# RIGHT: Test accuracy (generalization)
test_acc = model.score(X_test, y_test)
print(f"Test accuracy: {test_acc:.2f}")

# BETTER: Cross-validation (more robust)
cv_scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"CV accuracy: {cv_scores.mean():.2f} (+/- {cv_scores.std():.2f})")`,
        explanation: `The bug: model.score(X_train, y_train) evaluates on training data. A Random Forest with enough trees will memorize training data, giving ~99% accuracy. This tells you nothing about real-world performance.

The fix: Always evaluate on held-out test data. Better yet, use cross-validation for more robust estimates. Report test accuracy, not training accuracy.

The lesson: "The metric you report is the metric you optimize. Choose wrong, optimize garbage."`,
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
        brokenCode: `from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

# Fill missing values and scale ALL data first
df["age"] = df["age"].fillna(df["age"].mean())
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df.drop("target", axis=1))
y = df["target"]

model = RandomForestClassifier()
scores = cross_val_score(model, X_scaled, y, cv=5)
print(f"CV accuracy: {scores.mean():.2f}")`,
        language: "python",
        hints: [
          "When you scale all data before splitting, what information leaks from test to train?",
          "The mean imputation used ALL data including the test fold's future information.",
          "In cross-validation, each fold should be treated as unseen during preprocessing.",
        ],
        solution: `from sklearn.preprocessing import StandardScaler
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
print(f"CV accuracy: {scores.mean():.2f}")

# For final evaluation: fit on full train, evaluate on held-out test
pipeline.fit(X_train, y_train)
test_score = pipeline.score(X_test, y_test)
print(f"Test accuracy: {test_score:.2f}")`,
        explanation: `The bug: Preprocessing (scaling, imputation) on ALL data before splitting leaks information from test folds into training. The scaler learns the global mean (including test data). The imputer uses global statistics. Your model effectively "cheats" by seeing test data patterns during preprocessing.

The fix: Use sklearn Pipeline. Preprocessing steps execute inside each CV fold, only seeing training data. This simulates real production where new data arrives unscaled.

The lesson: "Preprocessing is part of training. Not a pre-step."`,
        lesson: "Preprocessing is part of training. Not a pre-step.",
        related: ["accuracy-trap", "cache-invalidation"],
      },
    ],
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
        explanation: `The bug: IN with a correlated subquery is O(n²) — for every row in orders, scan all matching customers. SELECT * pulls unnecessary columns, increasing I/O. No LIMIT means sorting ALL matching rows. No index means full table scan.

The fix: Use JOIN with proper indexing. Select only needed columns. Add LIMIT for pagination. Always EXPLAIN ANALYZE before deploying.

The lesson: "Performance is a feature you ship on day one, or a bug you discover on day 100."`,
        lesson: "Performance is a feature you ship on day one, or a bug you discover on day 100.",
        related: ["merge-mayhem", "cache-invalidation"],
      },
    ],
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
        solution: `import requests
import time
import json

def get_user_data(user_id, max_retries=3):
    url = f"https://api.example.com/users/{user_id}"
    
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

print(f"Successfully fetched {len(results)}/999 users")`,
        explanation: `The bug: No status check means any non-200 response crashes on response.json(). No timeout means requests hang indefinitely. No retry means transient failures are fatal. No logging means you can't debug. No checkpoint means you restart from scratch.

The fix: Check status with raise_for_status(). Add timeout. Exponential backoff for retries. Log every failure. Save checkpoints to resume.

The lesson: "Code that works in your notebook is not production code. The difference is what happens when things break."`,
        lesson: "Code that works in your notebook is not production code. The difference is what happens when things break.",
        related: ["secure-api-key", "optimized-query"],
      },
    ],
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
        solution: `import os
from groq import Groq

# FAIL FAST — validate immediately
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError(
        "GROQ_API_KEY not found!\\n"
        "Set it with: export GROQ_API_KEY='your-key'\\n"
        "Or create a .env file (and add .env to .gitignore!)"
    )

# Validate format (basic check)
if not api_key.startswith("gsk_"):
    raise ValueError("GROQ_API_KEY looks invalid. Should start with 'gsk_'")

client = Groq(api_key=api_key)

# Use the client...
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)

# .gitignore must include:
# .env
# *.key
# config/secrets.json`,
        explanation: `The bug: os.getenv returns None silently if the variable is missing. This None propagates to the API client, which may fail with a cryptic error or worse — use a default/demo key that racks up charges. Hardcoded "temporary" keys get committed to Git and leak.

The fix: Validate immediately. Fail fast with a clear message. Check key format. Use .env files with .gitignore. Never let None propagate.

The lesson: "Security isn't a feature. It's the absence of a class of bugs you don't know you have yet."`,
        lesson: "Security isn't a feature. It's the absence of a class of bugs you don't know you have yet.",
        related: ["api-that-works", "leaky-validation"],
      },
    ],
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
        brokenCode: `import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

def get_product_price(product_id):
    # Check cache first
    cached = r.get(f"price:{product_id}")
    if cached:
        return json.loads(cached)
    
    # Fetch from DB
    price = db.query(f"SELECT price FROM products WHERE id = {product_id}")
    r.set(f"price:{product_id}", json.dumps(price))
    return price`,
        language: "python",
        hints: [
          "What happens when the price changes in the database? Is the cache updated?",
          "How long does the cache live? Forever? What's Redis's default TTL?",
          "When you restart your dev server, does the cache persist? What about production?",
        ],
        solution: `import redis
import json
from datetime import timedelta

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def get_product_price(product_id):
    cache_key = f"price:{product_id}"
    
    # Check cache with TTL awareness
    cached = r.get(cache_key)
    if cached:
        ttl = r.ttl(cache_key)
        print(f"Cache hit! TTL remaining: {ttl}s")
        return json.loads(cached)
    
    # Fetch from DB (use parameterized query!)
    price = db.query("SELECT price FROM products WHERE id = ?", (product_id,))
    
    # Set with TTL — cache expires, forcing refresh
    r.setex(cache_key, timedelta(hours=1), json.dumps(price))
    
    # Publish invalidation event for other services
    r.publish("price_updates", json.dumps({
        "product_id": product_id,
        "new_price": price,
        "timestamp": time.time()
    }))
    
    return price

# On price update in admin panel:
def update_price(product_id, new_price):
    db.execute("UPDATE products SET price = ? WHERE id = ?", (new_price, product_id))
    r.delete(f"price:{product_id}")  # Invalidate immediately
    r.publish("price_updates", json.dumps({
        "product_id": product_id,
        "new_price": new_price
    }))`,
        explanation: `The bug: r.set() without TTL means cache lives forever. Database updates never reflect in cache. Dev server restarts clear Redis (flush), masking the bug. Production Redis persists across deploys. Stale data accumulates indefinitely.

The fix: Always set TTL (r.setex). Implement cache invalidation on data changes. Use pub/sub for cross-service invalidation. Monitor cache hit rates and TTL effectiveness.

The lesson: "There are only two hard things in Computer Science: cache invalidation and naming things."`,
        lesson: "There are only two hard things in Computer Science: cache invalidation and naming things.",
        related: ["optimized-query", "leaky-validation"],
      },
    ],
  },
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
  intermediate: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" },
  advanced: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171" },
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
        // Already solved today, streak unchanged
      } else if (lastSolve === new Date(Date.now() - 86400000).toDateString()) {
        // Solved yesterday, increment streak
        newStreak = streak + 1;
      } else {
        // Streak broken, start at 1
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
    // Navigate to playground with code pre-filled
    const encodedCode = encodeURIComponent(challenge.brokenCode);
    navigate(`/?playground=true&lang=${challenge.language}&code=${encodedCode}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", width: "100%" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Back button */}
        <button onClick={() => navigate("/breakit")} style={{ background: isDark ? "rgba(167,139,250,0.08)" : "rgba(124,58,237,0.07)", border: `1px solid ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`, borderRadius: "8px", color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "36px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontWeight: 600 }}>
          ← All Challenges
        </button>

        {/* Header */}
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

        {/* Streak badge */}
        {(solved || solvedToday) && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px", fontFamily: "'Space Mono',monospace", fontSize: "0.72rem", color: "#34d399" }}>
            🔥 {solvedToday ? "Solved today!" : "Solved!"} · Streak: {streak} day{solved !== 1 ? "s" : ""}
          </div>
        )}

        {/* The Setup */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>
            ◆ The Setup
          </div>
          <p style={{ fontSize: "0.95rem", color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", lineHeight: 1.8, textAlign: "left", borderLeft: `3px solid ${ac}`, paddingLeft: "16px" }}>
            {challenge.setup}
          </p>
        </div>

        {/* Broken Code */}
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

        {/* Hint System */}
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

        {/* I Found the Bug / Show Solution */}
        <div style={{ marginBottom: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={handleSolve} disabled={solved} style={{ background: solved ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg, #34d399, #10b981)", border: "none", borderRadius: "12px", padding: "14px 32px", color: solved ? "#34d399" : "#000", fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "0.9rem", cursor: solved ? "default" : "pointer", transition: "all 0.2s" }}>
            {solved ? "✓ Bug Fixed!" : "🐛 I Found the Bug!"}
          </button>
          <button onClick={() => setShowSolution(!showSolution)} style={{ background: "transparent", border: `1px solid ${showSolution ? "#f87171" : ac}44`, borderRadius: "12px", padding: "14px 32px", color: showSolution ? "#f87171" : ac, fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
            {showSolution ? "Hide Solution" : "👀 Show Solution"}
          </button>
        </div>

        {/* Solution */}
        {showSolution && (
          <div style={{ marginBottom: "32px", animation: "fadeIn 0.3s ease" }}>
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

        {/* The Lesson */}
        <div style={{ marginBottom: "40px", background: isDark ? "rgba(167,139,250,0.04)" : "rgba(124,58,237,0.05)", border: `1px solid ${ac}22`, borderRadius: "14px", padding: "24px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>
            ◆ The Lesson
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: isDark ? "#fff" : "#1a1a1a", lineHeight: 1.5 }}>
            "{challenge.lesson}"
          </div>
        </div>

        {/* Navigation */}
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

        {/* Share */}
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
