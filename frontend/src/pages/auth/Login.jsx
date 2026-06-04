import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth(); // Assuming login is a function that makes an API call

  if (user) navigate(`/dashboard/${user.role.toLowerCase()}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("BUTTON CLICKED");
    // CRITICAL FIX: Send the actual email and password to the server.
    const credentials = { email, password };

    try {
      console.log("About to call API");
      console.log(baseUrl);
      const result = await login(credentials); // Await the API call

      if (result.success) {
        // Get the role from the successful API response
        const userRole = result.user.role;
        toast.success(`Login successful`);
        setTimeout(() => {
          if (userRole === "NGO") {
            navigate("/dashboard/ngo");
          } else if (userRole === "VOLUNTEER") {
            navigate("/dashboard/volunteer");
          }
        }, 5000);
      } else {
        // Handle login failure (e.g., "Invalid credentials" from the server)
        toast.error(result.message);
      }
    } catch (error) {
      // This catches true network errors or unhandled exceptions from the context
      console.error("Login submission error:", error);
      toast.error("An unexpected error occurred during login.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Log in to your Skillbridge account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="your@email.com (e.g., test@ngo.org)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle-icon`}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              ></i>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Log In
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
