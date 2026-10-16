import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { User, Building2 } from 'lucide-react'
import BackgroundTemplate2 from '../Components/ui/BackgroundTemplate2'

const Terms_And_Conditions_Page = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    tabParam === 'hospital' ? 'hospital' : 'patient'
  )

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'hospital' || tab === 'patient') {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'hospital' ? { tab: 'hospital' } : {})
  }

  return (
    <BackgroundTemplate2>
      <Helmet>
        <title>
          {activeTab === 'hospital'
            ? 'Hospital Terms & Conditions | DocuHealth'
            : 'Patient Terms & Conditions | DocuHealth'}
        </title>
        <meta
          name="description"
          content={
            activeTab === 'hospital'
              ? 'Terms and Conditions for hospitals using the DocuHealth platform for secure medical record management.'
              : 'Terms and Conditions for patients using the DocuHealth platform for secure medical record management.'
          }
        />
        <link rel="canonical" href="https://docuhealthservices.net/terms-and-conditions" />
      </Helmet>
      <div className='min-h-screen text-docuhealth-primary text-sm px-5 lg:px-16 pt-8 lg:pt-0'>

        <Link to='/'>
          <div className='lg:flex justify-start items-center py-5 hidden '>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.21861 7.33327L8.79461 3.75726L7.85181 2.81445L2.66634 7.99993L7.85181 13.1853L8.79461 12.2425L5.21861 8.6666H13.333V7.33327H5.21861Z" fill="var(--color-docuhealth-primary)" />
            </svg>
            <p className='ml-2'>Our Terms and Conditions</p>
          </div>
        </Link>
        <hr className='text-docuhealth-gray-light hidden lg:block' />
        
        <div className='bg-docuhealth-light-blue flex flex-col justify-center items-center my-16 sm:my-10 py-16 border rounded-md text-center px-4'>
            <h1 className='text-3xl lg:text-4xl font-bold text-docuhealth-primary uppercase tracking-wider mb-2'>
                DocuHealth
            </h1>
            <h2 className='text-2xl lg:text-3xl font-semibold text-docuhealth-primary'>
                TERMS & CONDITIONS
            </h2>
        </div>

        <div className=' mx-auto'>
          {/* Toggle Tabs */}
          <div className='flex justify-center sm:justify-start mb-8'>
            <div
              className='inline-flex p-1 bg-docuhealth-light-blue border border-docuhealth-border-light rounded-full shadow-xs'
              role="tablist"
              aria-label="Terms and Conditions categories"
            >
              <button
                type='button'
                role="tab"
                aria-selected={activeTab === 'patient'}
                onClick={() => handleTabChange('patient')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  activeTab === 'patient'
                    ? 'bg-docuhealth-primary text-white shadow-sm'
                    : 'text-docuhealth-primary hover:text-blue-900 hover:bg-white/50'
                }`}
              >
                <User className='w-4 h-4' />
                <span>Patient</span>
              </button>
              <button
                type='button'
                role="tab"
                aria-selected={activeTab === 'hospital'}
                onClick={() => handleTabChange('hospital')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                  activeTab === 'hospital'
                    ? 'bg-docuhealth-primary text-white shadow-sm'
                    : 'text-docuhealth-primary hover:text-blue-900 hover:bg-white/50'
                }`}
              >
                <Building2 className='w-4 h-4' />
                <span>Hospital</span>
              </button>
            </div>
          </div>

          {/* Patient Terms Section */}
          {activeTab === 'patient' && (
            <div className='mb-20'>
              <h2 className='text-2xl font-bold text-docuhealth-primary mb-3 border-b-2 border-docuhealth-primary pb-2 inline-block'>
                PATIENT TERMS & CONDITIONS
              </h2>
              <p className='text-base font-semibold text-docuhealth-primary mb-8'>
                Medical Records, After-Visit Summaries, Lab Results and Medication Use
              </p>
              <div className="space-y-8 text-sm text-docuhealth-gray leading-relaxed">
                <section>
                  <h3 className="text-lg font-bold text-docuhealth-primary mb-3">1. Purpose of DocuHealth</h3>
                  <p>
                    DocuHealth is designed to make essential health information accessible to patients and authorized healthcare professionals, support continuity of care, and improve the coordination and quality of healthcare services. DocuHealth does not independently diagnose medical conditions, prescribe medication, recommend treatment, or make clinical decisions on behalf of a patient or healthcare professional.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-docuhealth-primary mb-3">2. Medical Records and Clinical Decisions</h3>
                  <p className="mb-3">
                    Clinical decisions, including diagnosis, treatment, prescription, medication changes, additional investigations, and other medical interventions, remain the responsibility of the healthcare professional and healthcare facility providing your care.
                  </p>
                  <p>
                    Information displayed through DocuHealth, including your medical record summary, diagnosis, medication history, laboratory results, test results, vital signs, discharge summary, and After-Visit Summary (AVS), is provided for continuity of care and informational purposes and should not be interpreted as an independent medical recommendation from DocuHealth.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-docuhealth-primary mb-3">3. Medication Use and Self-Medication</h3>
                  <p className="mb-3">
                    Patients must not assume that because a medication was previously prescribed or used successfully, it is appropriate to use the same medication again for a new or recurring health condition.
                  </p>
                  <p className="mb-3">
                    Medical conditions may have different causes, and the same symptoms may require different treatments. Previous prescriptions, medication records, or drug information displayed on My DocuHealth must not be used as a basis for self-prescribing, changing dosage, restarting medication, sharing medication with another person, or purchasing and using medication without appropriate professional guidance.
                  </p>
                  <p className="mb-3">
                    Always follow the instructions of your doctor, nurse, pharmacist, or other appropriately qualified healthcare professional regarding the use of medication.
                  </p>
                  <p>
                    Where a healthcare professional recommends an additional test, investigation, review, referral, or follow-up appointment, patients are strongly encouraged to comply with such recommendations unless otherwise advised by a qualified healthcare professional.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-docuhealth-primary mb-3">4. Laboratory and Test Results</h3>
                  <p className="mb-3">
                    Laboratory results, diagnostic test results, imaging reports, and other clinical information made available through My DocuHealth should be reviewed and interpreted in the appropriate clinical context.
                  </p>
                  <p>
                    A test result on its own may not provide a complete picture of a patient’s health. Patients should consult an appropriately qualified healthcare professional for interpretation, diagnosis, and advice regarding any result, particularly where a result is abnormal or unclear.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-docuhealth-primary mb-3">5. Access to Medical Information</h3>
                  <p className="mb-3">
                    Patients may have access through DocuHealth to information they are entitled to receive in connection with their care. Depending on the healthcare service provided, this may include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1.5 my-3">
                    <li>Medical or visit summaries;</li>
                    <li>After-Visit Summaries (AVS);</li>
                    <li>Discharge summaries;</li>
                    <li>Diagnosis and clinical impressions;</li>
                    <li>Medication and prescription records;</li>
                    <li>Laboratory and test results;</li>
                    <li>Vital signs and other recorded observations; and</li>
                    <li>Other essential information relating to the patient’s care.</li>
                  </ul>
                  <p className="mt-3">
                    The healthcare facility remains responsible for maintaining its applicable internal clinical and medical records in accordance with its legal and professional obligations. Access to a summary or information through DocuHealth does not necessarily constitute access to the healthcare facility’s complete internal medical record.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-docuhealth-primary mb-3">6. Patient Responsibility</h3>
                  <p className="mb-3">
                    Patients are responsible for providing accurate information about their health, medications, allergies, previous treatments, and other relevant medical history and for informing healthcare professionals of any changes.
                  </p>
                  <p>
                    Patients should seek appropriate professional medical care when experiencing new, worsening, persistent, or emergency symptoms and should not rely solely on information available through My DocuHealth to make decisions about their health.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-docuhealth-primary mb-3">7. No Substitution for Professional Medical Care</h3>
                  <p className="mb-3">
                    DocuHealth provides technology and access to health information to support patients and healthcare professionals. It does not replace consultation, examination, diagnosis, treatment, or other professional medical services.
                  </p>
                  <p className="mb-3">
                    The availability of information through My DocuHealth should not be understood as an endorsement, confirmation, or recommendation by DocuHealth that a particular medication, treatment, test, diagnosis, or course of action is appropriate for the patient.
                  </p>
                  <p>
                    By using DocuHealth, you acknowledge that healthcare decisions should be made in consultation with an appropriately qualified healthcare professional and that information contained in your DocuHealth account should be used responsibly and primarily to support continuity of care.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* Hospital Terms Section */}
          {activeTab === 'hospital' && (
          <div className='mb-20'>
            <h2 className='text-2xl  font-bold text-docuhealth-primary mb-8 border-b-2 border-docuhealth-primary pb-2 inline-block'>HOSPITAL TERMS & CONDITIONS</h2>
            <div className="space-y-8 text-sm text-docuhealth-gray leading-relaxed">
                <p className='text-sm'>
                By completing registration on <strong>DocuHealth (“Platform”)</strong>, the Hospital <strong>(“User”, “Hospital”, “You”)</strong> agrees to
                the following Terms and Conditions.
                </p>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">1. Scope of Service</h3>
                <p>DocuHealth provides a digital healthcare platform that enables hospitals to:</p>
                <ul className="list-decimal pl-6 space-y-1 mt-2">
                    <li>Manage patient records</li>
                    <li>Document clinical encounters</li>
                    <li>Coordinate care and follow-ups</li>
                    <li>Access integrated healthcare tools and services</li>
                </ul>
                <p className="mt-3 italic">DocuHealth does not provide medical services and does not replace clinical judgment.</p>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">2. Hospital Responsibilities</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Ensure all patient data entered is accurate and up to date.</li>
                    <li>Restrict access to authorized personnel only.</li>
                    <li>Maintain the confidentiality of login credentials.</li>
                    <li>Use the platform strictly for lawful and professional medical purposes.</li>
                    <li>Comply with all applicable healthcare regulations and patient privacy laws.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">3. Patient Data & Documentation Policy</h3>
                
                <div className='ml-4 mt-4'>
                    <h4 className='font-bold text-docuhealth-primary mb-2'>3.1 Internal Clinical Documentation</h4>
                    <p>
                        All detailed medical records entered into DocuHealth shall remain strictly internal to the Hospital’s
                        system and are not visible to patients.
                    </p>
                </div>

                <div className='ml-4 mt-6'>
                    <h4 className='font-bold text-docuhealth-primary mb-2'>3.2 Patient-Visible Medical Summary</h4>
                    <p>Patients will only have access to a structured summary of their medical information, which may include:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 list-decimal pl-10 space-y-1 mt-2">
                        <li>Vitals</li>
                        <li>Confirmed Diagnoses</li>
                        <li>Chief Complaint</li>
                        <li>Treatment Plan</li>
                        <li>Condition at Discharge</li>
                        <li>Medications</li>
                        <li>Test Results</li>
                        <li>Follow-up Instructions</li>
                        <li>Additional Notes (e.g., Patient Education)</li>
                    </ul>
                </div>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">4. Data Protection & Privacy</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>DocuHealth implements industry-standard security measures to protect data.</li>
                    <li>The Hospital retains ownership of its patient data.</li>
                    <li>DocuHealth will not access or share patient data except as required to operate the platform or when legally required.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">5. Platform Usage & Restrictions</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>No fraudulent or unauthorized activities.</li>
                    <li>No reverse engineering, copying, or reselling the platform.</li>
                    <li>No access granted to unauthorized third parties.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">6. Subscription & Payments</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Some features may require a paid subscription.</li>
                    <li>Failure to pay may result in restricted access or suspension.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">7. Service Availability & Updates</h3>
                <p>
                    DocuHealth will strive to maintain high uptime but does not guarantee uninterrupted service. Features 
                    may be updated or modified at any time.
                </p>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">8. Limitation of Liability</h3>
                <p>
                    DocuHealth is not liable for medical decisions, data entry errors, or patient care outcomes.
                </p>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">9. Termination</h3>
                <p>
                    DocuHealth may suspend or terminate access if terms are violated or misuse occurs. Hospitals may 
                    discontinue use at any time.
                </p>
                </section>

                <section>
                <h3 className="text-lg font-bold text-docuhealth-primary mb-3">10. Acceptance of Terms</h3>
                <p>
                    By completing registration, the Hospital confirms that it has read and agreed to these Terms and 
                    Conditions.
                </p>
                </section>

                <div className='bg-docuhealth-light-blue p-6 border-l-4 border-docuhealth-primary rounded-r-md mt-10 shadow-sm'>
                    <h3 className='text-md font-bold text-docuhealth-primary mb-2'>Agreement Statement</h3>
                    <p className='text-sm font-medium italic text-docuhealth-gray'>
                        &ldquo;I agree to the Terms &amp; Conditions and understand that internal clinical documentation remains
                        restricted to hospital use, while patients will only access summarized medical records.&rdquo;
                    </p>
                </div>

                {/* API CTA */}
                <div className='mt-12 bg-white py-6  px-5 sm:px-6 border rounded-md text-center'>
                    <h3 className='text-lg font-bold text-docuhealth-primary mb-3'>Integrating with DocuHealth API?</h3>
                    <p className='mb-4 text-sm'>
                        If you are a developer or an EMR system looking to integrate our After Visit Summary (AVS) API, 
                        please review our specific API terms.
                    </p>
                    <Link to='/api-terms-and-conditions'>
                        <button className='bg-docuhealth-primary text-white px-6 py-2.5 rounded-full hover:bg-blue-900 transition-colors font-medium w-full sm:w-auto'>
                            View API Terms & Conditions
                        </button>
                    </Link>
                </div>

            </div>
          </div>
          )}

        </div>
      </div>
    </BackgroundTemplate2>
  )
}

export default Terms_And_Conditions_Page
