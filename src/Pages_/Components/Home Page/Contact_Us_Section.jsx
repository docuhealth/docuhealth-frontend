import React, { useState } from "react";
import BackgroundTemplate from "../ui/BackgroundTemplate";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosInstance";

const Contact_Us_Section = () => {
  const [activeTab, setActiveTab] = useState("individual");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    let payload;

    if (activeTab === "provider") {
      // Format for provider
      payload = {
        redirect_url: "http://localhost:5173/hospital-verification-request", // or dynamically set this if needed
        name: formData.name,
        contact_email: formData.email,
        phone: formData.phone,
        message: formData.message,
      };

      try {
        const res = await axiosInstance.post("api/hospitals/inquiries",payload);
        console.log(res.data);
        toast.success("Message sent successfully!");
      } catch (err) {
        console.error("Error submitting message:", err);
      }finally{
        setLoading(false)
      }
    } else {
      // Default (individual)
      payload = { ...formData };
    }

    setLoading(false)
    setFormData({ name: "", email: "", phone: "", message: "" });

  };

  return (
    <BackgroundTemplate>
      <section
        className="py-24 px-5 lg:px-16 text-sm text-[#464646] bg-[#F6FCFE] lg:bg-white "
        id="contact-us"
      >
        <div className="w-full  flex flex-col lg:flex-row 6 text-sm gap-10 lg:gap-0">
          {/* Left Section */}
          <div className="lg:w-1/2">
            <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-semibold text-[#3E4095] mb-4">
              Contact us
            </h2>
            <p className=" mb-8 2xl:text-xl">In case you want to quickly make enquiries:</p>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="bg-[#F6FCFE] p-3 rounded-lg border">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 16.42V19.9561C21 20.4811 20.5941 20.9167 20.0705 20.9537C19.6331 20.9846 19.2763 21 19 21C10.1634 21 3 13.8366 3 5C3 4.72371 3.01545 4.36687 3.04635 3.9295C3.08337 3.40588 3.51894 3 4.04386 3H7.5801C7.83678 3 8.05176 3.19442 8.07753 3.4498C8.10067 3.67907 8.12218 3.86314 8.14207 4.00202C8.34435 5.41472 8.75753 6.75936 9.3487 8.00303C9.44359 8.20265 9.38171 8.44159 9.20185 8.57006L7.04355 10.1118C8.35752 13.1811 10.8189 15.6425 13.8882 16.9565L15.4271 14.8019C15.5572 14.6199 15.799 14.5573 16.001 14.6532C17.2446 15.2439 18.5891 15.6566 20.0016 15.8584C20.1396 15.8782 20.3225 15.8995 20.5502 15.9225C20.8056 15.9483 21 16.1633 21 16.42Z"
                      fill="#3E4095"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold 2xl:text-lg ">Call us:</p>
                  <p className="2xl:text-lg">+234 808 198 8860</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="bg-[#F6FCFE] p-3 rounded-lg border">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM12.0606 11.6829L5.64722 6.2377L4.35278 7.7623L12.0731 14.3171L19.6544 7.75616L18.3456 6.24384L12.0606 11.6829Z"
                      fill="#3E4095"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold 2xl:text-lg">Email us:</p>
                  <p className="2xl:text-lg">support@docuhealthservices.com</p>
                </div>
              </div>

              {/* Partnerships */}
              <div className="flex items-start gap-3">
                <div className="bg-[#F6FCFE] p-3 rounded-lg border">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.2914 5.99994H20.0002C20.5525 5.99994 21.0002 6.44766 21.0002 6.99994V13.9999C21.0002 14.5522 20.5525 14.9999 20.0002 14.9999H18.0002L13.8319 9.16427C13.3345 8.46797 12.4493 8.16522 11.6297 8.41109L9.14444 9.15668C8.43971 9.3681 7.6758 9.17551 7.15553 8.65524L6.86277 8.36247C6.41655 7.91626 6.49011 7.17336 7.01517 6.82332L12.4162 3.22262C13.0752 2.78333 13.9312 2.77422 14.5994 3.1994L18.7546 5.8436C18.915 5.94571 19.1013 5.99994 19.2914 5.99994ZM5.02708 14.2947L3.41132 15.7085C2.93991 16.1209 2.95945 16.8603 3.45201 17.2474L8.59277 21.2865C9.07284 21.6637 9.77592 21.5264 10.0788 20.9963L10.7827 19.7645C11.2127 19.012 11.1091 18.0682 10.5261 17.4269L7.82397 14.4545C7.09091 13.6481 5.84722 13.5771 5.02708 14.2947ZM7.04557 5H3C2.44772 5 2 5.44772 2 6V13.5158C2 13.9242 2.12475 14.3173 2.35019 14.6464C2.3741 14.6238 2.39856 14.6015 2.42357 14.5796L4.03933 13.1658C5.47457 11.91 7.65103 12.0343 8.93388 13.4455L11.6361 16.4179C12.6563 17.5401 12.8376 19.1918 12.0851 20.5087L11.4308 21.6538C11.9937 21.8671 12.635 21.819 13.169 21.4986L17.5782 18.8531C18.0786 18.5528 18.2166 17.8896 17.8776 17.4146L12.6109 10.0361C12.4865 9.86205 12.2652 9.78636 12.0603 9.84783L9.57505 10.5934C8.34176 10.9634 7.00492 10.6264 6.09446 9.7159L5.80169 9.42313C4.68615 8.30759 4.87005 6.45035 6.18271 5.57524L7.04557 5Z"
                      fill="#3E4095"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold 2xl:text-lg">
                    For Partnerships and Collaborations
                  </p>
                  <p className="2xl:text-lg">info@docuhealth.online</p>
                </div>
              </div>
            </div>
          </div>

   
          <div className="lg:w-1/2 rounded-2xl p-6 lg:shadow-lg border bg-white">
            {/* Tabs */}
            <div className="flex mb-6 bg-[#F6FCFE] rounded-full p-1">
              <button
                onClick={() => setActiveTab("individual")}
                className={`flex-1 py-2 rounded-full font-medium transition-all 2xl:text-lg ${
                  activeTab === "individual"
                    ? "bg-[#3E4095] text-white"
                    : "text-[#3E4095]"
                }`}
              >
                Individuals
              </button>
              <button
                onClick={() => setActiveTab("provider")}
                className={`flex-1 py-2 rounded-full font-medium transition-all 2xl:text-lg ${
                  activeTab === "provider"
                    ? "bg-[#3E4095] text-white"
                    : "text-[#3E4095]"
                }`}
              >
                Health Providers
              </button>
            </div>

            {/* Individual Form */}
            {activeTab === "individual" && (
              <form onSubmit={handleSubmit} className="space-y-5 2xl:text-lg">
                <h3 className="text-[#3E4095] font-semibold 2xl:text-lg">
                  Send us a message as an Individual
                </h3>

                <div>
                  <label className="block pb-2">Full name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden "
                  />
                </div>

                <div>
                  <label className="block pb-2">Email address:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email address"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block pb-2">Phone number:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block pb-2">Message:</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Type your message"
                    rows="4"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#3E4095] text-white py-3 rounded-full hover:bg-blue-900 transition-colors"
                >
                  Send message
                </button>
              </form>
            )}

            {/* Health Provider Form */}
            {activeTab === "provider" && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-[#3E4095] font-semibold">
                  Send us a message as a Health Provider
                </h3>

                <div>
                  <label className="block pb-2">Organization Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your organization name"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block pb-2">Official Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@gmail.com"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block pb-2">Contact Number:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contact number"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block pb-2">Message:</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us how we can collaborate"
                    rows="4"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3E4095] outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full    ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"  : "bg-[#3E4095] hover:bg-blue-900  cursor-pointer"  
              }  text-white py-3 rounded-full transition-colors`}
                >
                  {loading ? (
                        <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Message...
                    </div>
                  ) : ( "Send message " ) }
                </button>

              </form>
            )}
          </div>
        </div>
      </section>
    </BackgroundTemplate>
  );
};

export default Contact_Us_Section;
