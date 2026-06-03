// src/pages/dashboard/VolunteerDash.jsx

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { baseUrl } from "../data/api";
import "./VolunteerDash.css";
import toast from "react-hot-toast";
import io from 'socket.io-client'; 

// Initialize Socket.IO client
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000', {
    autoConnect: false, 
    withCredentials: true,
});

// Formats date to DD/MM/YYYY
const formatDateDMY = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Component to display application status
const StatusBadge = ({ status }) => {
    const statusClass = status.toLowerCase();
    return (
        <span className={`status-badge status-${statusClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Modal Component for Application Details
const ApplicationDetailsModal = ({ application, onClose }) => { 
    if (!application) return null;

    const opp = application.opportunityId;
    const ngo = opp.ngoId;
    const withdrawApplication = async (id) => {
        try {
            const res = await axios.delete(`${baseUrl}/applications/withdraw/${id}`, { withCredentials: true })
            toast.success(res.data.message)

        }
        catch (e) {
            console.log(e)
            toast.error('Failed to withdraw application')
        }
    }
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Application Details</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <h3 className="modal-opp-title">{opp.title}</h3>
                    <p><strong>Status:</strong> <StatusBadge status={application.status} /></p>
                    <p><strong>Applied On:</strong> {new Date(application.appliedOn).toLocaleDateString()}</p>
                    <hr />
                    <h4>Opportunity Details</h4>
                    <p><strong>NGO:</strong> {ngo.organizationName || ngo.fullName}</p>
                    <p><strong>Location:</strong> {opp.location}</p>
                    <p><strong>Duration:</strong> {opp.duration}</p>
                    <p><strong>Expires:</strong> {formatDateDMY(opp.expiryDate)}</p>
                    <p><strong>Description:</strong> {opp.description}</p>
                    <p><strong>Required Skills:</strong> {opp.requiredSkills.join(", ")}</p>
                    <div className="dialog-footer "><button className="btn-withdraw btn-view-details" onClick={() => withdrawApplication(application._id)}>Withdraw Application</button></div>
                </div>
            </div>
        </div>
    );
};

//  Modal Component for Contact NGO
const ContactNGOModal = ({ ngo, onClose }) => { 
    if (!ngo) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Contact {ngo.organizationName || ngo.fullName}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>Thank you for getting accepted! Please reach out to the NGO using the details below to coordinate your volunteering start date.</p>

                    <h4>Contact Information:</h4>
                    <p><strong>Organization Name:</strong> {ngo.organizationName || ngo.fullName}</p>
                    <p><strong>Email:</strong> <a href={`mailto:${ngo.email}`}>{ngo.email}</a></p>
                    {ngo.location && <p><strong>Location:</strong> {ngo.location}</p>}
                </div>
                <div className="modal-footer">
                    <a href={`mailto:${ngo.email}`} className="btn-chat">Send Email</a>
                </div>
            </div>
        </div>
    );
};

const VolunteerDash = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [ngoToContact, setNgoToContact] = useState(null);
    const [matchedOpportunities, setMatchedOpportunities] = useState([]);
    const [showMatches, setShowMatches] = useState(false);

    // Fetch Matched Opportunities based on Volunteer Profile
    const fetchMatchedOpportunities = useCallback(async () => {
        if (!user || user.role.toLowerCase() !== "volunteer") return;

        try {
            
            const userSkills = user.skills?.join(',') || '';
            const userLocation = user.location || '';
            
            // Build query params based on volunteer's profile
            const queryParams = new URLSearchParams();
            if (userSkills) queryParams.append('skills', userSkills);
            if (userLocation) queryParams.append('location', userLocation);

            const queryString = queryParams.toString();
            const url = `${baseUrl}/opportunities${queryString ? '?' + queryString : ''}`;

            const res = await axios.get(url, { withCredentials: true });
            
            // Filter out opportunities the volunteer has already applied to
            const appliedOppIds = new Set(applications.map(app => app.opportunityId._id));
            const newMatches = res.data.filter(opp => !appliedOppIds.has(opp._id));
            
            setMatchedOpportunities(newMatches);

        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) return; // Ignore during logout
            console.error("Error fetching matched opportunities:", err);
        
        }
    }, [user, applications]); 

    const fetchApplications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${baseUrl}/applications/my`, {
                withCredentials: true,
            });
            setApplications(res.data);
            
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) return; // Ignore during logout
            console.error("Error fetching applications:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                toast.error("Session expired or unauthorized. Please log in as a Volunteer.");
                logout();
                navigate("/login");
            } else {
                setError("Failed to fetch applications.");
            }
        } finally {
            setLoading(false);
        }
    }, [logout, navigate, user]);

    useEffect(() => {
        if (!authLoading && (!user || user.role.toLowerCase() !== "volunteer")) {
            navigate("/login");
            return;
        }

        if (user && user.role.toLowerCase() === "volunteer") {
            // Fetch applications first
            fetchApplications();
        }
    }, [user, authLoading, navigate, fetchApplications, logout]);
    
    useEffect(() => {
        if (user && applications.length >= 0) {
            fetchMatchedOpportunities();
        }
    }, [user, applications, fetchMatchedOpportunities]);
    
    useEffect(() => {
        if (!user || user.role.toLowerCase() !== "volunteer") return;
        
        if (!socket.connected) {
            socket.connect();
        }

        const volunteerId = user._id; 
        if (volunteerId) {
            socket.emit('registerVolunteer', volunteerId);
        }

        const handleNewMatch = (data) => {
            toast.success(
                `🎉 Match Found! New Opportunity: ${data.title} by ${data.ngoName}. Check the Opportunities page or Matches tab!`,
                { duration: 6000 }
            );
        
        };
        
        const handleDashboardUpdate = () => {
            fetchApplications(); 
            fetchMatchedOpportunities(); 
        }

        socket.on('newOpportunityMatch', handleNewMatch);
        socket.on('updateVolunteerDashboard', handleDashboardUpdate); 

        return () => {
            socket.off('newOpportunityMatch', handleNewMatch);
            socket.off('updateVolunteerDashboard', handleDashboardUpdate);
        };
    }, [user, fetchApplications, fetchMatchedOpportunities]); 

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
    };

    const handleContactNgo = (application) => {
        if (application.opportunityId?.ngoId) {
            setNgoToContact(application.opportunityId.ngoId);
        } else {
            toast.error("Contact details not found.");
        }
    }
    const handleChatNgo = (application) => {
        if (application.opportunityId?.ngoId){
            navigate(`/chat/${application.opportunityId?.ngoId._id}`)
        } else {
            toast.error("Chat details not found.")
        }
    }
    
    // Handle "Apply Now" action for matched opportunities
    const handleApplyNow = async (opportunityId) => {
        const loadingToast = toast.loading("Submitting your application...");

        try {
            await axios.post(
                `${baseUrl}/applications`,
                { opportunityId },
                { withCredentials: true }
            );
            toast.dismiss(loadingToast);
            toast.success("Application submitted successfully! It is now pending review.");
            
            // Re-fetch to update the lists
            fetchApplications();
        } catch (err) {
            toast.dismiss(loadingToast);
            if (err.response) {
                toast.error(err.response.data.message || "Something went wrong");
            } else {
                toast.error("Network error, please try again");
            }
            console.error(err);
        }
    };


    if (authLoading || loading) {
        return (
            <div className="volunteer-dashboard-container">
                <div className="dash-content-wrapper">
                    <p>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="volunteer-dashboard-container">
            <div className="dash-content-wrapper">
                <h1 className="dash-header">Welcome, {user?.fullName || "Volunteer"}!</h1>
                
                {/* ⭐ NEW Tabbed Navigation */}
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-btn ${!showMatches ? 'active' : ''}`}
                        onClick={() => setShowMatches(false)}
                    >
                        My Applications
                    </button>
                    <button 
                        className={`tab-btn ${showMatches ? 'active' : ''}`}
                        onClick={() => setShowMatches(true)}
                    >
                        Matching Opportunities {matchedOpportunities.length > 0 && `(${matchedOpportunities.length})`}
                    </button>
                </div>
                {/* --- END Tabs --- */}


                {!showMatches ? (
                    <>
                        <p className="subtitle">Your Submitted Applications Status</p>
                        {error && <p className="error-message">{error}</p>}
                        <div className="applications-grid">
                            {applications.length > 0 ? (
                                applications.map((app) => {
                                    const ngoName = app.opportunityId?.ngoId?.organizationName || app.opportunityId?.ngoId?.fullName || "N/A";

                                    return (
                                        <div key={app._id} className="application-card">
                                            <div className="card-header">
                                                <h3 className="opp-title">{app.opportunityId?.title || "Opportunity Not Found"}</h3>
                                                <StatusBadge status={app.status} />
                                            </div>

                                            <p className="ngo-name">
                                                NGO: {ngoName}
                                            </p>

                                            <p className="submission-date">
                                                Applied on: {new Date(app.appliedOn).toLocaleDateString()}
                                            </p>

                                            <div className="card-footer">
                                                {app.status.toLowerCase() === 'accepted' && (
                                                    <button
                                                        className="btn-chat"
                                                        onClick={() => handleChatNgo(app)}
                                                    >
                                                        Chat with NGO
                                                    </button>
                                                )}
                                                {app.status.toLowerCase() === 'accepted' && (
                                                    <button
                                                        className="btn-chat"
                                                        onClick={() => handleContactNgo(app)}
                                                    >
                                                        Send an Email
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-view-details"
                                                    onClick={() => handleViewDetails(app)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-applications">
                                    You haven't submitted any applications yet. Find opportunities!
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    // Matching Opportunities Tab
                    <>
                        <p className="subtitle">Opportunities that match your profile (Skills or Location)</p>
                        <div className="applications-grid">
                            {matchedOpportunities.length > 0 ? (
                                matchedOpportunities.map((opp) => {
                                    const ngoName = opp.ngoId?.organizationName || opp.ngoId?.fullName || "N/A";
                                    return (
                                        <div key={opp._id} className="match-card">
                                            <div className="card-header">
                                                <h3 className="opp-title">{opp.title}</h3>
                                            </div>

                                            <p className="ngo-name">NGO: {ngoName}</p>
                                            <p className="match-detail">Location: {opp.location}</p>
                                            <p className="match-detail">Skills: {opp.requiredSkills.join(', ')}</p>

                                            <div className="card-footer">
                                                <button
                                                    className="btn-chat"
                                                    onClick={() => navigate('/opportunities')}
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    className="btn-view-details"
                                                    onClick={() => handleApplyNow(opp._id)}
                                                >
                                                    Apply Now
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-applications">
                                    No new matched opportunities found based on your profile.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
            {/* Render Modals */}
            <ApplicationDetailsModal
                application={selectedApplication}
                onClose={() => setSelectedApplication(null)}
            />
            <ContactNGOModal
                ngo={ngoToContact}
                onClose={() => setNgoToContact(null)}
            />
        </div>
    );
};

export default VolunteerDash;