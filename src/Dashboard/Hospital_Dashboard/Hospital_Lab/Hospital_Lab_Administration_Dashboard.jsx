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
  const { isLabAdmin = false, isLoading = false } = useContext(LabAppContext) || {};
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("catalogue"); // "catalogue" | "reports_settings" | "audit_logs"
  const [isAddNewTestOpen, setIsAddNewTestOpen] = useState(false);
  const [selectedTestToConfigure, setSelectedTestToConfigure] = useState(null);
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

  const handleOpenAddTest = (test = null) => {
    setSelectedTestToConfigure(test);
    setIsAddNewTestOpen(true);
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
      {/* Date and actions share a row only from xl; below that (sidebar takes 256px) the buttons drop under the date */}
      <div className="py-2 text-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 mb-4">
        <div className="whitespace-nowrap">
          <DynamicDate />
        </div>

        {/* Phones: the long settings button gets its own row, the two short ones share the row below */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end items-stretch sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <button
            onClick={() => setActiveView("reports_settings")}
            className="col-span-2 sm:order-last py-2.5 px-6 sm:px-8 rounded-full bg-docuhealth-primary border border-docuhealth-primary text-white hover:bg-docuhealth-dark-primary transition-colors cursor-pointer text-sm font-medium text-center whitespace-nowrap"
          >
            Reports and workflow settings
          </button>

          <button
            onClick={() => setActiveView("audit_logs")}
            className="py-2.5 px-4 sm:px-8 rounded-full text-docuhealth-primary border border-docuhealth-primary hover:bg-indigo-50 transition-colors cursor-pointer text-sm font-medium text-center whitespace-nowrap"
          >
            Audit Logs
          </button>

          <button
            onClick={() => handleOpenAddTest(null)}
            className="py-2.5 px-4 sm:px-8 rounded-full text-docuhealth-primary border border-docuhealth-primary hover:bg-indigo-50 transition-colors cursor-pointer text-sm font-medium text-center whitespace-nowrap"
          >
            Add new test
          </button>
        </div>
      </div>

      {/* Main Test Catalogue Content */}
      <TestCatalogueTable
        extraTests={createdTests}
        onOpenAddTest={() => handleOpenAddTest(null)}
        onConfigureTest={(test) => handleOpenAddTest(test)}
      />

      {/* Add New Test Modal */}
      <AddNewTestModal
        isOpen={isAddNewTestOpen}
        initialTest={selectedTestToConfigure}
        onClose={() => {
          setIsAddNewTestOpen(false);
          setSelectedTestToConfigure(null);
        }}
        onTestAdded={handleTestAdded}
      />
    </>
  );
};

export default Hospital_Lab_Administration_Dashboard;
