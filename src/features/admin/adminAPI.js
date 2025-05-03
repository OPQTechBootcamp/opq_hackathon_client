// adminAPI.js
import { getToken } from "../../utils/tokenUtils";
import apiInstance from "../../utils/apiInstance";

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchUsersAPI = async () => {
  const res = await apiInstance.get(`admin/users`, { headers: authHeader() });
  return res.data;
};

export const fetchTeamsAPI = async () => {
  const res = await apiInstance.get(`admin/teams`, { headers: authHeader() });
  return res.data;
};

export const fetchAssignmentsAPI = async () => {
  const res = await apiInstance.get(`admin/team-judges`, {
    headers: authHeader(),
  });
  return res.data;
};

export const assignJudgesAPI = async (data) => {
  await apiInstance.post(`admin/assign-judges`, data, {
    headers: authHeader(),
  });
};

export const unAssignJudgesAPI = async (assignmentId) => {
  return await apiInstance.delete(`admin/unassign-judge/${assignmentId}`, {
    headers: authHeader(),
  });
};
