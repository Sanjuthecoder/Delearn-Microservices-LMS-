import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Chip,
    CircularProgress,
    Tooltip,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
// import AddUserModal from './AddUserModal'; // Removed as per request
import EditUserRoleModal from './EditUserRoleModal';
import ViewUserDetailsDialog from './ViewUserDetailsDialog';
import api from '../../Service/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [openAddModal, setOpenAddModal] = useState(false); // Removed
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);

    const fetchUsers = () => {
        setLoading(true);
        setError(null);
        console.log("Fetching users...");
        api.get('/api/auth/users')
            .then(res => {
                console.log("Users fetched response:", res);
                if (Array.isArray(res.data)) {
                    setUsers(res.data);
                } else if (res.data && Array.isArray(res.data.users)) {
                    // Fallback if wrapped in an object
                    setUsers(res.data.users);
                } else {
                    console.error("Unexpected response data format:", res.data);
                    setUsers([]);
                    setError("Received invalid data format from server.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching users:", err);
                setError(err.response?.data?.message || err.message || "Failed to load users.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!selectedUser) return;

        api.delete(`/api/auth/users/${selectedUser.id}`)
            .then(res => {
                setUsers(users.filter(u => u.id !== selectedUser.id));
                setOpenDeleteDialog(false);
                setSelectedUser(null);
            })
            .catch(err => {
                console.error("Error deleting user:", err);
                alert("Failed to delete user: " + (err.response?.data?.error || err.message));
            });
    };

    const handleViewClick = (user) => {
        setSelectedUser(user);
        setOpenViewDialog(true);
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setOpenEditModal(true);
    };

    const getRoleBadge = (role) => {
        if (role === 'ADMIN') {
            return {
                color: '#7c3aed',
                bgcolor: 'rgba(124, 58, 237, 0.1)',
                icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />
            };
        }
        return {
            color: '#10b981',
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            icon: <SchoolIcon sx={{ fontSize: 16 }} />
        };
    };

    return (
        <Box>
            {/* Header Strip */}
            <Box sx={{
                bgcolor: 'rgba(102, 126, 234, 0.15)',
                borderRadius: 2,
                p: 3,
                mb: 4,
                border: '1px solid rgba(102, 126, 234, 0.3)',
                position: 'fixed',
                top: 24,
                left: { md: `calc(260px + 24px)` },
                right: 24,
                zIndex: 10,
                backdropFilter: 'blur(10px)'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                            User Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage users and their roles
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={fetchUsers}
                            sx={{
                                bgcolor: 'white',
                                '&:hover': { bgcolor: '#f9fafb' }
                            }}
                        >
                            Refresh
                        </Button>
                        {/* "Add User" button removed as per request */}
                    </Box>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, pt: '120px' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Box sx={{ pt: '120px', px: 3 }}>
                    <Alert severity="error">
                        {error}
                        <Button size="small" onClick={fetchUsers} sx={{ ml: 2 }}>Retry</Button>
                    </Alert>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, pt: '120px' }}>
                    {users.map(user => (
                        <Box key={user.id} sx={{ flex: '1 1 300px', maxWidth: '380px', minWidth: '280px', width: { xs: '100%', sm: 'auto' } }}>
                            <Card sx={{
                                height: '100%',
                                minHeight: '220px',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
                                    borderColor: '#667eea',
                                }
                            }}>
                                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Chip
                                            label={`ID: ${user.id}`}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                fontWeight: 600,
                                                color: '#667eea',
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                        <Chip
                                            icon={getRoleBadge(user.role).icon}
                                            label={user.role}
                                            size="small"
                                            sx={{
                                                bgcolor: getRoleBadge(user.role).bgcolor,
                                                color: getRoleBadge(user.role).color,
                                                fontWeight: 700,
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <PersonIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                            {user.userName}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6b7280' }}>
                                        <EmailIcon fontSize="small" />
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ borderTop: '1px solid #f3f4f6', p: 2 }}>
                                    <Button
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => handleViewClick(user)}
                                        sx={{ fontSize: '0.8rem' }}
                                    >
                                        View
                                    </Button>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Tooltip title="Edit Role">
                                        <IconButton size="small" color="primary" onClick={() => handleEditClick(user)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete User">
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(user)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Add User Modal removed */}

            {/* Edit Role Modal */}
            <EditUserRoleModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onUserUpdated={fetchUsers}
            />

            {/* View User Details Dialog */}
            <ViewUserDetailsDialog
                open={openViewDialog}
                onClose={() => {
                    setOpenViewDialog(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Delete User?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{selectedUser?.userName}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
