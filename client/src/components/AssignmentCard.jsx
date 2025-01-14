import { Users, Calendar, CircleDot } from 'lucide-react';

const AssignmentCard = ({ assignment, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group w-64 max-w-sm"
  >
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-50 p-2 rounded-full group-hover:bg-teal-100 transition-colors">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="font-medium text-gray-900">{assignment.patient_name}</h3>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            assignment.status.toLowerCase() === 'active'
              ? 'bg-teal-100 text-teal-800'
              : assignment.status.toLowerCase() === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <CircleDot className="w-3 h-3 mr-1" />
          {assignment.status}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-teal-500" />
          <span>Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </div>
);

export default AssignmentCard;