import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, UserCog, Activity, CheckSquare, Calendar, HeartPulse, UserPlus, BriefcaseMedical, HeartHandshake} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Volunteer",
      description: "Manage and view registered volunteers",
      icon: <Users className="h-8 w-8 text-teal-600" />,
      path: '/admin/volunteers',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Caregiver",
      description: "Manage and view registered caregivers",
      icon: <HeartHandshake className="h-8 w-8 text-teal-600" />,
      path: '/admin/caregivers',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Patients in Need",
      description: "Manage and view patients who need support",
      icon: <Activity className="h-8 w-8 text-teal-600" />,
      path: '/admin/patients-in-need',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Patient Management",
      description: "Manage patient information",
      icon: <UserCog className="h-8 w-8 text-teal-600" />,
      path: '/admin/patient-management',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Medical Profesional",
      description: "Manage and view registered medical professionals",
      icon: <BriefcaseMedical className="h-8 w-8 text-teal-600" />,
      path: '/admin/medical-professionals',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "To-Do List",
      description: "Manage tasks for palliative care volunteers and doctors",
      icon: <CheckSquare className="h-8 w-8 text-teal-600" />,
      path: '/admin/tasks',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Schedule Visits",
      description: "Manage and schedule patient visits for palliative care members",
      icon: <Calendar className="h-8 w-8 text-teal-600" />,
      path: '/admin/schedules',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Emergency Fund Collection",
      description: "Manage patient who require emergency fund",
      icon: <HeartPulse className="h-8 w-8 text-teal-600" />,
      path: '/admin/emergency-fund-management',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
  },
  {
    title: "Patient Assignment",
    description: "Assign patients to volunteers,caregivers and medical professionals",
    icon: <UserPlus className="h-8 w-8 text-teal-600" />,
    path: '/admin/patient-assignment',
    bgColor: 'bg-white',
    hoverColor: 'hover:bg-gray-50'
  }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <Heart className="h-8 w-8 text-teal-600" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} ${card.hoverColor} rounded-lg shadow-md transition-all duration-200 hover:shadow-lg`}
            >
              <button
                className="w-full p-6 text-left"
                onClick={() => navigate(card.path)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  {card.icon}
                  <h2 className="text-xl font-semibold text-gray-800">
                    {card.title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>
                <div className="inline-flex items-center text-teal-600 font-medium">
                  Enter
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;