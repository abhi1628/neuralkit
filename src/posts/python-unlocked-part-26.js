const post = {
  "slug": "part-26-oop-inheritance",
  "seriesSlug": "python-unlocked",
  "partNumber": 26,
  "totalParts": 30,
  "title": "OOP — Inheritance & Polymorphism (Part 26)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "July 26, 2026",
  "readTime": "28 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Single inheritance and super(). Method Resolution Order and the diamond problem. Abstract base classes with the abc module. Duck typing. Four programs: animal kingdom, plugin system, shape area calculator, abstract data structure.",
  "coverEmoji": "🧬",
  "tags": [
    "Python", "OOP", "Inheritance", "Polymorphism", "ABC",
    "Duck Typing", "MRO", "super()", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1969, Tony Hoare introduced the concept of hierarchical types in his landmark paper 'Record Handling'. His insight was that specialization — the relationship between a general concept and a more specific one — should be expressible in code. A Dog is a Mammal. A Mammal is an Animal. An Animal is a LivingThing. This hierarchy is not just conceptual tidiness. It is the mechanism by which code reuse becomes systematic, by which a change to the Animal class propagates correctly to every descendant. Fifty-seven years later, Python's inheritance system is one of the most sophisticated in any mainstream language. Single inheritance is clean and predictable. Multiple inheritance — Python's most controversial feature — is managed by the C3 linearization algorithm, which guarantees a consistent, deterministic method resolution order. Abstract base classes enforce contracts without requiring rigid type hierarchies. And duck typing — Python's philosophical departure from classical OOP — says the type of an object is determined by what it can do, not what it inherits from. In this part, we will master all four. You will understand super() not as magic but as a precise call to the next class in the MRO. You will solve the diamond problem with confidence. You will define unbreakable contracts with abstract base classes. And you will embrace duck typing as the philosophy that makes Python's standard library composable. The four programs — an animal kingdom, a plugin system, a shape calculator, and an abstract data structure — will make these abstractions concrete."
    },
    {
      "type": "h2",
      "text": "Single Inheritance and super()"
    },
    {
      "type": "p",
      "text": "Inheritance is not about code reuse — that is a side effect. It is about expressing is-a relationships: a Dog is an Animal, so Dog should support everything Animal supports. The super() function does not call 'the parent class' — it calls the next class in the Method Resolution Order. This distinction is critical when you introduce multiple inheritance."
    },
    {
      "type": "code-block",
      "label": "Single Inheritance and super() — Deep Understanding",
      "code": `# === SINGLE INHERITANCE AND super() ===
from datetime import datetime

class Animal:
    """Base class for all animals."""
    
    def __init__(self, name: str, age: int, weight_kg: float):
        self.name = name
        self.age = age
        self.weight_kg = weight_kg
        self._health = 100.0
        print(f"  [Animal.__init__] Creating {name}")
    
    def eat(self, food: str) -> str:
        self._health = min(100, self._health + 5)
        return f"{self.name} eats {food}. Health: {self._health:.0f}"
    
    def sleep(self, hours: float) -> str:
        self._health = min(100, self._health + hours * 2)
        return f"{self.name} sleeps {hours}h. Health: {self._health:.0f}"
    
    def speak(self) -> str:
        return f"{self.name} makes a sound."
    
    def describe(self) -> str:
        return (f"{type(self).__name__}(name={self.name!r}, "
                f"age={self.age}, weight={self.weight_kg}kg)")
    
    def __repr__(self) -> str:
        return self.describe()


class Mammal(Animal):
    """Mammals: warm-blooded, give birth to live young."""
    
    def __init__(self, name: str, age: int, weight_kg: float, fur_color: str):
        # super() calls next in MRO — for Mammal, that is Animal
        # ALWAYS call super().__init__() to ensure full initialization
        super().__init__(name, age, weight_kg)
        self.fur_color = fur_color
        print(f"  [Mammal.__init__] Adding fur_color={fur_color}")
    
    def nurse_young(self) -> str:
        return f"{self.name} nurses young (mammalian behavior)."
    
    def regulate_temperature(self) -> str:
        return f"{self.name} maintains body temperature (warm-blooded)."


class Dog(Mammal):
    """Dogs: domestic mammals, loyal and trainable."""
    
    def __init__(self, name: str, age: int, weight_kg: float,
                 fur_color: str, breed: str):
        super().__init__(name, age, weight_kg, fur_color)
        self.breed = breed
        self._tricks: list[str] = []
        print(f"  [Dog.__init__] Adding breed={breed}")
    
    def speak(self) -> str:
        return f"{self.name} barks: Woof! Woof!"
    
    def learn_trick(self, trick: str) -> str:
        self._tricks.append(trick)
        return f"{self.name} learned: {trick}!"
    
    def perform(self) -> str:
        if not self._tricks:
            return f"{self.name} doesn't know any tricks yet."
        return f"{self.name} performs: {', '.join(self._tricks)}"
    
    def describe(self) -> str:
        base = super().describe()
        return base + f", breed={self.breed!r}, tricks={self._tricks}"


class GuideDog(Dog):
    """Guide dogs: trained for accessibility assistance."""
    
    def __init__(self, name: str, age: int, weight_kg: float,
                 fur_color: str, breed: str, handler: str):
        super().__init__(name, age, weight_kg, fur_color, breed)
        self.handler = handler
        print(f"  [GuideDog.__init__] Assigned to {handler}")
    
    def guide(self, destination: str) -> str:
        return f"{self.name} guides {self.handler} to {destination}."
    
    def speak(self) -> str:
        # Override but still use parent behavior
        parent_speak = super().speak()
        return f"{parent_speak} (Guide dog — calm and focused)"


# Demonstration
print("Creating a GuideDog (watch the __init__ chain):")
rex = GuideDog("Rex", 3, 28.5, "golden", "Labrador", "Alice")

print(f"\\nRex: {rex}")
print(rex.speak())
print(rex.guide("the pharmacy"))
print(rex.nurse_young())     # Inherited from Mammal
print(rex.eat("kibble"))     # Inherited from Animal

# MRO: the actual method lookup order
print(f"\\nGuideDog MRO:")
for cls in GuideDog.__mro__:
    print(f"  {cls}")

# isinstance checks: True at every level of hierarchy
print(f"\\nisinstance(rex, GuideDog): {isinstance(rex, GuideDog)}")
print(f"isinstance(rex, Dog): {isinstance(rex, Dog)}")
print(f"isinstance(rex, Mammal): {isinstance(rex, Mammal)}")
print(f"isinstance(rex, Animal): {isinstance(rex, Animal)}")

print("\\nSingle inheritance complete!")`
    },
    {
      "type": "h2",
      "text": "Multiple Inheritance: The Diamond Problem and C3 Linearization"
    },
    {
      "type": "p",
      "text": "Multiple inheritance is Python's most misunderstood feature. The diamond problem — where two parent classes share a common ancestor — would cause ambiguity in naive implementations. Python solves this with C3 linearization: an algorithm that produces a consistent, predictable Method Resolution Order that respects both the class hierarchy and the order of inheritance declaration."
    },
    {
      "type": "code-block",
      "label": "Multiple Inheritance and MRO — The Diamond Problem Solved",
      "code": `# === THE DIAMOND PROBLEM ===
#
#         Base
#        /    \\
#      Left  Right
#        \\    /
#         Child
#
# Without MRO: Child.method() — call Left.method() or Right.method()?
# Python's answer: C3 linearization gives a definitive order.

class Base:
    def __init__(self):
        print(f"  Base.__init__")
        super().__init__()  # CRITICAL: always call super() in multiple inheritance
    
    def method(self) -> str:
        return "Base.method"
    
    def shared(self) -> str:
        return "Base.shared"


class Left(Base):
    def __init__(self):
        print(f"  Left.__init__")
        super().__init__()
    
    def method(self) -> str:
        base_result = super().method()
        return f"Left.method -> {base_result}"
    
    def left_only(self) -> str:
        return "Left.left_only"


class Right(Base):
    def __init__(self):
        print(f"  Right.__init__")
        super().__init__()
    
    def method(self) -> str:
        base_result = super().method()
        return f"Right.method -> {base_result}"
    
    def right_only(self) -> str:
        return "Right.right_only"


class Child(Left, Right):
    def __init__(self):
        print(f"  Child.__init__")
        super().__init__()  # Follows MRO: Child -> Left -> Right -> Base -> object
    
    def method(self) -> str:
        parent_result = super().method()
        return f"Child.method -> {parent_result}"


print("Creating Child (watch the MRO-ordered __init__ chain):")
c = Child()

print(f"\\nc.method(): {c.method()}")
print(f"c.left_only(): {c.left_only()}")
print(f"c.right_only(): {c.right_only()}")

print(f"\\nChild MRO: {[cls.__name__ for cls in Child.__mro__]}")
# Output: ['Child', 'Left', 'Right', 'Base', 'object']
# C3 linearization guarantees: Child before parents, Left before Right (declaration order)
# Base appears once despite being inherited via two paths

# --- Mixin Pattern: the RIGHT way to use multiple inheritance ---
# Mixins are small, focused classes that add specific capabilities
# They are not meant to be instantiated alone

class JsonMixin:
    """Mixin: adds JSON serialization to any class."""
    def to_json(self) -> str:
        import json
        data = {k: v for k, v in self.__dict__.items()
                if not k.startswith('_')}
        return json.dumps(data, default=str, indent=2)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'JsonMixin':
        import json
        data = json.loads(json_str)
        obj = cls.__new__(cls)
        obj.__dict__.update(data)
        return obj


class LogMixin:
    """Mixin: adds logging to any class."""
    def log(self, message: str, level: str = "INFO") -> None:
        from datetime import datetime
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{level}] {type(self).__name__}: {message}")


class ValidateMixin:
    """Mixin: adds validation framework."""
    def validate(self) -> list[str]:
        """Override to return list of validation errors."""
        return []
    
    def is_valid(self) -> bool:
        return len(self.validate()) == 0
    
    def assert_valid(self) -> None:
        errors = self.validate()
        if errors:
            raise ValueError(f"Validation failed:\\n" + "\\n".join(f"  - {e}" for e in errors))


# Combining mixins: multiple inheritance done right
class Product(JsonMixin, LogMixin, ValidateMixin):
    """Product using multiple mixins."""
    
    def __init__(self, name: str, price: float, stock: int):
        self.name = name
        self.price = price
        self.stock = stock
        self.log(f"Created product: {name}")
    
    def validate(self) -> list[str]:
        errors = []
        if not self.name:
            errors.append("Name cannot be empty")
        if self.price < 0:
            errors.append(f"Price cannot be negative: {self.price}")
        if self.stock < 0:
            errors.append(f"Stock cannot be negative: {self.stock}")
        return errors
    
    def sell(self, quantity: int) -> None:
        if quantity > self.stock:
            raise ValueError(f"Insufficient stock: {self.stock} < {quantity}")
        self.stock -= quantity
        self.log(f"Sold {quantity} units. Stock: {self.stock}")


p = Product("Python Book", 39.99, 100)
p.sell(5)
p.log("Price check", "DEBUG")
print(p.to_json())

try:
    bad = Product("", -10, -5)
    bad.assert_valid()
except ValueError as e:
    print(f"\\nValidation error: {e}")

print("\\nMultiple inheritance mastered!")`
    },
    {
      "type": "h2",
      "text": "Abstract Base Classes: Enforcing Contracts"
    },
    {
      "type": "p",
      "text": "Abstract base classes define what a class MUST implement. They are contracts: any subclass that fails to implement every abstract method is itself abstract and cannot be instantiated. This is how you design plug-in systems, data source adapters, and any architecture where you need interchangeable components."
    },
    {
      "type": "code-block",
      "label": "Abstract Base Classes — Contracts and Interfaces",
      "code": `# === ABSTRACT BASE CLASSES ===
from abc import ABC, abstractmethod
from typing import Iterator, Any

class DataSource(ABC):
    """Abstract interface for any data source.
    
    Subclasses MUST implement: connect, read, close
    Subclasses MAY override: read_all, __iter__
    """
    
    def __init__(self, name: str):
        self.name = name
        self._connected = False
    
    @abstractmethod
    def connect(self) -> None:
        """Establish connection to the data source."""
        ...
    
    @abstractmethod
    def read(self, n: int = -1) -> list[dict]:
        """Read n records. -1 means all."""
        ...
    
    @abstractmethod
    def close(self) -> None:
        """Close the connection."""
        ...
    
    # Concrete method: uses abstract methods, works for ALL subclasses
    def read_all(self) -> list[dict]:
        """Read all records. Concrete implementation using abstract read()."""
        if not self._connected:
            self.connect()
        try:
            return self.read(-1)
        finally:
            self.close()
    
    def __iter__(self) -> Iterator[dict]:
        """Make any DataSource iterable."""
        if not self._connected:
            self.connect()
        while True:
            batch = self.read(10)
            if not batch:
                break
            yield from batch
        self.close()
    
    # Abstract class method: subclasses must implement
    @classmethod
    @abstractmethod
    def source_type(cls) -> str:
        """Return the type of this data source."""
        ...
    
    def __repr__(self) -> str:
        status = "connected" if self._connected else "disconnected"
        return f"{type(self).__name__}(name={self.name!r}, status={status})"


class CSVDataSource(DataSource):
    """Concrete: reads from a CSV file."""
    
    def __init__(self, name: str, filepath: str):
        super().__init__(name)
        self.filepath = filepath
        self._data: list[dict] = []
        self._position = 0
    
    def connect(self) -> None:
        print(f"[CSV] Connecting to {self.filepath}")
        # Simulate CSV data
        self._data = [
            {"id": i, "name": f"Record {i}", "value": i * 1.5}
            for i in range(1, 21)
        ]
        self._position = 0
        self._connected = True
    
    def read(self, n: int = -1) -> list[dict]:
        if not self._connected:
            raise RuntimeError("Not connected")
        if n == -1:
            result = self._data[self._position:]
            self._position = len(self._data)
        else:
            result = self._data[self._position:self._position + n]
            self._position += len(result)
        return result
    
    def close(self) -> None:
        print(f"[CSV] Closing {self.filepath}")
        self._connected = False
    
    @classmethod
    def source_type(cls) -> str:
        return "CSV File"


class APIDataSource(DataSource):
    """Concrete: reads from a REST API."""
    
    def __init__(self, name: str, endpoint: str, api_key: str):
        super().__init__(name)
        self.endpoint = endpoint
        self._api_key = api_key
        self._cache: list[dict] = []
        self._position = 0
    
    def connect(self) -> None:
        print(f"[API] Connecting to {self.endpoint}")
        # Simulate API response
        self._cache = [
            {"user_id": i, "username": f"user_{i}", "score": i * 10}
            for i in range(1, 16)
        ]
        self._position = 0
        self._connected = True
    
    def read(self, n: int = -1) -> list[dict]:
        if not self._connected:
            raise RuntimeError("Not connected")
        if n == -1:
            result = self._cache[self._position:]
            self._position = len(self._cache)
        else:
            result = self._cache[self._position:self._position + n]
            self._position += len(result)
        return result
    
    def close(self) -> None:
        print(f"[API] Closing connection to {self.endpoint}")
        self._connected = False
    
    @classmethod
    def source_type(cls) -> str:
        return "REST API"


# Cannot instantiate abstract class
try:
    ds = DataSource("test")  # TypeError!
except TypeError as e:
    print(f"Cannot instantiate abstract class: {e}")

# Concrete subclasses work
csv_source = CSVDataSource("products", "/data/products.csv")
api_source = APIDataSource("users", "https://api.example.com/users", "key123")

# Polymorphism: both work identically through the DataSource interface
sources: list[DataSource] = [csv_source, api_source]
for source in sources:
    print(f"\\nSource: {source} (type: {source.source_type()})")
    records = source.read_all()
    print(f"  Read {len(records)} records")
    if records:
        print(f"  First record: {records[0]}")

print("\\nAbstract base classes mastered!")`
    },
    {
      "type": "h2",
      "text": "Duck Typing: If It Walks Like a Duck"
    },
    {
      "type": "p",
      "text": "Duck typing is Python's philosophical departure from classical OOP: an object's type is determined not by its inheritance hierarchy, but by what methods and attributes it supports. 'If it walks like a duck and quacks like a duck, it is a duck.' This enables a looser, more flexible form of polymorphism — any object with the right interface works, regardless of class lineage."
    },
    {
      "type": "code-block",
      "label": "Duck Typing — Flexible Polymorphism",
      "code": `# === DUCK TYPING ===
from typing import Protocol, runtime_checkable

# --- Classic duck typing ---
# No inheritance required — just the right interface

class Dog:
    def speak(self): return "Woof!"
    def move(self): return "runs"

class Cat:
    def speak(self): return "Meow!"
    def move(self): return "slinks"

class Robot:
    def speak(self): return "BEEP BOOP"
    def move(self): return "rolls"

class TextFile:
    def speak(self): return open("poem.txt").read() if False else "reads from file"
    def move(self): return "stays still"

def make_noise(things: list) -> None:
    """Works with ANYTHING that has .speak() — no base class required."""
    for thing in things:
        print(f"  {type(thing).__name__}: {thing.speak()}")

def move_things(things: list) -> None:
    for thing in things:
        print(f"  {type(thing).__name__} {thing.move()}")

things = [Dog(), Cat(), Robot(), TextFile()]
print("Making noise:")
make_noise(things)
print("\\nMoving:")
move_things(things)

# --- Protocol: structural subtyping (Python 3.8+) ---
# Protocols make duck typing explicit and checkable by type checkers

@runtime_checkable
class Speakable(Protocol):
    """Anything with a speak() method is a Speakable."""
    def speak(self) -> str: ...

@runtime_checkable
class Drawable(Protocol):
    """Anything with draw() is Drawable."""
    def draw(self) -> str: ...
    def get_dimensions(self) -> tuple[float, float]: ...

# Check duck type with Protocol at runtime
for thing in things:
    is_speakable = isinstance(thing, Speakable)
    print(f"{type(thing).__name__} is Speakable: {is_speakable}")

# --- EAFP vs LBYL ---
# LBYL: Look Before You Leap (Java-style)
def process_lbyl(obj):
    if hasattr(obj, 'read') and callable(obj.read):
        if hasattr(obj, 'close') and callable(obj.close):
            data = obj.read()
            obj.close()
            return data
    return None

# EAFP: Easier to Ask Forgiveness than Permission (Pythonic)
def process_eafp(obj):
    try:
        data = obj.read()
        obj.close()
        return data
    except AttributeError:
        return None

# EAFP is more Pythonic — it handles the happy path without
# the overhead of checking every precondition

# --- The power of duck typing in the standard library ---
# sorted() works on ANY iterable
# len() works on ANY object with __len__
# for loops work on ANY object with __iter__ or __getitem__
# with statement works on ANY object with __enter__/__exit__
# print() works on ANY object with __str__

# This is why you can do:
class Counter:
    def __init__(self):
        self._count = 0
    
    def __iter__(self):
        for i in range(self._count):
            yield i
    
    def __len__(self):
        return self._count
    
    def increment(self):
        self._count += 1
        return self

counter = Counter()
counter.increment().increment().increment()
print(f"\\nCounter length: {len(counter)}")
print(f"Counter iteration: {list(counter)}")
print(f"Is Sized: {hasattr(counter, '__len__')}")

print("\\nDuck typing mastered!")`
    },
    {
      "type": "h2",
      "text": "Four Complete Programs"
    },
    {
      "type": "code-block",
      "label": "Program 1: Animal Kingdom",
      "code": `# === PROGRAM 1: ANIMAL KINGDOM ===
from abc import ABC, abstractmethod
import random

class Animal(ABC):
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
        self._energy = 100
    
    @abstractmethod
    def speak(self) -> str: ...
    
    @abstractmethod
    def move(self) -> str: ...
    
    @property
    @abstractmethod
    def animal_type(self) -> str: ...
    
    def eat(self, food: str) -> str:
        self._energy = min(100, self._energy + 20)
        return f"{self.name} eats {food} (energy: {self._energy})"
    
    def __repr__(self):
        return f"{self.animal_type}({self.name!r}, age={self.age})"

class Mammal(Animal):
    @property
    def animal_type(self): return "Mammal"
    def move(self): return f"{self.name} runs on four legs"

class Bird(Animal):
    def __init__(self, name, age, can_fly=True):
        super().__init__(name, age)
        self.can_fly = can_fly
    
    @property
    def animal_type(self): return "Bird"
    
    def move(self):
        if self.can_fly:
            return f"{self.name} soars through the sky"
        return f"{self.name} waddles on the ground"

class Reptile(Animal):
    @property
    def animal_type(self): return "Reptile"
    def move(self): return f"{self.name} slithers silently"

class Lion(Mammal):
    def speak(self): return f"{self.name} ROARS!"
    def hunt(self, prey: str): return f"{self.name} hunts {prey} on the savanna"

class Eagle(Bird):
    def speak(self): return f"{self.name} screeches!"
    def dive(self): return f"{self.name} dives at 120mph"

class Penguin(Bird):
    def __init__(self, name, age):
        super().__init__(name, age, can_fly=False)
    def speak(self): return f"{self.name} squawks!"
    def swim(self): return f"{self.name} rockets through the water"

class Python(Reptile):
    def __init__(self, name, age, length_m):
        super().__init__(name, age)
        self.length_m = length_m
    def speak(self): return f"{self.name} hisses..."
    def constrict(self, prey): return f"{self.name} ({self.length_m}m) constricts {prey}"

def animal_show(animals: list[Animal]) -> None:
    print("\\n" + "=" * 55)
    print("  ANIMAL KINGDOM SHOWCASE")
    print("=" * 55)
    for animal in animals:
        print(f"\\n  {animal}")
        print(f"    Sound: {animal.speak()}")
        print(f"    Movement: {animal.move()}")
        print(f"    {animal.eat('breakfast')}")

kingdom = [
    Lion("Simba", 5),
    Eagle("Thor", 3),
    Penguin("Tux", 2),
    Python("Kaa", 8, 4.5),
]
animal_show(kingdom)

# Polymorphism: same interface, different behavior
print("\\n  All animals eat:")
for a in kingdom:
    print(f"    {a.eat('dinner')}")`
    },
    {
      "type": "code-block",
      "label": "Programs 2, 3 & 4: Plugin System, Shape Calculator, Stack",
      "code": `# === PROGRAM 2: PLUGIN SYSTEM ===
from abc import ABC, abstractmethod
from typing import Any

class DataPlugin(ABC):
    """Base plugin interface."""
    
    @abstractmethod
    def process(self, data: list[Any]) -> list[Any]: ...
    
    @abstractmethod
    def name(self) -> str: ...
    
    def __repr__(self): return f"Plugin({self.name()})"

class FilterPlugin(DataPlugin):
    def __init__(self, predicate):
        self._pred = predicate
    def name(self): return f"Filter"
    def process(self, data): return [x for x in data if self._pred(x)]

class TransformPlugin(DataPlugin):
    def __init__(self, transform):
        self._fn = transform
    def name(self): return "Transform"
    def process(self, data): return [self._fn(x) for x in data]

class SortPlugin(DataPlugin):
    def __init__(self, key=None, reverse=False):
        self._key = key
        self._reverse = reverse
    def name(self): return "Sort"
    def process(self, data): return sorted(data, key=self._key, reverse=self._reverse)

class Pipeline:
    """Composable data pipeline from plugins."""
    def __init__(self, *plugins: DataPlugin):
        self._plugins = list(plugins)
    
    def add(self, plugin: DataPlugin) -> 'Pipeline':
        self._plugins.append(plugin)
        return self
    
    def run(self, data: list[Any]) -> list[Any]:
        result = data
        for plugin in self._plugins:
            result = plugin.process(result)
            print(f"  After {plugin}: {result[:5]}{'...' if len(result) > 5 else ''}")
        return result

print("\\nPLUGIN SYSTEM DEMO")
data = list(range(1, 21))
print(f"Input: {data}")
pipeline = Pipeline(
    FilterPlugin(lambda x: x % 2 == 0),
    TransformPlugin(lambda x: x ** 2),
    SortPlugin(reverse=True),
)
result = pipeline.run(data)
print(f"Output: {result}")

# === PROGRAM 3: SHAPE AREA CALCULATOR ===
import math
from abc import ABC, abstractmethod

class Shape(ABC):
    @property
    @abstractmethod
    def area(self) -> float: ...
    
    @property
    @abstractmethod
    def perimeter(self) -> float: ...
    
    def __lt__(self, other: 'Shape'): return self.area < other.area
    def __eq__(self, other: object):
        if not isinstance(other, Shape): return NotImplemented
        return abs(self.area - other.area) < 1e-9

class Circle(Shape):
    def __init__(self, r): self.r = r
    @property
    def area(self): return math.pi * self.r ** 2
    @property
    def perimeter(self): return 2 * math.pi * self.r
    def __repr__(self): return f"Circle(r={self.r})"

class Rectangle(Shape):
    def __init__(self, w, h): self.w, self.h = w, h
    @property
    def area(self): return self.w * self.h
    @property
    def perimeter(self): return 2 * (self.w + self.h)
    def __repr__(self): return f"Rect({self.w}x{self.h})"

class Triangle(Shape):
    def __init__(self, a, b, c): self.sides = (a, b, c)
    @property
    def area(self):
        a, b, c = self.sides
        s = (a + b + c) / 2
        return math.sqrt(s*(s-a)*(s-b)*(s-c))
    @property
    def perimeter(self): return sum(self.sides)
    def __repr__(self): return f"Triangle{self.sides}"

print("\\nSHAPE CALCULATOR DEMO")
shapes = [Circle(5), Rectangle(4, 6), Triangle(3, 4, 5), Circle(3), Rectangle(10, 2)]
shapes.sort()
print("Shapes sorted by area:")
for s in shapes:
    print(f"  {s}: area={s.area:.2f}, perimeter={s.perimeter:.2f}")
print(f"Largest: {max(shapes)}")
print(f"Total area: {sum(s.area for s in shapes):.2f}")

# === PROGRAM 4: ABSTRACT STACK ===
from abc import ABC, abstractmethod
from typing import TypeVar, Generic

T = TypeVar('T')

class AbstractStack(ABC, Generic[T]):
    """Abstract stack — subclasses provide storage."""
    
    @abstractmethod
    def push(self, item: T) -> None: ...
    
    @abstractmethod
    def pop(self) -> T: ...
    
    @abstractmethod
    def peek(self) -> T: ...
    
    @abstractmethod
    def is_empty(self) -> bool: ...
    
    @abstractmethod
    def size(self) -> int: ...
    
    def push_all(self, items) -> None:
        for item in items: self.push(item)
    
    def pop_all(self) -> list[T]:
        result = []
        while not self.is_empty():
            result.append(self.pop())
        return result

class ListStack(AbstractStack[T]):
    """Stack backed by a Python list."""
    def __init__(self): self._data: list[T] = []
    def push(self, item): self._data.append(item)
    def pop(self):
        if self.is_empty(): raise IndexError("Stack is empty")
        return self._data.pop()
    def peek(self):
        if self.is_empty(): raise IndexError("Stack is empty")
        return self._data[-1]
    def is_empty(self): return len(self._data) == 0
    def size(self): return len(self._data)
    def __repr__(self): return f"ListStack({self._data})"

class BoundedStack(ListStack[T]):
    """Stack with maximum capacity."""
    def __init__(self, capacity: int):
        super().__init__()
        self._capacity = capacity
    def push(self, item):
        if self.size() >= self._capacity:
            raise OverflowError(f"Stack full (capacity={self._capacity})")
        super().push(item)
    def __repr__(self): return f"BoundedStack({self._data}, cap={self._capacity})"

print("\\nABSTRACT STACK DEMO")
stack: AbstractStack[int] = ListStack()
stack.push_all([1, 2, 3, 4, 5])
print(f"Stack: {stack}")
print(f"Peek: {stack.peek()}")
print(f"Pop all: {stack.pop_all()}")

bounded: AbstractStack[str] = BoundedStack(3)
bounded.push("a"); bounded.push("b"); bounded.push("c")
print(f"\\nBounded: {bounded}")
try:
    bounded.push("d")
except OverflowError as e:
    print(f"Expected overflow: {e}")

print("\\nAll four programs complete!")`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Print the MRO for class D(B, C) where B(A) and C(A). Explain each step of C3 linearization. Why does A appear once despite being inherited twice?",
        "Q2: What is the difference between super() in single inheritance and super() in multiple inheritance? Why must every class in a multiple-inheritance hierarchy call super().__init__() for cooperative initialization to work?",
        "Q3: Write an abstract base class Shape with abstract properties area and perimeter, and a concrete method describe() that uses them. Show that subclasses must implement both abstract properties or they cannot be instantiated.",
        "Q4: Explain duck typing with a concrete example. What is the difference between duck typing and structural subtyping (Protocol)? When would you use Protocol instead of ABC?",
        "Q5: Write a Mixin class LogMixin that adds a log() method to any class without requiring inheritance from a specific base. Demonstrate it being used with multiple inheritance on a class that already inherits from something else."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: D.__mro__ = [D, B, C, A, object]. C3 algorithm: start with D, then merge [B, A, object] + [C, A, object] + [B, C]. Take B (head of first list, not in tail of any). Merge [A, object] + [C, A, object] + [C]. Take C (A is in tail of second list, skip it; take C). Merge [A, object] + [A, object]. Take A. Then object. A appears once because C3 ensures each class appears exactly once in the MRO — it merges the two paths that both reach A into a single occurrence, with A coming after both B and C. A2: In single inheritance, super() simply calls the parent class. In multiple inheritance, super() calls the NEXT class in the MRO — which may not be the class you directly inherit from. If every class calls super().__init__(), Python guarantees that every class in the hierarchy gets initialized exactly once in MRO order. If any class omits super().__init__(), classes higher in the chain are never initialized. This is called cooperative multiple inheritance. A3: from abc import ABC, abstractmethod; class Shape(ABC): @property @abstractmethod def area(self): ...; @property @abstractmethod def perimeter(self): ...; def describe(self): return f'area={self.area:.2f}, perimeter={self.perimeter:.2f}'. class Circle(Shape): def __init__(self, r): self.r=r; @property def area(self): return 3.14*self.r**2; @property def perimeter(self): return 2*3.14*self.r. Attempt to instantiate Shape or a partial subclass raises TypeError: Can't instantiate abstract class. A4: Duck typing example: def total_length(items) — works on any list/string/file because they all support len(). No isinstance check needed. Duck typing is implicit — any object with the right methods works. Protocol is explicit structural subtyping: @runtime_checkable class Sized(Protocol): def __len__(self)->int: ... This makes the expected interface visible to type checkers and can be checked with isinstance(). Use ABC when you want to enforce a contract AND provide shared implementation. Use Protocol when you want type checking of duck types without requiring inheritance. A5: class LogMixin: def log(self, msg, level='INFO'): print(f'[{level}] {type(self).__name__}: {msg}'). class Animal: def __init__(self, name): self.name=name. class LoggedAnimal(LogMixin, Animal): def __init__(self, name): super().__init__(name); self.log(f'Created {name}'). The MRO is [LoggedAnimal, LogMixin, Animal, object]. super().__init__ from LoggedAnimal calls LogMixin.__init__ (which doesn't exist, so continues), then Animal.__init__. Result: both LogMixin.log and Animal.name are available."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Inheritance expresses is-a relationships and enables code reuse across hierarchies. super() follows the MRO — never 'calls the parent' — which makes multiple inheritance cooperative. Abstract base classes enforce contracts: subclasses that skip abstract methods cannot be instantiated. Duck typing says the interface matters more than the lineage. Master these four tools and you can design any object-oriented architecture. In Part 27, we dive into magic methods — the protocol that makes your objects feel like built-ins."
    },
    {
      "type": "cta",
      "text": "Start Part 27: Magic Methods & Protocols →",
      "href": "/tutorials/python-unlocked/part-27-magic-methods",
      "note": "26 min read · __str__ · __add__ · __iter__ · Context managers · Callable objects"
    }
  ]
};

export default post;
