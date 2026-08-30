import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';

export const customerService = {

    create: (data) =>
        axiosInstance.post(
            API_ENDPOINTS.CUSTOMERS.BASE,
            data
        ),

    getAll: (page = 0, size = 10) =>
        axiosInstance.get(
            `${API_ENDPOINTS.CUSTOMERS.BASE}?page=${page}&size=${size}`
        ),

    getById: (id) =>
        axiosInstance.get(
            `${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`
        ),

    update: (id, data) =>
        axiosInstance.put(
            `${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`,
            data
        ),

    delete: (id) =>
        axiosInstance.delete(
            `${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`
        ),

    search: (query = "", page = 0, size = 10) =>
        axiosInstance.get(
            `${API_ENDPOINTS.CUSTOMERS.SEARCH}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
        )

};