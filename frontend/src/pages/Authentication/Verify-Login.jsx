import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import Images from "@/assets/Images";
import { useAuth } from "../../components/context/AuthContext";
import { MoovoUrl } from "@/utils/apiConfig";
import LazyImage from '@/components/common/LazyImage';

// Function to verify OTP
const verifyOTP = async ({ email, otp }) => {
  
  const response = await fetch(`${MoovoUrl}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    
    // Check for specific error types
    if (response.status === 400) {
      if (errorData?.message?.includes("expired")) {
        throw new Error("EXPIRED_OTP");
      } else {
        throw new Error("INVALID_OTP");
      }
    }
    
    throw new Error(errorData?.message || `Server error: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
  
  return data;
};

// Function to resend OTP
const resendOTP = async (email) => {
  const response = await fetch(`${MoovoUrl}/api/auth/send-otp`, {
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

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(() => {
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem('tempVerifyEmail');
    return stateEmail || storedEmail;
  });
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef([]);

  // Clear error message when OTP changes
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage("");
    }
  }, [otp]);

  // Check if email exists when component mounts
  useEffect(() => {
    if (!email) {
      console.error('Email is missing!');
      toast.error("Email information is missing. Please try again from login page.");
      navigate('/login');
    }
  }, [email, navigate]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendActive(true);
    }

    return () => clearInterval(timer);
  }, [countdown]);

  // Verify OTP mutation
  const { mutate: verifyOTPMutation, isPending: isVerifying } = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      console.log('Verify OTP Success - Full response:', data);
      console.log('Access Token received:', data.accessToken);
      console.log('Refresh Token received:', data.refreshToken);
      console.log('Is new user:', data.isNewUser);
      
      // Save tokens using the new login method
      if (data.accessToken && data.refreshToken) {
        login({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        });
      } else {
        // Fallback for old token format
        login(data.token);
      }
      
      // Invalidate and refetch user details query
      queryClient.invalidateQueries(['userDetails']);
      
      // Clean up temp email
      localStorage.removeItem('tempVerifyEmail');
      
      toast.success("Verification successful!");
      
      // Navigate based on user status
      if (data.isNewUser) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      console.error('Error verifying OTP:', error);
      
      // Handle specific error types
      if (error.message === "EXPIRED_OTP") {
        setErrorMessage("The verification code has expired. Please request a new one.");
        setIsResendActive(true);
        setCountdown(0);
      } else if (error.message === "INVALID_OTP") {
        setErrorMessage("Invalid verification code. Please check and try again.");
      } else {
        setErrorMessage(error.message || "Failed to verify. Please try again.");
      }
    }
  });

  // Resend OTP mutation
  const { mutate: resendOTPMutation, isPending: isResending } = useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      setCountdown(60);
      setIsResendActive(false);
      toast.success("New verification code sent!");
    },
    onError: (error) => {
      console.error('Error resending OTP:', error);
      toast.error(error.message || "Failed to resend code. Please try again.");
    }
  });

  const handleChange = (index, value) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (isResendActive && !isResending) {
      resendOTPMutation(email);
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    
    if (otpString.length === 6) {
      if (!email) {
        console.error('Email is missing!', location.state);
        toast.error("Email information is missing. Please try again from login page.");
        return;
      }
      verifyOTPMutation({ email, otp: otpString });
    } else {
      toast.error("Please enter all 6 digits of the verification code");
    }
  };

  const setRef = (el, index) => {
    inputRefs.current[index] = el;
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim().slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
          newOtp[i] = pastedData[i];
        }
      }
      
      setOtp(newOtp);
      
      // Focus on the appropriate input after pasting
      if (pastedData.length < 6) {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="h-[100svh] flex p-0">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-50/50 items-center justify-center">
        <div className="max-w-full">
          <LazyImage
            src={Images.welcome}
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight text-blue-900 font-nunito animate-in fade-in duration-500">
              Admin Portal
            </h1>
            <p className="mt-4 text-gray-600 font-medium">Enter verification code</p>
            <p className="text-sm text-gray-500">
              We've sent a code to {email}
            </p>
          </div>

          <div className="space-y-4">
            {/* Error Alert */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{errorMessage}</p>
                  {errorMessage.includes("expired") && (
                    <p className="text-sm mt-1">Click "Resend" to get a new code.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4" onPaste={handlePaste}>
              {/* First row of 4 inputs */}
              <div className="flex justify-center gap-4">
                {otp.slice(0, 4).map((digit, index) => (
                  <Input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => setRef(el, index)}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-lg font-semibold rounded-lg bg-gray-50 focus:ring-yellow-400
                      ${errorMessage ? 'border-red-300 focus:border-red-500' : 'focus:border-yellow-400'}`}
                  />
                ))}
              </div>
              {/* Second row of 2 inputs */}
              <div className="flex justify-center gap-4">
                {otp.slice(4, 6).map((digit, index) => (
                  <Input
                    key={index + 4}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => setRef(el, index + 4)}
                    onChange={(e) => handleChange(index + 4, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index + 4, e)}
                    className={`w-12 h-12 text-center text-lg font-semibold rounded-lg bg-gray-50 focus:ring-yellow-400
                      ${errorMessage ? 'border-red-300 focus:border-red-500' : 'focus:border-yellow-400'}`}
                  />
                ))}
              </div>
            </div>

            <Button 
              onClick={handleVerify}
              disabled={otp.join("").length !== 6 || isVerifying}
              className="w-full rounded-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold transition-colors"
            >
              {isVerifying ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center text-sm pt-4">
              <span className="text-gray-600">Didn't receive code? </span>
              <button 
                onClick={handleResend}
                disabled={!isResendActive || isResending}
                className={`${
                  isResendActive && !isResending
                    ? "text-blue-900 hover:underline font-semibold cursor-pointer" 
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {isResending ? (
                  "Sending..."
                ) : isResendActive ? (
                  "Resend"
                ) : (
                  `Resend (${countdown}s)`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
