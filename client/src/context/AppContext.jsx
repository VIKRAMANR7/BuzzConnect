import axios from "axios";
import { createContext, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const value = {
    axios,
    location,
    navigate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
