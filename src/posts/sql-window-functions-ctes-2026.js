const post = {
  slug: "sql-window-functions-ctes-2026",
  title: "SQL in 2026: Window Functions, CTEs, and the Queries That Actually Get Asked in Interviews",
  date: "May 21, 2026",
  readTime: "12 min read",
  category: "Database",
  categoryColor: "#f59e0b",
  excerpt: "Stop writing SELECT * and hoping for the best. These are the SQL patterns that separate backend engineers from database wizards — and the exact questions Uber, Stripe, and Meta are asking in 2026.",
  coverEmoji: "🐘",
  tags: ["SQL", "Database", "Interview", "Backend", "Data Engineering"],
  content: [
    {
      type: "intro",
      text: "In 2024, knowing JOINs and GROUP BY was enough to pass most SQL rounds. In 2026, every backend interview includes at least one window function problem, a CTE-heavy scenario, or a query optimization challenge. The gap between 'I know SQL' and 'I can think in SQL' has never been wider. This guide covers the patterns that actually matter — not academic trivia, but the queries that break production and decide whether you get the offer."
    },
    {
      type: "h2",
      text: "The SQL Interview Landscape in 2026"
    },
    {
      type: "p",
      text: "Before we dive into queries, understand what companies are actually testing. SQL rounds have evolved from 'write a JOIN' to 'optimize this 10-second query on a billion-row table.'"
    },
    {
      type: "versions-table",
      rows: [
        { version: "Basic SQL", released: "2015-era", status: "Expected", highlight: "JOINs, GROUP BY, subqueries — table stakes for any role" },
        { version: "Window Functions", released: "2018-era", status: "Standard", highlight: "ROW_NUMBER(), RANK(), LAG()/LEAD() — now asked in 80% of interviews" },
        { version: "CTEs & Recursive CTEs", released: "2020-era", status: "Common", highlight: "WITH clauses, hierarchical data, graph-like queries in SQL" },
        { version: "Query Optimization", released: "2024-era", status: "Growing", highlight: "EXPLAIN ANALYZE, index tuning, execution plans — senior-level filter" },
        { version: "Modern SQL (2026)", released: "Now", status: "Differentiator", highlight: "JSON operations, LATERAL JOINs, FILTER clauses, time-series analysis" },
      ]
    },
    {
      type: "h2",
      text: "Window Functions: The Pattern That Separates Juniors From Seniors"
    },
    {
      type: "p",
      text: "Window functions are the most important SQL concept you can learn in 2026. They solve problems that GROUP BY cannot — ranking, running totals, year-over-year comparisons — without collapsing rows. Every major tech company asks them."
    },
    {
      type: "do-dont",
      items: [
        { do: "Use ROW_NUMBER() when you need unique ranks (no gaps, no ties)", dont: "Use RANK() when you need dense ranking — know the difference" },
        { do: "Use LAG()/LEAD() for period-over-period comparisons (daily revenue vs yesterday)", dont: "Self-JOIN the same table to compare rows — it's slower and harder to read" },
        { do: "Use PARTITION BY to reset calculations per group (e.g., rank per department)", dont: "Forget PARTITION BY and accidentally rank across the entire table" },
        { do: "Use window frames (ROWS/RANGE BETWEEN) for running totals and moving averages", dont: "Calculate running totals in application code — let the database do it" },
        { do: "Combine multiple window functions in one query for complex analytics", dont: "Write separate queries and JOIN them back together" },
      ]
    },
    {
      type: "h2",
      text: "Real Interview Question: Top N Per Group"
    },
    {
      type: "p",
      text: "This is the #1 most-asked window function question. Variations appear at Uber, Meta, and every Series B startup."
    },
    {
      type: "code-compare",
      label: "Interview question: Top 3 salaries per department",
      before: { version: "Junior approach (WRONG)", code: `# ❌ GROUP BY collapses rows — you lose the actual employees
SELECT department, MAX(salary) as top_salary
FROM employees
GROUP BY department;

# This only gives you ONE top salary per department.
# What if they ask for top 3? You can't do it with GROUP BY.` },
      after: { version: "Senior approach (CORRECT)", code: `# ✅ Window function preserves all rows, ranks within groups
SELECT 
  employee_id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (
    PARTITION BY department 
    ORDER BY salary DESC
  ) as dept_rank
FROM employees
QUALIFY dept_rank <= 3;

# PARTITION BY resets ranking per department
# ORDER BY DESC puts highest salary first
# QUALIFY filters after window function runs
# This gives exactly top 3 per department, no matter how many departments.` }
    },
    {
      type: "h2",
      text: "CTEs: Write Queries That Don't Make You Cry"
    },
    {
      type: "p",
      text: "Common Table Expressions (CTEs) with the WITH clause are not just syntax sugar — they make complex queries readable, debuggable, and recursive. In 2026 interviews, messy nested subqueries are a red flag."
    },
    {
      type: "code-compare",
      label: "CTE vs nested subqueries",
      before: { version: "Nested subquery mess (UNREADABLE)", code: `# ❌ Three levels of nesting — good luck debugging this
SELECT 
  customer_id,
  total_spent
FROM (
  SELECT 
    customer_id,
    SUM(amount) as total_spent
  FROM (
    SELECT * 
    FROM orders 
    WHERE status = 'completed'
  ) filtered_orders
  GROUP BY customer_id
) customer_totals
WHERE total_spent > 1000;` },
      after: { version: "CTE approach (READABLE)", code: `# ✅ Named steps you can read top-to-bottom
WITH completed_orders AS (
  SELECT * 
  FROM orders 
  WHERE status = 'completed'
),
customer_totals AS (
  SELECT 
    customer_id,
    SUM(amount) as total_spent
  FROM completed_orders
  GROUP BY customer_id
)
SELECT customer_id, total_spent
FROM customer_totals
WHERE total_spent > 1000;

# Each CTE is a named building block
# Easy to debug: comment out final SELECT, inspect any CTE
# Interviewers can follow your logic without getting lost` }
    },
    {
      type: "h2",
      text: "Recursive CTEs: The Power Move"
    },
    {
      type: "p",
      text: "Recursive CTEs solve hierarchical data problems — org charts, folder trees, friend-of-friend recommendations — that would otherwise require application code or graph databases. Knowing this puts you in the top 10% of SQL candidates."
    },
    {
      type: "code-block",
      label: "Recursive CTE: Employee hierarchy (org chart)",
      code: `# Find all employees under a specific manager (including indirect reports)
WITH RECURSIVE org_tree AS (
  -- Anchor: start with the target manager
  SELECT 
    employee_id,
    name,
    manager_id,
    0 as level
  FROM employees
  WHERE employee_id = 42  -- VP of Engineering

  UNION ALL

  -- Recursive step: find direct reports of current level
  SELECT 
    e.employee_id,
    e.name,
    e.manager_id,
    ot.level + 1
  FROM employees e
  INNER JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT 
  REPEAT('  ', level) || name as org_chart,
  level,
  employee_id
FROM org_tree
ORDER BY level, name;

# Output:
# Alice (VP)           level 0
#   Bob (Director)     level 1
#     Carol (Manager)  level 2
#       Dave (IC)      level 3
# Interview tip: Always include a level counter and cycle detection` }
    },
    {
      type: "h2",
      text: "The 3 SQL Skills That Make You Irreplaceable in 2026"
    },
    {
      type: "p",
      text: "AI can generate basic queries. It cannot replace these three capabilities that separate database engineers from query writers."
    },
    {
      type: "sections-list",
      items: [
        { title: "1. Query Optimization & Execution Plans", desc: "Anyone can write a query. Can you make it run 100x faster? Understanding EXPLAIN ANALYZE, index selection, partition pruning, and when the query planner makes bad decisions — this is senior-level work that AI struggles with because it lacks your production context." },
        { title: "2. Data Modeling & Normalization", desc: "AI writes queries against schemas you design. The ability to model many-to-many relationships, choose between normalization and denormalization, and design for read vs write patterns — this is architecture, not syntax." },
        { title: "3. Debugging Production Queries", desc: "When a query that's been fine for months suddenly times out at 3 AM, AI won't save you. You need to check lock contention, analyze slow query logs, understand vacuum/analyze stats, and reason about concurrent transactions." }
      ]
    },
    {
      type: "h2",
      text: "Query Optimization: The Senior Filter"
    },
    {
      type: "p",
      text: "In 2026, senior backend interviews include a query optimization round. They show you a slow query and ask you to make it fast. Here's the mental model."
    },
    {
      type: "code-block",
      label: "Optimization checklist (memorize this)",
      code: `# Step 1: EXPLAIN ANALYZE — see what the database actually does
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM orders 
WHERE created_at > '2026-01-01' 
  AND status = 'shipped';

# Look for:
# - Seq Scan (bad on large tables) → add index
# - High "actual rows" vs "planned rows" → stale statistics, run ANALYZE
# - High "Buffers: shared read=" → not in memory, consider more RAM or indexing

# Step 2: Index strategy
CREATE INDEX idx_orders_created_status 
ON orders(created_at, status);  -- Composite index for range + equality

# Step 3: Covering index (includes all columns needed)
CREATE INDEX idx_orders_covering 
ON orders(created_at, status) 
INCLUDE (customer_id, total_amount);  -- No table lookup needed

# Step 4: Partition for time-series data
CREATE TABLE orders_2026_q1 PARTITION OF orders
FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

# Step 5: When indexes fail — query rewrite
# Sometimes a LATERAL JOIN beats a correlated subquery
# Sometimes UNION ALL + LIMIT is faster than OR conditions
# The execution plan tells you what to fix` }
    },
    {
      type: "h2",
      text: "The 'SQL Parrot' Test — Are You One?"
    },
    {
      type: "p",
      text: "Interviewers are adapting to AI-generated SQL. Here are the questions that separate memorizers from thinkers. Can you answer these without Stack Overflow?"
    },
    {
      type: "checklist",
      items: [
        "Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() with a real example",
        "Write a query to find the second-highest salary in each department using a window function",
        "Convert a self-JOIN query into a recursive CTE and explain when each is better",
        "Given an EXPLAIN ANALYZE output with a Seq Scan, decide: index, rewrite, or partition?",
        "Explain why SELECT COUNT(*) is sometimes slow and how to make it fast",
        "Write a query that finds consecutive date ranges (gaps and islands problem)",
        "Explain the difference between INNER JOIN and LATERAL JOIN with a practical use case",
        "Given a query with 5 JOINs, explain how you'd debug which JOIN is the bottleneck",
      ]
    },
    {
      type: "h2",
      text: "Modern SQL in 2026: What's New and What Matters"
    },
    {
      type: "p",
      text: "SQL isn't static. PostgreSQL 17, MySQL 9, and modern data warehouses have added features that are now interview-relevant."
    },
    {
      type: "do-dont",
      items: [
        { do: "Use FILTER clause for conditional aggregation (cleaner than CASE WHEN)", dont: "Write CASE WHEN inside every aggregate function" },
        { do: "Use JSONB operators for semi-structured data in PostgreSQL", dont: "Store JSON as text and parse it in application code" },
        { do: "Use LATERAL JOINs when you need correlated subqueries in FROM clause", dont: "Use correlated subqueries in SELECT — they're often slower" },
        { do: "Use GENERATED ALWAYS AS (expression) STORED for computed columns", dont: "Compute derived columns in application code or triggers" },
        { do: "Use MERGE statement (UPSERT) for atomic insert-or-update operations", dont: "Use SELECT + INSERT/UPDATE in separate transactions — race conditions" },
      ]
    },
    {
      type: "h2",
      text: "Building SQL Fluency: The Practice Framework"
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "Master window functions first", text: "Spend one week doing nothing but ROW_NUMBER(), RANK(), LAG()/LEAD(), and running totals. These appear in 80% of SQL interviews. Use LeetCode Database problems #176, #177, #185, and #262." },
        { num: "2", title: "Practice CTEs until they're automatic", text: "Rewrite every subquery you write as a CTE. Then practice recursive CTEs on hierarchical data (org charts, category trees). SQLBolt and Mode Analytics have excellent exercises." },
        { num: "3", title: "Learn to read execution plans", text: "Don't just create indexes — understand why the query planner chooses them (or doesn't). Use EXPLAIN (ANALYZE, BUFFERS) on real queries from your projects." },
        { num: "4", title: "Solve real-world scenarios", text: "Don't just do LeetCode. Build a personal project with complex queries: analytics dashboard, recommendation engine, or time-series data pipeline. Real schemas have edge cases that toy problems don't." },
        { num: "5", title: "Stay skeptical of AI-generated SQL", text: "AI writes syntactically correct but often logically wrong or inefficient queries. Always EXPLAIN ANALYZE AI-generated queries. The best SQL engineers are professionally paranoid about performance." }
      ]
    },
    {
      type: "h2",
      text: "The Bottom Line"
    },
    {
      type: "p",
      text: "SQL is not just a skill — it's a way of thinking about data. In 2026, the developers who get promoted are the ones who can write a complex window function query, optimize a slow production query at 2 AM, and design a schema that won't collapse under load."
    },
    {
      type: "p",
      text: "The framework is simple: master window functions for analytics, CTEs for readability, and execution plans for performance. Use AI to generate boilerplate queries, but never let it architect your data model or optimize your indexes. Verify every AI suggestion with EXPLAIN ANALYZE."
    },
    {
      type: "p",
      text: "The future belongs to engineers who can think in sets, not just write queries. Window functions are your superpower. CTEs are your readability tool. Optimization is your seniority signal. Be the engineer who makes the database sing."
    }
  ]
};

export default post;
