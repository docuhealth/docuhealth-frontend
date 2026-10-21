# Audit Logs Mobile Download Discrepancy: Analysis & Remediation Guide

> **Status Assessment**: The observation is **100% true**. Under the current codebase architecture, audit logs only record downloads initiated on laptops/desktops, while downloads performed on mobile devices are routinely omitted.

---

## 1. Executive Summary

Audit logs in DocuHealth (`api/audits/audit-logs`) are intended to provide accountability by recording every time a lab test result or radiology scan report is downloaded.

However, in practice:
- **Downloads on Laptops/Desktops** (performed by lab scientists or radiologists in their web portals) are successfully recorded.
- **Downloads on Mobile Devices** (performed by patients on their phones, doctors on mobile browsers, or lab staff on handheld devices) **do not appear** in the audit logs.

This discrepancy stems from a combination of **frontend execution order**, **mobile browser sandbox limitations**, and **backend role restrictions**.

---

## 2. Root Cause Analysis

### Factor A: The Execution Order Bug in PDF Generation
In both `Hospital_Lab_Test_Detail_Dashboard.jsx` and `Hospital_Radiology_Scan_Detail_Dashboard.jsx`, downloads are performed via client-side DOM rasterization (`html2canvas` + `jsPDF`):

```javascript
// Existing implementation in Hospital_Lab_Test_Detail_Dashboard.jsx:
const handleDownload = async () => {
  if (downloading || !printRef.current) return;
  setDownloading(true);
  const toastId = toast.loading("Preparing PDF...");
  try {
    // 1. Client-side canvas conversion and PDF generation
    await downloadElementAsPdf(printRef.current, downloadFileName, { singleBlock: true, scale: 1.75 });
    toast.success("PDF downloaded", { id: toastId });

    // 2. Audit logging API call (PLACED AFTER ASYNC PDF GENERATION)
    logDownloads();
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Could not generate the PDF", { id: toastId });
  } finally {
    setDownloading(false);
  }
};
```

#### Why this breaks specifically on Mobile:
1. **Canvas Memory Constraints**: Mobile browsers (iOS Safari / Mobile WebKit and Chrome Mobile) enforce strict memory ceilings on `<canvas>` elements (typically 16MB or 4096px dimension max). At `scale: 1.75` on high-DPI retina screens, `html2canvas` often throws an uncaught error.
2. **Popup / Download Blocking**: In iOS Safari, triggering an asynchronous programmatic file save (`pdf.save(...)` via a delayed Blob URL) without a synchronous user-gesture context is frequently blocked.
3. **Execution Short-Circuit**: Because `logDownloads()` is placed **after** `await downloadElementAsPdf(...)`, any failure during client-side rendering aborts straight into `catch (error)`. The audit logging call is **never reached**.

---

### Factor B: Mobile Users (Patients & Doctors) Use Direct `<a download>` Links
The vast majority of mobile traffic comes from **Patients** checking their records on their smartphones, or **Doctors** reviewing patient history on mobile rounds:
- In `MedicalRecordsDetail.tsx`, `SoapNoteDetailView.jsx`, and `PatientMedicalRecordDetail.jsx`, file attachments and lab/scan reports are downloaded via static HTML anchor tags:
  ```jsx
  <a
    href={fileUrl}
    download
    className="bg-docuhealth-primary text-white rounded-full py-1 px-3"
  >
    <ArrowDownToLine className="w-3 h-3" />
    Download
  </a>
  ```
- Clicking this direct link triggers a browser download directly from cloud storage (Cloudinary / S3). **No network request is ever sent to the DocuHealth backend or the audit log endpoint.**

---

### Factor C: Backend Permission Restrictions (HTTP 403 on Doctors)
Even when a doctor attempts to export results, the frontend code explicitly notes backend authorization restrictions (documented in git commit `f83484c` on Oct 17, 2026):

```javascript
// Line 639 in Hospital_Lab_Test_Detail_Dashboard.jsx:
const logDownloads = () => {
  // Only lab staff may log downloads; the backend 403s doctors since 2026-10-17
  if (isDoctorView) return;
  ...
};
```

1. The backend endpoints `api/lab/audit-logs/.../downloads` and `api/radiology/audit-logs/.../downloads` were authored strictly for lab technicians and radiologists.
2. Attempting to post to these endpoints with a Doctor authentication token returns **403 Forbidden**.
3. There is currently no backend audit logging endpoint dedicated to **Patient** downloads.

---

## 3. Platform & Role Breakdown Matrix

| Role | Primary Device | Screen / View | Download Technology | Audit Log Status |
| :--- | :--- | :--- | :--- | :--- |
| **Lab Scientist / Admin** | Laptop / Desktop | Lab Test Detail Dashboard | `html2canvas` + `jsPDF` | **Recorded** (`api/lab/audit-logs/...`) |
| **Radiologist** | Laptop / Desktop | Radiology Scan Detail Dashboard | `html2canvas` + `jsPDF` | **Recorded** (`api/radiology/audit-logs/...`) |
| **Lab / Radiology Staff** | Mobile Phone | Lab / Scan Detail Dashboard | `html2canvas` fails on Mobile | **Missing** (Aborted in `try/catch` before log call) |
| **Doctors** | Mobile Phone / Tablet | Doctor Patient Records / Lab Tab | Static `<a download>` or `isDoctorView` | **Missing** (Backend 403 Forbidden) |
| **Patients** | Mobile Phone | Patient Portal Medical Records | Static `<a download>` | **Missing** (No audit trigger exists) |

