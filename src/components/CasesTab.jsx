import { useEffect, useState } from 'react';
import { casesApi } from '../api/cases';
import { api } from '../api/client';

const defaultForm = {
  title: '',
  description: '',
  mode: 'exercise',
  allow_resubmit: true,
  patient_name: '',
  patient_age: '',
  patient_gender: '',
  presentation_time: '',
  chief_complaint: '',
  pmh: [''],
  current_medications: '',
  er_pharmacy_satellite_hours: '',
  after_hours_coverage: '',
  rca_admission_unit: '',
  rca_admission_time: '',
  rca_potassium_on_admission: '',
  rca_potassium_day_3: '',
  rca_ecg_finding: '',
  rca_medication_concern: '',
};

function buildPatientInfo(form) {
  return {
    name: form.patient_name,
    age: form.patient_age ? Number(form.patient_age) : undefined,
    gender: form.patient_gender,
    presentation_time: form.presentation_time,
    chief_complaint: form.chief_complaint,
    pmh: form.pmh.filter((x) => x.trim()),
    current_medications: form.current_medications,
    er_pharmacy_satellite_hours: form.er_pharmacy_satellite_hours,
    after_hours_coverage: form.after_hours_coverage,
    rca_details: {
      admission_unit: form.rca_admission_unit,
      admission_time: form.rca_admission_time,
      potassium_on_admission: form.rca_potassium_on_admission,
      potassium_day_3: form.rca_potassium_day_3,
      ecg_finding: form.rca_ecg_finding,
      medication_concern: form.rca_medication_concern,
    },
  };
}

