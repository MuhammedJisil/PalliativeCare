import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Copy, ExternalLink, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const dropdownRef = useRef(null);

  const gmail = 'sample@gmail.com';
  const phoneNumbers = ['1234567890', '0987654321', '1122334455'];
  const whatsappNumbers = ['1234567890', '0987654321'];

  // Function to copy text to clipboard with feedback
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(type);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center space-x-2 rounded-lg px-4 py-2 text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        <Phone className="h-4 w-4" />
        <span>Contact</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 space-y-4">
            {/* Gmail Section */}
            <div className="group">
              <a
                href={`mailto:${gmail}`}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-5 w-5 text-teal-600 mr-3" />
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-700">Email Us</p>
                  <p className="text-sm text-gray-500">{gmail}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-teal-600" />
              </a>
            </div>

            {/* Phone Numbers Section */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3">Phone Numbers</p>
              {phoneNumbers.map((number, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                  <Phone className="h-5 w-5 text-teal-600 mr-3" />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-700">{number}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(number, `phone${index}`)}
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-teal-600 transition-colors"
                      title="Copy number"
                    >
                      <Copy className="h-4 w-4" />
                      {copyFeedback === `phone${index}` && (
                        <span className="absolute right-20 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          Copied!
                        </span>
                      )}
                    </button>
                    <a
                      href={`tel:${number}`}
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-teal-600 transition-colors"
                      title="Call now"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Section */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3">WhatsApp</p>
              {whatsappNumbers.map((number, index) => (
                <a
                  key={index}
                  href={`https://wa.me/${number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 group"
                >
                  <MessageCircle className="h-5 w-5 text-teal-600 mr-3" />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-700">WhatsApp {index + 1}</p>
                    <p className="text-sm text-gray-500">{number}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-teal-600" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;

