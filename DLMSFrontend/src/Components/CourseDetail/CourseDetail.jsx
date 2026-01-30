import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Service/api';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCourseContext } from '../../Context/CourseContext';


export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { enrollInCourse, isEnrolled } = useCourseContext();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);

    useEffect(() => {
        setLoading(true);
        console.log(`Fetching course ${courseId} from backend...`);
        api.get(`/api/courses/${courseId}`)
            .then(response => {
                console.log("Fetched Course Details:", response.data);
                setCourse(response.data);
                // Check enrollment status (requires async or check context)
                // For now, rely on context logic if available, or fetch from backend
                const userId = localStorage.getItem('userId');
                if (userId) {
                    // Use courseId from URL parameter (MongoDB ID)
                    api.get(`/api/enrollments?userId=${userId}&courseId=${courseId}`)
                        .then(res => {
                            if (res.status === 200 && res.data && res.data.length > 0) {
                                setEnrolled(true);
                            }
                        })
                        .catch(() => setEnrolled(false));
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch course details:", error);
                setLoading(false);
            });
    }, [courseId]);

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading course details...</Typography>
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5">Course not found</Typography>
                <Button variant="outlined" onClick={() => navigate('/student')}>Back to Dashboard</Button>
            </Box>
        );
    }

    const handleEnroll = () => {
        // Retrieve userId from local storage
        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert("User not logged in or session expired.");
            return;
        }

        // Enrollment URL (POST)
        const enrollmentUrl = `/api/enrollments`;
        const enrollmentData = {
            userId: userId,
            courseId: courseId // Use courseId from URL (MongoDB ID)
        };

        console.log("Enrollment Request (POST):", enrollmentUrl, enrollmentData);

        api.post(enrollmentUrl, enrollmentData)
            .then(response => {
                console.log("Enrollment Response:", response);
                if (response.status === 200 || response.status === 201) {
                    const success = enrollInCourse(course);
                    setEnrolled(true);
                    alert('Successfully enrolled! You can now start learning.');
                }
            })
            .catch(error => {
                console.error("Enrollment Failed:", error);
                alert('Failed to enroll. Please try again later.');
            });
    };

    const handleStartLearning = () => {
        // Backend Verification Check
        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert("User not logged in or session expired.");
            return;
        }

        const verificationUrl = `/api/enrollments?userId=${userId}&courseId=${courseId}`;

        console.log("Verifying enrollment params:", verificationUrl);

        api.get(verificationUrl)
            .then(response => {
                console.log("Verification Response:", response);
                if (response.status === 200 || response.status === 201) {
                    navigate(`/course/${courseId}/learn`);
                } else {
                    alert("Verification Failed: Not Enrolled.");
                }
            })
            .catch(error => {
                console.error("Verification Error:", error);
                alert("Verification Failed: You are not enrolled.");
            });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb', pb: 4 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '3rem 2rem',
                }}
            >
                <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/student')}
                        sx={{
                            color: 'white',
                            mb: 2,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                        }}
                    >
                        Back to Dashboard
                    </Button>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                        {course.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SchoolIcon />
                            <Typography variant="body1">{course.instructorId}</Typography>
                        </Box>
                        <Chip label={course.level} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        <Chip label={course.duration} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {/* Left Column */}
                    <Box sx={{ flex: '1 1 600px' }}>
                        {/* About */}
                        <Card sx={{ mb: 3, borderRadius: '12px' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>About This Course</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    {course.fullDescription}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Curriculum Accordion */}
                        <Card sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Curriculum</Typography>
                                {course.modules.map((module, index) => (
                                    <Accordion key={index} disableGutters elevation={0} sx={{ borderBottom: '1px solid #e5e7eb', '&:before': { display: 'none' } }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ fontWeight: 600 }}>{module.title}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ bgcolor: '#f9fafb' }}>
                                            {module.lessons.map((lesson, lIndex) => (
                                                <Box key={lIndex} sx={{ display: 'flex', alignItems: 'center', py: 1, gap: 1 }}>
                                                    {lesson.type === 'Video' ? <PlayCircleOutlineIcon fontSize="small" color="primary" /> : <PictureAsPdfIcon fontSize="small" color="error" />}
                                                    <Typography variant="body2">{lesson.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{lesson.duration}</Typography>
                                                </Box>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Right Sidebar */}
                    <Box sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
                        <Card sx={{ mb: 3, borderRadius: '12px', position: 'sticky', top: '20px' }}>
                            <CardContent sx={{ p: 3 }}>
                                {!enrolled ? (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleEnroll}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                            py: 1.5,
                                            mb: 2
                                        }}
                                    >
                                        Add to My Courses
                                    </Button>
                                ) : (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={handleStartLearning}
                                        sx={{
                                            bgcolor: '#10b981',
                                            color: 'white',
                                            fontWeight: 600,
                                            py: 1.5,
                                            mb: 2,
                                            '&:hover': { bgcolor: '#059669' }
                                        }}
                                    >
                                        Start Learning
                                    </Button>
                                )}

                                {enrolled && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', color: '#10b981', mt: 1 }}>
                                        <CheckCircleIcon fontSize="small" />
                                        <Typography variant="body2" fontWeight={600}>Enrolled</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
