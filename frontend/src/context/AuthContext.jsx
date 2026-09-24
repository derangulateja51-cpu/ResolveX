import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, DEMO_USERS } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing stored session
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      // Default to student demo user for instant hackathon evaluation convenience if not set
      // (or let them see login page)
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const switchRole = (role) => {
    const newUser = authService.switchDemoRole(role);
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isMockMode: authService.isMockMode(),
        login,
        logout,
        switchRole,
        demoUsers: DEMO_USERS,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
