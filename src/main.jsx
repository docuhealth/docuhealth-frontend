import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { getHospitalRole, getRole } from "./services/authService.js";
import "./index.css";
import App from "./App.jsx";
import ProfileProvider from "./context/PatientContext/AppContext.jsx";
import SubAccountProvider from "./context/PatientContext/SubAccountContext.jsx";
import MedicalRecordsProvider from "./context/PatientContext/MedicalRecordsContext.jsx";
import DrugRecordsProvider from "./context/PatientContext/DrugRecordsContext.jsx";
import AppointmentsProvider from "./context/PatientContext/AppointmentsContext.jsx";
import IdCardProvider from "./context/PatientContext/IdCardContext.jsx";
import SubscriptionPlansProvider from "./context/PatientContext/SubscriptionsContext.jsx";



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
