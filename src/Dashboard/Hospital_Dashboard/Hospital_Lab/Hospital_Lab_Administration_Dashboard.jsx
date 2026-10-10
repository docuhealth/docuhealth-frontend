import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import toast from "react-hot-toast";
import { LabAppContext } from "../../../context/HospitalContext/Lab/LabAppContext";

import TestCatalogueTable from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/TestCatalogueTable";
import AddNewTestModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/AddNewTestModal";
import WorkflowReportSettings from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/WorkflowReportSettings";
import AuditLogsView from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/AuditLogsView";

const Hospital_Lab_Administration_Dashboard = () => {
  const { isLabAdmin, isLoading } = useContext(LabAppContext);
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("catalogue"); // "catalogue" | "reports_settings" | "audit_logs"
  const [isAddNewTestOpen, setIsAddNewTestOpen] = useState(false);
  const [createdTests, setCreatedTests] = useState([]);

  useEffect(() => {
    if (!isLoading && !isLabAdmin) {
      toast.error("Unauthorized. Only Lab Admin can access Lab Administration.");
      navigate("/hospital-lab-home-dashboard", { replace: true });
    }
  }, [isLabAdmin, isLoading, navigate]);

  if (!isLoading && !isLabAdmin) {
    return null;
  }

  const handleTestAdded = (newTest) => {
    setCreatedTests((prev) => [newTest, ...prev]);
  };

  if (activeView === "reports_settings") {
    return (
      <WorkflowReportSettings onBack={() => setActiveView("catalogue")} />
    );
  }

  if (activeView === "audit_logs") {
    return (
      <AuditLogsView onBack={() => setActiveView("catalogue")} />
    );
  }

  return (
    <>
      <div className="py-2 text-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-0 mb-4">
        <DynamicDate />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <button
            onClick={() => setActiveView("audit_logs")}
            className="py-2.5 px-6 sm:px-8 rounded-full text-docuhealth-primary border border-docuhealth-primary hover:bg-indigo-50 transition-colors cursor-pointer text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap"
          >
            Audit Logs
          </button>

          <button
            onClick={() => setIsAddNewTestOpen(true)}
            className="py-2.5 px-6 sm:px-8 rounded-full text-docuhealth-primary border border-docuhealth-primary hover:bg-indigo-50 transition-colors cursor-pointer text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap"
          >
            Add new test
          </button>

          <button
            onClick={() => setActiveView("reports_settings")}
            className="py-2.5 px-6 sm:px-8 rounded-full bg-docuhealth-primary border border-docuhealth-primary text-white hover:bg-docuhealth-dark-primary transition-colors cursor-pointer text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap"
          >
            Reports and workflow settings
          </button>
        </div>
      </div>

      {/* Main Test Catalogue Content */}
      <TestCatalogueTable
        extraTests={createdTests}
        onOpenAddTest={() => setIsAddNewTestOpen(true)}
      />

      {/* Add New Test Modal */}
      <AddNewTestModal
        isOpen={isAddNewTestOpen}
        onClose={() => setIsAddNewTestOpen(false)}
        onTestAdded={handleTestAdded}
      />
    </>
  );
};

export default Hospital_Lab_Administration_Dashboard;
