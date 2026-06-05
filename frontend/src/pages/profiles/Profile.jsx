// src/pages/profiles/Profile.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { baseUrl } from "../data/api";
import "./Profile.css";
import toast from "react-hot-toast";

// ⭐ FIX: Move helper components OUTSIDE to prevent re-creation and losing focus.

const InputField = ({
  label,
  name,
  type = "text",
  readOnly = false,
  isEditing,
  profileData,
  handleChange,
  isTextArea = false,
}) => (
  <div className="form-group-profile">
    <label htmlFor={name}>{label}</label>
    {isTextArea ? (
      <textarea
        id={name}
        name={name}
        rows={4}
        value={profileData[name] || ""}
        onChange={handleChange}
        readOnly={!isEditing || readOnly}
      />
    ) : (
      <input
        type={type}
        id={name}
        name={name}
        value={profileData[name] || ""}
        onChange={handleChange}
        readOnly={!isEditing || readOnly}
      />
    )}
  </div>
);

const PasswordInputField = ({
  label,
  name,
  type = "password",
  passwordData,
  handlePasswordChange,
}) => (
  <div className="form-group-profile">
    <label htmlFor={name}>{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={passwordData[name]}
      onChange={handlePasswordChange}
      required
    />
  </div>
);

// Initial state for password form
const initialPasswordState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("details");
  const [profileData, setProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [passwordData, setPasswordData] = useState(initialPasswordState);
  const [applications, setApplications] = useState([]);

  const userRole = user?.role || "";
  const isNGO = userRole === "NGO";

  // Fetch Full Profile
  const fetchFullProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${baseUrl}/users/profile`, {
        withCredentials: true,
      });
      // ⭐ Profile data includes all necessary fields (location, bio, websiteUrl, etc.)
      setProfileData(res.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403)
        return; // Ignore during logout
      console.error("Error fetching profile:", error);
    }
  }, [user]);

  // Fetch Apps/Opportunities Data (Simplified to one fetch call)
  const fetchAppsData = useCallback(async () => {
    if (!user) return;
    try {
      // Uses the /applications/my endpoint which works for both Volunteer and NGO
      const res = await axios.get(`${baseUrl}/applications/my`, {
        withCredentials: true,
      });
      setApplications(res.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403)
        return; // Ignore during logout
      console.error("Error fetching applications:", error);
      setApplications([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFullProfile();
    fetchAppsData();
  }, [user, fetchFullProfile, fetchAppsData, navigate]);

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => {
      if (prev) fetchFullProfile(); // Revert changes if cancelling edit
      return !prev;
    });
  }, [fetchFullProfile]);

  if (!user) return null;

  // ⭐ Handlers for Profile and Password Data
  const handleChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ⭐ File Handler: Captures the file for submission
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicFile(file); // Store file object

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({ ...prev, profilePicUrl: e.target.result })); // Update preview
      };
      reader.readAsDataURL(file);
    }
  };

  // ⭐ Profile Save Handler (Multipart/FormData for image upload)
  const handleSave = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // 1. Append text/non-file data
    const allowedFields = [
      "location",
      "bio",
      "skills",
      "websiteUrl",
      "organizationDescription",
    ];

    allowedFields.forEach((key) => {
      if (profileData[key] !== undefined) {
        if (key === "skills" && typeof profileData[key] === "string") {
          formData.append(
            key,
            profileData[key]
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0),
          );
        } else {
          formData.append(key, profileData[key]);
        }
      }
    });

    // 2. Append the actual file if selected
    if (profilePicFile) {
      formData.append("profilePic", profilePicFile); // Must match Multer field name
    }

    try {
      const res = await axios.put(
        `${baseUrl}/users/profile`,
        formData, // Send FormData object
        { withCredentials: true },
      );

      toast.success("Profile updated successfully!");
      setUser(res.data.user);
      setProfileData(res.data.user);
      setIsEditing(false);
      setProfilePicFile(null); // Clear file state
    } catch (err) {
      console.error(
        "Error updating profile:",
        err.response?.data?.message || err,
      );
      toast.error(
        "Failed to update profile. " +
          (err.response?.data?.message || "Server error."),
      );
    }
  };

  // ⭐ Password Save Handler
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirm password do not match.");
    }
    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters long.");
    }

    try {
      const res = await axios.put(
        `${baseUrl}/users/password`, // New route
        { currentPassword, newPassword },
        { withCredentials: true },
      );

      toast.success(
        res.data.message ||
          "Password updated successfully. Please log in again.",
      );
      setPasswordData(initialPasswordState);

      // Force logout after password change for security
      logout();
      navigate("/login");
    } catch (err) {
      console.error(
        "Password update error:",
        err.response?.data?.message || err,
      );
      toast.error(
        err.response?.data?.message ||
          "Failed to update password. Check your current password.",
      );
    }
  };

  const renderDetailsView = () => (
    <div className="profile-card">
      <div className="card-header-actions">
        <h3>Basic Details</h3>
        <button type="button" onClick={toggleEdit} className="btn-edit-toggle">
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="profile-pic-upload-area">
          <img
            src={
              profileData.profilePicUrl ||
              "https://via.placeholder.com/120?text=Profile"
            }
            alt={`${profileData.fullName || "User"} profile`}
            className="profile-pic-preview"
          />
          {isEditing && (
            <div className="pic-edit-controls">
              <label htmlFor="profile-pic-input" className="btn-upload-label">
                Upload Photo
              </label>
              <input
                type="file"
                id="profile-pic-input"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>

        <div className="profile-form-grid">
          {/* Basic Fields (Always Read-Only) */}
          <InputField
            label="Name"
            name="fullName"
            readOnly={true}
            isEditing={isEditing}
            profileData={profileData}
            handleChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            readOnly={true}
            isEditing={isEditing}
            profileData={profileData}
            handleChange={handleChange}
          />

          {/* Location is common */}
          <InputField
            label="Location"
            name="location"
            isEditing={isEditing}
            profileData={profileData}
            handleChange={handleChange}
          />

          {isNGO ? (
            <>
              <InputField
                label="Website URL"
                name="websiteUrl"
                isEditing={isEditing}
                profileData={profileData}
                handleChange={handleChange}
              />
              <InputField
                label="Description"
                name="organizationDescription"
                isTextArea={true}
                isEditing={isEditing}
                profileData={profileData}
                handleChange={handleChange}
              />
            </>
          ) : (
            <>
              {/* NOTE: Skills field will need to be converted to array on save in handleSave */}
              <InputField
                label="Skills (comma separated)"
                name="skills"
                isEditing={isEditing}
                profileData={
                  // Convert array to comma-separated string for editing
                  isEditing && Array.isArray(profileData.skills)
                    ? { ...profileData, skills: profileData.skills.join(", ") }
                    : profileData
                }
                handleChange={handleChange}
              />
              <InputField
                label="Short Bio"
                name="bio"
                isTextArea={true}
                isEditing={isEditing}
                profileData={profileData}
                handleChange={handleChange}
              />
            </>
          )}
        </div>

        {isEditing && (
          <div className="save-button-area">
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );

  const renderPasswordView = () => (
    <div className="profile-card password-card">
      <h3>Change Password</h3>
      <p>For security, please enter your current password to set a new one.</p>
      <form onSubmit={handlePasswordSave}>
        <PasswordInputField
          label="Current Password"
          name="currentPassword"
          passwordData={passwordData}
          handlePasswordChange={handlePasswordChange}
        />
        <PasswordInputField
          label="New Password (min 8 chars)"
          name="newPassword"
          passwordData={passwordData}
          handlePasswordChange={handlePasswordChange}
        />
        <PasswordInputField
          label="Confirm New Password"
          name="confirmPassword"
          passwordData={passwordData}
          handlePasswordChange={handlePasswordChange}
        />
        <div className="save-button-area">
          <button type="submit" className="btn-save">
            Update Password
          </button>
        </div>
      </form>
    </div>
  );

  // ⭐ UPDATED LOGIC: Apps view uses the data fetched from /applications/my
  const renderAppsView = () => {
    if (userRole === "NGO") {
      // Filter out unique opportunity IDs that belong to the NGO
      const myOpportunities = applications
        .filter((app) => app.opportunityId?.ngoId?.toString() === user.id)
        .map((app) => app.opportunityId.title);
      const uniqueOpportunities = Array.from(new Set(myOpportunities)).length;
      const totalApplicants = applications.length;
      const pendingApplicants = applications.filter(
        (app) => app.status === "pending",
      ).length;

      return (
        <div className="profile-card applications-card">
          <h3>My Posted Opportunities Summary</h3>
          <div className="application-list-placeholder">
            <p>
              Total Opportunities: <strong>{uniqueOpportunities}</strong>
            </p>
            <p>
              Total Applications Received: <strong>{totalApplicants}</strong>
            </p>
            <p>
              Applications Pending Review: <strong>{pendingApplicants}</strong>
            </p>
            <br />
            <Link to="/dashboard/ngo" className="btn-edit-toggle">
              Go to Dashboard to Manage Posts
            </Link>
          </div>
        </div>
      );
    } else {
      const totalApps = applications.length;
      const acceptedApps = applications.filter(
        (app) => app.status === "accepted",
      ).length;
      const pendingApps = applications.filter(
        (app) => app.status === "pending",
      ).length;
      const rejectedApps = applications.filter(
        (app) => app.status === "rejected",
      ).length;

      return (
        <div className="profile-card applications-card">
          <h3>My Applications Summary</h3>
          <div className="application-list-placeholder">
            <p>
              Total Applications Submitted: <strong>{totalApps}</strong>
            </p>
            <p>
              Status Accepted: <strong>{acceptedApps}</strong>
            </p>
            <p>
              Status Pending: <strong>{pendingApps}</strong>
            </p>
            <p>
              Status Rejected: <strong>{rejectedApps}</strong>
            </p>
            <br />
            <Link to="/dashboard/volunteer" className="btn-edit-toggle">
              Go to Dashboard to View Details
            </Link>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="profile-page-container">
      <main className="profile-content-wrapper">
        <header className="profile-header">
          <h1>{profileData.fullName || "Your"} Profile</h1>
          <p className="subtitle">Role: {userRole.toUpperCase()}</p>
        </header>

        <div className="profile-tab-navigation">
          <button
            className={`tab-btn ${view === "details" ? "active" : ""}`}
            onClick={() => setView("details")}
          >
            Profile Details
          </button>
          <button
            className={`tab-btn ${view === "password" ? "active" : ""}`}
            onClick={() => setView("password")}
          >
            Security {/* <-- Corrected: Added content here */}
          </button>
          <button
            className={`tab-btn ${view === "apps" ? "active" : ""}`}
            onClick={() => setView("apps")}
          >
            {isNGO ? "Applications" : "Submissions"}
          </button>
        </div>

        <div className="profile-view-area">
          {view === "details" && renderDetailsView()}
          {view === "password" && renderPasswordView()}
          {view === "apps" && renderAppsView()}
        </div>
      </main>
    </div>
  );
};

export default Profile;
