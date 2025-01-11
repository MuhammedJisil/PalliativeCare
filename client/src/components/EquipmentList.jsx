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
import { useNavigate } from 'react-router-dom';

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
    image: null // Added for image handling
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/equipment');
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
    
    // Append all form fields to FormData
    Object.keys(formData).forEach(key => {
      if (key !== 'image') {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // Append image if it exists
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      if (editingEquipment) {
        const response = await axios.put(
          `http://localhost:5000/api/equipment/${editingEquipment.id}`, 
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
          'http://localhost:5000/api/equipment', 
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
      await axios.delete(`http://localhost:5000/api/equipment/${deleteId}`);
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
      notes: item.notes
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
      notes: ''
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
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Equipment Management
              </h1>
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
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            <Eye size={16} className="mr-1.5" />
                            <span className="hidden md:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Out of Service">Out of Service</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <input
                        type="text"
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      ></textarea>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingEquipment ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium text-gray-900">Delete Equipment</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this equipment? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default EquipmentList;