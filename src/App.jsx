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

import Verify_NIN from "./Auth/VerifyNIN/Verify_NIN";

import User_Create_Account from "./Auth/User/User_Create_Account";
import User_Create_Account_Verify_OTP from "./Auth/User/User_Create_Account_Verify_OTP";
import User_Sign_In from "./Auth/User/User_Sign_In";
import User_Forget_Password from "./Auth/User/User_Forget_Password";
import User_Verify_OTP from "./Auth/User/User_Verify_OTP";
import User_Create_New_Password from "./Auth/User/User_Create_New_Password";

import Partner_Create_Account from "./Auth/Partner/Partner_Create_Account";
import Partner_Sign_In from "./Auth/Partner/Partner_Sign_In";

import Partner_Home_Dashboard from "./Dashboard/Partner_Dashboard/Partner_Home_Dashboard";


import Admin_Sign_In from "./Auth/Admin/Admin_Sign_In";
import Admin_Create_Account from "./Auth/Admin/Admin_Create_Account";
import Admin_Forget_Password from "./Auth/Admin/Admin_Forget_Password";
import Admin_Verify_OTP from "./Auth/Admin/Admin_Verify_OTP";
import Admin_Create_New_Password from "./Auth/Admin/Admin_Create_New_Password";


import ProtectedRoute from "./Auth/ProtectedRoute/ProtectedRoute";
import HospitalProtectedRoute from "./Auth/ProtectedRoute/HospitalProtectedRoute";

import Admin_Dashboard_Layout from "./Layouts/Admin_Dashboard_Layout/Admin_Dashboard_Layout";
import Admin_Home_Dashboard from "./Dashboard/Admin_Dashboard/Admin_Home_Dashboard";
import Admin_Users_Dashboard from "./Dashboard/Admin_Dashboard/Admin_Users_Dashboard";
import Admin_Settings_Dashboard from "./Dashboard/Admin_Dashboard/Admin_Settings_Dashboard";
import Admin_Subscriptions_Dashboard from "./Dashboard/Admin_Dashboard/Admin_Subscriptions_Dashboard";

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

import HospitalAdminProviders from "./Providers/Hospital/HospitalAdminProviders";
import HospitalReceptionistProviders from "./Providers/Hospital/HospitalReceptionistProviders";
import HospitalDoctorProviders from "./Providers/Hospital/HospitalDoctorProviders";
import HospitalNursesProviders from "./Providers/Hospital/HospitalNursesProviders";

import Hospital_Nurses_Layout from "./Layouts/Hospital_Dashboard_Layout/Hospital_Nurses/Hospital_Nurses_Layout";
import Hospital_Nurses_Home_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Nurses/Hospital_Nurses_Home_Dashboard";
import Hospital_Nurses_Appointments_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Nurses/Hospital_Nurses_Appointments_Dashboard";
import Hospital_Nurses_HealthPersonnel_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Nurses/Hospital_Nurses_HealthPersonnel_Dashboard";
import Hospital_Nurses_Messages_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Nurses/Hospital_Nurses_Messages_Dashboard";
import Hospital_Nurses_Patients_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Nurses/Hospital_Nurses_Patients_Dashboard";
import Hospital_Nurses_Settings_Dashboard from "./Dashboard/Hospital_Dashboard/Hospital_Nurses/Hospital_Nurses_Settings_Dashboard";

import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";

import ApproveHospitals from "./Dashboard/Admin_Dashboard/ApproveHospitals";

// import Snowfall from 'react-snowfall'
// import Confetti from 'react-confetti'


function App() {

  // 🔐 Disable console.log in production
  if (process.env.NODE_ENV === "production") {
    console.log = () => { };
  }

  const hostname = window.location.hostname;

  const isHospital = hostname.startsWith("hospital.");

  return (
    <Router>


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
            element={
   
              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
           
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Home_Dashboard />
                </HospitalAdminProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-staff-dashboard"
            element={
        
              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
    
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Staff_Dashboard />
                </HospitalAdminProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-patients-dashboard"
            element={

              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
      
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Patients_Dashboard />
                </HospitalAdminProviders>
              </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-messages-dashboard"
            element={
       
              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
       
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Messages_Dashboard />
                </HospitalAdminProviders>
         </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-appointments-dashboard"
            element={
     
              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
       
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Appointments_Dashboard />
                </HospitalAdminProviders>
              </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-wallet-dashboard"
            element={
    
              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
   
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Wallet_Dashboard />
                </HospitalAdminProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-settings-dashboard"
            element={

              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
 
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Settings_Dashboard />
                </HospitalAdminProviders>
             </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-admin-subscriptions-dashboard"
            element={
              <HospitalAdminProviders>
                <Hospital_Admin_Layout />
              </HospitalAdminProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalAdminProviders>
                  <Hospital_Admin_Subscriptions_Dashboard />
                </HospitalAdminProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>

          {/* Hospital Doctors Routes */}
          <Route
            path="/hospital-doctors-home-dashboard"
            element={
              <HospitalDoctorProviders>
                <Hospital_Doctors_Layout />
              </HospitalDoctorProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalDoctorProviders>
                  <Hospital_Doctors_Home_Dashboard />
                </HospitalDoctorProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-appointments-dashboard"
            element={
              <HospitalDoctorProviders>
                <Hospital_Doctors_Layout />
              </HospitalDoctorProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalDoctorProviders>
                  <Hospital_Doctors_Appointments_Dashboard />
                </HospitalDoctorProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-patients-dashboard"
            element={
              <HospitalDoctorProviders>
                <Hospital_Doctors_Layout />
              </HospitalDoctorProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalDoctorProviders>
                  <Hospital_Doctors_Patients_Dashboard />
                </HospitalDoctorProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-messages-dashboard"
            element={
              <HospitalDoctorProviders>
                <Hospital_Doctors_Layout />
              </HospitalDoctorProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalDoctorProviders>
                  <Hospital_Doctors_Messages_Dashboard />
                </HospitalDoctorProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-settings-dashboard"
            element={
              <HospitalDoctorProviders>
                <Hospital_Doctors_Layout />
              </HospitalDoctorProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalDoctorProviders>
                  <Hospital_Doctors_Settings_Dashboard />
                </HospitalDoctorProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-healthpersonnel-dashboard"
            element={
              <HospitalDoctorProviders>
                <Hospital_Doctors_Layout />
              </HospitalDoctorProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalDoctorProviders>
                  <Hospital_Doctors_HealthPersonnel_Dashboard />
                </HospitalDoctorProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-doctors-lab-dashboard"
            element={
              <HospitalDoctorProviders>
                <Hospital_Doctors_Layout />
              </HospitalDoctorProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalDoctorProviders>
                  <Hospital_Doctors_Lab_Dashboard />
                </HospitalDoctorProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>

          {/* Hospital Receptionist Routes */}
          <Route
            path="/hospital-receptionist-home-dashboard"
            element={
              <HospitalReceptionistProviders>
                <Hospital_Receptionist_Layout />
              </HospitalReceptionistProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalReceptionistProviders>
                  <Hospital_Receptionist_Home_Dashboard />
                </HospitalReceptionistProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-appointments-dashboard"
            element={
              <HospitalReceptionistProviders>
                <Hospital_Receptionist_Layout />
              </HospitalReceptionistProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalReceptionistProviders>
                  <Hospital_Receptionist_Appointments_Dashboard />
                </HospitalReceptionistProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-patients-dashboard"
            element={
              <HospitalReceptionistProviders>
                <Hospital_Receptionist_Layout />
              </HospitalReceptionistProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalReceptionistProviders>
                  <Hospital_Receptionist_Patients_Dashboard />
                </HospitalReceptionistProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-messages-dashboard"
            element={
              <HospitalReceptionistProviders>
                <Hospital_Receptionist_Layout />
              </HospitalReceptionistProviders>
            }
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalReceptionistProviders>
                  <Hospital_Receptionist_Messages_Dashboard />
                </HospitalReceptionistProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-settings-dashboard"
            element={
              <HospitalReceptionistProviders>
                <Hospital_Receptionist_Layout />
              </HospitalReceptionistProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalReceptionistProviders>
                  <Hospital_Receptionist_Settings_Dashboard />
                </HospitalReceptionistProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-healthpersonnel-dashboard"
            element={
              <HospitalReceptionistProviders>
                <Hospital_Receptionist_Layout />
              </HospitalReceptionistProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalReceptionistProviders>
                  <Hospital_Receptionist_HealthPersonnel_Dashboard />
                </HospitalReceptionistProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/hospital-receptionist-admission-dashboard"
            element={
              <HospitalReceptionistProviders>
                <Hospital_Receptionist_Layout />
              </HospitalReceptionistProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalReceptionistProviders>
                  <Hospital_Receptionist_Admission_Dashboard />
                </HospitalReceptionistProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>


          <Route
            path="/hospital-nurses-home-dashboard"
            element={
              <HospitalNursesProviders>
                <Hospital_Nurses_Layout />
              </HospitalNursesProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalNursesProviders>
                  <Hospital_Nurses_Home_Dashboard />
                </HospitalNursesProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/hospital-nurses-patients-dashboard"
            element={
              <HospitalNursesProviders>
                <Hospital_Nurses_Layout />
              </HospitalNursesProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalNursesProviders>
                  <Hospital_Nurses_Patients_Dashboard />
                </HospitalNursesProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/hospital-nurses-messages-dashboard"
            element={
              <HospitalNursesProviders>
                <Hospital_Nurses_Layout />
              </HospitalNursesProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalNursesProviders>
                  <Hospital_Nurses_Messages_Dashboard />
                </HospitalNursesProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>


          <Route
            path="/hospital-nurses-healthpersonnel-dashboard"
            element={
              <HospitalNursesProviders>
                <Hospital_Nurses_Layout />
              </HospitalNursesProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalNursesProviders>
                  <Hospital_Nurses_HealthPersonnel_Dashboard />
                </HospitalNursesProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/hospital-nurses-appointments-dashboard"
            element={
              <HospitalNursesProviders>
                <Hospital_Nurses_Layout />
              </HospitalNursesProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalNursesProviders>
                  <Hospital_Nurses_Appointments_Dashboard />
                </HospitalNursesProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/hospital-nurses-settings-dashboard"
            element={
              <HospitalNursesProviders>
                <Hospital_Nurses_Layout />
              </HospitalNursesProviders>}
          >
            <Route
              index
              element={
                <HospitalProtectedRoute>
                <HospitalNursesProviders>
                  <Hospital_Nurses_Settings_Dashboard />
                </HospitalNursesProviders>
                </HospitalProtectedRoute>
              }
            />
          </Route>


          <Route path="*" element={<div className="flex justify-center items-center min-h-screen">
            <p>Page Not Found</p>

          </div>} />

        </Routes>
      ) : (
        <>   
         {/* <Snowfall
          color="#cfe9ff"
          snowflakeCount={120}
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            top: 0,
            left: 0,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />

          <Confetti
            numberOfPieces={250}
            recycle={false}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          /> */}

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
            <Route path="/legal-notice" element={<Landing_Page_Layout />} >
              <Route
                index
                element={
                  <Legal_Notice_Page />

                }
              />
            </Route>
            <Route path="/privacy-policy" element={<Landing_Page_Layout />} >
              <Route
                index
                element={
                  <Privacy_Policy_Page />

                }
              />
            </Route>

            <Route path="/partner-create-account" element={<Partner_Create_Account />} />
            <Route path="/partner-login" element={<Partner_Sign_In />} />

            <Route path="/partner-dashboard" element={<Partner_Home_Dashboard />} />


            <Route path="/verify-nin" element={<Verify_NIN />} />

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
              path="/admin"
              element={<ApproveHospitals />}
            />
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
              path="/admin-create-new-password"
              element={<Admin_Create_New_Password />}
            />

<Route
              path="/admin-home-dashboard"
              element={<Admin_Dashboard_Layout />}
            >
              <Route
                index
                element={
                  // <ProtectedRoute>
                    <Admin_Home_Dashboard />
                  // </ProtectedRoute>
                }
              />
            </Route>

<Route
              path="/admin-users-dashboard"
              element={<Admin_Dashboard_Layout />}
            >
              <Route
                index
                element={
                  // <ProtectedRoute>
                    <Admin_Users_Dashboard />
                  // </ProtectedRoute>
                }
              />
            </Route>
<Route
              path="/admin-subscriptions-dashboard"
              element={<Admin_Dashboard_Layout />}
            >
              <Route
                index
                element={
                  // <ProtectedRoute>
                    <Admin_Subscriptions_Dashboard />
                  // </ProtectedRoute>
                }
              />
            </Route>
<Route
              path="/admin-settings-dashboard"
              element={<Admin_Dashboard_Layout />}
            >
              <Route
                index
                element={
                  // <ProtectedRoute>
                    <Admin_Settings_Dashboard />
                  // </ProtectedRoute>
                }
              />
            </Route>

          
            <Route path="*" element={<NotFound />} />

          </Routes>
        </>

      )}

    </Router>
  );
}

export default App;
