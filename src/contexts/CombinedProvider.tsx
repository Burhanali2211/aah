import React, { memo, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthContext';
import { ShoppingProvider } from './ShoppingContext';
import { NotificationProvider } from './NotificationContext';
// import { ProductProvider } from './ProductContext'; // Removed as redundant
import { ErrorProvider } from './ErrorContext';
import { ThemeProvider } from './ThemeContext';
import { SettingsProvider } from './SettingsContext';
import { NetworkStatusProvider } from '../components/Common/NetworkStatusProvider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

interface CombinedProviderProps {
    children: ReactNode;
}

/**
 * Combined provider that wraps all context providers in a single component
 * This reduces the nesting level and improves performance
 */
export const CombinedProvider = memo<CombinedProviderProps>(({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorProvider>
                <ThemeProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            <SettingsProvider>
                                <ShoppingProvider>
                                    <NetworkStatusProvider>
                                        {children}
                                    </NetworkStatusProvider>
                                </ShoppingProvider>
                            </SettingsProvider>
                        </AuthProvider>
                    </NotificationProvider>
                </ThemeProvider>
            </ErrorProvider>
        </QueryClientProvider>
    );
});

CombinedProvider.displayName = 'CombinedProvider';