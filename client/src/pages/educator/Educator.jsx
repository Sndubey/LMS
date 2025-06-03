import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educator/Navbar'
import SideBar from '../../components/educator/SideBar'
import Footer from '../../components/educator/Footer'

const Educator = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
      <Navbar />
      <div className='flex'>
        <SideBar />  {/* left side */}
        <div className='flex-1'>  {/* right side / other pages */}
          {<Outlet />}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Educator
