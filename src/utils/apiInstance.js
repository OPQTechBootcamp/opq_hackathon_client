import axios from 'axios';

const API_BASE_URL = "https://d2bgut31xyvm83.cloudfront.net/api/";

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

export default apiInstance;