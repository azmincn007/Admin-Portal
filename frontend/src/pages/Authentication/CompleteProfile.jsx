import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { toast } from "sonner";
import Images from "@/assets/Images";
import LazyImage from '@/components/common/LazyImage';
import { useAuth } from '@/components/context/AuthContext';
import { MoovoUrl } from "@/utils/apiConfig";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { getValidAccessToken } = useAuth();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  // Complete profile mutation
  const completeProfileMutation = useMutation({
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
      toast.success('Profile completed successfully!');
      // Invalidate user queries to refetch updated data
      queryClient.invalidateQueries(['userDetails']);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error completing profile:', error);
      toast.error(error.response?.data?.message || 'Failed to complete profile');
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
    completeProfileMutation.mutate(data);
  };

  const nameValue = watch('name');

  return (
    <div className="h-[100svh] flex">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-50/50 items-center justify-center">
        <div className="max-w-full">
          <LazyImage
            src={Images.welcome}
            alt="Complete profile illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-blue-900 font-nunito animate-in fade-in duration-500">
                Complete Profile
              </h1>
              <p className="text-gray-600 font-medium text-lg">
                Just a few more details
              </p>
              <p className="text-gray-500">
                Add your name and profile picture
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 shadow-lg ring-4 ring-yellow-400/20">
                  <AvatarImage src={imagePreview} alt={nameValue || "Profile"} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                    {nameValue ? nameValue.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                
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
                  onClick={() => fileInputRef.current?.click()}
                  className="border-yellow-400 text-blue-900 hover:bg-yellow-50 hover:border-yellow-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Optional: Add a profile picture (Max 5MB)
                </p>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-900 font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={completeProfileMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold transition-colors disabled:opacity-50"
              >
                {completeProfileMutation.isPending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Completing...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}




