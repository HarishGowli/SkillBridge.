import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../data/api";
import '../Login.css'
import toast from "react-hot-toast";

export default function VolunteerPersonalization() {
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const navigate = useNavigate();

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${baseUrl}/users/personalize`,
                { skills: skills.split(","), location, bio },
                { withCredentials: true }
            );
            toast.success("Profile personalized successfully!");
            navigate("/dashboard/volunteer");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to personalize");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
            <form onSubmit={handleSave}>
                <h2>Personalize Your Volunteer Profile</h2>
                <div className="form-group">
                    <label>Skills</label>
                    <input
                        type="text"
                        placeholder="Full Stack, Frontend, Backend (comma separated)"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        placeholder="Bengaluru"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Bio</label>
                    <input
                        placeholder="Hi there..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>
                <button type="submit" className="auth-button">Save</button>
            </form>
        </div>
        </div>
    );
}
