import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Grid, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../Service/api';

export default function Progress() {
    const [enrollmentsWithProgress, setEnrollmentsWithProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrollmentsWithProgress = async () => {
            setLoading(true);
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;

                // Fetch enrollments
                const enrollmentRes = await api.get(`/api/enrollments?userId=${userId}`);
                const enrollments = enrollmentRes.data || [];

                // Fetch course details for each enrollment
                const enrichedData = await Promise.all(
                    enrollments.map(async (enrollment) => {
                        try {
                            const courseRes = await api.get(`/api/courses/${enrollment.courseId}`);
                            return {
                                ...enrollment,
                                course: courseRes.data,
                            };
                        } catch (error) {
                            console.warn(`Course ${enrollment.courseId} not found`);
                            return null;
                        }
                    })
                );

                setEnrollmentsWithProgress(enrichedData.filter(item => item !== null));
            } catch (error) {
                console.error('Failed to fetch progress data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollmentsWithProgress();
    }, []);

    const getStatusColor = (progress) => {
        if (progress === 100) return 'success';
        if (progress >= 50) return 'warning';
        return 'info';
    };

    const getStatusLabel = (progress, status) => {
        if (status === 'COMPLETED' || progress === 100) return 'Completed';
        if (progress > 0) return 'In Progress';
        return 'Not Started';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography variant="h6" color="text.secondary">Loading your progress...</Typography>
            </Box>
        );
    }

    if (enrollmentsWithProgress.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
                    No courses yet
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Enroll in courses to track your progress
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
            {enrollmentsWithProgress.map((item) => {
                const progress = item.progress || 0;
                const course = item.course;

                return (
                    <Box key={course.id || course.courseId} sx={{ flex: '1 1 300px', maxWidth: '380px', minWidth: '280px', width: { xs: '100%', sm: 'auto' } }}>
                        <Card
                            sx={{
                                height: '100%',
                                minHeight: '320px',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: 'none',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
                                    borderColor: '#667eea',
                                },
                            }}
                            onClick={() => navigate(`/student/course/${course.id}`)}
                        >
                            <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                {/* Status Badge */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Chip
                                        label={getStatusLabel(progress, item.status)}
                                        color={getStatusColor(progress)}
                                        size="small"
                                        icon={progress === 100 ? <CheckCircleIcon /> : undefined}
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        {progress}%
                                    </Typography>
                                </Box>

                                {/* Course Title */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {course.title}
                                </Typography>

                                {/* Instructor */}
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    by {course.instructor || 'Unknown'}
                                </Typography>

                                {/* Progress Bar */}
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: 'rgba(0, 0, 0, 0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                                bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                                            },
                                        }}
                                    />
                                </Box>

                                {/* Completed Lessons Count - Always show to maintain consistent height */}
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    {item.completedLessons ? `${item.completedLessons.length || 0} lessons completed` : '0 lessons completed'}
                                </Typography>

                                {/* Enrolled Date */}
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                );
            })}
        </Box>
    );
}
