import api from './api'

export const getServers = () => api.get('/servers/')
export const createServer = (data) => api.post('/servers/', data)
export const updateServer = (id, data) => api.patch(`/servers/${id}/`, data)
export const deleteServer = (id) => api.delete(`/servers/${id}/`)