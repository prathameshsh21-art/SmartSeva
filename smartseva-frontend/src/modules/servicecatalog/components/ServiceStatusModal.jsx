import React, { useState, useEffect, useRef } from 'react';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'doc'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export default function ServiceStatusModal({ show, service, onClose, onSubmit, isSubmitting = false }) {
  const [status, setStatus] = useState('NEW');
  const [pendingReason, setPendingReason] = useState('');
  const [remarks, setRemarks] = useState('');

  // Multi-channel selection state
  const [selectedChannels, setSelectedChannels] = useState({
    SMS: false,
    WHATSAPP: false,
    EMAIL: false,
  });

  // Completion documents uploaded directly from computer via File Explorer
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (service && show) {
      setStatus(service.status || 'NEW');
      setPendingReason(service.pendingReason || '');
      setRemarks(service.remarks || '');
      setFormError('');
      setSelectedFiles([]);

      // Default notification channels based on customer contact info
      const hasEmail = Boolean(service.customerEmail);
      const hasPhone = Boolean(service.customerPhone);

      setSelectedChannels({
        SMS: hasPhone,
        WHATSAPP: hasPhone,
        EMAIL: hasEmail,
      });
    }
  }, [service, show]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setFormError('');
  };

  if (!show || !service) {
    return null;
  }

  const isAllChannelsSelected =
    selectedChannels.SMS && selectedChannels.WHATSAPP && selectedChannels.EMAIL;

  const handleToggleAllChannels = (e) => {
    const checked = e.target.checked;
    setSelectedChannels({
      SMS: checked,
      WHATSAPP: checked,
      EMAIL: checked,
    });
  };

  const handleChannelChange = (channelKey) => {
    setSelectedChannels((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const handleAddDocumentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setFormError('');
    const newValidFiles = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFormError(`File "${file.name}" has an unsupported extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFormError(`File "${file.name}" exceeds the 20MB maximum size limit.`);
        return;
      }
      // Avoid exact duplicates in list
      const isDuplicate = selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (!isDuplicate) {
        newValidFiles.push(file);
      }
    }

    setSelectedFiles((prev) => [...prev, ...newValidFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      return <i className="bi bi-file-earmark-pdf-fill text-danger fs-4 me-2"></i>;
    }
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      return <i className="bi bi-file-earmark-image-fill text-success fs-4 me-2"></i>;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <i className="bi bi-file-earmark-word-fill text-primary fs-4 me-2"></i>;
    }
    return <i className="bi bi-file-earmark-text-fill text-secondary fs-4 me-2"></i>;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const isPending =
      status === 'PENDING' ||
      status === 'WAITING_FOR_DOCUMENT' ||
      status === 'SERVER_ISSUE';

    if (status === 'PENDING' && (!pendingReason || pendingReason.trim() === '')) {
      setFormError('Please select a Pending Reason when moving a service to PENDING status.');
      return;
    }

    // Build selected channels array
    const channels = [];
    if (selectedChannels.SMS) channels.push('SMS');
    if (selectedChannels.WHATSAPP) channels.push('WHATSAPP');
    if (selectedChannels.EMAIL) channels.push('EMAIL');

    if (channels.length === 0) {
      setFormError('Please select at least one notification channel (SMS, WhatsApp, Email, or All).');
      return;
    }

    // Pass payload to parent component (including files selected from computer)
    onSubmit({
      serviceId: service.serviceId,
      status,
      pendingReason: isPending && pendingReason && pendingReason.trim() !== '' ? pendingReason.trim() : null,
      remarks: remarks && remarks.trim() !== '' ? remarks.trim() : null,
      channels,
      files: status === 'COMPLETED' ? selectedFiles : [],
    });
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-arrow-repeat me-2"></i> Update Service Status & Customer Notification
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {formError && (
                <div className="alert alert-danger d-flex align-items-center py-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
                  <div>{formError}</div>
                </div>
              )}

              {/* Customer & Service Overview Card */}
              <div className="card bg-light border-0 mb-4">
                <div className="card-body p-3">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="text-muted small">Service Order</div>
                      <div className="fw-bold text-dark">
                        #{service.serviceId} — {service.serviceName}
                      </div>
                      {service.applicationNumber && (
                        <div className="small text-secondary">
                          App No: <span className="font-monospace fw-semibold">{service.applicationNumber}</span>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small">Customer Contact</div>
                      <div className="fw-semibold text-dark">
                        <i className="bi bi-person me-1"></i>
                        {service.customerName || 'N/A'}
                      </div>
                      <div className="small text-secondary">
                        <i className="bi bi-telephone me-1"></i>
                        {service.customerPhone || <span className="text-danger">No phone on file</span>}
                        {service.customerEmail && (
                          <span className="ms-2">
                            <i className="bi bi-envelope me-1"></i>
                            {service.customerEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifecycle Status Selection */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-uppercase text-secondary">
                    Current Status
                  </label>
                  <div className="form-control-plaintext fw-bold text-primary">
                    {service.status || 'NEW'}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-uppercase text-secondary">
                    New Status <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select fw-semibold"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    required
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="WAITING_FOR_DOCUMENT">WAITING_FOR_DOCUMENT</option>
                    <option value="SERVER_ISSUE">SERVER_ISSUE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Pending Reason (if applicable) */}
              {(status === 'PENDING' || status === 'WAITING_FOR_DOCUMENT' || status === 'SERVER_ISSUE') && (
                <div className="mb-3 p-3 bg-warning-subtle rounded border border-warning">
                  <label className="form-label fw-semibold small text-dark">
                    Pending Reason <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={pendingReason}
                    onChange={(e) => setPendingReason(e.target.value)}
                    required={status === 'PENDING'}
                  >
                    <option value="">-- Select Reason --</option>
                    <option value="MISSING_DOCUMENTS">MISSING_DOCUMENTS</option>
                    <option value="SERVER_DOWN">SERVER_DOWN</option>
                    <option value="INCORRECT_INFO">INCORRECT_INFO</option>
                    <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                    <option value="PORTAL_ERROR">PORTAL_ERROR</option>
                    <option value="DOCUMENT_VERIFICATION">DOCUMENT_VERIFICATION</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              )}

              <hr className="my-4" />

              {/* Multi-Channel Selection Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold mb-0">
                    <i className="bi bi-broadcast me-1 text-primary"></i> Notify Customer Through <span className="text-danger">*</span>
                  </label>
                  <div className="form-check form-check-inline mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="channel-all"
                      checked={isAllChannelsSelected}
                      onChange={handleToggleAllChannels}
                    />
                    <label className="form-check-label fw-semibold small text-primary" htmlFor="channel-all">
                      Select All Channels
                    </label>
                  </div>
                </div>
                <div className="text-muted small mb-3">
                  Choose the preferred communication channel(s) based on the customer's device access.
                </div>

                <div className="row g-2">
                  {/* SMS Channel */}
                  <div className="col-md-4">
                    <div className={`card h-100 border p-3 ${selectedChannels.SMS ? 'border-primary bg-primary-subtle' : 'border-light-subtle'}`}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="channel-sms"
                          checked={selectedChannels.SMS}
                          onChange={() => handleChannelChange('SMS')}
                        />
                        <label className="form-check-label fw-bold d-block" htmlFor="channel-sms">
                          <i className="bi bi-chat-text text-secondary me-1"></i> SMS
                        </label>
                        <div className="text-muted extra-small mt-1" style={{ fontSize: '0.78rem' }}>
                          {service.customerPhone ? (
                            <span className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              {service.customerPhone}
                            </span>
                          ) : (
                            <span className="text-danger">
                              <i className="bi bi-x-circle me-1"></i>
                              No phone number
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Channel */}
                  <div className="col-md-4">
                    <div className={`card h-100 border p-3 ${selectedChannels.WHATSAPP ? 'border-success bg-success-subtle' : 'border-light-subtle'}`}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="channel-whatsapp"
                          checked={selectedChannels.WHATSAPP}
                          onChange={() => handleChannelChange('WHATSAPP')}
                        />
                        <label className="form-check-label fw-bold d-block" htmlFor="channel-whatsapp">
                          <i className="bi bi-whatsapp text-success me-1"></i> WhatsApp
                        </label>
                        <div className="text-muted extra-small mt-1" style={{ fontSize: '0.78rem' }}>
                          {service.customerPhone ? (
                            <span className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              {service.customerPhone}
                            </span>
                          ) : (
                            <span className="text-danger">
                              <i className="bi bi-x-circle me-1"></i>
                              No phone number
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Channel */}
                  <div className="col-md-4">
                    <div className={`card h-100 border p-3 ${selectedChannels.EMAIL ? 'border-primary bg-primary-subtle' : 'border-light-subtle'}`}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="channel-email"
                          checked={selectedChannels.EMAIL}
                          onChange={() => handleChannelChange('EMAIL')}
                        />
                        <label className="form-check-label fw-bold d-block" htmlFor="channel-email">
                          <i className="bi bi-envelope text-primary me-1"></i> Email
                        </label>
                        <div className="text-muted extra-small mt-1 text-truncate" style={{ fontSize: '0.78rem' }}>
                          {service.customerEmail ? (
                            <span className="text-success" title={service.customerEmail}>
                              <i className="bi bi-check-circle me-1"></i>
                              {service.customerEmail}
                            </span>
                          ) : (
                            <span className="text-warning">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              No email on file
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPLETED STATUS: Completion-Time Document Upload Section */}
              {status === 'COMPLETED' && (
                <div className="mb-4 p-3 bg-light rounded border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold mb-0">
                      <i className="bi bi-file-earmark-arrow-up text-success me-1"></i> Documents to Send
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary fw-semibold"
                      onClick={handleAddDocumentClick}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-plus-lg me-1"></i> Add Document
                    </button>
                  </div>
                  <div className="text-muted small mb-3">
                    Attach completed documents from your computer (e.g. Completed Certificate, Application Receipt). Selected files will be attached to emails and securely linked for the citizen.
                  </div>

                  {/* Hidden OS File Explorer Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                    onChange={handleFileSelection}
                    style={{ display: 'none' }}
                  />

                  {selectedFiles.length === 0 ? (
                    <div className="text-center py-4 px-3 bg-white border border-dashed rounded text-muted">
                      <i className="bi bi-file-earmark-plus display-6 text-secondary d-block mb-2"></i>
                      <div className="fw-semibold">No documents selected.</div>
                      <div className="extra-small text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                        Click below to open File Explorer and attach completed documents (PDF, JPG, PNG, DOCX).
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary px-3 fw-semibold"
                        onClick={handleAddDocumentClick}
                        disabled={isSubmitting}
                      >
                        <i className="bi bi-folder2-open me-1"></i> + Add Document
                      </button>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush border rounded bg-white shadow-sm">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="list-group-item d-flex align-items-center justify-content-between py-2 px-3"
                        >
                          <div className="d-flex align-items-center text-truncate me-2">
                            {getFileIcon(file.name)}
                            <div className="text-truncate">
                              <div className="fw-semibold small text-dark text-truncate" title={file.name}>
                                {file.name}
                              </div>
                              <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger border-0 px-2 py-1"
                            title="Remove file"
                            onClick={() => handleRemoveFile(idx)}
                            disabled={isSubmitting}
                          >
                            <i className="bi bi-trash3 me-1"></i> Remove
                          </button>
                        </div>
                      ))}
                      <div className="list-group-item bg-light-subtle d-flex justify-content-between align-items-center py-2 px-3">
                        <span className="small text-muted fw-semibold">
                          Total: {selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} (
                          {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))})
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-primary text-decoration-none p-0 fw-semibold"
                          onClick={handleAddDocumentClick}
                          disabled={isSubmitting}
                        >
                          + Add More
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-muted extra-small" style={{ fontSize: '0.78rem' }}>
                    <i className="bi bi-shield-lock me-1"></i>
                    <strong>Delivery Method:</strong> Email receives direct file attachments. SMS / WhatsApp receive authorized, secure download links.
                  </div>
                </div>
              )}

              {/* Remarks / Processing Notes */}
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary text-uppercase">
                  Processing Remarks / Customer Notes
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Add optional comments or instructions for the customer..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 fw-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating & Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-1"></i> Update & Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}