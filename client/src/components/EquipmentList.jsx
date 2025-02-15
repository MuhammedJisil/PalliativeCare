import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  WrenchIcon, 
  RefreshCw, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ScrollToBottomButton from './ScrollToBottomButton';
import ConfirmDialog from './ConfrmDialog';
import AddEditEquipmentModal from './AddEditEquipmentModal';
import BASE_URL from '../config';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: 0,
    status: 'Available',
    condition: '',
    notes: '',
    image: null,
    image_url: ''  // Added for image handling
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/equipment`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to fetch equipment');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    // Append all non-image form fields to FormData
    Object.keys(formData).forEach(key => {
      if (key !== 'image' && key !== 'image_url') {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // Handle image
    if (formData.image instanceof File) {
      formDataToSend.append('image', formData.image);
    } else if (formData.image_url) {
      formDataToSend.append('existing_image', formData.image_url);
    }

    try {
      if (editingEquipment) {
        const response = await axios.put(
          `${BASE_URL}/api/equipment/${editingEquipment.id}`, 
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setEquipment(equipment.map(item => 
          item.id === editingEquipment.id ? response.data : item
        ));
        setSuccess('Equipment updated successfully!');
      } else {
        const response = await axios.post(
          `${BASE_URL}/api/equipment`, 
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setEquipment([response.data, ...equipment]);
        setSuccess('Equipment added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  };

  
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/equipment/${deleteId}`);
      setEquipment(equipment.filter(item => item.id !== deleteId));
      setSuccess('Equipment deleted successfully!');
    } catch (error) {
      setError('Failed to delete equipment');
    }
    setShowConfirm(false);
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      status: item.status,
      condition: item.condition,
      notes: item.notes,
      image: null,
      image_url: item.image_url // Store the existing image URL
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
    setFormData({
      name: '',
      type: '',
      quantity: 0,
      status: 'Available',
      condition: '',
      notes: '',
      image: null,
      image_url: ''
    });
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <WrenchIcon className="h-8 w-8 text-teal-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
                                <h1 className="text-xl font-semibold tracking-tight">Equipment</h1>
                              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md"
              >
                <Plus size={16} className="mr-2" />
                Add Equipment
              </button>
              <button
                onClick={fetchEquipment}
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

       {/* Equipment List */}
       <div className="bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <RefreshCw className="animate-spin text-teal-600" size={24} />
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Box size={48} className="mb-4 text-gray-400" />
              <p>No equipment found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Equipment Name</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/admin/equipments/view/${item.id}`)}
                            className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                          >
                            <Eye size={16} className="mr-1.5" />
                            <span className="hidden md:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                          >
                            <Edit2 size={16} className="mr-1.5" />
                            <span className="hidden md:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} className="mr-1.5" />
                            <span className="hidden md:inline">Delete</span>
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

        {/* Mobile Add Button */}
        <div className="sm:hidden fixed bottom-4 right-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-12 h-12 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-lg"
          >
            <Plus size={24} />
          </button>
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
        <div className="fixed inset-0 z-40 bg-black/10" onClick={() => { setError(null); setSuccess(null); }}>
          <div className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()}>
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
      <ScrollToBottomButton />

      <ConfirmDialog
 isOpen={showConfirm}
 title="Delete equipment"
 message="Are you sure you want to delete this equipment?"
 onConfirm={confirmDelete}
 onCancel={() => setShowConfirm(false)}
/>

{/* Add/Edit Modal */}
<AddEditEquipmentModal
  isModalOpen={isModalOpen}
  handleCloseModal={handleCloseModal}
  editingEquipment={editingEquipment}
  formData={formData}
  setFormData={setFormData}
  handleSubmit={handleSubmit}
/>
    </div>
  );
};

export default EquipmentList;