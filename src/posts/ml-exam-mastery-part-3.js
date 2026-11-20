const post = {
  "slug": "part-3-classification",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 3,
  "totalParts": 5,
  "title": "Classification Algorithms & Performance Measures (Part 3)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "38 min read",
  "category": "Machine Learning",
  "categoryColor": "#f59e0b",
  "excerpt": "Logistic regression, decision trees, neural networks, K-NN, SVM, and Naive Bayes variants, plus confusion matrix, accuracy, precision, recall, F1 score and support, with worked numericals.",
  "coverEmoji": "🤖",
  "tags": [
    "Machine Learning",
    "Classification",
    "SVM",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Classification is the workhorse of supervised learning: given labelled examples, predict the category of a new one. Unit III covers six classic algorithms (logistic regression, decision trees, neural networks, k-NN, SVM, Naive Bayes) and the performance measures used to judge them (confusion matrix, accuracy, precision, recall, F1 and support). Examiners love this unit because it mixes theory, formulas and small numeric problems, so this part gives you all three."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Explain logistic regression / SVM / decision tree / Naive Bayes' (7 marks each), 'Numerical on entropy and information gain' (5 marks), 'Compare Gaussian, Multinomial and Bernoulli Naive Bayes' (5 marks), 'Compute accuracy, precision, recall and F1 from a confusion matrix' (5-7 marks), and 'Write short notes on k-NN' (5 marks)."
    },
    {
      "type": "h2",
      "text": "What is Classification?"
    },
    {
      "type": "p",
      "text": "Classification is a supervised learning task where the model learns from labelled data to assign a discrete class label to new inputs. Binary classification has two classes (spam or not spam), multi-class classification has more than two (digit 0-9), and multi-label classification lets one example carry several labels at once (a movie tagged both 'comedy' and 'romance')."
    },
    {
      "type": "p",
      "text": "Algorithms differ in when they do their work. Eager learners (logistic regression, decision trees, SVM, neural networks, Naive Bayes) build a model during training and predict quickly. Lazy learners (k-NN) simply store the data and do the work at prediction time."
    },
    {
      "type": "h3",
      "text": "The standard classification workflow"
    },
    {
      "type": "p",
      "text": "Every classifier in this unit is used inside the same workflow. Knowing it by heart gives you a reusable skeleton for long answers and prevents the most common practical mistake, evaluating a model on data it has already seen."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Split the data",
          "text": "Hold out a test set (commonly 20-30%) before doing anything else. Use stratified splitting so each class keeps its proportion in both parts."
        },
        {
          "num": "2",
          "title": "Pre-process using training data only",
          "text": "Impute missing values, encode categories and scale features. Fit scalers and encoders on the training set, then apply them unchanged to the test set."
        },
        {
          "num": "3",
          "title": "Train and tune",
          "text": "Fit the model on the training set and choose hyperparameters (k, C, tree depth, learning rate) with cross-validation, never with the test set."
        },
        {
          "num": "4",
          "title": "Evaluate",
          "text": "Predict on the untouched test set and report the confusion matrix, precision, recall, F1 and support, not accuracy alone."
        },
        {
          "num": "5",
          "title": "Iterate or deploy",
          "text": "If the model underfits or overfits, change the model complexity or the features and repeat. Retrain on all data before deployment if the protocol allows."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Data leakage: if the scaler, imputer or feature selector sees the test set (or the validation fold) before training, the reported accuracy is optimistic and will not hold in production. Putting every step inside one scikit-learn Pipeline is the standard way to prevent it."
    },
    {
      "type": "h2",
      "text": "Logistic Regression"
    },
    {
      "type": "p",
      "text": "Despite its name, logistic regression is a classification algorithm. It computes a weighted sum of the features, z = w·x + b, and passes it through the sigmoid function σ(z) = 1 / (1 + e^(−z)) to squash it into a probability between 0 and 1. If P(y=1|x) ≥ 0.5 (threshold), the model predicts class 1, otherwise class 0. The decision boundary is linear."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/logistic.png",
      "alt": "Detailed Logistic Regression infographic",
      "caption": "Logistic Regression: sigmoid function, decision boundary, training, extensions, and key concepts."
    },
    {
      "type": "p",
      "text": "Training minimizes the log-loss (binary cross-entropy): J = −(1/m) Σ [ y·log(p) + (1−y)·log(1−p) ], typically by gradient descent. For more than two classes, the softmax function generalizes the sigmoid."
    },
    {
      "type": "table",
      "headers": [
        "Linear Regression",
        "Logistic Regression"
      ],
      "rows": [
        [
          "Predicts a continuous value",
          "Predicts a probability, then a class"
        ],
        [
          "Output unbounded",
          "Output in (0, 1) via sigmoid"
        ],
        [
          "Loss: mean squared error",
          "Loss: log-loss (cross-entropy)"
        ],
        [
          "Used for regression",
          "Used for classification"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Logistic Regression: Sigmoid and Prediction",
      "code": "import numpy as np\nfrom sklearn.datasets import load_breast_cancer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\n\ndef sigmoid(z):\n    return 1 / (1 + np.exp(-z))\n\nprint(\"sigmoid(0) =\", sigmoid(0), \" sigmoid(4) =\", round(sigmoid(4), 3), \" sigmoid(-4) =\", round(sigmoid(-4), 3))\n\nX, y = load_breast_cancer(return_X_y=True)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)\n\nclf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_tr, y_tr)\nprint(\"Test accuracy:\", round(clf.score(X_te, y_te), 3))\nprint(\"Probabilities for first 3 test samples:\\n\", clf.predict_proba(X_te[:3]).round(3))"
    },
    {
      "type": "h3",
      "text": "Logistic regression step by step"
    },
    {
      "type": "p",
      "text": "Think of logistic regression as linear regression wrapped in a squashing function. The linear part measures how strongly the evidence favours class 1; the sigmoid converts that score into a probability; a threshold turns the probability into a label; and training adjusts the weights so that the predicted probabilities match the observed labels as closely as possible."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Score",
          "text": "Compute z = w·x + b, a weighted sum of the features plus a bias."
        },
        {
          "num": "2",
          "title": "Squash",
          "text": "Compute p = σ(z) = 1 / (1 + e^(−z)). Large positive z gives p near 1, large negative z gives p near 0, and z = 0 gives exactly 0.5."
        },
        {
          "num": "3",
          "title": "Decide",
          "text": "Predict class 1 if p ≥ 0.5 (the threshold can be changed to trade precision against recall)."
        },
        {
          "num": "4",
          "title": "Measure error",
          "text": "Compute the log-loss J = −(1/m) Σ [ y·log(p) + (1−y)·log(1−p) ]; confident wrong predictions are punished heavily."
        },
        {
          "num": "5",
          "title": "Update",
          "text": "Move the weights a small step against the gradient and repeat until the loss stops falling."
        }
      ]
    },
    {
      "type": "h3",
      "text": "Odds, log-odds and what the coefficients mean"
    },
    {
      "type": "p",
      "text": "The odds of an event are p / (1 − p). Taking the logarithm gives the log-odds (the logit), and logistic regression assumes the logit is a linear function of the features: ln( p / (1 − p) ) = w·x + b. Increasing a feature by one unit therefore adds w to the log-odds, which multiplies the odds by e^w. This is why logistic regression is considered interpretable: e^w is the odds ratio of that feature."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric: suppose the fitted model for 'pass the exam' is z = 1.27 × (hours studied) − 5.71. For 6 hours, z = 1.27 × 6 − 5.71 = 1.91 and p = σ(1.91) = 0.871, so the model predicts pass. The decision boundary is where z = 0, i.e. x = 5.71 / 1.27 = 4.5 hours, where p = 0.5. Each extra hour multiplies the odds of passing by e^1.27 = 3.56."
    },
    {
      "type": "h3",
      "text": "Training with gradient descent"
    },
    {
      "type": "p",
      "text": "The log-loss of logistic regression is convex, so gradient descent reaches the global minimum (there are no bad local minima, unlike neural networks). The gradients have a pleasantly simple form: ∂J/∂wⱼ = (1/m) Σ (pᵢ − yᵢ) xᵢⱼ and ∂J/∂b = (1/m) Σ (pᵢ − yᵢ). In words, each weight is pushed in proportion to the prediction error multiplied by the feature value. The update rule is w ← w − η · ∂J/∂w, where η is the learning rate."
    },
    {
      "type": "code-block",
      "label": "Logistic Regression from Scratch: Gradient Descent, Odds Ratio and Boundary",
      "code": "import numpy as np\n\n# Hours studied vs pass (1) / fail (0)\nx = np.array([1, 2, 3, 4, 5, 6, 7, 8], dtype=float)\ny = np.array([0, 0, 0, 1, 0, 1, 1, 1], dtype=float)\n\nsigmoid = lambda z: 1 / (1 + np.exp(-z))\ndef log_loss(p):\n    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))\n\nw, b, lr = 0.0, 0.0, 0.1\np = sigmoid(w * x + b)\nprint(f\"start: w={w:.2f}, b={b:.2f}, log-loss={log_loss(p):.3f}\")\n\nfor step in range(1, 5001):\n    p = sigmoid(w * x + b)\n    grad_w = np.mean((p - y) * x)          # dJ/dw = (1/m) * sum((p - y) * x)\n    grad_b = np.mean(p - y)                # dJ/db = (1/m) * sum(p - y)\n    if step == 1:\n        print(f\"first gradients: dJ/dw={grad_w:.3f}, dJ/db={grad_b:.3f}\")\n    w -= lr * grad_w\n    b -= lr * grad_b\n\np = sigmoid(w * x + b)\nprint(f\"end:   w={w:.2f}, b={b:.2f}, log-loss={log_loss(p):.3f}\")\nprint(f\"odds ratio per extra hour = e^w = {np.exp(w):.2f}\")\nprint(f\"decision boundary (p = 0.5) at x = -b/w = {-b / w:.2f} hours\")\nprint(f\"P(pass | 4.5 hours) = {sigmoid(w * 4.5 + b):.3f}\")\n\n# Output:\n#   start: w=0.00, b=0.00, log-loss=0.693\n#   first gradients: dJ/dw=-0.875, dJ/db=0.000\n#   end:   w=1.27, b=-5.71, log-loss=0.313\n#   odds ratio per extra hour = e^w = 3.56\n#   decision boundary (p = 0.5) at x = -b/w = 4.50 hours\n#   P(pass | 4.5 hours) = 0.501"
    },
    {
      "type": "p",
      "text": "What to notice: at the start every probability is 0.5, so the log-loss is 0.693 (= ln 2). The first weight gradient is negative (−0.875), meaning that increasing w will reduce the loss, so the update raises w. After 5,000 steps the loss falls to 0.313, the odds ratio is 3.56 per hour and the boundary sits at 4.5 hours. The data contains a deliberate overlap (a student who studied 5 hours failed, one who studied 4 passed), which is why the loss cannot reach zero: logistic regression gives probabilities, not guarantees."
    },
    {
      "type": "h3",
      "text": "Regularization, multi-class extension and assumptions"
    },
    {
      "type": "table",
      "headers": [
        "Topic",
        "What you should know"
      ],
      "rows": [
        [
          "L2 regularization",
          "Adds λ‖w‖² to the loss. Shrinks weights, reduces overfitting and is the default in scikit-learn. The parameter C = 1/λ, so a smaller C means stronger regularization."
        ],
        [
          "L1 regularization",
          "Adds λ Σ|wⱼ|. Drives some weights exactly to zero, so it also performs feature selection."
        ],
        [
          "Multi-class",
          "One-vs-rest trains one binary model per class and picks the class with the highest probability. Multinomial (softmax) regression models all classes jointly: P(class k) = e^(zₖ) / Σ e^(zⱼ)."
        ],
        [
          "Threshold",
          "0.5 is a default, not a law. Lower it to catch more positives (higher recall, lower precision); raise it to be more certain (higher precision, lower recall)."
        ],
        [
          "Assumptions",
          "Linear relationship between the features and the log-odds, independent observations, little multicollinearity among features, enough examples per class, and no extreme outliers."
        ],
        [
          "Feature scaling",
          "Not required for correctness, but standardizing features makes gradient descent converge faster and makes regularization fair across features."
        ]
      ]
    },
    {
      "type": "table",
      "headers": [
        "Advantages",
        "Disadvantages"
      ],
      "rows": [
        [
          "Simple, fast, a strong baseline; outputs calibrated-looking probabilities",
          "Linear boundary only; cannot capture interactions or curves unless features are engineered"
        ],
        [
          "Coefficients are interpretable as odds ratios",
          "Sensitive to correlated features and to outliers"
        ],
        [
          "Convex loss: reliable convergence; works with regularization",
          "Needs a reasonable number of examples per class; struggles with perfectly separable data unless regularized"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam question: 'Why not use linear regression for classification?' Linear regression can output values below 0 or above 1 that cannot be read as probabilities, it is distorted by extreme points, and minimizing squared error on 0/1 labels is not the right objective. Logistic regression bounds the output with the sigmoid and uses log-loss, which matches the Bernoulli nature of the label."
    },
    {
      "type": "h2",
      "text": "Decision Tree Classification"
    },
    {
      "type": "p",
      "text": "A decision tree is a flowchart-like model in which each internal node tests a feature, each branch is an outcome of the test, and each leaf holds a class label. It is built top-down by choosing, at each node, the feature that splits the data into the purest possible subsets."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/decisiont.png",
      "alt": "Detailed Decision Tree classification infographic",
      "caption": "Decision Tree: tree construction, entropy, information gain, classification, regression, and stopping criteria."
    },
    {
      "type": "p",
      "text": "Purity is measured with entropy, H(S) = −Σ pᵢ log₂ pᵢ (0 for a pure node, 1 for a 50-50 binary node), or with Gini impurity, G = 1 − Σ pᵢ². The gain from a split is Information Gain = H(parent) − Σ (|Sᵥ|/|S|) · H(Sᵥ). ID3 uses information gain, C4.5 uses gain ratio, and CART uses Gini and builds binary trees."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric (frequently asked): a dataset has 14 examples, 9 'Yes' and 5 'No'. Entropy = −(9/14)log₂(9/14) − (5/14)log₂(5/14) = 0.410 + 0.530 = 0.940. If splitting on 'Outlook' produces subsets with entropies 0.971 (5 examples), 0 (4 examples) and 0.971 (5 examples), the weighted entropy is (5/14)(0.971) + (4/14)(0) + (5/14)(0.971) = 0.694, so Information Gain = 0.940 − 0.694 = 0.246."
    },
    {
      "type": "table",
      "headers": [
        "Advantages",
        "Disadvantages"
      ],
      "rows": [
        [
          "Easy to understand and visualize, and interpretable",
          "Prone to overfitting when grown deep (fix by pruning or limiting depth)"
        ],
        [
          "Handles numeric and categorical data, needs no scaling",
          "Unstable: small data changes can produce a different tree"
        ],
        [
          "Fast to train and predict",
          "Axis-parallel splits only; greedy, so not globally optimal"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Decision Tree with Entropy and Readable Rules",
      "code": "from sklearn.datasets import load_iris\nfrom sklearn.tree import DecisionTreeClassifier, export_text\nfrom sklearn.model_selection import train_test_split\n\niris = load_iris()\nX_tr, X_te, y_tr, y_te = train_test_split(iris.data, iris.target, test_size=0.3, random_state=1)\n\ntree = DecisionTreeClassifier(criterion=\"entropy\", max_depth=3, random_state=1).fit(X_tr, y_tr)\nprint(\"Test accuracy:\", round(tree.score(X_te, y_te), 3))\nprint(export_text(tree, feature_names=iris.feature_names))"
    },
    {
      "type": "h3",
      "text": "Building a tree: the recursive procedure"
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Start at the root",
          "text": "Put all training examples in one node."
        },
        {
          "num": "2",
          "title": "Try every split",
          "text": "For each feature (and, for numeric features, each candidate threshold) compute how much the split reduces impurity."
        },
        {
          "num": "3",
          "title": "Pick the best split",
          "text": "Choose the split with the highest information gain (ID3), gain ratio (C4.5) or Gini reduction (CART)."
        },
        {
          "num": "4",
          "title": "Partition and recurse",
          "text": "Send examples down the branches and repeat steps 2-3 on every child node."
        },
        {
          "num": "5",
          "title": "Stop",
          "text": "Stop when a node is pure, the maximum depth is reached, a node has too few samples, or no split improves purity."
        },
        {
          "num": "6",
          "title": "Label the leaf",
          "text": "A leaf predicts the majority class of its examples (and the class proportions can serve as probabilities)."
        }
      ]
    },
    {
      "type": "h3",
      "text": "Gini, entropy and gain ratio on one dataset"
    },
    {
      "type": "p",
      "text": "The classic 14-day 'play tennis' data (9 Yes, 5 No) is used in most textbooks and exams, so it is worth being able to reproduce every number. The root Gini impurity is 1 − (9/14)² − (5/14)² = 0.459. Splitting on Outlook gives Sunny (2 Yes, 3 No), Overcast (4 Yes, 0 No) and Rain (3 Yes, 2 No). Their Gini values are 0.48, 0 and 0.48, so the weighted Gini is (5/14)(0.48) + (4/14)(0) + (5/14)(0.48) = 0.343 and the Gini reduction is 0.459 − 0.343 = 0.116."
    },
    {
      "type": "p",
      "text": "Information gain has a known weakness: it prefers attributes with many distinct values. An 'ID' column would split the data into 14 pure leaves and receive the maximum gain while being useless for prediction. C4.5 corrects this with the gain ratio = Information Gain / SplitInfo, where SplitInfo = −Σ (|Sᵥ|/|S|) log₂(|Sᵥ|/|S|) measures how broadly the split divides the data. For Outlook the split information is 1.577, so the gain ratio is 0.247 / 1.577 = 0.156."
    },
    {
      "type": "code-block",
      "label": "Entropy, Gini, Information Gain and Gain Ratio for the Play-Tennis Data",
      "code": "import numpy as np\nfrom collections import Counter\n\n# Classic 14-day \"play tennis\" dataset: (Outlook, Temperature, Humidity, Wind, Play)\nrows = [\n (\"Sunny\",\"Hot\",\"High\",\"Weak\",\"No\"),(\"Sunny\",\"Hot\",\"High\",\"Strong\",\"No\"),\n (\"Overcast\",\"Hot\",\"High\",\"Weak\",\"Yes\"),(\"Rain\",\"Mild\",\"High\",\"Weak\",\"Yes\"),\n (\"Rain\",\"Cool\",\"Normal\",\"Weak\",\"Yes\"),(\"Rain\",\"Cool\",\"Normal\",\"Strong\",\"No\"),\n (\"Overcast\",\"Cool\",\"Normal\",\"Strong\",\"Yes\"),(\"Sunny\",\"Mild\",\"High\",\"Weak\",\"No\"),\n (\"Sunny\",\"Cool\",\"Normal\",\"Weak\",\"Yes\"),(\"Rain\",\"Mild\",\"Normal\",\"Weak\",\"Yes\"),\n (\"Sunny\",\"Mild\",\"Normal\",\"Strong\",\"Yes\"),(\"Overcast\",\"Mild\",\"High\",\"Strong\",\"Yes\"),\n (\"Overcast\",\"Hot\",\"Normal\",\"Weak\",\"Yes\"),(\"Rain\",\"Mild\",\"High\",\"Strong\",\"No\")]\nfeatures = [\"Outlook\", \"Temperature\", \"Humidity\", \"Wind\"]\n\ndef entropy(labels):\n    n = len(labels)\n    return -sum((c / n) * np.log2(c / n) for c in Counter(labels).values())\n\ndef gini(labels):\n    n = len(labels)\n    return 1 - sum((c / n) ** 2 for c in Counter(labels).values())\n\nlabels = [r[-1] for r in rows]\nprint(f\"root entropy = {entropy(labels):.3f}, root Gini = {gini(labels):.3f}\")\n\nfor i, name in enumerate(features):\n    groups = {}\n    for r in rows:\n        groups.setdefault(r[i], []).append(r[-1])\n    weighted = sum(len(g) / len(rows) * entropy(g) for g in groups.values())\n    split_info = -sum(len(g) / len(rows) * np.log2(len(g) / len(rows)) for g in groups.values())\n    gain = entropy(labels) - weighted\n    print(f\"{name:12s} gain={gain:.3f}  gain ratio={gain / split_info:.3f}\")\n\n# Output:\n#   root entropy = 0.940, root Gini = 0.459\n#   Outlook      gain=0.247  gain ratio=0.156\n#   Temperature  gain=0.029  gain ratio=0.019\n#   Humidity     gain=0.152  gain ratio=0.152\n#   Wind         gain=0.048  gain ratio=0.049"
    },
    {
      "type": "p",
      "text": "What to notice: Outlook has the highest information gain, so it becomes the root. Its Overcast branch contains only 'Yes' examples, so it ends immediately in a leaf, while the Sunny and Rain branches need further splits (Humidity for Sunny, Wind for Rain in the usual textbook tree). The exact gain is 0.247; the 0.246 in the worked numeric above comes from rounding the intermediate entropies, and examiners accept either if the working is shown."
    },
    {
      "type": "h3",
      "text": "Numeric features, overfitting and pruning"
    },
    {
      "type": "p",
      "text": "For a numeric feature the algorithm sorts the values, considers the midpoints between consecutive values as candidate thresholds (for example Age ≤ 32.5) and picks the threshold with the best score. A tree grown until every leaf is pure will memorize the training set, including its noise, which is overfitting. There are two families of remedies. Pre-pruning (early stopping) limits growth through max_depth, min_samples_split, min_samples_leaf or a minimum impurity decrease. Post-pruning grows the full tree and then removes branches that add little value; cost-complexity pruning minimizes (error + α × number of leaves), and a larger α gives a smaller tree."
    },
    {
      "type": "code-block",
      "label": "Overfitting, Pre-Pruning, Cost-Complexity Pruning and Feature Importance",
      "code": "from sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n\ndata = load_breast_cancer()\nX_tr, X_te, y_tr, y_te = train_test_split(data.data, data.target, test_size=0.3,\n                                          stratify=data.target, random_state=1)\n\nprint(\"max_depth  train_acc  test_acc  leaves\")\nfor depth in [1, 2, 3, 5, None]:\n    tree = DecisionTreeClassifier(max_depth=depth, random_state=1).fit(X_tr, y_tr)\n    print(f\"{str(depth):>9}  {tree.score(X_tr, y_tr):9.3f}  {tree.score(X_te, y_te):8.3f}  {tree.get_n_leaves():6d}\")\n\n# Cost-complexity (post) pruning: larger ccp_alpha => smaller tree\nprint(\"\\nccp_alpha  test_acc  leaves\")\nfor alpha in [0.0, 0.005, 0.02]:\n    tree = DecisionTreeClassifier(ccp_alpha=alpha, random_state=1).fit(X_tr, y_tr)\n    print(f\"{alpha:9.3f}  {tree.score(X_te, y_te):8.3f}  {tree.get_n_leaves():6d}\")\n\nbest = DecisionTreeClassifier(max_depth=3, random_state=1).fit(X_tr, y_tr)\ntop = sorted(zip(best.feature_importances_, data.feature_names), reverse=True)[:3]\nprint(\"\\ntop features:\", [(str(name), round(float(score), 2)) for score, name in top])\n\n# Output:\n#   max_depth  train_acc  test_acc  leaves\n#           1      0.922     0.906       2\n#           2      0.962     0.947       4\n#           3      0.970     0.953       7\n#           5      0.997     0.942      14\n#        None      1.000     0.942      15\n#\n#   ccp_alpha  test_acc  leaves\n#       0.000     0.942      15\n#       0.005     0.942       9\n#       0.020     0.942       3\n#\n#   top features: [('worst concave points', 0.78), ('worst area', 0.14), ('worst radius', 0.03)]"
    },
    {
      "type": "p",
      "text": "What to notice: training accuracy rises to 1.000 as the tree gets deeper, but test accuracy peaks at depth 3 (0.953) and then slips to 0.942, which is the signature of overfitting. A depth-3 tree has only 7 leaves and is easy to read. Cost-complexity pruning with α = 0.02 shrinks the full 15-leaf tree to 3 leaves with no loss of test accuracy here, which is a simpler model for free. feature_importances_ shows that one feature, 'worst concave points', accounts for most of the impurity reduction."
    },
    {
      "type": "table",
      "headers": [
        "",
        "ID3",
        "C4.5",
        "CART"
      ],
      "rows": [
        [
          "Split criterion",
          "Information gain",
          "Gain ratio",
          "Gini impurity (classification), variance (regression)"
        ],
        [
          "Branching",
          "Multiway",
          "Multiway for categories, binary threshold for numbers",
          "Always binary"
        ],
        [
          "Feature types",
          "Categorical only",
          "Categorical and numeric",
          "Categorical and numeric"
        ],
        [
          "Missing values",
          "Not handled",
          "Handled",
          "Surrogate splits"
        ],
        [
          "Pruning",
          "None",
          "Error-based post-pruning",
          "Cost-complexity pruning"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam tip: when asked to 'construct a decision tree', show the root entropy, the gain of every attribute in a small table, circle the largest, and then repeat the process for each impure branch. Marks are given for the method and the table, not just the final diagram."
    },
    {
      "type": "h2",
      "text": "Neural Network"
    },
    {
      "type": "p",
      "text": "An artificial neural network is a model made of layers of interconnected neurons. Each neuron computes a weighted sum of its inputs plus a bias and passes it through a non-linear activation function: output = f(Σ wᵢxᵢ + b). A network has an input layer, one or more hidden layers and an output layer; more than one hidden layer makes it 'deep'."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/neuralnetworks.png",
      "alt": "Detailed Neural Networks infographic",
      "caption": "Neural Networks: neurons, activation functions, forward propagation, loss, backpropagation, and training."
    },
    {
      "type": "table",
      "headers": [
        "Activation",
        "Formula",
        "Typical use"
      ],
      "rows": [
        [
          "Sigmoid",
          "1 / (1 + e^(−z))",
          "Output layer for binary classification"
        ],
        [
          "Tanh",
          "(e^z − e^(−z)) / (e^z + e^(−z))",
          "Hidden layers, zero-centred output"
        ],
        [
          "ReLU",
          "max(0, z)",
          "Default for hidden layers, fast and avoids vanishing gradients"
        ],
        [
          "Softmax",
          "e^(zᵢ) / Σ e^(zⱼ)",
          "Output layer for multi-class classification"
        ]
      ]
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Forward pass",
          "text": "Inputs flow layer by layer through weights and activations to produce a prediction."
        },
        {
          "num": "2",
          "title": "Compute loss",
          "text": "Compare the prediction to the true label using a loss function such as cross-entropy."
        },
        {
          "num": "3",
          "title": "Backpropagation",
          "text": "Use the chain rule to compute the gradient of the loss with respect to every weight, from output layer back to input."
        },
        {
          "num": "4",
          "title": "Update weights",
          "text": "Adjust weights against the gradient: w ← w − η·∂J/∂w, where η is the learning rate. Repeat over many epochs."
        }
      ]
    },
    {
      "type": "code-block",
      "label": "Multi-Layer Perceptron Classifier",
      "code": "from sklearn.datasets import load_digits\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import make_pipeline\n\nX, y = load_digits(return_X_y=True)          # 8x8 handwritten digit images\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)\n\nmlp = make_pipeline(\n    StandardScaler(),\n    MLPClassifier(hidden_layer_sizes=(64, 32), activation=\"relu\", max_iter=500, random_state=0),\n).fit(X_tr, y_tr)\n\nprint(\"Test accuracy:\", round(mlp.score(X_te, y_te), 3))"
    },
    {
      "type": "h3",
      "text": "A forward pass by hand"
    },
    {
      "type": "p",
      "text": "The best way to understand a neural network is to compute one prediction yourself. The network below has 2 inputs, a hidden layer of 2 ReLU neurons and 1 sigmoid output neuron. The input is x = (1, 2). The code evaluates each layer in the same order you would on paper: weighted sum, activation, weighted sum, sigmoid, then the loss and the gradient of the output-layer weights."
    },
    {
      "type": "code-block",
      "label": "Forward Pass, Loss and an Output-Layer Gradient by Hand",
      "code": "import numpy as np\n\n# A tiny network: 2 inputs -> 2 hidden neurons (ReLU) -> 1 output neuron (sigmoid)\nx  = np.array([1.0, 2.0])\nW1 = np.array([[0.5, -1.0],\n               [0.3,  0.8]])        # rows = hidden neurons, columns = inputs\nb1 = np.array([0.1, -0.2])\nW2 = np.array([1.2, -0.7])\nb2 = 0.05\n\nz1 = W1 @ x + b1                    # weighted sums of the hidden layer\na1 = np.maximum(0, z1)              # ReLU\nz2 = W2 @ a1 + b2                   # weighted sum of the output neuron\ny_hat = 1 / (1 + np.exp(-z2))       # sigmoid -> probability of class 1\n\nprint(\"hidden pre-activation z1 =\", np.round(z1, 3))\nprint(\"hidden activation  a1    =\", np.round(a1, 3))\nprint(\"output pre-activation z2 =\", round(float(z2), 3))\nprint(\"predicted probability    =\", round(float(y_hat), 3))\n\n# Loss and the output-layer gradient for true label y = 1\ny = 1.0\nloss = -(y * np.log(y_hat) + (1 - y) * np.log(1 - y_hat))\ndz2 = y_hat - y                     # sigmoid + cross-entropy gives this simple form\nprint(\"cross-entropy loss       =\", round(float(loss), 3))\nprint(\"dLoss/dW2 = (y_hat - y) * a1 =\", np.round(dz2 * a1, 3) + 0.0)\n\n# Output:\n#   hidden pre-activation z1 = [-1.4  1.7]\n#   hidden activation  a1    = [0.  1.7]\n#   output pre-activation z2 = -1.14\n#   predicted probability    = 0.242\n#   cross-entropy loss       = 1.417\n#   dLoss/dW2 = (y_hat - y) * a1 = [ 0.    -1.288]"
    },
    {
      "type": "p",
      "text": "What to notice: the first hidden neuron has a pre-activation of −1.4, so ReLU outputs 0 (it is 'switched off' for this input); the second outputs 1.7. The output probability is 0.242, so for a true label of 1 the cross-entropy loss is a large 1.417. For a sigmoid output with cross-entropy loss the error signal is simply (ŷ − y) = −0.758, and the gradient of each output weight is that signal times the incoming activation, giving 0 for the switched-off neuron and −1.288 for the active one. Learning flows only through active paths."
    },
    {
      "type": "h3",
      "text": "Why hidden layers and non-linear activations are essential"
    },
    {
      "type": "p",
      "text": "A single neuron with a sigmoid is exactly logistic regression, so it can only draw a straight line. The XOR problem (output 1 when exactly one input is 1) cannot be solved by any straight line, which is the classic reason one hidden layer is needed. Non-linear activations are equally important: without them, any stack of layers collapses into a single linear transformation, because a product of matrices is just another matrix. The universal approximation theorem states that a network with one hidden layer and enough neurons can approximate any continuous function, although deeper networks usually do it with far fewer parameters."
    },
    {
      "type": "code-block",
      "label": "Training a 2-4-1 Network on XOR with Backpropagation",
      "code": "import numpy as np\n\n# XOR: no single straight line separates the classes, so a hidden layer is essential\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)\ny = np.array([[0], [1], [1], [0]], dtype=float)\n\nrng = np.random.default_rng(1)\nW1, b1 = rng.normal(0, 1, (2, 4)), np.zeros((1, 4))      # 2 inputs -> 4 hidden (tanh)\nW2, b2 = rng.normal(0, 1, (4, 1)), np.zeros((1, 1))      # 4 hidden -> 1 output (sigmoid)\nsigmoid = lambda z: 1 / (1 + np.exp(-z))\nlr = 0.5\n\nfor epoch in range(1, 5001):\n    # Forward pass\n    a1 = np.tanh(X @ W1 + b1)\n    p = sigmoid(a1 @ W2 + b2)\n    loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))\n\n    # Backpropagation (chain rule, output layer first)\n    dz2 = (p - y) / len(X)\n    dW2, db2 = a1.T @ dz2, dz2.sum(axis=0, keepdims=True)\n    dz1 = (dz2 @ W2.T) * (1 - a1 ** 2)                   # derivative of tanh\n    dW1, db1 = X.T @ dz1, dz1.sum(axis=0, keepdims=True)\n\n    # Gradient-descent update: w <- w - lr * gradient\n    W2 -= lr * dW2; b2 -= lr * db2\n    W1 -= lr * dW1; b1 -= lr * db1\n\n    if epoch in (1, 100, 1000, 5000):\n        print(f\"epoch {epoch:>4}: loss={loss:.4f}\")\n\nprint(\"predicted probabilities:\", np.round(p.ravel(), 3))\nprint(\"predicted classes      :\", (p.ravel() > 0.5).astype(int))\n\n# Output:\n#   epoch    1: loss=0.6712\n#   epoch  100: loss=0.1255\n#   epoch 1000: loss=0.0052\n#   epoch 5000: loss=0.0009\n#   predicted probabilities: [0.    0.999 0.999 0.002]\n#   predicted classes      : [0 1 1 0]"
    },
    {
      "type": "p",
      "text": "What to notice: the loss falls from 0.67 at the first epoch to about 0.001 after 5,000 epochs, and the network classifies all four XOR cases correctly (0, 1, 1, 0). The backward pass starts with the output error (p − y), multiplies by the hidden activations to get the output-layer gradient, and then passes the error back through W₂ and the tanh derivative (1 − a²) to get the hidden-layer gradient. This is the chain rule applied layer by layer, which is all that backpropagation is."
    },
    {
      "type": "h3",
      "text": "The main knobs when training a neural network"
    },
    {
      "type": "table",
      "headers": [
        "Choice",
        "Effect",
        "Practical guidance"
      ],
      "rows": [
        [
          "Hidden layers and neurons",
          "More capacity captures more complex patterns but overfits more easily",
          "Start small, increase only while validation performance improves"
        ],
        [
          "Activation",
          "Introduces non-linearity",
          "ReLU for hidden layers; sigmoid for binary output; softmax for multi-class output"
        ],
        [
          "Learning rate η",
          "Too large: loss oscillates or diverges. Too small: very slow training",
          "Try 0.1, 0.01, 0.001; adaptive optimizers reduce the sensitivity"
        ],
        [
          "Batch size",
          "Small batches are noisy but regularize; large batches are stable but need more memory",
          "Mini-batches of 32-256 are typical"
        ],
        [
          "Epochs and early stopping",
          "Training too long overfits",
          "Stop when validation loss stops improving"
        ],
        [
          "Regularization",
          "Fights overfitting",
          "L2 weight decay, dropout (randomly switch off neurons during training)"
        ],
        [
          "Optimizer",
          "Controls how gradients become updates",
          "SGD with momentum, or Adam as a robust default"
        ],
        [
          "Input scaling and initialization",
          "Badly scaled inputs or all-zero weights slow or stall learning",
          "Standardize inputs; initialize with small random values (Xavier or He)"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Vanishing gradients: with sigmoid or tanh in many layers, gradients shrink as they travel backwards and early layers barely learn. ReLU, careful initialization and batch normalization are the standard remedies. A network that has 99% training accuracy but much lower validation accuracy is overfitting, not 'well trained'."
    },
    {
      "type": "h2",
      "text": "K-Nearest Neighbors (K-NN)"
    },
    {
      "type": "p",
      "text": "K-NN is a lazy, instance-based algorithm that classifies a new point by finding the k training points closest to it and taking a majority vote of their labels. It makes no assumption about the data distribution (non-parametric) and has no training phase beyond storing the data."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/knn.png",
      "alt": "Detailed K-Nearest Neighbors infographic",
      "caption": "K-NN: choosing k, distance calculation, nearest neighbors, voting, scaling, and the effect of k."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Choose k",
          "text": "Pick the number of neighbors, usually odd for binary problems to avoid ties."
        },
        {
          "num": "2",
          "title": "Measure distance",
          "text": "Compute the distance (Euclidean, Manhattan or Minkowski) from the query point to all training points."
        },
        {
          "num": "3",
          "title": "Find neighbors",
          "text": "Select the k training points with the smallest distances."
        },
        {
          "num": "4",
          "title": "Vote",
          "text": "Assign the class that is most common among these k neighbors (for regression, average their values)."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Choosing k: a small k (like 1) follows noise closely (high variance, overfits), a large k smooths too much (high bias, underfits). Pick k by cross-validation. k-NN is also very sensitive to feature scale, so always normalize first, and it becomes slow on large data because every prediction scans the stored set."
    },
    {
      "type": "code-block",
      "label": "K-NN: Effect of k with Scaling",
      "code": "from sklearn.datasets import load_breast_cancer\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX, y = load_breast_cancer(return_X_y=True)\n\nfor k in (1, 3, 5, 11, 21, 51):\n    model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))\n    score = cross_val_score(model, X, y, cv=5).mean()\n    print(f\"k={k:2d}  5-fold CV accuracy={score:.3f}\")"
    },
    {
      "type": "h3",
      "text": "A worked K-NN example"
    },
    {
      "type": "p",
      "text": "Six training points belong to two classes, Red (lower left) and Blue (upper right), and we want to classify the query point (4.2, 3.6) that lies in between. The code follows the four steps exactly: measure the distance to every training point, sort, take the k nearest, and vote. It also shows weighted voting, in which each neighbour's vote is multiplied by 1 / d² so that closer points count more."
    },
    {
      "type": "code-block",
      "label": "K-NN by Hand: Distances, Voting for Different k and Weighted Voting",
      "code": "import numpy as np\nfrom collections import Counter\n\n# Training data: (x1, x2, class)\ntrain = [(1, 1, \"Red\"), (2, 1, \"Red\"), (2, 2, \"Red\"),\n         (6, 5, \"Blue\"), (7, 7, \"Blue\"), (6, 6, \"Blue\")]\nquery = np.array([4.2, 3.6])\n\n# Step 1: distance from the query to every training point\ndist = sorted((float(np.hypot(x1 - query[0], x2 - query[1])), label) for x1, x2, label in train)\nfor d, label in dist:\n    print(f\"distance {d:.2f}  class {label}\")\n\n# Step 2-4: take the k nearest and vote\nfor k in (1, 3, 5):\n    votes = Counter(label for _, label in dist[:k])\n    print(f\"k={k}: votes={dict(votes)} -> predict {votes.most_common(1)[0][0]}\")\n\n# Weighted k-NN: closer neighbours get more say (weight = 1 / distance^2)\nk = 5\nweights = {}\nfor d, label in dist[:k]:\n    weights[label] = weights.get(label, 0) + 1 / d ** 2\nprint(\"k=5 weighted votes:\", {c: round(v, 3) for c, v in weights.items()},\n      \"->\", max(weights, key=weights.get))\n\n# Output:\n#   distance 2.28  class Blue\n#   distance 2.72  class Red\n#   distance 3.00  class Blue\n#   distance 3.41  class Red\n#   distance 4.12  class Red\n#   distance 4.40  class Blue\n#   k=1: votes={'Blue': 1} -> predict Blue\n#   k=3: votes={'Blue': 2, 'Red': 1} -> predict Blue\n#   k=5: votes={'Blue': 2, 'Red': 3} -> predict Red\n#   k=5 weighted votes: {'Blue': 0.303, 'Red': 0.28} -> Blue"
    },
    {
      "type": "p",
      "text": "What to notice: the prediction depends on k. With k = 1 the single nearest point is Blue, with k = 3 the vote is 2 Blue to 1 Red (Blue), but with k = 5 it flips to 3 Red to 2 Blue (Red) because the farther Red points join the vote. With distance weighting, k = 5 returns to Blue (0.303 against 0.280), because the nearest points count most. This sensitivity is exactly why k must be chosen by cross-validation and not by guesswork."
    },
    {
      "type": "h3",
      "text": "Distance measures"
    },
    {
      "type": "table",
      "headers": [
        "Measure",
        "Formula",
        "Typical use"
      ],
      "rows": [
        [
          "Euclidean",
          "d = √( Σ (aᵢ − bᵢ)² )",
          "Default for continuous, scaled features"
        ],
        [
          "Manhattan",
          "d = Σ |aᵢ − bᵢ|",
          "Grid-like data; less sensitive to a single large difference"
        ],
        [
          "Minkowski",
          "d = ( Σ |aᵢ − bᵢ|^p )^(1/p)",
          "General form: p = 1 is Manhattan, p = 2 is Euclidean"
        ],
        [
          "Hamming",
          "Number of positions where the values differ",
          "Categorical or binary features"
        ],
        [
          "Cosine distance",
          "1 − (a·b) / (‖a‖ ‖b‖)",
          "Text and high-dimensional sparse vectors, where direction matters more than length"
        ]
      ]
    },
    {
      "type": "h3",
      "text": "Why scaling matters: a numerical illustration"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric: a query person is (age 30, salary 60,000). Person A is (25, 62,000) and person B is (45, 60,500). Raw Euclidean distances are 2,000.0 for A and 500.2 for B, so B looks 'nearer' even though B is 15 years older, because the salary scale swamps the age scale. After min-max scaling (age range 20-60, salary range 30,000-90,000) the distances become 0.129 for A and 0.375 for B, and A is correctly the nearer neighbour."
    },
    {
      "type": "code-block",
      "label": "Choosing k by Cross-Validation, with and without Feature Scaling",
      "code": "from sklearn.datasets import load_wine\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX, y = load_wine(return_X_y=True)\n\nprint(\" k  raw features  scaled features\")\nfor k in [1, 3, 5, 7, 9, 11, 15]:\n    raw = cross_val_score(KNeighborsClassifier(n_neighbors=k), X, y, cv=5).mean()\n    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))\n    scaled = cross_val_score(pipe, X, y, cv=5).mean()\n    print(f\"{k:>2}  {raw:12.3f}  {scaled:15.3f}\")\n\n# The scaler sits inside the pipeline, so it is fitted only on each training fold:\n# this avoids data leakage from the validation fold.\n\n# Output:\n#    k  raw features  scaled features\n#    1         0.725            0.950\n#    3         0.703            0.944\n#    5         0.691            0.949\n#    7         0.681            0.967\n#    9         0.703            0.966\n#   11         0.680            0.955\n#   15         0.714            0.955"
    },
    {
      "type": "p",
      "text": "What to notice: on the wine dataset, raw features give only about 0.68-0.73 accuracy because one feature (proline) has values in the hundreds and dominates the distance. Standardizing lifts every setting to roughly 0.94-0.97. The best k in this run is 7 (0.967). Placing the scaler inside a pipeline means it is fitted on each training fold only, which prevents leakage."
    },
    {
      "type": "h3",
      "text": "Curse of dimensionality, speed and strengths"
    },
    {
      "type": "p",
      "text": "As the number of features grows, the distances between points become similar: the nearest and farthest neighbours are almost equally far away, so 'nearest' stops being meaningful and a huge amount of data is needed to keep neighbourhoods populated. Remedies are feature selection and dimensionality reduction (covered in Unit V). Prediction cost is also an issue: brute-force search compares the query with every stored point, O(n·d) per prediction. KD-trees and ball trees speed this up in low dimensions, and approximate nearest-neighbour libraries are used for very large data."
    },
    {
      "type": "table",
      "headers": [
        "Advantages",
        "Disadvantages"
      ],
      "rows": [
        [
          "No training phase; very easy to understand and implement",
          "Slow predictions on large datasets and needs memory for all training data"
        ],
        [
          "Naturally multi-class; flexible, non-linear boundaries",
          "Requires feature scaling; sensitive to irrelevant features and to the curse of dimensionality"
        ],
        [
          "Few hyperparameters (k, distance, weighting)",
          "Majority class dominates on imbalanced data (use weighted voting or resampling)"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Support Vector Machine (SVM)"
    },
    {
      "type": "p",
      "text": "An SVM finds the separating hyperplane w·x + b = 0 that maximizes the margin, the distance between the hyperplane and the closest points of each class. Those closest points are the support vectors, and they alone determine the boundary; removing any other point changes nothing. Maximizing the margin gives good generalization."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/svm.png",
      "alt": "Detailed Support Vector Machine infographic",
      "caption": "SVM: maximum margin, support vectors, soft margin, kernels, C and gamma, and nonlinear classification."
    },
    {
      "type": "table",
      "headers": [
        "Concept",
        "Meaning"
      ],
      "rows": [
        [
          "Hard margin",
          "No misclassification allowed; works only for perfectly linearly separable data and is sensitive to outliers"
        ],
        [
          "Soft margin",
          "Allows some violations, controlled by parameter C"
        ],
        [
          "C parameter",
          "Large C: narrow margin, few errors, risk of overfitting. Small C: wide margin, more errors tolerated, smoother boundary"
        ],
        [
          "Kernel trick",
          "Computes similarity in a higher-dimensional space without explicitly transforming the data, so a linear separator there is non-linear in the original space"
        ],
        [
          "Common kernels",
          "Linear, polynomial (γ x·x′ + r)^d, RBF exp(−γ‖x−x′‖²), sigmoid"
        ],
        [
          "gamma (RBF)",
          "Large gamma: each point has narrow influence, overfits. Small gamma: broad influence, underfits"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "SVM with Linear and RBF Kernels on Non-Linear Data",
      "code": "from sklearn.datasets import make_moons\nfrom sklearn.svm import SVC\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import make_pipeline\n\nX, y = make_moons(n_samples=400, noise=0.25, random_state=0)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)\n\nfor kernel in (\"linear\", \"poly\", \"rbf\"):\n    svm = make_pipeline(StandardScaler(), SVC(kernel=kernel, C=1.0, gamma=\"scale\")).fit(X_tr, y_tr)\n    n_sv = svm.named_steps[\"svc\"].n_support_.sum()\n    print(f\"{kernel:6s}  accuracy={svm.score(X_te, y_te):.3f}  support vectors={n_sv}\")\n# The two moons cannot be separated by a straight line, so the RBF kernel should win."
    },
    {
      "type": "h3",
      "text": "The geometry: margin and the optimization problem"
    },
    {
      "type": "p",
      "text": "Let the hyperplane be w·x + b = 0 and label the classes +1 and −1. The two margin boundaries are w·x + b = +1 and w·x + b = −1, and the distance between them is 2 / ‖w‖. Maximizing the margin is therefore the same as minimizing ½‖w‖², subject to the constraint that every point lies on the correct side: yᵢ (w·xᵢ + b) ≥ 1. This is the hard-margin problem and it only has a solution when the data is perfectly linearly separable."
    },
    {
      "type": "p",
      "text": "Real data overlaps, so the soft-margin version introduces a slack variable ξᵢ ≥ 0 for each point and minimizes ½‖w‖² + C Σ ξᵢ subject to yᵢ (w·xᵢ + b) ≥ 1 − ξᵢ. A point with ξ = 0 is correctly classified outside the margin, 0 < ξ < 1 means it is inside the margin but still correct, and ξ > 1 means it is misclassified. Equivalently, SVM minimizes the hinge loss max(0, 1 − yᵢ f(xᵢ)) plus the regularization term, which is why SVM is sometimes described as 'hinge loss with L2 regularization'."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric: in one dimension take class −1 points at x = 0 and 1, and class +1 points at x = 3 and 4. The widest gap lies between 1 and 3, so the boundary is x = 2, w = 1, b = −2 and the margin is 2 / ‖w‖ = 2. Only the points x = 1 and x = 3 touch the margin (f(x) = −1 and +1); they are the support vectors. The points at 0 and 4 could be moved further away or deleted without changing the boundary."
    },
    {
      "type": "code-block",
      "label": "Margin, Support Vectors and a Numerical Check of the Kernel Trick",
      "code": "import numpy as np\nfrom sklearn.svm import SVC\n\n# 1-D toy data: class -1 on the left, class +1 on the right\nX = np.array([[0.0], [1.0], [3.0], [4.0]])\ny = np.array([-1, -1, 1, 1])\n\nsvm = SVC(kernel=\"linear\", C=1e6).fit(X, y)      # very large C ~ hard margin\nw, b = svm.coef_[0][0], svm.intercept_[0]\nprint(f\"w = {w:.2f}, b = {b:.2f}  -> boundary at x = {-b / w:.2f}\")\nprint(\"support vectors:\", svm.support_vectors_.ravel())\nprint(f\"margin width = 2/|w| = {2 / abs(w):.2f}\")\nprint(\"decision values for x = 0.5, 2.0, 3.5:\", np.round(svm.decision_function([[0.5], [2.0], [3.5]]), 2) + 0.0)\n\n# Kernel trick check: (x.z)^2 equals the dot product in the explicit feature space\nx1, z1 = np.array([1.0, 2.0]), np.array([3.0, 4.0])\nphi = lambda v: np.array([v[0] ** 2, np.sqrt(2) * v[0] * v[1], v[1] ** 2])\nprint(\"kernel (x.z)^2           =\", (x1 @ z1) ** 2)\nprint(\"explicit phi(x).phi(z)   =\", round(float(phi(x1) @ phi(z1)), 6))\n\n# Output:\n#   w = 1.00, b = -2.00  -> boundary at x = 2.00\n#   support vectors: [1. 3.]\n#   margin width = 2/|w| = 2.00\n#   decision values for x = 0.5, 2.0, 3.5: [-1.5  0.   1.5]\n#   kernel (x.z)^2           = 121.0\n#   explicit phi(x).phi(z)   = 121.0"
    },
    {
      "type": "p",
      "text": "What to notice: scikit-learn recovers w = 1, b = −2 and a margin width of 2.00, and lists only [1, 3] as support vectors even though there are four training points. The decision values are −1.5, 0 and 1.5 for x = 0.5, 2 and 3.5: the sign gives the class and the magnitude is proportional to the distance from the boundary. The last two lines verify the kernel trick: the polynomial kernel (x·z)² gives 121, and mapping explicitly to φ(x) = (x₁², √2·x₁x₂, x₂²) and taking the dot product gives the same 121, without ever building the 3-dimensional vectors."
    },
    {
      "type": "h3",
      "text": "The dual form and the kernel trick"
    },
    {
      "type": "p",
      "text": "Solving the optimization through its dual form gives w = Σ αᵢ yᵢ xᵢ, where only the support vectors have αᵢ > 0. A prediction is f(x) = Σ αᵢ yᵢ K(xᵢ, x) + b, so both training and prediction use the data only through inner products. Replacing the inner product xᵢ·x by a kernel K(xᵢ, x) therefore gives a non-linear classifier at almost no extra cost; this is the kernel trick. The RBF kernel exp(−γ‖x − x′‖²) corresponds to an infinite-dimensional feature space, yet it is computed from a single distance."
    },
    {
      "type": "h3",
      "text": "Choosing C, gamma and the kernel"
    },
    {
      "type": "p",
      "text": "C controls the trade-off between a wide margin and few training errors. For the RBF kernel, gamma controls how far the influence of one point reaches. The usual procedure is to standardize the features and then run a grid search over C and gamma with cross-validation, as in the code below. Extreme settings reveal underfitting and overfitting."
    },
    {
      "type": "code-block",
      "label": "Grid Search over C and gamma for an RBF SVM, with Under- and Over-Fitting Examples",
      "code": "from sklearn.datasets import make_moons\nfrom sklearn.model_selection import GridSearchCV, train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.svm import SVC\n\nX, y = make_moons(n_samples=400, noise=0.3, random_state=4)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=4)\n\npipe = make_pipeline(StandardScaler(), SVC(kernel=\"rbf\"))\ngrid = {\"svc__C\": [0.1, 1, 10, 100], \"svc__gamma\": [0.01, 0.1, 1, 10]}\nsearch = GridSearchCV(pipe, grid, cv=5).fit(X_tr, y_tr)\n\nprint(\"best parameters :\", search.best_params_)\nprint(f\"best CV accuracy: {search.best_score_:.3f}\")\nprint(f\"test accuracy   : {search.score(X_te, y_te):.3f}\")\nprint(\"support vectors :\", search.best_estimator_[\"svc\"].n_support_.sum(), \"of\", len(X_tr), \"training points\")\n\n# Extreme settings show over- and under-fitting\nfor C, gamma in [(0.1, 0.01), (100, 10)]:\n    m = make_pipeline(StandardScaler(), SVC(C=C, gamma=gamma)).fit(X_tr, y_tr)\n    print(f\"C={C:<5} gamma={gamma:<5} train={m.score(X_tr, y_tr):.3f}  test={m.score(X_te, y_te):.3f}\")\n\n# Output:\n#   best parameters : {'svc__C': 1, 'svc__gamma': 10}\n#   best CV accuracy: 0.910\n#   test accuracy   : 0.890\n#   support vectors : 168 of 300 training points\n#   C=0.1   gamma=0.01  train=0.850  test=0.850\n#   C=100   gamma=10    train=0.987  test=0.840"
    },
    {
      "type": "p",
      "text": "What to notice: the best setting found by 5-fold cross-validation is C = 1 and gamma = 10, with 0.910 CV accuracy and 0.890 on the held-out test set. The model keeps 168 of 300 training points as support vectors, which is typical for noisy data. The extremes behave as the theory predicts: C = 0.1 with gamma = 0.01 is too smooth and underfits (0.850 on both sets), while C = 100 with gamma = 10 chases the training noise (0.987 train, 0.840 test)."
    },
    {
      "type": "table",
      "headers": [
        "Advantages",
        "Disadvantages"
      ],
      "rows": [
        [
          "Effective in high dimensions, including when features outnumber samples",
          "Training time grows quickly with the number of samples (roughly quadratic to cubic)"
        ],
        [
          "Memory-efficient: the model stores only support vectors",
          "Sensitive to feature scaling and to the choice of kernel, C and gamma"
        ],
        [
          "Kernels give flexible non-linear boundaries; margin maximization generalizes well",
          "Does not give probabilities directly; Platt scaling (probability=True) adds cost"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Multi-class SVM: SVM is inherently binary. One-vs-one trains a classifier for every pair of classes (k(k−1)/2 models) and votes; one-vs-rest trains one model per class. scikit-learn's SVC uses one-vs-one internally."
    },
    {
      "type": "h2",
      "text": "Naive Bayes"
    },
    {
      "type": "p",
      "text": "Naive Bayes is a probabilistic classifier based on Bayes' theorem, P(C | x) = P(x | C) · P(C) / P(x). It is called 'naive' because it assumes all features are conditionally independent given the class, so P(x₁,...,xₙ | C) = Π P(xᵢ | C). The predicted class is the one with the highest posterior: ŷ = argmax_C P(C) Π P(xᵢ | C). The assumption is rarely true, yet the algorithm works surprisingly well, especially for text."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/naive.png",
      "alt": "Detailed Naive Bayes infographic",
      "caption": "Naive Bayes: Bayes' theorem, conditional independence, Gaussian, Multinomial, and Bernoulli variants."
    },
    {
      "type": "table",
      "headers": [
        "Variant",
        "Feature type",
        "How P(xᵢ | C) is modelled",
        "Typical use"
      ],
      "rows": [
        [
          "Gaussian NB",
          "Continuous",
          "Normal distribution with a per-class mean and variance for each feature",
          "Measurements such as height, iris features"
        ],
        [
          "Multinomial NB",
          "Counts / frequencies",
          "Multinomial distribution over word counts",
          "Text classification with word counts or TF-IDF, spam filtering"
        ],
        [
          "Bernoulli NB",
          "Binary (0/1)",
          "Bernoulli distribution: feature present or absent, and it penalizes absence explicitly",
          "Binary word-presence features, short texts"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam point: Laplace (additive) smoothing adds 1 to every count so that a word never seen in a class does not make the whole product zero (the zero-frequency problem)."
    },
    {
      "type": "code-block",
      "label": "Gaussian, Multinomial and Bernoulli Naive Bayes",
      "code": "from sklearn.datasets import load_iris\nfrom sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB\nfrom sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.model_selection import cross_val_score\n\n# 1) Gaussian NB on continuous features\nX, y = load_iris(return_X_y=True)\nprint(\"GaussianNB iris CV accuracy:\", cross_val_score(GaussianNB(), X, y, cv=5).mean().round(3))\n\n# 2) Multinomial NB on word counts, 3) Bernoulli NB on word presence\ndocs = [\"win money now\", \"cheap money offer win\", \"meeting at noon\", \"project meeting schedule\",\n        \"win a free offer\", \"lunch at noon\"]\nlabels = [1, 1, 0, 0, 1, 0]                       # 1 = spam, 0 = not spam\n\ncounts = CountVectorizer().fit(docs)\nXc = counts.transform(docs)\nmnb = MultinomialNB(alpha=1.0).fit(Xc, labels)     # alpha=1 is Laplace smoothing\n\nbinary = CountVectorizer(binary=True).fit(docs)\nbnb = BernoulliNB(alpha=1.0).fit(binary.transform(docs), labels)\n\ntest = [\"free money offer\", \"noon meeting\"]\nprint(\"MultinomialNB:\", mnb.predict(counts.transform(test)))\nprint(\"BernoulliNB  :\", bnb.predict(binary.transform(test)))"
    },
    {
      "type": "h3",
      "text": "A worked spam-filter example with Laplace smoothing"
    },
    {
      "type": "p",
      "text": "Training data: three spam messages ('win money now', 'win prize now', 'free money') and three ham messages ('meeting now', 'project meeting today', 'lunch today now'). The vocabulary has 9 distinct words (|V| = 9) and each class has 8 words in total. We classify the message 'win money today'. With Laplace smoothing the word likelihood is P(word | class) = (count + 1) / (total words in class + |V|), so every denominator is 8 + 9 = 17."
    },
    {
      "type": "p",
      "text": "For spam: P(spam) × P(win|spam) × P(money|spam) × P(today|spam) = 0.5 × (3/17) × (3/17) × (1/17). For ham: 0.5 × (1/17) × (1/17) × (3/17). The common factors cancel, leaving a ratio of 9 : 3, so P(spam | message) = 9 / (9 + 3) = 0.75."
    },
    {
      "type": "code-block",
      "label": "Multinomial Naive Bayes by Hand, Checked against scikit-learn",
      "code": "import numpy as np\nfrom sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.naive_bayes import MultinomialNB\n\ndocs = [\"win money now\", \"win prize now\", \"free money\",            # spam\n        \"meeting now\", \"project meeting today\", \"lunch today now\"]  # ham\nlabels = np.array([\"spam\"] * 3 + [\"ham\"] * 3)\ntest = \"win money today\"\n\nvec = CountVectorizer()\nX = vec.fit_transform(docs).toarray()\nV = X.shape[1]                                   # vocabulary size\ntest_vec = vec.transform([test]).toarray()[0]\n\nscores = {}\nfor c in [\"spam\", \"ham\"]:\n    Xc = X[labels == c]\n    prior = len(Xc) / len(X)\n    word_counts = Xc.sum(axis=0)\n    # Laplace smoothing: add 1 to every count, add |V| to the total\n    likelihood = (word_counts + 1) / (word_counts.sum() + V)\n    log_post = np.log(prior) + (test_vec * np.log(likelihood)).sum()\n    scores[c] = log_post\n    print(f\"{c}: prior={prior:.2f}, total words={word_counts.sum()}, log-score={log_post:.3f}\")\n\npost = {c: np.exp(s) for c, s in scores.items()}\ntotal = sum(post.values())\nprint(\"posterior by hand:\", {c: round(float(v / total), 3) for c, v in post.items()})\n\nsk = MultinomialNB(alpha=1.0).fit(X, labels)\nprobs = sk.predict_proba(test_vec.reshape(1, -1))[0]\nprint(\"sklearn           :\", {str(c): round(float(p), 3) for c, p in zip(sk.classes_, probs)})\n\n# Output:\n#   spam: prior=0.50, total words=8, log-score=-6.996\n#   ham: prior=0.50, total words=8, log-score=-8.094\n#   posterior by hand: {'spam': 0.75, 'ham': 0.25}\n#   sklearn           : {'ham': 0.25, 'spam': 0.75}"
    },
    {
      "type": "p",
      "text": "What to notice: the log-scores are −6.996 for spam and −8.094 for ham, the posterior is 0.75 / 0.25 and scikit-learn agrees. The implementation adds logarithms instead of multiplying probabilities, because the product of many small numbers underflows to zero in floating point. Without smoothing, the word 'today' (never seen in spam) would give a spam probability of exactly zero and wipe out the evidence of 'win' and 'money'; smoothing prevents this."
    },
    {
      "type": "h3",
      "text": "Gaussian Naive Bayes: continuous features"
    },
    {
      "type": "p",
      "text": "For a continuous feature, Gaussian Naive Bayes estimates a mean μ and a variance σ² for each feature in each class from the training data, and evaluates the likelihood with the normal density: P(xᵢ | C) = (1 / √(2πσ²)) · exp( −(xᵢ − μ)² / (2σ²) ). The posterior combines the prior with the product of these densities for all features."
    },
    {
      "type": "code-block",
      "label": "Gaussian Naive Bayes for One Feature: Density and Posterior",
      "code": "import numpy as np\n\n# One continuous feature (height in cm); equal priors; per-class mean and standard deviation\nclasses = {\"Male\": (178.0, 7.0), \"Female\": (165.0, 6.0)}\nx = 172.0\n\ndef gaussian(x, mu, sd):\n    return np.exp(-((x - mu) ** 2) / (2 * sd ** 2)) / (sd * np.sqrt(2 * np.pi))\n\njoint = {c: 0.5 * gaussian(x, mu, sd) for c, (mu, sd) in classes.items()}\ntotal = sum(joint.values())\nfor c, (mu, sd) in classes.items():\n    print(f\"{c:6s} density={gaussian(x, mu, sd):.4f}  posterior={joint[c] / total:.3f}\")\nprint(\"predicted class:\", max(joint, key=joint.get))\n\n# Output:\n#   Male   density=0.0395  posterior=0.540\n#   Female density=0.0337  posterior=0.460\n#   predicted class: Male"
    },
    {
      "type": "p",
      "text": "What to notice: a person of height 172 cm has a density of 0.0395 under the Male distribution (mean 178, sd 7) and 0.0337 under the Female distribution (mean 165, sd 6). With equal priors the posteriors are 0.540 and 0.460, so the model predicts Male but with little confidence. A density is not a probability, but the comparison of densities after weighting by priors gives the posterior."
    },
    {
      "type": "h3",
      "text": "Multinomial versus Bernoulli in practice"
    },
    {
      "type": "p",
      "text": "Multinomial NB uses word counts: P(w | C) = (count(w, C) + α) / (total words in C + α|V|), so a word repeated five times contributes five times. Bernoulli NB uses only presence or absence: P(xᵢ | C) = pᵢᶜ^xᵢ · (1 − pᵢᶜ)^(1−xᵢ), which means the absence of a vocabulary word is also evidence. Gaussian NB is for real-valued measurements."
    },
    {
      "type": "code-block",
      "label": "Multinomial versus Bernoulli Naive Bayes on the Same Messages",
      "code": "import numpy as np\nfrom sklearn.feature_extraction.text import CountVectorizer\nfrom sklearn.naive_bayes import BernoulliNB, MultinomialNB\n\ndocs = [\"free free free offer\", \"free money offer\", \"win a free prize\",\n        \"meeting at noon\", \"project meeting notes\", \"lunch at noon\"]\ny = np.array([1, 1, 1, 0, 0, 0])                    # 1 = spam, 0 = ham\n\ncounts = CountVectorizer().fit(docs)\nXc = counts.transform(docs)                         # word counts\nXb = (Xc > 0).astype(int)                           # word present / absent\n\ntest = [\"free free free free free meeting\"]\ntc = counts.transform(test)\ntb = (tc > 0).astype(int)\n\nmnb = MultinomialNB().fit(Xc, y)\nbnb = BernoulliNB().fit(Xb, y)\nprint(\"Multinomial NB (uses counts)    P(spam) =\", round(mnb.predict_proba(tc)[0, 1], 3))\nprint(\"Bernoulli NB (presence/absence) P(spam) =\", round(bnb.predict_proba(tb)[0, 1], 3))\n# Multinomial NB treats the five repeats of 'free' as strong evidence; Bernoulli NB only\n# sees that 'free' is present, and it also penalises every vocabulary word that is absent.\n\n# Output:\n#   Multinomial NB (uses counts)    P(spam) = 0.999\n#   Bernoulli NB (presence/absence) P(spam) = 0.727"
    },
    {
      "type": "p",
      "text": "What to notice: for the message with 'free' repeated five times, Multinomial NB gives a spam probability of 0.999 because repetition is counted, while Bernoulli NB gives only 0.727 because it records only that 'free' is present and also penalizes all the absent spam words. Choose Multinomial for counts or TF-IDF text features, Bernoulli for short texts with binary features, and Gaussian for continuous measurements."
    },
    {
      "type": "table",
      "headers": [
        "Advantages",
        "Disadvantages"
      ],
      "rows": [
        [
          "Very fast to train and predict; needs little data",
          "Conditional independence assumption is rarely true"
        ],
        [
          "Works well for text and high-dimensional sparse data",
          "Predicted probabilities are often poorly calibrated, even if the ranking of classes is good"
        ],
        [
          "Handles multi-class naturally and is easy to update with new data",
          "Zero-frequency problem unless smoothing is used; Gaussian NB assumes normally distributed features"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam tip: if a question says 'why is it called naive', the answer is the assumption that features are conditionally independent given the class, which lets the joint likelihood factorize into a product of simple per-feature terms."
    },
    {
      "type": "h2",
      "text": "Comparing the Six Classifiers"
    },
    {
      "type": "table",
      "headers": [
        "Algorithm",
        "Type",
        "Decision boundary",
        "Needs scaling",
        "Interpretable",
        "Key weakness"
      ],
      "rows": [
        [
          "Logistic Regression",
          "Model-based, eager",
          "Linear",
          "Recommended",
          "High",
          "Cannot capture non-linear patterns alone"
        ],
        [
          "Decision Tree",
          "Model-based, eager",
          "Axis-parallel splits",
          "No",
          "Very high",
          "Overfits, unstable"
        ],
        [
          "Neural Network",
          "Model-based, eager",
          "Highly non-linear",
          "Yes",
          "Low",
          "Needs much data and tuning"
        ],
        [
          "K-NN",
          "Instance-based, lazy",
          "Non-linear, local",
          "Yes, essential",
          "Medium",
          "Slow prediction, curse of dimensionality"
        ],
        [
          "SVM",
          "Model-based, eager",
          "Linear or kernel non-linear",
          "Yes",
          "Low to medium",
          "Slow on very large data, kernel choice matters"
        ],
        [
          "Naive Bayes",
          "Model-based, eager",
          "Linear-like (probabilistic)",
          "No (Gaussian variant uses raw values)",
          "High",
          "Independence assumption"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Benchmarking All Six on One Dataset",
      "code": "from sklearn.datasets import load_breast_cancer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.svm import SVC\nfrom sklearn.naive_bayes import GaussianNB\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import cross_val_score\n\nX, y = load_breast_cancer(return_X_y=True)\n\nmodels = {\n    \"Logistic Regression\": LogisticRegression(max_iter=2000),\n    \"Decision Tree\":       DecisionTreeClassifier(max_depth=4, random_state=0),\n    \"Neural Network\":      MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=0),\n    \"K-NN (k=5)\":          KNeighborsClassifier(n_neighbors=5),\n    \"SVM (RBF)\":           SVC(),\n    \"Gaussian NB\":         GaussianNB(),\n}\nfor name, model in models.items():\n    pipe = make_pipeline(StandardScaler(), model)\n    print(f\"{name:20s} 5-fold accuracy = {cross_val_score(pipe, X, y, cv=5).mean():.3f}\")"
    },
    {
      "type": "h3",
      "text": "Which classifier should you try first?"
    },
    {
      "type": "p",
      "text": "No algorithm wins on every problem (the 'no free lunch' idea), so the practical approach is to start from a simple baseline and add complexity only if validation results justify it. The table below turns the comparison above into a decision guide."
    },
    {
      "type": "table",
      "headers": [
        "Your situation",
        "Good first choice",
        "Reason"
      ],
      "rows": [
        [
          "You need a fast, interpretable baseline with probabilities",
          "Logistic regression",
          "Few parameters, coefficients are odds ratios, convex training"
        ],
        [
          "Stakeholders must see the rules, or features are mixed numeric and categorical",
          "Decision tree",
          "Human-readable rules, no scaling needed"
        ],
        [
          "Text classification, spam filtering, very high-dimensional sparse features",
          "Multinomial or Bernoulli Naive Bayes",
          "Fast, strong with little data, handles sparsity"
        ],
        [
          "Small or medium dataset with complex non-linear boundary",
          "SVM with RBF kernel",
          "Margin maximization generalizes well when tuned"
        ],
        [
          "Small dataset, want a no-training method and can scale features",
          "K-NN",
          "Simple and flexible, but slow at prediction time"
        ],
        [
          "Large dataset, images, audio or very complex patterns",
          "Neural network",
          "Learns features and non-linear structure given enough data and compute"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Performance Measures"
    },
    {
      "type": "h2",
      "text": "Confusion Matrix"
    },
    {
      "type": "p",
      "text": "A confusion matrix is a table that compares predicted classes with actual classes. For a binary problem where 'positive' is the class of interest, it has four cells."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/confusionm.png",
      "alt": "Detailed Confusion Matrix infographic",
      "caption": "Confusion Matrix: TP, TN, FP, FN and the main classification performance measures."
    },
    {
      "type": "table",
      "headers": [
        "",
        "Predicted Positive",
        "Predicted Negative"
      ],
      "rows": [
        [
          "Actual Positive",
          "TP (True Positive): correctly predicted positive",
          "FN (False Negative): positive missed"
        ],
        [
          "Actual Negative",
          "FP (False Positive): wrongly flagged positive",
          "TN (True Negative): correctly predicted negative"
        ]
      ]
    },
    {
      "type": "table",
      "headers": [
        "Metric",
        "Formula",
        "Meaning"
      ],
      "rows": [
        [
          "Accuracy",
          "(TP + TN) / (TP + TN + FP + FN)",
          "Fraction of all predictions that are correct"
        ],
        [
          "Precision",
          "TP / (TP + FP)",
          "Of everything predicted positive, how much really is positive"
        ],
        [
          "Recall (Sensitivity, TPR)",
          "TP / (TP + FN)",
          "Of all actual positives, how many were found"
        ],
        [
          "F1 score",
          "2 · Precision · Recall / (Precision + Recall)",
          "Harmonic mean of precision and recall"
        ],
        [
          "Support",
          "Number of actual examples of each class in the data",
          "Tells you how many samples each row of the report is based on"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric: TP = 40, FP = 10, FN = 5, TN = 45 (100 samples). Accuracy = 85/100 = 0.85. Precision = 40/50 = 0.80. Recall = 40/45 = 0.889. F1 = 2(0.80)(0.889)/(0.80 + 0.889) = 0.842. Support for the positive class = TP + FN = 45, for the negative class = TN + FP = 55."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Accuracy paradox: on a dataset with 99% negatives, a model that always predicts 'negative' scores 99% accuracy while catching zero positives. For imbalanced data use precision, recall and F1. Prefer recall when a miss is costly (cancer screening), prefer precision when a false alarm is costly (spam filter deleting real mail)."
    },
    {
      "type": "code-block",
      "label": "Confusion Matrix and Classification Report",
      "code": "from sklearn.datasets import load_breast_cancer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.metrics import confusion_matrix, classification_report, accuracy_score\n\ndata = load_breast_cancer()\nX_tr, X_te, y_tr, y_te = train_test_split(data.data, data.target, test_size=0.3, random_state=4, stratify=data.target)\n\nmodel = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)).fit(X_tr, y_tr)\ny_pred = model.predict(X_te)\n\nprint(\"Confusion matrix (rows = actual, columns = predicted):\")\nprint(confusion_matrix(y_te, y_pred))\nprint(\"Accuracy:\", round(accuracy_score(y_te, y_pred), 3))\nprint(classification_report(y_te, y_pred, target_names=data.target_names))"
    },
    {
      "type": "code-block",
      "label": "Metrics by Hand from the Worked Example",
      "code": "TP, FP, FN, TN = 40, 10, 5, 45\n\naccuracy  = (TP + TN) / (TP + TN + FP + FN)\nprecision = TP / (TP + FP)\nrecall    = TP / (TP + FN)\nf1        = 2 * precision * recall / (precision + recall)\n\nprint(f\"Accuracy={accuracy:.3f}  Precision={precision:.3f}  Recall={recall:.3f}  F1={f1:.3f}\")"
    },
    {
      "type": "h3",
      "text": "A multi-class confusion matrix and the classification report"
    },
    {
      "type": "p",
      "text": "With more than two classes the confusion matrix becomes an n × n table whose rows are actual classes and whose columns are predicted classes (this is the scikit-learn convention; some textbooks transpose it, so always check). The diagonal holds the correct predictions. For any class, precision is read down its column (diagonal cell divided by the column sum) and recall is read along its row (diagonal cell divided by the row sum). The code below uses a 3-class animal classifier with 150 test images."
    },
    {
      "type": "code-block",
      "label": "3-Class Confusion Matrix and Classification Report, Verified by Hand",
      "code": "import numpy as np\nfrom sklearn.metrics import classification_report, confusion_matrix\n\n# Confusion matrix for 3 classes (rows = actual, columns = predicted)\ncm = np.array([[50, 3, 2],\n               [5, 40, 5],\n               [2, 8, 35]])\nnames = [\"Cat\", \"Dog\", \"Bird\"]\n\n# Rebuild label lists from the matrix so sklearn can report on it\ny_true, y_pred = [], []\nfor i in range(3):\n    for j in range(3):\n        y_true += [i] * cm[i, j]\n        y_pred += [j] * cm[i, j]\nprint(confusion_matrix(y_true, y_pred))\nprint(classification_report(y_true, y_pred, target_names=names, digits=3))\n\n# By hand for 'Cat': TP=50, FN=3+2=5 (row sum 55), FP=5+2=7 (column sum 57)\ntp, fn, fp = 50, 5, 7\np, r = tp / (tp + fp), tp / (tp + fn)\nprint(f\"Cat by hand: precision={p:.3f}, recall={r:.3f}, F1={2 * p * r / (p + r):.3f}, support={tp + fn}\")\n\n# Output:\n#   [[50  3  2]\n#    [ 5 40  5]\n#    [ 2  8 35]]\n#                 precision    recall  f1-score   support\n#\n#            Cat      0.877     0.909     0.893        55\n#            Dog      0.784     0.800     0.792        50\n#           Bird      0.833     0.778     0.805        45\n#\n#       accuracy                          0.833       150\n#      macro avg      0.832     0.829     0.830       150\n#   weighted avg      0.833     0.833     0.833       150\n#\n#   Cat by hand: precision=0.877, recall=0.909, F1=0.893, support=55"
    },
    {
      "type": "p",
      "text": "What to notice: for Cat, 50 are correct, 5 actual cats were predicted as something else (row sum 55, so support = 55) and 7 other animals were wrongly labelled Cat (column sum 57). Precision = 50/57 = 0.877, recall = 50/55 = 0.909 and F1 = 0.893, matching the report. Overall accuracy is (50 + 40 + 35)/150 = 0.833. The Dog row shows the weakest class (F1 = 0.792): the model confuses Dogs with Birds in 5 cases and Birds with Dogs in 8 cases."
    },
    {
      "type": "table",
      "headers": [
        "Average",
        "How it is computed",
        "When to prefer it"
      ],
      "rows": [
        [
          "Macro average",
          "Plain mean of the per-class scores, every class counts equally",
          "When rare classes matter as much as common ones"
        ],
        [
          "Weighted average",
          "Mean of the per-class scores weighted by support",
          "When you want a summary that reflects the class distribution"
        ],
        [
          "Micro average",
          "Pools all TP, FP and FN across classes before computing; equals accuracy for single-label multi-class",
          "When you care about overall performance on every individual prediction"
        ]
      ]
    },
    {
      "type": "h3",
      "text": "What precision, recall, F1 and support really tell you"
    },
    {
      "type": "p",
      "text": "Precision answers 'when the model says positive, how often is it right?' and is reduced by false positives. Recall answers 'of all the real positives, how many did the model find?' and is reduced by false negatives. They pull in opposite directions: a model that flags everything has perfect recall and poor precision, and a model that flags only the single surest case has high precision and poor recall. F1 is their harmonic mean, F1 = 2PR / (P + R), which is dominated by the smaller of the two, so it cannot be inflated by excelling at only one. When recall should count more, use Fβ = (1 + β²)PR / (β²P + R); β = 2 weights recall twice as heavily as precision."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Why the harmonic mean? Suppose precision = 0.90 and recall = 0.10. The arithmetic mean is 0.50, which sounds acceptable, but the harmonic mean is 2(0.90)(0.10)/(0.90 + 0.10) = 0.18, which honestly reflects that the model misses 90% of the positives."
    },
    {
      "type": "p",
      "text": "Support is simply the number of true examples of each class in the test data. It does not measure quality; it tells you how much to trust the other numbers. A recall of 1.00 on a class with a support of 3 is far less reliable than 0.90 on a class with a support of 3,000, and large differences in support signal class imbalance."
    },
    {
      "type": "h3",
      "text": "The accuracy paradox and the precision-recall trade-off"
    },
    {
      "type": "p",
      "text": "Classifiers such as logistic regression output a probability, and the decision threshold converts it into a label. Moving the threshold changes the confusion matrix: lowering it catches more positives (recall rises) at the cost of more false alarms (precision usually falls). The experiment below uses a dataset in which only 5% of the examples are positive. It first shows a model that always predicts 'negative', then sweeps the threshold of a logistic regression."
    },
    {
      "type": "code-block",
      "label": "Accuracy Paradox and Threshold Sweep on Imbalanced Data",
      "code": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.dummy import DummyClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score\nfrom sklearn.model_selection import train_test_split\n\nX, y = make_classification(n_samples=4000, n_features=8, n_informative=4,\n                           weights=[0.95], flip_y=0.0, class_sep=1.5, random_state=5)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=5)\nprint(f\"positives in test set: {y_te.sum()} of {len(y_te)} ({y_te.mean():.1%})\")\n\n# The accuracy paradox: a model that always predicts the majority class\ndummy = DummyClassifier(strategy=\"most_frequent\").fit(X_tr, y_tr)\npred = dummy.predict(X_te)\nprint(f\"always-negative: accuracy={accuracy_score(y_te, pred):.3f}, recall={recall_score(y_te, pred):.3f}\")\n\n# Precision-recall trade-off: move the decision threshold\nproba = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]\nprint(\"threshold  accuracy  precision  recall    F1\")\nfor t in [0.7, 0.5, 0.3, 0.15]:\n    pred = (proba >= t).astype(int)\n    print(f\"{t:9.2f}  {accuracy_score(y_te, pred):8.3f}  {precision_score(y_te, pred, zero_division=0):9.3f}\"\n          f\"  {recall_score(y_te, pred):6.3f}  {f1_score(y_te, pred):.3f}\")\n\n# Output:\n#   positives in test set: 60 of 1200 (5.0%)\n#   always-negative: accuracy=0.950, recall=0.000\n#   threshold  accuracy  precision  recall    F1\n#        0.70     0.949      0.400   0.033  0.062\n#        0.50     0.952      0.545   0.200  0.293\n#        0.30     0.951      0.510   0.433  0.468\n#        0.15     0.937      0.427   0.783  0.553"
    },
    {
      "type": "p",
      "text": "What to notice: the useless always-negative model scores 0.950 accuracy with a recall of 0, which is the accuracy paradox. At the default threshold of 0.5 the logistic regression has the best accuracy (0.952) but finds only 20% of the positives. Lowering the threshold to 0.15 raises recall to 0.783 and F1 to 0.553, while accuracy actually falls to 0.937. Accuracy rewards doing nothing on imbalanced data; the right threshold depends on the relative cost of missing a positive and raising a false alarm."
    },
    {
      "type": "table",
      "headers": [
        "Situation",
        "Metric to prioritise",
        "Example"
      ],
      "rows": [
        [
          "Classes roughly balanced, errors equally costly",
          "Accuracy",
          "Digit recognition"
        ],
        [
          "A missed positive is costly",
          "Recall (sensitivity)",
          "Cancer screening, fraud detection, safety alarms"
        ],
        [
          "A false alarm is costly",
          "Precision",
          "Spam filter deleting real mail, flagging innocent users"
        ],
        [
          "Imbalanced data and you need one number",
          "F1 or macro-average F1",
          "Rare-event detection"
        ],
        [
          "Judging how far to trust a class's score",
          "Support",
          "Reading any classification report"
        ]
      ]
    },
    {
      "type": "h3",
      "text": "Related measures you may meet"
    },
    {
      "type": "table",
      "headers": [
        "Measure",
        "Formula",
        "Meaning"
      ],
      "rows": [
        [
          "Specificity (TNR)",
          "TN / (TN + FP)",
          "Of all real negatives, how many were correctly rejected"
        ],
        [
          "False positive rate",
          "FP / (FP + TN) = 1 − specificity",
          "Fraction of negatives wrongly flagged"
        ],
        [
          "ROC curve and AUC",
          "TPR plotted against FPR as the threshold varies; AUC is the area under it",
          "Threshold-independent ranking quality; 0.5 is chance, 1.0 is perfect"
        ],
        [
          "Error rate",
          "1 − accuracy",
          "Fraction of wrong predictions"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common mistakes: reporting only accuracy on imbalanced data; computing metrics on the training set; splitting without stratification so a rare class is missing from the test set; reading the confusion matrix with rows and columns swapped; and tuning the threshold or hyperparameters on the test set."
    },
    {
      "type": "h2",
      "text": "Exam Answer Frameworks for Unit III"
    },
    {
      "type": "p",
      "text": "Seven-mark 'Explain algorithm X' questions are marked on structure as much as on facts. Follow the same six-part frame for every algorithm in this unit and you will reliably collect the marks."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "One-line definition",
          "text": "Say what the algorithm is and what kind of decision boundary or model it builds."
        },
        {
          "num": "2",
          "title": "Core idea and formula",
          "text": "Write the key formula (sigmoid, entropy and information gain, margin 2/‖w‖, Bayes rule, distance) with every symbol defined."
        },
        {
          "num": "3",
          "title": "Steps",
          "text": "Number the procedure: for a tree, the recursive splitting; for K-NN, the four steps; for a neural network, forward pass, loss, backpropagation, update."
        },
        {
          "num": "4",
          "title": "Small example",
          "text": "Give one tiny numeric example with the working shown. This is where most of the marks separate good answers from average ones."
        },
        {
          "num": "5",
          "title": "Hyperparameters and pitfalls",
          "text": "Name the knobs (k, C, gamma, depth, learning rate, smoothing) and the failure mode each one controls."
        },
        {
          "num": "6",
          "title": "Advantages, disadvantages and use",
          "text": "Give two points each and one real application. Add a labelled diagram wherever the question allows it."
        }
      ]
    },
    {
      "type": "table",
      "headers": [
        "Algorithm",
        "The one formula to quote",
        "The one number to remember"
      ],
      "rows": [
        [
          "Logistic regression",
          "p = 1 / (1 + e^(−(w·x + b)))",
          "σ(0) = 0.5, so the boundary is where w·x + b = 0"
        ],
        [
          "Decision tree",
          "IG = H(parent) − Σ (|Sᵥ|/|S|) H(Sᵥ)",
          "Entropy of a 50-50 node = 1, Gini = 0.5"
        ],
        [
          "Neural network",
          "w ← w − η · ∂J/∂w",
          "Output error with sigmoid and cross-entropy = ŷ − y"
        ],
        [
          "K-NN",
          "d = √( Σ (aᵢ − bᵢ)² )",
          "Choose k by cross-validation, usually odd"
        ],
        [
          "SVM",
          "Margin = 2 / ‖w‖",
          "Only support vectors define the boundary"
        ],
        [
          "Naive Bayes",
          "ŷ = argmax P(C) Π P(xᵢ | C)",
          "Laplace smoothing: (count + 1) / (total + |V|)"
        ],
        [
          "Performance",
          "F1 = 2PR / (P + R)",
          "Accuracy can be 95% while recall is 0%"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain logistic regression and the role of the sigmoid function.",
        "Q2: A node has 8 positive and 8 negative examples. Compute its entropy and Gini impurity.",
        "Q3: Explain the support vectors, margin and kernel trick in SVM.",
        "Q4: Differentiate Gaussian, Multinomial and Bernoulli Naive Bayes.",
        "Q5: For TP = 30, FP = 20, FN = 10, TN = 40, compute accuracy, precision, recall and F1.",
        "Q6: A logistic regression model has w = 2 and b = −6 for a single feature x. Find P(y = 1) for x = 4, the decision boundary and the odds ratio per unit of x.",
        "Q7: A node has 10 samples (6 Yes, 4 No). A split sends 4 samples (all Yes) to the left child and 6 samples (2 Yes, 4 No) to the right child. Compute the Gini gain.",
        "Q8: A query point has five nearest neighbours at distances 1.0 (class A), 2.0 (B), 2.5 (B), 3.0 (A) and 4.0 (A). Predict the class for k = 1, 3 and 5, and for 3-NN weighted by 1/d².",
        "Q9: In a spam model, the word 'offer' appears 0 times in 20 spam words and the vocabulary has 10 words. Find P('offer' | spam) with and without Laplace smoothing, and explain why smoothing is needed.",
        "Q10: A fraud detector is tested on 1,000 transactions, of which 20 are fraud. It gives TP = 10, FP = 30, FN = 10 and TN = 950. Compute accuracy, precision, recall and F1, and comment on the accuracy."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Logistic regression computes z = w·x + b and applies the sigmoid σ(z) = 1/(1+e^(−z)) to convert it into a probability in (0, 1). It predicts class 1 if the probability is at least 0.5. It is trained by minimizing log-loss with gradient descent and yields a linear decision boundary."
    },
    {
      "type": "p",
      "text": "A2: p(+) = p(−) = 0.5. Entropy = −(0.5 log₂0.5 + 0.5 log₂0.5) = 1.0, the maximum impurity for two classes. Gini = 1 − (0.5² + 0.5²) = 0.5."
    },
    {
      "type": "p",
      "text": "A3: The margin is the gap between the separating hyperplane and the nearest points of both classes; SVM chooses the hyperplane with the largest margin. The nearest points are the support vectors and alone define the boundary. The kernel trick computes inner products in a high-dimensional feature space implicitly, letting a linear separator there act as a non-linear boundary in the original space."
    },
    {
      "type": "p",
      "text": "A4: Gaussian NB models continuous features with per-class normal distributions. Multinomial NB models discrete counts such as word frequencies. Bernoulli NB models binary presence or absence of features and explicitly penalizes absent features. All share the conditional independence assumption."
    },
    {
      "type": "p",
      "text": "A5: Total = 100. Accuracy = (30 + 40)/100 = 0.70. Precision = 30/(30 + 20) = 0.60. Recall = 30/(30 + 10) = 0.75. F1 = 2(0.60)(0.75)/(0.60 + 0.75) = 0.90/1.35 = 0.667."
    },
    {
      "type": "p",
      "text": "A6: z = 2(4) − 6 = 2, so P(y = 1) = σ(2) = 1 / (1 + e^(−2)) = 0.881 and the model predicts class 1. The boundary is where z = 0, i.e. x = 6/2 = 3. The odds ratio per unit of x is e² = 7.39: each extra unit multiplies the odds of class 1 by about 7.4."
    },
    {
      "type": "p",
      "text": "A7: Parent Gini = 1 − (0.6² + 0.4²) = 1 − 0.52 = 0.48. Left child (4 Yes, 0 No) is pure, Gini = 0. Right child (2 Yes, 4 No): Gini = 1 − ((1/3)² + (2/3)²) = 1 − 5/9 = 0.444. Weighted Gini = (4/10)(0) + (6/10)(0.444) = 0.267. Gini gain = 0.48 − 0.267 = 0.213."
    },
    {
      "type": "p",
      "text": "A8: Ordered by distance the classes are A, B, B, A, A. k = 1 gives A. k = 3 takes A, B, B, so the majority is B. k = 5 has 3 A and 2 B, so the prediction is A. Weighted 3-NN: A has weight 1/1² = 1.0 while B has 1/2² + 1/2.5² = 0.25 + 0.16 = 0.41, so A wins even though the unweighted 3-NN vote gave B. The nearest point's strong influence changes the decision."
    },
    {
      "type": "p",
      "text": "A9: Without smoothing, P('offer' | spam) = 0/20 = 0, so any message containing 'offer' would get a spam probability of zero regardless of its other words. With Laplace smoothing, P = (0 + 1) / (20 + 10) = 1/30 = 0.033, small but non-zero. This avoids the zero-frequency problem, where one unseen word wipes out all other evidence."
    },
    {
      "type": "p",
      "text": "A10: Accuracy = (10 + 950) / 1000 = 0.96. Precision = 10 / (10 + 30) = 0.25. Recall = 10 / (10 + 10) = 0.50. F1 = 2(0.25)(0.50) / (0.25 + 0.50) = 0.333. The 96% accuracy looks excellent, but only 1 in 4 alerts is real fraud and half of the fraud is missed. A model that always predicts 'not fraud' would score 98% accuracy with zero recall, so accuracy is a misleading measure for this problem."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Each classifier encodes a different assumption. Logistic regression draws a linear probabilistic boundary, decision trees ask a sequence of questions, neural networks stack non-linear transformations, k-NN votes among stored neighbors, SVM maximizes the margin, and Naive Bayes multiplies class-conditional probabilities. No single one always wins, so evaluation matters: the confusion matrix and the metrics derived from it (accuracy, precision, recall, F1, support) tell you not just how often the model is right but in which way it is wrong."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: know one formula and one worked number for each algorithm (sigmoid, entropy and information gain, margin, Bayes rule) plus the four confusion-matrix metrics. Those appear in almost every Unit III paper. Part 4 shows how to combine many of these models into stronger ensembles."
    },
    {
      "type": "cta",
      "text": "Continue to Part 4: Ensemble Learning →",
      "href": "/tutorials/ml-exam-mastery/part-4-ensemble-learning",
      "note": "Voting, bagging, random forests, boosting and stacking"
    }
  ]
};

export default post;
