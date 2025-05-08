import axios from 'axios';

// const API_BASE_URL = "https://d2bgut31xyvm83.cloudfront.net/api/";
const API_BASE_URL = "https://hack.opqtech.ai/api/";
// const API_BASE_URL = "http://localhost:5000/api/";

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

export default apiInstance;