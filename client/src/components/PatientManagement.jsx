import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
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
  

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <Link to="/admin/patients/add" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Add
        </Link>
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
            {patients.length > 0 ? (
              patients.map(patient => (
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
    </div>
  );
};

export default PatientManagement;

