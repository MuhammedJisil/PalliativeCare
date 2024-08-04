import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const VolunteerView = () => {
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/volunteers/${id}`);
        setVolunteer(response.data);
      } catch (error) {
        console.error('Error fetching volunteer details:', error);
      }
    };

    fetchVolunteer();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/volunteers');
  };

  if (!volunteer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-md p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-gray-300 pb-2">
          {volunteer.name}
        </h2>
        <div className="space-y-4">
          <p><strong>Email:</strong> {volunteer.email}</p>
          <p><strong>Phone Number:</strong> {volunteer.phone_number}</p>
          <p><strong>Address:</strong> {volunteer.address}</p>
          <p><strong>Availability:</strong> {volunteer.availability}</p>
          <p><strong>Skills:</strong> {volunteer.skills}</p>
          <p><strong>Notes:</strong> {volunteer.notes}</p>
        </div>
        <div className="text-center mt-4">
          <button
            onClick={handleBack}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerView;
