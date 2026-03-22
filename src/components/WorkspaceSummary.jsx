import { motion } from 'framer-motion';
import { rubricPoints } from "../data/mockData";
import { calculateRpn } from "../utils/helpers";
import { calculateEarnedPoints } from "../utils/calculatePoints";

const POINT_LABELS = {
  processMap: "Process Map",
  hazardAnalysis: "Hazard Analysis",
  fishbone: "Fishbone Diagram",
  fiveWhys: "5 Whys",
  fmeaPip: "FMEA PIP",
  rcaPip: "RCA PIP",
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const rowItem = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function WorkspaceSummary({ workspace, isLocked = {} }) {
  const hazardTotal = workspace.hazardAnalysis.reduce(
    (sum, row) => sum + calculateRpn(row),
    0
  );

  const earnedPoints = calculateEarnedPoints(workspace);

  const sections = [
    { label: "Process Map",      key: "processMap" },
    { label: "Hazard Analysis",  key: "hazardAnalysis" },
    { label: "FMEA PIP",         key: "fmeaPip" },
    { label: "Fishbone Diagram", key: "fishbone" },
    { label: "5 Whys",           key: "fiveWhys" },
    { label: "RCA PIP",          key: "rcaPip" },
  ];

  const submittedCount = sections.filter((s) => isLocked[s.key]).length;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      {/* Left: Submission preview */}
      <div className="glass-card p-4 sm:p-6 space-y-5">
        <div>
          <h3 className="font-display text-lg font-bold text-white">Submission Preview</h3>
          <p className="mt-1 text-sm text-slate-500">Track your deliverable completion status.</p>
        </div>

        {/* Quick stats */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Process map sections</p>
            <p className="mt-2 font-display text-3xl font-bold text-white">
              {workspace.processMap.sections.length}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Hazard total RPN</p>
            <p className={`mt-2 font-display text-3xl font-bold ${hazardTotal > 200 ? 'text-red-400' : hazardTotal > 100 ? 'text-amber-400' : 'text-white'}`}>
              {hazardTotal}
            </p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400 font-medium">Overall completion</span>
            <span className="font-display text-sm font-bold text-teal-bright">{submittedCount}/6</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(submittedCount / 6) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Section status table */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-xl border border-white/[0.07]"
        >
          <div className="hidden sm:grid grid-cols-2 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Deliverable</span>
            <span>Status</span>
          </div>

          {sections.map(({ label, key }, index, arr) => {
            const submitted = !!isLocked[key];
            return (
              <motion.div
                key={key}
                variants={rowItem}
                className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 ${
                  index !== arr.length - 1 ? "border-b border-white/[0.05]" : ""
                } hover:bg-white/[0.02] transition-colors`}
              >
                <span className="text-sm font-medium text-slate-300 min-w-0">{label}</span>
                <span>
                  {submitted ? (
                    <span className="badge badge-emerald">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Submitted
                    </span>
                  ) : (
                    <span className="badge badge-slate">Pending</span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Right: Gamification */}
      <div className="glass-card p-4 sm:p-6 space-y-5">
        <div>
          <h3 className="font-display text-lg font-bold text-white">Points Preview</h3>
          <p className="mt-1 text-sm text-slate-500">Points awarded upon submission of each section.</p>
        </div>

        <div className="space-y-2">
          {Object.entries(rubricPoints).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-sm font-medium text-slate-400">{POINT_LABELS[key] || key}</span>
              <span className="font-display text-sm font-bold text-teal-bright">{value} pts</span>
            </div>
          ))}
        </div>

        {/* Total earned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-xl bg-teal-gradient p-5"
        >
          <div className="absolute inset-0 opacity-20 bg-grid pointer-events-none" />
          <p className="relative text-xs font-semibold uppercase tracking-wider text-teal-bright/70 mb-1">
            Estimated earned
          </p>
          <p className="relative font-display text-4xl font-bold text-white">
            {earnedPoints}
            <span className="text-lg font-normal text-white/60 ml-1">pts</span>
          </p>
          {earnedPoints > 0 && (
            <p className="relative mt-1 text-xs text-white/60">Based on submitted sections</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
