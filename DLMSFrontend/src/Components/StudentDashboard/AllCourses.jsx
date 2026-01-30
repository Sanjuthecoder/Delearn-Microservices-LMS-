import React, { useState, useEffect } from 'react';
import api from '../../Service/api';
import {
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import CourseCard from './CourseCard';

export default function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Use relative path to leverage api.js baseURL and interceptors correctly
        api.get('/api/courses')
            .then(response => {
                console.log("Fetched Backend Courses:", response.data);
                if (Array.isArray(response.data)) {
                    setCourses(response.data);
                } else {
                    setCourses([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch courses:", err);
                setError("Failed to load courses. Please try logging in again.");
                setLoading(false);
            });
    }, []);

    return (
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>

            {/* Course Grid */}
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="text.secondary">
                        Showing {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                    </Typography>
                </Box>

                {error && (
                    <Box sx={{ p: 2, mb: 2, bgcolor: '#fee2e2', color: '#b91c1c', borderRadius: 1, textAlign: 'center' }}>
                        <Typography>{error}</Typography>
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                            {courses.map((course) => (
                                <Box key={course.id || course.courseId} sx={{ flex: '1 1 300px', maxWidth: '380px', minWidth: '280px', width: { xs: '100%', sm: 'auto' } }}>
                                    <CourseCard course={course} />
                                </Box>
                            ))}
                        </Box>

                        {!error && courses.length === 0 && (
                            <Box sx={{ py: 8, textAlign: 'center', width: '100%' }}>
                                <Typography color="text.secondary">No courses found available.</Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}
