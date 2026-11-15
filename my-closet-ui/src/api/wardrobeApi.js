import axios from 'axios';

// Reads from Vite env var if set, otherwise falls back to localhost for local dev.
// Set VITE_API_BASE_URL in a .env file to point at a different backend (staging, prod, etc).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: BASE_URL,
});

export const wardrobeApi = {
  // Fetches all items from the wardrobe
  getAll: () => client.get('/wardrobe'),

  // Uploads a clothing item with an image attachment to the multipart backend (/api/items)
  addItemWithPhoto: (formData) =>
  client.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Legacy JSON add item (if needed elsewhere)
  addItem: (newItem) => client.post('/wardrobe', newItem),

  deleteItem: (id) => client.delete(`/wardrobe/${id}`),

  wearItem: (id) => client.put(`/wardrobe/${id}/wear`),

  markToGo: (id) => client.put(`/wardrobe/${id}/markToGo`),

  markNotToGo: (id) => client.put(`/wardrobe/${id}/markNotToGo`),

  // NOTE: toggleSale sends a JSON body (ToggleSaleRequest) —
  // this matches the backend's WardrobeController#toggleForSale signature.
  toggleSale: (id, { price, size, user }) =>
    client.put(`/wardrobe/${id}/toggleSale`, { price, size, user }),
};

export default wardrobeApi;