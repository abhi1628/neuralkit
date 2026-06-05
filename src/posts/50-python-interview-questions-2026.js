const post = {
  "slug": "50-python-interview-questions-2026",
  "title": "50 Python Interview Questions You Must Know in 2026 — From FAANG to Startups",
  "date": "June 5, 2026",
  "readTime": "25 min read",
  "category": "Python",
  "categoryColor": "#306998",
  "excerpt": "The 50 most-asked Python interview questions in 2026, complete with clean code, real company names, and battle-tested explanations. Whether you're interviewing at Google, Meta, Amazon, or a fast-growing startup, this guide has you covered.",
  "coverEmoji": "🐍",
  "tags": [
    "Python",
    "Interview Prep",
    "FAANG",
    "Coding",
    "Data Structures",
    "Algorithms",
    "System Design"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Python is the most interviewed language in tech — and also the most underestimated. Candidates walk into interviews thinking they know Python because they can write a for-loop, then get demolished by questions about the GIL, decorator internals, or why mutable default arguments are a trap. In 2026, Python interviews have evolved. Companies don't just test syntax; they test your mental model of how Python actually works under the hood. This guide covers 50 questions that have been asked at Google, Meta, Amazon, Netflix, Spotify, Stripe, and hundreds of startups. Each question includes clean, runnable code and a clear explanation of why the answer matters."
    },
    {
      "type": "h2",
      "text": "Part 1: Core Python Fundamentals (Questions 1-10)"
    },
    {
      "type": "p",
      "text": "These questions test whether you understand Python at a conceptual level, not just syntax. They appear in every interview round, from phone screens to on-sites."
    },
    {
      "type": "h2",
      "text": "Q1: What is the difference between `is` and `==`?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Amazon, Stripe. This is the #1 trick question in Python interviews. `==` checks value equality. `is` checks identity — whether two variables point to the exact same object in memory. For small integers and short strings, Python caches objects, so `is` might accidentally work. But for lists, dicts, or custom objects, it will fail."
    },
    {
      "type": "code-block",
      "label": "is vs ==",
      "code": "a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b)   # True  → same values\nprint(a is b)   # False → different objects in memory\n\n# Python caches small integers (-5 to 256)\nx = 100\ny = 100\nprint(x is y)   # True  → same cached object\n\n# But not larger ones\nx = 1000\ny = 1000\nprint(x is y)   # False → different objects"
    },
    {
      "type": "h2",
      "text": "Q2: Why are mutable default arguments dangerous?"
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Netflix, Spotify. This is the most famous Python gotcha. Default arguments are evaluated once when the function is defined, not each time it's called. So a mutable default (like a list or dict) is shared across all calls."
    },
    {
      "type": "code-block",
      "label": "Mutable Default Argument Trap",
      "code": "# DANGEROUS: Default list is shared across all calls\ndef append_item(item, items=[]):\n    items.append(item)\n    return items\n\nprint(append_item(1))  # [1]\nprint(append_item(2))  # [1, 2]  ← Surprise! Old data persists\n\n# SAFE: Use None and create a new list inside\ndef safe_append(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items\n\nprint(safe_append(1))  # [1]\nprint(safe_append(2))  # [2]  ← Fresh list every time"
    },
    {
      "type": "h2",
      "text": "Q3: Explain `*args` and `**kwargs` with a real example."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Google, Uber. `*args` collects positional arguments into a tuple. `**kwargs` collects keyword arguments into a dict. This pattern is essential for building flexible APIs, decorators, and wrapper functions."
    },
    {
      "type": "code-block",
      "label": "args and kwargs",
      "code": "def flexible_function(required, *args, **kwargs):\n    print(f'Required: {required}')\n    print(f'Positional extras: {args}')       # tuple\n    print(f'Keyword extras: {kwargs}')        # dict\n\nflexible_function('hello', 1, 2, 3, name='Alice', age=30)\n# Output:\n# Required: hello\n# Positional extras: (1, 2, 3)\n# Keyword extras: {'name': 'Alice', 'age': 30}\n\n# Real-world use: forwarding all arguments to another function\ndef logged_wrapper(func, *args, **kwargs):\n    print(f'Calling {func.__name__}')\n    return func(*args, **kwargs)"
    },
    {
      "type": "h2",
      "text": "Q4: What is a Python decorator and how does it work internally?"
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Google, Stripe, Airbnb. A decorator is a function that takes another function as input, adds behavior, and returns a new function. They're used for logging, authentication, caching, and rate limiting."
    },
    {
      "type": "code-block",
      "label": "Decorator Internals",
      "code": "import functools\nimport time\n\ndef timing_decorator(func):\n    @functools.wraps(func)  # Preserves original function metadata\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        elapsed = time.time() - start\n        print(f'{func.__name__} took {elapsed:.4f}s')\n        return result\n    return wrapper\n\n@timing_decorator\ndef slow_add(a, b):\n    time.sleep(0.1)\n    return a + b\n\nprint(slow_add(2, 3))  # slow_add took 0.1012s → 5\n\n# Without @functools.wraps, slow_add.__name__ would be 'wrapper'\nprint(slow_add.__name__)  # 'slow_add' (preserved by wraps)"
    },
    {
      "type": "h2",
      "text": "Q5: What is the GIL and why does it matter?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Netflix, Dropbox. The Global Interpreter Lock (GIL) is a mutex that prevents multiple native threads from executing Python bytecode simultaneously. It means threads in Python are great for I/O-bound tasks (network, file) but useless for CPU-bound parallelism. For true CPU parallelism, you need multiprocessing or C extensions."
    },
    {
      "type": "code-block",
      "label": "GIL Demonstration",
      "code": "import threading\nimport multiprocessing\nimport time\n\ndef count(n):\n    while n > 0:\n        n -= 1\n\n# Threading: Both threads run on one core due to GIL\nstart = time.time()\nt1 = threading.Thread(target=count, args=(50_000_000,))\nt2 = threading.Thread(target=count, args=(50_000_000,))\nt1.start(); t2.start()\nt1.join(); t2.join()\nprint(f'Threading: {time.time() - start:.2f}s')  # ~6s (same as sequential)\n\n# Multiprocessing: Each process gets its own Python interpreter and GIL\nstart = time.time()\np1 = multiprocessing.Process(target=count, args=(50_000_000,))\np2 = multiprocessing.Process(target=count, args=(50_000_000,))\np1.start(); p2.start()\np1.join(); p2.join()\nprint(f'Multiprocessing: {time.time() - start:.2f}s')  # ~3s (half the time!)"
    },
    {
      "type": "h2",
      "text": "Q6: Explain list comprehensions vs generator expressions."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Spotify, Robinhood. List comprehensions create the entire list in memory. Generator expressions yield items one at a time, making them memory-efficient for large datasets."
    },
    {
      "type": "code-block",
      "label": "List Comprehension vs Generator",
      "code": "import sys\n\n# List comprehension: builds entire list in memory\nsquares_list = [x**2 for x in range(1_000_000)]\nprint(f'List size: {sys.getsizeof(squares_list):,} bytes')  # ~8.5 MB\n\n# Generator expression: yields one item at a time\nsquares_gen = (x**2 for x in range(1_000_000))\nprint(f'Generator size: {sys.getsizeof(squares_gen):,} bytes')  # ~112 bytes\n\n# Generators are single-use iterators\nprint(sum(squares_gen))  # Works\nprint(sum(squares_gen))  # 0 → already exhausted!\n\n# Use case: processing massive files line-by-line without loading into memory\ndef process_large_file(path):\n    return (line.strip() for line in open(path) if 'ERROR' in line)"
    },
    {
      "type": "h2",
      "text": "Q7: What are Python's key data types and when do you use each?"
    },
    {
      "type": "p",
      "text": "Asked at: Every company. This tests whether you understand the trade-offs between mutability, ordering, and lookup speed."
    },
    {
      "type": "checklist",
      "items": [
        "list: Ordered, mutable, allows duplicates. Use for sequences where you need to modify elements. O(1) append, O(n) lookup.",
        "tuple: Ordered, immutable, allows duplicates. Use for fixed collections (coordinates, DB records). Slightly faster than lists, hashable if contents are hashable.",
        "dict: Unordered (insertion-ordered in 3.7+), mutable, unique keys. O(1) average lookup. Use for mappings, caches, frequency counts.",
        "set: Unordered, mutable, unique elements. O(1) membership testing. Use for deduplication, intersection/union operations.",
        "frozenset: Immutable set. Hashable, so can be used as dict keys or set elements."
      ]
    },
    {
      "type": "h2",
      "text": "Q8: What is the difference between `deepcopy` and `shallow copy`?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Bloomberg. A shallow copy creates a new outer object but shares references to inner objects. A deep copy recursively copies everything, creating fully independent objects."
    },
    {
      "type": "code-block",
      "label": "Shallow vs Deep Copy",
      "code": "import copy\n\noriginal = [[1, 2], [3, 4]]\n\n# Shallow copy: new outer list, same inner lists\nshallow = copy.copy(original)\nshallow[0][0] = 99\nprint(original)  # [[99, 2], [3, 4]] ← Original changed!\n\n# Deep copy: completely independent\noriginal = [[1, 2], [3, 4]]\ndeep = copy.deepcopy(original)\ndeep[0][0] = 99\nprint(original)  # [[1, 2], [3, 4]] ← Original unchanged\n\n# Slicing and list() also create shallow copies\na = [[1, 2], [3]]\nb = a[:]        # shallow copy\nc = list(a)     # shallow copy\nprint(b[0] is a[0])  # True → same inner object"
    },
    {
      "type": "h2",
      "text": "Q9: Explain `pass`, `continue`, and `break` with a combined example."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Microsoft, Palantir. These control flow statements are basic but frequently misused in interviews."
    },
    {
      "type": "code-block",
      "label": "pass, continue, break",
      "code": "def process_records(records):\n    for record in records:\n        if not record:\n            pass  # Placeholder: do nothing, keep iterating\n            \n        if record.get('skip'):\n            continue  # Skip to next iteration immediately\n            \n        if record.get('fatal_error'):\n            break  # Exit the loop entirely\n            \n        process(record)\n\n# Real-world: placeholder for unimplemented feature\ndef future_feature():\n    pass  # Syntax requires a body, but logic isn't ready yet"
    },
    {
      "type": "h2",
      "text": "Q10: What are context managers and why use `with` statements?"
    },
    {
      "type": "p",
      "text": "Asked at: Stripe, Netflix, Airbnb. Context managers ensure resources are properly acquired and released, even if exceptions occur. They're used for files, database connections, locks, and network sessions."
    },
    {
      "type": "code-block",
      "label": "Custom Context Manager",
      "code": "from contextlib import contextmanager\nimport time\n\n# Method 1: Class-based\nclass DatabaseConnection:\n    def __enter__(self):\n        print('Opening DB connection...')\n        self.conn = 'connection_object'\n        return self.conn\n    \n    def __exit__(self, exc_type, exc_val, exc_tb):\n        print('Closing DB connection...')\n        # Return True to suppress exception, False to propagate\n        return False\n\n# Method 2: Decorator-based (cleaner for simple cases)\n@contextmanager\ndef timed_execution(label):\n    start = time.time()\n    try:\n        yield  # This is where the 'with' block runs\n    finally:\n        print(f'{label}: {time.time() - start:.3f}s')\n\nwith timed_execution('Heavy computation'):\n    sum(range(10_000_000))  # 0.234s"
    },
    {
      "type": "h2",
      "text": "Part 2: Object-Oriented Python (Questions 11-20)"
    },
    {
      "type": "p",
      "text": "OOP questions separate junior developers from seniors. Companies want to see that you understand Python's object model, not just class syntax."
    },
    {
      "type": "h2",
      "text": "Q11: What is the difference between `@staticmethod`, `@classmethod`, and instance methods?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Amazon, Stripe. This is the most common OOP question in Python interviews."
    },
    {
      "type": "code-block",
      "label": "Method Types Compared",
      "code": "class User:\n    total_users = 0  # Class variable\n    \n    def __init__(self, name):\n        self.name = name  # Instance variable\n        User.total_users += 1\n    \n    def greet(self):           # Instance method → needs self\n        return f'Hello, {self.name}'\n    \n    @classmethod\n    def from_email(cls, email):  # Class method → operates on class\n        name = email.split('@')[0]\n        return cls(name)\n    \n    @staticmethod\n    def is_valid_email(email):   # Static method → utility, no self/cls\n        return '@' in email and '.' in email.split('@')[1]\n\n# Usage\nuser = User('Alice')\nprint(user.greet())                    # Hello, Alice\nprint(User.total_users)               # 1\n\nuser2 = User.from_email('bob@corp.com')\nprint(User.total_users)               # 2\n\nprint(User.is_valid_email('test'))    # False\nprint(User.is_valid_email('a@b.com')) # True"
    },
    {
      "type": "h2",
      "text": "Q12: What are Python metaclasses and when would you use them?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Dropbox. Metaclasses are the 'classes of classes.' They control how classes are created. 99% of developers never need them, but knowing they exist signals deep Python knowledge."
    },
    {
      "type": "code-block",
      "label": "Metaclass Example",
      "code": "class SingletonMeta(type):\n    '''Ensures only one instance of a class exists.'''\n    _instances = {}\n    \n    def __call__(cls, *args, **kwargs):\n        if cls not in cls._instances:\n            cls._instances[cls] = super().__call__(*args, **kwargs)\n        return cls._instances[cls]\n\nclass Database(metaclass=SingletonMeta):\n    def __init__(self, connection_string):\n        self.connection_string = connection_string\n\ndb1 = Database('postgres://localhost')\ndb2 = Database('mysql://remote')\nprint(db1 is db2)           # True → same instance!\nprint(db1.connection_string)  # postgres://localhost (first wins)"
    },
    {
      "type": "h2",
      "text": "Q13: Explain `__init__` vs `__new__` and when to override `__new__`."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Netflix. `__new__` creates the instance. `__init__` initializes it. You rarely override `__new__`, but it's essential for immutable types (like subclasses of tuple or str) or singleton patterns."
    },
    {
      "type": "code-block",
      "label": "new vs init",
      "code": "class ImmutablePoint(tuple):\n    '''Subclassing immutable tuple requires __new__'''\n    def __new__(cls, x, y):\n        return super().__new__(cls, (x, y))\n    \n    def __init__(self, x, y):\n        # __init__ runs AFTER object is created, so we can't modify tuple here\n        pass\n    \n    @property\n    def x(self):\n        return self[0]\n    \n    @property\n    def y(self):\n        return self[1]\n\np = ImmutablePoint(3, 4)\nprint(p.x, p.y)  # 3 4\n# p.x = 5  # TypeError: can't modify immutable tuple"
    },
    {
      "type": "h2",
      "text": "Q14: What is name mangling and how does it work?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Bloomberg. Double-underscore attributes (not single) trigger name mangling: `__attr` becomes `_ClassName__attr`. This prevents accidental name clashes in subclasses. It does NOT make attributes truly private."
    },
    {
      "type": "code-block",
      "label": "Name Mangling",
      "code": "class BankAccount:\n    def __init__(self):\n        self.__balance = 0  # Name-mangled to _BankAccount__balance\n    \n    def deposit(self, amount):\n        self.__balance += amount\n\nclass PremiumAccount(BankAccount):\n    def __init__(self):\n        super().__init__()\n        self.__balance = 1000  # _PremiumAccount__balance (different name!)\n\nacc = PremiumAccount()\nprint(acc._BankAccount__balance)   # 0   ← Original still exists\nprint(acc._PremiumAccount__balance)  # 1000 ← Subclass has its own\n\n# Moral: __ doesn't make it private, just harder to accidentally override"
    },
    {
      "type": "h2",
      "text": "Q15: What are magic (dunder) methods and give 5 examples?"
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Spotify, Stripe. Dunder methods let your classes behave like built-in types. They're the key to Pythonic OOP."
    },
    {
      "type": "code-block",
      "label": "Magic Methods in Action",
      "code": "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    \n    def __repr__(self):           # Official string representation\n        return f'Vector({self.x}, {self.y})'\n    \n    def __str__(self):            # Pretty print\n        return f'({self.x}, {self.y})'\n    \n    def __add__(self, other):     # + operator\n        return Vector(self.x + other.x, self.y + other.y)\n    \n    def __len__(self):            # len() support\n        return int((self.x**2 + self.y**2) ** 0.5)\n    \n    def __eq__(self, other):      # == operator\n        return self.x == other.x and self.y == other.y\n    \n    def __getitem__(self, idx):   # [] indexing\n        return [self.x, self.y][idx]\n\nv1 = Vector(1, 2)\nv2 = Vector(3, 4)\nprint(v1 + v2)        # Vector(4, 6)\nprint(len(v1))        # 2 (magnitude rounded)\nprint(v1 == Vector(1, 2))  # True\nprint(v1[0])          # 1"
    },
    {
      "type": "h2",
      "text": "Q16: What is the difference between class variables and instance variables?"
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Amazon, Microsoft. Class variables are shared across all instances. Instance variables are unique to each object. This is a common source of bugs when developers mutate class variables thinking they're instance-specific."
    },
    {
      "type": "code-block",
      "label": "Class vs Instance Variables",
      "code": "class User:\n    roles = []  # DANGER: Shared across all instances!\n    \n    def __init__(self, name):\n        self.name = name\n        self.permissions = []  # SAFE: Fresh list per instance\n\nu1 = User('Alice')\nu2 = User('Bob')\nu1.roles.append('admin')  # Modifies CLASS variable\nprint(u2.roles)  # ['admin'] ← Bob is now admin too! Surprise!\n\n# Correct pattern: class variable for defaults, instance for mutable state\nclass SafeUser:\n    default_role = 'guest'  # Immutable class variable\n    \n    def __init__(self, name):\n        self.name = name\n        self.roles = ['guest']  # Mutable instance variable\n\ns1 = SafeUser('Alice')\ns2 = SafeUser('Bob')\ns1.roles.append('admin')\nprint(s2.roles)  # ['guest'] ← Correctly isolated"
    },
    {
      "type": "h2",
      "text": "Q17: Explain multiple inheritance and the MRO (Method Resolution Order)."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Dropbox. Python uses C3 linearization for MRO. You can inspect it with `ClassName.__mro__`. The `super()` function follows the MRO, not just the parent class."
    },
    {
      "type": "code-block",
      "label": "MRO and Diamond Problem",
      "code": "class A:\n    def greet(self):\n        print('A')\n\nclass B(A):\n    def greet(self):\n        print('B')\n        super().greet()\n\nclass C(A):\n    def greet(self):\n        print('C')\n        super().greet()\n\nclass D(B, C):  # Diamond inheritance\n    pass\n\nd = D()\nd.greet()\n# Output: B → C → A (NOT B → A, because super() follows MRO)\n\nprint(D.__mro__)\n# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)\n\n# Key insight: super() doesn't mean 'call parent'\n# It means 'call next class in MRO'"
    },
    {
      "type": "h2",
      "text": "Q18: What are property decorators and why use them?"
    },
    {
      "type": "p",
      "text": "Asked at: Stripe, Robinhood. `@property` lets you define methods that are accessed like attributes, enabling computed properties, validation, and encapsulation without changing the public API."
    },
    {
      "type": "code-block",
      "label": "Property Decorator",
      "code": "class Temperature:\n    def __init__(self, celsius):\n        self._celsius = celsius\n    \n    @property\n    def celsius(self):\n        return self._celsius\n    \n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError('Below absolute zero!')\n        self._celsius = value\n    \n    @property\n    def fahrenheit(self):\n        return self._celsius * 9/5 + 32\n    \n    @fahrenheit.setter\n    def fahrenheit(self, value):\n        self.celsius = (value - 32) * 5/9  # Delegates to celsius setter\n\nt = Temperature(25)\nprint(t.fahrenheit)  # 77.0\nt.fahrenheit = 98.6\nprint(t.celsius)     # 37.0\n# t.celsius = -300  # ValueError: Below absolute zero!"
    },
    {
      "type": "h2",
      "text": "Q19: What is a Python closure and how does late binding work?"
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Google. A closure is a function that remembers variables from its enclosing scope. Late binding means closures capture variables by name, not by value, which creates a classic trap with loops."
    },
    {
      "type": "code-block",
      "label": "Closure and Late Binding",
      "code": "# The classic late-binding trap\nfuncs = []\nfor i in range(3):\n    funcs.append(lambda: i)\n\nprint([f() for f in funcs])  # [2, 2, 2] ← All use final value of i!\n\n# Fix: Capture current value as default argument\nfuncs = []\nfor i in range(3):\n    funcs.append(lambda i=i: i)  # i=i captures current value\n\nprint([f() for f in funcs])  # [0, 1, 2] ← Correct!\n\n# Real closure: function factory\ndef make_multiplier(n):\n    def multiplier(x):\n        return x * n  # n is 'remembered' from enclosing scope\n    return multiplier\n\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\nprint(double(5))  # 10\nprint(triple(5))  # 15"
    },
    {
      "type": "h2",
      "text": "Q20: Explain the difference between `__str__` and `__repr__`."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Spotify. `__repr__` is for developers — it should be unambiguous and ideally valid Python code. `__str__` is for users — it should be readable and pretty. If `__str__` is missing, `__repr__` is used as fallback."
    },
    {
      "type": "code-block",
      "label": "str vs repr",
      "code": "from datetime import datetime\n\nnow = datetime.now()\nprint(str(now))   # '2026-06-05 14:30:00.123456' → Human readable\nprint(repr(now))  # 'datetime.datetime(2026, 6, 5, 14, 30, 0, 123456)' → Exact, reproducible\n\n# Best practice: __repr__ should ideally be eval-able\nclass Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    \n    def __repr__(self):\n        return f'Point({self.x}, {self.y})'  # Can copy-paste into Python\n    \n    def __str__(self):\n        return f'({self.x}, {self.y})'  # Pretty for users\n\np = Point(3, 4)\nprint(repr(p))  # Point(3, 4)\nprint(str(p))   # (3, 4)"
    },
    {
      "type": "h2",
      "text": "Part 3: Data Structures & Algorithms (Questions 21-35)"
    },
    {
      "type": "p",
      "text": "These are the coding questions that make or break your interview. Every major tech company asks variants of these."
    },
    {
      "type": "h2",
      "text": "Q21: Two Sum — Find indices of two numbers that add to target."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Amazon, Meta, Apple, Netflix. The classic. Use a hash map for O(n) time."
    },
    {
      "type": "code-block",
      "label": "Two Sum",
      "code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))  # [0, 1]\n\n# Time: O(n) — single pass\n# Space: O(n) — hash map stores up to n elements\n# Why this works: We check if the complement exists before storing current,\n# ensuring we don't use the same element twice."
    },
    {
      "type": "h2",
      "text": "Q22: Reverse a linked list in-place."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Amazon, Microsoft. Tests pointer manipulation and understanding of iterative vs recursive approaches."
    },
    {
      "type": "code-block",
      "label": "Reverse Linked List",
      "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    prev = None\n    current = head\n    \n    while current:\n        next_temp = current.next\n        current.next = prev\n        prev = current\n        current = next_temp\n    \n    return prev\n\n# Build 1 → 2 → 3 → None\nhead = ListNode(1, ListNode(2, ListNode(3)))\nnew_head = reverse_list(head)\n# Now: 3 → 2 → 1 → None\n\n# Time: O(n)\n# Space: O(1) — only three pointers\n# Key insight: Save next before overwriting current.next"
    },
    {
      "type": "h2",
      "text": "Q23: Detect a cycle in a linked list (Floyd's Algorithm)."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Amazon, Apple. The tortoise and hare algorithm. O(n) time, O(1) space."
    },
    {
      "type": "code-block",
      "label": "Cycle Detection",
      "code": "def has_cycle(head):\n    slow = fast = head\n    \n    while fast and fast.next:\n        slow = slow.next          # 1 step\n        fast = fast.next.next     # 2 steps\n        if slow is fast:\n            return True\n    \n    return False\n\n# If there's a cycle, fast will eventually catch slow.\n# If no cycle, fast reaches the end.\n# Time: O(n) — fast pointer traverses at most n nodes\n# Space: O(1) — only two pointers\n# Why it works: In a cycle, the distance between slow and fast decreases by 1 each step."
    },
    {
      "type": "h2",
      "text": "Q24: Find the Nth node from the end of a linked list."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Microsoft, Stripe. Two-pointer technique: advance fast by N steps, then move both together."
    },
    {
      "type": "code-block",
      "label": "Nth from End",
      "code": "def nth_from_end(head, n):\n    fast = slow = head\n    \n    # Advance fast n steps\n    for _ in range(n):\n        if not fast:\n            return None  # n > length\n        fast = fast.next\n    \n    # Move both until fast reaches end\n    while fast:\n        slow = slow.next\n        fast = fast.next\n    \n    return slow  # slow is n steps from end\n\n# Time: O(n) — single pass\n# Space: O(1) — two pointers\n# Edge case: n = 1 returns last node, n = length returns first node"
    },
    {
      "type": "h2",
      "text": "Q25: Valid parentheses using a stack."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Amazon, Google, Bloomberg. Classic stack problem. Match opening and closing brackets."
    },
    {
      "type": "code-block",
      "label": "Valid Parentheses",
      "code": "def is_valid(s):\n    stack = []\n    pairs = {'(': ')', '[': ']', '{': '}'}\n    \n    for char in s:\n        if char in pairs:\n            stack.append(char)\n        elif not stack or pairs[stack.pop()] != char:\n            return False\n    \n    return len(stack) == 0\n\nprint(is_valid('()'))      # True\nprint(is_valid('()[]{}'))  # True\nprint(is_valid('(]'))      # False\nprint(is_valid('([)]'))    # False\n\n# Time: O(n)\n# Space: O(n) — stack in worst case\n# Key: Every closing bracket must match the most recent unmatched opening bracket."
    },
    {
      "type": "h2",
      "text": "Q26: LRU Cache implementation."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Amazon, Netflix, Uber. The most famous system design + data structure hybrid question. Use OrderedDict or a custom doubly-linked list + hash map."
    },
    {
      "type": "code-block",
      "label": "LRU Cache",
      "code": "from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n    \n    def get(self, key):\n        if key not in self.cache:\n            return -1\n        # Move to end (most recently used)\n        self.cache.move_to_end(key)\n        return self.cache[key]\n    \n    def put(self, key, value):\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity:\n            # Pop first item (least recently used)\n            self.cache.popitem(last=False)\n\n# Usage\ncache = LRUCache(2)\ncache.put(1, 'A')\ncache.put(2, 'B')\nprint(cache.get(1))   # 'A' → 1 is now most recent\ncache.put(3, 'C')     # Evicts 2 (least recent)\nprint(cache.get(2))   # -1 → evicted\n\n# Time: O(1) for both get and put\n# Space: O(capacity)\n# OrderedDict maintains insertion order and supports move_to_end/popitem."
    },
    {
      "type": "h2",
      "text": "Q27: Merge two sorted arrays/lists."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Microsoft, Apple. Two-pointer technique. O(n+m) time, O(1) extra space if modifying in-place."
    },
    {
      "type": "code-block",
      "label": "Merge Sorted Arrays",
      "code": "def merge_sorted(a, b):\n    result = []\n    i = j = 0\n    \n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            result.append(a[i])\n            i += 1\n        else:\n            result.append(b[j])\n            j += 1\n    \n    # Append remaining elements\n    result.extend(a[i:])\n    result.extend(b[j:])\n    return result\n\nprint(merge_sorted([1, 3, 5], [2, 4, 6]))  # [1, 2, 3, 4, 5, 6]\n\n# Time: O(n + m)\n# Space: O(n + m) for new list\n# Variation: Merge in-place from the end if arrays have extra space (LeetCode 88)"
    },
    {
      "type": "h2",
      "text": "Q28: Find the first non-repeating character in a string."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Google, Stripe. Two passes: count frequencies, then find first with count 1."
    },
    {
      "type": "code-block",
      "label": "First Non-Repeating Character",
      "code": "from collections import Counter\n\ndef first_unique(s):\n    count = Counter(s)\n    for i, char in enumerate(s):\n        if count[char] == 1:\n            return i\n    return -1\n\nprint(first_unique('leetcode'))      # 0 → 'l'\nprint(first_unique('loveleetcode'))  # 2 → 'v'\nprint(first_unique('aabb'))          # -1\n\n# Time: O(n) — two passes, each O(n)\n# Space: O(k) where k = unique characters (max 26 for lowercase ASCII)\n# Counter is O(n) to build but very readable. For interviews, manual dict is also fine."
    },
    {
      "type": "h2",
      "text": "Q29: Move zeros to the end while preserving order of non-zero elements."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Amazon, Facebook. In-place with two pointers."
    },
    {
      "type": "code-block",
      "label": "Move Zeros",
      "code": "def move_zeros(nums):\n    write = 0\n    \n    # Move all non-zero elements to the front\n    for read in range(len(nums)):\n        if nums[read] != 0:\n            nums[write] = nums[read]\n            write += 1\n    \n    # Fill remaining with zeros\n    for i in range(write, len(nums)):\n        nums[i] = 0\n    \n    return nums\n\nprint(move_zeros([0, 1, 0, 3, 12]))  # [1, 3, 12, 0, 0]\n\n# Time: O(n) — single pass for non-zeros + fill\n# Space: O(1) — in-place\n# Variation: Swap instead of overwrite to also preserve relative order of zeros (rarely asked)"
    },
    {
      "type": "h2",
      "text": "Q30: Group anagrams together."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Amazon, Google. Use sorted string as key in a hash map."
    },
    {
      "type": "code-block",
      "label": "Group Anagrams",
      "code": "from collections import defaultdict\n\ndef group_anagrams(strs):\n    groups = defaultdict(list)\n    \n    for s in strs:\n        key = ''.join(sorted(s))  # 'eat' and 'tea' both → 'aet'\n        groups[key].append(s)\n    \n    return list(groups.values())\n\nprint(group_anagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']))\n# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]\n\n# Time: O(n * k log k) where k = max string length\n# Space: O(n * k)\n# Optimization: Use character count tuple as key for O(n * k) time: tuple(Counter(s).values())"
    },
    {
      "type": "h2",
      "text": "Q31: Binary search implementation."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Amazon, Microsoft, Apple. The algorithm every developer must know by heart."
    },
    {
      "type": "code-block",
      "label": "Binary Search",
      "code": "def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1\n\nprint(binary_search([1, 3, 5, 7, 9], 5))  # 2\nprint(binary_search([1, 3, 5, 7, 9], 4))  # -1\n\n# Time: O(log n)\n# Space: O(1)\n# Common bug: Using left < right instead of left <= right misses the last element.\n# Common bug: Integer overflow in C++/Java — not an issue in Python."
    },
    {
      "type": "h2",
      "text": "Q32: Find the kth largest element in an array."
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Meta, Netflix. Use QuickSelect for O(n) average, or a min-heap for O(n log k)."
    },
    {
      "type": "code-block",
      "label": "Kth Largest Element",
      "code": "import heapq\n\ndef find_kth_largest(nums, k):\n    # Min-heap of size k: keeps k largest elements seen so far\n    heap = nums[:k]\n    heapq.heapify(heap)\n    \n    for num in nums[k:]:\n        if num > heap[0]:\n            heapq.heapreplace(heap, num)\n    \n    return heap[0]  # Smallest of the k largest = kth largest\n\nprint(find_kth_largest([3, 2, 1, 5, 6, 4], 2))  # 5\n\n# Time: O(n log k) — heap operations are log k\n# Space: O(k) — heap size never exceeds k\n# Alternative: QuickSelect for O(n) average but O(n²) worst case.\n# Heap approach is more consistent and easier to explain in interviews."
    },
    {
      "type": "h2",
      "text": "Q33: Product of array except self (without division)."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Amazon, Google. Use prefix and suffix products. O(n) time, O(1) extra space (excluding output)."
    },
    {
      "type": "code-block",
      "label": "Product Except Self",
      "code": "def product_except_self(nums):\n    n = len(nums)\n    result = [1] * n\n    \n    # First pass: prefix products\n    prefix = 1\n    for i in range(n):\n        result[i] = prefix\n        prefix *= nums[i]\n    \n    # Second pass: suffix products multiplied in\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        result[i] *= suffix\n        suffix *= nums[i]\n    \n    return result\n\nprint(product_except_self([1, 2, 3, 4]))  # [24, 12, 8, 6]\n\n# Time: O(n) — two passes\n# Space: O(1) extra — result array doesn't count as extra space per problem statement\n# Intuition: result[i] = product of all elements before i * product of all after i"
    },
    {
      "type": "h2",
      "text": "Q34: Longest substring without repeating characters."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Amazon, Meta, Apple. Sliding window with a hash set. O(n) time."
    },
    {
      "type": "code-block",
      "label": "Longest Substring",
      "code": "def length_of_longest(s):\n    char_set = set()\n    left = 0\n    max_len = 0\n    \n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    \n    return max_len\n\nprint(length_of_longest('abcabcbb'))  # 3 → 'abc'\nprint(length_of_longest('bbbbb'))     # 1 → 'b'\nprint(length_of_longest('pwwkew'))    # 3 → 'wke'\n\n# Time: O(n) — each character visited at most twice (added once, removed once)\n# Space: O(min(m, n)) where m = charset size\n# Key: left pointer only moves forward, never backward."
    },
    {
      "type": "h2",
      "text": "Q35: Find minimum window in string S containing all characters of string T."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Google, Amazon. Sliding window with character counts. O(n) time."
    },
    {
      "type": "code-block",
      "label": "Minimum Window Substring",
      "code": "from collections import Counter\n\ndef min_window(s, t):\n    if not s or not t:\n        return ''\n    \n    need = Counter(t)\n    required = len(need)\n    formed = 0\n    window_counts = {}\n    \n    left = 0\n    min_len = float('inf')\n    min_window = ''\n    \n    for right in range(len(s)):\n        char = s[right]\n        window_counts[char] = window_counts.get(char, 0) + 1\n        \n        if char in need and window_counts[char] == need[char]:\n            formed += 1\n        \n        while formed == required:\n            if right - left + 1 < min_len:\n                min_len = right - left + 1\n                min_window = s[left:right+1]\n            \n            left_char = s[left]\n            window_counts[left_char] -= 1\n            if left_char in need and window_counts[left_char] < need[left_char]:\n                formed -= 1\n            left += 1\n    \n    return min_window\n\nprint(min_window('ADOBECODEBANC', 'ABC'))  # 'BANC'\n\n# Time: O(n) — each character visited at most twice\n# Space: O(m) where m = unique characters in T\n# This is considered one of the hardest standard sliding window problems."
    },
    {
      "type": "h2",
      "text": "Part 4: Advanced Python & Concurrency (Questions 36-42)"
    },
    {
      "type": "p",
      "text": "These questions separate senior engineers from mid-level developers. They test your understanding of Python's runtime, memory model, and concurrency primitives."
    },
    {
      "type": "h2",
      "text": "Q36: What is the difference between `threading`, `multiprocessing`, and `asyncio`?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Netflix, Dropbox, Spotify. This is the concurrency triad every senior Python developer must master."
    },
    {
      "type": "checklist",
      "items": [
        "threading: Best for I/O-bound tasks (network, file). All threads share memory but are limited by the GIL — only one runs Python bytecode at a time. Use for concurrent API calls, database queries.",
        "multiprocessing: Best for CPU-bound tasks. Each process has its own Python interpreter and memory space, bypassing the GIL. Use for data processing, mathematical computation, image processing.",
        "asyncio: Best for high-concurrency I/O with async-native libraries. Single-threaded event loop with cooperative multitasking. Use for web servers, WebSockets, thousands of concurrent connections."
      ]
    },
    {
      "type": "code-block",
      "label": "Concurrency Models Compared",
      "code": "import threading\nimport multiprocessing\nimport asyncio\nimport time\n\n# THREADING: I/O-bound (simulated with sleep)\ndef io_task(n):\n    time.sleep(1)\n    print(f'Thread {n} done')\n\nthreads = [threading.Thread(target=io_task, args=(i,)) for i in range(5)]\nstart = time.time()\nfor t in threads: t.start()\nfor t in threads: t.join()\nprint(f'Threading: {time.time()-start:.1f}s')  # ~1s total\n\n# MULTIPROCESSING: CPU-bound\ndef cpu_task(n):\n    count = 0\n    for i in range(10_000_000):\n        count += i\n    return count\n\nprocesses = [multiprocessing.Process(target=cpu_task, args=(i,)) for i in range(4)]\nstart = time.time()\nfor p in processes: p.start()\nfor p in processes: p.join()\nprint(f'Multiprocessing: {time.time()-start:.1f}s')  # ~¼ of sequential time\n\n# ASYNCIO: High-concurrency I/O\nasync def async_task(n):\n    await asyncio.sleep(1)\n    print(f'Async {n} done')\n\nasync def main():\n    start = time.time()\n    await asyncio.gather(*[async_task(i) for i in range(1000)])\n    print(f'Asyncio: {time.time()-start:.1f}s')  # ~1s for 1000 tasks!\n\nasyncio.run(main())"
    },
    {
      "type": "h2",
      "text": "Q37: How does Python's garbage collection work?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Dropbox. Python uses reference counting as the primary mechanism, with a generational cyclic garbage collector as backup."
    },
    {
      "type": "code-block",
      "label": "Garbage Collection",
      "code": "import gc\nimport sys\n\n# Reference counting: primary mechanism\na = []\nprint(sys.getrefcount(a))  # 2 (one from 'a', one from getrefcount argument)\n\nb = a\nprint(sys.getrefcount(a))  # 3\n\ndel b\nprint(sys.getrefcount(a))  # 2 again\n\n# Cyclic references: reference counting fails here\nclass Node:\n    def __init__(self):\n        self.ref = None\n\nn1 = Node()\nn2 = Node()\nn1.ref = n2\nn2.ref = n1\n\n# Even if we delete n1 and n2, reference counts don't hit zero\n# because they reference each other. The cyclic GC handles this.\nprint(gc.isenabled())  # True\ngc.collect()  # Force collection\n\n# Generational GC: objects survive 0→1→2 generations\nprint(gc.get_count())  # (count_gen0, count_gen1, count_gen2)"
    },
    {
      "type": "h2",
      "text": "Q38: What are generators and why use them over lists?"
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Spotify, Robinhood. Generators use lazy evaluation — they yield one item at a time instead of building the entire sequence in memory."
    },
    {
      "type": "code-block",
      "label": "Generators",
      "code": "# Generator function: yields one item at a time\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\n# Generator expression: lazy version of list comprehension\nsquares = (x**2 for x in range(1_000_000_000))  # Uses ~112 bytes\n# list_squares = [x**2 for x in range(1_000_000_000)]  # Would crash: needs ~8GB\n\n# Process one million lines without loading into memory\ndef read_large_file(path):\n    with open(path) as f:\n        for line in f:\n            yield line.strip()\n\n# Pipeline pattern: chain generators\ndef parse_lines(lines):\n    for line in lines:\n        yield line.split(',')\n\ndef filter_errors(records):\n    for record in records:\n        if record[2] == 'ERROR':\n            yield record\n\n# Usage: processes one line at a time, constant memory\nlines = read_large_file('huge.log')\nrecords = parse_lines(lines)\nerrors = filter_errors(records)\nfor error in errors:\n    print(error)  # Memory usage stays flat regardless of file size"
    },
    {
      "type": "h2",
      "text": "Q39: Explain `async`/`await` and the event loop."
    },
    {
      "type": "p",
      "text": "Asked at: Meta, Netflix, Stripe, FastAPI companies. Asyncio uses cooperative multitasking: coroutines yield control at `await` points, allowing the event loop to run other tasks."
    },
    {
      "type": "code-block",
      "label": "Async Await Pattern",
      "code": "import asyncio\n\nasync def fetch_data(url):\n    print(f'Fetching {url}')\n    await asyncio.sleep(1)  # Simulates non-blocking I/O\n    return f'Data from {url}'\n\nasync def main():\n    # Sequential: 3 seconds total\n    result1 = await fetch_data('api/1')\n    result2 = await fetch_data('api/2')\n    result3 = await fetch_data('api/3')\n    \n    # Concurrent: 1 second total (all run simultaneously)\n    results = await asyncio.gather(\n        fetch_data('api/1'),\n        fetch_data('api/2'),\n        fetch_data('api/3')\n    )\n    \n    # Real-world: semaphore to limit concurrency\n    semaphore = asyncio.Semaphore(10)\n    \n    async def bounded_fetch(url):\n        async with semaphore:\n            return await fetch_data(url)\n    \n    urls = [f'api/{i}' for i in range(100)]\n    results = await asyncio.gather(*[bounded_fetch(u) for u in urls])\n\nasyncio.run(main())\n\n# Key rule: NEVER call blocking functions (time.sleep, requests.get) in async code.\n# Use asyncio.sleep and aiohttp instead.\n# Blocking the event loop stalls ALL coroutines, not just the current one."
    },
    {
      "type": "h2",
      "text": "Q40: What is a semaphore and how do you use it in Python?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Amazon, Stripe. A semaphore limits concurrent access to a resource. In async Python, `asyncio.Semaphore` prevents overwhelming external APIs or databases."
    },
    {
      "type": "code-block",
      "label": "Semaphore Usage",
      "code": "import asyncio\n\nclass APIClient:\n    def __init__(self, max_concurrent=10):\n        self.semaphore = asyncio.Semaphore(max_concurrent)\n    \n    async def request(self, url):\n        async with self.semaphore:\n            # Only 10 requests run simultaneously\n            await asyncio.sleep(0.1)  # Simulated API call\n            return f'Result for {url}'\n\nasync def main():\n    client = APIClient(max_concurrent=5)\n    urls = [f'https://api.example.com/{i}' for i in range(100)]\n    \n    # Process all 100 URLs but never more than 5 at once\n    results = await asyncio.gather(*[client.request(u) for u in urls])\n    print(f'Completed {len(results)} requests')\n\nasyncio.run(main())\n\n# Threading equivalent: threading.Semaphore\n# Use case: connection pools, rate limiting, resource throttling"
    },
    {
      "type": "h2",
      "text": "Q41: What are Python's `pickle` and `json` modules, and when to use each?"
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Dropbox, Uber. JSON is text-based, human-readable, and secure. Pickle is binary, Python-specific, and can execute arbitrary code during unpickling — never unpickle untrusted data."
    },
    {
      "type": "code-block",
      "label": "Pickle vs JSON",
      "code": "import json\nimport pickle\n\ndata = {'name': 'Alice', 'scores': [95, 87, 92]}\n\n# JSON: text-based, cross-language, safe\njson_str = json.dumps(data, indent=2)\nprint(json_str)\n# {\n#   'name': 'Alice',\n#   'scores': [95, 87, 92]\n# }\n\n# Pickle: binary, Python-only, preserves complex objects\nclass CustomClass:\n    def __init__(self):\n        self.value = 42\n\nobj = CustomClass()\npickled = pickle.dumps(obj)\nrestored = pickle.loads(pickled)\nprint(restored.value)  # 42\n\n# SECURITY WARNING: Never unpickle data from untrusted sources!\n# Pickle can execute arbitrary Python code during deserialization.\n# Use JSON for APIs, config files, and cross-service communication.\n# Use pickle only for caching within a single trusted application."
    },
    {
      "type": "h2",
      "text": "Q42: What are type hints and why use them in Python?"
    },
    {
      "type": "p",
      "text": "Asked at: Stripe, Robinhood, FastAPI companies. Type hints (PEP 484) don't enforce types at runtime — they're for static analysis, IDE autocomplete, and documentation."
    },
    {
      "type": "code-block",
      "label": "Type Hints",
      "code": "from typing import List, Dict, Optional, Union\n\ndef process_users(users: List[Dict[str, Union[str, int]]]) -> Optional[int]:\n    '''\n    users: List of dicts with string keys and string/int values\n    Returns: Optional integer (could be None)\n    '''\n    if not users:\n        return None\n    return sum(u.get('age', 0) for u in users if isinstance(u.get('age'), int))\n\n# Modern Python 3.10+ syntax (cleaner)\ndef modern_process(users: list[dict[str, str | int]]) -> int | None:\n    pass\n\n# Benefits:\n# 1. mypy catches type errors before runtime\n# 2. IDE provides autocomplete and refactoring\n# 3. Self-documenting code — types are documentation\n# 4. Easier refactoring — change a type, see all impacted code"
    },
    {
      "type": "h2",
      "text": "Part 5: System Design & Practical Python (Questions 43-50)"
    },
    {
      "type": "p",
      "text": "These questions test whether you can build real systems, not just solve LeetCode problems."
    },
    {
      "type": "h2",
      "text": "Q43: Design a rate limiter in Python."
    },
    {
      "type": "p",
      "text": "Asked at: Stripe, Google, Amazon, Meta. Rate limiting prevents abuse and ensures fair resource allocation. The token bucket algorithm is the most common interview answer."
    },
    {
      "type": "code-block",
      "label": "Token Bucket Rate Limiter",
      "code": "import time\nfrom collections import defaultdict\n\nclass TokenBucket:\n    def __init__(self, rate: float, capacity: int):\n        '''\n        rate: tokens added per second\n        capacity: maximum tokens in bucket\n        '''\n        self.rate = rate\n        self.capacity = capacity\n        self.tokens = capacity\n        self.last_update = time.time()\n    \n    def allow_request(self, tokens: int = 1) -> bool:\n        now = time.time()\n        elapsed = now - self.last_update\n        \n        # Add tokens based on elapsed time\n        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)\n        self.last_update = now\n        \n        if self.tokens >= tokens:\n            self.tokens -= tokens\n            return True\n        return False\n\n# Per-user rate limiting\nclass RateLimiter:\n    def __init__(self, rate: float, capacity: int):\n        self.buckets = defaultdict(lambda: TokenBucket(rate, capacity))\n    \n    def is_allowed(self, user_id: str) -> bool:\n        return self.buckets[user_id].allow_request()\n\nlimiter = RateLimiter(rate=2, capacity=5)  # 2 requests/sec, burst of 5\nfor i in range(10):\n    print(f'Request {i}: {limiter.is_allowed(\"user_123\")}')\n\n# Output: True, True, True, True, True, False, False, True, True, False\n# First 5 pass (burst), then throttled to 2/sec"
    },
    {
      "type": "h2",
      "text": "Q44: How would you process a 10GB log file with limited memory?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Amazon, Netflix. The key is streaming — never load the entire file into memory."
    },
    {
      "type": "code-block",
      "label": "Streaming Large File Processing",
      "code": "from collections import Counter\n\ndef stream_process_logs(path):\n    '''Process 10GB file with constant memory usage.'''\n    error_counts = Counter()\n    \n    with open(path, 'r') as f:\n        for line in f:  # Reads one line at a time\n            if 'ERROR' in line:\n                timestamp = line[:19]  # Extract timestamp\n                error_counts[timestamp] += 1\n    \n    return error_counts.most_common(10)\n\n# For even larger files or distributed processing:\ndef chunked_reader(path, chunk_size=8192):\n    '''Read in chunks for binary files.'''\n    with open(path, 'rb') as f:\n        while chunk := f.read(chunk_size):\n            yield chunk\n\n# External merge sort for sorting large files:\n# 1. Split file into chunks that fit in memory\n# 2. Sort each chunk and write to disk\n# 3. Merge sorted chunks using a min-heap\n# This is how databases and MapReduce work under the hood."
    },
    {
      "type": "h2",
      "text": "Q45: Implement a thread-safe singleton in Python."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Bloomberg. The singleton pattern ensures only one instance exists. Thread safety requires locks."
    },
    {
      "type": "code-block",
      "label": "Thread-Safe Singleton",
      "code": "import threading\n\nclass ThreadSafeSingleton:\n    _instance = None\n    _lock = threading.Lock()\n    \n    def __new__(cls):\n        if cls._instance is None:\n            with cls._lock:\n                # Double-checked locking\n                if cls._instance is None:\n                    cls._instance = super().__new__(cls)\n        return cls._instance\n    \n    def __init__(self):\n        # __init__ runs every time, so guard against re-initialization\n        if not hasattr(self, 'initialized'):\n            self.data = {}\n            self.initialized = True\n\n# Test thread safety\ndef create_singleton():\n    s = ThreadSafeSingleton()\n    return id(s)\n\nwith threading.ThreadPoolExecutor(max_workers=10) as executor:\n    ids = list(executor.map(lambda _: create_singleton(), range(100)))\n\nprint(len(set(ids)))  # 1 → all same instance\n\n# Alternative: __call__ on metaclass (cleaner but less known)\nclass SingletonMeta(type):\n    _instances = {}\n    _lock = threading.Lock()\n    \n    def __call__(cls, *args, **kwargs):\n        if cls not in cls._instances:\n            with cls._lock:\n                if cls not in cls._instances:\n                    cls._instances[cls] = super().__call__(*args, **kwargs)\n        return cls._instances[cls]\n\nclass Config(metaclass=SingletonMeta):\n    pass"
    },
    {
      "type": "h2",
      "text": "Q46: Design a URL shortener like Bitly."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Amazon, Meta, Stripe. This is the classic system design question. The Python-specific angle is handling high concurrency and choosing the right database."
    },
    {
      "type": "code-block",
      "label": "URL Shortener Core",
      "code": "import hashlib\nimport base62  # pip install pybase62\n\nclass URLShortener:\n    '''\n    Design considerations:\n    - Base62 encoding of auto-increment ID (short, readable URLs)\n    - Hash-based for custom aliases (MD5/SHA256 of original URL)\n    - Redis for caching hot URLs\n    - PostgreSQL for persistence (ACID guarantees)\n    - Rate limiting to prevent abuse\n    '''\n    def __init__(self):\n        self.counter = 0  # In reality: distributed counter (Redis INCR)\n        self.db = {}      # In reality: PostgreSQL + Redis cache\n    \n    def shorten(self, long_url: str, custom_alias: str = None) -> str:\n        if custom_alias:\n            short = custom_alias\n        else:\n            self.counter += 1\n            short = base62.encode(self.counter)\n        \n        self.db[short] = long_url\n        return f'https://short.io/{short}'\n    \n    def expand(self, short_url: str) -> str | None:\n        short = short_url.split('/')[-1]\n        return self.db.get(short)\n\n# Scaling considerations:\n# 1. Database: PostgreSQL with read replicas\n# 2. Cache: Redis for hot URLs (1% of URLs get 99% of traffic)\n# 3. CDN: CloudFlare for redirect caching\n# 4. Analytics: Kafka stream for click tracking\n# 5. Collision handling: Check if hash exists, append counter if needed"
    },
    {
      "type": "h2",
      "text": "Q47: How do you handle exceptions in production Python code?"
    },
    {
      "type": "p",
      "text": "Asked at: Netflix, Spotify, Stripe. Production exception handling is about graceful degradation, not just try/except blocks."
    },
    {
      "type": "code-block",
      "label": "Production Exception Handling",
      "code": "import logging\nimport functools\nfrom typing import Callable, Any\n\n# Configure structured logging\nlogging.basicConfig(\n    level=logging.INFO,\n    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'\n)\nlogger = logging.getLogger(__name__)\n\ndef retry(max_attempts: int = 3, exceptions: tuple = (Exception,)):\n    '''Decorator for automatic retry with exponential backoff.'''\n    def decorator(func: Callable) -> Callable:\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs) -> Any:\n            for attempt in range(max_attempts):\n                try:\n                    return func(*args, **kwargs)\n                except exceptions as e:\n                    wait = 2 ** attempt\n                    logger.warning(\n                        f'{func.__name__} failed (attempt {attempt + 1}/{max_attempts}): {e}. Retrying in {wait}s...'\n                    )\n                    if attempt == max_attempts - 1:\n                        raise\n                    import time\n                    time.sleep(wait)\n        return wrapper\n    return decorator\n\n@retry(max_attempts=3, exceptions=(ConnectionError, TimeoutError))\ndef fetch_data(url: str) -> dict:\n    # Simulated API call\n    import random\n    if random.random() < 0.5:\n        raise ConnectionError('Network unstable')\n    return {'data': 'success'}\n\n# Circuit breaker pattern (prevents cascading failures)\nclass CircuitBreaker:\n    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):\n        self.failure_threshold = failure_threshold\n        self.recovery_timeout = recovery_timeout\n        self.failures = 0\n        self.last_failure_time = None\n        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN\n    \n    def call(self, func: Callable, *args, **kwargs):\n        if self.state == 'OPEN':\n            if time.time() - self.last_failure_time > self.recovery_timeout:\n                self.state = 'HALF_OPEN'\n            else:\n                raise Exception('Circuit breaker is OPEN')\n        \n        try:\n            result = func(*args, **kwargs)\n            if self.state == 'HALF_OPEN':\n                self.state = 'CLOSED'\n                self.failures = 0\n            return result\n        except Exception as e:\n            self.failures += 1\n            self.last_failure_time = time.time()\n            if self.failures >= self.failure_threshold:\n                self.state = 'OPEN'\n            raise"
    },
    {
      "type": "h2",
      "text": "Q48: What is the difference between `__str__` and `__repr__`?"
    },
    {
      "type": "p",
      "text": "Asked at: Amazon, Spotify. `__repr__` is for developers — it should be unambiguous and ideally valid Python code. `__str__` is for users — it should be readable and pretty. If `__str__` is missing, `__repr__` is used as fallback."
    },
    {
      "type": "code-block",
      "label": "str vs repr",
      "code": "from datetime import datetime\n\nnow = datetime.now()\nprint(str(now))   # '2026-06-05 14:30:00.123456' → Human readable\nprint(repr(now))  # 'datetime.datetime(2026, 6, 5, 14, 30, 0, 123456)' → Exact, reproducible\n\n# Best practice: __repr__ should ideally be eval-able\nclass Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    \n    def __repr__(self):\n        return f'Point({self.x}, {self.y})'  # Can copy-paste into Python\n    \n    def __str__(self):\n        return f'({self.x}, {self.y})'  # Pretty for users\n\np = Point(3, 4)\nprint(repr(p))  # Point(3, 4)\nprint(str(p))   # (3, 4)"
    },
    {
      "type": "h2",
      "text": "Q49: How do you optimize Python performance for data-heavy applications?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Netflix, Spotify, Uber. Performance optimization is about profiling first, then optimizing the right bottlenecks."
    },
    {
      "type": "checklist",
      "items": [
        "Profile first: Use cProfile, line_profiler, or Py-Spy to find actual bottlenecks. Don't optimize blindly.",
        "Use built-ins: `map`, `filter`, `sum`, `any` are implemented in C and much faster than Python loops.",
        "Vectorize with NumPy: Replace Python loops with NumPy array operations for 10-100x speedups.",
        "Use generators: For large datasets, generators keep memory constant regardless of data size.",
        "Cache with functools.lru_cache: Memoize expensive function calls automatically.",
        "C extensions: For critical paths, write Cython or use Numba JIT compilation.",
        "Database optimization: Use connection pooling, batch inserts, and proper indexing."
      ]
    },
    {
      "type": "code-block",
      "label": "Performance Optimization Examples",
      "code": "import functools\nimport time\n\n# 1. LRU Cache for expensive computations\n@functools.lru_cache(maxsize=128)\ndef fibonacci(n):\n    if n < 2:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\n# Without cache: O(2^n) — unusable for n > 30\n# With cache: O(n) — instant even for n = 1000\nstart = time.time()\nprint(fibonacci(500))\nprint(f'Cached: {time.time() - start:.4f}s')\n\n# 2. Vectorization with NumPy vs Python loops\nimport numpy as np\n\n# Slow: Python loop\ndef slow_sum(n):\n    return sum(i**2 for i in range(n))\n\n# Fast: NumPy vectorization\ndef fast_sum(n):\n    arr = np.arange(n)\n    return np.sum(arr ** 2)\n\nn = 10_000_000\nstart = time.time()\nslow_sum(n)\nprint(f'Python loop: {time.time() - start:.2f}s')\n\nstart = time.time()\nfast_sum(n)\nprint(f'NumPy: {time.time() - start:.2f}s')  # ~50x faster"
    },
    {
      "type": "h2",
      "text": "Q50: Explain Python's `__slots__` and when to use it."
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Dropbox. `__slots__` pre-declares attributes, eliminating the per-instance `__dict__`. This reduces memory usage by ~50% and speeds up attribute access. Use it when creating millions of simple objects."
    },
    {
      "type": "code-block",
      "label": "slots Memory Optimization",
      "code": "import sys\n\nclass RegularPoint:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\nclass SlotPoint:\n    __slots__ = ('x', 'y')\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n# Memory comparison\nr = RegularPoint(1, 2)\ns = SlotPoint(1, 2)\n\nprint(f'Regular: {sys.getsizeof(r)} bytes')  # ~48 bytes + dict overhead\nprint(f'Slots: {sys.getsizeof(s)} bytes')      # ~32 bytes (no dict)\n\n# Slots prevent dynamic attribute creation\n# r.z = 3  # Works for RegularPoint\n# s.z = 3  # AttributeError: 'SlotPoint' object has no attribute 'z'\n\n# Use __slots__ when:\n# 1. You create millions of instances (games, simulations, data processing)\n# 2. You know all attributes at class definition time\n# 3. You want faster attribute access (no dict lookup)\n# 4. You want to prevent dynamic attribute creation (safety)"
    },
    {
      "type": "h2",
      "text": "Q51 (Bonus): Why does Python's `int` have no fixed range? And why does `print(type(int))` confuse everyone?"
    },
    {
      "type": "p",
      "text": "Asked at: Google, Meta, Bloomberg, Palantir. This is the question that separates people who 'know Python syntax' from people who 'understand Python's soul.' Every other language has fixed integer ranges. Python doesn't. Here's why — and why `print(type(int))` produces an answer that breaks every newcomer's brain."
    },
    {
      "type": "h2",
      "text": "The Shock: `print(type(int))` — What Even Is This?"
    },
    {
      "type": "p",
      "text": "In C, Java, or C++, `int` is a primitive type. It's a label the compiler uses to allocate 4 bytes of memory. In Python, `int` is not a primitive. It's a class. A full-blown object. When you write `x = 42`, Python doesn't reserve 4 bytes of raw memory. It creates an instance of the `int` class. So `print(type(int))` doesn't print 'primitive type' or 'keyword.' It prints `<class 'type'>` — because `int` itself is an instance of `type`, which is Python's metaclass. `type` is the class that creates classes. `int` is a class. Therefore `int` is an instance of `type`. This is the meta-programming rabbit hole that makes Python interviews so brutal."
    },
    {
      "type": "code-block",
      "label": "The type(int) Rabbit Hole",
      "code": "# Every other language: int is a primitive. End of story.\n# Python: int is a class. And that class is an instance of 'type'.\n\nprint(type(42))       # <class 'int'> → 42 is an instance of int\nprint(type(int))      # <class 'type'> → int is an instance of type (the metaclass)\nprint(type(type))     # <class 'type'> → type is an instance of itself!\n\n# This is Python's object model. Everything is an object.\n# Even classes are objects. Even the class that creates classes is an object.\n# C/Java developers' brains melt here. That's why interviewers love it."
    },
    {
      "type": "h2",
      "text": "Why Python's `int` Has No Fixed Range — The Arbitrary Precision Secret"
    },
    {
      "type": "p",
      "text": "In C, `int` is typically 32 bits: range -2,147,483,648 to +2,147,483,647. Overflow it and your program crashes or wraps around silently. In Java, `int` is the same. In Python, `int` is arbitrary precision. It grows as large as your RAM allows. Python's `int` is not a fixed-size block of memory. It's a dynamic array of 30-bit or 15-bit 'digits' (depending on your platform), managed internally by the CPython interpreter. Need to store a 10,000-digit number? Python allocates more memory. No overflow. Ever. This is why Python is terrible for high-performance numerical computing out of the box — and why NumPy exists (NumPy uses fixed-size C integers for speed)."
    },
    {
      "type": "code-block",
      "label": "Python int vs C/Java int Ranges",
      "code": "# C/Java int: 32-bit signed integer\n# Range: -2,147,483,648 to +2,147,483,647\n# Overflow behavior: wraps around or crashes (undefined behavior in C)\n\n# Python int: arbitrary precision (unlimited size)\n# Range: -∞ to +∞ (limited only by your RAM)\n# Overflow behavior: never happens. Python auto-expands memory.\n\n# Demonstration: Python handles numbers that would crash C/Java\nhuge = 2 ** 10000  # 3,011-digit number\nprint(f'Digits: {len(str(huge))}')  # 3011 digits\nprint(f'Last 10 digits: {str(huge)[-10:]}')  # 376...\n\n# C equivalent would need 10,000+ bits = 1,250+ bytes = custom big-int library\n# Python does this with zero code changes. Just works.\n\n# But there's a trade-off: Python ints are slow\nimport time\n\n# Python int addition (arbitrary precision, dynamic allocation)\nstart = time.time()\nfor _ in range(1_000_000):\n    x = 12345678901234567890 + 1\npy_time = time.time() - start\n\n# NumPy int64 (fixed 64-bit, C-speed)\nimport numpy as np\nstart = time.time()\nfor _ in range(1_000_000):\n    x = np.int64(12345678901234567890) + 1\nnp_time = time.time() - start\n\nprint(f'Python int: {py_time:.3f}s')\nprint(f'NumPy int64: {np_time:.3f}s')  # ~10-50x faster"
    },
    {
      "type": "h2",
      "text": "The Range Table That Doesn't Exist in Python — But Interviewers Expect You to Know"
    },
    {
      "type": "p",
      "text": "Interviewers from C++ or Java backgrounds love asking: 'What is the range of int in Python?' The answer is 'there is no fixed range.' But they often follow up with: 'Then what are the fixed ranges in NumPy or the `struct` module?' Because in production Python, you often need to interface with C libraries, binary protocols, or databases that DO have fixed ranges. Here's the table every Python developer should tattoo on their brain:"
    },
    {
      "type": "checklist",
      "items": [
        "Python `int`: No fixed range. Arbitrary precision. Limited by RAM. Used for: general math, financial calculations, cryptography.",
        "NumPy `int8`: -128 to +127. 1 byte. Used for: image pixel data, small categorical labels.",
        "NumPy `int16`: -32,768 to +32,767. 2 bytes. Used for: audio samples, sensor readings.",
        "NumPy `int32`: -2,147,483,648 to +2,147,483,647. 4 bytes. Used for: standard integer arrays, database IDs.",
        "NumPy `int64`: -9,223,372,036,854,775,808 to +9,223,372,036,854,775,807. 8 bytes. Used for: timestamps, large counters, scientific data.",
        "NumPy `uint8`: 0 to 255. 1 byte. Used for: RGB values, boolean masks, binary data.",
        "NumPy `uint16`: 0 to 65,535. 2 bytes. Used for: Unicode code points, port numbers.",
        "NumPy `uint32`: 0 to 4,294,967,295. 4 bytes. Used for: IPv4 addresses, file sizes.",
        "NumPy `uint64`: 0 to 18,446,744,073,709,551,615. 8 bytes. Used for: memory addresses, nanosecond timestamps.",
        "`struct` module: Python's bridge to C. `struct.pack('i', x)` uses C `int` (32-bit). `struct.pack('q', x)` uses C `long long` (64-bit). If the value doesn't fit, `struct.error` is raised."
      ]
    },
    {
      "type": "code-block",
      "label": "Range Demonstration and Overflow Traps",
      "code": "import numpy as np\nimport struct\n\n# === PYTHON INT: No overflow, ever ===\npy_big = 2 ** 1000\nprint(f'Python int: {len(str(py_big))} digits')  # 302 digits\npy_big += 1  # Just works. More memory allocated silently.\n\n# === NUMPY INT: Fixed range, silent overflow ===\nnp_int8 = np.array([127, 128], dtype=np.int8)\nprint(f'int8 overflow: {np_int8}')  # [127, -128] ← SILENT WRAP-AROUND!\n\nnp_uint8 = np.array([255, 256], dtype=np.uint8)\nprint(f'uint8 overflow: {np_uint8}')  # [255, 0] ← SILENT WRAP-AROUND!\n\n# This is the #1 bug in production ML pipelines:\n# Loading a CSV with pandas default int64, then converting to int32 for memory,\n# and silently corrupting values > 2 billion.\n\n# === STRUCT MODULE: Bridge to C, explicit overflow ===\n# C int is 32-bit. Try packing 3 billion:\ntry:\n    struct.pack('i', 3_000_000_000)  # 'i' = signed int (32-bit)\nexcept struct.error as e:\n    print(f'struct error: {e}')  # 'int too large to convert'\n\n# Use 'q' for 64-bit (C long long)\npacked = struct.pack('q', 3_000_000_000)  # Works!\nprint(f'Packed 64-bit: {packed}')  # b'\\x00\\x94\\x35\\x77...'\n\n# === THE INTERVIEW TRAP QUESTION ===\n# Q: What is the range of Python's int?\n# A: There is no fixed range. It's arbitrary precision.\n# Q: Then how do you store a 16-bit unsigned integer in Python?\n# A: Use numpy.uint16 or struct.pack('H', value). Python int is the container,\n#    but when you need fixed-width binary data, you use NumPy or struct.\n# Q: What happens if you exceed the range?\n# A: Python int: grows. NumPy: silent wrap-around. struct: raises struct.error."
    },
    {
      "type": "h2",
      "text": "Why This Matters in Production: The Silent Killer"
    },
    {
      "type": "p",
      "text": "Here's the real-world scenario that destroys systems. A data pipeline reads user IDs from a database. The IDs are 64-bit unsigned integers (max 18 quintillion). The pipeline uses pandas with default `int64` (signed). A user ID exceeds 9.2 quintillion (the max signed int64). pandas silently converts it to a float64, losing precision. The ID is now wrong. The user's account is inaccessible. The bug report says 'random users can't log in.' It takes three days to trace it to a data type mismatch. This is why understanding Python's 'no fixed range' philosophy — AND knowing when to use fixed ranges — is the difference between a junior and a senior engineer."
    },
    {
      "type": "code-block",
      "label": "Production Bug: Silent Precision Loss",
      "code": "import pandas as pd\nimport numpy as np\n\n# Simulate: User IDs from a social network with 10 billion users\n# Some IDs exceed signed int64 max (9,223,372,036,854,775,807)\nuser_ids = [1, 2, 9_223_372_036_854_775_807, 9_223_372_036_854_775_808]\n\n# Pandas default: int64 (signed). The 4th ID overflows.\ndf = pd.DataFrame({'user_id': user_ids})\nprint(f'Dtype: {df.user_id.dtype}')  # int64\nprint(df)\n#    user_id\n# 0        1\n# 1        2\n# 2  9223372036854775807  ← max signed int64\n# 3 -9223372036854775808  ← WRAPPED AROUND! Catastrophic bug.\n\n# FIX: Use object dtype for arbitrary precision, or uint64 if you know it's unsigned\ndf_fixed = pd.DataFrame({'user_id': pd.array(user_ids, dtype=object)})\nprint(f'Fixed dtype: {df_fixed.user_id.dtype}')  # object\nprint(df_fixed)\n#    user_id\n# 3  9223372036854775808  ← Correct! Python int preserved.\n\n# OR use uint64 if range is guaranteed 0-18 quintillion\ndf_uint = pd.DataFrame({'user_id': np.array(user_ids, dtype=np.uint64)})\nprint(f'uint64 dtype: {df_uint.user_id.dtype}')  # uint64\n# But if any ID exceeds 18 quintillion, it wraps around silently.\n# There is no free lunch. You must know your data's range."
    },
    {
      "type": "h2",
      "text": "The Interview Talking Point: Python's 'No Range' Is a Feature, Not a Bug"
    },
    {
      "type": "p",
      "text": "When interviewers ask about integer ranges, they're testing whether you understand Python's design philosophy versus its practical limitations. Python's arbitrary-precision `int` eliminates an entire class of security vulnerabilities (integer overflow attacks) and makes cryptography, finance, and scientific computing possible without external libraries. But it comes at a performance cost — and it creates a knowledge gap where developers don't realize that NumPy, pandas, struct, and database drivers all use fixed-size integers under the hood. The senior engineer knows both worlds. The junior knows neither."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Python's int has no fixed range because it's arbitrary precision — a dynamic array of digits, not a fixed memory block. This is why `print(type(int))` returns `<class 'type'>`: int is a class, not a primitive, and classes are instances of `type`. But in production, you interface with C libraries, databases, and binary protocols that DO have fixed ranges. Know NumPy's dtype table by heart. Know that `struct.pack('i', x)` will raise `struct.error` on overflow. And know that pandas' default `int64` will silently wrap around or cast to float, corrupting your data. The engineer who knows when Python's 'infinite' int is a superpower — and when it's a trap — is the engineer who gets hired."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Python interviews in 2026 are not about memorizing syntax. They're about understanding the language's runtime model, memory management, concurrency primitives, and how to build systems that scale. The 50 questions in this guide cover the full spectrum: from `is` vs `==` gotchas to designing distributed rate limiters. Master these, and you'll walk into any Python interview — whether at a FAANG giant or a Series A startup — with confidence."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Python interviews test three things: (1) Can you write correct, clean code under pressure? (2) Do you understand how Python actually works under the hood? (3) Can you design systems that survive production traffic? Practice these 50 questions until you can explain the 'why' behind every answer, not just the 'how.'"
    }
  ]
};

export default post;
