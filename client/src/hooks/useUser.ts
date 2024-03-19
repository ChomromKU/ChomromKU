import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocalStorage } from "./useLocalStorage";
import { User } from "../types/auth";


export const useUser = () => {
  const { user, isAuthenticated, setUser } = useContext(AuthContext);
  const { setItem } = useLocalStorage();

  const addUser = (user: User) =>{
    // console.log('addUser', user);
    setUser(true, user);
    setItem("user", JSON.stringify(user));
  };

  const removeUser = () => {
    setUser(false, null);
    setItem("user", "");
  };

  return { user, addUser, removeUser, setUser}
}