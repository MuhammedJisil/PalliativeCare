import React, { useState } from 'react';
import { Award } from 'lucide-react';

const LicenseNumberInput = ({ formData, handleChange }) => {
  const [licenseError, setLicenseError] = useState('');

  const validateLicenseNumber = (value) => {
    // Medical Council of India (MCI) License Number Format
    // Typically follows patterns like:
    // - Starts with state code (2-3 letters)
    // - Followed by numbers
    // - Usually 10-15 characters long
    const licenseRegex = /^[A-Z]{2,3}\d{6,10}$/;

    if (!value) {
      setLicenseError('License number is required');
      return false;
    }

    if (!licenseRegex.test(value)) {
      setLicenseError('Invalid license number format.');
      return false;
    }

    setLicenseError('');
    return true;
  };

  const handleBlur = (e) => {
    validateLicenseNumber(e.target.value);
  };

  return (
    <div>
      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
        <Award className="h-5 w-5 text-teal-600" />
        <span>License Number</span>
      </label>
      <input
        type="text"
        name="license_number"
        value={formData.license_number}
        onChange={(e) => {
          handleChange(e);
          validateLicenseNumber(e.target.value);
        }}
        onBlur={handleBlur}
        required
        className={`w-full p-3 border ${
          licenseError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-200 focus:ring-teal-500'
        } rounded-lg focus:ring-2 focus:border-transparent`}
        placeholder="Enter your medical license number"
        maxLength="15"
      />
      {licenseError && (
        <p className="text-red-500 text-sm mt-1">{licenseError}</p>
      )}
    </div>
  );
};

export default LicenseNumberInput;