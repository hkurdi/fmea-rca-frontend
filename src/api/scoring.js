import { api } from './client';

export const scoringApi = {
  submitProcessMap: (submissionId, courseId) =>
    api.post(`/scoring/submit/process-map/${submissionId}?course_id=${courseId}`),
  submitHazardAnalysis: (submissionId, courseId) =>
    api.post(`/scoring/submit/hazard-analysis/${submissionId}?course_id=${courseId}`),
  submitFmeaPip: (submissionId, courseId) =>
    api.post(`/scoring/submit/fmea-pip/${submissionId}?course_id=${courseId}`),
  submitFishbone: (submissionId, courseId) =>
    api.post(`/scoring/submit/fishbone/${submissionId}?course_id=${courseId}`),
  submitFiveWhys: (submissionId, courseId) =>
    api.post(`/scoring/submit/five-whys/${submissionId}?course_id=${courseId}`),
  submitRcaPip: (submissionId, courseId) =>
    api.post(`/scoring/submit/rca-pip/${submissionId}?course_id=${courseId}`),
  getUserScores: (userId) => api.get(`/scoring/user/${userId}`),
  getAllScores: () => api.get('/scoring/'),
  reviewScore: (scoreId, data) => api.patch(`/scoring/${scoreId}/review`, data),
};