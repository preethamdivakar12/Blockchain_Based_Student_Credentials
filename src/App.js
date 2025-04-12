import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import GovernmentPage from './GovernmentPage';
import OrganizationPage from './OrganizationPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/government" element={<GovernmentPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;