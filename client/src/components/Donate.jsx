import React from 'react';

const Donate = () => {
  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Sample account details
  const accountNumber = '123456789012';
  const ifscCode = 'ABC123456';
  const upiId = 'example@upi';
  const qrCodeUrl = 'https://example.com/sample-qr-code.png'; // Replace with your QR code URL

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Donate</h2>
      <div className="bg-white shadow-md rounded-md p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Transfer Box */}
          <div className="p-4 bg-blue-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Account Transfer</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Account Number:</span>
                <span className="text-gray-700">{accountNumber}</span>
                <button
                  onClick={() => copyToClipboard(accountNumber)}
                  className="bg-gray-300 text-black px-2 py-1 rounded-md"
                >
                  Copy
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">IFSC Code:</span>
                <span className="text-gray-700">{ifscCode}</span>
                <button
                  onClick={() => copyToClipboard(ifscCode)}
                  className="bg-gray-300 text-black px-2 py-1 rounded-md"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* UPI ID Box */}
          <div className="p-4 bg-green-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">UPI ID</h3>
            <div className="flex justify-between items-center">
              <span className="font-semibold">UPI ID:</span>
              <span className="text-gray-700">{upiId}</span>
              <button
                onClick={() => copyToClipboard(upiId)}
                className="bg-gray-300 text-black px-2 py-1 rounded-md"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* QR Pay Box */}
        <div className="p-4 bg-yellow-100 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-2">QR Pay</h3>
          <p className="mb-4">Scan the QR code below to pay using UPI:</p>
          <div className="flex justify-center">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-32 h-32"
              onClick={() => window.open('upi://pay?pa=example@upi', '_blank')}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
