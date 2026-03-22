import { Link } from 'react-router-dom';

export default function CaseCard({ item, progress, onDelete }) {
  const badgeText = item?.mode || item?.type || 'exercise';
  const description =
    item?.summary ||
    item?.description ||
    'Complete the FMEA and RCA workflow for this case.';

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{item?.title}</h3>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>

        <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold capitalize text-emerald-700">
          {badgeText}
        </span>
      </div>

      <div className="mt-8 rounded-3xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span className="font-semibold text-slate-800">{progress}%</span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {item?.allow_resubmit ? 'Resubmit allowed' : 'No resubmit planned'}
        </p>

        <div className="flex items-center gap-3">
          {onDelete ? (
            <button
              onClick={() => {
                if (window.confirm('Delete this case?')) {
                  onDelete();
                }
              }}
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          ) : null}

          <Link
            to={`/cases/${item?._id || item?.id}`}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Open case
          </Link>
        </div>
      </div>
    </div>
  );
}