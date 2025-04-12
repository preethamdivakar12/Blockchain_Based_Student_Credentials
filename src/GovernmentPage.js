import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';
import { Contract } from 'ethers';

import MetaMaskModal from './MetaMaskModal';
import './GovernmentPage.css';

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
  "function issueCertificate(address _student, string memory _certType, string memory _name, string memory _course, string memory _ipfsHash) public",
  "function revokeCertificate(address _student, string memory _certType) public",
  "function getCertificateTypes(address _student) public view returns (string[] memory)",
  "function verifyCertificate(address _student, string memory _certType) public view returns (string memory, string memory, string memory, bool)",
  "function admin() public view returns (address)"
];

function GovernmentPage() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState('issue');
  
  // Form states
  const [studentAddress, setStudentAddress] = useState('');
  const [studentName, setStudentName] = useState('');
  const [certType, setCertType] = useState('');
  const [course, setCourse] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [revokeAddress, setRevokeAddress] = useState('');
  const [revokeCertType, setRevokeCertType] = useState('');
  const [viewAddress, setViewAddress] = useState('');
  const [certificates, setCertificates] = useState([]);
  
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
          const signer = await provider.getSigner();
          const contractAddress = "0xfb62b875157ebf38857424C35589ea9daC3B30Da";
        //   const contract = new ethers.Contract(contractAddress, contractABI, signer);
          const contract = new Contract(contractAddress, contractABI, signer);
          setContract(contract);
          
          // Check if user is admin
          // const adminAddress = await contract.admin();
          const adminAddress = "0xE9861AB154a31099879e5b9FBab860CC7d101C5B";
          setIsAdmin(adminAddress.toLowerCase() === accounts[0].toLowerCase());
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

  const handleIssue = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      if (!isAdmin) {
        throw new Error("Only admin can issue certificates");
      }
      
      const tx = await contract.issueCertificate(
        studentAddress,
        certType,
        studentName,
        course,
        ipfsHash
      );
      
      await tx.wait();
      setMessage({ type: 'success', text: 'Certificate issued successfully!' });
      
      // Reset form
      setStudentAddress('');
      setStudentName('');
      setCertType('');
      setCourse('');
      setIpfsHash('');
    } catch (error) {
      console.error("Error issuing certificate:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to issue certificate' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      if (!isAdmin) {
        throw new Error("Only admin can revoke certificates");
      }
      
      const tx = await contract.revokeCertificate(revokeAddress, revokeCertType);
      await tx.wait();
      
      setMessage({ type: 'success', text: 'Certificate revoked successfully!' });
      
      // Reset form
      setRevokeAddress('');
      setRevokeCertType('');
    } catch (error) {
      console.error("Error revoking certificate:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to revoke certificate' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setCertificates([]);
    
    try {
      // Get all certificate types for this student
      const certTypes = await contract.getCertificateTypes(viewAddress);
      
      if (certTypes.length === 0) {
        setMessage({ type: 'info', text: 'No certificates found for this address' });
        return;
      }
      
      // Get details for each certificate
      const certDetails = await Promise.all(
        certTypes.map(async (type) => {
          try {
            const [name, certType, ipfsHash, isValid] = await contract.verifyCertificate(viewAddress, type);
            return { name, certType, ipfsHash, isValid };
          } catch (error) {
            return null;
          }
        })
      );
      
      // Filter out any failed lookups
      const validCerts = certDetails.filter(cert => cert !== null);
      setCertificates(validCerts);
      
      if (validCerts.length === 0) {
        setMessage({ type: 'info', text: 'No valid certificates found' });
      }
    } catch (error) {
      console.error("Error viewing certificates:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to view certificates' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasMetaMask) {
    return <MetaMaskModal show={showModal} onClose={() => window.location.href = '/'} />;
  }

  return (
    <div className="government-page">
      <div className="header">
        <Link to="/" className="back-button">← Back to Home</Link>
        <h1>Government Portal</h1>
        <p>Issue, revoke, and manage student credentials</p>
        {account && <div className="account">Connected: {account.substring(0, 6)}...{account.substring(38)}</div>}
        {!isAdmin && <div className="admin-warning">Warning: You are not the admin of this contract</div>}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'issue' ? 'active' : ''}`} 
          onClick={() => setActiveTab('issue')}
        >
          Issue Certificate
        </button>
        <button 
          className={`tab ${activeTab === 'revoke' ? 'active' : ''}`} 
          onClick={() => setActiveTab('revoke')}
        >
          Revoke Certificate
        </button>
        <button 
          className={`tab ${activeTab === 'view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('view')}
        >
          View Certificates
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tab-content">
        {activeTab === 'issue' && (
          <form onSubmit={handleIssue} className="form">
            <h2>Issue New Certificate</h2>
            
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
              <label>Student Name</label>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={studentName} 
                onChange={(e) => setStudentName(e.target.value)} 
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
            
            <div className="form-group">
              <label>Course/Program</label>
              <input 
                type="text" 
                placeholder="Course Name" 
                value={course} 
                onChange={(e) => setCourse(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>IPFS Hash (Document Reference)</label>
              <input 
                type="text" 
                placeholder="IPFS Hash" 
                value={ipfsHash} 
                onChange={(e) => setIpfsHash(e.target.value)} 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading || !isAdmin}
            >
              {isLoading ? "Processing..." : "Issue Certificate"}
            </button>
          </form>
        )}

        {activeTab === 'revoke' && (
          <form onSubmit={handleRevoke} className="form">
            <h2>Revoke Certificate</h2>
            
            <div className="form-group">
              <label>Student Wallet Address</label>
              <input 
                type="text" 
                placeholder="0x..." 
                value={revokeAddress} 
                onChange={(e) => setRevokeAddress(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Certificate Type</label>
              <select 
                value={revokeCertType} 
                onChange={(e) => setRevokeCertType(e.target.value)} 
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
              className="submit-button revoke" 
              disabled={isLoading || !isAdmin}
            >
              {isLoading ? "Processing..." : "Revoke Certificate"}
            </button>
          </form>
        )}

        {activeTab === 'view' && (
          <div className="view-section">
            <form onSubmit={handleView} className="form">
              <h2>View Student Certificates</h2>
              
              <div className="form-group">
                <label>Student Wallet Address</label>
                <input 
                  type="text" 
                  placeholder="0x..." 
                  value={viewAddress} 
                  onChange={(e) => setViewAddress(e.target.value)} 
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button view" 
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "View Certificates"}
              </button>
            </form>

            {certificates.length > 0 && (
              <div className="certificates-table">
                <h3>Certificates</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Certificate Type</th>
                      <th>IPFS Hash</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert, index) => (
                      <tr key={index}>
                        <td>{cert.name}</td>
                        <td>{cert.certType}</td>
                        <td className="hash">{cert.ipfsHash}</td>
                        <td className={cert.isValid ? "valid" : "invalid"}>
                          {cert.isValid ? "Valid" : "Revoked"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GovernmentPage;