---

## 4. Step-by-Step Remediation Plan

To ensure all downloads—regardless of whether they occur on laptop or mobile, and regardless of who triggers them—are reliably captured in the audit logs, follow these steps:

### Step 1: Make In-App Audit Calls Asynchronous & Independent (Frontend)
Never place the audit logging call *after* an asynchronous client-side PDF renderer that might fail on mobile. Trigger the audit log concurrently or immediately upon click.

#### In `Hospital_Lab_Test_Detail_Dashboard.jsx`:
```javascript
const handleDownload = async () => {
  if (downloading || !printRef.current) return;
  setDownloading(true);

  // 1. Fire the audit log call immediately (don't wait for PDF render)
  logDownloads();

  const toastId = toast.loading("Preparing PDF...");
  try {
    await downloadElementAsPdf(printRef.current, downloadFileName, { singleBlock: true, scale: 1.75 });
    toast.success("PDF downloaded", { id: toastId });
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Could not generate the PDF", { id: toastId });
  } finally {
    setDownloading(false);
  }
};
```

#### In `Hospital_Radiology_Scan_Detail_Dashboard.jsx`:
```javascript
const handleDownload = async () => {
  if (downloading || !printRef.current) return;
  setDownloading(true);

  // 1. Fire scan download audit immediately
  if (report?.sqid) {
    logScanResultDownload(report.sqid).catch((err) =>
      console.warn("Download audit log failed", err)
    );
  }

  const toastId = toast.loading("Preparing PDF...");
  try {
    await downloadElementAsPdf(printRef.current, downloadFileName, { singleBlock: true, scale: 1.75 });
    toast.success("PDF downloaded", { id: toastId });
  } catch (error) {
    console.error("PDF export failed", error);
    toast.error("Could not generate the PDF", { id: toastId });
  } finally {
    setDownloading(false);
  }
};
```

---

### Step 2: Intercept Static `<a download>` Clicks on Mobile (Frontend)
In views where patients or doctors click download links (e.g., `MedicalRecordsDetail.tsx`, `SoapNoteDetailView.jsx`):

Replace plain `<a href={fileUrl} download>` with an intercepted click handler:

```jsx
<a
  href={fileUrl}
  download
  onClick={() => {
    // Notify audit endpoint of file download
    if (record?.result_sqid) {
      logLabResultDownload(record.result_sqid).catch(() => {});
    }
  }}
  className="flex items-center justify-center gap-1 bg-docuhealth-primary text-white rounded-full py-1 px-3"
>
  <ArrowDownToLine className="w-3 h-3" />
  Download
</a>
```

---

### Step 3: Align Backend Permissions & Unified Audit Endpoint (Backend)
To allow mobile downloads by doctors and patients to appear in hospital audits:

1. **Permit Doctor Role**:
   Update backend view permissions on:
   - `POST api/lab/audit-logs/{sqid}/downloads`
   - `POST api/radiology/audit-logs/{sqid}/downloads`
   Remove the restriction that returns `403 Forbidden` for doctors who have legitimate clinical access to the patient.
2. **Add Patient Download Tracking**:
   Introduce a patient-safe download audit route:
   `POST api/records/patient-downloads/{recordSqid}`
   This records when a patient exports their records, capturing:
   - `user`: Patient ID / HIN
   - `device_type`: Extracted from the `User-Agent` header (`Mobile` vs `Desktop`)
   - `action`: `patient_record_downloaded`
   - `timestamp`: UTC DateTime

---

### Step 4: Add Mobile-Friendly PDF Serving
Client-side DOM rendering via `html2canvas` is inherently fragile on mobile devices due to CSS viewport variations and iOS memory limits.
- **Recommended Architecture**: When a mobile user clicks "Download", request a pre-rendered PDF URL from the backend (e.g. `GET api/lab/orders/{sqid}/pdf`), which can be opened natively in the mobile device's PDF viewer or downloaded directly.

---

## 5. Verification Checklist

- [ ] **Test Lab Staff Download on Desktop**: Confirm entry appears in `Hospital_Admin_Audit_Logs_Dashboard`.
- [ ] **Test Lab Staff Download on Mobile Chrome / Safari**: Confirm entry appears regardless of whether canvas rendering succeeds.
- [ ] **Test Radiologist Download on Mobile**: Confirm entry is dispatched before PDF compilation finishes.
- [ ] **Verify Backend Response**: Confirm backend does not reject requests with 403 when called by authorized doctors.
- [ ] **Verify Audit Table Rendering**: Confirm new entries render correctly in both the desktop table and the `Mobile Card Layout` of `AuditLogsView.jsx`.
