const post = {
  "slug": "part-18-lambda-functional",
  "seriesSlug": "python-unlocked",
  "partNumber": 18,
  "totalParts": 30,
  "title": "Lambda & Functional Programming: Anonymous Power (Part 18)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "22 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Anonymous functions: syntax, limitations, when to use. map, filter, reduce (and why reduce is in functools). sorted with key functions. Partial functions: functools.partial. Four complete programs.",
  "coverEmoji": "λ",
  "tags": [
    "Python", "Lambda", "Functional Programming", "map",
    "filter", "reduce", "sorted", "functools.partial"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1936, Alonzo Church introduced the lambda calculus — a formal system where all computation is expressed through function abstraction and application. The lambda (λ) symbol became the emblem of anonymous functions, and Church's vision of computation as pure function composition became the foundation of functional programming. Ninety years later, in 2026, Python's lambda expressions carry that legacy forward. They are not just shorthand for small functions. They are the glue that binds map, filter, reduce, and sorted into elegant data pipelines. But lambda has limits — it cannot contain statements, assignments, or multiple expressions. Knowing when to use lambda and when to use a named function is the mark of a Python craftsman. In this part, we will explore the full depth of Python's functional programming toolkit. You will learn lambda syntax and limitations, why reduce was banished to functools, how sorted with key functions transforms sorting from primitive to powerful, and how functools.partial creates specialized functions from general ones. By the end, functional programming will not be a paradigm. It will be a style."
    },
    {
      "type": "h2",
      "text": "Lambda Expressions: Anonymous Functions"
    },
    {
      "type": "p",
      "text": "A lambda expression creates an anonymous function — a function without a name, defined in a single line. The syntax is lambda arguments: expression. Lambdas can have any number of arguments but only one expression. They are not statements; they are expressions. This means they can appear anywhere a function object is expected: inside map, filter, sorted, or even as a default argument. But they are limited: no statements, no assignments, no docstrings, and no type hints. The rule: use lambda for simple, throwaway functions. Use def for anything complex."
    },
    {
      "type": "code-block",
      "label": "Lambda Mastery",
      "code": `# === LAMBDA SYNTAX ===
# lambda arguments: expression

# Single argument
square = lambda x: x ** 2
print(f"square(5) = {square(5)}")

# Multiple arguments
add = lambda x, y: x + y
print(f"\nadd(3, 4) = {add(3, 4)}")

# Default arguments
greet = lambda name, greeting="Hello": f"{greeting}, {name}!"
print(f"\n{greet('Alice')}")
print(f"{greet('Bob', 'Hi')}")

# No arguments
get_timestamp = lambda: __import__('time').time()
print(f"\nTimestamp: {get_timestamp():.0f}")

# === LAMBDA LIMITATIONS ===
# Lambdas can only contain expressions, not statements

# CANNOT: assignment
# lambda x: y = x + 1  # SyntaxError!

# CANNOT: multiple expressions
# lambda x: print(x); x + 1  # SyntaxError!

# CANNOT: return statement
# lambda x: return x + 1  # SyntaxError!

# CANNOT: docstrings
# lambda x: "docstring"; x + 1  # The string is just an expression, not a docstring

# CANNOT: type hints
# lambda x: int: x + 1  # SyntaxError!

# CAN: conditional expression
abs_lambda = lambda x: x if x >= 0 else -x
print(f"\nabs_lambda(-5) = {abs_lambda(-5)}")

# CAN: nested function calls
process = lambda x: max(0, min(100, x))
print(f"process(150) = {process(150)}")
print(f"process(-10) = {process(-10)}")

# === LAMBDA IN DATA STRUCTURES ===
# Store lambdas in lists, dicts, etc.

operations = {
    'add': lambda a, b: a + b,
    'sub': lambda a, b: a - b,
    'mul': lambda a, b: a * b,
    'div': lambda a, b: a / b if b != 0 else float('inf'),
}

print(f"\nOperations:")
for name, op in operations.items():
    print(f"  {name}(10, 5) = {op(10, 5)}")

# === LAMBDA CLOSURES ===
# Lambdas capture variables from enclosing scope

multipliers = [(lambda n: lambda x: x * n)(i) for i in range(1, 6)]
print(f"\nMultipliers:")
for i, mult in enumerate(multipliers, 1):
    print(f"  {i}x: {mult(10)}")

# === LAMBDA VS DEF ===
# When to use each

# Use lambda for: simple, one-off functions
# Use def for: complex, reusable, documented functions

# BAD: Complex logic in lambda
# process = lambda data: [x for x in data if x > 0 and x % 2 == 0]

# GOOD: Named function for complex logic
def process_data(data):
    """Filter positive even numbers."""
    return [x for x in data if x > 0 and x % 2 == 0]

print("\nLambda mastery complete!")`
    },
    {
      "type": "h2",
      "text": "map, filter, reduce: The Functional Trio"
    },
    {
      "type": "p",
      "text": "map, filter, and reduce are the three pillars of functional iteration. map transforms every element. filter selects elements by predicate. reduce combines all elements into a single value. In Python 3, map and filter return iterators (lazy). reduce was moved to functools because Guido van Rossum believed it encouraged unreadable code. But used wisely, these functions create elegant, composable data pipelines."
    },
    {
      "type": "code-block",
      "label": "map, filter, reduce Mastery",
      "code": `# === map ===
# map(function, iterable) -> iterator

numbers = [1, 2, 3, 4, 5]

# Square all numbers
squares = map(lambda x: x ** 2, numbers)
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

# Lazy evaluation
lazy = map(lambda x: x ** 2, range(1000000))
import sys
print(f"\nLazy map size: {sys.getsizeof(lazy)} bytes")

# === filter ===
# filter(predicate, iterable) -> iterator of truthy elements

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Even numbers
evens = filter(lambda x: x % 2 == 0, numbers)
print(f"\nfilter evens: {list(evens)}")

# With None (filters falsy values)
mixed = [0, 1, '', 'hello', [], [1, 2], None, True]
truthy = filter(None, mixed)
print(f"filter None: {list(truthy)}")

# === reduce ===
# functools.reduce(function, iterable, [initializer])
# Applies function cumulatively to reduce iterable to single value

from functools import reduce

numbers = [1, 2, 3, 4, 5]

# Sum
total = reduce(lambda a, b: a + b, numbers)
print(f"\nreduce sum: {total}")

# Product
product = reduce(lambda a, b: a * b, numbers, 1)
print(f"reduce product: {product}")

# Maximum
maximum = reduce(lambda a, b: a if a > b else b, numbers)
print(f"reduce max: {maximum}")

# Concatenate strings
words = ['Hello', ' ', 'World', '!']
sentence = reduce(lambda a, b: a + b, words)
print(f"reduce concat: '{sentence}'")

# Flatten list of lists
nested = [[1, 2], [3, 4], [5, 6]]
flat = reduce(lambda a, b: a + b, nested)
print(f"reduce flatten: {flat}")

# === FUNCTIONAL COMPOSITION ===
# Chain map, filter, reduce

numbers = range(20)
# Square of even numbers, then sum
result = reduce(
    lambda a, b: a + b,
    map(lambda x: x ** 2,
        filter(lambda x: x % 2 == 0, numbers))
)
print(f"\nSum of squares of evens: {result}")

# Same with list comprehension (more readable)
result_comp = sum(x ** 2 for x in range(20) if x % 2 == 0)
print(f"Comprehension version: {result_comp}")

# === map/filter vs COMPREHENSIONS ===
# When to use each

import time

big = range(100000)

# map/filter
start = time.perf_counter()
r1 = list(map(lambda x: x * 2, filter(lambda x: x % 2 == 0, big)))
t1 = time.perf_counter() - start

# comprehension
start = time.perf_counter()
r2 = [x * 2 for x in big if x % 2 == 0]
t2 = time.perf_counter() - start

print(f"\nmap+filter: {t1:.4f}s")
print(f"comprehension: {t2:.4f}s")

# Use map/filter when:
# 1. Function already exists (no lambda overhead)
# 2. Lazy evaluation needed
# 3. Functional composition pipeline

# Use comprehensions when:
# 1. Logic is simple and self-contained
# 2. Readability is priority
# 3. Multiple conditions or nested logic

print("\nmap, filter, reduce mastery complete!")`
    },
    {
      "type": "h2",
      "text": "sorted with Key Functions: Custom Ordering"
    },
    {
      "type": "p",
      "text": "The sorted function and list.sort method accept a key parameter — a function that extracts a comparison key from each element. This transforms sorting from primitive value comparison to arbitrary, powerful ordering. The key function is called once per element, making it O(n) overhead for an O(n log n) sort. This is one of Python's most elegant features."
    },
    {
      "type": "code-block",
      "label": "sorted with Key Functions",
      "code": `# === sorted WITH KEY ===
# sorted(iterable, key=function, reverse=False)

# --- Sort by length ---
words = ['banana', 'pie', 'Washington', 'book', 'a']
by_length = sorted(words, key=len)
print(f"By length: {by_length}")

# --- Sort by last letter ---
by_last = sorted(words, key=lambda w: w[-1])
print(f"\nBy last letter: {by_last}")

# --- Sort case-insensitive ---
names = ['alice', 'Bob', 'Charlie', 'diana']
by_name = sorted(names, key=str.lower)
print(f"\nCase-insensitive: {by_name}")

# --- Sort by multiple criteria ---
# Return a tuple: sorts by first element, then second, etc.

students = [
    ('Alice', 85, 'A'),
    ('Bob', 92, 'A'),
    ('Charlie', 85, 'B'),
    ('Diana', 92, 'B'),
]

# Sort by grade (desc), then score (desc), then name
by_grade_score = sorted(students, key=lambda s: (s[2], -s[1], s[0]))
print(f"\nBy grade, score, name:")
for s in by_grade_score:
    print(f"  {s}")

# --- Sort objects by attribute ---
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    rating: float

products = [
    Product('Laptop', 999.99, 4.5),
    Product('Mouse', 29.99, 4.8),
    Product('Keyboard', 79.99, 4.2),
    Product('Monitor', 299.99, 4.7),
]

by_price = sorted(products, key=lambda p: p.price)
print(f"\nBy price: {[p.name for p in by_price]}")

by_rating = sorted(products, key=lambda p: p.rating, reverse=True)
print(f"By rating: {[p.name for p in by_rating]}")

# --- Sort by custom class method ---
class Employee:
    def __init__(self, name, salary, years):
        self.name = name
        self.salary = salary
        self.years = years

    def __repr__(self):
        return f"Employee({self.name!r}, \${self.salary}, {self.years}y)"

    def salary_per_year(self):
        return self.salary / self.years if self.years > 0 else 0

employees = [
    Employee('Alice', 100000, 5),
    Employee('Bob', 80000, 2),
    Employee('Charlie', 120000, 8),
]

by_efficiency = sorted(employees, key=Employee.salary_per_year, reverse=True)
print(f"\nBy salary/year: {by_efficiency}")

# --- Sort with operator.itemgetter and attrgetter ---
from operator import itemgetter, attrgetter

# itemgetter for tuples/lists
data = [('apple', 3), ('banana', 1), ('cherry', 2)]
by_count = sorted(data, key=itemgetter(1))
print(f"\nBy count (itemgetter): {by_count}")

# attrgetter for objects
by_name = sorted(products, key=attrgetter('name'))
print(f"By name (attrgetter): {[p.name for p in by_name]}")

# Multiple attributes
by_price_rating = sorted(products, key=attrgetter('price', 'rating'))
print(f"By price then rating: {[(p.name, p.price) for p in by_price_rating]}")

# --- Stable sort guarantee ---
# Python's sort is stable: equal elements maintain relative order

items = [('A', 1), ('B', 2), ('C', 1), ('D', 2)]
by_group = sorted(items, key=itemgetter(1))
print(f"\nStable sort: {by_group}")  # A, C, B, D (A before C, B before D)

print("\nsorted with key functions mastery complete!")`
    },
    {
      "type": "h2",
      "text": "functools.partial: Creating Specialized Functions"
    },
    {
      "type": "p",
      "text": "functools.partial creates a new function with some arguments pre-filled. It is function specialization — taking a general function and fixing some parameters to create a more specific one. This is not just convenience; it is a fundamental technique in functional programming for creating reusable, composable function variants."
    },
    {
      "type": "code-block",
      "label": "functools.partial Mastery",
      "code": `# === functools.partial ===
# Create specialized functions by pre-filling arguments

from functools import partial

# --- Basic partial ---
def power(base, exponent):
    return base ** exponent

# Create square and cube functions
square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(f"square(5) = {square(5)}")
print(f"cube(3) = {cube(3)}")

# --- Partial with multiple pre-filled args ---
def format_number(number, precision=2, prefix='', suffix=''):
    return f"{prefix}{number:.{precision}f}{suffix}"

format_currency = partial(format_number, precision=2, prefix='$')
format_percent = partial(format_number, precision=1, suffix='%')

print(f"\nCurrency: {format_currency(99.99)}")
print(f"Percent: {format_percent(0.856)}")

# --- Partial with built-in functions ---
# Create custom print functions
print_error = partial(print, '[ERROR]', sep=' ')
print_info = partial(print, '[INFO]', sep=' ')

print_error("File not found")
print_info("Operation completed")

# --- Partial for callback specialization ---
def send_message(recipient, message, priority='normal'):
    return f"To {recipient} ({priority}): {message}"

send_to_alice = partial(send_message, recipient='Alice')
send_urgent = partial(send_message, priority='urgent')

print(f"\n{send_to_alice('Hello!')}")
print(f"{send_urgent('Bob', 'System down!')}")

# --- Partial with class methods ---
class Calculator:
    def operate(self, a, b, operation='add'):
        if operation == 'add':
            return a + b
        elif operation == 'sub':
            return a - b
        elif operation == 'mul':
            return a * b
        return None

calc = Calculator()
add_func = partial(calc.operate, operation='add')
mul_func = partial(calc.operate, operation='mul')

print(f"\nadd_func(5, 3) = {add_func(5, 3)}")
print(f"mul_func(5, 3) = {mul_func(5, 3)}")

# --- Partial for data transformation pipelines ---
from functools import partial

def transform(data, scale=1, offset=0, rounding=2):
    return round(data * scale + offset, rounding)

celsius_to_fahrenheit = partial(transform, scale=9/5, offset=32, rounding=1)
meters_to_feet = partial(transform, scale=3.281, offset=0, rounding=2)

print(f"\n25°C = {celsius_to_fahrenheit(25)}°F")
print(f"10m = {meters_to_feet(10)}ft")

# --- Partial with sorted key ---
from operator import itemgetter

# Sort by specific index
sort_by_second = partial(sorted, key=itemgetter(1))
sort_by_last = partial(sorted, key=itemgetter(-1))

data = [(3, 'c'), (1, 'a'), (2, 'b')]
print(f"\nSort by second: {sort_by_second(data)}")
print(f"Sort by last: {sort_by_last(data)}")

# --- Partial for retry logic ---
import time

def fetch_data(url, timeout=30, retries=3):
    for attempt in range(retries):
        try:
            # Simulated fetch
            if attempt < 2:
                raise ConnectionError("Failed")
            return f"Data from {url}"
        except ConnectionError:
            if attempt < retries - 1:
                time.sleep(0.1)
    return None

fetch_with_retry = partial(fetch_data, retries=5, timeout=10)
print(f"\nFetch result: {fetch_with_retry('https://api.example.com')}")

print("\nfunctools.partial mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use lambda, map, filter, reduce, sorted with key functions, and partial to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Sort by Last Name",
      "code": `"""
Program 1: Sort by Last Name
Sort people by last name using custom key functions.
Demonstrates sorted, lambda, and operator.attrgetter.
"""

from operator import attrgetter
from dataclasses import dataclass
from typing import List

@dataclass
class Person:
    first_name: str
    last_name: str
    age: int

    def __repr__(self):
        return f"{self.first_name} {self.last_name}"

class NameSorter:
    """Sort people by various name criteria."""

    @staticmethod
    def get_last_name(person: Person) -> str:
        return person.last_name.lower()

    @staticmethod
    def get_full_name(person: Person) -> str:
        return f"{person.last_name}, {person.first_name}".lower()

    @staticmethod
    def sort_by_last_name(people: List[Person]) -> List[Person]:
        return sorted(people, key=NameSorter.get_last_name)

    @staticmethod
    def sort_by_full_name(people: List[Person]) -> List[Person]:
        return sorted(people, key=NameSorter.get_full_name)

    @staticmethod
    def sort_by_age_then_name(people: List[Person]) -> List[Person]:
        return sorted(people, key=lambda p: (p.age, p.last_name, p.first_name))

    @staticmethod
    def sort_by_name_length(people: List[Person]) -> List[Person]:
        return sorted(people, key=lambda p: len(p.first_name) + len(p.last_name))

    @staticmethod
    def group_by_last_name_initial(people: List[Person]) -> dict:
        from itertools import groupby
        sorted_people = sorted(people, key=lambda p: p.last_name[0].upper())
        return {
            k: list(v) for k, v in groupby(sorted_people, key=lambda p: p.last_name[0].upper())
        }

def main():
    """Main name sorter program."""
    print("=" * 50)
    print("SORT BY LAST NAME")
    print("=" * 50)

    people = [
        Person('John', 'Smith', 30),
        Person('Jane', 'Doe', 25),
        Person('Alice', 'Johnson', 35),
        Person('Bob', 'Smith', 28),
        Person('Charlie', 'Adams', 22),
        Person('Diana', 'Williams', 40),
    ]

    print(f"\nOriginal: {[str(p) for p in people]}")

    print(f"\nBy last name:")
    for p in NameSorter.sort_by_last_name(people):
        print(f"  {p}")

    print(f"\nBy full name (last, first):")
    for p in NameSorter.sort_by_full_name(people):
        print(f"  {p.last_name}, {p.first_name}")

    print(f"\nBy age, then last name:")
    for p in NameSorter.sort_by_age_then_name(people):
        print(f"  {p} (age {p.age})")

    print(f"\nBy total name length:")
    for p in NameSorter.sort_by_name_length(people):
        print(f"  {p} ({len(p.first_name) + len(p.last_name)} chars)")

    print(f"\nGrouped by last name initial:")
    for initial, group in NameSorter.group_by_last_name_initial(people).items():
        print(f"  {initial}: {[str(p) for p in group]}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Data Pipeline with map/filter",
      "code": `"""
Program 2: Data Pipeline with map/filter
ETL-style data processing using functional operations.
Demonstrates map, filter, reduce, and functional composition.
"""

from functools import reduce, partial
from typing import List, Dict, Any, Callable
from dataclasses import dataclass

@dataclass
class RawRecord:
    name: str
    age: str
    salary: str
    department: str

@dataclass
class CleanRecord:
    name: str
    age: int
    salary: float
    department: str
    seniority: str

class DataPipeline:
    """ETL pipeline using functional operations."""

    @staticmethod
    def parse_age(age_str: str) -> int:
        try:
            return int(age_str)
        except ValueError:
            return 0

    @staticmethod
    def parse_salary(salary_str: str) -> float:
        try:
            return float(salary_str.replace(',', '').replace('$', ''))
        except ValueError:
            return 0.0

    @staticmethod
    def clean_name(name: str) -> str:
        return ' '.join(word.capitalize() for word in name.strip().lower().split())

    @staticmethod
    def determine_seniority(age: int) -> str:
        if age < 25:
            return 'Junior'
        elif age < 35:
            return 'Mid-level'
        elif age < 50:
            return 'Senior'
        return 'Expert'

    @staticmethod
    def transform(raw: RawRecord) -> CleanRecord:
        """Transform raw record to clean record."""
        age = DataPipeline.parse_age(raw.age)
        salary = DataPipeline.parse_salary(raw.salary)
        return CleanRecord(
            name=DataPipeline.clean_name(raw.name),
            age=age,
            salary=salary,
            department=raw.department.upper(),
            seniority=DataPipeline.determine_seniority(age)
        )

    @staticmethod
    def is_valid(record: CleanRecord) -> bool:
        return record.age > 0 and record.salary > 0 and len(record.name) > 0

    @staticmethod
    def is_senior(record: CleanRecord) -> bool:
        return record.seniority in ('Senior', 'Expert')

    @staticmethod
    def is_high_earner(record: CleanRecord) -> bool:
        return record.salary > 100000

    @staticmethod
    def run_pipeline(records: List[RawRecord]) -> Dict[str, Any]:
        """Run full ETL pipeline."""
        # Transform all records
        cleaned = list(map(DataPipeline.transform, records))

        # Filter valid records
        valid = list(filter(DataPipeline.is_valid, cleaned))

        # Filter seniors
        seniors = list(filter(DataPipeline.is_senior, valid))

        # Filter high earners
        high_earners = list(filter(DataPipeline.is_high_earner, valid))

        # Calculate statistics
        avg_salary = reduce(lambda a, b: a + b.salary, valid, 0) / len(valid) if valid else 0
        total_payroll = reduce(lambda a, b: a + b.salary, valid, 0)

        # Group by department
        by_dept = {}
        for r in valid:
            by_dept.setdefault(r.department, []).append(r)

        # Group by seniority
        by_seniority = {}
        for r in valid:
            by_seniority.setdefault(r.seniority, []).append(r)

        return {
            'total_raw': len(records),
            'total_valid': len(valid),
            'seniors': len(seniors),
            'high_earners': len(high_earners),
            'avg_salary': avg_salary,
            'total_payroll': total_payroll,
            'by_department': {k: len(v) for k, v in by_dept.items()},
            'by_seniority': {k: len(v) for k, v in by_seniority.items()},
            'records': valid
        }

def main():
    """Main data pipeline program."""
    print("=" * 50)
    print("DATA PIPELINE WITH map/filter")
    print("=" * 50)

    raw_data = [
        RawRecord('john smith', '30', '75000', 'engineering'),
        RawRecord('jane doe', '25', '55000', 'marketing'),
        RawRecord('bob johnson', '45', '120000', 'engineering'),
        RawRecord('alice williams', '28', 'invalid', 'sales'),
        RawRecord('charlie brown', '52', '150000', 'executive'),
        RawRecord('diana prince', '35', '95000', 'engineering'),
        RawRecord('eve davis', '22', '45000', 'marketing'),
    ]

    result = DataPipeline.run_pipeline(raw_data)

    print(f"\nPipeline Results:")
    print(f"  Raw records: {result['total_raw']}")
    print(f"  Valid records: {result['total_valid']}")
    print(f"  Seniors: {result['seniors']}")
    print(f"  High earners: {result['high_earners']}")
    print(f"  Average salary: \${result['avg_salary']:,.2f}")
    print(f"  Total payroll: \${result['total_payroll']:,.2f}")

    print(f"\nBy department:")
    for dept, count in result['by_department'].items():
        print(f"  {dept}: {count}")

    print(f"\nBy seniority:")
    for level, count in result['by_seniority'].items():
        print(f"  {level}: {count}")

    print(f"\nCleaned records:")
    for r in result['records']:
        print(f"  {r.name}, {r.age}, \${r.salary:,.2f}, {r.department}, {r.seniority}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Custom Key Functions",
      "code": `"""
Program 3: Custom Key Functions
Advanced sorting with complex key functions.
Demonstrates multi-level sorting, custom comparators, and stable sort.
"""

from typing import List, Tuple, Any
from dataclasses import dataclass
from operator import itemgetter, attrgetter

@dataclass
class Student:
    name: str
    grade: str
    scores: List[int]
    attendance: float

    def average_score(self) -> float:
        return sum(self.scores) / len(self.scores) if self.scores else 0

    def __repr__(self):
        return f"{self.name}({self.grade}, avg={self.average_score():.1f})"

class StudentSorter:
    """Advanced student sorting with custom keys."""

    GRADE_ORDER = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'F': 4}

    @staticmethod
    def by_grade_then_score(students: List[Student]) -> List[Student]:
        """Sort by grade (A first), then by average score (high first)."""
        return sorted(students, key=lambda s: (
            StudentSorter.GRADE_ORDER.get(s.grade, 99),
            -s.average_score()
        ))

    @staticmethod
    def by_attendance_then_name(students: List[Student]) -> List[Student]:
        """Sort by attendance (high first), then by name."""
        return sorted(students, key=lambda s: (-s.attendance, s.name.lower()))

    @staticmethod
    def by_score_variance(students: List[Student]) -> List[Student]:
        """Sort by score consistency (low variance first)."""
        def variance(s: Student) -> float:
            if len(s.scores) < 2:
                return 0
            avg = s.average_score()
            return sum((x - avg) ** 2 for x in s.scores) / len(s.scores)
        return sorted(students, key=variance)

    @staticmethod
    def by_best_improvement(students: List[Student]) -> List[Student]:
        """Sort by score improvement (last - first)."""
        def improvement(s: Student) -> float:
            if len(s.scores) < 2:
                return 0
            return s.scores[-1] - s.scores[0]
        return sorted(students, key=improvement, reverse=True)

    @staticmethod
    def by_composite_score(students: List[Student]) -> List[Student]:
        """Sort by weighted composite: 60% avg + 30% attendance + 10% improvement."""
        def composite(s: Student) -> float:
            avg = s.average_score()
            attend = s.attendance * 100
            improve = (s.scores[-1] - s.scores[0]) if len(s.scores) >= 2 else 0
            return 0.6 * avg + 0.3 * attend + 0.1 * max(0, improve)
        return sorted(students, key=composite, reverse=True)

    @staticmethod
    def rank_students(students: List[Student]) -> List[Tuple[int, Student]]:
        """Assign ranks with tie handling."""
        sorted_students = StudentSorter.by_composite_score(students)
        ranks = []
        current_rank = 1
        for i, student in enumerate(sorted_students):
            if i > 0 and StudentSorter._composite_score(sorted_students[i-1]) != StudentSorter._composite_score(student):
                current_rank = i + 1
            ranks.append((current_rank, student))
        return ranks

    @staticmethod
    def _composite_score(s: Student) -> float:
        avg = s.average_score()
        attend = s.attendance * 100
        improve = (s.scores[-1] - s.scores[0]) if len(s.scores) >= 2 else 0
        return 0.6 * avg + 0.3 * attend + 0.1 * max(0, improve)

def main():
    """Main custom key functions program."""
    print("=" * 50)
    print("CUSTOM KEY FUNCTIONS")
    print("=" * 50)

    students = [
        Student('Alice', 'A', [85, 88, 92, 95], 0.95),
        Student('Bob', 'B', [70, 75, 80, 85], 0.90),
        Student('Charlie', 'A', [90, 85, 88, 92], 0.88),
        Student('Diana', 'B', [65, 70, 75, 80], 0.92),
        Student('Eve', 'A', [95, 92, 90, 88], 0.98),
        Student('Frank', 'C', [60, 65, 70, 75], 0.85),
    ]

    print(f"\nStudents:")
    for s in students:
        print(f"  {s}, attendance={s.attendance:.0%}, scores={s.scores}")

    print(f"\nBy grade then score:")
    for s in StudentSorter.by_grade_then_score(students):
        print(f"  {s}")

    print(f"\nBy attendance then name:")
    for s in StudentSorter.by_attendance_then_name(students):
        print(f"  {s.name}: {s.attendance:.0%}")

    print(f"\nBy score variance (consistency):")
    for s in StudentSorter.by_score_variance(students):
        avg = s.average_score()
        var = sum((x - avg) ** 2 for x in s.scores) / len(s.scores) if len(s.scores) >= 2 else 0
        print(f"  {s.name}: variance={var:.2f}")

    print(f"\nBy best improvement:")
    for s in StudentSorter.by_best_improvement(students):
        improve = s.scores[-1] - s.scores[0] if len(s.scores) >= 2 else 0
        print(f"  {s.name}: +{improve} points")

    print(f"\nBy composite score (ranking):")
    for rank, s in StudentSorter.rank_students(students):
        print(f"  #{rank}: {s}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Currying Demo",
      "code": `"""
Program 4: Currying Demo
Function currying and partial application in Python.
Demonstrates functools.partial, closures, and function composition.
"""

from functools import partial
from typing import Callable, Any

class Currying:
    """Currying and partial application utilities."""

    @staticmethod
    def curry(func: Callable, arity: int = None) -> Callable:
        """
        Convert a function to curried form.
        f(a, b, c) -> f(a)(b)(c)
        """
        if arity is None:
            arity = func.__code__.co_argcount

        def curried(*args):
            if len(args) >= arity:
                return func(*args)
            return lambda *more: curried(*(args + more))
        return curried

    @staticmethod
    def uncurry(func: Callable) -> Callable:
        """
        Convert a curried function back to normal form.
        f(a)(b)(c) -> f(a, b, c)
        """
        def uncurried(*args):
            result = func
            for arg in args:
                result = result(arg)
            return result
        return uncurried

    @staticmethod
    def compose(*functions: Callable) -> Callable:
        """Compose functions right-to-left: compose(f, g, h)(x) = f(g(h(x)))."""
        def composed(x):
            result = x
            for f in reversed(functions):
                result = f(result)
            return result
        return composed

    @staticmethod
    def pipe(*functions: Callable) -> Callable:
        """Pipe functions left-to-right: pipe(f, g, h)(x) = h(g(f(x)))."""
        def piped(x):
            result = x
            for f in functions:
                result = f(result)
            return result
        return piped

    @staticmethod
    def flip(func: Callable) -> Callable:
        """Flip the first two arguments of a function."""
        def flipped(a, b, *args, **kwargs):
            return func(b, a, *args, **kwargs)
        return flipped

    @staticmethod
    def memoize(func: Callable) -> Callable:
        """Simple memoization decorator."""
        cache = {}
        def memoized(*args):
            if args not in cache:
                cache[args] = func(*args)
            return cache[args]
        return memoized

def main():
    """Main currying program."""
    print("=" * 50)
    print("CURRYING DEMO")
    print("=" * 50)

    # Currying a 3-argument function
    def add_three(a, b, c):
        return a + b + c

    curried_add = Currying.curry(add_three)
    print(f"\nCurried add_three(1)(2)(3) = {curried_add(1)(2)(3)}")
    print(f"Partial: curried_add(1)(2) -> function: {curried_add(1)(2)(10)}")

    # Uncurrying
    def curried_mult(a):
        return lambda b: lambda c: a * b * c

    normal_mult = Currying.uncurry(curried_mult)
    print(f"\nUncurried mult(2, 3, 4) = {normal_mult(2, 3, 4)}")

    # Function composition
    add_one = lambda x: x + 1
    double = lambda x: x * 2
    square = lambda x: x ** 2

    composed = Currying.compose(square, double, add_one)
    # composed(3) = square(double(add_one(3))) = square(double(4)) = square(8) = 64
    print(f"\ncompose(square, double, add_one)(3) = {composed(3)}")

    piped = Currying.pipe(add_one, double, square)
    # piped(3) = square(double(add_one(3))) = same as composed
    print(f"pipe(add_one, double, square)(3) = {piped(3)}")

    # Flip
    def subtract(a, b):
        return a - b

    flipped_sub = Currying.flip(subtract)
    print(f"\nsubtract(10, 3) = {subtract(10, 3)}")
    print(f"flip(subtract)(10, 3) = {flipped_sub(10, 3)}")

    # Partial application with curry
    add_five = curried_add(5)
    add_five_and_three = add_five(3)
    print(f"\nadd_five(3)(10) = {add_five_and_three(10)}")

    # Memoization
    @Currying.memoize
    def fib(n):
        if n <= 1:
            return n
        return fib(n - 1) + fib(n - 2)

    print(f"\nMemoized fib(30) = {fib(30)}")

    # Practical: HTML builder with currying
    def tag(name, content, attrs=None):
        attrs = attrs or {}
        attr_str = ' '.join(f'{k}="{v}"' for k, v in attrs.items())
        if attr_str:
            attr_str = ' ' + attr_str
        return f"<{name}{attr_str}>{content}</{name}>"

    curried_tag = Currying.curry(tag, 3)
    div = curried_tag('div')
    p = curried_tag('p')
    span = curried_tag('span')

    print(f"\nHTML with currying:")
    print(f"  {div('Hello')({})}")
    print(f"  {p('World')({'class': 'text'})}")
    print(f"  {span('!')({'id': 'exclaim'})}")

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
      "text": "Answer these before moving to Part 19. 4/5 correct means you have mastered lambda and functional programming."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is a lambda expression and what are its limitations? Write a lambda that sorts a list of tuples by the second element. Then rewrite it as a named function. When should you use lambda vs def?",
        "Q2: Explain the difference between map, filter, and reduce. Write a function that uses all three to process a list of numbers: filter evens, square them, then sum the results. Compare this to a list comprehension approach.",
        "Q3: How does the key parameter in sorted work? Write a function that sorts a list of dictionaries by multiple fields (e.g., 'age' ascending, then 'name' descending). Use a lambda for the key function.",
        "Q4: What is functools.partial and how does it differ from lambda? Write a function that creates a 'multiply by N' function using both partial and lambda. Show that partial preserves function metadata (name, docstring) while lambda does not.",
        "Q5: Explain function composition. Write compose and pipe functions that take multiple functions and return a new function. Demonstrate with add_one, double, and square. What is the difference between compose and pipe?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: lambda creates anonymous functions: lambda args: expression. Limitations: single expression only (no statements, assignments, or multiple expressions), no docstrings, no type hints. Sort by second element: sorted(tuples, key=lambda x: x[1]). Named function: def by_second(x): return x[1]; sorted(tuples, key=by_second). Use lambda for simple, one-off functions. Use def for complex, reusable, documented functions. A2: map transforms every element. filter selects elements by predicate. reduce combines all elements into a single value. numbers = [1,2,3,4,5,6,7,8,9,10]; result = reduce(lambda a,b: a+b, map(lambda x: x**2, filter(lambda x: x%2==0, numbers))). List comprehension: sum(x**2 for x in numbers if x%2==0). Comprehension is more readable for simple cases; map/filter/reduce is better for existing functions or lazy pipelines. A3: key extracts a comparison value from each element. sorted is called once per element, then elements are sorted by these values. students = [{'name': 'Alice', 'age': 30}, {'name': 'Bob', 'age': 25}]; sorted(students, key=lambda s: (s['age'], -ord(s['name'][0]))). For descending on name, use negative value or reverse individual sorts. A4: partial creates a new function with pre-filled arguments, preserving the original function's metadata. lambda creates a new anonymous function. from functools import partial; mul_by_5_partial = partial(operator.mul, 5); mul_by_5_lambda = lambda x: 5 * x. partial preserves __name__ and __doc__ (from the original function); lambda has generic __name__ '<lambda>' and no __doc__. A5: Composition chains functions: compose(f,g,h)(x) = f(g(h(x))) (right-to-left). Pipe chains left-to-right: pipe(f,g,h)(x) = h(g(f(x))). Both are fundamental in functional programming. compose is mathematical tradition (f ∘ g); pipe is more intuitive for data flow (Unix pipe style)."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered lambda and functional programming. You understand lambda syntax and limitations — single expressions, no statements, no docstrings. You use map, filter, and reduce to create elegant data pipelines, knowing when they outperform comprehensions and when comprehensions win. You wield sorted with key functions to create arbitrary, powerful ordering — by length, by attribute, by multiple criteria, by custom calculations. You create specialized functions with functools.partial, preserving metadata and enabling reusable function variants. You compose functions with compose and pipe, building data transformation pipelines that read like mathematics. You have built four complete programs: a name sorter with multiple criteria, an ETL data pipeline with map and filter, a student ranking system with composite scoring, and a currying demonstration with HTML builders. Functional programming is no longer a paradigm. It is a style — elegant, composable, and powerful."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Lambda is for simple, throwaway functions. map transforms, filter selects, reduce combines. sorted with key functions creates arbitrary ordering. partial specializes functions. composition builds pipelines. Master these six truths, and you have mastered functional programming in Python. In Part 19, we will explore Closures & Lexical Scoping — the mechanism that makes factory functions, counters, and decorators possible."
    },
    {
      "type": "cta",
      "text": "Start Part 19: Closures & Lexical Scoping →",
      "href": "/tutorials/python-unlocked/part-19-closures",
      "note": "24 min read · Closure definition · Factory functions · nonlocal · Late binding trap"
    }
  ]
};

export default post;
