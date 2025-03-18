import React, { useState,useEffect } from "react";
import logo from ".././assets/logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScrollTop) {
        // User is scrolling down → hide navbar after a short delay
        setIsVisible(false);
      } else {
        // User is scrolling up → show navbar
        setIsVisible(true);
      }

      // If user scrolls past a certain threshold, make navbar fixed
      setIsScrolled(currentScroll > 50);
      setLastScrollTop(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop]);


  return (
    <div className="text-[#0E0E31] ">
         <div
      className={`${
        isScrolled ? "fixed w-full z-50 bg-white shadow transition-transform" : "absolute w-full"
      } ${isVisible ? "translate-y-0" : "-translate-y-full"} hidden sm:flex justify-around items-center py-5`}
      style={{ transition: "transform 0.3s ease-in-out" }}
    >
      <div className="flex justify-center gap-1 items-center">
        <div>
          <img src={logo} alt="DocuHealth Logo" />
        </div>
        <div className="font-semibold text-xl">
          <h1>DocuHealth</h1>
        </div>
      </div>
      <div className="flex justify-center items-center gap-5 text-sm">
        <a href="#" className="font-semibold">
          Home
        </a>
        <a href="#OurServices" className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105">Our Services</a>
        <a href="#OurBenefits" className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105">Benefits</a>
        <a href="#OurFeatures" className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105">Features</a>
        <a href="" className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105">Guest Mode</a>
      </div>
      <div className="flex justify-center items-center gap-2 text-sm">
        <Link to="/welcome">
          <button className="border border-[#0E0E31]  transition-all hover:bg-[#0E0E31] hover:text-white rounded-full py-2 px-5">
            Sign Up
          </button>
        </Link>
        <Link to="/welcome">
          <button className="border rounded-full py-2 px-5  transition-all hover:bg-[#34345F] bg-[#0E0E31] text-white">
            Sign In
          </button>
        </Link>
      </div>
    </div>
  

      <div className="fixed w-full z-50">
        {/* Top Navigation Bar */}
        <div className="sm:hidden flex justify-between items-center px-3 py-4 bg-white shadow">
          <button onClick={() => setIsOpen(true)}>
            <i className="bx bx-menu-alt-left text-3xl"></i>
          </button>
          <img src={logo} alt="DocuHealth Logo" />
        </div>

        {/* Sidebar Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform z-50 sm:hidden ${
            isOpen
              ? "translate-x-0 z-50 sm:hidden"
              : "-translate-x-full z-50 sm:hidden"
          } transition-transform duration-300 ease-in-out text-[#0E0E31]`}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center px-4 py-4">
            <div className="flex justify-center items-center gap-1">
              <img src={logo} alt="DocuHealth Logo" className="h-8" />
              <h2 className="text-xl font-semibold">DocuHealth</h2>
            </div>

            <button onClick={() => setIsOpen(false)}>
              <i className="bx bx-x text-3xl"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-6 mt-4 space-y-4 text-gray-700">
            <a
              href="#"
              className="text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="#OurServices"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Our services
            </a>
            <a
              href="#OurBenefits"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Benefits
            </a>
            <a
              href="#OurFeatures"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
          </nav>

          {/* Sign In / Sign Up Buttons */}
          <div className="absolute bottom-8 left-0 w-full px-6">
            <Link to="/welcome">
              <button
                className="w-full bg-[#0E0E31] text-white py-2 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </button>
            </Link>
            <Link to="/welcome">
              <button
                className="w-full mt-2 border border-[#0E0E31] text-[#0E0E31] py-2 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                {" "}
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
