import { useEffect, useState } from 'react';
import { casesApi } from '../api/cases';
import { api } from '../api/client';

export function CoursesTab() {
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
      await api.post(`/cases/${assigningCaseId}/assign`, {
        course_id: Number(assigningCourseId),
      });
      setAssignMsg('Case assigned successfully.');
      setAssigningCaseId('');
      setAssigningCourseId('');
    } catch (err) {
      setAssignMsg(err.message || 'Assignment failed.');
    }
    setTimeout(() => setAssignMsg(''), 3000);
  };

  if (loading) return <p className="text-sm text-slate-500">Loading courses...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Courses</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Course
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Create Course</h3>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Close</button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Course name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Healthcare Innovation IV" required />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input className="input" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="e.g. Spring 2026 FMEA/RCA course" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
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
                <p className="font-semibold text-slate-100">{c.name}</p>
                {c.description && <p className="text-sm text-slate-400 mt-0.5">{c.description}</p>}
              </div>
              <span className="badge badge-slate">ID: {c.id}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card space-y-4">
        <h3 className="font-semibold text-slate-100">Assign Case to Course</h3>
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
          <button onClick={handleAssign} disabled={!assigningCaseId || !assigningCourseId} className="btn-primary">
            Assign
          </button>
          {assignMsg && (
            <span className={`text-sm font-medium ${assignMsg.includes('failed') || assignMsg.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
              {assignMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}