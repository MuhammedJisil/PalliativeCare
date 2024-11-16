import React from 'react';
import { Facebook, Instagram, Youtube, Send, MessageCircle, MapPin } from 'lucide-react';

const Footer = () => {
  // Social media links
  const socialLinks = [
    {
      name: 'YouTube',
      icon: <Youtube size={24} />,
      url: 'https://youtube.com/@palliativecare',
      className: 'hover:text-red-600'
    },
    {
      name: 'Instagram',
      icon: <Instagram size={24} />,
      url: 'https://instagram.com/palliativecare',
      className: 'hover:text-pink-600'
    },
    {
      name: 'Telegram',
      icon: <Send size={24} />,
      url: 'https://t.me/palliativecare',
      className: 'hover:text-blue-500'
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={24} />,
      url: 'https://whatsapp.com/group/palliativecare',
      className: 'hover:text-green-500'
    }
  ];

  return (
    <footer className="bg-white shadow-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Organization Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Pain & Palliative Care</h2>
              <p className="text-sm text-gray-600">Pookkottumpadam</p>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin size={20} />
                <span className="text-sm">Pookkottumpadam, Kerala, India</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect With Us</h3>
              <div className="flex space-x-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-600 transition duration-150 ease-in-out ${social.className}`}
                    aria-label={social.name}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p className="text-sm text-gray-600">Join our community and stay updated with our latest initiatives</p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Pain & Palliative Care, Pookkottumpadam. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



