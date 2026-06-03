import React, { useState } from 'react';
import './Contact.css';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact Form Submitted:', formData);

    toast.success('Thank you for your message! We will get back to you soon.');

    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page-container">

      <main className="contact-content-wrapper">

        <div className="contact-header">
          <h1>Get In <span className="highlight-text">Touch</span></h1>
          <p className="subtitle">We're here to answer your questions and help you connect with purpose.</p>
        </div>

        <div className="contact-main-grid">

          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit}>

              <div className="form-group-contact">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-contact">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-contact">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-contact">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-button">
                Send Message
              </button>
            </form>
          </div>

          <div className="contact-info-card">
            <h2>Contact Details</h2>
            <div className="info-item">
              <span className="info-icon">📧</span>
              <h4>Email Support</h4>
              <p>For general inquiries, email us at:</p>
              <a href="mailto:support@skillbridge.org">askus@infosys.com</a>
            </div>

            <div className="info-item">
              <span className="info-icon">📍</span>
              <h4>Our Office</h4>
              <p>Find us here (Headquarters):</p>
              <p>Plot No. 44, Hosur Rd, Konappana Agrahara, Electronic City, Bengaluru, Karnataka 560100.</p>
            </div>

            <div className="info-item">
              <span className="info-icon">📞</span>
              <h4>Phone</h4>
              <p>Call our support line:</p>
              <p>+91 970 460 1562</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;