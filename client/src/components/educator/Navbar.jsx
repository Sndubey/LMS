import React from 'react'
import { assets, dummyEducatorData } from '../../assets/assets'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom';

const Navbar = () => {

  const educatorData = dummyEducatorData[0];
  const { user } = useUser();

  return (
    <div className='flex items-center justify-between px-4 py-3 md:px-8 border-b border-gray-500 '>
      <Link to='/'>
        <img src={assets.logo} alt='logo' className='w-28 lg:w-32' />
      </Link>
      <div>
        {user ? <UserButton/> : <img className='max-w-8' src={assets.profile_img} />}
      </div>
    </div>
  )
}

export default Navbar
