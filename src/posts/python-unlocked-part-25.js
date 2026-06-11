const post = {
  "slug": "part-25-oop-foundations",
  "seriesSlug": "python-unlocked",
  "partNumber": 25,
  "totalParts": 30,
  "title": "Object-Oriented Programming — Foundations (Part 25)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "July 26, 2026",
  "readTime": "30 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Classes, objects, __init__, self. Instance, class, and static attributes. Instance, class, and static methods. Encapsulation: public, protected, private name mangling. Four complete programs: bank account, student record, shape hierarchy, temperature converter.",
  "coverEmoji": "🏗️",
  "tags": [
    "Python", "OOP", "Classes", "Objects", "Encapsulation",
    "Instance Methods", "Class Methods", "Static Methods", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1967, Ole-Johan Dahl and Kristen Nygaard created Simula — the first object-oriented language. Their insight was revolutionary: instead of writing procedures that manipulate data, write objects that combine data and behavior. Nearly sixty years later, this idea remains the dominant paradigm for organizing complex software. Python is fundamentally object-oriented — everything in Python is an object. Integers are objects. Functions are objects. Even classes are objects. But most Python tutorials teach OOP as a syntax exercise: here is how you write a class, here is __init__, here is self. This misses the point entirely. OOP is not about syntax. It is about thinking. It is the discipline of identifying the entities in your problem domain, their attributes, their behaviors, and their relationships. When you truly understand OOP, you stop writing scripts that manipulate data and start building systems where objects collaborate. In this part, we will lay the complete foundation. You will understand what a class is at the bytecode level, not just the syntax level. You will master the three kinds of attributes and the three kinds of methods — and know when to use each. You will understand Python's encapsulation model — why it is weaker than Java's but stronger than you think. And you will build four complete, real-world programs that demonstrate every concept in action. By the end, you will not just write classes. You will think in objects."
    },
    {
      "type": "h2",
      "text": "Classes and Objects: What They Really Are"
    },
    {
      "type": "p",
      "text": "A class is a blueprint. An object is a thing built from that blueprint. But in Python, the distinction is deeper: a class is itself an object — an instance of type. This means classes have attributes, support operators, and can be passed as arguments. Understanding this metaclass-level reality makes advanced Python features feel natural rather than magical."
    },
    {
      "type": "code-block",
      "label": "Classes, Objects, and the Python Object Model",
      "code": `# === CLASSES AND OBJECTS: THE DEEP VIEW ===

# A class is a callable that produces objects
class Dog:
    """A simple Dog class."""
    
    # Class attribute: shared by ALL instances
    species = "Canis lupus familiaris"
    count = 0
    
    # __init__: called after object creation, initializes instance
    # self: the instance being initialized (Python passes it automatically)
    def __init__(self, name: str, breed: str, age: int):
        # Instance attributes: unique to each instance
        self.name = name        # Public
        self.breed = breed      # Public
        self._age = age         # Protected (convention: don't access externally)
        Dog.count += 1          # Modify class attribute
    
    def bark(self) -> str:
        """Instance method: has access to self."""
        return f"{self.name} says: Woof!"
    
    def __repr__(self) -> str:
        return f"Dog(name={self.name!r}, breed={self.breed!r}, age={self._age})"

# Creating objects
rex = Dog("Rex", "German Shepherd", 3)
buddy = Dog("Buddy", "Labrador", 5)

print(f"rex: {rex}")
print(f"buddy: {buddy}")
print(f"Dogs created: {Dog.count}")
print(f"rex.bark(): {rex.bark()}")

# Objects are independent
rex.name = "Rex Jr."
print(f"After modification: {rex.name}, buddy still: {buddy.name}")

# Class attribute is shared
print(f"rex.species: {rex.species}")
print(f"buddy.species: {buddy.species}")
print(f"Dog.species: {Dog.species}")

# But instance assignment shadows class attribute
rex.species = "Overridden"   # Creates INSTANCE attribute on rex
print(f"rex.species (shadowed): {rex.species}")
print(f"buddy.species (still class): {buddy.species}")
print(f"Dog.species (unchanged): {Dog.species}")

# Everything is an object
print(f"\\ntype(rex): {type(rex)}")          # <class 'Dog'>
print(f"type(Dog): {type(Dog)}")            # <class 'type'>  <- classes are type instances!
print(f"isinstance(rex, Dog): {isinstance(rex, Dog)}")
print(f"isinstance(rex, object): {isinstance(rex, object)}")  # True! Everything inherits object

# Inspect object's __dict__
print(f"\\nrex.__dict__: {rex.__dict__}")    # Instance attributes
print(f"Dog.__dict__ keys: {list(Dog.__dict__.keys())}")  # Class attributes and methods

print("\\nClasses and objects complete!")`
    },
    {
      "type": "h2",
      "text": "The Three Kinds of Methods"
    },
    {
      "type": "p",
      "text": "Python has three method types: instance methods (bound to an instance, receive self), class methods (bound to the class, receive cls), and static methods (bound to neither, receive nothing extra). Choosing the right method type communicates intent clearly and enables patterns like alternative constructors, factory methods, and namespace organization."
    },
    {
      "type": "code-block",
      "label": "Instance, Class, and Static Methods",
      "code": `# === THREE METHOD TYPES MASTERY ===
from datetime import date, datetime
import math

class Temperature:
    """Temperature with unit conversion — demonstrates all method types."""
    
    ABSOLUTE_ZERO_C = -273.15
    
    def __init__(self, celsius: float):
        if celsius < self.ABSOLUTE_ZERO_C:
            raise ValueError(f"Temperature below absolute zero: {celsius}")
        self._celsius = celsius
    
    # --- Instance Methods: operate on a specific instance ---
    # Receive self (the instance)
    
    @property
    def celsius(self) -> float:
        return self._celsius
    
    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9/5 + 32
    
    @property
    def kelvin(self) -> float:
        return self._celsius - self.ABSOLUTE_ZERO_C
    
    def feels_like(self, humidity: float) -> str:
        """Instance method: uses self to compute result."""
        heat_index = self._celsius + (humidity / 100) * 5
        if heat_index > 35:
            return "Very hot"
        elif heat_index > 25:
            return "Warm"
        elif heat_index > 15:
            return "Comfortable"
        else:
            return "Cool"
    
    def __repr__(self) -> str:
        return f"Temperature({self._celsius:.2f}°C)"
    
    # --- Class Methods: operate on the class itself ---
    # Receive cls (the class, not an instance)
    # Primary use: ALTERNATIVE CONSTRUCTORS
    
    @classmethod
    def from_fahrenheit(cls, fahrenheit: float) -> 'Temperature':
        """Alternative constructor from Fahrenheit."""
        celsius = (fahrenheit - 32) * 5/9
        return cls(celsius)  # cls() works even in subclasses!
    
    @classmethod
    def from_kelvin(cls, kelvin: float) -> 'Temperature':
        """Alternative constructor from Kelvin."""
        celsius = kelvin + cls.ABSOLUTE_ZERO_C
        return cls(celsius)
    
    @classmethod
    def body_temperature(cls) -> 'Temperature':
        """Named constructor for a well-known temperature."""
        return cls(37.0)
    
    @classmethod
    def absolute_zero(cls) -> 'Temperature':
        """Named constructor for absolute zero."""
        return cls(cls.ABSOLUTE_ZERO_C)
    
    # --- Static Methods: utility functions in the class namespace ---
    # Receive NEITHER self NOR cls
    # Use: helper functions that logically belong to the class
    #      but don't need access to instance or class state
    
    @staticmethod
    def celsius_to_fahrenheit(c: float) -> float:
        """Pure conversion — no state needed."""
        return c * 9/5 + 32
    
    @staticmethod
    def fahrenheit_to_celsius(f: float) -> float:
        return (f - 32) * 5/9
    
    @staticmethod
    def is_valid_celsius(c: float) -> bool:
        return c >= -273.15

# Usage
boiling = Temperature(100)
body = Temperature.body_temperature()
freezing = Temperature.from_fahrenheit(32)
zero = Temperature.absolute_zero()

print(f"Boiling: {boiling.celsius}°C = {boiling.fahrenheit}°F = {boiling.kelvin}K")
print(f"Body: {body}")
print(f"Freezing: {freezing}")
print(f"Absolute zero: {zero}")

# Static method — callable on class or instance
print(f"\\n100°C in F: {Temperature.celsius_to_fahrenheit(100)}")
print(f"Valid -300°C: {Temperature.is_valid_celsius(-300)}")

# Class method called on subclass — returns subclass instance!
class PreciseTemperature(Temperature):
    def __repr__(self):
        return f"PreciseTemperature({self._celsius:.6f}°C)"

precise_body = PreciseTemperature.body_temperature()
print(f"\\nSubclass via classmethod: {precise_body}")  # Returns PreciseTemperature!
print(f"Type: {type(precise_body)}")

print("\\nThree method types mastered!")`
    },
    {
      "type": "h2",
      "text": "Encapsulation: Public, Protected, Private"
    },
    {
      "type": "p",
      "text": "Python's encapsulation is convention-based, not enforced. A single leading underscore (_x) signals 'protected' — respected by convention but accessible. A double leading underscore (__x) triggers name mangling — the attribute is renamed to _ClassName__x, preventing accidental override in subclasses. Understanding this model prevents both over-engineering (making everything private) and under-engineering (making everything public)."
    },
    {
      "type": "code-block",
      "label": "Encapsulation — Public, Protected, Private, Properties",
      "code": `# === ENCAPSULATION MASTERY ===

class BankAccount:
    """Bank account demonstrating all encapsulation levels."""
    
    # Class attribute (public)
    interest_rate = 0.035
    
    def __init__(self, owner: str, initial_balance: float = 0):
        # Public: freely accessible, part of the public API
        self.owner = owner
        
        # Protected: _single_underscore convention
        # Signals "internal use" but NOT enforced
        # Use when subclasses need access
        self._transaction_history: list[dict] = []
        
        # Private: __double_underscore triggers NAME MANGLING
        # _BankAccount__balance in Python's internals
        # Prevents accidental override in subclasses
        self.__balance = 0.0
        self.__account_number = self._generate_account_number()
        
        if initial_balance > 0:
            self.deposit(initial_balance)
    
    # @property: controlled access to private attributes
    @property
    def balance(self) -> float:
        """Read-only balance (no setter = immutable from outside)."""
        return self.__balance
    
    @property
    def account_number(self) -> str:
        """Masked account number."""
        return f"****{self.__account_number[-4:]}"
    
    # Property with setter: validation on assignment
    @property
    def owner(self) -> str:
        return self._owner
    
    @owner.setter
    def owner(self, value: str):
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Owner must be a non-empty string")
        self._owner = value.strip().title()
    
    def deposit(self, amount: float) -> None:
        """Public method: part of the API."""
        if amount <= 0:
            raise ValueError(f"Deposit amount must be positive, got {amount}")
        self.__balance += amount
        self._record_transaction('deposit', amount)
    
    def withdraw(self, amount: float) -> None:
        """Public method with business logic."""
        if amount <= 0:
            raise ValueError(f"Withdrawal amount must be positive")
        if amount > self.__balance:
            raise ValueError(f"Insufficient funds: balance={self.__balance:.2f}, requested={amount:.2f}")
        self.__balance -= amount
        self._record_transaction('withdrawal', amount)
    
    def get_statement(self) -> str:
        """Public method returning formatted history."""
        lines = [
            f"Account: {self.account_number}",
            f"Owner:   {self.owner}",
            f"Balance: \\u0024{self.__balance:.2f}",
            f"{'Date':<12} {'Type':<12} {'Amount':>10} {'Balance':>10}",
            "-" * 46,
        ]
        running = 0.0
        for t in self._transaction_history:
            if t['type'] == 'deposit':
                running += t['amount']
            else:
                running -= t['amount']
            lines.append(
                f"{t['date']:<12} {t['type']:<12} "
                f"\\u0024{t['amount']:>8.2f} \\u0024{running:>8.2f}"
            )
        return "\\n".join(lines)
    
    # Protected method: for use by this class and subclasses
    def _record_transaction(self, type_: str, amount: float) -> None:
        from datetime import date
        self._transaction_history.append({
            'date': str(date.today()),
            'type': type_,
            'amount': amount,
        })
    
    # Private method: implementation detail, not for subclasses
    def __generate_account_number(self) -> str:
        import random
        return ''.join([str(random.randint(0, 9)) for _ in range(10)])
    
    # Fix: use the correct name for the generate method
    def _generate_account_number(self) -> str:
        import random
        return ''.join([str(random.randint(0, 9)) for _ in range(10)])
    
    def __repr__(self) -> str:
        return f"BankAccount(owner={self.owner!r}, balance={self.__balance:.2f})"

# Usage
account = BankAccount("alice smith", 1000)
print(account)
account.deposit(500)
account.withdraw(200)
print(account.get_statement())

# Name mangling demonstration
print(f"\\nPublic access via property: {account.balance}")
print(f"Account number (masked): {account.account_number}")

# This works (convention, not enforced):
print(f"Protected history: {len(account._transaction_history)} transactions")

# This reveals name mangling:
print(f"\\nMangled private: {account._BankAccount__balance}")  # Works but wrong

# This fails naturally (correct behavior):
try:
    print(account.__balance)  # AttributeError
except AttributeError as e:
    print(f"Expected error: {e}")

print("\\nEncapsulation mastered!")`
    },
    {
      "type": "h2",
      "text": "Four Complete Programs"
    },
    {
      "type": "code-block",
      "label": "Program 1: Full Bank Account System",
      "code": `# === PROGRAM 1: BANK ACCOUNT SYSTEM ===
from datetime import date, datetime
from typing import Optional
import random

class Transaction:
    """Represents a single transaction."""
    def __init__(self, type_: str, amount: float, balance_after: float, note: str = ""):
        self.type = type_
        self.amount = amount
        self.balance_after = balance_after
        self.note = note
        self.timestamp = datetime.now()
    
    def __repr__(self):
        return (f"Transaction({self.type}, \\u0024{self.amount:.2f}, "
                f"balance=\\u0024{self.balance_after:.2f})")

class SavingsAccount:
    """Savings account with interest calculation."""
    base_interest_rate = 0.04
    
    def __init__(self, owner: str, initial_deposit: float = 0):
        self.owner = owner
        self.__balance = 0.0
        self.__account_id = f"SAV-{random.randint(10000, 99999)}"
        self._transactions: list[Transaction] = []
        if initial_deposit > 0:
            self._apply_deposit(initial_deposit, "Initial deposit")
    
    @property
    def balance(self) -> float:
        return self.__balance
    
    @property
    def account_id(self) -> str:
        return self.__account_id
    
    def deposit(self, amount: float, note: str = "") -> 'SavingsAccount':
        if amount <= 0:
            raise ValueError(f"Deposit must be positive: {amount}")
        self._apply_deposit(amount, note or "Deposit")
        return self
    
    def withdraw(self, amount: float, note: str = "") -> 'SavingsAccount':
        if amount <= 0:
            raise ValueError(f"Withdrawal must be positive: {amount}")
        if amount > self.__balance:
            raise ValueError(f"Insufficient funds: have \\u0024{self.__balance:.2f}, need \\u0024{amount:.2f}")
        self.__balance -= amount
        self._transactions.append(Transaction('withdrawal', amount, self.__balance, note))
        return self
    
    def apply_interest(self) -> float:
        """Apply monthly interest. Returns interest amount."""
        interest = self.__balance * (self.base_interest_rate / 12)
        self.__balance += interest
        self._transactions.append(Transaction('interest', interest, self.__balance, "Monthly interest"))
        return interest
    
    def _apply_deposit(self, amount: float, note: str) -> None:
        self.__balance += amount
        self._transactions.append(Transaction('deposit', amount, self.__balance, note))
    
    @classmethod
    def open_with_bonus(cls, owner: str, deposit: float, bonus: float) -> 'SavingsAccount':
        """Alternative constructor: open account with bonus."""
        account = cls(owner, deposit)
        account._apply_deposit(bonus, "Welcome bonus")
        return account
    
    @staticmethod
    def calculate_future_value(principal: float, rate: float, years: int) -> float:
        """Compound interest formula."""
        return principal * (1 + rate) ** years
    
    def statement(self) -> str:
        lines = [
            f"\\n{'=' * 50}",
            f"  SAVINGS ACCOUNT STATEMENT",
            f"  Account: {self.__account_id}",
            f"  Owner:   {self.owner}",
            f"  Balance: \\u0024{self.__balance:.2f}",
            f"  Transactions: {len(self._transactions)}",
            f"{'=' * 50}",
        ]
        for t in self._transactions[-10:]:
            sign = '+' if t.type in ('deposit', 'interest') else '-'
            lines.append(
                f"  {t.timestamp.strftime('%m/%d %H:%M')} "
                f"  {sign}\\u0024{t.amount:>8.2f}  "
                f"  Balance: \\u0024{t.balance_after:.2f}"
                f"  ({t.note})"
            )
        future = self.calculate_future_value(self.__balance, self.base_interest_rate, 10)
        lines.append(f"\\n  Projected value in 10 years: \\u0024{future:.2f}")
        lines.append(f"{'=' * 50}")
        return "\\n".join(lines)

def demo_bank():
    print("BANK ACCOUNT SYSTEM DEMO")
    
    # Regular account
    acc = SavingsAccount("Alice Johnson", 5000)
    acc.deposit(2000, "Paycheck").deposit(500, "Freelance work")
    acc.withdraw(1000, "Rent").withdraw(200, "Groceries")
    acc.apply_interest()
    print(acc.statement())
    
    # Bonus account
    vip = SavingsAccount.open_with_bonus("Bob Smith", 10000, 500)
    for _ in range(3):
        vip.apply_interest()
    print(vip.statement())

demo_bank()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Student Record System",
      "code": `# === PROGRAM 2: STUDENT RECORD SYSTEM ===
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class Grade:
    subject: str
    score: float
    max_score: float = 100.0
    
    @property
    def percentage(self) -> float:
        return (self.score / self.max_score) * 100
    
    @property
    def letter_grade(self) -> str:
        p = self.percentage
        if p >= 90: return 'A'
        if p >= 80: return 'B'
        if p >= 70: return 'C'
        if p >= 60: return 'D'
        return 'F'

class Student:
    _next_id = 1000
    
    def __init__(self, first_name: str, last_name: str, year: int):
        self.first_name = first_name.title()
        self.last_name = last_name.title()
        self._year = year
        self.__student_id = f"STU{Student._next_id:04d}"
        Student._next_id += 1
        self._grades: list[Grade] = []
        self.__gpa: Optional[float] = None
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def student_id(self) -> str:
        return self.__student_id
    
    @property
    def year(self) -> int:
        return self._year
    
    @year.setter
    def year(self, value: int):
        if not 1 <= value <= 4:
            raise ValueError(f"Year must be 1-4, got {value}")
        self._year = value
        self.__gpa = None  # Invalidate cache
    
    @property
    def gpa(self) -> float:
        if self.__gpa is None:
            if not self._grades:
                return 0.0
            self.__gpa = sum(g.percentage for g in self._grades) / len(self._grades) / 25
        return self.__gpa
    
    def add_grade(self, subject: str, score: float, max_score: float = 100) -> None:
        self._grades.append(Grade(subject, score, max_score))
        self.__gpa = None  # Invalidate cached GPA
    
    @classmethod
    def from_full_name(cls, full_name: str, year: int) -> 'Student':
        parts = full_name.strip().split()
        return cls(parts[0], parts[-1], year)
    
    def transcript(self) -> str:
        lines = [
            f"\\nSTUDENT TRANSCRIPT",
            f"{'=' * 40}",
            f"Name:       {self.full_name}",
            f"ID:         {self.student_id}",
            f"Year:       {self._year}",
            f"GPA:        {self.gpa:.2f} / 4.00",
            f"{'=' * 40}",
            f"{'Subject':<20} {'Score':>6} {'Grade':>6}",
            f"{'-' * 40}",
        ]
        for g in self._grades:
            lines.append(f"  {g.subject:<18} {g.percentage:>5.1f}%  {g.letter_grade:>4}")
        lines.append(f"{'=' * 40}")
        return "\\n".join(lines)
    
    def __repr__(self):
        return f"Student({self.full_name!r}, year={self._year}, gpa={self.gpa:.2f})"

def demo_students():
    print("STUDENT RECORD SYSTEM DEMO")
    
    alice = Student("alice", "johnson", 2)
    alice.add_grade("Mathematics", 92)
    alice.add_grade("Physics", 88)
    alice.add_grade("Computer Science", 96)
    alice.add_grade("English Literature", 78)
    print(alice.transcript())
    
    bob = Student.from_full_name("Robert Smith", 3)
    bob.add_grade("Data Structures", 85)
    bob.add_grade("Algorithms", 79)
    bob.add_grade("Databases", 91)
    print(bob.transcript())
    
    print(f"\\nComparison: {alice.full_name} GPA={alice.gpa:.2f}, {bob.full_name} GPA={bob.gpa:.2f}")

demo_students()`
    },
    {
      "type": "code-block",
      "label": "Programs 3 & 4: Shape Hierarchy and Temperature Converter",
      "code": `# === PROGRAM 3: SHAPE HIERARCHY ===
import math
from abc import ABC, abstractmethod

class Shape:
    """Base shape class with common functionality."""
    _total_shapes = 0
    
    def __init__(self, color: str = "white"):
        self.color = color
        Shape._total_shapes += 1
        self._id = Shape._total_shapes
    
    @property
    def area(self) -> float:
        raise NotImplementedError
    
    @property
    def perimeter(self) -> float:
        raise NotImplementedError
    
    @classmethod
    def total_created(cls) -> int:
        return cls._total_shapes
    
    @staticmethod
    def compare_areas(s1: 'Shape', s2: 'Shape') -> str:
        if s1.area > s2.area:
            return f"{s1} is larger"
        elif s2.area > s1.area:
            return f"{s2} is larger"
        return "Equal areas"
    
    def describe(self) -> str:
        return (f"{type(self).__name__}(color={self.color}, "
                f"area={self.area:.2f}, perimeter={self.perimeter:.2f})")
    
    def __repr__(self):
        return self.describe()

class Circle(Shape):
    def __init__(self, radius: float, color: str = "white"):
        super().__init__(color)
        if radius <= 0:
            raise ValueError(f"Radius must be positive: {radius}")
        self.__radius = radius
    
    @property
    def radius(self) -> float:
        return self.__radius
    
    @property
    def area(self) -> float:
        return math.pi * self.__radius ** 2
    
    @property
    def perimeter(self) -> float:
        return 2 * math.pi * self.__radius

class Rectangle(Shape):
    def __init__(self, width: float, height: float, color: str = "white"):
        super().__init__(color)
        self.__width = width
        self.__height = height
    
    @property
    def area(self) -> float:
        return self.__width * self.__height
    
    @property
    def perimeter(self) -> float:
        return 2 * (self.__width + self.__height)
    
    @classmethod
    def square(cls, side: float, color: str = "white") -> 'Rectangle':
        return cls(side, side, color)

class Triangle(Shape):
    def __init__(self, a: float, b: float, c: float, color: str = "white"):
        super().__init__(color)
        if a + b <= c or b + c <= a or a + c <= b:
            raise ValueError("Invalid triangle sides")
        self.__sides = (a, b, c)
    
    @property
    def area(self) -> float:
        a, b, c = self.__sides
        s = (a + b + c) / 2
        return math.sqrt(s * (s-a) * (s-b) * (s-c))
    
    @property
    def perimeter(self) -> float:
        return sum(self.__sides)

def demo_shapes():
    print("SHAPE HIERARCHY DEMO")
    shapes = [
        Circle(5, "red"),
        Rectangle(4, 6, "blue"),
        Rectangle.square(5, "green"),
        Triangle(3, 4, 5, "yellow"),
    ]
    for s in shapes:
        print(f"  {s.describe()}")
    
    biggest = max(shapes, key=lambda s: s.area)
    print(f"\\nLargest: {biggest}")
    print(f"Total shapes created: {Shape.total_created()}")

demo_shapes()

# === PROGRAM 4: TEMPERATURE CONVERTER CLASS ===
class TemperatureConverter:
    """Comprehensive temperature conversion and analysis."""
    
    SCALES = {'celsius': 'C', 'fahrenheit': 'F', 'kelvin': 'K', 'rankine': 'R'}
    
    def __init__(self, value: float, scale: str = 'celsius'):
        scale = scale.lower()
        if scale not in self.SCALES:
            raise ValueError(f"Unknown scale: {scale}. Choose from {list(self.SCALES)}")
        self.__celsius = self._to_celsius(value, scale)
        self._scale = scale
        self._value = value
    
    def _to_celsius(self, value: float, scale: str) -> float:
        conversions = {
            'celsius': value,
            'fahrenheit': (value - 32) * 5/9,
            'kelvin': value - 273.15,
            'rankine': (value - 491.67) * 5/9,
        }
        result = conversions[scale]
        if result < -273.15:
            raise ValueError(f"Temperature {value}{scale[0].upper()} is below absolute zero")
        return result
    
    @property
    def celsius(self) -> float:
        return self.__celsius
    
    @property
    def fahrenheit(self) -> float:
        return self.__celsius * 9/5 + 32
    
    @property
    def kelvin(self) -> float:
        return self.__celsius + 273.15
    
    @property
    def rankine(self) -> float:
        return (self.__celsius + 273.15) * 9/5
    
    def describe(self) -> str:
        c = self.__celsius
        if c <= -273.15: state = "absolute zero"
        elif c < -89: state = "coldest recorded on Earth"
        elif c < 0: state = "below freezing"
        elif c == 0: state = "water freezing point"
        elif c < 20: state = "cold"
        elif c < 25: state = "room temperature"
        elif c < 37: state = "warm"
        elif c == 100: state = "water boiling point"
        elif c > 100: state = "above boiling"
        else: state = "body temperature range"
        return state
    
    def all_scales(self) -> str:
        return (f"{self.__celsius:.2f}°C = {self.fahrenheit:.2f}°F = "
                f"{self.kelvin:.2f}K = {self.rankine:.2f}°R  [{self.describe()}]")
    
    @classmethod
    def from_string(cls, text: str) -> 'TemperatureConverter':
        """Parse '100C', '212F', '373.15K'."""
        text = text.strip()
        scale_map = {'C': 'celsius', 'F': 'fahrenheit', 'K': 'kelvin', 'R': 'rankine'}
        for suffix, scale in scale_map.items():
            if text.upper().endswith(suffix):
                return cls(float(text[:-1]), scale)
        raise ValueError(f"Cannot parse temperature: {text!r}")

def demo_temperature():
    print("\\nTEMPERATURE CONVERTER DEMO")
    temps = ['0C', '100C', '212F', '373.15K', '98.6F', '-40C']
    for t in temps:
        tc = TemperatureConverter.from_string(t)
        print(f"  {t:>10} -> {tc.all_scales()}")

demo_temperature()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 26. 4/5 correct means you have mastered OOP foundations."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is the difference between a class attribute and an instance attribute? Write code demonstrating how an instance attribute can shadow a class attribute, and explain what happens to the class attribute when you assign to an instance.",
        "Q2: Write a class with all three method types. When would you choose @classmethod over @staticmethod? Give a real scenario where a @classmethod alternative constructor is the right design choice.",
        "Q3: Explain Python's encapsulation model. What does _single_underscore mean? What does __double_underscore do at the bytecode level? Write code showing name mangling in action.",
        "Q4: What is @property? Write a class where a property computes a value from other attributes and validates input on setter assignment. Explain why properties are preferred over getX/setX methods.",
        "Q5: Write a Temperature class with: Celsius-only internal storage, @classmethod constructors from Fahrenheit and Kelvin, @staticmethod conversion utilities, @property for all three scales, and input validation. Use the class to convert -40°F (hint: it equals -40°C)."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: A class attribute is defined at class level and shared by all instances — changing it via the class changes it for all instances. An instance attribute is stored in the instance's __dict__ and unique to that instance. When you assign to an instance (instance.x = value), Python creates an instance attribute that SHADOWS the class attribute — the class attribute is unchanged, but the instance now has its own copy. Delete the instance attribute (del instance.x) to reveal the class attribute again. A2: @classmethod receives cls and can create instances of the class (or subclasses). @staticmethod receives nothing — it is just a namespaced function. Use @classmethod when: creating alternative constructors (from_json, from_dict), when the method needs to create instances, or when it needs access to class-level data. Use @staticmethod when the function logically belongs to the class but needs no access to class or instance state. Example: datetime.fromisoformat() is a classmethod because it creates a datetime instance; math.sqrt would be a staticmethod if it were on a class. A3: _single_underscore is a convention meaning 'internal implementation detail' — Python does not enforce anything, but linters and IDEs warn if external code accesses it. __double_underscore triggers name mangling: Python renames __attr in class MyClass to _MyClass__attr, so subclasses cannot accidentally override it. Access via instance.__attr raises AttributeError, but instance._MyClass__attr works. This prevents attribute collision in deep inheritance hierarchies, not security. A4: @property allows attribute-style access to computed values and validation. Preferred over getX/setX because: natural Python syntax (obj.x not obj.get_x()), backward compatible (add property to existing attribute without changing call sites), enforces invariants at assignment time. Write: @property def speed(self): return self.__speed. @speed.setter def speed(self, v): if v < 0: raise ValueError('...'); self.__speed = v. Now obj.speed = -5 raises ValueError. A5: class Temperature: ABSOLUTE_ZERO = -273.15; def __init__(self, c): if c < self.ABSOLUTE_ZERO: raise ValueError; self.__c = c. @classmethod def from_fahrenheit(cls, f): return cls((f-32)*5/9). @classmethod def from_kelvin(cls, k): return cls(k-273.15). @property def celsius(self): return self.__c. @property def fahrenheit(self): return self.__c*9/5+32. @property def kelvin(self): return self.__c+273.15. @staticmethod def f_to_c(f): return (f-32)*5/9. Test: Temperature.from_fahrenheit(-40).celsius == -40.0. Yes, -40 is the unique temperature where Fahrenheit equals Celsius."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered the foundations of object-oriented programming. You understand what a class really is at the Python object model level — not just syntax, but a callable that produces objects, itself an instance of type. You distinguish class attributes (shared state) from instance attributes (individual state) and understand how instance assignment shadows class attributes. You master all three method types: instance methods that operate on self, class methods that receive cls and enable alternative constructors, and static methods that are namespaced utilities. You implement Python's encapsulation model with _protected conventions, __private name mangling, and @property for controlled attribute access with validation. And you have built four complete programs demonstrating these principles in real-world contexts. This is the foundation. Everything in OOP — inheritance, polymorphism, magic methods, metaclasses — builds on these fundamentals."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: A class is a blueprint; an object is an instance. Class attributes are shared; instance attributes are individual. Instance methods get self; class methods get cls; static methods get neither. _underscore is convention; __dunder triggers name mangling; @property adds controlled access. Master these foundations, and inheritance and polymorphism become obvious extensions. In Part 26, we explore OOP's most powerful features: inheritance, polymorphism, abstract base classes, and duck typing — the tools that make large systems maintainable."
    },
    {
      "type": "cta",
      "text": "Start Part 26: Inheritance & Polymorphism →",
      "href": "/tutorials/python-unlocked/part-26-oop-inheritance",
      "note": "28 min read · super() · MRO · Abstract classes · Duck typing · Four programs"
    }
  ]
};

export default post;
