import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const dashboardService = {
  getStats: () => axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATS),
  getRecentActivities: () => axiosInstance.get(API_ENDPOINTS.DASHBOARD.ACTIVITIES),
};