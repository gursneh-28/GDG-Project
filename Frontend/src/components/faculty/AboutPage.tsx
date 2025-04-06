
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Calendar, Clock, Users, Trash2, Edit, Info, Save, X } from "lucide-react";
import { Course, dataStore } from "@/utils/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AboutPageProps {
  course: Course;
  facultyView: boolean;
  userId: string;
  onCourseDeleted: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({
  course,
  facultyView,
  userId,
  onCourseDeleted,
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState({
    name: course.name,
    code: course.code,
    description: "This is a sample course description. Faculty can edit this information to provide more details about the course, its objectives, and expectations.",
  });
  
  const handleDeleteCourse = () => {
    try {
      const success = dataStore.deleteCourse(course.id);
      
      if (success) {
        toast.success("Course deleted successfully!");
        setDeleteDialogOpen(false);
        onCourseDeleted();
      } else {
        toast.error("Failed to delete course. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to delete course. Please try again.");
    }
  };
  
  const handleEditCourse = () => {
    try {
      const updatedCourse = dataStore.updateCourse(course.id, {
        name: courseDetails.name,
        code: courseDetails.code,
      });
      
      if (updatedCourse) {
        toast.success("Course details updated successfully!");
        setIsEditModalOpen(false);
      } else {
        toast.error("Failed to update course details. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to update course details. Please try again.");
    }
  };
  
  const formatSchedule = (course: Course) => {
    return course.schedule.map((s) => {
      const day = s.day.charAt(0).toUpperCase() + s.day.slice(1);
      return `${day}: ${s.startTime} - ${s.endTime}`;
    }).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Info className="mr-2 h-5 w-5" />
            About This Course
          </h2>
          <p className="text-gray-500">Course details and information</p>
        </div>
        
        {facultyView && (
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="mr-1.5 h-4 w-4" />
              Edit Course
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete Course
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Basic details about the course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Course Name</h3>
              <p className="text-lg font-medium">{course.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Course Code</h3>
              <p className="text-lg font-medium">{course.code}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Course Description</h3>
              <p className="text-gray-700">{courseDetails.description}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Schedule</h3>
              <div className="flex items-center text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{formatSchedule(course)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>{course.schedule.length} class sessions per week</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
            <CardDescription>Student participation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-gray-700">Total Students</span>
              </div>
              <span className="font-medium">{course.students.length}</span>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created On</h3>
              <p className="text-gray-700">
                {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
          {facultyView && (
            <CardFooter className="bg-gray-50 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // In a real app, this would open a modal to manage students
                  toast.info("Student management would open here");
                }}
              >
                Manage Students
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone 
              and will remove all course materials, assignments, and student data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Course Modal */}
      {facultyView && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Course Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={courseDetails.name}
                  onChange={(e) =>
                    setCourseDetails({ ...courseDetails, name: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  value={courseDetails.code}
                  onChange={(e) =>
                    setCourseDetails({ ...courseDetails, code: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="courseDescription">Description</Label>
                <Textarea
                  id="courseDescription"
                  value={courseDetails.description}
                  onChange={(e) =>
                    setCourseDetails({
                      ...courseDetails,
                      description: e.target.value,
                    })
                  }
                  className="min-h-32"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Schedule</Label>
                <p className="text-sm text-gray-500">
                  To modify the course schedule, please contact the academic office.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditCourse}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AboutPage;
