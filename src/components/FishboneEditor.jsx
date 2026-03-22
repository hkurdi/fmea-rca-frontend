function CauseColumn({ title, items, onUpdate }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      {items.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-xl bg-slate-50 p-3">
          <div>
            <label className="label">{title} {index + 1}</label>
            <input className="input" value={item.label} onChange={(e) => onUpdate(item.id, 'label', e.target.value)} />
          </div>

          {item.primaryCauses ? (
            <div className="space-y-3">
              {item.primaryCauses.map((primary, primaryIndex) => (
                <div key={primary.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <label className="label">Primary Cause {primaryIndex + 1}</label>
                  <input
                    className="input"
                    value={primary.label}
                    onChange={(e) => onUpdate(item.id, 'primary', e.target.value, primary.id)}
                  />

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {primary.secondaryCauses.map((secondary, secondaryIndex) => (
                      <div key={secondary.id} className="rounded-xl bg-slate-50 p-3">
                        <label className="label">Secondary Cause {secondaryIndex + 1}</label>
                        <input
                          className="input"
                          value={secondary.label}
                          onChange={(e) => onUpdate(item.id, 'secondary', e.target.value, primary.id, secondary.id)}
                        />
                        <div className="mt-3 space-y-2">
                          {secondary.tertiaryCauses.map((tertiary, tertiaryIndex) => (
                            <div key={tertiary.id}>
                              <label className="label">Tertiary Cause {tertiaryIndex + 1}</label>
                              <input
                                className="input"
                                value={tertiary.label}
                                onChange={(e) =>
                                  onUpdate(item.id, 'tertiary', e.target.value, primary.id, secondary.id, tertiary.id)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function FishboneEditor({ value, onChange }) {
  const updateNested = (majorId, level, newValue, primaryId, secondaryId, tertiaryId) => {
    const next = {
      ...value,
      majorCauses: value.majorCauses.map((major) => {
        if (major.id !== majorId) return major;
        if (level === 'label') return { ...major, label: newValue };
        return {
          ...major,
          primaryCauses: major.primaryCauses.map((primary) => {
            if (primary.id !== primaryId) return primary;
            if (level === 'primary') return { ...primary, label: newValue };
            return {
              ...primary,
              secondaryCauses: primary.secondaryCauses.map((secondary) => {
                if (secondary.id !== secondaryId) return secondary;
                if (level === 'secondary') return { ...secondary, label: newValue };
                return {
                  ...secondary,
                  tertiaryCauses: secondary.tertiaryCauses.map((tertiary) =>
                    tertiary.id === tertiaryId ? { ...tertiary, label: newValue } : tertiary,
                  ),
                };
              }),
            };
          }),
        };
      }),
    };

    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900">Fishbone Diagram</h3>
        <p className="mt-1 text-sm text-slate-600">
          This simple editor supports the rubric structure: one problem, five major causes, two primary causes each,
          and deeper secondary and tertiary causes under one major branch.
        </p>
        <div className="mt-4">
          <label className="label">Problem statement</label>
          <input
            className="input"
            value={value.problemStatement}
            onChange={(e) => onChange({ ...value, problemStatement: e.target.value })}
            placeholder="Clearly define the problem"
          />
        </div>
      </div>

      <CauseColumn title="Major Cause" items={value.majorCauses} onUpdate={updateNested} />
    </div>
  );
}
