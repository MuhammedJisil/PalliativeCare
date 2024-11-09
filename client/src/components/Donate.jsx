import React, { useState } from 'react';

const UpiPayment = ({ amount, setAmount, upiId }) => (
  <div className="p-4 bg-blue-100 rounded-lg shadow-md">
    <h3 className="text-xl font-bold mb-2">Pay via UPI (Google Pay, Paytm, PhonePe)</h3>
    <input
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="Enter amount"
      className="w-full p-2 mb-4 border rounded-md"
    />
    <button
      onClick={() => window.open(`upi://pay?pa=${upiId}&pn=Example&am=${amount}`, '_blank')}
      className="w-full bg-green-500 text-white p-2 rounded-md"
    >
      Pay with UPI
    </button>
  </div>
);

const ManualPayment = ({ upiId, qrCodeImagePath, copyToClipboard }) => (
  <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-6">
    <h3 className="text-xl font-bold mb-4">Manual Payment</h3>
    <div className="flex flex-col items-center">
      <img src={qrCodeImagePath} alt="QR Code" className="w-32 h-32 mb-2" />
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-2">{upiId}</span>
        <button
          onClick={() => copyToClipboard(upiId)}
          className="mt-2 bg-gray-300 text-black px-2 py-1 rounded-md"
        >
          Copy UPI ID
        </button>
      </div>
    </div>
  </div>
);

const AccountTransfer = ({ accountNumber, ifscCode, copyToClipboard }) => (
  <div className="bg-yellow-100 p-4 rounded-lg shadow-md mt-6">
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
);

const Donate = () => {
  const [amount, setAmount] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const accountNumber = '123456789012';
  const ifscCode = 'ABC123456';
  const upiId = 'jisilff-1@okhdfcbank';
  const qrCodeImagePath = '/qrcode.jpeg';

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Donate</h2>
      <div className="bg-white shadow-md rounded-md p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UpiPayment amount={amount} setAmount={setAmount} upiId={upiId} />
          <ManualPayment upiId={upiId} qrCodeImagePath={qrCodeImagePath} copyToClipboard={copyToClipboard} />
          <AccountTransfer accountNumber={accountNumber} ifscCode={ifscCode} copyToClipboard={copyToClipboard} />
        </div>
      </div>
    </div>
  );
};

export default Donate;








