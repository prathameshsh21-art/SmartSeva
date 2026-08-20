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

  updateStatus: (id, status) =>
    axiosInstance.patch(
      `${API_ENDPOINTS.SERVICES.STATUS}/${id}?status=${status}`
    ),

  delete: (id) =>
    axiosInstance.delete(`${API_ENDPOINTS.SERVICES.BASE}/${id}`),

  search: (keyword) =>
    axiosInstance.get(
      `${API_ENDPOINTS.SERVICES.SEARCH}?keyword=${encodeURIComponent(keyword)}`
    ),

  getTemplates: () =>
    axiosInstance.get(API_ENDPOINTS.SERVICES.TEMPLATES),
};