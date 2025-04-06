
import React from "react";
import Layout from "@/components/shared/Layout";
import DashboardPage from "@/components/student/DashboardPage";

const StudentDashboard: React.FC = () => {
  return (
    <Layout title="Student Dashboard">
      <DashboardPage />
    </Layout>
  );
};

export default StudentDashboard;
