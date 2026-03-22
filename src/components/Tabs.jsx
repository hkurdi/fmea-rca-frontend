import { motion } from 'framer-motion';

export default function Tabs({ items, activeKey, onChange }) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="inline-flex min-w-full gap-1 rounded-2xl bg-surface border border-white/[0.06] p-1.5">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`relative rounded-xl px-3 py-2 sm:px-4 text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[44px] inline-flex items-center ${
              activeKey === item.key
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
            }`}
          >
            {activeKey === item.key && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-xl bg-teal/15 border border-teal/25"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
