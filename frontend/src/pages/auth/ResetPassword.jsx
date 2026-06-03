import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { baseUrl } from '../data/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // verify token
    const verify = async () => {
      try {
        const res = await fetch(`${baseUrl}/auth/reset-password/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Invalid token');
        setValid(true);
      } catch (err) {
        toast.error(err.message || 'Invalid or expired token');
        setValid(false);
      }
    };
    if (token) verify();
  }, [token]);

  const validatePassword = (pwd) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return re.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) return toast.error('Password does not meet complexity requirements');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset');
      toast.success(data.message || 'Password reset successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (!valid) return <div className="auth-page"><h3>Invalid or expired token</h3></div>;

  return (
    <div className="auth-page">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>New Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <label>Confirm Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </div>
  );
};

export default ResetPassword;
