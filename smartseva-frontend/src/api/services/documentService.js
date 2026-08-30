import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const documentService = {
  getAll: (page = 0, size = 10) =>
    axiosInstance.get(`${API_ENDPOINTS.DOCUMENTS.BASE}?page=${page}&size=${size}`),

  upload: (serviceId, file) => {
    const formData = new FormData();
    formData.append('serviceId', serviceId);
    formData.append('file', file);
    return axiosInstance.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getByServiceId: (serviceId) =>
    axiosInstance.get(API_ENDPOINTS.DOCUMENTS.BY_SERVICE(serviceId)),

  download: (documentId) =>
    axiosInstance.get(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(documentId), {
      responseType: 'blob',
    }),

  delete: (documentId) =>
    axiosInstance.delete(API_ENDPOINTS.DOCUMENTS.DELETE(documentId)),

  verifyPublic: (data) =>
    axiosInstance.post(API_ENDPOINTS.PUBLIC.VERIFY, data),

  downloadPublic: (documentId, token) =>
    axiosInstance.get(API_ENDPOINTS.PUBLIC.DOWNLOAD(documentId, token), {
      responseType: 'blob',
    }),
};