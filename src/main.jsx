import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ProfileProvider from "./context/Patient Context/AppContext.jsx";
import SubAccountProvider from "./context/Patient Context/SubAccountContext.jsx";
import MedicalRecordsProvider from "./context/Patient Context/MedicalRecordsContext.jsx";
import AppointmentsProvider from "./context/Patient Context/AppointmentsContext.jsx";
import IdCardProvider from "./context/Patient Context/IdCardContext.jsx";
import SubscriptionPlansProvider from "./context/Patient Context/SubscriptionsContext.jsx";

createRoot(document.getElementById("root")).render(
  <ProfileProvider>
    <IdCardProvider>
      <MedicalRecordsProvider>
        <SubAccountProvider>
          <AppointmentsProvider>
            <SubscriptionPlansProvider>
              <App />
            </SubscriptionPlansProvider>
          </AppointmentsProvider>
        </SubAccountProvider>
      </MedicalRecordsProvider>
    </IdCardProvider>
  </ProfileProvider>
);
