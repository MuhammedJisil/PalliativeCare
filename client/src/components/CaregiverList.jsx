import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CaregiverList = () => {
  const [caregivers, setCaregivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/caregivers');
        setCaregivers(response.data);
      } catch (error) {
        console.error('Error fetching caregivers:', error);
      }
    };

    fetchCaregivers();
  }, []);

  const handleView = (id) => {
    navigate(`/admin/caregivers/view/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this caregiver?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/caregivers/${id}`);
        setCaregivers(caregivers.filter(caregiver => caregiver.id !== id));
        alert('Caregiver deleted successfully');
      } catch (error) {
        console.error('Error deleting caregiver:', error);
        alert('Failed to delete caregiver');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Caregivers</h2>
      <div className="bg-white shadow-md rounded-md p-4">
        {caregivers.length === 0 ? (
          <div className="text-center text-gray-500">No caregivers found</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {caregivers.map((caregiver) => (
                <tr key={caregiver.id}>
                  <td className="py-2 px-4 border-b align-middle">{caregiver.name}</td>
                  <td className="py-2 px-4 border-b align-middle">
                    <button
                      onClick={() => handleView(caregiver.id)}
                      className="bg-blue-500 text-white px-4 py-1 rounded-md mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(caregiver.id)}
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
      </div>
      <div className="text-center mt-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CaregiverList;

