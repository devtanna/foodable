import React, { useState } from 'react';

const AppContext = React.createContext();

const AppProvider = (props) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <AppContext.Provider value={{
      sidebarVisible,
      setSidebarVisible,
      searchModalOpen,
      setSearchModalOpen
    }}>
      {props.children}
    </AppContext.Provider>
  )
};

export { AppContext, AppProvider };
