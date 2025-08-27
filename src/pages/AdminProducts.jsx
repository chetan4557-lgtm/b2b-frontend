import { useAppStore } from "../context/AppStore";
import { useState } from "react";

export default function AdminProducts() {
  const { products, setProducts } = useAppStore();
  const blank = { name: "", description: "", hsn: "", moq: 1, cartonMultiple: 1, tiers: [{min:1,max:9,price:0}], leadDays: 1, image: "" };
  const [form, setForm] = useState(blank);

  const save = () => {
    if (!form.name) return alert("Name required");
    const id = Date.now();
    setProducts([...products, { ...form, id }]);
    setForm(blank);
  };

  const updateField = (i, key, val) => {
    const copy = { ...form, tiers: form.tiers.map((t, idx) => idx === i ? { ...t, [key]: val } : t) };
    setForm(copy);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Catalog Management</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <div className="font-semibold mb-2">Add Product</div>
          <input placeholder="Name" className="border rounded px-3 py-2 w-full mb-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <input placeholder="HSN" className="border rounded px-3 py-2 w-full mb-2" value={form.hsn} onChange={(e)=>setForm({...form,hsn:e.target.value})}/>
          <textarea placeholder="Description" className="border rounded px-3 py-2 w-full mb-2" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
          <input placeholder="Image URL / /images/xxx.jpg" className="border rounded px-3 py-2 w-full mb-2" value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})}/>
          <div className="flex gap-2 mb-2">
            <input type="number" placeholder="MOQ" className="border rounded px-3 py-2 w-full" value={form.moq} onChange={(e)=>setForm({...form,moq:Number(e.target.value)||1})}/>
            <input type="number" placeholder="Carton multiple" className="border rounded px-3 py-2 w-full" value={form.cartonMultiple} onChange={(e)=>setForm({...form,cartonMultiple:Number(e.target.value)||1})}/>
          </div>
          <input type="number" placeholder="Lead days" className="border rounded px-3 py-2 w-full mb-3" value={form.leadDays} onChange={(e)=>setForm({...form,leadDays:Number(e.target.value)||1})} />

          <div className="mb-2 font-semibold">Price Tiers</div>
          {form.tiers.map((t,i)=>(
            <div key={i} className="flex gap-2 mb-2">
              <input type="number" className="border rounded px-2 py-1 w-20" value={t.min} onChange={(e)=>updateField(i,"min",Number(e.target.value)||0)} />
              <input type="number" className="border rounded px-2 py-1 w-20" value={t.max} onChange={(e)=>updateField(i,"max",Number(e.target.value)||0)} />
              <input type="number" className="border rounded px-2 py-1 w-28" value={t.price} onChange={(e)=>updateField(i,"price",Number(e.target.value)||0)} />
            </div>
          ))}
          <button className="border rounded px-3 py-1 mr-2" onClick={()=>setForm({...form,tiers:[...form.tiers,{min:0,max:0,price:0}]})}>+ Tier</button>
          <button className="bg-blue-600 text-white rounded px-3 py-1" onClick={save}>Save Product</button>
        </div>

        <div className="border rounded p-4">
          <div className="font-semibold mb-2">Products ({products.length})</div>
          <div className="space-y-2">
            {products.map(p=>(
              <div key={p.id} className="border rounded p-2 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-600">MOQ {p.moq} • Carton {p.cartonMultiple} • Lead {p.leadDays}d</div>
                </div>
                <button className="text-red-600" onClick={()=>setProducts(products.filter(x=>x.id!==p.id))}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
