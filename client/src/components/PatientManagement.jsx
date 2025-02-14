import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Eye,
  Edit, 
  Trash2, 
  ArrowLeft,
  UserPlus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Filter,
  Star
} from 'lucide-react';
import ScrollToBottomButton from './ScrollToBottomButton';
import ConfirmDialog from './ConfrmDialog'
import BASE_URL from '../config';

const supportTypes = [
  { value: '', label: 'All Support Types' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'medical', label: 'Medical' },
  { value: 'others', label: 'Others' }
];

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [supportTypeFilter, setSupportTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

 
  
  const isNewPatient = (createdAt, viewedAt) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(createdAt) > threeDaysAgo && !viewedAt;
  };

  useEffect(() => {
    fetchPatients();
  }, []);

   // Debounced search effect
   useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await axios.get(`${BASE_URL}/patients?search=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleView = (id) => {
    navigate(`/admin/patients/view/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/admin/patients/update/${id}`);
  };

  
const handleDelete = async (id) => {
  setDeleteId(id);
  setShowConfirm(true);
 };
 
 const confirmDelete = async () => {
  try {
    await axios.delete(`${BASE_URL}/api/patients/${deleteId}`);
    setPatients(patients.filter((patient) => patient.id !== deleteId));
    setSuccess('patient deleted successfully!');
  } catch (error) {
    console.error('Error deleting patient:', error);
    setError('Failed to delete patient');
  }
  setShowConfirm(false);
 };

 
 const filteredPatients = (searchQuery ? searchResults : patients).filter((patient) => {
  const matchesSupportType = supportTypeFilter === '' || patient.support_type === supportTypeFilter;
  return matchesSupportType;
});

 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-teal-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Patient Management
              </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Add Caregiver Button for Large Screens */}
              <div className="hidden sm:block">
                            <button 
                                 onClick={() => navigate('/admin/patients/add')}
                               className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                            >
                                <UserPlus size={16} className="mr-2" />
                                Add Patient
                            </button>
                        </div>
              <button
                onClick={fetchPatients}
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
         {/* Search and Filter Section */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, register number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="animate-spin h-4 w-4 text-teal-500" />
              </div>
            )}
          </div>
        {/* Support Type Filter */}
        <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={supportTypeFilter}
              onChange={(e) => setSupportTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
            >
              {supportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        
           {/* alert content */}
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

 {/* Add patient Button for Mobile */}
 <div className="sm:hidden fixed bottom-4 right-4 z-50">
                    <button 
                         onClick={() => navigate('/admin/patients/add')}
                        className="bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
                    >
                        <UserPlus size={24} />
                    </button>
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
            <td className="px-6 py-4 whitespace-nowrap text-gray-700 flex items-center">
              {patient.first_name}
              {isNewPatient(patient.created_at, patient.viewed_at) && (
  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
    <Star size={12} className="mr-1 text-yellow-500" />
    New
  </span>
)}
            </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2">
                  {/* View Button - Desktop */}
                  <button
                    onClick={() => handleView(patient.id)}
                    className="hidden md:inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                  >
                    <Eye size={16} className="mr-1.5" />
                    <span>View</span>
                  </button>
                  {/* View Button - Mobile */}
                  <button
                    onClick={() => handleView(patient.id)}
                    className="md:hidden inline-flex items-center p-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                  >
                    <Eye size={16} />
                  </button>

                  {/* Edit Button - Desktop */}
                  <button
                    onClick={() => handleEdit(patient.id)}
                    className="hidden md:inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <Edit size={16} className="mr-1.5" />
                    <span>Edit</span>
                  </button>
                  {/* Edit Button - Mobile */}
                  <button
                    onClick={() => handleEdit(patient.id)}
                    className="md:hidden inline-flex items-center p-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <Edit size={16} />
                  </button>

                  {/* Delete Button - Desktop */}
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="hidden md:inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} className="mr-1.5" />
                    <span>Delete</span>
                  </button>
                  {/* Delete Button - Mobile */}
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="md:hidden inline-flex items-center p-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
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

export default PatientManagement;
