import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { useUser } from '../components/context/UserContext';

export const useProfileCheck = () => {
  const { isLoggedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkProfileAndNavigate = (targetPath = '/category-selection') => {
    if (!isLoggedIn) {
      navigate('/login');
      return false;
    }

    const isProfileComplete = user?.name && user?.location && user?.phone ;
    if (!isProfileComplete) {
      setIsModalOpen(true);
      return false;
    }

    navigate(targetPath);
    return true;
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    closeModal,
    checkProfileAndNavigate,
    isProfileComplete: user?.name && user?.location && user?.phone,
    isLoggedIn
  };
}; 