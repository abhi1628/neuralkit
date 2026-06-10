const post = {
  "slug": "part-6-strings-unicode",
  "seriesSlug": "python-unlocked",
  "partNumber": 6,
  "totalParts": 30,
  "title": "Strings: The Art of Text in a Unicode World (Part 6)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 20, 2026",
  "readTime": "30 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Every string is a story. Unicode, UTF-8, code points, string methods arsenal, triple quotes, and the encoding wars that every developer must understand to handle text correctly. Python 3.12 features included.",
  "coverEmoji": "📝",
  "tags": [
    "Python", "Strings", "Unicode", "UTF-8", "String Methods",
    "Triple Quotes", "Encoding", "Text Processing", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1988, a programmer named Joel Spolsky wrote an essay that would become legendary in software engineering circles. Its title was simple: 'The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!).' Nearly four decades later, in 2026, that essay is still required reading. Why? Because text is the most common data type in programming, and the most commonly mishandled. Every database query, every API response, every file read, every user input — it is all text. And text is not simple. In Python, strings are sequences of Unicode code points. Not bytes. Not characters. Code points. This distinction matters because it determines how you handle emoji, how you count string length, how you slice text, and how you write code that works across languages and platforms. In this part, we will decode the mysteries of Unicode, master the complete arsenal of string methods, wield triple quotes like a poet, and navigate the encoding wars that have destroyed more data than hard drive failures. By the end, you will not just manipulate strings. You will understand them."
    },
    {
      "type": "h2",
      "text": "Unicode: The Universal Alphabet of Computing"
    },
    {
      "type": "p",
      "text": "Before Unicode, there was chaos. Every region had its own encoding. The US used ASCII (128 characters). Western Europe used Latin-1 (256 characters). Russia used KOI8-R. Japan used Shift JIS. China used GB2312. When you received a file from another country, it was often gibberish. Unicode solved this by assigning a unique number — a code point — to every character in every writing system on Earth. Emoji? Code point. Ancient Egyptian hieroglyphs? Code point. Mathematical symbols? Code point. As of 2026, Unicode 15.1 contains over 149,000 characters covering 161 scripts. Python 3 strings are Unicode by default. This is not a feature. It is a revolution."
    },
    {
      "type": "code-block",
      "label": "Unicode Fundamentals",
      "code": `# === CODE POINTS: THE DNA OF TEXT ===
# Every character has a unique Unicode code point: U+XXXX

# ASCII characters (U+0000 to U+007F)
print('ASCII range:')
print(f'  A = U+{ord("A"):04X}')   # U+0041
print(f'  z = U+{ord("z"):04X}')   # U+007A
print(f'  0 = U+{ord("0"):04X}')   # U+0030

# Beyond ASCII: the world writes in more than English
print(f'\nBeyond ASCII:')
print(f'  é = U+{ord("é"):04X}')    # U+00E9 (French)
print(f'  中 = U+{ord("中"):04X}')   # U+4E2D (Chinese)
print(f'  α = U+{ord("α"):04X}')    # U+03B1 (Greek)
print(f'  ₿ = U+{ord("₿"):04X}')    # U+20BF (Bitcoin symbol)

# Emoji
print(f'\nEmoji:')
print(f'  🐍 = U+{ord("🐍"):04X}')   # U+1F40D (snake)
print(f'  🚀 = U+{ord("🚀"):04X}')   # U+1F680 (rocket)
print(f'  👨‍👩‍👧‍👦 = U+{ord("👨‍👩‍👧‍👦"):04X}')  # U+1F468 (family is a sequence!)

# === chr() AND ord(): THE TRANSLATORS ===
# ord() converts character to code point
# chr() converts code point to character

print(f'\nchr(65) = {chr(65)}')      # A
print(f'chr(128013) = {chr(128013)}')  # 🐍
print(f'chr(0x1F680) = {chr(0x1F680)}')  # 🚀

# === THE LENGTH SURPRISE ===
# len() counts CODE POINTS, not visual characters or bytes.

text = 'café'
print(f'\nString: "{text}"')
print(f'len() = {len(text)}')  # 4 code points

emoji_text = 'Python🐍'
print(f'\nString: "{emoji_text}"')
print(f'len() = {len(emoji_text)}')  # 7 code points (6 letters + 1 emoji)

# Family emoji is a sequence of 4 code points joined by ZWJ (zero-width joiner)
family = '👨‍👩‍👧‍👦'
print(f'\nFamily emoji: "{family}"')
print(f'len() = {len(family)}')  # 11 code points! (4 people + 3 ZWJ + 4 skin tone modifiers)
print(f'Code points: {[f"U+{ord(c):04X}" for c in family]}')

# === UNICODE CATEGORIES ===
import unicodedata

print(f'\nUnicode categories:')
print(f'  "A" is: {unicodedata.category("A")}')       # Lu (Letter, uppercase)
print(f'  "a" is: {unicodedata.category("a")}')       # Ll (Letter, lowercase)
print(f'  "1" is: {unicodedata.category("1")}')       # Nd (Number, decimal digit)
print(f'  "🐍" is: {unicodedata.category("🐍")}')   # So (Symbol, other)
print(f'  " " is: {unicodedata.category(" ")}')   # Zs (Separator, space)

# Unicode names
print(f'\nUnicode names:')
print(f'  U+0041: {unicodedata.name("A")}')
print(f'  U+1F40D: {unicodedata.name("🐍")}')
print(f'  U+03B1: {unicodedata.name("α")}')

# Lookup by name
print(f'\nLookup: {unicodedata.lookup("LATIN CAPITAL LETTER A")}')  # A
print(f'Lookup: {unicodedata.lookup("SNAKE")}')  # 🐍`
    },
    {
      "type": "h2",
      "text": "UTF-8: The Encoding That Runs the Internet"
    },
    {
      "type": "p",
      "text": "Unicode defines code points. UTF-8 defines how to store them as bytes. UTF-8 is brilliant because it is backward-compatible with ASCII (English text uses 1 byte per character), efficient for European languages (2 bytes), and capable of representing every Unicode character (up to 4 bytes). As of 2026, over 98% of web pages use UTF-8. Python 3 source files are UTF-8 by default. Your strings are UTF-8 when encoded to bytes. Understanding UTF-8 is not optional — it is the foundation of modern text handling."
    },
    {
      "type": "code-block",
      "label": "UTF-8 Deep Dive",
      "code": `# === UTF-8 ENCODING SCHEME ===
# U+0000 to U+007F:     1 byte  (ASCII)
# U+0080 to U+07FF:     2 bytes (European, Arabic, Hebrew)
# U+0800 to U+FFFF:     3 bytes (Chinese, Japanese, Korean, emoji)
# U+10000 to U+10FFFF:  4 bytes (rare scripts, historical)

# Encode: str -> bytes
text = 'Hello, World! 🐍'
encoded = text.encode('utf-8')
print(f'Text: {text}')
print(f'UTF-8 bytes: {encoded}')
print(f'Length in bytes: {len(encoded)}')
print(f'Length in code points: {len(text)}')

# Decode: bytes -> str
decoded = encoded.decode('utf-8')
print(f'\nDecoded back: {decoded}')
print(f'Match original: {decoded == text}')

# === BYTE LENGTH BY CHARACTER ===
print(f'\nUTF-8 byte lengths:')
for char in ['A', 'é', '中', '🐍']:
    byte_len = len(char.encode('utf-8'))
    print(f'  "{char}" (U+{ord(char):04X}): {byte_len} byte(s)')

# === THE BOM (BYTE ORDER MARK) ===
# UTF-8 can include a BOM (EF BB BF) at the start to identify encoding.
# Python handles BOM automatically when decoding.

with_bom = 'test'.encode('utf-8-sig')  # Include BOM
print(f'\nWith BOM: {with_bom}')
print(f'First 3 bytes: {with_bom[:3].hex()} (EF BB BF = BOM)')

# === ENCODING ERRORS ===
# What happens when text cannot be encoded?

text_with_unencodable = 'Hello 🐍'

# 'ascii' encoding cannot handle emoji
try:
    text_with_unencodable.encode('ascii')
except UnicodeEncodeError as e:
    print(f'\nEncode error: {e}')

# Error handling strategies:
print(f'\nError strategies:')
print(f'  ignore:  {text_with_unencodable.encode("ascii", errors="ignore")}')
print(f'  replace: {text_with_unencodable.encode("ascii", errors="replace")}')
print(f'  xmlchar: {text_with_unencodable.encode("ascii", errors="xmlcharrefreplace")}')

# === LATIN-1 AND WINDOWS-1252 ===
# Legacy encodings that still appear in old files and APIs.

# Windows-1252 (Western European) is NOT the same as Latin-1!
text = '€20'  # Euro sign
print(f'\nEuro sign encoding:')
print(f'  UTF-8:   {text.encode("utf-8")}')
print(f'  Latin-1: Cannot encode € (raises error)')
print(f'  CP1252:  {text.encode("cp1252")}')

# === PYTHON 3.12: IMPROVED ERROR MESSAGES ===
# Python 3.12 gives better encoding error messages.
# Try this in Python 3.12:
# b'\xff\xfe'.decode('utf-8')
# UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0: invalid start byte
#   Did you mean to use 'utf-16' or 'utf-32'?`
    },
    {
      "type": "h2",
      "text": "String Methods: The Complete Arsenal"
    },
    {
      "type": "p",
      "text": "Python strings have over 40 built-in methods. Most developers use 10% of them. The other 90% are power tools that solve specific problems elegantly. Let us explore the complete arsenal, organized by purpose."
    },
    {
      "type": "code-block",
      "label": "String Methods Mastery",
      "code": `text = '  Hello, Python World!  '

# === CASE MANIPULATION ===
print('Case manipulation:')
print(f'  upper():      "{text.upper()}"')
print(f'  lower():      "{text.lower()}"')
print(f'  title():      "{text.title()}"')      # Hello, Python World!
print(f'  capitalize(): "{text.capitalize()}"')  #   hello, python world!
print(f'  swapcase():   "{text.swapcase()}"')    #   hELLO, pYTHON wORLD!

# === STRIP AND PAD ===
print(f'\nStrip and pad:')
print(f'  strip():      "{text.strip()}"')       # Remove whitespace from ends
print(f'  lstrip():     "{text.lstrip()}"')      # Remove from left
print(f'  rstrip():     "{text.rstrip()}"')      # Remove from right
print(f'  center(30):   "{text.strip().center(30, "*")}"')
print(f'  ljust(30):    "{text.strip().ljust(30, "-")}"')
print(f'  rjust(30):    "{text.strip().rjust(30, ".")}"')

# === SEARCH ===
text = 'The quick brown fox jumps over the lazy dog'
print(f'\nSearch in: "{text}"')
print(f'  find("fox"):        {text.find("fox")}')         # 16 (index)
print(f'  find("cat"):        {text.find("cat")}')         # -1 (not found)
print(f'  index("fox"):       {text.index("fox")}')        # 16 (or raises!)
print(f'  rfind("the"):       {text.rfind("the")}')        # 31 (rightmost)
print(f'  count("o"):         {text.count("o")}')          # 4
print(f'  startswith("The"): {text.startswith("The")}')  # True
print(f'  endswith("dog"):   {text.endswith("dog")}')    # True

# === REPLACE AND SPLIT ===
print(f'\nReplace and split:')
print(f'  replace("fox", "cat"): "{text.replace("fox", "cat")}"')
print(f'  split():                  {text.split()}')           # Default: whitespace
print(f'  split("o"):              {text.split("o")}')       # Split on 'o'
print(f'  rsplit(" ", 2):         {text.rsplit(" ", 2)}')    # Split from right, max 2

# Join (the inverse of split)
words = ['Python', 'is', 'awesome']
print(f'  " ".join(words):         "{" ".join(words)}"')
print(f'  "-".join(words):         "{"-".join(words)}"')

# === CHECKS ===
checks = ['123', 'abc', 'ABC', '123abc', '  ', 'Hello123']
print(f'\nType checks:')
for s in checks:
    print(f'  "{s}": isdigit={s.isdigit()}, isalpha={s.isalpha()}, '\n          f'isalnum={s.isalnum()}, isspace={s.isspace()}, '\n          f'istitle={s.istitle()}')

# === ADVANCED: translate AND maketrans ===
# Fast character-by-character replacement

text = 'hello world'
trans = str.maketrans('aeiou', '12345')  # a->1, e->2, i->3, o->4, u->5
print(f'\ntranslate: "{text.translate(trans)}"')  # h2ll4 w4rld

# Remove characters with translate
trans_remove = str.maketrans('', '', 'aeiou')  # Third arg = chars to delete
print(f'remove vowels: "{text.translate(trans_remove)}"')  # hll wrld

# === PARTITION AND SPLITLINES ===
print(f'\nPartition:')
path = '/home/user/file.txt'
print(f'  partition("/"): {path.rpartition("/")}')  # ('/home/user', '/', 'file.txt')

print(f'\nSplitlines:')
multiline = 'line1\nline2\r\nline3\rline4'
print(f'  splitlines(): {multiline.splitlines()}')  # Handles all line endings
print(f'  splitlines(keepends=True): {multiline.splitlines(True)}')`
    },
    {
      "type": "h2",
      "text": "Triple Quotes: The Swiss Army Knife of Strings"
    },
    {
      "type": "p",
      "text": "Triple quotes are not just for multi-line strings. They are a multi-tool that serves as docstrings, multi-line literals, string normalization, and even a way to avoid escape character hell. Most developers underuse them. Let us fix that."
    },
    {
      "type": "code-block",
      "label": "Triple Quotes Mastery",
      "code": `# === 1. DOCSTRINGS ===
# The most common use: documenting functions, classes, modules.

def calculate_area(length, width):
    """Calculate the area of a rectangle.

    This function takes the length and width of a rectangle
    and returns the area. It handles negative inputs by
    raising a ValueError.

    Args:
        length (float): The length of the rectangle.
        width (float): The width of the rectangle.

    Returns:
        float: The calculated area.

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

# === 2. MULTI-LINE STRINGS ===
# Perfect for SQL queries, HTML templates, JSON, and more.

query = '''
SELECT 
    u.username,
    u.email,
    COUNT(o.order_id) as total_orders
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.user_id
HAVING total_orders > 5
ORDER BY total_orders DESC
LIMIT 100;
'''

print('SQL Query:')
print(query)

# === 3. AVOIDING ESCAPE HELL ===
# Without triple quotes, regex and paths become unreadable.

# Bad: escaping every backslash
regex_bad = 'C:\\Users\\Alice\\Documents\\file.txt'

# Good: raw string with triple quotes (for complex cases)
regex_good = r'''C:\Users\Alice\Documents\file.txt'''

# Even better for complex regex:
pattern = r'''\b              # Word boundary
              (\d{3})        # Area code
              [-.]?          # Separator
              (\d{3})        # Prefix
              [-.]?          # Separator
              (\d{4})        # Line number
              \b              # Word boundary
           '''

# === 4. STRING NORMALIZATION ===
# Triple quotes preserve whitespace exactly. This is powerful
# for testing, templates, and data formatting.

poem = '''The Zen of Python, by Tim Peters

Beautiful is better than ugly._
Explicit is better than implicit._
Simple is better than complex._
Complex is better than complicated._
Flat is better than nested.'''

print(f'\nPoem has {len(poem.splitlines())} lines')

# === 5. f-STRINGS IN TRIPLE QUOTES ===
# Python 3.6+ allows f-strings in triple quotes for multi-line formatting.

name = 'Alice'
age = 30
skills = ['Python', 'Data Science', 'Machine Learning']

profile = f'''
=== User Profile ===
Name:  {name}
Age:   {age}
Skills:
{chr(10).join(f'  - {skill}' for skill in skills)}
===================='''

print(profile)

# === 6. TRIPLE QUOTES WITH PYTHON 3.12 DEBUG ===
# Python 3.12 f-string debug expressions work in triple quotes!

x = 42
y = 3.14159

report = f'''
Debug Report:
  x = {x}
  y = {y:.2f}
  x + y = {x + y:.4f}
  
  # Python 3.12 debug syntax:
  {x=}
  {y=:.2f}
  {x + y=:.4f}
'''

print(report)

# === 7. TEXT DEDENTATION ===
# Triple quotes preserve indentation. Use textwrap.dedent() to remove it.

import textwrap

code = '''
    def hello():
        print("Hello, World!")
    '''

print('Original:')
print(repr(code))

print('\nDedented:')
print(repr(textwrap.dedent(code)))

# === 8. MULTI-LINE WITHOUT NEWLINES ===
# Use backslash at the end of lines to suppress newlines.

long_string = '''This is a very long string that \\n\\
spans multiple lines in the source code \\n\\
but appears as one line when printed.'''

print(f'\nNo newlines: "{long_string}"')`
    },
    {
      "type": "h2",
      "text": "str vs bytes: The Encoding Wars"
    },
    {
      "type": "p",
      "text": "In Python 3, text and binary data are distinct types. str is for text (Unicode code points). bytes is for binary data (raw bytes). You cannot mix them. You must explicitly encode str to bytes and decode bytes to str. This separation prevents the encoding bugs that plagued Python 2. But it also means you must understand when to use which — and how to convert between them."
    },
    {
      "type": "code-block",
      "label": "str vs bytes Mastery",
      "code": `# === THE FUNDAMENTAL DISTINCTION ===
# str:  sequence of Unicode code points (human-readable text)
# bytes: sequence of integers 0-255 (raw binary data)

# Create a string
text = 'Hello, World! 🐍'
print(f'Text: {text}')
print(f'Type: {type(text)}')
print(f'Length: {len(text)} code points')

# Encode to bytes
utf8_bytes = text.encode('utf-8')
print(f'\nUTF-8 bytes: {utf8_bytes}')
print(f'Type: {type(utf8_bytes)}')
print(f'Length: {len(utf8_bytes)} bytes')

# Decode back
decoded = utf8_bytes.decode('utf-8')
print(f'\nDecoded: {decoded}')
print(f'Match: {decoded == text}')

# === BYTES LITERALS ===
# Prefix with b for bytes literals (must be ASCII-compatible)
byte_literal = b'Hello, World!'
print(f'\nBytes literal: {byte_literal}')
print(f'Type: {type(byte_literal)}')

# b'café' would raise SyntaxError — 'é' is not ASCII!
# Use encode() instead: 'café'.encode('utf-8')

# === BYTES OPERATIONS ===
print(f'\nBytes operations:')
print(f'  Indexing: {utf8_bytes[0]}')        # Integer, not character!
print(f'  Slice: {utf8_bytes[0:5]}')         # Still bytes
print(f'  Hex: {utf8_bytes.hex()}')          # Hexadecimal representation
print(f'  From hex: {bytes.fromhex(utf8_bytes.hex())}')

# === BYTESARRAY: MUTABLE BYTES ===
# bytearray is like bytes but mutable.

ba = bytearray(b'Hello')
print(f'\nBytearray: {ba}')
ba[0] = ord('J')  # Modify in place!
print(f'After modification: {ba}')
print(f'Decoded: {ba.decode("utf-8")}')

# === FILE I/O: TEXT VS BINARY MODE ===
# Text mode (default): reads str, handles encoding automatically
# Binary mode: reads bytes, you handle encoding

# Text mode:
# with open('file.txt', 'r', encoding='utf-8') as f:
#     content = f.read()  # Returns str

# Binary mode:
# with open('file.txt', 'rb') as f:
#     content = f.read()  # Returns bytes

# === THE ENCODING DETECTION PROBLEM ===
# When you receive bytes without knowing the encoding, you must guess.

# Method 1: Try UTF-8 first (most common)
raw_bytes = b'\xc3\xa9'  # UTF-8 for 'é'
try:
    decoded = raw_bytes.decode('utf-8')
    print(f'\nDecoded as UTF-8: {decoded}')
except UnicodeDecodeError:
    print('Not UTF-8')

# Method 2: Use chardet library for detection
# pip install chardet
# import chardet
# result = chardet.detect(raw_bytes)
# print(result)  # {'encoding': 'utf-8', 'confidence': 0.99}

# === BASE64: TEXT-SAFE BINARY ENCODING ===
# Base64 encodes binary data as ASCII text (safe for email, URLs, JSON).

import base64

binary_data = b'\x00\x01\x02\xff\xfe'
encoded = base64.b64encode(binary_data)
print(f'\nBase64 encoded: {encoded}')  # b'AAEC//4='

decoded = base64.b64decode(encoded)
print(f'Base64 decoded: {decoded}')
print(f'Match: {decoded == binary_data}')

# === PYTHON 3.12: IMPROVED ERROR MESSAGES ===
# Python 3.12 suggests encodings when decoding fails.
# Try: b'\xff\xfe'.decode('utf-8')
# Suggestion: Did you mean to use 'utf-16' or 'utf-32'?`
    },
    {
      "type": "h2",
      "text": "String Interning and Performance"
    },
    {
      "type": "p",
      "text": "In Part 4, we learned about integer interning. Strings can be interned too — but the rules are different and more subtle. Python automatically interns strings that look like identifiers (letters, digits, underscores). It does not intern strings with spaces or special characters. You can force interning with sys.intern(), which is useful when you have many duplicate strings (e.g., reading a CSV with repeated values)."
    },
    {
      "type": "code-block",
      "label": "String Interning and Performance",
      "code": `import sys

# === AUTOMATIC INTERNING ===
# Python interns strings that look like identifiers at compile time.

a = 'hello'
b = 'hello'
print(f'Automatic interning:')
print(f'  "hello" is "hello": {a is b}')  # True

# But not at runtime:
c = 'hel'
d = 'lo'
combined = c + d
print(f'  Runtime concat: {combined is a}')  # False (usually)

# === FORCED INTERNING ===
# Use sys.intern() for strings with many duplicates.

# Simulate reading a CSV with repeated values
raw_data = ['status'] * 100000

# Without interning: 100,000 separate string objects
without_intern = raw_data
print(f'\nWithout interning:')
print(f'  First item id: {id(without_intern[0])}')
print(f'  Last item id:  {id(without_intern[-1])}')
print(f'  Same object? {without_intern[0] is without_intern[-1]}')

# With interning: all point to the same object
with_intern = [sys.intern(s) for s in raw_data]
print(f'\nWith interning:')
print(f'  First item id: {id(with_intern[0])}')
print(f'  Last item id:  {id(with_intern[-1])}')
print(f'  Same object? {with_intern[0] is with_intern[-1]}')

# Memory comparison
print(f'\nMemory comparison:')
print(f'  Without intern: {sys.getsizeof(without_intern):,} bytes')
print(f'  With intern:    {sys.getsizeof(with_intern):,} bytes')
# Note: list size is similar, but the string objects themselves are shared

# === STRING POOLING IN PRACTICE ===
# When to use interning:
# 1. Processing large datasets with many repeated strings
# 2. Comparing strings frequently (is is faster than ==)
# 3. Reducing memory footprint in long-running processes

# When NOT to use interning:
# 1. Unique strings (no benefit, adds overhead)
# 2. Short-lived scripts (GC will clean up anyway)
# 3. Security-sensitive contexts (timing attacks on is vs ==)

# === PERFORMANCE: is vs == ===
import timeit

a = sys.intern('hello_world_this_is_a_long_string')
b = sys.intern('hello_world_this_is_a_long_string')

is_time = timeit.timeit('a is b', globals=globals(), number=1000000)
eq_time = timeit.timeit('a == b', globals=globals(), number=1000000)

print(f'\nPerformance comparison (1M iterations):')
print(f'  is:  {is_time:.4f}s')
print(f'  ==:  {eq_time:.4f}s')
print(f'  is is {eq_time/is_time:.1f}x faster than ==')`
    },
    {
      "type": "h2",
      "text": "Programs: Text Processing in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use strings to solve real problems. Each program reinforces the concepts while building something useful."
    },
    {
      "type": "code-block",
      "label": "Program 1: Word Frequency Analyzer",
      "code": `"""
Program 1: Word Frequency Analyzer
Analyzes text to find the most common words, unique words,
and word length distribution.
"""
import string
from collections import Counter

def clean_word(word):
    """Remove punctuation and convert to lowercase."""
    cleaned = word.strip(string.punctuation).lower()
    return cleaned

def analyze_text(text):
    """Analyze word frequency in text.

    Args:
        text (str): The text to analyze

    Returns:
        dict: Analysis results
    """
    words = [clean_word(w) for w in text.split()]
    words = [w for w in words if w]

    word_counts = Counter(words)

    results = {
        'total_words': len(words),
        'unique_words': len(word_counts),
        'most_common': word_counts.most_common(10),
        'longest_word': max(words, key=len) if words else '',
        'average_length': sum(len(w) for w in words) / len(words) if words else 0,
        'word_length_distribution': Counter(len(w) for w in words)
    }

    return results

def print_analysis(results):
    """Print formatted analysis results."""
    print('\n' + '=' * 50)
    print('TEXT ANALYSIS RESULTS')
    print('=' * 50)

    print(f'\nTotal words:      {results["total_words"]}')
    print(f'Unique words:       {results["unique_words"]}')
    print(f'Vocabulary richness: {results["unique_words"]/results["total_words"]*100:.1f}%')

    print(f'\nLongest word: "{results["longest_word"]}" ({len(results["longest_word"])} chars)')
    print(f'Average length: {results["average_length"]:.1f} chars')

    print(f'\nTop 10 most common words:')
    for word, count in results['most_common']:
        bar = '█' * (count * 50 // results['most_common'][0][1])
        print(f'  {word:<15} {count:>3} {bar}')

    print(f'\nWord length distribution:')
    for length in sorted(results['word_length_distribution']):
        count = results['word_length_distribution'][length]
        print(f'  {length} chars: {count} words')

def main():
    """Main word frequency program."""
    sample_text = '''
    The Zen of Python, by Tim Peters

    Beautiful is better than ugly.
    Explicit is better than implicit.
    Simple is better than complex.
    Complex is better than complicated.
    Flat is better than nested.
    Sparse is better than dense.
    Readability counts.
    Special cases aren't special enough to break the rules.
    Although practicality beats purity.
    Errors should never pass silently.
    Unless explicitly silenced.
    In the face of ambiguity, refuse the temptation to guess.
    There should be one-- and preferably only one --obvious way to do it.
    Although that way may not be obvious at first unless you're Dutch.
    Now is better than never.
    Although never is often better than *right* now.
    If the implementation is hard to explain, it's a bad idea.
    If the implementation is easy to explain, it may be a good idea.
    Namespaces are one honking great idea -- let's do more of those!
    '''

    print('=' * 50)
    print('WORD FREQUENCY ANALYZER')
    print('=' * 50)

    results = analyze_text(sample_text)
    print_analysis(results)

    print('\n' + '=' * 50)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: UTF-8 Explorer",
      "code": `"""
Program 3: UTF-8 Explorer
Visualizes how Unicode characters are encoded as UTF-8 bytes.
"""
import unicodedata

def analyze_character(char):
    """Analyze Unicode and UTF-8 properties of a character."""
    code_point = ord(char)
    utf8_bytes = char.encode('utf-8')

    print(f'\nCharacter: "{char}"')
    print(f'  Unicode: U+{code_point:04X} (decimal: {code_point})')
    print(f'  Name: {unicodedata.name(char, "<unknown>")}')
    print(f'  Category: {unicodedata.category(char)}')

    print(f'  UTF-8 bytes: {utf8_bytes}')
    print(f'  Byte count: {len(utf8_bytes)}')
    print(f'  Hex: {utf8_bytes.hex()}')
    print(f'  Binary: {" ".join(f"{b:08b}" for b in utf8_bytes)}')

    if len(utf8_bytes) == 1:
        print(f'  Pattern: 0xxxxxxx (ASCII, 1 byte)')
    elif len(utf8_bytes) == 2:
        print(f'  Pattern: 110xxxxx 10xxxxxx (2 bytes)')
    elif len(utf8_bytes) == 3:
        print(f'  Pattern: 1110xxxx 10xxxxxx 10xxxxxx (3 bytes)')
    elif len(utf8_bytes) == 4:
        print(f'  Pattern: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx (4 bytes)')

def compare_encodings(text):
    """Compare UTF-8, UTF-16, and UTF-32 encoding sizes."""
    utf8 = text.encode('utf-8')
    utf16 = text.encode('utf-16-le')
    utf32 = text.encode('utf-32-le')

    print(f'\nEncoding comparison for: "{text}"')
    print(f'  Code points: {len(text)}')
    print(f'  UTF-8:   {len(utf8):3d} bytes')
    print(f'  UTF-16:  {len(utf16):3d} bytes')
    print(f'  UTF-32:  {len(utf32):3d} bytes')

    print(f'\n  UTF-8 efficiency:  {len(utf8)/len(text):.1f} bytes/code point')
    print(f'  UTF-16 efficiency: {len(utf16)/len(text):.1f} bytes/code point')
    print(f'  UTF-32 efficiency: {len(utf32)/len(text):.1f} bytes/code point')

def main():
    """Main UTF-8 explorer program."""
    print('=' * 60)
    print('UTF-8 EXPLORER')
    print('=' * 60)

    characters = [\n        'A',           # ASCII\n        'é',           # Latin (2 bytes)\n        '中',           # CJK (3 bytes)\n        '🐍',           # Emoji (4 bytes)\n        '👨\u200D👩\u200D👧\u200D👦',        # Family emoji (complex sequence)\n    ]

    for char in characters:
        analyze_character(char)

    print('\n' + '=' * 60)
    print('ENCODING COMPARISON')
    print('=' * 60)

    compare_encodings('Hello, World!')  # Mostly ASCII
    compare_encodings('Hello, 世界!')    # Mixed
    compare_encodings('你好世界！')        # All CJK
    compare_encodings('🐍🚀🎉🎊')          # All emoji

    print('\n' + '=' * 60)
    print('Key Insight:')
    print('  UTF-8 is efficient for ASCII (1 byte) and European (2 bytes).')
    print('  UTF-16 is efficient for CJK text (2 bytes vs 3 in UTF-8).')
    print('  UTF-32 is always 4 bytes — simple but wasteful.')
    print('  UTF-8 won the internet because most text is ASCII.')
    print('=' * 60)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 7. 4/5 correct means you have mastered Python strings."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Explain why len('🐍') == 1 but len('👨‍👩‍👧‍👦') == 11. What are ZWJ characters and why do they exist?",
        "Q2: Write a program that takes a string and returns a dictionary showing how many bytes each character uses in UTF-8 encoding. Test it with 'Hello, World! 🐍'.",
        "Q3: What is the difference between str and bytes in Python 3? When would you encode str to bytes? When would you decode bytes to str? Give a real-world example of each.",
        "Q4: Explain the mutable default argument trap using a function that takes a string parameter. Why does def greet(name, greeting='Hello') work fine, but def add_suffix(name, suffixes=[]) fail?",
        "Q5: Write a function that uses str.translate() to replace all vowels in a string with their Unicode names (e.g., 'a' -> 'LATIN SMALL LETTER A'). Use unicodedata.name() and str.maketrans()."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: len() counts Unicode code points, not visual characters. '🐍' is a single code point (U+1F40D). '👨‍👩‍👧‍👦' is a sequence of 4 person emoji (U+1F468, U+1F469, U+1F467, U+1F466) joined by 3 ZWJ (Zero-Width Joiner, U+200D) characters, totaling 11 code points. ZWJ exists to combine separate emoji into a single visual glyph (like combining family members into one family emoji). A2: See the UTF-8 Explorer program in this part. The key is iterating through each character, encoding it individually, and measuring the byte length. A3: str is a sequence of Unicode code points (human-readable text). bytes is a sequence of integers 0-255 (raw binary data). You encode str to bytes when writing to files, sending over network, or storing in databases. You decode bytes to str when reading from files, receiving network data, or processing binary input. Example: HTTP responses are bytes that must be decoded to str for text processing. A4: 'Hello' is an immutable string. When Python evaluates the default, it creates one string object and reuses it. Strings are immutable, so this is safe — you cannot accidentally modify the default. [] is a mutable list. When Python evaluates the default, it creates one list object. All calls that don't provide suffixes share this SAME list. If one call modifies it, all future calls see the modification. This is the classic mutable default argument trap. A5: The solution involves creating a translation table where each vowel maps to its Unicode name. However, Unicode names are longer than single characters, so str.translate() cannot directly substitute longer strings. The correct approach is to iterate and replace, or use a regex substitution with a callback function that calls unicodedata.name()."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python strings. You understand that strings are sequences of Unicode code points, not bytes or characters. You know that UTF-8 is the encoding that runs the internet, and you can explain why. You have explored the complete arsenal of string methods — from basic case manipulation to advanced translate operations. You wield triple quotes for docstrings, multi-line literals, and f-string formatting. You navigate the str vs bytes distinction with confidence, and you understand when to use encoding and decoding. You have built three complete programs: a word frequency analyzer, a Caesar cipher, and a UTF-8 explorer. This is not just string manipulation. This is text mastery."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Text is the most common data type in programming and the most commonly mishandled. Every bug you have ever seen with 'garbled characters,' 'wrong string length,' or 'encoding error' traces back to a misunderstanding of Unicode, UTF-8, or the str/bytes distinction. You now understand all three. In Part 7, we will explore string formatting mastery — from legacy % formatting to modern f-string debug expressions in Python 3.12. You will learn every technique and when to use each for maximum clarity."
    },
    {
      "type": "cta",
      "text": "Start Part 7: String Formatting Mastery →",
      "href": "/tutorials/python-unlocked/part-7-string-formatting",
      "note": "24 min read · % formatting · str.format() · f-strings · Template strings"
    }
  ]
};

export default post;
