const post = {
  "slug": "part-27-magic-methods",
  "seriesSlug": "python-unlocked",
  "partNumber": 27,
  "totalParts": 30,
  "title": "OOP — Magic Methods & Protocols (Part 27)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "July 26, 2026",
  "readTime": "26 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "__str__, __repr__, __eq__, __hash__, __len__, __bool__. Arithmetic magic: __add__, __mul__, __lt__. Container protocol: __getitem__, __setitem__, __contains__. Context manager protocol. Callable objects with __call__. Four programs.",
  "coverEmoji": "✨",
  "tags": [
    "Python", "Magic Methods", "Dunder Methods", "Protocols",
    "Operator Overloading", "Context Manager", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1983, Bjarne Stroustrup added operator overloading to C++. The idea was elegant: let user-defined types respond to operators like +, -, ==, and [] the same way built-in types do. But C++ exposed the raw mechanics — you defined a function called operator+, which was technically correct but aesthetically ugly. Python had a better idea. When you write a + b, Python does not call a naked operator function. It calls a.__add__(b). When you write len(x), Python calls x.__len__(). When you write with x as f:, Python calls x.__enter__() and x.__exit__(). This protocol-based design means every Python operator, every built-in function, every language statement is implemented through well-defined 'magic methods' — methods with double underscores on both sides, also called dunder methods. This is the secret that makes Python feel so consistent. A list, a numpy array, a pandas DataFrame, your custom Vector class — they all feel like built-in types because they all speak the same protocol. In this part, you will learn the complete magic method system. You will implement string representation, comparison, hashing, arithmetic, container behavior, context management, and callable objects. You will understand why __repr__ and __str__ exist as separate methods, why __eq__ invalidates __hash__, and why the context manager protocol is one of Python's finest design achievements. By the end, your objects will not just work — they will feel native."
    },
    {
      "type": "h2",
      "text": "String Representation: __str__, __repr__, __format__"
    },
    {
      "type": "p",
      "text": "__repr__ is for developers: it should produce a string that, when evaluated, recreates the object. __str__ is for users: it should produce a readable, human-friendly description. __format__ controls how the object appears inside f-strings with format specifiers. These three methods together control all string output from your objects."
    },
    {
      "type": "code-block",
      "label": "__repr__, __str__, __format__ — Complete Control",
      "code": `# === STRING REPRESENTATION MASTERY ===
from datetime import datetime

class Point:
    """2D point with full string representation."""
    
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
    
    def __repr__(self) -> str:
        """For developers: unambiguous, recreatable representation.
        eval(repr(p)) should recreate the object."""
        return f"Point({self.x!r}, {self.y!r})"
    
    def __str__(self) -> str:
        """For users: readable, human-friendly."""
        return f"({self.x}, {self.y})"
    
    def __format__(self, spec: str) -> str:
        """Controls f-string formatting: f'{p:.2f}', f'{p:polar}'"""
        if spec == 'polar':
            import math
            r = math.hypot(self.x, self.y)
            theta = math.degrees(math.atan2(self.y, self.x))
            return f"r={r:.2f}, θ={theta:.1f}°"
        elif spec.endswith('f'):
            # Handle float formatting: Point.__format__(p, '.2f')
            precision = spec[:-1] if spec[:-1] else '2'
            fmt = f".{precision[1:] if precision.startswith('.') else precision}f"
            return f"({self.x:{fmt}}, {self.y:{fmt}})"
        return str(self)  # Default


p = Point(3.14159, 2.71828)
print(f"repr(p):   {repr(p)}")       # Point(3.14159, 2.71828)
print(f"str(p):    {str(p)}")        # (3.14159, 2.71828)
print(f"f-string:  {p}")             # Uses __str__
print(f"polar:     {p:polar}")       # Uses __format__
print(f"formatted: {p:.2f}")         # Uses __format__ with spec

# repr is used in containers
points = [Point(1, 2), Point(3, 4)]
print(f"In list:   {points}")        # Uses __repr__ for each element
print(f"Explicit:  {[repr(p) for p in points]}")

# The golden rule: if you only implement one, implement __repr__
# Python falls back to __repr__ if __str__ is not defined
class Minimal:
    def __init__(self, value):
        self.value = value
    def __repr__(self):
        return f"Minimal({self.value!r})"

m = Minimal(42)
print(f"\\nMinimal str:  {str(m)}")   # Falls back to __repr__
print(f"Minimal repr: {repr(m)}")

# __format__ in action
class Money:
    def __init__(self, amount: float, currency: str = "USD"):
        self.amount = amount
        self.currency = currency
    
    def __repr__(self): return f"Money({self.amount!r}, {self.currency!r})"
    def __str__(self): return f"{self.currency} {self.amount:.2f}"
    
    def __format__(self, spec: str) -> str:
        if spec == 'short':
            symbols = {"USD": "$", "EUR": "€", "GBP": "£", "INR": "₹"}
            sym = symbols.get(self.currency, self.currency)
            return f"{sym}{self.amount:,.2f}"
        elif spec == 'words':
            return f"{self.amount:.2f} {self.currency}"
        return str(self)

salary = Money(125000, "USD")
print(f"\\n{salary}")
print(f"{salary:short}")
print(f"{salary:words}")
print(f"In repr: {salary!r}")   # !r forces repr in f-string
print(f"In str:  {salary!s}")   # !s forces str in f-string

print("\\nString representation mastered!")`
    },
    {
      "type": "h2",
      "text": "Comparison and Hashing: __eq__, __hash__, __lt__"
    },
    {
      "type": "p",
      "text": "Comparison magic methods enable your objects to work with ==, !=, <, >, <=, >= operators and built-in functions like sorted(), min(), max(). The critical relationship: if you define __eq__, Python automatically sets __hash__ to None (making your object unhashable), because mutable objects should not be used as dictionary keys. If you want both equality and hashability, define __hash__ explicitly."
    },
    {
      "type": "code-block",
      "label": "__eq__, __hash__, __lt__ and the Comparison Protocol",
      "code": `# === COMPARISON AND HASHING ===
from functools import total_ordering
import math

@total_ordering  # Fills in __le__, __gt__, __ge__ from __eq__ and __lt__
class Vector:
    """2D vector with full comparison support."""
    
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
    
    @property
    def magnitude(self) -> float:
        return math.hypot(self.x, self.y)
    
    def __repr__(self) -> str:
        return f"Vector({self.x}, {self.y})"
    
    def __eq__(self, other: object) -> bool:
        """Equality: same type and same components."""
        if not isinstance(other, Vector):
            return NotImplemented  # Not False! Lets Python try other.__eq__(self)
        return math.isclose(self.x, other.x) and math.isclose(self.y, other.y)
    
    def __hash__(self) -> int:
        """Must define if you define __eq__, otherwise unhashable.
        Objects that compare equal must have same hash."""
        return hash((round(self.x, 9), round(self.y, 9)))
    
    def __lt__(self, other: 'Vector') -> bool:
        """Less than: compare by magnitude."""
        if not isinstance(other, Vector):
            return NotImplemented
        return self.magnitude < other.magnitude
    
    # @total_ordering provides: __le__, __gt__, __ge__ automatically


v1 = Vector(3, 4)   # magnitude = 5
v2 = Vector(4, 3)   # magnitude = 5
v3 = Vector(1, 1)   # magnitude ≈ 1.414
v4 = Vector(6, 8)   # magnitude = 10

# Equality
print(f"v1 == v2: {v1 == v2}")  # False (different components)
print(f"v1 == Vector(3, 4): {v1 == Vector(3, 4)}")  # True

# Comparison (by magnitude, from @total_ordering)
print(f"v3 < v1: {v3 < v1}")   # True (1.41 < 5)
print(f"v4 > v1: {v4 > v1}")   # True (10 > 5)
print(f"v1 <= v2: {v1 <= v2}")  # True (5 <= 5, @total_ordering: not v1 > v2)

# sorted() uses __lt__
vectors = [v4, v1, v3, v2]
sorted_v = sorted(vectors)
print(f"\\nSorted: {sorted_v}")
print(f"Min: {min(vectors)}, Max: {max(vectors)}")

# Hashable: can be used in sets and as dict keys
vector_set = {v1, v2, v3}
print(f"\\nSet (v1 and v2 are different): {vector_set}")
vector_dict = {v1: "unit diagonal", v3: "small"}
print(f"Dict lookup: {vector_dict[Vector(3, 4)]}")

# NotImplemented: the right way to handle unknown types
class WeirdType:
    pass

result = v1.__eq__(WeirdType())
print(f"\\nv1.__eq__(WeirdType()): {result}")  # NotImplemented, not False
# Python then tries WeirdType().__eq__(v1), and if that also fails, returns False

print("\\nComparison mastered!")`
    },
    {
      "type": "h2",
      "text": "Arithmetic Magic: __add__, __mul__, __iadd__"
    },
    {
      "type": "p",
      "text": "Arithmetic magic methods let your objects work with +, -, *, /, //, %, ** operators. Python also provides 'reflected' versions (__radd__, __rmul__) for when the left operand does not know how to handle the operation, and in-place versions (__iadd__, __imul__) for += and *=."
    },
    {
      "type": "code-block",
      "label": "Arithmetic Magic Methods — Full Implementation",
      "code": `# === ARITHMETIC MAGIC METHODS ===
from __future__ import annotations
import math
from typing import Union

class Vector:
    """2D vector with complete arithmetic."""
    
    def __init__(self, x: float, y: float):
        self.x = float(x)
        self.y = float(y)
    
    def __repr__(self): return f"Vector({self.x}, {self.y})"
    
    # --- Binary arithmetic ---
    def __add__(self, other: Union['Vector', float]) -> 'Vector':
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        if isinstance(other, (int, float)):
            return Vector(self.x + other, self.y + other)
        return NotImplemented
    
    def __radd__(self, other: Union['Vector', float]) -> 'Vector':
        """Called when other + self fails (other doesn't know Vector).
        scalar + vector = vector + scalar (commutative)"""
        return self.__add__(other)
    
    def __sub__(self, other: Union['Vector', float]) -> 'Vector':
        if isinstance(other, Vector):
            return Vector(self.x - other.x, self.y - other.y)
        if isinstance(other, (int, float)):
            return Vector(self.x - other, self.y - other)
        return NotImplemented
    
    def __mul__(self, scalar: float) -> 'Vector':
        """Vector * scalar = scaled vector."""
        if isinstance(scalar, (int, float)):
            return Vector(self.x * scalar, self.y * scalar)
        if isinstance(scalar, Vector):
            # Dot product
            return self.x * scalar.x + self.y * scalar.y
        return NotImplemented
    
    def __rmul__(self, scalar: float) -> 'Vector':
        """scalar * vector — commutative scaling."""
        return self.__mul__(scalar)
    
    def __truediv__(self, scalar: float) -> 'Vector':
        if scalar == 0:
            raise ZeroDivisionError("Cannot divide vector by zero")
        return Vector(self.x / scalar, self.y / scalar)
    
    def __neg__(self) -> 'Vector':
        """Unary negation: -vector."""
        return Vector(-self.x, -self.y)
    
    def __abs__(self) -> float:
        """abs(vector) = magnitude."""
        return math.hypot(self.x, self.y)
    
    def __pos__(self) -> 'Vector':
        """Unary positive: +vector (copy)."""
        return Vector(self.x, self.y)
    
    # --- In-place arithmetic (mutates self, returns self) ---
    def __iadd__(self, other: Union['Vector', float]) -> 'Vector':
        result = self.__add__(other)
        if result is NotImplemented:
            return NotImplemented
        self.x, self.y = result.x, result.y
        return self  # Return self, not a new object
    
    def __imul__(self, scalar: float) -> 'Vector':
        result = self.__mul__(scalar)
        if isinstance(result, Vector):
            self.x, self.y = result.x, result.y
            return self
        return NotImplemented
    
    # --- Power ---
    def __pow__(self, n: int) -> float:
        """vector ** 2 = dot product with itself (squared magnitude)."""
        if n == 2:
            return self.x**2 + self.y**2
        raise ValueError(f"Only vector**2 is defined, got **{n}")
    
    def __eq__(self, other): 
        if not isinstance(other, Vector): return NotImplemented
        return math.isclose(self.x, other.x) and math.isclose(self.y, other.y)
    def __hash__(self): return hash((round(self.x, 9), round(self.y, 9)))


# Demonstration
a = Vector(3, 4)
b = Vector(1, 2)

print(f"a = {a}, b = {b}")
print(f"a + b = {a + b}")
print(f"a - b = {a - b}")
print(f"a * 3 = {a * 3}")
print(f"3 * a = {3 * a}")      # Uses __rmul__
print(f"2 + a = {2 + a}")      # Uses __radd__
print(f"a / 2 = {a / 2}")
print(f"-a = {-a}")
print(f"abs(a) = {abs(a)}")    # magnitude = 5
print(f"a ** 2 = {a ** 2}")    # dot product with self = 25
print(f"a * b = {a * b}")      # dot product = 3*1 + 4*2 = 11

# In-place
c = Vector(1, 1)
print(f"\\nc before: {c}")
c += Vector(2, 3)
print(f"c after +=: {c}")
c *= 2
print(f"c after *=: {c}")

# Works with sum() because of __radd__ (sum starts at 0)
vectors = [Vector(1, 0), Vector(0, 1), Vector(2, 2)]
total = sum(vectors, Vector(0, 0))
print(f"\\nsum of vectors: {total}")

print("\\nArithmetic magic mastered!")`
    },
    {
      "type": "h2",
      "text": "Container Protocol and Context Managers"
    },
    {
      "type": "code-block",
      "label": "Container Protocol: __getitem__, __setitem__, __contains__, __len__",
      "code": `# === CONTAINER PROTOCOL ===

class Grid:
    """2D grid implementing the full container protocol."""
    
    def __init__(self, rows: int, cols: int, default=None):
        self._rows = rows
        self._cols = cols
        self._data = [[default] * cols for _ in range(rows)]
    
    def _validate(self, row: int, col: int) -> None:
        if not (0 <= row < self._rows and 0 <= col < self._cols):
            raise IndexError(f"Grid index ({row}, {col}) out of range "
                           f"for {self._rows}x{self._cols} grid")
    
    def __getitem__(self, key: tuple[int, int]):
        """grid[row, col] — tuple indexing."""
        row, col = key
        self._validate(row, col)
        return self._data[row][col]
    
    def __setitem__(self, key: tuple[int, int], value) -> None:
        """grid[row, col] = value"""
        row, col = key
        self._validate(row, col)
        self._data[row][col] = value
    
    def __delitem__(self, key: tuple[int, int]) -> None:
        """del grid[row, col] — reset to None."""
        row, col = key
        self._validate(row, col)
        self._data[row][col] = None
    
    def __contains__(self, value) -> bool:
        """value in grid — searches all cells."""
        return any(value in row for row in self._data)
    
    def __len__(self) -> int:
        """Total number of cells."""
        return self._rows * self._cols
    
    def __iter__(self):
        """Iterate over all cells row by row."""
        for row in self._data:
            yield from row
    
    def __bool__(self) -> bool:
        """False only if all cells are None/falsy."""
        return any(self._data[r][c] for r in range(self._rows)
                   for c in range(self._cols))
    
    def __repr__(self) -> str:
        return f"Grid({self._rows}x{self._cols})"
    
    def display(self) -> str:
        lines = [f"Grid {self._rows}x{self._cols}:"]
        for row in self._data:
            lines.append("  " + " ".join(f"{str(v):>4}" for v in row))
        return "\\n".join(lines)


g = Grid(3, 4)
g[0, 0] = "X"; g[1, 1] = "O"; g[2, 3] = "X"

print(g.display())
print(f"\\ng[0, 0]: {g[0, 0]}")
print(f"g[1, 1]: {g[1, 1]}")
print(f"'X' in g: {'X' in g}")
print(f"'Z' in g: {'Z' in g}")
print(f"len(g): {len(g)}")
print(f"bool(g): {bool(g)}")
print(f"Non-None cells: {[v for v in g if v is not None]}")

del g[0, 0]
print(f"\\nAfter del g[0,0]: {g[0, 0]}")

# === CONTEXT MANAGER PROTOCOL ===
# __enter__: called when entering 'with' block, return value bound to 'as'
# __exit__: called when leaving 'with' block (even on exception)

class Timer:
    """Context manager for timing code blocks."""
    import time
    
    def __init__(self, name: str = ""):
        self.name = name
        self.elapsed = 0.0
        self._start = 0.0
    
    def __enter__(self) -> 'Timer':
        import time
        self._start = time.perf_counter()
        print(f"[Timer] Starting{' ' + self.name if self.name else ''}...")
        return self  # Bound to 'as' variable
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        import time
        self.elapsed = time.perf_counter() - self._start
        print(f"[Timer] Elapsed: {self.elapsed:.4f}s")
        if exc_type:
            print(f"[Timer] Exception occurred: {exc_type.__name__}: {exc_val}")
        # Return False (or None) to re-raise exceptions
        # Return True to suppress exceptions
        return False
    
    def __repr__(self):
        return f"Timer(name={self.name!r}, elapsed={self.elapsed:.4f}s)"

class ManagedFile:
    """Context manager for safe file operations."""
    
    def __init__(self, path: str, mode: str = 'r'):
        self.path = path
        self.mode = mode
        self._file = None
    
    def __enter__(self):
        print(f"[ManagedFile] Opening {self.path} ({self.mode})")
        self._file = open(self.path, self.mode)
        return self._file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._file:
            self._file.close()
            print(f"[ManagedFile] Closed {self.path}")
        if exc_type is FileNotFoundError:
            print(f"[ManagedFile] File not found, suppressing error")
            return True  # Suppress FileNotFoundError
        return False

# Timer usage
with Timer("list comprehension") as t:
    result = [x**2 for x in range(100000)]
print(f"Timer result: {t}")

# Suppress specific exceptions
with ManagedFile("/nonexistent/file.txt") as f:
    content = f.read()  # FileNotFoundError is suppressed
print("Execution continues after suppressed exception")

print("\\nContainer protocol and context managers mastered!")`
    },
    {
      "type": "h2",
      "text": "Four Complete Programs"
    },
    {
      "type": "code-block",
      "label": "Program 1: Custom Vector Class (Full Implementation)",
      "code": `# === PROGRAM 1: COMPLETE VECTOR CLASS ===
from __future__ import annotations
import math
from functools import total_ordering

@total_ordering
class Vec2D:
    """Production-grade 2D vector with all magic methods."""
    
    __slots__ = ('_x', '_y')  # Memory optimization
    
    def __init__(self, x: float = 0, y: float = 0):
        self._x = float(x)
        self._y = float(y)
    
    # --- Properties ---
    @property
    def x(self): return self._x
    @property
    def y(self): return self._y
    @property
    def magnitude(self): return math.hypot(self._x, self._y)
    @property
    def angle(self): return math.degrees(math.atan2(self._y, self._x))
    @property
    def normalized(self):
        m = self.magnitude
        return Vec2D(self._x/m, self._y/m) if m else Vec2D(0, 0)
    
    # --- String ---
    def __repr__(self): return f"Vec2D({self._x}, {self._y})"
    def __str__(self): return f"<{self._x:.3f}, {self._y:.3f}>"
    def __format__(self, spec):
        if spec == 'polar': return f"|{self.magnitude:.3f}| ∠{self.angle:.1f}°"
        return str(self)
    
    # --- Comparison ---
    def __eq__(self, other):
        if not isinstance(other, Vec2D): return NotImplemented
        return math.isclose(self._x, other._x, abs_tol=1e-9) and \
               math.isclose(self._y, other._y, abs_tol=1e-9)
    def __lt__(self, other):
        if not isinstance(other, Vec2D): return NotImplemented
        return self.magnitude < other.magnitude
    def __hash__(self): return hash((round(self._x, 9), round(self._y, 9)))
    def __bool__(self): return self.magnitude > 1e-9
    
    # --- Arithmetic ---
    def __add__(self, other):
        if isinstance(other, Vec2D): return Vec2D(self._x+other._x, self._y+other._y)
        if isinstance(other, (int,float)): return Vec2D(self._x+other, self._y+other)
        return NotImplemented
    def __radd__(self, other): return self.__add__(other)
    def __sub__(self, other):
        if isinstance(other, Vec2D): return Vec2D(self._x-other._x, self._y-other._y)
        if isinstance(other, (int,float)): return Vec2D(self._x-other, self._y-other)
        return NotImplemented
    def __mul__(self, other):
        if isinstance(other, (int,float)): return Vec2D(self._x*other, self._y*other)
        if isinstance(other, Vec2D): return self._x*other._x + self._y*other._y  # dot
        return NotImplemented
    def __rmul__(self, other): return self.__mul__(other)
    def __truediv__(self, scalar):
        if scalar == 0: raise ZeroDivisionError
        return Vec2D(self._x/scalar, self._y/scalar)
    def __neg__(self): return Vec2D(-self._x, -self._y)
    def __abs__(self): return self.magnitude
    def __round__(self, n=0): return Vec2D(round(self._x,n), round(self._y,n))
    def __iadd__(self, other):
        r = self.__add__(other)
        if r is NotImplemented: return NotImplemented
        object.__setattr__(self, '_x', r._x)
        object.__setattr__(self, '_y', r._y)
        return self
    
    # --- Container ---
    def __len__(self): return 2
    def __getitem__(self, i):
        if i == 0: return self._x
        if i == 1: return self._y
        raise IndexError(f"Vec2D index {i} out of range")
    def __iter__(self): yield self._x; yield self._y
    
    # Helper methods
    def dot(self, other: Vec2D) -> float: return self * other
    def cross(self, other: Vec2D) -> float: return self._x*other._y - self._y*other._x
    def distance_to(self, other: Vec2D) -> float: return abs(self - other)
    def rotate(self, degrees: float) -> Vec2D:
        rad = math.radians(degrees)
        return Vec2D(self._x*math.cos(rad) - self._y*math.sin(rad),
                     self._x*math.sin(rad) + self._y*math.cos(rad))

# Demo
a = Vec2D(3, 4)
b = Vec2D(1, 2)
print(f"a = {a}")
print(f"b = {b}")
print(f"a + b = {a + b}")
print(f"a - b = {a - b}")
print(f"2 * a = {2 * a}")
print(f"a / 2 = {a / 2}")
print(f"abs(a) = {abs(a)}")
print(f"a.dot(b) = {a.dot(b)}")
print(f"a.cross(b) = {a.cross(b)}")
print(f"a.normalized = {a.normalized}")
print(f"a rotated 90° = {a.rotate(90)}")
print(f"a:polar = {a:polar}")
print(f"list(a) = {list(a)}")
print(f"sorted = {sorted([a, b, Vec2D(0,1)])}")
print(f"in set: {{a, a, b}} = {len({a, a, b})} unique")`
    },
    {
      "type": "code-block",
      "label": "Programs 2, 3 & 4: Fraction, Dictionary Container, Timer",
      "code": `# === PROGRAM 2: FRACTION CLASS ===
from math import gcd
from __future__ import annotations

class Fraction:
    """Exact rational arithmetic with full operator support."""
    
    def __init__(self, numerator: int, denominator: int = 1):
        if denominator == 0:
            raise ZeroDivisionError("Fraction denominator cannot be zero")
        if denominator < 0:
            numerator, denominator = -numerator, -denominator
        common = gcd(abs(numerator), denominator)
        self._n = numerator // common
        self._d = denominator // common
    
    @classmethod
    def from_float(cls, f: float, max_denom: int = 1000) -> Fraction:
        """Approximate a float as a fraction."""
        from fractions import Fraction as StdFrac
        std = StdFrac(f).limit_denominator(max_denom)
        return cls(std.numerator, std.denominator)
    
    def __repr__(self): return f"Fraction({self._n}, {self._d})"
    def __str__(self): return f"{self._n}/{self._d}" if self._d != 1 else str(self._n)
    def __float__(self): return self._n / self._d
    def __int__(self): return self._n // self._d
    def __bool__(self): return self._n != 0
    
    def __eq__(self, other):
        if isinstance(other, Fraction): return self._n == other._n and self._d == other._d
        if isinstance(other, (int,float)): return float(self) == other
        return NotImplemented
    def __lt__(self, other):
        if isinstance(other, Fraction): return self._n * other._d < other._n * self._d
        if isinstance(other, (int,float)): return float(self) < other
        return NotImplemented
    def __le__(self, other): return self == other or self < other
    def __hash__(self): return hash((self._n, self._d))
    
    def __add__(self, other):
        if isinstance(other, int): other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(self._n*other._d + other._n*self._d, self._d*other._d)
        return NotImplemented
    def __radd__(self, other): return self.__add__(other)
    def __sub__(self, other):
        if isinstance(other, int): other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(self._n*other._d - other._n*self._d, self._d*other._d)
        return NotImplemented
    def __rsub__(self, other):
        if isinstance(other, int): return Fraction(other) - self
        return NotImplemented
    def __mul__(self, other):
        if isinstance(other, int): other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(self._n*other._n, self._d*other._d)
        return NotImplemented
    def __rmul__(self, other): return self.__mul__(other)
    def __truediv__(self, other):
        if isinstance(other, int): other = Fraction(other)
        if isinstance(other, Fraction):
            return Fraction(self._n*other._d, self._d*other._n)
        return NotImplemented
    def __neg__(self): return Fraction(-self._n, self._d)
    def __abs__(self): return Fraction(abs(self._n), self._d)
    def __pow__(self, n: int):
        if n >= 0: return Fraction(self._n**n, self._d**n)
        return Fraction(self._d**(-n), self._n**(-n))

a, b = Fraction(1, 2), Fraction(1, 3)
print(f"FRACTION DEMO")
print(f"a={a}, b={b}")
print(f"a+b={a+b}, a-b={a-b}, a*b={a*b}, a/b={a/b}")
print(f"a**3={a**3}")
print(f"1+a={1+a}")
print(f"float(a)={float(a)}")
print(f"Sorted: {sorted([Fraction(3,4), Fraction(1,3), Fraction(2,3)])}")
print(f"Pi approx: {Fraction.from_float(3.14159)}")

# === PROGRAM 3: DICTIONARY-LIKE CONTAINER ===
class OrderedCounter:
    """Dictionary-like ordered counter with magic methods."""
    
    def __init__(self, iterable=None):
        self._counts: dict = {}
        self._order: list = []
        if iterable:
            for item in iterable:
                self[item] = self.get(item, 0) + 1
    
    def get(self, key, default=None): return self._counts.get(key, default)
    def __getitem__(self, key): return self._counts.get(key, 0)
    def __setitem__(self, key, val):
        if key not in self._counts: self._order.append(key)
        self._counts[key] = val
    def __delitem__(self, key):
        del self._counts[key]; self._order.remove(key)
    def __contains__(self, key): return key in self._counts
    def __len__(self): return len(self._counts)
    def __iter__(self): return iter(self._order)
    def __bool__(self): return len(self._counts) > 0
    def __repr__(self): return f"OrderedCounter({dict(zip(self._order, [self._counts[k] for k in self._order]))})"
    
    def most_common(self, n=None):
        sorted_items = sorted(self._counts.items(), key=lambda x: x[1], reverse=True)
        return sorted_items[:n]

text = "the quick brown fox jumps over the lazy dog the fox"
counter = OrderedCounter(text.split())
print(f"\\nORDERED COUNTER DEMO")
print(f"Counter: {counter}")
print(f"'the' count: {counter['the']}")
print(f"Top 3: {counter.most_common(3)}")

# === PROGRAM 4: TIMER CONTEXT MANAGER (advanced) ===
import time
from contextlib import contextmanager

class BenchmarkSuite:
    """Context manager that benchmarks multiple code sections."""
    
    def __init__(self, name: str):
        self.name = name
        self._sections: list[tuple] = []
        self._current: tuple | None = None
        self._start: float = 0
    
    def __enter__(self) -> 'BenchmarkSuite':
        print(f"\\n{'='*40}")
        print(f"Benchmark Suite: {self.name}")
        print(f"{'='*40}")
        return self
    
    def __exit__(self, *args) -> bool:
        self._print_report()
        return False
    
    @contextmanager
    def section(self, name: str):
        start = time.perf_counter()
        print(f"  [{name}] Running...", end=" ", flush=True)
        try:
            yield
        finally:
            elapsed = time.perf_counter() - start
            self._sections.append((name, elapsed))
            print(f"{elapsed*1000:.2f}ms")
    
    def _print_report(self):
        if not self._sections: return
        print(f"\\nResults:")
        fastest = min(self._sections, key=lambda x: x[1])
        for name, t in self._sections:
            bar = "█" * int(t / fastest[1] * 20)
            print(f"  {name:<20} {t*1000:>8.2f}ms  {bar}")
        print(f"  Fastest: {fastest[0]}")

with BenchmarkSuite("List Creation Methods") as bench:
    with bench.section("list comprehension"):
        r = [x**2 for x in range(50000)]
    with bench.section("map + list"):
        r = list(map(lambda x: x**2, range(50000)))
    with bench.section("for loop + append"):
        r = []
        for x in range(50000): r.append(x**2)

print("\\nAll programs complete!")`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is the difference between __repr__ and __str__? When does Python use each? Write a class where they produce meaningfully different output.",
        "Q2: Why does defining __eq__ automatically set __hash__ to None? Write a class that defines both, explaining what constraint must hold between them.",
        "Q3: What is the difference between __add__ and __radd__? Write code showing when __radd__ is called. What should both return when they cannot handle the other operand?",
        "Q4: Implement the context manager protocol (__enter__, __exit__) for a class that tracks database connections. What are the three arguments to __exit__? When should __exit__ return True?",
        "Q5: What is __call__? Write a callable class that acts as a memoizing function wrapper, caching results of expensive computations."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: __repr__ is for developers — it should produce an unambiguous string, ideally one that can be eval()d to recreate the object. __str__ is for end users — it should be readable and human-friendly. Python uses __repr__ in: the interactive interpreter, repr(), containers (when printing a list of objects), !r in f-strings. Python uses __str__ in: print(), str(), !s in f-strings. If only __repr__ is defined, it is used for both. If only __str__ is defined, __repr__ falls back to the default. A2: The contract of hashing requires: if a == b then hash(a) == hash(b). If you define __eq__ to compare by value (equality), then two equal objects must have the same hash. Python cannot guarantee this automatically — you must implement __hash__ to ensure equal objects hash equally. Python sets __hash__ = None as a safety measure: if you define __eq__ without __hash__, the object becomes unhashable (cannot be used as dict key or in sets) to prevent silent hash contract violations. A3: __add__ is called for a + b when a is the left operand. __radd__ is called for a + b when a does NOT know how to add b (returns NotImplemented) — Python then tries b.__radd__(a). Example: 5 + Vector(1,2) calls int.__add__(5, Vector) which returns NotImplemented, then Python calls Vector.__radd__(Vector(1,2), 5). Both should return NotImplemented (not raise!) when they cannot handle the operand, to give Python the chance to try the reflected operation. A4: __enter__ runs on entering the with block and its return value is bound to the as variable. __exit__(exc_type, exc_val, exc_tb) receives exception info — all three are None if no exception occurred. Return True to SUPPRESS the exception (execution continues after the with block). Return False (or None) to re-raise the exception. Use suppression only for expected, harmless exceptions. Database connection example: __enter__ opens connection, __exit__ commits on success (exc_type is None) or rolls back on failure, always closes connection. A5: __call__ makes an instance callable like a function: obj() invokes obj.__call__(). Memoizing wrapper: class Memoize: def __init__(self, fn): self._fn = fn; self._cache = {}. def __call__(self, *args): if args not in self._cache: self._cache[args] = self._fn(*args); return self._cache[args]. @Memoize def fib(n): return n if n<2 else fib(n-1)+fib(n-2). Now fib(100) is instant after the first call because results are cached by argument tuple."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Magic methods are the protocol that makes Python composable. __repr__/__str__ control all string output. __eq__/__hash__ enable equality and dict/set usage — always define both together. __add__/__radd__ make arithmetic work from both sides. The container protocol (__getitem__, __len__, __iter__) makes your objects behave like built-in sequences and mappings. The context manager protocol (__enter__/__exit__) is Python's cleanest resource-management pattern. And __call__ makes objects indistinguishable from functions. In Part 28, we go deeper: metaclasses and descriptors — the machinery that powers Python's type system itself."
    },
    {
      "type": "cta",
      "text": "Start Part 28: Metaclasses & Descriptors →",
      "href": "/tutorials/python-unlocked/part-28-metaclasses-descriptors",
      "note": "24 min read · type · __new__ · Descriptors · @property deep dive · __slots__"
    }
  ]
};

export default post;
