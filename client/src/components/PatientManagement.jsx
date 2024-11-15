import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleView = (id) => {
    navigate(`/admin/patients/view/${id}`);
  };

  const handleUpdate = (id) => {
    navigate(`/admin/patients/update/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/patients/${id}`);
        if (response.status === 200) {
          fetchPatients(); // Refresh the patient list after successful deletion
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient');
      }
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) =>
    patient.first_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-4 border rounded-md"
          />
          <Link to="/admin/patients/add" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Add
          </Link>
        </div>
      </header>
      <div className="bg-white shadow-md rounded-md p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Patient Name</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="py-2 px-4 border-b">{patient.first_name}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleView(patient.id)}
                        className="bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdate(patient.id)}
                        className="bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-2 px-4 text-center">No patients available</td>
              </tr>
            )}
          </tbody>
        </table>
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

export default PatientManagement;
