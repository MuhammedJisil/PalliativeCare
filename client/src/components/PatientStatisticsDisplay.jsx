import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Users, 
  Home, 
  Stethoscope, 
  Brain, 
  ActivityIcon, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp,
  Ambulance,
  Cross,
  Scaling,
  Drill
} from 'lucide-react';
import BASE_URL from '../config';

const PatientStatisticsDisplay = () => {
  const [statistics, setStatistics] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const componentRef = useRef(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/statistics`);
        setStatistics(response.data);
      } catch (error) {
        console.error('Error fetching patient statistics:', error);
      }
    };

    fetchStatistics();

    // Click outside handler
    const handleClickOutside = (event) => {
      if (componentRef.current && 
          !componentRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const patientCategories = [
    { key: 'total_patients_cumulative', label: 'Total Patients (Cumulative)', icon: Users },
    { key: 'total_patients_current_month', label: 'Total Patients (Current Month)', icon: Users },
    { key: 'home_care_patients', label: 'Home Care Patients', icon: Home },
    { key: 'dropout_patients', label: 'Dropout Patients', icon: Ambulance },
    { key: 'physiotherapy_patients', label: 'Physiotherapy Patients', icon: Users },
    { key: 'psychiatric_patients', label: 'Psychiatric Patients', icon: Brain },
    { key: 'psychiatric_dropout_patients', label: 'Psychiatric Dropout Patients', icon: Brain },
    { key: 'psychiatric_transfer_out', label: 'Psychiatric Transfer Out', icon: Brain },
    { key: 'transfer_out_patients', label: 'Transfer Out Patients', icon: Ambulance },
    { key: 'care_comprises', label: 'Care Comprises', icon: Stethoscope },
    { key: 'active_psychiatric_patients', label: 'Active Psychiatric Patients', icon: Brain },
    { key: 'cancer_patients', label: 'Cancer Patients', icon: Users },
    { key: 'peripheral_vascular_disease', label: 'Peripheral Vascular Disease', icon: Scaling },
    { key: 'chronic_kidney_disease', label: 'Chronic Kidney Disease', icon: Stethoscope },
    { key: 'cerebrovascular_accident', label: 'Cerebrovascular Accident', icon: ActivityIcon },
    { key: 'paraplegia_patients', label: 'Paraplegia Patients', icon: Users },
    { key: 'other_patients', label: 'Other Patients', icon: PlusCircle },
    { key: 'total_deaths_cumulative', label: 'Total Deaths (Cumulative)', icon: Cross },
    { key: 'patients_above_80', label: 'Patients Above 80', icon: Drill },
    { key: 'patients_below_18', label: 'Patients Below 18', icon: Drill },
  ];

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(13, 148, 136, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #0d9488, #0f766e);
      border-radius: 10px;
      transition: all 0.3s ease;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #0f766e, #0d9488);
    }
  `;

  if (!statistics) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div 
        ref={componentRef}
        className="bg-teal-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group relative z-50 w-full"
      >
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div>
            <div className="text-4xl font-bold text-teal-600 mb-2 flex items-center">
              <Users className="mr-2 text-teal-500" size={32} />
              {statistics.total_patients_cumulative || 500}+
            </div>
            <div className="text-gray-600">Patients Supported</div>
          </div>
          {showDetails ? (
            <ChevronUp className="text-teal-600 group-hover:text-teal-800" size={24} />
          ) : (
            <ChevronDown className="text-teal-600 group-hover:text-teal-800" size={24} />
          )}
        </div>

        {showDetails && (
          <div className="absolute left-0 w-[calc(100%+3rem)] mt-2 -ml-6 px-6">
            <div className="bg-white p-4 rounded-lg shadow-md max-h-[60vh] overflow-y-auto custom-scrollbar">
              <h4 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                <Stethoscope className="mr-2 text-teal-500" size={20} />
                Patient Statistics - {statistics.date ? 
                  new Date(statistics.date).toLocaleString('default', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 
                  'Current Period'
                }
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {patientCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div 
                      key={category.key} 
                      className="flex items-center justify-between border-b py-2 hover:bg-teal-50 rounded px-2 transition-colors"
                    >
                      <div className="flex items-center">
                        <Icon className="mr-2 text-teal-500" size={16} />
                        <span className="text-gray-700">{category.label}</span>
                      </div>
                      <span className="font-medium text-teal-600">
                        {statistics[category.key] || 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PatientStatisticsDisplay;