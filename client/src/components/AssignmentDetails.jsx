import { useState } from 'react';
import { Users, Calendar, Phone, MapPin, FileText, Clock, X, HeartPulse, ClipboardList } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-teal-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div className="mb-2">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <p className="text-gray-900">{value || 'N/A'}</p>
  </div>
);

const AssignmentDetails = ({
  selectedAssignment,
  patientData,
  helperData,
  healthStatus,
  medicalHistory,
  onClose,
  onUpdate
}) => {
  // Ensure we have default values for all data and handle the structure from backend
  const safePatientData = patientData || {};
  const safeHelperData = helperData || {};
  
  // Handle health status coming as either array or single object from backend
  const safeHealthStatus = Array.isArray(healthStatus) 
    ? healthStatus 
    : healthStatus 
      ? [healthStatus] 
      : [];
      
  // Handle medical history coming as string or object from backend
  const safeMedicalHistory = typeof medicalHistory === 'string' 
    ? { history: medicalHistory }
    : medicalHistory || { history: 'No medical history available' };

  const safeAssignment = selectedAssignment || {};

  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [editedHealthStatus, setEditedHealthStatus] = useState({
    disease: '',
    medication: '',
    note: ''
  });

  const [isEditingMedicalHistory, setIsEditingMedicalHistory] = useState(false);
  const [newMedicalHistory, setNewMedicalHistory] = useState({ 
    history: safeMedicalHistory.history || '' 
  });

  const [isHealthStatusModalOpen, setIsHealthStatusModalOpen] = useState(false);
  const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);

  // Handle health status update
  const handleUpdateHealthStatus = async (e) => {
    e.preventDefault();
    try {
      if (!safeAssignment.patient_id) {
        console.error('No patient ID available');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/health-status/${safeAssignment.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedHealthStatus,
          note_date: new Date().toISOString()
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        onUpdate && onUpdate(); // Trigger parent refresh if provided
        setIsEditingHealth(false);
        setEditedHealthStatus({ disease: '', medication: '', note: '' });
      }
    } catch (error) {
      console.error('Error updating health status:', error);
    }
  };

  // Handle medical history update
  const handleUpdateMedicalHistory = async (e) => {
    e.preventDefault();
    try {
      if (!safeAssignment.patient_id) {
        console.error('No patient ID available');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/medical-history/${safeAssignment.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicalHistory)
      });

      if (response.ok) {
        onUpdate && onUpdate(); // Trigger parent refresh if provided
        setIsEditingMedicalHistory(false);
        setNewMedicalHistory({ history: '' });
      }
    } catch (error) {
      console.error('Error updating medical history:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      {/* Health Status Modal */}
      <DetailModal 
        isOpen={isHealthStatusModalOpen}
        onClose={() => setIsHealthStatusModalOpen(false)}
        title="Detailed Health Status"
      >
        <div className="space-y-4">
          {safeHealthStatus.length > 0 ? (
            safeHealthStatus.map((status, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <Field label="Disease" value={status?.disease} />
                <Field label="Medication" value={status?.medication} />
                <Field label="Complete Note" value={status?.note} />
                <Field 
                  label="Note Date" 
                  value={status?.note_date ? new Date(status.note_date).toLocaleDateString() : 'N/A'} 
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No health status records available</p>
          )}
        </div>
      </DetailModal>

      {/* Medical History Modal */}
      <DetailModal 
        isOpen={isMedicalHistoryModalOpen}
        onClose={() => setIsMedicalHistoryModalOpen(false)}
        title="Comprehensive Medical History"
      >
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-900">
            {safeMedicalHistory.history || 'No detailed medical history available'}
          </p>
        </div>
      </DetailModal>

      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Assignment Details</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Information Card */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-400" />
                <span>{safePatientData.first_name} {safePatientData.last_name || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <span>Age: {safePatientData.age || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <span>{safePatientData.phone_number || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-1 text-gray-400" />
                <span>{safePatientData.address || 'N/A'}</span>
              </div>
            </div>

            {/* Health Status Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-teal-600" />
                  <h4 className="font-medium">Health Status History</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsHealthStatusModalOpen(true)}
                    className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setIsEditingHealth(true)}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Add New
                  </button>
                </div>
              </div>

              {isEditingHealth && (
                <form onSubmit={handleUpdateHealthStatus} className="space-y-4">
                  <input
                    type="text"
                    value={editedHealthStatus.disease}
                    onChange={(e) => setEditedHealthStatus(prev => ({
                      ...prev,
                      disease: e.target.value
                    }))}
                    placeholder="Disease"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    value={editedHealthStatus.medication}
                    onChange={(e) => setEditedHealthStatus(prev => ({
                      ...prev,
                      medication: e.target.value
                    }))}
                    placeholder="Medication"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <textarea
                    value={editedHealthStatus.note}
                    onChange={(e) => setEditedHealthStatus(prev => ({
                      ...prev,
                      note: e.target.value
                    }))}
                    placeholder="Notes"
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingHealth(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Medical History Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-teal-600" />
                  <h4 className="font-medium">Medical History</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsMedicalHistoryModalOpen(true)}
                    className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setIsEditingMedicalHistory(true)}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Add New
                  </button>
                </div>
              </div>

              {isEditingMedicalHistory && (
                <form onSubmit={handleUpdateMedicalHistory} className="space-y-4">
                  <textarea
                    value={newMedicalHistory.history}
                    onChange={(e) => setNewMedicalHistory({ history: e.target.value })}
                    placeholder="Enter medical history"
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingMedicalHistory(false);
                        setNewMedicalHistory({ history: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Helper Information Card */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {(safeAssignment.helper_type || 'Helper').charAt(0).toUpperCase() + 
               (safeAssignment.helper_type || 'Helper').slice(1)} Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-400" />
                <span>{safeHelperData.name || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                <span>{safeHelperData.email || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <span>{safeHelperData.phone_number || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-1 text-gray-400" />
                <span>{safeHelperData.address || 'N/A'}</span>
              </div>
              {safeHelperData.availability && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{safeHelperData.availability}</span>
                </div>
              )}
              {safeHelperData.specialization && (
                <div className="mt-4">
                  <strong>Specialization:</strong> {safeHelperData.specialization}
                </div>
              )}
              {safeHelperData.experience && (
                <div className="mt-2">
                  <strong>Experience:</strong> {safeHelperData.experience}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;