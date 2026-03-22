import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CaseCard from '../components/CaseCard';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { casesApi } from '../api/cases';
import { gamificationApi } from '../api/gamification';
import { scoringApi } from '../api/scoring';

const TOTAL_SECTIONS = 6;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-3 overflow-hidden">
      <div className="h-4 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
      <div className="h-3 w-full rounded-lg bg-white/[0.04] animate-pulse" />
      <div className="h-3 w-2/3 rounded-lg bg-white/[0.04] animate-pulse" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, courses, courseId, setCourseId } = useAuth();
  const [cases, setCases] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const casesRes = await casesApi.getAll().catch(() => null);
        const fetchedCases = casesRes?.data || [];
        setCases(fetchedCases);

        const map = {};
        await Promise.all(
          fetchedCases.map(async (c) => {
            const prog = await casesApi.getCaseProgress(c.id).catch(() => null);
            map[c.id] = prog?.data?.percent ?? 0;
          })
        );
        setProgressMap(map);

        if (courseId) {
          const pointsRes = await gamificationApi.getMyPoints(courseId).catch(() => null);
          const badgesRes = await gamificationApi.getMyBadges().catch(() => null);
          const pts = pointsRes?.data || [];
          setTotalPoints(pts.reduce((sum, p) => sum + (p.amount || 0), 0));
          setBadgeCount((badgesRes?.data || []).length);
        }

        if (user?.id) {
          const scoresRes = await scoringApi.getUserScores(user.id).catch(() => null);
          setSubmissionCount((scoresRes?.data || []).length);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, courseId]);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass-card overflow-hidden"
      >
        <div className="h-1 w-full bg-teal-gradient" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-2">Welcome back</p>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Hello, {firstName} 👋
              </h2>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                This platform enables structured analysis of operational and clinical incidents using{' '}
                <span className="text-teal font-medium">FMEA</span> and{' '}
                <span className="text-teal font-medium">Root Cause Analysis</span> methodologies.
                Review cases, map processes, identify hazards, calculate risk priority numbers, and
                develop evidence-based improvement plans.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/cases" className="btn-primary">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    View all cases
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Quick stats pills */}
            <div className="flex sm:flex-col gap-2 flex-wrap sm:flex-nowrap sm:items-end">
              {[
                { label: 'FMEA', color: 'text-teal-bright' },
                { label: 'RCA', color: 'text-sky-400' },
                { label: 'PIP', color: 'text-violet-400' },
              ].map((tag) => (
                <span key={tag.label} className={`rounded-xl bg-white/[0.05] border border-white/[0.07] px-3 py-1.5 text-xs font-bold ${tag.color}`}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course selector */}
      {courses.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="glass-card p-5"
        >
          <label className="label text-xs uppercase tracking-wider">Active course</label>
          <select
            className="input mt-1 max-w-sm"
            value={courseId || ''}
            onChange={(e) => setCourseId(Number(e.target.value))}
          >
            <option value="" disabled>Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        <motion.div variants={item}>
          <StatCard
            label="Role"
            value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || '—'}
            hint="Your platform access level"
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Total Points"
            value={loading ? '—' : totalPoints}
            hint={courseId ? 'Points earned this course' : 'No course selected'}
            accent
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Sections Submitted"
            value={loading ? '—' : submissionCount}
            hint={`Out of ${cases.length * TOTAL_SECTIONS} total`}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
        </motion.div>
      </motion.div>

      {/* Badges */}
      {badgeCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-card border-teal/20 p-4"
        >
          <p className="text-sm font-medium text-teal flex items-center gap-2">
            <span className="text-xl">🏅</span>
            You have earned{' '}
            <span className="font-bold text-teal-bright">{badgeCount}</span>{' '}
            badge{badgeCount !== 1 ? 's' : ''} — keep it up!
          </p>
        </motion.div>
      )}

      {/* No course warning */}
      {!courseId && courses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400 flex items-start gap-3"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          No courses available yet. Ask your instructor to create a course before submitting sections.
        </motion.div>
      )}

      {/* Cases grid */}
      <div>
        <SectionTitle
          title="Active Cases"
          subtitle="Open a case to track your progress per section."
          action={
            cases.length > 0 && (
              <Link to="/cases" className="text-xs text-teal hover:text-teal-bright transition-colors font-medium">
                View all →
              </Link>
            )
          }
        />
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((k) => <SkeletonCard key={k} />)}
          </div>
        ) : cases.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-slate-600">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No active cases assigned yet.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid gap-4 lg:grid-cols-2"
          >
            {cases.map((c) => (
              <motion.div key={c.id} variants={item}>
                <CaseCard item={c} progress={progressMap[c.id] ?? 0} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
