
import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Clock,
  Search,
  Calendar,
  Upload,
  Download,
  CheckCircle,
  X,
  Edit,
  CalendarDays,
  Users,
  PlusCircle,
  Loader2
} from "lucide-react";
import { Course, Assignment, AssignmentSubmission, dataStore } from "@/utils/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Card,
  CardContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AssignmentsPageProps {
  course: Course;
  facultyView: boolean;
  userId: string;
}

const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
  course,
  facultyView,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<string>("all");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentPoints, setAssignmentPoints] = useState(10);
  const [publishOption, setPublishOption] = useState<string>("now");
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() + 7))
  );
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [viewSubmissionDialogOpen, setViewSubmissionDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState<number>(0);

  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submissionComment, setSubmissionComment] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  
  useEffect(() => {
    loadAssignments();
  }, [course.id]);
  
  const loadAssignments = () => {
    const fetchedAssignments = dataStore.getAssignmentsByCourseId(course.id);
    setAssignments(fetchedAssignments);
  };
  
  const handleCreateAssignment = () => {
    if (!assignmentTitle.trim()) {
      toast.error("Assignment title is required");
      return;
    }
    
    if (assignmentPoints <= 0) {
      toast.error("Points must be greater than 0");
      return;
    }
    
    try {
      const newAssignment = dataStore.createAssignment({
        courseId: course.id,
        title: assignmentTitle,
        description: assignmentDescription,
        points: assignmentPoints,
        dueDate: dueDate.toISOString(),
        publishDate: publishOption === "now" ? new Date().toISOString() : publishDate.toISOString(),
        files: assignmentFile ? [URL.createObjectURL(assignmentFile)] : [],
      });
      
      setAssignments([...assignments, newAssignment]);
      resetForm();
      setIsModalOpen(false);
      toast.success("Assignment created successfully!");
    } catch (error) {
      toast.error("Failed to create assignment. Please try again.");
    }
  };
  
  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const fetchedSubmissions = dataStore.getSubmissionsByAssignmentId(assignment.id);
    setSubmissions(fetchedSubmissions);
  };
  
  const handleViewSubmission = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || "");
    setViewSubmissionDialogOpen(true);
  };
  
  const handleGradeSubmission = () => {
    if (!selectedSubmission) return;
    
    try {
      dataStore.updateSubmission(selectedSubmission.id, {
        grade,
        feedback,
      });
      
      // Update the submissions array
      setSubmissions(
        submissions.map((sub) =>
          sub.id === selectedSubmission.id
            ? { ...sub, grade, feedback }
            : sub
        )
      );
      
      setViewSubmissionDialogOpen(false);
      toast.success("Submission graded successfully!");
    } catch (error) {
      toast.error("Failed to grade submission. Please try again.");
    }
  };
  
  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionDialogOpen(true);
  };
  
  const handleCreateSubmission = () => {
    if (!selectedAssignment) return;
    
    if (!submissionFile) {
      toast.error("Please upload a file");
      return;
    }
    
    try {
      dataStore.createSubmission({
        assignmentId: selectedAssignment.id,
        studentId: userId,
        submissionDate: new Date().toISOString(),
        files: submissionFile ? [URL.createObjectURL(submissionFile)] : [],
        comment: submissionComment,
      });
      
      setSubmissionDialogOpen(false);
      setSubmissionComment("");
      setSubmissionFile(null);
      toast.success("Assignment submitted successfully!");
      loadAssignments();
    } catch (error) {
      toast.error("Failed to submit assignment. Please try again.");
    }
  };
  
  const resetForm = () => {
    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentPoints(10);
    setPublishOption("now");
    setPublishDate(new Date());
    setDueDate(new Date(new Date().setDate(new Date().getDate() + 7)));
    setAssignmentFile(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAssignmentFile(e.target.files[0]);
    }
  };
  
  const handleSubmissionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };
  
  const handlePublishAllGrades = () => {
    // In a real app, this would update all submissions to be visible to students
    toast.success("All grades published successfully!");
  };
  
  const getFilteredAssignments = () => {
    let filtered = assignments;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterOption === "published") {
      filtered = filtered.filter(
        (assignment) => new Date(assignment.publishDate) <= new Date()
      );
    } else if (filterOption === "upcoming") {
      filtered = filtered.filter(
        (assignment) => new Date(assignment.publishDate) > new Date()
      );
    } else if (filterOption === "past") {
      filtered = filtered.filter(
        (assignment) => new Date(assignment.dueDate) < new Date()
      );
    }
    
    return filtered;
  };
  
  const isSubmitted = (assignmentId: string) => {
    return !!dataStore.getSubmissionByStudentAndAssignment(userId, assignmentId);
  };
  
  const getSubmissionStatus = (assignment: Assignment) => {
    const submission = dataStore.getSubmissionByStudentAndAssignment(userId, assignment.id);
    
    if (!submission) {
      if (new Date(assignment.dueDate) < new Date()) {
        return "missed";
      }
      return "pending";
    }
    
    if (submission.grade !== undefined) {
      return "graded";
    }
    
    return "submitted";
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case "submitted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Submitted</Badge>;
      case "graded":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Graded</Badge>;
      case "missed":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Missed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Assignments
          </h2>
          <p className="text-gray-500">
            {facultyView
              ? "Create and manage assignments for students"
              : "View and submit your assignments"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assignments..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={filterOption}
            onValueChange={setFilterOption}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past Due</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {assignments.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No assignments yet</h3>
            <p className="text-gray-500 text-center max-w-md mt-1">
              {facultyView
                ? "You haven't created any assignments yet. Click the button below to create your first assignment."
                : "No assignments have been posted for this course yet."}
            </p>
            {facultyView && (
              <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredAssignments().map((assignment) => (
            <Card
              key={assignment.id}
              className="card-hover overflow-hidden border border-gray-200"
            >
              <div className="h-2 bg-primary" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className="mb-1">
                    {assignment.points} {assignment.points === 1 ? "point" : "points"}
                  </Badge>
                  
                  {!facultyView && getStatusBadge(getSubmissionStatus(assignment))}
                </div>
                <CardTitle className="line-clamp-1">{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {assignment.description}
                </p>
                
                <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span>
                      {new Date(assignment.dueDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  
                  {facultyView && (
                    <div className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span>
                        {dataStore.getSubmissionsByAssignmentId(assignment.id).length} /{" "}
                        {course.students.length} submitted
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-3 flex justify-between">
                {facultyView ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewSubmissions(assignment)}
                  >
                    View Submissions
                  </Button>
                ) : (
                  <Button
                    variant={isSubmitted(assignment.id) ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleSubmitAssignment(assignment)}
                    disabled={
                      getSubmissionStatus(assignment) === "graded" ||
                      getSubmissionStatus(assignment) === "missed"
                    }
                  >
                    {getSubmissionStatus(assignment) === "pending" && (
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {getSubmissionStatus(assignment) === "submitted" && (
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {getSubmissionStatus(assignment) === "graded" && (
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {getSubmissionStatus(assignment) === "missed" && (
                      <X className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {getSubmissionStatus(assignment) === "pending" && "Submit"}
                    {getSubmissionStatus(assignment) === "submitted" && "Edit Submission"}
                    {getSubmissionStatus(assignment) === "graded" && "Graded"}
                    {getSubmissionStatus(assignment) === "missed" && "Missed"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {facultyView && (
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 z-10"
          size="icon"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      
      {/* Create Assignment Modal */}
      {facultyView && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="Week 1 Assignment"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide assignment details and instructions..."
                  className="min-h-24"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={assignmentPoints}
                  onChange={(e) => setAssignmentPoints(parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Publish</Label>
                <RadioGroup
                  value={publishOption}
                  onValueChange={setPublishOption}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="publish-now" />
                    <Label htmlFor="publish-now">Publish now</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="publish-scheduled" />
                    <Label htmlFor="publish-scheduled">Schedule for later</Label>
                  </div>
                </RadioGroup>
                
                {publishOption === "scheduled" && (
                  <div className="ml-6 pt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto justify-start text-left font-normal"
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {publishDate ? (
                            format(publishDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={publishDate}
                          onSelect={(date) => date && setPublishDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Attachment (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                  {assignmentFile ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {assignmentFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAssignmentFile(null)}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(assignmentFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">
                        Upload assignment file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, or other document formats
                      </p>
                      <label className="mt-4">
                        <Button size="sm" asChild>
                          <span>
                            <Plus className="h-4 w-4 mr-1" />
                            Select File
                          </span>
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateAssignment}>Create Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* View Submissions Dialog */}
      {facultyView && selectedAssignment && (
        <Dialog
          open={!!submissions.length}
          onOpenChange={() => setSelectedAssignment(null)}
        >
          <DialogContent className="sm:max-w-[750px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedAssignment.title} - Submissions</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-500">
                    {submissions.length} of {course.students.length} students submitted
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePublishAllGrades}
                  disabled={submissions.length === 0}
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Publish All Grades
                </Button>
              </div>
              
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submission Date
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                {submission.studentId.split("-")[1]}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  Student {submission.studentId.split("-")[1]}
                                </div>
                                {submission.comment && (
                                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    "{submission.comment}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.submissionDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            {submission.grade !== undefined ? (
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                Graded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                                Ungraded
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            {submission.grade !== undefined ? (
                              <span>
                                {submission.grade} / {selectedAssignment.points}
                              </span>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSubmission(submission)}
                              className="text-primary hover:text-primary/80"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* View Submission Dialog */}
      {facultyView && selectedSubmission && (
        <Dialog open={viewSubmissionDialogOpen} onOpenChange={setViewSubmissionDialogOpen}>
          <DialogContent className="sm:max-w-[650px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Student Submission</DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    Student {selectedSubmission.studentId.split("-")[1]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted on{" "}
                    {new Date(selectedSubmission.submissionDate).toLocaleString()}
                  </p>
                </div>
                
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-4 w-4" />
                  Download
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Submission Files</h4>
                <div className="flex flex-col gap-2">
                  {selectedSubmission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          Assignment-{selectedSubmission.studentId.split("-")[1]}.pdf
                        </span>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedSubmission.comment && (
                <div>
                  <h4 className="font-medium mb-2">Student Comment</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm">{selectedSubmission.comment}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="font-medium">Grade Submission</h4>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="grade" className="min-w-20">
                    Points
                  </Label>
                  <div className="flex items-center">
                    <Input
                      id="grade"
                      type="number"
                      min={0}
                      max={selectedAssignment?.points || 100}
                      value={grade}
                      onChange={(e) => setGrade(parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      / {selectedAssignment?.points || 100}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Label htmlFor="feedback" className="min-w-20 pt-2">
                    Feedback
                  </Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide feedback to the student..."
                    className="flex-1 min-h-24"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleGradeSubmission}>Save Grade</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Student Submit Assignment Dialog */}
      {!facultyView && selectedAssignment && (
        <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Due: {new Date(selectedAssignment.dueDate).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Your Work</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                  {submissionFile ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-sm font-medium truncate max-w-[180px]">
                          {submissionFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSubmissionFile(null)}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(submissionFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">
                        Upload your assignment
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, or other document formats
                      </p>
                      <label className="mt-4">
                        <Button size="sm" asChild>
                          <span>
                            <Plus className="h-4 w-4 mr-1" />
                            Select File
                          </span>
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleSubmissionFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Add a comment to your submission..."
                  className="min-h-24"
                  value={submissionComment}
                  onChange={(e) => setSubmissionComment(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateSubmission}>Submit Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AssignmentsPage;
