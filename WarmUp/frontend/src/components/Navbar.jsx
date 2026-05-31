import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Compass, Sun, Moon, Bell, LogOut, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationRead } = useSocket();
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 group" aria-label="RoamAI - Go to homepage">
              <Compass className="w-8 h-8 transform group-hover:rotate-45 transition-transform duration-300" aria-hidden="true" />
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent">RoamAI</span>
            </Link>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={dark}
            >
              {dark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </button>

            {user && (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                    aria-expanded={showNotifications}
                    aria-haspopup="true"
                    aria-controls="notification-dropdown"
                  >
                    <Bell className="w-5 h-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-darkbg-900 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotifications && (
                    <div
                      id="notification-dropdown"
                      role="menu"
                      aria-label="Notifications list"
                      className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-darkbg-800 shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50 animate-slide-up"
                      onKeyDown={(e) => { if (e.key === 'Escape') setShowNotifications(false); }}
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Alerts & Notifications</h3>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300 font-medium">
                          {unreadCount} unread
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                if (!notif.read) markNotificationRead(notif._id);
                              }}
                              className={`p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors ${
                                !notif.read ? 'bg-violet-50/20 dark:bg-violet-500/5 font-medium' : ''
                              }`}
                            >
                              {notif.type === 'weather_alert' ? (
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                              ) : notif.type === 'itinerary_updated' ? (
                                <RefreshCw className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-snug">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile and Logout */}
                <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-semibold text-slate-800 dark:text-white leading-3">
                      {user.name}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Explorer</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md shadow-violet-500/20 transition-all hover:scale-105 duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
