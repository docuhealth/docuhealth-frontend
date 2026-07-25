import React from "react";
import BackgroundTemplate from "../ui/BackgroundTemplate";
import { FileText, Activity, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const Core_Product_Section = () => {
  const core_products = [
    {
      icon: FileText,
      title: "DocuCore (For Providers)",
      description:
        "The clinical backbone for hospitals, clinics, and laboratories",
      points: [
        "Unified patient record and documentation system",
        "Secure sharing of medical summaries and lab results",
        "Integrated billing and insurance claim management",
        "Seamless communication with pharmacies and other care teams",
      ],
    },
    {
      icon: Activity,
      title: "My DocuHealth (For Patients)",
      description: "Your lifelong health companion",
      points: [
        "View test results, discharge and after-visit summaries",
        "Track medications and follow-up appointments",
        "Access secure messaging and telehealth services",
        "Control who sees your health information, anytime",
      ],
    },
    {
      icon: DollarSign,
      title: "DocuBill (Payer platform)",
      description: "For Insurers, HMOs, and National Health Authorities",
      points: [
        "Real-time claims verification and adjudication",
        "Transparent reimbursements and fraud detection",
        "Analytics dashboards for financial and service optimization",
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <>
      <BackgroundTemplate>
        {/* Full-width container handling vertical padding and background mapping */}
        <div className="py-24 text-sm text-docuhealth-gray" id="our-services">
          
          {/* PERFECTLY MATCHED NAVBAR CONTAINER */}
          <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full px-8 xl:px-16">
            
            <motion.h2 
              className="font-semibold pb-4 text-2xl lg:text-3xl 2xl:text-4xl text-docuhealth-primary text-center"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              DocuHealth Core Product
            </motion.h2>
            
            <motion.p 
              className="text-center pb-8 2xl:text-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Find out everything you need to know about our core products
            </motion.p>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {core_products.map((core_product, index) => {
                const Icon = core_product.icon;
                return (
                  <motion.div 
                    key={index} 
                    className="p-8 border rounded-lg bg-white hover:shadow-md transition-shadow flex flex-col justify-between"
                    variants={cardVariants}
                  >
                    <div>
                      <div className="w-16 h-16 bg-docuhealth-primary rounded-full flex items-center justify-center mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-docuhealth-primary font-semibold text-lg mb-2 2xl:text-xl">
                        {core_product.title}
                      </h3>
                      <p className="text-gray-600 mb-4 font-semibold 2xl:text-lg">
                        {core_product.description}
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1 2xl:text-lg">
                        {core_product.points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </div>
      </BackgroundTemplate>
    </>
  );
};

export default Core_Product_Section;