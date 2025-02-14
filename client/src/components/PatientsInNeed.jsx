import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Eye, 
  Trash2, 
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import ScrollToBottomButton from './ScrollToBottomButton';
import ConfirmDialog from './ConfrmDialog';
import BASE_URL from '../config';



// patient in need component

const PatientsInNeed = () => {
  const [patients, setPatients] = useState([]);
  const [activePatients, setActivePatients] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchActivePatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/patients-in-need`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivePatients = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/active-patients`);
      // Ensure all IDs are numbers
      const activeIds = new Set(response.data.map(patient => parseInt(patient.original_id)));
      setActivePatients(activeIds);
    } catch (error) {
      console.error('Error fetching active patients:', error);
    }
  };

  const handleView = async (id) => {
    try {
      // Mark the patient as viewed
      await axios.put(`${BASE_URL}/api/patients-in-need/${id}/view`);
      // Update the local state to remove the NEW tag
      setPatients(patients.map(patient => 
        patient.id === id ? { ...patient, is_new: false } : patient
      ));
      // Navigate to the view page
      navigate(`/admin/patients-in-need/view/${id}`);
    } catch (error) {
      console.error('Error marking patient as viewed:', error);
    }
  };
  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // Only delete from patients_register table
      await axios.delete(`${BASE_URL}/api/patients-register/${deleteId}`);
      setPatients(patients.filter((patient) => patient.id !== deleteId));
      setSuccess('Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient');
    }
    setShowConfirm(false);
  };


  const handleTogglePatient = async (patient) => {
    try {
      // Ensure we have a valid number ID
      const patientId = parseInt(patient.id);
      
      if (isNaN(patientId)) {
        setError('Invalid patient ID');
        return;
      }
  
      // Check if patient is currently active
      const isActive = activePatients.has(patientId);
  
      if (!isActive) {
        // Add to patients table
        const response = await axios.post(`${BASE_URL}/api/patients-to-add`, {
          original_id: patientId,
          first_name: patient.patient_name,
          phone_number: patient.contact_phone_number,
          address: patient.address,
          support_type: patient.support_type,
          // New fields with default values
          place: patient.place || 'Not Specified',
          additional_notes: patient.additional_notes || null
        });
        
        setActivePatients(prev => new Set([...prev, patientId]));
        setSuccess('Patient added to active patients!');
      } else {
        // Remove from patients table
        const response = await axios.delete(`${BASE_URL}/api/patients/remove/${patientId}`);
        
        if (response.status === 200) {
          setActivePatients(prev => {
            const newSet = new Set(prev);
            newSet.delete(patientId);
            return newSet;
          });
          setSuccess('Patient removed from active patients!');
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
      setError(error.response?.data?.message || 'Failed to update patient status');
    }
  };
  

  
  const filteredPatients = patients.filter((patient) =>
    patient.patient_name && patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
                <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                  Patients in Need
                </h1>
              </Link>
            </div>
            <button
              onClick={fetchPatients}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patients in need..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <RefreshCw className="animate-spin text-teal-600" size={24} />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Heart size={48} className="mb-4 text-gray-400" />
              <p>No patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
        <tr key={patient.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
            <div className="flex items-center space-x-2">
              <span>{patient.patient_name}</span>
              {patient.is_new && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-700">
                  NEW
                </span>
              )}
            </div>
          </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Toggle Button - Desktop */}
                          {/* Inside the table row actions */}
  <button
    onClick={() => handleTogglePatient(patient)}
    className={`hidden md:inline-flex items-center px-3 py-1.5 rounded-full transition-colors ${
      activePatients.has(patient.id)
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-50 text-gray-700'
    }`}
  >
    <CheckCircle 
      size={20} 
      className={`mr-1.5 ${
        activePatients.has(patient.id) ? 'fill-white-700' : ''
      }`}
    />
    <span>{activePatients.has(patient.id) ? 'Active' : 'Make Active'}</span>
  </button>

  {/* Mobile version */}
  <button
    onClick={() => handleTogglePatient(patient)}
    className={`md:hidden inline-flex items-center p-1.5 rounded-full transition-colors ${
      activePatients.has(patient.id)
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-50 text-gray-700'
    }`}
  >
    <CheckCircle 
      size={20}
      className={activePatients.has(patient.id) ? 'fill-white-700' : ''}
    />
  </button>

                          {/* View Button - Desktop */}
                          <button
                            onClick={() => handleView(patient.id)}
                            className="hidden md:inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                          >
                            <Eye size={20} className="mr-1.5" />
                            <span>View</span>
                          </button>
                          {/* View Button - Mobile */}
                          <button
                            onClick={() => handleView(patient.id)}
                            className="md:hidden inline-flex items-center p-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                          >
                            <Eye size={20} />
                          </button>

                          {/* Delete Button - Desktop */}
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="hidden md:inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={20} className="mr-1.5" />
                            <span>Delete</span>
                          </button>
                          {/* Delete Button - Mobile */}
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="md:hidden inline-flex items-center p-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alert Content */}
        {(error || success) && (
          <div 
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => {
              setError(null);
              setSuccess(null);
            }}
          >
            <div 
              className="fixed top-4 right-4 z-50"
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

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Patient"
        message="Are you sure you want to delete this patient?"
        onConfirm={confirmDelete} 
        onCancel={() => setShowConfirm(false)}
      />
      <ScrollToBottomButton/>
    </div>
  );
};

export default PatientsInNeed;