import React, { useState } from 'react';
import { documentService } from '../../../api/services/documentService';

export default function FileUploadModal({
  show,
  onClose,
  serviceId = null,
  services = [],
  onUploadSuccess,
}) {
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];
  const maxSizeBytes = 20 * 1024 * 1024; // 20 MB

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }

    const ext = selected.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Invalid file type (.${ext}). Allowed types: PDF, JPG, JPEG, PNG, DOCX`);
      setFile(null);
      return;
    }

    if (selected.size > maxSizeBytes) {
      setError('File exceeds the maximum allowed size of 20MB.');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const targetServiceId = serviceId || selectedServiceId;
    if (!targetServiceId) {
      setError('Please select or specify a service order.');
      return;
    }
    if (!file) {
      setError('Please select a valid document file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const response = await documentService.upload(targetServiceId, file);
      if (response?.success === false) {
        setError(response.message || 'Upload failed');
        return;
      }
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Upload Service Document</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={uploading}
            ></button>
          </div>

          <form onSubmit={handleUpload}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}

              {!serviceId && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Select Target Service Order <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a Service Order --</option>
                    {services.map((s) => (
                      <option key={s.serviceId} value={s.serviceId}>
                        #{s.serviceId} - {s.serviceName} ({s.customerName || 'Customer'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Document File <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleFileChange}
                  required
                />
                <div className="form-text small">
                  Supported formats: PDF, JPG, PNG, DOCX (Max: 20MB)
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}