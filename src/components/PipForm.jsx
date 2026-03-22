export default function PipForm({ title, value, onChange, includeRationale = false, readOnly }) {
  const setField = (field, fieldValue) => {
    if (readOnly) return;
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="glass-card p-4 sm:p-6 space-y-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">
          Covers the rubric items: single problem, improvement idea, resources, timeline, and success measure.
        </p>
        {readOnly && (
          <p className="mt-2 text-xs font-medium text-teal flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            This section has been submitted and is locked.
          </p>
        )}
      </div>

      <div>
        <label className="label">Single problem addressed</label>
        <input
          className="input"
          value={value.problem}
          onChange={(e) => setField('problem', e.target.value)}
          placeholder="State the specific problem this PIP addresses"
          disabled={readOnly}
        />
      </div>

      {includeRationale && (
        <div>
          <label className="label">Detailed rationale</label>
          <textarea
            className="input min-h-[96px] resize-y"
            value={value.rationale}
            onChange={(e) => setField('rationale', e.target.value)}
            placeholder="Explain why this problem was selected and provide supporting context..."
            disabled={readOnly}
          />
        </div>
      )}

      <div>
        <label className="label">Improvement plan</label>
        <textarea
          className="input min-h-[96px] resize-y"
          value={value.plan}
          onChange={(e) => setField('plan', e.target.value)}
          placeholder="Describe the specific improvement steps and interventions..."
          disabled={readOnly}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Resources needed</label>
          <textarea
            className="input min-h-[96px] resize-y"
            value={value.resources}
            onChange={(e) => setField('resources', e.target.value)}
            placeholder="Personnel, tools, budget, training..."
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="label">Timeline</label>
          <textarea
            className="input min-h-[96px] resize-y"
            value={value.timeline}
            onChange={(e) => setField('timeline', e.target.value)}
            placeholder="Milestones and target completion dates..."
            disabled={readOnly}
          />
        </div>
      </div>

      <div>
        <label className="label">Measure of success</label>
        <textarea
          className="input min-h-[96px] resize-y"
          value={value.successMeasure}
          onChange={(e) => setField('successMeasure', e.target.value)}
          placeholder="How will you know the improvement worked? (metrics, thresholds...)"
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
