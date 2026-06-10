const post = {
  "slug": "part-3-hello-world-anatomy",
  "seriesSlug": "python-unlocked",
  "partNumber": 3,
  "totalParts": 30,
  "title": "Hello World & The Anatomy of a Python Program (Part 3)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 14, 2026",
  "readTime": "22 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Every masterpiece starts with a single stroke. print(), input(), comments, docstrings, and the hidden machinery that makes a Python script run — from shebang to __main__. Python 3.12 features included.",
  "coverEmoji": "👋",
  "tags": [
    "Python",
    "Hello World",
    "print()",
    "input()",
    "Docstrings",
    "__main__",
    "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1978, Brian Kernighan wrote the first 'Hello, World' program in his book 'The C Programming Language.' It was two lines. Forty-eight years later, in 2026, every programmer still starts with those two words. But here is what most tutorials do not tell you: 'Hello World' is not just a ritual. It is a diagnostic tool. When you run it successfully, you have verified that your Python installation works, your file encoding is correct, your terminal can display Unicode, and your execution path is set properly. It is the canary in the coal mine of programming. In this part, we will write Hello World — and then we will dissect it like a surgeon. We will explore every parameter of print(), master input() safely, write docstrings that professional developers actually read, and finally understand if __name__ == '__main__' once and for all. By the end, you will not just write Python. You will read it with X-ray vision."
    },
    {
      "type": "h2",
      "text": "The Ritual: Hello World"
    },
    {
      "type": "code-block",
      "label": "Your First Python Program",
      "code": `# Create a file named hello.py
print('Hello, World!')

# Run it:
# python hello.py

# Output:
# Hello, World!`
    },
    {
      "type": "p",
      "text": "Two lines. One file. Infinite implications. Let us break down what just happened. When you typed 'python hello.py', the Python interpreter: (1) opened the file hello.py, (2) read the bytes and decoded them as UTF-8 text, (3) parsed the text into tokens, (4) compiled the tokens into bytecode, (5) executed the bytecode through the Python Virtual Machine, (6) the PVM called the C function that writes to stdout, (7) your terminal received the bytes and rendered them as characters. All of this happened in under 50 milliseconds. And you thought it was just two lines."
    },
    {
      "type": "h2",
      "text": "print(): The Function You Think You Know"
    },
    {
      "type": "p",
      "text": "print() is the most used function in Python. It is also the most misunderstood. Most developers use it as 'print(something)' and never explore its full power. But print() has five parameters that transform it from a simple output tool into a precise formatting instrument."
    },
    {
      "type": "code-block",
      "label": "print() Deep Dive",
      "code": "# === THE FULL SIGNATURE ===
# print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)

# 1. *objects: print multiple items
print('Hello', 'World', '!')  # Hello World !

# 2. sep: separator between items (default: space)
print('2026', '06', '14', sep='-')  # 2026-06-14
print('apple', 'banana', 'cherry', sep=' | ')  # apple | banana | cherry

# 3. end: what to print at the end (default: newline)
print('Loading', end='')
print('...', end='')
print('Done!')  # Loading...Done!

# 4. file: where to print (default: sys.stdout)
import sys
with open('output.txt', 'w') as f:
    print('This goes to a file!', file=f)

# You can also print to stderr for errors:
print('Error: something went wrong', file=sys.stderr)

# 5. flush: force output immediately (default: False)
# Normally, output is buffered. flush=True forces immediate output.
import time
for i in range(5):
    print(f'Progress: {i+1}/5', end='\r', flush=True)
    time.sleep(0.5)
print()  # Move to new line after progress

# === PYTHON 3.12: F-STRING DEBUG IN PRINT ===
name = 'Alice'
age = 30
print(f'{name=}, {age=}')  # name='Alice', age=30

# === REAL-WORLD PATTERNS ===
# Pattern 1: Print a table
headers = ['Name', 'Age', 'City']
rows = [['Alice', 30, 'NYC'], ['Bob', 25, 'LA'], ['Charlie', 35, 'Chicago']]

print(f'{'Name':<10} {'Age':<5} {'City':<10}')
print('-' * 25)
for row in rows:
    print(f'{row[0]:<10} {row[1]:<5} {row[2]:<10}')

# Pattern 2: Print JSON nicely
import json
data = {'name': 'Alice', 'skills': ['Python', 'Data Science']}
print(json.dumps(data, indent=2))

# Pattern 3: Print with colors (ANSI escape codes)
RED = '\033[91m'
GREEN = '\033[92m'
RESET = '\033[0m'
print(f'{GREEN}Success!{RESET} Operation completed.')
print(f'{RED}Error!{RESET} File not found.')"
    },
    {
      "type": "h2",
      "text": "input(): The Gateway to Interactivity"
    },
    {
      "type": "p",
      "text": "input() is how your program talks to the user. It reads a line from stdin, strips the trailing newline, and returns the result as a string. Simple, right? But there are security considerations, type conversion pitfalls, and validation patterns that separate toy programs from production code."
    },
    {
      "type": "code-block",
      "label": "input() Mastery",
      "code": "# === BASIC USAGE ===
name = input('What is your name? ')
print(f'Hello, {name}!')

# === TYPE CONVERSION (THE PITFALL) ===
# input() ALWAYS returns a string. Always.

age = input('How old are you? ')
print(type(age))  # <class 'str'>

# If you need a number, convert explicitly:
age_int = int(input('How old are you? '))
print(type(age_int))  # <class 'int'>

# But what if the user types 'abc'? int('abc') raises ValueError.
# Solution: validation with try-except (we'll cover this in detail in Part 23)

while True:
    try:
        age = int(input('How old are you? '))
        if age < 0 or age > 150:
            print('Please enter a realistic age.')
            continue
        break
    except ValueError:
        print('That is not a valid number. Try again.')

print(f'You are {age} years old.')

# === SECURITY: NEVER USE input() FOR PASSWORDS ===
# input() echoes characters to the screen. For passwords, use getpass:
import getpass
password = getpass.getpass('Enter password: ')
# Characters are hidden! Much safer.

# === VALIDATION PATTERNS ===
def get_valid_input(prompt, validator, error_msg):
    """Get input that passes a validation function."""
    while True:
        value = input(prompt).strip()
        if validator(value):
            return value
        print(error_msg)

# Usage:
email = get_valid_input(
    'Enter email: ',
    lambda x: '@' in x and '.' in x,
    'Invalid email format.'
)

# === MULTI-LINE INPUT ===
print('Enter your poem (blank line to finish):')
lines = []
while True:
    line = input()
    if line.strip() == '':
        break
    lines.append(line)
poem = '\n'.join(lines)
print(f'\nYour poem ({len(lines)} lines):')
print(poem)"
    },
    {
      "type": "h2",
      "text": "Comments: The Art of Explanation"
    },
    {
      "type": "p",
      "text": "Comments are not for the computer. They are for humans — including your future self, who will forget why you wrote that clever one-liner. Good comments explain WHY, not WHAT. The code already says WHAT. Your comment should say WHY you chose this approach over alternatives."
    },
    {
      "type": "code-block",
      "label": "Comment Craftsmanship",
      "code": "# === BAD COMMENTS: WHAT THE CODE DOES ===
# Add 1 to x
x = x + 1

# GOOD COMMENT: WHY WE DO IT
# Increment because array indices are 0-based but user input is 1-based
x = x + 1

# === COMMENT TYPES ===

# 1. Inline comments: explain a specific line
result = base * (1 + rate)  # Compound interest formula

# 2. Block comments: explain a section
# Calculate the total price including tax and discount.
# Tax is applied before discount to comply with local regulations.
subtotal = price * quantity
tax_amount = subtotal * tax_rate
 discount_amount = (subtotal + tax_amount) * discount_rate
total = subtotal + tax_amount - discount_amount

# 3. TODO comments: mark future work
# TODO: Add input validation for negative numbers (Part 23)
# FIXME: This loop is O(n²), optimize with hash map (Part 12)
# HACK: Temporary workaround until API v2 is released

# === PYTHON 3.12: IMPROVED ERROR MESSAGES ===
# Python 3.12's error messages are so good that you need fewer comments!
# Example: if you forget a colon, Python suggests where it should go.
# def greet(name)
#     return f'Hello, {name}!'
# SyntaxError: expected ':'
#   Did you mean: def greet(name): ?"
    },
    {
      "type": "h2",
      "text": "Docstrings: Documentation That Lives in Code"
    },
    {
      "type": "p",
      "text": "A docstring is a string literal that occurs as the first statement in a module, function, class, or method definition. It becomes the __doc__ attribute of that object. Unlike comments, docstrings are accessible at runtime. Tools like help(), pydoc, and Sphinx use them to generate documentation. A good docstring is the difference between code that is used and code that is abandoned."
    },
    {
      "type": "code-block",
      "label": "Docstring Mastery",
      "code": "# === THE DOCSTRING CONVENTION ===
# Use triple double-quotes. First line: one-line summary.
# Blank line. Then detailed description. Then parameters, returns, raises.

def calculate_area(length, width):
    """Calculate the area of a rectangle.

    Args:
        length (float): The length of the rectangle.
        width (float): The width of the rectangle.

    Returns:
        float: The area of the rectangle.

    Raises:
        ValueError: If length or width is negative.

    Examples:
        >>> calculate_area(5, 3)
        15.0
        >>> calculate_area(2.5, 4.0)
        10.0
    """
    if length < 0 or width < 0:
        raise ValueError('Dimensions must be non-negative')
    return length * width

# Access the docstring:
print(calculate_area.__doc__)

# Access with help():
help(calculate_area)

# === MODULE DOCSTRING ===
"""
Math Utilities Module

This module provides mathematical helper functions for geometry
and statistics calculations.

Functions:
    calculate_area: Calculate rectangle area.
    calculate_perimeter: Calculate rectangle perimeter.
    is_prime: Check if a number is prime.

Examples:
    >>> from math_utils import calculate_area
    >>> calculate_area(5, 3)
    15.0
"""

# === CLASS DOCSTRING ===
class Rectangle:
    """A geometric rectangle with length and width.

    Attributes:
        length (float): The rectangle's length.
        width (float): The rectangle's width.

    Methods:
        area(): Calculate the area.
        perimeter(): Calculate the perimeter.
        is_square(): Check if it's a square.
    """

    def __init__(self, length, width):
        """Initialize a Rectangle.

        Args:
            length (float): The length.
            width (float): The width.
        """
        self.length = length
        self.width = width

    def area(self):
        """Calculate the area.

        Returns:
            float: length * width
        """
        return self.length * self.width

# === DOCTEST: TESTS IN DOCSTRINGS ===
# Python can run the examples in your docstrings as tests!
# python -m doctest your_file.py -v

# This ensures your documentation never lies.
# If you change the code but forget to update the docstring, doctest fails."
    },
    {
      "type": "h2",
      "text": "if __name__ == '__main__': The Guard Clause Explained"
    },
    {
      "type": "p",
      "text": "This is the most confusing line for beginners. It looks like magic. It is not. It is a simple, elegant pattern that solves a real problem: 'How do I write code that runs when I execute the file directly, but does NOT run when I import the file as a module?'"
    },
    {
      "type": "code-block",
      "label": "__name__ Demystified",
      "code": "# === WHAT IS __name__? ===
# __name__ is a special variable that Python sets automatically.
# When you RUN a file directly: __name__ = '__main__'
# When you IMPORT a file as a module: __name__ = 'module_name'

# Create a file named 'greeting.py':
"""
A greeting module.
"""

def greet(name):
    """Return a greeting."""
    return f'Hello, {name}!'

print(f'greeting.py: __name__ = {__name__}')

if __name__ == '__main__':
    # This code ONLY runs when you execute 'python greeting.py'
    # It does NOT run when you 'import greeting'
    print('Running as main program!')
    print(greet('World'))

# === DEMONSTRATION ===
# Terminal 1: Run directly
# $ python greeting.py
# greeting.py: __name__ = __main__
# Running as main program!
# Hello, World!

# Terminal 2: Import as module
# $ python -c "import greeting"
# greeting.py: __name__ = greeting
# (No 'Running as main program!' message!)

# === WHY THIS MATTERS ===
# Without this guard, importing your module would execute all top-level code.
# That means: print statements would fire, files would be written, 
# databases would be queried — all just because someone imported your module!

# === REAL-WORLD PATTERN ===
def main():
    """Main entry point."""
    # Parse command-line arguments
    # Load configuration
    # Run the program logic
    pass

if __name__ == '__main__':
    main()

# This pattern is so common that it is essentially a Python convention.
# Every script that can be both imported and executed should use it."
    },
    {
      "type": "h2",
      "text": "Programs: From Hello World to Real Code"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use everything we have learned: print(), input(), comments, docstrings, and __main__. Each program escalates in complexity, teaching you new patterns while reinforcing old ones."
    },
    {
      "type": "code-block",
      "label": "Program 1: Personalized Greeting",
      "code": """"
Program 1: Personalized Greeting
A simple interactive program that greets the user.
"""

def get_user_name():
    """Get the user's name from input.

    Returns:
        str: The user's name.
    """
    return input('What is your name? ').strip()

def create_greeting(name):
    """Create a personalized greeting.

    Args:
        name (str): The person's name.

    Returns:
        str: A greeting message.
    """
    # Use title case for consistent formatting
    formatted_name = name.title()
    return f'Hello, {formatted_name}! Welcome to Python Unlocked.'

def main():
    """Main program entry point."""
    print('=' * 50)
    print('Welcome to the Personalized Greeting Program')
    print('=' * 50)

    name = get_user_name()
    greeting = create_greeting(name)

    print(f'\n{greeting}')
    print(f'Your name has {len(name)} characters.')
    print(f'Uppercase: {name.upper()}')
    print(f'Lowercase: {name.lower()}')

    print('\n' + '=' * 50)
    print('Thank you for using this program!')
    print('=' * 50)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 2: Simple Calculator",
      "code": """"
Program 2: Simple Calculator
A calculator that performs basic arithmetic operations.
"""

def add(a, b):
    """Add two numbers."""
    return a + b

def subtract(a, b):
    """Subtract b from a."""
    return a - b

def multiply(a, b):
    """Multiply two numbers."""
    return a * b

def divide(a, b):
    """Divide a by b.

    Raises:
        ZeroDivisionError: If b is zero.
    """
    if b == 0:
        raise ZeroDivisionError('Cannot divide by zero')
    return a / b

def get_number(prompt):
    """Get a valid number from user input."""
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print('Invalid input. Please enter a number.')

def main():
    """Main calculator program."""
    print('\n' + '=' * 40)
    print('Simple Calculator')
    print('=' * 40)

    num1 = get_number('Enter first number: ')
    num2 = get_number('Enter second number: ')

    print('\nOperations:')
    print(f'  {num1} + {num2} = {add(num1, num2)}')
    print(f'  {num1} - {num2} = {subtract(num1, num2)}')
    print(f'  {num1} * {num2} = {multiply(num1, num2)}')

    try:
        result = divide(num1, num2)
        print(f'  {num1} / {num2} = {result}')
    except ZeroDivisionError as e:
        print(f'  {num1} / {num2} = Error: {e}')

    print('=' * 40)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 3: ASCII Art Generator",
      "code": """"
Program 3: ASCII Art Generator
Creates simple ASCII art patterns using loops and print().
"""

def print_banner(text):
    """Print a banner with text centered."""
    width = len(text) + 10
    print('+' + '-' * width + '+')
    print('|' + ' ' * 5 + text + ' ' * 5 + '|')
    print('+' + '-' * width + '+')

def print_triangle(height):
    """Print a right triangle of stars."""
    for i in range(1, height + 1):
        print('*' * i)

def print_pyramid(height):
    """Print a centered pyramid of stars."""
    for i in range(1, height + 1):
        spaces = ' ' * (height - i)
        stars = '*' * (2 * i - 1)
        print(spaces + stars)

def print_diamond(height):
    """Print a diamond shape."""
    # Upper half
    for i in range(1, height + 1):
        spaces = ' ' * (height - i)
        stars = '*' * (2 * i - 1)
        print(spaces + stars)
    # Lower half
    for i in range(height - 1, 0, -1):
        spaces = ' ' * (height - i)
        stars = '*' * (2 * i - 1)
        print(spaces + stars)

def main():
    """Main ASCII art program."""
    print_banner('ASCII ART GENERATOR')

    print('\nRight Triangle (height 5):')
    print_triangle(5)

    print('\nPyramid (height 5):')
    print_pyramid(5)

    print('\nDiamond (height 5):')
    print_diamond(5)

    print('\n' + '=' * 30)
    print('Created with Python print() mastery!')
    print('=' * 30)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 4. 4/5 correct means you have mastered the anatomy of a Python program."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: print() has five parameters. Name them all and explain when you would use each one. Give a real-world example for 'file' and 'flush'.",
        "Q2: Why does input() always return a string? What happens if you try int('abc')? Write the validation code that handles this gracefully.",
        "Q3: What is the difference between a comment and a docstring? When would you use each? What is the __doc__ attribute and how do you access it?",
        "Q4: Explain if __name__ == '__main__' using your own words. Create a scenario where NOT using this guard would cause a bug when importing a module.",
        "Q5: Write a complete program (with docstrings, comments, and __main__ guard) that asks the user for their birth year, calculates their age, and prints a personalized message. Handle invalid input gracefully."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: *objects (items to print), sep (separator between items, default space), end (what to print at end, default newline), file (where to print, default stdout), flush (force immediate output, default False). Use 'file' when logging to files or stderr: print('Error', file=sys.stderr). Use 'flush' for progress bars: print(f'{percent}%', end='\r', flush=True). A2: input() returns strings because all user input is text. int('abc') raises ValueError. Graceful handling: while True: try: return int(input('Enter number: ')) except ValueError: print('Invalid number, try again.'). A3: Comments are for developers reading the code, ignored by Python. Docstrings are for documentation tools and accessible at runtime via __doc__. Use comments for implementation details ('why'). Use docstrings for public API documentation ('what'). Access with function.__doc__ or help(function). A4: __name__ is '__main__' when a file is run directly, but 'module_name' when imported. Without the guard, top-level code (like print statements or file writes) executes during import. Scenario: a module that writes to a log file. If imported, it writes to the log unexpectedly. A5: See the example program below."
    },
    {
      "type": "code-block",
      "label": "Answer to Q5: Age Calculator",
      "code": """"
Age Calculator Program
Calculates age from birth year with input validation.
"""
import datetime

def get_birth_year():
    """Get a valid birth year from the user.

    Returns:
        int: A birth year between 1900 and current year.
    """
    current_year = datetime.date.today().year

    while True:
        try:
            year = int(input('Enter your birth year: '))
            if year < 1900:
                print('That is too old! Please enter a year after 1900.')
            elif year > current_year:
                print(f'That is in the future! Current year is {current_year}.')
            else:
                return year
        except ValueError:
            print('Invalid input. Please enter a 4-digit year.')

def calculate_age(birth_year):
    """Calculate age from birth year.

    Args:
        birth_year (int): The year of birth.

    Returns:
        int: The current age.
    """
    current_year = datetime.date.today().year
    return current_year - birth_year

def get_generation(age):
    """Determine generation based on age.

    Args:
        age (int): The person's age.

    Returns:
        str: The generation name.
    """
    if age >= 79:
        return 'Silent Generation'
    elif age >= 60:
        return 'Baby Boomer'
    elif age >= 44:
        return 'Generation X'
    elif age >= 28:
        return 'Millennial'
    elif age >= 12:
        return 'Generation Z'
    else:
        return 'Generation Alpha'

def main():
    """Main age calculator program."""
    print('=' * 50)
    print('Age Calculator')
    print('=' * 50)

    birth_year = get_birth_year()
    age = calculate_age(birth_year)
    generation = get_generation(age)

    print(f'\nYou were born in {birth_year}.')
    print(f'You are {age} years old.')
    print(f'You belong to {generation}!')

    # Fun fact based on age
    if age < 18:
        print('You are still growing! The world is your oyster.')
    elif age < 30:
        print('Your 20s are for exploration. Keep learning!')
    elif age < 50:
        print('You are in your prime. Make it count!')
    else:
        print('With age comes wisdom. Share your knowledge!')

    print('\n' + '=' * 50)
    print('Thank you for using Age Calculator!')
    print('=' * 50)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have written your first Python programs. You understand that print() is a precision instrument, not just a debug tool. You know that input() requires validation and that getpass exists for sensitive data. You write comments that explain why, not what. You write docstrings that serve as living documentation. You use if __name__ == '__main__' to create reusable modules. You have built three complete programs: a greeting system, a calculator, and an ASCII art generator. This is not just syntax. This is the anatomy of craft."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Every program you write from now on will have docstrings, comments, and a __main__ guard. Every input will be validated. Every print will be intentional. These are not rules — they are habits of a craftsman. In Part 4, we will explore variables and memory: the invisible machinery that makes Python programs work. You will learn that variables are not boxes but labels, and that understanding this changes everything."
    },
    {
      "type": "cta",
      "text": "Start Part 4: Variables & Memory →",
      "href": "/tutorials/python-unlocked/part-4-variables-memory",
      "note": "28 min read · Memory model · Identity · Mutability"
    }
  ]
};

export default post;
