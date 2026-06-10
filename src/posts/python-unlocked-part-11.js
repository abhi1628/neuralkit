const post = {
  "slug": "part-11-tuples-immutability",
  "seriesSlug": "python-unlocked",
  "partNumber": 11,
  "totalParts": 30,
  "title": "Tuples & Immutability: The Immutable Foundation (Part 11)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "24 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Hashability, performance, intent signaling. Tuple packing/unpacking, *rest syntax, named tuples, the id() trick, and immutable configuration patterns. Python 3.12 features included.",
  "coverEmoji": "🔒",
  "tags": [
    "Python", "Tuples", "Immutability", "Hashability",
    "Packing", "Unpacking", "Named Tuples", "Intent Signaling",
    "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1972, Barbara Liskov and Stephen Zilles introduced the concept of abstract data types at MIT. Their insight was simple: the behavior of data matters more than its representation. Fifty-four years later, in 2026, Python tuples embody that philosophy. A tuple is not a list that forgot how to mutate. It is a deliberate design choice that signals intent, guarantees hashability, enables dictionary keys, and unlocks the most elegant syntax in Python: unpacking. But tuples have a secret. They are not truly immutable — they contain references, and those references can point to mutable objects. This is the 'immutable container, mutable contents' paradox that separates junior developers from seniors. In this part, we will explore the full depth of tuples and immutability. You will learn why tuples exist, how packing and unpacking work, why named tuples are better than dictionaries for structured data, and how to use the id() trick to 'modify' tuples via concatenation. By the end, immutability will not be a restriction. It will be a superpower."
    },
    {
      "type": "h2",
      "text": "Why Tuples Exist: Three Reasons"
    },
    {
      "type": "p",
      "text": "Tuples exist for three reasons: hashability, performance, and intent signaling. Hashability means tuples can be used as dictionary keys and set elements — something lists can never do. Performance means tuples use less memory and are faster to create than lists. Intent signaling means using a tuple tells other programmers: 'This data is fixed. Do not modify it.' These three reasons make tuples indispensable, not optional."
    },
    {
      "type": "code-block",
      "label": "Why Tuples Exist",
      "code": "# === REASON 1: HASHABILITY ===
# Tuples can be dictionary keys and set elements

# Lists are unhashable (mutable = cannot be hashed)
try:
    {[1, 2]: "value"}
except TypeError as e:
    print(f"List as dict key: {e}")

# Tuples are hashable (immutable = can be hashed)
locations = {
    (40.7128, -74.0060): "New York",
    (51.5074, -0.1278): "London",
    (35.6762, 139.6503): "Tokyo",
}

nyc = (40.7128, -74.0060)
print(f"\nCoordinates {nyc} -> {locations[nyc]}")

# Sets of tuples
unique_routes = {("A", "B"), ("B", "C"), ("A", "B")}
print(f"Unique routes: {unique_routes}")

# === REASON 2: PERFORMANCE ===
# Tuples use less memory and are faster to create

import sys, time

# Memory comparison
list_data = [1, 2, 3, 4, 5]
tuple_data = (1, 2, 3, 4, 5)

print(f"\nList size:  {sys.getsizeof(list_data)} bytes")
print(f"Tuple size: {sys.getsizeof(tuple_data)} bytes")

# Speed comparison
n = 1000000

start = time.perf_counter()
for _ in range(n):
    lst = [1, 2, 3, 4, 5]
list_time = time.perf_counter() - start

start = time.perf_counter()
for _ in range(n):
    tup = (1, 2, 3, 4, 5)
tuple_time = time.perf_counter() - start

print(f"\nCreate {n} lists: {list_time:.4f}s")
print(f"Create {n} tuples: {tuple_time:.4f}s")
print(f"Speedup: {list_time/tuple_time:.1f}x")

# Iteration speed
big_list = list(range(10000))
big_tuple = tuple(range(10000))

start = time.perf_counter()
for _ in range(1000):
    sum(big_list)
list_iter = time.perf_counter() - start

start = time.perf_counter()
for _ in range(1000):
    sum(big_tuple)
tuple_iter = time.perf_counter() - start

print(f"\nSum list 1000x: {list_iter:.4f}s")
print(f"Sum tuple 1000x: {tuple_iter:.4f}s")

# === REASON 3: INTENT SIGNALING ===
# Using a tuple says 'this data is fixed'

# BAD: List for fixed data
def get_dimensions_bad():
    return [1920, 1080]  # Could be modified by caller

# GOOD: Tuple for fixed data
def get_dimensions_good():
    return (1920, 1080)  # Immutable guarantee

# Even better: unpacking makes intent clear
width, height = get_dimensions_good()
print(f"\nScreen: {width}x{height}")

# === THE IMMUTABILITY PARADOX ===
# Tuples are immutable containers with mutable contents

# The tuple itself cannot change...
t = (1, 2, 3)
# t[0] = 99  # TypeError!

# ...but mutable objects inside can change
nested = ([1, 2], [3, 4])
nested[0].append(99)
print(f"\n'Immutable' tuple after mutation: {nested}")
print(f"Hashable now? Try it...")
try:
    {nested: "value"}
except TypeError as e:
    print(f"  {e}")

print("\nTuple fundamentals complete!")"
    },
    {
      "type": "h2",
      "text": "Packing & Unpacking: Python’s Most Elegant Syntax"
    },
    {
      "type": "p",
      "text": "Tuple packing and unpacking is the most elegant syntax in Python. Packing is creating a tuple without parentheses. Unpacking is assigning tuple elements to multiple variables in one line. The *rest syntax (introduced in Python 3) allows capturing remaining elements. This is not just syntax sugar — it eliminates entire classes of bugs related to index errors and makes code self-documenting."
    },
    {
      "type": "code-block",
      "label": "Packing & Unpacking Mastery",
      "code": "# === PACKING ===
# Creating tuples without parentheses (tuple literal)

coordinates = 40.7128, -74.0060  # Packed tuple
print(f"Packed: {coordinates}, type: {type(coordinates).__name__}")

# Multiple return values are packed automatically
def get_user():
    return "Alice", 30, "Engineer"  # Returns a tuple

user = get_user()
print(f"\nReturned tuple: {user}")

# === UNPACKING ===
# Assigning tuple elements to variables

name, age, job = get_user()
print(f"Unpacked: name={name}, age={age}, job={job}")

# Unpacking in loops
users = [("Alice", 30), ("Bob", 25), ("Charlie", 35)]
print("\nLoop unpacking:")
for name, age in users:
    print(f"  {name} is {age} years old")

# === THE *rest SYNTAX ===
# Capture remaining elements

first, *middle, last = [1, 2, 3, 4, 5]
print(f"\nfirst={first}, middle={middle}, last={last}")

# Unpacking with ignore
a, _, c = (1, 2, 3)
print(f"\nIgnored middle: a={a}, c={c}")

# Multiple ignores
x, _, _, y = (10, 20, 30, 40)
print(f"Multiple ignores: x={x}, y={y}")

# Extended unpacking with *
head, *tail = [1, 2, 3, 4, 5]
print(f"\nhead={head}, tail={tail}")

*init, last = [1, 2, 3, 4, 5]
print(f"init={init}, last={last}")

# === UNPACKING WITH FUNCTIONS ===
# *args collects positional arguments into a tuple

def print_args(a, b, *args):
    print(f"\nRequired: {a}, {b}")
    print(f"Extra: {args} (type: {type(args).__name__})")

print_args(1, 2, 3, 4, 5)

# Unpacking into function call
values = (10, 20, 30)
print_args(*values)  # Equivalent to print_args(10, 20, 30)

# === UNPACKING DICTIONARIES ===
# **kwargs collects keyword arguments into a dict

def print_kwargs(name, **kwargs):
    print(f"\nName: {name}")
    for key, value in kwargs.items():
        print(f"  {key}: {value}")

print_kwargs("Alice", age=30, city="NYC", job="Engineer")

# Unpacking dict into function call
user_info = {"name": "Bob", "age": 25, "city": "LA"}
print_kwargs(**user_info)  # Equivalent to print_kwargs(name="Bob", age=25, city="LA")

# === SIMULTANEOUS UNPACKING ===
# Swap variables without temporary storage

a, b = 10, 20
print(f"\nBefore swap: a={a}, b={b}")
a, b = b, a
print(f"After swap: a={a}, b={b}")

# Multiple swaps
x, y, z = 1, 2, 3
x, y, z = z, x, y  # Rotate
print(f"After rotation: x={x}, y={y}, z={z}")

# === ENUMERATE AND ZIP UNPACKING ===
# enumerate returns (index, value) tuples

fruits = ["apple", "banana", "cherry"]
print("\nEnumerate unpacking:")
for i, fruit in enumerate(fruits, 1):
    print(f"  {i}. {fruit}")

# zip returns tuples of parallel elements
names = ["Alice", "Bob", "Charlie"]
ages = [30, 25, 35]
print("\nZip unpacking:")
for name, age in zip(names, ages):
    print(f"  {name}: {age}")

# === NESTED UNPACKING ===
# Unpack nested structures

data = ("Alice", (30, "Engineer"), ["Python", "Rust"])
name, (age, job), skills = data
print(f"\nNested: {name}, {age}, {job}, {skills}")

# === THE _ CONVENTION ===
# _ is a valid variable name, conventionally used for 'don't care'

point = (10, 20, 30)
x, _, z = point
print(f"\nUsing _: x={x}, z={z}")

# In loops, _ means 'I don't need this value'
for _ in range(3):
    print("  Doing something 3 times")

print("\nPacking & unpacking mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Named Tuples: Self-Documenting Data Structures"
    },
    {
      "type": "p",
      "text": "Named tuples are tuples with named fields. They combine the immutability and memory efficiency of tuples with the readability of dictionaries. There are two implementations: collections.namedtuple (the classic) and typing.NamedTuple (the modern, type-hinted version). Named tuples are perfect for structured data that should not change: database rows, coordinates, RGB colors, API responses. They are lighter than dictionaries and self-documenting."
    },
    {
      "type": "code-block",
      "label": "Named Tuples Mastery",
      "code": "# === collections.namedtuple ===
# The classic named tuple from the standard library

from collections import namedtuple

# Define a named tuple class
Point = namedtuple('Point', ['x', 'y'])
Person = namedtuple('Person', 'name age job')  # Space-separated also works

# Create instances
p = Point(10, 20)
alice = Person('Alice', 30, 'Engineer')

print(f"Point: {p}")
print(f"Person: {alice}")

# Access by name (readable) or index (fast)
print(f"\np.x = {p.x}, p[0] = {p[0]}")
print(f"alice.name = {alice.name}, alice[0] = {alice[0]}")

# Unpacking works too
x, y = p
print(f"Unpacked point: x={x}, y={y}")

# === typing.NamedTuple ===
# Modern version with type hints (Python 3.6+)

from typing import NamedTuple, List

class TypedPoint(NamedTuple):
    x: float
    y: float

class TypedPerson(NamedTuple):
    name: str
    age: int
    skills: List[str]

tp = TypedPoint(10.5, 20.5)
tperson = TypedPerson('Bob', 25, ['Python', 'JavaScript'])

print(f"\nTypedPoint: {tp}")
print(f"TypedPerson: {tperson}")

# Type hints help IDEs and linters catch errors
# tp.x = "hello"  # Type checker would flag this

# === _replace() METHOD ===
# Create a new named tuple with modified fields

p2 = p._replace(x=99)
print(f"\nOriginal: {p}")
print(f"Replaced: {p2}")

# Common pattern: update function
def move_point(point, dx, dy):
    return point._replace(x=point.x + dx, y=point.y + dy)

p3 = move_point(p, 5, 10)
print(f"Moved: {p3}")

# === _asdict() METHOD ===
# Convert to OrderedDict (useful for JSON serialization)

print(f"\nAs dict: {alice._asdict()}")

# === _fields ATTRIBUTE ===
# Get field names as a tuple

print(f"Person fields: {Person._fields}")
print(f"Point fields: {Point._fields}")

# === CONVERTING FROM DICT ===
# Create named tuple from dictionary

data = {'name': 'Charlie', 'age': 35, 'job': 'Designer'}
charlie = Person(**data)
print(f"\nFrom dict: {charlie}")

# === NAMED TUPLE VS DICT VS CLASS ===
# Performance comparison

import sys, time

# Memory
dict_person = {'name': 'Alice', 'age': 30, 'job': 'Engineer'}
named_person = Person('Alice', 30, 'Engineer')

print(f"\nDict size:  {sys.getsizeof(dict_person)} bytes")
print(f"NamedTuple: {sys.getsizeof(named_person)} bytes")

# Creation speed
n = 1000000

start = time.perf_counter()
for _ in range(n):
    d = {'name': 'Alice', 'age': 30, 'job': 'Engineer'}
dict_time = time.perf_counter() - start

start = time.perf_counter()
for _ in range(n):
    t = Person('Alice', 30, 'Engineer')
tuple_time = time.perf_counter() - start

print(f"\nCreate {n} dicts: {dict_time:.4f}s")
print(f"Create {n} named tuples: {tuple_time:.4f}s")
print(f"Speedup: {dict_time/tuple_time:.1f}x")

# === REAL-WORLD: DATABASE ROW ===
# Named tuples are perfect for query results

class UserRecord(NamedTuple):
    id: int
    username: str
    email: str
    is_active: bool

# Simulated database query
rows = [
    UserRecord(1, 'alice', 'alice@example.com', True),
    UserRecord(2, 'bob', 'bob@example.com', False),
    UserRecord(3, 'charlie', 'charlie@example.com', True),
]

print(f"\nActive users:")
for user in rows:
    if user.is_active:
        print(f"  {user.username} <{user.email}>")

print("\nNamed tuples mastery complete!")"
    },
    {
      "type": "h2",
      "text": "The id() Trick: Tuple 'Modification' via Concatenation"
    },
    {
      "type": "p",
      "text": "Tuples are immutable, but you can create new tuples by concatenating slices. This is not mutation — it is creation. The id() function reveals the truth: every concatenation creates a new tuple with a new identity. This technique is used in functional programming to build new state from old state, and it is the foundation of persistent data structures."
    },
    {
      "type": "code-block",
      "label": "The id() Trick",
      "code": "# === THE id() FUNCTION ===
# Returns the unique identity of an object (memory address)

a = (1, 2, 3)
print(f"Original tuple: {a}")
print(f"Original id:    {id(a)}")

# Concatenation creates a NEW tuple
b = a + (4,)
print(f"\nAfter a + (4,): {b}")
print(f"New id:         {id(b)}")
print(f"Same object?    {a is b}")

# Original is unchanged
print(f"Original still: {a}")

# === SLICE + CONCATENATION ===
# 'Modify' a tuple by rebuilding it

def tuple_replace(t, index, value):
    """Return new tuple with element at index replaced."""
    return t[:index] + (value,) + t[index+1:]

def tuple_insert(t, index, value):
    """Return new tuple with value inserted at index."""
    return t[:index] + (value,) + t[index:]

def tuple_delete(t, index):
    """Return new tuple with element at index removed."""
    return t[:index] + t[index+1:]

def tuple_append(t, value):
    """Return new tuple with value appended."""
    return t + (value,)

# Demonstrate
t = (1, 2, 3, 4, 5)
print(f"\nOriginal: {t}")

print(f"Replace index 2 with 99: {tuple_replace(t, 2, 99)}")
print(f"Insert 77 at index 2:    {tuple_insert(t, 2, 77)}")
print(f"Delete index 2:          {tuple_delete(t, 2)}")
print(f"Append 6:                {tuple_append(t, 6)}")
print(f"Original unchanged:        {t}")

# === FUNCTIONAL STATE UPDATES ===
# Building new state from old state (no mutation)

def add_tag(item, tag):
    """Add a tag to an item's tag tuple (immutable update)."""
    if tag not in item['tags']:
        return {
            **item,
            'tags': item['tags'] + (tag,)
        }
    return item

item = {'name': 'Laptop', 'tags': ('electronics', 'computers')}
new_item = add_tag(item, 'portable')
print(f"\nOriginal: {item}")
print(f"Updated:  {new_item}")

# === PERSISTENT DATA STRUCTURES ===
# Functional programming: state evolves through new objects

class ImmutableStack:
    """A stack implemented with tuples (persistent)."""

    def __init__(self, items=()):
        self._items = items

    def push(self, item):
        """Return new stack with item pushed."""
        return ImmutableStack((item,) + self._items)

    def pop(self):
        """Return (top_item, new_stack)."""
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items[0], ImmutableStack(self._items[1:])

    def peek(self):
        return self._items[0] if self._items else None

    def __len__(self):
        return len(self._items)

    def __repr__(self):
        return f"ImmutableStack({list(self._items)})"

stack = ImmutableStack()
print(f"\nEmpty stack: {stack}")

s1 = stack.push(10)
s2 = s1.push(20)
s3 = s2.push(30)
print(f"After pushes: {s1}, {s2}, {s3}")

top, s4 = s3.pop()
print(f"Popped {top}, remaining: {s4}")
print(f"Old stack still valid: {s3}")

print("\nid() trick mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use tuples, unpacking, named tuples, and immutability to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Coordinate System",
      "code": """"
Program 1: Coordinate System
2D/3D coordinate operations using tuples.
Demonstrates tuple math, unpacking, and named tuples.
"""

import math
from typing import NamedTuple

class Point2D(NamedTuple):
    x: float
    y: float

class Point3D(NamedTuple):
    x: float
    y: float
    z: float

class CoordinateSystem:
    """Coordinate operations with immutable points."""

    @staticmethod
    def distance_2d(p1: Point2D, p2: Point2D) -> float:
        """Euclidean distance between two 2D points."""
        dx = p2.x - p1.x
        dy = p2.y - p1.y
        return math.sqrt(dx**2 + dy**2)

    @staticmethod
    def distance_3d(p1: Point3D, p2: Point3D) -> float:
        """Euclidean distance between two 3D points."""
        dx = p2.x - p1.x
        dy = p2.y - p1.y
        dz = p2.z - p1.z
        return math.sqrt(dx**2 + dy**2 + dz**2)

    @staticmethod
    def midpoint_2d(p1: Point2D, p2: Point2D) -> Point2D:
        """Midpoint of two 2D points."""
        return Point2D((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)

    @staticmethod
    def translate_2d(p: Point2D, dx: float, dy: float) -> Point2D:
        """Translate point by (dx, dy)."""
        return Point2D(p.x + dx, p.y + dy)

    @staticmethod
    def scale_2d(p: Point2D, factor: float) -> Point2D:
        """Scale point by factor from origin."""
        return Point2D(p.x * factor, p.y * factor)

    @staticmethod
    def bounding_box(points: list[Point2D]) -> tuple[Point2D, Point2D]:
        """Return (min_point, max_point) bounding box."""
        if not points:
            raise ValueError("No points provided")
        xs = [p.x for p in points]
        ys = [p.y for p in points]
        return Point2D(min(xs), min(ys)), Point2D(max(xs), max(ys))

    @staticmethod
    def polygon_area(points: list[Point2D]) -> float:
        """Calculate polygon area using shoelace formula."""
        if len(points) < 3:
            return 0.0
        n = len(points)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += points[i].x * points[j].y
            area -= points[j].x * points[i].y
        return abs(area) / 2

def main():
    """Main coordinate program."""
    print("=" * 50)
    print("COORDINATE SYSTEM")
    print("=" * 50)

    # 2D operations
    a = Point2D(0, 0)
    b = Point2D(3, 4)
    c = Point2D(6, 0)

    print(f"\nPoints: a={a}, b={b}, c={c}")
    print(f"Distance a->b: {CoordinateSystem.distance_2d(a, b):.2f}")
    print(f"Midpoint a,b: {CoordinateSystem.midpoint_2d(a, b)}")
    print(f"Translate b by (1,1): {CoordinateSystem.translate_2d(b, 1, 1)}")
    print(f"Scale b by 2: {CoordinateSystem.scale_2d(b, 2)}")

    # Bounding box
    points = [Point2D(1, 2), Point2D(5, 8), Point2D(3, 1), Point2D(7, 5)]
    min_p, max_p = CoordinateSystem.bounding_box(points)
    print(f"\nBounding box of {points}:")
    print(f"  Min: {min_p}, Max: {max_p}")

    # Polygon area
    triangle = [Point2D(0, 0), Point2D(4, 0), Point2D(2, 3)]
    area = CoordinateSystem.polygon_area(triangle)
    print(f"\nTriangle area: {area:.2f}")

    # 3D operations
    p1 = Point3D(1, 2, 3)
    p2 = Point3D(4, 6, 8)
    print(f"\n3D distance {p1} -> {p2}: {CoordinateSystem.distance_3d(p1, p2):.2f}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 2: Function Multi-Return",
      "code": """"
Program 2: Function Multi-Return
Functions that return multiple values using tuples.
Demonstrates packing, unpacking, and named tuple returns.
"""

from typing import NamedTuple, Optional
from dataclasses import dataclass

class DivisionResult(NamedTuple):
    quotient: float
    remainder: float
    exact: bool

class SearchResult(NamedTuple):
    found: bool
    index: int
    value: Optional[str]

class StatsResult(NamedTuple):
    count: int
    total: float
    average: float
    minimum: float
    maximum: float
    median: float

class MultiReturn:
    """Functions that return multiple values."""

    @staticmethod
    def divide(a: float, b: float) -> DivisionResult:
        """Divide with full result information."""
        if b == 0:
            return DivisionResult(0.0, 0.0, False)
        quotient = a // b
        remainder = a % b
        exact = remainder == 0
        return DivisionResult(quotient, remainder, exact)

    @staticmethod
    def find(items: list[str], target: str) -> SearchResult:
        """Search with full result information."""
        try:
            idx = items.index(target)
            return SearchResult(True, idx, target)
        except ValueError:
            return SearchResult(False, -1, None)

    @staticmethod
    def statistics(numbers: list[float]) -> StatsResult:
        """Calculate comprehensive statistics."""
        if not numbers:
            return StatsResult(0, 0.0, 0.0, 0.0, 0.0, 0.0)

        sorted_nums = sorted(numbers)
        n = len(numbers)
        total = sum(numbers)
        avg = total / n
        min_val = sorted_nums[0]
        max_val = sorted_nums[-1]

        # Median
        mid = n // 2
        median = sorted_nums[mid] if n % 2 else (sorted_nums[mid-1] + sorted_nums[mid]) / 2

        return StatsResult(n, total, avg, min_val, max_val, median)

    @staticmethod
    def parse_config(config_str: str) -> tuple[str, int, bool]:
        """Parse 'host:port:debug' config string."""
        parts = config_str.split(":")
        host = parts[0] if len(parts) > 0 else "localhost"
        port = int(parts[1]) if len(parts) > 1 else 8080
        debug = parts[2].lower() == "true" if len(parts) > 2 else False
        return host, port, debug

    @staticmethod
    def min_max_avg(numbers: list[float]) -> tuple[float, float, float]:
        """Return (min, max, average) in one pass."""
        if not numbers:
            return 0.0, 0.0, 0.0
        min_val = max_val = numbers[0]
        total = 0.0
        for n in numbers:
            if n < min_val:
                min_val = n
            if n > max_val:
                max_val = n
            total += n
        return min_val, max_val, total / len(numbers)

def main():
    """Main multi-return program."""
    print("=" * 50)
    print("FUNCTION MULTI-RETURN")
    print("=" * 50)

    # Division
    result = MultiReturn.divide(17, 5)
    print(f"\n17 / 5 = {result.quotient} remainder {result.remainder}")
    print(f"Exact? {result.exact}")

    # Search
    items = ["apple", "banana", "cherry", "date"]
    search = MultiReturn.find(items, "cherry")
    print(f"\nSearch 'cherry': found={search.found}, index={search.index}")

    search = MultiReturn.find(items, "grape")
    print(f"Search 'grape': found={search.found}, index={search.index}")

    # Statistics
    scores = [85, 92, 78, 95, 88, 91, 76, 89]
    stats = MultiReturn.statistics(scores)
    print(f"\nStatistics for {scores}:")
    print(f"  Count: {stats.count}")
    print(f"  Total: {stats.total}")
    print(f"  Average: {stats.average:.1f}")
    print(f"  Min: {stats.minimum}, Max: {stats.maximum}")
    print(f"  Median: {stats.median}")

    # Config parsing
    host, port, debug = MultiReturn.parse_config("localhost:3000:true")
    print(f"\nConfig: host={host}, port={port}, debug={debug}")

    # Min/max/avg in one pass
    data = [23, 45, 12, 67, 89, 34, 56]
    min_v, max_v, avg = MultiReturn.min_max_avg(data)
    print(f"\nData: min={min_v}, max={max_v}, avg={avg:.1f}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 3: Immutable Configuration",
      "code": """"
Program 3: Immutable Configuration
An immutable configuration system using tuples and named tuples.
Demonstrates immutability, functional updates, and deep nesting.
"""

from typing import NamedTuple, Tuple, Dict, Any
from copy import deepcopy

class DatabaseConfig(NamedTuple):
    host: str
    port: int
    username: str
    password: str  # In real code, use secrets management
    pool_size: int = 10
    timeout: int = 30

class ServerConfig(NamedTuple):
    host: str
    port: int
    debug: bool = False
    workers: int = 4

class AppConfig(NamedTuple):
    name: str
    version: str
    server: ServerConfig
    database: DatabaseConfig
    features: Tuple[str, ...] = ()
    metadata: Dict[str, Any] = {}

class ConfigManager:
    """Immutable configuration with functional updates."""

    def __init__(self, config: AppConfig):
        self._config = config

    @property
    def config(self) -> AppConfig:
        """Read-only access to configuration."""
        return self._config

    def update_server(self, **kwargs) -> 'ConfigManager':
        """Return new ConfigManager with updated server settings."""
        new_server = self._config.server._replace(**kwargs)
        new_config = self._config._replace(server=new_server)
        return ConfigManager(new_config)

    def update_database(self, **kwargs) -> 'ConfigManager':
        """Return new ConfigManager with updated database settings."""
        new_db = self._config.database._replace(**kwargs)
        new_config = self._config._replace(database=new_db)
        return ConfigManager(new_config)

    def add_feature(self, feature: str) -> 'ConfigManager':
        """Return new ConfigManager with added feature."""
        new_features = self._config.features + (feature,)
        new_config = self._config._replace(features=new_features)
        return ConfigManager(new_config)

    def remove_feature(self, feature: str) -> 'ConfigManager':
        """Return new ConfigManager with feature removed."""
        new_features = tuple(f for f in self._config.features if f != feature)
        new_config = self._config._replace(features=new_features)
        return ConfigManager(new_config)

    def set_metadata(self, key: str, value: Any) -> 'ConfigManager':
        """Return new ConfigManager with updated metadata."""
        new_metadata = deepcopy(dict(self._config.metadata))
        new_metadata[key] = value
        new_config = self._config._replace(metadata=new_metadata)
        return ConfigManager(new_config)

    def validate(self) -> Tuple[bool, Tuple[str, ...]]:
        """Validate configuration and return (is_valid, errors)."""
        errors = []
        if not self._config.name:
            errors.append("App name is required")
        if self._config.server.port < 1 or self._config.server.port > 65535:
            errors.append("Server port must be between 1 and 65535")
        if self._config.database.pool_size < 1:
            errors.append("Database pool size must be at least 1")
        return len(errors) == 0, tuple(errors)

    def __repr__(self):
        return f"ConfigManager({self._config.name} v{self._config.version})"

def main():
    """Main config program."""
    print("=" * 50)
    print("IMMUTABLE CONFIGURATION")
    print("=" * 50)

    # Create initial config
    db = DatabaseConfig(
        host="localhost",
        port=5432,
        username="app_user",
        password="secret",
        pool_size=20
    )

    server = ServerConfig(
        host="0.0.0.0",
        port=8080,
        debug=False,
        workers=8
    )

    app = AppConfig(
        name="MyApp",
        version="1.0.0",
        server=server,
        database=db,
        features=("auth", "api", "logging"),
        metadata={"created_by": "admin", "env": "production"}
    )

    config = ConfigManager(app)
    print(f"\nInitial: {config}")
    print(f"Features: {config.config.features}")

    # Create dev version (immutable update)
    dev_config = config.update_server(debug=True, port=3000)\n                        .update_database(host="dev-db", pool_size=5)\n                        .add_feature("debug_ui")

    print(f"\nDev config: {dev_config}")
    print(f"Dev features: {dev_config.config.features}")
    print(f"Dev server: {dev_config.config.server}")

    # Original unchanged
    print(f"\nOriginal still: {config}")
    print(f"Original features: {config.config.features}")

    # Remove feature
    prod_config = dev_config.remove_feature("debug_ui")
    print(f"\nAfter removing debug_ui: {prod_config.config.features}")

    # Validate
    valid, errors = prod_config.validate()
    print(f"\nValidation: valid={valid}")
    if errors:
        print(f"Errors: {errors}")

    # Invalid config test
    bad_config = ConfigManager(AppConfig(
        name="",
        version="1.0",
        server=ServerConfig("host", 99999),
        database=DatabaseConfig("host", 5432, "user", "pass", pool_size=0)
    ))
    valid, errors = bad_config.validate()
    print(f"\nBad config validation: valid={valid}, errors={errors}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 4: Named Tuple Database Row",
      "code": """"
Program 4: Named Tuple Database Row
Simulates database operations using named tuples as rows.
Demonstrates named tuple CRUD, filtering, and type safety.
"""

from typing import NamedTuple, List, Optional, Tuple
from datetime import datetime
from enum import Enum, auto

class Status(Enum):
    ACTIVE = auto()
    INACTIVE = auto()
    SUSPENDED = auto()

class UserRecord(NamedTuple):
    id: int
    username: str
    email: str
    age: int
    status: Status
    created: datetime
    tags: Tuple[str, ...]

class Database:
    """In-memory database using named tuples."""

    def __init__(self):
        self._rows: List[UserRecord] = []
        self._next_id = 1

    def insert(self, username: str, email: str, age: int,
               status: Status = Status.ACTIVE,
               tags: Tuple[str, ...] = ()) -> UserRecord:
        """Insert a new user and return the record."""
        record = UserRecord(
            id=self._next_id,
            username=username,
            email=email,
            age=age,
            status=status,
            created=datetime.now(),
            tags=tags
        )
        self._rows.append(record)
        self._next_id += 1
        return record

    def find_by_id(self, user_id: int) -> Optional[UserRecord]:
        """Find user by ID."""
        for row in self._rows:
            if row.id == user_id:
                return row
        return None

    def find_by_username(self, username: str) -> Optional[UserRecord]:
        """Find user by username."""
        for row in self._rows:
            if row.username == username:
                return row
        return None

    def filter_by_status(self, status: Status) -> List[UserRecord]:
        """Filter users by status."""
        return [row for row in self._rows if row.status == status]

    def filter_by_age_range(self, min_age: int, max_age: int) -> List[UserRecord]:
        """Filter users by age range."""
        return [row for row in self._rows if min_age <= row.age <= max_age]

    def filter_by_tag(self, tag: str) -> List[UserRecord]:
        """Filter users by tag."""
        return [row for row in self._rows if tag in row.tags]

    def update(self, user_id: int, **kwargs) -> Optional[UserRecord]:
        """Update user (returns new record, old one stays)."""
        old = self.find_by_id(user_id)
        if not old:
            return None

        # Create new record with updated fields
        new_data = old._replace(**kwargs)

        # Replace in database
        for i, row in enumerate(self._rows):
            if row.id == user_id:
                self._rows[i] = new_data
                break
        return new_data

    def delete(self, user_id: int) -> bool:
        """Delete user by ID."""
        for i, row in enumerate(self._rows):
            if row.id == user_id:
                self._rows.pop(i)
                return True
        return False

    def sort_by(self, key) -> List[UserRecord]:
        """Sort users by key function."""
        return sorted(self._rows, key=key)

    def all(self) -> List[UserRecord]:
        """Return all records."""
        return list(self._rows)

    def count(self) -> int:
        return len(self._rows)

    def __repr__(self):
        return f"Database({self.count()} users)"

def main():
    """Main database program."""
    print("=" * 50)
    print("NAMED TUPLE DATABASE ROW")
    print("=" * 50)

    db = Database()

    # Insert users
    alice = db.insert("alice", "alice@example.com", 30,
                     tags=("admin", "developer"))
    bob = db.insert("bob", "bob@example.com", 25,
                   status=Status.INACTIVE,
                   tags=("developer",))
    charlie = db.insert("charlie", "charlie@example.com", 35,
                        tags=("designer", "manager"))
    diana = db.insert("diana", "diana@example.com", 28,
                       tags=("developer", "devops"))

    print(f"\nDatabase: {db}")
    print(f"\nAll users:")
    for user in db.all():
        print(f"  {user.id}: {user.username} ({user.email}) - {user.status.name}")

    # Find by ID
    found = db.find_by_id(2)
    print(f"\nFind ID 2: {found.username if found else 'Not found'}")

    # Filter by status
    active = db.filter_by_status(Status.ACTIVE)
    print(f"\nActive users: {[u.username for u in active]}")

    # Filter by age
    adults = db.filter_by_age_range(25, 30)
    print(f"Ages 25-30: {[u.username for u in adults]}")

    # Filter by tag
    devs = db.filter_by_tag("developer")
    print(f"Developers: {[u.username for u in devs]}")

    # Update
    updated = db.update(2, status=Status.ACTIVE)
    print(f"\nUpdated Bob: status={updated.status.name if updated else 'N/A'}")

    # Sort
    by_age = db.sort_by(lambda u: u.age)
    print(f"\nSorted by age: {[(u.username, u.age) for u in by_age]}")

    # Delete
    db.delete(3)
    print(f"\nAfter deleting Charlie: {db.count()} users")

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
      "text": "Answer these before moving to Part 12. 4/5 correct means you have mastered tuples and immutability."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the three reasons tuples exist: hashability, performance, and intent signaling. Write a function that uses a tuple as a dictionary key to store city coordinates. Then demonstrate why a list cannot be used as a key.",
        "Q2: What is tuple unpacking? Write a function get_user() that returns a tuple of (name, age, email). Show three ways to unpack the return value: into separate variables, in a loop, and using *rest syntax. What is the _ convention and when should you use it?",
        "Q3: Explain the difference between collections.namedtuple and typing.NamedTuple. Write a class Color using typing.NamedTuple with fields red, green, blue (all ints). Demonstrate _replace(), _asdict(), and _fields. When would you use a named tuple instead of a dictionary?",
        "Q4: Explain the 'immutable container, mutable contents' paradox. Create a tuple containing a list and a dictionary. Show that the tuple cannot be reassigned but its contents can be modified. What happens to hashability after modification?",
        "Q5: Write a function that uses tuple concatenation to 'modify' a tuple. Create a function tuple_insert(t, index, value) that returns a new tuple with value inserted at index without modifying the original. Use the id() function to prove a new tuple was created."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Tuples exist because (1) they are hashable and can be dict keys and set elements, (2) they use less memory and are faster to create than lists, (3) they signal intent: 'this data is fixed.' Example: locations = {(40.7, -74.0): 'NYC'}. Lists fail because they are mutable and unhashable: {[1, 2]: 'value'} raises TypeError. A2: Unpacking assigns tuple elements to multiple variables: name, age, email = get_user(). In loops: for name, age in users:. With *rest: first, *middle, last = values. The _ convention marks 'don't care' values: x, _, z = point. Use it when you need to unpack but don't need all values. A3: collections.namedtuple is the classic, function-based approach. typing.NamedTuple is the modern class-based approach with type hints. Color = NamedTuple('Color', [('red', int), ('green', int), ('blue', int)]). c = Color(255, 128, 0). c._replace(red=200) creates new Color. c._asdict() converts to dict. Color._fields returns ('red', 'green', 'blue'). Use named tuples for fixed, structured data that needs immutability and memory efficiency. A4: Tuples are immutable containers but can contain mutable objects. t = ([1, 2], {'a': 3}). t[0].append(99) works because the list inside is mutable. But t[0] = [3, 4] fails because the tuple itself is immutable. After modifying the list, the tuple becomes unhashable: {t: 'value'} raises TypeError because the list's hash changed. A5: def tuple_insert(t, index, value): return t[:index] + (value,) + t[index:]. The id() function proves new object: original_id = id(t); new_t = tuple_insert(t, 2, 99); print(id(new_t) != original_id). This is functional programming: state evolves through new objects, not mutation."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered tuples and immutability. You understand why tuples exist — hashability for dictionary keys, performance for memory and speed, intent signaling for code clarity. You pack and unpack tuples with the elegance of a Python master, using *rest syntax and the _ convention. You create named tuples that are self-documenting, type-safe, and memory-efficient alternatives to dictionaries. You navigate the immutable container, mutable contents paradox with wisdom, knowing when true immutability requires deep copying. You use the id() trick to build functional, persistent data structures that evolve through creation rather than mutation. You have built four complete programs: a coordinate system with 2D/3D math, a function multi-return library, an immutable configuration manager, and a named tuple database with full CRUD operations. Immutability is no longer a restriction. It is a superpower that makes your code predictable, thread-safe, and maintainable."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Tuples are not read-only lists. They are hashable keys, performance weapons, and intent signals. Unpacking is the most elegant syntax in Python. Named tuples are self-documenting data structures. Immutability is not a limitation — it is a guarantee. Master these truths, and you have mastered the immutable foundation of Python. In Part 12, we will explore Dictionaries & Hash Tables — the most important data structure for real-world programming."
    },
    {
      "type": "cta",
      "text": "Start Part 12: Dictionaries & Hash Tables →",
      "href": "/tutorials/python-unlocked/part-12-dictionaries-hash-tables",
      "note": "30 min read · Hash tables · Dict methods · Comprehensions · defaultdict · Counter"
    }
  ]
};

export default post;
