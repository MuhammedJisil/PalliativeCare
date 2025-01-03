import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Phone, MapPin, AlertCircle, Calendar, Book, Award, FileText, CheckCircle, Stethoscope } from 'lucide-react';

const VCMregistration = () => {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    availability: '',
    skills: '',
    experience: '',
    certifications: '',
    specialization: '',
    license_number: '',
    notes: ''
  });

  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({
      name: '',
      email: '',
      phone_number: '',
      address: '',
      availability: '',
      skills: '',
      experience: '',
      certifications: '',
      specialization: '',
      license_number: '',
      notes: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = 'http://localhost:5000/api/register';
      await axios.post(url, { ...formData, userType: role });
      setSuccess('Registration Successful');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error(error);
      if (error.response) {
        if (error.response.status === 409) {
          setError('A user with the same details already exists. Please try again.');
        } else if (error.response.status === 400) {
          setError('Required fields are missing. Please fill out all fields.');
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <Heart className="h-12 w-12 text-teal-600 mb-4" />
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Registration</h2>
          <p className="text-gray-600">Join our community as a Volunteer, Caregiver, or Medical Professional</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-center space-x-6 mb-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="volunteer"
                  checked={role === 'volunteer'}
                  onChange={handleRoleChange}
                  className="form-radio text-teal-600"
                />
                <span className="text-gray-700 font-medium">Volunteer</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="caregiver"
                  checked={role === 'caregiver'}
                  onChange={handleRoleChange}
                  className="form-radio text-teal-600"
                />
                <span className="text-gray-700 font-medium">Caregiver</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="medical"
                  checked={role === 'medical'}
                  onChange={handleRoleChange}
                  className="form-radio text-teal-600"
                />
                <span className="text-gray-700 font-medium">Medical Professional</span>
              </label>
            </div>

            {role && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <User className="h-5 w-5 text-teal-600" />
                    <span>Name</span>
                  </label>
                  <input
                    placeholder="Full Name"
                    maxLength="30"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Mail className="h-5 w-5 text-teal-600" />
                    <span>Email</span>
                  </label>
                  <input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Phone className="h-5 w-5 text-teal-600" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    placeholder="Phone number"
                    maxLength="10"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        handleChange({
                          ...e,
                          target: {
                            name: 'phone_number',
                            value: value
                          }
                        });
                      }
                    }}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    <span>Address</span>
                  </label>
                  <textarea
                    placeholder="Address"
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
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <span>Availability</span>
                  </label>
                  <textarea
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                    placeholder="Please specify your available days and times"
                  ></textarea>
                </div>

                {role === 'volunteer' && (
                  <div>
                    <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                      <Book className="h-5 w-5 text-teal-600" />
                      <span>Skills</span>
                    </label>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows="3"
                      placeholder="List any relevant skills or experience"
                    ></textarea>
                  </div>
                )}

                {role === 'caregiver' && (
                  <>
                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <Book className="h-5 w-5 text-teal-600" />
                        <span>Experience</span>
                      </label>
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="3"
                        placeholder="Describe your caregiving experience"
                      ></textarea>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <Award className="h-5 w-5 text-teal-600" />
                        <span>Certifications</span>
                      </label>
                      <textarea
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="3"
                        placeholder="List relevant certifications and qualifications"
                      ></textarea>
                    </div>
                  </>
                )}

                {role === 'medical' && (
                  <>
                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <Stethoscope className="h-5 w-5 text-teal-600" />
                        <span>Specialization</span>
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., Pediatrics, Geriatrics, etc."
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <Award className="h-5 w-5 text-teal-600" />
                        <span>License Number</span>
                      </label>
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter your medical license number"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <Book className="h-5 w-5 text-teal-600" />
                        <span>Experience</span>
                      </label>
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="3"
                        placeholder="Describe your medical experience and practice history"
                      ></textarea>
                    </div>
                  </>
                )}

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <FileText className="h-5 w-5 text-teal-600" />
                    <span>Additional Notes</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                    placeholder="Any additional information you'd like to share"
                  ></textarea>
                </div>

                <div className="text-center pt-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-sm"
                  >
                    Register
                  </button>
                </div>
              </form>
            )}
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

export default VCMregistration;