import React from 'react'
import footerImg from '../../../assets/img/footerImg.png'
import footerImgMobile from '../../../assets/img/footerImgMobile.png'
import docuhealth_ndpr_audit from '../../../assets/img/docuhealth_ndpr_audit.jpg'
import docuhealth_fhir from '../../../assets/img/docuhealth_fhir.jpg'
import { Link } from 'react-router-dom'
import { Instagram, Twitter, Linkedin } from "lucide-react";
import Newsletter from './Newsletter';

const Footer = () => {
  return (
    <div className='bg-cover bg-center bg-no-repeat '
      style={{
        backgroundImage: `url(${window.innerWidth < 768 ? footerImgMobile : footerImg})`,
         }}>

      <Newsletter />
      <hr className='text-[#BDB5B5]' />
      <div className="hidden lg:flex flex-col lg:flex-row flex-wrap justify-between px-5 sm:px-16 py-14 text-white gap-10 lg:gap-0">
        {/* Left Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">DOCUHEALTH</h1>
          <p className="text-sm mb-4 text-[#EFEFEF]">
            Nigeria’s First Centralized Healthcare Platform
          </p>
          <div className="flex space-x-4 pb-5">
            <a href="https://x.com/docuhealth_ng?s=21&t=FutCRTGkQ92qZSH7s9tCwA" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2125 5.65605C21.4491 5.99375 20.6395 6.21555 19.8106 6.31411C20.6839 5.79132 21.3374 4.9689 21.6493 4.00005C20.8287 4.48761 19.9305 4.83077 18.9938 5.01461C18.2031 4.17106 17.098 3.69303 15.9418 3.69434C13.6326 3.69434 11.7597 5.56661 11.7597 7.87683C11.7597 8.20458 11.7973 8.52242 11.8676 8.82909C8.39048 8.65404 5.31008 6.99005 3.24678 4.45941C2.87529 5.09767 2.68006 5.82318 2.68105 6.56167C2.68105 8.01259 3.41961 9.29324 4.5415 10.043C3.87738 10.022 3.22789 9.84264 2.64719 9.51973C2.64655 9.5373 2.64654 9.55487 2.64654 9.57148C2.64654 11.5984 4.0882 13.2892 6.002 13.6731C5.64281 13.7703 5.27233 13.8194 4.90022 13.8191C4.62997 13.8191 4.36772 13.7942 4.1128 13.7453C4.64532 15.4065 6.18886 16.6159 8.0196 16.6491C6.53813 17.8118 4.70869 18.4426 2.82543 18.4399C2.49212 18.4402 2.15909 18.4205 1.82812 18.3811C3.74004 19.6102 5.96552 20.2625 8.23842 20.2601C15.9316 20.2601 20.138 13.8875 20.138 8.36111C20.138 8.1803 20.1336 7.99886 20.1256 7.81997C20.9443 7.22845 21.651 6.49567 22.2125 5.65605Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
            <a href="#" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
            <a href="https://www.instagram.com/docuhealthservices?igsh=aGIwcXA3anhoNzQz" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.0281 2.00049C14.1535 2.00235 14.7238 2.00831 15.2166 2.02298L15.4107 2.02932C15.6349 2.03729 15.8561 2.04729 16.1228 2.05979C17.1869 2.10896 17.9128 2.27729 18.5503 2.52479C19.2094 2.77896 19.7661 3.12229 20.3219 3.67813C20.8769 4.23396 21.2203 4.79229 21.4753 5.44979C21.7219 6.08646 21.8903 6.81313 21.9403 7.87729C21.9522 8.14396 21.9618 8.36516 21.9697 8.5894L21.976 8.78349C21.9906 9.27623 21.9973 9.84662 21.9994 10.9721L22.0002 11.7177C22.0003 11.8088 22.0003 11.9028 22.0003 11.9998L22.0002 12.2819L21.9996 13.0276C21.9977 14.153 21.9918 14.7234 21.9771 15.2161L21.9707 15.4102C21.9628 15.6345 21.9528 15.8557 21.9403 16.1223C21.8911 17.1865 21.7219 17.9123 21.4753 18.5498C21.2211 19.209 20.8769 19.7657 20.3219 20.3215C19.7661 20.8765 19.2069 21.2198 18.5503 21.4748C17.9128 21.7215 17.1869 21.8898 16.1228 21.9398C15.8561 21.9517 15.6349 21.9614 15.4107 21.9692L15.2166 21.9755C14.7238 21.9902 14.1535 21.9968 13.0281 21.999L12.2824 21.9998C12.1913 21.9998 12.0973 21.9998 12.0003 21.9998H11.7182L10.9725 21.9991C9.8471 21.9973 9.27672 21.9913 8.78397 21.9766L8.58989 21.9703C8.36564 21.9623 8.14444 21.9523 7.87778 21.9398C6.81361 21.8907 6.08861 21.7215 5.45028 21.4748C4.79194 21.2207 4.23444 20.8765 3.67861 20.3215C3.12278 19.7657 2.78028 19.2065 2.52528 18.5498C2.27778 17.9123 2.11028 17.1865 2.06028 16.1223C2.0484 15.8557 2.03871 15.6345 2.03086 15.4102L2.02457 15.2161C2.00994 14.7234 2.00327 14.153 2.00111 13.0276L2.00098 10.9721C2.00284 9.84662 2.00879 9.27623 2.02346 8.78349L2.02981 8.5894C2.03778 8.36516 2.04778 8.14396 2.06028 7.87729C2.10944 6.81229 2.27778 6.08729 2.52528 5.44979C2.77944 4.79146 3.12278 4.23396 3.67861 3.67813C4.23444 3.12229 4.79278 2.77979 5.45028 2.52479C6.08778 2.27729 6.81278 2.10979 7.87778 2.05979C8.14444 2.04792 8.36564 2.03823 8.58989 2.03038L8.78397 2.02409C9.27672 2.00945 9.8471 2.00278 10.9725 2.00062L13.0281 2.00049ZM12.0003 6.99979C9.23738 6.99979 7.00028 9.23932 7.00028 11.9998C7.00028 14.7627 9.23981 16.9998 12.0003 16.9998C14.7632 16.9998 17.0003 14.7603 17.0003 11.9998C17.0003 9.23689 14.7607 6.99979 12.0003 6.99979ZM12.0003 8.99979C13.6572 8.99979 15.0003 10.3425 15.0003 11.9998C15.0003 13.6567 13.6576 14.9998 12.0003 14.9998C10.3434 14.9998 9.00028 13.6572 9.00028 11.9998C9.00028 10.3429 10.3429 8.99979 12.0003 8.99979ZM17.2503 5.49979C16.561 5.49979 16.0003 6.0597 16.0003 6.74894C16.0003 7.43819 16.5602 7.99896 17.2503 7.99896C17.9395 7.99896 18.5003 7.43906 18.5003 6.74894C18.5003 6.0597 17.9386 5.49893 17.2503 5.49979Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
            <a href="https://www.linkedin.com/company/docuhealthservices/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3362 18.339H15.6707V14.1622C15.6707 13.1662 15.6505 11.8845 14.2817 11.8845C12.892 11.8845 12.6797 12.9683 12.6797 14.0887V18.339H10.0142V9.75H12.5747V10.9207H12.6092C12.967 10.2457 13.837 9.53325 15.1367 9.53325C17.8375 9.53325 18.337 11.3108 18.337 13.6245L18.3362 18.339ZM7.00373 8.57475C6.14573 8.57475 5.45648 7.88025 5.45648 7.026C5.45648 6.1725 6.14648 5.47875 7.00373 5.47875C7.85873 5.47875 8.55173 6.1725 8.55173 7.026C8.55173 7.88025 7.85798 8.57475 7.00373 8.57475ZM8.34023 18.339H5.66723V9.75H8.34023V18.339ZM19.6697 3H4.32923C3.59498 3 3.00098 3.5805 3.00098 4.29675V19.7033C3.00098 20.4202 3.59498 21 4.32923 21H19.6675C20.401 21 21.001 20.4202 21.001 19.7033V4.29675C21.001 3.5805 20.401 3 19.6675 3H19.6697Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
          </div>
          <div className='flex gap-10'>
 <img src={docuhealth_ndpr_audit} alt="docuhealth ndpr audit image" className='w-40 rounded-lg' />
          <img src={docuhealth_fhir} alt="docuhealth fhir image" className=' w-60 rounded-lg' />
          </div>
         
        </div>

        {/* Middle Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Our Company</h2>
          <ul className="space-y-2 text-sm text-[#EFEFEF]">
            <li><a href="/#about-us">About us</a></li>
            <li><Link to="/our-mission">Mission</Link></li>
            <li><Link to="/our-vision">Vision</Link></li>
            <li><Link to="/docuhealth-api">DocuHealth API</Link></li>
            <li><Link to="/our-legal-notice">Legal Notice</Link></li>
            <li><Link to="/our-privacy-policy">Our privacy policy</Link></li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Contact us</h2>
          <ul className="space-y-2 text-sm text-[#EFEFEF] ">
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
      </div>
      <div className="lg:hidden flex flex-row flex-wrap justify-between px-5 sm:px-16 py-14 text-white gap-10 lg:gap-0">
        {/* Left Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Our Company</h2>
          <ul className="space-y-2 text-sm text-[#EFEFEF]">
             <li><a href="/#about-us">About us</a></li>
            <li><Link to="/our-mission">Mission</Link></li>
            <li><Link to="/our-vision">Vision</Link></li>
            <li><Link to="/docuhealth-api">DocuHealth API</Link></li>
            <li><Link to="/our-legal-notice">Legal Notice</Link></li>
            <li><Link to="/our-privacy-policy">Our privacy policy</Link></li>
          </ul>
        </div>
      

        {/* Middle Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Contact us</h2>
          <ul className="space-y-2 text-sm text-[#EFEFEF]">
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
      

        {/* Right Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">DOCUHEALTH</h1>
          <p className="text-sm mb-4 text-[#EFEFEF]">
            Nigeria’s First Centralized Healthcare Platform
          </p>
          <div className="flex space-x-4 pb-5">
            <a href="https://x.com/docuhealth_ng?s=21&t=FutCRTGkQ92qZSH7s9tCwA" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2125 5.65605C21.4491 5.99375 20.6395 6.21555 19.8106 6.31411C20.6839 5.79132 21.3374 4.9689 21.6493 4.00005C20.8287 4.48761 19.9305 4.83077 18.9938 5.01461C18.2031 4.17106 17.098 3.69303 15.9418 3.69434C13.6326 3.69434 11.7597 5.56661 11.7597 7.87683C11.7597 8.20458 11.7973 8.52242 11.8676 8.82909C8.39048 8.65404 5.31008 6.99005 3.24678 4.45941C2.87529 5.09767 2.68006 5.82318 2.68105 6.56167C2.68105 8.01259 3.41961 9.29324 4.5415 10.043C3.87738 10.022 3.22789 9.84264 2.64719 9.51973C2.64655 9.5373 2.64654 9.55487 2.64654 9.57148C2.64654 11.5984 4.0882 13.2892 6.002 13.6731C5.64281 13.7703 5.27233 13.8194 4.90022 13.8191C4.62997 13.8191 4.36772 13.7942 4.1128 13.7453C4.64532 15.4065 6.18886 16.6159 8.0196 16.6491C6.53813 17.8118 4.70869 18.4426 2.82543 18.4399C2.49212 18.4402 2.15909 18.4205 1.82812 18.3811C3.74004 19.6102 5.96552 20.2625 8.23842 20.2601C15.9316 20.2601 20.138 13.8875 20.138 8.36111C20.138 8.1803 20.1336 7.99886 20.1256 7.81997C20.9443 7.22845 21.651 6.49567 22.2125 5.65605Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
            <a href="#" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
            <a href="https://www.instagram.com/docuhealthservices?igsh=aGIwcXA3anhoNzQz" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.0281 2.00049C14.1535 2.00235 14.7238 2.00831 15.2166 2.02298L15.4107 2.02932C15.6349 2.03729 15.8561 2.04729 16.1228 2.05979C17.1869 2.10896 17.9128 2.27729 18.5503 2.52479C19.2094 2.77896 19.7661 3.12229 20.3219 3.67813C20.8769 4.23396 21.2203 4.79229 21.4753 5.44979C21.7219 6.08646 21.8903 6.81313 21.9403 7.87729C21.9522 8.14396 21.9618 8.36516 21.9697 8.5894L21.976 8.78349C21.9906 9.27623 21.9973 9.84662 21.9994 10.9721L22.0002 11.7177C22.0003 11.8088 22.0003 11.9028 22.0003 11.9998L22.0002 12.2819L21.9996 13.0276C21.9977 14.153 21.9918 14.7234 21.9771 15.2161L21.9707 15.4102C21.9628 15.6345 21.9528 15.8557 21.9403 16.1223C21.8911 17.1865 21.7219 17.9123 21.4753 18.5498C21.2211 19.209 20.8769 19.7657 20.3219 20.3215C19.7661 20.8765 19.2069 21.2198 18.5503 21.4748C17.9128 21.7215 17.1869 21.8898 16.1228 21.9398C15.8561 21.9517 15.6349 21.9614 15.4107 21.9692L15.2166 21.9755C14.7238 21.9902 14.1535 21.9968 13.0281 21.999L12.2824 21.9998C12.1913 21.9998 12.0973 21.9998 12.0003 21.9998H11.7182L10.9725 21.9991C9.8471 21.9973 9.27672 21.9913 8.78397 21.9766L8.58989 21.9703C8.36564 21.9623 8.14444 21.9523 7.87778 21.9398C6.81361 21.8907 6.08861 21.7215 5.45028 21.4748C4.79194 21.2207 4.23444 20.8765 3.67861 20.3215C3.12278 19.7657 2.78028 19.2065 2.52528 18.5498C2.27778 17.9123 2.11028 17.1865 2.06028 16.1223C2.0484 15.8557 2.03871 15.6345 2.03086 15.4102L2.02457 15.2161C2.00994 14.7234 2.00327 14.153 2.00111 13.0276L2.00098 10.9721C2.00284 9.84662 2.00879 9.27623 2.02346 8.78349L2.02981 8.5894C2.03778 8.36516 2.04778 8.14396 2.06028 7.87729C2.10944 6.81229 2.27778 6.08729 2.52528 5.44979C2.77944 4.79146 3.12278 4.23396 3.67861 3.67813C4.23444 3.12229 4.79278 2.77979 5.45028 2.52479C6.08778 2.27729 6.81278 2.10979 7.87778 2.05979C8.14444 2.04792 8.36564 2.03823 8.58989 2.03038L8.78397 2.02409C9.27672 2.00945 9.8471 2.00278 10.9725 2.00062L13.0281 2.00049ZM12.0003 6.99979C9.23738 6.99979 7.00028 9.23932 7.00028 11.9998C7.00028 14.7627 9.23981 16.9998 12.0003 16.9998C14.7632 16.9998 17.0003 14.7603 17.0003 11.9998C17.0003 9.23689 14.7607 6.99979 12.0003 6.99979ZM12.0003 8.99979C13.6572 8.99979 15.0003 10.3425 15.0003 11.9998C15.0003 13.6567 13.6576 14.9998 12.0003 14.9998C10.3434 14.9998 9.00028 13.6572 9.00028 11.9998C9.00028 10.3429 10.3429 8.99979 12.0003 8.99979ZM17.2503 5.49979C16.561 5.49979 16.0003 6.0597 16.0003 6.74894C16.0003 7.43819 16.5602 7.99896 17.2503 7.99896C17.9395 7.99896 18.5003 7.43906 18.5003 6.74894C18.5003 6.0597 17.9386 5.49893 17.2503 5.49979Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
            <a href="https://www.linkedin.com/company/docuhealthservices/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3362 18.339H15.6707V14.1622C15.6707 13.1662 15.6505 11.8845 14.2817 11.8845C12.892 11.8845 12.6797 12.9683 12.6797 14.0887V18.339H10.0142V9.75H12.5747V10.9207H12.6092C12.967 10.2457 13.837 9.53325 15.1367 9.53325C17.8375 9.53325 18.337 11.3108 18.337 13.6245L18.3362 18.339ZM7.00373 8.57475C6.14573 8.57475 5.45648 7.88025 5.45648 7.026C5.45648 6.1725 6.14648 5.47875 7.00373 5.47875C7.85873 5.47875 8.55173 6.1725 8.55173 7.026C8.55173 7.88025 7.85798 8.57475 7.00373 8.57475ZM8.34023 18.339H5.66723V9.75H8.34023V18.339ZM19.6697 3H4.32923C3.59498 3 3.00098 3.5805 3.00098 4.29675V19.7033C3.00098 20.4202 3.59498 21 4.32923 21H19.6675C20.401 21 21.001 20.4202 21.001 19.7033V4.29675C21.001 3.5805 20.401 3 19.6675 3H19.6697Z" fill="#EFEFEF" fill-opacity="0.8" />
              </svg>

            </a>
          </div>
        <div className="flex flex-col  gap-4">
  <img
    src={docuhealth_ndpr_audit}
    alt="docuhealth ndpr audit image"
    className="w-full sm:w-1/2 object-cover rounded-3xl"
  />
  <img
    src={docuhealth_fhir}
    alt="docuhealth fhir image"
    className="w-full sm:w-1/2 object-cover rounded-3xl"
  />
</div>

        
        </div>
       
      </div>

      <hr className='text-[#BDB5B5]' />
      <div className=' text-center text-[#BDB5B5]  py-5'>
        <p className='hidden sm:block text-sm text-[#EFEFEF] '>  &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved.
          Designed and  developed  by Docuhealth Tech Team.</p>
        <p className='block sm:hidden p-3 text-xs text-[#EFEFEF] pb-5'>  &copy; {new Date().getFullYear()} Docuhealth Services Limited. All rights reserved.
          Designed and  developed by Docuhealth Tech Team.</p>

      </div>
    </div>
  )
}

export default Footer
