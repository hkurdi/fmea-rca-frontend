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
    <div className="glass-card overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">Hazard Analysis</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            RPN is calculated automatically as occurrence × detection × severity.
          </p>
          {readOnly && (
            <p className="mt-1 text-xs font-medium text-teal">
              This section has been submitted and is locked.
            </p>
          )}
        </div>
        {!readOnly && (
          <button type="button" className="btn-primary self-start sm:self-auto" onClick={addRow}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add row
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-4 sm:-mx-6">
        <div className="min-w-[900px] px-4 sm:px-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {[
                  'Major Process',
                  'Subprocess / Task',
                  'Failure Mode',
                  'Failure Cause',
                  'Failure Effect',
                  'O',
                  'D',
                  'S',
                  'RPN',
                  'Action',
                ].map((head) => (
                  <th
                    key={head}
                    className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${
                      ['O', 'D', 'S', 'RPN'].includes(head) ? 'text-center' : ''
                    }`}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-sm text-slate-600">
                    No rows yet.{!readOnly && ' Click "Add row" to begin.'}
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const suggestions = generateHazardSuggestions({
                  majorProcess: row.majorProcess,
                  subProcess: row.subProcess,
                });
                const showSuggestions = openSuggestionRow === row.id;
                const rpn = calculateRpn(row);
                const rpnColor = rpn >= 200 ? 'text-red-400' : rpn >= 100 ? 'text-amber-400' : 'text-teal-bright';

                return (
                  <Fragment key={row.id}>
                    <tr className="border-t border-white/[0.05] hover:bg-white/[0.02] align-top transition-colors">
                      <td className="p-2.5">
                        <input
                          className="input min-w-[140px] text-sm"
                          placeholder="Major process"
                          value={row.majorProcess}
                          onChange={(e) => updateRow(row.id, 'majorProcess', e.target.value)}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          className="input min-w-[140px] text-sm"
                          placeholder="Subprocess / task"
                          value={row.subProcess}
                          onChange={(e) => updateRow(row.id, 'subProcess', e.target.value)}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          className="input min-w-[150px] text-sm"
                          placeholder="What can fail?"
                          value={row.failureMode}
                          onChange={(e) => updateRow(row.id, 'failureMode', e.target.value)}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          className="input min-w-[150px] text-sm"
                          placeholder="Why can it fail?"
                          value={row.failureCause}
                          onChange={(e) => updateRow(row.id, 'failureCause', e.target.value)}
                          disabled={readOnly}
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          className="input min-w-[150px] text-sm"
                          placeholder="What happens?"
                          value={row.failureEffect}
                          onChange={(e) => updateRow(row.id, 'failureEffect', e.target.value)}
                          disabled={readOnly}
                        />
                      </td>
                      {['occurrence', 'detection', 'severity'].map((field) => (
                        <td key={field} className="p-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            className="w-14 h-11 rounded-xl border border-white/[0.1] bg-white/[0.05] px-1 text-center text-base font-semibold text-white outline-none [appearance:textfield] focus:border-teal/60 focus:ring-2 focus:ring-teal/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            value={row[field]}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                              updateRow(row.id, field, val);
                            }}
                            disabled={readOnly}
                          />
                        </td>
                      ))}
                      <td className="p-2.5 text-center">
                        <div className={`inline-flex h-11 min-w-[52px] items-center justify-center rounded-xl bg-white/[0.06] px-3 font-display text-base font-bold ${rpnColor}`}>
                          {rpn}
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="space-y-2">
                          <input
                            className="input min-w-[160px] text-sm"
                            placeholder="Risk reduction action"
                            value={row.action}
                            onChange={(e) => updateRow(row.id, 'action', e.target.value)}
                            disabled={readOnly}
                          />
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => setOpenSuggestionRow(showSuggestions ? null : row.id)}
                              className="w-full rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/20 hover:border-violet-500/40 min-h-[44px]"
                            >
                              {showSuggestions ? 'Hide suggestions' : '✦ AI suggestions'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {showSuggestions && !readOnly && (
                      <tr className="border-t border-white/[0.05] bg-violet-500/5">
                        <td colSpan={10} className="p-4">
                          <div className="rounded-2xl border border-violet-500/20 bg-card p-4">
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-white">AI Suggestions</h4>
                              <p className="text-xs text-slate-500">Category: {suggestions.category}</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}

function SuggestionColumn({ title, items, onApply }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onApply(item)}
            className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-left text-sm text-slate-400 transition-all hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-slate-200 min-h-[44px]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
