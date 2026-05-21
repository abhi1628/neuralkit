const post = {
  slug: "git-github-first-job",
  title: "Git & GitHub for Your First Job: Beyond git push",
  date: "May 18, 2026",
  readTime: "9 min read",
  category: "Developer Tools",
  categoryColor: "#db2777",
  excerpt: "You know git add, commit, and push. But your first week at work will hit you with rebase, merge conflicts, squash commits, and PR reviews. Here's the survival guide no one gave you.",
  coverEmoji: "🔀",
  tags: ["Git", "GitHub", "Developer", "Career"],
  content: [
    {
      type: "intro",
      text: "Every computer science student learns git init, git add, git commit, and git push. That's enough for college projects. It's not enough for your first job. Within your first week, you'll face merge conflicts, rebasing, squashing commits, and writing PR descriptions that determine whether your code gets approved or rejected. This guide fills the gap."
    },
    {
      type: "h2",
      text: "The Git Commands You Actually Need Day 1"
    },
    {
      type: "p",
      text: "Before we dive into scenarios, here are the commands that appear in 90% of real workflows — and what they actually do beyond the surface level."
    },
    {
      type: "code-block",
      label: "The real day-1 git workflow",
      code: `# 1. Start fresh from main
git checkout main
git pull origin main  # Always pull before branching

# 2. Create a feature branch with a clear name
git checkout -b feat/user-authentication
# Naming conventions: feat/, fix/, docs/, refactor/ + descriptive name

# 3. Make atomic commits (one logical change per commit)
git add src/auth/login.js
git commit -m "feat: add JWT-based login endpoint"

# 4. Keep your branch updated with main
git fetch origin
git rebase origin/main  # Prefer rebase over merge for clean history

# 5. Push and create PR
git push -u origin feat/user-authentication
# Then open PR on GitHub with a proper description`
    },
    {
      type: "h2",
      text: "Scenario 1: Your Senior Asked You to Rebase Instead of Merge"
    },
    {
      type: "p",
      text: "You branched off main three days ago. Since then, three teammates merged their PRs. Your branch is now 'behind' main. You have two options: merge main into your branch (creates a merge commit, messy history) or rebase your commits on top of the latest main (clean linear history). Most teams prefer rebase."
    },
    {
      type: "code-block",
      label: "Rebasing correctly — step by step",
      code: `# Step 1: Save your current state (just in case)
git stash

# Step 2: Fetch latest changes without switching branches
git fetch origin

# Step 3: Rebase your branch onto latest main
git rebase origin/main

# If you get conflicts, Git pauses and shows you which files:
# <<<<<<< HEAD
# code from main
# =======
# your code
# >>>>>>> your-branch

# Edit the file, keep the correct code, remove conflict markers
git add <resolved-file>
git rebase --continue

# If you mess up badly, abort and start over:
# git rebase --abort

# Step 4: Force push (safe on feature branches, NEVER on main)
git push --force-with-lease  # Safer than --force`
    },
    {
      type: "callout",
      icon: "⚠️",
      text: "Never use git push --force on shared branches like main, develop, or staging. --force-with-lease checks that no one else pushed since you last fetched — it's a safety net."
    },
    {
      type: "h2",
      text: "Scenario 2: You Committed a 500MB Dataset by Accident"
    },
    {
      type: "p",
      text: "It happens. You added a CSV file, committed it, pushed it, and now the repo is bloated. Deleting it in a new commit doesn't remove it from Git history — it's still in the repository, making clones slow."
    },
    {
      type: "code-block",
      label: "Removing large files from Git history",
      code: `# Step 1: Find the large files in history
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(restpath)' | awk '$1 == "blob" && $3 > 1000000 {print $3, $4}' | sort -rn

# Step 2: Use git filter-repo (modern replacement for filter-branch)
# Install first: pip install git-filter-repo
git filter-repo --strip-blobs-bigger-than 50M

# Alternative: remove specific file from all history
git filter-repo --path data/large-dataset.csv --invert-paths

# Step 3: Force push the cleaned history
git push origin --force --all

# Step 4: Add the file to .gitignore so it never happens again
echo "data/*.csv" >> .gitignore
git add .gitignore
git commit -m "chore: ignore large data files"`
    },
    {
      type: "h2",
      text: "Scenario 3: Writing a PR Description That Gets Approved in One Review"
    },
    {
      type: "p",
      text: "Your PR description is your pitch. A good description saves your reviewer 10 minutes of guessing. A bad description guarantees follow-up questions and delays."
    },
    {
      type: "do-dont",
      items: [
        { do: "What changed and why (1-2 sentences)", dont: "'Fixed bug' or 'Updated code'" },
        { do: "Link to the ticket/issue: Closes #123", dont: "No context on what problem this solves" },
        { do: "Screenshots for UI changes", dont: "Making reviewers check out your branch to see visual changes" },
        { do: "Testing steps: 'Run npm test, check /auth/login'", dont: "'It works on my machine'" },
        { do: "Breaking changes listed upfront", dont: "Hiding API changes that break other services" },
      ]
    },
    {
      type: "code-block",
      label: "PR template that works",
      code: `## What
Added JWT-based authentication to the login endpoint.

## Why
Current session-based auth doesn't scale to mobile apps.
Closes #142

## How to test
1. Run npm run dev
2. POST /api/auth/login with {email, password}
3. Check response contains accessToken and refreshToken
4. Verify token expires in 15 minutes

## Screenshots
[Postman screenshot showing successful login]

## Breaking changes
- Old session cookies are no longer issued
- Frontend must send Authorization: Bearer <token> header

## Checklist
- [x] Tests pass
- [x] API docs updated
- [x] No console errors`
    },
    {
      type: "h2",
      text: "Scenario 4: Squashing 12 'WIP' Commits Into One Clean Commit"
    },
    {
      type: "p",
      text: "You committed 'fix typo', 'debug logging', 'almost working', 'WIP', 'final fix', 'actually final fix' — 12 messy commits for one feature. Before merging, squash them into a single, descriptive commit."
    },
    {
      type: "code-block",
      label: "Interactive rebase to squash commits",
      code: `# Step 1: Start interactive rebase for last 12 commits
git rebase -i HEAD~12

# Git opens an editor showing:
# pick a1b2c3d fix typo
# pick e4f5g6h debug logging
# pick i7j8k9l almost working
# ...

# Step 2: Change 'pick' to 'squash' (or just 's') for all except the first
# pick a1b2c3d feat: add user authentication
# s e4f5g6h debug logging
# s i7j8k9l almost working
# ...

# Step 3: Save and close editor
# Git opens another editor to write the combined commit message
# Write a clean message, save, close

# Step 4: Force push the rewritten history
git push --force-with-lease`
    },
    {
      type: "h2",
      text: "Scenario 5: You Broke main and Need to Revert Fast"
    },
    {
      type: "p",
      text: "You merged a PR that broke production. The CI is red. Your manager is pinging you. You need to undo the merge immediately — but you also need to preserve the work for later fixing."
    },
    {
      type: "code-block",
      label: "Safe revert vs dangerous reset",
      code: `# ✅ SAFE: Revert creates a new commit that undoes the changes
# This preserves history and is safe for shared branches
git revert <commit-hash-of-the-bad-merge>
git push origin main

# ❌ DANGEROUS: Reset erases commits permanently
# Only use this on your own feature branch before pushing
git reset --hard HEAD~1  # Deletes last commit forever

# If you already pushed the bad commit and others pulled it,
# resetting will cause chaos. Always revert on shared branches.`
    },
    {
      type: "h2",
      text: "Git Commands Cheat Sheet for Day 1 at Work"
    },
    {
      type: "code-block",
      label: "Essential commands reference",
      code: `# Daily workflow
git checkout -b feat/name          # New feature branch
git add -p                         # Stage changes interactively (review each chunk)
git commit -m "type: description"  # Conventional commits format
git fetch && git rebase origin/main  # Stay up to date
git push -u origin branch          # Push new branch

# Undoing mistakes
git reset --soft HEAD~1            # Undo last commit, keep changes staged
git reset --mixed HEAD~1           # Undo last commit, keep changes unstaged
git checkout -- <file>             # Discard changes in a file
git restore --staged <file>        # Unstage a file

# History and inspection
git log --oneline --graph          # Pretty history with branch graph
git blame <file>                   # Who wrote each line
git diff HEAD~1                    # What changed in last commit
git stash push -m "WIP login"      # Save work with a description
git stash pop                      # Restore stashed work

# Collaboration
git rebase -i HEAD~N               # Squash last N commits
git cherry-pick <commit>           # Copy a commit to current branch
git bisect start                   # Find which commit introduced a bug`
    },
    {
      type: "h2",
      text: "Common Mistakes That Make You Look Junior"
    },
    {
      type: "mistakes",
      items: [
        { title: "Committing directly to main", text: "Always branch. Even for 'quick fixes'. Direct commits to main break CI, bypass review, and create revert headaches." },
        { title: "Giant commits with 20 files changed", text: "A PR that touches auth, UI, database schema, and 3 config files is impossible to review. Split into logical chunks." },
        { title: "Writing vague commit messages", text: "'Fix bug' or 'Update' tells your team nothing. Use conventional commits: 'feat:', 'fix:', 'docs:', 'refactor:', 'test:'" },
        { title: "Ignoring .gitignore", text: "Committing node_modules, .env files, or IDE configs marks you as careless. Set up .gitignore on day 0." },
        { title: "Panic-pushing broken code at 5 PM", text: "If it's not working, don't push. Use git stash, go home, come back fresh. Broken code in the repo blocks your teammates." },
      ]
    },
    {
      type: "h2",
      text: "GitHub Features Beyond the Basics"
    },
    {
      type: "sections-list",
      items: [
        { title: "Pull Request Templates", desc: "Create .github/pull_request_template.md in your repo. Every new PR auto-fills with your template — no more blank descriptions." },
        { title: "Issue Templates", desc: "Bug reports and feature requests with structured fields. Saves 5 back-and-forth messages per issue." },
        { title: "GitHub Actions (CI/CD)", desc: "Automated tests run on every PR. If tests fail, the PR can't merge. This is standard in every professional team." },
        { title: "Code Review Requests", desc: "Request specific reviewers, not just 'anyone'. Tag the person who knows that codebase. Faster reviews, better feedback." },
        { title: "Draft PRs", desc: "Open a PR as 'Draft' when you want early feedback but it's not ready to merge. Signals intent without blocking review queues." }
      ]
    },
    {
      type: "h2",
      text: "The Bottom Line"
    },
    {
      type: "p",
      text: "Git is a tool you'll use every day for the next 40 years. Spending one weekend to truly understand rebase, squash, and clean commit history will save you hundreds of hours and prevent countless embarrassing moments. The developers who get promoted fastest aren't the ones who write the most code — they're the ones whose code is easiest to review, revert, and build upon."
    },
    {
      type: "p",
      text: "Start with the cheat sheet. Practice on a personal project. When you join your first team, you'll already move like someone with two years of experience."
    }
  ]
};

export default post;
