// my-closet-ui/src/api/authApi.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/wardrobe', '')
  : 'http://localhost:8080/api';

const client = axios.create({
  baseURL: BASE_URL,
});

export const authApi = {
  validateInvite: (code) => client.get(`/invites/${code}/validate`), // <--- Updated route
  signup: (payload) => client.post('/auth/signup', payload),
  login: (creds) => client.post('/auth/login', creds),
  listPending: () => client.get('/admin/users?status=PENDING'),
  approve: (username) => client.put(`/admin/users/${username}/approve`),
  deny: (username, reason) => client.put(`/admin/users/${username}/deny`, { reason }),
  createInvite: (payload) => client.post('/invites', payload),
};

export default authApi;