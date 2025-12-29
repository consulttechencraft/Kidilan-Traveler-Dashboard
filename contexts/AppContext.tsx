import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, Page, User } from '../types';
import { login as apiLogin, getMe } from '../api/mockApi';

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, _setActivePage] = useState<Page>(() => {
    // Get initial page from URL hash or default to 'products'
    const hash = window.location.hash.replace('#', '');
    const validPages: Page[] = ['dashboard', 'products', 'categories', 'orders', 'reports', 'offers', 'websiteContent', 'settings'];
    return validPages.includes(hash as Page) ? (hash as Page) : 'products';
  });
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

    // Update URL hash to reflect current page
    window.location.hash = page;
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    _setActivePage('products');
    showToast("You have been successfully logged out.");
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      // Cache the user for offline/resilient startup
      localStorage.setItem('authUser', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user data", error);
      throw error; // Let caller decide how to handle
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Check sessionStorage first, then localStorage for persistence
        let storedToken = sessionStorage.getItem('authToken');
        if (!storedToken) {
          storedToken = localStorage.getItem('authToken');
          // If found in localStorage, also store in sessionStorage for this session
          if (storedToken) {
            sessionStorage.setItem('authToken', storedToken);
          }
        }

        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          try {
            await fetchUser();
          } catch (err) {
            // If fetching user fails (backend down or token invalid), fall back to cached user if present
            console.warn('Failed to fetch user on init, using cached user if present', err);
            const cached = localStorage.getItem('authUser');
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                setUser(parsed);
                showToast('Using cached profile (offline mode).');
              } catch (e) {
                console.error('Failed to parse cached authUser', e);
              }
            } else {
              // Do not force logout here to avoid logging the admin out unexpectedly on refresh
              console.warn('No cached profile available. User will be required to login again if server validation is needed.');
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize app", error);
        // avoid logging out the user automatically on init errors
      }
      setIsLoading(false);
    };

    initialize();
  }, [fetchUser]);

  // Listen for hash changes to update active page when user navigates via browser
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validPages: Page[] = ['dashboard', 'products', 'categories', 'orders', 'reports', 'offers', 'websiteContent', 'settings'];
      if (validPages.includes(hash as Page) && hash !== activePage) {
        _setActivePage(hash as Page);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activePage]);

  const login = async (name: string, password: string) => {
    const { user, token: authToken } = await apiLogin(name, password);
    sessionStorage.setItem('authToken', authToken);
    localStorage.setItem('authToken', authToken); // Persist across page refreshes
    localStorage.setItem('authUser', JSON.stringify(user));
    setToken(authToken);
    setUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.name}!`);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
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
    updateUser,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};