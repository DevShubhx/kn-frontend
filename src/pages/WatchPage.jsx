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

        {/* HTML5 ACTIVE THEATER VIDEO DECK SANDBOX */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 relative flex items-center justify-center mb-8">
          {streamUrl ? (
            (() => {
              // 🎯 ZERO MANIPULATION: पिक्सड्रैन के ऑफिशियल लिंक को सीधे क्लीन एम्बेड मोड में कन्वर्ट करना
              let cleanEmbedUrl = streamUrl.trim();

              // यदि डेटाबेस में पुराना /api/file/ वाला लिंक बचा हो, तो उसे भी ऑटो-हैंडल करना
              if (cleanEmbedUrl.includes('/api/file/')) {
                cleanEmbedUrl = cleanEmbedUrl.replace('/api/file/', '/u/');
              }

              // अंत में ऑफिशियल एम्बेड पैरामीटर जोड़ना ताकि पिक्सड्रैन का वेब लेआउट ब्लॉक न हो
              if (!cleanEmbedUrl.includes('?embed')) {
                cleanEmbedUrl = `${cleanEmbedUrl}?embed`;
              }

              return (
                /* 🔒 SAFE EMBED GUARD: आईफ्रेम ही पिक्सड्रैन के /u/ वाले पूरे लिंक को वेबपेज समेत रेंडर कर सकता है 
                   यह पुराना क्रैश होने वाला वीडियो टैग नहीं है, इसलिए ब्राउज़र इसे कभी ब्लॉक नहीं कर पाएगा! */
                <iframe 
                  src={cleanEmbedUrl}
                  title={`${showTitle} - Episode ${episodeNumber}`}
                  className="w-full h-full border-0 absolute inset-0 bg-black"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
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
            ✨ Streaming smoothly in High Definition. If the video fails to buffer or loops endlessly, please double check your server connection loops or notify site admin handlers.
          </p>
        </div>

      </main>
    </div>
  );
}
