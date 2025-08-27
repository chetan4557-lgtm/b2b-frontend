import { useAppStore } from "../context/AppStore";

export default function Company() {
  const { org, setOrg } = useAppStore();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Company Account</h1>

      <div className="border rounded p-4 mb-4">
        <div className="font-semibold mb-2">Organization</div>
        <input
          value={org.name}
          onChange={(e)=>setOrg({ ...org, name: e.target.value })}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div className="border rounded p-4 mb-4">
        <div className="font-semibold mb-2">Current User / Role</div>
        <select
          value={org.currentUserId}
          onChange={(e)=>setOrg({ ...org, currentUserId: Number(e.target.value) })}
          className="border rounded px-3 py-2"
        >
          {org.users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
        </select>
      </div>

      <div className="border rounded p-4 mb-4">
        <div className="font-semibold mb-2">Approval Limit (₹)</div>
        <input
          type="number"
          value={org.approvalLimit}
          onChange={(e)=>setOrg({ ...org, approvalLimit: Number(e.target.value) || 0 })}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="border rounded p-4">
        <div className="font-semibold mb-2">Default Net Terms</div>
        <select
          value={org.netTerms}
          onChange={(e)=>setOrg({ ...org, netTerms: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option>Net-30</option>
          <option>Net-45</option>
          <option>Net-60</option>
        </select>
      </div>
    </div>
  );
}
