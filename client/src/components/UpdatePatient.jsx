import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const UpdatePatient = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
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

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
        const data = response.data;
        setPatient(data);
        setFirstName(data.first_name);
        setInitialTreatmentDate(formatDate(data.initial_treatment_date));
        setDob(formatDate(data.dob));
        setAge(data.age || '');
        setGender(data.gender || '');
        setAddress(data.address || '');
        setPhoneNumber(data.phone_number || '');
        setDoctor(data.doctor || '');
        setCaregiver(data.caregiver || '');
        setDisease(data.health_status?.disease || '');
        setMedication(data.health_status?.medication || '');
        setNote(data.health_status?.note || '');
        setNoteDate(formatDate(data.health_status?.note_date));
        setProxyName(data.medical_proxy?.name || '');
        setRelation(data.medical_proxy?.relation || '');
        setProxyPhoneNumber(data.medical_proxy?.phone_number || '');
        setHistory(data.medical_history || '');
      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };
    fetchPatient();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/patients/${id}`, {
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
          note: `${noteDate || new Date().toISOString().split('T')[0]}: ${note}\n${patient.health_status?.note || ''}`,
          note_date: noteDate || new Date().toISOString().split('T')[0],
        },
        medical_proxy: {
          name: proxyName || null,
          relation: relation || null,
          phone_number: proxyPhoneNumber || null,
        },
        medical_history: `${new Date().toISOString().split('T')[0]}: ${history}\n${patient.medical_history || ''}`,
      });
      navigate('/admin/patient-management');
    } catch (error) {
      console.error('Error updating patient details:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <header className="mb-6 flex items-center">
        <Heart className="h-8 w-8 text-teal-600 mr-2" />
        <h2 className="text-2xl font-bold">Update Patient Details</h2>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Initial Treatment Date</label>
          <input
            type="date"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={initialTreatmentDate}
            onChange={(e) => setInitialTreatmentDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Doctor</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Caregiver</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={caregiver}
            onChange={(e) => setCaregiver(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Disease</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Medication</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Note Date</label>
          <input
            type="date"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={noteDate}
            onChange={(e) => setNoteDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Medical Proxy Name</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={proxyName}
            onChange={(e) => setProxyName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Relation</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Medical Proxy Phone Number</label>
          <input
            type="text"
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={proxyPhoneNumber}
            onChange={(e) => setProxyPhoneNumber(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Medical History</label>
          <textarea
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={history}
            onChange={(e) => setHistory(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="mt-4 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium shadow-sm transition-colors">
          Update
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/admin/patient-management" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-medium shadow-sm transition-colors">
          Back to Patient Management
        </Link>
      </div>
    </div>
  );
};

export default UpdatePatient;