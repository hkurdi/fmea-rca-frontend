export default function FiveWhysEditor({ value, onChange, readOnly }) {
  const updateIteration = (id, field, newValue) => {
    if (readOnly) return;
    onChange({
      ...value,
      iterations: value.iterations.map((item) =>
        item.id === id ? { ...item, [field]: newValue } : item,
      ),
    });
  };

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">5 Whys Analysis</h3>
        <p className="mt-1 text-sm text-slate-600">
          Define the problem, write a question for each why step, then answer it.
        </p>
        {readOnly && (
          <p className="mt-2 text-xs font-medium text-emerald-600">
            This section has been submitted and is locked.
          </p>
        )}
      </div>

      <div>
        <label className="label">Problem definition</label>
        <input
          className="input"
          value={value.problem}
          onChange={(e) => !readOnly && onChange({ ...value, problem: e.target.value })}
          disabled={readOnly}
        />
      </div>

      <div className="space-y-3">
        {value.iterations.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Why {index + 1}</p>
            <div>
              <label className="label">Question</label>
              <input
                className="input"
                placeholder={`Why ${index + 1}?`}
                value={item.why}
                onChange={(e) => updateIteration(item.id, 'why', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="label">Answer</label>
              <textarea
                className="input min-h-20"
                placeholder="Write the answer for this why step"
                value={item.answer}
                onChange={(e) => updateIteration(item.id, 'answer', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}