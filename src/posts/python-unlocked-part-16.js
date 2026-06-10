const post = {
  "slug": "part-16-functions-building-blocks",
  "seriesSlug": "python-unlocked",
  "partNumber": 16,
  "totalParts": 30,
  "title": "Functions — The Building Blocks: Abstraction & Power (Part 16)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "26 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Defining, calling, returning. Parameters vs arguments: positional, keyword, default, *args, **kwargs. Scope: LEGB rule, global, nonlocal. First-class functions: passing functions as arguments. Four complete programs.",
  "coverEmoji": "🧱",
  "tags": [
    "Python", "Functions", "Parameters", "Arguments",
    "Scope", "LEGB", "First-class", "*args", "**kwargs"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1936, Alonzo Church introduced the lambda calculus — a formal system where everything is a function. Numbers, logic, arithmetic, even recursion itself could be expressed as functions operating on functions. Church's insight was revolutionary: functions are not just subroutines. They are the fundamental building blocks of computation. Ninety years later, in 2026, Python functions embody that philosophy. They are first-class objects — you can pass them as arguments, return them from other functions, store them in variables, and even compose them into pipelines. But most developers use only a fraction of their power. They define functions with fixed parameters, struggle with mutable default arguments, and never exploit the full flexibility of *args and **kwargs. In this part, we will explore the full depth of Python's function machinery. You will learn the LEGB scope rule, why mutable defaults are the most common function bug, how *args and **kwargs enable infinite flexibility, and why first-class functions are the gateway to decorators and functional programming. By the end, functions will not be subroutines. They will be the building blocks of your craft."
    },
    {
      "type": "code-block",
      "label": "Function Anatomy",
      "code": `
# === DEFINING FUNCTIONS ===
# def name(parameters):
#     """docstring"""
#     body
#     return value

# Basic function
def greet(name):
    """Return a greeting string."""
    return f"Hello, \${name}!"

print(greet("Alice"))

# Function with no return (returns None implicitly)
def print_greeting(name):
    """Print a greeting (no return)."""
    print(f"Hello, \${name}!")

result = print_greeting("Bob")
print(f"Return value: {result}")  # None

# Function with multiple return values (returns a tuple)
def get_user_info():
    """Return multiple values as a tuple."""
    return "Alice", 30, "Engineer"

name, age, job = get_user_info()
print(f"\\nUser: {name}, {age}, {job}")

# Function with early returns (guard clauses)
def divide(a, b):
    """Divide with validation."""
    if b == 0:
        return None  # Early return for invalid input
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        return None
    return a / b

print(f"\\n10 / 2 = {divide(10, 2)}")
print(f"10 / 0 = {divide(10, 0)}")

# === FUNCTION ATTRIBUTES ===
# Functions are objects with metadata

def example_function():
    """This is the docstring."""
    pass

print(f"\\nFunction name: {example_function.__name__}")
print(f"Docstring: {example_function.__doc__}")
print(f"Module: {example_function.__module__}")

# === TYPE HINTS (Python 3.5+) ===
# Optional but highly recommended for clarity

from typing import List, Optional, Union

def process_data(items: List[int], threshold: float = 0.5) -> Optional[List[int]]:
    """Process items above threshold."""
    if not items:
        return None
    return [x for x in items if x > threshold]

result = process_data([1, 2, 3, 0.1, 0.8], 0.5)
print(f"\\nProcessed: {result}")

# === LAMBDA FUNCTIONS ===
# Anonymous functions for simple operations

square = lambda x: x ** 2
print(f"\\nLambda square: {square(5)}")

# Lambda in higher-order functions
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
print(f"Mapped squares: {squared}")

# === DOCSTRING BEST PRACTICES ===

def calculate_area(length: float, width: float) -> float:
    """
    Calculate the area of a rectangle.

    Args:
        length: The length of the rectangle.
        width: The width of the rectangle.

    Returns:
        The area (length * width).

    Raises:
        ValueError: If length or width is negative.
    """
    if length < 0 or width < 0:
        raise ValueError("Dimensions must be non-negative")
    return length * width

print(f"\\nArea: {calculate_area(5, 3)}")

print("\\nFunction anatomy complete!")`
    },
    {
      "type": "code-block",
      "label": "Parameters & Arguments Mastery",
      "code": `
# === POSITIONAL ARGUMENTS ===
# Matched by position

def describe_person(name, age, city):
    return f"{name}, {age}, from {city}"

print(describe_person("Alice", 30, "NYC"))

# === KEYWORD ARGUMENTS ===
# Matched by name, order doesn't matter

print(describe_person(age=30, city="NYC", name="Alice"))

# Mix positional and keyword (positional must come first)
print(describe_person("Alice", city="NYC", age=30))

# === DEFAULT PARAMETERS ===
# Provide default values

def greet(name, greeting="Hello", punctuation="!"):
    return f"{greeting}, {name}{punctuation}"

print(f"\\n{greet('Alice')}")
print(f"{greet('Bob', 'Hi')}")
print(f"{greet('Charlie', 'Hey', '?')}")

# === THE MUTABLE DEFAULT TRAP ===
# THE most common Python bug

def add_item_bad(item, items=[]):
    """DANGER: Mutable default!"""
    items.append(item)
    return items

print(f"\\nMutable default trap:")
print(f"Call 1: {add_item_bad('a')}")  # ['a']
print(f"Call 2: {add_item_bad('b')}")  # ['a', 'b'] - BUG!
print(f"Call 3: {add_item_bad('c')}")  # ['a', 'b', 'c'] - BUG!

# CORRECT: Use None as default
def add_item_good(item, items=None):
    """Safe: Immutable default."""
    if items is None:
        items = []
    items.append(item)
    return items

print(f"\\nFixed version:")
print(f"Call 1: {add_item_good('a')}")
print(f"Call 2: {add_item_good('b')}")
print(f"Call 3: {add_item_good('c')}")

# === *args: VARIABLE POSITIONAL ARGUMENTS ===
# Collects extra positional arguments into a tuple

def sum_all(*args):
    """Sum any number of arguments."""
    return sum(args)

print(f"\\nsum_all(1, 2, 3) = {sum_all(1, 2, 3)}")
print(f"sum_all(1, 2, 3, 4, 5) = {sum_all(1, 2, 3, 4, 5)}")
print(f"sum_all() = {sum_all()}")

# *args with required parameters
def log_message(level, *args):
    """Log with level and variable messages."""
    message = ' '.join(str(arg) for arg in args)
    return f"[{level}] {message}"

print(f"\\n{log_message('INFO', 'User', 'Alice', 'logged', 'in')}")

# Unpacking with *
values = [1, 2, 3, 4, 5]
print(f"Unpacked sum: {sum_all(*values)}")

# === **kwargs: VARIABLE KEYWORD ARGUMENTS ===
# Collects extra keyword arguments into a dict

def create_user(name, **kwargs):
    """Create user with required name and optional attributes."""
    user = {'name': name}
    user.update(kwargs)
    return user

user = create_user('Alice', age=30, city='NYC', email='alice@example.com')
print(f"\\nUser: {user}")

# **kwargs with required and defaults
def configure_server(host, port=8080, **kwargs):
    """Configure server with options."""
    config = {'host': host, 'port': port}
    config.update(kwargs)
    return config

config = configure_server('localhost', 3000, debug=True, ssl=False)
print(f"Config: {config}")

# Unpacking with **
options = {'debug': True, 'workers': 4}
config2 = configure_server('0.0.0.0', **options)
print(f"Unpacked config: {config2}")

# === COMBINING ALL PARAMETER TYPES ===
# Order: positional, *args, keyword-only, **kwargs

def advanced_function(a, b, *args, c=10, d=20, **kwargs):
    """Demonstrate all parameter types."""
    return {
        'a': a, 'b': b,
        'args': args,
        'c': c, 'd': d,
        'kwargs': kwargs
    }

result = advanced_function(1, 2, 3, 4, 5, c=100, x=99, y=88)
print(f"\\nAdvanced: {result}")

# === KEYWORD-ONLY ARGUMENTS ===
# Parameters after * must be passed by keyword

def safe_divide(a, b, *, precision=2):
    """precision must be passed by keyword."""
    result = a / b if b != 0 else 0
    return round(result, precision)

print(f"\\nsafe_divide(10, 3, precision=4) = {safe_divide(10, 3, precision=4)}")
# safe_divide(10, 3, 4)  # TypeError!

# === POSITIONAL-ONLY ARGUMENTS (Python 3.8+) ===
# Parameters before / must be passed by position

def greet_positional(name, /, greeting="Hello"):
    """name must be positional, greeting can be keyword."""
    return f"{greeting}, {name}!"

print(f"\\n{greet_positional('Alice')}")
print(f"{greet_positional('Bob', greeting='Hi')}")
# greet_positional(name='Charlie')  # TypeError!

print("\\nParameters & arguments mastery complete!")`
    },
    {
      "type": "code-block",
      "label": "LEGB Scope Mastery",
      "code": `
# === THE LEGB RULE ===
# Local -> Enclosing -> Global -> Built-in

# --- Local scope ---
def local_example():
    x = 10  # Local to this function
    print(f"Local x: {x}")

local_example()
# print(x)  # NameError! x is local

# --- Enclosing scope ---
def outer():
    x = 20  # Enclosing scope
    def inner():
        print(f"Enclosing x: {x}")  # Finds x in outer()
    inner()

outer()

# --- Global scope ---
global_x = 30

def global_example():
    print(f"Global x: {global_x}")  # Finds global_x

global_example()

# --- Built-in scope ---
print(f"Built-in len: {len}")  # Finds built-in len

# === THE global KEYWORD ===
# Declare that a variable is global

counter = 0

def increment_bad():
    # counter += 1  # UnboundLocalError!
    pass

def increment_good():
    global counter
    counter += 1

increment_good()
increment_good()
print(f"\\nCounter after increments: {counter}")

# === THE nonlocal KEYWORD ===
# Modify enclosing (non-global) scope

def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter_a = make_counter()
counter_b = make_counter()

print(f"\\nCounter A: {counter_a()}")  # 1
print(f"Counter A: {counter_a()}")  # 2
print(f"Counter B: {counter_b()}")  # 1 (independent!)
print(f"Counter A: {counter_a()}")  # 3

# === SCOPE SHADOWING ===
# Local variables can shadow outer ones

name = "global"

def shadow_example():
    name = "local"  # Shadows global 'name'
    print(f"Inside: {name}")

shadow_example()
print(f"Outside: {name}")  # Still 'global'

# === SCOPE AND MUTABLE OBJECTS ===
# You can modify mutable objects without global/nonlocal

config = {'debug': False, 'level': 'INFO'}

def modify_config():
    config['debug'] = True  # Modifies dict, doesn't reassign
    config['level'] = 'DEBUG'

modify_config()
print(f"\\nModified config: {config}")

# But reassignment requires global
settings = {'theme': 'light'}

def reassign_config_bad():
    # settings = {'theme': 'dark'}  # Creates local, doesn't modify global
    pass

def reassign_config_good():
    global settings
    settings = {'theme': 'dark'}

reassign_config_good()
print(f"Reassigned settings: {settings}")

# === THE globals() AND locals() FUNCTIONS ===
# Inspect current scopes

def inspect_scope():
    local_var = 42
    print(f"\\nLocal vars: {list(locals().keys())}")
    print(f"Has local_var: {'local_var' in locals()}")

inspect_scope()
print(f"Global has global_x: {'global_x' in globals()}")

print("\\nLEGB scope mastery complete!")`
    },
    {
      "type": "code-block",
      "label": "First-Class Functions Mastery",
      "code": `
# === FUNCTIONS AS OBJECTS ===
# Assign, store, pass, return

# Assign to variable
def say_hello():
    return "Hello!"

greeting = say_hello
print(f"Function variable: {greeting()}")
print(f"Same function? {greeting is say_hello}")

# Store in data structures
operations = {
    'add': lambda a, b: a + b,
    'sub': lambda a, b: a - b,
    'mul': lambda a, b: a * b,
    'div': lambda a, b: a / b if b != 0 else None,
}

print(f"\\nOperations:")
for name, func in operations.items():
    print(f"  {name}(10, 5) = {func(10, 5)}")

# Pass as argument (higher-order function)
def apply_operation(a, b, operation):
    """Apply a function to two arguments."""
    return operation(a, b)

result = apply_operation(10, 5, operations['add'])
print(f"\\napply_operation(10, 5, add) = {result}")

# Return from function (factory pattern)
def make_multiplier(factor):
    """Return a function that multiplies by factor."""
    def multiply(x):
        return x * factor
    return multiply

triple = make_multiplier(3)
double = make_multiplier(2)

print(f"\\ntriple(5) = {triple(5)}")
print(f"double(5) = {double(5)}")

# === HIGHER-ORDER FUNCTIONS ===
# Functions that operate on other functions

def compose(f, g):
    """Return f(g(x))."""
    def composed(x):
        return f(g(x))
    return composed

def add_one(x):
    return x + 1

def square(x):
    return x ** 2

add_then_square = compose(square, add_one)
square_then_add = compose(add_one, square)

print(f"\\ncompose(square, add_one)(5) = {add_then_square(5)}")  # (5+1)² = 36
print(f"compose(add_one, square)(5) = {square_then_add(5)}")  # 5²+1 = 26

# === CALLBACK PATTERN ===
# Pass a function to be called later

def process_data(data, callback):
    """Process data and call callback with result."""
    result = [x * 2 for x in data]
    callback(result)

def print_result(result):
    print(f"Processed: {result}")

def save_result(result):
    print(f"Saving: {result}")

print(f"\\nCallbacks:")
process_data([1, 2, 3], print_result)
process_data([1, 2, 3], save_result)

# === FUNCTION PIPELINE ===
# Chain functions together

def pipeline(data, *functions):
    """Apply a chain of functions to data."""
    result = data
    for func in functions:
        result = func(result)
    return result

# Pipeline functions
def strip_spaces(text):
    return text.strip()

def to_uppercase(text):
    return text.upper()

def add_prefix(text):
    return f"DATA: {text}"

raw = "  hello world  "
processed = pipeline(raw, strip_spaces, to_uppercase, add_prefix)
print(f"\\nPipeline: '{raw}' -> '{processed}'")

# === SORTING WITH KEY FUNCTIONS ===
# Pass a function to determine sort order

users = [
    {'name': 'Alice', 'age': 30},
    {'name': 'Bob', 'age': 25},
    {'name': 'Charlie', 'age': 35},
]

# Sort by age
by_age = sorted(users, key=lambda u: u['age'])
print(f"\\nBy age: {[u['name'] for u in by_age]}")

# Sort by name length
by_name_len = sorted(users, key=lambda u: len(u['name']))
print(f"By name length: {[u['name'] for u in by_name_len]}")

# === FUNCTION INTROSPECTION ===
# Inspect function properties

def sample_function(a, b, c=10, *args, d=20, **kwargs):
    pass

print(f"\\nFunction introspection:")
print(f"  Name: {sample_function.__name__}")
print(f"  Defaults: {sample_function.__defaults__}")
print(f"  Code name: {sample_function.__code__.co_name}")
print(f"  Var names: {sample_function.__code__.co_varnames}")

print("\\nFirst-class functions mastery complete!")`
    },
    {
      "type": "programs",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "code-block",
      "label": "Program 1: Calculator with Functions",
      "code": `
"""
Program 1: Calculator with Functions
A calculator using first-class functions and operations dict.
"""

from typing import Callable, Dict, Optional, List
from functools import reduce

class Calculator:
    """Calculator with pluggable operations."""

    def __init__(self):
        self._operations: Dict[str, Callable] = {}
        self._history: List[dict] = []
        self._register_defaults()

    def _register_defaults(self):
        """Register default operations."""
        self.register('add', lambda a, b: a + b)
        self.register('sub', lambda a, b: a - b)
        self.register('mul', lambda a, b: a * b)
        self.register('div', self._safe_divide)
        self.register('pow', lambda a, b: a ** b)
        self.register('mod', lambda a, b: a % b)
        self.register('avg', lambda *args: sum(args) / len(args) if args else 0)
        self.register('sum', lambda *args: sum(args))
        self.register('max', lambda *args: max(args) if args else None)
        self.register('min', lambda *args: min(args) if args else None)

    @staticmethod
    def _safe_divide(a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

    def register(self, name: str, operation: Callable):
        """Register a new operation."""
        self._operations[name] = operation

    def calculate(self, operation: str, *args) -> Optional[float]:
        """Perform calculation and record history."""
        if operation not in self._operations:
            raise ValueError(f"Unknown operation: {operation}")

        try:
            result = self._operations[operation](*args)
            self._history.append({
                'operation': operation,
                'args': args,
                'result': result,
                'success': True
            })
            return result
        except Exception as e:
            self._history.append({
                'operation': operation,
                'args': args,
                'error': str(e),
                'success': False
            })
            raise

    def batch_calculate(self, operations: List[tuple]) -> List[Optional[float]]:
        """Perform multiple calculations."""
        return [self.calculate(op, *args) for op, *args in operations]

    def get_history(self) -> List[dict]:
        return self._history

    def get_operations(self) -> List[str]:
        return list(self._operations.keys())

    def chain(self, initial: float, *operations: tuple) -> float:
        """Chain operations: chain(5, ('add', 3), ('mul', 2)) -> 16"""
        result = initial
        for op_name, *args in operations:
            result = self.calculate(op_name, result, *args)
        return result

def main():
    """Main calculator program."""
    print("=" * 50)
    print("CALCULATOR WITH FUNCTIONS")
    print("=" * 50)

    calc = Calculator()

    # Basic operations
    print(f"\\nBasic operations:")
    print(f"  add(10, 5) = {calc.calculate('add', 10, 5)}")
    print(f"  sub(10, 5) = {calc.calculate('sub', 10, 5)}")
    print(f"  mul(10, 5) = {calc.calculate('mul', 10, 5)}")
    print(f"  div(10, 5) = {calc.calculate('div', 10, 5)}")
    print(f"  pow(2, 10) = {calc.calculate('pow', 2, 10)}")

    # Variable arguments
    print(f"\\nVariable arguments:")
    print(f"  sum(1, 2, 3, 4, 5) = {calc.calculate('sum', 1, 2, 3, 4, 5)}")
    print(f"  avg(10, 20, 30) = {calc.calculate('avg', 10, 20, 30)}")
    print(f"  max(3, 1, 4, 1, 5) = {calc.calculate('max', 3, 1, 4, 1, 5)}")

    # Chaining
    print(f"\\nChaining: 5 + 3 * 2 = {calc.chain(5, ('add', 3), ('mul', 2))}")

    # Custom operation
    calc.register('double_add', lambda a, b: (a + b) * 2)
    print(f"\\nCustom operation double_add(3, 4) = {calc.calculate('double_add', 3, 4)}")

    # History
    print(f"\\nHistory ({len(calc.get_history())} operations):")
    for entry in calc.get_history()[-3:]:
        print(f"  {entry['operation']}{entry['args']} = {entry.get('result', 'ERROR')}")

    # Error handling
    print(f"\\nError handling:")
    try:
        calc.calculate('div', 10, 0)
    except ValueError as e:
        print(f"  Caught: {e}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Factorial Function",
      "code": `"""
Program 2: Factorial Function
Multiple factorial implementations with error handling.
"""

from functools import lru_cache
from typing import Dict

class Factorial:
    """Multiple factorial implementations."""

    _memo: Dict[int, int] = {0: 1, 1: 1}

    @staticmethod
    def iterative(n: int) -> int:
        """Iterative factorial. O(n) time, O(1) space."""
        if n < 0:
            raise ValueError("n must be non-negative")
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result

    @staticmethod
    def recursive(n: int) -> int:
        """Recursive factorial. O(n) time, O(n) stack space."""
        if n < 0:
            raise ValueError("n must be non-negative")
        if n <= 1:
            return 1
        return n * Factorial.recursive(n - 1)

    @staticmethod
    def memoized(n: int) -> int:
        """Manual memoization. O(n) time, O(n) space."""
        if n < 0:
            raise ValueError("n must be non-negative")
        if n not in Factorial._memo:
            Factorial._memo[n] = n * Factorial.memoized(n - 1)
        return Factorial._memo[n]

    @staticmethod
    @lru_cache(maxsize=128)
    def auto_memoized(n: int) -> int:
        """Automatic memoization with functools."""
        if n < 0:
            raise ValueError("n must be non-negative")
        if n <= 1:
            return 1
        return n * Factorial.auto_memoized(n - 1)

    @staticmethod
    def tail_recursive(n: int, accumulator: int = 1) -> int:
        """Tail recursive factorial (Python doesn't optimize)."""
        if n < 0:
            raise ValueError("n must be non-negative")
        if n <= 1:
            return accumulator
        return Factorial.tail_recursive(n - 1, n * accumulator)

    @staticmethod
    def approximate_stirling(n: int) -> float:
        """Stirling's approximation for large n."""
        import math
        if n < 0:
            raise ValueError("n must be non-negative")
        return math.sqrt(2 * math.pi * n) * (n / math.e) ** n

    @staticmethod
    def trailing_zeros(n: int) -> int:
        """Count trailing zeros in n! (number of 10 factors)."""
        if n < 0:
            raise ValueError("n must be non-negative")
        count = 0
        power_of_5 = 5
        while n >= power_of_5:
            count += n // power_of_5
            power_of_5 *= 5
        return count

def main():
    """Main factorial program."""
    print("=" * 50)
    print("FACTORIAL FUNCTION")
    print("=" * 50)

    # Compare implementations
    test_values = [5, 10, 15, 20]

    print(f"\\nFactorial values:")
    for n in test_values:
        iter_result = Factorial.iterative(n)
        print(f"  {n}! = {iter_result}")

    # Large factorial
    print(f"\\n50! (first 20 digits): {str(Factorial.iterative(50))[:20]}...")
    print(f"50! has {len(str(Factorial.iterative(50)))} digits")

    # Memoization comparison
    import time

    print(f"\\nMemoization comparison (100!):")
    start = time.perf_counter()
    Factorial.recursive(100)
    t_rec = time.perf_counter() - start

    start = time.perf_counter()
    Factorial.auto_memoized(100)
    t_memo = time.perf_counter() - start

    print(f"  Recursive: {t_rec:.6f}s")
    print(f"  Memoized:  {t_memo:.6f}s")

    # Stirling approximation
    print(f"\\nStirling's approximation:")
    for n in [10, 50, 100]:
        exact = Factorial.iterative(n)
        approx = Factorial.approximate_stirling(n)
        error = abs(exact - approx) / exact * 100
        print(f"  {n}!: exact={exact}, approx={approx:.2e}, error={error:.4f}%")

    # Trailing zeros
    print(f"\\nTrailing zeros in n!:")
    for n in [10, 25, 50, 100, 1000]:
        zeros = Factorial.trailing_zeros(n)
        print(f"  {n}! has {zeros} trailing zeros")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Prime Checker Function",
      "code": `"""
Program 3: Prime Checker Function
Multiple prime checking algorithms with performance analysis.
"""

import time
import math
from typing import List, Callable

class PrimeChecker:
    """Multiple prime checking implementations."""

    @staticmethod
    def naive(n: int) -> bool:
        """Check all divisors up to n-1. O(n)."""
        if n < 2:
            return False
        for i in range(2, n):
            if n % i == 0:
                return False
        return True

    @staticmethod
    def optimized(n: int) -> bool:
        """Check up to sqrt(n). O(sqrt(n))."""
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
    def wheel(n: int) -> bool:
        """Wheel factorization (skip multiples of 2, 3)."""
        if n < 2:
            return False
        if n in (2, 3):
            return True
        if n % 2 == 0 or n % 3 == 0:
            return False
        i = 5
        while i * i <= n:
            if n % i == 0 or n % (i + 2) == 0:
                return False
            i += 6
        return True

    @staticmethod
    def miller_rabin(n: int, k: int = 5) -> bool:
        """Probabilistic primality test. O(k log³n)."""
        if n < 2:
            return False
        if n == 2 or n == 3:
            return True
        if n % 2 == 0:
            return False

        # Write n-1 as 2^r * d
        r, d = 0, n - 1
        while d % 2 == 0:
            r += 1
            d //= 2

        import random
        for _ in range(k):
            a = random.randrange(2, n - 1)
            x = pow(a, d, n)
            if x == 1 or x == n - 1:
                continue
            for _ in range(r - 1):
                x = pow(x, 2, n)
                if x == n - 1:
                    break
            else:
                return False
        return True

    @staticmethod
    def find_primes(n: int, method: Callable = None) -> List[int]:
        """Find all primes up to n using specified method."""
        if method is None:
            method = PrimeChecker.optimized
        return [i for i in range(2, n + 1) if method(i)]

    @staticmethod
    def benchmark(methods: dict, test_values: List[int]):
        """Benchmark multiple prime checking methods."""
        results = {}
        for name, method in methods.items():
            times = []
            for n in test_values:
                start = time.perf_counter()
                method(n)
                times.append(time.perf_counter() - start)
            results[name] = times
        return results

def main():
    """Main prime checker program."""
    print("=" * 50)
    print("PRIME CHECKER FUNCTION")
    print("=" * 50)

    # Test correctness
    test_numbers = [1, 2, 3, 4, 17, 18, 97, 100, 997, 1000]
    print(f"\\nPrime checks:")
    for n in test_numbers:
        result = PrimeChecker.optimized(n)
        status = "prime" if result else "not prime"
        print(f"  {n}: {status}")

    # Find primes up to 100
    primes = PrimeChecker.find_primes(100)
    print(f"\\nPrimes up to 100: {primes}")
    print(f"Count: {len(primes)}")

    # Benchmark
    methods = {
        'naive': PrimeChecker.naive,
        'optimized': PrimeChecker.optimized,
        'wheel': PrimeChecker.wheel,
    }
    test_values = [1009, 10007, 100003]

    print(f"\\nBenchmarks (seconds):")
    results = PrimeChecker.benchmark(methods, test_values)
    for name, times in results.items():
        avg_time = sum(times) / len(times)
        print(f"  {name:10s}: {avg_time:.6f}s avg")

    # Miller-Rabin for large numbers
    large_primes = [104729, 1299709, 15485863]
    print(f"\\nMiller-Rabin probabilistic test:")
    for n in large_primes:
        result = PrimeChecker.miller_rabin(n)
        print(f"  {n}: {'prime' if result else 'not prime'}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Flexible Logger",
      "code": `"""
Program 4: Flexible Logger
A configurable logging system using first-class functions.
"""

from typing import Callable, Dict, List, Optional
from datetime import datetime
from functools import wraps

class Logger:
    """Flexible logging with pluggable handlers and formatters."""

    LEVELS = {'DEBUG': 10, 'INFO': 20, 'WARN': 30, 'ERROR': 40, 'FATAL': 50}

    def __init__(self, name: str = "root", level: str = "INFO"):
        self.name = name
        self.level = self.LEVELS.get(level, 20)
        self.handlers: List[Callable] = []
        self.formatter: Callable = self._default_formatter
        self._history: List[dict] = []

    def _default_formatter(self, level: str, message: str, timestamp: datetime) -> str:
        """Default log format."""
        return f"[{timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {level:5s} {self.name}: {message}"

    def add_handler(self, handler: Callable):
        """Add a log handler function."""
        self.handlers.append(handler)

    def set_formatter(self, formatter: Callable):
        """Set the formatter function."""
        self.formatter = formatter

    def log(self, level: str, message: str):
        """Log a message if level is sufficient."""
        if self.LEVELS.get(level, 0) < self.level:
            return

        timestamp = datetime.now()
        formatted = self.formatter(level, message, timestamp)

        entry = {
            'level': level,
            'message': message,
            'timestamp': timestamp,
            'formatted': formatted
        }
        self._history.append(entry)

        for handler in self.handlers:
            handler(entry)

    def debug(self, message: str):
        self.log('DEBUG', message)

    def info(self, message: str):
        self.log('INFO', message)

    def warn(self, message: str):
        self.log('WARN', message)

    def error(self, message: str):
        self.log('ERROR', message)

    def fatal(self, message: str):
        self.log('FATAL', message)

    def get_history(self, level: Optional[str] = None) -> List[dict]:
        """Get log history, optionally filtered by level."""
        if level is None:
            return self._history
        return [entry for entry in self._history if entry['level'] == level]

# === BUILT-IN HANDLERS ===

def console_handler(entry: dict):
    """Print to console."""
    print(entry['formatted'])

def file_handler(filename: str):
    """Create a file handler."""
    def handler(entry: dict):
        with open(filename, 'a') as f:
            f.write(entry['formatted'] + '\\n')
    return handler

def colored_handler(entry: dict):
    """Print with ANSI colors."""
    colors = {
        'DEBUG': '\\033[36m',   # Cyan
        'INFO': '\\033[32m',    # Green
        'WARN': '\\033[33m',    # Yellow
        'ERROR': '\\033[31m',   # Red
        'FATAL': '\\033[35m',   # Magenta
    }
    reset = '\\033[0m'
    color = colors.get(entry['level'], '')
    print(f"{color}{entry['formatted']}{reset}")

def json_handler(entry: dict):
    """Print as JSON."""
    import json
    print(json.dumps({
        'level': entry['level'],
        'message': entry['message'],
        'timestamp': entry['timestamp'].isoformat()
    }))

# === FORMATTERS ===

def simple_formatter(level: str, message: str, timestamp: datetime) -> str:
    return f"[{level}] {message}"

def json_formatter(level: str, message: str, timestamp: datetime) -> str:
    import json
    return json.dumps({
        'level': level,
        'message': message,
        'time': timestamp.isoformat()
    })

def minimal_formatter(level: str, message: str, timestamp: datetime) -> str:
    return f"{timestamp.strftime('%H:%M:%S')} {message}"

def main():
    """Main logger program."""
    print("=" * 50)
    print("FLEXIBLE LOGGER")
    print("=" * 50)

    # Basic logger
    logger = Logger("MyApp", "DEBUG")
    logger.add_handler(console_handler)

    print("\\n--- Basic Logging ---")
    logger.debug("Application starting")
    logger.info("Connected to database")
    logger.warn("High memory usage")
    logger.error("Failed to save file")

    # Colored logger
    colored_logger = Logger("ColoredApp", "DEBUG")
    colored_logger.add_handler(colored_handler)

    print("\\n--- Colored Logging ---")
    colored_logger.debug("Debug message")
    colored_logger.info("Info message")
    colored_logger.warn("Warning message")
    colored_logger.error("Error message")

    # Custom formatter
    custom_logger = Logger("CustomApp", "INFO")
    custom_logger.set_formatter(minimal_formatter)
    custom_logger.add_handler(console_handler)

    print("\\n--- Custom Formatter ---")
    custom_logger.info("Minimal format message")

    # Multiple handlers
    multi_logger = Logger("MultiApp", "INFO")
    multi_logger.add_handler(console_handler)
    multi_logger.add_handler(json_handler)

    print("\\n--- Multiple Handlers ---")
    multi_logger.info("This appears in two formats")

    # History
    print(f"\\n--- History ({len(logger.get_history())} entries) ---")
    for entry in logger.get_history()[-3:]:
        print(f"  {entry['level']}: {entry['message']}")

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
      "text": "Answer these before moving to Part 17. 4/5 correct means you have mastered functions."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the difference between parameters and arguments. Write a function that accepts positional, keyword, default, *args, and **kwargs parameters. Call it with all five types of arguments and show the result.",
        "Q2: What is the mutable default argument trap? Write a function that demonstrates the bug, then fix it using None as the default. Explain why the bug occurs and why None fixes it.",
        "Q3: Explain the LEGB scope rule with a concrete example involving local, enclosing, global, and built-in scopes. Write a function that modifies a variable in enclosing scope using nonlocal. What happens if you use global instead?",
        "Q4: What are first-class functions? Write a function that takes another function as an argument (higher-order function). Then write a function that returns a function (factory pattern). Demonstrate both with concrete examples.",
        "Q5: Write a function with keyword-only arguments (using *) and positional-only arguments (using /). Explain why these restrictions are useful and when you would use each."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Parameters are in the function definition; arguments are the values passed. def demo(a, b=10, *args, c=20, **kwargs): return {'a':a, 'b':b, 'args':args, 'c':c, 'kwargs':kwargs}. Call: demo(1, 2, 3, 4, c=30, x=99) -> {'a':1, 'b':2, 'args':(3,4), 'c':30, 'kwargs':{'x':99}}. A2: Mutable defaults are evaluated once at definition time, not at call time. def bad(items=[]): items.append(1); return items. First call returns [1], second returns [1,1] because the same list is reused. Fix: def good(items=None): if items is None: items = []; items.append(1); return items. None is immutable, so each call creates a new list. A3: LEGB: Local (function), Enclosing (outer function), Global (module), Built-in (Python builtins). def outer(): x = 10; def inner(): nonlocal x; x = 20; inner(); print(x). Using global would modify a module-level variable named x, not the enclosing one. If no global x exists, it would create one. A4: First-class functions can be assigned, stored, passed, and returned. Higher-order: def apply(f, x): return f(x). Factory: def make_multiplier(n): return lambda x: x*n. triple = make_multiplier(3); triple(5) = 15. A5: Keyword-only (after *): def f(a, *, b): pass. f(1, b=2) works; f(1, 2) fails. Positional-only (before /): def f(a, /, b): pass. f(1, b=2) works; f(a=1, b=2) fails. Use keyword-only for parameters that must be explicit (e.g., force_named=True). Use positional-only for parameters where the name is an implementation detail (e.g., internal APIs)."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python functions. You understand the full anatomy of a function — definition, parameters, body, return, docstring, and type hints. You wield all parameter types: positional, keyword, default, *args, **kwargs, keyword-only, and positional-only. You navigate the mutable default trap with wisdom, using None as the sentinel. You understand the LEGB scope rule, using global and nonlocal to modify outer scopes intentionally. You treat functions as first-class objects, passing them as arguments, returning them from factories, and composing them into pipelines. You have built four complete programs: a calculator with pluggable operations, a factorial function with multiple implementations and memoization, a prime checker with benchmarking and Miller-Rabin probabilistic testing, and a flexible logger with configurable handlers and formatters. Functions are no longer just subroutines. They are the building blocks of abstraction, composition, and craft."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Functions are first-class objects. Parameters define the interface; arguments provide the data. Scope follows LEGB. Mutable defaults are a trap. First-class functions enable higher-order patterns. Master these five truths, and you have mastered the building blocks of Python. In Part 17, we will explore Advanced Functions & Recursion — memoization, tail recursion, type hints, and the Tower of Hanoi."
    },
    {
      "type": "cta",
      "text": "Start Part 17: Advanced Functions & Recursion →",
      "href": "/tutorials/python-unlocked/part-17-advanced-functions-recursion",
      "note": "28 min read · Recursion · Memoization · Type hints · Tower of Hanoi"
    }
  ]
};

export default post;
