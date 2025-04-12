// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address public admin;

    struct Certificate {
        string studentName;
        string course;
        string ipfsHash;
        bool isValid;
    }

    // Nested mapping to store multiple certificates per student
    mapping(address => mapping(string => Certificate)) public certificates;

    // Store all cert types issued for each student
    mapping(address => string[]) private certTypes;

    event CertificateIssued(
        address indexed student,
        string certType,
        string ipfsHash
    );
    event CertificateRevoked(address indexed student, string certType);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Issue a certificate
    function issueCertificate(
        address _student,
        string memory _certType,
        string memory _name,
        string memory _course,
        string memory _ipfsHash
    ) public onlyAdmin {
        // If it's a new certType, track it
        require(_student != address(0), "Invalid student address");
        require(bytes(_certType).length > 0, "Certificate type cannot be empty");
        require(bytes(_name).length > 0, "Student name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        if (!certificates[_student][_certType].isValid) {
            certTypes[_student].push(_certType);
        }

        certificates[_student][_certType] = Certificate(
            _name,
            _course,
            _ipfsHash,
            true
        );
        emit CertificateIssued(_student, _certType, _ipfsHash);
    }

    // Verify a specific certificate
    function verifyCertificate(address _student, string memory _certType)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            bool
        )
    {
        Certificate memory cert = certificates[_student][_certType];
        require(cert.isValid, "Certificate does not exist");
        return (cert.studentName, _certType, cert.ipfsHash, cert.isValid);
    }

    // 🔐 Revoke a certificate
    function revokeCertificate(address _student, string memory _certType)
        public
        onlyAdmin
    {
        require(
            certificates[_student][_certType].isValid,
            "Certificate not found or already revoked"
        );

        certificates[_student][_certType].isValid = false;

        // Remove certType from the array
        uint256 len = certTypes[_student].length;
        for (uint256 i = 0; i < len; i++) {
            if (
                keccak256(bytes(certTypes[_student][i])) ==
                keccak256(bytes(_certType))
            ) {
                // Replace with last element and pop
                certTypes[_student][i] = certTypes[_student][len - 1];
                certTypes[_student].pop();
                break;
            }
        }

        emit CertificateRevoked(_student, _certType);
    }

    // 🗂 Get all certificate types issued to a student
    function getCertificateTypes(address _student)
        public
        view
        returns (string[] memory)
    {
        return certTypes[_student];
    }
}
