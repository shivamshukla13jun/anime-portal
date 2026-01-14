import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RouterConfig from './routes/RouterConfig';

const App: React.FC = () => {
  return (
    <Router 
      future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}
    >
      <RouterConfig />
    </Router>
  );
};

export default App;