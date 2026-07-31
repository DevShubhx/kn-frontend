import React, { useState, useEffect } from 'react';


export default function AdminScreenBugControl() {
  const [bugs, setBugs] = useState([
    { bugId: 'SCREENBUG-1', isVisible: true, draftImage: 'cn_screenbug.png' },
    { bugId: 'SCREENBUG-2', isVisible: true, draftImage: 'toonami-logo.png' }
  ]); // 🎯 फॉलबैक स्टेट ताकि बॉक्स कभी खाली न दिखे
  const [syncMessage, setSyncMessage] = useState('');
 

  // 1. डेटाबेस से वर्तमान सेटिंग्स लेकर आना और खाली होने पर सुरक्षित संभालना
  const fetchBugSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/screen-bugs/live-settings');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBugs(data);
        }
      }
    } catch (err) { 
      console.error("🚨 Admin Fetch Failed, using local states:", err.message); 
    }
  };

  useEffect(() => { 
    fetchBugSettings(); 
  }, []);

  // चेकबॉक्स बदलने पर या टेक्स्ट टाइप करने पर डेटाबेस में तुरंत ड्राफ्ट सेव करना
  const handleLiveFieldChange = async (bugId, fieldsToUpdate) => {
    // लोकल स्टेट को तुरंत अपडेट करें ताकि टाइपिंग और क्लिकिंग तुरंत रिफ्लेक्ट हो
    setBugs(prev => prev.map(b => b.bugId === bugId ? { ...b, ...fieldsToUpdate } : b));

    // वर्तमान बग का पूरा डेटा निकालें
    const currentBugs = [...bugs];
    const targetBug = currentBugs.find(b => b.bugId === bugId);
    
    const isVisibleValue = fieldsToUpdate.isVisible !== undefined ? fieldsToUpdate.isVisible : targetBug.isVisible;
    const draftImageValue = fieldsToUpdate.draftImage !== undefined ? fieldsToUpdate.draftImage : targetBug.draftImage;

    try {
      await fetch('http://localhost:5000/api/screen-bugs/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bugId,
          isVisible: isVisibleValue,
          draftImage: draftImageValue
        })
      });
    } catch (err) { console.error(err); }
  };

  // PUSH बटन पर क्लिक करने पर ड्राफ्ट पाथ को लाइव स्क्रीन पर ऑन-एयर करना
  const handlePushToAir = async (bugId) => {
    try {
      const res = await fetch('http://localhost:5000/api/screen-bugs/push-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bugId })
      });
      if (res.ok) {
        setSyncMessage(`🚀 ${bugId} ON-AIR FRAME OVERRIDDEN SUCCESSFULLY!`);
        fetchBugSettings(); 
        setTimeout(() => setSyncMessage(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-white font-sans my-4 shadow-xl">
      <h3 className="text-xs font-black text-red-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
        🎛️ Broadcast Master Screen-Bug Module
      </h3>

      {syncMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-400 text-[11px] p-2 rounded mb-3 text-center font-mono font-bold animate-pulse">
          {syncMessage}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {bugs.map((bug) => (
          <div key={bug.bugId} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            
            {/* लेफ्ट: नाम और हाइड/शो चेकबॉक्स */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-black tracking-wide text-slate-300 w-28">{bug.bugId}:</span>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={bug.isVisible}
                  onChange={(e) => handleLiveFieldChange(bug.bugId, { isVisible: e.target.checked })}
                  className="w-4 h-4 rounded accent-red-600 bg-slate-900 border-slate-800 cursor-pointer"
                />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${bug.isVisible ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
                  {bug.isVisible ? "ON-AIR" : "MUTED"}
                </span>
              </label>
            </div>

            {/* राइट: इमेज ड्राफ्ट टाइपिंग और PUSH बटन */}
            <div className="flex items-center gap-2 w-full">
              <input 
                type="text"
                value={bug.draftImage || ''}
                onChange={(e) => handleLiveFieldChange(bug.bugId, { draftImage: e.target.value })}
                placeholder="Image file name (e.g. logo.png)"
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 w-full font-mono shadow-inner"
              />
              
              <button
                onClick={() => handlePushToAir(bug.bugId)}
                className="bg-red-600 hover:bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded shadow-md border border-black active:scale-95 transition-all duration-150 cursor-pointer"
              >
                PUSH
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
