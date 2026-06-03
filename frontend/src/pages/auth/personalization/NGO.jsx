import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../data/api"; // ✅ Fixed import path
import "../Login.css";
import toast from "react-hot-toast";

export default function NgoPersonalization() {
  const [organizationDescription, setOrgDesc] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${baseUrl}/users/personalize`,
        { organizationDescription, websiteUrl, location },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data) {
        toast.success("NGO profile personalized successfully!");
        navigate("/dashboard/ngo");
      }
    } catch (err) {
      console.error("Personalization error:", err);
      toast.error(err.response?.data?.message || "Failed to personalize. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={handleSave}>
          <h2>Personalize Your NGO Profile</h2>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="Organization Description"
              value={organizationDescription}
              onChange={(e) => setOrgDesc(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="text"
              placeholder="www.example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-button">Save</button>
        </form>
      </div>
    </div>
  );
}
