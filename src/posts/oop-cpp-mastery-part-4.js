const post = {
  "slug": "part-4-polymorphism",
  "seriesSlug": "oop-cpp-mastery",
  "partNumber": 4,
  "totalParts": 6,
  "title": "Polymorphism, Virtual Functions, and Friend Mechanisms (Part 4)",
  "seriesTitle": "Object-Oriented Programming in C++: The Exam Mastery Series",
  "date": "August 7, 2026",
  "readTime": "27 min read",
  "category": "Object Oriented Programming",
  "categoryColor": "#3b82f6",
  "excerpt": "Polymorphism introduction, method overriding and overloading, static vs runtime polymorphism, virtual functions, friend functions, static functions, and friend classes — with full compilable programs.",
  "coverEmoji": "🧩",
  "tags": [
    "C++",
    "OOP",
    "Polymorphism",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Part 3 gave you inheritance — classes that share a family tree. Part 4 is where that family tree becomes dynamic: the same function call behaves differently depending on which object answers it. This is polymorphism, and it is the most powerful concept in OOP. It is also where exam questions become tricky — virtual functions, vtables, friend functions, and static functions are all favorite traps. Every concept here comes with a full compilable program and a clear exam-ready definition."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Explain polymorphism and its types' (5 marks), 'Differentiate method overloading and overriding' (5 marks), 'What is a virtual function? Explain with example' (5-7 marks), 'Explain friend function and friend class' (5 marks), and a 10-mark program using runtime polymorphism with a base class pointer array."
    },
    {
      "type": "h2",
      "text": "What is Polymorphism?"
    },
    {
      "type": "p",
      "text": "Polymorphism means 'many forms.' In OOP, it is the ability of a function, operator, or object to behave differently depending on the context — specifically, depending on the type of object that invokes it or the arguments passed to it. The same interface behaves differently in different situations."
    },
    {
      "type": "callout",
      "icon": "🎭",
      "text": "Real-life analogy: the same person behaves as a 'student' in college, an 'employee' at work, and a 'customer' at a restaurant. The person (object) is the same, but their behavior (methods) changes depending on the context (class/role). That's polymorphism — one entity, many forms."
    },
    {
      "type": "p",
      "text": "C++ implements polymorphism in two ways: compile-time (static) polymorphism, resolved by the compiler before the program runs; and run-time (dynamic) polymorphism, resolved during program execution based on the actual object type."
    },
    {
      "type": "image",
      "src": "/images/roadmaps/polymorphism.png",
      "alt": "Types of Polymorphism in OOP",
      "caption": "Diagram showing Compile-Time (Static) and Run-Time (Dynamic) Polymorphism with examples"
    },
    {
      "type": "h2",
      "text": "Compile-Time (Static) Polymorphism"
    },
    {
      "type": "p",
      "text": "Static polymorphism is resolved during compilation. The compiler knows exactly which function to call based on the number, type, and order of arguments (function overloading) or the types of operands (operator overloading). There is no runtime decision-making — the binding is early."
    },
    {
      "type": "h2",
      "text": "Function Overloading"
    },
    {
      "type": "p",
      "text": "Function overloading allows multiple functions with the same name but different parameter lists (different number, type, or order of parameters) to coexist in the same scope. The compiler picks the correct version based on the arguments at the call site."
    },
    {
      "type": "code-block",
      "label": "Function Overloading: Area Calculator",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Calculator {\npublic:\n    // Overloaded functions: same name, different parameters\n    int area(int side) {\n        return side * side;\n    }\n\n    int area(int length, int width) {\n        return length * width;\n    }\n\n    double area(double radius) {\n        return 3.14159 * radius * radius;\n    }\n\n    double area(double base, double height) {\n        return 0.5 * base * height;\n    }\n};\n\nint main() {\n    Calculator calc;\n\n    cout << \"Square area: \" << calc.area(5) << endl;\n    cout << \"Rectangle area: \" << calc.area(4, 6) << endl;\n    cout << \"Circle area: \" << calc.area(3.0) << endl;\n    cout << \"Triangle area: \" << calc.area(4.0, 5.0) << endl;\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Operator Overloading"
    },
    {
      "type": "p",
      "text": "Operator overloading lets you redefine the behavior of C++ operators (+, -, *, <<, etc.) for user-defined types (classes). It makes class objects feel like built-in types. The exam typically asks for overloading +, -, or << for a simple class like Complex or Matrix."
    },
    {
      "type": "code-block",
      "label": "Operator Overloading: Complex Numbers",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Complex {\nprivate:\n    double real, imag;\npublic:\n    Complex(double r = 0, double i = 0) : real(r), imag(i) {}\n\n    // Overload + operator\n    Complex operator+(const Complex &other) {\n        return Complex(real + other.real, imag + other.imag);\n    }\n\n    // Overload - operator\n    Complex operator-(const Complex &other) {\n        return Complex(real - other.real, imag - other.imag);\n    }\n\n    // Friend function to overload << for output\n    friend ostream& operator<<(ostream &out, const Complex &c) {\n        out << c.real << \" + \" << c.imag << \"i\";\n        return out;\n    }\n};\n\nint main() {\n    Complex c1(3.0, 4.0);\n    Complex c2(1.5, 2.5);\n\n    Complex c3 = c1 + c2;\n    Complex c4 = c1 - c2;\n\n    cout << \"c1 = \" << c1 << endl;\n    cout << \"c2 = \" << c2 << endl;\n    cout << \"c1 + c2 = \" << c3 << endl;\n    cout << \"c1 - c2 = \" << c4 << endl;\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Run-Time (Dynamic) Polymorphism"
    },
    {
      "type": "p",
      "text": "Dynamic polymorphism is resolved at runtime. The decision of which function to call is made based on the actual type of the object pointed to by a base class pointer or reference, not the type of the pointer itself. This requires virtual functions."
    },
    {
      "type": "h2",
      "text": "Virtual Functions"
    },
    {
      "type": "p",
      "text": "A virtual function is a member function declared in a base class with the keyword virtual, and overridden in a derived class. When called through a base class pointer or reference, the derived class version is executed — this is runtime polymorphism. Without virtual, the base class version would always run (static binding)."
    },
    {
      "type": "callout",
      "icon": "🎬",
      "text": "Real-life analogy: a remote control (base class pointer) has a 'Play' button (virtual function). When you point it at a TV, it plays a movie. When you point it at a music player, it plays a song. The button is the same, but the behavior depends on the actual device (object) the remote is controlling. That's virtual function dispatch."
    },
    {
      "type": "code-block",
      "label": "Virtual Functions: Runtime Polymorphism",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Animal {\npublic:\n    virtual void speak() {\n        cout << \"Animal speaks.\" << endl;\n    }\n\n    // Virtual destructor is essential when deleting derived objects via base pointer\n    virtual ~Animal() {}\n};\n\nclass Dog : public Animal {\npublic:\n    void speak() override {\n        cout << \"Dog barks: Woof!\" << endl;\n    }\n};\n\nclass Cat : public Animal {\npublic:\n    void speak() override {\n        cout << \"Cat meows: Meow!\" << endl;\n    }\n};\n\nint main() {\n    Animal *a1 = new Dog();\n    Animal *a2 = new Cat();\n\n    a1->speak();  // Dog's speak() runs — runtime decision\n    a2->speak();  // Cat's speak() runs — runtime decision\n\n    delete a1;\n    delete a2;\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "The Vtable (Exam Theory)"
    },
    {
      "type": "p",
      "text": "Behind every class with virtual functions, the compiler builds a virtual function table (vtable) — an array of function pointers. Each object of that class gets a hidden pointer (vptr) to its class's vtable. When a virtual function is called through a base pointer, the program follows the vptr to the vtable and calls the correct function. This indirection is why virtual functions have a small runtime overhead, but it is what enables dynamic polymorphism."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam-ready one-liner: 'When a class contains virtual functions, the compiler creates a vtable containing addresses of all virtual functions. Each object stores a hidden vptr pointing to this vtable. At runtime, the vptr is dereferenced to invoke the correct overridden function, enabling dynamic binding.'"
    },
    {
      "type": "h2",
      "text": "Method Overloading vs Method Overriding"
    },
    {
      "type": "p",
      "text": "These two concepts are frequently confused in exams. Overloading is compile-time, within the same class, with different signatures. Overriding is run-time, across base and derived classes, with the exact same signature."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Method Overloading",
        "Method Overriding"
      ],
      "rows": [
        [
          "Definition",
          "Same function name, different parameters in same class",
          "Same function name and parameters in derived class, redefining base behavior"
        ],
        [
          "Scope",
          "Within the same class",
          "Across base and derived classes"
        ],
        [
          "Return type",
          "Can differ",
          "Must be same (or covariant)"
        ],
        [
          "Binding",
          "Compile-time (early/static)",
          "Run-time (late/dynamic)"
        ],
        [
          "Requires inheritance",
          "No",
          "Yes"
        ],
        [
          "Requires virtual",
          "No",
          "Yes (for true runtime polymorphism)"
        ],
        [
          "Example",
          "area(int), area(int,int)",
          "base::draw() → derived::draw()"
        ]
      ]
    },
    {
      "type": "h2",
      "text": "Friend Functions"
    },
    {
      "type": "p",
      "text": "A friend function is a non-member function that is granted access to the private and protected members of a class. It is declared inside the class with the friend keyword, but it is not a member function — it has no this pointer and is called like a normal function. Friend functions are useful when an operation involves two or more classes and shouldn't logically belong to either one."
    },
    {
      "type": "callout",
      "icon": "🤝",
      "text": "Real-life analogy: a friend function is like a trusted friend who has the key to your house. They are not a family member (not a class member), but you explicitly gave them access. They can enter and use private things, but they don't live there."
    },
    {
      "type": "code-block",
      "label": "Friend Function: Adding Two Private Values",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Box;\n\nclass Container {\nprivate:\n    int width;\npublic:\n    Container(int w) : width(w) {}\n    friend int totalWidth(const Container &c, const Box &b);\n};\n\nclass Box {\nprivate:\n    int width;\npublic:\n    Box(int w) : width(w) {}\n    friend int totalWidth(const Container &c, const Box &b);\n};\n\n// Friend function accessing private members of BOTH classes\nint totalWidth(const Container &c, const Box &b) {\n    return c.width + b.width;\n}\n\nint main() {\n    Container c(10);\n    Box b(5);\n    cout << \"Total width: \" << totalWidth(c, b) << endl;\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Friend Classes"
    },
    {
      "type": "p",
      "text": "A friend class is a class whose all member functions are granted access to the private and protected members of another class. If class B is declared as a friend inside class A, then every member function of B can access private members of A."
    },
    {
      "type": "code-block",
      "label": "Friend Class: Printer accesses Document",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Document {\nprivate:\n    string content;\npublic:\n    Document(string c) : content(c) {}\n\n    // Printer class is a friend — all its methods can access Document's private data\n    friend class Printer;\n};\n\nclass Printer {\npublic:\n    void print(const Document &doc) {\n        // Accessing private member 'content' directly because Printer is a friend class\n        cout << \"Printing: \" << doc.content << endl;\n    }\n\n    void printSummary(const Document &doc) {\n        cout << \"Summary (\" << doc.content.length() << \" chars): \"\n             << doc.content.substr(0, 20) << \"...\" << endl;\n    }\n};\n\nint main() {\n    Document doc(\"This is a confidential report for the exam.\");\n    Printer p;\n    p.print(doc);\n    p.printSummary(doc);\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Static Member Functions (Revisited)"
    },
    {
      "type": "p",
      "text": "A static member function belongs to the class, not to any object. It can be called using the class name and scope resolution operator (::) without creating an object. It can only access static data members and other static member functions — it has no this pointer because there is no object context."
    },
    {
      "type": "code-block",
      "label": "Static Function: Factory Pattern Style",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Logger {\nprivate:\n    static int logCount;\n    string name;\n\n    // Private constructor — objects can only be created through static factory method\n    Logger(string n) : name(n) {\n        logCount++;\n    }\n\npublic:\n    static Logger* createLogger(string n) {\n        cout << \"Factory creating logger: \" << n << endl;\n        return new Logger(n);\n    }\n\n    static int getLogCount() {\n        return logCount;\n    }\n\n    void log(string msg) {\n        cout << \"[\" << name << \"] \" << msg << endl;\n    }\n};\n\nint Logger::logCount = 0;\n\nint main() {\n    cout << \"Loggers created so far: \" << Logger::getLogCount() << endl;\n\n    Logger *l1 = Logger::createLogger(\"App\");\n    Logger *l2 = Logger::createLogger(\"DB\");\n\n    l1->log(\"Application started\");\n    l2->log(\"Database connected\");\n\n    cout << \"Loggers created so far: \" << Logger::getLogCount() << endl;\n\n    delete l1;\n    delete l2;\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Putting It Together: Runtime Polymorphism with Base Pointer Array"
    },
    {
      "type": "p",
      "text": "This is the classic 10-mark exam program: create an array of base class pointers, populate it with derived class objects, and call a virtual function in a loop. The same line of code executes different behavior for each object."
    },
    {
      "type": "code-block",
      "label": "Full Program: Employee Payroll via Polymorphism",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Employee {\nprotected:\n    string name;\n    int id;\npublic:\n    Employee(string n, int i) : name(n), id(i) {}\n\n    virtual double calculateSalary() = 0;\n    virtual void display() = 0;\n    virtual ~Employee() {}\n};\n\nclass SalariedEmployee : public Employee {\nprivate:\n    double monthlySalary;\npublic:\n    SalariedEmployee(string n, int i, double ms)\n        : Employee(n, i), monthlySalary(ms) {}\n\n    double calculateSalary() override {\n        return monthlySalary;\n    }\n\n    void display() override {\n        cout << \"Salaried: \" << name << \" (ID: \" << id << \")\n             << \", Monthly: Rs.\" << calculateSalary() << endl;\n    }\n};\n\nclass HourlyEmployee : public Employee {\nprivate:\n    double hourlyRate;\n    int hoursWorked;\npublic:\n    HourlyEmployee(string n, int i, double hr, int hw)\n        : Employee(n, i), hourlyRate(hr), hoursWorked(hw) {}\n\n    double calculateSalary() override {\n        return hourlyRate * hoursWorked;\n    }\n\n    void display() override {\n        cout << \"Hourly: \" << name << \" (ID: \" << id << \")\n             << \", Pay: Rs.\" << calculateSalary() << endl;\n    }\n};\n\nclass CommissionEmployee : public Employee {\nprivate:\n    double sales;\n    double commissionRate;\npublic:\n    CommissionEmployee(string n, int i, double s, double cr)\n        : Employee(n, i), sales(s), commissionRate(cr) {}\n\n    double calculateSalary() override {\n        return sales * commissionRate;\n    }\n\n    void display() override {\n        cout << \"Commission: \" << name << \" (ID: \" << id << \")\n             << \", Pay: Rs.\" << calculateSalary() << endl;\n    }\n};\n\nint main() {\n    Employee *staff[3];\n\n    staff[0] = new SalariedEmployee(\"Aman\", 101, 50000);\n    staff[1] = new HourlyEmployee(\"Riya\", 102, 500, 160);\n    staff[2] = new CommissionEmployee(\"Zoya\", 103, 200000, 0.10);\n\n    cout << \"=== Payroll System ===\" << endl;\n    for (int i = 0; i < 3; i++) {\n        staff[i]->display();\n    }\n\n    double total = 0;\n    for (int i = 0; i < 3; i++) {\n        total += staff[i]->calculateSalary();\n    }\n    cout << \"Total payroll: Rs.\" << total << endl;\n\n    for (int i = 0; i < 3; i++) {\n        delete staff[i];\n    }\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common exam mistake: forgetting the virtual destructor in a base class that is meant to be inherited. If you delete a derived object through a base pointer without a virtual destructor, the derived destructor never runs — memory leaks and resource leaks follow. Always add virtual ~BaseClass() {} when a class has virtual functions."
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
        "Q1: Define polymorphism. Explain the difference between compile-time and run-time polymorphism.",
        "Q2: Differentiate function overloading and function overriding (any four points).",
        "Q3: What is a virtual function? Why is it necessary for runtime polymorphism?",
        "Q4: Explain friend function and friend class with a minimal code example for each.",
        "Q5: Write a C++ program demonstrating runtime polymorphism using a base class Shape with virtual function draw(), and derived classes Circle and Rectangle. Store objects in a base pointer array and call draw() in a loop."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: Polymorphism is the ability of a function, operator, or object to behave differently based on context. Compile-time polymorphism is resolved by the compiler before execution — function overloading and operator overloading are examples. Run-time polymorphism is resolved during program execution based on the actual object type — achieved through virtual functions and base class pointers."
    },
    {
      "type": "p",
      "text": "A2: (i) Overloading is in the same class; overriding is across base and derived. (ii) Overloading requires different parameter lists; overriding requires identical signatures. (iii) Overloading is compile-time binding; overriding is run-time binding. (iv) Overloading does not require inheritance; overriding requires inheritance and virtual functions."
    },
    {
      "type": "p",
      "text": "A3: A virtual function is a member function declared with the virtual keyword in a base class and overridden in a derived class. It is necessary for runtime polymorphism because without it, the compiler uses static binding — the base class version is always called through a base pointer. With virtual, the program uses dynamic binding via the vtable, ensuring the derived class version runs for derived objects."
    },
    {
      "type": "p",
      "text": "A4: A friend function is a non-member function granted access to private/protected members of a class via the friend keyword. A friend class is a class all of whose member functions are friends of another class. See the code examples in the main content above."
    },
    {
      "type": "p",
      "text": "A5: See the complete, compilable solution below."
    },
    {
      "type": "code-block",
      "label": "Q5 Solution: Shape Polymorphism",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Shape {\npublic:\n    virtual void draw() = 0;\n    virtual ~Shape() {}\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() override {\n        cout << \"Drawing a Circle\" << endl;\n    }\n};\n\nclass Rectangle : public Shape {\npublic:\n    void draw() override {\n        cout << \"Drawing a Rectangle\" << endl;\n    }\n};\n\nint main() {\n    Shape *shapes[2];\n    shapes[0] = new Circle();\n    shapes[1] = new Rectangle();\n\n    for (int i = 0; i < 2; i++) {\n        shapes[i]->draw();\n    }\n\n    for (int i = 0; i < 2; i++) {\n        delete shapes[i];\n    }\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Polymorphism is OOP's most powerful feature: one interface, many implementations. Compile-time polymorphism gives you overloaded functions and operators resolved before the program runs. Run-time polymorphism gives you virtual functions that dispatch to the correct derived class method at execution time. Friend functions and classes break encapsulation deliberately for tightly coupled operations. Static member functions serve the class, not individual objects. Master the vtable concept for theory, and always remember the virtual destructor rule for practical code."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: If asked to define polymorphism in one line for an exam — 'Polymorphism is the ability of a function, operator, or object to exhibit different behaviors in different contexts, achieved through overloading (compile-time) and virtual functions (run-time).' Memorize that sentence. Then move to Part 5."
    }
  ]
};

export default post;
