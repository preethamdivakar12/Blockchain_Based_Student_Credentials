import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrowserProvider } from 'ethers';
import { Contract } from 'ethers';
import MetaMaskModal from './MetaMaskModal';
import './OrganizationPage.css';

// Certificate types
const certificateTypes = [
  "SSLC", 
  "PUC", 
  "Engineering 1 Year", 
  "Engineering 2 Year", 
  "Engineering final Year", 
  "Diploma", 
  "Resume", 
  "Other"
];

// Contract ABI - simplified for this example
const contractABI = [
  "function verifyCertificate(address _student, string memory _certType) public view returns (string memory, string memory, string memory, bool)"
];

function OrganizationPage() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  
  // Form states
  const [studentAddress, setStudentAddress] = useState('');
  const [certType, setCertType] = useState('');
  const [certificate, setCertificate] = useState(null);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        setHasMetaMask(true);
        
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          
          // Set up provider and contract
          const provider = new BrowserProvider(window.ethereum);
          const contractAddress = "0xfb62b875157ebf38857424C35589ea9daC3B30Da";
          const contract = new Contract(contractAddress, contractABI, provider);

          setContract(contract);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
          setMessage({ type: 'error', text: 'Failed to connect to MetaMask' });
        }
      } else {
        setHasMetaMask(false);
        setShowModal(true);
      }
    };
    
    checkMetaMask();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setCertificate(null);
    
    try {
      const result = await contract.verifyCertificate(studentAddress, certType);
      
      setCertificate({
        name: result[0],
        certType: result[1],
        ipfsHash: result[2],
        isValid: result[3]
      });
      
      setMessage({ 
        type: result[3] ? 'success' : 'warning', 
        text: result[3] ? 'Certificate verified successfully!' : 'Certificate has been revoked!' 
      });
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setMessage({ type: 'error', text: 'Certificate not found or invalid' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasMetaMask) {
    return <MetaMaskModal show={showModal} onClose={() => window.location.href = '/'} />;
  }

  return (
    <div className="organization-page">
      <div className="header">
        <Link to="/" className="back-button">← Back to Home</Link>
        <h1>Organization Portal</h1>
        <p>Verify student credentials</p>
        {account && <div className="account">Connected: {account.substring(0, 6)}...{account.substring(38)}</div>}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="verify-container">
        <div className="verify-form-container">
          <form onSubmit={handleVerify} className="form">
            <h2>Verify Certificate</h2>
            
            <div className="form-group">
              <label>Student Wallet Address</label>
              <input 
                type="text" 
                placeholder="0x..." 
                value={studentAddress} 
                onChange={(e) => setStudentAddress(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Certificate Type</label>
              <select 
                value={certType} 
                onChange={(e) => setCertType(e.target.value)} 
                required
              >
                <option value="">Select Certificate Type</option>
                {certificateTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Certificate"}
            </button>
          </form>
        </div>

        {certificate && (
          <div className="certificate-result">
            <div className={`certificate-status ${certificate.isValid ? 'valid' : 'invalid'}`}>
              {certificate.isValid ? 'VALID' : 'REVOKED'}
            </div>
            
            <div className="certificate-details">
              <div className="detail-group">
                <label>Student Name</label>
                <div className="detail-value">{certificate.name}</div>
              </div>
              
              <div className="detail-group">
                <label>Certificate Type</label>
                <div className="detail-value">{certificate.certType}</div>
              </div>
              
              <div className="detail-group">
                <label>IPFS Document Hash</label>
                <div className="detail-value hash">{certificate.ipfsHash}</div>
              </div>
              
              <div className="detail-group">
                <label>Verification Result</label>
                <div className={`detail-value ${certificate.isValid ? 'valid-text' : 'invalid-text'}`}>
                  {certificate.isValid 
                    ? 'This certificate is authentic and currently valid.' 
                    : 'This certificate has been revoked and is no longer valid.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationPage;