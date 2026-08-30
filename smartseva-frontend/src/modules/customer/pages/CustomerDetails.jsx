import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../../../components/ui/StatusBadge';
import AddCustomerModal from '../components/AddCustomerModal';
import ServiceFormModal from '../../servicecatalog/components/ServiceFormModal';
import ServiceStatusModal from '../../servicecatalog/components/ServiceStatusModal';
import FileUploadModal from '../../document/components/FileUploadModal';
import SendNotificationModal from '../../notification/components/SendNotificationModal';
import { customerService } from '../../../api/services/customerService';
import { serviceCatalogService } from '../../../api/services/serviceCatalogService';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import { openSmsComposer, openWhatsApp } from '../../../utils/phoneUtils';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals state
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getById(id);
      const data = response?.data || response;
      if (data) {
        setCustomer(data);
      } else {
        setError('Customer not found.');
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
      setError(err?.message || 'Failed to load customer details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerServices = async () => {
    setServicesLoading(true);
    try {
      const response = await serviceCatalogService.getByCustomer(id);
      const data = response?.data || response;
      if (Array.isArray(data)) {
        setServices(data);
      } else if (data?.content && Array.isArray(data.content)) {
        setServices(data.content);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.warn('Failed to load services for customer:', err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer();
      fetchCustomerServices();
    }
  }, [id]);

  const handleEditCustomerSubmit = async (formData) => {
    try {
      const response = await customerService.update(id, formData);
      if (response?.success === false) {
        alert(response.message || 'Failed to update customer');
        return;
      }
      alert('Customer updated successfully!');
      setShowEditCustomerModal(false);
      await fetchCustomer();
    } catch (err) {
      console.error('Failed to update customer:', err);
      alert(err?.message || 'Failed to update customer');
    }
  };

  const handleCreateServiceSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        customerId: parseInt(id, 10),
      };
      const response = await serviceCatalogService.create(payload);
      if (response?.success === false) {
        alert(response.message || 'Failed to create service order');
        return;
      }
      alert('Service order created successfully!');
      setShowCreateServiceModal(false);
      await fetchCustomerServices();
    } catch (err) {
      console.error('Failed to create service order:', err);
      alert(err?.message || 'Failed to create service order');
    }
  };

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
              openSmsComposer(selectedService?.customerPhone || customer?.phoneNumber || '', res.rawMessage);
            }
            alertMsg += `📱 SMS — Composer opened. Please press Send on your device.\n`;
          } else if (res.channel === 'WHATSAPP') {
            if (res.actionLink) {
              openWhatsApp(selectedService?.customerPhone || customer?.phoneNumber || '', res.rawMessage);
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
      setSelectedService(null);
      await fetchCustomerServices();
    } catch (err) {
      console.error('Failed to update service status:', err);
      alert(err?.message || 'Failed to update service status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading customer workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="card shadow-sm p-4">
        <div className="alert alert-danger" role="alert">
          {error || 'Customer not found.'}
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary mt-3"
          onClick={() => navigate('/customers')}
        >
          ← Back to Customers
        </button>
      </div>
    );
  }

  const activeServices = services.filter((s) => s.status !== 'COMPLETED' && s.status !== 'REJECTED' && s.status !== 'CANCELLED');
  const pastServices = services.filter((s) => s.status === 'COMPLETED' || s.status === 'REJECTED' || s.status === 'CANCELLED');

  return (
    <div>
      {/* Top Action Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/customers')}
          >
            ← Back to Directory
          </button>
          <h3 className="fw-bold mb-0">Customer Workspace</h3>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => setShowSendNotificationModal(true)}
          >
            <i className="bi bi-send-fill me-1"></i> Send Notification
          </button>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setShowEditCustomerModal(true)}
          >
            Edit Customer
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateServiceModal(true)}
          >
            + New Service Order
          </button>
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
              style={{ width: '52px', height: '52px', fontSize: '1.4rem' }}
            >
              {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h4 className="fw-bold mb-0">{customer.fullName}</h4>
              <small className="text-muted">Customer ID: #{customer.customerId}</small>
            </div>
          </div>
          <span
            className={`badge ${
              customer.isArchived ? 'bg-danger' : 'bg-success'
            } fs-6 px-3 py-2`}
          >
            {customer.isArchived ? 'Archived' : 'Active Customer'}
          </span>
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <label className="text-muted small fw-semibold d-block">Phone Number</label>
              <span className="fs-6 fw-medium text-dark">{customer.phoneNumber || '-'}</span>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="text-muted small fw-semibold d-block">Date of Birth</label>
              <span className="fs-6 fw-medium text-dark">{formatDate(customer.dateOfBirth)}</span>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="text-muted small fw-semibold d-block">Email Address</label>
              <span className="fs-6 fw-medium text-dark">{customer.email || 'Not Provided'}</span>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="text-muted small fw-semibold d-block">Customer Since</label>
              <span className="fs-6 fw-medium text-dark">{formatDate(customer.createdDate)}</span>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-3 pt-3 border-top">
              <label className="text-muted small fw-semibold d-block">Customer Notes</label>
              <p className="mb-0 text-secondary small">{customer.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Services Workspace Tabs / Grid */}
      <div className="row g-4">
        {/* Active Services Section */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0">Active Service Orders</h5>
                <span className="badge bg-primary rounded-pill">{activeServices.length}</span>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowCreateServiceModal(true)}
              >
                + Add Service for {customer.fullName}
              </button>
            </div>

            <div className="card-body p-0">
              {servicesLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                </div>
              ) : activeServices.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-2">No active services for this customer.</p>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowCreateServiceModal(true)}
                  >
                    Initiate a New Service Order
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Service Name</th>
                        <th>Status</th>
                        <th>Application No</th>
                        <th>Initiated Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeServices.map((s) => (
                        <tr key={s.serviceId}>
                          <td className="fw-bold">#{s.serviceId}</td>
                          <td className="fw-semibold text-primary">
                            <Link to={`/services/${s.serviceId}`} className="text-decoration-none">
                              {s.serviceName}
                            </Link>
                          </td>
                          <td>
                            <StatusBadge status={s.status} />
                            {s.pendingReason && (
                              <span className="badge bg-warning text-dark ms-1 small">
                                {s.pendingReason}
                              </span>
                            )}
                          </td>
                          <td>{s.applicationNumber || '-'}</td>
                          <td>{formatDateTime(s.createdDate)}</td>
                          <td className="text-end">
                            <Link
                              to={`/services/${s.serviceId}`}
                              className="btn btn-sm btn-outline-secondary me-1"
                            >
                              Details
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => {
                                setSelectedService(s);
                                setShowStatusModal(true);
                              }}
                            >
                              Status
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => {
                                setSelectedService(s);
                                setShowUploadModal(true);
                              }}
                            >
                              Upload Doc
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

        {/* Completed / Past Services Section */}
        {pastServices.length > 0 && (
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="fw-bold mb-0 text-muted">Service History & Completed Orders</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Service Name</th>
                        <th>Status</th>
                        <th>Application No</th>
                        <th>Completed Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastServices.map((s) => (
                        <tr key={s.serviceId}>
                          <td className="fw-bold">#{s.serviceId}</td>
                          <td className="fw-semibold">
                            <Link to={`/services/${s.serviceId}`} className="text-decoration-none text-dark">
                              {s.serviceName}
                            </Link>
                          </td>
                          <td>
                            <StatusBadge status={s.status} />
                          </td>
                          <td>{s.applicationNumber || '-'}</td>
                          <td>{formatDateTime(s.completedDate || s.createdDate)}</td>
                          <td className="text-end">
                            <Link
                              to={`/services/${s.serviceId}`}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              View Archive
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCustomerModal
        show={showEditCustomerModal}
        initialData={customer}
        onClose={() => setShowEditCustomerModal(false)}
        onSave={handleEditCustomerSubmit}
      />

      <ServiceFormModal
        show={showCreateServiceModal}
        customer={customer}
        onClose={() => setShowCreateServiceModal(false)}
        onSubmit={handleCreateServiceSubmit}
      />

      <ServiceStatusModal
        show={showStatusModal}
        service={selectedService}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedService(null);
        }}
        onSubmit={handleStatusSubmit}
        isSubmitting={isUpdatingStatus}
      />

      <FileUploadModal
        show={showUploadModal}
        serviceId={selectedService?.serviceId}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedService(null);
        }}
        onUploadSuccess={() => {
          alert('Document uploaded successfully!');
          fetchCustomerServices();
        }}
      />

      <SendNotificationModal
        isOpen={showSendNotificationModal}
        initialCustomer={customer}
        onClose={() => setShowSendNotificationModal(false)}
        onSuccess={() => {
          // notification dispatched
        }}
      />
    </div>
  );
}