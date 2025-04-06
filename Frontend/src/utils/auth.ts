
import { toast } from "sonner";

// User types
export type UserRole = "faculty" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

// Mock authentication state
let currentUser: User | null = null;

// Mock user database
const users: User[] = [
  {
    id: "faculty-1",
    name: "Dr. James Smith",
    email: "james.smith@example.edu",
    role: "faculty",
    profileImage: "https://ui-avatars.com/api/?name=James+Smith&background=3b82f6&color=fff"
  },
  {
    id: "faculty-2",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.edu",
    role: "faculty",
    profileImage: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=fff"
  },
  {
    id: "student-1",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@example.edu",
    role: "student",
    profileImage: "https://ui-avatars.com/api/?name=Alex+Rodriguez&background=3b82f6&color=fff"
  },
  {
    id: "student-2",
    name: "Emily Chen",
    email: "emily.chen@example.edu",
    role: "student",
    profileImage: "https://ui-avatars.com/api/?name=Emily+Chen&background=3b82f6&color=fff"
  }
];

// Mock authentication functions
export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      
      // For demo purposes, we're not checking the password
      if (user) {
        currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 800);
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem('user');
      resolve();
    }, 300);
  });
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  
  return null;
};

export const useAuth = () => {
  const user = getCurrentUser();
  
  const signIn = async (email: string, password: string) => {
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      return user;
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
      throw error;
    }
  };
  
  const signOut = async () => {
    await logout();
    toast.success("Logged out successfully");
  };
  
  return {
    user,
    isAuthenticated: !!user,
    isFaculty: user?.role === "faculty",
    isStudent: user?.role === "student",
    signIn,
    signOut
  };
};
