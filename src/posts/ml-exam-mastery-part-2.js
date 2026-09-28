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
