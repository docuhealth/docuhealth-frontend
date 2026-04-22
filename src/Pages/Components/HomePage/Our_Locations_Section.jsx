import React from "react";
import { motion } from "framer-motion";

const Our_Locations_Section = () => {
  return (
    <section className="py-10 lg:pt-20 px-5 lg:px-16 text-sm text-[#464646] bg-white overflow-hidden" id="our-locations">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full text-center mb-12"
        >
          <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-semibold text-[#3E4095] mb-4 block">
            Our Locations
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Find an operational branch near you. More locations to be added!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full ">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center p-8 bg-[#F6FCFE] rounded-lg border hover:shadow transition-all text-center"
          >
            <div className="bg-[#3E4095] p-4 rounded-full mb-4 shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#FFFFFF"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#3E4095] mb-3">Osun State Branch</h3>
            <p className="font-medium text-gray-600">MDS Under Bridge, After Justrite</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center p-8 bg-white border border-dashed border-gray-300 rounded-lg hover:shadow-md tration-all text-center"
          >
            <div className="bg-gray-300 p-4 rounded-full mb-4 shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#FFFFFF"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-500 mb-3">Lagos State Branch</h3>
            <span className="bg-[#E6F4FB] text-[#3E4095] text-xs font-bold px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-wide">Coming Soon</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col items-center p-8 bg-white border border-dashed border-gray-300 rounded-lg hover:shadow-md tration-all text-center justify-start"
          >
            <div className="bg-gray-300 p-4 rounded-full mb-4 shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16 11H13V8C13 7.45 12.55 7 12 7C11.45 7 11 7.45 11 8V11H8C7.45 11 7 11.45 7 12C7 12.55 7.45 13 8 13H11V16C11 16.55 11.45 17 12 17C12.55 17 13 16.55 13 16V13H16C16.55 13 17 12.55 17 12C17 11.45 16.55 11 16 11Z" fill="#FFFFFF"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-500 mb-3">More Locations</h3>
          <span className="bg-[#E6F4FB] text-[#3E4095] text-xs font-bold px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-wide">Expanding Soon</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Our_Locations_Section;
