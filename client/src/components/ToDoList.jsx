import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, AlertCircle, Clock, Users,  Plus, Trash2, Edit2, ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ScrollToBottomButton from './ScrollToBottomButton';
import ConfirmDialog from './ConfrmDialog'
import TaskModal from './TaskModel';
import BASE_URL from '../config';

const taskService = {
  async getTasks() {
    const response = await fetch(`${BASE_URL}/api/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },
  async getMembers(role) {
    const roleEndpoints = {
      'Volunteer': '/api/volunteers',
      'Caregiver': '/api/caregivers',
      'Medical Professional': '/api/medical-professionals'
    };
    
    const endpoint = roleEndpoints[role];
    if (!endpoint) return [];
    
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Failed to fetch ${role}s`);
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async updateTask(id, taskData) {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async deleteTask(id) {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  },

async toggleTaskStatus(id) {
  try {
    console.log(`Attempting to toggle status for task ${id}`);
    const response = await fetch(`${BASE_URL}/api/tasks/${id}/status`, { 
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }
    
    const updatedTask = await response.json();
    console.log('Parsed updated task:', updatedTask);
    return updatedTask;
  } catch (error) {
    console.error('Detailed error in toggleTaskStatus:', error);
    throw error;
   }
 } 
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('priority');
  const navigate = useNavigate();
  const [showTaskConfirm, setShowTaskConfirm] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'medical',
    priority: 'medium',
    assignedTo: '', // This will store the role
    assignedMember: '', // This will store the member name
    dueDate: '',
    dueTime: ''
  });


  const categories = {
    medical: { label: 'Medical Care', color: 'bg-red-100 text-red-800' },
    medication: { label: 'Medication', color: 'bg-blue-100 text-blue-800' },
    supplies: { label: 'Supplies', color: 'bg-green-100 text-green-800' },
    followup: { label: 'Follow-up', color: 'bg-purple-100 text-purple-800' },
    social: { label: 'Social Support', color: 'bg-yellow-100 text-yellow-800' }
  };

  const priorities = {
    high: { label: 'High', icon: AlertCircle, color: 'text-red-500' },
    medium: { label: 'Medium', icon: Clock, color: 'text-yellow-500' },
    low: { label: 'Low', icon: Circle, color: 'text-blue-500' }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await taskService.getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTasks();
  }, []);

   // New effect to fetch members when role changes
   useEffect(() => {
    const fetchMembers = async () => {
      if (formData.assignedTo) {
        try {
          const members = await taskService.getMembers(formData.assignedTo);
          setAvailableMembers(members);
        } catch (error) {
          setError(error.message);
        }
      } else {
        setAvailableMembers([]);
      }
    };

    fetchMembers();
  }, [formData.assignedTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...formData };
      
      if (editingTask) {
        const updatedTask = await taskService.updateTask(editingTask.id, taskData);
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        setSuccess('Task updated successfully!');
      } else {
        const newTask = await taskService.createTask(taskData);
        setTasks([...tasks, newTask]);
        setSuccess('Task added successfully!');
      }
      
      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        category: 'medical',
        priority: 'medium',
        assignedTo: '',
        assignedMember: '',
        dueDate: '',
        dueTime: ''
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      setSuccess('Task status updated successfully!');
      console.log(`Attempting to toggle status for task ${taskId}`);
      const updatedTask = await taskService.toggleTaskStatus(taskId);
      console.log('Updated task:', updatedTask);
      
      // Ensure the task status is being updated in the state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: updatedTask.status } : task
      ));
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error toggling task status:', error.message);
      setError(`Failed to update task status: ${error.message}`);
    }
  };

  const deleteTask = async (taskId) => {
    setDeleteTaskId(taskId);
    setShowTaskConfirm(true);
   };
   
   const confirmTaskDelete = async () => {
    try {
      await taskService.deleteTask(deleteTaskId);
      setTasks(tasks.filter(task => task.id !== deleteTaskId));
      setSuccess('Task deleted successfully!');
    } catch (error) {
      setError(error.message);
    }
    setShowTaskConfirm(false);
   };
   

  const startEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      assignedTo: task.assigned_to || '',
      assignedMember: task.assigned_member || '',
      dueDate: formData.dueDate ? formData.dueDate : null, // Set to null if empty
      dueTime: formData.dueTime ? formData.dueTime : null, // Set to null if empty
    });
    setIsModalOpen(true);
  };

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks;
    
    if (filter !== 'all') {
      filteredTasks = tasks.filter(task => task.status === filter);
    }

    return filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      switch (sort) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          return new Date(a.due_date) - new Date(b.due_date);
        default:
          return 0;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-teal-600" />
              <Link to="/admin/dashboard" className="text-gray-800">
              <h1 className="text-xl font-semibold tracking-tight text-gray-800">
                Task Management
              </h1>
              </Link>
            </div>
            
             {/* Add task Button for Large Screens */}
                        <div className="hidden sm:block">
                        <button
                onClick={() => {
                  setEditingTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'medical',
                    priority: 'medium',
                    assignedTo: '',
                    dueDate: '',
                    dueTime: ''
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
              >
                <Plus size={18} />
                <span>Add Task</span>
              </button>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <select
              className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
          </div>
        </div>


      {/* alert content */}
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
{/* Add task Button for Mobile */}
<div className="sm:hidden fixed bottom-4 right-4 z-50">
<button
                onClick={() => {
                  setEditingTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'medical',
                    priority: 'medium',
                    assignedTo: '',
                    dueDate: '',
                    dueTime: ''
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-teal-600 space-x-2 text-white rounded-full hover:bg-teal-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
              >
                <Plus size={18} />
              </button>
                </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md">
      {getFilteredAndSortedTasks().length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Users size={48} className="mb-4 text-gray-400" />
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="overflow-x-auto space-y-4 p-4">
          {getFilteredAndSortedTasks().map((task) => (
            <div
              key={task.id}
              className="border-b last:border-b-0 hover:bg-gray-50 transition-colors rounded-lg shadow-sm bg-white"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center px-4 py-4">
                <div className="flex-1 flex items-start gap-4 w-full">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-1"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <h3 className={`font-medium break-words ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => startEditTask(task)}
                          className="text-teal-600 hover:text-teal-800 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-1 break-words">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${categories[task.category].color} shrink-0`}>
                        {categories[task.category].label}
                      </span>
                      
                      <span className="flex items-center text-xs text-gray-600 shrink-0">
                        {React.createElement(priorities[task.priority].icon, {
                          className: `w-4 h-4 mr-1 ${priorities[task.priority].color}`
                        })}
                        {priorities[task.priority].label}
                      </span>
                      
                      {task.assigned_to && (
                        <span className="flex items-center text-xs text-gray-600 shrink-0">
                          <Users className="w-4 h-4 mr-1" />
                          {task.assigned_to} {task.assigned_member && `- ${task.assigned_member}`}
                        </span>
                      )}
                      
                      {task.due_date && (
                        <span className="text-xs text-gray-600 shrink-0">
                          Due: {new Date(task.due_date).toLocaleDateString()} {task.due_time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
          {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
      <ConfirmDialog
 isOpen={showTaskConfirm}
 title="Delete Task"
 message="Are you sure you want to delete this task?"
 onConfirm={confirmTaskDelete}
 onCancel={() => setShowTaskConfirm(false)}
/>

{isModalOpen && (
  <TaskModal
    isOpen={isModalOpen}
    onClose={() => {
      setIsModalOpen(false);
      setEditingTask(null);
    }}
    onSubmit={handleSubmit}
    editingTask={editingTask}
    formData={formData}
    setFormData={setFormData}
    availableMembers={availableMembers}
  />
)}
      <ScrollToBottomButton/>
    </div>
  );
};

export default Tasks; 