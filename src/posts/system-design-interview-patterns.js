const post = {
  slug: "system-design-interview-patterns",
  title: "System Design for Interviews: The 5 Patterns You Actually Need",
  date: "May 19, 2026",
  readTime: "11 min read",
  category: "Interview Prep",
  categoryColor: "#ea580c",
  excerpt: "Every MAANG interview now includes system design — even for 2 YOE candidates. Skip the 500-page books. These 5 patterns cover 80% of interview questions.",
  coverEmoji: "🏗️",
  tags: ["System Design", "Interview", "MAANG", "Career"],
  content: [
    {
      type: "intro",
      text: "Two years ago, system design was reserved for senior engineers with 5+ years of experience. Today, Flipkart, Razorpay, and even Series-A startups ask system design questions to candidates with 2 years of experience. The good news: you don't need to read Designing Data-Intensive Applications cover-to-cover. You need to recognize patterns. Here are the 5 patterns that appear in 80% of interviews."
    },
    {
      type: "h2",
      text: "The 45-Minute Interview Structure"
    },
    {
      type: "p",
      text: "Before diving into patterns, understand the clock. A typical system design round is 45 minutes. Senior engineers spend the first 5 minutes clarifying requirements. Juniors jump straight into drawing boxes. Don't be a junior."
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "Clarify (4-5 minutes)", text: "Ask: functional requirements (what does it do?), non-functional (scale? latency? consistency?), and constraints (budget? team size?)." },
        { num: "2", title: "High-Level Design (10 minutes)", text: "Draw the main components: client, load balancer, application servers, database, cache. Explain data flow. Don't over-engineer." },
        { num: "3", title: "Deep Dive (20 minutes)", text: "The interviewer picks one area: database schema, scaling strategy, consistency model, or failure handling. This is where you prove your depth." },
        { num: "4", title: "Trade-offs & Bottlenecks (10 minutes)", text: "Discuss what breaks first as scale increases. Show you understand there are no perfect solutions, only optimized compromises." }
      ]
    },
    {
      type: "h2",
      text: "Pattern 1: Load Balancing + Caching"
    },
    {
      type: "p",
      text: "This is the bread and butter. Every system design question starts here: 'Design a URL shortener', 'Design a rate limiter', 'Design a caching layer'. The answer always involves distributing traffic and caching hot data."
    },
    {
      type: "code-block",
      label: "Load balancer + cache architecture",
      code: `# High-Level Design: URL Shortener

# Components:
# 1. Client → sends POST /shorten with long URL
# 2. Load Balancer (Nginx/HAProxy) → distributes to app servers
# 3. App Servers (Node.js/Python) → business logic
# 4. Cache (Redis) → stores hot mappings (1M+ QPS possible)
# 5. Database (PostgreSQL) → persistent storage, sharded by hash

# Why this works:
# - 95% of traffic hits top 1% of URLs (Pareto principle)
# - Redis handles 100k+ QPS per node → cache eliminates DB load
# - Load balancer uses consistent hashing → same URL → same server

# Scaling numbers:
# - 1 Redis node: ~100k QPS
# - 1 PostgreSQL node: ~5k QPS
# - With cache: handle 1M QPS with 10 Redis + 2 DB nodes

# Interview tip: Always mention cache invalidation strategy
# - TTL (Time To Live): auto-expire after 1 hour
# - Write-through: update DB + cache simultaneously
# - Cache-aside: check cache first, fall back to DB`
    },
    {
      type: "callout",
      icon: "💡",
      text: "The magic phrase in interviews: 'I'll use a cache because this workload follows the Pareto principle — 95% of requests hit 5% of data.' This shows you think about data access patterns, not just technologies."
    },
    {
      type: "h2",
      text: "Pattern 2: Database Sharding"
    },
    {
      type: "p",
      text: "When your data doesn't fit on one machine, you shard. The interviewer wants to hear your sharding strategy, not just 'use a bigger database'."
    },
    {
      type: "code-block",
      label: "Sharding strategies with examples",
      code: `# Problem: 1 billion users, 1TB of data. Single DB can't handle it.

# Strategy 1: Hash-based Sharding
# shard = hash(user_id) % num_shards
# Pros: Even distribution, simple
# Cons: Re-sharding is painful (change num_shards = move all data)

# Strategy 2: Range-based Sharding
# Shard 1: user_id 1-1,000,000
# Shard 2: user_id 1,000,001-2,000,000
# Pros: Easy range queries, simple re-sharding
# Cons: Hot shards (new users all hit Shard N)

# Strategy 3: Directory-based Sharding (most flexible)
# Lookup table: user_id → shard_id
# Pros: Move users between shards without hash changes
# Cons: Single point of failure (the lookup table)

# Interview answer for 'Design Twitter':
# - Tweets table: shard by user_id (user's tweets together)
# - Timeline table: shard by tweet_id (even distribution)
# - Use directory sharding for flexibility, cache the lookup table`
    },
    {
      type: "h2",
      text: "Pattern 3: Message Queues for Async Processing"
    },
    {
      type: "p",
      text: "Not everything needs to happen immediately. When a user uploads a video, you don't transcode it synchronously. You queue it. This pattern appears in 'Design YouTube', 'Design WhatsApp', and 'Design an Email Service'."
    },
    {
      type: "code-block",
      label: "Queue-based async architecture",
      code: `# Design: Video Upload + Processing Pipeline

# Synchronous (BAD):
# User uploads 4K video → server transcodes → waits 5 minutes → responds
# Problem: HTTP timeout, server blocked, terrible UX

# Asynchronous (GOOD):
# 1. User uploads video → API returns immediately: "Processing"
# 2. API writes job to message queue (RabbitMQ, SQS, Kafka)
# 3. Worker nodes pick up jobs, transcode in background
# 4. WebSocket/SSE notifies user when done

# Queue choice interview guide:
# - RabbitMQ: Complex routing, guaranteed delivery
# - Kafka: High throughput, event sourcing, replay capability
# - SQS: Managed, simple, AWS ecosystem
# - Redis Streams: Simple, already have Redis for cache

# Key concepts to mention:
# - Idempotency: same job twice = same result (prevent double-charge)
# - Dead Letter Queue: failed jobs go here for inspection
# - Back-pressure: queue full → slow down producers, not crash
# - At-least-once vs exactly-once delivery semantics`
    },
    {
      type: "h2",
      text: "Pattern 4: Rate Limiting"
    },
    {
      type: "p",
      text: "'Design a rate limiter' is a classic interview question. It tests your understanding of distributed systems, consistency, and trade-offs."
    },
    {
      type: "code-block",
      label: "Rate limiting algorithms",
      code: `# Algorithm 1: Token Bucket (most common)
# - Bucket holds N tokens, refills at rate R per second
# - Request consumes 1 token; if empty, reject
# - Pros: Allows bursts, smooth average rate
# - Cons: Needs memory per user (Redis)

# Algorithm 2: Sliding Window Log
# - Store timestamps of each request in sorted set
# - Count requests in last window (e.g., last 60 seconds)
# - Pros: Precise, no burst allowance
# - Cons: More memory (store every timestamp)

# Algorithm 3: Fixed Window (simplest, less accurate)
# - Count requests in current minute/hour
# - Reset counter at window boundary
# - Pros: Simple, low memory
# - Cons: Burst at window boundary (2x limit in 1 second)

# Distributed rate limiting:
# - Single Redis node: single point of failure
# - Redis Cluster: consistency issues between shards
# - Solution: Sticky sessions (same user → same rate limiter)
#   or eventual consistency with small over-limit tolerance`
    },
    {
      type: "h2",
      text: "Pattern 5: CDN + Edge Caching"
    },
    {
      type: "p",
      text: "When the interviewer says 'global scale' or 'users in India, US, and Europe', you need a CDN. This pattern appears in 'Design Netflix', 'Design a News Feed', and 'Design an E-commerce Site'."
    },
    {
      type: "code-block",
      label: "Multi-region architecture with CDN",
      code: `# Design: Global Video Streaming (Netflix-like)

# Without CDN (terrible):
# User in Mumbai → requests video → server in Virginia → 250ms latency
# Video stutters, user rage-quits

# With CDN (smooth):
# 1. Static assets (images, CSS, JS) → CloudFront/Cloudflare CDN
#    - Cached at edge locations: Mumbai, Singapore, London
#    - 95% reduction in origin server load
#
# 2. Video content → Dedicated CDN (Akamai, Fastly, AWS CloudFront)
#    - Adaptive bitrate: 240p on slow connection, 4K on fast
#    - Pre-position popular content at edge during off-peak
#
# 3. Dynamic API (recommendations, user data) → Origin servers
#    - Can't cache (personalized), but keep API lightweight
#    - GraphQL to fetch exactly what's needed
#
# Interview talking points:
# - Cache invalidation: TTL vs active purge
# - Stale-while-revalidate: serve old version, fetch new in background
# - Geo-routing: DNS routes to nearest healthy region
# - Failover: if Mumbai edge fails, route to Singapore`
    },
    {
      type: "h2",
      text: "The 'Design Twitter' Walkthrough"
    },
    {
      type: "p",
      text: "Let's apply all 5 patterns to the most common interview question. This is your template for any social media / feed-based system."
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "Requirements", text: "Functional: post tweet, follow user, view timeline. Non-functional: 100M DAU, 500M tweets/day, <200ms timeline load." },
        { num: "2", title: "High-Level Design", text: "Load balancer → API Gateway → Tweet Service / Timeline Service / User Service → Cache layer → Sharded DB." },
        { num: "3", title: "Pattern 1: Load Balancer + Cache", text: "Redis caches user profiles and hot tweets. Timeline Service checks cache first. 95% hit rate expected." },
        { num: "4", title: "Pattern 2: Database Sharding", text: "Tweets table: shard by tweet_id (even distribution). User table: shard by user_id. Directory-based for flexibility." },
        { num: "5", title: "Pattern 3: Message Queue", text: "When user posts tweet, push to Kafka. Timeline workers fan out to followers' timelines asynchronously." },
        { num: "6", title: "Pattern 4: Rate Limiting", text: "Token bucket per user: 100 tweets/hour, 1000 follows/day. Prevents spam and abuse." },
        { num: "7", title: "Pattern 5: CDN + Edge", text: "Images and videos to CloudFront. Static assets cached globally. API responses use stale-while-revalidate." }
      ]
    },
    {
      type: "h2",
      text: "Common Pitfalls That Fail Interviews"
    },
    {
      type: "mistakes",
      items: [
        { title: "Starting with microservices", text: "'I'll use Kubernetes with 50 microservices' for a system that needs 2 servers. Start monolith, split when you have a reason." },
        { title: "Ignoring the read/write ratio", text: "Twitter is 1000:1 read:write. Optimize for reads (cache, CDN). Don't design a write-optimized system for a read-heavy workload." },
        { title: "No failure handling", text: "What happens when Redis dies? When a shard is full? When the queue backs up? Always discuss failure modes." },
        { title: "Over-engineering early", text: "Don't mention Cassandra, Kubernetes, and Kafka for a system with 1000 users. Show you can start simple and evolve." },
        { title: "Forgetting consistency", text: "If a user deletes a tweet, when does it disappear from followers' timelines? Eventual consistency vs strong consistency matters." },
      ]
    },
    {
      type: "h2",
      text: "Quick Reference — Which Pattern for Which Question"
    },
    {
      type: "version-guide",
      items: [
        { version: "URL Shortener", points: ["Pattern 1 (Cache hot URLs)", "Pattern 2 (Shard by hash)", "Pattern 4 (Rate limit creation)"] },
        { version: "Twitter / Feed", points: ["All 5 patterns", "Fan-out via message queue", "CDN for media", "Sharding for scale"] },
        { version: "Chat / WhatsApp", points: ["Pattern 3 (Queue messages)", "Pattern 1 (Cache recent chats)", "WebSocket for real-time delivery"] },
        { version: "E-commerce", points: ["Pattern 5 (CDN for product images)", "Pattern 4 (Rate limit checkout)", "Pattern 2 (Shard orders by region)"] },
        { version: "Video Streaming", points: ["Pattern 5 (CDN is everything)", "Pattern 3 (Queue transcoding)", "Adaptive bitrate encoding"] },
      ]
    },
    {
      type: "h2",
      text: "The Bottom Line"
    },
    {
      type: "p",
      text: "System design interviews aren't about knowing every technology. They're about recognizing patterns, understanding trade-offs, and communicating clearly under pressure. Master these 5 patterns, practice the 45-minute structure, and you'll outperform candidates who memorized entire books but can't think on their feet."
    },
    {
      type: "p",
      text: "Start with 'Design Twitter' — draw it on paper, time yourself, record yourself explaining it. Then move to URL shortener, chat app, and e-commerce. By your fifth practice round, you'll sound like someone who's built these systems before."
    }
  ]
};

export default post;
