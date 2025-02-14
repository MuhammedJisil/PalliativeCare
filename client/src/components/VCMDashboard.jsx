import React, { useState, useEffect } from 'react';
import { 
  Users,  
  Activity, 
  Calendar,  
  ArrowLeft, 
  HeartHandshake, 
  Stethoscope,
  ClipboardList,
  CalendarClock,
  UserCheck,
  ListTodo,
  CalendarDays,
  UsersRound,
  AlertCircle,
  Clipboard,
  HeartPulse,
  CheckCircle
} from 'lucide-react';
import AssignmentDetails from './AssignmentDetails';
import TasksView from './TaskView';
import ScheduleView from './ScheduleView';
import TeamView from './TeamView';
import AssignmentCard from './AssignmentCard'
import LogoutButton from './LogoutButton';
import BASE_URL from '../config';


const VCMDashboard = ({ userType = 'volunteer' }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState(userType);
  const [currentView, setCurrentView] = useState('dashboard');
  const [detailData, setDetailData] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dueDateSort, setDueDateSort] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [sortType, setSortType] = useState('all');
  const [expandedNotes, setExpandedNotes] = useState({});
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [expandedTasks, setExpandedTasks] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [helperData, setHelperData] = useState(null);
  const [healthStatus, setHealthStatus] = useState([]);  // Initialize as empty array
  const [medicalHistory, setMedicalHistory] = useState('');  // Initialize as empty string





