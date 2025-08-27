import { useAppStore } from "../context/AppStore";
import { useState } from "react";

export default function AddressBook() {
  const { addresses, setAddresses } = useAppStore();
  const [form, setForm] = useState({ name:"", line1:"", city:"", state:"KA", pincode:"560001" });

  const save = () => {
    const id = Date.now();
    setAddresses([...addresses, { ...form, id }]);
    setForm({ name:"", line1:"", city:"", state:"KA", pincode:"560001" });
  };

  const eta = (pincode) => {
    // mock: KA (56xxxx) = 2 days, otherwise 5 days
    return String(pincode).startsWith("56") ? 2 : 5;
    // could also factor in product leadDays at order time
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Address Book</h1>

      <div className="border rounded p-4 mb-6">
        <div className="font-semibold mb-2">Add Address</div>
        <div className="grid md:grid-cols-2 gap-2">
          <input placeholder="Name" className="border rounded px-3 py-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <input placeholder="Line 1" className="border rounded px-3 py-2" value={form.line1} onChange={(e)=>setForm({...form,line1:e.target.value})}/>
          <input placeholder="City" className="border rounded px-3 py-2" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})}/>
          <input placeholder="State (e.g. KA)" className="border rounded px-3 py-2" value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})}/>
          <input placeholder="Pincode" className="border rounded px-3 py-2" value={form.pincode} onChange={(e)=>setForm({...form,pincode:e.target.value})}/>
        </div>
        <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded" onClick={save}>Save</button>
      </div>

      <div className="space-y-2">
        {addresses.map(a=>(
          <div key={a.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{a.name}</div>
              <div className="text-sm text-gray-600">{a.line1}, {a.city}, {a.state} — {a.pincode}</div>
              <div className="text-xs text-gray-500">ETA estimate: {eta(a.pincode)} days</div>
            </div>
            <button className="text-red-600" onClick={()=>setAddresses(addresses.filter(x=>x.id!==a.id))}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
