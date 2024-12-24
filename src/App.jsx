import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./WelcomePage/Welcome";
import HLP from "./Hospital Login Page/HLP";
import HSI from "./Hospital Login Page/Hospital Sign In/HSI";
import ULP from "./User Login Page/ULP";
import FP from "./Hospital Login Page/Forgot Passoword/FP";
import NotFound from './Not Found/NotFound' // Import the NotFound component
import VerifyOTP from "./Hospital Login Page/OTP/VerifyOTP";
import NP from "./Hospital Login Page/NewPassword/NP";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the Welcome page */}
        <Route path="/" element={<Welcome />} />

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

        {/* Route for the User Login Page */}
        <Route path="/user-login" element={<ULP />} />

        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
