import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { canSendNotifications } from '@/lib/notifications';
import AuthModal from './AuthModal';
import NotificationSettingsModal from './NotificationSettingsModal';

export default function UserMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const hasNotificationPermission = canSendNotifications();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-lime/30 text-lime text-sm hover:bg-lime/10 transition-colors"
        >
          <span>🌿</span>
          <span>로그인</span>
        </motion.button>
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/20 border border-lime/30 text-lime text-sm hover:bg-lime/30 transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-lime flex items-center justify-center text-xs text-foreground">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </span>
        <span className="hidden sm:inline">내 정보</span>
      </motion.button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)} 
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 w-48 glass rounded-xl p-2 z-50"
          >
            <div className="px-3 py-2 border-b border-border/50 mb-2">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">로그인됨</p>
            </div>
            
            <button
              onClick={() => {
                setShowDropdown(false);
                setIsNotifSettingsOpen(true);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🔔</span>
                <span>알림 설정</span>
              </div>
              {!hasNotificationPermission && (
                <span className="w-2 h-2 rounded-full bg-orange-400" />
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>로그아웃</span>
            </button>
          </motion.div>
        </>
      )}
      
      <NotificationSettingsModal 
        isOpen={isNotifSettingsOpen} 
        onClose={() => setIsNotifSettingsOpen(false)} 
      />
    </div>
  );
}
