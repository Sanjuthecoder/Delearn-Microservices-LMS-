import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AdminSidebar from './AdminSidebar';

const drawerWidth = 260;

export default function AdminLayout() {
    const [activeSection, setActiveSection] = useState('courses');
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <AppBar
                position="fixed"
                sx={{
                    display: { md: 'none' },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        DLMS Admin
                    </Typography>
                </Toolbar>
            </AppBar>

            <AdminSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: { md: `${drawerWidth}px` },
                    mt: { xs: 7, md: 0 },
                    overflowX: 'hidden'
                }}
            >
                <Outlet context={{ activeSection, setActiveSection }} />
            </Box>
        </Box>
    );
}
