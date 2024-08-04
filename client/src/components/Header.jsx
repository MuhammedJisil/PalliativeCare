import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            <Link to="/">Pain and Palliative Care</Link>
          </h1>
          <p className="text-sm">Pookkottumpadam</p>
        </div>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/donate" className="bg-yellow-500 text-black px-4 py-2 rounded">Donate</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

