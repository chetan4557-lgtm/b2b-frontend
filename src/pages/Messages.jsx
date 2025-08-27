import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function Messages() {
  const { messages, setMessages, rfqs, orders } = useAppStore();
  const [ctx, setCtx] = useState({ type: "RFQ", id: rfqs[0]?.id });
  const [text, setText] = useState("");

  const threads = [
    ...rfqs.map(r=>({ label:`RFQ #${r.id}`, type:"RFQ", id:r.id })),
    ...orders.map(o=>({ label:`Order #${o.id}`, type:"ORDER", id:o.id })),
  ];

  const currentKey = `${ctx.type}:${ctx.id}`;
  const currentMsgs = messages[currentKey] || [];

  const send = () => {
    if (!text) return;
    const entry = { by: "You", text, at: new Date().toISOString() };
    setMessages({ ...messages, [currentKey]: [...currentMsgs, entry] });
    setText("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <select
        className="border rounded px-3 py-2 mb-4"
        value={currentKey}
        onChange={(e)=>{
          const [type,id] = e.target.value.split(":");
          setCtx({ type, id: Number(id) });
        }}
      >
        {threads.map(t => <option key={`${t.type}:${t.id}`} value={`${t.type}:${t.id}`}>{t.label}</option>)}
      </select>

      <div className="border rounded p-3 h-64 overflow-auto mb-3 bg-white">
        {currentMsgs.length === 0 && <div className="text-gray-500">No messages yet.</div>}
        {currentMsgs.map((m,i)=>(
          <div key={i} className="mb-2">
            <div className="text-xs text-gray-500">{m.by} • {new Date(m.at).toLocaleString()}</div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={text} onChange={(e)=>setText(e.target.value)} className="border rounded px-3 py-2 w-full" placeholder="Type a message..." />
        <button onClick={send} className="bg-blue-600 text-white px-4 rounded">Send</button>
      </div>
    </div>
  );
}
