import { useState, useEffect } from 'react';
import { Users, Calendar, Phone, MapPin, FileText, Clock, X, HeartPulse, ClipboardList } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, children }) => {
   useEffect(() => {
     const style = document.createElement('style');
     style.textContent = `
       .detail-modal-scrollbar::-webkit-scrollbar {
         width: 8px;
       }
       .detail-modal-scrollbar::-webkit-scrollbar-track {
         background: rgba(13, 148, 136, 0.1);
         border-radius: 10px;
       }
       .detail-modal-scrollbar::-webkit-scrollbar-thumb {
         background: linear-gradient(135deg, #0d9488, #0f766e);
         border-radius: 10px;
         transition: all 0.3s ease;
       }
       .detail-modal-scrollbar::-webkit-scrollbar-thumb:hover {
         background: linear-gradient(135deg, #0f766e, #0d9488);
       }
     `;
     document.head.appendChild(style);
 
     return () => {
       document.head.removeChild(style);
     };
   }, []);
 
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
        <div className="p-6 overflow-y-auto detail-modal-scrollbar flex-1">
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
  onClose
}) => {
  // State for health status editing
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [editedHealthStatus, setEditedHealthStatus] = useState({
    disease: '',
    medication: '',
    note: ''
  });

  // State for medical history editing
  const [isEditingMedicalHistory, setIsEditingMedicalHistory] = useState(false);
  const [newMedicalHistory, setNewMedicalHistory] = useState({ history: '' });

  // State for modals
  const [isHealthStatusModalOpen, setIsHealthStatusModalOpen] = useState(false);
  const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);

  // Handle health status update
  const handleUpdateHealthStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/health-status/${selectedAssignment.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedHealthStatus,
          note_date: new Date().toISOString()
        })
      });

      if (response.ok) {
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
      const response = await fetch(`http://localhost:5000/api/medical-history/${selectedAssignment.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicalHistory)
      });

      if (response.ok) {
        setIsEditingMedicalHistory(false);
        setNewMedicalHistory({ history: '' });
      }
    } catch (error) {
      console.error('Error updating medical history:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      {/* Modals */}
      <DetailModal 
  isOpen={isHealthStatusModalOpen}
  onClose={() => setIsHealthStatusModalOpen(false)}
  title="Detailed Health Status"
>
  <div className="space-y-4">
    {Array.isArray(healthStatus) && healthStatus.length > 0 ? (
      healthStatus.map((status, index) => (
        <div key={index} className="border-b pb-4 last:border-0">
          <Field label="Disease" value={status.disease} />
          <Field label="Medication" value={status.medication} />
          <Field label="Complete Note" value={status.note} />
          <Field label="Note Date" value={status.note_date ? new Date(status.note_date).toLocaleDateString() : 'N/A'} />
          {status.additionalDetails && (
            <div className="mt-4">
              <Field label="Additional Details" value={status.additionalDetails} />
            </div>
          )}
        </div>
      ))
    ) : (
      <p className="text-gray-500">No health status records available</p>
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
            {medicalHistory?.history || 'No detailed medical history available'}
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
                <span>{patientData.first_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                <span>Age: {patientData.age}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <span>{patientData.phone_number}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-1 text-gray-400" />
                <span>{patientData.address}</span>
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

              {isEditingHealth ? (
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
              ) : (
                <div className="space-y-4">
                  {Array.isArray(healthStatus) && healthStatus.length > 0 ? (
                    <div className="bg-white p-4 rounded border">
                      <div className="space-y-2">
                        <p><strong>Latest Status</strong></p>
                        <p><strong>Disease:</strong> {healthStatus[0].disease}</p>
                        <p><strong>Medication:</strong> {healthStatus[0].medication}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No health status records available</p>
                  )}
                </div>
              )}
            </div>

            {/* Medical History Section*/}
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

              {isEditingMedicalHistory ? (
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
              ) : (
                <div className="space-y-4">
                  {medicalHistory?.history ? (
                    <div className="bg-white p-4 rounded border">
                      <p className="whitespace-pre-wrap">
                        {medicalHistory.history.length > 100 
                          ? `${medicalHistory.history.substring(0, 100)}...` 
                          : medicalHistory.history}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No medical history available</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Helper Information Card */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {selectedAssignment.helper_type.charAt(0).toUpperCase() + 
               selectedAssignment.helper_type.slice(1)} Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-gray-400" />
                <span>{helperData.name}</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                <span>{helperData.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-400" />
                <span>{helperData.phone_number}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-1 text-gray-400" />
                <span>{helperData.address}</span>
              </div>
              {helperData.availability && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{helperData.availability}</span>
                </div>
              )}
              {helperData.specialization && (
                <div className="mt-4">
                  <strong>Specialization:</strong> {helperData.specialization}
                </div>
              )}
              {helperData.experience && (
                <div className="mt-2">
                  <strong>Experience:</strong> {helperData.experience}
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