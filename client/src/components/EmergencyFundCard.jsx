import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {  
  Info, 
  QrCode,  
  HelpingHand,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Heart,
  HandCoins
} from 'lucide-react';
import BASE_URL from '../config';

const EmergencyFundCard = () => {
   const [patient, setPatient] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [copiedField, setCopiedField] = useState(null);
   const [loading, setLoading] = useState(true);

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

   useEffect(() => {
     const fetchLatestPatient = async () => {
       try {
         setLoading(true);
         const response = await axios.get(`${BASE_URL}/api/emergency-fund`);
         
         if (Array.isArray(response.data) && response.data.length > 0) {
           const patientData = response.data[0];
           
           // Ensure full URLs or add base URL
           if (patientData.photo_url && !patientData.photo_url.startsWith('http')) {
            patientData.photo_url = `${BASE_URL}${patientData.photo_url.startsWith('/') ? '' : '/'}${patientData.photo_url}`;
          }
          
          if (patientData.qr_code_url && !patientData.qr_code_url.startsWith('http')) {
            patientData.qr_code_url = `${BASE_URL}${patientData.qr_code_url.startsWith('/') ? '' : '/'}${patientData.qr_code_url}`;
          }
          
           
           setPatient(patientData);
         }
       } catch (err) {
         console.error('Error fetching patient:', err);
       } finally {
         setLoading(false);
       }
     };

     fetchLatestPatient();
   }, []);

   const handleOpenModal = () => setIsModalOpen(true);
   const handleCloseModal = () => setIsModalOpen(false);

   const handleCopy = (text, field) => {
     navigator.clipboard.writeText(text).then(() => {
       setCopiedField(field);
       setTimeout(() => setCopiedField(null), 2000);
     });
   };

   return (
     <>
       {/* Floating Action Button */}
       <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
         <div className="relative">
           <button
             onClick={handleOpenModal}
             className={`w-16 h-16 rounded-full z-50 shadow-2xl 
             hover:opacity-90 transition duration-300 
             ${patient ? 'animate-bounce hover:animate-none' : ''}
             overflow-hidden border-4 border-teal-600
             ${loading ? 'bg-gray-300' : 'bg-teal-600'}`}
           >
             {loading ? (
               <div className="w-full h-full flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
               </div>
             ) : patient ? (
               patient.photo_url ? (
                 <img 
                   src={patient.photo_url} 
                   alt={patient.name}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                   {patient.name?.charAt(0)}
                 </div>
               )
             ) : (
               <div className="w-full h-full flex items-center justify-center">
                 <HandCoins className="w-8 h-8 text-white" />
               </div>
             )}
           </button>
         </div>
       </div>

       {/* Modal Overlay */}
       {isModalOpen && (
         <div
           className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
           onClick={handleCloseModal}
         >
           {/* Modal Content */}
           <div
             className="bg-white rounded-2xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto custom-scrollbar relative"
             onClick={(e) => e.stopPropagation()}
           >
             {/* Cancel Icon */}
             <button
               onClick={handleCloseModal}
               className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
             >
               <XCircle className="w-8 h-8" />
             </button>

             {patient ? (
               // Patient Data Content
               <>
                 {/* Page Title */}
                 <div className="text-center mb-6">
                   <h1 className="text-3xl font-bold text-teal-800">Emergency Fund</h1>
                   <p className="text-gray-600 text-sm">Help a Patient in Need</p>
                 </div>

                 {/* Patient Photo */}
                 {patient.photo_url && (
                   <div className="flex justify-center mb-4">
                     <img
                       src={patient.photo_url}
                       alt={patient.name}
                       className="w-40 h-40 object-cover rounded-full border-4 border-teal-600"
                     />
                   </div>
                 )}

                 {/* Patient Name */}
                 <h2 className="text-2xl font-bold text-center mb-4 text-teal-800">
                   {patient.name}
                 </h2>

                 {/* Patient Details */}
                 {patient.details && (
                   <div className="mb-4">
                     <div className="flex items-center mb-2">
                       <Info className="w-5 h-5 mr-2 text-teal-600" />
                       <h3 className="font-semibold text-gray-700">Patient Details</h3>
                     </div>
                     <p className="text-gray-600 whitespace-pre-wrap break-words">
                       {patient.details}
                     </p>
                   </div>
                 )}

                 {/* Donation Information */}
                 <div className="bg-teal-50 p-4 rounded-lg mb-4">
                   <div className="flex items-center mb-3">
                     <HelpingHand className="w-5 h-5 mr-2 text-teal-600" />
                     <h3 className="font-semibold text-gray-700 text-lg">Donation Details</h3>
                   </div>
                   
                   <div className="space-y-3">
                     {patient.account_number && (
                       <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                         <div className="flex-grow pr-2">
                           <p className="text-sm text-gray-600 font-medium">Account Number</p>
                           <p className="text-gray-800 truncate max-w-[200px]">{patient.account_number}</p>
                         </div>
                         <button 
                           onClick={() => handleCopy(patient.account_number, 'account')}
                           className="text-teal-600 hover:text-teal-700 transition-colors"
                         >
                           {copiedField === 'account' ? 
                             <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                             <Copy className="w-5 h-5" />
                           }
                         </button>
                       </div>
                     )}
                     
                     {patient.ifsc_code && (
                       <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                         <div className="flex-grow pr-2">
                           <p className="text-sm text-gray-600 font-medium">IFSC Code</p>
                           <p className="text-gray-800">{patient.ifsc_code}</p>
                         </div>
                         <button 
                           onClick={() => handleCopy(patient.ifsc_code, 'ifsc')}
                           className="text-teal-600 hover:text-teal-700 transition-colors"
                         >
                           {copiedField === 'ifsc' ? 
                             <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                             <Copy className="w-5 h-5" />
                           }
                         </button>
                       </div>
                     )}
                     
                     {patient.upi_id && (
                       <div className="flex items-center justify-between">
                         <div className="flex-grow pr-2">
                           <p className="text-sm text-gray-600 font-medium">UPI ID</p>
                           <p className="text-gray-800 truncate max-w-[200px]">{patient.upi_id}</p>
                         </div>
                         <button 
                           onClick={() => handleCopy(patient.upi_id, 'upi')}
                           className="text-teal-600 hover:text-teal-700 transition-colors"
                         >
                           {copiedField === 'upi' ? 
                             <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                             <Copy className="w-5 h-5" />
                           }
                         </button>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* QR Code */}
                 {patient.qr_code_url && (
                   <div className="mt-4 flex flex-col items-center">
                     <div className="flex items-center mb-2">
                       <QrCode className="w-5 h-5 mr-2 text-teal-600" />
                       <h3 className="font-semibold text-gray-700">Scan to Donate</h3>
                     </div>
                     <img
                       src={patient.qr_code_url}
                       alt="Patient Donation QR Code"
                       className="w-40 h-40 object-contain"
                     />
                   </div>
                 )}
               </>
             ) : (
               // No Patient Data Content
               <div className="text-center py-8">
                 <AlertCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">
                   No Active Emergency Fund Cases
                 </h2>
                 <p className="text-gray-600">
                   Currently, there are no patients requiring emergency financial assistance. Thank you for your willingness to help.
                 </p>
               </div>
             )}
           </div>
         </div>
       )}

       {/* Inline Styles for Scrollbar */}
       <style>{scrollbarStyles}</style>
     </>
   );
};

export default EmergencyFundCard;