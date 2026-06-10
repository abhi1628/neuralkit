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
      "code": "# === THE ITERATOR PROTOCOL ===
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

print(f"\nList is iterable: {hasattr(numbers, '__iter__')}")
print(f"Iterator has __next__: {hasattr(iterator, '__next__')}")

# Manual iteration
print(f"Manual next(): {next(iterator)}")
print(f"Manual next(): {next(iterator)}")
print(f"Manual next(): {next(iterator)}")
# next(iterator)  # StopIteration!

# === ITERATOR EXHAUSTION ===
# Iterators can only be consumed once

iterator = iter([1, 2, 3])
print(f"\nFirst pass: {list(iterator)}")
print(f"Second pass: {list(iterator)}")  # Empty!

# === BUILT-IN ITERATORS ===
# iter(), next(), enumerate(), zip() all return iterators

print(f"\niter('abc'): {list(iter('abc'))}")
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
        if (self.step > 0 and self.current >= self.stop) or \
           (self.step < 0 and self.current <= self.stop):
            raise StopIteration
        value = self.current
        self.current += self.step
        return value

print(f"\nMyRange(0, 10, 2): {list(MyRange(0, 10, 2))}")
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
print(f"\nInfinite counter (first 5): {[next(counter) for _ in range(5)]}")
print(f"Next 5: {[next(counter) for _ in range(5)]}")

print("\nIterator protocol mastery complete!")"
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
      "code": "# === GENERATOR FUNCTIONS ===
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
print(f"\nManual iteration:")
print(f"  next(): {next(gen)}")
print(f"  next(): {next(gen)}")
print(f"  next(): {next(gen)}")
# next(gen)  # StopIteration!

# For loop iteration
print(f"\nFor loop: {list(simple_generator())}")

# === STATE SUSPENSION ===
# Generators remember their state between calls

def count_with_state(start, step):
    current = start
    while True:
        yield current
        current += step

counter = count_with_state(10, 5)
print(f"\nState suspension:")
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

print(f"\nFibonacci(10): {list(fibonacci_generator(10))}")

# === GENERATOR WITH CONDITIONAL YIELD ===
def even_numbers(max_val):
    """Yield even numbers up to max_val."""
    for n in range(max_val):
        if n % 2 == 0:
            yield n

print(f"\nEven numbers to 10: {list(even_numbers(10))}")

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

print(f"\nMulti-stage process:")
for stage in multi_stage_process():
    print(f"  Got: {stage}")

# === GENERATOR EXPRESSIONS ===
# (expression for item in iterable if condition)

squares_gen = (x**2 for x in range(10))
print(f"\nGenerator expression: {squares_gen}")
print(f"First 5: {[next(squares_gen) for _ in range(5)]}")
print(f"Remaining: {list(squares_gen)}")

# === GENERATOR VS LIST COMPREHENSION ===
# Generator: lazy, memory efficient
# List comprehension: eager, memory intensive

import sys

list_comp = [x**2 for x in range(100000)]
gen_exp = (x**2 for x in range(100000))

print(f"\nMemory comparison (100,000 items):")
print(f"  List comprehension: {sys.getsizeof(list_comp):,} bytes")
print(f"  Generator expression: {sys.getsizeof(gen_exp):,} bytes")
print(f"  Ratio: {sys.getsizeof(list_comp) / sys.getsizeof(gen_exp):.0f}x")

# === GENERATOR WITH SEND() ===
# Two-way communication with generators

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
print(f"\nAccumulator:")
print(f"  Send 10: {acc.send(10)}")
print(f"  Send 20: {acc.send(20)}")
print(f"  Send 30: {acc.send(30)}")
acc.close()

print("\nGenerator functions mastery complete!")"
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
      "code": "# === yield from ===
# Delegate iteration to a sub-generator

# --- Basic delegation ---
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
    return 'done'  # Return value captured by yield from

