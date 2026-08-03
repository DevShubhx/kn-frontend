import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import streamingGraphic from '../assets/images/hero-banner.png'


function Welcome() {
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Live shows backend list containers
    const [shows, setShows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [timeLeft, setTimeLeft] = useState('');
    const [liveSchedule, setLiveSchedule] = useState([]);

    // 🌟 कैरोसेल के लिए अतिरिक्त स्टेट और रेफ क्लस्टर
    const [carouselIndex, setCarouselIndex] = useState(0);
    const carouselTimerRef = useRef(null);

    // 📸 5 इमेज कार्ड्स का डेटा (Public फोल्डर का सीधा रास्ता)
    const CARDS_DATA = useMemo(() => [
        { id: 1, img: "src/assets/images/b1.png",  buttonLabel: "Home", linkTo: "/genre/Boomerang" },
        { id: 2, img: "src/assets/images/b2.png",  buttonLabel: "CN Theatre", linkTo: "/theatre" },
        { id: 3, img: "src/assets/images/b3.png",  buttonLabel: "New Show", linkTo: "/new-shows" },
        { id: 4, img: "src/assets/images/b4.png",  buttonLabel: ".ComPick", linkTo: "/compick" },
        { id: 5, img: "src/assets/images/b5.png",  buttonLabel: "Schedule", linkTo: "/weekly-schedule" }
    ], []);


    // 🔄 कैरोसेल ऑटो-प्ले स्लाइडिंग इंजन लॉजिक (3 सेकंड अंतराल)
    useEffect(() => {
        const startCarousel = () => {
            if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
            carouselTimerRef.current = setInterval(() => {
                setCarouselIndex((prev) => (prev + 1) % CARDS_DATA.length);
            }, 3000);
        };

        startCarousel();
        return () => {
            if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
        };
    }, [CARDS_DATA.length]);

    // ⏱️ सुपर-स्मार्ट डायनेमिक प्रीमियर काउंटडाउन इंजन
    useEffect(() => {
        const calculateCountdown = () => {
            if (!liveSchedule || liveSchedule.length === 0) {
                setTimeLeft('');
                return;
            }

            const now = Date.now();
            const nextShow = liveSchedule.find(s => Date.parse(s.liveStartTime) > now);

            if (!nextShow) {
                setTimeLeft('OFF-AIR');
                return;
            }

            const diffMs = Date.parse(nextShow.liveStartTime) - now;
            const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
            const mins = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const secs = String(Math.floor((diffMs % (1000 * 60)) / 1000)).padStart(2, '0');

            setTimeLeft(`${hours}:${mins}:${secs}`);
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);
        return () => clearInterval(interval);
    }, [liveSchedule]);

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)

        const fetchShows = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/shows')
                if (!response.ok) throw new Error('Failed to fetch entries.')
                const data = await response.json()
                setShows(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchShows()
    }, [])

    useEffect(() => {
        const fetchLiveChannels = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/live-tv/live-timetable');
                if (response.ok) {
                    const data = await response.json();
                    setLiveSchedule(data.schedule);
                }
            } catch (err) {
                console.error('Failed fetching live timeline:', err);
            }
        };

        fetchLiveChannels();
        const liveInterval = setInterval(fetchLiveChannels, 5000);
        return () => clearInterval(liveInterval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        setIsMenuOpen(false)
        navigate('/')
    }
    return (
        <div className="w-full min-h-screen bg-[#6699cc] text-white font-eagle font-normal flex flex-col items-center">

            {/* 🗺️ NAVIGATION BAR */}
            <nav className="w-full bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-1 shadow-md">
                <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
                    {/* Brand Logo */}
                    <div
                        onClick={() => navigate('/')}
                        className="text-xl sm:text-2xl font-bold font-eagle tracking-wide cursor-pointer text-red-500 hover:text-red-400"
                    >
                        Kartoon<span className="tracking-wide cursor-pointer text-white hover:text-blue-400">Network</span>
                    </div>

                    {/* Desktop Menu - Hidden on Phones */}
                    <ul className="hidden md:flex gap-8 font-bold items-center text-sm uppercase tracking-wider">
                        <li onClick={() => navigate('/')} className="cursor-pointer hover:text-red-500 transition-colors">Home</li>
                        <li onClick={() => navigate('/catalog')} className="cursor-pointer hover:text-red-500 transition-colors">All Shows</li>
                        <li onClick={() => navigate('/downloads')} className="cursor-pointer hover:text-red-500 transition-colors">Downloads</li>

                        {/* Dynamic authentication state triggers */}
                        {isLoggedIn ? (
                            <li onClick={handleLogout} className="cursor-pointer bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors text-xs normal-case">Logout</li>
                        ) : (
                            <>
                                <li onClick={() => navigate('/login')} className="cursor-pointer hover:text-red-500 transition-colors">Login</li>
                                <li onClick={() => navigate('/register')} className="cursor-pointer bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors text-xs normal-case">Sign Up</li>
                            </>
                        )}
                    </ul>

                    {/* Smartphone Hamburger Icon Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none"
                    >
                        <span className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`w-6 h-0.5 bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}>
                        </span>
                    </button>
                </div>

                {/* Smartphone Dropdown Menu Tray */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <ul className="flex flex-col gap-4 font-bold text-center border-t border-slate-700/50 pt-4 uppercase text-sm">
                        <li onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="py-2 hover:bg-slate-800 rounded transition-colors">Home</li>
                        <li onClick={() => { navigate('/catalog'); setIsMenuOpen(false); }} className="py-2 hover:bg-slate-800 rounded transition-colors">All Shows</li>
                        <li onClick={() => { navigate('/downloads'); setIsMenuOpen(false); }} className="py-2 hover:bg-slate-800 rounded transition-colors">Downloads</li>

                        {/* Dynamic authentication links */}
                        {isLoggedIn ? (
                            <li onClick={handleLogout} className="py-2 bg-red-600/40 text-red-400 hover:bg-slate-800 rounded transition-colors">Logout</li>
                        ) : (
                            <>
                                <li onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="py-2 hover:bg-slate-800 rounded transition-colors">Login</li>
                                <li onClick={() => { navigate('/register'); setIsMenuOpen(false); }} className="py-2 bg-red-600/40 text-red-400 hover:bg-slate-800 rounded transition-colors">Sign Up</li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
            {/* 🚀 MAIN HERO CONTAINER */}
            <main className="w-full max-w-full px-4 py-6 flex flex-col md:flex-row items-center justify-center text-center box-border relative min-h-420px">

                {/* 📺 1. LEFT SIDE CARD */}
                <div className="w-full md:w-[20%] md:absolute md:left-10 md:top-10 z-30 shrink-0 mb-6 md:mb-0">
                    <div
                        onClick={() => {
                            if (isLoggedIn) {
                                navigate('/Live');
                            } else {
                                alert('⚠️ Access Denied! Please Login first to watch LIVE TV.');
                            }
                        }}
                        className="w-full bg-black border-4 border-white rounded-none shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] cursor-pointer hover:scale-[1.02] transition-transform duration-200 relative overflow-hidden flex flex-col justify-between min-h-320px font-eagle select-none"
                    >
                        {/* CN Checkerboard Accent */}
                        <div className="w-full grid grid-cols-7 h-7 bg-zinc-900 border-b-2 border-white shrink-0">
                            <div className="bg-white text-black font-black text-center text-[15px] flex items-center justify-center">C</div>
                            <div className="bg-black text-white font-black text-center text-[15px] flex items-center justify-center">A</div>
                            <div className="bg-white text-black font-black text-center text-[15px] flex items-center justify-center">R</div>
                            <div className="bg-black text-white font-black text-center text-[15px] flex items-center justify-center">T</div>
                            <div className="bg-white text-black font-black text-center text-[15px] flex items-center justify-center">O</div>
                            <div className="bg-black text-white font-black text-center text-[15px] flex items-center justify-center">O</div>
                            <div className="bg-white text-black font-black text-center text-[15px] flex items-center justify-center">N</div>
                        </div>

                        {/* 🎬 DYNAMIC GIF BACKGROUND */}
                        <img
                            src="https://64.media.tumblr.com/209cd350bf8530dbd13c054d12583047/tumblr_pca7e4TEzu1waumroo1_500.gifv"
                            alt="Retro Live Stream GIF"
                            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.9)_100%)] z-10 pointer-events-none"></div>

                        {/* BADGES & LIVE STATE LAYER */}
                        <div className="p-3 z-20 flex flex-col gap-2 items-start w-full text-left">
                            {(() => {
                                const now = Date.now();
                                const activeShow = liveSchedule.find(s => {
                                    const start = Date.parse(s.liveStartTime);
                                    const end = start + (s.durationInSeconds * 1000);
                                    return now >= start && now < end;
                                });

                                const upcomingShow = liveSchedule.find(s => Date.parse(s.liveStartTime) > now);

                                if (activeShow) {
                                    const nextScheduledShow = liveSchedule.find(s => {
                                        if (s._id === activeShow._id) return false;
                                        const currentActiveEnd = Date.parse(activeShow.liveStartTime) + (activeShow.durationInSeconds * 1000);
                                        return Date.parse(s.liveStartTime) >= currentActiveEnd;
                                    });

                                    return (
                                        <>
                                            <div className="bg-red-600 border-2 border-white px-2 py-0.5 animate-pulse flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                                                <span className="text-white font-black text-[9px] uppercase tracking-widest">LIVE NOW</span>
                                            </div>
                                            <div className="bg-blue-600/90 text-white font-bold border border-white px-2 py-0.5 text-[10px] tracking-wide uppercase max-w-full truncate shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                🔴 NOW: {activeShow.customTitle}
                                            </div>
                                            {nextScheduledShow && (
                                                <div className="bg-zinc-800 text-yellow-400 font-bold border border-dashed border-zinc-600 px-2 py-0.5 text-[9px] tracking-wide uppercase max-w-full truncate mt-1">
                                                    ⏭️ NEXT: {nextScheduledShow.customTitle}
                                                </div>
                                            )}
                                        </>
                                    );
                                } else if (upcomingShow) {
                                    return (
                                        <>
                                            <div className="bg-amber-500 border-2 border-white px-2 py-0.5 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                                <span className="text-white font-black text-[9px] uppercase tracking-widest">COMING UP NEXT</span>
                                            </div>
                                            <div className="bg-zinc-800 text-white font-bold border border-white px-2 py-0.5 text-[10px] tracking-wide uppercase max-w-full truncate shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                ⏳ NEXT: {upcomingShow.customTitle}
                                            </div>
                                        </>
                                    );
                                } else {
                                    return (
                                        <div className="bg-zinc-700 text-zinc-400 font-bold border border-zinc-600 px-2 py-0.5 text-[10px] tracking-wide uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            📡 Station Off-Air Check Schedule
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* ⏱️ COUNTDOWN TIMER CONTAINER */}
                        <div className="p-3 z-20 mx-2 bg-zinc-950/90 border border-zinc-700/50 flex flex-col items-center justify-center rounded">
                            <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest mb-0.5">
                                {timeLeft === 'OFF-AIR' || !timeLeft ? "NO BROADCAST LINE" : "PREMIERE COUNTDOWN:"}
                            </span>
                            <div className="text-sm font-black tracking-widest text-white font-mono">
                                {timeLeft && timeLeft !== 'OFF-AIR' ? timeLeft : '--:--:--'}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-3 z-20 bg-linear-to-t from-black via-black/90 to-transparent border-t-2 border-dashed border-zinc-800 text-left">
                            <h3 className="text-base font-extrabold text-white uppercase m-0">CARTOON NETWORK</h3>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-yellow-400 font-bold border-t border-zinc-800 pt-1">
                                <span className="uppercase tracking-widest text-[8px]">
                                    {liveSchedule.some(s => {
                                        const start = Date.parse(s.liveStartTime);
                                        const end = start + (s.durationInSeconds * 1000);
                                        return Date.now() >= start && Date.now() < end;
                                    }) ? "🔓 ENTER STREAM" : "🔒 LOCKED"}
                                </span>
                                <span className="text-white font-black animate-bounce">➔</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 🖼️ 2. CENTER PILLAR: 🌟 पुराने बैनर और टेक्स्ट की जगह नया एनिमेटेड इमेज स्लाइडिंग कैरोसेल */}
                <div className="w-full flex flex-col justify-center items-center text-center mx-auto z-10 max-w-xl md:max-w-180 px-2">

                    {/* 🔝 TOP CONTROL BAR (B1 to B5 Buttons) */}
                    <div className="w-auto flex justify-between items-center bg-slate-900 border border-blue-900 rounded-xl p-2 shadow-lg mb-1">
                        

                        <div className="flex gap-1.5">
                            {CARDS_DATA.map((card, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCarouselIndex(index)}
                                    className={`text-xs px-3 py-1.5 font-black rounded-md tracking-wider transition-all duration-300 border ${carouselIndex === index
                                            ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-900/50 scale-120'
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                        }`}
                                >
                                    {card.buttonLabel}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 🎞️ SLIDING VIEWPORT (इल्यूजन बॉक्स जो राइट-टू-लेफ्ट खिसकेगा) */}
                    <div className="w-175 h-100 rounded-2xl overflow-hidden relative border-slate-900 mb-2">
                        <div
                            className="flex w-full h-full transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                        >
                            {CARDS_DATA.map((card) => (
                                <div key={card.id}
                                                  onClick={() => navigate(card.linkTo)}
                                                 className="w-full h-100 shrink-0 relative group select-none cursor-pointer">
                                    <img
                                        src={card.img}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-100"
                                        loading="lazy"
                                    />
                                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide drop-shadow-md">
                                        {card.title}
                                    </h2>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/catalog')}
                        className="py-3 px-8 sm:py-4 sm:px-12 font-eagle font-bold text-base sm:text-lg text-white bg-red-600 rounded-full shadow-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-orange-500 active:scale-95"
                    >
                        Browse Shows
                    </button>
                </div>
            </main>
            {/* 🎯 SECTION FOR GENRE CARDS GRIDS */}
            <section className="w-full max-w-5xl px-4 py-0 box-border mb-12">
                <h2 className="w-full font-eagle font-bold text-xl sm:text-2xl md:text-3xl border-b-2 border-red-600 pb-3 mb-8 tracking-wide drop-shadow-md text-left">
                    🔥 Programing Blocks
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-center items-center">
                    {[
                        { name: 'TOONAMI', tag: 'TOONAMI', image: 'https://unsplash.com', desc: 'Saturdays - Sundays at 8 PM' },
                        { name: 'Boomerang', tag: 'Boomerang', image: 'https://unsplash.com', desc: 'Old school cartoon network favorites' },
                        { name: 'Cartoon Cartoons', tag: 'Cartoon Cartoons', image: 'https://unsplash.com', desc: 'High energy superhero adventures' },
                        { name: 'Cartoon Theatre', tag: 'Cartoon Theatre', image: 'https://unsplash.com', desc: 'Futuristic worlds and space chronicles' },
                        { name: 'Power Zone', tag: 'Power Zone', image: 'https://unsplash.com', desc: 'Spooky and terrifying horror tales' },
                        { name: 'Comedy', tag: 'Comedy', image: 'https://unsplash.com', desc: 'Laugh out loud ultimate comedy' }
                    ].map((group) => (
                        <div
                            key={group.tag}
                            onClick={() => navigate(`/genre/${encodeURIComponent(group.tag)}`)}
                            className="w-full bg-slate-900/90 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.03] transition-transform duration-200 flex flex-col h-72"
                        >
                            <div className="w-full h-36 bg-slate-800 flex items-center justify-center overflow-hidden relative">
                                <img src={group.image} alt={group.name} className="w-full h-full object-cover opacity-80" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-red-500 truncate mb-1 uppercase tracking-wide">{group.name}</h3>
                                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">{group.desc}</p>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-blue-400 mt-auto border-t border-slate-700/50 pt-2">
                                    <span>Browse Collection</span>
                                    <span className="text-slate-400 font-normal bg-slate-800 px-2 py-0.5 rounded">➔</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Welcome;

