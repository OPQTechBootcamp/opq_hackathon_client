import axios from 'axios';

const API_BASE_URL = "http://3.6.233.101/api/";

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

export default apiInstance;