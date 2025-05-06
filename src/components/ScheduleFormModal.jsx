import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useDispatch } from "react-redux";
import {
  addSchedule,
  editSchedule,
  fetchSchedules,
} from "../features/schedules/schedulesSlice";

const ScheduleFormModal = ({ open, onClose, initialData }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    title: "",
    start_datetime: "",
    end_datetime: "",
    number_of_rounds: 1,
    ps_selection_time: 30, // Default to 30 minutes
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        title: "",
        start_datetime: "",
        end_datetime: "",
        number_of_rounds: 1,
        ps_selection_time: 30, // Default to 30 minutes
      });
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Create a copy of the form data
    const formData = { ...form };
    
    // Ensure dates are in ISO format
    if (formData.start_datetime) {
      // Make sure this is in ISO format with timezone (UTC)
      const startDate = new Date(formData.start_datetime);
      formData.start_datetime = startDate.toISOString();
    }
    
    if (formData.end_datetime) {
      const endDate = new Date(formData.end_datetime);
      formData.end_datetime = endDate.toISOString();
    }
    
    if (initialData) {
      dispatch(editSchedule({ id: initialData.id, data: formData }));
    } else {
      dispatch(addSchedule(formData));
    }
    dispatch(fetchSchedules());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Edit Schedule" : "Add Schedule"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            name="title"
            label="Title"
            value={form.title}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="start_datetime"
            label="Start Date-Time"
            type="datetime-local"
            value={form.start_datetime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            name="end_datetime"
            label="End Date-Time"
            type="datetime-local"
            value={form.end_datetime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
<TextField
  name="number_of_rounds"
  label="Number of Rounds"
  type="number"
  value={form.number_of_rounds}
  onChange={handleChange}
  fullWidth
  inputProps={{ min: 1 }}
  disabled={Boolean(initialData)}
  helperText={
    initialData
      ? "Number of rounds cannot be changed after schedule creation"
      : "Set the number of rounds for this schedule"
  }
/>

          <TextField
            name="ps_selection_time"
            label="Problem Statement Selection Time"
            type="number"
            value={form.ps_selection_time}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="body2" color="text.secondary" mr={1}>
                    minutes
                  </Typography>
                  <Tooltip title="Time allowed for teams to select their problem statement">
                    <IconButton size="small" edge="end">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            helperText="Specify how many minutes teams will have to select their problem statement"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleFormModal;