const post = {
  "slug": "part-14-range-enumerate-zip",
  "seriesSlug": "python-unlocked",
  "partNumber": 14,
  "totalParts": 30,
  "title": "Range, Enumerate, Zip & Iteration Tools: Lazy Iteration Mastery (Part 14)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "20 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Lazy evaluation, memory efficiency. enumerate, zip, zip_longest. map, filter. itertools preview: cycle, chain, product, permutations. Four complete programs.",
  "coverEmoji": "🔄",
  "tags": [
    "Python", "Range", "Enumerate", "Zip",
    "Lazy Evaluation", "itertools", "map", "filter",
    "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1976, computer scientist John Backus introduced the concept of lazy evaluation in his Turing Award lecture. He argued that computation should only happen when results are needed, not when they are declared. Fifty years later, in 2026, Python embodies that philosophy through its iteration tools. range does not create a list — it generates numbers on demand. enumerate does not copy your data — it wraps your iterator with an index. zip does not build tuples in memory — it yields them as you iterate. These are not just conveniences. They are the difference between a program that handles millions of items and one that crashes with a MemoryError. In this part, we will explore the full depth of Python's lazy iteration toolkit. You will learn why range is not a list, how enumerate eliminates manual index tracking, why zip stops at the shortest sequence (and how zip_longest fixes that), and how itertools transforms iteration from a loop into a combinatorial algebra. By the end, iteration will not be a for loop. It will be a precision instrument."
    },
    {
      "type": "h2",
      "text": "range: Lazy Sequences That Scale to Infinity"
    },
    {
      "type": "p",
      "text": "range is Python's most misunderstood built-in. It is not a list. It is not a tuple. It is a lazy sequence object that generates integers on demand. This means range(1000000000) uses the same memory as range(10) — about 48 bytes. The numbers are computed only when you iterate, index, or call len(). Understanding this distinction is the foundation of memory-efficient Python."
    },
    {
      "type": "code-block",
      "label": "range Mastery",
      "code": `# === range IS NOT A LIST ===
# It is a lazy sequence object

r = range(10)
print(f"range(10): {r}")
print(f"type: {type(r).__name__}")
print(f"repr: {repr(r)}")

# --- Memory efficiency ---
import sys

print(f"\nMemory comparison:")
print(f"  range(10) size:       {sys.getsizeof(range(10))} bytes")
print(f"  range(1000000) size:  {sys.getsizeof(range(1000000))} bytes")
print(f"  list(range(10)) size: {sys.getsizeof(list(range(10)))} bytes")
print(f"  list(range(1M)) size: {sys.getsizeof(list(range(1000000)))} bytes")

# --- range supports indexing and slicing ---

r = range(0, 100, 2)
print(f"\nrange(0, 100, 2):")
print(f"  r[0] = {r[0]}")
print(f"  r[10] = {r[10]}")
print(f"  r[-1] = {r[-1]}")
print(f"  r[5:10] = {r[5:10]}")
print(f"  len(r) = {len(r)}")

# --- range supports membership testing ---

print(f"\n50 in r: {50 in r}")
print(f"51 in r: {51 in r}")

# --- range is reversible ---

print(f"\nreversed(r)[:5]: {list(reversed(r))[:5]}")

# --- range with negative step ---

countdown = range(10, 0, -1)
print(f"\nCountdown: {list(countdown)}")

# --- range for iteration (the right way) ---
# Never convert to list unless you absolutely need it

# WRONG: Wastes memory
# for i in list(range(1000000)):
#     pass

# CORRECT: Lazy iteration
# for i in range(1000000):
#     pass

# --- range in list comprehensions ---

squares = [x**2 for x in range(10)]
print(f"\nSquares: {squares}")

# --- range with start, stop, step ---
# range(start, stop, step)

print(f"\nrange(5, 50, 5): {list(range(5, 50, 5))}")
print(f"range(10, -1, -2): {list(range(10, -1, -2))}")

# --- range equality ---
# Two ranges are equal if they produce the same sequence

print(f"\nrange(0, 10, 2) == range(0, 11, 2): {range(0, 10, 2) == range(0, 11, 2)}")
print(f"range(0, 10, 2) == range(0, 10, 3): {range(0, 10, 2) == range(0, 10, 3)}")

# --- range for pagination ---

def paginate(total_items, page_size):
    """Generate page ranges for pagination."""
    for start in range(0, total_items, page_size):
        end = min(start + page_size, total_items)
        yield range(start, end)

print(f"\nPagination (23 items, size 5):")
for i, page in enumerate(paginate(23, 5), 1):
    print(f"  Page {i}: {list(page)}")

print("\nrange mastery complete!")`
    },
    {
      "type": "h2",
      "text": "enumerate: Index + Value Without the Pain"
    },
    {
      "type": "p",
      "text": "enumerate wraps any iterator and yields (index, value) pairs. It eliminates the manual index tracking that makes C-style loops error-prone. The start parameter lets you begin counting from any number, making it perfect for numbered lists, pagination, and database offsets. enumerate is lazy — it does not copy or materialize your data."
    },
    {
      "type": "code-block",
      "label": "enumerate Mastery",
      "code": `# === enumerate FUNDAMENTALS ===
# enumerate(iterable, start=0) -> (index, value) pairs

fruits = ['apple', 'banana', 'cherry', 'date']

# Basic usage
print("Basic enumerate:")
for i, fruit in enumerate(fruits):
    print(f"  {i}: {fruit}")

# With custom start
print(f"\nenumerate(fruits, 1):")
for i, fruit in enumerate(fruits, 1):
    print(f"  {i}. {fruit}")

# --- enumerate IS LAZY ---
# It wraps the iterator, doesn't copy data

import sys

big_list = list(range(100000))
enumerated = enumerate(big_list)

print(f"\nMemory:")
print(f"  List size:      {sys.getsizeof(big_list)} bytes")
print(f"  enumerate size: {sys.getsizeof(enumerated)} bytes")

# --- enumerate with unpacking ---

print(f"\nDirect unpacking:")
for index, value in enumerate(['a', 'b', 'c']):
    print(f"  Index {index} = '{value}'")

# --- enumerate in list comprehensions ---

indexed = {fruit: i for i, fruit in enumerate(fruits)}
print(f"\nIndexed dict: {indexed}")

# --- enumerate for finding indices ---

def find_all(items, target):
    """Find all indices of target."""
    return [i for i, item in enumerate(items) if item == target]

data = [1, 2, 3, 2, 4, 2, 5]
print(f"\nfind_all(data, 2): {find_all(data, 2)}")

# --- enumerate for parallel modification ---
# When you need to modify a list while iterating

numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(f"\nOriginal: {numbers}")
for i, n in enumerate(numbers):
    numbers[i] = n * 2
print(f"Doubled:  {numbers}")

# --- enumerate with zip ---
# Multiple parallel enumerations

names = ['Alice', 'Bob', 'Charlie']
ages = [30, 25, 35]
cities = ['NYC', 'LA', 'Chicago']

print(f"\nParallel enumerate + zip:")
for i, (name, age, city) in enumerate(zip(names, ages, cities), 1):
    print(f"  {i}. {name}, {age}, {city}")

# --- enumerate for ranking ---

scores = [95, 87, 92, 78, 88, 91]
ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
print(f"\nRanked scores:")
for rank, (original_index, score) in enumerate(ranked, 1):
    print(f"  #{rank}: Score {score} (original index {original_index})")

# --- enumerate for chunking ---

def chunks(iterable, size):
    """Split iterable into chunks of given size."""
    it = iter(iterable)
    for i, first in enumerate(it):
        chunk = [first] + [next(it) for _ in range(size - 1)]
        yield chunk

print(f"\nChunks of [1..10] by 3:")
for chunk in chunks(range(1, 11), 3):
    print(f"  {chunk}")

print("\nenumerate mastery complete!")`
    },
    {
      "type": "h2",
      "text": "zip: Parallel Iteration Perfected"
    },
    {
      "type": "p",
      "text": "zip takes multiple iterables and yields tuples of parallel elements. It stops at the shortest sequence — a design choice that prevents index errors but can silently drop data. zip_longest from itertools fills missing values with a default. zip is lazy, memory-efficient, and the foundation of parallel processing in Python."
    },
    {
      "type": "code-block",
      "label": "zip Mastery",
      "code": `# === zip FUNDAMENTALS ===
# zip(*iterables) -> (item1, item2, ...) tuples

names = ['Alice', 'Bob', 'Charlie']
ages = [30, 25, 35]

print("Basic zip:")
for name, age in zip(names, ages):
    print(f"  {name}: {age}")

# --- zip creates an iterator (lazy) ---
zipped = zip(names, ages)
print(f"\nzip object: {zipped}")
print(f"type: {type(zipped).__name__}")

# --- zip with more than 2 iterables ---

cities = ['NYC', 'LA', 'Chicago']
jobs = ['Engineer', 'Designer', 'Manager']

print(f"\nzip 4 lists:")
for name, age, city, job in zip(names, ages, cities, jobs):
    print(f"  {name}, {age}, {city}, {job}")

# --- zip stops at shortest (the trap) ---

short = [1, 2]
long = [10, 20, 30, 40]

print(f"\nzip(short, long): {list(zip(short, long))}")
print(f"WARNING: 30 and 40 were silently dropped!")

# --- zip_longest: fill missing values ---
from itertools import zip_longest

print(f"\nzip_longest(short, long): {list(zip_longest(short, long))}")
print(f"zip_longest with fillvalue: {list(zip_longest(short, long, fillvalue='N/A'))}")

# --- zip for creating dicts ---

keys = ['a', 'b', 'c']
values = [1, 2, 3]
d = dict(zip(keys, values))
print(f"\nDict from zip: {d}")

# --- zip for transposing ---
# zip(*matrix) transposes rows and columns

matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

transposed = list(zip(*matrix))
print(f"\nOriginal matrix: {matrix}")
print(f"Transposed: {transposed}")

# --- zip for pairwise iteration ---
# Compare adjacent elements

numbers = [1, 3, 6, 10, 15]
print(f"\nAdjacent pairs: {list(zip(numbers, numbers[1:]))}")

# Differences between adjacent elements
diffs = [b - a for a, b in zip(numbers, numbers[1:])]
print(f"Differences: {diffs}")

# --- zip for unpacking ---
# Unpack a list of tuples into separate lists

pairs = [('a', 1), ('b', 2), ('c', 3)]
letters, nums = zip(*pairs)
print(f"\nUnpacked: letters={letters}, nums={nums}")

# --- zip with enumerate ---
# The ultimate parallel iteration pattern

items = ['apple', 'banana', 'cherry']
prices = [1.2, 0.8, 2.5]
quantities = [10, 20, 15]

print(f"\nInvoice:")
for i, (item, price, qty) in enumerate(zip(items, prices, quantities), 1):
    total = price * qty
    print(f"  {i}. {item}: \${price} x {qty} = \${total:.2f}")

# --- zip for strict matching (Python 3.10+) ---
# zip(..., strict=True) raises ValueError if lengths differ

try:
    list(zip([1, 2], [10, 20, 30], strict=True))
except ValueError as e:
    print(f"\nzip strict=True: {e}")

print("\nzip mastery complete!")`
    },
    {
      "type": "h2",
      "text": "map & filter: Functional Iteration"
    },
    {
      "type": "p",
      "text": "map and filter are the functional programming tools of Python iteration. map applies a function to every element. filter selects elements that satisfy a predicate. Both return iterators — lazy, memory-efficient, and composable. In modern Python, list comprehensions often replace map and filter for readability, but these functions remain essential for function composition and lazy pipelines."
    },
    {
      "type": "code-block",
      "label": "map & filter Mastery",
      "code": `# === map ===
# map(function, iterable) -> iterator of results

numbers = [1, 2, 3, 4, 5]

# Square all numbers
squares = map(lambda x: x**2, numbers)
print(f"map squares: {list(squares)}")

# With built-in function
strings = ['1', '2', '3', '4']
integers = map(int, strings)
print(f"\nmap(int, strings): {list(integers)}")

# With multiple iterables
a = [1, 2, 3]
b = [10, 20, 30]
sums = map(lambda x, y: x + y, a, b)
print(f"map with 2 args: {list(sums)}")

# --- map IS LAZY ---
# Nothing computed until iteration

lazy = map(lambda x: x**2, range(1000000000))
import sys
print(f"\nLazy map size: {sys.getsizeof(lazy)} bytes")
print(f"First 5: {list(map(lambda x: x**2, range(5)))}")

# --- filter ===
# filter(predicate, iterable) -> iterator of matching elements

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Even numbers
evens = filter(lambda x: x % 2 == 0, numbers)
print(f"\nfilter evens: {list(evens)}")

# With None (filters falsy values)
mixed = [0, 1, '', 'hello', [], [1, 2], None, True]
truthy = filter(None, mixed)
print(f"filter None: {list(truthy)}")

# --- map + filter composition ===
# Square even numbers

numbers = range(20)
result = map(lambda x: x**2, filter(lambda x: x % 2 == 0, numbers))
print(f"\nSquare of evens: {list(result)}")

# Same with list comprehension (more readable)
result_comp = [x**2 for x in range(20) if x % 2 == 0]
print(f"List comp version: {result_comp}")

# --- map vs comprehension performance ---
import time

big = range(1000000)

start = time.perf_counter()
result = list(map(lambda x: x**2, filter(lambda x: x % 2 == 0, big)))
map_time = time.perf_counter() - start

start = time.perf_counter()
result = [x**2 for x in big if x % 2 == 0]
comp_time = time.perf_counter() - start

print(f"\nmap+filter: {map_time:.4f}s")
print(f"comprehension: {comp_time:.4f}s")
print(f"Winner: {'comprehension' if comp_time < map_time else 'map+filter'}")

# --- map for method calls ---
# Apply a method to each element

class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price
    def discount(self, percent):
        return self.price * (1 - percent / 100)

items = [Item('A', 100), Item('B', 200), Item('C', 150)]
discounted = map(lambda item: item.discount(20), items)
print(f"\nDiscounted prices: {list(discounted)}")

# --- filter with custom classes ---
# Filter objects by attribute

active_items = filter(lambda item: item.price > 120, items)
print(f"Expensive items: {[i.name for i in active_items]}")

print("\nmap & filter mastery complete!")`
    },
    {
      "type": "h2",
      "text": "itertools Preview: The Iteration Powerhouse"
    },
    {
      "type": "p",
      "text": "The itertools module is Python's secret weapon for iteration. It provides tools for creating iterators for efficient looping: infinite iterators, combinatoric generators, and iterator algebra. These functions are implemented in C, making them faster than pure Python equivalents. We will preview the most essential itertools functions: cycle, chain, product, and permutations."
    },
    {
      "type": "code-block",
      "label": "itertools Preview",
      "code": `# === itertools: THE ITERATION POWERHOUSE ===
from itertools import cycle, chain, product, permutations, combinations, count, repeat, islice

# --- cycle: Infinite repetition ---
# Repeats an iterable indefinitely

colors = cycle(['red', 'green', 'blue'])
print("cycle (first 7):")
for _ in range(7):
    print(f"  {next(colors)}")

# Practical: round-robin task assignment
tasks = ['task1', 'task2', 'task3']
workers = cycle(['Alice', 'Bob', 'Charlie', 'Diana'])
print(f"\nRound-robin assignment:")
for task in tasks:
    print(f"  {next(workers)} -> {task}")

# --- chain: Flatten iterables ---
# Concatenate multiple iterables into one

list1 = [1, 2, 3]
list2 = [4, 5, 6]
list3 = [7, 8, 9]

flattened = list(chain(list1, list2, list3))
print(f"\nchain: {flattened}")

# Chain from nested lists
nested = [[1, 2], [3, 4], [5, 6]]
flat = list(chain.from_iterable(nested))
print(f"chain.from_iterable: {flat}")

# --- product: Cartesian product ---
# All combinations of elements from multiple iterables

sizes = ['S', 'M', 'L']
colors = ['red', 'blue']
variants = list(product(sizes, colors))
print(f"\nproduct(sizes x colors): {variants}")

# Repeat product (same iterable multiple times)
dice_pairs = list(product(range(1, 7), repeat=2))
print(f"Dice pairs (6x6): {len(dice_pairs)} combinations")
print(f"First 5: {dice_pairs[:5]}")

# --- permutations: Ordered arrangements ---
# All possible orderings of elements

items = ['A', 'B', 'C']
perms = list(permutations(items))
print(f"\npermutations(ABC): {perms}")

# Permutations of length 2
perms_2 = list(permutations(items, 2))
print(f"permutations(ABC, 2): {perms_2}")

# --- combinations: Unordered selections ---
# All possible subsets of a given size

items = [1, 2, 3, 4]
combos = list(combinations(items, 2))
print(f"\ncombinations(4, 2): {combos}")

# --- count: Infinite counter ---
# Like range but infinite

counter = count(10, 2)  # Start at 10, step by 2
print(f"\ncount(10, 2) first 5: {[next(counter) for _ in range(5)]}")

# Practical: assign IDs
id_gen = count(1000)
items = ['apple', 'banana', 'cherry']
with_ids = [(next(id_gen), item) for item in items]
print(f"With IDs: {with_ids}")

# --- repeat: Repeat a value ---
# repeat(value, [times])

print(f"\nrepeat('x', 5): {list(repeat('x', 5))}")

# Practical: initialize list
zeros = list(repeat(0, 10))
print(f"repeat(0, 10): {zeros}")

# --- islice: Lazy slicing ---
# Slice an iterator without converting to list

big_range = range(1000000)
slice_of_range = islice(big_range, 100, 110)
print(f"\nislice(range(1M), 100, 110): {list(slice_of_range)}")

# --- itertools recipes ---
# Common patterns from itertools documentation

# Take n items from iterator
def take(n, iterable):
    return list(islice(iterable, n))

# First true value
def first_true(iterable, default=False, pred=None):
    return next(filter(pred, iterable), default)

# All equal
def all_equal(iterable):
    groups = itertools.groupby(iterable)
    return next(groups, True) and not next(groups, False)

import itertools
print(f"\ntake(5, count()): {take(5, count())}")
print(f"first_true([0, '', [], 42, 99]): {first_true([0, '', [], 42, 99])}")

print("\nitertools preview complete!")"
    },
    {
      "type": "programs",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use range, enumerate, zip, map, filter, and itertools to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Multiplication Table",
      "code": `"""
Program 1: Multiplication Table
Generates formatted multiplication tables using range and zip.
Demonstrates nested iteration, formatting, and lazy evaluation.
"""

class MultiplicationTable:
    """Generate formatted multiplication tables."""

    @staticmethod
    def generate(size=10, start=1):
        """Generate multiplication table as nested list."""
        return [[i * j for j in range(start, size + start)]
                for i in range(start, size + start)]

    @staticmethod
    def print_table(size=10):
        """Print formatted multiplication table."""
        # Header
        header = "    " + " ".join(f"{i:4d}" for i in range(1, size + 1))
        print(header)
        print("    " + "-" * (size * 5))

        # Rows
        for i in range(1, size + 1):
            row = f"{i:2d} |" + "".join(f"{i * j:4d}" for j in range(1, size + 1))
            print(row)

    @staticmethod
    def print_triangle(size=10):
        """Print triangular multiplication table."""
        for i in range(1, size + 1):
            row = " ".join(f"{i * j:3d}" for j in range(1, i + 1))
            print(f"{i:2d} | {row}")

    @staticmethod
    def diagonal_products(size=10):
        """Return products on the main diagonal."""
        return [i * i for i in range(1, size + 1)]

    @staticmethod
    def anti_diagonal_products(size=10):
        """Return products on the anti-diagonal."""
        return [i * (size - i + 1) for i in range(1, size + 1)]

    @staticmethod
    def sum_by_row(size=10):
        """Sum of each row."""
        return [sum(i * j for j in range(1, size + 1)) for i in range(1, size + 1)]

    @staticmethod
    def sum_by_column(size=10):
        """Sum of each column."""
        return [sum(i * j for i in range(1, size + 1)) for j in range(1, size + 1)]

def main():
    """Main multiplication table program."""
    print("=" * 50)
    print("MULTIPLICATION TABLE")
    print("=" * 50)

    print("\nStandard 10x10 table:")
    MultiplicationTable.print_table(10)

    print("\n\nTriangular table:")
    MultiplicationTable.print_triangle(10)

    print(f"\nDiagonal products: {MultiplicationTable.diagonal_products(10)}")
    print(f"Anti-diagonal: {MultiplicationTable.anti_diagonal_products(10)}")

    print(f"\nRow sums: {MultiplicationTable.sum_by_row(5)}")
    print(f"Column sums: {MultiplicationTable.sum_by_column(5)}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Parallel List Processing",
      "code": `"""
Program 2: Parallel List Processing
Processes multiple lists in parallel using zip and enumerate.
Demonstrates zip, zip_longest, and parallel computation.
"""

from itertools import zip_longest
from typing import List, Tuple, Optional

class ParallelProcessor:
    """Process multiple lists in parallel."""

    @staticmethod
    def combine(names: List[str], scores: List[int],
                grades: List[str]) -> List[dict]:
        """Combine parallel lists into records."""
        return [
            {'name': n, 'score': s, 'grade': g}
            for n, s, g in zip(names, scores, grades)
        ]

    @staticmethod
    def calculate_totals(prices: List[float],
                         quantities: List[int],
                         discounts: List[float]) -> List[float]:
        """Calculate total price with discount for each item."""
        return [
            round(p * q * (1 - d / 100), 2)
            for p, q, d in zip(prices, quantities, discounts)
        ]

    @staticmethod
    def merge_logs(timestamps: List[str],
                    levels: List[str],
                    messages: List[str]) -> List[str]:
        """Merge parallel log components into formatted lines."""
        return [
            f"[{ts}] {lvl}: {msg}"
            for ts, lvl, msg in zip(timestamps, levels, messages)
        ]

    @staticmethod
    def align_columns(*columns: List, fillvalue=None) -> List[Tuple]:
        """Align columns of different lengths using zip_longest."""
        return list(zip_longest(*columns, fillvalue=fillvalue))

    @staticmethod
    def diff_sequences(a: List, b: List) -> List[Tuple]:
        """Find differences between two sequences."""
        return [
            (i, x, y) for i, (x, y) in enumerate(zip_longest(a, b))
            if x != y
        ]

    @staticmethod
    def running_average(values: List[float]) -> List[float]:
        """Calculate running average at each position."""
        totals = []
        running = 0.0
        for i, v in enumerate(values, 1):
            running += v
            totals.append(round(running / i, 2))
        return totals

    @staticmethod
    def indexed_filter(items: List, predicate) -> List[Tuple[int, any]]:
        """Filter items and return (index, item) pairs."""
        return [(i, item) for i, item in enumerate(items) if predicate(item)]

    @staticmethod
    def batch_process(data: List, batch_size: int):
        """Process data in batches using zip and range."""
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            yield i // batch_size + 1, batch

def main():
    """Main parallel processing program."""
    print("=" * 50)
    print("PARALLEL LIST PROCESSING")
    print("=" * 50)

    # Combine records
    names = ['Alice', 'Bob', 'Charlie']
    scores = [95, 87, 92]
    grades = ['A', 'B', 'A']
    records = ParallelProcessor.combine(names, scores, grades)
    print(f"\nCombined records:")
    for r in records:
        print(f"  {r}")

    # Calculate totals
    prices = [10.99, 25.50, 5.00, 15.75]
    quantities = [2, 1, 5, 3]
    discounts = [0, 10, 5, 15]
    totals = ParallelProcessor.calculate_totals(prices, quantities, discounts)
    print(f"\nTotals: {totals}")

    # Merge logs
    timestamps = ['2024-01-01 10:00', '2024-01-01 10:05', '2024-01-01 10:10']
    levels = ['INFO', 'WARN', 'ERROR']
    messages = ['Server started', 'High memory usage', 'Connection failed']
    logs = ParallelProcessor.merge_logs(timestamps, levels, messages)
    print(f"\nMerged logs:")
    for log in logs:
        print(f"  {log}")

    # Align columns
    col1 = ['A', 'B', 'C']
    col2 = [1, 2]
    col3 = ['x', 'y', 'z', 'w']
    aligned = ParallelProcessor.align_columns(col1, col2, col3, fillvalue='-')
    print(f"\nAligned columns:")
    for row in aligned:
        print(f"  {row}")

    # Diff sequences
    old = [1, 2, 3, 4, 5]
    new = [1, 2, 99, 4, 5, 6]
    diffs = ParallelProcessor.diff_sequences(old, new)
    print(f"\nDifferences: {diffs}")

    # Running average
    values = [10, 20, 30, 40, 50]
    avg = ParallelProcessor.running_average(values)
    print(f"\nRunning average: {avg}")

    # Batch processing
    data = list(range(1, 11))
    print(f"\nBatches of 3:")
    for batch_num, batch in ParallelProcessor.batch_process(data, 3):
        print(f"  Batch {batch_num}: {batch}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Password Generator",
      "code": `"""
Program 3: Password Generator
Generates secure passwords using itertools and random.
Demonstrates product, permutations, and combinatorial generation.
"""

import random
import string
from itertools import product, permutations, combinations
from typing import List, Set

class PasswordGenerator:
    """Generate secure passwords and passphrases."""

    CHARS_LOWER = string.ascii_lowercase
    CHARS_UPPER = string.ascii_uppercase
    CHARS_DIGITS = string.digits
    CHARS_SPECIAL = '!@#$%^&*'
    CHARS_ALL = CHARS_LOWER + CHARS_UPPER + CHARS_DIGITS + CHARS_SPECIAL

    @staticmethod
    def random_password(length=16,
                         use_lower=True,
                         use_upper=True,
                         use_digits=True,
                         use_special=True) -> str:
        """Generate random password with guaranteed character types."""
        chars = ''
        required = []

        if use_lower:
            chars += PasswordGenerator.CHARS_LOWER
            required.append(random.choice(PasswordGenerator.CHARS_LOWER))
        if use_upper:
            chars += PasswordGenerator.CHARS_UPPER
            required.append(random.choice(PasswordGenerator.CHARS_UPPER))
        if use_digits:
            chars += PasswordGenerator.CHARS_DIGITS
            required.append(random.choice(PasswordGenerator.CHARS_DIGITS))
        if use_special:
            chars += PasswordGenerator.CHARS_SPECIAL
            required.append(random.choice(PasswordGenerator.CHARS_SPECIAL))

        # Fill remaining length with random choices
        remaining = length - len(required)
        password = required + [random.choice(chars) for _ in range(remaining)]
        random.shuffle(password)
        return ''.join(password)

    @staticmethod
    def passphrase(word_count=4, separator='-') -> str:
        """Generate memorable passphrase from word list."""
        words = [
            'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon',
            'garden', 'harbor', 'island', 'jungle', 'knight', 'lemon',
            'mountain', 'nebula', 'ocean', 'penguin', 'quartz', 'river',
            'sunset', 'tiger', 'unicorn', 'volcano', 'winter', 'zenith'
        ]
        chosen = [random.choice(words) for _ in range(word_count)]
        return separator.join(chosen)

    @staticmethod
    def pin(length=6) -> str:
        """Generate numeric PIN."""
        return ''.join(random.choice(string.digits) for _ in range(length))

    @staticmethod
    def generate_variations(base: str, max_length: int = 3) -> Set[str]:
        """
        Generate common password variations.
        WARNING: For educational/dictionary attack purposes only.
        """
        variations = {base}
        suffixes = ['1', '123', '!', '2024', '01']

        for suffix in suffixes:
            variations.add(base + suffix)
            variations.add(base.capitalize() + suffix)
            variations.add(base.upper() + suffix)

        return variations

    @staticmethod
    def check_strength(password: str) -> dict:
        """Evaluate password strength."""
        score = 0
        feedback = []

        if len(password) >= 12:
            score += 2
        elif len(password) >= 8:
            score += 1
        else:
            feedback.append('Too short (min 12 recommended)')

        if any(c in string.ascii_lowercase for c in password):
            score += 1
        else:
            feedback.append('Add lowercase letters')

        if any(c in string.ascii_uppercase for c in password):
            score += 1
        else:
            feedback.append('Add uppercase letters')

        if any(c in string.digits for c in password):
            score += 1
        else:
            feedback.append('Add digits')

        if any(c in string.punctuation for c in password):
            score += 1
        else:
            feedback.append('Add special characters')

        strength = 'Weak' if score < 3 else 'Medium' if score < 5 else 'Strong'
        return {'score': score, 'strength': strength, 'feedback': feedback}

def main():
    """Main password generator program."""
    print("=" * 50)
    print("PASSWORD GENERATOR")
    print("=" * 50)

    # Random passwords
    print("\nRandom passwords:")
    for _ in range(3):
        pwd = PasswordGenerator.random_password(16)
        strength = PasswordGenerator.check_strength(pwd)
        print(f"  {pwd} (Score: {strength['score']}/6, {strength['strength']})")

    # Passphrases
    print(f"\nPassphrases:")
    for _ in range(3):
        print(f"  {PasswordGenerator.passphrase()}")

    # PINs
    print(f"\nPINs:")
    for _ in range(3):
        print(f"  {PasswordGenerator.pin()}")

    # Strength check
    test_passwords = ['password', 'Password1', 'P@ssw0rd2024!', 'abc']
    print(f"\nStrength checks:")
    for pwd in test_passwords:
        result = PasswordGenerator.check_strength(pwd)
        print(f"  '{pwd}': {result['strength']} ({result['score']}/6)")
        if result['feedback']:
            print(f"    Feedback: {result['feedback']}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Cartesian Product Explorer",
      "code": `"""
Program 4: Cartesian Product Explorer
Explores combinatorial spaces using itertools.product.
Demonstrates product, permutations, combinations, and probability.
"""

from itertools import product, permutations, combinations, combinations_with_replacement
from typing import List, Tuple, Dict
from collections import Counter

class CombinatorialExplorer:
    """Explore combinatorial spaces."""

    @staticmethod
    def dice_outcomes(sides=6, dice=2) -> List[Tuple]:
        """All possible dice roll outcomes."""
        return list(product(range(1, sides + 1), repeat=dice))

    @staticmethod
    def dice_sum_distribution(sides=6, dice=2) -> Dict[int, int]:
        """Distribution of dice sums."""
        outcomes = CombinatorialExplorer.dice_outcomes(sides, dice)
        sums = [sum(roll) for roll in outcomes]
        return dict(Counter(sums))

    @staticmethod
    def dice_probability(target_sum, sides=6, dice=2) -> float:
        """Probability of rolling a specific sum."""
        outcomes = CombinatorialExplorer.dice_outcomes(sides, dice)
        favorable = [roll for roll in outcomes if sum(roll) == target_sum]
        return len(favorable) / len(outcomes)

    @staticmethod
    def card_combinations(deck: List[str], hand_size: int) -> int:
        """Number of possible card hands."""
        from math import comb
        return comb(len(deck), hand_size)

    @staticmethod
    def outfit_combinations(tops: List[str],
                           bottoms: List[str],
                           shoes: List[str]) -> List[Tuple]:
        """All possible outfit combinations."""
        return list(product(tops, bottoms, shoes))

    @staticmethod
    def team_permutations(members: List[str], size: int) -> List[Tuple]:
        """All possible team arrangements."""
        return list(permutations(members, size))

    @staticmethod
    def lottery_odds(total_numbers, pick_count) -> Dict[str, float]:
        """Calculate lottery odds."""
        from math import comb
        total = comb(total_numbers, pick_count)
        return {
            'total_combinations': total,
            'probability': 1 / total,
            'percentage': (1 / total) * 100
        }

    @staticmethod
    def password_space(length, charset_size) -> Dict[str, any]:
        """Calculate password search space."""
        total = charset_size ** length
        return {
            'total_combinations': total,
            'bits_of_entropy': (length * charset_size.bit_length()),
            'at_1_billion_per_second': total / 1e9
        }

    @staticmethod
    def monte_hall_simulation(switch_strategy=True, trials=10000) -> Dict:
        """Simulate Monty Hall problem."""
        import random
        wins = 0

        for _ in range(trials):
            # Place car behind random door
            car = random.randint(0, 2)
            # Contestant picks random door
            pick = random.randint(0, 2)

            if switch_strategy:
                # Host reveals a goat, contestant switches
                # Switching wins if original pick was wrong (2/3 chance)
                if pick != car:
                    wins += 1
            else:
                # Staying wins if original pick was right (1/3 chance)
                if pick == car:
                    wins += 1

        return {
            'strategy': 'switch' if switch_strategy else 'stay',
            'wins': wins,
            'trials': trials,
            'win_rate': wins / trials
        }

def main():
    """Main combinatorial explorer program."""
    print("=" * 50)
    print("CARTESIAN PRODUCT EXPLORER")
    print("=" * 50)

    # Dice outcomes
    print("\n2d6 outcomes:")
    outcomes = CombinatorialExplorer.dice_outcomes(6, 2)
    print(f"  Total outcomes: {len(outcomes)}")
    print(f"  First 10: {outcomes[:10]}")

    # Sum distribution
    dist = CombinatorialExplorer.dice_sum_distribution(6, 2)
    print(f"\n2d6 sum distribution:")
    for s in sorted(dist.keys()):
        bar = '█' * dist[s]
        print(f"  {s:2d}: {bar} ({dist[s]})")

    # Probability
    prob = CombinatorialExplorer.dice_probability(7, 6, 2)
    print(f"\nP(sum=7 with 2d6): {prob:.4f} ({prob*100:.2f}%)")

    # Outfit combinations
    tops = ['red shirt', 'blue shirt', 'white shirt']
    bottoms = ['jeans', 'shorts']
    shoes = ['sneakers', 'boots']
    outfits = CombinatorialExplorer.outfit_combinations(tops, bottoms, shoes)
    print(f"\nOutfit combinations: {len(outfits)}")
    for outfit in outfits:
        print(f"  {outfit}")

    # Lottery odds
    odds = CombinatorialExplorer.lottery_odds(49, 6)
    print(f"\nLottery (49 choose 6):")
    print(f"  Total combinations: {odds['total_combinations']:,}")
    print(f"  Probability: 1 in {odds['total_combinations']:,}")
    print(f"  Percentage: {odds['percentage']:.10f}%")

    # Password space
    space = CombinatorialExplorer.password_space(8, 62)  # a-zA-Z0-9
    print(f"\nPassword space (8 chars, 62 options):")
    print(f"  Total: {space['total_combinations']:,.0f}")
    print(f"  Crack time at 1B/s: {space['at_1_billion_per_second']:,.0f} seconds")

    # Monty Hall simulation
    print(f"\nMonty Hall simulation (10,000 trials):")
    switch_result = CombinatorialExplorer.monte_hall_simulation(switch_strategy=True)
    stay_result = CombinatorialExplorer.monte_hall_simulation(switch_strategy=False)
    print(f"  Switch strategy: {switch_result['win_rate']:.2%} win rate")
    print(f"  Stay strategy: {stay_result['win_rate']:.2%} win rate")

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
      "text": "Answer these before moving to Part 15. 4/5 correct means you have mastered iteration tools."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain why range(1000000000) uses the same memory as range(10). What operations can you perform on a range object without converting it to a list? Write code that demonstrates range's memory efficiency compared to a list.",
        "Q2: What is the difference between zip and zip_longest? Write a function that processes three lists of different lengths. Use zip_longest with a fillvalue, and explain when you would use strict=True (Python 3.10+).",
        "Q3: Write a function that uses enumerate to find all indices of a target value in a list. Then rewrite it without enumerate using a manual counter. Which is more Pythonic and why?",
        "Q4: Explain the difference between map/filter and list comprehensions. Write code that benchmarks both approaches for the same operation. When should you use map/filter instead of comprehensions?",
        "Q5: Explain the Cartesian product and write a function that generates all possible outcomes of rolling two 6-sided dice. Calculate the probability of each sum (2-12) and verify that the probabilities sum to 1."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: range is a lazy sequence object, not a list. It stores only start, stop, and step values (3 integers), computing values on demand. range(10) and range(1B) both use ~48 bytes. Operations without conversion: indexing (r[5]), slicing (r[2:8]), len(), in operator (7 in r), reversed(r), iteration. List conversion materializes all values: list(range(1B)) uses ~8GB. A2: zip stops at the shortest iterable, silently dropping extra elements. zip_longest continues until the longest is exhausted, filling missing values with fillvalue. strict=True raises ValueError if iterables have different lengths, preventing silent data loss. Use strict=True when parallel sequences must have equal length (e.g., database rows). A3: With enumerate: [i for i, x in enumerate(lst) if x == target]. Without enumerate: idx = 0; result = []; for x in lst: if x == target: result.append(idx); idx += 1. The enumerate version is more Pythonic because it declares intent (find indices where condition holds) rather than describing the algorithm. It eliminates manual index tracking, reducing bug surface. A4: map/filter are functional: apply function to each element. Comprehensions are declarative: describe the result. Benchmark: comprehensions are usually faster because the loop runs in C and avoids function call overhead. Use map/filter when: (1) the function already exists (no lambda), (2) you need lazy evaluation for huge data, (3) you're composing multiple operations functionally. A5: Cartesian product of two dice: product(range(1,7), repeat=2). 36 outcomes. Sum probabilities: 2: 1/36, 3: 2/36, ..., 7: 6/36, ..., 12: 1/36. Sum of all probabilities = (1+2+3+4+5+6+5+4+3+2+1)/36 = 36/36 = 1. This is the foundation of probability theory and dice-based games."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python's iteration tools. You understand that range is a lazy sequence — O(1) memory regardless of size, supporting indexing, slicing, and membership testing. You use enumerate to eliminate manual index tracking, producing cleaner, more Pythonic code. You wield zip for parallel iteration, knowing when to use zip_longest for unequal lengths and strict=True for safety. You apply map and filter for functional iteration, understanding when they outperform comprehensions and when comprehensions win. You preview itertools — cycle, chain, product, permutations, combinations, count, repeat, islice — and recognize their power for combinatorial generation and infinite iteration. You have built four complete programs: a formatted multiplication table, a parallel list processor, a secure password generator with strength checking, and a Cartesian product explorer with probability calculations and Monty Hall simulation. Iteration is no longer just a for loop. It is a lazy, memory-efficient, composable pipeline that scales from ten items to ten billion."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: range is lazy. enumerate eliminates index pain. zip parallelizes iteration. map and filter are functional pipelines. itertools is combinatorial algebra. Master these five truths, and you have mastered the art of Python iteration. In Part 15, we will explore For & While Loops — the control structures that turn iteration into program flow, including the hidden else clause that most developers never discover."
    },
    {
      "type": "cta",
      "text": "Start Part 15: For & While Loops →",
      "href": "/tutorials/python-unlocked/part-15-for-while-loops",
      "note": "24 min read · for vs while · break/continue · else clause · Nested loops"
    }
  ]
};

export default post;
