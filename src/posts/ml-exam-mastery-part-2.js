const post = {
  "slug": "part-2-clustering",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 2,
  "totalParts": 5,
  "title": "Clustering, GMM & Parameter Estimation (Part 2)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "30 min read",
  "category": "Machine Learning",
  "categoryColor": "#f59e0b",
  "excerpt": "Partitioning, hierarchical, fuzzy and distribution-based clustering, BIRCH and CURE, Gaussian Mixture Models with Expectation Maximization, MLE vs MAP, and applications of clustering.",
  "coverEmoji": "🤖",
  "tags": [
    "Machine Learning",
    "Clustering",
    "GMM",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Unit II moves from learning with answers to learning without them. Clustering groups similar data points with no labels, and the syllabus covers it from four angles (partitioning, distribution-based, hierarchical, fuzzy), two algorithms built for large data (BIRCH and CURE), the probabilistic machinery behind Gaussian Mixture Models (EM), and the parameter-estimation ideas (MLE and MAP) that underpin them. This part gives you the definitions, algorithm steps, formulas and runnable code that examiners expect."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Explain K-means with an example' (7 marks), 'Compare agglomerative and divisive clustering' (5 marks), 'Explain the EM algorithm for GMM' (7-10 marks), 'Differentiate MLE and MAP' (5 marks), 'Write short notes on BIRCH / CURE / fuzzy clustering' (5 marks each), and 'List applications of clustering' (3 marks)."
    },
    {
      "type": "h2",
      "text": "What is Clustering?"
    },
    {
      "type": "p",
      "text": "Clustering is an unsupervised learning technique that partitions a set of unlabelled data points into groups (clusters) so that points in the same cluster are more similar to each other than to points in other clusters. Similarity is measured with a distance function, most commonly Euclidean distance d(a, b) = √Σ(aᵢ − bᵢ)²."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "Real-life analogy: sorting a huge pile of mixed laundry without any labels. You naturally make piles by colour and fabric because similar items end up together. Nobody told you the categories, you discovered them. That is clustering."
    },
    {
      "type": "h2",
      "text": "Types of Clustering Methods"
    },
    {
      "type": "table",
      "headers": [
        "Method",
        "Core idea",
        "Example algorithms",
        "Assignment type"
      ],
      "rows": [
        [
          "Partitioning",
          "Split data into k non-overlapping groups around representative centres",
          "K-means, K-medoids (PAM)",
          "Hard (each point in exactly one cluster)"
        ],
        [
          "Distribution model-based",
          "Assume data comes from a mixture of probability distributions; each cluster is one distribution",
          "Gaussian Mixture Model with EM",
          "Soft (probability of belonging to each cluster)"
        ],
        [
          "Hierarchical",
          "Build a tree (dendrogram) of nested clusters",
          "Agglomerative, Divisive, BIRCH, CURE",
          "Hard"
        ],
        [
          "Fuzzy",
          "A point can belong to several clusters with degrees of membership",
          "Fuzzy C-Means",
          "Soft (membership values summing to 1)"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam-ready line: 'Hard clustering assigns every point to exactly one cluster; soft (fuzzy or probabilistic) clustering assigns each point a degree of membership or probability for every cluster.'"
    },
    {
      "type": "h2",
      "text": "Partitioning Clustering: K-Means"
    },
    {
      "type": "p",
      "text": "K-means partitions n points into k clusters by repeatedly assigning points to the nearest centroid and moving each centroid to the mean of its points. Its objective is to minimize the within-cluster sum of squares (WCSS, also called inertia): J = Σₖ Σ_{x∈Cₖ} ‖x − μₖ‖²."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Choose k",
          "text": "Decide the number of clusters (use the elbow method or silhouette score)."
        },
        {
          "num": "2",
          "title": "Initialize",
          "text": "Pick k initial centroids at random (k-means++ picks them smartly, spread apart)."
        },
        {
          "num": "3",
          "title": "Assign",
          "text": "Assign every point to its nearest centroid using Euclidean distance."
        },
        {
          "num": "4",
          "title": "Update",
          "text": "Recompute each centroid as the mean of all points assigned to it."
        },
        {
          "num": "5",
          "title": "Repeat",
          "text": "Repeat assign and update until centroids stop moving or a maximum number of iterations is reached."
        }
      ]
    },
    {
      "type": "table",
      "headers": [
        "Advantages",
        "Limitations"
      ],
      "rows": [
        [
          "Simple, fast, scales to large data",
          "Must choose k in advance"
        ],
        [
          "Converges quickly",
          "Sensitive to initial centroids and can reach a local optimum"
        ],
        [
          "Works well for compact, spherical clusters",
          "Fails on non-spherical clusters and is sensitive to outliers and scale"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "K-Means with Elbow Method and Silhouette Score",
      "code": "from sklearn.datasets import make_blobs\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\nX, _ = make_blobs(n_samples=300, centers=4, cluster_std=0.9, random_state=7)\n\nfor k in range(2, 8):\n    km = KMeans(n_clusters=k, n_init=10, random_state=7).fit(X)\n    print(f\"k={k}  inertia={km.inertia_:8.1f}  silhouette={silhouette_score(X, km.labels_):.3f}\")\n# Inertia always falls as k grows: look for the 'elbow' where the drop flattens.\n# Silhouette (closer to 1 is better) should peak near the true k = 4.\n\nbest = KMeans(n_clusters=4, n_init=10, random_state=7).fit(X)\nprint(\"Centroids:\\n\", best.cluster_centers_.round(2))"
    },
    {
      "type": "h2",
      "text": "Hierarchical Clustering"
    },
    {
      "type": "p",
      "text": "Hierarchical clustering builds a tree of clusters called a dendrogram, so you do not need to fix k in advance: you cut the tree at the height that gives the number of clusters you want. It has two directions."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Agglomerative (bottom-up)",
        "Divisive (top-down)"
      ],
      "rows": [
        [
          "Start",
          "Every point is its own cluster",
          "All points in one cluster"
        ],
        [
          "Process",
          "Repeatedly merge the two closest clusters",
          "Repeatedly split a cluster into two"
        ],
        [
          "End",
          "One single cluster",
          "Every point in its own cluster"
        ],
        [
          "Cost",
          "Cheaper, more widely used",
          "More expensive"
        ]
      ]
    },
    {
      "type": "p",
      "text": "How 'closest' is defined between two clusters is the linkage criterion. Single linkage uses the minimum distance between any pair of points (can chain clusters together). Complete linkage uses the maximum pairwise distance (compact clusters). Average linkage uses the mean pairwise distance. Ward linkage merges the pair that gives the smallest increase in total within-cluster variance."
    },
    {
      "type": "code-block",
      "label": "Agglomerative Clustering and Dendrogram",
      "code": "import matplotlib.pyplot as plt\nfrom scipy.cluster.hierarchy import linkage, dendrogram\nfrom sklearn.cluster import AgglomerativeClustering\nfrom sklearn.datasets import make_blobs\n\nX, _ = make_blobs(n_samples=30, centers=3, cluster_std=0.8, random_state=3)\n\nZ = linkage(X, method=\"ward\")            # build the merge tree\ndendrogram(Z)\nplt.title(\"Dendrogram (Ward linkage)\")\nplt.xlabel(\"Sample index\"); plt.ylabel(\"Merge distance\")\nplt.show()\n\nmodel = AgglomerativeClustering(n_clusters=3, linkage=\"ward\").fit(X)\nprint(\"Cluster labels:\", model.labels_)"
    },
    {
      "type": "h2",
      "text": "Fuzzy Clustering (Fuzzy C-Means)"
    },
    {
      "type": "p",
      "text": "In fuzzy clustering a point belongs to every cluster with a membership degree between 0 and 1, and the memberships of a point across all clusters sum to 1. Fuzzy C-Means (FCM) minimizes J = Σᵢ Σⱼ (uᵢⱼ)^m ‖xᵢ − cⱼ‖², where uᵢⱼ is the membership of point i in cluster j, cⱼ is the centre of cluster j, and m > 1 is the fuzziness exponent (usually 2). The two update rules that FCM alternates are: centre cⱼ = Σᵢ uᵢⱼ^m xᵢ / Σᵢ uᵢⱼ^m, and membership uᵢⱼ = 1 / Σₖ (dᵢⱼ / dᵢₖ)^(2/(m−1))."
    },
    {
      "type": "callout",
      "icon": "🍳",
      "text": "Real-life analogy: a song can be 70% rock and 30% pop. A hard clustering would force it into one genre; fuzzy clustering keeps both memberships. Points midway between two clusters get about 0.5 for each."
    },
    {
      "type": "code-block",
      "label": "Fuzzy C-Means from Scratch",
      "code": "import numpy as np\nfrom sklearn.datasets import make_blobs\n\ndef fuzzy_c_means(X, c=2, m=2.0, max_iter=100, tol=1e-5, seed=0):\n    rng = np.random.default_rng(seed)\n    n = X.shape[0]\n    U = rng.random((n, c))\n    U /= U.sum(axis=1, keepdims=True)                 # memberships of each point sum to 1\n    for _ in range(max_iter):\n        Um = U ** m\n        centers = (Um.T @ X) / Um.sum(axis=0)[:, None]                  # update centres\n        dist = np.linalg.norm(X[:, None, :] - centers[None, :, :], axis=2) + 1e-10\n        inv = dist ** (-2.0 / (m - 1))\n        U_new = inv / inv.sum(axis=1, keepdims=True)                    # update memberships\n        if np.linalg.norm(U_new - U) < tol:\n            U = U_new\n            break\n        U = U_new\n    return centers, U\n\nX, _ = make_blobs(n_samples=100, centers=[[0, 0], [5, 5]], cluster_std=1.2, random_state=5)\ncenters, U = fuzzy_c_means(X, c=2)\n\nprint(\"Centres:\\n\", centers.round(2))\nprint(\"Membership of first 3 points (rows sum to 1):\\n\", U[:3].round(3))\nprint(\"Hard labels via argmax:\", U.argmax(axis=1)[:10])"
    },
    {
      "type": "h2",
      "text": "BIRCH Algorithm"
    },
    {
      "type": "p",
      "text": "BIRCH (Balanced Iterative Reducing and Clustering using Hierarchies) is a hierarchical method designed for very large datasets. It scans the data once, compressing it into a compact in-memory tree of summaries so the full data never needs to be kept in memory."
    },
    {
      "type": "p",
      "text": "Its central idea is the Clustering Feature, CF = (N, LS, SS): N is the number of points in a sub-cluster, LS is the linear sum of the points, and SS is the sum of squared points. From these three numbers you can compute the centroid (LS/N), radius and diameter, and two CFs can be merged simply by adding their components. CFs are organized in a CF-Tree governed by two parameters: the branching factor B (maximum children per node) and the threshold T (maximum radius of a leaf sub-cluster)."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Phase 1: build the CF-Tree",
          "text": "Scan the data once; insert each point into the closest leaf sub-cluster if it stays within threshold T, otherwise start a new sub-cluster, splitting nodes when they exceed B."
        },
        {
          "num": "2",
          "title": "Phase 2: condense (optional)",
          "text": "Rebuild a smaller tree with a larger T to remove outliers and shrink the tree."
        },
        {
          "num": "3",
          "title": "Phase 3: global clustering",
          "text": "Run a standard algorithm (for example agglomerative or k-means) on the leaf sub-cluster summaries."
        },
        {
          "num": "4",
          "title": "Phase 4: refine (optional)",
          "text": "Re-assign the original points to the final cluster centres for better quality."
        }
      ]
    },
    {
      "type": "code-block",
      "label": "BIRCH with scikit-learn",
      "code": "from sklearn.cluster import Birch\nfrom sklearn.datasets import make_blobs\n\nX, _ = make_blobs(n_samples=5000, centers=4, cluster_std=0.8, random_state=11)\n\nbirch = Birch(threshold=0.5, branching_factor=50, n_clusters=4)\nlabels = birch.fit_predict(X)\n\nprint(\"Leaf sub-clusters kept in memory:\", len(birch.subcluster_centers_))\nprint(\"Final cluster sizes:\", [int((labels == k).sum()) for k in range(4)])\n# 5000 points were reduced to a few dozen sub-cluster summaries before final clustering."
    },
    {
      "type": "h2",
      "text": "CURE Algorithm"
    },
    {
      "type": "p",
      "text": "CURE (Clustering Using REpresentatives) is a hierarchical algorithm that represents each cluster by a fixed number of well-scattered representative points instead of a single centroid. Because the representatives capture the cluster's shape, CURE can find non-spherical and unevenly sized clusters, and it is robust to outliers."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Sample",
          "text": "Draw a random sample of the data so the algorithm scales to large databases."
        },
        {
          "num": "2",
          "title": "Partition and pre-cluster",
          "text": "Divide the sample into partitions and cluster each partition partially to save time."
        },
        {
          "num": "3",
          "title": "Choose representatives",
          "text": "For each cluster select c well-scattered points, so they trace the cluster's extent."
        },
        {
          "num": "4",
          "title": "Shrink",
          "text": "Move each representative toward the cluster centroid by a shrink factor α (0 to 1). This dampens the effect of outliers."
        },
        {
          "num": "5",
          "title": "Merge",
          "text": "Repeatedly merge the two clusters whose representatives are closest, recompute representatives, and stop at k clusters."
        },
        {
          "num": "6",
          "title": "Label",
          "text": "Assign every remaining point to the cluster with the nearest representative point."
        }
      ]
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "BIRCH",
        "CURE"
      ],
      "rows": [
        [
          "Cluster summary",
          "Clustering Feature (N, LS, SS) in a CF-tree",
          "Several scattered, shrunk representative points"
        ],
        [
          "Cluster shapes",
          "Best for spherical clusters",
          "Handles arbitrary shapes and different sizes"
        ],
        [
          "Outlier handling",
          "Optional condensing phase",
          "Shrinking and outlier elimination built in"
        ],
        [
          "Scalability",
          "Single scan, very fast",
          "Random sampling plus partitioning"
        ],
        [
          "Key parameters",
          "Branching factor B, threshold T",
          "Number of representatives c, shrink factor α"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "scikit-learn ships BIRCH but not CURE, so CURE is examined as theory only. Memorize the six steps above and the role of the shrink factor; that is what carries the marks."
    },
    {
      "type": "h2",
      "text": "Gaussian Mixture Models and Expectation Maximization"
    },
    {
      "type": "p",
      "text": "A Gaussian Mixture Model (GMM) assumes the data was generated by a mixture of K Gaussian distributions with unknown parameters. The probability density of a point is p(x) = Σₖ πₖ · N(x | μₖ, Σₖ), where πₖ is the mixing weight of component k (weights sum to 1), μₖ is its mean and Σₖ its covariance matrix. Unlike k-means, GMM gives each point a probability of belonging to each cluster and can model elliptical clusters of different sizes and orientations."
    },
    {
      "type": "p",
      "text": "The parameters are learned by the Expectation-Maximization (EM) algorithm, an iterative method for maximum likelihood when some variables (here, which component generated each point) are hidden. Each iteration cannot decrease the likelihood, so EM converges, though possibly to a local maximum."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Initialize",
          "text": "Choose starting values for πₖ, μₖ, Σₖ (often from a k-means run)."
        },
        {
          "num": "2",
          "title": "E-step (Expectation)",
          "text": "Compute the responsibility γᵢₖ = πₖ N(xᵢ|μₖ,Σₖ) / Σⱼ πⱼ N(xᵢ|μⱼ,Σⱼ): the probability that component k generated point i."
        },
        {
          "num": "3",
          "title": "M-step (Maximization)",
          "text": "Re-estimate the parameters using responsibilities as weights: Nₖ = Σᵢ γᵢₖ, μₖ = Σᵢ γᵢₖ xᵢ / Nₖ, Σₖ = Σᵢ γᵢₖ (xᵢ−μₖ)(xᵢ−μₖ)ᵀ / Nₖ, πₖ = Nₖ / N."
        },
        {
          "num": "4",
          "title": "Check convergence",
          "text": "Compute the log-likelihood; repeat E and M steps until it stops improving."
        }
      ]
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "K-Means",
        "Gaussian Mixture Model"
      ],
      "rows": [
        [
          "Assignment",
          "Hard",
          "Soft (probabilities)"
        ],
        [
          "Cluster shape",
          "Spherical",
          "Elliptical, any orientation"
        ],
        [
          "Algorithm",
          "Assign and update means",
          "Expectation-Maximization"
        ],
        [
          "Model",
          "No probabilistic model",
          "Generative probability model"
        ],
        [
          "Special case",
          "K-means is a GMM with equal spherical covariances and hard assignments",
          ""
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "GMM with EM in scikit-learn (Soft Assignments and Model Selection)",
      "code": "import numpy as np\nfrom sklearn.mixture import GaussianMixture\nfrom sklearn.datasets import make_blobs\n\nX, _ = make_blobs(n_samples=400, centers=3, cluster_std=[1.0, 2.0, 0.6], random_state=2)\n\nfor k in range(1, 6):\n    gmm = GaussianMixture(n_components=k, random_state=2).fit(X)\n    print(f\"components={k}  BIC={gmm.bic(X):.1f}\")   # lower BIC is better\n\ngmm = GaussianMixture(n_components=3, random_state=2).fit(X)\nprint(\"Mixing weights:\", gmm.weights_.round(3))\nprint(\"Means:\\n\", gmm.means_.round(2))\nprint(\"Responsibilities of first 3 points:\\n\", gmm.predict_proba(X[:3]).round(3))\nprint(\"Converged:\", gmm.converged_, \"after\", gmm.n_iter_, \"EM iterations\")"
    },
    {
      "type": "h2",
      "text": "Parameter Estimation: MLE and MAP"
    },
    {
      "type": "p",
      "text": "Parameter estimation is choosing the parameter values θ of a probability model that best explain the observed data D. There are two standard approaches."
    },
    {
      "type": "p",
      "text": "Maximum Likelihood Estimation (MLE) picks the θ that makes the observed data most probable: θ_MLE = argmax_θ P(D | θ), usually computed by maximizing the log-likelihood. It uses only the data. Maximum A Posteriori (MAP) estimation also brings in a prior belief P(θ) about the parameter and picks the mode of the posterior: θ_MAP = argmax_θ P(D | θ) · P(θ), by Bayes' theorem since P(θ | D) ∝ P(D | θ) P(θ)."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "MLE",
        "MAP"
      ],
      "rows": [
        [
          "Maximizes",
          "Likelihood P(D | θ)",
          "Posterior P(θ | D) ∝ P(D | θ) P(θ)"
        ],
        [
          "Prior knowledge",
          "Not used",
          "Used through prior P(θ)"
        ],
        [
          "Small data",
          "Can overfit (for example 3 heads in 3 tosses gives p = 1)",
          "Prior stabilizes the estimate"
        ],
        [
          "Large data",
          "Same result as MAP as data grows",
          "Prior's influence fades"
        ],
        [
          "Connection",
          "MAP with a uniform (flat) prior equals MLE",
          "A Gaussian prior on weights equals L2 regularization; Laplace prior gives L1"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🍳",
      "text": "Worked example (coin toss): you toss a coin 10 times and see 7 heads. MLE says p = 7/10 = 0.7. If you believe the coin is roughly fair and encode this as a Beta(5,5) prior, MAP gives p = (7 + 5 − 1) / (10 + 5 + 5 − 2) = 11/18 ≈ 0.611, pulled back toward 0.5 by your prior belief."
    },
    {
      "type": "code-block",
      "label": "MLE vs MAP for a Coin",
      "code": "heads, tosses = 7, 10\n\np_mle = heads / tosses                                   # MLE: fraction of heads\n\nalpha, beta = 5, 5                                       # Beta(5, 5) prior: 'probably fair'\np_map = (heads + alpha - 1) / (tosses + alpha + beta - 2)\n\nprint(\"MLE estimate:\", round(p_mle, 3))\nprint(\"MAP estimate:\", round(p_map, 3))\n\n# With extreme small data the difference is dramatic: 3 heads in 3 tosses\nprint(\"MLE (3/3):\", 3 / 3, \"  MAP (Beta(5,5)):\", round((3 + alpha - 1) / (3 + alpha + beta - 2), 3))"
    },
    {
      "type": "h2",
      "text": "Applications of Clustering"
    },
    {
      "type": "table",
      "headers": [
        "Domain",
        "Application"
      ],
      "rows": [
        [
          "Marketing",
          "Customer segmentation for targeted campaigns and recommendations"
        ],
        [
          "Image processing",
          "Image segmentation and colour compression (quantization)"
        ],
        [
          "Biology and medicine",
          "Grouping genes with similar expression, patient subtyping"
        ],
        [
          "Text and web",
          "Grouping similar documents, news articles and search results"
        ],
        [
          "Security and finance",
          "Anomaly and fraud detection (points far from any cluster)"
        ],
        [
          "Urban and geo",
          "Identifying crime hotspots, city zoning"
        ],
        [
          "Social networks",
          "Community detection"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Deeper Concepts: How to Choose a Clustering Method"
    },
    {
      "type": "p",
      "text": "The four clustering families differ mainly in what they assume about the structure of the data and how they represent membership. Partitioning methods directly optimize a grouping objective; distribution-based methods fit a probability model; hierarchical methods build nested groups; and fuzzy methods explicitly represent partial membership. These are not simply four names for the same procedure: the assumptions determine which patterns each method can discover."
    },
    {
      "type": "table",
      "headers": [
        "Question to ask",
        "What it tells you",
        "Possible choice"
      ],
      "rows": [
        [
          "Do I know the number of groups and expect compact clusters?",
          "A fixed-k method may be appropriate.",
          "K-means or K-medoids"
        ],
        [
          "Do I need a hierarchy at several levels?",
          "A tree can show broad and fine-grained groupings.",
          "Agglomerative clustering"
        ],
        [
          "Can clusters overlap or have uncertain boundaries?",
          "Membership should not be forced into one group.",
          "Fuzzy C-Means or GMM"
        ],
        [
          "Are clusters elliptical and differently oriented?",
          "A probabilistic covariance model can represent their shapes.",
          "GMM"
        ],
        [
          "Is the dataset too large to keep all detailed relationships in memory?",
          "A compact summary or sample can reduce computation.",
          "BIRCH or CURE"
        ],
        [
          "Are there irregular shapes and outliers?",
          "A single centroid may be a poor representation.",
          "CURE; density-based methods may also be considered"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🧠",
      "text": "Important distinction: the syllabus groups BIRCH and CURE under hierarchical clustering because they use hierarchical ideas, but they are specialized scalable algorithms. BIRCH summarizes data in a CF-Tree; CURE uses multiple representative points per cluster."
    },
    {
      "type": "h2",
      "text": "Partitioning Methods: K-Means and K-Medoids"
    },
    {
      "type": "p",
      "text": "K-means represents a cluster by its centroid, which is the arithmetic mean of its points. The centroid need not be an actual observation. K-medoids instead represents a cluster by a medoid: an actual data point whose total dissimilarity to the other points in that cluster is small. This makes K-medoids useful when a mean is not meaningful or when a distance measure other than squared Euclidean distance is required."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "K-Means",
        "K-Medoids"
      ],
      "rows": [
        [
          "Representative",
          "Mean (centroid), possibly not an observed point",
          "Medoid, an actual observed point"
        ],
        [
          "Objective",
          "Minimize within-cluster squared distances",
          "Minimize total dissimilarity to medoids"
        ],
        [
          "Outliers",
          "Sensitive because extreme values move the mean",
          "Generally more robust because representatives are data points"
        ],
        [
          "Data and distance",
          "Usually numeric features with Euclidean distance",
          "Can use a general dissimilarity matrix"
        ],
        [
          "Cost",
          "Usually faster on large numeric datasets",
          "Often more computationally expensive"
        ]
      ]
    },
    {
      "type": "p",
      "text": "A common K-medoids procedure is PAM (Partitioning Around Medoids). It first selects k medoids, assigns each observation to its nearest medoid, and then tests whether swapping a selected medoid with a non-medoid reduces the total cost. Beneficial swaps are accepted until no tested swap improves the objective."
    },
    {
      "type": "callout",
      "icon": "📘",
      "text": "Exam example: for customer spending data, K-means may produce a centroid such as (₹4,250, 3.7 visits), even if no customer has exactly those values. K-medoids chooses an actual customer record as the representative."
    },
    {
      "type": "h2",
      "text": "Selecting k and Evaluating Cluster Quality"
    },
    {
      "type": "p",
      "text": "The number of clusters is a modelling decision, not necessarily a fact known in advance. The elbow method plots the number of clusters k against WCSS/inertia. Inertia decreases as k increases, so the aim is to identify a bend where adding more clusters gives much smaller additional improvement. The elbow is a heuristic and may not be visually clear."
    },
    {
      "type": "p",
      "text": "The silhouette coefficient measures how well a point fits its assigned cluster compared with the nearest alternative cluster. For a point i, let a(i) be its average distance to points in its own cluster and b(i) the smallest average distance to points in another cluster. Its silhouette is s(i) = [b(i) − a(i)] / max(a(i), b(i)). Values approach +1 for well-separated assignments, are around 0 near a boundary, and can be negative when a point may be assigned to the wrong cluster. The overall score is the mean across points."
    },
    {
      "type": "table",
      "headers": [
        "Evaluation approach",
        "Needs true labels?",
        "What it measures"
      ],
      "rows": [
        [
          "Inertia / WCSS",
          "No",
          "Compactness under the K-means squared-distance objective"
        ],
        [
          "Silhouette score",
          "No",
          "Within-cluster cohesion compared with nearest-cluster separation"
        ],
        [
          "Davies–Bouldin index",
          "No",
          "Average similarity between each cluster and its most similar other cluster; lower is better"
        ],
        [
          "Adjusted Rand Index (ARI)",
          "Yes",
          "Agreement between predicted clusters and known reference labels, adjusted for chance"
        ],
        [
          "Normalized Mutual Information (NMI)",
          "Yes",
          "Shared information between predicted groupings and reference labels"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Do not use accuracy as the default metric for clustering: cluster IDs such as 0, 1 and 2 are arbitrary and do not directly correspond to class labels. Use internal measures when labels are unavailable and external measures only when reference labels exist."
    },
    {
      "type": "code-block",
      "label": "Compare k with Inertia and Silhouette",
      "code": "from sklearn.cluster import KMeans\nfrom sklearn.datasets import make_blobs\nfrom sklearn.metrics import silhouette_score\n\nX, _ = make_blobs(n_samples=500, centers=4, cluster_std=0.85, random_state=21)\n\nfor k in range(2, 8):\n    model = KMeans(n_clusters=k, n_init=10, random_state=21)\n    labels = model.fit_predict(X)\n    print(f\"k={k}: inertia={model.inertia_:.1f}, silhouette={silhouette_score(X, labels):.3f}\")\n\n# Consider both measures and the shape of the data; do not choose k from\n# inertia alone because inertia always decreases as k increases."
    },
    {
      "type": "h2",
      "text": "Distribution Model-Based Clustering: The General Idea"
    },
    {
      "type": "p",
      "text": "A distribution model-based method assumes that observations are generated by one of several probability distributions. Each distribution represents a cluster. Instead of assigning a point only by geometric distance, the method evaluates how likely the point is under each component model. The Gaussian Mixture Model is a widely used example, but the broader idea is not limited to Gaussian distributions."
    },
    {
      "type": "p",
      "text": "A model-based approach can provide a principled way to represent uncertainty and can describe clusters with different shapes when the selected distribution family supports them. Its quality depends on whether the assumed distributions are suitable. If the true data structure is strongly non-Gaussian, a Gaussian mixture may need many components or may give a misleading representation."
    },
    {
      "type": "h2",
      "text": "Hierarchical Clustering: Linkage and Dendrogram Interpretation"
    },
    {
      "type": "p",
      "text": "A dendrogram records the order and distance at which clusters are merged. The vertical height of a merge represents the dissimilarity at which two groups join (subject to the linkage definition). A horizontal cut across the dendrogram creates a flat clustering: branches below the cut form the resulting groups. A large vertical gap between merge levels can suggest a useful cut, but it should be checked against domain knowledge and cluster-quality measures."
    },
    {
      "type": "table",
      "headers": [
        "Linkage",
        "Distance between clusters",
        "Typical behaviour"
      ],
      "rows": [
        [
          "Single",
          "Minimum distance between any pair of observations",
          "Can discover elongated connections, but may create chaining"
        ],
        [
          "Complete",
          "Maximum distance between any pair of observations",
          "Often produces compact groups; can be affected by extreme points"
        ],
        [
          "Average",
          "Average of all pairwise distances across the two clusters",
          "A compromise between single and complete linkage"
        ],
        [
          "Ward",
          "Increase in within-cluster sum of squares caused by a merge",
          "Often favours compact, similarly sized groups; commonly used with Euclidean geometry"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam tip: explain both the direction and the stopping/cutting idea. Agglomerative starts with n singleton clusters and performs n−1 merges to obtain one cluster; a dendrogram can be cut earlier to obtain the desired grouping."
    },
    {
      "type": "h2",
      "text": "Fuzzy C-Means: Interpreting Membership Values"
    },
    {
      "type": "p",
      "text": "In Fuzzy C-Means, the membership matrix U has one row per observation and one column per cluster. Every membership lies between 0 and 1, and the memberships in each row sum to 1. A point with memberships [0.80, 0.15, 0.05] is mostly associated with cluster 1 but has some membership in the other two. A hard label can be produced by taking the largest membership, but doing so discards the uncertainty that fuzzy clustering was designed to preserve."
    },
    {
      "type": "p",
      "text": "The fuzziness exponent m controls how diffuse memberships are. As m approaches 1 from above, memberships become more concentrated and the behaviour approaches hard assignment. Larger m produces more spread-out memberships. FCM is sensitive to feature scales, initialization and outliers, and it generally works best when clusters are reasonably compact under the selected distance measure."
    },
    {
      "type": "callout",
      "icon": "🔎",
      "text": "Fuzzy membership is not automatically the same as a calibrated probability. It expresses the algorithm's degree of membership under its objective and should not be interpreted as a statistically calibrated chance unless a probabilistic model justifies that interpretation."
    },
    {
      "type": "h2",
      "text": "BIRCH in More Detail: Clustering Features and CF-Tree"
    },
    {
      "type": "p",
      "text": "For a d-dimensional sub-cluster, the Clustering Feature CF = (N, LS, SS) stores N, the number of points; LS, the component-wise linear sum of the points; and SS, the sum of squared coordinates. The centroid is LS/N. The radius is the root mean squared distance of the points from their centroid, and the diameter is the root mean squared pairwise distance between points in the sub-cluster. These statistics allow compact summaries to be combined without repeatedly storing every original observation."
    },
    {
      "type": "p",
      "text": "A CF-Tree is a height-balanced tree whose internal entries summarize child sub-clusters and whose leaf entries summarize compact sub-clusters. The branching factor controls how many entries a node can hold. The threshold controls how large a leaf sub-cluster may become before a new entry or a node split is needed. A smaller threshold tends to preserve more detail and create more leaf sub-clusters; a larger threshold compresses more aggressively."
    },
    {
      "type": "table",
      "headers": [
        "Parameter / property",
        "Meaning",
        "Practical effect"
      ],
      "rows": [
        [
          "Branching factor",
          "Maximum number of child entries in a node",
          "Larger values can make the tree wider and reduce its height"
        ],
        [
          "Threshold",
          "Maximum permitted radius for a leaf sub-cluster",
          "Smaller values retain finer detail but use more memory"
        ],
        [
          "CF additivity",
          "(N, LS, SS) values are added when summaries are merged",
          "Efficient aggregation of sub-clusters"
        ],
        [
          "Condensing",
          "Rebuild or compress the tree using a larger threshold",
          "Reduces the number of summaries and can remove small isolated groups"
        ]
      ]
    },
    {
      "type": "p",
      "text": "BIRCH is especially useful when data arrives in a stream or when a full pairwise distance matrix would be too expensive. Its incremental summary is efficient, but its results can depend on the order in which observations arrive and on the threshold. The original data geometry and the selected distance measure also matter."
    },
    {
      "type": "h2",
      "text": "CURE in More Detail: Representative Points and Shrinking"
    },
    {
      "type": "p",
      "text": "A centroid alone can poorly describe an irregular cluster. CURE selects several well-scattered observations as representatives, then shrinks each representative toward the cluster mean. If a representative is x and the cluster centroid is μ, the shrunk point is x' = μ + α(x − μ), where α is the shrink factor between 0 and 1. When α is close to 1, representatives remain near their original positions; when α is smaller, they move closer to the centroid."
    },
    {
      "type": "p",
      "text": "Using multiple representatives allows CURE to approximate a cluster's shape and extent. Shrinking reduces the influence of extreme boundary points. Sampling and partitioning reduce the computational burden on large datasets. Important design choices include the sample size, number of representatives per cluster, shrink factor and target number of clusters."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Memory aid: BIRCH compresses observations into statistical summaries; CURE describes each cluster with several geometrical representatives and moves them inward."
    },
    {
      "type": "h2",
      "text": "Gaussian Mixture Models: Parameters and Covariance"
    },
    {
      "type": "p",
      "text": "A GMM with K components has mixing weights π₁,…,πK, component means μ₁,…,μK and covariance matrices Σ₁,…,ΣK. Each mixing weight is non-negative and the weights sum to 1. The covariance matrix describes spread and relationships between features. A diagonal covariance assumes no within-component feature correlations; a full covariance can represent tilted elliptical clusters but requires more parameters."
    },
    {
      "type": "table",
      "headers": [
        "Covariance type",
        "Assumption",
        "Shape represented"
      ],
      "rows": [
        [
          "Full",
          "Each component has its own unrestricted covariance matrix",
          "Ellipses with different orientations and sizes"
        ],
        [
          "Tied",
          "All components share one full covariance matrix",
          "Same general covariance structure across components"
        ],
        [
          "Diagonal",
          "Each component has its own diagonal covariance matrix",
          "Axis-aligned ellipses"
        ],
        [
          "Spherical",
          "Each component has one variance value shared across dimensions",
          "Spheres / circles"
        ]
      ]
    },
    {
      "type": "p",
      "text": "The number of components K is a model-selection choice. Information criteria such as AIC and BIC balance model fit against model complexity; lower values are preferred when comparing candidate models fitted to the same dataset under the same criterion. BIC penalizes additional parameters more strongly than AIC in many common sample-size settings. These criteria support model selection but do not guarantee that the selected clusters are meaningful for a particular application."
    },
    {
      "type": "h2",
      "text": "Expectation-Maximization: Why the Two Steps Work"
    },
    {
      "type": "p",
      "text": "The component identity that generated each observation is a latent (unobserved) variable. If those identities were known, estimating each Gaussian's parameters would be straightforward. If the parameters were known, estimating the probability of each component for every observation would also be straightforward. EM alternates between these two easier tasks."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Start with initial parameters",
          "text": "Set initial component weights, means and covariance matrices. K-means assignments are sometimes used to initialize the means and covariances."
        },
        {
          "num": "2",
          "title": "E-step: estimate hidden assignments",
          "text": "Calculate each observation's responsibility for every component using Bayes' rule. A responsibility is a soft assignment and the responsibilities for one observation sum to 1."
        },
        {
          "num": "3",
          "title": "M-step: update model parameters",
          "text": "Treat responsibilities as fractional weights and calculate updated component weights, means and covariance matrices."
        },
        {
          "num": "4",
          "title": "Evaluate and repeat",
          "text": "Evaluate the data log-likelihood and repeat the E-step and M-step until improvement is sufficiently small or the iteration limit is reached."
        }
      ]
    },
    {
      "type": "p",
      "text": "EM is an optimization procedure, not a guarantee of finding the global best solution. The likelihood is non-decreasing under the standard exact EM updates, but the algorithm can converge to a local maximum or a saddle point. Different initializations can lead to different solutions, so multiple restarts are often used. Covariance regularization can help prevent singular covariance estimates when a component collapses around too few points."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Numerical note: implementations generally evaluate Gaussian probabilities using log densities and log-sum-exp calculations. Directly multiplying many very small probabilities can underflow to zero and make responsibility calculations unstable."
    },
    {
      "type": "h2",
      "text": "MLE: A Worked Parameter-Estimation View"
    },
    {
      "type": "p",
      "text": "Suppose observations x₁,…,xₙ are modelled by a probability distribution with parameter θ. The likelihood is L(θ) = P(D | θ) = product of the individual observation probabilities or densities, under the model's independence assumptions. The log-likelihood is ℓ(θ) = log L(θ), which converts products into sums and is easier to optimize. MLE chooses the parameter that maximizes this likelihood."
    },
    {
      "type": "p",
      "text": "For a Bernoulli coin with h heads and t tails, the likelihood is proportional to p^h(1−p)^t. Taking the derivative of the log-likelihood and setting it to zero gives p_MLE = h/(h+t), the observed fraction of heads. This estimate is intuitive, but with a very small sample it can be extreme; three heads in three tosses gives an MLE of 1."
    },
    {
      "type": "h2",
      "text": "MAP: Prior Knowledge and Bayesian Estimation"
    },
    {
      "type": "p",
      "text": "MAP combines the likelihood with a prior distribution over parameters. Bayes' theorem gives P(θ | D) proportional to P(D | θ)P(θ), so maximizing the posterior is equivalent to maximizing log-likelihood plus log-prior: θ_MAP = argmaxθ [log P(D | θ) + log P(θ)]. The prior can stabilize estimates when data is limited, but the result depends on the chosen prior."
    },
    {
      "type": "p",
      "text": "For a Bernoulli parameter p with a Beta(α, β) prior and h heads and t tails, the posterior is Beta(α+h, β+t). When both posterior shape parameters are greater than 1, the posterior mode (MAP estimate) is (α+h−1)/(α+β+h+t−2). If either shape parameter is at most 1, the mode may occur at a boundary, so the formula should not be applied blindly."
    },
    {
      "type": "table",
      "headers": [
        "Concept",
        "MLE",
        "MAP"
      ],
      "rows": [
        [
          "Objective",
          "Maximize the probability of the observed data",
          "Maximize the posterior probability of the parameter"
        ],
        [
          "Prior",
          "No prior term",
          "Includes a prior distribution"
        ],
        [
          "Log form",
          "Maximize log-likelihood",
          "Maximize log-likelihood plus log-prior"
        ],
        [
          "Data effect",
          "May be unstable with limited observations",
          "Prior can regularize estimates when data is limited"
        ],
        [
          "Relationship",
          "Equals MAP under a constant prior when the maximum exists",
          "Approaches MLE influence as data becomes dominant under regular conditions"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🔗",
      "text": "Connection to regularization: maximizing a likelihood with a Gaussian prior on model weights corresponds to an L2 penalty in the negative log objective; a Laplace prior corresponds to an L1 penalty. Thus, regularization can be interpreted as a MAP estimation choice."
    },
    {
      "type": "h2",
      "text": "Applications of Clustering: Extended Examples"
    },
    {
      "type": "table",
      "headers": [
        "Application area",
        "Example data",
        "How clustering helps"
      ],
      "rows": [
        [
          "Retail and marketing",
          "Purchase history, frequency, basket size",
          "Find customer segments for targeted campaigns and product recommendations"
        ],
        [
          "Banking and finance",
          "Transaction amount, timing, merchant patterns",
          "Discover typical transaction groups and flag unusual behaviour for further review"
        ],
        [
          "Healthcare",
          "Symptoms, lab measurements, medical images",
          "Explore patient subgroups and patterns that may support clinical research"
        ],
        [
          "Bioinformatics",
          "Gene-expression profiles",
          "Group genes with similar expression patterns for biological investigation"
        ],
        [
          "Computer vision",
          "Pixel colour and feature vectors",
          "Segment images into regions and perform colour quantization"
        ],
        [
          "Text mining",
          "Document embeddings or word-frequency vectors",
          "Group related articles, support document organization and discover themes"
        ],
        [
          "Cybersecurity",
          "Network flows, login behaviour, device activity",
          "Identify common behaviour profiles and investigate anomalous clusters or points"
        ],
        [
          "Geography and urban planning",
          "Coordinates, population and service-access data",
          "Find geographic hotspots and support zoning or facility planning"
        ],
        [
          "Social networks",
          "User interactions and graph features",
          "Discover communities with dense internal relationships"
        ],
        [
          "Manufacturing",
          "Sensor readings and machine operating states",
          "Group operating patterns and help identify unusual machine conditions"
        ]
      ]
    },
    {
      "type": "p",
      "text": "Clustering is exploratory: a discovered group is not automatically a real-world category or a causal explanation. Domain experts should interpret the clusters, test their stability and check whether the grouping is useful for the intended decision. In high-impact settings, cluster assignments should not be treated as definitive decisions about individuals."
    },
    {
      "type": "h2",
      "text": "Common Clustering Mistakes and Exam Pitfalls"
    },
    {
      "type": "checklist",
      "items": [
        "Forgetting to scale numeric features when the distance measure is sensitive to feature units.",
        "Assuming K-means can discover arbitrary-shaped clusters or automatically identify the correct k.",
        "Treating a GMM responsibility as a fuzzy membership value with exactly the same interpretation.",
        "Saying that a dendrogram itself selects the final number of clusters; a cut or selection rule is still needed.",
        "Confusing BIRCH's CF summary (N, LS, SS) with CURE's representative points.",
        "Describing CURE's shrink factor without explaining that representatives move toward the cluster centroid.",
        "Claiming that EM always finds the global maximum likelihood solution.",
        "Using the Beta posterior mode formula without checking whether the posterior mode is interior or at a boundary.",
        "Evaluating unsupervised clusters with classification accuracy when no valid label mapping has been defined."
      ]
    },
    {
      "type": "h2",
      "text": "Long-Answer Writing Framework for University Exams"
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Define the concept",
          "text": "Start with a precise definition and state whether the method is supervised or unsupervised, hard or soft, where relevant."
        },
        {
          "num": "2",
          "title": "Explain the working principle",
          "text": "Describe the input, representation, objective or model assumption, and the sequence of operations."
        },
        {
          "num": "3",
          "title": "Write the key formula",
          "text": "Define every symbol in the equation instead of writing a formula without explanation."
        },
        {
          "num": "4",
          "title": "Add an example or diagram",
          "text": "Use a small dataset, a dendrogram sketch, a CF-Tree description or an E-step/M-step flow."
        },
        {
          "num": "5",
          "title": "Discuss strengths and limitations",
          "text": "Mention the data shapes, scale, assumptions and computational considerations for which the method is suitable."
        },
        {
          "num": "6",
          "title": "Conclude with an application",
          "text": "Connect the algorithm to a practical use such as customer segmentation, image segmentation or anomaly investigation."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the K-means algorithm step by step and state two of its limitations.",
        "Q2: Differentiate agglomerative and divisive hierarchical clustering.",
        "Q3: What is a Clustering Feature in BIRCH? State its components and the two tree parameters.",
        "Q4: Explain the E-step and M-step of EM for a Gaussian Mixture Model.",
        "Q5: Differentiate MLE and MAP. If 6 heads appear in 8 tosses with a Beta(2,2) prior, compute both estimates."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Choose k, initialize k centroids, assign each point to the nearest centroid, recompute each centroid as the mean of its cluster, repeat until centroids stabilize. Limitations: k must be specified in advance, and results depend on initialization and are poor for non-spherical clusters or data with outliers."
    },
    {
      "type": "p",
      "text": "A2: Agglomerative starts with each point as its own cluster and merges the closest pair repeatedly until one cluster remains (bottom-up). Divisive starts with one cluster and splits recursively until every point is separate (top-down). Agglomerative is cheaper and more commonly used."
    },
    {
      "type": "p",
      "text": "A3: CF = (N, LS, SS), the number of points, linear sum of points and sum of squares of points in a sub-cluster. CFs are additive, so merging is cheap. The CF-Tree uses branching factor B (maximum children per node) and threshold T (maximum radius of a leaf sub-cluster)."
    },
    {
      "type": "p",
      "text": "A4: E-step: with current parameters, compute for each point the responsibility of each Gaussian component, the posterior probability that the component generated the point. M-step: using these responsibilities as soft weights, re-estimate each component's mixing weight, mean and covariance to maximize expected log-likelihood. Iterate until the likelihood converges."
    },
    {
      "type": "p",
      "text": "A5: MLE maximizes the likelihood using data only; MAP maximizes likelihood times a prior, so it incorporates prior belief. Here MLE = 6/8 = 0.75. MAP with Beta(2,2) = (6 + 2 − 1) / (8 + 2 + 2 − 2) = 7/10 = 0.70, slightly pulled toward the prior mean of 0.5."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Clustering finds structure without labels. Partitioning methods such as K-means are fast but hard-assigning and spherical; hierarchical methods give a full tree; fuzzy and distribution-based methods give soft memberships, with GMM trained by EM. BIRCH and CURE are the scalable hierarchical variants: BIRCH via compact CF summaries, CURE via shrunk representative points. MLE and MAP explain how the parameters of such probabilistic models are estimated, with MAP simply adding a prior."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: memorize the comparison tables (hard vs soft, K-means vs GMM, BIRCH vs CURE, MLE vs MAP). Almost every Unit II 'differentiate' question can be answered directly from them. Next, Part 3 switches to supervised learning with the classification algorithms."
    },
    {
      "type": "cta",
      "text": "Continue to Part 3: Classification →",
      "href": "/tutorials/ml-exam-mastery/part-3-classification",
      "note": "Logistic regression, trees, neural networks, k-NN, SVM, Naive Bayes and performance measures"
    }
  ]
};

export default post;
