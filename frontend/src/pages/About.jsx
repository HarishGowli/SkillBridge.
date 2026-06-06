import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page-container">

      <main className="about-content-wrapper">


        <section className="about-hero">
          <div className="box"></div>
          <h1>Bridging <span className="highlight-text">Skills</span>, Building <span className="highlight-text">Impact</span>.</h1>
          <p className="subtitle">SkillBridge is a platform dedicated to connecting skilled volunteers with verified NGOs worldwide to foster meaningful, impactful collaboration.</p>
        </section>

        <section className="about-section mission-section">
          <div className="mission-text">
            <h2>Our <span className="skill-highlight">Mission</span></h2>
            <p>Our core mission is simple: to make global volunteering accessible, efficient, and impactful. We eliminate geographical barriers and administrative friction, ensuring that every minute a volunteer spends and every resource an NGO uses is maximized for positive change.</p>
            <Link to="/register" className="btn btn-primary-about">
              Join Our Mission →
            </Link>
          </div>
          <div className="mission-image-placeholder">
          </div>
        </section>

        <section className="about-section values-section">
          <h2>Our Core <span className="skill-highlight">Values</span></h2>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">🤝</span>
              <h3>Integrity & Trust</h3>
              <p>We verify every NGO and volunteer profile to ensure transparent and trustworthy partnerships.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">💡</span>
              <h3>Skill-Centric</h3>
              <p>We believe professional skills are the most powerful tool for sustainable social and technological growth.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">🌐</span>
              <h3>Global Accessibility</h3>
              <p>We strive to make impactful opportunities available to anyone, anywhere, regardless of their location.</p>
            </div>
          </div>
        </section>

        <section className="about-section team-section">
          <h2>Meet the <span className="skill-highlight">Team</span></h2>
          <p className="section-subtitle">We are a small but passionate group dedicated to technology for good.</p>
          
          <div className="team-grid">

            <a style={{ textDecoration: "none", color: "black" }} href="https://github.com/ShaikFayaz042" target='_blank' rel='noreferrer'>
              <div className="team-member-card">
                <div style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/174807539?v=4)", backgroundSize: "cover", backgroundRepeat: 'no-repeat' }} className="team-photo-placeholder"></div>
                <h4>Shaik Fayaz</h4>
                <p>UI/UX Designer</p>
              </div>
            </a>
            
            <a style={{ textDecoration: "none", color: "black" }} href="https://github.com/HarishGowli" target='_blank' rel='noreferrer'>
              <div className="team-member-card">
                <div style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/185912921?s=400&u=da5e4630ef833b01ddcbdec5825ad3dfb7e3f6a3&v=4)", backgroundSize: "cover", backgroundRepeat: 'no-repeat' }} className="team-photo-placeholder"></div>
                <h4>Harish Gowli</h4>
                <p>Full Stack Dev</p>
              </div>
            </a>

            <a style={{ textDecoration: "none", color: "black" }} href="https://github.com/vineet-k09" target='_blank' rel='noreferrer'>
              <div className="team-member-card">
                <div style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/96182916?v=4)", backgroundSize: "cover", backgroundRepeat: 'no-repeat' }} className="team-photo-placeholder"></div>
                <h4>Vineet kushwaha</h4>
                <p>Full Stack Dev</p>
              </div>
            </a>

            <a style={{ textDecoration: "none", color: "black" }} href="https://github.com/AbhiruchiKunte" target='_blank' rel='noreferrer'>

              <div className="team-member-card">
                <div style={{ backgroundImage: "url(https://avatars.githubusercontent.com/u/177229709?v=4)", backgroundSize: "cover", backgroundRepeat: 'no-repeat' }} className="team-photo-placeholder">
                </div>
                <h4>Abhiruchi Kunte</h4>
                <p>Backend Dev</p>
              </div>
            </a>

          </div>
        </section>

      </main>
    </div>
  );
};

export default About;