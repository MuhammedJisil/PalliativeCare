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
  MapPin,
  StickyNote,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { HealthStatusModal, MedicalHistoryModal } from './DetailModal';
import BASE_URL from '../config';

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isHealthStatusModalOpen, setIsHealthStatusModalOpen] = useState(false);
  const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/patients/${id}`);
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

  const PlaceField = ({ value }) => {
    if (!value) return <p className="text-gray-900">N/A</p>;

    const [placeName, placeLink] = value.split('|');

    if (placeLink) {
      return (
        <a 
          href={placeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-teal-600 inline-flex items-center gap-1"
        >
          {placeName}
          <ExternalLink className="h-4 w-4" />
        </a>
      );
    }

    return <p className="text-gray-900">{placeName}</p>;
  };

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

  const Field = ({ label, value, isPlace }) => (
    <div className="mb-2">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      {isPlace ? (
        <PlaceField value={value} />
      ) : (
        <p className="text-gray-900">{value || 'N/A'}</p>
      )}
    </div>
  );
 // Update the Location Details section in both renderBasicInfo and renderFullInfo
 const LocationSection = () => (
  <InfoSection icon={MapPin} title="Location Details">
    <Field 
      label="Place: " 
      value={patient.place} 
      isPlace={true}
    />
  </InfoSection>
);

  const renderBasicInfo = () => (
    <>
      <InfoSection icon={Calendar} title="Personal Information">
        <Field label="Support Type" value={patient.support_type} />
        <Field label="Date of Birth" value={patient.dob} />
        <Field label="Age" value={patient.age} />
        <Field label="Gender" value={patient.gender} />
      </InfoSection>

      <InfoSection icon={Phone} title="Contact Details">
        <Field label="Phone Number" value={patient.phone_number} />
        <Field label="Address" value={patient.address} />
      </InfoSection>

      <LocationSection />

      <InfoSection icon={StickyNote} title="Additional Information">
        <Field 
          label="Notes" 
          value={patient.additional_notes || 'No additional notes'} 
        />
      </InfoSection>
    </>
  );

  const renderFullInfo = () => (
    <>
      <InfoSection icon={Calendar} title="Personal Information">
        <Field label="Support Type" value={patient.support_type} />
        <Field label="Initial Treatment Date" value={patient.initial_treatment_date} />
        <Field label="Date of Birth" value={patient.dob} />
        <Field label="Age" value={patient.age} />
        <Field label="Gender" value={patient.gender} />
      </InfoSection>

      <InfoSection icon={Phone} title="Contact Details">
        <Field label="Phone Number" value={patient.phone_number} />
        <Field label="Address" value={patient.address} />
      </InfoSection>

      <LocationSection />

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

    </>
  );

  const renderContent = () => {
    if (patient.support_type === 'medical' || patient.support_type === 'caregiver') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderFullInfo()}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderBasicInfo()}
        </div>
      );
    }
  };


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
  <p className="text-gray-500">Register Number: {patient.register_number}</p>
</div>
          </div>

          {renderContent()}
        </div>
      </div>

      <HealthStatusModal
        isOpen={isHealthStatusModalOpen}
        onClose={() => setIsHealthStatusModalOpen(false)}
        patient={patient}
      />

      <MedicalHistoryModal
        isOpen={isMedicalHistoryModalOpen}
        onClose={() => setIsMedicalHistoryModalOpen(false)}
        patient={patient}
      />
    </div>
  );
};

export default ViewPatient;