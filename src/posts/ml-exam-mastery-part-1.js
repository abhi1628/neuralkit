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
      "text": "In ML, a hypothesis is a candidate function h that maps inputs to predictions, and the hypothesis space is the set of all functions the algorithm is allowed to choose from. For simple linear regression the hypothesis function is h(x) = θ0 + θ1·x, where θ0 (intercept/bias) and θ1 (slope/weight) are the parameters the algorithm learns. Learning means choosing the θ values that minimize a cost function, typically the mean squared error J(θ) = (1/2m) Σ (h(xᵢ) − yᵢ)²."
    },
    {
      "type": "p",
      "text": "'Testing a hypothesis' has two related meanings, and a good answer covers both. In ML evaluation, you test the learned hypothesis on data it never saw (a held-out test set) to estimate how well it generalizes. In statistics, hypothesis testing checks a claim about a population: you state a null hypothesis H0 (no effect or no difference) and an alternative H1, compute a test statistic and a p-value, and reject H0 if the p-value is below the significance level α (commonly 0.05)."
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
      "text": "Bias is the error caused by wrong or overly simple assumptions in the model, which leads to underfitting. Variance is the error caused by excessive sensitivity to the particular training sample, which leads to overfitting. For squared error, the expected test error decomposes as: Error = Bias² + Variance + Irreducible Error (noise)."
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
