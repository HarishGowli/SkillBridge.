// NgoDash.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { baseUrl } from "../data/api";
import "./NgoDash.css";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/Confirm";

const initialFormState = {
    title: "",
    description: "",
    skills: "",
    location: "",
    duration: "",
    expiryDate: "",
};

const formatDateDMY = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const isOpportunityActive = (opp) => {
    if (opp.status === "close") return false;

    if (opp.expiryDate) {
        const expiry = new Date(opp.expiryDate);
        const today = new Date();

        expiry.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return expiry >= today;
    }

    return true;
};

const StatusBadgeDash = ({ isActive }) => (
    <span className={`status-badge-dash ${isActive ? "active" : "inactive"}`}>
        {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
);

const NGODash = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState("dashboard");
    const [opportunities, setOpportunities] = useState([]);
    const [pendingApplications, setPendingApplications] = useState([]);
    const [allApplications, setAllApplications] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [currentOpportunity, setCurrentOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);


    const fetchOpportunities = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${baseUrl}/opportunities/my`, { withCredentials: true });
            setOpportunities(res.data);
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        }
    }, []);

    const fetchApplicationsForReview = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${baseUrl}/applications/pending`, { withCredentials: true });
            setPendingApplications(res.data);
        } catch (error) {
            console.error("Error fetching pending applications:", error);
            toast.error("Failed to fetch pending applications.");
        }
    }, []);

    const fetchMyApplications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${baseUrl}/applications/my`, { withCredentials: true });
            const accepted = res.data.filter(app => app.status === "accepted");
            setAllApplications(accepted);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) return; // Ignore during logout
            console.error("Error fetching applications:", error);
            toast.error("Failed to fetch accepted applications.");
        }
    }, []);

    // MASTER FETCHER — refreshes everything at once
    const refreshAll = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchOpportunities(),
                fetchApplicationsForReview(),
                fetchMyApplications()
            ]);
        } finally {
            setLoading(false);
        }
    }, [fetchOpportunities, fetchApplicationsForReview, fetchMyApplications]);

    useEffect(() => {
        if (!user || user.role.toLowerCase() !== "ngo") {
            navigate("/login");
            return;
        }
        refreshAll();
    }, [user, navigate, refreshAll]);

    useEffect(() => {
        if (user) {
            refreshAll();
        }
    }, [view, refreshAll, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                requiredSkills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
                location: formData.location,
                duration: formData.duration,
                expiryDate: formData.expiryDate || null,
            };

            if (currentOpportunity) {
                await axios.put(`${baseUrl}/opportunities/${currentOpportunity._id}`, payload, { withCredentials: true });
                toast.success("Opportunity updated!");
            } else {
                await axios.post(`${baseUrl}/opportunities`, payload, { withCredentials: true });
                toast.success("Opportunity created!");
            }

            setFormData(initialFormState);
            setCurrentOpportunity(null);
            setView("dashboard");
            await refreshAll();
        } catch (error) {
            console.error("Error saving opportunity:", error);
            toast.error("Error saving opportunity.");
        }
    };

    const [confirmData, setConfirmData] = useState({
        open: false,
        message: "",
        onConfirm: null
    });

    const askDelete = (id) => {
        setConfirmData({
            open: true,
            message: "Are you sure you want to delete this opportunity?",
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id) => {
        const loader = toast.loading("Deleting...");

        try {
            await axios.delete(`${baseUrl}/opportunities/${id}`, { withCredentials: true });
            toast.success("Deleted");
            await refreshAll();
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            toast.dismiss(loader);
            setConfirmData({ open: false });
        }
    };

    const handleEdit = (opp) => {
        setCurrentOpportunity(opp);
        setFormData({
            title: opp.title,
            description: opp.description,
            skills: opp.requiredSkills.join(", "),
            location: opp.location,
            duration: opp.duration,
            expiryDate: opp.expiryDate ? new Date(opp.expiryDate).toISOString().split("T")[0] : "",
        });
        setView("form");
    };

    const handleChat = (volunteerId) => {
        if (volunteerId) {
            navigate(`/chat/${volunteerId}`);
        }
    };

    const askReview = (applicationId, status) => {
        setConfirmData({
            open: true,
            message: `Are you sure you want to ${status} this application?`,
            onConfirm: () => handleReviewApplication(applicationId, status)
        });
    };

    const handleReviewApplication = async (applicationId, status) => {
        const loader = toast.loading(`${status}...`);

        try {
            await axios.put(
                `${baseUrl}/applications/${applicationId}`,
                { status },
                { withCredentials: true }
            );
            toast.success(`Application ${status}`);
            await refreshAll();
        } catch (error) {
            toast.error("Failed to update");
        } finally {
            toast.dismiss(loader);
            setConfirmData({ open: false });
        }
    };


    // ---------------------- VIEWS BELOW ----------------------

    const renderApplicationManagement = () => (
        <>
            <h1>Applications for Review</h1>
            <p className="subtitle">({pendingApplications.length} pending)</p>

            {pendingApplications.length === 0 ? (
                <div className="empty-state"><p>No pending applications.</p></div>
            ) : (
                <div className="applications-review-grid">
                    {pendingApplications.map((app) => {
                        const volunteer = app.volunteerId;
                        const opportunity = app.opportunityId;

                        return (
                            <div key={app._id} className="review-card">
                                <h3>{volunteer.fullName}</h3>
                                <p>Applied for: <strong>{opportunity.title}</strong></p>

                                <div className="volunteer-details">
                                    <p><strong>Email:</strong> {volunteer.email}</p>
                                    <p><strong>Location:</strong> {volunteer.location || 'N/A'}</p>
                                    <p><strong>Skills:</strong> {volunteer.skills?.join(', ') || 'None'}</p>
                                    <p><strong>Bio:</strong> {volunteer.bio || 'No bio provided.'}</p>
                                </div>

                                <div className="review-actions">
                                    <button className="btn-accept"
                                        onClick={() => askReview(app._id, 'accepted')}>
                                        Accept
                                    </button>
                                    <button className="btn-reject"
                                        onClick={() => askReview(app._id, 'rejected')}>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <button className="btn-secondary-dash back-btn" onClick={() => setView('dashboard')}>
                ← Back
            </button>
        </>
    );

    const renderAllApplications = () => (
        <>
            <h1>Accepted Applications</h1>
            {/* <p className="subtitle">({allApplications.length})</p> */}

            {allApplications.length === 0 ? (
                <div className="empty-state"><p>No accepted volunteers.</p></div>
            ) : (
                <div className="applications-review-grid">
                    {allApplications.map((app) => {
                        const volunteer = app.volunteerId;
                        const opportunity = app.opportunityId;

                        return (
                            <div key={app._id} className="review-card">
                                <h3>{volunteer.fullName}</h3>
                                <p>Applied for: <strong>{opportunity.title}</strong></p>
                                {/* <a href={`/opportunities/${opportunity._id}`} target="_blank">this</a> */}

                                <div className="volunteer-details">
                                    {/* <p><strong>Email:</strong> {volunteer.email}</p> */}
                                    <p><strong>Location:</strong> {volunteer.location}</p>
                                    <p><strong>Skills:</strong> {volunteer.skills?.join(', ')}</p>
                                    <p><strong>Bio:</strong> {volunteer.bio || 'No bio.'}</p>
                                </div>

                                <button className="btn-primary-dash"
                                style={{marginTop: "20px", marginLeft: "-5px"}} onClick={() => handleChat(volunteer._id)}>
                                    Chat
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <button className="btn-secondary-dash back-btn" onClick={() => setView('dashboard')}>
                ← Back
            </button>
        </>
    );

    const renderDashboard = () => {
        const totalPosts = opportunities.length;
        const activePosts = opportunities.filter(isOpportunityActive).length;

        return (
            <>
                <h1>Welcome, {user?.organizationName || "NGO"}!</h1>

                <div className="dash-stats">
                    <div className="stat-card">
                        Total Posts: <span>{totalPosts}</span>
                    </div>
                    <div className="stat-card active-stat">
                        Active: <span>{activePosts}</span>
                    </div>
                </div>

                <div className="dash-actions">
                    <button className="btn-primary-dash" onClick={() => setView("form")}>
                        Add New Opportunity
                    </button>

                    <button className="btn-secondary-dash" onClick={() => setView("applications")}>
                        Review Applications ({pendingApplications.length})
                    </button>

                    <button className="btn-secondary-dash" onClick={() => setView("allApplications")}>
                        Accepted Applications ({allApplications.length})
                    </button>
                </div>

                <div className="dash-opp-grid">
                    {opportunities.map((opp) => {
                        const isActive = isOpportunityActive(opp);
                        return (
                            <div key={opp._id} className="dash-opportunity-card">
                                <div className="card-status-header">
                                    <h3>{opp.title}</h3>
                                    <StatusBadgeDash isActive={isActive} />
                                </div>

                                <p>{opp.description}</p>
                                <p className="posted-on"><strong>Posted:</strong> {formatDateDMY(opp.createdAt)}</p>
                                <p><strong>Location:</strong> {opp.location}</p>
                                <p><strong>Duration:</strong> {opp.duration}</p>
                                <p><strong>Skills:</strong> {opp.requiredSkills.join(", ")}</p>

                                <div className="card-actions">
                                    <button className="btn-secondary-dash" onClick={() => handleEdit(opp)}>
                                        Edit
                                    </button>
                                    <button className="btn-danger-dash" onClick={() => askDelete(opp._id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };

    if (loading) {
        return (
            <div className="ngo-dashboard-container">
                <div className="dashboard-content-wrapper">
                    Loading Dashboard...
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="ngo-dashboard-container">
            <div className="dashboard-content-wrapper">
                {view === "dashboard" && renderDashboard()}
                {view === "applications" && renderApplicationManagement()}
                {view === "allApplications" && renderAllApplications()}

                {view === "form" && (
                    <div className="form-card-dash">
                        <h2>{currentOpportunity ? "Edit Opportunity" : "Create New Opportunity"}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group-dash">
                                <label htmlFor="title">Title</label>
                                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required />
                            </div>

                            <div className="form-group-dash">
                                <label htmlFor="description">Description</label>
                                <textarea name="description" id="description" value={formData.description} onChange={handleChange} required />
                            </div>

                            <div className="form-group-dash">
                                <label htmlFor="skills">Skills (comma separated)</label>
                                <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} required />
                            </div>

                            <div className="form-group-dash">
                                <label htmlFor="location">Location</label>
                                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required />
                            </div>

                            <div className="form-group-dash">
                                <label htmlFor="duration">Duration</label>
                                <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} required />
                            </div>

                            <div className="form-group-dash">
                                <label htmlFor="expiryDate">Expiry Date</label>
                                <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
                            </div>

                            <div className="form-actions">
                                <button className="btn-primary-dash" type="submit">
                                    {currentOpportunity ? "Update Opportunity" : "Create Opportunity"}
                                </button>

                                <button
                                    className="btn-secondary-dash"
                                    type="button"
                                    onClick={() => {
                                        setView("dashboard");
                                        setFormData(initialFormState);
                                        setCurrentOpportunity(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            <ConfirmModal
                open={confirmData.open}
                message={confirmData.message}
                onConfirm={confirmData.onConfirm}
                onCancel={() => setConfirmData({ open: false })}
            />

        </div>
    );
};
export default NGODash;
