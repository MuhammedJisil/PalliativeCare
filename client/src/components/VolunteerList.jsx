import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Eye, 
  Trash2, 
  ArrowLeft,
  UserPlus,
  RefreshCw,
  Heart, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Book, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ScrollToBottomButton from './ScrollToBottomButton';
import ErrorNotification from './ErrorNotification';
import ConfirmDialog from './ConfrmDialog';
import PhoneNumberInput from './PhoneNumberInput';
import BASE_URL from '../config';

// AddVolunteerModal Component
const AddVolunteerModal = ({ isOpen, onClose, onVolunteerAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    availability: '',
    skills: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
 
    // Validate phone number before submission
    if (formData.phone_number.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
 
    try {
      const url = `${BASE_URL}/api/volunteers`;
      const response = await axios.post(url, {
         ...formData,
         userType: 'volunteer'
      });
 
      // Clear form after successful submission
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        availability: '',
        skills: '',
        notes: ''
      });
 
      // Notify parent component and close modal
      onVolunteerAdded(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding volunteer:', error);
 
      // Handle specific error scenarios
      if (error.response) {
        switch(error.response.status) {
          case 409:
            if (error.response.data.error.includes('email')) {
              setError('A volunteer with this email already exists.');
            } else if (error.response.data.error.includes('phone number')) {
              setError('A volunteer with this phone number already exists.');
            } else {
              setError('Volunteer already exists.');
            }
            break;
          default:
            setError('Failed to add volunteer. Please try again.');
        }
      } else {
        setError('Network error. Please try again.');
      }
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
                  Add New Volunteer
                </h3>
                <p className="text-sm text-gray-500">
                  Fill out the details for a new volunteer
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <PhoneNumberInput 
    formData={formData} 
    handleChange={handleChange} 
  />

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
                  Add Volunteer
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

// VolunteerList Component
const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/volunteers`);
      setVolunteers(response.data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      // Mark the volunteer as viewed
      await axios.put(`${BASE_URL}/api/volunteers/${id}/view`);
      // Update the local state to remove the NEW tag
      setVolunteers(volunteers.map(volunteer => 
        volunteer.id === id ? { ...volunteer, is_new: false } : volunteer
      ));
      // Navigate to the view page
      navigate(`/admin/volunteers/view/${id}`);
    } catch (error) {
      console.error('Error marking volunteer as viewed:', error);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
   };
   
   const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/volunteers/${deleteId}`);
      setVolunteers(volunteers.filter((volunteer) => volunteer.id !== deleteId));
      setSuccess('volunteer deleted successfully!');
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      setError('Failed to delete volunteer');
    }
    setShowConfirm(false);
   };


  const handleAddVolunteer = (newVolunteer) => {
    setSuccess('volunteer added successfully!');
    // Add the new volunteer to the list
    setVolunteers([...volunteers, newVolunteer]);
  };

  const filteredVolunteers = volunteers.filter((volunteer) =>
    volunteer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-teal-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Volunteers
              </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
               {/* Add volunteer Button for large screens */}
              <div className="hidden sm:block">
                            <button 
                              onClick={() => setIsAddModalOpen(true)}
                              className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                            >
                                <UserPlus size={16} className="mr-2" />
                                Add volunteer
                            </button>
                            </div>
              <button
                onClick={fetchVolunteers}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
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
              placeholder="Search volunteers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
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

       {/* Volunteers List */}
<div className="bg-white rounded-lg shadow-md">
  {isLoading ? (
    <div className="flex justify-center items-center h-48">
      <RefreshCw className="animate-spin text-teal-600" size={24} />
    </div>
  ) : filteredVolunteers.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
      <Users size={48} className="mb-4 text-gray-400" />
      <p>No volunteers found</p>
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
      {filteredVolunteers.map((volunteer) => (
        <tr key={volunteer.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
            <div className="flex items-center space-x-2">
              <span>{volunteer.name}</span>
              {volunteer.is_new && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-700">
                  NEW
                </span>
              )}
            </div>
          </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2">
                  {/* View Button - Desktop */}
                  <button
                    onClick={() => handleView(volunteer.id)}
                    className="hidden md:inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                  >
                    <Eye size={20} className="mr-1.5" />
                    <span>View</span>
                  </button>
                  {/* View Button - Mobile */}
                  <button
                    onClick={() => handleView(volunteer.id)}
                    className="md:hidden inline-flex items-center p-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                  >
                    <Eye size={20} />
                  </button>

                  {/* Delete Button - Desktop */}
                  <button
                    onClick={() => handleDelete(volunteer.id)}
                    className="hidden md:inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={20} className="mr-1.5" />
                    <span>Delete</span>
                  </button>
                  {/* Delete Button - Mobile */}
                  <button
                    onClick={() => handleDelete(volunteer.id)}
                    className="md:hidden inline-flex items-center p-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
        {/* Add volunteer Button for Mobile */}
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
      <AddVolunteerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onVolunteerAdded={handleAddVolunteer}
      />
    )}
    <ConfirmDialog
  isOpen={showConfirm}
  title="Delete Volunteer"
  message="Are you sure you want to delete this Volunteer?"
  onConfirm={confirmDelete}
  onCancel={() => setShowConfirm(false)}
/>
     <ScrollToBottomButton />
  </div>
);
};

export default VolunteerList;