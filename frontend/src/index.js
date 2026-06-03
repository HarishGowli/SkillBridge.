// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// REMOVE these imports as they are rendered inside App.jsx
// import Footer from './components/Footer';
// import Navbar from './components/Navbar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ONLY render App, which contains AuthProvider, BrowserRouter, Navbar, and Footer */}
    <App /> 
  </React.StrictMode>
);

reportWebVitals();