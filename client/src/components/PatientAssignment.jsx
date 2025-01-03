import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientAssignment = () => {
  const [patients, setPatients] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedHelper, setSelectedHelper] = useState('');
  const [helperType, setHelperType] = useState('volunteer');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, volunteersRes, caregiversRes, assignmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/patients'),
        axios.get('http://localhost:5000/api/volunteers'),
        axios.get('http://localhost:5000/api/caregivers'),
        axios.get('http://localhost:5000/api/assignments')
      ]);

      setPatients(patientsRes.data);
      setVolunteers(volunteersRes.data);
      setCaregivers(caregiversRes.data);
      setAssignments(assignmentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/assignments', {
        patientId: selectedPatient,
        helperId: selectedHelper,
        helperType: helperType
      });
      
      fetchData(); // Refresh data
      setSelectedPatient('');
      setSelectedHelper('');
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Patient Assignment</h1>
      
      {/* Assignment Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleAssignment} className="space-y-4">
          <div>
            <label className="block mb-2">Select Patient</label>
            <select 
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Helper Type</label>
            <select
              value={helperType}
              onChange={(e) => setHelperType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="volunteer">Volunteer</option>
              <option value="caregiver">Caregiver</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Select {helperType === 'volunteer' ? 'Volunteer' : 'Caregiver'}</label>
            <select
              value={selectedHelper}
              onChange={(e) => setSelectedHelper(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a {helperType}</option>
              {(helperType === 'volunteer' ? volunteers : caregivers).map(helper => (
                <option key={helper._id} value={helper._id}>
                  {helper.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Assign Patient
          </button>
        </form>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Helper Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <tr key={assignment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assignment.patient.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {assignment.helperType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {assignment.helper.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleRemoveAssignment(assignment._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
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

export default PatientAssignment;