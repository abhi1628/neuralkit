const post = {
  "slug": "part-22-file-handling",
  "seriesSlug": "python-unlocked",
  "partNumber": 22,
  "totalParts": 30,
  "title": "File Handling — Reading, Writing, and Manipulating the Filesystem (Part 22)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "28 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "open() and context managers (with). File modes, text vs binary, encoding. read(), readline(), readlines(), iteration. seek(), tell(), file pointers. pathlib for object-oriented paths. json, csv, pickle handling. Four complete programs.",
  "coverEmoji": "📁",
  "tags": [
    "Python", "File Handling", "Context Managers", "pathlib",
    "JSON", "CSV", "Pickle", "Encoding", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1969, Ken Thompson and Dennis Ritchie built UNIX at Bell Labs. Their radical insight was that everything is a file — disks, keyboards, networks, even processes. This abstraction became the foundation of modern computing. Fifty-seven years later, in 2026, Python's file handling model is the most elegant expression of that philosophy. Files are not just data storage. They are the interface between your program and the world — configuration, logs, databases, caches, and inter-process communication. Yet most developers treat file handling as an afterthought. They open files without context managers, ignore encoding specifications, leak file descriptors, and crash when files are missing. In this part, we will explore the full depth of Python's file handling machinery. You will master open() and the with statement that guarantees cleanup. You will understand text vs binary modes, encoding specifications, and the Unicode minefield. You will use read(), readline(), readlines(), and iteration to process files of any size. You will control file pointers with seek() and tell(). You will replace brittle string-path manipulation with pathlib's object-oriented paths. And you will handle JSON, CSV, and pickle — the three data formats that power Python's ecosystem. By the end, file handling will not be a chore. It will be a craft."
    },
    {
      "type": "h2",
      "text": "open() and Context Managers: The with Statement"
    },
    {
      "type": "p",
      "text": "The open() function is the gateway to file handling in Python. But raw open() is dangerous — if an exception occurs before close(), the file descriptor leaks. The with statement creates a context manager that guarantees the file is closed, even if exceptions occur. This is not just convenience. It is correctness."
    },
    {
      "type": "code-block",
      "label": "open() and Context Managers Mastery",
      "code": "# === open() AND CONTEXT MANAGERS ===
# The 'with' statement guarantees cleanup

# --- Basic file opening ---
# Mode 'r' = read (default), 'w' = write (truncate), 'a' = append
# 'x' = exclusive create (fails if file exists)

# BAD: Manual open/close (leaks on exception)
f = open('test.txt', 'w')
f.write('Hello')
f.close()  # What if exception happens above?

# GOOD: Context manager (always closes)
with open('test.txt', 'w') as f:
    f.write('Hello, World!')
    # f.close() called automatically, even on exception

# --- Multiple context managers ---
with open('input.txt', 'r') as src, open('output.txt', 'w') as dst:
    dst.write(src.read().upper())

# --- Context manager protocol ---
# __enter__() -> returns the resource
# __exit__(exc_type, exc_val, exc_tb) -> cleanup, suppress exception if returns True

class ManagedFile:
    """Custom context manager for files."""
    
    def __init__(self, filename, mode='r'):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        print(f'  Opening {self.filename}')
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f'  Closing {self.filename}')
        if self.file:
            self.file.close()
        # Return True to suppress exception, False to propagate
        return False

with ManagedFile('test.txt', 'r') as f:
    content = f.read()
    print(f'  Content: {content[:20]}...')

# --- contextlib.contextmanager ---
from contextlib import contextmanager

@contextmanager
def managed_file(filename, mode='r'):
    """Simplified context manager using generator."""
    f = open(filename, mode)
    try:
        yield f
    finally:
        f.close()

with managed_file('test.txt', 'r') as f:
    print(f'  Generator CM: {f.read()[:20]}...')

# --- File modes reference ---
modes = {
    'r': 'Read (default, file must exist)',
    'w': 'Write (truncate existing)',
    'x': 'Exclusive create (fail if exists)',
    'a': 'Append (create if not exists)',
    'b': 'Binary mode (add to others: rb, wb)',
    't': 'Text mode (default, add to others: rt, wt)',
    '+': 'Read and write (r+, w+, a+)',
}

print(f"\nFile modes:")
for mode, desc in modes.items():
    print(f'  {mode!r}: {desc}')

# --- Writing modes comparison ---
with open('write_test.txt', 'w') as f:
    f.write('Line 1\n')

with open('write_test.txt', 'a') as f:
    f.write('Line 2 (appended)\n')

with open('write_test.txt', 'r') as f:
    print(f"\nAfter write + append:\n{f.read()}")

# --- Exclusive creation ---
try:
    with open('exclusive.txt', 'x') as f:
        f.write('Created exclusively')
except FileExistsError:
    print("\nexclusive.txt already exists (x mode prevented overwrite)")

# Cleanup
import os
for fname in ['test.txt', 'write_test.txt', 'exclusive.txt']:
    if os.path.exists(fname):
        os.unlink(fname)

print("\nopen() and context managers mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Text vs Binary Files and Encoding Specification"
    },
    {
      "type": "p",
      "text": "Text mode ('t') reads and writes strings, automatically handling encoding and newline translation. Binary mode ('b') reads and writes bytes, preserving exact file contents. The encoding parameter specifies the character encoding — UTF-8 is the default and the correct choice for 99% of cases. Understanding this distinction prevents the UnicodeDecodeError and corrupted data that plague inexperienced developers."
    },
    {
      "type": "code-block",
      "label": "Text vs Binary & Encoding Mastery",
      "code": "# === TEXT VS BINARY & ENCODING ===

# --- Text mode (default) ---
# Reads/writes str objects, handles encoding automatically
with open('text_file.txt', 'w', encoding='utf-8') as f:
    f.write('Hello, 世界! 🌍')

with open('text_file.txt', 'r', encoding='utf-8') as f:
    text_content = f.read()
    print(f'Text mode read: {text_content!r}')
    print(f'  Type: {type(text_content).__name__}')

# --- Binary mode ---
# Reads/writes bytes objects, no encoding/decoding
with open('text_file.txt', 'rb') as f:
    binary_content = f.read()
    print(f'\nBinary mode read: {binary_content!r}')
    print(f'  Type: {type(binary_content).__name__}')
    print(f'  Length: {len(binary_content)} bytes')

# --- Encoding differences ---
# UTF-8: variable width (1-4 bytes per character), backward compatible with ASCII
# UTF-16: fixed 2 or 4 bytes, BOM (Byte Order Mark) at start
# Latin-1 (ISO-8859-1): 1 byte per character, maps bytes 0-255 directly

text = 'Café €100'

for enc in ['utf-8', 'utf-16', 'latin-1']:
    encoded = text.encode(enc)
    print(f"\n{enc}: {encoded!r} ({len(encoded)} bytes)")

# --- The Unicode minefield ---
# If you don't specify encoding, Python uses locale.getpreferredencoding()
# This varies by OS and configuration — NEVER rely on it for portable code

import locale
print(f"\nDefault encoding: {locale.getpreferredencoding()}")
print(f'File system encoding: {locale.getfilesystemencoding()}')

# --- Writing binary data ---
with open('binary_data.bin', 'wb') as f:
    f.write(b'\x00\x01\x02\x03')
    f.write(b'\xff\xfe')

with open('binary_data.bin', 'rb') as f:
    data = f.read()
    print(f'\nBinary data: {data!r}')
    print(f'  Hex: {data.hex()}')

# --- Newline handling ---
# Text mode: '\n' written as os.linesep (\r\n on Windows, \n on Unix)
# Binary mode: no translation, exact bytes preserved

with open('newline_test.txt', 'w') as f:
    f.write('Line 1\nLine 2\n')

with open('newline_test.txt', 'rb') as f:
    raw = f.read()
    print(f"\nNewline bytes: {raw!r}")

# Force universal newlines (\n, \r, \r\n all become \n on read)
with open('newline_test.txt', 'r', newline='') as f:
    content = f.read()
    print(f'Universal newlines: {content!r}')

# --- Encoding errors ---
# strict (default): raise UnicodeDecodeError
# ignore: skip bad bytes
# replace: replace with \ufffd (replacement character)
# backslashreplace: replace with \xNN escape

bad_bytes = b'\xff\xfeValid UTF-8: café'

for error_mode in ['strict', 'ignore', 'replace', 'backslashreplace']:
    try:
        decoded = bad_bytes.decode('utf-8', errors=error_mode)
        print(f"\n{error_mode}: {decoded!r}")
    except UnicodeDecodeError as e:
        print(f"\n{error_mode}: UnicodeDecodeError - {e}")

# Cleanup
import os
for fname in ['text_file.txt', 'binary_data.bin', 'newline_test.txt']:
    if os.path.exists(fname):
        os.unlink(fname)

print("\nText vs binary & encoding mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Reading Files: read(), readline(), readlines(), and Iteration"
    },
    {
      "type": "p",
      "text": "Python offers multiple ways to read file contents. read() loads the entire file into memory. readline() reads one line at a time. readlines() returns a list of all lines. But the most Pythonic approach is iteration — treating the file object as an iterator, which reads one line at a time with minimal memory usage. For large files, this is the difference between a program that runs and one that crashes."
    },
    {
      "type": "code-block",
      "label": "Reading Files Mastery",
      "code": "# === READING FILES ===

# Create test file
with open('sample.txt', 'w') as f:
    for i in range(1, 6):
        f.write(f'Line {i}: This is sample content for reading.\n')

# --- read() - entire file into memory ---
with open('sample.txt', 'r') as f:
    content = f.read()
    print(f'read(): {len(content)} chars, {content[:50]}...')

# --- read(size) - read up to size characters/bytes ---
with open('sample.txt', 'r') as f:
    chunk1 = f.read(20)
    chunk2 = f.read(20)
    print(f'\nread(20): {chunk1!r}')
    print(f'read(20): {chunk2!r}')

# --- readline() - one line at a time ---
with open('sample.txt', 'r') as f:
    line1 = f.readline()
    line2 = f.readline()
    print(f'\nreadline(): {line1.strip()}')
    print(f'readline(): {line2.strip()}')

# --- readlines() - all lines as list (includes \n) ---
with open('sample.txt', 'r') as f:
    lines = f.readlines()
    print(f'\nreadlines(): {len(lines)} lines')
    print(f'  First: {lines[0].strip()!r}')

# --- Iteration (most Pythonic, most memory efficient) ---
print(f'\nIteration (line by line):')
with open('sample.txt', 'r') as f:
    for i, line in enumerate(f, 1):
        print(f'  Line {i}: {line.strip()[:30]}...')

# --- Memory comparison for large files ---
import sys

# Create large test file
with open('large.txt', 'w') as f:
    for i in range(100000):
        f.write(f'This is line {i} with some content to make it reasonably long.\n')

# readlines() - loads all into memory
with open('large.txt', 'r') as f:
    lines = f.readlines()
    list_size = sys.getsizeof(lines)
    print(f'\nreadlines() memory: {list_size:,} bytes ({list_size/1024/1024:.1f} MB)')

# iteration - constant memory
with open('large.txt', 'r') as f:
    iter_size = sys.getsizeof(f)
    print(f'Iteration memory: {iter_size:,} bytes (constant)')

# --- Efficient line processing ---
print(f'\nProcessing large file efficiently:')
line_count = 0
char_count = 0
with open('large.txt', 'r') as f:
    for line in f:
        line_count += 1
        char_count += len(line)
        if line_count <= 3:
            print(f'  {line.strip()[:40]}...')

print(f'  ... Total: {line_count:,} lines, {char_count:,} chars')

# --- Stripping newlines ---
# rstrip('\n') removes newline, rstrip() removes all trailing whitespace
with open('sample.txt', 'r') as f:
    for line in f:
        clean = line.rstrip('\n')
        print(f'  {clean!r}')

# --- Using with Path (preview of pathlib) ---
from pathlib import Path
content = Path('sample.txt').read_text()
print(f'\nPath.read_text(): {len(content)} chars')

lines = Path('sample.txt').read_text().splitlines()
print(f'Path.read_text().splitlines(): {len(lines)} lines')

# Cleanup
import os
for fname in ['sample.txt', 'large.txt']:
    if os.path.exists(fname):
        os.unlink(fname)

print("\nReading files mastery complete!")"
    },
    {
      "type": "h2",
      "text": "File Pointers: seek() and tell()"
    },
    {
      "type": "p",
      "text": "Every open file maintains a current position pointer — the location where the next read or write will occur. tell() returns this position. seek() moves it. This enables random access to file contents, allowing you to read specific sections, overwrite portions, or build indexed file formats. Understanding file pointers is essential for binary file formats, database files, and log parsing."
    },
    {
      "type": "code-block",
      "label": "seek() and tell() Mastery",
      "code": "# === FILE POINTERS: seek() AND tell() ===

# Create test file
with open('pointer_test.txt', 'w') as f:
    f.write('ABCDEFGHIJ')  # 10 characters

# --- tell() - current position ---
with open('pointer_test.txt', 'r') as f:
    print(f'Initial position: {f.tell()}')
    f.read(3)
    print(f'After read(3): {f.tell()}')
    f.read(2)
    print(f'After read(2): {f.tell()}')

# --- seek(offset, whence) ---
# whence: 0 = beginning (default), 1 = current, 2 = end
# Text mode: only seek(0) or seek(offset, 0) allowed (except offset from 0)
# Binary mode: full random access

with open('pointer_test.txt', 'rb') as f:
    f.seek(5)  # Go to position 5
    print(f'\nseek(5): {f.read().decode()}')  # FGHIJ
    
    f.seek(0)  # Back to beginning
    print(f'seek(0): {f.read().decode()}')  # ABCDEFGHIJ
    
    f.seek(-3, 2)  # 3 bytes from end
    print(f'seek(-3, 2): {f.read().decode()}')  # HIJ
    
    f.seek(2, 1)  # 2 bytes from current (after reading HIJ, at 10)
    # Wait, we need to re-open or track position

# --- Practical: read header and body ---
with open('data_file.bin', 'wb') as f:
    f.write(b'HEADER----')  # 10 bytes header
    f.write(b'BODY CONTENT HERE')  # body

with open('data_file.bin', 'rb') as f:
    f.seek(0)
    header = f.read(10)
    print(f'\nHeader: {header}')
    
    body = f.read()
    print(f'Body: {body}')

# --- Overwriting specific positions ---
with open('pointer_test.txt', 'r+b') as f:  # read + binary (allows read and write)
    f.seek(3)
    f.write(b'XYZ')
    f.seek(0)
    print(f'\nAfter overwrite at 3: {f.read().decode()}')

# --- Building a simple index ---
records = [
    'Record 1: Alice, 25\n',
    'Record 2: Bob, 30\n',
    'Record 3: Charlie, 35\n'
]

with open('indexed.txt', 'w') as f:
    offsets = []
    for record in records:
        offsets.append(f.tell())
        f.write(record)

print(f'\nRecord offsets: {offsets}')

with open('indexed.txt', 'r') as f:
    f.seek(offsets[1])
    print(f'Record at offset {offsets[1]}: {f.readline().strip()}')

# --- seekable() check ---
with open('pointer_test.txt', 'r') as f:
    print(f'\nIs seekable: {f.seekable()}')
    print(f'Is readable: {f.readable()}')
    print(f'Is writable: {f.writable()}')

# Cleanup
import os
for fname in ['pointer_test.txt', 'data_file.bin', 'indexed.txt']:
    if os.path.exists(fname):
        os.unlink(fname)

print("\nseek() and tell() mastery complete!")"
    },
    {
      "type": "h2",
      "text": "pathlib: Object-Oriented Path Manipulation"
    },
    {
      "type": "p",
      "text": "The os.path module uses string manipulation for paths, which is error-prone and platform-dependent. pathlib replaces string paths with Path objects that understand filesystem semantics. A Path object knows how to join paths, resolve relative paths, check existence, and iterate directories. This is not just cleaner code — it is more correct code, because Path objects handle Windows backslashes, Unix forward slashes, and path normalization automatically."
    },
    {
      "type": "code-block",
      "label": "pathlib Mastery",
      "code": "# === pathlib: OBJECT-ORIENTED PATHS ===
from pathlib import Path
import os

# --- Creating paths ---
# Path() automatically uses correct separator for OS
p = Path('docs') / 'tutorial' / 'part22.txt'
print(f'Path construction: {p}')

# --- Absolute and relative ---
abs_path = Path('test.txt').resolve()
print(f'\nAbsolute: {abs_path}')
print(f'Parent: {abs_path.parent}')
print(f'Name: {abs_path.name}')
print(f'Stem: {abs_path.stem}')
print(f'Suffix: {abs_path.suffix}')
print(f'Parts: {abs_path.parts}')

# --- Path operations ---
base = Path('project')
print(f'\nPath operations:')
print(f'  exists: {base.exists()}')
print(f'  is_file: {base.is_file()}')
print(f'  is_dir: {base.is_dir()}')

# --- Creating directories ---
output_dir = Path('output') / 'logs'
output_dir.mkdir(parents=True, exist_ok=True)
print(f'\nCreated: {output_dir} (exists: {output_dir.exists()})')

# --- Writing and reading ---
config_file = output_dir / 'config.json'
config_file.write_text('{"debug": true}')
print(f'Wrote: {config_file.read_text()}')

# --- Iterating directories ---
# Create test structure
(Path('project') / 'src').mkdir(parents=True)
(Path('project') / 'tests').mkdir(parents=True)
(Path('project') / 'src' / 'main.py').write_text('print("hello")')
(Path('project') / 'src' / 'utils.py').write_text('def helper(): pass')
(Path('project') / 'tests' / 'test_main.py').write_text('def test(): pass')

project = Path('project')
print(f'\nDirectory listing ({project}):')
for item in project.iterdir():
    print(f'  {item.name}/' if item.is_dir() else f'  {item.name}')

# Recursive glob
print(f'\nAll .py files:')
for py_file in project.rglob('*.py'):
    print(f'  {py_file}')

# --- Path properties ---
py_file = Path('project/src/main.py')
print(f'\nProperties of {py_file}:')
print(f'  exists: {py_file.exists()}')
print(f'  size: {py_file.stat().st_size} bytes')
print(f'  modified: {py_file.stat().st_mtime}')

# --- Path comparison ---
print(f'\nPath comparison:')
print(f'  project/src == project/src: {Path("project/src") == Path("project/src")}')
print(f'  project/src == project\src: {Path("project/src") == Path("project/src")}')

# --- Path methods ---
old = Path('project/src/old_name.py')
old.write_text('old')
new = old.with_name('new_name.py')
old.rename(new)
print(f'\nRenamed: {old} -> {new} (exists: {new.exists()})')

# --- Home and cwd ---
print(f'\nHome: {Path.home()}')
print(f'CWD: {Path.cwd()}')

# --- os.path vs pathlib ---
# os.path.join('a', 'b') -> Path('a') / 'b'
# os.path.exists(p) -> Path(p).exists()
# os.path.abspath(p) -> Path(p).resolve()
# os.path.dirname(p) -> Path(p).parent
# os.path.basename(p) -> Path(p).name
# os.path.splitext(p) -> (Path(p).stem, Path(p).suffix)

print(f'\nos.path -> pathlib equivalents:')
print(f'  join: {os.path.join("a", "b")} -> {Path("a") / "b"}')

# Cleanup
import shutil
for d in ['output', 'project']:
    if Path(d).exists():
        shutil.rmtree(d)

print("\npathlib mastery complete!")"
    },
    {
      "type": "h2",
      "text": "JSON, CSV, and Pickle: Data Format Handling"
    },
    {
      "type": "p",
      "text": "Three formats dominate Python data persistence: JSON for human-readable structured data, CSV for tabular data exchange, and pickle for Python object serialization. Each has distinct use cases, limitations, and security implications. JSON is universal but limited to basic types. CSV is simple but fragile. Pickle is powerful but dangerous with untrusted sources. Mastering all three means choosing the right tool for every data persistence task."
    },
    {
      "type": "code-block",
      "label": "JSON, CSV, and Pickle Mastery",
      "code": "# === JSON, CSV, AND PICKLE ===

# --- JSON (JavaScript Object Notation) ---
import json

data = {
    'name': 'Alice',
    'age': 30,
    'skills': ['Python', 'Data Science'],
    'active': True,
    'salary': None,
}

# Writing JSON
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)

print('JSON written to data.json')

# Reading JSON
with open('data.json', 'r') as f:
    loaded = json.load(f)
print(f'\nJSON loaded: {loaded}')

# Pretty printing
print(f'\nPretty JSON:\n{json.dumps(data, indent=2, sort_keys=True)}')

# Custom encoder for non-JSON types
from datetime import datetime

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

with datetime_data := {'created': datetime.now()}:
    print(f'\nCustom encoder: {json.dumps(datetime_data, cls=DateTimeEncoder)}')

# --- CSV (Comma-Separated Values) ---
import csv

records = [
    ['name', 'age', 'city'],
    ['Alice', '30', 'NYC'],
    ['Bob', '25', 'LA'],
    ['Charlie', '35', 'Chicago'],
]

# Writing CSV
with open('data.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(records)

print(f'\nCSV written to data.csv')

# Reading CSV
with open('data.csv', 'r', newline='') as f:
    reader = csv.reader(f)
    for row in reader:
        print(f'  {row}')

# DictReader (access by column name)
print(f'\nDictReader:')
with open('data.csv', 'r', newline='') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f'  {row["name"]} is {row["age"]} from {row["city"]}')

# DictWriter
with open('output.csv', 'w', newline='') as f:
    fieldnames = ['product', 'price', 'quantity']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerow({'product': 'Widget', 'price': '9.99', 'quantity': '100'})

# --- Pickle (Python object serialization) ---
import pickle

complex_obj = {
    'function': lambda x: x * 2,  # Can't pickle lambdas!
    'data': [1, 2, 3],
}

# Pickle what we can
picklable = {'data': [1, 2, 3], 'nested': {'a': 'b'}}

with open('data.pkl', 'wb') as f:
    pickle.dump(picklable, f, protocol=pickle.HIGHEST_PROTOCOL)

with open('data.pkl', 'rb') as f:
    unpickled = pickle.load(f)

print(f'\nPickle round-trip: {unpickled}')
print(f'  Same object: {picklable == unpickled}')

# Security warning
print(f'\n⚠️  SECURITY WARNING: Never unpickle data from untrusted sources!')
print(f'  pickle can execute arbitrary code during deserialization.')

# --- Format comparison ---
formats = {
    'JSON': 'Human-readable, universal, limited types (str, int, float, bool, None, list, dict)',
    'CSV': 'Simple tabular, no nesting, widely supported',
    'Pickle': 'Python-only, arbitrary objects, fast, INSECURE with untrusted data',
}

print(f'\nFormat comparison:')
for fmt, desc in formats.items():
    print(f'  {fmt}: {desc}')

# Cleanup
import os
for fname in ['data.json', 'data.csv', 'output.csv', 'data.pkl']:
    if os.path.exists(fname):
        os.unlink(fname)

print("\nJSON, CSV, and Pickle mastery complete!")"
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build four programs that use file handling, context managers, pathlib, and data formats to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Config File Reader",
      "code": """"
Program 1: Config File Reader
Reads and validates configuration from JSON, INI, and environment variables.
Demonstrates JSON parsing, file existence checks, and default value handling.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class DatabaseConfig:
    host: str = 'localhost'
    port: int = 5432
    username: str = 'admin'
    password: Optional[str] = None
    database: str = 'app'

@dataclass
class AppConfig:
    debug: bool = False
    log_level: str = 'INFO'
    max_workers: int = 4
    database: DatabaseConfig = None

    def __post_init__(self):
        if self.database is None:
            self.database = DatabaseConfig()

class ConfigReader:
    """Read configuration from multiple sources."""

    @staticmethod
    def from_json(path: str) -> AppConfig:
        """Load config from JSON file."""
        config_path = Path(path)
        
        if not config_path.exists():
            print(f'Config not found at {path}, using defaults')
            return AppConfig()
        
        with open(config_path, 'r') as f:
            data = json.load(f)
        
        db_config = DatabaseConfig(**data.get('database', {}))
        return AppConfig(
            debug=data.get('debug', False),
            log_level=data.get('log_level', 'INFO'),
            max_workers=data.get('max_workers', 4),
            database=db_config
        )

    @staticmethod
    def from_env(prefix: str = 'APP_') -> AppConfig:
        """Load config from environment variables."""
        
        def env(key: str, default=None, cast=str):
            val = os.getenv(f'{prefix}{key}', default)
            return cast(val) if val is not None else default
        
        return AppConfig(
            debug=env('DEBUG', 'false').lower() == 'true',
            log_level=env('LOG_LEVEL', 'INFO'),
            max_workers=env('MAX_WORKERS', 4, int),
            database=DatabaseConfig(
                host=env('DB_HOST', 'localhost'),
                port=env('DB_PORT', 5432, int),
                username=env('DB_USER', 'admin'),
                password=env('DB_PASSWORD'),
            )
        )

    @staticmethod
    def validate(config: AppConfig) -> list:
        """Validate configuration and return list of errors."""
        errors = []
        
        if config.max_workers < 1 or config.max_workers > 100:
            errors.append('max_workers must be between 1 and 100')
        
        if config.log_level not in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']:
            errors.append(f'Invalid log_level: {config.log_level}')
        
        if not config.database.host:
            errors.append('database.host is required')
        
        if config.database.port < 1 or config.database.port > 65535:
            errors.append('database.port must be valid port number')
        
        return errors

def main():
    print('=' * 50)
    print('CONFIG FILE READER')
    print('=' * 50)

    # Create sample config
    sample_config = {
        'debug': True,
        'log_level': 'DEBUG',
        'max_workers': 8,
        'database': {
            'host': 'db.example.com',
            'port': 3306,
            'username': 'app_user',
            'password': 'secret123',
            'database': 'production'
        }
    }
    
    with open('app_config.json', 'w') as f:
        json.dump(sample_config, f, indent=2)

    # Load from JSON
    print(f'\nLoading from JSON:')
    config = ConfigReader.from_json('app_config.json')
    print(f'  Debug: {config.debug}')
    print(f'  Log Level: {config.log_level}')
    print(f'  Workers: {config.max_workers}')
    print(f'  DB Host: {config.database.host}')

    # Validate
    errors = ConfigReader.validate(config)
    print(f'\nValidation: {"PASS" if not errors else "FAIL"}')
    for error in errors:
        print(f'  Error: {error}')

    # Test with missing file (uses defaults)
    print(f'\nLoading from missing file:')
    default_config = ConfigReader.from_json('nonexistent.json')
    print(f'  Debug: {default_config.debug} (default)')
    print(f'  DB Host: {default_config.database.host} (default)')

    # Cleanup
    Path('app_config.json').unlink()

    print('=' * 50)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 2: CSV Analyzer",
      "code": """"
Program 2: CSV Analyzer
Analyzes CSV files: statistics, filtering, sorting, and export.
Demonstrates csv module, generators, and data processing.
"""

import csv
import statistics
from pathlib import Path
from typing import List, Dict, Iterator, Optional
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class SalesRecord:
    date: str
    product: str
    region: str
    units: int
    revenue: float

class CSVAnalyzer:
    """Analyze CSV data with generator-based processing."""

    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.records: List[SalesRecord] = []
    
    def load(self) -> 'CSVAnalyzer':
        """Load CSV data. Returns self for chaining."""
        with open(self.file_path, 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.records.append(SalesRecord(
                    date=row['date'],
                    product=row['product'],
                    region=row['region'],
                    units=int(row['units']),
                    revenue=float(row['revenue'])
                ))
        return self
    
    def total_revenue(self) -> float:
        return sum(r.revenue for r in self.records)
    
    def average_units(self) -> float:
        return statistics.mean(r.units for r in self.records) if self.records else 0
    
    def by_region(self) -> Dict[str, List[SalesRecord]]:
        groups = defaultdict(list)
        for r in self.records:
            groups[r.region].append(r)
        return dict(groups)
    
    def top_products(self, n: int = 5) -> List[tuple]:
        product_revenue = defaultdict(float)
        for r in self.records:
            product_revenue[r.product] += r.revenue
        return sorted(product_revenue.items(), key=lambda x: x[1], reverse=True)[:n]
    
    def filter_by_region(self, region: str) -> Iterator[SalesRecord]:
        """Generator: filter records by region."""
        for r in self.records:
            if r.region == region:
                yield r
    
    def export_summary(self, output_path: str):
        """Export summary statistics to CSV."""
        region_stats = self.by_region()
        
        with open(output_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['region', 'total_records', 'total_revenue', 'avg_units'])
            
            for region, records in region_stats.items():
                writer.writerow([
                    region,
                    len(records),
                    sum(r.revenue for r in records),
                    round(statistics.mean(r.units for r in records), 2)
                ])

def main():
    print('=' * 50)
    print('CSV ANALYZER')
    print('=' * 50)

    # Create sample CSV
    sample_data = [
        ['date', 'product', 'region', 'units', 'revenue'],
        ['2024-01-15', 'Widget', 'North', '100', '1500.00'],
        ['2024-01-16', 'Gadget', 'South', '50', '1200.00'],
        ['2024-01-17', 'Widget', 'East', '200', '3000.00'],
        ['2024-01-18', 'Tool', 'North', '75', '900.00'],
        ['2024-01-19', 'Gadget', 'West', '120', '2400.00'],
        ['2024-01-20', 'Widget', 'South', '80', '1200.00'],
        ['2024-01-21', 'Tool', 'East', '150', '1800.00'],
        ['2024-01-22', 'Gadget', 'North', '90', '1800.00'],
    ]
    
    with open('sales.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(sample_data)

    # Analyze
    analyzer = CSVAnalyzer('sales.csv').load()
    
    print(f'\nTotal Records: {len(analyzer.records)}')
    print(f'Total Revenue: ${analyzer.total_revenue():,.2f}')
    print(f'Average Units: {analyzer.average_units():.1f}')
    
    print(f'\nRevenue by Region:')
    for region, records in analyzer.by_region().items():
        revenue = sum(r.revenue for r in records)
        print(f'  {region}: ${revenue:,.2f} ({len(records)} records)')
    
    print(f'\nTop Products:')
    for product, revenue in analyzer.top_products(3):
        print(f'  {product}: ${revenue:,.2f}')
    
    print(f'\nNorth Region Records:')
    for r in analyzer.filter_by_region('North'):
        print(f'  {r.date}: {r.product} - ${r.revenue:.2f}')
    
    # Export summary
    analyzer.export_summary('sales_summary.csv')
    print(f'\nSummary exported to sales_summary.csv')
    
    with open('sales_summary.csv', 'r') as f:
        print(f'\nSummary content:\n{f.read()}')

    # Cleanup
    for f in ['sales.csv', 'sales_summary.csv']:
        Path(f).unlink()

    print('=' * 50)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 3: JSON Pretty-Printer",
      "code": """"
Program 3: JSON Pretty-Printer
Validates, formats, and compares JSON files.
Demonstrates json module, recursive traversal, and file operations.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Union
from collections import OrderedDict

class JSONPrettyPrinter:
    """Advanced JSON formatting and analysis tool."""

    @staticmethod
    def format_json(data: Union[dict, list], indent: int = 2, 
                    sort_keys: bool = False) -> str:
        """Format JSON with customizable indentation."""
        return json.dumps(data, indent=indent, sort_keys=sort_keys, 
                         ensure_ascii=False)
    
    @staticmethod
    def validate_file(path: str) -> tuple:
        """Validate JSON file. Returns (is_valid, error_message)."""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                json.load(f)
            return True, None
        except json.JSONDecodeError as e:
            return False, f'Line {e.lineno}, Column {e.colno}: {e.msg}'
        except FileNotFoundError:
            return False, 'File not found'
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def analyze_structure(data: Any, path: str = '') -> Dict:
        """Recursively analyze JSON structure."""
        stats = {
            'total_keys': 0,
            'max_depth': 0,
            'types': {},
            'arrays': 0,
            'objects': 0,
            'nulls': 0
        }
        
        def traverse(obj, depth=0):
            nonlocal stats
            stats['max_depth'] = max(stats['max_depth'], depth)
            
            obj_type = type(obj).__name__
            stats['types'][obj_type] = stats['types'].get(obj_type, 0) + 1
            
            if obj is None:
                stats['nulls'] += 1
            elif isinstance(obj, dict):
                stats['objects'] += 1
                stats['total_keys'] += len(obj)
                for k, v in obj.items():
                    traverse(v, depth + 1)
            elif isinstance(obj, list):
                stats['arrays'] += 1
                for item in obj:
                    traverse(item, depth + 1)
        
        traverse(data)
        return stats
    
    @staticmethod
    def compare_files(path1: str, path2: str) -> Dict:
        """Compare two JSON files and show differences."""
        with open(path1, 'r') as f1, open(path2, 'r') as f2:
            data1 = json.load(f1)
            data2 = json.load(f2)
        
        return JSONPrettyPrinter._diff(data1, data2)
    
    @staticmethod
    def _diff(d1: Any, d2: Any, path: str = '') -> Dict:
        """Recursive diff between two JSON structures."""
        differences = {'added': [], 'removed': [], 'modified': [], 'same': []}
        
        if type(d1) != type(d2):
            differences['modified'].append(f'{path}: type changed ({type(d1).__name__} -> {type(d2).__name__})')
            return differences
        
        if isinstance(d1, dict):
            all_keys = set(d1.keys()) | set(d2.keys())
            for key in all_keys:
                new_path = f'{path}.{key}' if path else key
                if key not in d1:
                    differences['added'].append(f'{new_path}: {d2[key]}')
                elif key not in d2:
                    differences['removed'].append(f'{new_path}: {d1[key]}')
                else:
                    sub_diff = JSONPrettyPrinter._diff(d1[key], d2[key], new_path)
                    for k in differences:
                        differences[k].extend(sub_diff[k])
        elif isinstance(d1, list):
            if len(d1) != len(d2):
                differences['modified'].append(f'{path}: list length changed ({len(d1)} -> {len(d2)})')
            for i, (a, b) in enumerate(zip(d1, d2)):
                new_path = f'{path}[{i}]'
                sub_diff = JSONPrettyPrinter._diff(a, b, new_path)
                for k in differences:
                    differences[k].extend(sub_diff[k])
        else:
            if d1 != d2:
                differences['modified'].append(f'{path}: {d1!r} -> {d2!r}')
            else:
                differences['same'].append(path)
        
        return differences

def main():
    print('=' * 50)
    print('JSON PRETTY-PRINTER')
    print('=' * 50)

    # Create sample JSON files
    sample1 = {
        'app': 'MyApp',
        'version': '1.0.0',
        'settings': {
            'debug': True,
            'theme': 'dark',
            'features': ['auth', 'api', 'logging']
        },
        'users': None
    }
    
    sample2 = {
        'app': 'MyApp',
        'version': '1.1.0',
        'settings': {
            'debug': False,
            'theme': 'dark',
            'features': ['auth', 'api', 'logging', 'new_feature']
        },
        'database': 'postgresql'
    }
    
    with open('config1.json', 'w') as f:
        json.dump(sample1, f)
    
    with open('config2.json', 'w') as f:
        json.dump(sample2, f)

    # Format and display
    print(f'\nFormatted JSON (config1):')
    print(JSONPrettyPrinter.format_json(sample1, indent=2))
    
    # Validate
    print(f'\nValidation:')
    for fname in ['config1.json', 'config2.json']:
        valid, error = JSONPrettyPrinter.validate_file(fname)
        print(f'  {fname}: {"VALID" if valid else f"INVALID - {error}"}')
    
    # Analyze structure
    print(f'\nStructure Analysis (config1):')
    stats = JSONPrettyPrinter.analyze_structure(sample1)
    for key, value in stats.items():
        print(f'  {key}: {value}')
    
    # Compare
    print(f'\nComparison (config1 vs config2):')
    diff = JSONPrettyPrinter.compare_files('config1.json', 'config2.json')
    for category, items in diff.items():
        if items and category != 'same':
            print(f'  {category.upper()}:')
            for item in items[:5]:
                print(f'    {item}')
            if len(items) > 5:
                print(f'    ... and {len(items) - 5} more')

    # Cleanup
    for f in ['config1.json', 'config2.json']:
        Path(f).unlink()

    print('=' * 50)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "code-block",
      "label": "Program 4: Log File Parser",
      "code": """"
Program 4: Log File Parser
Parses, filters, and analyzes log files.
Demonstrates line iteration, regex, generators, and file statistics.
"""

import re
import statistics
from pathlib import Path
from datetime import datetime
from typing import Iterator, List, Dict, Optional
from collections import Counter, defaultdict
from dataclasses import dataclass

@dataclass
class LogEntry:
    timestamp: datetime
    level: str
    module: str
    message: str
    line_num: int

class LogParser:
    """Parse and analyze log files."""
    
    LOG_PATTERN = re.compile(
        r'(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+'
        r'(?P<level>\w+)\s+'
        r'\[(?P<module>[^\]]+)\]\s+'
        r'(?P<message>.+)'
    )
    
    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
    
    def parse(self) -> Iterator[LogEntry]:
        """Generator: parse log file line by line."""
        with open(self.file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                
                match = self.LOG_PATTERN.match(line)
                if match:
                    yield LogEntry(
                        timestamp=datetime.strptime(
                            match['timestamp'], '%Y-%m-%d %H:%M:%S'
                        ),
                        level=match['level'],
                        module=match['module'],
                        message=match['message'],
                        line_num=line_num
                    )
                else:
                    yield LogEntry(
                        timestamp=None,
                        level='PARSE_ERROR',
                        module='unknown',
                        message=line,
                        line_num=line_num
                    )
    
    def filter_by_level(self, level: str) -> Iterator[LogEntry]:
        """Generator: filter by log level."""
        for entry in self.parse():
            if entry.level == level:
                yield entry
    
    def filter_by_module(self, module: str) -> Iterator[LogEntry]:
        """Generator: filter by module name."""
        for entry in self.parse():
            if entry.module == module:
                yield entry
    
    def time_range(self, start: datetime, end: datetime) -> Iterator[LogEntry]:
        """Generator: filter by time range."""
        for entry in self.parse():
            if entry.timestamp and start <= entry.timestamp <= end:
                yield entry
    
    def statistics(self) -> Dict:
        """Compute log statistics."""
        entries = list(self.parse())
        
        if not entries:
            return {}
        
        levels = Counter(e.level for e in entries)
        modules = Counter(e.module for e in entries if e.module != 'unknown')
        
        timestamps = [e.timestamp for e in entries if e.timestamp]
        
        return {
            'total_lines': len(entries),
            'parse_errors': levels.get('PARSE_ERROR', 0),
            'level_distribution': dict(levels),
            'top_modules': dict(modules.most_common(5)),
            'time_span': {
                'start': min(timestamps).isoformat() if timestamps else None,
                'end': max(timestamps).isoformat() if timestamps else None,
            } if timestamps else None
        }
    
    def export_filtered(self, output_path: str, 
                       level: Optional[str] = None,
                       module: Optional[str] = None):
        """Export filtered log entries to new file."""
        with open(output_path, 'w') as f:
            for entry in self.parse():
                if level and entry.level != level:
                    continue
                if module and entry.module != module:
                    continue
                ts = entry.timestamp.strftime('%Y-%m-%d %H:%M:%S') if entry.timestamp else 'INVALID'
                f.write(f'{ts} {entry.level} [{entry.module}] {entry.message}\n')

def main():
    print('=' * 50)
    print('LOG FILE PARSER')
    print('=' * 50)

    # Create sample log file
    log_lines = [
        '2024-01-15 09:23:45 INFO [auth] User login successful: alice',
        '2024-01-15 09:24:12 ERROR [database] Connection timeout after 30s',
        '2024-01-15 09:24:15 WARNING [auth] Multiple failed attempts from 192.168.1.1',
        '2024-01-15 09:25:00 INFO [api] GET /users/123 - 200 OK',
        '2024-01-15 09:25:30 DEBUG [cache] Cache miss for key: user_profile_123',
        '2024-01-15 09:26:00 ERROR [api] POST /orders - 500 Internal Server Error',
        '2024-01-15 09:26:45 INFO [auth] User logout: alice',
        '2024-01-15 09:27:00 INFO [api] GET /products - 200 OK',
        '2024-01-15 09:27:30 WARNING [database] Slow query detected: 2.5s',
        '2024-01-15 09:28:00 ERROR [api] Rate limit exceeded for client 10.0.0.5',
        'Invalid log line without proper format',
        '2024-01-15 09:30:00 INFO [scheduler] Daily cleanup completed',
    ]
    
    with open('app.log', 'w') as f:
        for line in log_lines:
            f.write(line + '\n')

    parser = LogParser('app.log')
    
    # Parse all entries
    print(f'\nAll entries:')
    for entry in parser.parse():
        ts = entry.timestamp.strftime('%H:%M:%S') if entry.timestamp else 'INVALID'
        print(f'  [{ts}] {entry.level:12} [{entry.module:12}] {entry.message[:40]}')
    
    # Filter by level
    print(f'\nERROR entries:')
    for entry in parser.filter_by_level('ERROR'):
        print(f'  Line {entry.line_num}: {entry.message}')
    
    # Statistics
    print(f'\nLog Statistics:')
    stats = parser.statistics()
    for key, value in stats.items():
        print(f'  {key}: {value}')
    
    # Export filtered
    parser.export_filtered('errors_only.log', level='ERROR')
    print(f'\nExported ERROR entries to errors_only.log')
    
    with open('errors_only.log', 'r') as f:
        print(f'Content:\n{f.read()}')

    # Cleanup
    for f in ['app.log', 'errors_only.log']:
        Path(f).unlink()

    print('=' * 50)

if __name__ == '__main__':
    main()"
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 23. 4/5 correct means you have mastered file handling."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: What is the difference between 'r', 'w', 'a', and 'x' file modes? Write a context manager that opens a file, writes data, and guarantees the file is closed even if an exception occurs. Explain why with open(...) as f: is safer than f = open(...); f.close().",
        "Q2: Explain the difference between text mode and binary mode. Write code that reads a UTF-8 encoded file, then reads the same file in binary mode. Show the difference in the returned data types. What happens if you try to decode binary data with the wrong encoding?",
        "Q3: What do seek() and tell() do? Write a program that writes a header and body to a binary file, then uses seek() to read only the header without loading the body into memory. Explain whence values 0, 1, and 2.",
        "Q4: Write a pathlib-based program that creates a directory structure (project/src, project/tests), writes a Python file to project/src, and lists all .py files recursively. Compare this to the equivalent os.path code.",
        "Q5: Compare JSON, CSV, and pickle for data serialization. Write code that saves a dictionary to all three formats and loads it back. Which format preserves Python-specific types (sets, tuples, custom objects)? Which is safe for untrusted data?"
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: 'r' = read (file must exist), 'w' = write (truncate existing), 'a' = append (create if not exists), 'x' = exclusive create (fail if exists). Context manager: class SafeFile: def __init__(self, path, mode): self.path = path; self.mode = mode; def __enter__(self): self.f = open(self.path, self.mode); return self.f; def __exit__(self, *args): self.f.close(); return False. with SafeFile('test.txt', 'w') as f: f.write('data'). The with statement is safer because f.close() is called in __exit__, which executes even if an exception occurs in the block. Manual close() might be skipped if an exception happens before it. A2: Text mode (default, 't') reads/writes str objects, automatically encoding/decoding with specified encoding (UTF-8 default). Binary mode ('b') reads/writes bytes objects, preserving exact file contents without encoding translation. with open('file.txt', 'r') as f: text = f.read() -> str. with open('file.txt', 'rb') as f: binary = f.read() -> bytes. Decoding with wrong encoding raises UnicodeDecodeError or produces mojibake (garbled text). A3: tell() returns the current file position (byte offset). seek(offset, whence) moves the file pointer. whence=0 (default): offset from beginning. whence=1: offset from current position. whence=2: offset from end (negative values). Binary file: with open('data.bin', 'w+b') as f: f.write(b'HEADER'); f.write(b'BODY'); f.seek(0); header = f.read(6). Text mode restricts seek() to beginning or positions returned by tell(). A4: from pathlib import Path; base = Path('project'); (base / 'src').mkdir(parents=True); (base / 'tests').mkdir(parents=True); (base / 'src' / 'main.py').write_text('print(1)'); list(base.rglob('*.py')). os.path equivalent: import os; os.makedirs('project/src'); os.makedirs('project/tests'); with open('project/src/main.py', 'w') as f: f.write('print(1)'); [os.path.join(root, f) for root, dirs, files in os.walk('project') for f in files if f.endswith('.py')]. pathlib is cleaner, cross-platform, and object-oriented. A5: JSON: universal, human-readable, limited to str/int/float/bool/None/list/dict. JSON dumps/loads round-trip dicts and lists. CSV: tabular, flat, no nesting. pickle: Python-only, preserves arbitrary objects (sets, tuples, custom objects with __getstate__), fast, binary. JSON and CSV are safe for untrusted data. pickle is NOT safe — it can execute arbitrary code during deserialization. Never unpickle untrusted data."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered file handling. You use open() with context managers (with) to guarantee resource cleanup, preventing file descriptor leaks and data corruption. You understand text vs binary modes, specify encoding explicitly (UTF-8), and handle encoding errors gracefully. You read files efficiently using iteration (line-by-line) instead of loading entire files into memory. You control file pointers with seek() and tell(), enabling random access and indexed file formats. You replace brittle string-path manipulation with pathlib's object-oriented Path objects, writing cross-platform code that handles Windows and Unix paths automatically. You handle JSON for structured data, CSV for tabular data, and pickle for Python object serialization — choosing the right format for each task and understanding pickle's security implications. You have built four complete programs: a config file reader that loads and validates JSON configuration with defaults, a CSV analyzer that computes statistics and exports summaries using generator-based processing, a JSON pretty-printer that validates, formats, and compares JSON files recursively, and a log file parser that uses regex and generators to filter and analyze log entries. File handling is no longer a chore. It is a craft."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Context managers guarantee cleanup. Text mode handles encoding; binary mode preserves bytes. Iteration is memory-efficient for large files. seek() and tell() enable random access. pathlib replaces os.path with object-oriented paths. JSON is universal, CSV is tabular, pickle is powerful but dangerous. Master these six truths, and you have mastered file handling. In Part 23, we will explore Exception Handling — the defensive programming techniques that make your code robust against the unexpected."
    },
    {
      "type": "cta",
      "text": "Start Part 23: Exception Handling →",
      "href": "/tutorials/python-unlocked/part-23-exception-handling",
      "note": "26 min read · try-except-else-finally · Custom exceptions · Exception hierarchy · EAFP vs LBYL"
    }
  ]
};

export default post;