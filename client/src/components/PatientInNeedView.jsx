import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PatientInNeedView = () => {
  const [patient, setPatient] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        console.log(`Fetching data for ID: ${id}`); // Log the ID
        const response = await axios.get(`http://localhost:5000/api/patients-in-need/${id}`);
        console.log('Patient data:', response.data); // Log the response data
        setPatient(response.data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };
  
    fetchPatient();
  }, [id]);

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-md p-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-gray-300 pb-2">
          {patient.patient_name}
        </h2>
        <div className="space-y-4">
          <p><strong>Contact Name:</strong> {patient.contact_name}</p>
          <p><strong>Contact Email:</strong> {patient.contact_email}</p>
          <p><strong>Contact Phone Number:</strong> {patient.contact_phone_number}</p>
          <p><strong>Place:</strong> {patient.place}</p>
          <p><strong>Address:</strong> {patient.address}</p>
          <p><strong>Health Condition:</strong> {patient.health_condition}</p>
          <p><strong>Care Details:</strong> {patient.care_details}</p>
          <p><strong>Notes:</strong> {patient.notes}</p>
        </div>
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/admin/patients-in-need')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInNeedView;
