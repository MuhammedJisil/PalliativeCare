import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schedules'); // Updated URL
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
        await axios.delete(`http://localhost:5000/api/schedules/${id}`); // Updated URL
        setSchedules(schedules.filter(schedule => schedule.id !== id));
        alert('Schedule deleted successfully');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Failed to delete schedule');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Schedule List</h2>
      <div className="text-center mb-4">
        <button
          onClick={() => navigate('/admin/schedules/add')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Add New Schedule
        </button>
      </div>
      <div className="bg-white shadow-md rounded-md p-4">
        {schedules.length === 0 ? (
          <div className="text-center text-gray-500">No schedules found</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Patient Name</th>
                <th className="py-2 px-4 border-b text-left">Member Name</th>
                <th className="py-2 px-4 border-b text-left">Visit Date</th>
                <th className="py-2 px-4 border-b text-left">Visit Time</th>
                <th className="py-2 px-4 border-b text-left">Visit Type</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="py-2 px-4 border-b align-middle">{schedule.patient_name}</td>
                  <td className="py-2 px-4 border-b align-middle">{schedule.member_name}</td>
                  <td className="py-2 px-4 border-b align-middle">{schedule.visit_date}</td>
                  <td className="py-2 px-4 border-b align-middle">{schedule.visit_time}</td>
                  <td className="py-2 px-4 border-b align-middle">{schedule.visit_type}</td>
                  <td className="py-2 px-4 border-b align-middle">
                    <button
                      onClick={() => handleUpdate(schedule.id)}
                      className="bg-yellow-500 text-white px-4 py-1 rounded-md mr-2"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
         <div className="text-center mt-4">
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;
