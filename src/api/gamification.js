import { api } from './client';

export const gamificationApi = {
  getLeaderboard: (courseId) => api.get(`/gamification/leaderboard/${courseId}`),
  getMyPoints: (courseId) => api.get(`/gamification/points/me?course_id=${courseId}`),
  getMyBadges: () => api.get('/gamification/badges/me'),
};
