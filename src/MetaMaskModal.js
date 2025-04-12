import React from 'react';
import './MetaMaskModal.css';

function MetaMaskModal({ show, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>MetaMask Required</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="metamask-logo">
            <img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask Logo" />
          </div>
          <p>
            This application requires MetaMask to interact with the blockchain.
            Please install MetaMask to continue.
          </p>
          <div className="modal-buttons">
            <button className="cancel-button" onClick={onClose}>Cancel</button>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="install-button"
            >
              Install MetaMask
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetaMaskModal;