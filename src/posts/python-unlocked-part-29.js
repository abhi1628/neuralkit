const post = {
  "slug": "part-29-standard-library",
  "seriesSlug": "python-unlocked",
  "partNumber": 29,
  "totalParts": 30,
  "title": "The Standard Library Treasure Hunt (Part 29)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "July 26, 2026",
  "readTime": "30 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "collections: deque, ChainMap, Counter, defaultdict. itertools: infinite iterators, combinatoric generators. functools: lru_cache, partial, singledispatch, total_ordering. contextlib: contextmanager, suppress. dataclasses. enum. Project: CLI tool using 5+ standard library modules.",
  "coverEmoji": "🗺️",
  "tags": [
    "Python", "Standard Library", "collections", "itertools",
    "functools", "dataclasses", "enum", "contextlib", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1989, when Guido van Rossum sat down to design Python, he made a decision that would define its character for decades: he would ship the language with an extensive standard library. Not just a few utility modules, but a rich, coherent collection of tools covering everything from data structures to networking to cryptography to concurrency. He called this philosophy 'batteries included.' The standard library is not an afterthought. It is the distilled wisdom of thousands of programmers who have solved the same problems you are about to solve, packaged into modules that are tested, documented, maintained, and available on every Python installation on Earth. When you reach for a third-party library before checking the standard library, you are often adding a dependency for something Python already does better. In this part, we will hunt through the most valuable gems in Python's standard library. You will discover that collections is not just a module — it is an entire philosophy about data structure selection. You will find that itertools contains algorithms so elegant they appear in textbooks on combinatorics. You will understand why functools.lru_cache can turn an exponentially slow algorithm into a linear one with a single decorator. You will learn dataclasses and enum — two modules so useful that the Python core team wishes they had been in the language from the beginning. And you will build a complete CLI tool that uses five standard library modules in concert — a tool that solves a real problem and could be installed with pip install and used immediately. The treasure is already in your toolbox. We are just going to find it."
    },
    {
      "type": "h2",
      "text": "collections: The Data Structure Module You Underuse"
    },
    {
      "type": "p",
      "text": "The collections module contains specialized container data types that outperform naive implementations in both speed and clarity. defaultdict, Counter, deque, and ChainMap each solve specific problems elegantly — problems that programmers routinely solve with more verbose, slower code."
    },
    {
      "type": "code-block",
      "label": "collections — deque, Counter, defaultdict, ChainMap, namedtuple",
      "code": `# === COLLECTIONS MASTERCLASS ===
from collections import (
    deque, Counter, defaultdict, ChainMap, namedtuple,
    OrderedDict, UserDict
)

# === deque: Double-Ended Queue ===
# O(1) append and pop from BOTH ends (list is O(n) for left operations)
# Perfect for: sliding windows, BFS queues, LRU caches, undo history

print("=== deque ===")
d = deque(maxlen=5)  # Bounded deque: auto-discards oldest
for i in range(8):
    d.append(i)
    print(f"  After append({i}): {list(d)}")

print(f"\\nLeft operations:")
d2 = deque([1, 2, 3, 4, 5])
d2.appendleft(0)           # O(1)
print(f"  appendleft(0): {list(d2)}")
d2.rotate(2)               # Rotate right by 2
print(f"  rotate(2): {list(d2)}")
print(f"  popleft(): {d2.popleft()}, deque: {list(d2)}")

# Sliding window maximum
def sliding_window_max(nums, k):
    """O(n) sliding window max using deque."""
    result = []
    window = deque()  # Stores indices, decreasing values
    for i, num in enumerate(nums):
        while window and nums[window[-1]] <= num:
            window.pop()
        window.append(i)
        if window[0] == i - k:
            window.popleft()
        if i >= k - 1:
            result.append(nums[window[0]])
    return result

nums = [3, 1, 2, 5, 4, 6, 2, 7]
print(f"\\nSliding window max (k=3): {sliding_window_max(nums, 3)}")

# === Counter: Counting Made Elegant ===
print("\\n=== Counter ===")
text = "the quick brown fox jumps over the lazy dog the fox quick"
word_counts = Counter(text.split())
print(f"Most common 5: {word_counts.most_common(5)}")
print(f"'the' count: {word_counts['the']}")
print(f"'cat' count: {word_counts['cat']}")  # 0, not KeyError

# Counter arithmetic
c1 = Counter(a=3, b=2, c=1)
c2 = Counter(a=1, b=4, d=2)
print(f"\\nc1: {c1}")
print(f"c2: {c2}")
print(f"c1 + c2: {c1 + c2}")
print(f"c1 - c2: {c1 - c2}")   # Drops negatives
print(f"c1 & c2: {c1 & c2}")   # min of each
print(f"c1 | c2: {c1 | c2}")   # max of each

# Character frequency analysis
dna = "ATCGATCGATCGAAATTTCCC"
bases = Counter(dna)
print(f"\\nDNA bases: {dict(bases)}")
print(f"GC content: {(bases['G']+bases['C'])/len(dna)*100:.1f}%")

# === defaultdict: No More 'if key not in dict' ===
print("\\n=== defaultdict ===")
# Grouping without key checking
words = ["apple", "ant", "banana", "bear", "cherry", "cat", "avocado"]

# Old way (tedious):
groups_old = {}
for w in words:
    key = w[0]
    if key not in groups_old:
        groups_old[key] = []
    groups_old[key].append(w)

# Pythonic way:
groups = defaultdict(list)
for w in words:
    groups[w[0]].append(w)
print(f"Grouped: {dict(groups)}")

# Nested defaultdict for multi-level grouping
from functools import partial

# Frequency tree: letter -> length -> words
freq_tree = defaultdict(lambda: defaultdict(list))
for w in words:
    freq_tree[w[0]][len(w)].append(w)
print(f"Freq tree 'a': {dict(freq_tree['a'])}")

# === ChainMap: Multiple Namespaces as One ===
print("\\n=== ChainMap ===")
# Searches through multiple dicts in order — first match wins
defaults = {'color': 'red', 'font': 'Arial', 'size': 12}
user_prefs = {'color': 'blue', 'size': 14}
cli_args = {'size': 18}

config = ChainMap(cli_args, user_prefs, defaults)
print(f"color: {config['color']}")  # user_prefs wins
print(f"size: {config['size']}")    # cli_args wins
print(f"font: {config['font']}")    # from defaults

# ChainMap child scope (for environments, scopes)
child = config.new_child({'debug': True, 'color': 'green'})
print(f"\\nChild color: {child['color']}")   # green (child scope)
print(f"Parent color: {config['color']}")   # blue (unchanged)

# === namedtuple: Lightweight Struct ===
print("\\n=== namedtuple ===")
Point = namedtuple('Point', ['x', 'y'])
RGB = namedtuple('RGB', 'red green blue', defaults=(0,))

p = Point(3, 4)
color = RGB(255, 128, 0)
print(f"Point: {p}, x={p.x}, y={p.y}")
print(f"RGB: {color}")
print(f"As dict: {color._asdict()}")
print(f"Replace: {p._replace(x=10)}")

import math
distance = lambda p1, p2: math.hypot(p1.x - p2.x, p1.y - p2.y)
print(f"Distance: {distance(p, Point(0, 0))}")

print("\\ncollections mastered!")`
    },
    {
      "type": "h2",
      "text": "itertools: Combinatorial Power"
    },
    {
      "type": "p",
      "text": "itertools is a module of iterator building blocks — functions that create iterators for efficient looping. They are written in C, memory-efficient (lazy evaluation), and composable. Mastering itertools transforms verbose loops into single expressive expressions."
    },
    {
      "type": "code-block",
      "label": "itertools — Infinite, Terminating, and Combinatoric Iterators",
      "code": `# === ITERTOOLS MASTERCLASS ===
import itertools

# === INFINITE ITERATORS ===
print("=== Infinite iterators ===")

# count: infinite arithmetic sequence
counter = itertools.count(start=1, step=2)
print(f"First 5 odd: {list(itertools.islice(counter, 5))}")

# cycle: infinite repeat of sequence
traffic = itertools.cycle(['red', 'yellow', 'green'])
print(f"Traffic lights: {[next(traffic) for _ in range(7)]}")

# repeat: repeat a value N times (or forever)
print(f"repeat 0 five times: {list(itertools.repeat(0, 5))}")

# === TERMINATING ITERATORS ===
print("\\n=== Terminating iterators ===")
data = [1, 2, 3, 4, 5, 6, 7, 8]

# accumulate: running totals (or any binary function)
print(f"Running sum: {list(itertools.accumulate(data))}")
print(f"Running max: {list(itertools.accumulate(data, max))}")
import operator
print(f"Running product: {list(itertools.accumulate(data, operator.mul))}")

# chain: flatten multiple iterables
letters = itertools.chain('ABC', 'DEF', 'GHI')
print(f"\\nChained: {''.join(letters)}")
nested = [[1,2], [3,4], [5,6]]
flat = list(itertools.chain.from_iterable(nested))
print(f"Flattened: {flat}")

# compress: filter by selector
mask = [1, 0, 1, 1, 0, 1]
print(f"Compressed: {list(itertools.compress(data, mask))}")

# takewhile / dropwhile
print(f"takewhile <5: {list(itertools.takewhile(lambda x: x < 5, data))}")
print(f"dropwhile <5: {list(itertools.dropwhile(lambda x: x < 5, data))}")

# islice: slice an iterator without materializing it
print(f"\\nislice(2, 7, 2): {list(itertools.islice(data, 2, 7, 2))}")

# groupby: group consecutive elements (data MUST be sorted!)
animals = sorted(['cat', 'cow', 'ant', 'bear', 'bat', 'crane'], key=lambda x: x[0])
for letter, group in itertools.groupby(animals, key=lambda x: x[0]):
    print(f"  {letter}: {list(group)}")

# pairwise: pairs of consecutive elements (Python 3.10+)
seq = [1, 2, 3, 4, 5]
print(f"\\nPairwise: {list(itertools.pairwise(seq))}")

# === COMBINATORIC ITERATORS ===
print("\\n=== Combinatoric iterators ===")
items = ['A', 'B', 'C']

# permutations: ordered arrangements
perms = list(itertools.permutations(items))
print(f"permutations(['A','B','C']): {len(perms)} = {perms}")

# combinations: unordered selections
combs = list(itertools.combinations(items, 2))
print(f"combinations(r=2): {combs}")

# combinations_with_replacement: allow repeats
combs_r = list(itertools.combinations_with_replacement(items, 2))
print(f"combinations_with_replacement(r=2): {combs_r}")

# product: cartesian product
suits = ['♠', '♥', '♦', '♣']
values = ['A', '2', '3', 'J', 'Q', 'K']
deck = list(itertools.product(values, suits))
print(f"\\nCard deck size: {len(deck)} cards")
print(f"First 6 cards: {deck[:6]}")

# Real use: password generator (educational only)
import string
def count_possibilities(charset, length):
    return len(charset) ** length

pin_possibilities = count_possibilities(string.digits, 4)
print(f"\\n4-digit PIN possibilities: {pin_possibilities:,}")
print(f"6-char alphanumeric: {count_possibilities(string.ascii_letters + string.digits, 6):,}")

# Practical: all test parameter combinations
test_params = list(itertools.product(
    ['sqlite', 'postgres'],      # db
    ['debug', 'production'],     # mode
    [True, False],               # cache
))
print(f"\\nTest matrix: {len(test_params)} combinations")
for db, mode, cache in test_params[:4]:
    print(f"  db={db}, mode={mode}, cache={cache}")

print("\\nitertools mastered!")`
    },
    {
      "type": "h2",
      "text": "functools and contextlib: Power Tools"
    },
    {
      "type": "code-block",
      "label": "functools — lru_cache, partial, singledispatch, reduce",
      "code": `# === FUNCTOOLS MASTERCLASS ===
import functools
import time

# === lru_cache: Memoization in One Line ===
print("=== lru_cache ===")

@functools.lru_cache(maxsize=None)  # maxsize=None = unlimited cache
def fib(n: int) -> int:
    """Without cache: O(2^n). With cache: O(n)."""
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

start = time.perf_counter()
result = fib(50)
elapsed = time.perf_counter() - start
print(f"fib(50) = {result} in {elapsed*1000:.3f}ms")
print(f"Cache info: {fib.cache_info()}")

@functools.cache  # Python 3.9+: simpler alias for lru_cache(maxsize=None)
def expensive_api_call(user_id: int) -> dict:
    """Simulate expensive operation."""
    time.sleep(0.001)  # Simulate latency
    return {"id": user_id, "name": f"User{user_id}", "active": True}

for uid in [1, 2, 1, 3, 2]:  # 1 and 2 will be cache hits
    start = time.perf_counter()
    result = expensive_api_call(uid)
    elapsed = time.perf_counter() - start
    print(f"  user {uid}: {elapsed*1000:.2f}ms {'(cached)' if elapsed < 0.0005 else '(computed)'}")

# === partial: Freeze Function Arguments ===
print("\\n=== functools.partial ===")

def power(base: float, exponent: float) -> float:
    return base ** exponent

square = functools.partial(power, exponent=2)
cube = functools.partial(power, exponent=3)
double = functools.partial(pow, exp=None)  # Different approach

numbers = [1, 2, 3, 4, 5]
print(f"squares: {list(map(square, numbers))}")
print(f"cubes:   {list(map(cube, numbers))}")

# Partial with contextual defaults
import os
safe_join = functools.partial(os.path.join, '/var/app/data')
print(f"safe join: {safe_join('uploads', 'user123.jpg')}")

# partial for sorting
from operator import attrgetter
from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int
    dept: str

people = [
    Person("Alice", 30, "Engineering"),
    Person("Bob", 25, "Marketing"),
    Person("Carol", 35, "Engineering"),
    Person("Dave", 28, "Marketing"),
]

sort_by_age = functools.partial(sorted, key=attrgetter('age'))
sort_by_dept_age = functools.partial(sorted, key=lambda p: (p.dept, p.age))
print(f"By age: {[p.name for p in sort_by_age(people)]}")
print(f"By dept+age: {[p.name for p in sort_by_dept_age(people)]}")

# === singledispatch: Function Overloading ===
print("\\n=== functools.singledispatch ===")

@functools.singledispatch
def process(data) -> str:
    """Default implementation."""
    return f"Unknown type: {type(data).__name__}: {data!r}"

@process.register(int)
def _(data: int) -> str:
    return f"Integer: {data} (squared: {data**2})"

@process.register(str)
def _(data: str) -> str:
    return f"String: '{data}' (upper: {data.upper()}, len: {len(data)})"

@process.register(list)
def _(data: list) -> str:
    return f"List: {len(data)} items, sum={sum(x for x in data if isinstance(x, (int,float)))}"

@process.register(dict)
def _(data: dict) -> str:
    return f"Dict: {len(data)} keys: {list(data.keys())[:5]}"

for value in [42, "hello world", [1, 2, 3, 4], {"a": 1, "b": 2}, 3.14]:
    print(f"  {process(value)}")

# === reduce: Fold a Sequence ===
print("\\n=== functools.reduce ===")
from functools import reduce

nums = [1, 2, 3, 4, 5]
product = reduce(lambda a, b: a * b, nums)
maximum = reduce(lambda a, b: a if a > b else b, nums)
print(f"product: {product}, maximum: {maximum}")

# Flatten nested list with reduce
nested = [[1,2], [3,4], [5,6], [7,8]]
flat = reduce(lambda acc, lst: acc + lst, nested, [])
print(f"Flattened: {flat}")

# Compose functions with reduce
pipeline = [str.strip, str.lower, lambda s: s.replace(' ', '-')]
transform = reduce(lambda f, g: lambda x: g(f(x)), pipeline)
print(f"Pipeline: '{transform('  Hello World  ')}'")

print("\\nfunctools mastered!")`
    },
    {
      "type": "code-block",
      "label": "dataclasses, enum, contextlib — The Modern Python Trio",
      "code": `# === DATACLASSES ===
from dataclasses import dataclass, field, KW_ONLY, InitVar
from typing import ClassVar
import dataclasses

@dataclass(order=True, frozen=False)
class Product:
    """Dataclass with full feature set."""
    # order=True: auto-generates __lt__, __le__, etc. based on field order
    # frozen=True: makes instances immutable (sets __hash__ too)
    
    # Fields appear in __init__ in declaration order
    sort_index: float = field(init=False, repr=False)  # Computed, excluded from repr
    name: str
    price: float
    category: str = "General"
    tags: list[str] = field(default_factory=list)  # Mutable default!
    
    # Class variable: not an instance field
    _tax_rate: ClassVar[float] = 0.08
    
    def __post_init__(self):
        """Called after __init__ — perfect for derived fields and validation."""
        if self.price < 0:
            raise ValueError(f"Price cannot be negative: {self.price}")
        self.sort_index = self.price  # Used for comparison (order=True)
    
    @property
    def price_with_tax(self) -> float:
        return self.price * (1 + self._tax_rate)
    
    def discount(self, pct: float) -> 'Product':
        """Return new product with discounted price."""
        return dataclasses.replace(self, price=self.price * (1 - pct))

# Usage
p1 = Product("Python Book", 39.99, "Education", ["python", "programming"])
p2 = Product("Laptop", 1299.99, "Electronics")
p3 = Product("Coffee", 12.99, "Food")

print("=== dataclasses ===")
print(f"p1: {p1}")
print(f"price with tax: \\u0024{p1.price_with_tax:.2f}")
print(f"discounted: {p1.discount(0.20)}")
print(f"p1 < p2: {p1 < p2}")
print(f"sorted: {sorted([p2, p1, p3])}")
print(f"as dict: {dataclasses.asdict(p1)}")

# @dataclass(frozen=True): immutable, hashable
@dataclass(frozen=True)
class Point:
    x: float
    y: float
    
    def distance_to(self, other: 'Point') -> float:
        import math
        return math.hypot(self.x - other.x, self.y - other.y)

p = Point(3, 4)
print(f"\\nFrozen Point: {p}")
print(f"hashable: {hash(p)}")
try:
    p.x = 10  # ImmutableError
except dataclasses.FrozenInstanceError as e:
    print(f"Immutable: {e}")

# === ENUM ===
from enum import Enum, IntEnum, Flag, auto, unique

print("\\n=== enum ===")

@unique  # Prevents duplicate values
class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3
    
    def complement(self) -> 'Color':
        complements = {Color.RED: Color.GREEN, Color.GREEN: Color.BLUE, Color.BLUE: Color.RED}
        return complements[self]

class Direction(Enum):
    NORTH = auto()   # auto() assigns incremental values
    SOUTH = auto()
    EAST = auto()
    WEST = auto()
    
    def opposite(self) -> 'Direction':
        opposites = {
            Direction.NORTH: Direction.SOUTH,
            Direction.SOUTH: Direction.NORTH,
            Direction.EAST: Direction.WEST,
            Direction.WEST: Direction.EAST,
        }
        return opposites[self]

class Permission(Flag):
    """Flag enum: supports bitwise operations."""
    READ = auto()
    WRITE = auto()
    EXECUTE = auto()
    
    READONLY = READ
    READWRITE = READ | WRITE
    ALL = READ | WRITE | EXECUTE

print(f"Color.RED: {Color.RED}, value={Color.RED.value}")
print(f"Complement of RED: {Color.RED.complement()}")
print(f"Direction.NORTH.opposite(): {Direction.NORTH.opposite()}")
print(f"Permission.READWRITE: {Permission.READWRITE}")
print(f"READ in READWRITE: {Permission.READ in Permission.READWRITE}")
print(f"All permissions: {list(Permission.ALL)}")

# === CONTEXTLIB ===
from contextlib import contextmanager, suppress, redirect_stdout
import io

print("\\n=== contextlib ===")

@contextmanager
def managed_transaction(connection_name: str):
    """context manager using generator syntax."""
    print(f"[{connection_name}] BEGIN TRANSACTION")
    try:
        yield  # Control passes to 'with' block here
        print(f"[{connection_name}] COMMIT")
    except Exception as e:
        print(f"[{connection_name}] ROLLBACK: {e}")
        raise  # Re-raise the exception

with managed_transaction("db_conn"):
    print("  Executing queries...")
    print("  Inserting records...")

try:
    with managed_transaction("db_conn2"):
        print("  Executing...")
        raise ValueError("Constraint violation!")
except ValueError:
    pass

# suppress: silence specific exceptions cleanly
print("\\n--- suppress ---")
with suppress(FileNotFoundError, PermissionError):
    open("/nonexistent/path/file.txt")
    print("File opened")  # Not reached
print("Execution continues silently")

# redirect_stdout: capture print() output
buffer = io.StringIO()
with redirect_stdout(buffer):
    print("This goes to the buffer, not console")
    print("So does this")
captured = buffer.getvalue()
print(f"Captured: {repr(captured)}")

print("\\ndataclasses, enum, contextlib mastered!")`
    },
    {
      "type": "h2",
      "text": "Project: Build a CLI Tool Using 5+ Standard Library Modules"
    },
    {
      "type": "p",
      "text": "Theory is validated by practice. We will build 'pylog' — a command-line log analyzer that reads log files, parses them, aggregates statistics, and generates reports. It uses argparse, collections, itertools, functools, enum, dataclasses, contextlib, and pathlib — a tour de force of the standard library."
    },
    {
      "type": "code-block",
      "label": "Project: pylog — CLI Log Analyzer",
      "code": `# === pylog: A Complete CLI Log Analyzer ===
# Uses: argparse, collections, itertools, functools, enum, dataclasses, contextlib, pathlib, re

import argparse
import re
import sys
import time
from collections import Counter, defaultdict, deque
from contextlib import contextmanager, suppress
from dataclasses import dataclass, field
from enum import Enum, auto
from functools import lru_cache, reduce
from itertools import groupby, islice, chain
from pathlib import Path
from typing import Iterator

# === Data Model ===

class LogLevel(Enum):
    DEBUG = 1
    INFO = 2
    WARNING = 3
    ERROR = 4
    CRITICAL = 5
    
    @classmethod
    def from_string(cls, s: str) -> 'LogLevel':
        try:
            return cls[s.upper()]
        except KeyError:
            return cls.INFO

@dataclass(order=True, frozen=True)
class LogEntry:
    sort_index: int = field(init=False, repr=False)
    timestamp: str
    level: LogLevel
    module: str
    message: str
    line_number: int = 0
    
    def __post_init__(self):
        object.__setattr__(self, 'sort_index', self.level.value)
    
    @property
    def is_error(self) -> bool:
        return self.level in (LogLevel.ERROR, LogLevel.CRITICAL)

@dataclass
class LogReport:
    total_lines: int = 0
    parsed_entries: int = 0
    parse_errors: int = 0
    level_counts: Counter = field(default_factory=Counter)
    module_counts: Counter = field(default_factory=Counter)
    error_messages: list[str] = field(default_factory=list)
    timeline: defaultdict = field(default_factory=lambda: defaultdict(Counter))
    
    def summary(self) -> str:
        lines = [
            "=" * 60,
            "  LOG ANALYSIS REPORT",
            "=" * 60,
            f"  Total lines:    {self.total_lines:,}",
            f"  Parsed entries: {self.parsed_entries:,}",
            f"  Parse errors:   {self.parse_errors:,}",
            "",
            "  Level Distribution:",
        ]
        for level in LogLevel:
            count = self.level_counts[level.name]
            if count:
                bar = "█" * min(30, count // max(1, self.parsed_entries // 30))
                lines.append(f"    {level.name:<10} {count:>6,}  {bar}")
        
        lines += ["", "  Top 10 Modules:"]
        for module, count in self.module_counts.most_common(10):
            lines.append(f"    {module:<25} {count:>6,}")
        
        if self.error_messages:
            lines += ["", f"  Recent Errors ({min(5, len(self.error_messages))}):"]
            for msg in self.error_messages[-5:]:
                lines.append(f"    {msg[:70]}")
        
        lines.append("=" * 60)
        return "\\n".join(lines)

# === Parser ===

# Common log patterns
LOG_PATTERNS = [
    # Format: 2026-06-15 14:23:45 [ERROR] mymodule: Message here
    re.compile(
        r'(?P<ts>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\s+'
        r'\\[(?P<level>\\w+)\\]\\s+'
        r'(?P<module>[\\w.]+):\\s+'
        r'(?P<msg>.+)'
    ),
    # Format: ERROR 2026-06-15 mymodule Message
    re.compile(
        r'(?P<level>DEBUG|INFO|WARNING|ERROR|CRITICAL)\\s+'
        r'(?P<ts>\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2})\\s+'
        r'(?P<module>[\\w.]+)\\s+'
        r'(?P<msg>.+)'
    ),
]

@lru_cache(maxsize=1024)
def parse_level(level_str: str) -> LogLevel:
    """Cached level parsing — same strings appear thousands of times."""
    return LogLevel.from_string(level_str)

def parse_line(line: str, line_number: int) -> LogEntry | None:
    """Try each pattern until one matches."""
    line = line.strip()
    if not line:
        return None
    for pattern in LOG_PATTERNS:
        if m := pattern.match(line):
            return LogEntry(
                timestamp=m.group('ts'),
                level=parse_level(m.group('level')),
                module=m.group('module'),
                message=m.group('msg'),
                line_number=line_number,
            )
    return None

def generate_sample_log(n_lines: int = 500) -> list[str]:
    """Generate realistic sample log data."""
    import random
    modules = ['auth', 'db', 'api', 'cache', 'worker', 'scheduler']
    messages = {
        'DEBUG': ['Cache hit for key {}', 'Processing request {}', 'Query took {}ms'],
        'INFO': ['User {} logged in', 'Request {} completed', 'Started worker {}'],
        'WARNING': ['Slow query: {}ms', 'Retry attempt {} for {}', 'Memory usage {}%'],
        'ERROR': ['Connection refused: {}', 'Timeout on {}', 'Failed to parse {}'],
        'CRITICAL': ['Database unreachable: {}', 'Service {} is down'],
    }
    weights = [20, 50, 15, 10, 5]
    levels = list(messages.keys())
    lines = []
    for i in range(n_lines):
        level = random.choices(levels, weights=weights)[0]
        module = random.choice(modules)
        msg_tmpl = random.choice(messages[level])
        msg = msg_tmpl.format(random.choice(['users', 'orders', '/api/v1', 'redis', i]))
        ts = f"2026-06-{random.randint(1,30):02d} {random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"
        lines.append(f"{ts} [{level}] {module}: {msg}")
    return lines

# === Context Managers ===

@contextmanager
def timer(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"  [{label}] {elapsed*1000:.1f}ms")

# === Core Analyzer ===

def parse_lines(lines: list[str]) -> Iterator[LogEntry]:
    """Lazy parser — yields entries one at a time."""
    for i, line in enumerate(lines, 1):
        with suppress(Exception):  # Never crash on malformed lines
            entry = parse_line(line, i)
            if entry:
                yield entry

def analyze(lines: list[str], min_level: LogLevel = LogLevel.DEBUG,
            top_n: int = 10) -> LogReport:
    """Full log analysis pipeline."""
    report = LogReport(total_lines=len(lines))
    
    with timer("Parsing"):
        entries = list(parse_lines(lines))
    
    report.parsed_entries = len(entries)
    report.parse_errors = report.total_lines - report.parsed_entries
    
    with timer("Aggregating"):
        # Filter by level
        filtered = [e for e in entries if e.level.value >= min_level.value]
        
        # Count by level and module
        report.level_counts = Counter(e.level.name for e in filtered)
        report.module_counts = Counter(e.module for e in filtered)
        
        # Collect recent error messages
        errors = [e for e in filtered if e.is_error]
        report.error_messages = [f"[{e.timestamp}] {e.module}: {e.message}" for e in errors]
        
        # Timeline: date -> level -> count
        for entry in filtered:
            date = entry.timestamp[:10]
            report.timeline[date][entry.level.name] += 1
    
    return report

def find_patterns(entries: list[LogEntry], window: int = 5) -> list[str]:
    """Find repeated error patterns using deque sliding window."""
    errors = [e for e in entries if e.is_error]
    patterns = []
    
    # Sliding window of recent errors
    recent = deque(maxlen=window)
    for entry in errors:
        recent.append(entry.message[:50])
        if len(recent) == window:
            if len(set(recent)) == 1:
                patterns.append(f"Repeated {window}x: {recent[0]}")
    
    return patterns[:10]

# === CLI Entry Point ===

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog='pylog',
        description='Analyze log files and generate reports',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest='command', required=True)
    
    # analyze command
    analyze_p = subparsers.add_parser('analyze', help='Analyze a log file')
    analyze_p.add_argument('file', nargs='?', help='Log file path (stdin if omitted)')
    analyze_p.add_argument('--min-level', default='DEBUG',
                          choices=[l.name for l in LogLevel],
                          help='Minimum log level to include')
    analyze_p.add_argument('--top', type=int, default=10,
                          help='Number of top items to show')
    
    # demo command
    subparsers.add_parser('demo', help='Run with generated sample data')
    
    return parser

def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    
    if args.command == 'demo':
        print("Generating sample log data...")
        lines = generate_sample_log(1000)
        min_level = LogLevel.DEBUG
    elif args.command == 'analyze':
        if args.file:
            path = Path(args.file)
            if not path.exists():
                print(f"Error: File not found: {path}", file=sys.stderr)
                return 1
            lines = path.read_text().splitlines()
        else:
            lines = sys.stdin.read().splitlines()
        min_level = LogLevel.from_string(args.min_level)
    else:
        parser.print_help()
        return 1
    
    print(f"\\nAnalyzing {len(lines):,} log lines...")
    
    with timer("Total analysis"):
        report = analyze(lines, min_level=min_level)
    
    print(report.summary())
    
    # Show level cache stats
    print(f"\\n  Level parse cache: {parse_level.cache_info()}")
    
    return 0

# === Run Demo ===
if __name__ == '__main__':
    # Simulate CLI args for demo
    sys.argv = ['pylog', 'demo']
    sys.exit(main())`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: When would you use deque instead of list? Write a sliding window algorithm using deque that finds the maximum value in every window of size k in O(n) time.",
        "Q2: What is the difference between defaultdict(list) and a regular dict? Write code that groups a list of (word, frequency) tuples by first letter using both approaches, then explain why defaultdict is preferred.",
        "Q3: Explain lru_cache. What does LRU stand for? What happens when maxsize is exceeded? Write a Fibonacci function and compare execution time with and without @lru_cache for fib(40).",
        "Q4: What is singledispatch? Write a serialize() function that dispatches to different implementations for int, str, list, dict, and a custom class. When would you prefer singledispatch over isinstance chains?",
        "Q5: What advantage does @dataclass provide over manually writing __init__, __repr__, __eq__? Write a frozen dataclass Point3D with three float fields and demonstrate that it is hashable and can be used as a dict key."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Use deque when: appending/popping from the left (list.insert(0) is O(n), deque.appendleft is O(1)), implementing a sliding window or BFS queue, or needing a bounded buffer (maxlen). Sliding window max: maintain a deque of indices in decreasing value order. For each new element, pop from right while the back of deque has smaller value. Pop from left when the front index falls outside the window. The front always holds the index of the current maximum. O(n) because each element is pushed and popped at most once. A2: defaultdict(list) automatically creates an empty list for any missing key. Regular dict requires: if key not in d: d[key] = []; d[key].append(value). defaultdict version: d = defaultdict(list); d[key].append(value). Preferred because: no initialization check, cleaner code, slightly faster. Grouping by first letter: regular dict needs 4 lines; defaultdict needs 2. A3: LRU = Least Recently Used. When maxsize is exceeded, the least recently used cached result is evicted to make room for the new one. Without cache, fib(40) takes ~30 seconds (2^40 recursive calls). With @lru_cache, fib(40) takes microseconds — each value is computed once and cached. cache_info() shows hits, misses, maxsize, currsize. @functools.cache is identical to @lru_cache(maxsize=None) — no eviction, unlimited cache. A4: singledispatch creates a function that dispatches to different implementations based on the type of the first argument. It is the functional equivalent of method overloading. Prefer over isinstance chains when: the dispatch logic grows beyond 3-4 types, you want to add new type handlers without modifying the original function (open/closed principle), or multiple modules contribute handlers. isinstance chains are fine for simple 2-3 type cases. A5: @dataclass auto-generates __init__ (with parameters matching fields), __repr__ (showing field names and values), __eq__ (comparing all fields). frozen=True also generates __hash__. Without dataclass: you write 15-20 lines of boilerplate per class. With dataclass: 4 lines. frozen Point3D: @dataclass(frozen=True) class Point3D: x: float; y: float; z: float. p = Point3D(1,2,3); hash(p) works; {p: 'origin'} works as dict key."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: The standard library is Python's greatest competitive advantage. collections gives you specialized data structures that outperform naive implementations. itertools gives you memory-efficient combinatorial algorithms. functools gives you lru_cache, partial, and singledispatch — tools that eliminate entire categories of boilerplate. dataclasses eliminate hand-written __init__/__repr__/__eq__. enum gives you safe, self-documenting constants. contextlib makes resource management elegant. You have now seen 29 of the 30 parts of this series. One remains — and it is the culmination of everything. In Part 30, we build something truly worth building."
    },
    {
      "type": "cta",
      "text": "Start Part 30: The Final Project →",
      "href": "/tutorials/python-unlocked/part-30-final-project",
      "note": "45 min read · The capstone · Everything comes together · Build something real"
    }
  ]
};

export default post;
