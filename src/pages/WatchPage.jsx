import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function WatchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. EXTRACT DATA PARAMETERS FROM URL STRINGS
  const showTitle = searchParams.get('show') || 'Cartoon Title';
  const episodeNumber = searchParams.get('ep') || '1';
  const episodeTitle = searchParams.get('title') || 'Episode Track';
  const streamUrl = searchParams.get('stream') || '';

  return (
    <div className="w-full min-h-screen bg-[#6699cc] text-white font-eagle pb-16 flex flex-col items-center">
      
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

        {/* 📺 INTERACTIVE MEDIA DISPLAY CANVAS (SECURED FOR AD-REVENUE) */}
<div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 relative flex items-center justify-center mb-8 group select-none">
  {streamUrl ? (
    (() => {
      let cleanMegaEmbedUrl = streamUrl.trim();

      // ऑटो-कन्वर्टर: यदि मोंगोडीबी की streamUrl फ़ील्ड में मेगा का /file/ लिंक आता है, तो उसे /embed/ में बदलना
      if (cleanMegaEmbedUrl.includes('mega.nz/file/')) {
        cleanMegaEmbedUrl = cleanMegaEmbedUrl.replace('mega.nz/file/', 'mega.nz/embed/');
      }

      return (
        <div className="w-full h-full relative">
          
          {/* 🔒 SECURITY OVERLAY BLOCK A: टॉप-राइट कॉर्नर मास्क (मेगा के शेयर और क्लाउड लिंक्स को ब्लॉक करने के लिए) */}
          <div className="absolute top-0 right-0 w-[150px] h-[60px] bg-transparent z-40 pointer-events-auto cursor-default" 
               title="Streaming Secured" 
               onClick={(e) => e.stopPropagation()} 
          />

          {/* 🔒 SECURITY OVERLAY BLOCK C: टॉप-लेफ्ट कॉर्नर मास्क (मेगा के लोगो और फ़ाइल नाम पर क्लिक रोकने के लिए) */}
          <div className="absolute top-0 left-0 w-[100%] h-[60px] bg-transparent z-40 pointer-events-auto cursor-default" 
               onClick={(e) => e.stopPropagation()} 
          />

          {/* 🎬 मुख्य मेगा एम्बेड आईफ्रेम */}
          <iframe 
            src={cleanMegaEmbedUrl}
            title={`${showTitle} - Episode ${episodeNumber}`}
            className="w-full h-full border-0 absolute inset-0 bg-black z-10"
            allow="autoplay; fullscreen"
            allowFullScreen
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


        {/* HELPFUL GUEST WATCH FOOTER TIP BAR */}
        <div className="w-full max-w-xl bg-slate-900/40 border border-white/5 p-4 rounded-xl text-center">
          <p className="text-xs text-blue-100 font-light leading-relaxed">
            ✨ Streaming smoothly in High Definition via secure end-to-end encrypted Mega server nodes.
          </p>
        </div>

      </main>
    </div>
  );
}
