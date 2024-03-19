import React, { createContext, useContext, useReducer } from "react";
import { User } from "../types/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthAction {
  type: 'LOGIN' | 'LOGOUT';
  payload?: User | null;
}

interface AuthContextType extends AuthState {
  setUser: (isAuthenticate: boolean, user: User | null) => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        user: action.payload || null,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  //TODO: the setUser function is not being used
  //implement the setUser function to set the user state
  const setUser = (isAuthenticated: boolean, user: User | null) => {
    console.log('Setting user:', { isAuthenticated, user });
    dispatch({ type: isAuthenticated ? 'LOGIN' : 'LOGOUT', payload: user });
  };
  

  return (
    <AuthContext.Provider value={{ ...state, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
