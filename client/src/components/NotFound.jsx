import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center p-8 max-w-md mx-4">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;