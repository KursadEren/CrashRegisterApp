import axios from 'axios';

const BASE_URL = 'http://localhost:3001'; // JSON Server'ın çalıştığı port

const getUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export { getUsers };