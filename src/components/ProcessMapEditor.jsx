export default function ProcessMapEditor({ value, onChange }) {
  const updateSection = (sectionId, field, nextValue) => {
    onChange({
      ...value,
      sections: value.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: nextValue } : section,
      ),
    });
  };

  const updateTask = (sectionId, taskId, field, nextValue) => {
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
      <div className="card">
        <h3 className="text-lg font-semibold">Process Map</h3>
        <p className="mt-1 text-sm text-slate-600">
          Keep the structure simple: major processes, related subprocesses or tasks, what should happen, and risk or drift.
        </p>
      </div>

      {value.sections.map((section, index) => (
        <div key={section.id} className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-base font-semibold text-slate-900">Major Process {index + 1}</h4>
            <button type="button" className="btn-secondary" onClick={() => addTask(section.id)}>
              Add task
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Process title</label>
              <input
                className="input"
                value={section.title}
                onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                placeholder="Example: Collect medication history"
              />
            </div>
            <div>
              <label className="label">What should happen</label>
              <input
                className="input"
                value={section.shouldHappen}
                onChange={(e) => updateSection(section.id, 'shouldHappen', e.target.value)}
                placeholder="Expected safe workflow"
              />
            </div>
          </div>

          <div>
            <label className="label">Potential drift / risk</label>
            <textarea
              className="input min-h-24"
              value={section.drift}
              onChange={(e) => updateSection(section.id, 'drift', e.target.value)}
              placeholder="What could go wrong in this step?"
            />
          </div>

          <div className="space-y-3 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Subprocesses / Tasks</p>
            {section.tasks.map((task, taskIndex) => (
              <div key={task.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-3">
                <div>
                  <label className="label">Task {taskIndex + 1}</label>
                  <input
                    className="input"
                    value={task.title}
                    onChange={(e) => updateTask(section.id, task.id, 'title', e.target.value)}
                    placeholder="Task name"
                  />
                </div>
                <div>
                  <label className="label">What should happen</label>
                  <input
                    className="input"
                    value={task.shouldHappen}
                    onChange={(e) => updateTask(section.id, task.id, 'shouldHappen', e.target.value)}
                    placeholder="Expected action"
                  />
                </div>
                <div>
                  <label className="label">Risk / drift</label>
                  <input
                    className="input"
                    value={task.drift}
                    onChange={(e) => updateTask(section.id, task.id, 'drift', e.target.value)}
                    placeholder="Potential failure"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button type="button" className="btn-primary" onClick={addSection}>
        Add major process
      </button>
    </div>
  );
}
