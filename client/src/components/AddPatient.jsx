import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPatient = () => {
  const [firstName, setFirstName] = useState('');
  const [initialTreatmentDate, setInitialTreatmentDate] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [doctor, setDoctor] = useState('');
  const [caregiver, setCaregiver] = useState('');
  const [disease, setDisease] = useState('');
  const [medication, setMedication] = useState('');
  const [note, setNote] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [proxyName, setProxyName] = useState('');
  const [relation, setRelation] = useState('');
  const [proxyPhoneNumber, setProxyPhoneNumber] = useState('');
  const [history, setHistory] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/patients', {
        first_name: firstName,
        initial_treatment_date: initialTreatmentDate || null,
        dob: dob || null,
        age: age || null,
        gender: gender || null,
        address: address || null,
        phone_number: phoneNumber || null,
        doctor: doctor || null,
        caregiver: caregiver || null,
        health_status: {
          disease: disease || null,
          medication: medication || null,
          note: note || null,
          note_date: noteDate || null
        },
        medical_proxy: {
          name: proxyName || null,
          relation: relation || null,
          phone_number: proxyPhoneNumber || null
        },
        medical_history: history || null
      });
      navigate('/admin/patient-management');
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <div className="bg-white shadow-md rounded-md p-4 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Add Patient</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Initial Treatment Date</label>
              <input
                type="date"
                value={initialTreatmentDate}
                onChange={(e) => setInitialTreatmentDate(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-1">Gender</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Male"
                  checked={gender === 'Male'}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                /> Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Female"
                  checked={gender === 'Female'}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                /> Female
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Other"
                  checked={gender === 'Other'}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                /> Other
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Doctor</label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Caregiver</label>
              <input
                type="text"
                value={caregiver}
                onChange={(e) => setCaregiver(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <div className="mb-4 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold mb-2">Health Status</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Disease</label>
                <input
                  type="text"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Medication</label>
                <textarea
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                ></textarea>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Note Date</label>
                <input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
          <div className="mb-4 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold mb-2">Medical Proxy</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Name</label>
                <input
                  type="text"
                  value={proxyName}
                  onChange={(e) => setProxyName(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Relation</label>
                <input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={proxyPhoneNumber}
                onChange={(e) => setProxyPhoneNumber(e.target.value)}
                className="w-full p-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <div className="mb-4 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold mb-2">Medical History</h2>
            <textarea
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Add Patient
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;