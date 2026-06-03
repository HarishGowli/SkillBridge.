import './Home.css'; 
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page-container">
      <main className="hero-section">
        <div className="hero-content">
          
          <p className="tagline">
            <span className="tagline-icon">⚡</span> Connecting Skills with Purpose
          </p>
          
          <h1 className="hero-title">
            Bridge Your <span className="skill-highlight">Skills</span> to Impact
          </h1>
          
          <p className="hero-description">
            Connect with NGOs and make a difference. Whether you're a volunteer looking to contribute your skills or an NGO seeking talented individuals, SkillBridge brings you together.
          </p>
          
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Get Started →
            </Link>
            <Link to="/opportunities" className="btn btn-secondary">
              Browse Opportunities
            </Link>
          </div>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Active NGOs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2,000+</span>
              <span className="stat-label">Volunteers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1,500+</span>
              <span className="stat-label">Opportunities</span>
            </div>
          </div>
        </div>

        <div className="hero-image-placeholder">
        
        </div>
      </main>


      <section className="info-section why-choose-section">
        <h2>Why Choose <span className="skill-highlight">SkillBridge</span>?</h2>
        <p className="section-subtitle">Everything you need to connect skills with meaningful opportunities</p>
        
        <div className="features-grid-new">
          
          <div className="feature-card-new">
            <span className="feature-icon-new">🧑‍🤝‍🧑</span>
            <h3>Connect with Purpose</h3>
            <p>Find NGOs aligned with your skills and passions, or discover talented volunteers ready to make an an impact.</p>
          </div>
          
          <div className="feature-card-new highlight-card">
            <span className="feature-icon-new">🎯</span>
            <h3>Skill-Based Matching</h3>
            <p>Our intelligent matching system connects volunteers with opportunities that fit their unique skill sets.</p>
          </div>
          
          <div className="feature-card-new">
            <span className="feature-icon-new">💬</span>
            <h3>Real-Time Communication</h3>
            <p>Built-in messaging system enables seamless collaboration between volunteers and NGOs.</p>
          </div>
          
          <div className="feature-card-new">
            <span className="feature-icon-new">🛡️</span>
            <h3>Verified Organizations</h3>
            <p>All NGOs are verified to ensure authenticity and create a safe volunteering environment.</p>
          </div>
          
          <div className="feature-card-new">
            <span className="feature-icon-new">⚡</span>
            <h3>Instant Applications</h3>
            <p>Apply to opportunities with one click and get instant notifications on your application status.</p>
          </div>
          
          <div className="feature-card-new">
            <span className="feature-icon-new">🌎</span>
            <h3>Global Impact</h3>
            <p>Join a worldwide community of changemakers creating positive impact across the globe.</p>
          </div>
          
        </div>
      </section>



      <section className="info-section how-it-works-section">
        <h2>How It <span className="skill-highlight">Works</span></h2>
        <p className="section-subtitle">Get started in four simple steps</p>

        <div className="steps-grid-cards">

          <div className="step-card-new">
            <span className="step-number-circle">1</span>
            <div className="step-content">
              <span className="step-icon step-icon-1">👤</span>
              <h3>Create Your Profile</h3>
              <p>Sign up as a volunteer or NGO and build your profile with skills, interests, and goals.</p>
            </div>
          </div>

          <div className="step-card-new">
            <span className="step-number-circle">2</span>
            <div className="step-content">
              <span className="step-icon step-icon-2">🔍</span>
              <h3>Discover Opportunities</h3>
              <p>Browse and filter opportunities by skills, location, duration, and cause area.</p>
            </div>
          </div>

          <div className="step-card-new">
            <span className="step-number-circle">3</span>
            <div className="step-content">
              <span className="step-icon step-icon-3">🤝</span>
              <h3>Connect & Match</h3>
              <p>Apply to opportunities or accept volunteer applications with our intelligent matching system.</p>
            </div>
          </div>

          <div className="step-card-new">
            <span className="step-number-circle">4</span>
            <div className="step-content">
              <span className="step-icon step-icon-4">🚀</span>
              <h3>Make an Impact</h3>
              <p>Collaborate, communicate, and create meaningful change together.</p>
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
};

export default Home;