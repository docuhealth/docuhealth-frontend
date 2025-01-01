import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./WelcomePage/Welcome";
import HLP from "./Hospital Login Page/HLP";
import HSI from "./Hospital Login Page/Hospital Sign In/HSI";
import ULP from "./User Login Page/ULP";
import FP from "./Hospital Login Page/Forgot Passoword/FP";
import NotFound from './Not Found/NotFound' // Import the NotFound component
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
import VerifyOTPUser from './User Login Page/Verify OTP/VerifyOTPUser'
import NPU from "./User Login Page/NewPassword/NPU";
import UserHomeDashboard from "./User Dashboard/UserHomeDashboard";
import UserSubAcctDashboard from './User Dashboard/UserSubAcctDashboard'
import UserSettingsDashboard from "./User Dashboard/UserSettingsDashboard";
import UserSubscriptionsDashboard from "./User Dashboard/UserSubscriptionsDashboard";
import UserLogoutDashboard from './User Dashboard/UserLogoutDasboard'


function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the Welcome page */}
        <Route path="/" element={<Welcome />} />

        {/* Route for the Confirm Account page */}
        <Route path="/confirm-account" element={<ConfirmAcct />} />

        {/* Route for the Hospital Create Account Page */}
        <Route path="/hospital-create-account" element={<HLP />} />

        {/* Route for the Hospital Login Page */}
        <Route path="/hospital-login" element={<HSI />} />

        {/* Route for the Hospital Forgot Password Page */}
        <Route path="/hospital-forgot-password" element={<FP />} />

        {/* Route for the Hospital Verify Otp Page */}
        <Route path="/hospital-verify-otp" element={<VerifyOTP />} />

        {/* Route for the Hospital Set New Password Page */}
        <Route path="/hospital-set-new-password" element={<NP />} />

        {/* Route for the Hospital Home Dashboard Page */}
        <Route path="/hospital-home-dashboard" element={<HomeDashboard />} />

        {/* Route for the Hospital Patients Dashboard Page */}
        <Route path="/hospital-patients-dashboard" element={<PatientsDashboard />} />

        {/* Route for the Hospital Settings Dashboard Page */}
        <Route path="/hospital-settings-dashboard" element={<SettingsDashboard />} />

        {/* Route for the Hospital Subscriptions Dashboard Page */}
        <Route path="/hospital-subscriptions-dashboard" element={<SubscriptionsDashboard />} />

        {/* Route for the Hospital Log Out Dashboard Page */}
        <Route path="/hospital-logout-dashboard" element={<LogOutDashboard />} />

        {/* Route for the User Create Account Page */}
        <Route path="/user-create-account" element={<ULP />} />

        {/* Route for the User Login Page */}
        <Route path="/user-login" element={<USI />} />

        {/* Route for the User Forgot Password Page */}
        <Route path="/user-forgot-password" element={<FPU />} />

        {/* Route for the User Verify OTP Page */}
        <Route path="/user-verify-otp" element={<VerifyOTPUser />} />


        {/* Route for the User Set New Password Page */}
        <Route path="/user-set-new-password" element={<NPU/>} />


        {/* Route for the User Home Dashboard Page */}
        <Route path="/user-home-dashboard" element={<UserHomeDashboard/>} />

        {/* Route for the User Sub Account Dashboard Page */}
        <Route path="/user-sub-account" element={<UserSubAcctDashboard/>} />

        {/* Route for the User Settings Dashboard Page */}
        <Route path="/user-settings-dashboard" element={<UserSettingsDashboard/>} />

        {/* Route for the User Subscription Dashboard Page */}
        <Route path="/user-subscriptions-dashboard" element={<UserSubscriptionsDashboard/>} />

        {/* Route for the User Logout Dashboard Page */}
        <Route path="/user-logout-dashboard" element={< UserLogoutDashboard />} />

        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
