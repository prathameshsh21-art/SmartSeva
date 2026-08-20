import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const documentService = {
  upload: (formData) =>
    axiosInstance.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getByServiceId: (serviceId) =>
    axiosInstance.get(API_ENDPOINTS.DOCUMENTS.BY_SERVICE(serviceId)),

  download: (documentId) =>
    axiosInstance.get(`/documents/download/${documentId}`, {
      responseType: 'blob',
    }),

  delete: (documentId) =>
    axiosInstance.delete(`/documents/${documentId}`),
};