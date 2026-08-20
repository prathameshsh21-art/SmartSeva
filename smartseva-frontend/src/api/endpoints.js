export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITIES: '/dashboard/recent-activities',
  },
  CUSTOMERS: {
    BASE: '/customers',
    SEARCH: '/customers/search',
  },
  SERVICES: {
    BASE: '/services',
    SEARCH: '/services/search',
    STATUS: '/services/status',
    TEMPLATES: '/templates',
  },
  DOCUMENTS: {
    UPLOAD: '/documents/upload',
    BY_SERVICE: (serviceId) => `/documents/service/${serviceId}`,
    DOWNLOAD: (docId) => `/documents/download/${docId}`,
    DELETE: (docId) => `/documents/${docId}`,
  },
  NOTIFICATIONS: {
    SEND: '/notifications/send',
  },
  STAFF: {
    BASE: '/staff',
    RESET_PASSWORD: (id) => `/staff/${id}/reset-password`,
    STATUS: (id) => `/staff/${id}/status`,
  },
  ACTIVITIES: {
    RECENT: '/activities/recent',
  },
};