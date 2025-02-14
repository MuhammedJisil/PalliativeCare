import React, { useState } from 'react';
import { Phone } from 'lucide-react';

const PhoneNumberInput = ({ formData, handleChange }) => {
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (value) => {
    // Remove non-digit characters
    const cleanedValue = value.replace(/\D/g, '');

    // Check length and numeric content
    if (cleanedValue.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }

    // Optional: Additional validation (e.g., area code restrictions)
    const areaCode = cleanedValue.substring(0, 3);
    const invalidAreaCodes = ['000', '911'];
    if (invalidAreaCodes.includes(areaCode)) {
      setPhoneError('Invalid area code');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
      // Create a synthetic event object that matches what handleChange expects
      handleChange({
        target: {
          name: 'phone_number',
          value: value
        }
      });
      validatePhoneNumber(value);
    }
  };


  const handleBlur = (e) => {
    const value = e.target.value;
    validatePhoneNumber(value);
  };

  return (
    <div>
      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
        <Phone className="h-5 w-5 text-teal-600" />
        <span>Phone Number</span>
      </label>
      <input
        placeholder="Enter 10-digit phone number"
        maxLength="10"
        pattern="[0-9]*"
        inputMode="numeric"
        type="tel"
        name="phone_number"
        value={formData.phone_number || ''} 
        onChange={handlePhoneChange}
        onBlur={handleBlur}
        required
        className={`w-full p-3 border ${
          phoneError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-200 focus:ring-teal-500'
        } rounded-lg focus:ring-2 focus:border-transparent`}
      />
      {phoneError && (
        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput;