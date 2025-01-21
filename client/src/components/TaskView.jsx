import React from 'react';
import { Calendar, CheckCircle, Circle, ChevronDown, ChevronUp, Users } from 'lucide-react';

const TaskFilters = ({ dueDateSort, setDueDateSort, priorityFilter, setPriorityFilter, statusFilter, setStatusFilter }) => {
  const selectClass = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-700";
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-[200px]">
          <select
            value={dueDateSort}
            onChange={(e) => setDueDateSort(e.target.value)}
            className={selectClass}
          >
            <option value="asc">Due Date (Earliest First)</option>
            <option value="desc">Due Date (Latest First)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={selectClass}
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
            className={selectClass}
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
    <div className={`bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
      task.status === 'completed' ? 'bg-gray-50' : ''
    }`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => toggleTaskStatus(task.id)}
            disabled={isLoading}
            className="mt-1 disabled:opacity-50 hover:scale-110 transition-transform flex-shrink-0"
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-6 h-6 text-teal-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300 hover:text-teal-500" />
            )}
          </button>
          
          <div className="flex-1 w-full min-w-0">
            <h3 className={`text-lg font-medium break-all hyphens-auto ${
              task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <div className="mt-4">
                <button 
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => toggleDescription(task.id)}
                >
                  <span className="font-medium text-gray-700">Description</span>
                  {expandedTasks[task.id] ? (
                    <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  )}
                </button>
                
                <div className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out
                  ${expandedTasks[task.id] ? 'max-h-96' : 'max-h-20'}`
                }>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-full overflow-hidden">
                      <p className="text-gray-600 text-sm break-all hyphens-auto whitespace-pre-line">
                        {task.description || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {!expandedTasks[task.id] && (task.description?.length || 0) > 100 && (
                  <button 
                    className="w-full text-teal-600 hover:text-teal-700 text-sm font-medium mt-2 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded p-1"
                    onClick={() => toggleDescription(task.id)}
                  >
                    Show More
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
              {task.assigned_to && (
                <span className="inline-flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                  {task.assigned_to} {task.assigned_member && `- ${task.assigned_member}`}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
    <div className="space-y-6">
      <TaskFilters 
        dueDateSort={dueDateSort}
        setDueDateSort={setDueDateSort}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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