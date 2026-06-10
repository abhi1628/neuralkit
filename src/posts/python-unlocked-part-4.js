const post = {
  "slug": "part-4-variables-memory",
  "seriesSlug": "python-unlocked",
  "partNumber": 4,
  "totalParts": 30,
  "title": "Variables & Memory: Names, Values, and Identity (Part 4)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 16, 2026",
  "readTime": "28 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Variables in Python are not boxes — they're labels. Uncover the truth about reference semantics, identity, interning, and why mutable vs immutable is the most important concept you'll learn. Python 3.12 features included.",
  "coverEmoji": "🏷️",
  "tags": [
    "Python",
    "Variables",
    "Memory",
    "id()",
    "is vs ==",
    "Interning",
    "Mutable",
    "Immutable",
    "Garbage Collection"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Here is the lie that most programming tutorials tell you: 'A variable is a box that holds a value.' It is a comforting metaphor. It is also wrong. In Python, a variable is not a box. It is a label — a sticky note attached to an object living somewhere in memory. When you write x = 5, you are not putting 5 into a box named x. You are creating an integer object with value 5 somewhere in memory, and then attaching the name x to it. This distinction is not academic philosophy. It is the difference between code that works and code that mysteriously breaks. It is why mutable default arguments are dangerous. It is why two variables can 'contain' the same list but changing one changes both. It is why 'is' and '==' give different answers. And it is why understanding Python's memory model makes you a fundamentally better programmer than someone who just memorizes syntax. In this part, we will use id() to spy on memory addresses, watch interning create invisible optimizations, and witness the mutable vs immutable divide that governs everything."
    },
    {
      "type": "h2",
      "text": "The Big Lie: Variables Are Not Boxes"
    },
    {
      "type": "p",
      "text": "In languages like C or Java, a variable is a named memory location. When you declare 'int x = 5', the compiler allocates 4 bytes of memory, writes the value 5 into those bytes, and associates the name x with that location. The variable IS the memory. In Python, nothing works this way. Python variables are names bound to objects. The object exists first. The name is attached second. Multiple names can attach to the same object. Detaching a name does not destroy the object. This is reference semantics, and it changes everything."
    },
    {
      "type": "code-block",
      "label": "The Label Metaphor in Action",
      "code": `# === THE LABEL METAPHOR ===
# Imagine your kitchen. You have a jar of honey on the counter.
# You put a sticky note on it that says 'sweetener'.
# Then you put another sticky note on the SAME jar that says 'tea_additive'.

# In Python:
sweetener = 'honey'
tea_additive = sweetener

# Both names point to the SAME string object in memory.
# We can prove this with id() — which returns the memory address.
print(f'id(sweetener)     = {id(sweetener)}')
print(f'id(tea_additive)  = {id(tea_additive)}')
print(f'Are they the same object? {sweetener is tea_additive}')

# Now imagine you peel off the 'sweetener' note and put it on a jar of sugar.
# The 'tea_additive' note is still on the honey jar!

sweetener = 'sugar'
print(f'\\nAfter reassignment:')
print(f'sweetener = {sweetener}')
print(f'tea_additive = {tea_additive}')
print(f'id(sweetener)     = {id(sweetener)}')
print(f'id(tea_additive)  = {id(tea_additive)}')

# Key insight: Reassigning 'sweetener' did NOT change 'tea_additive'.
# We did not 'put sugar in the box.' We moved the label to a different object.

# === VISUAL PROOF ===
# Let's watch this happen with a mutable object (a list):
jar1 = ['honey']
jar2 = jar1  # Both labels on the SAME list object

print(f'\\nBefore modification:')
print(f'jar1 = {jar1}, id = {id(jar1)}')
print(f'jar2 = {jar2}, id = {id(jar2)}')
print(f'Same object? {jar1 is jar2}')

jar1.append('sugar')  # We modify the object through one label...
print(f'\\nAfter jar1.append("sugar"):')
print(f'jar1 = {jar1}')  # ['honey', 'sugar']
print(f'jar2 = {jar2}')  # ['honey', 'sugar'] — SURPRISE!
print(f'Both changed because they point to the SAME object!')

# This is the #1 source of bugs for Python beginners.
# They think jar2 = jar1 creates a copy. It does not.
# It creates a second label for the same object.`
    },
    {
      "type": "h2",
      "text": "id(): The Memory Address Detective"
    },
    {
      "type": "p",
      "text": "The id() function returns the 'identity' of an object — a unique integer that is constant for the object's lifetime. In CPython, this is the memory address. id() is your microscope for watching Python's memory model in action. It reveals truths that are invisible to normal code."
    },
    {
      "type": "code-block",
      "label": "id() Deep Dive",
      "code": `# === id() BASICS ===
# Every object has a unique id during its lifetime.

x = 42
print(f'Value: {x}, id: {id(x)}, hex: {hex(id(x))}')

# === THE REASSIGNMENT TRAP ===
# What happens when we reassign?

a = 1000
print(f'\\na = 1000, id(a) = {id(a)}')

a = 1001
print(f'a = 1001, id(a) = {id(a)}')

# The id changed! We did not 'change the value in the box.'
# We moved the label 'a' to a completely different integer object.
# Integer 1000 still exists in memory (until garbage collected).
# Integer 1001 is a new object.

# === MUTABLE vs IMMUTABLE: THE CRITICAL DISTINCTION ===

# IMMUTABLE: Cannot be changed after creation
# Numbers, strings, tuples, frozensets

s = 'hello'
print(f'\\nString id before: {id(s)}')
s = s + ' world'  # Creates a NEW string, rebinds 's'
print(f'String id after:  {id(s)}')
print(f'New string: {s}')

# The original 'hello' string still exists somewhere.
# We just can't reach it anymore (until garbage collection).

# MUTABLE: Can be changed after creation
# Lists, dictionaries, sets, most custom objects

lst = [1, 2, 3]
print(f'\\nList id before: {id(lst)}')
lst.append(4)  # Modifies the EXISTING list object
print(f'List id after:  {id(lst)}')
print(f'Modified list:  {lst}')

# The id stayed the same! We mutated the object in place.
# This is the fundamental difference.

# === THE TUPLE TRICK ===
# Tuples are immutable... but they can contain mutable objects!

t = (1, 2, [3, 4])
print(f'\\nTuple id: {id(t)}')
print(f'Tuple contents: {t}')

# We cannot change the tuple structure...
# t[0] = 99  # TypeError: 'tuple' object does not support item assignment

# ...but we CAN mutate the list INSIDE the tuple!
t[2].append(5)
print(f'After mutating inner list: {t}')
print(f'Tuple id still: {id(t)}')

# This is not a contradiction. The tuple is immutable — its structure
# (which objects it contains) cannot change. But the objects inside it
# can change if they are mutable. This is subtle but crucial.`
    },
    {
      "type": "h2",
      "text": "is vs ==: Identity vs Equality"
    },
    {
      "type": "p",
      "text": "This is the most common source of confusion in Python interviews. == checks equality of value. is checks identity of object. Two different objects can be equal (==) but not identical (is). One object is always equal and identical to itself. Understanding when to use which separates junior developers from seniors."
    },
    {
      "type": "code-block",
      "label": "is vs == Mastery",
      "code": `# === THE FUNDAMENTAL DIFFERENCE ===
# ==  : Do these objects have the same VALUE?
# is  : Are these the SAME OBJECT in memory?

a = [1, 2, 3]
b = [1, 2, 3]

print(f'a == b : {a == b}')   # True — same values
print(f'a is b : {a is b}')   # False — different objects!

print(f'\\nid(a) = {id(a)}')
print(f'id(b) = {id(b)}')

# === WHEN TO USE is ===
# Use 'is' for singletons: None, True, False

x = None
print(f'\\nx is None: {x is None}')  # Correct
print(f'x == None: {x == None}')    # Works but discouraged (PEP 8)

# Use 'is' for identity checks, not value checks:
if x is None:
    print('x is genuinely absent')

# === THE INTERNING SURPRISE ===
# Small integers and short strings are 'interned' — cached and reused.

x = 256
y = 256
print(f'\\nSmall integers:')
print(f'x = 256, y = 256')
print(f'x == y: {x == y}')
print(f'x is y: {x is y}')  # True! Python reuses small integers.

# But larger integers are NOT interned:
x = 1000
y = 1000
print(f'\\nLarge integers:')
print(f'x = 1000, y = 1000')
print(f'x == y: {x == y}')
print(f'x is y: {x is y}')  # False! Different objects.

# Why 256? CPython caches integers from -5 to 256 at startup.
# These are the most commonly used integers.

# === STRING INTERNING ===
# Short strings that look like identifiers are also interned.

a = 'hello'
b = 'hello'
print(f'\\nShort strings:')
print(f'a is b: {a is b}')  # True — interned!

# But strings with spaces or special characters are not:
c = 'hello world'
d = 'hello world'
print(f'c is d: {c is d}')  # False — not interned automatically

# You CAN force interning with sys.intern():
import sys
e = sys.intern('hello world')
f = sys.intern('hello world')
print(f'e is f (forced intern): {e is f}')  # True!

# === THE MUTABLE DEFAULT ARGUMENT TRAP ===
# This is Python's most famous gotcha, and it stems from everything
# we've learned about mutable objects and rebinding.

def add_item_bad(item, item_list=[]):
    """DON'T DO THIS — the list is shared across all calls!"""
    item_list.append(item)
    return item_list

print(f'\\nMutable default argument trap:')
print(add_item_bad(1))  # [1]
print(add_item_bad(2))  # [1, 2] — SURPRISE! The list persisted!
print(add_item_bad(3))  # [1, 2, 3] — The default list is a SINGLE object!

# The function object is created ONCE when Python reads the def.
# The default argument [] is evaluated ONCE and stored in the function.
# Every call that doesn't provide item_list uses the SAME list object.

# CORRECT WAY:
def add_item_good(item, item_list=None):
    """CORRECT — creates a new list each time if needed."""
    if item_list is None:
        item_list = []
    item_list.append(item)
    return item_list

print(f'\\nCorrect version:')
print(add_item_good(1))  # [1]
print(add_item_good(2))  # [2] — Fresh list each time!

# We use 'is None' because None is a singleton.
# Using '== None' would work but is less precise and PEP 8 discouraged.`
    },
    {
      "type": "h2",
      "text": "Interning: Python's Hidden Optimization"
    },
    {
      "type": "p",
      "text": "Interning is Python's secret weapon for memory efficiency. When you create certain objects, Python checks if an identical object already exists. If so, it reuses the existing object instead of creating a new one. This saves memory and makes 'is' comparisons fast. But interning is not guaranteed — it is an implementation detail. Relying on it for logic is dangerous. Understanding it for performance is smart."
    },
    {
      "type": "code-block",
      "label": "Interning Explored",
      "code": `# === INTEGER INTERNING ===
# CPython caches integers -5 to 256.

import sys

print('Integer interning range:')
for i in [-7, -5, -1, 0, 1, 256, 257, 1000]:
    a = i
    b = i
    status = 'INTERNED' if a is b else 'NOT interned'
    print(f'  {i:4d}: {status}')

# === STRING INTERNING ===
# Strings that look like identifiers are interned automatically.
# This is why 'hello' is 'hello' returns True.

print(f'\\nString interning:')
print(f'  "hello" is "hello": {"hello" is "hello"}')
print(f'  "hello_world" is "hello_world": {"hello_world" is "hello_world"}')
print(f'  "hello world" is "hello world": {"hello world" is "hello world"}')
print(f'  "hello!" is "hello!": {"hello!" is "hello!"}')

# === FORCED INTERNING ===
# Use sys.intern() when you have many duplicate strings
# (e.g., reading a CSV with repeated values).

words = ['apple'] * 10000
interned_words = [sys.intern(w) for w in words]

print(f'\\nMemory with 10,000 strings:')
print(f'  Normal list: {sys.getsizeof(words):,} bytes')
print(f'  Interned list: {sys.getsizeof(interned_words):,} bytes')
print(f'  (Interned list is smaller because all entries point to same object)')

# === THE COMPILE-TIME INTERNING TRICK ===
# Python interns string literals at compile time!

a = 'hello' + ' ' + 'world'
b = 'hello world'
print(f'\\nCompile-time concatenation:')
print(f'a = "hello" + " " + "world"')
print(f'b = "hello world"')
print(f'a is b: {a is b}')  # True! Python optimizes at compile time.

# But runtime concatenation is NOT interned:
c = 'hello'
d = ' world'
e = c + d
print(f'\\nRuntime concatenation:')
print(f'e = c + d (where c="hello", d=" world")')
print(f'e is b: {e is b}')  # False! Different objects.

# === WHY THIS MATTERS ===
# Interning is an optimization, not a language guarantee.
# Never write code that depends on 'is' for value comparison.
# Always use == for value comparison.
# Use 'is' only for None, True, False, and explicit identity checks.`
    },
    {
      "type": "h2",
      "text": "Mutable vs Immutable: The Great Divide"
    },
    {
      "type": "p",
      "text": "This is the most important concept in Python. Everything else — copying, passing arguments, returning values, thread safety, hashing — depends on whether objects are mutable or immutable. Immutable objects are safe, hashable, and thread-safe. Mutable objects are flexible, efficient, and dangerous. The art of Python is knowing when to use which."
    },
    {
      "type": "code-block",
      "label": "Mutable vs Immutable: Complete Guide",
      "code": `# === IMMUTABLE OBJECTS ===
# Cannot be changed after creation. Operations create new objects.

# Numbers
x = 5
print(f'Integer {x}: id = {id(x)}')
x = x + 1  # New object!
print(f'Integer {x}: id = {id(x)}')

# Strings
s = 'hello'
print(f'\\nString "{s}": id = {id(s)}')
s = s.upper()  # New object!
print(f'String "{s}": id = {id(s)}')

# Tuples
t = (1, 2, 3)
print(f'\\nTuple {t}: id = {id(t)}')
# t[0] = 99  # TypeError! Cannot modify.
t = t + (4,)  # New tuple object!
print(f'Tuple {t}: id = {id(t)}')

# === MUTABLE OBJECTS ===
# Can be changed after creation. Operations modify in place.

# Lists
lst = [1, 2, 3]
print(f'\\nList {lst}: id = {id(lst)}')
lst.append(4)  # Same object, modified!
print(f'List {lst}: id = {id(lst)}')

# Dictionaries
d = {'a': 1}
print(f'\\nDict {d}: id = {id(d)}')
d['b'] = 2  # Same object, modified!
print(f'Dict {d}: id = {id(d)}')

# Sets
st = {1, 2}
print(f'\\nSet {st}: id = {id(st)}')
st.add(3)  # Same object, modified!
print(f'Set {st}: id = {id(st)}')

# === WHY IMMUTABLE OBJECTS CAN BE HASHED ===
# Hash values must never change. If an object is mutable,
# its hash could change, breaking dictionaries and sets.

# This works:
my_dict = {('a', 'b'): 'value'}  # Tuple is immutable, can be a key
print(f'\\nTuple as dict key: {my_dict}')

# This does NOT work:
# my_dict = {['a', 'b']: 'value'}  # TypeError! List is mutable.

# === COPYING: SHALLOW vs DEEP ===
# When you need a copy, you must choose the right kind.

import copy

# SHALLOW COPY: Copies the container, but elements are shared.
original = [[1, 2], [3, 4]]
shallow = copy.copy(original)  # or original[:], list(original)

print(f'\\nShallow copy:')
print(f'original id: {id(original)}, shallow id: {id(shallow)}')
print(f'original[0] id: {id(original[0])}, shallow[0] id: {id(shallow[0])}')
print(f'Same inner object? {original[0] is shallow[0]}')

shallow[0].append(99)
print(f'After shallow[0].append(99):')
print(f'original = {original}')  # [[1, 2, 99], [3, 4]] — CHANGED!
print(f'shallow = {shallow}')    # [[1, 2, 99], [3, 4]] — Same inner list!

# DEEP COPY: Copies everything recursively.
original2 = [[1, 2], [3, 4]]
deep = copy.deepcopy(original2)

print(f'\\nDeep copy:')
print(f'original2[0] id: {id(original2[0])}, deep[0] id: {id(deep[0])}')
print(f'Same inner object? {original2[0] is deep[0]}')

deep[0].append(99)
print(f'After deep[0].append(99):')
print(f'original2 = {original2}')  # [[1, 2], [3, 4]] — UNCHANGED!
print(f'deep = {deep}')              # [[1, 2, 99], [3, 4]] — Independent!`
    },
    {
      "type": "h2",
      "text": "Garbage Collection: Python's Memory Janitor"
    },
    {
      "type": "p",
      "text": "Python manages memory automatically through garbage collection. When no variables reference an object anymore, Python reclaims that memory. This is reference counting with a cyclic garbage collector for circular references. Understanding garbage collection helps you write memory-efficient code and avoid leaks."
    },
    {
      "type": "code-block",
      "label": "Garbage Collection in Action",
      "code": `import gc
import sys

# === REFERENCE COUNTING ===
# Every object has a reference count. When it drops to 0, the object is destroyed.

a = [1, 2, 3]
print(f'References to list: {sys.getrefcount(a) - 1}')  # -1 because getrefcount itself creates a reference

b = a  # Second reference
print(f'After b = a: {sys.getrefcount(a) - 1}')

del b  # Remove one reference
print(f'After del b: {sys.getrefcount(a) - 1}')

# === CIRCULAR REFERENCES ===
# When objects reference each other, reference counting alone cannot clean them up.

class Node:
    def __init__(self, name):
        self.name = name
        self.next = None

    def __del__(self):
        print(f'Node {self.name} is being destroyed')

# Create a circular reference
node_a = Node('A')
node_b = Node('B')
node_a.next = node_b
node_b.next = node_a

print(f'\\nCircular reference created: A <-> B')
print(f'Refcount A: {sys.getrefcount(node_a) - 1}')
print(f'Refcount B: {sys.getrefcount(node_b) - 1}')

# Even if we delete our references...
del node_a
del node_b

# The objects might not be destroyed immediately!
# The cyclic GC runs periodically to detect and clean these.

# Force garbage collection
gc.collect()
print('\\nGarbage collection completed')

# === MEMORY PROFILING ===
# See how much memory objects use

print(f'\\nMemory sizes:')
print(f'Empty list: {sys.getsizeof([])} bytes')
print(f'List [1, 2, 3]: {sys.getsizeof([1, 2, 3])} bytes')
print(f'Empty dict: {sys.getsizeof({})} bytes')
print(f'Empty string: {sys.getsizeof("")} bytes')
print(f'String "hello": {sys.getsizeof("hello")} bytes')
print(f'Integer 0: {sys.getsizeof(0)} bytes')
print(f'Integer 1000000: {sys.getsizeof(1000000)} bytes')

# === GC CONFIGURATION ===
print(f'\\nGC is enabled: {gc.isenabled()}')
print(f'GC thresholds: {gc.get_threshold()}')`
    },
    {
      "type": "h2",
      "text": "Programs: Watching Memory in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use id(), is, ==, and memory profiling to solve real problems. Each program reinforces the concepts while building something useful."
    },
    {
      "type": "code-block",
      "label": "Program 1: Memory Explorer",
      "code": `"""
Program 1: Memory Explorer
Visualizes Python's memory model with interactive demonstrations.
"""
import sys

def explore_object(obj, name='object'):
    """Explore and report on an object's memory characteristics."""
    print(f'\\n=== Exploring: {name} ===')
    print(f'  Value: {obj}')
    print(f'  Type: {type(obj).__name__}')
    print(f'  ID: {id(obj)} (hex: {hex(id(obj))})')
    print(f'  Size: {sys.getsizeof(obj)} bytes')
    print(f'  Mutable: {is_mutable(obj)}')

    if hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes)):
        print(f'  Length: {len(obj)}')
        if len(obj) > 0:
            print(f'  First element id: {id(next(iter(obj)))}')

def is_mutable(obj):
    """Check if an object is mutable."""
    mutable_types = (list, dict, set, bytearray)
    return isinstance(obj, mutable_types)

def demonstrate_rebinding():
    """Show how rebinding works with id()."""
    print('\\n=== REBINDING DEMONSTRATION ===')

    x = 1000
    print(f'x = 1000, id = {id(x)}')

    y = x
    print(f'y = x, id = {id(y)}')
    print(f'x is y: {x is y}')

    x = 1001
    print(f'\\nx = 1001, id = {id(x)}')
    print(f'y still = 1000, id = {id(y)}')
    print(f'x is y: {x is y}')
    print('y was NOT changed! We moved the label x to a new object.')

def demonstrate_mutable_alias():
    """Show the mutable alias trap."""
    print('\\n=== MUTABLE ALIAS TRAP ===')

    original = ['apple', 'banana']
    alias = original

    print(f'original = {original}, id = {id(original)}')
    print(f'alias = {alias}, id = {id(alias)}')
    print(f'Same object? {original is alias}')

    alias.append('cherry')
    print(f'\\nAfter alias.append("cherry"):')
    print(f'original = {original} — CHANGED!')
    print(f'alias = {alias}')
    print('Both changed because they point to the SAME list object.')

    # Correct way to make a copy:
    copy_list = original[:]
    copy_list.append('date')
    print(f'\\nWith copy: original = {original}, copy = {copy_list}')
    print(f'Original unchanged because copy is a different object!')

def main():
    """Main memory explorer program."""
    print('=' * 60)
    print('PYTHON MEMORY EXPLORER')
    print('Understanding how Python manages memory')
    print('=' * 60)

    # Explore different types
    explore_object(42, 'integer')
    explore_object(3.14159, 'float')
    explore_object('hello', 'string')
    explore_object([1, 2, 3], 'list')
    explore_object({'a': 1, 'b': 2}, 'dictionary')
    explore_object((1, 2, 3), 'tuple')
    explore_object({1, 2, 3}, 'set')

    demonstrate_rebinding()
    demonstrate_mutable_alias()

    print('\\n' + '=' * 60)
    print('Key Takeaways:')
    print('  • Variables are labels, not boxes')
    print('  • Immutable objects create new objects on "change"')
    print('  • Mutable objects can be modified in place')
    print('  • Assignment never copies data — it attaches labels')
    print('  • Use [:] or copy.copy() for shallow copies')
    print('  • Use copy.deepcopy() for full independence')
    print('=' * 60)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Identity Detective",
      "code": `"""
Program 2: Identity Detective
Investigates object identity and interning patterns.
"""
import sys

def compare_identity(a, b, name_a='a', name_b='b'):
    """Compare two objects for equality and identity."""
    print(f'\\nComparing {name_a} and {name_b}:')
    print(f'  {name_a} = {a!r}')
    print(f'  {name_b} = {b!r}')
    print(f'  {name_a} == {name_b}: {a == b}')
    print(f'  {name_a} is {name_b}: {a is b}')
    print(f'  id({name_a}): {id(a)}')
    print(f'  id({name_b}): {id(b)}')

    if a is b:
        print('  → SAME OBJECT (interned or explicitly shared)')
    elif a == b:
        print('  → DIFFERENT OBJECTS, SAME VALUE')
    else:
        print('  → DIFFERENT OBJECTS, DIFFERENT VALUES')

def investigate_interning():
    """Investigate Python's interning behavior."""
    print('\\n' + '=' * 60)
    print('INTERNING INVESTIGATION')
    print('=' * 60)

    # Small integers
    compare_identity(100, 100, '100', '100')
    compare_identity(256, 256, '256', '256')
    compare_identity(257, 257, '257', '257')
    compare_identity(-5, -5, '-5', '-5')
    compare_identity(-6, -6, '-6', '-6')

    # Strings
    compare_identity('hello', 'hello', '"hello"', '"hello"')
    compare_identity('hello world', 'hello world', '"hello world"', '"hello world"')

    # Forced interning
    a = sys.intern('hello world')
    b = sys.intern('hello world')
    compare_identity(a, b, 'sys.intern("hello world")', 'sys.intern("hello world")')

    # Lists (never interned)
    compare_identity([1, 2], [1, 2], '[1, 2]', '[1, 2]')

    # Tuples (can be interned if hashable and cached)
    compare_identity((1, 2), (1, 2), '(1, 2)', '(1, 2)')

def demonstrate_mutable_vs_immutable():
    """Demonstrate the mutable vs immutable distinction."""
    print('\\n' + '=' * 60)
    print('MUTABLE vs IMMUTABLE DEMONSTRATION')
    print('=' * 60)

    # Immutable: string
    s = 'hello'
    original_id = id(s)
    s = s + ' world'
    print(f'\\nString: "{s}"')
    print(f'  Original id: {original_id}')
    print(f'  New id: {id(s)}')
    print(f'  → ID CHANGED (new object created)')

    # Mutable: list
    lst = [1, 2, 3]
    original_id = id(lst)
    lst.append(4)
    print(f'\\nList: {lst}')
    print(f'  Original id: {original_id}')
    print(f'  New id: {id(lst)}')
    print(f'  → ID SAME (object modified in place)')

def main():
    """Main identity detective program."""
    print('=' * 60)
    print('IDENTITY DETECTIVE')
    print('Uncovering the truth about Python objects')
    print('=' * 60)

    investigate_interning()
    demonstrate_mutable_vs_immutable()

    print('\\n' + '=' * 60)
    print('Investigation Complete!')
    print('Remember:')
    print('  • == checks VALUE (use this almost always)')
    print('  • is checks IDENTITY (use for None, True, False)')
    print('  • Interning is an optimization, not a guarantee')
    print('  • Mutable objects are shared by default — copy when needed')
    print('=' * 60)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Safe Configuration Builder",
      "code": `"""
Program 3: Safe Configuration Builder
Demonstrates proper handling of mutable default arguments.
"""
import copy

class Config:
    """A safe configuration class that avoids mutable default traps."""

    def __init__(self, settings=None, tags=None):
        """Initialize configuration with safe defaults."""
        self.settings = settings if settings is not None else {}
        self.tags = tags if tags is not None else []

    def add_setting(self, key, value):
        """Add a configuration setting."""
        self.settings[key] = value

    def add_tag(self, tag):
        """Add a configuration tag."""
        self.tags.append(tag)

    def copy(self):
        """Create a deep copy of this configuration."""
        return Config(
            settings=copy.deepcopy(self.settings),
            tags=copy.deepcopy(self.tags)
        )

    def __repr__(self):
        return f'Config(settings={self.settings!r}, tags={self.tags!r})'

def demonstrate_safe_config():
    """Show why the safe pattern matters."""
    print('\\n=== SAFE CONFIGURATION PATTERN ===')

    config1 = Config()
    config2 = Config()

    print(f'Config 1: {config1}')
    print(f'Config 2: {config2}')
    print(f'Same settings object? {config1.settings is config2.settings}')

    config1.add_setting('debug', True)
    config1.add_tag('production')

    print(f'\\nAfter modifying config1:')
    print(f'Config 1: {config1}')
    print(f'Config 2: {config2}')
    print(f'Config 2 unchanged? {config2.settings == {}}')

def demonstrate_bad_config():
    """Show the DANGEROUS mutable default pattern."""
    print('\\n=== DANGEROUS PATTERN (DON\\'T DO THIS) ===')

    class BadConfig:
        def __init__(self, settings={}, tags=[]):
            self.settings = settings
            self.tags = tags

    bad1 = BadConfig()
    bad2 = BadConfig()

    print(f'BadConfig 1: {bad1.__dict__}')
    print(f'BadConfig 2: {bad2.__dict__}')
    print(f'Same settings object? {bad1.settings is bad2.settings}')

    bad1.settings['debug'] = True
    print(f'\\nAfter modifying bad1:')
    print(f'BadConfig 1: {bad1.__dict__}')
    print(f'BadConfig 2: {bad2.__dict__}')
    print('Both share the SAME default dict object!')

def main():
    """Main configuration builder program."""
    print('=' * 60)
    print('SAFE CONFIGURATION BUILDER')
    print('Learning from Python\\'s most famous gotcha')
    print('=' * 60)

    demonstrate_safe_config()
    demonstrate_bad_config()

if __name__ == '__main__':
    main()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 5. 4/5 correct means you have mastered Python's memory model. If not, re-run the programs and re-read the relevant sections."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain the difference between 'variables are boxes' and 'variables are labels.' Use the kitchen jar metaphor to explain what happens when you reassign a variable.",
        "Q2: What does id() return in CPython? Write a program that proves two variables point to the same object, then prove that reassigning one does not affect the other.",
        "Q3: Explain the mutable default argument trap. Why does def f(lst=[]) cause bugs? Write the CORRECT version using None as the default.",
        "Q4: What is the difference between == and is? When should you use each? Give a specific example where == returns True but is returns False.",
        "Q5: What is interning? Which integers are interned by CPython? Demonstrate with code that 256 is 256 returns True but 257 is 257 returns False (or may return False). Explain why this is an implementation detail, not a language guarantee."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: In the 'boxes' model, a variable is a container that holds a value. Reassignment puts a new value in the same box. In the 'labels' model, a variable is a name attached to an object. Reassignment detaches the label from one object and attaches it to another. The kitchen jar metaphor: you have a jar of honey with a label 'sweetener.' You peel off the label and put it on a jar of sugar. The honey jar still exists, but it no longer has the 'sweetener' label. A2: id() returns the memory address in CPython. Program: a = [1, 2, 3]; b = a; print(id(a) == id(b)) # True. Then a = [4, 5, 6]; print(id(a) == id(b)) # False. b still points to [1, 2, 3]. A3: def f(lst=[]) evaluates [] ONCE when the function is defined, not each time it is called. All calls that don't provide lst share the SAME list. Correct: def f(lst=None): if lst is None: lst = []. A4: == checks value equality. is checks object identity (same memory address). Use == for value comparison. Use is for None, True, False, and explicit identity checks. Example: a = [1, 2, 3]; b = [1, 2, 3]; a == b is True (same values), a is b is False (different objects). A5: Interning is reusing identical immutable objects to save memory. CPython interns integers from -5 to 256. 256 is 256 returns True because both names point to the pre-allocated integer. 257 is 257 may return False because 257 is not interned — each 257 is a separate object. This is an implementation detail because other Python implementations (PyPy, Jython) may intern different ranges."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have learned the most important concept in Python: variables are labels, not boxes. You understand that assignment attaches names to objects, never copies data. You use id() to spy on memory, is vs == correctly, and avoid the mutable default argument trap. You know that immutable objects create new objects on 'change' while mutable objects modify in place. You understand shallow vs deep copy, interning, and garbage collection. This is not just syntax knowledge. This is a mental model that will prevent bugs for the rest of your Python career."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Every bug you will ever encounter in Python — from list aliasing to dictionary mutation to unexpected function behavior — traces back to the mutable vs immutable distinction and the label semantics of variables. Master this part, and you have mastered the foundation of Python thinking. In Part 5, we will explore numbers and mathematics: arbitrary precision integers, the float trap, complex numbers, and the math modules that power real-world applications."
    },
    {
      "type": "cta",
      "text": "Start Part 5: Numbers & Mathematics →",
      "href": "/tutorials/python-unlocked/part-5-numbers-math",
      "note": "26 min read · Integers · Floats · Complex · Monte Carlo"
    }
  ]
};

export default post;
