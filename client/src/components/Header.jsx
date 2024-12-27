import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Heart, Home, X, User } from 'lucide-react';
import Contact from './Contact';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-teal-600" />
            <div>
              <Link to="/" className="text-gray-800">
                <h1 className="text-xl font-semibold tracking-tight">
                  Pain & Palliative Care
                </h1>
                <p className="text-sm text-teal-600">Pookkottumpadam</p>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md transition duration-150 ease-in-out hover:bg-gray-100"
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link
              to="/donate"
              className="flex items-center px-6 py-2.5 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 animate-pulse"
            >
              <Heart size={18} />
              <span>Donate</span>
            </Link>
            <div className="text-gray-600 hover:text-teal-600 transition-colors">
              <Contact />
            </div>
            <Link
              to="/admin"
              className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md transition duration-150 ease-in-out hover:bg-gray-100"
            >
              <User size={20} />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            ref={menuRef}
            className="md:hidden absolute top-20 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                to="/"
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Contact />
              <Link
                to="/donate"
                className="flex items-center px-6 py-2.5 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 animate-pulse"
                onClick={() => setIsOpen(false)}
              >
                <Heart size={20} />
                <span>Donate</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-3 text-gray-700 hover:text-teal-600 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                <User size={20} />
                <span>Admin</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
