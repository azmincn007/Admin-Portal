import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, UserCheck, Shield, Trash2, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import axios from 'axios';
import { MoovoUrl } from '../../utils/apiConfig';
import { useAuth } from '@/components/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function AdminUserSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailedUsers, setDetailedUsers] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();
  const { getValidAccessToken } = useAuth();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, dateFilter, fromDate, toDate]);

  // Clear custom dates when predefined filter is selected
  useEffect(() => {
    if (dateFilter !== 'custom') {
      setFromDate(null);
      setToDate(null);
    }
  }, [dateFilter]);

  // Fetch basic users data (loadType=basic)
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['allUsers', currentPage, debouncedSearchTerm, roleFilter, dateFilter, fromDate, toDate],
    queryFn: async () => {
      const accessToken = await getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        role: roleFilter,
        loadType: 'basic',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      // Handle date filter mapping
      if (dateFilter === 'all') {
        params.append('date', 'all');
      } else if (dateFilter === 'today') {
        params.append('date', '1');
      } else if (dateFilter === 'yesterday') {
        params.append('date', '2');
      } else if (dateFilter === 'last7days') {
        params.append('date', '7');
      } else if (dateFilter === 'last30days') {
        params.append('date', '30');
      } else if (dateFilter === 'last90days') {
        params.append('date', '90');
      } else if (dateFilter === 'custom') {
        params.append('date', 'custom');
        if (fromDate) {
          params.append('fromDate', format(fromDate, 'yyyy-MM-dd'));
        }
        if (toDate) {
          params.append('toDate', format(toDate, 'yyyy-MM-dd'));
        }
      }
      
      const response = await axios.get(`${MoovoUrl}/api/adminportal/all-users?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('Basic users response:', response.data);
      return response.data;
    },
    retry: false,
    staleTime: 300000,
  });

  // Fetch detailed user data for profile images
  const fetchDetailedUsers = async (userIds) => {
    const accessToken = await getValidAccessToken();
    
    if (!accessToken) {
      throw new Error('No valid access token available');
    }

    const params = new URLSearchParams({
      loadType: 'detailed',
      userIds: userIds.join(',')
    });
    
    const response = await axios.get(`${MoovoUrl}/api/adminportal/all-users?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.users;
  };

  // Load detailed data for visible users
  useEffect(() => {
    if (usersData?.users?.length > 0) {
      const userIds = usersData.users.map(user => user._id);
      const missingDetailedUsers = userIds.filter(id => !detailedUsers[id]);
      
      if (missingDetailedUsers.length > 0) {
        fetchDetailedUsers(missingDetailedUsers)
          .then(detailedUsersArray => {
            const newDetailedUsers = {};
            detailedUsersArray.forEach(user => {
              newDetailedUsers[user._id] = user;
            });
            setDetailedUsers(prev => ({ ...prev, ...newDetailedUsers }));
          })
          .catch(error => {
            console.error('Error fetching detailed users:', error);
          });
      }
    }
  }, [usersData?.users]);

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const accessToken = await getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      await axios.delete(`${MoovoUrl}/api/adminportal/delete-user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          userId: userId
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setDetailedUsers(prev => {
        const updated = { ...prev };
        delete updated[userToDelete?._id];
        return updated;
      });
      setDeleteModalOpen(false);
      setUserToDelete(null);
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user. Please try again.");
    }
  });

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete._id);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Helper function to get initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setRoleFilter('all');
    setDateFilter('all');
    setFromDate(null);
    setToDate(null);
    setCurrentPage(1);
  };

  // User Avatar Component with lazy loading
  const UserAvatar = ({ user }) => {
    const detailedUser = detailedUsers[user._id];
    const isLoadingImage = !detailedUser;
    
    if (isLoadingImage) {
      return (
        <div className="w-10 h-10 rounded-full">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      );
    }

    if (detailedUser.profileImage) {
      return (
        <img 
          src={detailedUser.profileImage} 
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
          loading="lazy"
        />
      );
    }

    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
        <span className="text-white font-semibold text-sm">
          {getInitials(user.name)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Admin Portal</h1>
            <p className="text-gray-600 mt-1">Loading users...</p>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Admin Portal</h1>
            <p className="text-red-600 mt-1">Error loading users</p>
          </div>
        </div>
      </div>
    );
  }

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {};

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Admin Portal</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-900 font-semibold">Total Users: {pagination.totalUsers || 0}</span>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users... (min 3 characters)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm.length > 0 && searchTerm.length < 3 && (
                <p className="text-xs text-gray-500 mt-1">Type at least 3 characters to search</p>
              )}
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by join date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range Pickers */}
          {dateFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      disabled={(date) => date > new Date() || (toDate && date > toDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(date) => date > new Date() || (fromDate && date < fromDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          {/* Active Filters Display */}
          {(debouncedSearchTerm || roleFilter !== 'all' || dateFilter !== 'all' || fromDate || toDate) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {debouncedSearchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Search: "{debouncedSearchTerm}"
                </span>
              )}
              {roleFilter !== 'all' && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  Role: {roleFilter}
                </span>
              )}
              {dateFilter !== 'all' && dateFilter !== 'custom' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Date: {dateFilter.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              )}
              {dateFilter === 'custom' && (fromDate || toDate) && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Date: {fromDate ? format(fromDate, "MMM dd, yyyy") : "Start"} - {toDate ? format(toDate, "MMM dd, yyyy") : "End"}
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700">User</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {user.joinedAt}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <div className="flex items-center text-gray-400">
                          <Shield className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">Protected</span>
                        </div>
                      ) : (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user)}
                          disabled={deleteUserMutation.isPending}
                          className="text-white hover:text-white p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 font-medium">
                {debouncedSearchTerm || roleFilter !== 'all' || dateFilter !== 'all' || fromDate || toDate
                  ? 'No users found matching your filters' 
                  : 'No users found'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1} 
              ({pagination.totalUsers || 0} total users)
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage || isLoading}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 border-red-200">
          <DialogHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-full bg-red-50 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-red-900">Delete User Account</DialogTitle>
              <DialogDescription className="pt-2 text-gray-600">
                Are you sure you want to permanently delete this user account? This action cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          {userToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <UserAvatar user={userToDelete} />
                <div>
                  <p className="font-semibold text-gray-900">{userToDelete.name}</p>
                  <p className="text-sm text-gray-600">{userToDelete.email}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    userToDelete.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userToDelete.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={cancelDelete}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}







