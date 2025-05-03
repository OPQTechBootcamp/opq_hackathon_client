import axios from 'axios';

const API_BASE_URL = "/api/";

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

export default apiInstance;