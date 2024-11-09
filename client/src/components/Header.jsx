import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Contact from './Contact';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            <Link to="/">Pain and Palliative Care</Link>
          </h1>
          <p className="text-sm">Pookkottumpadam</p>
        </div>

        {/* Hamburger Menu for small devices */}
        <div className="sm:hidden">
          <button
            onClick={toggleMenu}
            className="focus:outline-none text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav
          className={`${
            isOpen ? "block" : "hidden"
          } sm:flex sm:space-x-4 sm:items-center`}
        >
          <Link
            to="/"
            className="block sm:inline-block mt-2 sm:mt-0 hover:underline"
          >
            Home
          </Link>
          <Link
            to="/donate"
            className="block sm:inline-block mt-2 sm:mt-0 bg-yellow-500 text-black px-4 py-2 rounded"
          >
            Donate
          </Link>
          <Contact />
          <Link
            to="/admin"
            className="block sm:inline-block mt-2 sm:mt-0 hover:underline"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
