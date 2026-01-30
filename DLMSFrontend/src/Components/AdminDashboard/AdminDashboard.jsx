import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import AdminCourseList from './AdminCourseList';
import UserManagement from './UserManagement';

export default function AdminDashboard() {
    // Context provided by AdminLayout
    const { activeSection } = useOutletContext() || { activeSection: 'courses' };

    return (
        <Box sx={{ maxWidth: '1600px', margin: '0 auto' }}>
            {/* Dynamic Content */}
            {activeSection === 'courses' && (
                <Box>
                    {/* Course List & Actions */}
                    <AdminCourseList />


                </Box>
            )}

            {activeSection === 'users' && (
                <UserManagement />
            )}

            {activeSection === 'settings' && (
                <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', borderRadius: 2, border: '1px dashed #ccc' }}>
                    <Typography variant="h5" color="text.secondary">System Settings</Typography>
                    <Typography>Coming Soon</Typography>
                </Box>
            )}
        </Box>
    );
}
