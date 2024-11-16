import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Users, Heart, Info } from 'lucide-react';
import Registration from './Registration';
import Footer from './Footer'

const Home = () => {
  const navigate = useNavigate();
  const volunteerRef = useRef(null);
  const patientRef = useRef(null);

  const scrollToVolunteer = () => {
    volunteerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPatient = () => {
    patientRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay */}
        <img
          src="./palli1.png"
          alt="Caring hands"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Compassionate Care for Every Life
          </h1>
          <p className="text-xl md:text-2xl text-center mb-12 max-w-3xl">
            Join us in our mission to provide comfort and support to those in need through dedicated palliative care services
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={scrollToVolunteer}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition duration-300"
            >
              <Users size={20} />
              <span>Join Us</span>
            </button>
            
            <button
              onClick={scrollToPatient}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition duration-300"
            >
              <Heart size={20} />
              <span>Patient Registration</span>
            </button>
            
            <button
              onClick={() => navigate('/about')}
              className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-full transition duration-300"
            >
              <Info size={20} />
              <span>About Us</span>
            </button>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <ChevronDown size={32} />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-blue-50 p-8 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Patients Supported</div>
            </div>
            <div className="bg-red-50 p-8 rounded-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">200+</div>
              <div className="text-gray-600">Active Volunteers</div>
            </div>
            <div className="bg-green-50 p-8 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">10+</div>
              <div className="text-gray-600">Years of Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img 
                src="/api/placeholder/400/300" 
                alt="Medical Care" 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Medical Care</h3>
              <p className="text-gray-600">Professional medical support and pain management services</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img 
                src="/api/placeholder/400/300" 
                alt="Emotional Support" 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Emotional Support</h3>
              <p className="text-gray-600">Compassionate counseling and emotional care for patients and families</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img 
                src="/api/placeholder/400/300" 
                alt="Home Care" 
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Home Care</h3>
              <p className="text-gray-600">Dedicated home care services to ensure comfort in familiar surroundings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Components */}
      <div ref={volunteerRef}>
        <Registration />
      </div>

      {/* Patient Section Ref */}
      <div ref={patientRef} />
      <Footer/>
    </div>
  );
};

export default Home;
