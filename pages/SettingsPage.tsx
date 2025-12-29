import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const SettingsPage: React.FC = () => {
  const { user, showToast } = useContext(AppContext);

  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');

  useEffect(() => {
    // Prefill bank details if available
    const bank = localStorage.getItem('bankDetails');
    if (bank) {
      try {
        const parsed = JSON.parse(bank);
        setAccountHolderName(parsed.accountHolderName || '');
        setAccountNumber(parsed.accountNumber || '');
        setBankName(parsed.bankName || '');
        setIfscCode(parsed.ifscCode || '');
      } catch (e) {
        console.error('Failed to parse bank details', e);
      }
    }
  }, []);


  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Bank Account Information</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                id="accountHolderName"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79]"
                placeholder="Account holder name"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                id="accountNumber"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79]"
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                id="bankName"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79]"
                placeholder="Bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                id="ifscCode"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79]"
                placeholder="IFSC code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              className="px-6 py-2 rounded-lg text-white bg-[#2D7A79] hover:bg-opacity-90 font-semibold"
              onClick={() => {
                if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
                  showToast('Please fill in all bank account details.');
                  return;
                }

                // Persist bank details locally (and you can wire this to an API later)
                const bank = { accountHolderName, accountNumber, bankName, ifscCode };
                localStorage.setItem('bankDetails', JSON.stringify(bank));
                showToast('Bank account details updated successfully!');
              }}
            >
              Update Bank Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;