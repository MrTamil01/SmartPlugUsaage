import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Confirm Action</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
