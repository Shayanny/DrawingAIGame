import React from 'react';
import './Toolbar.css';

const Toolbar = ({ onClear, onSave }) => {
    return (
      <div className="toolbar-container">
       <button className="toolbar-button" onClick={onClear}>Clear</button>
       <button className="toolbar-button" onClick={onSave}>Save</button>
      </div>
    );
  };
  
  export default Toolbar;
  