// The public site's legal documents, as v1 published them. A section's body is paragraphs
// (strings) and bulleted lists (arrays of strings), in order.

export type Block = string | readonly string[];
type LegalSection = { heading: string; body: readonly Block[] };
export type LegalDocument = {
  title: string;
  intro: readonly string[];
  sections: readonly LegalSection[];
};

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  intro: [
    "By registering for and using DocuHealth, you consent to the collection, use, and processing of your personal and health data as outlined in this agreement. Please read the terms below carefully before proceeding.",
  ],
  sections: [
    {
      heading: "1. Data Collection and Use",
      body: [
        "By creating an account, you agree that DocuHealth may collect, store, and process your personal and health data, including but not limited to:",
        [
          "Personal details such as name, date of birth, and contact information",
          "Medical summaries uploaded by authorized hospitals, including diagnoses, test results, and vaccination records.",
        ],
      ],
    },
    {
      heading: "2. Medical Summaries",
      body: [
        "DocuHealth does not store or provide full medical histories. Only medical summaries provided by hospitals and healthcare providers are uploaded and accessible. These summaries may include:",
        [
          "Diagnoses",
          "Test results",
          "Medication",
          "Vital signs",
          "Short summary of treatment or vaccination",
        ],
        "This information is provided by hospitals in a summarized form and cannot be altered or corrected once uploaded.",
      ],
    },
    {
      heading: "3. Immutability of Data",
      body: [
        "Once a hospital or healthcare provider uploads a medical summary to DocuHealth, the data becomes immutable. This means that it cannot be altered, corrected, or deleted by users, hospitals, or any other entities once uploaded. The integrity of the data is maintained for security and legal purposes.",
      ],
    },
    {
      heading: "4. Data Deletion",
      body: [
        "You have the right to request the deletion of your DocuHealth account. However, please note that once a medical summary is uploaded by a hospital, it becomes immutable, and cannot be deleted or modified. If you request deletion of your account, the data associated with your account will be removed from access, but it will remain stored for compliance with legal and regulatory obligations.",
      ],
    },
    {
      heading: "5. Data Security",
      body: [
        "We are committed to safeguarding your personal and health information. DocuHealth employs industry-standard security measures, including encryption and access controls, to ensure the security and confidentiality of your data.",
      ],
    },
    {
      heading: "6. Data Sharing With Partners",
      body: [
        "DocuHealth may share your medical summary data with authorized healthcare partners, digital health platforms, or service providers strictly for health-related purposes, such as:",
        [
          "Care coordination",
          "Preventive health services",
          "Health-related research or analytics",
          "Health benefit programs",
          "Digital integrations that enhance patient experience",
        ],
        "DocuHealth does not sell your personal information under any circumstances.",
        "All partners must sign a Data Sharing Agreement and comply with all relevant data protection laws, including the Nigeria Data Protection Regulation (NDPR), to ensure your data is handled securely and responsibly.",
      ],
    },
    {
      heading: "7. Legal Compliance",
      body: [
        "DocuHealth complies with all relevant data protection laws, including the Nigeria Data Protection Regulation (NDPR), to ensure that your personal and health information is handled responsibly and in accordance with the law.",
      ],
    },
    {
      heading: "8. Termination and Withdrawal",
      body: [
        "You can choose to deactivate or delete your account at any time by contacting DocuHealth support. However, deactivation or deletion will limit your access to services, and once your account is deleted, you will no longer be able to view or access your medical records through DocuHealth.",
      ],
    },
    {
      heading: "9. Agreement to Terms",
      body: [
        "By clicking “Sign Up Now On Our Platform”, you acknowledge that you have read, understood, and consent to the terms and conditions outlined in this Data Compliance Agreement.",
      ],
    },
  ],
};

