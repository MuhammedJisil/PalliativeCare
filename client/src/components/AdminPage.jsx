import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-blue-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Volunteer</h2>
          <p className="mb-4">Manage and view registered volunteers.</p>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => navigate('/admin/volunteers')}
          >
            Enter
          </button>
        </div>
        <div className="p-6 bg-green-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Caregiver</h2>
          <p className="mb-4">Manage and view registered caregivers.</p>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded"
            onClick={() => navigate('/admin/caregivers')}
          >
            Enter
          </button>
        </div>
        <div className="p-6 bg-yellow-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Patients in Need</h2>
          <p className="mb-4">View details of patients who need caregivers.</p>
          <button
            className="bg-yellow-500 text-white py-2 px-4 rounded"
            onClick={() => navigate('/admin/patients-in-need')}
          >
            Enter
          </button>
        </div>
        <div className="p-6 bg-red-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Patient Management</h2>
          <p className="mb-4">Manage patient information.</p>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={() => navigate('/admin/patient-management')}
          >
            Enter
          </button>
        </div>
        <div className="p-6 bg-purple-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Donations</h2>
          <p className="mb-4">View and manage donations.</p>
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded"
            onClick={() => navigate('/admin/donations')}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
