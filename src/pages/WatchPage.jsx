import React, { useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function WatchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const playerContainerRef = useRef(null); // 🎯 वीडियो कंटेनर को ट्रैक करने के लिए हुक

  // 1. EXTRACT DATA PARAMETERS FROM URL STRINGS
  const showTitle = searchParams.get('show') || 'Cartoon Title';
  const episodeNumber = searchParams.get('ep') || '1';
  const episodeTitle = searchParams.get('title') || 'Episode Track';
  const streamUrl = searchParams.get('stream') || '';

  // 🎯 कस्टमाइज्ड फुल-स्क्रीन ट्रिगर: यह सुरक्षा परतों के साथ पूरे प्लेयर को फुल-स्क्रीन पर ले जाएगा!
  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen context: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#6699cc] text-white font-eagle pb-16 flex flex-col items-center select-none">
      
      {/* 🗺️ MINIMAL BRAND HEADER NAVBAR */}
      <header className="w-full bg-slate-900/80 backdrop-blur-md px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div onClick={() => navigate('/')} className="text-xl font-bold tracking-wide cursor-pointer text-red-500 hover:text-red-400">
          Kartoon<span className="text-white hover:text-blue-400">Network</span>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors uppercase font-bold tracking-wider"
        >
          ⬅️ Back to Directory
        </button>
      </header>

      {/* 📺 INTERACTIVE MEDIA DISPLAY CANVAS */}
      <main className="w-full max-w-4xl px-4 mt-8 flex flex-col items-center">
        
        {/* Title Text Labels Header Blocks */}
        <div className="w-full text-center mb-6">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 drop-shadow-sm uppercase tracking-wide">
            {showTitle}
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-red-500 uppercase tracking-widest mt-1">
            Episode {episodeNumber} — <span className="text-white normal-case font-medium">{episodeTitle}</span>
          </h2>
        </div>

        {/* 🎬 मुख्य वीडियो कंटेनर (सुरक्षित फ्रेम) */}
        <div 
          ref={playerContainerRef} 
          className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-black relative flex items-center justify-center group"
        >
          {streamUrl ? (
            (() => {
              let cleanMegaEmbedUrl = streamUrl.trim();
              if (cleanMegaEmbedUrl.includes('mega.nz/file/')) {
                cleanMegaEmbedUrl = cleanMegaEmbedUrl.replace('mega.nz/file/', 'mega.nz/embed/');
              }

              return (
                <div className="w-full h-full relative">
                  
                  {/* 🔒 सुरक्षा परत A: टॉप-राइट कॉर्नर मास्क */}
                  <div className="absolute top-0 right-0 w-40 h-16.25 bg-transparent z-40 pointer-events-auto cursor-default" 
                       onClick={(e) => e.stopPropagation()} 
                  />

                  {/* 🔒 TRAPPED OVERLAY C: टॉप-लेफ्ट कॉर्नर मास्क */}
                  <div className="absolute top-0 left-0 w-full h-16.25 bg-transparent z-40 pointer-events-auto cursor-default" 
                       onClick={(e) => e.stopPropagation()} 
                  />

                  {/* मुख्य मेगा आईफ्रेम (🚨 महत्वपूर्ण: allowfullscreen को हटा दिया गया है ताकि मेगा का डिफ़ॉल्ट बटन लॉक हो जाए) */}
                  <iframe 
                    src={cleanMegaEmbedUrl}
                    title={`${showTitle} - Episode ${episodeNumber}`}
                    className="w-full h-full border-0 absolute inset-0 bg-black z-10"
                    allow="autoplay"
                    loading="lazy"
                  />
                  
                </div>
              );
            })()
          ) : (
            <div className="text-center p-6 text-slate-500 italic text-sm">
              ⚠️ Core stream video track payload missing. Unable to initialize media player framework.
            </div>
          )}
        </div>

        {/* 📺 CUSTOM REVENUE-SECURED FULL SCREEN CONTROL BUTTON */}
        {streamUrl && (
          <button
            onClick={handleToggleFullscreen}
            className="mt-4 bg-yellow-300 hover:bg-red-600 text-black font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 uppercase tracking-wide text-xs border border-white/10"
          >
            📺 Go Full Screen Mode
          </button>
        )}

        {/* HELPFUL GUEST WATCH FOOTER TIP BAR */}
        <div className="w-full max-w-xl bg-slate-900/40 border border-white/5 p-4 rounded-xl text-center mt-6">
          <p className="text-xs text-blue-100 font-light leading-relaxed">
            ✨ Streaming smoothly in High Definition. Use the 'Go Full Screen' button above for an immersive experience.
          </p>
        </div>

      </main>
    </div>
  );
}
