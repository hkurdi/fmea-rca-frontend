import { Fragment, useState } from 'react';
import { calculateRpn } from '../utils/helpers';
import { generateHazardSuggestions } from '../utils/aiSuggestions';

export default function HazardAnalysisTable({ rows, onChange, readOnly }) {
  const [openSuggestionRow, setOpenSuggestionRow] = useState(null);

  const updateRow = (rowId, field, value) => {
    if (readOnly) return;
    onChange(rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    if (readOnly) return;
    onChange([
      ...rows,
      {
        id: crypto.randomUUID(),
        majorProcess: '',
        subProcess: '',
        failureMode: '',
        failureCause: '',
        failureEffect: '',
        occurrence: 1,
        detection: 1,
        severity: 1,
        action: '',
      },
    ]);
  };

  const applySuggestion = (rowId, field, value) => {
    if (readOnly) return;
    updateRow(rowId, field, value);
  };

  return (
    <div className="card overflow-hidden">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Hazard Analysis</h3>
          <p className="text-sm text-slate-600">
            RPN is calculated automatically as occurrence × detection × severity.
          </p>
          {readOnly && (
            <p className="mt-1 text-xs font-medium text-emerald-600">
              This section has been submitted and is locked.
            </p>
          )}
        </div>
        {!readOnly && (
          <button type="button" className="btn-primary" onClick={addRow}>
            Add row
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              {[
                'Major Process',
                'Subprocess/Task',
                'Failure Mode',
                'Failure Cause',
                'Failure Effect',
                'O',
                'D',
                'S',
                'RPN',
                'Action',
              ].map((head) => (
                <th key={head} className="px-3 py-3 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const suggestions = generateHazardSuggestions({
                majorProcess: row.majorProcess,
                subProcess: row.subProcess,
              });
              const showSuggestions = openSuggestionRow === row.id;

              return (
                <Fragment key={row.id}>
                  <tr className="border-t border-slate-200 align-top">
                    <td className="p-3">
                      <input
                        className="input min-w-36"
                        placeholder="Major process"
                        value={row.majorProcess}
                        onChange={(e) => updateRow(row.id, 'majorProcess', e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        className="input min-w-36"
                        placeholder="Subprocess / task"
                        value={row.subProcess}
                        onChange={(e) => updateRow(row.id, 'subProcess', e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        className="input min-w-40"
                        placeholder="What can fail?"
                        value={row.failureMode}
                        onChange={(e) => updateRow(row.id, 'failureMode', e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        className="input min-w-40"
                        placeholder="Why can it fail?"
                        value={row.failureCause}
                        onChange={(e) => updateRow(row.id, 'failureCause', e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        className="input min-w-40"
                        placeholder="What happens if it fails?"
                        value={row.failureEffect}
                        onChange={(e) => updateRow(row.id, 'failureEffect', e.target.value)}
                        disabled={readOnly}
                      />
                    </td>
                    {['occurrence', 'detection', 'severity'].map((field) => (
                      <td key={field} className="p-3">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="w-16 rounded-2xl border border-slate-300 bg-white px-2 py-2 text-center text-base font-semibold text-slate-900 outline-none [appearance:textfield] focus:border-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
                          value={row[field]}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                            updateRow(row.id, field, val);
                          }}
                          disabled={readOnly}
                        />
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-900">
                        {calculateRpn(row)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-2">
                        <input
                          className="input min-w-44"
                          placeholder="Risk reduction action"
                          value={row.action}
                          onChange={(e) => updateRow(row.id, 'action', e.target.value)}
                          disabled={readOnly}
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => setOpenSuggestionRow(showSuggestions ? null : row.id)}
                            className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                          >
                            {showSuggestions ? 'Hide AI suggestions' : 'Suggest with AI'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {showSuggestions && !readOnly && (
                    <tr className="border-t border-slate-100 bg-indigo-50/40">
                      <td colSpan={10} className="p-4">
                        <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-slate-900">AI Suggestions</h4>
                            <p className="text-xs text-slate-500">Suggested category: {suggestions.category}</p>
                          </div>
                          <div className="grid gap-4 lg:grid-cols-4">
                            <SuggestionColumn title="Failure Modes" items={suggestions.failureModes} onApply={(v) => applySuggestion(row.id, 'failureMode', v)} />
                            <SuggestionColumn title="Failure Causes" items={suggestions.failureCauses} onApply={(v) => applySuggestion(row.id, 'failureCause', v)} />
                            <SuggestionColumn title="Failure Effects" items={suggestions.failureEffects} onApply={(v) => applySuggestion(row.id, 'failureEffect', v)} />
                            <SuggestionColumn title="Actions" items={suggestions.actions} onApply={(v) => applySuggestion(row.id, 'action', v)} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuggestionColumn({ title, items, onApply }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-800">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onApply(item)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}