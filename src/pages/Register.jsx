import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function Register() {
  const { org, setOrg, signIn } = useAppStore();
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole]   = useState("buyer"); // buyer or seller (others kept for demo)
  const nav = useNavigate();
  const from = useLocation().state?.from || "/";

  const create = (e) => {
    e?.preventDefault?.();
    const id = Date.now(); // simple unique id for demo
    const user = {
      id,
      name: name.trim() || "New User",
      email: email.trim() || undefined,
      role,
    };

    // Save to org + sign in
    setOrg({ ...org, users: [...org.users, user], currentUserId: id });
    if (typeof signIn === "function") signIn(id);

    // Go back where they started (home by default)
    nav(from, { replace: true });
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="text-sm text-gray-600">
        Create a demo account to start shopping, sending RFQs, or managing your products.
      </p>

      <form onSubmit={create} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email (optional)</label>
          <input
            type="email"
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Role</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            {/* Keep these if you still want to create staff/demo users */}
            <option value="approver">Approver</option>
            <option value="accounting">Accounting</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Create account
        </button>
      </form>
    </div>
  );
}
