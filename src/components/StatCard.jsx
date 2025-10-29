import React from 'react';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-6 border-2 border-${color}-200 hover:shadow-lg transition-all`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
        <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div className={`bg-${color}-600 text-white p-4 rounded-xl`}>
        <Icon size={28} />
      </div>
    </div>
  </div>
);

export default StatCard;
