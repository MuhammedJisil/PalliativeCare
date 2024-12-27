import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  UserPlus,
  RefreshCw
} from 'lucide-react';

const EmergencyFundManager = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        photo: "",
        name: "",
        details: "",
        account_number: "",
        ifsc_code: "",
        upi_id: "",
        qr_code: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Fetch patients
    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/api/emergency-fund");
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "photo" || name === "qr_code") {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle form submission for adding or updating
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Confirmation alert for adding a new patient
        if (!isEditing) {
            const confirmAdd = window.confirm('Adding a new patient will remove the previous patient. Are you sure you want to continue?');
            if (!confirmAdd) return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key]);
            });

            if (isEditing) {
                await axios.post("http://localhost:5000/api/emergency-fund", data);
                alert("Patient updated successfully");
            } else {
                await axios.post("http://localhost:5000/api/emergency-fund", data);
                alert("Patient added successfully");
            }

            setFormData({
                id: null,
                photo: "",
                name: "",
                details: "",
                account_number: "",
                ifsc_code: "",
                upi_id: "",
                qr_code: "",
            });
            setIsEditing(false);
            setIsModalOpen(false);
            fetchPatients();
        } catch (error) {
            console.error("Error saving patient:", error);
            alert("Failed to save patient");
        }
    };

    // Edit a patient
    const handleEdit = (patient) => {
        setFormData(patient);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Delete a patient
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this patient?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:5000/api/emergency-fund/${id}`);
                alert("Patient deleted successfully");
                fetchPatients();
            } catch (error) {
                console.error("Error deleting patient:", error);
                alert("Failed to delete patient");
            }
        }
    };

    // Reset form and open modal for adding new patient
    const handleAddNew = () => {
        setFormData({
            id: null,
            photo: "",
            name: "",
            details: "",
            account_number: "",
            ifsc_code: "",
            upi_id: "",
            qr_code: "",
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

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
                                                    <button
                                                        onClick={() => handleEdit(patient)}
                                                        className="inline-flex items-center px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors"
                                                    >
                                                        <Edit2 size={12} className="mr-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(patient.id)}
                                                        className="inline-flex items-center px-2 py-1 text-xs bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 size={12} className="mr-1" />
                                                        Delete
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
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                                    <div className="space-y-2">
                                        <label className="block text-sm text-gray-600">Patient Photo</label>
                                        <input
                                            type="file"
                                            name="photo"
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm text-gray-600">QR Code</label>
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
        </div>
    );
};

export default EmergencyFundManager;