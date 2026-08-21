import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const CONFIG = {
  BACKEND_BASE_URL: 'https://kn-backend-e3sa.onrender.com',
  POLL_INTERVAL_MS: 1000,
  REFRESH_INTERVAL_MS: 120000
};

export default function LiveTVPage() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const videoRef = useRef(null); // Will bind to iframe structure
  const fullScreenContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const closeTimerRef = useRef(null);

  // कोर डेटा स्टेट्स
  const [schedule, setSchedule] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [serverClientOffset, setServerClientOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileClose, setShowMobileClose] = useState(false);
  // 🎯 रेवेन्यू सुरक्षा स्टेट: डिफ़ॉल्ट रूप से TRUE (बफ़रिंग के दौरान स्ट्रिप्स दिखेंगी)
  const [isStrippingActive, setIsStrippingActive] = useState(true);


  // 🔊 लाइव स्ट्रीम के लिए डायनेमिक म्यूट/अनम्यूट स्टेट मैनेजमेंट
  const [isMuted, setIsMuted] = useState(true);
  // 🎯 मिनिमाइज़ बटन की विज़िबिलिटी स्टेट (शुरुआत में फ़ुलस्क्रीन होते ही यह TRUE रहेगी)
  const [showMinimizeBtn, setShowMinimizeBtn] = useState(false);
  const minimizeTimerRef = useRef(null); // टाइमर को ट्रैक करने के लिए हुक


  // चैट, स्क्रीनबग और एडमिन एनालिटिक्स स्टेट्स
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [chatUser, setChatUser] = useState({ username: 'Guest Toon', email: 'guest@mail.com' });
  const [timeLeft, setTimeLeft] = useState('');
  const [isChatActiveEarly, setIsChatActiveEarly] = useState(false);
  const [liveWatchers, setLiveWatchers] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const [bugSettings, setBugSettings] = useState([
    { bugId: 'SCREENBUG-1', isVisible: true, liveImage: 'cn_screenbug.png' },
    { bugId: 'SCREENBUG-2', isVisible: true, liveImage: 'toonami-logo.png' }
  ]);

  // 🎯 सुरक्षा गार्ड: यदि कोई बिना लॉगिन किए सीधे यूआरएल टाइप करके आए
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // 🎯 असली यूज़रनेम और एडमिन रोल डिटेक्शन फिक्स
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const userRole = localStorage.getItem('role');
    const savedEmail = localStorage.getItem('email') || (localStorage.getItem('token') ? 'member@mail.com' : 'guest@mail.com');

    if (savedUsername) {
      setChatUser({ username: savedUsername, email: savedEmail });
    }
    if (userRole === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // 📡 XHR टाइमटेबल फेचर (बैकएंड डेटा सिंक)
  const fetchLiveScheduleXHR = useCallback(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${CONFIG.BACKEND_BASE_URL}/api/live-tv/live-timetable`, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const clientTimeMs = Date.now();
          setServerClientOffset((data.serverTimeMs || Date.now()) - clientTimeMs);
          if (Array.isArray(data.schedule)) setSchedule(data.schedule);
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    };
    xhr.send();
  }, []);

  useEffect(() => {
    fetchLiveScheduleXHR();
    const refreshInterval = setInterval(fetchLiveScheduleXHR, CONFIG.REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshInterval);
  }, [fetchLiveScheduleXHR]);

  // 📡 🌟 मास्टर सॉकेट इंजन (रीयल-टाइम लिसनर्स और एब्सोल्यूट क्लीनअप फिक्स)
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(CONFIG.BACKEND_BASE_URL, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3
      });
    }

    const socketInstance = socketRef.current;

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`${CONFIG.BACKEND_BASE_URL}/api/chat/history`);
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
      } catch (err) { console.error(err); }
    };
    fetchChatHistory();

    socketInstance.on('live_watchers_update', (data) => {
      setLiveWatchers(data.count);
    });

    socketInstance.on('receive_message', (newMessage) => {
      setChatMessages((prev) => [...prev, newMessage]);
    });

    socketInstance.on('chat_error', (errorMsg) => {
      alert(errorMsg);
    });

    return () => {
      if (socketInstance) {
        socketInstance.off('live_watchers_update');
        socketInstance.off('receive_message');
        socketInstance.off('chat_error');
        socketInstance.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // ⏱️ स्यूडो-लाइव इंजन + ऑफ़-एयर काउंटडाउन + 15 मिनट प्री-शो चैट एक्टिवेशन (TARGETED PRODUCTION PATCH)
  useEffect(() => {
    if (schedule.length === 0) {
      setCurrentVideo(null);
      setTimeLeft('OFF-AIR');
      setIsChatActiveEarly(false);
      return;
    }

  
    const liveTimer = setInterval(() => {
      // 🎯 FIXED HIGH ACCURACY: Render क्लाउड सर्वर और Vercel के बीच के 5:30 घंटे के टाइमज़ोन गैप को जड़ से खत्म करना
      const localNow = new Date();
      // ब्राउज़र की लोकल घड़ी से उसका टाइमज़ोन ऑफ़सेट (मिनटों में) निकालकर उसे सीधे एब्सोल्यूट UTC मिलिसेकंड में लॉक करना
      const utcNowMs = localNow.getTime() + (localNow.getTimezoneOffset() * 60000);

      // 🔒 IST EMBED MATRIX: भारत का मानक समय UTC से कड़ाई से 5 घंटे 30 मिनट आगे (+5.5 * 3,600,000 ms) है
      // यह 'correctedNowMs' अब दुनिया के किसी भी कोने, वीपीएन या सर्वर पर हो, हमेशा कड़ाई से शुद्ध भारतीय मानक समय के अनुसार ही टिक करेगा
      const correctedNowMs = utcNowMs + (5.5 * 3600000) + serverClientOffset;

      let targetShow = null;
      const nextUpcomingShow = schedule.find(s => new Date(s.liveStartTime).getTime() > correctedNowMs);

      for (let i = 0; i < schedule.length; i++) {
        const show = schedule[i];
        const startTimeMs = new Date(show.liveStartTime).getTime();
        const endTimeMs = startTimeMs + (show.durationInSeconds * 1000);

        if (correctedNowMs >= startTimeMs && correctedNowMs < endTimeMs) {
          targetShow = show;
          break;
        }
      }

      if (!targetShow && nextUpcomingShow) {
        const diffMs = new Date(nextUpcomingShow.liveStartTime).getTime() - correctedNowMs;

        if (diffMs <= 15 * 60 * 1000) {
          setIsChatActiveEarly(true);
        } else {
          setIsChatActiveEarly(false);
        }

        const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
        const mins = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const secs = String(Math.floor((diffMs % (1000 * 60)) / 1000)).padStart(2, '0');
        setTimeLeft(`${hours}:${mins}:${secs}`);
      } else {
        setTimeLeft('');
        if (targetShow) setIsChatActiveEarly(true);
      }

      if (targetShow) {
        // Kick.com Live Integration: Stream URL allocation is handled by custom iframe injection engine
        setCurrentVideo(targetShow);
      } else {
        setCurrentVideo(null);
      }
    }, CONFIG.POLL_INTERVAL_MS);

    return () => clearInterval(liveTimer);
  }, [schedule, serverClientOffset]);


  // 🎛️ मास्टर स्क्रीनबग पोलिंग लेयर (Engineered with Cache-Buster & Anti-Cache Policy)
  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    const pollBugSettingsSafely = async () => {
      try {
        // 🎯 CRITICAL FIX: यूआरएल के अंत में डायनेमिक टाइमस्टैम्प (?_=${Date.now()}) जोड़ा गया है
        // यह ब्राउज़र को 304 Cache को बाईपास करके सीधे सर्वर से 200 OK लाने पर मजबूर करेगा
        const res = await fetch(`${CONFIG.BACKEND_BASE_URL}/api/screen-bugs/live-settings?_=${Date.now()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) setBugSettings(data);
        }
      } catch (err) {
        console.error("📋 Defensive Bug Poll Intercepted:", err.message);
      } finally {
        if (isMounted) {
          timerId = setTimeout(pollBugSettingsSafely, 3000);
        }
      }
    };

    pollBugSettingsSafely();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleScreenTouch = () => {
    if (!isFullscreen) return;
    setShowMobileClose(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setShowMobileClose(false), 3000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    if (socketRef.current) {
      socketRef.current.emit('send_message', { username: chatUser.username, email: chatUser.email, message: typedMessage });
    }
    setTypedMessage('');
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const bug1 = bugSettings.find(b => b.bugId === 'SCREENBUG-1') || { isVisible: true, liveImage: 'cn_screenbug.png' };
  const bug2 = bugSettings.find(b => b.bugId === 'SCREENBUG-2') || { isVisible: true, liveImage: 'toonami-logo.png' };

  // 🎯 मास्टर फिक्स: वीडियो के वास्तविक दिखने वाले फ्रेम की सटीक Position और 4:3 Aspect Ratio ट्रैक करने के लिए
  const [videoRect, setVideoRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const updateActualVideoCoordinates = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const rect = video.getBoundingClientRect();
    // 📺 पुराने 4:3 शोज़ के वास्तविक एस्पेक्ट रेशियो को एम्बेड के अंदर बाइंड करना
    const videoRatio = 4 / 3;
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const containerRatio = containerWidth / containerHeight;

    let actualWidth, actualHeight, activeTop, activeLeft;

    if (containerRatio > videoRatio) {
      actualHeight = containerHeight;
      actualWidth = actualHeight * videoRatio;
      activeTop = rect.top;
      activeLeft = rect.left + (containerWidth - actualWidth) / 2;
    } else {
      actualWidth = containerWidth;
      actualHeight = actualWidth / videoRatio;
      activeTop = rect.top + (containerHeight - actualHeight) / 2;
      activeLeft = rect.left;
    }

    setVideoRect({
      top: activeTop,
      left: activeLeft,
      width: actualWidth,
      height: actualHeight
    });
  }, []);

   // 📡 KICK POSTMESSAGE EVENT LISTENER: बफ़रिंग ख़त्म होने और लाइव फ़्रेम प्ले होने का ट्रैकर
    useEffect(() => {
      const handleKickLiveState = (event) => {
        // सुरक्षा गार्ड: केवल वैलिड किक प्लेयर्स के ओरिजिन को सुनना
        if (!event.origin.includes('kick.com')) return;

        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

          // 🎯 पहली लाइव फ़्रेम प्ले होते ही या बफ़रिंग ख़त्म होते ही इवेंट पकड़ना
          if (
            (data.event === 'player_state_changed' && data.params?.state === 'playing') ||
            data.event === 'play' || data.type === 'playing'
          ) {
            console.log("Kick Live Core Sync: Live frame broadcasting started!");

            // लाइव शुरू होते ही ठीक 5 सेकंड बाद पट्टियाँ गायब हो जाएंगी
            setTimeout(() => {
              setIsStrippingActive(false);
            }, 6000);
          }
        } catch (err) {
          // कैच ब्लॉक सुरक्षा गार्ड
        }
      };

      window.addEventListener('message', handleKickLiveState);
      return () => window.removeEventListener('message', handleKickLiveState);
    }, []);


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    window.addEventListener('resize', updateActualVideoCoordinates);
    const safetyTimer = setTimeout(updateActualVideoCoordinates, 600);
    updateActualVideoCoordinates();

    return () => {
      window.removeEventListener('resize', updateActualVideoCoordinates);
      clearTimeout(safetyTimer);
    };
  }, [isFullscreen, currentVideo, updateActualVideoCoordinates]);


  // 🎛️ मास्टर स्क्रीनबग पोलिंग लेयर (Race-Condition Free Recursive Engine)
  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    const pollBugSettingsSafely = async () => {
      if (!isMounted) return;
      try {
        const res = await fetch(`${CONFIG.BACKEND_BASE_URL}/api/screen-bugs/live-settings?_=${Date.now()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) setBugSettings(data);
        }
      } catch (err) {
        console.error("📋 Defensive Bug Poll Intercepted:", err.message);
      } finally {
        // 🎯 CRITICAL FIX 2: पोलिंग टाइमर को बढ़ाकर 5 सेकंड (5000ms) किया गया है
        // यह केवल और केवल तभी अगली सिंगल रिक्वेस्ट भेजेगा जब सर्वर पुरानी रिक्वेस्ट प्रोसेस कर चुका होगा
        if (isMounted) {
          timerId = setTimeout(pollBugSettingsSafely, 5000);
        }
      }
    };

    pollBugSettingsSafely();

    // ❌ जादुई क्लीनअप: री-रेंडर होते ही पुराने पेंडिंग लूप को पूरी तरह नष्ट (Kill) कर देगा
    return () => {
      isMounted = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []); // Locked to Mount Cycle Only

  // ⏱️ 3-सेकंड ऑटो-हाइड कंट्रोलर: फुलस्क्रीन में स्क्रीन छूने पर बटन जगाना और 3 सेकंड बाद छुपाना
  const triggerMinimizeButtonTimeout = () => {
    setShowMinimizeBtn(true);

    // यदि पहले से कोई टाइमर चल रहा हो तो उसे क्लियर करना
    if (minimizeTimerRef.current) {
      clearTimeout(minimizeTimerRef.current);
    }

    // ठीक 5 सेकंड (5000ms) बाद बटन को ऑटो-हाइड कर देना
    minimizeTimerRef.current = setTimeout(() => {
      setShowMinimizeBtn(false);
    }, 5000);
  };



  return (
    <div style={{ textAlign: 'center', backgroundColor: '#111', color: '#fff', padding: '30px', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>

      <button
        onClick={() => navigate('/')}
        className="bg-[#2629367e] mr-75 mb-4 hover:bg-zinc-700 text-white py-2 px-2 md:px-6 md:mr-255 rounded transition-colors"
      > ⬅ Back</button>


      <h1 style={{ letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>📺 CARTOON NETWORK LIVE TV</h1>

      {loading ? (
        <div style={{ padding: '100px 0' }}>
          <h2 style={{ color: '#00ffcc' }}>📡 Connecting to Master Broadcast Server...</h2>
        </div>
      ) : currentVideo ? (
        <div style={{ marginTop: '10px' }}>
          <h3 style={{ color: '#00ffcc', marginBottom: '10px' }}>🔴 NOW BROADCASTING: {currentVideo.customTitle || currentVideo.title}</h3>

          {/* एडमिन स्पेशल काउंटर (केवल एडमिन लॉगिन होने पर ही चमकेगा) */}
          {isAdmin && !isFullscreen && (
            <div className="w-full max-w-212.5 mx-auto mb-3 flex items-center justify-start">
              <div className="bg-zinc-950 border border-red-600 rounded px-2.5 py-1 flex items-center gap-2 shadow-md animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                <span className="text-[10px] font-mono font-black text-slate-300 tracking-wider uppercase">
                  Admin Analytics: <span className="text-red-500 text-xs font-sans font-extrabold">{liveWatchers}</span> Users Streaming Now
                </span>
              </div>
            </div>
          )}

          {/* वीडियो होल्डर बॉक्स - एक्टिव रेशियो के अनुसार ऑटो-लॉक रहेगा (100% मोबाइल और टच-सिंक्ड) */}
          <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto', backgroundColor: '#000', boxShadow: '0px 0px 30px rgba(0,0,0,0.8)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            <div
              ref={fullScreenContainerRef}
              onClick={(e) => {
                if (!isFullscreen) {
                  e.stopPropagation();
                } else {
                  // 🎯 जादू की लाइन: फ़ुलस्क्रीन मोड में कहीं भी क्लिक करने पर 3-सेकंड का टाइमर एक्टिवेट होगा
                  triggerMinimizeButtonTimeout();

                  // यदि आपकी फ़ाइल में पुराना handleScreenTouch() फ़ंक्शन भी बना हुआ है, तो उसे यहाँ नीचे ऐसे ही रहने दें:
                  if (typeof handleScreenTouch === 'function') handleScreenTouch();
                }
              }}
              onTouchEnd={(e) => {
                // 📱 मोबाइल यूज़र्स के लिए: स्क्रीन पर अंगूठा टच करते ही बटन 3 सेकंड के लिए जागेगा
                if (isFullscreen) {
                  triggerMinimizeButtonTimeout();
                }
              }}
              style={isFullscreen ? {
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: '#000', zIndex: 2147483646, display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              } : {
                position: 'relative', width: '100%', height: 'auto', backgroundColor: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >

              {/* इनर रैपर: एस्पेक्ट रेशियो को बांधने का फिक्स */}
              <div style={{
                position: 'relative', width: isFullscreen ? 'auto' : '100%',
                height: isFullscreen ? '100%' : 'auto', maxWidth: '100vw', maxHeight: '100vh',
                aspectRatio: isFullscreen ? 'unset' : '16/9', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>

                {/* 🔒 PERMANENT CLICK SHIELD: यह किक बटन्स को हमेशा के लिए पूरी तरह ब्लॉक रखेगा */}
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    zIndex: 2147483630, background: 'transparent', cursor: 'default',
                    touchAction: 'none',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (isFullscreen) handleScreenTouch();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (isFullscreen) handleScreenTouch();
                  }}
                />

                {/* 📺 शुद्ध ऑफिशियल एम्बेड आईफ्रेम (पेस्ट करने के बाद सारे डैश हटा लें) */}
                <iframe
                  ref={videoRef}
                  src={`https://player.kick.com/kn-network?autoplay=true&muted=${isMuted}&allowfullscreen=false`}
                  title="Network Master Live Stream"
                  frameBorder="0"
                  scrolling="no"
                  /* 🎯 CRITICAL SECURITY LOCK: किक के खुद के फुलस्क्रीन बटन को अंदर से हमेशा के लिए कुचलने (Disable) का फिक्स */
                  allowFullScreen={false}
                  allow="autoplay; encrypted-media"
                  style={{
                    width: isFullscreen ? 'auto' : '100%',
                    height: isFullscreen ? '100%' : 'auto',
                    maxHeight: '100vh',
                    aspectRatio: '16/9',
                    display: 'block',
                    pointerEvents: 'auto',
                    objectFit: 'contain'
                  }}
                />

                {/* 🔒 सुरक्षा पट्टी A: टॉप मास्क (किक लोगो, स्ट्रीम टाइटल और शेयर लिंक्स को ब्लॉक करने के लिए) */}
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '75px',
                    backgroundColor: '#ffffff', zIndex: 2147483640, transition: 'opacity 500ms',
                    opacity: isStrippingActive ? 1 : 0,
                    pointerEvents: isStrippingActive ? 'auto' : 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* 🔒 सुरक्षा पट्टी B: बॉटम मास्क (किक वॉटरमार्क, लाइव व्यूअर्स काउंट और सेटिंग्स गियर को ब्लॉक करने के लिए) */}
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, width: '100%', height: '75px',
                    backgroundColor: '#ffffff', zIndex: 2147483640, transition: 'opacity 500ms',
                    opacity: isStrippingActive ? 1 : 0,
                    pointerEvents: isStrippingActive ? 'auto' : 'none'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* 🗗 SMART MINIMIZE BUTTON: फुलस्क्रीन मोड में स्क्रीन छूने पर केवल 3 सेकंड के लिए चमकेगा और फिर ऑटो-हाइड होगा */}
                {isFullscreen && showMinimizeBtn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (document.exitFullscreen) document.exitFullscreen();
                      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                    }}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      zIndex: 2147483648,
                      backgroundColor: 'rgba(0, 0, 0, 0.85)', // हाई विज़िबिलिटी ब्लैक बैकग्राउंड
                      backdropFilter: 'blur(5px)',
                      color: '#ffffff',
                      border: '2px solid rgba(255,255,255,0.9)',
                      padding: '10px 18px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      transition: 'opacity 300ms ease-in-out'
                    }}
                  >
                    🗗 Minimize Screen
                  </button>
                )}

                {/* 🔇🔍 जादुई मर्ज इंजन (The Synced Native Fullscreen & Unmute Engine) */}
                {isMuted && !isFullscreen && (
                  <div
                    style={{
                      position: 'absolute', bottom: '20px', right: '20px',
                      zIndex: 2147483645, pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      setIsStrippingActive(true);

                      // फुलस्क्रीन होते ही तुरंत मिनिमाइज बटन को 3 सेकंड के लिए स्क्रीन पर चमकाना
                      triggerMinimizeButtonTimeout();

                      const element = fullScreenContainerRef.current;
                      if (element) {
                        if (element.requestFullscreen) element.requestFullscreen();
                        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
                        else if (element.msRequestFullscreen) element.msRequestFullscreen();
                      }

                      setIsMuted(false);
                      setTimeout(() => setIsStrippingActive(false), 3000);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsStrippingActive(true);
                      triggerMinimizeButtonTimeout();
                      const element = fullScreenContainerRef.current;
                      if (element) {
                        if (element.requestFullscreen) element.requestFullscreen();
                        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
                      }
                      setIsMuted(false);
                      setTimeout(() => setIsStrippingActive(false), 3000);
                    }}
                  >
                    <button
                      style={{
                        padding: '12px 24px', fontSize: '12px', fontWeight: 'bold', color: '#000',
                        backgroundColor: '#53fc18', border: '2px solid #ffffff', borderRadius: '6px',
                        textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                        boxShadow: '0px 4px 20px rgba(83, 252, 24, 0.6)'
                      }}
                    >
                      🔊 चलाएं और बड़ी स्क्रीन करें (Unmute & Maximize)
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

      ) : (
        /* 🎯 ऑफ़-एयर काउंटडाउन टाइमर बॉक्स */
        <div style={{ padding: '80px 0', backgroundColor: '#050505', border: '4px solid #111', maxWidth: '850px', margin: '20px auto', borderRadius: '8px', boxShadow: '0px 0px 20px rgba(0,0,0,0.5)' }}>
          <h3 style={{ color: '#ff3333', fontSize: '26px', letterSpacing: '1px', textTransform: 'uppercase' }}>⚫ Station Off-Air</h3>

          {timeLeft && timeLeft !== 'OFF-AIR' ? (
            <div style={{ marginTop: '20px' }}>
              <p style={{ color: '#00ffcc', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>⏱️ NEXT PREMIERE COUNTDOWN</p>
              <h2 style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: 'black', color: '#fff', letterSpacing: '4px', marginTop: '5px' }}>{timeLeft}</h2>
            </div>
          ) : (
            <p style={{ color: '#555', marginTop: '15px', fontSize: '14px' }}>There are currently no scheduled broadcasts playing at this hour. Please check back later!</p>
          )}
        </div>
      )}

      {/* 🎯 15 मिनट प्री-चैट या शो के दौरान एक्टिव होने वाला चैट बॉक्स */}
      {!isFullscreen && isChatActiveEarly && (
        <div className="w-full max-w-212.5 mx-auto mt-6 bg-slate-900 border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col font-sans overflow-hidden h-95">

          <div className="w-full bg-zinc-950 border-b-2 border-black p-2.5 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-black tracking-widest text-red-500 font-eagle uppercase">
              💬 Live Network Chat Room
            </span>
            <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 uppercase tracking-wide border border-black shadow-[1px_1px_0px_rgba(255,255,255,1)]">
              {currentVideo ? "● LIVE STREAMING ACTIVE" : "⏳ EARLY PRE-SHOW CHAT OPEN"}
            </span>
          </div>

          {/* 🎯 मास्टर सिंटैक्स फिक्स: पूरी तरह से टर्मिनेटेड और एरर-फ्री चैट रूम मैसेज ब्लॉक */}
          <div className="flex-1 p-3 overflow-y-auto bg-slate-950/40 space-y-2.5 font-mono text-xs text-slate-300">
            {chatMessages.length === 0 ? (
              <p className="text-zinc-600 text-center text-[11px] pt-12 uppercase tracking-wider font-bold animate-pulse">
                📡 Transmission silent. Be the first to start talking!
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg._id} className="border-b border-zinc-900/60 pb-1.5 leading-relaxed break-all">
                  <span className="text-red-500 font-black font-eagle uppercase mr-1.5 tracking-wide bg-zinc-900/50 px-1 py-0.5 rounded border border-zinc-800">
                    {msg.username}:
                  </span>
                  {/* 🛠️ VITE PARSE FIX: इस लाइन के स्ट्रिंग और ब्रैकेट को पूरी तरह सुरक्षित बंद कर दिया गया है */}
                  <span className="text-white drop-shadow-sm font-sans text-[13px]">
                    {msg.message}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="bg-zinc-950 border-t-2 border-black p-2 flex gap-2 shrink-0">
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder={`Chatting as ${chatUser.username}... type your message here!`}
              maxLength="150"
              className="bg-slate-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 w-full shadow-inner font-sans"
              required
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-orange-500 text-white font-black text-[11px] uppercase tracking-widest px-5 py-2 border border-black rounded transition-all duration-150 active:scale-95 shadow-[2px_2px_0px_rgba(255,255,255,0.1)] cursor-pointer shrink-0 font-eagle"
            >
              SEND ➔
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
