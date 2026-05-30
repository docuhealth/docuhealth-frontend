import React, { useState } from "react";
import BackgroundTemplate from "../ui/BackgroundTemplate";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <BackgroundTemplate>
        {/* Full-width wrapper handling background mapping and section identity */}
        <section className="py-24 text-sm text-[#464646] bg-[#F6FCFE] lg:bg-white" id="faq">
          
          {/* PERFECTLY MATCHED NAVBAR CONTAINER */}
          <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full px-8 xl:px-16">
            <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-10">
              
              {/* Left side: FAQs */}
              <div className="w-full lg:w-1/2">
                <motion.h2 
                  className="text-2xl lg:text-3xl 2xl:text-4xl font-semibold text-[#3E4095] mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  Frequently asked questions (FAQ)
                </motion.h2>
                <motion.p 
                  className="mb-6 2xl:text-xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  See the answers to some of the frequent questions we’re being asked
                </motion.p>

                <motion.div 
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {faqData.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className={`bg-white lg:bg-[#f5f9ff] ${openIndex === index ? 'rounded-xs' : 'rounded-full'} overflow-hidden shadow-xs transition-all duration-100`}
                    >
                      <button
                        onClick={() => toggleAccordion(index)}
                        className="w-full flex justify-between items-center px-5 py-3 text-left"
                      >
                        <span className="text-[#3E4095] font-medium text-sm md:text-base 2xl:text-lg">
                          {item.question}
                        </span>
                        <Plus
                          className={`w-5 h-5 text-[#3E4095] transform transition-transform duration-500 ${openIndex === index ? "rotate-90" : "rotate-0"}`}
                        />
                      </button>

                      <motion.div
                        initial={false}
                        animate={{ 
                          height: openIndex === index ? "auto" : 0,
                          opacity: openIndex === index ? 1 : 0
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="px-5 text-sm text-gray-600 2xl:text-lg overflow-hidden"
                      >
                        <div className="pb-2">
                          {item.answer}
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right side: illustration */}
              <motion.div 
                className="hidden md:flex w-full lg:w-1/2 items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <img
                  src="https://res.cloudinary.com/drhfrgahv/image/upload/f_auto,q_auto,w_600/v1762777829/faq_img_btvz2n.png"
                  alt="FAQ Illustration"
                  width="600"
                  height="400"
                  className="object-contain w-full h-auto mx-auto"
                />
              </motion.div>
              
            </div>
          </div>
        </section>
      </BackgroundTemplate>
    </>
  );
};

export default FAQ_Section;