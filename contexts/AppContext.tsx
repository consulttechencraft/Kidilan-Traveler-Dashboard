import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, Page, User } from '../types';
import { login as apiLogin, getMe } from '../api/mockApi';

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, _setActivePage] = useState<Page>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear search when navigating away from products page
  const setActivePage = (page: Page) => {
    if (activePage === 'products' && page !== 'products') {
      setSearchQuery('');
    }
    _setActivePage(page);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };
  
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('authToken');
    _setActivePage('products');
    showToast("You have been successfully logged out.");
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user data", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const storedToken = sessionStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          await fetchUser();
        }
      } catch (error) {
        console.error("Failed to initialize app", error);
        logout();
      }
      setIsLoading(false);
    };

    initialize();
  }, [fetchUser, logout]);

  const login = async (name: string, password: string) => {
    const { user, token: authToken } = await apiLogin(name, password);
    sessionStorage.setItem('authToken', authToken);
    setToken(authToken);
    setUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.name}!`);
  };

  const contextValue: AppContextType = {
    activePage,
    setActivePage,
    searchQuery,
    setSearchQuery,
    toastMessage,
    showToast,
    isAuthenticated,
    token,
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};