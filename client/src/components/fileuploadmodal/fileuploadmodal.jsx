import React, { useState, useRef } from "react";
import "./fileuploadmodal.css";

const FileUploadModal = ({ showModal, handleClose, setFiles }) => {
  const [evidenceFileName, setEvidenceFileName] = useState(null);
  const [policyFileName, setPolicyFileName] = useState(null);
  
  const evidenceInputRef = useRef(null);
  const policyInputRef = useRef(null);

  const handleFileClick = (inputRef) => {
    inputRef.current.click(); // Trigger file input click
  };

  const handleFileSelection = () => {
    const evidenceFile = evidenceInputRef.current.files[0];
    const policyFile = policyInputRef.current.files[0];

    if (!evidenceFile || !policyFile) {
      alert("Please upload both evidence and policy files.");
      return;
    }

    setFiles({ evidence: evidenceFile, policy: policyFile });
    setEvidenceFileName(null)
    setPolicyFileName(null)
    handleClose();
  };

  const handleFileRemoval = () => {
    setFiles({ evidence: null, policy: null });
    handleClose();
  };

  const handleEvidenceFileChange = () => {
    const file = evidenceInputRef.current.files[0];
    setEvidenceFileName(file ? file.name : null); // Set the name of the evidence file
  };

  const handlePolicyFileChange = () => {
    const file = policyInputRef.current.files[0];
    setPolicyFileName(file ? file.name : null); // Set the name of the policy file
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload policy and evidence</h2>
          <button onClick={handleClose} className="close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="upload-section">
            <label htmlFor="policy" className="upload-label">
              Policy:
            </label>
            <div
              className="file-upload"
              onClick={() => handleFileClick(policyInputRef)}
            >
              <i className="fas fa-paperclip"></i>
              {policyFileName ? (
                <span className="file-name">{policyFileName}</span>
              ) : (
                <span>Click to upload file</span>
              )}
            </div>
            <input
              type="file"
              id="policy"
              name="policy"
              ref={policyInputRef}
              style={{ display: "none" }}
              onChange={handlePolicyFileChange}
              accept=".pdf, .txt, .docx" 
            />
          </div>
          <div className="upload-section">
            <label htmlFor="evidence" className="upload-label">
              Evidence:
            </label>
            <div
              className="file-upload"
              onClick={() => handleFileClick(evidenceInputRef)}
            >
              <i className="fas fa-paperclip"></i>
              {evidenceFileName ? (
                <span className="file-name">{evidenceFileName}</span>
              ) : (
                <span>Click to upload file</span>
              )}
            </div>
            <input
              type="file"
              id="evidence"
              name="evidence"
              ref={evidenceInputRef}
              style={{ display: "none" }}
              onChange={handleEvidenceFileChange}
              accept=".pdf, .txt, .docx"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="remove-button" onClick={handleFileRemoval}>
            Remove Files
          </button>
          <button className="upload-button" onClick={handleFileSelection}>
            Save Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
