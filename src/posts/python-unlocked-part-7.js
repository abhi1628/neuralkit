const post = {
  "slug": "part-7-string-formatting",
  "seriesSlug": "python-unlocked",
  "partNumber": 7,
  "totalParts": 30,
  "title": "String Formatting Mastery: From % to f-strings (Part 7)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 22, 2026",
  "readTime": "24 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Formatting is communication. From legacy % formatting to modern f-string debug expressions in Python 3.12 — learn every technique and when to use each for maximum clarity.",
  "coverEmoji": "🎨",
  "tags": [
    "Python", "String Formatting", "f-strings", "str.format()",
    "Template Strings", "printf", "Python 3.12", "Debug Expressions"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1972, Dennis Ritchie created the C programming language and with it, the printf function — the ancestor of every string formatting system in existence. Fifty-four years later, in 2026, Python supports four different formatting styles: legacy % formatting (from C), str.format() (from Python 2.6), f-strings (from Python 3.6), and Template strings (from the string module). Most tutorials teach you f-strings and move on. This is a mistake. Each style exists for a reason. Each has strengths and weaknesses. Each appears in real codebases you will encounter. A senior developer knows when to use % formatting for quick scripts, when to use str.format() for dynamic templates, when to use f-strings for readable code, and when to use Template strings for user-generated content. In this part, we will master all four. We will explore format specifiers that control alignment, precision, and number bases. We will use Python 3.12's debug f-string expressions to inspect variables inline. And we will build programs that generate receipts, format reports, and construct safe SQL queries. By the end, formatting will not be an afterthought. It will be a precision instrument."
    },
    {
      "type": "h2",
      "text": "Legacy % Formatting: The C Heritage"
    },
    {
      "type": "p",
      "text": "The % operator for string formatting comes directly from C's printf. It is the oldest style in Python, deprecated in new code but unavoidable in legacy codebases. You will encounter it in older libraries, Stack Overflow answers, and maintenance tasks. Understanding it is not optional — it is a professional requirement."
    },
    {
      "type": "code-block",
      "label": "% Formatting: The Legacy Style",
      "code": `# === % FORMATTING BASICS ===
# Uses % operator with format specifiers
# Format: %[(name)][flags][width][.precision]type

name = "Alice"
age = 30
pi = 3.14159265359

# String formatting
print("Hello, %s!" % name)          # Hello, Alice!
print("Name: %s, Age: %d" % (name, age))  # Name: Alice, Age: 30

# Float formatting
print("Pi = %f" % pi)               # Pi = 3.141593
print("Pi = %.2f" % pi)               # Pi = 3.14 (2 decimal places)
print("Pi = %.10f" % pi)              # Pi = 3.1415926536 (10 decimal places)

# Integer formatting
print("Age: %d" % age)                # Age: 30 (decimal)
print("Age: %x" % age)                # Age: 1e (hexadecimal)
print("Age: %o" % age)                # Age: 36 (octal)
print("Age: %b" % age)                # Age: 11110 (binary, Python 3.12+)

# Width and alignment
print("|%10s|" % name)               # |     Alice| (right-aligned, width 10)
print("|%-10s|" % name)               # |Alice     | (left-aligned, width 10)
print("|%010d|" % age)                 # |0000000030| (zero-padded, width 10)

# Dictionary formatting (named placeholders)
data = {"name": "Bob", "score": 95.5}
print("%(name)s scored %(score).1f%%" % data)  # Bob scored 95.5%

# === WHEN TO USE % FORMATTING ===
# 1. Quick scripts and one-liners
# 2. Logging (for lazy evaluation)
# 3. Legacy code maintenance
# 4. When working with C programmers who know printf

# === WHY NOT TO USE % FORMATTING ===
# 1. Error-prone: wrong type causes TypeError at runtime
# 2. Limited: no easy way to access attributes or methods
# 3. Deprecated: Python docs say "use str.format() or f-strings"
# 4. Security: can be vulnerable to format string attacks

# === THE % FORMAT STRING ATTACK ===
# Never use user input as a format string!
# user_input = "%s%s%s%s%s%s%s%s"  # This reads memory!
# print(user_input % ())  # DON'T DO THIS

# Safe alternative: always use literal format string
user_input = "Alice"
print("Hello, %s!" % user_input)  # Safe: format string is literal"`
    },
    {
      "type": "h2",
      "text": "str.format(): The Modern Workhorse"
    },
    {
      "type": "p",
      "text": "str.format() was introduced in Python 2.6 as the replacement for % formatting. It is more powerful, more flexible, and less error-prone. It supports positional arguments, named arguments, attribute access, and element indexing. It is the go-to choice when you need dynamic formatting — templates stored in variables, configuration files, or user input."
    },
    {
      "type": "code-block",
      "label": "str.format() Mastery",
      "code": `# === POSITIONAL ARGUMENTS ===
print("Hello, {}!".format("Alice"))           # Hello, Alice!
print("{} + {} = {}".format(2, 3, 5))        # 2 + 3 = 5

# === NUMBERED POSITIONAL ===
print("{0} + {1} = {1} + {0}".format(2, 3))  # 2 + 3 = 3 + 2
print("{1} comes before {0}".format("B", "A"))  # A comes before B

# === NAMED ARGUMENTS ===
print("Name: {name}, Age: {age}".format(name="Alice", age=30))
print("Name: {name}, Age: {age}".format(**{"name": "Bob", "age": 25}))

# === ATTRIBUTE ACCESS ===
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

alice = Person("Alice", 30)
print("{0.name} is {0.age} years old".format(alice))

# === ELEMENT INDEXING ===
data = ["Alice", 30, "Engineer"]
print("Name: {0[0]}, Age: {0[1]}, Job: {0[2]}".format(data))

# === FORMAT SPECIFIERS ===
pi = 3.14159265359
print("Pi = {:.2f}".format(pi))          # 3.14
print("Pi = {:.10f}".format(pi))          # 3.1415926536
print("Pi = {:+.2f}".format(pi))          # +3.14 (always show sign)
print("Pi = {:.0f}".format(pi))           # 3 (no decimal places)

# === ALIGNMENT AND WIDTH ===
print("|{:>10}|".format("right"))       # |     right| (right-align)
print("|{:<10}|".format("left"))        # |left      | (left-align)
print("|{:^10}|".format("center"))      # |  center  | (center)
print("|{:*^10}|".format("center"))      # |**center**| (center with fill)

# === NUMBER FORMATTING ===
num = 1234567
print("{:,}".format(num))               # 1,234,567 (thousands separator)
print("{:_}".format(num))               # 1_234_567 (underscore separator)
print("{:b}".format(num))               # 100101101011010000111 (binary)
print("{:o}".format(num))               # 4553207 (octal)
print("{:x}".format(num))               # 12d687 (hex lowercase)
print("{:X}".format(num))               # 12D687 (hex uppercase)
print("{:e}".format(num))               # 1.234567e+06 (scientific)

# === PERCENTAGE ===
ratio = 0.8567
print("{:.1%}".format(ratio))           # 85.7%
print("{:.2%}".format(ratio))           # 85.67%

# === DYNAMIC WIDTH ===
width = 10
print("{:{width}}".format("hello", width=width))  # hello     (width 10)

# === WHEN TO USE str.format() ===
# 1. Dynamic format strings (stored in variables)
# 2. Internationalization (i18n) templates
# 3. Complex formatting with attribute access
# 4. When f-strings are not available (Python < 3.6)

# === WHEN NOT TO USE str.format() ===
# 1. Simple inline formatting (use f-strings instead)
# 2. Performance-critical code (f-strings are faster)
# 3. User-generated format strings (security risk)"`
    },
    {
      "type": "h2",
      "text": "f-strings: The Pythonic Revolution"
    },
    {
      "type": "p",
      "text": "f-strings (formatted string literals) were introduced in Python 3.6 and quickly became the preferred formatting style. They are readable, fast, and support arbitrary expressions inside the braces. In Python 3.8, the = specifier was added for debug output. In Python 3.12, debug expressions became even more powerful. f-strings are not just convenient — they are the most Pythonic way to format strings."
    },
    {
      "type": "code-block",
      "label": "f-strings Mastery",
      "code": `# === BASIC f-STRINGS ===
name = "Alice"
age = 30
print(f"Hello, {name}!")              # Hello, Alice!
print(f"{name} is {age} years old")    # Alice is 30 years old

# === EXPRESSIONS INSIDE BRACES ===
x = 10
y = 3
print(f"{x} + {y} = {x + y}")        # 10 + 3 = 13
print(f"{x} * {y} = {x * y}")        # 10 * 3 = 30
print(f"sqrt({x}) = {x ** 0.5:.2f}")  # sqrt(10) = 3.16

# === FORMAT SPECIFIERS ===
pi = 3.14159265359
print(f"Pi = {pi:.2f}")             # 3.14
print(f"Pi = {pi:.10f}")             # 3.1415926536
print(f"Pi = {pi:+.2f}")             # +3.14

# === ALIGNMENT AND WIDTH ===
word = "hello"
print(f"|{word:>10}|")             # |     hello|
print(f"|{word:<10}|")             # |hello     |
print(f"|{word:^10}|")             # |  hello  |
print(f"|{word:*^10}|")             # |**hello**|

# === NUMBER FORMATTING ===
num = 1234567
print(f"{num:,}")                    # 1,234,567
print(f"{num:_}")                    # 1_234_567
print(f"{num:b}")                    # 100101101011010000111
print(f"{num:o}")                    # 4553207
print(f"{num:x}")                    # 12d687
print(f"{num:X}")                    # 12D687
print(f"{num:e}")                    # 1.234567e+06

# === DATE AND TIME FORMATTING ===
from datetime import datetime
now = datetime.now()
print(f"Today: {now:%Y-%m-%d}")       # 2026-06-22
print(f"Time: {now:%H:%M:%S}")        # 14:30:00
print(f"Full: {now:%A, %B %d, %Y}")   # Monday, June 22, 2026

# === PYTHON 3.8+: DEBUG EXPRESSIONS ===
x = 42
y = 3.14
print(f"{x=}")                      # x=42
print(f"{y=}")                      # y=3.14
print(f"{x + y=}")                  # x + y=45.14

# === PYTHON 3.12: ADVANCED DEBUG ===
print(f"{x=:.2f}")                   # x=42.00
print(f"{x + y=:.4f}")               # x + y=45.1400

# === MULTILINE f-STRINGS ===
user = "Alice"
score = 95.5
report = f"""
=== Report for {user} ===
Score: {score:.1f}%
Grade: {"A" if score >= 90 else "B"}
Status: {"Pass" if score >= 60 else "Fail"}
"""
print(report)

# === WHEN TO USE f-STRINGS ===
# 1. Almost everywhere! They are the default choice.
# 2. Inline formatting with expressions
# 3. Debug output with = specifier
# 4. Complex formatting with nested expressions

# === WHEN NOT TO USE f-STRINGS ===
# 1. Dynamic format strings (use str.format() instead)
# 2. User-generated format strings (security risk)
# 3. When the expression is too complex (hurts readability)"`
    },
    {
      "type": "h2",
      "text": "Template Strings: Safe User-Generated Content"
    },
    {
      "type": "p",
      "text": "Template strings from the string module are the safest formatting option when dealing with user-generated content. Unlike % formatting, str.format(), and f-strings — all of which can execute arbitrary code if given a malicious format string — Template strings only support simple variable substitution. They are the correct choice for any situation where the format string comes from an untrusted source."
    },
    {
      "type": "code-block",
      "label": "Template Strings: The Safe Choice",
      "code": `from string import Template

# === BASIC TEMPLATE USAGE ===
t = Template("Hello, $name!")
print(t.substitute(name="Alice"))      # Hello, Alice!

# === MULTIPLE SUBSTITUTIONS ===
t = Template("Name: $name, Age: $age, City: $city")
print(t.substitute(name="Bob", age=25, city="NYC"))

# === SAFE SUBSTITUTE (won't raise on missing keys) ===
t = Template("Name: $name, Missing: $missing")
print(t.safe_substitute(name="Alice"))  # Name: Alice, Missing: $missing

# === DICTIONARY SUBSTITUTION ===
data = {"name": "Charlie", "score": 95.5}
t = Template("$name scored $score%")
print(t.substitute(data))              # Charlie scored 95.5%

# === ESCAPING $ ===
t = Template("Price: $$ $amount")
print(t.substitute(amount=100))        # Price: $ 100

# === CUSTOM DELIMITER ===
class CustomTemplate(Template):
    delimiter = "%"
    idpattern = "[a-z]+_[a-z]+"

t = CustomTemplate("%user_name has %item_count items")
print(t.substitute(user_name="Alice", item_count=5))

# === THE SECURITY ADVANTAGE ===
# Template strings do NOT evaluate arbitrary expressions!
# This is safe even with malicious user input:

user_template = "${name.upper()}"  # Even this is safe!
t = Template(user_template)
print(t.substitute(name="alice"))   # alice.upper() is NOT executed

# Compare with str.format() which IS dangerous:
# user_input = "{0.__class__}"
# "hello".format(user_input)  # This exposes internals!

# === WHEN TO USE TEMPLATE STRINGS ===
# 1. User-generated format strings (web forms, emails)
# 2. Configuration files with variable substitution
# 3. Any untrusted source of format strings
# 4. When you need simple, safe substitution only

# === WHEN NOT TO USE TEMPLATE STRINGS ===
# 1. Complex formatting (no format specifiers)
# 2. Performance-critical code (slower than f-strings)
# 3. When you need expressions or method calls"`
    },
    {
      "type": "h2",
      "text": "Programs: Formatting in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use formatting to solve real problems. Each program demonstrates a different formatting style in its ideal use case."
    },
    {
      "type": "code-block",
      "label": "Program 1: Receipt Generator",
      "code": `"""
Program 1: Receipt Generator
Generates a formatted receipt using f-strings.
Demonstrates alignment, precision, and number formatting.
"""
from datetime import datetime
from string import Template

class ReceiptItem:
    """An item on a receipt."""
    def __init__(self, name, quantity, price):
        self.name = name
        self.quantity = quantity
        self.price = price

    @property
    def total(self):
        return self.quantity * self.price

def generate_receipt(items, store_name="Python Mart", tax_rate=0.08):
    """Generate a formatted receipt.

    Args:
        items: List of ReceiptItem objects
        store_name: Name of the store
        tax_rate: Sales tax rate (default 8%)

    Returns:
        str: Formatted receipt
    """
    subtotal = sum(item.total for item in items)
    tax = subtotal * tax_rate
    total = subtotal + tax

    # Header
    receipt = f"""
{"=" * 40}
    {store_name:^36}
    {datetime.now():%Y-%m-%d %H:%M:%S}
{"=" * 40}
    ITEM                    QTY    PRICE    TOTAL
{"-" * 40}
    """

    # Items
    for item in items:
        receipt += f"{item.name:<24} {item.quantity:>3}  \${item.price:>6.2f}  \${item.total:>6.2f}\n"

    # Footer
    receipt += f"""
{"-" * 40}
    Subtotal:                          \${subtotal:>8.2f}
    Tax ({tax_rate:.0%}):                         \${tax:>8.2f}
{"=" * 40}
    TOTAL:                             \${total:>8.2f}
{"=" * 40}
    THANK YOU FOR SHOPPING!
    """

    return receipt

def main():
    """Main receipt generator program."""
    items = [
        ReceiptItem("Python Book", 2, 29.99),
        ReceiptItem("Coffee Mug", 1, 12.50),
        ReceiptItem("Sticker Pack", 5, 3.99),
        ReceiptItem("T-Shirt", 1, 24.99),
    ]

    receipt = generate_receipt(items)
    print(receipt)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Report Formatter",
      "code": `"""
Program 2: Report Formatter
Generates formatted reports using str.format() for templates.
Demonstrates dynamic formatting and template reuse.
"""
from datetime import datetime
from collections import namedtuple

Student = namedtuple("Student", ["name", "scores"])

REPORT_TEMPLATE = """
{border}
  {title:^48}
{border}
  Generated: {date:%Y-%m-%d %H:%M:%S}
  Class Average: {class_avg:.1f}%
{border}
  {header_name:<20} {header_scores}
{border}
{student_rows}
{border}
  {summary}
{border}
"""

def format_student_row(student, width=8):
    """Format a single student row."""
    scores_str = " ".join(f"{s:>{width}}" for s in student.scores)
    avg = sum(student.scores) / len(student.scores)
    grade = "A" if avg >= 90 else "B" if avg >= 80 else "C" if avg >= 70 else "D" if avg >= 60 else "F"
    return f"  {student.name:<20} {scores_str}  {avg:>6.1f}%  {grade}"

def generate_report(students, title="Student Report"):
    """Generate a formatted class report."""
    all_scores = [s for student in students for s in student.scores]
    class_avg = sum(all_scores) / len(all_scores) if all_scores else 0

    student_rows = "\n".join(format_student_row(s) for s in students)

    passing = sum(1 for s in students if sum(s.scores)/len(s.scores) >= 60)
    summary = f"Passing: {passing}/{len(students)} ({passing/len(students)*100:.0f}%)"

    header_scores = " ".join(f"Q{i+1:>4}" for i in range(len(students[0].scores)))

    return REPORT_TEMPLATE.format(
        border="=" * 52,
        title=title,
        date=datetime.now(),
        class_avg=class_avg,
        header_name="Name",
        header_scores=header_scores + "   Avg    Grade",
        student_rows=student_rows,
        summary=summary
    )

def main():
    """Main report formatter program."""
    students = [
        Student("Alice", [95, 88, 92, 97]),
        Student("Bob", [78, 82, 80, 85]),
        Student("Charlie", [65, 70, 68, 72]),
        Student("Diana", [92, 95, 98, 94]),
        Student("Eve", [55, 60, 58, 62]),
    ]

    report = generate_report(students, "Q2 Exam Results")
    print(report)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Safe SQL Query Builder",
      "code": `"""
Program 3: Safe SQL Query Builder
Builds SQL queries safely using Template strings.
Demonstrates why Template strings are essential for security.
"""
from string import Template

class SafeQueryBuilder:
    """Build SQL queries safely using Template strings."""

    SELECT_TEMPLATE = Template("""
        SELECT $columns
        FROM $table
        $where_clause
        $order_clause
        $limit_clause
    """)

    INSERT_TEMPLATE = Template("""
        INSERT INTO $table ($columns)
        VALUES ($values)
    """)

    @staticmethod
    def select(table, columns="*", where=None, order_by=None, limit=None):
        """Build a safe SELECT query."""
        where_clause = f"WHERE {where}" if where else ""
        order_clause = f"ORDER BY {order_by}" if order_by else ""
        limit_clause = f"LIMIT {limit}" if limit else ""

        return SafeQueryBuilder.SELECT_TEMPLATE.substitute(
            columns=columns,
            table=table,
            where_clause=where_clause,
            order_clause=order_clause,
            limit_clause=limit_clause
        ).strip()

    @staticmethod
    def insert(table, columns, values):
        """Build a safe INSERT query."""
        return SafeQueryBuilder.INSERT_TEMPLATE.substitute(
            table=table,
            columns=", ".join(columns),
            values=", ".join(f"'{v}'" if isinstance(v, str) else str(v) for v in values)
        ).strip()

def main():
    """Main query builder program."""
    print("=" * 60)
    print("SAFE SQL QUERY BUILDER")
    print("=" * 60)

    # SELECT queries
    print("SELECT Examples:")
    print("-" * 40)

    q1 = SafeQueryBuilder.select("users", columns="id, name, email")
    print(f"Query 1:\n{q1}\n")

    q2 = SafeQueryBuilder.select(
        "orders",
        columns="order_id, total",
        where="status = 'completed'",
        order_by="created_at DESC",
        limit=10
    )
    print(f"Query 2:\n{q2}\n")

    # INSERT query
    print("INSERT Example:")
    print("-" * 40)

    q3 = SafeQueryBuilder.insert(
        "users",
        ["name", "email", "age"],
        ["Alice", "alice@example.com", 30]
    )
    print(f"Query 3:\n{q3}\n")

    # Security demonstration
    print("Security Check:")
    print("-" * 40)

    # Even malicious input is safe with Template strings!
    malicious = "users; DROP TABLE users; --"
    safe_query = SafeQueryBuilder.select(malicious)
    print(f"Malicious input: {malicious}")
    print(f"Safe output: {safe_query}\n")
    print("Template strings prevent SQL injection by design!\n")

    print("=" * 60)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "quiz",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 8. 4/5 correct means you have mastered Python string formatting."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the difference between % formatting, str.format(), f-strings, and Template strings. When would you use each? Give a specific real-world scenario for each.",
        "Q2: Write an f-string that formats a number with: (a) thousands separator, (b) 2 decimal places, (c) right-aligned in a field of width 15, (d) zero-padded. Test it with the number 1234567.89.",
        "Q3: What is the security risk of using str.format() with user-generated format strings? Demonstrate with a malicious input that could expose internal object attributes. How do Template strings prevent this?",
        "Q4: Python 3.12 introduced f-string debug expressions. Write code that uses {x=}, {y=:.2f}, and {x+y=:.4f} to inspect variables during debugging. Why is this better than print(x, y, x+y)?",
        "Q5: Write a function that takes a list of dictionaries (each with name, price, quantity) and returns a formatted table using str.format() with dynamic column widths. The table should have headers, separators, and right-aligned numbers."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: % formatting is the legacy C-style format, good for quick scripts and logging but deprecated for new code. str.format() is the modern dynamic formatting, ideal for templates stored in variables, internationalization, and complex attribute access. f-strings are the most readable and fastest, perfect for inline formatting with expressions — they are the default choice for Python 3.6+. Template strings are the safest, designed for user-generated content where security is paramount. A2: f\"{1234567.89:>015,.2f}\" produces 00001,234,567.89. Breakdown: > (right-align), 0 (zero-pad), 15 (width), , (thousands separator), .2f (2 decimal places). A3: str.format() with user input like {0.__class__} can expose internal attributes through introspection. Template strings only support simple $variable substitution and do not evaluate expressions or access attributes, making them safe by design. A4: f-string debug expressions like {x=} automatically show both the variable name and value, reducing boilerplate. print(x, y, x+y) requires manual labeling and is harder to read. Debug f-strings are self-documenting and can include format specifiers like {x=:.2f}. A5: Use str.format() with calculated column widths based on the maximum content length. Format each row with {name:<{name_width}} {price:>{price_width}.2f} {quantity:>{qty_width}}. Add separators between header and data, and after each row if desired."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered all four Python formatting styles. You know when to use % formatting for legacy maintenance, str.format() for dynamic templates, f-strings for readable inline code, and Template strings for secure user-generated content. You understand format specifiers for alignment, precision, number bases, and date formatting. You have used Python 3.12 debug expressions to inspect variables inline. You have built three complete programs: a receipt generator with f-strings, a report formatter with str.format() templates, and a safe SQL query builder with Template strings. Formatting is no longer an afterthought — it is a precision instrument in your toolkit."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Formatting is communication. The way you present data determines how it is understood. A well-formatted receipt builds trust. A well-formatted report drives decisions. A safe query builder prevents disasters. Master all four styles, choose the right one for each situation, and your code will be readable, secure, and professional. In Part 8, we will explore boolean logic and operators — the decision engine that makes programs dynamic."
    },
    {
      "type": "cta",
      "text": "Start Part 8: Boolean Logic & Operators →",
      "href": "/tutorials/python-unlocked/part-8-boolean-operators",
      "note": "22 min read · Truthiness · Short-circuit · Bitwise · Operator precedence"
    }
  ]
};

export default post;
