import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";


import Landing_Page_Layout from "./Layouts/Landing_Page_Layout/Landing_Page_Layout";
import Home_Page from "./Pages_/Home Page/Home_Page";
import Our_Vision_Page from "./Pages_/Our Vision/Our_Vision_Page";
import Our_Mission_Page from "./Pages_/Our Mission/Our_Mission_Page";
import DocuHealth_News_Page from "./Pages_/DocuHealth News Page/DocuHealth_News_Page";
import DocuHealth_API_Page from "./Pages_/DocuHealth API Page/DocuHealth_API_Page";
import Legal_Notice_Page from "./Pages_/Legal Notice/Legal_Notice_Page";
import Privacy_Policy_Page from "./Pages_/Our Privacy Policy/Privacy_Policy_Page";


import Hospital_Verification_Request from "./Auth/Hospital/Hospital_Verification_Request";
import Hospital_Onboarding from "./Auth/Hospital/Hospital_Onboarding";



import Hospital_Sign_In from "./Auth/Hospital/Hospital_Sign_In";
import Hospital_Forget_Password from "./Auth/Hospital/Hospital_Forget_Password";
import Hospital_Verify_OTP from "./Auth/Hospital/Hospital_Verify_OTP";
import Hospital_Create_New_Password from "./Auth/Hospital/Hospital_Create_New_Password";


import NotFound from "./Not Found/NotFound";



import User_Create_Account from "./Auth/User/User_Create_Account";
import User_Create_Account_Verify_OTP from "./Auth/User/User_Create_Account_Verify_OTP";
import User_Sign_In from "./Auth/User/User_Sign_In";
import User_Forget_Password from "./Auth/User/User_Forget_Password";
import User_Verify_OTP from "./Auth/User/User_Verify_OTP";
import User_Create_New_Password from "./Auth/User/User_Create_New_Password";


import Admin_Sign_In from "./Auth/Admin/Admin_Sign_In";
import Admin_Create_Account from "./Auth/Admin/Admin_Create_Account";
import Admin_Forget_Password from "./Auth/Admin/Admin_Forget_Password";
import Admin_Verify_OTP from "./Auth/Admin/Admin_Verify_OTP";
import Admin_Create_New_Password from "./Auth/Admin/Admin_Create_New_Password";
import AdminHomeDashboard from "./Admin Dashboard/AdminHomeDashboard";
import AdminUsersDashboard from "./Admin Dashboard/AdminUsersDashboard";
import AdminSettingsDashboard from "./Admin Dashboard/AdminSettingsDashboard";
import AdminSubscriptionDashboard from "./Admin Dashboard/AdminSubscriptionsdashboard";
import AdminLogoutDashboard from "./Admin Dashboard/AdminLogOutDashboard";

import AdminProtectedRoute from "./Components/Admin Protected Route/AdminProtectedRoute";


import ProtectedRoute from "./Auth/ProtectedRoute/ProtectedRoute";
import HospitalProtectedRoute from "./Auth/ProtectedRoute/HospitalProtectedRoute";

import Patient_Dashboard_Layout from "./Layouts/Patient_Dashboard_Layout/Patient_Dashboard_Layout";
import Patient_Home_Dashboard from "./Dashboard/Patient_Dashboard/Patient_Home_Dashboard";
import Patient_SubAccount_Dashboard from "./Dashboard/Patient_Dashboard/Patient_SubAccount_Dashboard";
import Patient_Appointments_Dashboard from "./Dashboard/Patient_Dashboard/Patient_Appointments_Dashboard";
import Patient_Settings_Dashboard from "./Dashboard/Patient_Dashboard/Patient_Settings_Dashboard";
import Patient_Subscriptions_Dashboard from "./Dashboard/Patient_Dashboard/Patient_Subscriptions_Dashboard";

{
  /* Hospital Routes */
}

import Hospital_Admin_Layout from "./Layouts/Hospital_Dashboard_Layout/Hospital_Admin/Hospital_Admin_Layout";
import Hospital_Admin_Home_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Home_Dashboard";
import Hospital_Admin_Staff_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Staff_Dashboard";
import Hospital_Admin_Patients_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Patients_Dashboard";
import Hospital_Admin_Messages_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Messages_Dashboard";
import Hospital_Admin_Appointments_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Appointments_Dashboard";
import Hospital_Admin_Wallet_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Wallet_Dashboard";
import Hospital_Admin_Settings_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Settings_Dashboard";
import Hospital_Admin_Subscriptions_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Admin/Hospital_Admin_Subscriptions_Dashboard";


