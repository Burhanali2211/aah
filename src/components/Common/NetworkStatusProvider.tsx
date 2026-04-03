import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CheckCircle } from 'lucide-react';

interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used within a NetworkStatusProvider');
  return context;
};

export const NetworkStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-0 left-0 right-0 p-3 z-[9999] shadow-lg ${
              isOnline ? 'bg-emerald-600' : 'bg-red-600'
            } text-white`}
          >
            <div className="container mx-auto flex items-center justify-center space-x-3">
              {isOnline ? <CheckCircle className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              <span className="font-medium">
                {isOnline ? 'Connection restored! You are back online.' : 'You are currently offline. Check your connection.'}
              </span>
              <button 
                onClick={() => setShowNotification(false)}
                className="ml-4 hover:bg-white/20 p-1 rounded"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NetworkContext.Provider>
  );
};

export const ConnectionQualityIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isOnline } = useNetwork();
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <span className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
};
