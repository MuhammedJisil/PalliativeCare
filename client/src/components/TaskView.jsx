// TasksView.js
import React from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';

const TaskFilters = ({ dueDateSort, setDueDateSort, priorityFilter, setPriorityFilter, statusFilter, setStatusFilter }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
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
  );
};



const TaskCard = ({ task, toggleTaskStatus, isLoading, expandedTasks, toggleDescription }) => {
    return (
      <div className={`bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        task.status === 'completed' ? 'bg-gray-50' : ''
      }`}>
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
                {/* Content Container */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out
                  ${expandedTasks[task.id] ? 'max-h-screen' : 'max-h-12'}`
                }>
                  {/* Text Content */}
                  <div className="text-sm text-gray-600">
                    {task.description || ''}
                  </div>
                </div>
  
                {/* Show More/Less Button */}
                {(task.description?.length || 0) > 100 && (
                  <button 
                    onClick={() => toggleDescription(task.id)}
                    className="text-teal-600 hover:text-teal-700 text-xs mt-2 font-medium"
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
    );
  };
  


const TasksView = ({ 
  detailData, 
  toggleTaskStatus, 
  isLoading, 
  priorityFilter, 
  setPriorityFilter,
  dueDateSort, 
  setDueDateSort,
  statusFilter, 
  setStatusFilter,
  expandedTasks,
  toggleDescription
}) => {
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

  return (
    <div className="space-y-4">
      <TaskFilters 
        dueDateSort={dueDateSort}
        setDueDateSort={setDueDateSort}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getFilteredAndSortedTasks().map((task) => (
          <TaskCard 
            key={task.id}
            task={task}
            toggleTaskStatus={toggleTaskStatus}
            isLoading={isLoading}
            expandedTasks={expandedTasks}
            toggleDescription={toggleDescription}
          />
        ))}
      </div>
    </div>
  );
};

export default TasksView;