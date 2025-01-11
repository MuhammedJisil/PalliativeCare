import React, { useState } from 'react';
import { CreditCard, Copy, QrCode, Building, AlertCircle, Check } from 'lucide-react';

const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors text-sm"
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-teal-600" />
          <span className="text-teal-600">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

const UpiPayment = ({ amount, setAmount, upiId }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-teal-50 rounded-lg">
        <CreditCard className="h-6 w-6 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">Quick Payment</h3>
    </div>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Donation Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
          <input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
        </div>
      </div>
      
      <button
        onClick={() => window.open(`upi://pay?pa=${upiId}&pn=Palliative Care&am=${amount}`, '_blank')}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <span>Pay with UPI</span>
      </button>
    </div>
  </div>
);

const ManualPayment = ({ upiId, qrCodeImagePath, copyToClipboard }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-teal-50 rounded-lg">
        <QrCode className="h-6 w-6 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">Scan & Pay</h3>
    </div>

    <div className="flex flex-col items-center space-y-4">
      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <img src={qrCodeImagePath} alt="QR Code" className="w-40 h-40 object-contain" />
      </div>
      
      <div className="w-full p-3 bg-gray-50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">UPI ID:</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{upiId}</span>
            <CopyButton text={upiId} label="UPI ID" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AccountTransfer = ({ accountNumber, ifscCode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-teal-50 rounded-lg">
        <Building className="h-6 w-6 text-teal-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">Bank Transfer</h3>
    </div>

    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Account Number</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{accountNumber}</span>
            <CopyButton text={accountNumber} label="account number" />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">IFSC Code</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{ifscCode}</span>
            <CopyButton text={ifscCode} label="IFSC code" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Donate = () => {
  const [amount, setAmount] = useState('');
  
  const accountNumber = '123456789012';
  const ifscCode = 'ABC123456';
  const upiId = 'jisilff-1@okhdfcbank';
  const qrCodeImagePath = '/qrcode.jpeg';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Support Our Cause</h2>
          <p className="mt-2 text-lg text-gray-600">Your donation helps us provide better care for those in need</p>
        </div>

        <div className="p-4 mb-8 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-700">
            All donations are used to support our palliative care services and help patients in need. 
            You'll receive a confirmation receipt via email after your donation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UpiPayment amount={amount} setAmount={setAmount} upiId={upiId} />
          <ManualPayment upiId={upiId} qrCodeImagePath={qrCodeImagePath} />
          <AccountTransfer accountNumber={accountNumber} ifscCode={ifscCode} />
        </div>
      </div>
    </div>
  );
};

export default Donate;








