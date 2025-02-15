import React, { useEffect, useState } from 'react';
import { BadgeCheck, Box, Loader, ImageIcon } from 'lucide-react';
import BASE_URL from '../config';

const EquipmentCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return null;
    
    // If URL is already an absolute URL (Cloudinary or any external image), return it as is
    if (url.startsWith('http')) {
      return url;
    }
  
    // Otherwise, ensure it has BASE_URL
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="aspect-video relative bg-gray-100">
        {imageError || !item.image_url ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200">
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <span className="text-sm text-gray-500 mt-2">No image available</span>
          </div>
        ) : (
          <img
            src={getImageUrl(item.image_url)}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain bg-gray-50"
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              setImageError(true);
            }}
          />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-teal-700 mb-3">{item.name}</h3>
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{item.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium">{item.quantity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="flex items-center">
              <BadgeCheck className="mr-1 text-teal-700" size={16} />
              <span className="text-teal-800 font-medium">{item.status}</span>
            </span>
          </div>
          {item.notes && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EquipmentDisplay = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchEquipment();
  }, []);
  
  const fetchEquipment = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/equipment/available`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      const data = await response.json();
      setEquipment(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-teal-700" size={40} />
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }
  
  // Added condition for no equipment
  if (equipment.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-6 text-teal-700 flex items-center justify-center">
          <Box className="mr-2" />
          Available Equipment
        </h2>
        <div className="bg-gray-100 p-8 rounded-lg">
          <p className="text-gray-600 text-lg">
            No equipment is currently available.
          </p>
          <p className="text-gray-500 mt-2">
            Please check back later or contact care management.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-teal-700 flex items-center">
        <Box className="mr-2" />
        Available Equipment
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <EquipmentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default EquipmentDisplay;