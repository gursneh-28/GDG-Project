
import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

const Index: React.FC = () => {
  return (
    <AuthLayout>
      <div className="mb-6">
        
      </div>
      <LoginForm />
    </AuthLayout>
  );
};

export default Index;
