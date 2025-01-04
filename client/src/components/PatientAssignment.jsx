import React, { useState, useEffect, } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, UserPlus, Trash2, Users, Eye, User, CheckCircle, AlertCircle, RefreshCw, ArrowLeft} from 'lucide-react';
import ConfirmDialog from './ConfrmDialog';
import {useNavigate,  Link } from 'react-router-dom';
import ScrollToBottomButton from './ScrollToBottomButton';

const PatientAssignment = () => {
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


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, volunteersRes, caregiversRes, medicalProfessionalsRes, assignmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/patients'),
        axios.get('http://localhost:5000/api/volunteers'),
        axios.get('http://localhost:5000/api/caregivers'),
        axios.get('http://localhost:5000/api/medical-professionals'),
        axios.get('http://localhost:5000/api/assignments')
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
    setSelectedPatient(patientId);
    const patient = patients.find(p => p.id === parseInt(patientId));
    setSelectedPatientDetails(patient);
    setShowPatientDetails(true);
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
    // First, let's log the data to see what we're working with
    console.log('Assignment:', assignment);
    console.log('Helper Type:', assignment.helperType);
    console.log('Helper ID:', assignment.helperId);
    
    let helper;
    switch (assignment.helperType) {
      case 'volunteer':
        console.log('Volunteers:', volunteers);
        helper = volunteers.find(v => v.id === assignment.helperId || v._id === assignment.helperId);
        break;
      case 'caregiver':
        console.log('Caregivers:', caregivers);
        helper = caregivers.find(c => c.id === assignment.helperId || c._id === assignment.helperId);
        break;
      case 'medical_professional':
        console.log('Medical Professionals:', medicalProfessionals);
        helper = medicalProfessionals.find(m => m.id === assignment.helperId || m._id === assignment.helperId);
        break;
      default:
        helper = null;
    }
    
    console.log('Found Helper:', helper);
    return helper;
  };

  const handleAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/assignments', {
        patientId: selectedPatient,
        helperId: selectedHelper,
        helperType: helperType
      });
      
      setSuccess('Assignment created successfully!');
      fetchData();
      setSelectedPatient('');
      setSelectedHelper('');
      setShowPatientDetails(false);
      setShowHelperDetails(false);
      setShowAssignForm(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
  
      if (error.response && error.response.status === 400) {
        // Handle duplicate assignment error
        setError('Assignment already exists for this patient and helper type');
      } else {
        setError('Failed to create assignment');
      }
    }
  };

  const handleRemoveAssignment = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/assignments/${deleteId}`);
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
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          Patient Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2">Name: {selectedPatientDetails.first_name}</p>
            <p className="mb-2">Age: {selectedPatientDetails.age}</p>
            <p className="mb-2">Gender: {selectedPatientDetails.gender}</p>
            <p className="mb-2">Doctor: {selectedPatientDetails.doctor}</p>
          </div>
          <div>
            <p className="mb-2">Phone: {selectedPatientDetails.phone_number}</p>
            <p className="mb-2">Address: {selectedPatientDetails.address}</p>
            <p className="mb-2">Treatment Date: {selectedPatientDetails.initial_treatment_date}</p>
            <p className="mb-2">
  DOB: {new Date(selectedPatientDetails.dob).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long', // or 'short' for abbreviated month
    year: 'numeric',
  })}
</p>

          </div>
        </div>
      </div>
    );
  };

  const renderHelperDetails = () => {
    if (!selectedHelperDetails) return null;

    return (
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          {helperType.replace('_', ' ').charAt(0).toUpperCase() + helperType.slice(1)} Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2">Name: {selectedHelperDetails.name}</p>
            <p className="mb-2">Email: {selectedHelperDetails.email}</p>
            <p className="mb-2">Phone: {selectedHelperDetails.phone_number}</p>
          </div>
          <div>
            <p className="mb-2">Address: {selectedHelperDetails.address}</p>
            <p className="mb-2">Availability: {selectedHelperDetails.availability}</p>
            {helperType === 'medical_professional' && (
              <>
                <p className="mb-2">Specialization: {selectedHelperDetails.specialization}</p>
                <p className="mb-2">License: {selectedHelperDetails.license_number}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAssignmentDetails = (assignment) => {
    const helper = getHelperDetails(assignment);
    
    return (
      <div className="px-4 py-3 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Patient Details</h4>
            <p className="text-sm mb-1">Name: {assignment.patient.name}</p>
            <p className="text-sm mb-1">Status: {assignment.status}</p>
           <p className="text-sm mb-1">
  Assignment Date: {new Date(assignment.assigned_date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long', // Use 'short' for abbreviated month
    year: 'numeric',
  })}
</p>

          </div>
          <div>
            <h4 className="font-semibold mb-2">Helper Details</h4>
            <p className="text-sm mb-1">Type: {assignment.helperType.replace('_', ' ')}</p>
            <p className="text-sm mb-1">Name: {helper?.name || 'N/A'}</p>
            <p className="text-sm mb-1">Contact: {helper?.phone_number || 'N/A'}</p>
            {helper?.email && <p className="text-sm mb-1">Email: {helper.email}</p>}
            {helper?.specialization && <p className="text-sm mb-1">Specialization: {helper.specialization}</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderAssignmentForm = () => (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="text-xl font-semibold">Assign Patient</h2>
        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="text-teal-600 hover:text-teal-700"
        >
          {showAssignForm ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </button>
      </div>
      {showAssignForm && (
        <div className="p-4">
          <form onSubmit={handleAssignment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Select Patient</label>
                <select 
                  value={selectedPatient}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Helper Type</label>
                <select
                  value={helperType}
                  onChange={(e) => {
                    setHelperType(e.target.value);
                    setSelectedHelper('');
                    setShowHelperDetails(false);
                  }}
                  className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="medical_professional">Medical Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Select {helperType.replace('_', ' ')}
              </label>
              <select
                value={selectedHelper}
                onChange={(e) => handleHelperSelect(e.target.value)}
                className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Select a {helperType.replace('_', ' ')}</option>
                {getHelperList().map(helper => (
                  <option key={helper.id} value={helper.id}>
                    {helper.name}
                  </option>
                ))}
              </select>
            </div>

            {showPatientDetails && renderPatientDetails()}
            {showHelperDetails && renderHelperDetails()}

            <button
              type="submit"
              className="w-full md:w-auto bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Patient
            </button>
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
       <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Current Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            {filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <Users size={48} className="mb-4 text-gray-400" />
                <p>No assignments found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => (
                    <React.Fragment key={assignment._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleAssignmentDetails(assignment._id)}
                              className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                            >
                              <Eye size={16} className="mr-1.5" />
                              <span className="hidden md:inline">Details</span>
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
                          <td colSpan="2" className="px-6 py-4 bg-gray-50">
                            {renderAssignmentDetails(assignment)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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