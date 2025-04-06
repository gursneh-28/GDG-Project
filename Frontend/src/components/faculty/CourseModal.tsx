
import React, { useState } from "react";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { ClassSchedule } from "@/utils/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code: string;
    facultyId: string;
    schedule: ClassSchedule[];
    students: string[];
  }) => void;
  facultyId: string;
}

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const timeSlots: TimeSlot[] = [
  { startTime: "08:00", endTime: "09:30" },
  { startTime: "10:00", endTime: "11:30" },
  { startTime: "12:00", endTime: "13:30" },
  { startTime: "14:00", endTime: "15:30" },
  { startTime: "16:00", endTime: "17:30" },
  { startTime: "18:00", endTime: "19:30" },
];

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  facultyId,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({});
  const [dayTimeSlots, setDayTimeSlots] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  const handleDayChange = (day: string, checked: boolean) => {
    setSelectedDays({ ...selectedDays, [day]: checked });
    if (!checked) {
      const newDayTimeSlots = { ...dayTimeSlots };
      delete newDayTimeSlots[day];
      setDayTimeSlots(newDayTimeSlots);
    }
  };

  const handleTimeSlotChange = (day: string, value: string) => {
    setDayTimeSlots({ ...dayTimeSlots, [day]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
          selectedFile.type !== "application/vnd.ms-excel" &&
          !selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload an Excel or CSV file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Course name is required");
      return;
    }
    
    if (!code.trim()) {
      toast.error("Course code is required");
      return;
    }
    
    const selectedDaysList = Object.entries(selectedDays)
      .filter(([_, selected]) => selected)
      .map(([day]) => day);
      
    if (selectedDaysList.length === 0) {
      toast.error("Please select at least one class day");
      return;
    }
    
    for (const day of selectedDaysList) {
      if (!dayTimeSlots[day]) {
        toast.error(`Please select a time slot for ${day}`);
        return;
      }
    }
    
    if (!file) {
      toast.error("Please upload a student list file");
      return;
    }
    
    const schedule = selectedDaysList.map(day => {
      const [startTime, endTime] = dayTimeSlots[day].split("-");
      return {
        day: day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
        startTime,
        endTime
      };
    });
    
    // For demo purposes, we're just creating an empty student array
    // In a real app, this would parse the Excel file
    onSubmit({
      name,
      code,
      facultyId,
      schedule,
      students: ["student-1", "student-2"] // Mock students
    });
    
    // Reset form
    setName("");
    setCode("");
    setSelectedDays({});
    setDayTimeSlots({});
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              placeholder="Introduction to Computer Science"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Course Code</Label>
            <Input
              id="code"
              placeholder="CS101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Class Days</Label>
            <div className="grid grid-cols-2 gap-4">
              {days.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays[day] || false}
                    onCheckedChange={(checked) =>
                      handleDayChange(day, checked === true)
                    }
                  />
                  <Label htmlFor={day} className="capitalize">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {Object.entries(selectedDays)
            .filter(([_, selected]) => selected)
            .map(([day]) => (
              <div key={`time-${day}`} className="space-y-2">
                <Label htmlFor={`time-${day}`} className="capitalize">
                  {day} Time Slot
                </Label>
                <Select
                  value={dayTimeSlots[day] || ""}
                  onValueChange={(value) => handleTimeSlotChange(day, value)}
                >
                  <SelectTrigger id={`time-${day}`}>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {timeSlots.map((slot) => (
                        <SelectItem
                          key={`${day}-${slot.startTime}`}
                          value={`${slot.startTime}-${slot.endTime}`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ))}
          
          <div className="space-y-2">
            <Label>Student List</Label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
              {file ? (
                <div className="w-full flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-sm font-medium truncate max-w-[180px]">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFile(null)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">
                    Upload student list
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Excel or CSV file with student emails
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
                      accept=".xlsx,.xls,.csv"
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
          <Button onClick={handleSubmit}>Create Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseModal;
