import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./LandingPage/Home";
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
import ProtectedRouteHospital from "./Protected Route/ProtectedRouteHospital";
import UserProtectedRoute from "./User Protected Route/UserProtectedRoute";

function App() {
  return (
    <Router>
      {/* Toast Notification Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/confirm-account" element={<ConfirmAcct />} />
        <Route path="/hospital-create-account" element={<HLP />} />
        <Route path="/hospital-login" element={<HSI />} />
        <Route path="/hospital-forgot-password" element={<FP />} />
        <Route path="/hospital-verify-otp" element={<VerifyOTP />} />
        <Route path="/hospital-set-new-password" element={<NP />} />
        <Route path="/hospital-home-dashboard" element={
          <ProtectedRouteHospital>
          <HomeDashboard />
          </ProtectedRouteHospital> } />
        <Route path="/hospital-patients-dashboard" element={
           <ProtectedRouteHospital>
          <PatientsDashboard />
          </ProtectedRouteHospital>} />
        <Route path="/hospital-settings-dashboard" element={
          <ProtectedRouteHospital>
          <SettingsDashboard />
          </ProtectedRouteHospital> } />
        <Route path="/hospital-subscriptions-dashboard" element={
          <ProtectedRouteHospital>
          <SubscriptionsDashboard />
          </ProtectedRouteHospital>} />
        <Route path="/hospital-logout-dashboard" element={
          <ProtectedRouteHospital>
          <LogOutDashboard />
          </ProtectedRouteHospital>
        } />


        <Route path="/user-create-account" element={<ULP />} />
        <Route path="/user-login" element={<USI />} />
        <Route path="/user-forgot-password" element={<FPU />} />
        <Route path="/user-verify-otp" element={<VerifyOTPUser />} />
        <Route path="/user-set-new-password" element={<NPU />} />


        <Route path="/user-home-dashboard" element={
          <UserProtectedRoute>
          <UserHomeDashboard />
          </UserProtectedRoute>} />
        <Route path="/user-sub-account" element={
          <UserProtectedRoute>
          <UserSubAcctDashboard />
          </UserProtectedRoute>} />
        <Route path="/user-sub-account-upgrade" element={
          <UserProtectedRoute>
          <SAU />
          </UserProtectedRoute>} />
        <Route path="/user-settings-dashboard" element={
          <UserProtectedRoute>
          <UserSettingsDashboard />
          </UserProtectedRoute>} />
        <Route path="/user-subscriptions-dashboard" element={
          <UserProtectedRoute>
          <UserSubscriptionsDashboard />
          </UserProtectedRoute>} />
        <Route path="/user-logout-dashboard" element={
          <UserProtectedRoute>
          < UserLogoutDashboard />
          </UserProtectedRoute>} />
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
