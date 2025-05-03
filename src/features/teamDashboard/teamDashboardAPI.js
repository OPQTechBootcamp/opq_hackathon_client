import { getTeamToken } from '../../utils/tokenUtils';
import apiInstance from '../../utils/apiInstance'

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getTeamToken()}` }
});

export const getTeamDashboardAPI = async (data) => {
  const res = await apiInstance.post(`teamDashboard/dashboard`,data, authHeader());
  return res.data;
};

export const submitRoundEntryAPI = async (data) => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('message', data.message);
  formData.append('teamId', data.id);
  formData.append('teamName', data.team_name);

  const res = await apiInstance.post(`teamDashboard/submit`, formData, {
    headers: {
      ...authHeader().headers,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};
