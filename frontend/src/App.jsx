// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import OpportunityListingPage from './pages/Opportunities.jsx';
import Contact from "./pages/Contact";
import About from "./pages/About";
import NgoDash from "./pages/dashboard/NgoDash.jsx";
import Navbar from "./components/Navbar.jsx";
import NgoPersonalization from "./pages/auth/personalization/NGO.jsx";
import VolunteerPersonalization from "./pages/auth/personalization/volunteer.jsx";
import VolunteerDash from "./pages/dashboard/VolunteerDash.jsx";
import Chat from "./pages/Chats/Chat.jsx";
import Profile from './pages/profiles/Profile.jsx';
import { Toaster } from "react-hot-toast";
import RequireAuth from "./components/RequireAuth.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="main-content-wrapper">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/opportunities"
              element={
                <RequireAuth>
                  <OpportunityListingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/contact"
              element={
                <RequireAuth>
                  <Contact />
                </RequireAuth>
              }
            />
            <Route
              path="/about"
              element={
                <RequireAuth>
                  <About />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard/ngo"
              element={
                <RequireAuth>
                  <NgoDash />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard/volunteer"
              element={
                <RequireAuth>
                  <VolunteerDash />
                </RequireAuth>
              }
            />
            <Route
              path="/personalize/ngo"
              element={
                <RequireAuth>
                  <NgoPersonalization />
                </RequireAuth>
              }
            />
            <Route
              path="/personalize/volunteer"
              element={
                <RequireAuth>
                  <VolunteerPersonalization />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:otherUserId"
              element={
                <RequireAuth>
                  <Chat />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '8px',
                background: '#333',
                color: '#fff'
              }
            }} />
        </div>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;