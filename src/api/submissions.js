import { api } from './client';

export const submissionsApi = {
  getProcessMap: (id) => api.get(`/cases/fmea/submission/process-map/${id}`),
  getHazardAnalysis: (id) => api.get(`/cases/fmea/submission/hazard-analysis/${id}`),
  getFmeaPip: (id) => api.get(`/cases/fmea/submission/pip/${id}`),
  getFishbone: (id) => api.get(`/cases/rca/submission/fishbone/${id}`),
  getFiveWhys: (id) => api.get(`/cases/rca/submission/five-whys/${id}`),
  getRcaPip: (id) => api.get(`/cases/rca/submission/pip/${id}`),
};