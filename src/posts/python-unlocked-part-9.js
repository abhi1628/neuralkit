const post = {
  "slug": "part-9-conditionals-pattern-matching",
  "seriesSlug": "python-unlocked",
  "partNumber": 9,
  "totalParts": 30,
  "title": "Conditional Statements & Pattern Matching: Control Flow Mastery (Part 9)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "26 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Master Python's control flow: if-elif-else chains, ternary expressions, the match-case statement for structural pattern matching, guard clauses, and early returns. Build real programs with Python 3.12 features.",
  "coverEmoji": "🎮",
  "tags": [
    "Python", "Conditionals", "Pattern Matching", "match-case",
    "if-elif-else", "Ternary Operator", "Guard Clauses",
    "Control Flow", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Every program makes decisions. A web app decides whether to show a login page or a dashboard. A game decides whether the player won or lost. A payment system decides whether to approve or decline a transaction. These decisions are made by conditional statements — the control structures that turn boolean logic into program flow. Python offers a rich toolkit for control flow: the classic if-elif-else chain, the concise ternary operator, the powerful match-case statement for structural pattern matching (introduced in Python 3.10), and the elegant guard clauses that keep your code flat and readable. In this part, we will explore every facet of Python's decision-making machinery. You will learn why elif exists (and why else if is a trap), how match-case replaces complex if chains, why guard clauses eliminate nested hell, and how to write conditionals that are both correct and beautiful. By the end, control flow will not be a maze of nested blocks. It will be a straight path."
    },
    {
      "type": "h2",
      "text": "The if Statement: The Foundation of Decision-Making"
    },
    {
      "type": "p",
      "text": "The if statement is the simplest and most common conditional. It evaluates a condition and executes a block of code only if that condition is truthy. But even this simple construct has depth: truthiness (which we mastered in Part 8), indentation rules, and the subtle difference between assignment and comparison."
    },
    {
      "type": "code-block",
      "label": "if Statement Fundamentals",
      "code": `# === BASIC if STATEMENT ===
# Executes block only if condition is truthy

age = 20
if age >= 18:
    print("You are an adult.")

# === if-else CHAIN ===
# Two mutually exclusive paths

temperature = 15
if temperature > 25:
    print("It's hot!")
else:
    print("It's not hot.")

# === if-elif-else CHAIN ===
# Multiple mutually exclusive conditions

score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score {score} -> Grade {grade}")

# === THE elif IS NOT else if ===
# Python uses 'elif' (not 'else if') — one word, one keyword
# This is deliberate: it prevents dangling else problems

# WRONG in Python (syntax error):
# if condition1:
#     pass
# else if condition2:   # SyntaxError!
#     pass

# CORRECT in Python:
# if condition1:
#     pass
# elif condition2:
#     pass

# === NESTED if STATEMENTS ===
# Use sparingly — they create "arrow code"

user = {"name": "Alice", "age": 25, "verified": True}

if user:
    if user["age"] >= 18:
        if user["verified"]:
            print("Access granted.")
        else:
            print("Please verify your account.")
    else:
        print("You must be 18 or older.")
else:
    print("User not found.")

# === THE ASSIGNMENT vs COMPARISON TRAP ===
# The classic bug: using = instead of ==

x = 5
# if x = 10:   # SyntaxError in Python! (Python prevents this bug)
#     pass

# In Python, assignment in conditions requires the walrus operator (:=)
if (y := 10) > 5:
    print(f"y is {y}, and it's greater than 5")

# === TRUTHINESS IN CONDITIONS ===
# Remember from Part 8: use truthiness for cleaner code

name = "Alice"
items = [1, 2, 3]

# GOOD: Pythonic
if name:
    print(f"Hello, {name}!")

if items:
    print(f"You have {len(items)} items.")

# BAD: Unnecessary explicit checks
# if name != "":
#     pass
# if len(items) > 0:
#     pass

# === MULTIPLE CONDITIONS ===
# Use logical operators (and, or, not) from Part 8

is_weekend = True
is_sunny = True

if is_weekend and is_sunny:
    print("Perfect day for a picnic!")

if is_weekend or is_sunny:
    print("At least one good thing today.")

# === PASS STATEMENT ===
# Use when you need a block but have no code yet

if True:
    pass  # TODO: implement this later

print("\nif statement fundamentals complete!")`
    },
    {
      "type": "h2",
      "text": "The Ternary Operator: One-Line Decisions"
    },
    {
      "type": "p",
      "text": "Python's conditional expression — often called the ternary operator — allows you to write simple if-else logic in a single line. It is not just concise; it is expressive when used correctly. The syntax is: value_if_true if condition else value_if_false. Read it aloud: 'Give me X if condition, otherwise give me Y.'"
    },
    {
      "type": "code-block",
      "label": "Ternary Operator Mastery",
      "code": `# === BASIC TERNARY ===
# Syntax: value_if_true if condition else value_if_false

age = 20
status = "adult" if age >= 18 else "minor"
print(f"Age {age} -> {status}")

# === TERNARY WITH EXPRESSIONS ===
# Both branches can be any expression, not just literals

a, b = 10, 20
max_value = a if a > b else b
min_value = a if a < b else b
print(f"max = {max_value}, min = {min_value}")

# === TERNARY WITH FUNCTION CALLS ===
def get_discount(is_member):
    return 0.20 if is_member else 0.05

print(f"Member discount: {get_discount(True)}")
print(f"Non-member discount: {get_discount(False)}")

# === NESTED TERNARY ===
# Possible but often less readable than if-elif-else
# Use only for simple, related conditions

score = 85
grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D" if score >= 60 else "F"
print(f"Score {score} -> Grade {grade}")

# === TERNARY IN LIST COMPREHENSIONS ===
# Powerful combination

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
labels = ["even" if n % 2 == 0 else "odd" for n in numbers]
print(f"Labels: {labels}")

# === TERNARY IN FUNCTION ARGUMENTS ===
# Concise default handling

def greet(name=None):
    name = name or "Anonymous"
    return f"Hello, {name}!"

print(greet())
print(greet("Alice"))

# === TERNARY vs SHORT-CIRCUIT ===
# From Part 8: and/or can emulate ternary but is risky

# Risky (fails if value_if_true is falsy):
# result = condition and value_if_true or value_if_false

# Safe and explicit:
# result = value_if_true if condition else value_if_false

# Example of the risk:
condition = True
value_if_true = 0  # Falsy!
value_if_false = 42

risky = condition and value_if_true or value_if_false
safe = value_if_true if condition else value_if_false

print(f"\nRisky: {risky} (wrong!)")
print(f"Safe: {safe} (correct!)")

# === TERNARY WITH TUPLE INDEXING ===
# A clever trick (not recommended for readability):
# (value_if_false, value_if_true)[condition]

result = ("minor", "adult")[age >= 18]
print(f"\nTuple trick: {result}")
# Warning: This evaluates both branches! Not lazy.

print("\nTernary operator mastery complete!")`
    },
    {
      "type": "h2",
      "text": "match-case: Structural Pattern Matching (Python 3.10+)"
    },
    {
      "type": "p",
      "text": "Introduced in Python 3.10, the match-case statement brings structural pattern matching to Python. It is not just a switch statement — it is a powerful tool for deconstructing data structures, matching values, and binding variables. If you have used pattern matching in Rust, Haskell, or Scala, you will feel at home. If not, prepare to be amazed."
    },
    {
      "type": "code-block",
      "label": "match-case Fundamentals",
      "code": `# === BASIC match-case ===
# Like a switch statement, but more powerful

def http_status_message(status):
    match status:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown Status"

print(f"200 -> {http_status_message(200)}")
print(f"404 -> {http_status_message(404)}")
print(f"999 -> {http_status_message(999)}")

# === OR PATTERNS ===
# Match multiple values in one case

def day_type(day):
    match day:
        case "Saturday" | "Sunday":
            return "Weekend"
        case "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday":
            return "Weekday"
        case _:
            return "Invalid day"

print(f"\nSaturday -> {day_type('Saturday')}")
print(f"Monday -> {day_type('Monday')}")

# === CAPTURE PATTERNS ===
# Bind the matched value to a variable

def describe_point(point):
    match point:
        case (0, 0):
            return "Origin"
        case (x, 0):
            return f"On x-axis at x={x}"
        case (0, y):
            return f"On y-axis at y={y}"
        case (x, y):
            return f"Point at ({x}, {y})"
        case _:
            return "Not a valid point"

print(f"\n(0, 0) -> {describe_point((0, 0))}")
print(f"(5, 0) -> {describe_point((5, 0))}")
print(f"(0, 3) -> {describe_point((0, 3))}")
print(f"(2, 4) -> {describe_point((2, 4))}")

# === SEQUENCE PATTERNS ===
# Match lists and tuples by structure

def describe_list(items):
    match items:
        case []:
            return "Empty list"
        case [single]:
            return f"Single item: {single}"
        case [first, second]:
            return f"Two items: {first} and {second}"
        case [first, *rest]:
            return f"First: {first}, Rest: {rest}"
        case _:
            return "Not a list"

print(f"\n[] -> {describe_list([])}")
print(f"[1] -> {describe_list([1])}")
print(f"[1, 2] -> {describe_list([1, 2])}")
print(f"[1, 2, 3] -> {describe_list([1, 2, 3])}")

# === DICTIONARY PATTERNS ===
# Match dictionaries by keys and values

def describe_user(user):
    match user:
        case {"name": str(name), "age": int(age)}:
            return f"User {name}, age {age}"
        case {"name": str(name)}:
            return f"User {name}, age unknown"
        case {}:
            return "Empty user dict"
        case _:
            return "Not a user dict"

print(f"\n{{'name': 'Alice', 'age': 30}} -> {describe_user({'name': 'Alice', 'age': 30})}")
print(f"{{'name': 'Bob'}} -> {describe_user({'name': 'Bob'})}")
print(f"{{}} -> {describe_user({})}")

# === CLASS PATTERNS ===
# Match objects by class and attributes

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

def describe_shape(shape):
    match shape:
        case Point(x=0, y=0):
            return "Origin point"
        case Point(x=x, y=0):
            return f"Point on x-axis at {x}"
        case Point(x=0, y=y):
            return f"Point on y-axis at {y}"
        case Point(x=x, y=y):
            return f"Point at ({x}, {y})"
        case _:
            return "Unknown shape"

p1 = Point(0, 0)
p2 = Point(5, 0)
p3 = Point(0, 3)
p4 = Point(2, 4)

print(f"\nPoint(0, 0) -> {describe_shape(p1)}")
print(f"Point(5, 0) -> {describe_shape(p2)}")
print(f"Point(0, 3) -> {describe_shape(p3)}")
print(f"Point(2, 4) -> {describe_shape(p4)}")

print("\nmatch-case fundamentals complete!")`
    },
    {
      "type": "h2",
      "text": "Guard Clauses: Eliminating Nested Hell"
    },
    {
      "type": "p",
      "text": "Guard clauses are a defensive programming technique where you handle edge cases and error conditions at the beginning of a function, returning early. This keeps the main logic flat and readable, avoiding the dreaded 'arrow code' of deeply nested if statements. The rule is simple: fail fast, fail flat."
    },
    {
      "type": "code-block",
      "label": "Guard Clauses in Action",
      "code": `# === THE PROBLEM: ARROW CODE ===
# Deeply nested conditionals are hard to read and maintain

def process_order_bad(order):
    if order:
        if order["items"]:
            if order["total"] > 0:
                if order["payment"]:
                    if order["payment"]["method"] in ["credit", "debit", "paypal"]:
                        return "Order processed"
                    else:
                        return "Invalid payment method"
                else:
                    return "Payment info missing"
            else:
                return "Total must be positive"
        else:
            return "Order is empty"
    else:
        return "No order provided"

# === THE SOLUTION: GUARD CLAUSES ===
# Check for failure conditions first and return immediately

def process_order_good(order):
    # Guard 1: Order must exist
    if not order:
        return "No order provided"

    # Guard 2: Order must have items
    if not order.get("items"):
        return "Order is empty"

    # Guard 3: Total must be positive
    if order.get("total", 0) <= 0:
        return "Total must be positive"

    # Guard 4: Payment info must exist
    payment = order.get("payment")
    if not payment:
        return "Payment info missing"

    # Guard 5: Payment method must be valid
    valid_methods = ["credit", "debit", "paypal"]
    if payment.get("method") not in valid_methods:
        return "Invalid payment method"

    # Main logic (flat, readable, confident)
    return "Order processed"

# Test both versions
test_order = {
    "items": ["book", "pen"],
    "total": 25.50,
    "payment": {"method": "credit", "details": "****1234"}
}

print("=== Arrow Code (Bad) ===")
print(process_order_bad(test_order))
print(process_order_bad(None))
print(process_order_bad({"items": []}))

print("\n=== Guard Clauses (Good) ===")
print(process_order_good(test_order))
print(process_order_good(None))
print(process_order_good({"items": []}))

# === GUARD CLAUSES WITH ASSERTIONS ===
# Use assertions for programming errors (not user input)

def calculate_discount(price, discount_percent):
    # Guard: business logic validation
    if price < 0:
        raise ValueError("Price cannot be negative")
    if not 0 <= discount_percent <= 100:
        raise ValueError("Discount must be between 0 and 100")

    # Assertion: programming invariant
    assert isinstance(price, (int, float)), "Price must be numeric"
    assert isinstance(discount_percent, (int, float)), "Discount must be numeric"

    discount_amount = price * (discount_percent / 100)
    return price - discount_amount

print(f"\nDiscount: \${calculate_discount(100, 20):.2f}")

# === GUARD CLAUSES IN LOOP PROCESSING ===
# Skip invalid items early

def process_records(records):
    results = []
    for record in records:
        # Guard: skip invalid records
        if not record:
            continue
        if not record.get("id"):
            continue
        if record.get("status") == "deleted":
            continue

        # Process valid record
        results.append({
            "id": record["id"],
            "name": record.get("name", "Unknown"),
            "active": True
        })

    return results

records = [
    None,
    {"id": 1, "name": "Alice", "status": "active"},
    {"id": None, "name": "Bob"},
    {"id": 3, "name": "Charlie", "status": "deleted"},
    {"id": 4, "name": "Diana", "status": "active"},
]

print(f"\nProcessed records: {process_records(records)}")

# === GUARD CLAUSES WITH match-case ===
# Python 3.10+: guard clauses in pattern matching

def describe_value(value):
    match value:
        case int(n) if n < 0:
            return f"Negative integer: {n}"
        case int(n) if n == 0:
            return "Zero"
        case int(n) if n > 0:
            return f"Positive integer: {n}"
        case str(s) if len(s) == 0:
            return "Empty string"
        case str(s) if len(s) > 10:
            return f"Long string ({len(s)} chars)"
        case str(s):
            return f"String: {s}"
        case _:
            return f"Other type: {type(value).__name__}"

print(f"\n-5 -> {describe_value(-5)}")
print(f"0 -> {describe_value(0)}")
print(f"42 -> {describe_value(42)}")
print(f"'' -> {describe_value('')}")
print(f"'hello' -> {describe_value('hello')}")
print(f"'a very long string' -> {describe_value('a very long string')}")
print(f"3.14 -> {describe_value(3.14)}")

print("\nGuard clauses mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use conditionals, pattern matching, and guard clauses to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Grade Calculator",
      "code": `"""
Program 1: Grade Calculator
Calculates letter grades and GPA from scores.
Demonstrates if-elif-else chains and guard clauses.
"""

class GradeCalculator:
    """Calculate grades and GPA from scores."""

    GRADE_SCALE = {
        "A": (90, 100, 4.0),
        "B": (80, 89, 3.0),
        "C": (70, 79, 2.0),
        "D": (60, 69, 1.0),
        "F": (0, 59, 0.0),
    }

    @staticmethod
    def score_to_grade(score):
        """Convert a score to a letter grade."""
        # Guard clause
        if not isinstance(score, (int, float)):
            raise TypeError("Score must be numeric")
        if not 0 <= score <= 100:
            raise ValueError("Score must be between 0 and 100")

        for grade, (min_score, max_score, _) in GradeCalculator.GRADE_SCALE.items():
            if min_score <= score <= max_score:
                return grade
        return "F"  # Fallback

    @staticmethod
    def score_to_gpa(score):
        """Convert a score to GPA points."""
        grade = GradeCalculator.score_to_grade(score)
        return GradeCalculator.GRADE_SCALE[grade][2]

    @staticmethod
    def calculate_gpa(scores):
        """Calculate average GPA from a list of scores."""
        if not scores:
            return 0.0

        total = sum(GradeCalculator.score_to_gpa(s) for s in scores)
        return round(total / len(scores), 2)

    @staticmethod
    def classify_performance(gpa):
        """Classify performance based on GPA."""
        if gpa >= 3.5:
            return "Excellent"
        elif gpa >= 3.0:
            return "Good"
        elif gpa >= 2.0:
            return "Average"
        elif gpa >= 1.0:
            return "Below Average"
        else:
            return "Failing"

def main():
    """Main grade calculator program."""
    print("=" * 50)
    print("GRADE CALCULATOR")
    print("=" * 50)

    # Test scores
    scores = [95, 87, 72, 65, 58, 91, 83, 76]

    print("\nIndividual Grades:")
    for score in scores:
        grade = GradeCalculator.score_to_grade(score)
        gpa = GradeCalculator.score_to_gpa(score)
        print(f"  Score: {score:3d} -> Grade: {grade} (GPA: {gpa})")

    overall_gpa = GradeCalculator.calculate_gpa(scores)
    performance = GradeCalculator.classify_performance(overall_gpa)

    print(f"\nOverall GPA: {overall_gpa}")
    print(f"Performance: {performance}")

    # Test with ternary
    honor_roll = "Yes" if overall_gpa >= 3.5 else "No"
    print(f"Honor Roll: {honor_roll}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Leap Year Checker",
      "code": `"""
Program 2: Leap Year Checker
Determines if a year is a leap year using conditional logic.
Demonstrates complex boolean conditions and guard clauses.
"""

class Calendar:
    """Calendar utility with leap year logic."""

    @staticmethod
    def is_leap_year(year):
        """
        Determine if a year is a leap year.

        Rules:
        1. Year must be divisible by 4
        2. If divisible by 100, must also be divisible by 400
        """
        # Guard clause
        if not isinstance(year, int):
            raise TypeError("Year must be an integer")
        if year < 1:
            raise ValueError("Year must be positive")

        # Leap year logic
        if year % 400 == 0:
            return True
        if year % 100 == 0:
            return False
        if year % 4 == 0:
            return True
        return False

    @staticmethod
    def days_in_month(year, month):
        """Return the number of days in a given month."""
        if not (1 <= month <= 12):
            raise ValueError("Month must be between 1 and 12")

        # Months with 31 days
        if month in (1, 3, 5, 7, 8, 10, 12):
            return 31
        # Months with 30 days
        if month in (4, 6, 9, 11):
            return 30
        # February
        return 29 if Calendar.is_leap_year(year) else 28

    @staticmethod
    def days_in_year(year):
        """Return the number of days in a year."""
        return 366 if Calendar.is_leap_year(year) else 365

    @staticmethod
    def century_info(year):
        """Return information about the century."""
        century = (year - 1) // 100 + 1
        leap_years = sum(1 for y in range(year - 99, year + 1) if Calendar.is_leap_year(y))

        return {
            "century": century,
            "leap_years_in_century": leap_years,
            "is_leap": Calendar.is_leap_year(year),
        }

def main():
    """Main leap year program."""
    print("=" * 50)
    print("LEAP YEAR CHECKER")
    print("=" * 50)

    test_years = [1900, 2000, 2020, 2024, 2025, 2100, 2400]

    print("\nLeap Year Results:")
    for year in test_years:
        result = "Leap Year" if Calendar.is_leap_year(year) else "Common Year"
        days = Calendar.days_in_year(year)
        print(f"  {year}: {result} ({days} days)")

    print("\nDays in Each Month (2024):")
    for month in range(1, 13):
        days = Calendar.days_in_month(2024, month)
        month_name = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]
        print(f"  {month_name}: {days} days")

    print("\nCentury Information (2000):")
    info = Calendar.century_info(2000)
    for key, value in info.items():
        print(f"  {key}: {value}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Zodiac Sign Finder",
      "code": `"""
Program 3: Zodiac Sign Finder
Determines zodiac sign from birth date.
Demonstrates match-case with guard clauses and complex conditions.
"""

from dataclasses import dataclass

@dataclass
class Date:
    """Simple date class."""
    month: int
    day: int

class Zodiac:
    """Zodiac sign determination."""

    SIGNS = [
        ("Capricorn", 12, 22, 1, 19),
        ("Aquarius", 1, 20, 2, 18),
        ("Pisces", 2, 19, 3, 20),
        ("Aries", 3, 21, 4, 19),
        ("Taurus", 4, 20, 5, 20),
        ("Gemini", 5, 21, 6, 20),
        ("Cancer", 6, 21, 7, 22),
        ("Leo", 7, 23, 8, 22),
        ("Virgo", 8, 23, 9, 22),
        ("Libra", 9, 23, 10, 22),
        ("Scorpio", 10, 23, 11, 21),
        ("Sagittarius", 11, 22, 12, 21),
    ]

    @staticmethod
    def get_sign(date):
        """Get zodiac sign from date."""
        # Guard clauses
        if not isinstance(date, Date):
            raise TypeError("Expected Date object")
        if not (1 <= date.month <= 12):
            raise ValueError("Month must be between 1 and 12")
        if not (1 <= date.day <= 31):
            raise ValueError("Day must be between 1 and 31")

        # Check each sign's date range
        for sign, start_month, start_day, end_month, end_day in Zodiac.SIGNS:
            if Zodiac._in_range(date, start_month, start_day, end_month, end_day):
                return sign

        return "Unknown"

    @staticmethod
    def _in_range(date, start_month, start_day, end_month, end_day):
        """Check if date falls within a date range (handles year wrap)."""
        month, day = date.month, date.day

        if start_month <= end_month:
            # Same year (e.g., Mar 21 to Apr 19)
            return (month == start_month and day >= start_day) or \
                   (month == end_month and day <= end_day) or \
                   (start_month < month < end_month)
        else:
            # Wraps around year (e.g., Dec 22 to Jan 19)
            return (month == start_month and day >= start_day) or \
                   (month == end_month and day <= end_day) or \
                   (month > start_month or month < end_month)

    @staticmethod
    def get_element(sign):
        """Get the element associated with a zodiac sign."""
        elements = {
            "Fire": ["Aries", "Leo", "Sagittarius"],
            "Earth": ["Taurus", "Virgo", "Capricorn"],
            "Air": ["Gemini", "Libra", "Aquarius"],
            "Water": ["Cancer", "Scorpio", "Pisces"],
        }
        for element, signs in elements.items():
            if sign in signs:
                return element
        return "Unknown"

    @staticmethod
    def get_modality(sign):
        """Get the modality (cardinal, fixed, mutable) of a sign."""
        match sign:
            case "Aries" | "Cancer" | "Libra" | "Capricorn":
                return "Cardinal"
            case "Taurus" | "Leo" | "Scorpio" | "Aquarius":
                return "Fixed"
            case "Gemini" | "Virgo" | "Sagittarius" | "Pisces":
                return "Mutable"
            case _:
                return "Unknown"

def main():
    """Main zodiac program."""
    print("=" * 50)
    print("ZODIAC SIGN FINDER")
    print("=" * 50)

    test_dates = [
        Date(1, 15),    # Capricorn (edge case: before Aquarius)
        Date(3, 21),    # Aries (first day)
        Date(7, 23),    # Leo (first day)
        Date(10, 22),   # Libra (last day)
        Date(12, 25),   # Capricorn (wrap around)
        Date(2, 29),    # Pisces (leap day edge case)
    ]

    print("\nZodiac Signs:")
    for date in test_dates:
        sign = Zodiac.get_sign(date)
        element = Zodiac.get_element(sign)
        modality = Zodiac.get_modality(sign)
        print(f"  {date.month:02d}/{date.day:02d} -> {sign:12s} ({element:5s}, {modality})")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Command Parser with match",
      "code": `"""
Program 4: Command Parser with match
Parses and executes commands using structural pattern matching.
Demonstrates match-case with dictionaries, sequences, and guards.
"""

class CommandParser:
    """Parse and execute commands using pattern matching."""

    def __init__(self):
        self.users = {}
        self.current_user = None

    def execute(self, command):
        """Execute a command using pattern matching."""
        match command:
            # Empty command
            case [] | "" | None:
                return "No command provided"

            # Help command
            case ["help"] | "help":
                return self._help()

            # Help with specific topic
            case ["help", topic] if isinstance(topic, str):
                return self._help_topic(topic)

            # Login command
            case ["login", username] if isinstance(username, str):
                return self._login(username)

            # Logout command
            case ["logout"] | "logout":
                return self._logout()

            # Create user command
            case ["create", "user", username, *details] if isinstance(username, str):
                return self._create_user(username, details)

            # Delete user command (admin only)
            case ["delete", "user", username] if isinstance(username, str):
                return self._delete_user(username)

            # Send message command
            case ["msg", recipient, *message_parts] if message_parts:
                message = " ".join(message_parts)
                return self._send_message(recipient, message)

            # Set command with key-value pairs
            case ["set", key, value] if isinstance(key, str):
                return self._set(key, value)

            # Get command
            case ["get", key] if isinstance(key, str):
                return self._get(key)

            # Dictionary-style command
            case {"action": "login", "username": str(username)}:
                return self._login(username)

            case {"action": "logout"}:
                return self._logout()

            case {"action": str(action), **params}:
                return f"Unhandled action: {action} with params {params}"

            # Catch-all
            case _:
                return f"Unknown command: {command}"

    def _help(self):
        return "\n".join([
            "Available commands:",
            "  help [topic]          - Show help",
            "  login <username>      - Log in as user",
            "  logout                - Log out",
            "  create user <name>    - Create a new user",
            "  delete user <name>    - Delete a user (admin)",
            "  msg <user> <message>  - Send a message",
            "  set <key> <value>     - Set a configuration",
            "  get <key>             - Get a configuration",
        ])

    def _help_topic(self, topic):
        topics = {
            "login": "Usage: login <username>\nLogs in as the specified user.",
            "msg": "Usage: msg <recipient> <message>\nSends a message to the recipient.",
        }
        return topics.get(topic, f"No help available for '{topic}'")

    def _login(self, username):
        self.current_user = username
        if username not in self.users:
            self.users[username] = {"messages": [], "settings": {}}
        return f"Logged in as {username}"

    def _logout(self):
        if self.current_user:
            user = self.current_user
            self.current_user = None
            return f"Logged out from {user}"
        return "No user is logged in"

    def _create_user(self, username, details):
        if username in self.users:
            return f"User '{username}' already exists"
        self.users[username] = {
            "messages": [],
            "settings": {},
            "details": details
        }
        return f"Created user '{username}'"

    def _delete_user(self, username):
        if not self.current_user:
            return "Must be logged in to delete users"
        if username not in self.users:
            return f"User '{username}' not found"
        del self.users[username]
        return f"Deleted user '{username}'"

    def _send_message(self, recipient, message):
        if not self.current_user:
            return "Must be logged in to send messages"
        if recipient not in self.users:
            return f"User '{recipient}' not found"
        self.users[recipient]["messages"].append(
            {"from": self.current_user, "text": message}
        )
        return f"Message sent to {recipient}"

    def _set(self, key, value):
        if not self.current_user:
            return "Must be logged in to set values"
        self.users[self.current_user]["settings"][key] = value
        return f"Set {key} = {value}"

    def _get(self, key):
        if not self.current_user:
            return "Must be logged in to get values"
        value = self.users[self.current_user]["settings"].get(key, "Not set")
        return f"{key} = {value}"

def main():
    """Main command parser program."""
    print("=" * 50)
    print("COMMAND PARSER WITH match-case")
    print("=" * 50)

    parser = CommandParser()

    commands = [
        "help",
        ["help", "login"],
        ["login", "Alice"],
        ["set", "theme", "dark"],
        ["get", "theme"],
        ["msg", "Bob", "Hello, Bob!"],
        ["create", "user", "Bob"],
        ["login", "Bob"],
        ["msg", "Alice", "Hi, Alice!"],
        {"action": "login", "username": "Charlie"},
        ["logout"],
        ["unknown", "command"],
        [],
    ]

    for cmd in commands:
        result = parser.execute(cmd)
        print(f"\nCommand: {cmd}")
        print(f"Result:  {result}")

    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 10. 4/5 correct means you have mastered Python conditionals and pattern matching."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the difference between if-elif-else and multiple independent if statements. When should you use each? Write a code example where using multiple if statements instead of elif produces a different (and wrong) result.",
        "Q2: What is the ternary operator in Python? Write a function that uses a ternary operator to return 'positive', 'negative', or 'zero' based on a number's value. Then rewrite it using if-elif-else. Which is more readable and why?",
        "Q3: Explain match-case with a practical example. Write a function that takes a dictionary representing a geometric shape (circle, rectangle, or triangle) and uses match-case to calculate the area. Use dictionary patterns and guard clauses.",
        "Q4: What are guard clauses and why are they better than nested if statements? Refactor a deeply nested function into one that uses guard clauses. Explain the psychological principle behind why flat code is easier to read.",
        "Q5: Explain the leap year rules. Write a function is_leap_year(year) that correctly implements all rules. Then write a function days_in_month(year, month) that returns the correct number of days for any month, including February in leap years."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: if-elif-else is mutually exclusive — only one block executes. Multiple if statements are independent — all conditions are checked, and multiple blocks can execute. Use if-elif-else when choices are mutually exclusive (e.g., grade calculation). Use multiple if statements when conditions are independent (e.g., checking multiple features). Example: score = 85. if score >= 90: grade = 'A'. if score >= 80: grade = 'B'. This overwrites grade to 'B' even though it was 'A'. With elif, only 'A' is assigned. A2: The ternary operator is: value_if_true if condition else value_if_false. For three outcomes, nested ternary: 'positive' if n > 0 else 'negative' if n < 0 else 'zero'. The if-elif-else version is more readable for complex conditions because it separates each condition onto its own line. A3: match-case matches data structures and binds variables. Example: def area(shape): match shape: case {'type': 'circle', 'radius': r} if r > 0: return 3.14159 * r ** 2. case {'type': 'rectangle', 'width': w, 'height': h} if w > 0 and h > 0: return w * h. case {'type': 'triangle', 'base': b, 'height': h} if b > 0 and h > 0: return 0.5 * b * h. case _: raise ValueError('Invalid shape'). A4: Guard clauses check for error conditions at the start of a function and return immediately. They eliminate nesting by handling edge cases first, leaving the main logic flat. The psychological principle is cognitive load: nested code requires the reader to track multiple levels of context simultaneously. Flat code presents one level at a time. A5: Leap year rules: (1) divisible by 4, (2) if divisible by 100, must also be divisible by 400. def is_leap_year(year): if year % 400 == 0: return True. if year % 100 == 0: return False. return year % 4 == 0. def days_in_month(year, month): if month in (1,3,5,7,8,10,12): return 31. if month in (4,6,9,11): return 30. return 29 if is_leap_year(year) else 28."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python's control flow. You understand the if-elif-else chain — why elif exists and when to use it instead of multiple if statements. You wield the ternary operator for concise one-line decisions, knowing when it enhances readability and when it harms it. You exploit match-case for structural pattern matching, deconstructing tuples, lists, dictionaries, and objects with elegance. You use guard clauses to keep your code flat, eliminating nested hell and reducing cognitive load. You have built four complete programs: a grade calculator, a leap year checker, a zodiac sign finder, and a command parser with match-case. Conditional logic is no longer a maze of nested blocks. It is a precision tool that directs your programs with clarity and confidence."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Every program is a series of decisions. if-elif-else handles the classic choices. The ternary operator handles the simple ones. match-case handles the complex structural ones. Guard clauses keep them all readable. Master these four, and you have mastered the control layer of programming. In Part 10, we will explore Lists — the workhorse data structure that stores, organizes, and manipulates collections of data."
    },
    {
      "type": "cta",
      "text": "Start Part 10: Lists — The Workhorse →",
      "href": "/tutorials/python-unlocked/part-10-lists",
      "note": "28 min read · Dynamic arrays · List methods · List comprehensions · Slicing"
    }
  ]
};

export default post;