def main_with_return():
    result = yield from sub_with_return()
    yield f"sub returned: {result}"

print(f"\nyield from with return: {list(main_with_return())}")

# --- Chained generators ---
def level_3():
    yield 'deep'

def level_2():
    yield 'middle'
    yield from level_3()

def level_1():
    yield 'top'
    yield from level_2()

print(f"\nChained: {list(level_1())}")

# --- yield from with send() ---
def echo():
    """Echo back received values."""
    while True:
        received = yield
        if received == 'quit':
            break
        yield f"echo: {received}"

def wrapper():
    """Wrapper that delegates to echo."""
    yield from echo()

# --- Flattening nested structures ---
def flatten(nested):
    """Flatten nested lists using yield from."""
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

nested = [1, [2, [3, 4], 5], 6, [7, 8]]
print(f"\nFlattened: {list(flatten(nested))}")

# --- yield from for file processing ---
def read_chunks(file_path, chunk_size=1024):
    """Read file in chunks using yield from."""
    with open(file_path, 'r') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield from chunk  # Yield each character

# --- yield from with exception handling ---
def robust_sub():
    """Sub-generator with exception handling."""
    try:
        yield 'before'
        yield 'after'
    except ValueError:
        yield 'caught in sub'

def robust_main():
    """Main generator that delegates exceptions."""
    yield from robust_sub()

print(f"\nRobust: {list(robust_main())}")

print("\nyield from mastery complete!")"
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
      "code": "# === MEMORY PROFILING ===
# Compare generators vs lists for large data

import sys

# --- Size comparison ---

def get_size(obj):
    """Get memory size of object in bytes."""
    return sys.getsizeof(obj)

# Small data
small_list = [x for x in range(1000)]
small_gen = (x for x in range(1000))

print(f"Small data (1,000 items):")
print(f"  List: {get_size(small_list):,} bytes")
print(f"  Generator: {get_size(small_gen):,} bytes")

# Large data
large_list = [x for x in range(1000000)]
large_gen = (x for x in range(1000000))

print(f"\nLarge data (1,000,000 items):")
print(f"  List: {get_size(large_list):,} bytes ({get_size(large_list)/1024/1024:.1f} MB)")
print(f"  Generator: {get_size(large_gen):,} bytes")
print(f"  Ratio: {get_size(large_list) / get_size(large_gen):.0f}x")

# --- Processing large files ---
# Generator can process files larger than RAM

def process_with_list(file_path):
    """Read all lines into list (memory intensive)."""
    with open(file_path, 'r') as f:
        lines = f.readlines()
    return sum(len(line) for line in lines)

def process_with_generator(file_path):
    """Process lines one at a time (memory efficient)."""
    with open(file_path, 'r') as f:
        return sum(len(line) for line in f)

# Create test file
import tempfile
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
    for i in range(100000):
        f.write(f"Line {i}: This is a test line with some content.\n")
    test_file = f.name

import time

start = time.perf_counter()
result_list = process_with_list(test_file)
t_list = time.perf_counter() - start

start = time.perf_counter()
result_gen = process_with_generator(test_file)
t_gen = time.perf_counter() - start

print(f"\nFile processing (100,000 lines):")
print(f"  List approach: {t_list:.4f}s, result: {result_list}")
print(f"  Generator approach: {t_gen:.4f}s, result: {result_gen}")

import os
os.unlink(test_file)

# --- Generator pipeline memory ---
# Chain multiple generators without intermediate lists

def pipeline_list(data):
    """Process with intermediate lists."""
    step1 = [x * 2 for x in data]
    step2 = [x for x in step1 if x > 100]
    step3 = [x ** 0.5 for x in step2]
    return step3

def pipeline_generator(data):
    """Process with generator pipeline."""
    step1 = (x * 2 for x in data)
    step2 = (x for x in step1 if x > 100)
    step3 = (x ** 0.5 for x in step2)
    return step3

data = range(100000)

