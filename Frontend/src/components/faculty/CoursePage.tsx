
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { dataStore, Course } from "@/utils/data";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Header from "@/components/shared/Header";
import AttendancePage from "./AttendancePage";
import AssignmentsPage from "./AssignmentsPage";
import FilesPage from "./FilesPage";
import DoubtsPage from "./DoubtsPage";
import AnnouncementsPage from "./AnnouncementsPage";
import AboutPage from "./AboutPage";

interface CoursePageProps {
  facultyView?: boolean;
}

const CoursePage: React.FC<CoursePageProps> = ({ facultyView = true }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("attendance");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (courseId) {
      const fetchedCourse = dataStore.getCourseById(courseId);
      if (fetchedCourse) {
        setCourse(fetchedCourse);
      } else {
        toast.error("Course not found");
        navigate(facultyView ? "/faculty-dashboard" : "/student-dashboard");
      }
    }
    setIsMounted(true);
  }, [courseId, navigate, facultyView]);

  const handleBack = () => {
    navigate(facultyView ? "/faculty-dashboard" : "/student-dashboard");
  };

  if (!isMounted || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-80"></div>
          <div className="h-6 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title={course.name} />
      
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{course.code}: {course.name}</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="doubts">Doubts</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="animate-fade-in">
            <AttendancePage 
              course={course} 
              facultyView={facultyView} 
              userId={user?.id || ""} 
            />
          </TabsContent>
          
          <TabsContent value="assignments" className="animate-fade-in">
            <AssignmentsPage 
              course={course} 
              facultyView={facultyView} 
              userId={user?.id || ""} 
            />
          </TabsContent>
          
          <TabsContent value="files" className="animate-fade-in">
            <FilesPage 
              course={course} 
              facultyView={facultyView} 
              userId={user?.id || ""} 
            />
          </TabsContent>
          
          <TabsContent value="doubts" className="animate-fade-in">
            <DoubtsPage 
              course={course} 
              facultyView={facultyView} 
              userId={user?.id || ""} 
            />
          </TabsContent>
          
          <TabsContent value="announcements" className="animate-fade-in">
            <AnnouncementsPage 
              course={course} 
              facultyView={facultyView} 
              userId={user?.id || ""} 
            />
          </TabsContent>
          
          <TabsContent value="about" className="animate-fade-in">
            <AboutPage 
              course={course} 
              facultyView={facultyView}
              userId={user?.id || ""}
              onCourseDeleted={handleBack}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CoursePage;
