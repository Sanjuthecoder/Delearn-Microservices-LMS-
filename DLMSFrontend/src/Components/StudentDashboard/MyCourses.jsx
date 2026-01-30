import React from 'react';
import { Box, Typography } from '@mui/material';
import CourseCard from './CourseCard';

export default function MyCourses({ courses = [] }) {
    if (!courses || courses.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>📚</Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>No courses yet</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    You haven't enrolled in any courses yet. Browse the catalog to get started!
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                {courses.map((course) => (
                    <Box key={course.id || course.courseId} sx={{ flex: '1 1 300px', maxWidth: '380px', minWidth: '280px' }}>
                        {/* Pass isEnrolled true to prompt Start Learning button */}
                        <CourseCard course={course} isEnrolled={true} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
