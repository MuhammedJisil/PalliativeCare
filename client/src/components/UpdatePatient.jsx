import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  User, 
  Stethoscope, 
  UserCheck,  
  ArrowLeft, 
  CheckCircle,
  AlertCircle 
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
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl border border-gray-100">
        <div className="flex items-center mb-6 space-x-4">
          <UserPlus className="h-10 w-10 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-800">Update Patient Details</h1>
        </div>

        {/* Alert Content */}
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
                <label className="block text-gray-600 font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
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
                <input
                  maxLength="30"
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
           {/* Medical History */}
<div className="mt-6 space-y-4">
  <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Medical History</h2>
  <div>
    <label className="block text-sm font-medium text-gray-700">Additional History</label>
    <textarea
      name="history"
      className="mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
  );
};

export default UpdatePatient;