import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../Pages/Components/Layout/Navbar";
import Footer from "../../Pages/Components/Layout/Footer";

const Landing_Page_Layout = () => {
    return (
        <div>
            <Navbar />
            <main className="">  
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Landing_Page_Layout