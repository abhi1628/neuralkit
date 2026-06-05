const post = {
  "slug": "ml-foundations",
  "title": "ML Foundations: The Zero-Restart Series",
  "date": "June 5, 2026",
  "readTime": "8-10 hours total",
  "category": "Machine Learning",
  "categoryColor": "#10b981",
  "excerpt": "The complete prerequisite guide for machine learning. Master every fundamental theory — linear algebra, calculus, probability, and the ML pipeline — in one structured path so you never have to restart from scratch again.",
  "coverEmoji": "🧠",
  "tags": [
    "Machine Learning",
    "Data Science",
    "Mathematics",
    "Python",
    "AI",
    "Tutorial Series"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Every self-taught ML learner hits the same wall. You start a course, get halfway through, realize you missed a prerequisite, go back to learn it, forget the original material, and start over. This is the 'restart loop' — and it destroys motivation. This series is designed to break that loop forever. Every concept is taught with its ML application visible from day one. Every part builds on the previous with no gaps. Every quiz validates mastery before you advance. By the end, you will have the complete foundation that most courses assume you already know."
    },
    {
  "type": "h2",
  "text": "AI, ML, and Deep Learning: What's the Difference?"
},
{
  "type": "p",
  "text": "These three terms are used interchangeably in marketing, but they mean very different things technically. Understanding the hierarchy saves you from confusion when reading papers, job descriptions, and product claims."
},
{
  "type": "sections-list",
  "items": [
    {
      "title": "Artificial Intelligence (AI)",
      "desc": "The broadest term. Any system that mimics human intelligence — from chess engines to chatbots to self-driving cars. Includes rule-based systems, search algorithms, logic, and machine learning. AI is the goal."
    },
    {
      "title": "Machine Learning (ML)",
      "desc": "A subset of AI. Systems that learn patterns from data instead of being explicitly programmed. If you write 'if temperature > 30°C, predict rain' — that is AI but not ML. If you feed 10 years of weather data and the system discovers the pattern itself — that is ML. ML is the approach."
    },
    {
      "title": "Deep Learning (DL)",
      "desc": "A subset of ML. Neural networks with many hidden layers that automatically learn hierarchical representations. A simple logistic regression is ML but not DL. GPT-4, Stable Diffusion, and AlphaFold are DL. DL is the technique."
    }
  ]
},
{
  "type": "callout",
  "icon": "🧠",
  "text": "Memory trick: AI is the dream. ML is the method. DL is the tool. Every deep learning model is machine learning. Every machine learning model is artificial intelligence. But not every AI system uses ML, and not every ML model uses deep learning."
},
{
  "type": "image",
  "src": "/images/roadmaps/ml-lifecycle.png",
  "alt": "ML Lifecycle diagram showing 9 stages from problem definition to feedback loop",
  "caption": "The complete ML lifecycle — this series covers the core technical stages in depth"
},
    {
      "type": "h2",
      "text": "Who This Series Is For"
    },
    {
      "type": "checklist",
      "items": [
        "You have tried learning ML before but got stuck on 'the math part' and gave up.",
        "You can write Python but do not understand why neural networks use matrix multiplication.",
        "You have watched Andrew Ng's course but want a hands-on, code-first reference you can revisit.",
        "You are preparing for ML interviews and need to explain backpropagation from first principles.",
        "You are a working developer transitioning to AI/ML and need a structured path, not scattered tutorials."
      ]
    },
    {
      "type": "h2",
      "text": "What Makes This Series Different"
    },
    {
      "type": "do-dont",
      "items": [
        {
          "do": "Every concept is connected to a real ML algorithm immediately. No 'you will use this later' — you use it NOW.",
          "dont": "Teach abstract math for 10 chapters before mentioning machine learning."
        },
        {
          "do": "Provide complete, runnable Python code for every concept. Copy, paste, break, fix.",
          "dont": "Show only formulas and expect you to implement them alone."
        },
        {
          "do": "Include mastery quizzes at the end of every part. Validate understanding before advancing.",
          "dont": "Assume you understood because you read the text."
        },
        {
          "do": "Build a dependency graph: Part 1 → Part 2 → Part 3 → Part 4. No jumping around required.",
          "dont": "Present topics as isolated chapters that can be read in any order."
        }
      ]
    },
    {
  "type": "h2",
  "text": "Core Concepts Every ML Engineer Must Know"
},
{
  "type": "p",
  "text": "Before diving into the math, here are the fundamental ideas that frame everything you will learn. These are not buzzwords — they are the mental models that separate engineers who 'use libraries' from engineers who 'understand systems.'"
},
{
  "type": "sections-list",
  "items": [
    {
      "title": "Supervised vs Unsupervised vs Reinforcement Learning",
      "desc": "Supervised: You have labeled data (input → known output). Regression and classification. Unsupervised: No labels. Find hidden structure. Clustering and dimensionality reduction. Reinforcement: An agent learns by trial and error, receiving rewards or penalties. Games, robotics, trading."
    },
    {
      "title": "The Bias-Variance Tradeoff",
      "desc": "Bias = error from overly simple assumptions (underfitting). Variance = error from sensitivity to training data noise (overfitting). You cannot minimize both simultaneously. The art of ML is finding the sweet spot."
    },
    {
      "title": "Overfitting vs Underfitting",
      "desc": "Overfitting: The model memorizes training data including noise. Performs terribly on new data. Underfitting: The model is too simple to capture the pattern. Performs poorly everywhere. Visual test: plot training vs validation loss over epochs."
    },
    {
      "title": "Bagging vs Boosting",
      "desc": "Bagging (Bootstrap Aggregating): Train multiple models in parallel on random data subsets, average their predictions. Random Forest uses this. Reduces variance. Boosting: Train models sequentially, each focusing on errors the previous one made. XGBoost, LightGBM use this. Reduces bias."
    },
    {
      "title": "Parametric vs Non-Parametric Models",
      "desc": "Parametric: Fixed number of parameters regardless of data size. Linear regression, logistic regression, neural networks. Non-parametric: Complexity grows with data. Decision trees, k-NN, SVM with RBF kernel. Parametric models generalize better with less data. Non-parametric models adapt to complex patterns."
    }
  ]
},
    {
      "type": "h2",
      "text": "The Four-Part Roadmap"
    },
    {
      "type": "p",
      "text": "This series is structured as a progressive journey. Each part is designed to be completed in one focused session (2-3 hours). Do not rush. The goal is mastery, not speed."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Linear Algebra for Machine Learning",
          "text": "Vectors, matrices, dot products, eigenvalues, and SVD. The language that all ML algorithms speak. This is the foundation. Without it, everything else is memorization. (25 min read + 2 hours practice)"
        },
        {
          "num": "2",
          "title": "Calculus & Optimization",
          "text": "Derivatives, partial derivatives, the chain rule, and gradient descent. How models learn from data. The math behind backpropagation and every optimization algorithm. (30 min read + 2.5 hours practice)"
        },
        {
          "num": "3",
          "title": "Probability & Information Theory",
          "text": "Bayes' theorem, distributions, MLE, entropy, and cross-entropy. The statistical toolkit for classification, uncertainty quantification, and loss functions. (28 min read + 2 hours practice)"
        },
        {
          "num": "4",
          "title": "The ML Pipeline",
          "text": "Data preprocessing, algorithm selection, training, evaluation, and deployment. Tying everything together into a complete workflow from raw data to production model. (22 min read + 1.5 hours practice)"
        }
      ]
    },
    {
      "type": "h2",
      "text": "Prerequisites Before You Start"
    },
    {
      "type": "p",
      "text": "This series assumes you can write basic Python and remember high school math. If you have never written a for-loop or seen a function graph, complete a Python basics course first. Everything else — NumPy, matrix notation, derivatives — we teach from scratch."
    },
    {
      "type": "checklist",
      "items": [
        "Python basics: variables, lists, loops, functions, imports. (If not: complete Python for Everybody on Coursera — free, 4 weeks.)",
        "High school math: basic algebra, functions (y = mx + b), exponents, logarithms.",
        "A working Python environment: we use NumPy and Matplotlib. Install with: pip install numpy matplotlib",
        "Time commitment: 2-3 hours per part, one part per week. Rushing destroys retention."
      ]
    },
    {
  "type": "h2",
  "text": "ML Trivia: Facts That Surprise Even Experienced Engineers"
},
{
  "type": "sections-list",
  "items": [
    {
      "title": "Why Is It Called 'Machine' Learning?",
      "desc": "Because the machine finds the rules. In traditional programming, humans write rules and machines follow them. In ML, humans provide data and outcomes — the machine discovers the rules itself. The 'learning' is just optimization: adjusting parameters to minimize error."
    },
    {
      "title": "The Term 'AI' Is 70 Years Old",
      "desc": "John McCarthy coined 'Artificial Intelligence' in 1956 at the Dartmouth Conference. ML became practical in the 1990s with SVMs and random forests. Deep Learning exploded in 2012 when AlexNet won ImageNet by a massive margin. Transformers changed everything in 2017."
    },
    {
      "title": "The No Free Lunch Theorem",
      "desc": "No single algorithm works best for every problem. A model that excels on image classification may fail on time series. A model perfect for tabular data may be useless for NLP. This is why understanding multiple algorithms — and when to use them — is essential."
    },
    {
      "title": "More Data Beats Better Algorithms",
      "desc": "Banko and Brill (2001) showed that a simple algorithm with massive data outperforms a sophisticated algorithm with limited data. This is why tech giants dominate AI — they have the data. But better features can beat more data. Feature engineering is the great equalizer."
    },
    {
      "title": "Neural Networks Were Invented in 1943",
      "desc": "McCulloch and Pitts created the first mathematical model of a neuron in 1943. The Perceptron arrived in 1958. Backpropagation was formalized in 1986. Yet deep learning only became practical after 2012 — thanks to GPUs, big data, and ReLU activations. The math was ready for 70 years. The hardware was not."
    }
  ]
},
{
  "type": "image",
  "src": "/images/roadmaps/ml-pipeline.png",
  "alt": "End-to-End ML Pipeline showing 7 stages from problem definition to monitoring",
  "caption": "The end-to-end ML pipeline — Part 4 of this series implements every stage from data collection to deployment"
},
          {
      "type": "h2",
      "text": "How to Use This Series"
    },
    {
      "type": "p",
      "text": "This is not a book to read passively. It is a workshop to work through actively. Follow this protocol for maximum retention."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Read the section",
          "text": "Read one section (between h2 headings) at a time. Do not skim. The code examples are the core content, not supplements."
        },
        {
          "num": "2",
          "title": "Run the code",
          "text": "Copy every code block into a Jupyter notebook or Python script. Run it. Modify numbers. Break it. See what happens."
        },
        {
          "num": "3",
          "title": "Answer the quiz",
          "text": "At the end of each part, answer all 5 quiz questions. Write your answers in a notebook before checking the solutions."
        },
        {
          "num": "4",
          "title": "Score yourself",
          "text": "4/5 correct = proceed to next part. 3/5 or below = re-read the weak sections, re-run the code, try again."
        },
        {
          "num": "5",
          "title": "Build something",
          "text": "After each part, build a mini-project using only concepts from that part. Examples are provided in the 'Build It' section."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Series Progress Tracker"
    },
    {
      "type": "p",
      "text": "Track your progress through the series. Check off each part as you complete it. The quiz scores are self-reported — be honest with yourself."
    },
    {
      "type": "checklist",
      "items": [
        "☐ Part 1: Linear Algebra — Read complete, code run, quiz attempted",
        "☐ Part 1: Quiz score ___/5 (need 4/5 to advance)",
        "☐ Part 2: Calculus & Optimization — Read complete, code run, quiz attempted",
        "☐ Part 2: Quiz score ___/5 (need 4/5 to advance)",
        "☐ Part 3: Probability & Information Theory — Read complete, code run, quiz attempted",
        "☐ Part 3: Quiz score ___/5 (need 4/5 to advance)",
        "☐ Part 4: The ML Pipeline — Read complete, code run, quiz attempted",
        "☐ Part 4: Quiz score ___/5 (need 4/5 to complete series)",
        "☐ Final Project: Build an end-to-end classifier using all four parts",
        "☐ Certificate of completion: Share on LinkedIn (template provided in Part 4)"
      ]
    },
    {
      "type": "h2",
      "text": "What You Will Build"
    },
    {
      "type": "p",
      "text": "Theory without application is useless. Each part includes a mini-project that uses only concepts from that part. By Part 4, you combine everything into a complete ML pipeline."
    },
    {
      "type": "sections-list",
      "items": [
        {
          "title": "Part 1 Project: Image Compressor with SVD",
          "desc": "Build a Python script that compresses images using SVD. Upload any photo, select compression level, see the reconstructed image. Understands matrices, SVD, and dimensionality reduction hands-on."
        },
        {
          "title": "Part 2 Project: Gradient Descent Visualizer",
          "desc": "Implement gradient descent from scratch for a 2D function. Visualize the optimization path with Matplotlib. Understands derivatives, learning rates, and convergence."
        },
        {
          "title": "Part 3 Project: Spam Classifier with Naive Bayes",
          "desc": "Build a spam detector using Bayes' theorem and word frequencies. No scikit-learn — pure Python and NumPy. Understands probability, MLE, and classification."
        },
        {
          "title": "Part 4 Project: End-to-End House Price Predictor",
          "desc": "Complete pipeline: data loading, preprocessing, feature engineering, model selection (linear regression vs random forest), evaluation, and prediction API. Uses all four parts."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Start Part 1 Now"
    },
    {
      "type": "p",
      "text": "You have the roadmap. You have the prerequisites. You have the time commitment. The only thing left is to start. Click below to begin Part 1: Linear Algebra for Machine Learning."
    },
    {
      "type": "cta",
      "text": "Start Part 1: Linear Algebra →",
      "href": "/tutorials/ml-foundations/part-1-linear-algebra",
      "note": "25 min read · 2 hours practice · Quiz included"
    },
    {
      "type": "h2",
      "text": "Frequently Asked Questions"
    },
    {
      "type": "sections-list",
      "items": [
        {
          "title": "Do I need a GPU?",
          "desc": "No. Every code example runs on a standard laptop CPU. NumPy is optimized and fast enough for learning."
        },
        {
          "title": "Can I skip Part 1 if I know linear algebra?",
          "desc": "Take the Part 1 quiz first. If you score 5/5, you can skip to Part 2. But we recommend at least skimming — our ML connections may be new to you."
        },
        {
          "title": "How long does the full series take?",
          "desc": "8-10 hours of focused work, spread across 4 weeks (one part per week). Do not rush."
        },
        {
          "title": "Is this free?",
          "desc": "Yes. The entire series is free. No signup required. If you find it valuable, share it with others."
        },
        {
          "title": "What comes after this series?",
          "desc": "Deep Learning Fundamentals (neural networks, backprop, CNNs, RNNs, Transformers) and MLOps (deployment, monitoring, CI/CD for ML). Both series are in development."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: ML is not magic. It is linear algebra, calculus, probability, and code — applied systematically. This series gives you the foundation that separates people who 'use ML libraries' from people who 'understand ML.' Start Part 1 now."
    }
  ]
};

export default post;
