import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import { baseUrl } from "../data/api";
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [accountType, setAccountType] = useState('VOLUNTEER');

  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerEmail, setVolunteerEmail] = useState("");
  const [volunteerPassword, setVolunteerPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [ngoName, setNgoName] = useState("");
  const [ngoEmail, setNgoEmail] = useState("");
  const [ngoPassword, setNgoPassword] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth()
  if (user) navigate('/');
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload =
      accountType === "VOLUNTEER"
        ? {
          fullName: volunteerName,
          email: volunteerEmail,
          password: volunteerPassword,
          role: "VOLUNTEER",
        }
        : {
          fullName: ngoName,
          email: ngoEmail,
          password: ngoPassword,
          role: "NGO",
        };

    try {
      const res = await axios.post(`${baseUrl}/auth/register`, payload, {
        withCredentials: true,
      });

      toast.success(res.data?.message)


      if (res.data?.user?.role === "VOLUNTEER") {
        navigate("/personalize/volunteer");
      } else {
        navigate("/personalize/ngo");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Join SkillBridge</h1>
        <p className="subtitle">Create your account and start making an impact</p>

        <div className="account-type-selector">
          <button
            type="button"
            className={`selector-btn ${accountType === 'VOLUNTEER' ? 'active' : ''}`}
            onClick={() => setAccountType('VOLUNTEER')}
          >
            <span className="icon">👤</span> Volunteer
          </button>
          <button
            type="button"
            className={`selector-btn ${accountType === 'ngo' ? 'active' : ''}`}
            onClick={() => setAccountType('ngo')}
          >
            <span className="icon">🏢</span> NGO
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {accountType === 'VOLUNTEER' ? (
            <>
              <div className="form-group">
                <label htmlFor="volunteerName">Full Name</label>
                <input
                  type="text"
                  id="volunteerName"
                  placeholder="Full Name"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="volunteerEmail">Email</label>
                <input
                  type="email"
                  id="volunteerEmail"
                  placeholder="your@example.com"
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="volunteerPassword">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="volunteerPassword"
                    placeholder="********"
                    value={volunteerPassword}
                    onChange={(e) => setVolunteerPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <i 
                    className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  ></i>
                </div>
              </div>
              {/* <div className="form-group">
                <label htmlFor="volunteerSkills">Skills (comma separated)</label>
                <input
                  type="text"
                  id="volunteerSkills"
                  placeholder="Web Development, Design, Marketing"
                  value={volunteerSkills}
                  onChange={(e) => setVolunteerSkills(e.target.value)}
                /> */}
              {/* </div>
              <div className="form-group">
                <label htmlFor="volunteerLocation">Location</label>
                <input
                  type="text"
                  id="volunteerLocation"
                  placeholder="NEW DELHI, INDIA"
                  value={volunteerLocation}
                  onChange={(e) => setVolunteerLocation(e.target.value)}
                /> */}
              {/* </div> */}
              <button type="submit" className="auth-button">
                Create Volunteer Account
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="ngoName">Organization Name</label>
                <input
                  type="text"
                  id="ngoName"
                  placeholder="Your NGO Name"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngoEmail">Organization Email</label>
                <input
                  type="email"
                  id="ngoEmail"
                  placeholder="contact@ngo.org"
                  value={ngoEmail}
                  onChange={(e) => setNgoEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngoPassword">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="ngoPassword"
                    placeholder="********"
                    value={ngoPassword}
                    onChange={(e) => setNgoPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <i 
                    className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  ></i>
                </div>
              </div>
              {/* <div className="form-group">
                <label htmlFor="ngoWebsite">Website (optional)</label>
                <input
                  type="url"
                  id="ngoWebsite"
                  placeholder="https://yourngo.org"
                  value={ngoWebsite}
                  onChange={(e) => setNgoWebsite(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngoLocation">Location</label>
                <input
                  type="text"
                  id="ngoLocation"
                  placeholder="San Francisco, USA"
                  value={ngoLocation}
                  onChange={(e) => setNgoLocation(e.target.value)}
                />
              </div> */}
              <button type="submit" className="auth-button">
                Create NGO Account
              </button>
            </>
          )}
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register