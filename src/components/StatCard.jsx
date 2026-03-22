import { motion } from 'framer-motion';

export default function StatCard({ label, value, hint, icon, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={`glass-card-hover p-5 relative overflow-hidden ${accent ? 'border-teal/25' : ''}`}
    >
      {accent && (
        <div className="absolute inset-0 bg-teal-gradient opacity-[0.04] pointer-events-none" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`mt-2 font-display text-3xl font-bold leading-none ${accent ? 'text-gradient' : 'text-white'}`}>
            {value}
          </p>
          {hint && <p className="mt-2 text-xs text-slate-500 leading-snug">{hint}</p>}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent ? 'bg-teal/15 text-teal-bright' : 'bg-white/[0.06] text-slate-400'}`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
