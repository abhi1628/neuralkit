const post = {
  "slug": "part-5-numbers-math",
  "seriesSlug": "python-unlocked",
  "partNumber": 5,
  "totalParts": 30,
  "title": "Numbers & Mathematics: From Integers to Infinity (Part 5)",
  "seriesTitle": "Python Unlocked: The Zero-to-Craft Series",
  "date": "June 18, 2026",
  "readTime": "26 min read",
  "category": "Python Programming",
  "categoryColor": "#306998",
  "excerpt": "Python handles numbers like no other language. Arbitrary precision integers, the float trap, complex numbers for quantum computing, and the math modules that power real-world applications. Python 3.12 features included.",
  "coverEmoji": "🔢",
  "tags": [
    "Python",
    "Numbers",
    "Integers",
    "Floats",
    "Complex Numbers",
    "Math Module",
    "Statistics",
    "Random",
    "Secrets",
    "Monte Carlo"
  ],
  "content": [
    {
      "type": "intro",
      "text": "In 1968, the computer scientist Edsger Dijkstra wrote: 'The purpose of abstraction is not to be vague, but to create a new semantic level in which one can be absolutely precise.' Python's number system is the embodiment of this principle. While other languages force you to choose between int, long, float, double, and a dozen fixed-width types, Python simply gives you numbers. Integers that grow as large as your memory allows. Floats that follow the IEEE 754 standard with all its quirks. Complex numbers that make signal processing and quantum computing possible. And a standard library so rich that you can calculate π to a thousand digits, generate cryptographically secure tokens, and run Monte Carlo simulations without installing a single external package. This part is not just about arithmetic. It is about understanding how Python thinks about numbers — and how that thinking makes it the language of science, finance, and artificial intelligence."
    },
    {
      "type": "h2",
      "text": "Integers: Arbitrary Precision and the sys.maxsize Myth"
    },
    {
      "type": "p",
      "text": "In C, an integer is typically 32 bits, giving you a range of roughly -2 billion to +2 billion. Exceed that, and you get overflow — silent, catastrophic, wrong results. In Java, you have int (32-bit) and long (64-bit), but you must choose correctly or face the same fate. In Python, integers have no fixed size. They grow automatically. You can calculate 2 to the power of a million, and Python will happily oblige, using as much memory as needed. This is not a feature bolted on later. It is fundamental to Python's design."
    },
    {
      "type": "code-block",
      "label": "Integer Mastery",
      "code": `# === ARBITRARY PRECISION ===
# Python integers grow as large as your memory allows.

# Small integer
x = 42
print(f'42 is just: {x}')

# Large integer (bigger than 64-bit)
big = 1234567890123456789012345678901234567890
print(f'\\nBig integer: {big}')
print(f'Type: {type(big)}')
print(f'Number of digits: {len(str(big))}')

# REALLY big integer
huge = 2 ** 10000
print(f'\\n2^10000 has {len(str(huge))} digits')
print(f'First 50 digits: {str(huge)[:50]}')
print(f'Last 50 digits: {str(huge)[-50:]}')

# === THE sys.maxsize MYTH ===
# Many developers think sys.maxsize is Python's integer limit.
# It is NOT. It is just the maximum size of containers (lists, strings, etc.)
# because it matches the maximum pointer size on your system.

import sys
print(f'\\nsys.maxsize = {sys.maxsize}')
print(f'This is NOT the integer limit!')
print(f'It is the maximum container size (list, string, etc.)')

# Proof: we can easily exceed sys.maxsize as an integer
bigger_than_maxsize = sys.maxsize + 1
print(f'\\nsys.maxsize + 1 = {bigger_than_maxsize}')
print(f'Type: {type(bigger_than_maxsize)}')
print(f'No overflow! No error! Just a bigger integer.')

# === INTEGER OPERATIONS ===
a = 17
b = 5

print(f'\\nInteger operations with a={a}, b={b}:')
print(f'Addition:       {a} + {b}  = {a + b}')
print(f'Subtraction:    {a} - {b}  = {a - b}')
print(f'Multiplication: {a} * {b}  = {a * b}')
print(f'Division:       {a} / {b}  = {a / b}  (always float!)')
print(f'Floor division: {a} // {b} = {a // b} (integer result)')
print(f'Modulo:         {a} % {b}  = {a % b}')
print(f'Power:          {a} ** {b} = {a ** b}')
print(f'Absolute:       abs(-{a})   = {abs(-a)}')

# === DIVMOD: THE EFFICIENT COMBO ===
# divmod(a, b) returns (a // b, a % b) in one operation
quotient, remainder = divmod(17, 5)
print(f'\\ndivmod(17, 5) = ({quotient}, {remainder})')

# === BITWISE OPERATIONS ===
# Integers can be manipulated at the bit level
x = 0b1010  # 10 in decimal
y = 0b1100  # 12 in decimal

print(f'\\nBitwise operations:')
print(f'x = {x} (binary: {bin(x)})')
print(f'y = {y} (binary: {bin(y)})')
print(f'x & y (AND):  {x & y} (binary: {bin(x & y)})')
print(f'x | y (OR):   {x | y} (binary: {bin(x | y)})')
print(f'x ^ y (XOR):  {x ^ y} (binary: {bin(x ^ y)})')
print(f'~x (NOT):     {~x} (binary: {bin(~x)})')
print(f'x << 2:       {x << 2} (binary: {bin(x << 2)})')
print(f'x >> 1:       {x >> 1} (binary: {bin(x >> 1)})')

# === BASE CONVERSIONS ===
num = 255
print(f'\\nBase conversions for {num}:')
print(f'Binary:      {bin(num)}')
print(f'Octal:       {oct(num)}')
print(f'Hexadecimal: {hex(num)}')

# Convert back from string
print(f'\\nFrom binary string: {int("11111111", 2)}')
print(f'From hex string:    {int("FF", 16)}')
print(f'From octal string:  {int("377", 8)}')`
    },
    {
      "type": "h2",
      "text": "Floats: The IEEE 754 Trap and the Decimal Solution"
    },
    {
      "type": "p",
      "text": "Floating-point numbers are the most dangerous data type in programming. Not because they are complex, but because they are subtle. The IEEE 754 standard, which Python follows, represents floats as binary fractions. This means some decimal numbers — like 0.1 — cannot be represented exactly. The result? 0.1 + 0.2 does not equal 0.3. This is not a Python bug. It is a fundamental limitation of binary floating-point arithmetic, shared by virtually every programming language. Understanding this saves you from financial calculation disasters."
    },
    {
      "type": "code-block",
      "label": "Float Deep Dive",
      "code": `# === THE FLOAT TRAP ===
# The most famous example in all of programming:

print('The float trap:')
print(f'0.1 + 0.2 = {0.1 + 0.2}')
print(f'0.1 + 0.2 == 0.3: {0.1 + 0.2 == 0.3}')

# Why? Because 0.1 in binary is an infinite repeating fraction:
# 0.1 (decimal) = 0.00011001100110011... (binary)
# The computer stores an approximation, not the exact value.

# See the actual stored value with high precision:
print(f'\\nActual stored value of 0.1: {format(0.1, ".17f")}')
print(f'Actual stored value of 0.2: {format(0.2, ".17f")}')
print(f'Actual stored value of 0.3: {format(0.3, ".17f")}')

# === FLOAT REPRESENTATION ===
import struct

# A float is 64 bits: 1 sign bit, 11 exponent bits, 52 mantissa bits
def float_to_bits(f):
    """Show the raw IEEE 754 bits of a float."""
    packed = struct.pack('>d', f)
    bits = ''.join(f'{b:08b}' for b in packed)
    return bits

print(f'\\nIEEE 754 representation of 0.5:')
bits = float_to_bits(0.5)
print(f'  Sign: {bits[0]}')
print(f'  Exponent: {bits[1:12]}')
print(f'  Mantissa: {bits[12:]}')

# === THE DECIMAL MODULE: EXACT ARITHMETIC ===
# For financial calculations, use Decimal, not float.

from decimal import Decimal, getcontext

# Set precision (default is 28 places)
getcontext().prec = 50

a = Decimal('0.1')  // Note: string argument, not float!
b = Decimal('0.2')
c = Decimal('0.3')

print(f'\\nDecimal arithmetic:')
print(f'Decimal("0.1") + Decimal("0.2") = {a + b}')
print(f'Equals Decimal("0.3")? {a + b == c}')

# === COMPARING FLOATS SAFELY ===
# Never use == for float comparison. Use math.isclose().

import math

print(f'\\nSafe float comparison:')
print(f'0.1 + 0.2 == 0.3: {0.1 + 0.2 == 0.3}')
print(f'math.isclose(0.1 + 0.2, 0.3): {math.isclose(0.1 + 0.2, 0.3)}')

# math.isclose() uses relative tolerance by default
print(f'math.isclose(1.0, 1.0000001): {math.isclose(1.0, 1.0000001)}')
print(f'math.isclose(1.0, 1.0001): {math.isclose(1.0, 1.0001)}')

# === FLOAT SPECIAL VALUES ===
print(f'\\nSpecial float values:')
print(f'Infinity: {float("inf")}')
print(f'Negative infinity: {float("-inf")}')
print(f'Not a Number: {float("nan")}')

inf = float('inf')
print(f'inf + 1 = {inf + 1}')
print(f'inf * 2 = {inf * 2}')
print(f'inf / inf = {inf / inf}')  # nan

# === FLOAT METHODS ===
pi = 3.141592653589793

print(f'\\nFloat methods for {pi}:')
print(f'is_integer(): {pi.is_integer()}')
print(f'hex(): {pi.hex()}')
print(f'as_integer_ratio(): {pi.as_integer_ratio()}')

# Convert back from hex
print(f'From hex: {float.fromhex(pi.hex())}')

# === ROUNDING ===
# Python 3 uses 'banker's rounding' — round to nearest even number
print(f'\\nBanker\\'s rounding (round to even):')
print(f'round(2.5) = {round(2.5)}')   # 2 (even)
print(f'round(3.5) = {round(3.5)}')   # 4 (even)
print(f'round(4.5) = {round(4.5)}')   # 4 (even)

# For financial rounding, use Decimal with specific rounding mode:
from decimal import ROUND_HALF_UP
getcontext().rounding = ROUND_HALF_UP
print(f'\\nWith ROUND_HALF_UP:')
d = Decimal('2.5')
print(f'Decimal("2.5").quantize(Decimal("1")) = {d.quantize(Decimal("1"))}')`
    },
    {
      "type": "h2",
      "text": "Complex Numbers: The Hidden Power for Science and Engineering"
    },
    {
      "type": "p",
      "text": "Complex numbers are not just for mathematicians. They are the language of signal processing, control systems, quantum computing, and electrical engineering. In Python, complex numbers are first-class citizens — not an afterthought in a separate library, but built into the language with literal syntax and a full suite of operations."
    },
    {
      "type": "code-block",
      "label": "Complex Numbers in Action",
      "code": `# === COMPLEX NUMBER BASICS ===
# Python uses 'j' for the imaginary unit (engineering convention)
# Mathematicians use 'i', but 'i' is too common as a loop variable.

z1 = 3 + 4j
z2 = 1 - 2j

print(f'z1 = {z1}')
print(f'z2 = {z2}')
print(f'Type: {type(z1)}')

# Components
print(f'\\nComponents of z1 = {z1}:')
print(f'  Real part: {z1.real}')
print(f'  Imaginary part: {z1.imag}')
print(f'  Conjugate: {z1.conjugate()}')

# Operations
print(f'\\nOperations:')
print(f'z1 + z2 = {z1 + z2}')
print(f'z1 - z2 = {z1 - z2}')
print(f'z1 * z2 = {z1 * z2}')
print(f'z1 / z2 = {z1 / z2}')
print(f'z1 ** 2 = {z1 ** 2}')

# Magnitude (absolute value)
print(f'\\n|z1| = {abs(z1)}')  # sqrt(3² + 4²) = 5.0

# Phase angle (in radians)
import cmath
print(f'Phase of z1: {cmath.phase(z1)} radians')
print(f'Phase in degrees: {math.degrees(cmath.phase(z1))}')

# Polar form
r, theta = cmath.polar(z1)
print(f'\\nPolar form of z1:')
print(f'  Magnitude: {r}')
print(f'  Angle: {theta} radians')

# Convert back from polar
z_back = cmath.rect(r, theta)
print(f'  Back to rectangular: {z_back}')

# === EULER'S IDENTITY ===
# The most beautiful equation in mathematics: e^(iπ) + 1 = 0

print(f'\\nEuler\\'s Identity: e^(iπ) + 1 = {cmath.exp(1j * math.pi) + 1}')
print(f'(Should be approximately 0, but float precision gives a tiny residual)')

# === PRACTICAL APPLICATION: SIGNAL PROCESSING ===
# Complex numbers represent signals with amplitude and phase.

import numpy as np

# Create a complex signal: amplitude 5, phase π/4
amplitude = 5
phase = math.pi / 4
signal = amplitude * cmath.exp(1j * phase)

print(f'\\nSignal: amplitude={amplitude}, phase={phase:.4f} rad')
print(f'Complex representation: {signal}')
print(f'Real component: {signal.real:.4f}')
print(f'Imaginary component: {signal.imag:.4f}')

# === QUANTUM COMPUTING BRIEF ===
# In quantum computing, qubit states are complex vectors.
# |ψ⟩ = α|0⟩ + β|1⟩ where α and β are complex numbers.

alpha = complex(1/math.sqrt(2), 0)      # 1/√2 + 0i
beta = complex(0, 1/math.sqrt(2))       # 0 + i/√2

print(f'\\nQubit state:')
print(f'  α = {alpha}')
print(f'  β = {beta}')
print(f'  |α|² + |β|² = {abs(alpha)**2 + abs(beta)**2}')
print(f'  (Must equal 1 for valid quantum state)')

# === cmath MODULE: COMPLEX MATH ===
print(f'\\ncmath module functions:')
print(f'sqrt(-1) = {cmath.sqrt(-1)}')
print(f'log(1+1j) = {cmath.log(1 + 1j)}')
print(f'sin(1+1j) = {cmath.sin(1 + 1j)}')
print(f'exp(1j * π) = {cmath.exp(1j * math.pi)}')`
    },
    {
      "type": "h2",
      "text": "The math Module: Beyond Basic Arithmetic"
    },
    {
      "type": "p",
      "text": "Python's math module is a treasure trove of mathematical functions that most developers never fully explore. It is not just sin, cos, and sqrt. It is combinatorics, special functions, logarithms in any base, and precise floating-point operations. Mastering this module means you can solve mathematical problems without reaching for NumPy."
    },
    {
      "type": "code-block",
      "label": "math Module Mastery",
      "code": `import math

# === CONSTANTS ===
print('Mathematical constants:')
print(f'π (pi):     {math.pi}')
print(f'e (Euler):  {math.e}')
print(f'τ (tau):    {math.tau}')  # 2π, added in Python 3.6
print(f'∞ (inf):    {math.inf}')
print(f'nan:        {math.nan}')

# === TRIGONOMETRY ===
angle = math.pi / 4  # 45 degrees

print(f'\\nTrigonometry (angle = π/4 = 45°):')
print(f'sin(45°) = {math.sin(angle)}')
print(f'cos(45°) = {math.cos(angle)}')
print(f'tan(45°) = {math.tan(angle)}')

# Inverse trigonometry
print(f'\\nInverse trigonometry:')
print(f'asin(0.7071) = {math.asin(0.7071067811865475)} radians')
print(f'acos(0.7071) = {math.acos(0.7071067811865475)} radians')
print(f'atan(1) = {math.atan(1)} radians')
print(f'atan2(1, 1) = {math.atan2(1, 1)} radians')  # Handles quadrants correctly

# Degrees ↔ radians
print(f'\\nConversion:')
print(f'degrees(π/2) = {math.degrees(math.pi / 2)}')
print(f'radians(90) = {math.radians(90)}')

# === HYPERBOLIC FUNCTIONS ===
print(f'\\nHyperbolic functions:')
print(f'sinh(1) = {math.sinh(1)}')
print(f'cosh(1) = {math.cosh(1)}')
print(f'tanh(1) = {math.tanh(1)}')

# === LOGARITHMS AND EXPONENTS ===
print(f'\\nLogarithms and exponents:')
print(f'exp(1) = {math.exp(1)}')
print(f'log(e) = {math.log(math.e)}')        # Natural log (base e)
print(f'log(100, 10) = {math.log(100, 10)}')  # Log base 10
print(f'log10(100) = {math.log10(100)}')      # Same as above
print(f'log2(1024) = {math.log2(1024)}')      # Log base 2

# === POWER AND ROOTS ===
print(f'\\nPower and roots:')
print(f'pow(2, 10) = {math.pow(2, 10)}')      # 2^10 = 1024.0 (returns float)
print(f'sqrt(16) = {math.sqrt(16)}')
print(f'cbrt(27) = {math.cbrt(27)}')          # Cube root, added in Python 3.11

# === COMBINATORICS ===
print(f'\\nCombinatorics:')
print(f'factorial(5) = {math.factorial(5)}')  # 5! = 120
print(f'comb(5, 2) = {math.comb(5, 2)}')      # C(5,2) = 10 (combinations)
print(f'perm(5, 2) = {math.perm(5, 2)}')      # P(5,2) = 20 (permutations)

# === GCD AND LCM ===
print(f'\\nGCD and LCM:')
print(f'gcd(48, 18) = {math.gcd(48, 18)}')    # Greatest common divisor
print(f'lcm(4, 6) = {math.lcm(4, 6)}')        # Least common multiple, Python 3.9+

# === ROUNDING FUNCTIONS ===
print(f'\\nRounding:')
print(f'ceil(3.2) = {math.ceil(3.2)}')        # Round up
print(f'floor(3.8) = {math.floor(3.8)}')      # Round down
print(f'trunc(3.8) = {math.trunc(3.8)}')      # Truncate toward zero
print(f'fabs(-3.5) = {math.fabs(-3.5)}')      # Absolute value (float)

# === MODF: SPLIT INTEGER AND FRACTIONAL PARTS ===
print(f'\\nmodf(3.14159) = {math.modf(3.14159)}')  # (0.14159, 3.0)

# === FMA: FUSED MULTIPLY-ADD ===
# Computes a*b + c with a single rounding (more precise)
print(f'\\nfma(2, 3, 4) = {math.fma(2, 3, 4)}')  # 2*3 + 4 = 10`
    },
    {
      "type": "h2",
      "text": "The statistics Module: Data Analysis Without NumPy"
    },
    {
      "type": "p",
      "text": "Before you install NumPy for simple statistical calculations, check Python's built-in statistics module. It provides mean, median, mode, standard deviation, variance, and correlation — all with clear, well-documented functions. For small to medium datasets, it is sufficient and avoids a heavy dependency."
    },
    {
      "type": "code-block",
      "label": "statistics Module",
      "code": `import statistics

# Sample data
data = [2, 4, 4, 4, 5, 5, 7, 9, 9, 10, 12, 15]

print(f'Dataset: {data}')
print(f'Count: {len(data)}')

# Central tendency
print(f'\\nCentral tendency:')
print(f'mean:   {statistics.mean(data)}')       # Average
print(f'median: {statistics.median(data)}')       # Middle value
print(f'mode:   {statistics.mode(data)}')        # Most common

# For multimodal data (multiple modes):
multi = [1, 1, 2, 2, 3]
print(f'\\nMultimodal data: {multi}')
print(f'add list multimode: {statistics.multimode(multi)}')  # [1, 2]

# Spread
print(f'\\nSpread:')
print(f'stdev (sample):    {statistics.stdev(data)}')   # Sample standard deviation
print(f'pstdev (population): {statistics.pstdev(data)}') # Population standard deviation
print(f'variance (sample): {statistics.variance(data)}')
print(f'pvariance:         {statistics.pvariance(data)}')

# Quantiles
print(f'\\nQuantiles:')
print(f'quantiles (quartiles): {statistics.quantiles(data, n=4)}')
print(f'quantiles (deciles): {statistics.quantiles(data, n=10)}')

# Geometric and harmonic mean
print(f'\\nOther means:')
print(f'geometric_mean: {statistics.geometric_mean(data)}')
print(f'harmonic_mean:  {statistics.harmonic_mean(data)}')

# Correlation
x = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]
print(f'\\nCorrelation between {x} and {y}:')
print(f'correlation: {statistics.correlation(x, y)}')  # Perfect positive: 1.0

# Linear regression
slope, intercept = statistics.linear_regression(x, y)
print(f'\\nLinear regression: y = {slope}x + {intercept}')

# Normal distribution
from statistics import NormalDist

iq = NormalDist(mu=100, sigma=15)
print(f'\\nIQ distribution (μ=100, σ=15):')
print(f'P(IQ < 85):  {iq.cdf(85):.4f}')    # 15.87%
print(f'P(IQ > 130): {1 - iq.cdf(130):.4f}')  # 2.28%
print(f'P(85 < IQ < 115): {iq.cdf(115) - iq.cdf(85):.4f}')  # 68.27%`
    },
    {
      "type": "h2",
      "text": "random vs secrets: Predictable vs Cryptographic"
    },
    {
      "type": "p",
      "text": "Python has two random modules, and using the wrong one can be catastrophic. The random module uses a pseudo-random number generator (PRNG) with a deterministic seed. It is fast and suitable for games, simulations, and statistical sampling. The secrets module uses the operating system's cryptographically secure random number generator (CSPRNG). It is slower but unpredictable, making it essential for passwords, tokens, and security-sensitive applications."
    },
    {
      "type": "code-block",
      "label": "random and secrets Mastery",
      "code": `import random
import secrets
import string

# === random MODULE: PSEUDO-RANDOM ===
# Fast, reproducible, NOT cryptographically secure.

# Seed for reproducibility (great for testing!)
random.seed(42)

print('random module (pseudo-random):')
print(f'random():      {random.random()}')       # 0.0 to 1.0
print(f'randint(1,6):  {random.randint(1, 6)}')   # Dice roll
print(f'randrange(10): {random.randrange(10)}')  # 0 to 9
print(f'uniform(1,2): {random.uniform(1, 2)}')   # Float in range

# Random choices
fruits = ['apple', 'banana', 'cherry', 'date']
print(f'choice:        {random.choice(fruits)}')
print(f'sample(2):     {random.sample(fruits, 2)}')  # Without replacement
print(f'choices(3):    {random.choices(fruits, k=3)}')  # With replacement

# Shuffle (in place!)
cards = ['A', 'K', 'Q', 'J', '10']
random.shuffle(cards)
print(f'shuffled:      {cards}')

# Weighted random
weights = [0.5, 0.3, 0.15, 0.05]  # 50% apple, 30% banana, etc.
print(f'weighted:      {random.choices(fruits, weights=weights, k=1)[0]}')

# === secrets MODULE: CRYPTOGRAPHICALLY SECURE ===
# Uses OS entropy source. Slower but unpredictable.

print(f'\\nsecrets module (cryptographically secure):')
print(f'randbelow(100): {secrets.randbelow(100)}')
print(f'randbits(32):   {secrets.randbits(32)}')
print(f'choice:         {secrets.choice(fruits)}')

# === TOKEN GENERATION ===
# Generate secure tokens for URLs, passwords, etc.

print(f'\\nToken generation:')
print(f'url-safe token (16 bytes): {secrets.token_urlsafe(16)}')
print(f'hex token (16 bytes):      {secrets.token_hex(16)}')
print(f'bytes token (16 bytes):    {secrets.token_bytes(16)}')

# === PASSWORD GENERATION ===
def generate_password(length=16):
    """Generate a secure random password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

print(f'\\nSecure password: {generate_password(20)}')

# === THE SECURITY RULE ===
# Use random for:
#   - Games and simulations
#   - Statistical sampling
#   - Machine learning train/test splits
#   - Anywhere predictability is acceptable

# Use secrets for:
#   - Passwords and authentication tokens
#   - Cryptographic keys
#   - Session identifiers
#   - Anywhere unpredictability is required

# NEVER use random for security. It is predictable.
# An attacker who knows the seed can predict all future 'random' numbers.`
    },
    {
      "type": "h2",
      "text": "Programs: From Hello World to Monte Carlo"
    },
    {
      "type": "p",
      "text": "Theory without practice is philosophy. Let us build programs that use numbers to solve real problems. Each program reinforces the concepts while building something useful — from a simple calculator to a Monte Carlo simulation that estimates π."
    },
    {
      "type": "code-block",
      "label": "Program 1: Smart Calculator",
      "code": `"""
Program 1: Smart Calculator
A calculator with history, memory, and error handling.
"""
import math
from decimal import Decimal, getcontext

class SmartCalculator:
    """A calculator with memory and precision control."""

    def __init__(self, precision=28):
        self.history = []
        self.memory = 0
        getcontext().prec = precision

    def add(self, a, b):
        """Add two numbers."""
        result = a + b
        self._log(f'{a} + {b} = {result}')
        return result

    def subtract(self, a, b):
        """Subtract b from a."""
        result = a - b
        self._log(f'{a} - {b} = {result}')
        return result

    def multiply(self, a, b):
        """Multiply two numbers."""
        result = a * b
        self._log(f'{a} * {b} = {result}')
        return result

    def divide(self, a, b):
        """Divide a by b."""
        if b == 0:
            raise ValueError('Cannot divide by zero')
        result = a / b
        self._log(f'{a} / {b} = {result}')
        return result

    def power(self, a, b):
        """Calculate a to the power of b."""
        result = a ** b
        self._log(f'{a} ^ {b} = {result}')
        return result

    def sqrt(self, a):
        """Calculate square root."""
        if a < 0:
            return complex(0, math.sqrt(abs(a)))
        result = math.sqrt(a)
        self._log(f'√{a} = {result}')
        return result

    def factorial(self, n):
        """Calculate factorial."""
        if n < 0 or not isinstance(n, int):
            raise ValueError('Factorial requires non-negative integer')
        result = math.factorial(n)
        self._log(f'{n}! = {result}')
        return result

    def store_memory(self, value):
        """Store value in memory."""
        self.memory = value
        print(f'Stored {value} in memory')

    def recall_memory(self):
        """Recall value from memory."""
        return self.memory

    def clear_history(self):
        """Clear calculation history."""
        self.history.clear()

    def show_history(self):
        """Display calculation history."""
        print('\\nCalculation History:')
        for i, entry in enumerate(self.history, 1):
            print(f'  {i}. {entry}')

    def _log(self, entry):
        """Log a calculation."""
        self.history.append(entry)

def main():
    """Main calculator program."""
    calc = SmartCalculator()

    print('=' * 50)
    print('SMART CALCULATOR')
    print('=' * 50)

    # Demonstrate operations
    print(f'\\n2 + 3 = {calc.add(2, 3)}')
    print(f'10 - 4 = {calc.subtract(10, 4)}')
    print(f'5 * 6 = {calc.multiply(5, 6)}')
    print(f'20 / 4 = {calc.divide(20, 4)}')
    print(f'2^10 = {calc.power(2, 10)}')
    print(f'√16 = {calc.sqrt(16)}')
    print(f'5! = {calc.factorial(5)}')

    # Memory operations
    calc.store_memory(42)
    print(f'\\nMemory: {calc.recall_memory()}')

    # Show history
    calc.show_history()

    # Decimal precision
    print(f'\\nDecimal precision (50 digits):')
    getcontext().prec = 50
    d = Decimal(1) / Decimal(7)
    print(f'1/7 = {d}')

    print('\\n' + '=' * 50)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 2: Compound Interest Calculator",
      "code": `"""
Program 2: Compound Interest Calculator
Calculates compound interest with various compounding frequencies.
"""
from decimal import Decimal, getcontext

getcontext().prec = 10  # High precision for money

def compound_interest(principal, rate, time, frequency=12):
    """Calculate compound interest.

    Args:
        principal (Decimal): Initial investment
        rate (Decimal): Annual interest rate (e.g., 0.05 for 5%)
        time (Decimal): Time in years
        frequency (int): Compounding frequency per year (default monthly)

    Returns:
        Decimal: Final amount
    """
    # A = P * (1 + r/n)^(nt)
    n = Decimal(frequency)
    amount = principal * (1 + rate / n) ** (n * time)
    return amount

def compare_frequencies(principal, rate, time):
    """Compare different compounding frequencies."""
    frequencies = {
        'Annually': 1,
        'Semi-annually': 2,
        'Quarterly': 4,
        'Monthly': 12,
        'Bi-weekly': 26,
        'Weekly': 52,
        'Daily': 365,
        'Continuous': None  # Special case: A = P * e^(rt)
    }

    import math

    print(f'\\nCompound Interest Comparison')
    print(f'Principal: ${principal}, Rate: {rate*100}%, Time: {time} years')
    print('-' * 60)
    print(f'{"Frequency":<15} {"Times/Year":<12} {"Final Amount":<15} {"Interest":<15}')
    print('-' * 60)

    for name, freq in frequencies.items():
        if freq is None:
            # Continuous compounding: A = P * e^(rt)
            amount = principal * Decimal(math.e) ** (rate * time)
        else:
            amount = compound_interest(principal, rate, time, freq)

        interest = amount - principal
        print(f'{name:<15} {str(freq) if freq else "N/A":<12} ${amount:<14.2f} ${interest:<14.2f}')

def retirement_projection(monthly_contribution, rate, years):
    """Project retirement savings with monthly contributions."""
    monthly_rate = rate / 12
    months = years * 12

    # Future value of series: FV = PMT * [(1 + r)^n - 1] / r
    if monthly_rate == 0:
        total = monthly_contribution * months
    else:
        total = monthly_contribution * ((1 + monthly_rate) ** months - 1) / monthly_rate

    total_contributed = monthly_contribution * months
    interest_earned = total - total_contributed

    print(f'\\nRetirement Projection')
    print(f'Monthly contribution: ${monthly_contribution}')
    print(f'Annual return: {rate*100}%')
    print(f'Years: {years}')
    print(f'\\nTotal contributed: ${total_contributed:.2f}')
    print(f'Interest earned:   ${interest_earned:.2f}')
    print(f'Final balance:     ${total:.2f}')
    print(f'Interest ratio:     {interest_earned/total_contributed*100:.1f}% of total from growth!')

def main():
    """Main compound interest program."""
    print('=' * 60)
    print('COMPOUND INTEREST CALCULATOR')
    print('=' * 60)

    # Example 1: Basic comparison
    principal = Decimal('10000')
    rate = Decimal('0.07')  # 7% annual return
    time = Decimal('30')     // 30 years

    compare_frequencies(principal, rate, time)

    # Example 2: Retirement projection
    print('\\n' + '=' * 60)
    retirement_projection(
        monthly_contribution=Decimal('500'),
        rate=Decimal('0.07'),
        years=35
    )

    print('\\n' + '=' * 60)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 3: Monte Carlo π Estimation",
      "code": `"""
Program 3: Monte Carlo π Estimation
Estimates π using random sampling. Demonstrates the power of
statistical methods and Python's random module.
"""
import random
import math
import time

def estimate_pi(samples):
    """Estimate π using Monte Carlo simulation.

    Theory: If you randomly throw darts at a square that contains
    a quarter circle, the ratio of darts inside the circle to
    total darts approximates π/4.

    Args:
        samples (int): Number of random points to generate

    Returns:
        float: Estimated value of π
    """
    inside_circle = 0

    for _ in range(samples):
        x = random.random()  # 0.0 to 1.0
        y = random.random()  # 0.0 to 1.0

        # Check if point is inside quarter circle (x² + y² ≤ 1)
        if x * x + y * y <= 1:
            inside_circle += 1

    # π/4 ≈ inside_circle / total_samples
    # π ≈ 4 * inside_circle / total_samples
    pi_estimate = 4 * inside_circle / samples
    return pi_estimate

def estimate_pi_optimized(samples):
    """Optimized version using list comprehension."""
    inside = sum(1 for _ in range(samples) 
                 if random.random()**2 + random.random()**2 <= 1)
    return 4 * inside / samples

def convergence_analysis(max_samples=1000000):
    """Show how estimate improves with more samples."""
    print('\\nConvergence Analysis')
    print(f'{"Samples":<12} {"π Estimate":<15} {"Error":<15} {"Time (ms)":<12}')
    print('-' * 55)

    sample_sizes = [100, 1000, 10000, 100000, 1000000]

    for n in sample_sizes:
        if n > max_samples:
            break

        start = time.time()
        estimate = estimate_pi(n)
        elapsed = (time.time() - start) * 1000

        error = abs(estimate - math.pi)
        error_pct = (error / math.pi) * 100

        print(f'{"":<12} {estimate:<15.10f} {error_pct:<14.6f}% {elapsed:<11.2f}')

def visualize_points(samples=1000):
    """Generate data for visualization (can be plotted with matplotlib)."""
    inside_x, inside_y = [], []
    outside_x, outside_y = [], []

    for _ in range(samples):
        x = random.random()
        y = random.random()

        if x * x + y * y <= 1:
            inside_x.append(x)
            inside_y.append(y)
        else:
            outside_x.append(x)
            outside_y.append(y)

    print(f'\\nVisualization data ({samples} points):')
    print(f'  Inside circle:  {len(inside_x)} points')
    print(f'  Outside circle: {len(outside_x)} points')
    print(f'  Ratio: {len(inside_x)/samples:.4f} (π/4 ≈ {math.pi/4:.4f})')

    # Return data for plotting
    return {
        'inside': (inside_x, inside_y),
        'outside': (outside_x, outside_y),
        'pi_estimate': 4 * len(inside_x) / samples
    }

def main():
    """Main Monte Carlo program."""
    print('=' * 60)
    print('MONTE CARLO π ESTIMATION')
    print('=' * 60)
    print(f'\\nActual π: {math.pi}')
    print(f'π to 50 digits: 3.14159265358979323846264338327950288419716939937510')

    # Quick estimate
    print('\\nQuick estimates:')
    for n in [1000, 10000, 100000]:
        estimate = estimate_pi(n)
        error = abs(estimate - math.pi)
        print(f'  Samples: {n:>7} → π ≈ {estimate:.10f} (error: {error:.10f})')

    # Convergence analysis
    convergence_analysis()

    # Visualization data
    data = visualize_points(1000)

    print('\\n' + '=' * 60)
    print('The Monte Carlo method demonstrates a profound truth:')
    print('Randomness, when applied systematically, can solve')
    print('deterministic problems with surprising accuracy.')
    print('=' * 60)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "code-block",
      "label": "Program 4: Number Theory Toolkit",
      "code": `"""
Program 4: Number Theory Toolkit
Classic algorithms: prime check, factorization, GCD, LCM,
Armstrong numbers, perfect numbers, and more.
"""
import math

def is_prime(n):
    """Check if a number is prime.

    Args:
        n (int): Number to check

    Returns:
        bool: True if prime, False otherwise
    """
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False

    # Only check odd divisors up to √n
    for i in range(3, int(math.sqrt(n)) + 1, 2):
        if n % i == 0:
            return False
    return True

def prime_factors(n):
    """Find prime factorization of a number.

    Args:
        n (int): Number to factorize

    Returns:
        list: Prime factors
    """
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors

def gcd(a, b):
    """Calculate GCD using Euclidean algorithm."""
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    """Calculate LCM using GCD."""
    return abs(a * b) // gcd(a, b)

def is_armstrong(n):
    """Check if a number is an Armstrong (narcissistic) number.

    An Armstrong number equals the sum of its digits raised to
    the power of the number of digits.
    Example: 153 = 1³ + 5³ + 3³ = 153
    """
    digits = str(n)
    power = len(digits)
    return sum(int(d) ** power for d in digits) == n

def is_perfect(n):
    """Check if a number is perfect (sum of proper divisors equals n).

    Example: 6 = 1 + 2 + 3 = 6
    """
    if n < 2:
        return False
    divisors = [1]
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            divisors.append(i)
            if i != n // i:
                divisors.append(n // i)
    return sum(divisors) == n

def fibonacci(n):
    """Generate first n Fibonacci numbers."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    fibs = [0, 1]
    for _ in range(2, n):
        fibs.append(fibs[-1] + fibs[-2])
    return fibs

def factorial_manual(n):
    """Calculate factorial manually (not using math.factorial)."""
    if n < 0:
        raise ValueError('Factorial not defined for negative numbers')
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def sum_of_digits(n):
    """Calculate sum of digits of a number."""
    return sum(int(d) for d in str(abs(n)))

def reverse_number(n):
    """Reverse the digits of a number."""
    sign = -1 if n < 0 else 1
    return sign * int(str(abs(n))[::-1])

def is_palindrome(n):
    """Check if a number is a palindrome."""
    return str(n) == str(n)[::-1]

def main():
    """Main number theory program."""
    print('=' * 60)
    print('NUMBER THEORY TOOLKIT')
    print('=' * 60)

    # Prime numbers
    print('\\nPrime numbers up to 100:')
    primes = [n for n in range(2, 101) if is_prime(n)]
    print(f'  {primes}')
    print(f'  Count: {len(primes)}')

    # Prime factorization
    print(f'\\nPrime factorization:')
    for num in [12, 100, 360, 97]:
        factors = prime_factors(num)
        print(f'  {num} = {" x ".join(map(str, factors))}')

    # GCD and LCM
    print(f'\\nGCD and LCM:')
    print(f'  gcd(48, 18) = {gcd(48, 18)}')
    print(f'  lcm(4, 6) = {lcm(4, 6)}')

    # Armstrong numbers
    print(f'\\nArmstrong numbers (3 digits):')
    armstrongs = [n for n in range(100, 1000) if is_armstrong(n)]
    print(f'  {armstrongs}')

    # Perfect numbers
    print(f'\\nPerfect numbers up to 10000:')
    perfects = [n for n in range(2, 10000) if is_perfect(n)]
    print(f'  {perfects}')

    # Fibonacci
    print(f'\\nFibonacci (first 15):')
    print(f'  {fibonacci(15)}')

    # Factorial
    print(f'\\nFactorials:')
    for n in [5, 7, 10]:
        print(f'  {n}! = {factorial_manual(n)}')

    # Digit operations
    print(f'\\nDigit operations for 12345:')
    print(f'  Sum of digits: {sum_of_digits(12345)}')
    print(f'  Reversed: {reverse_number(12345)}')
    print(f'  Is palindrome: {is_palindrome(12345)}')
    print(f'  Is palindrome: {is_palindrome(12321)}')

    print('\\n' + '=' * 60)

if __name__ == '__main__':
    main()`
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Answer these before moving to Part 6. 4/5 correct means you have mastered Python's number system."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Python integers have arbitrary precision. Demonstrate this by calculating 2^10000 and explaining why other languages (like C or Java) would fail at this.",
        "Q2: Why does 0.1 + 0.2 != 0.3 in Python? Is this a Python bug? Explain the IEEE 754 standard and show how to handle this correctly for financial calculations.",
        "Q3: Write a program that generates a cryptographically secure random password of 20 characters. Explain why you must use secrets instead of random for this task.",
        "Q4: The Monte Carlo method estimates π by throwing random darts. Explain the mathematical principle (area ratio) and write a function that improves accuracy as sample size increases.",
        "Q5: What is the difference between math.comb() and math.perm()? Calculate how many ways you can choose 3 committee members from 10 people, and how many ways you can arrange 3 books from 10 on a shelf."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Python integers automatically grow to accommodate any size, limited only by available memory. In C, int is typically 32-bit (max ~2 billion). In Java, long is 64-bit (max ~9 quintillion). 2^10000 has 3011 digits — far beyond any fixed-width type. Python handles this seamlessly because it uses arbitrary-precision arithmetic internally, switching to larger representations as needed. A2: This is NOT a Python bug. IEEE 754 represents floats as binary fractions. 0.1 in decimal is an infinite repeating fraction in binary (0.0001100110011...), so the computer stores an approximation. For financial calculations, use Decimal from the decimal module with string arguments: Decimal('0.1') + Decimal('0.2') == Decimal('0.3') returns True. A3: Use secrets.choice() with a character alphabet. The secrets module uses the OS's cryptographically secure random number generator (CSPRNG), which is unpredictable. The random module uses a PRNG with a deterministic seed — if an attacker knows the seed, they can predict all future 'random' numbers. For passwords, unpredictability is essential. A4: The Monte Carlo method uses the area ratio: a quarter circle has area π/4, while the containing square has area 1. The ratio of random points inside the circle to total points approximates π/4. Multiply by 4 to estimate π. Accuracy improves with the square root of sample size: error ≈ 1/👁️n. A5: math.comb(n, k) calculates combinations (order does not matter): C(10,3) = 120 ways to choose committee members. math.perm(n, k) calculates permutations (order matters): P(10,3) = 720 ways to arrange books on a shelf."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "You have mastered Python's number system. You understand that integers grow without bound, floats follow IEEE 754 with all its quirks, and complex numbers unlock scientific computing. You know when to use Decimal for money, secrets for security, and random for simulations. You have built four complete programs: a smart calculator, a compound interest projector, a Monte Carlo π estimator, and a number theory toolkit. This is not just arithmetic. This is the mathematical foundation that powers data science, finance, cryptography, and artificial intelligence."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: Python's number system is designed for humans who think in mathematics, not machines that think in bits. Arbitrary precision integers eliminate overflow anxiety. The decimal module eliminates float rounding anxiety. The secrets module eliminates predictable-random anxiety. And the math/statistics modules eliminate dependency anxiety. In Part 6, we will explore strings — the art of text in a Unicode world. You will learn why len('🐍') == 1, how UTF-8 works, and why string handling separates junior developers from seniors."
    },
    {
      "type": "cta",
      "text": "Start Part 6: Strings — The Art of Text →",
      "href": "/tutorials/python-unlocked/part-6-strings-unicode",
      "note": "30 min read · Unicode · UTF-8 · String methods · Encoding"
    }
  ]
};

export default post;
