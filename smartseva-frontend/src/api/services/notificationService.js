import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const notificationService = {
  getAll: (page = 0, size = 10) =>
    axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}?page=${page}&size=${size}`),
  send: (payload) => axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.SEND, payload),
};