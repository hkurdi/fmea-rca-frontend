import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-teal/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-gradient shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M15 7h3a5 5 0 010 10h-3m-6 0H6A5 5 0 016 7h3" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Forgot password</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send a reset link.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          className="glass-card p-5 sm:p-8"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-4 text-sm text-emerald-400 flex items-start gap-3"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>If that email exists, a reset link has been sent. Check your inbox.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@usf.edu"
                    required
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : 'Send reset link'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/login" className="font-semibold text-teal hover:text-teal-bright transition-colors">
              ← Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
