import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import ServiceTable from '../components/ServiceTable';
import ServiceStatusModal from '../components/ServiceStatusModal';
import ServiceFormModal from '../components/ServiceFormModal';
import { serviceCatalogService } from '../../../api/services/serviceCatalogService';

import { openSmsComposer, openWhatsApp } from '../../../utils/phoneUtils';
import { useToast } from '../../../context/ToastContext';

export default function ServiceList() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [search, setSearch] = useState('');
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadServices = async (pageNumber = page, searchQuery = search) => {
    setLoading(true);
    setError(null);
    try {
      const response = searchQuery && searchQuery.trim() !== ''
        ? await serviceCatalogService.search(searchQuery.trim(), pageNumber, 10)
        : await serviceCatalogService.getAll(pageNumber, 10);

      const pageData = response?.data;
      if (pageData && Array.isArray(pageData.content)) {
        setServices(pageData.content);
        setTotalPages(pageData.totalPages || 1);
      } else if (Array.isArray(pageData)) {
        setServices(pageData);
        setTotalPages(1);
      } else {
        setServices([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Failed to load service records.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices(page, search);
  }, [page]);

  const handleSearch = async (value) => {
    setSearch(value);
    setPage(0);
    await loadServices(0, value);
  };

  const handleView = (service) => {
    if (service?.serviceId) {
      navigate(`/services/${service.serviceId}`);
    }
  };

  const handleStatusClick = (service) => {
    setSelectedService(service);
    setShowStatusModal(true);
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusSubmit = async (payload) => {
    try {
      setIsUpdatingStatus(true);
      const response = await serviceCatalogService.updateStatus(payload);
      if (response?.success === false) {
        showError(response.message || 'Status update failed');
        return;
      }
      const data = response?.data || response;
      let alertMsg = `Service Status: ✓ ${data?.status || payload.status}\n`;
      if (data?.notificationResults && data.notificationResults.length > 0) {
        alertMsg += '\nCustomer Notifications:\n';
        data.notificationResults.forEach((res) => {
          if (res.channel === 'SMS') {
            if (res.actionLink) {
              openSmsComposer(selectedService?.customerPhone || '', res.rawMessage);
            }
            alertMsg += `📱 SMS — Composer opened. Please press Send on your device.\n`;
          } else if (res.channel === 'WHATSAPP') {
            if (res.actionLink) {
              openWhatsApp(selectedService?.customerPhone || '', res.rawMessage);
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
      showSuccess(alertMsg, 'Service Status Updated');
      setShowStatusModal(false);
      setSelectedService(null);
      await loadServices(page, search);
    } catch (err) {
      console.error('Failed to update service status:', err);
      showError(err?.message || 'Failed to update service status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateServiceSubmit = async (formData) => {
    try {
      const response = await serviceCatalogService.create(formData);
      if (response?.success === false) {
        showError(response.message || 'Failed to create service order');
        return;
      }
      showSuccess('Service order created successfully!');
      setShowCreateModal(false);
      await loadServices(0, search);
    } catch (err) {
      console.error('Service creation failed:', err);
      showError(err?.message || 'Failed to create service order');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">Service Orders</h3>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Service Order
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Search by service name, application number, or customer phone..."
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading services...</span>
          </div>
        </div>
      ) : (
        <ServiceTable
          services={services}
          onView={handleView}
          onStatus={handleStatusClick}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
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

      <ServiceFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateServiceSubmit}
      />
    </div>
  );
}