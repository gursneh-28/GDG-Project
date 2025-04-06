
import React from "react";
import Layout from "@/components/shared/Layout";
import DashboardPage from "@/components/faculty/DashboardPage";

const FacultyDashboard: React.FC = () => {
  return (
    <Layout title="Faculty Dashboard">
      <DashboardPage />
    </Layout>
  );
};

export default FacultyDashboard;
