import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const GROQ_API_URL = "/api/ai";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function trackEvent(n, p = {}) { if (window.gtag) window.gtag("event", n, p); }

function fireConfetti() {
  const colors = ["#00ffe0", "#a78bfa", "#ffffff", "#00aaff"];
  const defaults = { spread: 360, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 20, colors };
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({ ...defaults, particleCount: 4, origin: { x: Math.random() * 0.3 + 0.35, y: Math.random() * 0.3 + 0.3 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// ═════════════════════════════════════════════════════════════
// CHALLENGE QUESTIONS — 10 MCQs + 1-2 Coding per language
// Easy = tricky conceptual traps | Medium = deeper reasoning
// ═════════════════════════════════════════════════════════════

const CHALLENGE_QUESTIONS = {
  python: {
    easy: {
      mcqs: [
        {
          question: "What is the output of: print(2 ** 3 ** 2)?",
          options: ["A) 64", "B) 512", "C) 36", "D) 72"],
          answer: "B",
          explanation: "Exponentiation is RIGHT-associative: 3**2=9, then 2**9=512. Most people guess 64 because they evaluate left-to-right (2**3=8, 8**2=64)."
        },
        {
          question: "What does this print? x = [1, 2, 3]; y = x; y += [4]; print(x)",
          options: ["A) [1, 2, 3]", "B) [1, 2, 3, 4]", "C) Error", "D) None"],
          answer: "B",
          explanation: "y += [4] modifies the list IN-PLACE (calls __iadd__), so x (which points to the same object) also shows [1,2,3,4]. y = y + [4] would NOT affect x."
        },
        {
          question: "What is the output of: print([] == [] and [] is [])?",
          options: ["A) True", "B) False", "C) Error", "D) None"],
          answer: "B",
          explanation: "[] == [] is True (equal values), but [] is [] is False (different objects in memory). 'and' returns the last evaluated operand, so False."
        },
        {
          question: "What does this print? print(type(()) is tuple)",
          options: ["A) True", "B) False", "C) <class 'tuple'>", "D) Error"],
          answer: "A",
          explanation: "() creates an empty tuple. type(()) returns <class 'tuple'>, and 'is tuple' checks identity with the tuple class object. True."
        },
        {
          question: "What is the output? print('hello'[::-1][::-1] is 'hello')",
          options: ["A) True", "B) False", "C) 'hello'", "D) Error"],
          answer: "B",
          explanation: "[::-1] reverses the string, then reverses back. But slicing creates a NEW string object. 'is' checks identity, not equality. 'hello' == 'hello' would be True."
        },
        {
          question: "What prints? a = [1, 2, 3]; print(a[3:])",
          options: ["A) [3]", "B) []", "C) IndexError", "D) None"],
          answer: "B",
          explanation: "Python slicing NEVER raises IndexError. a[3:] starts at index 3 (which doesn't exist), so it returns an empty list []. a[3] would raise IndexError."
        },
        {
          question: "What is the output? print(bool('False'))",
          options: ["A) False", "B) True", "C) Error", "D) 'False'"],
          answer: "B",
          explanation: "bool('False') is True because ANY non-empty string is truthy in Python. The string contains characters, so it's True. Only empty string '' is falsy."
        },
        {
          question: "What does this print? print(0.1 + 0.2 == 0.3)",
          options: ["A) True", "B) False", "C) Error", "D) Depends on Python version"],
          answer: "B",
          explanation: "Floating-point representation: 0.1 + 0.2 = 0.30000000000000004. This is a classic IEEE 754 floating-point precision issue, not a Python bug. Use round() or Decimal for exact comparison."
        },
        {
          question: "What is the output? x = 5; print(x > 3 > 2)",
          options: ["A) True", "B) False", "C) Error", "D) SyntaxError"],
          answer: "A",
          explanation: "Python supports chained comparisons: x > 3 > 2 is evaluated as (x > 3) and (3 > 2). Both are True, so result is True. Very clean Pythonic syntax."
        },
        {
          question: "What prints? def f(x=[]): x.append(1); return x; print(f()); print(f())",
          options: ["A) [1] [1]", "B) [1] [1, 1]", "C) Error", "D) [1, 1] [1, 1, 1]"],
          answer: "B",
          explanation: "MUTABLE DEFAULT ARGUMENT TRAP! The list x=[] is created ONCE when the function is defined, not each call. First call: [1]. Second call: [1, 1]. Classic Python gotcha."
        }
      ],
      coding: [
        {
          title: "🔥 The Mutable Default Trap",
          description: `Fix the function below so it returns a NEW list [1] every time, regardless of how many times it's called.

The current implementation has a classic Python bug.

Expected: f() → [1], f() → [1], f() → [1]`,
          starter: `def f(x=[]):
    x.append(1)
    return x

print(f())
print(f())
print(f())`,
          testCases: [
            { input: "f() called 3 times", expected: "[1] [1] [1]" }
          ],
          validator: (output) => {
            const lines = output.trim().split('\n').filter(l => l.includes('['));
            return lines.length >= 3 && lines.every(l => l.trim() === '[1]');
          }
        }
      ]
    },
    medium: {
      mcqs: [
        {
          question: "What is the output? print((lambda x: x(x))(lambda y: y))",
          options: ["A) <function>", "B) Error", "C) Infinite recursion", "D) None"],
          answer: "C",
          explanation: "This is a Y-combinator-like self-application. lambda y: y receives itself as argument, then calls itself with itself... infinite recursion! It's a fixed-point combinator pattern."
        },
        {
          question: "What does this print? d = {'a': 1, 'b': 2}; print(d.get('c', d['a'] + d['b']))",
          options: ["A) None", "B) 3", "C) KeyError", "D) {'a': 1}"],
          answer: "B",
          explanation: "d.get('c', default) returns default if key 'c' missing. The default expression d['a'] + d['b'] = 1 + 2 = 3 is evaluated ONLY if needed. Result: 3."
        },
        {
          question: "What is the output? class A: pass; print(A() == A()); print(A() is A())",
          options: ["A) True True", "B) False False", "C) True False", "D) False True"],
          answer: "B",
          explanation: "Two different instances of A. Default __eq__ checks identity (is), so both are False. Without custom __eq__, == falls back to is for user-defined classes."
        },
        {
          question: "What prints? print([i for i in range(10) if i % 2 == 0 if i % 3 == 0])",
          options: ["A) [0, 6]", "B) [0, 2, 4, 6, 8]", "C) [0, 3, 6, 9]", "D) [6]"],
          answer: "A",
          explanation: "Multiple 'if' conditions in list comprehension are ANDed together. i%2==0 AND i%3==0 means multiples of 6. In range(10): 0 and 6. Result: [0, 6]."
        },
        {
          question: "What is the output? import copy; a = [[1], [2]]; b = copy.copy(a); b[0].append(3); print(a)",
          options: ["A) [[1], [2]]", "B) [[1, 3], [2]]", "C) [[1], [2], [3]]", "D) Error"],
          answer: "B",
          explanation: "copy.copy() is SHALLOW copy. b[0] and a[0] still point to the SAME inner list. Appending 3 modifies the shared inner list. Use copy.deepcopy() for full independence."
        },
        {
          question: "What does this print? print(sum([[1, 2], [3, 4]], []))",
          options: ["A) 10", "B) [1, 2, 3, 4]", "C) [[1, 2], [3, 4]]", "D) Error"],
          answer: "B",
          explanation: "sum(iterable, start) concatenates lists when start=[]. It does [1,2]+[3,4] = [1,2,3,4]. The second argument is the starting value. Clever but O(n²) — use itertools.chain for large lists."
        },
        {
          question: "What is the output? x = {1, 2, 3}; x.add((4, 5)); print(len(x))",
          options: ["A) 4", "B) 5", "C) Error", "D) 3"],
          answer: "A",
          explanation: "Sets can contain tuples (immutable, hashable) but not lists. (4,5) is a tuple, so it's added. Set now has {1,2,3,(4,5)} → length 4."
        },
        {
          question: "What prints? def outer(): x = 1; def inner(): nonlocal x; x = 2; inner(); return x; print(outer())",
          options: ["A) 1", "B) 2", "C) UnboundLocalError", "D) None"],
          answer: "B",
          explanation: "'nonlocal x' tells Python to use x from the nearest enclosing scope (outer), not create a local. inner() modifies outer's x to 2. Returns 2."
        },
        {
          question: "What is the output? print('\n'.join(['a', 'b', 'c']))",
          options: ["A) abc", "B) a\nb\nc", "C) a b c", "D) ['a', 'b', 'c']"],
          answer: "B",
          explanation: "'\n'.join() inserts newline between elements. Result is 'a\nb\nc' which prints as three lines. The string literal '\n' becomes an actual newline character."
        },
        {
          question: "What does this print? print({True: 'yes', 1: 'no', 1.0: 'maybe'})",
          options: ["A) {True: 'yes', 1: 'no', 1.0: 'maybe'}", "B) {True: 'maybe'}", "C) {1: 'maybe'}", "D) Error"],
          answer: "B",
          explanation: "In Python, True == 1 == 1.0 (all equal and hash to same value). Dictionary keys must be unique, so they overwrite each other. Last value wins: {True: 'maybe'}."
        }
      ],
      coding: [
        {
          title: "🔥 LRU Cache Decorator",
          description: `Implement an LRU (Least Recently Used) cache decorator that caches function results.

When cache is full (maxsize), evict the least recently used item.

Test: fib(30) should be near-instant on second call.`,
          starter: `from functools import lru_cache

# DON'T use @lru_cache — implement your own!
# Hint: Use OrderedDict or a dict + linked list

def my_lru_cache(maxsize=128):
    def decorator(func):
        # Your implementation
        pass
    return decorator

@my_lru_cache(maxsize=3)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

print(fib(10))
print(fib(15))
print(fib(10))  # Should be cached`,
          testCases: [
            { input: "fib(10)", expected: "55" },
            { input: "fib(15)", expected: "610" }
          ],
          validator: (output) => output.includes('55') && output.includes('610')
        }
      ]
    }
  },
  c: {
    easy: {
      mcqs: [
        {
          question: "What is sizeof('abc') in C?",
          options: ["A) 3", "B) 4", "C) 12", "D) Depends on compiler"],
          answer: "B",
          explanation: "String literals include implicit null terminator '\0'. 'abc' is {'a','b','c','\0'} → 4 bytes. sizeof('a') is also 4 (int-sized char array in C, though this varies by standard)."
        },
        {
          question: "What is the output? int a = 5; printf("%d", ++a + ++a);",
          options: ["A) 12", "B) 13", "C) 14", "D) Undefined Behavior"],
          answer: "D",
          explanation: "MODIFYING 'a' twice between sequence points is UNDEFINED BEHAVIOR in C. The compiler can do anything. Never write ++a + ++a. This is a classic interview trap."
        },
        {
          question: "What does sizeof(int*) return on a 64-bit system?",
          options: ["A) 4", "B) 8", "C) sizeof(int)", "D) 2"],
          answer: "B",
          explanation: "On 64-bit systems, pointers are 64 bits = 8 bytes. This is independent of what they point to. sizeof(char*) == sizeof(int*) == sizeof(double*) == 8 on x86_64."
        },
        {
          question: "What is the output? int x = 5; printf("%d", x++ + ++x);",
          options: ["A) 11", "B) 12", "C) 13", "D) Undefined Behavior"],
          answer: "D",
          explanation: "Another undefined behavior! x is modified twice (x++ and ++x) without a sequence point between them. The result varies by compiler. GCC might give 12, but it's not guaranteed."
        },
        {
          question: "What does this print? char s[] = "hello"; printf("%lu", sizeof(s));",
          options: ["A) 5", "B) 6", "C) sizeof(char*)", "D) 4"],
          answer: "B",
          explanation: "char s[] = "hello" creates an array of 6 chars including '\0'. sizeof(s) = 6. But char *s = "hello" would give sizeof(char*) = 8 (pointer size). Array vs pointer matters!"
        },
        {
          question: "What is the value of arr[3] after: int arr[5] = {1, 2};",
          options: ["A) Garbage", "B) 0", "C) 3", "D) Undefined"],
          answer: "B",
          explanation: "Partial array initialization zero-fills the rest. arr = {1, 2, 0, 0, 0}. This is guaranteed by C standard. If it were a local variable without initialization, the rest would be garbage."
        },
        {
          question: "What does this print? printf("%d", 5 & 3);",
          options: ["A) 8", "B) 1", "C) 7", "D) 2"],
          answer: "B",
          explanation: "5 = 101, 3 = 011 in binary. AND: 101 & 011 = 001 = 1. Bitwise AND only sets bits where BOTH operands have 1."
        },
        {
          question: "What is the output? int i = 0; printf("%d %d", i++, i++);",
          options: ["A) 0 1", "B) 1 0", "C) 0 0", "D) Undefined Behavior"],
          answer: "D",
          explanation: "Multiple modifications of 'i' between sequence points = Undefined Behavior. The evaluation order of function arguments is UNSPECIFIED in C. Different compilers give different results."
        },
        {
          question: "What does sizeof(0) return?",
          options: ["A) sizeof(int)", "B) sizeof(char)", "C) sizeof(long)", "D) 1"],
          answer: "A",
          explanation: "Integer constant 0 has type int by default. sizeof(0) = sizeof(int) = 4 (typically). To get sizeof(long), use 0L. To get sizeof(long long), use 0LL."
        },
        {
          question: "What is the output? int a[3] = {1,2,3}; printf("%d", *(a + 1));",
          options: ["A) 1", "B) 2", "C) 3", "D) Address of a[1]"],
          answer: "B",
          explanation: "Pointer arithmetic: a + 1 points to a[1]. *(a + 1) dereferences it → 2. Arrays decay to pointers in expressions. a[i] is syntactic sugar for *(a + i)."
        }
      ],
      coding: [
        {
          title: "🔥 Swap Without Temp Variable",
          description: `Swap two integers WITHOUT using a temporary variable.

Handle edge cases including when both pointers point to the same memory.

Expected: a=5, b=3 → a=3, b=5`,
          starter: `#include <stdio.h>

void swap(int *a, int *b) {
    // Your code here — NO temp variable!
    // Hint: XOR swap has a bug when a == b
}

int main() {
    int x = 5, y = 3;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);

    int z = 7;
    swap(&z, &z);
    printf("z=%d\n", z);  // Should still be 7!
    return 0;
}`,
          testCases: [
            { input: "x=5, y=3", expected: "x=3 y=5" },
            { input: "z=7, swap(&z,&z)", expected: "z=7" }
          ],
          validator: (output) => output.includes('x=3') && output.includes('y=5') && output.includes('z=7')
        }
      ]
    },
    medium: {
      mcqs: [
        {
          question: "What is the output? union U { int i; char c[4]; }; union U u; u.i = 0x12345678; printf("%x", u.c[0]); on little-endian?",
          options: ["A) 12", "B) 78", "C) 56", "D) Depends"],
          answer: "B",
          explanation: "On little-endian, least significant byte (0x78) is at lowest address. u.c[0] reads the first byte → 78. On big-endian it would be 12. This is how you detect endianness!"
        },
        {
          question: "What does this print? int *p = NULL; printf("%d", sizeof(*p));",
          options: ["A) 0", "B) sizeof(int)", "C) Segmentation fault", "D) sizeof(void*)"],
          answer: "B",
          explanation: "sizeof is a COMPILE-TIME operator (except VLAs). It doesn't evaluate *p, it just determines the type size. sizeof(*p) = sizeof(int) = 4. No runtime dereference happens."
        },
        {
          question: "What is the output? struct S { char c; int i; }; printf("%lu", sizeof(struct S));",
          options: ["A) 5", "B) 8", "C) 6", "D) Depends on padding"],
          answer: "B",
          explanation: "Structure padding! char (1 byte) + 3 bytes padding + int (4 bytes) = 8. Alignment requires int to start at 4-byte boundary. Use #pragma pack(1) to get 5, but it's slower."
        },
        {
          question: "What does this print? int x = 1; printf("%d", x << 33);",
          options: ["A) 2", "B) 0", "C) Undefined Behavior", "D) 4294967296"],
          answer: "C",
          explanation: "Shifting by >= width of type is UNDEFINED BEHAVIOR in C. For 32-bit int, shifting by 33 is UB. The result could be anything. Always ensure shift < sizeof(type)*8."
        },
        {
          question: "What is the value of p after: int a[5]; int *p = a; p++;",
          options: ["A) a + 1 byte", "B) a + sizeof(int)", "C) a + 4 bytes", "D) &a[1]"],
          answer: "D",
          explanation: "Pointer arithmetic: p++ advances by sizeof(int) bytes (typically 4), so p now points to &a[1]. Both B and D describe the same thing, but D is the most precise C expression."
        },
        {
          question: "What does this print? const int *p; int x = 5; p = &x; *p = 10;",
          options: ["A) x = 10", "B) Compile error", "C) Runtime error", "D) Undefined"],
          answer: "B",
          explanation: "const int *p means pointer to const int — the DATA is const, not the pointer. *p = 10 tries to modify const data → compile-time error. For pointer const: int *const p."
        },
        {
          question: "What is the output? int a = 1; int b = a++ + ++a; printf("%d", b);",
          options: ["A) 4", "B) 3", "C) Undefined Behavior", "D) 5"],
          answer: "C",
          explanation: "Same variable 'a' modified twice between sequence points. UB! Even though it looks like it should be 1 + 3 = 4, the standard says this is undefined. Never do this."
        },
        {
          question: "What does offsetof(struct { char a; int b; }, b) return?",
          options: ["A) 1", "B) 4", "C) 5", "D) sizeof(char)"],
          answer: "B",
          explanation: "offsetof returns the byte offset of member 'b'. Due to padding after char a, b starts at offset 4 (aligned to int boundary). This is a standard macro in <stddef.h>."
        },
        {
          question: "What is the output? int i = 5; printf("%d %d %d", i, i++, ++i);",
          options: ["A) 5 5 7", "B) 7 6 7", "C) Undefined Behavior", "D) 6 5 7"],
          answer: "C",
          explanation: "Multiple modifications + reads of 'i' without sequence points = UB. The evaluation order of printf arguments is unspecified AND there are multiple modifications."
        },
        {
          question: "What does this print? char *s = "hello"; s[0] = 'H'; printf("%s", s);",
          options: ["A) Hello", "B) hello", "C) Compile error", "D) Undefined Behavior/Segfault"],
          answer: "D",
          explanation: "String literals are stored in READ-ONLY memory. Modifying them causes undefined behavior — typically a segmentation fault. Use char s[] = "hello" for mutable strings."
        }
      ],
      coding: [
        {
          title: "🔥 Bit Manipulation: Count Set Bits",
          description: `Count the number of 1 bits in an integer.

Implement Brian Kernighan's algorithm (not the naive loop).

Expected: count_bits(15) → 4, count_bits(0) → 0`,
          starter: `#include <stdio.h>

int count_bits(unsigned int n) {
    // Brian Kernighan's algorithm
    // Hint: n & (n-1) clears the lowest set bit
    int count = 0;
    while (n) {
        // Your code here
    }
    return count;
}

int main() {
    printf("%d\n", count_bits(15));   // 1111 → 4
    printf("%d\n", count_bits(0));    // 0 → 0
    printf("%d\n", count_bits(255));  // 11111111 → 8
    printf("%d\n", count_bits(1023)); // 1111111111 → 10
    return 0;
}`,
          testCases: [
            { input: "15", expected: "4" },
            { input: "0", expected: "0" },
            { input: "255", expected: "8" }
          ],
          validator: (output) => {
            const lines = output.trim().split('\n').filter(l => /^\d+$/.test(l.trim()));
            return lines.length >= 3 && lines[0] === '4' && lines[1] === '0' && lines[2] === '8';
          }
        }
      ]
    }
  },
  cpp: {
    easy: {
      mcqs: [
        {
          question: "What is the output? cout << sizeof('a');",
          options: ["A) 1", "B) 4", "C) sizeof(char)", "D) Depends"],
          answer: "B",
          explanation: "In C++, character literals like 'a' have type int, not char! sizeof('a') = sizeof(int) = 4. This differs from C where 'a' is char (sizeof=1). Classic C vs C++ difference."
        },
        {
          question: "What does this print? vector<int> v(3, 5); cout << v.size();",
          options: ["A) 3", "B) 5", "C) 15", "D) 2"],
          answer: "A",
          explanation: "vector<int> v(3, 5) creates a vector of 3 elements, each initialized to 5. So v = {5, 5, 5} and size() = 3. The constructor is vector(size_type count, const T& value)."
        },
        {
          question: "What is the output? int x = 5; cout << ++x + x++;",
          options: ["A) 12", "B) 13", "C) Undefined Behavior", "D) 11"],
          answer: "C",
          explanation: "In C++, modifying the same variable multiple times between sequence points (or unsequenced) is UNDEFINED BEHAVIOR. ++x and x++ both modify x with no sequence point between them."
        },
        {
          question: "What does this print? cout << (1 << 3);",
          options: ["A) 4", "B) 8", "C) 16", "D) 3"],
          answer: "B",
          explanation: "1 << 3 shifts binary 1 left by 3 positions: 0001 → 1000 = 8. Each left shift doubles the value. 1 << n = 2^n."
        },
        {
          question: "What is the output? string s = "hello"; cout << s.substr(1, 3);",
          options: ["A) hell", "B) ell", "C) ello", "D) ellh"],
          answer: "B",
          explanation: "substr(pos, len): starts at index 1 ('e'), takes 3 characters → 'ell'. If len exceeds string length, it takes until the end. s.substr(1) would give 'ello'."
        },
        {
          question: "What does this print? int *p = new int(5); delete p; cout << *p;",
          options: ["A) 5", "B) 0", "C) Garbage", "D) Undefined Behavior"],
          answer: "D",
          explanation: "Dereferencing a deleted pointer is UNDEFINED BEHAVIOR. The memory might still contain 5, but it's invalid to access. Use p = nullptr after delete to prevent accidental use."
        },
        {
          question: "What is the output? cout << (5 / 2);",
          options: ["A) 2.5", "B) 2", "C) 3", "D) Compile error"],
          answer: "B",
          explanation: "Integer division in C++ truncates toward zero. 5/2 = 2. For floating-point: 5.0/2 or 5/2.0 = 2.5. This is a common bug when doing math with integers."
        },
        {
          question: "What does this print? int a = 5, b = 2; cout << (a & b);",
          options: ["A) 7", "B) 0", "C) 1", "D) 2"],
          answer: "B",
          explanation: "5 = 101, 2 = 010 in binary. a & b = 101 & 010 = 000 = 0. Bitwise AND only keeps bits where both have 1. No common 1-bits between 5 and 2."
        },
        {
          question: "What is the output? auto x = {1, 2, 3}; cout << typeid(x).name();",
          options: ["A) std::initializer_list", "B) std::vector", "C) std::array", "D) int[3]"],
          answer: "A",
          explanation: "auto x = {1,2,3} deduces x as std::initializer_list<int>, not an array or vector. To get array: auto x = std::array{1,2,3} (C++17) or int x[] = {1,2,3}."
        },
        {
          question: "What does this print? int arr[] = {1,2,3}; cout << *(&arr + 1) - arr;",
          options: ["A) 1", "B) 3", "C) 12", "D) sizeof(int)"],
          answer: "B",
          explanation: "&arr is pointer to entire array (int(*)[3]). &arr + 1 skips the whole array (12 bytes forward). Subtracting arr (decays to int*) gives 12/sizeof(int) = 3. This is a trick to get array length!"
        }
      ],
      coding: [
        {
          title: "🔥 Smart Pointer Bug Hunt",
          description: `Fix the memory leak and dangling pointer in this code.

Use modern C++ smart pointers (unique_ptr/shared_ptr) instead of raw new/delete.

Expected: No leaks, safe access.`,
          starter: `#include <iostream>
#include <memory>
using namespace std;

class Node {
public:
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

int main() {
    // FIX: Use smart pointers, fix the leak
    Node* head = new Node(1);
    head->next = new Node(2);

    // Oops, forgot to delete!
    // Also, what if exception thrown between new calls?

    cout << head->data << " -> " << head->next->data << endl;
    return 0;
}`,
          testCases: [
            { input: "Run program", expected: "1 -> 2, no leaks" }
          ],
          validator: (output) => output.includes('1') && output.includes('2')
        }
      ]
    },
    medium: {
      mcqs: [
        {
          question: "What is the output? class A { virtual void f() {} }; class B : A {}; cout << sizeof(B);",
          options: ["A) 1", "B) 8", "C) 4", "D) Depends on vptr size"],
          answer: "D",
          explanation: "Classes with virtual functions have a hidden vptr (virtual table pointer). sizeof(B) = sizeof(vptr) typically 8 bytes on 64-bit. Without virtual: empty base optimization might give 1."
        },
        {
          question: "What does this print? vector<int> v = {1,2,3,4,5}; v.erase(v.begin() + 2); cout << v[2];",
          options: ["A) 3", "B) 4", "C) 5", "D) Error"],
          answer: "B",
          explanation: "erase(pos) removes element at position and shifts remaining elements left. v becomes {1,2,4,5}. v[2] = 4. Time complexity: O(n) due to shifting."
        },
        {
          question: "What is the output? int&& r = 5; cout << r;",
          options: ["A) 5", "B) Address of 5", "C) Compile error", "D) rvalue reference"],
          answer: "A",
          explanation: "int&& r = 5 binds an rvalue reference to temporary 5. r itself is an lvalue (has a name), so cout << r prints 5. To move from it: std::move(r). Rvalue refs extend temporary lifetime."
        },
        {
          question: "What does this print? constexpr int f() { return 5; } int a[f()]; cout << sizeof(a);",
          options: ["A) Compile error", "B) 20", "C) sizeof(int)*5", "D) Depends"],
          answer: "B",
          explanation: "constexpr functions can be used in constant expressions. f() is evaluated at compile-time, so int a[5] is valid VLA alternative. sizeof(a) = 5 * sizeof(int) = 20 (typically)."
        },
        {
          question: "What is the output? string s = "abc"; cout << s.capacity() >= s.size();",
          options: ["A) 1 (true)", "B) 0 (false)", "C) Compile error", "D) Depends"],
          answer: "A",
          explanation: "capacity() is always >= size() for std::string (or any standard container). Capacity is total allocated space; size is used space. Extra capacity avoids reallocations on growth."
        },
        {
          question: "What does this print? map<int, string> m; m[1] = "a"; cout << m.size();",
          options: ["A) 0", "B) 1", "C) 2", "D) Error"],
          answer: "B",
          explanation: "m[1] inserts key 1 with default value if not present, then assigns "a". Size becomes 1. If key existed, it would just update. operator[] always inserts if key missing."
        },
        {
          question: "What is the output? class A { public: A() { cout << "A"; } ~A() { cout << "~A"; } }; A* p = new A[3]; delete p;",
          options: ["A) AAA~A~A~A", "B) AAA~A", "C) Compile error", "D) Undefined Behavior"],
          answer: "D",
          explanation: "delete p on array allocated with new[] is UNDEFINED BEHAVIOR! Must use delete[] p. Only first destructor called, memory corrupted. Always match new/new[] with delete/delete[]."
        },
        {
          question: "What does this print? int x = 1; int& r = ++x; cout << r++;",
          options: ["A) 1", "B) 2", "C) 3", "D) Compile error"],
          answer: "B",
          explanation: "r is reference to x (which is 2 after ++x). r++ returns the original value (2) then increments x to 3. Post-increment on reference modifies the referenced object."
        },
        {
          question: "What is the output? template<typename T> void f(T&& x) {} f(5); What is T?",
          options: ["A) int", "B) int&", "C) int&&", "D) const int"],
          answer: "C",
          explanation: "Universal reference (T&& with deduced T): f(5) passes rvalue 5, so T deduces as int and parameter is int&&. For f(x) where x is lvalue, T deduces as int& and parameter is int& (reference collapsing)."
        },
        {
          question: "What does this print? struct S { int a; }; S s{1}; S s2 = s; cout << (&s.a == &s2.a);",
          options: ["A) 1", "B) 0", "C) Error", "D) Depends"],
          answer: "B",
          explanation: "s2 is a COPY of s, so they have different memory addresses. &s.a == &s2.a is false (0). Default copy constructor does member-wise copy, creating independent objects."
        }
      ],
      coding: [
        {
          title: "🔥 Custom Vector Implementation",
          description: `Implement a minimal std::vector-like class with proper memory management.

Must support: push_back, size, operator[], and Rule of Three/Five.

Test: push 100 elements, access by index, no leaks.`,
          starter: `#include <iostream>
#include <algorithm>
using namespace std;

template<typename T>
class MiniVector {
    T* data_;
    size_t size_;
    size_t capacity_;
public:
    MiniVector() : data_(nullptr), size_(0), capacity_(0) {}

    // Rule of Three/Five — implement these!
    ~MiniVector() { /* Your code */ }
    MiniVector(const MiniVector& other) { /* Your code */ }
    MiniVector& operator=(const MiniVector& other) { /* Your code */ return *this; }

    void push_back(const T& value) {
        // Your code: grow if needed, copy old data
    }

    T& operator[](size_t i) { return data_[i]; }
    size_t size() const { return size_; }
};

int main() {
    MiniVector<int> v;
    for(int i = 0; i < 5; i++) v.push_back(i * 10);
    for(int i = 0; i < 5; i++) cout << v[i] << " ";
    cout << endl;
    return 0;
}`,
          testCases: [
            { input: "push 0,10,20,30,40", expected: "0 10 20 30 40" }
          ],
          validator: (output) => output.includes('0') && output.includes('10') && output.includes('40')
        }
      ]
    }
  },
  java: {
    easy: {
      mcqs: [
        {
          question: "What is the output? System.out.println("hello".substring(0, 2));",
          options: ["A) he", "B) hel", "C) el", "D) h"],
          answer: "A",
          explanation: "substring(beginIndex, endIndex) — endIndex is EXCLUSIVE. substring(0,2) takes chars at 0 and 1 → 'he'. Common off-by-one trap!"
        },
        {
          question: "What does this print? String s = new String("hello"); String t = new String("hello"); System.out.println(s == t);",
          options: ["A) true", "B) false", "C) Compile error", "D) Depends"],
          answer: "B",
          explanation: "new String() creates NEW objects in heap. s == t compares references (memory addresses), not content. s.equals(t) would be true. String literals in pool would be ==."
        },
        {
          question: "What is the output? int[] a = {1,2,3}; int[] b = a; b[0] = 5; System.out.println(a[0]);",
          options: ["A) 1", "B) 5", "C) Error", "D) 0"],
          answer: "B",
          explanation: "Arrays are reference types in Java. b = a makes b point to the SAME array. Modifying b[0] modifies a[0] too. Both reference the same object in heap."
        },
        {
          question: "What does this print? System.out.println(5 / 2);",
          options: ["A) 2.5", "B) 2", "C) 2.0", "D) Compile error"],
          answer: "B",
          explanation: "Integer division in Java truncates toward zero. 5/2 = 2. Result is int. For floating-point: 5.0/2 or 5/2.0 = 2.5. Same trap as C/C++."
        },
        {
          question: "What is the output? String s = null; System.out.println(s + "hello");",
          options: ["A) nullhello", "B) hello", "C) NullPointerException", "D) Compile error"],
          answer: "A",
          explanation: "String concatenation with null converts null to string "null". So null + "hello" = "nullhello". But s.length() would throw NPE. Concatenation is safe with null."
        },
        {
          question: "What does this print? System.out.println("5" + 3 + 2);",
          options: ["A) 10", "B) 532", "C) 55", "D) Compile error"],
          answer: "B",
          explanation: "String + int = String concatenation (left to right). "5" + 3 = "53", then "53" + 2 = "532". For math: 3 + 2 + "5" = "55". Operator precedence + left associativity."
        },
        {
          question: "What is the output? final int x; x = 5; System.out.println(x);",
          options: ["A) 5", "B) Compile error", "C) 0", "D) Depends"],
          answer: "A",
          explanation: "final variables can be assigned ONCE. Declaration and assignment can be separate. But x = 5; x = 6; would be compile error. Must be assigned exactly once."
        },
        {
          question: "What does this print? System.out.println(Math.round(-1.5));",
          options: ["A) -1", "B) -2", "C) 1", "D) 2"],
          answer: "A",
          explanation: "Math.round() rounds to nearest integer, HALF_UP. -1.5 rounds toward positive infinity → -1. Math.round(-1.6) = -2. Math.round(1.5) = 2."
        },
        {
          question: "What is the output? Integer a = 100; Integer b = 100; System.out.println(a == b);",
          options: ["A) true", "B) false", "C) Depends on JVM", "D) Compile error"],
          answer: "A",
          explanation: "Java caches Integer objects for values -128 to 127. a and b both point to the SAME cached object for 100. But for 200: new objects created, == would be false. Always use .equals() for objects!"
        },
        {
          question: "What does this print? int x = 0; System.out.println(x++ + ++x);",
          options: ["A) 2", "B) 1", "C) 3", "D) 2 (but x becomes 2)"],
          answer: "A",
          explanation: "x++ returns 0, then x=1. ++x increments to 2, returns 2. Sum: 0 + 2 = 2. Final x = 2. This IS well-defined in Java (unlike C/C++) because Java has strict left-to-right evaluation."
        }
      ],
      coding: [
        {
          title: "🔥 StringBuilder vs String Trap",
          description: `Fix the performance bug: concatenating strings in a loop creates O(n²) objects.

Use StringBuilder to build the result efficiently.

Expected: Build a string of 1000 chars instantly.`,
          starter: `public class Main {
    public static void main(String[] args) {
        // FIX: Use StringBuilder instead of String
        String result = "";
        for(int i = 0; i < 1000; i++) {
            result += "a";  // O(n²) — creates new String each time!
        }
        System.out.println(result.length());

        // Your optimized version here:

    }
}`,
          testCases: [
            { input: "Build 1000 chars", expected: "1000" }
          ],
          validator: (output) => output.includes('1000')
        }
      ]
    },
    medium: {
      mcqs: [
        {
          question: "What is the output? List<Integer> list = Arrays.asList(1,2,3); list.add(4);",
          options: ["A) [1,2,3,4]", "B) UnsupportedOperationException", "C) Compile error", "D] null"],
          answer: "B",
          explanation: "Arrays.asList() returns a FIXED-SIZE list backed by the array. add() throws UnsupportedOperationException. Use new ArrayList<>(Arrays.asList(...)) for a mutable copy."
        },
        {
          question: "What does this print? System.out.println(new Integer(5) == new Integer(5));",
          options: ["A) true", "B) false", "C) Compile error", "D) Depends"],
          answer: "B",
          explanation: "new Integer(5) creates NEW objects. == compares references, so false. Integer.valueOf(5) == Integer.valueOf(5) is true (uses cache). new is the key difference here."
        },
        {
          question: "What is the output? String s = "hello"; s.concat(" world"); System.out.println(s);",
          options: ["A) hello world", "B) hello", "C) Compile error", "D) null"],
          answer: "B",
          explanation: "Strings are IMMUTABLE in Java! s.concat() returns a NEW string, doesn't modify s. Must do: s = s.concat(" world"). This is a classic Java string immutability trap."
        },
        {
          question: "What does this print? Map<String, Integer> map = new HashMap<>(); map.put("a", 1); System.out.println(map.get("b"));",
          options: ["A) 0", "B) null", "C) Compile error", "D) Exception"],
          answer: "B",
          explanation: "HashMap.get(key) returns null if key not found. No exception thrown. Must check containsKey() or use getOrDefault() to avoid NPE when autounboxing null to int."
        },
        {
          question: "What is the output? int x = Integer.parseInt("10"); System.out.println(x + 5);",
          options: ["A) 105", "B) 15", "C) Compile error", "D) NumberFormatException"],
          answer: "B",
          explanation: "Integer.parseInt("10") returns primitive int 10. x + 5 = 15 (integer addition). Not string concatenation because x is int, not String."
        },
        {
          question: "What does this print? Thread t = new Thread(() -> System.out.println("run")); t.run();",
          options: ["A) run (new thread)", "B) run (main thread)", "C) Nothing", "D) Compile error"],
          answer: "B",
          explanation: "t.run() calls run() DIRECTLY on current thread (main). t.start() creates a NEW thread. Calling run() directly is a common bug — it doesn't spawn a thread!"
        },
        {
          question: "What is the output? System.out.println("\u0041");",
          options: ["A) \u0041", "B) A", "C) 65", "D) Compile error"],
          answer: "B",
          explanation: "\u0041 is a Unicode escape for 'A' (0x41 = 65 = 'A'). Processed at compile time, not runtime. Anywhere in code, \u0041 becomes 'A' before compilation continues."
        },
        {
          question: "What does this print? int[] a = new int[3]; System.out.println(a[0]);",
          options: ["A) Garbage", "B) 0", "C) null", "D) Compile error"],
          answer: "B",
          explanation: "Java initializes array elements to default values: 0 for int, 0.0 for double, false for boolean, null for objects. a[0] = 0. Local variables (non-array) are NOT initialized."
        },
        {
          question: "What is the output? String s1 = "hello"; String s2 = "he" + "llo"; System.out.println(s1 == s2);",
          options: ["A) false", "B) true", "C) Compile error", "D) Depends"],
          answer: "B",
          explanation: "String literals are interned. "he" + "llo" is computed at compile-time to "hello", which is already in the string pool. s1 and s2 reference the SAME interned string."
        },
        {
          question: "What does this print? try { return; } finally { System.out.print("F"); }",
          options: ["A) Nothing", "B) F", "C) Compile error", "D) Exception"],
          answer: "B",
          explanation: "finally ALWAYS executes before method returns, even if try has return. Output: 'F'. This is how cleanup code guarantees execution. Even System.exit() in try won't stop finally... actually it does."
        }
      ],
      coding: [
        {
          title: "🔥 Thread-Safe Singleton",
          description: `Implement a thread-safe Singleton using double-checked locking.

Must be lazy-initialized AND work correctly with multiple threads.

Expected: Only one instance ever created.`,
          starter: `public class Main {
    public static void main(String[] args) {
        // Test: Create 100 threads, all should get same instance
        Singleton s1 = Singleton.getInstance();
        Singleton s2 = Singleton.getInstance();
        System.out.println(s1 == s2);
        System.out.println(s1.hashCode() == s2.hashCode());
    }
}

class Singleton {
    // FIX: Add volatile and double-checked locking
    private static Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        // Your code here
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}`,
          testCases: [
            { input: "getInstance() x2", expected: "true true" }
          ],
          validator: (output) => output.includes('true')
        }
      ]
    }
  },
  javascript: {
    easy: {
      mcqs: [
        {
          question: "What is the output? console.log(typeof []);",
          options: ["A) array", "B) object", "C) Array", "D) undefined"],
          answer: "B",
          explanation: "Arrays are objects in JavaScript. typeof [] returns 'object'. To check arrays: Array.isArray([]) → true. This is a long-standing JS quirk — typeof null is also 'object'!"
        },
        {
          question: "What does this print? console.log(0.1 + 0.2 === 0.3);",
          options: ["A) true", "B) false", "C) Error", "D) NaN"],
          answer: "B",
          explanation: "Same IEEE 754 issue as Python/C. 0.1 + 0.2 = 0.30000000000000004. Use Number.EPSILON or toFixed() for comparisons. This is the most famous JS 'bug' that isn't a bug."
        },
        {
          question: "What is the output? console.log('5' - 3);",
          options: ["A) '53'", "B) 2", "C) NaN", "D) '2'"],
          answer: "B",
          explanation: "'5' - 3: subtraction triggers numeric conversion. '5' → 5, then 5 - 3 = 2. BUT '5' + 3 = '53' (concatenation). + is overloaded for strings; - is not."
        },
        {
          question: "What does this print? console.log(1 + '2' + 3);",
          options: ["A) 6", "B) '123'", "C) '15'", "D) NaN"],
          answer: "B",
          explanation: "Left to right: 1 + '2' = '12' (string concat). '12' + 3 = '123'. Once a string appears, + becomes concatenation. 1 + 2 + '3' = '33' — different result!"
        },
        {
          question: "What is the output? console.log([] == ![]);",
          options: ["A) true", "B) false", "C) Error", "D) NaN"],
          answer: "A",
          explanation: "The most cursed JS equality: ![] = false (array is truthy). [] == false: array → empty string → 0, false → 0. So 0 == 0 = true. Abstract equality comparison is wild."
        },
        {
          question: "What does this print? console.log(typeof NaN);",
          options: ["A) NaN", "B) number", "C) undefined", "D) 'NaN'"],
          answer: "B",
          explanation: "NaN is 'Not a Number' but its type is 'number'. Ironic but true per IEEE 754. Use Number.isNaN() to check, not typeof. isNaN('abc') coerces; Number.isNaN() doesn't."
        },
        {
          question: "What is the output? let a = {}; console.log(a['constructor'] === a.constructor);",
          options: ["A) true", "B) false", "C) undefined", "D) Error"],
          answer: "A",
          explanation: "a.constructor is inherited from Object.prototype. a['constructor'] accesses the same property via bracket notation. Both reference Object. Dot and bracket notation are equivalent here."
        },
        {
          question: "What does this print? console.log(1 < 2 < 3); console.log(3 > 2 > 1);",
          options: ["A) true true", "B) true false", "C) false false", "D) Error"],
          answer: "B",
          explanation: "Left-to-right: 1 < 2 = true. true < 3 → true coerces to 1. 1 < 3 = true. For 3 > 2 > 1: 3 > 2 = true. true > 1 → 1 > 1 = false. Chained comparisons don't work like math!"
        },
        {
          question: "What is the output? console.log([] + []);",
          options: ["A) '[]'", "B) ''", "C) []", "D) undefined"],
          answer: "B",
          explanation: "[] converts to empty string via ToPrimitive. '' + '' = ''. Similarly [] + {} = '[object Object]' and {} + [] = 0 (parsed as empty block + unary +[]). JS coercion is an adventure."
        },
        {
          question: "What does this print? console.log(typeof (() => {}));",
          options: ["A) function", "B) object", "C) arrow", "D) undefined"],
          answer: "A",
          explanation: "All functions (including arrow functions, classes, async functions) have typeof 'function'. Functions are callable objects but typeof distinguishes them. typeof class Foo {} is also 'function'."
        }
      ],
      coding: [
        {
          title: "🔥 Closure Trap Fix",
          description: `Fix the classic closure bug in a loop. All buttons currently alert the same number.

Make each button alert its own index (0, 1, 2).

Use let, IIFE, or forEach to create proper closure scope.`,
          starter: `// Fix: Each button should alert its own index
for (var i = 0; i < 3; i++) {
    const btn = document.createElement('button');
    btn.textContent = 'Button ' + i;
    btn.onclick = function() {
        alert(i);  // BUG: Always alerts 3!
    };
    document.body.appendChild(btn);
}

// Your fix here (test with console.log instead of alert):
for (var i = 0; i < 3; i++) {
    // ...
}`,
          testCases: [
            { input: "Click buttons 0,1,2", expected: "0, 1, 2" }
          ],
          validator: (output) => true  // Visual test
        }
      ]
    },
    medium: {
      mcqs: [
        {
          question: "What is the output? console.log(typeof typeof 1);",
          options: ["A) number", "B) string", "C) undefined", "D) object"],
          answer: "B",
          explanation: "typeof 1 = 'number' (a string). typeof 'number' = 'string'. typeof always returns a string, so typeof anything = 'string', 'number', 'object', etc. Nested typeof always ends at 'string'."
        },
        {
          question: "What does this print? const obj = { a: 1 }; const copy = { ...obj }; copy.a = 2; console.log(obj.a);",
          options: ["A) 1", "B) 2", "C) undefined", "D) Error"],
          answer: "A",
          explanation: "Spread syntax {...obj} creates a SHALLOW copy. copy and obj are different objects. Modifying copy.a doesn't affect obj.a. But nested objects would still be shared!"
        },
        {
          question: "What is the output? console.log(Promise.resolve(1).then(x => x + 1).then(x => console.log(x)));",
          options: ["A) 1, then Promise", "B) 2, then undefined", "C) Promise, then 2", "D) 2, then Promise"],
          answer: "D",
          explanation: "then() returns a NEW Promise. console.log() inside then prints 2. The outer console.log prints the returned Promise (pending/resolved). Order: inner 2 first (microtask), then Promise object."
        },
        {
          question: "What does this print? console.log([10, 5, 1].sort());",
          options: ["A) [1, 5, 10]", "B) [1, 10, 5]", "C) [10, 5, 1]", "D) Error"],
          answer: "B",
          explanation: "Array.sort() converts elements to STRINGS and sorts lexicographically! '10' < '5' because '1' < '5'. For numeric sort: .sort((a,b) => a - b). One of JS's most dangerous defaults."
        },
        {
          question: "What is the output? async function f() { return 1; } console.log(f());",
          options: ["A) 1", "B) Promise {<fulfilled>: 1}", "C) undefined", "D) Error"],
          answer: "B",
          explanation: "async functions ALWAYS return a Promise. return 1 wraps it in Promise.resolve(1). To get 1: await f() or f().then(x => console.log(x)). The console shows the Promise object itself."
        },
        {
          question: "What does this print? console.log(0 == '0'); console.log(0 === '0');",
          options: ["A) true true", "B) true false", "C) false false", "D) Error"],
          answer: "B",
          explanation: "== does type coercion: '0' → 0, so 0 == 0 = true. === checks type AND value: number !== string, so false. Always use === and !== to avoid coercion bugs."
        },
        {
          question: "What is the output? const a = { x: 1 }; const b = a; b.x = 2; console.log(a.x);",
          options: ["A) 1", "B) 2", "C) undefined", "D) Error"],
          answer: "B",
          explanation: "Objects are passed by REFERENCE. b = a makes b point to the same object. b.x = 2 modifies the shared object. a.x is also 2. Use structuredClone() or JSON.parse(JSON.stringify()) for deep copy."
        },
        {
          question: "What does this print? console.log([] == 0); console.log('' == 0); console.log(false == 0);",
          options: ["A) false false false", "B) true true true", "C) true false true", "D) Error"],
          answer: "B",
          explanation: "All true due to abstract equality coercion: [] → '' → 0. '' → 0. false → 0. This is why === exists. The spec's ToPrimitive and ToNumber rules create these surprising equalities."
        },
        {
          question: "What is the output? function foo() { console.log(this); } foo();",
          options: ["A) foo", "B) window/global", "C) undefined", "D) Error"],
          answer: "B",
          explanation: "In non-strict mode, this in a regular function call refers to global object (window in browser, global in Node). In strict mode: undefined. Arrow functions inherit this from enclosing scope."
        },
        {
          question: "What does this print? console.log((function(){}).constructor === Function);",
          options: ["A) true", "B) false", "C) undefined", "D) Error"],
          answer: "A",
          explanation: "All functions (declarations, expressions, arrows) are instances of Function. (function(){}).constructor is Function. Even (()=>{}).constructor === Function is true."
        }
      ],
      coding: [
        {
          title: "🔥 Debounce Implementation",
          description: `Implement a debounce function that delays execution until after wait milliseconds of inactivity.

Must handle: leading/trailing options, proper this context, argument passing.

Test: rapid calls should only execute once after delay.`,
          starter: `function debounce(func, wait, options = {}) {
    // Your implementation
    // Hint: Use setTimeout, clearTimeout
    // options.leading: execute on first call
    // options.trailing: execute after delay
}

// Test
let count = 0;
const increment = debounce(() => {
    count++;
    console.log('Called:', count);
}, 100);

increment();
increment();
increment();
// Should only print once after 100ms

setTimeout(() => console.log('Final count:', count), 200);`,
          testCases: [
            { input: "3 rapid calls", expected: "count=1 after delay" }
          ],
          validator: (output) => output.includes('1') || output.includes('Called')
        }
      ]
    }
  },
  sql: {
    easy: {
      mcqs: [
        {
          question: "What does SELECT NULL = NULL return?",
          options: ["A) TRUE", "B) FALSE", "C) NULL", "D) Error"],
          answer: "C",
          explanation: "NULL represents unknown, so NULL = NULL is UNKNOWN (returns NULL). Use IS NULL to check for NULL. This is SQL's three-valued logic: TRUE, FALSE, UNKNOWN."
        },
        {
          question: "What is the output? SELECT COUNT(*) FROM (VALUES (1), (NULL), (3)) AS t(x);",
          options: ["A) 2", "B) 3", "C) NULL", "D) Error"],
          answer: "B",
          explanation: "COUNT(*) counts ALL rows, including those with NULL values. COUNT(x) would return 2 (only non-NULL). COUNT(*) vs COUNT(column) is a classic SQL interview trap."
        },
        {
          question: "What does this return? SELECT 1/2;",
          options: ["A) 0.5", "B) 0", "C) 0.50", "D) Error"],
          answer: "B",
          explanation: "Integer division in SQL! 1 and 2 are integers, so 1/2 = 0 (truncated). For decimal: SELECT 1.0/2 or SELECT CAST(1 AS FLOAT)/2 → 0.5. This varies slightly by database."
        },
        {
          question: "What is the result? SELECT * FROM users WHERE age BETWEEN 20 AND 30; Does it include 20 and 30?",
          options: ["A) Yes, inclusive", "B) No, exclusive", "C) Depends on database", "D) Only 20"],
          answer: "A",
          explanation: "BETWEEN is INCLUSIVE on both ends: age >= 20 AND age <= 30. Many assume it's exclusive like Python range(). It's equivalent to: age >= 20 AND age <= 30."
        },
        {
          question: "What does SELECT DISTINCT COUNT(*) FROM employees return?",
          options: ["A) Number of unique employees", "B) 1", "C) Error", "D) Same as COUNT(*)"],
          answer: "B",
          explanation: "COUNT(*) returns a single number. DISTINCT of a single value is just that value. So DISTINCT COUNT(*) always returns 1 row with 1 value. DISTINCT is meaningless here."
        },
        {
          question: "What is the output? SELECT COALESCE(NULL, NULL, 5, 10);",
          options: ["A) NULL", "B) 5", "C) 10", "D) Error"],
          answer: "B",
          explanation: "COALESCE returns the FIRST non-NULL value from left to right. NULL, NULL, 5, 10 → 5. It's like a NULL-safe fallback chain. ISNULL (SQL Server) and NVL (Oracle) are similar."
        },
        {
          question: "What does this return? SELECT * FROM orders LIMIT 5 OFFSET 10;",
          options: ["A) Rows 10-15", "B) Rows 11-15", "C) First 5 rows after skipping 10", "D) Both B and C"],
          answer: "D",
          explanation: "OFFSET 10 skips first 10 rows. LIMIT 5 returns next 5 rows. So rows 11-15 (1-indexed) or index 10-14 (0-indexed). Different databases use different syntax: TOP, FETCH FIRST, ROWNUM."
        },
        {
          question: "What is the result? SELECT '5' + 3;",
          options: ["A) 8", "B) '53'", "C) 53", "D) Error"],
          answer: "A",
          explanation: "In standard SQL, '5' is implicitly cast to number when used with +. Result: 8. But in some databases (MySQL with strict mode), this might warn. String concatenation uses || or CONCAT()."
        },
        {
          question: "What does SELECT CASE WHEN 1=1 THEN 'A' WHEN 2=2 THEN 'B' END return?",
          options: ["A) A", "B) B", "C) AB", "D) NULL"],
          answer: "A",
          explanation: "CASE evaluates conditions in order and returns the FIRST match. 1=1 is true, so returns 'A'. It never reaches 2=2. For multiple matches, only the first is returned."
        },
        {
          question: "What is the output? SELECT COUNT(column) vs SELECT COUNT(*) when column has NULLs?",
          options: ["A) Both same", "B) COUNT(*) is larger", "C) COUNT(column) is larger", "D) Depends"],
          answer: "B",
          explanation: "COUNT(*) counts all rows. COUNT(column) counts only non-NULL values in that column. If column has NULLs, COUNT(*) > COUNT(column). This is a very common reporting bug!"
        }
      ],
      coding: [
        {
          title: "🔥 Find Duplicate Emails",
          description: `Find all duplicate emails in the users table.

Return only the duplicate emails (not the original), sorted alphabetically.

Expected: only@example.com appears twice → include it.`,
          starter: `-- Create test data
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT,
    name TEXT
);

INSERT INTO users VALUES
(1, 'alice@example.com', 'Alice'),
(2, 'bob@example.com', 'Bob'),
(3, 'alice@example.com', 'Alice2'),
(4, 'charlie@example.com', 'Charlie'),
(5, 'bob@example.com', 'Bob2');

-- Your query here:
-- Expected output: alice@example.com, bob@example.com`,
          testCases: [
            { input: "Find duplicates", expected: "alice@example.com, bob@example.com" }
          ],
          validator: (output) => output.includes('alice') && output.includes('bob')
        }
      ]
    },
    medium: {
      mcqs: [
        {
          question: "What does SELECT * FROM A LEFT JOIN B ON A.id = B.id WHERE B.id IS NULL return?",
          options: ["A) All rows from A", "B) Rows in A not in B", "C) Rows in both A and B", "D) Error"],
          answer: "B",
          explanation: "LEFT JOIN + WHERE B.id IS NULL is the classic 'NOT EXISTS' pattern. It returns rows in A that have NO matching row in B. This is how you find orphaned records or missing data."
        },
        {
          question: "What is the output? SELECT 1 UNION SELECT 1 UNION ALL SELECT 1;",
          options: ["A) 1 row", "B) 2 rows", "C) 3 rows", "D) Error"],
          answer: "B",
          explanation: "UNION removes duplicates, UNION ALL keeps them. First two 1s: UNION removes duplicate → 1 row. Then UNION ALL with third 1 → 2 rows total. UNION is slower due to deduplication."
        },
        {
          question: "What does this return? SELECT * FROM table1, table2;",
          options: ["A) Inner join", "B) Cross join (Cartesian product)", "C) Error", "D) Left join"],
          answer: "B",
          explanation: "Comma-separated tables without JOIN condition creates a CROSS JOIN (Cartesian product): every row from table1 paired with every row from table2. Can explode to m×n rows. Always specify JOIN conditions!"
        },
        {
          question: "What is the result? UPDATE users SET age = age + 1 WHERE age = NULL;",
          options: ["A) All ages incremented", "B) No rows updated", "C) Error", "D) NULL set to 1"],
          answer: "B",
          explanation: "age = NULL is always UNKNOWN (not TRUE), so no rows match. Use age IS NULL to find NULL values. This is a silent bug — no error, just no updates. Very dangerous in production!"
        },
        {
          question: "What does SELECT GREATEST(1, NULL, 3) return?",
          options: ["A) 3", "B) 1", "C) NULL", "D) Error"],
          answer: "C",
          explanation: "Most aggregate/comparison functions return NULL if ANY argument is NULL. GREATEST(1, NULL, 3) = NULL. Use COALESCE: GREATEST(1, COALESCE(x, 0), 3) to handle NULLs safely."
        },
        {
          question: "What is the output? SELECT * FROM (SELECT 1 AS a) AS x, (SELECT 2 AS a) AS y;",
          options: ["A) Error: duplicate column name", "B) 1 row with a=1, a=2", "C) 2 rows", "D) 1 row, first a wins"],
          answer: "B",
          explanation: "This works! Derived tables x and y both have column 'a', but they're in different tables. Result has two columns both named 'a'. Some databases might require aliases. It's valid but confusing."
        },
        {
          question: "What does SELECT 1/0 return?",
          options: ["A) Infinity", "B) NULL", "C) Error", "D) 0"],
          answer: "C",
          explanation: "Division by zero is an ERROR in standard SQL (and most databases). Some databases return NULL or Infinity with special settings, but standard behavior is to throw an error. Use NULLIF(denominator, 0) to prevent."
        },
        {
          question: "What is the result? SELECT * FROM users ORDER BY RANDOM() LIMIT 1;",
          options: ["A) First user", "B) Random user", "C) Error", "D) Last user"],
          answer: "B",
          explanation: "RANDOM() (or RAND() in MySQL) generates a random number for each row. ORDER BY RANDOM() sorts randomly, LIMIT 1 picks one. This is how you get a random row. Note: not efficient for large tables."
        },
        {
          question: "What does this print? WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM nums WHERE n < 3) SELECT * FROM nums;",
          options: ["A) 1, 2, 3", "B) 1, 2, 3, 4", "C) Infinite loop", "D) Error"],
          answer: "A",
          explanation: "Recursive CTE: starts with 1, then adds 1 each iteration until n < 3 is false. Generates 1, 2, 3. The WHERE clause prevents infinite recursion. CTEs are powerful for hierarchical/tree data."
        },
        {
          question: "What is the output? SELECT TRIM('  hello  ');",
          options: ["A) '  hello'", "B) 'hello  '", "C) 'hello'", "D) '  hello  '"],
          answer: "C",
          explanation: "TRIM() removes leading AND trailing whitespace. Result: 'hello'. For leading only: LTRIM(). For trailing only: RTRIM(). For specific characters: TRIM(BOTH 'x' FROM 'xxhelloxx')."
        }
      ],
      coding: [
        {
          title: "🔥 Running Total & Rank",
          description: `Calculate running total of sales and rank employees by total sales.

Use window functions: SUM() OVER and RANK().

Expected: Each row shows cumulative sales up to that row.`,
          starter: `-- Create sales data
CREATE TABLE sales (
    employee TEXT,
    month TEXT,
    amount INTEGER
);

INSERT INTO sales VALUES
('Alice', 'Jan', 100),
('Alice', 'Feb', 150),
('Alice', 'Mar', 200),
('Bob', 'Jan', 80),
('Bob', 'Feb', 120);

-- Query 1: Running total per employee
-- Expected: Alice Jan 100, Alice Feb 250, Alice Mar 450

-- Query 2: Rank employees by total sales
-- Expected: Alice 450 (rank 1), Bob 200 (rank 2)`,
          testCases: [
            { input: "Running total", expected: "100, 250, 450" },
            { input: "Rank", expected: "Alice rank 1, Bob rank 2" }
          ],
          validator: (output) => output.includes('100') && output.includes('250') && output.includes('450')
        }
      ]
    }
  }
};

// ═════════════════════════════════════════════════════════════
// REACT COMPONENT
// ═════════════════════════════════════════════════════════════

function ChallengeSystem() {
  const [step, setStep] = useState('select'); // select, mcq, coding, result
  const [language, setLanguage] = useState('python');
  const [difficulty, setDifficulty] = useState('easy');
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [code, setCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [codeRunning, setCodeRunning] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [score, setScore] = useState({ mcq: 0, coding: 0, total: 0 });
  const [challengeComplete, setChallengeComplete] = useState(false);

  const langData = CHALLENGE_QUESTIONS[language];
  const currentChallenge = langData ? langData[difficulty] : null;

  function startChallenge(lang, diff) {
    setLanguage(lang);
    setDifficulty(diff);
    setMcqAnswers({});
    setMcqSubmitted(false);
    setCode('');
    setCodeOutput('');
    setScore({ mcq: 0, coding: 0, total: 0 });
    setChallengeComplete(false);
    setStep('mcq');
    trackEvent('challenge_start', { language: lang, difficulty: diff });
  }

  function submitMCQs() {
    if (!currentChallenge) return;
    let correct = 0;
    currentChallenge.mcqs.forEach((q, idx) => {
      if (mcqAnswers[idx] === q.answer) correct++;
    });
    const mcqScore = Math.round((correct / currentChallenge.mcqs.length) * 100);
    setScore(s => ({ ...s, mcq: mcqScore }));
    setMcqSubmitted(true);

    if (currentChallenge.coding.length > 0) {
      setCode(currentChallenge.coding[0].starter);
    }

    setTimeout(() => setStep('coding'), 1500);
  }

  async function runChallengeCode() {
    if (!code.trim() || !currentChallenge) return;
    setCodeRunning(true);
    setCodeOutput('');
    setCodeError(false);

    const problem = currentChallenge.coding[0];

    try {
      if (language === 'sql') {
        if (!window.initSqlJs) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js");
        }
        const SQL = await window.initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}` });
        const db = new SQL.Database();

        const statements = code.split(";").map(s => s.trim()).filter(s => s.length > 0);
        let result = "";
        for (const stmt of statements) {
          try {
            const res = db.exec(stmt + ";");
            if (res.length > 0) {
              const { columns, values } = res[0];
              result += columns.join(" | ") + "\n";
              result += values.map(row => row.join(" | ")).join("\n") + "\n";
            }
          } catch (e) { result += `Error: ${e.message}\n`; }
        }
        setCodeOutput(result || "Query executed");

        const passed = problem.validator(result);
        if (passed) {
          setScore(s => ({ ...s, coding: 100, total: Math.round((s.mcq + 100) / 2) }));
        } else {
          setScore(s => ({ ...s, coding: 0, total: Math.round(s.mcq / 2) }));
        }
      } else {
        const compilerMap = {
          python: 'python-3.14',
          c: 'gcc-15',
          cpp: 'g++-15',
          java: 'openjdk-25',
          javascript: 'typescript-deno'
        };

        const res = await fetch("/api/run-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compiler: compilerMap[language], code, input: "" })
        });
        const data = await res.json();
        const out = data?.output || "";
        const err = data?.error || data?.message || "";

        if (err.trim()) {
          setCodeOutput(err.trim());
          setCodeError(true);
          setScore(s => ({ ...s, coding: 0, total: Math.round(s.mcq / 2) }));
        } else {
          setCodeOutput(out.trim() || "(No output)");
          const passed = problem.validator(out);
          const codingScore = passed ? 100 : 30;
          setScore(s => ({ ...s, coding: codingScore, total: Math.round((s.mcq + codingScore) / 2) }));
        }
      }
    } catch (e) {
      setCodeOutput("Error: " + e.message);
      setCodeError(true);
    }
    setCodeRunning(false);
  }

  function finishChallenge() {
    setChallengeComplete(true);
    setStep('result');
    trackEvent('challenge_complete', { language, difficulty, score: score.total });
    if (score.total >= 70) fireConfetti();
  }

  // Language selector
  if (step === 'select') {
    return (
      <section id="challenges" style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>◆ Coding Challenges</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>Test Your Skills</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginTop: "14px", fontSize: "1rem" }}>10 MCQs + live coding problems · Auto-graded · Earn badges</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { id: 'python', icon: '🐍', name: 'Python', desc: 'Data structures, algorithms, OOP' },
            { id: 'c', icon: '⚙️', name: 'C', desc: 'Pointers, memory, systems' },
            { id: 'cpp', icon: '🔷', name: 'C++', desc: 'STL, OOP, competitive' },
            { id: 'java', icon: '☕', name: 'Java', desc: 'Collections, multithreading' },
            { id: 'javascript', icon: '🌐', name: 'JavaScript', desc: 'ES6+, async, DOM' },
            { id: 'sql', icon: '🗄️', name: 'SQL', desc: 'Queries, joins, optimization' }
          ].map(lang => (
            <div key={lang.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px", transition: "all 0.3s", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,224,0.3)"; e.currentTarget.style.background = "rgba(0,255,224,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{lang.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "6px", color: "#fff" }}>{lang.name}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>{lang.desc}</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => startChallenge(lang.id, 'easy')} style={{ flex: 1, background: "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "8px", padding: "10px", color: "#00ffe0", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700 }}>
                  Easy
                </button>
                <button onClick={() => startChallenge(lang.id, 'medium')} style={{ flex: 1, background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: "8px", padding: "10px", color: "#febc2e", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700 }}>
                  Medium
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // MCQ Section
  if (step === 'mcq' && currentChallenge) {
    return (
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ marginBottom: "32px" }}>
          <button onClick={() => setStep('select')} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", marginBottom: "20px" }}>← Back to Languages</button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase" }}>◆ {language.toUpperCase()} · {difficulty.toUpperCase()}</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>Multiple Choice Questions</h2>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>10 tricky questions · Score 70%+ to unlock coding challenge</div>
        </div>

        {currentChallenge.mcqs.map((q, idx) => (
          <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#00ffe0", marginBottom: "12px" }}>QUESTION {idx + 1} / {currentChallenge.mcqs.length}</div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "16px", lineHeight: 1.5 }}>{q.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {q.options.map(opt => {
                const isSelected = mcqAnswers[idx] === opt[0];
                const showCorrect = mcqSubmitted && opt[0] === q.answer;
                const showWrong = mcqSubmitted && isSelected && opt[0] !== q.answer;
                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.08)";
                let color = "rgba(255,255,255,0.8)";
                if (showCorrect) { bg = "rgba(0,255,224,0.12)"; border = "1px solid #00ffe0"; color = "#00ffe0"; }
                else if (showWrong) { bg = "rgba(255,80,80,0.1)"; border = "1px solid #ff6b6b"; color = "#ff6b6b"; }
                else if (isSelected && !mcqSubmitted) { bg = "rgba(0,255,224,0.08)"; border = "1px solid rgba(0,255,224,0.3)"; }

                return (
                  <button key={opt} onClick={() => !mcqSubmitted && setMcqAnswers({...mcqAnswers, [idx]: opt[0]})}
                    style={{ background: bg, border, borderRadius: "10px", padding: "12px 16px", color, fontSize: "0.85rem", cursor: mcqSubmitted ? "default" : "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {mcqSubmitted && (
              <div style={{ marginTop: "12px", padding: "12px", background: "rgba(0,255,224,0.04)", borderRadius: "8px", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}

        {!mcqSubmitted ? (
          <button onClick={submitMCQs} disabled={Object.keys(mcqAnswers).length < currentChallenge.mcqs.length}
            style={{ width: "100%", background: Object.keys(mcqAnswers).length < currentChallenge.mcqs.length ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "12px", padding: "16px", color: Object.keys(mcqAnswers).length < currentChallenge.mcqs.length ? "rgba(255,255,255,0.3)" : "#000", fontWeight: 700, fontSize: "0.9rem", cursor: Object.keys(mcqAnswers).length < currentChallenge.mcqs.length ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace" }}>
            Submit Answers →
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", background: "rgba(0,255,224,0.06)", borderRadius: "12px", border: "1px solid rgba(0,255,224,0.2)" }}>
            <div style={{ color: "#00ffe0", fontSize: "1.1rem", fontWeight: 700 }}>MCQ Score: {score.mcq}%</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "8px" }}>Moving to coding challenge...</div>
          </div>
        )}
      </section>
    );
  }

  // Coding Section
  if (step === 'coding' && currentChallenge) {
    const problem = currentChallenge.coding[0];
    return (
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <button onClick={() => setStep('select')} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", marginBottom: "20px" }}>← Back to Languages</button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase" }}>◆ CODING PROBLEM</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, marginTop: "8px" }}>{problem.title}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#00ffe0", marginBottom: "12px", letterSpacing: "0.1em" }}>DESCRIPTION</div>
            <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{problem.description}</div>

            <div style={{ marginTop: "20px", fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#00ffe0", marginBottom: "10px", letterSpacing: "0.1em" }}>TEST CASES</div>
            {problem.testCases.map((tc, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px 14px", marginBottom: "8px", fontSize: "0.8rem" }}>
                <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>Input: {tc.input}</div>
                <div style={{ color: "#00ffe0" }}>Expected: {tc.expected}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{language.toUpperCase()} Editor</span>
              <button onClick={() => setCode(problem.starter)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 12px", color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>Reset</button>
            </div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={16}
              style={{ width: "100%", background: "#0d1117", border: "none", padding: "16px", color: "#e6edf3", fontFamily: "'Space Mono', monospace", fontSize: "0.82rem", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button onClick={runChallengeCode} disabled={codeRunning}
            style={{ background: codeRunning ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "12px 28px", color: codeRunning ? "rgba(255,255,255,0.3)" : "#000", fontWeight: 700, fontSize: "0.85rem", cursor: codeRunning ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace", display: "flex", alignItems: "center", gap: "8px" }}>
            {codeRunning ? <><span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Running...</> : "▶ Run Code"}
          </button>
          <button onClick={finishChallenge} disabled={!codeOutput}
            style={{ background: !codeOutput ? "rgba(255,255,255,0.06)" : "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "10px", padding: "12px 28px", color: !codeOutput ? "rgba(255,255,255,0.3)" : "#00ffe0", fontWeight: 700, fontSize: "0.85rem", cursor: !codeOutput ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace" }}>
            Submit Solution →
          </button>
        </div>

        {codeOutput && (
          <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: codeError ? "#ff6b6b" : "#00ffe0", marginBottom: "10px", letterSpacing: "0.1em" }}>{codeError ? "⚠ ERROR" : "◆ OUTPUT"}</div>
            <pre style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: "0.82rem", color: codeError ? "#ff6b6b" : "rgba(255,255,255,0.85)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{codeOutput}</pre>
          </div>
        )}
      </section>
    );
  }

  // Results
  if (step === 'result') {
    const passed = score.total >= 70;
    return (
      <section style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>{passed ? "🏆" : "📊"}</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
          {passed ? "Challenge Passed!" : "Challenge Completed"}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "32px" }}>
          {passed ? "Great job! You've demonstrated solid skills." : "Keep practicing! Review the explanations and try again."}
        </p>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "24px" }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>MCQ SCORE</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, color: score.mcq >= 70 ? "#00ffe0" : "#febc2e" }}>{score.mcq}%</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>CODING SCORE</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, color: score.coding >= 70 ? "#00ffe0" : "#febc2e" }}>{score.coding}%</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>TOTAL</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.5rem", fontWeight: 800, color: passed ? "#00ffe0" : "#ff6b6b" }}>{score.total}%</div>
            </div>
          </div>

          {passed && (
            <div style={{ background: "rgba(0,255,224,0.06)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "10px", padding: "16px", fontSize: "0.85rem", color: "#00ffe0" }}>
              🎯 <strong>Earned:</strong> {language.charAt(0).toUpperCase() + language.slice(1)} {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Badge
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => setStep('select')} style={{ background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "14px 28px", color: "#000", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
            Try Another Challenge →
          </button>
          <button onClick={() => { navigator.clipboard.writeText(`I scored ${score.total}% on ZeroAPI ${language.toUpperCase()} ${difficulty} challenge!`); alert('Score copied!'); }}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px 24px", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
            📋 Share Score
          </button>
        </div>
      </section>
    );
  }

  return null;
}

export default ChallengeSystem;
