export default function ProcessMapEditor({ value, onChange, readOnly }) {
  const updateSection = (sectionId, field, nextValue) => {
    if (readOnly) return;
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: nextValue } : section,
      ),
    });
  };

  const updateTask = (sectionId, taskId, field, nextValue) => {
    if (readOnly) return;
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              tasks: section.tasks.map((task) =>
                task.id === taskId ? { ...task, [field]: nextValue } : task,
              ),
            }
          : section,
      ),
    });
  };

  const addSection = () => {
    if (readOnly) return;
    onChange({
      ...value,
      sections: [
        ...value.sections,
        {
          id: crypto.randomUUID(),
          title: `Major Process ${value.sections.length + 1}`,
          type: 'major',
          shouldHappen: '',
          drift: '',
          tasks: [
            {
              id: crypto.randomUUID(),
              title: 'Subprocess / Task',
              type: 'subprocess',
              shouldHappen: '',
              drift: '',
            },
          ],
        },
      ],
    });
  };

  const addTask = (sectionId) => {
    if (readOnly) return;
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              tasks: [
                ...section.tasks,
                {
                  id: crypto.randomUUID(),
                  title: 'Subprocess / Task',
                  type: 'subprocess',
                  shouldHappen: '',
                  drift: '',
                },
              ],
            }
          : section,
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-white">Process Map</h3>
        <p className="mt-1 text-sm text-slate-500">
          Map major processes with their subprocesses, expected outcomes, and potential risk or drift.
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

      {value.sections.map((section, index) => (
        <div key={section.id} className="glass-card p-4 sm:p-6 space-y-4">
          {/* Section header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-xs font-bold text-teal-bright">
                {index + 1}
              </span>
              <h4 className="text-base font-semibold text-slate-200">Major Process</h4>
            </div>
            {!readOnly && (
              <button
                type="button"
                className="btn-secondary self-start sm:self-auto text-xs py-2 px-3"
                onClick={() => addTask(section.id)}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add task
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Process title</label>
              <input
                className="input"
                value={section.title}
                onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                placeholder="Example: Collect medication history"
                disabled={readOnly}
              />
            </div>
            <div>
              <label className="label">What should happen</label>
              <input
                className="input"
                value={section.shouldHappen}
                onChange={(e) => updateSection(section.id, 'shouldHappen', e.target.value)}
                placeholder="Expected safe workflow"
                disabled={readOnly}
              />
            </div>
          </div>

          <div>
            <label className="label">Potential drift / risk</label>
            <textarea
              className="input min-h-[96px] resize-y"
              value={section.drift}
              onChange={(e) => updateSection(section.id, 'drift', e.target.value)}
              placeholder="What could go wrong in this step?"
              disabled={readOnly}
            />
          </div>

          {/* Tasks */}
          <div className="space-y-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subprocesses / Tasks</p>
            {section.tasks.map((task, taskIndex) => (
              <div
                key={task.id}
                className="grid gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 sm:p-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <div>
                  <label className="label">Task {taskIndex + 1}</label>
                  <input
                    className="input"
                    value={task.title}
                    onChange={(e) => updateTask(section.id, task.id, 'title', e.target.value)}
                    placeholder="Task name"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">What should happen</label>
                  <input
                    className="input"
                    value={task.shouldHappen}
                    onChange={(e) => updateTask(section.id, task.id, 'shouldHappen', e.target.value)}
                    placeholder="Expected action"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Risk / drift</label>
                  <input
                    className="input"
                    value={task.drift}
                    onChange={(e) => updateTask(section.id, task.id, 'drift', e.target.value)}
                    placeholder="Potential failure"
                    disabled={readOnly}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!readOnly && (
        <button type="button" className="btn-primary" onClick={addSection}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add major process
        </button>
      )}
    </div>
  );
}