import Hospital_Doctors_Layout from "./Layouts/Hospital_Dashboard_Layout/Hospital_Doctors/Hospital_Doctors_Layout";
import Hospital_Doctors_Home_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Doctors/Hospital_Doctors_Home_Dashboard";
import Hospital_Doctors_Appointments_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Doctors/Hospital_Doctors_Appointments_Dashboard";
import Hospital_Doctors_Patients_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Doctors/Hospital_Doctors_Patients_Dashboard";
import Hospital_Doctors_Messages_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Doctors/Hospital_Doctors_Messages_Dashboard";
import Hospital_Doctors_Settings_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Doctors/Hospital_Doctors_Settings_Dashboard";
import Hospital_Doctors_HealthPersonnel_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Doctors/Hospital_Doctors_HealthPersonnel_Dashboard";
import Hospital_Doctors_Lab_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Doctors/Hospital_Doctors_Lab_Dashboard";

import Hospital_Receptionist_Layout from "./Layouts/Hospital_Dashboard_Layout/Hospital_Receptionist/Hospital_Receptionist_Layout";
import Hospital_Receptionist_Home_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Receptionist/Hospital_Receptionist_Home_Dashboard";
import Hospital_Receptionist_Appointments_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Receptionist/Hospital_Receptionist_Appointments_Dashboard";
import Hospital_Receptionist_Patients_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Receptionist/Hospital_Receptionist_Patients_Dashboard";
import Hospital_Receptionist_Messages_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Receptionist/Hospital_Receptionist_Messages_Dashboard";
import Hospital_Receptionist_Settings_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Receptionist/Hospital_Receptionist_Settings_Dashboard";
import Hospital_Receptionist_HealthPersonnel_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Receptionist/Hospital_Receptionist_HealthPersonnel_Dashboard";
import Hospital_Receptionist_Admission_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Receptionist/Hospital_Receptionist_Admission_Dashboard";

import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";

