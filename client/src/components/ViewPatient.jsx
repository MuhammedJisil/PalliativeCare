import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  UserPlus, 
  Stethoscope, 
  ClipboardList, 
  HeartPulse,
  X
} from 'lucide-react';
import axios from 'axios';

// Modal Component for Detailed View
const DetailModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  
  // State for modals
  const [isHealthStatusModalOpen, setIsHealthStatusModalOpen] = useState(false);
  const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);

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
      {/* Modals */}
      <DetailModal 
        isOpen={isHealthStatusModalOpen}
        onClose={() => setIsHealthStatusModalOpen(false)}
        title="Detailed Health Status"
      >
        <div className="space-y-4">
          <Field label="Disease" value={patient.healthStatus?.[0]?.disease} />
          <Field label="Medication" value={patient.healthStatus?.[0]?.medication} />
          <Field label="Complete Note" value={patient.healthStatus?.[0]?.note} />
          <Field label="Note Date" value={patient.healthStatus?.[0]?.note_date} />
          
          {/* You can add more detailed information here */}
          {patient.healthStatus?.[0]?.additionalDetails && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <p className="text-gray-700">{patient.healthStatus[0].additionalDetails}</p>
            </div>
          )}
        </div>
      </DetailModal>

      <DetailModal 
        isOpen={isMedicalHistoryModalOpen}
        onClose={() => setIsMedicalHistoryModalOpen(false)}
        title="Comprehensive Medical History"
      >
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-900">
            {patient.medicalHistory?.history || 'No detailed medical history available'}
          </p>
          
          {/* Optional: Add more structured medical history details */}
          {patient.medicalHistory?.additionalDetails && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Additional Medical Insights</h3>
              <p className="text-gray-700">{patient.medicalHistory.additionalDetails}</p>
            </div>
          )}
        </div>
      </DetailModal>

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

            <div className="bg-white rounded-lg shadow-sm p-6 w-full">
              <div className="mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900">
                  <HeartPulse className="h-5 w-5 text-teal-600" />
                  Health Status
                </h2>
              </div>
              <div className="flex justify-between items-center">
                <Field label="Current Status" value={patient.healthStatus?.[0]?.disease} />
                <button 
                  onClick={() => setIsHealthStatusModalOpen(true)}
                  className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 transition-colors"
                >
                  View 
                </button>
              </div>
            </div>

            <InfoSection icon={Stethoscope} title="Medical Proxy">
              <Field label="Name" value={patient.medicalProxy?.name} />
              <Field label="Relation" value={patient.medicalProxy?.relation} />
              <Field label="Phone Number" value={patient.medicalProxy?.phone_number} />
            </InfoSection>

            <div className="bg-white rounded-lg shadow-sm p-6 w-full">
              <div className="mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900">
                  <ClipboardList className="h-5 w-5 text-teal-600" />
                  Medical History
                </h2>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-700 truncate max-w-[200px]">
                  {patient.medicalHistory?.history || 'No history'}
                </p>
                <button 
                  onClick={() => setIsMedicalHistoryModalOpen(true)}
                  className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 transition-colors"
                >
                  View 
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;