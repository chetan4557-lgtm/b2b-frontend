import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppStore } from "../context/AppStore";
import { useState } from "react";

export default function Login() {
  const { org, signIn } = useAppStore();
  const [userId, setUserId] = useState(org.currentUserId || org.users?.[0]?.id || "");
  const nav = useNavigate();
  const from = useLocation().state?.from || "/";

  const onSubmit = (e) => {
    e.preventDefault();
    if (!userId) return;
    signIn(userId);
    nav(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="text-sm text-gray-600">
        This demo uses local users from your Company settings.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">Select user</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
        >
          {org.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded">
          Continue
        </button>
      </form>

      <div className="text-sm">
        New here?{" "}
        <Link to="/register" className="underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
