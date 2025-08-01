import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Shield, TrendingUp, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MoovoUrl } from '../../utils/apiConfig';
import { useAuth } from '@/components/context/AuthContext';

export default function AdminDashboard({ onNavigateToUsers }) {
  const { getValidAccessToken } = useAuth();

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      const accessToken = await getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      const response = await axios.get(`${MoovoUrl}/api/adminportal/user-analytics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Analytics response:', response.data);
      return response.data.analytics;
    },
    retry: false,
    staleTime: 300000, // Cache for 5 minutes
  });

  // Fetch recent users data
  const { data: recentUsersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: async () => {
      const accessToken = await getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      const response = await axios.get(`${MoovoUrl}/api/adminportal/recent-users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Recent users response:', response.data);
      return response.data.recentUsers;
    },
    retry: false,
    staleTime: 300000, // Cache for 5 minutes
  });

  const metricCards = [
    {
      title: "Total Users",
      value: analyticsData?.totalUsers || 0,
      icon: Users,
      bgGradient: "from-blue-500 via-blue-600 to-blue-700",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      shadowColor: "shadow-blue-500/20",
      description: "Active platform users"
    },
    {
      title: "New Users (24h)",
      value: analyticsData?.newUsersLast24h || 0,
      icon: UserPlus,
      bgGradient: "from-emerald-500 via-emerald-600 to-emerald-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      shadowColor: "shadow-emerald-500/20",
      description: "Recent registrations"
    },
    {
      title: "Total Admins",
      value: analyticsData?.totalAdmins || 0,
      icon: Shield,
      bgGradient: "from-purple-500 via-purple-600 to-purple-700",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      shadowColor: "shadow-purple-500/20",
      description: "System administrators"
    }
  ];

  // Helper function to get initials from name
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (analyticsLoading || usersLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-1">Loading analytics...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (analyticsError || usersError) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-red-600 mt-1 font-medium">Error loading data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/20">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Live Data</span>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards.map((metric, index) => (
            <Card key={index} className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm ${metric.shadowColor}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${metric.iconBg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{metric.description}</p>
                  </div>
                </div>
                
                {/* Animated gradient overlay */}
                <div className={`absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br ${metric.bgGradient} opacity-10 rounded-full group-hover:scale-125 group-hover:opacity-20 transition-all duration-300`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Users */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
                  Recent Users
                </CardTitle>
                <p className="text-gray-600 text-sm font-medium">Latest users who joined your platform</p>
              </div>
              <div 
                className="flex items-center space-x-2 text-blue-600 font-semibold cursor-pointer hover:text-blue-800 transition-colors group"
                onClick={() => onNavigateToUsers && onNavigateToUsers()}
              >
                <span className="text-sm">View All</span>
                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recentUsersData && recentUsersData.length > 0 ? (
                recentUsersData.map((user, index) => (
                  <div key={index} className="group flex items-center space-x-3 p-3 bg-gradient-to-r from-white to-gray-50/50 border border-gray-100/50 rounded-lg hover:shadow-md hover:border-blue-200/50 transition-all duration-300">
                    <div className="relative">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name}
                          className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                          <span className="text-white font-bold text-sm">{getInitials(user.name)}</span>
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors truncate">{user.name}</p>
                      <p className="text-gray-600 text-sm truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full backdrop-blur-sm">
                        {user.joinedAt}
                      </span>
                      <p className="text-xs font-medium mt-0.5 text-green-600">online</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 font-medium">No recent users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




