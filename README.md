# DocuHealth 🏥

**Secure, lifelong access to medical records powered by HIN-NIN integration.**

DocuHealth is a comprehensive, modern Healthcare Management and Electronic Health Records (EHR) system designed to streamline operations for hospitals, clinics, healthcare professionals, and patients. Built with **React 18** and **Vite**, the platform provides role-based access control, appointment scheduling, and patient record management.

---

## 🌟 Core Value Proposition: The HIN

At the heart of DocuHealth is the **Health Identification Number (HIN)**. Linked directly with the **National Identity Number (NIN)**, the HIN ensures:
- **Unique Patient Identity**: Eliminates duplicate or fragmented medical records.
- **Interoperability**: Seamless data exchange between verified healthcare providers.
- **Portability**: Patients maintain a single, lifelong health record regardless of which hospital they visit.

---

## ✨ Key Features

### 🏥 For Hospitals & Clinics
- **Multi-Role Dashboards**: Tailored interfaces for Admins, Doctors, Nurses, and Receptionists.
- **Ward & Admission Tracking**: Real-time management of bed availability and patient status.
- **Financial Management**: Integrated wallet system and subscription handling for operations.
- **Staff Onboarding**: Automated verification and management of health personnel.
- **Secure Messaging**: Internal communication channel for clinical collaboration.

### 🧑‍⚕️ For Patients & Dependents
- **Unified Health Profile**: Real-time access to drug history, lab results, and prescriptions.
- **Sub-Account Management**: Manage health records for family members from a single profile.
- **Smart Appointment Booking**: Easy scheduling with preferred doctors and clinics.
- **Secure Data Sharing**: Control over who accesses your medical history.

### 🛠 System Administration
- **Global Governance**: Tools for hospital verification, NIN validation, and system-wide audits.
- **Partner Portal**: Dedicated API and dashboard for integration partners.

---

## 🚀 Tech Stack

- **Frontend**: React 18 (Vite)
- **Styling**: Tailwind CSS v4, PostCSS
- **Animations**: Framer Motion (Premium, scroll-triggered reveals)
- **State & Data**: TanStack Query (React Query), Axios
- **Visualization**: ApexCharts, Chart.js
- **Utilities**: Lucide React, Swiper.js, React Hot Toast, jsPDF

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DocuHealth-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or the next available port).

### Production Build
```bash
npm run build
```

---

## 🔐 Role-Based Access Control (RBAC)

DocuHealth implements a robust RBAC system to ensure data privacy and security:
- **Patients**: Personal health management and booking.
- **Hospital Staff**: Operational tools (Admin, Doctor, Receptionist, Nurse).
- **Platform Admins**: System-wide governance and approvals.
- **Partners**: API-driven integration management.

---

## 📄 License
This project is proprietary. All rights reserved. © 2026 DocuHealth Services.
