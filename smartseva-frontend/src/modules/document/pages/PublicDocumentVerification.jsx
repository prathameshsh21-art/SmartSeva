import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../../api/services/documentService';
import { formatDateTime } from '../../../utils/dateUtils';
import { useToast } from '../../../context/ToastContext';

export default function PublicDocumentVerification() {
  const { showError } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setVerificationResult(null);
    setLoading(true);

    try {
      const response = await documentService.verifyPublic({
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: dateOfBirth,
      });

      const data = response?.data || response;
      if (data && data.downloadToken) {
        setVerificationResult(data);
      } else {
        setError('No verified records found with the provided details.');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Verification failed. Please ensure the phone number and date of birth match our records.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    if (!verificationResult?.downloadToken) return;
    setDownloadingId(doc.documentId);
    try {
      const response = await documentService.downloadPublic(
        doc.documentId,
        verificationResult.downloadToken
      );

      const blob = new Blob([response.data || response], {
        type: doc.fileType || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalFileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      showError('Failed to download document. The token may have expired. Please verify again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {/* Header Card */}
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">SmartSeva Citizen Portal</h2>
            <p className="text-muted">
              Secure Document Verification & Certificate Download
            </p>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 fw-bold">
              Citizen Identity Verification
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-4">
                Please enter your registered mobile number and date of birth to securely access your service certificates and acknowledgements.
              </p>

              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  <i className="bi bi-exclamation-octagon-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Registered Mobile Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">+91</span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">
                    Date of Birth <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Verifying Identity...
                    </>
                  ) : (
                    'Verify & Access Documents'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Verification Results & Download Table */}
          {verificationResult && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Verified: {verificationResult.customerName}
                </span>
                <span className="badge bg-light text-success">
                  {verificationResult.documents?.length || 0} Available
                </span>
              </div>

              <div className="card-body p-0">
                {(!verificationResult.documents || verificationResult.documents.length === 0) ? (
                  <p className="text-muted text-center py-4 mb-0">
                    No active documents currently found for this profile.
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {verificationResult.documents.map((doc) => (
                      <li
                        key={doc.documentId}
                        className="list-group-item d-flex justify-content-between align-items-center py-3"
                      >
                        <div>
                          <div className="fw-semibold text-dark">
                            <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                            {doc.originalFileName}
                          </div>
                          <small className="text-muted">
                            Uploaded: {formatDateTime(doc.uploadedAt)}
                          </small>
                        </div>

                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.documentId}
                        >
                          {downloadingId === doc.documentId ? (
                            'Downloading...'
                          ) : (
                            <>
                              <i className="bi bi-download me-1"></i> Download
                            </>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card-footer bg-light text-muted small text-center py-2">
                <i className="bi bi-shield-lock-fill me-1"></i>
                Session protected with 15-minute time-limited cryptographic token
              </div>
            </div>
          )}

          {/* Footer Back link */}
          <div className="text-center mt-4">
            <Link to="/login" className="text-decoration-none small text-muted">
              Staff or Administrator Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}