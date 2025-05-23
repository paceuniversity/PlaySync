import axios from 'axios';

const BASE_URL = 'https://playsync-production.up.railway.app/api/';

const useAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export { useAxios };
