import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRounds, createRound, updateRound, deleteRound } from '../features/rounds/roundsSlice';
import {
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    IconButton,
    Snackbar,
    Alert,
    Grid,
    Box,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminHackathonSchedulePage from './AdminHackathonSchedulePage'
const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyles = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    position: 'relative',
};

const closeButtonStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
};

export default function RoundManagementPage() {
    const dispatch = useDispatch();
    const { rounds, loading, error: roundsError } = useSelector(state => state.rounds);

    const [showModal, setShowModal] = useState(false);
    const [editingRound, setEditingRound] = useState(null);
    const [formData, setFormData] = useState({
        round_number: '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        dispatch(fetchRounds());
    }, [dispatch]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const openModal = (round = null) => {
        setEditingRound(round);
        if (round) {
            setFormData({ ...round });
        } else {
            setFormData({
                round_number: '',
                title: '',
                description: '',
                start_time: '',
                end_time: '',
            });
        }
        setShowModal(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingRound) {
            const resultAction = await dispatch(updateRound({ id: editingRound.id, updatedData: formData }));
            if (updateRound.fulfilled.match(resultAction)) {
                showSnackbar('Round updated successfully!');
                dispatch(fetchRounds());
            } else {
                showSnackbar('Failed to update round.', 'error');
            }
        } else {
            const resultAction = await dispatch(createRound(formData));
            if (createRound.fulfilled.match(resultAction)) {
                showSnackbar('Round created successfully!');
                dispatch(fetchRounds());
            } else {
                showSnackbar('Failed to create round.', 'error');
            }
        }
        setShowModal(false);
        setEditingRound(null);
    };

    const handleDelete = (id) => {
        setDeleteConfirmation(id);
    };

    const confirmDelete = async () => {
        if (deleteConfirmation) {
            const resultAction = await dispatch(deleteRound(deleteConfirmation));
            if (deleteRound.fulfilled.match(resultAction)) {
                showSnackbar('Round deleted successfully!');
            } else {
                showSnackbar('Failed to delete round.', 'error');
            }
            setDeleteConfirmation(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRound(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h2">
                    Round Management
                </Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => openModal()}>
                    Add Round
                </Button>
            </Box>

            {loading ? (
                <Typography sx={{ mt: 2 }}>Loading rounds...</Typography>
            ) : roundsError ? (
                <Alert severity="error" sx={{ mt: 2 }}>{roundsError}</Alert>
            ) : (
                <Grid container spacing={2}>
                    {rounds.map((round) => (
                        <Grid item xs={12} sm={6} md={4} key={round.id}>
                            <Card>
                                <AdminHackathonSchedulePage />
                                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Typography variant="h6" component="div" className="font-semibold">
                                        Round {round.round_number}: {round.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {round.description}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="textSecondary">
                                        Start: {new Date(round.start_time).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        End: {new Date(round.end_time).toLocaleString()}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => openModal(round)}>
                                            Edit
                                        </Button>
                                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => handleDelete(round.id)}>
                                            Delete
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Modal */}
            {showModal && (
                <div style={modalStyles}>
                    <div style={modalContentStyles}>
                        <IconButton style={closeButtonStyle} onClick={closeModal}>
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h5" component="h3" sx={{ mb: 3 }}>
                            {editingRound ? 'Edit Round' : 'Add Round'}
                        </Typography>
                      
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div>
                                <label htmlFor="round_number" className="block text-gray-700 text-sm font-bold mb-2">
                                    Round Number
                                </label>
                                <TextField
                                    fullWidth
                                    type="number"
                                    id="round_number"
                                    name="round_number"
                                    value={formData.round_number}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                                    Title
                                </label>
                                <TextField
                                    fullWidth
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                                    Description
                                </label>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="start_time" className="block text-gray-700 text-sm font-bold mb-2">
                                    Start Time
                                </label>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    id="start_time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="end_time" className="block text-gray-700 text-sm font-bold mb-2">
                                    End Time
                                </label>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    id="end_time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <Button type="submit" variant="contained" color="primary">
                                {editingRound ? 'Update' : 'Create'} Round
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Delete Confirmation Snackbar */}
            <Snackbar
                open={!!deleteConfirmation}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                message="Are you sure you want to delete this round?"
                action={
                    <>
                        <Button color="secondary" size="small" onClick={confirmDelete}>
                            Yes
                        </Button>
                        <Button color="inherit" size="small" onClick={cancelDelete}>
                            No
                        </Button>
                        <IconButton size="small" aria-label="close" color="inherit" onClick={cancelDelete}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                }
            />
        </Box>
    );
}

