const post = {
  "slug": "part-10-lists-the-workhorse",
  "seriesSlug": "python-unlocked",
  "partNumber": 10,
  "totalParts": 30,
  "title": "Lists — The Workhorse: Python’s Most Powerful Sequence (Part 10)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "28 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Dynamic arrays, amortized O(1) append, list methods, slicing mastery, list comprehensions, shallow vs deep copy, and four complete programs. Python 3.12 features included.",
  "coverEmoji": "📋",
  "tags": [
    "Python", "Lists", "Dynamic Arrays", "Slicing",
    "List Comprehensions", "Shallow Copy", "Deep Copy",
    "Sequence", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1956, IBM introduced the first hard disk drive. It weighed over a ton, stored 5 megabytes, and cost $50,000 per year to rent. In 2026, Python lists can store millions of elements in memory, grow dynamically, and manipulate data with a elegance that makes other languages weep. Lists are not just containers. They are dynamic arrays with amortized O(1) append, slicing syntax that reads like English, comprehensions that replace entire loops with single expressions, and a copy behavior so subtle it has destroyed production systems. In this part, we will explore the full depth of Python's most used data structure. You will learn why lists are implemented as dynamic arrays (not linked lists), how slicing works under the hood, why list comprehensions are faster than for loops, and why copy.copy() is a trap that only copies the surface. By the end, lists will not be a mystery. They will be your most trusted tool."
    },
    {
      "type": "h2",
      "text": "Dynamic Arrays: Why Lists Are Fast"
    },
    {
      "type": "p",
      "text": "Python lists are implemented as dynamic arrays — contiguous blocks of memory that grow as needed. This is not a linked list. It is not a tree. It is a resizable array, and that choice has profound performance implications. Appending is amortized O(1) because Python over-allocates, doubling capacity when full. Indexing is O(1) because elements are contiguous. But insertion and deletion in the middle are O(n) because elements must shift. Understanding this internal structure means you can write code that plays to lists' strengths."
    },
    {
      "type": "code-block",
      "label": "Dynamic Array Internals",
      "code": "# === LIST INTERNALS ===
# Python lists are dynamic arrays, not linked lists

import sys

# Watch how list capacity grows (over-allocation strategy)
numbers = []
for i in range(20):
    numbers.append(i)
    # sys.getsizeof gives bytes; subtract object overhead for capacity insight
    size = sys.getsizeof(numbers)
    print(f"Length: {len(numbers):2d} | Size: {size:3d} bytes | Ratio: {size/len(numbers):.1f}")

# === AMORTIZED O(1) APPEND ===
# Most appends are O(1). Occasionally, Python reallocates and copies.
# The 'occasional' cost is spread (amortized) across all operations.

# === INDEXING IS O(1) ===
# Direct memory access by offset

large_list = list(range(1000000))
# Accessing element 500,000 is instant
print(f"\nElement at index 500000: {large_list[500000]}")

# === INSERTION IN MIDDLE IS O(n) ===
# Every element after the insertion point must shift right

import time

def benchmark_insert(n, position):
    lst = list(range(n))
    start = time.perf_counter()
    lst.insert(position, -1)
    end = time.perf_counter()
    return end - start

print("\nInsertion benchmarks (seconds):")
for size in [1000, 10000, 100000]:
    front = benchmark_insert(size, 0)
    middle = benchmark_insert(size, size // 2)
    back = benchmark_insert(size, size)
    print(f"  Size {size:6d}: front={front:.6f}, middle={middle:.6f}, back={back:.6f}")

# === DELETION IS O(n) ===
# Elements after deletion point shift left

def benchmark_delete(n, position):
    lst = list(range(n))
    start = time.perf_counter()
    del lst[position]
    end = time.perf_counter()
    return end - start

print("\nDeletion benchmarks (seconds):")
for size in [1000, 10000, 100000]:
    front = benchmark_delete(size, 0)
    middle = benchmark_delete(size, size // 2)
    back = benchmark_delete(size, size - 1)
    print(f"  Size {size:6d}: front={front:.6f}, middle={middle:.6f}, back={back:.6f}")

print("\nKey insight: Append to the back. Avoid inserting/deleting from the front.")"
    },
    {
      "type": "h2",
      "text": "List Methods: The Complete Arsenal"
    },
    {
      "type": "p",
      "text": "Python lists have 11 essential methods. Each has a time complexity, a return value, and a mutability contract. Knowing these by heart makes you write code that is both correct and efficient. The golden rule: methods that modify the list in-place return None. Methods that create new objects return the new object."
    },
    {
      "type": "code-block",
      "label": "List Methods Mastery",
      "code": "# === LIST METHODS: THE COMPLETE SET ===

# 1. append(x) — O(1) amortized. Add to end.

fruits = ['apple', 'banana']
fruits.append('cherry')
print(f"append: {fruits}")

# 2. extend(iterable) — O(k). Add all elements from iterable.

fruits.extend(['date', 'elderberry'])
print(f"extend: {fruits}")

# 3. insert(i, x) — O(n). Insert at position i.

fruits.insert(1, 'apricot')
print(f"insert: {fruits}")

# 4. remove(x) — O(n). Remove first occurrence of x. Raises ValueError if not found.

fruits.remove('banana')
print(f"remove: {fruits}")

# 5. pop([i]) — O(1) if i is last, O(n) otherwise. Remove and return element at i.

last = fruits.pop()
print(f"pop last: {last}, list: {fruits}")

first = fruits.pop(0)
print(f"pop first: {first}, list: {fruits}")

# 6. clear() — O(1). Remove all elements.

temp = fruits.copy()
temp.clear()
print(f"clear: {temp}")

# 7. index(x, [start, [end]]) — O(n). Find first index of x.

idx = fruits.index('cherry')
print(f"index of 'cherry': {idx}")

# 8. count(x) — O(n). Count occurrences of x.

numbers = [1, 2, 2, 3, 2, 4]
count = numbers.count(2)
print(f"count of 2: {count}")

# 9. sort(key=None, reverse=False) — O(n log n). Sort in-place. Returns None!

numbers.sort()
print(f"sort: {numbers}")

numbers.sort(reverse=True)
print(f"sort reverse: {numbers}")

# Sort with key function
words = ['banana', 'pie', 'Washington', 'book']
words.sort(key=len)
print(f"sort by length: {words}")

# 10. reverse() — O(n). Reverse in-place. Returns None!

numbers.reverse()
print(f"reverse: {numbers}")

# 11. copy() — O(n). Shallow copy of list.

original = [1, 2, 3]
shallow = original.copy()
shallow[0] = 99
print(f"original: {original}, shallow: {shallow}")

# === THE RETURN NONE TRAP ===
# Methods that modify in-place return None. This is a common bug.

# WRONG: Chaining sort (returns None)
# result = [3, 1, 2].sort().reverse()  # AttributeError!

# CORRECT: Two separate statements
result = [3, 1, 2]
result.sort()
result.reverse()
print(f"\nCorrect sort+reverse: {result}")

# === THE += vs =+ TRAP ===
# += calls extend (mutates). =+ creates new list.

a = [1, 2, 3]
b = a
a += [4, 5]  # Mutates a in-place
print(f"\na += [4,5]: a={a}, b={b} (b changed too!)")

a = [1, 2, 3]
b = a
a = a + [4, 5]  # Creates new list
print(f"a = a + [4,5]: a={a}, b={b} (b unchanged!)")

print("\nList methods mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Slicing: Python’s Most Elegant Syntax"
    },
    {
      "type": "p",
      "text": "Slicing is Python's signature feature. It allows you to extract, modify, and reverse sequences with syntax so clean it reads like English. The full slice syntax is sequence[start:stop:step]. All three parameters are optional. All three can be negative. And the behavior is consistent across lists, strings, tuples, and bytes. Master slicing, and you master Python."
    },
    {
      "type": "code-block",
      "label": "Slicing Mastery",
      "code": "# === SLICING FUNDAMENTALS ===
# Syntax: list[start:stop:step]
# start: inclusive, default 0
# stop: exclusive, default len(list)
# step: default 1

letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
print(f"Original: {letters}")

# --- Basic slicing ---
print(f"\nletters[2:5]    = {letters[2:5]}")      # ['c', 'd', 'e']
print(f"letters[:4]     = {letters[:4]}")       # ['a', 'b', 'c', 'd']
print(f"letters[6:]     = {letters[6:]}")       # ['g', 'h', 'i', 'j']
print(f"letters[:]      = {letters[:]}")        # Full copy (shallow)

# --- Negative indices ---
print(f"\nletters[-3:]    = {letters[-3:]}")      # Last 3
print(f"letters[:-2]    = {letters[:-2]}")      # All except last 2
print(f"letters[-3:-1]  = {letters[-3:-1]}")    # 3rd from end to 2nd from end

# --- Step slicing ---
print(f"\nletters[::2]    = {letters[::2]}")      # Every 2nd element
print(f"letters[1::2]   = {letters[1::2]}")     # Every 2nd starting at 1
print(f"letters[::-1]   = {letters[::-1]}")     # REVERSE (the classic!)
print(f"letters[::-2]   = {letters[::-2]}")     # Reverse, every 2nd

# --- Slice assignment ---
# Replace a slice with new elements (can change length!)

numbers = [1, 2, 3, 4, 5]
numbers[1:3] = [20, 30, 40]  # Replace 2 elements with 3
print(f"\nAfter slice assignment: {numbers}")

numbers[1:4] = []  # Delete elements 1-3
print(f"After deletion: {numbers}")

numbers[1:1] = [99, 98]  # Insert at position 1 (zero-length slice)
print(f"After insertion: {numbers}")

# --- Slicing with itertools.islice ---
# For lazy iteration over large sequences without copying

from itertools import islice

big_list = range(1000000)
# islice doesn't create a list — it yields values lazily
first_10 = list(islice(big_list, 10))
middle_5 = list(islice(big_list, 500000, 500005))
print(f"\nislice first 10: {first_10}")
print(f"islice middle 5: {middle_5}")

# --- Slicing strings (same syntax!) ---

text = "Python is amazing"
print(f"\ntext[7:9]       = '{text[7:9]}'")
print(f"text[::3]       = '{text[::3]}'")
print(f"text[::-1]      = '{text[::-1]}'")  # Reverse string

# --- The slice object ---
# You can create slice objects for reuse

last_three = slice(-3, None)
first_five = slice(5)
every_second = slice(None, None, 2)

print(f"\nletters[last_three]   = {letters[last_three]}")
print(f"letters[first_five]   = {letters[first_five]}")
print(f"letters[every_second] = {letters[every_second]}")

print("\nSlicing mastery complete!")"
    },
    {
      "type": "h2",
      "text": "List Comprehensions: The Pythonic Revolution"
    },
    {
      "type": "p",
      "text": "List comprehensions are the most Pythonic feature. They transform loops into declarative expressions that read like mathematics. They are faster than equivalent for loops because the iteration runs in C. They are more readable because they eliminate boilerplate. And they can be nested, filtered, and combined with conditional logic. But they are not always the answer — complex comprehensions become unreadable. The rule: if it fits on one line, use a comprehension. If it needs two, use a for loop."
    },
    {
      "type": "code-block",
      "label": "List Comprehensions Mastery",
      "code": "# === BASIC COMPREHENSION ===
# [expression for item in iterable]

squares = [x**2 for x in range(10)]
print(f"Squares: {squares}")

# === COMPREHENSION WITH FILTER ===
# [expression for item in iterable if condition]

evens = [x for x in range(20) if x % 2 == 0]
print(f"\nEvens: {evens}")

# Multiple conditions
filtered = [x for x in range(100) if x % 3 == 0 if x % 5 == 0]
print(f"Divisible by 3 and 5: {filtered}")

# === COMPREHENSION WITH else ===
# [expr_if_true if condition else expr_if_false for item in iterable]

labels = ["even" if x % 2 == 0 else "odd" for x in range(10)]
print(f"\nLabels: {labels}")

# === COMPREHENSION VS FOR LOOP ===
# Comprehensions are faster and more readable

import time

# For loop version
start = time.perf_counter()
result_loop = []
for x in range(100000):
    if x % 2 == 0:
        result_loop.append(x**2)
loop_time = time.perf_counter() - start

# Comprehension version
start = time.perf_counter()
result_comp = [x**2 for x in range(100000) if x % 2 == 0]
comp_time = time.perf_counter() - start

print(f"\nFor loop:   {loop_time:.4f}s")
print(f"Comprehension: {comp_time:.4f}s")
print(f"Speedup: {loop_time/comp_time:.1f}x")

# === NESTED COMPREHENSIONS ===
# [expression for inner in outer for inner_item in inner]

matrix = [[i*j for j in range(1, 4)] for i in range(1, 4)]
print(f"\nMultiplication table: {matrix}")

# Flatten a matrix
flat = [x for row in matrix for x in row]
print(f"Flattened: {flat}")

# === COMPREHENSIONS WITH FUNCTIONS ===

words = ["hello", "WORLD", "Python", "3.12"]
lengths = [len(w) for w in words]
upper_words = [w.upper() for w in words if w.isalpha()]
print(f"\nLengths: {lengths}")
print(f"Upper (alpha only): {upper_words}")

# === SET AND DICT COMPREHENSIONS ===
# Same syntax, different braces

unique_lengths = {len(w) for w in words}  # Set comprehension
length_map = {w: len(w) for w in words}    # Dict comprehension
print(f"\nUnique lengths: {unique_lengths}")
print(f"Length map: {length_map}")

# === GENERATOR EXPRESSION ===
# (expression for item in iterable) — lazy, memory efficient

large_sum = sum(x**2 for x in range(1000000) if x % 2 == 0)
print(f"\nSum of even squares (lazy): {large_sum}")

# === WHEN NOT TO USE COMPREHENSIONS ===
# Complex logic belongs in a regular loop

# BAD: Nested comprehension with complex logic
# result = [f(x) if cond1(x) else g(x) if cond2(x) else h(x) for x in items if pred1(x) if pred2(x)]

# GOOD: Regular loop with clear steps
# result = []
# for x in items:
#     if not pred1(x) or not pred2(x):
#         continue
#     if cond1(x):
#         result.append(f(x))
#     elif cond2(x):
#         result.append(g(x))
#     else:
#         result.append(h(x))

print("\nList comprehension mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Shallow vs Deep Copy: The Trap That Destroys Systems"
    },
    {
      "type": "p",
      "text": "Copying lists is not as simple as it looks. list.copy() creates a shallow copy — a new list containing references to the same objects. If those objects are mutable (like nested lists or dicts), modifying them in the copy affects the original. Deep copy recursively copies all objects, creating truly independent duplicates. The trap is subtle: shallow copy looks like it worked until you modify a nested element. Then the bug appears in production, and you spend hours debugging."
    },
    {
      "type": "code-block",
      "label": "Shallow vs Deep Copy",
      "code": "# === SHALLOW COPY ===
# Creates new list, but elements are references to original objects

import copy

# Simple elements (immutable) — shallow copy is fine
original = [1, 2, 3, 4, 5]
shallow = original.copy()

shallow[0] = 99
print(f"Original: {original}")
print(f"Shallow:  {shallow}")
print(f"Independent: {original[0] != shallow[0]}")

# --- The trap: nested mutable objects ---

original = [[1, 2], [3, 4], [5, 6]]
shallow = original.copy()

shallow[0][0] = 99  # Modify nested element
print(f"\nAfter modifying shallow[0][0]:")
print(f"Original: {original}")  # BUG: Original changed too!
print(f"Shallow:  {shallow}")

# Why? Both lists contain references to the same inner lists
print(f"Same inner list? {original[0] is shallow[0]}")

# === DEEP COPY ===
# Recursively copies all objects — truly independent

original = [[1, 2], [3, 4], [5, 6]]
deep = copy.deepcopy(original)

deep[0][0] = 99
print(f"\nAfter modifying deep[0][0]:")
print(f"Original: {original}")  # Safe!
print(f"Deep:     {deep}")
print(f"Same inner list? {original[0] is deep[0]}")

# === ALL COPY METHODS COMPARED ===

original = [[1, 2], [3, 4]]

# Method 1: slice
copy1 = original[:]

# Method 2: list() constructor
copy2 = list(original)

# Method 3: copy() method
copy3 = original.copy()

# Method 4: copy module (shallow)
copy4 = copy.copy(original)

# Method 5: deepcopy
copy5 = copy.deepcopy(original)

print(f"\nAll methods create new outer list:")
print(f"original is copy1: {original is copy1}")
print(f"original is copy5: {original is copy5}")

print(f"\nBut only deepcopy creates new inner lists:")
print(f"original[0] is copy1[0]: {original[0] is copy1[0]} (shallow)")
print(f"original[0] is copy5[0]: {original[0] is copy5[0]} (deep)")

# === PRACTICAL: COPYING A DICT OF LISTS ===

data = {
    "users": ["Alice", "Bob"],
    "scores": [[85, 90], [78, 88]]
}

# Shallow copy of dict
data_shallow = data.copy()
data_shallow["users"].append("Charlie")
print(f"\nAfter shallow copy append:")
print(f"Original users: {data['users']}")  # BUG!

# Deep copy
data_deep = copy.deepcopy(data)
data_deep["users"].append("Diana")
print(f"\nAfter deep copy append:")
print(f"Original users: {data['users']}")  # Safe!
print(f"Deep users: {data_deep['users']}")

# === CUSTOM OBJECTS AND DEEPCOPY ===

class Person:
    def __init__(self, name, friends=None):
        self.name = name
        self.friends = friends or []

    def __repr__(self):
        return f"Person({self.name!r}, friends={self.friends})"

alice = Person("Alice", ["Bob", "Charlie"])
alice_copy = copy.deepcopy(alice)
alice_copy.friends.append("Diana")

print(f"\nOriginal Alice: {alice}")
print(f"Copied Alice:   {alice_copy}")

print("\nShallow vs Deep copy mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use lists, slicing, comprehensions, and copying to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: To-Do List Manager",
      "code": """"
Program 1: To-Do List Manager
A complete task management system using lists.
Demonstrates list methods, slicing, and shallow vs deep copy.
"""

from datetime import datetime
from copy import deepcopy

class Task:
    """A single to-do task."""

    def __init__(self, title, priority="medium", tags=None):
        self.title = title
        self.priority = priority
        self.tags = tags or []
        self.completed = False
        self.created = datetime.now()

    def complete(self):
        self.completed = True

    def __repr__(self):
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.title} ({self.priority})"

class TodoList:
    """A list of tasks with full CRUD operations."""

    def __init__(self, name="My Tasks"):
        self.name = name
        self.tasks = []
        self._history = []

    def add(self, title, priority="medium", tags=None):
        """Add a new task."""
        task = Task(title, priority, tags)
        self.tasks.append(task)
        self._save_state()
        return task

    def remove(self, index):
        """Remove task by index."""
        if 0 <= index < len(self.tasks):
            removed = self.tasks.pop(index)
            self._save_state()
            return removed
        raise IndexError(f"Task index {index} out of range")

    def complete(self, index):
        """Mark task as completed."""
        if 0 <= index < len(self.tasks):
            self.tasks[index].complete()
            self._save_state()
            return self.tasks[index]
        raise IndexError(f"Task index {index} out of range")

    def list_by_priority(self):
        """Return tasks sorted by priority."""
        priority_order = {"high": 0, "medium": 1, "low": 2}
        return sorted(self.tasks, key=lambda t: priority_order.get(t.priority, 3))

    def list_by_tag(self, tag):
        """Return tasks with specific tag."""
        return [t for t in self.tasks if tag in t.tags]

    def pending(self):
        """Return only pending tasks."""
        return [t for t in self.tasks if not t.completed]

    def completed(self):
        """Return only completed tasks."""
        return [t for t in self.tasks if t.completed]

    def clear_completed(self):
        """Remove all completed tasks."""
        self.tasks = [t for t in self.tasks if not t.completed]
        self._save_state()

    def undo(self):
        """Undo last operation."""
        if len(self._history) > 1:
            self._history.pop()
            self.tasks = deepcopy(self._history[-1])
            return True
        return False

    def _save_state(self):
        """Save current state for undo."""
        self._history.append(deepcopy(self.tasks))
        if len(self._history) > 10:
            self._history.pop(0)

    def __repr__(self):
        lines = [f"\n=== {self.name} ==="]
        for i, task in enumerate(self.tasks):
            lines.append(f"  {i}: {task}")
        return "\n".join(lines)

def main():
    """Main to-do list program."""
    print("=" * 50)
    print("TO-DO LIST MANAGER")
    print("=" * 50)

    todo = TodoList("Work Tasks")

    # Add tasks
    todo.add("Review pull requests", "high", ["dev", "urgent"])
    todo.add("Write documentation", "medium", ["docs"])
    todo.add("Fix bug #42", "high", ["dev", "bug"])
    todo.add("Team meeting", "low", ["meeting"])
    print(todo)

    # Complete a task
    print("\n--- Completing task 1 ---")
    todo.complete(1)
    print(todo)

    # List by priority
    print("\n--- By Priority ---")
    for task in todo.list_by_priority():
        print(f"  {task}")

    # Filter by tag
    print("\n--- Dev Tasks ---")
    for task in todo.list_by_tag("dev"):
        print(f"  {task}")

    # Undo
    print("\n--- Undo ---")
    todo.undo()
    print(todo)

    # Clear completed
    print("\n--- Clear Completed ---")
    todo.clear_completed()
    print(todo)

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 2: Matrix Operations",
      "code": """"
Program 2: Matrix Operations
Complete matrix math using nested lists.
Demonstrates nested comprehensions, slicing, and deep copy.
"""

from copy import deepcopy

class Matrix:
    """A matrix implemented as nested lists."""

    def __init__(self, data):
        """Initialize from nested list."""
        if not data or not all(len(row) == len(data[0]) for row in data):
            raise ValueError("All rows must have the same length")
        self.data = deepcopy(data)
        self.rows = len(data)
        self.cols = len(data[0]) if data else 0

    @classmethod
    def zeros(cls, rows, cols):
        """Create a zero matrix."""
        return cls([[0 for _ in range(cols)] for _ in range(rows)])

    @classmethod
    def identity(cls, n):
        """Create an identity matrix."""
        return cls([[1 if i == j else 0 for j in range(n)] for i in range(n)])

    @classmethod
    def random(cls, rows, cols, min_val=0, max_val=10):
        """Create a random matrix."""
        import random
        return cls([[random.randint(min_val, max_val) for _ in range(cols)] for _ in range(rows)])

    def __add__(self, other):
        """Matrix addition."""
        if self.rows != other.rows or self.cols != other.cols:
            raise ValueError("Matrices must have same dimensions")
        return Matrix([[a + b for a, b in zip(row1, row2)]
                       for row1, row2 in zip(self.data, other.data)])

    def __mul__(self, other):
        """Matrix multiplication."""
        if isinstance(other, (int, float)):
            return Matrix([[x * other for x in row] for row in self.data])
        if self.cols != other.rows:
            raise ValueError("Incompatible dimensions for multiplication")
        return Matrix([[sum(a * b for a, b in zip(row, col))
                       for col in zip(*other.data)]
                       for row in self.data])

    def transpose(self):
        """Return transposed matrix."""
        return Matrix([list(row) for row in zip(*self.data)])

    def diagonal(self):
        """Return diagonal elements."""
        return [self.data[i][i] for i in range(min(self.rows, self.cols))]

    def trace(self):
        """Return sum of diagonal."""
        return sum(self.diagonal())

    def get_row(self, i):
        """Return row i."""
        return self.data[i][:]

    def get_col(self, j):
        """Return column j."""
        return [row[j] for row in self.data]

    def submatrix(self, row_start, row_end, col_start, col_end):
        """Return a submatrix using slicing."""
        return Matrix([row[col_start:col_end] for row in self.data[row_start:row_end]])

    def __repr__(self):
        lines = ["Matrix:"]
        for row in self.data:
            lines.append("  " + " ".join(f"{x:4d}" for x in row))
        return "\n".join(lines)

    def __getitem__(self, key):
        """Support matrix[i][j] indexing."""
        return self.data[key]

def main():
    """Main matrix program."""
    print("=" * 50)
    print("MATRIX OPERATIONS")
    print("=" * 50)

    # Create matrices
    A = Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    B = Matrix([[9, 8, 7], [6, 5, 4], [3, 2, 1]])

    print(f"\n{A}")
    print(f"\n{B}")

    # Addition
    C = A + B
    print(f"\nA + B:\n{C}")

    # Scalar multiplication
    D = A * 2
    print(f"\nA * 2:\n{D}")

    # Matrix multiplication
    E = A * B
    print(f"\nA * B:\n{E}")

    # Transpose
    F = A.transpose()
    print(f"\nA^T:\n{F}")

    # Diagonal and trace
    print(f"\nDiagonal of A: {A.diagonal()}")
    print(f"Trace of A: {A.trace()}")

    # Identity matrix
    I = Matrix.identity(3)
    print(f"\nI_3:\n{I}")

    # Submatrix
    sub = A.submatrix(0, 2, 0, 2)
    print(f"\nSubmatrix A[0:2, 0:2]:\n{sub}")

    # Random matrix
    R = Matrix.random(3, 3, 1, 5)
    print(f"\nRandom 3x3:\n{R}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 3: Sieve of Eratosthenes",
      "code": """"
Program 3: Sieve of Eratosthenes
Finds all prime numbers up to n using list manipulation.
Demonstrates list initialization, slicing, and comprehensions.
"""

import time
import math

class PrimeSieve:
    """Sieve of Eratosthenes for prime generation."""

    @staticmethod
    def find_primes(n):
        """
        Find all primes up to n using the Sieve of Eratosthenes.
        Time: O(n log log n), Space: O(n)
        """
        if n < 2:
            return []

        # Initialize: True means potentially prime
        is_prime = [True] * (n + 1)
        is_prime[0] = is_prime[1] = False

        # Sieve: mark multiples of each prime starting from 2
        for i in range(2, int(math.sqrt(n)) + 1):
            if is_prime[i]:
                # Mark multiples of i as composite
                # Start at i*i, step by i
                is_prime[i*i:n+1:i] = [False] * len(range(i*i, n+1, i))

        # Extract primes using list comprehension
        return [i for i, prime in enumerate(is_prime) if prime]

    @staticmethod
    def find_primes_optimized(n):
        """
        Optimized version: only sieve odd numbers.
        Reduces memory by half and skips even numbers.
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
                # Mark multiples of p starting at p*p
                # p*p = 4i^2 + 12i + 9, step = 2p
                start = (p * p - 3) // 2
                is_prime[start:size:p] = [False] * len(range(start, size, p))

        # Reconstruct primes
        primes = [2]
        primes.extend(2 * i + 3 for i, val in enumerate(is_prime) if val)
        return [p for p in primes if p <= n]

    @staticmethod
    def is_prime(n):
        """Check if n is prime using trial division."""
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
    def prime_factors(n):
        """Return prime factorization of n."""
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
    """Main sieve program."""
    print("=" * 50)
    print("SIEVE OF ERATOSTHENES")
    print("=" * 50)

    n = 100

    # Basic sieve
    start = time.perf_counter()
    primes = PrimeSieve.find_primes(n)
    basic_time = time.perf_counter() - start

    print(f"\nPrimes up to {n}: {primes}")
    print(f"Count: {len(primes)}")
    print(f"Basic sieve time: {basic_time:.6f}s")

    # Optimized sieve
    start = time.perf_counter()
    primes_opt = PrimeSieve.find_primes_optimized(n)
    opt_time = time.perf_counter() - start

    print(f"\nOptimized sieve time: {opt_time:.6f}s")
    print(f"Speedup: {basic_time/opt_time:.1f}x")

    # Large test
    n_large = 1000000
    start = time.perf_counter()
    primes_large = PrimeSieve.find_primes_optimized(n_large)
    large_time = time.perf_counter() - start

    print(f"\nPrimes up to {n_large}: {len(primes_large)} primes found")
    print(f"Time: {large_time:.4f}s")

    # Prime factors
    print(f"\nPrime factors of 360: {PrimeSieve.prime_factors(360)}")
    print(f"Prime factors of 97: {PrimeSieve.prime_factors(97)}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 4: List Comprehension Challenges",
      "code": """"
Program 4: List Comprehension Challenges
Advanced list manipulation using comprehensions.
Demonstrates nested comprehensions, filtering, and transformations.
"""

class ListChallenges:
    """Collection of list comprehension challenges."""

    @staticmethod
    def pascals_triangle(n):
        """
        Generate Pascal's Triangle up to n rows.
        Each row is a list; returns list of lists.
        """
        triangle = [[1]]
        for i in range(1, n):
            # Each element is sum of two elements above it
            row = [1] + [triangle[i-1][j] + triangle[i-1][j+1]
                         for j in range(len(triangle[i-1]) - 1)] + [1]
            triangle.append(row)
        return triangle

    @staticmethod
    def flatten(nested):
        """
        Flatten a nested list structure.
        Handles arbitrary nesting depth.
        """
        result = []
        for item in nested:
            if isinstance(item, list):
                result.extend(ListChallenges.flatten(item))
            else:
                result.append(item)
        return result

    @staticmethod
    def flatten_comprehension(nested):
        """
        Flatten one level using comprehension.
        (For arbitrary depth, recursion is needed)
        """
        return [x for sublist in nested for x in sublist]

    @staticmethod
    def transpose(matrix):
        """Transpose a matrix using zip and comprehension."""
        return [list(row) for row in zip(*matrix)]

    @staticmethod
    def cartesian_product(a, b):
        """Cartesian product of two lists."""
        return [(x, y) for x in a for y in b]

    @staticmethod
    def powerset(items):
        """
        Generate all subsets of a set.
        Uses binary representation: each bit represents inclusion.
        """
        n = len(items)
        return [[items[j] for j in range(n) if i & (1 << j)]
                for i in range(2 ** n)]

    @staticmethod
    def running_average(numbers):
        """Calculate running average at each point."""
        return [sum(numbers[:i+1]) / (i+1) for i in range(len(numbers))]

    @staticmethod
    def sliding_window(numbers, size):
        """Create sliding windows of given size."""
        return [numbers[i:i+size] for i in range(len(numbers) - size + 1)]

    @staticmethod
    def merge_sorted(a, b):
        """
        Merge two sorted lists into one sorted list.
        (For educational purposes; real code uses heapq.merge)
        """
        result = []
        i = j = 0
        while i < len(a) and j < len(b):
            if a[i] <= b[j]:
                result.append(a[i])
                i += 1
            else:
                result.append(b[j])
                j += 1
        result.extend(a[i:])
        result.extend(b[j:])
        return result

    @staticmethod
    def find_duplicates(items):
        """Find all duplicate items using a set."""
        seen = set()
        duplicates = set()
        for item in items:
            if item in seen:
                duplicates.add(item)
            seen.add(item)
        return sorted(duplicates)

    @staticmethod
    def rotate(items, k):
        """Rotate list by k positions."""
        if not items:
            return items
        k = k % len(items)
        return items[-k:] + items[:-k]

def main():
    """Main challenges program."""
    print("=" * 50)
    print("LIST COMPREHENSION CHALLENGES")
    print("=" * 50)

    # Pascal's Triangle
    print("\nPascal's Triangle (5 rows):")
    for row in ListChallenges.pascals_triangle(5):
        print(f"  {row}")

    # Flatten
    nested = [1, [2, 3], [4, [5, 6]], 7]
    print(f"\nFlatten {nested}:")
    print(f"  {ListChallenges.flatten(nested)}")

    # Transpose
    matrix = [[1, 2, 3], [4, 5, 6]]
    print(f"\nTranspose {matrix}:")
    print(f"  {ListChallenges.transpose(matrix)}")

    # Cartesian product
    colors = ['red', 'green']
    sizes = ['S', 'M', 'L']
    print(f"\nCartesian product {colors} x {sizes}:")
    for combo in ListChallenges.cartesian_product(colors, sizes):
        print(f"  {combo}")

    # Powerset
    items = ['a', 'b', 'c']
    print(f"\nPowerset of {items}:")
    for subset in ListChallenges.powerset(items):
        print(f"  {subset}")

    # Sliding window
    data = [1, 2, 3, 4, 5, 6]
    print(f"\nSliding window (size 3) of {data}:")
    print(f"  {ListChallenges.sliding_window(data, 3)}")

    # Rotate
    print(f"\nRotate {data} by 2:")
    print(f"  {ListChallenges.rotate(data, 2)}")

    # Merge sorted
    a, b = [1, 3, 5], [2, 4, 6]
    print(f"\nMerge {a} and {b}:")
    print(f"  {ListChallenges.merge_sorted(a, b)}")

    # Find duplicates
    items = [1, 2, 2, 3, 3, 3, 4, 5, 5]
    print(f"\nDuplicates in {items}:")
    print(f"  {ListChallenges.find_duplicates(items)}")

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
      "text": "Answer these before moving to Part 11. 4/5 correct means you have mastered Python lists."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain why Python lists are called dynamic arrays, not linked lists. What is the time complexity of append, insert at index 0, and indexing? Why is append at the end O(1) amortized but O(n) in the worst case?",
        "Q2: Write a list comprehension that generates all Pythagorean triples (a, b, c) where a² + b² = c² for a, b, c ≤ 50. Then rewrite it as a nested for loop. Which is more readable and why?",
        "Q3: Explain the difference between shallow copy and deep copy with a concrete example involving nested lists. When would you use each? What is the 'trap' that causes bugs with shallow copies?",
        "Q4: What does list[::-1] do? What does list[::2] do? Write a function that checks if a list is a palindrome using slicing. Then write it without slicing. Which is more Pythonic?",
        "Q5: Explain why list.sort() returns None but sorted(list) returns a new list. Write code that demonstrates the difference. When would you use each?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Python lists are dynamic arrays — contiguous memory blocks that resize when full. append is O(1) amortized because Python over-allocates (doubles capacity), making reallocation rare. Worst case is O(n) when reallocation occurs. insert at index 0 is O(n) because all elements must shift. Indexing is O(1) because elements are contiguous. Linked lists would have O(1) insertion at front but O(n) indexing. Python chose arrays for fast indexing, which is the dominant operation. A2: [(a, b, c) for a in range(1, 51) for b in range(a, 51) for c in range(b, 51) if a**2 + b**2 == c**2]. The comprehension is more readable for this simple nested logic because it declares intent (what, not how). For complex logic with many conditions, a loop may be clearer. A3: Shallow copy creates a new list but references the same inner objects. Deep copy recursively copies everything. Example: original = [[1, 2], [3, 4]]; shallow = original.copy(); shallow[0][0] = 99 modifies original too! The trap is that shallow copy looks correct until nested elements are modified. Use shallow copy for flat lists of immutable objects. Use deepcopy for nested structures or lists of objects. A4: list[::-1] reverses the list. list[::2] takes every second element. Palindrome with slicing: return lst == lst[::-1]. Without slicing: for i in range(len(lst)//2): if lst[i] != lst[-(i+1)]: return False; return True. The slicing version is more Pythonic — it declares intent (is it equal to its reverse?) rather than describing the algorithm. A5: list.sort() sorts in-place (mutates the list) and returns None by convention. sorted(list) creates a new sorted list and returns it. Use list.sort() when you don't need the original order. Use sorted() when you need to preserve the original. This follows Python's principle: mutating methods return None to prevent accidental chaining that would modify data unexpectedly."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python lists. You understand dynamic arrays — why append is amortized O(1), why insertion at the front is O(n), and why indexing is O(1). You wield all 11 list methods with confidence, knowing which mutate and which return new objects. You slice sequences with the precision of a surgeon, using start:stop:step to extract, reverse, and modify. You write list comprehensions that are faster and more readable than loops, knowing when to use them and when to avoid them. You navigate the shallow vs deep copy trap with wisdom, understanding when each is appropriate. You have built four complete programs: a to-do list manager with undo, a matrix operations library, a prime number sieve, and a collection of list comprehension challenges. Lists are no longer just containers. They are the workhorse that powers your Python programs."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Lists are dynamic arrays. Appending is cheap. Slicing is elegant. Comprehensions are fast. Copying is subtle. Master these four truths, and you have mastered the most important data structure in Python. In Part 11, we will explore Tuples & Immutability — the lightweight, hashable cousin of lists that signals intent and enables dictionary keys."
    },
    {
      "type": "cta",
      "text": "Start Part 11: Tuples & Immutability →",
      "href": "/tutorials/python-unlocked/part-11-tuples-immutability",
      "note": "24 min read · Hashability · Packing/unpacking · Named tuples · Immutable config"
    }
  ]
};

export default post;
