const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002';

export const fetchItems = async () => {
  const response = await fetch(`${API_BASE_URL}/api/items`);
  return await response.json();
};

export const fetchStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  return await response.json();
};

export const addItem = async (item) => {
  const response = await fetch(`${API_BASE_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  return await response.json();
};

export const updateItem = async (id, item) => {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  return await response.json();
};

export const deleteItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};

export const connectWebSocket = (callback) => {
  const ws = new WebSocket(`ws://localhost:5002/ws`);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    callback(message);
  };

  return () => ws.close();
};