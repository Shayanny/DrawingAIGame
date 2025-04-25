import React from 'react';
import './Toolbar.css';

const Toolbar = ({ onClear, onNext }) => {
    return (
      <div className="toolbar-container">
       <button className="toolbar-button" onClick={onClear}>Clear</button>
       <button className="toolbar-button" onClick={onNext}>Next</button>
      </div>
    );
  };
  
  export default Toolbar;
  