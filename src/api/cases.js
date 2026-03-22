import { api } from './client';

export const casesApi = {
  getAll: () => api.get('/cases/'),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases/', data),

  getAllCourses: () => api.get('/courses/'),

  getProcessMap: (caseId) => api.get(`/cases/${caseId}/fmea/process-map`),
  createProcessMap: (caseId, content) =>
    api.post(`/cases/${caseId}/fmea/process-map`, { case_id: caseId, content }),
  updateProcessMap: (caseId, id, content) =>
    api.put(`/cases/${caseId}/fmea/process-map/${id}`, { content }),

  getHazardAnalysis: (caseId) => api.get(`/cases/${caseId}/fmea/hazard-analysis`),
  createHazardAnalysis: (caseId, rows) =>
    api.post(`/cases/${caseId}/fmea/hazard-analysis`, { case_id: caseId, rows }),
  updateHazardAnalysis: (caseId, id, rows) =>
    api.put(`/cases/${caseId}/fmea/hazard-analysis/${id}`, { rows }),

  getFmeaPip: (caseId) => api.get(`/cases/${caseId}/fmea/pip`),
  createFmeaPip: (caseId, content) =>
    api.post(`/cases/${caseId}/fmea/pip`, { case_id: caseId, content }),
  updateFmeaPip: (caseId, id, content) =>
    api.put(`/cases/${caseId}/fmea/pip/${id}`, { content }),

  getFishbone: (caseId) => api.get(`/cases/${caseId}/rca/fishbone`),
  createFishbone: (caseId, problem_statement) =>
    api.post(`/cases/${caseId}/rca/fishbone`, { case_id: caseId, problem_statement }),
  updateFishbone: (caseId, problem_statement) =>
    api.put(`/cases/${caseId}/rca/fishbone`, { problem_statement }),

  getFiveWhys: (caseId) => api.get(`/cases/${caseId}/rca/five-whys`),
  createFiveWhys: (caseId, problem, iterations) =>
    api.post(`/cases/${caseId}/rca/five-whys`, { case_id: caseId, problem, iterations }),
  updateFiveWhys: (caseId, problem, iterations) =>
    api.put(`/cases/${caseId}/rca/five-whys`, { problem, iterations }),

  getRcaPip: (caseId) => api.get(`/cases/${caseId}/rca/pip`),
  createRcaPip: (caseId, content) =>
    api.post(`/cases/${caseId}/rca/pip`, { case_id: caseId, content }),
  updateRcaPip: (caseId, id, content) =>
    api.put(`/cases/${caseId}/rca/pip/${id}`, { content }),
};
