const post = {
  "slug": "part-1-ml-foundations",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 1,
  "totalParts": 5,
  "title": "Introduction to Machine Learning & Data Preparation (Part 1)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "26 min read",
  "category": "Machine Learning",
  "categoryColor": "#f59e0b",
  "excerpt": "ML definition and life cycle, types of ML systems, scope and challenges, data visualization, hypothesis testing, pre-processing, augmentation, normalization, bias-variance tradeoff, and how AI, ML, DL and DS relate.",
  "coverEmoji": "🤖",
  "tags": [
    "Machine Learning",
    "Fundamentals",
    "Data Preprocessing",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Unit I is where every machine learning paper begins, and it is the unit students most often under-prepare because it looks 'easy' and theoretical. In reality it is the vocabulary for everything that follows: what ML is, how a project flows from data to deployment, how systems are classified, why models fail, and how data is cleaned and scaled before any algorithm sees it. This part gives you exam-ready definitions, comparison tables, and runnable scikit-learn code for every topic in the unit."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Explain the ML life cycle' (7 marks), 'Differentiate supervised and unsupervised learning' (5 marks), 'Explain batch vs online and instance-based vs model-based learning' (5-7 marks), 'Explain the bias-variance tradeoff' (5-7 marks), 'Relate AI, ML, DL and DS' (5 marks), and short notes on normalization, data augmentation or challenges of ML (3-5 marks)."
    },
    {
      "type": "h2",
      "text": "What is Machine Learning?"
    },
    {
      "type": "p",
      "text": "Machine learning is the field of study that gives computers the ability to learn from data without being explicitly programmed for every rule. Instead of a programmer writing 'if the email contains these words then it is spam', the system is shown thousands of labelled emails and discovers the pattern itself."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam-ready definition (Tom Mitchell, 1997): 'A computer program is said to learn from experience E with respect to some task T and performance measure P, if its performance on T, as measured by P, improves with experience E.' Example: T = classify emails, P = percentage classified correctly, E = a dataset of labelled emails."
    },
    {
      "type": "callout",
      "icon": "🍳",
      "text": "Real-life analogy: traditional programming is a chef following a written recipe exactly. Machine learning is a chef who tastes thousands of dishes with their ratings and works out the recipe on their own. Rules go in and answers come out in traditional programming; data and answers go in and the rules come out in ML."
    },
    {
      "type": "h2",
      "text": "Machine Learning Life Cycle"
    },
    {
      "type": "p",
      "text": "The ML life cycle is the end-to-end sequence of stages followed to build, ship and maintain an ML solution. It is iterative: results from a later stage frequently send you back to an earlier one."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/ml_lifecycle.png",
      "alt": "The Machine Learning Lifecycle",
      "caption": "The ML lifecycle: problem definition, data collection, preparation, model building, evaluation, deployment, monitoring and feedback loop"
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Problem definition",
          "text": "Translate the business need into an ML task (classification, regression, clustering) and decide the success metric."
        },
        {
          "num": "2",
          "title": "Data collection",
          "text": "Gather data from databases, sensors, APIs, web scraping or surveys. Data quantity and representativeness are decided here."
        },
        {
          "num": "3",
          "title": "Data preparation",
          "text": "Clean the data: handle missing values, remove duplicates and outliers, encode categories, scale features, split into train/validation/test."
        },
        {
          "num": "4",
          "title": "Exploratory analysis and visualization",
          "text": "Study distributions, correlations and class balance to understand the data and pick features."
        },
        {
          "num": "5",
          "title": "Model selection and training",
          "text": "Choose candidate algorithms, fit them on the training set, and let them learn parameters by minimizing a loss function."
        },
        {
          "num": "6",
          "title": "Evaluation and tuning",
          "text": "Measure performance on unseen validation/test data, tune hyperparameters, and diagnose over/underfitting."
        },
        {
          "num": "7",
          "title": "Deployment",
          "text": "Package the model as an API, app or batch job so real users or systems can use its predictions."
        },
        {
          "num": "8",
          "title": "Monitoring and maintenance",
          "text": "Track accuracy and data drift in production and retrain when performance decays."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common exam mistake: listing only 'collect data, train model, test model'. Examiners award marks per stage, so name at least six stages and write one line on each. Always include deployment and monitoring; most students forget them."
    },
    {
      "type": "h2",
      "text": "Types of Machine Learning Systems"
    },
    {
      "type": "p",
      "text": "ML systems are classified along three independent axes: whether they are trained with human supervision, whether they can learn incrementally, and how they generalize. A single system sits on all three axes at once, for example an online, model-based, supervised system."
    },
    {
      "type": "h2",
      "text": "Axis 1: Supervised vs Unsupervised Learning"
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Supervised Learning",
        "Unsupervised Learning"
      ],
      "rows": [
        [
          "Training data",
          "Labelled: every example has a known output",
          "Unlabelled: only inputs, no target"
        ],
        [
          "Goal",
          "Learn a mapping from input X to output y",
          "Discover hidden structure or groups in X"
        ],
        [
          "Main tasks",
          "Classification, regression",
          "Clustering, dimensionality reduction, association"
        ],
        [
          "Feedback",
          "Direct: error against the true label",
          "None: no ground truth to compare to"
        ],
        [
          "Examples of algorithms",
          "Linear/logistic regression, decision trees, SVM, k-NN",
          "K-means, hierarchical clustering, PCA, GMM"
        ],
        [
          "Example application",
          "Spam detection, house-price prediction",
          "Customer segmentation, anomaly detection"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Two more categories are worth a one-line mention in any answer. Semi-supervised learning uses a small amount of labelled data with a large amount of unlabelled data (for example photo tagging). Reinforcement learning has an agent that learns by taking actions in an environment and receiving rewards or penalties (for example game-playing and robotics)."
    },
    {
      "type": "h2",
      "text": "Axis 2: Batch vs Online Learning"
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Batch (Offline) Learning",
        "Online (Incremental) Learning"
      ],
      "rows": [
        [
          "How it trains",
          "On the full dataset at once",
          "Sequentially on single examples or mini-batches"
        ],
        [
          "Updating with new data",
          "Must retrain from scratch on old + new data",
          "Updates the model on the fly, old data can be discarded"
        ],
        [
          "Resources",
          "Heavy compute and memory, done offline",
          "Light, suits limited memory and streaming data"
        ],
        [
          "Adapts to change",
          "Slowly, only when retrained",
          "Quickly, key for changing environments such as stock prices"
        ],
        [
          "Key parameter",
          "Number of epochs",
          "Learning rate: how fast to adapt (high rate forgets old data quickly)"
        ],
        [
          "Risk",
          "Model ages ('model rot') between retrains",
          "Bad incoming data degrades the model quickly"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Axis 3: Instance-Based vs Model-Based Learning"
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Instance-Based Learning",
        "Model-Based Learning"
      ],
      "rows": [
        [
          "Idea",
          "Memorize the training examples, predict by similarity to stored ones",
          "Build a model with parameters from the data, predict using the model"
        ],
        [
          "Training",
          "Almost none (lazy learner)",
          "Real optimization step (eager learner)"
        ],
        [
          "Prediction",
          "Slow: compares against stored data each time",
          "Fast: just evaluate the learned function"
        ],
        [
          "Stores",
          "The whole training set",
          "Only the learned parameters"
        ],
        [
          "Examples",
          "k-NN, kernel methods",
          "Linear regression, logistic regression, neural networks"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Instance-Based (k-NN) vs Model-Based (Linear Regression)",
      "code": "import numpy as np\nfrom sklearn.neighbors import KNeighborsRegressor\nfrom sklearn.linear_model import LinearRegression\n\nX = np.array([[1], [2], [3], [4], [5], [6]])\ny = np.array([2.1, 4.0, 6.2, 7.9, 10.1, 12.2])\n\nknn = KNeighborsRegressor(n_neighbors=2).fit(X, y)   # instance-based: memorises the data\nlin = LinearRegression().fit(X, y)                   # model-based: learns parameters\n\nprint(\"k-NN   prediction for x=7:\", round(knn.predict([[7]])[0], 2))\nprint(\"Linear prediction for x=7:\", round(lin.predict([[7]])[0], 2))\nprint(\"Learned model: y = {:.2f}x + {:.2f}\".format(lin.coef_[0], lin.intercept_))\n# k-NN can only average nearby stored points, so it cannot extrapolate beyond x=6.\n# The linear model has learned the trend and extends it."
    },
    {
      "type": "h2",
      "text": "Scope and Limitations of Machine Learning"
    },
    {
      "type": "table",
      "headers": [
        "Scope (where ML works well)",
        "Limitations (where it struggles)"
      ],
      "rows": [
        [
          "Problems with no easy hand-written rules (speech, vision, translation)",
          "Needs large amounts of good-quality data"
        ],
        [
          "Tasks where rules change over time (fraud, spam)",
          "Cannot explain itself well: many models are black boxes"
        ],
        [
          "Finding patterns in huge data humans cannot inspect (recommendation, genomics)",
          "Learns correlation, not causation, and inherits bias present in data"
        ],
        [
          "Automating repetitive prediction and decision work",
          "Poor on situations unlike its training data (no common sense)"
        ],
        [
          "Personalization at scale",
          "Computationally expensive to train, and models need ongoing maintenance"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Challenges of Machine Learning"
    },
    {
      "type": "p",
      "text": "Two things can go wrong: 'bad data' and 'bad algorithm'. Remember these six as the standard answer."
    },
    {
      "type": "checklist",
      "items": [
        "Insufficient training data: most algorithms need thousands to millions of examples to generalize.",
        "Non-representative training data: if the sample does not reflect the real population (sampling bias), the model generalizes poorly.",
        "Poor-quality data: errors, outliers, noise and missing values hide the true pattern; cleaning often takes most of a project's time.",
        "Irrelevant features: 'garbage in, garbage out'. Feature selection and feature engineering are needed.",
        "Overfitting: the model memorizes noise in training data and fails on new data (high variance). Fix with more data, simpler model, regularization.",
        "Underfitting: the model is too simple to capture the pattern (high bias). Fix with a more powerful model, better features, less regularization."
      ]
    },
    {
      "type": "h2",
      "text": "Data Visualization"
    },
    {
      "type": "p",
      "text": "Data visualization is the graphical representation of data used to spot distributions, relationships, outliers and class imbalance before modelling. It is step one of understanding a dataset and is often asked as 'name and explain any four plots'."
    },
    {
      "type": "table",
      "headers": [
        "Plot",
        "Use",
        "What it reveals"
      ],
      "rows": [
        [
          "Histogram",
          "One numeric variable",
          "Distribution shape, skewness, outliers"
        ],
        [
          "Scatter plot",
          "Two numeric variables",
          "Correlation, clusters, non-linear patterns"
        ],
        [
          "Box plot",
          "Spread of a variable or across groups",
          "Median, quartiles, outliers"
        ],
        [
          "Heatmap",
          "Correlation matrix",
          "Which features move together"
        ],
        [
          "Bar chart",
          "Categorical counts",
          "Class balance"
        ],
        [
          "Pair plot",
          "All feature pairs at once",
          "Overall structure of a dataset"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Histogram, Scatter Plot and Box Plot on the Iris Dataset",
      "code": "import matplotlib.pyplot as plt\nfrom sklearn.datasets import load_iris\n\niris = load_iris(as_frame=True)\ndf = iris.frame\n\nfig, ax = plt.subplots(1, 3, figsize=(14, 4))\n\nax[0].hist(df[\"sepal length (cm)\"], bins=15, color=\"#f59e0b\")\nax[0].set_title(\"Histogram: sepal length\")\n\nax[1].scatter(df[\"petal length (cm)\"], df[\"petal width (cm)\"], c=df[\"target\"])\nax[1].set_title(\"Scatter: petal length vs width\")\nax[1].set_xlabel(\"petal length\"); ax[1].set_ylabel(\"petal width\")\n\nax[2].boxplot([df[col] for col in iris.feature_names])\nax[2].set_xticklabels([\"SL\", \"SW\", \"PL\", \"PW\"])\nax[2].set_title(\"Box plot of all features\")\n\nplt.tight_layout()\nplt.show()"
    },
    {
      "type": "h2",
      "text": "Hypothesis Function and Testing"
    },
    {
      "type": "p",
      "text": "In ML, a hypothesis is a candidate function h that maps inputs to predictions, and the hypothesis space is the set of all functions the algorithm is allowed to choose from. For simple linear regression the hypothesis function is hθ(x) = θ₀ + θ₁x, where θ₀ (intercept/bias) and θ₁ (slope/weight) are the parameters the algorithm learns. Learning means choosing the θ values that minimize a cost function, typically the mean squared error J(θ) = (1/2m) Σᵢ₌₁ᵐ (hθ(xᵢ) − yᵢ)²."
    },
    {
      "type": "p",
      "text": "'Testing a hypothesis' has two related meanings, and a good answer covers both. In ML evaluation, you test the learned hypothesis on data it never saw (a held-out test set) to estimate how well it generalizes. In statistics, hypothesis testing checks a claim about a population: you state a null hypothesis null hypothesis H₀ (no effect or no difference) and an alternative H₁, compute a test statistic and a p-value, and reject H₀ if the p-value is below the significance level α (commonly 0.05)."
    },
    {
      "type": "code-block",
      "label": "Learning a Hypothesis and Testing It on Unseen Data",
      "code": "import numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\nrng = np.random.default_rng(42)\nX = rng.uniform(0, 10, size=(100, 1))\ny = 3 * X[:, 0] + 5 + rng.normal(0, 1.5, size=100)   # true rule: y = 3x + 5 plus noise\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nmodel = LinearRegression().fit(X_train, y_train)\n\ntheta0, theta1 = model.intercept_, model.coef_[0]\nprint(f\"Learned hypothesis: h(x) = {theta0:.2f} + {theta1:.2f} * x\")\n\ndef h(x):\n    return theta0 + theta1 * x\n\nprint(\"h(4) =\", round(h(4), 2))\nprint(\"Train MSE:\", round(mean_squared_error(y_train, model.predict(X_train)), 3))\nprint(\"Test  MSE:\", round(mean_squared_error(y_test, model.predict(X_test)), 3))"
    },
    {
      "type": "code-block",
      "label": "Statistical Hypothesis Test (Two-Sample t-test)",
      "code": "import numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(0)\ngroup_a = rng.normal(70, 8, 40)    # marks with teaching method A\ngroup_b = rng.normal(75, 8, 40)    # marks with teaching method B\n\nt_stat, p_value = stats.ttest_ind(group_a, group_b)\nprint(\"t =\", round(t_stat, 3), \" p =\", round(p_value, 4))\n\nalpha = 0.05\nif p_value < alpha:\n    print(\"Reject H0: the two methods give significantly different marks.\")\nelse:\n    print(\"Fail to reject H0: no significant difference detected.\")"
    },
    {
      "type": "h2",
      "text": "Data Pre-processing"
    },
    {
      "type": "p",
      "text": "Data pre-processing is the set of steps that convert raw, messy data into a clean numeric form an algorithm can learn from. Real data is almost never ready to use, and this stage typically consumes the largest share of project time."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/datapreprocessing.png",
      "alt": "Machine Learning Data Preprocessing Pipeline",
      "caption": "Data preprocessing pipeline: collection, cleaning, transformation, feature engineering, feature selection and data splitting"
    },
    {
      "type": "table",
      "headers": [
        "Step",
        "Problem it solves",
        "Common techniques"
      ],
      "rows": [
        [
          "Handling missing values",
          "Empty cells break most algorithms",
          "Drop rows, fill with mean/median/mode, model-based imputation"
        ],
        [
          "Removing duplicates and noise",
          "Repeated or wrong records bias learning",
          "Deduplication, smoothing, validation rules"
        ],
        [
          "Outlier treatment",
          "Extreme values distort mean-based methods",
          "IQR rule, z-score, capping (winsorizing)"
        ],
        [
          "Encoding categorical data",
          "Algorithms need numbers, not text",
          "Label encoding, one-hot encoding"
        ],
        [
          "Feature scaling",
          "Different units dominate distance/gradient methods",
          "Min-max scaling, standardization"
        ],
        [
          "Feature selection / engineering",
          "Irrelevant or redundant features add noise",
          "Correlation filtering, PCA, domain-derived features"
        ],
        [
          "Splitting the data",
          "Need unbiased estimate of performance",
          "Train / validation / test split, cross-validation"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "A Complete Pre-processing Pipeline",
      "code": "import numpy as np\nimport pandas as pd\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\n\ndf = pd.DataFrame({\n    \"age\":    [25, 32, np.nan, 47, 51],\n    \"salary\": [30000, 48000, 52000, np.nan, 90000],\n    \"city\":   [\"Delhi\", \"Pune\", \"Delhi\", np.nan, \"Mumbai\"],\n})\n\nnumeric_pipe = Pipeline([\n    (\"impute\", SimpleImputer(strategy=\"median\")),\n    (\"scale\", StandardScaler()),\n])\ncategorical_pipe = Pipeline([\n    (\"impute\", SimpleImputer(strategy=\"most_frequent\")),\n    (\"onehot\", OneHotEncoder(handle_unknown=\"ignore\")),\n])\n\npre = ColumnTransformer([\n    (\"num\", numeric_pipe, [\"age\", \"salary\"]),\n    (\"cat\", categorical_pipe, [\"city\"]),\n])\n\nX = pre.fit_transform(df)\nX = X.toarray() if hasattr(X, \"toarray\") else X\nprint(\"Shape after processing:\", X.shape)\nprint(np.round(X, 2))"
    },
    {
      "type": "h2",
      "text": "Data Augmentation"
    },
    {
      "type": "p",
      "text": "Data augmentation artificially enlarges a training set by creating modified copies of existing examples, or synthetic new ones, that keep the same label. It reduces overfitting and improves robustness when collecting real data is expensive."
    },
    {
      "type": "table",
      "headers": [
        "Data type",
        "Typical augmentation techniques"
      ],
      "rows": [
        [
          "Images",
          "Flip, rotate, crop, zoom, shift, brightness/contrast change, add noise"
        ],
        [
          "Text",
          "Synonym replacement, random insertion or deletion, back-translation"
        ],
        [
          "Audio",
          "Time stretch, pitch shift, add background noise"
        ],
        [
          "Tabular / imbalanced",
          "SMOTE (synthetic minority over-sampling), adding small Gaussian noise, oversampling"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Simple Image Augmentation with NumPy",
      "code": "import numpy as np\n\nimg = np.arange(16).reshape(4, 4)          # a tiny 4x4 'image'\nprint(\"Original:\\n\", img)\n\nflipped  = np.fliplr(img)                  # horizontal flip\nrotated  = np.rot90(img)                   # 90-degree rotation\nrng = np.random.default_rng(0)\nnoisy = img + rng.normal(0, 0.5, img.shape)  # add Gaussian noise\n\nprint(\"Flipped:\\n\", flipped)\nprint(\"Rotated:\\n\", rotated)\nprint(\"Noisy:\\n\", np.round(noisy, 1))\n# One original image has become four training examples with the same label."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Key rule: augment only the training set, never the test set, and only use transformations that do not change the label (flipping a photo of a cat is fine; flipping the digit 6 vertically can make it a 9)."
    },
    {
      "type": "h2",
      "text": "Normalizing Data Sets"
    },
    {
      "type": "p",
      "text": "Normalization (feature scaling) brings features onto a comparable scale so that a feature measured in lakhs does not overpower one measured in single digits. It is essential for distance-based and gradient-based algorithms (k-NN, k-means, SVM, neural networks, PCA) and unnecessary for tree-based models."
    },
    {
      "type": "table",
      "headers": [
        "Method",
        "Formula",
        "Resulting range",
        "Use when"
      ],
      "rows": [
        [
          "Min-Max normalization",
          "x' = (x − min) / (max − min)",
          "[0, 1]",
          "No strong outliers; bounded input needed (neural networks, image pixels)"
        ],
        [
          "Z-score standardization",
          "x' = (x − μ) / σ",
          "Mean 0, std 1 (unbounded)",
          "Data roughly Gaussian or has outliers; SVM, PCA, linear models"
        ],
        [
          "Robust scaling",
          "x' = (x − median) / IQR",
          "Unbounded",
          "Many outliers"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Min-Max vs Z-score on Data with an Outlier",
      "code": "import numpy as np\nfrom sklearn.preprocessing import MinMaxScaler, StandardScaler\n\ndata = np.array([[10.0], [20.0], [30.0], [40.0], [100.0]])   # 100 is an outlier\n\nprint(\"Min-Max :\", MinMaxScaler().fit_transform(data).ravel().round(2))\nprint(\"Z-score :\", StandardScaler().fit_transform(data).ravel().round(2))\n# Min-max squeezes the four normal values into [0, 0.33] because of the outlier."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam point: fit the scaler on the training data only, then apply the same learned min/max or mean/std to the test data. Fitting on the full dataset leaks test information into training (data leakage)."
    },
    {
      "type": "h2",
      "text": "Bias-Variance Tradeoff"
    },
    {
      "type": "p",
      "text": "Bias is the error caused by wrong or overly simple assumptions in the model, which leads to underfitting. Variance is the error caused by excessive sensitivity to the particular training sample, which leads to overfitting. For squared error, the expected test error decomposes as: E[Test Error] = Bias² + Variance + Irreducible Noise."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/bias_variance.png",
      "alt": "The Bias-Variance Tradeoff",
      "caption": "Bullseye plots, the tradeoff curve and summary table for bias, variance, underfitting and overfitting"
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "High Bias (Underfitting)",
        "High Variance (Overfitting)"
      ],
      "rows": [
        [
          "Model complexity",
          "Too simple",
          "Too complex"
        ],
        [
          "Training error",
          "High",
          "Very low"
        ],
        [
          "Test error",
          "High",
          "High (large gap from training error)"
        ],
        [
          "Typical cause",
          "Linear model on curved data",
          "Deep tree or high-degree polynomial on small data"
        ],
        [
          "Remedy",
          "More features, more complex model",
          "More data, regularization, pruning, ensembling, simpler model"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "Real-life analogy: shooting at a target. High bias means all your shots cluster tightly but away from the bullseye (consistently wrong). High variance means your shots are scattered all around the bullseye (right on average, unreliable each time). The goal is the sweet spot: low bias and low variance. Increasing complexity lowers bias but raises variance, hence 'tradeoff'."
    },
    {
      "type": "code-block",
      "label": "Underfit, Good Fit and Overfit with Polynomial Regression",
      "code": "import numpy as np\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error\n\nrng = np.random.default_rng(1)\nX = np.sort(rng.uniform(0, 1, 60)).reshape(-1, 1)\ny = np.sin(2 * np.pi * X).ravel() + rng.normal(0, 0.25, 60)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=1)\n\nfor degree in (1, 4, 15):\n    model = make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(X_tr, y_tr)\n    tr = mean_squared_error(y_tr, model.predict(X_tr))\n    te = mean_squared_error(y_te, model.predict(X_te))\n    print(f\"degree={degree:2d}  train MSE={tr:.3f}  test MSE={te:.3f}\")\n# degree 1: both errors high (high bias). degree 15: train error tiny, test error larger (high variance)."
    },
    {
      "type": "h2",
      "text": "Relation between AI, ML, DL and Data Science"
    },
    {
      "type": "p",
      "text": "These four terms overlap but are not synonyms. Artificial Intelligence is the broad goal of making machines behave intelligently. Machine Learning is a subset of AI that achieves this by learning from data. Deep Learning is a subset of ML that uses multi-layer neural networks. Data Science is a separate, overlapping field that extracts insight from data using statistics, ML, visualization and domain knowledge."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/aimldl.png",
      "alt": "Hierarchical relationship of AI, ML and DL",
      "caption": "AI contains ML, which contains DL (Data Science overlaps all three)"
    },
    {
      "type": "table",
      "headers": [
        "Term",
        "What it is",
        "Relation",
        "Example"
      ],
      "rows": [
        [
          "Artificial Intelligence",
          "Any technique enabling machines to mimic human intelligence",
          "Outermost umbrella",
          "Rule-based expert system, chess engine"
        ],
        [
          "Machine Learning",
          "Algorithms that learn patterns from data",
          "Subset of AI",
          "Spam filter, price prediction"
        ],
        [
          "Deep Learning",
          "ML using deep neural networks, learns features automatically",
          "Subset of ML",
          "Face recognition, speech assistants"
        ],
        [
          "Data Science",
          "Extracting knowledge from data end to end (collect, clean, analyse, model, communicate)",
          "Overlaps AI/ML but also includes statistics, BI, reporting",
          "Sales analytics dashboard with a forecasting model"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "Memory trick: think of nested circles: AI ⊃ ML ⊃ DL. Data Science is a large circle that overlaps all three but also reaches outside them into statistics and business analysis. In an exam, draw this diagram: it earns easy marks."
    },
    {
      "type": "h2",
      "text": "Detailed Study Notes: Deeper Concepts and Practical Guidance"
    },
    {
      "type": "p",
      "text": "The sections below are supplementary explanations. The original explanations, tables, examples and code above have been retained. These notes add conceptual depth, practical decision rules, common misconceptions and additional exam points."
    },
    {
      "type": "h2",
      "text": "1. Machine Learning: How Learning Actually Happens"
    },
    {
      "type": "p",
      "text": "A machine-learning system identifies useful relationships in examples and uses those relationships to make predictions or decisions on new examples. A dataset is commonly represented by a feature matrix X and, in supervised learning, a target vector y. A feature is an input property such as age, temperature or pixel intensity; a target is the quantity or class the system must predict. The model is the learned mathematical representation, while the learning algorithm is the procedure used to find that representation."
    },
    {
      "type": "p",
      "text": "Training is not the same as memorising a list of answers. The objective is generalisation: performing well on observations that were not used to fit the model. A model that achieves 100% training accuracy but performs poorly on new records has not learned a reliable general rule. The training process usually adjusts parameters to reduce a loss function, subject to constraints such as model complexity, regularisation and available computation."
    },
    {
      "type": "table",
      "headers": [
        "Term",
        "Meaning",
        "Example"
      ],
      "rows": [
        [
          "Dataset",
          "A collection of observations used for analysis or learning",
          "10,000 customer records"
        ],
        [
          "Observation / sample",
          "One row or example in a dataset",
          "One customer's record"
        ],
        [
          "Feature",
          "An input variable used by the model",
          "Age, income, temperature"
        ],
        [
          "Target / label",
          "The output to be predicted in supervised learning",
          "Fraud / not fraud"
        ],
        [
          "Model",
          "The learned function or representation",
          "A fitted decision tree"
        ],
        [
          "Parameter",
          "A value learned from training data",
          "A regression coefficient"
        ],
        [
          "Hyperparameter",
          "A setting selected before or around training",
          "Tree depth, k in k-NN"
        ],
        [
          "Loss function",
          "A numerical measure of prediction error",
          "Mean squared error"
        ],
        [
          "Generalisation",
          "Performance on new, unseen observations",
          "Correctly predicting future transactions"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "💡",
      "text": "Important distinction: parameters are learned by the model from training data; hyperparameters are selected by the practitioner or a tuning procedure. For example, a decision tree learns its split thresholds (parameters/structure) while its maximum depth is a hyperparameter."
    },
    {
      "type": "h2",
      "text": "2. Machine Learning Life Cycle: Detailed Activities and Deliverables"
    },
    {
      "type": "p",
      "text": "A professional ML project begins with a clearly framed problem, not with choosing an algorithm. The team first determines who will use the prediction, what action follows it, how costly different mistakes are, what data may legally and ethically be used, and what measurable result would count as success. A technically accurate model is not useful if it does not solve the actual operational problem."
    },
    {
      "type": "table",
      "headers": [
        "Lifecycle stage",
        "Detailed activities",
        "Typical output / checkpoint"
      ],
      "rows": [
        [
          "Problem framing",
          "Identify the user, decision, prediction target, constraints, baseline and success metric",
          "Problem statement and acceptance criteria"
        ],
        [
          "Data acquisition",
          "Identify sources, permissions, sampling period, labels, collection frequency and data ownership",
          "Raw, documented dataset"
        ],
        [
          "Data understanding",
          "Inspect schema, units, distributions, missingness, duplicates, class balance and possible leakage",
          "Data-quality report and initial hypotheses"
        ],
        [
          "Preparation",
          "Clean records, impute missing values, encode categories, scale numeric features and engineer useful variables",
          "Reproducible preprocessing pipeline"
        ],
        [
          "Partitioning",
          "Create train, validation and test sets using random, stratified, grouped or time-based splitting as appropriate",
          "Leakage-aware data partitions"
        ],
        [
          "Model development",
          "Establish a simple baseline, select algorithms, train candidates and tune hyperparameters",
          "Trained candidate models"
        ],
        [
          "Evaluation",
          "Compare suitable metrics, inspect errors, test robustness, fairness and calibration where relevant",
          "Evaluation report and selected model"
        ],
        [
          "Deployment",
          "Package model and preprocessing, expose predictions through an API, application or scheduled batch process",
          "Versioned, usable model service"
        ],
        [
          "Monitoring",
          "Track data quality, drift, latency, failures, prediction patterns and real-world outcomes",
          "Alerts, monitoring dashboard and retraining triggers"
        ],
        [
          "Maintenance",
          "Investigate changes, refresh data, retrain, validate and roll back when necessary",
          "Updated model with audit trail"
        ]
      ]
    },
    {
      "type": "p",
      "text": "The data split must reflect the way the model will be used. Random splitting is often suitable when observations are independent and identically distributed. Stratified splitting preserves class proportions for classification. Group splitting keeps records from the same person, patient, machine or household in only one partition. Time-based splitting trains on the past and tests on the future; this is essential when predicting future events from historical data."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Data leakage occurs when information unavailable at prediction time enters model training or evaluation. Examples include using a post-outcome variable, allowing the same patient's records into both train and test sets, or fitting preprocessing transformations on the complete dataset before splitting. Leakage produces overly optimistic evaluation results."
    },
    {
      "type": "h2",
      "text": "3. Types of Machine Learning Systems: Choosing the Right Learning Setup"
    },
    {
      "type": "p",
      "text": "The three classification axes introduced earlier describe different properties and should not be confused. Supervised versus unsupervised learning describes the kind of feedback or labels available. Batch versus online learning describes how the model receives training data over time. Instance-based versus model-based learning describes how the system represents what it has learned and makes predictions. These categories are therefore complementary, not competing alternatives."
    },
    {
      "type": "table",
      "headers": [
        "Learning setup",
        "Best suited to",
        "Main benefit",
        "Main concern"
      ],
      "rows": [
        [
          "Supervised",
          "Historical examples have reliable target labels",
          "Directly optimises a known prediction task",
          "Label cost, label errors and class imbalance"
        ],
        [
          "Unsupervised",
          "Targets are unavailable or the goal is exploration",
          "Discovers groups, structure and unusual observations",
          "Results may be difficult to validate or interpret"
        ],
        [
          "Batch",
          "Data is relatively stable and periodic retraining is acceptable",
          "Training can be controlled, tested and versioned offline",
          "Cannot immediately adapt to new patterns"
        ],
        [
          "Online",
          "Data arrives continuously or the environment changes rapidly",
          "Incremental adaptation with potentially low memory use",
          "Sensitive to noisy data, drift and learning-rate choices"
        ],
        [
          "Instance-based",
          "Similarity to stored examples is meaningful",
          "Flexible local decisions with little explicit training",
          "Prediction cost, memory use and distance sensitivity"
        ],
        [
          "Model-based",
          "A compact learned representation is useful",
          "Fast inference and often easier deployment",
          "Model assumptions may not capture complex patterns"
        ]
      ]
    },
    {
      "type": "p",
      "text": "A supervised problem may be a classification task when the output is a category (for example, defective or non-defective), or a regression task when the output is numeric (for example, energy consumption). In unsupervised learning, clustering groups similar observations, dimensionality reduction compresses information into fewer variables, and association analysis finds items or events that occur together. Anomaly detection may be supervised when labelled anomalies exist, or unsupervised when unusual patterns must be identified without labels."
    },
    {
      "type": "p",
      "text": "Online learning is particularly useful for click streams, sensor telemetry and changing user preferences, but it requires safeguards. The system should validate incoming records, monitor prediction quality, control update frequency and retain the ability to revert to a known-good model. A learning rate that is too high can make the model forget useful historical patterns; one that is too low can make adaptation too slow."
    },
    {
      "type": "p",
      "text": "Instance-based learning is sometimes called lazy learning because much of the work is postponed until prediction time. k-NN stores examples and compares a new observation with nearby stored examples. Model-based learning is often called eager learning because it builds a general representation during training. The distinction is not simply whether data is stored: it concerns whether predictions are made mainly by comparing with stored cases or by evaluating a learned model."
    },
    {
      "type": "h2",
      "text": "4. Scope, Applications and Limitations of Machine Learning"
    },
    {
      "type": "p",
      "text": "Machine learning is valuable when patterns are too numerous, subtle or changeable to describe reliably with hand-written rules. Its scope includes prediction, classification, ranking, recommendation, grouping, forecasting, anomaly detection, perception, language processing and decision support. It can support human experts by prioritising cases or highlighting patterns, but high-impact decisions should include suitable human oversight and an appeal or review process."
    },
    {
      "type": "table",
      "headers": [
        "Application area",
        "Typical ML task",
        "Illustrative use"
      ],
      "rows": [
        [
          "Healthcare",
          "Classification, segmentation, risk prediction",
          "Flagging scans or records for expert review"
        ],
        [
          "Banking and finance",
          "Anomaly detection, classification, forecasting",
          "Transaction fraud screening and credit-risk estimation"
        ],
        [
          "Education",
          "Prediction and recommendation",
          "Identifying learners who may need additional support"
        ],
        [
          "Agriculture",
          "Image classification and forecasting",
          "Crop-disease identification and yield estimation"
        ],
        [
          "Manufacturing",
          "Anomaly detection and regression",
          "Predictive maintenance from machine sensors"
        ],
        [
          "Transport",
          "Computer vision and optimisation",
          "Traffic estimation and driver-assistance systems"
        ],
        [
          "Retail",
          "Recommendation and demand forecasting",
          "Product suggestions and inventory planning"
        ],
        [
          "Environment",
          "Time-series forecasting and anomaly detection",
          "Air-quality prediction and unusual sensor readings"
        ]
      ]
    },
    {
      "type": "p",
      "text": "ML has important limitations. It does not automatically understand meaning or causality; it estimates patterns from the data and assumptions supplied. Performance can deteriorate when the real world changes, when rare cases are under-represented, or when the training data reflects historical discrimination. Some models are difficult to explain, and a model that performs well on average may still fail for a particular subgroup or costly edge case. Privacy, security, energy consumption, infrastructure cost, legal requirements and accountability must also be considered."
    },
    {
      "type": "callout",
      "icon": "🧭",
      "text": "Use ML when there is a meaningful pattern to learn, sufficient representative data, a measurable objective and a way to monitor outcomes. Prefer a simpler rule-based solution when the rules are stable, transparent and easy to maintain. ML is a tool for problem-solving, not a requirement for every software problem."
    },
    {
      "type": "h2",
      "text": "5. Challenges of Machine Learning: Beyond the Basic List"
    },
    {
      "type": "table",
      "headers": [
        "Challenge",
        "Why it matters",
        "Practical response"
      ],
      "rows": [
        [
          "Insufficient data",
          "The model cannot observe enough examples of the underlying variation",
          "Collect more representative data, use transfer learning or carefully justified augmentation"
        ],
        [
          "Sampling bias",
          "The training sample does not represent the population or deployment setting",
          "Review collection methods and evaluate across relevant groups"
        ],
        [
          "Noisy or incorrect labels",
          "The model is trained toward wrong answers",
          "Audit labels, define annotation rules and use expert review"
        ],
        [
          "Missing and inconsistent values",
          "Different formats and gaps can distort patterns or break pipelines",
          "Validate schemas and use suitable imputation with missingness analysis"
        ],
        [
          "Class imbalance",
          "A model can appear accurate by predicting the majority class",
          "Use precision, recall, F1, PR-AUC, class weighting or resampling as appropriate"
        ],
        [
          "Irrelevant or redundant features",
          "They add noise, complexity or unstable relationships",
          "Use domain knowledge, feature selection and regularisation"
        ],
        [
          "Overfitting and underfitting",
          "The model respectively memorises noise or misses the real pattern",
          "Use validation, regularisation and suitable model complexity"
        ],
        [
          "Distribution shift",
          "Production data differs from training data",
          "Monitor drift, investigate causes and retrain only after validation"
        ],
        [
          "Interpretability",
          "Users may not understand why a prediction was made",
          "Use interpretable models or appropriate explanation techniques"
        ],
        [
          "Privacy and security",
          "Sensitive data or model interfaces may be exposed or attacked",
          "Minimise data, control access, secure pipelines and assess threats"
        ],
        [
          "Compute and environmental cost",
          "Training and inference may be expensive in time, money and energy",
          "Use efficient models, measure resource use and avoid unnecessary retraining"
        ]
      ]
    },
    {
      "type": "p",
      "text": "A useful way to organise ML challenges in an examination is into four groups: data challenges (quantity, quality, labels and representativeness); model challenges (underfitting, overfitting and poor assumptions); operational challenges (deployment, latency, drift and maintenance); and responsible-use challenges (privacy, fairness, explainability, security and environmental impact). This classification gives a more complete answer than listing only data problems."
    },
    {
      "type": "h2",
      "text": "6. Data Visualization: Selecting and Interpreting the Right Plot"
    },
    {
      "type": "p",
      "text": "Exploratory data analysis (EDA) uses numerical summaries and visual displays to understand the dataset before model fitting. Begin with data shape, data types, unique values, missing-value counts and descriptive statistics. Then select plots according to the question: one variable, two variables, several variables, time behaviour or class distribution. A chart should answer a specific question rather than merely decorate a report."
    },
    {
      "type": "table",
      "headers": [
        "Analytical question",
        "Recommended visualization",
        "Interpretation to look for"
      ],
      "rows": [
        [
          "How is one numeric feature distributed?",
          "Histogram or density plot",
          "Skew, multiple peaks, spread and extreme values"
        ],
        [
          "How do two numeric features relate?",
          "Scatter plot",
          "Positive/negative association, clusters and non-linearity"
        ],
        [
          "How does a numeric feature vary by category?",
          "Box plot or violin plot",
          "Median, spread and unusual observations by group"
        ],
        [
          "How many records belong to each class?",
          "Bar chart",
          "Class imbalance and rare classes"
        ],
        [
          "Which numeric features are associated?",
          "Correlation heatmap",
          "Strong pairwise linear associations"
        ],
        [
          "How does a value change over time?",
          "Line chart",
          "Trend, seasonality, sudden shifts and gaps"
        ],
        [
          "How do many features relate pairwise?",
          "Pair plot",
          "Potential clusters and redundant features"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Correlation is a measure of association, not proof that one variable causes another. Pearson correlation mainly measures linear association and can be strongly affected by outliers. A low Pearson correlation does not rule out a non-linear relationship. Also, a heatmap based on correlation does not establish that a feature is useful for prediction; usefulness must be checked using the training and validation process."
    },
    {
      "type": "p",
      "text": "Good visualization practice includes meaningful axis labels and units, readable scales, clear legends, suitable bin widths, honest ranges and colour choices that remain understandable to viewers with colour-vision differences. Avoid 3-D effects when they obscure values. For time-series data, preserve chronological order. When plotting target labels, make sure the chart does not accidentally reveal test-set information during model development."
    },
    {
      "type": "h2",
      "text": "7. Hypothesis Function, Hypothesis Space and Statistical Testing"
    },
    {
      "type": "p",
      "text": "In supervised learning, the hypothesis function h maps an input observation to an estimated output. For multiple input features, a linear hypothesis can be written as hθ(x) = θ₀ + θ₁x₁ + θ₂x₂ + … + θₙxₙ. The hypothesis space is the family of candidate functions available to the learner. A linear model searches within a linear family; a decision tree searches among tree-shaped decision rules. The chosen hypothesis depends on the training data, the loss function, the optimisation method and any regularisation."
    },
    {
      "type": "p",
      "text": "The cost or loss function tells the learning algorithm how undesirable a prediction is. Mean squared error is common for regression because it squares residuals and penalises large errors more strongly. Mean absolute error is less sensitive to extreme residuals. Classification commonly uses log loss or cross-entropy, while accuracy is usually an evaluation metric rather than a smooth training objective. The choice should reflect the task and the consequences of errors."
    },
    {
      "type": "table",
      "headers": [
        "Concept",
        "Question it answers",
        "Example"
      ],
      "rows": [
        [
          "Hypothesis function",
          "What prediction does this candidate model make?",
          "hθ(x) = θ₀ + θ₁x"
        ],
        [
          "Hypothesis space",
          "Which candidate functions may the learner choose?",
          "All linear functions of the selected features"
        ],
        [
          "Loss / cost",
          "How wrong are the predictions?",
          "Mean squared error"
        ],
        [
          "Optimisation",
          "How are model parameters adjusted?",
          "Gradient descent or a closed-form solver"
        ],
        [
          "Model evaluation",
          "Does the fitted model generalise to unseen data?",
          "Test-set RMSE or F1-score"
        ],
        [
          "Statistical hypothesis test",
          "Is the observed evidence inconsistent with a stated null claim?",
          "Two-sample t-test"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Statistical hypothesis testing follows a disciplined process: formulate H₀ and H₁ before examining the result; select a test whose assumptions fit the data; choose a significance level α; calculate the test statistic and p-value; and state the decision in the context of the question. A p-value is the probability, assuming H₀ and the test assumptions are true, of obtaining a result at least as extreme as the observed result. It is not the probability that H₀ is true."
    },
    {
      "type": "p",
      "text": "Rejecting H₀ does not automatically mean an effect is large or practically important. Failing to reject H₀ does not prove that H₀ is true; it may mean that the data provide insufficient evidence. Report effect sizes and confidence intervals where possible, consider sample size and test assumptions, and account for multiple comparisons when many hypotheses are tested."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Do not confuse the ML hypothesis function with a statistical null hypothesis. The ML hypothesis function is a candidate prediction rule. H₀ is a claim about a population or process that is assessed using statistical evidence. The word hypothesis is used in two different technical senses."
    },
    {
      "type": "h2",
      "text": "7A. Type I and Type II Errors: The Two Ways a Statistical Decision Can Go Wrong"
    },
    {
      "type": "p",
      "text": "A statistical test uses sample evidence to decide whether to reject the null hypothesis H₀. Because a sample is only a part of the population, the decision can be wrong. There are two important error types. A Type I error happens when we reject H₀ even though H₀ is actually true. A Type II error happens when we fail to reject H₀ even though H₀ is actually false. The word 'fail to reject' is deliberate: a test does not prove H₀; it only tells us whether the sample gives enough evidence against it."
    },
    {
      "type": "table",
      "headers": [
        "Reality",
        "Decision: reject H₀",
        "Decision: fail to reject H₀"
      ],
      "rows": [
        [
          "H₀ is true",
          "Type I error (false positive)",
          "Correct decision"
        ],
        [
          "H₀ is false",
          "Correct decision (true positive)",
          "Type II error (false negative)"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🩺",
      "text": "Medical-test analogy: suppose H₀ says 'the patient does not have the disease'. A Type I error is a false alarm: the test says disease is present when the patient is healthy. A Type II error is a missed case: the test says there is not enough evidence of disease when the patient actually has it. The same logic applies to spam filters, fraud detection and quality inspection."
    },
    {
      "type": "h3",
      "text": "The formulas you must know"
    },
    {
      "type": "p",
      "text": "Let α be the probability of a Type I error and β be the probability of a Type II error. The formulas are conditional probabilities because each error is calculated under a particular reality:"
    },
    {
      "type": "code",
      "language": "text",
      "code": "α = P(reject H₀ | H₀ is true)       Type I error rate / significance level\nβ = P(fail to reject H₀ | H₀ is false) Type II error rate\nPower = 1 − β = P(reject H₀ | H₀ is false)"
    },
    {
      "type": "p",
      "text": "The significance level α is selected before the test. If α = 0.05, the procedure is designed to have a 5% Type I error probability when H₀ is true, assuming the test assumptions hold. Power is the probability that the test correctly detects a specified real effect. A test with β = 0.20 has power 1 − β = 1 − 0.20 = 0.80, or 80%."
    },
    {
      "type": "h3",
      "text": "Worked numerical example: a new teaching method"
    },
    {
      "type": "p",
      "text": "Suppose a college tests whether a new teaching method changes the average exam score. H₀: the population mean score is unchanged (μ = 70). H₁: the population mean score is different from 70. The college chooses α = 0.05. If the method truly has no effect but the sample result leads the college to reject H₀, that is a Type I error. The long-run probability of this false rejection is controlled at 0.05 by a correctly calibrated test. If the method really improves the mean but the sample does not provide enough evidence to reject H₀, that is a Type II error."
    },
    {
      "type": "p",
      "text": "For a particular alternative effect size, suppose the test has β = 0.20. Then power = 1 − β = 1 − 0.20 = 0.80. In repeated studies under that specified alternative, the test would detect the effect about 80% of the time and miss it about 20% of the time. Power is not one universal number: it depends on the true effect size, sample size, variability, significance level and test design."
    },
    {
      "type": "h3",
      "text": "How can we reduce these errors?"
    },
    {
      "type": "table",
      "headers": [
        "Change",
        "Typical effect",
        "Important caution"
      ],
      "rows": [
        [
          "Increase sample size",
          "Usually reduces β and increases power for a fixed effect and α",
          "Collect representative, independent observations; a large biased sample is still biased"
        ],
        [
          "Increase α (for example, 0.01 to 0.05)",
          "Makes rejection easier; usually lowers β and raises power",
          "Also increases the tolerated Type I error rate"
        ],
        [
          "Reduce measurement noise",
          "Can make a real effect easier to detect",
          "Use reliable instruments and consistent procedures"
        ],
        [
          "Use a more efficient design",
          "Paired or blocked designs can reduce unexplained variability",
          "The design must match the research question and assumptions"
        ],
        [
          "Choose a meaningful effect in advance",
          "Allows a defensible sample-size and power calculation",
          "Do not select the effect size after seeing the result"
        ]
      ]
    },
    {
      "type": "p",
      "text": "There is often a trade-off between α and β when sample size and the test procedure are fixed. Making the rejection rule stricter reduces false positives but can increase missed effects. Increasing sample size is a common way to improve power without simply accepting a larger Type I error rate."
    },
    {
      "type": "h3",
      "text": "P-value, significance level and decision rule"
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Set α before analysing the data",
          "text": "For example, α = 0.05. This is the chosen long-run Type I error rate under the null model."
        },
        {
          "num": "2",
          "title": "Calculate the test statistic and p-value",
          "text": "The p-value measures how surprising the observed result, or a more extreme one, would be if H₀ and the test assumptions were true."
        },
        {
          "num": "3",
          "title": "Compare p with α",
          "text": "If p ≤ α, reject H₀. If p > α, fail to reject H₀."
        },
        {
          "num": "4",
          "title": "Explain the result in context",
          "text": "State what the data support, and avoid claiming that H₀ has been proved or that the effect must be practically important."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "A p-value of 0.03 does NOT mean there is a 3% probability that H₀ is true, and α = 0.05 does NOT mean every individual study has a 5% probability of being wrong. α describes the long-run Type I error rate of the testing procedure when H₀ is true."
    },
    {
      "type": "h3",
      "text": "Quick exam-ready comparison"
    },
    {
      "type": "table",
      "headers": [
        "Point",
        "Type I error",
        "Type II error"
      ],
      "rows": [
        [
          "Meaning",
          "Reject a true H₀",
          "Fail to reject a false H₀"
        ],
        [
          "Common name",
          "False positive / false alarm",
          "False negative / missed detection"
        ],
        [
          "Probability symbol",
          "α",
          "β"
        ],
        [
          "Related quantity",
          "Significance level",
          "Power = 1 − β"
        ],
        [
          "Medical example",
          "Healthy person incorrectly flagged as ill",
          "Ill person incorrectly not detected"
        ],
        [
          "Typical concern",
          "Unnecessary intervention or false accusation",
          "Missed disease, fraud or real improvement"
        ]
      ]
    },
    {
      "type": "h3",
      "text": "Practice questions with answers"
    },
    {
      "type": "p",
      "text": "Q1. A spam filter labels a legitimate email as spam. Which error is this? Answer: Type I-style false positive if H₀ is defined as 'the email is legitimate'; the filter rejected that null claim incorrectly. Q2. A fraud system fails to flag a genuinely fraudulent transaction. Answer: Type II-style false negative if H₀ is 'the transaction is legitimate'. Q3. If β = 0.15, calculate power. Answer: 1 − 0.15 = 0.85, or 85%. Q4. If α = 0.01 and p = 0.04, what is the decision? Answer: fail to reject H₀ because 0.04 is greater than 0.01. Q5. Does failing to reject H₀ prove it is true? Answer: No; the evidence may simply be insufficient."
    },
    {
      "type": "p",
      "text": "Exam writing tip: define H₀ and H₁ first, draw or reproduce the 2 × 2 decision table, write α and β as conditional-probability formulas, define power as 1 − β, and finish with one practical example. This structure is suitable for a 5- or 7-mark answer."
    },
    {
      "type": "h2",
      "text": "7B. Choosing a Statistical Test: A Simple Decision Guide"
    },
    {
      "type": "p",
      "text": "The correct test depends on the question, the type of outcome, the number of groups, whether observations are independent or paired, the sampling design and the assumptions. For example, a two-sample t-test compares means of two independent groups; a paired t-test compares measurements on the same people or matched units; a chi-square test examines association between categorical variables; and correlation measures association between numeric variables. Do not select a test only because its name is familiar."
    },
    {
      "type": "table",
      "headers": [
        "Research question",
        "Common test",
        "Simple example"
      ],
      "rows": [
        [
          "Is one sample mean different from a reference value?",
          "One-sample t-test",
          "Is average battery life different from 10 hours?"
        ],
        [
          "Do two independent groups have different means?",
          "Independent two-sample t-test",
          "Compare scores of two separate classes"
        ],
        [
          "Did the same group change over time?",
          "Paired t-test",
          "Measure the same students before and after training"
        ],
        [
          "Are two categorical variables associated?",
          "Chi-square test of independence",
          "Is product preference associated with age group?"
        ],
        [
          "Are two numeric variables linearly associated?",
          "Pearson correlation test",
          "Study hours and exam score"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Always check assumptions such as independence, sampling method, distributional conditions and expected cell counts. When assumptions are seriously violated, consider an appropriate alternative, such as a non-parametric test, a permutation method or a model designed for the data structure."
    },
    {
      "type": "h2",
      "text": "8. Data Pre-processing: A Reliable Order of Operations"
    },
    {
      "type": "p",
      "text": "Pre-processing should be designed as a reproducible pipeline, not as a collection of unrelated manual edits. First inspect and validate the raw data. Correct data types and units, remove exact duplicates when they are truly duplicate records, investigate impossible values, and understand why values are missing. Then create data partitions and fit data-dependent transformations using training data only. Apply the fitted transformations unchanged to validation, test and production data."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Profile and validate",
          "text": "Check rows and columns, data types, ranges, units, missingness, duplicates, label quality and unexpected categories."
        },
        {
          "num": "2",
          "title": "Define the prediction point",
          "text": "Identify which information would genuinely be available when a real prediction is made; exclude future or outcome-derived variables."
        },
        {
          "num": "3",
          "title": "Split the dataset",
          "text": "Choose random, stratified, grouped or chronological splitting based on the data-generation process."
        },
        {
          "num": "4",
          "title": "Fit transformations on training data",
          "text": "Learn imputation values, scaling parameters, category vocabularies and feature-selection decisions from training data."
        },
        {
          "num": "5",
          "title": "Transform all partitions consistently",
          "text": "Apply the already-fitted pipeline to validation and test data without refitting it."
        },
        {
          "num": "6",
          "title": "Check the result",
          "text": "Confirm shapes, ranges, missing-value handling, category handling and absence of leakage."
        }
      ]
    },
    {
      "type": "p",
      "text": "Missing values should not be filled automatically without understanding their cause. Mean imputation is simple but can reduce variance and distort relationships; median imputation is more robust to skew and outliers; mode imputation is common for categorical variables. In some applications, a missingness indicator is useful because the fact that a value is missing may itself carry information. Dropping records is reasonable only when the amount and pattern of missingness make that choice defensible."
    },
    {
      "type": "p",
      "text": "Categorical features can be represented with one-hot encoding when categories have no natural order. Ordinal encoding is suitable only when a meaningful order exists and the chosen numeric representation is justified. Label-encoding nominal categories as 0, 1 and 2 can accidentally imply an order or distance that does not exist. Unknown categories at prediction time should be handled deliberately, for example with an encoder configured to ignore or map unseen categories."
    },
    {
      "type": "p",
      "text": "Outliers should be investigated before removal. An extreme value may be a measurement error, a data-entry mistake or a genuine rare event that is important to detect. Use domain rules, visual inspection and robust statistics to decide whether to correct, cap, transform, retain or exclude an observation. Removing unusual but valid cases can make a model less useful in precisely the situations where it is needed."
    },
    {
      "type": "h2",
      "text": "9. Data Augmentation: Benefits, Risks and Correct Use"
    },
    {
      "type": "p",
      "text": "Data augmentation increases the diversity of training examples by applying transformations that preserve the task label or by generating plausible synthetic samples. It is especially useful when data collection is expensive, when classes are imbalanced or when a model must tolerate realistic changes such as image orientation, lighting or background noise. Augmentation does not create genuinely independent real-world evidence; it creates additional training variations based on assumptions about which changes should not affect the label."
    },
    {
      "type": "table",
      "headers": [
        "Domain",
        "Examples",
        "Important caution"
      ],
      "rows": [
        [
          "Images",
          "Crop, flip, rotate, resize, brightness/contrast adjustment, blur and noise",
          "A transformation must not change the object identity or class; orientation may matter in medical or document images"
        ],
        [
          "Text",
          "Careful synonym substitution, paraphrasing and back-translation",
          "A small wording change can reverse sentiment, intent or a named entity"
        ],
        [
          "Audio",
          "Time stretching, pitch shifting, background-noise mixing and time masking",
          "Do not distort speech so much that the label or speaker/event identity changes"
        ],
        [
          "Tabular",
          "SMOTE, random oversampling and domain-valid perturbations",
          "Synthetic records must respect feature constraints and realistic relationships"
        ],
        [
          "Time series",
          "Window slicing, jittering, scaling and time warping",
          "Preserve temporal order and avoid using future information"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Augmentation must be applied after the train/test split and only to training examples. If augmented copies of one original record appear in both training and test sets, the evaluation is contaminated because the model has effectively seen a close relative of the test example. For imbalanced classification, resampling should also occur inside each training fold during cross-validation, not before the folds are created."
    },
    {
      "type": "p",
      "text": "SMOTE creates synthetic minority-class observations by interpolating between nearby minority examples in feature space. It can help some tabular classification problems, but it is not automatically appropriate for categorical variables, highly constrained data or overlapping classes. Always compare it with class weighting and simpler baselines, and evaluate using metrics that reflect the cost of false positives and false negatives."
    },
    {
      "type": "h2",
      "text": "10. Normalizing Data Sets: Scaling Choices and Worked Example"
    },
    {
      "type": "p",
      "text": "Feature scaling is important when an algorithm uses distances, dot products, gradient updates or variance-based directions. Without scaling, a feature with a large numerical range can dominate a distance calculation even when it is not more informative. Scaling does not necessarily make data normally distributed, remove outliers or improve every algorithm. Decision trees and random forests are generally insensitive to monotonic rescaling of individual features, whereas k-NN, k-means, SVM, PCA and many neural-network workflows are often sensitive to feature scale."
    },
    {
      "type": "table",
      "headers": [
        "Method",
        "Transformation",
        "Strength",
        "Limitation"
      ],
      "rows": [
        [
          "Min-max scaling",
          "x_scaled = (x - minimum) / (maximum - minimum)",
          "Maps observed training range to a fixed interval, commonly 0 to 1",
          "Extreme values can compress most observations; future values may fall outside the interval"
        ],
        [
          "Standardization",
          "z = (x - mean) / standard deviation",
          "Centres at zero and scales to unit standard deviation",
          "Sensitive to outliers; does not bound values"
        ],
        [
          "Robust scaling",
          "x_scaled = (x - median) / interquartile range",
          "Uses robust centre and spread statistics",
          "Does not force a fixed range or remove outliers"
        ],
        [
          "Max-absolute scaling",
          "x_scaled = x / maximum absolute value",
          "Preserves sparsity and scales values by magnitude",
          "Can be affected by extreme values"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Worked example: suppose a training feature contains values 10, 20, 30 and 40. Its minimum is 10 and maximum is 40. Min-max scaling maps 10 to 0, 20 to 0.333, 30 to 0.667 and 40 to 1. If a new production value is 50, applying the same training-fitted transformation gives 1.333; it should not be refitted just to force the new value into the interval. This illustrates why the scaler must be saved as part of the deployed model pipeline."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Terminology note: in many introductory courses, 'normalization' is used broadly for feature scaling. More precisely, min-max scaling maps values to a selected range, while standardization converts values to z-scores. Standardization does not guarantee a Gaussian or normal distribution."
    },
    {
      "type": "h2",
      "text": "11. Bias-Variance Tradeoff: Understanding Generalisation Error"
    },
    {
      "type": "p",
      "text": "The bias-variance tradeoff explains why neither an overly simple nor an unnecessarily complex model is ideal. High bias means the model's assumptions are too restrictive to represent the underlying relationship; it tends to make similar systematic errors on training and test data. High variance means the fitted model changes substantially when the training sample changes; it may fit random fluctuations in the training set and perform poorly on new observations."
    },
    {
      "type": "p",
      "text": "For squared prediction error, the expected error at a point can be understood as the sum of squared bias, variance and irreducible noise. Bias is related to systematic distance between the average learned prediction and the true relationship. Variance measures how much predictions vary across different possible training samples. Irreducible noise comes from randomness or information not captured by the available features; it cannot be eliminated simply by choosing a more complex model."
    },
    {
      "type": "table",
      "headers": [
        "Diagnostic pattern",
        "Likely interpretation",
        "Possible action"
      ],
      "rows": [
        [
          "High training error and high validation error",
          "Underfitting / high bias",
          "Use a more expressive model, improve features or reduce excessive regularisation"
        ],
        [
          "Very low training error and much higher validation error",
          "Overfitting / high variance",
          "Add regularisation, simplify the model, collect more data or use cross-validation"
        ],
        [
          "Low training and low validation error",
          "Good fit for the measured task",
          "Check test performance, robustness and whether the metric matches the real objective"
        ],
        [
          "Validation performance varies greatly across folds",
          "Unstable estimate or high sensitivity to data partition",
          "Use suitable stratified/group/time splits and investigate data size or heterogeneity"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Regularisation controls model complexity by penalising certain parameter values or structures. L1 regularisation can drive some coefficients to zero, supporting sparse models; L2 regularisation discourages large coefficients and often stabilises fitting. Decision-tree pruning limits unnecessary branches. More training data can reduce variance when the added data is relevant and representative. Cross-validation helps estimate how reliably a model performs across different training/validation partitions."
    },
    {
      "type": "p",
      "text": "The tradeoff is not a rule that complexity must always increase variance by a fixed amount. It is a conceptual relationship used to reason about expected generalisation. The practical goal is to choose model complexity and regularisation using validation data, then report final performance on an untouched test set."
    },
    {
      "type": "h2",
      "text": "12. Relationship Between AI, ML, DL and Data Science"
    },
    {
      "type": "p",
      "text": "Artificial Intelligence (AI) is the broad discipline concerned with building systems that perform tasks associated with intelligent behaviour, such as reasoning, planning, perception, language understanding and decision-making. AI includes approaches based on explicit rules, search, logic, knowledge representation and learning. Machine Learning (ML) is one approach within AI: systems improve task performance by learning patterns from examples or experience rather than relying only on manually specified rules."
    },
    {
      "type": "p",
      "text": "Deep Learning (DL) is a subfield of ML that uses neural networks with multiple processing layers. These networks can learn increasingly abstract representations from data and have been particularly influential in image recognition, speech processing, language technologies and generative systems. Deep learning often benefits from large datasets and substantial computing resources, although transfer learning and efficient architectures can reduce the amount of training required for a particular task."
    },
    {
      "type": "p",
      "text": "Data Science (DS) is an interdisciplinary practice that turns data into evidence, insight and useful decisions. It combines data acquisition, data engineering, statistics, visualisation, experimentation, domain knowledge, communication and sometimes ML or DL. A data-science project may use a simple statistical summary or dashboard without any machine-learning model. Conversely, an ML engineer may deploy a model as part of an AI system while relying on data-science methods for evaluation and analysis."
    },
    {
      "type": "table",
      "headers": [
        "Dimension",
        "AI",
        "ML",
        "DL",
        "Data Science"
      ],
      "rows": [
        [
          "Central question",
          "How can a system perform an intelligent task?",
          "How can a system learn a pattern from data?",
          "How can multi-layer neural networks learn representations?",
          "What can data tell us, and how can it support decisions?"
        ],
        [
          "Typical methods",
          "Search, rules, logic, planning, ML",
          "Regression, trees, SVM, clustering, neural networks",
          "CNNs, RNNs, transformers and other deep neural networks",
          "Statistics, SQL, visualisation, experimentation, ML and communication"
        ],
        [
          "Data requirement",
          "Varies by approach",
          "Usually relies on examples or observations",
          "Often data-intensive, though pretrained models can help",
          "Depends on the analytical question"
        ],
        [
          "Typical output",
          "Intelligent behaviour or action",
          "A learned predictor or grouping",
          "A learned deep representation or prediction system",
          "Insight, report, decision support or predictive product"
        ],
        [
          "Relationship",
          "Broad field",
          "Part of AI",
          "Part of ML",
          "Overlaps with AI/ML but is not a subset of them"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "Exam-ready relationship: AI is the broad field; ML is a subset of AI; DL is a subset of ML. Data Science overlaps with AI and ML but also includes work such as data cleaning, statistical analysis, experimentation, dashboards and communicating findings. Therefore, Data Science should not be drawn as simply another nested circle inside AI."
    },
    {
      "type": "h2",
      "text": "13. Quick Revision: Common Misconceptions to Avoid"
    },
    {
      "type": "table",
      "headers": [
        "Incorrect statement",
        "Correct understanding"
      ],
      "rows": [
        [
          "Every AI system uses machine learning.",
          "AI can also use rules, search, logic and planning without learning from data."
        ],
        [
          "Deep learning and machine learning are the same.",
          "Deep learning is one family of machine-learning methods based on multi-layer neural networks."
        ],
        [
          "Unsupervised learning means there is no evaluation.",
          "Evaluation is possible, but it may use internal criteria, expert judgement or external labels rather than direct training labels."
        ],
        [
          "Online learning always means learning from one record at a time.",
          "It can update from one example or a small mini-batch at a time."
        ],
        [
          "More features always improve accuracy.",
          "Irrelevant, noisy or redundant features can harm generalisation."
        ],
        [
          "Normalization makes every feature normally distributed.",
          "Scaling changes numerical scale; it does not necessarily change distribution shape."
        ],
        [
          "A low p-value is the probability that the null hypothesis is true.",
          "A p-value is calculated assuming the null hypothesis and test assumptions are true."
        ],
        [
          "A model with perfect training accuracy is excellent.",
          "It may be overfitting; performance on unseen data is essential."
        ],
        [
          "All outliers should be deleted.",
          "Outliers may be errors or important rare events; investigate before deciding."
        ],
        [
          "Data augmentation can be applied before splitting the dataset.",
          "Split first and augment training data only to avoid leakage."
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📚",
      "text": "For long-answer questions, use this structure: definition → explanation of the working principle → diagram or formula where relevant → comparison table or example → advantages and limitations → short conclusion. This makes answers organised, technically complete and easier to evaluate."
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Attempt these as if in an exam. Write full answers before checking the solutions below."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: State Mitchell's definition of machine learning and apply it to a handwriting recognition problem.",
        "Q2: Explain the machine learning life cycle with the stages in order.",
        "Q3: Differentiate batch learning and online learning (any four points).",
        "Q4: Explain overfitting and underfitting, and how the bias-variance tradeoff relates to them.",
        "Q5: A feature 'salary' ranges from 10,000 to 1,000,000 and 'age' from 18 to 60. Why is scaling needed before k-NN, and which method would you use?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: A program learns from experience E with respect to task T and performance measure P if its performance at T, measured by P, improves with E. For handwriting recognition: T = recognizing handwritten digits, P = percentage of digits classified correctly, E = a database of labelled handwritten digit images."
    },
    {
      "type": "p",
      "text": "A2: (1) Problem definition, (2) data collection, (3) data preparation, (4) exploratory analysis, (5) model selection and training, (6) evaluation and tuning, (7) deployment, (8) monitoring and maintenance. The cycle repeats when monitoring shows performance drift."
    },
    {
      "type": "p",
      "text": "A3: (i) Batch trains on the full dataset at once, online trains incrementally. (ii) Batch needs full retraining for new data, online updates on the fly. (iii) Batch needs heavy resources, online is light and suits streaming data. (iv) Batch adapts slowly to change, online adapts quickly, controlled by the learning rate."
    },
    {
      "type": "p",
      "text": "A4: Overfitting is when a model fits training noise and performs poorly on new data (low bias, high variance). Underfitting is when the model is too simple to capture the pattern (high bias, low variance). Increasing model complexity reduces bias but increases variance, so the aim is a complexity level that minimizes total error, which is the tradeoff."
    },
    {
      "type": "p",
      "text": "A5: k-NN uses Euclidean distance, so 'salary' with a range near a million would dominate the distance and 'age' would be practically ignored. Scaling puts both on the same footing. Use min-max normalization (or z-score standardization if there are outliers), fitting the scaler on training data only."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Machine learning replaces hand-written rules with rules learned from data, and every project follows the same life cycle from problem definition to monitoring. Systems are described along three axes (supervised or unsupervised, batch or online, instance-based or model-based), and most failures trace back to bad data, or to a model sitting at the wrong point on the bias-variance curve. Pre-processing, augmentation and normalization are the practical tools that get data into shape. AI, ML, DL and DS are nested and overlapping, not interchangeable."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: if asked for one line in an exam: 'Machine learning is a subset of AI in which systems learn patterns from data to improve performance on a task, without being explicitly programmed.' Memorize it, then move to Part 2 and start finding structure in unlabelled data with clustering."
    },
    {
      "type": "cta",
      "text": "Continue to Part 2: Clustering →",
      "href": "/tutorials/ml-exam-mastery/part-2-clustering",
      "note": "Unsupervised learning in depth: K-means, hierarchical, fuzzy, BIRCH, CURE, GMM and EM"
    }
  ]
};

export default post;
