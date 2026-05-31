import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TripForm from './pages/TripForm';
import TripDetails from './pages/TripDetails';
import Register from './pages/Register';
import Login from './pages/Login';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 transition-colors">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect authenticated users trying to hit login/register/landing
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 transition-colors">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-905 dark:bg-darkbg-900 dark:text-slate-100 transition-colors duration-300">
              <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg">
                Skip to main content
              </a>
              <Navbar />
              <main id="main-content" className="flex-grow" role="main" aria-label="Main content">
              <Routes>
                {/* Public Access Only (Redirects to dashboard if logged in) */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* Secure / Protected Access Only */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create-trip" element={<ProtectedRoute><TripForm /></ProtectedRoute>} />
                <Route path="/trips/:id" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />

                {/* Catch-all fallback redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}
