import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, X} from 'lucide-react';

const PatientManagement = () => {
 const [patients, setPatients] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const navigate = useNavigate();

 useEffect(() => {
   fetchPatients();
 }, []);

 const fetchPatients = async () => {
   try {
     const response = await axios.get('http://localhost:5000/api/patients');
     setPatients(response.data);
   } catch (error) {
     console.error('Error fetching patients:', error);
   }
 };

 const handleView = (id) => {
   navigate(`/admin/patients/view/${id}`);
 };

 const handleUpdate = (id) => {
   navigate(`/admin/patients/update/${id}`);
 };

 const handleDelete = async (id) => {
   if (window.confirm('Are you sure you want to delete this patient?')) {
     try {
       await axios.delete(`http://localhost:5000/api/patients/${id}`);
       fetchPatients();
     } catch (error) {
       console.error('Error deleting patient:', error);
       alert('Failed to delete patient');
     }
   }
 };

 const filteredPatients = patients.filter((patient) =>
   patient.first_name.toLowerCase().includes(searchTerm.toLowerCase())
 );

 return (
   <div className="min-h-screen bg-gray-100 p-6">
     <header className="mb-4 flex justify-between items-center">
       <div className="flex items-center space-x-2">
         <Heart className="h-8 w-8 text-teal-600" />
         <h1 className="text-2xl font-bold">Patient Management</h1>
       </div>
       <div className="flex space-x-4">
         <input
           type="text"
           placeholder="Search by patient name"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="py-2 px-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
         />
         <Link
           to="/admin/patients/add"
           className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition-colors"
         >
           Add Patient
         </Link>
       </div>
     </header>
     <div className="bg-white shadow-md rounded-md p-4">
       <table className="w-full border-collapse">
         <thead>
           <tr>
             <th className="py-2 px-4 border-b text-left">Patient Name</th>
             <th className="py-2 px-4 border-b text-left">Actions</th>
           </tr>
         </thead>
         <tbody>
           {filteredPatients.length > 0 ? (
             filteredPatients.map((patient) => (
               <tr key={patient.id}>
                 <td className="py-2 px-4 border-b">{patient.first_name}</td>
                 <td className="py-2 px-4 border-b">
                   <div className="flex space-x-4">
                     <button
                       onClick={() => handleView(patient.id)}
                       className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition-colors"
                     >
                       View
                     </button>
                     <button
                       onClick={() => handleUpdate(patient.id)}
                       className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition-colors"
                     >
                       Update
                     </button>
                     <button
                       onClick={() => handleDelete(patient.id)}
                       className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full font-medium shadow-sm transition-colors"
                     >
                       Delete
                     </button>
                   </div>
                 </td>
               </tr>
             ))
           ) : (
             <tr>
               <td colSpan="2" className="py-2 px-4 text-center">No patients available</td>
             </tr>
           )}
         </tbody>
       </table>
     </div>
     <div className="text-center mt-4">
       <button
         onClick={() => navigate('/admin/dashboard')}
         className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-full font-medium shadow-sm transition-colors"
       >
         Back to Dashboard
       </button>
     </div>
   </div>
 );
};

export default PatientManagement;
