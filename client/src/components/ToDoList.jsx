import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, AlertCircle, Clock, Users, 
  ChevronDown, ChevronUp, Plus, Trash2, Edit2 
} from 'lucide-react';

const taskService = {
  async getTasks() {
    const response = await fetch('http://localhost:5000/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async updateTask(id, taskData) {
    const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async deleteTask(id) {
    const response = await fetch(`http://localhost:5000/api/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  },

async toggleTaskStatus(id) {
  try {
    console.log(`Attempting to toggle status for task ${id}`);
    const response = await fetch(`http://localhost:5000/api/tasks/${id}/status`, { 
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
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('priority');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'medical',
    priority: 'medium',
    assignedTo: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...formData };
      if (editingTask) {
        const updatedTask = await taskService.updateTask(editingTask.id, taskData);
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      } else {
        const newTask = await taskService.createTask(taskData);
        setTasks([...tasks, newTask]);
      }
      setIsModalOpen(false);
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
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
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
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      setError(error.message);
    }
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      assignedTo: task.assigned_to || '',
      dueDate: task.due_date || '',
      dueTime: task.due_time || ''
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {getFilteredAndSortedTasks().map((task) => (
            <div 
              key={task.id}
              className={`bg-white rounded-lg shadow-sm p-4 transition-all ${
                task.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
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

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => startEditTask(task)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`px-2 py-1 rounded-md text-xs ${categories[task.category].color}`}>
                      {categories[task.category].label}
                    </span>
                    <span className="flex items-center text-xs">
                      {React.createElement(priorities[task.priority].icon, {
                        className: `w-4 h-4 mr-1 ${priorities[task.priority].color}`
                      })}
                      {priorities[task.priority].label}
                    </span>
                    {task.assigned_to && (
                      <span className="flex items-center text-xs text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {task.assigned_to}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-gray-600">
                        Due: {new Date(task.due_date).toLocaleDateString()} {task.due_time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      {Object.entries(categories).map(([value, { label }]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      required
                    >
                      {Object.entries(priorities).map(([value, { label }]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Assigned To</label>
                  <input
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    placeholder="Enter name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Due Time</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Tasks; 