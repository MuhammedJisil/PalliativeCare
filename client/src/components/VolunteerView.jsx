import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2,
  Star,
  Clock,
  Award,
  FileText,
  RefreshCw, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Book, 
  X, 
  CheckCircle, 
  Heart 
} from 'lucide-react';
import PhoneNumberInput from './PhoneNumberInput';
import ErrorNotification from './ErrorNotification';
import BASE_URL from '../config';

// Update Volunteer Modal Component
const UpdateVolunteerModal = ({ 
  isOpen, 
  onClose, 
  volunteerId, 
  initialData,
  onVolunteerUpdated 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    availability: '',
    skills: '',
    notes: ''
  });

  const [error, setError] = useState(null);
  
  // Populate form data when modal opens or initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone_number: initialData.phone_number || '',
        address: initialData.address || '',
        availability: initialData.availability || '',
        skills: initialData.skills || '',
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
     // Validate phone number before submission
     if (formData.phone_number.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return; // Stop submission
    }
    try {
      const url = `${BASE_URL}/api/volunteers/${volunteerId}`;
      const response = await axios.put(url, formData);
      
      // Notify parent component and close modal
      onVolunteerUpdated(response.data);
      onClose();
      
    } catch (error) {
      console.error('Error updating volunteer:', error);
      alert('Failed to update volunteer. Please try again.');
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
                  Edit Volunteer
                </h3>
                <p className="text-sm text-gray-500">
                  Edit details for this volunteer
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <User className="h-5 w-5 text-teal-600" />
                  <span>Name</span>
                </label>
                <input
                  maxLength="30"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Email Input */}
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

              {/* Phone Number Input */}
              <PhoneNumberInput 
    formData={formData} 
    handleChange={handleChange} 
  />

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

              {/* Availability Input */}
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

              {/* Skills Input */}
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

              {/* Notes Input */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <User className="h-5 w-5 text-teal-600" />
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
                  Update Volunteer
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
      {/* Error component */}
      <ErrorNotification error={error} onClose={() => setError(null)} />
    </div>
  );
};

// Volunteer view 

const VolunteerView = () => {
  const [volunteer, setVolunteer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVolunteer();
  }, [id]);

  const fetchVolunteer = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/volunteers/${id}`);
      setVolunteer(response.data);
    } catch (error) {
      console.error('Error fetching volunteer details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateVolunteer = (updatedVolunteer) => {
    setSuccess('volunteer updated successfully!');
    setVolunteer(updatedVolunteer);
    setIsUpdateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <User size={48} className="mx-auto mb-4" />
          <p>Volunteer not found</p>
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
              <User className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                  Volunteer Profile
                </h1>
                <p className="text-sm text-teal-600">{volunteer.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchVolunteer}
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
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center text-gray-800">
              <User className="mr-2 text-teal-600" size={20} />
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">{volunteer.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-800">{volunteer.phone_number}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
    <div className="w-full">
      <p className="text-sm text-gray-500">Address</p>
      <p className="text-gray-800 break-words">{volunteer.address}</p>
    </div>
  </div>
            </div>
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

{/* Volunteer Details */}
<div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-lg font-semibold mb-6 flex items-center text-gray-800">
      <Star className="mr-2 text-teal-600" size={20} />
      Volunteer Details
    </h2>
    
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
        <Clock className="w-5 h-5 text-gray-400 mt-1" />
        <div className="w-full">
          <p className="text-sm text-gray-500">Availability</p>
          <p className="text-gray-800 break-words">{volunteer.availability}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
        <Award className="w-5 h-5 text-gray-400 mt-1" />
        <div className="w-full">
          <p className="text-sm text-gray-500">Skills</p>
          <p className="text-gray-800 break-words">{volunteer.skills}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
        <FileText className="w-5 h-5 text-gray-400 mt-1" />
        <div className="w-full">
          <p className="text-sm text-gray-500">Additional Notes</p>
          <p className="text-gray-800 break-words">{volunteer.notes}</p>
        </div>
      </div>
    </div>
  </div>
  </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/admin/volunteers')}
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
      {/* Update Volunteer Modal */}
      {isUpdateModalOpen && (
        <UpdateVolunteerModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          volunteerId={id}
          initialData={volunteer}
          onVolunteerUpdated={handleUpdateVolunteer}
        />
      )}
    </div>
  );
};

export default VolunteerView;