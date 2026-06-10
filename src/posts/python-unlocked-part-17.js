const post = {
  "slug": "part-17-advanced-functions-recursion",
  "seriesSlug": "python-unlocked",
  "partNumber": 17,
  "totalParts": 30,
  "title": "Advanced Functions & Recursion: Self-Reference & Memory (Part 17)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "28 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Recursion: base case, recursive case, stack depth. Memoization: manual and functools.lru_cache. Tail recursion limitation and workarounds. Type hints: typing module, Callable, Optional. Programs: Tower of Hanoi, Fibonacci memoization, directory tree walker, typed function library.",
  "coverEmoji": "🔄",
  "tags": [
    "Python", "Recursion", "Memoization", "lru_cache",
    "Tail Recursion", "Type Hints", "Callable", "Tower of Hanoi"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1905, the mathematician Giuseppe Peano defined the natural numbers using recursion: zero is a number, and the successor of any number is a number. This self-referential definition — where a concept is defined in terms of itself — became the foundation of modern mathematics. One hundred twenty-one years later, in 2026, Python recursion embodies that same principle. A function that calls itself, breaking problems into smaller versions of themselves, until reaching a base case so simple it needs no further recursion. But recursion in Python has limits. The call stack has a maximum depth. Repeated calculations waste time. And tail recursion — the elegant optimization where the recursive call is the last operation — is not optimized by Python. In this part, we will explore the full depth of advanced functions and recursion. You will learn how to write recursive functions with confidence, how memoization transforms exponential time into linear time, how to work around Python's tail recursion limitation, and how type hints make your functions self-documenting and error-resistant. By the end, recursion will not be a mystery. It will be a precision instrument for problem-solving."
    },
    {
      "type": "h2",
      "text": "Recursion Fundamentals: Base Case and Recursive Case"
    },
    {
      "type": "p",
      "text": "Every recursive function has two parts: the base case, which stops the recursion, and the recursive case, which breaks the problem into smaller pieces and calls itself. Without a base case, recursion is infinite. Without a recursive case, it is just a regular function. The art of recursion is identifying these two cases for any problem."
    },
    {
      "type": "code-block",
      "label": "Recursion Fundamentals",
      "code": "# === RECURSION ANATOMY ===
# Base case: stops recursion
# Recursive case: calls itself with smaller problem

# --- Factorial (classic) ---
def factorial(n):
    """Calculate n! recursively."""
    # Base case
    if n <= 1:
        return 1
    # Recursive case
    return n * factorial(n - 1)

print(f"5! = {factorial(5)}")

# --- Sum of list ---
def recursive_sum(numbers):
    """Sum a list recursively."""
    # Base case
    if not numbers:
        return 0
    # Recursive case
    return numbers[0] + recursive_sum(numbers[1:])

print(f"\nSum [1,2,3,4,5] = {recursive_sum([1, 2, 3, 4, 5])}")

# --- Count items ---
def recursive_count(items):
    """Count items in a list recursively."""
    if not items:
        return 0
    return 1 + recursive_count(items[1:])

print(f"\nCount [1,2,3] = {recursive_count([1, 2, 3])}")

# --- Find maximum ---
def recursive_max(numbers):
    """Find maximum recursively."""
    if len(numbers) == 1:
        return numbers[0]
    sub_max = recursive_max(numbers[1:])
    return numbers[0] if numbers[0] > sub_max else sub_max

print(f"\nMax [3,1,4,1,5] = {recursive_max([3, 1, 4, 1, 5])}")

# --- Reverse string ---
def reverse(s):
    """Reverse a string recursively."""
    if len(s) <= 1:
        return s
    return reverse(s[1:]) + s[0]

print(f"\nReverse 'hello' = '{reverse('hello')}'")

# --- Palindrome check ---
def is_palindrome(s):
    """Check if string is palindrome recursively."""
    s = s.lower().replace(' ', '')
    if len(s) <= 1:
        return True
    if s[0] != s[-1]:
        return False
    return is_palindrome(s[1:-1])

print(f"\nPalindrome 'racecar': {is_palindrome('racecar')}")
print(f"Palindrome 'hello': {is_palindrome('hello')}")

# --- Stack visualization ---
# Each recursive call adds a frame to the call stack

def countdown(n):
    """Countdown with print to show stack depth."""
    print(f"  countdown({n}) - stack depth increasing")
    if n <= 0:
        print(f"  BASE CASE REACHED!")
        return
    countdown(n - 1)
    print(f"  countdown({n}) - returning, stack depth decreasing")

print(f"\nCountdown(3):")
countdown(3)

print("\nRecursion fundamentals complete!")"
    },
    {
      "type": "h2",
      "text": "Stack Depth and Recursion Limits"
    },
    {
      "type": "p",
      "text": "Python has a recursion limit — default 1000 frames. Exceeding it raises RecursionError. This is not a bug; it is a safety feature. Python's call stack is not optimized for deep recursion like some functional languages. Understanding this limit means knowing when to use recursion, when to use iteration, and how to increase the limit when truly necessary."
    },
    {
      "type": "code-block",
      "label": "Stack Depth & Limits",
      "code": "# === RECURSION LIMIT ===
import sys

print(f"Default recursion limit: {sys.getrecursionlimit()}")

# --- Exceeding the limit ---
def infinite_recursion(n):
    return infinite_recursion(n + 1)

# Don't run this! It would crash with RecursionError
# infinite_recursion(0)

# --- Safe deep recursion ---
# Increase limit if needed (use with caution)

def deep_count(n):
    if n <= 0:
        return 0
    return 1 + deep_count(n - 1)

# Test near the limit
try:
    result = deep_count(1500)
    print(f"\nCount to 1500: {result}")
except RecursionError as e:
    print(f"RecursionError: {e}")

# --- Stack frame inspection ---
import inspect

def show_stack_depth():
    """Show current stack depth."""
    return len(inspect.stack())

def nested_calls(n):
    if n <= 0:
        return show_stack_depth()
    return nested_calls(n - 1)

print(f"\nStack depth at base case (5 nested calls): {nested_calls(5)}")

# --- Iterative alternative to deep recursion ---
# Use a stack data structure instead of the call stack

def iterative_tree_traversal(root):
    """Traverse tree iteratively using explicit stack."""
    result = []
    stack = [root]
    while stack:
        node = stack.pop()
        if node:
            result.append(node['value'])
            stack.append(node.get('right'))
            stack.append(node.get('left'))
    return result

tree = {
    'value': 1,
    'left': {'value': 2, 'left': {'value': 4}, 'right': {'value': 5}},
    'right': {'value': 3, 'left': {'value': 6}, 'right': {'value': 7}}
}
print(f"\nIterative tree traversal: {iterative_tree_traversal(tree)}")

# --- Recursive tree traversal (for comparison) ---
def recursive_tree_traversal(node):
    if not node:
        return []
    return (recursive_tree_traversal(node.get('left')) +
            [node['value']] +
            recursive_tree_traversal(node.get('right')))

print(f"Recursive tree traversal: {recursive_tree_traversal(tree)}")

# --- sys.setrecursionlimit (use carefully) ---
# Only for controlled environments, not production

# sys.setrecursionlimit(2000)
# print(f"New limit: {sys.getrecursionlimit()}")

print("\nStack depth & limits mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Memoization: From Exponential to Linear"
    },
    {
      "type": "p",
      "text": "Memoization is the technique of caching function results to avoid redundant calculations. It transforms exponential-time recursive algorithms into linear-time powerhouses. Python offers two approaches: manual memoization with dictionaries, and automatic memoization with functools.lru_cache. Both are essential tools for any serious programmer."
    },
    {
      "type": "code-block",
      "label": "Memoization Mastery",
      "code": "# === MANUAL MEMOIZATION ===
# Cache results in a dictionary

def fibonacci_manual(n, memo=None):
    """Fibonacci with manual memoization."""
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci_manual(n - 1, memo) + fibonacci_manual(n - 2, memo)
    return memo[n]

# --- AUTOMATIC MEMOIZATION with lru_cache ---
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci_lru(n):
    """Fibonacci with automatic memoization."""
    if n <= 1:
        return n
    return fibonacci_lru(n - 1) + fibonacci_lru(n - 2)

# --- BENCHMARK: Naive vs Memoized ---
import time

def fibonacci_naive(n):
    """Naive recursive Fibonacci (exponential)."""
    if n <= 1:
        return n
    return fibonacci_naive(n - 1) + fibonacci_naive(n - 2)

print("Fibonacci benchmarks:")
for n in [10, 20, 30, 35]:
    # Naive (skip for large n)
    if n <= 35:
        start = time.perf_counter()
        result_naive = fibonacci_naive(n)
        t_naive = time.perf_counter() - start
        print(f"  n={n:2d}: naive={t_naive:.6f}s", end="")
    else:
        print(f"  n={n:2d}: naive=TOO_SLOW", end="")

    # Memoized
    start = time.perf_counter()
    result_memo = fibonacci_manual(n)
    t_memo = time.perf_counter() - start
    print(f", memo={t_memo:.6f}s, speedup={t_naive/t_memo:.0f}x")

# --- lru_cache FEATURES ---
# Cache info and clearing

print(f"\nlru_cache info: {fibonacci_lru.cache_info()}")
fibonacci_lru.cache_clear()
print(f"After clear: {fibonacci_lru.cache_info()}")

# --- MEMOIZATION FOR MULTIPLE ARGUMENTS ---
@lru_cache(maxsize=None)  # Unlimited cache
def binomial_coefficient(n, k):
    """Calculate C(n,k) with memoization."""
    if k == 0 or k == n:
        return 1
    if k > n:
        return 0
    return binomial_coefficient(n - 1, k - 1) + binomial_coefficient(n - 1, k)

print(f"\nC(10, 5) = {binomial_coefficient(10, 5)}")
print(f"C(50, 25) = {binomial_coefficient(50, 25)}")
print(f"Cache info: {binomial_coefficient.cache_info()}")

# --- MEMOIZATION FOR PATH FINDING ---
from functools import lru_cache

@lru_cache(maxsize=None)
def grid_paths(rows, cols):
    """Count paths from top-left to bottom-right (only right/down moves)."""
    if rows == 1 or cols == 1:
        return 1
    return grid_paths(rows - 1, cols) + grid_paths(rows, cols - 1)

print(f"\nGrid paths (3x3): {grid_paths(3, 3)}")
print(f"Grid paths (10x10): {grid_paths(10, 10)}")
print(f"Grid paths (20x20): {grid_paths(20, 20)}")

# --- MEMOIZATION WITH CLASS METHODS ---
class MemoizedMath:
    """Math operations with memoization."""

    @staticmethod
    @lru_cache(maxsize=256)
    def factorial(n):
        if n <= 1:
            return 1
        return n * MemoizedMath.factorial(n - 1)

    @staticmethod
    @lru_cache(maxsize=256)
    def ackermann(m, n):
        """Ackermann function (grows extremely fast)."""
        if m == 0:
            return n + 1
        if n == 0:
            return MemoizedMath.ackermann(m - 1, 1)
        return MemoizedMath.ackermann(m - 1, MemoizedMath.ackermann(m, n - 1))

print(f"\nMemoized factorial(50): {str(MemoizedMath.factorial(50))[:20]}...")
print(f"Ackermann(3, 2): {MemoizedMath.ackermann(3, 2)}")
print(f"Ackermann(3, 4): {MemoizedMath.ackermann(3, 4)}")

print("\nMemoization mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Tail Recursion: Python's Limitation and Workarounds"
    },
    {
      "type": "p",
      "text": "Tail recursion is when the recursive call is the very last operation in the function. In functional languages like Haskell or Scheme, this is optimized into iteration — no new stack frame is created. Python does not optimize tail recursion. Every recursive call adds a stack frame, regardless of position. This means deep tail recursion will hit the recursion limit. The workaround is explicit iteration or using a trampoline pattern."
    },
    {
      "type": "code-block",
      "label": "Tail Recursion Workarounds",
      "code": "# === TAIL RECURSION ===
# Recursive call is the last operation

# Tail-recursive factorial (Python does NOT optimize)
def factorial_tail(n, accumulator=1):
    if n <= 1:
        return accumulator
    return factorial_tail(n - 1, n * accumulator)

print(f"Tail factorial(5): {factorial_tail(5)}")

# --- CONVERT TO ITERATION ---
# The manual optimization Python won't do

def factorial_iterative(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

print(f"Iterative factorial(5): {factorial_iterative(5)}")

# --- TRAMPOLINE PATTERN ---
# Simulate tail call optimization

class TailCall:
    """Represents a tail call to be executed."""
    def __init__(self, func, *args, **kwargs):
        self.func = func
        self.args = args
        self.kwargs = kwargs

def trampoline(func):
    """Decorator to enable tail call optimization."""
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        while isinstance(result, TailCall):
            result = result.func(*result.args, **result.kwargs)
        return result
    return wrapper

@trampoline
def factorial_trampoline(n, accumulator=1):
    if n <= 1:
        return accumulator
    return TailCall(factorial_trampoline, n - 1, n * accumulator)

print(f"\nTrampoline factorial(1000): {str(factorial_trampoline(1000))[:20]}...")

# --- ACCUMULATOR PATTERN ---
# Pass state through parameters

def sum_range(start, end, accumulator=0):
    """Sum range using accumulator."""
    if start > end:
        return accumulator
    return sum_range(start + 1, end, accumulator + start)

print(f"\nSum 1 to 100: {sum_range(1, 100)}")
print(f"Formula check: {100 * 101 // 2}")

# --- EXPLICIT STACK FOR TREE TRAVERSAL ---
# Avoid recursion limit for deep trees

def tree_depth_iterative(root):
    """Find tree depth without recursion."""
    if not root:
        return 0
    max_depth = 0
    stack = [(root, 1)]
    while stack:
        node, depth = stack.pop()
        max_depth = max(max_depth, depth)
        if node.get('left'):
            stack.append((node['left'], depth + 1))
        if node.get('right'):
            stack.append((node['right'], depth + 1))
    return max_depth

deep_tree = {'value': 1, 'right': {'value': 2, 'right': {'value': 3, 'right': {'value': 4}}}}
print(f"\nIterative tree depth: {tree_depth_iterative(deep_tree)}")

# --- GENERATOR-BASED RECURSION ---
# Use yield for lazy, memory-efficient traversal

def tree_generator(node):
    """Yield tree values without building lists."""
    if node:
        yield from tree_generator(node.get('left'))
        yield node['value']
        yield from tree_generator(node.get('right'))

tree = {
    'value': 4,
    'left': {'value': 2, 'left': {'value': 1}, 'right': {'value': 3}},
    'right': {'value': 6, 'left': {'value': 5}, 'right': {'value': 7}}
}
print(f"\nGenerator tree values: {list(tree_generator(tree))}")

print("\nTail recursion workarounds complete!")"
    },
    {
      "type": "h2",
      "text": "Type Hints: Self-Documenting Functions"
    },
    {
      "type": "p",
      "text": "Type hints, introduced in Python 3.5, allow you to annotate function parameters and return types. They are not enforced at runtime — Python remains dynamically typed. But they enable static analysis tools like mypy to catch type errors before runtime. They also serve as documentation, making your code self-explanatory."
    },
    {
      "type": "code-block",
      "label": "Type Hints Mastery",
      "code": "# === BASIC TYPE HINTS ===
# Python 3.5+ syntax

def greet(name: str, times: int = 1) -> str:
    """Return greeting repeated times."""
    return (f"Hello, {name}! " * times).strip()

print(greet("Alice", 2))

# --- COMMON TYPES FROM typing MODULE ---
from typing import List, Dict, Tuple, Optional, Union, Callable, Any

def process_numbers(numbers: List[int]) -> List[float]:
    """Process list of integers."""
    return [n / 2.0 for n in numbers]

def find_user(users: Dict[str, int], name: str) -> Optional[int]:
    """Find user age, return None if not found."""
    return users.get(name)

def parse_value(value: Union[str, int, float]) -> float:
    """Parse value to float."""
    return float(value)

def apply_transform(data: List[int], func: Callable[[int], int]) -> List[int]:
    """Apply function to each element."""
    return [func(x) for x in data]

def any_type(x: Any) -> Any:
    """Accept and return any type."""
    return x

# --- GENERIC TYPES ---
from typing import TypeVar, Generic

T = TypeVar('T')

def first_item(items: List[T]) -> Optional[T]:
    """Return first item or None."""
    return items[0] if items else None

print(f"\nfirst_item([1,2,3]): {first_item([1, 2, 3])}")
print(f"first_item([]): {first_item([])}")

# --- CLASS TYPE HINTS ---
from typing import Self
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

    def distance(self, other: 'Point') -> float:
        import math
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)

    def move(self, dx: float, dy: float) -> Self:
        return Point(self.x + dx, self.y + dy)

p1 = Point(0, 0)
p2 = Point(3, 4)
print(f"\nDistance: {p1.distance(p2):.2f}")

# --- PROTOCOLS (Structural Subtyping) ---
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

def render(item: Drawable) -> None:
    item.draw()

class Circle:
    def draw(self) -> None:
        print("Drawing circle")

class Square:
    def draw(self) -> None:
        print("Drawing square")

render(Circle())
render(Square())

# --- TYPE ALIASES ---
from typing import TypeAlias

Vector = List[float]
Matrix = List[Vector]

def dot_product(a: Vector, b: Vector) -> float:
    return sum(x * y for x, y in zip(a, b))

v1 = [1.0, 2.0, 3.0]
v2 = [4.0, 5.0, 6.0]
print(f"\nDot product: {dot_product(v1, v2)}")

# --- FINAL AND LITERAL ---
from typing import Final, Literal

MAX_SIZE: Final = 100

def set_priority(level: Literal['low', 'medium', 'high']) -> str:
    return f"Priority set to {level}"

print(f"\n{set_priority('high')}")
# set_priority('urgent')  # mypy would flag this

print("\nType hints mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use recursion, memoization, tail recursion workarounds, and type hints to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Tower of Hanoi",
      "code": """"
Program 1: Tower of Hanoi
Classic recursive puzzle with visualization.
Demonstrates recursion, base case, and move counting.
"""

from typing import List, Tuple

class TowerOfHanoi:
    """Tower of Hanoi solver with move tracking."""

    def __init__(self, num_disks: int):
        self.num_disks = num_disks
        self.moves: List[Tuple[int, str, str]] = []
        self.move_count = 0

        # Initialize towers
        self.towers = {
            'A': list(range(num_disks, 0, -1)),  # Largest at bottom
            'B': [],
            'C': []
        }

    def solve(self) -> List[Tuple[int, str, str]]:
        """Solve and return all moves."""
        self.moves = []
        self.move_count = 0
        self._move_disks(self.num_disks, 'A', 'C', 'B')
        return self.moves

    def _move_disks(self, n: int, source: str, target: str, auxiliary: str):
        """
        Move n disks from source to target using auxiliary.
        Base case: move 1 disk directly.
        Recursive case: move n-1 to auxiliary, move largest to target, move n-1 to target.
        """
        if n == 1:
            self._execute_move(1, source, target)
            return

        # Move n-1 disks from source to auxiliary
        self._move_disks(n - 1, source, auxiliary, target)

        # Move the nth disk from source to target
        self._execute_move(n, source, target)

        # Move n-1 disks from auxiliary to target
        self._move_disks(n - 1, auxiliary, target, source)

    def _execute_move(self, disk: int, source: str, target: str):
        """Record and execute a move."""
        self.move_count += 1
        self.moves.append((disk, source, target))

        # Update tower state
        self.towers[source].pop()
        self.towers[target].append(disk)

    def print_solution(self):
        """Print the solution step by step."""
        print(f"\nTower of Hanoi Solution ({self.num_disks} disks)")
        print(f"Minimum moves required: {2**self.num_disks - 1}")
        print(f"Actual moves: {len(self.moves)}")
        print("-" * 40)

        # Reset towers for visualization
        self.towers = {
            'A': list(range(self.num_disks, 0, -1)),
            'B': [],
            'C': []
        }

        for i, (disk, source, target) in enumerate(self.moves, 1):
            self.towers[source].pop()
            self.towers[target].append(disk)
            print(f"Step {i:3d}: Move disk {disk} from {source} -> {target}")
            self._print_towers()

    def _print_towers(self):
        """Print current tower state."""
        max_height = max(len(t) for t in self.towers.values())
        for level in range(max_height - 1, -1, -1):
            row = ""
            for tower in ['A', 'B', 'C']:
                if level < len(self.towers[tower]):
                    disk = self.towers[tower][level]
                    width = disk * 2 - 1
                    row += f" {disk:^{width}} "
                else:
                    row += "  |  "
            print(f"    {row}")
        print(f"    {'A':^5} {'B':^5} {'C':^5}")
        print()

    def verify(self) -> bool:
        """Verify solution is correct."""
        return (len(self.towers['C']) == self.num_disks and
                self.towers['C'] == list(range(self.num_disks, 0, -1)) and
                len(self.moves) == 2**self.num_disks - 1)

def main():
    """Main Tower of Hanoi program."""
    print("=" * 50)
    print("TOWER OF HANOI")
    print("=" * 50)

    for disks in [3, 4]:
        hanoi = TowerOfHanoi(disks)
        hanoi.solve()
        print(f"\n{disks} disks: {len(hanoi.moves)} moves")
        if disks <= 3:
            hanoi.print_solution()
        print(f"Verified: {hanoi.verify()}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 2: Fibonacci with Memoization",
      "code": """"
Program 2: Fibonacci with Memoization
Multiple Fibonacci implementations with performance comparison.
Demonstrates naive, memoized, iterative, and matrix exponentiation.
"""

import time
from functools import lru_cache
from typing import Dict, Tuple

class Fibonacci:
    """Multiple Fibonacci implementations."""

    @staticmethod
    def naive(n: int) -> int:
        """Naive recursive. O(2^n) time."""
        if n <= 1:
            return n
        return Fibonacci.naive(n - 1) + Fibonacci.naive(n - 2)

    @staticmethod
    def manual_memo(n: int, memo: Dict[int, int] = None) -> int:
        """Manual memoization. O(n) time."""
        if memo is None:
            memo = {}
        if n in memo:
            return memo[n]
        if n <= 1:
            return n
        memo[n] = Fibonacci.manual_memo(n - 1, memo) + Fibonacci.manual_memo(n - 2, memo)
        return memo[n]

    @staticmethod
    @lru_cache(maxsize=128)
    def auto_memo(n: int) -> int:
        """Automatic memoization. O(n) time."""
        if n <= 1:
            return n
        return Fibonacci.auto_memo(n - 1) + Fibonacci.auto_memo(n - 2)

    @staticmethod
    def iterative(n: int) -> int:
        """Iterative. O(n) time, O(1) space."""
        if n <= 1:
            return n
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b

    @staticmethod
    def matrix_exp(n: int) -> int:
        """Matrix exponentiation. O(log n) time."""
        if n <= 1:
            return n

        def multiply(A: Tuple, B: Tuple) -> Tuple:
            """Multiply 2x2 matrices."""
            return (
                A[0]*B[0] + A[1]*B[2], A[0]*B[1] + A[1]*B[3],
                A[2]*B[0] + A[3]*B[2], A[2]*B[1] + A[3]*B[3]
            )

        def power(matrix: Tuple, n: int) -> Tuple:
            """Matrix power using binary exponentiation."""
            if n == 1:
                return matrix
            if n % 2 == 0:
                half = power(matrix, n // 2)
                return multiply(half, half)
            else:
                return multiply(matrix, power(matrix, n - 1))

        M = (1, 1, 1, 0)
        result = power(M, n)
        return result[1]

    @staticmethod
    def closed_form(n: int) -> int:
        """Binet's formula (approximate for large n)."""
        import math
        phi = (1 + math.sqrt(5)) / 2
        psi = (1 - math.sqrt(5)) / 2
        return int((phi**n - psi**n) / math.sqrt(5))

    @staticmethod
    def benchmark(n: int):
        """Benchmark all implementations."""
        methods = {
            'naive': Fibonacci.naive,
            'manual_memo': Fibonacci.manual_memo,
            'auto_memo': Fibonacci.auto_memo,
            'iterative': Fibonacci.iterative,
            'matrix_exp': Fibonacci.matrix_exp,
        }

        results = {}
        for name, method in methods.items():
            # Skip naive for large n
            if name == 'naive' and n > 35:
                results[name] = 'TOO_SLOW'
                continue

            start = time.perf_counter()
            result = method(n)
            elapsed = time.perf_counter() - start
            results[name] = {'result': result, 'time': elapsed}

        return results

def main():
    """Main Fibonacci program."""
    print("=" * 50)
    print("FIBONACCI WITH MEMOIZATION")
    print("=" * 50)

    # Small test
    print(f"\nFibonacci(10): {Fibonacci.iterative(10)}")

    # Benchmark
    for n in [10, 20, 30, 35, 100, 500, 1000]:
        print(f"\n--- n = {n} ---")
        results = Fibonacci.benchmark(n)
        for name, data in results.items():
            if data == 'TOO_SLOW':
                print(f"  {name:12s}: TOO_SLOW")
            else:
                result_str = str(data['result'])[:20]
                print(f"  {name:12s}: {result_str:>20s}... ({data['time']:.6f}s)")

    # Closed form comparison
    print(f"\nBinet's formula accuracy:")
    for n in [10, 20, 30, 40]:
        exact = Fibonacci.iterative(n)
        approx = Fibonacci.closed_form(n)
        error = abs(exact - approx)
        print(f"  F({n}): exact={exact}, approx={approx}, error={error}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 3: Directory Tree Walker",
      "code": """"
Program 3: Directory Tree Walker
Recursive directory traversal with file statistics.
Demonstrates recursion, os module, and tree structures.
"""

import os
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

class DirectoryTree:
    """Walk and analyze directory trees."""

    @staticmethod
    def walk_recursive(path: str, max_depth: int = -1, current_depth: int = 0) -> Dict:
        """
        Recursively walk directory tree.
        Returns tree structure with files and subdirectories.
        """
        if max_depth >= 0 and current_depth > max_depth:
            return {'name': os.path.basename(path), 'type': 'truncated'}

        result = {
            'name': os.path.basename(path),
            'type': 'directory',
            'path': path,
            'children': []
        }

        try:
            for item in sorted(os.listdir(path)):
                item_path = os.path.join(path, item)
                if os.path.isdir(item_path):
                    child = DirectoryTree.walk_recursive(
                        item_path, max_depth, current_depth + 1
                    )
                    result['children'].append(child)
                else:
                    stat = os.stat(item_path)
                    result['children'].append({
                        'name': item,
                        'type': 'file',
                        'size': stat.st_size,
                        'modified': stat.st_mtime
                    })
        except PermissionError:
            result['error'] = 'Permission denied'

        return result

    @staticmethod
    def print_tree(tree: Dict, prefix: str = "", is_last: bool = True):
        """Print tree in ASCII format."""
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{tree['name']}")

        if tree.get('type') == 'directory' and 'children' in tree:
            children = tree['children']
            for i, child in enumerate(children):
                is_last_child = i == len(children) - 1
                extension = "    " if is_last else "│   "
                DirectoryTree.print_tree(child, prefix + extension, is_last_child)

    @staticmethod
    def count_files(tree: Dict) -> Tuple[int, int]:
        """Count files and directories in tree."""
        files = 0
        dirs = 1 if tree.get('type') == 'directory' else 0

        for child in tree.get('children', []):
            if child.get('type') == 'file':
                files += 1
            elif child.get('type') == 'directory':
                f, d = DirectoryTree.count_files(child)
                files += f
                dirs += d

        return files, dirs

    @staticmethod
    def total_size(tree: Dict) -> int:
        """Calculate total size of all files."""
        total = 0
        for child in tree.get('children', []):
            if child.get('type') == 'file':
                total += child.get('size', 0)
            elif child.get('type') == 'directory':
                total += DirectoryTree.total_size(child)
        return total

    @staticmethod
    def find_by_extension(tree: Dict, extension: str) -> List[str]:
        """Find all files with given extension."""
        matches = []
        for child in tree.get('children', []):
            if child.get('type') == 'file' and child['name'].endswith(extension):
                matches.append(child['name'])
            elif child.get('type') == 'directory':
                matches.extend(DirectoryTree.find_by_extension(child, extension))
        return matches

    @staticmethod
    def extension_stats(tree: Dict) -> Dict[str, int]:
        """Count files by extension."""
        stats = defaultdict(int)
        for child in tree.get('children', []):
            if child.get('type') == 'file':
                ext = os.path.splitext(child['name'])[1] or '(no ext)'
                stats[ext] += 1
            elif child.get('type') == 'directory':
                sub_stats = DirectoryTree.extension_stats(child)
                for ext, count in sub_stats.items():
                    stats[ext] += count
        return dict(stats)

def main():
    """Main directory tree program."""
    print("=" * 50)
    print("DIRECTORY TREE WALKER")
    print("=" * 50)

    # Create sample directory structure for demo
    import tempfile
    import shutil

    temp_dir = tempfile.mkdtemp()
    try:
        # Create sample structure
        os.makedirs(os.path.join(temp_dir, 'src', 'utils'))
        os.makedirs(os.path.join(temp_dir, 'tests'))
        os.makedirs(os.path.join(temp_dir, 'docs'))

        # Create sample files
        for path in [
            'src/main.py', 'src/utils/helpers.py', 'src/utils/math.py',
            'tests/test_main.py', 'tests/test_utils.py',
            'docs/readme.md', 'docs/api.md',
            'config.json', 'requirements.txt'
        ]:
            full_path = os.path.join(temp_dir, path)
            with open(full_path, 'w') as f:
                f.write(f"# {path}\n")

        # Walk and analyze
        tree = DirectoryTree.walk_recursive(temp_dir)

        print(f"\nDirectory tree:")
        DirectoryTree.print_tree(tree)

        files, dirs = DirectoryTree.count_files(tree)
        print(f"\nStatistics:")
        print(f"  Files: {files}")
        print(f"  Directories: {dirs}")
        print(f"  Total size: {DirectoryTree.total_size(tree)} bytes")

        print(f"\nExtension stats:")
        for ext, count in DirectoryTree.extension_stats(tree).items():
            print(f"  {ext}: {count}")

        print(f"\nPython files:")
        for f in DirectoryTree.find_by_extension(tree, '.py'):
            print(f"  {f}")

    finally:
        shutil.rmtree(temp_dir)

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 4: Typed Function Library",
      "code": """"
Program 4: Typed Function Library
A library of typed mathematical functions with protocols.
Demonstrates type hints, generics, and structural subtyping.
"""

from typing import List, Tuple, Protocol, TypeVar, Callable, Optional, Union
from dataclasses import dataclass
from functools import reduce
import math

T = TypeVar('T')
Number = Union[int, float]

# === PROTOCOLS ===

class Summable(Protocol):
    def __add__(self, other): ...

class Comparable(Protocol):
    def __lt__(self, other): ...
    def __gt__(self, other): ...

# === TYPED FUNCTIONS ===

class TypedMath:
    """Mathematical operations with full type hints."""

    @staticmethod
    def sum_list(numbers: List[Number]) -> Number:
        """Sum a list of numbers."""
        return sum(numbers)

    @staticmethod
    def product_list(numbers: List[Number]) -> Number:
        """Product of a list of numbers."""
        return reduce(lambda a, b: a * b, numbers, 1)

    @staticmethod
    def mean(numbers: List[Number]) -> float:
        """Arithmetic mean."""
        if not numbers:
            raise ValueError("Empty list")
        return sum(numbers) / len(numbers)

    @staticmethod
    def median(numbers: List[Number]) -> float:
        """Median value."""
        if not numbers:
            raise ValueError("Empty list")
        sorted_nums = sorted(numbers)
        n = len(sorted_nums)
        mid = n // 2
        return sorted_nums[mid] if n % 2 else (sorted_nums[mid - 1] + sorted_nums[mid]) / 2

    @staticmethod
    def std_dev(numbers: List[Number]) -> float:
        """Standard deviation."""
        if len(numbers) < 2:
            raise ValueError("Need at least 2 values")
        mean = TypedMath.mean(numbers)
        variance = sum((x - mean) ** 2 for x in numbers) / len(numbers)
        return math.sqrt(variance)

    @staticmethod
    def clamp(value: Number, minimum: Number, maximum: Number) -> Number:
        """Clamp value to [minimum, maximum]."""
        return max(minimum, min(value, maximum))

    @staticmethod
    def lerp(a: Number, b: Number, t: float) -> float:
        """Linear interpolation."""
        return a + (b - a) * TypedMath.clamp(t, 0.0, 1.0)

    @staticmethod
    def map_range(value: Number,
                  in_min: Number, in_max: Number,
                  out_min: Number, out_max: Number) -> float:
        """Map value from one range to another."""
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

    @staticmethod
    def gcd(a: int, b: int) -> int:
        """Greatest common divisor (Euclidean algorithm)."""
        while b:
            a, b = b, a % b
        return a

    @staticmethod
    def lcm(a: int, b: int) -> int:
        """Least common multiple."""
        return abs(a * b) // TypedMath.gcd(a, b) if a and b else 0

    @staticmethod
    def factorial(n: int) -> int:
        """Factorial with type safety."""
        if n < 0:
            raise ValueError("n must be non-negative")
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result

    @staticmethod
    def fibonacci(n: int) -> int:
        """Fibonacci with type safety."""
        if n < 0:
            raise ValueError("n must be non-negative")
        a, b = 0, 1
        for _ in range(n):
            a, b = b, a + b
        return a

    @staticmethod
    def is_prime(n: int) -> bool:
        """Primality test with type safety."""
        if n < 2:
            return False
        if n == 2:
            return True
        if n % 2 == 0:
            return False
        for i in range(3, int(math.sqrt(n)) + 1, 2):
            if n % i == 0:
                return False
        return True

    @staticmethod
    def prime_sieve(n: int) -> List[int]:
        """Generate primes up to n."""
        if n < 2:
            return []
        sieve = [True] * (n + 1)
        sieve[0] = sieve[1] = False
        for i in range(2, int(math.sqrt(n)) + 1):
            if sieve[i]:
                for j in range(i * i, n + 1, i):
                    sieve[j] = False
        return [i for i in range(2, n + 1) if sieve[i]]

    @staticmethod
    def dot_product(a: List[Number], b: List[Number]) -> Number:
        """Dot product of two vectors."""
        if len(a) != len(b):
            raise ValueError("Vectors must have same length")
        return sum(x * y for x, y in zip(a, b))

    @staticmethod
    def matrix_multiply(A: List[List[Number]],
                        B: List[List[Number]]) -> List[List[Number]]:
        """Multiply two matrices."""
        if not A or not B or len(A[0]) != len(B):
            raise ValueError("Invalid matrix dimensions")
        return [[
            sum(A[i][k] * B[k][j] for k in range(len(B)))
            for j in range(len(B[0]))
        ] for i in range(len(A))]

@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other: 'Point') -> float:
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)

    def __add__(self, other: 'Point') -> 'Point':
        return Point(self.x + other.x, self.y + other.y)

def main():
    """Main typed function library program."""
    print("=" * 50)
    print("TYPED FUNCTION LIBRARY")
    print("=" * 50)

    # Statistics
    data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    print(f"\nData: {data}")
    print(f"  Sum: {TypedMath.sum_list(data)}")
    print(f"  Product: {TypedMath.product_list(data)}")
    print(f"  Mean: {TypedMath.mean(data)}")
    print(f"  Median: {TypedMath.median(data)}")
    print(f"  Std Dev: {TypedMath.std_dev(data):.4f}")

    # Utility functions
    print(f"\nClamping:")
    print(f"  clamp(150, 0, 100) = {TypedMath.clamp(150, 0, 100)}")
    print(f"  lerp(0, 100, 0.5) = {TypedMath.lerp(0, 100, 0.5)}")
    print(f"  map_range(50, 0, 100, 0, 1) = {TypedMath.map_range(50, 0, 100, 0, 1)}")

    # Number theory
    print(f"\nNumber theory:")
    print(f"  gcd(48, 18) = {TypedMath.gcd(48, 18)}")
    print(f"  lcm(4, 6) = {TypedMath.lcm(4, 6)}")
    print(f"  factorial(5) = {TypedMath.factorial(5)}")
    print(f"  fibonacci(10) = {TypedMath.fibonacci(10)}")

    # Primes
    print(f"\nPrimes up to 50: {TypedMath.prime_sieve(50)}")
    print(f"  Is 97 prime? {TypedMath.is_prime(97)}")
    print(f"  Is 100 prime? {TypedMath.is_prime(100)}")

    # Linear algebra
    v1 = [1, 2, 3]
    v2 = [4, 5, 6]
    print(f"\nDot product {v1} · {v2} = {TypedMath.dot_product(v1, v2)}")

    A = [[1, 2], [3, 4]]
    B = [[5, 6], [7, 8]]
    print(f"Matrix A: {A}")
    print(f"Matrix B: {B}")
    print(f"A × B = {TypedMath.matrix_multiply(A, B)}")

    # Points
    p1 = Point(0, 0)
    p2 = Point(3, 4)
    print(f"\nDistance {p1} to {p2}: {p1.distance_to(p2)}")
    print(f"Sum: {p1 + p2}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 18. 4/5 correct means you have mastered advanced functions and recursion."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the two essential components of every recursive function: base case and recursive case. Write a recursive function to calculate the sum of digits of a number. What happens if you forget the base case?",
        "Q2: What is memoization and why is it necessary for recursive functions like Fibonacci? Compare the time complexity of naive recursive Fibonacci vs memoized Fibonacci. Write both versions and benchmark them for n=35.",
        "Q3: Explain why Python does not optimize tail recursion. Write a tail-recursive factorial function, then show how to convert it to iterative form. What is the trampoline pattern and when would you use it?",
        "Q4: Write a function with complete type hints that accepts a list of integers and returns a dictionary with 'mean', 'median', and 'std_dev' keys. Use Optional for cases where the list might be empty.",
        "Q5: Explain the Tower of Hanoi algorithm. How many moves are required for n disks? Write the recursive solution and explain why it is 2^n - 1 moves."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Base case: the simplest instance that can be solved directly. Recursive case: breaks the problem into smaller pieces and calls itself. def sum_digits(n): if n < 10: return n; return n % 10 + sum_digits(n // 10). Forgetting the base case causes infinite recursion → RecursionError. A2: Memoization caches function results to avoid redundant calculations. Naive Fibonacci: O(2^n) time because each call branches into two. Memoized Fibonacci: O(n) time because each value is computed once. Benchmark: n=35, naive takes ~2s, memoized takes ~0.0001s — 20000x speedup. A3: Python does not optimize tail recursion because the CPython interpreter does not implement tail call elimination. Each recursive call adds a stack frame regardless of position. Tail-recursive factorial: def fact(n, acc=1): if n <= 1: return acc; return fact(n-1, n*acc). Iterative conversion: def fact_iter(n): result = 1; for i in range(2, n+1): result *= i; return result. Trampoline pattern: wrap recursive calls in objects and iterate in a loop, avoiding stack growth. Use for very deep recursion where you cannot convert to iteration easily. A4: from typing import List, Dict, Optional; def analyze(numbers: List[int]) -> Optional[Dict[str, float]]: if not numbers: return None; sorted_nums = sorted(numbers); n = len(numbers); mean = sum(numbers)/n; median = sorted_nums[n//2] if n%2 else (sorted_nums[n//2-1] + sorted_nums[n//2])/2; variance = sum((x-mean)**2 for x in numbers)/n; return {'mean': mean, 'median': median, 'std_dev': variance**0.5}. A5: Tower of Hanoi: move n disks from source to target using auxiliary. Base case: move 1 disk. Recursive: move n-1 to auxiliary, move largest to target, move n-1 to target. Moves: T(n) = 2T(n-1) + 1 = 2^n - 1. For n=3: 7 moves. For n=64: 18,446,744,073,709,551,615 moves (legend says the world will end when monks finish this)."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered advanced functions and recursion. You understand the anatomy of recursion — base case and recursive case — and write recursive functions with confidence. You know Python's recursion limit and how to work around it with iteration, explicit stacks, and generators. You transform exponential-time algorithms into linear-time powerhouses with memoization, both manual and automatic via lru_cache. You understand Python's tail recursion limitation and apply the trampoline pattern when needed. You write self-documenting, error-resistant code with type hints — using generics, protocols, type aliases, and literal types. You have built four complete programs: the Tower of Hanoi with ASCII visualization, Fibonacci with six implementations and performance comparison, a recursive directory tree walker with statistics, and a fully typed mathematical function library. Recursion is no longer a mystery. It is a precision instrument for breaking complex problems into elegant, self-referential solutions."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Recursion breaks problems into smaller versions of themselves. Base cases stop the descent. Memoization eliminates redundant work. Python's stack has limits — know them. Type hints make functions self-documenting. Master these five truths, and you have mastered advanced functions and recursion. In Part 18, we will explore Lambda & Functional Programming — anonymous functions, map/filter/reduce, and the elegant world of function composition."
    },
    {
      "type": "cta",
      "text": "Start Part 18: Lambda & Functional Programming →",
      "href": "/tutorials/python-unlocked/part-18-lambda-functional",
      "note": "22 min read · Lambda · map/filter/reduce · sorted with key · functools.partial"
    }
  ]
};

export default post;
