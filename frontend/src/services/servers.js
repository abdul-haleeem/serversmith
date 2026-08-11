import api from './api'

export const getServers = () => api.get('/servers/')
export const getServer = (id) => api.get(`/servers/${id}/`)
export const createServer = (data) => api.post('/servers/', data)
export const updateServer = (id, data) => api.patch(`/servers/${id}/`, data)
export const deleteServer = (id) => api.delete(`/servers/${id}/`)
export const testConnection = (id) => api.post(`/servers/${id}/test_connection/`)
export const executeCommand = (id, command) => api.post(`/servers/${id}/execute/`, { command })
export const getHistory = (id) => api.get(`/servers/${id}/history/`)
export const getMetrics = (id) => api.get(`/servers/${id}/metrics/`)
export const getMetricsHistory = (id) => api.get(`/servers/${id}/metrics_history/`)
export const getContainers = (id) => api.get(`/servers/${id}/containers/`)
export const containerAction = (id, containerId, action) =>
  api.post(`/servers/${id}/containers/${containerId}/action/`, { action })
export const getContainerLogs = (id, containerId) =>
  api.get(`/servers/${id}/containers/${containerId}/logs/`)
