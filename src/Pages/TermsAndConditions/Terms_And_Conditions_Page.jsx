import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import BackgroundTemplate2 from '../Components/ui/BackgroundTemplate2'

const Terms_And_Conditions_Page = () => {
  return (
    <BackgroundTemplate2>
      <Helmet>
        <title>Hospital Terms & Conditions | DocuHealth</title>
        <meta name="description" content="Terms and Conditions for hospitals using the DocuHealth platform for secure medical record management." />
        <link rel="canonical" href="https://docuhealthservices.net/terms-and-conditions" />
      </Helmet>
      <div className='min-h-screen text-[#3E4095] text-sm px-5 lg:px-16 pt-8 lg:pt-0'>

        <Link to='/'>
          <div className='lg:flex justify-start items-center py-5 hidden '>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.21861 7.33327L8.79461 3.75726L7.85181 2.81445L2.66634 7.99993L7.85181 13.1853L8.79461 12.2425L5.21861 8.6666H13.333V7.33327H5.21861Z" fill="#3E4095" />
            </svg>
            <p className='ml-2'>Our Terms and Conditions</p>
          </div>
        </Link>
        <hr className='text-[#BDB5B5] hidden lg:block' />
        
        <div className='bg-[#F6FCFE] flex flex-col justify-center items-center my-16 sm:my-10 py-16 border rounded-md text-center px-4'>
            <h1 className='text-3xl lg:text-4xl font-bold text-[#3E4095] uppercase tracking-wider mb-2'>
                DocuHealth
            </h1>
            <h2 className='text-2xl lg:text-3xl font-semibold text-[#3E4095]'>
                TERMS & CONDITIONS
            </h2>
        </div>

        <div className=' mx-auto'>
          {/* Hospital Terms Section */}
          <div className='mb-20'>
            <h2 className='text-2xl  font-bold text-[#3E4095] mb-8 border-b-2 border-[#3E4095] pb-2 inline-block'>HOSPITAL TERMS & CONDITIONS</h2>
            <div className="space-y-8 text-sm text-[#464646] leading-relaxed">
                <p className='text-sm'>
                By completing registration on <strong>DocuHealth (“Platform”)</strong>, the Hospital <strong>(“User”, “Hospital”, “You”)</strong> agrees to
                the following Terms and Conditions.
                </p>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">1. Scope of Service</h3>
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
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">2. Hospital Responsibilities</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Ensure all patient data entered is accurate and up to date.</li>
                    <li>Restrict access to authorized personnel only.</li>
                    <li>Maintain the confidentiality of login credentials.</li>
                    <li>Use the platform strictly for lawful and professional medical purposes.</li>
                    <li>Comply with all applicable healthcare regulations and patient privacy laws.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">3. Patient Data & Documentation Policy</h3>
                
                <div className='ml-4 mt-4'>
                    <h4 className='font-bold text-[#3E4095] mb-2'>3.1 Internal Clinical Documentation</h4>
                    <p>
                        All detailed medical records entered into DocuHealth shall remain strictly internal to the Hospital’s
                        system and are not visible to patients.
                    </p>
                </div>

                <div className='ml-4 mt-6'>
                    <h4 className='font-bold text-[#3E4095] mb-2'>3.2 Patient-Visible Medical Summary</h4>
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
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">4. Data Protection & Privacy</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>DocuHealth implements industry-standard security measures to protect data.</li>
                    <li>The Hospital retains ownership of its patient data.</li>
                    <li>DocuHealth will not access or share patient data except as required to operate the platform or when legally required.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">5. Platform Usage & Restrictions</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>No fraudulent or unauthorized activities.</li>
                    <li>No reverse engineering, copying, or reselling the platform.</li>
                    <li>No access granted to unauthorized third parties.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">6. Subscription & Payments</h3>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Some features may require a paid subscription.</li>
                    <li>Failure to pay may result in restricted access or suspension.</li>
                </ol>
                </section>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">7. Service Availability & Updates</h3>
                <p>
                    DocuHealth will strive to maintain high uptime but does not guarantee uninterrupted service. Features 
                    may be updated or modified at any time.
                </p>
                </section>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">8. Limitation of Liability</h3>
                <p>
                    DocuHealth is not liable for medical decisions, data entry errors, or patient care outcomes.
                </p>
                </section>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">9. Termination</h3>
                <p>
                    DocuHealth may suspend or terminate access if terms are violated or misuse occurs. Hospitals may 
                    discontinue use at any time.
                </p>
                </section>

                <section>
                <h3 className="text-lg font-bold text-[#3E4095] mb-3">10. Acceptance of Terms</h3>
                <p>
                    By completing registration, the Hospital confirms that it has read and agreed to these Terms and 
                    Conditions.
                </p>
                </section>

                <div className='bg-[#F6FCFE] p-6 border-l-4 border-[#3E4095] rounded-r-md mt-10 shadow-sm'>
                    <h3 className='text-md font-bold text-[#3E4095] mb-2'>Agreement Statement</h3>
                    <p className='text-sm font-medium italic text-[#464646]'>
                        "I agree to the Terms & Conditions and understand that internal clinical documentation remains
                        restricted to hospital use, while patients will only access summarized medical records."
                    </p>
                </div>

                {/* API CTA */}
                <div className='mt-12 bg-white py-6  px-5 sm:px-6 border rounded-md text-center'>
                    <h3 className='text-lg font-bold text-[#3E4095] mb-3'>Integrating with DocuHealth API?</h3>
                    <p className='mb-4 text-sm'>
                        If you are a developer or an EMR system looking to integrate our After Visit Summary (AVS) API, 
                        please review our specific API terms.
                    </p>
                    <Link to='/api-terms-and-conditions'>
                        <button className='bg-[#3E4095] text-white px-6 py-2.5 rounded-full hover:bg-blue-900 transition-colors font-medium w-full sm:w-auto'>
                            View API Terms & Conditions
                        </button>
                    </Link>
                </div>

            </div>
          </div>

        </div>
      </div>
    </BackgroundTemplate2>
  )
}

export default Terms_And_Conditions_Page
