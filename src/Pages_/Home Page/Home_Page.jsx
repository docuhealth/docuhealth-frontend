import React from "react";
import Hero_Page from '../Components/Home Page/Hero_Page'
import About_Us_Section from "../Components/Home Page/About_Us_Section";
import Core_Product_Section from "../Components/Home Page/Core_Product_Section";
import FAQ_Section from "../Components/Home Page/FAQ_Section";
import Data_Privacy_Section from "../Components/Home Page/Data_Privacy_Section";
import Contact_Us_Section from "../Components/Home Page/Contact_Us_Section";
import DocuHealth_Updates_Section from "../Components/Home Page/DocuHealth_Updates_Section";

const Home_Page = () => {
    return (
        <>
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