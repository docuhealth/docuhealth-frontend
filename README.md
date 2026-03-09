# DocuHealth 🏥

DocuHealth is a comprehensive, modern Healthcare Management and Electronic Health Records (EHR) system designed to streamline operations for hospitals, clinics, healthcare professionals, and patients. Built with React and Vite, the platform provides role-based access control, appointment scheduling, and patient record management.

## 🌟 Key Features

### 🏥 For Hospitals
- **Multi-Role Dashboards**: Specific interfaces for Hospital Admins, Doctors, Nurses, and Receptionists.
- **Patient Management**: Complete tracking of patient records, drug history, and admissions.
- **Appointment System**: Efficient scheduling and management of patient appointments.
- **Ward Management**: Real-time tracking of ward availability and patient admissions.
- **Financial & Subscription Management**: Integrated wallet and subscription handling for hospital operations.
- **Internal Messaging**: Secure communication system for hospital staff.
- **Health Personnel Management**: Easy onboarding and tracking of doctors, nurses, and lab technicians.

### 🧑‍⚕️ For Patients
- **Personalized Dashboard**: A dedicated space for patients to manage their health journey.
- **Sub-Accounts**: Manage family members or dependents from a single primary account.
- **Appointment Booking**: Easy scheduling with chosen healthcare providers.
- **Drug Records**: Real-time access to prescriptions and medication history.
- **Subscriptions & Settings**: Easy management of notification preferences and billing.

### 🛠 System Administration
- **Global Admin Dashboard**: For platform administrators to manage hospital approvals, user accounts, and system settings.
- **Partner Dashboard**: Interfaces for integration partners.
- **Verification System**: Built-in Hospital Verification and NIN (National Identification Number) verification.

## 🚀 Tech Stack

- **Frontend Framework**: React 18, Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS (v4) with PostCSS
- **State Management & Data Fetching**: React Query (@tanstack/react-query), Axios
- **Charts & Reports**: ApexCharts, Chart.js, jsPDF, html2canvas
- **UI Components**: Heroicons, Lucide React, React Icons, Swiper
- **Notifications**: React Hot Toast, React Toastify
- **Code Quality**: ESLint

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd DocuHealth-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Building for Production
To build the application for production, run:
```bash
npm run build
```
The optimized files will be generated in the `dist` directory.

## 🔐 Role-Based Access

DocuHealth provides separate secure portals and dashboard layouts depending on user authentication:
- **Patients**
- **Hospital Staff** (Admin, Doctor, Receptionist, Nurse)
- **Platform Admins**
- **Partners**

## 📄 License
This project is proprietary. All rights reserved.
