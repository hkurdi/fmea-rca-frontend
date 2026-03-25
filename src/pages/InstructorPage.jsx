import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CoursesTab } from "../components/CoursesTab";
import { TeamsTab } from "../components/TeamsTab";
import { SubmissionsTab } from "../components/SubmissionsTab";
import { UsersTab } from "../components/UsersTab";

const TABS = [
  { key: "courses", label: "Courses" },
  { key: "teams", label: "Teams" },
  { key: "submissions", label: "Submissions" },
  { key: "users", label: "Users", adminOnly: true },
];

export default function InstructorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");

  if (user?.role !== "instructor" && user?.role !== "admin") {
    return (
      <div className="card">
        <p className="text-sm text-slate-500">
          Access restricted to instructors.
        </p>
      </div>
    );
  }

  const visibleTabs = TABS.filter(
    (t) => !t.adminOnly || user?.role === "admin",
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="font-display text-2xl font-bold text-slate-100">
          Instructor Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage courses, teams, and review student submissions.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full gap-1 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-1.5">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-teal text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "courses" && <CoursesTab />}
      {activeTab === "teams" && <TeamsTab />}
      {activeTab === "submissions" && <SubmissionsTab />}
      {activeTab === "users" && <UsersTab />}
    </div>
  );
}
