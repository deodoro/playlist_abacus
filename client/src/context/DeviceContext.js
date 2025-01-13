import React, { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [activeDeviceId, setActiveDeviceId] = useState("");

  return (
    <DeviceContext.Provider value={{ activeDeviceId, setActiveDeviceId }}>
      {children}
    </DeviceContext.Provider>
  );
};

DeviceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useDevice = () => useContext(DeviceContext);
