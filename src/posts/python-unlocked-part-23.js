const post = {
  "slug": "part-23-exception-handling",
  "seriesSlug": "python-unlocked",
  "partNumber": 23,
  "totalParts": 30,
  "title": "Exception Handling — Defensive Programming & Resilient Code (Part 23)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 24, 2026",
  "readTime": "26 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "try-except-else-finally: the full block. Exception hierarchy: built-in exceptions. Custom exceptions: inheritance, raise, from. Exception chaining with __cause__ and __context__. EAFP vs LBYL philosophy. Four complete programs.",
  "coverEmoji": "🛡️",
  "tags": [
    "Python", "Exception Handling", "try-except", "Custom Exceptions",
    "Exception Hierarchy", "EAFP", "LBYL", "Context Managers", "Python 3.12"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1980, Barbara Liskov and Alan Snyder introduced exception handling in CLU, arguing that error handling should be separated from normal control flow. Forty-six years later, in 2026, this principle remains the foundation of robust software. Exceptions are not bugs. They are the mechanism by which Python communicates that something unexpected has occurred — a missing file, a network timeout, a type mismatch, a permission denied. The difference between a script that crashes and a system that recovers is not the absence of errors. It is the quality of exception handling. In this part, we will explore the full depth of Python's exception machinery. You will master the complete try-except-else-finally block and understand when each clause executes. You will navigate the exception hierarchy and catch exceptions at the right level of specificity. You will build custom exception classes that carry context and meaning. You will chain exceptions with raise ... from to preserve debugging information. And you will internalize the EAFP philosophy — Easier to Ask for Forgiveness than Permission — that defines Pythonic error handling. By the end, your code will not just handle errors. It will anticipate them, recover from them, and communicate them clearly."
    },
    {
      "type": "h2",
      "text": "The Complete try-except-else-finally Block"
    },
    {
      "type": "p",
      "text": "The try statement is Python's primary error handling mechanism. It has four optional clauses: except catches exceptions, else runs if no exception occurred, finally runs regardless of outcome, and try itself defines the protected block. Understanding the execution flow of each clause is essential for writing correct cleanup code, resource management, and state recovery."
    },
    {
      "type": "code-block",
      "label": "try-except-else-finally Mastery",
      "code": `# === THE COMPLETE try-except-else-finally BLOCK ===
# Execution order: try -> [except if exception] -> [else if no exception] -> finally

# --- Basic try-except ---
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f'Caught: {type(e).__name__}: {e}')

# --- try-except with multiple exceptions ---
for value in [10, 'ten', [10]]:
    try:
        result = 10 / value
        print(f'10 / {value!r} = {result}')
    except (ZeroDivisionError, TypeError) as e:
        print(f'  Caught {type(e).__name__}: {e}')

# --- Catching specific vs general exceptions ---
# Always catch specific exceptions first, general ones last

try:
    # Simulate a complex operation
    raise ValueError('Invalid input')
except ValueError as e:
    print(f'\\nSpecific catch: {e}')
except Exception as e:
    print(f'General catch: {e}')  # Won't execute if ValueError caught

# --- else clause: runs ONLY if no exception occurred ---
print(f'\\nelse clause demonstration:')
for value in [2, 0]:
    try:
        result = 10 / value
    except ZeroDivisionError:
        print(f'  {value}: Division failed')
    else:
        print(f'  {value}: Success! Result = {result}')

# --- finally clause: ALWAYS runs (cleanup, resource release) ---
print(f'\\nfinally clause demonstration:')

def demo_finally(value):
    try:
        result = 10 / value
        return result  // finally runs BEFORE return!
    except ZeroDivisionError:
        print(f'  Exception caught')
        return -1  // finally still runs!
    finally:
        print(f'  finally: cleanup for value={value}')

print(f'  Result: {demo_finally(2)}')
print(f'  Result: {demo_finally(0)}')

# --- Full block: try-except-else-finally ---
print(f'\\nFull block execution:')

def process_data(data):
    try:
        print(f'  try: processing {data!r}')
        value = int(data)
    except ValueError as e:
        print(f'  except: Invalid data - {e}')
        return None
    else:
        print(f'  else: Conversion succeeded, value={value}')
        result = value * 2
    finally:
        print(f'  finally: Cleaning up resources')
    return result

for data in ['42', 'not_a_number']:
    print(f'Input: {data!r}')
    result = process_data(data)
    print(f'  Returned: {result}\\n')

# --- Bare except vs except Exception ---
# 'except:' catches EVERYTHING including KeyboardInterrupt and SystemExit
# 'except Exception:' catches all non-system-exiting exceptions

print(f'Exception hierarchy check:')
print(f'  KeyboardInterrupt base: {KeyboardInterrupt.__bases__}')
print(f'  SystemExit base: {SystemExit.__bases__}')
print(f'  ValueError base: {ValueError.__bases__}')

# --- try without except (finally only) ---
# Useful for guaranteed cleanup even when not handling exceptions

print(f'\\ntry-finally (no except):')
try:
    print(f'  Doing work...')
    x = 1 / 0
finally:
    print(f'  Cleanup always runs, exception propagates!')

print("\\ntry-except-else-finally mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Exception Hierarchy: Built-in Exceptions"
    },
    {
      "type": "p",
      "text": "Python's exceptions form a class hierarchy rooted at BaseException. Understanding this hierarchy allows you to catch exceptions at the appropriate level of specificity. Catching Exception handles most errors while allowing system-exiting exceptions (KeyboardInterrupt, SystemExit) to propagate. Catching specific exceptions like ValueError or FileNotFoundError provides precise error handling. And catching BaseException is almost always wrong — it prevents program termination."
    },
    {
      "type": "code-block",
      "label": "Exception Hierarchy Mastery",
      "code": `# === EXCEPTION HIERARCHY ===
# BaseException -> Exception -> [ArithmeticError, LookupError, OSError, ...]
#                        -> [ValueError, TypeError, KeyError, IndexError, ...]

# --- The hierarchy tree ---
import builtins

def print_exception_tree(cls, indent=0):
    print(f'  {"  "*indent}{cls.__name__}')
    for sub in cls.__subclasses__():
        print_exception_tree(sub, indent + 1)

print('Exception hierarchy (partial):')
print_exception_tree(BaseException)

# --- Common built-in exceptions ---
print(f'\\nCommon exceptions and their use cases:')

exceptions_demo = [
    ('ValueError', lambda: int('not_a_number')),
    ('TypeError', lambda: len(42)),
    ('KeyError', lambda: {}['missing']),
    ('IndexError', lambda: [1, 2][10]),
    ('FileNotFoundError', lambda: open('nonexistent_file.txt')),
    ('PermissionError', lambda: open('/root/protected', 'w')),
    ('ZeroDivisionError', lambda: 1/0),
    ('AttributeError', lambda: [].nonexistent_method),
    ('NameError', lambda: undefined_variable),
    ('RuntimeError', lambda: raise RuntimeError('Custom runtime error')),
]

for name, func in exceptions_demo:
    try:
        func()
    except Exception as e:
        if type(e).__name__ == name:
            print(f'  {name}: {e}')
        else:
            print(f'  {name}: Got {type(e).__name__} instead')
    except PermissionError:
        print(f'  {name}: Permission denied (expected on non-root systems)')

# --- Exception inheritance ---
print(f'\\nInheritance checks:')
print(f'  FileNotFoundError is OSError: {issubclass(FileNotFoundError, OSError)}')
print(f'  FileNotFoundError is Exception: {issubclass(FileNotFoundError, Exception)}')
print(f'  ValueError is LookupError: {issubclass(ValueError, LookupError)}')
print(f'  KeyError is LookupError: {issubclass(KeyError, LookupError)}')

# --- Catching parent catches children ---
print(f'\\nCatching OSError catches FileNotFoundError:')
try:
    open('does_not_exist.txt')
except OSError as e:
    print(f'  Caught as OSError: {type(e).__name__}: {e}')

# --- isinstance with exceptions ---
print(f'\\nUsing isinstance with exceptions:')
try:
    {}['missing']
except Exception as e:
    print(f'  isinstance(e, LookupError): {isinstance(e, LookupError)}')
    print(f'  isinstance(e, KeyError): {isinstance(e, KeyError)}')
    print(f'  isinstance(e, Exception): {isinstance(e, Exception)}')

# --- Exception args ---
print(f'\\nException arguments:')
try:
    raise ValueError('message', 42, 'extra')
except ValueError as e:
    print(f'  args: {e.args}')
    print(f'  str: {str(e)}')
    print(f'  repr: {repr(e)}')

# --- errno module for OSError codes ---
import errno
print(f'\\nOSError errno codes:')
print(f'  ENOENT (No such file): {errno.ENOENT}')
print(f'  EACCES (Permission denied): {errno.EACCES}')
print(f'  EEXIST (File exists): {errno.EEXIST}')

try:
    open('nonexistent.txt')
except OSError as e:
    print(f'  Error code: {e.errno} ({errno.errorcode.get(e.errno, "unknown")})')

print("\nException hierarchy mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Custom Exceptions: Inheritance, raise, and from"
    },
    {
      "type": "p",
      "text": "Built-in exceptions cover generic errors. But real applications need domain-specific exceptions that carry context — a DatabaseConnectionError that includes the host and port, a ValidationError that lists the failed fields. Custom exceptions inherit from Exception (or a more specific built-in), define their own attributes, and communicate failure in the language of the domain. The raise statement creates exceptions. The raise ... from syntax chains exceptions, preserving the original cause for debugging."
    },
    {
      "type": "code-block",
      "label": "Custom Exceptions Mastery",
      "code": `# === CUSTOM EXCEPTIONS ===

# --- Base custom exception ---
class APIError(Exception):
    """Base exception for API errors."""
    pass

class APIConnectionError(APIError):
    """Failed to connect to API."""
    
    def __init__(self, host, port, message='Connection failed'):
        self.host = host
        self.port = port
        self.message = message
        super().__init__(f'{message} to {host}:{port}')

class APIResponseError(APIError):
    """API returned an error response."""
    
    def __init__(self, status_code, response_body):
        self.status_code = status_code
        self.response_body = response_body
        super().__init__(f'HTTP {status_code}: {response_body[:100]}')

class APIRateLimitError(APIResponseError):
    """Hit rate limit."""
    
    def __init__(self, status_code, response_body, retry_after=60):
        super().__init__(status_code, response_body)
        self.retry_after = retry_after

# --- Using custom exceptions ---
print('Custom exceptions in action:')

def call_api(endpoint):
    if endpoint == '/timeout':
        raise APIConnectionError('api.example.com', 443, 'Timeout')
    elif endpoint == '/error':
        raise APIResponseError(500, 'Internal Server Error')
    elif endpoint == '/rate_limit':
        raise APIRateLimitError(429, 'Too many requests', retry_after=120)
    return {'status': 'ok'}

for endpoint in ['/timeout', '/error', '/rate_limit', '/success']:
    try:
        result = call_api(endpoint)
        print(f'  {endpoint}: {result}')
    except APIRateLimitError as e:
        print(f'  {endpoint}: Rate limited! Retry after {e.retry_after}s')
    except APIConnectionError as e:
        print(f'  {endpoint}: Connection failed to {e.host}:{e.port}')
    except APIResponseError as e:
        print(f'  {endpoint}: API error {e.status_code}')
    except APIError as e:
        print(f'  {endpoint}: Generic API error: {e}')

# --- raise statement ---
print(f'\\nraise statement:')

# Re-raise current exception (preserves traceback)
try:
    raise ValueError('Original error')
except ValueError:
    print(f'  Caught, re-raising...')
    # Re-raises the same ValueError with original traceback

# --- raise ... from: Exception chaining ---
print(f'\\nException chaining with raise ... from:')

import json

class ConfigError(Exception):
    """Configuration error."""
    pass

def parse_config_file(path):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except FileNotFoundError as e:
        raise ConfigError(f'Config file not found: {path}') from e
    except json.JSONDecodeError as e:
        raise ConfigError(f'Invalid JSON in config: {path}') from e

# Chain demonstration
try:
    parse_config_file('missing_config.json')
except ConfigError as e:
    print(f'  ConfigError: {e}')
    print(f'  __cause__: {e.__cause__}')
    print(f'  __cause__ type: {type(e.__cause__).__name__}')

# --- Implicit chaining (no from) ---
print(f'\\nImplicit chaining (raise inside except):')

try:
    try:
        int('bad')
    except ValueError as e:
        raise RuntimeError('Conversion failed')  # Implicit chain
except RuntimeError as e:
    print(f'  RuntimeError: {e}')
    print(f'  __context__: {e.__context__}')
    print(f'  __context__ type: {type(e.__context__).__name__}')
    print(f'  __suppress_context__: {e.__suppress_context__}')

# --- Explicit vs implicit chaining ---
print(f'\\nExplicit vs implicit:')

# Explicit (recommended): preserves intent
try:
    try:
        open('missing.txt')
    except FileNotFoundError as e:
        raise RuntimeError('Cannot load data') from e
except RuntimeError as e:
    print(f'  Explicit chain - __cause__: {type(e.__cause__).__name__}')
    print(f'  __context__: {type(e.__context__).__name__ if e.__context__ else None}')

# Suppress implicit context
try:
    try:
        int('bad')
    except ValueError:
        raise RuntimeError('Failed') from None  # Suppress context
except RuntimeError as e:
    print(f'  Suppressed context - __cause__: {e.__cause__}')
    print(f'  __context__: {e.__context__}')

# --- Exception groups (Python 3.11+) ---
print(f'\\nExceptionGroup (Python 3.11+):')
try:
    raise ExceptionGroup('multiple errors', [
        ValueError('Invalid value'),
        TypeError('Wrong type'),
        KeyError('missing_key')
    ])
except* ValueError as eg:
    print(f'  Caught ValueErrors: {len(eg.exceptions)}')
except* TypeError as eg:
    print(f'  Caught TypeErrors: {len(eg.exceptions)}')
except* KeyError as eg:
    print(f'  Caught KeyErrors: {len(eg.exceptions)}')

print("\nCustom exceptions mastery complete!")`
    },
    {
      "type": "h2",
      "text": "EAFP vs LBYL: Two Philosophies of Error Handling"
    },
    {
      "type": "p",
      "text": "Python has two approaches to error handling: LBYL (Look Before You Leap) checks conditions before acting, while EAFP (Easier to Ask for Forgiveness than Permission) assumes success and handles exceptions if they occur. Python strongly favors EAFP because it avoids race conditions, handles polymorphic types naturally, and produces cleaner code. The dict.get() method is LBYL. The try/except KeyError pattern is EAFP. Both are valid, but EAFP is more Pythonic."
    },
    {
      "type": "code-block",
      "label": "EAFP vs LBYL Mastery",
      "code": `# === EAFP vs LBYL ===
# EAFP = Easier to Ask Forgiveness than Permission
# LBYL = Look Before You Leap

# --- Example 1: Dictionary access ---

# LBYL: Check if key exists first
def get_value_lbyl(data, key):
    if key in data:
        return data[key]
    return None

# EAFP: Try to access, handle exception
def get_value_eafp(data, key):
    try:
        return data[key]
    except KeyError:
        return None

data = {'a': 1, 'b': 2}
print(f'Dictionary access:')
print(f'  LBYL: {get_value_lbyl(data, "c")}')
print(f'  EAFP: {get_value_eafp(data, "c")}')

# --- Example 2: File operations ---
import os

# LBYL: Check if file exists and is readable
def read_file_lbyl(path):
    if os.path.exists(path) and os.access(path, os.R_OK):
        with open(path, 'r') as f:
            return f.read()
    return None

# EAFP: Just try to open it
def read_file_eafp(path):
    try:
        with open(path, 'r') as f:
            return f.read()
    except (FileNotFoundError, PermissionError):
        return None

# Create test file
with open('test_read.txt', 'w') as f:
    f.write('Hello')

print(f'\\nFile reading:')
print(f'  LBYL: {read_file_lbyl("test_read.txt")[:10]}...')
print(f'  EAFP: {read_file_eafp("test_read.txt")[:10]}...')
print(f'  LBYL missing: {read_file_lbyl("missing.txt")}')
print(f'  EAFP missing: {read_file_eafp("missing.txt")}')

# --- Race condition: LBYL is vulnerable ---
print(f'\\nRace condition problem:')

def delete_if_exists_lbyl(path):
    # TOCTOU vulnerability: Time-of-check to time-of-use
    if os.path.exists(path):  # Check
        # Another process could delete the file here!
        os.remove(path)  # Use
        return True
    return False

def delete_if_exists_eafp(path):
    try:
        os.remove(path)
        return True
    except FileNotFoundError:
        return False

# --- Example 3: Type checking ---

# LBYL: Check type before operation
def process_lbyl(value):
    if isinstance(value, str):
        return value.upper()
    elif isinstance(value, (int, float)):
        return value * 2
    else:
        return None

# EAFP: Try the operation, handle if it fails
def process_eafp(value):
    try:
        return value.upper()
    except AttributeError:
        try:
            return value * 2
        except TypeError:
            return None

print(f'\\nType handling:')
for val in ['hello', 42, [1, 2]]:
    print(f'  {val!r}: LBYL={process_lbyl(val)}, EAFP={process_eafp(val)}')

# --- Example 4: Duck typing (EAFP is essential) ---
print(f'\\nDuck typing with EAFP:')

def get_length(obj):
    """Works with any object that has a length."""
    try:
        return len(obj)
    except TypeError:
        return 0

for item in ['string', [1, 2, 3], {'a': 1}, 42, None]:
    print(f'  {item!r}: length = {get_length(item)}')

# --- When LBYL is appropriate ---
print(f'\\nWhen LBYL makes sense:')

# 1. When the check is cheap and the exception is expensive
# 2. When checking is the primary logic (not error handling)
# 3. When multiple operations depend on the same precondition

def expensive_operation():
    import time
    time.sleep(0.1)
    return 42

# LBYL is better here: avoid expensive exception handling
flag = True
if flag:  # Cheap check
    result = expensive_operation()
else:
    result = None

# --- EAFP with finally for cleanup ---
print(f'\\nEAFP with cleanup:')

def process_with_cleanup(data):
    resource = {'open': True, 'data': None}
    try:
        resource['data'] = data['key']
    except KeyError:
        print(f'  Data missing')
        return None
    else:
        print(f'  Processing: {resource["data"]}')
        return resource['data']
    finally:
        resource['open'] = False
        print(f'  Resource closed: {resource}')

process_with_cleanup({'key': 'value'})
process_with_cleanup({})

# Cleanup
os.unlink('test_read.txt')

print("\nEAFP vs LBYL mastery complete!")`
    },
    {
      "type": "h2",
      "text": "Programs: Logic in Action"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build four programs that use exception handling, custom exceptions, chaining, and EAFP principles to solve real problems."
    },
    {
      "type": "code-block",
      "label": "Program 1: Robust Calculator",
      "code": `"""
Program 1: Robust Calculator
A calculator that handles all edge cases gracefully.
Demonstrates exception handling, custom exceptions, and EAFP.
"""

import math
import operator
from typing import Union, List
from dataclasses import dataclass

Number = Union[int, float]

class CalculatorError(Exception):
    """Base calculator exception."""
    pass

class DivisionByZeroError(CalculatorError):
    """Attempted division by zero."""
    pass

class InvalidOperationError(CalculatorError):
    """Unknown operation requested."""
    
    def __init__(self, operation, valid_ops):
        self.operation = operation
        self.valid_ops = valid_ops
        super().__init__(f'Unknown operation: {operation!r}. Valid: {valid_ops}')

class DomainError(CalculatorError):
    """Mathematical domain error."""
    pass

class CalculationHistory:
    """Track calculation history."""
    
    def __init__(self, max_size=100):
        self._history: List[dict] = []
        self._max_size = max_size
    
    def add(self, operation, operands, result, error=None):
        entry = {
            'operation': operation,
            'operands': operands,
            'result': result,
            'error': str(error) if error else None
        }
        self._history.append(entry)
        if len(self._history) > self._max_size:
            self._history.pop(0)
    
    def get_last(self, n=5):
        return self._history[-n:]
    
    def get_errors(self):
        return [e for e in self._history if e['error']]

class RobustCalculator:
    """Calculator with comprehensive error handling."""
    
    def __init__(self):
        self.history = CalculationHistory()
        self._operations = {
            '+': operator.add,
            '-': operator.sub,
            '*': operator.mul,
            '/': self._safe_divide,
            '**': operator.pow,
            'sqrt': self._safe_sqrt,
            'log': self._safe_log,
            'sin': self._safe_trig(math.sin),
            'cos': self._safe_trig(math.cos),
        }
    
    def _safe_divide(self, a, b):
        try:
            return a / b
        except ZeroDivisionError as e:
            raise DivisionByZeroError(f'Cannot divide {a} by zero') from e
    
    def _safe_sqrt(self, a, _=None):
        try:
            return math.sqrt(a)
        except ValueError as e:
            raise DomainError(f'Cannot compute square root of {a}') from e
    
    def _safe_log(self, a, _=None):
        try:
            return math.log(a)
        except ValueError as e:
            raise DomainError(f'Cannot compute logarithm of {a}') from e
    
    def _safe_trig(self, func):
        def wrapper(a, _=None):
            try:
                return func(math.radians(a))
            except TypeError as e:
                raise DomainError(f'Invalid input for trigonometric function: {a}') from e
        return wrapper
    
    def calculate(self, operation: str, *operands: Number) -> Number:
        """Perform calculation with full error handling."""
        try:
            if operation not in self._operations:
                raise InvalidOperationError(operation, list(self._operations.keys()))
            
            func = self._operations[operation]
            
            # Validate operands are numbers (EAFP)
            for op in operands:
                if not isinstance(op, (int, float)):
                    raise TypeError(f'Operand {op!r} is not a number')
            
            if len(operands) == 1:
                result = func(operands[0])
            elif len(operands) == 2:
                result = func(operands[0], operands[1])
            else:
                raise CalculatorError(f'Operation {operation} requires 1 or 2 operands, got {len(operands)}')
            
            self.history.add(operation, operands, result)
            return result
            
        except CalculatorError as e:
            self.history.add(operation, operands, None, e)
            raise
        except Exception as e:
            self.history.add(operation, operands, None, e)
            raise CalculatorError(f'Unexpected error: {e}') from e
    
    def batch_calculate(self, calculations: List[tuple]) -> List[dict]:
        """Process multiple calculations, collecting results and errors."""
        results = []
        for calc in calculations:
            try:
                op, *args = calc
                result = self.calculate(op, *args)
                results.append({'operation': calc, 'result': result, 'success': True})
            except CalculatorError as e:
                results.append({'operation': calc, 'error': str(e), 'success': False})
        return results

def main():
    print('=' * 50)
    print('ROBUST CALCULATOR')
    print('=' * 50)

    calc = RobustCalculator()
    
    # Successful calculations
    print(f'\\nSuccessful calculations:')
    for op, a, b in [('+', 10, 5), ('*', 7, 3), ('**', 2, 10), ('sqrt', 16, None)]:
        try:
            if b is None:
                result = calc.calculate(op, a)
            else:
                result = calc.calculate(op, a, b)
            print(f'  {op}({a}, {b}): {result}')
        except CalculatorError as e:
            print(f'  {op}({a}, {b}): ERROR - {e}')
    
    # Error cases
    print(f'\\nError handling:')
    for op, a, b in [('/', 10, 0), ('sqrt', -4, None), ('log', 0, None), ('unknown', 1, 2)]:
        try:
            if b is None:
                result = calc.calculate(op, a)
            else:
                result = calc.calculate(op, a, b)
            print(f'  {op}({a}, {b}): {result}')
        except CalculatorError as e:
            print(f'  {op}({a}, {b}): {type(e).__name__}: {e}')
    
    # Batch processing
    print(f'\\nBatch processing:')
    batch = [
        ('+', 10, 5),
        ('/', 10, 0),
        ('*', 3, 4),
        ('sqrt', -9, None),
        ('unknown', 1, 2),
    ]
    results = calc.batch_calculate(batch)
    for r in results:
        status = 'OK' if r['success'] else 'FAIL'
        print(f'  {r["operation"]}: {status} = {r.get("result", r.get("error"))}')
    
    # History
    print(f'\\nCalculation history (last 5):')
    for entry in calc.history.get_last(5):
        status = 'OK' if entry['error'] is None else f'ERROR: {entry["error"]}'
        print(f'  {entry["operation"]}: {status}')
    
    print(f'\\nTotal errors: {len(calc.history.get_errors())}')
    
    print('=' * 50)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: File Opener with Retries",
      "code": `"""
Program 2: File Opener with Retries
Opens files with automatic retry, exponential backoff, and detailed error context.
Demonstrates exception chaining, custom exceptions, and EAFP with cleanup.
"""

import time
import errno
from pathlib import Path
from typing import Optional, Callable
from dataclasses import dataclass
from enum import Enum, auto

class FileStatus(Enum):
    SUCCESS = auto()
    NOT_FOUND = auto()
    PERMISSION_DENIED = auto()
    BUSY = auto()
    TIMEOUT = auto()
    UNKNOWN_ERROR = auto()

@dataclass
class FileResult:
    """Result of file opening attempt."""
    status: FileStatus
    path: str
    content: Optional[str] = None
    attempts: int = 0
    elapsed_time: float = 0.0
    error_message: Optional[str] = None
    original_error: Optional[Exception] = None

class FileOpenError(Exception):
    """Base file opening error."""
    pass

class FileNotAccessibleError(FileOpenError):
    """File exists but cannot be accessed."""
    pass

class FileBusyError(FileOpenError):
    """File is locked by another process."""
    
    def __init__(self, path, pid=None):
        self.pid = pid
        super().__init__(f'File {path} is locked by process {pid}')

class RetryExhaustedError(FileOpenError):
    """All retry attempts exhausted."""
    pass

class RobustFileOpener:
    """Open files with retry logic and comprehensive error handling."""
    
    def __init__(self,
                 max_retries: int = 3,
                 base_delay: float = 0.5,
                 max_delay: float = 5.0,
                 backoff_factor: float = 2.0,
                 on_retry: Optional[Callable] = None):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor
        self.on_retry = on_retry
    
    def _calculate_delay(self, attempt: int) -> float:
        """Calculate delay with exponential backoff and jitter."""
        delay = self.base_delay * (self.backoff_factor ** attempt)
        # Add small jitter to prevent thundering herd
        import random
        jitter = random.uniform(0, delay * 0.1)
        return min(delay + jitter, self.max_delay)
    
    def open(self, path: str, mode: str = 'r', encoding: str = 'utf-8') -> FileResult:
        """Open file with retry logic."""
        start_time = time.perf_counter()
        
        for attempt in range(self.max_retries + 1):
            try:
                with open(path, mode, encoding=encoding) as f:
                    content = f.read() if 'r' in mode else None
                
                elapsed = time.perf_counter() - start_time
                return FileResult(
                    status=FileStatus.SUCCESS,
                    path=path,
                    content=content,
                    attempts=attempt + 1,
                    elapsed_time=elapsed
                )
                
            except FileNotFoundError as e:
                elapsed = time.perf_counter() - start_time
                return FileResult(
                    status=FileStatus.NOT_FOUND,
                    path=path,
                    attempts=attempt + 1,
                    elapsed_time=elapsed,
                    error_message=f'File not found: {path}',
                    original_error=e
                )
                
            except PermissionError as e:
                elapsed = time.perf_counter() - start_time
                return FileResult(
                    status=FileStatus.PERMISSION_DENIED,
                    path=path,
                    attempts=attempt + 1,
                    elapsed_time=elapsed,
                    error_message=f'Permission denied: {path}',
                    original_error=e
                )
                
            except OSError as e:
                # Check if file is busy/locked
                if e.errno == errno.EBUSY or e.errno == errno.EAGAIN:
                    if attempt < self.max_retries:
                        delay = self._calculate_delay(attempt)
                        if self.on_retry:
                            self.on_retry(attempt + 1, self.max_retries + 1, path, delay, e)
                        time.sleep(delay)
                        continue
                    else:
                        elapsed = time.perf_counter() - start_time
                        raise RetryExhaustedError(
                            f'File {path} busy after {self.max_retries + 1} attempts'
                        ) from e
                else:
                    raise FileNotAccessibleError(
                        f'Cannot access {path}: {e}'
                    ) from e
                    
            except Exception as e:
                raise FileOpenError(f'Unexpected error opening {path}') from e
        
        # Should never reach here
        elapsed = time.perf_counter() - start_time
        return FileResult(
            status=FileStatus.UNKNOWN_ERROR,
            path=path,
            attempts=self.max_retries + 1,
            elapsed_time=elapsed
        )
    
    def open_multiple(self, paths: List[str], mode: str = 'r') -> List[FileResult]:
        """Open multiple files, collecting results."""
        results = []
        for path in paths:
            try:
                result = self.open(path, mode)
            except FileOpenError as e:
                result = FileResult(
                    status=FileStatus.UNKNOWN_ERROR,
                    path=path,
                    error_message=str(e),
                    original_error=e
                )
            results.append(result)
        return results

def main():
    print('=' * 50)
    print('FILE OPENER WITH RETRIES')
    print('=' * 50)

    # Create test files
    Path('readable.txt').write_text('Hello, World!')
    
    opener = RobustFileOpener(
        max_retries=2,
        base_delay=0.1,
        on_retry=lambda attempt, total, path, delay, error: 
            print(f'  Retry {attempt}/{total} for {path} after {delay:.2f}s: {error}')
    )
    
    # Successful open
    print(f'\\nOpening existing file:')
    result = opener.open('readable.txt')
    print(f'  Status: {result.status.name}')
    print(f'  Content: {result.content[:20]}...')
    print(f'  Attempts: {result.attempts}')
    print(f'  Time: {result.elapsed_time:.4f}s')
    
    # Missing file
    print(f'\\nOpening missing file:')
    result = opener.open('missing.txt')
    print(f'  Status: {result.status.name}')
    print(f'  Error: {result.error_message}')
    print(f'  Original: {type(result.original_error).__name__}')
    
    # Multiple files
    print(f'\\nOpening multiple files:')
    results = opener.open_multiple(['readable.txt', 'missing.txt', 'readable.txt'])
    for r in results:
        print(f'  {r.path}: {r.status.name}')
    
    # Cleanup
    Path('readable.txt').unlink()
    
    print('=' * 50)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Custom Exception Hierarchy",
      "code": `"""
Program 3: Custom Exception Hierarchy
A complete domain-specific exception hierarchy for a data processing pipeline.
Demonstrates inheritance, exception attributes, and context-rich error reporting.
"""

from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from enum import Enum, auto

class ValidationSeverity(Enum):
    WARNING = auto()
    ERROR = auto()
    CRITICAL = auto()

@dataclass
class ValidationIssue:
    """A single validation issue."""
    field: str
    message: str
    severity: ValidationSeverity
    expected: Any = None
    actual: Any = None

# === Exception Hierarchy ===

class DataPipelineError(Exception):
    """Base exception for data pipeline."""
    
    def __init__(self, message, stage=None, record_id=None):
        self.stage = stage
        self.record_id = record_id
        super().__init__(message)
    
    def __str__(self):
        parts = [self.args[0]]
        if self.stage:
            parts.append(f'[stage={self.stage}]')
        if self.record_id:
            parts.append(f'[record={self.record_id}]')
        return ' '.join(parts)

class ValidationError(DataPipelineError):
    """Data validation failed."""
    
    def __init__(self, message, issues: List[ValidationIssue], **kwargs):
        self.issues = issues
        super().__init__(message, **kwargs)
    
    def get_critical_issues(self):
        return [i for i in self.issues if i.severity == ValidationSeverity.CRITICAL]
    
    def get_field_issues(self, field_name: str):
        return [i for i in self.issues if i.field == field_name]

class TransformationError(DataPipelineError):
    """Data transformation failed."""
    
    def __init__(self, message, transformation_name, input_data, **kwargs):
        self.transformation_name = transformation_name
        self.input_data = input_data
        super().__init__(message, **kwargs)

class StorageError(DataPipelineError):
    """Data storage operation failed."""
    
    def __init__(self, message, storage_type, operation, **kwargs):
        self.storage_type = storage_type
        self.operation = operation
        super().__init__(message, **kwargs)

class ConnectionError(DataPipelineError):
    """Connection to external system failed."""
    
    def __init__(self, message, endpoint, retry_count=0, **kwargs):
        self.endpoint = endpoint
        self.retry_count = retry_count
        super().__init__(message, **kwargs)

class PipelineAbortedError(DataPipelineError):
    """Pipeline was aborted due to unrecoverable error."""
    
    def __init__(self, message, errors: List[Exception], **kwargs):
        self.errors = errors
        super().__init__(message, **kwargs)

# === Data Pipeline Implementation ===

class DataPipeline:
    """Data processing pipeline with comprehensive error handling."""
    
    def __init__(self):
        self.errors: List[DataPipelineError] = []
        self.processed = 0
        self.failed = 0
    
    def validate(self, record: dict) -> dict:
        """Validate a record, raising ValidationError on failure."""
        issues = []
        
        # Check required fields
        required = ['id', 'name', 'email', 'age']
        for field in required:
            if field not in record or record[field] is None:
                issues.append(ValidationIssue(
                    field=field,
                    message=f'Missing required field: {field}',
                    severity=ValidationSeverity.CRITICAL
                ))
        
        # Validate age
        if 'age' in record and record['age'] is not None:
            try:
                age = int(record['age'])
                if age < 0 or age > 150:
                    issues.append(ValidationIssue(
                        field='age',
                        message=f'Age {age} out of range [0, 150]',
                        severity=ValidationSeverity.ERROR,
                        expected='0-150',
                        actual=age
                    ))
            except (ValueError, TypeError):
                issues.append(ValidationIssue(
                    field='age',
                    message=f'Age must be numeric, got {record["age"]!r}',
                    severity=ValidationSeverity.ERROR,
                    expected='integer',
                    actual=record['age']
                ))
        
        # Validate email format (simple)
        if 'email' in record and record['email']:
            if '@' not in record['email']:
                issues.append(ValidationIssue(
                    field='email',
                    message=f'Invalid email format: {record["email"]}',
                    severity=ValidationSeverity.ERROR,
                    expected='valid email',
                    actual=record['email']
                ))
        
        if issues:
            raise ValidationError(
                f'Validation failed for record {record.get("id", "unknown")}',
                issues=issues,
                stage='validation',
                record_id=record.get('id')
            )
        
        return record
    
    def transform(self, record: dict) -> dict:
        """Transform a validated record."""
        try:
            result = {
                'id': record['id'],
                'name': record['name'].strip().title(),
                'email': record['email'].lower(),
                'age': int(record['age']),
                'category': 'adult' if int(record['age']) >= 18 else 'minor'
            }
            return result
        except (KeyError, ValueError, AttributeError) as e:
            raise TransformationError(
                f'Transformation failed: {e}',
                transformation_name='standardize',
                input_data=record,
                stage='transformation',
                record_id=record.get('id')
            ) from e
    
    def store(self, record: dict) -> bool:
        """Simulate storing a record."""
        # Simulate occasional storage failures
        if record['id'] == 'error':
            raise StorageError(
                'Database connection lost',
                storage_type='postgresql',
                operation='INSERT',
                stage='storage',
                record_id=record['id']
            )
        return True
    
    def process_record(self, record: dict) -> Optional[dict]:
        """Process a single record through the pipeline."""
        try:
            validated = self.validate(record)
            transformed = self.transform(validated)
            self.store(transformed)
            self.processed += 1
            return transformed
            
        except ValidationError as e:
            self.failed += 1
            self.errors.append(e)
            print(f'  Validation failed: {e}')
            for issue in e.issues:
                print(f'    - {issue.field}: {issue.message} ({issue.severity.name})')
            return None
            
        except TransformationError as e:
            self.failed += 1
            self.errors.append(e)
            print(f'  Transformation failed: {e}')
            print(f'    Input: {e.input_data}')
            return None
            
        except StorageError as e:
            self.failed += 1
            self.errors.append(e)
            print(f'  Storage failed: {e}')
            print(f'    Storage: {e.storage_type}, Operation: {e.operation}')
            return None
    
    def process_batch(self, records: List[dict]) -> List[dict]:
        """Process a batch of records."""
        results = []
        for record in records:
            result = self.process_record(record)
            if result:
                results.append(result)
        
        if self.failed > len(records) * 0.5:
            raise PipelineAbortedError(
                f'Pipeline aborted: {self.failed}/{len(records)} records failed',
                errors=self.errors,
                stage='batch_processing'
            )
        
        return results

def main():
    print('=' * 50)
    print('CUSTOM EXCEPTION HIERARCHY')
    print('=' * 50)

    pipeline = DataPipeline()
    
    test_records = [
        {'id': '1', 'name': 'alice', 'email': 'alice@example.com', 'age': '25'},
        {'id': '2', 'name': 'bob', 'email': 'invalid-email', 'age': '200'},
        {'id': '3', 'name': 'charlie', 'email': 'charlie@test.com', 'age': 'not_a_number'},
        {'id': '4', 'name': 'diana', 'email': 'diana@example.com', 'age': '17'},
        {'id': 'error', 'name': 'error', 'email': 'error@test.com', 'age': '30'},
        {'id': '6', 'name': 'eve', 'email': 'eve@example.com', 'age': '42'},
    ]
    
    print(f'\\nProcessing {len(test_records)} records:')
    try:
        results = pipeline.process_batch(test_records)
        print(f'\\nResults: {len(results)} succeeded, {pipeline.failed} failed')
        for r in results:
            print(f'  {r["id"]}: {r["name"]}, {r["email"]}, age={r["age"]}, category={r["category"]}')
    except PipelineAbortedError as e:
        print(f'\\nPipeline aborted: {e}')
        print(f'  Errors collected: {len(e.errors)}')
        for err in e.errors:
            print(f'    - {type(err).__name__}: {err}')
    
    print(f'\\nException hierarchy:')
    print(f'  PipelineAbortedError -> DataPipelineError -> Exception')
    print(f'  ValidationError -> DataPipelineError -> Exception')
    print(f'  TransformationError -> DataPipelineError -> Exception')
    print(f'  StorageError -> DataPipelineError -> Exception')
    
    print('=' * 50)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Context Manager from Scratch",
      "code": `"""
Program 4: Context Manager from Scratch
Build context managers using both class-based and generator-based approaches.
Demonstrates __enter__, __exit__, @contextmanager, and exception handling in context managers.
"""

import time
import traceback
from typing import Optional, Type
from contextlib import contextmanager
from dataclasses import dataclass
from enum import Enum, auto

class TransactionStatus(Enum):
    PENDING = auto()
    COMMITTED = auto()
    ROLLED_BACK = auto()
    FAILED = auto()

@dataclass
class TransactionResult:
    status: TransactionStatus
    operations: int
    error: Optional[Exception] = None

# === Class-based Context Manager ===

class DatabaseTransaction:
    """Class-based context manager for database transactions."""
    
    def __init__(self, db_name: str, auto_commit: bool = True):
        self.db_name = db_name
        self.auto_commit = auto_commit
        self.operations = 0
        self._status = TransactionStatus.PENDING
        self._error = None
    
    def __enter__(self):
        print(f'  [DB] Starting transaction on {self.db_name}')
        self._start_time = time.perf_counter()
        return self
    
    def execute(self, operation: str):
        """Simulate executing a database operation."""
        if self._status != TransactionStatus.PENDING:
            raise RuntimeError('Transaction is not active')
        self.operations += 1
        print(f'  [DB] Executed: {operation}')
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.perf_counter() - self._start_time
        
        if exc_type is not None:
            # Exception occurred inside with block
            self._status = TransactionStatus.FAILED
            self._error = exc_val
            print(f'  [DB] Exception detected: {exc_type.__name__}: {exc_val}')
            print(f'  [DB] Rolling back {self.operations} operations')
            self._status = TransactionStatus.ROLLED_BACK
            
            # Suppress certain exceptions (return True)
            if exc_type is ValueError:
                print(f'  [DB] Suppressing ValueError')
                return True  # Suppress the exception
            
            # Let other exceptions propagate
            return False
        else:
            # No exception
            if self.auto_commit:
                print(f'  [DB] Committing {self.operations} operations')
                self._status = TransactionStatus.COMMITTED
            else:
                print(f'  [DB] Auto-commit disabled, leaving pending')
        
        print(f'  [DB] Transaction completed in {elapsed:.4f}s')
        return False
    
    @property
    def result(self):
        return TransactionResult(
            status=self._status,
            operations=self.operations,
            error=self._error
        )

# === Generator-based Context Manager ===

@contextmanager
def timed_execution(label: str = 'Operation'):
    """Generator-based context manager for timing execution."""
    start = time.perf_counter()
    print(f'  [Timer] Starting: {label}')
    try:
        yield  # Control passes to the with block
    except Exception as e:
        elapsed = time.perf_counter() - start
        print(f'  [Timer] FAILED after {elapsed:.4f}s: {type(e).__name__}: {e}')
        raise  # Re-raise the exception
    else:
        elapsed = time.perf_counter() - start
        print(f'  [Timer] Completed in {elapsed:.4f}s')

@contextmanager
def resource_pool(resources: list, max_borrow: int = 1):
    """Context manager that borrows resources from a pool."""
    borrowed = []
    try:
        for _ in range(max_borrow):
            if not resources:
                raise RuntimeError('Resource pool exhausted')
            resource = resources.pop()
            borrowed.append(resource)
            print(f'  [Pool] Borrowed: {resource}')
        yield borrowed
    except Exception:
        raise
    finally:
        # Return borrowed resources to pool
        for resource in borrowed:
            resources.append(resource)
            print(f'  [Pool] Returned: {resource}')

@contextmanager
def retry_context(max_attempts: int = 3, exceptions: tuple = (Exception,)):
    """Context manager that retries the block on specified exceptions."""
    last_exception = None
    for attempt in range(max_attempts):
        try:
            yield attempt
            return  # Success, exit context manager
        except exceptions as e:
            last_exception = e
            print(f'  [Retry] Attempt {attempt + 1} failed: {e}')
            if attempt < max_attempts - 1:
                wait = 0.1 * (2 ** attempt)
                print(f'  [Retry] Waiting {wait:.2f}s...')
                time.sleep(wait)
            else:
                print(f'  [Retry] All {max_attempts} attempts exhausted')
                raise last_exception

# === Nested Context Managers ===

@contextmanager
def logging_context(logger_name: str):
    """Context manager that logs entry and exit."""
    print(f'  [{logger_name}] Entering context')
    try:
        yield logger_name
    finally:
        print(f'  [{logger_name}] Exiting context')

def main():
    print('=' * 50)
    print('CONTEXT MANAGER FROM SCRATCH')
    print('=' * 50)

    # --- Class-based context manager ---
    print(f'\\n1. Database Transaction (success):')
    with DatabaseTransaction('production_db') as tx:
        tx.execute('INSERT INTO users (name) VALUES ("Alice")')
        tx.execute('UPDATE stats SET count = count + 1')
    print(f'  Result: {tx.result.status.name}, {tx.result.operations} ops')
    
    print(f'\\n2. Database Transaction (with error, suppressed):')
    with DatabaseTransaction('production_db') as tx:
        tx.execute('INSERT INTO users (name) VALUES ("Bob")')
        raise ValueError('Simulated validation error')  # Will be suppressed
    print(f'  Result: {tx.result.status.name}, {tx.result.operations} ops')
    
    print(f'\\n3. Database Transaction (with error, propagated):')
    try:
        with DatabaseTransaction('production_db') as tx:
            tx.execute('INSERT INTO users (name) VALUES ("Charlie")')
            raise RuntimeError('Simulated system error')  # Will propagate
    except RuntimeError as e:
        print(f'  Caught outside: {e}')
    
    # --- Generator-based context manager ---
    print(f'\\n4. Timed Execution (success):')
    with timed_execution('Data Processing'):
        time.sleep(0.05)
        print(f'  Doing work...')
    
    print(f'\\n5. Timed Execution (failure):')
    try:
        with timed_execution('Risky Operation'):
            raise ValueError('Something went wrong')
    except ValueError:
        print(f'  Exception propagated to caller')
    
    # --- Resource pool ---
    print(f'\\n6. Resource Pool:')
    pool = ['connection_1', 'connection_2', 'connection_3']
    print(f'  Pool before: {pool}')
    with resource_pool(pool, max_borrow=2) as borrowed:
        print(f'  Using: {borrowed}')
    print(f'  Pool after: {pool}')
    
    # --- Retry context ---
    print(f'\\n7. Retry Context:')
    attempt_count = 0
    def flaky_operation():
        nonlocal attempt_count
        attempt_count += 1
        if attempt_count < 3:
            raise ConnectionError('Network timeout')
        print(f'  Success on attempt {attempt_count}')
    
    with retry_context(max_attempts=3, exceptions=(ConnectionError,)):
        flaky_operation()
    
    # --- Nested context managers ---
    print(f'\\n8. Nested Context Managers:')
    with logging_context('Outer'):
        with logging_context('Inner'):
            with timed_execution('Nested Work'):
                print(f'  Performing nested work')
    
    # --- Context manager with exception info ---
    print(f'\\n9. Exception Information in __exit__:')
    
    class ExceptionInspector:
        def __enter__(self):
            return self
        
        def __exit__(self, exc_type, exc_val, exc_tb):
            if exc_type:
                print(f'  Exception type: {exc_type.__name__}')
                print(f'  Exception value: {exc_val}')
                print(f'  Has traceback: {exc_tb is not None}')
                # Print traceback summary
                tb_lines = traceback.format_exception(exc_type, exc_val, exc_tb)
                print(f'  Traceback lines: {len(tb_lines)}')
            return False  # Propagate
    
    try:
        with ExceptionInspector():
            raise ValueError('Test exception')
    except ValueError:
        pass
    
    print('=' * 50)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "quiz",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 24. 4/5 correct means you have mastered exception handling."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Write a complete try-except-else-finally block. Explain when each clause executes. What happens if you return from inside the try block? Does finally still execute? Demonstrate with code.",
        "Q2: What is the difference between except Exception and a bare except: clause? Why is except: dangerous? Write code that catches KeyboardInterrupt with a bare except and explain why this is wrong.",
        "Q3: Write a custom exception hierarchy for a web API client: APIError (base), ConnectionError, TimeoutError, and ResponseError (with status_code attribute). Demonstrate catching the base class to handle all API errors, while still accessing specific attributes for specific errors.",
        "Q4: What is the difference between raise e and raise? What does raise NewException from e do? Write code that demonstrates exception chaining with raise ... from and show the difference between __cause__ and __context__.",
        "Q5: Explain EAFP vs LBYL with a concrete example. Write the same operation using both approaches. When is EAFP preferred in Python? When might LBYL be better? Give a scenario for each."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: try executes the protected block. except runs if a matching exception occurs. else runs if no exception occurred in try. finally always runs, regardless of exceptions. If you return from try, finally still executes before the return value is passed to the caller. If you return from except, finally still executes. If finally contains a return, it overrides any previous return value. A2: except Exception catches all non-system-exiting exceptions. A bare except: catches EVERYTHING including BaseException subclasses like KeyboardInterrupt (Ctrl+C), SystemExit (sys.exit()), and GeneratorExit. This prevents the user from interrupting the program and breaks expected behavior. Always use except Exception: or more specific exceptions. A3: class APIError(Exception): pass. class ConnectionError(APIError): def __init__(self, host, message): self.host = host; super().__init__(message). class TimeoutError(ConnectionError): def __init__(self, host, timeout): self.timeout = timeout; super().__init__(host, f'Timeout after {timeout}s'). class ResponseError(APIError): def __init__(self, status_code, body): self.status_code = status_code; self.body = body; super().__init__(f'HTTP {status_code}'). Catching APIError handles all subclasses. Use isinstance(e, ResponseError) or separate except clauses for specific handling. A4: raise e creates a new traceback starting at the current location. raise (bare) re-raises the original exception with its original traceback preserved. raise NewException from e explicitly chains exceptions: e becomes the __cause__ of NewException. Without from, if you raise inside an except block, the original exception becomes __context__ (implicit chaining). __cause__ is set by explicit raise ... from. __context__ is set implicitly. A5: EAFP (Easier to Ask Forgiveness than Permission): try the operation, handle exceptions. LBYL (Look Before You Leap): check conditions first. EAFP is preferred in Python because it avoids race conditions (TOCTOU), works with duck typing, and produces cleaner code. Example: dict access — LBYL: if key in d: return d[key]; EAFP: try: return d[key]; except KeyError: return None. LBYL is better when checks are cheap and exceptions are expensive, or when the check IS the primary logic (e.g., if user_exists(): ...)."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered exception handling. You understand the complete try-except-else-finally block and the precise execution order of each clause. You navigate the exception hierarchy from BaseException to specific built-ins, catching exceptions at the right level of specificity. You build custom exception classes that inherit from Exception, carry domain-specific context, and communicate errors in the language of your application. You chain exceptions with raise ... from to preserve debugging information and distinguish explicit causes from implicit context. You internalize the EAFP philosophy — trying operations and handling exceptions rather than checking preconditions — writing code that is cleaner, more polymorphic, and free from race conditions. You have built four complete programs: a robust calculator that handles mathematical domain errors with custom exceptions and history tracking, a file opener with exponential backoff retry logic and detailed error classification, a custom exception hierarchy for a data processing pipeline with validation issues and transaction states, and context managers from scratch using both class-based (__enter__, __exit__) and generator-based (@contextmanager) approaches with exception suppression and propagation control. Your code no longer just runs. It recovers."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: try protects, except catches, else runs on success, finally always runs. Catch specific exceptions, not general ones. Custom exceptions carry context. raise ... from chains exceptions for debugging. EAFP is Pythonic; LBYL has its place. Master these six truths, and you have mastered defensive programming. In Part 24, we will explore Modules & Packages — the architecture that turns scripts into reusable, installable, and distributable Python software."
    },
    {
      "type": "cta",
      "text": "Start Part 24: Modules & Packages →",
      "href": "/tutorials/python-unlocked/part-24-modules-packages",
      "note": "28 min read · import mechanics · __init__.py · pyproject.toml · Virtual environments · Build your own package"
    }
  ]
};

export default post;
