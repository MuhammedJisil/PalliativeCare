import React, { useState, useEffect } from 'react';
import { Users, FileText, X, Activity, MapPin, Calendar, UserPlus, ChevronDown, ChevronUp, ArrowLeft, CheckCircle, Circle, CalendarDays, ListFilter, Clock } from 'lucide-react';
import AssignmentDetails from './AssignmentDetails';
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

    // Helper function to check if two dates are the same day
    const isSameDay = (date1, date2) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };
  
    // Sorting function for schedules
    const getSortedSchedules = () => {
      const currentDate = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(currentDate.getDate() + 7);
  
      const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfWeek = new Date(oneWeekFromNow.setHours(23, 59, 59, 999));
  
      let sortedSchedules = [...detailData];
  
      try {
        switch (sortType) {
          case 'today':
            sortedSchedules = sortedSchedules.filter(schedule => {
              const scheduleDate = new Date(schedule.visit_date);
              return isSameDay(scheduleDate, currentDate);
            });
            break;
  
          case 'week':
            sortedSchedules = sortedSchedules.filter(schedule => {
              const scheduleDate = new Date(schedule.visit_date);
              scheduleDate.setHours(0, 0, 0, 0);
              return scheduleDate >= startOfToday && scheduleDate <= endOfWeek;
            });
            break;
  
          default:
            break;
        }
  
        return sortedSchedules.sort((a, b) => {
          const dateA = new Date(`${a.visit_date} ${a.visit_time}`);
          const dateB = new Date(`${b.visit_date} ${b.visit_time}`);
          return dateA - dateB;
        });
      } catch (error) {
        console.error('Sorting error:', error);
        return detailData;
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

  const getFilteredAndSortedTasks = () => {
    return detailData
      .filter(task => {
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return dueDateSort === 'asc' ? dateA - dateB : dateB - dateA;
      });
  };

  // Add this function to handle description toggle:
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
        <div className="space-y-4">
      
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Sort dropdown */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={dueDateSort}
                  onChange={(e) => setDueDateSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="asc">Due Date (Earliest First)</option>
                  <option value="desc">Due Date (Latest First)</option>
                </select>
              </div>
      
              {/* Priority filter */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
      
              {/* Status filter */}
              <div className="flex-1 min-w-[200px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending Tasks</option>
                  <option value="completed">Completed Tasks</option>
                </select>
              </div>
            </div>
          </div>
      
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {getFilteredAndSortedTasks().map((task) => (
    <div
      key={task.id}
      className={`bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        task.status === 'completed' ? 'bg-gray-50' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => toggleTaskStatus(task.id)}
            disabled={isLoading}
            className="mt-1 disabled:opacity-50 hover:scale-110 transition-transform"
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-teal-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 hover:text-teal-500" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            <div className="mt-1">
            <p className={`text-sm text-gray-600 ${
  expandedTasks[task.id] ? '' : 'line-clamp-2'
}`}>
  {task.description || ''}
</p>

              {(task.description?.length || 0) > 100 && (
  <button 
    onClick={() => toggleDescription(task.id)}
    className="text-teal-600 hover:text-teal-700 text-xs mt-1 font-medium"
  >
    {expandedTasks[task.id] ? 'Show Less' : 'Show More'}
  </button>
)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                task.status === 'completed' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
        </div>
      ),
      schedules: (
        <div className="space-y-4">
          {/* Schedule Filter Header */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <h2 className="text-lg font-medium text-gray-700">
                {sortType === 'today' 
                  ? `Today's Schedule (${new Date().toLocaleDateString()})` 
                  : sortType === 'week' 
                    ? 'This Week\'s Schedule' 
                    : 'All Schedules'}
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSortType('today')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    sortType === 'today'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 inline-block mr-2" />
                  Today
                </button>
                <button
                  onClick={() => setSortType('week')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    sortType === 'week'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline-block mr-2" />
                  This Week
                </button>
                <button
                  onClick={() => setSortType('all')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    sortType === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ListFilter className="w-4 h-4 inline-block mr-2" />
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSortedSchedules().map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{schedule.patient_name}</h3>
                    <p className="text-sm text-gray-500">Member: {schedule.member_name}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800">
                    {schedule.visit_type}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(schedule.visit_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{schedule.visit_time}</span>
                  </div>
                  {schedule.notes && (
  <div className="mt-4">
    <div 
      className="flex items-center justify-between cursor-pointer text-gray-600 hover:text-gray-800"
      onClick={() => toggleNoteExpansion(schedule.id)}
    >
      <span className="font-medium">Notes</span>
      {expandedNotes[schedule.id] ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </div>
    <div
      className={`mt-2 transition-all duration-200 ${
        expandedNotes[schedule.id] ? 'max-h-full' : 'max-h-20 overflow-hidden'
      }`}
    >
      <div className="p-3 bg-gray-50 rounded-md">
      <p className="text-sm text-gray-600 whitespace-pre-wrap">
  {schedule.notes || ''}
</p>
      </div>
    </div>
    {!expandedNotes[schedule.id] && (schedule.notes?.length || 0) > 100 && (
      <div className="text-center mt-2">
        <button 
          className="text-teal-600 hover:text-teal-700 text-sm"
          onClick={() => toggleNoteExpansion(schedule.id)}
        >
          Show More
        </button>
      </div>
    )}
  </div>
)}

                  <div className="text-xs text-gray-400 mt-4">
                    Created: {new Date(schedule.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      team: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detailData.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm border p-6">
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
          ))}
        </div>
      )
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