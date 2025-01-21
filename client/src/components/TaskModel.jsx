import React from 'react';
import { 
  X, Heart, User, Calendar, AlertCircle, Clock, BookOpen, Users
} from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSubmit, editingTask, formData, setFormData, availableMembers }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
    low: { label: 'Low', icon: Clock, color: 'text-blue-500' }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Close button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div className="sm:flex sm:items-start mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingTask ? 'Update task details' : 'Fill out the details for a new task'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <span>Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <span>Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Heart className="h-5 w-5 text-teal-600" />
                    <span>Category</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {Object.entries(categories).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <AlertCircle className="h-5 w-5 text-teal-600" />
                    <span>Priority</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {Object.entries(priorities).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Users className="h-5 w-5 text-teal-600" />
                    <span>Assigned Role</span>
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select a role</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Medical Professional">Medical Professional</option>
                  </select>
                </div>

                {formData.assignedTo && (
                  <div>
                    <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                      <User className="h-5 w-5 text-teal-600" />
                      <span>Assigned Member</span>
                    </label>
                    <select
                      name="assignedMember"
                      value={formData.assignedMember}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select a member</option>
                      {availableMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <span>Due Date</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                    <Clock className="h-5 w-5 text-teal-600" />
                    <span>Due Time</span>
                  </label>
                  <input
                    type="time"
                    name="dueTime"
                    value={formData.dueTime}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-full border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;