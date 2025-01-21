import React from 'react';
import { Calendar, CalendarDays, Clock, ChevronUp, ChevronDown, ListFilter, Calendar as CalendarIcon, User, UserCircle } from 'lucide-react';

// Add time formatting helper functions
const formatTo12Hour = (timeString) => {
  try {
    // Handle different time string formats
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Time formatting error:', error);
    return timeString;
  }
};

const formatDateTime = (dateTimeString) => {
  try {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${formattedDate}, ${formattedTime}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return dateTimeString;
  }
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
    <CalendarIcon className="w-12 h-12 text-teal-500 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules Found</h3>
    <p className="text-gray-500 text-center">There are no scheduled appointments for the selected time period.</p>
  </div>
);

const ScheduleHeader = ({ sortType, setSortType, totalSchedules }) => {
  if (totalSchedules === 0) return null;

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl font-medium text-gray-800 flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-teal-600" />
          {sortType === 'today' 
            ? `Today's Schedule (${new Date().toLocaleDateString()})` 
            : sortType === 'week' 
              ? 'This Week\'s Schedule' 
              : 'All Schedules'}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSortType('today')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
              sortType === 'today'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'
            }`}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Today
          </button>
          <button
            onClick={() => setSortType('week')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
              sortType === 'week'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            This Week
          </button>
          <button
            onClick={() => setSortType('all')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
              sortType === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'
            }`}
          >
            <ListFilter className="w-4 h-4 mr-2" />
            All
          </button>
        </div>
      </div>
    </div>
  );
};

const ScheduleCard = ({ schedule, expandedNotes, toggleNoteExpansion }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-lg text-gray-900 flex items-center">
            <UserCircle className="w-6 h-6 mr-2 text-teal-600" />
            {schedule.patient_name}
          </h3>
          <p className="text-sm text-gray-600 flex items-center mt-2">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            Member: {schedule.member_name}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          schedule.visit_type === 'Emergency' 
            ? 'bg-red-100 text-red-800'
            : 'bg-teal-100 text-teal-800'
        }`}>
          {schedule.visit_type}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <Calendar className="w-4 h-4 mr-2 text-teal-600" />
          <span className="text-gray-700">{new Date(schedule.visit_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <Clock className="w-4 h-4 mr-2 text-teal-600" />
          <span className="text-gray-700">{formatTo12Hour(schedule.visit_time)}</span>
        </div>

        {schedule.notes && (
          <div className="mt-4">
            <button 
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => toggleNoteExpansion(schedule.id)}
            >
              <span className="font-medium text-gray-700">Notes</span>
              {expandedNotes[schedule.id] ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            <div className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out
              ${expandedNotes[schedule.id] ? 'max-h-96' : 'max-h-20'}`
            }>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
                  {schedule.notes || ''}
                </p>
              </div>
            </div>

            {!expandedNotes[schedule.id] && (schedule.notes?.length || 0) > 100 && (
              <button 
                className="w-full text-teal-600 hover:text-teal-700 text-sm font-medium mt-2 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded p-1"
                onClick={() => toggleNoteExpansion(schedule.id)}
              >
                Show More
              </button>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-4 pt-4 border-t">
          Created: {formatDateTime(schedule.created_at)}
        </div>
      </div>
    </div>
  );
};

const ScheduleView = ({ 
  detailData, 
  sortType, 
  setSortType,
  expandedNotes,
  toggleNoteExpansion
}) => {
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

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

  const sortedSchedules = getSortedSchedules();

  return (
    <div className="space-y-6">
      <ScheduleHeader 
        sortType={sortType} 
        setSortType={setSortType} 
        totalSchedules={detailData.length}
      />
      {sortedSchedules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSchedules.map((schedule) => (
            <ScheduleCard 
              key={schedule.id}
              schedule={schedule}
              expandedNotes={expandedNotes}
              toggleNoteExpansion={toggleNoteExpansion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleView;