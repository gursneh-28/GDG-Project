
import { User } from "./auth";

// Course types
export interface Course {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  schedule: ClassSchedule[];
  students: string[]; // Array of student IDs enrolled
  createdAt: string;
}

export interface ClassSchedule {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  startTime: string;
  endTime: string;
}

// Attendance types
export interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  records: {
    studentId: string;
    present: boolean;
  }[];
}

// Assignment types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  points: number;
  dueDate: string;
  publishDate: string;
  files: string[];
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  files: string[];
  comment?: string;
  grade?: number;
  feedback?: string;
}

// File types
export interface CourseFile {
  id: string;
  courseId: string;
  name: string;
  url: string;
  type: string;
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Doubt types
export interface Doubt {
  id: string;
  courseId: string;
  studentId: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  status: "open" | "answered";
  createdAt: string;
  response?: {
    text?: string;
    files?: string[];
    videoUrl?: string;
    answeredAt: string;
  };
}

// Announcement types
export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

// Mock data store
export class DataStore {
  private courses: Course[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  private assignments: Assignment[] = [];
  private submissions: AssignmentSubmission[] = [];
  private files: CourseFile[] = [];
  private doubts: Doubt[] = [];
  private announcements: Announcement[] = [];

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample courses
    this.courses = [
      {
        id: "course-1",
        name: "Introduction to Computer Science",
        code: "CS101",
        facultyId: "faculty-1",
        schedule: [
          { day: "monday", startTime: "10:00", endTime: "11:30" },
          { day: "wednesday", startTime: "10:00", endTime: "11:30" }
        ],
        students: ["student-1", "student-2"],
        createdAt: new Date().toISOString()
      },
      {
        id: "course-2",
        name: "Data Structures and Algorithms",
        code: "CS202",
        facultyId: "faculty-2",
        schedule: [
          { day: "tuesday", startTime: "14:00", endTime: "15:30" },
          { day: "thursday", startTime: "14:00", endTime: "15:30" }
        ],
        students: ["student-1"],
        createdAt: new Date().toISOString()
      }
    ];

    // Sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.attendanceRecords = [
      {
        id: "attendance-1",
        courseId: "course-1",
        date: yesterday.toISOString().split('T')[0],
        timeSlot: { startTime: "10:00", endTime: "11:30" },
        records: [
          { studentId: "student-1", present: true },
          { studentId: "student-2", present: false }
        ]
      }
    ];

    // Sample assignments
    this.assignments = [
      {
        id: "assignment-1",
        courseId: "course-1",
        title: "Programming Basics",
        description: "Write a simple program to demonstrate variables and control structures",
        points: 10,
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        publishDate: yesterday.toISOString(),
        files: [],
        createdAt: yesterday.toISOString()
      }
    ];

    // Sample submissions
    this.submissions = [
      {
        id: "submission-1",
        assignmentId: "assignment-1",
        studentId: "student-1",
        submissionDate: today.toISOString(),
        files: ["file-url-1"],
        comment: "Here's my submission for the assignment.",
      }
    ];

    // Sample files
    this.files = [
      {
        id: "file-1",
        courseId: "course-1",
        name: "Introduction to Programming.pdf",
        url: "#",
        type: "pdf",
        description: "Course overview and syllabus",
        uploadedAt: yesterday.toISOString(),
        uploadedBy: "faculty-1"
      }
    ];

    // Sample doubts
    this.doubts = [
      {
        id: "doubt-1",
        courseId: "course-1",
        studentId: "student-1",
        title: "Question about loops",
        description: "I'm confused about the difference between while and do-while loops",
        isAnonymous: false,
        status: "open",
        createdAt: today.toISOString()
      }
    ];

    // Sample announcements
    this.announcements = [
      {
        id: "announcement-1",
        courseId: "course-1",
        title: "Class Canceled Tomorrow",
        content: "Due to maintenance work in the building, tomorrow's class will be conducted online.",
        createdAt: today.toISOString(),
        createdBy: "faculty-1"
      }
    ];
  }

  // Courses
  getCoursesByFacultyId(facultyId: string): Course[] {
    return this.courses.filter(course => course.facultyId === facultyId);
  }

  getCoursesByStudentId(studentId: string): Course[] {
    return this.courses.filter(course => course.students.includes(studentId));
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find(course => course.id === id);
  }

  createCourse(course: Omit<Course, "id" | "createdAt">): Course {
    const newCourse: Course = {
      ...course,
      id: `course-${this.courses.length + 1}`,
      createdAt: new Date().toISOString()
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const index = this.courses.findIndex(course => course.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updates };
      return this.courses[index];
    }
    return undefined;
  }

  deleteCourse(id: string): boolean {
    const initialLength = this.courses.length;
    this.courses = this.courses.filter(course => course.id !== id);
    return this.courses.length !== initialLength;
  }

  // Attendance
  getAttendanceRecordsByCourseId(courseId: string): AttendanceRecord[] {
    return this.attendanceRecords.filter(record => record.courseId === courseId);
  }

  getAttendanceRecordByDateAndTimeSlot(courseId: string, date: string, startTime: string, endTime: string): AttendanceRecord | undefined {
    return this.attendanceRecords.find(record => 
      record.courseId === courseId && 
      record.date === date && 
      record.timeSlot.startTime === startTime &&
      record.timeSlot.endTime === endTime
    );
  }

