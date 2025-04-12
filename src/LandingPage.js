import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetaMaskModal from './MetaMaskModal';
import './LandingPage.css';

function LandingPage() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      setHasMetaMask(true);
    }
  }, []);

  const handleButtonClick = (e) => {
    if (!hasMetaMask) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <div className="landing-page">
      <div className="container">
        <h1 className="title">Blockchain Based Student Credentials</h1>
        <p className="subtitle">
          A secure and transparent way to issue, verify, and manage academic credentials
          using blockchain technology. Immutable records ensure authenticity and prevent
          fraud in educational certifications.
        </p>

        <div className="buttons-container">
          <Link to="/government" onClick={handleButtonClick}>
            <button className="button government-button">
              <div className="button-icon">🏛️</div>
              <div className="button-text">
                <h2>Government</h2>
                <p>Issue and manage certificates</p>
              </div>
            </button>
          </Link>

          <Link to="/organization" onClick={handleButtonClick}>
            <button className="button organization-button">
              <div className="button-icon">🏢</div>
              <div className="button-text">
                <h2>Organization</h2>
                <p>Verify student certificates</p>
              </div>
            </button>
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Blockchain ensures tamper-proof records</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Fast</h3>
            <p>Instant verification of credentials</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <h3>Accessible</h3>
            <p>Available anywhere, anytime</p>
          </div>
        </div>
      </div>

      <MetaMaskModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default LandingPage;