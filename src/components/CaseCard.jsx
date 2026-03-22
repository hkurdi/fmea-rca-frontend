import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CaseCard({ item, progress, onDelete }) {
  const badgeText = item?.mode || item?.type || 'exercise';
  const description =
    item?.summary ||
    item?.description ||
    'Complete the FMEA and RCA workflow for this case.';

  const isExercise = badgeText === 'exercise';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="glass-card-hover group overflow-hidden"
    >
      {/* Top accent line */}
      <div className={`h-0.5 w-full ${progress === 100 ? 'bg-teal-gradient' : 'bg-white/[0.06]'}`} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-bold text-white leading-snug truncate pr-2">
              {item?.title}
            </h3>
            <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">{description}</p>
          </div>
          <span className={`shrink-0 badge capitalize ${isExercise ? 'badge-teal' : 'badge-amber'}`}>
            {badgeText}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className={`font-bold ${progress === 100 ? 'text-teal-bright' : 'text-slate-300'}`}>
              {progress}%
            </span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
          {progress === 100 && (
            <p className="mt-2 text-xs text-teal font-medium flex items-center gap-1">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All sections complete
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            {item?.allow_resubmit ? (
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-teal-dim">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Resubmit allowed
              </span>
            ) : (
              'No resubmit'
            )}
          </p>

          <div className="flex items-center gap-2 sm:justify-end">
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.confirm('Delete this case?') && onDelete()}
                className="rounded-xl border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
              >
                Delete
              </motion.button>
            )}

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
              <Link
                to={`/cases/${item?._id || item?.id}`}
                className="btn-primary px-4 py-2 text-xs w-full sm:w-auto justify-center"
              >
                Open case
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
