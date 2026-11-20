const post = {
  "slug": "part-4-ensemble-learning",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 4,
  "totalParts": 5,
  "title": "Ensemble Learning & Random Forests (Part 4)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "40 min read",
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
      "type": "h3",
      "text": "Why ensembles work: two arguments you can quote"
    },
    {
      "type": "p",
      "text": "Argument 1, majority voting. Suppose n classifiers each have accuracy p > 0.5 and make independent errors. The majority is correct whenever more than half of them are correct, which has a binomial probability: P(majority correct) = Σₖ C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ for k > n/2. Five independent models of accuracy 0.70 already give 0.837, and 25 of them give 0.983. The table printed by the code below also shows the catch: if each model is worse than chance (p = 0.45), adding more models makes the ensemble worse, not better."
    },
    {
      "type": "p",
      "text": "Argument 2, variance. The average of n predictors, each with variance σ² and pairwise correlation ρ, has variance ρσ² + (1 − ρ)σ² / n. The second term vanishes as n grows, but the first term does not. If the models are independent (ρ = 0) the variance falls to σ²/n, but if they are strongly correlated (ρ = 0.9) averaging 100 models barely helps. This is the mathematical reason why diversity is the real currency of ensembles, and why random forests deliberately decorrelate their trees."
    },
    {
      "type": "code-block",
      "label": "Why Combining Models Helps: Majority-Vote Accuracy and Variance of an Average",
      "code": "from math import comb\n\ndef majority_accuracy(n, p):\n    \"\"\"P(majority of n independent classifiers is correct), each with accuracy p (n odd).\"\"\"\n    return sum(comb(n, k) * p**k * (1 - p)**(n - k) for k in range(n // 2 + 1, n + 1))\n\nprint(\"models  p=0.60  p=0.70  p=0.45\")\nfor n in (1, 3, 5, 11, 25, 101):\n    print(f\"{n:6d}  {majority_accuracy(n, 0.60):.3f}   {majority_accuracy(n, 0.70):.3f}   {majority_accuracy(n, 0.45):.3f}\")\n\n# Variance of the average of n predictors, each with variance s2 and pairwise correlation rho:\n#   Var = rho * s2 + (1 - rho) * s2 / n\ns2, n = 1.0, 100\nprint(\"\\ncorrelation  variance of the average of 100 models\")\nfor rho in (0.0, 0.3, 0.6, 0.9):\n    print(f\"{rho:11.1f}  {rho * s2 + (1 - rho) * s2 / n:.3f}\")\n\n# Output:\n#   models  p=0.60  p=0.70  p=0.45\n#        1  0.600   0.700   0.450\n#        3  0.648   0.784   0.425\n#        5  0.683   0.837   0.407\n#       11  0.753   0.922   0.367\n#       25  0.846   0.983   0.306\n#      101  0.979   1.000   0.156\n#\n#   correlation  variance of the average of 100 models\n#           0.0  0.010\n#           0.3  0.307\n#           0.6  0.604\n#           0.9  0.901"
    },
    {
      "type": "p",
      "text": "What to notice: with p = 0.70 the ensemble accuracy climbs from 0.700 (one model) to 0.837 (5 models) and 0.983 (25 models). With p = 0.60 it needs about 100 models to reach 0.979. With p = 0.45 the ensemble collapses to 0.156 at 101 models. In the variance table, 100 independent models give variance 0.010, but at ρ = 0.9 the variance stays at 0.901, almost the same as a single model."
    },
    {
      "type": "table",
      "headers": [
        "Condition",
        "Why it is needed"
      ],
      "rows": [
        [
          "Each base learner is better than chance",
          "Otherwise combining amplifies the errors, as the p = 0.45 column shows"
        ],
        [
          "Errors are diverse (low correlation)",
          "Only uncorrelated errors cancel; the ρσ² term is a floor that adding models cannot remove"
        ],
        [
          "A sensible combination rule",
          "Equal votes, weights or a learned meta-model; the rule decides how diversity is converted into accuracy"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam sentence: 'Ensembles reduce error because the errors of diverse models partly cancel when combined: bagging mainly reduces variance, boosting mainly reduces bias, and stacking learns the best way to combine models. They fail when the models are all wrong in the same way (high correlation) or individually worse than chance.'"
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
      "type": "h3",
      "text": "Choosing weights and handling ties"
    },
    {
      "type": "p",
      "text": "A weighted average is only as good as its weights. A simple and defensible rule is to weight each model in inverse proportion to its validation error, then normalize so that the weights sum to 1. The example below has three regression models with validation MSE of 4, 9 and 36; the least accurate model predicts a much higher price than the others, so the plain average is pulled upward."
    },
    {
      "type": "code-block",
      "label": "Inverse-Error Weights, Weighted Average and a Voting Tie",
      "code": "import numpy as np\n\n# Validation errors (MSE) of three regression models and their predictions for one house\nval_mse = np.array([4.0, 9.0, 36.0])\npred = np.array([52.0, 58.0, 70.0])            # lakh\n\n# A simple, defensible rule: weight each model by 1 / validation error, then normalise\nw = 1 / val_mse\nw = w / w.sum()\nprint(\"weights:\", np.round(w, 3), \"(sum =\", round(float(w.sum()), 3), \")\")\nprint(\"simple average  :\", round(float(pred.mean()), 2))\nprint(\"weighted average:\", round(float(w @ pred), 2))\n\n# Max voting with an even number of models can tie\nvotes = np.array([1, 1, 0, 0])\nprint(\"4 models vote\", votes.tolist(), \"-> class 1 votes:\", int(votes.sum()), \"of\", len(votes), \"(a tie!)\")\n\n# Output:\n#   weights: [0.643 0.286 0.071] (sum = 1.0 )\n#   simple average  : 60.0\n#   weighted average: 55.0\n#   4 models vote [1, 1, 0, 0] -> class 1 votes: 2 of 4 (a tie!)"
    },
    {
      "type": "p",
      "text": "What to notice: the weights come out as 0.643, 0.286 and 0.071, so the weighted prediction is 55.0 lakh against a plain average of 60.0, because the noisy model (MSE 36) now has little influence. The last two lines show why max voting is usually run with an odd number of models: with four models split 2 to 2 there is no majority and the tie needs a separate rule. Weights can also be chosen by a grid search on validation data, or learned automatically, which is exactly what stacking does."
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
      "type": "h3",
      "text": "Hard versus soft voting on one sample"
    },
    {
      "type": "p",
      "text": "Hard voting counts labels and ignores how sure each model is. Soft voting averages the predicted probabilities, so a confident model can outvote two hesitant ones. In the example below three models give the probability of class 1 for one test sample as 0.90, 0.40 and 0.45."
    },
    {
      "type": "code-block",
      "label": "Hard, Soft and Weighted Soft Voting for a Single Sample",
      "code": "import numpy as np\n\n# Predicted probability of class 1 from three models for one test sample\nproba = np.array([0.90, 0.40, 0.45])\n\nhard_votes = (proba >= 0.5).astype(int)\nhard = int(hard_votes.sum() > len(proba) / 2)\nsoft_mean = proba.mean()\nprint(\"hard votes:\", hard_votes.tolist(), \"-> predicted class\", hard)\nprint(f\"soft average probability = {soft_mean:.3f} -> predicted class {int(soft_mean >= 0.5)}\")\n\n# Weighted soft voting: trust the most reliable model more (weights sum to 1)\nweights = np.array([0.5, 0.25, 0.25])\nprint(f\"weighted soft probability = {weights @ proba:.3f} -> predicted class {int(weights @ proba >= 0.5)}\")\n\n# Output:\n#   hard votes: [1, 0, 0] -> predicted class 0\n#   soft average probability = 0.583 -> predicted class 1\n#   weighted soft probability = 0.663 -> predicted class 1"
    },
    {
      "type": "p",
      "text": "What to notice: two of the three models are below 0.5, so hard voting predicts class 0 by 2 votes to 1. But the first model is very confident (0.90), the other two barely lean towards class 0, and the mean probability is 0.583, so soft voting predicts class 1. Weighting the most reliable model by 0.5 pushes the probability to 0.663. This is why soft voting usually beats hard voting when the models produce well-calibrated probabilities."
    },
    {
      "type": "table",
      "headers": [
        "",
        "Hard voting",
        "Soft voting"
      ],
      "rows": [
        [
          "Combines",
          "Predicted labels (mode)",
          "Predicted probabilities (mean)"
        ],
        [
          "Needs probabilities?",
          "No",
          "Yes (predict_proba, e.g. SVC(probability=True))"
        ],
        [
          "Uses model confidence?",
          "No",
          "Yes"
        ],
        [
          "Best when",
          "Models only output labels or probabilities are unreliable",
          "Models are reasonably calibrated; usually the better default"
        ],
        [
          "Tie risk",
          "Yes with an even number of models",
          "Very low"
        ]
      ]
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
      "type": "h3",
      "text": "A bootstrap sample by hand"
    },
    {
      "type": "p",
      "text": "A bootstrap sample draws n rows with replacement from n rows. Some rows are drawn several times and others never; the rows that are never drawn are the out-of-bag rows. The code below draws one sample of 10 rows, lists what was used and what was left out, and then checks the 36.8% rule by simulation for increasing n."
    },
    {
      "type": "code-block",
      "label": "One Bootstrap Sample, Its Out-of-Bag Rows and the (1 − 1/n)ⁿ Rule",
      "code": "import numpy as np\n\nrng = np.random.default_rng(3)\nn = 10\nidx = rng.integers(0, n, size=n)                 # one bootstrap sample: draw n rows WITH replacement\nprint(\"bootstrap sample (row numbers):\", sorted(idx.tolist()))\nprint(\"rows used at least once       :\", sorted(set(idx.tolist())))\nprint(\"out-of-bag rows               :\", sorted(set(range(n)) - set(idx.tolist())))\n\n# Average out-of-bag fraction over many bootstrap samples, against the formula (1 - 1/n)^n\nfor n in (10, 100, 1000):\n    frac = np.mean([1 - len(np.unique(rng.integers(0, n, n))) / n for _ in range(2000)])\n    print(f\"n={n:<5d} simulated OOB fraction={frac:.3f}   formula (1-1/n)^n={(1 - 1 / n) ** n:.3f}\")\nprint(\"limit e^-1 =\", round(float(np.exp(-1)), 3))\n\n# Output:\n#   bootstrap sample (row numbers): [0, 0, 0, 1, 1, 2, 5, 8, 8, 8]\n#   rows used at least once       : [0, 1, 2, 5, 8]\n#   out-of-bag rows               : [3, 4, 6, 7, 9]\n#   n=10    simulated OOB fraction=0.350   formula (1-1/n)^n=0.349\n#   n=100   simulated OOB fraction=0.368   formula (1-1/n)^n=0.366\n#   n=1000  simulated OOB fraction=0.368   formula (1-1/n)^n=0.368\n#   limit e^-1 = 0.368"
    },
    {
      "type": "p",
      "text": "What to notice: in the sample of 10, rows 0 and 8 each appear three times, only five distinct rows were used, and five rows (3, 4, 6, 7, 9) are out-of-bag. Averaged over many samples, the out-of-bag fraction is 0.350 for n = 10 and settles at 0.368 for large n, matching (1 − 1/n)ⁿ and its limit e⁻¹ = 0.368. So each tree in a bagging ensemble trains on only about 63% distinct rows."
    },
    {
      "type": "h3",
      "text": "Why bagging reduces variance but not bias"
    },
    {
      "type": "p",
      "text": "The experiment below trains models on 150 different noisy training sets drawn from the same process (a noisy sine wave) and records every model's prediction at one fixed point. The spread of those predictions is the variance of the learning method; the distance of their average from the true value is the bias. A fully grown tree is a high-variance learner, so it is the ideal candidate for bagging."
    },
    {
      "type": "code-block",
      "label": "Measuring Bias and Variance of a Single Tree versus Bagged Trees",
      "code": "import numpy as np\nfrom sklearn.ensemble import BaggingRegressor\nfrom sklearn.tree import DecisionTreeRegressor\n\nrng = np.random.default_rng(0)\ntruth = lambda x: np.sin(2 * np.pi * x)\nx0 = np.array([[0.3]])                           # evaluate every model at this one point\n\nsingle, bagged = [], []\nfor _ in range(150):                             # 150 different training sets from the same process\n    x = rng.uniform(0, 1, 60)\n    y = truth(x) + rng.normal(0, 0.4, 60)\n    X = x.reshape(-1, 1)\n    single.append(DecisionTreeRegressor().fit(X, y).predict(x0)[0])\n    bagged.append(BaggingRegressor(DecisionTreeRegressor(), n_estimators=30,\n                                   random_state=0).fit(X, y).predict(x0)[0])\n\ntarget = float(truth(0.3))\nfor name, preds in ((\"single deep tree\", single), (\"bagged trees\", bagged)):\n    preds = np.array(preds)\n    print(f\"{name:17s} bias^2={(preds.mean() - target) ** 2:.4f}  variance={preds.var():.4f}\")\n\n# Output:\n#   single deep tree  bias^2=0.0000  variance=0.1408\n#   bagged trees      bias^2=0.0000  variance=0.0749"
    },
    {
      "type": "p",
      "text": "What to notice: bias² is essentially zero for both, but the variance of the prediction falls from 0.141 for a single deep tree to 0.075 for 30 bagged trees, nearly halved. Bagging therefore helps most when the base learner is unstable (small data changes cause big model changes), as with deep trees. Stable learners such as linear regression or k-NN with a large k change little between bootstrap samples, so bagging them gains almost nothing."
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
      "type": "h3",
      "text": "Out-of-bag evaluation by hand"
    },
    {
      "type": "p",
      "text": "Scikit-learn's oob_score=True hides the mechanics, so the code below does it manually. Every tree is trained on its own bootstrap sample. For each training row, only the trees that did not see that row are allowed to vote on it, and the majority of those votes is compared with the true label. The accuracy of these predictions is the OOB accuracy. A separate held-out test set is used only to check that the OOB estimate is trustworthy."
    },
    {
      "type": "code-block",
      "label": "Computing the OOB Accuracy Manually and Comparing It with a Test Set",
      "code": "import numpy as np\nfrom sklearn.datasets import make_moons\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n\nX, y = make_moons(n_samples=600, noise=0.3, random_state=11)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=11)\n\nrng = np.random.default_rng(11)\nn, n_trees = len(X_tr), 100\noob_votes = np.zeros((n, 2))                     # class votes collected only from trees that did NOT see the row\ntest_votes = np.zeros((len(X_te), 2))\n\nfor t in range(n_trees):\n    idx = rng.integers(0, n, n)                  # bootstrap sample\n    tree = DecisionTreeClassifier(random_state=t).fit(X_tr[idx], y_tr[idx])\n    oob = np.setdiff1d(np.arange(n), idx)        # rows this tree never saw\n    for row, pred in zip(oob, tree.predict(X_tr[oob])):\n        oob_votes[row, pred] += 1\n    for row, pred in enumerate(tree.predict(X_te)):\n        test_votes[row, pred] += 1\n\nhas_vote = oob_votes.sum(axis=1) > 0\noob_acc = (oob_votes[has_vote].argmax(axis=1) == y_tr[has_vote]).mean()\ntest_acc = (test_votes.argmax(axis=1) == y_te).mean()\nprint(f\"rows with at least one OOB vote: {has_vote.sum()} of {n}\")\nprint(f\"average trees voting per row   : {oob_votes.sum(axis=1).mean():.1f} of {n_trees}\")\nprint(f\"OOB accuracy  (no held-out data used): {oob_acc:.3f}\")\nprint(f\"Test accuracy (held-out data)        : {test_acc:.3f}\")\n\n# Output:\n#   rows with at least one OOB vote: 420 of 420\n#   average trees voting per row   : 36.7 of 100\n#   OOB accuracy  (no held-out data used): 0.905\n#   Test accuracy (held-out data)        : 0.883"
    },
    {
      "type": "p",
      "text": "What to notice: every one of the 420 training rows received at least one OOB vote, with on average 36.7 of the 100 trees voting on each row (the 36.8% rule again). The resulting OOB accuracy is 0.905, close to the 0.883 measured on the held-out test set of 180 rows, and it was obtained without removing any data from training. Two cautions: the OOB estimate needs enough trees so that every row has OOB votes, and it exists only for bootstrap sampling, so pasting has no OOB score."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "OOB evaluation",
        "Separate validation set / cross-validation"
      ],
      "rows": [
        [
          "Data used for training",
          "All of it",
          "Reduced by the held-out part (or repeated k times)"
        ],
        [
          "Extra cost",
          "None, it is a by-product of bagging",
          "Extra data split or k model fits"
        ],
        [
          "Works for",
          "Bagging, random forests, Extra-Trees with bootstrap=True",
          "Any model"
        ],
        [
          "Typical use",
          "Quick estimate of generalization and hyperparameter tuning for forests",
          "Final, independent performance report"
        ]
      ]
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
      "type": "h3",
      "text": "How much feature sampling is enough?"
    },
    {
      "type": "p",
      "text": "Feature sampling creates diversity, but too much starves each model of information and too little leaves the models identical. The sweep below keeps every training row (random subspaces) and varies the fraction of the 64 pixel features each tree may see. At 100% the trees all see the same rows and the same features, so the ensemble is simply 100 copies of one tree."
    },
    {
      "type": "code-block",
      "label": "Random Subspaces: Accuracy versus Fraction of Features per Model",
      "code": "from sklearn.datasets import load_digits\nfrom sklearn.ensemble import BaggingClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\n\nX, y = load_digits(return_X_y=True)              # 64 pixel features\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)\n\nprint(\"features per model   accuracy\")\nfor frac in (0.1, 0.25, 0.5, 1.0):\n    model = BaggingClassifier(DecisionTreeClassifier(random_state=0), n_estimators=100,\n                              bootstrap=False, max_samples=1.0,\n                              max_features=frac, bootstrap_features=False,\n                              random_state=0, n_jobs=-1).fit(X_tr, y_tr)\n    print(f\"{frac:>10.0%} ({int(64 * frac):2d} of 64)   {model.score(X_te, y_te):.3f}\")\n\n# Output:\n#   features per model   accuracy\n#          10% ( 6 of 64)   0.930\n#          25% (16 of 64)   0.972\n#          50% (32 of 64)   0.972\n#         100% (64 of 64)   0.863"
    },
    {
      "type": "p",
      "text": "What to notice: sampling 10% of the features (6 of 64) already gives 0.930, and 25% and 50% both reach 0.972. At 100% the accuracy falls to 0.863 because there is no diversity at all; the 100 trees are identical and the result equals one tree. This is the key lesson of the section: an ensemble of identical models is no better than one model, so some source of randomness (rows, features or both) is essential."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam tip: random patches = sample rows and columns; random subspaces = keep all rows, sample columns; bagging = sample rows with replacement; pasting = sample rows without replacement. Be ready to say which scikit-learn arguments (bootstrap, max_samples, bootstrap_features, max_features) produce each."
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
      "type": "h3",
      "text": "Why random feature subsets help: decorrelating the trees"
    },
    {
      "type": "p",
      "text": "Bootstrap samples alone do not make trees very different. If one feature is strongly predictive, every tree will choose it for its first split, and the trees will end up with similar structure and correlated errors. Recall that the variance of an average has a floor of ρσ²: correlated trees cannot be averaged away. By allowing each split to consider only a random subset of m features (commonly m = √p for classification and p/3 for regression), a random forest sometimes forces a tree to use its second- or third-best feature. Each tree becomes slightly worse on its own, but the forest becomes better because the trees are less correlated. This trade of a little bias for a larger variance reduction is the central idea of the algorithm."
    },
    {
      "type": "table",
      "headers": [
        "Hyperparameter",
        "Role",
        "Practical guidance"
      ],
      "rows": [
        [
          "n_estimators",
          "Number of trees",
          "More is never harmful, only slower; accuracy plateaus. Use 100-500 as a starting range."
        ],
        [
          "max_features",
          "Features considered at each split",
          "The key randomness control. sqrt is the classification default but it is worth tuning."
        ],
        [
          "max_depth, min_samples_leaf",
          "Size of each tree",
          "Deep trees are the norm; raise min_samples_leaf for noisy data."
        ],
        [
          "bootstrap and oob_score",
          "Sample rows with replacement and report the OOB score",
          "Leave bootstrap on to get the free OOB estimate."
        ],
        [
          "class_weight",
          "Re-weights classes",
          "Useful for imbalanced data (for example 'balanced')."
        ],
        [
          "n_jobs",
          "Parallel training",
          "-1 uses all cores; trees are independent, so training parallelizes almost perfectly."
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Effect of the Number of Trees and of max_features on a Random Forest",
      "code": "import warnings\nfrom sklearn.datasets import make_classification\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.tree import DecisionTreeClassifier\n\nwarnings.filterwarnings(\"ignore\")                # tiny forests have rows with no OOB vote\n# 40 features, only 6 informative: a setting where feature subsampling matters\nX, y = make_classification(n_samples=800, n_features=40, n_informative=6, n_redundant=0,\n                           flip_y=0.05, class_sep=1.0, random_state=4)\n\nprint(\"single deep tree CV accuracy:\", round(cross_val_score(DecisionTreeClassifier(random_state=0), X, y, cv=5).mean(), 3))\n\nprint(\"\\nn_estimators  OOB accuracy\")\nfor n in (10, 25, 100, 300, 600):\n    rf = RandomForestClassifier(n_estimators=n, oob_score=True, random_state=0, n_jobs=-1).fit(X, y)\n    print(f\"{n:12d}  {rf.oob_score_:.3f}\")\n\nprint(\"\\nmax_features   CV accuracy\")\nfor mf, label in ((1, \"1\"), (\"sqrt\", \"sqrt (6)\"), (20, \"20\"), (None, \"all (40)\")):\n    rf = RandomForestClassifier(n_estimators=200, max_features=mf, random_state=0, n_jobs=-1)\n    print(f\"{label:>12}   {cross_val_score(rf, X, y, cv=5).mean():.3f}\")\n\n# Output:\n#   single deep tree CV accuracy: 0.817\n#\n#   n_estimators  OOB accuracy\n#             10  0.736\n#             25  0.784\n#            100  0.833\n#            300  0.854\n#            600  0.855\n#\n#   max_features   CV accuracy\n#              1   0.785\n#       sqrt (6)   0.860\n#             20   0.863\n#       all (40)   0.872"
    },
    {
      "type": "p",
      "text": "What to notice: on this noisy 40-feature dataset a single deep tree scores 0.817 cross-validated accuracy. The forest's OOB accuracy rises with the number of trees (0.736 at 10, 0.833 at 100, 0.854 at 300) and then flattens (0.855 at 600), which shows diminishing returns. For max_features, a value of 1 makes trees too weak (0.785), while sqrt (0.860), 20 (0.863) and all 40 features (0.872) are close. The takeaway is honest and exam-safe: sqrt is a sensible default, not a guaranteed optimum, so max_features should be treated as a hyperparameter and tuned."
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
      "type": "table",
      "headers": [
        "Aspect",
        "Random Forest",
        "Extra-Trees"
      ],
      "rows": [
        [
          "Row sampling",
          "Bootstrap by default",
          "None by default (whole dataset)"
        ],
        [
          "Feature subset per split",
          "Random subset",
          "Random subset"
        ],
        [
          "Split threshold",
          "Searches for the best threshold of each candidate feature",
          "Draws a random threshold for each candidate feature, keeps the best of those"
        ],
        [
          "Training speed",
          "Slower (sorting and searching thresholds)",
          "Faster (no threshold search)"
        ],
        [
          "Bias / variance",
          "Lower bias, somewhat higher variance",
          "Slightly higher bias, lower variance"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Random Forest versus Extra-Trees, and a Random Threshold on One Split",
      "code": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.tree import DecisionTreeClassifier\n\n# Noisy data: only 5 of 40 features carry signal\nX, y = make_classification(n_samples=600, n_features=40, n_informative=5, n_redundant=0,\n                           flip_y=0.05, class_sep=0.8, random_state=2)\n\nmodels = {\n    \"single tree  \": DecisionTreeClassifier(random_state=2),\n    \"Random Forest\": RandomForestClassifier(n_estimators=300, random_state=2, n_jobs=-1),\n    \"Extra-Trees  \": ExtraTreesClassifier(n_estimators=300, random_state=2, n_jobs=-1),\n}\nfor name, model in models.items():\n    scores = cross_val_score(model, X, y, cv=5)\n    print(f\"{name} accuracy = {scores.mean():.3f} (+/- {scores.std():.3f})\")\n\n# What 'random threshold' means for ONE split of one feature\nrng = np.random.default_rng(0)\nx = np.array([1, 2, 3, 4, 5, 6, 7, 8.0]); lab = np.array([0, 0, 0, 0, 1, 1, 1, 1])\ngini = lambda l: 1 - sum((np.mean(l == c)) ** 2 for c in np.unique(l)) if len(l) else 0\ndef split_gini(t):\n    left, right = lab[x <= t], lab[x > t]\n    return (len(left) * gini(left) + len(right) * gini(right)) / len(lab)\nprint(\"\\nbest threshold (Random Forest searches):\", 4.5, \"-> weighted Gini\", round(split_gini(4.5), 3))\nt_rand = round(float(rng.uniform(x.min(), x.max())), 2)\nprint(f\"random threshold (Extra-Trees draws)   : {t_rand} -> weighted Gini {round(split_gini(t_rand), 3)}\")\n\n# Output:\n#   single tree   accuracy = 0.702 (+/- 0.037)\n#   Random Forest accuracy = 0.817 (+/- 0.028)\n#   Extra-Trees   accuracy = 0.818 (+/- 0.021)\n#\n#   best threshold (Random Forest searches): 4.5 -> weighted Gini 0.0\n#   random threshold (Extra-Trees draws)   : 5.46 -> weighted Gini 0.2"
    },
    {
      "type": "p",
      "text": "What to notice: on this noisy dataset both ensembles (0.817 and 0.818) beat a single tree (0.702) by a wide margin and are indistinguishable in accuracy, so Extra-Trees buys speed at no accuracy cost here. The second half shows why a random split is not as reckless as it sounds. On a perfectly separable feature the best threshold (4.5) gives a weighted Gini of 0.0 while a random threshold (5.46) gives 0.2, so each individual split is worse, but averaging hundreds of trees with different random thresholds smooths out the poor choices."
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
      "type": "h3",
      "text": "Impurity importance versus permutation importance"
    },
    {
      "type": "p",
      "text": "Impurity-based importance (mean decrease in impurity, MDI) is computed from the training data and the structure of the trees, so it measures how much the trees used a feature, not how useful the feature is on unseen data. It is also biased towards features with many distinct values, because such features offer many candidate thresholds and so many chances to produce a lucky split. Permutation importance shuffles one feature at a time on held-out data and measures the drop in score, so a feature that carries no real signal cannot hurt the score when shuffled."
    },
    {
      "type": "code-block",
      "label": "Impurity Importance versus Permutation Importance with Noise Features",
      "code": "import numpy as np\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.inspection import permutation_importance\nfrom sklearn.model_selection import train_test_split\n\nrng = np.random.default_rng(0)\nn = 1500\nsignal = rng.normal(size=n)                      # genuinely informative\nweak = rng.normal(size=n)                        # weakly informative\nnoise_cont = rng.normal(size=n)                  # pure noise, many distinct values\nnoise_cat = rng.integers(0, 3, n)                # pure noise, only 3 distinct values\ny = (signal + 0.4 * weak + rng.normal(scale=0.8, size=n) > 0).astype(int)\nX = np.column_stack([signal, weak, noise_cont, noise_cat])\nnames = [\"signal\", \"weak\", \"noise (continuous)\", \"noise (3 values)\"]\n\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.4, random_state=0)\nrf = RandomForestClassifier(n_estimators=300, min_samples_leaf=1, random_state=0, n_jobs=-1).fit(X_tr, y_tr)\nperm = permutation_importance(rf, X_te, y_te, n_repeats=20, random_state=0, n_jobs=-1)\n\nprint(\"feature              impurity (MDI)   permutation (test drop in accuracy)\")\nfor i, name in enumerate(names):\n    print(f\"{name:20s} {rf.feature_importances_[i]:12.3f}   {perm.importances_mean[i]:+.3f}\")\nprint(f\"\\ntrain accuracy={rf.score(X_tr, y_tr):.3f}, test accuracy={rf.score(X_te, y_te):.3f}\")\n\n# Output:\n#   feature              impurity (MDI)   permutation (test drop in accuracy)\n#   signal                      0.545   +0.285\n#   weak                        0.239   +0.064\n#   noise (continuous)          0.178   +0.007\n#   noise (3 values)            0.038   +0.006\n#\n#   train accuracy=1.000, test accuracy=0.822"
    },
    {
      "type": "p",
      "text": "What to notice: two features are real (signal, weak) and two are pure noise (one continuous, one with only 3 values). The forest memorizes the training data (train accuracy 1.000, test accuracy 0.822). MDI still gives the continuous noise feature an importance of 0.178, much more than the 3-valued noise feature (0.038), which shows the bias towards high-cardinality features. Permutation importance on the test set is correct: 0.285 for signal, 0.064 for weak, and about 0.007 for both noise features. Correlated features also share importance between them, so a low score for one of a correlated pair does not prove it is useless."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam sentence: 'Gini (MDI) importance is the total impurity decrease from splits on a feature averaged over all trees and normalized to 1; it is fast but computed on training data and biased towards continuous and high-cardinality features. Permutation importance is computed on held-out data and is more reliable for feature selection.'"
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
      "type": "h3",
      "text": "AdaBoost by hand: three rounds on ten points"
    },
    {
      "type": "p",
      "text": "The code implements AdaBoost from scratch with decision stumps on a one-dimensional dataset of 10 points whose labels alternate in blocks (+1 +1 +1 −1 −1 −1 +1 +1 +1 −1). No single threshold can classify this correctly, so one stump is a weak learner, but the weighted combination of three stumps can. Each round finds the stump with the lowest weighted error, computes α = ½ ln((1 − ε)/ε), multiplies the weight of each point by e^(−α·y·h(x)) and normalizes."
    },
    {
      "type": "code-block",
      "label": "AdaBoost from Scratch: Weighted Error, Learner Weight and Weight Updates",
      "code": "import numpy as np\n\n# 1-D toy data: 10 points, labels +1 / -1\nx = np.arange(10, dtype=float)\ny = np.array([1, 1, 1, -1, -1, -1, 1, 1, 1, -1])\nw = np.full(10, 0.1)                              # start with equal weights 1/m\n\ndef best_stump(x, y, w):\n    best = None\n    for t in np.arange(-0.5, 9.6, 1.0):          # candidate thresholds between points\n        for sign in (1, -1):\n            pred = np.where(x <= t, sign, -sign)\n            err = w[pred != y].sum()\n            if best is None or err < best[0]:\n                best = (err, t, sign)\n    return best\n\nlearners = []\nfor rnd in range(1, 4):\n    err, t, sign = best_stump(x, y, w)\n    alpha = 0.5 * np.log((1 - err) / err)\n    pred = np.where(x <= t, sign, -sign)\n    w = w * np.exp(-alpha * y * pred)             # up-weight mistakes, down-weight correct points\n    w = w / w.sum()                               # normalise\n    learners.append((alpha, t, sign))\n    final = np.sign(sum(a * np.where(x <= th, s, -s) for a, th, s in learners))\n    print(f\"round {rnd}: stump 'x<={t:.1f} -> {sign:+d}', error={err:.3f}, alpha={alpha:.3f}\")\n    print(f\"         new weights={np.round(w, 3)}\")\n    print(f\"         ensemble accuracy so far = {(final == y).mean():.0%}\")\n\n# Output:\n#   round 1: stump 'x<=2.5 -> +1', error=0.300, alpha=0.424\n#            new weights=[0.071 0.071 0.071 0.071 0.071 0.071 0.167 0.167 0.167 0.071]\n#            ensemble accuracy so far = 70%\n#   round 2: stump 'x<=8.5 -> +1', error=0.214, alpha=0.650\n#            new weights=[0.045 0.045 0.045 0.167 0.167 0.167 0.106 0.106 0.106 0.045]\n#            ensemble accuracy so far = 70%\n#   round 3: stump 'x<=5.5 -> -1', error=0.182, alpha=0.752\n#            new weights=[0.125 0.125 0.125 0.102 0.102 0.102 0.065 0.065 0.065 0.125]\n#            ensemble accuracy so far = 100%"
    },
    {
      "type": "p",
      "text": "What to notice: in round 1 the best stump misclassifies the three points x = 6, 7, 8 (weight 0.1 each), so ε = 0.300 and α = 0.424. After the update and normalization the three mistakes each carry 0.167 and the seven correct points carry 0.071 each. Notice that the three misclassified points now hold exactly half of the total weight (3 × 0.167 = 0.5); this always happens after normalization when ε < 0.5, and it forces the next stump to take them seriously. Round 2 has ε = 0.214, α = 0.650, and round 3 has ε = 0.182, α = 0.752. Each stump alone is weak (error between 18% and 30%), yet after three rounds the weighted vote sign(0.424·h₁ + 0.650·h₂ + 0.752·h₃) classifies all 10 points correctly. Learners with lower error receive a larger voting weight α."
    },
    {
      "type": "table",
      "headers": [
        "AdaBoost facts to remember",
        "Detail"
      ],
      "rows": [
        [
          "Instance weights",
          "Start at 1/m; misclassified points are multiplied by e^α and correct points by e^(−α), then all weights are normalized"
        ],
        [
          "Learner weight",
          "α = ½ ln((1 − ε)/ε); α > 0 only if ε < 0.5; ε = 0.5 gives α = 0; ε → 0 gives a very large α"
        ],
        [
          "Final prediction",
          "H(x) = sign( Σ αₜ hₜ(x) ), a weighted vote"
        ],
        [
          "learning_rate",
          "Shrinks each α; a smaller value needs more rounds but is usually more robust"
        ],
        [
          "Weakness",
          "Sensitive to label noise and outliers, because their weights keep growing"
        ]
      ]
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
      "type": "h3",
      "text": "Gradient boosting by hand: fitting residuals"
    },
    {
      "type": "p",
      "text": "For the squared-error loss L = ½(y − F)², the negative gradient with respect to the prediction F is exactly the residual y − F. That is why 'fit the next tree to the residuals' is gradient descent in function space. For other losses the residual is replaced by the negative gradient of that loss (for log-loss it is y − p, the difference between the label and the predicted probability). The code starts from the mean, fits a depth-1 stump to the residuals in each round and adds it with a learning rate of 0.5."
    },
    {
      "type": "code-block",
      "label": "Gradient Boosting for Regression from Scratch: Residuals, Shrinkage and MSE",
      "code": "import numpy as np\nfrom sklearn.tree import DecisionTreeRegressor\n\nx = np.array([[1], [2], [3], [4], [5], [6]], dtype=float)\ny = np.array([10, 12, 11, 30, 33, 31], dtype=float)\n\nlr = 0.5\nF = np.full_like(y, y.mean())                     # F0: a constant prediction (the mean)\nprint(f\"F0 = {y.mean():.2f}, MSE = {np.mean((y - F) ** 2):.2f}\")\n\nfor m in range(1, 6):\n    residual = y - F                              # negative gradient of squared error\n    stump = DecisionTreeRegressor(max_depth=1).fit(x, residual)\n    F = F + lr * stump.predict(x)                 # F <- F + eta * h(x)\n    print(f\"round {m}: residuals were {np.round(residual, 1)} -> MSE = {np.mean((y - F) ** 2):.3f}\")\nprint(\"final predictions:\", np.round(F, 1), \" targets:\", y)\n\n# Output:\n#   F0 = 21.17, MSE = 104.47\n#   round 1: residuals were [-11.2  -9.2 -10.2   8.8  11.8   9.8] -> MSE = 26.951\n#   round 2: residuals were [-6.1 -4.1 -5.1  3.8  6.8  4.8] -> MSE = 7.571\n#   round 3: residuals were [-3.5 -1.5 -2.5  1.2  4.2  2.2] -> MSE = 2.726\n#   round 4: residuals were [-2.3 -0.3 -1.3 -0.1  2.9  0.9] -> MSE = 1.318\n#   round 5: residuals were [-1.8  0.2 -0.8  0.4  2.  -0. ] -> MSE = 0.840\n#   final predictions: [10.9 12.  12.  29.8 31.2 31.2]  targets: [10. 12. 11. 30. 33. 31.]"
    },
    {
      "type": "p",
      "text": "What to notice: the starting constant F₀ = 21.17 has an MSE of 104.47. Each stump captures the dominant pattern in the current residuals (the gap between the low and high groups), and the MSE falls to 26.95, 7.57, 2.73, 1.32 and 0.84. The residuals shrink every round, but because of the learning rate each stump only closes half of the remaining gap, which is the shrinkage that makes gradient boosting generalize better than taking full steps."
    },
    {
      "type": "table",
      "headers": [
        "Hyperparameter",
        "Effect",
        "Guidance"
      ],
      "rows": [
        [
          "n_estimators",
          "Number of boosting rounds",
          "Too many overfits; choose with early stopping or validation"
        ],
        [
          "learning_rate η",
          "Step size of each tree",
          "Small η (0.01-0.1) with more trees is the standard, most reliable recipe"
        ],
        [
          "max_depth",
          "Complexity of each tree",
          "Shallow trees (depth 3-5) keep learners weak"
        ],
        [
          "subsample",
          "Fraction of rows per tree",
          "Values below 1 give stochastic gradient boosting: faster and less overfit"
        ],
        [
          "min_samples_leaf, regularization",
          "Smoothness of each tree",
          "Increase for noisy data"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Learning Rate versus Number of Trees, and Early Stopping",
      "code": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import train_test_split\n\nX, y = make_classification(n_samples=1500, n_features=20, n_informative=6, flip_y=0.08, random_state=1)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=1)\n\nprint(\"learning_rate  best n_trees  best test accuracy  test accuracy at 400 trees\")\nfor lr in (0.5, 0.1, 0.02):\n    gb = GradientBoostingClassifier(n_estimators=400, learning_rate=lr, max_depth=3, random_state=1).fit(X_tr, y_tr)\n    acc = np.array([(pred == y_te).mean() for pred in gb.staged_predict(X_te)])\n    print(f\"{lr:13.2f}  {acc.argmax() + 1:11d}  {acc.max():18.3f}  {acc[-1]:26.3f}\")\n\n# Early stopping chooses the number of trees automatically from an internal validation split\ngb = GradientBoostingClassifier(n_estimators=1000, learning_rate=0.1, max_depth=3,\n                                validation_fraction=0.2, n_iter_no_change=15, random_state=1).fit(X_tr, y_tr)\nprint(f\"\\nearly stopping kept {gb.n_estimators_} of 1000 trees, test accuracy = {gb.score(X_te, y_te):.3f}\")\n\n# Output:\n#   learning_rate  best n_trees  best test accuracy  test accuracy at 400 trees\n#            0.50           55               0.856                       0.842\n#            0.10          171               0.853                       0.840\n#            0.02          399               0.851                       0.849\n#\n#   early stopping kept 45 of 1000 trees, test accuracy = 0.853"
    },
    {
      "type": "p",
      "text": "What to notice: with a large learning rate of 0.5 the best test accuracy (0.856) occurs after only 55 trees and then declines to 0.842 at 400 trees, a sign of overfitting. With 0.1 the best is at 171 trees and with 0.02 at 399 trees, and the smaller the learning rate the less the accuracy suffers from adding too many trees. Early stopping removes the guesswork: it monitored an internal validation split, stopped after 45 trees and delivered 0.853 on the test set. In practice, libraries such as XGBoost, LightGBM, CatBoost and scikit-learn's HistGradientBoosting implement the same idea with extra regularization and much higher speed."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Boosting versus noise: because boosting keeps trying to fix the remaining errors, it will chase mislabelled points if you let it run too long. Use a small learning rate, shallow trees, subsampling and early stopping, and monitor validation error, not training error."
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
      "type": "h3",
      "text": "Which ensemble method should you reach for?"
    },
    {
      "type": "table",
      "headers": [
        "Situation",
        "Try first",
        "Reason"
      ],
      "rows": [
        [
          "Overfitting, high-variance base model such as a deep tree",
          "Bagging or random forest",
          "Averaging independent resamples cuts variance"
        ],
        [
          "Underfitting, weak or high-bias base model",
          "Boosting",
          "Sequential learners reduce bias"
        ],
        [
          "Need a strong default with little tuning on tabular data",
          "Random forest",
          "Robust, parallel, gives OOB score and importances"
        ],
        [
          "Want maximum accuracy on tabular data and can tune",
          "Gradient boosting (XGBoost, LightGBM, CatBoost)",
          "Typically the strongest on structured data"
        ],
        [
          "Have several different, already-good models",
          "Stacking (or soft voting if simple)",
          "Learns how to combine their different strengths"
        ],
        [
          "Data is very noisy or has label errors",
          "Random forest, or boosting with strong regularization",
          "Bagging is more robust to noise than aggressive boosting"
        ],
        [
          "Interpretability is essential",
          "Single tree, or a forest with permutation importance",
          "Ensembles trade transparency for accuracy"
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
      "type": "h3",
      "text": "Stacking by hand: why out-of-fold predictions matter"
    },
    {
      "type": "p",
      "text": "To train the blender, we need base-model predictions for the training rows. If each base model predicts rows that it has already trained on, the predictions are unrealistically good (a random forest can reproduce its own training labels almost perfectly), and the blender learns to trust the most overfit model. The remedy is to build the meta-features from out-of-fold predictions, using cross_val_predict, so that every prediction comes from a model that did not see that row. The code below builds both versions manually and trains a logistic regression blender on each."
    },
    {
      "type": "code-block",
      "label": "Manual Stacking with Out-of-Fold versus Leaky In-Sample Meta-Features",
      "code": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_predict, train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX, y = make_classification(n_samples=1200, n_features=15, n_informative=5, flip_y=0.1, class_sep=0.9, random_state=6)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=6)\n\nbases = {\"knn\": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=15)),\n         \"rf\": RandomForestClassifier(n_estimators=200, random_state=6, n_jobs=-1)}\n\n# Correct way: meta-features are OUT-OF-FOLD probabilities\noof = np.column_stack([cross_val_predict(m, X_tr, y_tr, cv=5, method=\"predict_proba\")[:, 1] for m in bases.values()])\n# Wrong way: meta-features are IN-SAMPLE probabilities (each model has already seen these rows)\nleaky = np.column_stack([m.fit(X_tr, y_tr).predict_proba(X_tr)[:, 1] for m in bases.values()])\ntest_meta = np.column_stack([m.predict_proba(X_te)[:, 1] for m in bases.values()])   # bases are fitted now\n\nfor name, meta in ((\"out-of-fold (correct)\", oof), (\"in-sample (leaky)   \", leaky)):\n    blender = LogisticRegression().fit(meta, y_tr)\n    print(f\"{name}: blender weights knn={blender.coef_[0][0]:+.2f}, rf={blender.coef_[0][1]:+.2f}, \"\n          f\"test accuracy={blender.score(test_meta, y_te):.3f}\")\nfor name, m in bases.items():\n    print(f\"base model {name:3s} alone: test accuracy={m.score(X_te, y_te):.3f}\")\n\n# Output:\n#   out-of-fold (correct): blender weights knn=+2.13, rf=+5.19, test accuracy=0.919\n#   in-sample (leaky)   : blender weights knn=+0.86, rf=+8.68, test accuracy=0.917\n#   base model knn alone: test accuracy=0.903\n#   base model rf  alone: test accuracy=0.914"
    },
    {
      "type": "p",
      "text": "What to notice: the correct stack reaches 0.919 test accuracy, slightly better than its best base model (random forest 0.914, k-NN 0.903). Its blender weights (k-NN +2.13, random forest +5.19) express how much each model is trusted. With leaky in-sample meta-features the random forest weight jumps to +8.68 because its in-sample probabilities look almost perfect. The test accuracy damage is small on this dataset (0.917) but the blender has learned the wrong weights, and the damage grows with more flexible base models or noisier labels."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Stacking (cross-validated)",
        "Blending (hold-out set)"
      ],
      "rows": [
        [
          "How meta-features are made",
          "Out-of-fold predictions on all training rows",
          "Predictions on one fixed hold-out set"
        ],
        [
          "Data efficiency",
          "Uses all training data for the blender",
          "Blender sees only the hold-out rows"
        ],
        [
          "Cost",
          "Higher: base models are refit across folds",
          "Lower: base models are fitted once"
        ],
        [
          "Leakage risk",
          "Low if done with cross_val_predict",
          "Low, but the hold-out split can be small and noisy"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Stacking tips: use diverse base models (a tree ensemble, a margin-based model and a distance-based model), keep the meta-learner simple (logistic regression or ridge) to avoid overfitting the meta-features, and remember that stacking costs more training and prediction time than any single model. passthrough=True also feeds the original features to the blender."
    },
    {
      "type": "h2",
      "text": "Exam Answer Frameworks for Unit IV"
    },
    {
      "type": "p",
      "text": "Unit IV questions reward a clear contrast and one formula per technique. Use this six-step frame for any 'Explain technique X' question, and keep the formula table in your head for the numerical parts."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "State the idea in one line",
          "text": "For example: 'Bagging trains the same learner on bootstrap samples in parallel and averages the results to reduce variance.'"
        },
        {
          "num": "2",
          "title": "Say how models are trained",
          "text": "Parallel and independent (bagging, forests), sequential and dependent (boosting), or heterogeneous with a meta-learner (stacking)."
        },
        {
          "num": "3",
          "title": "Say how predictions are combined",
          "text": "Equal vote or mean, weighted vote with α, sum of shrunken trees, or a learned blender."
        },
        {
          "num": "4",
          "title": "Name what it fixes",
          "text": "Variance (bagging), bias (boosting), the choice of combiner (stacking)."
        },
        {
          "num": "5",
          "title": "Show one number",
          "text": "The 36.8% OOB rule, α = ½ ln((1 − ε)/ε), a weighted average, or m = √p features per split."
        },
        {
          "num": "6",
          "title": "Give the limitation",
          "text": "Loss of interpretability and extra compute for all; noise sensitivity for boosting; leakage risk for stacking."
        }
      ]
    },
    {
      "type": "table",
      "headers": [
        "Technique",
        "The one formula or fact to quote"
      ],
      "rows": [
        [
          "Weighted average",
          "ŷ = Σ wᵢ ŷᵢ with Σ wᵢ = 1"
        ],
        [
          "Soft voting",
          "Average the predicted probabilities, then take the argmax"
        ],
        [
          "Bagging / OOB",
          "Probability a row is left out of a bootstrap sample = (1 − 1/n)ⁿ ≈ e⁻¹ ≈ 36.8%"
        ],
        [
          "Variance of an average",
          "ρσ² + (1 − ρ)σ²/n: correlation sets the floor"
        ],
        [
          "Random forest",
          "Features per split m ≈ √p (classification) or p/3 (regression)"
        ],
        [
          "AdaBoost",
          "α = ½ ln((1 − ε)/ε); H(x) = sign(Σ αₜ hₜ(x))"
        ],
        [
          "Gradient boosting",
          "F ← F + η · h(x), where h is fitted to the residuals y − F"
        ],
        [
          "Stacking",
          "Blender trained on out-of-fold predictions of the base models"
        ]
      ]
    },
    {
      "type": "h3",
      "text": "Rapid-fire viva questions"
    },
    {
      "type": "table",
      "headers": [
        "Question",
        "One-line answer"
      ],
      "rows": [
        [
          "Why use an odd number of models in max voting?",
          "To avoid ties between classes."
        ],
        [
          "Can bagging reduce bias?",
          "Not much; it mainly reduces variance. Boosting reduces bias."
        ],
        [
          "Why does a random forest sample features at each split?",
          "To decorrelate the trees so that averaging removes more variance."
        ],
        [
          "Can you compute an OOB score with pasting?",
          "No; without replacement there are no consistently unused rows to evaluate on."
        ],
        [
          "Why are boosting learners kept shallow?",
          "Weak learners with high bias are what boosting is designed to improve, and shallow trees reduce the risk of overfitting."
        ],
        [
          "Why use a small learning rate in gradient boosting?",
          "Small steps with many trees generalize better than a few large steps."
        ],
        [
          "When can boosting hurt?",
          "On noisy or mislabelled data it keeps fitting the errors, so regularization and early stopping are needed."
        ],
        [
          "Why must stacking use out-of-fold predictions?",
          "Otherwise the blender sees overly optimistic predictions and over-trusts overfit base models."
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
        "Q1: What is ensemble learning and why does it improve accuracy?",
        "Q2: Differentiate bagging and pasting, and explain out-of-bag evaluation.",
        "Q3: How does a random forest differ from plain bagging of decision trees? How is feature importance computed?",
        "Q4: A weak learner in AdaBoost has weighted error 0.25. Compute its weight α and explain what happens to misclassified instances.",
        "Q5: Differentiate bagging and boosting (any five points) and explain how stacking differs from both.",
        "Q6: Five independent classifiers each have accuracy 0.70. Compute the accuracy of their majority vote. Why does the calculation fail if the models are all copies of each other?",
        "Q7: Three models give the probability of class 1 as 0.90, 0.40 and 0.45. What do hard voting and soft voting predict? Explain the difference.",
        "Q8: A training set has 500 rows. What is the probability that a given row is out-of-bag for one tree of a bagging ensemble, and roughly how many OOB rows does each tree have?",
        "Q9: In AdaBoost with 10 equally weighted points, a stump misclassifies 4 of them. Compute ε, α and the normalized weights of the misclassified and correct points.",
        "Q10: Gradient boosting with squared error on y = (3, 5, 10) starts from the mean. A depth-1 tree fitted to the residuals predicts −2 for the first two points and 4 for the third. With learning rate 0.5, find the updated predictions and the MSE before and after."
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
      "type": "p",
      "text": "A6: P(majority correct) = P(3 or more of 5 correct) = C(5,3)(0.7)³(0.3)² + C(5,4)(0.7)⁴(0.3) + (0.7)⁵ = 0.3087 + 0.3602 + 0.1681 = 0.837, which is higher than 0.70. This relies on independent errors. If the models are copies of each other, they are always right or wrong together (correlation 1), so the vote equals one model's accuracy of 0.70 and nothing is gained."
    },
    {
      "type": "p",
      "text": "A7: Hard voting: the votes are 1, 0, 0, so the majority predicts class 0. Soft voting: the mean probability is (0.90 + 0.40 + 0.45) / 3 = 0.583 ≥ 0.5, so it predicts class 1. Hard voting counts only the labels, whereas soft voting uses each model's confidence, so one very confident model can outweigh two uncertain ones."
    },
    {
      "type": "p",
      "text": "A8: P(a given row is not drawn in one draw) = 1 − 1/500, so over 500 draws P(never drawn) = (1 − 1/500)⁵⁰⁰ = 0.367 ≈ e⁻¹. Each tree therefore has about 0.367 × 500 ≈ 184 out-of-bag rows, and trains on about 316 distinct rows. The OOB rows act as a free validation set for that tree."
    },
    {
      "type": "p",
      "text": "A9: ε = 4 × 0.1 = 0.4. α = ½ ln(0.6 / 0.4) = ½ ln 1.5 = 0.203. Multiply misclassified weights by e^0.203 = 1.225, giving 0.1225, and correct weights by e^(−0.203) = 0.816, giving 0.0816. The total is 4(0.1225) + 6(0.0816) = 0.980, so the normalized weights are 0.1225 / 0.980 = 0.125 for each misclassified point and 0.0816 / 0.980 = 0.0833 for each correct point. The four misclassified points now hold exactly half of the total weight (4 × 0.125 = 0.5)."
    },
    {
      "type": "p",
      "text": "A10: F₀ = mean = (3 + 5 + 10)/3 = 6, so the residuals are (−3, −1, 4) and the MSE is (9 + 1 + 16)/3 = 8.667. Update F₁ = F₀ + 0.5 × h: for the first two points 6 + 0.5(−2) = 5, and for the third 6 + 0.5(4) = 8. The new predictions are (5, 5, 8), the new residuals are (−2, 0, 2), and the MSE is (4 + 0 + 4)/3 = 2.667. One shrunken step cut the error by about two thirds."
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
