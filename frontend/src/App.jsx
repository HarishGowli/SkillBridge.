// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="main-content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/opportunities" element={<OpportunityListingPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard/ngo" element={<NgoDash />} />
            <Route path="/dashboard/volunteer" element={<VolunteerDash />} />
            <Route path="/personalize/ngo" element={<NgoPersonalization />} />
            <Route path="/personalize/volunteer" element={<VolunteerPersonalization />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat/:otherUserId" element={<Chat />} />
            <Route path="*" element={<h1>404 Page Not Found!</h1>} />
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