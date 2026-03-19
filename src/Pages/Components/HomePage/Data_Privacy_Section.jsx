import React from "react";
import BackgroundTemplate from "../ui/BackgroundTemplate";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const Data_Privacy_Section = () => {
    const securityData = [
  {
    text: "End-to-end encryption",
    color: "bg-[#E7E4FD]",
  },
  {
    text: "Role-based data access",
    color: "bg-[#FDF4E4]",
  },
  {
    text: "Secure authentication",
    color: "bg-[#FDE4E4]",
  },
  {
    text: "Patient-permission-based access",
    color: "bg-[#E4ECFD]",
  },
  {
    text: "NDPR compliant under the National Data Protection Commission (NDPC)",
    color: "bg-[#ECE4FD]",
  },
];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <BackgroundTemplate>
        <section id="docuhealth_data_privacy" className="py-24 px-5 lg:px-16 text-sm text-[#464646] bg-white lg:bg-[#F6FCFE] ">
          <div className="w-full flex flex-col-reverse lg:flex-row items-start justify-between gap-10 ">
            <motion.div 
              className="hidden md:flex w-full lg:w-1/2 items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src="https://res.cloudinary.com/drhfrgahv/image/upload/f_auto,q_auto,w_600/v1762777827/data_privacy_img_bg5a9y.png"
                alt="Data Privacy Illustration"
                width="600"
                height="400"
                className="object-contain w-full h-auto"
              />
            </motion.div>
            <div className="w-full lg:w-1/2">
              <motion.h2 
                className="text-2xl lg:text-3xl 2xl:text-4xl font-semibold text-[#3E4095] mb-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Data Privacy & Security
              </motion.h2>
              <motion.p 
                className="mb-6 2xl:text-xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                At DocuHealth we follow global healthcare security standards:
              </motion.p>
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {securityData.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`flex  items-center gap-2 justify-start rounded-md lg:rounded-full ${item.color} py-3 px-5 shadow-xs transition-all duration-300
                      ${index % 2 === 0 ? "lg:mr-10" : "lg:ml-10"}
                    `}
                  >
                    <div className="bg-[#1f1f75] p-0.5 rounded-sm">
                      <Check className="text-white w-3 h-3" />
                    </div>
                    <span className="text-[#1f1f75] text-sm  font-medium 2xl:text-lg">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </BackgroundTemplate>
    </>
  );
};
export default Data_Privacy_Section;
