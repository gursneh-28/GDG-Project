
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import Header from "./Header";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
    setIsMounted(true);
  }, [isAuthenticated, navigate]);
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title={title} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className={`animate-fade-in ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
