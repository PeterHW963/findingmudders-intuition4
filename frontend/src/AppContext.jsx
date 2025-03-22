// AppContext.js
import React, { createContext, useState } from 'react';

// Create the context
export const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [sharedState, setSharedState] = useState(null); // General shared state

  return (
    <AppContext.Provider value={{ sharedState, setSharedState }}>
      {children} {/* Children will be the rest of your app */}
    </AppContext.Provider>
  );
};