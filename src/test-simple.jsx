// Simple test component to verify React is working
import React from 'react';

const TestSimple = () => {
  return (
    <div style={{ 
      padding: '50px', 
      color: 'white', 
      fontSize: '24px',
      backgroundColor: 'red',
      zIndex: 9999,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <h1>TEST: If you see this, React is working!</h1>
    </div>
  );
};

export default TestSimple;

