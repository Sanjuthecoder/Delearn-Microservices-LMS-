import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
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
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create'; // Edit Icon
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import AddCourseModal from './AddCourseModal';
import api from '../../Service/api';
import MediaUpload from './MediaUpload'; // Re-using for specific course media if needed, or just link

export default function AdminCourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null); // New state for editing

    // Delete Dialog State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    // View Dialog State
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [courseToView, setCourseToView] = useState(null);

    // ... (imports)

    // ... (component)

    const fetchCourses = () => {
        setLoading(true);
        // Using Gateway URL via api helper
        api.get('/api/courses')
            .then(res => {
                setCourses(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching courses:", err);
                setLoading(false);
                // Optional: Redirect to login if 401 (handled by interceptor largely)
                if (err.response && err.response.status === 401) {
                    // navigate('/login'); // If navigation was imported
                }
            });
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!courseToDelete) return;

        // Use api.delete (Interceptor handles auth)
        api.delete(`/api/courses/${courseToDelete.id}`)
            .then(res => {
                if (res.status === 200 || res.status === 204) {
                    setCourses(courses.filter(c => c.id !== courseToDelete.id));
                    setOpenDeleteDialog(false);
                    setCourseToDelete(null);
                } else {
                    alert("Failed to delete course.");
                }
            })
            .catch(err => {
                console.error("Error deleting course:", err);
                alert("Failed to delete course: " + (err.response?.data?.message || err.message));
            });
    };

    const handleViewClick = (course) => {
        setCourseToView(course);
        setOpenViewDialog(true);
    };

    const handleEditClick = (course) => {
        setCourseToEdit(course);
        setOpenAddModal(true);
    };

    return (
        <Box>
            {/* Header Strip with Blue Background */}
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
                            Course Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create, update, and remove courses
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={fetchCourses}
                            sx={{
                                bgcolor: 'white',
                                '&:hover': { bgcolor: '#f9fafb' }
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenAddModal(true)}
                            sx={{
                                bgcolor: '#667eea',
                                '&:hover': { bgcolor: '#5568d3' }
                            }}
                        >
                            Add New Course
                        </Button>
                    </Box>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, pt: '120px' }}>
                    {courses.map(course => (
                        <Box key={course.id || course.courseId} sx={{ flex: '1 1 300px', maxWidth: '380px', minWidth: '280px', width: { xs: '100%', sm: 'auto' } }}>
                            <Card sx={{
                                height: '100%',
                                minHeight: '320px',
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
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        {/* Chip Removed */}
                                        {/* Placeholder for difficulty/category if available */}
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        lineHeight: 1.3,
                                        minHeight: '2.6em',
                                        mb: 1
                                    }}>
                                        {course.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 2,
                                        minHeight: '3.6em'
                                    }}>
                                        {course.description || "No description provided."}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', color: '#6b7280' }}>
                                        <PersonIcon fontSize="small" />
                                        <Typography variant="caption">{course.instructor || "Unknown Instructor"}</Typography>
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ borderTop: '1px solid #f3f4f6', p: 2 }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Button
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handleViewClick(course)}
                                        >
                                            Details
                                        </Button>
                                    </Box>
                                    <Tooltip title="Edit Course">
                                        <IconButton size="small" color="primary" onClick={() => handleEditClick(course)}>
                                            <CreateIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Course">
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(course)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Add/Edit Course Modal */}
            <AddCourseModal
                open={openAddModal}
                onClose={() => {
                    setOpenAddModal(false);
                    setCourseToEdit(null); // Reset edit state on close
                }}
                onCourseAdded={fetchCourses}
                courseToEdit={courseToEdit} // Pass the course to edit
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Delete Course?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* View Course Details Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>Course Details</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {courseToView && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Title</Typography>
                                <Typography variant="h6">{courseToView.title}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Instructor</Typography>
                                <Typography variant="body1">{courseToView.instructor || 'N/A'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body1" sx={{ bgcolor: '#f9fafb', p: 2, borderRadius: 1 }}>
                                    {courseToView.description || 'N/A'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Course ID</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{courseToView.courseId}</Typography>
                            </Box>
                            {/* Media Linking Hint */}
                            <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <Typography variant="caption" color="primary">Media Integration</Typography>
                                <Typography variant="body2">
                                    To attach video content, go to the "Media Upload" section and link the Media ID to this course ID.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
