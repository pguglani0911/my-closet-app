import axios from 'axios';

// Reads from Vite env var if set, otherwise falls back to localhost for local dev.
// Set VITE_API_BASE_URL in a .env file to point at a different backend (staging, prod, etc).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/wardrobe';

const client = axios.create({
  baseURL: BASE_URL,
});

export const wardrobeApi = {
  getAll: () => client.get(''),

  addItem: (newItem) => client.post('', newItem),

  deleteItem: (id) => client.delete(`/${id}`),

  wearItem: (id) => client.put(`/${id}/wear`),

  markToGo: (id) => client.put(`/${id}/markToGo`),

  markNotToGo: (id) => client.put(`/${id}/markNotToGo`),

  // NOTE: toggleSale sends a JSON body (ToggleSaleRequest), not query params —
  // this matches the backend's WardrobeController#toggleForSale signature.
  toggleSale: (id, { price, size, user }) =>
    client.put(`/${id}/toggleSale`, { price, size, user }),
};

export default wardrobeApi;