function App() {

  const hostname = window.location.hostname;
  // hostname.startsWith("hospital.")
  // true
  const isHospital = hostname.startsWith("hospital.");

  return (
    <Router>
      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop />

      {isHospital ? (
        <Routes>
          <Route path="/login" element={<Hospital_Sign_In />} />
          <Route
            path="/forgot-password"
            element={<Hospital_Forget_Password />}
          />
          <Route path="/verify-otp" element={<Hospital_Verify_OTP />} />

          <Route
            path="/create-new-password"
            element={<Hospital_Create_New_Password />}
          />

          
          {/* Hospital Admin Routes */}
          <Route
            path="/hospital-admin-home-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Home_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-staff-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Staff_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-patients-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Patients_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-messages-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Messages_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-appointments-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Appointments_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-wallet-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Wallet_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-settings-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Settings_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-subscriptions-dashboard"
            element={<Hospital_Admin_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Admin_Subscriptions_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>

          {/* Hospital Doctors Routes */}
          <Route
            path="/hospital-doctors-home-dashboard"
            element={<Hospital_Doctors_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Doctors_Home_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-appointments-dashboard"
            element={<Hospital_Doctors_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Doctors_Appointments_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-patients-dashboard"
            element={<Hospital_Doctors_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Doctors_Patients_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-messages-dashboard"
            element={<Hospital_Doctors_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Doctors_Messages_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-settings-dashboard"
            element={<Hospital_Doctors_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Doctors_Settings_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-healthpersonnel-dashboard"
            element={<Hospital_Doctors_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Doctors_HealthPersonnel_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-lab-dashboard"
            element={<Hospital_Doctors_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Doctors_Lab_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>

          {/* Hospital Receptionist Routes */}
          <Route
            path="/hospital-receptionist-home-dashboard"
            element={<Hospital_Receptionist_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Receptionist_Home_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-appointments-dashboard"
            element={<Hospital_Receptionist_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Receptionist_Appointments_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-patients-dashboard"
            element={<Hospital_Receptionist_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Receptionist_Patients_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-messages-dashboard"
            element={<Hospital_Receptionist_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Receptionist_Messages_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-settings-dashboard"
            element={<Hospital_Receptionist_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Receptionist_Settings_Dashboard />

                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-healthpersonnel-dashboard"
            element={<Hospital_Receptionist_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Receptionist_HealthPersonnel_Dashboard />

                // </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-admission-dashboard"
            element={<Hospital_Receptionist_Layout />}
          >
            <Route
              index
              element={
                // <ProtectedRoute>
                <Hospital_Receptionist_Admission_Dashboard />
                // </ProtectedRoute>
              }
            />
          </Route>


        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Landing_Page_Layout />} >
            <Route
              index
              element={
                <Home_Page />

              }
            />
          </Route>
          <Route path="/our-vision" element={<Landing_Page_Layout />} >
            <Route
              index
              element={
                <Our_Vision_Page />

              }
            />
          </Route>
          <Route path="/our-mission" element={<Landing_Page_Layout />} >
            <Route
              index
              element={
                <Our_Mission_Page />

              }
            />
          </Route>
          <Route path="/docuhealth-news" element={<Landing_Page_Layout />} >
            <Route
              index
              element={
                <DocuHealth_News_Page />

              }
            />
          </Route>
          <Route path="/docuhealth-api" element={<Landing_Page_Layout />} >
            <Route
              index
              element={
                <DocuHealth_API_Page />

              }
            />
          </Route>
          <Route path="/our-legal-notice" element={<Landing_Page_Layout />} >
            <Route
              index
              element={
                <Legal_Notice_Page />

              }
            />
          </Route>
          <Route path="/our-privacy-policy" element={<Landing_Page_Layout />} >
            <Route
              index
              element={
                <Privacy_Policy_Page />

              }
            />
          </Route>


          <Route path="/user-create-account" element={<User_Create_Account />} />
          <Route
            path="/user-create-account-verify-otp"
            element={<User_Create_Account_Verify_OTP />}
          />
          <Route path="/user-login" element={<User_Sign_In />} />
          <Route
            path="/user-forgot-password"
            element={<User_Forget_Password />}
          />
          <Route path="/user-verify-otp" element={<User_Verify_OTP />} />

          <Route

            path="/user-create-new-password"
            element={<User_Create_New_Password />}
          />

          <Route
            path="/hospital-verification-request"
            element={<Hospital_Verification_Request />}
          />
          <Route
            path="/hospital-onboarding"
            element={<Hospital_Onboarding />}
          />


          {/* Dashboard Routes */}
          <Route
            path="/user-home-dashboard"
            element={<Patient_Dashboard_Layout />}
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <Patient_Home_Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/user-subaccount-dashboard"
            element={<Patient_Dashboard_Layout />}
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <Patient_SubAccount_Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/user-appointments-dashboard"
            element={<Patient_Dashboard_Layout />}
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <Patient_Appointments_Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/user-settings-dashboard"
            element={<Patient_Dashboard_Layout />}
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <Patient_Settings_Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/user-subscriptions-dashboard"
            element={<Patient_Dashboard_Layout />}
          >
            <Route
              index
              element={
                <ProtectedRoute>
                  <Patient_Subscriptions_Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/admin-create-account"
            element={<Admin_Create_Account />}
          />
          <Route path="/admin-login" element={<Admin_Sign_In />} />
          <Route
            path="/admin-forgot-password"
            element={<Admin_Forget_Password />}
          />
          <Route path="/admin-verify-otp" element={<Admin_Verify_OTP />} />
          <Route
            path="/admin-set-new-password"
            element={<Admin_Create_New_Password />}
          />

          <Route
            path="/admin-home-dashboard"
            element={
              <AdminProtectedRoute>
                <AdminHomeDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-users-dashboard"
            element={
              <AdminProtectedRoute>
                <AdminUsersDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-settings-dashboard"
            element={
              <AdminProtectedRoute>
                <AdminSettingsDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin-subscriptions-dashboard"
            element={
              <AdminProtectedRoute>
                <AdminSubscriptionDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin-logout-dashboard"
            element={
              <AdminProtectedRoute>
                <AdminLogoutDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />

        </Routes>
      )}

    </Router>
  );
}

export default App;
