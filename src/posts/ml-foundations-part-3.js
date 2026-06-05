const post = {
  "slug": "part-3-probability-information",
  "seriesSlug": "ml-foundations",
  "partNumber": 3,
  "totalParts": 4,
  "title": "Probability & Information Theory: The Math Behind Loss Functions (Part 3)",
  "seriesTitle": "ML Foundations: The Zero-Restart Series",
  "date": "June 19, 2026",
  "readTime": "28 min read",
  "category": "Machine Learning",
  "categoryColor": "#10b981",
  "excerpt": "Bayes' theorem, probability distributions, expectation, MLE, entropy, and cross-entropy — the statistical toolkit every ML engineer needs. Connected directly to classification, VAEs, and knowledge distillation.",
  "coverEmoji": "🎲",
  "tags": [
    "Probability",
    "Information Theory",
    "Bayes Theorem",
    "Cross-Entropy",
    "KL Divergence",
    "Python"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Every machine learning prediction is a probability. A spam filter asks: what is the probability this email is spam? A medical diagnosis model asks: what is the probability this scan shows cancer? A self-driving car asks: what is the probability that object is a pedestrian? Probability is not just statistics — it is the language of uncertainty in machine learning. This guide connects probability theory directly to the algorithms you use: Naive Bayes classifiers, logistic regression, maximum likelihood estimation, entropy, and cross-entropy. By the end, you will see why every loss function in deep learning is a probability distribution in disguise."
    },
    {
      "type": "h2",
      "text": "Why Probability Is the Language of Uncertainty"
    },
    {
      "type": "p",
      "text": "Machine learning models do not make definitive predictions. They make probabilistic predictions. A model outputs 0.87 for 'spam' — not 1.0. That 0.87 is a probability, and understanding what it means is critical. Probability theory gives us the tools to quantify uncertainty, update beliefs with new evidence, and measure the information content of predictions. Without probability, you cannot understand classification, generative models, or why cross-entropy is the standard loss function."
    },
    {
      "type": "checklist",
      "items": [
        "Classification outputs are probabilities. Softmax converts logits to a probability distribution over classes.",
        "Bayes' theorem updates prior beliefs with new evidence. This is the foundation of Bayesian neural networks and spam filters.",
        "Maximum Likelihood Estimation finds the parameters that make the observed data most probable. This is how logistic regression is trained.",
        "Entropy measures uncertainty. Cross-entropy measures the difference between predicted and true distributions. This is the classification loss.",
        "KL divergence measures how one probability distribution diverges from another. It appears in variational autoencoders and knowledge distillation."
      ]
    },
    {
      "type": "h2",
      "text": "Probability Fundamentals: Events, Random Variables, and Distributions"
    },
    {
      "type": "p",
      "text": "Probability is a number between 0 and 1 that quantifies the likelihood of an event. A random variable is a function that maps outcomes to numbers. A probability distribution describes how probability is spread over the possible values of a random variable. In ML, features are random variables, labels are random variables, and model predictions are probability distributions over possible labels."
    },
    {
      "type": "code-block",
      "label": "Probability Basics in Python",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# === PROBABILITY BASICS ===\n# P(A) = probability of event A\n# P(A|B) = probability of A given B has occurred\n# P(A,B) = joint probability of A and B\n\n# Simulate a biased coin: P(Heads) = 0.7, P(Tails) = 0.3\nnp.random.seed(42)\nflips = np.random.choice(['H', 'T'], size=1000, p=[0.7, 0.3])\nheads = np.sum(flips == 'H')\ntails = np.sum(flips == 'T')\n\nprint(f'Coin flips (n=1000):')\nprint(f'  Heads: {heads} ({heads/1000:.3f}) — expected 0.700')\nprint(f'  Tails: {tails} ({tails/1000:.3f}) — expected 0.300')\n\n# === RANDOM VARIABLES ===\n# A random variable assigns numbers to outcomes\n# X = 1 if Heads, X = 0 if Tails\nX = (flips == 'H').astype(int)\nprint(f'\\nRandom variable X (1=Heads, 0=Tails):')\nprint(f'  Mean (expected value): {np.mean(X):.3f} — this is P(Heads)')\nprint(f'  Variance: {np.var(X):.3f} — measures spread')\n\n# === ML CONNECTION: Features as Random Variables ===\n# In a dataset, each feature column is a random variable\n# 'age' has a distribution. 'income' has a distribution.\n# The model learns P(label | features) — the probability of the label\n# given the observed feature values.\n\n# Simulate a feature: heights of adult males (Gaussian distribution)\nheights = np.random.normal(loc=175, scale=7, size=10000)  # cm\n\nplt.figure(figsize=(10, 4))\nplt.subplot(1, 2, 1)\nplt.hist(heights, bins=50, density=True, alpha=0.7, color='steelblue', edgecolor='black')\nplt.xlabel('Height (cm)')\nplt.ylabel('Density')\nplt.title('Distribution of Heights')\nplt.axvline(175, color='red', linestyle='--', label='Mean = 175')\nplt.legend()\nplt.grid(True, alpha=0.3)\n\n# The probability density function (PDF) of a Gaussian\nx = np.linspace(150, 200, 500)\npdf = (1 / (7 * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - 175) / 7)**2)\n\nplt.subplot(1, 2, 2)\nplt.plot(x, pdf, 'r-', linewidth=2, label='PDF: N(175, 7²)')\nplt.fill_between(x, pdf, alpha=0.3, color='red')\nplt.xlabel('Height (cm)')\nplt.ylabel('Probability Density')\nplt.title('Gaussian PDF')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.tight_layout()\nplt.show()\n\n# Key insight: P(170 < height < 180) = area under the curve between 170 and 180\n# This is why we use integrals in continuous probability."
    },
    {
      "type": "h2",
      "text": "Bayes' Theorem: Updating Beliefs with Evidence"
    },
    {
      "type": "p",
      "text": "Bayes' theorem is the single most important equation in probabilistic machine learning. It tells you how to update your belief about a hypothesis when you see new evidence. P(spam | words) = P(words | spam) × P(spam) / P(words). This is how spam filters work. This is how medical diagnosis models work. This is how Bayesian neural networks quantify uncertainty. If you understand only one equation in probability, understand Bayes' theorem."
    },
    {
      "type": "code-block",
      "label": "Bayes' Theorem in Action",
      "code": "import numpy as np\n\n# === BAYES' THEOREM: P(H|E) = P(E|H) * P(H) / P(E) ===\n# H = hypothesis (e.g., 'email is spam')\n# E = evidence (e.g., 'email contains word FREE')\n# P(H) = prior probability (before seeing evidence)\n# P(E|H) = likelihood (probability of evidence if hypothesis is true)\n# P(H|E) = posterior probability (after seeing evidence)\n\n# Medical test example:\n# Disease prevalence: 1% of population has it\n# Test accuracy: 95% true positive, 5% false positive\n# You test positive. What is the probability you actually have the disease?\n\nP_disease = 0.01          # P(H) — prior\nP_positive_given_disease = 0.95   # P(E|H) — true positive rate\nP_positive_given_healthy = 0.05   # P(E|not H) — false positive rate\n\n# P(E) = P(E|H)*P(H) + P(E|not H)*P(not H)\nP_positive = (P_positive_given_disease * P_disease + \n              P_positive_given_healthy * (1 - P_disease))\n\n# Bayes' theorem\nP_disease_given_positive = (P_positive_given_disease * P_disease) / P_positive\n\nprint(f'Medical Test Example:')\nprint(f'  Prior P(disease) = {P_disease:.3f} (1%)')\nprint(f'  Test sensitivity = {P_positive_given_disease:.3f} (95%)')\nprint(f'  Test false positive = {P_positive_given_healthy:.3f} (5%)')\nprint(f'  P(positive) = {P_positive:.4f}')\nprint(f'  POSTERIOR P(disease|positive) = {P_disease_given_positive:.4f}')\nprint(f'  \\n  Even with a positive test, you only have a {P_disease_given_positive*100:.1f}% chance of having the disease!')\nprint(f'  This is the base rate fallacy. Prior probability matters enormously.')\n\n# === ML CONNECTION: Spam Filter (Naive Bayes) ===\n# P(spam | words) = P(words | spam) * P(spam) / P(words)\n# We estimate P(word | spam) from training data: count how often\n# each word appears in spam emails vs ham emails.\n\n# Simulate word frequencies\nspam_words = {'free': 0.3, 'win': 0.25, 'money': 0.2, 'click': 0.15, 'now': 0.1}\nham_words = {'free': 0.05, 'win': 0.02, 'money': 0.03, 'click': 0.04, 'now': 0.08}\nP_spam = 0.4  # 40% of emails are spam\n\n# Email contains: 'free', 'win', 'money'\n# Naive Bayes assumes words are independent (naive but effective)\nP_words_given_spam = spam_words['free'] * spam_words['win'] * spam_words['money']\nP_words_given_ham = ham_words['free'] * ham_words['win'] * ham_words['money']\n\n# Bayes' theorem\nP_spam_given_words = (P_words_given_spam * P_spam) / \n                     (P_words_given_spam * P_spam + P_words_given_ham * (1 - P_spam))\n\nprint(f'\\nSpam Filter Example:')\nprint(f'  Email contains: free, win, money')\nprint(f'  P(words|spam) = {P_words_given_spam:.6f}')\nprint(f'  P(words|ham) = {P_words_given_ham:.6f}')\nprint(f'  P(spam|words) = {P_spam_given_words:.4f}')\nprint(f'  \\n  This email is {P_spam_given_words*100:.1f}% likely to be spam.')\n\n# Key insight: Bayes' theorem inverts the conditional probability.\n# We learn P(word | spam) from data, then use it to compute P(spam | words).\n# This is the foundation of generative classifiers."
    },
    {
      "type": "h2",
      "text": "Maximum Likelihood Estimation: Finding the Best Parameters"
    },
    {
      "type": "p",
      "text": "Maximum Likelihood Estimation (MLE) is the principle behind almost all parameter estimation in machine learning. The idea is simple: find the parameters that make the observed data most probable. If you flip a coin 10 times and get 7 heads, the MLE estimate for P(Heads) is 0.7. If you observe heights of 1000 people, the MLE estimate for the mean is the sample mean. In logistic regression, MLE finds the weights that maximize the probability of the observed labels."
    },
    {
      "type": "code-block",
      "label": "MLE from Scratch",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# === MLE FOR A COIN ===\n# Flip a coin n times, observe k heads.\n# MLE estimate: P(Heads) = k / n\n\nnp.random.seed(42)\n# True probability is 0.6, but we don't know this\ntrue_p = 0.6\nflips = np.random.choice([0, 1], size=100, p=[1-true_p, true_p])\nk = np.sum(flips)\nn = len(flips)\n\nmle_p = k / n\nprint(f'Coin MLE:')\nprint(f'  True P(Heads) = {true_p}')\nprint(f'  Observed {k} heads in {n} flips')\nprint(f'  MLE estimate = {mle_p:.3f}')\n\n# === MLE FOR GAUSSIAN MEAN AND VARIANCE ===\n# Observed data: estimate mean and variance\n# MLE mean = sample mean\n# MLE variance = sample variance (with n denominator, not n-1)\n\ntrue_mean = 50\ntrue_std = 10\ndata = np.random.normal(true_mean, true_std, size=500)\n\nmle_mean = np.mean(data)\nmle_var = np.var(data, ddof=0)  # MLE uses n, not n-1\n\nprint(f'\\nGaussian MLE:')\nprint(f'  True: mean={true_mean}, std={true_std}')\nprint(f'  MLE:  mean={mle_mean:.2f}, std={np.sqrt(mle_var):.2f}')\n\n# === MLE FOR LOGISTIC REGRESSION ===\n# Logistic regression models P(y=1|x) = sigmoid(w*x + b)\n# MLE finds w and b that maximize the probability of observed labels\n\ndef sigmoid(z):\n    return 1 / (1 + np.exp(-z))\n\n# Generate data: y=1 if x > 0, y=0 otherwise (with some noise)\nnp.random.seed(42)\nX = np.random.randn(200, 1)\ny = (X[:, 0] > 0).astype(int)\n\n# Add noise: flip 10% of labels\nnoise_idx = np.random.choice(200, size=20, replace=False)\ny[noise_idx] = 1 - y[noise_idx]\n\n# MLE via gradient ascent on log-likelihood\nw = 0.0\nb = 0.0\nlr = 0.1\nepochs = 100\n\nfor epoch in range(epochs):\n    # Predictions\n    z = w * X[:, 0] + b\n    y_pred = sigmoid(z)\n    \n    # Gradient of log-likelihood\n    dw = np.sum((y - y_pred) * X[:, 0])\n    db = np.sum(y - y_pred)\n    \n    w += lr * dw / len(X)\n    b += lr * db / len(X)\n\nprint(f'\\nLogistic Regression MLE:')\nprint(f'  Learned: w={w:.3f}, b={b:.3f}')\nprint(f'  Expected: w≈large positive, b≈0 (since y=1 when x>0)')\n\n# Visualize\nplt.figure(figsize=(10, 4))\nplt.subplot(1, 2, 1)\nplt.hist(data, bins=30, density=True, alpha=0.7, color='steelblue', edgecolor='black')\nx_range = np.linspace(data.min(), data.max(), 100)\nplt.plot(x_range, (1/np.sqrt(2*np.pi*mle_var)) * np.exp(-0.5*((x_range-mle_mean)**2)/mle_var), \n         'r-', linewidth=2, label=f'Fitted N({mle_mean:.1f}, {np.sqrt(mle_var):.1f}²)')\nplt.xlabel('Value')\nplt.ylabel('Density')\nplt.title('Gaussian MLE Fit')\nplt.legend()\nplt.grid(True, alpha=0.3)\n\nplt.subplot(1, 2, 2)\nx_plot = np.linspace(-3, 3, 100)\nplt.plot(x_plot, sigmoid(w * x_plot + b), 'b-', linewidth=2, label='Learned sigmoid')\nplt.scatter(X[:, 0], y, alpha=0.3, c=y, cmap='bwr', label='Data')\nplt.xlabel('x')\nplt.ylabel('P(y=1|x)')\nplt.title('Logistic Regression MLE')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.tight_layout()\nplt.show()\n\n# === ML CONNECTION: Why MLE Matters ===\n# Linear regression minimizes MSE. This is equivalent to MLE under the\n# assumption that errors are Gaussian.\n# Logistic regression maximizes log-likelihood. This is MLE for Bernoulli.\n# Neural networks minimize cross-entropy. This is MLE for categorical.\n# Every loss function is a negative log-likelihood in disguise."
    },
    {
      "type": "h2",
      "text": "Entropy: Measuring Uncertainty"
    },
    {
      "type": "p",
      "text": "Entropy measures the uncertainty in a probability distribution. A fair coin has high entropy — you are completely uncertain about the outcome. A biased coin has lower entropy — you are more certain. A coin that always lands heads has zero entropy — no uncertainty at all. In machine learning, entropy appears in decision trees (information gain), in softmax temperature scaling, and as the fundamental limit of how much a model can compress data."
    },
    {
      "type": "code-block",
      "label": "Entropy and Information Content",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# === ENTROPY FORMULA: H(X) = -Σ p(x) * log₂(p(x)) ===\n# Units: bits (if log₂), nats (if log_e)\n\ndef entropy(p):\n    # p is a probability distribution (must sum to 1)\n    p = np.array(p)\n    p = p[p > 0]  # avoid log(0)\n    return -np.sum(p * np.log2(p))\n\n# Fair coin: P(Heads)=0.5, P(Tails)=0.5\nH_fair = entropy([0.5, 0.5])\nprint(f'Fair coin entropy: {H_fair:.3f} bits')  # 1.0 bit\n\n# Biased coin: P(Heads)=0.9, P(Tails)=0.1\nH_biased = entropy([0.9, 0.1])\nprint(f'Biased coin entropy: {H_biased:.3f} bits')  # ~0.47 bits\n\n# Certain coin: P(Heads)=1.0, P(Tails)=0.0\nH_certain = entropy([1.0, 0.0])\nprint(f'Certain coin entropy: {H_certain:.3f} bits')  # 0 bits\n\n# === ENTROPY VS BIAS ===\np_values = np.linspace(0.001, 0.999, 100)\nentropies = [entropy([p, 1-p]) for p in p_values]\n\nplt.figure(figsize=(10, 4))\nplt.subplot(1, 2, 1)\nplt.plot(p_values, entropies, 'b-', linewidth=2)\nplt.axvline(0.5, color='red', linestyle='--', alpha=0.7, label='Fair coin (max entropy)')\nplt.xlabel('P(Heads)')\nplt.ylabel('Entropy (bits)')\nplt.title('Entropy of a Coin')\nplt.legend()\nplt.grid(True, alpha=0.3)\n\n# === INFORMATION CONTENT ===\n# Information content of an event: I(x) = -log₂(p(x))\n# Rare events carry more information\n\nprobs = [0.5, 0.25, 0.1, 0.01, 0.001]\ninfo_content = [-np.log2(p) for p in probs]\n\nplt.subplot(1, 2, 2)\nplt.bar(range(len(probs)), info_content, color='steelblue', edgecolor='black')\nplt.xticks(range(len(probs)), [f'{p}' for p in probs])\nplt.xlabel('Probability of Event')\nplt.ylabel('Information Content (bits)')\nplt.title('Rare Events = More Information')\nplt.grid(True, alpha=0.3, axis='y')\nplt.tight_layout()\nplt.show()\n\nprint(f'\\nInformation content:')\nfor p, ic in zip(probs, info_content):\n    print(f'  P={p:6.3f} → I={ic:.2f} bits')\n\n# === ML CONNECTION: Decision Trees ===\n# Decision trees split on the feature that maximizes information gain.\n# Information gain = entropy(parent) - weighted_avg(entropy(children))\n# This is why decision trees ask the most informative questions first.\n\n# === ML CONNECTION: Softmax Temperature ===\n# logits / T: when T→0, distribution becomes sharp (low entropy, confident)\n# when T→∞, distribution becomes uniform (high entropy, uncertain)\n# Temperature scaling adjusts model confidence without retraining."
    },
    {
      "type": "h2",
      "text": "Cross-Entropy: The Standard Classification Loss"
    },
    {
      "type": "p",
      "text": "Cross-entropy measures the difference between two probability distributions: the true distribution (one-hot encoded labels) and the predicted distribution (softmax outputs). It is the negative log-likelihood of the true class under the predicted distribution. Minimizing cross-entropy is equivalent to maximizing the likelihood of the training data. This is why every classification model in deep learning — from image classifiers to language models — uses cross-entropy as its loss function."
    },
    {
      "type": "code-block",
      "label": "Cross-Entropy from Scratch",
      "code": "import numpy as np\n\n# === CROSS-ENTROPY: H(p, q) = -Σ p(x) * log(q(x)) ===\n# p = true distribution (one-hot for classification)\n# q = predicted distribution (softmax output)\n\ndef cross_entropy(p, q):\n    p = np.array(p)\n    q = np.array(q)\n    # Add small epsilon to avoid log(0)\n    epsilon = 1e-10\n    q = np.clip(q, epsilon, 1 - epsilon)\n    return -np.sum(p * np.log(q))\n\n# Example: 3-class classification\n# True label: class 2 (one-hot: [0, 0, 1])\n# Model predictions:\n\np_true = [0, 0, 1]\n\n# Confident and correct prediction\nq_good = [0.05, 0.05, 0.90]\nce_good = cross_entropy(p_true, q_good)\n\n# Uncertain prediction\nq_uncertain = [0.33, 0.33, 0.34]\nce_uncertain = cross_entropy(p_true, q_uncertain)\n\n# Confident but wrong prediction\nq_wrong = [0.90, 0.05, 0.05]\nce_wrong = cross_entropy(p_true, q_wrong)\n\nprint(f'Cross-Entropy Examples (true class = 2):')\nprint(f'  Good prediction [0.05, 0.05, 0.90]: CE = {ce_good:.4f}')\nprint(f'  Uncertain [0.33, 0.33, 0.34]:      CE = {ce_uncertain:.4f}')\nprint(f'  Wrong [0.90, 0.05, 0.05]:          CE = {ce_wrong:.4f}')\nprint(f'  \\n  Lower CE = better. Wrong confident predictions are punished heavily.')\n\n# === BINARY CROSS-ENTROPY ===\n# For binary classification: BCE = -[y*log(p) + (1-y)*log(1-p)]\n\ndef binary_cross_entropy(y_true, y_pred):\n    epsilon = 1e-10\n    y_pred = np.clip(y_pred, epsilon, 1 - epsilon)\n    return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))\n\n# Example: y=1, model predicts 0.9 vs 0.1\ny = np.array([1, 0, 1, 0])\np_high = np.array([0.9, 0.1, 0.8, 0.2])  # confident, mostly correct\np_low = np.array([0.6, 0.4, 0.55, 0.45])  # uncertain\n\nbce_high = binary_cross_entropy(y, p_high)\nbce_low = binary_cross_entropy(y, p_low)\n\nprint(f'\\nBinary Cross-Entropy:')\nprint(f'  Confident correct: BCE = {bce_high:.4f}')\nprint(f'  Uncertain:         BCE = {bce_low:.4f}')\n\n# === WHY CROSS-ENTROPY AND NOT MSE? ===\n# MSE: L = (y - p)² → gradient = 2(p - y)\n# When p is close to 0 or 1 and wrong, gradient is tiny. Slow learning.\n#\n# CE: L = -y*log(p) → gradient = -y/p\n# When p is close to 0 and y=1, gradient is HUGE. Fast correction.\n# This is why CE converges faster for classification.\n\n# Visualize gradient magnitudes\nimport matplotlib.pyplot as plt\np_range = np.linspace(0.01, 0.99, 100)\ny = 1  # true label\n\n# MSE gradient\ngrad_mse = 2 * (p_range - y)\n# CE gradient\ngrad_ce = -y / p_range\n\nplt.figure(figsize=(10, 4))\nplt.subplot(1, 2, 1)\nplt.plot(p_range, grad_mse, 'b-', linewidth=2, label='MSE gradient')\nplt.plot(p_range, grad_ce, 'r-', linewidth=2, label='CE gradient')\nplt.xlabel('Predicted probability p (true y=1)')\nplt.ylabel('Gradient magnitude')\nplt.title('Gradient Comparison')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.axhline(0, color='black', linewidth=0.5)\n\n# Loss comparison\nmse_loss = (y - p_range)**2\nce_loss = -y * np.log(p_range)\n\nplt.subplot(1, 2, 2)\nplt.plot(p_range, mse_loss, 'b-', linewidth=2, label='MSE')\nplt.plot(p_range, ce_loss, 'r-', linewidth=2, label='Cross-Entropy')\nplt.xlabel('Predicted probability p (true y=1)')\nplt.ylabel('Loss')\nplt.title('Loss Comparison')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.tight_layout()\nplt.show()\n\n# Key insight: when p→0 and y=1, CE loss → ∞. The model is heavily punished\n# for being confidently wrong. This drives faster learning."
    },
    {
      "type": "h2",
      "text": "KL Divergence: Measuring Distribution Differences"
    },
    {
      "type": "p",
      "text": "Kullback-Leibler (KL) divergence measures how one probability distribution diverges from another. It is not symmetric: KL(P||Q) is different from KL(Q||P). In machine learning, KL divergence appears in variational autoencoders (VAEs) where it regularizes the latent space, in knowledge distillation where a student learns from a teacher, and in t-SNE where it preserves local structure. Minimizing KL divergence is equivalent to maximizing the likelihood of data under the model."
    },
    {
      "type": "code-block",
      "label": "KL Divergence in Action",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# === KL DIVERGENCE: KL(P||Q) = Σ p(x) * log(p(x)/q(x)) ===\n# Measures how much Q differs from P\n# KL = 0 when P = Q\n# KL increases as Q diverges from P\n\ndef kl_divergence(p, q):\n    p = np.array(p)\n    q = np.array(q)\n    epsilon = 1e-10\n    p = np.clip(p, epsilon, 1)\n    q = np.clip(q, epsilon, 1)\n    return np.sum(p * np.log(p / q))\n\n# Example: true distribution is [0.6, 0.4]\nP = [0.6, 0.4]\n\n# Q matches P perfectly\nQ1 = [0.6, 0.4]\nkl1 = kl_divergence(P, Q1)\n\n# Q is slightly off\nQ2 = [0.5, 0.5]\nkl2 = kl_divergence(P, Q2)\n\n# Q is very wrong\nQ3 = [0.1, 0.9]\nkl3 = kl_divergence(P, Q3)\n\nprint(f'KL Divergence Examples:')\nprint(f'  P = [0.6, 0.4]')\nprint(f'  Q = [0.6, 0.4]: KL = {kl1:.4f} (perfect match)')\nprint(f'  Q = [0.5, 0.5]: KL = {kl2:.4f} (slightly off)')\nprint(f'  Q = [0.1, 0.9]: KL = {kl3:.4f} (very wrong)')\n\n# === ML CONNECTION: Variational Autoencoder ===\n# VAE loss = Reconstruction Loss + β * KL(q(z|x) || p(z))\n# q(z|x) = learned encoder distribution\n# p(z) = standard normal N(0, I)\n# KL term forces latent space to be well-structured and continuous\n\n# Simulate: encoder outputs mean and variance\n# We want q(z|x) to be close to N(0, 1)\n\n# q(z|x) = N(μ, σ²)\nmu_q = 2.0    # encoder mean\nsigma_q = 0.5  # encoder std\n\n# p(z) = N(0, 1)\nmu_p = 0.0\nsigma_p = 1.0\n\n# KL between two Gaussians has a closed form:\n# KL(N(μ₁,σ₁²) || N(μ₂,σ₂²)) = log(σ₂/σ₁) + (σ₁² + (μ₁-μ₂)²)/(2σ₂²) - 0.5\nkl_vae = (np.log(sigma_p / sigma_q) + \n          (sigma_q**2 + (mu_q - mu_p)**2) / (2 * sigma_p**2) - 0.5)\n\nprint(f'\\nVAE KL Divergence:')\nprint(f'  q(z|x) = N({mu_q}, {sigma_q}²)')\nprint(f'  p(z)   = N({mu_p}, {sigma_p}²)')\nprint(f'  KL = {kl_vae:.4f}')\nprint(f'  \\n  The encoder is penalized for deviating from N(0,1).')\nprint(f'  This prevents overfitting and creates a smooth latent space.')\n\n# === ML CONNECTION: Knowledge Distillation ===\n# Teacher model produces soft labels: P_teacher = softmax(logits / T)\n# Student learns from P_teacher instead of hard labels\n# Loss = KL(P_teacher || P_student) + α * CE(hard_labels, P_student)\n# The student learns the teacher's uncertainty, not just its decisions.\n\n# Simulate teacher and student predictions\nteacher = [0.7, 0.2, 0.1]  # confident about class 0\nstudent_before = [0.4, 0.3, 0.3]  # uncertain\nstudent_after = [0.65, 0.25, 0.1]   # learned from teacher\n\nkl_before = kl_divergence(teacher, student_before)\nkl_after = kl_divergence(teacher, student_after)\n\nprint(f'\\nKnowledge Distillation:')\nprint(f'  Teacher:        {teacher}')\nprint(f'  Student before: {student_before}, KL = {kl_before:.4f}')\nprint(f'  Student after:  {student_after}, KL = {kl_after:.4f}')\nprint(f'  \\n  Student learned to match teacher's uncertainty, not just argmax.')\n\n# Visualize KL divergence landscape\nfig, ax = plt.subplots(figsize=(8, 6))\n\n# Create a grid of Q distributions\nqs = np.linspace(0.01, 0.99, 50)\nkl_values = []\nfor q in qs:\n    Q = [q, 1-q]\n    kl_values.append(kl_divergence(P, Q))\n\nax.plot(qs, kl_values, 'b-', linewidth=2)\nax.axvline(0.6, color='red', linestyle='--', alpha=0.7, label=f'P = [0.6, 0.4] (KL=0)')\nax.set_xlabel('Q[0] (probability of first class)')\nax.set_ylabel('KL Divergence')\nax.set_title('KL(P||Q) Landscape')\nax.legend()\nax.grid(True, alpha=0.3)\nplt.show()\n\n# Key insight: KL is asymmetric. KL(P||Q) punishes Q being small where P is large.\n# This is why mode collapse happens in GANs: the generator learns to match\n# the support of the data, not just the mean."
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 4. Score yourself honestly. 4/5 correct means you are ready."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: A medical test has 99% sensitivity and 1% false positive rate. Disease prevalence is 0.1%. You test positive. What is the probability you have the disease? Show the Bayes' calculation.",
        "Q2: You train a classifier with cross-entropy loss. For one example, the true label is class 3 and the model outputs [0.1, 0.1, 0.1, 0.7]. What is the cross-entropy loss? What if the model outputs [0.25, 0.25, 0.25, 0.25]?",
        "Q3: Explain why minimizing cross-entropy is equivalent to Maximum Likelihood Estimation for a categorical distribution.",
        "Q4: A VAE encoder outputs q(z|x) = N(2.5, 0.3²). The prior is p(z) = N(0, 1). Calculate the KL divergence using the closed-form formula.",
        "Q5: A model predicts [0.99, 0.01] for a negative example (true label [1, 0]). Compare the MSE and cross-entropy gradients. Which loss gives a stronger signal to correct the error?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: P(disease|positive) = P(positive|disease)*P(disease) / P(positive). P(positive) = 0.99*0.001 + 0.01*0.999 = 0.01098. Posterior = 0.99*0.001 / 0.01098 = 0.0902 = 9.02%. Even with a 99% accurate test and a positive result, you only have a 9% chance of having the disease because the base rate is so low. This is why screening tests need confirmation. A2: CE = -log(0.7) = 0.357 for the confident prediction. CE = -log(0.25) = 1.386 for the uniform prediction. Lower is better. The confident correct prediction has 4x lower loss. A3: Cross-entropy H(p,q) = -Σ p(x) log q(x). For one-hot p, this becomes -log q(y_true). The negative log-likelihood of the data under model q is -Σ log q(y_i). Minimizing CE is exactly maximizing the log-likelihood. They are the same objective. A4: KL = log(1/0.3) + (0.3² + 2.5²)/(2*1²) - 0.5 = 1.204 + 3.295 - 0.5 = 3.999. The encoder is heavily penalized for being far from the prior. A5: MSE gradient = 2*(0.99-1) = -0.02. CE gradient = -1/0.99 = -1.01. Cross-entropy gives a 50x stronger gradient. When the model is confidently wrong, CE explodes and forces rapid correction. MSE is too gentle."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Probability is not a separate topic you learn after machine learning. It is the foundation of every prediction, every loss function, and every training algorithm. Bayes' theorem updates beliefs. Maximum Likelihood Estimation finds parameters. Entropy measures uncertainty. Cross-entropy is the classification loss. KL divergence measures distribution differences. When you see a neural network outputting probabilities, when you see cross-entropy in a training loop, when you see a variational autoencoder — you are seeing probability theory in action. Master these concepts and the statistical side of machine learning becomes transparent."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Do not memorize formulas. Understand the intuition: probability quantifies uncertainty, Bayes updates beliefs, MLE finds the most likely explanation, entropy measures surprise, and cross-entropy punishes wrong confidence. Every classification model you build — from logistic regression to Transformers — is an application of these principles. Write the code. Break it. Fix it. Then move to Part 4."
    }
  ]
};

export default post;