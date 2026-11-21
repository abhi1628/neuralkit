const post = {
  "slug": "part-5-dimensionality-reduction",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 5,
  "totalParts": 5,
  "title": "Dimensionality Reduction & Learning Theory (Part 5)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "40 min read",
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
      "type": "h3",
      "text": "The curse of dimensionality in four numbers"
    },
    {
      "type": "p",
      "text": "The curse is not one effect but several, and each has a number you can quote in an exam. (1) Sparsity: to keep a density of 10 points per unit length you need 10 points in 1 dimension, 10² in 2, and 10¹⁰ in 10 dimensions, so the data needed grows exponentially. (2) Volume moves to the boundary: the fraction of a ball's volume within 5% of its surface is 1 − 0.95ᵈ, which is 0.098 in 2 dimensions but 0.994 in 100 dimensions, so almost every point is 'at the edge'. (3) Corners dominate: the volume of the sphere inscribed in a cube, as a fraction of the cube, is 0.785 in 2 dimensions, 0.524 in 3 and only 0.0025 in 10, so nearly all the volume sits in the corners, far from the centre. (4) Distances concentrate: the ratio of the farthest to the nearest distance from a query point shrinks towards 1."
    },
    {
      "type": "code-block",
      "label": "The Curse in Numbers: Sparsity, Shell Volume, Corners and Distance Ratio",
      "code": "import numpy as np\n\nprint(\"dim  points needed for 10 per unit  shell volume (outer 5%)  sphere/cube volume\")\nfrom math import gamma, pi\nfor d in (1, 2, 3, 10, 50, 100):\n    need = 10 ** d                                   # keep a density of 10 points per unit length\n    shell = 1 - 0.95 ** d                            # fraction of a ball's volume within 5% of its surface\n    ratio = pi ** (d / 2) / gamma(d / 2 + 1) / 2 ** d   # inscribed sphere volume / enclosing cube volume\n    print(f\"{d:3d}  {need:>30.0e}  {shell:23.3f}  {ratio:18.2e}\")\n\n# Nearest versus farthest neighbour of one query point among 1,000 random points\nrng = np.random.default_rng(1)\nprint(\"\\ndim  farthest/nearest distance ratio\")\nfor d in (2, 10, 100, 1000):\n    pts = rng.random((1000, d))\n    dist = np.linalg.norm(pts - rng.random(d), axis=1)\n    print(f\"{d:4d}  {dist.max() / dist.min():8.2f}\")\n\n# Output:\n#   dim  points needed for 10 per unit  shell volume (outer 5%)  sphere/cube volume\n#     1                           1e+01                    0.050            1.00e+00\n#     2                           1e+02                    0.098            7.85e-01\n#     3                           1e+03                    0.143            5.24e-01\n#    10                           1e+10                    0.401            2.49e-03\n#    50                           1e+50                    0.923            1.54e-28\n#   100                          1e+100                    0.994            1.87e-70\n#\n#   dim  farthest/nearest distance ratio\n#      2    114.12\n#     10      3.79\n#    100      1.41\n#   1000      1.12"
    },
    {
      "type": "p",
      "text": "What to notice: the points needed for a fixed density go from 10 to 10¹⁰⁰. In 100 dimensions 99.4% of a ball's volume lies within 5% of its surface, and the inscribed-sphere fraction is already 1.5 × 10⁻²⁸ in 50 dimensions. Among 1,000 random points the farthest point is 114 times as far as the nearest in 2 dimensions, but only 3.79 times in 10, 1.41 times in 100 and 1.12 times in 1,000 dimensions. When 'nearest' and 'farthest' are almost the same, a method that relies on nearness, such as k-NN or k-means, loses its meaning."
    },
    {
      "type": "table",
      "headers": [
        "Remedy",
        "How it helps",
        "Limitation"
      ],
      "rows": [
        [
          "Collect more data",
          "Restores density",
          "The amount needed grows exponentially; usually impractical"
        ],
        [
          "Feature selection",
          "Drops irrelevant or redundant original features and keeps interpretability",
          "Needs a good selection criterion; may miss useful combinations"
        ],
        [
          "Dimensionality reduction (PCA, manifold learning)",
          "Builds a few informative new features",
          "New features are less interpretable; may discard useful low-variance signal"
        ],
        [
          "Regularization and simpler models",
          "Limits effective capacity so extra dimensions do less harm",
          "Does not remove the cost of computing in high dimensions"
        ],
        [
          "Use methods that do not rely on distance",
          "Trees, linear models and kernels with tuned scale cope better",
          "Not always possible"
        ]
      ]
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
      "type": "h3",
      "text": "Projection versus manifold learning on the Swiss roll"
    },
    {
      "type": "p",
      "text": "The Swiss roll is a flat sheet rolled up inside 3-dimensional space. Its intrinsic dimension is 2, but a linear projection onto any plane squashes layers of the roll on top of each other. The code below generates 1,000 points together with their true position t along the unrolled sheet, embeds them into 2 dimensions with PCA, Isomap and Locally Linear Embedding (LLE), and measures two things: trustworthiness (1.0 means points that are neighbours in 2-D were also neighbours in the original space) and the rank correlation between an embedding coordinate and the true unrolled position t."
    },
    {
      "type": "code-block",
      "label": "PCA versus Manifold Learning on the Swiss Roll",
      "code": "import numpy as np\nfrom scipy.stats import spearmanr\nfrom sklearn.datasets import make_swiss_roll\nfrom sklearn.decomposition import PCA\nfrom sklearn.manifold import Isomap, LocallyLinearEmbedding, trustworthiness\n\nX, t = make_swiss_roll(n_samples=1000, noise=0.05, random_state=0)   # t = position along the unrolled sheet\n\nembeddings = {\n    \"PCA (projection)\": PCA(n_components=2).fit_transform(X),\n    \"Isomap\":           Isomap(n_neighbors=10, n_components=2).fit_transform(X),\n    \"LLE\":              LocallyLinearEmbedding(n_neighbors=10, n_components=2, random_state=0).fit_transform(X),\n}\nprint(\"method              trustworthiness   best |Spearman| with unrolled position t\")\nfor name, Z in embeddings.items():\n    tw = trustworthiness(X, Z, n_neighbors=10)\n    rho = max(abs(spearmanr(Z[:, j], t)[0]) for j in range(2))\n    print(f\"{name:18s}  {tw:15.3f}   {rho:10.3f}\")\n# trustworthiness: 1.0 means points that are neighbours in 2-D were also neighbours in 3-D.\n\n# Output:\n#   method              trustworthiness   best |Spearman| with unrolled position t\n#   PCA (projection)              0.905        0.198\n#   Isomap                        0.999        1.000\n#   LLE                           0.991        1.000"
    },
    {
      "type": "p",
      "text": "What to notice: PCA scores 0.905 on trustworthiness and only 0.198 correlation with the true position, because projecting the roll flat mixes distant layers. Isomap (0.999, correlation 1.000) and LLE (0.991, 1.000) both unroll the sheet, so one embedding coordinate recovers the position along the sheet almost perfectly. This is the practical meaning of the manifold hypothesis: a method that follows the local geometry can recover structure that a flat projection destroys."
    },
    {
      "type": "table",
      "headers": [
        "Method",
        "Idea",
        "Typical use"
      ],
      "rows": [
        [
          "Isomap",
          "Preserves geodesic distances (shortest paths along a neighbourhood graph)",
          "Unrolling smooth manifolds"
        ],
        [
          "LLE",
          "Expresses each point as a combination of its neighbours and preserves those weights in low dimension",
          "Smooth manifolds, local structure"
        ],
        [
          "Kernel PCA",
          "PCA in an implicit kernel feature space",
          "Non-linear projection with a tunable kernel"
        ],
        [
          "MDS",
          "Preserves pairwise distances as well as possible",
          "Visualizing distance matrices"
        ],
        [
          "t-SNE",
          "Preserves neighbourhood probabilities; pulls neighbours together and pushes others apart",
          "Visualization in 2-D or 3-D only; not for general preprocessing, because it has no transform for new data and distances between clusters are not reliable"
        ]
      ]
    },
    {
      "type": "h3",
      "text": "Random projection and the Johnson-Lindenstrauss lemma"
    },
    {
      "type": "p",
      "text": "Random projection is the simplest projection method: multiply the data by a random matrix. The Johnson-Lindenstrauss lemma guarantees that n points can be mapped to k ≥ C ln(n) / ε² dimensions while changing every pairwise distance by at most a factor of (1 ± ε). Strikingly, k depends on the number of points n and on the tolerance ε, but not on the original dimension."
    },
    {
      "type": "code-block",
      "label": "Johnson-Lindenstrauss Minimum Dimension and a Random-Projection Check",
      "code": "import numpy as np\nfrom sklearn.random_projection import GaussianRandomProjection, johnson_lindenstrauss_min_dim\n\n# Johnson-Lindenstrauss: how many dimensions keep all pairwise distances within +/- eps?\nfor n, eps in ((1000, 0.3), (10000, 0.3), (10000, 0.1), (1000000, 0.1)):\n    print(f\"n={n:>8,d} points, eps={eps}: need k >= {johnson_lindenstrauss_min_dim(n, eps=eps):,d} dimensions\")\n\n# Empirical check: project 300 points from 5,000 dimensions down to 1,000 at random\nrng = np.random.default_rng(0)\nX = rng.normal(size=(300, 5000))\nZ = GaussianRandomProjection(n_components=1000, random_state=0).fit_transform(X)\ni, j = np.triu_indices(300, k=1)\norig = np.linalg.norm(X[i] - X[j], axis=1)\nproj = np.linalg.norm(Z[i] - Z[j], axis=1)\nratio = proj / orig\nprint(f\"\\ndistance ratio after random projection: mean={ratio.mean():.3f}, min={ratio.min():.3f}, max={ratio.max():.3f}\")\n\n# Output:\n#   n=   1,000 points, eps=0.3: need k >= 767 dimensions\n#   n=  10,000 points, eps=0.3: need k >= 1,023 dimensions\n#   n=  10,000 points, eps=0.1: need k >= 7,894 dimensions\n#   n=1,000,000 points, eps=0.1: need k >= 11,841 dimensions\n#\n#   distance ratio after random projection: mean=1.000, min=0.905, max=1.086"
    },
    {
      "type": "p",
      "text": "What to notice: 1,000 points with ε = 0.3 need k ≥ 767 dimensions, and 10,000 points need 1,023; tightening the tolerance to ε = 0.1 for 10,000 points raises this to 7,894, because of the 1/ε² term. Increasing the number of points a hundredfold, from 10,000 to 1,000,000, only raises k from 7,894 to 11,841, because it grows with ln n. In the experiment, 300 points are projected from 5,000 to 1,000 dimensions and every pairwise distance changes by less than about 10% (ratios from 0.905 to 1.086, mean 1.000)."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam tip: when asked to 'differentiate projection and manifold learning', say that projection finds a flat subspace and keeps the data's global linear structure (PCA, random projection), while manifold learning assumes the data lies on a curved low-dimensional surface and tries to preserve local neighbourhoods or geodesic distances (Isomap, LLE, t-SNE, Kernel PCA). Mention the Swiss roll as the standard example."
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
      "type": "h3",
      "text": "Why maximum variance means minimum reconstruction error"
    },
    {
      "type": "p",
      "text": "Take centred data with covariance matrix C and a unit direction u. The variance of the data projected onto u is uᵀCu. To find the direction that maximizes it subject to uᵀu = 1, form the Lagrangian uᵀCu − λ(uᵀu − 1) and set its derivative to zero. The result is Cu = λu: the best direction is an eigenvector of C, and the variance it carries is exactly its eigenvalue λ. The best direction is therefore the eigenvector with the largest eigenvalue, the second best is the next, and so on."
    },
    {
      "type": "p",
      "text": "The equivalence with reconstruction error comes from Pythagoras. For each point, ‖x‖² = (u·x)² + ‖x − (u·x)u‖². The first term is the part kept in the projection, the second is the part lost. The total ‖x‖² is fixed, so maximizing the kept part is the same as minimizing the lost part, which is the squared reconstruction error."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric: for the four centred points (2, 1), (−2, −1), (1, 2) and (−1, −2), the covariance matrix is [[10/3, 8/3], [8/3, 10/3]]. Solving (10/3 − λ)² − (8/3)² = 0 gives λ = 6 and λ = 2/3, with eigenvectors (1, 1)/√2 and (1, −1)/√2. The explained variance ratios are 6 / 6.667 = 0.90 and 0.10. Projecting (2, 1) on PC1 gives (2 + 1)/√2 = 2.121."
    },
    {
      "type": "code-block",
      "label": "PCA on Four Points: Eigenvalues, Projection and Reconstruction Error",
      "code": "import numpy as np\n\n# Four centred points in 2-D\nX = np.array([[2, 1], [-2, -1], [1, 2], [-1, -2]], dtype=float)\ncov = np.cov(X, rowvar=False)                    # divides by m - 1 = 3\nvals, vecs = np.linalg.eigh(cov)\norder = vals.argsort()[::-1]\nvals, vecs = vals[order], vecs[:, order]\n\nprint(\"covariance matrix:\\n\", np.round(cov, 3))\nprint(\"eigenvalues:\", np.round(vals, 3), \" explained variance ratio:\", np.round(vals / vals.sum(), 3))\nprint(\"PC1 direction:\", np.round(np.abs(vecs[:, 0]), 3), \" (1/sqrt(2) = 0.707)\")\n\nz1 = X @ vecs[:, 0]                              # coordinates along PC1\nX_back = np.outer(z1, vecs[:, 0])                # reconstruct from PC1 only\nprint(\"PC1 scores:\", np.round(np.abs(z1), 3))\nprint(\"sum of squared reconstruction errors:\", round(float(((X - X_back) ** 2).sum()), 3))\nprint(\"(m-1) * discarded eigenvalue         :\", round(float(3 * vals[1]), 3))\n\n# Output:\n#   covariance matrix:\n#    [[3.333 2.667]\n#    [2.667 3.333]]\n#   eigenvalues: [6.    0.667]  explained variance ratio: [0.9 0.1]\n#   PC1 direction: [0.707 0.707]  (1/sqrt(2) = 0.707)\n#   PC1 scores: [2.121 2.121 2.121 2.121]\n#   sum of squared reconstruction errors: 2.0\n#   (m-1) * discarded eigenvalue         : 2.0"
    },
    {
      "type": "p",
      "text": "What to notice: NumPy returns the eigenvalues 6 and 0.667, the ratios 0.90 and 0.10 and the direction (0.707, 0.707), exactly as derived by hand. Dropping PC2 leaves a total squared reconstruction error of 2.0, which equals (m − 1) × the discarded eigenvalue = 3 × 0.667. In general, the reconstruction error of a PCA that keeps d components equals the sum of the discarded eigenvalues (up to the m − 1 factor), which is why the explained variance ratio is also a measure of information loss."
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
      "type": "h3",
      "text": "Scaling matters: PCA on the wine data with and without standardization"
    },
    {
      "type": "p",
      "text": "PCA chases variance, so a feature measured in large units will dominate simply because of its scale, not because it is important. This is why PCA is nearly always applied after standardization (zero mean, unit variance), which makes PCA work on the correlation matrix. The wine dataset has 13 features with variances from 0.02 to almost 100,000."
    },
    {
      "type": "code-block",
      "label": "PCA on Raw versus Standardized Features",
      "code": "import numpy as np\nfrom sklearn.datasets import load_wine\nfrom sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\n\ndata = load_wine()\nX = data.data\nprint(\"feature variances (unscaled): min=%.2f  max=%.1f\" % (X.var(axis=0).min(), X.var(axis=0).max()))\n\nraw = PCA(n_components=3).fit(X)\nprint(\"\\nwithout scaling, explained variance ratio:\", np.round(raw.explained_variance_ratio_, 3))\ntop = np.abs(raw.components_[0]).argmax()\nprint(\"PC1 is almost entirely the feature:\", data.feature_names[top], f\"(loading {raw.components_[0][top]:.3f})\")\n\nscaled = PCA(n_components=3).fit(StandardScaler().fit_transform(X))\nprint(\"\\nwith standardization, explained variance ratio:\", np.round(scaled.explained_variance_ratio_, 3))\nprint(\"cumulative (3 components):\", round(float(scaled.explained_variance_ratio_.sum()), 3))\n\n# Output:\n#   feature variances (unscaled): min=0.02  max=98609.6\n#\n#   without scaling, explained variance ratio: [0.998 0.002 0.   ]\n#   PC1 is almost entirely the feature: proline (loading 1.000)\n#\n#   with standardization, explained variance ratio: [0.362 0.192 0.111]\n#   cumulative (3 components): 0.665"
    },
    {
      "type": "p",
      "text": "What to notice: without scaling, PC1 explains 99.8% of the variance and is almost entirely the single feature proline (loading 1.000), so PCA has only rediscovered which column has the biggest numbers. After standardization the variance is spread more sensibly (0.362, 0.192, 0.111), and three components together keep 0.665. The first answer looks impressive but is meaningless; the second is the one to use."
    },
    {
      "type": "table",
      "headers": [
        "Property of PCA",
        "What it means"
      ],
      "rows": [
        [
          "Orthogonal components",
          "The principal components are mutually perpendicular directions"
        ],
        [
          "Uncorrelated scores",
          "The projected coordinates have zero covariance with one another"
        ],
        [
          "Sign ambiguity",
          "A component and its negative are equally valid, so signs may differ between runs or libraries"
        ],
        [
          "Linear only",
          "PCA cannot unroll curved structure (use Kernel PCA or manifold learning)"
        ],
        [
          "Unsupervised",
          "It maximizes variance, not class separation: a low-variance direction can be the one that separates the classes"
        ],
        [
          "Sensitive to scale and outliers",
          "Standardize first and look for outliers, since extreme points can tilt the components"
        ],
        [
          "Whitening (optional)",
          "Rescales the projected coordinates to unit variance; useful for some algorithms but amplifies noise"
        ]
      ]
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
      "type": "callout",
      "icon": "📝",
      "text": "Worked numeric: a covariance matrix has eigenvalues 4, 2, 1, 0.5, 0.3, 0.2 (total 8). The explained variance ratios are 0.500, 0.250, 0.125, 0.0625, 0.0375 and 0.025, and the cumulative values are 0.500, 0.750, 0.875, 0.9375, 0.975 and 1.000. To keep at least 90% of the variance you need d = 4; for 95%, d = 5. The scree plot of these eigenvalues has its elbow around the third component."
    },
    {
      "type": "p",
      "text": "The third strategy, treating d as a hyperparameter, is the most honest when PCA feeds a supervised model, because the best d for a downstream task need not be the one that reaches a given percentage of variance. The code below puts scaling, PCA and a classifier in one pipeline so that PCA is refitted inside each cross-validation fold (no leakage), and sweeps d."
    },
    {
      "type": "code-block",
      "label": "PCA as a Preprocessing Step: Accuracy versus Number of Components",
      "code": "from sklearn.datasets import load_digits\nfrom sklearn.decomposition import PCA\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nX, y = load_digits(return_X_y=True)\n\nprint(\"components  CV accuracy (logistic regression)\")\nfor d in (2, 5, 10, 20, 30, 64):\n    pipe = make_pipeline(StandardScaler(), PCA(n_components=d), LogisticRegression(max_iter=2000))\n    print(f\"{d:10d}  {cross_val_score(pipe, X, y, cv=5).mean():.3f}\")\n# PCA sits inside the pipeline, so it is refitted on each training fold only (no leakage).\n\n# Output:\n#   components  CV accuracy (logistic regression)\n#            2  0.535\n#            5  0.771\n#           10  0.840\n#           20  0.899\n#           30  0.907\n#           64  0.920"
    },
    {
      "type": "p",
      "text": "What to notice: with only 2 components (enough for a scatter plot) the accuracy is 0.535. It rises quickly to 0.840 at 10 components and 0.899 at 20, and with 30 components (fewer than half of the 64 features) it reaches 0.907, only 1.3 points below the 0.920 obtained with all 64. The gain per extra component falls rapidly, which is the same elbow that the scree plot shows. A note of caution: variance is not relevance, so keep enough components for the task and validate d on the task's score."
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
      "type": "h3",
      "text": "Compression arithmetic and PCA as a denoiser"
    },
    {
      "type": "p",
      "text": "A compressed dataset stores three things: the m × d matrix of scores, the n × d matrix of components and the mean vector of length n. For the digits data (m = 1,797 images, n = 64 pixels) with d = 15 that is 1,797 × 15 + 64 × 15 + 64 = 27,979 numbers instead of 1,797 × 64 = 115,008, a 4.1-fold reduction. The compression ratio approaches n/d only when m is large compared with n."
    },
    {
      "type": "p",
      "text": "The same mechanism removes noise. Directions with a small variance in the data are often mostly noise, so keeping only the top components and reconstructing discards much of the noise. The code adds Gaussian noise to every pixel and then reconstructs from d components."
    },
    {
      "type": "code-block",
      "label": "PCA Compression Storage and Denoising a Noisy Dataset",
      "code": "import numpy as np\nfrom sklearn.datasets import load_digits\nfrom sklearn.decomposition import PCA\n\nX, _ = load_digits(return_X_y=True)\nrng = np.random.default_rng(0)\nX_noisy = X + rng.normal(0, 4.0, X.shape)         # add Gaussian pixel noise\n\nprint(f\"MSE of noisy images against the clean ones: {np.mean((X_noisy - X) ** 2):.2f}\")\nfor d in (5, 15, 30, 50):\n    pca = PCA(n_components=d).fit(X_noisy)\n    X_denoised = pca.inverse_transform(pca.transform(X_noisy))   # keep only the top-d directions\n    print(f\"keep d={d:2d} components -> MSE against clean images = {np.mean((X_denoised - X) ** 2):.2f}\")\n\nn, m, d = X.shape[1], X.shape[0], 15\nprint(f\"\\nstorage at d={d}: {m * d + n * d + n:,} numbers (scores + components + mean) vs {m * n:,} originally\"\n      f\" = {m * n / (m * d + n * d + n):.1f}x smaller\")\n\n# Output:\n#   MSE of noisy images against the clean ones: 16.01\n#   keep d= 5 components -> MSE against clean images = 9.87\n#   keep d=15 components -> MSE against clean images = 7.10\n#   keep d=30 components -> MSE against clean images = 9.06\n#   keep d=50 components -> MSE against clean images = 13.27\n#\n#   storage at d=15: 27,979 numbers (scores + components + mean) vs 115,008 originally = 4.1x smaller"
    },
    {
      "type": "p",
      "text": "What to notice: the noisy images have a mean squared error of 16.01 against the clean ones. Keeping d = 15 components reduces it to 7.10, less than half, because it throws away most of the noise directions. The trade-off has a sweet spot: with d = 5 the error is 9.87 (too much real signal is discarded), and with d = 50 it is 13.27 (most of the noise is kept again). The minimum at an intermediate d is the same bias-variance trade-off as everywhere else in this course."
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
      "type": "h3",
      "text": "How close are the approximations?"
    },
    {
      "type": "p",
      "text": "A fair worry is whether Randomized PCA and Incremental PCA give the same answer as the exact method. The experiment builds a dataset of 5,000 samples and 200 features that really has only 10 underlying directions plus small noise, fits all three, and compares them in two ways: the explained variance, and the cosines of the principal angles between the subspaces they found (1.0 means identical subspaces)."
    },
    {
      "type": "code-block",
      "label": "Exact versus Randomized versus Incremental PCA",
      "code": "import numpy as np\nfrom sklearn.decomposition import PCA, IncrementalPCA\n\n# 5,000 samples, 200 features, but really only 10 underlying directions plus a little noise\nrng = np.random.default_rng(0)\nlatent = rng.normal(size=(5000, 10)) * np.linspace(5, 1.5, 10)\nX = latent @ rng.normal(size=(10, 200)) + rng.normal(scale=0.5, size=(5000, 200))\n\nfull = PCA(n_components=10, svd_solver=\"full\").fit(X)\nrnd = PCA(n_components=10, svd_solver=\"randomized\", random_state=0).fit(X)\ninc = IncrementalPCA(n_components=10, batch_size=500)\nfor batch in np.array_split(X, 10):\n    inc.partial_fit(batch)\n\ndef alignment(A, B):\n    \"\"\"Cosines of the principal angles between two subspaces (1.0 = identical subspace).\"\"\"\n    return np.linalg.svd(A @ B.T, compute_uv=False)\n\nprint(\"variance kept   full: %.4f  randomized: %.4f  incremental: %.4f\" % (\n    full.explained_variance_ratio_.sum(), rnd.explained_variance_ratio_.sum(), inc.explained_variance_ratio_.sum()))\nprint(\"largest difference in explained variance ratio, randomized vs full:\",\n      f\"{np.abs(full.explained_variance_ratio_ - rnd.explained_variance_ratio_).max():.2e}\")\nprint(\"subspace agreement with full PCA (smallest cosine, 1.0 = identical):\")\nprint(f\"   randomized : {alignment(full.components_, rnd.components_).min():.6f}\")\nprint(f\"   incremental: {alignment(full.components_, inc.components_).min():.6f}\")\n\n# Output:\n#   variance kept   full: 0.9980  randomized: 0.9980  incremental: 0.9980\n#   largest difference in explained variance ratio, randomized vs full: 4.44e-16\n#   subspace agreement with full PCA (smallest cosine, 1.0 = identical):\n#      randomized : 1.000000\n#      incremental: 1.000000"
    },
    {
      "type": "p",
      "text": "What to notice: all three keep 99.80% of the variance, the explained variance ratios of randomized and exact PCA differ by about 4 × 10⁻¹⁶, and both approximate methods find essentially the same subspace as exact PCA (smallest cosine 1.000000). The approximation is excellent when the data has a clear low-rank structure and a fast-decaying spectrum, which is the usual situation where PCA is applied. For data whose spectrum decays slowly the randomized method is less precise, but extra power iterations improve it."
    },
    {
      "type": "table",
      "headers": [
        "Situation",
        "Use",
        "Why"
      ],
      "rows": [
        [
          "Data fits in memory, few components wanted, exact SVD is slow",
          "PCA(svd_solver='randomized')",
          "Approximates only the top d components, far cheaper than a full SVD"
        ],
        [
          "Small data",
          "PCA(svd_solver='full')",
          "Exact and fast enough"
        ],
        [
          "Data larger than memory, or arriving as a stream",
          "IncrementalPCA with partial_fit (or a memory-mapped array)",
          "Processes one mini-batch at a time, so memory depends on the batch size, not the dataset size"
        ],
        [
          "Not sure",
          "Leave svd_solver at its default 'auto'",
          "scikit-learn picks between exact and randomized solvers from the data shape and n_components"
        ]
      ]
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
      "type": "h3",
      "text": "How Kernel PCA works"
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Compute the kernel matrix",
          "text": "Build the m × m matrix K with Kᵢⱼ = k(xᵢ, xⱼ), which holds all pairwise inner products in the implicit feature space."
        },
        {
          "num": "2",
          "title": "Centre the kernel matrix",
          "text": "The data must be centred in feature space, which is done without ever computing the features: K̃ = K − 1ₘK − K1ₘ + 1ₘK1ₘ, where 1ₘ is the m × m matrix with every entry 1/m."
        },
        {
          "num": "3",
          "title": "Eigendecompose",
          "text": "Find the eigenvectors and eigenvalues of K̃; the largest eigenvalues correspond to the leading non-linear components."
        },
        {
          "num": "4",
          "title": "Project",
          "text": "The coordinate of training point i on component k is √λₖ times the i-th entry of the k-th normalized eigenvector. A new point is projected using its kernel values against the training points."
        }
      ]
    },
    {
      "type": "p",
      "text": "Two consequences follow from working with the m × m matrix. Memory and time grow quickly with the number of samples (O(m²) memory and about O(m³) time for the eigendecomposition), so Kernel PCA suits thousands, not millions, of samples. And because the feature space is implicit, there are no explicit principal axes in the original space, so mapping a reduced point back (the pre-image problem) must be approximated. The code below shows the main benefit and the main danger on two concentric rings, which no straight line can separate."
    },
    {
      "type": "code-block",
      "label": "Kernel PCA Untangles Concentric Rings, but Only for a Suitable gamma",
      "code": "import numpy as np\nfrom sklearn.datasets import make_circles\nfrom sklearn.decomposition import PCA, KernelPCA\nfrom sklearn.linear_model import LogisticRegression\n\nX, y = make_circles(n_samples=500, factor=0.3, noise=0.05, random_state=0)   # two concentric rings\n\ndef linear_accuracy(Z):\n    \"\"\"Accuracy of a straight-line (logistic regression) classifier on the given coordinates.\"\"\"\n    return LogisticRegression().fit(Z, y).score(Z, y)\n\nprint(f\"raw 2-D features                  : {linear_accuracy(X):.3f}\")\nprint(f\"linear PCA, 2 components          : {linear_accuracy(PCA(n_components=2).fit_transform(X)):.3f}\")\nfor gamma in (0.5, 2, 10):\n    Z = KernelPCA(n_components=2, kernel=\"rbf\", gamma=gamma).fit_transform(X)\n    print(f\"RBF Kernel PCA, gamma={gamma:<4}        : {linear_accuracy(Z):.3f}\")\n# Linear PCA is only a rotation here, so the rings stay tangled; a suitable RBF kernel pulls them apart.\n\n# Output:\n#   raw 2-D features                  : 0.504\n#   linear PCA, 2 components          : 0.504\n#   RBF Kernel PCA, gamma=0.5         : 0.498\n#   RBF Kernel PCA, gamma=2           : 1.000\n#   RBF Kernel PCA, gamma=10          : 0.804"
    },
    {
      "type": "p",
      "text": "What to notice: a straight-line classifier scores 0.504 (chance) on the raw features and on linear PCA, because linear PCA is just a rotation here. With an RBF kernel and gamma = 2 the same classifier reaches 1.000 on the Kernel PCA coordinates. But with gamma = 0.5 the kernel is too wide and the result is still chance (0.498), and with gamma = 10 it is too narrow and the accuracy falls to 0.804. This sensitivity is why the next section is about tuning."
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
      "type": "h3",
      "text": "Pre-image error: an unsupervised signal with limits"
    },
    {
      "type": "p",
      "text": "When labels are not available, one option is to pick gamma by the reconstruction pre-image error: reduce the data, map the reduced points back into the original space with fit_inverse_transform=True, and measure the distance to the original points. The experiment below computes this error for several values of gamma on the two-moons data and also records how well a linear classifier separates the classes on the resulting coordinates (training accuracy, used only for comparison)."
    },
    {
      "type": "code-block",
      "label": "Pre-Image Reconstruction Error versus Downstream Accuracy for Different gamma",
      "code": "import numpy as np\nfrom sklearn.datasets import make_moons\nfrom sklearn.decomposition import KernelPCA\nfrom sklearn.linear_model import LogisticRegression\n\nX, y = make_moons(n_samples=400, noise=0.08, random_state=0)\n\nprint(\"gamma   pre-image reconstruction MSE   accuracy of LogReg on the 2 kernel-PCA coordinates\")\nfor gamma in (0.1, 1, 5, 15, 50):\n    kpca = KernelPCA(n_components=2, kernel=\"rbf\", gamma=gamma, fit_inverse_transform=True, alpha=0.1)\n    Z = kpca.fit_transform(X)\n    X_back = kpca.inverse_transform(Z)                   # map back into the original space (a learned 'pre-image')\n    mse = np.mean((X - X_back) ** 2)\n    acc = LogisticRegression().fit(Z, y).score(Z, y)\n    print(f\"{gamma:5}   {mse:27.4f}   {acc:50.3f}\")\n# Lower pre-image error is a useful unsupervised signal, but it does not guarantee the best embedding for a task.\n\n# Output:\n#   gamma   pre-image reconstruction MSE   accuracy of LogReg on the 2 kernel-PCA coordinates\n#     0.1                        0.0017                                                0.873\n#       1                        0.0372                                                0.780\n#       5                        0.0145                                                0.895\n#      15                        0.0783                                                0.978\n#      50                        0.0461                                                0.948"
    },
    {
      "type": "p",
      "text": "What to notice: the pre-image error is smallest at gamma = 0.1 (0.0017), yet that embedding only separates the classes with accuracy 0.873. The best accuracy, 0.978, comes at gamma = 15, where the pre-image error is 0.0783, far from the smallest. In other words, the unsupervised criterion and the task criterion disagree. Pre-image error is useful when no labels exist, but if you have labels (as in the grid search above) tuning against the downstream score is the more reliable choice."
    },
    {
      "type": "table",
      "headers": [
        "Kernel PCA caveat",
        "Detail"
      ],
      "rows": [
        [
          "Scales poorly with samples",
          "The m × m kernel matrix limits it to moderate m; Nyström approximations or other methods are needed for big data"
        ],
        [
          "Sensitive to gamma",
          "As the circles experiment shows, a poor gamma gives no benefit at all"
        ],
        [
          "No explicit components",
          "Cannot read off feature loadings; reconstruction requires an approximate pre-image"
        ],
        [
          "Needs scaling",
          "Kernels use distances or inner products, so standardize the features first"
        ]
      ]
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
      "type": "h3",
      "text": "The setting and the vocabulary"
    },
    {
      "type": "table",
      "headers": [
        "Term",
        "Meaning"
      ],
      "rows": [
        [
          "Instance space X",
          "The set of all possible inputs"
        ],
        [
          "Target concept c",
          "The true labelling function we want to learn"
        ],
        [
          "Hypothesis class H",
          "The set of functions the learner is allowed to output"
        ],
        [
          "Distribution D",
          "The unknown distribution from which training and test examples are drawn independently"
        ],
        [
          "True error err(h)",
          "The probability that h disagrees with c on a fresh example drawn from D"
        ],
        [
          "Training error",
          "The fraction of the training examples that h gets wrong; it is only an estimate of the true error"
        ],
        [
          "Consistent learner",
          "Returns a hypothesis with zero training error"
        ],
        [
          "Realizable case",
          "The target concept lies in H, so a consistent hypothesis exists"
        ],
        [
          "Agnostic case",
          "No hypothesis in H is perfect; the aim is to approach the best error available in H"
        ]
      ]
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
      "type": "h3",
      "text": "Where the PAC bound comes from"
    },
    {
      "type": "p",
      "text": "The bound m ≥ (1/ε)(ln|H| + ln(1/δ)) is not magic; it follows from two simple inequalities, and examiners often ask for the derivation."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Define a bad hypothesis",
          "text": "A hypothesis h is bad if its true error is greater than ε."
        },
        {
          "num": "2",
          "title": "One bad hypothesis, m examples",
          "text": "A bad hypothesis classifies one random example correctly with probability less than 1 − ε, so it is consistent with all m independent examples with probability less than (1 − ε)ᵐ ≤ e^(−εm), using 1 − x ≤ e^(−x)."
        },
        {
          "num": "3",
          "title": "Union bound over H",
          "text": "There are at most |H| bad hypotheses, so the probability that at least one of them is consistent with the data is less than |H| · e^(−εm)."
        },
        {
          "num": "4",
          "title": "Require this to be at most δ",
          "text": "We want |H| e^(−εm) ≤ δ. Taking logarithms gives εm ≥ ln|H| + ln(1/δ)."
        },
        {
          "num": "5",
          "title": "Solve for m",
          "text": "m ≥ (1/ε)(ln|H| + ln(1/δ)). With probability at least 1 − δ, every consistent hypothesis then has true error at most ε."
        }
      ]
    },
    {
      "type": "code-block",
      "label": "PAC Examples: Conjunctions, Realizable versus Agnostic, and a Simulation",
      "code": "import math\nimport numpy as np\n\n# 1) Boolean conjunctions over n variables: each variable appears positive, negated or absent -> |H| = 3^n\nn, eps, delta = 10, 0.1, 0.05\nm = (1 / eps) * (n * math.log(3) + math.log(1 / delta))\nprint(f\"conjunctions of {n} variables: |H| = 3^{n} = {3 ** n}, m >= {m:.1f} -> {math.ceil(m)} examples\")\n\n# 2) Realizable vs agnostic sample complexity (|H| = 1000, eps = 0.1, delta = 0.05)\nH = 1000\nrealizable = (1 / eps) * (math.log(H) + math.log(1 / delta))\nagnostic = (1 / (2 * eps ** 2)) * (math.log(H) + math.log(2 / delta))\nprint(f\"|H|=1000: realizable needs {math.ceil(realizable)}, agnostic needs {math.ceil(agnostic)} examples\")\n\n# 3) Simulation: 1-D threshold classifiers on a grid of 101 thresholds; the target threshold is 0.5\ngrid = np.linspace(0, 1, 101)\nm = math.ceil((1 / eps) * (math.log(len(grid)) + math.log(1 / delta)))\nrng = np.random.default_rng(0)\nfailures, worst = 0, 0.0\nfor _ in range(5000):\n    x = rng.random(m)\n    y = x >= 0.5\n    consistent = [t for t in grid if np.all((x >= t) == y)]     # every hypothesis that fits the training data\n    t = rng.choice(consistent)                                  # an arbitrary consistent learner\n    err = abs(t - 0.5)                                          # true error = probability mass between t and 0.5\n    worst = max(worst, err)\n    failures += err > eps\nprint(f\"bound says m = {m}; over 5000 trials, true error > {eps} happened {failures} times \"\n      f\"({failures / 5000:.2%}, allowed: {delta:.0%}); worst error seen = {worst:.2f}\")\n\n# Output:\n#   conjunctions of 10 variables: |H| = 3^10 = 59049, m >= 139.8 -> 140 examples\n#   |H|=1000: realizable needs 100, agnostic needs 530 examples\n#   bound says m = 77; over 5000 trials, true error > 0.1 happened 0 times (0.00%, allowed: 5%); worst error seen = 0.08"
    },
    {
      "type": "p",
      "text": "What to notice: for conjunctions over 10 Boolean variables each variable appears positive, negated or not at all, so |H| = 3¹⁰ = 59,049, and 140 examples suffice for ε = 0.1 and δ = 0.05. Because only ln|H| = n ln 3 appears, the sample size grows linearly with the number of variables, so conjunctions are PAC-learnable. With the same |H| = 1000, ε and δ, the realizable case needs 100 examples while the agnostic case needs 530, since the agnostic bound scales with 1/ε² instead of 1/ε. In the simulation of threshold classifiers (|H| = 101), the bound asks for 77 examples; over 5,000 trials the true error never exceeded 0.1 (the worst seen was 0.08), far better than the allowed 5% failure rate. The bound is a sufficient, worst-case guarantee for every distribution, not a tight prediction, which is why practical datasets can often manage with fewer examples."
    },
    {
      "type": "table",
      "headers": [
        "If you change...",
        "Sample size m",
        "Reason"
      ],
      "rows": [
        [
          "ε smaller (more accuracy)",
          "Grows like 1/ε",
          "Rarer errors need more evidence to detect"
        ],
        [
          "δ smaller (more confidence)",
          "Grows like ln(1/δ)",
          "Cheap: confidence is very inexpensive"
        ],
        [
          "|H| larger (richer class)",
          "Grows like ln|H|",
          "More hypotheses give more chances for a bad one to look good by luck"
        ],
        [
          "Agnostic instead of realizable",
          "Grows like 1/ε²",
          "Estimating errors accurately is harder than finding a perfect fit"
        ]
      ]
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
      "type": "h3",
      "text": "Shattering step by step"
    },
    {
      "type": "p",
      "text": "To show that the VC dimension of a class is d you need two things: some set of d points that the class shatters, and a proof that no set of d + 1 points can be shattered. Shattering means that all 2ᵐ labellings of the m points can be realized. The code below checks every labelling by solving a small linear program (is there a line w·x + b with yᵢ(w·xᵢ + b) ≥ 1?) for several point sets, and also counts the labellings that intervals on a line can realize."
    },
    {
      "type": "code-block",
      "label": "Brute-Force Shattering Test for Lines in 2-D and for Intervals on a Line",
      "code": "import itertools\nimport numpy as np\nfrom scipy.optimize import linprog\n\ndef separable(points, labels):\n    \"\"\"Is there a line w.x + b separating the labelled points? (feasibility LP: y(w.x + b) >= 1)\"\"\"\n    pts = np.array(points, dtype=float)\n    y = np.where(np.array(labels), 1.0, -1.0)\n    A = -(y[:, None] * np.column_stack([pts, np.ones(len(pts))]))\n    res = linprog(c=[0, 0, 0], A_ub=A, b_ub=-np.ones(len(pts)), bounds=[(None, None)] * 3)\n    return res.status == 0\n\ndef report(name, points):\n    labelings = list(itertools.product([False, True], repeat=len(points)))\n    ok = [separable(points, l) for l in labelings]\n    failed = [l for l, good in zip(labelings, ok) if not good]\n    status = \"SHATTERED\" if all(ok) else \"not shattered\"\n    print(f\"{name:34s} {sum(ok):2d} of {len(labelings):2d} labellings realizable -> {status}\")\n    if failed and len(failed) <= 2:\n        print(f\"{'':34s} impossible labelling(s): {[''.join('+' if v else '-' for v in l) for l in failed]}\")\n\nreport(\"3 points in a triangle\", [(0, 0), (1, 0), (0, 1)])\nreport(\"3 collinear points\", [(0, 0), (1, 1), (2, 2)])\nreport(\"4 points in a square (XOR)\", [(0, 0), (1, 0), (0, 1), (1, 1)])\nreport(\"4 points, one inside a triangle\", [(0, 0), (4, 0), (0, 4), (1, 1)])\n\n# Positive intervals on the real line: h(x) = + only inside [a, b]\ndef interval_realizable(xs, labels):\n    pos = [x for x, l in zip(xs, labels) if l]\n    if not pos:\n        return True\n    lo, hi = min(pos), max(pos)\n    return all(l for x, l in zip(xs, labels) if lo <= x <= hi)\nfor xs in ([1, 2], [1, 2, 3]):\n    labelings = list(itertools.product([False, True], repeat=len(xs)))\n    ok = [l for l in labelings if interval_realizable(xs, l)]\n    print(f\"{'intervals on ' + str(xs):34s} {len(ok):2d} of {len(labelings):2d} labellings realizable\")\n\n# Output:\n#   3 points in a triangle              8 of  8 labellings realizable -> SHATTERED\n#   3 collinear points                  6 of  8 labellings realizable -> not shattered\n#                                      impossible labelling(s): ['-+-', '+-+']\n#   4 points in a square (XOR)         14 of 16 labellings realizable -> not shattered\n#                                      impossible labelling(s): ['-++-', '+--+']\n#   4 points, one inside a triangle    14 of 16 labellings realizable -> not shattered\n#                                      impossible labelling(s): ['---+', '+++-']\n#   intervals on [1, 2]                 4 of  4 labellings realizable\n#   intervals on [1, 2, 3]              7 of  8 labellings realizable"
    },
    {
      "type": "p",
      "text": "What to notice: three points in a triangle are shattered by lines (8 of 8 labellings), so the VC dimension of 2-D lines is at least 3. Three collinear points are not shattered (6 of 8: the labellings −+− and +−+ fail), which shows why VC dimension only asks whether some set of that size can be shattered. For 4 points no arrangement works: the square fails on the two XOR labellings (−++− and +−−+), and a point inside a triangle fails when it has the opposite label to the three corners (---+ and +++−), leaving 14 of 16 in both cases. So the VC dimension of lines in 2-D is exactly 3. For intervals, two points are shattered (4 of 4) but with three points the labelling +−+ is impossible (7 of 8), so the VC dimension is 2."
    },
    {
      "type": "h3",
      "text": "Growth function, Sauer's lemma and why a finite VC dimension helps"
    },
    {
      "type": "p",
      "text": "The growth function counts how many different labellings a class can produce on m points. If the class has VC dimension d, Sauer's lemma bounds it by Σᵢ₌₀ᵈ C(m, i), which grows only like mᵈ, a polynomial, instead of 2ᵐ. This is the key to why a class with a finite VC dimension is learnable even if it contains infinitely many hypotheses: on any sample, it behaves like a class with only polynomially many distinct hypotheses, and ln|H| in the PAC bound is replaced by a term in d ln(m/d)."
    },
    {
      "type": "code-block",
      "label": "Sauer Bound versus 2^m and VC-Based Sample Sizes",
      "code": "import math\nfrom math import comb\n\nd = 3                                              # VC dimension (for example lines in 2-D)\nprint(\"m    2^m (all labellings)   Sauer bound  sum_{i<=d} C(m, i)\")\nfor m in (2, 3, 4, 5, 10, 20, 50):\n    sauer = sum(comb(m, i) for i in range(d + 1))\n    print(f\"{m:<3d}  {2 ** m:>20,d}   {sauer:>10,d}\")\n\n# A standard distribution-free sample bound (Blumer et al., 1989) for the realizable case:\n#   m >= max( (4/eps) * log2(2/delta),  (8d/eps) * log2(13/eps) )\neps, delta = 0.1, 0.05\nprint(\"\\nVC dimension d   samples sufficient (eps=0.1, delta=0.05)\")\nfor d in (1, 3, 10, 100):\n    m = max((4 / eps) * math.log2(2 / delta), (8 * d / eps) * math.log2(13 / eps))\n    print(f\"{d:14d}   {math.ceil(m):>8,d}\")\n\n# Output:\n#   m    2^m (all labellings)   Sauer bound  sum_{i<=d} C(m, i)\n#   2                       4            4\n#   3                       8            8\n#   4                      16           15\n#   5                      32           26\n#   10                  1,024          176\n#   20              1,048,576        1,351\n#   50   1,125,899,906,842,624       20,876\n#\n#   VC dimension d   samples sufficient (eps=0.1, delta=0.05)\n#                1        562\n#                3      1,686\n#               10      5,618\n#              100     56,179"
    },
    {
      "type": "p",
      "text": "What to notice: for d = 3, the bound equals 2ᵐ up to m = 3 (8), is already smaller at m = 4 (15 against 16) and is 176 against 1,024 at m = 10. At m = 20 the class can produce at most 1,351 labellings out of more than a million possible. The second table shows a standard sample bound (Blumer et al.) for ε = 0.1 and δ = 0.05: about 562 examples for d = 1, 1,686 for d = 3, 5,618 for d = 10 and 56,179 for d = 100. The required sample size grows roughly linearly with the VC dimension; the constants in such bounds are conservative, so use them as a guide to scaling, not as exact requirements."
    },
    {
      "type": "table",
      "headers": [
        "Model family",
        "VC dimension (and practical meaning)"
      ],
      "rows": [
        [
          "Hyperplane in d dimensions",
          "d + 1"
        ],
        [
          "Linear SVM with margin",
          "The useful capacity depends on the margin and the radius of the data, not on the dimension, which is why large margins generalize well"
        ],
        [
          "Neural network",
          "Grows with the number of parameters (up to logarithmic factors); more weights need more data or regularization"
        ],
        [
          "Fully grown decision tree, 1-NN",
          "Infinite: it can memorize any labelling of distinct points, so it needs pruning or regularization"
        ],
        [
          "Depth-limited tree, k-NN with large k, regularized models",
          "Finite and smaller: lower capacity, less overfitting"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Structural risk minimization: because the true error is bounded by training error plus a capacity term that grows with the VC dimension, the best model is the one that balances the two. Regularization, pruning, limiting depth and early stopping are all practical ways of controlling capacity. This is the learning-theory version of the bias-variance trade-off from Unit I."
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
      "text": "Exam Answer Frameworks for Unit V"
    },
    {
      "type": "p",
      "text": "Unit V mixes descriptive questions with short calculations. A fixed procedure for each type protects the marks."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "For a PCA numerical",
          "text": "Centre the data, write the covariance matrix, solve det(C − λI) = 0, find each eigenvector, order by eigenvalue, compute the explained variance ratios, then project X · W_d."
        },
        {
          "num": "2",
          "title": "For 'how many components'",
          "text": "Compute the cumulative explained variance, state the target (for example 95%), and give the smallest d that reaches it."
        },
        {
          "num": "3",
          "title": "For a PAC question",
          "text": "Write m ≥ (1/ε)(ln|H| + ln(1/δ)), substitute, take natural logarithms carefully, and round up to the next integer."
        },
        {
          "num": "4",
          "title": "For a VC question",
          "text": "Exhibit a set of d points that can be shattered by listing all 2ᵈ labellings, then argue that no set of d + 1 points can be (for example the XOR labelling for lines in 2-D)."
        },
        {
          "num": "5",
          "title": "For comparison questions",
          "text": "Use a small table with the same rows for both methods: problem solved, idea, speed or memory, exactness and scikit-learn call."
        },
        {
          "num": "6",
          "title": "Always finish with a limitation",
          "text": "PCA is linear, unsupervised and scale-sensitive; Kernel PCA is O(m²) and sensitive to gamma; PAC and VC bounds are loose worst-case guarantees."
        }
      ]
    },
    {
      "type": "table",
      "headers": [
        "Topic",
        "The one formula or fact to quote"
      ],
      "rows": [
        [
          "PCA components",
          "Eigenvectors of C = XᵀX/(m − 1); eigenvalue λᵢ is the variance along component i"
        ],
        [
          "Explained variance ratio",
          "λᵢ / Σⱼ λⱼ; choose the smallest d with cumulative ratio ≥ 0.95"
        ],
        [
          "Projection and reconstruction",
          "X_d = X · W_d and X̂ = X_d · W_dᵀ + mean"
        ],
        [
          "Johnson-Lindenstrauss",
          "k ≥ C ln(n) / ε², independent of the original dimension"
        ],
        [
          "Kernel PCA",
          "Eigen-decomposition of the centred m × m kernel matrix K̃"
        ],
        [
          "PAC (finite H, realizable)",
          "m ≥ (1/ε)(ln|H| + ln(1/δ))"
        ],
        [
          "VC dimension",
          "Largest m such that some m points can be shattered; hyperplanes in ℝᵈ have d + 1"
        ],
        [
          "Sauer's lemma",
          "Number of labellings ≤ Σᵢ₌₀ᵈ C(m, i) = O(mᵈ)"
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
          "Why standardize before PCA?",
          "Otherwise features with large units dominate the variance and the first component just reflects scale."
        ],
        [
          "Is PCA supervised?",
          "No, it maximizes variance and ignores labels, so a high-variance direction need not be useful for classification."
        ],
        [
          "Why can PCA fail on the Swiss roll?",
          "It is linear, so flat projection mixes layers of the roll; manifold learning or Kernel PCA is needed."
        ],
        [
          "When do you prefer Incremental PCA?",
          "When the data do not fit in memory or arrive in batches or a stream."
        ],
        [
          "What does a reconstruction error of zero mean?",
          "All components were kept, or the discarded components carry no variance."
        ],
        [
          "Does PAC learning need a polynomial amount of data?",
          "Yes, polynomial in 1/ε, 1/δ and the problem size, and polynomial time."
        ],
        [
          "Why is the VC dimension of 1-NN infinite?",
          "It can memorize any labelling of any number of distinct points."
        ],
        [
          "What is shattering?",
          "A set of points is shattered if the class can realize every possible labelling of it."
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
        "Q1: Explain the curse of dimensionality and its consequences for k-NN.",
        "Q2: Explain the steps of PCA. What does the explained variance ratio tell you?",
        "Q3: Differentiate Randomized PCA and Incremental PCA. When would you use each?",
        "Q4: What is Kernel PCA and how would you select its kernel and hyperparameters?",
        "Q5: Define VC dimension. What is the VC dimension of a line classifier in 2D, and why is it not 4? Compute the PAC sample size for |H| = 500, ε = 0.05, δ = 0.02.",
        "Q6: The covariance matrix of a dataset has eigenvalues 5, 3, 1.5 and 0.5. Compute the explained variance ratios and the number of components needed to keep at least 90% of the variance.",
        "Q7: A centred 2-D dataset has covariance matrix [[3, 1], [1, 3]]. Find the eigenvalues and eigenvectors, the explained variance ratio of PC1, and the PC1 and PC2 coordinates of the point (2, 2).",
        "Q8: Why must features be standardized before PCA? Give a numerical illustration with two features of variance 10,000 and 1.",
        "Q9: Boolean conjunctions over 10 variables form a hypothesis class with |H| = 3¹⁰. How many examples are enough for ε = 0.1 and δ = 0.05?",
        "Q10: Show that the VC dimension of positive intervals on the real line is 2."
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
      "type": "p",
      "text": "A6: Total = 5 + 3 + 1.5 + 0.5 = 10, so the ratios are 0.50, 0.30, 0.15 and 0.05, with cumulative values 0.50, 0.80, 0.95 and 1.00. Two components keep only 80%, which is below 90%, while three keep 95%, so d = 3."
    },
    {
      "type": "p",
      "text": "A7: det(C − λI) = (3 − λ)² − 1 = 0 gives λ = 4 and λ = 2. For λ = 4, (C − 4I)v = 0 gives v = (1, 1)/√2; for λ = 2 it gives v = (1, −1)/√2. The explained variance ratio of PC1 is 4/(4 + 2) = 0.667. For the point (2, 2): PC1 coordinate = (2 + 2)/√2 = 2.828 and PC2 coordinate = (2 − 2)/√2 = 0, so the point lies entirely along PC1 and is reconstructed exactly from one component."
    },
    {
      "type": "p",
      "text": "A8: PCA maximizes variance, so a feature with a large scale dominates for reasons of units, not information. With variances 10,000 and 1, PC1 points almost exactly along the first feature and explains 10,000 / 10,001 = 99.99% of the variance, so PCA merely repeats which column has the bigger numbers. Standardizing each feature to mean 0 and variance 1 gives every feature variance 1 so that components reflect correlations. On the wine dataset, unscaled PCA gave a PC1 ratio of 0.998 (essentially one feature, proline), against 0.362 after scaling."
    },
    {
      "type": "p",
      "text": "A9: m ≥ (1/ε)(ln|H| + ln(1/δ)) = (1/0.1)(10 ln 3 + ln 20) = 10(10.986 + 2.996) = 139.8, so at least 140 examples are enough. The sample size grows only linearly in the number of variables because ln|H| = n ln 3."
    },
    {
      "type": "p",
      "text": "A10: Take two points x₁ < x₂. The four labellings (+,+), (+,−), (−,+) and (−,−) can all be produced by choosing an interval that contains both, only x₁, only x₂ or neither, so two points are shattered and VC ≥ 2. Now take any three points x₁ < x₂ < x₃. The labelling (+, −, +) would need an interval that contains x₁ and x₃ but not x₂, which is impossible because an interval containing x₁ and x₃ also contains everything between them. So no 3 points are shattered and VC = 2."
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