list_result = pipeline_list(data)
gen_result = pipeline_generator(data)

print(f"\nPipeline memory:")
print(f"  List pipeline: {get_size(list_result):,} bytes")
print(f"  Generator pipeline: {get_size(gen_result):,} bytes")
print(f"  Results match: {list(list_result)[:5] == list(gen_result)[:5]}")

# --- Infinite sequence memory ---
# Infinite generators use constant memory

def infinite_counter():
    n = 0
    while True:
        yield n
        n += 1

counter = infinite_counter()
print(f"\nInfinite generator size: {get_size(counter):,} bytes")
print(f"First 5: {[next(counter) for _ in range(5)]}")
print(f"Next 5: {[next(counter) for _ in range(5)]}")

print("\nMemory profiling mastery complete!")"
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
      "code": """"
Program 1: Fibonacci Generator
Infinite Fibonacci generator with multiple implementations.
Demonstrates generators, state suspension, and memory efficiency.
"""

import sys
from typing import Iterator, List

class FibonacciGenerator:
    """Multiple Fibonacci generator implementations."""

    @staticmethod
    def infinite() -> Iterator[int]:
        """Infinite Fibonacci generator."""
        a, b = 0, 1
        while True:
            yield a
            a, b = b, a + b

    @staticmethod
    def finite(n: int) -> Iterator[int]:
        """Finite Fibonacci generator."""
        a, b = 0, 1
        for _ in range(n):
            yield a
            a, b = b, a + b

    @staticmethod
    def every_nth(n: int) -> Iterator[int]:
        """Yield every nth Fibonacci number."""
        gen = FibonacciGenerator.infinite()
        for i, val in enumerate(gen):
            if i % n == 0:
                yield val

    @staticmethod
    def until_limit(limit: int) -> Iterator[int]:
        """Generate Fibonacci numbers up to limit."""
        a, b = 0, 1
        while a <= limit:
            yield a
            a, b = b, a + b

    @staticmethod
    def with_ratio() -> Iterator[tuple]:
        """Yield (number, ratio to previous) pairs."""
        a, b = 0, 1
        yield (a, None)
        while True:
            a, b = b, a + b
            ratio = a / b if b != 0 else None
            yield (a, ratio)

    @staticmethod
    def compare_memory(n: int = 100000):
        """Compare memory usage of generator vs list."""
        gen = FibonacciGenerator.finite(n)
        gen_size = sys.getsizeof(gen)

        # Can't actually make list of 100k Fibonacci numbers (too big)
        # But we can compare the generator to a list of same count
        list_size = sys.getsizeof(list(range(n)))

        return {
            'generator_size': gen_size,
            'list_size': list_size,
            'ratio': list_size / gen_size
        }

def main():
    """Main Fibonacci generator program."""
    print("=" * 50)
    print("FIBONACCI GENERATOR")
    print("=" * 50)

    # Finite generator
    print(f"\nFirst 20 Fibonacci numbers:")
    for i, val in enumerate(FibonacciGenerator.finite(20), 1):
        print(f"  F({i}) = {val}")

    # Infinite generator (first 15)
    gen = FibonacciGenerator.infinite()
    print(f"\nInfinite (first 15):")
    for _ in range(15):
        print(f"  {next(gen)}")

    # Every 5th
    print(f"\nEvery 5th (first 10):")
    gen = FibonacciGenerator.every_nth(5)
    for _ in range(10):
        print(f"  {next(gen)}")

    # Until limit
    print(f"\nFibonacci numbers <= 1000:")
    print(f"  {list(FibonacciGenerator.until_limit(1000))}")

    # With ratio
    print(f"\nFibonacci with golden ratio approximation:")
    gen = FibonacciGenerator.with_ratio()
    for _ in range(10):
        num, ratio = next(gen)
        print(f"  {num}: ratio = {ratio:.10f}")

    # Memory comparison
    mem = FibonacciGenerator.compare_memory(100000)
    print(f"\nMemory comparison:")
    print(f"  Generator: {mem['generator_size']:,} bytes")
    print(f"  List: {mem['list_size']:,} bytes")
    print(f"  Ratio: {mem['ratio']:.0f}x")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 2: File Line Reader",
      "code": """"
Program 2: File Line Reader
Memory-efficient file reading with generators.
Demonstrates line-by-line processing, chunk reading, and grep.
"""

