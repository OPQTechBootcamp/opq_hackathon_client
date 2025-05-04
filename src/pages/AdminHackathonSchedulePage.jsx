import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Button, Typography, CircularProgress, Stack, Tooltip, Chip
} from '@mui/material';
import { Edit, Delete, Refresh, AccessTimeOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSchedules,
  deleteSchedule
} from '../features/schedules/schedulesSlice';
import ScheduleFormModal from '../components/ScheduleFormModal';

const AdminHackathonSchedulePage = () => {
  const dispatch = useDispatch();
  const { schedules, loading } = useSelector(state => state.schedules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(fetchSchedules());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this schedule?')) {
      dispatch(deleteSchedule(id));
      dispatch(fetchSchedules());
    }
  };

  const handleEdit = (schedule) => {
    setEditData(schedule);
    setModalOpen(true);
  };

  const handleRefresh = () => {
    dispatch(fetchSchedules());
  };

  // Helper function to format time in minutes
  const formatSelectionTime = (minutes) => {
    if (!minutes) return 'Not set';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours}h`;
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>Hackathon Schedule</Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Button
          variant="contained"
          onClick={() => { setModalOpen(true); setEditData(null); }}
          disabled={schedules.length >= 1}
        >
          Add Schedule
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Stack>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Rounds</TableCell>
                <TableCell>PS Selection Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.title}</TableCell>
                  <TableCell>{new Date(s.start_datetime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(s.end_datetime).toLocaleString()}</TableCell>
                  <TableCell>{s.number_of_rounds}</TableCell>
                  <TableCell>
                    <Tooltip title="Time allowed for problem statement selection">
                      <Chip
                        icon={<AccessTimeOutlined fontSize="small" />}
                        label={formatSelectionTime(s.ps_selection_time)}
                        size="small"
                        color={s.ps_selection_time ? "primary" : "default"}
                        variant="outlined"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(s)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(s.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {schedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No schedules found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ScheduleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editData}
      />
    </div>
  );
};

export default AdminHackathonSchedulePage;