import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get('/api/volunteers');
        setVolunteers(response.data); // Ensure this is an array of objects
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
    try {
      await axios.delete(`/api/volunteers/${id}`);
      setVolunteers(volunteers.filter(volunteer => volunteer.id !== id));
      alert('Volunteer deleted successfully');
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      alert('Failed to delete volunteer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Volunteers</h2>
      <div className="bg-white shadow-md rounded-md p-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(volunteers) && volunteers.map((volunteer) => (
              <tr key={volunteer.id}>
                <td className="py-2 px-4 border-b">{volunteer.name}</td>
                <td className="py-2 px-4 border-b">
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
      </div>
    </div>
  );
};

export default Volunteers;
