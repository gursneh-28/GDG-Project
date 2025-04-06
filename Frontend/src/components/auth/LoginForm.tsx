import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, GraduationCap, BookOpen } from "lucide-react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await signIn(email, password);
      
      if (user.role === "faculty") {
        navigate("/faculty-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      // Error is handled in the auth hook
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsFaculty = () => {
    setEmail("james.smith@example.edu");
    setPassword("password");
    toast.success("Faculty credentials set! Click 'Sign In' to continue.", {
      duration: 5000
    });
  };

  const loginAsStudent = () => {
    setEmail("alex.rodriguez@example.edu");
    setPassword("password");
    toast.success("Student credentials set! Click 'Sign In' to continue.", {
      duration: 5000
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="name@example.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
      
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">Quick Access Options</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center py-6 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
          onClick={loginAsFaculty}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="rounded-full bg-blue-100 p-3">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <span className="font-medium">Login as Faculty</span>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="w-full flex items-center justify-center py-6 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
          onClick={loginAsStudent}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="rounded-full bg-emerald-100 p-3">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="font-medium">Login as Student</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;