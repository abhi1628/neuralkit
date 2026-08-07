const post = {
  "slug": "part-6-cpp-java-python-interview-prep",
  "seriesSlug": "oop-cpp-mastery",
  "partNumber": 6,
  "totalParts": 6,
  "title": "C++ vs Java vs Python: OOP Differences & Interview Prep (Part 6)",
  "seriesTitle": "Object-Oriented Programming in C++: The Exam Mastery Series",
  "date": "August 7, 2026",
  "readTime": "32 min read",
  "category": "Object Oriented Programming",
  "categoryColor": "#3b82f6",
  "excerpt": "Head-to-head comparison of OOP concepts across C++, Java, and Python with working code in all three languages, plus 15 conceptual interview questions asked at top companies.",
  "coverEmoji": "🧩",
  "tags": [
    "C++",
    "Java",
    "Python",
    "OOP",
    "Interview",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Parts 1 through 5 made you an expert in C++ OOP. Part 6 is the capstone: you will see the same OOP concepts written in C++, Java, and Python side by side, understand why each language made the design choices it did, and then face 15 conceptual questions that appear in virtually every technical interview at top companies. This part has no new concepts — it is pure synthesis and application. Master this, and you can explain OOP in any language an interviewer names."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam and interview pattern to expect: 'Differentiate C++ and Java inheritance' (5 marks), 'Why does C++ support multiple inheritance but Java does not?' (interview), 'Explain polymorphism in Python vs C++' (interview), and 'Write the same class in C++, Java, and Python' (coding round)."
    },
    {
      "type": "h2",
      "text": "Quick Recap: The OOP Vocabulary You Now Own"
    },
    {
      "type": "p",
      "text": "Before comparing languages, confirm you can define each concept in one sentence: Encapsulation bundles data and methods while restricting access. Abstraction exposes only essentials. Inheritance reuses behavior through an is-a relationship. Polymorphism lets one interface behave differently. These four pillars exist in C++, Java, and Python — but each language implements them with different syntax, restrictions, and defaults."
    },
    {
      "type": "h2",
      "text": "1. Class Declaration & Syntax"
    },
    {
      "type": "p",
      "text": "All three languages use the class keyword, but the ceremony around declaration differs dramatically. C++ is explicit about everything. Java is explicit about types but handles memory automatically. Python is minimal and relies on convention."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Keyword",
          "class",
          "class",
          "class"
        ],
        [
          "File extension",
          ".cpp",
          ".java",
          ".py"
        ],
        [
          "Entry point",
          "int main()",
          "public static void main(String[] args)",
          "if __name__ == '__main__':"
        ],
        [
          "Semicolons",
          "Required",
          "Required",
          "Not required"
        ],
        [
          "Braces",
          "Curly braces {}",
          "Curly braces {}",
          "Indentation"
        ],
        [
          "Type declaration",
          "Explicit (int, string)",
          "Explicit (int, String)",
          "Dynamic (no declaration)"
        ],
        [
          "Header files",
          "#include <iostream>",
          "import statements",
          "import statements"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Same Class in Three Languages",
      "code": "// ========== C++ ==========\n#include <iostream>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    int marks;\npublic:\n    Student(string n, int m) : name(n), marks(m) {}\n    void display() {\n        cout << name << \" scored \" << marks << endl;\n    }\n};\n\nint main() {\n    Student s(\"Riya\", 85);\n    s.display();\n    return 0;\n}\n\n// ========== Java ==========\nclass Student {\n    private String name;\n    private int marks;\n\n    public Student(String n, int m) {\n        this.name = n;\n        this.marks = m;\n    }\n\n    public void display() {\n        System.out.println(name + \" scored \" + marks);\n    }\n\n    public static void main(String[] args) {\n        Student s = new Student(\"Riya\", 85);\n        s.display();\n    }\n}\n\n# ========== Python ==========\nclass Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\n    def display(self):\n        print(f\"{self.name} scored {self.marks}\")\n\ns = Student(\"Riya\", 85)\ns.display()"
    },
    {
      "type": "h2",
      "text": "2. Access Modifiers"
    },
    {
      "type": "p",
      "text": "C++ and Java have explicit access modifiers. Python has no true private keyword — it uses naming conventions (single underscore for protected, double underscore for name-mangled 'private') to signal intent, but nothing is enforced by the language."
    },
    {
      "type": "table",
      "headers": [
        "Modifier",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "private",
          "private — only same class",
          "private — only same class",
          "__name — name mangled, convention-based"
        ],
        [
          "protected",
          "protected — class + derived",
          "protected — class + package + derived",
          "_name — convention, not enforced"
        ],
        [
          "public",
          "public — anywhere",
          "public — anywhere",
          "name — default is public"
        ],
        [
          "Default",
          "private (for class members)",
          "package-private (same package)",
          "public (everything is public by default)"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Access Modifiers in All Three",
      "code": "// ========== C++ ==========\nclass Account {\nprivate:     int secretPIN;\nprotected:   string accountType;\npublic:      string ownerName;\n};\n\n// ========== Java ==========\nclass Account {\n    private int secretPIN;\n    protected String accountType;\n    public String ownerName;\n}\n\n# ========== Python ==========\nclass Account:\n    def __init__(self):\n        self.__secret_pin = 0      # 'private' via name mangling\n        self._account_type = \"\"    # 'protected' by convention\n        self.owner_name = \"\"      # public"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Interview trap question: 'Is Python truly object-oriented if it doesn't enforce private access?' The answer is yes — Python is fully object-oriented. Encapsulation is a design principle, not a compiler-enforced rule. Python trusts the programmer (we're all consenting adults) and uses conventions instead of keywords."
    },
    {
      "type": "h2",
      "text": "3. Inheritance"
    },
    {
      "type": "p",
      "text": "This is where the three languages diverge most sharply. C++ supports multiple inheritance directly. Java supports single inheritance for classes but allows multiple inheritance of interfaces. Python supports multiple inheritance directly and uses the MRO (Method Resolution Order) algorithm to resolve conflicts."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Multiple inheritance",
          "Yes — direct",
          "No for classes; yes for interfaces",
          "Yes — direct"
        ],
        [
          "Syntax",
          "class D : public B1, public B2",
          "class D extends B implements I1, I2",
          "class D(B1, B2):"
        ],
        [
          "Constructor chaining",
          "Base constructor in initializer list",
          "super() call",
          "super().__init__()"
        ],
        [
          "Diamond problem",
          "Ambiguity — solved with virtual inheritance",
          "Not possible with classes",
          "MRO (C3 linearization) resolves it"
        ],
        [
          "Default inheritance",
          "private if omitted",
          "extends Object implicitly",
          "object is implicit base"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Inheritance in All Three Languages",
      "code": "// ========== C++ ==========\nclass Animal {\nprotected:\n    string name;\npublic:\n    Animal(string n) : name(n) {}\n    virtual void speak() { cout << \"Animal speaks\" << endl; }\n};\n\nclass Dog : public Animal {\npublic:\n    Dog(string n) : Animal(n) {}\n    void speak() override {\n        cout << name << \" barks\" << endl;\n    }\n};\n\n// ========== Java ==========\nclass Animal {\n    protected String name;\n    public Animal(String n) { this.name = n; }\n    public void speak() { System.out.println(\"Animal speaks\"); }\n}\n\nclass Dog extends Animal {\n    public Dog(String n) { super(n); }\n    @Override\n    public void speak() {\n        System.out.println(name + \" barks\");\n    }\n}\n\n# ========== Python ==========\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        print(\"Animal speaks\")\n\nclass Dog(Animal):\n    def __init__(self, name):\n        super().__init__(name)\n    def speak(self):\n        print(f\"{self.name} barks\")\n\nd = Dog(\"Bruno\")\nd.speak()  # Output: Bruno barks"
    },
    {
      "type": "h2",
      "text": "4. Polymorphism: Overloading vs Overriding"
    },
    {
      "type": "p",
      "text": "C++ supports both function overloading and operator overloading. Java supports function overloading but not operator overloading (except + for strings). Python does not support traditional function overloading by signature — the last defined function wins — but you can simulate it with default arguments or *args. All three support method overriding."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Function overloading",
          "Yes — by signature",
          "Yes — by signature",
          "No — last definition wins"
        ],
        [
          "Operator overloading",
          "Yes — any operator",
          "No (except + for String)",
          "Yes — via dunder methods (__add__, etc.)"
        ],
        [
          "Method overriding",
          "Yes — requires virtual for runtime",
          "Yes — @Override annotation",
          "Yes — automatic, no keyword needed"
        ],
        [
          "Runtime polymorphism",
          "virtual functions + vtable",
          "All non-final, non-static, non-private methods are virtual by default",
          "Duck typing — no explicit virtual needed"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Overloading & Overriding in All Three",
      "code": "// ========== C++ ==========\nclass Calculator {\npublic:\n    int add(int a, int b) { return a + b; }\n    double add(double a, double b) { return a + b; }\n};\n\nclass Shape {\npublic:\n    virtual double area() = 0;\n};\n\nclass Circle : public Shape {\n    double r;\npublic:\n    Circle(double radius) : r(radius) {}\n    double area() override { return 3.14159 * r * r; }\n};\n\n// ========== Java ==========\nclass Calculator {\n    int add(int a, int b) { return a + b; }\n    double add(double a, double b) { return a + b; }\n}\n\nabstract class Shape {\n    abstract double area();\n}\n\nclass Circle extends Shape {\n    double r;\n    Circle(double radius) { this.r = radius; }\n    @Override\n    double area() { return Math.PI * r * r; }\n}\n\n# ========== Python ==========\n# Python does NOT support function overloading by signature\n# Use default arguments or *args instead\nclass Calculator:\n    def add(self, a, b, c=0):\n        return a + b + c\n\nclass Shape:\n    def area(self):\n        raise NotImplementedError\n\nclass Circle(Shape):\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        return 3.14159 * self.r * self.r"
    },
    {
      "type": "h2",
      "text": "5. Memory Management"
    },
    {
      "type": "p",
      "text": "C++ gives you full manual control — and full responsibility. Java and Python use garbage collection, freeing the programmer from manual memory management but introducing non-deterministic cleanup. This is one of the most common interview differentiators."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Memory control",
          "Manual — new/delete, malloc/free",
          "Automatic — garbage collector",
          "Automatic — garbage collector"
        ],
        [
          "Pointers",
          "Raw pointers, smart pointers",
          "References only (no raw pointers)",
          "References only (no raw pointers)"
        ],
        [
          "Object creation",
          "Stack or heap",
          "Always on heap",
          "Always on heap"
        ],
        [
          "Destructor",
          "Explicit ~Class() — deterministic",
          "finalize() — deprecated, non-deterministic",
          "__del__() — non-deterministic"
        ],
        [
          "Memory leaks",
          "Possible if delete is forgotten",
          "Rare (GC handles it)",
          "Rare (reference counting + GC)"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Memory Management in All Three",
      "code": "// ========== C++ ==========\nclass Resource {\npublic:\n    Resource() { cout << \"Acquired\" << endl; }\n    ~Resource() { cout << \"Released\" << endl; }\n};\n\nint main() {\n    Resource *r = new Resource();\n    delete r;  // Manual cleanup — forget this = memory leak\n    return 0;\n}\n\n// ========== Java ==========\nclass Resource {\n    Resource() { System.out.println(\"Acquired\"); }\n    // finalize() is deprecated; rely on GC\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Resource r = new Resource();\n        r = null;  // Eligible for GC\n        System.gc();  // Hint only — not guaranteed\n    }\n}\n\n# ========== Python ==========\nclass Resource:\n    def __init__(self):\n        print(\"Acquired\")\n    def __del__(self):\n        print(\"Released\")\n\nr = Resource()\ndel r  # Reference count drops; may trigger cleanup"
    },
    {
      "type": "h2",
      "text": "6. Abstract Classes & Interfaces"
    },
    {
      "type": "p",
      "text": "C++ uses pure virtual functions to create abstract classes and does not have a dedicated interface keyword. Java has both abstract classes and a dedicated interface keyword. Python uses abstract base classes (ABC module) and does not have a native interface keyword, though protocols and ABCs serve the same purpose."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Abstract class",
          "class with = 0 pure virtual functions",
          "abstract class with abstract methods",
          "ABC + @abstractmethod decorator"
        ],
        [
          "Interface",
          "No keyword — class with only pure virtuals",
          "interface keyword",
          "No keyword — ABC or Protocol"
        ],
        [
          "Multiple interface inheritance",
          "Yes (via multiple inheritance)",
          "Yes — core feature",
          "Yes (via multiple inheritance)"
        ],
        [
          "Can have state/data",
          "Abstract class: yes; Interface: no",
          "Abstract class: yes; Interface: no (until Java 8 default methods)",
          "ABC: yes; Protocol: no"
        ],
        [
          "Constructor",
          "Abstract class can have one",
          "Abstract class can have one; Interface cannot",
          "ABC can have __init__"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Abstract Class & Interface in All Three",
      "code": "// ========== C++ ==========\nclass Drawable {\npublic:\n    virtual void draw() = 0;\n    virtual ~Drawable() {}\n};\n\nclass Circle : public Drawable {\npublic:\n    void draw() override { cout << \"Drawing Circle\" << endl; }\n};\n\n// ========== Java ==========\ninterface Drawable {\n    void draw();\n}\n\nclass Circle implements Drawable {\n    public void draw() {\n        System.out.println(\"Drawing Circle\");\n    }\n}\n\n# ========== Python ==========\nfrom abc import ABC, abstractmethod\n\nclass Drawable(ABC):\n    @abstractmethod\n    def draw(self):\n        pass\n\nclass Circle(Drawable):\n    def draw(self):\n        print(\"Drawing Circle\")\n\nc = Circle()\nc.draw()"
    },
    {
      "type": "h2",
      "text": "7. Constructors & Destructors"
    },
    {
      "type": "p",
      "text": "C++ has explicit constructors and destructors with deterministic lifecycles. Java has constructors but no destructors — cleanup is handled by garbage collection. Python has __init__ (constructor-like) and __del__ (destructor-like), but __del__ is non-deterministic and generally discouraged."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Constructor",
          "ClassName() — same name as class",
          "ClassName() — same name as class",
          "__init__(self)"
        ],
        [
          "Destructor",
          "~ClassName() — deterministic",
          "None — GC handles cleanup",
          "__del__(self) — non-deterministic"
        ],
        [
          "Default constructor",
          "Provided if none declared",
          "Provided if none declared",
          "__init__ must be defined"
        ],
        [
          "Copy constructor",
          "Yes — ClassName(const ClassName&)",
          "No — use clone() or copy constructor manually",
          "No — use copy module or slicing"
        ],
        [
          "Constructor overloading",
          "Yes",
          "Yes",
          "No — use default arguments"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Constructor Lifecycle in All Three",
      "code": "// ========== C++ ==========\nclass Student {\n    string name;\npublic:\n    Student() : name(\"Unknown\") {}\n    Student(string n) : name(n) {}\n    Student(const Student &s) : name(s.name + \" copy\") {}\n    ~Student() { cout << name << \" destroyed\" << endl; }\n};\n\n// ========== Java ==========\nclass Student {\n    String name;\n    Student() { this.name = \"Unknown\"; }\n    Student(String n) { this.name = n; }\n    // No destructor — GC cleans up\n}\n\n# ========== Python ==========\nclass Student:\n    def __init__(self, name=\"Unknown\"):\n        self.name = name\n    def __del__(self):\n        print(f\"{self.name} destroyed\")\n\ns1 = Student(\"Riya\")\ndel s1"
    },
    {
      "type": "h2",
      "text": "8. Static Members"
    },
    {
      "type": "p",
      "text": "All three languages support static members, but the syntax and behavior differ. C++ static members must be defined outside the class. Java static members belong to the class and are shared. Python uses class variables (shared) and distinguishes them from instance variables carefully."
    },
    {
      "type": "code-block",
      "label": "Static Members in All Three",
      "code": "// ========== C++ ==========\nclass Counter {\n    static int count;\npublic:\n    Counter() { count++; }\n    static int getCount() { return count; }\n};\nint Counter::count = 0;\n\n// ========== Java ==========\nclass Counter {\n    static int count = 0;\n    Counter() { count++; }\n    static int getCount() { return count; }\n}\n\n# ========== Python ==========\nclass Counter:\n    count = 0  # class variable — shared by all instances\n    def __init__(self):\n        Counter.count += 1\n    @classmethod\n    def get_count(cls):\n        return cls.count"
    },
    {
      "type": "h2",
      "text": "9. Friend Functions (C++ Exclusive)"
    },
    {
      "type": "p",
      "text": "Friend functions are unique to C++. Java and Python have no direct equivalent — you achieve similar access by placing classes in the same package (Java) or simply accessing attributes directly (Python, since everything is public by convention). This is a favorite interview question: 'Does Java have friend functions?' The answer is no."
    },
    {
      "type": "code-block",
      "label": "Friend Function — C++ Only",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Box {\nprivate:\n    int width;\npublic:\n    Box(int w) : width(w) {}\n    friend void showWidth(Box &b);\n};\n\nvoid showWidth(Box &b) {\n    cout << \"Width: \" << b.width << endl;  // Accessing private member\n}\n\nint main() {\n    Box b(10);\n    showWidth(b);\n    return 0;\n}\n\n// Java equivalent: use a public getter or place in same package\n// Python equivalent: just access b._width (convention)"
    },
    {
      "type": "h2",
      "text": "10. Exception Handling"
    },
    {
      "type": "p",
      "text": "All three languages use try-catch (or try-except in Python), but the type system and hierarchy differ. C++ can throw any type. Java requires exceptions to be Throwable subclasses. Python uses a broad hierarchy under BaseException."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Keyword",
          "try-catch-throw",
          "try-catch-throw",
          "try-except-raise"
        ],
        [
          "Checked exceptions",
          "No",
          "Yes — must declare or handle",
          "No"
        ],
        [
          "Can throw primitives",
          "Yes — throw 42;",
          "No — must be Throwable",
          "Yes — raise 42 (discouraged)"
        ],
        [
          "Finally block",
          "Yes (since C++11)",
          "Yes — finally",
          "Yes — finally or else/finally"
        ],
        [
          "Catch-all",
          "catch(...)",
          "catch(Exception e)",
          "except:"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Exception Handling in All Three",
      "code": "// ========== C++ ==========\ntry {\n    throw runtime_error(\"Error\");\n} catch (runtime_error &e) {\n    cout << e.what() << endl;\n} catch (...) {\n    cout << \"Unknown error\" << endl;\n}\n\n// ========== Java ==========\ntry {\n    throw new RuntimeException(\"Error\");\n} catch (RuntimeException e) {\n    System.out.println(e.getMessage());\n} finally {\n    System.out.println(\"Cleanup\");\n}\n\n# ========== Python ==========\ntry:\n    raise RuntimeError(\"Error\")\nexcept RuntimeError as e:\n    print(e)\nexcept Exception as e:\n    print(f\"Other: {e}\")\nfinally:\n    print(\"Cleanup\")"
    },
    {
      "type": "h2",
      "text": "11. Strings"
    },
    {
      "type": "p",
      "text": "C++ strings are mutable and value-based. Java strings are immutable by default (String class) — mutable versions exist (StringBuilder, StringBuffer). Python strings are immutable. This immutability difference is a common source of interview questions about performance and memory."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Mutability",
          "Mutable (std::string)",
          "Immutable (String); mutable (StringBuilder)",
          "Immutable"
        ],
        [
          "Concatenation",
          "s1 + s2 (efficient)",
          "s1 + s2 creates new object (inefficient in loops)",
          "s1 + s2 creates new object"
        ],
        [
          "Type",
          "Value type",
          "Reference type",
          "Object"
        ],
        [
          "Comparison",
          "s1 == s2 compares content",
          "s1 == s2 compares reference; use .equals() for content",
          "s1 == s2 compares content"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "12. Summary Comparison Table"
    },
    {
      "type": "p",
      "text": "This table is designed to be screenshot or memorized before an interview. It covers every major OOP differentiator across the three languages."
    },
    {
      "type": "table",
      "headers": [
        "Concept",
        "C++",
        "Java",
        "Python"
      ],
      "rows": [
        [
          "Compilation",
          "Compiled to machine code",
          "Compiled to bytecode (JVM)",
          "Interpreted (CPython)"
        ],
        [
          "Platform",
          "Platform-dependent binary",
          "Platform-independent bytecode",
          "Platform-independent source"
        ],
        [
          "Speed",
          "Fastest",
          "Fast (JIT compilation)",
          "Slower (interpreter overhead)"
        ],
        [
          "Memory model",
          "Manual + smart pointers",
          "Garbage collection",
          "Garbage collection + reference counting"
        ],
        [
          "Multiple inheritance",
          "Yes",
          "No (classes); Yes (interfaces)",
          "Yes"
        ],
        [
          "Operator overloading",
          "Yes",
          "No",
          "Yes (dunder methods)"
        ],
        [
          "Pointers",
          "Yes (raw + smart)",
          "No (references only)",
          "No (references only)"
        ],
        [
          "Templates/Generics",
          "Templates",
          "Generics (type erasure)",
          "Duck typing (no generics needed)"
        ],
        [
          "Access control",
          "Strict (private/protected/public)",
          "Strict (private/protected/public/package)",
          "Convention-based"
        ],
        [
          "Virtual functions",
          "Explicit virtual keyword",
          "Implicit virtual (non-final methods)",
          "Implicit (duck typing)"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "15 Conceptual Interview Questions"
    },
    {
      "type": "p",
      "text": "These questions appear repeatedly in technical interviews at companies like Google, Amazon, Microsoft, and in university viva examinations. Each answer is structured for maximum clarity: definition first, then the 'why,' then a code or analogy to cement it."
    },
    {
      "type": "h2",
      "text": "Q1: What is the diamond problem, and how does each language solve it?"
    },
    {
      "type": "p",
      "text": "The diamond problem occurs in multiple inheritance when a class D inherits from both B and C, and both B and C inherit from the same base class A. If A has a method m(), D receives two copies of m() — causing ambiguity."
    },
    {
      "type": "p",
      "text": "C++ solves it with virtual inheritance: class B : virtual public A. This ensures only one shared subobject of A exists in D. Java avoids it entirely by disallowing multiple inheritance of classes — you can only inherit one class, but implement multiple interfaces. Python solves it using the C3 linearization algorithm (MRO), which defines a deterministic order for method lookup: D → B → C → A. You can inspect it with ClassName.__mro__."
    },
    {
      "type": "h2",
      "text": "Q2: Why does Java not support operator overloading?"
    },
    {
      "type": "p",
      "text": "Java's designers intentionally excluded operator overloading to keep the language simple and readable. C++ allows you to redefine +, -, <<, and even () and [], which can make code cryptic if abused (e.g., what does a + b mean if it opens a network connection?). Java makes an exception for String concatenation with + because it is universally understood. Python takes a middle path: operator overloading exists but is strictly regulated through dunder methods (__add__, __str__, etc.), making it explicit and discoverable."
    },
    {
      "type": "h2",
      "text": "Q3: Explain the difference between 'is-a' and 'has-a' relationships with examples in all three languages."
    },
    {
      "type": "p",
      "text": "'Is-a' is inheritance: a Dog is an Animal. 'Has-a' is composition or aggregation: a Car has an Engine. Use inheritance only when the 'is-a' sentence makes sense in one direction. Use composition when the part can exist independently (aggregation) or must exist with the whole (composition)."
    },
    {
      "type": "code-block",
      "label": "Is-a vs Has-a in All Three",
      "code": "// C++: is-a (inheritance)\nclass Animal {};\nclass Dog : public Animal {};\n\n// C++: has-a (composition)\nclass Engine {};\nclass Car { Engine engine; };\n\n// Java: is-a\nclass Animal {}\nclass Dog extends Animal {}\n\n// Java: has-a\nclass Engine {}\nclass Car { Engine engine = new Engine(); }\n\n# Python: is-a\nclass Animal: pass\nclass Dog(Animal): pass\n\n# Python: has-a\nclass Engine: pass\nclass Car:\n    def __init__(self):\n        self.engine = Engine()"
    },
    {
      "type": "h2",
      "text": "Q4: What is the difference between early binding and late binding?"
    },
    {
      "type": "p",
      "text": "Early binding (static binding) happens at compile time. The compiler knows exactly which function to call based on the declared type. Examples: normal function calls, function overloading. Late binding (dynamic binding) happens at runtime. The program resolves which function to call based on the actual object's type, not the pointer's type. Example: virtual functions in C++, all non-final methods in Java, and method calls in Python. Late binding enables polymorphism but incurs a small overhead due to vtable lookup or dynamic dispatch."
    },
    {
      "type": "h2",
      "text": "Q5: Why does C++ need virtual functions while Python does not?"
    },
    {
      "type": "p",
      "text": "C++ defaults to static binding for performance. Without virtual, a base class pointer always calls the base class version — even if it points to a derived object. The virtual keyword explicitly opts into dynamic dispatch. Python has no static binding for methods at all — every method call is dynamically dispatched by looking up the method in the object's class (and its MRO). This is duck typing: 'if it walks like a duck and talks like a duck, it is a duck.' Python trades performance for flexibility; C++ lets the programmer choose."
    },
    {
      "type": "h2",
      "text": "Q6: What is the difference between a deep copy and a shallow copy?"
    },
    {
      "type": "p",
      "text": "A shallow copy duplicates the object's top-level values but shares references to nested objects. A deep copy recursively duplicates everything, creating fully independent objects. In C++, the default copy constructor does a shallow copy — if your class holds pointers, you must implement a deep copy manually or use smart pointers. In Java, clone() defaults to shallow copy; use serialization or manual field copying for deep copy. In Python, copy.copy() is shallow; copy.deepcopy() is deep."
    },
    {
      "type": "code-block",
      "label": "Deep vs Shallow Copy in Python",
      "code": "import copy\n\noriginal = [[1, 2, 3], [4, 5, 6]]\n\nshallow = copy.copy(original)\ndeep = copy.deepcopy(original)\n\noriginal[0][0] = 99\n\nprint(f\"Original: {original}\")    # [[99, 2, 3], [4, 5, 6]]\nprint(f\"Shallow:  {shallow}\")     # [[99, 2, 3], [4, 5, 6]] — shared inner list!\nprint(f\"Deep:     {deep}\")        # [[1, 2, 3], [4, 5, 6]] — fully independent"
    },
    {
      "type": "h2",
      "text": "Q7: Can you have a constructor in an abstract class? Can you instantiate it?"
    },
    {
      "type": "p",
      "text": "Yes, an abstract class can have a constructor — and it often should, to initialize shared state for all derived classes. However, you cannot instantiate an abstract class directly because it contains at least one pure virtual/abstract method with no implementation. In C++, attempting to create an object of an abstract class is a compile error. In Java, new AbstractClass() is illegal. In Python, instantiating a class with unimplemented @abstractmethod methods raises TypeError."
    },
    {
      "type": "h2",
      "text": "Q8: What is the difference between method hiding and method overriding?"
    },
    {
      "type": "p",
      "text": "Method overriding occurs when a derived class provides a new implementation of a base class's virtual/abstract method with the same signature. The runtime system dispatches to the derived version through a base reference. Method hiding occurs when a derived class declares a method with the same name as a base class method but without the virtual relationship — in C++, using a non-virtual base method; in Java, using static methods with the same signature. Hiding breaks polymorphism: the base reference calls the base version, not the derived version."
    },
    {
      "type": "h2",
      "text": "Q9: Explain RAII and why it matters in C++ but not in Java or Python."
    },
    {
      "type": "p",
      "text": "RAII (Resource Acquisition Is Initialization) is a C++ idiom where resource allocation happens in a constructor and deallocation happens in a destructor. Because C++ destructors run deterministically when an object goes out of scope, resources like file handles, locks, and memory are guaranteed to be released — even if an exception is thrown. Java and Python rely on garbage collection, which is non-deterministic, so they use try-finally or context managers (with statement in Python, try-with-resources in Java) to ensure cleanup. Smart pointers in C++ (unique_ptr, shared_ptr) are modern RAII tools that automate memory management."
    },
    {
      "type": "h2",
      "text": "Q10: What is duck typing, and which language uses it?"
    },
    {
      "type": "p",
      "text": "Duck typing is a programming style where an object's suitability is determined by the presence of certain methods and properties, rather than the object's actual type. The phrase comes from 'if it walks like a duck and quacks like a duck, it is a duck.' Python is the canonical duck-typed language among the three — you don't need inheritance or interfaces; any object with a quack() method can be passed to a function expecting a duck. C++ and Java are nominally typed: the compiler checks the declared type or inheritance hierarchy before allowing a method call."
    },
    {
      "type": "code-block",
      "label": "Duck Typing in Python",
      "code": "class Duck:\n    def quack(self):\n        print(\"Quack!\")\n\nclass Person:\n    def quack(self):\n        print(\"I'm pretending to be a duck!\")\n\ndef make_it_quack(thing):\n    thing.quack()  # No type check — just needs .quack()\n\nmake_it_quack(Duck())\nmake_it_quack(Person())"
    },
    {
      "type": "h2",
      "text": "Q11: Why are Java strings immutable but C++ strings mutable?"
    },
    {
      "type": "p",
      "text": "Java strings are immutable for security, synchronization, and caching. Because strings are used extensively as keys in hash maps and as constants, immutability guarantees that a string's hash code never changes and that multiple threads can safely share the same string object without locks. C++ std::string is mutable for performance and control — modifying a string in place avoids creating new objects. Python strings are also immutable for the same reasons as Java. When mutability is needed in Java, use StringBuilder; in Python, use a list of characters or bytearray."
    },
    {
      "type": "h2",
      "text": "Q12: What is the difference between a class variable and an instance variable?"
    },
    {
      "type": "p",
      "text": "A class variable (static in C++/Java, class-level assignment in Python) is shared by all instances of the class — there is only one copy. An instance variable is unique to each object — every instance gets its own copy. Modifying a class variable affects all instances. Modifying an instance variable affects only that instance. In Python, be careful: assigning to self.var creates an instance variable, but reading self.var falls back to the class variable if no instance variable exists."
    },
    {
      "type": "h2",
      "text": "Q13: What is slicing in C++ and how does it relate to polymorphism?"
    },
    {
      "type": "p",
      "text": "Slicing occurs when a derived class object is assigned to a base class object by value (not by pointer or reference). The derived portion is 'sliced off' — only the base class subobject is copied. This destroys polymorphism because the virtual function table pointer and derived data members are lost. The fix is always to use base class pointers or references: Base *b = new Derived(); or Base &b = derivedObj;. Java and Python avoid slicing because objects are always accessed by reference."
    },
    {
      "type": "code-block",
      "label": "Slicing Problem in C++",
      "code": "class Base {\npublic:\n    virtual void show() { cout << \"Base\" << endl; }\n    int baseData;\n};\n\nclass Derived : public Base {\npublic:\n    void show() override { cout << \"Derived\" << endl; }\n    int derivedData;\n};\n\nint main() {\n    Derived d;\n    Base b = d;        // SLICING: derivedData lost, vptr reset to Base\n    b.show();          // Prints 'Base' — polymorphism broken!\n\n    Base *bp = &d;     // No slicing — pointer to full Derived object\n    bp->show();        // Prints 'Derived' — polymorphism works\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Q14: What is the difference between a process and a thread?"
    },
    {
      "type": "p",
      "text": "A process is an independent program with its own memory space, file descriptors, and resources. Processes are isolated — one process cannot directly access another's memory. A thread is a lightweight unit of execution within a process. All threads in a process share the same memory space and resources, making communication fast but requiring synchronization (mutexes, locks) to prevent race conditions. In C++, Java, and Python, threads are created via std::thread, Thread class, and threading module respectively. Multi-threading is about concurrency within one process; multi-processing is about running multiple processes."
    },
    {
      "type": "h2",
      "text": "Q15: When would you choose composition over inheritance?"
    },
    {
      "type": "p",
      "text": "Choose composition when: (1) the relationship is 'has-a' rather than 'is-a' — a Car has an Engine, but a Car is not an Engine. (2) you want to avoid the fragility of deep inheritance hierarchies — changing a base class can break all derived classes. (3) you need to change behavior at runtime — composition lets you swap components; inheritance fixes behavior at compile time. (4) you want to reuse code from multiple sources without the diamond problem. The GoF principle is clear: 'favor composition over inheritance.' In all three languages, composition is achieved by holding an object as a member variable; inheritance is achieved through the class hierarchy."
    },
    {
      "type": "h2",
      "text": "Bonus: Quick-Fire Differentiators"
    },
    {
      "type": "p",
      "text": "These one-liners are designed for rapid recall during an interview or viva."
    },
    {
      "type": "checklist",
      "items": [
        "C++ is value-oriented; Java and Python are reference-oriented.",
        "C++ has deterministic destructors; Java and Python have non-deterministic garbage collection.",
        "Java has checked exceptions; C++ and Python do not.",
        "Python uses indentation for blocks; C++ and Java use braces.",
        "C++ templates are compile-time; Java generics use type erasure at runtime.",
        "Python is dynamically typed; C++ and Java are statically typed.",
        "C++ supports multiple inheritance of classes; Java does not; Python does.",
        "Java interfaces can have default methods (since Java 8); C++ 'interfaces' are abstract classes with pure virtuals.",
        "Python's __slots__ restricts attribute creation; C++ and Java have fixed member lists by design.",
        "C++ friend functions break encapsulation deliberately; no equivalent exists in Java or Python."
      ]
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "C++ gives you maximum control and performance at the cost of complexity — manual memory, explicit virtual, raw pointers. Java gives you safety and portability with a strict type system and garbage collection — no multiple inheritance, no operator overloading, everything is a reference. Python gives you speed of development and readability with dynamic typing and duck typing — minimal syntax, convention over enforcement, and powerful introspection. The same OOP principles apply to all three, but each language optimizes for a different trade-off: C++ for performance, Java for enterprise reliability, Python for developer productivity. Knowing when to use which — and why each made the design choices it did — is what separates a good programmer from a great one in an interview."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: If asked 'which language is best for OOP?' in an interview, the correct answer is 'it depends on the problem.' C++ for systems programming where performance and deterministic resource management matter. Java for large enterprise applications where type safety and portability matter. Python for rapid prototyping, data science, and scripting where developer speed matters. All three are fully object-oriented — they just express OOP differently."
    },
    {
      "type": "h2",
      "text": "Complete the Series"
    },
    {
      "type": "p",
      "text": "You have now completed all six parts of the Object-Oriented Programming in C++: The Exam Mastery Series. From procedural vs OOP fundamentals to inheritance, polymorphism, strings, exceptions, threads, collections, and finally cross-language comparison and interview prep — every concept has been explained with working code and exam-ready definitions."
    },
    {
      "type": "cta",
      "text": "Return to Series Home →",
      "href": "/tutorials/oop-cpp-mastery",
      "note": "Review all parts, revisit weak topics, and attempt the solved papers again under timed conditions."
    },
    {
      "type": "callout",
      "icon": "🎓",
      "text": "You are now exam-ready and interview-ready. Good luck."
    }
  ]
};

export default post;
