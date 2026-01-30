import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../Service/api';

export default function ViewUserDetailsDialog({ open, onClose, user }) {
    const [enrollments, setEnrollments] = useState([]);
    const [coursesData, setCoursesData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && user) {
            fetchEnrollmentData();
        }
    }, [open, user]);

    const fetchEnrollmentData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch enrollments for this user
            const enrollmentRes = await api.get(`/api/enrollments?userId=${user.id}`);
            const enrollmentList = enrollmentRes.data;
            setEnrollments(enrollmentList);

            // Fetch course details for each enrollment
            const coursePromises = enrollmentList.map(enrollment =>
                api.get(`/api/courses/${enrollment.courseId}`)
                    .then(res => ({ courseId: enrollment.courseId, data: res.data }))
                    .catch(() => ({ courseId: enrollment.courseId, data: null }))
            );

            const courseResults = await Promise.all(coursePromises);
            const coursesMap = {};
            courseResults.forEach(result => {
                if (result.data) {
                    coursesMap[result.courseId] = result.data;
                }
            });
            setCoursesData(coursesMap);
        } catch (err) {
            console.error('Error fetching enrollment data:', err);
            setError('Failed to load enrollment data');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const activeEnrollments = enrollments.filter(e => e.status === 'ENROLLED');
    const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED');

    const getRoleIcon = (role) => {
        return role === 'ADMIN' ? <AdminPanelSettingsIcon /> : <SchoolIcon />;
    };

    const getRoleColor = (role) => {
        return role === 'ADMIN' ? '#7c3aed' : '#10b981';
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 700,
                color: '#111827'
            }}>
                User Details
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {/* User Information */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        USER INFORMATION
                    </Typography>
                    <Box sx={{
                        p: 2.5,
                        bgcolor: '#f9fafb',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        mt: 1
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <PersonIcon sx={{ color: '#667eea' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {user.userName}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6b7280' }}>
                                    <EmailIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {user.email}
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                icon={getRoleIcon(user.role)}
                                label={user.role}
                                sx={{
                                    bgcolor: `${getRoleColor(user.role)}15`,
                                    color: getRoleColor(user.role),
                                    fontWeight: 700,
                                    height: 32
                                }}
                            />
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="caption" color="text.secondary">
                            User ID: {user.id}
                        </Typography>
                    </Box>
                </Box>

                {/* Enrollment Statistics */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        ENROLLMENT STATISTICS
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        mt: 1
                    }}>
                        <Box sx={{
                            flex: 1,
                            p: 2,
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                                {enrollments.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Courses
                            </Typography>
                        </Box>
                        <Box sx={{
                            flex: 1,
                            p: 2,
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                                {activeEnrollments.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Active
                            </Typography>
                        </Box>
                        <Box sx={{
                            flex: 1,
                            p: 2,
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                                {completedEnrollments.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Completed
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Course List */}
                <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        ENROLLED COURSES
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {error}
                        </Alert>
                    ) : enrollments.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography color="text.secondary">
                                No courses enrolled yet
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {enrollments.map(enrollment => {
                                const course = coursesData[enrollment.courseId];
                                const progress = enrollment.progress || 0;

                                return (
                                    <Box
                                        key={enrollment.id}
                                        sx={{
                                            p: 2,
                                            bgcolor: '#f9fafb',
                                            borderRadius: 2,
                                            border: '1px solid #e5e7eb'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {course?.title || 'Loading...'}
                                            </Typography>
                                            <Chip
                                                label={enrollment.status}
                                                size="small"
                                                icon={enrollment.status === 'COMPLETED' ? <CheckCircleIcon /> : undefined}
                                                color={enrollment.status === 'COMPLETED' ? 'success' : 'primary'}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>

                                        <Box sx={{ mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Progress
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                    {progress}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={progress}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: 'rgba(0, 0, 0, 0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: progress === 100 ? '#10b981' : '#667eea'
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="caption" color="text.secondary">
                                            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e5e7eb' }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
