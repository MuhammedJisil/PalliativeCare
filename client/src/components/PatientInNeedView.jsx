import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Heart,
  X,
  CheckCircle,
  Activity,
  Stethoscope,
  LifeBuoy
} from 'lucide-react';
import BASE_URL from '../config';



const UpdatePatientModal = ({ 
  isOpen, 
  onClose, 
  patientId, 
  initialData,
  onPatientUpdated 
}) => {
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

  const supportTypes = [
    { value: '', label: 'Select Support Type' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'medical', label: 'Medical' },
    { value: 'others', label: 'Others' }
  ];

  // Populate form data when modal opens or initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        patient_name: initialData.patient_name || '',
        contact_name: initialData.contact_name || '',
        contact_email: initialData.contact_email || '',
        contact_phone_number: initialData.contact_phone_number || '',
        place: initialData.place || '',
        address: initialData.address || '',
        support_type: initialData.support_type || '',
        health_condition: initialData.health_condition || '',
        care_details: initialData.care_details || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${BASE_URL}/api/patients-in-need/${patientId}`;
      const response = await axios.put(url, formData);
      
      onPatientUpdated(response.data.patient);
      onClose();
      
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Close button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div className="sm:flex sm:items-start mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                <Heart className="h-6 w-6 text-teal-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Edit Patient Profile
                </h3>
                <p className="text-sm text-gray-500">
                  Edit details for this patient
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Name Input */}
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

              {/* Contact Name Input */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <User className="h-5 w-5 text-teal-600" />
                  <span>Contact Name</span>
                </label>
                <input
                  maxLength="30"
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Contact Email Input */}
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
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Contact Phone Number Input */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Phone className="h-5 w-5 text-teal-600" />
                  <span>Contact Phone Number</span>
                </label>
                <input
                  placeholder="Enter 10 digit number"
                  maxLength="10"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  type="tel"
                  name="contact_phone_number"
                  value={formData.contact_phone_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      handleChange({
                        ...e,
                        target: {
                          name: 'contact_phone_number',
                          value: value
                        }
                      });
                    }
                  }}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Place Input */}
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

              {/* Address Input */}
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

              {/* Support Type Dropdown */}
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

              {/* Health Condition Input - Only show for medical support type */}
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

              {/* Care Details Input - Only show for caregiver support type */}
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

              {/* Notes Input */}
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

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Patient
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-full border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// patient in need view component

const PatientInNeedView = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/patients-in-need/${id}`);
      setPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePatient = (updatedPatient) => {
    setSuccess('Patient updated successfully!');
    setPatient(updatedPatient);
    setIsUpdateModalOpen(false);
  };

  // Function to determine which fields to show based on support type
  const shouldShowField = (fieldType) => {
    if (!patient) return false;
    
    switch (patient.support_type) {
      case 'medical':
        return fieldType === 'health_condition';
      case 'caregiver':
        return fieldType === 'care_details';
      case 'volunteer':
      case 'others':
        return false;
      default:
        return true;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Heart size={48} className="mx-auto mb-4" />
          <p>Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                  Patient Profile
                </h1>
                <p className="text-sm text-teal-600">{patient.patient_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchPatient}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center text-gray-800">
              <User className="mr-2 text-teal-600" size={20} />
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Contact Name</p>
                  <p className="text-gray-800">{patient.contact_name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="text-gray-800">{patient.contact_email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Contact Phone Number</p>
                  <p className="text-gray-800">{patient.contact_phone_number}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-800 break-words">{patient.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center text-gray-800">
              <Heart className="mr-2 text-teal-600" size={20} />
              Patient Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Place</p>
                  <p className="text-gray-800 break-words">{patient.place}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
                <LifeBuoy className="w-5 h-5 text-gray-400 mt-1" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Support Type</p>
                  <p className="text-gray-800 break-words capitalize">{patient.support_type}</p>
                </div>
              </div>

              {shouldShowField('health_condition') && (
                <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
                  <Heart className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Health Condition</p>
                    <p className="text-gray-800 break-words">{patient.health_condition}</p>
                  </div>
                </div>
              )}

              {shouldShowField('care_details') && (
                <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Care Details</p>
                    <p className="text-gray-800 break-words">{patient.care_details}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <div className="w-full">
                  <p className="text-sm text-gray-500">Additional Notes</p>
                  <p className="text-gray-800 break-words">{patient.notes}</p>
                </div>
              </div>
            </div>
          </div>
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

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin/patients-in-need')}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to List
          </button>

          <div className="flex space-x-4">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <UpdatePatientModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        patientId={id}
        initialData={patient}
        onPatientUpdated={handleUpdatePatient}
      />
    </div>
  );
};

export default PatientInNeedView;