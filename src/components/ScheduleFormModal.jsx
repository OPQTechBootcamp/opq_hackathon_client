import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
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
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        title: "",
        start_datetime: "",
        end_datetime: "",
        number_of_rounds: 1,
      });
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (initialData) {
      dispatch(editSchedule({ id: initialData.id, data: form }));
    } else {
      dispatch(addSchedule(form));
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
