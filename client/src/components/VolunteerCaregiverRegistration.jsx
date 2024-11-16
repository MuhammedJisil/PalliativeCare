import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Phone, MapPin, Calendar, Book, Award, FileText } from 'lucide-react';

const VolunteerCaregiverRegistration = () => {
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
    notes: ''
  });

  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
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
      alert('Registration Successful');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <Heart className="h-12 w-12 text-teal-600 mb-4" />
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Registration</h2>
          <p className="text-gray-600">Join our community as a Volunteer or Caregiver</p>
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
            </div>

            {role && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <User className="h-5 w-5 text-teal-600" />
                    <span>Name</span>
                  </label>
                  <input
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
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
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
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="3"
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
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        rows="3"
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
    </div>
  );
};

export default VolunteerCaregiverRegistration;