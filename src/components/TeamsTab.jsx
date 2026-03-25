import { useEffect, useState } from 'react';
import { casesApi } from '../api/cases';
import { teamsApi } from '../api/teams';
import { api } from '../api/client';

export function TeamsTab() {
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

  if (loading) return <p className="text-sm text-slate-500">Loading teams...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Teams</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Team
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Create Team</h3>
            <button onClick={() => setShowForm(false)} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Close</button>
          </div>
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
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">{creating ? 'Creating...' : 'Create'}</button>
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
                  <p className="font-semibold text-slate-100">{team.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {courses.find((c) => c.id === team.course_id)?.name || `Course ID: ${team.course_id}`}
                  </p>
                </div>
                <span className="badge badge-slate">
                  {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                </span>
              </div>

              {team.members?.length > 0 && (
                <div className="space-y-2">
                  {team.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                      <span className="text-sm text-slate-300">{usersMap[m.user_id] || `User #${m.user_id}`}</span>
                      <button onClick={() => handleRemoveMember(team.id, m.user_id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
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
                <button onClick={() => handleAddMember(team.id)} className="btn-secondary">
                  Add member
                </button>
                {memberMsgs[team.id] && (
                  <span className={`text-xs font-medium ${memberMsgs[team.id].includes('fail') || memberMsgs[team.id].includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
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