import React from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();

  const handleVolunteerCaregiverRegister = () => {
    navigate('/volunteer-caregiver-registration');
  };

  const handlePatientRegister = () => {
    navigate('/patient-registration');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto bg-gray-100 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-center mb-4">Are you ready to help us?</h2>
        <div className="flex justify-between">
          <div className="w-1/2 p-4">
            <h3 className="text-xl font-semibold mb-2">Volunteer</h3>
            <p className="text-gray-700">Join us as a volunteer and make a difference in people's lives. Your time and skills can help those in need.</p>
          </div>
          <div className="w-1/2 p-4">
            <h3 className="text-xl font-semibold mb-2">Caregiver</h3>
            <p className="text-gray-700">Become a caregiver and provide essential support to patients. Your compassion can bring comfort and care to those who need it most.</p>
          </div>
        </div>
        <div className="text-center mt-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={handleVolunteerCaregiverRegister}
          >
            Register
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Patients in Need</h2>
        <p className="text-gray-700 text-center mb-6">
          If you are a patient in need of a caregiver, please register here. Our caregivers are ready to provide you with the support and care you need.
        </p>
        <div className="text-center">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={handlePatientRegister}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
