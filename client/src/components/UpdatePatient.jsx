import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

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
        const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
        const data = response.data;
        setFormData({
          firstName: data.first_name,
          initialTreatmentDate: formatDate(data.initial_treatment_date),
          dob: formatDate(data.dob),
          age: data.age || '',
          gender: data.gender || '',
          address: data.address || '',
          phoneNumber: data.phone_number || '',
          doctor: data.doctor || '',
          caregiver: data.caregiver || '',
          disease: data.health_status?.disease || '',
          medication: data.health_status?.medication || '',
          note: data.health_status?.note || '',
          noteDate: formatDate(data.health_status?.note_date),
          proxyName: data.medical_proxy?.name || '',
          relation: data.medical_proxy?.relation || '',
          proxyPhoneNumber: data.medical_proxy?.phone_number || '',
          history: data.medical_history || ''
        });
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };
    fetchPatient();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/patients/${id}`, {
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
          note: `${formData.noteDate || new Date().toISOString().split('T')[0]}: ${formData.note}\n${patient.health_status?.note || ''}`,
          note_date: formData.noteDate || new Date().toISOString().split('T')[0],
        },
        medical_proxy: {
          name: formData.proxyName || null,
          relation: formData.relation || null,
          phone_number: formData.proxyPhoneNumber || null,
        },
        medical_history: `${new Date().toISOString().split('T')[0]}: ${formData.history}\n${patient.medical_history || ''}`,
      });
      setSuccess('Patient updated successfully!');
    
    //  Navigate after a short delay to allow user to see the success message
    setTimeout(() => {
      navigate('/admin/patient-management');
    }, 1000); // 1 second delay
    } catch (error) {
      console.error('Error updating patient details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Update Patient Details
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">

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

              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    name="age"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <input
                    type="text"
                    name="gender"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.gender}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Contact Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor</label>
                  <input
                    type="text"
                    name="doctor"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.doctor}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caregiver</label>
                  <input
                    type="text"
                    name="caregiver"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.caregiver}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Medical Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Disease</label>
                  <input
                    type="text"
                    name="disease"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.disease}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medication</label>
                  <input
                    type="text"
                    name="medication"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.medication}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Note</label>
                  <textarea
                    name="note"
                    className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Note Date</label>
                  <input
                    type="date"
                    name="noteDate"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.noteDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Medical Proxy */}
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Medical Proxy</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proxy Name</label>
                  <input
                    type="text"
                    name="proxyName"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.proxyName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relation</label>
                  <input
                    type="text"
                    name="relation"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.relation}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proxy Phone Number</label>
                  <input
                    type="text"
                    name="proxyPhoneNumber"
                    className="mt-1 block w-full border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.proxyPhoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Medical History</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Additional History</label>
                <textarea
                  name="history"
                  className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.history}
                  onChange={handleInputChange}
                  rows="4"
                ></textarea>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 flex justify-between items-center">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
              >
                Update 
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
    </div>
  );
};

export default UpdatePatient;