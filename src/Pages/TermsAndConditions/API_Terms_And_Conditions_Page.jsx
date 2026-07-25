import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from "react-helmet-async";
import BackgroundTemplate2 from '../Components/ui/BackgroundTemplate2'

const API_Terms_And_Conditions_Page = () => {
  return (
    <BackgroundTemplate2>
      <Helmet>
          <title>API Terms and Conditions | DocuHealth</title>
          <meta name="description" content="Terms and Conditions governing the use of DocuHealth After Visit Summary (AVS) API." />
          <link rel="canonical" href="https://docuhealthservices.net/api-terms-and-conditions" />
      </Helmet>
      <div className='min-h-screen text-docuhealth-primary text-sm px-5 lg:px-16 pt-8 lg:pt-0'>
        <Link to='/docuhealth-api'>
          <div className='lg:flex justify-start items-center py-5 hidden '>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.21861 7.33327L8.79461 3.75726L7.85181 2.81445L2.66634 7.99993L7.85181 13.1853L8.79461 12.2425L5.21861 8.6666H13.333V7.33327H5.21861Z" fill="var(--color-docuhealth-primary)" />
            </svg>
            <p className='ml-2'>Back to API Page</p>
          </div>
        </Link>
        <hr className='text-docuhealth-gray-light hidden lg:block' />
        
        <div className='bg-docuhealth-light-blue flex flex-col justify-center items-center my-16 sm:my-10 py-16 border rounded-md text-center px-4'>
            <h1 className='text-3xl lg:text-4xl font-bold text-docuhealth-primary uppercase tracking-wider mb-2'>
                DocuHealth
            </h1>
            <h2 className='text-2xl lg:text-3xl font-semibold text-docuhealth-primary uppercase'>
                After Visit Summary API – Terms & Conditions
            </h2>
        </div>

        <div className='mx-auto'>
          <div className="space-y-8 text-sm text-docuhealth-gray mb-20 leading-relaxed">
            <p className='text-base'>
              These Terms govern access to and use of the <strong>DocuHealth After Visit Summary (AVS) API ("API", "Service")</strong> 
              by any third-party developer, organization, or Electronic Medical Record (EMR) system <strong>("Developer", "You")</strong>.
            </p>
            <p className='text-base'>
              The API is designed for the secure uploading and retrieval (viewing) of patient After Visit Summaries 
              within approved healthcare systems.
            </p>
            <p className="font-semibold text-docuhealth-primary text-base">
              By accessing or using the API, You agree to be bound by these Terms.
            </p>

            {/* 1. Purpose of the API */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">1. Purpose of the API</h3>
              <p>
                The DocuHealth AVS API enables secure upload and retrieval of structured post-encounter patient 
                summaries generated from clinical data, including:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 list-decimal pl-10 space-y-1 mt-2">
                <li>Vitals</li>
                <li>Chief Complaint</li>
                <li>Confirmed Diagnoses</li>
                <li>Treatment Plan</li>
                <li>Medications</li>
                <li>Test Results</li>
                <li>Condition at Discharge</li>
                <li>Follow-up Instructions</li>
                <li>Patient Education Notes</li>
              </ul>
              <p className="mt-3">
                The API supports clinical continuity of care by allowing EMRs to securely store and view standardized 
                after-visit summaries.
              </p>
            </section>

            {/* 2. License & Access Rights */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">2. License & Access Rights</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>DocuHealth grants You a limited, non-exclusive, non-transferable, revocable license to use the API solely for secure integration of upload and viewing functionality within Your EMR system.</li>
                <li>You may not resell, sublicense, or redistribute the API or its data.</li>
              </ol>
            </section>

            {/* 3. Data Usage & Restrictions */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">3. Data Usage & Restrictions</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>API data must only be used for authorized clinical upload, retrieval, and viewing purposes.</li>
                <li>You shall not alter, distort, or misrepresent clinical information.</li>
                <li>You shall not use API data for advertising, profiling, or non-medical analytics.</li>
                <li>You shall not retain API responses beyond what is required for legitimate medical record storage and continuity of care.</li>
              </ol>
            </section>

            {/* 4. Patient Data Handling */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">4. Patient Data Handling</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>All data transmitted and retrieved via the API is sensitive medical information.</li>
                <li>Developers must comply with applicable healthcare privacy and data protection laws.</li>
                <li>Patient data must be encrypted in transit and at rest.</li>
                <li>Access-controlled within the EMR system.</li>
                <li>Protected against unauthorized access, leakage, or exposure.</li>
              </ol>
            </section>

            {/* 5. Internal Clinical Documentation Rule */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">5. Internal Clinical Documentation Rule</h3>
              <p>
                DocuHealth distinguishes between Internal Clinical Records (not exposed via API) and Structured After 
                Visit Summary (AVS) (exposed via API for upload and viewing only).
              </p>
              <p className="mt-2">
                The API only supports secure upload and viewing of final patient-facing summaries. Internal physician 
                notes are never exposed.
              </p>
            </section>

            {/* 6. Security Requirements */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">6. Security Requirements</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Implement secure authentication (API keys, OAuth, or approved method).</li>
                <li>Ensure all upload and retrieval requests are authenticated.</li>
                <li>Rotate credentials regularly.</li>
                <li>Prevent unauthorized access or misuse.</li>
                <li>Report any suspected breach immediately to DocuHealth.</li>
              </ol>
            </section>

            {/* 7. Patient Subscription-Based Access Control */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">7. Patient Subscription-Based Access Control</h3>
              <p>
                API access for viewing AVS data is strictly dependent on the patient’s subscription status within the 
                DocuHealth system.
              </p>
              <p className="mt-2">
                Only subscribed and eligible patients will have AVS available for retrieval.
              </p>
              <p className="mt-2">
                If a patient is not subscribed or expired, the API will return a restricted response indicating access is not 
                available.
              </p>
              <p className="mt-2">
                Developers must not bypass or cache restricted responses or manipulate requests to access restricted data.
              </p>
            </section>

            {/* 8. Compliance Responsibilities */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">8. Compliance Responsibilities</h3>
              <p>
                You are solely responsible for compliance with healthcare regulations, privacy laws, and EMR 
                governance policies.
              </p>
            </section>

            {/* 9. Service Availability */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">9. Service Availability</h3>
              <p>
                DocuHealth strives for high availability but does not guarantee uninterrupted service. Maintenance may 
                affect API access.
              </p>
            </section>

            {/* 10. Intellectual Property */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">10. Intellectual Property</h3>
              <p>
                All rights in the API remain the exclusive property of DocuHealth. No ownership rights are granted.
              </p>
            </section>

            {/* 11. Termination */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">11. Termination</h3>
              <p>
                DocuHealth may suspend or terminate access for violations, security risks, or misuse. Developers may 
                stop usage at any time.
              </p>
            </section>

            {/* 12. Disclaimer of Medical Liability */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">12. Disclaimer of Medical Liability</h3>
              <p>
                DocuHealth is not responsible for clinical decisions, misinterpretation of data, or patient outcomes.
              </p>
            </section>

            {/* 13. Acceptance of Terms */}
            <section>
              <h3 className="text-lg font-bold text-docuhealth-primary mb-3">13. Acceptance of Terms</h3>
              <p>
                By using the API, You confirm acceptance of these Terms and full responsibility for system usage.
              </p>
            </section>
          </div>
        </div>
      </div>
    </BackgroundTemplate2>
  )
}

export default API_Terms_And_Conditions_Page
