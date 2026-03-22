import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { casesApi } from '../api/cases';
import { teamsApi } from '../api/teams';
import { scoringApi } from '../api/scoring';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Tabs from '../components/Tabs';

const TABS = [
  { key: 'courses', label: 'Courses' },
  { key: 'teams', label: 'Teams' },
  { key: 'submissions', label: 'Submissions' },
];

const SUBMISSION_TYPE_LABELS = {
  process_map: 'Process Map',
  hazard_analysis: 'Hazard Analysis',
  fmea_pip: 'FMEA PIP',
  fishbone: 'Fishbone',
  five_whys: '5 Whys',
  rca_pip: 'RCA PIP',
};

function FormPanel({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="glass-card overflow-hidden"
    >
      <div className="h-0.5 bg-teal-gradient" />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-white">{title}</h3>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-slate-500 hover:bg-white/[0.1] hover:text-slate-200 transition-all">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [assigningCaseId, setAssigningCaseId] = useState('');
  const [assigningCourseId, setAssigningCourseId] = useState('');
  const [assignMsg, setAssignMsg] = useState('');

  useEffect(() => {
    Promise.all([casesApi.getAllCourses(), casesApi.getAll()])
      .then(([cRes, casesRes]) => {
        setCourses(cRes?.data || []);
        setCases(casesRes?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/courses/', {
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
      if (res?.data) {
        setCourses((prev) => [...prev, res.data]);
        setForm({ name: '', description: '' });
        setShowForm(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to create course.');
    } finally {
      setCreating(false);
    }
  };

  const handleAssign = async () => {
    if (!assigningCaseId || !assigningCourseId) return;
    setAssignMsg('');
    try {
      await api.post(`/cases/${assigningCaseId}/assign`, { course_id: Number(assigningCourseId) });
      setAssignMsg('Assigned successfully.');
      setAssigningCaseId('');
      setAssigningCourseId('');
    } catch (err) {
      setAssignMsg(err.message || 'Assignment failed.');
    }
    setTimeout(() => setAssignMsg(''), 3000);
  };

  if (loading) return <TabSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold text-white">Courses</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary self-start sm:self-auto text-xs py-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Course
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <FormPanel title="Create Course" onClose={() => setShowForm(false)}>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="label">Course name</label>
                <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Healthcare Innovation IV" required />
              </div>
              <div>
                <label className="label">Description <span className="text-slate-600 font-normal">(optional)</span></label>
                <input className="input" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Spring 2026 FMEA/RCA course" />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={creating} className="btn-primary text-xs py-2">{creating ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs py-2">Cancel</button>
              </div>
            </form>
          </FormPanel>
        )}
      </AnimatePresence>

      {courses.length === 0 ? (
        <EmptyState message="No courses created yet." />
      ) : (
        <div className="space-y-2">
          {courses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover flex items-center justify-between gap-3 px-4 sm:px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-200 truncate">{c.name}</p>
                {c.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{c.description}</p>}
              </div>
              <span className="shrink-0 text-xs text-slate-600 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1">ID: {c.id}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Assign case */}
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <h3 className="font-semibold text-slate-300 text-sm">Assign Case to Course</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Case</label>
            <select className="input" value={assigningCaseId} onChange={(e) => setAssigningCaseId(e.target.value)}>
              <option value="">Select case...</option>
              {cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Course</label>
            <select className="input" value={assigningCourseId} onChange={(e) => setAssigningCourseId(e.target.value)}>
              <option value="">Select course...</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAssign} disabled={!assigningCaseId || !assigningCourseId} className="btn-primary text-xs py-2 disabled:opacity-40">
            Assign
          </button>
          <AnimatePresence>
            {assignMsg && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-xs font-medium ${assignMsg.includes('fail') ? 'text-red-400' : 'text-teal'}`}
              >
                {assignMsg}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function TeamsTab() {
  const [teams, setTeams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', course_id: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [memberInputs, setMemberInputs] = useState({});
  const [memberMsgs, setMemberMsgs] = useState({});

  const refreshTeams = async () => {
    const res = await teamsApi.getAll();
    setTeams(res?.data || []);
  };

  useEffect(() => {
    Promise.all([teamsApi.getAll(), casesApi.getAllCourses(), api.get('/users/')])
      .then(([tRes, cRes, uRes]) => {
        setTeams(tRes?.data || []);
        setCourses(cRes?.data || []);
        const map = {};
        (uRes?.data || []).forEach((u) => { map[u.id] = u.full_name; });
        setUsersMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.course_id) return;
    setCreating(true);
    setError('');
    try {
      const res = await teamsApi.create({ name: form.name.trim(), course_id: Number(form.course_id) });
      if (res?.data) {
        setTeams((prev) => [...prev, res.data]);
        setForm({ name: '', course_id: '' });
        setShowForm(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (teamId) => {
    const userId = memberInputs[teamId]?.trim();
    if (!userId) return;
    try {
      await teamsApi.addMember(teamId, Number(userId));
      setMemberMsgs((p) => ({ ...p, [teamId]: 'Member added.' }));
      setMemberInputs((p) => ({ ...p, [teamId]: '' }));
      await refreshTeams();
    } catch (err) {
      setMemberMsgs((p) => ({ ...p, [teamId]: err.message || 'Failed.' }));
    }
    setTimeout(() => setMemberMsgs((p) => ({ ...p, [teamId]: '' })), 3000);
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await teamsApi.removeMember(teamId, userId);
      await refreshTeams();
    } catch (err) {
      setMemberMsgs((p) => ({ ...p, [teamId]: err.message || 'Failed to remove.' }));
      setTimeout(() => setMemberMsgs((p) => ({ ...p, [teamId]: '' })), 3000);
    }
  };

  if (loading) return <TabSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold text-white">Teams</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary self-start sm:self-auto text-xs py-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Team
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <FormPanel title="Create Team" onClose={() => setShowForm(false)}>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="label">Team name</label>
                <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Team Alpha" required />
              </div>
              <div>
                <label className="label">Course</label>
                <select className="input" value={form.course_id} onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))} required>
                  <option value="">Select course...</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={creating} className="btn-primary text-xs py-2">{creating ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs py-2">Cancel</button>
              </div>
            </form>
          </FormPanel>
        )}
      </AnimatePresence>

      {teams.length === 0 ? (
        <EmptyState message="No teams created yet." />
      ) : (
        <div className="space-y-3">
          {teams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-200">{team.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {courses.find((c) => c.id === team.course_id)?.name || `Course ID: ${team.course_id}`}
                  </p>
                </div>
                <span className="badge badge-slate">
                  {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {team.members?.length > 0 && (
                <div className="space-y-1.5">
                  {team.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5">
                      <span className="text-sm text-slate-400">{usersMap[m.user_id] || `User #${m.user_id}`}</span>
                      <button onClick={() => handleRemoveMember(team.id, m.user_id)} className="inline-flex items-center min-h-[44px] px-2 text-xs text-red-500 hover:text-red-400 transition-colors">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  className="input w-full sm:max-w-[9rem]"
                  placeholder="User ID"
                  value={memberInputs[team.id] || ''}
                  onChange={(e) => setMemberInputs((p) => ({ ...p, [team.id]: e.target.value }))}
                  type="number"
                />
                <button onClick={() => handleAddMember(team.id)} className="btn-secondary text-sm w-full sm:w-auto">
                  Add member
                </button>
                <AnimatePresence>
                  {memberMsgs[team.id] && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-xs font-medium ${memberMsgs[team.id].includes('fail') ? 'text-red-400' : 'text-teal'}`}
                    >
                      {memberMsgs[team.id]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SubmissionsTab() {
  const [scores, setScores] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ instructor_score: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    Promise.all([scoringApi.getAllScores(), api.get('/users/')])
      .then(([sRes, uRes]) => {
        setScores(sRes?.data || []);
        const map = {};
        (uRes?.data || []).forEach((u) => { map[u.id] = u.full_name; });
        setUsersMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (scoreId) => {
    if (!reviewForm.instructor_score) return;
    setSubmitting(true);
    try {
      await scoringApi.reviewScore(scoreId, {
        instructor_score: Number(reviewForm.instructor_score),
        feedback: reviewForm.feedback,
      });
      setScores((prev) =>
        prev.map((s) =>
          s.id === scoreId
            ? { ...s, instructor_score: Number(reviewForm.instructor_score), feedback: reviewForm.feedback }
            : s
        )
      );
      setReviewingId(null);
      setReviewForm({ instructor_score: '', feedback: '' });
      setMsg({ text: 'Review submitted.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.message || 'Review failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const pending = scores.filter((s) => s.instructor_score === null || s.instructor_score === undefined);
  const reviewed = scores.filter((s) => s.instructor_score !== null && s.instructor_score !== undefined);

  if (loading) return <TabSkeleton />;

  const ScoreRow = ({ score }) => {
    const isReviewing = reviewingId === score.id;
    const studentName = usersMap[score.user_id] || `User #${score.user_id}`;
    const hasScore = score.instructor_score !== null && score.instructor_score !== undefined;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-hover p-5 space-y-3"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-slate-200">
              {SUBMISSION_TYPE_LABELS[score.submission_type] || score.submission_type}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{studentName}</p>
            <p className="text-xs text-slate-600">Course ID: {score.course_id}</p>
          </div>
          <div className="shrink-0">
            {hasScore ? (
              <span className="badge badge-emerald">Scored: {score.instructor_score}</span>
            ) : (
              <span className="badge badge-amber">Pending</span>
            )}
          </div>
        </div>

        {score.feedback && (
          <p className="text-sm text-slate-500 italic border-l-2 border-teal/30 pl-3">
            &ldquo;{score.feedback}&rdquo;
          </p>
        )}

        {!isReviewing ? (
          <button
            onClick={() => {
              setReviewingId(score.id);
              setReviewForm({ instructor_score: score.instructor_score ?? '', feedback: score.feedback ?? '' });
            }}
            className="btn-secondary text-xs py-1.5"
          >
            {hasScore ? 'Edit Review' : 'Review'}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Score (0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input text-sm py-2"
                  value={reviewForm.instructor_score}
                  onChange={(e) => setReviewForm((p) => ({ ...p, instructor_score: e.target.value }))}
                  placeholder="e.g. 85"
                />
              </div>
              <div>
                <label className="label">Feedback <span className="text-slate-600 font-normal">(optional)</span></label>
                <input
                  className="input text-sm py-2"
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
                  placeholder="Feedback for student..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleReview(score.id)} disabled={submitting || !reviewForm.instructor_score} className="btn-primary text-xs py-2 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button onClick={() => setReviewingId(null)} className="btn-secondary text-xs py-2">Cancel</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AnimatePresence>
        {msg.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-teal/10 border border-teal/20 text-teal-bright'}`}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="font-display text-lg font-bold text-white">Pending Review</h2>
          <span className="badge badge-amber">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-teal flex items-center justify-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All submissions reviewed!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => <ScoreRow key={s.id} score={s} />)}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-white">Reviewed</h2>
            <span className="badge badge-emerald">{reviewed.length}</span>
          </div>
          <div className="space-y-3">
            {reviewed.map((s) => <ScoreRow key={s.id} score={s} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((k) => (
        <div key={k} className="glass-card p-5 space-y-2">
          <div className="h-4 w-1/2 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-3 w-3/4 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="glass-card p-10 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default function InstructorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <div className="glass-card p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="font-display font-semibold text-slate-400">Access Restricted</p>
        <p className="text-xs text-slate-600 mt-1">This area is for instructors only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card overflow-hidden"
      >
        <div className="h-1 bg-teal-gradient" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/15 border border-teal/25">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-teal-bright">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Instructor Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage courses, teams, and review student submissions.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'courses' && <CoursesTab key="courses" />}
        {activeTab === 'teams' && <TeamsTab key="teams" />}
        {activeTab === 'submissions' && <SubmissionsTab key="submissions" />}
      </AnimatePresence>
    </div>
  );
}
