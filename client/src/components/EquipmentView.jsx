import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  ClipboardList,
  AlertCircle,
  Loader,
  TagIcon,
  Hash,
  FileText,
  Activity
} from 'lucide-react';
import BASE_URL from '../config';

const EquipmentView = () => {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);
  const fetchEquipmentDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/inventory/equipment/${id}`);
      console.log('Raw equipment data:', response.data);
  
      const equipmentData = response.data;
  
      // Convert relative `image_url` to absolute URL if necessary
      if (!equipmentData.image_url.startsWith('http')) {
        equipmentData.image_url = `${BASE_URL}/${equipmentData.image_url}`;
      }
      
  
      console.log('Processed equipment data:', equipmentData);
      setEquipment(equipmentData);
    } catch (error) {
      setError('Failed to fetch equipment details');
      console.error('Error fetching equipment details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Equipment</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/admin/equipments')}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Equipment List
        </button>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Package className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Equipment Not Found</h2>
        <p className="text-gray-600 mb-4">The requested equipment could not be found.</p>
        <button
          onClick={() => navigate('/admin/equipments')}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Equipment List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Equipment Details</h1>
            <button
              onClick={() => navigate('/admin/equipments')}
              className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
        {equipment.image_url && (
    <>
      <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden cursor-pointer"
           onClick={() => setShowFullImage(true)}>
        <img
          src={equipment.image_url}
          alt={equipment.name}
          className="w-full h-full object-contain hover:opacity-90 transition-opacity"
        />
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={equipment.image_url}
              alt={equipment.name}
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )}
          {/* Equipment Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{equipment.name}</h2>
                </div>

                <div className="flex items-start space-x-3">
                  <TagIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-gray-900">{equipment.type}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantity</p>
                    <p className="text-gray-900">{equipment.quantity}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                      ${equipment.status === 'Available' ? 'bg-green-100 text-green-800' :
                        equipment.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                        equipment.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {equipment.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <ClipboardList className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Condition</p>
                    <p className="text-gray-900">{equipment.condition}</p>
                  </div>
                </div>

                {equipment.notes && (
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{equipment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentView;