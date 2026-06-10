const post = {
  "slug": "part-12-dictionaries-hash-tables",
  "seriesSlug": "python-unlocked",
  "partNumber": 12,
  "totalParts": 30,
  "title": "Dictionaries & Hash Tables: The Engine of Python (Part 12)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "30 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Hash tables explained: how dict works under the hood. Dictionary methods, comprehensions, defaultdict, Counter, OrderedDict. Merging dicts: |, |=, ** unpacking. Four complete programs. Python 3.12 features included.",
  "coverEmoji": "🗝️",
  "tags": [
    "Python", "Dictionaries", "Hash Tables", "dict",
    "defaultdict", "Counter", "OrderedDict", "Merging",
    "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1953, IBM engineer Hans Peter Luhn invented the hash table. He was trying to speed up information retrieval, and he discovered that if you map keys to array indices using a hash function, you can find any item in O(1) time. Seventy-three years later, in 2026, Python dictionaries are the most used data structure on Earth. They power JSON APIs, configuration systems, caches, counters, and virtually every Python program ever written. But here is what most tutorials miss: Python dictionaries are not just key-value containers. They are highly optimized hash tables with open addressing, dynamic resizing, and a insertion-ordered guarantee since Python 3.7. They support union operators, pattern matching, and a rich ecosystem of specialized variants: defaultdict, Counter, OrderedDict. In this part, we will explore the full depth of Python's dictionary machinery. You will learn how hash tables work under the hood, why dicts are O(1) for lookup, how to merge dictionaries with | and |=, and why defaultdict eliminates entire classes of KeyError bugs. By the end, dictionaries will not be a mystery. They will be the engine that powers your programs."
    },
    {
      "type": "h2",
      "text": "Hash Tables: How dict Works Under the Hood"
    },
    {
      "type": "p",
      "text": "A dictionary is a hash table. Understanding hash tables means understanding why dict operations are fast, why keys must be hashable, and what happens during collisions. Python's dict implementation uses open addressing with quadratic probing, dynamic resizing at 2/3 capacity, and a compact, ordered storage model. This is not abstract theory — it explains real behavior you see every day."
    },
    {
      "type": "code-block",
      "label": "Hash Table Internals",
      "code": `# === HASH TABLES EXPLAINED ===
# A hash table maps keys to values using a hash function.
# The hash function converts any key into an integer index.

# --- The hash() function ---
print("Hash values:")
print(f"  hash('hello')     = {hash('hello')}")
print(f"  hash(42)          = {hash(42)}")
print(f"  hash((1, 2))      = {hash((1, 2))}")

# Lists are unhashable (mutable = cannot be hashed)
try:
    hash([1, 2])
except TypeError as e:
    print(f"  hash([1, 2])      = {e}")

# --- Why keys must be hashable ---
# The hash determines the bucket (array index).
# If the key changes, the hash changes, and the key is lost.

# --- Collision handling ---
# When two keys hash to the same index, Python uses open addressing
# with quadratic probing: try index, index+1, index+4, index+9, ...

# --- Dynamic resizing ---
# When the table is 2/3 full, Python doubles the size and rehashes all keys.
# This is why dicts grow smoothly but occasionally pause to resize.

import sys

# Watch dict grow
d = {}
for i in range(20):
    d[i] = i
    size = sys.getsizeof(d)
    print(f"  Items: {len(d):2d} | Size: {size:3d} bytes | Ratio: {size/len(d):.1f}")

# --- The insertion order guarantee (Python 3.7+) ---
# Dictionaries remember insertion order as an implementation detail.
# In Python 3.7+, this became part of the language specification.

ordered = {}
ordered['z'] = 1
ordered['a'] = 2
ordered['m'] = 3
print(f"\nInsertion order preserved: {list(ordered.keys())}")

# --- Performance characteristics ---
# lookup: O(1) average, O(n) worst case (all keys collide)
# insert: O(1) average, O(n) worst case
# delete: O(1) average
# resize: O(n) when triggered

import time

def benchmark_lookup(size):
    d = {i: i for i in range(size)}
    start = time.perf_counter()
    for _ in range(10000):
        _ = d[size // 2]
    return time.perf_counter() - start

print("\nLookup benchmarks (10,000 lookups):")
for size in [1000, 10000, 100000, 1000000]:
    t = benchmark_lookup(size)
    print(f"  Size {size:7d}: {t:.6f}s (O(1) confirmed!)")

print("\nHash table internals complete!")`
    },
    {
      "type": "h2",
      "text": "Dictionary Methods: The Complete Arsenal"
    },
    {
      "type": "p",
      "text": "Python dictionaries have 11 essential methods and operators. Each has a specific use case, a time complexity, and a mutability contract. Knowing these by heart makes you write dict code that is both correct and efficient. The golden rule: methods that access data return values. Methods that modify data return None or the dict itself."
    },
    {
      "type": "code-block",
      "label": "Dictionary Methods Mastery",
      "code": `# === DICTIONARY METHODS: THE COMPLETE SET ===

user = {'name': 'Alice', 'age': 30, 'city': 'NYC'}

# 1. get(key, default=None) — O(1). Safe access.
print(f"get('name'): {user.get('name')}")
print(f"get('job', 'Unknown'): {user.get('job', 'Unknown')}")

# 2. keys() — O(1). Returns dict_keys view (dynamic, not a copy).
print(f"\nkeys(): {user.keys()}")
print(f"type: {type(user.keys()).__name__}")

# 3. values() — O(1). Returns dict_values view.
print(f"values(): {user.values()}")

# 4. items() — O(1). Returns dict_items view of (key, value) tuples.
print(f"items(): {user.items()}")

# 5. pop(key, [default]) — O(1). Remove and return value.
job = user.pop('age', 'N/A')
print(f"\npop('age'): {job}, remaining: {user}")

# 6. popitem() — O(1). Remove and return last inserted (key, value).
user['age'] = 30  # Restore
last = user.popitem()
print(f"popitem(): {last}, remaining: {user}")

# 7. update([other]) — O(len(other)). Merge another dict or iterable.
user.update({'age': 30, 'job': 'Engineer'})
print(f"\nupdate(): {user}")

# 8. setdefault(key, default) — O(1). Get value, set if missing.
user.setdefault('skills', []).append('Python')
user.setdefault('skills', []).append('Rust')
print(f"setdefault: {user['skills']}")

# 9. clear() — O(1). Remove all items.
temp = user.copy()
temp.clear()
print(f"\nclear(): {temp}")

# 10. copy() — O(n). Shallow copy.
original = {'data': [1, 2, 3]}
shallow = original.copy()
shallow['data'].append(4)
print(f"Shallow copy trap: original={original['data']}")

# 11. fromkeys(seq, [value]) — O(len(seq)). Class method.
keys = ['a', 'b', 'c']
d = dict.fromkeys(keys, 0)
print(f"\nfromkeys: {d}")

# === THE | OPERATOR (Python 3.9+) ===
# Merge two dicts into a new one (like sets)

d1 = {'a': 1, 'b': 2}
d2 = {'b': 3, 'c': 4}
merged = d1 | d2
print(f"\nd1 | d2 = {merged} (right wins on conflict)")

# === THE |= OPERATOR (Python 3.9+) ===
# Update in-place (like update())

d1 |= d2
print(f"d1 |= d2: {d1}")

# === ** UNPACKING ===
# Merge dicts in function calls or literals

base = {'host': 'localhost', 'port': 8080}
override = {'port': 3000, 'debug': True}
combined = {**base, **override}
print(f"\n**unpacking: {combined}")

# === IN OPERATOR ===
# Check key existence (O(1))

print(f"\n'name' in user: {'name' in user}")
print(f"'salary' in user: {'salary' in user}")

# === LEN() ===
# Number of key-value pairs

print(f"len(user): {len(user)}")

print("\nDictionary methods mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Dictionary Comprehensions: Declarative Dict Building"
    },
    {
      "type": "p",
      "text": "Dictionary comprehensions are the dict equivalent of list comprehensions. They transform loops into declarative expressions that build dictionaries in a single line. They are faster than equivalent for loops, more readable, and pair naturally with zip, enumerate, and filtering."
    },
    {
      "type": "code-block",
      "label": "Dictionary Comprehensions Mastery",
      "code": `# === BASIC DICT COMPREHENSION ===
# {key_expr: value_expr for item in iterable}

# Squares mapping
squares = {x: x**2 for x in range(10)}
print(f"Squares: {squares}")

# === COMPREHENSION WITH FILTER ===
# {k: v for item in iterable if condition}

even_squares = {x: x**2 for x in range(20) if x % 2 == 0}
print(f"\nEven squares: {even_squares}")

# === FROM TWO LISTS ===
# zip pairs elements, comprehension builds dict

names = ['Alice', 'Bob', 'Charlie']
ages = [30, 25, 35]
name_age = {name: age for name, age in zip(names, ages)}
print(f"\nName->Age: {name_age}")

# === FROM EXISTING DICT ===
# Filter or transform existing dictionary

prices = {'apple': 1.2, 'banana': 0.8, 'cherry': 2.5, 'date': 3.0}
expensive = {k: v for k, v in prices.items() if v > 1.0}
print(f"\nExpensive fruits: {expensive}")

# Transform values
discounted = {k: round(v * 0.9, 2) for k, v in prices.items()}
print(f"Discounted: {discounted}")

# === INVERTING A DICTIONARY ===
# Swap keys and values

original = {'a': 1, 'b': 2, 'c': 3}
inverted = {v: k for k, v in original.items()}
print(f"\nInverted: {inverted}")

# Handle duplicate values (last one wins)
scores = {'Alice': 85, 'Bob': 92, 'Charlie': 85}
score_to_names = {v: k for k, v in scores.items()}
print(f"Score->Name (last wins): {score_to_names}")

# === GROUPING WITH COMPREHENSION ===
# Group items by a key function

words = ['apple', 'bat', 'car', 'dart', 'elephant', 'ant']
by_length = {
    length: [w for w in words if len(w) == length]
    for length in {len(w) for w in words}
}
print(f"\nBy length: {by_length}")

# === NESTED COMPREHENSIONS ===
# Build nested dictionaries

matrix = {
    i: {j: i * j for j in range(1, 4)}
    for i in range(1, 4)
}
print(f"\nMultiplication matrix: {matrix}")

# === SETDEFAULT vs COMPREHENSION ===
# When to use each

# setdefault is imperative (modify as you go)
# comprehension is declarative (build from scratch)

# Use comprehension when building from clean data
# Use setdefault when accumulating during iteration

# Example: counting with setdefault (imperative)
counts = {}
for item in ['a', 'b', 'a', 'c', 'a', 'b']:
    counts.setdefault(item, 0)
    counts[item] += 1
print(f"\nCounts (setdefault): {counts}")

# Same with comprehension (from existing data)
from collections import Counter
counts_comp = dict(Counter(['a', 'b', 'a', 'c', 'a', 'b']))
print(f"Counts (Counter): {counts_comp}")

print("\nDictionary comprehension mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Specialized Dictionaries: defaultdict, Counter, OrderedDict"
    },
    {
      "type": "p",
      "text": "The collections module provides specialized dictionary variants that solve common problems elegantly. defaultdict eliminates KeyError by providing default values automatically. Counter is a dict subclass for counting hashable objects. OrderedDict remembers insertion order explicitly (though regular dicts do too since 3.7). These are not just conveniences — they are productivity multipliers."
    },
    {
      "type": "code-block",
      "label": "Specialized Dictionaries Mastery",
      "code": `# === DEFAULTDICT ===
# Automatically creates default values for missing keys

from collections import defaultdict, Counter, OrderedDict

# --- List defaultdict ---
# Group items without checking if key exists

words = ['apple', 'bat', 'ant', 'car', 'dart', 'ant']
by_first_letter = defaultdict(list)
for word in words:
    by_first_letter[word[0]].append(word)

print(f"By first letter: {dict(by_first_letter)}")

# --- Set defaultdict ---
# Unique groupings

by_length = defaultdict(set)
for word in words:
    by_length[len(word)].add(word)

print(f"\nBy length: {dict(by_length)}")

# --- Int defaultdict ---
# Counting without initialization

char_count = defaultdict(int)
for char in 'mississippi':
    char_count[char] += 1

print(f"\nChar counts: {dict(char_count)}")

# --- Custom factory ---
# Use any callable as default factory

def default_user():
    return {'name': 'Anonymous', 'age': 0, 'active': False}

users = defaultdict(default_user)
users['alice']['age'] = 30
print(f"\nAlice: {users['alice']}")
print(f"Bob (default): {users['bob']}")

# === COUNTER ===
# Dict subclass for counting hashable objects

fruits = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
fruit_count = Counter(fruits)

print(f"\nFruit counts: {fruit_count}")
print(f"Most common: {fruit_count.most_common(2)}")
print(f"Apples: {fruit_count['apple']}")
print(f"Oranges (missing): {fruit_count['orange']}")  # Returns 0, no KeyError!

# Counter arithmetic
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2, c=3)
print(f"\nc1 + c2 = {c1 + c2}")  # Add counts
print(f"c1 - c2 = {c1 - c2}")  # Subtract (no negative)
print(f"c1 & c2 = {c1 & c2}")  # Min of each
print(f"c1 | c2 = {c1 | c2}")  # Max of each

# === ORDEREDDICT ===
# Explicitly ordered dict (before 3.7, this was necessary)
# Still useful for move_to_end() and popitem(last=False)

od = OrderedDict()
od['first'] = 1
od['second'] = 2
od['third'] = 3

print(f"\nOrderedDict: {od}")

# Move item to end
od.move_to_end('first')
print(f"After move_to_end('first'): {list(od.keys())}")

# Pop from beginning
first = od.popitem(last=False)
print(f"Popped from beginning: {first}")
print(f"Remaining: {list(od.keys())}")

# === COMPARISON: REGULAR DICT vs ORDEREDDICT ===

regular = {'a': 1, 'b': 2, 'c': 3}
ordered = OrderedDict([('a', 1), ('b', 2), ('c', 3)])

print(f"\nRegular == OrderedDict: {regular == ordered}")  # True (values match)
print(f"Regular is OrderedDict: {regular is ordered}")    # False

# OrderedDict equality considers order
od1 = OrderedDict([('a', 1), ('b', 2)])
od2 = OrderedDict([('b', 2), ('a', 1)])
print(f"OrderedDict order matters: {od1 == od2}")  # False!

print("\nSpecialized dictionaries mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Merging Dictionaries: |, |=, and ** Unpacking"
    },
    {
      "type": "p",
      "text": "Python 3.9 introduced the union operator | for dictionaries, making merge syntax as clean as set operations. Combined with |= for in-place updates and ** unpacking for function calls, Python offers three elegant ways to combine dictionaries. Each has a specific use case: | for creating new merged dicts, |= for updating existing ones, and ** for function arguments and literal construction."
    },
    {
      "type": "code-block",
      "label": "Merging Dictionaries Mastery",
      "code": `# === THE | OPERATOR (Python 3.9+) ===
# Creates a new dictionary from two others

defaults = {'theme': 'light', 'lang': 'en', 'notifications': True}
user_prefs = {'theme': 'dark', 'fontsize': 14}

# Right side wins on key conflict
config = defaults | user_prefs
print(f"defaults | user_prefs = {config}")

# Originals unchanged
print(f"defaults still: {defaults}")
print(f"user_prefs still: {user_prefs}")

# Chain multiple merges
extra = {'debug': True}
full = defaults | user_prefs | extra
print(f"\nChained: {full}")

# === THE |= OPERATOR (Python 3.9+) ===
# In-place update (modifies left dict)

settings = {'host': 'localhost', 'port': 8080}
settings |= {'port': 3000, 'debug': True}
print(f"\nAfter |=: {settings}")

# === ** UNPACKING ===
# Merge in literals and function calls

base = {'a': 1, 'b': 2}
override = {'b': 3, 'c': 4}
merged = {**base, **override}
print(f"\n** unpacking: {merged}")

# Combine with new keys
combined = {'version': '1.0', **base, **override, 'final': True}
print(f"With extra keys: {combined}")

# Function call unpacking
def connect(host, port, **kwargs):
    print(f"\nConnecting to {host}:{port}")
    for k, v in kwargs.items():
        print(f"  {k}: {v}")

params = {'host': 'db.example.com', 'port': 5432, 'ssl': True, 'timeout': 30}
connect(**params)

# === MERGING WITH COMPREHENSION ===
# Custom merge logic (e.g., sum values instead of overwrite)

d1 = {'apples': 5, 'bananas': 3}
d2 = {'apples': 2, 'oranges': 4}

# Sum on conflict
summed = {k: d1.get(k, 0) + d2.get(k, 0) for k in set(d1) | set(d2)}
print(f"\nSummed merge: {summed}")

# Max on conflict
maxed = {k: max(d1.get(k, 0), d2.get(k, 0)) for k in set(d1) | set(d2)}
print(f"Max merge: {maxed}")

# === MERGING NESTED DICTIONARIES ===
# Shallow merge doesn't handle nested dicts

d1 = {'server': {'host': 'localhost', 'port': 8080}}
d2 = {'server': {'port': 3000, 'debug': True}}

shallow = d1 | d2
print(f"\nShallow nested merge: {shallow}")  # server completely overwritten!

# Deep merge function
def deep_merge(d1, d2):
    """Recursively merge two dictionaries."""
    result = d1.copy()
    for key, value in d2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

deep = deep_merge(d1, d2)
print(f"Deep merge: {deep}")

print("\nMerging dictionaries mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use dictionaries, hash tables, and specialized dict variants to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Word Counter",
      "code": `"""
Program 1: Word Counter
Counts word frequencies in text using Counter and dict comprehensions.
Demonstrates Counter, defaultdict, and dictionary operations.
"""

from collections import Counter, defaultdict
import re

class WordCounter:
    """Advanced word frequency analysis."""

    @staticmethod
    def count_words(text):
        """Count all words in text."""
        words = re.findall(r"\b\w+\b", text.lower())
        return Counter(words)

    @staticmethod
    def count_unique_words(text):
        """Count unique words only."""
        words = set(re.findall(r"\b\w+\b", text.lower()))
        return len(words)

    @staticmethod
    def top_words(text, n=10):
        """Return n most common words."""
        counts = WordCounter.count_words(text)
        return counts.most_common(n)

    @staticmethod
    def word_lengths(text):
        """Count words by length."""
        words = re.findall(r"\b\w+\b", text.lower())
        lengths = defaultdict(list)
        for word in words:
            lengths[len(word)].append(word)
        return dict(lengths)

    @staticmethod
    def word_pairs(text, distance=2):
        """Find word pairs within distance of each other."""
        words = re.findall(r"\b\w+\b", text.lower())
        pairs = defaultdict(list)
        for i, w1 in enumerate(words):
            for j in range(i + 1, min(i + distance + 1, len(words))):
                w2 = words[j]
                pairs[w1].append(w2)
        return dict(pairs)

    @staticmethod
    def compare_texts(text1, text2):
        """Compare word frequencies between two texts."""
        c1 = WordCounter.count_words(text1)
        c2 = WordCounter.count_words(text2)

        # Words in both
        common = c1 & c2
        # Words only in text1
        only1 = c1 - c2
        # Words only in text2
        only2 = c2 - c1
        # Combined frequencies
        combined = c1 + c2

        return {
            'common': dict(common),
            'only_in_text1': dict(only1),
            'only_in_text2': dict(only2),
            'combined_total': dict(combined)
        }

def main():
    """Main word counter program."""
    print("=" * 50)
    print("WORD COUNTER")
    print("=" * 50)

    text = """
    Python is amazing. Python is powerful. Python is simple.
    Many developers love Python because Python makes programming fun.
    Python has lists, Python has dictionaries, Python has everything.
    """

    # Basic counts
    counts = WordCounter.count_words(text)
    print(f"\nTotal words: {sum(counts.values())}")
    print(f"Unique words: {len(counts)}")

    # Top words
    print("\nTop 5 words:")
    for word, count in WordCounter.top_words(text, 5):
        print(f"  {word}: {count}")

    # By length
    lengths = WordCounter.word_lengths(text)
    print("\nWords by length:")
    for length in sorted(lengths.keys()):
        print(f"  Length {length}: {set(lengths[length])}")

    # Word pairs
    pairs = WordCounter.word_pairs(text, 3)
    print("\nWord pairs (within 3 words):")
    for word, neighbors in list(pairs.items())[:3]:
        print(f"  {word} -> {neighbors}")

    # Compare texts
    text2 = """
    Java is verbose. Java is complex. Java has types.
    Some developers prefer Java because Java is enterprise.
    """
    comparison = WordCounter.compare_texts(text, text2)
    print(f"\nCommon words: {list(comparison['common'].keys())[:5]}")
    print(f"Only in text1: {list(comparison['only_in_text1'].keys())[:5]}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Phone Book",
      "code": `"""
Program 2: Phone Book
Contact management with advanced lookup and grouping.
Demonstrates dict methods, comprehensions, and defaultdict.
"""

from collections import defaultdict
from typing import Dict, List, Optional, Tuple

class Contact:
    """A single contact entry."""

    def __init__(self, name, phone, email='', address='', tags=None):
        self.name = name
        self.phone = phone
        self.email = email
        self.address = address
        self.tags = set(tags or [])

    def to_dict(self):
        return {
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'tags': list(self.tags)
        }

    def __repr__(self):
        return f"Contact({self.name!r}, {self.phone!r})"

class PhoneBook:
    """Advanced phone book with grouping and search."""

    def __init__(self):
        self._contacts: Dict[str, Contact] = {}
        self._by_phone: Dict[str, str] = {}  # phone -> name
        self._by_tag: Dict[str, set] = defaultdict(set)
        self._by_letter: Dict[str, set] = defaultdict(set)

    def add(self, contact: Contact) -> bool:
        """Add a contact. Returns False if name exists."""
        if contact.name in self._contacts:
            return False

        self._contacts[contact.name] = contact
        self._by_phone[contact.phone] = contact.name

        for tag in contact.tags:
            self._by_tag[tag].add(contact.name)

        first_letter = contact.name[0].upper()
        self._by_letter[first_letter].add(contact.name)

        return True

    def remove(self, name: str) -> bool:
        """Remove a contact."""
        if name not in self._contacts:
            return False

        contact = self._contacts[name]
        del self._contacts[name]
        del self._by_phone[contact.phone]

        for tag in contact.tags:
            self._by_tag[tag].discard(name)

        first_letter = contact.name[0].upper()
        self._by_letter[first_letter].discard(name)

        return True

    def find(self, name: str) -> Optional[Contact]:
        """Find contact by exact name."""
        return self._contacts.get(name)

    def find_by_phone(self, phone: str) -> Optional[Contact]:
        """Find contact by phone number."""
        name = self._by_phone.get(phone)
        return self._contacts.get(name) if name else None

    def search(self, query: str) -> List[Contact]:
        """Search by partial name match."""
        query = query.lower()
        return [c for c in self._contacts.values() if query in c.name.lower()]

    def by_tag(self, tag: str) -> List[Contact]:
        """Get contacts by tag."""
        names = self._by_tag.get(tag, set())
        return [self._contacts[n] for n in names if n in self._contacts]

    def by_letter(self, letter: str) -> List[Contact]:
        """Get contacts starting with letter."""
        names = self._by_letter.get(letter.upper(), set())
        return [self._contacts[n] for n in names if n in self._contacts]

    def all_tags(self) -> set:
        """Return all unique tags."""
        return set(self._by_tag.keys())

    def statistics(self) -> Dict[str, any]:
        """Return phone book statistics."""
        return {
            'total_contacts': len(self._contacts),
            'total_tags': len(self.all_tags()),
            'tags_breakdown': {tag: len(names) for tag, names in self._by_tag.items()},
            'letter_breakdown': {letter: len(names) for letter, names in self._by_letter.items()},
        }

    def export(self) -> Dict[str, Dict]:
        """Export all contacts as dict."""
        return {name: contact.to_dict() for name, contact in self._contacts.items()}

    def __len__(self):
        return len(self._contacts)

    def __repr__(self):
        return f"PhoneBook({len(self)} contacts)"

def main():
    """Main phone book program."""
    print("=" * 50)
    print("PHONE BOOK")
    print("=" * 50)

    book = PhoneBook()

    # Add contacts
    contacts = [
        Contact('Alice', '555-0101', 'alice@example.com', 'NYC', ['friend', 'work']),
        Contact('Bob', '555-0102', 'bob@example.com', 'LA', ['friend']),
        Contact('Charlie', '555-0103', 'charlie@example.com', 'Chicago', ['work', 'family']),
        Contact('Diana', '555-0104', 'diana@example.com', 'NYC', ['family']),
        Contact('Eve', '555-0105', 'eve@example.com', 'Seattle', ['work', 'friend']),
    ]

    for c in contacts:
        book.add(c)

    print(f"\n{book}")

    # Find by name
    found = book.find('Alice')
    print(f"\nFind Alice: {found.to_dict() if found else 'Not found'}")

    # Find by phone
    found = book.find_by_phone('555-0103')
    print(f"Find by phone 555-0103: {found.name if found else 'Not found'}")

    # Search
    results = book.search('li')
    print(f"\nSearch 'li': {[c.name for c in results]}")

    # By tag
    work_friends = book.by_tag('work')
    print(f"Work contacts: {[c.name for c in work_friends]}")

    # By letter
    a_names = book.by_letter('A')
    print(f"Names starting with A: {[c.name for c in a_names]}")

    # Statistics
    stats = book.statistics()
    print(f"\nStatistics: {stats}")

    # Export
    exported = book.export()
    print(f"\nExported {len(exported)} contacts")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Inventory System",
      "code": `"""
Program 3: Inventory System
Product inventory with categories, stock levels, and transactions.
Demonstrates nested dicts, defaultdict, and dict comprehensions.
"""

from collections import defaultdict, Counter
from typing import Dict, List, Optional, Tuple
from datetime import datetime

class Product:
    """A product in inventory."""

    def __init__(self, sku, name, category, price, stock=0):
        self.sku = sku
        self.name = name
        self.category = category
        self.price = price
        self.stock = stock
        self.transactions = []

    def restock(self, quantity, source="supplier"):
        """Add stock."""
        self.stock += quantity
        self.transactions.append({
            'type': 'restock',
            'quantity': quantity,
            'source': source,
            'time': datetime.now()
        })

    def sell(self, quantity):
        """Sell stock. Returns actual quantity sold."""
        sold = min(quantity, self.stock)
        self.stock -= sold
        self.transactions.append({
            'type': 'sale',
            'quantity': sold,
            'time': datetime.now()
        })
        return sold

    def to_dict(self):
        return {
            'sku': self.sku,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'stock': self.stock,
            'value': self.price * self.stock
        }

    def __repr__(self):
        return f"Product({self.sku}, {self.name}, stock={self.stock})"

class Inventory:
    """Product inventory management."""

    def __init__(self):
        self._products: Dict[str, Product] = {}
        self._by_category: Dict[str, set] = defaultdict(set)

    def add_product(self, product: Product) -> bool:
        """Add product to inventory."""
        if product.sku in self._products:
            return False
        self._products[product.sku] = product
        self._by_category[product.category].add(product.sku)
        return True

    def get_product(self, sku: str) -> Optional[Product]:
        return self._products.get(sku)

    def restock(self, sku: str, quantity: int, source="supplier") -> bool:
        """Restock a product."""
        product = self._products.get(sku)
        if product:
            product.restock(quantity, source)
            return True
        return False

    def sell(self, sku: str, quantity: int) -> int:
        """Sell a product. Returns quantity sold."""
        product = self._products.get(sku)
        if product:
            return product.sell(quantity)
        return 0

    def by_category(self, category: str) -> List[Product]:
        """Get products in category."""
        skus = self._by_category.get(category, set())
        return [self._products[s] for s in skus if s in self._products]

    def low_stock(self, threshold=10) -> List[Product]:
        """Get products with stock below threshold."""
        return [p for p in self._products.values() if p.stock < threshold]

    def total_value(self) -> float:
        """Total inventory value."""
        return sum(p.price * p.stock for p in self._products.values())

    def category_summary(self) -> Dict[str, Dict]:
        """Summary by category."""
        summary = {}
        for category, skus in self._by_category.items():
            products = [self._products[s] for s in skus if s in self._products]
            summary[category] = {
                'count': len(products),
                'total_stock': sum(p.stock for p in products),
                'total_value': sum(p.price * p.stock for p in products),
                'avg_price': sum(p.price for p in products) / len(products) if products else 0
            }
        return summary

    def export(self) -> Dict[str, Dict]:
        """Export all products."""
        return {sku: product.to_dict() for sku, product in self._products.items()}

    def __len__(self):
        return len(self._products)

    def __repr__(self):
        return f"Inventory({len(self)} products)"

def main():
    """Main inventory program."""
    print("=" * 50)
    print("INVENTORY SYSTEM")
    print("=" * 50)

    inv = Inventory()

    # Add products
    products = [
        Product('LAP-001', 'Laptop Pro', 'Electronics', 1299.99, 50),
        Product('MOU-001', 'Wireless Mouse', 'Electronics', 49.99, 200),
        Product('DES-001', 'Office Desk', 'Furniture', 599.99, 20),
        Product('CHA-001', 'Ergonomic Chair', 'Furniture', 349.99, 35),
        Product('APP-001', 'iPhone Case', 'Accessories', 29.99, 500),
    ]

    for p in products:
        inv.add_product(p)

    print(f"\n{inv}")

    # Transactions
    inv.sell('LAP-001', 5)
    inv.sell('MOU-001', 50)
    inv.restock('DES-001', 10, 'warehouse')
    inv.sell('APP-001', 100)

    # Check stock
    print(f"\nLaptop stock: {inv.get_product('LAP-001').stock}")
    print(f"Mouse stock: {inv.get_product('MOU-001').stock}")

    # Low stock
    print(f"\nLow stock items:")
    for p in inv.low_stock(40):
        print(f"  {p.name}: {p.stock}")

    # Category summary
    summary = inv.category_summary()
    print(f"\nCategory summary:")
    for cat, data in summary.items():
        print(f"  {cat}: {data['count']} items, \${data['total_value']:.2f} value")

    # Total value
    print(f"\nTotal inventory value: \${inv.total_value():.2f}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: JSON-like Config Parser",
      "code": `"""
Program 4: JSON-like Config Parser
Parses and validates nested configuration dictionaries.
Demonstrates nested dicts, merging, validation, and deep access.
"""

from typing import Dict, Any, List, Optional, Union
from collections import defaultdict

class ConfigParser:
    """Parse and validate nested configuration."""

    @staticmethod
    def get_nested(config: Dict, path: str, default=None) -> Any:
        """
        Get value from nested dict using dot notation.
        Example: get_nested(cfg, 'server.host')
        """
        keys = path.split('.')
        current = config
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        return current

    @staticmethod
    def set_nested(config: Dict, path: str, value: Any) -> Dict:
        """
        Set value in nested dict using dot notation.
        Returns modified dict.
        """
        keys = path.split('.')
        current = config
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        current[keys[-1]] = value
        return config

    @staticmethod
    def flatten(config: Dict, prefix='') -> Dict[str, Any]:
        """
        Flatten nested dict to dot-notation keys.
        {'a': {'b': 1}} -> {'a.b': 1}
        """
        result = {}
        for key, value in config.items():
            new_key = f"{prefix}.{key}" if prefix else key
            if isinstance(value, dict):
                result.update(ConfigParser.flatten(value, new_key))
            else:
                result[new_key] = value
        return result

    @staticmethod
    def unflatten(flat: Dict[str, Any]) -> Dict:
        """
        Unflatten dot-notation keys to nested dict.
        {'a.b': 1} -> {'a': {'b': 1}}
        """
        result = {}
        for key, value in flat.items():
            ConfigParser.set_nested(result, key, value)
        return result

    @staticmethod
    def merge_configs(*configs: Dict) -> Dict:
        """Deep merge multiple configs."""
        result = {}
        for config in configs:
            result = ConfigParser._deep_merge(result, config)
        return result

    @staticmethod
    def _deep_merge(d1: Dict, d2: Dict) -> Dict:
        """Recursively merge two dicts."""
        result = d1.copy()
        for key, value in d2.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = ConfigParser._deep_merge(result[key], value)
            else:
                result[key] = value
        return result

    @staticmethod
    def validate(config: Dict, schema: Dict) -> List[str]:
        """
        Validate config against schema.
        Schema: {'key': {'type': type, 'required': bool, 'default': value}}
        """
        errors = []
        for key, rules in schema.items():
            value = config.get(key)

            if rules.get('required') and value is None:
                errors.append(f"Missing required key: {key}")
                continue

            if value is not None and 'type' in rules:
                if not isinstance(value, rules['type']):
                    errors.append(f"{key}: expected {rules['type'].__name__}, got {type(value).__name__}")

            if value is not None and 'choices' in rules:
                if value not in rules['choices']:
                    errors.append(f"{key}: must be one of {rules['choices']}")

            if value is not None and 'min' in rules:
                if value < rules['min']:
                    errors.append(f"{key}: must be >= {rules['min']}")

            if value is not None and 'max' in rules:
                if value > rules['max']:
                    errors.append(f"{key}: must be <= {rules['max']}")

        return errors

    @staticmethod
    def diff(config1: Dict, config2: Dict) -> Dict[str, Tuple[Any, Any]]:
        """
        Find differences between two configs.
        Returns: {key: (old_value, new_value)}
        """
        flat1 = ConfigParser.flatten(config1)
        flat2 = ConfigParser.flatten(config2)
        all_keys = set(flat1.keys()) | set(flat2.keys())

        differences = {}
        for key in all_keys:
            v1 = flat1.get(key)
            v2 = flat2.get(key)
            if v1 != v2:
                differences[key] = (v1, v2)
        return differences

def main():
    """Main config parser program."""
    print("=" * 50)
    print("JSON-LIKE CONFIG PARSER")
    print("=" * 50)

    # Sample config
    config = {
        'app': {
            'name': 'MyApp',
            'version': '1.0.0',
            'debug': False
        },
        'server': {
            'host': '0.0.0.0',
            'port': 8080,
            'ssl': {
                'enabled': True,
                'cert': '/path/to/cert.pem'
            }
        },
        'database': {
            'host': 'localhost',
            'port': 5432,
            'pool': {
                'min': 5,
                'max': 20
            }
        }
    }

    # Nested access
    print(f"\nserver.host = {ConfigParser.get_nested(config, 'server.host')}")
    print(f"server.ssl.enabled = {ConfigParser.get_nested(config, 'server.ssl.enabled')}")
    print(f"missing = {ConfigParser.get_nested(config, 'missing.key', 'default')}")

    # Set nested
    ConfigParser.set_nested(config, 'server.ssl.key', '/path/to/key.pem')
    print(f"\nAfter set: server.ssl = {config['server']['ssl']}")

    # Flatten
    flat = ConfigParser.flatten(config)
    print(f"\nFlattened ({len(flat)} keys):")
    for key in list(flat.keys())[:5]:
        print(f"  {key} = {flat[key]}")

    # Unflatten
    restored = ConfigParser.unflatten(flat)
    print(f"\nRestored matches original: {restored == config}")

    # Merge
    override = {'app': {'debug': True}, 'server': {'port': 3000}}
    merged = ConfigParser.merge_configs(config, override)
    print(f"\nMerged app.debug: {merged['app']['debug']}")
    print(f"Merged server.port: {merged['server']['port']}")
    print(f"Original server.port unchanged: {config['server']['port']}")

    # Validate
    schema = {
        'app': {'type': dict, 'required': True},
        'server': {'type': dict, 'required': True},
        'database': {'type': dict, 'required': True},
    }
    errors = ConfigParser.validate(config, schema)
    print(f"\nValidation errors: {errors or 'None'}")

    # Diff
    config2 = ConfigParser.merge_configs(config, {'app': {'version': '2.0.0'}})
    differences = ConfigParser.diff(config, config2)
    print(f"\nDifferences: {differences}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "quiz",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 13. 4/5 correct means you have mastered dictionaries and hash tables."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain how hash tables work. Why are dict lookups O(1)? What happens when two keys have the same hash (collision)? Why must dictionary keys be hashable? What would happen if you used a list as a dict key?",
        "Q2: Write a function that counts character frequencies in a string using a dictionary. Then rewrite it using collections.Counter. Which is more readable? Which is faster? Explain why Counter returns 0 for missing keys instead of raising KeyError.",
        "Q3: Explain the difference between dict.get(), dict.setdefault(), and collections.defaultdict. Write code that groups a list of words by their first letter using all three approaches. Which is most Pythonic and why?",
        "Q4: Explain the | and |= operators for dictionaries (Python 3.9+). Write code that merges three dictionaries with conflicting keys. Which value wins and why? Then show how to merge nested dictionaries where inner dicts are combined, not overwritten.",
        "Q5: Write a function that inverts a dictionary (swap keys and values). What happens if the original dictionary has duplicate values? How would you handle this to preserve all keys? Use a dictionary comprehension with list values."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Hash tables map keys to array indices using a hash function. Lookup is O(1) because the hash directly computes the index — no search needed. Collisions occur when two keys hash to the same index. Python uses open addressing with quadratic probing: if index i is occupied, try i+1, i+4, i+9, etc. Keys must be hashable because the hash determines the bucket. Lists are unhashable because they are mutable — if a list key changed, its hash would change, and the key would be lost in the wrong bucket. A2: Manual: counts = {}; for char in text: counts[char] = counts.get(char, 0) + 1. Counter: Counter(text). Counter is more readable (declares intent) and faster (implemented in C). Counter returns 0 for missing keys because it inherits from dict and overrides __missing__ to return 0, making it safe for arithmetic. A3: get(key, default) returns default if key missing, but doesn't store it. setdefault(key, default) stores default if key missing, then returns value. defaultdict(factory) automatically creates default values on access. Grouping by first letter: defaultdict(list) is most Pythonic because it eliminates the 'if key not in dict' check entirely. The code is flatter and more declarative. A4: | creates a new dict from two dicts (right wins on conflict). |= updates the left dict in-place. Example: d1 = {'a': 1}; d2 = {'a': 2, 'b': 3}; d1 | d2 = {'a': 2, 'b': 3}. For nested merge, use recursive deep_merge: if both values are dicts, merge them; otherwise, right wins. A5: Basic inversion: {v: k for k, v in d.items()} — last key wins if duplicates. To preserve all keys: from collections import defaultdict; inverted = defaultdict(list); for k, v in d.items(): inverted[v].append(k); dict(inverted). This creates a dict where each value maps to a list of original keys."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered dictionaries and hash tables. You understand how hash tables work — hash functions, open addressing, quadratic probing, and dynamic resizing. You know why dict lookups are O(1) and why keys must be hashable. You wield all dictionary methods with confidence: get, setdefault, pop, update, and the views (keys, values, items). You write dictionary comprehensions that build mappings in a single line, and you use specialized variants — defaultdict, Counter, OrderedDict — to solve problems elegantly. You merge dictionaries with |, |=, and ** unpacking, and you handle nested merges with recursive deep_merge. You have built four complete programs: a word counter with Counter arithmetic, a phone book with multi-index lookup, an inventory system with category grouping, and a JSON-like config parser with dot-notation access. Dictionaries are no longer just key-value containers. They are the engine that powers your Python programs."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Dictionaries are hash tables. Hash functions make lookups O(1). Comprehensions build dicts declaratively. defaultdict eliminates KeyError. Counter counts elegantly. | and |= merge cleanly. Master these six truths, and you have mastered the engine of Python. In Part 13, we will explore Sets & Set Theory — the mathematical data structure for uniqueness, relationships, and O(1) membership testing."
    },
    {
      "type": "cta",
      "text": "Start Part 13: Sets & Set Theory →",
      "href": "/tutorials/python-unlocked/part-13-sets-set-theory",
      "note": "22 min read · Union · Intersection · Difference · frozenset · Deduplication"
    }
  ]
};

export default post;
