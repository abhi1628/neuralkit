const post = {
  "slug": "part-5-dimensionality-reduction",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 5,
  "totalParts": 5,
  "title": "Dimensionality Reduction & Learning Theory (Part 5)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "30 min read",
  "category": "Machine Learning",
  "categoryColor": "#f59e0b",
  "excerpt": "Curse of dimensionality, projection vs manifold learning, PCA (variance, components, explained variance ratio, compression), Randomized and Incremental PCA, Kernel PCA, and PAC and VC learning theory.",
  "coverEmoji": "🤖",
  "tags": [
    "Machine Learning",
    "PCA",
    "Dimensionality Reduction",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "The final unit deals with two big ideas. The first is dimensionality reduction: real datasets often have hundreds or thousands of features, most of them redundant, and reducing them speeds up training, fights overfitting and makes visualization possible. The second is learning theory: PAC learning and the VC dimension give mathematical answers to 'how much data do I need, and when can I trust a model?'. This part covers PCA and all its variants in the syllabus, Kernel PCA, and the definitions and bounds examiners ask for in learning theory."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Explain the curse of dimensionality' (5 marks), 'Explain PCA with steps' (7-10 marks), 'Differentiate projection and manifold learning' (5 marks), 'Explained variance ratio and choosing the number of components' (5 marks), 'Compare Randomized PCA and Incremental PCA' (5 marks), 'What is Kernel PCA?' (5 marks), 'Explain PAC learning and VC dimension' (7 marks), and small numerical on sample complexity."
    },
    {
      "type": "h2",
      "text": "The Curse of Dimensionality"
    },
    {
      "type": "p",
      "text": "The curse of dimensionality refers to the set of problems that appear as the number of features grows. In high dimensions, data becomes extremely sparse: the volume of the space grows exponentially, so the same number of samples covers a vanishing fraction of it. Distances between points become nearly equal, so distance-based methods such as k-NN and k-means lose their meaning. Models get more parameters and overfit more easily, and training becomes slower and needs exponentially more data to keep the same density."
    },
    {
      "type": "callout",
      "icon": "🍳",
      "text": "Real-life analogy: searching for a friend along a 100 m street (1 dimension) is easy. Searching for them across a 100 m × 100 m field (2 dimensions) is harder. In a 100 m cube of open space (3 dimensions) it is far worse. Every added dimension multiplies the space you must cover, but your search party stays the same size."
    },
    {
      "type": "code-block",
      "label": "Distances Concentrate in High Dimensions",
      "code": "import numpy as np\n\nrng = np.random.default_rng(0)\nfor d in (2, 10, 100, 1000, 5000):\n    pts = rng.random((500, d))\n    a, b = pts[:250], pts[250:]\n    dist = np.linalg.norm(a - b, axis=1)                 # distances between random pairs\n    print(f\"d={d:5d}  mean dist={dist.mean():7.2f}  relative spread (std/mean)={dist.std() / dist.mean():.3f}\")\n# The relative spread shrinks with d: all points look almost equally far apart."
    },
    {
      "type": "h2",
      "text": "Main Approaches for Dimensionality Reduction"
    },
    {
      "type": "table",
      "headers": [
        "Approach",
        "Idea",
        "Best when",
        "Examples"
      ],
      "rows": [
        [
          "Projection",
          "Data lies close to a lower-dimensional flat subspace (a line or plane); project points onto it",
          "Features are correlated and the structure is roughly linear",
          "PCA, Random Projection, LDA"
        ],
        [
          "Manifold Learning",
          "Data lies on a curved lower-dimensional manifold twisted inside the high-dimensional space; 'unroll' it",
          "Structure is non-linear (for example a rolled-up sheet, the Swiss roll)",
          "Kernel PCA, LLE, Isomap, t-SNE"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Manifold hypothesis: most real high-dimensional data (images of faces, handwritten digits) lies close to a much lower-dimensional manifold. Projection can flatten and destroy a rolled-up manifold, whereas manifold learning models its intrinsic shape."
    },
    {
      "type": "h2",
      "text": "Principal Component Analysis (PCA)"
    },
    {
      "type": "h2",
      "text": "Preserving the Variance"
    },
    {
      "type": "p",
      "text": "PCA is the most popular projection method. It finds the flat subspace that the data lies closest to, and projects onto it. Among all candidate axes, it picks the one that preserves the maximum variance, because that axis loses the least information and gives the smallest mean squared distance between the original data and its projection."
    },
    {
      "type": "h2",
      "text": "Principal Components"
    },
    {
      "type": "p",
      "text": "The first principal component (PC1) is the axis along which the data has the largest variance. PC2 is the axis orthogonal to PC1 with the largest remaining variance, PC3 is orthogonal to both, and so on, for as many components as there are dimensions. Mathematically the principal components are the eigenvectors of the covariance matrix, and the eigenvalues give the variance carried by each. In practice they are found with Singular Value Decomposition (SVD) of the centred data matrix X = U Σ Vᵀ, where the columns of V are the principal components."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Standardize / centre the data",
          "text": "Subtract the mean of each feature (and usually scale to unit variance)."
        },
        {
          "num": "2",
          "title": "Compute the covariance matrix",
          "text": "C = (1/(m−1)) XᵀX for centred X."
        },
        {
          "num": "3",
          "title": "Find eigenvectors and eigenvalues",
          "text": "Solve C v = λ v, or equivalently take the SVD of X."
        },
        {
          "num": "4",
          "title": "Sort components",
          "text": "Order eigenvectors by decreasing eigenvalue (variance explained)."
        },
        {
          "num": "5",
          "title": "Select the top d",
          "text": "Keep the d eigenvectors with the largest eigenvalues, forming the matrix W_d."
        },
        {
          "num": "6",
          "title": "Project",
          "text": "Transform the data: X_d = X · W_d."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Projecting Down to d Dimensions"
    },
    {
      "type": "p",
      "text": "To reduce the dataset to d dimensions, take the first d principal components as the columns of W_d (an n × d matrix) and compute X_d = X · W_d, where X is the m × n centred data matrix. The result X_d is an m × d matrix, the lower-dimensional representation. Multiplying back with W_dᵀ gives an approximate reconstruction in the original space."
    },
    {
      "type": "code-block",
      "label": "PCA from Scratch (Eigen-decomposition) vs scikit-learn",
      "code": "import numpy as np\nfrom sklearn.datasets import load_iris\nfrom sklearn.decomposition import PCA\n\nX = load_iris().data\nXc = X - X.mean(axis=0)                                   # 1) centre\n\ncov = np.cov(Xc, rowvar=False)                            # 2) covariance matrix\neigvals, eigvecs = np.linalg.eigh(cov)                    # 3) eigen-decomposition\norder = np.argsort(eigvals)[::-1]                         # 4) sort by variance\neigvals, eigvecs = eigvals[order], eigvecs[:, order]\n\nW2 = eigvecs[:, :2]                                       # 5) keep top 2 components\nX2_manual = Xc @ W2                                       # 6) project: X_d = X . W_d\n\npca = PCA(n_components=2).fit(X)\nX2_sklearn = pca.transform(X)\n\nprint(\"Manual eigenvalue ratios:\", (eigvals / eigvals.sum()).round(3))\nprint(\"sklearn explained variance ratio:\", pca.explained_variance_ratio_.round(3))\nprint(\"Same projection up to sign:\", np.allclose(np.abs(X2_manual), np.abs(X2_sklearn), atol=1e-6))"
    },
    {
      "type": "h2",
      "text": "Explained Variance Ratio"
    },
    {
      "type": "p",
      "text": "The explained variance ratio of a component is the proportion of the dataset's total variance that lies along that component: λᵢ / Σλⱼ. It tells you how much information each component carries. For the Iris data, the first component alone explains about 92% of the variance."
    },
    {
      "type": "h2",
      "text": "Choosing the Right Number of Dimensions"
    },
    {
      "type": "p",
      "text": "Instead of picking d arbitrarily, choose the smallest d whose cumulative explained variance reaches a target such as 95%. Three common ways to decide: (1) the cumulative explained variance threshold, in scikit-learn simply PCA(n_components=0.95); (2) the elbow in the scree plot, where the explained variance curve flattens; (3) treat d as a hyperparameter and pick the value that gives the best score of a downstream model. For visualization, d is fixed at 2 or 3."
    },
    {
      "type": "code-block",
      "label": "Choosing d with Cumulative Explained Variance",
      "code": "import numpy as np\nfrom sklearn.datasets import load_digits\nfrom sklearn.decomposition import PCA\n\nX, _ = load_digits(return_X_y=True)          # 64 features per image\nprint(\"Original dimensions:\", X.shape[1])\n\npca_full = PCA().fit(X)\ncumvar = np.cumsum(pca_full.explained_variance_ratio_)\nd95 = int(np.argmax(cumvar >= 0.95)) + 1\nprint(\"Dimensions needed for 95% variance:\", d95)\n\npca95 = PCA(n_components=0.95).fit(X)         # scikit-learn does this automatically\nprint(\"PCA(n_components=0.95) chose:\", pca95.n_components_, \"components\")\nprint(\"Cumulative variance for first 10 components:\", cumvar[:10].round(3))"
    },
    {
      "type": "h2",
      "text": "PCA for Compression"
    },
    {
      "type": "p",
      "text": "After dimensionality reduction the dataset takes much less space. Compression is possible because you can apply the inverse transformation, X_recovered = X_d · W_dᵀ (plus the mean), to approximately reconstruct the original data. The difference between the original and the recovered data is the reconstruction error; it is small when the retained components carry most of the variance. This is lossy compression, since the dropped components are gone for good."
    },
    {
      "type": "code-block",
      "label": "PCA Compression and Reconstruction Error on Digits",
      "code": "import numpy as np\nfrom sklearn.datasets import load_digits\nfrom sklearn.decomposition import PCA\n\nX, _ = load_digits(return_X_y=True)\n\nfor d in (5, 15, 30):\n    pca = PCA(n_components=d).fit(X)\n    X_compressed = pca.transform(X)                       # 64 -> d numbers per image\n    X_recovered = pca.inverse_transform(X_compressed)     # back to 64 numbers\n    error = np.mean((X - X_recovered) ** 2)\n    ratio = X.shape[1] / d\n    print(f\"d={d:2d}  compression {ratio:4.1f}x  variance kept={pca.explained_variance_ratio_.sum():.3f}  reconstruction MSE={error:.3f}\")"
    },
    {
      "type": "h2",
      "text": "Randomized PCA and Incremental PCA"
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Randomized PCA",
        "Incremental PCA (IPCA)"
      ],
      "rows": [
        [
          "Problem solved",
          "Standard SVD is too slow for large datasets",
          "Full dataset does not fit in memory"
        ],
        [
          "Idea",
          "A stochastic algorithm that quickly finds an approximation of the first d principal components",
          "Split the data into mini-batches and feed them one at a time; updates the components incrementally"
        ],
        [
          "Speed",
          "Much faster than full SVD when d is much smaller than n",
          "Slower than full PCA per pass, but memory-light"
        ],
        [
          "Result",
          "Approximate",
          "Close approximation, comparable to normal PCA"
        ],
        [
          "Supports online learning",
          "No",
          "Yes: new data can be added with partial_fit"
        ],
        [
          "scikit-learn",
          "PCA(svd_solver=\"randomized\")",
          "IncrementalPCA(n_components=d).partial_fit(batch)"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Randomized PCA and Incremental PCA",
      "code": "import numpy as np\nfrom sklearn.datasets import load_digits\nfrom sklearn.decomposition import PCA, IncrementalPCA\n\nX, _ = load_digits(return_X_y=True)\n\n# Randomized PCA\nrnd = PCA(n_components=20, svd_solver=\"randomized\", random_state=42).fit(X)\nfull = PCA(n_components=20, svd_solver=\"full\").fit(X)\nprint(\"Variance kept - randomized:\", rnd.explained_variance_ratio_.sum().round(4),\n      \" full:\", full.explained_variance_ratio_.sum().round(4))\n\n# Incremental PCA: feed data in mini-batches\nipca = IncrementalPCA(n_components=20)\nfor batch in np.array_split(X, 10):\n    ipca.partial_fit(batch)\nprint(\"Variance kept - incremental:\", ipca.explained_variance_ratio_.sum().round(4))\nX_reduced = ipca.transform(X)\nprint(\"Reduced shape:\", X_reduced.shape)"
    },
    {
      "type": "h2",
      "text": "Kernel PCA"
    },
    {
      "type": "p",
      "text": "Standard PCA is linear, so it fails on data that lies on a curved manifold. Kernel PCA applies the kernel trick, the same idea used in SVM: it implicitly maps the data into a very high-dimensional feature space and performs PCA there, which corresponds to a non-linear projection in the original space. It is therefore good at preserving clusters after projection or unrolling twisted data such as the Swiss roll."
    },
    {
      "type": "table",
      "headers": [
        "Kernel",
        "Formula",
        "Notes"
      ],
      "rows": [
        [
          "Linear",
          "x · y",
          "Equals ordinary PCA"
        ],
        [
          "Polynomial",
          "(γ x·y + r)^d",
          "Captures polynomial interactions"
        ],
        [
          "RBF (Gaussian)",
          "exp(−γ ‖x − y‖²)",
          "Most common; gamma controls how local the mapping is"
        ],
        [
          "Sigmoid",
          "tanh(γ x·y + r)",
          "Resembles a neural network layer"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Selecting a Kernel and Tuning Hyperparameters"
    },
    {
      "type": "p",
      "text": "Kernel PCA is unsupervised, so there is no obvious performance measure to tune against. Two standard strategies exist. The first is to treat the reduction as a preprocessing step for a supervised task, and use grid search to choose the kernel and hyperparameters (such as gamma) that give the best final classifier accuracy. The second is unsupervised: choose the hyperparameters that minimize the reconstruction pre-image error, the difference between the original data and the data mapped back from the reduced representation."
    },
    {
      "type": "code-block",
      "label": "Kernel PCA Tuned by Grid Search for a Downstream Classifier",
      "code": "from sklearn.datasets import make_moons\nfrom sklearn.decomposition import PCA, KernelPCA\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.model_selection import GridSearchCV, train_test_split\n\nX, y = make_moons(n_samples=500, noise=0.1, random_state=0)\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)\n\n# Baseline: linear PCA keeps the moons tangled together\nlin = Pipeline([(\"pca\", PCA(n_components=2)), (\"clf\", LogisticRegression())]).fit(X_tr, y_tr)\nprint(\"Linear PCA + LogReg accuracy:\", round(lin.score(X_te, y_te), 3))   # about 0.86\n\npipe = Pipeline([(\"kpca\", KernelPCA(n_components=2)), (\"clf\", LogisticRegression())])\ngrid = {\n    \"kpca__kernel\": [\"rbf\", \"sigmoid\", \"poly\"],\n    \"kpca__gamma\": [0.01, 0.1, 1.0, 5.0, 10.0, 15.0, 20.0],\n}\nsearch = GridSearchCV(pipe, grid, cv=3).fit(X_tr, y_tr)\nprint(\"Best hyperparameters:\", search.best_params_)\nprint(\"Kernel PCA + LogReg accuracy:\", round(search.score(X_te, y_te), 3))   # RBF with large gamma wins (about 0.97)"
    },
    {
      "type": "h2",
      "text": "Learning Theory: PAC and VC Model"
    },
    {
      "type": "p",
      "text": "Learning theory asks: when can a learning algorithm be guaranteed to work, and how many training examples does it need? PAC learning and the VC dimension are its two central tools."
    },
    {
      "type": "h2",
      "text": "PAC Learning (Probably Approximately Correct)"
    },
    {
      "type": "p",
      "text": "A concept class is PAC-learnable if there exists an algorithm that, for any accuracy parameter ε (0 < ε < 1) and confidence parameter δ (0 < δ < 1), outputs with probability at least 1 − δ a hypothesis whose true error is at most ε, using a number of samples (and time) that is polynomial in 1/ε, 1/δ and the problem size. 'Approximately correct' refers to the error bound ε, and 'probably' refers to the confidence 1 − δ."
    },
    {
      "type": "p",
      "text": "For a finite hypothesis space H and a learner that returns a hypothesis consistent with the training data, the number of examples sufficient for PAC learning is m ≥ (1/ε) (ln|H| + ln(1/δ)). More hypotheses, tighter accuracy or higher confidence all demand more data."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric: |H| = 1000 hypotheses, ε = 0.1 (error at most 10%), δ = 0.05 (95% confidence). m ≥ (1/0.1)(ln 1000 + ln 20) = 10(6.908 + 2.996) = 99.04, so at least 100 training examples are enough."
    },
    {
      "type": "code-block",
      "label": "PAC Sample Complexity Calculator",
      "code": "import math\n\ndef pac_samples(h_size, epsilon, delta):\n    # m >= (1/epsilon) * (ln|H| + ln(1/delta)) for a finite hypothesis space\n    return math.ceil((1 / epsilon) * (math.log(h_size) + math.log(1 / delta)))\n\nprint(\"|H|=1000, eps=0.10, delta=0.05 ->\", pac_samples(1000, 0.10, 0.05), \"samples\")\nprint(\"|H|=1000, eps=0.05, delta=0.05 ->\", pac_samples(1000, 0.05, 0.05), \"samples (tighter error)\")\nprint(\"|H|=10**6, eps=0.10, delta=0.05 ->\", pac_samples(10**6, 0.10, 0.05), \"samples (bigger H)\")\nprint(\"|H|=1000, eps=0.10, delta=0.01 ->\", pac_samples(1000, 0.10, 0.01), \"samples (more confidence)\")"
    },
    {
      "type": "h2",
      "text": "VC Dimension"
    },
    {
      "type": "p",
      "text": "Many useful hypothesis classes (such as all lines in a plane) are infinite, so |H| cannot be used. The Vapnik-Chervonenkis (VC) dimension measures the capacity of a hypothesis class instead. A set of points is shattered by H if, for every possible way of labelling those points as positive or negative, some hypothesis in H classifies them exactly. The VC dimension of H is the size of the largest set of points that H can shatter. A higher VC dimension means a more flexible model that fits more patterns but is more prone to overfitting."
    },
    {
      "type": "table",
      "headers": [
        "Hypothesis class",
        "VC dimension",
        "Reason"
      ],
      "rows": [
        [
          "Linear classifier (line) in 2D",
          "3",
          "Any 3 non-collinear points can be shattered, but no 4 points can be (the XOR arrangement fails)"
        ],
        [
          "Linear classifier (hyperplane) in d dimensions",
          "d + 1",
          "Generalizes the 2D case"
        ],
        [
          "Intervals on the real line",
          "2",
          "Can shatter 2 points but not 3 (the labelling + − + fails)"
        ],
        [
          "Axis-aligned rectangles in 2D",
          "4",
          "Four points in a diamond can be shattered"
        ],
        [
          "1-nearest neighbor",
          "Infinite",
          "Can memorize any labelling"
        ]
      ]
    },
    {
      "type": "p",
      "text": "The VC dimension d_VC gives a bound on generalization: with probability at least 1 − δ, the true error is at most the training error plus a term that grows with d_VC and shrinks with the number of samples m, roughly O(√((d_VC · ln(m/d_VC) + ln(1/δ)) / m)). The sample complexity for PAC learning with VC dimension d is m = O((1/ε)(d ln(1/ε) + ln(1/δ))). This is the theoretical justification for the intuition that you need more data as model capacity grows, and it formalizes the bias-variance tradeoff from Unit I."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "Real-life analogy: a student who can memorize any answer key (infinite VC dimension) scores perfectly on practice papers but tells you nothing about real understanding. A student who can only learn simple rules (small VC dimension) does slightly worse on practice but performs consistently on new questions. Learning theory quantifies this trade-off."
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the curse of dimensionality and its consequences for k-NN.",
        "Q2: Explain the steps of PCA. What does the explained variance ratio tell you?",
        "Q3: Differentiate Randomized PCA and Incremental PCA. When would you use each?",
        "Q4: What is Kernel PCA and how would you select its kernel and hyperparameters?",
        "Q5: Define VC dimension. What is the VC dimension of a line classifier in 2D, and why is it not 4? Compute the PAC sample size for |H| = 500, ε = 0.05, δ = 0.02."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: As dimensions grow, the feature space volume grows exponentially so data becomes sparse, distances between points become nearly equal, and models overfit. For k-NN, the 'nearest' neighbors are barely nearer than the farthest, so the vote is unreliable and much more data is needed. Dimensionality reduction is the standard remedy."
    },
    {
      "type": "p",
      "text": "A2: (1) Centre or standardize the data, (2) compute the covariance matrix, (3) find its eigenvectors and eigenvalues (or use SVD), (4) sort eigenvectors by decreasing eigenvalue, (5) keep the top d as W_d, (6) project X_d = X·W_d. The explained variance ratio of each component is λᵢ/Σλⱼ, the fraction of the total variance that component preserves; summing it over kept components shows how much information you retain."
    },
    {
      "type": "p",
      "text": "A3: Randomized PCA uses a stochastic algorithm to quickly approximate the first d components and is used when the data fits in memory but full SVD is too slow. Incremental PCA processes the data in mini-batches so it works when the full dataset does not fit in memory, and supports online updates through partial_fit."
    },
    {
      "type": "p",
      "text": "A4: Kernel PCA uses the kernel trick to perform PCA in an implicit high-dimensional feature space, giving a non-linear projection. Since it is unsupervised, tune the kernel (linear, poly, rbf, sigmoid) and gamma by grid search on the accuracy of a downstream supervised model in a pipeline, or minimize the reconstruction pre-image error."
    },
    {
      "type": "p",
      "text": "A5: The VC dimension is the size of the largest set of points that the hypothesis class can shatter (realize every possible labelling). A line in 2D can shatter 3 non-collinear points, so VC = 3. It cannot shatter 4 points, because for the XOR labelling (two diagonal points positive, the other two negative) no single line separates them. PAC sample size: m ≥ (1/0.05)(ln 500 + ln 50) = 20(6.215 + 3.912) = 202.5, so at least 203 samples."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "High dimensions hurt: data becomes sparse, distances lose meaning and models overfit. Projection methods such as PCA keep the directions of maximum variance, and you choose d using the cumulative explained variance. Randomized PCA speeds up the computation, Incremental PCA handles data too large for memory, PCA doubles as lossy compression, and Kernel PCA extends the idea to non-linear manifolds. Learning theory then closes the syllabus: PAC learning states what it means to learn with high probability and bounded error and how many samples that takes, and the VC dimension measures a model's capacity for infinite hypothesis classes."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: for Unit V, know the PCA steps cold, the 95% variance rule, the PCA-variants comparison table, and the two learning-theory formulas (PAC sample bound and VC values such as d + 1 for hyperplanes). That completes the five-unit syllabus. Revise using the comparison tables at the end of each part."
    },
    {
      "type": "cta",
      "text": "Return to Series Home →",
      "href": "/tutorials/ml-exam-mastery",
      "note": "Review all five units, revisit weak topics and re-attempt each part's quiz under timed conditions."
    }
  ]
};

export default post;
