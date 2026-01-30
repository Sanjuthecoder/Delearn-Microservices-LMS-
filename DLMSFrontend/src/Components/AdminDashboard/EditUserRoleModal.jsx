import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Alert,
    Chip
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import api from '../../Service/api';

export default function EditUserRoleModal({ open, onClose, user, onUserUpdated }) {
    const [role, setRole] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setRole(user.role);
        }
    }, [user]);

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);

        try {
            await api.put(`/api/auth/users/${user.id}/role`, { role });
            onUserUpdated();
            onClose();
        } catch (err) {
            console.error('Error updating role:', err);
            setError('Failed to update user role');
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 700,
                color: '#111827'
            }}>
                Edit User Role
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3, p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                        User Information
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {user.userName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user.email}
                    </Typography>
                </Box>

                <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        label="Role"
                        autoFocus
                    >
                        <MenuItem value="STUDENT">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon fontSize="small" />
                                <span>Student</span>
                            </Box>
                        </MenuItem>
                        <MenuItem value="ADMIN">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AdminPanelSettingsIcon fontSize="small" />
                                <span>Admin</span>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>

                {role !== user.role && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Role will be changed from{' '}
                        <Chip
                            label={user.role}
                            size="small"
                            sx={{ mx: 0.5 }}
                        />{' '}
                        to{' '}
                        <Chip
                            label={role}
                            size="small"
                            sx={{ mx: 0.5 }}
                        />
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e5e7eb' }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || role === user.role}
                    sx={{
                        bgcolor: '#667eea',
                        '&:hover': { bgcolor: '#5568d3' }
                    }}
                >
                    {loading ? 'Updating...' : 'Update Role'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
