const post = {
  "slug": "part-5-strings-exceptions-collections",
  "seriesSlug": "oop-cpp-mastery",
  "partNumber": 5,
  "totalParts": 6,
  "title": "Strings, Exception Handling, and Advanced Topics (Part 5)",
  "seriesTitle": "Object-Oriented Programming in C++: The Exam Mastery Series",
  "date": "August 7, 2026",
  "readTime": "30 min read",
  "category": "Object Oriented Programming",
  "categoryColor": "#3b82f6",
  "excerpt": "C++ strings, exception handling with try-catch-throw, introduction to multi-threading, STL data collections, and complete case studies for ATM and Library Management System.",
  "coverEmoji": "🧩",
  "tags": [
    "C++",
    "OOP",
    "STL",
    "Exceptions",
    "University Exam"
  ],
  "content": [
    {
      "type": "intro",
      "text": "Parts 1 through 4 built your OOP foundation. Part 5 is where you apply that foundation to real-world problems. You will learn C++ strings (far more powerful than C-style char arrays), exception handling (making programs robust against failure), a practical introduction to multi-threading, and the STL data collections that every real C++ program uses. Then we tie everything together with two complete case studies — ATM and Library Management — designed exactly like 10-15 mark exam programming questions."
    },
    {
      "type": "callout",
      "icon": "📌",
      "text": "Exam pattern to expect: 'Explain exception handling mechanism in C++' (5 marks), 'What is STL? Explain vector and map' (5-7 marks), 'Write a C++ program for ATM withdrawal with exception handling' (10-15 marks), and a case-study-based design question asking you to identify classes and relationships for a given system (10 marks)."
    },
    {
      "type": "h2",
      "text": "C++ Strings"
    },
    {
      "type": "p",
      "text": "The C++ string class (from <string>) is a dynamic, safe, and feature-rich replacement for C-style char arrays. It automatically manages memory, supports direct concatenation with +, and provides a rich set of member functions for searching, substring extraction, and modification."
    },
    {
      "type": "checklist",
      "items": [
        "Declaration: string s = \"Hello\"; or string s(\"Hello\");",
        "Concatenation: s1 + s2 or s1.append(s2)",
        "Length: s.length() or s.size()",
        "Access: s[i] or s.at(i) (at() does bounds checking)",
        "Substring: s.substr(startIndex, length)",
        "Find: s.find(\"text\") returns string::npos if not found",
        "Comparison: s1 == s2, s1.compare(s2)",
        "Input: getline(cin, s) reads an entire line including spaces"
      ]
    },
    {
      "type": "code-block",
      "label": "String Operations in C++",
      "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s1 = \"Object\";\n    string s2 = \"Oriented\";\n\n    // Concatenation\n    string s3 = s1 + \" \" + s2;\n    cout << \"Concatenated: \" << s3 << endl;\n\n    // Length\n    cout << \"Length: \" << s3.length() << endl;\n\n    // Substring\n    cout << \"Substring (0,6): \" << s3.substr(0, 6) << endl;\n\n    // Find\n    size_t pos = s3.find(\"Oriented\");\n    if (pos != string::npos) {\n        cout << \"'Oriented' found at index: \" << pos << endl;\n    }\n\n    // Replace\n    s3.replace(7, 8, \"Programming\");\n    cout << \"After replace: \" << s3 << endl;\n\n    // Comparison\n    string s4 = \"Object\";\n    if (s1 == s4) {\n        cout << \"s1 and s4 are equal\" << endl;\n    }\n\n    // Reading a full line\n    string sentence;\n    cout << \"Enter a sentence: \";\n    cin.ignore();\n    getline(cin, sentence);\n    cout << \"You entered: \" << sentence << endl;\n\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common exam mistake: using s.find(\"text\") == -1 to check failure. The correct check is s.find(\"text\") == string::npos. Also, using cin >> s after cin >> number without cin.ignore() causes the newline to be read as the string — always use cin.ignore() before getline after a formatted extraction."
    },
    {
      "type": "h2",
      "text": "Exception Handling"
    },
    {
      "type": "p",
      "text": "Exception handling is the mechanism for dealing with runtime errors gracefully instead of crashing. C++ provides three keywords: try (wraps code that might throw), throw (raises an exception), and catch (handles the exception). When an exception is thrown, control jumps immediately to the matching catch block."
    },
    {
      "type": "callout",
      "icon": "🛡️",
      "text": "Real-life analogy: exception handling is like a fire safety drill. The try block is your normal work day. The throw is the fire alarm going off. The catch block is the evacuation procedure — it doesn't prevent the fire, but it ensures everyone gets out safely and the building doesn't collapse."
    },
    {
      "type": "code-block",
      "label": "Basic try-catch-throw",
      "code": "#include <iostream>\nusing namespace std;\n\ndouble divide(double a, double b) {\n    if (b == 0) {\n        throw \"Division by zero is not allowed!\";\n    }\n    return a / b;\n}\n\nint main() {\n    double x, y;\n    cout << \"Enter numerator: \";\n    cin >> x;\n    cout << \"Enter denominator: \";\n    cin >> y;\n\n    try {\n        double result = divide(x, y);\n        cout << \"Result: \" << result << endl;\n    }\n    catch (const char *msg) {\n        cout << \"Error: \" << msg << endl;\n    }\n\n    cout << \"Program continues normally...\" << endl;\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Multiple Catch Blocks"
    },
    {
      "type": "p",
      "text": "You can have multiple catch blocks to handle different types of exceptions. The catch blocks are checked in order — the first matching catch wins. A catch-all block catch(...) handles any exception type and is typically placed last."
    },
    {
      "type": "code-block",
      "label": "Multiple Catch and Catch-All",
      "code": "#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\nvoid process(int code) {\n    if (code == 1) {\n        throw 404;\n    } else if (code == 2) {\n        throw 3.14;\n    } else if (code == 3) {\n        throw runtime_error(\"Runtime error occurred\");\n    } else {\n        throw \"Unknown error\";\n    }\n}\n\nint main() {\n    int code;\n    cout << \"Enter error code (1-4): \";\n    cin >> code;\n\n    try {\n        process(code);\n    }\n    catch (int e) {\n        cout << \"Caught integer exception: \" << e << endl;\n    }\n    catch (double e) {\n        cout << \"Caught double exception: \" << e << endl;\n    }\n    catch (runtime_error &e) {\n        cout << \"Caught runtime_error: \" << e.what() << endl;\n    }\n    catch (...) {\n        cout << \"Caught unknown exception type\" << endl;\n    }\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Standard Exception Classes"
    },
    {
      "type": "p",
      "text": "C++ provides a hierarchy of standard exception classes in <stdexcept>. The base class is std::exception, with derived classes like logic_error, runtime_error, out_of_range, and bad_alloc. Using standard exceptions makes your code more readable and interoperable."
    },
    {
      "type": "table",
      "headers": [
        "Exception Class",
        "Header",
        "When Thrown"
      ],
      "rows": [
        [
          "exception",
          "<exception>",
          "Base class for all standard exceptions"
        ],
        [
          "runtime_error",
          "<stdexcept>",
          "Errors detectable only at runtime"
        ],
        [
          "logic_error",
          "<stdexcept>",
          "Errors due to program logic (e.g., invalid argument)"
        ],
        [
          "out_of_range",
          "<stdexcept>",
          "Access beyond valid range (e.g., vector::at)"
        ],
        [
          "bad_alloc",
          "<new>",
          "Memory allocation failure"
        ],
        [
          "invalid_argument",
          "<stdexcept>",
          "Invalid argument passed to function"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "Custom Exception Class",
      "code": "#include <iostream>\n#include <exception>\nusing namespace std;\n\n// Custom exception inheriting from standard exception\nclass InsufficientFundsException : public exception {\nprivate:\n    string msg;\npublic:\n    InsufficientFundsException(string m) : msg(m) {}\n    const char* what() const noexcept override {\n        return msg.c_str();\n    }\n};\n\nclass BankAccount {\nprivate:\n    double balance;\npublic:\n    BankAccount(double b) : balance(b) {}\n\n    void withdraw(double amount) {\n        if (amount > balance) {\n            throw InsufficientFundsException(\n                \"Insufficient funds. Available: \" + to_string(balance)\n            );\n        }\n        balance -= amount;\n    }\n\n    double getBalance() { return balance; }\n};\n\nint main() {\n    BankAccount acc(1000.0);\n    try {\n        acc.withdraw(1500.0);\n    }\n    catch (InsufficientFundsException &e) {\n        cout << \"Transaction failed: \" << e.what() << endl;\n    }\n    cout << \"Current balance: \" << acc.getBalance() << endl;\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Introduction to Multi-Threading"
    },
    {
      "type": "p",
      "text": "Multi-threading allows a program to execute multiple paths of execution concurrently. C++11 introduced the <thread> library, making threading portable and standard. A thread is created by passing a function (or callable object) to a std::thread object. The main thread must call join() to wait for the spawned thread to finish, or detach() to let it run independently."
    },
    {
      "type": "callout",
      "icon": "🧵",
      "text": "Real-life analogy: multi-threading is like a restaurant kitchen with multiple chefs working simultaneously. One chef prepares the appetizer, another the main course, another the dessert. They share the kitchen (memory space) but work on different tasks. If they both try to use the same chopping board at the same time (shared resource), they need a mutex (lock) to coordinate."
    },
    {
      "type": "code-block",
      "label": "Basic Thread Creation",
      "code": "#include <iostream>\n#include <thread>\nusing namespace std;\n\nvoid printNumbers(int n) {\n    for (int i = 1; i <= n; i++) {\n        cout << \"Thread: \" << i << endl;\n    }\n}\n\nvoid printLetters(int n) {\n    for (int i = 0; i < n; i++) {\n        cout << \"Thread: \" << char('A' + i) << endl;\n    }\n}\n\nint main() {\n    // Create two threads\n    thread t1(printNumbers, 5);\n    thread t2(printLetters, 5);\n\n    // Wait for both threads to complete\n    t1.join();\n    t2.join();\n\n    cout << \"Both threads finished.\" << endl;\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Mutex and Synchronization"
    },
    {
      "type": "p",
      "text": "When multiple threads access shared data, race conditions can occur. A mutex (mutual exclusion) is a synchronization primitive that allows only one thread to access a critical section at a time. C++ provides std::mutex and std::lock_guard for safe locking."
    },
    {
      "type": "code-block",
      "label": "Mutex: Safe Shared Counter",
      "code": "#include <iostream>\n#include <thread>\n#include <mutex>\nusing namespace std;\n\nmutex mtx;\nint counter = 0;\n\nvoid increment(int times) {\n    for (int i = 0; i < times; i++) {\n        lock_guard<mutex> lock(mtx);  // locks mutex, auto-unlocks when out of scope\n        counter++;\n        cout << \"Counter: \" << counter << endl;\n    }\n}\n\nint main() {\n    thread t1(increment, 5);\n    thread t2(increment, 5);\n\n    t1.join();\n    t2.join();\n\n    cout << \"Final counter: \" << counter << endl;\n    return 0;\n}"
    },
    {
      "type": "callout",
      "icon": "⚠️",
      "text": "Common exam mistake: forgetting to join() or detach() a thread before it goes out of scope. This causes std::terminate to be called and crashes the program. Always ensure every thread is either joined or detached. Also, prefer lock_guard over manual lock()/unlock() — it prevents deadlocks if an exception is thrown inside the critical section."
    },
    {
      "type": "h2",
      "text": "Data Collections (STL Containers)"
    },
    {
      "type": "p",
      "text": "The Standard Template Library (STL) provides ready-made container classes for storing and managing collections of data. For exams, focus on vector (dynamic array), map (key-value pairs), and set (unique sorted elements). These are the three most commonly asked containers."
    },
    {
      "type": "table",
      "headers": [
        "Container",
        "Description",
        "Common Operations"
      ],
      "rows": [
        [
          "vector",
          "Dynamic array; contiguous memory; fast random access",
          "push_back(), pop_back(), size(), [], at(), begin(), end()"
        ],
        [
          "map",
          "Sorted key-value pairs; unique keys; implemented as red-black tree",
          "insert(), find(), [], size(), begin(), end()"
        ],
        [
          "set",
          "Sorted unique elements; no duplicates",
          "insert(), erase(), find(), size(), count()"
        ]
      ]
    },
    {
      "type": "code-block",
      "label": "STL: vector, map, and set",
      "code": "#include <iostream>\n#include <vector>\n#include <map>\n#include <set>\nusing namespace std;\n\nint main() {\n    // --- vector ---\n    vector<int> nums;\n    nums.push_back(10);\n    nums.push_back(20);\n    nums.push_back(30);\n\n    cout << \"Vector: \";\n    for (int n : nums) cout << n << \" \";\n    cout << endl;\n\n    // --- map ---\n    map<string, int> scores;\n    scores[\"Riya\"] = 85;\n    scores[\"Aman\"] = 92;\n    scores[\"Zoya\"] = 78;\n\n    cout << \"Map (sorted by key):\" << endl;\n    for (auto &pair : scores) {\n        cout << \"  \" << pair.first << \" => \" << pair.second << endl;\n    }\n\n    // --- set ---\n    set<string> subjects;\n    subjects.insert(\"Math\");\n    subjects.insert(\"Physics\");\n    subjects.insert(\"Math\");  // duplicate ignored\n\n    cout << \"Set (unique, sorted):\" << endl;\n    for (auto &s : subjects) {\n        cout << \"  \" << s << endl;\n    }\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Case Study 1: ATM System"
    },
    {
      "type": "p",
      "text": "This case study demonstrates class identification, encapsulation, inheritance, exception handling, and association — exactly what a 10-15 mark exam question expects. The system models an ATM with accounts, cards, and transactions."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Identify classes",
          "text": "ATM, BankAccount, Card, Transaction, Customer"
        },
        {
          "num": "2",
          "title": "Identify relationships",
          "text": "Customer 'has-a' Card (composition). Card 'is associated with' BankAccount (association). ATM 'has-a' collection of BankAccounts (aggregation). Transaction records each operation."
        },
        {
          "num": "3",
          "title": "Identify attributes and methods",
          "text": "BankAccount: balance, accountNumber; methods: deposit(), withdraw(), getBalance(). Card: cardNumber, PIN. ATM: validateCard(), withdrawCash(), checkBalance()."
        },
        {
          "num": "4",
          "title": "Add exception handling",
          "text": "InsufficientFundsException, InvalidPINException for robust error handling."
        }
      ]
    },
    {
      "type": "code-block",
      "label": "ATM System: Complete Design",
      "code": "#include <iostream>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\n// Custom exceptions\nclass InvalidPINException : public exception {\n    const char* what() const noexcept override {\n        return \"Invalid PIN entered\";\n    }\n};\n\nclass InsufficientFundsException : public exception {\n    const char* what() const noexcept override {\n        return \"Insufficient funds in account\";\n    }\n};\n\nclass BankAccount {\nprivate:\n    string accountNumber;\n    double balance;\npublic:\n    BankAccount(string acc, double bal) : accountNumber(acc), balance(bal) {}\n\n    void deposit(double amount) {\n        if (amount <= 0) throw invalid_argument(\"Deposit amount must be positive\");\n        balance += amount;\n    }\n\n    void withdraw(double amount) {\n        if (amount > balance) throw InsufficientFundsException();\n        balance -= amount;\n    }\n\n    double getBalance() { return balance; }\n    string getAccountNumber() { return accountNumber; }\n};\n\nclass Card {\nprivate:\n    string cardNumber;\n    int pin;\n    BankAccount *account;  // Association: Card knows about an account\npublic:\n    Card(string c, int p, BankAccount *acc)\n        : cardNumber(c), pin(p), account(acc) {}\n\n    bool validatePIN(int enteredPIN) {\n        return pin == enteredPIN;\n    }\n\n    BankAccount* getAccount() { return account; }\n    string getCardNumber() { return cardNumber; }\n};\n\nclass ATM {\nprivate:\n    Card *insertedCard;\npublic:\n    ATM() : insertedCard(nullptr) {}\n\n    void insertCard(Card *c) {\n        insertedCard = c;\n        cout << \"Card inserted: \" << c->getCardNumber() << endl;\n    }\n\n    void enterPIN(int pin) {\n        if (!insertedCard) throw runtime_error(\"No card inserted\");\n        if (!insertedCard->validatePIN(pin)) {\n            throw InvalidPINException();\n        }\n        cout << \"PIN validated successfully.\" << endl;\n    }\n\n    void withdraw(double amount) {\n        if (!insertedCard) throw runtime_error(\"No card inserted\");\n        insertedCard->getAccount()->withdraw(amount);\n        cout << \"Withdrawal successful. Please collect cash.\" << endl;\n    }\n\n    void checkBalance() {\n        if (!insertedCard) throw runtime_error(\"No card inserted\");\n        cout << \"Current balance: Rs.\"\n             << insertedCard->getAccount()->getBalance() << endl;\n    }\n\n    void ejectCard() {\n        insertedCard = nullptr;\n        cout << \"Card ejected.\" << endl;\n    }\n};\n\nint main() {\n    // Setup accounts and cards\n    BankAccount acc1(\"ACC001\", 5000.0);\n    Card card1(\"CARD1234\", 1234, &acc1);\n\n    ATM atm;\n    try {\n        atm.insertCard(&card1);\n        atm.enterPIN(1234);\n        atm.checkBalance();\n        atm.withdraw(2000.0);\n        atm.checkBalance();\n        atm.ejectCard();\n    }\n    catch (exception &e) {\n        cout << \"ATM Error: \" << e.what() << endl;\n    }\n\n    return 0;\n}"
    },
    {
      "type": "h2",
      "text": "Case Study 2: Library Management System"
    },
    {
      "type": "p",
      "text": "This case study demonstrates inheritance (different member types), association (books and members), and aggregation (library contains books and members). It is a classic exam design question that tests your ability to model a real system with OOP principles."
    },
    {
      "type": "steps",
      "items": [
        {
          "num": "1",
          "title": "Identify classes",
          "text": "Library, Book, Member, Librarian, Transaction"
        },
        {
          "num": "2",
          "title": "Identify inheritance",
          "text": "Member is base; StudentMember and FacultyMember are derived (hierarchical inheritance). Librarian could also inherit from Member or be a separate class with association."
        },
        {
          "num": "3",
          "title": "Identify relationships",
          "text": "Library aggregates Books and Members. Member associates with Book via Transaction. Librarian manages Library operations."
        },
        {
          "num": "4",
          "title": "Identify key methods",
          "text": "Library: addBook(), registerMember(), issueBook(), returnBook(). Book: display(), isAvailable(). Member: borrowBook(), returnBook(), getName()."
        }
      ]
    },
    {
      "type": "code-block",
      "label": "Library Management System: Complete Design",
      "code": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Book {\nprivate:\n    string isbn;\n    string title;\n    string author;\n    bool available;\npublic:\n    Book(string i, string t, string a)\n        : isbn(i), title(t), author(a), available(true) {}\n\n    string getISBN() { return isbn; }\n    string getTitle() { return title; }\n    bool isAvailable() { return available; }\n\n    void issue() {\n        if (!available) throw runtime_error(\"Book already issued\");\n        available = false;\n    }\n\n    void returnBook() { available = true; }\n\n    void display() {\n        cout << \"  [\" << isbn << \"] \" << title\n             << \" by \" << author\n             << \" (\" << (available ? \"Available\" : \"Issued\") << \")\" << endl;\n    }\n};\n\nclass Member {\nprotected:\n    string memberID;\n    string name;\n    vector<Book*> borrowedBooks;\npublic:\n    Member(string id, string n) : memberID(id), name(n) {}\n\n    virtual string getType() { return \"Member\"; }\n    string getName() { return name; }\n\n    void borrowBook(Book *b) {\n        if (borrowedBooks.size() >= getMaxBooks()) {\n            throw runtime_error(\"Borrowing limit reached\");\n        }\n        b->issue();\n        borrowedBooks.push_back(b);\n        cout << name << \" borrowed: \" << b->getTitle() << endl;\n    }\n\n    void returnBook(Book *b) {\n        for (auto it = borrowedBooks.begin(); it != borrowedBooks.end(); ++it) {\n            if (*it == b) {\n                b->returnBook();\n                borrowedBooks.erase(it);\n                cout << name << \" returned: \" << b->getTitle() << endl;\n                return;\n            }\n        }\n        throw runtime_error(\"Book not found in borrowed list\");\n    }\n\n    virtual int getMaxBooks() { return 3; }\n\n    void displayBorrowed() {\n        cout << name << \"'s borrowed books:\" << endl;\n        for (Book *b : borrowedBooks) {\n            b->display();\n        }\n    }\n};\n\n// Hierarchical inheritance\nclass StudentMember : public Member {\npublic:\n    StudentMember(string id, string n) : Member(id, n) {}\n    string getType() override { return \"Student\"; }\n    int getMaxBooks() override { return 3; }\n};\n\nclass FacultyMember : public Member {\npublic:\n    FacultyMember(string id, string n) : Member(id, n) {}\n    string getType() override { return \"Faculty\"; }\n    int getMaxBooks() override { return 10; }\n};\n\nclass Library {\nprivate:\n    string name;\n    vector<Book*> books;\n    vector<Member*> members;\npublic:\n    Library(string n) : name(n) {}\n\n    void addBook(Book *b) {\n        books.push_back(b);\n    }\n\n    void registerMember(Member *m) {\n        members.push_back(m);\n    }\n\n    void displayBooks() {\n        cout << \"\\n=== \" << name << \" Catalog ===\" << endl;\n        for (Book *b : books) b->display();\n    }\n\n    void displayMembers() {\n        cout << \"\\n=== Members ===\" << endl;\n        for (Member *m : members) {\n            cout << \"  \" << m->getType() << \": \" << m->getName() << endl;\n        }\n    }\n};\n\nint main() {\n    Library lib(\"City Central Library\");\n\n    // Create books\n    Book b1(\"ISBN001\", \"The C++ Programming Language\", \"Bjarne Stroustrup\");\n    Book b2(\"ISBN002\", \"Clean Code\", \"Robert Martin\");\n    Book b3(\"ISBN003\", \"Design Patterns\", \"Gang of Four\");\n\n    lib.addBook(&b1);\n    lib.addBook(&b2);\n    lib.addBook(&b3);\n\n    // Create members\n    StudentMember s1(\"S101\", \"Riya\");\n    FacultyMember f1(\"F201\", \"Dr. Sharma\");\n\n    lib.registerMember(&s1);\n    lib.registerMember(&f1);\n\n    lib.displayBooks();\n    lib.displayMembers();\n\n    // Issue and return\n    try {\n        s1.borrowBook(&b1);\n        s1.borrowBook(&b2);\n        f1.borrowBook(&b3);\n\n        cout << \"\\n--- After borrowing ---\" << endl;\n        s1.displayBorrowed();\n        f1.displayBorrowed();\n\n        s1.returnBook(&b1);\n        lib.displayBooks();\n    }\n    catch (exception &e) {\n        cout << \"Library Error: \" << e.what() << endl;\n    }\n\n    return 0;\n}"
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
        "Q1: Differentiate C-style strings and C++ string class (any four points).",
        "Q2: Explain the try-catch-throw mechanism with a minimal example.",
        "Q3: What is a thread? Explain join() and detach() with example.",
        "Q4: Explain vector and map with a small code example for each.",
        "Q5: Design a class diagram (in text) for a Hospital Management System showing at least 4 classes, 2 types of inheritance, and 2 relationships (association/aggregation)."
      ]
    },
    {
      "type": "h2",
      "text": "Answers & Explanations"
    },
    {
      "type": "p",
      "text": "A1: (i) C-style strings are char arrays with manual memory management; C++ strings manage memory automatically. (ii) C-style strings use strcpy, strcat; C++ strings use +, append, and member functions. (iii) C-style strings are prone to buffer overflow; C++ strings grow dynamically. (iv) C-style strings require null terminator; C++ strings store length internally."
    },
    {
      "type": "p",
      "text": "A2: try wraps code that might throw an exception. throw raises an exception object when an error condition is detected. catch intercepts the thrown object and handles the error. Execution resumes after the catch block, so the program doesn't crash. Multiple catch blocks can handle different exception types."
    },
    {
      "type": "p",
      "text": "A3: A thread is an independent path of execution within a program. join() blocks the calling thread until the spawned thread completes — use it when you need the result or must wait. detach() allows the thread to run independently; the main thread doesn't wait for it. Every std::thread must be joined or detached before destruction."
    },
    {
      "type": "p",
      "text": "A4: vector is a dynamic array that grows automatically. It supports push_back(), pop_back(), random access with [], and iteration. map stores sorted key-value pairs with unique keys, implemented as a balanced tree. It supports insertion with [], lookup with find(), and ordered iteration. See the code examples in the main content above."
    },
    {
      "type": "p",
      "text": "A5: Classes: Person (base), Doctor (inherits Person), Patient (inherits Person), Appointment, Department. Inheritance: Doctor is-a Person; Patient is-a Person (hierarchical). Association: Doctor has Appointment with Patient. Aggregation: Department has Doctors (doctors exist outside the department). Composition: Patient has MedicalRecord (record dies with patient)."
    },
    {
      "type": "h2",
      "text": "Summary and Core Takeaway"
    },
    {
      "type": "p",
      "text": "C++ strings replace fragile char arrays with safe, dynamic, feature-rich objects. Exception handling replaces crash-prone error codes with structured try-catch-throw blocks that keep programs robust. Multi-threading lets you execute work in parallel, but requires mutexes to protect shared data. STL containers — vector, map, set — give you production-grade data structures without writing them from scratch. The ATM and Library case studies show how every concept from Parts 1-4 comes together in a real design: encapsulation, inheritance, polymorphism, association, aggregation, and exception handling."
    },
    {
      "type": "callout",
      "icon": "🎯",
      "text": "The Bottom Line: If asked to define exception handling in one line for an exam — 'Exception handling is a mechanism that separates error-detection code from error-handling code using try, throw, and catch, allowing a program to recover gracefully from runtime errors instead of terminating abruptly.' Memorize that sentence. Then move to Part 6 for previous year papers."
    }
  ]
};

export default post;
