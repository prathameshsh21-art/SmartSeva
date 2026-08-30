import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const serviceCatalogService = {
  create: (data) =>
    axiosInstance.post(API_ENDPOINTS.SERVICES.BASE, data),

  getAll: (page = 0, size = 10) =>
    axiosInstance.get(
      `${API_ENDPOINTS.SERVICES.BASE}?page=${page}&size=${size}`
    ),

  getById: (id) =>
    axiosInstance.get(`${API_ENDPOINTS.SERVICES.BASE}/${id}`),

  update: (id, data) =>
    axiosInstance.put(`${API_ENDPOINTS.SERVICES.BASE}/${id}`, data),

  updateStatus: (payloadOrId, status, pendingReason = null, remarks = null) => {
    if (typeof payloadOrId === 'object' && payloadOrId !== null) {
      if (payloadOrId.files && payloadOrId.files.length > 0) {
        const formData = new FormData();
        formData.append('serviceId', payloadOrId.serviceId);
        formData.append('status', payloadOrId.status);
        if (payloadOrId.pendingReason) formData.append('pendingReason', payloadOrId.pendingReason);
        if (payloadOrId.remarks) formData.append('remarks', payloadOrId.remarks);
        if (payloadOrId.channels && Array.isArray(payloadOrId.channels)) {
          payloadOrId.channels.forEach((ch) => formData.append('channels', ch));
        }
        if (payloadOrId.documentIds && Array.isArray(payloadOrId.documentIds)) {
          payloadOrId.documentIds.forEach((id) => formData.append('documentIds', id));
        }
        payloadOrId.files.forEach((file) => formData.append('files', file));

        return axiosInstance.post(API_ENDPOINTS.SERVICES.STATUS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return axiosInstance.patch(API_ENDPOINTS.SERVICES.STATUS, payloadOrId);
    }
    return axiosInstance.patch(API_ENDPOINTS.SERVICES.STATUS, {
      serviceId: payloadOrId,
      status,
      pendingReason,
      remarks,
    });
  },

  delete: (id) =>
    axiosInstance.delete(`${API_ENDPOINTS.SERVICES.BASE}/${id}`),

  search: (query = '', page = 0, size = 10) =>
    axiosInstance.get(
      `${API_ENDPOINTS.SERVICES.SEARCH}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    ),

  getByCustomer: (customerId) =>
    axiosInstance.get(API_ENDPOINTS.SERVICES.BY_CUSTOMER(customerId)),

  getTemplates: () =>
    axiosInstance.get(API_ENDPOINTS.SERVICES.TEMPLATES),
};