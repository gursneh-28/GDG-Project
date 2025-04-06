
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, Book, CalendarDays, Search, BookOpen, X } from "lucide-react";
import { useAuth } from "@/utils/auth";
import { dataStore, Course } from "@/utils/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import JoinCourseModal from "./JoinCourseModal";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(() => {
    if (user?.id) {
      return dataStore.getCoursesByStudentId(user.id);
    }
    return [];
  });

  const handleJoinCourse = (courseCode: string) => {
    try {
      // Check if the student is allowed to join the course
      const isAllowed = dataStore.isStudentAllowedInCourse(user?.id || "", courseCode);
      
      if (isAllowed) {
        // Student is already enrolled in the course
        toast.error("You are already enrolled in this course.");
        return;
      }
      
      // Try to enroll the student
      const success = dataStore.enrollStudentInCourse(user?.id || "", courseCode);
      
      if (success) {
        // Reload the courses
        const updatedCourses = dataStore.getCoursesByStudentId(user?.id || "");
        setCourses(updatedCourses);
        setIsModalOpen(false);
        toast.success("Successfully joined the course!");
      } else {
        toast.error("Course not found or you are not on the class list.");
      }
    } catch (error) {
      toast.error("Failed to join course. Please try again.");
    }
  };

  const handleOpenCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClassCountText = (course: Course) => {
    const count = course.schedule.length;
    return `${count} class${count !== 1 ? 'es' : ''} per week`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hi, {user?.name}</h1>
          <p className="text-gray-500">View your enrolled courses and track your progress</p>
        </div>
        
        <div className="flex w-full md:w-72">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No courses yet</h3>
            <p className="text-gray-500 text-center max-w-md mt-1">
              You haven't enrolled in any courses yet. Click the button below to join your first course.
            </p>
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Join Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="card-hover cursor-pointer overflow-hidden border border-gray-200"
                onClick={() => handleOpenCourse(course.id)}
              >
                <div className="h-2 bg-primary" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">
                      {course.code}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-1">{course.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span>{getClassCountText(course)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {course.schedule.map(s => s.day.charAt(0).toUpperCase() + s.day.slice(1)).join(", ")}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-3 bg-gray-50 text-xs text-gray-500">
                  Joined: {new Date().toLocaleDateString()}
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 z-10"
        size="icon"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <JoinCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleJoinCourse}
      />
    </div>
  );
};

export default DashboardPage;
