import React, {useState, useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar'
import HeroPG from './HeroPG'
import OurServices from './OurServices'
import Benefit from './Benefit'
import Features from './Features'
import Commendationmsg from './Commendationmsg'
import Footer from './Footer'



const Home = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { isPharmacyMode } = location.state || {};

  const [showPharmacyMode, setShowPharmacyMode] = useState(isPharmacyMode || false);

  useEffect(() => {
    // Clear state from URL after routing so it doesn't persist on refresh
    if (isPharmacyMode) {
      navigate(location.pathname, { replace: true });
    }
  }, [isPharmacyMode, location.pathname, navigate]);

  return (
    <div>
      <Navbar showPharmacyMode = {showPharmacyMode} />
      <HeroPG />
     <OurServices />
     <Benefit />
     <Features />
     <Commendationmsg />
     <Footer />
    </div>
  )
}

export default Home
