import React from 'react'
import { motion } from 'framer-motion'
import footerImg from '../../../assets/img/footerImg.png'
import footerImgMobile from '../../../assets/img/footerImgMobile.png'
import { Link } from 'react-router-dom'
import { Instagram, Twitter, Linkedin, Youtube, Facebook } from "lucide-react";
import Newsletter from './Newsletter';

const Footer = () => {
  return (
    <motion.div 
      className='bg-cover bg-center bg-no-repeat w-full'
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      style={{
        backgroundImage: `url(${window.innerWidth < 768 ? footerImgMobile : footerImg})`,
      }}
    >
      {/* Outer wrapper to restrict max width of content while background stretches */}
      <div className="max-w-7xl 2xl:max-w-[1500px] mx-auto w-full">
        
        <Newsletter />
        <hr className='border-[#BDB5B5]/30 mx-5 sm:mx-16' />

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row flex-wrap justify-between px-5 sm:px-16 py-14 text-white gap-10 lg:gap-0">
          {/* Left Section */}
          <div className="max-w-sm">
            <h1 className="text-3xl 2xl:text-4xl font-bold mb-2">DOCUHEALTH</h1>
            <p className="text-sm 2xl:text-lg mb-4 text-[#EFEFEF]">
              Nigeria’s First Centralized Healthcare Platform
            </p>
            
            <div className="flex space-x-4 pb-5 text-[#EFEFEF]/80">
              <a href="https://x.com/docuhealth_ng?s=21&t=FutCRTGkQ92qZSH7s9tCwA" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="w-5 h-5 hover:text-white transition-colors" />
              </a>
              <a href="#" aria-label="Facebook">
                <Facebook className="w-5 h-5 hover:text-white transition-colors" />
              </a>
              <a href="https://www.instagram.com/docuhealthservices?igsh=aGIwcXA3anhoNzQz" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-5 h-5 hover:text-white transition-colors" />
              </a>
              <a href="https://www.linkedin.com/company/docuhealthservices/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 hover:text-white transition-colors" />
              </a>
              <a href="https://www.youtube.com/@Docuhealth_ng" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube className="w-5 h-5 hover:text-white transition-colors" />
              </a>
            </div>

            <div className="mb-5">
              <img
                src="https://res.cloudinary.com/drhfrgahv/image/upload/v1778081304/WhatsApp_Image_2026-05-04_at_08.37.36_g8lo95.jpg"
                alt="DocuHealth New Certificate"
                width={320}
                height={240}
                className="w-80 rounded-xl shadow-lg border border-white/20 object-cover"
              />
            </div>
            <div className="flex gap-4">
              <img
                src="https://res.cloudinary.com/drhfrgahv/image/upload/v1762777839/docuhealth_ndpr_audit_lwqlq8.jpg"
                alt="DocuHealth NDPR Audit"
                width={160}
                height={120}
                className="w-32 rounded-lg object-contain"
              />
              <img
                src="https://res.cloudinary.com/drhfrgahv/image/upload/v1762777826/docuhealth_fhir_zdtw2p.jpg"
                alt="DocuHealth FHIR"
                width={240}
                height={180}
                className="w-44 rounded-lg object-contain"
              />
            </div>
          </div>

          {/* Middle Section */}
          <div>
            <h2 className="text-xl 2xl:text-2xl font-semibold mb-3">Our Company</h2>
            <ul className="space-y-2 2xl:text-lg text-sm text-[#EFEFEF] opacity-90">
              <li><a href="/#about-us" className="hover:underline">About us</a></li>
              <li><Link to="/our-mission" className="hover:underline">Mission</Link></li>
              <li><Link to="/our-vision" className="hover:underline">Vision</Link></li>
              <li><Link to="/docuhealth-api" className="hover:underline">DocuHealth API</Link></li>
              <li><Link to="/legal-notice" className="hover:underline">Legal Notice</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:underline">Terms and Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:underline">Privacy policy</Link></li>
            </ul>
          </div>

          {/* Right Section */}
          <div>
            <h2 className="text-xl 2xl:text-2xl font-semibold mb-3">Contact us</h2>
            <ul className="space-y-2 2xl:text-lg text-sm text-[#EFEFEF] opacity-90">
              <li>+2348081988860</li>
              <li>
                <a href="mailto:Info@docuhealth.online" className="hover:underline">
                  Info@docuhealth.online
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile / Tablet Layout */}
        <div className="lg:hidden flex flex-row flex-wrap justify-between px-5 sm:px-16 py-14 text-white gap-10">
          <div>
            <h2 className="text-xl font-semibold mb-3">Our Company</h2>
            <ul className="space-y-2 text-sm text-[#EFEFEF] opacity-90">
              <li><a href="/#about-us">About us</a></li>
              <li><Link to="/our-mission">Mission</Link></li>
              <li><Link to="/our-vision">Vision</Link></li>
              <li><Link to="/docuhealth-api">DocuHealth API</Link></li>
              <li><Link to="/legal-notice">Legal Notice</Link></li>
              <li><Link to="/terms-and-conditions">Terms and Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy policy</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Contact us</h2>
            <ul className="space-y-2 text-sm text-[#EFEFEF] opacity-90">
              <li>+2348081988860</li>
              <li>
                <a href="mailto:Support@docuhealthservices.com">
                  Support@docuhealthservices.com
                </a>
              </li>
              <li>
                <a href="mailto:Info@docuhealth.online">
                  Info@docuhealth.online
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full">
            <h1 className="text-3xl font-bold mb-2">DOCUHEALTH</h1>
            <p className="text-sm mb-4 text-[#EFEFEF]">
              Nigeria’s First Centralized Healthcare Platform
            </p>
            
            <div className="flex space-x-4 pb-5 text-[#EFEFEF]/80">
              <a href="https://x.com/docuhealth_ng?s=21&t=FutCRTGkQ92qZSH7s9tCwA" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/docuhealthservices?igsh=aGIwcXA3anhoNzQz" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/docuhealthservices/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@Docuhealth_ng" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            <div className="mb-4">
              <img
                src='https://res.cloudinary.com/drhfrgahv/image/upload/v1778081304/WhatsApp_Image_2026-05-04_at_08.37.36_g8lo95.jpg'
                alt="docuhealth new certificate"
                className="w-full sm:w-2/3 max-w-sm object-cover rounded-3xl shadow-lg border border-white/20"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src='https://res.cloudinary.com/drhfrgahv/image/upload/v1762777839/docuhealth_ndpr_audit_lwqlq8.jpg'
                alt="docuhealth ndpr audit image"
                className="w-full sm:w-1/3 max-w-[160px] object-contain rounded-xl"
              />
              <img
                src='https://res.cloudinary.com/drhfrgahv/image/upload/v1762777826/docuhealth_fhir_zdtw2p.jpg'
                alt="docuhealth fhir image"
                className="w-full sm:w-1/2 max-w-[220px] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>

        <hr className='border-[#BDB5B5]/30 mx-5 sm:mx-16' />
        
        {/* Copyright Footer text */}
        <div className='text-center text-[#BDB5B5] py-5'>
          <p className='hidden sm:block text-sm text-[#EFEFEF] 2xl:text-lg'>  
            &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved. Designed and developed by Docuhealth Tech Team.
          </p>
          <p className='block sm:hidden p-3 text-xs text-[#EFEFEF] pb-5'>  
            &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved. Designed and developed by Docuhealth Tech Team.
          </p>
        </div>

      </div>
    </motion.div>
  )
}

export default Footer