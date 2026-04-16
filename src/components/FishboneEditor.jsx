function SmallInput({ value, onChange, placeholder, readOnly, className = '' }) {
  return (
    <div className={`fb-small-input ${className}`}>
      <input
        className="fb-small-field"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={readOnly}
      />
    </div>
  );
}

function BranchTop({ major, index, onUpdate, readOnly }) {
  return (
    <div className={`fb-branch fb-branch-top fb-top-${index + 1}`}>
      <div className="fb-major-box">
        <input
          className="fb-major-input"
          value={major.label}
          onChange={(e) => onUpdate(major.id, 'label', e.target.value)}
          placeholder={`Major Cause ${index + 1}`}
          disabled={readOnly}
        />
      </div>

      <div className="fb-diagonal-line" />

      <div className="fb-branch-input fb-horizontal fb-h1">
        <SmallInput
          value={major.primaryCauses[0]?.label || ''}
          onChange={(e) => onUpdate(major.id, 'primary', e.target.value, major.primaryCauses[0]?.id)}
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h2">
        <SmallInput
          value={major.primaryCauses[0]?.secondaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'secondary',
              e.target.value,
              major.primaryCauses[0]?.id,
              major.primaryCauses[0]?.secondaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h3">
        <SmallInput
          value={major.primaryCauses[0]?.secondaryCauses[0]?.tertiaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'tertiary',
              e.target.value,
              major.primaryCauses[0]?.id,
              major.primaryCauses[0]?.secondaryCauses[0]?.id,
              major.primaryCauses[0]?.secondaryCauses[0]?.tertiaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h4">
        <SmallInput
          value={major.primaryCauses[1]?.label || ''}
          onChange={(e) => onUpdate(major.id, 'primary', e.target.value, major.primaryCauses[1]?.id)}
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h5">
        <SmallInput
          value={major.primaryCauses[1]?.secondaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'secondary',
              e.target.value,
              major.primaryCauses[1]?.id,
              major.primaryCauses[1]?.secondaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h6">
        <SmallInput
          value={major.primaryCauses[1]?.secondaryCauses[0]?.tertiaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'tertiary',
              e.target.value,
              major.primaryCauses[1]?.id,
              major.primaryCauses[1]?.secondaryCauses[0]?.id,
              major.primaryCauses[1]?.secondaryCauses[0]?.tertiaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

function BranchBottom({ major, index, onUpdate, readOnly }) {
  return (
    <div className={`fb-branch fb-branch-bottom fb-bottom-${index + 1}`}>
      <div className="fb-major-box">
        <input
          className="fb-major-input"
          value={major.label}
          onChange={(e) => onUpdate(major.id, 'label', e.target.value)}
          placeholder={`Major Cause ${index + 4}`}
          disabled={readOnly}
        />
      </div>

      <div className="fb-diagonal-line" />

      <div className="fb-branch-input fb-horizontal fb-h1">
        <SmallInput
          value={major.primaryCauses[0]?.label || ''}
          onChange={(e) => onUpdate(major.id, 'primary', e.target.value, major.primaryCauses[0]?.id)}
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h2">
        <SmallInput
          value={major.primaryCauses[0]?.secondaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'secondary',
              e.target.value,
              major.primaryCauses[0]?.id,
              major.primaryCauses[0]?.secondaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h3">
        <SmallInput
          value={major.primaryCauses[0]?.secondaryCauses[0]?.tertiaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'tertiary',
              e.target.value,
              major.primaryCauses[0]?.id,
              major.primaryCauses[0]?.secondaryCauses[0]?.id,
              major.primaryCauses[0]?.secondaryCauses[0]?.tertiaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h4">
        <SmallInput
          value={major.primaryCauses[1]?.label || ''}
          onChange={(e) => onUpdate(major.id, 'primary', e.target.value, major.primaryCauses[1]?.id)}
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h5">
        <SmallInput
          value={major.primaryCauses[1]?.secondaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'secondary',
              e.target.value,
              major.primaryCauses[1]?.id,
              major.primaryCauses[1]?.secondaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>

      <div className="fb-branch-input fb-horizontal fb-h6">
        <SmallInput
          value={major.primaryCauses[1]?.secondaryCauses[0]?.tertiaryCauses[0]?.label || ''}
          onChange={(e) =>
            onUpdate(
              major.id,
              'tertiary',
              e.target.value,
              major.primaryCauses[1]?.id,
              major.primaryCauses[1]?.secondaryCauses[0]?.id,
              major.primaryCauses[1]?.secondaryCauses[0]?.tertiaryCauses[0]?.id
            )
          }
          placeholder="Cause"
          readOnly={readOnly}
        />
      </div>
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

        if (level === 'label') {
          return { ...major, label: newValue };
        }

        return {
          ...major,
          primaryCauses: major.primaryCauses.map((primary) => {
            if (primary.id !== primaryId) return primary;

            if (level === 'primary') {
              return { ...primary, label: newValue };
            }

            return {
              ...primary,
              secondaryCauses: primary.secondaryCauses.map((secondary) => {
                if (secondary.id !== secondaryId) return secondary;

                if (level === 'secondary') {
                  return { ...secondary, label: newValue };
                }

                return {
                  ...secondary,
                  tertiaryCauses: secondary.tertiaryCauses.map((tertiary) =>
                    tertiary.id === tertiaryId ? { ...tertiary, label: newValue } : tertiary
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

  const majors = value.majorCauses || [];
  const topMajors = majors.slice(0, 3);
  const bottomMajors = majors.slice(3, 6);

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-white">Fishbone Diagram</h3>
        <p className="mt-1 text-sm text-slate-400">
          Enter the problem and causes directly in fishbone shape.
        </p>

        {readOnly && (
          <p className="mt-2 text-xs font-medium text-teal flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
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

      <div className="glass-card fb-wrapper">
        <div className="fb-canvas">
          <div className="fb-spine" />
          <div className="fb-effect-arrow" />
          <div className="fb-effect-text">{value.problemStatement || 'Effect'}</div>

          {topMajors.map((major, index) => (
            <BranchTop
              key={major.id}
              major={major}
              index={index}
              onUpdate={updateNested}
              readOnly={readOnly}
            />
          ))}

          {bottomMajors.map((major, index) => (
            <BranchBottom
              key={major.id}
              major={major}
              index={index}
              onUpdate={updateNested}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
}