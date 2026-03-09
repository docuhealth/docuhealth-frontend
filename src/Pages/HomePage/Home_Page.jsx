import React from "react";
import { Helmet } from "react-helmet-async";
import Hero_Page from '../Components/HomePage/Hero_Page'
import About_Us_Section from "../Components/HomePage/About_Us_Section";
import Core_Product_Section from "../Components/HomePage/Core_Product_Section";
import FAQ_Section from "../Components/HomePage/FAQ_Section";
import Data_Privacy_Section from "../Components/HomePage/Data_Privacy_Section";
import Contact_Us_Section from "../Components/HomePage/Contact_Us_Section";
import DocuHealth_Updates_Section from "../Components/HomePage/DocuHealth_Updates_Section";

const Home_Page = () => {
    return (
        <>
            <Helmet>
                <title>DocuHealth - Unifying Nigeria's Healthcare Ecosystem</title>
                <meta name="description" content="Secure, lifelong access to medical records powered by the Health Identification Number (HIN) linked with the National Identity Number (NIN)." />
                <link rel="canonical" href="https://docuhealthservices.net/" />
            </Helmet>
            <Hero_Page />
            <About_Us_Section />
            <Core_Product_Section />
            <FAQ_Section />
            <Data_Privacy_Section />
            <Contact_Us_Section />
            <DocuHealth_Updates_Section />
        </>
    )
}
export default Home_Page