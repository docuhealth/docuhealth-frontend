import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Welcome from "./WelcomePage/Welcome";
import HLP from "./Hospital Login Page/HLP";
import HSI from "./Hospital Login Page/Hospital Sign In/HSI";
import ULP from "./User Login Page/ULP";
import FP from "./Hospital Login Page/Forgot Passoword/FP";
import NotFound from './Not Found/NotFound'; 
import VerifyOTP from "./Hospital Login Page/OTP/VerifyOTP";
import NP from "./Hospital Login Page/NewPassword/NP";
import ConfirmAcct from "./WelcomePage/ConfirmAcct";
import HomeDashboard from "./Hospital Dashboard/HomeDashboard";
import PatientsDashboard from "./Hospital Dashboard/PatientsDashboard";
import SettingsDashboard from "./Hospital Dashboard/SettingsDashboard";
import SubscriptionsDashboard from "./Hospital Dashboard/SubscriptionsDashboard";
import LogOutDashboard from "./Hospital Dashboard/LogOutDashboard";
import USI from "./User Login Page/User Sign In/USI";
import FPU from "./User Login Page/Forget Password/FPU";
import VerifyOTPUser from './User Login Page/Verify OTP/VerifyOTPUser';
import NPU from "./User Login Page/NewPassword/NPU";
import UserHomeDashboard from "./User Dashboard/UserHomeDashboard";
import UserSubAcctDashboard from './User Dashboard/UserSubAcctDashboard';
import SAU from "./User Login Page/Sub Account Upgrade/SAU";
import UserSettingsDashboard from "./User Dashboard/UserSettingsDashboard";
import UserSubscriptionsDashboard from "./User Dashboard/UserSubscriptionsDashboard";
import UserLogoutDashboard from './User Dashboard/UserLogoutDasboard';
import AdminHomeDashboard from "./Admin Dashboard/AdminHomeDashboard";
import AdminUsersDashboard from './Admin Dashboard/AdminUsersDashboard';
import AdminSettingsDashboard from './Admin Dashboard/AdminSettingsDashboard';
import AdminSubscriptionDashboard from './Admin Dashboard/AdminSubscriptionsdashboard';
import AdminLogoutDashboard from "./Admin Dashboard/AdminLogOutDashboard";

function App() {
  return (
    <Router>
      {/* Toast Notification Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/confirm-account" element={<ConfirmAcct />} />
        <Route path="/hospital-create-account" element={<HLP />} />
        <Route path="/hospital-login" element={<HSI />} />
        <Route path="/hospital-forgot-password" element={<FP />} />
        <Route path="/hospital-verify-otp" element={<VerifyOTP />} />
        <Route path="/hospital-set-new-password" element={<NP />} />
        <Route path="/hospital-home-dashboard" element={<HomeDashboard />} />
        <Route path="/hospital-patients-dashboard" element={<PatientsDashboard />} />
        <Route path="/hospital-settings-dashboard" element={<SettingsDashboard />} />
        <Route path="/hospital-subscriptions-dashboard" element={<SubscriptionsDashboard />} />
        <Route path="/hospital-logout-dashboard" element={<LogOutDashboard />} />
        <Route path="/user-create-account" element={<ULP />} />
        <Route path="/user-login" element={<USI />} />
        <Route path="/user-forgot-password" element={<FPU />} />
        <Route path="/user-verify-otp" element={<VerifyOTPUser />} />
        <Route path="/user-set-new-password" element={<NPU />} />
        <Route path="/user-home-dashboard" element={<UserHomeDashboard />} />
        <Route path="/user-sub-account" element={<UserSubAcctDashboard />} />
        <Route path="/user-sub-account-upgrade" element={<SAU />} />
        <Route path="/user-settings-dashboard" element={<UserSettingsDashboard />} />
        <Route path="/user-subscriptions-dashboard" element={<UserSubscriptionsDashboard />} />
        <Route path="/user-logout-dashboard" element={< UserLogoutDashboard />} />
        <Route path="/admin-home-dashboard" element={< AdminHomeDashboard />} />
        <Route path="/admin-users-dashboard" element={< AdminUsersDashboard />} />
        <Route path="/admin-settings-dashboard" element={< AdminSettingsDashboard />} />
        <Route path="/admin-subscriptions-dashboard" element={< AdminSubscriptionDashboard />} />
        <Route path="/admin-logout-dashboard" element={< AdminLogoutDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
