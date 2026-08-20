import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const activityService = {
  getRecent: () =>
    axiosInstance.get(API_ENDPOINTS.ACTIVITIES.RECENT),

  getAll: (page = 0, size = 10) =>
    axiosInstance.get(
      `${API_ENDPOINTS.ACTIVITIES.RECENT}?page=${page}&size=${size}`
    ),
};