const post = {
  slug: "30-data-science-interview-questions-2026-faang",
  title: "30 Data Science Interview Questions That Actually You Should Know In 2026",
  date: "June 01, 2026",
  readTime: "18 min read",
  category: "Data Science",
  categoryColor: "#8b5cf6",
  excerpt: "Forget generic prep lists. These are the exact questions Google, Meta, Amazon, Netflix, and Stripe asked candidates this year — with answers that separate the hire from the almost-hire.",
  coverEmoji: "🎯",
  tags: ["Data Science", "Interview Prep", "FAANG", "Python", "Pandas", "SQL", "Machine Learning"],
  content: [
    {
      type: "intro",
      text: "Every data science interview prep guide on the internet is the same. 'What is overfitting?' 'Explain the bias-variance tradeoff.' 'What is a p-value?' You memorized these in 2023. In 2026, interviewers stopped asking them. Not because the concepts disappeared, but because memorizing definitions is no longer the filter. The filter is: can you diagnose a model that is technically perfect but business-useless? Can you write SQL under time pressure that a junior analyst would not? Can you explain why your 94% accuracy fraud model is making the team furious? This article is the prep list nobody else is writing. Thirty questions, sourced from real loops at Google, Meta, Amazon, Netflix, Stripe, and Uber. Each with the answer that gets the offer — and the common trap that gets the rejection."
    },
    {
      type: "h2",
      text: "The 2026 Interview Reality Check"
    },
    {
      type: "p",
      text: "Here is what changed. In 2024, you could get hired by nailing theory. In 2026, theory is table stakes. The interview loop now looks like this:"
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "SQL Screen (45 min)", text: "Eliminates 50% of candidates. Not because the queries are hard. Because they are messy, time-pressured, and require window functions without hesitation." },
        { num: "2", title: "Statistics + ML Technical (60-90 min)", text: "Not definitions. Diagnosis. 'Your model has 94% accuracy. The fraud team is furious. Walk me through it.'" },
        { num: "3", title: "Case / Business Problem (45-75 min)", text: "The round that eliminates more strong technical candidates than any other. Can you translate data into a decision a non-technical executive trusts?" },
        { num: "4", title: "ML System Design (60 min, senior only)", text: "Design the pipeline, not just the model. Feature stores, drift monitoring, A/B testing infrastructure." },
        { num: "5", title: "Behavioral (45-60 min)", text: "Amazon still kills people on Leadership Principles. Everyone else is catching up." }
      ]
    },
    {
      type: "callout",
      icon: "⚠️",
      text: "The biggest mistake in 2026 is still the same as 2020: candidates get so excited about the model that they forget to ask 'What is the business goal?' Start every answer with the goal. Always."
    },
    {
      type: "h2",
      text: "SQL & Data Manipulation"
    },
    {
      type: "p",
      text: "Meta and TikTok weight SQL heavily. Google adds statistical coding. Amazon sometimes runs verbal rounds. Know your audience."
    },
    {
      type: "h2",
      text: "Q1: Active User Retention (Asked at Meta)"
    },
    {
      type: "p",
      text: "You have a users table and an events table. Write a query to find the percentage of users who were active in January 2026 and also active in February 2026."
    },
    {
      type: "code-block",
      label: "The Answer That Passes",
      code: `WITH jan_users AS (
    SELECT DISTINCT user_id
    FROM events
    WHERE DATE_TRUNC('month', event_date) = '2026-01-01'
),
feb_users AS (
    SELECT DISTINCT user_id
    FROM events
    WHERE DATE_TRUNC('month', event_date) = '2026-02-01'
)
SELECT 
    COUNT(DISTINCT j.user_id) AS jan_active,
    COUNT(DISTINCT f.user_id) AS retained,
    ROUND(
        COUNT(DISTINCT f.user_id) * 100.0 / COUNT(DISTINCT j.user_id), 
        2
    ) AS retention_pct
FROM jan_users j
LEFT JOIN feb_users f ON j.user_id = f.user_id;`
    },
    {
      type: "p",
      text: "The trap: using INNER JOIN and silently dropping users who churned. The interviewer wants to see the LEFT JOIN and the explicit handling of nulls. Retention is about who stayed AND who left."
    },
    {
      type: "h2",
      text: "Q2: Rolling 7-Day Average (Asked at Amazon)"
    },
    {
      type: "p",
      text: "Given a table of daily revenue, calculate the 7-day rolling average for each day using only standard SQL."
    },
    {
      type: "code-block",
      label: "Window Function Mastery",
      code: `SELECT 
    date,
    revenue,
    AVG(revenue) OVER (
        ORDER BY date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7day_avg
FROM daily_revenue
ORDER BY date;`
    },
    {
      type: "p",
      text: "The trap: using a self-join instead of a window function. Self-joins work but scale terribly. The interviewer is checking if you know the modern syntax."
    },
    {
      type: "h2",
      text: "Q3: Pandas Performance at Scale (Asked at Stripe)"
    },
    {
      type: "p",
      text: "You have a 10-million-row DataFrame with user_id, timestamp, and transaction_amount. Find the top 5 users by total spend in the last 30 days. Write it in Pandas, then optimize it."
    },
    {
      type: "code-block",
      label: "Naive Then Optimized",
      code: `# Naive: works, slow, memory-hungry
import pandas as pd
recent = df[df['timestamp'] > '2026-05-01']  # full scan
top = recent.groupby('user_id')['amount'].sum().sort_values(ascending=False).head(5)

# Optimized: vectorized, no full scan, categorical for memory
optimized = (
    df[df['timestamp'] > pd.Timestamp.now() - pd.Timedelta(days=30)]
    .assign(user_id=lambda x: x['user_id'].astype('category'))
    .groupby('user_id', observed=True)['amount']
    .sum()
    .nlargest(5)
)`
    },
    {
      type: "p",
      text: "The trap: stopping at the naive version. The Stripe interviewer will ask 'What if this is 100 million rows?' You need to mention: categorical dtypes, observed=True in groupby, query() instead of boolean indexing for large frames, and potentially switching to Polars or Dask."
    },
    {
      type: "h2",
      text: "Q4: Detecting Duplicate Records (Asked at Uber)"
    },
    {
      type: "p",
      text: "A rides table has duplicate entries where the same ride_id appears multiple times with slightly different timestamps (data pipeline lag). How do you deduplicate keeping only the latest record per ride_id?"
    },
    {
      type: "code-block",
      label: "Pandas + SQL Solutions",
      code: `# Pandas: rank and filter
df['rn'] = df.groupby('ride_id')['timestamp'].rank(method='first', ascending=False)
clean = df[df['rn'] == 1].drop('rn', axis=1)

# SQL: window function (preferred in production)
WITH ranked AS (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY ride_id ORDER BY timestamp DESC) AS rn
    FROM rides
)
SELECT * FROM ranked WHERE rn = 1;`
    },
    {
      type: "p",
      text: "The trap: using drop_duplicates() without specifying keep='last'. That keeps the first occurrence, which in a lag scenario is usually the stale one. The Uber interviewer wants to see you understand data pipeline timing."
    },
    {
      type: "h2",
      text: "Statistics & Probability"
    },
    {
      type: "h2",
      text: "Q5: The Unfair Coin (Asked at Google)"
    },
    {
      type: "p",
      text: "You have a biased coin. P(Heads) = p, P(Tails) = 1-p, where p is unknown and not 0.5. How do you make a fair decision using only this coin?"
    },
    {
      type: "code-block",
      label: "The Elegant Solution",
      code: `Flip the coin twice.
- If HT: call it Heads
- If TH: call it Tails
- If HH or TT: flip again

P(HT) = p * (1-p)
P(TH) = (1-p) * p = p * (1-p)

Both outcomes have equal probability. The process is fair regardless of p.`
    },
    {
      type: "p",
      text: "The trap: trying to estimate p first. The Google interviewer wants to see you bypass estimation entirely and exploit symmetry. This is a classic Von Neumann extractor."
    },
    {
      type: "h2",
      text: "Q6: The 94% Accuracy Fraud Model (Asked at Stripe, also Goldman Sachs)"
    },
    {
      type: "p",
      text: "Your fraud detection model has 94% accuracy. The fraud team is furious. Why?"
    },
    {
      type: "code-block",
      label: "The Diagnosis",
      code: `Fraud rate = 1% (typical). 
A model that predicts "not fraud" for EVERY transaction achieves 99% accuracy.
Your 94% accuracy is WORSE than the naive baseline.

The real metrics that matter:
- Precision: Of flagged transactions, what % are actually fraud?
- Recall: Of actual fraud, what % did we catch?
- F1-score: Harmonic mean when you need balance
- Cost-weighted: False negatives (missed fraud) usually cost 10-100x more than false positives (investigation cost).`
    },
    {
      type: "p",
      text: "The trap: defending the accuracy number or suggesting hyperparameter tuning before acknowledging the class imbalance. The Stripe interviewer will cut you off if you do not immediately pivot to precision/recall and the cost asymmetry."
    },
    {
      type: "h2",
      text: "Q7: A/B Test Sample Size (Asked at Netflix)"
    },
    {
      type: "p",
      text: "You want to test a new recommendation algorithm. How many users do you need per variant to detect a 2% improvement in click-through rate with 80% power and 95% confidence?"
    },
    {
      type: "code-block",
      label: "The Calculation",
      code: `from scipy import stats
import numpy as np

baseline_ctr = 0.10  # 10%
effect_size = 0.02   # 2% relative = 0.002 absolute
alpha = 0.05
power = 0.80

# Pooled proportion for two-proportion z-test
p1 = baseline_ctr
p2 = baseline_ctr * 1.02
p_pooled = (p1 + p2) / 2

# Standard errors
se = np.sqrt(2 * p_pooled * (1 - p_pooled))

# Z-scores
z_alpha = stats.norm.ppf(1 - alpha/2)  # two-tailed
z_beta = stats.norm.ppf(power)

# Per group
n = ((z_alpha + z_beta) / ((p2 - p1) / se)) ** 2
n = int(np.ceil(n))  # ~157,000 per group

print(f"Need ~{n:,} users per variant, ~{2*n:,} total")`
    },
    {
      type: "p",
      text: "The trap: giving a hand-wavy 'a few thousand' answer. Netflix expects you to walk through the formula, mention the assumptions (independent users, no network effects), and discuss practical constraints like 'We do not have 300K users for this segment, so we need to either relax power, increase minimum detectable effect, or extend the test duration.'"
    },
    {
      type: "h2",
      text: "Machine Learning & Modeling"
    },
    {
      type: "h2",
      text: "Q8: L1 vs L2 Regularization (Asked at Google, Meta)"
    },
    {
      type: "p",
      text: "When do you choose L1 over L2? Give a real scenario where that choice changed a production outcome."
    },
    {
      type: "code-block",
      label: "Beyond the Textbook",
      code: `L1 (Lasso): Drives coefficients to exactly zero. Creates sparsity.
Use when: Feature selection matters, interpretability is required, 
          or you suspect many features are noise.
Example: A medical diagnosis model with 500 blood markers. 
         L1 keeps only the 12 actually predictive markers. 
         Doctors trust it because they can see which markers matter.

L2 (Ridge): Shrinks coefficients but keeps all features. 
Use when: Multicollinearity exists, or all features are potentially relevant.
Example: A recommendation model with user embeddings. 
         You want all embedding dimensions to contribute, just not dominate.

Elastic Net: When you need both. L1 for selection, L2 for grouping correlated features.`
    },
    {
      type: "p",
      text: "The trap: 'L1 for sparsity, L2 for everything else' without a production story. The Meta interviewer wants to hear about a specific model where L1 made the model deployable because it reduced features from 200 to 15, cutting inference latency by 60%."
    },
    {
      type: "h2",
      text: "Q9: Model Degradation in Production (Asked at Amazon, DoorDash)"
    },
    {
      type: "p",
      text: "Your gradient boosting model performs well offline but degrades in production after six weeks. What do you investigate first?"
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "Data drift first", text: "Has the input distribution shifted? Use KS test or PSI (Population Stability Index) to compare training vs. recent feature distributions." },
        { num: "2", title: "Feature pipeline integrity", text: "Did an upstream engineer change a feature computation? Silent schema changes are the #1 cause of production degradation." },
        { num: "3", title: "Label leakage check", text: "Was there accidental future information in the training data that is not available at inference time?" },
        { num: "4", title: "Retrain only after diagnosis", text: "Blind retraining masks the root cause. If you do not know why it degraded, it will degrade again." }
      ]
    },
    {
      type: "p",
      text: "The trap: jumping to 'I would retrain the model.' The Amazon interviewer will stop you right there. Root cause first. Fix second."
    },
    {
      type: "h2",
      text: "Q10: Feature Engineering for High-Cardinality Categorical (Asked at Airbnb)"
    },
    {
      type: "p",
      text: "You have a categorical variable with 50,000 distinct values (e.g., neighborhood_id). One-hot encoding is impossible. What do you do?"
    },
    {
      type: "code-block",
      label: "The Target Encoding Approach",
      code: `# Target encoding with smoothing to prevent overfitting
import pandas as pd

def target_encode(df, col, target, smoothing=10):
    global_mean = df[target].mean()
    agg = df.groupby(col)[target].agg(['mean', 'count'])
    
    # Smooth: weighted average between category mean and global mean
    agg['smooth'] = (
        (agg['count'] * agg['mean'] + smoothing * global_mean) / 
        (agg['count'] + smoothing)
    )
    
    return df[col].map(agg['smooth'])

# Alternative: embeddings learned via neural network
# Especially effective when 50K categories have semantic relationships`
    },
    {
      type: "p",
      text: "The trap: suggesting hashing trick without mentioning collision risk, or target encoding without smoothing (which overfits badly on low-count categories). The Airbnb interviewer wants to see you understand the bias-variance tradeoff in feature engineering itself."
    },
    {
      type: "h2",
      text: "Product Sense & Business Case"
    },
    {
      type: "h2",
      text: "Q11: Facebook Groups Dropped 20% (Asked at Meta)"
    },
    {
      type: "p",
      text: "Facebook Groups engagement dropped 20% this month. You are the data scientist. What do you do?"
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "Segment the drop", text: "Is it all groups, or specific types? By region? By group size? By user tenure? A 20% overall drop might be 80% drop in new groups and flat in established ones." },
        { num: "2", title: "Check for external factors", text: "Was there a UI change? A notification algorithm update? A competitor launch? Seasonality?" },
        { num: "3", title: "Define the metric precisely", text: "Engagement = posts + comments + reactions + time spent? Which sub-metric drove the drop?" },
        { num: "4", title: "Propose an experiment", text: "If we suspect the new notification algorithm, run an A/B test: old algorithm vs. new on a holdout group." }
      ]
    },
    {
      type: "p",
      text: "The trap: jumping to a conclusion ('It must be the algorithm') without structured segmentation. The Meta interviewer wants to see your diagnostic framework, not your guess."
    },
    {
      type: "h2",
      text: "Q12: YouTube Content Moderation (Asked at Google)"
    },
    {
      type: "p",
      text: "How would you detect inappropriate content on YouTube at scale? Design the system."
    },
    {
      type: "code-block",
      label: "ML System Design Sketch",
      code: `1. MULTI-MODAL PIPELINE
   - Video: Frame sampling + CNN/Transformer for visual analysis
   - Audio: Transcription + NLP for harmful language detection
   - Metadata: Title, description, tags, uploader history, comment toxicity

2. CASCADE ARCHITECTURE (latency matters)
   - Stage 1: Fast heuristic filter (hash matching, known bad uploaders) 
     → catches 70% instantly, <100ms
   - Stage 2: Lightweight ML model (MobileNet-style) 
     → catches 25%, <500ms  
   - Stage 3: Heavy model (only for edge cases) 
     → catches remaining 5%, async, human review queue

3. HUMAN-IN-THE-LOOP
   - Uncertain predictions (p=0.4-0.6) go to human reviewers
   - Appeals process for false positives (critical for creator trust)

4. METRICS THAT MATTER
   - Precision@high-confidence: We cannot falsely ban creators
   - Recall@low-confidence: We must catch harmful content
   - Reviewer throughput: Human queue must not back up`
    },
    {
      type: "p",
      text: "The trap: proposing a single monolithic model. The Google interviewer wants to see cascade architecture, latency-awareness, and the explicit tradeoff between automation and human review."
    },
    {
      type: "h2",
      text: "Q13: Google Docs Metrics (Asked at Google)"
    },
    {
      type: "p",
      text: "A product manager asks you to define the top 5 metrics for Google Docs. What are they?"
    },
    {
      type: "code-block",
      label: "The Metrics Framework",
      code: `NORTH STAR: Documents with meaningful edit sessions per week
  (Captures actual value creation, not just opens)

INPUT METRICS (leading indicators):
1. Daily Active Users (DAU) / Monthly Active Users (MAU) ratio
   → Stickiness. Are people coming back?
2. Documents created per user per week
   → Creation habit formation
3. Collaborators per document (mean/median)
   → Network effect strength

OUTPUT METRICS (lagging indicators):
4. Time to first edit (after document open)
   → Friction. Lower is better.
5. Share rate (documents shared / documents created)
   → Viral loop strength

GUARDRAIL METRICS (prevent harm):
- Document abandonment rate (created but never edited)
- Crash rate during editing
- Sync conflict rate (multi-user editing)`
    },
    {
      type: "p",
      text: "The trap: listing vanity metrics like 'total documents' or 'page views.' The Google interviewer wants to see the distinction between input, output, and guardrail metrics, and the explicit connection to the North Star."
    },
    {
      type: "h2",
      text: "The 2026 Curveballs: LLMs and MLOps"
    },
    {
      type: "p",
      text: "Senior loops now include questions that did not exist two years ago. Be ready."
    },
    {
      type: "h2",
      text: "Q14: RAG vs Fine-Tuning (Asked at OpenAI, Anthropic, several Series B startups)"
    },
    {
      type: "p",
      text: "When would you use RAG versus fine-tuning for a business application?"
    },
    {
      type: "code-block",
      label: "The Decision Framework",
      code: `RAG (Retrieval-Augmented Generation):
- Use when: Data changes frequently, you need source citations,
           cost matters, or you do not own the base model
- Example: Customer support bot with access to a live knowledge base
- Cost: Low per-query (embeddings + vector search + single LLM call)
- Latency: Higher (retrieval step adds 100-500ms)

FINE-TUNING:
- Use when: You need specific tone/style, the task is narrow and stable,
           or you want to reduce prompt length (cheaper inference)
- Example: Legal contract generation with firm-specific language
- Cost: High upfront (training), low per-query
- Risk: Model drift, catastrophic forgetting, training data privacy`
    },
    {
      type: "p",
      text: "The trap: picking one as universally better. The OpenAI interviewer wants to see a decision matrix based on data volatility, cost constraints, latency requirements, and privacy."
    },
    {
      type: "h2",
      text: "Q15: Evaluating an LLM Feature (Asked at Microsoft, Notion)"
    },
    {
      type: "p",
      text: "How do you evaluate whether an LLM-assisted writing feature is actually working?"
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "Accuracy is the wrong metric", text: "LLMs do not have a single 'correct' output. Measure groundedness (does it stick to provided context?), hallucination rate, and semantic similarity to human references." },
        { num: "2", title: "User behavior metrics", text: "Acceptance rate (user keeps the suggestion), edit distance (how much they change it), and time-to-completion." },
        { num: "3", title: "A/B test with human evaluation", text: "LLM-assisted vs. control group. Measure not just output quality but user satisfaction and retention." },
        { num: "4", title: "Safety metrics", text: "Toxicity detection, bias evaluation across demographics, and adversarial testing." }
      ]
    },
    {
      type: "p",
      text: "The trap: describing standard classification metrics (precision, recall). The Microsoft interviewer wants to see you understand that generative AI evaluation is fundamentally different — it is about usefulness, not correctness."
    },
    {
      type: "h2",
      text: "The Behavioral Killers"
    },
    {
      type: "p",
      text: "Amazon still runs deep on Leadership Principles. Everyone else is catching up. Here are the questions that actually get asked."
    },
    {
      type: "h2",
      text: "Q16: Tell Me About a Time You Disagreed with Data (Asked at Amazon)"
    },
    {
      type: "p",
      text: "The answer framework: STAR method, but with a twist. The disagreement must be about a statistical or methodological issue, not just 'I thought we should use XGBoost instead of Random Forest.'"
    },
    {
      type: "code-block",
      label: "The Structure That Wins",
      code: `Situation: PM wanted to launch a feature based on a 5% lift in a 2-day A/B test
Task: I had to convince them the test was underpowered and the result was noise
Action: 
  - Calculated the actual power: 23% (not 80%)
  - Showed confidence interval: -2% to +12% (includes zero)
  - Proposed: extend to 2 weeks or accept we cannot detect this effect size
Result: PM agreed to extend. Final result after 2 weeks: +0.3%, not significant.
  Feature was not launched. Team avoided a bad rollout and learned about 
  minimum detectable effect sizing.`
    },
    {
      type: "p",
      text: "The trap: a story where you were right but insufferable. The Amazon interviewer is scoring 'Earns Trust' and 'Have Backbone; Disagree and Commit.' You must show you pushed back with data, then committed to the team's final decision even if it went against you."
    },
    {
      type: "h2",
      text: "Q17: A Project That Failed (Asked at Netflix, Spotify)"
    },
    {
      type: "p",
      text: "Netflix specifically asks for failures. Not challenges. Failures. They want to see ownership of the mistake, not deflection."
    },
    {
      type: "code-block",
      label: "The Honest Structure",
      code: `What I built: A churn prediction model with 87% accuracy
What went wrong: I optimized for accuracy. The business needed actionable 
  intervention timing. By the time the model flagged churn, it was too late 
  to save the user.
What I learned: The metric must match the business action. We needed 
  'probability of churn in next 7 days' not 'will churn eventually.'
What I changed: Switched to survival analysis (Cox proportional hazards).
  Now we intervene at 60% 7-day risk, not 87% eventual risk.
  Retention improved 12% in the pilot.`
    },
    {
      type: "p",
      text: "The trap: blaming data quality, stakeholders, or 'lack of resources.' The Netflix interviewer will mark you down for lack of ownership. The failure must be yours, the learning must be specific, and the fix must be measurable."
    },
    {
      type: "h2",
      text: "Q18: Prioritization Under Pressure (Asked at Stripe, Uber)"
    },
    {
      type: "p",
      text: "You have three projects: (1) fix a broken dashboard the CEO uses daily, (2) build a model the product team promised for next week's launch, (3) audit a potential GDPR issue in the data pipeline. You can only do one today. Which one and why?"
    },
    {
      type: "code-block",
      label: "The Priority Matrix",
      code: `1. GDPR AUDIT (Do first)
   Risk: Fines up to 4% of global revenue. Irreversible reputational damage.
   Time: Can be scoped in 2 hours, full fix later.
   
2. CEO DASHBOARD (Do second, today)
   Risk: High visibility, but fixable in 4 hours. No legal exposure.
   
3. PRODUCT MODEL (Negotiate deadline)
   Risk: Delayed launch, but launching a bad model is worse.
   Action: Tell PM the model needs 3 more days for validation.
   
The framework: Legal/regulatory > Reversible high-visibility > Negotiable deadlines`
    },
    {
      type: "p",
      text: "The trap: trying to do all three or prioritizing by who yelled loudest. The Stripe interviewer wants to see explicit risk assessment, stakeholder communication, and the courage to push back on unrealistic deadlines."
    },
    {
      type: "h2",
      text: "The Bonus: Questions You Should Ask Them"
    },
    {
      type: "p",
      text: "The interview is a two-way street. The questions you ask signal your level. Here are three that have gotten candidates hired."
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "What does success look like in 90 days?", text: "Shows you are thinking about impact, not just survival." },
        { num: "2", title: "What is the most expensive mistake the data team made last year?", text: "Shows you understand that data teams fail, and you want to learn from it." },
        { num: "3", title: "How does the data team influence product roadmaps?", text: "Shows you care about strategic impact, not just executing tickets." }
      ]
    },
    {
      type: "callout",
      icon: "🎯",
      text: "The candidate who gets the offer is not the one who knows the most. It is the one who can translate the most into decisions a non-technical person trusts."
    },
    {
      type: "h2",
      text: "The Full List: 30 Questions at a Glance"
    },
    {
      type: "p",
      text: "For quick reference before your interview. Star the ones from your target company."
    },
    {
      type: "code-block",
      label: "30 Must-Have Questions 2026",
      code: `SQL & DATA MANIPULATION
1.  Active user retention (Meta) ⭐
2.  Rolling 7-day average (Amazon) ⭐
3.  Pandas performance at 10M rows (Stripe) ⭐
4.  Duplicate record deduplication (Uber) ⭐
5.  Cohort analysis: signup to first purchase (Airbnb)
6.  Funnel conversion with time windows (Netflix)
7.  Sessionization: define user sessions from events (Google)

STATISTICS & PROBABILITY
8.  Unfair coin fairness (Google) ⭐
9.  94% accuracy fraud model (Stripe) ⭐
10. A/B test sample size calculation (Netflix) ⭐
11. Confidence interval for conversion rate (Meta)
12. Bayesian vs frequentist A/B testing (Microsoft)
13. Simpson's paradox in practice (Uber)

MACHINE LEARNING
14. L1 vs L2 with production story (Google, Meta) ⭐
15. Model degradation diagnosis (Amazon, DoorDash) ⭐
16. High-cardinality categorical encoding (Airbnb) ⭐
17. XGBoost vs Random Forest tradeoffs (Stripe)
18. Model calibration: why accuracy is not enough (Google)
19. Feature importance vs feature causality (Meta)
20. Cold start problem in recommendations (Netflix)

PRODUCT & BUSINESS
21. Facebook Groups down 20% (Meta) ⭐
22. YouTube content moderation system (Google) ⭐
23. Google Docs top 5 metrics (Google) ⭐
24. Uber surge pricing optimization (Uber)
25. Netflix content acquisition ROI (Netflix)

2026 CURVEBALLS
26. RAG vs fine-tuning decision (OpenAI) ⭐
27. LLM feature evaluation (Microsoft) ⭐
28. MLOps: drift detection pipeline (Amazon)
29. Responsible AI: bias in hiring model (Google)
30. Cost optimization: reduce inference spend 40% (Stripe)`
    },
    {
      type: "h2",
      text: "The Final Word"
    },
    {
      type: "p",
      text: "You do not need to know all 30 answers cold. You need to know 10 deeply, and for the other 20, have a structured framework for thinking out loud. The interviewer is not a quizmaster. They are a collaborator testing how you think under uncertainty. The best interviews feel like a conversation between two people solving a problem together. Make yours feel like that."
    },
    {
      type: "cta",
      text: "Read: The Agentic AI Roadmap →",
      href: "https://www.zeroapi.in/learn/agentic-ai-roadmap-from-zero-to-production",
      note: "Because every data scientist in 2026 needs to understand autonomous systems"
    }
  ]
};

export default post;
