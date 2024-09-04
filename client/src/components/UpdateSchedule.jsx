import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateSchedule = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    patient_name: '',
    member_name: '',
    visit_date: '',
    visit_time: '',
    visit_type: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/schedules/${id}`);

        // Convert the visit_date to "yyyy-MM-dd" format
        const fetchedData = response.data;
        const visitDate = new Date(fetchedData.visit_date).toISOString().split('T')[0];

        // Populate the form with the existing data and formatted visit_date
        setFormData({
          ...fetchedData,
          visit_date: visitDate
        });
        setLoading(false); // Data fetched, set loading to false
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchSchedule();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== '')
      );
      await axios.put(`http://localhost:5000/schedules/${id}`, updatedData);
      alert('Schedule updated successfully');
      navigate('/admin/schedules');
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Update Schedule</h2>
      <div className="bg-white shadow-md rounded-md p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="patient_name">Patient Name</label>
            <input
              type="text"
              id="patient_name"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              className="border border-gray-300 p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="member_name">Member Name</label>
            <input
              type="text"
              id="member_name"
              name="member_name"
              value={formData.member_name}
              onChange={handleChange}
              className="border border-gray-300 p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="visit_date">Visit Date</label>
            <input
              type="date"
              id="visit_date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              className="border border-gray-300 p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="visit_time">Visit Time</label>
            <input
              type="time"
              id="visit_time"
              name="visit_time"
              value={formData.visit_time}
              onChange={handleChange}
              className="border border-gray-300 p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="visit_type">Visit Type</label>
            <input
              type="text"
              id="visit_type"
              name="visit_type"
              value={formData.visit_type}
              onChange={handleChange}
              className="border border-gray-300 p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="notes">Notes</label>  
            <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}  // Ensure the value is never null
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded"
            />

          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Update Schedule
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default UpdateSchedule;

