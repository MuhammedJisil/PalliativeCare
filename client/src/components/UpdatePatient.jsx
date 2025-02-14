import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Save, ArrowLeft, MapPin,  User, Stethoscope, UserCheck, CheckCircle, StickyNote, AlertCircle } from 'lucide-react';
import BASE_URL from '../config';

const UpdatePatient = () => {
  const { id } = useParams();
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
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
    place: '',   // Add new place field
    placeLink: '',        
    additionalNotes: ''  // Add new additional notes field
  });


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

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/patients/${id}`);
        const data = response.data;

        // Split place data if it contains a separator
        let placeValue = '';
        let placeLinkValue = '';
        
        if (data.place && data.place.includes('|')) {
          [placeValue, placeLinkValue] = data.place.split('|');
        } else {
          placeValue = data.place || '';
        }
        setFormData({
          firstName: data.first_name,
          initialTreatmentDate: formatDate(data.initial_treatment_date),
          dob: formatDate(data.dob),
          age: data.age || '',
          gender: data.gender || '',
          address: data.address || '',
          phoneNumber: data.phone_number || '',
          supportType: data.support_type || '',
          doctor: data.doctor || '',
          caregiver: data.caregiver || '',
          disease: data.health_status?.disease || '',
          medication: data.health_status?.medication || '',
          note: data.health_status?.note || '',
          noteDate: formatDate(data.health_status?.note_date),
          proxyName: data.medical_proxy?.name || '',
          relation: data.medical_proxy?.relation || '',
          proxyPhoneNumber: data.medical_proxy?.phone_number || '',
          history: data.medical_history || '',
          place: placeValue,
          placeLink: placeLinkValue,
        additionalNotes: data.additional_notes || ''
        });
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
        setError('Failed to fetch patient details');
      }
    };
    fetchPatient();
  }, [id]);

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return; // Stop submission
    }
    try {
      await axios.put(`${BASE_URL}/api/patients/${id}/personal`, {
        first_name: formData.firstName,
        dob: formData.dob || null,
        age: formData.age || null,
        gender: formData.gender || null,
        address: formData.address || null,
        phone_number: formData.phoneNumber || null,
        support_type: formData.supportType || null,
        place: formData.placeLink 
        ? `${formData.place}|${formData.placeLink}`.trim()
        : formData.place || null, // Add place to personal info update
      });
      setSuccess('Personal information updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        navigate('/admin/patient-management');
      }, 1000);
    } catch (error) {
      setError('Failed to update personal information');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateNotes = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/patients/${id}/notes`, {
        additional_notes: formData.additionalNotes || null
      });
      setSuccess('Additional notes updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        navigate('/admin/patient-management');
      }, 1000);
    } catch (error) {
      setError('Failed to update additional notes');
      setTimeout(() => setError(null), 3000);
    }
  };
  

  const handleUpdateMedical = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/patients/${id}/medical`, {
        initial_treatment_date: formData.initialTreatmentDate || null,
        doctor: formData.doctor || null,
        caregiver: formData.caregiver || null,
        health_status: {
          disease: formData.disease || null,
          medication: formData.medication || null,
          note: formData.note,
          note_date: formData.noteDate || new Date().toISOString().split('T')[0],
        }
      });
      setSuccess('Medical information updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        navigate('/admin/patient-management');
      }, 1000);
    } catch (error) {
      setError('Failed to update medical information');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateProxy = async (e) => {
    e.preventDefault();
    if (formData.proxyPhoneNumber.length !== 10) {
      setError('Proxy phone number must be exactly 10 digits');
      return; // Stop submission
    }
    try {
      await axios.put(`${BASE_URL}/api/patients/${id}/proxy`, {
        medical_proxy: {
          name: formData.proxyName || null,
          relation: formData.relation || null,
          phone_number: formData.proxyPhoneNumber || null,
        }
      });
      setSuccess('Medical proxy updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        navigate('/admin/patient-management');
      }, 1000);
    } catch (error) {
      setError('Failed to update medical proxy');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateHistory = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/patients/${id}/history`, {
        medical_history: formData.history
      });
      setSuccess('Medical history updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        navigate('/admin/patient-management');
      }, 1000);
    } catch (error) {
      setError('Failed to update medical history');
      setTimeout(() => setError(null), 3000);
    }
  };

  const renderPlaceInputs = () => (
    <div className="mt-4 space-y-4">
      <label className="block text-gray-600 font-medium mb-2">Place</label>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleInputChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter location or place"
          />
        </div>
        
        <div className="pl-7">
          <input
            type="url"
            name="placeLink"
            value={formData.placeLink}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Add location link (optional)"
          />
        </div>
      </div>
    </div>
  );

  const renderSections = () => {
    if (formData.supportType === 'medical' || formData.supportType === 'caregiver') {
      return (
        <>
          {/* Medical Information Section */}
          <form onSubmit={handleUpdateMedical} className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-6 w-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-700">Medical Information</h2>
                </div>
                <button
  type="submit"
  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
>
  <Save className="w-4 h-4 mr-2" />
  Update
</button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Disease</label>
                  <input
                    type="text"
                    name="disease"
                    value={formData.disease}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-2">Medication</label>
                  <textarea
                    name="medication"
                    value={formData.medication}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Caregiver</label>
                  <input maxLength="30"
                    type="text"
                    name="caregiver"
                    value={formData.caregiver}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-2">Note Date</label>
                  <input
                    type="date"
                    name="noteDate"
                    value={formData.noteDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-600 font-medium mb-2">Additional Notes</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="4"
                ></textarea>
              </div>
            </div>
          
          </form>

          {/* Medical Proxy Section */}
          <form onSubmit={handleUpdateProxy} className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-6 w-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-700">Medical Proxy</h2>
                </div>
                <button
  type="submit"
  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
>
  <Save className="w-4 h-4 mr-2" />
  Update
</button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Proxy Name</label>
                  <input
                    maxLength="30"
                    type="text"
                    name="proxyName"
                    value={formData.proxyName}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-600 font-medium mb-2">Proxy Phone Number</label>
                <input
                  type="tel"
                  name="proxyPhoneNumber"
                  value={formData.proxyPhoneNumber || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      handleInputChange({
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
          </form>

          {/* Medical History Section */}
          <form onSubmit={handleUpdateHistory} className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Medical History</h2>
                <button
  type="submit"
  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
>
  <Save className="w-4 h-4 mr-2" />
  Update
</button>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2">Additional History</label>
                <textarea
                  name="history"
                  value={formData.history}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </form>
        </>
      );
    }else if (formData.supportType === 'volunteer' || formData.supportType === 'other') {
      return (
        <form onSubmit={handleUpdateNotes} className="mb-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <StickyNote className="h-6 w-6 text-teal-600" />
                <h2 className="text-xl font-semibold text-gray-700">Additional Notes</h2>
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
              >
                <Save className="w-4 h-4 mr-2" />
                Update
              </button>
            </div>
  
            <div>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
                placeholder="Enter any additional information"
              ></textarea>
            </div>
          </div>
        </form>
      );
    }
    return null;
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6 space-x-4">
            <UserPlus className="h-10 w-10 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-800">Edit Patient Details</h1>
          </div>

          {/* Alert Messages */}
          {(error || success) && (
            <div className="fixed inset-0 z-40 bg-black/10" onClick={() => { setError(null); setSuccess(null); }}>
              <div className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <p className="font-medium">{success}</p>
                  </div>
                )}
              </div>
            </div>
          )}

         {/* Personal Information Section */}
         <form onSubmit={handleUpdatePersonal} className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-teal-600" />
                  <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Full Name</label>
                  <input
                    maxLength="30"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-2">Support Type</label>
                  <select
                    name="supportType"
                    value={formData.supportType}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                          onChange={handleInputChange}
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
                    value={formData.phoneNumber || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setFormData(prevData => ({
                          ...prevData,
                          phoneNumber: value
                        }));
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

              {renderPlaceInputs()}

              <div className="mt-4">
                <label className="block text-gray-600 font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
            </div>
          </form>
          {/* Render additional sections based on support type */}
          {renderSections()}

          {/* Back Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/patient-management')}
              className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to list
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePatient;