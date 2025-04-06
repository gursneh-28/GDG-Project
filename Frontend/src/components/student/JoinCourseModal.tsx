
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface JoinCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseCode: string) => void;
}

const JoinCourseModal: React.FC<JoinCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [courseCode, setCourseCode] = useState("");

  const handleSubmit = () => {
    if (!courseCode.trim()) {
      return;
    }
    
    onSubmit(courseCode.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Join a Course</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code</Label>
            <Input
              id="courseCode"
              placeholder="e.g. CS101"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Enter the course code provided by your instructor to join the course.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Join Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinCourseModal;
