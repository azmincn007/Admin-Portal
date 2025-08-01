import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import Images from "@/assets/Images";
import { MoovoUrl } from "@/utils/apiConfig";
import LazyImage from '@/components/common/LazyImage';

// Function to reset password
const resetPassword = async ({ token, newPassword }) => {
  const response = await fetch(`${MoovoUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Server error: ${response.status}`);
  }

  return response.json();
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch("password");

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast.error("Invalid reset link. Please request a new password reset.");
      navigate('/forgot-password');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, navigate]);

  // Reset password mutation
  const { mutate: resetPasswordMutation, isPending: isResetting } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success("Password reset successfully! You can now login with your new password.");
      navigate('/login');
    },
    onError: (error) => {
      console.error('Error resetting password:', error);
      toast.error(error.message || "Failed to reset password. Please try again.");
    }
  });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    resetPasswordMutation({ token, newPassword: data.password });
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Very Weak', color: 'text-red-500' },
      { strength: 2, text: 'Weak', color: 'text-orange-500' },
      { strength: 3, text: 'Fair', color: 'text-yellow-500' },
      { strength: 4, text: 'Good', color: 'text-blue-500' },
      { strength: 5, text: 'Strong', color: 'text-green-500' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="h-[100svh] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-50/50 items-center justify-center">
        <div className="max-w-full">
          <LazyImage
            src={Images.welcome}
            alt="Reset password illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-blue-900 font-nunito animate-in fade-in duration-500">
                Reset Password
              </h1>
              <p className="text-gray-600 font-medium text-lg">
                Create your new password
              </p>
              <p className="text-gray-500">
                Enter a strong password to secure your account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                      }
                    })}
                    className="w-full pl-12 pr-12 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength <= 2 ? 'bg-red-500' :
                          passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                          passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === password || "Passwords do not match"
                    })}
                    className="w-full pl-12 pr-12 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit"
                disabled={isResetting}
                className="w-full py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold transition-colors"
              >
                {isResetting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  At least 8 characters long
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  One uppercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  One lowercase letter
                </li>
                <li className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${password && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  One number
                </li>
              </ul>
            </div>

            {/* Info text */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-900 hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

