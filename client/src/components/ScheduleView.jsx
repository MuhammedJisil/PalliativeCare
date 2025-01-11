import React from 'react';
import { Calendar, CalendarDays, Clock, ChevronUp, ChevronDown, ListFilter, Calendar as CalendarIcon, User, UserCircle } from 'lucide-react';

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
    <CalendarIcon className="w-12 h-12 text-teal-200 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules Found</h3>
    <p className="text-gray-500 text-center">There are no scheduled appointments for the selected time period.</p>
  </div>
);

const ScheduleHeader = ({ sortType, setSortType, totalSchedules }) => {
  // Only hide header if there are no schedules at all
  if (totalSchedules === 0) return null;

  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-teal-50">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-teal-600" />
          {sortType === 'today' 
            ? `Today's Schedule (${new Date().toLocaleDateString()})` 
            : sortType === 'week' 
              ? 'This Week\'s Schedule' 
              : 'All Schedules'}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setSortType('today')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
              sortType === 'today'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Today
          </button>
          <button
            onClick={() => setSortType('week')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
              sortType === 'week'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            This Week
          </button>
          <button
            onClick={() => setSortType('all')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
              sortType === 'all'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-lg text-gray-900 flex items-center">
            <UserCircle className="w-5 h-5 mr-2 text-teal-600" />
            {schedule.patient_name}
          </h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            Member: {schedule.member_name}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          schedule.visit_type === 'Emergency' 
            ? 'bg-red-100 text-red-800'
            : 'bg-teal-100 text-teal-800'
        }`}>
          {schedule.visit_type}
        </span>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center bg-teal-50 p-2 rounded-md">
          <Calendar className="w-4 h-4 mr-2 text-teal-600" />
          <span className="text-gray-700">{new Date(schedule.visit_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center bg-teal-50 p-2 rounded-md">
          <Clock className="w-4 h-4 mr-2 text-teal-600" />
          <span className="text-gray-700">{schedule.visit_time}</span>
        </div>
        {schedule.notes && (
          <div className="mt-4 relative">
            <div 
              className="flex items-center justify-between cursor-pointer text-gray-700 hover:text-teal-600 transition-colors duration-200"
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
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out origin-top ${
                expandedNotes[schedule.id] 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-20 opacity-90'
              }`}
            >
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100 mt-2">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {schedule.notes || ''}
                </p>
              </div>
            </div>
            {!expandedNotes[schedule.id] && (schedule.notes?.length || 0) > 100 && (
              <div className="text-center mt-2">
                <button 
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  onClick={() => toggleNoteExpansion(schedule.id)}
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-4 pt-4 border-t">
          Created: {new Date(schedule.created_at).toLocaleString()}
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
    <div className="space-y-4">
      <ScheduleHeader 
        sortType={sortType} 
        setSortType={setSortType} 
        totalSchedules={detailData.length} // Pass total schedules instead of filtered count
      />
      {sortedSchedules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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