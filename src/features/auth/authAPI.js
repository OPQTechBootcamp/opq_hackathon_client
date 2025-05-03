import { getToken } from "../../utils/tokenUtils";
import apiInstance from "../../utils/apiInstance";

export const loginAPI = async ({ email, password }) => {
  const res = await apiInstance.post(`auth/login`, { email, password });
  return res.data;
};

export const fetchUserProfile = async () => {
  const token = getToken();
  const res = await apiInstance.get(`auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const registerUserAPI = async (userData) => {
  const token = getToken();
  const res = await apiInstance.post(`auth/register`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
