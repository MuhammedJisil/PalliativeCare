// TeamView.js
import React from 'react';
import { Users } from 'lucide-react';

const TeamMemberCard = ({ member }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-gray-600" />
        </div>
        <div className="ml-4">
          <h3 className="font-medium">{member.name}</h3>
          {member.specialization && (
            <p className="text-sm text-gray-500">{member.specialization}</p>
          )}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div>Email: {member.email}</div>
        <div>Phone: {member.phone_number}</div>
        <div>Address: {member.address}</div>
        {member.availability && (
          <div>Availability: {member.availability}</div>
        )}
      </div>
    </div>
  );
};

const TeamView = ({ detailData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {detailData.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
};

export default TeamView;