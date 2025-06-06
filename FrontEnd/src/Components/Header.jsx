import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SlArrowDown, SlArrowUp } from 'react-icons/sl';
import { FaUser  } from 'react-icons/fa';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { logout } from '../Store/Slice/userLoggedInSlice'; // Import the logout action

const servicesDropdownLinks = [
  { to: "/OldProduct", label: "Old Product" },
  { to: "/NewProduct", label: "New Product" },
  { to: "/AutoService", label: "Auto Service" },
  { to: "/RestaurantService", label: "Restaurant Service" }
];

const profileDropdownLinks = [
  { to: "/Profile", label: "Profile" },
  { to: "/Settings", label: "Settings" },
  { to: "/Logout", label: "Logout", action: true } 
];

const Header = () => {
  const dispatch = useDispatch(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownTimeout = useRef(null);
  const profileDropdownTimeout = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleNavbarItemClick = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleMouseEnterDropdown = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeaveDropdown = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const handleMouseEnterProfileDropdown = () => {
    if (profileDropdownTimeout.current) {
      clearTimeout(profileDropdownTimeout.current);
    }
    setIsProfileDropdownOpen(true);
  };

  const handleMouseLeaveProfileDropdown = () => {
    profileDropdownTimeout.current = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 200);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Logout successful');
        dispatch(logout()); 
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Logout failed');
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50">
        <div className="h-16 border border-black flex justify-between items-center px-4 md:px-16 bg-[#3BEA1E] rounded-b-xl ">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">CampusConnect</h1>
          </div>

          <div className="space-x-2 md:space-x-4 text-sm md:text-lg hidden md:flex">
            <Link to="/Home" onClick={handleNavbarItemClick} className="hover:underline underline-offset-8 hover:text-blue-600 text-black text-2xl">
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={handleMouseEnterDropdown}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <button className="hover:underline underline-offset-8 hover:text-blue-600 flex text-black text-2xl">
                Services
                <div className="pt-2 px-1">
                  {isDropdownOpen ? <SlArrowUp className="w-5 h-5" /> : <SlArrowDown className="w-5 h-5" />}
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#feeccd] border border-gray-200 rounded-lg shadow-lg z-10">
                  {servicesDropdownLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.to}
                      onClick={handleNavbarItemClick}
                      className="block px-4 py-2 text-base hover:bg-[#3BEA1E] rounded-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/AddProduct" onClick={handleNavbarItemClick} className="hover:underline underline-offset-8 hover:text-blue-600 text-black text-2xl">
              Add Product
            </Link>
            <Link to="/About" onClick={handleNavbarItemClick} className="hover:underline underline-offset-8 hover:text-blue-600 text-black text-2xl">
              About us
            </Link>
            <div
              className="relative"
              onMouseEnter={handleMouseEnterProfileDropdown}
              onMouseLeave={handleMouseLeaveProfileDropdown}
            >
              <button className="hover:underline underline-offset-8 hover:text-blue-600 flex text-black text-2xl pt-1">
                <FaUser  />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#feeccd] border border-gray-200 rounded-lg shadow-lg z-10">
                  {profileDropdownLinks.map((link, index) => (
                    <div key={index} onClick={link.action ? handleLogout : undefined}>
                      <Link
                        to={link.to}
                        onClick={link.action ? undefined : handleNavbarItemClick} // Prevent navigation for logout
                        className="block px-4 py-2 text-base hover:bg-[#3BEA1E] rounded-lg"
                      >
                        {link.label}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="block md:hidden">
            <button onClick={toggleMenu} className="text-black focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden text-center absolute top-20 right-0 bg-[#3BEA1E] border border-black shadow-lg rounded-lg w-full flex flex-col items-center space-y-2 mt-2 p-4">
            <Link to="/Home" onClick={handleNavbarItemClick} className="text-xl hover:underline underline-offset-8 hover:text-blue-600 text-black">
              Home
            </Link>
            <div className="relative w-full">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-xl hover:underline underline-offset-8 hover:text-blue-600 flex text-black w-full justify-center"
              >
                Services
                <div className="pt-2 px-1">
                  {isDropdownOpen ? <SlArrowUp className="w-5 h-5" /> : <SlArrowDown className="w-5 h-5" />}
                </div>
              </button>
              {isDropdownOpen && (
                <div className="w-full bg-[#feeccd] border border-gray-200 rounded-lg shadow-xl mt-2">
                  {servicesDropdownLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.to}
                      onClick={handleNavbarItemClick}
                      className="block px-4 py-2 text-base hover:bg-[#3BEA1E] rounded-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {!isDropdownOpen && (
              <>
                <Link to="/About" onClick={handleNavbarItemClick} className="text-xl hover:underline underline-offset-8 hover:text-blue-600 text-black">
                  About us
                </Link>
                <div className="relative w-full">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="text-xl hover:underline underline-offset-8 hover:text-blue-600 flex text-black w-full justify-center pt-1"
                  >
                    <FaUser  />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="w-full bg-[#feeccd] border border-gray-200 rounded-lg shadow-xl mt-2">
                      {profileDropdownLinks.map((link, index) => (
                        <div key={index} onClick={link.action ? handleLogout : undefined}>
                          <Link
                            to={link.to}
                            onClick={link.action ? undefined : handleNavbarItemClick} // Prevent navigation for logout
                            className="block px-4 py-2 text-base hover:bg-[#3BEA1E] rounded-lg"
                          >
                            {link.label}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Header;