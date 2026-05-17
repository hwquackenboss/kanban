import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const isAuthenticated = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    return !!token;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('userRoleId');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
