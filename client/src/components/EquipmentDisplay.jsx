import React, { useEffect, useState } from 'react';
import { BadgeCheck, Box, Loader } from 'lucide-react';

const EquipmentDisplay = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/equipment/available');
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      const data = await response.json();
      setEquipment(data);
    } catch (err) {
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

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-teal-700 flex items-center">
        <Box className="mr-2" />
        Available Equipment
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-48 overflow-hidden bg-gray-100">
              <img
                src={item.image_url || '/api/placeholder/400/300'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-teal-700">{item.name}</h3>
              <div className="mt-2 space-y-2">
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
        ))}
      </div>
    </div>
  );
};

export default EquipmentDisplay;
