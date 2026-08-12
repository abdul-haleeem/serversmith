import api from './api'

export const getDeployments = () => api.get('/deployments/')
export const createDeployment = (data) => api.post('/deployments/', data)