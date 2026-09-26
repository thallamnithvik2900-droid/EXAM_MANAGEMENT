const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing tables in reverse dependency order
  await prisma.attendance.deleteMany();
  await prisma.seatAllocation.deleteMany();
  await prisma.invigilatorAssignment.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attemptAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.department.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPass = await bcrypt.hash("Admin@123", 10);
  const hashedFacultyPass = await bcrypt.hash("Faculty@123", 10);
  const hashedInvigPass = await bcrypt.hash("Invigilator@123", 10);
  const hashedStudentPass = await bcrypt.hash("Student@123", 10);

  // 1. Create Departments
  const deptCSE = await prisma.department.create({
    data: { name: "Department of Computer Science & Engineering", code: "CSE" },
  });
  const deptMNC = await prisma.department.create({
    data: { name: "Department of Mathematics & Computing", code: "MNC" },
  });

  // 2. Create Subjects
  const subJava = await prisma.subject.create({
    data: {
      name: "Java Programming",
      code: "CS301",
      departmentId: deptCSE.id,
      credits: 4,
      semester: 4,
    },
  });

  const subDBMS = await prisma.subject.create({
    data: {
      name: "Database Management Systems",
      code: "CS302",
      departmentId: deptCSE.id,
      credits: 4,
      semester: 4,
    },
  });

  const subMath = await prisma.subject.create({
    data: {
      name: "Discrete Mathematics",
      code: "MA201",
      departmentId: deptMNC.id,
      credits: 3,
      semester: 3,
    },
  });

  // 3. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@exam.edu",
      passwordHash: hashedAdminPass,
      name: "Dr. Vikram Seth (Dean / Admin)",
      role: "ADMIN",
      phone: "+91 98765 43210",
    },
  });

  // 4. Create Faculty Users
  const facultyUser1 = await prisma.user.create({
    data: {
      email: "prof.sharma@exam.edu",
      passwordHash: hashedFacultyPass,
      name: "Prof. Rajesh Sharma",
      role: "FACULTY",
      phone: "+91 98765 11111",
    },
  });
  const fac1 = await prisma.faculty.create({
    data: {
      userId: facultyUser1.id,
      employeeId: "FAC-CSE-001",
      designation: "Senior Professor",
      departmentId: deptCSE.id,
    },
  });

  const facultyUser2 = await prisma.user.create({
    data: {
      email: "dr.patel@exam.edu",
      passwordHash: hashedFacultyPass,
      name: "Dr. Ananya Patel",
      role: "FACULTY",
      phone: "+91 98765 22222",
    },
  });
  const fac2 = await prisma.faculty.create({
    data: {
      userId: facultyUser2.id,
      employeeId: "FAC-CSE-002",
      designation: "Associate Professor",
      departmentId: deptCSE.id,
    },
  });

  // 5. Create Invigilator User
  const invigUser = await prisma.user.create({
    data: {
      email: "invigilator.rao@exam.edu",
      passwordHash: hashedInvigPass,
      name: "Suresh Rao (Chief Invigilator)",
      role: "INVIGILATOR",
      phone: "+91 98765 33333",
    },
  });
  const invigFac = await prisma.faculty.create({
    data: {
      userId: invigUser.id,
      employeeId: "INV-EXAM-001",
      designation: "Superintendent of Examinations",
      departmentId: deptCSE.id,
    },
  });

  // 6. Create Students
  const studentData = [
    { email: "student1@exam.edu", name: "Rahul Verma", roll: "CS2026-001", reg: "REG2026001" },
    { email: "student2@exam.edu", name: "Priya Sen", roll: "CS2026-002", reg: "REG2026002" },
    { email: "student3@exam.edu", name: "Amit Kumar", roll: "CS2026-003", reg: "REG2026003" },
    { email: "student4@exam.edu", name: "Sneha Reddy", roll: "CS2026-004", reg: "REG2026004" },
    { email: "student5@exam.edu", name: "Karthik Iyer", roll: "CS2026-005", reg: "REG2026005" },
    { email: "student6@exam.edu", name: "Anjali Nair", roll: "CS2026-006", reg: "REG2026006" },
  ];

  const createdStudents = [];
  for (const s of studentData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: hashedStudentPass,
        name: s.name,
        role: "STUDENT",
      },
    });
    const stu = await prisma.student.create({
      data: {
        userId: user.id,
        rollNumber: s.roll,
        registrationNo: s.reg,
        semester: 4,
        departmentId: deptCSE.id,
      },
    });
    createdStudents.push(stu);

    // Initial notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to ExamSecure Portal",
        message: "Your examination portal is activated. Check available online mock assessments.",
        type: "GENERAL",
      },
    });
  }

  // 7. Create Halls
  const hallA = await prisma.hall.create({
    data: {
      hallCode: "HALL-A201",
      name: "Aryabhata Examination Hall",
      building: "Academic Block 1",
      floor: "2nd Floor",
      capacity: 30,
      rows: 5,
      cols: 6,
    },
  });

  const hallB = await prisma.hall.create({
    data: {
      hallCode: "HALL-B104",
      name: "Alan Turing Assessment Hall",
      building: "Computing Center",
      floor: "1st Floor",
      capacity: 40,
      rows: 5,
      cols: 8,
    },
  });

  // 8. Create Question Bank (25+ rich questions)
  const questionsData = [
    // Java Programming
    {
      subjectId: subJava.id,
      topic: "Inheritance",
      chapter: "OOP Fundamentals",
      difficulty: "EASY",
      questionType: "MCQ_SINGLE",
      questionText: "Which keyword is used to inherit a class in Java?",
      optionsJson: JSON.stringify(["implements", "extends", "inherits", "super"]),
      correctAnswer: "extends",
      explanation: "In Java, the 'extends' keyword is used by a child class to inherit fields and methods from a parent superclass.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subJava.id,
      topic: "OOP",
      chapter: "Core Concepts",
      difficulty: "EASY",
      questionType: "TRUE_FALSE",
      questionText: "Java supports multiple inheritance for classes directly through class extension.",
      optionsJson: JSON.stringify(["True", "False"]),
      correctAnswer: "False",
      explanation: "Java does not support multiple inheritance with classes to avoid the Diamond Problem; it supports multiple inheritance through interfaces.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subJava.id,
      topic: "Polymorphism",
      chapter: "OOP Fundamentals",
      difficulty: "MEDIUM",
      questionType: "MCQ_SINGLE",
      questionText: "Which of the following is true regarding method overriding in Java?",
      optionsJson: JSON.stringify([
        "Private methods can be overridden",
        "Static methods can be overridden",
        "Overriding method cannot have more restrictive access specifier than the overridden method",
        "Return type can be changed arbitrarily without covariance"
      ]),
      correctAnswer: "Overriding method cannot have more restrictive access specifier than the overridden method",
      explanation: "An overriding method cannot reduce the visibility of the method in the parent class (e.g., protected cannot become private).",
      marks: 3.0,
      negativeMarks: 1.0,
    },
    {
      subjectId: subJava.id,
      topic: "Collections",
      chapter: "Java Collections Framework",
      difficulty: "MEDIUM",
      questionType: "MCQ_SINGLE",
      questionText: "Which Collection interface allows duplicate elements and maintains insertion order?",
      optionsJson: JSON.stringify(["Set", "List", "Map", "PriorityQueue"]),
      correctAnswer: "List",
      explanation: "A List is an ordered sequence that permits duplicate elements and provides index-based access.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subJava.id,
      topic: "Collections",
      chapter: "Java Collections Framework",
      difficulty: "HARD",
      questionType: "MCQ_MULTIPLE",
      questionText: "Which of the following classes in java.util are thread-safe?",
      optionsJson: JSON.stringify(["Vector", "ArrayList", "ConcurrentHashMap", "Hashtable"]),
      correctAnswer: JSON.stringify(["Vector", "ConcurrentHashMap", "Hashtable"]),
      explanation: "Vector and Hashtable are synchronized legacy collections, and ConcurrentHashMap is designed for high-concurrency thread safety.",
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      subjectId: subJava.id,
      topic: "Exception Handling",
      chapter: "Robust Programming",
      difficulty: "MEDIUM",
      questionType: "MCQ_SINGLE",
      questionText: "Which block will ALWAYS execute in a try-catch construct, regardless of whether an exception is thrown?",
      optionsJson: JSON.stringify(["catch", "finally", "throws", "finalize"]),
      correctAnswer: "finally",
      explanation: "The 'finally' block always executes unless the JVM exits forcefully via System.exit().",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subJava.id,
      topic: "Memory Management",
      chapter: "JVM Internals",
      difficulty: "HARD",
      questionType: "NUMERICAL",
      questionText: "In Java, if an int array is declared as `int[] arr = new int[16];`, how many bytes of primitive data are reserved for the elements on a 32/64-bit JVM? (Enter number of bytes only, 1 int = 4 bytes)",
      optionsJson: null,
      correctAnswer: "64",
      explanation: "16 integers * 4 bytes each = 64 bytes of primitive payload memory.",
      marks: 3.0,
      negativeMarks: 0.0,
    },
    {
      subjectId: subJava.id,
      topic: "Concurrency",
      chapter: "Multithreading",
      difficulty: "MEDIUM",
      questionType: "TRUE_FALSE",
      questionText: "Calling the run() method directly on a Thread object spawns a new concurrent OS thread.",
      optionsJson: JSON.stringify(["True", "False"]),
      correctAnswer: "False",
      explanation: "Calling run() simply executes the method synchronously in the caller thread. You must invoke start() to launch a new thread.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subJava.id,
      topic: "OOP",
      chapter: "Encapsulation",
      difficulty: "EASY",
      questionType: "MCQ_SINGLE",
      questionText: "Which access modifier gives the most restrictive access in Java?",
      optionsJson: JSON.stringify(["public", "protected", "default (package-private)", "private"]),
      correctAnswer: "private",
      explanation: "'private' limits access exclusively to within the same enclosing class definition.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subJava.id,
      topic: "Collections",
      chapter: "Algorithms & Sets",
      difficulty: "MEDIUM",
      questionType: "MCQ_SINGLE",
      questionText: "What is the average time complexity of get(key) and put(key, value) operations in a standard HashMap?",
      optionsJson: JSON.stringify(["O(1)", "O(log n)", "O(n)", "O(n log n)"]),
      correctAnswer: "O(1)",
      explanation: "Under a well-distributed hash function with reasonable load factor, HashMap operations run in O(1) average time.",
      marks: 2.0,
      negativeMarks: 0.5,
    },

    // DBMS Questions
    {
      subjectId: subDBMS.id,
      topic: "SQL Joins",
      chapter: "Relational Algebra & SQL",
      difficulty: "EASY",
      questionType: "MCQ_SINGLE",
      questionText: "Which SQL JOIN returns all rows from the left table, along with matching rows from the right table, or NULL if no match exists?",
      optionsJson: JSON.stringify(["INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN"]),
      correctAnswer: "LEFT OUTER JOIN",
      explanation: "LEFT OUTER JOIN preserves all records from the left side and fills right side missing attributes with NULL.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subDBMS.id,
      topic: "ACID Properties",
      chapter: "Transactions",
      difficulty: "MEDIUM",
      questionType: "MCQ_MULTIPLE",
      questionText: "Which of the following represent components of the ACID property acronym in database management?",
      optionsJson: JSON.stringify(["Atomicity", "Concurrency", "Isolation", "Durability"]),
      correctAnswer: JSON.stringify(["Atomicity", "Isolation", "Durability"]),
      explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability (not Concurrency).",
      marks: 3.0,
      negativeMarks: 1.0,
    },
    {
      subjectId: subDBMS.id,
      topic: "Normalization",
      chapter: "Relational Design Theory",
      difficulty: "MEDIUM",
      questionType: "MCQ_SINGLE",
      questionText: "A relation is in Third Normal Form (3NF) if it is in 2NF and has no:",
      optionsJson: JSON.stringify(["Partial dependencies", "Transitive dependencies", "Multivalued dependencies", "Join dependencies"]),
      correctAnswer: "Transitive dependencies",
      explanation: "3NF eliminates transitive functional dependencies between non-prime attributes.",
      marks: 3.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subDBMS.id,
      topic: "Transactions",
      chapter: "Concurrency Control",
      difficulty: "EASY",
      questionType: "TRUE_FALSE",
      questionText: "Two-Phase Locking (2PL) protocol guarantees Conflict Serializability.",
      optionsJson: JSON.stringify(["True", "False"]),
      correctAnswer: "True",
      explanation: "The standard 2PL protocol guarantees that any schedule produced is conflict serializable.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subDBMS.id,
      topic: "Indexing",
      chapter: "Storage & File Structure",
      difficulty: "HARD",
      questionType: "MCQ_SINGLE",
      questionText: "Which balanced tree structure is most widely implemented for disk-based database indexes?",
      optionsJson: JSON.stringify(["AVL Tree", "Red-Black Tree", "B+ Tree", "Splay Tree"]),
      correctAnswer: "B+ Tree",
      explanation: "B+ Trees keep all data pointers at leaf nodes linked sequentially, making range scans and block disk I/O exceptionally efficient.",
      marks: 3.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subDBMS.id,
      topic: "Relational Algebra",
      chapter: "Query Processing",
      difficulty: "MEDIUM",
      questionType: "NUMERICAL",
      questionText: "If relation R has 4 tuples and relation S has 5 tuples, what is the exact number of tuples in the Cartesian product (R × S)?",
      optionsJson: null,
      correctAnswer: "20",
      explanation: "The Cartesian product of two relations with cardinalities m and n produces m * n tuples: 4 * 5 = 20.",
      marks: 2.0,
      negativeMarks: 0.0,
    },
    {
      subjectId: subDBMS.id,
      topic: "SQL Joins",
      chapter: "SQL Queries",
      difficulty: "EASY",
      questionType: "MCQ_SINGLE",
      questionText: "Which SQL clause is strictly used to filter groups created by the GROUP BY clause?",
      optionsJson: JSON.stringify(["WHERE", "HAVING", "ORDER BY", "FILTER"]),
      correctAnswer: "HAVING",
      explanation: "'HAVING' operates on aggregated groups, whereas 'WHERE' filters individual records prior to aggregation.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subDBMS.id,
      topic: "Normalization",
      chapter: "Relational Design Theory",
      difficulty: "HARD",
      questionType: "TRUE_FALSE",
      questionText: "Every relation in Boyce-Codd Normal Form (BCNF) is guaranteed to preserve all functional dependencies.",
      optionsJson: JSON.stringify(["True", "False"]),
      correctAnswer: "False",
      explanation: "BCNF decomposition does not always guarantee dependency preservation, while 3NF decomposition can achieve both lossless join and dependency preservation.",
      marks: 3.0,
      negativeMarks: 1.0,
    },

    // Discrete Mathematics Questions
    {
      subjectId: subMath.id,
      topic: "Set Theory",
      chapter: "Sets & Relations",
      difficulty: "EASY",
      questionType: "NUMERICAL",
      questionText: "If a set S has 4 elements, what is the total number of elements in its power set P(S)?",
      optionsJson: null,
      correctAnswer: "16",
      explanation: "The cardinality of a power set with n elements is 2^n. For n = 4, 2^4 = 16.",
      marks: 2.0,
      negativeMarks: 0.0,
    },
    {
      subjectId: subMath.id,
      topic: "Graph Theory",
      chapter: "Graphs & Trees",
      difficulty: "MEDIUM",
      questionType: "MCQ_SINGLE",
      questionText: "What is the sum of degrees of all vertices in an undirected graph with 12 edges?",
      optionsJson: JSON.stringify(["12", "24", "48", "6"]),
      correctAnswer: "24",
      explanation: "According to Euler's Handshaking Lemma, sum of vertex degrees = 2 * (number of edges). Thus 2 * 12 = 24.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subMath.id,
      topic: "Combinatorics",
      chapter: "Counting Principles",
      difficulty: "MEDIUM",
      questionType: "NUMERICAL",
      questionText: "How many ways can 5 distinct books be arranged on a single shelf?",
      optionsJson: null,
      correctAnswer: "120",
      explanation: "The number of permutations of 5 distinct items is 5! = 5 * 4 * 3 * 2 * 1 = 120.",
      marks: 2.0,
      negativeMarks: 0.0,
    },
    {
      subjectId: subMath.id,
      topic: "Logic",
      chapter: "Propositional Calculus",
      difficulty: "EASY",
      questionType: "TRUE_FALSE",
      questionText: "The proposition (P OR NOT P) is a tautology.",
      optionsJson: JSON.stringify(["True", "False"]),
      correctAnswer: "True",
      explanation: "By the Law of Excluded Middle, P OR ~P evaluates to True under every possible truth assignment.",
      marks: 2.0,
      negativeMarks: 0.5,
    },
    {
      subjectId: subMath.id,
      topic: "Graph Theory",
      chapter: "Planar Graphs",
      difficulty: "HARD",
      questionType: "MCQ_SINGLE",
      questionText: "According to Kuratowski's theorem, a graph is planar if and only if it does not contain a subgraph homeomorphic to:",
      optionsJson: JSON.stringify(["K3,3 or K5", "K4 or C5", "K2,4 or K6", "K3 or K4"]),
      correctAnswer: "K3,3 or K5",
      explanation: "Kuratowski's Theorem proves that a finite graph is planar if and only if it contains no subdivision of K5 (complete graph on 5 vertices) or K3,3 (complete bipartite graph).",
      marks: 3.0,
      negativeMarks: 1.0,
    },
  ];

  const createdQuestions = [];
  for (const q of questionsData) {
    const created = await prisma.question.create({ data: q });
    createdQuestions.push(created);
  }

  // 9. Create Exams
  // Exam 1: Java Comprehensive Online Mock Test (Available right now!)
  const javaQuestions = createdQuestions.filter((q) => q.subjectId === subJava.id);
  const examJava = await prisma.exam.create({
    data: {
      title: "Java Programming Comprehensive Mock Test",
      description: "Comprehensive assessment covering OOP, Inheritance, Polymorphism, Collections Framework, and Memory Management. Instant evaluation and complete solution review available.",
      code: "EXAM-JAVA-MOCK-2026",
      subjectId: subJava.id,
      examType: "ONLINE_OBJECTIVE",
      durationMinutes: 30,
      totalMarks: 24.0,
      passMarks: 10.0,
      negativeMarking: 0.5,
      isRandomized: true,
      canReviewSolutions: true,
      isPublished: true,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday (currently available)
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Valid for 2 weeks
    },
  });

  // Link questions to Java exam
  for (let i = 0; i < javaQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: examJava.id,
        questionId: javaQuestions[i].id,
        order: i + 1,
      },
    });
  }

  // Exam 2: DBMS Mid-Term Examination 2026
  const dbmsQuestions = createdQuestions.filter((q) => q.subjectId === subDBMS.id);
  const examDBMS = await prisma.exam.create({
    data: {
      title: "Database Management Systems Mid-Term",
      description: "Official mid-term examination assessing SQL, Relational Algebra, Normalization, ACID Transactions, and B+ Tree Indexing.",
      code: "EXAM-DBMS-MID-2026",
      subjectId: subDBMS.id,
      examType: "MID_TERM",
      durationMinutes: 45,
      totalMarks: 20.0,
      passMarks: 8.0,
      negativeMarking: 0.5,
      isRandomized: false,
      canReviewSolutions: true,
      isPublished: true,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  for (let i = 0; i < dbmsQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: examDBMS.id,
        questionId: dbmsQuestions[i].id,
        order: i + 1,
      },
    });
  }

  // Exam 3: Discrete Mathematics Quiz
  const mathQuestions = createdQuestions.filter((q) => q.subjectId === subMath.id);
  const examMath = await prisma.exam.create({
    data: {
      title: "Discrete Mathematics Practice Assessment",
      description: "Fast-paced quiz testing Set Theory, Combinatorics, Graph Theory, and Propositional Logic.",
      code: "EXAM-MATH-QUIZ-2026",
      subjectId: subMath.id,
      examType: "PRACTICE_TEST",
      durationMinutes: 20,
      totalMarks: 11.0,
      passMarks: 4.0,
      negativeMarking: 0.0,
      isRandomized: true,
      canReviewSolutions: true,
      isPublished: true,
      startDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  for (let i = 0; i < mathQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: examMath.id,
        questionId: mathQuestions[i].id,
        order: i + 1,
      },
    });
  }

  // 10. Create Exam Schedule for DBMS in Hall A
  const scheduleDBMS = await prisma.examSchedule.create({
    data: {
      examId: examDBMS.id,
      hallId: hallA.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: "09:30 AM",
      endTime: "11:00 AM",
    },
  });

  // Assign Invigilator to DBMS exam in Hall A
  await prisma.invigilatorAssignment.create({
    data: {
      examScheduleId: scheduleDBMS.id,
      facultyId: invigFac.id,
      hallId: hallA.id,
      status: "ASSIGNED",
    },
  });

  // 11. Allocate Seats for all 6 students in Hall A (Automatic Grid)
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    const row = Math.floor(i / hallA.cols) + 1;
    const col = (i % hallA.cols) + 1;
    const seatNumber = `A201-R${row}-S${col.toString().padStart(2, "0")}`;

    await prisma.seatAllocation.create({
      data: {
        examScheduleId: scheduleDBMS.id,
        studentId: student.id,
        hallId: hallA.id,
        rowNumber: row,
        colNumber: col,
        seatNumber: seatNumber,
      },
    });

    // Mark attendance records (Initial state)
    await prisma.attendance.create({
      data: {
        examScheduleId: scheduleDBMS.id,
        studentId: student.id,
        status: i === 2 ? "LATE" : "PRESENT",
        notes: i === 2 ? "Arrived 10 minutes late with permission" : null,
      },
    });
  }

  console.log("Database seeded successfully with realistic examination data!");
  console.log("----------------------------------------------------------------");
  console.log("Admin:       admin@exam.edu / Admin@123");
  console.log("Faculty 1:   prof.sharma@exam.edu / Faculty@123");
  console.log("Faculty 2:   dr.patel@exam.edu / Faculty@123");
  console.log("Invigilator: invigilator.rao@exam.edu / Invigilator@123");
  console.log("Student 1:   student1@exam.edu / Student@123");
  console.log("Student 2-6: student2@exam.edu ... student6@exam.edu / Student@123");
  console.log("----------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