import os
from typing import Iterator, Optional, List, Tuple

class FileReader:
    """Memory-efficient file reading utilities."""

    @staticmethod
    def read_lines(file_path: str) -> Iterator[str]:
        """Yield lines one at a time (memory efficient)."""
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                yield line.rstrip('\n')

    @staticmethod
    def read_chunks(file_path: str, chunk_size: int = 4096) -> Iterator[str]:
        """Read file in fixed-size chunks."""
        with open(file_path, 'r', encoding='utf-8') as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk

    @staticmethod
    def grep(file_path: str, pattern: str) -> Iterator[Tuple[int, str]]:
        """Find lines matching pattern with line numbers."""
        for i, line in enumerate(FileReader.read_lines(file_path), 1):
            if pattern in line:
                yield (i, line)

    @staticmethod
    def tail(file_path: str, n: int = 10) -> Iterator[str]:
        """Read last n lines (efficient for large files)."""
        with open(file_path, 'r', encoding='utf-8') as f:
            # Use deque for efficient tail
            from collections import deque
            return iter(deque(f, maxlen=n))

    @staticmethod
    def head(file_path: str, n: int = 10) -> Iterator[str]:
        """Read first n lines."""
        for i, line in enumerate(FileReader.read_lines(file_path), 1):
            if i > n:
                break
            yield line

    @staticmethod
    def word_count(file_path: str) -> dict:
        """Count words in file using generator pipeline."""
        lines = FileReader.read_lines(file_path)
        words = (word for line in lines for word in line.split())
        from collections import Counter
        return dict(Counter(words))

    @staticmethod
    def process_large_file(file_path: str, processor) -> Iterator:
        """Process large file with custom processor function."""
        for line in FileReader.read_lines(file_path):
            result = processor(line)
            if result is not None:
                yield result

def main():
    """Main file reader program."""
    print("=" * 50)
    print("FILE LINE READER")
    print("=" * 50)

    # Create test file
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
        for i in range(1000):
            f.write(f"Line {i}: {'even' if i % 2 == 0 else 'odd'} number\n")
        test_file = f.name

    try:
        # Head
        print(f"\nFirst 5 lines:")
        for line in FileReader.head(test_file, 5):
            print(f"  {line}")

        # Grep
        print(f"\nLines containing 'even':")
        for i, line in FileReader.grep(test_file, 'even'):
            if i <= 10:
                print(f"  Line {i}: {line}")

        # Word count
        counts = FileReader.word_count(test_file)
        print(f"\nWord counts:")
        for word, count in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"  {word}: {count}")

        # Custom processor
        print(f"\nEven line numbers:")
        def extract_number(line):
            if 'even' in line:
                return int(line.split(':')[0].split()[1])
            return None

        for num in FileReader.process_large_file(test_file, extract_number):
            if num < 10:
                print(f"  {num}")

        # File size info
        size = os.path.getsize(test_file)
        print(f"\nFile size: {size:,} bytes")
        print(f"Processed without loading entire file into memory!")

    finally:
        os.unlink(test_file)

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 3: Infinite Sequence",
      "code": """"
Program 3: Infinite Sequence
Various infinite sequence generators.
Demonstrates infinite iteration, filtering, and combination.
"""

import itertools
from typing import Iterator, Callable, Optional

