import React, { useState, useEffect } from 'react';
import { Users, FileText, X, Phone, MapPin, Calendar, UserPlus, ChevronDown, ChevronUp, ArrowLeft, CheckCircle, Circle, CalendarDays, ListFilter, Clock } from 'lucide-react';
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

  const [selectedAssignment, setSelectedAssignment] = useState(null);
const [patientData, setPatientData] = useState(null);
const [helperData, setHelperData] = useState(null);
const [healthStatus, setHealthStatus] = useState(null);
const [medicalHistory, setMedicalHistory] = useState(null);





// Add these functions before the render methods
const fetchAssignmentDetails = async (assignment) => {
  try {
    // Fetch patient data (including health status and medical history) and helper data
    const [patientRes, helperRes] = await Promise.all([
      fetch(`http://localhost:5000/api/patients/${assignment.patient_id}`),
      fetch(`http://localhost:5000/api/${assignment.helper_type}s/${assignment.helper_id}`)
    ]);

    const patientData = await patientRes.json();
    setPatientData(patientData);
    // Set health status and medical history from patient data
    setHealthStatus(patientData.healthStatus);
    setMedicalHistory(patientData.medicalHistory);
    
    setHelperData(await helperRes.json());
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
        // Apply both priority and status filters
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
            {/* Left side filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <select
                value={dueDateSort}
                onChange={(e) => setDueDateSort(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="asc">Due Date (Earliest First)</option>
                <option value="desc">Due Date (Latest First)</option>
              </select>
            </div>
            
            {/* Right side status filter */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending Tasks</option>
                <option value="completed">Completed Tasks</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto space-y-4">
            {getFilteredAndSortedTasks().map((task) => (
              <div
                key={task.id}
                className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors rounded-lg shadow-sm bg-white ${
                  task.status === 'completed' ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center px-6 py-4">
                  <div className="flex-1 flex items-start gap-4">
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      disabled={isLoading}
                      className="disabled:opacity-50"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        task.status === 'completed' ? 'text-gray-500 line-through' : ''
                      }`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
          {schedule.notes}
        </p>
      </div>
    </div>
    {!expandedNotes[schedule.id] && schedule.notes.length > 100 && (
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
      
      {selectedAssignment && patientData && helperData && healthStatus && medicalHistory && (
  <AssignmentDetails
    selectedAssignment={selectedAssignment}
    patientData={patientData}
    helperData={helperData}
    healthStatus={healthStatus}
    medicalHistory={medicalHistory}
    onClose={() => {
      setSelectedAssignment(null);
      setPatientData(null);
      setHelperData(null);
      setHealthStatus(null);
      setMedicalHistory(null);
    }}
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
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        {views[currentView]}
      </div>
    );
  };

  const renderDashboard = () => (
    <>
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        {['volunteer', 'caregiver', 'medical'].map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === type
                ? 'bg-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getMetrics(activeTab).map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.title}
              onClick={metric.onClick}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-6 h-6 text-gray-400" />
                <span className="text-2xl font-semibold">{metric.value}</span>
              </div>
              <h3 className="text-sm text-gray-500">{metric.title}</h3>
            </button>
          )
        })}
      </div>
    </>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      {currentView === 'dashboard' ? renderDashboard() : renderDetailView()}
    </div>
  );
};

export default VCMDashboard;