import React, { useState } from "react";
  
export const Context = React.createContext();
export const ContextProvider = ({ children }) => {
    const [own, setOwn] = useState(true);
  
    return (
        <Context.Provider value={{ own, setOwn }}>
            {children}
        </Context.Provider>
    );
};