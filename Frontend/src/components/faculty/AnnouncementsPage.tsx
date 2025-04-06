
import React, { useState, useEffect } from "react";
import {
  Plus,
  Bell,
  Search,
  Calendar,
  Megaphone,
  ChevronDown,
  Check,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  BellRing
} from "lucide-react";
import { Course, Announcement, dataStore } from "@/utils/data";
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

interface AnnouncementsPageProps {
  course: Course;
  facultyView: boolean;
  userId: string;
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  course,
  facultyView,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<string>("all");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  
  useEffect(() => {
    loadAnnouncements();
  }, [course.id]);
  
  const loadAnnouncements = () => {
    const fetchedAnnouncements = dataStore.getAnnouncementsByCourseId(course.id);
    setAnnouncements(fetchedAnnouncements);
  };
  
  const handleCreateAnnouncement = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    
    try {
      const newAnnouncement = dataStore.createAnnouncement({
        courseId: course.id,
        title,
        content,
        createdBy: userId,
      });
      
      setAnnouncements([...announcements, newAnnouncement]);
      resetForm();
      setIsModalOpen(false);
      toast.success("Announcement published successfully!");
    } catch (error) {
      toast.error("Failed to create announcement. Please try again.");
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingAnnouncement(null);
  };
  
  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteAnnouncement = () => {
    if (!announcementToDelete) return;
    
    // In a real app, this would call an API to delete the announcement
    setAnnouncements(
      announcements.filter((a) => a.id !== announcementToDelete.id)
    );
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
    toast.success("Announcement deleted successfully!");
  };
  
  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsModalOpen(true);
  };
  
  const getFilteredAnnouncements = () => {
    let filtered = announcements;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by date, newest first
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return filtered;
  };
  
  const getAnnouncementTypeIcon = (title: string) => {
    // Simple logic to determine the type of announcement based on the title
    const lowercaseTitle = title.toLowerCase();
    
    if (lowercaseTitle.includes("cancel") || lowercaseTitle.includes("urgent")) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else if (lowercaseTitle.includes("reminder")) {
      return <BellRing className="h-5 w-5 text-orange-500" />;
    } else if (lowercaseTitle.includes("update")) {
      return <Info className="h-5 w-5 text-blue-500" />;
    } else {
      return <Megaphone className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Announcements
          </h2>
          <p className="text-gray-500">
            {facultyView
              ? "Create and manage announcements for students"
              : "View important announcements from faculty"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search announcements..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {announcements.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center bg-gray-50">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No announcements yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {facultyView
              ? "You haven't made any announcements yet. Click the button below to create your first announcement."
              : "No announcements have been made for this course yet."}
          </p>
          {facultyView && (
            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {getFilteredAnnouncements().map((announcement, index) => (
            <Card key={announcement.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {getAnnouncementTypeIcon(announcement.title)}
                    <CardTitle className="ml-2">{announcement.title}</CardTitle>
                  </div>
                  
                  {facultyView && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAnnouncement(announcement)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {facultyView && (
        <Button
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 z-10"
          size="icon"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
      
      {/* Create/Edit Announcement Modal */}
      {facultyView && (
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement here..."
                  className="min-h-32"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateAnnouncement}>
                {editingAnnouncement ? "Update" : "Publish"} Announcement
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
              This will permanently delete this announcement. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAnnouncement} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AnnouncementsPage;
