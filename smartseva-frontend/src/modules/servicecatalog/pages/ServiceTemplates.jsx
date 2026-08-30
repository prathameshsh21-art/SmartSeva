import React, { useState, useEffect } from 'react';
import { serviceCatalogService } from '../../../api/services/serviceCatalogService';
import axiosInstance from '../../../api/axiosInstance';
import { API_ENDPOINTS } from '../../../api/endpoints';

export default function ServiceTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    portalUrl: '',
    description: '',
    suggestedDocuments: '',
  });

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await serviceCatalogService.getTemplates();
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setTemplates(data);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Failed to load service templates:', err);
      setError('Failed to load service templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.SERVICES.TEMPLATES, formData);
      if (res?.success === false) {
        alert(res.message || 'Failed to create template');
        return;
      }
      alert('Service template created successfully!');
      setShowAddModal(false);
      setFormData({
        serviceName: '',
        portalUrl: '',
        description: '',
        suggestedDocuments: '',
      });
      await loadTemplates();
    } catch (err) {
      console.error('Create template failed:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to create template');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Standard Service Catalog</h3>
          <small className="text-muted">Standard templates for rapid service order creation</small>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Service Template
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading templates...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="card shadow-sm border-0 p-4 text-center text-muted">
          <p className="mb-2">No service templates configured yet.</p>
          <button
            className="btn btn-outline-primary btn-sm align-self-center"
            onClick={() => setShowAddModal(true)}
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {templates.map((tpl) => (
            <div key={tpl.templateId} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-primary mb-0">{tpl.serviceName}</h5>
                    <span className="badge bg-success">Active</span>
                  </div>

                  <p className="text-secondary small mb-3">
                    {tpl.description || 'Standard government citizen service.'}
                  </p>

                  {tpl.suggestedDocuments && (
                    <div className="mb-3 bg-light p-2 rounded small">
                      <strong className="d-block text-dark mb-1">Required Documents:</strong>
                      <span className="text-muted">{tpl.suggestedDocuments}</span>
                    </div>
                  )}

                  {tpl.portalUrl && (
                    <a
                      href={tpl.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary w-100"
                    >
                      Open Portal ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Template Modal */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create Service Template</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateTemplate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Service Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="serviceName"
                      className="form-control"
                      placeholder="e.g. Income Certificate (Tehsildar)"
                      value={formData.serviceName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Government Portal URL</label>
                    <input
                      type="url"
                      name="portalUrl"
                      className="form-control"
                      placeholder="https://edistrict.gov.in"
                      value={formData.portalUrl}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="2"
                      placeholder="Short description of this service"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Suggested / Required Documents</label>
                    <input
                      type="text"
                      name="suggestedDocuments"
                      className="form-control"
                      placeholder="e.g. Aadhaar Card, Ration Card, Salary Slip"
                      value={formData.suggestedDocuments}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}