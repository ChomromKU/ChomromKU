import { useEffect } from "react";
import { useUser } from "./useUser";
import { User } from "../types/auth";
import { useLocalStorage } from "./useLocalStorage";

export const useAuth = () => {
  const { user, addUser, removeUser, setUser } = useUser();
  const { getItem } = useLocalStorage();

  const login = async (user: User) => {
    addUser(user);
  };

  const logout = async () => {
    removeUser();
  };

  return { user, login, logout, setUser };
};
