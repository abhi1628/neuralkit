const post = {
  "slug": "part-3-classification",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 3,
  "totalParts": 5,
  "title": "Classification Algorithms & Performance Measures (Part 3)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "32 min read",
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
      "type": "h2",
      "text": "Logistic Regression"
    },
    {
      "type": "p",
      "text": "Despite its name, logistic regression is a classification algorithm. It computes a weighted sum of the features, z = w·x + b, and passes it through the sigmoid function σ(z) = 1 / (1 + e^(−z)) to squash it into a probability between 0 and 1. If P(y=1|x) ≥ 0.5 (threshold), the model predicts class 1, otherwise class 0. The decision boundary is linear."
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
      "type": "h2",
      "text": "Decision Tree Classification"
    },
    {
      "type": "p",
      "text": "A decision tree is a flowchart-like model in which each internal node tests a feature, each branch is an outcome of the test, and each leaf holds a class label. It is built top-down by choosing, at each node, the feature that splits the data into the purest possible subsets."
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
      "type": "h2",
      "text": "Neural Network"
    },
    {
      "type": "p",
      "text": "An artificial neural network is a model made of layers of interconnected neurons. Each neuron computes a weighted sum of its inputs plus a bias and passes it through a non-linear activation function: output = f(Σ wᵢxᵢ + b). A network has an input layer, one or more hidden layers and an output layer; more than one hidden layer makes it 'deep'."
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
      "type": "h2",
      "text": "K-Nearest Neighbors (K-NN)"
    },
    {
      "type": "p",
      "text": "K-NN is a lazy, instance-based algorithm that classifies a new point by finding the k training points closest to it and taking a majority vote of their labels. It makes no assumption about the data distribution (non-parametric) and has no training phase beyond storing the data."
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
      "type": "h2",
      "text": "Support Vector Machine (SVM)"
    },
    {
      "type": "p",
      "text": "An SVM finds the separating hyperplane w·x + b = 0 that maximizes the margin, the distance between the hyperplane and the closest points of each class. Those closest points are the support vectors, and they alone determine the boundary; removing any other point changes nothing. Maximizing the margin gives good generalization."
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
      "type": "h2",
      "text": "Naive Bayes"
    },
    {
      "type": "p",
      "text": "Naive Bayes is a probabilistic classifier based on Bayes' theorem, P(C | x) = P(x | C) · P(C) / P(x). It is called 'naive' because it assumes all features are conditionally independent given the class, so P(x₁,...,xₙ | C) = Π P(xᵢ | C). The predicted class is the one with the highest posterior: ŷ = argmax_C P(C) Π P(xᵢ | C). The assumption is rarely true, yet the algorithm works surprisingly well, especially for text."
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
        "Q5: For TP = 30, FP = 20, FN = 10, TN = 40, compute accuracy, precision, recall and F1."
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