class InfiniteSequences:
    """Collection of infinite sequence generators."""

    @staticmethod
    def integers(start: int = 0, step: int = 1) -> Iterator[int]:
        """Infinite integer sequence."""
        n = start
        while True:
            yield n
            n += step

    @staticmethod
    def powers_of(base: int) -> Iterator[int]:
        """Powers of a number."""
        n = 1
        while True:
            yield n
            n *= base

    @staticmethod
    def primes() -> Iterator[int]:
        """Infinite prime number generator."""
        def is_prime(n):
            if n < 2:
                return False
            for i in range(2, int(n**0.5) + 1):
                if n % i == 0:
                    return False
            return True

        n = 2
        while True:
            if is_prime(n):
                yield n
            n += 1

    @staticmethod
    def collatz(start: int) -> Iterator[int]:
        """Collatz sequence generator."""
        n = start
        while n != 1:
            yield n
            n = n // 2 if n % 2 == 0 else 3 * n + 1
        yield 1

    @staticmethod
    def random_walk(start: float = 0.0, step: float = 1.0) -> Iterator[float]:
        """Random walk generator."""
        import random
        current = start
        while True:
            yield current
            current += random.uniform(-step, step)

    @staticmethod
    def merge_sorted(*sequences: Iterator) -> Iterator:
        """Merge multiple sorted infinite sequences."""
        # Use heapq.merge for efficient merging
        import heapq
        yield from heapq.merge(*sequences)

    @staticmethod
    def take(n: int, sequence: Iterator):
        """Take first n elements from infinite sequence."""
        for _ in range(n):
            yield next(sequence)

    @staticmethod
    def filter_sequence(predicate: Callable, sequence: Iterator) -> Iterator:
        """Filter infinite sequence."""
        for item in sequence:
            if predicate(item):
                yield item

    @staticmethod
    def map_sequence(func: Callable, sequence: Iterator) -> Iterator:
        """Map over infinite sequence."""
        for item in sequence:
            yield func(item)

