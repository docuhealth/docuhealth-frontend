import React from 'react'
import footerImg from '../../assets/img/footerImg.png'

const Footer = () => {
  return (
    <div>
      <img src={footerImg} alt="" />
      <hr className='text-gray-200'/>
      <div className='bg-[#0E0E31] text-center text-[#7B7B93]  sm:py-3'>
          <p className='hidden sm:block text-sm'>  &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved.  
          Designed and  developed <br /> by Docuhealth Tech Team.</p>
          <p className='block sm:hidden p-3 text-[10px]'>  &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved.  
          Designed and  developed by Docuhealth Tech Team.</p>
      </div>
    </div>
  )
}

export default Footer
