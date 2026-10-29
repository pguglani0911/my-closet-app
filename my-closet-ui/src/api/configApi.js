// src/api/configApi.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/wardrobe', '')
  : 'http://localhost:8080/api';

const client = axios.create({ baseURL: BASE_URL });

export const configApi = {
  getSetting: (key) => client.get(`/config/settings/${key}`),
};

export default configApi;