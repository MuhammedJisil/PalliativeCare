import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User, MapPin, Stethoscope, UserCheck, LayoutList, ArrowLeft, CheckCircle, AlertCircle, StickyNote } from 'lucide-react';
import BASE_URL from '../config';

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
    supportType: '',
    doctor: '',
    caregiver: '',
    disease: '',
    medication: '',
    note: '',
    noteDate: '',
    proxyName: '',
    relation: '',
    proxyPhoneNumber: '',
    history: '',
    place: '',
    placeLink: '',
    additionalNotes: ''
  });


  const handlePlaceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


   // When component mounts or place data is loaded
   useEffect(() => {
    if (formData.place && formData.place.includes('|')) {
      const [placeName, link] = formData.place.split('|');
      setFormData(prev => ({
        ...prev,
        place: placeName,
        placeLink: link || ''
      }));
    }
  }, []);
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
    if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return; // Stop submission
    }
    try {
      const patientData = {
        first_name: formData.firstName,
        support_type: formData.supportType,
        dob: formData.dob || null,
        age: formData.age || null,
        gender: formData.gender || null,
        address: formData.address || null,
        phone_number: formData.phoneNumber || null,
        place: formData.placeLink 
        ? `${formData.place}|${formData.placeLink}`.trim()
        : formData.place || null,
      };

      if (formData.supportType === 'medical' || formData.supportType === 'caregiver') {
        patientData.initial_treatment_date = formData.initialTreatmentDate || null;
        patientData.doctor = formData.doctor || null;
        patientData.caregiver = formData.caregiver || null;
        patientData.health_status = {
          disease: formData.disease || null,
          medication: formData.medication || null,
          note: formData.note || null,
          note_date: formData.noteDate || null
        };
        patientData.medical_proxy = {
          name: formData.proxyName || null,
          relation: formData.relation || null,
          phone_number: formData.proxyPhoneNumber || null
        };
        patientData.medical_history = formData.history || null;
      } else {
        patientData.additional_notes = formData.additionalNotes || null;
      }

      await axios.post(`${BASE_URL}/api/patients`, patientData);
      setSuccess('Patient added successfully!');
      setTimeout(() => {
        navigate('/admin/patient-management');
      }, 1000);
    } catch (error) {
      console.error('Error adding patient:', error);
      if (error.response && error.response.status === 409) {
        setError('A patient with same personal information already exists.');
      } else {
        setError('Failed to add patient. Please try again.');
      }
    }
  };

  const renderSections = () => {
    if (formData.supportType === 'medical' || formData.supportType === 'caregiver') {
      return (
        <>
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
                  maxLength="30"
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
                  maxLength="30"
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
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
            <div className="flex items-center mb-4 space-x-2">
              <UserCheck className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-700">Medical Proxy</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Proxy Name</label>
                <input
                  maxLength="30"
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
                  maxLength="10"
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
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    handleChange({
                      target: {
                        name: 'proxyPhoneNumber',
                        value: value
                      }
                    });
                  }
                }}
                placeholder="Enter 10 digit number"
                maxLength="10"
                pattern="[0-9]*"
                inputMode="numeric"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          {/* Medical History Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
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
        </>
      );
    } else if (formData.supportType === 'volunteer' || formData.supportType === 'other') {
      return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
          <div className="flex items-center mb-4 space-x-2">
            <StickyNote className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-700">Additional Notes</h2>
          </div>
          
          <textarea
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 h-32"
            placeholder="Enter any additional information..."
          ></textarea>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl border border-gray-100">
        <div className="flex items-center mb-6 space-x-4">
          <UserPlus className="h-10 w-10 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-800">Add New Patient</h1>
        </div>

        {/* Alert Messages */}
        {(error || success) && (
          <div className="fixed inset-0 z-40 bg-black/10" onClick={() => { setError(null); setSuccess(null); }}>
            <div className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()}>
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
                <label className="block text-gray-600 font-medium mb-2">Full Name</label>
                <input
                  maxLength="30"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2">Support Type</label>
                <select
                  name="supportType"
                  value={formData.supportType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Support Type</option>
                  <option value="medical">Medical</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="other">Other</option>
                </select>
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

              <div>
                <label className="block text-gray-600 font-medium mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  min="1"
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      handleChange({
                        target: {
                          name: 'phoneNumber',
                          value: value
                        }
                      });
                    }
                  }}
                  placeholder="Enter 10 digit number"
                  maxLength="10"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
      <label className="block text-gray-600 font-medium mb-2">Place</label>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handlePlaceChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter location or place"
          />
        </div>
        
        <div className="pl-7">
          <input
            type="url"
            name="placeLink"
            value={formData.placeLink}
            onChange={handlePlaceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Add location link (optional)"
          />
        </div>
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

          {/* Render Additional Sections based on Support Type */}
          {renderSections()}
          
          {/* Submit and Back Buttons */}
          <div className="mt-6 flex justify-between items-center">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
            >
              Add Patient
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