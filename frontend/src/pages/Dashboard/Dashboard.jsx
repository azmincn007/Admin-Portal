import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/context/UserContext';
import { useAuth } from '@/components/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import AdminUserSection from './AdminUserSection';
import { Users, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, isLoading, error } = useUser();
  const { logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);



  // Show loading spinner while checking authentication or fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check authentication again before rendering
  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  // If no user data yet, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
          <p className="text-gray-600 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Show content based on user role
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 text-white shadow-lg">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="text-2xl font-bold">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-200">Welcome, {user?.name}</span>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:shadow-none border-r border-gray-200`}>
            <nav className="p-6 space-y-3">
              <button
                onClick={() => {
                  setActiveSection('overview');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'overview'
                    ? 'bg-yellow-400 text-blue-900 shadow-md'
                    : 'text-gray-600 hover:bg-yellow-50 hover:text-blue-900'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => {
                  setActiveSection('users');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'users'
                    ? 'bg-yellow-400 text-blue-900 shadow-md'
                    : 'text-gray-600 hover:bg-yellow-50 hover:text-blue-900'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </button>
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="md:p-6">
              {activeSection === 'overview' && <AdminDashboard />}
              {activeSection === 'users' && <AdminUserSection />}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header for User Dashboard */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 text-white shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-blue-200">Welcome, {user?.name}</span>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* User Dashboard Content */}
      <UserDashboard />
    </div>
  );
}



