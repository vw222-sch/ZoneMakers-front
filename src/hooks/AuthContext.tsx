/**
 * useAuth hook - GLOBÁLIS Auth állapotkezelés React Context segítségével
 */

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>(() => ({
        token: AuthLib.getToken(),
        user: AuthLib.getUser(),
        userId: AuthLib.getUserId(),
        isAdmin: AuthLib.isAdmin(),
        isLoggedIn: AuthLib.isLoggedIn(),
    }));

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

    const updateUser = useCallback((updates: Partial<User>) => {
        AuthLib.updateUserData(updates);
        const updated = AuthLib.getUser();
        if (updated) {
            setState(prev => ({ ...prev, user: updated }));
        }
    }, []);

    const canEditUser = useCallback((userId: number | string): boolean => {
        return AuthLib.canEditUser(userId);
    }, []);

    return (
        <AuthContext.Provider value={{ state, login, logout, updateUser, canEditUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth-ot csak AuthProvider-en belül lehet használni!');
    }
    return context;
};