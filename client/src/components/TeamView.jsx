import React from 'react';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

const IconWrapper = ({ children }) => (
  <div className="text-teal-400 w-5 h-5">
    {children}
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4 text-sm py-1">
    <IconWrapper>{icon}</IconWrapper>
    <span className="text-gray-600">{value}</span>
  </div>
);

const TeamMemberCard = ({ member }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
            {member.specialization && (
              <p className="text-sm text-gray-500 mt-1">{member.specialization}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <InfoRow
          icon={<Mail className="w-5 h-5" />}
          value={member.email}
        />
        <InfoRow
          icon={<Phone className="w-5 h-5" />}
          value={member.phone_number}
        />
        <InfoRow
          icon={<MapPin className="w-5 h-5" />}
          value={member.address}
        />
        {member.availability && (
          <InfoRow
            icon={<Clock className="w-5 h-5" />}
            value={member.availability}
          />
        )}
      </div>
    </div>
  );
};

const TeamView = ({ detailData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {detailData.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
        />
      ))}
    </div>
  );
};

export default TeamView;