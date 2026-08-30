import React, { useState, useEffect } from 'react';
import { serviceCatalogService } from '../../../api/services/serviceCatalogService';
import { customerService } from '../../../api/services/customerService';

export default function ServiceFormModal({
  show,
  onClose,
  onSubmit,
  customer = null,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    customerId: '',
    serviceName: '',
    applicationNumber: '',
    portalLink: '',
    portalLoginId: '',
    portalPassword: '',
    status: 'NEW',
    pendingReason: '',
    remarks: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customer);

  useEffect(() => {
    // Load service templates
    const loadTemplates = async () => {
      try {
        const res = await serviceCatalogService.getTemplates();
        const data = res?.data || res;
        if (Array.isArray(data)) {
          setTemplates(data);
        }
      } catch (err) {
        console.warn('Could not load service templates:', err);
      }
    };
    if (show) {
      loadTemplates();
    }
  }, [show]);

  useEffect(() => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData((prev) => ({
        ...prev,
        customerId: customer.customerId,
      }));
    } else if (initialData) {
      setSelectedCustomer({
        customerId: initialData.customerId,
        fullName: initialData.customerName,
        phoneNumber: initialData.customerPhone,
      });
      setFormData({
        customerId: initialData.customerId || '',
        serviceName: initialData.serviceName || '',
        applicationNumber: initialData.applicationNumber || '',
        portalLink: initialData.portalLink || '',
        portalLoginId: initialData.portalLoginId || '',
        portalPassword: initialData.portalPassword || '',
        status: initialData.status || 'NEW',
        pendingReason: initialData.pendingReason || '',
        remarks: initialData.remarks || '',
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        customerId: '',
        serviceName: '',
        applicationNumber: '',
        portalLink: '',
        portalLoginId: '',
        portalPassword: '',
        status: 'NEW',
        pendingReason: '',
        remarks: '',
      });
    }
  }, [customer, initialData, show]);

  const handleCustomerSearch = async (query) => {
    setCustomerSearch(query);
    if (!query || query.length < 2) {
      setCustomerOptions([]);
      return;
    }
    setSearchingCustomers(true);
    try {
      const res = await customerService.search(query, 0, 5);
      const pageData = res?.data;
      if (pageData && Array.isArray(pageData.content)) {
        setCustomerOptions(pageData.content);
      } else if (Array.isArray(pageData)) {
        setCustomerOptions(pageData);
      } else {
        setCustomerOptions([]);
      }
    } catch (err) {
      console.error('Customer search error:', err);
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setFormData((prev) => ({ ...prev, customerId: cust.customerId }));
    setCustomerOptions([]);
    setCustomerSearch('');
  };

  const handleTemplateSelect = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setFormData((prev) => ({ ...prev, serviceName: '', portalLink: '' }));
    } else {
      const tpl = templates.find((t) => t.templateName === val || t.name === val);
      setFormData((prev) => ({
        ...prev,
        serviceName: tpl ? tpl.templateName || tpl.name : val,
        portalLink: tpl?.portalUrl || prev.portalLink,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert('Please select or assign a customer for this service order.');
      return;
    }
    if (!formData.serviceName.trim()) {
      alert('Please enter or select a service name.');
      return;
    }
    const isPending =
      formData.status === 'PENDING' ||
      formData.status === 'WAITING_FOR_DOCUMENT' ||
      formData.status === 'SERVER_ISSUE';
    const payload = {
      ...formData,
      serviceName: formData.serviceName.trim(),
      applicationNumber: formData.applicationNumber?.trim() || null,
      portalLink: formData.portalLink?.trim() || null,
      portalLoginId: formData.portalLoginId?.trim() || null,
      portalPassword: formData.portalPassword?.trim() || null,
      pendingReason:
        isPending && formData.pendingReason && formData.pendingReason.trim() !== ''
          ? formData.pendingReason
          : null,
      remarks: formData.remarks?.trim() || null,
    };
    await onSubmit(payload);
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {initialData ? 'Edit Service Order' : 'Create New Service Order'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Customer Selector / Banner */}
              <div className="mb-4 p-3 bg-light rounded border">
                <label className="form-label fw-bold text-dark mb-1">
                  Customer Information <span className="text-danger">*</span>
                </label>
                {selectedCustomer ? (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-primary fs-6">
                        {selectedCustomer.fullName}
                      </div>
                      <small className="text-muted">
                        Phone: {selectedCustomer.phoneNumber} | ID: #{selectedCustomer.customerId}
                      </small>
                    </div>
                    {!customer && !initialData && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setFormData((prev) => ({ ...prev, customerId: '' }));
                        }}
                      >
                        Change Customer
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type phone or name to search customer..."
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                    />
                    {searchingCustomers && (
                      <small className="text-muted mt-1 d-block">Searching...</small>
                    )}
                    {customerOptions.length > 0 && (
                      <ul className="list-group mt-2 border shadow-sm" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {customerOptions.map((cust) => (
                          <li
                            key={cust.customerId}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center cursor-pointer"
                            onClick={() => handleSelectCustomer(cust)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span>
                              <strong>{cust.fullName}</strong> ({cust.phoneNumber})
                            </span>
                            <span className="badge bg-primary rounded-pill">Select</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Service Selection */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Select Standard Service Template (Optional)
                  </label>
                  <select className="form-select" onChange={handleTemplateSelect}>
                    <option value="">-- Choose from standard catalog --</option>
                    {templates.map((tpl) => (
                      <option key={tpl.templateId || tpl.id} value={tpl.templateName || tpl.name}>
                        {tpl.templateName || tpl.name}
                      </option>
                    ))}
                    <option value="Aadhaar Address Update">Aadhaar Address Update</option>
                    <option value="PAN Card Application">PAN Card Application</option>
                    <option value="Income Certificate">Income Certificate</option>
                    <option value="Caste Certificate">Caste Certificate</option>
                    <option value="Domicile Certificate">Domicile Certificate</option>
                    <option value="Ration Card Correction">Ration Card Correction</option>
                    <option value="Voter ID Card Update">Voter ID Card Update</option>
                    <option value="Electricity / Utility Bill">Electricity / Utility Bill</option>
                    <option value="CUSTOM">Custom Service Name...</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Service Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="serviceName"
                    className="form-control"
                    placeholder="e.g. Aadhaar Address Update"
                    value={formData.serviceName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Application / Ack Number</label>
                  <input
                    type="text"
                    name="applicationNumber"
                    className="form-control"
                    placeholder="e.g. APP-2026-98124"
                    value={formData.applicationNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Portal Link</label>
                  <input
                    type="url"
                    name="portalLink"
                    className="form-control"
                    placeholder="https://service.gov.in"
                    value={formData.portalLink}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Portal Login ID / Username</label>
                  <input
                    type="text"
                    name="portalLoginId"
                    className="form-control"
                    placeholder="e.g. applicant123"
                    value={formData.portalLoginId}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold d-flex justify-content-between align-items-center">
                    <span>Temporary Password</span>
                    {initialData?.hasTemporaryPassword && (
                      <span className="badge bg-info text-dark" style={{ fontSize: '0.7rem' }}>
                        🔒 Stored Encrypted
                      </span>
                    )}
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="portalPassword"
                      className="form-control"
                      placeholder={initialData?.hasTemporaryPassword ? '•••••••• (Enter new to update)' : 'Temporary login password'}
                      value={formData.portalPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    AES-256 encrypted. Permanently deleted when service is COMPLETED.
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Initial Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="WAITING_FOR_DOCUMENT">WAITING_FOR_DOCUMENT</option>
                  </select>
                </div>

                {formData.status === 'PENDING' && (
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Pending Reason</label>
                    <select
                      name="pendingReason"
                      className="form-select"
                      value={formData.pendingReason}
                      onChange={handleChange}
                    >
                      <option value="">None</option>
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

                <div className="col-12">
                  <label className="form-label small fw-semibold">Remarks / Notes</label>
                  <textarea
                    name="remarks"
                    className="form-control"
                    rows="2"
                    placeholder="Internal processing remarks or instructions"
                    value={formData.remarks}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {initialData ? 'Update Service' : 'Create Service Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}