export const patientTerms: LegalDocument = {
  title: "Patient Terms & Conditions",
  intro: ["Medical Records, After-Visit Summaries, Lab Results and Medication Use"],
  sections: [
    {
      heading: "1. Purpose of DocuHealth",
      body: [
        "DocuHealth is designed to make essential health information accessible to patients and authorized healthcare professionals, support continuity of care, and improve the coordination and quality of healthcare services. DocuHealth does not independently diagnose medical conditions, prescribe medication, recommend treatment, or make clinical decisions on behalf of a patient or healthcare professional.",
      ],
    },
    {
      heading: "2. Medical Records and Clinical Decisions",
      body: [
        "Clinical decisions, including diagnosis, treatment, prescription, medication changes, additional investigations, and other medical interventions, remain the responsibility of the healthcare professional and healthcare facility providing your care.",
        "Information displayed through DocuHealth, including your medical record summary, diagnosis, medication history, laboratory results, test results, vital signs, discharge summary, and After-Visit Summary (AVS), is provided for continuity of care and informational purposes and should not be interpreted as an independent medical recommendation from DocuHealth.",
      ],
    },
    {
      heading: "3. Medication Use and Self-Medication",
      body: [
        "Patients must not assume that because a medication was previously prescribed or used successfully, it is appropriate to use the same medication again for a new or recurring health condition.",
        "Medical conditions may have different causes, and the same symptoms may require different treatments. Previous prescriptions, medication records, or drug information displayed on My DocuHealth must not be used as a basis for self-prescribing, changing dosage, restarting medication, sharing medication with another person, or purchasing and using medication without appropriate professional guidance.",
        "Always follow the instructions of your doctor, nurse, pharmacist, or other appropriately qualified healthcare professional regarding the use of medication.",
        "Where a healthcare professional recommends an additional test, investigation, review, referral, or follow-up appointment, patients are strongly encouraged to comply with such recommendations unless otherwise advised by a qualified healthcare professional.",
      ],
    },
    {
      heading: "4. Laboratory and Test Results",
      body: [
        "Laboratory results, diagnostic test results, imaging reports, and other clinical information made available through My DocuHealth should be reviewed and interpreted in the appropriate clinical context.",
        "A test result on its own may not provide a complete picture of a patient’s health. Patients should consult an appropriately qualified healthcare professional for interpretation, diagnosis, and advice regarding any result, particularly where a result is abnormal or unclear.",
      ],
    },
    {
      heading: "5. Access to Medical Information",
      body: [
        "Patients may have access through DocuHealth to information they are entitled to receive in connection with their care. Depending on the healthcare service provided, this may include:",
        [
          "Medical or visit summaries;",
          "After-Visit Summaries (AVS);",
          "Discharge summaries;",
          "Diagnosis and clinical impressions;",
          "Medication and prescription records;",
          "Laboratory and test results;",
          "Vital signs and other recorded observations; and",
          "Other essential information relating to the patient’s care.",
        ],
        "The healthcare facility remains responsible for maintaining its applicable internal clinical and medical records in accordance with its legal and professional obligations. Access to a summary or information through DocuHealth does not necessarily constitute access to the healthcare facility’s complete internal medical record.",
      ],
    },
    {
      heading: "6. Patient Responsibility",
      body: [
        "Patients are responsible for providing accurate information about their health, medications, allergies, previous treatments, and other relevant medical history and for informing healthcare professionals of any changes.",
        "Patients should seek appropriate professional medical care when experiencing new, worsening, persistent, or emergency symptoms and should not rely solely on information available through My DocuHealth to make decisions about their health.",
      ],
    },
    {
      heading: "7. No Substitution for Professional Medical Care",
      body: [
        "DocuHealth provides technology and access to health information to support patients and healthcare professionals. It does not replace consultation, examination, diagnosis, treatment, or other professional medical services.",
        "The availability of information through My DocuHealth should not be understood as an endorsement, confirmation, or recommendation by DocuHealth that a particular medication, treatment, test, diagnosis, or course of action is appropriate for the patient.",
        "By using DocuHealth, you acknowledge that healthcare decisions should be made in consultation with an appropriately qualified healthcare professional and that information contained in your DocuHealth account should be used responsibly and primarily to support continuity of care.",
      ],
    },
  ],
};

