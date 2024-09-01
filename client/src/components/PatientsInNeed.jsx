import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientsInNeed = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients-in-need');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleView = (id) => {
    navigate(`/admin/patients-in-need/view/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this patient?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/patients-in-need/${id}`);
        setPatients(patients.filter((patient) => patient.id !== id));
        alert('Patient deleted successfully');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient');
      }
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Patients in Need</h2>
      <input
        type="text"
        placeholder="Search by patient name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <div className="bg-white shadow-md rounded-md p-4">
        {filteredPatients.length === 0 ? (
          <div className="text-center text-gray-500">No patients found</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="py-2 px-4 border-b text-left">{patient.patient_name}</td>
                  <td className="py-2 px-4 border-b text-left">
                    <button
                      onClick={() => handleView(patient.id)}
                      className="bg-blue-500 text-white px-4 py-1 rounded-md mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
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

export default PatientsInNeed;
