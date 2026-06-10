const post = {
  "slug": "part-20-decorators",
  "seriesSlug": "python-unlocked",
  "partNumber": 20,
  "totalParts": 30,
  "title": "Decorators — The Python Superpower: Transforming Functions (Part 20)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "30 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Function decorators: @syntax, wrapper functions. functools.wraps and metadata preservation. Decorators with arguments (double-wrap). Class decorators, method decorators. Built-in: @property, @staticmethod, @classmethod, @dataclass. Project: timing, retry, auth, caching decorators.",
  "coverEmoji": "🦸",
  "tags": [
    "Python", "Decorators", "Wrapper Functions", "functools.wraps",
    "Decorator Arguments", "Class Decorators", "Built-in Decorators",
    "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1968, Peter Landin introduced the concept of decorators in his paper 'The Next 700 Programming Languages.' He proposed that functions could be wrapped by other functions to add behavior without modifying the original code. Fifty-eight years later, in 2026, Python's @decorator syntax is the most elegant implementation of that idea. Decorators are not just syntax sugar. They are the superpower that separates Python craftsmen from amateurs. A decorator is a function that takes a function as input, adds behavior before and after it, and returns a new function. This simple pattern powers timing, caching, authentication, rate limiting, logging, and the entire web framework ecosystem — Flask, Django, FastAPI all use decorators to route URLs and validate requests. But most developers use decorators without understanding them. They apply @lru_cache without knowing how it works. They write @app.route without understanding the closure that captures the URL pattern. In this part, we will explore the full depth of Python's decorator machinery. You will learn why decorators are closures in disguise, how functools.wraps preserves metadata, why decorators with arguments require a double-wrap pattern, and how class decorators and method decorators extend the pattern. You will build four production-quality decorators: timing, retry, authentication, and caching. By the end, decorators will not be magic. They will be your most powerful tool."
    },
    {
      "type": "h2",
      "text": "Decorator Fundamentals: Functions Wrapping Functions"
    },
    {
      "type": "p",
      "text": "A decorator is a function that takes a function as input and returns a new function. The new function typically calls the original function, adding behavior before or after the call. The @syntax is just shorthand for passing a function through another function. Understanding this means you can write decorators from scratch, debug decorator issues, and create decorators that solve real problems."
    },
    {
      "type": "code-block",
      "label": "Decorator Fundamentals",
      "code": "# === DECORATOR WITHOUT @SYNTAX ===
# A decorator is just a function that takes a function

def my_decorator(func):
    def wrapper():
        print("Something before the function.")
        func()
        print("Something after the function.")
    return wrapper

def say_hello():
    print("Hello!")

# Manual decoration
say_hello_decorated = my_decorator(say_hello)
say_hello_decorated()

# === THE @SYNTAX ===
# @decorator is shorthand for: function = decorator(function)

@my_decorator
def say_goodbye():
    print("Goodbye!")

print(f"\nWith @syntax:")
say_goodbye()

# === DECORATOR WITH ARGUMENTS ===
# The wrapper can accept and pass through arguments

def my_decorator_with_args(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@my_decorator_with_args
def add(a, b):
    return a + b

print(f"\nDecorator with args:")
result = add(3, 4)
print(f"Final result: {result}")

# === DECORATOR WITH RETURN VALUE ===
# The wrapper can modify the return value

def double_result(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result * 2
    return wrapper

@double_result
def get_five():
    return 5

print(f"\ndouble_result: get_five() = {get_five()}")

# === MULTIPLE DECORATORS ===
# Applied bottom-up (closest to function first)

def bold(func):
    def wrapper():
        return f"<b>{func()}</b>"
    return wrapper

def italic(func):
    def wrapper():
        return f"<i>{func()}</i>"
    return wrapper

@bold
@italic
def greeting():
    return "Hello"

print(f"\nMultiple decorators: {greeting()}")
# Equivalent to: bold(italic(greeting))
# Result: <b><i>Hello</i></b>

# === DECORATOR IDENTITY ===
# A decorator that does nothing (useful for testing)

def identity(func):
    return func

@identity
def no_change():
    return 42

print(f"\nIdentity decorator: {no_change()}")

# === DECORATOR AS CLOSURE ===
# Decorators are closures that capture the original function

def make_decorator(message):
    def decorator(func):
        def wrapper():
            print(message)
            return func()
        return wrapper
    return decorator

@make_decorator("Starting...")
def task():
    return "Done"

print(f"\nClosure decorator: {task()}")

print("\nDecorator fundamentals complete!")"
    },
    {
      "type": "h2",
      "text": "functools.wraps: Preserving Metadata"
    },
    {
      "type": "p",
      "text": "When you wrap a function, the wrapper replaces the original. This means the original function's name, docstring, and other metadata are lost. functools.wraps is a decorator that copies these attributes from the original function to the wrapper. Without it, debugging becomes painful and introspection breaks."
    },
    {
      "type": "code-block",
      "label": "functools.wraps Mastery",
      "code": "# === THE METADATA PROBLEM ===
# Without wraps, the wrapper hides the original function

def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@bad_decorator
def my_function():
    """This is my function."""
    return 42

print(f"Without wraps:")
print(f"  Name: {my_function.__name__}")
print(f"  Docstring: {my_function.__doc__}")
print(f"  Module: {my_function.__module__}")

# === THE FIX: functools.wraps ===
from functools import wraps

def good_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@good_decorator
def my_function_fixed():
    """This is my function."""
    return 42

print(f"\nWith wraps:")
print(f"  Name: {my_function_fixed.__name__}")
print(f"  Docstring: {my_function_fixed.__doc__}")
print(f"  Module: {my_function_fixed.__module__}")

# === WHAT wraps COPIES ===
# __name__, __doc__, __annotations__, __dict__, __module__, __qualname__

def inspect_metadata(func):
    print(f"\nMetadata for {func.__name__}:")
    print(f"  __name__: {func.__name__}")
    print(f"  __doc__: {func.__doc__}")
    print(f"  __module__: {func.__module__}")
    print(f"  __qualname__: {func.__qualname__}")
    print(f"  __annotations__: {func.__annotations__}")

@good_decorator
def example(x: int) -> str:
    """Convert int to string."""
    return str(x)

inspect_metadata(example)

# === CUSTOM wraps ===
# You can manually copy attributes if needed

def custom_wraps(original):
    def decorator(wrapper):
        wrapper.__name__ = original.__name__
        wrapper.__doc__ = original.__doc__
        wrapper.__wrapped__ = original  # Access original function
        return wrapper
    return decorator

def my_decorator_custom(func):
    @custom_wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator_custom
def another_example():
    """Another example."""
    return 1

print(f"\nCustom wraps: {another_example.__name__}")
print(f"Access original: {another_example.__wrapped__}")

# === wraps WITH ARGUMENTS ===
# When the decorator itself takes arguments

def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    """Say hi."""
    print("Hi!")

print(f"\nRepeat decorator:")
say_hi()
print(f"Name preserved: {say_hi.__name__}")
print(f"Doc preserved: {say_hi.__doc__}")

print("\nfunctools.wraps mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Decorators with Arguments: The Double-Wrap Pattern"
    },
    {
      "type": "p",
      "text": "When a decorator needs arguments (like @repeat(3) or @timeout(10)), it requires a double-wrap pattern. The outer function takes the decorator arguments and returns the actual decorator. The inner decorator takes the function and returns the wrapper. This is not complexity for complexity's sake — it is the natural consequence of decorators being functions that return functions."
    },
    {
      "type": "code-block",
      "label": "Decorator Arguments Mastery",
      "code": "# === DOUBLE-WRAP PATTERN ===
# @decorator(arg) -> decorator(arg)(function)

def repeat(times):
    """Decorator factory: returns the actual decorator."""
    def decorator(func):
        from functools import wraps
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator

@repeat(3)
def roll_dice():
    import random
    return random.randint(1, 6)

print(f"Repeat decorator: {roll_dice()}")

# --- Multiple decorator arguments ---

def validate(min_val, max_val):
    def decorator(func):
        from functools import wraps
        @wraps(func)
        def wrapper(value):
            if not min_val <= value <= max_val:
                raise ValueError(f"Value {value} not in [{min_val}, {max_val}]")
            return func(value)
        return wrapper
    return decorator

@validate(0, 100)
def percentage(value):
    return f"{value}%"

print(f"\nValidate decorator: {percentage(50)}")
# percentage(150)  # Would raise ValueError

# --- Decorator with optional arguments ---
# Trick: detect if first arg is callable

def smart_decorator(arg=None):
    def decorator(func):
        from functools import wraps
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(f"Decorator arg: {arg}")
            return func(*args, **kwargs)
        return wrapper

    if callable(arg):
        # Used as @smart_decorator (no parentheses)
        return decorator(arg)
    # Used as @smart_decorator(arg)
    return decorator

@smart_decorator
def func1():
    return 1

@smart_decorator("custom")
def func2():
    return 2

print(f"\nSmart decorator:")
func1()
func2()

# --- Decorator with class-like syntax ---
# Using __call__ for stateful decorators

class CountCalls:
    """Decorator class that counts function calls."""

    def __init__(self, func):
        from functools import wraps
        wraps(func)(self)
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"Call {self.count} to {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello():
    print("Hello!")

print(f"\nClass decorator:")
say_hello()
say_hello()
print(f"Total calls: {say_hello.count}")

print("\nDecorator arguments mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Built-in Decorators: @property, @staticmethod, @classmethod, @dataclass"
    },
    {
      "type": "p",
      "text": "Python provides several built-in decorators that are essential for object-oriented programming. @property turns methods into attributes. @staticmethod and @classmethod create methods that don't require an instance. @dataclass automatically generates __init__, __repr__, and other methods. Understanding these decorators means writing classes that are clean, efficient, and Pythonic."
    },
    {
      "type": "code-block",
      "label": "Built-in Decorators Mastery",
      "code": "# === @property ===
# Turns a method into an attribute-like access

class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        """Get radius."""
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius must be non-negative")
        self._radius = value

    @property
    def area(self):
        """Calculate area on demand."""
        import math
        return math.pi * self._radius ** 2

    @property
    def diameter(self):
        return self._radius * 2

c = Circle(5)
print(f"Radius: {c.radius}")
print(f"Diameter: {c.diameter}")
print(f"Area: {c.area:.2f}")

c.radius = 10
print(f"New area: {c.area:.2f}")
# c.area = 100  # AttributeError! (no setter)

# === @staticmethod ===
# Method that doesn't access instance or class

class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                return False
        return True

print(f"\nStatic method: {MathUtils.add(3, 4)}")
print(f"Is 17 prime? {MathUtils.is_prime(17)}")

# === @classmethod ===
# Method that receives the class as first argument

class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def today(cls):
        import datetime
        d = datetime.date.today()
        return cls(d.year, d.month, d.day)

    @classmethod
    def from_string(cls, s):
        year, month, day = map(int, s.split('-'))
        return cls(year, month, day)

    def __repr__(self):
        return f"Date({self.year}, {self.month}, {self.day})"

d1 = Date.today()
d2 = Date.from_string("2024-06-15")
print(f"\nClass methods: {d1}, {d2}")

# === @dataclass ===
# Auto-generate __init__, __repr__, __eq__, etc.

from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float

    def distance(self, other):
        import math
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)

p1 = Point(0, 0)
p2 = Point(3, 4)
print(f"\nDataclass: {p1}, distance to {p2}: {p1.distance(p2):.2f}")

# Dataclass with defaults and mutable defaults
@dataclass
class Config:
    name: str = "default"
    values: list = field(default_factory=list)

    def add_value(self, v):
        self.values.append(v)

cfg = Config("test")
cfg.add_value(1)
cfg.add_value(2)
print(f"Config: {cfg}")

# === @classmethod as alternative constructor ===
# The 'factory method' pattern

class Shape:
    def __init__(self, name):
        self.name = name

    @classmethod
    def circle(cls, radius):
        instance = cls("circle")
        instance.radius = radius
        return instance

    @classmethod
    def rectangle(cls, width, height):
        instance = cls("rectangle")
        instance.width = width
        instance.height = height
        return instance

    def __repr__(self):
        return f"Shape({self.name})"

c = Shape.circle(5)
r = Shape.rectangle(3, 4)
print(f"\nFactory methods: {c}, {r}")

print("\nBuilt-in decorators mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Project: Four Production-Quality Decorators"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build four production-quality decorators that solve real problems: timing execution, retrying failed calls, requiring authentication, and caching results. These are the decorators you will use in real projects."
    },
    {
      "type": "code-block",
      "label": "Project: Timing Decorator",
      "code": """"
Project: Timing Decorator
Measures and reports function execution time.
"""

import time
from functools import wraps
from typing import Callable, Optional

def timer(label: Optional[str] = None, precision: int = 6):
    """
    Decorator that times function execution.

    Args:
        label: Custom label for the timer (defaults to function name)
        precision: Decimal places for time display
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = time.perf_counter()
            result = func(*args, **kwargs)
            elapsed = time.perf_counter() - start
            name = label or func.__name__
            print(f"[{name}] {elapsed:.{precision}f}s")
            return result
        return wrapper
    return decorator

# Usage
@timer()
def slow_function():
    time.sleep(0.1)
    return "Done"

@timer("Database Query")
def fetch_data():
    time.sleep(0.05)
    return [1, 2, 3]

@timer(precision=3)
def quick_task():
    return 42

def main():
    print("=" * 50)
    print("TIMING DECORATOR")
    print("=" * 50)

    slow_function()
    fetch_data()
    quick_task()

    # Timing with arguments
    @timer("Calculation")
    def calculate(n):
        total = 0
        for i in range(n):
            total += i
        return total

    calculate(100000)

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Project: Retry Decorator",
      "code": """"
Project: Retry Decorator
Automatically retries failed function calls with exponential backoff.
"""

import time
import random
from functools import wraps
from typing import Callable, Optional, Tuple, Type

def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,),
    on_retry: Optional[Callable] = None
):
    """
    Decorator that retries function calls on failure.

    Args:
        max_attempts: Maximum number of attempts
        delay: Initial delay between retries (seconds)
        backoff: Multiplier for delay after each retry
        exceptions: Tuple of exceptions to catch and retry
        on_retry: Callback function called on each retry
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exception = None

            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt == max_attempts:
                        break

                    if on_retry:
                        on_retry(attempt, max_attempts, e, current_delay)

                    time.sleep(current_delay)
                    current_delay *= backoff

            raise last_exception

        return wrapper
    return decorator

# Simulated flaky function
attempt_count = 0

@retry(max_attempts=4, delay=0.1, backoff=1.5, exceptions=(ConnectionError,))
def flaky_connect():
    global attempt_count
    attempt_count += 1
    if attempt_count < 3:
        raise ConnectionError("Network unreachable")
    return "Connected!"

@retry(
    max_attempts=3,
    delay=0.1,
    exceptions=(ValueError,),
    on_retry=lambda attempt, total, error, delay: print(
        f"  Retry {attempt}/{total} after {delay:.1f}s: {error}")
)
def validate_input(value):
    if value < 0:
        raise ValueError("Value must be non-negative")
    return value

def main():
    print("=" * 50)
    print("RETRY DECORATOR")
    print("=" * 50)

    global attempt_count
    attempt_count = 0
    print(f"\nFlaky connect (succeeds on 3rd attempt):")
    result = flaky_connect()
    print(f"  Result: {result}")

    print(f"\nValidate input (immediate success):")
    print(f"  Result: {validate_input(10)}")

    print(f"\nValidate input (retries then fails):")
    try:
        validate_input(-5)
    except ValueError as e:
        print(f"  Final error: {e}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Project: Authentication Decorator",
      "code": """"
Project: Authentication Decorator
Requires authentication before allowing function execution.
"""

from functools import wraps
from typing import Callable, Optional, Dict, Set

class AuthManager:
    """Simple authentication manager."""

    def __init__(self):
        self._users: Dict[str, str] = {}
        self._sessions: Set[str] = set()
        self._roles: Dict[str, Set[str]] = {}

    def register(self, username: str, password: str, roles: Optional[Set[str]] = None):
        self._users[username] = password
        self._roles[username] = roles or set()

    def login(self, username: str, password: str) -> Optional[str]:
        if self._users.get(username) == password:
            token = f"token_{username}_{hash(password)}"
            self._sessions.add(token)
            return token
        return None

    def logout(self, token: str):
        self._sessions.discard(token)

    def is_authenticated(self, token: str) -> bool:
        return token in self._sessions

    def has_role(self, token: str, role: str) -> bool:
        # Extract username from token (simplified)
        username = token.split('_')[1] if '_' in token else ''
        return role in self._roles.get(username, set())

# Global auth manager (in real app, use dependency injection)
auth = AuthManager()
auth.register('admin', 'secret123', {'admin', 'user'})
auth.register('alice', 'password', {'user'})

def require_auth(func: Callable):
    """Decorator that requires authentication."""
    @wraps(func)
    def wrapper(*args, token: Optional[str] = None, **kwargs):
        if not token or not auth.is_authenticated(token):
            raise PermissionError("Authentication required")
        return func(*args, **kwargs)
    return wrapper

def require_role(role: str):
    """Decorator factory that requires a specific role."""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, token: Optional[str] = None, **kwargs):
            if not token or not auth.is_authenticated(token):
                raise PermissionError("Authentication required")
            if not auth.has_role(token, role):
                raise PermissionError(f"Role '{role}' required")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@require_auth
def get_user_data():
    return {"name": "Alice", "data": "sensitive"}

@require_role('admin')
def delete_user(user_id: int):
    return f"User {user_id} deleted"

@require_role('user')
def view_profile():
    return "Profile data"

def main():
    print("=" * 50)
    print("AUTHENTICATION DECORATOR")
    print("=" * 50)

    # Login
    admin_token = auth.login('admin', 'secret123')
    alice_token = auth.login('alice', 'password')
    print(f"\nTokens: admin={admin_token[:20]}..., alice={alice_token[:20]}...")

    # Authenticated access
    print(f"\nAdmin accessing user data:")
    try:
        result = get_user_data(token=admin_token)
        print(f"  Success: {result}")
    except PermissionError as e:
        print(f"  Denied: {e}")

    # No token
    print(f"\nNo token:")
    try:
        get_user_data()
    except PermissionError as e:
        print(f"  Denied: {e}")

    # Role-based access
    print(f"\nAdmin deleting user (admin role):")
    try:
        result = delete_user(42, token=admin_token)
        print(f"  Success: {result}")
    except PermissionError as e:
        print(f"  Denied: {e}")

    print(f"\nAlice deleting user (user role):")
    try:
        delete_user(42, token=alice_token)
    except PermissionError as e:
        print(f"  Denied: {e}")

    print(f"\nAlice viewing profile (user role):")
    try:
        result = view_profile(token=alice_token)
        print(f"  Success: {result}")
    except PermissionError as e:
        print(f"  Denied: {e}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Project: Caching Decorator",
      "code": """"
Project: Caching Decorator
Memoization decorator with TTL and size limits.
"""

import time
from functools import wraps
from typing import Callable, Optional, Dict, Tuple, Any

class Cache:
    """Simple cache with TTL and size limit."""

    def __init__(self, maxsize: int = 128, ttl: Optional[float] = None):
        self.maxsize = maxsize
        self.ttl = ttl
        self._data: Dict[Tuple, Tuple[Any, float]] = {}
        self._hits = 0
        self._misses = 0

    def get(self, key: Tuple) -> Optional[Any]:
        if key not in self._data:
            self._misses += 1
            return None

        value, timestamp = self._data[key]
        if self.ttl and time.time() - timestamp > self.ttl:
            del self._data[key]
            self._misses += 1
            return None

        self._hits += 1
        return value

    def set(self, key: Tuple, value: Any):
        if len(self._data) >= self.maxsize:
            # Evict oldest entry
            oldest = min(self._data, key=lambda k: self._data[k][1])
            del self._data[oldest]
        self._data[key] = (value, time.time())

    def stats(self) -> Dict[str, int]:
        return {'hits': self._hits, 'misses': self._misses, 'size': len(self._data)}

    def clear(self):
        self._data.clear()
        self._hits = 0
        self._misses = 0

def cached(maxsize: int = 128, ttl: Optional[float] = None):
    """
    Decorator that caches function results.

    Args:
        maxsize: Maximum number of cached entries
        ttl: Time-to-live in seconds (None for no expiration)
    """
    def decorator(func: Callable):
        cache = Cache(maxsize=maxsize, ttl=ttl)

        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from arguments
            key = (args, tuple(sorted(kwargs.items())))

            # Check cache
            cached_value = cache.get(key)
            if cached_value is not None:
                return cached_value

            # Compute and cache
            result = func(*args, **kwargs)
            cache.set(key, result)
            return result

        # Attach cache methods to wrapper
        wrapper.cache_info = cache.stats
        wrapper.cache_clear = cache.clear
        wrapper._cache = cache

        return wrapper
    return decorator

# Usage
@cached(maxsize=64)
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

@cached(ttl=2.0)
def get_current_time():
    return time.time()

@cached()
def expensive_calculation(x: int, y: int) -> int:
    time.sleep(0.1)  # Simulate expensive work
    return x ** y

def main():
    print("=" * 50)
    print("CACHING DECORATOR")
    print("=" * 50)

    # Fibonacci with cache
    print(f"\nFibonacci(30):")
    start = time.perf_counter()
    result = fibonacci(30)
    t1 = time.perf_counter() - start
    print(f"  First call: {result} ({t1:.4f}s)")

    start = time.perf_counter()
    result = fibonacci(30)
    t2 = time.perf_counter() - start
    print(f"  Second call: {result} ({t2:.6f}s)")
    print(f"  Cache stats: {fibonacci.cache_info()}")

    # TTL cache
    print(f"\nTTL cache (2 seconds):")
    t1 = get_current_time()
    print(f"  First: {t1:.2f}")
    t2 = get_current_time()
    print(f"  Second (cached): {t2:.2f}")
    print(f"  Same? {t1 == t2}")

    time.sleep(2.5)
    t3 = get_current_time()
    print(f"  After TTL: {t3:.2f}")
    print(f"  Different? {t1 != t3}")

    # Expensive calculation
    print(f"\nExpensive calculation (100ms sleep):")
    start = time.perf_counter()
    expensive_calculation(2, 10)
    t1 = time.perf_counter() - start

    start = time.perf_counter()
    expensive_calculation(2, 10)
    t2 = time.perf_counter() - start

    print(f"  First: {t1:.3f}s")
    print(f"  Second (cached): {t2:.6f}s")
    print(f"  Speedup: {t1/t2:.0f}x")

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
      "text": "Answer these before moving to Part 21. 4/5 correct means you have mastered decorators."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is a decorator? Write a decorator @uppercase that converts the return value of a function to uppercase. Show the manual equivalent (without @syntax) and explain why decorators are closures.",
        "Q2: Why is functools.wraps necessary? Write a decorator without wraps, then with wraps. Show the difference in __name__, __doc__, and __module__. What happens to stack traces without wraps?",
        "Q3: Write a decorator with arguments: @repeat(n) that calls the decorated function n times and returns a list of all results. Explain the double-wrap pattern and why it is necessary.",
        "Q4: Explain the difference between @staticmethod, @classmethod, and regular instance methods. Write a class that uses all three and demonstrate when each is appropriate.",
        "Q5: Write a caching decorator @memoize that stores function results in a dictionary. Handle unhashable arguments by converting them to a hashable key. Include a cache_info() method that returns hit/miss statistics."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: A decorator is a function that takes a function and returns a new function. def uppercase(func): def wrapper(*args, **kwargs): result = func(*args, **kwargs); return str(result).upper(); return wrapper. Manual: my_func = uppercase(my_func). Decorators are closures because the wrapper function captures the original func from the enclosing decorator scope. A2: Without wraps, the wrapper replaces the original function's metadata. __name__ becomes 'wrapper', __doc__ becomes None, __module__ becomes the decorator's module. Stack traces show 'wrapper' instead of the real function name, making debugging hard. wraps copies __name__, __doc__, __annotations__, __dict__, and __module__ from the original to the wrapper. A3: def repeat(n): def decorator(func): @wraps(func) def wrapper(*args, **kwargs): return [func(*args, **kwargs) for _ in range(n)]; return wrapper; return decorator. Double-wrap is necessary because @repeat(3) is evaluated first, returning the actual decorator. Then the decorator is applied to the function. The outer function captures the argument (3), the inner decorator captures the function. A4: Instance method: receives self (the instance). @classmethod: receives cls (the class), used for alternative constructors. @staticmethod: receives neither, used for utility functions related to the class. class Demo: def instance(self): return self; @classmethod def from_string(cls, s): return cls(s); @staticmethod def is_valid(s): return len(s) > 0. A5: def memoize(func): cache = {}; @wraps(func) def wrapper(*args, **kwargs): key = _make_key(args, kwargs); if key in cache: wrapper._hits += 1; return cache[key]; wrapper._misses += 1; result = func(*args, **kwargs); cache[key] = result; return result; wrapper.cache_info = lambda: {'hits': wrapper._hits, 'misses': wrapper._misses}; wrapper._hits = 0; wrapper._misses = 0; return wrapper. For unhashable args, convert lists to tuples and dicts to frozenset of items."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered decorators — the Python superpower. You understand that a decorator is a function that takes a function and returns a new function, adding behavior without modifying the original. You use functools.wraps to preserve metadata, making decorators transparent and debuggable. You write decorators with arguments using the double-wrap pattern, creating configurable behavior like @repeat(3) and @timeout(10). You apply built-in decorators — @property, @staticmethod, @classmethod, @dataclass — to write classes that are clean, efficient, and Pythonic. You have built four production-quality decorators: a timing decorator with configurable precision, a retry decorator with exponential backoff, an authentication decorator with role-based access control, and a caching decorator with TTL and size limits. Decorators are no longer magic. They are the superpower that transforms ordinary functions into instrumented, resilient, secure, and optimized components."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: A decorator is a function that wraps another function. wraps preserves metadata. Arguments require double-wrap. Built-in decorators power OOP. Master these four truths, and you have mastered the Python superpower. In Part 21, we will explore Error Handling & Exceptions — the defensive programming techniques that make your code robust against the unexpected."
    },
    {
      "type": "cta",
      "text": "Start Part 21: Error Handling & Exceptions →",
      "href": "/tutorials/python-unlocked/part-21-error-handling",
      "note": "26 min read · try-except-else-finally · Custom exceptions · Exception hierarchy · Context managers"
    }
  ]
};

export default post;
