import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Images from "@/assets/Images"; 
import { useAuth } from "../../components/context/AuthContext";
import { MoovoUrl } from "@/utils/apiConfig";
import LazyImage from '@/components/common/LazyImage';

// Function to send OTP with email/password (handles both login and signup)
const sendOTP = async ({ email, password }) => {
  const response = await fetch(`${MoovoUrl}/api/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Server error: ${response.status}`);
  }

  return response.json();
};

export default function AuthForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef(null);
  const mobileGoogleButtonRef = useRef(null);
  const isMounted = useRef(true);
  const [isGoogleError, setIsGoogleError] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Detect if it's a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android|iPad|iPhone|iPod|webOS|Windows Phone/i.test(userAgent)) {
        setIsMobileDevice(true);
      }
    };

    checkMobile();
  }, []);

  // Send OTP mutation
  const { mutate: sendOTPMutation, isPending: isOTPSending } = useMutation({
    mutationFn: sendOTP,
    onSuccess: (data, variables) => {
      // Store email in localStorage as a backup
      localStorage.setItem('tempVerifyEmail', variables.email);
      
      toast.success("Verification code sent to your email");
      navigate('/verify-login', { state: { email: variables.email } });
    },
    onError: (error) => {
      console.error('Error sending OTP:', error);
      toast.error(error.message || "Failed to send verification code. Please try again.");
    }
  });

  // Google Sign-In handling function
  const handleGoogleLogin = (credential) => {
    if (!credential) return;
    
    fetch(`${MoovoUrl}/api/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential })
    })
    .then(res => {
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.success) {
        login(data.token);
        navigate('/dashboard');
        toast.success("Successfully signed in with Google");
      } else {
        throw new Error("Google login failed");
      }
    })
    .catch(err => {
      console.error('Error during Google login:', err);
      toast.error("Failed to sign in with Google. Please try with email.");
    });
  };

  useEffect(() => {
    isMounted.current = true;

    const loadGoogleScript = () => {
      if (window.google && window.google.accounts) {
        setIsGoogleScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = 'google-client-script';
      script.onload = () => {
        if (isMounted.current) {
          setIsGoogleScriptLoaded(true);
        }
      };
      script.onerror = () => {
        if (isMounted.current) {
          setIsGoogleError(true);
          toast.error("Could not load Google authentication. Please use email instead.");
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize Google Sign-In once script is loaded
  useEffect(() => {
    if (!isGoogleScriptLoaded) return;

    try {
      window.google.accounts.id.initialize({
        client_id: '918336260205-f44lp2stpp5v9lvdkh8dl626jd8e1gmr.apps.googleusercontent.com',
        callback: (response) => {
          if (response && response.credential) {
            handleGoogleLogin(response.credential);
          }
        },
        ux_mode: 'popup',
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: "100%"
        });
      }

      if (mobileGoogleButtonRef.current && isMobileDevice) {
        window.google.accounts.id.renderButton(mobileGoogleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: "100%"
        });
      }
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
      setIsGoogleError(true);
    }
  }, [isGoogleScriptLoaded, googleButtonRef.current, mobileGoogleButtonRef.current]);

  const onSubmit = (data) => {
    sendOTPMutation({ email: data.email, password: data.password });
  };

  return (
    <div className="h-[100svh] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-50/50 items-center justify-center">
        <div className="max-w-full">
          <LazyImage
            src={Images.welcome}
            alt="Login illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-blue-900 font-nunito animate-in fade-in duration-500">
                Admin Portal
              </h1>
              <p className="text-gray-600 font-medium text-lg">
                Welcome to Admin Portal
              </p>
              <p className="text-gray-500">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit"
                disabled={isOTPSending}
                className="w-full py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold transition-colors"
              >
                {isOTPSending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-blue-900 hover:underline font-medium text-sm transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Info text */}
            <div className="text-center">
              <p className="text-sm text-blue-900 font-medium">
                New user? Your password will be set for your account.<br />
                Existing user? We'll verify your credentials.
              </p>
            </div>

            {/* Desktop Google Sign-In */}
            {!isMobileDevice && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div ref={googleButtonRef} className="w-full">
                  {!isGoogleScriptLoaded && (
                    <Button 
                      disabled
                      className="w-full py-2.5 rounded-lg border border-gray-300 bg-white text-gray-500"
                    >
                      Loading Google Sign-In...
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Mobile Google Sign-In */}
            {isMobileDevice && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div ref={mobileGoogleButtonRef} className="w-full">
                  {!isGoogleScriptLoaded && (
                    <Button 
                      disabled
                      className="w-full py-2.5 rounded-lg border border-gray-300 bg-white text-gray-500"
                    >
                      Loading Google Sign-In...
                    </Button>
                  )}
                </div>

                {isGoogleError && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mt-3">
                    <p className="font-medium">Note:</p>
                    <p>Some mobile devices may have issues with Google Sign-In. If you encounter problems, please use email login instead.</p>
                  </div>
                )}
              </>
            )}

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
