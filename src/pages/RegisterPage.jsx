import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', usf_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { email: form.email, password: form.password, full_name: form.full_name };
      if (form.usf_id.trim()) payload.usf_id = form.usf_id.trim();
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-gradient shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Create an account</h1>
          <p className="mt-1 text-sm text-slate-500">Join the FMEA &amp; RCA learning platform</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="glass-card p-5 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Jane Smith', required: true },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@usf.edu', required: true },
              { label: 'USF ID', key: 'usf_id', type: 'text', placeholder: 'U12345678', optional: true },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••', required: true },
            ].map((field, i) => (
              <motion.div key={field.key} variants={fadeUp} initial="hidden" animate="visible" custom={i + 2}>
                <label className="label">
                  {field.label}{' '}
                  {field.optional && <span className="text-slate-600 font-normal">(optional)</span>}
                </label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                  className="input"
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </motion.div>
            ))}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            <motion.button
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={7}
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal hover:text-teal-bright transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
