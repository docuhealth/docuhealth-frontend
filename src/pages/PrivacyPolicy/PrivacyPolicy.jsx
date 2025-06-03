import React from "react";
import logo from "../../assets/img/logo.png";
const PrivacyPolicy = () => (
  <div className="privacy-policy py-10">
    <div className="flex justify-center items-center gap-2">
      <div>
        <img src={logo} alt="" />
      </div>
      <h2 className="text-[#0000FF] font-bold text-xl">DocuHealth</h2>
    </div>
    <div className="text-center text-sm py-3 font-medium">
      <h3>Terms & Privacy Policy</h3>
    </div>
    <div className="mx-3 sm:mx-5">
      <div class="p-4 space-y-4 text-sm text-gray-700">
        <p>
          By registering for and using <strong>DocuHealth</strong>, you consent
          to the collection, use, and processing of your personal and health
          data as outlined in this agreement. Please read the terms below
          carefully before proceeding.
        </p>

        <h2 class="text-base font-semibold text-gray-900">
          1. Data Collection and Use
        </h2>
        <p>
          By creating an account, you agree that DocuHealth may collect, store,
          and process your personal and health data, including but not limited
          to:
        </p>
        <ul class="list-disc pl-6 space-y-1">
          <li>
            Personal details such as name, date of birth, and contact
            information
          </li>
          <li>
            Medical summaries uploaded by authorized hospitals, including
            diagnoses, test results, and vaccination records.
          </li>
        </ul>

        <h2 class="text-base font-semibold text-gray-900">
          2. Medical Summaries
        </h2>
        <p>
          DocuHealth does not store or provide full medical histories. Only
          medical summaries provided by hospitals and healthcare providers are
          uploaded and accessible. These summaries may include:
        </p>
        <ul class="list-disc pl-6 space-y-1">
          <li>Diagnoses</li>
          <li>Test results</li>
          <li>Medication</li>
          <li>Vital signs</li>
          <li>Short summary of treatment or vaccination</li>
        </ul>
        <p>
          This information is provided by hospitals in a summarized form and
          cannot be altered or corrected once uploaded.
        </p>

        <h2 class="text-base font-semibold text-gray-900">
          3. Immutability of Data
        </h2>
        <p>
          Once a hospital or healthcare provider uploads a medical summary to
          DocuHealth, the data becomes immutable. This means that it cannot be
          altered, corrected, or deleted by users, hospitals, or any other
          entities once uploaded. The integrity of the data is maintained for
          security and legal purposes.
        </p>

        <h2 class="text-base font-semibold text-gray-900">5. Data Deletion</h2>
        <p>
          You have the right to request the deletion of your DocuHealth account.
          However, please note that once a medical summary is uploaded by a
          hospital, it becomes immutable, and cannot be deleted or modified. If
          you request deletion of your account, the data associated with your
          account will be removed from access, but it will remain stored for
          compliance with legal and regulatory obligations.
        </p>

        <h2 class="text-base font-semibold text-gray-900">6. Data Security</h2>
        <p>
          We are committed to safeguarding your personal and health information.
          DocuHealth employs industry-standard security measures, including
          encryption and access controls, to ensure the security and
          confidentiality of your data.
        </p>

        <h2 class="text-base font-semibold text-gray-900">
          8. Legal Compliance
        </h2>
        <p>
          DocuHealth complies with all relevant data protection laws, including
          the Nigeria Data Protection Regulation (NDPR), to ensure that your
          personal and health information is handled responsibly and in
          accordance with the law.
        </p>

        <h2 class="text-base font-semibold text-gray-900">
          9. Termination and Withdrawal
        </h2>
        <p>
          You can choose to deactivate or delete your account at any time by
          contacting DocuHealth support. However, deactivation or deletion will
          limit your access to services, and once your account is deleted, you
          will no longer be able to view or access your medical records through
          DocuHealth.
        </p>

        <h2 class="text-base font-semibold text-gray-900">
          10. Agreement to Terms
        </h2>
        <p>
          By clicking “Registering On Our Platform”, you acknowledge that you
          have read, understood, and consent to the terms and conditions
          outlined in this Data Compliance Agreement.
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
