import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const staffService = {
  create: (data) => axiosInstance.post(API_ENDPOINTS.STAFF.BASE, data),
  getAll: (page = 0, size = 10) =>
    axiosInstance.get(`${API_ENDPOINTS.STAFF.BASE}?page=${page}&size=${size}`),
  getById: (id) => axiosInstance.get(`${API_ENDPOINTS.STAFF.BASE}/${id}`),
  resetPassword: (id, data) =>
    axiosInstance.put(API_ENDPOINTS.STAFF.RESET_PASSWORD(id), data),
  updateStatus: (id, status) =>
    axiosInstance.patch(`${API_ENDPOINTS.STAFF.STATUS(id)}?status=${status}`),
};