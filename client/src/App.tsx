import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RouterConfig from './routes/RouterConfig';
import AnimeRouter from './routes/AnimeRouter';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router 
        future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true 
        }}
      >
        <AnimeRouter />
        {/* <RouterConfig /> */}
      </Router>
    </AuthProvider>
  );
};

export default App;