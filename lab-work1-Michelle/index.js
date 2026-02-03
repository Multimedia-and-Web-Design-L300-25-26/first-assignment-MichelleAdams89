import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filepath = path.join(__dirname, "data.json");
const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));

/* =========================
   LEVEL 0 – TEST ROUTES
========================= */

app.get("/route", (req, res) => {
  res.send("route works!");
});

app.get("/data", (req, res) => {
  res.json(data);
});

/* =========================
   LEVEL 1 – BASIC CRUD (GET)
========================= */

/* STUDENTS */
app.get("/api/students", (req, res) => {
  res.json(data.students);
});

app.get("/api/students/:id", (req, res) => {
  const student = data.students.find(s => s.id == req.params.id);
  student ? res.json(student) : res.status(404).json({ message: "Student not found" });
});

/* INSTRUCTORS */
app.get("/api/instructors", (req, res) => {
  res.json(data.instructors);
});

app.get("/api/instructors/:id", (req, res) => {
  const instructor = data.instructors.find(i => i.id == req.params.id);
  instructor ? res.json(instructor) : res.status(404).json({ message: "Instructor not found" });
});

/* COURSES */
app.get("/api/courses", (req, res) => {
  res.json(data.courses);
});

app.get("/api/courses/:id", (req, res) => {
  const course = data.courses.find(c => c.id == req.params.id);
  course ? res.json(course) : res.status(404).json({ message: "Course not found" });
});

/* ENROLLMENTS */
app.get("/api/enrollments", (req, res) => {
  res.json(data.enrollments);
});

app.get("/api/enrollments/:id", (req, res) => {
  const enrollment = data.enrollments.find(e => e.id == req.params.id);
  enrollment ? res.json(enrollment) : res.status(404).json({ message: "Enrollment not found" });
});

/* ASSIGNMENTS */
app.get("/api/assignments", (req, res) => {
  res.json(data.assignments);
});

app.get("/api/assignments/:id", (req, res) => {
  const assignment = data.assignments.find(a => a.id == req.params.id);
  assignment ? res.json(assignment) : res.status(404).json({ message: "Assignment not found" });
});

/* GRADES */
app.get("/api/grades", (req, res) => {
  res.json(data.grades);
});

app.get("/api/grades/:id", (req, res) => {
  const grade = data.grades.find(g => g.id == req.params.id);
  grade ? res.json(grade) : res.status(404).json({ message: "Grade not found" });
});

/* =========================
   LEVEL 2 – RELATIONSHIPS
========================= */

/* Student Enrollments */
app.get("/api/students/:id/enrollments", (req, res) => {
  const enrollments = data.enrollments.filter(e => e.studentId == req.params.id);
  res.json(enrollments);
});

/* Student Courses */
app.get("/api/students/:id/courses", (req, res) => {
  const enrollments = data.enrollments.filter(e => e.studentId == req.params.id);
  const courses = enrollments.map(e =>
    data.courses.find(c => c.id === e.courseId)
  );
  res.json(courses);
});

/* Course Students */
app.get("/api/courses/:id/students", (req, res) => {
  const enrollments = data.enrollments.filter(e => e.courseId == req.params.id);
  const students = enrollments.map(e =>
    data.students.find(s => s.id === e.studentId)
  );
  res.json(students);
});

/* Instructor Courses */
app.get("/api/instructors/:id/courses", (req, res) => {
  const courses = data.courses.filter(c => c.instructorId == req.params.id);
  res.json(courses);
});

/* Course Assignments */
app.get("/api/courses/:id/assignments", (req, res) => {
  const assignments = data.assignments.filter(a => a.courseId == req.params.id);
  res.json(assignments);
});

/* Enrollment Grades */
app.get("/api/enrollments/:id/grades", (req, res) => {
  const grades = data.grades.filter(g => g.enrollmentId == req.params.id);
  res.json(grades);
});

/* =========================
   LEVEL 3 – ADVANCED QUERIES
========================= */

/* GPA Calculation */
app.get("/api/students/:id/gpa", (req, res) => {
  const student = data.students.find(s => s.id == req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  res.json({
    studentId: student.id,
    name: `${student.firstName} ${student.lastName}`,
    gpa: student.gpa
  });
});

/* Course Average Grade */
app.get("/api/courses/:id/average", (req, res) => {
  const enrollments = data.enrollments.filter(e => e.courseId == req.params.id && e.grade);

  if (enrollments.length === 0)
    return res.json({ message: "No grades available for this course" });

  const gradeMap = { A: 4, "A-": 3.7, "B+": 3.3, B: 3.0 };
  const avg =
    enrollments.reduce((sum, e) => sum + (gradeMap[e.grade] || 0), 0) /
    enrollments.length;

  res.json({ courseId: req.params.id, averageGPA: avg.toFixed(2) });
});

/* Instructor Students */
app.get("/api/instructors/:id/students", (req, res) => {
  const courses = data.courses.filter(c => c.instructorId == req.params.id);
  const courseIds = courses.map(c => c.id);

  const enrollments = data.enrollments.filter(e =>
    courseIds.includes(e.courseId)
  );

  const students = enrollments.map(e =>
    data.students.find(s => s.id === e.studentId)
  );

  res.json([...new Set(students)]);
});

/* Student Schedule */
app.get("/api/students/:id/schedule", (req, res) => {
  const enrollments = data.enrollments.filter(
    e => e.studentId == req.params.id && e.status === "enrolled"
  );

  const schedule = enrollments.map(e => {
    const course = data.courses.find(c => c.id === e.courseId);
    return {
      courseCode: course.code,
      courseName: course.name,
      schedule: course.schedule
    };
  });

  res.json(schedule);
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
