// Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import './Header.css';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();

    // Check login status on mount and when localStorage changes
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };

        checkAuth();

        // Listen for storage changes (e.g., login/logout in another tab)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Determine logo destination based on login status and role
    const getLogoDestination = () => {
        if (!isLoggedIn) {
            return '/';
        }
        const role = localStorage.getItem('role');
        if (role === 'ADMIN') {
            return '/admin';
        } else if (role === 'STUDENT') {
            return '/student';
        }
        return '/';
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to={getLogoDestination()}>
                    <img src="/logo.jpeg" alt="Logo" className="header-logo-left" />
                </Link>
                <nav className="header-nav">
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                    {isLoggedIn ? (
                        <ProfileMenu />
                    ) : (
                        <>
                            {location.pathname === '/login' ? (
                                <Link to="/Signup">Signup</Link>
                            ) : location.pathname === '/Signup' ? (
                                <Link to="/login">Login</Link>
                            ) : (
                                <>
                                    <Link to="/login">Login</Link>
                                    <Link to="/Signup">Signup</Link>
                                </>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;