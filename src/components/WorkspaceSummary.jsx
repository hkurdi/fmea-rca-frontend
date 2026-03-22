import { rubricPoints } from "../data/mockData";
import { calculateRpn } from "../utils/helpers";
import { calculateEarnedPoints } from "../utils/calculatePoints";

export default function WorkspaceSummary({ workspace }) {
  const hazardTotal = workspace.hazardAnalysis.reduce(
    (sum, row) => sum + calculateRpn(row),
    0
  );

  const earnedPoints = calculateEarnedPoints(workspace);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Submission Preview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Process map sections</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {workspace.processMap.sections.length}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Hazard total RPN</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {hazardTotal}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700">
            <span>Deliverable</span>
            <span>Status</span>
          </div>

          {[
            [
              "Process map",
              workspace.processMap.sections.some((item) => item.title.trim()),
            ],
            [
              "Hazard analysis",
              workspace.hazardAnalysis.some((row) => row.failureMode.trim()),
            ],
            ["FMEA PIP", workspace.fmeaPip.problem.trim()],
            ["Fishbone", workspace.fishbone.problemStatement.trim()],
            ["5 Whys", workspace.fiveWhys.problem.trim()],
            ["RCA PIP", workspace.rcaPip.problem.trim()],
          ].map(([label, ready], index, arr) => (
            <div
              key={label}
              className={`grid grid-cols-2 items-center px-6 py-5 text-base ${
                index !== arr.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <span className="font-medium text-slate-700">{label}</span>

              <span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                    ready
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {ready ? "Completed" : "Not started"}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900">
          Gamification Preview
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Points mirror the backend README weights for each submission type.
        </p>
        <div className="mt-4 space-y-3">
          {Object.entries(rubricPoints).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-700">{key}</span>
              <span className="font-semibold text-slate-900">{value}</span>
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
