const post = {
  "slug": "part-1-linear-algebra",
  "seriesSlug": "ml-foundations",
  "partNumber": 1,
  "totalParts": 4,
  "title": "Linear Algebra for Machine Learning: The Language of Data (Part 1)",
  "seriesTitle": "ML Foundations: The Zero-Restart Series",
  "date": "June 5, 2026",
  "readTime": "25 min read",
  "category": "Machine Learning",
  "categoryColor": "#10b981",
  "excerpt": "Vectors, matrices, dot products, eigenvalues, and SVD — explained with Python code and real ML connections. This is the foundation everything else builds on.",
  "coverEmoji": "🧮",
  "tags": [
    "Linear Algebra",
    "Machine Learning",
    "NumPy",
    "Python",
    "PCA",
    "SVD"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Every piece of data in machine learning is a vector. Every dataset is a matrix. Every prediction is a matrix multiplication. If you do not understand linear algebra, you are memorizing API calls without knowing why they work. This guide does not just teach you formulas — it shows you exactly how each concept appears in real ML algorithms: from linear regression to neural networks to PCA. By the end, you will not just 'know' linear algebra. You will see it everywhere."
    },
    {
      "type": "h2",
      "text": "Why Linear Algebra Is the Language of ML"
    },
    {
      "type": "p",
      "text": "In traditional programming, you process one item at a time: loop through a list, check a condition, update a counter. In machine learning, you process entire datasets simultaneously using matrix operations. A single matrix multiplication can compute predictions for 10,000 data points in one operation. This is not just faster — it is fundamentally different. Linear algebra is the syntax that makes this possible."
    },
    {
      "type": "checklist",
      "items": [
        "A single image (28x28 pixels) = a vector with 784 numbers. MNIST dataset (60,000 images) = a 60,000 x 784 matrix.",
        "A word in NLP = a vector (word embedding). A sentence = a matrix of word vectors. A document = a 3D tensor.",
        "A neural network layer = matrix multiplication (weights) + vector addition (bias) + element-wise function (activation).",
        "PCA (dimensionality reduction) = find eigenvectors of the covariance matrix. SVD = generalize this to any matrix.",
        "Every optimization step in deep learning = gradient vector update. Every loss function = dot product or norm."
      ]
    },
    {
      "type": "h2",
      "text": "Vectors: More Than Just Lists of Numbers"
    },
    {
      "type": "p",
      "text": "A vector is not just a Python list. It is a mathematical object with magnitude and direction. In ML, vectors represent data points in high-dimensional space. The 'distance' between two vectors measures similarity. The 'angle' between them measures correlation. These geometric intuitions are what make algorithms like k-NN and cosine similarity work."
    },
    {
      "type": "code-block",
      "label": "Vectors in NumPy",
      "code": "import numpy as np\n\n# A vector: 3 features for one data point (e.g., house: [sqft, bedrooms, age])\nv = np.array([1200, 3, 15])\n\n# Magnitude (L2 norm): how 'big' is this vector?\nmagnitude = np.linalg.norm(v)\nprint(f'Magnitude: {magnitude:.2f}')  # 1200.02\n\n# Direction: unit vector (same direction, length 1)\ndirection = v / magnitude\nprint(f'Direction: {direction}')  # [0.9999, 0.0025, 0.0125]\n\n# In ML: magnitude = scale of features, direction = pattern of features\n# Normalizing vectors (making them unit length) is critical for:\n# - k-NN (distance-based algorithms)\n# - Cosine similarity (NLP, recommendation systems)\n# - Neural network initialization (prevents exploding gradients)"
    },
    {
      "type": "h2",
      "text": "Dot Product: The Single Most Important Operation in ML"
    },
    {
      "type": "p",
      "text": "The dot product of two vectors measures how much they 'agree.' In ML, it appears as: weighted sum (linear regression), similarity score (cosine similarity), attention mechanism (Transformers), and kernel methods (SVM). If you understand only one operation, understand the dot product."
    },
    {
      "type": "code-block",
      "label": "Dot Product Deep Dive",
      "code": "import numpy as np\n\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\n\n# Method 1: Element-wise multiply, then sum\ndot_manual = np.sum(a * b)  # 1*4 + 2*5 + 3*6 = 32\n\n# Method 2: NumPy dot product\ndot_numpy = np.dot(a, b)  # 32\n\n# Method 3: Matrix multiplication (vectors as 1D matrices)\ndot_matmul = a @ b  # 32\n\n# Geometric interpretation: dot product = |a| * |b| * cos(theta)\nmagnitude_a = np.linalg.norm(a)\nmagnitude_b = np.linalg.norm(b)\ncos_theta = dot_numpy / (magnitude_a * magnitude_b)\nprint(f'cos(theta) = {cos_theta:.4f}')  # 0.9746 → vectors point in similar directions\n\n# === ML CONNECTION: Linear Regression Prediction ===\n# weights = [w1, w2, w3], features = [x1, x2, x3]\n# prediction = w1*x1 + w2*x2 + w3*x3 = dot(weights, features)\nweights = np.array([0.5, -0.3, 0.8])\nfeatures = np.array([1200, 3, 15])  # house data\nprediction = np.dot(weights, features)\nprint(f'House price prediction: ${prediction:.2f}k')  # $611.10k\n\n# === ML CONNECTION: Cosine Similarity (NLP) ===\n# Two word embeddings: how similar are the words 'king' and 'queen'?\nvec_king = np.array([0.2, 0.8, 0.1, 0.5])\nvec_queen = np.array([0.25, 0.75, 0.12, 0.48])\ncosine_sim = np.dot(vec_king, vec_queen) / (np.linalg.norm(vec_king) * np.linalg.norm(vec_queen))\nprint(f'Cosine similarity: {cosine_sim:.4f}')  # 0.99 → very similar"
    },
    {
      "type": "h2",
      "text": "Matrices: Storing and Transforming Data at Scale"
    },
    {
      "type": "p",
      "text": "A matrix is a collection of vectors arranged in rows or columns. In ML, matrices are everywhere: design matrices (data), weight matrices (models), transformation matrices (PCA), and adjacency matrices (graphs). Matrix multiplication is the engine that powers neural networks."
    },
    {
      "type": "code-block",
      "label": "Matrix Operations for ML",
      "code": "import numpy as np\n\n# Design matrix: 5 houses, 3 features each (sqft, bedrooms, age)\nX = np.array([\n    [1200, 3, 15],\n    [850,  2, 25],\n    [1500, 4, 10],\n    [2000, 5, 5],\n    [950,  2, 20]\n])\nprint(f'Data shape: {X.shape}')  # (5, 3) → 5 samples, 3 features\n\n# Weight matrix: 3 features → 1 output (price prediction)\nW = np.array([[0.5], [-0.3], [0.8]])\nprint(f'Weights shape: {W.shape}')  # (3, 1)\n\n# Predictions for ALL 5 houses in ONE matrix multiplication\npredictions = X @ W  # (5, 3) @ (3, 1) = (5, 1)\nprint(f'Predictions shape: {predictions.shape}')  # (5, 1)\nprint(f'All predictions: {predictions.flatten()}')\n\n# === ML CONNECTION: Batch Processing ===\n# Without matrices: loop through each house, compute dot product\n# With matrices: one operation, GPU-accelerated, 1000x faster\n\n# === TRANSFORMATION: Feature Scaling ===\n# Normalize each feature to have mean=0, std=1 (critical for gradient descent)\nmean = np.mean(X, axis=0)\nstd = np.std(X, axis=0)\nX_normalized = (X - mean) / std\nprint(f'Normalized mean: {np.mean(X_normalized, axis=0)}')  # [0, 0, 0]\nprint(f'Normalized std: {np.std(X_normalized, axis=0)}')      # [1, 1, 1]\n\n# === TRANSFORMATION: PCA Preview (we'll cover eigenvalues next) ===\n# Center the data (subtract mean)\nX_centered = X - mean\n# Covariance matrix: how features vary together\ncovariance = (X_centered.T @ X_centered) / (X.shape[0] - 1)\nprint(f'Covariance matrix shape: {covariance.shape}')  # (3, 3)\nprint(f'Covariance matrix:\\n{covariance}')\n# Diagonal = variance of each feature. Off-diagonal = correlation between features."
    },
    {
      "type": "h2",
      "text": "Eigenvalues and Eigenvectors: The Secret Behind PCA"
    },
    {
      "type": "p",
      "text": "An eigenvector of a matrix is a special direction that only gets stretched (not rotated) when the matrix is applied. The eigenvalue tells you how much it stretches. In PCA, eigenvectors of the covariance matrix are the 'principal components' — the directions of maximum variance in your data. Eigenvalues tell you how much variance each component captures."
    },
    {
      "type": "code-block",
      "label": "Eigenvalues and PCA",
      "code": "import numpy as np\n\n# Covariance matrix from our house data (see previous code block)\nX = np.array([\n    [1200, 3, 15],\n    [850,  2, 25],\n    [1500, 4, 10],\n    [2000, 5, 5],\n    [950,  2, 20]\n])\nX_centered = X - np.mean(X, axis=0)\ncovariance = (X_centered.T @ X_centered) / (X.shape[0] - 1)\n\n# Compute eigenvalues and eigenvectors\neigenvalues, eigenvectors = np.linalg.eig(covariance)\nprint(f'Eigenvalues: {eigenvalues}')\nprint(f'Eigenvectors shape: {eigenvectors.shape}')  # (3, 3)\n\n# Sort by eigenvalue (descending) — most variance first\nsorted_idx = np.argsort(eigenvalues)[::-1]\neigenvalues = eigenvalues[sorted_idx]\neigenvectors = eigenvectors[:, sorted_idx]\n\nprint(f'\\nSorted eigenvalues: {eigenvalues}')\nprint(f'Variance explained: {eigenvalues / np.sum(eigenvalues) * 100}%')\n\n# First principal component (eigenvector with largest eigenvalue)\npc1 = eigenvectors[:, 0]\nprint(f'\\nFirst principal component: {pc1}')\n# This tells us: data varies most along this direction in feature space\n\n# Project data onto first 2 principal components (dimensionality reduction!)\nX_pca = X_centered @ eigenvectors[:, :2]\nprint(f'\\nOriginal shape: {X.shape}')      # (5, 3)\nprint(f'PCA shape: {X_pca.shape}')          # (5, 2) — reduced from 3D to 2D!\n\n# === ML CONNECTION: Why PCA Works ===\n# - Eigenvectors = directions of maximum variance\n# - Eigenvalues = how much variance each direction captures\n# - Keep top-k eigenvectors = keep most important information\n# - Discard rest = noise reduction, visualization, faster training\n\n# Real-world: 784-dimensional MNIST → 50 dimensions with PCA\n# Keeps 95% of information, trains 10x faster, less overfitting"
    },
    {
      "type": "h2",
      "text": "SVD: The General-Purpose Matrix Decomposition"
    },
    {
      "type": "p",
      "text": "Singular Value Decomposition (SVD) factorizes any matrix into three simpler matrices: U, Σ (sigma), and V^T. It generalizes eigendecomposition to non-square matrices. SVD is the engine behind: recommendation systems (Netflix prize), image compression, latent semantic analysis (NLP), and solving linear systems. Every ML engineer should know SVD."
    },
    {
      "type": "code-block",
      "label": "SVD in Action",
      "code": "import numpy as np\n\n# User-movie ratings matrix (5 users, 4 movies)\n# 0 = not rated\nratings = np.array([\n    [5, 3, 0, 1],\n    [4, 0, 0, 1],\n    [1, 1, 0, 5],\n    [1, 0, 0, 4],\n    [0, 1, 5, 4]\n], dtype=float)\n\n# SVD decomposition: ratings = U @ Σ @ Vt\nU, sigma, Vt = np.linalg.svd(ratings, full_matrices=False)\nprint(f'U shape: {U.shape}')       # (5, 4) — user latent features\nprint(f'Σ shape: {sigma.shape}')   # (4,) — singular values (importance)\nprint(f'Vt shape: {Vt.shape}')     # (4, 4) — movie latent features\n\n# Reconstruct with top-2 components (dimensionality reduction)\nU_2 = U[:, :2]\nsigma_2 = np.diag(sigma[:2])\nVt_2 = Vt[:2, :]\nratings_approx = U_2 @ sigma_2 @ Vt_2\n\nprint(f'\\nOriginal ratings:\\n{ratings}')\nprint(f'\\nApproximated ratings (2 components):\\n{np.round(ratings_approx, 1)}')\n\n# Fill in missing ratings (0s) with predictions\n# User 0, Movie 2 was not rated → predict ~2.3\nprint(f'\\nPredicted rating for User 0, Movie 2: {ratings_approx[0, 2]:.1f}')\n\n# === ML CONNECTION: Recommendation Systems ===\n# - SVD finds 'latent factors' (hidden patterns)\n# - Users and movies are represented in same latent space\n# - Similar users like similar movies → collaborative filtering\n# - Netflix used this to win the Netflix Prize (2009)\n\n# === ML CONNECTION: Image Compression ===\n# - A 1000x1000 image = matrix of pixel values\n# - SVD with top-50 components = compressed representation\n# - Storage: 1000*1000 = 1M → 1000*50 + 50 + 50*1000 = ~100K (10x smaller)\n# - Quality: 95% preserved,肉眼几乎看不出 difference"
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these questions before moving to Part 2. If you get 4/5 correct, you are ready. If not, review the relevant section."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Why is the dot product called the 'single most important operation in ML'? Name three algorithms that use it.",
        "Q2: A covariance matrix has eigenvalues [8.5, 2.1, 0.3]. How many principal components should you keep to capture ~95% of variance?",
        "Q3: In SVD, what do U, Σ, and V^T represent in a recommendation system context?",
        "Q4: Why do we normalize features (mean=0, std=1) before training neural networks? What happens if we don't?",
        "Q5: A word embedding has 300 dimensions. A sentence has 20 words. What is the shape of the sentence matrix? How does this feed into a neural network?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Dot product measures similarity/alignment. Used in: linear regression (weighted sum), cosine similarity (NLP), attention mechanisms (Transformers), SVM kernels, and neural network layers (matrix multiplication is batch dot product). A2: First two components explain (8.5+2.1)/(8.5+2.1+0.3) = 97.2% of variance. Keep 2 components. A3: U = user latent features, Σ = importance of each latent factor, V^T = movie latent features. A4: Without normalization, features with large scales dominate gradients. The network learns slowly or diverges. Normalization ensures all features contribute equally. A5: Shape is (20, 300). Fed into neural network as a batch: each row is a word vector, matrix multiplication with weight matrix transforms to hidden dimensions."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Linear algebra is not abstract math — it is the programming language of machine learning. Vectors are data points. Matrices are datasets and transformations. Dot products are predictions and similarities. Eigenvectors are patterns. SVD is the universal tool for finding structure in data. Every algorithm you will learn — from linear regression to deep learning — is built from these operations. Master them now, and nothing in ML will look mysterious."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Do not memorize formulas. Understand the geometric intuition: vectors are points in space, matrices are transformations, eigenvectors are the axes that matter. Write the NumPy code yourself. Break it. Fix it. Then move to Part 2."
    }
  ]
};

export default post;