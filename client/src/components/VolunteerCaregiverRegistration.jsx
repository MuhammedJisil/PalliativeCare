import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      const url = role === 'volunteer' ? 'http://localhost:5000/api/volunteers' : 'http://localhost:5000/api/caregivers';
      await axios.post(url, formData);
      alert('Registration Successful');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Registration</h2>
      <div className="text-center mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="volunteer"
            checked={role === 'volunteer'}
            onChange={handleRoleChange}
            className="mr-2"
          />
          Volunteer
        </label>
        <label>
          <input
            type="radio"
            value="caregiver"
            checked={role === 'caregiver'}
            onChange={handleRoleChange}
            className="mr-2"
          />
          Caregiver
        </label>
      </div>
      {role && (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block mb-2">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Phone Number:</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Availability:</label>
            <textarea
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
          {role === 'volunteer' && (
            <div className="mb-4">
              <label className="block mb-2">Skills:</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              ></textarea>
            </div>
          )}
          {role === 'caregiver' && (
            <>
              <div className="mb-4">
                <label className="block mb-2">Experience:</label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Certifications:</label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block mb-2">Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Register
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VolunteerCaregiverRegistration;
