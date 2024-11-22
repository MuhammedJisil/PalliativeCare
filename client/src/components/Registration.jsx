import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, HeartHandshake, Users } from 'lucide-react';

const Registration = () => {
  const navigate = useNavigate();

  const handleVolunteerCaregiverRegister = () => {
    navigate('/volunteer-caregiver-registration');
  };

  const handlePatientRegister = () => {
    navigate('/patient-registration');
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Volunteer & Caregiver Section */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Make a Difference in Someone's Life
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Volunteer Card */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Volunteer</h3>
              <p className="text-gray-600 text-center mb-6">
                Join our compassionate community of volunteers. Your time and dedication can bring comfort and support to those in need. Make a meaningful impact in people's lives.
              </p>
            </div>

            {/* Caregiver Card */}
            <div className="bg-red-50 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <HeartHandshake className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Caregiver</h3>
              <p className="text-gray-600 text-center mb-6">
                Become a professional caregiver and provide essential care services. Your expertise and compassion can make a crucial difference in patients' quality of life.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={handleVolunteerCaregiverRegister}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition duration-300 mx-auto"
            >
              <UserPlus size={20} />
              <span>Join Our Team</span>
            </button>
          </div>
        </div>

        {/* Patient Registration Section */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center mb-6">
            Patient Registration
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            We're here to support you through your journey. Our dedicated team of caregivers and volunteers are ready to provide the compassionate care and support you need.
          </p>
          <div className="text-center">
            <button
              onClick={handlePatientRegister}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition duration-300 mx-auto"
            >
              <HeartHandshake size={20} />
              <span>Register as a Patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;