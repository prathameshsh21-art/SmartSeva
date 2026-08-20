export const APP_CONSTANTS = {
  APP_NAME: 'SmartSeva',

  PAGE_SIZE_DEFAULT: 10,

  STORAGE_KEYS: {
    TOKEN: 'smartseva_token',
    USER: 'smartseva_user',
  },

  ROLES: {
    ADMIN: 'ROLE_ADMIN',
    STAFF: 'ROLE_STAFF',
  },

  SERVICE_STATUSES: [
    'NEW',
    'IN_PROGRESS',
    'PENDING',
    'WAITING_FOR_DOCUMENT',
    'SERVER_ISSUE',
    'COMPLETED',
    'ARCHIVED',
  ],

  PENDING_REASONS: [
    'MISSING_DOCUMENTS',
    'SERVER_DOWN',
    'INCORRECT_INFO',
    'PAYMENT_FAILED',
    'PORTAL_ERROR',
    'DOCUMENT_VERIFICATION',
    'OTHER',
  ],
};