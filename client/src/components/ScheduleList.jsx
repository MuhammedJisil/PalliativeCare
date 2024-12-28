import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, PlusCircle, Edit, Trash2, 
  ArrowLeft, ClipboardList, Eye, X, 
  User, CalendarDays, Clock, FileText, 
  AlertCircle, CheckCircle, UserPlus
} from 'lucide-react';
import ScrollToBottomButton from './ScrollToBottomButton';
import ConfirmDialog from './ConfrmDialog';

// Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl relative flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-teal-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
};
// add schedule component
const AddScheduleModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    member_name: '',
    visit_date: '',
    visit_time: '',
    visit_type: '',
    notes: ''
  });
  const [error, setError] = useState(null);

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
      const response = await axios.post('http://localhost:5000/api/schedules', formData);
      onAdd(response.data);
      onClose();
      // Reset form after successful submission
      setFormData({
        patient_name: '',
        member_name: '',
        visit_date: '',
        visit_time: '',
        visit_type: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      setError('Failed to add schedule. Please try again.');
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
                <CalendarDays className="h-6 w-6 text-teal-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Add New Schedule
                </h3>
                <p className="text-sm text-gray-500">
                  Create a new schedule entry
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
                  placeholder="Enter patient name"
                />
              </div>

              {/* Member Name */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <UserPlus className="h-5 w-5 text-teal-600" />
                  <span>Member Name (Doctor/Volunteer)</span>
                </label>
                <input
                  type="text"
                  name="member_name"
                  value={formData.member_name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter member name"
                />
              </div>

              {/* Visit Date */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <CalendarDays className="h-5 w-5 text-teal-600" />
                  <span>Visit Date</span>
                </label>
                <input
                  type="date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Visit Time */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Clock className="h-5 w-5 text-teal-600" />
                  <span>Visit Time</span>
                </label>
                <input
                  type="time"
                  name="visit_time"
                  value={formData.visit_time}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Visit Type */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <span>Visit Type</span>
                </label>
                <select
                  name="visit_type"
                  value={formData.visit_type}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select Visit Type</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Other">Other</option>
                </select>
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
                  rows="4"
                  placeholder="Enter any additional notes (optional)"
                ></textarea>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Schedule
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


// update schedule component
const UpdateScheduleModal = ({ schedule, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    member_name: '',
    visit_date: '',
    visit_time: '',
    visit_type: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (schedule) {
      setFormData({
        patient_name: schedule.patient_name,
        member_name: schedule.member_name,
        visit_date: schedule.visit_date ? 
        new Date(schedule.visit_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        }) : '',
        visit_time: schedule.visit_time,
        visit_type: schedule.visit_type,
        notes: schedule.notes || ''
      });
    }
  }, [schedule]);

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
      const response = await axios.put(`http://localhost:5000/api/schedules/${schedule.id}`, formData);
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError('Failed to update schedule. Please try again.');
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
                <CalendarDays className="h-6 w-6 text-teal-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Edit Schedule
                </h3>
                <p className="text-sm text-gray-500">
                  Edit the details of an existing schedule
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
                  placeholder="Enter patient name"
                />
              </div>

              {/* Member Name */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <UserPlus className="h-5 w-5 text-teal-600" />
                  <span>Member Name (Doctor/Volunteer)</span>
                </label>
                <input
                  type="text"
                  name="member_name"
                  value={formData.member_name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter member name"
                />
              </div>

              {/* Visit Date */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <CalendarDays className="h-5 w-5 text-teal-600" />
                  <span>Visit Date</span>
                </label>
                <input
                  type="date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Visit Time */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <Clock className="h-5 w-5 text-teal-600" />
                  <span>Visit Time</span>
                </label>
                <input
                  type="time"
                  name="visit_time"
                  value={formData.visit_time}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Visit Type */}
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <span>Visit Type</span>
                </label>
                <select
                  name="visit_type"
                  value={formData.visit_type}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select Visit Type</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Other">Other</option>
                </select>
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
                  rows="4"
                  placeholder="Enter any additional notes (optional)"
                ></textarea>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Schedule
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

// Schedule List Component
const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schedules');
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/schedules/${deleteId}`);
      setSchedules(schedules.filter((schedule) => schedule.id !== deleteId));
      setSuccess('Schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setError('Failed to delete schedule');
    }
    setShowConfirm(false);
  };

  const handleView = (schedule) => {
    setSelectedSchedule(schedule);
    setShowViewModal(true);
  };

  const handleUpdateOpen = (schedule) => {
    setSelectedSchedule(schedule);
    setShowUpdateModal(true);
  };

  const handleUpdateSchedule = (updatedSchedule) => {
    setSuccess('schedule updated successfully!');
    setSchedules(schedules.map(schedule => 
      schedule.id === updatedSchedule.id ? updatedSchedule : schedule
    ));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddSchedule = (newSchedule) => {
    setSuccess('schedule added successfully!');
    setSchedules(prevSchedules => [...prevSchedules, newSchedule]);
  };
  const ScheduleDetails = ({ schedule }) => (
    <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
          <User className="w-5 h-5 text-teal-600 mt-1" />
          <div className="w-full">
            <p className="text-sm text-gray-500">Patient Name</p>
            <p className="text-gray-800 break-words">{schedule.patient_name}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
          <User className="w-5 h-5 text-teal-600 mt-1" />
          <div className="w-full">
            <p className="text-sm text-gray-500">Member Name</p>
            <p className="text-gray-800 break-words">{schedule.member_name}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
          <CalendarDays className="w-5 h-5 text-teal-600 mt-1" />
          <div className="w-full">
            <p className="text-sm text-gray-500">Visit Date</p>
            <p className="text-gray-800 break-words">
  {new Date(schedule.visit_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
          <Clock className="w-5 h-5 text-teal-600 mt-1" />
          <div className="w-full">
            <p className="text-sm text-gray-500">Visit Time</p>
            <p className="text-gray-800 break-words">{schedule.visit_time}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
          <ClipboardList className="w-5 h-5 text-teal-600 mt-1" />
          <div className="w-full">
            <p className="text-sm text-gray-500">Visit Type</p>
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
              {schedule.visit_type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0">
        <FileText className="w-5 h-5 text-teal-600 mt-1" />
        <div className="w-full">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-gray-800 break-words bg-gray-50 p-4 rounded-lg">
            {schedule.notes || 'No additional notes available'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Schedule Management
              </h1>
            </Link>
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

            {/* Add schedule Button for large screens */}
            <div className="hidden sm:block">
              <button 
                 onClick={handleOpenModal}
                className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
              >
                <PlusCircle size={16} className="mr-2" />
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md">
  {schedules.length === 0 ? (
    <div className="text-center text-gray-500 py-12">
      <ClipboardList className="mx-auto h-16 w-16 text-teal-300 mb-4" />
      <p className="text-xl">No schedules found</p>
    </div>
  ) : (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
            Patient
          </th>
          <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {schedules.map((schedule) => (
          <tr
            key={schedule.id}
            className="hover:bg-gray-50"
          >
            <td className="py-4 px-4 whitespace-nowrap text-gray-700">
              {schedule.patient_name}
            </td>
            <td className="py-4 px-4 border-b">
              <div className="flex space-x-2">
                {/* View Button */}
                <button
                  onClick={() => handleView(schedule)}
                  className="hidden md:inline-flex items-center px-3 py-1.5 rounded-md text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  title="View Details"
                >
                  <Eye size={20} className="mr-2" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleView(schedule)}
                  className="md:hidden text-blue-500 hover:text-blue-700 transition-colors"
                  title="View Details"
                >
                  <Eye size={20} />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleUpdateOpen(schedule)}
                  className="hidden md:inline-flex items-center px-3 py-1.5 rounded-md text-yellow-500 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                  title="Edit"
                >
                  <Edit size={20} className="mr-2" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleUpdateOpen(schedule)}
                  className="md:hidden text-yellow-500 hover:text-yellow-700 transition-colors"
                  title="Edit"
                >
                  <Edit size={20} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="hidden md:inline-flex items-center px-3 py-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} className="mr-2" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="md:hidden text-red-500 hover:text-red-700 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
        {/* Add schedule Button for Mobile */}
        <div className="sm:hidden fixed bottom-4 right-4 z-50">
          <button 
             onClick={handleOpenModal}
            className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
          >
            <PlusCircle size={24} />
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

      {/* View Schedule Modal */}
      <Modal 
        isOpen={showViewModal} 
        onClose={() => setShowViewModal(false)}
        title="Schedule Details"
      >
        {selectedSchedule && <ScheduleDetails schedule={selectedSchedule} />}
      </Modal>

      {/* Update Schedule Modal */}
      <UpdateScheduleModal
        schedule={selectedSchedule}
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateSchedule}
      />
      {/* Modal */}
      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddSchedule}
      />
      {/* Confirm Dialog Component */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule?"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
      <ScrollToBottomButton/>
    </div>
  );
};

export default ScheduleList;