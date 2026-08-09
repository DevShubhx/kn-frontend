// src/pages/Schedule.jsx - Retro 7-Day Cable Grid Edition
import React, { useEffect, useState, useCallback, useMemo } from 'react';

const CONFIG = {
  BACKEND_BASE_URL: 'https://kn-backend-e3sa.onrender.com',
  REFRESH_INTERVAL_MS: 15000
};

export default function Schedule() {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🎯 SELECTED DAY TIMELINE STATE: डिफ़ॉल्ट रूप से आज की तारीख सिलेक्ट रहेगी
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const fetchTimelineXHR = useCallback(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${CONFIG.BACKEND_BASE_URL}/api/weekly-schedule/timeline?_cb=${Date.now()}`, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    xhr.onload = function () {
      if (xhr.status === 200) {
        try { setTimeline(JSON.parse(xhr.responseText)); } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    xhr.onerror = function () { setLoading(false); };
    xhr.send();
  }, []);

  useEffect(() => {
    fetchTimelineXHR();
    const interval = setInterval(fetchTimelineXHR, CONFIG.REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchTimelineXHR]);

  // 🎯 GENERATE 7 DAYS HORIZONTAL DATA TABS GRID (आज से लेकर आने वाले 7 दिन)
  const sevenDaysTabs = useMemo(() => {
    const tabs = [];
    const baseDate = timeline?.serverTimeMs ? new Date(timeline.serverTimeMs) : new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000));
      tabs.push({
        dayName: d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase(),
        dateLabel: d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getDate().toString().padStart(2, '0'),
        rawString: d.toDateString() // तुलना लॉगिंग के लिए
      });
    }
    return tabs;
  }, [timeline?.serverTimeMs]);

  // 🎯 FILTER CARDS FOR THE SPECIFIC SELECTED SUNDAY/WEEKDAY SLOT
  const filteredDaySchedule = useMemo(() => {
    if (!timeline?.fullSchedule || sevenDaysTabs.length === 0) return [];
    const targetDayString = sevenDaysTabs[selectedDayIndex].rawString;

    return timeline.fullSchedule.filter(slot => {
      return new Date(slot.startTime).toDateString() === targetDayString;
    });
  }, [timeline?.fullSchedule, sevenDaysTabs, selectedDayIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1d71cb] text-white">
        <h2 className="text-xl font-black uppercase tracking-widest animate-pulse font-mono">⏳ LOADING...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-auto w-full flex flex-col items-center justify-start py-8 px-4 select-none text-white font-sans bg-[linear-gradient(to_bottom,#ffdb0e_25%,#ff1403_60%,#165eac_75%,#000000_85%)] bg-scroll">

      {/* 🎪 TITLE ENGINE BLOCK */}
      <div className="text-center mb-2 max-w-190 w-full">
        <img src="src/assets/images/schdul-banner.png"
          alt="schedule-banner"
          className="w-full h-auto" />
      </div>

      {/* 🎪 FIRST COMPONENT: DYNAMIC HORIZONTAL 7-DAYS DATE BAR MODULE */}
      {/* यह आपकी भेजी गई विंटेज इमेज के रेड हेडर रो को एक 100% कड़क रिस्पॉन्सिव क्लिकेबल ग्रिड में बदल देता है */}
      <div className="w-full max-w-4xl bg-[#800000] border-4 border-black rounded-t-xl mb-1 grid grid-cols-4 sm:grid-cols-7 divide-x-2 sm:divide-x-4 divide-black border-collapse">
        {sevenDaysTabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={`p-3 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${selectedDayIndex === idx
              ? 'bg-[#fff200] text-black font-black scale-102 z-10 border-4 rounded-2xl border-black'
              : 'bg-[#800000] text-slate-200 hover:bg-[#954535] hover:text-[#ffbf00]'
              }`}
          >
            <span className="text-[16px] font-black tracking-widest">{tab.dayName}</span>
            <span className="text-sm font-black mt-0.5 font-mono">{tab.dateLabel}</span>
          </button>
        ))}
      </div>

      {/* 🎪 SECOND COMPONENT: THE VINTAGE 2005 CABLE GRID GUIDE LAYOUT */}
      <div className="w-full max-w-4xl bg-[#cfcfc4] text-black border-6 border-black overflow-hidden">

        {/* GUIDES STATIC LABELS SLEEVE */}
        <div className="w-full bg-black text-[#fff200] grid grid-cols-4 p-3 font-black text-xs uppercase tracking-wider font-mono border-b-6 border-black text-left">
          <div className="pl-2">TIME</div>
          <div className="col-span-2">SHOW</div>
          <div className="text-center">DURATION</div>
        </div>

        {/* TIMELINE SLOTS LOOP TRACK */}
        <div className="flex flex-col bg-white">
          {filteredDaySchedule.map((slot, index) => {
            const slotDate = new Date(slot.startTime);
            const timeLabel = slotDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
            const isRowLive = timeline?.nowPlaying?._id === slot._id;

            // 🎯 IMAGE COMPLIANCE LOGIC: प्रोग्रामिंग ब्लॉक चेंज होने पर हेडिंग रो इंजेक्ट करना (Toonami / Power Zone)
            const showBlockHeader = slot.programmingBlock && (index === 0 || filteredDaySchedule[index - 1].programmingBlock !== slot.programmingBlock);

            return (
              <React.Fragment key={slot._id}>
                {/* 🎪 TOONAMI / HALF TICKET EXPRESS INTERFACE INSERTION CONTAINER */}
                {showBlockHeader && (
                  <div className="w-full bg-[#94a3b8]/30 text-black border-y-4 border-black py-2.5 font-black text-md tracking-widest uppercase font-powerhouse text-center bg-linear-to-r from-slate-200 via-slate-300 to-slate-200 [text-shadow:1px_1px_0px_rgba(255,255,255,0.8)]">
                    {slot.programmingBlock}
                  </div>
                )}

                {/* MAIN GRID TIME SLOT ROW */}
                <div className={`grid grid-cols-4 p-4 text-left items-center border-b-4 border-black last:border-b-0 font-mono transition-colors ${isRowLive ? 'bg-green-100 font-bold' : 'bg-white'}`}>
                  {/* Time Badge (Left) */}
                  <div className="text-xs sm:text-sm font-black pl-2 text-red-700">
                    {timeLabel}
                  </div>

                  {/* Cartoon Show Name (Center Block) */}
                  <div className="col-span-2 flex flex-col justify-center">
                    <h4 className={`text-sm sm:text-base font-black font-sterling uppercase truncate tracking-tight ${isRowLive ? 'text-green-700' : 'text-black'}`}>
                      {slot.showName}
                    </h4>
                  </div>

                  {/* Duration Capsule (Right) */}
                  <div className="text-center text-xs font-black text-slate-700">
                    <span className="bg-slate-100 border border-black px-3 py-1 rounded-none shadow-[2px_2px_0px_#000]">
                      {slot.durationInMinutes} MINS
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* यदि चुने गए विशिष्ट दिन की लिस्ट खाली हो */}
        {filteredDaySchedule.length === 0 && (
          <div className="w-full text-center p-16 bg-white font-mono">
            <h4 className="text-red-600 text-base font-black uppercase">🎬 CHANNEL INTERMISSION</h4>
            <p className="text-slate-500 text-xs mt-2 font-sans">No cartoon slots have been registered for this selected date label yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
