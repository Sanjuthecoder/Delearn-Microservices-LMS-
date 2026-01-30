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
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
    { id: 'courses', label: 'All Courses', path: '/admin', icon: <ClassIcon /> },
    { id: 'users', label: 'User Management', path: '/admin?section=users', icon: <PeopleIcon /> },
    { id: 'settings', label: 'Settings', path: '/admin?section=settings', icon: <SettingsIcon /> },
];

export default function AdminSidebar({ activeSection, setActiveSection, mobileOpen, handleDrawerToggle }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (item) => {
        if (mobileOpen && handleDrawerToggle) {
            handleDrawerToggle();
        }

        if (setActiveSection) {
            setActiveSection(item.id);
            if (location.pathname !== '/admin') {
                navigate('/admin');
            }
        }
    };

    const handleLogout = () => {
        // Clear all auth items
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');

        // Notify other components
        window.dispatchEvent(new Event('storage'));

        // Redirect to login
        navigate('/login');
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
            {/* Logo */}
            <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                <img
                    src="/logo.jpeg"
                    alt="DLMS Admin"
                    style={{
                        width: '140px',
                        height: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </Box>

            {/* Menu */}
            <Box sx={{ flexGrow: 1, py: 2 }}>
                <List sx={{ px: 2 }}>
                    <Typography variant="caption" sx={{ px: 2, mb: 1, display: 'block', color: '#9ca3af', fontWeight: 600 }}>
                        MANAGEMENT
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
                                        bgcolor: 'rgba(102, 126, 234, 0.08)', // Student Blue
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

            {/* User Info */}
            <Box sx={{ p: 2, borderTop: '1px solid #f3f4f6', bgcolor: '#f9fafb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1 }}>
                    <Avatar sx={{ bgcolor: '#764ba2', width: 40, height: 40 }}>
                        {localStorage.getItem('userName') ? localStorage.getItem('userName').charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                            {localStorage.getItem('userName') || 'Administrator'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {localStorage.getItem('email') || 'admin@system.com'}
                        </Typography>
                    </Box>
                </Box>

                <ListItemButton
                    onClick={handleLogout}
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
        <>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        height: '100vh',
                        position: 'fixed',
                        borderRight: '1px solid #e5e7eb'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </>
    );
}
