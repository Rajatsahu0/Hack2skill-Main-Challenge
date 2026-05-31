import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle, Compass } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await register(formData.name, formData.email, formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 px-4 transition-colors">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-800 animate-slide-up" role="region" aria-labelledby="register-heading">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-extrabold text-2xl mb-2" aria-label="Go to RoamAI homepage">
            <Compass className="w-7 h-7" aria-hidden="true" /> RoamAI
          </Link>
          <h2 id="register-heading" className="text-xl font-bold text-slate-800 dark:text-white">Create your account</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Start crafting intelligent travel itineraries.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Registration form" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="register-name" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 pl-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500" aria-hidden="true">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                id="register-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                autoComplete="name"
                aria-label="Full name"
                aria-required="true"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="register-email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 pl-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500" aria-hidden="true">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                id="register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                autoComplete="email"
                aria-label="Email address"
                aria-required="true"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="register-password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 pl-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500" aria-hidden="true">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                aria-label="Password, minimum 6 characters"
                aria-required="true"
                aria-describedby="password-hint"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
            <p id="password-hint" className="text-[10px] text-slate-400 mt-1 pl-1">Minimum 6 characters required</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            aria-label={loading ? 'Creating account, please wait' : 'Create your account'}
            aria-busy={loading}
            className="w-full py-3.5 mt-2 bg-violet-600 hover:bg-violet-750 disabled:bg-violet-800 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Redirect */}
        <nav className="text-center mt-6 text-xs text-slate-550 dark:text-slate-450" aria-label="Account navigation">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-600 hover:text-violet-750 dark:text-violet-400 dark:hover:text-violet-300 font-bold" aria-label="Sign in to existing account">
            Sign In
          </Link>
        </nav>

      </div>
    </div>
  );
}
