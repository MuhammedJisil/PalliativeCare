import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CaregiverView = () => {
  const [caregiver, setCaregiver] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaregiver = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/caregivers/${id}`);
        setCaregiver(response.data);
      } catch (error) {
        console.error('Error fetching caregiver:', error);
      }
    };

    fetchCaregiver();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      {caregiver && (
        <div className="bg-white shadow-md rounded-md p-6 max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-gray-300 pb-2">
            {caregiver.name}
          </h2>
          <div className="space-y-4">
            <p><strong>Email:</strong> {caregiver.email}</p>
            <p><strong>Phone Number:</strong> {caregiver.phone_number}</p>
            <p><strong>Address:</strong> {caregiver.address}</p>
            <p><strong>Availability:</strong> {caregiver.availability}</p>
            <p><strong>Experience:</strong> {caregiver.experience}</p>
            <p><strong>Certifications:</strong> {caregiver.certifications}</p>
            <p><strong>Notes:</strong> {caregiver.notes}</p>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/admin/caregivers')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverView;


