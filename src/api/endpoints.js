import api from './axios';

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardApi = {
  getMetrics: (params) => api.get('/dashboard/metrics', { params }),
  getNetMovement: (baseId, params) => api.get(`/dashboard/net-movement/${baseId}`, { params }),
};

// Purchases
export const purchasesApi = {
  list: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
};

// Transfers
export const transfersApi = {
  list: (params) => api.get('/transfers', { params }),
  create: (data) => api.post('/transfers', data),
  complete: (id) => api.patch(`/transfers/${id}/complete`),
  cancel: (id) => api.patch(`/transfers/${id}/cancel`),
};

// Assignments
export const assignmentsApi = {
  list: (params) => api.get('/assignments', { params }),
  create: (data) => api.post('/assignments', data),
  updateStatus: (id, status) => api.patch(`/assignments/${id}/status`, { status }),
};

// Expenditures
export const expendituresApi = {
  list: (params) => api.get('/expenditures', { params }),
  create: (data) => api.post('/expenditures', data),
};

// Bases
export const basesApi = {
  list: () => api.get('/bases'),
  create: (data) => api.post('/bases', data),
  update: (id, data) => api.put(`/bases/${id}`, data),
  delete: (id) => api.delete(`/bases/${id}`),
};

// Equipment Types
export const equipmentTypesApi = {
  list: (params) => api.get('/equipment-types', { params }),
  create: (data) => api.post('/equipment-types', data),
  update: (id, data) => api.put(`/equipment-types/${id}`, data),
};

// Audit Logs
export const auditLogsApi = {
  list: (params) => api.get('/audit-logs', { params }),
};

// Users
export const usersApi = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
