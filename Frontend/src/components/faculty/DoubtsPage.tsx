
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Check,
  MessageCircle,
  Plus,
  Send,
  Upload,
  Video,
  FileText,
  X,
  User,
  ArrowRight,
  EyeOff
} from "lucide-react";
import { Course, Doubt, dataStore } from "@/utils/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface DoubtsPageProps {
  course: Course;
  facultyView: boolean;
  userId: string;
}

const DoubtsPage: React.FC<DoubtsPageProps> = ({
  course,
  facultyView,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseFile, setResponseFile] = useState<File | null>(null);
  const [responseVideoUrl, setResponseVideoUrl] = useState("");
  const [responseType, setResponseType] = useState<"text" | "file" | "video">("text");
  
  // Student-specific state
  const [createDoubtModalOpen, setCreateDoubtModalOpen] = useState(false);
  const [doubtTitle, setDoubtTitle] = useState("");
  const [doubtDescription, setDoubtDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  useEffect(() => {
    loadDoubts();
  }, [course.id]);
  
  const loadDoubts = () => {
    const fetchedDoubts = dataStore.getDoubtsByCourseId(course.id);
    setDoubts(fetchedDoubts);
  };
  
  const handleAnswerDoubt = () => {
    if (!selectedDoubt) return;
    
    if (responseType === "text" && !responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }
    
    if (responseType === "file" && !responseFile) {
      toast.error("Please upload a file");
      return;
    }
    
    if (responseType === "video" && !responseVideoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }
    
    try {
      const updatedDoubt = dataStore.updateDoubt(selectedDoubt.id, {
        status: "answered",
        response: {
          text: responseType === "text" ? responseText : undefined,
          files: responseType === "file" && responseFile ? [URL.createObjectURL(responseFile)] : undefined,
          videoUrl: responseType === "video" ? responseVideoUrl : undefined,
          answeredAt: new Date().toISOString(),
        },
      });
      
      if (updatedDoubt) {
        setDoubts(
          doubts.map((doubt) =>
            doubt.id === selectedDoubt.id ? updatedDoubt : doubt
          )
        );
        setIsModalOpen(false);
        resetResponseForm();
        setSelectedDoubt(null);
        toast.success("Response submitted successfully!");
      }
    } catch (error) {
      toast.error("Failed to submit response. Please try again.");
    }
  };
  
  const handleCreateDoubt = () => {
    if (!doubtTitle.trim()) {
      toast.error("Please enter a title for your doubt");
      return;
    }
    
    if (!doubtDescription.trim()) {
      toast.error("Please describe your doubt");
      return;
    }
    
    try {
      const newDoubt = dataStore.createDoubt({
        courseId: course.id,
        studentId: userId,
        title: doubtTitle,
        description: doubtDescription,
        isAnonymous,
      });
      
      setDoubts([...doubts, newDoubt]);
      setCreateDoubtModalOpen(false);
      resetDoubtForm();
      toast.success("Your question has been submitted!");
    } catch (error) {
      toast.error("Failed to submit your question. Please try again.");
    }
  };
  
  const resetResponseForm = () => {
    setResponseText("");
    setResponseFile(null);
    setResponseVideoUrl("");
    setResponseType("text");
  };
  
  const resetDoubtForm = () => {
    setDoubtTitle("");
    setDoubtDescription("");
    setIsAnonymous(false);
  };
  
  const handleResponseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResponseFile(e.target.files[0]);
    }
  };
  
  const getFilteredDoubts = () => {
    let filtered = doubts;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doubt) =>
          doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doubt.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter === "open") {
      filtered = filtered.filter((doubt) => doubt.status === "open");
    } else if (statusFilter === "answered") {
      filtered = filtered.filter((doubt) => doubt.status === "answered");
    }
    
    // For students, only show their own doubts
    if (!facultyView) {
      filtered = filtered.filter(
        (doubt) => doubt.studentId === userId
      );
    }
    
    return filtered;
  };
  
  const getStudentName = (studentId: string, isAnonymous: boolean) => {
    if (isAnonymous) return "Anonymous Student";
    return `Student ${studentId.split("-")[1]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Doubts & Questions
          </h2>
          <p className="text-gray-500">
            {facultyView
              ? "View and answer student questions"
              : "Ask questions and view responses"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Questions</SelectItem>
              <SelectItem value="open">Unanswered</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {getFilteredDoubts().length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center bg-gray-50">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No questions yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {facultyView
              ? "No questions have been asked by students yet."
              : "You haven't asked any questions yet. Click the button below to ask your first question."}
          </p>
          {!facultyView && (
            <Button className="mt-6" onClick={() => setCreateDoubtModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ask a Question
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getFilteredDoubts().map((doubt) => (
            <Card
              key={doubt.id}
              className={`border overflow-hidden ${
                doubt.status === "open" && facultyView
                  ? "border-blue-200 bg-blue-50"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge
                    variant={doubt.status === "open" ? "outline" : "secondary"}
                    className={
                      doubt.status === "open"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-green-50 text-green-600 border-green-200"
                    }
                  >
                    {doubt.status === "open" ? "Unanswered" : "Answered"}
                  </Badge>
                  
                  {doubt.isAnonymous && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Anonymous
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{doubt.title}</CardTitle>
                <CardDescription>
                  Asked by {getStudentName(doubt.studentId, doubt.isAnonymous)} on{" "}
                  {new Date(doubt.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{doubt.description}</p>
                
                {doubt.status === "answered" && doubt.response && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <ArrowRight className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                      Faculty Response
                    </h4>
                    {doubt.response.text && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {doubt.response.text}
                      </p>
                    )}
                    {doubt.response.files && doubt.response.files.length > 0 && (
                      <div className="mt-2 flex items-center bg-gray-50 p-2 rounded-md">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          Attached document
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                        >
                          View
                        </Button>
                      </div>
                    )}
                    {doubt.response.videoUrl && (
                      <div className="mt-2 flex items-center bg-gray-50 p-2 rounded-md">
                        <Video className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          Video explanation
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                        >
                          Watch
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-3">
                {facultyView && doubt.status === "open" ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedDoubt(doubt);
                      setIsModalOpen(true);
                    }}
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Answer Question
                  </Button>
                ) : (
                  <p className="text-xs text-gray-500">
                    {doubt.status === "answered" && doubt.response
                      ? `Answered on ${new Date(doubt.response.answeredAt).toLocaleDateString()}`
                      : "Waiting for faculty response"}
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {!facultyView && (
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 z-10"
          size="icon"
          onClick={() => setCreateDoubtModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      
      {/* Faculty Answer Question Modal */}
      {facultyView && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Answer Student Question</DialogTitle>
            </DialogHeader>
            
            {selectedDoubt && (
              <div className="py-4 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{selectedDoubt.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Asked by{" "}
                        {getStudentName(selectedDoubt.studentId, selectedDoubt.isAnonymous)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-600 border-blue-200"
                    >
                      Unanswered
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm">{selectedDoubt.description}</p>
                </div>
                
                <div className="space-y-4">
                  <Tabs
                    defaultValue="text"
                    value={responseType}
                    onValueChange={(v) => setResponseType(v as "text" | "file" | "video")}
                  >
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="text">Text Response</TabsTrigger>
                      <TabsTrigger value="file">File Attachment</TabsTrigger>
                      <TabsTrigger value="video">Video Explanation</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-4">
                      <Label htmlFor="responseText">Your Response</Label>
                      <Textarea
                        id="responseText"
                        placeholder="Type your answer here..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="min-h-32"
                      />
                    </TabsContent>
                    
                    <TabsContent value="file" className="space-y-4">
                      <Label>Upload Document</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                        {responseFile ? (
                          <div className="w-full flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-2">
                              <span className="text-sm font-medium truncate max-w-[180px]">
                                {responseFile.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setResponseFile(null)}
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              {(responseFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">
                              Upload a document for your response
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
                                onChange={handleResponseFileChange}
                              />
                            </label>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="video" className="space-y-4">
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <div className="space-y-2">
                        <Input
                          id="videoUrl"
                          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                          value={responseVideoUrl}
                          onChange={(e) => setResponseVideoUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Paste a link to a video explanation you've created
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAnswerDoubt}>
                <Send className="mr-1.5 h-4 w-4" />
                Submit Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Student Ask Question Modal */}
      {!facultyView && (
        <Dialog open={createDoubtModalOpen} onOpenChange={setCreateDoubtModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="doubtTitle">Title</Label>
                <Input
                  id="doubtTitle"
                  placeholder="What's your question about?"
                  value={doubtTitle}
                  onChange={(e) => setDoubtTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doubtDescription">Description</Label>
                <Textarea
                  id="doubtDescription"
                  placeholder="Provide more details about your question..."
                  className="min-h-32"
                  value={doubtDescription}
                  onChange={(e) => setDoubtDescription(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous-mode"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous-mode" className="text-sm">
                  Submit anonymously
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateDoubt}>
                <Send className="mr-1.5 h-4 w-4" />
                Submit Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DoubtsPage;
