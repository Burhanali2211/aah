import React, { memo, ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ShoppingProvider } from './ShoppingContext';
import { NotificationProvider } from './NotificationContext';
import { ProductProvider } from './ProductContext';
import { ErrorProvider } from './ErrorContext';
import { ThemeProvider } from './ThemeContext';
import { SettingsProvider } from './SettingsContext';
import { NetworkStatusProvider } from '../components/Common/NetworkStatusProvider';

interface CombinedProviderProps {
    children: ReactNode;
}

/**
 * Combined provider that wraps all context providers in a single component
 * This reduces the nesting level and improves performance
 */
export const CombinedProvider = memo<CombinedProviderProps>(({ children }) => {
    return (
        <ErrorProvider>
            <ThemeProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <SettingsProvider>
                            <ProductProvider>
                                <ShoppingProvider>
                                    <NetworkStatusProvider>
                                        {children}
                                    </NetworkStatusProvider>
                                </ShoppingProvider>
                            </ProductProvider>
                        </SettingsProvider>
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </ErrorProvider>
    );
});

CombinedProvider.displayName = 'CombinedProvider';