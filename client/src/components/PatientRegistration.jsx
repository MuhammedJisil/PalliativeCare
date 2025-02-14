import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Phone, MapPin, Home, AlertCircle, CheckCircle, Stethoscope, Activity, ClipboardList } from 'lucide-react';
import BASE_URL from '../config';

const PatientRegistration = () => {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    patient_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone_number: '',
    place: '',
    address: '',
    support_type: '',
    health_condition: '',
    care_details: '',
    notes: ''
  });

  const navigate = useNavigate();

  const supportTypes = [
    { value: '', label: 'Select Support Type' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'medical', label: 'Medical' },
    { value: 'others', label: 'Others' }
  ];

  const validatePhoneNumber = (value) => {
    // Remove non-digit characters
    const cleanedValue = value.replace(/\D/g, '');
    
    // Check length and numeric content
    if (cleanedValue.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    
    // Optional: Additional validation (e.g., area code restrictions)
    const areaCode = cleanedValue.substring(0, 3);
    const invalidAreaCodes = ['000', '911'];
    if (invalidAreaCodes.includes(areaCode)) {
      setPhoneError('Invalid area code');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
      setFormData(prev => ({
        ...prev,
        contact_phone_number: value
      }));
    }
    validatePhoneNumber(value);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contact_phone_number.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    try {
      const response = await axios.post(`${BASE_URL}/api/patients-in-need`, formData);
      
      setSuccess('Patient registered successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      if (error.response) {
        switch(error.response.data.field) {
          case 'contact_phone_number':
            setError('Phone number is already registered');
            break;
          case 'contact_email':
            setError('Email is already registered');
            break;
          case 'full_details':
            setError('Patient with these exact details already exists');
            break;
          case 'health_condition':
            setError('Health condition is required for medical support');
            break;
          case 'care_details':
            setError('Care details are required for caregiver support');
            break;
          default:
            setError('Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
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
                  maxLength="30"
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
                  <span>Phone Number</span>
                </label>
                <input
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  type="tel"
                  name="contact_phone_number"
                  value={formData.contact_phone_number}
                  onChange={handlePhoneChange}
                  onBlur={(e) => validatePhoneNumber(e.target.value)}
                  required
                  className={`w-full p-3 border ${
                    phoneError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-teal-500'
                  } rounded-lg focus:ring-2 focus:border-transparent`}
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
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
                  <Activity className="h-5 w-5 text-teal-600" />
                  <span>Support Type</span>
                </label>
                <select
                  name="support_type"
                  value={formData.support_type}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {supportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.support_type === 'medical' && (
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
              )}

              {formData.support_type === 'caregiver' && (
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Activity className="h-5 w-5 text-teal-600" />
                    <span>Care Details</span>
                  </label>
                  <textarea
                    name="care_details"
                    value={formData.care_details}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>
              )}

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

      {(error || success) && (
        <div 
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => {
            setError(null);
            setSuccess(null);
          }}
        >
          <div 
            className="fixed top-4 right-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium">{success}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistration;
