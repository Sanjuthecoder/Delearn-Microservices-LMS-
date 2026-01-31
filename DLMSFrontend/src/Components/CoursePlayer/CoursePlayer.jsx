import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../Service/api';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Button,
    AppBar,
    Toolbar,
    Checkbox,
    LinearProgress,
    Tooltip,
    Dialog,
    DialogContent,
    Fade
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';


import FileDownloadIcon from '@mui/icons-material/FileDownload';

const sidebarWidth = 320;

// Helper to get consistent ID with fallback for old data
const getLessonId = (lesson, index) => {
    if (lesson.id) return lesson.id;
    if (lesson._id) return lesson._id;
    if (lesson.lessonId) return lesson.lessonId;
    // Fallback for legacy data (fixes "mark all complete" bug)
    return `fallback-${index}-${lesson.title?.replace(/\s+/g, '-')}`;
};

export default function CoursePlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showCongrats, setShowCongrats] = useState(false);
    const [loading, setLoading] = useState(true);
    const [videoUrl, setVideoUrl] = useState('');

    // Flatten all lessons from modules
    const allLessons = course?.modules?.flatMap(m => m.lessons) || [];

    // Fetch course details
    useEffect(() => {
        if (!courseId) return;

        setLoading(true);
        api.get(`/api/courses/${courseId}`)
            .then(response => {
                console.log('Fetched course:', response.data);
                setCourse(response.data);

                // Set first lesson as active
                if (response.data?.modules?.length > 0 && response.data.modules[0].lessons?.length > 0) {
                    setActiveLesson(response.data.modules[0].lessons[0]);
                }

                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch course:', error);
                setLoading(false);
            });
    }, [courseId]);

    // Fetch video URL when active lesson changes
    useEffect(() => {
        if (activeLesson?.mediaId) {
            api.get(`/api/media/${activeLesson.mediaId}`)
                .then(response => {
                    console.log('Fetched video URL:', response.data);
                    setVideoUrl(response.data);
                })
                .catch(error => {
                    console.error('Failed to fetch video URL:', error);
                    setVideoUrl('');
                });
        } else {
            setVideoUrl('');
        }
    }, [activeLesson]);

    // Load completed lessons from enrollment on mount
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId && courseId) {
            api.get(`/api/enrollments?userId=${userId}`)
                .then(response => {
                    if (response.data && response.data.length > 0) {
                        // Find enrollment for this course
                        const enrollment = response.data.find(e => e.courseId === courseId);
                        if (enrollment) {
                            setCompletedLessons(enrollment.completedLessons || []);
                            setProgress(enrollment.progress || 0);
                            console.log('Loaded progress from enrollment:', enrollment);
                        }
                    }
                })
                .catch(error => {
                    console.error('Failed to load enrollment progress:', error);
                });
        }
    }, [courseId]);

    // Update progress when completed lessons change
    useEffect(() => {
        if (allLessons.length > 0) {
            const progressPercent = Math.round((completedLessons.length / allLessons.length) * 100);
            setProgress(progressPercent);

            // Show congratulations if all lessons completed
            if (progressPercent === 100 && completedLessons.length > 0) {
                setShowCongrats(true);
            }
        }
    }, [completedLessons, allLessons.length]);


    const currentIndex = allLessons.findIndex((l, idx) => getLessonId(l, idx) === getLessonId(activeLesson || {}, allLessons.indexOf(activeLesson)));

    // Event Handlers
    const handleLessonChange = (lesson) => {
        setActiveLesson(lesson);
    };

    const toggleComplete = (lessonId) => {
        setCompletedLessons(prev => {
            const newCompleted = prev.includes(lessonId)
                ? prev.filter(id => id !== lessonId)
                : [...prev, lessonId];

            // Save progress to backend
            const userId = localStorage.getItem('userId');
            if (userId && courseId && allLessons.length > 0) {
                const progressPercent = Math.round((newCompleted.length / allLessons.length) * 100);

                api.put(`/api/enrollments/progress?userId=${userId}&courseId=${courseId}`, {
                    completedLessons: newCompleted,
                    progress: progressPercent
                })
                    .then(() => {
                        console.log('Progress saved:', { completedLessons: newCompleted, progress: progressPercent });
                    })
                    .catch(error => {
                        console.error('Failed to save progress:', error);
                    });
            }

            return newCompleted;
        });
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const handleNext = () => {
        if (currentIndex < allLessons.length - 1) {
            setActiveLesson(allLessons[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setActiveLesson(allLessons[currentIndex - 1]);
        }
    };

    const handleDownload = async (mediaId, title, lessonId) => {
        if (!mediaId) {
            alert('No downloadable resource available for this lesson.');
            return;
        }

        try {
            // Use the configurable API Gateway URL from environment variable
            // It routes through Gateway: /api/media/download/{mediaId}
            const apiBase = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';
            const downloadUrl = `${apiBase}/api/media/download/${mediaId}`;
            // Use window.open to trigger the browser's download behavior
            window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error('Download trigger failed:', error);
            alert('Failed to initiate download.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
                <Typography color="white">Loading course...</Typography>
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, bgcolor: '#0f172a' }}>
                <Typography variant="h5" color="white">Course not found</Typography>
                <Button variant="outlined" onClick={() => navigate('/student')}>Back to Dashboard</Button>
            </Box>
        );
    }


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#0f172a' }}>
            {/* Top Bar (unchanged) */}
            <AppBar position="static" sx={{ bgcolor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar variant="dense">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/student')}
                        sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' }, mr: 2 }}
                    >
                        Dashboard
                    </Button>
                    <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {course?.title}
                    </Typography>

                    <Tooltip title={isSidebarOpen ? "Focus Mode (Hide Sidebar)" : "Show Sidebar"}>
                        <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
                            {isSidebarOpen ? <AspectRatioIcon /> : <MenuIcon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Main Layout Area */}
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>

                {/* Left: Video Area (Grows) */}
                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'black',
                    position: 'relative',
                    overflow: 'hidden' // Ensure no scrollbars
                }}>
                    {/* Video Container - Responsive 16:9 Aspect Ratio */}
                    <Box sx={{
                        width: '100%',
                        position: 'relative',
                        paddingTop: '56.25%', // 16:9 Aspect Ratio
                        bgcolor: 'black',
                        alignSelf: 'center' // Center vertically if there's extra space
                    }}>
                        {activeLesson ? (
                            <iframe
                                src={videoUrl}
                                title={activeLesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                            ></iframe>
                        ) : (
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography color="white">Select a lesson to start</Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Bottom Controls - Sticky at bottom of video area */}
                    <Box sx={{
                        p: 2,
                        bgcolor: '#1e293b',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0,
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {activeLesson?.title || "No Lesson Selected"}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                Lesson {(currentIndex !== -1 ? currentIndex : 0) + 1} of {allLessons.length}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<KeyboardArrowLeftIcon />}
                                disabled={currentIndex <= 0}
                                onClick={handlePrev}
                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                            >
                                Prev
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                endIcon={<KeyboardArrowRightIcon />}
                                disabled={currentIndex === allLessons.length - 1}
                                onClick={handleNext}
                                sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
                            >
                                Next
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Right Sidebar logic remains... */}

                {/* Right: Sidebar / Playlist */}
                {isSidebarOpen && (
                    <Box sx={{
                        width: sidebarWidth,
                        bgcolor: '#1e293b',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0
                    }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>YOUR PROGRESS</Typography>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, display: 'block', textAlign: 'right' }}>
                                {progress}% Completed
                            </Typography>
                        </Box>

                        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                            {course?.modules.map((module, mIndex) => {
                                // Calculate global index offset if needed, or just iterate linearly if allLessons is flat
                                // For simplicity, we find the real index in allLessons
                                return (
                                    <Box key={mIndex}>
                                        <Typography sx={{
                                            p: 2,
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            color: '#cbd5e1',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {module.title}
                                        </Typography>
                                        <List disablePadding>
                                            {module.lessons.map((lesson) => {
                                                // Find the global index of this lesson
                                                const globalIndex = allLessons.indexOf(lesson);
                                                const lId = getLessonId(lesson, globalIndex);
                                                const isActive = getLessonId(activeLesson || {}, allLessons.indexOf(activeLesson)) === lId;

                                                return (
                                                    <ListItem key={lId} disablePadding>
                                                        <ListItemButton
                                                            selected={isActive}
                                                            onClick={() => handleLessonChange(lesson)}
                                                            sx={{
                                                                pl: 3,
                                                                borderLeft: isActive ? '3px solid #667eea' : '3px solid transparent',
                                                                bgcolor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                                                '&.Mui-selected': { bgcolor: 'rgba(102, 126, 234, 0.15)' }
                                                            }}
                                                        >
                                                            <Checkbox
                                                                edge="start"
                                                                checked={completedLessons.includes(lId)}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleComplete(lId);
                                                                }}
                                                                icon={<CheckCircleIcon sx={{ color: 'rgba(255,255,255,0.1)' }} />}
                                                                checkedIcon={<CheckCircleIcon sx={{ color: '#10b981' }} />}
                                                                size="small"
                                                            />
                                                            <ListItemText
                                                                primary={lesson.title}
                                                                secondary={lesson.duration}
                                                                primaryTypographyProps={{
                                                                    color: isActive ? '#fff' : '#cbd5e1',
                                                                    fontWeight: isActive ? 600 : 400,
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                secondaryTypographyProps={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}
                                                            />
                                                            {lesson.mediaId && (
                                                                <IconButton
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(lesson.mediaId, lesson.title, lId);
                                                                    }}
                                                                    size="small"
                                                                    sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#667eea' }, mr: 1 }}
                                                                >
                                                                    <FileDownloadIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                            {isActive && <PlayCircleFilledIcon fontSize="small" sx={{ color: '#667eea' }} />}
                                                        </ListItemButton>
                                                    </ListItem>
                                                )
                                            })}
                                        </List>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Congratulations Modal */}
            <Dialog
                open={showCongrats}
                onClose={() => setShowCongrats(false)}
                TransitionComponent={Fade}
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        borderRadius: '24px',
                        padding: '1rem',
                        textAlign: 'center',
                        maxWidth: '400px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }
                }}
            >
                <Box sx={{ position: 'absolute', right: 16, top: 16 }}>
                    <IconButton onClick={() => setShowCongrats(false)} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 4, pb: 4 }}>
                    <Box sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        mb: 1
                    }}>
                        <EmojiEventsIcon sx={{ fontSize: 48, color: '#059669' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        Congratulations!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                        You've completed <b>{course?.title}</b>. <br />Keep up the amazing work!
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setShowCongrats(false)}
                        sx={{
                            bgcolor: 'white',
                            color: '#059669',
                            fontWeight: 700,
                            borderRadius: '50px',
                            px: 4,
                            py: 1,
                            mt: 2,
                            '&:hover': { bgcolor: '#f0fdf4' }
                        }}
                    >
                        Continue Learning
                    </Button>
                </DialogContent>
            </Dialog>

        </Box>
    );
}
