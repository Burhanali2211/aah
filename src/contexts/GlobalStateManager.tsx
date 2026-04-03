import React, { createContext, useContext, ReactNode, useReducer, useMemo, useEffect } from 'react';
import { User } from '../types';

// Global state structure
interface GlobalState {
  user: {
    currentUser: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    preferences: Record<string, any>;
  };
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
    notifications: Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      timestamp: number;
    }>;
    modals: Record<string, boolean>;
    loading: Record<string, boolean>;
  };
  network: {
    isOnline: boolean;
  };
}

// Action types for global state
type GlobalAction = 
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_USER_LOADING'; loading: boolean }
  | { type: 'SET_USER_PREFERENCES'; preferences: Record<string, any> }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'ADD_NOTIFICATION'; notification: Omit<GlobalState['ui']['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; id: string }
  | { type: 'SET_MODAL'; modalId: string; isOpen: boolean }
  | { type: 'SET_LOADING'; key: string; loading: boolean }
  | { type: 'SET_NETWORK_STATUS'; isOnline: boolean };

// Global state reducer
function globalStateReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          ...state.user,
          currentUser: action.user,
          isAuthenticated: !!action.user,
          loading: false
        }
      };

    case 'SET_USER_LOADING':
      return {
        ...state,
        user: { ...state.user, loading: action.loading }
      };

    case 'SET_USER_PREFERENCES':
      return {
        ...state,
        user: { ...state.user, preferences: { ...state.user.preferences, ...action.preferences } }
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.theme }
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };

    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        ui: { ...state.ui, mobileMenuOpen: !state.ui.mobileMenuOpen }
      };

    case 'ADD_NOTIFICATION': {
      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, { ...action.notification, id, timestamp: Date.now() }]
        }
      };
    }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.id)
        }
      };

    case 'SET_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: { ...state.ui.modals, [action.modalId]: action.isOpen }
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: { ...state.ui.loading, [action.key]: action.loading }
        }
      };

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        network: { isOnline: action.isOnline }
      };

    default:
      return state;
  }
}

// Initial global state
const initialGlobalState: GlobalState = {
  user: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    preferences: {}
  },
  ui: {
    theme: 'light',
    sidebarOpen: false,
    mobileMenuOpen: false,
    notifications: [],
    modals: {},
    loading: {}
  },
  network: {
    isOnline: navigator.onLine
  }
};

interface GlobalStateContextType {
  state: GlobalState;
  actions: {
    setUser: (user: User | null) => void;
    setUserLoading: (loading: boolean) => void;
    setUserPreferences: (preferences: Record<string, any>) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSidebar: () => void;
    toggleMobileMenu: () => void;
    addNotification: (notification: Omit<GlobalState['ui']['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    setModal: (modalId: string, isOpen: boolean) => void;
    setLoading: (key: string, loading: boolean) => void;
    setNetworkStatus: (isOnline: boolean) => void;
  };
  selectors: {
    isAuthenticated: () => boolean;
    getCurrentUser: () => User | null;
    getTheme: () => 'light' | 'dark';
    isLoading: (key: string) => boolean;
    getNotifications: () => GlobalState['ui']['notifications'];
    isModalOpen: (modalId: string) => boolean;
    getNetworkStatus: () => boolean;
  };
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error('useGlobalState must be used within a GlobalStateProvider');
  return context;
};

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalStateReducer, initialGlobalState);

  const actions = useMemo(() => ({
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', user }),
    setUserLoading: (loading: boolean) => dispatch({ type: 'SET_USER_LOADING', loading }),
    setUserPreferences: (preferences: Record<string, any>) => dispatch({ type: 'SET_USER_PREFERENCES', preferences }),
    setTheme: (theme: 'light' | 'dark') => dispatch({ type: 'SET_THEME', theme }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    toggleMobileMenu: () => dispatch({ type: 'TOGGLE_MOBILE_MENU' }),
    addNotification: (notification: Omit<GlobalState['ui']['notifications'][0], 'id' | 'timestamp'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', notification });
    },
    removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', id }),
    setModal: (modalId: string, isOpen: boolean) => dispatch({ type: 'SET_MODAL', modalId, isOpen }),
    setLoading: (key: string, loading: boolean) => dispatch({ type: 'SET_LOADING', key, loading }),
    setNetworkStatus: (isOnline: boolean) => dispatch({ type: 'SET_NETWORK_STATUS', isOnline })
  }), []);

  const selectors = useMemo(() => ({
    isAuthenticated: () => state.user.isAuthenticated,
    getCurrentUser: () => state.user.currentUser,
    getTheme: () => state.ui.theme,
    isLoading: (key: string) => state.ui.loading[key] || false,
    getNotifications: () => state.ui.notifications,
    isModalOpen: (modalId: string) => state.ui.modals[modalId] || false,
    getNetworkStatus: () => state.network.isOnline
  }), [state]);

  useEffect(() => {
    const handleOnline = () => actions.setNetworkStatus(true);
    const handleOffline = () => actions.setNetworkStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [actions]);

  const contextValue = useMemo(() => ({ state, actions, selectors }), [state, actions, selectors]);

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
};
