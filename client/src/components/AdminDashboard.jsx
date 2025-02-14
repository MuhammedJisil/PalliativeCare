import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Heart, 
  UserCog, 
  Activity, 
  WrenchIcon, 
  CheckSquare, 
  Calendar, 
  HeartPulse, 
  UserPlus, 
  BriefcaseMedical, 
  HeartHandshake,
  Bell,
  X,
  CheckCircle,
  Trash2,
  FileEdit
} from 'lucide-react';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import LogoutButton from './LogoutButton';
import BASE_URL from '../config';

// Notification Badge Component
const NotificationBadge = ({ count }) => {
  if (!count) return null;
  
  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
      {count > 99 ? '99+' : count}
    </span>
  );
};

// Notification Panel Component
const NotificationPanel = ({ isOpen, onClose, notifications, onMarkRead, onNotificationClick, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Bell className="h-8 w-8 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 ${
                  notification.is_read ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Existing notification content */}
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => onNotificationClick(notification)}
                  >
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notification.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <CheckCircle className="h-4 w-4 text-teal-600" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded-full"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationCounts, setNotificationCounts] = useState({
    volunteer: 0,
    medical_professional: 0,
    caregiver: 0,
    patient: 0
  });
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const getPathForEntityType = (entityType) => {
    switch (entityType) {
      case 'volunteer':
        return '/admin/volunteers';
      case 'medical_professional':
        return '/admin/medical-professionals';
      case 'caregiver':
        return '/admin/caregivers';
      case 'patient':
        return '/admin/patients-in-need';
      default:
        return '/admin/dashboard';
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await handleMarkRead(notification.id);
    }
    
    // Navigate to corresponding page
    const path = getPathForEntityType(notification.entity_type);
    setIsNotificationPanelOpen(false);
    navigate(path);
  };


  // Fetch notification counts
  const fetchNotificationCounts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/notifications/counts`);
      setNotificationCounts(response.data);
      const total = Object.values(response.data).reduce((a, b) => a + b, 0);
      setTotalUnread(total);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when panel opens
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/notifications/recent`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (isNotificationPanelOpen) {
      fetchNotifications();
    }
  }, [isNotificationPanelOpen]);

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/notifications/${id}`);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Find the notification type that was deleted
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.is_read) {
        // Update counts only if the notification was unread
        setNotificationCounts(prev => ({
          ...prev,
          [deletedNotification.entity_type]: Math.max(0, prev[deletedNotification.entity_type] - 1)
        }));
        setTotalUnread(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle marking individual notification as read
  const handleMarkRead = async (id) => {
    try {
      await axios.post(`${BASE_URL}/api/notifications/${id}/mark-read`);
      
      // Update local notifications state
      const updatedNotifications = notifications.map(notif =>
        notif.id === id ? { ...notif, is_read: true } : notif
      );
      setNotifications(updatedNotifications);
      
      // Find the notification type that was marked as read
      const markedNotification = notifications.find(n => n.id === id);
      if (markedNotification) {
        // Update counts for that specific type
        setNotificationCounts(prev => ({
          ...prev,
          [markedNotification.entity_type]: Math.max(0, prev[markedNotification.entity_type] - 1)
        }));
        
        // Update total unread count
        setTotalUnread(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle marking all notifications of a type as read when clicking a card
  const handleCardClick = async (path, entityType) => {
    if (entityType && notificationCounts[entityType] > 0) {
      try {
        await axios.post(`${BASE_URL}/api/notifications/mark-read`, {
          entity_type: entityType
        });
        
        // Update local notifications state
        const updatedNotifications = notifications.map(notif =>
          notif.entity_type === entityType ? { ...notif, is_read: true } : notif
        );
        setNotifications(updatedNotifications);
        
        // Update counts
        const countToRemove = notificationCounts[entityType];
        setNotificationCounts(prev => ({
          ...prev,
          [entityType]: 0
        }));
        
        // Update total unread count
        setTotalUnread(prev => Math.max(0, prev - countToRemove));
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
    
    navigate(path);
  };

  const cards = [
    {
      title: "Volunteer",
      description: "Manage and view registered volunteers",
      icon: <Users className="h-8 w-8 text-teal-600" />,
      path: '/admin/volunteers',
      entityType: 'volunteer',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Medical Professional",
      description: "Manage and view registered medical professionals",
      icon: <BriefcaseMedical className="h-8 w-8 text-teal-600" />,
      path: '/admin/medical-professionals',
      entityType: 'medical_professional',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Caregiver",
      description: "Manage and view registered caregivers",
      icon: <HeartHandshake className="h-8 w-8 text-teal-600" />,
      path: '/admin/caregivers',
      entityType: 'caregiver',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Registered Patients",
      description: "Manage and view patients who need support",
      icon: <FileEdit className="h-8 w-8 text-teal-600" />,
      path: '/admin/patients-in-need',
      entityType: 'patient',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Patient Management",
      description: "Manage patient information",
      icon: <UserCog className="h-8 w-8 text-teal-600" />,
      path: '/admin/patient-management',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "To-Do List",
      description: "Manage tasks for palliative care volunteers and doctors",
      icon: <CheckSquare className="h-8 w-8 text-teal-600" />,
      path: '/admin/tasks',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Schedule Visits",
      description: "Manage and schedule patient visits for palliative care members",
      icon: <Calendar className="h-8 w-8 text-teal-600" />,
      path: '/admin/schedules',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
    },
    {
      title: "Emergency Fund Collection",
      description: "Manage patient who require emergency fund",
      icon: <HeartPulse className="h-8 w-8 text-teal-600" />,
      path: '/admin/emergency-fund-management',
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50'
  },
  {
    title: "Patient Assignment",
    description: "Assign patients to volunteers,caregivers and medical professionals",
    icon: <UserPlus className="h-8 w-8 text-teal-600" />,
    path: '/admin/patient-assignment',
    bgColor: 'bg-white',
    hoverColor: 'hover:bg-gray-50'
  },
  {
    title: "Patient Statistics",
  description: "View and manage detailed patient health metrics",
  icon: <Activity className="h-8 w-8 text-teal-600" />,
    path: '/admin/statistics',
    bgColor: 'bg-white',
    hoverColor: 'hover:bg-gray-50'
  },
  {
    title: "Equipment",
    description: "Manage Medical Equipment",
    icon: <WrenchIcon className="h-8 w-8 text-teal-600" />,
    path: '/admin/equipments',
    bgColor: 'bg-white',
    hoverColor: 'hover:bg-gray-50'
  }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
<div className="flex items-center justify-between mb-8">
  <div className="flex items-center space-x-2">
    <Heart className="h-8 w-8 text-teal-600" />
    <h1 className="text-2xl font-semibold text-gray-800">
      Admin Dashboard
    </h1>
  </div>
  
  <div className="flex items-center space-x-4">
  <LogoutButton userType="admin" />
    <button
      onClick={() => setIsNotificationPanelOpen(true)}
      className="p-2 hover:bg-gray-100 rounded-full relative"
    >
      <Bell className="h-6 w-6 text-gray-600" />
      {totalUnread > 0 && (
        <NotificationBadge count={totalUnread} />
      )}
    </button>
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} ${card.hoverColor} rounded-lg shadow-md transition-all duration-200 hover:shadow-lg relative`}
            >
              <button
                className="w-full p-6 text-left"
                onClick={() => handleCardClick(card.path, card.entityType)}
              >
                <NotificationBadge count={notificationCounts[card.entityType]} />
                <div className="flex items-center space-x-4 mb-4">
                  {card.icon}
                  <h2 className="text-xl font-semibold text-gray-800">
                    {card.title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>
                <div className="inline-flex items-center text-teal-600 font-medium">
                  Enter
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <NotificationPanel
      isOpen={isNotificationPanelOpen}
      onClose={() => setIsNotificationPanelOpen(false)}
      notifications={notifications}
      onMarkRead={handleMarkRead}
      onNotificationClick={handleNotificationClick}
      onDelete={handleDeleteNotification}
    />
    </div>
  );
};

export default AdminDashboard;