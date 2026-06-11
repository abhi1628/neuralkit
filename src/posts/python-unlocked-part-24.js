const post = {
  "slug": "part-24-modules-packages",
  "seriesSlug": "python-unlocked",
  "partNumber": 24,
  "totalParts": 30,
  "title": "Modules & Packages — Organizing Code at Scale (Part 24)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "July 26, 2026",
  "readTime": "28 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "import mechanics: sys.path, the module search algorithm. __init__.py, relative vs absolute imports. if __name__ == '__main__' revisited. Building installable packages with pyproject.toml. Virtual environments and dependency management. Project: your own utility package with CLI entry point and installable wheel.",
  "coverEmoji": "📦",
  "tags": [
    "Python", "Modules", "Packages", "import", "pyproject.toml",
    "Virtual Environments", "pip", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1972, Parnas published 'On the Criteria to Be Used in Decomposing Systems into Modules' — arguably the most important paper in software engineering. His insight: the right way to decompose a system is to hide design decisions inside modules, so changes to one module cannot ripple into others. Fifty-four years later, Python's module system is the purest expression of that principle in mainstream programming. Every .py file is a module. Every directory with an __init__.py is a package. Every import statement is a contract that says: I need this capability, I do not care how it is implemented. But most developers treat imports as magic. They copy import statements without understanding why they work. They create circular imports, pollute namespaces, and wonder why their package installs on their machine but breaks on everyone else's. In this part, we will demystify the entire module system from first principles. You will understand exactly how Python finds modules, what sys.path controls, and how __init__.py transforms a directory into a package. You will master the difference between relative and absolute imports and know when to use each. You will build a complete, installable Python package with a CLI entry point, publish it as a wheel, and manage dependencies professionally. By the end, your code will not just run. It will be distributable."
    },
    {
      "type": "h2",
      "text": "The import System: How Python Finds Your Code"
    },
    {
      "type": "p",
      "text": "When you write 'import json', Python does not guess where json lives. It follows a precise algorithm: check sys.modules cache first, then search sys.path in order. Understanding this algorithm explains every ImportError you have ever seen."
    },
    {
      "type": "code-block",
      "label": "import Mechanics — sys.path and Module Search",
      "code": `# === HOW PYTHON FINDS MODULES ===

import sys

# Step 1: Check sys.modules cache (already imported modules)
# Step 2: Search sys.path in order

print("Python module search path:")
for i, path in enumerate(sys.path):
    print(f"  [{i}] {path}")

# sys.path typically contains:
# [0] '' or script directory (current directory)
# [1] PYTHONPATH environment variable entries
# [2+] Standard library directories
# [n] site-packages (where pip installs packages)

# --- Inspect sys.modules ---
print(f"\\nModules already loaded: {len(sys.modules)}")
print(f"'json' cached: {'json' in sys.modules}")

import json  # First import: searches sys.path, executes module, caches in sys.modules
print(f"'json' cached after import: {'json' in sys.modules}")

import json  # Second import: returns cached version instantly (no re-execution!)
print(f"json module location: {json.__file__}")
print(f"json module spec: {json.__spec__}")

# --- Force reload (when you need fresh execution) ---
import importlib
importlib.reload(json)  # Re-executes module code, updates sys.modules

# --- Dynamic imports (when module name is a string) ---
module_name = "os.path"
path_module = importlib.import_module(module_name)
print(f"\\nDynamically imported: {path_module}")
print(f"join function: {path_module.join('/home', 'user')}")

# --- Inspect module attributes ---
import os
print(f"\\nos module attributes: {[a for a in dir(os) if not a.startswith('_')][:10]}")
print(f"os.__name__: {os.__name__}")
print(f"os.__package__: {os.__package__}")
print(f"os.__loader__: {type(os.__loader__).__name__}")

# --- Manipulate sys.path at runtime ---
# Add a directory to the search path
import sys
sys.path.insert(0, '/path/to/my/modules')  # Search this FIRST

# Remove from path (rarely needed, but possible)
# sys.path.remove('/path/to/remove')

# --- PYTHONPATH environment variable ---
# export PYTHONPATH=/my/modules:$PYTHONPATH
# Python adds these to sys.path automatically at startup
# Useful for development without installing packages

print("\\nimport mechanics complete!")`
    },
    {
      "type": "h2",
      "text": "__init__.py: Turning Directories into Packages"
    },
    {
      "type": "p",
      "text": "A directory becomes a Python package the moment it contains __init__.py. This file is executed when the package is first imported. It controls what gets exported, how submodules are organized, and what the package looks like to consumers. Understanding __init__.py is understanding Python packaging."
    },
    {
      "type": "code-block",
      "label": "__init__.py Mastery",
      "code": `# === PACKAGE STRUCTURE ===
#
# mypackage/
#   __init__.py          <- Makes it a package, controls public API
#   core.py              <- Core functionality
#   utils.py             <- Utility functions
#   validators.py        <- Validation logic
#   subpackage/
#     __init__.py        <- Subpackage
#     helpers.py         <- Subpackage module

# === mypackage/__init__.py ===
# This is what consumers see when they 'import mypackage'

# Option 1: Minimal __init__.py (namespace-only, lazy)
# (empty file or just a docstring)

# Option 2: Explicit public API (recommended)
"""
mypackage: A demonstration package.

Public API:
    process_data(data) - Process a list of items
    validate_input(x) - Validate an input value
    MyProcessor - Main processor class
"""

# Re-export what you want public
from mypackage.core import MyProcessor, process_data
from mypackage.validators import validate_input
from mypackage.utils import format_output

# Define the public API explicitly
__all__ = ['MyProcessor', 'process_data', 'validate_input', 'format_output']

# Package metadata
__version__ = '1.0.0'
__author__ = 'Your Name'

# === ABSOLUTE vs RELATIVE IMPORTS ===

# --- Absolute imports (recommended for applications) ---
# Always specify the full path from the top-level package
from mypackage.core import MyProcessor       # Absolute
from mypackage.subpackage.helpers import help_fn  # Absolute

# --- Relative imports (for package internals) ---
# Use . for current package, .. for parent package
from .core import MyProcessor               # Relative (same package)
from .utils import format_output            # Relative (same package)
from ..validators import validate_input     # Relative (parent package)
from .subpackage.helpers import help_fn    # Relative (subpackage)

# When to use relative imports:
# INSIDE a package, for internal cross-module references
# When you want the package to be relocatable (rename the package, imports still work)

# When to use absolute imports:
# In application code (not library code)
# When clarity matters more than relocatability
# In __main__.py and scripts

# === CONTROLLING IMPORTS WITH __all__ ===

# In utils.py:
def public_function():
    """This IS part of the public API."""
    return "public"

def _private_function():
    """This is NOT part of the public API (convention)."""
    return "private"

def __implementation_detail():
    """This is NAME-MANGLED by convention."""
    return "internal"

# If __all__ is defined, 'from module import *' only imports these:
__all__ = ['public_function']

# Without __all__, 'from module import *' imports everything NOT starting with _

# === NAMESPACE PACKAGES (Python 3.3+) ===
# Packages WITHOUT __init__.py — useful for distributed packages

# myorg/                  <- namespace package (no __init__.py)
#   namespace/            <- namespace package (no __init__.py)
#     component_a/        <- regular package (has __init__.py)
#       __init__.py
#     component_b/        <- regular package (has __init__.py)
#       __init__.py

# Allows splitting a logical package across multiple directories or distributions
# pip install myorg-component-a  AND  pip install myorg-component-b
# Both install under myorg.namespace.*

print("Package structure concepts complete!")`
    },
    {
      "type": "h2",
      "text": "if __name__ == '__main__': The Module-Script Duality"
    },
    {
      "type": "p",
      "text": "Every Python file has a dual identity: it can be both a module (imported by others) and a script (run directly). The __name__ variable reveals which role it is playing. When imported, __name__ is the module name. When run directly, __name__ is '__main__'. This simple mechanism is how Python achieves the module-script duality that makes every file independently testable."
    },
    {
      "type": "code-block",
      "label": "__name__ == '__main__' — Deep Dive",
      "code": `# === THE MODULE-SCRIPT DUALITY ===

# When Python executes a file:
# - As a script (python myfile.py): __name__ = '__main__'
# - As a module (import myfile): __name__ = 'myfile'

# This allows one file to behave differently in each context

# --- mymath.py ---
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

def demo():
    print(f"add(3, 4) = {add(3, 4)}")
    print(f"multiply(3, 4) = {multiply(3, 4)}")

# This code only runs when the script is executed directly
# NOT when imported as a module
if __name__ == '__main__':
    print("Running mymath.py as a script:")
    demo()
    # Tests, demos, CLI entry points go here

# --- Why this matters ---
# import mymath       <- demo() does NOT run
# python mymath.py    <- demo() DOES run

# === __main__.py: Making Packages Executable ===
#
# mypackage/
#   __init__.py
#   __main__.py    <- This runs when: python -m mypackage
#   core.py

# __main__.py content:
"""
This runs when the package is executed as a module.
python -m mypackage
"""
import sys
from mypackage.core import main_function

if __name__ == '__main__':
    result = main_function(sys.argv[1:])
    sys.exit(0 if result else 1)

# === CHECKING MODULE CONTEXT ===
import sys

def get_context():
    """Understand the execution context."""
    contexts = {
        '__main__': 'Running as script',
        None: 'Running as frozen executable',
    }
    return contexts.get(__name__, f'Imported as module: {__name__}')

# Check if we're the top-level script
if __name__ == '__main__':
    print(f"Context: {get_context()}")
    print(f"Script path: {sys.argv[0]}")
    print(f"Arguments: {sys.argv[1:]}")
    print(f"Module name: {__name__}")
else:
    # Module-level initialization (runs on import)
    print(f"Module '{__name__}' imported")

# === PRACTICAL PATTERN: COMBINED LIBRARY + CLI ===
# Many great Python tools (pytest, black, pip) are both
# importable libraries AND CLI tools.

# The pattern:
# 1. All functionality in importable functions/classes
# 2. if __name__ == '__main__': parses CLI args, calls functions
# 3. Entry point in pyproject.toml points to the main function

print("Module-script duality mastered!")`
    },
    {
      "type": "h2",
      "text": "Building an Installable Package: pyproject.toml"
    },
    {
      "type": "p",
      "text": "The era of setup.py is over. Python 3.12 standardizes on pyproject.toml — a single file that declares everything: build system, metadata, dependencies, CLI entry points, and tool configuration. Understanding pyproject.toml means understanding modern Python packaging."
    },
    {
      "type": "code-block",
      "label": "pyproject.toml — Complete Modern Package Setup",
      "code": `# === MODERN PYTHON PACKAGING WITH pyproject.toml ===
#
# Full project structure:
# myutil/
#   src/
#     myutil/
#       __init__.py
#       core.py
#       cli.py
#   tests/
#     test_core.py
#   pyproject.toml
#   README.md
#   LICENSE

# === pyproject.toml ===
# [build-system]
# requires = ["hatchling"]          # or "setuptools>=61", "flit-core", "poetry-core"
# build-backend = "hatchling.build"
#
# [project]
# name = "myutil"
# version = "1.0.0"
# description = "A demonstration utility package"
# readme = "README.md"
# license = {file = "LICENSE"}
# authors = [{name = "Your Name", email = "you@example.com"}]
# requires-python = ">=3.12"
# keywords = ["utility", "demo"]
# classifiers = [
#     "Development Status :: 3 - Alpha",
#     "Programming Language :: Python :: 3",
#     "Programming Language :: Python :: 3.12",
#     "License :: OSI Approved :: MIT License",
# ]
# dependencies = [
#     "requests>=2.28",
#     "click>=8.0",
# ]
#
# [project.optional-dependencies]
# dev = ["pytest>=7.0", "black", "mypy"]
# docs = ["sphinx", "sphinx-rtd-theme"]
#
# [project.scripts]
# myutil = "myutil.cli:main"        # CLI entry point: 'myutil' command -> cli.main()
#
# [project.urls]
# Homepage = "https://github.com/you/myutil"
# Documentation = "https://myutil.readthedocs.io"
#
# [tool.black]
# line-length = 88
# target-version = ["py312"]
#
# [tool.mypy]
# python_version = "3.12"
# strict = true
#
# [tool.pytest.ini_options]
# testpaths = ["tests"]

# === src/myutil/__init__.py ===
"""
myutil: A demonstration utility package.
"""
from myutil.core import process, validate
__version__ = '1.0.0'
__all__ = ['process', 'validate']

# === src/myutil/core.py ===
from typing import Any

def process(data: list[Any]) -> list[Any]:
    """Process a list of items."""
    return [item for item in data if item is not None]

def validate(value: Any) -> bool:
    """Validate a value."""
    return value is not None and value != ''

# === src/myutil/cli.py ===
import sys
import json
from myutil.core import process, validate

def main() -> int:
    """CLI entry point for myutil."""
    if len(sys.argv) < 2:
        print("Usage: myutil <json-data>", file=sys.stderr)
        return 1
    
    try:
        data = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON: {e}", file=sys.stderr)
        return 1
    
    result = process(data)
    print(json.dumps(result, indent=2))
    return 0

if __name__ == '__main__':
    sys.exit(main())

# === BUILDING AND INSTALLING ===
# Build the wheel and source distribution:
# python -m build
# Creates: dist/myutil-1.0.0-py3-none-any.whl
#          dist/myutil-1.0.0.tar.gz

# Install locally (editable mode for development):
# pip install -e .

# Install from wheel:
# pip install dist/myutil-1.0.0-py3-none-any.whl

# Install from PyPI (after publishing):
# pip install myutil

# Publish to PyPI:
# python -m twine upload dist/*

print("Package structure defined!")`
    },
    {
      "type": "h2",
      "text": "Virtual Environments: Isolation is Not Optional"
    },
    {
      "type": "p",
      "text": "Dependency conflicts are the #1 cause of 'works on my machine' bugs. Virtual environments solve this by giving each project its own isolated Python with its own packages. This is not optional for professional Python development — it is the foundation of reproducible environments."
    },
    {
      "type": "code-block",
      "label": "Virtual Environments — Complete Workflow",
      "code": `# === VIRTUAL ENVIRONMENT MASTERY ===

import subprocess
import sys
import os
from pathlib import Path

# --- Create a virtual environment ---
# python -m venv myenv
# python3.12 -m venv myenv --upgrade-deps  # Also upgrade pip/setuptools

# --- Activate ---
# macOS/Linux: source myenv/bin/activate
# Windows: myenv\\Scripts\\activate
# Fish: source myenv/bin/activate.fish

# --- Verify activation ---
def check_venv():
    """Check if running inside a virtual environment."""
    in_venv = (
        hasattr(sys, 'real_prefix') or  # virtualenv
        (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)  # venv
    )
    
    if in_venv:
        print(f"Virtual environment active!")
        print(f"  Python: {sys.executable}")
        print(f"  Prefix: {sys.prefix}")
        venv_name = Path(sys.prefix).name
        print(f"  Env name: {venv_name}")
    else:
        print("WARNING: Not in a virtual environment!")
        print("  Create one: python -m venv venv")
        print("  Activate:   source venv/bin/activate")
    
    return in_venv

check_venv()

# --- Dependency management ---
# requirements.txt (traditional):
# requests==2.31.0
# click>=8.0,<9.0
# python-dotenv~=1.0

# Generate from current environment:
# pip freeze > requirements.txt

# Install from requirements.txt:
# pip install -r requirements.txt

# --- Modern: pyproject.toml + pip-tools or poetry ---
# pip-tools workflow:
# 1. Define abstract deps in pyproject.toml (no versions)
# 2. pip-compile pyproject.toml -> requirements.txt (pinned versions)
# 3. pip-sync requirements.txt (exact environment)

# poetry workflow:
# poetry add requests        <- adds to pyproject.toml AND installs
# poetry add --dev pytest    <- dev-only dependency
# poetry install             <- install all deps from poetry.lock
# poetry run python script.py  <- run in env without activating

# uv workflow (fastest, new in 2024):
# uv venv                    <- create venv
# uv pip install requests    <- install (10-100x faster than pip)
# uv pip compile pyproject.toml -o requirements.txt

# --- Inspect installed packages ---
import importlib.metadata

def list_packages():
    """List installed packages with versions."""
    packages = sorted(
        importlib.metadata.packages_distributions().items()
    )
    print(f"\\nInstalled packages (sample):")
    for pkg, dists in list(packages)[:10]:
        for dist in dists:
            try:
                version = importlib.metadata.version(dist)
                print(f"  {dist}=={version}")
            except importlib.metadata.PackageNotFoundError:
                pass

# --- Pin Python version with .python-version ---
# echo "3.12.3" > .python-version
# pyenv will use this when you cd into the directory

print("\\nVirtual environment mastered!")

# === THE PROFESSIONAL WORKFLOW ===
# 1. Create project directory
# 2. python -m venv venv && source venv/bin/activate
# 3. Create pyproject.toml with dependencies
# 4. pip install -e ".[dev]"   <- install project + dev deps
# 5. git init && echo venv/ >> .gitignore
# 6. Develop, test, iterate
# 7. python -m build
# 8. pip install dist/*.whl (or publish to PyPI)`
    },
    {
      "type": "h2",
      "text": "Program: Build Your Own Utility Package"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build a complete, installable Python utility package from scratch — with a proper package structure, __init__.py, importable library, CLI entry point, and installable wheel. This is the project every Python developer needs to have done at least once."
    },
    {
      "type": "code-block",
      "label": "Program: pyutils — A Complete Installable Package",
      "code": `# === pyutils: A Complete Utility Package ===
# File: src/pyutils/__init__.py

"""
pyutils: A collection of Python productivity utilities.

Usage:
    from pyutils import TextProcessor, DataCleaner, FileScanner
    from pyutils.text import slugify, truncate
    from pyutils.data import flatten, chunk
    CLI: pyutils --help
"""

from pyutils.text import TextProcessor, slugify, truncate, word_count
from pyutils.data import DataCleaner, flatten, chunk, deduplicate
from pyutils.files import FileScanner, find_duplicates, get_tree

__version__ = '1.0.0'
__author__ = 'Python Unlocked Series'
__all__ = [
    'TextProcessor', 'DataCleaner', 'FileScanner',
    'slugify', 'truncate', 'word_count',
    'flatten', 'chunk', 'deduplicate',
    'find_duplicates', 'get_tree',
]

# === src/pyutils/text.py ===
import re
import unicodedata
from typing import Iterator

class TextProcessor:
    """Chainable text processing utility."""
    
    def __init__(self, text: str):
        self._text = text
        self._history: list[str] = [text]
    
    def clean(self) -> 'TextProcessor':
        """Remove extra whitespace."""
        self._text = ' '.join(self._text.split())
        self._history.append(self._text)
        return self
    
    def normalize(self) -> 'TextProcessor':
        """Unicode normalization (NFD -> ASCII)."""
        normalized = unicodedata.normalize('NFD', self._text)
        self._text = ''.join(
            c for c in normalized
            if unicodedata.category(c) != 'Mn'
        )
        self._history.append(self._text)
        return self
    
    def truncate(self, max_len: int, suffix: str = '...') -> 'TextProcessor':
        """Truncate to max_len characters."""
        if len(self._text) > max_len:
            self._text = self._text[:max_len - len(suffix)] + suffix
        self._history.append(self._text)
        return self
    
    def slug(self) -> 'TextProcessor':
        """Convert to URL-safe slug."""
        self._text = slugify(self._text)
        self._history.append(self._text)
        return self
    
    def result(self) -> str:
        return self._text
    
    def history(self) -> list[str]:
        return self._history.copy()

def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'^-|-$', '', text)
    return text

def truncate(text: str, max_len: int, suffix: str = '...') -> str:
    """Truncate text to max_len."""
    if len(text) <= max_len:
        return text
    return text[:max_len - len(suffix)] + suffix

def word_count(text: str) -> dict[str, int]:
    """Count words, chars, sentences."""
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    return {
        'words': len(words),
        'chars': len(text),
        'chars_no_space': len(text.replace(' ', '')),
        'sentences': len([s for s in sentences if s.strip()]),
        'avg_word_len': sum(len(w) for w in words) // max(len(words), 1),
    }

# === src/pyutils/data.py ===
from typing import Any, Callable, TypeVar

T = TypeVar('T')

class DataCleaner:
    """Chainable data cleaning utility."""
    
    def __init__(self, data: list[Any]):
        self._data = list(data)
    
    def remove_none(self) -> 'DataCleaner':
        self._data = [x for x in self._data if x is not None]
        return self
    
    def remove_empty(self) -> 'DataCleaner':
        self._data = [x for x in self._data if x != '' and x != [] and x != {}]
        return self
    
    def deduplicate(self) -> 'DataCleaner':
        seen = set()
        result = []
        for item in self._data:
            key = str(item)
            if key not in seen:
                seen.add(key)
                result.append(item)
        self._data = result
        return self
    
    def transform(self, fn: Callable) -> 'DataCleaner':
        self._data = [fn(x) for x in self._data]
        return self
    
    def result(self) -> list[Any]:
        return self._data.copy()

def flatten(nested: list, depth: int = -1) -> list:
    """Flatten a nested list."""
    result = []
    for item in nested:
        if isinstance(item, list) and depth != 0:
            result.extend(flatten(item, depth - 1))
        else:
            result.append(item)
    return result

def chunk(items: list[T], size: int) -> list[list[T]]:
    """Split list into chunks of given size."""
    return [items[i:i+size] for i in range(0, len(items), size)]

def deduplicate(items: list[T]) -> list[T]:
    """Remove duplicates preserving order."""
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

# === src/pyutils/cli.py (entry point) ===
import sys
import json
import argparse
from pyutils.text import slugify, truncate, word_count
from pyutils.data import flatten, chunk, deduplicate

def main() -> int:
    parser = argparse.ArgumentParser(
        prog='pyutils',
        description='Python productivity utilities'
    )
    subparsers = parser.add_subparsers(dest='command')
    
    # slug command
    slug_p = subparsers.add_parser('slug', help='Convert text to URL slug')
    slug_p.add_argument('text', help='Text to slugify')
    
    # count command
    count_p = subparsers.add_parser('count', help='Count words/chars')
    count_p.add_argument('text', help='Text to analyze')
    
    # chunk command
    chunk_p = subparsers.add_parser('chunk', help='Chunk a JSON list')
    chunk_p.add_argument('data', help='JSON array')
    chunk_p.add_argument('size', type=int, help='Chunk size')
    
    args = parser.parse_args()
    
    if args.command == 'slug':
        print(slugify(args.text))
    elif args.command == 'count':
        stats = word_count(args.text)
        for key, val in stats.items():
            print(f"  {key}: {val}")
    elif args.command == 'chunk':
        data = json.loads(args.data)
        result = chunk(data, args.size)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

# === DEMO ===
def demo():
    print("=" * 50)
    print("PYUTILS DEMO")
    print("=" * 50)
    
    # Text processing chain
    print("\\n--- TextProcessor chain ---")
    result = (TextProcessor("  Héllo, Wörld!   This is Python.  ")
              .clean()
              .normalize()
              .slug()
              .result())
    print(f"Processed: '{result}'")
    
    # Word count
    print("\\n--- Word Count ---")
    stats = word_count("Python is beautiful. Simple is better than complex. Readability counts.")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    # Data cleaning chain
    print("\\n--- DataCleaner chain ---")
    dirty = [1, None, 2, '', 3, None, 2, 4, '', 1]
    clean = (DataCleaner(dirty)
             .remove_none()
             .remove_empty()
             .deduplicate()
             .transform(lambda x: x * 2)
             .result())
    print(f"Dirty: {dirty}")
    print(f"Clean: {clean}")
    
    # Flatten
    print("\\n--- Flatten ---")
    nested = [1, [2, 3, [4, 5]], [6, [7, [8]]]]
    print(f"Nested: {nested}")
    print(f"Flat:   {flatten(nested)}")
    
    # Chunk
    print("\\n--- Chunk ---")
    data = list(range(10))
    chunks = chunk(data, 3)
    print(f"Data:   {data}")
    print(f"Chunks: {chunks}")
    
    print("\\n" + "=" * 50)
    print("Install with: pip install -e .")
    print("CLI usage:    pyutils slug 'Hello World'")
    print("             pyutils count 'your text here'")
    print("=" * 50)

if __name__ == '__main__':
    demo()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 25. 4/5 correct means you have mastered Python modules and packages."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Trace the exact sequence of steps Python follows when you write 'import requests'. What does it check first? What is sys.path? How does sys.modules prevent re-execution on repeated imports?",
        "Q2: What is the difference between 'from mypackage import helper' and 'from .helper import func'? When should you use each? What error occurs if you use a relative import in a top-level script?",
        "Q3: Write a pyproject.toml that defines a package called 'mytools' with a CLI entry point 'mytools' pointing to 'mytools.cli:main', a required dependency on 'click>=8.0', and a dev dependency on 'pytest'. Explain each section.",
        "Q4: What is the difference between a regular package (with __init__.py) and a namespace package (without)? Give a use case where namespace packages are the right choice.",
        "Q5: Explain why virtual environments exist. What problem does 'pip install requests' (without a venv) cause in a real project? Demonstrate with a dependency conflict scenario."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Python first checks sys.modules — if the module is already cached, it returns the cached version immediately without any file I/O. If not cached, it searches sys.path in order: current directory (or ''), PYTHONPATH entries, standard library, site-packages. When found, Python executes the module file top-to-bottom, stores the resulting module object in sys.modules under the module name, then returns it. This means module-level code runs exactly once per interpreter session, not once per import. A2: 'from mypackage import helper' is an absolute import — Python searches sys.path for 'mypackage' as if you are an external consumer. 'from .helper import func' is a relative import — Python looks for 'helper' inside the same package as the current file. Use relative imports for internal cross-module references inside a package (keeps the package self-contained). Use absolute imports in application code and scripts. Relative imports fail with ImportError if used in a top-level script because the script has no package context (__package__ is None). A3: [build-system] requires = ['setuptools>=61'] and build-backend = 'setuptools.build_meta'. [project] name = 'mytools', version = '1.0.0', dependencies = ['click>=8.0']. [project.scripts] mytools = 'mytools.cli:main'. [project.optional-dependencies] dev = ['pytest']. The [build-system] section tells pip which tool to use to build the package. [project.scripts] creates a console_scripts entry point — pip creates a 'mytools' executable that calls main() in mytools/cli.py. A4: A regular package requires __init__.py and is a single directory with a single owner. A namespace package spans multiple directories or distributions — Python 3.3+ automatically treats any directory without __init__.py as a namespace package, merging all matching directories on sys.path. Use case: a large organization has myorg.utils and myorg.models in separate repos/packages. Both install under the myorg namespace without coordinating a single __init__.py file. A5: Without venv, all packages install to the system Python's site-packages. If project A needs requests==2.28 and project B needs requests==2.31, only one version can be installed globally — they conflict. Virtual environments give each project its own isolated site-packages directory. Activating a venv makes that venv's Python and site-packages the default, completely isolating projects from each other and from the system Python."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python's module and packaging system. You understand the import algorithm — sys.modules cache first, then sys.path search — and can predict exactly what happens on every import statement. You transform directories into packages with __init__.py, control public APIs with __all__, and use relative imports inside packages for relocatable, self-contained code. You understand the module-script duality through __name__ == '__main__', and build executable packages with __main__.py. You write modern pyproject.toml files with metadata, dependencies, CLI entry points, and tool configuration — the complete professional package definition. You isolate project dependencies with virtual environments, choosing between venv, poetry, and uv based on the context. And you have built pyutils — a complete, installable utility package with chainable text processing, data cleaning, and a multi-command CLI. Your code is no longer a script. It is a package."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: import checks sys.modules then sys.path. __init__.py makes packages. Relative imports are for internals; absolute imports are for consumers. pyproject.toml is the modern standard. Virtual environments are non-negotiable. Master these five principles, and your code can be installed by anyone, anywhere, in one command. In Part 25, we cross the threshold into Object-Oriented Programming — where data and behavior unite into classes, the building blocks of every serious Python system."
    },
    {
      "type": "cta",
      "text": "Start Part 25: OOP Foundations →",
      "href": "/tutorials/python-unlocked/part-25-oop-foundations",
      "note": "30 min read · Classes · Objects · __init__ · Encapsulation · Four complete programs"
    }
  ]
};

export default post;
