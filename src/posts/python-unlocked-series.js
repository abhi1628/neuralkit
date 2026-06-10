const seriesData = {
  "slug": "python-unlocked",
  "title": "Python Unlocked: The Zero-to-Craft Series",
  "description": "The complete Python programming journey. Master Python 3.12 from first principles to production-ready craft — 30 parts, 30 projects, zero restarts. Every concept taught with the 'why' before the 'how', every program built from scratch.",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "coverEmoji": "🐍",
  "tags": [
    "Python",
    "Programming",
    "Python 3.12",
    "Software Development",
    "Computer Science",
    "Tutorial Series"
  ],
  "totalParts": 30,
  "estimatedTime": "60-80 hours",
  "difficulty": "Beginner to Advanced",
  "prerequisites": [
    "A computer",
    "Curiosity",
    "No prior programming required"
  ],
  "parts": [
    {
      "partNumber": 1,
      "slug": "part-1-philosophy-origin",
      "title": "The Philosophy of Python: Where Craft Begins",
      "readTime": "20 min read",
      "date": "June 10, 2026",
      "excerpt": "Before writing a single line, understand the soul of Python. From Guido van Rossum's Christmas hobby to the Zen of Python — learn why this language thinks differently than all others.",
      "learningObjectives": [
        "Understand Python's origin story and design philosophy",
        "Decode every aphorism in 'import this' with real-world meaning",
        "Know why Python 3.12 matters and what makes it special",
        "Distinguish Python's 'one obvious way' from other languages' 'many ways'",
        "Set up a world-class development environment that scales with you"
      ]
    },
    {
      "partNumber": 2,
      "slug": "part-2-environment-craft",
      "title": "Your Forge: Building the Perfect Python Environment",
      "readTime": "25 min read",
      "date": "June 12, 2026",
      "excerpt": "The craftsman is only as good as their tools. VS Code, PyCharm, virtual environments, and the hidden magic of how Python actually runs your code — bytecode, REPLs, and the execution model.",
      "learningObjectives": [
        "Configure VS Code or PyCharm like a senior engineer",
        "Master virtual environments: venv, conda, poetry, uv",
        "Understand CPython, bytecode, and the execution pipeline",
        "Use the REPL as a thinking tool, not just a calculator",
        "Set up linting, formatting, and type-checking from day one"
      ]
    },
    {
      "partNumber": 3,
      "slug": "part-3-hello-world-anatomy",
      "title": "Hello World & The Anatomy of a Python Program",
      "readTime": "22 min read",
      "date": "June 14, 2026",
      "excerpt": "Every masterpiece starts with a single stroke. print(), input(), comments, docstrings, and the hidden machinery that makes a Python script run — from shebang to __main__.",
      "learningObjectives": [
        "Write your first Python program and understand every character",
        "Master print() beyond 'Hello World': sep, end, file, flush",
        "Use input() safely and handle user data correctly",
        "Write docstrings that professional developers actually read",
        "Understand if __name__ == '__main__' once and for all"
      ]
    },
    {
      "partNumber": 4,
      "slug": "part-4-variables-memory",
      "title": "Variables & Memory: Names, Values, and Identity",
      "readTime": "28 min read",
      "date": "June 16, 2026",
      "excerpt": "Variables in Python are not boxes — they're labels. Uncover the truth about reference semantics, identity, interning, and why mutable vs immutable is the most important concept you'll learn.",
      "learningObjectives": [
        "Understand that variables are names, not containers",
        "Use id(), is, and == to probe Python's memory model",
        "Discover interning: why 'hello' is 'hello' returns True",
        "Predict behavior with mutable vs immutable objects",
        "Trace memory with garbage collection basics"
      ]
    },
    {
      "partNumber": 5,
      "slug": "part-5-numbers-math",
      "title": "Numbers & Mathematics: From Integers to Infinity",
      "readTime": "26 min read",
      "date": "June 18, 2026",
      "excerpt": "Python handles numbers like no other language. Arbitrary precision integers, the float trap, complex numbers for quantum computing, and the math modules that power real-world applications.",
      "learningObjectives": [
        "Master integers: arbitrary precision and the sys.maxsize myth",
        "Navigate floats: IEEE 754, 0.1 + 0.2, and the decimal module",
        "Use complex numbers for signal processing and quantum states",
        "Leverage math, statistics, random, and secrets modules",
        "Build a Monte Carlo simulation and a cryptographically secure token"
      ]
    },
    {
      "partNumber": 6,
      "slug": "part-6-strings-unicode",
      "title": "Strings: The Art of Text in a Unicode World",
      "readTime": "30 min read",
      "date": "June 20, 2026",
      "excerpt": "Every string is a story. Unicode, UTF-8, code points, string methods arsenal, triple quotes, and the encoding wars that every developer must understand to handle text correctly.",
      "learningObjectives": [
        "Understand Unicode, UTF-8, and why len('🐍') == 1",
        "Master every string method with real-world use cases",
        "Use triple quotes for docstrings, multi-line, and f-strings",
        "Handle string interning and performance implications",
        "Navigate str vs bytes: encoding, decoding, and file I/O"
      ]
    },
    {
      "partNumber": 7,
      "slug": "part-7-string-formatting",
      "title": "String Formatting Mastery: From % to f-strings",
      "readTime": "24 min read",
      "date": "June 22, 2026",
      "excerpt": "Formatting is communication. From legacy % formatting to modern f-string debug expressions in Python 3.12 — learn every technique and when to use each for maximum clarity.",
      "learningObjectives": [
        "Read legacy % formatting when you encounter it in old code",
        "Use str.format() with positional, named, and nested arguments",
        "Master f-strings: expressions, debug '=', format specifiers",
        "Apply Template strings for safe user-generated substitutions",
        "Build dynamic SQL queries safely and receipt generators"
      ]
    },
    {
      "partNumber": 8,
      "slug": "part-8-boolean-operators",
      "title": "Boolean Logic & Operators: The Decision Engine",
      "readTime": "22 min read",
      "date": "June 24, 2026",
      "excerpt": "Every program is a series of decisions. Truthiness, short-circuit evaluation, bitwise operations, and the operator precedence that separates working code from subtle bugs.",
      "learningObjectives": [
        "Master truthiness: what evaluates to True and False",
        "Exploit short-circuit evaluation in and, or, not",
        "Use bitwise operators for flags, permissions, and optimization",
        "Navigate operator precedence without memorizing tables",
        "Build a permission system and a truth table generator"
      ]
    },
    {
      "partNumber": 9,
      "slug": "part-9-conditionals-match",
      "title": "Conditionals & Pattern Matching: Beyond if-else",
      "readTime": "26 min read",
      "date": "June 26, 2026",
      "excerpt": "if-else is just the beginning. Guard clauses, the ternary operator, and Python 3.10+'s match statement — structural pattern matching that brings Python into the modern era.",
      "learningObjectives": [
        "Write clean if-elif-else chains with guard clauses",
        "Use the ternary operator for concise conditional expressions",
        "Master match-case: literals, variables, sequences, mappings",
        "Apply structural pattern matching to real data parsing",
        "Build a command parser and a Zodiac sign finder"
      ]
    },
    {
      "partNumber": 10,
      "slug": "part-10-lists-workhorse",
      "title": "Lists: Python's Dynamic Workhorse",
      "readTime": "28 min read",
      "date": "June 28, 2026",
      "excerpt": "Lists are where Python shines. Dynamic arrays, amortized O(1) append, list comprehensions, slicing wizardry, and the shallow vs deep copy trap that catches even seniors.",
      "learningObjectives": [
        "Understand lists as dynamic arrays with amortized growth",
        "Master every list method: append, extend, insert, pop, remove",
        "Write list comprehensions that replace loops elegantly",
        "Slice like a pro: negative indices, steps, itertools.islice",
        "Avoid the shallow copy trap with deep copy techniques"
      ]
    },
    {
      "partNumber": 11,
      "slug": "part-11-tuples-immutability",
      "title": "Tuples & Immutability: The Power of Frozen Data",
      "readTime": "24 min read",
      "date": "June 30, 2026",
      "excerpt": "Tuples are not just 'frozen lists' — they're a different species. Hashability, packing/unpacking, named tuples, and the id() trick that proves concatenation creates new life.",
      "learningObjectives": [
        "Understand why tuples exist: hashability, performance, intent",
        "Master tuple packing/unpacking and the *rest syntax",
        "Use namedtuple and typing.NamedTuple for self-documenting code",
        "Demonstrate with id() that tuple 'modification' creates new objects",
        "Build coordinate systems and immutable configurations"
      ]
    },
    {
      "partNumber": 12,
      "slug": "part-12-dictionaries-hash-tables",
      "title": "Dictionaries & Hash Tables: The Engine Room",
      "readTime": "30 min read",
      "date": "July 2, 2026",
      "excerpt": "Dictionaries are Python's most powerful data structure. Hash tables explained, dictionary views, comprehensions, and the collections that extend dict into specialized weapons.",
      "learningObjectives": [
        "Understand how hash tables make dict O(1) for lookup",
        "Master dictionary methods, views, and iteration patterns",
        "Write dictionary comprehensions for data transformation",
        "Use defaultdict, Counter, OrderedDict, and ChainMap",
        "Merge dictionaries with |, |=, and ** unpacking"
      ]
    },
    {
      "partNumber": 13,
      "slug": "part-13-sets-set-theory",
      "title": "Sets & Set Theory: Mathematical Precision in Code",
      "readTime": "22 min read",
      "date": "July 4, 2026",
      "excerpt": "Sets bring mathematics into programming. Union, intersection, difference, symmetric difference — and the O(1) membership testing that makes them indispensable.",
      "learningObjectives": [
        "Apply set operations: union, intersection, difference, symmetric difference",
        "Use set comprehensions and frozensets for immutable collections",
        "Leverage O(1) membership testing for performance",
        "Solve real-world problems: deduplication, relationship analysis",
        "Build Venn diagram generators and mutual friends finders"
      ]
    },
    {
      "partNumber": 14,
      "slug": "part-14-range-enumerate-zip",
      "title": "Range, Enumerate, Zip & Iteration Tools",
      "readTime": "24 min read",
      "date": "July 6, 2026",
      "excerpt": "Iteration is the heartbeat of Python. range's lazy magic, enumerate's index-value dance, zip's parallel streams, and itertools — the standard library's hidden gem.",
      "learningObjectives": [
        "Use range for memory-efficient iteration and indexing",
        "Master enumerate for clean index+value loops",
        "Zip multiple iterables in parallel with zip and zip_longest",
        "Apply map, filter, and itertools: cycle, chain, product",
        "Build multiplication tables, password generators, and data pipelines"
      ]
    },
    {
      "partNumber": 15,
      "slug": "part-15-for-while-loops",
      "title": "For & While Loops: The Rhythm of Repetition",
      "readTime": "26 min read",
      "date": "July 8, 2026",
      "excerpt": "Loops are where programs come alive. for vs while, break, continue, and the else clause that nobody teaches — the hidden gem that makes Python loops uniquely powerful.",
      "learningObjectives": [
        "Choose between for and while with confidence",
        "Use break, continue, and the else clause correctly",
        "Understand the 'nobody broke out' semantics of loop else",
        "Navigate nested loops and complexity analysis",
        "Build Fibonacci generators, prime sieves, and number pyramids"
      ]
    },
    {
      "partNumber": 16,
      "slug": "part-16-functions-building-blocks",
      "title": "Functions: The Building Blocks of Craft",
      "readTime": "28 min read",
      "date": "July 10, 2026",
      "excerpt": "Functions are where you stop writing scripts and start engineering. Parameters vs arguments, scope rules, first-class functions, and the LEGB rule that governs everything.",
      "learningObjectives": [
        "Define functions with clarity: def, return, docstrings",
        "Master parameters: positional, keyword, default, *args, **kwargs",
        "Understand scope: LEGB rule, global, nonlocal",
        "Pass functions as arguments and return them from functions",
        "Build a calculator, factorial function, and flexible logger"
      ]
    },
    {
      "partNumber": 17,
      "slug": "part-17-recursion-advanced-functions",
      "title": "Recursion & Advanced Functions: Thinking in Circles",
      "readTime": "30 min read",
      "date": "July 12, 2026",
      "excerpt": "Recursion is elegance made executable. Base cases, recursive cases, memoization, and type hints — plus why Python's recursion limit exists and how to work around it.",
      "learningObjectives": [
        "Write recursive functions with proper base and recursive cases",
        "Apply memoization: manual and functools.lru_cache",
        "Understand Python's recursion limit and tail recursion limitations",
        "Use type hints: typing module, Callable, Optional, Union",
        "Build Tower of Hanoi, memoized Fibonacci, and directory walkers"
      ]
    },
    {
      "partNumber": 18,
      "slug": "part-18-lambda-functional",
      "title": "Lambda & Functional Programming: Code as Expression",
      "readTime": "26 min read",
      "date": "July 14, 2026",
      "excerpt": "Lambda functions are Python's way of saying 'this logic is temporary but important.' map, filter, reduce, partial functions, and the functional mindset that makes code declarative.",
      "learningObjectives": [
        "Write lambda functions for simple, throwaway operations",
        "Use map, filter, reduce for functional data processing",
        "Apply sorted with custom key functions",
        "Create partial functions with functools.partial",
        "Build data pipelines and sorting systems with functional style"
      ]
    },
    {
      "partNumber": 19,
      "slug": "part-19-closures-lexical",
      "title": "Closures & Lexical Scoping: Functions with Memory",
      "readTime": "28 min read",
      "date": "July 16, 2026",
      "excerpt": "A closure is a function that remembers. Factory functions, counter closures, the late binding trap, and nonlocal — the keyword that makes stateful functions possible.",
      "learningObjectives": [
        "Define closures: function + enclosing environment",
        "Build factory functions that generate customized functions",
        "Use nonlocal for mutable state in nested functions",
        "Avoid the late binding closure trap (the classic gotcha)",
        "Create configuration builders and counter factories"
      ]
    },
    {
      "partNumber": 20,
      "slug": "part-20-decorators-superpower",
      "title": "Decorators: Python's Superpower",
      "readTime": "32 min read",
      "date": "July 18, 2026",
      "excerpt": "Decorators are the most Pythonic feature of Python. @syntax, wrappers, functools.wraps, decorators with arguments, and built-in decorators that transform classes and methods.",
      "learningObjectives": [
        "Write function decorators with @syntax and wrapper functions",
        "Preserve metadata with functools.wraps",
        "Create decorators that accept arguments (the double-wrap pattern)",
        "Use built-in decorators: @property, @staticmethod, @classmethod",
        "Build timing, retry, authentication, and caching decorators"
      ]
    },
    {
      "partNumber": 21,
      "slug": "part-21-generators-iterators",
      "title": "Generators & Iterators: Lazy Evaluation Magic",
      "readTime": "30 min read",
      "date": "July 20, 2026",
      "excerpt": "Generators are Python's secret weapon for memory efficiency. The iterator protocol, yield, yield from, generator expressions, and memory profiling that proves their power.",
      "learningObjectives": [
        "Implement the iterator protocol: __iter__, __next__, StopIteration",
        "Write generator functions with yield and state suspension",
        "Use generator expressions vs list comprehensions for memory",
        "Delegate with yield from for cleaner sub-generator integration",
        "Profile memory: sys.getsizeof() comparisons for millions of items"
      ]
    },
    {
      "partNumber": 22,
      "slug": "part-22-file-handling",
      "title": "File Handling: Reading, Writing, and Persisting Data",
      "readTime": "28 min read",
      "date": "July 22, 2026",
      "excerpt": "Files are where programs meet the real world. open(), context managers, text vs binary, pathlib, and the JSON/CSV/pickle formats that every developer must handle.",
      "learningObjectives": [
        "Use open() correctly with context managers (with statement)",
        "Handle text vs binary files and encoding specification",
        "Navigate file pointers with seek() and tell()",
        "Use pathlib for object-oriented path manipulation",
        "Process JSON, CSV, and pickle with real-world examples"
      ]
    },
    {
      "partNumber": 23,
      "slug": "part-23-exception-handling",
      "title": "Exception Handling: Graceful Failure",
      "readTime": "26 min read",
      "date": "July 24, 2026",
      "excerpt": "Exceptions are not errors — they're communication. try-except-else-finally, custom exceptions, exception chaining, and the EAFP philosophy that makes Python code robust.",
      "learningObjectives": [
        "Structure try-except-else-finally blocks correctly",
        "Understand the exception hierarchy and built-in exceptions",
        "Create custom exception classes with inheritance",
        "Chain exceptions with raise...from and __cause__",
        "Apply EAFP vs LBYL philosophy in real code"
      ]
    },
    {
      "partNumber": 24,
      "slug": "part-24-modules-packages",
      "title": "Modules & Packages: Organizing Code at Scale",
      "readTime": "28 min read",
      "date": "July 26, 2026",
      "excerpt": "Small scripts grow into large systems. import mechanics, __init__.py, namespace packages, and building installable packages with pyproject.toml — the modern way to distribute Python.",
      "learningObjectives": [
        "Understand import mechanics and sys.path",
        "Use __init__.py, relative vs absolute imports correctly",
        "Build namespace packages for large project organization",
        "Create installable packages with setup.py and pyproject.toml",
        "Manage dependencies with modern tools: poetry, uv, pip"
      ]
    },
    {
      "partNumber": 25,
      "slug": "part-25-oop-foundations",
      "title": "OOP Foundations: Classes, Objects, and Self",
      "readTime": "30 min read",
      "date": "July 28, 2026",
      "excerpt": "Object-oriented programming is where data and behavior unite. Classes, __init__, self, attributes, methods, and encapsulation — the foundation of every large Python codebase.",
      "learningObjectives": [
        "Define classes and instantiate objects with __init__",
        "Distinguish instance, class, and static attributes",
        "Write instance, class, and static methods correctly",
        "Apply encapsulation: public, protected, private (name mangling)",
        "Build a bank account, student record, and shape hierarchy"
      ]
    },
    {
      "partNumber": 26,
      "slug": "part-26-oop-inheritance-polymorphism",
      "title": "OOP: Inheritance & Polymorphism — Code Reuse",
      "readTime": "28 min read",
      "date": "July 30, 2026",
      "excerpt": "Inheritance is code reuse done right. Single inheritance, super(), MRO, multiple inheritance, abstract base classes, and duck typing — Python's flexible approach to OOP.",
      "learningObjectives": [
        "Use single inheritance and super() correctly",
        "Navigate multiple inheritance and the diamond problem",
        "Understand Method Resolution Order (MRO) with __mro__",
        "Create abstract base classes with abc and abstractmethod",
        "Apply duck typing: 'if it walks like a duck...'"
      ]
    },
    {
      "partNumber": 27,
      "slug": "part-27-oop-magic-methods",
      "title": "OOP: Magic Methods & Protocols — Python's Hidden Language",
      "readTime": "32 min read",
      "date": "August 1, 2026",
      "excerpt": "Magic methods are Python's protocol system. __str__, __repr__, __eq__, __hash__, __len__, __getitem__, __call__ — the dunder methods that make objects Pythonic.",
      "learningObjectives": [
        "Implement __str__, __repr__, __eq__, __hash__, __len__",
        "Add arithmetic magic: __add__, __mul__, __lt__",
        "Build container protocol: __getitem__, __setitem__, __contains__",
        "Create context managers with __enter__ and __exit__",
        "Make objects callable with __call__"
      ]
    },
    {
      "partNumber": 28,
      "slug": "part-28-oop-metaclasses-descriptors",
      "title": "OOP: Metaclasses & Descriptors — The Deep Magic",
      "readTime": "30 min read",
      "date": "August 3, 2026",
      "excerpt": "Metaclasses are 'classes of classes.' Descriptors are the protocol behind @property. __slots__ saves memory. This is the deep magic that separates experts from practitioners.",
      "learningObjectives": [
        "Understand metaclasses: type, __new__, __init_subclass__",
        "Write descriptors: __get__, __set__, __delete__",
        "Use @property as a descriptor and build custom properties",
        "Optimize memory with __slots__ and attribute restriction",
        "Build singletons, validated attributes, and ORM-like fields"
      ]
    },
    {
      "partNumber": 29,
      "slug": "part-29-standard-library-treasure",
      "title": "The Standard Library Treasure Hunt",
      "readTime": "28 min read",
      "date": "August 5, 2026",
      "excerpt": "Python's 'batteries included' philosophy is real. collections, itertools, functools, contextlib, dataclasses, enum — the modules that make you write less code and do more.",
      "learningObjectives": [
        "Use collections: deque, ChainMap, Counter, defaultdict",
        "Leverage itertools: infinite iterators, combinatoric generators",
        "Apply functools: lru_cache, partial, singledispatch",
        "Create context managers with contextlib",
        "Build data classes with @dataclass and enumerations with enum"
      ]
    },
    {
      "partNumber": 30,
      "slug": "part-30-final-project-framework",
      "title": "The Final Project: Build Your Pythonic Framework",
      "readTime": "35 min read",
      "date": "August 7, 2026",
      "excerpt": "Combine everything: decorators, generators, context managers, OOP, file handling, exception handling. Build a complete, tested, documented Python package that proves your mastery.",
      "learningObjectives": [
        "Design a mini web framework or task scheduler from scratch",
        "Apply decorators, generators, and context managers together",
        "Write tests with pytest and document with docstrings",
        "Package and distribute with pyproject.toml",
        "Demonstrate mastery of all 30 parts in one cohesive project"
      ]
    }
  ]
};

export default seriesData;