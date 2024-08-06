import React, { useState, useEffect, useRef } from 'react';

const Contact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const gmail = 'sample@gmail.com';
  const phoneNumbers = ['1234567890', '0987654321', '1122334455'];
  const whatsappNumbers = ['1234567890', '0987654321',];

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Function to handle dropdown toggle
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={toggleDropdown}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Contact
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <a
              href={`mailto:${gmail}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
             Gmail
            </a>
            {phoneNumbers.map((number, index) => (
              <div key={index} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">
                <span>Phone Number: {number}</span>
                <button
                  onClick={() => copyToClipboard(number)}
                  className="bg-gray-300 text-black px-2 py-1 rounded-md ml-2"
                >
                  Copy
                </button>
                <a href={`tel:${number}`} className="ml-2 text-blue-500 hover:underline">
                  Call
                </a>
              </div>
            ))}
            {whatsappNumbers.map((number, index) => (
              <a
                key={index}
                href={`https://wa.me/${number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                WhatsApp {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;

