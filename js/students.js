const STUDENT_KEY = 'students';

const seedStudents = [
  {
    studentId: 'EV-2025-001',
    firstName: 'Ava',
    middleName: 'C.',
    lastName: 'Lopez',
    dob: '2004-03-15',
    gender: 'Female',
    course: 'Computer Science',
    yearLevel: '3',
    contact: '0917-555-1000',
    address: 'Eastwood City, QC',
  },
  {
    studentId: 'EV-2025-002',
    firstName: 'Noah',
    middleName: 'T.',
    lastName: 'Reyes',
    dob: '2003-11-02',
    gender: 'Male',
    course: 'Information Systems',
    yearLevel: '4',
    contact: '0917-555-1001',
    address: 'Bonifacio Global City, Taguig',
  },
];

function ensureStudents() {
  const existing = localStorage.getItem(STUDENT_KEY);
  if (!existing) {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(seedStudents));
  }
}

function getStudents() {
  ensureStudents();
  const data = localStorage.getItem(STUDENT_KEY);
  return data ? JSON.parse(data) : [];
}

function saveStudents(list) {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(list));
}

function addStudent(student) {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
  return student;
}

function findStudentById(id) {
  return getStudents().find((s) => s.studentId === id);
}

function updateStudent(id, payload) {
  const students = getStudents();
  const index = students.findIndex((s) => s.studentId === id);
  if (index === -1) return false;
  students[index] = { ...students[index], ...payload };
  saveStudents(students);
  return true;
}

function deleteStudent(id) {
  const students = getStudents();
  const filtered = students.filter((s) => s.studentId !== id);
  if (filtered.length === students.length) return false;
  saveStudents(filtered);
  return true;
}

