import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function WorkspaceHeader({ item, progress, onReset }) {
  const badgeText = item?.mode || item?.type || 'exercise';
  const isExercise = badgeText === 'exercise';
  const description =
    item?.summary ||
    item?.description ||
    'Complete the FMEA and RCA sections for this case.';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-card overflow-hidden"
    >
      {/* Top gradient bar */}
      <div className="h-1 w-full bg-teal-gradient" />

      <div className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: case info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/cases"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2.5 text-xs font-medium text-slate-400 hover:bg-white/[0.1] hover:text-slate-200 transition-all border border-white/[0.06] min-h-[44px]"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to cases
              </Link>
              <span className={`badge capitalize ${isExercise ? 'badge-teal' : 'badge-amber'}`}>
                {badgeText}
              </span>
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold text-white leading-snug">
                {item?.title || 'Case Workspace'}
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">{description}</p>
            </div>
          </div>

          {/* Right: progress card */}
          <div className="w-full lg:w-72 shrink-0 rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Overall progress</span>
              <span className={`font-bold font-display text-xl ${progress === 100 ? 'text-teal-bright' : 'text-white'}`}>
                {progress}%
              </span>
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-600">
              {progress === 100
                ? '🎉 All sections submitted!'
                : `${Math.round(progress / (100 / 6))} of 6 sections submitted`}
            </p>

            <button
              onClick={onReset}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs font-medium text-slate-500 hover:bg-white/[0.07] hover:text-slate-300 transition-all min-h-[44px]"
            >
              Reset workspace
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
