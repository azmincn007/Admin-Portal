import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { User, Settings, Star, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutConfirmationModal from '../Modal/Log-Out-Confirmation';

const ProfilePopover = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Popover className="px-4">
        <PopoverTrigger asChild>
          <Button 
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-blue-50 hover:text-blue-600 rounded-full px-4 py-2 border-gray-200"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">Account</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 bg-white shadow-lg rounded-lg px-4 py-2">
          <div className="flex flex-col">
            <div 
              role="button"
              className="flex items-center gap-2 text-left py-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => navigate('/my-profile')}
            >
              <User className="h-4 w-4 text-gray-600" />
              <span>Edit Profile</span>
            </div>
            <div 
              role="button"
              className="flex items-center gap-2 text-left py-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              <Settings className="h-4 w-4 text-gray-600" />
              <span>Settings</span>
            </div>
            <div 
              role="button"
              className="flex items-center gap-2 text-left py-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => navigate('/my-ads')}
            >
              <Star className="h-4 w-4 text-gray-600" />
              <span>My Ads</span>
            </div>
            <div 
              role="button"
              className="flex items-center gap-2 text-left py-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => navigate('/my-favourites')}
            >
              <Heart className="h-4 w-4 text-gray-600" />
              <span>Favorites</span>
            </div>
            <div 
              role="button"
              className="flex items-center gap-2 text-left py-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => {
                setIsLogoutModalOpen(true);
                setIsPopoverOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 text-gray-600" />
              <span>Log Out</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Use the shared LogoutConfirmationModal component */}
      <LogoutConfirmationModal 
        isOpen={isLogoutModalOpen} 
        setIsOpen={setIsLogoutModalOpen} 
      />
    </>
  );
};

export default ProfilePopover;