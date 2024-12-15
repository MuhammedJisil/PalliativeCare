import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserPlus,  User, Stethoscope,  UserCheck, LayoutList, ArrowLeft, CheckCircle } from 'lucide-react';

const AddPatient = () => {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    initialTreatmentDate: '',
    dob: '',
    age: '',
    gender: '',
    address: '',
    phoneNumber: '',
    doctor: '',
    caregiver: '',
    disease: '',
    medication: '',
    note: '',
    noteDate: '',
    proxyName: '',
    relation: '',
    proxyPhoneNumber: '',
    history: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/patients', {
        first_name: formData.firstName,
        initial_treatment_date: formData.initialTreatmentDate || null,
        dob: formData.dob || null,
        age: formData.age || null,
        gender: formData.gender || null,
        address: formData.address || null,
        phone_number: formData.phoneNumber || null,
        doctor: formData.doctor || null,
        caregiver: formData.caregiver || null,
        health_status: {
          disease: formData.disease || null,
          medication: formData.medication || null,
          note: formData.note || null,
          note_date: formData.noteDate || null
        },
        medical_proxy: {
          name: formData.proxyName || null,
          relation: formData.relation || null,
          phone_number: formData.proxyPhoneNumber || null
        },
        medical_history: formData.history || null
      });
      setSuccess('Patient added successfully!');
      //  Navigate after a short delay to allow user to see the success message
    setTimeout(() => {
      navigate('/admin/patient-management');
    }, 1000); // 1 second delay
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl border border-gray-100">
        <div className="flex items-center mb-6 space-x-4">
          <UserPlus className="h-10 w-10 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-800">Add New Patient</h1>
        </div>

         {/* alert content */}
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4 space-x-2">
              <User className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Gender</label>
                <div className="flex space-x-4 mt-2">
                  {['Male', 'Female', 'Other'].map(gender => (
                    <label key={gender} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        className="form-radio text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-2">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-600 font-medium mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>
          </div>
          
          {/* Medical Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4 space-x-2">
              <Stethoscope className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-700">Medical Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Disease</label>
                <input
                  type="text"
                  name="disease"
                  value={formData.disease}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Medication</label>
                <textarea
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Initial Treatment Date</label>
                <input
                  type="date"
                  name="initialTreatmentDate"
                  value={formData.initialTreatmentDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Doctor</label>
                <input
                  type="text"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Caregiver</label>
                <input
                  type="text"
                  name="caregiver"
                  value={formData.caregiver}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Note Date</label>
                <input
                  type="date"
                  name="noteDate"
                  value={formData.noteDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-600 font-medium mb-2">Additional Notes</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>
          </div>
          
          {/* Medical Proxy Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4 space-x-2">
              <UserCheck className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-700">Medical Proxy</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Proxy Name</label>
                <input
                  type="text"
                  name="proxyName"
                  value={formData.proxyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 font-medium mb-2">Relation</label>
                <input
                  type="text"
                  name="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-600 font-medium mb-2">Proxy Phone Number</label>
              <input
                type="tel"
                name="proxyPhoneNumber"
                value={formData.proxyPhoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          {/* Medical History Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4 space-x-2">
              <LayoutList className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-700">Medical History</h2>
            </div>
            
            <textarea
              name="history"
              value={formData.history}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 h-32"
              placeholder="Enter patient's medical history..."
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6 flex justify-between items-center">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
              >
                Add 
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/patient-management')}
                className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to list
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;