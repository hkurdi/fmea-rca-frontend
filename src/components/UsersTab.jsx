import { useEffect, useState } from "react";
import { api } from "../api/client";

export function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleUpdates, setRoleUpdates] = useState({});
  const [msgs, setMsgs] = useState({});

  const ROLE_BADGE = {
    admin: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    instructor: "badge-teal",
    student: "badge-slate",
  };

  useEffect(() => {
    api
      .get("/users/")
      .then((res) => setUsers(res?.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role?role=${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      setMsgs((p) => ({ ...p, [userId]: "Role updated." }));
    } catch (err) {
      setMsgs((p) => ({ ...p, [userId]: err.message || "Failed." }));
    }
    setTimeout(() => setMsgs((p) => ({ ...p, [userId]: "" })), 3000);
  };

  if (loading)
    return <p className="text-sm text-slate-500">Loading users...</p>;

  return (
    <div className="space-y-6">
      <h2 className="section-title">All Users ({users.length})</h2>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="card space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-100">{u.full_name}</p>
                <p className="text-sm text-slate-400 mt-0.5">{u.email}</p>
                <p className="text-sm text-slate-400 mt-0.5">
                  <b>User ID:</b> {u.id}
                </p>
              </div>
              <span
                className={`badge capitalize shrink-0 ${ROLE_BADGE[u.role] || ROLE_BADGE.student}`}
              >
                {u.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="input max-w-44"
                value={roleUpdates[u.id] ?? u.role}
                onChange={(e) =>
                  setRoleUpdates((p) => ({ ...p, [u.id]: e.target.value }))
                }
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() =>
                  handleRoleChange(u.id, roleUpdates[u.id] ?? u.role)
                }
                className="btn-primary"
              >
                Save
              </button>
              {msgs[u.id] && (
                <span
                  className={`text-xs font-medium ${msgs[u.id].includes("fail") || msgs[u.id].includes("Failed") ? "text-red-400" : "text-emerald-400"}`}
                >
                  {msgs[u.id]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
