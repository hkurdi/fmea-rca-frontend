import { Link } from 'react-router-dom';

export default function WorkspaceHeader({ item, progress, onReset }) {
  const badgeText = item?.mode || item?.type || 'exercise';
  const description =
    item?.summary ||
    item?.description ||
    'Complete the FMEA and RCA sections for this case.';

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/cases"
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              ← Back to cases
            </Link>

            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold capitalize text-emerald-700">
              {badgeText}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">{item?.title || 'Case'}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
          </div>
        </div>

        <div className="min-w-[260px] rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Progress</span>
            <span className="font-semibold text-slate-900">{progress}%</span>
          </div>

          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            onClick={onReset}
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Reset workspace
          </button>
        </div>
      </div>
    </div>
  );
}