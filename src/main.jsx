import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { getHospitalRole, getRole } from "./services/authService.js";
import "./index.css";
import App from "./App.jsx";
import ProfileProvider from "./context/Patient Context/AppContext.jsx";
import SubAccountProvider from "./context/Patient Context/SubAccountContext.jsx";
import MedicalRecordsProvider from "./context/Patient Context/MedicalRecordsContext.jsx";
import DrugRecordsProvider from "./context/Patient Context/DrugRecordsContext.jsx";
import AppointmentsProvider from "./context/Patient Context/AppointmentsContext.jsx";
import IdCardProvider from "./context/Patient Context/IdCardContext.jsx";
import SubscriptionPlansProvider from "./context/Patient Context/SubscriptionsContext.jsx";



const role = getRole(); 

const queryClient = new QueryClient();

const PatientProviders = ({ children }) => (
  <ProfileProvider>
    <IdCardProvider>
      <MedicalRecordsProvider>
        <DrugRecordsProvider>
        <SubAccountProvider>
          <AppointmentsProvider>
            <SubscriptionPlansProvider>{children}</SubscriptionPlansProvider>
          </AppointmentsProvider>
        </SubAccountProvider>
        </DrugRecordsProvider>
      </MedicalRecordsProvider>
    </IdCardProvider>
  </ProfileProvider>
);


const Root = () => {
  if (role === "patient") {
    return (
      <PatientProviders>
        <App />
      </PatientProviders>
    );
    
  } else {
    return <App />; // Fallback for login page etc.
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <Root />
    </QueryClientProvider>
  </StrictMode>
);
