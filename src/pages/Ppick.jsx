// src/pages/Ppick.jsx - Complete Interactive Polling Framework Edition
import React, { useEffect, useState, useCallback } from 'react';

// 🔒 SECURE LOCAL ASSET INTEGRATION (No External Injection Hooks)
import ImageOne from '/assets/images/compick.svg';
import ImageTwo from '/assets/images/pp.svg';

const CONFIG = {
  BACKEND_BASE_URL: 'https://kn-backend-e3sa.onrender.com'
};

export default function InteractiveGallery() {
  const [pollData, setPollData] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasVoted, setVotedState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🎯 XHR RESULTS FEED ENGINE: रीयल-टाइम वोट प्रतिशत खींचने के लिए
  const fetchPollResultsXHR = useCallback(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${CONFIG.BACKEND_BASE_URL}/api/poll/results?_cb=${Date.now()}`, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          setPollData(data);
        } catch (e) {
          console.error("Poll Data Parse Rupture:", e);
        }
      }
    };
    xhr.send();
  }, []);

  useEffect(() => {
    fetchPollResultsXHR();
  }, [fetchPollResultsXHR]);

  // 🎯 VOTE SUBMISSION HANDLER ENGINE
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedOption) {
      setErrorMessage('Please select one of the shows.');
      return;
    }

    try {
      const activeUserToken = localStorage.getItem('token') || localStorage.getItem('adminToken') || '';
      
      const response = await fetch(`${CONFIG.BACKEND_BASE_URL}/api/poll/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeUserToken}`
        },
        body: JSON.stringify({ optionId: selectedOption })
      });

      const resData = await response.json();

      if (!response.ok) {
        // यदि यूजर पहले ही वोट दे चुका है
        if (response.status === 400 && resData.message.includes('already cast')) {
          setVotedState(true);
          fetchPollResultsXHR();
        }
        throw new Error(resData.message || 'Voting processing terminal rejected request.');
      }

      setSuccessMessage('VOTE SUCCESSFUL! RESULTS UNLOCKED.');
      setVotedState(true);
      fetchPollResultsXHR(); // तुरंत ताज़ा बार्स की चौड़ाई अपडेट करने के लिए
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    // 🎨 EXACT MATCH: आपकी कस्टमाइज्ड पिच ब्लैक बैकग्राउंड थीम
    <div className="bg-[#000000] min-h-lvw w-full flex flex-col items-center justify-start select-none selection:bg-black selection:text-white relative overflow-x-hidden">
      
      {/* 🎪 MASTER CONTAINER CONTAINER: 100% ACCURATE TO YOUR GEOMETRIC LAYOUT */}
      <div className="w-full max-w-3xl flex flex-col gap-8 md:gap-0 md:block md:relative md:h-137.5 items-center">

        {/* ---------------------------------------------------------------------- */}
        {/* 💻 LAYER 1: DESKTOP DISPLAY STRUCTURE (md:screen+)                    */}
        {/* ---------------------------------------------------------------------- */}
        <div className="hidden md:block">
          {/* IMAGE TWO (img-2) - बेस एसेट लेयर (z-10) */}
          <div className="absolute w-180 align-top z-10">
            <img src={ImageTwo} alt="Grid Beta Desktop" className="w-full h-auto block pointer-events-none" />
          </div>

          {/* IMAGE ONE (img-1) - ओवरले फ्लोटिंग लेयर (z-20) */}
          <div className="absolute left-[37%] top-39 w-120 z-20">
            <img src={ImageOne} alt="Grid Alpha Desktop" className="w-full h-auto block pointer-events-none" />
            
            {/* 🎯 DESKTOP FLOATING POLL OVERLAY MATRIX: इमेज के ठीक ऊपर एम्बेड किया गया कड़क पोलिंग बॉक्स */}
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 py-4 mt-38 text-white font-mono">
              <h3 className="text-sm font-black text-[#fff200] tracking-wider mb-3 uppercase border-b-2 border-[#fff200] pb-1">
                ⚡ PICK YOUR FAVOURITE SHOW
              </h3>
              
              <form onSubmit={handleVoteSubmit} className="w-full flex flex-col">
                {pollData?.options?.map((opt) => (
                  <div key={opt._id} className="flex flex-col w-full p-1">
                    <label className="flex items-center ml-24 gap-3 cursor-pointer text-[16px] font-bold uppercase text-white">
                      <input 
                        type="radio" 
                        name="desktop-poll-show"
                        value={opt._id}
                        checked={selectedOption === opt._id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        disabled={hasVoted}
                        className="w-3 h-3 accent-[#ff0000] cursor-pointer"
                      />
                      <span>{opt.showName}</span>
                    </label>
                    
                    {/* 📊 HORIZONTAL PROGRESS BAR MATRIX (नंबर छिपे रहेंगे) */}
                    <div className="w-65 ml-24 bg-white h-3 mt-1.5 border border-black overflow-hidden relative">
                      <div 
                        // 🔒 HIGHLIGHT LOGIC: सबसे ज्यादा वोट वाले शो का बार चमकदार हरे (bg-green-500) में बदल जाएगा
                        className={`h-full transition-all duration-1000 ${opt.voteStatus === 'winner' ? 'bg-green-500' : 'bg-red-700'}`}
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {!hasVoted && (
                  <button type="submit" className="w-50 ml-38 bg-[#ff91ed] text-black font-powerhouse font-bold text-[20px] tracking-widest uppercase p-2 border-4 border-black rounded-3xl mt-9 hover:bg-fuchsia-500 cursor-pointer ">
                    SUBMIT VOTE
                  </button>
                )}
              </form>
              {successMessage && <p className="text-[10px] text-green-400 font-bold mt-2 animate-pulse">✅ {successMessage}</p>}
              {errorMessage && <p className="bg-yellow-50 text-[9px] text-red-500 font-bold mt-2">⚠️ {errorMessage.substring(0,40)}</p>}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* 📱 LAYER 2: MOBILE INTERACTIVE DISPLAY STRUCTURE (< md:screen)          */}
        {/* ---------------------------------------------------------------------- */}
        <div className="flex flex-col gap-6 w-auto mt-1 mb-78 max-w-auto md:hidden">
          {/* IMAGE TWO (img-2) - मोबाइल पर सबसे ऊपर (Upside) */}
          <div className="w-full">
            <img src={ImageTwo} alt="Grid Beta Mobile" className="w-auto h-auto block pointer-events-none" />
          </div>

          {/* IMAGE ONE (img-1) - मोबाइल पर इसके ठीक नीचे (Under it) */}
          <div className="w-full relative mb-12">
            <img src={ImageOne} alt="Grid Alpha Mobile" className="w-auto h-auto block pointer-events-none" />
            
            {/* 🎯 MOBILE OVERLAY POLL BOX */}
            <div className="absolute inset-0 flex flex-col justify-center items-center px-4 py-3 text-white font-mono">
              <h3 className="text-xs font-black text-[#fff200] tracking-wider mt-28 uppercase">
                ⚡ PICK YOUR SHOW
              </h3>
              
              <form onSubmit={handleVoteSubmit} className="w-full flex flex-col mt-2 gap-2">
                {pollData?.options?.map((opt) => (
                  <div key={opt._id} className="flex flex-col w-60 ml-16 p-1.">
                    <label className="flex items-center gap-2 cursor-pointer text-[18px] font-bold uppercase text-white">
                      <input 
                        type="radio" 
                        name="mobile-poll-show"
                        value={opt._id}
                        checked={selectedOption === opt._id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        disabled={hasVoted}
                        className="w-3 h-3 accent-[#ff0000]"
                      />
                      <span>{opt.showName}</span>
                    </label>
                    <div className="w-full bg-white h-4 mt-1 border border-black overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${opt.voteStatus === 'winner' ? 'bg-green-500' : 'bg-red-700'}`}
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {!hasVoted && (
                  <button type="submit" className="w-50 ml-22 bg-[#ff87f9] text-black font-powerhouse font-bold text-[16px] tracking-widest uppercase p-2 border-4 rounded-2xl border-black mt-4">
                    SUBMIT VOTE
                  </button>
                )}
              </form>
              {successMessage && <p className="text-[9px] text-green-400 font-bold mt-1">✅ {successMessage}</p>}
              {errorMessage && <p className="bg-yellow-50 text-[9px] text-red-400 font-bold mt-1">⚠️ {errorMessage.substring(0,30)}</p>}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
