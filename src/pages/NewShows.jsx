// src/pages/NewShows.jsx - Complete Ultimate Edition
import React, { useEffect, useState, useCallback } from 'react';
import HeaderBannerImage from '/assets/images/header_01.png'; // 🔒 सुरक्षित लोकल हेडर 
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const CONFIG = { BACKEND_BASE_URL: 'https://kn-backend-e3sa.onrender.com' };

export default function NewShows() {
  const navigate = useNavigate(); 
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCardsXHR = useCallback(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${CONFIG.BACKEND_BASE_URL}/api/new-shows/all?_cb=${Date.now()}`, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    xhr.onload = function () {
      if (xhr.status === 200) {
        try { setCards(JSON.parse(xhr.responseText)); } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    xhr.onerror = function () { setLoading(false); };
    xhr.send();
  }, []);

  useEffect(() => { fetchCardsXHR(); }, [fetchCardsXHR]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1d71cb] text-white">
        
        <h2 className="text-xl font-black uppercase tracking-widest animate-pulse font-mono">⏳ SYNCING NEW SHOWS CATALOG...</h2>

      </div>
      
    );
  }

  return (
    <div className="bg-[#ff5952] min-h-screen w-full flex flex-col items-center justify-start pb-24 text-white font-sans overflow-x-hidden">

      {/* 🎪 FIRST COMPONENT: HEADER LOGO IMAGE COVER AREA */}
      <div className="w-auto bg-[#ff5952] overflow-hidden mt-2">

        <button
          onClick={() => navigate('/')}
          className="bg-[#2629367e] hover:bg-zinc-700 text-white py-2 px-4 md:px-6 rounded transition-colors"
        > ⬅ Back</button>

        <img src={HeaderBannerImage} alt="New Shows Broadcast Banner" className="w-3xl h-auto block pointer-events-none object-contain" />
        
        <Link
          to="/weekly-schedule"
          className="w-35 max-w-xs md:w-40 md:absolute md:right-71 md:top-1 shrink-0 p-4 flex flex-col items-center justify-center z-30 mx-auto mt-1 md:mt-0 cursor-pointer transition-transform transform hover:scale-[1.03] active:scale-95 group"
        >
          <img
            src="/assets/images/scdul_btn.png"
            alt="Schedule_Btn"
            className="w-full h-auto pointer-events-auto object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[2px_2px_0px_rgba(0,0,0,0.6)] transition-all"
          />
        </Link>
      </div>

      {/* 🎪 SECOND COMPONENT: HIGH-ACCURACY ASYMMETRIC CARDS GRID */}
      <div className="w-full max-w-8xl ml-0 mx-auto px-2 grid grid-cols-1 md:w-190 md:grid-cols-1 justify-items-center md:ml-15 md:mx-0 pb-2">
        {cards.map((card) => (
          <div key={card._id} className="w-full bg-[#de2429] text-[#fff7c6] border-8 p-2 border-[#ff5952] rounded-none flex flex-col justify-start">

            {/* 🎯 1. CARD HEADER BAR: Left text with optional left side icon image */}
            <div className="w-full flex items-center gap-2 border-b-2 border-black pb-1 mb-2 relative">
              {card.headerIconUrl && (
                <img
                  src={card.headerIconUrl}
                  alt="icon"
                  // 🔒 LOCKED POP-OUT LOGIC:
                  // -absolute: इमेज को बार के फ्लो से बाहर निकालकर स्वतंत्र लेयर बनाना।
                  // --left-2.5 -top-3: इमेज को कड़ाई से 8-10 पिक्सल बाईं और ऊपर की ओर बाहर धकेलना (Pop-out)।
                  // -bg-transparent: बॉक्स को अदृश्य रखना ताकि केवल असली कैरेक्टर / आइकॉन ही बाहर दिखे।
                  // -drop-shadow: 3D पॉप प्रभाव को और कड़क बनाने के लिए हल्का रेट्रो शैडो।
                  className="absolute -left-2.5 -top-6 w-24 h-16 object-contain pointer-events-none shrink-0 bg-transparent z-40 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                />
              )}
              {/* 🎯 TEXT OFFSET ACCURACY: 
      -pl-14 यह पक्का करता है कि जब आइकॉन बाईं ओर पॉप-आउट हो, तो टेक्स्ट और इमेज आपस में कभी क्लैश न हों */}
              <h2 className={`text-lg uppercase font-powerhouse font-bold truncate ${card.headerIconUrl ? 'pl-24' : 'pl-0'}`}>
                {card.headerText}
              </h2>
            </div>

            {/* 🎯 2. CARD BODY LAYOUT: Description with a small 1:1 image at top right corner */}
            <div className="w-full flex flex-row justify-between items-start gap-2">
              {/* Description Paragraph on Left */}
              <p className="text-xs md:text-sm font-sterling font-medium text-white leading-relaxed grow text-left">
                {card.description}
              </p>

              {/* Small 1:1 Aspect Ratio Square Image on Top Right Corner */}
              <div className="w-40 h-30 shrink-0 border-none bg-slate-200">
                <img src={card.thumbnailUrl} alt="show-thumb" className="w-full h-full object-cover pointer-events-none" />
              </div>
            </div>

          </div>
        ))}
      </div>

      {
        cards.length === 0 && (
          <div className="bg-black text-center p-8 border-6 border-white shadow-[12px_12px_0px_#000000] w-full max-w-md mx-auto mt-12 font-mono">
            <h3 className="text-[#fff200] text-xl font-black uppercase">🎬 BULLETIN BOARD EMPTY</h3>
            <p className="text-slate-400 text-xs mt-2 font-sans">No show matrices have been published yet by the station master.</p>
          </div>
        )
      }

      <div className="w-full max-w-xs md:w-80 md:absolute md:right-2 md:top-28 shrink-0 p-4 flex flex-col items-center justify-center z-10 mx-auto mt-10 md:mt-0">
        <img
          src="/assets/images/sd_gang.svg"
          alt="Cartoon Network SD Gang Asset"
          className="w-full h-auto block pointer-events-none object-contain"
        />
      </div>

    </div >
  );

}
