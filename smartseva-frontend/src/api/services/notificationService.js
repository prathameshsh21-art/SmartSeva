import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const notificationService = {
  send: (payload) => axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.SEND, payload),
};