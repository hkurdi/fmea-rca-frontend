import { motion } from 'framer-motion';

export default function SectionTitle({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h2 className="font-display text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
