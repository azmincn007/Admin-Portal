import { createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MoovoUrl } from "@/utils/apiConfig";
import { useAuth } from './AuthContext';

const UserContext = createContext();

export function UserProvider({ children }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, getValidAccessToken } = useAuth();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      if (!isLoggedIn) {
        return null;
      }
      
      try {
        const accessToken = await getValidAccessToken();
        
        if (!accessToken) {
          return null;
        }
        
        const response = await axios.get(`${MoovoUrl}/api/adminportal/user-details`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        return response.data.user;
      } catch (error) {
        console.error('UserContext - API Error:', error);
        // Handle 400, 401, and 404 status codes
        if (error.response?.status === 400 || 
            error.response?.status === 401 || 
            error.response?.status === 404) {
          logout();
        }
        throw error;
      }
    },
    enabled: isLoggedIn,
    retry: false,
    staleTime: 300000, // Cache for 5 minutes
  });

  // Handle error state changes
  useEffect(() => {
    if (error?.response?.status === 400 || 
        error?.response?.status === 401 || 
        error?.response?.status === 404) {
      logout();
    }
  }, [error, logout]);

  const value = {
    user: userData,
    isLoading,
    error
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
