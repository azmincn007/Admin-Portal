import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@/components/context/UserContext';
import { useAuth } from '@/components/context/AuthContext';
import { MoovoUrl } from "@/utils/apiConfig";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, User, Mail, Settings, Activity, Heart, Star, Upload, Camera, Lock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function UserDashboard() {
  const { user, isLoading } = useUser();
  console.log(user);
  
  const { getValidAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || user?.image);
  const fileInputRef = useRef(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setImagePreview(user.profileImage || user.image);
    }
  }, [user, setValue]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const accessToken = await getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('name', data.name);
      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile);
      }

      const response = await axios.put(`${MoovoUrl}/api/adminportal/update-profile`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setProfileImageFile(null);
      // Invalidate user queries to refetch updated data
      queryClient.invalidateQueries(['userDetails']);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setProfileImageFile(file);
    }
  };

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImageFile(null);
    setImagePreview(user?.profileImage || user?.image);
    reset({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-100 flex items-center justify-center px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-amber-300 border-t-blue-700"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200 to-blue-200 opacity-20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-100">
      {/* Mobile-first container */}
      <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6 sm:max-w-2xl lg:max-w-4xl lg:px-8">
        
        {/* Hero Welcome Section - Mobile optimized */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 p-6 text-white shadow-2xl sm:p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative">
            <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:text-left sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl sm:w-20 sm:h-20">
                  <User className="w-8 h-8 text-blue-900 sm:w-10 sm:h-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2 sm:text-3xl lg:text-4xl">
                  Hey {user?.name || 'there'}! 👋
                </h1>
                <p className="text-blue-200 text-sm sm:text-base lg:text-lg">
                  Let's make today amazing together
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information - Mobile optimized */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="flex items-center space-x-3 text-lg sm:text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Edit className="w-4 h-4 text-blue-900" />
                </div>
                <span>Your Profile</span>
              </CardTitle>
              <Button
                onClick={() => isEditing ? handleSubmit(onSubmit)() : setIsEditing(true)}
                disabled={updateProfileMutation.isPending}
                className={`w-full sm:w-auto ${isEditing 
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-blue-900 font-semibold shadow-lg" 
                  : "bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                } transition-all duration-300`}
                size="sm"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  isEditing ? '✨ Save Changes' : '✏️ Edit Profile'
                )}
              </Button>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-6 space-y-6 sm:p-8">
              <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200">
                <div className="relative">
                  <Avatar className="h-24 w-24 shadow-lg ring-4 ring-white">
                    <AvatarImage src={imagePreview} alt={watch('name')} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                      <Camera className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden" 
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current.click()}
                  disabled={!isEditing}
                  className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4" />
                  Change Photo
                </Button>
              </div>
              
              <div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-8 sm:space-y-0">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-blue-900 font-semibold flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Full Name</span>
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700 group-focus-within:text-amber-500 transition-colors" />
                    <Input
                      id="name"
                      {...register("name", {
                        required: "Name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters"
                        },
                        maxLength: {
                          value: 50,
                          message: "Name must be less than 50 characters"
                        },
                        pattern: {
                          value: /^[a-zA-Z\s]+$/,
                          message: "Name can only contain letters and spaces"
                        }
                      })}
                      disabled={!isEditing}
                      className={`pl-12 h-12 border-2 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-amber-400'} focus:ring-2 focus:ring-amber-200 rounded-xl bg-gray-50/50 transition-all duration-300 disabled:bg-gray-100/50`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-blue-900 font-semibold flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Email Address</span>
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors" />
                    <Input
                      id="email"
                      {...register("email")}
                      disabled
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                      placeholder="Enter your email"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email address cannot be changed</p>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                    className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl h-12 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-blue-900 font-semibold rounded-xl h-12 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⟳</span>
                        Saving...
                      </>
                    ) : (
                      '💾 Save Changes'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}







