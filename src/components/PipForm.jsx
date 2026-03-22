export default function PipForm({ title, value, onChange, includeRationale = false }) {
  const setField = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Covers the rubric items: single problem, improvement idea, resources, timeline, and success measure.
        </p>
      </div>

      <div>
        <label className="label">Single problem addressed</label>
        <input className="input" value={value.problem} onChange={(e) => setField('problem', e.target.value)} />
      </div>

      {includeRationale ? (
        <div>
          <label className="label">Detailed rationale</label>
          <textarea className="input min-h-24" value={value.rationale} onChange={(e) => setField('rationale', e.target.value)} />
        </div>
      ) : null}

      <div>
        <label className="label">Improvement plan</label>
        <textarea className="input min-h-24" value={value.plan} onChange={(e) => setField('plan', e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Resources needed</label>
          <textarea className="input min-h-24" value={value.resources} onChange={(e) => setField('resources', e.target.value)} />
        </div>
        <div>
          <label className="label">Timeline</label>
          <textarea className="input min-h-24" value={value.timeline} onChange={(e) => setField('timeline', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Measure of success</label>
        <textarea className="input min-h-24" value={value.successMeasure} onChange={(e) => setField('successMeasure', e.target.value)} />
      </div>
    </div>
  );
}
