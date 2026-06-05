const seriesData = {
  "slug": "ml-foundations",
  "title": "ML Foundations: The Zero-Restart Series",
  "description": "The complete prerequisite guide for machine learning. Master every fundamental theory in one structured path — so you never have to restart from scratch again.",
  "category": "Machine Learning",
  "categoryColor": "#10b981",
  "coverEmoji": "🧠",
  "tags": [
    "Machine Learning",
    "Data Science",
    "Mathematics",
    "Python",
    "AI"
  ],
  "totalParts": 4,
  "estimatedTime": "8-10 hours",
  "difficulty": "Beginner to Intermediate",
  "prerequisites": [
    "Basic Python",
    "High School Math"
  ],
  "parts": [
    {
      "partNumber": 1,
      "slug": "part-1-linear-algebra",
      "title": "Linear Algebra for Machine Learning: The Language of Data",
      "readTime": "25 min read",
      "date": "June 5, 2026",
      "excerpt": "Vectors, matrices, dot products, eigenvalues, and SVD — explained with Python code and real ML connections. This is the foundation everything else builds on.",
      "learningObjectives": [
        "Understand why data is represented as vectors and matrices",
        "Compute dot products and matrix multiplications by hand and in code",
        "Interpret eigenvalues and eigenvectors geometrically",
        "Apply SVD for dimensionality reduction (PCA preview)",
        "Connect every concept to actual ML algorithms"
      ]
    },
    {
      "partNumber": 2,
      "slug": "part-2-calculus-optimization",
      "title": "Calculus & Optimization: How Gradient Descent Actually Works",
      "readTime": "30 min read",
      "date": "June 12, 2026",
      "excerpt": "Derivatives, partial derivatives, the chain rule, and gradient descent — from first principles to training your first neural network.",
      "learningObjectives": [
        "Compute derivatives of common functions (polynomials, exponentials, logs)",
        "Understand partial derivatives and the gradient vector",
        "Apply the chain rule for backpropagation",
        "Implement gradient descent from scratch in Python",
        "Debug convergence issues (learning rate, local minima)"
      ]
    },
    {
      "partNumber": 3,
      "slug": "part-3-probability-information",
      "title": "Probability & Information Theory: The Math Behind Loss Functions",
      "readTime": "28 min read",
      "date": "June 19, 2026",
      "excerpt": "Bayes' theorem, probability distributions, expectation, MLE, entropy, and cross-entropy — the statistical toolkit every ML engineer needs.",
      "learningObjectives": [
        "Apply Bayes' theorem for classification problems",
        "Work with common distributions (Gaussian, Bernoulli, Multinomial)",
        "Estimate parameters using Maximum Likelihood Estimation",
        "Understand entropy as a measure of uncertainty",
        "Derive cross-entropy as the standard classification loss"
      ]
    },
    {
      "partNumber": 4,
      "slug": "part-4-ml-pipeline",
      "title": "The ML Pipeline: From Raw Data to Trained Model",
      "readTime": "22 min read",
      "date": "June 26, 2026",
      "excerpt": "Data preprocessing, feature engineering, algorithm selection, training, evaluation, and deployment — the complete workflow that ties everything together.",
      "learningObjectives": [
        "Preprocess data: normalization, encoding, missing values",
        "Understand the ML taxonomy: supervised, unsupervised, reinforcement",
        "Select the right algorithm for your problem",
        "Evaluate models using proper metrics and validation",
        "Build an end-to-end pipeline in scikit-learn"
      ]
    }
  ]
};

export default seriesData;