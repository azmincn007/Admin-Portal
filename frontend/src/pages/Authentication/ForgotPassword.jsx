import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import Images from "@/assets/Images";
import { MoovoUrl } from "@/utils/apiConfig";
import LazyImage from '@/components/common/LazyImage';

// Function to send forgot password email
const sendForgotPasswordEmail = async ({ email }) => {
  const response = await fetch(`${MoovoUrl}/api/auth/send-reset-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Server error: ${response.status}`);
  }

  return response.json();
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Send forgot password email mutation
  const { mutate: sendEmailMutation, isPending: isSending } = useMutation({
    mutationFn: sendForgotPasswordEmail,
    onSuccess: (data) => {
      toast.success("Password reset link sent to your email");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error sending forgot password email:', error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    }
  });

  const onSubmit = (data) => {
    sendEmailMutation({ email: data.email });
  };

  return (
    <div className="h-[100svh] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-50/50 items-center justify-center">
        <div className="max-w-full">
          <LazyImage
            src={Images.welcome}
            alt="Forgot password illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="space-y-6">
         

            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-blue-900 font-nunito animate-in fade-in duration-500">
                Forgot Password
              </h1>
              <p className="text-gray-600 font-medium text-lg">
                Reset your password
              </p>
              <p className="text-gray-500">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <Button 
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold transition-colors"
              >
                {isSending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

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

            <p className="text-center text-sm text-gray-500 mt-6">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-900 hover:underline font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-900 hover:underline font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

