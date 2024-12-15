import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, PlusCircle, Edit, Trash2, 
  ArrowLeft, ClipboardList, Eye, X
} from 'lucide-react';

// schedule view component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 relative">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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

  const handleUpdate = (id) => {
    navigate(`/admin/schedules/update/${id}`);
  };

  

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this schedule?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/schedules/${id}`);
        setSchedules(schedules.filter(schedule => schedule.id !== id));
        alert('Schedule deleted successfully');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Failed to delete schedule');
      }
    }
  };

  const handleView = (schedule) => {
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  const ScheduleDetails = ({ schedule }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Patient Name</p>
          <p className="text-base text-gray-900">{schedule.patient_name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Member Name</p>
          <p className="text-base text-gray-900">{schedule.member_name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Visit Date</p>
          <p className="text-base text-gray-900">{schedule.visit_date}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Visit Time</p>
          <p className="text-base text-gray-900">{schedule.visit_time}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Visit Type</p>
          <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
            {schedule.visit_type}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Notes</p>
        <p className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg">
          {schedule.notes || 'No additional notes available'}
        </p>
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
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Schedule Management
              </h1>
            </div>
            {/* Add volunteer Button for large screens */}
              <div className="hidden sm:block">
                            <button 
                             onClick={() => navigate('/admin/schedules/add')}
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
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleView(schedule)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => handleUpdate(schedule.id)}
                          className="text-yellow-500 hover:text-yellow-700 transition-colors"
                          title="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
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
                      onClick={() => navigate('/admin/schedules/add')}
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

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Schedule Details"
      >
        {selectedSchedule && <ScheduleDetails schedule={selectedSchedule} />}
      </Modal>
    </div>
  );
};

export default ScheduleList;