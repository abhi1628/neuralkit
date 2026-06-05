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
      "code": `import numpy as np
import matplotlib.pyplot as plt

# A simple quadratic: f(x) = x²
# The derivative is f'(x) = 2x
# At x = 3, the slope is 6. The function is increasing rapidly.
# At x = -2, the slope is -4. The function is decreasing.
# At x = 0, the slope is 0. This is the minimum.

def f(x):
    return x ** 2

def df(x):
    return 2 * x  # analytical derivative

def df_numerical(x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)  # central difference

# Verify they match
x_test = 3.0
print(f'Analytical derivative at x=3: {df(x_test):.6f}')      # 6.0
print(f'Numerical derivative at x=3: {df_numerical(x_test):.6f}')  # ~6.0

# === ML CONNECTION: Loss Landscape ===
# In ML, x is a weight parameter. f(x) is the loss.
# The derivative tells us: if I increase this weight slightly, does loss go up or down?
# We want to move in the direction that decreases loss.

# Visualize the function and its derivative
x = np.linspace(-4, 4, 400)
y = f(x)
dy = df(x)

plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(x, y, 'b-', linewidth=2, label='f(x) = x²')
plt.axhline(0, color='k', linewidth=0.5)
plt.axvline(0, color='k', linewidth=0.5)
plt.xlabel('x')
plt.ylabel('f(x)')
plt.title('Function')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(1, 2, 2)
plt.plot(x, dy, 'r-', linewidth=2, label="f'(x) = 2x")
plt.axhline(0, color='k', linewidth=0.5)
plt.axvline(0, color='k', linewidth=0.5)
plt.xlabel('x')
plt.ylabel("f'(x)")
plt.title('Derivative')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# Key insight: derivative = 0 at the minimum. This is why we 'set derivative to 0'
# in linear regression's normal equation.`
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
      "code": `import numpy as np

# A 2D function: f(x, y) = x² + 2y²
# This is like a loss function with two weights.
# Partial derivative with respect to x: ∂f/∂x = 2x
# Partial derivative with respect to y: ∂f/∂y = 4y
# Gradient vector: ∇f = [2x, 4y]

def f_2d(x, y):
    return x**2 + 2*y**2

def gradient_2d(x, y):
    return np.array([2*x, 4*y])  # [∂f/∂x, ∂f/∂y]

# At point (3, 2):
point = np.array([3.0, 2.0])
grad = gradient_2d(point[0], point[1])
print(f'At point {point}:')
print(f'  Gradient = {grad}')
print(f'  Function value = {f_2d(point[0], point[1]):.2f}')

# The gradient points in the direction of steepest increase.
# To decrease the function, move in the OPPOSITE direction: -grad
new_point = point - 0.1 * grad  # step size = 0.1
print(f'
After one gradient descent step (lr=0.1):')
print(f'  New point = {new_point}')
print(f'  New function value = {f_2d(new_point[0], new_point[1]):.2f}')

# === ML CONNECTION: Weight Updates ===
# In a neural network with 1 million weights:
# - Compute partial derivative of loss with respect to EACH weight
# - Stack them into a gradient vector of length 1,000,000
# - Update all weights simultaneously: w_new = w_old - lr * gradient
# This is why GPUs are essential — they parallelize this computation.

# Visualize the gradient field
import matplotlib.pyplot as plt
x = np.linspace(-3, 3, 20)
y = np.linspace(-3, 3, 20)
X, Y = np.meshgrid(x, y)
U = 2 * X  # ∂f/∂x
V = 4 * Y  # ∂f/∂y

plt.figure(figsize=(8, 6))
plt.quiver(X, Y, U, V, color='red', alpha=0.6)
plt.contour(X, Y, X**2 + 2*Y**2, levels=10, cmap='viridis')
plt.xlabel('x')
plt.ylabel('y')
plt.title('Gradient Field (arrows) and Contours of f(x,y) = x² + 2y²')
plt.colorbar(label='Function value')
plt.grid(True, alpha=0.3)
plt.show()

# The arrows point uphill. To minimize, walk downhill (opposite to arrows).`
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
      "code": `import numpy as np

# A tiny neural network: 1 input → 1 hidden → 1 output
# Forward pass: z = w1*x + b1, h = relu(z), y_pred = w2*h + b2, loss = (y_pred - y_true)²
# We need ∂loss/∂w1, ∂loss/∂b1, ∂loss/∂w2, ∂loss/∂b2

def relu(x):
    return np.maximum(0, x)

def relu_derivative(x):
    return (x > 0).astype(float)

# Parameters (random init)
w1, b1 = 0.5, 0.1
w2, b2 = -0.3, 0.2
x = 2.0        # input
y_true = 1.0   # target

# === FORWARD PASS ===
z = w1 * x + b1
h = relu(z)
y_pred = w2 * h + b2
loss = (y_pred - y_true) ** 2

print(f'Forward pass:')
print(f'  z = {z:.4f}, h = {h:.4f}, y_pred = {y_pred:.4f}')
print(f'  Loss = {loss:.4f}')

# === BACKWARD PASS (Chain Rule) ===
# ∂loss/∂y_pred = 2*(y_pred - y_true)
dy_pred = 2 * (y_pred - y_true)

# ∂loss/∂w2 = ∂loss/∂y_pred * ∂y_pred/∂w2 = dy_pred * h
dw2 = dy_pred * h

# ∂loss/∂b2 = ∂loss/∂y_pred * ∂y_pred/∂b2 = dy_pred * 1
db2 = dy_pred * 1

# ∂loss/∂h = ∂loss/∂y_pred * ∂y_pred/∂h = dy_pred * w2
dh = dy_pred * w2

# ∂loss/∂z = ∂loss/∂h * ∂h/∂z = dh * relu'(z)
dz = dh * relu_derivative(z)

# ∂loss/∂w1 = ∂loss/∂z * ∂z/∂w1 = dz * x
dw1 = dz * x

# ∂loss/∂b1 = ∂loss/∂z * ∂z/∂b1 = dz * 1
db1 = dz * 1

print(f'
Gradients (backward pass):')
print(f'  ∂loss/∂w1 = {dw1:.4f}')
print(f'  ∂loss/∂b1 = {db1:.4f}')
print(f'  ∂loss/∂w2 = {dw2:.4f}')
print(f'  ∂loss/∂b2 = {db2:.4f}')

# === VERIFY WITH NUMERICAL GRADIENTS ===
eps = 1e-5

def compute_loss(w1, b1, w2, b2):
    z = w1 * x + b1
    h = relu(z)
    y_pred = w2 * h + b2
    return (y_pred - y_true) ** 2

dw1_num = (compute_loss(w1+eps, b1, w2, b2) - compute_loss(w1-eps, b1, w2, b2)) / (2*eps)
db1_num = (compute_loss(w1, b1+eps, w2, b2) - compute_loss(w1, b1-eps, w2, b2)) / (2*eps)
dw2_num = (compute_loss(w1, b1, w2+eps, b2) - compute_loss(w1, b1, w2-eps, b2)) / (2*eps)
db2_num = (compute_loss(w1, b1, w2, b2+eps) - compute_loss(w1, b1, w2, b2-eps)) / (2*eps)

print(f'
Numerical verification:')
print(f'  ∂loss/∂w1: analytical={dw1:.6f}, numerical={dw1_num:.6f}')
print(f'  ∂loss/∂b1: analytical={db1:.6f}, numerical={db1_num:.6f}')
print(f'  ∂loss/∂w2: analytical={dw2:.6f}, numerical={dw2_num:.6f}')
print(f'  ∂loss/∂b2: analytical={db2:.6f}, numerical={db2_num:.6f}')

# === ML CONNECTION: Automatic Differentiation ===
# PyTorch's .backward() does EXACTLY what we did above.
# It builds a computation graph, then traverses it backward,
# applying the chain rule at each node. The 'autograd' engine
# is just an efficient implementation of this manual process.

# Key insight: the chain rule is MULTIPLICATION of derivatives.
# If you have 100 layers, you multiply 100 Jacobian matrices.
# This is why vanishing gradients happen — small numbers multiplied
# many times become extremely small.`
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
      "code": `import numpy as np
import matplotlib.pyplot as plt

# Generate synthetic data: y = 2x + 1 + noise
np.random.seed(42)
X = np.random.randn(100, 1)
y = 2 * X + 1 + 0.5 * np.random.randn(100, 1)

# Initialize parameters
w = np.random.randn(1)
b = np.random.randn(1)
lr = 0.1
epochs = 50

losses = []

for epoch in range(epochs):
    # Forward pass
    y_pred = w * X + b
    
    # Compute loss (Mean Squared Error)
    loss = np.mean((y_pred - y) ** 2)
    losses.append(loss)
    
    # Backward pass (compute gradients)
    # ∂loss/∂w = (2/n) * Σ(y_pred - y) * X
    # ∂loss/∂b = (2/n) * Σ(y_pred - y)
    n = len(X)
    dw = (2/n) * np.sum((y_pred - y) * X)
    db = (2/n) * np.sum(y_pred - y)
    
    # Update parameters
    w -= lr * dw
    b -= lr * db
    
    if epoch % 10 == 0:
        print(f'Epoch {epoch:2d}: loss={loss:.4f}, w={w[0]:.4f}, b={b[0]:.4f}')

print(f'
Final: w={w[0]:.4f}, b={b[0]:.4f}')
print(f'True values: w=2.0, b=1.0')

# Plot loss curve
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(losses, 'b-', linewidth=2)
plt.xlabel('Epoch')
plt.ylabel('Loss (MSE)')
plt.title('Loss Curve')
plt.grid(True, alpha=0.3)

# Plot data and fitted line
plt.subplot(1, 2, 2)
plt.scatter(X, y, alpha=0.5, label='Data')
x_line = np.linspace(X.min(), X.max(), 100)
plt.plot(x_line, w[0]*x_line + b[0], 'r-', linewidth=2, label=f'Fit: y={w[0]:.2f}x+{b[0]:.2f}')
plt.plot(x_line, 2*x_line + 1, 'g--', linewidth=2, alpha=0.7, label='True: y=2x+1')
plt.xlabel('x')
plt.ylabel('y')
plt.title('Linear Regression Fit')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# === ML CONNECTION: Batch vs Stochastic vs Mini-Batch ===
# We used ALL 100 data points to compute gradients. This is BATCH gradient descent.
# Stable but slow for large datasets.
#
# STOCHASTIC gradient descent: use ONE random point per step.
# Noisy but fast per step. The noise can help escape local minima.
#
# MINI-BATCH gradient descent: use 32-512 random points per step.
# The compromise everyone uses. GPU-friendly. Smooth but not too slow.
#
# Modern frameworks default to mini-batch. The batch size is a hyperparameter.`
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
      "code": `import numpy as np

# Larger dataset
np.random.seed(42)
n_samples = 10000
X = np.random.randn(n_samples, 1)
y = 3 * X - 2 + 0.5 * np.random.randn(n_samples, 1)

w = np.random.randn(1)
b = np.random.randn(1)
lr = 0.01
epochs = 20
batch_size = 64

n_batches = n_samples // batch_size

for epoch in range(epochs):
    # Shuffle data each epoch
    indices = np.random.permutation(n_samples)
    X_shuffled = X[indices]
    y_shuffled = y[indices]
    
    epoch_loss = 0
    
    for batch_idx in range(n_batches):
        # Get mini-batch
        start = batch_idx * batch_size
        end = start + batch_size
        X_batch = X_shuffled[start:end]
        y_batch = y_shuffled[start:end]
        
        # Forward
        y_pred = w * X_batch + b
        
        # Loss for this batch
        loss = np.mean((y_pred - y_batch) ** 2)
        epoch_loss += loss
        
        # Gradients (on batch, not full dataset)
        dw = (2/batch_size) * np.sum((y_pred - y_batch) * X_batch)
        db = (2/batch_size) * np.sum(y_pred - y_batch)
        
        # Update
        w -= lr * dw
        b -= lr * db
    
    if epoch % 5 == 0:
        print(f'Epoch {epoch:2d}: avg_loss={epoch_loss/n_batches:.4f}, w={w[0]:.4f}, b={b[0]:.4f}')

print(f'
Final: w={w[0]:.4f}, b={b[0]:.4f}')
print(f'True: w=3.0, b=-2.0')

# === ML CONNECTION: Why Mini-Batch Works ===
# 1. Speed: 10,000 samples / 64 per batch = 156 steps per epoch
#    vs 1 step for full batch. More updates = faster convergence.
# 2. Memory: GPU memory is limited. 64 samples fit easily.
# 3. Noise: Each batch gives a slightly different gradient direction.
#    This noise smooths the loss landscape and prevents getting stuck
#    in sharp local minima. Generalizes better.
# 4. Parallelism: GPUs process 64 samples simultaneously.
#    The matrix multiplication X_batch @ W is highly optimized.`
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
      "code": `import numpy as np
import matplotlib.pyplot as plt

# Simple 1D optimization: minimize f(x) = x²
# True minimum at x = 0

def f(x):
    return x ** 2

def df(x):
    return 2 * x

x0 = 5.0  # starting point
learning_rates = [0.01, 0.1, 0.5, 1.01]
colors = ['blue', 'green', 'orange', 'red']

plt.figure(figsize=(12, 8))

for idx, lr in enumerate(learning_rates):
    x = x0
    trajectory = [x]
    
    for step in range(20):
        x = x - lr * df(x)
        trajectory.append(x)
    
    plt.subplot(2, 2, idx + 1)
    t = np.arange(len(trajectory))
    plt.plot(t, trajectory, 'o-', color=colors[idx], linewidth=2, markersize=6)
    plt.axhline(0, color='black', linestyle='--', alpha=0.5, label='Minimum (x=0)')
    plt.xlabel('Step')
    plt.ylabel('x value')
    plt.title(f'Learning Rate = {lr}')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    final_x = trajectory[-1]
    status = 'CONVERGED' if abs(final_x) < 0.01 else 'DIVERGED' if abs(final_x) > 100 else 'OSCILLATING'
    plt.text(0.5, 0.95, f'Final x: {final_x:.4f}\\n{status}', 
             transform=plt.gca().transAxes, verticalalignment='top',
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

plt.tight_layout()
plt.show()

# === KEY OBSERVATIONS ===
# lr = 0.01: Slow but steady convergence. Safe but takes many steps.
# lr = 0.1: Fast convergence. Optimal for this simple problem.
# lr = 0.5: Oscillates around minimum. Steps are too large.
# lr = 1.01: DIVERGES! Each step overshoots and goes further away.
#
# Rule of thumb: lr between 1e-4 and 1e-2 for most neural networks.
# Use learning rate scheduling: start at 1e-3, decay by 0.1 every 10 epochs.
# Or use Adam optimizer which adapts lr per parameter automatically.`
    },
    {
  "type": "h2",
  "text": "Gradient Descent: The Complete Picture"
},
{
  "type": "p",
  "text": "Everything we have covered — derivatives, partial derivatives, the chain rule, learning rates, momentum, Adam — comes together in one algorithm: gradient descent. The infographic below summarizes the complete gradient descent framework: from mathematical formulation to algorithm steps to visualization to variants. Keep this as your reference cheat sheet."
},
{
  "type": "image",
  "src": "/images/roadmaps/gradient.png",
  "alt": "Complete Gradient Descent infographic showing intuition, math, algorithm, visualization, learning rates, cost functions, properties, variants, pseudocode, summary, and applications",
  "caption": "Gradient Descent: The complete reference — save this. It covers everything from the update rule θ^(t+1) = θ^(t) − α∇J(θ^(t)) to batch vs stochastic vs mini-batch to adaptive methods like Adam."
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
      "code": `import numpy as np

# Compare SGD, SGD with Momentum, and Adam on a 2D ravine function
# f(x, y) = 0.1*x² + 2*y² (steeper in y, gentle in x)

def loss(w):
    return 0.1 * w[0]**2 + 2 * w[1]**2

def gradient(w):
    return np.array([0.2 * w[0], 4 * w[1]])

# Starting point: deep in the ravine
w0 = np.array([2.0, 2.0])
epochs = 100
lr = 0.1

# === 1. Plain SGD ===
w_sgd = w0.copy()
traj_sgd = [w_sgd.copy()]
for _ in range(epochs):
    grad = gradient(w_sgd)
    w_sgd -= lr * grad
    traj_sgd.append(w_sgd.copy())

# === 2. SGD with Momentum ===
# v_t = β*v_{t-1} + grad
# w_t = w_{t-1} - lr * v_t
w_mom = w0.copy()
v = np.zeros(2)
beta = 0.9
traj_mom = [w_mom.copy()]
for _ in range(epochs):
    grad = gradient(w_mom)
    v = beta * v + grad
    w_mom -= lr * v
    traj_mom.append(w_mom.copy())

# === 3. Adam ===
# m_t = β1*m_{t-1} + (1-β1)*grad      (first moment - momentum)
# v_t = β2*v_{t-1} + (1-β2)*grad²     (second moment - adaptive lr)
# m_hat = m_t / (1-β1^t)              (bias correction)
# v_hat = v_t / (1-β2^t)
# w_t = w_{t-1} - lr * m_hat / (sqrt(v_hat) + ε)
w_adam = w0.copy()
m = np.zeros(2)
v = np.zeros(2)
beta1, beta2 = 0.9, 0.999
eps = 1e-8
traj_adam = [w_adam.copy()]

for t in range(1, epochs + 1):
    grad = gradient(w_adam)
    m = beta1 * m + (1 - beta1) * grad
    v = beta2 * v + (1 - beta2) * (grad ** 2)
    m_hat = m / (1 - beta1**t)
    v_hat = v / (1 - beta2**t)
    w_adam -= lr * m_hat / (np.sqrt(v_hat) + eps)
    traj_adam.append(w_adam.copy())

# Compare final losses
print(f'Final losses after {epochs} steps:')
print(f'  SGD:      {loss(traj_sgd[-1]):.6f}')
print(f'  Momentum: {loss(traj_mom[-1]):.6f}')
print(f'  Adam:     {loss(traj_adam[-1]):.6f}')

# Visualize trajectories
import matplotlib.pyplot as plt
traj_sgd = np.array(traj_sgd)
traj_mom = np.array(traj_mom)
traj_adam = np.array(traj_adam)

plt.figure(figsize=(10, 8))
plt.plot(traj_sgd[:, 0], traj_sgd[:, 1], 'b.-', alpha=0.6, label='SGD', markersize=4)
plt.plot(traj_mom[:, 0], traj_mom[:, 1], 'g.-', alpha=0.6, label='Momentum', markersize=4)
plt.plot(traj_adam[:, 0], traj_adam[:, 1], 'r.-', alpha=0.6, label='Adam', markersize=4)
plt.scatter([0], [0], color='black', marker='*', s=200, label='Minimum', zorder=5)
plt.scatter([w0[0]], [w0[1]], color='purple', marker='o', s=100, label='Start', zorder=5)
plt.xlabel('w[0] (gentle direction)')
plt.ylabel('w[1] (steep direction)')
plt.title('Optimizer Trajectories in a Ravine')
plt.legend()
plt.grid(True, alpha=0.3)
plt.axis('equal')
plt.show()

# === ML CONNECTION: Which Optimizer to Use ===
# SGD + Momentum: Best for large batch training, image classification.
#   Requires more tuning but often reaches better final accuracy.
# Adam: Default for everything else. NLP, transformers, small datasets.
#   Converges fast, needs little tuning. May generalize slightly worse.
# AdamW: Adam with proper weight decay. Often better than Adam.
#   Use this if available (PyTorch default since 2019).
# Lion: Newer optimizer (2023). Simpler than Adam, sometimes better.
#   Worth trying on large vision/language models.`
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
      "code": `import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# A classic saddle point: f(x, y) = x² - y²
# At (0, 0): ∂f/∂x = 0, ∂f/∂y = 0. But it's a saddle, not a minimum.
# In x-direction: curves up (minimum along x)
# In y-direction: curves down (maximum along y)

def saddle(x, y):
    return x**2 - y**2

x = np.linspace(-2, 2, 100)
y = np.linspace(-2, 2, 100)
X, Y = np.meshgrid(x, y)
Z = saddle(X, Y)

fig = plt.figure(figsize=(12, 5))

# 3D surface
ax1 = fig.add_subplot(121, projection='3d')
ax1.plot_surface(X, Y, Z, cmap='coolwarm', alpha=0.8)
ax1.scatter([0], [0], [0], color='black', s=100, label='Saddle Point')
ax1.set_xlabel('x')
ax1.set_ylabel('y')
ax1.set_zlabel('f(x,y)')
ax1.set_title('Saddle Point: f(x,y) = x² - y²')
ax1.legend()

# Contour plot with gradient field
ax2 = fig.add_subplot(122)
contour = ax2.contour(X, Y, Z, levels=20, cmap='coolwarm')
ax2.clabel(contour, inline=True, fontsize=8)

# Gradient field
x_sparse = np.linspace(-2, 2, 15)
y_sparse = np.linspace(-2, 2, 15)
X_s, Y_s = np.meshgrid(x_sparse, y_sparse)
U = 2 * X_s  # ∂f/∂x
V = -2 * Y_s  # ∂f/∂y
ax2.quiver(X_s, Y_s, U, V, alpha=0.5)
ax2.scatter([0], [0], color='black', s=100, zorder=5, label='Saddle Point')
ax2.set_xlabel('x')
ax2.set_ylabel('y')
ax2.set_title('Contours and Gradient Field')
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# === ML CONNECTION: Why Saddle Points Matter ===
# In high dimensions (1M+ weights), saddle points are EVERYWHERE.
# Local minima are rare because ALL directions must curve up.
# At a saddle point, gradient descent slows (gradient ≈ 0) but doesn't stop.
# Noise from mini-batches and momentum help escape.
#
# Research insight: In very high dimensions, almost all critical points
# (where gradient = 0) are saddle points, not local minima.
# This is why deep learning works despite having millions of parameters.
# The landscape is full of saddles, but gradient descent navigates them.`
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
