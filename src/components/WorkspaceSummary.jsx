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

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Submission Preview</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Process map sections</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {workspace.processMap.sections.length}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Hazard total RPN</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{hazardTotal}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700">
            <span>Deliverable</span>
            <span>Status</span>
          </div>

          {sections.map(({ label, key }, index, arr) => {
            const submitted = !!isLocked[key];
            return (
              <div
                key={key}
                className={`grid grid-cols-2 items-center px-6 py-5 text-base ${
                  index !== arr.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <span className="font-medium text-slate-700">{label}</span>
                <span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      submitted
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {submitted ? "Submitted" : "Not submitted"}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900">Gamification Preview</h3>
        <p className="mt-1 text-sm text-slate-600">
          Points awarded upon submission of each section.
        </p>
        <div className="mt-4 space-y-3">
          {Object.entries(rubricPoints).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-700">{POINT_LABELS[key] || key}</span>
              <span className="font-semibold text-slate-900">{value} pts</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
          <p className="text-sm text-slate-300">Estimated earned points</p>
          <p className="mt-1 text-3xl font-bold">{earnedPoints}</p>
        </div>
      </div>
    </div>
  );
}