export const hospitalTerms: LegalDocument = {
  title: "Hospital Terms & Conditions",
  intro: [
    "By completing registration on DocuHealth (“Platform”), the Hospital (“User”, “Hospital”, “You”) agrees to the following Terms and Conditions.",
  ],
  sections: [
    {
      heading: "1. Scope of Service",
      body: [
        "DocuHealth provides a digital healthcare platform that enables hospitals to:",
        [
          "Manage patient records",
          "Document clinical encounters",
          "Coordinate care and follow-ups",
          "Access integrated healthcare tools and services",
        ],
        "DocuHealth does not provide medical services and does not replace clinical judgment.",
      ],
    },
    {
      heading: "2. Hospital Responsibilities",
      body: [
        [
          "Ensure all patient data entered is accurate and up to date.",
          "Restrict access to authorized personnel only.",
          "Maintain the confidentiality of login credentials.",
          "Use the platform strictly for lawful and professional medical purposes.",
          "Comply with all applicable healthcare regulations and patient privacy laws.",
        ],
      ],
    },
    {
      heading: "3. Patient Data & Documentation Policy",
      body: [
        "3.1 Internal Clinical Documentation. All detailed medical records entered into DocuHealth shall remain strictly internal to the Hospital’s system and are not visible to patients.",
        "3.2 Patient-Visible Medical Summary. Patients will only have access to a structured summary of their medical information, which may include:",
        [
          "Vitals",
          "Confirmed Diagnoses",
          "Chief Complaint",
          "Treatment Plan",
          "Condition at Discharge",
          "Medications",
          "Test Results",
          "Follow-up Instructions",
          "Additional Notes (e.g., Patient Education)",
        ],
      ],
    },
    {
      heading: "4. Data Protection & Privacy",
      body: [
        [
          "DocuHealth implements industry-standard security measures to protect data.",
          "The Hospital retains ownership of its patient data.",
          "DocuHealth will not access or share patient data except as required to operate the platform or when legally required.",
        ],
      ],
    },
    {
      heading: "5. Platform Usage & Restrictions",
      body: [
        [
          "No fraudulent or unauthorized activities.",
          "No reverse engineering, copying, or reselling the platform.",
          "No access granted to unauthorized third parties.",
        ],
      ],
    },
    {
      heading: "6. Subscription & Payments",
      body: [
        [
          "Some features may require a paid subscription.",
          "Failure to pay may result in restricted access or suspension.",
        ],
      ],
    },
    {
      heading: "7. Service Availability & Updates",
      body: [
        "DocuHealth will strive to maintain high uptime but does not guarantee uninterrupted service. Features may be updated or modified at any time.",
      ],
    },
    {
      heading: "8. Limitation of Liability",
      body: [
        "DocuHealth is not liable for medical decisions, data entry errors, or patient care outcomes.",
      ],
    },
    {
      heading: "9. Termination",
      body: [
        "DocuHealth may suspend or terminate access if terms are violated or misuse occurs. Hospitals may discontinue use at any time.",
      ],
    },
    {
      heading: "10. Acceptance of Terms",
      body: [
        "By completing registration, the Hospital confirms that it has read and agreed to these Terms and Conditions.",
      ],
    },
    {
      heading: "Agreement Statement",
      body: [
        "“I agree to the Terms & Conditions and understand that internal clinical documentation remains restricted to hospital use, while patients will only access summarized medical records.”",
      ],
    },
  ],
};

