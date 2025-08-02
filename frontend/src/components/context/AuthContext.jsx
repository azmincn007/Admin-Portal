import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoovoUrl } from "@/utils/apiConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to refresh access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('moovoRefreshToken');
    
    if (!refreshToken) {
      handleLogout();
      return null;
    }

    try {
      const response = await fetch(`${MoovoUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Store new access token
      localStorage.setItem('moovoAccessToken', data.accessToken);
      
      // Update refresh token if provided
      if (data.refreshToken) {
        localStorage.setItem('moovoRefreshToken', data.refreshToken);
      }

      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
      return null;
    }
  };

  // Function to check if token is expired (basic check)
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Function to get valid access token
  const getValidAccessToken = async () => {
    let accessToken = localStorage.getItem('moovoAccessToken');
    
    if (!accessToken || isTokenExpired(accessToken)) {
      accessToken = await refreshAccessToken();
    }
    
    return accessToken;
  };

  useEffect(() => {
    // Check for tokens on mount and update login state
    const accessToken = localStorage.getItem('moovoAccessToken');
    const refreshToken = localStorage.getItem('moovoRefreshToken');
    
    if (accessToken || refreshToken) {
      setIsLoggedIn(true);
    } else {
      handleLogout();
    }

    setIsLoading(false);

    // Cleanup function to handle Google Sign-In
    return () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
      
      // Remove any existing Google Sign-In scripts
      const scripts = document.querySelectorAll('script[src*="accounts.google.com/gsi/client"]');
      scripts.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  const login = (tokens) => {
    // Handle both old format (single token) and new format (object with tokens)
    if (typeof tokens === 'string') {
      // Legacy support - treat as access token
      localStorage.setItem('moovoAccessToken', tokens);
    } else {
      // New format with separate tokens
      localStorage.setItem('moovoAccessToken', tokens.accessToken);
      localStorage.setItem('moovoRefreshToken', tokens.refreshToken);
    }
    
    
    
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear all relevant storage items
    localStorage.removeItem('moovoAccessToken');
    localStorage.removeItem('moovoRefreshToken');
    localStorage.removeItem('moovoToken'); // Remove legacy token
    
    // Cancel Google Sign-In if it exists
    if (window.google && window.google.accounts) {
      window.google.accounts.id.cancel();
    }
    
    // Update state
    setIsLoggedIn(false);
  };

  const logout = () => {
    handleLogout();
    // Navigate to login page
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isLoading,
      login, 
      logout, 
      getValidAccessToken,
      refreshAccessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
