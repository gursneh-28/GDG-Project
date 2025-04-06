
import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import CoursePageComponent from "@/components/faculty/CoursePage";

const CoursePage: React.FC = () => {
  const { user } = useAuth();
  const isFaculty = user?.role === "faculty";
  
  return <CoursePageComponent facultyView={isFaculty} />;
};

export default CoursePage;
