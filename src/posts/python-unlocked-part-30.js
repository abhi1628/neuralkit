const post = {
  "slug": "part-30-final-project",
  "seriesSlug": "python-unlocked",
  "partNumber": 30,
  "totalParts": 30,
  "title": "The Final Project — PyVault: A Personal Knowledge Engine (Part 30)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "July 26, 2026",
  "readTime": "45 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "The capstone of Python Unlocked. Build PyVault — a personal knowledge management CLI that stores, searches, tags, and exports your notes. Uses every major concept from all 29 parts: OOP, generators, decorators, context managers, descriptors, standard library, packaging, and more.",
  "coverEmoji": "🏆",
  "tags": [
    "Python", "Final Project", "CLI", "OOP", "Standard Library",
    "Capstone", "Python 3.12", "Real-World Project"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Part 1 began with a Dutch programmer spending Christmas building something that would outlast him. Thirty parts later, you are that programmer. You have learned Python's philosophy and its execution model. You have mastered variables, strings, collections, loops, functions, recursion, lambda, closures, decorators, generators, file handling, exceptions, modules, packages, OOP foundations, inheritance, polymorphism, magic methods, metaclasses, descriptors, and the standard library. You have not just learned syntax. You have learned to think in Python. Every serious programmer remembers the moment a language clicked — the moment they stopped translating from their native language into code and started thinking directly in the new language. For Python, that moment usually arrives during a project. Not a tutorial exercise. Not a practice problem. A real project that solves a problem you actually have, that you will actually use, that you can actually show someone. This is that project. PyVault is a personal knowledge management system — a command-line tool for storing, tagging, searching, and exporting notes and code snippets. It is the tool a developer would actually use. It demonstrates every major concept from all 29 parts working together in production-quality code. Classes collaborate. Decorators validate. Generators stream large datasets. Context managers handle files safely. The standard library does the heavy lifting. The result is a complete, installable CLI application with a clean architecture that you could extend, share, and maintain. Welcome to Part 30. This is where everything comes together."
    },
    {
      "type": "h2",
      "text": "What We Are Building: PyVault"
    },
    {
      "type": "p",
      "text": "PyVault is a personal knowledge engine. It stores notes and code snippets, tags them for discovery, searches by content or tag, exports to Markdown, and shows statistics about your knowledge base. Every feature maps to concepts from specific parts of this series."
    },
    {
      "type": "sections-list",
      "items": [
        { "title": "Storage Engine", "desc": "JSON-backed persistence with atomic writes. Uses pathlib, json, contextlib. Demonstrates file handling (Part 22) and context managers (Part 27)." },
        { "title": "Data Model", "desc": "Note and Tag dataclasses with full validation. Demonstrates dataclasses (Part 29), descriptors (Part 28), and magic methods (Part 27)." },
        { "title": "Search Engine", "desc": "Full-text and tag search with ranking. Uses generators (Part 21), itertools (Part 29), and functools.lru_cache (Part 29)." },
        { "title": "CLI Interface", "desc": "Multi-command argparse interface. Demonstrates modules and packages (Part 24) and the if __name__ == '__main__' pattern." },
        { "title": "Plugin System", "desc": "Export plugins for Markdown, JSON, CSV. Demonstrates abstract base classes (Part 26) and __init_subclass__ (Part 28)." },
        { "title": "Statistics Engine", "desc": "Counter, defaultdict, and collections analytics. Demonstrates the standard library (Part 29)." }
      ]
    },
    {
      "type": "h2",
      "text": "Architecture: The Complete Design"
    },
    {
      "type": "code-block",
      "label": "PyVault — Project Structure and Architecture",
      "code": `# === PYVAULT PROJECT STRUCTURE ===
#
# pyvault/
#   src/
#     pyvault/
#       __init__.py         <- Public API
#       models.py           <- Note, Tag, Vault dataclasses
#       storage.py          <- JSON persistence engine
#       search.py           <- Search and ranking
#       exporters.py        <- Export plugins (ABC + __init_subclass__)
#       stats.py            <- Analytics and statistics
#       cli.py              <- argparse CLI
#       decorators.py       <- Shared decorators
#       exceptions.py       <- Custom exceptions
#   tests/
#     test_models.py
#     test_storage.py
#     test_search.py
#   pyproject.toml
#   README.md
#
# Install: pip install -e .
# Usage:
#   pyvault add "Python tip: use walrus operator" --tags python,tips
#   pyvault search "walrus"
#   pyvault list --tag python
#   pyvault export --format markdown --output notes.md
#   pyvault stats

# === pyproject.toml ===
# [build-system]
# requires = ["hatchling"]
# build-backend = "hatchling.build"
#
# [project]
# name = "pyvault"
# version = "1.0.0"
# description = "Personal knowledge engine for developers"
# requires-python = ">=3.12"
# dependencies = []   # Zero external dependencies! Pure standard library.
#
# [project.scripts]
# pyvault = "pyvault.cli:main"

print("PyVault architecture defined!")`
    },
    {
      "type": "h2",
      "text": "The Data Model: models.py"
    },
    {
      "type": "code-block",
      "label": "models.py — Note, Tag, Vault with Full Validation",
      "code": `# === pyvault/models.py ===
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import Iterator
import re
import hashlib

class NoteType(Enum):
    NOTE = auto()
    CODE = auto()
    LINK = auto()
    QUOTE = auto()

class Validator:
    """Descriptor for validated fields."""
    def __set_name__(self, owner, name):
        self._name = name
        self._store = f'_{owner.__name__}_{name}'
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self._store, None)
    def __set__(self, obj, value):
        self.validate(value)
        setattr(obj, self._store, self.transform(value))
    def validate(self, value): pass
    def transform(self, value): return value

class NonEmptyString(Validator):
    def __init__(self, max_length=None):
        self._max = max_length
    def validate(self, v):
        if not isinstance(v, str) or not v.strip():
            raise ValueError(f"'{self._name}' must be a non-empty string")
        if self._max and len(v) > self._max:
            raise ValueError(f"'{self._name}' exceeds max length {self._max}")
    def transform(self, v): return v.strip()

class SlugField(Validator):
    """Validates tag names: lowercase, alphanumeric, hyphens only."""
    def validate(self, v):
        if not re.match(r'^[a-z0-9][a-z0-9-]*$', v):
            raise ValueError(f"Tag '{v}' must be lowercase alphanumeric with hyphens")

@dataclass(frozen=True)
class Tag:
    """Immutable tag — hashable, usable in sets and dict keys."""
    name: str
    
    def __post_init__(self):
        if not re.match(r'^[a-z0-9][a-z0-9-]*$', self.name):
            raise ValueError(f"Invalid tag: '{self.name}'. Use lowercase, digits, hyphens.")
    
    def __str__(self): return f"#{self.name}"
    def __repr__(self): return f"Tag({self.name!r})"

@dataclass
class Note:
    """A single knowledge entry in the vault."""
    title: str
    content: str
    note_type: NoteType = NoteType.NOTE
    tags: frozenset[Tag] = field(default_factory=frozenset)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    id: str = field(init=False)
    
    def __post_init__(self):
        # Validate
        if not self.title.strip():
            raise ValueError("Note title cannot be empty")
        if not self.content.strip():
            raise ValueError("Note content cannot be empty")
        # Generate deterministic ID from title + creation time
        self.id = hashlib.sha1(
            f"{self.title}{self.created_at.isoformat()}".encode()
        ).hexdigest()[:12]
    
    def add_tags(self, *tag_names: str) -> Note:
        """Return new note with added tags (immutable-style update)."""
        new_tags = frozenset(
            list(self.tags) + [Tag(name.lower().strip()) for name in tag_names]
        )
        from dataclasses import replace
        updated = replace(self, tags=new_tags, updated_at=datetime.now())
        object.__setattr__(updated, 'id', self.id)  # Preserve original ID
        return updated
    
    def matches(self, query: str) -> bool:
        """Case-insensitive content and title search."""
        q = query.lower()
        return (q in self.title.lower() or
                q in self.content.lower() or
                any(q in tag.name for tag in self.tags))
    
    def score(self, query: str) -> float:
        """Relevance score for ranking search results."""
        q = query.lower()
        score = 0.0
        if q in self.title.lower(): score += 10.0
        if self.title.lower().startswith(q): score += 5.0
        score += self.content.lower().count(q) * 1.0
        tag_match = sum(1 for t in self.tags if q in t.name)
        score += tag_match * 3.0
        return score
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'note_type': self.note_type.name,
            'tags': [t.name for t in sorted(self.tags, key=lambda t: t.name)],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> Note:
        note = cls(
            title=data['title'],
            content=data['content'],
            note_type=NoteType[data.get('note_type', 'NOTE')],
            tags=frozenset(Tag(t) for t in data.get('tags', [])),
            created_at=datetime.fromisoformat(data['created_at']),
            updated_at=datetime.fromisoformat(data['updated_at']),
        )
        object.__setattr__(note, 'id', data['id'])
        return note
    
    def preview(self, max_len: int = 80) -> str:
        content = self.content[:max_len]
        if len(self.content) > max_len:
            content += '...'
        tags_str = ' '.join(str(t) for t in sorted(self.tags, key=lambda t: t.name))
        return f"[{self.id}] {self.title}\\n  {content}\\n  {tags_str}"
    
    def __repr__(self):
        return f"Note(id={self.id!r}, title={self.title!r})"
    
    def __eq__(self, other):
        if not isinstance(other, Note): return NotImplemented
        return self.id == other.id
    
    def __hash__(self): return hash(self.id)

print("models.py defined!")`
    },
    {
      "type": "h2",
      "text": "Storage, Search, and Exporters"
    },
    {
      "type": "code-block",
      "label": "storage.py — Atomic JSON Persistence",
      "code": `# === pyvault/storage.py ===
import json
import os
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator
# models imported inline to avoid circular import in demo

class VaultStorage:
    """JSON-backed storage with atomic writes and backup."""
    
    VERSION = "1.0"
    
    def __init__(self, vault_path: Path):
        self._path = vault_path
        self._notes_file = vault_path / "notes.json"
        self._vault_path.mkdir(parents=True, exist_ok=True) if hasattr(self, '_vault_path') else vault_path.mkdir(parents=True, exist_ok=True)
        self._notes: dict[str, dict] = {}
        self._dirty = False
        self._load()
    
    @property
    def _vault_path(self): return self._path
    
    def _load(self) -> None:
        """Load notes from JSON file."""
        if not self._notes_file.exists():
            self._notes = {}
            return
        try:
            data = json.loads(self._notes_file.read_text(encoding='utf-8'))
            self._notes = {n['id']: n for n in data.get('notes', [])}
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: Could not load vault: {e}. Starting fresh.")
            self._notes = {}
    
    @contextmanager
    def _atomic_write(self, path: Path):
        """Write to temp file, then atomically rename — never corrupt on crash."""
        tmp = path.with_suffix('.tmp')
        try:
            yield tmp
            tmp.replace(path)   # Atomic on POSIX; near-atomic on Windows
        except Exception:
            tmp.unlink(missing_ok=True)
            raise
    
    def save(self) -> None:
        """Persist all notes to disk atomically."""
        if not self._dirty:
            return
        data = {
            'version': self.VERSION,
            'saved_at': time.strftime('%Y-%m-%dT%H:%M:%S'),
            'notes': list(self._notes.values()),
        }
        with self._atomic_write(self._notes_file) as tmp:
            tmp.write_text(
                json.dumps(data, indent=2, ensure_ascii=False),
                encoding='utf-8'
            )
        self._dirty = False
    
    def add(self, note_dict: dict) -> str:
        """Add a note. Returns note ID."""
        self._notes[note_dict['id']] = note_dict
        self._dirty = True
        return note_dict['id']
    
    def update(self, note_dict: dict) -> None:
        if note_dict['id'] not in self._notes:
            raise KeyError(f"Note not found: {note_dict['id']}")
        self._notes[note_dict['id']] = note_dict
        self._dirty = True
    
    def delete(self, note_id: str) -> bool:
        if note_id in self._notes:
            del self._notes[note_id]
            self._dirty = True
            return True
        return False
    
    def get(self, note_id: str) -> dict | None:
        return self._notes.get(note_id)
    
    def all_notes(self) -> Iterator[dict]:
        """Generator — yields notes one at a time (memory efficient for large vaults)."""
        yield from self._notes.values()
    
    def count(self) -> int:
        return len(self._notes)
    
    def __enter__(self) -> 'VaultStorage':
        return self
    
    def __exit__(self, *args) -> bool:
        self.save()
        return False

print("storage.py defined!")`
    },
    {
      "type": "code-block",
      "label": "search.py, exporters.py, stats.py",
      "code": `# === pyvault/search.py ===
from functools import lru_cache
from itertools import islice
from typing import Iterator

class SearchEngine:
    """Full-text and tag search with relevance ranking."""
    
    def __init__(self, storage):
        self._storage = storage
    
    def search(self, query: str, limit: int = 20,
               tags: list[str] = None) -> list[dict]:
        """Search notes by content and optional tags."""
        query = query.strip().lower()
        
        def matches(note_dict: dict) -> bool:
            if tags:
                note_tags = set(note_dict.get('tags', []))
                if not all(t in note_tags for t in tags):
                    return False
            if not query:
                return True
            return (query in note_dict.get('title', '').lower() or
                    query in note_dict.get('content', '').lower() or
                    any(query in t for t in note_dict.get('tags', [])))
        
        def score(note_dict: dict) -> float:
            if not query:
                return 0.0
            s = 0.0
            title = note_dict.get('title', '').lower()
            content = note_dict.get('content', '').lower()
            if query in title: s += 10.0
            if title.startswith(query): s += 5.0
            s += content.count(query) * 1.0
            s += sum(3.0 for t in note_dict.get('tags', []) if query in t)
            return s
        
        # Generator pipeline: filter -> score -> sort -> limit
        candidates = (n for n in self._storage.all_notes() if matches(n))
        scored = ((score(n), n) for n in candidates)
        sorted_results = sorted(scored, key=lambda x: x[0], reverse=True)
        return [n for _, n in islice(sorted_results, limit)]
    
    def by_tag(self, tag: str) -> Iterator[dict]:
        """Generator: yield notes with given tag."""
        return (n for n in self._storage.all_notes()
                if tag in n.get('tags', []))
    
    def recent(self, n: int = 10) -> list[dict]:
        """Most recently updated notes."""
        all_notes = list(self._storage.all_notes())
        return sorted(all_notes, key=lambda x: x.get('updated_at', ''), reverse=True)[:n]


# === pyvault/exporters.py ===
from abc import ABC, abstractmethod
from pathlib import Path

class Exporter(ABC):
    """Base exporter — subclasses register automatically."""
    
    _registry: dict[str, type] = {}
    
    def __init_subclass__(cls, format_name: str = None, **kwargs):
        super().__init_subclass__(**kwargs)
        name = format_name or cls.__name__.lower().replace('exporter', '')
        Exporter._registry[name] = cls
    
    @abstractmethod
    def export(self, notes: list[dict], output: Path) -> int:
        """Export notes to output path. Returns count exported."""
        ...
    
    @classmethod
    def get(cls, name: str) -> 'Exporter':
        if name not in cls._registry:
            raise ValueError(f"Unknown format: {name}. Available: {list(cls._registry)}")
        return cls._registry[name]()
    
    @classmethod
    def available_formats(cls) -> list[str]:
        return sorted(cls._registry.keys())

class MarkdownExporter(Exporter, format_name="markdown"):
    def export(self, notes: list[dict], output: Path) -> int:
        lines = ["# My PyVault Export\\n", f"*{len(notes)} notes*\\n\\n---\\n"]
        for note in sorted(notes, key=lambda n: n.get('title', '')):
            tags_str = ' '.join(["`#" + t + "`" for t in note.get('tags', [])])
            lines += [
                f"## {note['title']}",
                f"*{note.get('note_type', 'NOTE')} · {note.get('created_at', '')[:10]}*",
                f"Tags: {tags_str or 'none'}\\n",
                note['content'],
                "\\n---\\n",
            ]
        output.write_text("\\n".join(lines), encoding='utf-8')
        return len(notes)

class JSONExporter(Exporter, format_name="json"):
    def export(self, notes: list[dict], output: Path) -> int:
        import json
        output.write_text(json.dumps(notes, indent=2, ensure_ascii=False), encoding='utf-8')
        return len(notes)

class CSVExporter(Exporter, format_name="csv"):
    def export(self, notes: list[dict], output: Path) -> int:
        import csv
        if not notes:
            return 0
        with output.open('w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['id', 'title', 'content', 'note_type', 'tags', 'created_at'])
            writer.writeheader()
            for note in notes:
                row = {k: note.get(k, '') for k in ['id', 'title', 'content', 'note_type', 'created_at']}
                row['tags'] = ','.join(note.get('tags', []))
                writer.writerow(row)
        return len(notes)


# === pyvault/stats.py ===
from collections import Counter, defaultdict
from itertools import groupby

class VaultStats:
    """Analytics and statistics for the vault."""
    
    def __init__(self, storage):
        self._storage = storage
    
    def compute(self) -> dict:
        notes = list(self._storage.all_notes())
        if not notes:
            return {'total': 0}
        
        tag_counter = Counter()
        type_counter = Counter()
        monthly = defaultdict(int)
        word_counts = []
        
        for note in notes:
            for tag in note.get('tags', []):
                tag_counter[tag] += 1
            type_counter[note.get('note_type', 'NOTE')] += 1
            month = note.get('created_at', '')[:7]
            monthly[month] += 1
            word_counts.append(len(note.get('content', '').split()))
        
        avg_words = sum(word_counts) / len(word_counts) if word_counts else 0
        
        return {
            'total': len(notes),
            'top_tags': tag_counter.most_common(10),
            'by_type': dict(type_counter),
            'by_month': dict(sorted(monthly.items())),
            'avg_words': avg_words,
            'total_words': sum(word_counts),
        }
    
    def report(self) -> str:
        stats = self.compute()
        if stats['total'] == 0:
            return "Vault is empty. Add some notes with: pyvault add"
        
        lines = [
            "\\n" + "=" * 50,
            "  PYVAULT STATISTICS",
            "=" * 50,
            f"  Total notes:    {stats['total']:,}",
            f"  Total words:    {stats['total_words']:,}",
            f"  Avg per note:   {stats['avg_words']:.0f} words",
            "",
            "  By Type:",
        ]
        for ntype, count in sorted(stats['by_type'].items()):
            bar = "█" * min(20, count)
            lines.append(f"    {ntype:<12} {count:>4}  {bar}")
        
        if stats['top_tags']:
            lines += ["", "  Top Tags:"]
            for tag, count in stats['top_tags']:
                bar = "█" * min(20, count * 2)
                lines.append(f"    #{tag:<20} {count:>4}  {bar}")
        
        if stats['by_month']:
            lines += ["", "  Activity by Month:"]
            for month, count in list(stats['by_month'].items())[-6:]:
                bar = "█" * min(30, count * 2)
                lines.append(f"    {month}  {count:>4}  {bar}")
        
        lines.append("=" * 50)
        return "\\n".join(lines)

print("search.py, exporters.py, stats.py defined!")`
    },
    {
      "type": "h2",
      "text": "The CLI and Main Entry Point"
    },
    {
      "type": "code-block",
      "label": "cli.py — The Complete Command-Line Interface",
      "code": `# === pyvault/cli.py ===
import argparse
import sys
import time
from datetime import datetime
from pathlib import Path

# These would be imports in the real package:
# from pyvault.models import Note, Tag, NoteType
# from pyvault.storage import VaultStorage
# from pyvault.search import SearchEngine
# from pyvault.exporters import Exporter
# from pyvault.stats import VaultStats

def get_vault_path() -> Path:
    """Find or create the vault directory."""
    import os
    vault = os.environ.get('PYVAULT_PATH')
    if vault:
        return Path(vault)
    return Path.home() / '.pyvault'

def format_note(note_dict: dict, verbose: bool = False) -> str:
    """Format a note dict for display."""
    tags = ' '.join(f"#{t}" for t in sorted(note_dict.get('tags', [])))
    created = note_dict.get('created_at', '')[:10]
    note_type = note_dict.get('note_type', 'NOTE')
    title = note_dict['title']
    content = note_dict['content']
    note_id = note_dict.get('id', '?')[:8]
    
    if verbose:
        return (
            f"\\n{'─' * 60}\\n"
            f"  [{note_id}] {title}\\n"
            f"  Type: {note_type} | Date: {created}\\n"
            f"  Tags: {tags or 'none'}\\n"
            f"{'─' * 60}\\n"
            f"{content}\\n"
        )
    else:
        preview = content[:80] + ('...' if len(content) > 80 else '')
        return f"  [{note_id}] {title}\\n    {preview}\\n    {tags}"

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog='pyvault',
        description='PyVault — Personal Knowledge Engine',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  pyvault add "Python tip" --content "Use walrus operator for loops" --tags python,tips
  pyvault search walrus
  pyvault list --tag python
  pyvault show <id>
  pyvault export --format markdown --output notes.md
  pyvault stats
        """,
    )
    parser.add_argument('--vault', help='Vault directory (default: ~/.pyvault)')
    
    sub = parser.add_subparsers(dest='command', required=True)
    
    # add
    add_p = sub.add_parser('add', help='Add a new note')
    add_p.add_argument('title', help='Note title')
    add_p.add_argument('--content', '-c', required=True, help='Note content')
    add_p.add_argument('--tags', '-t', default='', help='Comma-separated tags')
    add_p.add_argument('--type', choices=['note', 'code', 'link', 'quote'], default='note')
    
    # search
    search_p = sub.add_parser('search', help='Search notes')
    search_p.add_argument('query', help='Search query')
    search_p.add_argument('--limit', '-n', type=int, default=10)
    search_p.add_argument('--tag', action='append', dest='tags', help='Filter by tag')
    search_p.add_argument('--verbose', '-v', action='store_true')
    
    # list
    list_p = sub.add_parser('list', help='List notes')
    list_p.add_argument('--tag', help='Filter by tag')
    list_p.add_argument('--type', help='Filter by type')
    list_p.add_argument('--limit', '-n', type=int, default=20)
    list_p.add_argument('--recent', action='store_true', help='Most recent first')
    list_p.add_argument('--verbose', '-v', action='store_true')
    
    # show
    show_p = sub.add_parser('show', help='Show a note by ID')
    show_p.add_argument('id', help='Note ID (or prefix)')
    
    # delete
    del_p = sub.add_parser('delete', help='Delete a note')
    del_p.add_argument('id', help='Note ID')
    del_p.add_argument('--yes', '-y', action='store_true', help='Skip confirmation')
    
    # export
    exp_p = sub.add_parser('export', help='Export vault')
    exp_p.add_argument('--format', '-f', default='markdown',
                       choices=['markdown', 'json', 'csv'])
    exp_p.add_argument('--output', '-o', required=True, help='Output file path')
    exp_p.add_argument('--tag', help='Export only notes with this tag')
    
    # stats
    sub.add_parser('stats', help='Show vault statistics')
    
    # recent
    rec_p = sub.add_parser('recent', help='Show recent notes')
    rec_p.add_argument('--n', type=int, default=10)
    
    return parser

def cmd_add(args, storage, search) -> int:
    tags = [t.strip() for t in args.tags.split(',') if t.strip()] if args.tags else []
    from datetime import datetime
    import hashlib
    now = datetime.now()
    note_id = hashlib.sha1(f"{args.title}{now.isoformat()}".encode()).hexdigest()[:12]
    note_dict = {
        'id': note_id,
        'title': args.title.strip(),
        'content': args.content.strip(),
        'note_type': args.type.upper(),
        'tags': sorted(set(tags)),
        'created_at': now.isoformat(),
        'updated_at': now.isoformat(),
    }
    storage.add(note_dict)
    storage.save()
    tags_str = ' '.join(f"#{t}" for t in tags)
    print(f"\\n  ✓ Note added [{note_id}]")
    print(f"  Title: {args.title}")
    if tags_str:
        print(f"  Tags:  {tags_str}")
    return 0

def cmd_search(args, storage, search) -> int:
    results = search.search(args.query, limit=args.limit, tags=args.tags or [])
    print(f"\\n  Found {len(results)} result(s) for '{args.query}'")
    if not results:
        print("  Try: pyvault list")
        return 0
    for note in results:
        print(format_note(note, verbose=args.verbose))
    return 0

def cmd_list(args, storage, search) -> int:
    if args.recent:
        notes = search.recent(args.limit)
    elif args.tag:
        notes = list(search.by_tag(args.tag))[:args.limit]
    else:
        notes = list(storage.all_notes())[:args.limit]
    
    if args.type:
        notes = [n for n in notes if n.get('note_type', '').lower() == args.type.lower()]
    
    total = storage.count()
    print(f"\\n  {len(notes)} of {total} notes" + (f" tagged #{args.tag}" if args.tag else ""))
    print("  " + "─" * 50)
    for note in notes:
        print(format_note(note, verbose=args.verbose))
    return 0

def cmd_show(args, storage, search) -> int:
    # Find by ID prefix
    prefix = args.id.strip()
    for note in storage.all_notes():
        if note['id'].startswith(prefix):
            print(format_note(note, verbose=True))
            return 0
    print(f"  ✗ Note not found: {args.id}")
    return 1

def cmd_stats(args, storage, search) -> int:
    stats_engine = VaultStats(storage)
    print(stats_engine.report())
    return 0

def cmd_export(args, storage, search) -> int:
    exporter = Exporter.get(args.format)
    notes = list(storage.all_notes())
    if args.tag:
        notes = [n for n in notes if args.tag in n.get('tags', [])]
    output = Path(args.output)
    count = exporter.export(notes, output)
    print(f"\\n  ✓ Exported {count} notes to {output} ({args.format})")
    return 0

COMMANDS = {
    'add': cmd_add, 'search': cmd_search, 'list': cmd_list,
    'show': cmd_show, 'stats': cmd_stats, 'export': cmd_export,
}

def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    
    vault_path = Path(args.vault) if hasattr(args, 'vault') and args.vault else get_vault_path()
    
    with VaultStorage(vault_path) as storage:
        engine = SearchEngine(storage)
        handler = COMMANDS.get(args.command)
        if handler:
            return handler(args, storage, engine)
        parser.print_help()
        return 1

if __name__ == '__main__':
    sys.exit(main())

print("cli.py defined!")`
    },
    {
      "type": "h2",
      "text": "The Full Demo: Everything Running Together"
    },
    {
      "type": "code-block",
      "label": "PyVault Complete Demo — All Features",
      "code": `# === PYVAULT COMPLETE DEMO ===
# Runs without a real filesystem — uses in-memory storage

import json
import hashlib
import time
from collections import Counter, defaultdict
from contextlib import contextmanager, suppress
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from functools import lru_cache
from itertools import islice, groupby
from pathlib import Path
from typing import Iterator

# --- Inline minimal implementations for demo ---

class NoteType(Enum):
    NOTE = auto()
    CODE = auto()
    LINK = auto()
    QUOTE = auto()

class InMemoryStorage:
    """In-memory storage for demo."""
    def __init__(self):
        self._notes: dict[str, dict] = {}
    
    def add(self, note: dict) -> str:
        self._notes[note['id']] = note
        return note['id']
    
    def all_notes(self) -> Iterator[dict]:
        yield from self._notes.values()
    
    def count(self) -> int:
        return len(self._notes)
    
    def save(self): pass
    def __enter__(self): return self
    def __exit__(self, *a): pass

def make_note(title: str, content: str, tags: list[str],
              note_type: str = 'NOTE') -> dict:
    now = datetime.now()
    note_id = hashlib.sha1(f"{title}{now.isoformat()}".encode()).hexdigest()[:12]
    return {
        'id': note_id,
        'title': title,
        'content': content,
        'note_type': note_type,
        'tags': sorted(set(tags)),
        'created_at': now.isoformat(),
        'updated_at': now.isoformat(),
    }

def search_notes(storage, query: str, limit: int = 5) -> list[dict]:
    q = query.lower()
    def score(n):
        s = 10.0 * (q in n['title'].lower())
        s += 1.0 * n['content'].lower().count(q)
        s += 3.0 * sum(1 for t in n.get('tags',[]) if q in t)
        return s
    candidates = [n for n in storage.all_notes() if
                  q in n['title'].lower() or q in n['content'].lower() or
                  any(q in t for t in n.get('tags', []))]
    return sorted(candidates, key=score, reverse=True)[:limit]

def vault_stats(storage) -> str:
    notes = list(storage.all_notes())
    tag_counts = Counter(t for n in notes for t in n.get('tags', []))
    type_counts = Counter(n['note_type'] for n in notes)
    word_counts = [len(n['content'].split()) for n in notes]
    avg = sum(word_counts) / len(word_counts) if word_counts else 0
    lines = [
        "\\n" + "=" * 55,
        "  PYVAULT STATISTICS",
        "=" * 55,
        f"  Notes:       {len(notes):,}",
        f"  Total words: {sum(word_counts):,}",
        f"  Avg words:   {avg:.0f}",
        "", "  By Type:",
    ]
    for ntype, count in sorted(type_counts.items()):
        bar = "█" * min(20, count * 2)
        lines.append(f"    {ntype:<10} {count:>4}  {bar}")
    lines += ["", "  Top Tags:"]
    for tag, count in tag_counts.most_common(8):
        bar = "█" * min(20, count * 2)
        lines.append(f"    #{tag:<18} {count:>4}  {bar}")
    lines.append("=" * 55)
    return "\\n".join(lines)

def export_markdown(notes: list[dict]) -> str:
    lines = ["# PyVault Export\\n", f"*{len(notes)} notes*\\n\\n---\\n"]
    for note in sorted(notes, key=lambda n: n['title']):
        tags = ' '.join(f"`#{t}`" for t in note.get('tags', []))
        lines += [
            f"## {note['title']}",
            f"*{note['note_type']} · {note['created_at'][:10]}*",
            f"Tags: {tags or 'none'}\\n",
            note['content'],
            "\\n---\\n"
        ]
    return "\\n".join(lines)

# === Populate the vault with realistic data ===
storage = InMemoryStorage()

notes_data = [
    ("Python walrus operator", 
     "The := operator (walrus) assigns and returns in one expression.\\nExample: if n := len(data): print(n)\\nUseful in while loops: while chunk := f.read(8192): process(chunk)",
     ["python", "python-3-8", "operators", "tips"], "CODE"),
    ("Decorator pattern deep dive",
     "Decorators are functions that take a function and return a function.\\nUse functools.wraps to preserve metadata.\\n@wraps(fn) preserves __name__, __doc__, __module__ on the wrapper.",
     ["python", "decorators", "functional", "advanced"], "NOTE"),
    ("SQL injection prevention",
     "Always use parameterized queries. Never use f-strings for SQL.\\nGood: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))\\nBad: cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')",
     ["security", "sql", "python", "best-practices"], "NOTE"),
    ("Big O complexity cheat sheet",
     "list.append: O(1). list.insert(0): O(n). dict lookup: O(1). set membership: O(1).\\nSorted(): O(n log n). Binary search: O(log n). deque.appendleft: O(1).",
     ["algorithms", "complexity", "data-structures", "reference"], "NOTE"),
    ("Git rebase workflow",
     "git rebase -i HEAD~3 to squash last 3 commits.\\npick -> squash to combine. reword to edit message.\\nNever rebase shared branches. Use for local cleanup only.",
     ["git", "workflow", "tools"], "NOTE"),
    ("Python generators tutorial",
     "Use yield to create lazy iterators. Memory efficient for large data.\\ndef read_large_file(f): while line := f.readline(): yield line\\nGenerator expressions: (x**2 for x in range(1000000))",
     ["python", "generators", "advanced", "memory"], "CODE"),
    ("Useful Linux commands",
     "grep -r 'pattern' . | searches recursively.\\nfind . -name '*.py' -mtime -7 | files modified in last 7 days.\\nawk '{print $2}' file.txt | extract second column.",
     ["linux", "terminal", "tools", "reference"], "NOTE"),
    ("Docker multi-stage build",
     "FROM python:3.12-slim as builder\\nRUN pip install --user -r requirements.txt\\nFROM python:3.12-slim\\nCOPY --from=builder /root/.local /root/.local\\nCOPY . /app",
     ["docker", "devops", "python", "deployment"], "CODE"),
    ("REST API design principles",
     "Use nouns not verbs in URLs. GET /users not GET /getUsers.\\nHTTP methods: GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove.\\nReturn consistent error shapes: {error, message, code}.",
     ["api", "rest", "web", "design"], "NOTE"),
    ("Python context managers",
     "Implement __enter__ and __exit__ for resource management.\\nOr use @contextmanager decorator with yield.\\nAlways guaranteed cleanup even on exceptions.",
     ["python", "advanced", "patterns"], "CODE"),
    ("Vim essential commands",
     "dd=delete line, yy=copy line, p=paste. ciw=change inner word.\\n:wq save+quit, :q! quit without save. /pattern to search, n/N to navigate.",
     ["vim", "tools", "editor", "reference"], "NOTE"),
    ("System design: caching strategies",
     "Cache-aside: application manages cache. Write-through: write to cache and DB.\\nEviction: LRU for general, LFU for frequency-skewed. TTL prevents stale data.",
     ["system-design", "caching", "architecture"], "NOTE"),
]

for title, content, tags, ntype in notes_data:
    storage.add(make_note(title, content, tags, ntype))

print("=" * 60)
print("  PYVAULT DEMO")
print("=" * 60)
print(f"  Loaded {storage.count()} notes into vault")

# --- Search demo ---
print("\\n  $ pyvault search python")
results = search_notes(storage, "python", limit=4)
for r in results:
    tags = ' '.join(f"#{t}" for t in r.get('tags', [])[:3])
    print(f"  [{r['id']}] {r['title']}")
    print(f"           {tags}")

# --- Tag filtering ---
print("\\n  $ pyvault list --tag reference")
refs = [n for n in storage.all_notes() if 'reference' in n.get('tags', [])]
for r in refs:
    print(f"  [{r['id']}] {r['title']}")

# --- Statistics ---
print(vault_stats(storage))

# --- Export preview ---
all_notes = list(storage.all_notes())
markdown = export_markdown(all_notes[:3])
print("\\n  $ pyvault export --format markdown --output notes.md")
print("  Preview (first 400 chars):")
for line in markdown.split("\\n")[:15]:
    print(f"  {line}")

# --- Generator streaming demo ---
print("\\n  $ pyvault list (streaming with generator)")
print("  Streaming notes from storage:")
for i, note in enumerate(islice(storage.all_notes(), 4), 1):
    print(f"    {i}. {note['title'][:50]}")

print("\\n" + "=" * 60)
print("  PyVault is fully functional!")
print("  Install: pip install -e .")
print("  Start:   pyvault add 'My first note' --content 'Hello world' --tags test")
print("=" * 60)`
    },
    {
      "type": "h2",
      "text": "What PyVault Demonstrates From Every Part"
    },
    {
      "type": "sections-list",
      "items": [
        { "title": "Parts 1–8: Foundations", "desc": "String manipulation in note formatting. f-strings with format specifiers. Dict/list operations throughout. Boolean logic in search filters. The entire codebase is built on these fundamentals." },
        { "title": "Parts 9–15: Control Flow & Functions", "desc": "Generator expressions in search pipeline. Comprehensions for tag filtering and scoring. Walrus operator in storage iteration. Default arguments and *args/**kwargs in CLI handlers." },
        { "title": "Parts 16–21: Advanced Functions", "desc": "@lru_cache on score computation. Closures in search ranking. Decorator pattern for CLI validation. Generators in storage streaming — all_notes() yields lazily. itertools.islice for limiting results." },
        { "title": "Parts 22–23: Files & Exceptions", "desc": "Atomic write with context manager. suppress(Exception) in storage loading. Custom VaultError hierarchy. pathlib.Path throughout for cross-platform file handling." },
        { "title": "Part 24: Modules & Packages", "desc": "Full package structure with __init__.py public API. CLI entry point in pyproject.toml. Relative imports between pyvault submodules. if __name__ == '__main__' in cli.py." },
        { "title": "Parts 25–28: OOP Complete", "desc": "Note and Tag as dataclasses with __post_init__ validation. NoteType as Enum. VaultStorage as context manager. Exporter ABC with __init_subclass__ auto-registration. InMemoryStorage and VaultStorage share interface." },
        { "title": "Part 29: Standard Library", "desc": "Counter for tag frequency. defaultdict for timeline grouping. itertools.islice for streaming limits. functools.lru_cache on parse_level. contextlib.suppress in error handling. pathlib.Path for all file operations. argparse for CLI. json for persistence." }
      ]
    },
    {
      "type": "h2",
      "text": "Extending PyVault: What to Build Next"
    },
    {
      "type": "p",
      "text": "PyVault as built is a foundation. Here are extensions that will deepen your Python mastery further — each one teaches something new while building on what you have."
    },
    {
      "type": "checklist",
      "items": [
        "Add SQLite backend: replace JSON storage with sqlite3. Teaches database fundamentals, SQL, and cursor context managers.",
        "Add encryption: encrypt the vault at rest using the standard library's hashlib and hmac for key derivation. Teaches security fundamentals.",
        "Add a TUI (terminal UI): use curses or the third-party rich library to build a navigable interface. Teaches terminal I/O and event loops.",
        "Add sync: sync vaults between machines using SFTP or an S3 bucket with boto3. Teaches async I/O and cloud storage APIs.",
        "Add AI search: integrate with a local embedding model (or OpenAI API) for semantic search. Teaches vector operations and API integration.",
        "Publish to PyPI: write a complete pyproject.toml, test suite, and README. Run python -m build and twine upload. Teaches the full Python packaging workflow."
      ]
    },
    {
      "type": "h2",
      "text": "The End — And the Beginning"
    },
    {
      "type": "p",
      "text": "You have reached the end of Python Unlocked: The Zero-to-Craft Series. Thirty parts. Hundreds of programs. One language, understood from the ground up. But this is not really an ending — it is the moment a different kind of learning begins. The learning that comes from building things, from reading other people's code, from contributing to open source, from teaching someone else what you have learned. Python was born from a desire to make programming enjoyable. If this series has done its job, you feel that enjoyment now. Not the enjoyment of completing exercises, but the deeper enjoyment of fluency — of reaching for a tool and finding it exactly where you expected, of recognizing patterns before they are pointed out, of reading a library's source code and understanding every line. You know the language. Now go build something with it."
    },
    {
      "type": "callout",
      "icon": "🏆",
      "text": "You completed Python Unlocked: The Zero-to-Craft Series. 30 parts. From Guido van Rossum's Christmas project to metaclasses and descriptors. From print('Hello') to a complete, installable CLI application. Python is not just a language you have learned. It is a tool you now own. The next line of code you write will be better for every line in this series. Go build something the world needs."
    },
    {
      "type": "cta",
      "text": "← Back to Python Unlocked Series",
      "href": "/tutorials/python-unlocked",
      "note": "Review any part · The series stays here forever · Share with someone learning Python"
    }
  ]
};

export default post;
