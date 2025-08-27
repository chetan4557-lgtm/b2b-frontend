import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useAppStore } from "../context/AppStore";

export default function Lists() {
  const { cart, addToCart } = useContext(CartContext);
  const { lists, setLists } = useAppStore();
  const [name, setName] = useState("");

  const saveCurrent = () => {
    if (!name) return alert("Enter a name");
    setLists([...lists, { id: Date.now(), name, items: cart }]);
    setName("");
    alert("Saved!");
  };

  const reorder = (l) => {
    l.items.forEach(i => addToCart({ id: i.id }, i.qty)); // price handled later
    alert("Items loaded into cart");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Saved Lists</h1>

      <div className="border rounded p-4 mb-6">
        <div className="font-semibold mb-2">Save current cart</div>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g., Monthly reorder" className="border rounded px-3 py-2 mr-2" />
        <button onClick={saveCurrent} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>

      <div className="space-y-3">
        {lists.map(l => (
          <div key={l.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{l.name}</div>
              <div className="text-sm text-gray-600">{l.items.length} items</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={()=>reorder(l)}>Reorder</button>
              <button className="px-3 py-1 rounded border text-red-600" onClick={()=>setLists(lists.filter(x=>x.id!==l.id))}>Delete</button>
            </div>
          </div>
        ))}
        {lists.length === 0 && <div>No lists yet.</div>}
      </div>
    </div>
  );
}