export function CasesTab() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    casesApi
      .getAll()
      .then((res) => setCases(res?.data || []))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setPmh = (index, value) => {
    const next = [...form.pmh];
    next[index] = value;
    setForm((prev) => ({ ...prev, pmh: next }));
  };

  const addPmh = () => setForm((prev) => ({ ...prev, pmh: [...prev.pmh, ''] }));

  const removePmh = (index) =>
    setForm((prev) => ({ ...prev, pmh: prev.pmh.filter((_, i) => i !== index) }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await casesApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        patient_info: buildPatientInfo(form),
        mode: form.mode,
        allow_resubmit: form.allow_resubmit,
      });
      if (res?.data) {
        setCases((prev) => [res.data, ...prev]);
        setForm(defaultForm);
        setShowForm(false);
        setSuccessMsg('Case created successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create case.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (caseId) => {
    if (!window.confirm('Deactivate this case? Students will no longer see it.')) return;
    try {
      await api.put(`/cases/${caseId}`, { is_active: false });
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, is_active: false } : c))
      );
    } catch (err) {
      setError(err.message || 'Failed to deactivate case.');
    }
  };

  const handleReactivate = async (caseId) => {
    try {
      await api.put(`/cases/${caseId}`, { is_active: true });
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, is_active: true } : c))
      );
    } catch (err) {
      setError(err.message || 'Failed to reactivate case.');
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading cases...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Cases</h2>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Case'}
        </button>
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-400">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-6 space-y-6">
          <h3 className="font-display text-lg font-semibold text-white">Create Case</h3>

          {/* ── Core Info ── */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Case Info</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="e.g. Travis Whitaker — CHF Exacerbation" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea className="input min-h-[80px] resize-y" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Brief case overview for students..." />
              </div>
              <div>
                <label className="label">Mode</label>
                <select className="input" value={form.mode} onChange={(e) => setField('mode', e.target.value)}>
                  <option value="exercise">Exercise</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="allow_resubmit"
                  checked={form.allow_resubmit}
                  onChange={(e) => setField('allow_resubmit', e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-500"
                />
                <label htmlFor="allow_resubmit" className="text-sm text-slate-300">Allow resubmission</label>
              </div>
            </div>
          </div>

          {/* ── Patient Info ── */}
          <div className="space-y-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patient Info</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label">Patient Name</label>
                <input className="input" value={form.patient_name} onChange={(e) => setField('patient_name', e.target.value)} placeholder="e.g. Travis Whitaker" />
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" className="input" value={form.patient_age} onChange={(e) => setField('patient_age', e.target.value)} placeholder="e.g. 68" />
              </div>
              <div>
                <label className="label">Gender</label>
                <input className="input" value={form.patient_gender} onChange={(e) => setField('patient_gender', e.target.value)} placeholder="e.g. Male" />
              </div>
              <div>
                <label className="label">Presentation Time</label>
                <input className="input" value={form.presentation_time} onChange={(e) => setField('presentation_time', e.target.value)} placeholder="e.g. 0100" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Chief Complaint</label>
                <input className="input" value={form.chief_complaint} onChange={(e) => setField('chief_complaint', e.target.value)} placeholder="e.g. CHF exacerbation due to fluid overload" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Current Medications</label>
                <input className="input" value={form.current_medications} onChange={(e) => setField('current_medications', e.target.value)} placeholder="e.g. Patient able to provide names only" />
              </div>
              <div>
                <label className="label">ER Pharmacy Satellite Hours</label>
                <input className="input" value={form.er_pharmacy_satellite_hours} onChange={(e) => setField('er_pharmacy_satellite_hours', e.target.value)} placeholder="e.g. 0700-2300" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">After Hours Coverage</label>
                <input className="input" value={form.after_hours_coverage} onChange={(e) => setField('after_hours_coverage', e.target.value)} placeholder="e.g. Main pharmacy with nurse-obtained medication histories" />
              </div>
            </div>

            {/* PMH */}
            <div>
              <label className="label">Past Medical History (PMH)</label>
              <div className="space-y-2">
                {form.pmh.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className="input"
                      value={item}
                      onChange={(e) => setPmh(index, e.target.value)}
                      placeholder={`e.g. HFrEF 15-20%`}
                    />
                    {form.pmh.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePmh(index)}
                        className="shrink-0 rounded-xl border border-red-500/20 px-3 text-xs text-red-400 hover:bg-red-500/10 transition-all min-h-[44px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPmh} className="btn-secondary text-xs py-2 px-3">
                  + Add PMH item
                </button>
              </div>
            </div>
          </div>

          {/* ── RCA Details ── */}
          <div className="space-y-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">RCA Details</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label">Admission Unit</label>
                <input className="input" value={form.rca_admission_unit} onChange={(e) => setField('rca_admission_unit', e.target.value)} placeholder="e.g. Cardiac Unit" />
              </div>
              <div>
                <label className="label">Admission Time</label>
                <input className="input" value={form.rca_admission_time} onChange={(e) => setField('rca_admission_time', e.target.value)} placeholder="e.g. 0530" />
              </div>
              <div>
                <label className="label">Potassium on Admission</label>
                <input className="input" value={form.rca_potassium_on_admission} onChange={(e) => setField('rca_potassium_on_admission', e.target.value)} placeholder="e.g. 5.7 mmol/L" />
              </div>
              <div>
                <label className="label">Potassium Day 3</label>
                <input className="input" value={form.rca_potassium_day_3} onChange={(e) => setField('rca_potassium_day_3', e.target.value)} placeholder="e.g. 6.8 mmol/L" />
              </div>
              <div>
                <label className="label">ECG Finding</label>
                <input className="input" value={form.rca_ecg_finding} onChange={(e) => setField('rca_ecg_finding', e.target.value)} placeholder="e.g. Peaked T-waves" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Medication Concern</label>
                <textarea className="input min-h-[80px] resize-y" value={form.rca_medication_concern} onChange={(e) => setField('rca_medication_concern', e.target.value)} placeholder="e.g. Entresto dosed from previous admission records without daily lab monitoring" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Creating...' : 'Create Case'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(defaultForm); setError(''); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cases list */}
      {cases.length === 0 ? (
        <p className="text-sm text-slate-500">No cases yet.</p>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div key={c.id} className="card flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-100">{c.title}</p>
                  <span className={`badge capitalize ${c.mode === 'exercise' ? 'badge-teal' : 'badge-amber'}`}>
                    {c.mode}
                  </span>
                  {!c.is_active && (
                    <span className="badge bg-red-500/15 text-red-400 border border-red-500/20">
                      Inactive
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{c.description}</p>
                )}
                <p className="mt-1 text-xs text-slate-600">
                  {c.allow_resubmit ? 'Resubmit allowed' : 'No resubmit'} · ID: {c.id}
                </p>
              </div>
              <div className="shrink-0">
                {c.is_active ? (
                  <button
                    onClick={() => handleDeactivate(c.id)}
                    className="rounded-xl border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(c.id)}
                    className="rounded-xl border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}