const fetchAssignmentDetails = async (assignment) => {
  try {
    // First, set the selected assignment
    setSelectedAssignment(assignment);
    
    // Then fetch the data
    const [patientRes, helperRes] = await Promise.all([
      fetch(`${BASE_URL}/api/patients/${assignment.patient_id}`),
      fetch(`${BASE_URL}/api/helpers/${assignment.helper_type}s/${assignment.helper_id}`)
    ]);

    if (!patientRes.ok || !helperRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const patientData = await patientRes.json();
    const helperData = await helperRes.json();

    // Update all states at once
    setPatientData(patientData);
    setHealthStatus(patientData.healthStatus || []); // Use empty array as fallback
    setMedicalHistory(patientData.medicalHistory || ''); // Use empty string as fallback
    setHelperData(helperData);

    console.log('Fetched Data:', {
      patientData,
      helperData,
      healthStatus: patientData.health_status,
      medicalHistory: patientData.medical_history
    });

  } catch (error) {
    console.error('Error fetching assignment details:', error);
  }
};




  useEffect(() => {
    fetchDashboardData(activeTab);
  }, [activeTab]);

  const fetchDashboardData = async (type) => {
    try {
      const response = await fetch(`${BASE_URL}/api/dashboard/${type}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getMetrics = (type) => {
    if (!dashboardData) return [];
    
    const metricsByType = {
      volunteer: [
        { 
          title: 'Assisted Patients', 
          value: dashboardData.assignedPatients || '0', 
          icon: HeartHandshake,
          onClick: () => fetchDetailData('assignments')
        },
        { 
          title: 'Support Tasks', 
          value: dashboardData.pendingTasks || '0', 
          icon: ClipboardList,
          onClick: () => fetchDetailData('tasks')
        },
        { 
          title: 'Schedules', 
          value: dashboardData.scheduledTasks || '0', 
          icon: CalendarClock,
          onClick: () => fetchDetailData('schedules')
        },
        { 
          title: 'Active Volunteers', 
          value: dashboardData.teamMembers || '0', 
          icon: UserCheck,
          onClick: () => fetchDetailData('team')
        }
      ],
      caregiver: [
        { 
          title: 'Care Recipients', 
          value: dashboardData.assignedPatients || '0', 
          icon: Users,
          onClick: () => fetchDetailData('assignments')
        },
        { 
          title: 'Care Tasks', 
          value: dashboardData.pendingTasks || '0', 
          icon: ListTodo,
          onClick: () => fetchDetailData('tasks')
        },
        { 
          title: 'Care Schedule', 
          value: dashboardData.scheduledTasks || '0', 
          icon: CalendarDays,
          onClick: () => fetchDetailData('schedules')
        },
        { 
          title: 'Active Caregivers', 
          value: dashboardData.teamMembers || '0', 
          icon: UsersRound,
          onClick: () => fetchDetailData('team')
        }
      ],
      medical: [
        { 
          title: 'Patient Cases', 
          value: dashboardData.assignedPatients || '0', 
          icon: HeartPulse,
          onClick: () => fetchDetailData('assignments')
        },
        { 
          title: 'Medical Tasks', 
          value: dashboardData.pendingTasks || '0', 
          icon: Clipboard,
          onClick: () => fetchDetailData('tasks')
        },
        { 
          title: 'Patient Rounds', 
          value: dashboardData.scheduledTasks || '0', 
          icon: Calendar,
          onClick: () => fetchDetailData('schedules')
        },
        { 
          title: 'Active Healthcare Providers', 
          value: dashboardData.teamMembers || '0', 
          icon: Stethoscope,
          onClick: () => fetchDetailData('team')
        }
      ]
    };
    
    return metricsByType[type] || [];
  };



  const fetchDetailData = async (view) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/${view}/${activeTab}`);
      const data = await response.json();
      setDetailData(Array.isArray(data) ? data : []);
      setCurrentView(view);
    } catch (error) {
      console.error(`Error fetching ${view} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

    
    

  // Updated toggle function to use the provided backend endpoint
  const toggleTaskStatus = async (taskId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task status');
      }

      const updatedTask = await response.json();
      
      setDetailData(prevData =>
        prevData.map(task =>
          task.id === taskId ? {...task, status: updatedTask.status} : task
        )
      );

      setSuccess('Task status updated successfully');
      fetchDashboardData(activeTab);
    } catch (error) {
      console.error('Error toggling task status:', error);
      setError(error.message || 'Failed to update task status');
    } finally {
      setIsLoading(false);
      // Clear alerts after 3 seconds
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
    }
  };




const toggleDescription = (taskId) => {
  setExpandedTasks(prev => ({
    ...prev,
    [taskId]: !prev[taskId]
  }));
};

  // New function to toggle note expansion
  const toggleNoteExpansion = (scheduleId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [scheduleId]: !prev[scheduleId]
    }));
  };

  const renderDetailView = () => {
    const NoDataMessage = ({ message }) => (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 text-lg font-medium">{message}</p>
      </div>
    );

    const views = {
      tasks: (
        <>
          {detailData.length > 0 ? (
            <TasksView
              detailData={detailData}
              toggleTaskStatus={toggleTaskStatus}
              isLoading={isLoading}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              dueDateSort={dueDateSort}
              setDueDateSort={setDueDateSort}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              expandedTasks={expandedTasks}
              toggleDescription={toggleDescription}
            />
          ) : (
            <NoDataMessage message="No tasks assigned at the moment" />
          )}
        </>
      ),
      schedules: (
        <ScheduleView
          detailData={detailData}
          sortType={sortType}
          setSortType={setSortType}
          expandedNotes={expandedNotes}
          toggleNoteExpansion={toggleNoteExpansion}
        />
      ),
      assignments: (
        <div className="flex flex-wrap gap-4">
          {detailData.length > 0 ? (
            <>
              {detailData.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    fetchAssignmentDetails(assignment);
                  }}
                />
              ))}
              {selectedAssignment && (
                <AssignmentDetails
                  selectedAssignment={selectedAssignment}
                  patientData={patientData}
                  helperData={helperData}
                  healthStatus={healthStatus}
                  medicalHistory={medicalHistory}
                  onClose={() => setSelectedAssignment(null)}
                  onUpdate={() => fetchAssignmentDetails(selectedAssignment)}
                />
              )}
            </>
          ) : (
            <NoDataMessage message="No patients assigned currently" />
          )}
        </div>
      ),
      team: (
        <>
          {detailData.length > 0 ? (
            <TeamView detailData={detailData} />
          ) : (
            <NoDataMessage message="No team members available" />
          )}
        </>
      )
    };

    return (
      <div className="space-y-4">
        <div className="mb-8">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
        {views[currentView]}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="bg-gray-50">
      <div className="container mx-auto">
       
  
        {/* Tabs */}
        <div className="bg-gray-100 rounded-lg p-1 mb-8 flex space-x-1 max-w-md">
          {['volunteer', 'caregiver', 'medical'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`
                flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${activeTab === type 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
  
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getMetrics(activeTab).map((metric, index) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.title}
                onClick={metric.onClick}
                className="bg-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg p-6"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-teal-50 rounded-lg p-3">
                    <Icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {metric.value}
                  </h2>
                </div>
                <p className="text-gray-600">
                  {metric.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
  <div className="flex items-center space-x-2">
    <Activity className="h-8 w-8 text-teal-600" />
    <h1 className="text-2xl font-semibold text-gray-800">
      Care Management Dashboard
    </h1>
  </div>
  <LogoutButton userType="vcm" />
</div>
      {currentView === 'dashboard' ? renderDashboard() : renderDetailView()}

      {/* Alert Overlay */}
      {(error || success) && (
        <div 
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => {
            setError(null);
            setSuccess(null);
          }}
        >
          <div 
            className="fixed top-4 right-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium">{success}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VCMDashboard;