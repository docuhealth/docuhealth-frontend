import React from 'react'
import Navbar from './Navbar'
import HeroPG from './HeroPG'
import OurServices from './OurServices'
import Benefit from './Benefit'
import Features from './Features'
import Commendationmsg from './commendationmsg'
import Footer from './Footer'


const Home = () => {
  return (
    <div>
      <Navbar />
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
