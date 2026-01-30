import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../Service/api';

const CourseContext = createContext();

export const useCourseContext = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    // Load from local storage on mount (temporary until API fetch completes)
    useEffect(() => {
        const savedCourses = localStorage.getItem('enrolledCourses');
        const userId = localStorage.getItem('userId');

        if (savedCourses) {
            setEnrolledCourses(JSON.parse(savedCourses));
        }

        // Fetch fresh enrollments from backend if user is logged in
        if (userId) {
            fetchUserEnrollments(userId);
        }
    }, []);

    // Save to local storage whenever enrolledCourses changes
    useEffect(() => {
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }, [enrolledCourses]);

    const enrollInCourse = (course) => {
        const courseIdToCheck = course.id || course.courseId;
        if (!enrolledCourses.find(c => (c.id === courseIdToCheck || c.courseId === courseIdToCheck))) {
            setEnrolledCourses([...enrolledCourses, course]);
            return true; // Enrolled successfully
        }
        return false; // Already enrolled
    };

    const isEnrolled = (courseId) => {
        return enrolledCourses.some(c => (c.id === courseId || c.courseId === courseId));
    };

    const fetchUserEnrollments = async (userId) => {
        try {
            // Get enrollments from backend
            const response = await api.get(`/api/enrollments?userId=${userId}`);
            if (response.status === 200 && response.data) {
                const enrollments = response.data;

                // Fetch full course details for each enrollment with status
                const coursePromises = enrollments.map(async (enrollment) => {
                    try {
                        const courseRes = await api.get(`/api/courses/${enrollment.courseId}`);
                        // Add enrollment status and progress to the course object
                        return {
                            ...courseRes.data,
                            enrollmentStatus: enrollment.status, // ENROLLED or COMPLETED
                            progress: enrollment.progress || 0,
                            enrolledAt: enrollment.enrolledAt
                        };
                    } catch (error) {
                        console.warn(`Course ${enrollment.courseId} not found or deleted, skipping`);
                        return null;
                    }
                });

                const courses = await Promise.all(coursePromises);
                const validCourses = courses.filter(c => c !== null);

                // Sort: ENROLLED courses first, then COMPLETED
                validCourses.sort((a, b) => {
                    if (a.enrollmentStatus === 'ENROLLED' && b.enrollmentStatus === 'COMPLETED') return -1;
                    if (a.enrollmentStatus === 'COMPLETED' && b.enrollmentStatus === 'ENROLLED') return 1;
                    return 0;
                });

                console.log('Fetched and validated enrolled courses:', validCourses);
                setEnrolledCourses(validCourses);
                localStorage.setItem('enrolledCourses', JSON.stringify(validCourses));
            }
        } catch (error) {
            console.error("Failed to fetch enrollments:", error);
        }
    };

    return (
        <CourseContext.Provider value={{ enrolledCourses, enrollInCourse, isEnrolled, fetchUserEnrollments }}>
            {children}
        </CourseContext.Provider>
    );
};
