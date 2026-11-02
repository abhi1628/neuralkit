const post = {
  "slug": "part-2-encapsulation-abstraction",
  "seriesSlug": "oop-cpp-mastery",
  "partNumber": 2,
  "totalParts": 6,
  "title": "Encapsulation and Data Abstraction (Part 2)",
  "seriesTitle": "Object-Oriented Programming in C++: The Exam Mastery Series",
  "date": "August 7, 2026",
  "readTime": "34 min read",
  "category": "Object Oriented Programming",
  "categoryColor": "#3b82f6",
  "excerpt": "State, behavior, and identity of an object; identifying classes and candidates for classes; attributes, services, access modifiers, static members, instances, message passing, and constructors/destructors.",
  "coverEmoji": "🧩",
  "tags": [
    "C++",
    "OOP",
    "Encapsulation",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Part 1 gave you the vocabulary. Part 2 is where you start actually building classes the way an exam expects: correctly identified, correctly encapsulated, with the right access modifiers, static members used only when appropriate, and a clean constructor/destructor lifecycle. This is also where most 5-10 mark programming questions live, so every concept here comes with a full compilable program."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'What are access modifiers? Explain with example' (5 marks), 'Explain static members of a class' (3-5 marks), 'Differentiate constructor and destructor' (3-5 marks), and a programming question asking you to design a class with a given attribute list (8-10 marks)."
    },
    {
      "type": "h2",
      "text": "Quick Recap: State, Behavior, Identity"
    },
    {
      "type": "p",
      "text": "Part 1 covered this in detail with the Object Model. As a reminder: state is an object's current data, behavior is what it can do, and identity is what makes it a distinct object even with identical state (its address in memory). Everything in this part is really about how C++ lets you control and protect that state."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Define state, behavior and identity of an object, illustrating each with a BankAccount object. Explain the use of the this pointer and of static member functions. Why can a static member function not access non-static data members?"
    },
    {
      "type": "p",
      "text": "Answer, part 1 (state, behavior, identity): State is the set of current values of an object's attributes. For a BankAccount it is the holder name and the balance, e.g. 'Riya' and 5000. Behavior is the set of operations the object can perform, which read or change its state: deposit(), withdraw() and show(). Identity is the property that makes an object distinct from every other object even when their state is identical; in C++ it is effectively the object's memory address. In the code below, a1 and a2 start with identical state but are two different objects because their addresses differ. The this pointer and static member functions (the rest of this question) are answered in the Static Members section further down."
    },
    {
      "type": "code-block",
      "label": "State, Behavior, and Identity of a BankAccount",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass BankAccount {\nprivate:\n    string holder;      // STATE: current values of the attributes\n    double balance;     // STATE\n\npublic:\n    BankAccount(string h, double b) : holder(h), balance(b) {}\n\n    void deposit(double amount) {    // BEHAVIOR: what the object can do\n        balance += amount;\n    }\n\n    void withdraw(double amount) {   // BEHAVIOR\n        if (amount <= balance) balance -= amount;\n    }\n\n    void show() const {\n        cout << holder << \": \" << balance << \" (address: \" << this << \")\" << endl;\n    }\n};\n\nint main() {\n    BankAccount a1(\"Riya\", 5000);\n    BankAccount a2(\"Riya\", 5000);    // same state as a1\n\n    a1.deposit(1000);                // behavior changes a1's state: balance 5000 -> 6000\n    a1.show();                       // Riya: 6000 (address: 0x...)\n    a2.show();                       // Riya: 5000 (address: 0x...) different address\n\n    // Even if both had identical state, a1 and a2 would still be two distinct\n    // objects because their IDENTITY (memory address) differs.\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Class vs Object"
    },
    {
      "type": "p",
      "text": "A class is a user-defined blueprint that declares attributes (data members) and services (member functions) but occupies no memory for those attributes until it is instantiated. An object is a concrete instance of a class — it has real memory allocated for its own copy of the (non-static) attributes."
    },
    {
      "type": "table",
      "headers": ["Aspect", "Class", "Object"],
      "rows": [
        ["What it is", "A blueprint/template", "A concrete instance built from the blueprint"],
        ["Memory", "No memory allocated for data members (until instantiated)", "Memory allocated for its own copy of non-static data members"],
        ["Declared with", "class keyword", "ClassName objectName;"],
        ["How many exist", "One class definition", "Many objects can be created from one class"],
        ["Real-life analogy", "The architectural blueprint of a house", "The actual house built from that blueprint — you can build many houses from one blueprint"]
      ]
    },
    {
      "type": "code-block",
      "label": "Class vs Object in C++",
      "code": "#include <iostream>\nusing namespace std;\n\nclass House {         // BLUEPRINT — no memory used yet for rooms/area\npublic:\n    int rooms;\n    double area;\n\n    void describe() {\n        cout << \"House with \" << rooms << \" rooms, \" << area << \" sq.ft.\" << endl;\n    }\n};\n\nint main() {\n    // Two different OBJECTS built from the same CLASS\n    House house1;\n    house1.rooms = 3;\n    house1.area = 1200.5;\n\n    House house2;\n    house2.rooms = 5;\n    house2.area = 2400.0;\n\n    house1.describe();\n    house2.describe();\n    // Same blueprint (House), two different real houses (objects) with their own data.\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Identifying Classes and Candidate Classes"
    },
    {
      "type": "p",
      "text": "Given a problem statement, examiners often ask you to identify suitable classes. The standard technique is noun extraction: read the problem description, underline every noun (these are candidate classes or attributes), and every verb (these are candidate methods/services). Then filter out nouns that are just attributes of a bigger entity, not classes on their own."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Read the problem statement carefully",
          "text": "Example: 'A library issues books to members. Each book has a title, author, and ISBN. Each member has a name and a membership ID. A librarian manages issuing and returning books.'"
        },
        {
          "num": "2",
          "title": "Underline all nouns",
          "text": "Library, book, title, author, ISBN, member, name, membership ID, librarian."
        },
        {
          "num": "3",
          "title": "Separate candidate classes from attributes",
          "text": "Candidate classes (independent entities with their own behavior): Book, Member, Librarian, Library. Attributes (belong to a class, not classes themselves): title, author, ISBN belong to Book; name, membership ID belong to Member."
        },
        {
          "num": "4",
          "title": "Underline verbs to find services (methods)",
          "text": "'Issues', 'manages', 'returning' → issueBook(), returnBook() likely belong to Library or Librarian."
        },
        {
          "num": "5",
          "title": "Refine the list",
          "text": "Drop duplicate or vague candidates. Keep only classes that have distinct state and behavior relevant to the system being modeled."
        }
      ]
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam tip: when asked to 'identify classes' from a problem statement, always show your noun/verb underlining explicitly in the answer — examiners give marks for the process, not just the final class list."
    },
    {
      "type": "h2",
      "text": "Attributes and Services"
    },
    {
      "type": "p",
      "text": "Inside a class, data members are called attributes (they hold state) and member functions are called services (they define behavior — what the class 'offers' to the outside world)."
    },
    {
      "type": "checklist",
      "items": [
        "Attribute (data member): a variable declared inside a class, representing one piece of an object's state — e.g. balance in an Account class.",
        "Service (member function): a function declared inside a class that operates on the class's attributes and is offered to the outside world — e.g. deposit() and withdraw().",
        "Attributes are usually kept private; services are usually kept public — this is the essence of encapsulation.",
        "A class can also have services that are only used internally (helper functions) — these are typically private too."
      ]
    },
    {
      "type": "h2",
      "text": "Access Modifiers"
    },
    {
      "type": "p",
      "text": "Access modifiers control which parts of a program can access a class's members. C++ provides three: private, public, and protected."
    },
    {
      "type": "table",
      "headers": ["Modifier", "Accessible Within Same Class", "Accessible in Derived Class", "Accessible Outside the Class"],
      "rows": [
        ["private", "Yes", "No", "No"],
        ["protected", "Yes", "Yes", "No"],
        ["public", "Yes", "Yes", "Yes"]
      ]
    },
    {
      "type": "callout",
      "icon": "🔐",
      "text": "Real-life analogy: think of a house. private is like your bedroom — only you (the class itself) can enter. protected is like the living room — family members (derived classes) can enter, but outside visitors cannot. public is like the front porch — anyone (any code) can access it directly."
    },
    {
      "type": "code-block",
      "label": "Access Modifiers in Action",
      "code": "#include <iostream>\nusing namespace std;\n\nclass BankAccount {\nprivate:\n    double balance;              // hidden — only this class can touch it directly\n\nprotected:\n    string accountType;          // visible to this class and any derived class\n\npublic:\n    string ownerName;            // accessible from anywhere\n\n    BankAccount(string name, double initialBalance) {\n        ownerName = name;\n        balance = initialBalance;\n        accountType = \"Standard\";\n    }\n\n    void deposit(double amount) {   // public service — the only safe way to change balance\n        balance += amount;\n    }\n\n    double getBalance() {\n        return balance;\n    }\n};\n\nint main() {\n    BankAccount acc(\"Aman\", 5000.0);\n\n    acc.ownerName = \"Aman Verma\";   // OK: public\n    acc.deposit(1000);              // OK: public method\n    cout << \"Balance: \" << acc.getBalance() << endl;\n\n    // acc.balance = 999999;        // COMPILE ERROR: balance is private\n    // acc.accountType = \"VIP\";     // COMPILE ERROR: accountType is protected\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Distinguish between encapsulation and data abstraction, and state the visibility of members under each C++ access specifier."
    },
    {
      "type": "table",
      "headers": ["Aspect", "Encapsulation", "Data Abstraction"],
      "rows": [
        ["Meaning", "Bundling data and the functions that operate on it into one unit (class) and restricting direct access to that data", "Showing only the essential features to the user and hiding the implementation details and complexity"],
        ["Focus", "How the data is packaged and protected", "What the user needs to see and use"],
        ["Mainly achieved by", "Classes with private/protected data members and public member functions", "A simple public interface; at design level, abstract classes and pure virtual functions"],
        ["Level", "Implementation level (inside the class)", "Design level (the outside view of the class)"],
        ["What is hidden", "The data (state)", "The complexity of how the work is done"],
        ["BankAccount example", "balance is private and can change only through deposit() and withdraw()", "The user calls withdraw(500) without knowing about the validation, logging, or database updates behind it"]
      ]
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Relationship: abstraction is the design idea (show only what is needed) and encapsulation is the mechanism that enforces it (hide the data behind access specifiers). Encapsulation helps to achieve abstraction."
    },
    {
      "type": "p",
      "text": "Visibility of members under each access specifier:"
    },
    {
      "type": "table",
      "headers": ["Specifier", "Visible to", "Typical use", "Default for"],
      "rows": [
        ["private", "Member functions (and friends) of the same class only. Not visible to derived classes or outside code.", "Data members and internal helper functions", "class (when no specifier is written)"],
        ["protected", "The same class and its derived classes. Not visible to outside code.", "Members that subclasses need to use", "None"],
        ["public", "Everywhere: the same class, derived classes, and outside code.", "The interface, i.e. member functions meant to be called by users", "struct"]
      ]
    },
    {
      "type": "h2",
      "text": "Static Members of a Class"
    },
    {
      "type": "p",
      "text": "A static data member is shared by all objects of a class — there is only one copy of it, no matter how many objects are created. A static member function can be called without creating any object, and it can only access other static members."
    },
    {
      "type": "callout",
      "icon": "📋",
      "text": "Real-life analogy: a static data member is like a notice board in a school common room — every student (object) reads and can update the same single notice board. It doesn't belong to any one student; it belongs to the whole class (school)."
    },
    {
      "type": "code-block",
      "label": "Static Members: Counting Objects",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    static int totalStudents;   // declaration — shared by ALL objects\n\npublic:\n    Student(string n) {\n        name = n;\n        totalStudents++;        // every new object increments the SAME counter\n    }\n\n    ~Student() {\n        totalStudents--;\n    }\n\n    static int getTotalStudents() {   // static function: no 'this', can't touch non-static members\n        return totalStudents;\n    }\n};\n\n// Static data members must be defined (given memory) outside the class\nint Student::totalStudents = 0;\n\nint main() {\n    cout << \"Before: \" << Student::getTotalStudents() << endl;  // 0\n\n    Student s1(\"Riya\");\n    Student s2(\"Aman\");\n    Student s3(\"Zoya\");\n\n    cout << \"After creating 3 students: \" << Student::getTotalStudents() << endl;  // 3\n\n    {\n        Student s4(\"Karan\");\n        cout << \"Inside block: \" << Student::getTotalStudents() << endl;  // 4\n    } // s4 destroyed here\n\n    cout << \"After block ends: \" << Student::getTotalStudents() << endl;  // 3\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question (continued from the Quick Recap): Explain the use of the this pointer and of static member functions. Why can a static member function not access non-static data members?"
    },
    {
      "type": "p",
      "text": "The this pointer is a hidden pointer that the compiler passes to every non-static member function. It holds the address of the object on which the function was called, so inside the function a member name such as balance really means this->balance. It has the type ClassName* const (const ClassName* const inside a const member function). It is used to: (1) distinguish a data member from a parameter or local variable with the same name, e.g. this->value = value; (2) return the invoking object itself with return *this, which allows chained calls like c.add(5).add(20); and (3) compare or pass the address of the current object, e.g. to check for self-assignment."
    },
    {
      "type": "p",
      "text": "A static member function belongs to the class, not to any one object. It can be called using the class name without creating an object (Counter::getInstances()), and it can access only static data members and other static member functions. It is typically used for class-level information such as counters."
    },
    {
      "type": "code-block",
      "label": "The this Pointer and a Static Member Function",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Counter {\nprivate:\n    int value;\n    static int instances;            // one copy shared by all objects\n\npublic:\n    Counter(int value) {\n        this->value = value;         // 'this->value' is the member, 'value' is the parameter\n        instances++;\n    }\n\n    Counter& add(int n) {\n        value += n;\n        return *this;                // return the invoking object itself -> enables chaining\n    }\n\n    void show() const { cout << \"value = \" << value << endl; }\n\n    static int getInstances() {      // static: no 'this' pointer is passed\n        return instances;\n        // return value;             // ERROR: which object's 'value'? There is no 'this'\n    }\n};\n\nint Counter::instances = 0;\n\nint main() {\n    Counter c(10);\n    c.add(5).add(20);                // chained calls on the same object\n    c.show();                        // value = 35\n    cout << Counter::getInstances() << endl;   // 1  (called without any object)\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Output",
      "code": "value = 35\n1"
    },
    {
      "type": "p",
      "text": "Why a static member function cannot access non-static data members: non-static data members exist separately inside each object, and a normal member function reaches them through the this pointer. A static member function is not called on an object, so it receives no this pointer, and there may not even be any object in existence when it is called. It therefore has no way of knowing whose value is meant, so the compiler rejects the access. Static data members are safe to use because there is exactly one copy, independent of any object."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Write a C++ class Account with a private balance and public deposit() and withdraw() functions (with validation). Use static members to track the total number of accounts and the total money held. Demonstrate the class in main()."
    },
    {
      "type": "code-block",
      "label": "Account with Static Members: Total Accounts and Total Money",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Account {\nprivate:\n    double balance;                  // hidden: changed only through deposit()/withdraw()\n    static int totalAccounts;        // shared: number of Account objects alive\n    static double totalMoney;        // shared: money held across all accounts\n\npublic:\n    Account(double initial = 0.0) {\n        balance = (initial > 0) ? initial : 0.0;   // validation: no negative opening balance\n        totalAccounts++;\n        totalMoney += balance;\n    }\n\n    // Copying would bypass the counters, so it is disabled\n    Account(const Account&) = delete;\n    Account& operator=(const Account&) = delete;\n\n    ~Account() {\n        totalAccounts--;\n        totalMoney -= balance;\n    }\n\n    bool deposit(double amount) {\n        if (amount <= 0) {\n            cout << \"Invalid deposit amount.\" << endl;\n            return false;\n        }\n        balance += amount;\n        totalMoney += amount;\n        return true;\n    }\n\n    bool withdraw(double amount) {\n        if (amount <= 0) {\n            cout << \"Invalid withdrawal amount.\" << endl;\n            return false;\n        }\n        if (amount > balance) {\n            cout << \"Insufficient funds.\" << endl;\n            return false;\n        }\n        balance -= amount;\n        totalMoney -= amount;\n        return true;\n    }\n\n    double getBalance() const { return balance; }\n\n    static int getTotalAccounts() { return totalAccounts; }\n    static double getTotalMoney() { return totalMoney; }\n};\n\nint Account::totalAccounts = 0;\ndouble Account::totalMoney = 0.0;\n\nint main() {\n    Account a1(5000);\n    Account a2(2000);\n    cout << \"Accounts: \" << Account::getTotalAccounts()\n         << \", Total money: \" << Account::getTotalMoney() << endl;\n\n    a1.deposit(1500);\n    a2.withdraw(500);\n    a2.withdraw(9999);               // rejected: insufficient funds\n    a1.deposit(-50);                 // rejected: invalid amount\n    cout << \"a1: \" << a1.getBalance() << \", a2: \" << a2.getBalance() << endl;\n    cout << \"Accounts: \" << Account::getTotalAccounts()\n         << \", Total money: \" << Account::getTotalMoney() << endl;\n\n    {\n        Account a3(1000);\n        cout << \"Inside block -> Accounts: \" << Account::getTotalAccounts()\n             << \", Total money: \" << Account::getTotalMoney() << endl;\n    }   // a3 destroyed here\n\n    cout << \"After block  -> Accounts: \" << Account::getTotalAccounts()\n         << \", Total money: \" << Account::getTotalMoney() << endl;\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Output",
      "code": "Accounts: 2, Total money: 7000\nInsufficient funds.\nInvalid deposit amount.\na1: 6500, a2: 1500\nAccounts: 2, Total money: 8000\nInside block -> Accounts: 3, Total money: 9000\nAfter block  -> Accounts: 2, Total money: 8000"
    },
    {
      "type": "p",
      "text": "Design points: balance is private, so every change passes through deposit() or withdraw(), where the amount is validated. totalAccounts and totalMoney are static, so there is one shared copy for all Account objects; they are updated in the constructor, destructor, and every successful deposit or withdrawal. The copy constructor is deleted because a copied Account would be destroyed without ever having been counted, which would corrupt the totals."
    },
    {
      "type": "h2",
      "text": "Instances"
    },
    {
      "type": "p",
      "text": "An instance is simply another word for 'object' — a specific realization of a class, with its own memory for non-static attributes. 'Instantiation' is the act of creating an object from a class (e.g., Student s1(\"Riya\"); instantiates the Student class)."
    },
    {
      "type": "h2",
      "text": "Message Passing"
    },
    {
      "type": "p",
      "text": "Objects communicate by calling each other's public member functions — this is called message passing. When object A calls a method on object B, A is effectively 'sending a message' to B, and B responds by executing that method and optionally returning a value."
    },
    {
      "type": "callout",
      "icon": "🗣️",
      "text": "Real-life analogy: message passing is like a customer (one object) calling a waiter (another object) by saying 'bring me water' (calling a public method). The customer doesn't know how the waiter gets the water — only that the request is made and a response comes back."
    },
    {
      "type": "code-block",
      "label": "Message Passing Between Objects",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Waiter {\npublic:\n    void bringWater() {\n        cout << \"Waiter: Bringing water right away!\" << endl;\n    }\n};\n\nclass Customer {\nprivate:\n    Waiter waiter;   // Customer object 'knows about' a Waiter object\n\npublic:\n    void orderWater() {\n        cout << \"Customer: Excuse me, water please.\" << endl;\n        waiter.bringWater();   // MESSAGE PASSED from Customer object to Waiter object\n    }\n};\n\nint main() {\n    Customer c;\n    c.orderWater();   // triggers message passing internally\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Construction and Destruction of Objects"
    },
    {
      "type": "p",
      "text": "A constructor is a special member function, with the same name as the class, that runs automatically when an object is created — used to initialize attributes. A destructor is a special member function, prefixed with ~, that runs automatically when an object is destroyed — used to release resources."
    },
    {
      "type": "table",
      "headers": ["Constructor Type", "Description", "Example Declaration"],
      "rows": [
        ["Default Constructor", "Takes no parameters; used when no initial values are supplied", "Student()"],
        ["Parameterized Constructor", "Takes arguments to initialize attributes with specific values", "Student(string n, int m)"],
        ["Copy Constructor", "Creates a new object as a copy of an existing object", "Student(const Student &s)"],
        ["Destructor", "Runs automatically when the object goes out of scope or is deleted; no parameters, no return type, only one per class", "~Student()"]
      ]
    },
    {
      "type": "callout",
      "icon": "🏗️",
      "text": "Real-life analogy: a constructor is like the construction of a building — foundation laid, walls built, wiring done, ready to use — all set up automatically the moment the building (object) is created. A destructor is the demolition crew — when the building is no longer needed, it's automatically cleared away and any resources (like connected utilities) are released."
    },
    {
      "type": "code-block",
      "label": "Constructors and Destructor Lifecycle",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    int marks;\n\npublic:\n    // Default constructor\n    Student() {\n        name = \"Unknown\";\n        marks = 0;\n        cout << \"Default constructor called for \" << name << endl;\n    }\n\n    // Parameterized constructor\n    Student(string n, int m) {\n        name = n;\n        marks = m;\n        cout << \"Parameterized constructor called for \" << name << endl;\n    }\n\n    // Copy constructor\n    Student(const Student &s) {\n        name = s.name + \" (copy)\";\n        marks = s.marks;\n        cout << \"Copy constructor called for \" << name << endl;\n    }\n\n    // Destructor\n    ~Student() {\n        cout << \"Destructor called for \" << name << endl;\n    }\n\n    void display() {\n        cout << name << \" scored \" << marks << endl;\n    }\n};\n\nint main() {\n    Student s1;                     // default constructor\n    Student s2(\"Riya\", 85);          // parameterized constructor\n    Student s3 = s2;                 // copy constructor\n\n    s1.display();\n    s2.display();\n    s3.display();\n\n    return 0;\n    // destructors for s3, s2, s1 called automatically here, in REVERSE order of creation\n}"
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Write a class Student with a parameterized constructor that uses a member initializer list. Create an array of 3 Student objects, plus one object created dynamically with new, and free it with delete."
    },
    {
      "type": "code-block",
      "label": "Student: Initializer List, Array of Objects, new and delete",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    int marks;\n\npublic:\n    // Member initializer list: name and marks are initialized directly\n    Student(string n, int m) : name(n), marks(m) {\n        cout << \"Constructed: \" << name << endl;\n    }\n\n    ~Student() {\n        cout << \"Destroyed: \" << name << endl;\n    }\n\n    void display() const {\n        cout << name << \" - \" << marks << \" marks\" << endl;\n    }\n};\n\nint main() {\n    // Array of 3 objects: there is no default constructor, so every element\n    // must be given its constructor arguments explicitly\n    Student batch[3] = {\n        Student(\"Riya\", 85),\n        Student(\"Aman\", 90),\n        Student(\"Zoya\", 78)\n    };\n\n    for (int i = 0; i < 3; i++) {\n        batch[i].display();\n    }\n\n    // One object on the heap\n    Student* p = new Student(\"Karan\", 88);\n    p->display();\n    delete p;                        // destructor runs here; memory returned to the heap\n\n    cout << \"End of main\" << endl;\n    return 0;                        // batch[] destroyed now, in reverse order\n}"
    },
    {
      "type": "code-block",
      "label": "Output",
      "code": "Constructed: Riya\nConstructed: Aman\nConstructed: Zoya\nRiya - 85 marks\nAman - 90 marks\nZoya - 78 marks\nConstructed: Karan\nKaran - 88 marks\nDestroyed: Karan\nEnd of main\nDestroyed: Zoya\nDestroyed: Aman\nDestroyed: Riya"
    },
    {
      "type": "p",
      "text": "Key points: the member initializer list (: name(n), marks(m)) initializes the members directly as the object is built, instead of creating them first and assigning afterwards. It is the only way to initialize const and reference members, and it is more efficient for class-type members. Members are initialized in the order they are declared in the class, not the order written in the list. Because Student has no default constructor, every element of the array must be given its constructor arguments. The object created with new lives on the heap until delete is called, and delete runs its destructor before freeing the memory. The array objects are destroyed automatically when main ends, in reverse order of construction."
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common exam mistake: forgetting that destructors are called in reverse order of construction, and forgetting that a destructor takes no arguments and cannot be overloaded (a class can have only one destructor). Both are frequent 'differentiate' question traps."
    },
    {
      "type": "h2",
      "text": "Data Abstraction and Abstract Classes"
    },
    {
      "type": "p",
      "text": "Data abstraction is the process of representing only the essential features of an object and hiding the background implementation details, so the user works through a simple interface. In C++ it is achieved with classes (a public interface over hidden internals) and, at the design level, with abstract classes. An abstract class has at least one pure virtual function (declared as virtual returnType f() = 0;) and defines a common interface that every concrete derived class must implement."
    },
    {
      "type": "callout",
      "icon": "📝",
      "text": "Exam Question: Define abstraction. Write a C++ program with an abstract class Account (protected balance, pure virtual interest(), non-virtual show(), virtual destructor) and derived classes SavingsAccount (4% interest) and CurrentAccount (0% interest), using override. In main(), create a SavingsAccount of 10000 via an Account*, display its balance and interest, and delete it. Why is Account a(5000); invalid?"
    },
    {
      "type": "code-block",
      "label": "Abstract Class Account with Savings and Current Accounts",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Account {                       // abstract class: has a pure virtual function\nprotected:\n    double balance;\n\npublic:\n    Account(double b) : balance(b) {}\n\n    virtual double interest() const = 0;   // pure virtual: no body here\n\n    void show() const {                    // non-virtual: same for every account type\n        cout << \"Balance: \" << balance << endl;\n        cout << \"Interest: \" << interest() << endl;   // calls the derived version\n    }\n\n    virtual ~Account() {                   // virtual destructor\n        cout << \"Account destroyed\" << endl;\n    }\n};\n\nclass SavingsAccount : public Account {\npublic:\n    SavingsAccount(double b) : Account(b) {}\n\n    double interest() const override { return balance * 0.04; }   // 4%\n\n    ~SavingsAccount() {\n        cout << \"SavingsAccount destroyed\" << endl;\n    }\n};\n\nclass CurrentAccount : public Account {\npublic:\n    CurrentAccount(double b) : Account(b) {}\n\n    double interest() const override { return 0.0; }              // 0%\n};\n\nint main() {\n    Account* acc = new SavingsAccount(10000);   // base pointer, derived object\n    acc->show();\n    delete acc;                                 // virtual destructor -> both destructors run\n\n    // Account a(5000);   // ERROR: cannot instantiate abstract class\n    return 0;\n}"
    },
    {
      "type": "code-block",
      "label": "Output",
      "code": "Balance: 10000\nInterest: 400\nSavingsAccount destroyed\nAccount destroyed"
    },
    {
      "type": "sections-list",
      "items": [
        {
          "title": "Why is Account a(5000); invalid?",
          "desc": "Account contains a pure virtual function, interest(), which has no implementation in Account, so Account is an abstract class and objects of an abstract class cannot be created. The compiler reports: cannot declare variable 'a' to be of abstract type 'Account'. You can still declare pointers and references to Account (as main does), and they can point to objects of concrete derived classes. A derived class becomes concrete only when it overrides every pure virtual function."
        },
        {
          "title": "Why is the destructor virtual?",
          "desc": "main deletes a SavingsAccount through an Account*. With a non-virtual destructor this is undefined behavior and the derived destructor may never run. With a virtual destructor, the output shows SavingsAccount's destructor running first and then Account's."
        },
        {
          "title": "Why override?",
          "desc": "The override keyword makes the compiler check that the function really overrides a base virtual function. A typo in the name or a mismatched signature becomes a compile error instead of a silent new function."
        },
        {
          "title": "Why is show() non-virtual?",
          "desc": "The display logic is identical for every account type, so it is written once in the base class. It calls interest(), which is resolved at run time to the derived version, so show() prints 400 for the SavingsAccount and would print 0 for a CurrentAccount."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Putting It Together: A Fully Encapsulated Class"
    },
    {
      "type": "p",
      "text": "This combines everything from this part: private attributes, public services, a static counter, a parameterized constructor, and a destructor."
    },
    {
      "type": "code-block",
      "label": "Complete Encapsulated Student Class",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    int marks;\n    static int studentCount;\n\npublic:\n    Student(string n, int m) : name(n), marks(m) {\n        studentCount++;\n        cout << name << \" enrolled. Total students: \" << studentCount << endl;\n    }\n\n    ~Student() {\n        studentCount--;\n        cout << name << \" left. Total students: \" << studentCount << endl;\n    }\n\n    // Public services — the only way outside code can read/update state\n    void setMarks(int m) { marks = m; }\n    int getMarks() { return marks; }\n    string getName() { return name; }\n\n    void display() {\n        cout << name << \": \" << marks << \" marks\" << endl;\n    }\n};\n\nint Student::studentCount = 0;\n\nint main() {\n    Student s1(\"Riya\", 85);\n    Student s2(\"Aman\", 90);\n\n    s1.setMarks(88);      // updating state only through a public service\n    s1.display();\n    s2.display();\n\n    return 0;\n}"
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
        "Q1: Differentiate a class and an object with a real-life example.",
        "Q2: Explain the three access modifiers in C++ with an example of each.",
        "Q3: What is a static data member? How is it different from a normal (instance) data member?",
        "Q4: Differentiate a constructor and a destructor (any four points).",
        "Q5: Write a C++ class Book with private attributes title and price, a parameterized constructor, a destructor, and a public method to display the book details. Create two Book objects in main() and display both."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: A class is a blueprint (e.g., the design of a car) that defines attributes and behavior but has no memory allocated for data until used. An object is a concrete instance (e.g., an actual car built from that design) with its own real data. Many objects can be created from one class."
    },
    {
      "type": "p",
      "text": "A2: private — accessible only within the same class (e.g., an account's balance). protected — accessible within the class and any derived class (e.g., a base Vehicle's engine type accessible to a derived Car). public — accessible from anywhere in the program (e.g., a Student's public getName() method)."
    },
    {
      "type": "p",
      "text": "A3: A static data member has exactly one copy shared by all objects of the class, and it exists even before any object is created. A normal (instance) data member has a separate copy for every object created, and only exists once that specific object is created."
    },
    {
      "type": "p",
      "text": "A4: (i) A constructor has the same name as the class; a destructor has the class name prefixed with ~. (ii) A constructor can be overloaded (multiple versions); a destructor cannot be overloaded (only one per class). (iii) A constructor runs when an object is created; a destructor runs when an object is destroyed. (iv) A constructor can take parameters; a destructor never takes parameters."
    },
    {
      "type": "p",
      "text": "A5: See the complete, compilable solution below."
    },
    {
      "type": "code-block",
      "label": "Q5 Solution: Book Class",
      "code": "#include <iostream>\nusing namespace std;\n\nclass Book {\nprivate:\n    string title;\n    double price;\n\npublic:\n    Book(string t, double p) : title(t), price(p) {\n        cout << \"Book created: \" << title << endl;\n    }\n\n    ~Book() {\n        cout << \"Book destroyed: \" << title << endl;\n    }\n\n    void display() {\n        cout << \"Title: \" << title << \", Price: Rs. \" << price << endl;\n    }\n};\n\nint main() {\n    Book b1(\"The C++ Programming Language\", 799.0);\n    Book b2(\"Data Structures Simplified\", 499.0);\n\n    b1.display();\n    b2.display();\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "Encapsulation in C++ is enforced through access modifiers: keep attributes private, expose behavior through public services. Static members give you shared, class-level data and behavior. Instances are just objects created from a class. Message passing is how objects collaborate through public method calls. Constructors and destructors give every object a predictable lifecycle — set up on creation, cleaned up on destruction. Master this and every class you design from here on will be both correct and exam-ready."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: If asked to define encapsulation in one line for an exam — 'Encapsulation is the technique of bundling data and the methods that operate on it within a single unit (class), while restricting direct access to the internal state using access modifiers.' Memorize that sentence. Then move to Part 3."
    }
  ]
};

export default post;
