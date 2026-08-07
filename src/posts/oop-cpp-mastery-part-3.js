const post = {
  "slug": "part-3-inheritance-relationships",
  "seriesSlug": "oop-cpp-mastery",
  "partNumber": 3,
  "totalParts": 6,
  "title": "Inheritance, Relationships, and Abstract Classes (Part 3)",
  "seriesTitle": "Object-Oriented Programming in C++: The Exam Mastery Series",
  "date": "August 7, 2026",
  "readTime": "28 min read",
  "category": "Object Oriented Programming",
  "categoryColor": "#3b82f6",
  "excerpt": "Inheritance purpose and types, 'is-a' relationship, Association, Aggregation, Composition, Abstract classes, and Interfaces — with full compilable programs.",
  "coverEmoji": "🧩",
  "tags": [
    "C++",
    "OOP",
    "Inheritance",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Part 2 taught you how to build a single class correctly. Part 3 is where classes start talking to each other — through inheritance, association, and aggregation. This is also where exam questions jump from 5 marks to 10-15 marks, because inheritance programs are longer, relationship diagrams are common, and abstract classes are a favorite theory topic. Every concept here ships with a full compilable program."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Explain types of inheritance with example' (5-7 marks), 'What is aggregation? Differentiate from composition' (5 marks), 'Explain abstract class and interface' (5 marks), and a 10-mark programming question on multilevel or multiple inheritance."
    },
    {
      "type": "h2",
      "text": "Quick Recap: From Part 2"
    },
    {
      "type": "p",
      "text": "You now know how to encapsulate data (private attributes + public services), use static members for shared state, and manage object lifecycles with constructors and destructors. Inheritance takes that encapsulated class and reuses it — without rewriting a single line of the base class."
    },
    {
      "type": "h2",
      "text": "What is Inheritance?"
    },
    {
      "type": "p",
      "text": "Inheritance is the mechanism by which a new class (derived class) acquires the properties (attributes) and behavior (methods) of an existing class (base class). It models an 'is-a' relationship: a Car is a Vehicle, a Dog is an Animal, a SavingsAccount is an Account."
    },
    {
      "type": "callout",
      "icon": "🧬",
      "text": "Real-life analogy: inheritance is like a child inheriting traits from a parent — eye color, height, blood group — but the child can also develop unique traits (new methods) or override inherited habits (method overriding). The parent doesn't need to be rewritten; the child simply extends the family tree."
    },
    {
      "type": "p",
      "text": "Purpose of inheritance: (1) Code reusability — write once in the base class, use everywhere. (2) Extensibility — add new features by creating new derived classes without touching old code. (3) Establishing natural hierarchies that mirror real-world relationships."
    },
    {
      "type": "h2",
      "text": "The 'is-a' Relationship"
    },
    {
      "type": "p",
      "text": "Before writing inheritance, verify that the sentence 'Derived is a Base' makes sense. 'A Car is a Vehicle' — valid. 'A Vehicle is a Car' — invalid (not every vehicle is a car). 'An Employee is a Person' — valid. 'A Person is an Employee' — invalid. If the sentence feels wrong, inheritance is the wrong tool; use association or aggregation instead."
    },
    {
      "type": "code-block",
      "label": "Basic Inheritance: 'is-a' in Code",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Vehicle {\nprotected:\n    string brand;\n    int year;\n\npublic:\n    Vehicle(string b, int y) : brand(b), year(y) {}\n\n    void displayBase() {\n        cout << \"Brand: \" << brand << \", Year: \" << year << endl;\n    }\n};\n\n// Car 'is-a' Vehicle\nclass Car : public Vehicle {\nprivate:\n    int numDoors;\n\npublic:\n    Car(string b, int y, int doors) : Vehicle(b, y), numDoors(doors) {}\n\n    void display() {\n        displayBase();\n        cout << \"Doors: \" << numDoors << endl;\n    }\n};\n\nint main() {\n    Car c(\"Toyota\", 2023, 4);\n    c.display();\n    // Car inherited brand, year, and displayBase() from Vehicle\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Types of Inheritance"
    },
    {
      "type": "p",
      "text": "C++ supports five types of inheritance. The exam expects you to name them, explain each in one line, and write a short example for at least the first three."
    },
    {
      "type": "table",
      "headers": [
        "Type",
        "Description",
        "Structure"
      ],
      "rows": [
        [
          "Single",
          "One derived class inherits from one base class",
          "B → D"
        ],
        [
          "Multilevel",
          "A derived class becomes the base for another derived class",
          "B → D1 → D2"
        ],
        [
          "Multiple",
          "One derived class inherits from two or more base classes",
          "B1, B2 → D"
        ],
        [
          "Hierarchical",
          "Multiple derived classes inherit from a single base class",
          "B → D1, D2, D3"
        ],
        [
          "Hybrid",
          "A combination of hierarchical and multiple inheritance",
          "B → D1, D2 → D3"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Single Inheritance",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Animal {\nprotected:\n    string name;\npublic:\n    Animal(string n) : name(n) {}\n    void eat() { cout << name << \" is eating.\" << endl; }\n};\n\nclass Dog : public Animal {\npublic:\n    Dog(string n) : Animal(n) {}\n    void bark() { cout << name << \" is barking.\" << endl; }\n};\n\nint main() {\n    Dog d(\"Bruno\");\n    d.eat();   // inherited from Animal\n    d.bark();  // own method\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Multilevel Inheritance",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Person {\nprotected:\n    string name;\npublic:\n    Person(string n) : name(n) {}\n    void showName() { cout << \"Name: \" << name << endl; }\n};\n\nclass Employee : public Person {\nprotected:\n    int empID;\npublic:\n    Employee(string n, int id) : Person(n), empID(id) {}\n    void showEmpID() { cout << \"Emp ID: \" << empID << endl; }\n};\n\nclass Manager : public Employee {\nprivate:\n    string department;\npublic:\n    Manager(string n, int id, string dept) : Employee(n, id), department(dept) {}\n    void showAll() {\n        showName();\n        showEmpID();\n        cout << \"Department: \" << department << endl;\n    }\n};\n\nint main() {\n    Manager m(\"Aman\", 101, \"IT\");\n    m.showAll();\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Multiple Inheritance",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Father {\nprotected:\n    string eyeColor;\npublic:\n    Father(string e) : eyeColor(e) {}\n    void showFatherTrait() { cout << \"Father's eye color: \" << eyeColor << endl; }\n};\n\nclass Mother {\nprotected:\n    string hairColor;\npublic:\n    Mother(string h) : hairColor(h) {}\n    void showMotherTrait() { cout << \"Mother's hair color: \" << hairColor << endl; }\n};\n\n// Child inherits from both Father and Mother\nclass Child : public Father, public Mother {\nprivate:\n    string name;\npublic:\n    Child(string n, string e, string h) : Father(e), Mother(h), name(n) {}\n    void showTraits() {\n        cout << \"Child: \" << name << endl;\n        showFatherTrait();\n        showMotherTrait();\n    }\n};\n\nint main() {\n    Child c(\"Riya\", \"Brown\", \"Black\");\n    c.showTraits();\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Hierarchical Inheritance",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Shape {\nprotected:\n    string color;\npublic:\n    Shape(string c) : color(c) {}\n    void showColor() { cout << \"Color: \" << color << endl; }\n};\n\nclass Circle : public Shape {\nprivate:\n    double radius;\npublic:\n    Circle(string c, double r) : Shape(c), radius(r) {}\n    void area() {\n        showColor();\n        cout << \"Circle area: \" << 3.14159 * radius * radius << endl;\n    }\n};\n\nclass Rectangle : public Shape {\nprivate:\n    double length, width;\npublic:\n    Rectangle(string c, double l, double w) : Shape(c), length(l), width(w) {}\n    void area() {\n        showColor();\n        cout << \"Rectangle area: \" << length * width << endl;\n    }\n};\n\nint main() {\n    Circle cir(\"Red\", 5.0);\n    Rectangle rect(\"Blue\", 4.0, 6.0);\n    cir.area();\n    rect.area();\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Access Specifiers in Inheritance"
    },
    {
      "type": "p",
      "text": "When a derived class inherits from a base class, the inheritance access specifier (public, protected, private) determines how the base class members are visible in the derived class."
    },
    {
      "type": "table",
      "headers": [
        "Base Member",
        "public inheritance",
        "protected inheritance",
        "private inheritance"
      ],
      "rows": [
        [
          "public",
          "becomes public in derived",
          "becomes protected in derived",
          "becomes private in derived"
        ],
        [
          "protected",
          "becomes protected in derived",
          "becomes protected in derived",
          "becomes private in derived"
        ],
        [
          "private",
          "not accessible in derived",
          "not accessible in derived",
          "not accessible in derived"
        ]
      ]
    },
    {
      "type": "callout",
      "icon": "🔐",
      "text": "Exam tip: public inheritance is the most common and models a true 'is-a' relationship. protected and private inheritance are rare in exams; know the table, but expect questions to use public inheritance unless stated otherwise."
    },
    {
      "type": "h2",
      "text": "Association"
    },
    {
      "type": "p",
      "text": "Association is a relationship where one class uses another class, but neither owns the other. It represents a 'uses-a' or 'knows-a' relationship. The objects are independent — they can exist without each other."
    },
    {
      "type": "callout",
      "icon": "🤝",
      "text": "Real-life analogy: a Professor teaches a Student. The Professor 'knows about' the Student, and the Student 'knows about' the Professor. If the Professor retires, the Student still exists. If the Student graduates, the Professor still exists. Neither owns the other."
    },
    {
      "type": "code-block",
      "label": "Association: Professor and Student",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Student;\n\nclass Professor {\nprivate:\n    string name;\npublic:\n    Professor(string n) : name(n) {}\n    void teach(Student &s);\n    string getName() { return name; }\n};\n\nclass Student {\nprivate:\n    string name;\npublic:\n    Student(string n) : name(n) {}\n    void learnFrom(Professor &p) {\n        cout << name << \" is learning from \" << p.getName() << endl;\n    }\n    string getName() { return name; }\n};\n\nvoid Professor::teach(Student &s) {\n    cout << name << \" is teaching \" << s.getName() << endl;\n}\n\nint main() {\n    Professor prof(\"Dr. Sharma\");\n    Student stud(\"Riya\");\n\n    prof.teach(stud);\n    stud.learnFrom(prof);\n    // Both exist independently\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Aggregation"
    },
    {
      "type": "p",
      "text": "Aggregation is a specialized form of association representing a 'has-a' or 'whole-part' relationship where the part can exist independently of the whole. It is a weaker form of containment — the lifetime of the part is not managed by the whole."
    },
    {
      "type": "callout",
      "icon": "🏫",
      "text": "Real-life analogy: a University 'has' Professors. If the University closes down, the Professors still exist — they join other universities. The University does not own the Professors' existence; it simply groups them. That's aggregation: the part (Professor) outlives the whole (University)."
    },
    {
      "type": "code-block",
      "label": "Aggregation: University and Professor",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Professor {\nprivate:\n    string name;\npublic:\n    Professor(string n) : name(n) {}\n    void display() { cout << \"Professor: \" << name << endl; }\n};\n\nclass University {\nprivate:\n    string uniName;\n    Professor *prof;  // pointer — University does not own the Professor's lifetime\npublic:\n    University(string u, Professor *p) : uniName(u), prof(p) {}\n\n    void show() {\n        cout << \"University: \" << uniName << endl;\n        if (prof) prof->display();\n    }\n};\n\nint main() {\n    Professor p(\"Dr. Sharma\");\n    \n    {\n        University u(\"MIT\", &p);\n        u.show();\n    }  // University destroyed here\n\n    // Professor still exists and usable\n    p.display();\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Composition (for Comparison)"
    },
    {
      "type": "p",
      "text": "Composition is a stronger 'has-a' relationship where the part cannot exist without the whole. The whole manages the lifetime of the part. If you know aggregation, you must also know composition — examiners love compare-and-contrast questions."
    },
    {
      "type": "table",
      "headers": [
        "Aspect",
        "Aggregation",
        "Composition"
      ],
      "rows": [
        [
          "Relationship strength",
          "Weak 'has-a'",
          "Strong 'has-a'"
        ],
        [
          "Lifetime of part",
          "Part exists independently of whole",
          "Part is created/destroyed with whole"
        ],
        [
          "Ownership",
          "Whole references part (pointer)",
          "Whole contains part (direct object or dynamic allocation in constructor)"
        ],
        [
          "Real-life example",
          "University has Professors",
          "House has Rooms (rooms don't exist without the house)"
        ],
        [
          "UML notation",
          "Empty diamond on whole side",
          "Filled diamond on whole side"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Composition: House and Room",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Room {\nprivate:\n    string roomName;\npublic:\n    Room(string n) : roomName(n) {\n        cout << \"Room created: \" << roomName << endl;\n    }\n    ~Room() {\n        cout << \"Room destroyed: \" << roomName << endl;\n    }\n    void display() { cout << \"  \" << roomName << endl; }\n};\n\nclass House {\nprivate:\n    string houseName;\n    Room livingRoom;\n    Room kitchen;\npublic:\n    House(string h, string lr, string k) : houseName(h), livingRoom(lr), kitchen(k) {\n        cout << \"House created: \" << houseName << endl;\n    }\n    ~House() {\n        cout << \"House destroyed: \" << houseName << endl;\n    }\n    void showRooms() {\n        cout << \"House: \" << houseName << \" has rooms:\" << endl;\n        livingRoom.display();\n        kitchen.display();\n    }\n};\n\nint main() {\n    House h(\"Sunset Villa\", \"Living Room\", \"Kitchen\");\n    h.showRooms();\n    // Rooms are destroyed automatically when House is destroyed\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Abstract Classes"
    },
    {
      "type": "p",
      "text": "An abstract class is a class that contains at least one pure virtual function. A pure virtual function is declared by assigning = 0 in its declaration. Abstract classes cannot be instantiated directly; they exist only to be inherited by derived classes that override the pure virtual functions."
    },
    {
      "type": "callout",
      "icon": "🎨",
      "text": "Real-life analogy: an abstract class is like a contract template. You can't use the template itself as a legal document — you must fill in the blanks (override the pure virtual functions) to create a valid, concrete contract. The template enforces what must exist, but doesn't provide the final implementation."
    },
    {
      "type": "code-block",
      "label": "Abstract Class: Shape Hierarchy",
      "code": "#include <iostream>\nusing namespace std;\n\n// Abstract class — cannot create Shape objects directly\nclass Shape {\nprotected:\n    string color;\npublic:\n    Shape(string c) : color(c) {}\n\n    // Pure virtual function — MUST be overridden by derived classes\n    virtual double calculateArea() = 0;\n\n    virtual void display() {\n        cout << \"Color: \" << color << endl;\n    }\n\n    virtual ~Shape() {}\n};\n\nclass Circle : public Shape {\nprivate:\n    double radius;\npublic:\n    Circle(string c, double r) : Shape(c), radius(r) {}\n\n    double calculateArea() override {\n        return 3.14159 * radius * radius;\n    }\n\n    void display() override {\n        Shape::display();\n        cout << \"Circle area: \" << calculateArea() << endl;\n    }\n};\n\nclass Rectangle : public Shape {\nprivate:\n    double length, width;\npublic:\n    Rectangle(string c, double l, double w) : Shape(c), length(l), width(w) {}\n\n    double calculateArea() override {\n        return length * width;\n    }\n\n    void display() override {\n        Shape::display();\n        cout << \"Rectangle area: \" << calculateArea() << endl;\n    }\n};\n\nint main() {\n    // Shape s(\"Red\");  // COMPILE ERROR: cannot instantiate abstract class\n\n    Circle c(\"Red\", 5.0);\n    Rectangle r(\"Blue\", 4.0, 6.0);\n\n    c.display();\n    r.display();\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Interfaces in C++"
    },
    {
      "type": "p",
      "text": "C++ does not have a dedicated 'interface' keyword like Java. Instead, an interface is achieved by creating a class with only pure virtual functions — no data members, no concrete methods. Any class that implements all the pure virtual functions is said to implement the interface. This is sometimes called a 'fully abstract class' or 'abstract base class with no state.'"
    },
    {
      "type": "code-block",
      "label": "Interface: Printable and Drawable",
      "code": "#include <iostream>\nusing namespace std;\n\n// Interface 1: Printable\nclass Printable {\npublic:\n    virtual void print() = 0;\n    virtual ~Printable() {}\n};\n\n// Interface 2: Drawable\nclass Drawable {\npublic:\n    virtual void draw() = 0;\n    virtual ~Drawable() {}\n};\n\n// Document implements both interfaces (multiple inheritance of interfaces)\nclass Document : public Printable, public Drawable {\nprivate:\n    string content;\npublic:\n    Document(string c) : content(c) {}\n\n    void print() override {\n        cout << \"Printing: \" << content << endl;\n    }\n\n    void draw() override {\n        cout << \"Drawing document box with content: \" << content << endl;\n    }\n};\n\nint main() {\n    Document doc(\"Exam Syllabus 2026\");\n    doc.print();\n    doc.draw();\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common exam mistake: confusing abstract class with interface. Remember: an abstract class can have data members and concrete methods; an interface (in C++ terms) has only pure virtual functions and no state. Also, forgetting the virtual destructor in a base class is a memory-leak trap that examiners love to ask about."
    },
    {
      "type": "h2",
      "text": "Constructors and Destructors in Inheritance"
    },
    {
      "type": "p",
      "text": "When a derived class object is created, the base class constructor runs first, then the derived class constructor. When the object is destroyed, the derived class destructor runs first, then the base class destructor. This order guarantees that the base is fully built before the derived class touches it, and the derived class is fully cleaned up before the base is destroyed."
    },
    {
      "type": "code-block",
      "label": "Constructor/Destructor Order in Inheritance",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Base {\npublic:\n    Base() { cout << \"Base constructor\" << endl; }\n    ~Base() { cout << \"Base destructor\" << endl; }\n};\n\nclass Derived : public Base {\npublic:\n    Derived() { cout << \"Derived constructor\" << endl; }\n    ~Derived() { cout << \"Derived destructor\" << endl; }\n};\n\nint main() {\n    cout << \"Creating object...\" << endl;\n    Derived d;\n    cout << \"Destroying object...\" << endl;\n    return 0;\n}\n\n/* Output:\nCreating object...\nBase constructor\nDerived constructor\nDestroying object...\nDerived destructor\nBase destructor\n*/"
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
        "Q1: Explain the 'is-a' relationship with a real-life example.",
        "Q2: List and explain any three types of inheritance with a small code sketch for each.",
        "Q3: Differentiate aggregation and composition (any four points).",
        "Q4: What is an abstract class? Why can it not be instantiated? Write a minimal example.",
        "Q5: Write a C++ program demonstrating hierarchical inheritance with a base class Employee and derived classes Manager and Engineer."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: The 'is-a' relationship means a derived class is a specialized version of its base class. For example, 'A Car is a Vehicle' — every car has all the properties of a vehicle (brand, year) plus its own specialized properties (numDoors). The sentence must make sense in one direction only; reversing it ('A Vehicle is a Car') is false, which tells us inheritance is inappropriate in that direction."
    },
    {
      "type": "p",
      "text": "A2: Single — one derived from one base (Dog is Animal). Multilevel — chain of inheritance (Manager is Employee is Person). Multiple — one derived from multiple bases (Child is Father and Mother). Hierarchical — many derived from one base (Circle and Rectangle are both Shape). Hybrid — combination of hierarchical and multiple."
    },
    {
      "type": "p",
      "text": "A3: (i) Aggregation is weak 'has-a'; composition is strong 'has-a'. (ii) In aggregation, the part exists independently; in composition, the part is created/destroyed with the whole. (iii) Aggregation uses pointers/references; composition uses direct member objects or dynamic allocation inside the class. (iv) Aggregation UML uses an empty diamond; composition uses a filled diamond."
    },
    {
      "type": "p",
      "text": "A4: An abstract class contains at least one pure virtual function (= 0). It cannot be instantiated because it is incomplete — the pure virtual functions have no implementation in the base class. Only derived classes that override every pure virtual function become concrete and can be instantiated."
    },
    {
      "type": "p",
      "text": "A5: See the complete, compilable solution below."
    },
    {
      "type": "code-block",
      "label": "Q5 Solution: Hierarchical Inheritance",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Employee {\nprotected:\n    string name;\n    int id;\npublic:\n    Employee(string n, int i) : name(n), id(i) {}\n    void showBasic() {\n        cout << \"Name: \" << name << \", ID: \" << id << endl;\n    }\n};\n\nclass Manager : public Employee {\nprivate:\n    int teamSize;\npublic:\n    Manager(string n, int i, int t) : Employee(n, i), teamSize(t) {}\n    void show() {\n        showBasic();\n        cout << \"Role: Manager, Team Size: \" << teamSize << endl;\n    }\n};\n\nclass Engineer : public Employee {\nprivate:\n    string techStack;\npublic:\n    Engineer(string n, int i, string ts) : Employee(n, i), techStack(ts) {}\n    void show() {\n        showBasic();\n        cout << \"Role: Engineer, Tech: \" << techStack << endl;\n    }\n};\n\nint main() {\n    Manager m(\"Aman\", 101, 5);\n    Engineer e(\"Riya\", 102, \"C++\");\n    m.show();\n    e.show();\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Inheritance lets you reuse and extend existing classes through an 'is-a' relationship. Know the five types, but focus on single, multilevel, and hierarchical for exams. Association is a loose 'uses-a' link; aggregation is a weak 'has-a' where parts outlive the whole; composition is a strong 'has-a' where parts die with the whole. Abstract classes enforce contracts via pure virtual functions; interfaces in C++ are simply abstract classes with no state. Always remember: base constructor first, derived destructor first."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: If asked to define inheritance in one line for an exam — 'Inheritance is the mechanism by which a derived class acquires the attributes and methods of a base class, modeling an is-a relationship and enabling code reuse and extensibility.' Memorize that sentence. Then move to Part 4."
    }
  ]
};

export default post;
