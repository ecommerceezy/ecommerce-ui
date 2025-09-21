"use client";
import { createContext, useContext, useState } from "react";

const appContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [prevPath, setPrevPath] = useState("");
  const [search, setSearch] = useState("");
  const [searchCtgs, setSearchCtgs] = useState([]);
  const [cart, setCart] = useState(0);

  return (
    <appContext.Provider
      value={{
        prevPath,
        setPrevPath,
        search,
        setSearch,
        cart,
        setCart,
        searchCtgs,
        setSearchCtgs,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(appContext);

  return context;
};
