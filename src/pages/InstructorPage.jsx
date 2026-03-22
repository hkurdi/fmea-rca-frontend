import { useEffect, useState } from 'react';
import { casesApi } from '../api/cases';
import { teamsApi } from '../api/teams';
import { scoringApi } from '../api/scoring';
import { useAuth } from '../context/AuthContext';

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
      const res = await casesApi.getAllCourses().then(() =>
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/courses/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || null }),
        }).then((r) => r.json())
      );
      if (res.data) {
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
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/cases/${assigningCaseId}/assign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ course_id: Number(assigningCourseId) }),
        }
      ).then((r) => r.json());
      setAssignMsg('Case assigned successfully.');
      setAssigningCaseId('');
      setAssigningCourseId('');
    } catch {
      setAssignMsg('Assignment failed.');
    }
    setTimeout(() => setAssignMsg(''), 3000);
  };

  if (loading) return <p className="text-sm text-slate-500">Loading courses...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + New Course
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Create Course</h3>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Course name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Healthcare Innovation IV"
                required
              />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input
                className="input"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Spring 2026 FMEA/RCA course"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <p className="text-sm text-slate-500">No courses yet.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{c.name}</p>
                {c.description && <p className="text-sm text-slate-500">{c.description}</p>}
              </div>
              <span className="text-xs text-slate-400">ID: {c.id}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card space-y-4">
        <h3 className="font-semibold text-slate-900">Assign Case to Course</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Case</label>
            <select
              className="input"
              value={assigningCaseId}
              onChange={(e) => setAssigningCaseId(e.target.value)}
            >
              <option value="">Select case...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Course</label>
            <select
              className="input"
              value={assigningCourseId}
              onChange={(e) => setAssigningCourseId(e.target.value)}
            >
              <option value="">Select course...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAssign}
            disabled={!assigningCaseId || !assigningCourseId}
            className="btn-primary disabled:opacity-40"
          >
            Assign
          </button>
          {assignMsg && (
            <span className={`text-sm font-medium ${assignMsg.includes('failed') ? 'text-red-600' : 'text-emerald-600'}`}>
              {assignMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamsTab() {
  const [teams, setTeams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', course_id: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [memberInputs, setMemberInputs] = useState({});
  const [memberMsgs, setMemberMsgs] = useState({});

  useEffect(() => {
    Promise.all([teamsApi.getAll(), casesApi.getAllCourses()])
      .then(([tRes, cRes]) => {
        setTeams(tRes?.data || []);
        setCourses(cRes?.data || []);
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
      const res = await teamsApi.getAll();
      setTeams(res?.data || []);
    } catch (err) {
      setMemberMsgs((p) => ({ ...p, [teamId]: err.message || 'Failed.' }));
    }
    setTimeout(() => setMemberMsgs((p) => ({ ...p, [teamId]: '' })), 3000);
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await teamsApi.removeMember(teamId, userId);
      const res = await teamsApi.getAll();
      setTeams(res?.data || []);
    } catch (err) {
      setMemberMsgs((p) => ({ ...p, [teamId]: err.message || 'Failed to remove.' }));
      setTimeout(() => setMemberMsgs((p) => ({ ...p, [teamId]: '' })), 3000);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading teams...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Teams</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + New Team
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Create Team</h3>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Team name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Team Alpha"
                required
              />
            </div>
            <div>
              <label className="label">Course</label>
              <select
                className="input"
                value={form.course_id}
                onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))}
                required
              >
                <option value="">Select course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {teams.length === 0 ? (
        <p className="text-sm text-slate-500">No teams yet.</p>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{team.name}</p>
                  <p className="text-xs text-slate-400">Course ID: {team.course_id} · Team ID: {team.id}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {team.members?.length > 0 && (
                <div className="space-y-2">
                  {team.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-700">User ID: {m.user_id}</span>
                      <button
                        onClick={() => handleRemoveMember(team.id, m.user_id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  className="input max-w-40"
                  placeholder="User ID"
                  value={memberInputs[team.id] || ''}
                  onChange={(e) => setMemberInputs((p) => ({ ...p, [team.id]: e.target.value }))}
                  type="number"
                />
                <button
                  onClick={() => handleAddMember(team.id)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Add member
                </button>
                {memberMsgs[team.id] && (
                  <span className={`text-xs font-medium ${memberMsgs[team.id].includes('fail') || memberMsgs[team.id].includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                    {memberMsgs[team.id]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionsTab() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ instructor_score: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    scoringApi.getAllScores()
      .then((res) => setScores(res?.data || []))
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
      setMsg('Review submitted.');
    } catch (err) {
      setMsg(err.message || 'Review failed.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const pending = scores.filter((s) => s.instructor_score === null || s.instructor_score === undefined);
  const reviewed = scores.filter((s) => s.instructor_score !== null && s.instructor_score !== undefined);

  if (loading) return <p className="text-sm text-slate-500">Loading submissions...</p>;

  const ScoreRow = ({ score }) => {
    const isReviewing = reviewingId === score.id;
    return (
      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">
              {SUBMISSION_TYPE_LABELS[score.submission_type] || score.submission_type}
            </p>
            <p className="text-xs text-slate-400">
              User ID: {score.user_id} · Course ID: {score.course_id} · Score ID: {score.id}
            </p>
          </div>
          <div className="text-right">
            {score.instructor_score !== null && score.instructor_score !== undefined ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Scored: {score.instructor_score}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Pending review
              </span>
            )}
          </div>
        </div>

        {score.feedback && (
          <p className="text-sm text-slate-600 italic">"{score.feedback}"</p>
        )}

        {!isReviewing ? (
          <button
            onClick={() => {
              setReviewingId(score.id);
              setReviewForm({
                instructor_score: score.instructor_score ?? '',
                feedback: score.feedback ?? '',
              });
            }}
            className="btn-secondary text-sm"
          >
            {score.instructor_score !== null ? 'Edit Review' : 'Review'}
          </button>
        ) : (
          <div className="space-y-3 rounded-xl bg-slate-50 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Score (0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input"
                  value={reviewForm.instructor_score}
                  onChange={(e) => setReviewForm((p) => ({ ...p, instructor_score: e.target.value }))}
                  placeholder="e.g. 28"
                />
              </div>
              <div>
                <label className="label">Feedback</label>
                <input
                  className="input"
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
                  placeholder="Optional feedback"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReview(score.id)}
                disabled={submitting || !reviewForm.instructor_score}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setReviewingId(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`rounded-xl px-4 py-2 text-sm font-medium ${msg.includes('fail') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {msg}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">All submissions have been reviewed.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => <ScoreRow key={s.id} score={s} />)}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Reviewed ({reviewed.length})
          </h2>
          <div className="space-y-3">
            {reviewed.map((s) => <ScoreRow key={s.id} score={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstructorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <div className="card">
        <p className="text-sm text-slate-500">Access restricted to instructors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">Instructor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage courses, teams, and review student submissions.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full gap-2 rounded-2xl bg-white p-2 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'courses' && <CoursesTab />}
      {activeTab === 'teams' && <TeamsTab />}
      {activeTab === 'submissions' && <SubmissionsTab />}
    </div>
  );
}