def main():
    """Main infinite sequence program."""
    print("=" * 50)
    print("INFINITE SEQUENCE")
    print("=" * 50)

    # Integers
    print(f"\nIntegers (first 10):")
    gen = InfiniteSequences.integers()
    print(f"  {list(InfiniteSequences.take(10, gen))}")

    # Powers of 2
    print(f"\nPowers of 2 (first 10):")
    gen = InfiniteSequences.powers_of(2)
    print(f"  {list(InfiniteSequences.take(10, gen))}")

    # Primes
    print(f"\nPrimes (first 20):")
    gen = InfiniteSequences.primes()
    print(f"  {list(InfiniteSequences.take(20, gen))}")

    # Collatz sequence
    print(f"\nCollatz(27):")
    gen = InfiniteSequences.collatz(27)
    collatz_27 = list(gen)
    print(f"  Length: {len(collatz_27)}")
    print(f"  Sequence: {collatz_27[:10]}...{collatz_27[-5:]}")

    # Random walk
    print(f"\nRandom walk (first 10):")
    gen = InfiniteSequences.random_walk(100.0, 5.0)
    print(f"  {[round(next(gen), 2) for _ in range(10)]}")

    # Filtered primes
    print(f"\nPrimes > 100 (first 10):")
    gen = InfiniteSequences.primes()
    filtered = InfiniteSequences.filter_sequence(lambda p: p > 100, gen)
    print(f"  {list(InfiniteSequences.take(10, filtered))}")

    # Merged sequences
    print(f"\nMerged squares and cubes (first 15):")
    def squares():
        n = 1
        while True:
            yield n * n
            n += 1
    def cubes():
        n = 1
        while True:
            yield n * n * n
            n += 1
    merged = InfiniteSequences.merge_sorted(squares(), cubes())
    print(f"  {list(InfiniteSequences.take(15, merged))}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 4: Pipeline with Generators",
      "code": """"
Program 4: Pipeline with Generators
Data processing pipeline using chained generators.
Demonstrates generator composition, lazy evaluation, and memory efficiency.
"""

import sys
from typing import Iterator, Callable, List, Dict, Any
from dataclasses import dataclass

@dataclass
class Record:
    id: int
    name: str
    value: float
    category: str

class DataPipeline:
    """Generator-based data processing pipeline."""

    @staticmethod
    def generate_records(n: int) -> Iterator[Record]:
        """Generate sample records."""
        categories = ['A', 'B', 'C']
        for i in range(n):
            yield Record(
                id=i,
                name=f"item_{i}",
                value=float(i * 10 + 5),
                category=categories[i % 3]
            )

    @staticmethod
    def filter_by_category(records: Iterator[Record], category: str) -> Iterator[Record]:
        """Filter records by category."""
        for record in records:
            if record.category == category:
                yield record

    @staticmethod
    def filter_by_value(records: Iterator[Record], min_val: float, max_val: float) -> Iterator[Record]:
        """Filter records by value range."""
        for record in records:
            if min_val <= record.value <= max_val:
                yield record

    @staticmethod
    def transform_values(records: Iterator[Record], multiplier: float) -> Iterator[Record]:
        """Transform record values."""
        for record in records:
            yield Record(
                id=record.id,
                name=record.name,
                value=record.value * multiplier,
                category=record.category
            )

    @staticmethod
    def aggregate_by_category(records: Iterator[Record]) -> Dict[str, Dict[str, Any]]:
        """Aggregate statistics by category."""
        stats = {}
        for record in records:
            if record.category not in stats:
                stats[record.category] = {'count': 0, 'total': 0.0, 'items': []}
            stats[record.category]['count'] += 1
            stats[record.category]['total'] += record.value
            stats[record.category]['items'].append(record.name)
        return stats

    @staticmethod
    def pipeline_example(n: int = 1000000):
        """Demonstrate full pipeline with memory profiling."""
        # Stage 1: Generate (lazy)
        records = DataPipeline.generate_records(n)

        # Stage 2: Filter category A (lazy)
        cat_a = DataPipeline.filter_by_category(records, 'A')

        # Stage 3: Filter by value (lazy)
        filtered = DataPipeline.filter_by_value(cat_a, 100.0, 500000.0)

        # Stage 4: Transform values (lazy)
        transformed = DataPipeline.transform_values(filtered, 1.5)

        # Stage 5: Aggregate (terminal operation)
        stats = DataPipeline.aggregate_by_category(transformed)

        return stats

    @staticmethod
    def compare_memory(n: int = 100000):
        """Compare generator pipeline vs list pipeline memory."""
        # Generator pipeline (lazy)
        gen_records = DataPipeline.generate_records(n)
        gen_size = sys.getsizeof(gen_records)

        # List pipeline (eager)
        list_records = list(DataPipeline.generate_records(n))
        list_size = sys.getsizeof(list_records)

        return {
            'generator_size': gen_size,
            'list_size': list_size,
            'ratio': list_size / gen_size if gen_size > 0 else 0
        }

def main():
    """Main pipeline program."""
    print("=" * 50)
    print("PIPELINE WITH GENERATORS")
    print("=" * 50)

    # Small example
    print(f"\nSmall pipeline (n=10):")
    records = DataPipeline.generate_records(10)
    cat_b = DataPipeline.filter_by_category(records, 'B')
    for r in cat_b:
        print(f"  {r}")

    # Memory comparison
    mem = DataPipeline.compare_memory(100000)
    print(f"\nMemory comparison (100,000 records):")
    print(f"  Generator pipeline: {mem['generator_size']:,} bytes")
    print(f"  List pipeline: {mem['list_size']:,} bytes")
    print(f"  Ratio: {mem['ratio']:.0f}x")

    # Large pipeline
    print(f"\nLarge pipeline (n=1,000,000):")
    stats = DataPipeline.pipeline_example(1000000)
    for cat, data in stats.items():
        print(f"  Category {cat}: {data['count']} items, total={data['total']:,.0f}")

    print(f"\nPipeline completed without loading all records into memory!")

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
