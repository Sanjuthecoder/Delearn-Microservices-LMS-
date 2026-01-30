import React from 'react';
import { Box, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AllCourses from './AllCourses';
import MyCourses from './MyCourses';
import Progress from './Progress';
import { useCourseContext } from '../../Context/CourseContext';

export default function StudentDashboard() {
    const { activeSection, setActiveSection } = useOutletContext();
    const { enrolledCourses } = useCourseContext();

    return (
        <Box sx={{ p: 3 }}>
            {/* Dynamic Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                    {activeSection === 'all-courses' && 'Available Courses'}
                    {activeSection === 'my-courses' && 'My Learning'}
                    {activeSection === 'progress' && 'My Progress'}
                    {activeSection === 'assignments' && 'Assignments'}
                    {activeSection === 'certificates' && 'Achievements'}
                    {activeSection === 'calendar' && 'Schedule'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {activeSection === 'all-courses' && 'Explore new skills and advance your career'}
                    {activeSection === 'my-courses' && 'Continue where you left off'}
                </Typography>
            </Box>

            {/* Content Render */}
            {activeSection === 'all-courses' && <AllCourses />}

            {activeSection === 'my-courses' && (
                <MyCourses courses={enrolledCourses} />
            )}

            {activeSection === 'progress' && <Progress />}

            {/* Placeholder Sections */}
            {['assignments', 'certificates', 'calendar'].includes(activeSection) && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '50vh',
                        opacity: 0.7
                    }}
                >
                    <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🚧</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Feature Coming Soon</Typography>
                    <Typography color="text.secondary">This module is currently under development.</Typography>
                </Box>
            )}
        </Box>
    );
}
