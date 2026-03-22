import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CaseCard from '../components/CaseCard';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { casesApi } from '../api/cases';
import { gamificationApi } from '../api/gamification';
import { scoringApi } from '../api/scoring';

const TOTAL_SECTIONS = 6;

export default function DashboardPage() {
  const { user, courseId } = useAuth();
  const [cases, setCases] = useState([]);
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

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="text-sm font-semibold text-slate-500">Welcome back</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">{user?.full_name}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          This platform enables structured analysis of operational and clinical incidents using FMEA
          and Root Cause Analysis methodologies. Review cases, map processes, identify hazards,
          calculate risk priority numbers, perform root cause investigations, and develop improvement
          plans.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/cases" className="btn-primary">Go to cases</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Role" value={user?.role || '—'} hint="Your platform access level" />
        <StatCard
          label="Total Points"
          value={loading ? '...' : totalPoints}
          hint={courseId ? 'Points earned this course' : 'No course assigned yet'}
        />
        <StatCard
          label="Sections Submitted"
          value={loading ? '...' : submissionCount}
          hint={`Out of ${cases.length * TOTAL_SECTIONS} total`}
        />
      </div>

      {badgeCount > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-slate-700">
            🏅 You have earned {badgeCount} badge{badgeCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div>
        <SectionTitle
          title="Active Cases"
          subtitle="Open a case to track your progress."
        />
        {loading ? (
          <p className="text-sm text-slate-500">Loading cases...</p>
        ) : cases.length === 0 ? (
          <p className="text-sm text-slate-500">No active cases yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((item) => (
              <CaseCard
                key={item.id}
                item={item}
                progress={Math.round((submissionCount / Math.max(cases.length * TOTAL_SECTIONS, 1)) * 100)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}