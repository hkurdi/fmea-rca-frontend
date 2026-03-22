import { useEffect, useState } from 'react';
import CaseCard from '../components/CaseCard';
import SectionTitle from '../components/SectionTitle';
import { casesApi } from '../api/cases';
import { useAuth } from '../context/AuthContext';

export default function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', mode: 'exercise' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  useEffect(() => {
    casesApi
      .getAll()
      .then((res) => setCases(res?.data || []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
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
      if (res?.data) setCases((prev) => [res.data, ...prev]);
      setFormData({ title: '', description: '', mode: 'exercise' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create case.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle
          title="Case assignments"
          subtitle="Open a case to view and track your progress per section."
        />
        {isInstructor && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Create Case
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Create New Case</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-sm text-slate-500 hover:text-slate-700">
              Close
            </button>
          </div>

          <form onSubmit={handleCreateCase} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Case Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter case title"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter case description"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
              >
                <option value="exercise">Exercise</option>
                <option value="assessment">Assessment</option>
              </select>
            </div>

            {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Save Case'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading cases...</p>
      ) : cases.length === 0 ? (
        <p className="text-sm text-slate-500">No active cases assigned yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} progress={0} />
          ))}
        </div>
      )}
    </div>
  );
}