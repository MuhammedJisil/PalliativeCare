import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronDown, 
  ChevronUp, 
  UserPlus, 
  Trash2, 
  Users, 
  Eye, 
  User, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Shield,
  Activity
} from 'lucide-react';
import ConfirmDialog from './ConfrmDialog';
import { useNavigate, Link } from 'react-router-dom';
import ScrollToBottomButton from './ScrollToBottomButton';
import BASE_URL from '../config';

const PatientAssignment = () => {
  // ... (keep existing state variables)
  const [patients, setPatients] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [medicalProfessionals, setMedicalProfessionals] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedHelper, setSelectedHelper] = useState('');
  const [helperType, setHelperType] = useState('volunteer');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showHelperDetails, setShowHelperDetails] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [selectedHelperDetails, setSelectedHelperDetails] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const isValidHelperType = (patientSupportType, helperType) => {
    switch (helperType) {
      case 'volunteer':
        return ['volunteer', 'other'].includes(patientSupportType);
      case 'caregiver':
      case 'medical_professional':
        return ['caregiver', 'medical'].includes(patientSupportType);
      default:
        return false;
    }
  };
  useEffect(() => {
    if (selectedPatientDetails && helperType) {
      const isValid = isValidHelperType(selectedPatientDetails.support_type, helperType);
      if (!isValid) {
        setError(`${helperType.replace('_', ' ')} cannot be assigned to a patient with ${selectedPatientDetails.support_type} support type`);
        setSelectedHelper('');
        setShowHelperDetails(false);
      } else {
        setError(null);
      }
    }
  }, [selectedPatientDetails, helperType]);

  


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, volunteersRes, caregiversRes, medicalProfessionalsRes, assignmentsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/patients`),
        axios.get(`${BASE_URL}/api/volunteers`),
        axios.get(`${BASE_URL}/api/caregivers`),
        axios.get(`${BASE_URL}/api/medical-professionals`),
        axios.get(`${BASE_URL}/api/assignments`)
      ]);

      setPatients(patientsRes.data);
      setVolunteers(volunteersRes.data);
      setCaregivers(caregiversRes.data);
      setMedicalProfessionals(medicalProfessionalsRes.data);
      setAssignments(assignmentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === parseInt(patientId));
    setSelectedPatient(patientId);
    setSelectedPatientDetails(patient);
    setShowPatientDetails(true);

    // Reset helper selection when patient changes
    setSelectedHelper('');
    setSelectedHelperDetails(null);
    setShowHelperDetails(false);

    // Validate current helper type against new patient's support type
    if (helperType && !isValidHelperType(patient.support_type, helperType)) {
      setError(`Current helper type (${helperType.replace('_', ' ')}) cannot be assigned to a patient with ${patient.support_type} support type`);
    } else {
      setError(null);
    }
  };


  const handleHelperSelect = (helperId) => {
    setSelectedHelper(helperId);
    const helperList = getHelperList();
    const helper = helperList.find(h => h.id === parseInt(helperId));
    setSelectedHelperDetails(helper);
    setShowHelperDetails(true);
  };

  const getHelperList = () => {
    switch (helperType) {
      case 'volunteer':
        return volunteers;
      case 'caregiver':
        return caregivers;
      case 'medical_professional':
        return medicalProfessionals;
      default:
        return [];
    }
  };

  const getHelperDetails = (assignment) => {
    // First, check if helper is directly available in the assignment
    if (assignment.helper) {
      return assignment.helper;
    }
  
    let helperList;
    switch (assignment.helperType) {
      case 'volunteer':
        helperList = volunteers;
        break;
      case 'caregiver':
        helperList = caregivers;
        break;
      case 'medical_professional':
        helperList = medicalProfessionals;
        break;
      default:
        return null;
    }
  
    return helperList.find(
      h => h.id === assignment.helperId || 
           h._id === assignment.helperId || 
           h.id === parseInt(assignment.helperId)
    );
  };

  const handleHelperTypeChange = (e) => {
    const newHelperType = e.target.value;
    
    if (selectedPatientDetails) {
      const isValid = isValidHelperType(selectedPatientDetails.support_type, newHelperType);
      if (!isValid) {
        setError(`${newHelperType.replace('_', ' ')} cannot be assigned to a patient with ${selectedPatientDetails.support_type} support type`);
        return;
      }
    }
    
    setHelperType(newHelperType);
    setSelectedHelper('');
    setShowHelperDetails(false);
    setError(null);
  };

  const handleAssignment = async (e) => {
    e.preventDefault();
    
    if (!selectedPatientDetails) {
      setError('Please select a patient');
      return;
    }

    if (!isValidHelperType(selectedPatientDetails.support_type, helperType)) {
      setError(`${helperType.replace('_', ' ')} cannot be assigned to a patient with ${selectedPatientDetails.support_type} support type`);
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/assignments`, {
        patientId: selectedPatient,
        helperId: selectedHelper,
        helperType: helperType
      });
      
      setSuccess('Assignment created successfully!');
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError(error.response?.data?.error || 'Failed to create assignment');
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedHelper('');
    setShowPatientDetails(false);
    setShowHelperDetails(false);
    setShowAssignForm(false);
    setSelectedPatientDetails(null);
    setSelectedHelperDetails(null);
  };

  const handleRemoveAssignment = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/assignments/${deleteId}`);
      setAssignments(assignments.filter((assignment) => assignment._id !== deleteId));
      setSuccess('Assignment deleted successfully!');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Failed to delete assignment');
    }
    setShowConfirm(false);
  };

  const toggleAssignmentDetails = (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(assignmentId);
    }
  };

  const renderPatientDetails = () => {
    if (!selectedPatientDetails) return null;
    
    return (
      <div className="mt-4 bg-white rounded-lg shadow-lg border border-teal-100">
        <div className="p-4 border-b border-teal-100 bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            Patient Details
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedPatientDetails.first_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{selectedPatientDetails.age}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Support Type</p>
                  <p className="font-medium capitalize">{selectedPatientDetails.support_type}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedPatientDetails.phone_number}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedPatientDetails.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Treatment Date</p>
                  <p className="font-medium">{selectedPatientDetails.initial_treatment_date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHelperDetails = () => {
    if (!selectedHelperDetails) return null;

    return (
      <div className="mt-4 bg-white rounded-lg shadow-lg border border-teal-100">
        <div className="p-4 border-b border-teal-100 bg-teal-50">
          <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            {helperType.replace('_', ' ').charAt(0).toUpperCase() + helperType.slice(1)} Details
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedHelperDetails.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedHelperDetails.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedHelperDetails.phone_number}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="font-medium">{selectedHelperDetails.availability}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderAssignmentDetails = (assignment) => {
    const helper = getHelperDetails(assignment);
    
    return (
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <div className="bg-white rounded-lg shadow-sm border border-teal-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Patient Details Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Patient Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{assignment.patient.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Support Type</p>
                    <p className="font-medium capitalize">{assignment.patient.support_type || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Assignment Date</p>
                    <p className="font-medium">
                      {new Date(assignment.assigned_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Helper Details Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                Helper Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Helper Type</p>
                    <p className="font-medium capitalize">{assignment.helperType.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{helper?.name || 'Not available'}</p>
                  </div>
                </div>
  
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{helper?.phone_number || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAssignmentForm = () => (
    <div className="bg-white rounded-lg shadow-lg border border-teal-100">
      <div className="p-4 flex items-center justify-between border-b border-teal-100 bg-teal-50">
        <h2 className="text-xl font-semibold text-teal-800 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-teal-600" />
          Assign Patient
        </h2>
        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="text-teal-600 hover:text-teal-700 transition-colors"
          aria-label={showAssignForm ? 'Hide assignment form' : 'Show assignment form'}
        >
          {showAssignForm ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
      </div>
      
      {showAssignForm && (
        <div className="p-6">
          <form onSubmit={handleAssignment} className="space-y-6">
            {/* Patient Selection Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Patient <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedPatient}
                      onChange={(e) => handlePatientSelect(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                      required
                    >
                      <option value="">Choose a patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.first_name} - Support Type: {patient.support_type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
  
                {/* Helper Type Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Helper Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={helperType}
                      onChange={handleHelperTypeChange}
                      className={`w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white
                        ${!selectedPatientDetails ? 'cursor-not-allowed bg-gray-50' : ''}
                        ${error ? 'border-red-300' : 'border-gray-300'}`}
                      disabled={!selectedPatientDetails}
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="caregiver">Caregiver</option>
                      <option value="medical_professional">Medical Professional</option>
                    </select>
                  </div>
                  {error && error.includes('helper type') && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  )}
                </div>
              </div>
  
              {/* Helper Selection */}
              {selectedPatientDetails && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select {helperType.replace('_', ' ')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedHelper}
                      onChange={(e) => handleHelperSelect(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                      required
                      disabled={!!error}
                    >
                      <option value="">Select a {helperType.replace('_', ' ')}</option>
                      {getHelperList().map(helper => (
                        <option key={helper.id} value={helper.id}>
                          {helper.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
  
            {/* Display Details Sections */}
            {showPatientDetails && renderPatientDetails()}
            {showHelperDetails && renderHelperDetails()}
  
            {/* Validation Messages */}
            {error && !error.includes('helper type') && (
              <div className="rounded-lg bg-red-50 p-4 text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
  
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedPatient || !selectedHelper || !!error}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200
                  ${(!selectedPatient || !selectedHelper || !!error)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 active:transform active:scale-95'
                  }`}
              >
                <UserPlus className="w-5 h-5" />
                Assign Patient
              </button>
            </div>
  
            {/* Helper Text */}
            {selectedPatientDetails && (
              <p className="text-sm text-gray-600 mt-4">
                Note: {helperType.replace('_', ' ')}s can only be assigned to patients with matching support types. 
                {helperType === 'volunteer' 
                  ? ' Volunteers can be assigned to patients with volunteer or other support types.'
                  : ' Caregivers and medical professionals can be assigned to patients with caregiver or medical support types.'}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );


  const filteredAssignments = assignments.filter((assignment) =>
    assignment.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin h-12 w-12 text-teal-600" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-teal-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
                <h1 className="text-xl font-semibold tracking-tight">
                  Patient Assignment
                </h1>
             </Link>
            </div>
            
            <div className="flex items-center space-x-4">


              {/* Assign Patient Button for large screens */}
              <div className="hidden sm:block">
                <button 
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                >
                  <UserPlus size={16} className="mr-2" />
                  {showAssignForm ? 'Hide Form' : 'Assign Patient'}
                </button>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Assignment Form */}
        {renderAssignmentForm()}

       {/* Assignments List */}
       <div className="bg-white rounded-lg shadow-lg border border-teal-100">
  <div className="p-4 border-b border-teal-100 bg-teal-50">
    <h2 className="text-xl font-semibold text-teal-800 flex items-center gap-2">
      <Users className="w-6 h-6 text-teal-600" />
      Current Assignments
    </h2>
  </div>
  
  {filteredAssignments.length === 0 ? (
    <div className="flex flex-col items-center justify-center p-12">
      <Users size={48} className="text-gray-400 mb-4" />
      <p className="text-gray-500 text-lg">No assignments found</p>
    </div>
  ) : (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssignments.map((assignment) => (
              <React.Fragment key={assignment._id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="font-medium text-gray-900">{assignment.patient.name}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {assignment.patient.support_type || 'Support type not specified'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => toggleAssignmentDetails(assignment._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                      >
                        {expandedAssignment === assignment._id ? (
                          <ChevronUp size={16} className="mr-1.5" />
                        ) : (
                          <Eye size={16} className="mr-1.5" />
                        )}
                        <span className="hidden md:inline">
                          {expandedAssignment === assignment._id ? 'Hide' : 'Details'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleRemoveAssignment(assignment._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} className="mr-1.5" />
                        <span className="hidden md:inline">Remove</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedAssignment === assignment._id && (
                  <tr>
                    <td colSpan="2">
                      {renderAssignmentDetails(assignment)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</div>

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

     {/* Alert Messages */}
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
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <p className="font-medium">{success}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment?"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Mobile Assign Button */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="flex items-center p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 shadow-lg"
        >
          <UserPlus size={24} />
        </button>
      </div>

      <ScrollToBottomButton />
    </div>
  );
};

export default PatientAssignment;