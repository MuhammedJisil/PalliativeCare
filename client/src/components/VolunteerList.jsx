import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/volunteers');
        setVolunteers(response.data);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      }
    };

    fetchVolunteers();
  }, []);

  const handleView = (id) => {
    navigate(`/admin/volunteers/view/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this volunteer?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/volunteers/${id}`);
        setVolunteers(volunteers.filter(volunteer => volunteer.id !== id));
        alert('Volunteer deleted successfully');
      } catch (error) {
        console.error('Error deleting volunteer:', error);
        alert('Failed to delete volunteer');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Volunteers</h2>
      <div className="bg-white shadow-md rounded-md p-4">
        {volunteers.length === 0 ? (
          <div className="text-center text-gray-500">No volunteers found</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((volunteer) => (
                <tr key={volunteer.id}>
                  <td className="py-2 px-4 border-b align-middle">{volunteer.name}</td>
                  <td className="py-2 px-4 border-b align-middle">
                    <button
                      onClick={() => handleView(volunteer.id)}
                      className="bg-blue-500 text-white px-4 py-1 rounded-md mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(volunteer.id)}
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

export default VolunteerList;
