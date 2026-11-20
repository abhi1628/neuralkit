const post = {
  "slug": "part-2-clustering",
  "seriesSlug": "ml-exam-mastery",
  "partNumber": 2,
  "totalParts": 5,
  "title": "Clustering, GMM & Parameter Estimation (Part 2)",
  "seriesTitle": "Machine Learning: The Complete Unit-Wise Exam Mastery Series",
  "date": "September 28, 2026",
  "readTime": "22 min read",
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
      "text": "Clustering is an unsupervised learning technique that partitions a set of unlabelled data points into groups (clusters) so that points in the same cluster are more similar to each other than to points in other clusters. Similarity is measured with a distance function, most commonly Euclidean distance d(a, b) = √( Σᵢ (aᵢ − bᵢ)² )."
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
      "text": "Clustering Methods: Detailed Theory and Method Selection"
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
      "type": "p",
      "text": "Code walkthrough: the loop below is K-means with nothing hidden. It repeats the two steps from the algorithm (assign every point to its nearest centroid, then move each centroid to the mean of its points) and prints the sum of squared errors (SSE) after each pass. The starting centroids are deliberately poor, with both placed inside the first group, so you can watch the algorithm repair itself."
    },
    {
      "type": "code-block",
      "label": "K-Means from Scratch: Assignment and Update Steps",
      "code": "import numpy as np\n\n# Six 2-D points forming two obvious groups\nX = np.array([[1.0, 1.0], [1.5, 2.0], [2.0, 1.5],\n              [8.0, 8.0], [8.5, 9.0], [9.0, 8.5]])\nk = 2\ncentroids = X[[0, 1]].copy()          # a poor start: both centroids inside the first group\n\nfor step in range(1, 10):\n    # Assignment step: nearest centroid for every point\n    dists = np.linalg.norm(X[:, None, :] - centroids[None, :, :], axis=2)\n    labels = dists.argmin(axis=1)\n\n    # Update step: each centroid becomes the mean of its points\n    new_centroids = np.array([X[labels == j].mean(axis=0) for j in range(k)])\n    sse = sum(((X[labels == j] - new_centroids[j]) ** 2).sum() for j in range(k))\n    print(f\"iter {step}: labels={labels.tolist()}, SSE={sse:.3f}\")\n\n    if np.allclose(new_centroids, centroids):   # converged: nothing moved\n        break\n    centroids = new_centroids\n\nprint(\"final centroids:\\n\", np.round(centroids, 2))\n\n# Output:\n#   iter 1: labels=[0, 1, 1, 1, 1, 1], SSE=110.600\n#   iter 2: labels=[0, 0, 0, 1, 1, 1], SSE=2.000\n#   iter 3: labels=[0, 0, 0, 1, 1, 1], SSE=2.000\n#   final centroids:\n#    [[1.5 1.5]\n#    [8.5 8.5]]"
    },
    {
      "type": "p",
      "text": "What to notice: in iteration 1 the bad start leaves one centroid alone and drags the other across both groups, so SSE is 110.6. One update later SSE drops to 2.0, and iteration 3 changes nothing, which is the convergence test. SSE never increases from one iteration to the next, but the result depends on the starting centroids, which is why practical implementations use several random restarts (n_init) or k-means++ seeding."
    },
    {
      "type": "p",
      "text": "K-means versus K-medoids is easiest to defend with a tiny outlier example. The mean is an average that may not be a real observation and moves towards extreme values; a medoid is always an actual data point chosen to minimise total distance to the others."
    },
    {
      "type": "code-block",
      "label": "Why K-Medoids Is More Robust Than K-Means",
      "code": "import numpy as np\n\n# One cluster of marks with a single extreme outlier\nx = np.array([52.0, 55.0, 58.0, 60.0, 61.0, 300.0])\n\nmean = x.mean()                                   # K-means style centre\n# Medoid: the actual data point with the smallest total distance to all others\ntotal_dist = np.abs(x[:, None] - x[None, :]).sum(axis=1)\nmedoid = x[total_dist.argmin()]\n\nprint(f\"mean   = {mean:.2f}   (dragged towards the outlier, not a real data point)\")\nprint(f\"medoid = {medoid:.2f}   (an actual observation, barely affected by the outlier)\")\n\n# Output:\n#   mean   = 97.67   (dragged towards the outlier, not a real data point)\n#   medoid = 58.00   (an actual observation, barely affected by the outlier)"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam sentence: 'K-means uses the mean as the cluster centre, so one extreme value can pull the centroid away from the bulk of the data (here 97.67 against a typical value near 58). K-medoids uses an actual observation as the centre, so it is more robust to outliers, at the cost of a more expensive search for medoids.'"
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
      "text": "The silhouette coefficient measures how well a point fits its assigned cluster compared with the nearest alternative cluster. For a point i, let a(i) be its average distance to points in its own cluster and b(i) the smallest average distance to points in another cluster. Its silhouette is s(i) = (b(i) − a(i)) / max(a(i), b(i)). Values approach +1 for well-separated assignments, are around 0 near a boundary, and can be negative when a point may be assigned to the wrong cluster. The overall score is the mean across points."
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
      "type": "p",
      "text": "Code walkthrough: SciPy builds the full merge tree with linkage(). Each row of the returned matrix records which two clusters were merged, the distance at which they merged and the size of the new cluster. fcluster() then cuts the tree to give a flat clustering, and the cophenetic correlation measures how faithfully the tree preserves the original pairwise distances (closer to 1 is better)."
    },
    {
      "type": "code-block",
      "label": "Agglomerative Clustering: Linkage Methods, Cophenetic Correlation and Cutting the Tree",
      "code": "import numpy as np\nfrom scipy.cluster.hierarchy import linkage, fcluster, cophenet\nfrom scipy.spatial.distance import pdist\n\nX = np.array([[1, 1], [1.5, 1.2], [2, 1],\n              [6, 6], [6.5, 6.2], [7, 6],\n              [12, 1], [12.5, 1.3]])\n\nd = pdist(X)                                   # pairwise Euclidean distances\nfor method in [\"single\", \"complete\", \"average\", \"ward\"]:\n    Z = linkage(X, method=method)              # each row: [cluster_a, cluster_b, distance, size]\n    c, _ = cophenet(Z, d)                      # how faithfully the tree preserves distances\n    labels = fcluster(Z, t=3, criterion=\"maxclust\")   # cut the dendrogram into 3 clusters\n    print(f\"{method:8s} cophenetic corr={c:.3f}  labels={labels.tolist()}\")\n\nZ = linkage(X, method=\"average\")\nprint(\"\\nLast three merges (average linkage): [a, b, merge distance, size]\")\nprint(np.round(Z[-3:], 2))\n\n# Output:\n#   single   cophenetic corr=0.939  labels=[2, 2, 2, 3, 3, 3, 1, 1]\n#   complete cophenetic corr=0.945  labels=[2, 2, 2, 3, 3, 3, 1, 1]\n#   average  cophenetic corr=0.951  labels=[2, 2, 2, 3, 3, 3, 1, 1]\n#   ward     cophenetic corr=0.918  labels=[1, 1, 1, 3, 3, 3, 2, 2]\n#   \n#   Last three merges (average linkage): [a, b, merge distance, size]\n#   [[ 5.    9.    0.77  3.  ]\n#    [11.   12.    7.08  6.  ]\n#    [10.   13.    9.16  8.  ]]"
    },
    {
      "type": "p",
      "text": "What to notice: single, complete and average linkage agree on the three natural groups, while Ward linkage finds the same groups but numbers them differently, because cluster IDs are arbitrary labels and not class names. The last three rows of the average-linkage matrix show the story of the dendrogram: a tight triple forms at distance 0.77, but the next two merges happen at 7.08 and 9.16. That large jump in merge distance is the visual cue for where to cut: cutting below 7.08 leaves three natural clusters."
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
      "type": "p",
      "text": "Code walkthrough: this is Fuzzy C-Means with the two update rules written out. The membership update gives a larger value to nearer centres and forces each row of U to sum to 1; the centre update is a weighted mean using memberships raised to the fuzziness exponent m. The last data point is placed exactly between the two groups to show what soft assignment looks like."
    },
    {
      "type": "code-block",
      "label": "Fuzzy C-Means: Membership and Centre Updates",
      "code": "import numpy as np\n\nX = np.array([[1.0], [2.0], [3.0], [7.0], [8.0], [9.0], [5.0]])   # last point sits in the middle\nc, m = 2, 2.0                                   # clusters and fuzziness exponent\ncenters = np.array([[2.0], [8.0]])              # fixed start for a repeatable run\n\nfor it in range(50):\n    # Membership update: closer centre => larger membership; each row sums to 1\n    d = np.linalg.norm(X[:, None, :] - centers[None, :, :], axis=2) + 1e-9\n    U = 1.0 / ((d[:, :, None] / d[:, None, :]) ** (2 / (m - 1))).sum(axis=2)\n\n    # Centre update: weighted mean using memberships raised to the power m\n    W = U ** m\n    new_centers = (W.T @ X) / W.sum(axis=0)[:, None]\n    if np.allclose(new_centers, centers, atol=1e-6):\n        break\n    centers = new_centers\n\nprint(\"centres:\", np.round(centers.ravel(), 2))\nprint(\"memberships (rows = points, columns = clusters):\")\nprint(np.round(U, 2))\n\n# Output:\n#   centres: [2.25 7.75]\n#   memberships (rows = points, columns = clusters):\n#   [[0.97 0.03]\n#    [1.   0.  ]\n#    [0.98 0.02]\n#    [0.02 0.98]\n#    [0.   1.  ]\n#    [0.03 0.97]\n#    [0.5  0.5 ]]"
    },
    {
      "type": "p",
      "text": "What to notice: points inside a group get memberships close to 1 for their own cluster, but the middle point (5.0) gets 0.50 and 0.50. K-means would force it into one cluster with no sign of doubt; Fuzzy C-Means keeps the ambiguity visible. Rows always sum to 1, but, as noted above, these are degrees of membership and not calibrated probabilities."
    },
    {
      "type": "h2",
      "text": "BIRCH Algorithm: Clustering Features and CF-Tree"
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
      "text": "CURE Algorithm: Representative Points and Shrinking"
    },
    {
      "type": "p",
      "text": "A centroid alone can poorly describe an irregular cluster. CURE selects several well-scattered observations as representatives, then shrinks each representative toward the cluster mean. If a representative is x and the cluster centroid is μ, the shrunk point is x′ = μ + α(x − μ), where α is the shrink factor between 0 and 1. When α is close to 1, representatives remain near their original positions; when α is smaller, they move closer to the centroid."
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
      "type": "p",
      "text": "Code walkthrough: the first half streams 3,000 points into scikit-learn's Birch in six batches using partial_fit, so the algorithm never needs the whole dataset in memory at once; only the compact CF-tree summaries are kept. The second half demonstrates CURE's shrinking step, x′ = μ + α(x − μ), on four well-scattered representative points of one cluster."
    },
    {
      "type": "code-block",
      "label": "BIRCH on a Stream of Batches and CURE Representative Shrinking",
      "code": "import numpy as np\nfrom sklearn.cluster import Birch\nfrom sklearn.datasets import make_blobs\n\nX, _ = make_blobs(n_samples=3000, centers=3, cluster_std=0.7, random_state=7)\n\n# BIRCH reads data in batches and keeps only compact summaries (CF entries)\nmodel = Birch(threshold=0.8, branching_factor=50, n_clusters=3)\nfor batch in np.array_split(X, 6):              # pretend the data arrives as a stream\n    model.partial_fit(batch)\nlabels = model.predict(X)\nprint(\"sub-clusters kept in the CF-tree:\", len(model.subcluster_centers_))\nprint(\"cluster sizes:\", np.bincount(labels).tolist())\n\n# CURE idea: shrink representative points towards the centroid by factor alpha\ncluster = X[labels == 0]\ncentroid = cluster.mean(axis=0)\nfar = np.argsort(np.linalg.norm(cluster - centroid, axis=1))[-4:]   # 4 well-scattered extremes\nreps = cluster[far]\nalpha = 0.3\nshrunk = centroid + alpha * (reps - centroid)    # x' = mu + alpha (x - mu)\nprint(\"distance of representatives from centroid before:\", np.round(np.linalg.norm(reps - centroid, axis=1), 2))\nprint(\"distance of representatives from centroid after :\", np.round(np.linalg.norm(shrunk - centroid, axis=1), 2))\n\n# Output:\n#   sub-clusters kept in the CF-tree: 15\n#   cluster sizes: [1000, 1000, 1000]\n#   distance of representatives from centroid before: [2.46 2.46 2.6  2.67]\n#   distance of representatives from centroid after : [0.74 0.74 0.78 0.8 ]"
    },
    {
      "type": "p",
      "text": "What to notice: 3,000 points are summarised by only 15 sub-clusters in the CF-tree, and the final grouping still recovers three clusters of 1,000. For CURE, shrinking with α = 0.3 pulls representatives from about 2.5 to about 0.75 units from the centroid, so outliers cannot stretch the cluster boundary far, while multiple representatives still let the cluster keep a non-spherical shape."
    },
    {
      "type": "h2",
      "text": "Gaussian Mixture Models: Parameters and Covariance"
    },
    {
      "type": "p",
      "text": "A GMM with K components has mixing weights π₁, …, πₖ, component means μ₁, …, μₖ and covariance matrices Σ₁, …, Σₖ. Each mixing weight is non-negative and the weights sum to 1. The covariance matrix describes spread and relationships between features. A diagonal covariance assumes no within-component feature correlations; a full covariance can represent tilted elliptical clusters but requires more parameters."
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
      "type": "p",
      "text": "Code walkthrough: this is a complete EM loop for a one-dimensional mixture of two Gaussians. The E-step computes each point's responsibility for each component, and the M-step re-estimates the weights, means and variances from those responsibilities. The starting means are deliberately close together and wrong, and the two clumps overlap, so convergence takes several iterations and you can watch it happen."
    },
    {
      "type": "code-block",
      "label": "Expectation-Maximization for a Two-Component Gaussian Mixture",
      "code": "import numpy as np\n\nx = np.array([1.0, 1.8, 2.3, 2.9, 4.0, 4.7, 5.6, 6.4])   # two overlapping clumps on a line\n\n# Initial guesses for K = 2 components\npi = np.array([0.5, 0.5])\nmu = np.array([2.0, 3.0])        # deliberately poor, close-together start\nvar = np.array([1.0, 1.0])\n\ndef normal_pdf(x, mu, var):\n    return np.exp(-(x - mu) ** 2 / (2 * var)) / np.sqrt(2 * np.pi * var)\n\nfor step in range(1, 9):\n    # E-step: responsibility of each component for each point\n    dens = pi * normal_pdf(x[:, None], mu, var)           # shape (n, K)\n    resp = dens / dens.sum(axis=1, keepdims=True)\n\n    # M-step: re-estimate parameters using the responsibilities\n    Nk = resp.sum(axis=0)\n    pi = Nk / len(x)\n    mu = (resp * x[:, None]).sum(axis=0) / Nk\n    var = (resp * (x[:, None] - mu) ** 2).sum(axis=0) / Nk\n\n    loglik = np.log(dens.sum(axis=1)).sum()               # log-likelihood before this update\n    print(f\"iter {step}: loglik={loglik:.3f}, mu={np.round(mu, 2)}, pi={np.round(pi, 2)}\")\n\nprint(\"responsibility of component 2 for the point 3.5:\",\n      np.round((pi[1] * normal_pdf(3.5, mu[1], var[1])) /\n               (pi * normal_pdf(3.5, mu, var)).sum(), 3))\n\n# Output:\n#   iter 1: loglik=-22.485, mu=[2.16 4.35], pi=[0.35 0.65]\n#   iter 2: loglik=-15.617, mu=[2.07 4.43], pi=[0.36 0.64]\n#   iter 3: loglik=-15.414, mu=[1.98 4.53], pi=[0.37 0.63]\n#   iter 4: loglik=-15.232, mu=[1.91 4.62], pi=[0.38 0.62]\n#   iter 5: loglik=-15.114, mu=[1.88 4.7 ], pi=[0.39 0.61]\n#   iter 6: loglik=-15.057, mu=[1.87 4.76], pi=[0.41 0.59]\n#   iter 7: loglik=-15.026, mu=[1.88 4.82], pi=[0.42 0.58]\n#   iter 8: loglik=-15.002, mu=[1.9  4.86], pi=[0.43 0.57]\n#   responsibility of component 2 for the point 3.5: 0.864"
    },
    {
      "type": "p",
      "text": "What to notice: the log-likelihood rises at every iteration (-22.5, -15.6, -15.4, ... -15.0), which is the guarantee EM gives: it never decreases the likelihood. The means move apart towards the two clumps and the mixing weights adjust towards the group sizes. The final line shows a soft assignment: a point at 3.5 sits between the components and receives a responsibility of about 0.86 for the second one, not a hard 0 or 1."
    },
    {
      "type": "p",
      "text": "In practice you rarely write EM yourself. scikit-learn's GaussianMixture runs the same loop, and its bic() method supports the model-selection step mentioned earlier: fit several values of K and prefer the lowest BIC."
    },
    {
      "type": "code-block",
      "label": "GaussianMixture with BIC Model Selection and Soft Assignment",
      "code": "import numpy as np\nfrom sklearn.mixture import GaussianMixture\nfrom sklearn.datasets import make_blobs\n\nX, _ = make_blobs(n_samples=600, centers=[[0, 0], [5, 5], [0, 6]],\n                  cluster_std=[1.0, 1.4, 1.0], random_state=3)\n\n# Model selection: lower BIC is better\nfor K in range(1, 6):\n    gmm = GaussianMixture(n_components=K, covariance_type=\"full\", random_state=3).fit(X)\n    print(f\"K={K}: BIC={gmm.bic(X):.1f}, AIC={gmm.aic(X):.1f}\")\n\nbest = GaussianMixture(n_components=3, covariance_type=\"full\", random_state=3).fit(X)\nprint(\"mixing weights:\", np.round(np.sort(best.weights_), 2))\nprint(\"EM converged:\", best.converged_)\n\n# Soft assignment: probabilities, not just a label\nprobs = best.predict_proba([[2.0, 4.0]])\nprint(\"soft membership of the point (2.0, 4.0):\", np.round(probs[0], 2))\n\n# Output:\n#   K=1: BIC=5836.9, AIC=5814.9\n#   K=2: BIC=5260.3, AIC=5211.9\n#   K=3: BIC=5091.5, AIC=5016.8\n#   K=4: BIC=5127.5, AIC=5026.4\n#   K=5: BIC=5166.0, AIC=5038.5\n#   mixing weights: [0.33 0.33 0.33]\n#   EM converged: True\n#   soft membership of the point (2.0, 4.0): [0.79 0.01 0.21]"
    },
    {
      "type": "p",
      "text": "What to notice: BIC is lowest at K = 3, which matches how the data was generated, and then rises again as extra components add parameters without improving the fit enough. predict_proba() returns a probability for each component for a new point, so a point between clusters is shared (roughly 0.79 and 0.21 here), whereas K-means would return a single label. The order of the components is arbitrary, just like cluster IDs."
    },
    {
      "type": "h2",
      "text": "Maximum Likelihood Estimation (MLE)"
    },
    {
      "type": "p",
      "text": "Suppose observations x₁,…,xₙ are modelled by a probability distribution with parameter θ. The likelihood is L(θ) = P(D | θ) = product of the individual observation probabilities or densities, under the model's independence assumptions. The log-likelihood is ℓ(θ) = log L(θ), which converts products into sums and is easier to optimize. MLE chooses the parameter that maximizes this likelihood."
    },
    {
      "type": "p",
      "text": "For a Bernoulli coin with h heads and t tails, the likelihood is proportional to pʰ(1 − p)ᵗ. Taking the derivative of the log-likelihood and setting it to zero gives p̂MLE = h / (h + t), the observed fraction of heads. This estimate is intuitive, but with a very small sample it can be extreme; three heads in three tosses gives an MLE of 1."
    },
    {
      "type": "h2",
      "text": "Maximum A Posteriori Estimation (MAP)"
    },
    {
      "type": "p",
      "text": "MAP combines the likelihood with a prior distribution over parameters. Bayes' theorem gives P(θ | D) ∝ P(D | θ) P(θ), so maximizing the posterior is equivalent to maximizing log-likelihood plus log-prior: θ̂MAP = argmax_θ [log P(D | θ) + log P(θ)]. The prior can stabilize estimates when data is limited, but the result depends on the chosen prior."
    },
    {
      "type": "p",
      "text": "For a Bernoulli parameter p with a Beta(α, β) prior and h heads and t tails, the posterior is Beta(α + h, β + t). When both posterior shape parameters are greater than 1, the posterior mode (MAP estimate) is (α + h − 1) / (α + β + h + t − 2). If either shape parameter is at most 1, the mode may occur at a boundary, so the formula should not be applied blindly."
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
      "type": "p",
      "text": "Code walkthrough: the coin example from the text, computed three ways. The closed forms p̂MLE = h / (h + t) and p̂MAP = (α + h − 1) / (α + β + h + t − 2) are checked against a brute-force search over a grid of candidate values of p, and then the data is scaled up to show how the prior's influence fades."
    },
    {
      "type": "code-block",
      "label": "MLE versus MAP for a Coin, and the Gaussian MLE",
      "code": "import numpy as np\nfrom scipy import stats\n\nh, t = 6, 2                      # 6 heads and 2 tails\nn = h + t\n\n# MLE for a Bernoulli parameter: maximise p^h (1-p)^t\np_mle = h / n\n\n# MAP with a Beta(a, b) prior: posterior is Beta(a + h, b + t)\na, b = 2, 2                      # mild belief that the coin is roughly fair\np_map = (a + h - 1) / (a + b + n - 2)\n\n# Verify numerically on a grid of candidate p values\ngrid = np.linspace(0.001, 0.999, 999)\nloglik = h * np.log(grid) + t * np.log(1 - grid)\nlogpost = loglik + stats.beta.logpdf(grid, a, b)\nprint(f\"MLE closed form={p_mle:.3f}, grid={grid[loglik.argmax()]:.3f}\")\nprint(f\"MAP closed form={p_map:.3f}, grid={grid[logpost.argmax()]:.3f}\")\n\n# More data => the prior matters less\nfor scale in [1, 5, 50]:\n    hh, tt = h * scale, t * scale\n    print(f\"data x{scale:>2}: MLE={hh/(hh+tt):.3f}  MAP={(a+hh-1)/(a+b+hh+tt-2):.3f}\")\n\n# Gaussian MLE: sample mean and the divide-by-n variance\nx = np.array([4.1, 5.0, 5.4, 4.8, 5.2])\nprint(f\"Gaussian MLE: mu={x.mean():.3f}, variance={x.var():.4f}  (ddof=0)\")\n\n# Output:\n#   MLE closed form=0.750, grid=0.750\n#   MAP closed form=0.700, grid=0.700\n#   data x 1: MLE=0.750  MAP=0.700\n#   data x 5: MLE=0.750  MAP=0.738\n#   data x50: MLE=0.750  MAP=0.749\n#   Gaussian MLE: mu=4.900, variance=0.2000  (ddof=0)"
    },
    {
      "type": "p",
      "text": "What to notice: the closed forms and the grid search agree (0.750 and 0.700), so the formulas are right. With a mild Beta(2, 2) prior, MAP is pulled from 0.75 towards 0.5, giving 0.70. As the same proportion of heads is observed over 5 times and 50 times more tosses, MAP climbs to 0.738 and then 0.749, converging to the MLE: with enough data the likelihood dominates the prior. The last line also reminds you that the Gaussian MLE of the variance divides by n (ddof = 0), not n − 1."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam tip: when asked to compare MLE and MAP in code or on paper, show the small-data case (prior matters, MAP ≠ MLE) and the large-data case (MAP ≈ MLE). That single contrast earns the marks for 'effect of the prior'."
    },
    {
      "type": "h2",
      "text": "Applications of Clustering"
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
      "text": "A5: MLE maximizes the likelihood using data only; MAP maximizes likelihood times a prior, so it incorporates prior belief. Here p̂MLE = 6/8 = 0.75. p̂MAP = (6 + 2 − 1) / (8 + 2 + 2 − 2) = 7/10 = 0.70, slightly pulled toward the prior mean of 0.5."
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
