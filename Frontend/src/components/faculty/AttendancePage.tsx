
import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, BarChart2, CalendarX, Download } from "lucide-react";
import { Course, AttendanceRecord, dataStore } from "@/utils/data";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AttendancePageProps {
  course: Course;
  facultyView: boolean;
  userId: string;
}

interface AttendanceDay {
  date: Date;
  classes: {
    startTime: string;
    endTime: string;
  }[];
}

// Map numeric days to week days
const dayMap = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const AttendancePage: React.FC<AttendancePageProps> = ({
  course,
  facultyView,
  userId,
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<Record<string, boolean>>({});
  const [attendanceStats, setAttendanceStats] = useState<{
    totalClasses: number;
    presentCount: Record<string, number>;
  }>({
    totalClasses: 0,
    presentCount: {},
  });

  // Calculate attendance days
  useEffect(() => {
    calculateAttendanceDays();
  }, [course]);

  // Calculate attendance statistics
  useEffect(() => {
    if (facultyView) {
      calculateAttendanceStats();
    } else {
      calculateStudentAttendance();
    }
  }, [course, facultyView, userId]);

  const calculateAttendanceDays = () => {
    const days: AttendanceDay[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Get the last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Loop through all days of the month
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() as keyof typeof dayMap;
      const weekDay = dayMap[dayOfWeek];
      
      // Check if this day has a scheduled class
      const scheduledClasses = course.schedule.filter(
        (s) => s.day === weekDay
      );
      
      if (scheduledClasses.length > 0) {
        days.push({
          date: new Date(d),
          classes: scheduledClasses.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        });
      }
    }
    
    setAttendanceDays(days);
  };

  const calculateAttendanceStats = () => {
    const records = dataStore.getAttendanceRecordsByCourseId(course.id);
    const stats = {
      totalClasses: records.length,
      presentCount: {} as Record<string, number>,
    };
    
    // Initialize present count for all students
    course.students.forEach((studentId) => {
      stats.presentCount[studentId] = 0;
    });
    
    // Calculate present count for each student
    records.forEach((record) => {
      record.records.forEach((studentRecord) => {
        if (studentRecord.present) {
          stats.presentCount[studentRecord.studentId] = 
            (stats.presentCount[studentRecord.studentId] || 0) + 1;
        }
      });
    });
    
    setAttendanceStats(stats);
  };

  const calculateStudentAttendance = () => {
    const records = dataStore.getAttendanceRecordsByCourseId(course.id);
    const stats = {
      totalClasses: records.length,
      presentCount: { [userId]: 0 } as Record<string, number>,
    };
    
    // Calculate present count for the student
    records.forEach((record) => {
      const studentRecord = record.records.find((r) => r.studentId === userId);
      if (studentRecord?.present) {
        stats.presentCount[userId] += 1;
      }
    });
    
    setAttendanceStats(stats);
  };

  const isClassDay = (date: Date) => {
    const dayOfWeek = date.getDay() as keyof typeof dayMap;
    const weekDay = dayMap[dayOfWeek];
    return course.schedule.some((s) => s.day === weekDay);
  };

  const getAttendanceForDateAndTime = (date: Date, startTime: string, endTime: string) => {
    const dateString = date.toISOString().split("T")[0];
    return dataStore.getAttendanceRecordByDateAndTimeSlot(
      course.id,
      dateString,
      startTime,
      endTime
    );
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setSelectedTimeSlot(null);
    }
  };

  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    if (!date) return;
    
    setSelectedTimeSlot(`${startTime}-${endTime}`);
    
    const existingRecord = getAttendanceForDateAndTime(date, startTime, endTime);
    
    if (existingRecord) {
      setCurrentAttendance(existingRecord);
      
      const studentRecords = {} as Record<string, boolean>;
      existingRecord.records.forEach((record) => {
        studentRecords[record.studentId] = record.present;
      });
      setStudentAttendance(studentRecords);
    } else {
      // Initialize new attendance record
      const newStudentRecords = {} as Record<string, boolean>;
      course.students.forEach((studentId) => {
        newStudentRecords[studentId] = false;
      });
      setStudentAttendance(newStudentRecords);
      setCurrentAttendance(null);
    }
    
    setAttendanceDialogOpen(true);
  };

  const handleToggleAttendance = (studentId: string) => {
    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSaveAttendance = () => {
    if (!date || !selectedTimeSlot) return;
    
    const [startTime, endTime] = selectedTimeSlot.split("-");
    const dateString = date.toISOString().split("T")[0];
    
    const records = Object.entries(studentAttendance).map(([studentId, present]) => ({
      studentId,
      present,
    }));
    
    if (currentAttendance) {
      // Update existing record
      dataStore.updateAttendanceRecord(currentAttendance.id, {
        records,
      });
      toast.success("Attendance updated successfully");
    } else {
      // Create new record
      dataStore.createAttendanceRecord({
        courseId: course.id,
        date: dateString,
        timeSlot: {
          startTime,
          endTime,
        },
        records,
      });
      toast.success("Attendance recorded successfully");
    }
    
    setAttendanceDialogOpen(false);
    calculateAttendanceStats();
  };

  const handleDownloadReport = () => {
    // In a real application, this would generate a CSV or Excel file
    toast.success("Attendance report downloaded");
  };

  const getAttendancePercentage = (studentId: string) => {
    if (attendanceStats.totalClasses === 0) return 0;
    return Math.round(
      (attendanceStats.presentCount[studentId] / attendanceStats.totalClasses) * 100
    );
  };

  const getDayClasses = (date: Date) => {
    const dayOfWeek = date.getDay() as keyof typeof dayMap;
    const weekDay = dayMap[dayOfWeek];
    return course.schedule.filter((s) => s.day === weekDay);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Attendance Calendar
            </CardTitle>
            <CardDescription>
              Select a date to view or record attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? (
                      <span>
                        {date.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span>Pick a month</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    className="p-3 pointer-events-auto"
                    modifiers={{
                      class: attendanceDays.map((day) => day.date),
                    }}
                    modifiersClassNames={{
                      class: "bg-primary text-primary-foreground rounded-full",
                    }}
                  />
                </PopoverContent>
              </Popover>

              {date && isClassDay(date) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getDayClasses(date).map((classTime, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() =>
                        handleTimeSlotSelect(
                          classTime.startTime,
                          classTime.endTime
                        )
                      }
                      className="flex items-center"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {classTime.startTime} - {classTime.endTime}
                    </Button>
                  ))}
                </div>
              )}

              {date && !isClassDay(date) && (
                <div className="flex items-center justify-center p-4 border rounded-md bg-gray-50 w-full">
                  <CalendarX className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    No classes scheduled for this day
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              Attendance Statistics
            </CardTitle>
            <CardDescription>
              {facultyView
                ? "Student attendance overview"
                : "Your attendance overview"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">Total Classes</h4>
                <p className="text-2xl font-bold">{attendanceStats.totalClasses}</p>
              </div>
              
              {facultyView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                  className="flex items-center"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
            
            {facultyView ? (
              <div className="space-y-3 mt-4">
                <h4 className="text-sm font-medium">Students ({course.students.length})</h4>
                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {course.students.map((studentId) => {
                    const percentage = getAttendancePercentage(studentId);
                    return (
                      <div
                        key={studentId}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm">
                          {/* In a real app, you'd show the student's name */}
                          Student {studentId.split("-")[1]}
                        </span>
                        <div className="flex items-center">
                          <div
                            className={`text-sm font-medium ${
                              percentage < 75
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {percentage}%
                          </div>
                          <div className="w-16 ml-2 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage < 75
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium">Your Attendance</h4>
                  <div className="mt-2 flex items-center">
                    <div
                      className="text-2xl font-bold mr-2"
                      style={{
                        color:
                          getAttendancePercentage(userId) < 75
                            ? "#ef4444"
                            : "#22c55e",
                      }}
                    >
                      {getAttendancePercentage(userId)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      ({attendanceStats.presentCount[userId] || 0}/{attendanceStats.totalClasses} classes)
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      getAttendancePercentage(userId) < 75
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${getAttendancePercentage(userId)}%` }}
                  ></div>
                </div>
                
                <div className="pt-2 text-sm text-gray-500">
                  {getAttendancePercentage(userId) < 75 ? (
                    <p className="text-red-500">
                      Warning: Your attendance is below the required 75%
                    </p>
                  ) : (
                    <p className="text-green-500">
                      Good job! Your attendance is above the required 75%
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Dialog */}
      {facultyView && (
        <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                {selectedTimeSlot && `(${selectedTimeSlot.replace("-", " - ")})`}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Mark Attendance
                </h3>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAttendance = { ...studentAttendance };
                      Object.keys(newAttendance).forEach((key) => {
                        newAttendance[key] = true;
                      });
                      setStudentAttendance(newAttendance);
                    }}
                  >
                    Mark All Present
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAttendance = { ...studentAttendance };
                      Object.keys(newAttendance).forEach((key) => {
                        newAttendance[key] = false;
                      });
                      setStudentAttendance(newAttendance);
                    }}
                  >
                    Mark All Absent
                  </Button>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(studentAttendance).map(([studentId, present], index) => (
                      <tr key={studentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              {studentId.split("-")[1]}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {/* In a real app, you'd show the student's name */}
                                Student {studentId.split("-")[1]}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <Select
                            value={present ? "present" : "absent"}
                            onValueChange={(value) => {
                              handleToggleAttendance(studentId);
                            }}
                          >
                            <SelectTrigger className="w-28 mx-auto">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">
                                <span className="flex items-center text-green-600">
                                  Present
                                </span>
                              </SelectItem>
                              <SelectItem value="absent">
                                <span className="flex items-center text-red-600">
                                  Absent
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveAttendance}>
                {currentAttendance ? "Update Attendance" : "Save Attendance"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AttendancePage;
