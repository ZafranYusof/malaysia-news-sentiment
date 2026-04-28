import React from 'react';

const SidebarToggle = ({ isOpen, onToggle }) => {
  return (
    <div className="sidebar-toggle-container">
      <input 
        type="checkbox" 
        id="sidebar-checkbox" 
        checked={isOpen} 
        onChange={onToggle} 
      />
      <label htmlFor="sidebar-checkbox" className="sidebar-toggle">
        <div className="bars" id="bar1" />
        <div className="bars" id="bar2" />
        <div className="bars" id="bar3" />
      </label>
    </div>
  );
};

export default SidebarToggle;
