import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const authService = {
  login: (credentials) => axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
};