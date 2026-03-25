import { useEffect, useState } from "react";
import { scoringApi } from "../api/scoring";
import { submissionsApi } from "../api/submissions";
import { api } from "../api/client";
import { calculateRpn } from "../utils/helpers";

const SUBMISSION_TYPE_LABELS = {
  process_map: "Process Map",
  hazard_analysis: "Hazard Analysis",
  fmea_pip: "FMEA PIP",
  fishbone: "Fishbone",
  five_whys: "5 Whys",
  rca_pip: "RCA PIP",
};

function ProcessMapAnswer({ data }) {
  if (!data?.content?.sections?.length) return <Empty />;
  return (
    <div className="space-y-4">
      {data.content.sections.map((section, i) => (
        <div key={section.id || i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-200">
            {i + 1}. {section.title || <span className="text-slate-500 italic">Untitled</span>}
          </p>
          {section.shouldHappen && (
            <p className="text-xs text-slate-400"><span className="text-slate-500 font-medium">Should happen: </span>{section.shouldHappen}</p>
          )}
          {section.drift && (
            <p className="text-xs text-slate-400"><span className="text-slate-500 font-medium">Drift / risk: </span>{section.drift}</p>
          )}
          {section.tasks?.length > 0 && (
            <div className="mt-2 space-y-1 pl-3 border-l border-white/[0.06]">
              {section.tasks.map((task, ti) => (
                <div key={task.id || ti} className="text-xs text-slate-400">
                  <span className="text-slate-500 font-medium">Task {ti + 1}: </span>
                  {task.title || <span className="italic">Untitled</span>}
                  {task.shouldHappen && ` — ${task.shouldHappen}`}
                  {task.drift && <span className="text-amber-400/70"> · Risk: {task.drift}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HazardAnalysisAnswer({ data }) {
  const rows = Array.isArray(data?.rows) ? data.rows : (data?.rows?.rows || []);
  if (!rows.length) return <Empty />;
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="min-w-[700px] w-full text-xs text-left">
        <thead>
          <tr className="border-b border-white/[0.07]">
            {['Process', 'Subprocess', 'Failure Mode', 'Cause', 'Effect', 'O', 'D', 'S', 'RPN', 'Action'].map((h) => (
              <th key={h} className="px-2 py-2 text-slate-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rpn = calculateRpn(row);
            return (
              <tr key={row.id || i} className="border-t border-white/[0.05]">
                <td className="px-2 py-2 text-slate-300">{row.majorProcess || '—'}</td>
                <td className="px-2 py-2 text-slate-300">{row.subProcess || '—'}</td>
                <td className="px-2 py-2 text-slate-300">{row.failureMode || '—'}</td>
                <td className="px-2 py-2 text-slate-300">{row.failureCause || '—'}</td>
                <td className="px-2 py-2 text-slate-300">{row.failureEffect || '—'}</td>
                <td className="px-2 py-2 text-center text-slate-300">{row.occurrence}</td>
                <td className="px-2 py-2 text-center text-slate-300">{row.detection}</td>
                <td className="px-2 py-2 text-center text-slate-300">{row.severity}</td>
                <td className={`px-2 py-2 text-center font-bold ${rpn >= 200 ? 'text-red-400' : rpn >= 100 ? 'text-amber-400' : 'text-teal-bright'}`}>{rpn}</td>
                <td className="px-2 py-2 text-slate-300">{row.action || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PipAnswer({ data }) {
  const content = data?.content || {};
  const fields = [
    { label: 'Problem', key: 'problem' },
    { label: 'Rationale', key: 'rationale' },
    { label: 'Improvement Plan', key: 'plan' },
    { label: 'Resources', key: 'resources' },
    { label: 'Timeline', key: 'timeline' },
    { label: 'Measure of Success', key: 'successMeasure' },
  ];
  const hasContent = fields.some((f) => content[f.key]?.trim());
  if (!hasContent) return <Empty />;
  return (
    <div className="space-y-3">
      {fields.map(({ label, key }) =>
        content[key]?.trim() ? (
          <div key={key}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{content[key]}</p>
          </div>
        ) : null
      )}
    </div>
  );
}

function FishboneAnswer({ data }) {
  if (!data?.problem_statement) return <Empty />;
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Problem Statement</p>
        <p className="mt-1 text-sm text-slate-300">{data.problem_statement}</p>
      </div>
      {data.nodes?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Cause Nodes ({data.nodes.length})</p>
          <div className="space-y-1">
            {data.nodes.filter((n) => n.level === 'major').map((node) => (
              <div key={node.id} className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                <p className="text-xs font-semibold text-teal-bright">{node.label || <span className="italic text-slate-500">Unlabeled</span>}</p>
                <div className="mt-1 pl-3 border-l border-white/[0.06] space-y-0.5">
                  {data.nodes.filter((n) => n.parent_id === node.id).map((child) => (
                    <p key={child.id} className="text-xs text-slate-400">{child.label}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FiveWhysAnswer({ data }) {
  if (!data?.problem) return <Empty />;
  const iterations = Object.entries(data.iterations || {});
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Problem</p>
        <p className="mt-1 text-sm text-slate-300">{data.problem}</p>
      </div>
      {iterations.map(([key, val], i) => (
        <div key={key} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <p className="text-xs font-semibold text-slate-400">Why {i + 1}</p>
          {val.question && <p className="mt-1 text-xs text-slate-500 italic">{val.question}</p>}
          <p className="mt-1 text-sm text-slate-300">{val.answer || <span className="italic text-slate-600">No answer</span>}</p>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-slate-600 italic">No content submitted.</p>;
}

function AnswerPanel({ score }) {
  const [loading, setLoading] = useState(true);
  const [answerData, setAnswerData] = useState(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setFetchError('');
      try {
        let res = null;
        if (score.submission_type === 'process_map' && score.process_map_id) {
          res = await submissionsApi.getProcessMap(score.process_map_id);
        } else if (score.submission_type === 'hazard_analysis' && score.hazard_analysis_id) {
          res = await submissionsApi.getHazardAnalysis(score.hazard_analysis_id);
        } else if (score.submission_type === 'fmea_pip' && score.fmea_pip_id) {
          res = await submissionsApi.getFmeaPip(score.fmea_pip_id);
        } else if (score.submission_type === 'fishbone' && score.fishbone_id) {
          res = await submissionsApi.getFishbone(score.fishbone_id);
        } else if (score.submission_type === 'five_whys' && score.five_whys_id) {
          res = await submissionsApi.getFiveWhys(score.five_whys_id);
        } else if (score.submission_type === 'rca_pip' && score.rca_pip_id) {
          res = await submissionsApi.getRcaPip(score.rca_pip_id);
        }
        setAnswerData(res?.data || null);
      } catch (err) {
        setFetchError('Failed to load submission.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [score]);

  if (loading) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 animate-pulse">
        <div className="h-3 w-1/3 bg-white/[0.06] rounded mb-2" />
        <div className="h-3 w-full bg-white/[0.04] rounded mb-1" />
        <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
      </div>
    );
  }

  if (fetchError) {
    return <p className="text-xs text-red-400">{fetchError}</p>;
  }

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Student Submission</p>
      {score.submission_type === 'process_map' && <ProcessMapAnswer data={answerData} />}
      {score.submission_type === 'hazard_analysis' && <HazardAnalysisAnswer data={answerData} />}
      {(score.submission_type === 'fmea_pip' || score.submission_type === 'rca_pip') && <PipAnswer data={answerData} />}
      {score.submission_type === 'fishbone' && <FishboneAnswer data={answerData} />}
      {score.submission_type === 'five_whys' && <FiveWhysAnswer data={answerData} />}
    </div>
  );
}

export function SubmissionsTab() {
  const [scores, setScores] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ instructor_score: "", feedback: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([scoringApi.getAllScores(), api.get("/users/")])
      .then(([sRes, uRes]) => {
        setScores(sRes?.data || []);
        const map = {};
        (uRes?.data || []).forEach((u) => { map[u.id] = u.full_name; });
        setUsersMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (scoreId) => {
    if (!reviewForm.instructor_score) return;
    setSubmitting(true);
    try {
      await scoringApi.reviewScore(scoreId, {
        instructor_score: Number(reviewForm.instructor_score),
        feedback: reviewForm.feedback,
      });
      setScores((prev) =>
        prev.map((s) =>
          s.id === scoreId
            ? { ...s, instructor_score: Number(reviewForm.instructor_score), feedback: reviewForm.feedback }
            : s
        )
      );
      setReviewingId(null);
      setViewingId(null);
      setReviewForm({ instructor_score: "", feedback: "" });
      setMsg("Review submitted.");
    } catch (err) {
      setMsg(err.message || "Review failed.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const pending = scores.filter((s) => s.instructor_score === null || s.instructor_score === undefined);
  const reviewed = scores.filter((s) => s.instructor_score !== null && s.instructor_score !== undefined);

  if (loading) return <p className="text-sm text-slate-500">Loading submissions...</p>;

  const ScoreRow = ({ score }) => {
    const isReviewing = reviewingId === score.id;
    const isViewing = viewingId === score.id;
    const studentName = usersMap[score.user_id] || `User #${score.user_id}`;

    return (
      <div className="card space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-100">
              {SUBMISSION_TYPE_LABELS[score.submission_type] || score.submission_type}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">{studentName}</p>
            <p className="text-xs text-slate-500 mt-0.5">Course ID: {score.course_id}</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {score.instructor_score !== null && score.instructor_score !== undefined ? (
              <span className="badge badge-emerald">Scored: {score.instructor_score}</span>
            ) : (
              <span className="badge badge-amber">Pending</span>
            )}
          </div>
        </div>

        {score.feedback && (
          <p className="text-sm text-slate-400 italic">"{score.feedback}"</p>
        )}

        {/* View answer toggle */}
        <button
          onClick={() => setViewingId(isViewing ? null : score.id)}
          className="btn-secondary text-xs py-2 px-3"
        >
          {isViewing ? 'Hide Answer' : 'View Student Answer'}
        </button>

        {/* Answer panel */}
        {isViewing && <AnswerPanel score={score} />}

        {/* Review form */}
        {!isReviewing ? (
          <button
            onClick={() => {
              setReviewingId(score.id);
              setReviewForm({
                instructor_score: score.instructor_score ?? "",
                feedback: score.feedback ?? "",
              });
            }}
            className="btn-primary text-xs py-2 px-3"
          >
            {score.instructor_score !== null && score.instructor_score !== undefined ? 'Edit Review' : 'Grade'}
          </button>
        ) : (
          <div className="space-y-3 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Grade Submission</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Score (0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input"
                  value={reviewForm.instructor_score}
                  onChange={(e) => setReviewForm((p) => ({ ...p, instructor_score: e.target.value }))}
                  placeholder="e.g. 28"
                />
              </div>
              <div>
                <label className="label">Feedback</label>
                <input
                  className="input"
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
                  placeholder="Optional feedback for student"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReview(score.id)}
                disabled={submitting || !reviewForm.instructor_score}
                className="btn-primary"
              >
                {submitting ? "Submitting..." : "Submit Grade"}
              </button>
              <button onClick={() => setReviewingId(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium border ${
          msg.includes("fail") || msg.includes("Failed")
            ? "bg-red-500/10 text-red-400 border-red-500/20"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        }`}>
          {msg}
        </div>
      )}

      <div>
        <h2 className="section-title mb-3">Pending Review ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">All submissions have been reviewed.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => <ScoreRow key={s.id} score={s} />)}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Reviewed ({reviewed.length})</h2>
          <div className="space-y-3">
            {reviewed.map((s) => <ScoreRow key={s.id} score={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}