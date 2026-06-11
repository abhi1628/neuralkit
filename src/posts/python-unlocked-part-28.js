const post = {
  "slug": "part-28-metaclasses-descriptors",
  "seriesSlug": "python-unlocked",
  "partNumber": 28,
  "totalParts": 30,
  "title": "OOP — Metaclasses & Descriptors (Part 28)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "July 26, 2026",
  "readTime": "24 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Metaclasses: type, __new__, __init_subclass__. Descriptors: __get__, __set__, __delete__. @property as a descriptor, deep dive. __slots__ for memory optimization. Four programs: Singleton, validated attribute, ORM-like field system, memory-efficient class.",
  "coverEmoji": "🔬",
  "tags": [
    "Python", "Metaclasses", "Descriptors", "type", "__slots__",
    "Advanced OOP", "property", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1976, Alan Kay — the inventor of Smalltalk and the man who coined the term 'object-oriented programming' — said something that most OOP practitioners never fully understand: 'The key in making great and growable systems is much more to design how its modules communicate rather than what their internal properties and behaviors should be.' Python's metaclass and descriptor systems are the ultimate expression of this principle. They are not features you use every day. They are the machinery that makes Python's own type system work — the same machinery that powers Django's ORM, SQLAlchemy's models, dataclasses, Pydantic, and every major Python framework you have ever used. When you write class MyModel(Base):, Django uses a metaclass to inspect your class definition and build database tables. When you write @property, you are using a descriptor. When you use __slots__, you are directly controlling Python's attribute storage mechanism. In this part, we will lift the hood. You will understand what 'type' really is — both a built-in function and the metaclass of all classes. You will implement __new__ to control object creation before __init__. You will write descriptors that validate, transform, and cache attribute access transparently. You will build a Singleton metaclass, a validated attribute system, an ORM-like field declaration system, and a memory-efficient class using __slots__. After this part, Python's most advanced frameworks will feel not like black boxes but like well-understood tools. You will be the developer other developers ask: 'how does that even work?'"
    },
    {
      "type": "h2",
      "text": "Metaclasses: type is Everything"
    },
    {
      "type": "p",
      "text": "Every object in Python has a type. Every class is an object. Therefore every class has a type — and that type is type. type is the metaclass of all classes. When Python processes a class definition, it calls type() to create the class object. By defining a custom metaclass, you intercept class creation and can modify, validate, or augment the class before any instance is ever created."
    },
    {
      "type": "code-block",
      "label": "Metaclasses — type, class creation, __new__ vs __init__",
      "code": `# === METACLASSES: type IS EVERYTHING ===

# Everything is an object. Every class is an instance of type.
print(type(42))           # <class 'int'>
print(type(int))          # <class 'type'>
print(type(type))         # <class 'type'>  (type is its own metaclass!)
print(type(str))          # <class 'type'>

# --- type() can CREATE classes dynamically ---
# type(name, bases, namespace) -> new class
MyClass = type('MyClass', (object,), {
    'x': 42,
    'greet': lambda self: f"Hello from {type(self).__name__}!"
})
obj = MyClass()
print(f"\\nDynamically created: {obj.greet()}, x={obj.x}")

# This is EXACTLY what Python does when it processes:
# class MyClass:
#     x = 42
#     def greet(self): return f"Hello from {type(self).__name__}!"

# --- Custom Metaclass ---
# Override type's __new__ to intercept class creation

class TrackedMeta(type):
    """Metaclass that tracks all classes created with it."""
    
    _registry: dict[str, type] = {}
    
    def __new__(mcs, name: str, bases: tuple, namespace: dict, **kwargs):
        # mcs = the metaclass (TrackedMeta)
        # name = the class name being created
        # bases = tuple of base classes
        # namespace = dict of class body attributes
        
        print(f"[TrackedMeta] Creating class: {name}")
        print(f"  bases: {[b.__name__ for b in bases]}")
        print(f"  attrs: {[k for k in namespace if not k.startswith('_')]}")
        
        # You can modify namespace before class creation!
        namespace['_created_by'] = 'TrackedMeta'
        namespace['_registry_name'] = name.lower()
        
        # Create the class using type's __new__
        cls = super().__new__(mcs, name, bases, namespace)
        
        # Register the class
        TrackedMeta._registry[name] = cls
        
        return cls
    
    def __init__(cls, name, bases, namespace, **kwargs):
        """Called after __new__ — class already exists, do post-creation setup."""
        super().__init__(name, bases, namespace)
        print(f"[TrackedMeta] Initialized class: {name}")
    
    def __call__(cls, *args, **kwargs):
        """Intercept instance creation (called when ClassName(...) is invoked)."""
        print(f"[TrackedMeta] Creating instance of {cls.__name__}")
        instance = super().__call__(*args, **kwargs)
        return instance
    
    @classmethod
    def get_registry(mcs) -> dict:
        return dict(mcs._registry)


class Base(metaclass=TrackedMeta):
    pass

class Animal(Base):
    def __init__(self, name: str):
        self.name = name
    def speak(self): return f"{self.name} speaks"

class Dog(Animal):
    def speak(self): return f"{self.name}: Woof!"

print(f"\\nRegistry: {list(TrackedMeta.get_registry().keys())}")
print(f"Animal._created_by: {Animal._created_by}")
print(f"Dog._registry_name: {Dog._registry_name}")

dog = Dog("Rex")
print(f"dog.speak(): {dog.speak()}")

# --- __init_subclass__: simpler than metaclass for most use cases ---
class PluginBase:
    """Base class that automatically registers subclasses."""
    
    _plugins: dict[str, type] = {}
    
    def __init_subclass__(cls, plugin_name: str = None, **kwargs):
        """Called automatically when this class is subclassed."""
        super().__init_subclass__(**kwargs)
        name = plugin_name or cls.__name__.lower()
        PluginBase._plugins[name] = cls
        print(f"[PluginBase] Registered plugin: {name} -> {cls.__name__}")
    
    @classmethod
    def get_plugin(cls, name: str) -> type:
        if name not in cls._plugins:
            raise KeyError(f"No plugin: {name}. Available: {list(cls._plugins)}")
        return cls._plugins[name]

class CSVPlugin(PluginBase, plugin_name="csv"):
    def process(self, data): return f"Processing CSV: {len(data)} records"

class JSONPlugin(PluginBase, plugin_name="json"):
    def process(self, data): return f"Processing JSON: {len(data)} records"

class XMLPlugin(PluginBase):  # Uses class name as key
    def process(self, data): return f"Processing XML: {len(data)} records"

print(f"\\nRegistered plugins: {list(PluginBase._plugins.keys())}")
plugin = PluginBase.get_plugin("json")()
print(f"Plugin result: {plugin.process([1, 2, 3])}")

print("\\nMetaclasses mastered!")`
    },
    {
      "type": "h2",
      "text": "Descriptors: __get__, __set__, __delete__"
    },
    {
      "type": "p",
      "text": "A descriptor is any object that defines __get__, __set__, or __delete__. When a descriptor is assigned as a class attribute, Python calls its methods for every attribute access on instances of that class. This is the mechanism behind @property, @classmethod, @staticmethod, and all ORMs. Understanding descriptors explains how Python attribute access really works."
    },
    {
      "type": "code-block",
      "label": "Descriptors — The Machinery Behind @property",
      "code": `# === DESCRIPTORS ===

# --- What is a descriptor? ---
# Any class that defines __get__, __set__, or __delete__
# When stored as a CLASS attribute, it intercepts instance attribute access

class LoggedAttribute:
    """Descriptor that logs every get and set."""
    
    def __set_name__(self, owner: type, name: str) -> None:
        """Called when descriptor is assigned to a class attribute.
        owner = the class it's being assigned to
        name = the attribute name"""
        self._name = name
        self._storage_name = f'_{name}'  # Where we store the actual value
        print(f"[LoggedAttribute] Registered '{name}' on {owner.__name__}")
    
    def __get__(self, obj, objtype=None):
        """Called on attribute READ: obj.name
        obj = the instance (None if accessed on the class)
        objtype = the class"""
        if obj is None:
            return self  # Return descriptor itself when accessed on class
        value = getattr(obj, self._storage_name, None)
        print(f"[GET] {type(obj).__name__}.{self._name} = {value!r}")
        return value
    
    def __set__(self, obj, value) -> None:
        """Called on attribute WRITE: obj.name = value"""
        print(f"[SET] {type(obj).__name__}.{self._name} = {value!r}")
        setattr(obj, self._storage_name, value)
    
    def __delete__(self, obj) -> None:
        """Called on attribute DELETE: del obj.name"""
        print(f"[DEL] {type(obj).__name__}.{self._name}")
        try:
            delattr(obj, self._storage_name)
        except AttributeError:
            pass


class ValidatedFloat:
    """Descriptor with validation and range checking."""
    
    def __init__(self, min_val: float = None, max_val: float = None):
        self._min = min_val
        self._max = max_val
        self._name = None
    
    def __set_name__(self, owner, name):
        self._name = name
        self._storage = f'_{owner.__name__}_{name}'
    
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self._storage, None)
    
    def __set__(self, obj, value: float) -> None:
        value = float(value)
        if self._min is not None and value < self._min:
            raise ValueError(f"{self._name} must be >= {self._min}, got {value}")
        if self._max is not None and value > self._max:
            raise ValueError(f"{self._name} must be <= {self._max}, got {value}")
        setattr(obj, self._storage, value)


# --- Using descriptors ---
class Person:
    name = LoggedAttribute()   # Descriptor assigned as CLASS attribute
    age = LoggedAttribute()    # Another descriptor
    score = ValidatedFloat(0, 100)

print("Creating Person:")
p = Person()
p.name = "Alice"
p.age = 30
p.score = 95.5

print(f"\\nReading:")
print(f"  name: {p.name}")
print(f"  age: {p.age}")
print(f"  score: {p.score}")

try:
    p.score = 150  # Triggers validation
except ValueError as e:
    print(f"\\nValidation: {e}")

# --- @property IS a descriptor ---
# property is a built-in descriptor class
# This:
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0: raise ValueError("Radius must be non-negative")
        self._radius = value
    
    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

# Is exactly equivalent to:
class CircleManual:
    def __init__(self, radius):
        self._radius = radius
    
    def _get_radius(self): return self._radius
    def _set_radius(self, v):
        if v < 0: raise ValueError
        self._radius = v
    
    radius = property(_get_radius, _set_radius)
    
    def _get_area(self):
        import math
        return math.pi * self._radius ** 2
    
    area = property(_get_area)

c = Circle(5)
print(f"\\nCircle area: {c.area:.2f}")
print(f"type(Circle.radius): {type(Circle.radius)}")  # <class 'property'>

# property IS a descriptor
print(f"hasattr(property, '__get__'): {hasattr(property, '__get__')}")
print(f"hasattr(property, '__set__'): {hasattr(property, '__set__')}")

print("\\nDescriptors mastered!")`
    },
    {
      "type": "h2",
      "text": "__slots__: Memory Optimization and Attribute Restriction"
    },
    {
      "type": "p",
      "text": "__slots__ replaces the per-instance __dict__ with a fixed-layout C array of slot descriptors. Each slot holds exactly one attribute value. The result: 40-60% less memory per instance (no dict overhead), faster attribute access (C array vs hash table lookup), and automatic prevention of unexpected attributes."
    },
    {
      "type": "code-block",
      "label": "__slots__ — Memory Layout and Performance",
      "code": `# === __slots__ ===
import sys

# Without __slots__: each instance has a __dict__
class PointDict:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# With __slots__: no __dict__, fixed layout
class PointSlots:
    __slots__ = ('x', 'y')
    def __init__(self, x, y):
        self.x = x
        self.y = y

# Memory comparison
p_dict = PointDict(1.0, 2.0)
p_slot = PointSlots(1.0, 2.0)

print(f"Without __slots__: {sys.getsizeof(p_dict)} bytes + {sys.getsizeof(p_dict.__dict__)} bytes (dict)")
print(f"With __slots__:    {sys.getsizeof(p_slot)} bytes (no dict)")

# Cannot add unexpected attributes
p_dict.z = 3.0  # Works fine (dict accepts anything)
try:
    p_slot.z = 3.0  # AttributeError!
except AttributeError as e:
    print(f"\\nSlots restriction: {e}")

# No __dict__ (unless 'dict' in __slots__ or inherited)
print(f"\\nPointDict has __dict__: {hasattr(p_dict, '__dict__')}")
print(f"PointSlots has __dict__: {hasattr(p_slot, '__dict__')}")

# --- Real-world performance test ---
N = 100_000
import time

start = time.perf_counter()
points_dict = [PointDict(i, i+1) for i in range(N)]
dict_time = time.perf_counter() - start
dict_mem = sum(sys.getsizeof(p) + sys.getsizeof(p.__dict__) for p in points_dict[:100]) * N // 100

start = time.perf_counter()
points_slot = [PointSlots(i, i+1) for i in range(N)]
slot_time = time.perf_counter() - start
slot_mem = sum(sys.getsizeof(p) for p in points_slot[:100]) * N // 100

print(f"\\n{N:,} instances:")
print(f"  __dict__: {dict_time*1000:.1f}ms, ~{dict_mem//1024}KB")
print(f"  __slots__: {slot_time*1000:.1f}ms, ~{slot_mem//1024}KB")
print(f"  Memory ratio: {dict_mem/slot_mem:.1f}x")

# --- __slots__ with inheritance ---
class Animal:
    __slots__ = ('name', 'age')
    def __init__(self, name, age):
        self.name = name
        self.age = age

class Dog(Animal):
    __slots__ = ('breed',)  # Only new slots — parent slots inherited
    def __init__(self, name, age, breed):
        super().__init__(name, age)
        self.breed = breed

dog = Dog("Rex", 3, "Labrador")
print(f"\\nDog: name={dog.name}, age={dog.age}, breed={dog.breed}")

# --- When to use __slots__ ---
# USE: data classes with millions of instances (Points, Vectors, Records)
# USE: when attribute restriction is a feature (immutable-ish objects)
# USE: performance-critical inner loops
# AVOID: when you need dynamic attributes or __dict__ for other reasons
# AVOID: when pickling (needs careful __getstate__/__setstate__)
# AVOID: in mixins (slots interact badly with multiple inheritance)

# --- Combining __slots__ with a data class style ---
class Vector3D:
    __slots__ = ('_x', '_y', '_z')
    
    def __init__(self, x, y, z):
        self._x, self._y, self._z = float(x), float(y), float(z)
    
    @property
    def x(self): return self._x
    @property
    def y(self): return self._y
    @property
    def z(self): return self._z
    
    def __repr__(self): return f"Vector3D({self._x}, {self._y}, {self._z})"
    def __add__(self, other): return Vector3D(self._x+other._x, self._y+other._y, self._z+other._z)
    def magnitude(self):
        import math
        return math.sqrt(self._x**2 + self._y**2 + self._z**2)

v = Vector3D(1, 2, 3)
print(f"\\nVector3D: {v}, magnitude={v.magnitude():.3f}")
print(f"Memory: {sys.getsizeof(v)} bytes")
print("\\n__slots__ mastered!")`
    },
    {
      "type": "h2",
      "text": "Four Complete Programs"
    },
    {
      "type": "code-block",
      "label": "Programs 1 & 2: Singleton Metaclass and Validated Descriptor",
      "code": `# === PROGRAM 1: SINGLETON METACLASS ===
import threading

class SingletonMeta(type):
    """Thread-safe Singleton metaclass.
    Classes using this metaclass will only ever have one instance."""
    
    _instances: dict[type, object] = {}
    _lock = threading.Lock()
    
    def __call__(cls, *args, **kwargs):
        """Intercept instance creation."""
        if cls not in cls._instances:
            with cls._lock:  # Double-checked locking for thread safety
                if cls not in cls._instances:
                    instance = super().__call__(*args, **kwargs)
                    cls._instances[cls] = instance
                    print(f"[Singleton] Created first instance of {cls.__name__}")
        else:
            print(f"[Singleton] Returning existing instance of {cls.__name__}")
        return cls._instances[cls]
    
    def clear_instance(cls) -> None:
        """Allow resetting (useful in tests)."""
        cls._instances.pop(cls, None)


class DatabaseConnection(metaclass=SingletonMeta):
    def __init__(self, url: str = "localhost:5432"):
        self.url = url
        self.connected = False
        self._query_count = 0
    
    def connect(self):
        self.connected = True
        return self
    
    def query(self, sql: str) -> str:
        self._query_count += 1
        return f"[{self._query_count}] {sql} -> results"

class AppConfig(metaclass=SingletonMeta):
    def __init__(self):
        self._config = {
            'debug': False,
            'version': '1.0.0',
            'max_connections': 10,
        }
    def get(self, key, default=None): return self._config.get(key, default)
    def set(self, key, value): self._config[key] = value

print("SINGLETON DEMO")
db1 = DatabaseConnection("postgres://prod:5432")
db2 = DatabaseConnection("postgres://prod:5432")
print(f"db1 is db2: {db1 is db2}")  # True
db1.connect()
print(f"db2.connected: {db2.connected}")  # True — same object!
print(db1.query("SELECT * FROM users"))
print(db2.query("SELECT count(*) FROM orders"))  # Shared counter
print(f"Total queries: {db1._query_count}")

# === PROGRAM 2: VALIDATED ATTRIBUTE DESCRIPTOR ===
class Validator:
    """Base descriptor for validated attributes."""
    
    def __set_name__(self, owner, name):
        self._name = name
        self._attr = f'_{owner.__name__}_{name}'
    
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self._attr, self.default)
    
    def __set__(self, obj, value):
        self.validate(value)
        setattr(obj, self._attr, self.transform(value))
    
    @property
    def default(self): return None
    def validate(self, value): pass
    def transform(self, value): return value

class TypedField(Validator):
    def __init__(self, expected_type, default=None):
        self._type = expected_type
        self._default = default
    @property
    def default(self): return self._default
    def validate(self, v):
        if not isinstance(v, self._type):
            raise TypeError(f"{self._name} must be {self._type.__name__}, got {type(v).__name__}")
    def transform(self, v): return v

class RangedFloat(Validator):
    def __init__(self, min_val=None, max_val=None, default=0.0):
        self._min, self._max, self._default = min_val, max_val, default
    @property
    def default(self): return self._default
    def validate(self, v):
        v = float(v)
        if self._min is not None and v < self._min:
            raise ValueError(f"{self._name} must be >= {self._min}")
        if self._max is not None and v > self._max:
            raise ValueError(f"{self._name} must be <= {self._max}")
    def transform(self, v): return float(v)

class StringField(Validator):
    def __init__(self, min_len=0, max_len=None, strip=True, default=""):
        self._min, self._max, self._strip, self._default = min_len, max_len, strip, default
    @property
    def default(self): return self._default
    def validate(self, v):
        if not isinstance(v, str): raise TypeError(f"{self._name} must be a string")
        s = v.strip() if self._strip else v
        if len(s) < self._min: raise ValueError(f"{self._name} too short (min {self._min})")
        if self._max and len(s) > self._max: raise ValueError(f"{self._name} too long (max {self._max})")
    def transform(self, v): return v.strip() if self._strip else v

class Employee:
    name = StringField(min_len=2, max_len=50)
    age = RangedFloat(min_val=16, max_val=100, default=0)
    salary = RangedFloat(min_val=0, default=0)
    department = TypedField(str, default="General")
    
    def __init__(self, name, age, salary, department="Engineering"):
        self.name = name
        self.age = age
        self.salary = salary
        self.department = department
    
    def __repr__(self):
        return f"Employee({self.name!r}, age={self.age}, salary={self.salary:.0f})"

print("\\nVALIDATED DESCRIPTOR DEMO")
emp = Employee("  Alice Johnson  ", 28, 85000)
print(f"Created: {emp}")
print(f"Name (stripped): '{emp.name}'")

try: Employee("X", 25, 50000)
except ValueError as e: print(f"Name error: {e}")
try: Employee("Bob", 15, 50000)
except ValueError as e: print(f"Age error: {e}")
try: Employee("Carol", 25, -1000)
except ValueError as e: print(f"Salary error: {e}")`
    },
    {
      "type": "code-block",
      "label": "Programs 3 & 4: ORM-like Field System and Memory-Efficient Class",
      "code": `# === PROGRAM 3: ORM-LIKE FIELD SYSTEM ===
from typing import Any, Optional, Type

class Field:
    """Base field descriptor for ORM-like model system."""
    
    def __init__(self, field_type: type, required: bool = True,
                 default: Any = None, db_column: str = None):
        self.field_type = field_type
        self.required = required
        self.default = default
        self.db_column = db_column
        self._name = None
    
    def __set_name__(self, owner, name):
        self._name = name
        self.db_column = self.db_column or name
        # Register field with the model class
        if not hasattr(owner, '_fields'):
            owner._fields = {}
        owner._fields[name] = self
    
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return obj.__dict__.get(f'_field_{self._name}', self.default)
    
    def __set__(self, obj, value):
        if value is None and self.required:
            raise ValueError(f"Field '{self._name}' is required")
        if value is not None and not isinstance(value, self.field_type):
            try:
                value = self.field_type(value)
            except (ValueError, TypeError):
                raise TypeError(f"Field '{self._name}' expected {self.field_type.__name__}")
        obj.__dict__[f'_field_{self._name}'] = value

class IntField(Field):
    def __init__(self, required=True, default=None, min_val=None, max_val=None, **kwargs):
        super().__init__(int, required, default, **kwargs)
        self.min_val, self.max_val = min_val, max_val
    def __set__(self, obj, value):
        super().__set__(obj, value)
        v = self.__get__(obj, None)
        if v is not None:
            if self.min_val is not None and v < self.min_val:
                raise ValueError(f"'{self._name}' must be >= {self.min_val}")
            if self.max_val is not None and v > self.max_val:
                raise ValueError(f"'{self._name}' must be <= {self.max_val}")

class StringField(Field):
    def __init__(self, required=True, default=None, max_length=None, **kwargs):
        super().__init__(str, required, default, **kwargs)
        self.max_length = max_length
    def __set__(self, obj, value):
        super().__set__(obj, value)
        v = self.__get__(obj, None)
        if v is not None and self.max_length and len(v) > self.max_length:
            raise ValueError(f"'{self._name}' exceeds max length {self.max_length}")

class ModelMeta(type):
    """Metaclass for Model that collects field definitions."""
    def __new__(mcs, name, bases, namespace, **kwargs):
        if not hasattr(namespace.get('__class__', None), '_fields'):
            namespace.setdefault('_fields', {})
        cls = super().__new__(mcs, name, bases, namespace)
        # Collect inherited fields
        all_fields = {}
        for base in reversed(cls.__mro__[1:]):
            if hasattr(base, '_fields'):
                all_fields.update(base._fields)
        all_fields.update(getattr(cls, '_fields', {}))
        cls._fields = all_fields
        return cls

class Model(metaclass=ModelMeta):
    """Base ORM-like model."""
    
    def __init__(self, **kwargs):
        for name, field in self._fields.items():
            value = kwargs.get(name, field.default)
            if field.required and value is None and name not in kwargs:
                raise ValueError(f"Required field '{name}' not provided")
            setattr(self, name, value)
    
    def to_dict(self) -> dict:
        return {name: getattr(self, name) for name in self._fields}
    
    def to_sql_insert(self) -> str:
        data = self.to_dict()
        cols = ', '.join(f.db_column for f in self._fields.values())
        vals = ', '.join(repr(data[n]) for n in self._fields)
        return f"INSERT INTO {type(self).__name__.lower()} ({cols}) VALUES ({vals});"
    
    def __repr__(self):
        fields = ', '.join(f"{k}={getattr(self, k)!r}" for k in self._fields)
        return f"{type(self).__name__}({fields})"

class User(Model):
    id = IntField(required=False, default=None)
    username = StringField(max_length=30)
    email = StringField(max_length=100)
    age = IntField(min_val=0, max_val=150, required=False, default=0)

print("ORM-LIKE FIELD SYSTEM DEMO")
u = User(username="alice_codes", email="alice@example.com", age=28)
print(f"User: {u}")
print(f"Dict: {u.to_dict()}")
print(f"SQL:  {u.to_sql_insert()}")
print(f"Fields: {list(User._fields.keys())}")

try: User(username="x" * 50, email="test@test.com")
except ValueError as e: print(f"Validation: {e}")

# === PROGRAM 4: MEMORY-EFFICIENT CLASS WITH __slots__ ===
import sys

class Particle:
    """Memory-efficient particle for physics simulation."""
    __slots__ = ('x', 'y', 'z', 'vx', 'vy', 'vz', 'mass', 'charge', 'name')
    
    def __init__(self, x, y, z, vx=0, vy=0, vz=0, mass=1.0, charge=0.0, name="particle"):
        self.x, self.y, self.z = float(x), float(y), float(z)
        self.vx, self.vy, self.vz = float(vx), float(vy), float(vz)
        self.mass, self.charge, self.name = float(mass), float(charge), name
    
    def update(self, dt: float, fx=0, fy=0, fz=0):
        """Update position and velocity."""
        ax, ay, az = fx/self.mass, fy/self.mass, fz/self.mass
        self.vx += ax * dt; self.vy += ay * dt; self.vz += az * dt
        self.x += self.vx * dt; self.y += self.vy * dt; self.z += self.vz * dt
    
    def kinetic_energy(self) -> float:
        import math
        v2 = self.vx**2 + self.vy**2 + self.vz**2
        return 0.5 * self.mass * v2
    
    def distance_to(self, other: 'Particle') -> float:
        import math
        return math.sqrt((self.x-other.x)**2 + (self.y-other.y)**2 + (self.z-other.z)**2)
    
    def __repr__(self): return f"Particle({self.name!r}, pos=({self.x:.2f},{self.y:.2f},{self.z:.2f}))"

N = 50000
import time

start = time.perf_counter()
particles = [Particle(i*0.1, i*0.2, i*0.3, mass=1.0+i*0.01) for i in range(N)]
create_time = time.perf_counter() - start
mem = sum(sys.getsizeof(p) for p in particles[:1000]) * N // 1000

print(f"\\nMEMORY-EFFICIENT PARTICLE DEMO")
print(f"Created {N:,} particles in {create_time*1000:.1f}ms")
print(f"Memory per particle: {sys.getsizeof(particles[0])} bytes")
print(f"Total estimated: {mem // 1024}KB")
print(f"No __dict__: {not hasattr(particles[0], '__dict__')}")

for p in particles[:100]:
    p.update(0.016, fy=-9.8*p.mass)

print(f"\\nAfter physics step:")
print(f"  {particles[0]}")
print(f"  kinetic_energy: {particles[0].kinetic_energy():.4f}J")
print(f"  distance to next: {particles[0].distance_to(particles[1]):.4f}m")

print("\\nAll programs complete!")`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is the relationship between type, classes, and instances? Print type(42), type(int), type(type) and explain each result. Create a class dynamically using type() with two methods.",
        "Q2: What is the difference between __new__ and __init__? In which scenarios would you override __new__? Write a metaclass __new__ that rejects any class definition containing methods starting with 'do_'.",
        "Q3: Implement a descriptor that caches computed values. The first access calls a supplied function, subsequent accesses return the cached value. Use it to cache an expensive property.",
        "Q4: What are __slots__? List three benefits and two limitations. Write a benchmark comparing memory usage of a class with and without __slots__ for 1 million instances.",
        "Q5: Explain how @property works as a descriptor. Implement your own property class from scratch using __get__, __set__, __delete__ that behaves identically to the built-in property."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: type(42) = int — 42 is an instance of the int class. type(int) = type — int is an instance of the type metaclass. type(type) = type — type is its own metaclass (the root of the metaclass hierarchy). Everything is an object; every class is an instance of type. Dynamic class: MyClass = type('MyClass', (object,), {'greet': lambda self: 'Hello', 'farewell': lambda self: 'Goodbye'}); obj = MyClass(); obj.greet() returns 'Hello'. A2: __new__ creates the object (allocates memory, returns the instance); __init__ initializes it (sets attributes). __init__ receives the already-created instance; __new__ receives the class. Override __new__ when: implementing Singleton (return existing instance), creating immutable objects (tuple/str subclasses, since you cannot change values in __init__ after __new__), or in metaclasses to intercept class creation. Metaclass __new__ that rejects do_ methods: in __new__, check if any key in namespace starts with 'do_' and raise TypeError if found. A3: class CachedProperty: def __init__(self, fn): self._fn = fn; self._name = None. def __set_name__(self, owner, name): self._name = name. def __get__(self, obj, objtype=None): if obj is None: return self; cache_key = f'_cache_{self._name}'; if not hasattr(obj, cache_key): setattr(obj, cache_key, self._fn(obj)); return getattr(obj, cache_key). Usage: @CachedProperty def expensive(self): time.sleep(1); return 42. First call takes 1 second; subsequent calls are instant. A4: Benefits: 40-60% less memory (no per-instance __dict__), faster attribute access (C array vs hash table), prevents accidental attribute creation. Limitations: cannot add arbitrary attributes, complex with multiple inheritance (each class must declare only new slots), pickling requires __getstate__/__setstate__, weakref requires adding '__weakref__' to slots. Benchmark: class With: __slots__ = ('x',); class Without: pass. [With() for _ in range(1_000_000)] vs [Without() for _ in range(1_000_000)]. A5: class property: def __init__(self, fget=None, fset=None, fdel=None, doc=None): self.fget=fget; self.fset=fset; self.fdel=fdel; self.__doc__=doc. def __get__(self, obj, objtype=None): if obj is None: return self; if self.fget is None: raise AttributeError; return self.fget(obj). def __set__(self, obj, value): if self.fset is None: raise AttributeError('read-only'); self.fset(obj, value). def __delete__(self, obj): if self.fdel is None: raise AttributeError; self.fdel(obj). def setter(self, fset): return type(self)(self.fget, fset, self.fdel, self.__doc__). def deleter(self, fdel): return type(self)(self.fget, self.fset, fdel, self.__doc__)."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: type is the metaclass of all classes — the factory that creates classes themselves. Metaclasses let you intercept and modify class creation, enabling patterns like Singleton, automatic registration, and ORM field collection. Descriptors (__get__, __set__, __delete__) are the mechanism behind @property, @classmethod, and every ORM attribute. __slots__ replaces the per-instance __dict__ with a fixed memory layout — 40-60% memory savings for data-heavy classes. These are the tools that power Python's most sophisticated frameworks. In Part 29, we explore the Standard Library treasure hunt — the modules so well-designed they belong in your toolkit forever."
    },
    {
      "type": "cta",
      "text": "Start Part 29: Standard Library Treasure Hunt →",
      "href": "/tutorials/python-unlocked/part-29-standard-library",
      "note": "30 min read · collections · itertools · functools · dataclasses · enum · CLI project"
    }
  ]
};

export default post;
