import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoadingLayout({ children }) {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn && window.location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return children;
}