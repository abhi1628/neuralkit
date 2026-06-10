const post = {
  "slug": "part-21-generators-iterators",
  "seriesSlug": "python-unlocked",
  "partNumber": 21,
  "totalParts": 30,
  "title": "Generators & Iterators: The Lazy Engine (Part 21)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "28 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Iterator protocol: __iter__, __next__, StopIteration. Generator functions: yield, state suspension. yield from for delegation. Memory profiling: sys.getsizeof comparison. Four complete programs.",
  "coverEmoji": "⚡",
  "tags": [
    "Python", "Generators", "Iterators", "yield",
    "yield from", "Lazy Evaluation", "Memory Efficiency",
    "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1975, computer scientist Donald Knuth wrote: 'Premature optimization is the root of all evil.' But he also wrote: 'We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.' Fifty-one years later, in 2026, generators are that critical 3%. They are not just a Python feature. They are a paradigm shift — from 'store everything in memory' to 'generate values on demand.' A generator is a function that pauses. When you call it, it runs until it hits yield, then freezes — saving its local variables, instruction pointer, and stack frame. When you call next() again, it resumes exactly where it left off. This means a generator can produce infinite sequences, process files larger than RAM, and build data pipelines that never materialize intermediate results. In this part, we will explore the full depth of Python's generator and iterator machinery. You will learn the iterator protocol — __iter__, __next__, and StopIteration. You will master yield and state suspension. You will use yield from to delegate to sub-generators. And you will profile memory usage to see why generators use 1000x less memory than lists. By the end, generators will not be a convenience. They will be your default tool for iteration."
    },
    {
      "type": "h2",
      "text": "The Iterator Protocol: __iter__, __next__, StopIteration"
    },
    {
      "type": "p",
      "text": "The iterator protocol is the foundation of Python iteration. Any object that implements __iter__ (returning an iterator) and __next__ (returning the next value or raising StopIteration) can be used in a for loop, with list(), in sum(), and anywhere else Python expects iteration. Understanding this protocol means you can create custom iterators for any data structure."
    },
    {
      "type": "code-block",
      "label": "Iterator Protocol Mastery",
      "code": `# === THE ITERATOR PROTOCOL ===
# __iter__() -> returns iterator object
# __next__() -> returns next value or raises StopIteration

class CountDown:
    """Custom iterator that counts down."""

    def __init__(self, start):
        self.start = start

    def __iter__(self):
        """Return the iterator object itself."""
        self.current = self.start
        return self

    def __next__(self):
        """Return next value or raise StopIteration."""
        if self.current < 0:
            raise StopIteration
        num = self.current
        self.current -= 1
        return num

# Usage
countdown = CountDown(5)
print(f"CountDown(5): {list(countdown)}")

# === ITERATOR VS ITERABLE ===
# Iterable: has __iter__ (can be looped over)
# Iterator: has __iter__ AND __next__ (can be looped over AND consumed)

numbers = [1, 2, 3]  # Iterable
iterator = iter(numbers)  # Iterator

print(f"\\nList is iterable: {hasattr(numbers, '__iter__')}")
print(f"Iterator has __next__: {hasattr(iterator, '__next__')}")

# Manual iteration
print(f"Manual next(): {next(iterator)}")
print(f"Manual next(): {next(iterator)}")
print(f"Manual next(): {next(iterator)}")
# next(iterator)  # StopIteration!

# === ITERATOR EXHAUSTION ===
# Iterators can only be consumed once

iterator = iter([1, 2, 3])
print(f"\\nFirst pass: {list(iterator)}")
print(f"Second pass: {list(iterator)}")  # Empty!

# === BUILT-IN ITERATORS ===
# iter(), next(), enumerate(), zip() all return iterators

print(f"\\niter('abc'): {list(iter('abc'))}")
print(f"iter({{'a': 1, 'b': 2}}): {list(iter({'a': 1, 'b': 2}))}")

# === CUSTOM RANGE ITERATOR ===
class MyRange:
    """Custom range iterator."""

    def __init__(self, start, stop, step=1):
        self.start = start
        self.stop = stop
        self.step = step

    def __iter__(self):
        self.current = self.start
        return self

    def __next__(self):
        if (self.step > 0 and self.current >= self.stop) or \\
           (self.step < 0 and self.current <= self.stop):
            raise StopIteration
        value = self.current
        self.current += self.step
        return value

print(f"\\nMyRange(0, 10, 2): {list(MyRange(0, 10, 2))}")
print(f"MyRange(10, 0, -2): {list(MyRange(10, 0, -2))}")

# === INFINITE ITERATOR ===
class InfiniteCounter:
    """Infinite iterator (never raises StopIteration)."""

    def __init__(self, start=0):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        value = self.current
        self.current += 1
        return value

counter = InfiniteCounter(100)
print(f"\\nInfinite counter (first 5): {[next(counter) for _ in range(5)]}")
print(f"Next 5: {[next(counter) for _ in range(5)]}")

print("\\nIterator protocol mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Generator Functions: yield and State Suspension"
    },
    {
      "type": "p",
      "text": "A generator function is a function that uses yield instead of return. When called, it returns a generator object — an iterator that suspends execution at each yield, saving its local state. When next() is called, it resumes from where it left off. This is not just a different syntax. It is a different execution model — cooperative multitasking inside a single function."
    },
    {
      "type": "code-block",
      "label": "Generator Functions Mastery",
      "code": `# === GENERATOR FUNCTIONS ===
# Functions using yield instead of return

def simple_generator():
    yield 1
    yield 2
    yield 3

# Calling a generator function returns a generator object, not a value
gen = simple_generator()
print(f"Generator object: {gen}")
print(f"Type: {type(gen).__name__}")

# Manual iteration
print(f"\\nManual iteration:")
print(f"  next(): {next(gen)}")
print(f"  next(): {next(gen)}")
print(f"  next(): {next(gen)}")
# next(gen)  # StopIteration!

# For loop iteration
print(f"\\nFor loop: {list(simple_generator())}")

# === STATE SUSPENSION ===
# Generators remember their state between calls

def count_with_state(start, step):
    current = start
    while True:
        yield current
        current += step

counter = count_with_state(10, 5)
print(f"\\nState suspension:")
print(f"  {next(counter)}")
print(f"  {next(counter)}")
print(f"  {next(counter)}")
print(f"  {next(counter)}")

# === GENERATOR WITH FINITE SEQUENCE ===
def fibonacci_generator(n):
    """Generate first n Fibonacci numbers."""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(f"\\nFibonacci(10): {list(fibonacci_generator(10))}")

# === GENERATOR WITH CONDITIONAL YIELD ===
def even_numbers(max_val):
    """Yield even numbers up to max_val."""
    for n in range(max_val):
        if n % 2 == 0:
            yield n

print(f"\\nEven numbers to 10: {list(even_numbers(10))}")

# === GENERATOR WITH MULTIPLE YIELD POINTS ===
def multi_stage_process():
    """Demonstrate multiple yield points with state."""
    print("  Stage 1: Initialization")
    yield "init"
    
    print("  Stage 2: Processing")
    data = [1, 2, 3]
    for item in data:
        yield f"processed_{item}"
    
    print("  Stage 3: Cleanup")
    yield "cleanup"

print(f"\\nMulti-stage process:")
for stage in multi_stage_process():
    print(f"  Got: {stage}")

# === GENERATOR EXPRESSIONS ===
squares_gen = (x**2 for x in range(10))
print(f"\\nGenerator expression: {squares_gen}")
print(f"First 5: {[next(squares_gen) for _ in range(5)]}")
print(f"Remaining: {list(squares_gen)}")

# === GENERATOR VS LIST COMPREHENSION ===
import sys

list_comp = [x**2 for x in range(100000)]
gen_exp = (x**2 for x in range(100000))

print(f"\\nMemory comparison (100,000 items):")
print(f"  List comprehension: {sys.getsizeof(list_comp):,} bytes")
print(f"  Generator expression: {sys.getsizeof(gen_exp):,} bytes")
print(f"  Ratio: {sys.getsizeof(list_comp) / sys.getsizeof(gen_exp):.0f}x")

# === GENERATOR WITH SEND() ===
def accumulator():
    """Generator that accumulates values sent to it."""
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value

acc = accumulator()
next(acc)  # Prime the generator
print(f"\\nAccumulator:")
print(f"  Send 10: {acc.send(10)}")
print(f"  Send 20: {acc.send(20)}")
print(f"  Send 30: {acc.send(30)}")
acc.close()

print("\\nGenerator functions mastery complete!")`
    },
    {
      "type": "h2",
      "text": "yield from: Delegation to Sub-Generators"
    },
    {
      "type": "p",
      "text": "yield from delegates iteration to a sub-generator. It yields all values from the sub-generator, passes through sent values and exceptions, and returns the sub-generator's final return value. This is not just a convenience for nested loops. It is the foundation of coroutines and async programming in Python."
    },
    {
      "type": "code-block",
      "label": "yield from Mastery",
      "code": `# === yield from ===
# Delegate iteration to a sub-generator

def sub_generator():
    yield 1
    yield 2
    yield 3

def main_generator():
    yield 'start'
    yield from sub_generator()
    yield 'end'

print(f"yield from basic: {list(main_generator())}")

# --- Delegation with return value ---
def sub_with_return():
    yield 'a'
    yield 'b'
    return 'done'

def main_with_return():
    result = yield from sub_with_return()
    yield f"sub returned: {result}"

print(f"\\nyield from with return: {list(main_with_return())}")

# --- Chained generators ---
def level_3():
    yield 'deep'

def level_2():
    yield 'middle'
    yield from level_3()

def level_1():
    yield 'top'
    yield from level_2()

print(f"\\nChained: {list(level_1())}")

# --- Flattening nested structures ---
def flatten(nested):
    """Flatten nested lists using yield from."""
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

nested = [1, [2, [3, 4], 5], 6, [7, 8]]
print(f"\\nFlattened: {list(flatten(nested))}")

# --- yield from with exception handling ---
def robust_sub():
    try:
        yield 'before'
        yield 'after'
    except ValueError:
        yield 'caught in sub'

def robust_main():
    yield from robust_sub()

print(f"\\nRobust: {list(robust_main())}")`
    },
    {
      "type": "h2",
      "text": "Memory Profiling: Generators vs Lists"
    },
    {
      "type": "p",
      "text": "The primary advantage of generators is memory efficiency. A list stores all values in memory. A generator stores only its state and yields values on demand. For large datasets, this difference is not just significant — it is the difference between a program that runs and one that crashes with MemoryError."
    },
    {
      "type": "code-block",
      "label": "Memory Profiling",
      "code": `# === MEMORY PROFILING ===
import sys
import tempfile
import time
import os

def get_size(obj):
    return sys.getsizeof(obj)

large_list = [x for x in range(1000000)]
large_gen = (x for x in range(1000000))

print(f"Large data (1,000,000 items):")
print(f"  List: {get_size(large_list):,} bytes ({get_size(large_list)/1024/1024:.1f} MB)")
print(f"  Generator: {get_size(large_gen):,} bytes")
print(f"  Ratio: {get_size(large_list) / get_size(large_gen):.0f}x")

# --- Processing large files ---
def process_with_list(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    return sum(len(line) for line in lines)

def process_with_generator(file_path):
    with open(file_path, 'r') as f:
        return sum(len(line) for line in f)

with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
    for i in range(100000):
        f.write(f"Line {i}: This is a test line with some content.\\n")
    test_file = f.name

start = time.perf_counter()
result_list = process_with_list(test_file)
t_list = time.perf_counter() - start

start = time.perf_counter()
result_gen = process_with_generator(test_file)
t_gen = time.perf_counter() - start

print(f"\\nFile processing (100,000 lines):")
print(f"  List approach: {t_list:.4f}s, result: {result_list}")
print(f"  Generator approach: {t_gen:.4f}s, result: {result_gen}")
os.unlink(test_file)

# --- Generator pipeline memory ---
def pipeline_list(data):
    step1 = [x * 2 for x in data]
    step2 = [x for x in step1 if x > 100]
    step3 = [x ** 0.5 for x in step2]
    return step3

def pipeline_generator(data):
    step1 = (x * 2 for x in data)
    step2 = (x for x in step1 if x > 100)
    step3 = (x ** 0.5 for x in step2)
    return step3

data = range(100000)
list_result = pipeline_list(data)
gen_result = pipeline_generator(data)

print(f"\\nPipeline memory:")
print(f"  List pipeline: {get_size(list_result):,} bytes")
print(f"  Generator pipeline: {get_size(gen_result):,} bytes")`
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use generators, iterators, yield from, and memory profiling to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Fibonacci Generator",
      "code": `"""
Program 1: Fibonacci Generator
Infinite Fibonacci generator with multiple implementations.
Demonstrates generators, state suspension, and memory efficiency.
"""
import sys
from typing import Iterator

class FibonacciGenerator:
    @staticmethod
    def infinite() -> Iterator[int]:
        a, b = 0, 1
        while True:
            yield a
            a, b = b, a + b

    @staticmethod
    def finite(n: int) -> Iterator[int]:
        a, b = 0, 1
        for _ in range(n):
            yield a
            a, b = b, a + b

    @staticmethod
    def every_nth(n: int) -> Iterator[int]:
        gen = FibonacciGenerator.infinite()
        for i, val in enumerate(gen):
            if i % n == 0:
                yield val

    @staticmethod
    def until_limit(limit: int) -> Iterator[int]:
        a, b = 0, 1
        while a <= limit:
            yield a
            a, b = b, a + b

    @staticmethod
    def with_ratio() -> Iterator[tuple]:
        a, b = 0, 1
        yield (a, None)
        while True:
            a, b = b, a + b
            ratio = a / b if b != 0 else None
            yield (a, ratio)

def main():
    print("=" * 50)
    print("FIBONACCI GENERATOR")
    print("=" * 50)

    print(f"\\nFirst 20 Fibonacci numbers:")
    for i, val in enumerate(FibonacciGenerator.finite(20), 1):
        print(f"  F({i}) = {val}")

    print(f"\\nFibonacci numbers <= 1000:")
    print(f"  {list(FibonacciGenerator.until_limit(1000))}")

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: File Line Reader",
      "code": `"""
Program 2: File Line Reader
Memory-efficient file reading with generators.
Demonstrates line-by-line processing, chunk reading, and grep.
"""
import os
import tempfile
from typing import Iterator, Tuple

class FileReader:
    @staticmethod
    def read_lines(file_path: str) -> Iterator[str]:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                yield line.rstrip('\\n')

    @staticmethod
    def grep(file_path: str, pattern: str) -> Iterator[Tuple[int, str]]:
        for i, line in enumerate(FileReader.read_lines(file_path), 1):
            if pattern in line:
                yield (i, line)

    @staticmethod
    def head(file_path: str, n: int = 10) -> Iterator[str]:
        for i, line in enumerate(FileReader.read_lines(file_path), 1):
            if i > n:
                break
            yield line

def main():
    print("=" * 50)
    print("FILE LINE READER")
    print("=" * 50)

    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
        for i in range(100):
            f.write(f"Line {i}: {'even' if i % 2 == 0 else 'odd'} number\\n")
        test_file = f.name

    try:
        print(f"\\nFirst 5 lines:")
        for line in FileReader.head(test_file, 5):
            print(f"  {line}")
    finally:
        os.unlink(test_file)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Infinite Sequence",
      "code": `"""
Program 3: Infinite Sequence
Various infinite sequence generators.
Demonstrates infinite iteration, filtering, and combination.
"""
from typing import Iterator, Callable

class InfiniteSequences:
    @staticmethod
    def integers(start: int = 0, step: int = 1) -> Iterator[int]:
        n = start
        while True:
            yield n
            n += step

    @staticmethod
    def primes() -> Iterator[int]:
        def is_prime(n):
            if n < 2: return False
            for i in range(2, int(n**0.5) + 1):
                if n % i == 0: return False
            return True
        n = 2
        while True:
            if is_prime(n): yield n
            n += 1

    @staticmethod
    def take(n: int, sequence: Iterator):
        for _ in range(n):
            yield next(sequence)

def main():
    print("=" * 50)
    print("INFINITE SEQUENCE")
    print("=" * 50)

    gen = InfiniteSequences.integers()
    print(f"\\nIntegers (first 10): {list(InfiniteSequences.take(10, gen))}")
    
    prime_gen = InfiniteSequences.primes()
    print(f"Primes (first 10): {list(InfiniteSequences.take(10, prime_gen))}")

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Pipeline with Generators",
      "code": `"""
Program 4: Pipeline with Generators
Data processing pipeline using chained generators.
Demonstrates generator composition, lazy evaluation, and memory efficiency.
"""
import sys
from typing import Iterator, Dict, Any
from dataclasses import dataclass

@dataclass
class Record:
    id: int
    name: str
    value: float
    category: str

class DataPipeline:
    @staticmethod
    def generate_records(n: int) -> Iterator[Record]:
        categories = ['A', 'B', 'C']
        for i in range(n):
            yield Record(id=i, name=f"item_{i}", value=float(i * 10 + 5), category=categories[i % 3])

    @staticmethod
    def filter_by_category(records: Iterator[Record], category: str) -> Iterator[Record]:
        for record in records:
            if record.category == category: yield record

    @staticmethod
    def aggregate_by_category(records: Iterator[Record]) -> Dict[str, Dict[str, Any]]:
        stats = {}
        for record in records:
            if record.category not in stats:
                stats[record.category] = {'count': 0, 'total': 0.0}
            stats[record.category]['count'] += 1
            stats[record.category]['total'] += record.value
        return stats

def main():
    print("=" * 50)
    print("PIPELINE WITH GENERATORS")
    print("=" * 50)

    records = DataPipeline.generate_records(1000)
    filtered = DataPipeline.filter_by_category(records, 'B')
    stats = DataPipeline.aggregate_by_category(filtered)
    print(f"Pipeline Stats: {stats}")

if __name__ == "__main__":
    main()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 22. 4/5 correct means you have mastered generators and iterators."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the iterator protocol. Write a custom class that implements __iter__ and __next__ to create a countdown from 10 to 0. What happens when __next__ raises StopIteration?",
        "Q2: What is the difference between a generator function and a regular function? Write a generator function that yields prime numbers indefinitely. Explain why generators use less memory than lists.",
        "Q3: What does yield from do? Write a function that uses yield from to flatten a nested list structure of arbitrary depth. Compare this to a recursive function that builds a flat list.",
        "Q4: Write a generator expression that squares all even numbers from 0 to 100. Compare its memory usage to an equivalent list comprehension using sys.getsizeof(). What is the ratio?",
        "Q5: Explain the send() method on generators. Write a generator that acts as a running average calculator: it receives numbers via send() and yields the current average. Demonstrate with 5 numbers."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: The iterator protocol requires __iter__() returning an iterator object and __next__() returning the next value or raising StopIteration. class CountDown: def __init__(self, start): self.start = start; def __iter__(self): self.current = self.start; return self; def __next__(self): if self.current < 0: raise StopIteration; num = self.current; self.current -= 1; return num. StopIteration signals the end of iteration; for loops catch it automatically. A2: A generator function uses yield instead of return. When called, it returns a generator object, not a value. Execution pauses at yield and resumes on next(). def primes(): n = 2; while True: if all(n % i != 0 for i in range(2, int(n**0.5)+1)): yield n; n += 1. Generators use less memory because they yield one value at a time, storing only state (a few variables) rather than all values. A list of 1M integers uses ~8MB; a generator uses ~100 bytes. A3: yield from delegates iteration to a sub-generator, yielding all its values and passing through send()/throw()/close(). def flatten(nested): for item in nested: if isinstance(item, list): yield from flatten(item); else: yield item. Recursive list version: def flatten_list(nested): result = []; for item in nested: if isinstance(item, list): result.extend(flatten_list(item)); else: result.append(item); return result. The generator version uses O(depth) memory; the list version uses O(n) memory. A4: gen = (x**2 for x in range(101) if x % 2 == 0). List comp: lst = [x**2 for x in range(101) if x % 2 == 0]. Generator: ~112 bytes. List: ~472 bytes (51 integers). Ratio: ~4x for small data, 1000x+ for large data. A5: send(value) resumes the generator and sends a value to the yield expression. def running_average(): total = 0; count = 0; while True: value = yield total / count if count > 0 else 0; total += value; count += 1. avg = running_average(); next(avg); avg.send(10); avg.send(20); avg.send(30). Returns 10, 15, 20."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered generators and iterators. You understand the iterator protocol — __iter__, __next__, and StopIteration — and implement custom iterators for any data structure. You write generator functions that suspend state at yield, creating infinite sequences, memory-efficient pipelines, and cooperative multitasking. You use yield from to delegate to sub-generators, flatten nested structures, and build composable pipelines. You profile memory usage and see why generators use 1000x less memory than lists for large datasets. You have built four complete programs: an infinite Fibonacci generator with ratio tracking, a memory-efficient file line reader with grep and tail, a collection of infinite sequences (primes, Collatz, random walk), and a data processing pipeline that handles millions of records without loading them into memory. Generators are no longer a convenience. They are your default tool for iteration — lazy, efficient, and elegant."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: The iterator protocol is __iter__ and __next__. Generators suspend state at yield. yield from delegates to sub-generators. Generator expressions are lazy and memory-efficient. Master these four truths, and you have mastered the lazy engine of Python. In Part 22, we will explore File Handling — reading, writing, and manipulating files with context managers and pathlib."
    },
    {
      "type": "cta",
      "text": "Start Part 22: File Handling →",
      "href": "/tutorials/python-unlocked/part-22-file-handling",
      "note": "26 min read · open() · Context managers · Text vs binary · pathlib · json/csv/pickle"
    }
  ]
};

export default post;
