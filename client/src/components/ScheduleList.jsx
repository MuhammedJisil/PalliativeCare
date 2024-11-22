import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, User, PlusCircle, Edit, Trash2, 
  FileText, ClipboardList, Clock, Users 
} from 'lucide-react';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [expandedSchedule, setExpandedSchedule] = useState(null);
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

  const handleBack = () => {
    navigate('/admin/dashboard');
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

  const toggleNoteExpansion = (scheduleId) => {
    setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Heart className="h-10 w-10 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                  Schedule Management
                </h1>
                <p className="text-sm text-teal-600 font-medium">
                  Pain & Palliative Care Center
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/schedules/add')}
              className="flex items-center px-5 py-2.5 bg-teal-600 text-white rounded-full 
              hover:bg-teal-700 transition-all duration-300 
              transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="mr-2" size={20} />
              Add New Schedule
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {schedules.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ClipboardList className="mx-auto h-16 w-16 text-teal-300 mb-4" />
              <p className="text-xl">No schedules found</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-teal-50 border-b-2 border-teal-200">
                <tr>
                  {['Patient', 'Member', 'Date', 'Time', 'Type', 'Actions'].map((header) => (
                    <th key={header} className="py-4 px-4 text-left text-sm font-semibold text-teal-800 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <>
                    <tr 
                      key={schedule.id} 
                      className="hover:bg-teal-50 transition-colors group"
                    >
                      <td className="py-4 px-4 border-b font-medium text-gray-800">
                        {schedule.patient_name}
                      </td>
                      <td className="py-4 px-4 border-b text-gray-600">
                        {schedule.member_name}
                      </td>
                      <td className="py-4 px-4 border-b text-gray-600">
                        {schedule.visit_date}
                      </td>
                      <td className="py-4 px-4 border-b text-gray-600">
                        {schedule.visit_time}
                      </td>
                      <td className="py-4 px-4 border-b">
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                          {schedule.visit_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-b">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUpdate(schedule.id)}
                            className="text-yellow-500 hover:text-yellow-700 transition-colors"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button
                            onClick={() => toggleNoteExpansion(schedule.id)}
                            className="text-teal-500 hover:text-teal-700 transition-colors"
                          >
                            <FileText size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedSchedule === schedule.id && (
                      <tr>
                        <td colSpan="6" className="bg-teal-50 p-4">
                          <div className="bg-white rounded-lg shadow-inner p-4 border border-teal-100">
                            <h4 className="text-lg font-semibold text-teal-800 mb-2 flex items-center">
                              <FileText className="mr-2 text-teal-600" size={20} />
                              Schedule Notes
                            </h4>
                            <p className="text-gray-700">
                              {schedule.notes || 'No additional notes available'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleBack}
            className="flex items-center justify-center mx-auto px-6 py-2.5 
            bg-teal-600 text-white rounded-full 
            hover:bg-teal-700 transition-all duration-300 
            transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <User className="mr-2" size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;