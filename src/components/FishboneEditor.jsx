function CauseColumn({ title, items, onUpdate, readOnly }) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/[0.07] p-4">
      <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
      {items.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div>
            <label className="label">{title} {index + 1}</label>
            <input
              className="input"
              value={item.label}
              onChange={(e) => onUpdate(item.id, 'label', e.target.value)}
              disabled={readOnly}
              placeholder={`Enter ${title.toLowerCase()}...`}
            />
          </div>

          {item.primaryCauses ? (
            <div className="space-y-3">
              {item.primaryCauses.map((primary, primaryIndex) => (
                <div key={primary.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <label className="label">Primary Cause {primaryIndex + 1}</label>
                  <input
                    className="input"
                    value={primary.label}
                    onChange={(e) => onUpdate(item.id, 'primary', e.target.value, primary.id)}
                    disabled={readOnly}
                    placeholder="Primary cause..."
                  />

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {primary.secondaryCauses.map((secondary, secondaryIndex) => (
                      <div key={secondary.id} className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
                        <label className="label">Secondary Cause {secondaryIndex + 1}</label>
                        <input
                          className="input"
                          value={secondary.label}
                          onChange={(e) => onUpdate(item.id, 'secondary', e.target.value, primary.id, secondary.id)}
                          disabled={readOnly}
                          placeholder="Secondary cause..."
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
                                disabled={readOnly}
                                placeholder="Tertiary cause..."
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

export default function FishboneEditor({ value, onChange, readOnly }) {
  const updateNested = (majorId, level, newValue, primaryId, secondaryId, tertiaryId) => {
    if (readOnly) return;
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
      <div className="glass-card p-4 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-white">Fishbone Diagram</h3>
        <p className="mt-1 text-sm text-slate-500">
          One problem, five major causes, two primary causes each, and deeper secondary and tertiary causes under one major branch.
        </p>
        {readOnly && (
          <p className="mt-2 text-xs font-medium text-teal flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            This section has been submitted and is locked.
          </p>
        )}
        <div className="mt-4">
          <label className="label">Problem statement</label>
          <input
            className="input"
            value={value.problemStatement}
            onChange={(e) => !readOnly && onChange({ ...value, problemStatement: e.target.value })}
            placeholder="Clearly define the problem being analyzed"
            disabled={readOnly}
          />
        </div>
      </div>

      <CauseColumn
        title="Major Cause"
        items={value.majorCauses}
        onUpdate={updateNested}
        readOnly={readOnly}
      />
    </div>
  );
}
