import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Phone, MapPin, Home, FileText, Stethoscope, Activity, ClipboardList } from 'lucide-react';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    patient_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone_number: '',
    place: '',
    address: '',
    health_condition: '',
    care_details: '',
    notes: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/patients-in-need', formData);
      alert('Patient registered successfully');
      navigate('/');
    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <Heart className="h-12 w-12 text-teal-600 mb-4" />
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Patient Registration</h2>
          <p className="text-gray-600">Register a patient for care and support</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <User className="h-5 w-5 text-teal-600" />
                  <span>Patient Name</span>
                </label>
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <User className="h-5 w-5 text-teal-600" />
                  <span>Contact Name</span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Mail className="h-5 w-5 text-teal-600" />
                  <span>Contact Email</span>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Phone className="h-5 w-5 text-teal-600" />
                  <span>Contact Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="contact_phone_number"
                  value={formData.contact_phone_number}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <span>Place</span>
                </label>
                <input
                  type="text"
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Home className="h-5 w-5 text-teal-600" />
                  <span>Address</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  <span>Health Condition</span>
                </label>
                <textarea
                  name="health_condition"
                  value={formData.health_condition}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Activity className="h-5 w-5 text-teal-600" />
                  <span>Care Details</span>
                </label>
                <textarea
                  name="care_details"
                  value={formData.care_details}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <ClipboardList className="h-5 w-5 text-teal-600" />
                  <span>Additional Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-sm"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