  createAttendanceRecord(record: Omit<AttendanceRecord, "id">): AttendanceRecord {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `attendance-${this.attendanceRecords.length + 1}`
    };
    this.attendanceRecords.push(newRecord);
    return newRecord;
  }

  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | undefined {
    const index = this.attendanceRecords.findIndex(record => record.id === id);
    if (index !== -1) {
      this.attendanceRecords[index] = { ...this.attendanceRecords[index], ...updates };
      return this.attendanceRecords[index];
    }
    return undefined;
  }

  // Assignments
  getAssignmentsByCourseId(courseId: string): Assignment[] {
    return this.assignments.filter(assignment => assignment.courseId === courseId);
  }

  getAssignmentById(id: string): Assignment | undefined {
    return this.assignments.find(assignment => assignment.id === id);
  }

  createAssignment(assignment: Omit<Assignment, "id" | "createdAt">): Assignment {
    const newAssignment: Assignment = {
      ...assignment,
      id: `assignment-${this.assignments.length + 1}`,
      createdAt: new Date().toISOString()
    };
    this.assignments.push(newAssignment);
    return newAssignment;
  }

  // Submissions
  getSubmissionsByAssignmentId(assignmentId: string): AssignmentSubmission[] {
    return this.submissions.filter(submission => submission.assignmentId === assignmentId);
  }

  getSubmissionByStudentAndAssignment(studentId: string, assignmentId: string): AssignmentSubmission | undefined {
    return this.submissions.find(submission => 
      submission.studentId === studentId && submission.assignmentId === assignmentId
    );
  }

  createSubmission(submission: Omit<AssignmentSubmission, "id">): AssignmentSubmission {
    const newSubmission: AssignmentSubmission = {
      ...submission,
      id: `submission-${this.submissions.length + 1}`
    };
    this.submissions.push(newSubmission);
    return newSubmission;
  }

  updateSubmission(id: string, updates: Partial<AssignmentSubmission>): AssignmentSubmission | undefined {
    const index = this.submissions.findIndex(submission => submission.id === id);
    if (index !== -1) {
      this.submissions[index] = { ...this.submissions[index], ...updates };
      return this.submissions[index];
    }
    return undefined;
  }

  // Files
  getFilesByCourseId(courseId: string): CourseFile[] {
    return this.files.filter(file => file.courseId === courseId);
  }

  getFileById(id: string): CourseFile | undefined {
    return this.files.find(file => file.id === id);
  }

  createFile(file: Omit<CourseFile, "id" | "uploadedAt">): CourseFile {
    const newFile: CourseFile = {
      ...file,
      id: `file-${this.files.length + 1}`,
      uploadedAt: new Date().toISOString()
    };
    this.files.push(newFile);
    return newFile;
  }

  updateFile(id: string, updates: Partial<CourseFile>): CourseFile | undefined {
    const index = this.files.findIndex(file => file.id === id);
    if (index !== -1) {
      this.files[index] = { ...this.files[index], ...updates };
      return this.files[index];
    }
    return undefined;
  }

  deleteFile(id: string): boolean {
    const initialLength = this.files.length;
    this.files = this.files.filter(file => file.id !== id);
    return this.files.length !== initialLength;
  }

  // Doubts
  getDoubtsByCourseId(courseId: string): Doubt[] {
    return this.doubts.filter(doubt => doubt.courseId === courseId);
  }

  getDoubtById(id: string): Doubt | undefined {
    return this.doubts.find(doubt => doubt.id === id);
  }

  createDoubt(doubt: Omit<Doubt, "id" | "createdAt" | "status">): Doubt {
    const newDoubt: Doubt = {
      ...doubt,
      id: `doubt-${this.doubts.length + 1}`,
      status: "open",
      createdAt: new Date().toISOString()
    };
    this.doubts.push(newDoubt);
    return newDoubt;
  }

  updateDoubt(id: string, updates: Partial<Doubt>): Doubt | undefined {
    const index = this.doubts.findIndex(doubt => doubt.id === id);
    if (index !== -1) {
      this.doubts[index] = { ...this.doubts[index], ...updates };
      return this.doubts[index];
    }
    return undefined;
  }

  // Announcements
  getAnnouncementsByCourseId(courseId: string): Announcement[] {
    return this.announcements.filter(announcement => announcement.courseId === courseId);
  }

  createAnnouncement(announcement: Omit<Announcement, "id" | "createdAt">): Announcement {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `announcement-${this.announcements.length + 1}`,
      createdAt: new Date().toISOString()
    };
    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  }

  // Student methods
  isStudentAllowedInCourse(studentId: string, courseCode: string): boolean {
    const course = this.courses.find(c => c.code === courseCode);
    return !!course && course.students.includes(studentId);
  }

  enrollStudentInCourse(studentId: string, courseCode: string): boolean {
    const course = this.courses.find(c => c.code === courseCode);
    if (course && !course.students.includes(studentId)) {
      course.students.push(studentId);
      return true;
    }
    return false;
  }
}

// Create and export singleton instance
export const dataStore = new DataStore();
