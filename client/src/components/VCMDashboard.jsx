import React, { useState, useEffect } from 'react';
import { Users, FileText,  Activity,  Calendar, UserPlus, ArrowLeft } from 'lucide-react';
import AssignmentDetails from './AssignmentDetails';
import TasksView from './TaskView';
import ScheduleView from './ScheduleView';
import TeamView from './TeamView';


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
      fetch(`http://localhost:5000/api/patients/${assignment.patient_id}`),
      fetch(`http://localhost:5000/api/${assignment.helper_type}s/${assignment.helper_id}`)
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
      const response = await fetch(`http://localhost:5000/api/dashboard/${type}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getMetrics = (type) => {
    if (!dashboardData) return [];
    
    return [
      { 
        title: 'Assigned Patients', 
        value: dashboardData.assignedPatients || '0', 
        icon: Users,
        onClick: () => fetchDetailData('assignments')
      },
      { 
        title: 'Tasks Pending', 
        value: dashboardData.pendingTasks || '0', 
        icon: FileText,
        onClick: () => fetchDetailData('tasks')
      },
      { 
        title: 'Schedules', 
        value: dashboardData.scheduledTasks || '0', 
        icon: Calendar,
        onClick: () => fetchDetailData('schedules')
      },
      { 
        title: 'Team', 
        value: dashboardData.teamMembers || '0', 
        icon: UserPlus,
        onClick: () => fetchDetailData('team')
      }
    ];
  };


  const fetchDetailData = async (view) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/${view}/${activeTab}`);
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
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
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
      
      // Update the local state with the response from the server
      setDetailData(prevData =>
        prevData.map(task =>
          task.id === taskId ? {...task, status: updatedTask.status} : task
        )
      );

      // Optionally refresh dashboard data if needed
      fetchDashboardData(activeTab);
    } catch (error) {
      console.error('Error toggling task status:', error);
      // You might want to add error handling UI here
    } finally {
      setIsLoading(false);
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
    const views = {
      tasks: (
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
        <div className="space-y-4">
  {detailData.map((assignment) => (
    <div
      key={assignment.id}
      className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        setSelectedAssignment(assignment);
        fetchAssignmentDetails(assignment);
      }}
    >
      <h3 className="font-medium">{assignment.patient_name}</h3>
      <div className="mt-2 space-y-1 text-sm">
        <div>Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}</div>
        <div>Status: {assignment.status}</div>
      </div>
    </div>
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
        </div>
      ),
      team: <TeamView detailData={detailData} />
    };

    return (
      <div className="space-y-4">
        {/* Back button with improved design */}
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
       <div className="flex items-center space-x-2 mb-8">
          <Activity className="h-8 w-8 text-teal-600" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Care Management Dashboard
          </h1>
        </div>
      {currentView === 'dashboard' ? renderDashboard() : renderDetailView()}
    </div>
  );
};

export default VCMDashboard;