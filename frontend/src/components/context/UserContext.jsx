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
  
  console.log('UserProvider - isLoggedIn:', isLoggedIn);

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      console.log('UserContext - queryFn called');
      if (!isLoggedIn) {
        console.log('UserContext - Not logged in');
        return null;
      }
      
      try {
        console.log('UserContext - Getting valid access token...');
        const accessToken = await getValidAccessToken();
        
        if (!accessToken) {
          console.log('UserContext - No valid access token');
          return null;
        }
        
        console.log('UserContext - Making API call...');
        const response = await axios.get(`${MoovoUrl}/api/adminportal/user-details`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log('User details response:', response.data);
        console.log('User details user:', response.data.user);
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

  console.log('UserProvider - userData:', userData);
  console.log('UserProvider - isLoading:', isLoading);
  console.log('UserProvider - error:', error);

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
