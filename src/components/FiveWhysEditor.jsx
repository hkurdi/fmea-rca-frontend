export default function FiveWhysEditor({ value, onChange }) {
  const updateIteration = (id, answer) => {
    onChange({
      ...value,
      iterations: value.iterations.map((item) => (item.id === id ? { ...item, answer } : item)),
    });
  };

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">5 Whys Analysis</h3>
        <p className="mt-1 text-sm text-slate-600">Keep one clear problem and complete at least five aligned why-answer steps.</p>
      </div>

      <div>
        <label className="label">Problem definition</label>
        <input className="input" value={value.problem} onChange={(e) => onChange({ ...value, problem: e.target.value })} />
      </div>

      <div className="space-y-3">
        {value.iterations.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Why {index + 1}?</p>
            <textarea
              className="input mt-2 min-h-20"
              placeholder="Write the answer for this why step"
              value={item.answer}
              onChange={(e) => updateIteration(item.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
