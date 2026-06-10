const post = {
  "slug": "part-15-for-while-loops",
  "seriesSlug": "python-unlocked",
  "partNumber": 15,
  "totalParts": 30,
  "title": "For & While Loops: The Heartbeat of Iteration (Part 15)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "24 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "for vs while: when to use which. break, continue, else clause on loops (the hidden gem). Nested loops and complexity. Programs: Fibonacci, prime sieve, number pyramid, guessing game with else.",
  "coverEmoji": "🔄",
  "tags": [
    "Python", "For Loops", "While Loops", "break",
    "continue", "else", "Nested Loops", "Complexity",
    "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1945, Konrad Zuse built the Z3, the world's first programmable computer. It had no for loop, no while loop, no break or continue. Programs were sequences of arithmetic operations, manually fed on punched film. Eighty-one years later, in 2026, Python loops are the heartbeat of every program. But here is what most tutorials miss: Python's loop system is not just for item in items. It is a rich control structure with an else clause that executes when the loop completes normally — a feature so subtle it has been called 'the hidden gem of Python.' The choice between for and while is not arbitrary. break and continue are not just escape hatches. Nested loops have complexity implications that can destroy performance. In this part, we will explore the full depth of Python's loop machinery. You will learn when to use for versus while, how the else clause eliminates flag variables, why break and continue have different psychological costs, and how to write structures cleanly without arrow code logic."
    },
    {
      "type": "h2",
      "text": "for vs while: When to Use Which"
    },
    {
      "type": "p",
      "text": "The choice between for and while is not about syntax preference. It is about the nature of the iteration. Use for when you know the iteration count in advance or are iterating over a collection. Use while when the termination condition depends on runtime state that changes during the loop. The rule is simple: for iterates over known sequences; while iterates until a condition is met."
    },
    {
      "type": "code-block",
      "label": "for vs while",
      "code": `# === for LOOP ===
# Use when iterating over a known sequence or countable range

# Iterate over a list
fruits = ['apple', 'banana', 'cherry']
for fruit in fruits:
    print(f"Fruit: {fruit}")

# Iterate over a range
print(f"\nCounting:")
for i in range(5):
    print(f"  {i}")

# Iterate over a string
print(f"\nCharacters:")
for char in 'Python':
    print(f"  {char}")

# Iterate over a dictionary
user = {'name': 'Alice', 'age': 30, 'city': 'NYC'}
print(f"\nDictionary items:")
for key, value in user.items():
    print(f"  {key}: {value}")

# === while LOOP ===
# Use when the termination condition depends on runtime state

# User input validation
print(f"\nInput validation:")
attempts = 0
while attempts < 3:
    # Simulated input
    password = 'secret123' if attempts == 1 else 'wrong'
    if password == 'secret123':
        print("  Access granted!")
        break
    print(f"  Attempt {attempts + 1} failed")
    attempts += 1

# Game loop
print(f"\nGame loop simulation:")
health = 100
while health > 0:
    damage = 25  # Simulated
    health -= damage
    print(f"  Health: {health}")
    if health <= 0:
        print("  Game Over!")

# Reading until sentinel value
print(f"\nReading until sentinel:")
data = []
values = [10, 20, 30, -1, 40]  # Simulated input stream
idx = 0
while True:
    value = values[idx]
    idx += 1
    if value == -1:
        break
    data.append(value)
print(f"  Collected: {data}")

# === THE CONVERSION TRAP ===
# Don't convert while to for when state matters

# BAD: for with manual state tracking
# for i in range(100):
#     if some_condition():
#         i += 5  # Doesn't work! for controls i

# GOOD: while with explicit state
# i = 0
# while i < 100:
#     if some_condition():
#         i += 5
#     else:
#         i += 1

# === ITERATING WITH MODIFICATION ===
# for is safe for reading; while is needed for complex modification

# Safe: for to read
numbers = [1, 2, 3, 4, 5]
for n in numbers:
    print(f"  {n * 2}")

# Caution: modifying while iterating
numbers = [1, 2, 3, 4, 5, 6]
i = 0
while i < len(numbers):
    if numbers[i] % 2 == 0:
        numbers.pop(i)  # Remove even numbers
    else:
        i += 1
print(f"\nAfter removing evens: {numbers}")

print("\nfor vs while mastery complete!")`
    },
    {
      "type": "h2",
      "text": "break & continue: The Escape Hatches"
    },
    {
      "type": "p",
      "text": "break exits the loop immediately. continue skips the rest of the current iteration and moves to the next. These are not just control flow tools — they have psychological costs. break creates multiple exit points, which can make loops harder to reason about. continue creates hidden paths through the loop body. The rule: use them sparingly, use them intentionally, and always prefer the else clause over flag variables."
    },
    {
      "type": "code-block",
      "label": "break & continue Mastery",
      "code": `# === break ===
# Exit the loop immediately

# Find first match
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
for n in numbers:
    if n > 5:
        print(f"First number > 5: {n}")
        break

# Search with early exit
users = ['Alice', 'Bob', 'Charlie', 'Diana']
target = 'Charlie'
for user in users:
    if user == target:
        print(f"\nFound {target}!")
        break

# === continue ===
# Skip to next iteration

# Process only odd numbers
print(f"\nOdd numbers only:")
for n in range(10):
    if n % 2 == 0:
        continue
    print(f"  {n}")

# Skip invalid data
print(f"\nValid data only:")
data = [10, -5, 20, 'invalid', 30, None, 40]
for item in data:
    if not isinstance(item, (int, float)) or item < 0:
        continue
    print(f"  Processing: {item}")

# === MULTIPLE break CONDITIONS ===
# The 'arrow code' problem

def process_items_bad(items):
    for item in items:
        if item is not None:
            if isinstance(item, dict):
                if 'value' in item:
                    if item['value'] > 0:
                        print(f"  Valid: {item}")

# Better: flatten with continue
def process_items_good(items):
    for item in items:
        if item is None:
            continue
        if not isinstance(item, dict):
            continue
        if 'value' not in item:
            continue
        if item['value'] <= 0:
            continue
        print(f"  Valid: {item}")

items = [None, {'value': 10}, 'string', {'value': -5}, {'other': 1}]
print(f"\nProcessing with continue:")
process_items_good(items)

# === break vs continue PSYCHOLOGY ===
# break: 'I found what I need, stop looking'
# continue: 'This one is wrong, try the next'

# break is for search (early exit)
# continue is for filtering (skip and continue)

# === THE break/continue TRAP ===
# Using continue when you should use a guard clause

# AVOID: continue in the middle of logic
for item in items:
    if item is None:
        continue
    # 50 lines of processing
    # ...
    # Hard to trace what happened above

# PREFER: extract to function with early return
def process_single(item):
    if item is None:
        return
    # 50 lines of processing
    # ...

for item in items:
    process_single(item)

print("\nbreak & continue mastery complete!")`
    },
    {
      "type": "h2",
      "text": "The else Clause: The Hidden Gem"
    },
    {
      "type": "p",
      "text": "The else clause on a for or while loop executes when the loop completes normally — that is, when it does NOT encounter a break. This is the most misunderstood feature in Python. It is not equivalent to putting code after the loop. It is specifically for the 'nobody broke out' case. Use it to eliminate flag variables and make search logic crystal clear."
    },
    {
      "type": "code-block",
      "label": "The else Clause Mastery",
      "code": `# === THE else CLAUSE ===
# Executes if the loop completed WITHOUT break

# --- Search with else (the classic pattern) ---

def find_prime_bad(n):
    """Find if n is prime using flag variable (BAD)."""
    is_prime = True
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        print(f"{n} is prime")
    else:
        print(f"{n} is not prime")

def find_prime_good(n):
    """Find if n is prime using else (GOOD)."""
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            print(f"{n} is not prime (divisible by {i})")
            break
    else:
        print(f"{n} is prime")

print("Prime checks:")
find_prime_good(17)
find_prime_good(18)

# --- Search in list with else ---

def search_list(items, target):
    """Search for target, handle not found with else."""
    for item in items:
        if item == target:
            print(f"Found {target}!")
            break
    else:
        print(f"{target} not found in list")

items = ['apple', 'banana', 'cherry']
search_list(items, 'banana')
search_list(items, 'grape')

# --- while loop with else ---

def countdown_with_else(n):
    """Countdown with else for completion."""
    while n > 0:
        print(f"  {n}...")
        n -= 1
    else:
        print("  Blast off!")

print(f"\nCountdown:")
countdown_with_else(3)

# --- else with break (not executed) ---

def countdown_with_break(n):
    """Countdown that might abort."""
    while n > 0:
        print(f"  {n}...")
        if n == 2:
            print("  ABORT!")
            break
        n -= 1
    else:
        print("  Blast off!")

print(f"\nCountdown with abort:")
countdown_with_break(3)

# --- Nested loops with else ---
# else belongs to the innermost loop

def find_pair_with_sum(numbers, target):
    """Find two numbers that sum to target."""
    for i, a in enumerate(numbers):
        for b in numbers[i+1:]:
            if a + b == target:
                print(f"Found: {a} + {b} = {target}")
                break
        else:
            continue  # Only executed if inner loop didn't break
        break  # Only executed if inner loop DID break
    else:
        print(f"No pair sums to {target}")

numbers = [1, 2, 3, 4, 5, 6]
print(f"\nFind pair with sum 7:")
find_pair_with_sum(numbers, 7)

print(f"\nFind pair with sum 100:")
find_pair_with_sum(numbers, 100)

# --- else with for and empty sequence ---
# else executes even if the sequence is empty!

def check_all_positive(numbers):
    for n in numbers:
        if n <= 0:
            print(f"Found non-positive: {n}")
            break
    else:
        print("All numbers are positive")

print(f"\nEmpty list check:")
check_all_positive([])  # 'All numbers are positive' (vacuous truth)

print("\nelse clause mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Nested Loops and Complexity Analysis"
    },
    {
      "type": "p",
      "text": "Nested loops multiply complexity. Two nested loops over n items each create O(n²) operations. Three nested loops create O(n³). This is not just theoretical — it is the difference between a program that finishes in milliseconds and one that runs for years. Understanding loop complexity means you can spot performance bottlenecks before they destroy your system."
    },
    {
      "type": "code-block",
      "label": "Nested Loops & Complexity",
      "code": `# === NESTED LOOP COMPLEXITY ===

import time

# O(n) - single loop
def linear(n):
    count = 0
    for i in range(n):
        count += 1
    return count

# O(n²) - two nested loops
def quadratic(n):
    count = 0
    for i in range(n):
        for j in range(n):
            count += 1
    return count

# O(n³) - three nested loops
def cubic(n):
    count = 0
    for i in range(n):
        for j in range(n):
            for k in range(n):
                count += 1
    return count

# Benchmark
print("Complexity benchmarks:")
for n in [100, 500, 1000]:
    start = time.perf_counter()
    linear(n)
    t1 = time.perf_counter() - start

    start = time.perf_counter()
    quadratic(n)
    t2 = time.perf_counter() - start

    print(f"  n={n:4d}: O(n)={t1:.6f}s, O(n²)={t2:.6f}s, ratio={t2/t1:.0f}x")

# === OPTIMIZING NESTED LOOPS ===
# Use sets for O(1) lookup instead of nested loops

def find_common_bad(list1, list2):
    """O(n²) nested loop approach."""
    common = []
    for a in list1:
        for b in list2:
            if a == b:
                common.append(a)
    return common

def find_common_good(list1, list2):
    """O(n) set intersection approach."""
    return list(set(list1) & set(list2))

list1 = list(range(1000))
list2 = list(range(500, 1500))

start = time.perf_counter()
find_common_bad(list1, list2)
t_bad = time.perf_counter() - start

start = time.perf_counter()
find_common_good(list1, list2)
t_good = time.perf_counter() - start

print(f"\nFind common elements:")
print(f"  Nested loop O(n²): {t_bad:.6f}s")
print(f"  Set intersection O(n): {t_good:.6f}s")
print(f"  Speedup: {t_bad/t_good:.0f}x")

# === EARLY EXIT OPTIMIZATION ===
# Break early when possible

def has_duplicate_bad(items):
    """O(n²) - checks all pairs."""
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False

def has_duplicate_good(items):
    """O(n) - uses set."""
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False

items = list(range(10000)) + [42]  # 42 is duplicated

start = time.perf_counter()
has_duplicate_bad(items)
t_bad = time.perf_counter() - start

start = time.perf_counter()
has_duplicate_good(items)
t_good = time.perf_counter() - start

print(f"\nDuplicate detection:")
print(f"  Nested loop: {t_bad:.6f}s")
print(f"  Set approach: {t_good:.6f}s")
print(f"  Speedup: {t_bad/t_good:.0f}x")

# === LOOP UNROLLING (Python) ===
# Process multiple items per iteration

def sum_pairs(numbers):
    """Sum adjacent pairs."""
    total = 0
    for i in range(0, len(numbers) - 1, 2):
        total += numbers[i] + numbers[i + 1]
    return total

nums = list(range(1000000))
start = time.perf_counter()
sum_pairs(nums)
print(f"\nPair sum: {time.perf_counter() - start:.6f}s")

# === THE LOOP VARIABLE LEAK ===
# In Python, loop variables leak into the enclosing scope!

for i in range(5):
    pass
print(f"\nLoop variable leak: i = {i}")  # i = 4 (last value)

# This can cause bugs in comprehensions
# i = 100
# [i for i in range(5)]  # i is now 4, not 100!

print("\nNested loops & complexity mastery complete!")`
    },
    {
      "type": "programs",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use for loops, while loops, break, continue, the else clause, and nested loops to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Fibonacci Sequence",
      "code": `"""
Program 1: Fibonacci Sequence
Generates Fibonacci numbers using multiple approaches.
Demonstrates for, while, and generator patterns.
"""

class Fibonacci:
    """Fibonacci sequence generators."""

    @staticmethod
    def generate_for(n):
        """Generate first n Fibonacci numbers using for."""
        if n <= 0:
            return []
        if n == 1:
            return [0]

        fibs = [0, 1]
        for _ in range(2, n):
            fibs.append(fibs[-1] + fibs[-2])
        return fibs

    @staticmethod
    def generate_while(max_value):
        """Generate Fibonacci numbers up to max_value using while."""
        fibs = []
        a, b = 0, 1
        while a <= max_value:
            fibs.append(a)
            a, b = b, a + b
        return fibs

    @staticmethod
    def generator():
        """Infinite Fibonacci generator."""
        a, b = 0, 1
        while True:
            yield a
            a, b = b, a + b

    @staticmethod
    def find_index(target):
        """Find index of target in Fibonacci sequence."""
        a, b = 0, 1
        index = 0
        while a < target:
            a, b = b, a + b
            index += 1
        if a == target:
            return index
        return -1

    @staticmethod
    def is_fibonacci(n):
        """Check if n is a Fibonacci number."""
        a, b = 0, 1
        while a < n:
            a, b = b, a + b
        return a == n

    @staticmethod
    def golden_ratio_approximation(n):
        """Approximate golden ratio using Fibonacci."""
        fibs = Fibonacci.generate_for(n + 1)
        return fibs[-1] / fibs[-2] if len(fibs) >= 2 else 0

def main():
    """Main Fibonacci program."""
    print("=" * 50)
    print("FIBONACCI SEQUENCE")
    print("=" * 50)

    # Generate first 20
    fibs = Fibonacci.generate_for(20)
    print(f"\nFirst 20 Fibonacci numbers:")
    for i, f in enumerate(fibs, 1):
        print(f"  F({i}) = {f}")

    # Generate up to 1000
    fibs_limit = Fibonacci.generate_while(1000)
    print(f"\nFibonacci numbers <= 1000: {fibs_limit}")

    # Generator
    gen = Fibonacci.generator()
    print(f"\nFirst 10 from generator:")
    for _ in range(10):
        print(f"  {next(gen)}")

    # Find index
    target = 144
    idx = Fibonacci.find_index(target)
    print(f"\nIndex of {target}: {idx}")

    # Check membership
    tests = [13, 14, 21, 22]
    print(f"\nFibonacci checks:")
    for t in tests:
        result = "yes" if Fibonacci.is_fibonacci(t) else "no"
        print(f"  {t}: {result}")

    # Golden ratio approximation
    for n in [10, 20, 30, 40]:
        ratio = Fibonacci.golden_ratio_approximation(n)
        print(f"\nGolden ratio approx (n={n}): {ratio:.10f}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Prime Number Sieve",
      "code": `"""
Program 2: Prime Number Sieve
Sieve of Eratosthenes with optimizations.
Demonstrates for loops, while loops, and break/continue.
"""

import time
import math

class PrimeSieve:
    """Optimized prime number sieve."""

    @staticmethod
    def basic_sieve(n):
        """
        Basic Sieve of Eratosthenes.
        Time: O(n log log n), Space: O(n)
        """
        if n < 2:
            return []

        is_prime = [True] * (n + 1)
        is_prime[0] = is_prime[1] = False

        for i in range(2, int(math.sqrt(n)) + 1):
            if is_prime[i]:
                for j in range(i * i, n + 1, i):
                    is_prime[j] = False

        return [i for i in range(2, n + 1) if is_prime[i]]

    @staticmethod
    def optimized_sieve(n):
        """
        Optimized: skip even numbers, use slice assignment.
        """
        if n < 2:
            return []
        if n == 2:
            return [2]

        # Only track odd numbers: index i represents 2i + 3
        size = (n - 1) // 2
        is_prime = [True] * size

        for i in range(size):
            p = 2 * i + 3
            if p * p > n:
                break
            if is_prime[i]:
                # Mark multiples starting at p*p
                start = (p * p - 3) // 2
                step = p
                for j in range(start, size, step):
                    is_prime[j] = False

        primes = [2]
        primes.extend(2 * i + 3 for i, val in enumerate(is_prime) if val)
        return [p for p in primes if p <= n]

    @staticmethod
    def segmented_sieve(n):
        """
        Segmented sieve for very large n.
        Memory efficient: only stores segment.
        """
        if n < 2:
            return []

        limit = int(math.sqrt(n)) + 1
        base_primes = PrimeSieve.optimized_sieve(limit)

        segment_size = min(limit, 32768)
        primes = []

        for low in range(0, n + 1, segment_size):
            high = min(low + segment_size - 1, n)
            sieve = [True] * (high - low + 1)

            for p in base_primes:
                start = max(p * p, ((low + p - 1) // p) * p)
                for j in range(start, high + 1, p):
                    sieve[j - low] = False

            for i in range(len(sieve)):
                if sieve[i]:
                    num = low + i
                    if num >= 2:
                        primes.append(num)

        return primes

    @staticmethod
    def is_prime(n):
        """Trial division primality test."""
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
    def twin_primes(n):
        """Find twin primes (pairs differing by 2)."""
        primes = set(PrimeSieve.basic_sieve(n))
        twins = [(p, p + 2) for p in primes if p + 2 in primes]
        return twins

    @staticmethod
    def prime_factors(n):
        """Find prime factorization."""
        factors = []
        d = 2
        while d * d <= n:
            while n % d == 0:
                factors.append(d)
                n //= d
            d += 1
        if n > 1:
            factors.append(n)
        return factors

def main():
    """Main prime sieve program."""
    print("=" * 50)
    print("PRIME NUMBER SIEVE")
    print("=" * 50)

    n = 100

    # Basic sieve
    start = time.perf_counter()
    primes_basic = PrimeSieve.basic_sieve(n)
    t_basic = time.perf_counter() - start

    print(f"\nPrimes up to {n}: {primes_basic}")
    print(f"Count: {len(primes_basic)}")
    print(f"Basic sieve time: {t_basic:.6f}s")

    # Optimized sieve
    start = time.perf_counter()
    primes_opt = PrimeSieve.optimized_sieve(n)
    t_opt = time.perf_counter() - start

    print(f"\nOptimized sieve time: {t_opt:.6f}s")

    # Large test
    n_large = 1000000
    start = time.perf_counter()
    primes_large = PrimeSieve.optimized_sieve(n_large)
    t_large = time.perf_counter() - start

    print(f"\nPrimes up to {n_large}: {len(primes_large)} primes")
    print(f"Time: {t_large:.4f}s")

    # Twin primes
    twins = PrimeSieve.twin_primes(100)
    print(f"\nTwin primes up to 100: {twins}")

    # Prime factors
    print(f"\nPrime factorizations:")
    for num in [360, 97, 1001]:
        factors = PrimeSieve.prime_factors(num)
        print(f"  {num} = {' x '.join(map(str, factors))}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Number Pyramid",
      "code": `"""
Program 3: Number Pyramid
Generates number patterns and pyramids using nested loops.
Demonstrates nested loops, formatting, and pattern generation.
"""

class NumberPyramid:
    """Generate number patterns and pyramids."""

    @staticmethod
    def pyramid(n):
        """Generate centered number pyramid."""
        for i in range(1, n + 1):
            spaces = ' ' * (n - i)
            numbers = ' '.join(str(j) for j in range(1, i + 1))
            print(f"{spaces}{numbers}")

    @staticmethod
    def inverted_pyramid(n):
        """Generate inverted pyramid."""
        for i in range(n, 0, -1):
            spaces = ' ' * (n - i)
            numbers = ' '.join(str(j) for j in range(1, i + 1))
            print(f"{spaces}{numbers}")

    @staticmethod
    def diamond(n):
        """Generate diamond pattern."""
        # Upper half
        for i in range(1, n + 1):
            spaces = ' ' * (n - i)
            numbers = ' '.join(str(j) for j in range(1, i + 1))
            print(f"{spaces}{numbers}")
        # Lower half
        for i in range(n - 1, 0, -1):
            spaces = ' ' * (n - i)
            numbers = ' '.join(str(j) for j in range(1, i + 1))
            print(f"{spaces}{numbers}")

    @staticmethod
    def pascal_triangle(n):
        """Generate Pascal's triangle."""
        triangle = [[1]]
        for i in range(1, n):
            row = [1]
            for j in range(1, i):
                row.append(triangle[i-1][j-1] + triangle[i-1][j])
            row.append(1)
            triangle.append(row)

        # Print centered
        max_width = len(' '.join(map(str, triangle[-1])))
        for row in triangle:
            row_str = ' '.join(map(str, row))
            padding = ' ' * ((max_width - len(row_str)) // 2)
            print(f"{padding}{row_str}")

    @staticmethod
    def multiplication_triangle(n):
        """Generate multiplication triangle."""
        for i in range(1, n + 1):
            row = []
            for j in range(1, i + 1):
                row.append(f"{j}x{i}={i*j}")
            print('  '.join(row))

    @staticmethod
    def spiral_matrix(n):
        """Generate n x n spiral matrix."""
        matrix = [[0] * n for _ in range(n)]
        num = 1
        top, bottom = 0, n - 1
        left, right = 0, n - 1

        while num <= n * n:
            # Left to right
            for i in range(left, right + 1):
                matrix[top][i] = num
                num += 1
            top += 1

            # Top to bottom
            for i in range(top, bottom + 1):
                matrix[i][right] = num
                num += 1
            right -= 1

            # Right to left
            for i in range(right, left - 1, -1):
                matrix[bottom][i] = num
                num += 1
            bottom -= 1

            # Bottom to top
            for i in range(bottom, top - 1, -1):
                matrix[i][left] = num
                num += 1
            left += 1

        return matrix

    @staticmethod
    def print_matrix(matrix):
        """Print a 2D matrix."""
        width = max(len(str(x)) for row in matrix for x in row) + 1
        for row in matrix:
            print(''.join(f"{x:>{width}d}" for x in row))

def main():
    """Main pyramid program."""
    print("=" * 50)
    print("NUMBER PYRAMID")
    print("=" * 50)

    print("\nPyramid (n=5):")
    NumberPyramid.pyramid(5)

    print("\nInverted Pyramid (n=5):")
    NumberPyramid.inverted_pyramid(5)

    print("\nDiamond (n=5):")
    NumberPyramid.diamond(5)

    print("\nPascal's Triangle (n=7):")
    NumberPyramid.pascal_triangle(7)

    print("\nMultiplication Triangle (n=5):")
    NumberPyramid.multiplication_triangle(5)

    print("\nSpiral Matrix (n=5):")
    spiral = NumberPyramid.spiral_matrix(5)
    NumberPyramid.print_matrix(spiral)

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Guessing Game with else",
      "code": `"""
Program 4: Guessing Game with else
Interactive number guessing game demonstrating loop else clause.
Demonstrates while, break, else, and state management.
"""

import random

class GuessingGame:
    """Number guessing game with difficulty levels."""

    def __init__(self):
        self.secret = 0
        self.attempts = 0
        self.max_attempts = 0
        self.history = []

    def setup(self, min_val=1, max_val=100, max_attempts=7):
        """Configure game parameters."""
        self.secret = random.randint(min_val, max_val)
        self.attempts = 0
        self.max_attempts = max_attempts
        self.history = []
        self.min_val = min_val
        self.max_val = max_val
        return self

    def get_hint(self):
        """Provide a hint based on remaining attempts."""
        remaining = self.max_attempts - self.attempts
        if remaining <= 2:
            return "Critical! Think carefully..."
        elif remaining <= 4:
            return "Getting warm..."
        return "Plenty of attempts left."

    def play(self, guess_source=None):
        """
        Play the game.
        guess_source: callable that returns guesses, or None for simulation
        """
        print(f"\nI'm thinking of a number between {self.min_val} and {self.max_val}.")
        print(f"You have {self.max_attempts} attempts.")

        # Simulate guesses if no source provided
        if guess_source is None:
            # Smart simulation: binary search
            guess_source = self._binary_search_simulator()

        while self.attempts < self.max_attempts:
            self.attempts += 1
            guess = next(guess_source)
            self.history.append(guess)

            print(f"\nAttempt {self.attempts}/{self.max_attempts}: {guess}")

            if guess < self.secret:
                print(f"  Too low! {self.get_hint()}")
            elif guess > self.secret:
                print(f"  Too high! {self.get_hint()}")
            else:
                print(f"  🎉 CORRECT! You found it in {self.attempts} attempts!")
                self._celebrate()
                break
        else:
            # This else executes ONLY if the loop completed without break
            print(f"\n😢 Game Over! The number was {self.secret}.")
            print(f"Your guesses: {self.history}")

    def _binary_search_simulator(self):
        """Simulate binary search strategy."""
        low, high = self.min_val, self.max_val
        while True:
            guess = (low + high) // 2
            yield guess
            if guess < self.secret:
                low = guess + 1
            elif guess > self.secret:
                high = guess - 1
            # If correct, generator stops being called

    def _celebrate(self):
        """Victory celebration."""
        if self.attempts <= 3:
            print("  🏆 Amazing! You read my mind!")
        elif self.attempts <= 5:
            print("  ⭐ Great job! Very efficient!")
        else:
            print("  👍 Good persistence!")

    def play_multiple(self, rounds=3):
        """Play multiple rounds with scoring."""
        scores = []
        for round_num in range(1, rounds + 1):
            print(f"\n{'='*30}")
            print(f"ROUND {round_num}/{rounds}")
            print(f"{'='*30}")
            self.setup()
            self.play()
            scores.append(self.attempts if self.attempts <= self.max_attempts else self.max_attempts + 1)

        avg_score = sum(scores) / len(scores)
        print(f"\n\nGame Over! Average attempts: {avg_score:.1f}")

def main():
    """Main guessing game program."""
    print("=" * 50)
    print("GUESSING GAME WITH else")
    print("=" * 50)

    game = GuessingGame()

    # Single game with binary search simulation
    print("\n--- Single Game (Binary Search Strategy) ---")
    game.setup(1, 100, 7)
    game.play()

    # Multiple rounds
    print("\n\n--- Multiple Rounds ---")
    game.play_multiple(3)

    # Demonstrate the else clause explicitly
    print("\n\n--- else Clause Demonstration ---")
    print("Playing with only 1 attempt (guaranteed to lose):")
    game.setup(1, 1000, 1)
    game.play()

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 16. 4/5 correct means you have mastered loops."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the difference between for and while loops. When should you use each? Write a function that uses a while loop to find the smallest power of 2 greater than a given number. Then rewrite it using a for loop with break. Which is more appropriate and why?",
        "Q2: What is the else clause on a loop? Write a function that searches for a prime number in a list using a for loop with else. Explain why the else clause is better than a flag variable. What happens if the list is empty?",
        "Q3: Explain the difference between break and continue. Write a function that processes a list of numbers, skipping negatives with continue and stopping at the first number greater than 100 with break. What is the psychological difference between these two operations?",
        "Q4: Analyze the time complexity of a nested loop that finds all pairs in a list that sum to a target. Write an optimized version using a set that reduces complexity from O(n²) to O(n). Benchmark both versions.",
        "Q5: Write a function that generates the first n Fibonacci numbers using a for loop. Then write a generator version using while True and yield. Explain the memory difference between these two approaches."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: for iterates over known sequences; while iterates until a condition is met. def smallest_power_of_2(n): power = 1; while power <= n: power *= 2; return power. The while version is more appropriate because the number of iterations is unknown — it depends on the input value. A for loop with break would require an arbitrary upper bound: for i in range(100): power = 2**i; if power > n: return power; break. This is less clear and has an artificial limit. A2: The else clause executes when the loop completes normally (without break). def find_prime(numbers): for n in numbers: if is_prime(n): print(f'Found {n}'); break; else: print('No prime found'). Better than flags because it eliminates the flag variable and makes the logic structure explicit. If the list is empty, the else clause executes (vacuous truth: no element broke out). A3: break exits the loop immediately; continue skips to the next iteration. break is for search ('I found it, stop'); continue is for filtering ('This one is wrong, skip'). Psychological difference: break creates a clear exit point; continue creates a hidden path that makes the loop body harder to trace. A4: Nested loop: for i in range(n): for j in range(i+1, n): if lst[i] + lst[j] == target: return True. This is O(n²). Optimized: seen = set(); for num in lst: if target - num in seen: return True; seen.add(num). This is O(n) because set lookup is O(1). Benchmark: for n=10000, O(n²) takes ~10s, O(n) takes ~0.001s — 10000x speedup. A5: For loop: def fib_for(n): fibs = [0, 1]; for _ in range(2, n): fibs.append(fibs[-1] + fibs[-2]); return fibs. Generator: def fib_gen(): a, b = 0, 1; while True: yield a; a, b = b, a + b. Memory difference: the for loop stores all n Fibonacci numbers in memory (O(n) space). The generator yields one number at a time (O(1) space). For n=1,000,000, the list uses ~8MB; the generator uses 48 bytes."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python's loop machinery. You understand when to use for (known sequences) versus while (state-dependent termination). You wield break and continue with intention, knowing their psychological costs and when to prefer guard clauses. You exploit the else clause to eliminate flag variables and make search logic crystal clear. You analyze nested loop complexity, spotting O(n²) bottlenecks and optimizing them to O(n) with sets. You know the loop variable leak trap and how to avoid it. You have built four complete programs: a Fibonacci generator with multiple approaches, an optimized prime number sieve with segmented processing, a number pyramid generator with spiral matrices, and a guessing game that demonstrates the else clause in action. Loops are no longer just mechanical repetition. They are the heartbeat of program flow — controlled, optimized, and elegant."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: for iterates over known sequences. while iterates until a condition is met. break exits early. continue skips ahead. else executes when nobody broke out. Nested loops multiply complexity. Master these six truths, and you have mastered the heartbeat of Python iteration. In Part 16, we will explore Functions — The Building Blocks: defining, calling, returning, parameters, arguments, scope, and first-class functions."
    },
    {
      "type": "cta",
      "text": "Start Part 16: Functions — The Building Blocks →",
      "href": "/tutorials/python-unlocked/part-16-functions",
      "note": "26 min read · Defining · Parameters · Scope · First-class functions"
    }
  ]
};

export default post;
