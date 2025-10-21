import React from 'react'
import footerImg from '../../../assets/img/footerImg.png'
import { Link } from 'react-router-dom'
import { Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <div>
      <img src={footerImg} alt="" />
      <hr className='text-gray-200' />
      <div className='bg-[#0E0E31] text-center text-[#7B7B93]  sm:py-3'>
        <div className='flex justify-between px-5 py-5 sm:py-1'>
        <div className="flex gap-2 items-center">
      <a href="https://www.instagram.com/docuhealthservices?igsh=aGIwcXA3anhoNzQz" target="_blank" rel="noopener noreferrer">
        <Instagram className="w-5 h-5 text-white cursor-pointer" />
      </a>
      <a href="https://x.com/docuhealth_ng?s=21&t=FutCRTGkQ92qZSH7s9tCwA" target="_blank" rel="noopener noreferrer">
        <Twitter className="w-5 h-5 text-white cursor-pointer" />
      </a>
      <a href="https://www.linkedin.com/company/docuhealthservices/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
        <Linkedin className="w-5 h-5 text-white cursor-pointer" />
      </a>
    </div>
        <Link to="/privacy-policy" className='text-sm  text-white/90 '> <p className='text-right  underline'>Our Privacy Policy</p></Link>
        </div>
        

        <p className='hidden sm:block text-sm'>  &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved.
          Designed and  developed <br /> by Docuhealth Tech Team.</p>
        <p className='block sm:hidden p-3 text-[10px]'>  &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved.
          Designed and  developed by Docuhealth Tech Team.</p>

      </div>
    </div>
  )
}

export default Footer
