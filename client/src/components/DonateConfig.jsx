import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2 } from 'lucide-react';

const DonateConfig = () => {
  const [config, setConfig] = useState({
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    qrCodeImagePath: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/donation-config');
        setConfig(response.data);
      } catch (err) {
        console.error('Error fetching donation config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    setConfig({ ...config, qrCodeImagePath: e.target.files[0] });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('accountNumber', config.accountNumber);
      formData.append('ifscCode', config.ifscCode);
      formData.append('upiId', config.upiId);
      if (config.qrCodeImagePath instanceof File) {
        formData.append('qrCodeImage', config.qrCodeImagePath);
      }

      await axios.post('/api/donation-config', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Configuration saved successfully!');
    } catch (err) {
      console.error('Error saving donation config:', err);
      setMessage('Failed to save configuration. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Configure Donation Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={config.accountNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={config.ifscCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={config.upiId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Configuration
            </>
          )}
        </button>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default DonateConfig;
