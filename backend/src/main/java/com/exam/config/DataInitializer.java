package com.exam.config;

import com.exam.model.*;
import com.exam.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final HallRepository hallRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            SubjectRepository subjectRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            HallRepository hallRepository,
            ExamRepository examRepository,
            QuestionRepository questionRepository,
            ExamQuestionRepository examQuestionRepository,
            ExamScheduleRepository examScheduleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.hallRepository = hallRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.examQuestionRepository = examQuestionRepository;
        this.examScheduleRepository = examScheduleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        System.out.println("Seeding Spring Boot database with demo data...");

        // 1. Departments
        Department deptCSE = departmentRepository.save(Department.builder()
                .name("Department of Computer Science & Engineering").code("CSE").build());
        Department deptMNC = departmentRepository.save(Department.builder()
                .name("Department of Mathematics & Computing").code("MNC").build());

        // 2. Subjects
        Subject subJava = subjectRepository.save(Subject.builder()
                .name("Java Programming").code("CS301").department(deptCSE).credits(4).semester(4).build());
        Subject subDBMS = subjectRepository.save(Subject.builder()
                .name("Database Management Systems").code("CS302").department(deptCSE).credits(4).semester(4).build());
        Subject subMath = subjectRepository.save(Subject.builder()
                .name("Discrete Mathematics").code("MA201").department(deptMNC).credits(3).semester(3).build());

        // 3. Admin User
        User adminUser = userRepository.save(User.builder()
                .email("admin@exam.edu")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .name("Dr. Vikram Seth (Dean / Admin)")
                .role("ADMIN")
                .phone("+91 98765 43210")
                .build());

        // 4. Faculty Users
        User facUser1 = userRepository.save(User.builder()
                .email("prof.sharma@exam.edu")
                .passwordHash(passwordEncoder.encode("Faculty@123"))
                .name("Prof. Rajesh Sharma")
                .role("FACULTY")
                .phone("+91 98765 11111")
                .build());
        facultyRepository.save(Faculty.builder()
                .user(facUser1).employeeId("FAC-CSE-001").designation("Senior Professor").department(deptCSE).build());

        User facUser2 = userRepository.save(User.builder()
                .email("dr.patel@exam.edu")
                .passwordHash(passwordEncoder.encode("Faculty@123"))
                .name("Dr. Ananya Patel")
                .role("FACULTY")
                .phone("+91 98765 22222")
                .build());
        facultyRepository.save(Faculty.builder()
                .user(facUser2).employeeId("FAC-CSE-002").designation("Associate Professor").department(deptCSE).build());

        // 5. Invigilator User
        User invigUser = userRepository.save(User.builder()
                .email("invigilator.rao@exam.edu")
                .passwordHash(passwordEncoder.encode("Invigilator@123"))
                .name("Suresh Rao (Chief Invigilator)")
                .role("INVIGILATOR")
                .phone("+91 98765 33333")
                .build());
        facultyRepository.save(Faculty.builder()
                .user(invigUser).employeeId("INV-EXAM-001").designation("Superintendent").department(deptCSE).build());

        // 6. Students
        List<String[]> studentsData = Arrays.asList(
            new String[]{"student1@exam.edu", "Rahul Verma", "CS2026-001", "REG2026001"},
            new String[]{"student2@exam.edu", "Priya Sen", "CS2026-002", "REG2026002"},
            new String[]{"student3@exam.edu", "Amit Kumar", "CS2026-003", "REG2026003"},
            new String[]{"student4@exam.edu", "Sneha Reddy", "CS2026-004", "REG2026004"},
            new String[]{"student5@exam.edu", "Karthik Iyer", "CS2026-005", "REG2026005"}
        );

        for (String[] s : studentsData) {
            User stuUser = userRepository.save(User.builder()
                    .email(s[0])
                    .passwordHash(passwordEncoder.encode("Student@123"))
                    .name(s[1])
                    .role("STUDENT")
                    .build());
            studentRepository.save(Student.builder()
                    .user(stuUser)
                    .rollNumber(s[2])
                    .registrationNo(s[3])
                    .semester(4)
                    .department(deptCSE)
                    .build());
        }

        // 7. Halls
        Hall hallA = hallRepository.save(Hall.builder()
                .hallCode("HALL-A201")
                .name("Aryabhata Examination Hall")
                .building("Academic Block 1")
                .floor("2nd Floor")
                .capacity(30)
                .rows(5)
                .cols(6)
                .build());

        Hall hallB = hallRepository.save(Hall.builder()
                .hallCode("HALL-B102")
                .name("Ramanujan Memorial Hall")
                .building("Science Block B")
                .floor("1st Floor")
                .capacity(24)
                .rows(4)
                .cols(6)
                .build());

        // 8. Questions (Java & DBMS)
        Question q1 = questionRepository.save(Question.builder()
                .subject(subJava)
                .topic("Object Oriented Programming")
                .chapter("Inheritance & Interfaces")
                .difficulty("MEDIUM")
                .questionType("MCQ_SINGLE")
                .questionText("Which Java keyword is used to inherit a class?")
                .optionsJson("[\"extends\", \"implements\", \"inherits\", \"super\"]")
                .correctAnswer("extends")
                .explanation("The 'extends' keyword is used in Java class declarations to specify the superclass.")
                .marks(2.0)
                .negativeMarks(0.5)
                .build());

        Question q2 = questionRepository.save(Question.builder()
                .subject(subJava)
                .topic("JVM Internals")
                .chapter("Garbage Collection")
                .difficulty("HARD")
                .questionType("MCQ_SINGLE")
                .questionText("Which memory area in JVM stores class metadata, runtime constant pool, and field/method data?")
                .optionsJson("[\"Heap Memory\", \"Metaspace\", \"Java Threads Stack\", \"PC Register\"]")
                .correctAnswer("Metaspace")
                .explanation("Starting in Java 8, Metaspace replaced PermGen to store class metadata.")
                .marks(2.0)
                .negativeMarks(0.5)
                .build());

        Question q3 = questionRepository.save(Question.builder()
                .subject(subDBMS)
                .topic("SQL & Relational Algebra")
                .chapter("Indexing")
                .difficulty("EASY")
                .questionType("MCQ_SINGLE")
                .questionText("Which SQL clause is used to filter group summary records after GROUP BY?")
                .optionsJson("[\"WHERE\", \"HAVING\", \"ORDER BY\", \"FILTER\"]")
                .correctAnswer("HAVING")
                .explanation("The HAVING clause was added to SQL because the WHERE keyword could not be used with aggregate functions.")
                .marks(2.0)
                .build());

        // 9. Exam
        Exam exam1 = examRepository.save(Exam.builder()
                .title("Mid-Semester Java & Data Systems Assessment 2026")
                .code("EXAM-2026-JAVA")
                .description("Comprehensive Mid-Semester Online Examination covering Java OOP, Exception Handling, JVM, and Database Fundamentals.")
                .subject(subJava)
                .examType("ONLINE_OBJECTIVE")
                .durationMinutes(45)
                .totalMarks(100.0)
                .passMarks(40.0)
                .negativeMarking(0.25)
                .isRandomized(true)
                .canReviewSolutions(true)
                .isPublished(true)
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(10))
                .build());

        examQuestionRepository.save(ExamQuestion.builder().exam(exam1).question(q1).orderIndex(1).build());
        examQuestionRepository.save(ExamQuestion.builder().exam(exam1).question(q2).orderIndex(2).build());
        examQuestionRepository.save(ExamQuestion.builder().exam(exam1).question(q3).orderIndex(3).build());

        // 10. Schedule
        examScheduleRepository.save(ExamSchedule.builder()
                .exam(exam1)
                .hall(hallA)
                .date(LocalDateTime.now().plusDays(2))
                .startTime("10:00 AM")
                .endTime("11:00 AM")
                .build());

        System.out.println("Java Spring Boot database seeding completed!");
    }
}
