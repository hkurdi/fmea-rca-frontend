import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CaseCard from '../components/CaseCard';
import SectionTitle from '../components/SectionTitle';
import { casesApi } from '../api/cases';
import { useAuth } from '../context/AuthContext';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', mode: 'exercise' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  useEffect(() => {
    async function load() {
      try {
        const res = await casesApi.getAll();
        const fetchedCases = res?.data || [];
        setCases(fetchedCases);

        const map = {};
        await Promise.all(
          fetchedCases.map(async (c) => {
            const prog = await casesApi.getCaseProgress(c.id).catch(() => null);
            map[c.id] = prog?.data?.percent ?? 0;
          })
        );
        setProgressMap(map);
      } catch {
        setCases([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await casesApi.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        patient_info: {},
        mode: formData.mode,
        allow_resubmit: formData.mode === 'exercise',
      });
      if (res?.data) {
        setCases((prev) => [res.data, ...prev]);
        setProgressMap((prev) => ({ ...prev, [res.data.id]: 0 }));
      }
      setFormData({ title: '', description: '', mode: 'exercise' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create case.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Case assignments"
        subtitle="Open a case to view and track your progress per section."
        action={
          isInstructor && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Case
            </motion.button>
          )
        }
      />

      {/* Create form modal-style */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="glass-card overflow-hidden"
          >
            <div className="h-0.5 bg-teal-gradient" />
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">Create New Case</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-slate-500 hover:bg-white/[0.1] hover:text-slate-200 transition-all"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCase} className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="label">Case Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Medication Administration Error"
                    className="input"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brief case summary..."
                    className="input resize-none"
                  />
                </div>

                <div>
                  <label className="label">Mode</label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="exercise">Exercise</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>

                {error && (
                  <div className="md:col-span-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={creating} className="btn-primary">
                    {creating ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </span>
                    ) : 'Save Case'}
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cases list */}
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3].map((k) => (
            <div key={k} className="glass-card p-6 space-y-4 overflow-hidden">
              <div className="flex justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-full rounded-lg bg-white/[0.04] animate-pulse" />
                </div>
                <div className="h-6 w-16 rounded-full bg-white/[0.04] animate-pulse" />
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-slate-400">No cases assigned yet</p>
          <p className="mt-1 text-sm text-slate-600">Your instructor will assign cases to you.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid gap-4 lg:grid-cols-2"
        >
          {cases.map((c) => (
            <motion.div key={c.id} variants={cardItem}>
              <CaseCard item={c} progress={progressMap[c.id] ?? 0} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
