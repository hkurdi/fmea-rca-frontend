import { useEffect, useState } from "react";
import { scoringApi } from "../api/scoring";
import { api } from "../api/client";

export function SubmissionsTab() {
  const [scores, setScores] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    instructor_score: "",
    feedback: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const SUBMISSION_TYPE_LABELS = {
    process_map: "Process Map",
    hazard_analysis: "Hazard Analysis",
    fmea_pip: "FMEA PIP",
    fishbone: "Fishbone",
    five_whys: "5 Whys",
    rca_pip: "RCA PIP",
  };

  useEffect(() => {
    Promise.all([scoringApi.getAllScores(), api.get("/users/")])
      .then(([sRes, uRes]) => {
        setScores(sRes?.data || []);
        const map = {};
        (uRes?.data || []).forEach((u) => {
          map[u.id] = u.full_name;
        });
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
            ? {
                ...s,
                instructor_score: Number(reviewForm.instructor_score),
                feedback: reviewForm.feedback,
              }
            : s,
        ),
      );
      setReviewingId(null);
      setReviewForm({ instructor_score: "", feedback: "" });
      setMsg("Review submitted.");
    } catch (err) {
      setMsg(err.message || "Review failed.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const pending = scores.filter(
    (s) => s.instructor_score === null || s.instructor_score === undefined,
  );
  const reviewed = scores.filter(
    (s) => s.instructor_score !== null && s.instructor_score !== undefined,
  );

  if (loading)
    return <p className="text-sm text-slate-500">Loading submissions...</p>;

  const ScoreRow = ({ score }) => {
    const isReviewing = reviewingId === score.id;
    const studentName = usersMap[score.user_id] || `User #${score.user_id}`;
    return (
      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-100">
              {SUBMISSION_TYPE_LABELS[score.submission_type] ||
                score.submission_type}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">{studentName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Course ID: {score.course_id}
            </p>
          </div>
          <div className="shrink-0">
            {score.instructor_score !== null &&
            score.instructor_score !== undefined ? (
              <span className="badge badge-emerald">
                Scored: {score.instructor_score}
              </span>
            ) : (
              <span className="badge badge-amber">Pending</span>
            )}
          </div>
        </div>
        {score.feedback && (
          <p className="text-sm text-slate-400 italic">"{score.feedback}"</p>
        )}
        {!isReviewing ? (
          <button
            onClick={() => {
              setReviewingId(score.id);
              setReviewForm({
                instructor_score: score.instructor_score ?? "",
                feedback: score.feedback ?? "",
              });
            }}
            className="btn-secondary text-sm"
          >
            {score.instructor_score !== null &&
            score.instructor_score !== undefined
              ? "Edit Review"
              : "Review"}
          </button>
        ) : (
          <div className="space-y-3 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Score (0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input"
                  value={reviewForm.instructor_score}
                  onChange={(e) =>
                    setReviewForm((p) => ({
                      ...p,
                      instructor_score: e.target.value,
                    }))
                  }
                  placeholder="e.g. 28"
                />
              </div>
              <div>
                <label className="label">Feedback</label>
                <input
                  className="input"
                  value={reviewForm.feedback}
                  onChange={(e) =>
                    setReviewForm((p) => ({ ...p, feedback: e.target.value }))
                  }
                  placeholder="Optional feedback"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReview(score.id)}
                disabled={submitting || !reviewForm.instructor_score}
                className="btn-primary"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                onClick={() => setReviewingId(null)}
                className="btn-secondary"
              >
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
        <div
          className={`rounded-xl px-4 py-2.5 text-sm font-medium border ${msg.includes("fail") || msg.includes("Failed") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
        >
          {msg}
        </div>
      )}
      <div>
        <h2 className="section-title mb-3">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">
            All submissions have been reviewed.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => (
              <ScoreRow key={s.id} score={s} />
            ))}
          </div>
        )}
      </div>
      {reviewed.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Reviewed ({reviewed.length})</h2>
          <div className="space-y-3">
            {reviewed.map((s) => (
              <ScoreRow key={s.id} score={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
