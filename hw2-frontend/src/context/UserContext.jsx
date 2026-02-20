import React, { createContext, useState } from 'react'; 
/**
 * UserContext provides user state management across the app.
 * It stores the current user, handles login/logout, and persists
 * the user in localStorage for persistence across page reloads.
 */

// Create context for user data and actions
export const UserContext = createContext();

// UserProvider component wraps the app and provides user context
export const UserProvider = ({ children }) => {
  // Initialize user state, loading from localStorage if available
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Function to log in a user and save to localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Function to log out a user and remove from localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Provide user, setUser, login, and logout to all children via context
  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
