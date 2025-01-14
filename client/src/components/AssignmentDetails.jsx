import { useState } from 'react';
import { 
  Users, Calendar, Phone, MapPin, FileText, 
  Clock, X, HeartPulse, ClipboardList, CheckCircle, AlertCircle
} from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-teal-700">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-teal-50 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-teal-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
    <Icon className="w-5 h-5 text-teal-500 mt-1 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-900">{value || 'N/A'}</p>
    </div>
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
  const safePatientData = patientData || {};
  const safeHelperData = helperData || {};
  const safeHealthStatus = Array.isArray(healthStatus) ? healthStatus : healthStatus ? [healthStatus] : [];
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
  const [newMedicalHistory, setNewMedicalHistory] = useState({ history: '' });

  const [isHealthStatusModalOpen, setIsHealthStatusModalOpen] = useState(false);
  const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleUpdateHealthStatus = async (e) => {
    e.preventDefault();
    try {
      if (!safeAssignment.patient_id) {
        setError('Patient ID is missing');
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

      if (!response.ok) {
        throw new Error('Failed to update health status');
      }

      setSuccess('Health status updated successfully');
      onUpdate && onUpdate();
      setIsEditingHealth(false);
      setEditedHealthStatus({ disease: '', medication: '', note: '' });
    } catch (error) {
      console.error('Error updating health status:', error);
      setError(error.message || 'Failed to update health status');
    } finally {
      // Clear alerts after 3 seconds
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
    }
  };

  const handleUpdateMedicalHistory = async (e) => {
    e.preventDefault();
    try {
      if (!safeAssignment.patient_id) {
        setError('Patient ID is missing');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/medical-history/${safeAssignment.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicalHistory)
      });

      if (!response.ok) {
        throw new Error('Failed to update medical history');
      }

      setSuccess('Medical history updated successfully');
      onUpdate && onUpdate();
      setIsEditingMedicalHistory(false);
      setNewMedicalHistory({ history: '' });
    } catch (error) {
      console.error('Error updating medical history:', error);
      setError(error.message || 'Failed to update medical history');
    } finally {
      // Clear alerts after 3 seconds
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Modal 
        isOpen={isHealthStatusModalOpen}
        onClose={() => setIsHealthStatusModalOpen(false)}
        title="Health Status History"
      >
        <div className="space-y-4">
          {safeHealthStatus.length > 0 ? (
            safeHealthStatus.map((status, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg mb-4 last:mb-0">
                <Field icon={HeartPulse} label="Disease" value={status?.disease} />
                <Field icon={FileText} label="Medication" value={status?.medication} />
                <Field icon={ClipboardList} label="Note" value={status?.note} />
                <Field 
                  icon={Calendar}
                  label="Date" 
                  value={status?.note_date ? new Date(status.note_date).toLocaleDateString() : 'N/A'} 
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No health status records available</p>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={isMedicalHistoryModalOpen}
        onClose={() => setIsMedicalHistoryModalOpen(false)}
        title="Medical History"
      >
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-900 leading-relaxed">
            {safeMedicalHistory.history || 'No detailed medical history available'}
          </p>
        </div>
      </Modal>

      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-teal-700">Assignment Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-teal-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-teal-600" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="space-y-6">
            <div className="bg-teal-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-teal-700 mb-4">Patient Information</h3>
              <div className="space-y-2">
                <Field 
                  icon={Users} 
                  label="Name"
                  value={`${safePatientData.first_name || ''} ${safePatientData.last_name || ''}`.trim() || 'N/A'}
                />
                <Field 
                  icon={Calendar} 
                  label="Age"
                  value={safePatientData.age ? `${safePatientData.age} years` : 'N/A'}
                />
                <Field 
                  icon={Phone} 
                  label="Phone"
                  value={safePatientData.phone_number}
                />
                <Field 
                  icon={MapPin} 
                  label="Address"
                  value={safePatientData.address}
                />
              </div>
            </div>

           {/* Health Status Section */}
<div className="bg-white border border-gray-200 rounded-lg p-3">
  <div className="flex justify-between items-center mb-3">
    <div className="flex items-center gap-2">
      <HeartPulse className="w-4 h-4 text-teal-600" />
      <h4 className="font-medium text-sm text-teal-700">Health Status</h4>
    </div>
    <div className="flex gap-1">
      <button
        onClick={() => setIsHealthStatusModalOpen(true)}
        className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
      >
        View
      </button>
      <button
        onClick={() => setIsEditingHealth(true)}
        className="px-2 py-1 text-xs border border-teal-600 text-teal-600 rounded hover:bg-teal-50"
      >
        Add
      </button>
    </div>
  </div>

  {isEditingHealth && (
    <form onSubmit={handleUpdateHealthStatus} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={editedHealthStatus.disease}
          onChange={(e) => setEditedHealthStatus(prev => ({
            ...prev,
            disease: e.target.value
          }))}
          placeholder="Disease"
          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500"
          
        />
        <input
          type="text"
          value={editedHealthStatus.medication}
          onChange={(e) => setEditedHealthStatus(prev => ({
            ...prev,
            medication: e.target.value
          }))}
          placeholder="Medication"
          className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500"
          
        />
      </div>
      <textarea
        value={editedHealthStatus.note}
        onChange={(e) => setEditedHealthStatus(prev => ({
          ...prev,
          note: e.target.value
        }))}
        placeholder="Notes"
        className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 resize-vertical"
        rows={3}
      />
      <div className="flex gap-1">
        <button
          type="submit"
          className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsEditingHealth(false)}
          className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</div>


            {/* Medical History Section */}
<div className="bg-white border border-gray-200 rounded-lg p-3">
  <div className="flex justify-between items-center mb-3">
    <div className="flex items-center gap-2">
      <ClipboardList className="w-4 h-4 text-teal-600" />
      <h4 className="font-medium text-sm text-teal-700">Medical History</h4>
    </div>
    <div className="flex gap-1">
      <button
        onClick={() => setIsMedicalHistoryModalOpen(true)}
        className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
      >
        View
      </button>
      <button
        onClick={() => setIsEditingMedicalHistory(true)}
        className="px-2 py-1 text-xs border border-teal-600 text-teal-600 rounded hover:bg-teal-50"
      >
        Add
      </button>
    </div>
  </div>

  {isEditingMedicalHistory && (
    <form onSubmit={handleUpdateMedicalHistory} className="space-y-2">
      <textarea
        value={newMedicalHistory.history}
        onChange={(e) => setNewMedicalHistory({ history: e.target.value })}
        placeholder="Enter new medical history"
        className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 resize-vertical"
        rows={4}
        required
      />
      <div className="flex gap-1">
        <button
          type="submit"
          className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditingMedicalHistory(false);
            setNewMedicalHistory({ history: '' });
          }}
          className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</div>
          </div>

          {/* Helper Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-teal-700 mb-6">
              {(safeAssignment.helper_type || 'Helper').charAt(0).toUpperCase() + 
               (safeAssignment.helper_type || 'Helper').slice(1)} Information
            </h3>
            <div className="space-y-4">
              <Field 
                icon={Users} 
                label="Name"
                value={safeHelperData.name}
              />
              <Field 
                icon={FileText} 
                label="Email"
                value={safeHelperData.email}
              />
              <Field 
                icon={Phone} 
                label="Phone"
                value={safeHelperData.phone_number}
              />
              <Field 
                icon={MapPin} 
                label="Address"
                value={safeHelperData.address}
              />
              {safeHelperData.availability && (
                <Field 
                  icon={Clock} 
                  label="Availability"
                  value={safeHelperData.availability}
                />)}
                {safeHelperData.specialization && (
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-teal-500" />
                      <h4 className="font-medium text-teal-700">Specialization</h4>
                    </div>
                    <p className="text-gray-700 ml-7">{safeHelperData.specialization}</p>
                  </div>
                )}
                {safeHelperData.experience && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <h4 className="font-medium text-teal-700">Experience</h4>
                    </div>
                    <p className="text-gray-700 ml-7">{safeHelperData.experience}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alert Overlay */}
      {(error || success) && (
        <div 
          className="fixed inset-0 z-[60] bg-black/10"
          onClick={() => {
            setError(null);
            setSuccess(null);
          }}
        >
          <div 
            className="fixed top-4 right-4 z-[70]"
            onClick={(e) => e.stopPropagation()}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium">{success}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    );
  };
  
  export default AssignmentDetails;