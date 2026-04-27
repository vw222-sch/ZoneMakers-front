import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import * as AuthLib from '@/lib/auth';

export interface AuthState {
    token: string | null;
    user: User | null;
    userId: number | null;
    isAdmin: boolean;
    isLoggedIn: boolean;
}

const AuthContext = createContext<{
    state: AuthState;
    login: (token: string, userId: number, userData: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    canEditUser: (userId: number | string) => boolean;
} | undefined>(undefined);

// Provides global auth state and methods via React Context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>(() => ({
        token: AuthLib.getToken(),
        user: AuthLib.getUser(),
        userId: AuthLib.getUserId(),
        isAdmin: AuthLib.isAdmin(),
        isLoggedIn: AuthLib.isLoggedIn(),
    }));

    // Stores auth data and updates context state
    const login = useCallback((token: string, userId: number, userData: User) => {
        AuthLib.setAuth(token, userId, userData);
        setState({
            token,
            user: userData,
            userId,
            isAdmin: Boolean(userData.admin),
            isLoggedIn: true,
        });
    }, []);

    // Clears auth data and resets context state
    const logout = useCallback(() => {
        AuthLib.logout();
        setState({
            token: null,
            user: null,
            userId: null,
            isAdmin: false,
            isLoggedIn: false,
        });
    }, []);

    // Merges partial updates into user data in context
    const updateUser = useCallback((updates: Partial<User>) => {
        AuthLib.updateUserData(updates);
        const updated = AuthLib.getUser();
        if (updated) {
            setState(prev => ({ ...prev, user: updated }));
        }
    }, []);

    // Checks if current user can edit target user
    const canEditUser = useCallback((userId: number | string): boolean => {
        return AuthLib.canEditUser(userId);
    }, []);

    return (
        <AuthContext.Provider value={{ state, login, logout, updateUser, canEditUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to access auth state and methods
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};