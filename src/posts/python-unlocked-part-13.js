const post = {
  "slug": "part-13-sets-set-theory",
  "seriesSlug": "python-unlocked",
  "partNumber": 13,
  "totalParts": 30,
  "title": "Sets & Set Theory: Mathematical Power in Python (Part 13)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "22 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Mathematical sets: union, intersection, difference, symmetric difference. Set comprehensions, frozensets. O(1) membership testing. Real-world: deduplication, relationship analysis. Four complete programs.",
  "coverEmoji": "🎯",
  "tags": [
    "Python", "Sets", "Set Theory", "Union",
    "Intersection", "Difference", "frozenset",
    "Deduplication", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1874, Georg Cantor published a paper that would revolutionize mathematics. It was called 'On a Property of the Collection of All Real Algebraic Numbers,' and it introduced set theory — the study of collections of objects defined by their relationships, not their order. One hundred fifty-two years later, in 2026, Python sets embody Cantor's vision. They are not just lists without duplicates. They are mathematical sets with union, intersection, difference, and symmetric difference. They offer O(1) membership testing that makes 'is this element in the collection?' instant, even for millions of items. They have immutable cousins called frozensets that can be dictionary keys and set elements. And they solve real problems — deduplication, relationship analysis, tag systems — with elegance that no other data structure can match. In this part, we will explore the full depth of Python's set machinery. You will learn why sets use hash tables like dictionaries, how set operations map to mathematical notation, why frozensets are the only hashable sets, and how to use sets to eliminate entire classes of performance bottlenecks. By the end, sets will not be an afterthought. They will be a precision instrument."
    },
    {
      "type": "h2",
      "text": "Set Fundamentals: Unordered, Unique, Hashable"
    },
    {
      "type": "p",
      "text": "A set is an unordered collection of unique, hashable elements. Like dictionaries, sets are implemented as hash tables. Unlike dictionaries, they store only keys — no values. This makes them memory-efficient for membership testing and mathematical operations. The trade-off: sets are unordered, so you cannot index them or rely on element order."
    },
    {
      "type": "code-block",
      "label": "Set Fundamentals",
      "code": `# === CREATING SETS ===
# Literal syntax: {1, 2, 3} (empty {} is dict, use set() for empty set)

numbers = {1, 2, 3, 4, 5}
print(f"Set: {numbers}")

# From iterable
from_list = set([1, 2, 2, 3, 3, 3])
print(f"From list: {from_list}")

# From string (unique characters)
chars = set('mississippi')
print(f"From string: {chars}")

# Set comprehension
squares = {x**2 for x in range(10)}
print(f"\nSquares: {squares}")

# === UNIQUENESS GUARANTEE ===
# Sets automatically eliminate duplicates

data = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique = set(data)
print(f"\nOriginal: {data} ({len(data)} items)")
print(f"Unique:   {unique} ({len(unique)} items)")

# === MEMBERSHIP TESTING: O(1) ===
# The killer feature of sets

import time

large_list = list(range(100000))
large_set = set(range(100000))

def benchmark_membership(container, target, iterations=10000):
    start = time.perf_counter()
    for _ in range(iterations):
        target in container
    return time.perf_counter() - start

print("\nMembership testing (10,000 checks):")
print(f"  List (100k items): {benchmark_membership(large_list, 99999):.6f}s")
print(f"  Set  (100k items): {benchmark_membership(large_set, 99999):.6f}s")

# Even bigger gap at scale
huge_list = list(range(10000000))
huge_set = set(range(10000000))

print(f"\n  List (10M items): {benchmark_membership(huge_list, 9999999, 1000):.6f}s")
print(f"  Set  (10M items): {benchmark_membership(huge_set, 9999999, 1000):.6f}s")

# === SETS ARE UNORDERED ===
# No indexing, no slicing, no position

try:
    numbers[0]
except TypeError as e:
    print(f"\nIndexing a set: {e}")

# Iteration order is arbitrary (though deterministic in CPython)
print(f"Iteration: {list(numbers)}")

# === SETS REQUIRE HASHABLE ELEMENTS ===
# Mutable objects cannot be set elements

try:
    {[1, 2], [3, 4]}
except TypeError as e:
    print(f"\nList in set: {e}")

# Tuples are hashable and can be in sets
points = {(1, 2), (3, 4), (5, 6)}
print(f"Tuple set: {points}")

# === SET METHODS ===

s = {1, 2, 3}

# Add single element
s.add(4)
print(f"\nAfter add(4): {s}")

# Add multiple elements
s.update([5, 6])
print(f"After update([5,6]): {s}")

# Remove (raises KeyError if missing)
s.remove(6)
print(f"After remove(6): {s}")

# Discard (no error if missing)
s.discard(99)
print(f"After discard(99): {s}")

# Pop (arbitrary element)
popped = s.pop()
print(f"Popped: {popped}, remaining: {s}")

# Clear
s.clear()
print(f"After clear: {s}")

print("\nSet fundamentals complete!")`
    },
    {
      "type": "h2",
      "text": "Set Operations: Mathematical Power"
    },
    {
      "type": "p",
      "text": "Python sets implement the full algebra of sets: union, intersection, difference, and symmetric difference. Each operation has both operator syntax (| & - ^) and method syntax (union, intersection, difference, symmetric_difference). The operators require sets; the methods accept any iterable. Understanding both forms makes you fluent in set manipulation."
    },
    {
      "type": "code-block",
      "label": "Set Operations Mastery",
      "code": `# === SET OPERATIONS ===
# Visualize with Venn diagram mental model

A = {1, 2, 3, 4, 5}
B = {4, 5, 6, 7, 8}

print(f"A = {A}")
print(f"B = {B}")

# --- UNION: elements in A OR B ---
# Operator: |   Method: union()

print(f"\nA | B (union) = {A | B}")
print(f"A.union(B)    = {A.union(B)}")
print(f"A.union([6,9])= {A.union([6, 9])}")  # Method accepts any iterable

# --- INTERSECTION: elements in A AND B ---
# Operator: &   Method: intersection()

print(f"\nA & B (intersection) = {A & B}")
print(f"A.intersection(B)    = {A.intersection(B)}")

# --- DIFFERENCE: elements in A but NOT in B ---
# Operator: -   Method: difference()

print(f"\nA - B (difference) = {A - B}")
print(f"B - A              = {B - A}")
print(f"A.difference(B)    = {A.difference(B)}")

# --- SYMMETRIC DIFFERENCE: elements in A OR B but NOT both ---
# Operator: ^   Method: symmetric_difference()

print(f"\nA ^ B (symmetric diff) = {A ^ B}")
print(f"A.symmetric_difference(B) = {A.symmetric_difference(B)}")

# === SUBSET AND SUPERSET ===

C = {1, 2}
D = {1, 2, 3, 4, 5}

print(f"\nC = {C}, D = {D}")
print(f"C <= D (subset):        {C <= D}")
print(f"C.issubset(D):          {C.issubset(D)}")
print(f"D >= C (superset):      {D >= C}")
print(f"D.issuperset(C):        {D.issuperset(C)}")
print(f"C < D (proper subset):  {C < D}")

# === DISJOINT SETS ===
# No elements in common

E = {1, 2}
F = {3, 4}
print(f"\nE = {E}, F = {F}")
print(f"E.isdisjoint(F): {E.isdisjoint(F)}")

# === IN-PLACE OPERATIONS ===
# Modify the set directly (return None)

S = {1, 2, 3}
S |= {4, 5}       # S.update({4,5})
print(f"\nAfter |=: {S}")

S &= {2, 3, 4}    # S.intersection_update({2,3,4})
print(f"After &=: {S}")

S -= {3}          # S.difference_update({3})
print(f"After -=: {S}")

S ^= {1, 5}       # S.symmetric_difference_update({1,5})
print(f"After ^=: {S}")

# === SET OPERATIONS WITH MULTIPLE SETS ===

X = {1, 2, 3}
Y = {2, 3, 4}
Z = {3, 4, 5}

print(f"\nX = {X}, Y = {Y}, Z = {Z}")
print(f"X | Y | Z = {X | Y | Z}")
print(f"X & Y & Z = {X & Y & Z}")
print(f"X & (Y | Z) = {X & (Y | Z)}")

# === PRACTICAL: FINDING UNIQUE ELEMENTS ===

list1 = [1, 2, 3, 4, 5]
list2 = [4, 5, 6, 7, 8]

only_in_first = set(list1) - set(list2)
only_in_second = set(list2) - set(list1)
in_both = set(list1) & set(list2)
in_either = set(list1) | set(list2)

print(f"\nList1: {list1}, List2: {list2}")
print(f"Only in first:  {only_in_first}")
print(f"Only in second: {only_in_second}")
print(f"In both:        {in_both}")
print(f"In either:      {in_either}")

print("\nSet operations mastery complete!")`
    },
    {
      "type": "h2",
      "text": "frozenset: The Immutable Set"
    },
    {
      "type": "p",
      "text": "A frozenset is an immutable set. Once created, it cannot be modified — no add, no remove, no update. This immutability makes frozensets hashable, which means they can be used as dictionary keys and as elements of other sets. This is the only way to have a set of sets or use a set as a dict key. The trade-off is complete immutability, including the elements inside (which must themselves be hashable)."
    },
    {
      "type": "code-block",
      "label": "frozenset Mastery",
      "code": `# === FROZENSET ===
# Immutable, hashable set

# Create frozenset
fs = frozenset([1, 2, 3, 4])
print(f"frozenset: {fs}")
print(f"type: {type(fs).__name__}")

# All non-mutating set operations work
other = frozenset([3, 4, 5, 6])
print(f"\nUnion: {fs | other}")
print(f"Intersection: {fs & other}")
print(f"Difference: {fs - other}")

# Mutating operations fail
try:
    fs.add(5)
except AttributeError as e:
    print(f"\nfs.add(5): {e}")

# === HASHABLE: DICT KEYS AND SET ELEMENTS ===

# Use frozenset as dict key
set_scores = {
    frozenset({1, 2, 3}): 100,
    frozenset({4, 5, 6}): 200,
}

key = frozenset({1, 2, 3})
print(f"\nScore for {key}: {set_scores[key]}")

# Use frozenset as set element
set_of_sets = {frozenset({1, 2}), frozenset({3, 4})}
print(f"Set of frozensets: {set_of_sets}")

# === CONVERTING BETWEEN SET AND FROZENSET ===

s = {1, 2, 3}
fs = frozenset(s)
s2 = set(fs)

print(f"\nset -> frozenset -> set: {s} -> {fs} -> {s2}")

# === WHEN TO USE FROZENSET ===

# 1. Dictionary keys that represent collections
# 2. Set elements that are themselves sets
# 3. Function arguments that must not be modified
# 4. Caching/memoization keys

# Example: caching function results based on argument sets
cache = {}

def expensive_operation(args):
    key = frozenset(args)
    if key not in cache:
        # Simulate expensive computation
        result = sum(args) * len(args)
        cache[key] = result
        print(f"  Computed {key} -> {result}")
    else:
        print(f"  Cached {key} -> {cache[key]}")
    return cache[key]

print("\nMemoization with frozenset keys:")
expensive_operation({1, 2, 3})
expensive_operation({3, 2, 1})  # Same set, different order -> cache hit!
expensive_operation({4, 5})

print("\nfrozenset mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Set Comprehensions: Building Sets Declaratively"
    },
    {
      "type": "p",
      "text": "Set comprehensions are the set equivalent of list comprehensions. They build sets in a single line with filtering and transformation. They are faster than for loops, eliminate duplicates automatically, and pair naturally with conditions and nested iteration. The syntax is {expression for item in iterable if condition}."
    },
    {
      "type": "code-block",
      "label": "Set Comprehensions Mastery",
      "code": `# === SET COMPREHENSIONS ===
# {expression for item in iterable if condition}

# Basic: unique squares
squares = {x**2 for x in range(20)}
print(f"Unique squares: {squares}")

# With filter: even squares only
even_squares = {x**2 for x in range(20) if x % 2 == 0}
print(f"\nEven squares: {even_squares}")

# From strings: unique words
text = "the quick brown fox jumps over the lazy dog the quick brown fox"
words = {word for word in text.split()}
print(f"\nUnique words ({len(words)}): {words}")

# From nested data: unique first letters
names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
first_letters = {name[0] for name in names}
print(f"\nFirst letters: {first_letters}")

# Nested comprehension: unique pairs
pairs = {(a, b) for a in [1, 2, 3] for b in [3, 4, 5] if a != b}
print(f"\nUnique pairs: {pairs}")

# === SET COMPREHENSION VS LIST COMPREHENSION ===
# Set comp eliminates duplicates; list comp preserves order

data = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
list_comp = [x for x in data]
set_comp = {x for x in data}

print(f"\nList comp: {list_comp} ({len(list_comp)} items)")
print(f"Set comp:  {set_comp} ({len(set_comp)} items)")

# === CONDITIONAL SET COMPREHENSION ===
# Multiple conditions

numbers = range(100)
filtered = {x for x in numbers if x % 3 == 0 if x % 5 == 0}
print(f"\nDivisible by 3 and 5: {filtered}")

# === SET COMPREHENSION WITH ELSE ===
# Categorize elements

categories = {"even" if x % 2 == 0 else "odd" for x in range(10)}
print(f"\nCategories: {categories}")

# === FROZENSET COMPREHENSION ===
# frozenset() around a generator expression

fs = frozenset(x**2 for x in range(10) if x % 2 == 0)
print(f"\nfrozenset comprehension: {fs}")

print("\nSet comprehension mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Real-World Applications: Deduplication & Relationship Analysis"
    },
    {
      "type": "p",
      "text": "Sets solve real problems that other data structures struggle with. Deduplication is instant with set(). Relationship analysis — finding common friends, unique tags, overlapping permissions — becomes a single set operation. Tag systems use sets for union and intersection. Any problem involving 'is this in the collection?' or 'what do these collections share?' is a set problem."
    },
    {
      "type": "code-block",
      "label": "Real-World Set Applications",
      "code": `# === DEDUPLICATION ===
# The most common set operation

# Remove duplicates from list while preserving order (Python 3.7+)
def unique_ordered(items):
    """Remove duplicates, keep first occurrence."""
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
print(f"Original: {data}")
print(f"Unique ordered: {unique_ordered(data)}")
print(f"Unique (set): {list(set(data))}")

# Deduplicate objects by attribute
class User:
    def __init__(self, id, name):
        self.id = id
        self.name = name
    def __repr__(self):
        return f"User({self.id}, {self.name!r})"
    def __hash__(self):
        return hash(self.id)
    def __eq__(self, other):
        return isinstance(other, User) and self.id == other.id

users = [User(1, 'Alice'), User(2, 'Bob'), User(1, 'Alice Clone'), User(3, 'Charlie')]
unique_users = list(set(users))
print(f"\nUnique users: {unique_users}")

# === RELATIONSHIP ANALYSIS ===
# Find common friends, mutual interests, overlapping skills

alice_skills = {'Python', 'JavaScript', 'SQL', 'Docker'}
bob_skills = {'Python', 'Go', 'SQL', 'Kubernetes'}
charlie_skills = {'JavaScript', 'TypeScript', 'React'}

print(f"\nAlice: {alice_skills}")
print(f"Bob: {bob_skills}")
print(f"Charlie: {charlie_skills}")

# Common skills
print(f"\nAlice & Bob common: {alice_skills & bob_skills}")
print(f"All three common: {alice_skills & bob_skills & charlie_skills}")

# Unique skills
print(f"Alice only: {alice_skills - bob_skills - charlie_skills}")
print(f"Bob only: {bob_skills - alice_skills - charlie_skills}")

# Combined skills
all_skills = alice_skills | bob_skills | charlie_skills
print(f"All skills: {all_skills}")

# Skills held by exactly one person
unique = (alice_skills ^ bob_skills ^ charlie_skills) - (alice_skills & bob_skills & charlie_skills)
print(f"Unique to one person: {unique}")

# === TAG SYSTEM ===
# Articles with tags; find related articles

articles = {
    'Python Basics': {'python', 'tutorial', 'beginner'},
    'Advanced Python': {'python', 'advanced', 'performance'},
    'Web Development': {'javascript', 'html', 'css', 'web'},
    'Python Web': {'python', 'web', 'django'},
    'Data Science': {'python', 'data', 'ml'},
}

def find_related(article_name, min_common=1):
    """Find articles sharing at least min_common tags."""
    target_tags = articles[article_name]
    related = {}
    for name, tags in articles.items():
        if name != article_name:
            common = len(target_tags & tags)
            if common >= min_common:
                related[name] = common
    return related

print(f"\nRelated to 'Python Basics': {find_related('Python Basics')}")
print(f"Related to 'Python Basics' (2+ tags): {find_related('Python Basics', 2)}")

# === PERMISSION ANALYSIS ===
# Compare user permissions with set operations

admin_perms = {'read', 'write', 'delete', 'manage_users', 'manage_settings'}
editor_perms = {'read', 'write', 'publish'}
viewer_perms = {'read'}

print(f"\nAdmin: {admin_perms}")
print(f"Editor: {editor_perms}")
print(f"Viewer: {viewer_perms}")

# Editor can be upgraded to admin with these extra permissions
upgrade_needed = admin_perms - editor_perms
print(f"Editor needs these for admin: {upgrade_needed}")

# Permissions that distinguish roles
unique_admin = admin_perms - editor_perms - viewer_perms
unique_editor = editor_perms - admin_perms - viewer_perms
print(f"Unique to admin: {unique_admin}")
print(f"Unique to editor: {unique_editor}")

print("\nReal-world applications complete!")`
    },
    {
      "type": "programs",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use sets, set operations, and frozensets to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Venn Diagram Generator",
      "code": `"""
Program 1: Venn Diagram Generator
Generates Venn diagram data from sets.
Demonstrates all set operations and ASCII visualization.
"""

class VennDiagram:
    """Generate Venn diagram analysis for sets."""

    def __init__(self, *sets):
        """Initialize with named sets."""
        self.sets = dict(sets)

    def regions(self):
        """
        Calculate all Venn regions.
        Returns dict mapping region name to elements.
        """
        names = list(self.sets.keys())
        all_items = set().union(*self.sets.values())

        regions = {}
        for item in all_items:
            # Determine which sets contain this item
            membership = tuple(item in self.sets[name] for name in names)
            region_name = self._region_name(membership, names)
            regions.setdefault(region_name, set()).add(item)

        return regions

    def _region_name(self, membership, names):
        """Generate human-readable region name."""
        in_sets = [name for name, member in zip(names, membership) if member]
        if not in_sets:
            return 'outside'
        if len(in_sets) == len(names):
            return ' & '.join(names) + ' (all)'
        return ' & '.join(in_sets) + ' only'

    def statistics(self):
        """Return statistics about the sets."""
        names = list(self.sets.keys())
        stats = {'total_unique': len(set().union(*self.sets.values()))}

        for name, s in self.sets.items():
            stats[f'{name}_count'] = len(s)

        # Pairwise statistics
        for i, n1 in enumerate(names):
            for n2 in names[i+1:]:
                s1, s2 = self.sets[n1], self.sets[n2]
                stats[f'{n1}_&_{n2}'] = len(s1 & s2)
                stats[f'{n1}_only'] = len(s1 - s2)
                stats[f'{n2}_only'] = len(s2 - s1)

        # All common (if 3+ sets)
        if len(names) >= 3:
            all_common = set.intersection(*self.sets.values())
            stats['all_common'] = len(all_common)

        return stats

    def ascii_2set(self, width=30):
        """ASCII art for 2-set Venn diagram."""
        if len(self.sets) != 2:
            raise ValueError("ascii_2set requires exactly 2 sets")

        names = list(self.sets.keys())
        A, B = self.sets[names[0]], self.sets[names[1]]

        a_only = A - B
        b_only = B - A
        both = A & B
        neither = set()  # We don't track universe

        lines = [
            f"  {names[0]:^12}     {names[1]:^12}",
            f"  {len(a_only):^12}     {len(b_only):^12}",
            f"     [A only]   [B only]",
            f"        {len(both):^6}  ",
            f"        [Both]  ",
        ]
        return '\n'.join(lines)

    def __repr__(self):
        return f"VennDiagram({list(self.sets.keys())})"

def main():
    """Main Venn diagram program."""
    print("=" * 50)
    print("VENN DIAGRAM GENERATOR")
    print("=" * 50)

    # Two sets
    fruits = {'apple', 'banana', 'cherry', 'date', 'elderberry'}
    berries = {'strawberry', 'blueberry', 'cherry', 'banana'}

    venn2 = VennDiagram(('Fruits', fruits), ('Berries', berries))
    print(f"\n{venn2}")
    print(f"\nRegions:")
    for region, items in venn2.regions().items():
        print(f"  {region}: {items}")

    print(f"\nStatistics:")
    for key, value in venn2.statistics().items():
        print(f"  {key}: {value}")

    print(f"\nASCII Diagram:")
    print(venn2.ascii_2set())

    # Three sets
    A = {1, 2, 3, 4, 5}
    B = {4, 5, 6, 7, 8}
    C = {5, 8, 9, 10}

    venn3 = VennDiagram(('A', A), ('B', B), ('C', C))
    print(f"\n\nThree-set VennDiagram:")
    print(f"Regions:")
    for region, items in venn3.regions().items():
        print(f"  {region}: {items}")

    print(f"\nStatistics:")
    for key, value in venn3.statistics().items():
        print(f"  {key}: {value}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Duplicate Finder",
      "code": `"""
Program 2: Duplicate Finder
Finds duplicates in files, lists, and nested data.
Demonstrates deduplication, hashing, and set operations.
"""

import hashlib
from collections import defaultdict
from typing import List, Dict, Set, Tuple

class DuplicateFinder:
    """Find duplicates using various strategies."""

    @staticmethod
    def find_duplicates(items: List) -> Set:
        """Find all duplicate items in a list."""
        seen = set()
        duplicates = set()
        for item in items:
            if item in seen:
                duplicates.add(item)
            seen.add(item)
        return duplicates

    @staticmethod
    def find_duplicates_with_count(items: List) -> Dict:
        """Find duplicates with occurrence counts."""
        counts = defaultdict(int)
        for item in items:
            counts[item] += 1
        return {k: v for k, v in counts.items() if v > 1}

    @staticmethod
    def find_unique(items: List) -> List:
        """Return items that appear exactly once."""
        counts = defaultdict(int)
        for item in items:
            counts[item] += 1
        return [item for item in items if counts[item] == 1]

    @staticmethod
    def find_file_duplicates(file_hashes: Dict[str, str]) -> Dict[str, Set[str]]:
        """
        Find duplicate files by hash.
        file_hashes: {filename: hash_value}
        Returns: {hash: {filename1, filename2, ...}}
        """
        hash_to_files = defaultdict(set)
        for filename, file_hash in file_hashes.items():
            hash_to_files[file_hash].add(filename)
        return {h: files for h, files in hash_to_files.items() if len(files) > 1}

    @staticmethod
    def find_near_duplicates(sets_list: List[Set], threshold=0.8) -> List[Tuple[Set, Set, float]]:
        """
        Find pairs of sets with Jaccard similarity >= threshold.
        Jaccard = |A ∩ B| / |A ∪ B|
        """
        near_duplicates = []
        for i, A in enumerate(sets_list):
            for j, B in enumerate(sets_list[i+1:], i+1):
                intersection = len(A & B)
                union = len(A | B)
                if union > 0:
                    similarity = intersection / union
                    if similarity >= threshold:
                        near_duplicates.append((A, B, similarity))
        return near_duplicates

    @staticmethod
    def remove_duplicates_preserve_order(items: List) -> List:
        """Remove duplicates while keeping first occurrence."""
        seen = set()
        result = []
        for item in items:
            if item not in seen:
                seen.add(item)
                result.append(item)
        return result

    @staticmethod
    def remove_duplicates_keep_last(items: List) -> List:
        """Remove duplicates while keeping last occurrence."""
        seen = set()
        result = []
        for item in reversed(items):
            if item not in seen:
                seen.add(item)
                result.append(item)
        return list(reversed(result))

def main():
    """Main duplicate finder program."""
    print("=" * 50)
    print("DUPLICATE FINDER")
    print("=" * 50)

    # Basic duplicates
    data = [1, 2, 3, 2, 4, 3, 5, 1, 6]
    print(f"\nData: {data}")
    print(f"Duplicates: {DuplicateFinder.find_duplicates(data)}")
    print(f"With counts: {DuplicateFinder.find_duplicates_with_count(data)}")
    print(f"Unique only: {DuplicateFinder.find_unique(data)}")

    # Preserve order
    print(f"\nPreserve order: {DuplicateFinder.remove_duplicates_preserve_order(data)}")
    print(f"Keep last: {DuplicateFinder.remove_duplicates_keep_last(data)}")

    # File duplicates
    files = {
        'photo1.jpg': 'abc123',
        'photo2.jpg': 'def456',
        'photo3.jpg': 'abc123',  # Duplicate of photo1
        'doc1.pdf': 'xyz789',
        'doc2.pdf': 'xyz789',    # Duplicate of doc1
    }
    dups = DuplicateFinder.find_file_duplicates(files)
    print(f"\nFile duplicates:")
    for hash_val, filenames in dups.items():
        print(f"  Hash {hash_val}: {filenames}")

    # Near duplicates (Jaccard similarity)
    documents = [
        {'python', 'programming', 'tutorial'},
        {'python', 'programming', 'guide'},
        {'java', 'programming', 'tutorial'},
        {'python', 'programming', 'tutorial', 'advanced'},
    ]
    near = DuplicateFinder.find_near_duplicates(documents, 0.5)
    print(f"\nNear duplicates (Jaccard >= 0.5):")
    for A, B, sim in near:
        print(f"  {A} <-> {B}: {sim:.2f}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Tag System",
      "code": `"""
Program 3: Tag System
A complete tag-based categorization system using sets.
Demonstrates set operations for tag queries and recommendations.
"""

from typing import Dict, Set, List, Tuple
from collections import defaultdict

class TaggedItem:
    """An item with a set of tags."""

    def __init__(self, id, name, tags=None):
        self.id = id
        self.name = name
        self.tags = set(tags or [])

    def add_tag(self, tag):
        self.tags.add(tag)

    def remove_tag(self, tag):
        self.tags.discard(tag)

    def has_tag(self, tag):
        return tag in self.tags

    def __repr__(self):
        return f"TaggedItem({self.id}, {self.name!r}, {self.tags})"

class TagSystem:
    """Tag-based item management and recommendation."""

    def __init__(self):
        self._items: Dict[str, TaggedItem] = {}
        self._by_tag: Dict[str, Set[str]] = defaultdict(set)

    def add_item(self, item: TaggedItem):
        """Add item to system."""
        self._items[item.id] = item
        for tag in item.tags:
            self._by_tag[tag].add(item.id)

    def remove_item(self, item_id: str):
        """Remove item from system."""
        if item_id in self._items:
            item = self._items[item_id]
            for tag in item.tags:
                self._by_tag[tag].discard(item_id)
            del self._items[item_id]

    def find_by_tags(self, tags: Set[str], match_all=True) -> List[TaggedItem]:
        """
        Find items by tags.
        match_all=True: item must have ALL tags (AND)
        match_all=False: item must have ANY tag (OR)
        """
        if not tags:
            return list(self._items.values())

        if match_all:
            # Intersection of all tag sets
            candidate_ids = set.intersection(*(self._by_tag[tag] for tag in tags))
        else:
            # Union of all tag sets
            candidate_ids = set.union(*(self._by_tag[tag] for tag in tags))

        return [self._items[id] for id in candidate_ids if id in self._items]

    def find_similar(self, item_id: str, min_common=1) -> List[Tuple[TaggedItem, int]]:
        """Find items sharing at least min_common tags."""
        item = self._items.get(item_id)
        if not item:
            return []

        similar = []
        for other in self._items.values():
            if other.id != item_id:
                common = len(item.tags & other.tags)
                if common >= min_common:
                    similar.append((other, common))

        return sorted(similar, key=lambda x: x[1], reverse=True)

    def recommend_tags(self, item_id: str) -> Set[str]:
        """Recommend tags based on similar items."""
        item = self._items.get(item_id)
        if not item:
            return set()

        # Tags from similar items that this item doesn't have
        recommended = set()
        for other, common in self.find_similar(item_id, 1)[:5]:
            recommended |= other.tags - item.tags
        return recommended

    def tag_statistics(self) -> Dict[str, int]:
        """Return count of items per tag."""
        return {tag: len(ids) for tag, ids in self._by_tag.items()}

    def all_tags(self) -> Set[str]:
        """Return all unique tags."""
        return set(self._by_tag.keys())

    def cooccurrence_matrix(self) -> Dict[Tuple[str, str], int]:
        """Find tags that frequently appear together."""
        matrix = defaultdict(int)
        for item in self._items.values():
            tags = sorted(item.tags)
            for i, t1 in enumerate(tags):
                for t2 in tags[i+1:]:
                    matrix[(t1, t2)] += 1
        return dict(matrix)

    def __repr__(self):
        return f"TagSystem({len(self._items)} items, {len(self.all_tags())} tags)"

def main():
    """Main tag system program."""
    print("=" * 50)
    print("TAG SYSTEM")
    print("=" * 50)

    system = TagSystem()

    # Add items
    items = [
        TaggedItem('1', 'Python Tutorial', {'python', 'tutorial', 'programming', 'beginner'}),
        TaggedItem('2', 'Advanced Python', {'python', 'advanced', 'programming', 'performance'}),
        TaggedItem('3', 'Web Dev Guide', {'javascript', 'web', 'programming', 'tutorial'}),
        TaggedItem('4', 'Python Web', {'python', 'web', 'django', 'programming'}),
        TaggedItem('5', 'Data Science', {'python', 'data', 'ml', 'advanced'}),
        TaggedItem('6', 'JavaScript Basics', {'javascript', 'tutorial', 'beginner'}),
    ]

    for item in items:
        system.add_item(item)

    print(f"\n{system}")

    # Find by tags (AND)
    results = system.find_by_tags({'python', 'tutorial'}, match_all=True)
    print(f"\nItems with 'python' AND 'tutorial': {[i.name for i in results]}")

    # Find by tags (OR)
    results = system.find_by_tags({'python', 'javascript'}, match_all=False)
    print(f"Items with 'python' OR 'javascript': {[i.name for i in results]}")

    # Find similar
    similar = system.find_similar('1', min_common=2)
    print(f"\nSimilar to 'Python Tutorial':")
    for item, common in similar:
        print(f"  {item.name} ({common} common tags)")

    # Recommend tags
    recs = system.recommend_tags('1')
    print(f"\nRecommended tags for 'Python Tutorial': {recs}")

    # Statistics
    stats = system.tag_statistics()
    print(f"\nTag statistics:")
    for tag, count in sorted(stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  {tag}: {count} items")

    # Co-occurrence
    cooccur = system.cooccurrence_matrix()
    print(f"\nTag co-occurrence (top 5):")
    for (t1, t2), count in sorted(cooccur.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {t1} + {t2}: {count} times")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Mutual Friends Finder",
      "code": `"""
Program 4: Mutual Friends Finder
Social network analysis using sets.
Demonstrates set operations for relationship analysis.
"""

from typing import Dict, Set, List, Tuple
from collections import defaultdict

class SocialNetwork:
    """Social network with set-based friendship analysis."""

    def __init__(self):
        self._friends: Dict[str, Set[str]] = defaultdict(set)

    def add_friendship(self, person1: str, person2: str):
        """Add bidirectional friendship."""
        self._friends[person1].add(person2)
        self._friends[person2].add(person1)

    def remove_friendship(self, person1: str, person2: str):
        """Remove bidirectional friendship."""
        self._friends[person1].discard(person2)
        self._friends[person2].discard(person1)

    def get_friends(self, person: str) -> Set[str]:
        return self._friends.get(person, set())

    def mutual_friends(self, person1: str, person2: str) -> Set[str]:
        """Find friends shared by two people."""
        return self._friends[person1] & self._friends[person2]

    def friend_difference(self, person1: str, person2: str) -> Tuple[Set[str], Set[str]]:
        """
        Find friends unique to each person.
        Returns: (only_person1, only_person2)
        """
        f1 = self._friends[person1]
        f2 = self._friends[person2]
        return f1 - f2, f2 - f1

    def suggest_friends(self, person: str, min_mutual=1) -> List[Tuple[str, int]]:
        """
        Suggest friends based on mutual connections.
        Returns: [(suggested_friend, mutual_count), ...]
        """
        friends = self._friends[person]
        suggestions = defaultdict(int)

        for friend in friends:
            for ff in self._friends[friend]:
                if ff != person and ff not in friends:
                    suggestions[ff] += 1

        return [(name, count) for name, count in suggestions.items()
                if count >= min_mutual]

    def cliques(self, min_size=3) -> List[Set[str]]:
        """
        Find cliques (groups where everyone is friends).
        Simple implementation for small networks.
        """
        people = list(self._friends.keys())
        cliques = []

        def is_clique(group: Set[str]) -> bool:
            for p1 in group:
                for p2 in group:
                    if p1 != p2 and p2 not in self._friends[p1]:
                        return False
            return True

        from itertools import combinations
        for size in range(min_size, len(people) + 1):
            for group in combinations(people, size):
                group_set = set(group)
                if is_clique(group_set) and group_set not in cliques:
                    # Check if subset of existing larger clique
                    if not any(group_set < c for c in cliques):
                        cliques.append(group_set)

        return [c for c in cliques if not any(c < other for other in cliques)]

    def degrees_of_separation(self, person1: str, person2: str) -> int:
        """
        Find shortest path length between two people (BFS).
        Returns -1 if no connection.
        """
        if person1 == person2:
            return 0
        if person2 in self._friends[person1]:
            return 1

        visited = {person1}
        queue = [(friend, 1) for friend in self._friends[person1]]

        while queue:
            current, distance = queue.pop(0)
            if current == person2:
                return distance
            for friend in self._friends[current]:
                if friend not in visited:
                    visited.add(friend)
                    queue.append((friend, distance + 1))

        return -1

    def network_density(self) -> float:
        """
        Calculate network density (0 to 1).
        Density = actual_connections / possible_connections
        """
        n = len(self._friends)
        if n < 2:
            return 0.0
        possible = n * (n - 1) / 2
        actual = sum(len(friends) for friends in self._friends.values()) / 2
        return actual / possible

    def __repr__(self):
        return f"SocialNetwork({len(self._friends)} people)"

def main():
    """Main social network program."""
    print("=" * 50)
    print("MUTUAL FRIENDS FINDER")
    print("=" * 50)

    network = SocialNetwork()

    # Build network
    friendships = [
        ('Alice', 'Bob'), ('Alice', 'Charlie'), ('Alice', 'Diana'),
        ('Bob', 'Charlie'), ('Bob', 'Eve'),
        ('Charlie', 'Diana'), ('Charlie', 'Eve'),
        ('Diana', 'Eve'), ('Diana', 'Frank'),
        ('Eve', 'Frank'), ('Eve', 'Grace'),
        ('Frank', 'Grace'),
    ]

    for p1, p2 in friendships:
        network.add_friendship(p1, p2)

    print(f"\n{network}")

    # Mutual friends
    mutual = network.mutual_friends('Alice', 'Bob')
    print(f"\nMutual friends of Alice & Bob: {mutual}")

    mutual = network.mutual_friends('Alice', 'Eve')
    print(f"Mutual friends of Alice & Eve: {mutual}")

    # Friend differences
    only_alice, only_bob = network.friend_difference('Alice', 'Bob')
    print(f"\nOnly Alice's friends: {only_alice}")
    print(f"Only Bob's friends: {only_bob}")

    # Friend suggestions
    suggestions = network.suggest_friends('Alice', min_mutual=2)
    print(f"\nFriend suggestions for Alice (2+ mutual):")
    for name, count in suggestions:
        print(f"  {name} ({count} mutual friends)")

    # Degrees of separation
    print(f"\nDegrees of separation:")
    for target in ['Bob', 'Eve', 'Grace']:
        deg = network.degrees_of_separation('Alice', target)
        print(f"  Alice -> {target}: {deg} degrees")

    # Network density
    print(f"\nNetwork density: {network.network_density():.2f}")

    # Cliques
    cliques = network.cliques(min_size=3)
    print(f"\nCliques (3+ people):")
    for c in cliques:
        print(f"  {c}")

    print("=" * 50)

if __name__ == "__main__":
    main()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 14. 4/5 correct means you have mastered sets and set theory."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain why sets are implemented as hash tables and why membership testing is O(1). Write a benchmark that compares 'x in list' vs 'x in set' for a large collection. What is the trade-off of using sets over lists?",
        "Q2: Write a function that takes two lists and returns: (a) elements in both, (b) elements only in the first, (c) elements in either but not both. Use set operations. What is the mathematical name for operation (c)?",
        "Q3: What is a frozenset and why does it exist? Write code that uses a frozenset as a dictionary key and as an element of another set. Explain why you cannot use a regular set for these purposes.",
        "Q4: Write a set comprehension that generates all unique pairs (a, b) where a and b are from two different lists and a < b. Then use set operations to find which pairs are common between two different pair sets.",
        "Q5: Explain the Jaccard similarity index. Write a function that calculates Jaccard similarity between two sets. Use it to find near-duplicate documents represented as sets of words."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Sets are hash tables like dictionaries, storing only keys. The hash function maps elements to array indices, making lookup O(1) average case. Benchmark: create list/set of 1M items, time 10,000 'x in container' checks. Set is ~1000x faster. Trade-off: sets are unordered (no indexing), require hashable elements, and use more memory per element than lists for small collections. A2: def analyze(a, b): A, B = set(a), set(b); return {'both': A & B, 'only_first': A - B, 'either_not_both': A ^ B}. Operation (c) is symmetric difference (XOR of sets): elements in exactly one of the sets. A3: frozenset is an immutable set. It exists because immutability makes it hashable, enabling use as dict keys and set elements. Regular sets are mutable and unhashable, so they cannot be dict keys or set elements. Example: cache = {frozenset({1,2}): 'value'}. Sets of sets: {frozenset({1,2}), frozenset({3,4})}. A4: pairs = {(a, b) for a in list1 for b in list2 if a < b}. Common pairs: pairs1 & pairs2. This is useful for finding shared relationships between two datasets. A5: Jaccard similarity = |A ∩ B| / |A ∪ B|. It measures overlap between two sets, ranging from 0 (no overlap) to 1 (identical). def jaccard(a, b): intersection = len(a & b); union = len(a | b); return intersection / union if union else 0. Near-duplicate detection: convert documents to word sets, compute Jaccard, flag pairs with similarity > 0.8."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered sets and set theory. You understand that sets are hash tables — unordered collections with O(1) membership testing. You perform union, intersection, difference, and symmetric difference with both operators and methods, knowing when each is appropriate. You create frozensets for immutable, hashable sets that serve as dictionary keys and set elements. You write set comprehensions that build unique collections declaratively. You apply sets to real problems: deduplication, relationship analysis, tag systems, and social network analysis. You have built four complete programs: a Venn diagram generator with ASCII art, a duplicate finder with Jaccard similarity, a tag system with recommendations, and a mutual friends finder with clique detection and degrees of separation. Sets are no longer just 'lists without duplicates.' They are mathematical power tools that solve problems with elegance and speed."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Sets are hash tables without values. Membership testing is O(1). Union, intersection, and difference are single operations. frozensets are hashable sets. Set comprehensions build unique collections declaratively. Master these five truths, and you have mastered the mathematical power of Python. In Part 14, we will explore Range, Enumerate, Zip & Iteration Tools — the lazy, memory-efficient utilities that make Python iteration elegant."
    },
    {
      "type": "cta",
      "text": "Start Part 14: Range, Enumerate, Zip & Iteration Tools →",
      "href": "/tutorials/python-unlocked/part-14-range-enumerate-zip",
      "note": "20 min read · Lazy evaluation · Memory efficiency · itertools preview"
    }
  ]
};

export default post;
