
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { isAuthenticated, isFaculty, isStudent } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (isFaculty) {
        navigate("/faculty-dashboard");
      } else if (isStudent) {
        navigate("/student-dashboard");
      }
    }
  }, [isAuthenticated, isFaculty, isStudent, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100 opacity-60 animate-float" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-blue-200 opacity-40 animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full bg-blue-100 opacity-50 animate-float" style={{ animationDelay: "2s" }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="glass p-8 rounded-xl shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Student-Faculty Portal</h1>
            <p className="text-gray-600 mt-2">Access your courses and learning materials</p>
          </div>
          
          {children}
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-4">
          &copy; {new Date().getFullYear()} University Learning Portal
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
