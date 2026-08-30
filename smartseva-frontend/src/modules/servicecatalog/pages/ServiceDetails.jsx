import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../../../components/ui/StatusBadge';
import ServiceStatusModal from '../components/ServiceStatusModal';
import ServiceFormModal from '../components/ServiceFormModal';
import FileUploadModal from '../../document/components/FileUploadModal';
import { serviceCatalogService } from '../../../api/services/serviceCatalogService';
import { documentService } from '../../../api/services/documentService';
import { formatDateTime } from '../../../utils/dateUtils';
import { openSmsComposer, openWhatsApp } from '../../../utils/phoneUtils';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);

  const loadServiceDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await serviceCatalogService.getById(id);
      const serviceData = res?.data || res;
      setService(serviceData);

      // Load attached documents
      try {
        const docsRes = await documentService.getByServiceId(id);
        const docsData = docsRes?.data || docsRes;
        setDocuments(Array.isArray(docsData) ? docsData : []);
      } catch (docErr) {
        console.warn('Could not load service documents:', docErr);
        setDocuments([]);
      }
    } catch (err) {
      console.error('Failed to load service details:', err);
      setError('Failed to load service details. It may not exist or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadServiceDetails();
    }
  }, [id]);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusSubmit = async (payload) => {
    try {
      setIsUpdatingStatus(true);
      const response = await serviceCatalogService.updateStatus(payload);
      if (response?.success === false) {
        alert(response.message || 'Status update failed');
        return;
      }
      const data = response?.data || response;
      let alertMsg = `Service Status: ✓ ${data?.status || payload.status}\n`;
      if (data?.notificationResults && data.notificationResults.length > 0) {
        alertMsg += '\nCustomer Notifications:\n';
        data.notificationResults.forEach((res) => {
          if (res.channel === 'SMS') {
            if (res.actionLink) {
              openSmsComposer(service?.customerPhone || '', res.rawMessage);
            }
            alertMsg += `📱 SMS — Composer opened. Please press Send on your device.\n`;
          } else if (res.channel === 'WHATSAPP') {
            if (res.actionLink) {
              openWhatsApp(service?.customerPhone || '', res.rawMessage);
            }
            alertMsg += `💬 WhatsApp — Opened. Please press Send.\n`;
          } else if (res.channel === 'EMAIL') {
            if (res.success) {
              alertMsg += `✓ Email — Sent successfully via SmartSeva Mailer\n`;
            } else {
              alertMsg += `✗ Email — Failed: ${res.failureReason || 'SMTP error'}\n`;
            }
          }
        });
      }
      if (data?.sharedDocumentNames && data.sharedDocumentNames.length > 0) {
        alertMsg += `\nDocuments:\n`;
        data.sharedDocumentNames.forEach((doc) => {
          alertMsg += `✓ ${doc} — Stored & Delivered\n`;
        });
      }
      alert(alertMsg);
      setShowStatusModal(false);
      await loadServiceDetails();
    } catch (err) {
      console.error('Failed to update service status:', err);
      alert(err?.message || 'Failed to update service status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await serviceCatalogService.update(id, formData);
      if (response?.success === false) {
        alert(response.message || 'Failed to update service');
        return;
      }
      alert('Service updated successfully!');
      setShowEditModal(false);
      await loadServiceDetails();
    } catch (err) {
      console.error('Failed to edit service:', err);
      alert(err?.message || 'Failed to update service');
    }
  };

  const handleDownloadDoc = async (doc) => {
    try {
      const blob = await documentService.download(doc.documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalFileName || `doc-${doc.documentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document.');
    }
  };

  const handleDeleteDoc = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.originalFileName}"?`)) return;
    try {
      await documentService.delete(doc.documentId);
      alert('Document deleted successfully.');
      await loadServiceDetails();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading service...</span>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="alert alert-danger my-4">
        {error || 'Service order not found.'}
        <div className="mt-3">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/services')}>
            ← Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Breadcrumb & Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            className="btn btn-outline-secondary btn-sm mb-2"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h3 className="fw-bold mb-0">
            {service.serviceName} <span className="text-muted fs-5">#{service.serviceId}</span>
          </h3>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowEditModal(true)}
          >
            Edit Service
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowStatusModal(true)}
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="row g-4 mb-4">
        {/* Main Service Card */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3">Service Overview</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <span className="text-muted small d-block">Current Status</span>
                  <div className="mt-1">
                    <StatusBadge status={service.status} />
                  </div>
                </div>

                {service.pendingReason && (
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">Pending Reason</span>
                    <span className="badge bg-warning text-dark mt-1">
                      {service.pendingReason}
                    </span>
                  </div>
                )}

                <div className="col-sm-6">
                  <span className="text-muted small d-block">Application / Ack Number</span>
                  <span className="fw-semibold text-dark">
                    {service.applicationNumber || 'Not provided'}
                  </span>
                </div>

                <div className="col-sm-6">
                  <span className="text-muted small d-block">Portal Login ID</span>
                  <span className="fw-semibold text-dark">
                    {service.portalLoginId || 'Not provided'}
                  </span>
                </div>

                <div className="col-sm-6">
                  <span className="text-muted small d-block">Temporary Password</span>
                  {service.status === 'COMPLETED' ? (
                    <span className="badge bg-secondary">
                      <i className="bi bi-shield-slash me-1"></i>Permanently Erased (Service Completed)
                    </span>
                  ) : service.portalPassword ? (
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <code className="bg-light px-2 py-1 rounded text-primary fw-bold">
                        {showTempPassword ? service.portalPassword : '••••••••••••'}
                      </code>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm py-0 px-2"
                        onClick={() => setShowTempPassword(!showTempPassword)}
                        title={showTempPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`bi ${showTempPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm py-0 px-2"
                        onClick={() => {
                          navigator.clipboard.writeText(service.portalPassword);
                          alert('Temporary password copied to clipboard!');
                        }}
                        title="Copy password"
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted small">Not provided</span>
                  )}
                </div>

                <div className="col-sm-6">
                  <span className="text-muted small d-block">Portal Link</span>
                  {service.portalLink ? (
                    <a
                      href={service.portalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-decoration-none"
                    >
                      {service.portalLink} ↗
                    </a>
                  ) : (
                    <span className="text-muted">Not specified</span>
                  )}
                </div>

                <div className="col-sm-6">
                  <span className="text-muted small d-block">Assigned Staff</span>
                  <span className="fw-semibold">{service.staffName || 'System Admin'}</span>
                </div>

                <div className="col-sm-6">
                  <span className="text-muted small d-block">Initiated Date</span>
                  <span>{formatDateTime(service.createdDate)}</span>
                </div>

                {service.completedDate && (
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">Completed Date</span>
                    <span className="text-success fw-semibold">
                      {formatDateTime(service.completedDate)}
                    </span>
                  </div>
                )}

                <div className="col-12">
                  <span className="text-muted small d-block">Remarks / Instructions</span>
                  <p className="mb-0 text-secondary bg-light p-2 rounded small mt-1">
                    {service.remarks || 'No remarks added.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attached Documents */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h5 className="card-title fw-bold mb-0">Attached Documents</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowUploadModal(true)}
                >
                  + Upload Document
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No documents uploaded for this service order yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Uploaded By</th>
                        <th>Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.documentId}>
                          <td className="fw-semibold text-primary">
                            {doc.originalFileName}
                          </td>
                          <td>{doc.fileType || 'Document'}</td>
                          <td>{doc.uploadedByName || 'Staff'}</td>
                          <td>{formatDateTime(doc.uploadedAt)}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleDownloadDoc(doc)}
                            >
                              Download
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteDoc(doc)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Information Sidebar Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2 mb-3">Customer Details</h5>
              <div className="mb-3">
                <span className="text-muted small d-block">Full Name</span>
                <span className="fw-bold fs-6">{service.customerName}</span>
              </div>
              <div className="mb-3">
                <span className="text-muted small d-block">Phone Number</span>
                <span className="fw-semibold text-dark">{service.customerPhone || '-'}</span>
              </div>
              <div className="mb-3">
                <span className="text-muted small d-block">Customer ID</span>
                <span className="badge bg-secondary">#{service.customerId}</span>
              </div>

              {service.customerId && (
                <Link
                  to={`/customers/${service.customerId}`}
                  className="btn btn-outline-secondary btn-sm w-100 mt-2"
                >
                  View Full Customer Workspace →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ServiceStatusModal
        show={showStatusModal}
        service={service}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusSubmit}
        isSubmitting={isUpdatingStatus}
      />

      <ServiceFormModal
        show={showEditModal}
        initialData={service}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
      />

      <FileUploadModal
        show={showUploadModal}
        serviceId={service.serviceId}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={() => {
          alert('Document uploaded successfully!');
          loadServiceDetails();
        }}
      />
    </div>
  );
}