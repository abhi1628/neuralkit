const post = {
  "slug": "part-4-ensemble-learning",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 4,
  "totalParts": 5,
  "title": "Ensemble Learning & Random Forests (Part 4)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "30 min read",
  "category": "Machine Learning",
  "categoryColor": "#f59e0b",
  "excerpt": "Voting, averaging, bagging and pasting, out-of-bag evaluation, random patches and subspaces, random forests, Extra-Trees, feature importance, AdaBoost, gradient boosting and stacking.",
  "coverEmoji": "🤖",
  "tags": [
    "Machine Learning",
    "Ensemble Learning",
    "Random Forest",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "A single model is rarely the best model. Ensemble learning combines several models so that the group is more accurate and more stable than any member, and it is behind most winning solutions in practical ML. Unit IV walks from the simplest ideas (voting and averaging) through bagging and random forests to boosting and stacking. This part gives you the definitions, the AdaBoost formulas, the bagging versus boosting comparison, and runnable code for every technique in the syllabus."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'What is ensemble learning? Why does it work?' (5 marks), 'Differentiate bagging and boosting' (5-7 marks), 'Explain random forest with feature importance' (7 marks), 'Explain AdaBoost / Gradient Boosting' (7 marks), 'Explain stacking' (5 marks), and 'What is out-of-bag evaluation?' (3-5 marks)."
    },
    {
      "type": "h2",
      "text": "Introduction to Ensemble Learning"
    },
    {
      "type": "p",
      "text": "Ensemble learning is the technique of training multiple models (called base learners or weak learners) on a problem and combining their predictions to produce a single, better prediction. It works because independent errors tend to cancel: if each model is somewhat accurate and their mistakes are not all the same, the aggregate is more accurate and has lower variance."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "Real-life analogy: 'ask the audience' in a quiz show. One person may be wrong, but the majority of a large, diverse audience is usually right, provided people decide independently. Ensembles work best when the base models are diverse (different algorithms, different data samples or different features)."
    },
    {
      "type": "table",
      "headers": [
        "Family",
        "How models are trained",
        "Main effect",
        "Examples"
      ],
      "rows": [
        [
          "Bagging (parallel)",
          "Independently, on random resamples of the data",
          "Reduces variance",
          "Bagging, Random Forest, Extra-Trees"
        ],
        [
          "Boosting (sequential)",
          "One after another, each focusing on the previous model's mistakes",
          "Reduces bias (and some variance)",
          "AdaBoost, Gradient Boosting"
        ],
        [
          "Stacking",
          "Different models, then a meta-model learns to combine them",
          "Learns the best combination",
          "StackingClassifier"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Basic Ensemble Techniques"
    },
    {
      "type": "table",
      "headers": [
        "Technique",
        "Task",
        "How it combines predictions"
      ],
      "rows": [
        [
          "Max Voting",
          "Classification",
          "Each model votes for a class; the class with the most votes wins (mode)"
        ],
        [
          "Averaging",
          "Regression (or class probabilities)",
          "Take the mean of all model predictions"
        ],
        [
          "Weighted Average",
          "Regression (or probabilities)",
          "Give better models more weight: ŷ = Σ wᵢ ŷᵢ with Σ wᵢ = 1"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked example: three models predict a house price of 50, 60 and 70 lakh. Simple average = 60. If their validation accuracies suggest weights 0.5, 0.3, 0.2, the weighted average = 0.5(50) + 0.3(60) + 0.2(70) = 57 lakh. For classification, votes of A, B, A give class A by max voting."
    },
    {
      "type": "code-block",
      "label": "Max Voting, Averaging and Weighted Average by Hand",
      "code": "import numpy as np\nfrom scipy import stats\n\n# Max voting: 3 models classify 5 samples\npreds = np.array([[0, 1, 1, 0, 1],      # model 1\n                  [0, 1, 0, 0, 1],      # model 2\n                  [1, 1, 1, 0, 0]])     # model 3\nmax_vote = stats.mode(preds, axis=0, keepdims=False).mode\nprint(\"Max voting result:\", max_vote)\n\n# Averaging and weighted averaging for regression\nreg = np.array([50.0, 60.0, 70.0])\nprint(\"Average:\", reg.mean())\nweights = np.array([0.5, 0.3, 0.2])\nprint(\"Weighted average:\", round(float(np.dot(weights, reg)), 2))"
    },
    {
      "type": "h2",
      "text": "Voting Classifiers"
    },
    {
      "type": "p",
      "text": "A voting classifier trains several different algorithms on the same data and combines them. In hard voting, the final class is the majority vote of the predicted labels. In soft voting, the classifier averages the predicted class probabilities and picks the class with the highest average; it usually performs better because it gives more weight to highly confident votes, but it requires models that can output probabilities."
    },
    {
      "type": "code-block",
      "label": "Hard vs Soft Voting Classifier",
      "code": "from sklearn.datasets import make_moons\nfrom sklearn.ensemble import VotingClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.svm import SVC\nfrom sklearn.model_selection import train_test_split\n\nX, y = make_moons(n_samples=500, noise=0.3, random_state=42)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)\n\nlr  = LogisticRegression()\ndt  = DecisionTreeClassifier(max_depth=5, random_state=42)\nsvm = SVC(probability=True, random_state=42)     # probability=True enables soft voting\n\nfor clf in (lr, dt, svm):\n    print(f\"{clf.__class__.__name__:24s} {clf.fit(X_tr, y_tr).score(X_te, y_te):.3f}\")\n\nfor mode in (\"hard\", \"soft\"):\n    vote = VotingClassifier([(\"lr\", lr), (\"dt\", dt), (\"svm\", svm)], voting=mode).fit(X_tr, y_tr)\n    print(f\"Voting ({mode:4s})\".ljust(24), f\"{vote.score(X_te, y_te):.3f}\")"
    },
    {
      "type": "h2",
      "text": "Bagging and Pasting"
    },
    {
      "type": "p",
      "text": "Bagging (Bootstrap AGGregatING) trains the same algorithm on many different random subsets of the training data and aggregates the results (vote for classification, average for regression). When the subsets are drawn with replacement it is called bagging, and when they are drawn without replacement it is called pasting. Each bootstrap sample is the same size as the original data, so some rows repeat and others are left out. Because individual high-variance models (such as deep trees) make different errors on different samples, aggregation cuts variance while leaving bias about the same. Models can be trained in parallel."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Bagging",
        "Pasting"
      ],
      "rows": [
        [
          "Sampling",
          "With replacement (bootstrap)",
          "Without replacement"
        ],
        [
          "Diversity between models",
          "Higher (samples overlap and repeat)",
          "Slightly lower"
        ],
        [
          "Bias",
          "Slightly higher per model",
          "Slightly lower per model"
        ],
        [
          "Out-of-bag evaluation",
          "Available",
          "Not available (no unused rows)"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Out-of-Bag (OOB) Evaluation"
    },
    {
      "type": "p",
      "text": "With bootstrap sampling, each training instance has a chance of (1 − 1/n)ⁿ ≈ e⁻¹ ≈ 36.8% of never being picked for a given model. Those left-out instances are that model's out-of-bag samples, and since the model never saw them they act as a free validation set. Averaging each instance's prediction only over the models that did not train on it gives the OOB score, a good estimate of test accuracy without holding out any data."
    },
    {
      "type": "code-block",
      "label": "Bagging with Out-of-Bag Score",
      "code": "import numpy as np\nfrom sklearn.datasets import make_moons\nfrom sklearn.ensemble import BaggingClassifier\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.model_selection import train_test_split\n\n# The 36.8% fact\nn = 1000\nprint(\"Fraction never picked in a bootstrap:\", round((1 - 1 / n) ** n, 3))\n\nX, y = make_moons(n_samples=500, noise=0.3, random_state=42)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)\n\nsingle = DecisionTreeClassifier(random_state=42).fit(X_tr, y_tr)\nbag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=200, max_samples=1.0,\n                        bootstrap=True, oob_score=True, n_jobs=-1, random_state=42).fit(X_tr, y_tr)\n\nprint(\"Single tree test accuracy:\", round(single.score(X_te, y_te), 3))\nprint(\"Bagging OOB score        :\", round(bag.oob_score_, 3))\nprint(\"Bagging test accuracy    :\", round(bag.score(X_te, y_te), 3))\n\n# Pasting = same call with bootstrap=False and max_samples < 1.0\npaste = BaggingClassifier(DecisionTreeClassifier(), n_estimators=200, max_samples=0.7,\n                          bootstrap=False, n_jobs=-1, random_state=42).fit(X_tr, y_tr)\nprint(\"Pasting test accuracy    :\", round(paste.score(X_te, y_te), 3))"
    },
    {
      "type": "h2",
      "text": "Random Patches and Random Subspaces"
    },
    {
      "type": "p",
      "text": "Sampling can be applied to features as well as instances, which is useful for very high-dimensional data such as images. In BaggingClassifier this is controlled by max_features and bootstrap_features. Each model then sees a different random slice of the data, which increases diversity at the cost of slightly higher bias."
    },
    {
      "type": "table",
      "headers": [
        "Method",
        "Samples training instances?",
        "Samples features?",
        "Settings"
      ],
      "rows": [
        [
          "Random Patches",
          "Yes",
          "Yes",
          "max_samples < 1.0 or bootstrap=True, and max_features < 1.0 with bootstrap_features=True"
        ],
        [
          "Random Subspaces",
          "No (uses all instances)",
          "Yes",
          "bootstrap=False, max_samples=1.0, and max_features < 1.0 with bootstrap_features=True"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Random Patches and Random Subspaces",
      "code": "from sklearn.datasets import load_digits\nfrom sklearn.ensemble import BaggingClassifier\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.model_selection import train_test_split\n\nX, y = load_digits(return_X_y=True)                  # 64 features per image\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)\n\npatches = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100,\n                            max_samples=0.6, bootstrap=True,\n                            max_features=0.5, bootstrap_features=True,\n                            random_state=0, n_jobs=-1).fit(X_tr, y_tr)\n\nsubspaces = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100,\n                              max_samples=1.0, bootstrap=False,\n                              max_features=0.5, bootstrap_features=True,\n                              random_state=0, n_jobs=-1).fit(X_tr, y_tr)\n\nprint(\"Random Patches   accuracy:\", round(patches.score(X_te, y_te), 3))\nprint(\"Random Subspaces accuracy:\", round(subspaces.score(X_te, y_te), 3))"
    },
    {
      "type": "h2",
      "text": "Random Forests"
    },
    {
      "type": "p",
      "text": "A random forest is a bagging ensemble of decision trees with one extra twist: when splitting a node, each tree considers only a random subset of the features (typically √n for classification) rather than all of them. This decorrelates the trees, so averaging them removes more variance than plain bagging. Trees are grown deep, prediction is by majority vote or average, and OOB scoring comes for free."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Bootstrap",
          "text": "Draw a bootstrap sample of the training data for each tree."
        },
        {
          "num": "2",
          "title": "Grow a tree with random features",
          "text": "At every node, pick the best split from a random subset of features only."
        },
        {
          "num": "3",
          "title": "Repeat",
          "text": "Build many trees (hundreds), usually without pruning."
        },
        {
          "num": "4",
          "title": "Aggregate",
          "text": "Classify by majority vote of all trees; regress by averaging."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Extra-Trees"
    },
    {
      "type": "p",
      "text": "Extremely Randomized Trees (Extra-Trees) push randomness further: besides random feature subsets, the split threshold for each candidate feature is also chosen at random instead of searching for the best one. This makes each tree faster to train and trades a little more bias for lower variance. By default Extra-Trees does not bootstrap, using the whole dataset for every tree."
    },
    {
      "type": "h2",
      "text": "Feature Importance"
    },
    {
      "type": "p",
      "text": "A random forest measures how useful each feature is by computing how much, on average across all trees, the feature's splits reduce impurity (Gini importance, also called mean decrease in impurity). The scores are normalized to sum to 1. A more reliable alternative is permutation importance, which shuffles one feature and measures the drop in model score. Feature importance is valuable for interpretation and for feature selection."
    },
    {
      "type": "code-block",
      "label": "Random Forest, Extra-Trees and Feature Importance",
      "code": "import numpy as np\nfrom sklearn.datasets import load_iris\nfrom sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier\nfrom sklearn.model_selection import cross_val_score\n\niris = load_iris()\nX, y = iris.data, iris.target\n\nrf = RandomForestClassifier(n_estimators=300, oob_score=True, random_state=42, n_jobs=-1).fit(X, y)\net = ExtraTreesClassifier(n_estimators=300, random_state=42, n_jobs=-1)\n\nprint(\"Random Forest OOB score:\", round(rf.oob_score_, 3))\nprint(\"Extra-Trees CV accuracy:\", round(cross_val_score(et, X, y, cv=5).mean(), 3))\n\nprint(\"\\nFeature importances (Random Forest):\")\nfor name, score in sorted(zip(iris.feature_names, rf.feature_importances_), key=lambda t: -t[1]):\n    print(f\"  {name:20s} {score:.3f}\")\nprint(\"Sum of importances:\", round(rf.feature_importances_.sum(), 3))"
    },
    {
      "type": "h2",
      "text": "Boosting"
    },
    {
      "type": "p",
      "text": "Boosting builds an ensemble sequentially: each new weak learner is trained to fix the mistakes of the ensemble so far, and the final prediction is a weighted combination of all learners. Unlike bagging it cannot be parallelized, and it mainly reduces bias, turning many weak learners (slightly better than random guessing) into one strong learner."
    },
    {
      "type": "h2",
      "text": "AdaBoost"
    },
    {
      "type": "p",
      "text": "AdaBoost (Adaptive Boosting) keeps a weight for every training instance. After each round it increases the weights of misclassified instances so the next learner concentrates on the hard cases. The learner's own voting power depends on its accuracy."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Initialize weights",
          "text": "Give every instance equal weight wᵢ = 1/m."
        },
        {
          "num": "2",
          "title": "Train a weak learner",
          "text": "Fit a learner (usually a decision stump, a tree of depth 1) on the weighted data and compute its weighted error rate ε."
        },
        {
          "num": "3",
          "title": "Compute learner weight",
          "text": "α = ½ ln((1 − ε) / ε). A more accurate learner gets a larger α; a learner no better than chance (ε = 0.5) gets α = 0."
        },
        {
          "num": "4",
          "title": "Update instance weights",
          "text": "Increase weights of misclassified instances by e^α and decrease the correctly classified ones, then normalize so weights sum to 1."
        },
        {
          "num": "5",
          "title": "Repeat",
          "text": "Repeat for T rounds or until the error is zero."
        },
        {
          "num": "6",
          "title": "Predict",
          "text": "Final class = sign of Σ αₜ hₜ(x): a weighted vote of all learners."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked example: a weak learner has weighted error ε = 0.2. Then α = ½ ln(0.8 / 0.2) = ½ ln 4 = 0.693. Misclassified instances have their weights multiplied by e^0.693 = 2, so the next learner pays twice as much attention to them."
    },
    {
      "type": "h2",
      "text": "Gradient Boosting"
    },
    {
      "type": "p",
      "text": "Gradient boosting also adds learners one at a time, but instead of re-weighting instances, each new learner is fit to the residual errors (more generally, the negative gradient of the loss) of the current ensemble. For squared-error regression: start with a constant prediction F₀ (the mean of y), then repeat: compute residuals rᵢ = yᵢ − F(xᵢ), fit a small tree h to the residuals, and update F ← F + η·h, where η is the learning rate. A small learning rate with many trees generalizes better (shrinkage)."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "AdaBoost",
        "Gradient Boosting"
      ],
      "rows": [
        [
          "How it focuses on errors",
          "Re-weights misclassified instances",
          "Fits the next learner to residuals / loss gradient"
        ],
        [
          "Loss function",
          "Exponential loss (fixed)",
          "Any differentiable loss"
        ],
        [
          "Typical base learner",
          "Decision stumps",
          "Shallow trees (depth 3-5)"
        ],
        [
          "Combination",
          "Weighted vote using α",
          "Sum of trees scaled by learning rate"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "AdaBoost and Gradient Boosting",
      "code": "from sklearn.datasets import make_moons, make_regression\nfrom sklearn.ensemble import AdaBoostClassifier, GradientBoostingRegressor\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_squared_error\n\n# AdaBoost with decision stumps\nX, y = make_moons(n_samples=500, noise=0.3, random_state=42)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)\nada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=200,\n                         learning_rate=0.5, random_state=42).fit(X_tr, y_tr)\nprint(\"AdaBoost accuracy:\", round(ada.score(X_te, y_te), 3))\nprint(\"First 5 learner weights (alpha):\", ada.estimator_weights_[:5].round(2))\n\n# Gradient boosting for regression\nXr, yr = make_regression(n_samples=500, n_features=5, noise=15, random_state=0)\nXr_tr, Xr_te, yr_tr, yr_te = train_test_split(Xr, yr, test_size=0.3, random_state=0)\ngbr = GradientBoostingRegressor(n_estimators=300, learning_rate=0.1, max_depth=3, random_state=0).fit(Xr_tr, yr_tr)\nprint(\"Gradient Boosting test MSE:\", round(mean_squared_error(yr_te, gbr.predict(Xr_te)), 1))"
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Bagging / Random Forest",
        "Boosting"
      ],
      "rows": [
        [
          "Training",
          "Parallel, independent models",
          "Sequential, each depends on the previous"
        ],
        [
          "Data sampling",
          "Random bootstrap samples",
          "Re-weighted data or residuals"
        ],
        [
          "Main goal",
          "Reduce variance",
          "Reduce bias"
        ],
        [
          "Base learners",
          "Strong, deep, high-variance",
          "Weak, shallow, high-bias"
        ],
        [
          "Voting",
          "Equal weight",
          "Weighted by performance"
        ],
        [
          "Overfitting risk",
          "Low",
          "Higher on noisy data; needs tuning"
        ],
        [
          "Speed",
          "Can use all CPU cores",
          "Slower, cannot be fully parallelized"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Stacking"
    },
    {
      "type": "p",
      "text": "Stacking (stacked generalization) replaces fixed voting rules with a learned one. Several different base models (level-0 learners) make predictions, and a final model called the meta-learner or blender (level-1) is trained to take those predictions as its input features and output the final answer. To avoid leakage, the meta-learner is trained on out-of-fold predictions: each base model predicts only on data it did not train on."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Split the data",
          "text": "Divide the training data into folds (cross-validation)."
        },
        {
          "num": "2",
          "title": "Train base learners",
          "text": "Fit diverse models (for example k-NN, random forest, SVM) on the training folds."
        },
        {
          "num": "3",
          "title": "Create meta-features",
          "text": "Collect each base model's predictions on the held-out folds; these become a new dataset."
        },
        {
          "num": "4",
          "title": "Train the blender",
          "text": "Fit the meta-learner (often logistic regression) on the meta-features and the true labels."
        },
        {
          "num": "5",
          "title": "Predict",
          "text": "For new data, run the base models, then feed their outputs to the blender."
        }
      ]
    },
    {
      "type": "code-block",
      "label": "Stacking Classifier",
      "code": "from sklearn.datasets import load_breast_cancer\nfrom sklearn.ensemble import StackingClassifier, RandomForestClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.svm import SVC\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import cross_val_score\n\nX, y = load_breast_cancer(return_X_y=True)\n\nbase = [\n    (\"knn\", make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7))),\n    (\"svm\", make_pipeline(StandardScaler(), SVC(probability=True, random_state=0))),\n    (\"rf\",  RandomForestClassifier(n_estimators=200, random_state=0)),\n]\nstack = StackingClassifier(estimators=base, final_estimator=LogisticRegression(max_iter=1000), cv=5)\n\nfor name, model in base + [(\"STACK\", stack)]:\n    print(f\"{name:6s} 5-fold accuracy = {cross_val_score(model, X, y, cv=5).mean():.3f}\")"
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is ensemble learning and why does it improve accuracy?",
        "Q2: Differentiate bagging and pasting, and explain out-of-bag evaluation.",
        "Q3: How does a random forest differ from plain bagging of decision trees? How is feature importance computed?",
        "Q4: A weak learner in AdaBoost has weighted error 0.25. Compute its weight α and explain what happens to misclassified instances.",
        "Q5: Differentiate bagging and boosting (any five points) and explain how stacking differs from both."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Ensemble learning combines multiple base models into one predictor. If the models are reasonably accurate and make different errors, the errors tend to cancel out when their outputs are combined, giving lower variance (bagging) or lower bias (boosting) than any single model."
    },
    {
      "type": "p",
      "text": "A2: Bagging samples training instances with replacement, pasting samples without replacement. In bagging, about 36.8% of instances are left out of each model's bootstrap sample; these out-of-bag instances are used to evaluate that model, and aggregated OOB predictions give a validation-like accuracy score without a separate validation set."
    },
    {
      "type": "p",
      "text": "A3: Random forest is bagged decision trees plus random feature selection at every split, which decorrelates the trees and reduces variance further. Feature importance is the average impurity (Gini) decrease contributed by splits on each feature across all trees, normalized to sum to 1; permutation importance is a more robust alternative."
    },
    {
      "type": "p",
      "text": "A4: α = ½ ln((1 − 0.25) / 0.25) = ½ ln 3 = 0.549. Misclassified instances have their weights multiplied by e^0.549 = √3 ≈ 1.73 before normalization (and correct ones scaled down), so the next weak learner focuses on them."
    },
    {
      "type": "p",
      "text": "A5: Bagging trains independent models in parallel on bootstrap samples, reduces variance, votes with equal weights. Boosting trains sequentially, each model correcting the last, reduces bias, weights learners by accuracy and is more prone to overfitting noisy data. Stacking trains diverse base models and then learns a meta-model on their out-of-fold predictions instead of using a fixed voting or weighting rule."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Ensembles win by combining diverse learners. Voting, averaging and weighted averaging are the basic combiners. Bagging and pasting reduce variance by training on resampled data, with OOB evaluation as a free bonus, and random patches and subspaces extend the idea to features. Random forests and Extra-Trees add feature-level randomness and expose feature importance. Boosting (AdaBoost, gradient boosting) builds learners in sequence to shrink bias, and stacking trains a meta-model to blend heterogeneous learners."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: high variance, so bag it; high bias, so boost it; different model families, so stack them. That one sentence answers the 'when do I use which' follow-up in a viva. Next, Part 5 tackles the problem of too many features with dimensionality reduction and ends with learning theory (PAC and VC)."
    },
    {
      "type": "cta",
      "text": "Continue to Part 5: Dimensionality Reduction →",
      "href": "/tutorials/ml-exam-mastery/part-5-dimensionality-reduction",
      "note": "Curse of dimensionality, PCA variants, Kernel PCA, PAC learning and VC dimension"
    }
  ]
};

export default post;
