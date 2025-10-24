import React, { useState } from "react";
import BackgroundTemplate from "../ui/BackgroundTemplate";
import { Plus } from "lucide-react";
import faq_img from '../../../assets/img/faq_img.png'
const FAQ_Section = () => {

  const faqData = [
    {
      question: "Can DocuHealth be trusted?",
      answer:
        "Yes, DocuHealth prioritizes security, transparency, and compliance. We ensure all user data is handled safely and ethically.",
    },
    {
      question: "Can DocuHealth’s API be shared?",
      answer:
        "DocuHealth’s API is designed for internal and authorized third-party use only. Unauthorized sharing is not allowed.",
    },
    {
      question: "Is DocuHealth NDPR compliant?",
      answer:
        "Absolutely. DocuHealth adheres to NDPR standards to ensure the protection and privacy of user data.",
    },
    {
      question: "Are my data safe and protected on DocuHealth?",
      answer:
        "Yes, your data is stored securely with encryption and backed by strong access control measures.",
    },
    {
      question: "Is DocuHealth Services for everyone?",
      answer:
        "DocuHealth services are designed to cater to individuals, healthcare providers, and organizations of all sizes.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <>
      <BackgroundTemplate>
        <section className="py-24 px-5 lg:px-16 text-sm text-[#464646] bg-[#F6FCFE] lg:bg-white" id="faq">
          <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-10 ">
            {/* Left side: FAQs */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-2xl lg:text-3xl font-semibold text-[#3E4095] mb-4">
                Frequently asked questions (FAQ)
              </h2>
              <p className="mb-6">
                See the answers to some of the frequent questions we’re being asked
              </p>

              <div className="space-y-3">
                {faqData.map((item, index) => (
                  <div
                    key={index}
                    className={`bg-white lg:bg-[#f5f9ff] ${openIndex === index ? 'rounded-sm' : 'rounded-full'} overflow-hidden shadow-sm transition-all duration-100`}
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex justify-between items-center px-5 py-3  text-left"
                    >
                      <span className="text-[#3E4095] font-medium text-sm md:text-base">
                        {item.question}
                      </span>
                      <Plus
                        className={`w-5 h-5 text-[#3E4095] transform transition-transform duration-500 ${openIndex === index ? "rotate-[360deg]" : "rotate-0"
                          }`}
                      />
                    </button>

                    <div
                      className={`px-5 text-sm text-gray-600 transition-all duration-500 ease-in-out ${openIndex === index
                          ? "max-h-40 opacity-100 pb-2"
                          : "max-h-0 opacity-0 overflow-hidden"
                        }`}
                    >
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: illustration (optional placeholder) */}
            <div className="hidden md:flex w-full lg:w-1/2 items-center justify-center">
              <img
                src={faq_img}
                alt="FAQ Illustration"
                className="object-contain"
              />
            </div>
          </div>
        </section>
      </BackgroundTemplate>
    </>
  )
}

export default FAQ_Section