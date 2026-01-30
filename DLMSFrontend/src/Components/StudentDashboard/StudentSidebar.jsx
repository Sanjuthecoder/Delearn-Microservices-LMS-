import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
    { id: 'all-courses', label: 'All Courses', path: '/student', icon: <SchoolIcon /> },
    { id: 'my-courses', label: 'My Courses', path: '/student?section=my-courses', icon: <MenuBookIcon /> },
    { id: 'progress', label: 'My Progress', path: '/student?section=progress', icon: <TimelineIcon /> },
    { id: 'assignments', label: 'Assignments', path: '/student?section=assignments', icon: <AssignmentIcon /> },
    { id: 'certificates', label: 'Certificates', path: '/student?section=certificates', icon: <EmojiEventsIcon /> },
    { id: 'calendar', label: 'Calendar', path: '/student?section=calendar', icon: <CalendarTodayIcon /> },
];

export default function StudentSidebar({ activeSection, setActiveSection, mobileOpen, handleDrawerToggle }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (item) => {
        // Close mobile drawer if open
        if (mobileOpen && handleDrawerToggle) {
            handleDrawerToggle();
        }

        if (setActiveSection) {
            // If we are already on the dashboard, just switch section
            // In a real app with routing, this might just always navigate or sync state
            setActiveSection(item.id);
            if (location.pathname !== '/student') {
                navigate('/student');
            }
        } else {
            navigate('/student');
        }
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
            {/* 1. Website Logo */}
            <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                <img
                    src="/logo.jpeg"
                    alt="DLMS"
                    style={{
                        width: '140px',
                        height: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </Box>

            {/* 2. Navigation Options */}
            <Box sx={{ flexGrow: 1, py: 2 }}>
                <List sx={{ px: 2 }}>
                    <Typography variant="caption" sx={{ px: 2, mb: 1, display: 'block', color: '#9ca3af', fontWeight: 600 }}>
                        MENU
                    </Typography>
                    {menuItems.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={activeSection === item.id}
                                onClick={() => handleNavigation(item)}
                                sx={{
                                    borderRadius: '8px',
                                    py: 1,
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(102, 126, 234, 0.08)',
                                        color: '#667eea',
                                        '& .MuiListItemIcon-root': { color: '#667eea' },
                                        '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.12)' },
                                    },
                                    '&:hover': {
                                        bgcolor: '#f9fafb',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: '#6b7280' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: activeSection === item.id ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* 3. User Details & Logout (Bottom Fixed) */}
            <Box sx={{ p: 2, borderTop: '1px solid #f3f4f6', bgcolor: '#f9fafb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1 }}>
                    <Avatar sx={{ bgcolor: '#764ba2', width: 40, height: 40 }}>
                        {localStorage.getItem('userName') ? localStorage.getItem('userName').charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {localStorage.getItem('userName') || 'Guest User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {localStorage.getItem('email') || 'user@example.com'}
                        </Typography>
                    </Box>
                </Box>

                <ListItemButton
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('role');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('email');
                        localStorage.removeItem('enrolledCourses');
                        window.dispatchEvent(new Event('storage'));
                        navigate('/login');
                    }}
                    sx={{
                        borderRadius: '8px',
                        color: '#ef4444',
                        py: 1,
                        justifyContent: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        '&:hover': {
                            bgcolor: '#fef2f2',
                            borderColor: '#ef4444'
                        },
                    }}
                >
                    <LogoutIcon sx={{ fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Log Out</Typography>
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Mobile Drawer (Temporary) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: 'none',
                        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer (Permanent) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: '1px solid #e5e7eb',
                        height: '100vh',
                        position: 'fixed'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}
