import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Edit, 
  Trash2, 
  ArrowLeft,
  UserPlus,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ConfirmDialog from './ConfrmDialog'
import BASE_URL from '../config';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(13, 148, 136, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #0d9488, #0f766e);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #0f766e, #0d9488);
  }
`;

const EmergencyFundManager = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
     const [success, setSuccess] = useState(null);
      const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef(null);
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        details: "",
        account_number: "",
        ifsc_code: "",
        upi_id: "",
        photo: null,
        qr_code: null,
        existing_photo: "",
        existing_qr_code: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    // Fetch patients
    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/emergency-fund`);
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setIsLoading(false);
        }
    };

     // Add styles to document
     useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = scrollbarStyles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "photo" || name === "qr_code") {
            if (files && files[0]) {
                setFormData(prev => ({
                    ...prev,
                    [name]: files[0]
                }));
            }
        } else if (name === "account_number") {
            const numbersOnly = value.replace(/[^\d]/g, '');
            setFormData(prev => ({ ...prev, [name]: numbersOnly }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
   // Handle form submission for adding or updating     
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
        setShowAddConfirm(true);
        return;
    }
    await submitForm();
};

const submitForm = async () => {
    try {
        const data = new FormData();
        
        // Add all basic form fields
        Object.entries(formData).forEach(([key, value]) => {
            if (!['photo', 'qr_code', 'existing_photo', 'existing_qr_code'].includes(key)) {
                data.append(key, value || '');
            }
        });

        // Handle photo
        if (formData.photo instanceof File) {
            data.append('photo', formData.photo);
        } else if (formData.existing_photo) {
            data.append('existing_photo', formData.existing_photo);
        }

        // Handle QR code
        if (formData.qr_code instanceof File) {
            data.append('qr_code', formData.qr_code);
        } else if (formData.existing_qr_code) {
            data.append('existing_qr_code', formData.existing_qr_code);
        }

        if (isEditing) {
            await axios.put(
                `${BASE_URL}/api/emergency-fund/${formData.id}`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setSuccess("Patient updated successfully");
        } else {
            await axios.post(
                `${BASE_URL}/api/emergency-fund`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setSuccess("Patient added successfully");
        }

        setFormData({
            id: null,
            name: "",
            details: "",
            account_number: "",
            ifsc_code: "",
            upi_id: "",
            photo: null,
            qr_code: null,
            existing_photo: "",
            existing_qr_code: ""
        });
        setIsEditing(false);
        setIsModalOpen(false);
        fetchPatients();
    } catch (error) {
        console.error("Error saving patient:", error);
        setError("Failed to save patient");
    }
};


const handleEdit = (patient) => {
    setFormData({
        id: patient.id,
        name: patient.name,
        details: patient.details,
        account_number: patient.account_number,
        ifsc_code: patient.ifsc_code,
        upi_id: patient.upi_id,
        photo: null,
        qr_code: null,
        existing_photo: patient.photo_url,
        existing_qr_code: patient.qr_code_url
    });
    setIsEditing(true);
    setIsModalOpen(true);
};

    // Delete a patient
    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
      };
    
      const confirmDelete = async () => {
        try {
          await axios.delete(`${BASE_URL}/api/emergency-fund/${deleteId}`);
          setPatients(patients.filter((patient) => patient.id !== deleteId));
          setSuccess('Patient deleted successfully!');
        } catch (error) {
          console.error('Error deleting patient:', error);
          setError('Failed to delete patient');
        }
        setShowDeleteConfirm(false);
      };

    // Reset form and open modal for adding new patient
    const handleAddNew = () => {
        setFormData({
            id: null,
            photo: null,
            name: "",
            details: "",
            account_number: "",
            ifsc_code: "",
            upi_id: "",
            qr_code: null,
            photoUrl: "",
            qrCodeUrl: ""
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchPatients();
    }, []);


    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header Section */}
            <div className="bg-white shadow-md rounded-lg mb-4">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-6 w-6 text-teal-600" />
                            <Link to="/admin/dashboard" className="text-gray-800">
                            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-800">
                                Emergency Fund Management
                            </h1>
                        </Link>
                        </div>
                        
                        {/* Add Patient Button for Large Screens */}
                        <div className="hidden sm:block">
                            <button 
                                onClick={handleAddNew}
                                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
                            >
                                <UserPlus size={16} className="mr-2" />
                                Add Patient
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto">
                {/* Patients List Section */}
                <div className="bg-white rounded-lg shadow-md mb-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <RefreshCw className="animate-spin text-teal-600" size={24} />
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                            <Users size={48} className="mb-4 text-gray-400" />
                            <p>No patients found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {patients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {patient.name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <div className="flex justify-end space-x-2">
                                                     {/* Edit Button - Desktop */}
                                                                      <button
                                                                        onClick={() => handleEdit(patient)}
                                                                        className="hidden md:inline-flex items-center px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                                                                      >
                                                                        <Edit size={15} className="mr-1.5" />
                                                                        <span>Edit</span>
                                                                      </button>
                                                                      {/* Edit Button - Mobile */}
                                                                      <button
                                                                        onClick={() => handleEdit(patient)}
                                                                        className="md:hidden inline-flex items-center p-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                                                                      >
                                                                        <Edit size={17} />
                                                                      </button>
                                                     {/* Delete Button - Desktop */}
                                                                      <button
                                                                        onClick={() => handleDelete(patient.id)}
                                                                        className="hidden md:inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                                                                      >
                                                                        <Trash2 size={15} className="mr-1.5" />
                                                                        <span>Delete</span>
                                                                      </button>
                                                                      {/* Delete Button - Mobile */}
                                                                      <button
                                                                        onClick={() => handleDelete(patient.id)}
                                                                        className="md:hidden inline-flex items-center p-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                                                                      >
                                                                        <Trash2 size={17} />
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


                {/* Add Patient Button for Mobile */}
                <div className="sm:hidden fixed bottom-4 right-4 z-50">
                    <button 
                        onClick={handleAddNew}
                        className="bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
                    >
                        <UserPlus size={24} />
                    </button>
                </div>

                {/* Add/Edit Patient Modal */}
                {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] custom-scrollbar overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {isEditing ? "Update Patient" : "Add Patient"}
                                </h2>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        maxLength="30"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Patient Name"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                    <textarea
                                        name="details"
                                        value={formData.details}
                                        onChange={handleChange}
                                        placeholder="Details"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        rows="3"
                                        required
                                    />
                                    <input
                                    type="text"
                                    maxLength="20"
                                    name="account_number"
                                    value={formData.account_number}
                                    onChange={handleChange}
                                    placeholder="Account Number"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                    <input
                                        type="text"
                                        name="ifsc_code"
                                        maxLength="11"
                                        value={formData.ifsc_code}
                                        onChange={(e) => {
                                            // Remove spaces from the input value
                                            const newValue = e.target.value.replace(/\s/g, '');
                                            handleChange({ target: { name: 'ifsc_code', value: newValue } });
                                        }}
                                        placeholder="IFSC Code"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    <input
                                        type="text"
                                        name="upi_id"
                                        maxLength="50"
                                        value={formData.upi_id}
                                        onChange={handleChange}
                                        placeholder="UPI ID"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                     {/* Photo input with preview */}
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-600">Patient Photo</label>
                                    {(formData.existing_photo || formData.photo) && (
                                        <div className="mb-2">
                                            <img 
                                                src={formData.photo ? URL.createObjectURL(formData.photo) : formData.existing_photo}
                                                alt="Patient"
                                                className="w-20 h-20 object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="photo"
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                                    />
                                </div>

                                {/* QR Code input with preview */}
                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-600">QR Code</label>
                                    {(formData.existing_qr_code || formData.qr_code) && (
                                        <div className="mb-2">
                                            <img 
                                                src={formData.qr_code ? URL.createObjectURL(formData.qr_code) : formData.existing_qr_code}
                                                alt="QR Code"
                                                className="w-20 h-20 object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="qr_code"
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md"
                                    />
                                </div>


                                    <button 
                                        type="submit" 
                                        className="w-full bg-teal-600 text-white py-2 rounded-full hover:bg-teal-700 transition-colors"
                                    >
                                        {isEditing ? "Update Patient" : "Add Patient"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
            {/* Confirm Dialog Component */}
            <ConfirmDialog
  isOpen={showDeleteConfirm}
  title="Delete Patient"
  message="Are you sure you want to delete this patient?"
  onConfirm={confirmDelete}
  onCancel={() => setShowDeleteConfirm(false)}
/>
<ConfirmDialog
  isOpen={showAddConfirm}
  title="Add New Patient"
  message="Adding a new patient will remove the previous patient. Are you sure you want to continue?"
  onConfirm={async () => {
    setShowAddConfirm(false);
    await submitForm();
  }}
  onCancel={() => setShowAddConfirm(false)}
/>
        </div>
    );
};

export default EmergencyFundManager;