const post = {
  "slug": "part-1-oop-fundamentals",
  "seriesSlug": "oop-cpp-mastery",
  "partNumber": 1,
  "totalParts": 6,
  "title": "Introduction to Object Oriented Thinking & OOP (Part 1)",
  "seriesTitle": "Object-Oriented Programming in C++: The Exam Mastery Series",
  "date": "August 7, 2026",
  "readTime": "30 min read",
  "category": "Object Oriented Programming",
  "categoryColor": "#3b82f6",
  "excerpt": "Procedural vs OOP, features of the OO paradigm, merits and demerits, the Object model, and C++ basics — I/O, data types, type conversion, control statements, loops, and arrays.",
  "coverEmoji": "🧩",
  "tags": [
    "C++",
    "OOP",
    "Fundamentals",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Every OOP paper starts here: can you explain why object oriented programming exists, and can you still write clean, correct C++ for basic tasks? This part builds both. You will get exam-ready definitions for procedural vs OOP, the four pillars, the Object Model, and then move through the C++ fundamentals — I/O, data types, type conversion, control statements, loops, and arrays — that every later unit assumes you already know cold."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Compare procedural and object oriented programming' (5-7 marks), 'Explain features of OOP' (5 marks), 'What are the merits and demerits of OOP?' (3-5 marks), and short programming questions on control flow, loops, or arrays (5-10 marks)."
    },
    {
      "type": "h2",
      "text": "Procedural Programming vs Object Oriented Programming"
    },
    {
      "type": "p",
      "text": "Procedural programming organizes a program as a sequence of instructions grouped into functions. Data is typically global or passed explicitly between functions, and functions operate on data that they don't own. Object oriented programming instead organizes a program as a collection of objects, each bundling its own data (attributes) and the functions (methods) that operate on that data."
    },
    {
      "type": "table",
      "headers": ["Aspect", "Procedural Programming", "Object Oriented Programming"],
      "rows": [
        ["Design Approach", "Top-down: break the problem into a sequence of steps", "Bottom-up: identify the real-world entities involved first"],
        ["Data Handling", "Data is usually global or passed between functions", "Data is bundled inside objects and hidden (private)"],
        ["Unit of Program", "Function", "Object (class instance)"],
        ["Security", "Low — any function can modify shared data", "High — access controlled via access modifiers"],
        ["Code Reuse", "Achieved by copying code or calling functions", "Achieved through inheritance"],
        ["Extending the Program", "Requires editing many existing functions", "New classes can be added with minimal change to old code"],
        ["Example Languages", "C, Pascal, FORTRAN", "C++, Java, Python"]
      ]
    },
    {
      "type": "callout",
      "icon": "🍳",
      "text": "Real-life analogy: procedural programming is like following a recipe step by step — chop, mix, bake, in that exact order, and the ingredients (data) just sit on the counter for anyone to touch. OOP is like a restaurant kitchen with different chefs (objects) — the pastry chef owns the pastry ingredients and only they touch them, the grill chef owns the grill station. Each chef (object) manages their own resources and exposes a simple interface: 'order ready' — the rest of the kitchen doesn't need to know how it was made."
    },
    {
      "type": "code-block",
      "label": "The Same Problem: Procedural vs OOP in C++",
      "code": "#include <iostream>\nusing namespace std;\n\n// ---------- PROCEDURAL STYLE ----------\n// Data and functions are separate. Any function can touch 'balance'.\ndouble balance = 1000.0;\n\nvoid deposit(double amount) {\n    balance += amount;\n}\n\nvoid withdraw(double amount) {\n    if (amount <= balance) balance -= amount;\n    else cout << \"Insufficient funds!\" << endl;\n}\n\n// ---------- OBJECT ORIENTED STYLE ----------\n// Data (balance) and functions (deposit/withdraw) are bundled together.\n// balance is private: no code outside this class can touch it directly.\nclass Account {\nprivate:\n    double balance;\n\npublic:\n    Account(double initialBalance) : balance(initialBalance) {}\n\n    void deposit(double amount) {\n        balance += amount;\n    }\n\n    void withdraw(double amount) {\n        if (amount <= balance) balance -= amount;\n        else cout << \"Insufficient funds!\" << endl;\n    }\n\n    double getBalance() const {\n        return balance;\n    }\n};\n\nint main() {\n    // Procedural usage\n    deposit(500);\n    withdraw(200);\n    cout << \"Procedural balance: \" << balance << endl;\n\n    // OOP usage\n    Account acc(1000.0);\n    acc.deposit(500);\n    acc.withdraw(200);\n    cout << \"OOP balance: \" << acc.getBalance() << endl;\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam-ready one-liner: 'Procedural programming emphasizes functions operating on shared data; OOP emphasizes objects that encapsulate their own data and behavior, improving modularity, reusability, and security.'"
    },
    {
      "type": "h2",
      "text": "Features of the Object Oriented Paradigm"
    },
    {
      "type": "p",
      "text": "These four are collectively called the pillars of OOP. Every OOP question, directly or indirectly, tests whether you understand these."
    },
    {
      "type": "checklist",
      "items": [
        "Encapsulation: bundling data and the methods that operate on it into a single unit (class), and restricting direct access to internal state using access modifiers.",
        "Abstraction: exposing only the essential features of an object while hiding implementation detail — e.g., you call car.start() without knowing the ignition circuitry.",
        "Inheritance: a mechanism where a new class (derived) acquires properties and behavior of an existing class (base), enabling code reuse and an 'is-a' relationship.",
        "Polymorphism: the ability of a function, operator, or object to behave differently based on context — via overloading (compile-time) or overriding with virtual functions (run-time).",
        "Modularity (supporting feature): a program is broken into independent, self-contained objects/classes that can be developed, tested, and reused separately."
      ]
    },
    {
      "type": "sections-list",
      "items": [
        {
          "title": "Encapsulation — like an ATM machine",
          "desc": "You insert your card, enter a PIN, and withdraw cash through a simple interface (buttons and screen). You never see or touch the cash-counting machinery, wiring, or bank server logic inside — that's all hidden and protected. In code: private data + public methods to access it."
        },
        {
          "title": "Abstraction — like driving a car",
          "desc": "You use the steering wheel, accelerator, and brake without knowing how fuel injection or the transmission works internally. The car exposes only what you need to drive it. In code: a class exposes simple public methods while hiding complex internal logic."
        },
        {
          "title": "Inheritance — like a child inheriting traits from parents",
          "desc": "A child naturally inherits eye color and height from their parents but can also have their own unique traits (a new hobby, a different career). In code: a derived class inherits attributes/methods from a base class and can add its own."
        },
        {
          "title": "Polymorphism — like the same person in different roles",
          "desc": "The same person behaves as a 'student' in college, an 'employee' at the office, and a 'customer' at a shop — same person, different behavior depending on context. In code: the same function name/operator behaves differently depending on the object or arguments involved."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Merits and Demerits of OO Methodology"
    },
    {
      "type": "sections-list",
      "items": [
        {
          "title": "Merits",
          "desc": "Code reusability through inheritance reduces duplicate code. Data hiding improves security by preventing unauthorized access. Modularity makes large systems easier to design, test, and maintain. Polymorphism allows flexible, extensible interfaces. Objects map naturally to real-world entities, making design more intuitive."
        },
        {
          "title": "Demerits",
          "desc": "Steeper learning curve than procedural programming for beginners. Programs can run slightly slower due to abstraction overhead (virtual function calls, dynamic dispatch). Designing a good class hierarchy takes upfront effort — poor design leads to rigid, hard-to-change code. Not every problem naturally fits an object model; forcing OOP onto simple scripts can add unnecessary complexity."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Explain how the procedural and object-oriented programming approaches differ, using a banking application as the example. Give two merits and two demerits of the object-oriented methodology."
    },
    {
      "type": "p",
      "text": "Answer: Consider a banking application that must handle deposits, withdrawals, and transfers for many accounts. In the procedural approach you start from the actions (deposit, withdraw, transfer) and write them as functions that work on separate account data. In the object-oriented approach you start from the entities (Account, Customer, Transaction) and give each one its own data and operations. The code example at the top of this part shows both styles side by side."
    },
    {
      "type": "table",
      "headers": ["Aspect", "Procedural Banking Application", "Object Oriented Banking Application"],
      "rows": [
        ["Starting point", "Top-down: list the tasks (deposit, withdraw, transfer) and write a function for each", "Bottom-up: identify the entities (Account, Customer, Transaction) and design a class for each"],
        ["Where the data lives", "Balances sit in global variables, arrays, or structs that every function can reach", "balance is a private member inside Account; it travels with the object"],
        ["Protecting the balance", "Any function can change a balance directly, so a stray bug can corrupt it", "Only Account's own methods (deposit, withdraw) can change it"],
        ["Enforcing rules", "Rules such as minimum balance or overdraft limit must be repeated in every function that touches a balance", "The rule is written once inside withdraw() and cannot be bypassed from outside"],
        ["Adding a new account type", "Edit many existing functions and add if-else branches for the new type", "Add a new class, e.g. SavingsAccount derived from Account, and override only what differs"]
      ]
    },
    {
      "type": "sections-list",
      "items": [
        {
          "title": "Merit 1: Data hiding improves security",
          "desc": "Because balance is private, no outside code can set it to an arbitrary value. Every change must pass through deposit() or withdraw(), where validation (amount > 0, sufficient funds) is applied. This is critical for a banking system."
        },
        {
          "title": "Merit 2: Inheritance gives reusability and easy extension",
          "desc": "SavingsAccount and CurrentAccount can inherit the common data and methods of Account and add only their own rules (interest rate, overdraft limit). New account types are added without rewriting tested code."
        },
        {
          "title": "Demerit 1: Steeper learning curve and design effort",
          "desc": "Before writing any code you must decide the classes, their responsibilities, and the hierarchy. A poor class design is hard to change later, and beginners find this harder than writing a few simple functions."
        },
        {
          "title": "Demerit 2: Overhead and over-engineering for small problems",
          "desc": "Objects, virtual function calls, and dynamic dispatch add some memory and runtime cost. For a tiny task such as a one-off interest calculator, defining classes adds complexity without any real benefit."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The Object Model"
    },
    {
      "type": "p",
      "text": "The Object Model describes a program as a set of interacting objects, each with three defining characteristics: state (the values of its attributes at a given moment), behavior (the operations it can perform, i.e., its methods), and identity (a property that distinguishes one object from every other object, even if their state is identical — in C++, this is effectively the object's memory address)."
    },
    {
      "type": "code-block",
      "label": "State, Behavior, and Identity in Code",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;   // part of STATE\n    int marks;     // part of STATE\n\npublic:\n    Student(string n, int m) : name(n), marks(m) {}\n\n    void display() {  // part of BEHAVIOR\n        cout << name << \" scored \" << marks << \" (identity/address: \"\n             << this << \")\" << endl;\n    }\n};\n\nint main() {\n    Student s1(\"Riya\", 85);\n    Student s2(\"Riya\", 85);  // same STATE as s1\n\n    s1.display();\n    s2.display();\n    // s1 and s2 have identical state, but different IDENTITY\n    // (different memory addresses) — they are two distinct objects.\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "👬",
      "text": "Real-life analogy: think of identical twins who are the same height, same eye color, and even dressed identically today (same state) — they still have two different Aadhaar numbers / roll numbers (identity). You can talk to either twin (behavior) and get a response, but they remain two separate people. That's exactly how s1 and s2 behave above: same state, different identity."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: List the seven elements of the object model (abstraction, encapsulation, modularity, hierarchy, typing, concurrency, persistence). State one line on each, marking which are major and which are minor."
    },
    {
      "type": "table",
      "headers": ["Element", "Category", "One-line meaning"],
      "rows": [
        ["Abstraction", "Major", "Captures the essential characteristics of an object that distinguish it from all others, ignoring irrelevant detail."],
        ["Encapsulation", "Major", "Hides the internal structure and implementation of an abstraction behind a well-defined public interface."],
        ["Modularity", "Major", "Breaks a system into cohesive, loosely coupled modules (classes, files) that can be built and tested independently."],
        ["Hierarchy", "Major", "Ranks abstractions into levels: 'is-a' (inheritance) and 'part-of' (aggregation)."],
        ["Typing", "Minor", "Enforces that objects of different types cannot be interchanged, or only in restricted ways, so misuse is caught early."],
        ["Concurrency", "Minor", "Lets different objects act at the same time through separate threads of control."],
        ["Persistence", "Minor", "Lets an object's state (and class) outlive the execution of the program, e.g. by saving it to a file or database."]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Why major and minor? Major elements are essential: a model without any one of them is not truly object oriented. Minor elements are useful additions but not essential. Quick memory aid: abstraction, encapsulation, modularity, hierarchy are major; typing, concurrency, persistence are minor."
    },
    {
      "type": "h2",
      "text": "C++ I/O Processing"
    },
    {
      "type": "p",
      "text": "C++ uses stream-based I/O via the iostream library. cin reads from standard input, cout writes to standard output, and cerr writes to standard error. The insertion operator << sends data to a stream; the extraction operator >> pulls data from a stream."
    },
    {
      "type": "code-block",
      "label": "Basic I/O in C++",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n\n    cout << \"Enter your name: \";\n    cin >> name;              // reads a single word (stops at whitespace)\n\n    cout << \"Enter your age: \";\n    cin >> age;\n\n    cout << \"Hello \" << name << \", you are \" << age << \" years old.\" << endl;\n\n    // Reading a full line (including spaces) requires getline\n    cin.ignore();              // clear leftover newline from previous cin >>\n    string fullLine;\n    cout << \"Enter a sentence: \";\n    getline(cin, fullLine);\n    cout << \"You said: \" << fullLine << endl;\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Explain with examples how setw, setprecision, fixed and endl format output. Differentiate cin >> str from getline(cin, str)."
    },
    {
      "type": "table",
      "headers": ["Manipulator", "What it does", "Example and output"],
      "rows": [
        ["setw(n)  (needs <iomanip>)", "Sets the minimum field width for the next item only. Shorter values are padded with spaces (right-aligned by default).", "cout << setw(6) << 42;  prints '    42'"],
        ["setprecision(n)  (needs <iomanip>)", "Sets the number of significant digits. When used with fixed, it sets the number of digits after the decimal point. It stays in effect until changed.", "cout << setprecision(2) << 3.14159;  prints 3.1"],
        ["fixed", "Switches floating-point output to fixed-point notation (never scientific). It also stays in effect.", "cout << fixed << setprecision(2) << 3.14159;  prints 3.14\ncout << fixed << setprecision(2) << 2.5;  prints 2.50"],
        ["endl", "Inserts a newline and flushes the output buffer.", "cout << \"Hi\" << endl;  prints Hi and moves to the next line"]
      ]
    },
    {
      "type": "code-block",
      "label": "Formatting Output: setw, setprecision, fixed, endl",
      "code": "#include <iostream>\n#include <iomanip>   // needed for setw and setprecision\nusing namespace std;\n\nint main() {\n    double pi = 3.14159265;\n\n    cout << pi << endl;                    // 3.14159   (default: 6 significant digits)\n    cout << setprecision(3) << pi << endl; // 3.14      (3 significant digits)\n    cout << fixed << pi << endl;           // 3.142     (3 digits after the decimal point)\n\n    cout << \"[\" << setw(8) << 42 << \"]\" << endl;          // [      42]  right-aligned\n    cout << \"[\" << setw(8) << left << 42 << \"]\" << endl;  // [42      ]  left-aligned\n    cout << \"[\" << 42 << \"]\" << endl;                     // [42]  setw affected only one item\n\n    // A neat table\n    cout << left << setw(10) << \"Name\" << right << setw(6) << \"Marks\" << endl;\n    cout << left << setw(10) << \"Riya\" << right << setw(6) << 85 << endl;\n    // Name       Marks\n    // Riya          85\n\n    return 0;\n}"
    },
    {
      "type": "table",
      "headers": ["Aspect", "cin >> str", "getline(cin, str)"],
      "rows": [
        ["What it reads", "One word only; stops at the first whitespace (space, tab, newline)", "The whole line, including spaces, up to the newline"],
        ["Input 'Riya Sharma'", "str = \"Riya\"; \" Sharma\" stays in the input buffer", "str = \"Riya Sharma\""],
        ["Leading whitespace", "Skipped automatically", "Kept as part of the string"],
        ["The newline character", "Left in the buffer", "Extracted from the buffer and discarded (not stored in str)"],
        ["Common pitfall", "The leftover newline breaks a later getline call", "After a cin >> read, getline returns an empty string unless you call cin.ignore() first"]
      ]
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Exam tip: setw affects only the very next item, while setprecision, fixed, left and right stay active until you change them. Mention this distinction to pick up easy marks."
    },
    {
      "type": "h2",
      "text": "Data Types and Type Conversion"
    },
    {
      "type": "checklist",
      "items": [
        "int — whole numbers, e.g. 42, -7, 1000",
        "float / double — decimal numbers, e.g. 3.14, -0.5 (double has more precision than float)",
        "char — a single character, e.g. 'A', '9', '$'",
        "bool — true or false only",
        "void — represents 'no value' — used for functions that return nothing"
      ]
    },
    {
      "type": "table",
      "headers": ["Aspect", "Implicit Conversion", "Explicit Conversion"],
      "rows": [
        ["Who triggers it", "Compiler, automatically", "Programmer, manually"],
        ["Syntax", "None — happens silently in expressions", "(type)value or static_cast<type>(value)"],
        ["Typical direction", "Widening (int → double), safe", "Narrowing (double → int), may lose data"],
        ["Risk", "Low — compiler chooses a safe conversion", "Higher — programmer must ensure it's intentional"],
        ["Real-life analogy", "Like a shopkeeper automatically rounding up your change to the nearest coin without asking", "Like you deliberately asking the shopkeeper to break a ₹500 note into smaller notes — you made the decision"]
      ]
    },
    {
      "type": "code-block",
      "label": "Type Conversion in C++",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Implicit conversion: int promoted to double automatically\n    int a = 5;\n    double b = 2.0;\n    double result = a / b;          // a is implicitly converted to double\n    cout << \"Implicit: \" << result << endl;  // 2.5\n\n    // Explicit conversion (C-style cast)\n    double pi = 3.14159;\n    int truncatedOld = (int)pi;\n    cout << \"C-style cast: \" << truncatedOld << endl;  // 3\n\n    // Explicit conversion (modern C++ recommended style)\n    int truncatedNew = static_cast<int>(pi);\n    cout << \"static_cast: \" << truncatedNew << endl;   // 3\n\n    // Danger: narrowing without care loses data silently\n    int smallNumber = 130;\n    char c = static_cast<char>(smallNumber);  // char range is typically -128 to 127\n    cout << \"Narrowed (may overflow): \" << (int)c << endl;\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Predict the output of the following code. Explain each result and identify the type-conversion rule responsible (assume 32-bit int)."
    },
    {
      "type": "code-block",
      "label": "Exam Question: Predict the Output",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 7, b = 2;\n    char c = 'A';\n    unsigned int u = 0;\n\n    cout << a / b << \"\" << (float)a / b << endl;\n    cout << c + 1 << \"\" << (char)(c + 1) << endl;\n    u = u - 1;\n    cout << u << endl;\n\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Output",
      "code": "33.5\n66B\n4294967295"
    },
    {
      "type": "sections-list",
      "items": [
        {
          "title": "Line 1, first value: a / b prints 3",
          "desc": "Both operands are int, so no conversion happens and integer division is performed. The fractional part of 3.5 is discarded (truncation), giving 3. Rule: when both operands have the same type, the result has that type."
        },
        {
          "title": "Line 1, second value: (float)a / b prints 3.5",
          "desc": "(float)a is an explicit conversion (type cast), so a becomes 7.0f. Now the operands are float and int, so the usual arithmetic conversions promote b to float. Float division gives 3.5. The empty string \"\" prints nothing, so the two values appear joined as 33.5."
        },
        {
          "title": "Line 2, first value: c + 1 prints 66",
          "desc": "In an arithmetic expression a char is promoted to int (integral promotion). 'A' has ASCII value 65, so c + 1 is the int 66, and cout prints an int as a number."
        },
        {
          "title": "Line 2, second value: (char)(c + 1) prints B",
          "desc": "The explicit cast converts the int 66 back to char, and cout prints a char as a character, so 66 becomes B. The output is 66B."
        },
        {
          "title": "Line 3: u - 1 prints 4294967295",
          "desc": "Here int (1) and unsigned int (u) have the same rank, so the signed operand is converted to unsigned (usual arithmetic conversions). Unsigned arithmetic wraps around modulo 2^32, so 0 - 1 becomes 2^32 - 1 = 4294967295. Unsigned overflow is well defined in C++."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "💡",
      "text": "Note: the question writes \"\" (empty string) between the values, which is why there is no space in 33.5 and 66B. If a space was intended, i.e. \" \", the output would be '3 3.5' and '66 B'. In the exam, write the output for the code exactly as given."
    },
    {
      "type": "h2",
      "text": "Control Statements"
    },
    {
      "type": "code-block",
      "label": "if-else and switch",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int marks = 72;\n\n    // if-else ladder\n    if (marks >= 90) {\n        cout << \"Grade: A+\" << endl;\n    } else if (marks >= 75) {\n        cout << \"Grade: A\" << endl;\n    } else if (marks >= 60) {\n        cout << \"Grade: B\" << endl;\n    } else {\n        cout << \"Grade: C\" << endl;\n    }\n\n    // switch statement\n    int day = 3;\n    switch (day) {\n        case 1:\n            cout << \"Monday\" << endl;\n            break;\n        case 2:\n            cout << \"Tuesday\" << endl;\n            break;\n        case 3:\n            cout << \"Wednesday\" << endl;\n            break;\n        default:\n            cout << \"Invalid day\" << endl;\n    }\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Loops"
    },
    {
      "type": "code-block",
      "label": "for, while, and do-while",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // for loop: use when the number of iterations is known\n    cout << \"for loop: \";\n    for (int i = 1; i <= 5; i++) {\n        cout << i << \" \";\n    }\n    cout << endl;\n\n    // while loop: use when the condition is checked before each iteration\n    cout << \"while loop: \";\n    int i = 1;\n    while (i <= 5) {\n        cout << i << \" \";\n        i++;\n    }\n    cout << endl;\n\n    // do-while loop: body executes at least once, condition checked after\n    cout << \"do-while loop: \";\n    int j = 1;\n    do {\n        cout << j << \" \";\n        j++;\n    } while (j <= 5);\n    cout << endl;\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Arrays"
    },
    {
      "type": "p",
      "text": "An array is a fixed-size, contiguous block of memory holding elements of the same type, accessed via an index starting at 0. C++ supports single-dimensional and multi-dimensional arrays."
    },
    {
      "type": "callout",
      "icon": "🗄️",
      "text": "Real-life analogy: an array is like a row of numbered lockers in a school corridor — locker[0], locker[1], locker[2]... each locker holds one item, all lockers are the same size, and you find any item instantly if you know its locker number (index). A 2D array is like a full locker room with numbered rows and columns — you need both a row number and a column number to find a specific locker."
    },
    {
      "type": "code-block",
      "label": "1D and 2D Arrays",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // 1D array\n    int marks[5] = {85, 92, 78, 60, 95};\n    int sum = 0;\n    for (int i = 0; i < 5; i++) {\n        sum += marks[i];\n    }\n    cout << \"Average marks: \" << (sum / 5.0) << endl;\n\n    // 2D array (matrix): 2 rows, 3 columns\n    int matrix[2][3] = {\n        {1, 2, 3},\n        {4, 5, 6}\n    };\n\n    cout << \"Matrix:\" << endl;\n    for (int row = 0; row < 2; row++) {\n        for (int col = 0; col < 3; col++) {\n            cout << matrix[row][col] << \" \";\n        }\n        cout << endl;\n    }\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Write a C++ program that reads n integers into an array and prints the largest element, the second largest element, and the frequency of each distinct element."
    },
    {
      "type": "code-block",
      "label": "Largest, Second Largest, and Frequency of Each Element",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    const int MAX = 100;\n    int arr[MAX];\n    int n;\n\n    cout << \"Enter number of elements (1-\" << MAX << \"): \";\n    cin >> n;\n    if (n < 1 || n > MAX) {\n        cout << \"Invalid size.\" << endl;\n        return 1;\n    }\n\n    cout << \"Enter \" << n << \" integers:\" << endl;\n    for (int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n\n    // Pass 1: largest element\n    int largest = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > largest) largest = arr[i];\n    }\n\n    // Pass 2: second largest = biggest value strictly less than 'largest'\n    bool found = false;\n    int second = 0;\n    for (int i = 0; i < n; i++) {\n        if (arr[i] < largest && (!found || arr[i] > second)) {\n            second = arr[i];\n            found = true;\n        }\n    }\n\n    cout << \"Largest element: \" << largest << endl;\n    if (found) cout << \"Second largest element: \" << second << endl;\n    else       cout << \"Second largest element: does not exist (all elements are equal)\" << endl;\n\n    // Frequency of each distinct element\n    bool counted[MAX] = {false};\n    cout << \"Frequencies:\" << endl;\n    for (int i = 0; i < n; i++) {\n        if (counted[i]) continue;          // already reported this value\n        int count = 1;\n        for (int j = i + 1; j < n; j++) {\n            if (arr[j] == arr[i]) {\n                count++;\n                counted[j] = true;\n            }\n        }\n        cout << arr[i] << \" occurs \" << count << \" time(s)\" << endl;\n    }\n\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Sample Run",
      "code": "Enter number of elements (1-100): 7\nEnter 7 integers:\n4 9 4 7 9 9 2\nLargest element: 9\nSecond largest element: 7\nFrequencies:\n4 occurs 2 time(s)\n9 occurs 3 time(s)\n7 occurs 1 time(s)\n2 occurs 1 time(s)"
    },
    {
      "type": "p",
      "text": "Logic: Pass 1 finds the maximum. Pass 2 finds the second largest as the biggest value that is strictly less than the maximum, so duplicates of the maximum (like the three 9s above) are not mistaken for the second largest. If all elements are equal, no second largest exists and the program says so. For frequency, each unvisited element is counted against the rest of the array, and the counted[] flags stop a repeated value from being reported twice. Time complexity is O(n^2) for the frequency step and O(n) for the rest."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common exam mistake: writing array size or index out of bounds (e.g., marks[5] when the array has 5 elements, valid indices 0-4) is one of the most frequent errors examiners deduct marks for in programming questions. Always double-check loop bounds."
    },
    {
      "type": "h2",
      "text": "Quiz: Test Your Understanding"
    },
    {
      "type": "p",
      "text": "Attempt these as if in an exam. Write full answers before checking the solutions below."
    },
    {
      "type": "checklist",
      "items": [
        "Q1: Differentiate procedural programming and object oriented programming (any four points).",
        "Q2: List the four pillars of OOP and give a one-line definition of each.",
        "Q3: What are two merits and two demerits of the OO methodology?",
        "Q4: Explain state, behavior, and identity in the context of the Object Model with an example.",
        "Q5: Write a C++ program that reads 5 integers into an array and prints their sum and average."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: (i) Procedural is top-down, OOP is bottom-up. (ii) Procedural separates data and functions, OOP bundles them. (iii) Procedural data is often global/unsafe, OOP data is encapsulated/private. (iv) Procedural makes extension harder, OOP supports reuse via inheritance."
    },
    {
      "type": "p",
      "text": "A2: Encapsulation — bundling data and methods, hiding internal state. Abstraction — exposing essential features, hiding implementation. Inheritance — acquiring properties of an existing class. Polymorphism — one interface behaving differently in different contexts."
    },
    {
      "type": "p",
      "text": "A3: Merits — code reusability via inheritance, improved security via data hiding. Demerits — steeper learning curve, potential runtime overhead from dynamic dispatch."
    },
    {
      "type": "p",
      "text": "A4: State = current values of an object's attributes (e.g., a Student's name and marks). Behavior = the operations it exposes (e.g., display()). Identity = what makes it a distinct object even with identical state, in C++ effectively its memory address — two Student objects with the same name and marks are still two different objects."
    },
    {
      "type": "p",
      "text": "A5: See the complete, compilable solution below."
    },
    {
      "type": "code-block",
      "label": "Q5 Solution: Sum and Average of an Array",
      "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int numbers[5];\n    int sum = 0;\n\n    cout << \"Enter 5 integers:\" << endl;\n    for (int i = 0; i < 5; i++) {\n        cin >> numbers[i];\n        sum += numbers[i];\n    }\n\n    double average = sum / 5.0;\n\n    cout << \"Sum: \" << sum << endl;\n    cout << \"Average: \" << average << endl;\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "OOP is not just 'classes and objects' — it is a shift from thinking in steps to thinking in entities that own their data and behavior. The four pillars — encapsulation, abstraction, inheritance, polymorphism — are the vocabulary every later unit builds on. Alongside that, your C++ fundamentals (I/O, data types, conversion, control flow, loops, arrays) are the tools you'll use to actually implement every class you write from Part 2 onward. Get both solid here before moving on."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: If asked to define OOP in one line for an exam — 'OOP is a programming paradigm based on objects that bundle data and behavior, built around encapsulation, abstraction, inheritance, and polymorphism.' Memorize that sentence. Then move to Part 2."
    }
  ]
};

export default post;
