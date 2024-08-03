import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${id}`); // Ensure this matches your backend port
        setPatient(response.data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    };

    fetchPatient();
  }, [id]);

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white shadow-md rounded-md p-4 w-full max-w-4xl">
      <h1 className="text-2xl font-bold underline text-center mb-12">{patient.first_name}</h1>


        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>Initial Treatment Date:</strong> {patient.initial_treatment_date}</p>
            <p><strong>Date of Birth:</strong> {patient.dob}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Phone Number:</strong> {patient.phone_number}</p>
          </div>
          <div>
            <p><strong>Address:</strong> {patient.address}</p>
            <p><strong>Doctor:</strong> {patient.doctor}</p>
            <p><strong>Caregiver:</strong> {patient.caregiver}</p>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Health Status</h2>
          <p><strong>Disease:</strong> {patient.healthStatus?.[0]?.disease || 'N/A'}</p>
          <div><strong>Medication:</strong> <pre className="whitespace-pre-wrap break-all">{patient.healthStatus?.[0]?.medication || 'N/A'}</pre></div>
          <div><strong>Note:</strong> <pre className="whitespace-pre-wrap break-all">{patient.healthStatus?.[0]?.note || 'N/A'}</pre></div>
          <p><strong>Note Date:</strong> {patient.healthStatus?.[0]?.note_date || 'N/A'}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Medical Proxy</h2>
          <p><strong>Name:</strong> {patient.medicalProxy?.name || 'N/A'}</p>
          <p><strong>Relation:</strong> {patient.medicalProxy?.relation || 'N/A'}</p>
          <p><strong>Phone Number:</strong> {patient.medicalProxy?.phone_number || 'N/A'}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Medical History</h2>
          <div><pre className="whitespace-pre-wrap break-all">{patient.medicalHistory?.history || 'N/A'}</pre></div>
        </div>
        <button
          onClick={() => navigate('/admin/patient-management')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ViewPatient;