export const apiTerms: LegalDocument = {
  title: "After Visit Summary API Terms & Conditions",
  intro: [
    "These Terms govern access to and use of the DocuHealth After Visit Summary (AVS) API (“API”, “Service”) by any third-party developer, organization, or Electronic Medical Record (EMR) system (“Developer”, “You”).",
    "The API is designed for the secure uploading and retrieval (viewing) of patient After Visit Summaries within approved healthcare systems.",
    "By accessing or using the API, You agree to be bound by these Terms.",
  ],
  sections: [
    {
      heading: "1. Purpose of the API",
      body: [
        "The DocuHealth AVS API enables secure upload and retrieval of structured post-encounter patient summaries generated from clinical data, including:",
        [
          "Vitals",
          "Chief Complaint",
          "Confirmed Diagnoses",
          "Treatment Plan",
          "Medications",
          "Test Results",
          "Condition at Discharge",
          "Follow-up Instructions",
          "Patient Education Notes",
        ],
        "The API supports clinical continuity of care by allowing EMRs to securely store and view standardized after-visit summaries.",
      ],
    },
    {
      heading: "2. License & Access Rights",
      body: [
        [
          "DocuHealth grants You a limited, non-exclusive, non-transferable, revocable license to use the API solely for secure integration of upload and viewing functionality within Your EMR system.",
          "You may not resell, sublicense, or redistribute the API or its data.",
        ],
      ],
    },
    {
      heading: "3. Data Usage & Restrictions",
      body: [
        [
          "API data must only be used for authorized clinical upload, retrieval, and viewing purposes.",
          "You shall not alter, distort, or misrepresent clinical information.",
          "You shall not use API data for advertising, profiling, or non-medical analytics.",
          "You shall not retain API responses beyond what is required for legitimate medical record storage and continuity of care.",
        ],
      ],
    },
    {
      heading: "4. Patient Data Handling",
      body: [
        [
          "All data transmitted and retrieved via the API is sensitive medical information.",
          "Developers must comply with applicable healthcare privacy and data protection laws.",
          "Patient data must be encrypted in transit and at rest.",
          "Access-controlled within the EMR system.",
          "Protected against unauthorized access, leakage, or exposure.",
        ],
      ],
    },
    {
      heading: "5. Internal Clinical Documentation Rule",
      body: [
        "DocuHealth distinguishes between Internal Clinical Records (not exposed via API) and Structured After Visit Summary (AVS) (exposed via API for upload and viewing only).",
        "The API only supports secure upload and viewing of final patient-facing summaries. Internal physician notes are never exposed.",
      ],
    },
    {
      heading: "6. Security Requirements",
      body: [
        [
          "Implement secure authentication (API keys, OAuth, or approved method).",
          "Ensure all upload and retrieval requests are authenticated.",
          "Rotate credentials regularly.",
          "Prevent unauthorized access or misuse.",
          "Report any suspected breach immediately to DocuHealth.",
        ],
      ],
    },
    {
      heading: "7. Patient Subscription-Based Access Control",
      body: [
        "API access for viewing AVS data is strictly dependent on the patient’s subscription status within the DocuHealth system.",
        "Only subscribed and eligible patients will have AVS available for retrieval.",
        "If a patient is not subscribed or expired, the API will return a restricted response indicating access is not available.",
        "Developers must not bypass or cache restricted responses or manipulate requests to access restricted data.",
      ],
    },
    {
      heading: "8. Compliance Responsibilities",
      body: [
        "You are solely responsible for compliance with healthcare regulations, privacy laws, and EMR governance policies.",
      ],
    },
    {
      heading: "9. Service Availability",
      body: [
        "DocuHealth strives for high availability but does not guarantee uninterrupted service. Maintenance may affect API access.",
      ],
    },
    {
      heading: "10. Intellectual Property",
      body: [
        "All rights in the API remain the exclusive property of DocuHealth. No ownership rights are granted.",
      ],
    },
    {
      heading: "11. Termination",
      body: [
        "DocuHealth may suspend or terminate access for violations, security risks, or misuse. Developers may stop usage at any time.",
      ],
    },
    {
      heading: "12. Disclaimer of Medical Liability",
      body: [
        "DocuHealth is not responsible for clinical decisions, misinterpretation of data, or patient outcomes.",
      ],
    },
    {
      heading: "13. Acceptance of Terms",
      body: [
        "By using the API, You confirm acceptance of these Terms and full responsibility for system usage.",
      ],
    },
  ],
};

export const legalNotice: LegalDocument = {
  title: "Legal Notice",
  intro: [],
  sections: [
    {
      heading: "",
      body: [
        "DocuHealth Services™ is a registered and legally protected brand under DocuHealth Technologies. All proprietary assets, including but not limited to the platform’s technology infrastructure, system architecture, Health Identity Number (HIN) model, data frameworks, software codebase, user interface design, and related visual or functional elements, are the exclusive intellectual property of DocuHealth Technologies.",
        "Any form of unauthorized access, reproduction, modification, duplication, distribution, or imitation of the DocuHealth platform, its components, or associated trademarks whether in part or in full is strictly prohibited and constitutes an infringement of intellectual property rights protected under applicable national and international laws.",
        "DocuHealth Technologies reserves the right to take appropriate legal and administrative action against any individual or organization found to be in violation of these rights, including but not limited to the pursuit of damages, injunctions, and criminal prosecution where applicable.",
        "Use of the DocuHealth name, logo, system designs, or proprietary frameworks without explicit written consent from DocuHealth Technologies shall be considered a breach of these protections and will be legally enforceable to the fullest extent of the law.",
      ],
    },
  ],
};
