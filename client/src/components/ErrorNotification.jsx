import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorNotification = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div 
      className="fixed inset-0 z-40 bg-black/10"
      onClick={onClose}
    >
      <div
        className="fixed top-4 right-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;