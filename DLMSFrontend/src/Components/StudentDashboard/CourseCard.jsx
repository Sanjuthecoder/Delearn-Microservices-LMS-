import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardContent, CardActions, Button, Chip, Box, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SchoolIcon from '@mui/icons-material/School';
import api from '../../Service/api';
import { useCourseContext } from '../../Context/CourseContext';

export default function CourseCard({ course, isEnrolled }) {
    // Prefer String ID (id) from backend, fallback to courseId if legacy
    const { id, courseId, title, description, instructor, modules, enrollmentStatus } = course;
    const activeId = id || courseId; // Use the Mongo ID if available

    const navigate = useNavigate();
    const { enrollInCourse, isEnrolled: isEnrolledInContext, fetchUserEnrollments } = useCourseContext();

    // Local state to handle UI updates immediately
    // If prop is provided (MyCourses), use it. Otherwise check context.
    const [localEnrolled, setLocalEnrolled] = React.useState(
        isEnrolled !== undefined ? isEnrolled : isEnrolledInContext(activeId)
    );

    // Sync local state if context changes (optional, but good for consistency)
    React.useEffect(() => {
        if (isEnrolled === undefined) {
            setLocalEnrolled(isEnrolledInContext(activeId));
        }
    }, [isEnrolledInContext, activeId, isEnrolled]);


    // Count module types (Backend structure: modules -> lessons -> type)
    const videoCount = modules ? modules.reduce((acc, module) => acc + (module.lessons ? module.lessons.filter(l => l.type === 'Video').length : 0), 0) : 0;
    const pdfCount = modules ? modules.reduce((acc, module) => acc + (module.lessons ? module.lessons.filter(l => l.type === 'PDF').length : 0), 0) : 0;
    const moduleCount = modules ? modules.length : 0;

    const handleClick = async () => {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            toast.warning("Please log in to enroll.");
            return;
        }

        if (localEnrolled) {
            // Already Enrolled -> Verification Check before Start Learning
            const verificationUrl = `/api/enrollments?userId=${userId}&courseId=${activeId}`;
            console.log("Verifying enrollment before starting:", verificationUrl);

            try {
                const response = await api.get(verificationUrl);
                console.log("Verification Response:", response);

                if (response.status === 200 || response.status === 201) {
                    // Success: Navigate to Learning Page
                    navigate(`/course/${activeId}/learn`);
                } else {
                    throw new Error("Verification status not OK");
                }
            } catch (error) {
                console.error("Verification Failed:", error);
                toast.error("Verification Failed: You are no longer enrolled.");

                // Revert State: Flip back to "View Details"
                setLocalEnrolled(false);

                // Refresh Context to remove from "My Courses" list
                if (fetchUserEnrollments) {
                    fetchUserEnrollments(userId);
                }
            }

        } else {
            // Not Enrolled -> Navigate to Course Detail Page (enrollment happens there)
            // Or if you want direct enrollment here:
            navigate(`/course/${activeId}`);
        }
    };

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                height: '100%',
                minHeight: '320px', // Standardized minimum height for all cards
                maxWidth: '380px',
                boxShadow: 'none',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
                    borderColor: '#667eea',
                },
            }}
        >
            {/* Compact Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '1rem 1.25rem',
                    color: 'white',
                    minHeight: '85px', // Fixed header height for consistency
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.3,
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                        <SchoolIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            {instructor}
                        </Typography>
                    </Box>
                    {enrollmentStatus && (
                        <Box
                            sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: '12px',
                                bgcolor: enrollmentStatus === 'COMPLETED' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                                color: enrollmentStatus === 'COMPLETED' ? '#1e3a8a' : '#065f46',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {enrollmentStatus === 'COMPLETED' ? '✓ Completed' : 'Active'}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Course Content */}
            <CardContent sx={{ flexGrow: 1, padding: '1rem 1.25rem', pb: '0.75rem' }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 1.5,
                        lineHeight: 1.5,
                        fontSize: '0.875rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {description}
                </Typography>

                {/* Module Information - Compact */}
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    {videoCount > 0 && (
                        <Chip
                            icon={<PlayCircleOutlineIcon sx={{ fontSize: '0.9rem' }} />}
                            label={`${videoCount} Video${videoCount !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: '#e0e7ff',
                                color: '#4c1d95',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '24px',
                            }}
                        />
                    )}
                    {pdfCount > 0 && (
                        <Chip
                            icon={<PictureAsPdfIcon sx={{ fontSize: '0.9rem' }} />}
                            label={`${pdfCount} PDF${pdfCount !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '24px',
                            }}
                        />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.75rem' }}>
                        {moduleCount} modules
                    </Typography>
                </Box>
            </CardContent>

            {/* Compact Action Button */}
            <CardActions sx={{ padding: '0.75rem 1.25rem', pt: 0 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={handleClick}
                    sx={{
                        background: localEnrolled
                            ? '#10b981' // Green for start learning
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        padding: '0.5rem',
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                            background: localEnrolled ? '#059669' : 'linear-gradient(135deg, #5568d3 0%, #6941a0 100%)',
                        },
                    }}
                >
                    {localEnrolled ? 'Start Learning' : 'View Details'}
                </Button>
            </CardActions>
        </Card>
    );
}
