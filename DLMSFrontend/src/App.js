import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from "./Components/Login/Login";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";
import About from "./Components/About/About";
import Contact from "./Components/Contact/Contact";
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./Components/TermsOfService/TermsOfService";
import Signup from "./Components/SignUp/Signup";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import StudentDashboard from "./Components/StudentDashboard/StudentDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import ScrollToTop from "./Components/ScrollToTop";
import CourseDetail from "./Components/CourseDetail/CourseDetail";
import { CourseProvider } from "./Context/CourseContext";
import CoursePlayer from "./Components/CoursePlayer/CoursePlayer";
import StudentLayout from "./Components/StudentDashboard/StudentLayout";
import AdminLayout from "./Components/AdminDashboard/AdminLayout";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";

export default function App() {
  const navigate = useNavigate(); // 2. Initialize the hook
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // // A function to call when login is successful
  // const handleLoginSuccess = () => {
  //       navigate('/landing')
  //   // setIsLoggedIn(true);

  // };

  // // A function to handle logout (optional, but good practice)
  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  // };
  return (
    <CourseProvider>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Routes>
        <Route path="/login" element={<><Header /><Login /><Footer /></>} />
        <Route path="/" element={
          localStorage.getItem('token') ? (
            localStorage.getItem('role') === 'ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/student" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/about" element={<><Header /><About /><Footer /></>} />  {/* <-- Use this path */}
        <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
        <Route path="/privacy" element={<><Header /><PrivacyPolicy /><Footer /></>} />
        <Route path="/terms" element={<><Header /><TermsOfService /><Footer /></>} />
        <Route path="/Signup" element={<><Header /><Signup /><Footer /></>} />

        {/* Admin Routes Wrapped in Layout */}
        <Route element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Student Routes Wrapped in Layout */}
        <Route element={
          <ProtectedRoute>
            <><Header /><StudentLayout /><Footer /></>
          </ProtectedRoute>
        }>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
        </Route>

        {/* Player standalone (full screen experience) but guarded */}
        <Route path="/course/:courseId/learn" element={
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        } />
      </Routes>
    </CourseProvider>
  );
}