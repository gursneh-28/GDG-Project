
import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  File,
  Filter,
  Download,
  Trash2,
  Edit,
  Save,
  X,
  FileQuestion,
  FileArchive,
  FileImage,
  FileCode,
  FileAudio,
  FileVideo,
  Upload,
  Search
} from "lucide-react";
import { Course, CourseFile, dataStore } from "@/utils/data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface FilesPageProps {
  course: Course;
  facultyView: boolean;
  userId: string;
}

const FilesPage: React.FC<FilesPageProps> = ({
  course,
  facultyView,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<string>("all");
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFile, setEditingFile] = useState<CourseFile | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CourseFile | null>(null);
  
  useEffect(() => {
    loadFiles();
  }, [course.id]);
  
  const loadFiles = () => {
    const fetchedFiles = dataStore.getFilesByCourseId(course.id);
    setFiles(fetchedFiles);
  };
  
  const handleCreateFile = () => {
    if (!fileName.trim()) {
      toast.error("File name is required");
      return;
    }
    
    if (!fileToUpload) {
      toast.error("Please upload a file");
      return;
    }
    
    try {
      const newFile = dataStore.createFile({
        courseId: course.id,
        name: fileName,
        url: URL.createObjectURL(fileToUpload),
        type: getFileType(fileToUpload.name),
        description: fileDescription,
        uploadedBy: userId,
      });
      
      setFiles([...files, newFile]);
      resetForm();
      setIsModalOpen(false);
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
    }
  };
  
  const handleUpdateFile = () => {
    if (!editingFile) return;
    
    if (!fileName.trim()) {
      toast.error("File name is required");
      return;
    }
    
    try {
      const updatedFile = dataStore.updateFile(editingFile.id, {
        name: fileName,
        description: fileDescription,
        // File URL doesn't change unless a new file is uploaded
        url: fileToUpload ? URL.createObjectURL(fileToUpload) : editingFile.url,
        type: fileToUpload ? getFileType(fileToUpload.name) : editingFile.type,
      });
      
      if (updatedFile) {
        setFiles(files.map((file) => 
          file.id === editingFile.id ? updatedFile : file
        ));
        resetForm();
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingFile(null);
        toast.success("File updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update file. Please try again.");
    }
  };
  
  const handleEditFile = (file: CourseFile) => {
    setEditingFile(file);
    setFileName(file.name);
    setFileDescription(file.description || "");
    setIsEditMode(true);
    setIsModalOpen(true);
  };
  
  const handleDeleteFile = (file: CourseFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteFile = () => {
    if (!fileToDelete) return;
    
    try {
      const success = dataStore.deleteFile(fileToDelete.id);
      
      if (success) {
        setFiles(files.filter((file) => file.id !== fileToDelete.id));
        setDeleteDialogOpen(false);
        setFileToDelete(null);
        toast.success("File deleted successfully!");
      } else {
        toast.error("Failed to delete file. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to delete file. Please try again.");
    }
  };
  
  const resetForm = () => {
    setFileName("");
    setFileDescription("");
    setFileToUpload(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (isEditMode) {
        setFileToUpload(selectedFile);
      } else {
        setFileToUpload(selectedFile);
        
        // Auto-fill the file name if it's not already set
        if (!fileName) {
          setFileName(selectedFile.name);
        }
      }
    }
  };
  
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-10 w-10 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-10 w-10 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText className="h-10 w-10 text-green-500" />;
      case "ppt":
      case "pptx":
        return <FileText className="h-10 w-10 text-orange-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="h-10 w-10 text-purple-500" />;
      case "mp3":
      case "wav":
        return <FileAudio className="h-10 w-10 text-pink-500" />;
      case "mp4":
      case "avi":
      case "mov":
        return <FileVideo className="h-10 w-10 text-indigo-500" />;
      case "zip":
      case "rar":
        return <FileArchive className="h-10 w-10 text-yellow-500" />;
      case "html":
      case "css":
      case "js":
        return <FileCode className="h-10 w-10 text-cyan-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };
  
  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop() || "";
    return extension.toLowerCase();
  };
  
  const getFilteredFiles = () => {
    let filtered = files;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by type
    if (filterOption !== "all") {
      filtered = filtered.filter((file) => file.type === filterOption);
    }
    
    return filtered;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Course Files
          </h2>
          <p className="text-gray-500">
            {facultyView
              ? "Upload and manage course materials"
              : "Access course materials and resources"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
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
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="doc">Word</SelectItem>
              <SelectItem value="ppt">PowerPoint</SelectItem>
              <SelectItem value="xls">Excel</SelectItem>
              <SelectItem value="zip">Archives</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {files.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center bg-gray-50">
          <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No files yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {facultyView
              ? "You haven't uploaded any files yet. Click the button below to upload your first file."
              : "No course materials have been uploaded yet."}
          </p>
          {facultyView && (
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  File
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                >
                  Uploaded
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredFiles().map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">
                          {file.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    <div className="line-clamp-2 max-w-md">
                      {file.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap hidden sm:table-cell">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {facultyView && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditFile(file)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFile(file)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {facultyView && (
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 z-10"
          size="icon"
          onClick={() => {
            setIsEditMode(false);
            setEditingFile(null);
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      
      {/* Upload/Edit File Modal */}
      {facultyView && (
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setIsEditMode(false);
              setEditingFile(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit File" : "Upload New File"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  placeholder="Enter file name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileDescription">Description (Optional)</Label>
                <Textarea
                  id="fileDescription"
                  placeholder="Provide a brief description..."
                  className="min-h-20"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                  {(fileToUpload || (isEditMode && editingFile)) ? (
                    <div className="w-full flex flex-col items-center">
                      {fileToUpload ? (
                        <>
                          <div className="flex items-center justify-center mb-4">
                            {getFileIcon(getFileType(fileToUpload.name))}
                          </div>
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className="text-sm font-medium truncate max-w-[180px]">
                              {fileToUpload.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setFileToUpload(null)}
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            {(fileToUpload.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : isEditMode && editingFile ? (
                        <>
                          <div className="flex items-center justify-center mb-4">
                            {getFileIcon(editingFile.type)}
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {editingFile.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            Current file
                          </p>
                          <label>
                            <Button size="sm" variant="outline" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-1" />
                                Replace File
                              </span>
                            </Button>
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">Upload file</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, PowerPoint, Excel, etc.
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
              <Button onClick={isEditMode ? handleUpdateFile : handleCreateFile}>
                {isEditMode ? "Update File" : "Upload File"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {fileToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FilesPage;
