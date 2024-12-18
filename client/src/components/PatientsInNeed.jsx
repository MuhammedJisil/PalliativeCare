import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Eye, 
  Trash2, 
  ArrowLeft,
  RefreshCw,
  UserPlus,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  ActivityIcon,
  FileText,
  CheckCircle

} from 'lucide-react';
import ScrollToBottomButton from './ScrollToBottomButton';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone_number: '',
    place: '',
    address: '',
    health_condition: '',
    care_details: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/patients-in-need', formData);
      
      // Clear form after successful submission
      setFormData({
        patient_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone_number: '',
        place: '',
        address: '',
        health_condition: '',
        care_details: '',
        notes: ''
      });

      // Notify parent component
      onPatientAdded(response.data);
      onClose();

    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient. Please try again.');
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
                  Add New Patient
                </h3>
                <p className="text-sm text-gray-500">
                  Fill out the details for a new patient in need
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Name */}
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

              {/* Contact Name */}
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

              {/* Contact Email */}
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

              {/* Contact Phone Number */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Phone className="h-5 w-5 text-teal-600" />
                  <span>Contact Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="contact_phone_number"
                  value={formData.contact_phone_number}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Place */}
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

              {/* Address */}
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

              {/* Health Condition */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <ActivityIcon className="h-5 w-5 text-teal-600" />
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

              {/* Care Details */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <span>Care Details</span>
                </label>
                <textarea
                  name="care_details"
                  value={formData.care_details}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              {/* Notes */}
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
                  Add Patient
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

// patient in need component

const PatientsInNeed = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/patients-in-need');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id) => {
    navigate(`/admin/patients-in-need/view/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this patient?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/patients-in-need/${id}`);
        setPatients(patients.filter((patient) => patient.id !== id));
        setSuccess('patient deleted successfully!');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient');
      }
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.patient_name && patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = (newPatient) => {
    setSuccess('patient added successfully!');
    // Add the new patient to the list
    setPatients([...patients, newPatient]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Patients in Need
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Add Patient Button for Large screens */}
            <div className="hidden sm:block">
                            <button 
                              onClick={() => setIsAddModalOpen(true)}
                              className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                            >
                                <UserPlus size={16} className="mr-2" />
                                Add Patient
                            </button>
                            </div>
              <button
                onClick={fetchPatients}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patients in need..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <RefreshCw className="animate-spin text-red-600" size={24} />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Heart size={48} className="mb-4 text-gray-400" />
              <p>No patients in need found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {patient.patient_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleView(patient.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors mr-2"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

        {/* Add Patient Button for Mobile */}
        <div className="sm:hidden fixed bottom-4 right-4 z-50">
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                    >
                        <UserPlus size={24} />
                    </button>
                </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
      {isAddModalOpen && (
        <AddPatientModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          onPatientAdded={handleAddPatient}
        />
      )}
      <ScrollToBottomButton/>
    </div>
  );
};

export default PatientsInNeed;