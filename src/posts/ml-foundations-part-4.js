const post = {
  "slug": "part-4-ml-pipeline",
  "seriesSlug": "ml-foundations",
  "partNumber": 4,
  "totalParts": 4,
  "title": "The ML Pipeline: From Raw Data to Trained Model (Part 4)",
  "seriesTitle": "ML Foundations: The Zero-Restart Series",
  "date": "June 26, 2026",
  "readTime": "22 min read",
  "category": "Machine Learning",
  "categoryColor": "#10b981",
  "excerpt": "Complete pipeline: data loading, preprocessing, feature engineering, model selection (linear regression vs random forest), evaluation, and prediction API. Uses all four parts. No scikit-learn — pure Python and NumPy.",
  "coverEmoji": "🏗️",
  "tags": [
    "ML Pipeline",
    "Feature Engineering",
    "Random Forest",
    "Model Evaluation",
    "Deployment",
    "Python"
  ],
  "content": [
    {
      "type": "intro",
      "text": "You have learned linear algebra, calculus, and probability. Now it is time to use them. The ML pipeline is the complete workflow that transforms raw data into a deployed model: data loading, cleaning, feature engineering, model selection, training, evaluation, and deployment. This is what separates students who know theory from engineers who ship products. This guide builds a complete end-to-end house price predictor using only NumPy and Python — no scikit-learn, no black boxes. Every line of code is visible, every decision is explained, and every concept from Parts 1-3 is applied."
    },
    {
      "type": "h2",
      "text": "Why the Pipeline Matters"
    },
    {
  "type": "image",
  "src": "/images/roadmaps/ml-pipeline.png",
  "alt": "End-to-End ML Pipeline diagram showing 7 stages",
  "caption": "The pipeline we will build in this guide — from raw data to deployed API"
},
    
    {
      "type": "p",
      "text": "Kaggle competitions are won by feature engineering, not by using the latest architecture. Production models fail because of data drift, not because the algorithm is wrong. The pipeline is where theory meets reality. A model is only as good as the data that feeds it, the features that represent it, and the evaluation that validates it. Understanding the pipeline means you can debug failures, improve performance, and deploy with confidence."
    },
    {
      "type": "checklist",
      "items": [
        "80% of a data scientist's time is spent on data cleaning and feature engineering. Only 20% is model training.",
        "A simple model with great features often beats a complex model with poor features. Feature engineering is the leverage point.",
        "Evaluation metrics must match business goals. Accuracy is meaningless for imbalanced data. ROC-AUC is better but still imperfect.",
        "Data leakage — using future information to predict the past — is the most common mistake in ML competitions and production systems.",
        "Deployment is not the end. Models drift as data distributions change. Monitoring and retraining are part of the pipeline."
      ]
    },
    {
      "type": "h2",
      "text": "The Five Stages of the Pipeline"
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Data Ingestion & Exploration",
          "text": "Load raw data. Understand distributions. Identify missing values, outliers, and data types. Visualize relationships. This is discovery — you cannot model what you do not understand."
        },
        {
          "num": "2",
          "title": "Preprocessing & Cleaning",
          "text": "Handle missing values (imputation or deletion). Remove or cap outliers. Encode categorical variables. Normalize or standardize numerical features. Split into train/validation/test sets."
        },
        {
          "num": "3",
          "title": "Feature Engineering",
          "text": "Create new features from existing ones. Transform skewed distributions. Select the most informative features. Reduce dimensionality if needed. This is where domain knowledge shines."
        },
        {
          "num": "4",
          "title": "Model Selection & Training",
          "text": "Choose candidate algorithms. Train on the training set. Tune hyperparameters using cross-validation. Compare models on the validation set. Select the best performer."
        },
        {
          "num": "5",
          "title": "Evaluation & Deployment",
          "text": "Evaluate the final model on the held-out test set. Report metrics with confidence intervals. Serialize the model. Build a prediction API. Monitor performance in production. Retrain when drift is detected."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Stage 1: Data Ingestion & Exploration"
    },
    {
      "type": "p",
      "text": "Before touching a model, you must understand your data. What are the features? What are their distributions? Are there missing values? Are features correlated? This stage is pure exploration — no modeling, no predictions. Just questions and visualizations. The goal is to build intuition about what the data contains and what challenges you will face."
    },
    {
      "type": "code-block",
      "label": "Data Exploration",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# === GENERATE SYNTHETIC HOUSE DATA ===\n# We create realistic data so you can run this anywhere without downloading files\nnp.random.seed(42)\nn_samples = 1000\n\n# Features:\n# - sqft: square footage, normal around 2000\n# - bedrooms: 1-5, correlated with sqft\n# - bathrooms: 1-3, correlated with bedrooms\n# - age: years old, 0-100\n# - distance_to_city: miles from city center, 1-30\n# - has_garage: 0 or 1\n# - neighborhood_quality: 1-10\n\nsqft = np.random.normal(2000, 500, n_samples).astype(int)\nsqft = np.clip(sqft, 500, 5000)\n\nbedrooms = np.clip((sqft / 500 + np.random.normal(0, 0.5, n_samples)).astype(int), 1, 5)\nbathrooms = np.clip((bedrooms * 0.7 + np.random.normal(0, 0.3, n_samples)).astype(int), 1, 3)\n\nage = np.random.exponential(20, n_samples).astype(int)\nage = np.clip(age, 0, 100)\n\ndistance_to_city = np.random.exponential(8, n_samples)\ndistance_to_city = np.clip(distance_to_city, 1, 30)\n\nhas_garage = np.random.choice([0, 1], size=n_samples, p=[0.3, 0.7])\n\nneighborhood_quality = np.clip((np.random.normal(6, 2, n_samples)).astype(int), 1, 10)\n\n# Target: house price (in $1000s)\n# Price = base + sqft*0.1 + bedrooms*15 + bathrooms*20 - age*0.5 - distance*2 + garage*25 + quality*10 + noise\nprice = (50 + sqft*0.08 + bedrooms*12 + bathrooms*18 - age*0.4 - distance_to_city*1.8 +\n         has_garage*22 + neighborhood_quality*8 + np.random.normal(0, 15, n_samples))\nprice = np.clip(price, 50, 800)\n\n# Stack into design matrix X and target y\nX = np.column_stack([sqft, bedrooms, bathrooms, age, distance_to_city, has_garage, neighborhood_quality])\nfeature_names = ['sqft', 'bedrooms', 'bathrooms', 'age', 'distance_to_city', 'has_garage', 'neighborhood_quality']\ny = price\n\nprint(f'Dataset shape: {X.shape}')\nprint(f'Features: {feature_names}')\nprint(f'Target range: ${y.min():.0f}k - ${y.max():.0f}k')\nprint(f'Mean price: ${y.mean():.0f}k')\n\n# === EXPLORATION: SUMMARY STATISTICS ===\nprint(f'\\n=== Feature Statistics ===')\nfor i, name in enumerate(feature_names):\n    print(f'{name:25s}: mean={X[:,i].mean():8.2f}, std={X[:,i].std():7.2f}, min={X[:,i].min():6.1f}, max={X[:,i].max():6.1f}')\n\n# === VISUALIZATION ===\nfig, axes = plt.subplots(2, 4, figsize=(16, 8))\naxes = axes.flatten()\n\nfor i, name in enumerate(feature_names):\n    axes[i].hist(X[:, i], bins=30, alpha=0.7, color='steelblue', edgecolor='black')\n    axes[i].set_title(f'{name}')\n    axes[i].set_xlabel('Value')\n    axes[i].set_ylabel('Count')\n    axes[i].grid(True, alpha=0.3)\n\naxes[-1].hist(y, bins=30, alpha=0.7, color='green', edgecolor='black')\naxes[-1].set_title('Price Distribution')\naxes[-1].set_xlabel('Price ($1000s)')\naxes[-1].set_ylabel('Count')\naxes[-1].grid(True, alpha=0.3)\n\nplt.tight_layout()\nplt.show()\n\n# === CORRELATION MATRIX ===\n# Compute correlation between features and target\nall_data = np.column_stack([X, y])\nall_names = feature_names + ['price']\n\n# Pearson correlation\nn = len(all_data)\nmean_all = np.mean(all_data, axis=0)\nstd_all = np.std(all_data, axis=0)\ncorr = np.corrcoef(all_data.T)\n\nprint(f'\\n=== Correlation with Price ===')\nfor i, name in enumerate(feature_names):\n    print(f'{name:25s}: r = {corr[i, -1]:6.3f}')\n\n# Visualize correlation matrix\nplt.figure(figsize=(8, 6))\nim = plt.imshow(corr, cmap='coolwarm', vmin=-1, vmax=1)\nplt.colorbar(im, label='Correlation')\nplt.xticks(range(len(all_names)), all_names, rotation=45, ha='right')\nplt.yticks(range(len(all_names)), all_names)\nplt.title('Feature Correlation Matrix')\n\n# Add text annotations\nfor i in range(len(all_names)):\n    for j in range(len(all_names)):\n        plt.text(j, i, f'{corr[i,j]:.2f}', ha='center', va='center',\n                color='white' if abs(corr[i,j]) > 0.5 else 'black', fontsize=8)\nplt.tight_layout()\nplt.show()\n\n# Key insight: sqft and bedrooms are highly correlated (multicollinearity).\n# Distance and age are negatively correlated with price.\n# Neighborhood quality and garage are strong positive predictors."
    },
    {
      "type": "h2",
      "text": "Stage 2: Preprocessing & Cleaning"
    },
    {
      "type": "p",
      "text": "Raw data is never clean. Missing values, outliers, inconsistent scales, and categorical variables must be handled before modeling. Preprocessing is not a mechanical step — it is a modeling decision. How you handle missing values affects what the model learns. How you scale features affects gradient descent convergence. How you encode categories affects the model's ability to generalize."
    },
    {
      "type": "code-block",
      "label": "Preprocessing Pipeline",
      "code": "import numpy as np\n\n# === TRAIN / VALIDATION / TEST SPLIT ===\n# Never evaluate on training data. Always hold out a test set.\n# Typical split: 70% train, 15% validation, 15% test\n\nnp.random.seed(42)\nn = len(X)\nindices = np.random.permutation(n)\n\ntrain_end = int(0.7 * n)\nval_end = int(0.85 * n)\n\ntrain_idx = indices[:train_end]\nval_idx = indices[train_end:val_end]\ntest_idx = indices[val_end:]\n\nX_train, y_train = X[train_idx], y[train_idx]\nX_val, y_val = X[val_idx], y[val_idx]\nX_test, y_test = X[test_idx], y[test_idx]\n\nprint(f'Split sizes: train={len(X_train)}, val={len(X_val)}, test={len(X_test)}')\n\n# === MISSING VALUE HANDLING ===\n# Simulate missing values in age (5% missing)\nmissing_mask = np.random.random(len(X_train)) < 0.05\nX_train_missing = X_train.copy().astype(float)\nX_train_missing[missing_mask, 3] = np.nan  # age column\n\n# Strategy: impute with median (robust to outliers)\nmedian_age = np.nanmedian(X_train_missing[:, 3])\nX_train_imputed = X_train_missing.copy()\nX_train_imputed[np.isnan(X_train_imputed[:, 3]), 3] = median_age\n\nprint(f'\\nMissing values imputed: {missing_mask.sum()} ages → median={median_age:.1f}')\n\n# === OUTLIER DETECTION & CAPPING ===\n# Use IQR method: values beyond 1.5*IQR are outliers\ndef cap_outliers(data, column_idx, lower_q=0.01, upper_q=0.99):\n    lower = np.quantile(data[:, column_idx], lower_q)\n    upper = np.quantile(data[:, column_idx], upper_q)\n    data[:, column_idx] = np.clip(data[:, column_idx], lower, upper)\n    return data, lower, upper\n\nX_train_clean = X_train_imputed.copy()\nfor i in [0, 3, 4]:  # cap sqft, age, distance\n    X_train_clean, lo, hi = cap_outliers(X_train_clean, i)\n    print(f'Capped {feature_names[i]}: [{lo:.1f}, {hi:.1f}]')\n\n# === FEATURE SCALING ===\n# Standardization: (x - mean) / std\n# Critical for gradient descent convergence (Part 2) and distance-based algorithms\n\n# Compute statistics from TRAINING data only (prevent data leakage)\nmeans = np.mean(X_train_clean, axis=0)\nstds = np.std(X_train_clean, axis=0)\nstds[stds == 0] = 1  # avoid division by zero\n\nX_train_scaled = (X_train_clean - means) / stds\nX_val_scaled = (X_val - means) / stds\nX_test_scaled = (X_test - means) / stds\n\nprint(f'\\nStandardization complete.')\nprint(f'  Train mean after scaling: {X_train_scaled.mean(axis=0).round(3)}')\nprint(f'  Train std after scaling:  {X_train_scaled.std(axis=0).round(3)}')\n\n# === ML CONNECTION: Why Scaling Matters ===\n# Without scaling: sqft (2000) dominates age (20) by 100x in gradient updates.\n# With scaling: all features contribute equally to the loss landscape.\n# This is why Part 2's gradient descent converges faster on normalized data.\n#\n# Also: distance_to_city has exponential distribution (right-skewed).\n# Log-transform: np.log1p(distance) makes it more Gaussian.\n# This improves linear model performance.\n\nX_train_log = X_train_scaled.copy()\nX_train_log[:, 4] = np.log1p(X_train_clean[:, 4])  # log-transform distance\nX_val_log = X_val_scaled.copy()\nX_val_log[:, 4] = np.log1p(X_val[:, 4])\nX_test_log = X_test_scaled.copy()\nX_test_log[:, 4] = np.log1p(X_test[:, 4])\n\n# Re-standardize after log transform\nmeans_log = np.mean(X_train_log, axis=0)\nstds_log = np.std(X_train_log, axis=0)\nstds_log[stds_log == 0] = 1\n\nX_train_final = (X_train_log - means_log) / stds_log\nX_val_final = (X_val_log - means_log) / stds_log\nX_test_final = (X_test_log - means_log) / stds_log\n\nprint(f'\\nLog-transformed and re-standardized distance_to_city.')\nprint(f'  Final train shape: {X_train_final.shape}')\n\n# Key insight: preprocessing decisions are hyperparameters.\n# Try different strategies and validate which improves model performance."
    },
    {
      "type": "h2",
      "text": "Stage 3: Feature Engineering"
    },
    {
      "type": "p",
      "text": "Feature engineering is the art of creating new features from existing ones. A feature is a representation of the data that makes patterns easier for the model to learn. Good features capture domain knowledge. Great features capture non-linear relationships that the model would otherwise miss. In this stage, we create interaction features, polynomial features, and ratio features that capture the domain intuition that house value depends on combinations of attributes, not just individual attributes."
    },
    {
      "type": "code-block",
      "label": "Feature Engineering",
      "code": "import numpy as np\n\n# === DOMAIN-KNOWLEDGE FEATURES ===\n# 1. Price per sqft: captures efficiency of space usage\n# 2. Rooms per sqft: captures spaciousness\n# 3. Age category: new (0-5), modern (6-20), old (21-50), vintage (50+)\n# 4. Distance category: urban (0-5), suburban (6-15), rural (15+)\n# 5. Total rooms: bedrooms + bathrooms\n# 6. Luxury score: garage + quality + (1 if sqft > 3000 else 0)\n\ndef engineer_features(X_raw, X_scaled):\n    n = len(X_raw)\n    new_features = []\n    new_names = []\n    \n    # 1. Price per sqft (we will use this as a derived feature for prediction,\n    # but in practice you cannot use the target. Here we simulate knowing\n    # market price per sqft from comparable sales.)\n    # For this demo, we compute sqft efficiency: sqft / (bedrooms + 1)\n    sqft_efficiency = X_raw[:, 0] / (X_raw[:, 1] + 1)\n    new_features.append(sqft_efficiency)\n    new_names.append('sqft_per_room')\n    \n    # 2. Total rooms\n    total_rooms = X_raw[:, 1] + X_raw[:, 2]\n    new_features.append(total_rooms)\n    new_names.append('total_rooms')\n    \n    # 3. Age category (one-hot encoded manually)\n    age_new = (X_raw[:, 3] <= 5).astype(float)\n    age_modern = ((X_raw[:, 3] > 5) & (X_raw[:, 3] <= 20)).astype(float)\n    age_old = ((X_raw[:, 3] > 20) & (X_raw[:, 3] <= 50)).astype(float)\n    age_vintage = (X_raw[:, 3] > 50).astype(float)\n    new_features.extend([age_new, age_modern, age_old, age_vintage])\n    new_names.extend(['age_new', 'age_modern', 'age_old', 'age_vintage'])\n    \n    # 4. Distance category\n    dist_urban = (X_raw[:, 4] <= 5).astype(float)\n    dist_suburban = ((X_raw[:, 4] > 5) & (X_raw[:, 4] <= 15)).astype(float)\n    dist_rural = (X_raw[:, 4] > 15).astype(float)\n    new_features.extend([dist_urban, dist_suburban, dist_rural])\n    new_names.extend(['dist_urban', 'dist_suburban', 'dist_rural'])\n    \n    # 5. Luxury score\n    luxury = X_raw[:, 5] + X_raw[:, 6] / 10 + (X_raw[:, 0] > 3000).astype(float)\n    new_features.append(luxury)\n    new_names.append('luxury_score')\n    \n    # 6. Interaction: sqft * quality\n    sqft_quality = X_scaled[:, 0] * X_scaled[:, 6]\n    new_features.append(sqft_quality)\n    new_names.append('sqft_x_quality')\n    \n    # 7. Polynomial: sqft squared (captures non-linear price growth)\n    sqft_sq = X_scaled[:, 0] ** 2\n    new_features.append(sqft_sq)\n    new_names.append('sqft_squared')\n    \n    new_features = np.column_stack(new_features)\n    return new_features, new_names\n\n# Engineer features for all splits\nX_train_eng, eng_names = engineer_features(X_train_clean, X_train_final)\nX_val_eng, _ = engineer_features(X_val, X_val_final)\nX_test_eng, _ = engineer_features(X_test, X_test_final)\n\n# Combine original scaled + engineered features\nX_train_full = np.column_stack([X_train_final, X_train_eng])\nX_val_full = np.column_stack([X_val_final, X_val_eng])\nX_test_full = np.column_stack([X_test_final, X_test_eng])\n\nall_feature_names = feature_names + eng_names\n\nprint(f'Engineered features: {eng_names}')\nprint(f'Total features: {X_train_full.shape[1]}')\nprint(f'Feature names: {all_feature_names}')\n\n# === FEATURE SELECTION: CORRELATION WITH TARGET ===\n# Select top features by absolute correlation with price\ncorrelations = []\nfor i in range(X_train_full.shape[1]):\n    r = np.corrcoef(X_train_full[:, i], y_train)[0, 1]\n    correlations.append((abs(r), r, all_feature_names[i]))\n\ncorrelations.sort(reverse=True)\nprint(f'\\n=== Top 10 Features by Correlation ===')\nfor abs_r, r, name in correlations[:10]:\n    print(f'  {name:20s}: r = {r:6.3f}')\n\n# Select top 12 features (balance between information and overfitting)\ntop_k = 12\nselected_indices = [all_feature_names.index(name) for _, _, name in correlations[:top_k]]\nX_train_select = X_train_full[:, selected_indices]\nX_val_select = X_val_full[:, selected_indices]\nX_test_select = X_test_full[:, selected_indices]\nselected_names = [all_feature_names[i] for i in selected_indices]\n\nprint(f'\\nSelected {top_k} features: {selected_names}')\n\n# Key insight: feature engineering is iterative.\n# Create features → train model → analyze residuals → create more features → repeat.\n# The best features come from understanding the domain, not from algorithms."
    },
    {
      "type": "h2",
      "text": "Stage 4: Model Selection & Training"
    },
    {
      "type": "p",
      "text": "With clean data and engineered features, we train models. We compare two approaches: linear regression (using Part 1's matrix algebra and Part 2's gradient descent) and a random forest-style ensemble (using bootstrap aggregation). We evaluate on the validation set and select the best model. No black boxes — every algorithm is implemented from scratch using only NumPy."
    },
    {
      "type": "code-block",
      "label": "Linear Regression & Random Forest from Scratch",
      "code": "import numpy as np\n\n# === MODEL 1: LINEAR REGRESSION (Normal Equation) ===\n# From Part 1: w = (X^T X)^-1 X^T y\n# This is the exact MLE solution. No gradient descent needed.\n\n# Add bias column (column of 1s)\nX_train_lr = np.column_stack([np.ones(len(X_train_select)), X_train_select])\nX_val_lr = np.column_stack([np.ones(len(X_val_select)), X_val_select])\nX_test_lr = np.column_stack([np.ones(len(X_test_select)), X_test_select])\n\n# Normal equation\n# w = (X^T X)^-1 X^T y\nXtX = X_train_lr.T @ X_train_lr\nXty = X_train_lr.T @ y_train\n\n# Use pseudo-inverse for numerical stability (handles multicollinearity)\nw_lr = np.linalg.pinv(XtX) @ Xty\n\n# Predictions\ny_pred_train_lr = X_train_lr @ w_lr\ny_pred_val_lr = X_val_lr @ w_lr\n\ndef rmse(y_true, y_pred):\n    return np.sqrt(np.mean((y_true - y_pred)**2))\n\ndef mae(y_true, y_pred):\n    return np.mean(np.abs(y_true - y_pred))\n\ndef r2(y_true, y_pred):\n    ss_res = np.sum((y_true - y_pred)**2)\n    ss_tot = np.sum((y_true - np.mean(y_true))**2)\n    return 1 - ss_res / ss_tot\n\nprint(f'=== Linear Regression ===')\nprint(f'  Train RMSE: ${rmse(y_train, y_pred_train_lr):.1f}k')\nprint(f'  Val RMSE:   ${rmse(y_val, y_pred_val_lr):.1f}k')\nprint(f'  Val MAE:    ${mae(y_val, y_pred_val_lr):.1f}k')\nprint(f'  Val R²:     {r2(y_val, y_pred_val_lr):.3f}')\n\n# Feature importance (weights)\nprint(f'\\n  Feature weights:')\nfor i, name in enumerate(['bias'] + selected_names):\n    print(f'    {name:20s}: {w_lr[i]:8.3f}')\n\n# === MODEL 2: DECISION TREE (simplified, for ensemble) ===\nclass DecisionTree:\n    def __init__(self, max_depth=5, min_samples_split=10):\n        self.max_depth = max_depth\n        self.min_samples_split = min_samples_split\n        self.tree = None\n    \n    def _mse(self, y):\n        return np.mean((y - np.mean(y))**2) if len(y) > 0 else 0\n    \n    def _split(self, X, y, feature_idx, threshold):\n        left_mask = X[:, feature_idx] <= threshold\n        right_mask = ~left_mask\n        return X[left_mask], y[left_mask], X[right_mask], y[right_mask]\n    \n    def _best_split(self, X, y):\n        best_gain = -np.inf\n        best_feature = None\n        best_threshold = None\n        best_splits = None\n        \n        parent_mse = self._mse(y)\n        n = len(y)\n        \n        for feature_idx in range(X.shape[1]):\n            thresholds = np.percentile(X[:, feature_idx], [25, 50, 75])\n            for threshold in thresholds:\n                X_left, y_left, X_right, y_right = self._split(X, y, feature_idx, threshold)\n                if len(y_left) < self.min_samples_split or len(y_right) < self.min_samples_split:\n                    continue\n                \n                gain = parent_mse - (len(y_left)/n * self._mse(y_left) + len(y_right)/n * self._mse(y_right))\n                if gain > best_gain:\n                    best_gain = gain\n                    best_feature = feature_idx\n                    best_threshold = threshold\n                    best_splits = (X_left, y_left, X_right, y_right)\n        \n        return best_feature, best_threshold, best_splits, best_gain\n    \n    def _build_tree(self, X, y, depth=0):\n        if depth >= self.max_depth or len(y) < self.min_samples_split or np.std(y) < 1:\n            return {'value': np.mean(y), 'is_leaf': True}\n        \n        feature, threshold, splits, gain = self._best_split(X, y)\n        if feature is None or gain <= 0:\n            return {'value': np.mean(y), 'is_leaf': True}\n        \n        X_left, y_left, X_right, y_right = splits\n        return {\n            'feature': feature,\n            'threshold': threshold,\n            'left': self._build_tree(X_left, y_left, depth + 1),\n            'right': self._build_tree(X_right, y_right, depth + 1),\n            'is_leaf': False\n        }\n    \n    def fit(self, X, y):\n        self.tree = self._build_tree(X, y)\n        return self\n    \n    def _predict_one(self, x, node):\n        if node['is_leaf']:\n            return node['value']\n        if x[node['feature']] <= node['threshold']:\n            return self._predict_one(x, node['left'])\n        return self._predict_one(x, node['right'])\n    \n    def predict(self, X):\n        return np.array([self._predict_one(x, self.tree) for x in X])\n\n# === MODEL 3: RANDOM FOREST (Bootstrap Aggregation) ===\nclass RandomForest:\n    def __init__(self, n_trees=20, max_depth=5, min_samples_split=10, max_features='sqrt'):\n        self.n_trees = n_trees\n        self.max_depth = max_depth\n        self.min_samples_split = min_samples_split\n        self.max_features = max_features\n        self.trees = []\n        self.feature_indices = []\n    \n    def fit(self, X, y):\n        n_samples, n_features = X.shape\n        n_features_per_tree = int(np.sqrt(n_features)) if self.max_features == 'sqrt' else n_features\n        \n        for _ in range(self.n_trees):\n            # Bootstrap sample\n            indices = np.random.choice(n_samples, size=n_samples, replace=True)\n            X_boot = X[indices]\n            y_boot = y[indices]\n            \n            # Random feature subset\n            feature_idx = np.random.choice(n_features, size=n_features_per_tree, replace=False)\n            X_boot_subset = X_boot[:, feature_idx]\n            \n            tree = DecisionTree(max_depth=self.max_depth, min_samples_split=self.min_samples_split)\n            tree.fit(X_boot_subset, y_boot)\n            \n            self.trees.append(tree)\n            self.feature_indices.append(feature_idx)\n        \n        return self\n    \n    def predict(self, X):\n        predictions = []\n        for tree, feature_idx in zip(self.trees, self.feature_indices):\n            pred = tree.predict(X[:, feature_idx])\n            predictions.append(pred)\n        return np.mean(predictions, axis=0)\n\n# Train Random Forest\nrf = RandomForest(n_trees=30, max_depth=6, min_samples_split=5)\nrf.fit(X_train_select, y_train)\n\ny_pred_train_rf = rf.predict(X_train_select)\ny_pred_val_rf = rf.predict(X_val_select)\n\nprint(f'\\n=== Random Forest ===')\nprint(f'  Train RMSE: ${rmse(y_train, y_pred_train_rf):.1f}k')\nprint(f'  Val RMSE:   ${rmse(y_val, y_pred_val_rf):.1f}k')\nprint(f'  Val MAE:    ${mae(y_val, y_pred_val_rf):.1f}k')\nprint(f'  Val R²:     {r2(y_val, y_pred_val_rf):.3f}')\n\n# === MODEL COMPARISON ===\nprint(f'\\n=== Model Comparison (Validation Set) ===')\nprint(f'  {'Metric':15s} {'Linear Reg':12s} {'Random Forest':15s}')\nprint(f'  {'-'*15} {'-'*12} {'-'*15}')\nprint(f'  {'RMSE ($k)':15s} {rmse(y_val, y_pred_val_lr):12.1f} {rmse(y_val, y_pred_val_rf):15.1f}')\nprint(f'  {'MAE ($k)':15s} {mae(y_val, y_pred_val_lr):12.1f} {mae(y_val, y_pred_val_rf):15.1f}')\nprint(f'  {'R²':15s} {r2(y_val, y_pred_val_lr):12.3f} {r2(y_val, y_pred_val_rf):15.3f}')\n\n# Key insight: Random Forest wins when relationships are non-linear.\n# Linear Regression wins when you need interpretability (weights tell the story).\n# Always validate on held-out data. Never trust training metrics."
    },
    {
      "type": "h2",
      "text": "Stage 5: Evaluation & Deployment"
    },
    {
      "type": "p",
      "text": "The final model is evaluated on the test set — data that has never been seen during training or validation. This gives an unbiased estimate of real-world performance. We report metrics, analyze residuals, and build a prediction API. The model is then serialized for deployment. In production, predictions are served via an API, and performance is monitored for data drift."
    },
    {
      "type": "code-block",
      "label": "Final Evaluation & Prediction API",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# === FINAL EVALUATION ON TEST SET ===\n# Use the winning model (Random Forest in this case)\ny_pred_test = rf.predict(X_test_select)\n\nprint(f'=== Final Test Set Evaluation ===')\nprint(f'  RMSE: ${rmse(y_test, y_pred_test):.1f}k')\nprint(f'  MAE:  ${mae(y_test, y_pred_test):.1f}k')\nprint(f'  R²:   {r2(y_test, y_pred_test):.3f}')\nprint(f'  \\n  Interpretation: On average, predictions are off by ${mae(y_test, y_pred_test):.1f}k.')\nprint(f'  The model explains {r2(y_test, y_pred_test)*100:.1f}% of price variance.')\n\n# === RESIDUAL ANALYSIS ===\n# Residuals = actual - predicted\n# Good model: residuals are randomly scattered around 0, no patterns\n# Bad model: residuals show structure (e.g., always underpredicting expensive houses)\n\nresiduals = y_test - y_pred_test\n\nfig, axes = plt.subplots(2, 2, figsize=(12, 10))\n\n# Residuals vs Predicted\naxes[0, 0].scatter(y_pred_test, residuals, alpha=0.5, color='steelblue')\naxes[0, 0].axhline(0, color='red', linestyle='--')\naxes[0, 0].set_xlabel('Predicted Price ($1000s)')\naxes[0, 0].set_ylabel('Residual ($1000s)')\naxes[0, 0].set_title('Residuals vs Predicted')\naxes[0, 0].grid(True, alpha=0.3)\n\n# Residual distribution\naxes[0, 1].hist(residuals, bins=30, alpha=0.7, color='steelblue', edgecolor='black')\naxes[0, 1].axvline(0, color='red', linestyle='--')\naxes[0, 1].set_xlabel('Residual ($1000s)')\naxes[0, 1].set_ylabel('Count')\naxes[0, 1].set_title('Residual Distribution')\naxes[0, 1].grid(True, alpha=0.3)\n\n# Actual vs Predicted\naxes[1, 0].scatter(y_test, y_pred_test, alpha=0.5, color='steelblue')\nmin_price = min(y_test.min(), y_pred_test.min())\nmax_price = max(y_test.max(), y_pred_test.max())\naxes[1, 0].plot([min_price, max_price], [min_price, max_price], 'r--', linewidth=2, label='Perfect Prediction')\naxes[1, 0].set_xlabel('Actual Price ($1000s)')\naxes[1, 0].set_ylabel('Predicted Price ($1000s)')\naxes[1, 0].set_title('Actual vs Predicted')\naxes[1, 0].legend()\naxes[1, 0].grid(True, alpha=0.3)\n\n# Error by price range\nprice_ranges = ['<$200k', '$200-400k', '$400-600k', '>$600k']\nrange_errors = []\nfor low, high in [(0, 200), (200, 400), (400, 600), (600, 1000)]:\n    mask = (y_test >= low) & (y_test < high)\n    if mask.sum() > 0:\n        range_errors.append(mae(y_test[mask], y_pred_test[mask]))\n    else:\n        range_errors.append(0)\n\naxes[1, 1].bar(price_ranges, range_errors, color='steelblue', edgecolor='black')\naxes[1, 1].set_ylabel('MAE ($1000s)')\naxes[1, 1].set_title('Error by Price Range')\naxes[1, 1].grid(True, alpha=0.3, axis='y')\nplt.tight_layout()\nplt.show()\n\n# === PREDICTION API ===\nclass HousePricePredictor:\n    def __init__(self, model, means, stds, means_log, stds_log, selected_indices, feature_names):\n        self.model = model\n        self.means = means\n        self.stds = stds\n        self.means_log = means_log\n        self.stds_log = stds_log\n        self.selected_indices = selected_indices\n        self.feature_names = feature_names\n    \n    def preprocess(self, features_dict):\n        # Convert dict to array in correct order\n        raw = np.array([features_dict[name] for name in self.feature_names[:7]])\n        \n        # Scale\n        scaled = (raw - self.means) / self.stds\n        \n        # Log transform distance\n        scaled[4] = np.log1p(raw[4])\n        scaled = (scaled - self.means_log) / self.stds_log\n        \n        # Engineer features\n        eng = np.array([\n            raw[0] / (raw[1] + 1),  # sqft_per_room\n            raw[1] + raw[2],         # total_rooms\n            (raw[3] <= 5),           # age_new\n            ((raw[3] > 5) & (raw[3] <= 20)),  # age_modern\n            ((raw[3] > 20) & (raw[3] <= 50)), # age_old\n            (raw[3] > 50),           # age_vintage\n            (raw[4] <= 5),           # dist_urban\n            ((raw[4] > 5) & (raw[4] <= 15)),  # dist_suburban\n            (raw[4] > 15),           # dist_rural\n            raw[5] + raw[6]/10 + (raw[0] > 3000),  # luxury\n            scaled[0] * scaled[6],   # sqft_x_quality\n            scaled[0] ** 2           # sqft_squared\n        ])\n        \n        full = np.concatenate([scaled, eng])\n        return full[self.selected_indices]\n    \n    def predict(self, features_dict):\n        x = self.preprocess(features_dict)\n        return self.model.predict(x.reshape(1, -1))[0]\n\n# Create predictor instance\npredictor = HousePricePredictor(\n    rf, means, stds, means_log, stds_log, selected_indices, feature_names\n)\n\n# Example prediction\nhouse = {\n    'sqft': 2500,\n    'bedrooms': 4,\n    'bathrooms': 3,\n    'age': 10,\n    'distance_to_city': 8,\n    'has_garage': 1,\n    'neighborhood_quality': 8\n}\n\npredicted_price = predictor.predict(house)\nprint(f'\\n=== Prediction API Demo ===')\nprint(f'House: {house}')\nprint(f'Predicted price: ${predicted_price:.0f}k')\nprint(f'\\nAPI usage: predictor.predict(house_dict) → price in $1000s')\n\n# === SERIALIZATION ===\n# Save model parameters for deployment\nmodel_params = {\n    'means': means,\n    'stds': stds,\n    'means_log': means_log,\n    'stds_log': stds_log,\n    'selected_indices': selected_indices,\n    'feature_names': feature_names,\n    'selected_names': selected_names\n}\n\nprint(f'\\nModel serialized. {len(selected_indices)} features selected.')\nprint(f'Deployment ready: load params + model.predict()')\n\n# Key insight: the API is the interface between ML and the world.\n# Input validation, error handling, and logging are production requirements.\n# The model file should be versioned and reproducible."
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these to complete the series. 4/5 correct means you have mastered the ML Foundations pipeline."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: You have 10,000 samples and 50 features. You split 70/15/15. Your model gets R²=0.95 on training but R²=0.55 on validation. What is happening and what are three ways to fix it?",
        "Q2: Why do we standardize features BEFORE splitting, using only training statistics? What happens if we use the full dataset mean and std?",
        "Q3: Your Random Forest has 100 trees, max_depth=10. Training R²=0.99, test R²=0.60. The linear regression gets test R²=0.75. Which model should you deploy and why?",
        "Q4: A feature has correlation r=0.02 with the target. Should you drop it? What if dropping it increases validation RMSE by 5%?",
        "Q5: In the prediction API, why do we preprocess the input using training statistics, not the input's own statistics?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Severe overfitting. The model memorized training noise. Fixes: (1) Reduce model complexity — lower max_depth, fewer trees, or use linear regression. (2) Add regularization — L2 penalty on linear weights, or minimum samples per leaf in trees. (3) Get more data or reduce features — use only the top 10 correlated features. (4) Early stopping — stop training when validation loss stops improving. A2: Using full dataset statistics leaks information from the test set into the training preprocessing. The test set should be completely unseen. If you use full mean/std, the model indirectly knows about test set distribution. Always fit preprocessing on training data only, then apply the same transformation to validation and test. A3: Deploy the linear regression. The Random Forest is severely overfitting (0.99 vs 0.60). The linear model generalizes better (0.75). In production, generalization matters more than training performance. You could try reducing Random Forest complexity, but the linear model is the safer choice. A4: Keep it. Correlation measures linear relationship only. A feature with low correlation might have strong non-linear predictive power (e.g., age squared, or interaction with another feature). The 5% RMSE increase proves it contributes. Use feature importance from the trained model, not just correlation. A5: The model learned patterns from training data in the scaled space. If you preprocess a new input using its own statistics, the scaling is different and the model's learned weights no longer apply. Consistent preprocessing ensures the input enters the model in the same coordinate system it was trained on."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have built a complete machine learning pipeline from scratch. You loaded data, explored distributions, handled missing values, engineered features, trained two models, evaluated rigorously, and deployed a prediction API. Every step used concepts from Parts 1-3: linear algebra for the normal equation, calculus for gradient descent (in the linear regression), probability for maximum likelihood estimation, and information theory for understanding why certain features matter. This is the complete foundation. With this, you can read any ML paper, debug any training run, and build any model from scratch. The next step is Deep Learning — neural networks, backpropagation, CNNs, RNNs, and Transformers. But you already understand the math that powers them."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: The ML pipeline is not a sequence of black boxes. It is a sequence of decisions, each grounded in math and validated by data. Data exploration reveals structure. Preprocessing ensures fairness. Feature engineering captures domain knowledge. Model selection balances bias and variance. Evaluation measures real-world utility. Deployment closes the loop. You now have the complete foundation. Build something."
    }
  ]
};

export default post;
