import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch past notifications log when user logs in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const loadNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        if (response.data.success) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.notifications.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Error loading notification logs:', error.message);
      }
    };

    loadNotifications();
  }, [user]);

  // Connect to Socket.IO server on session activation
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to backend — use env variable in production, origin in development
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socketConnection = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socketConnection.on('connect', () => {
      console.log('Socket.IO stream active');
      socketConnection.emit('join', user.id);
    });

    socketConnection.on('notification', (newNotif) => {
      console.log('Notification packet received:', newNotif);
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [user]);

  const markNotificationRead = async (id) => {
    try {
      const response = await axios.put(`/api/notifications/${id}`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notif => (notif._id === id ? { ...notif, read: true } : notif))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
    }
  };

  const addLocalNotification = (message, type = 'general') => {
    const localNotif = {
      _id: `local-${Date.now()}`,
      message,
      type,
      read: false,
      createdAt: new Date()
    };
    setNotifications(prev => [localNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      unreadCount,
      markNotificationRead,
      addLocalNotification
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
