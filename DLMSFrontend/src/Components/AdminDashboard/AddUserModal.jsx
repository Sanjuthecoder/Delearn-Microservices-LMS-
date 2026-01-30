import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert
} from '@mui/material';
import api from '../../Service/api';

export default function AddUserModal({ open, onClose, onUserAdded }) {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);

        // Validation
        if (!formData.userName || !formData.email || !formData.password) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await api.post('/api/auth/users', formData);
            setFormData({ userName: '', email: '', password: '', role: 'STUDENT' });
            onUserAdded();
            onClose();
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err.response?.data?.error || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ userName: '', email: '', password: '', role: 'STUDENT' });
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 700,
                color: '#111827'
            }}>
                Add New User
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                    <TextField
                        label="Full Name"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        fullWidth
                        required
                        autoFocus
                    />

                    <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        required
                        helperText="Minimum 6 characters"
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            label="Role"
                        >
                            <MenuItem value="STUDENT">Student</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e5e7eb' }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    sx={{
                        bgcolor: '#667eea',
                        '&:hover': { bgcolor: '#5568d3' }
                    }}
                >
                    {loading ? 'Creating...' : 'Create User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
