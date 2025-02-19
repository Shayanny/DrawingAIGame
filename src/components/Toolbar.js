import React from 'react';

const Toolbar = ({ onClear, onSave }) => {
    return (
      <div >
       <button onClick={onClear}>Clear</button>
       <button onClick={onSave}>Save</button>
      </div>
    );
  };
  
  export default Toolbar;
  