import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Phone, Home, UserPlus, Stethoscope, ClipboardList, HeartPulse } from 'lucide-react';
import axios from 'axios';

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
        setPatient(response.data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    };

    fetchPatient();
  }, [id]);

  if (!patient) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-teal-600">Loading patient data...</div>
      </div>
    );
  }

  const InfoSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full">
      <div className="mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900">
          <Icon className="h-5 w-5 text-teal-600" />
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div className="mb-2">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <p className="text-gray-900">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/admin/patient-management')}
          className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patient Management
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-teal-100 rounded-full p-3">
              <User className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.first_name}
              </h1>
              <p className="text-gray-500">Patient ID: {id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoSection icon={Calendar} title="Personal Information">
              <Field label="Initial Treatment Date" value={patient.initial_treatment_date} />
              <Field label="Date of Birth" value={patient.dob} />
              <Field label="Age" value={patient.age} />
              <Field label="Gender" value={patient.gender} />
            </InfoSection>

            <InfoSection icon={Phone} title="Contact Details">
              <Field label="Phone Number" value={patient.phone_number} />
              <Field label="Address" value={patient.address} />
            </InfoSection>

            <InfoSection icon={UserPlus} title="Care Team">
              <Field label="Doctor" value={patient.doctor} />
              <Field label="Caregiver" value={patient.caregiver} />
            </InfoSection>

            <InfoSection icon={HeartPulse} title="Health Status">
              <Field label="Disease" value={patient.healthStatus?.[0]?.disease} />
              <Field label="Medication" value={patient.healthStatus?.[0]?.medication} />
              <Field label="Note" value={patient.healthStatus?.[0]?.note} />
              <Field label="Note Date" value={patient.healthStatus?.[0]?.note_date} />
            </InfoSection>

            <InfoSection icon={Stethoscope} title="Medical Proxy">
              <Field label="Name" value={patient.medicalProxy?.name} />
              <Field label="Relation" value={patient.medicalProxy?.relation} />
              <Field label="Phone Number" value={patient.medicalProxy?.phone_number} />
            </InfoSection>

            <InfoSection icon={ClipboardList} title="Medical History">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-900">
                  {patient.medicalHistory?.history || 'No medical history available'}
                </p>
              </div>
            </InfoSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;