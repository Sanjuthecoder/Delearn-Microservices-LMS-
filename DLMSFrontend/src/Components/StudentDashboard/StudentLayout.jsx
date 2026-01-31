import React, { useState, useEffect } from 'react';
import { Box, IconButton, Toolbar, AppBar, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import StudentSidebar from './StudentSidebar';
import StudentChatbot from './StudentChatbot';

const drawerWidth = 260;

export default function StudentLayout() {
    const [activeSection, setActiveSection] = useState('all-courses');
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Simple logic to sync sidebar active state with URL or default
    useEffect(() => {
        if (location.pathname.includes('/student')) {
            // Logic to sync active section
        }
    }, [location]);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            {/* Mobile Header */}
            <AppBar
                position="fixed"
                sx={{
                    display: { md: 'none' },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
                        DLMS
                    </Typography>
                </Toolbar>
            </AppBar>

            <StudentSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 0,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: { xs: 7, md: 0 } // Add margin top on mobile for AppBar
                }}
            >
                <Outlet context={{ activeSection, setActiveSection }} />
            </Box>

            {/* AI Chatbot Floating Component */}
            <StudentChatbot />
        </Box>
    );
}
