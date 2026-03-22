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
    <div className="glass-card p-4 sm:p-6 space-y-5">
      <div>
        <h3 className="font-display text-lg font-semibold text-white">5 Whys Analysis</h3>
        <p className="mt-1 text-sm text-slate-500">
          Define the problem, write a question for each why step, then answer it to drill down to the root cause.
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
        <label className="label">Problem definition</label>
        <input
          className="input"
          value={value.problem}
          onChange={(e) => !readOnly && onChange({ ...value, problem: e.target.value })}
          placeholder="Clearly state the problem you are investigating"
          disabled={readOnly}
        />
      </div>

      <div className="space-y-3">
        {value.iterations.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-xs font-bold text-teal-bright">
                {index + 1}
              </span>
              <p className="text-sm font-semibold text-slate-300">Why {index + 1}</p>
            </div>
            <div>
              <label className="label">Question</label>
              <input
                className="input"
                placeholder={`Why does this problem occur? (Why ${index + 1})`}
                value={item.why}
                onChange={(e) => updateIteration(item.id, 'why', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="label">Answer</label>
              <textarea
                className="input min-h-[88px] resize-y"
                placeholder="Write your answer and reasoning..."
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
