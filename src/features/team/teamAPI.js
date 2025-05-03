import apiInstance from '../../utils/apiInstance'

export const loginTeamAPI = async ({ team_email, password }) => {
  const res = await apiInstance.post(`team/login`, { team_email, password });
  return res.data;
};

export const registerTeamAPI = async (userData) => {
  const res = await apiInstance.post(`team/register`, userData);
  return res.data;
};
