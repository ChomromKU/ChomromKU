import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (isAuthenticate: boolean, user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const storedAuthState = localStorage.getItem("authState");
    if (storedAuthState) {
      return JSON.parse(storedAuthState);
    } else {
      return {
        isAuthenticated: false,
        user: null,
      };
    }
  });

  const setUser = (isAuthenticated: boolean, user: User | null) => {
    setAuthState({ isAuthenticated, user });
    localStorage.setItem("authState", JSON.stringify({ isAuthenticated, user }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
