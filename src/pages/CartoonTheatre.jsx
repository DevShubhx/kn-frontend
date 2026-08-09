// src/pages/CartoonTheatre.jsx - The Perfect Interlocking 50% Scroll Engine
import React, { useEffect, useState, useCallback } from 'react';

// 🔒 SECURE LOCAL ASSET INTEGRATION
import TheatreLogoImage from '/assets/images/cn_theatre_top.svg';

const CONFIG = {
  BACKEND_BASE_URL: 'https://kn-backend-e3sa.onrender.com',
  REFRESH_INTERVAL_MS: 15000
};

export default function CartoonTheatre() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🎯 HIGH-PRECISION ANTI-CACHE XHR ENGINE
  const fetchTheatreScheduleXHR = useCallback(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${CONFIG.BACKEND_BASE_URL}/api/theatre/schedule?_cb=${Date.now()}`, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Expires', '-1');
    
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (Array.isArray(data)) {
            setMovies(data);
          }
        } catch (e) {
          console.error("🎪 Theatre JSON Parsing Fault:", e);
        }
      }
      setLoading(false);
    };
    xhr.onerror = function () { setLoading(false); };
    xhr.send();
  }, []);

  useEffect(() => {
    fetchTheatreScheduleXHR();
    const interval = setInterval(fetchTheatreScheduleXHR, CONFIG.REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchTheatreScheduleXHR]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1d71cb] text-white">
        <h2 className="text-xl font-black uppercase tracking-widest animate-pulse font-sans">
          ⏳ BOOTING NOSTALGIC CARTOON INTERLOCK ENGINE...
        </h2>
      </div>
    );
  }

  return (
    // 🎨 EXACT MATCH: क्लासिक CN पावरहाउस स्काई-ब्लू थीम बैकग्राउंड
    <div className=" bg-linear-to-b from-[#2e50d9] from-10% via-[#100e29] via-20% to-[#080714] to-90% w-auto min-h-screen text-white select-none selection:bg-black selection:text-white relative">
      
      {/* 🎪 THE MASTER INTERLOCKING WRAPPER CONTEXT */}
      {/* दोनों एलिमेंट्स अब एक ही मास्टर ब्लॉक में बंद हैं, जिससे ब्राउज़र का स्टिकी ट्रैक कभी नहीं टूटेगा */}
      <div className="relative w-auto max-w-5xl mx-auto flex flex-col justify-start min-h-[250vh]">
        
        {/* CONTAINER 1: THE STICKY LOGO MODULE */}
        {/* यह लोगो इमेज को स्क्रीन के बिल्कुल टॉप पर कड़ाई से लॉक (Hold) रखेगा */}
        <div className="relative top-0 z-10 w-auto overflow-auto">
          <img 
            src={TheatreLogoImage} 
            alt="Classic Cartoon Theatre Master Head" 
            className="w-full h-auto block pointer-events-none"
          />
        </div>

         {/* CONTAINER 2: THE INTERLOCKING CARDS SLAT PLANE */}
        {/* 🎯 THE PURE MATHEMATICAL SCROLL INTERLOCKING (100% REALITY DRIVEN):
            - relative z-30 इसे इमेज के ऊपर स्लाइड होने की अभेद्य शक्ति देता है।
            - mt-0 यह सुनिश्चित करता है कि पहला कार्ड बिल्कुल लोगो के निचले किनारे से चिपककर (Snap) शुरू हो।
            - जैसे ही यूजर स्क्रॉल करेगा, कार्ड्स ऊपर उठेंगे। जब वे इमेज को ठीक 50% कवर कर लेंगे, 
              ब्राउज़र की नेटिव लेयर इस पूरे ब्लॉक को एक साथ ऊपर की तरफ पुश आउट (Release) कर देगी */}
        <div className="absolute z-30 w-full mt-30 sm:mt-75 pt-0 px-6 flex flex-col gap-5  ">
          
          {/* मोंगोडीबी से आने वाले 4 रविवारों के हॉरिजॉन्टल कार्ड्स */}
          {movies.map((movie) => {
            const dateLabel = new Date(movie.telecastDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric'
            });

            return (
              <div 
                key={movie._id} 
                className="w-full bg-[#00a7f5] text-black border-5 mt- border-[#00a7f5] rounded-2xl filter drop-shadow-[0_0_16px_rgba(0,322,255,1)] flex flex-col sm:flex-row overflow-hidden min-h-55"
              >
                
                {/* LEFT BLOCK: HORIZONTAL VIDEO POSTER PANEL */}
                <div className="relative w-full sm:w-[35%] min-w-60 h-48 sm:h-auto bg-amber-400 border-b-6 sm:border-b-0 sm:border-r-6 rounded-2xl border-[#00a7f5] overflow-hidden">
                  <img 
                    src={movie.templateImageUrl || 'https://placeholder.com'} 
                    alt={movie.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                </div>

                {/* RIGHT BLOCK: DETAILED CONTENT PANEL */}
                <div className="p-6 flex flex-col justify-between grow bg-gray-900">
                  <div>
                    {/* Movie Title with Heavy Comic Outline Underline */}
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#00eeff] border-b-4 border-black pb-2 mb-3 leading-tight font-powerhouseera">
                      {movie.title}
                    </h2>
                    
                    {/* Telecast Precision Schedule Flags */}
                    <div className="flex gap-3 mb-4">
                      <span className="bg-[#006eff] text-[#fffc5b] px-3 py-1 text-xs font-black font-mono tracking-wide rounded-2xl filter drop-shadow-[0_0_5px_rgba(0,222,255,1)] uppercase">
                        📅 {dateLabel}
                      </span>
                      <span className="bg-[#ff0000] text-[#edf6fa] border-2 border-black px-3 py-1 text-xs font-black font-mono tracking-wide rounded-none uppercase">
                        ⏰ {movie.telecastTime}
                      </span>
                    </div>

                    {/* Synopsis Description Text */}
                    <p className="font-sterling text-[#00a7f5] text-sm font-medium leading-relaxed">
                      {movie.synopsis}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <img src="/src/assets/images/audience.png" alt="Audience"
                 className='relative w-full' />


          {/* यदि मोंगोडीबी का थिएटर कलेक्शन खाली हो तो फॉलबैक बॉक्स */}
          {movies.length === 0 && (
            <div className="w-full bg-black text-center p-10 border-6 border-white shadow-[12px_12px_0px_#000000] max-w-xl mx-auto my-12">
              <h3 className="text-[#fff200] text-2xl font-black uppercase tracking-wider mb-2">
                🎬 THEATRE BOX OFFICE EMPTY
              </h3>
              <p className="font-sans text-slate-400 text-sm font-medium leading-relaxed">
                The Sunday Movie Schedule blocks are currently being synchronized by the master station clock. Check back shortly for the listings!
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
