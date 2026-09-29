import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const analyzeIncident = async (incidentData) => {
  const response = await api.post('/incidents/analyze', incidentData);
  return response.data;
};

export const compareIncident = async (incidentData) => {
  const response = await api.post('/incidents/compare', incidentData);
  return response.data;
};

export const previewRecall = async (recallData) => {
  const response = await api.post('/incidents/recall-preview', recallData);
  return response.data;
};

export const resolveIncident = async (incidentId, resolutionData) => {
  const response = await api.post(`/incidents/${incidentId}/resolve`, resolutionData);
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get('/incidents');
  return response.data;
};

export const getIncidentById = async (incidentId) => {
  const response = await api.get(`/incidents/${incidentId}`);
  return response.data;
};

export const getHindsightMemories = async () => {
  const response = await api.get('/memories');
  return response.data;
};

export const seedHistoricalMemories = async () => {
  const response = await api.post('/memories/seed');
  return response.data;
};

export const getLearningCurve = async () => {
  const response = await api.get('/memories/learning-curve');
  return response.data;
};

export default api;
