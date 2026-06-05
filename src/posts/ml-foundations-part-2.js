const post = {
  "slug": "part-2-calculus-optimization",
  "seriesSlug": "ml-foundations",
  "partNumber": 2,
  "totalParts": 4,
  "title": "Calculus & Optimization: How Gradient Descent Actually Works (Part 2)",
  "seriesTitle": "ML Foundations: The Zero-Restart Series",
  "date": "June 12, 2026",
  "readTime": "30 min read",
  "category": "Machine Learning",
  "categoryColor": "#10b981",
  "excerpt": "Derivatives, partial derivatives, the chain rule, and gradient descent — from first principles to training your first neural network. No black boxes. Every line of math connected to code.",
  "coverEmoji": "📉",
  "tags": [
    "Calculus",
    "Optimization",
    "Gradient Descent",
    "Backpropagation",
    "Neural Networks",
    "Python"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Every machine learning model is an optimization problem. Neural networks, linear regression, logistic regression, SVMs — all of them find their parameters by minimizing a loss function. The tool that does this minimization is gradient descent. And gradient descent is nothing but calculus applied repeatedly. If you understand derivatives, partial derivatives, and the chain rule, you understand how every model learns. This guide builds Part 1's linear algebra foundation and shows you exactly how calculus powers machine learning — with runnable Python code for every concept."
    },
    {
      "type": "h2",
      "text": "Why Calculus Is the Engine of Learning"
    },
    {
      "type": "p",
      "text": "A machine learning model starts with random parameters and terrible predictions. It needs to improve. But how does it know which direction to move? Calculus answers this. The derivative tells you the slope — the direction of steepest increase. The negative derivative tells you the direction of steepest decrease. Follow that direction, take a step, repeat. That is gradient descent. Every weight update in every neural network you have ever trained is this process."
    },
    {
      "type": "checklist",
      "items": [
        "Linear regression finds the line that minimizes mean squared error. The derivative of MSE with respect to each weight tells you how to adjust it.",
        "Neural networks have millions of weights. Partial derivatives tell you how to adjust each one independently. The chain rule tells you how to compute them efficiently.",
        "Backpropagation is the chain rule applied to a computational graph. It is not magic. It is calculus.",
        "The learning rate controls step size. Too large = divergence. Too small = slow convergence. This is a direct consequence of Taylor series approximation.",
        "Adam, RMSprop, and all adaptive optimizers are modifications of gradient descent using moving averages of gradients. The core is still calculus."
      ]
    },
    {
      "type": "h2",
      "text": "The Derivative: Direction and Rate of Change"
    },
    {
      "type": "p",
      "text": "The derivative of a function at a point measures two things: how steep the function is at that point, and which direction it is increasing. In ML, we use derivatives to find the minimum of loss functions. If the derivative is positive, the function is increasing — move left to decrease it. If negative, move right. The magnitude tells you how fast it is changing."
    },
    {
      "type": "code-block",
      "label": "Derivatives from Scratch",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# A simple quadratic: f(x) = x²\n# The derivative is f'(x) = 2x\n# At x = 3, the slope is 6. The function is increasing rapidly.\n# At x = -2, the slope is -4. The function is decreasing.\n# At x = 0, the slope is 0. This is the minimum.\n\ndef f(x):\n    return x ** 2\n\ndef df(x):\n    return 2 * x  # analytical derivative\n\ndef df_numerical(x, h=1e-5):\n    return (f(x + h) - f(x - h)) / (2 * h)  # central difference\n\n# Verify they match\nx_test = 3.0\nprint(f'Analytical derivative at x=3: {df(x_test):.6f}')      # 6.0\nprint(f'Numerical derivative at x=3: {df_numerical(x_test):.6f}')  # ~6.0\n\n# === ML CONNECTION: Loss Landscape ===\n# In ML, x is a weight parameter. f(x) is the loss.\n# The derivative tells us: if I increase this weight slightly, does loss go up or down?\n# We want to move in the direction that decreases loss.\n\n# Visualize the function and its derivative\nx = np.linspace(-4, 4, 400)\ny = f(x)\ndy = df(x)\n\nplt.figure(figsize=(10, 4))\nplt.subplot(1, 2, 1)\nplt.plot(x, y, 'b-', linewidth=2, label='f(x) = x²')\nplt.axhline(0, color='k', linewidth=0.5)\nplt.axvline(0, color='k', linewidth=0.5)\nplt.xlabel('x')\nplt.ylabel('f(x)')\nplt.title('Function')\nplt.legend()\nplt.grid(True, alpha=0.3)\n\nplt.subplot(1, 2, 2)\nplt.plot(x, dy, 'r-', linewidth=2, label="f'(x) = 2x")\nplt.axhline(0, color='k', linewidth=0.5)\nplt.axvline(0, color='k', linewidth=0.5)\nplt.xlabel('x')\nplt.ylabel("f'(x)")\nplt.title('Derivative')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.tight_layout()\nplt.show()\n\n# Key insight: derivative = 0 at the minimum. This is why we 'set derivative to 0'\n# in linear regression's normal equation."
    },
    {
      "type": "h2",
      "text": "Partial Derivatives: When There Are Multiple Knobs to Turn"
    },
    {
      "type": "p",
      "text": "A real model has thousands or millions of parameters. The loss function depends on all of them simultaneously. A partial derivative tells you how the loss changes when you tweak just ONE parameter while holding all others constant. The gradient is the vector of all partial derivatives. It points in the direction of steepest ascent. Negative gradient = steepest descent."
    },
    {
      "type": "code-block",
      "label": "Partial Derivatives and the Gradient",
      "code": "import numpy as np\n\n# A 2D function: f(x, y) = x² + 2y²\n# This is like a loss function with two weights.\n# Partial derivative with respect to x: ∂f/∂x = 2x\n# Partial derivative with respect to y: ∂f/∂y = 4y\n# Gradient vector: ∇f = [2x, 4y]\n\ndef f_2d(x, y):\n    return x**2 + 2*y**2\n\ndef gradient_2d(x, y):\n    return np.array([2*x, 4*y])  # [∂f/∂x, ∂f/∂y]\n\n# At point (3, 2):\npoint = np.array([3.0, 2.0])\ngrad = gradient_2d(point[0], point[1])\nprint(f'At point {point}:')\nprint(f'  Gradient = {grad}')\nprint(f'  Function value = {f_2d(point[0], point[1]):.2f}')\n\n# The gradient points in the direction of steepest increase.\n# To decrease the function, move in the OPPOSITE direction: -grad\nnew_point = point - 0.1 * grad  # step size = 0.1\nprint(f'\nAfter one gradient descent step (lr=0.1):')\nprint(f'  New point = {new_point}')\nprint(f'  New function value = {f_2d(new_point[0], new_point[1]):.2f}')\n\n# === ML CONNECTION: Weight Updates ===\n# In a neural network with 1 million weights:\n# - Compute partial derivative of loss with respect to EACH weight\n# - Stack them into a gradient vector of length 1,000,000\n# - Update all weights simultaneously: w_new = w_old - lr * gradient\n# This is why GPUs are essential — they parallelize this computation.\n\n# Visualize the gradient field\nimport matplotlib.pyplot as plt\nx = np.linspace(-3, 3, 20)\ny = np.linspace(-3, 3, 20)\nX, Y = np.meshgrid(x, y)\nU = 2 * X  # ∂f/∂x\nV = 4 * Y  # ∂f/∂y\n\nplt.figure(figsize=(8, 6))\nplt.quiver(X, Y, U, V, color='red', alpha=0.6)\nplt.contour(X, Y, X**2 + 2*Y**2, levels=10, cmap='viridis')\nplt.xlabel('x')\nplt.ylabel('y')\nplt.title('Gradient Field (arrows) and Contours of f(x,y) = x² + 2y²')\nplt.colorbar(label='Function value')\nplt.grid(True, alpha=0.3)\nplt.show()\n\n# The arrows point uphill. To minimize, walk downhill (opposite to arrows)."
    },
    {
      "type": "h2",
      "text": "The Chain Rule: How Backpropagation Actually Works"
    },
    {
      "type": "p",
      "text": "Neural networks are compositions of functions. Input → Linear → ReLU → Linear → Sigmoid → Loss. The chain rule tells you how to differentiate a composition: multiply the derivatives of each layer, working backward from the output. This is backpropagation. Every framework (PyTorch, TensorFlow, JAX) implements the chain rule automatically. Understanding it means you are never mystified by 'automatic differentiation.'"
    },
    {
      "type": "code-block",
      "label": "Chain Rule and Backpropagation",
      "code": "import numpy as np\n\n# A tiny neural network: 1 input → 1 hidden → 1 output\n# Forward pass: z = w1*x + b1, h = relu(z), y_pred = w2*h + b2, loss = (y_pred - y_true)²\n# We need ∂loss/∂w1, ∂loss/∂b1, ∂loss/∂w2, ∂loss/∂b2\n\ndef relu(x):\n    return np.maximum(0, x)\n\ndef relu_derivative(x):\n    return (x > 0).astype(float)\n\n# Parameters (random init)\nw1, b1 = 0.5, 0.1\nw2, b2 = -0.3, 0.2\nx = 2.0        # input\ny_true = 1.0   # target\n\n# === FORWARD PASS ===\nz = w1 * x + b1\nh = relu(z)\ny_pred = w2 * h + b2\nloss = (y_pred - y_true) ** 2\n\nprint(f'Forward pass:')\nprint(f'  z = {z:.4f}, h = {h:.4f}, y_pred = {y_pred:.4f}')\nprint(f'  Loss = {loss:.4f}')\n\n# === BACKWARD PASS (Chain Rule) ===\n# ∂loss/∂y_pred = 2*(y_pred - y_true)\ndy_pred = 2 * (y_pred - y_true)\n\n# ∂loss/∂w2 = ∂loss/∂y_pred * ∂y_pred/∂w2 = dy_pred * h\ndw2 = dy_pred * h\n\n# ∂loss/∂b2 = ∂loss/∂y_pred * ∂y_pred/∂b2 = dy_pred * 1\ndb2 = dy_pred * 1\n\n# ∂loss/∂h = ∂loss/∂y_pred * ∂y_pred/∂h = dy_pred * w2\ndh = dy_pred * w2\n\n# ∂loss/∂z = ∂loss/∂h * ∂h/∂z = dh * relu'(z)\ndz = dh * relu_derivative(z)\n\n# ∂loss/∂w1 = ∂loss/∂z * ∂z/∂w1 = dz * x\ndw1 = dz * x\n\n# ∂loss/∂b1 = ∂loss/∂z * ∂z/∂b1 = dz * 1\ndb1 = dz * 1\n\nprint(f'\nGradients (backward pass):')\nprint(f'  ∂loss/∂w1 = {dw1:.4f}')\nprint(f'  ∂loss/∂b1 = {db1:.4f}')\nprint(f'  ∂loss/∂w2 = {dw2:.4f}')\nprint(f'  ∂loss/∂b2 = {db2:.4f}')\n\n# === VERIFY WITH NUMERICAL GRADIENTS ===\neps = 1e-5\n\ndef compute_loss(w1, b1, w2, b2):\n    z = w1 * x + b1\n    h = relu(z)\n    y_pred = w2 * h + b2\n    return (y_pred - y_true) ** 2\n\ndw1_num = (compute_loss(w1+eps, b1, w2, b2) - compute_loss(w1-eps, b1, w2, b2)) / (2*eps)\ndb1_num = (compute_loss(w1, b1+eps, w2, b2) - compute_loss(w1, b1-eps, w2, b2)) / (2*eps)\ndw2_num = (compute_loss(w1, b1, w2+eps, b2) - compute_loss(w1, b1, w2-eps, b2)) / (2*eps)\ndb2_num = (compute_loss(w1, b1, w2, b2+eps) - compute_loss(w1, b1, w2, b2-eps)) / (2*eps)\n\nprint(f'\nNumerical verification:')\nprint(f'  ∂loss/∂w1: analytical={dw1:.6f}, numerical={dw1_num:.6f}')\nprint(f'  ∂loss/∂b1: analytical={db1:.6f}, numerical={db1_num:.6f}')\nprint(f'  ∂loss/∂w2: analytical={dw2:.6f}, numerical={dw2_num:.6f}')\nprint(f'  ∂loss/∂b2: analytical={db2:.6f}, numerical={db2_num:.6f}')\n\n# === ML CONNECTION: Automatic Differentiation ===\n# PyTorch's .backward() does EXACTLY what we did above.\n# It builds a computation graph, then traverses it backward,\n# applying the chain rule at each node. The 'autograd' engine\n# is just an efficient implementation of this manual process.\n\n# Key insight: the chain rule is MULTIPLICATION of derivatives.\n# If you have 100 layers, you multiply 100 Jacobian matrices.\n# This is why vanishing gradients happen — small numbers multiplied\n# many times become extremely small."
    },
    {
      "type": "h2",
      "text": "Gradient Descent: The Algorithm That Trains Everything"
    },
    {
      "type": "p",
      "text": "Gradient descent is the simplest optimization algorithm and the foundation of all others. Start at a random point. Compute the gradient. Take a step in the opposite direction. Repeat until convergence. The step size is the learning rate. Too large and you overshoot the minimum. Too small and you take forever. The art of training neural networks is largely the art of choosing and scheduling this learning rate."
    },
    {
      "type": "code-block",
      "label": "Gradient Descent from Scratch",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# Generate synthetic data: y = 2x + 1 + noise\nnp.random.seed(42)\nX = np.random.randn(100, 1)\ny = 2 * X + 1 + 0.5 * np.random.randn(100, 1)\n\n# Initialize parameters\nw = np.random.randn(1)\nb = np.random.randn(1)\nlr = 0.1\nepochs = 50\n\nlosses = []\n\nfor epoch in range(epochs):\n    # Forward pass\n    y_pred = w * X + b\n    \n    # Compute loss (Mean Squared Error)\n    loss = np.mean((y_pred - y) ** 2)\n    losses.append(loss)\n    \n    # Backward pass (compute gradients)\n    # ∂loss/∂w = (2/n) * Σ(y_pred - y) * X\n    # ∂loss/∂b = (2/n) * Σ(y_pred - y)\n    n = len(X)\n    dw = (2/n) * np.sum((y_pred - y) * X)\n    db = (2/n) * np.sum(y_pred - y)\n    \n    # Update parameters\n    w -= lr * dw\n    b -= lr * db\n    \n    if epoch % 10 == 0:\n        print(f'Epoch {epoch:2d}: loss={loss:.4f}, w={w[0]:.4f}, b={b[0]:.4f}')\n\nprint(f'\nFinal: w={w[0]:.4f}, b={b[0]:.4f}')\nprint(f'True values: w=2.0, b=1.0')\n\n# Plot loss curve\nplt.figure(figsize=(12, 4))\nplt.subplot(1, 2, 1)\nplt.plot(losses, 'b-', linewidth=2)\nplt.xlabel('Epoch')\nplt.ylabel('Loss (MSE)')\nplt.title('Loss Curve')\nplt.grid(True, alpha=0.3)\n\n# Plot data and fitted line\nplt.subplot(1, 2, 2)\nplt.scatter(X, y, alpha=0.5, label='Data')\nx_line = np.linspace(X.min(), X.max(), 100)\nplt.plot(x_line, w[0]*x_line + b[0], 'r-', linewidth=2, label=f'Fit: y={w[0]:.2f}x+{b[0]:.2f}')\nplt.plot(x_line, 2*x_line + 1, 'g--', linewidth=2, alpha=0.7, label='True: y=2x+1')\nplt.xlabel('x')\nplt.ylabel('y')\nplt.title('Linear Regression Fit')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.tight_layout()\nplt.show()\n\n# === ML CONNECTION: Batch vs Stochastic vs Mini-Batch ===\n# We used ALL 100 data points to compute gradients. This is BATCH gradient descent.\n# Stable but slow for large datasets.\n#\n# STOCHASTIC gradient descent: use ONE random point per step.\n# Noisy but fast per step. The noise can help escape local minima.\n#\n# MINI-BATCH gradient descent: use 32-512 random points per step.\n# The compromise everyone uses. GPU-friendly. Smooth but not too slow.\n#\n# Modern frameworks default to mini-batch. The batch size is a hyperparameter."
    },
    {
      "type": "h2",
      "text": "Stochastic Gradient Descent and Mini-Batches"
    },
    {
      "type": "p",
      "text": "In practice, we rarely use the full dataset for each gradient step. Modern datasets have millions of examples. Computing the gradient over all of them is prohibitively expensive. Instead, we sample a small batch — typically 32, 64, or 128 examples — and compute the gradient on that subset. This is mini-batch gradient descent. It is faster, memory-efficient, and the noise in small batches actually helps escape sharp local minima."
    },
    {
      "type": "code-block",
      "label": "Mini-Batch Gradient Descent",
      "code": "import numpy as np\n\n# Larger dataset\nnp.random.seed(42)\nn_samples = 10000\nX = np.random.randn(n_samples, 1)\ny = 3 * X - 2 + 0.5 * np.random.randn(n_samples, 1)\n\nw = np.random.randn(1)\nb = np.random.randn(1)\nlr = 0.01\nepochs = 20\nbatch_size = 64\n\nn_batches = n_samples // batch_size\n\nfor epoch in range(epochs):\n    # Shuffle data each epoch\n    indices = np.random.permutation(n_samples)\n    X_shuffled = X[indices]\n    y_shuffled = y[indices]\n    \n    epoch_loss = 0\n    \n    for batch_idx in range(n_batches):\n        # Get mini-batch\n        start = batch_idx * batch_size\n        end = start + batch_size\n        X_batch = X_shuffled[start:end]\n        y_batch = y_shuffled[start:end]\n        \n        # Forward\n        y_pred = w * X_batch + b\n        \n        # Loss for this batch\n        loss = np.mean((y_pred - y_batch) ** 2)\n        epoch_loss += loss\n        \n        # Gradients (on batch, not full dataset)\n        dw = (2/batch_size) * np.sum((y_pred - y_batch) * X_batch)\n        db = (2/batch_size) * np.sum(y_pred - y_batch)\n        \n        # Update\n        w -= lr * dw\n        b -= lr * db\n    \n    if epoch % 5 == 0:\n        print(f'Epoch {epoch:2d}: avg_loss={epoch_loss/n_batches:.4f}, w={w[0]:.4f}, b={b[0]:.4f}')\n\nprint(f'\nFinal: w={w[0]:.4f}, b={b[0]:.4f}')\nprint(f'True: w=3.0, b=-2.0')\n\n# === ML CONNECTION: Why Mini-Batch Works ===\n# 1. Speed: 10,000 samples / 64 per batch = 156 steps per epoch\n#    vs 1 step for full batch. More updates = faster convergence.\n# 2. Memory: GPU memory is limited. 64 samples fit easily.\n# 3. Noise: Each batch gives a slightly different gradient direction.\n#    This noise smooths the loss landscape and prevents getting stuck\n#    in sharp local minima. Generalizes better.\n# 4. Parallelism: GPUs process 64 samples simultaneously.\n#    The matrix multiplication X_batch @ W is highly optimized."
    },
    {
      "type": "h2",
      "text": "Learning Rate: The Most Important Hyperparameter"
    },
    {
      "type": "p",
      "text": "The learning rate controls how far you step in the gradient direction. It is the single most important hyperparameter in all of deep learning. Too large and you oscillate or diverge. Too small and you crawl. The optimal learning rate depends on the loss landscape curvature, batch size, and model architecture. Modern practice uses learning rate schedules that start large and decay over time."
    },
    {
      "type": "code-block",
      "label": "Learning Rate Effects",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# Simple 1D optimization: minimize f(x) = x²\n# True minimum at x = 0\n\ndef f(x):\n    return x ** 2\n\ndef df(x):\n    return 2 * x\n\nx0 = 5.0  # starting point\nlearning_rates = [0.01, 0.1, 0.5, 1.01]\ncolors = ['blue', 'green', 'orange', 'red']\n\nplt.figure(figsize=(12, 8))\n\nfor idx, lr in enumerate(learning_rates):\n    x = x0\n    trajectory = [x]\n    \n    for step in range(20):\n        x = x - lr * df(x)\n        trajectory.append(x)\n    \n    plt.subplot(2, 2, idx + 1)\n    t = np.arange(len(trajectory))\n    plt.plot(t, trajectory, 'o-', color=colors[idx], linewidth=2, markersize=6)\n    plt.axhline(0, color='black', linestyle='--', alpha=0.5, label='Minimum (x=0)')\n    plt.xlabel('Step')\n    plt.ylabel('x value')\n    plt.title(f'Learning Rate = {lr}')\n    plt.legend()\n    plt.grid(True, alpha=0.3)\n    \n    final_x = trajectory[-1]\n    status = 'CONVERGED' if abs(final_x) < 0.01 else 'DIVERGED' if abs(final_x) > 100 else 'OSCILLATING'\n    plt.text(0.5, 0.95, f'Final x: {final_x:.4f}\n{status}', \n             transform=plt.gca().transAxes, verticalalignment='top',\n             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))\n\nplt.tight_layout()\nplt.show()\n\n# === KEY OBSERVATIONS ===\n# lr = 0.01: Slow but steady convergence. Safe but takes many steps.\n# lr = 0.1: Fast convergence. Optimal for this simple problem.\n# lr = 0.5: Oscillates around minimum. Steps are too large.\n# lr = 1.01: DIVERGES! Each step overshoots and goes further away.\n#\n# Rule of thumb: lr between 1e-4 and 1e-2 for most neural networks.\n# Use learning rate scheduling: start at 1e-3, decay by 0.1 every 10 epochs.\n# Or use Adam optimizer which adapts lr per parameter automatically."
    },
    {
      "type": "h2",
      "text": "Advanced Optimizers: Momentum, Adam, and Beyond"
    },
    {
      "type": "p",
      "text": "Plain gradient descent is slow in ravines — directions where the loss curves sharply in one direction and gently in another. Momentum fixes this by adding velocity: it accumulates past gradients and moves faster in consistent directions. Adam combines momentum with per-parameter adaptive learning rates. It is the default optimizer for most deep learning because it works well out of the box with minimal tuning."
    },
    {
      "type": "code-block",
      "label": "Momentum and Adam from Scratch",
      "code": "import numpy as np\n\n# Compare SGD, SGD with Momentum, and Adam on a 2D ravine function\n# f(x, y) = 0.1*x² + 2*y² (steeper in y, gentle in x)\n\ndef loss(w):\n    return 0.1 * w[0]**2 + 2 * w[1]**2\n\ndef gradient(w):\n    return np.array([0.2 * w[0], 4 * w[1]])\n\n# Starting point: deep in the ravine\nw0 = np.array([2.0, 2.0])\nepochs = 100\nlr = 0.1\n\n# === 1. Plain SGD ===\nw_sgd = w0.copy()\ntraj_sgd = [w_sgd.copy()]\nfor _ in range(epochs):\n    grad = gradient(w_sgd)\n    w_sgd -= lr * grad\n    traj_sgd.append(w_sgd.copy())\n\n# === 2. SGD with Momentum ===\n# v_t = β*v_{t-1} + grad\n# w_t = w_{t-1} - lr * v_t\nw_mom = w0.copy()\nv = np.zeros(2)\nbeta = 0.9\ntraj_mom = [w_mom.copy()]\nfor _ in range(epochs):\n    grad = gradient(w_mom)\n    v = beta * v + grad\n    w_mom -= lr * v\n    traj_mom.append(w_mom.copy())\n\n# === 3. Adam ===\n# m_t = β1*m_{t-1} + (1-β1)*grad      (first moment - momentum)\n# v_t = β2*v_{t-1} + (1-β2)*grad²     (second moment - adaptive lr)\n# m_hat = m_t / (1-β1^t)              (bias correction)\n# v_hat = v_t / (1-β2^t)\n# w_t = w_{t-1} - lr * m_hat / (sqrt(v_hat) + ε)\nw_adam = w0.copy()\nm = np.zeros(2)\nv = np.zeros(2)\nbeta1, beta2 = 0.9, 0.999\neps = 1e-8\ntraj_adam = [w_adam.copy()]\n\nfor t in range(1, epochs + 1):\n    grad = gradient(w_adam)\n    m = beta1 * m + (1 - beta1) * grad\n    v = beta2 * v + (1 - beta2) * (grad ** 2)\n    m_hat = m / (1 - beta1**t)\n    v_hat = v / (1 - beta2**t)\n    w_adam -= lr * m_hat / (np.sqrt(v_hat) + eps)\n    traj_adam.append(w_adam.copy())\n\n# Compare final losses\nprint(f'Final losses after {epochs} steps:')\nprint(f'  SGD:      {loss(traj_sgd[-1]):.6f}')\nprint(f'  Momentum: {loss(traj_mom[-1]):.6f}')\nprint(f'  Adam:     {loss(traj_adam[-1]):.6f}')\n\n# Visualize trajectories\nimport matplotlib.pyplot as plt\ntraj_sgd = np.array(traj_sgd)\ntraj_mom = np.array(traj_mom)\ntraj_adam = np.array(traj_adam)\n\nplt.figure(figsize=(10, 8))\nplt.plot(traj_sgd[:, 0], traj_sgd[:, 1], 'b.-', alpha=0.6, label='SGD', markersize=4)\nplt.plot(traj_mom[:, 0], traj_mom[:, 1], 'g.-', alpha=0.6, label='Momentum', markersize=4)\nplt.plot(traj_adam[:, 0], traj_adam[:, 1], 'r.-', alpha=0.6, label='Adam', markersize=4)\nplt.scatter([0], [0], color='black', marker='*', s=200, label='Minimum', zorder=5)\nplt.scatter([w0[0]], [w0[1]], color='purple', marker='o', s=100, label='Start', zorder=5)\nplt.xlabel('w[0] (gentle direction)')\nplt.ylabel('w[1] (steep direction)')\nplt.title('Optimizer Trajectories in a Ravine')\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.axis('equal')\nplt.show()\n\n# === ML CONNECTION: Which Optimizer to Use ===\n# SGD + Momentum: Best for large batch training, image classification.\n#   Requires more tuning but often reaches better final accuracy.\n# Adam: Default for everything else. NLP, transformers, small datasets.\n#   Converges fast, needs little tuning. May generalize slightly worse.\n# AdamW: Adam with proper weight decay. Often better than Adam.\n#   Use this if available (PyTorch default since 2019).\n# Lion: Newer optimizer (2023). Simpler than Adam, sometimes better.\n#   Worth trying on large vision/language models."
    },
    {
      "type": "h2",
      "text": "Local Minima, Saddle Points, and the Loss Landscape"
    },
    {
      "type": "p",
      "text": "A common fear is that gradient descent gets stuck in local minima — points that are lower than their neighbors but not the global lowest. In high-dimensional spaces (millions of dimensions), this is almost never a problem. The real danger is saddle points: points where the gradient is zero in some directions but the function curves up in others and down in others. At a saddle point, gradient descent slows down dramatically because the gradient is near zero. Modern optimizers and initialization strategies are designed to escape saddle points efficiently."
    },
    {
      "type": "code-block",
      "label": "Saddle Point Visualization",
      "code": "import numpy as np\nimport matplotlib.pyplot as plt\nfrom mpl_toolkits.mplot3d import Axes3D\n\n# A classic saddle point: f(x, y) = x² - y²\n# At (0, 0): ∂f/∂x = 0, ∂f/∂y = 0. But it's a saddle, not a minimum.\n# In x-direction: curves up (minimum along x)\n# In y-direction: curves down (maximum along y)\n\ndef saddle(x, y):\n    return x**2 - y**2\n\nx = np.linspace(-2, 2, 100)\ny = np.linspace(-2, 2, 100)\nX, Y = np.meshgrid(x, y)\nZ = saddle(X, Y)\n\nfig = plt.figure(figsize=(12, 5))\n\n# 3D surface\nax1 = fig.add_subplot(121, projection='3d')\nax1.plot_surface(X, Y, Z, cmap='coolwarm', alpha=0.8)\nax1.scatter([0], [0], [0], color='black', s=100, label='Saddle Point')\nax1.set_xlabel('x')\nax1.set_ylabel('y')\nax1.set_zlabel('f(x,y)')\nax1.set_title('Saddle Point: f(x,y) = x² - y²')\nax1.legend()\n\n# Contour plot with gradient field\nax2 = fig.add_subplot(122)\ncontour = ax2.contour(X, Y, Z, levels=20, cmap='coolwarm')\nax2.clabel(contour, inline=True, fontsize=8)\n\n# Gradient field\nx_sparse = np.linspace(-2, 2, 15)\ny_sparse = np.linspace(-2, 2, 15)\nX_s, Y_s = np.meshgrid(x_sparse, y_sparse)\nU = 2 * X_s  # ∂f/∂x\nV = -2 * Y_s  # ∂f/∂y\nax2.quiver(X_s, Y_s, U, V, alpha=0.5)\nax2.scatter([0], [0], color='black', s=100, zorder=5, label='Saddle Point')\nax2.set_xlabel('x')\nax2.set_ylabel('y')\nax2.set_title('Contours and Gradient Field')\nax2.legend()\nax2.grid(True, alpha=0.3)\n\nplt.tight_layout()\nplt.show()\n\n# === ML CONNECTION: Why Saddle Points Matter ===\n# In high dimensions (1M+ weights), saddle points are EVERYWHERE.\n# Local minima are rare because ALL directions must curve up.\n# At a saddle point, gradient descent slows (gradient ≈ 0) but doesn't stop.\n# Noise from mini-batches and momentum help escape.\n#\n# Research insight: In very high dimensions, almost all critical points\n# (where gradient = 0) are saddle points, not local minima.\n# This is why deep learning works despite having millions of parameters.\n# The landscape is full of saddles, but gradient descent navigates them."
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 3. Score yourself honestly. 4/5 correct means you are ready."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: A neural network has 3 layers with 100, 50, and 10 neurons. How many partial derivatives does backpropagation compute for one training example?",
        "Q2: You run gradient descent with lr=0.5 and the loss oscillates between 0.8 and 1.2, never decreasing. What is wrong and what should you try?",
        "Q3: Explain why the chain rule is necessary for backpropagation but not for linear regression with one layer.",
        "Q4: Adam uses both first moment (momentum) and second moment (adaptive LR). Which one helps escape saddle points and which one helps in ravines?",
        "Q5: You have 1 million training examples. Your GPU can process 256 examples at a time. How many gradient steps per epoch? What happens if you increase batch size to 1024?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Backprop computes one partial derivative per weight. Layer 1: 100 inputs × 50 weights = 5,000. Layer 2: 50 × 10 = 500. Plus bias terms: 50 + 10 = 60. Total: 5,560 partial derivatives per example. A2: The learning rate is too high. The steps overshoot the minimum and bounce back and forth. Reduce lr to 0.1 or 0.05. Or use learning rate decay. Or switch to Adam which adapts per-parameter. A3: Linear regression has no hidden layers. The prediction is a direct function of inputs and weights. The derivative is straightforward. Neural networks compose functions: input → linear → activation → linear → activation → loss. The chain rule is needed to propagate derivatives through each composition layer. A4: First moment (momentum) helps escape saddle points by accumulating velocity in consistent directions. Second moment (adaptive LR) helps in ravines by reducing step size in steep directions and increasing it in gentle directions. A5: 1,000,000 / 256 = 3,906 steps per epoch. If you increase to 1024: 1,000,000 / 1024 = 977 steps. Fewer steps but each step is more accurate (lower variance gradient). Larger batches often need higher learning rates."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Calculus is not a prerequisite you memorize and forget. It is the operating system of machine learning. Derivatives tell you which direction to move. Partial derivatives handle millions of parameters. The chain rule makes backpropagation possible. Gradient descent is the algorithm, and its variants — momentum, Adam, learning rate schedules — are engineering improvements on the same calculus foundation. When you see a neural network training, you are watching calculus in action: billions of derivatives computed and applied, over and over, until the model learns."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Do not treat optimizers as black boxes. Every weight update is: compute gradient → scale by learning rate → subtract from weight. The gradient comes from the chain rule. The learning rate is your only control. Master these fundamentals and you can debug any training run, understand any paper, and build any model from scratch."
    }
  ]
};

export default post;
