import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/users';

export const userApi = {
  getProfile: (username) => axios.get(`${API_BASE}/${username}`),
  updateSettings: (username, data) => axios.put(`${API_BASE}/${username}/settings`, data),
  changePassword: (username, newPassword) => axios.post(`${API_BASE}/${username}/change-password`, { newPassword }),
  getInviteCode: (username) => axios.get(`${API_BASE}/${username}/invite-code`),
};