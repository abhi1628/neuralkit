const post = {
  "slug": "part-19-closures",
  "seriesSlug": "python-unlocked",
  "partNumber": 19,
  "totalParts": 30,
  "title": "Closures & Lexical Scoping: The Hidden Environment (Part 19)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "24 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Closure definition: function + environment. Factory functions, counter closures. nonlocal and mutable state in closures. Late binding closure trap (the classic gotcha). Four complete programs.",
  "coverEmoji": "🔒",
  "tags": [
    "Python", "Closures", "Lexical Scoping", "Factory Functions",
    "nonlocal", "Late Binding", "Mutable State", "Environment"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1960, Peter J. Landin introduced the concept of closures in his paper 'The Mechanical Evaluation of Expressions.' He showed that a function is not just code — it is code plus the environment in which it was defined. Sixty-six years later, in 2026, Python closures embody that principle. A closure is a function that remembers the variables from its enclosing scope, even when that scope has finished executing. This is not magic. It is lexical scoping — the rule that Python resolves variable names based on where they are defined, not where they are called. Closures enable factory functions that generate customized functions, counter functions that maintain state, and the configuration builders that power real-world systems. But closures have a dark side: the late binding trap, where all closures in a loop capture the same variable, creating a bug that has destroyed production systems. In this part, we will explore the full depth of closures and lexical scoping. You will learn what a closure is, how to inspect its captured variables, how to use nonlocal to modify enclosing state, and how to avoid the late binding trap that separates senior developers from juniors. By the end, closures will not be a mystery. They will be the hidden environment that powers your most elegant code."
    },
    {
      "type": "h2",
      "text": "What Is a Closure? Function + Environment"
    },
    {
      "type": "p",
      "text": "A closure is a function object that remembers values in its enclosing scope, even if that scope is no longer active. In Python, every function is technically a closure — it carries a __closure__ attribute that references the cells of captured variables. Understanding closures means understanding that functions are not just code; they are code plus the environment in which they were created."
    },
    {
      "type": "code-block",
      "label": "Closure Fundamentals",
      "code": "# === CLOSURE DEFINITION ===
# A closure is a function + the environment it was defined in

def make_multiplier(factor):
    """Create a function that multiplies by factor."""
    def multiplier(x):
        return x * factor
    return multiplier

# Create two closures with different environments
triple = make_multiplier(3)
double = make_multiplier(2)

print(f"triple(5) = {triple(5)}")  # 15
print(f"double(5) = {double(5)}")  # 10

# === INSPECTING CLOSURES ===
# Closures have a __closure__ attribute

print(f"\ntriple.__closure__: {triple.__closure__}")
print(f"triple.__closure__[0].cell_contents: {triple.__closure__[0].cell_contents}")
print(f"double.__closure__[0].cell_contents: {double.__closure__[0].cell_contents}")

# === CLOSURE VS REGULAR FUNCTION ===
# Regular functions have empty __closure__

def regular_function(x):
    return x + 1

print(f"\nregular.__closure__: {regular_function.__closure__}")

# === CLOSURES CAPTURE BY REFERENCE ===
# The closure holds a reference, not a copy

def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter_a = make_counter()
counter_b = make_counter()

print(f"\nCounter A: {counter_a()}")  # 1
print(f"Counter A: {counter_a()}")  # 2
print(f"Counter B: {counter_b()}")  # 1 (independent!)
print(f"Counter A: {counter_a()}")  # 3

# === CLOSURES WITH MUTABLE STATE ===
# Using lists or dicts for complex state

def make_tracker():
    history = []
    def track(value):
        history.append(value)
        return len(history), history.copy()
    return track

tracker = make_tracker()
print(f"\nTrack 10: {tracker(10)}")
print(f"Track 20: {tracker(20)}")
print(f"Track 30: {tracker(30)}")

# === CLOSURES WITH MULTIPLE CAPTURED VARIABLES ===

def make_power(base, exponent):
    """Capture multiple variables."""
    def calculate():
        return base ** exponent
    return calculate

power_2_3 = make_power(2, 3)
power_3_2 = make_power(3, 2)

print(f"\n2^3 = {power_2_3()}")
print(f"3^2 = {power_3_2()}")

# Inspect multiple closures
print(f"power_2_3 closures: {[cell.cell_contents for cell in power_2_3.__closure__]}")

print("\nClosure fundamentals complete!")"
    },
    {
      "type": "h2",
      "text": "Factory Functions: Creating Functions on Demand"
    },
    {
      "type": "p",
      "text": "A factory function is a function that returns another function. The returned function is a closure that captures the factory's arguments. This pattern is the foundation of configuration systems, plugin architectures, and the decorator pattern. Factory functions turn one general function into many specialized ones."
    },
    {
      "type": "code-block",
      "label": "Factory Functions Mastery",
      "code": "# === FACTORY FUNCTIONS ===
# Functions that create and return customized functions

# --- Multiplier factory ---
def make_multiplier(n):
    return lambda x: x * n

triple = make_multiplier(3)
quadruple = make_multiplier(4)

print(f"triple(5) = {triple(5)}")
print(f"quadruple(5) = {quadruple(5)}")

# --- Power factory ---
def make_power(exponent):
    return lambda base: base ** exponent

square = make_power(2)
cube = make_power(3)

print(f"\nsquare(5) = {square(5)}")
print(f"cube(3) = {cube(3)}")

# --- Formatter factory ---
def make_formatter(template):
    """Create a formatter with a fixed template."""
    def format_value(value):
        return template.format(value=value)
    return format_value

currency_format = make_formatter("${value:.2f}")
percent_format = make_formatter("{value:.1%}")

print(f"\nCurrency: {currency_format(99.99)}")
print(f"Percent: {percent_format(0.856)}")

# --- Validator factory ---
def make_validator(min_val, max_val):
    """Create a range validator."""
    def validate(value):
        return min_val <= value <= max_val
    return validate

validate_percentage = make_validator(0, 100)
validate_age = make_validator(0, 150)

print(f"\nIs 50 valid percent? {validate_percentage(50)}")
print(f"Is 200 valid percent? {validate_percentage(200)}")
print(f"Is 25 valid age? {validate_age(25)}")

# --- Logger factory ---
def make_logger(prefix, level="INFO"):
    """Create a prefixed logger."""
    def log(message):
        print(f"[{level}] {prefix}: {message}")
    return log

error_log = make_logger("Auth", "ERROR")
info_log = make_logger("DB", "INFO")

error_log("Login failed")
info_log("Connected")

# --- Predicate factory ---
def make_predicate(field, operator, value):
    """Create a comparison predicate."""
    ops = {
        'eq': lambda x: x == value,
        'ne': lambda x: x != value,
        'gt': lambda x: x > value,
        'lt': lambda x: x < value,
        'ge': lambda x: x >= value,
        'le': lambda x: x <= value,
        'in': lambda x: x in value,
    }
    def predicate(obj):
        return ops[operator](getattr(obj, field, obj.get(field) if isinstance(obj, dict) else None))
    return predicate

# Usage with objects
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

is_adult = make_predicate('age', 'ge', 18)
alice = Person('Alice', 30)
bob = Person('Bob', 15)

print(f"\nAlice is adult? {is_adult(alice)}")
print(f"Bob is adult? {is_adult(bob)}")

print("\nFactory functions mastery complete!")"
    },
    {
      "type": "h2",
      "text": "nonlocal: Modifying Enclosing Scope"
    },
    {
      "type": "p",
      "text": "The nonlocal keyword allows a nested function to modify variables in its enclosing scope. Without nonlocal, assigning to a variable in a nested function creates a new local variable, shadowing the outer one. With nonlocal, the assignment modifies the captured variable. This is essential for stateful closures — counters, accumulators, and mutable configuration."
    },
    {
      "type": "code-block",
      "label": "nonlocal Mastery",
      "code": "# === nonlocal ===
# Modify variables in enclosing (non-global) scope

# --- Counter with nonlocal ---
def make_counter(start=0):
    count = start
    def increment(step=1):
        nonlocal count
        count += step
        return count
    def decrement(step=1):
        nonlocal count
        count -= step
        return count
    def reset():
        nonlocal count
        count = start
        return count
    def get():
        return count
    return increment, decrement, reset, get

inc, dec, reset, get = make_counter(10)

print(f"Start: {get()}")
print(f"Increment: {inc()}")
print(f"Increment(5): {inc(5)}")
print(f"Decrement(3): {dec(3)}")
print(f"Reset: {reset()}")

# --- Without nonlocal (the bug) ---
def make_counter_broken():
    count = 0
    def increment():
        count += 1  # UnboundLocalError!
        return count
    return increment

# broken = make_counter_broken()
# broken()  # Would raise UnboundLocalError

# --- Mutable state without nonlocal ---
# Lists and dicts can be modified without nonlocal

def make_accumulator():
    total = [0]  # List is mutable
    def add(value):
        total[0] += value
        return total[0]
    return add

acc = make_accumulator()
print(f"\nAccumulator: {acc(10)}")
print(f"Accumulator: {acc(20)}")
print(f"Accumulator: {acc(30)}")

# --- nonlocal vs global ---
# nonlocal: modifies nearest enclosing scope
# global: modifies module-level scope

config = {'debug': False}

def outer():
    local_config = {'debug': True}
    def inner():
        nonlocal local_config
        local_config['debug'] = False
        print(f"  Inner modified local: {local_config}")
    inner()
    print(f"  Outer sees: {local_config}")

print(f"\nBefore outer: {config}")
outer()
print(f"After outer: {config} (unchanged)")

# --- Multiple nonlocal variables ---
def make_bank_account(balance):
    transactions = []
    def deposit(amount):
        nonlocal balance
        balance += amount
        transactions.append(('deposit', amount))
        return balance
    def withdraw(amount):
        nonlocal balance
        if amount > balance:
            raise ValueError("Insufficient funds")
        balance -= amount
        transactions.append(('withdraw', amount))
        return balance
    def get_balance():
        return balance
    def get_history():
        return transactions.copy()
    return deposit, withdraw, get_balance, get_history

deposit, withdraw, get_balance, get_history = make_bank_account(1000)

print(f"\nBank account:")
print(f"  Initial: ${get_balance()}")
print(f"  Deposit $500: ${deposit(500)}")
print(f"  Withdraw $200: ${withdraw(200)}")
print(f"  Balance: ${get_balance()}")
print(f"  History: {get_history()}")

print("\nnonlocal mastery complete!")"
    },
    {
      "type": "h2",
      "text": "The Late Binding Trap: The Classic Gotcha"
    },
    {
      "type": "p",
      "text": "The late binding trap is the most insidious closure bug in Python. When you create multiple closures in a loop, they all capture the same variable — not its value at the time of creation. By the time the closures are called, the loop has finished and the variable holds its final value. This bug has destroyed production systems, failed job interviews, and caused countless hours of debugging. Understanding it is the mark of a senior Python developer."
    },
    {
      "type": "code-block",
      "label": "Late Binding Trap",
      "code": "# === THE LATE BINDING TRAP ===
# Closures in a loop capture the VARIABLE, not its VALUE

# --- THE BUG ---
def make_multipliers_buggy():
    """Create multipliers 1x through 5x. BUGGY VERSION."""
    multipliers = []
    for i in range(1, 6):
        multipliers.append(lambda x: x * i)  # i is captured by reference!
    return multipliers

buggy = make_multipliers_buggy()
print("Buggy multipliers:")
for i, mult in enumerate(buggy, 1):
    print(f"  {i}x(10) = {mult(10)}")  # ALL return 50!

# Why? All lambdas reference the same 'i', which is 5 after the loop
print(f"  Captured value: {buggy[0].__closure__[0].cell_contents}")

# --- FIX 1: Default argument ---
# Default arguments are evaluated at definition time
def make_multipliers_fixed():
    """Fixed version using default argument."""
    multipliers = []
    for i in range(1, 6):
        multipliers.append(lambda x, i=i: x * i)  # i is captured by value!
    return multipliers

fixed = make_multipliers_fixed()
print(f"\nFixed multipliers (default arg):")
for i, mult in enumerate(fixed, 1):
    print(f"  {i}x(10) = {mult(10)}")

# --- FIX 2: Factory function ---
# Create a separate scope for each closure
def make_multiplier(n):
    return lambda x: x * n

def make_multipliers_factory():
    return [make_multiplier(i) for i in range(1, 6)]

factory = make_multipliers_factory()
print(f"\nFixed multipliers (factory):")
for i, mult in enumerate(factory, 1):
    print(f"  {i}x(10) = {mult(10)}")

# --- FIX 3: functools.partial ---
from functools import partial

def multiply(a, b):
    return a * b

def make_multipliers_partial():
    return [partial(multiply, i) for i in range(1, 6)]

partial_multipliers = make_multipliers_partial()
print(f"\nFixed multipliers (partial):")
for i, mult in enumerate(partial_multipliers, 1):
    print(f"  {i}x(10) = {mult(10)}")

# --- FIX 4: List comprehension with immediate call ---
# Force evaluation at creation time
def make_multipliers_comprehension():
    return [(lambda i: lambda x: x * i)(i) for i in range(1, 6)]

comp = make_multipliers_comprehension()
print(f"\nFixed multipliers (comprehension):")
for i, mult in enumerate(comp, 1):
    print(f"  {i}x(10) = {mult(10)}")

# --- REAL-WORLD BUG: Callbacks in a loop ---
# This pattern appears in GUI programming, async code, and event handlers

class Button:
    def __init__(self, label):
        self.label = label
        self.callback = None
    def on_click(self, callback):
        self.callback = callback
    def click(self):
        if self.callback:
            self.callback()

# BUGGY: All buttons print the same value
buttons_buggy = []
for i in range(3):
    btn = Button(f"Button {i}")
    btn.on_click(lambda: print(f"Clicked button {i}"))
    buttons_buggy.append(btn)

print(f"\nBuggy buttons:")
for btn in buttons_buggy:
    btn.click()  # All print 'Clicked button 2'!

# FIXED: Capture i at definition time
buttons_fixed = []
for i in range(3):
    btn = Button(f"Button {i}")
    btn.on_click(lambda i=i: print(f"Clicked button {i}"))
    buttons_fixed.append(btn)

print(f"\nFixed buttons:")
for btn in buttons_fixed:
    btn.click()

print("\nLate binding trap mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use closures, factory functions, nonlocal, and the late binding fix to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Counter Factory",
      "code": """"
Program 1: Counter Factory
Multiple counter implementations using closures.
Demonstrates factory functions, nonlocal, and state management.
"""

from typing import Callable, Tuple

class CounterFactory:
    """Create various types of counters."""

    @staticmethod
    def simple_counter(start: int = 0) -> Callable[[], int]:
        """Create a simple incrementing counter."""
        count = start
        def increment():
            nonlocal count
            count += 1
            return count
        return increment

    @staticmethod
    def step_counter(start: int = 0, step: int = 1) -> Callable[[], int]:
        """Create a counter with configurable step."""
        count = start
        def increment():
            nonlocal count
            count += step
            return count
        return increment

    @staticmethod
    def bidirectional_counter(start: int = 0) -> Tuple[Callable, Callable, Callable, Callable]:
        """Create a counter with increment, decrement, reset, and get."""
        count = start
        original = start

        def increment():
            nonlocal count
            count += 1
            return count

        def decrement():
            nonlocal count
            count -= 1
            return count

        def reset():
            nonlocal count
            count = original
            return count

        def get():
            return count

        return increment, decrement, reset, get

    @staticmethod
    def modulo_counter(modulo: int, start: int = 0) -> Callable[[], int]:
        """Create a counter that wraps around at modulo."""
        count = start
        def increment():
            nonlocal count
            count = (count + 1) % modulo
            return count
        return increment

    @staticmethod
    def event_counter(events: list) -> Callable[[str], int]:
        """Create a counter that counts specific events."""
        counts = {event: 0 for event in events}
        def count_event(event: str):
            if event in counts:
                counts[event] += 1
            return counts.get(event, 0)
        def get_counts():
            return counts.copy()
        return count_event, get_counts

def main():
    """Main counter factory program."""
    print("=" * 50)
    print("COUNTER FACTORY")
    print("=" * 50)

    # Simple counter
    counter = CounterFactory.simple_counter(10)
    print(f"\nSimple counter:")
    for _ in range(5):
        print(f"  {counter()}")

    # Step counter
    counter_5 = CounterFactory.step_counter(0, 5)
    print(f"\nStep counter (by 5):")
    for _ in range(5):
        print(f"  {counter_5()}")

    # Bidirectional counter
    inc, dec, reset, get = CounterFactory.bidirectional_counter(100)
    print(f"\nBidirectional counter:")
    print(f"  Initial: {get()}")
    print(f"  Increment: {inc()}")
    print(f"  Increment: {inc()}")
    print(f"  Decrement: {dec()}")
    print(f"  Reset: {reset()}")

    # Modulo counter
    mod = CounterFactory.modulo_counter(5)
    print(f"\nModulo counter (mod 5):")
    for _ in range(10):
        print(f"  {mod()}")

    # Event counter
    count_event, get_counts = CounterFactory.event_counter(['click', 'scroll', 'hover'])
    print(f"\nEvent counter:")
    for event in ['click', 'click', 'scroll', 'hover', 'click', 'scroll']:
        count_event(event)
    print(f"  Counts: {get_counts()}")

    # Multiple independent counters
    c1 = CounterFactory.simple_counter(0)
    c2 = CounterFactory.simple_counter(100)
    print(f"\nIndependent counters:")
    print(f"  c1: {c1()}, {c1()}, {c1()}")
    print(f"  c2: {c2()}, {c2()}, {c2()}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 2: Multiplier Factory",
      "code": """"
Program 2: Multiplier Factory
Creates specialized multiplier functions with closures.
Demonstrates factory functions and the late binding fix.
"""

from functools import partial
from typing import List, Callable

class MultiplierFactory:
    """Create multiplier functions safely."""

    @staticmethod
    def buggy_version() -> List[Callable[[int], int]]:
        """Demonstrate the late binding bug."""
        multipliers = []
        for i in range(1, 6):
            multipliers.append(lambda x: x * i)
        return multipliers

    @staticmethod
    def fixed_with_default() -> List[Callable[[int], int]]:
        """Fix using default argument."""
        return [lambda x, i=i: x * i for i in range(1, 6)]

    @staticmethod
    def fixed_with_factory() -> List[Callable[[int], int]]:
        """Fix using nested factory function."""
        def make_multiplier(n):
            return lambda x: x * n
        return [make_multiplier(i) for i in range(1, 6)]

    @staticmethod
    def fixed_with_partial() -> List[Callable[[int], int]]:
        """Fix using functools.partial."""
        def multiply(a, b):
            return a * b
        return [partial(multiply, i) for i in range(1, 6)]

    @staticmethod
    def fixed_with_comprehension() -> List[Callable[[int], int]]:
        """Fix using immediate call in comprehension."""
        return [(lambda n: lambda x: x * n)(i) for i in range(1, 6)]

    @staticmethod
    def power_factory() -> List[Callable[[int], int]]:
        """Create power functions (x^1 through x^5)."""
        def make_power(n):
            return lambda x: x ** n
        return [make_power(i) for i in range(1, 6)]

    @staticmethod
    def scale_factory(scales: List[float]) -> List[Callable[[float], float]]:
        """Create scaling functions for given scale factors."""
        def make_scale(factor):
            return lambda x: x * factor
        return [make_scale(s) for s in scales]

def main():
    """Main multiplier factory program."""
    print("=" * 50)
    print("MULTIPLIER FACTORY")
    print("=" * 50)

    # Buggy version
    buggy = MultiplierFactory.buggy_version()
    print(f"\nBuggy version (all should be 10, 20, 30, 40, 50):")
    for i, mult in enumerate(buggy, 1):
        result = mult(10)
        status = "✓" if result == i * 10 else "✗ BUG!"
        print(f"  {i}x(10) = {result} {status}")

    # Fixed versions
    fixes = [
        ('Default arg', MultiplierFactory.fixed_with_default),
        ('Factory func', MultiplierFactory.fixed_with_factory),
        ('Partial', MultiplierFactory.fixed_with_partial),
        ('Comprehension', MultiplierFactory.fixed_with_comprehension),
    ]

    for name, factory in fixes:
        multipliers = factory()
        print(f"\n{name}:")
        for i, mult in enumerate(multipliers, 1):
            result = mult(10)
            status = "✓" if result == i * 10 else "✗"
            print(f"  {i}x(10) = {result} {status}")

    # Power factory
    powers = MultiplierFactory.power_factory()
    print(f"\nPower functions (2^1 to 2^5):")
    for i, power in enumerate(powers, 1):
        print(f"  2^{i} = {power(2)}")

    # Scale factory
    scales = [0.5, 1.0, 2.0, 3.14]
    scalers = MultiplierFactory.scale_factory(scales)
    print(f"\nScale functions (input=10):")
    for factor, scale in zip(scales, scalers):
        print(f"  {factor}x: {scale(10)}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 3: Configuration Builder",
      "code": """"
Program 3: Configuration Builder
Build configuration objects using closures and factory functions.
Demonstrates stateful closures, nonlocal, and builder pattern.
"""

from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass

class ConfigBuilder:
    """Build configuration using closure-based builder pattern."""

    def __init__(self):
        self._config: Dict[str, Any] = {}
        self._validators: Dict[str, Callable] = {}

    def add_setting(self, key: str, default: Any, validator: Optional[Callable] = None):
        """Add a setting with optional validator."""
        self._config[key] = default
        if validator:
            self._validators[key] = validator
        return self

    def build(self) -> Dict[str, Any]:
        """Build and validate configuration."""
        for key, validator in self._validators.items():
            if not validator(self._config[key]):
                raise ValueError(f"Validation failed for {key}: {self._config[key]}")
        return self._config.copy()

class ClosureConfig:
    """Configuration using closures instead of classes."""

    @staticmethod
    def make_config_builder():
        """Create a closure-based configuration builder."""
        config = {}
        validators = {}

        def set(key: str, value: Any):
            config[key] = value
            return set  # Enable chaining

        def validate(key: str, validator: Callable):
            validators[key] = validator
            return validate

        def build() -> Dict[str, Any]:
            for key, validator in validators.items():
                if not validator(config.get(key)):
                    raise ValueError(f"Validation failed for {key}")
            return config.copy()

        def get(key: str) -> Any:
            return config.get(key)

        return set, validate, build, get

    @staticmethod
    def make_app_config():
        """Create a pre-configured app configuration."""
        set_val, validate, build, get = ClosureConfig.make_config_builder()

        # Set defaults
        set_val('host', 'localhost')
        set_val('port', 8080)
        set_val('debug', False)
        set_val('workers', 4)
        set_val('timeout', 30)

        # Add validators
        validate('port', lambda x: isinstance(x, int) and 1 <= x <= 65535)
        validate('workers', lambda x: isinstance(x, int) and x >= 1)
        validate('timeout', lambda x: isinstance(x, (int, float)) and x > 0)

        return set_val, validate, build, get

    @staticmethod
    def make_db_config():
        """Create a pre-configured database configuration."""
        set_val, validate, build, get = ClosureConfig.make_config_builder()

        set_val('host', 'localhost')
        set_val('port', 5432)
        set_val('database', 'app_db')
        set_val('username', 'app_user')
        set_val('password', '')
        set_val('pool_size', 10)
        set_val('ssl', False)

        validate('port', lambda x: isinstance(x, int) and 1 <= x <= 65535)
        validate('pool_size', lambda x: isinstance(x, int) and x >= 1)
        validate('database', lambda x: isinstance(x, str) and len(x) > 0)

        return set_val, validate, build, get

def main():
    """Main configuration builder program."""
    print("=" * 50)
    print("CONFIGURATION BUILDER")
    print("=" * 50)

    # Class-based builder
    print(f"\n--- Class-based builder ---")
    builder = ConfigBuilder()
    config = (builder
        .add_setting('host', '0.0.0.0')
        .add_setting('port', 3000, lambda x: 1 <= x <= 65535)
        .add_setting('debug', True)
        .build())
    print(f"Config: {config}")

    # Closure-based builder
    print(f"\n--- Closure-based builder ---")
    set_val, validate, build, get = ClosureConfig.make_app_config()

    # Modify configuration
    set_val('host', '0.0.0.0')
    set_val('port', 3000)
    set_val('debug', True)
    set_val('workers', 8)

    print(f"Host: {get('host')}")
    print(f"Port: {get('port')}")
    print(f"Debug: {get('debug')}")

    config = build()
    print(f"Built config: {config}")

    # Database config
    print(f"\n--- Database config ---")
    set_val, validate, build, get = ClosureConfig.make_db_config()
    set_val('host', 'db.example.com')
    set_val('database', 'production')
    set_val('pool_size', 20)
    set_val('ssl', True)

    db_config = build()
    print(f"DB Config: {db_config}")

    # Validation error demo
    print(f"\n--- Validation error ---")
    set_val, validate, build, get = ClosureConfig.make_app_config()
    set_val('port', 99999)  # Invalid port
    try:
        build()
    except ValueError as e:
        print(f"Caught error: {e}")

    print("=" * 50)

if __name__ == "__main__":
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 4: Late Binding Fix Demonstration",
      "code": """"
Program 4: Late Binding Fix Demonstration
Comprehensive demonstration of the late binding trap and all fixes.
Demonstrates closures, loops, and the environment capture mechanism.
"""

from functools import partial
from typing import List, Callable, Any

class LateBindingDemo:
    """Demonstrate and fix the late binding closure trap."""

    @staticmethod
    def demonstrate_bug():
        """Show the late binding bug in action."""
        functions = []
        for i in range(5):
            functions.append(lambda: i)  # All capture same 'i'
        return functions

    @staticmethod
    def fix_with_default() -> List[Callable[[], int]]:
        """Fix: Use default argument to capture value."""
        return [lambda i=i: i for i in range(5)]

    @staticmethod
    def fix_with_factory() -> List[Callable[[], int]]:
        """Fix: Use factory function for new scope."""
        def make_func(n):
            return lambda: n
        return [make_func(i) for i in range(5)]

    @staticmethod
    def fix_with_partial() -> List[Callable[[], int]]:
        """Fix: Use functools.partial."""
        def get_value(n):
            return n
        return [partial(get_value, i) for i in range(5)]

    @staticmethod
    def fix_with_comprehension() -> List[Callable[[], int]]:
        """Fix: Immediate call in comprehension."""
        return [(lambda n: lambda: n)(i) for i in range(5)]

    @staticmethod
    def fix_with_class() -> List[Callable[[], int]]:
        """Fix: Use callable class instead of closure."""
        class ValueCapture:
            def __init__(self, value):
                self.value = value
            def __call__(self):
                return self.value
        return [ValueCapture(i) for i in range(5)]

    @staticmethod
    def test_all_fixes():
        """Test all fixes and report results."""
        print("LATE BINDING TRAP DEMONSTRATION")
        print("=" * 50)

        # Buggy version
        buggy = LateBindingDemo.demonstrate_bug()
        print(f"\nBuggy version (expected 0,1,2,3,4):")
        results = [f() for f in buggy]
        print(f"  Results: {results}")
        print(f"  Status: {'PASS' if results == list(range(5)) else 'FAIL - All return last value!'}")

        # All fixes
        fixes = [
            ('Default arg', LateBindingDemo.fix_with_default),
            ('Factory func', LateBindingDemo.fix_with_factory),
            ('Partial', LateBindingDemo.fix_with_partial),
            ('Comprehension', LateBindingDemo.fix_with_comprehension),
            ('Callable class', LateBindingDemo.fix_with_class),
        ]

        for name, fix in fixes:
            funcs = fix()
            results = [f() for f in funcs]
            status = 'PASS' if results == list(range(5)) else 'FAIL'
            print(f"\n{name}:")
            print(f"  Results: {results}")
            print(f"  Status: {status}")

    @staticmethod
    def real_world_example():
        """Real-world example: event handlers in a GUI."""
        print(f"\n\nREAL-WORLD EXAMPLE: Event Handlers")
        print("=" * 50)

        class Button:
            def __init__(self, label):
                self.label = label
                self.handler = None
            def on_click(self, handler):
                self.handler = handler
            def click(self):
                if self.handler:
                    self.handler()

        # BUGGY: All buttons do the same thing
        print(f"\nBuggy buttons:")
        buttons_buggy = []
        for i in range(3):
            btn = Button(f"Button {i}")
            btn.on_click(lambda: print(f"  Buggy: Clicked button {i}"))
            buttons_buggy.append(btn)

        for btn in buttons_buggy:
            btn.click()

        # FIXED: Each button has its own handler
        print(f"\nFixed buttons:")
        buttons_fixed = []
        for i in range(3):
            btn = Button(f"Button {i}")
            btn.on_click(lambda i=i: print(f"  Fixed: Clicked button {i}"))
            buttons_fixed.append(btn)

        for btn in buttons_fixed:
            btn.click()

    @staticmethod
    def inspect_closures():
        """Inspect closure internals."""
        print(f"\n\nCLOSURE INSPECTION")
        print("=" * 50)

        def make_closure(value):
            x = value
            y = value * 2
            def closure():
                return x + y
            return closure

        c1 = make_closure(5)
        c2 = make_closure(10)

        print(f"Closure 1 (value=5):")
        print(f"  __closure__: {c1.__closure__}")
        print(f"  Cell 0 (x): {c1.__closure__[0].cell_contents}")
        print(f"  Cell 1 (y): {c1.__closure__[1].cell_contents}")
        print(f"  Result: {c1()}")

        print(f"\nClosure 2 (value=10):")
        print(f"  __closure__: {c2.__closure__}")
        print(f"  Cell 0 (x): {c2.__closure__[0].cell_contents}")
        print(f"  Cell 1 (y): {c2.__closure__[1].cell_contents}")
        print(f"  Result: {c2()}")

def main():
    """Main late binding demonstration program."""
    LateBindingDemo.test_all_fixes()
    LateBindingDemo.real_world_example()
    LateBindingDemo.inspect_closures()

    print(f"\n\nSUMMARY")
    print("=" * 50)
    print("The late binding trap occurs when closures in a loop")
    print("capture the VARIABLE instead of its VALUE.")
    print("\nFixes:")
    print("  1. Default argument: lambda i=i: ...")
    print("  2. Factory function: def make(n): return lambda: n")
    print("  3. functools.partial: partial(func, i)")
    print("  4. Immediate call: (lambda n: lambda: n)(i)")
    print("  5. Callable class: class with __call__")

if __name__ == "__main__":
    main()"
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 20. 4/5 correct means you have mastered closures and lexical scoping."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is a closure? Write a function make_power(exponent) that returns a function which raises its argument to the given exponent. Show that the returned function remembers the exponent even after make_power has finished executing.",
        "Q2: Explain the difference between local, enclosing, global, and built-in scope. Write a nested function that modifies a variable in its enclosing scope using nonlocal. What happens if you try to modify it without nonlocal?",
        "Q3: What is the late binding trap? Write code that demonstrates the bug: create a list of 5 functions in a loop, each supposed to return its index (0 through 4). Show that all functions return 4 (the last value). Then fix it using a default argument.",
        "Q4: Write a factory function make_bank_account(balance) that returns four functions: deposit(amount), withdraw(amount), get_balance(), and get_history(). Use nonlocal to maintain state. Demonstrate that two accounts created from the same factory are independent.",
        "Q5: Explain why closures capture variables by reference, not by value. Create a closure that captures a list. Show that modifying the list outside the closure affects the closure's behavior. Then show how to prevent this by creating a copy at closure creation time."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: A closure is a function plus the environment in which it was defined. The function remembers variables from its enclosing scope even after that scope has finished. def make_power(exponent): return lambda base: base ** exponent. square = make_power(2); cube = make_power(3). square(5) = 25, cube(5) = 125. The closures hold exponent in their __closure__ cells. A2: Local: inside current function. Enclosing: in outer function. Global: module level. Built-in: Python builtins. def outer(): x = 10; def inner(): nonlocal x; x = 20; inner(); print(x). Without nonlocal, x += 1 in inner raises UnboundLocalError because Python treats x as local. A3: Late binding: closures in a loop capture the variable reference, not its value at creation time. By the time closures are called, the loop has finished and the variable holds its final value. Bug: funcs = [lambda: i for i in range(5)]; [f() for f in funcs] returns [4,4,4,4,4]. Fix: funcs = [lambda i=i: i for i in range(5)]; default argument captures value at definition time. A4: def make_bank_account(balance): transactions = []; def deposit(amount): nonlocal balance; balance += amount; transactions.append(('deposit', amount)); return balance; def withdraw(amount): nonlocal balance; if amount > balance: raise ValueError; balance -= amount; transactions.append(('withdraw', amount)); return balance; def get_balance(): return balance; def get_history(): return transactions.copy(); return deposit, withdraw, get_balance, get_history. Two accounts: acc1 = make_bank_account(100); acc2 = make_bank_account(500). acc1 and acc2 are completely independent because each call creates new scope with new balance and transactions. A5: Closures hold references to cells, not copies. def make_closure(): items = [1, 2, 3]; def add(x): items.append(x); return items; return add. c = make_closure(); items = [10, 20, 30]; c(4) uses the original [1,2,3], not the new list. To prevent: def make_closure_safe(): items = [1, 2, 3]; snapshot = items.copy(); def add(x): snapshot.append(x); return snapshot; return add."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered closures and lexical scoping. You understand that a closure is a function plus its environment — code that remembers where it was born. You inspect closures with __closure__ and cell_contents, seeing the captured variables that give each closure its identity. You write factory functions that generate customized functions, turning one general pattern into many specialized tools. You use nonlocal to modify enclosing scope, creating stateful closures like counters, accumulators, and bank accounts. You navigate the late binding trap with wisdom — the most insidious closure bug — and apply five different fixes: default arguments, factory functions, partial, comprehension tricks, and callable classes. You have built four complete programs: a counter factory with multiple implementations, a multiplier factory demonstrating all late binding fixes, a configuration builder using closure-based state, and a comprehensive late binding demonstration with real-world GUI examples. Closures are no longer a mystery. They are the hidden environment that powers your most elegant, self-contained, and reusable code."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: A closure is a function plus its environment. Factory functions create specialized closures. nonlocal modifies enclosing scope. The late binding trap captures variables, not values — always use default arguments or factory functions in loops. Master these four truths, and you have mastered closures and lexical scoping. In Part 20, we will explore Decorators — The Python Superpower: the ultimate application of first-class functions and closures."
    },
    {
      "type": "cta",
      "text": "Start Part 20: Decorators — The Python Superpower →",
      "href": "/tutorials/python-unlocked/part-20-decorators",
      "note": "30 min read · @syntax · functools.wraps · Decorators with args · Built-in decorators"
    }
  ]
};

export default post;
