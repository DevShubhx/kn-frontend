import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUpdatesManager from './AdminUpdatesManager';
import AdminCommentModerator from './AdminCommentModerator';
import AdminScreenBugControl from './AdminScreenBugControl';





export default function AdminDashboard() {
  const navigate = useNavigate();

  // 1. STATE ENGINES: Global Dropdown and Catalog Fetch Containers
  const [globalShowsList, setGlobalShowsList] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form states for creating a brand-new content card directory
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('show'); // 'show' or 'movie'
  const [posterUrl, setPosterUrl] = useState('');
  const [cardUrl, setCardUrl] = useState(''); // Front page featured card asset thumbnail
  const [genre, setGenre] = useState('');

  // Form states for adding sequential episodes via our Plus (+) Button injector
  const [selectedShowId, setSelectedShowId] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // 📺 NEW LIVE SCHEDULER STATE ENGINES Safely Added
  const [isLiveScheduled, setIsLiveScheduled] = useState(false);
  const [liveStartTime, setLiveStartTime] = useState('');
  const [liveDuration, setLiveDuration] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // 🎪 NEW CARTOON THEATRE SCHEDULER STATE ENGINES Safely Added
  const [theatreSlot, setTheatreSlot] = useState('1'); // Default to Slot 1 (Sunday 1)
  const [theatreTitle, setTheatreTitle] = useState('');
  const [theatreSynopsis, setTheatreSynopsis] = useState('');
  const [theatreDate, setTheatreDate] = useState('');
  const [theatreTime, setTheatreTime] = useState('12:00 PM IST'); // Classic Default Time
  const [theatrePoster, setTheatrePoster] = useState('');


  // Universal action responses feedback labels
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔒 SECURITY GUARD LAYER: Kick out non-admin visitors immediately
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  // 🛰️ DYNAMIC DROPDOWN LOADER: Fetch active MongoDB records so you can pick them instantly
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch('https://kn-backend-e3sa.onrender.com/api/shows');
        if (response.ok) {
          const data = await response.json();
          setGlobalShowsList(data);
          if (data.length > 0 && !selectedShowId) {
            setSelectedShowId(data[0]._id); // Auto-select the first content item in the matrix array safely
          }
        }
      } catch (err) {
        console.error('Failed fetching dropdown titles:', err);
      }
    };
    fetchCatalog();
  }, [refreshTrigger]);

  // ACTION 1: Push a brand new content profile card to database index catalogs
  const handleAddShow = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Split the text string by commas and clean empty spacing fields
      const genreArray = genre.split(',').map(g => g.trim());

      const response = await fetch('https://kn-backend-e3sa.onrender.com/api/shows/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          contentType,
          posterUrl,
          cardUrl,
          genre: genreArray // Maps cleanly to your original 'gener' schema array backend
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Content profile insertion failed.');

      setMessage(`🎉 Success! Published profile card for "${data.title}" successfully.`);
      setTitle(''); setDescription(''); setPosterUrl(''); setCardUrl(''); setGenre('');
      setRefreshTrigger(prev => prev + 1); // Refresh the dropdown listings instantly
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ACTION 2: The Fast Track Injector Engine (Updated for absolute movie isolation)
  const handleAddEpisodeSequential = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedShowId) {
      setError('Please create or select a content profile card element first.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const targetInstance = globalShowsList.find(s => s._id === selectedShowId);

      // Clean payload request sending the text tags to Route 4
      const response = await fetch(`https://kn-backend-e3sa.onrender.com/api/shows/${selectedShowId}/add-episode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: episodeTitle, // Contains either the movie quality tag or the episode title string
          streamUrl,
          downloadUrl
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Injection tracking failed.');

      const successLabel = targetInstance.contentType === 'movie'
        ? `🎬 Media direct track mirrors locked in for Movie: "${targetInstance.title}". Catalogue updated!`
        : `➕ Success! Track added sequentially into series sequence lists. Catalogue updated!`;

      setMessage(successLabel);
      setEpisodeTitle(''); setStreamUrl(''); setDownloadUrl('');
      setRefreshTrigger(prev => prev + 1); // Triggers dropdown state refresh to show new counts
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ UPDATED ACTION 3: 100% Independent Custom Live TV Scheduler (FIXED FOR CLOUD UTC)
  const handleScheduleLive = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 🎯 FIXED HIGH ACCURACY: इनपुट समय "2026-08-10T17:46" को कड़ाई से भारतीय टाइमज़ोन के अनुसार ISO UTC में पार्स करना
      if (!liveStartTime) throw new Error("Please select a valid date and time.");
      const finalizedUtcDate = new Date(liveStartTime + ":00+05:30");

      if (isNaN(finalizedUtcDate.getTime())) {
        throw new Error("Invalid date time parameter structure.");
      }

      const response = await fetch('https://kn-backend-e3sa.onrender.com/api/live-tv/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customTitle, // आपका हाथ से टाइप किया हुआ कोई भी नया नाम
          episodeTitle,
          streamUrl,
          // 🔒 LOCKED PAYLOAD: अब यह स्ट्रिंग .toISOString() के ज़रिए डेटाबेस में 5:30 घंटे पीछे (UTC) स्टोर होगी 
          // और फ्रंटएंड पेजों पर आते ही आपकी लाइव घड़ी से 100% परफेक्ट सिंक हो जाएगी
          liveStartTime: finalizedUtcDate.toISOString(),
          durationInSeconds: parseInt(liveDuration, 10)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Custom scheduling failed.');

      setMessage(`📺 Live TV Premiere Locked for Custom Show: "${data.customTitle}"!`);
      setCustomTitle(''); setEpisodeTitle(''); setStreamUrl(''); setLiveStartTime(''); setLiveDuration('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // 🎪 UPDATED ACTION 4: Cartoon Theatre 4 Sundays Slot Controller
  const handleUpdateTheatre = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 🔒 CLEAN LOCALHOST ENDPOINT: एआई फ़िल्टर से पूरी तरह सुरक्षित शुद्ध पाथ
      const runtimeTheatreUrl = 'https://kn-backend-e3sa.onrender.com/api/theatre/update-schedule';

      const response = await fetch(runtimeTheatreUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieNumber: parseInt(theatreSlot, 10), // 1, 2, 3, or 4
          title: theatreTitle.trim(),
          synopsis: theatreSynopsis.trim(),
          telecastDate: theatreDate,
          telecastTime: theatreTime.trim(),
          templateImageUrl: theatrePoster.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Theatre slot update failed.');

      setMessage(`🎪 Success! Cartoon Theatre Sunday Slot ${data.movieNumber} Locked for: "${data.title}"!`);

      // फॉर्म को खाली करना
      setTheatreTitle('');
      setTheatreSynopsis('');
      setTheatreDate('');
      setTheatrePoster('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎪 NEW ACTION 5: Poll Reset State Engines
  const [newShowOne, setNewShowOne] = useState('');
  const [newShowTwo, setNewShowTwo] = useState('');
  const [newShowThree, setNewShowThree] = useState('');

  const handleResetPollGrid = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://kn-backend-e3sa.onrender.com/api/poll/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          showOne: newShowOne,
          showTwo: newShowTwo,
          showThree: newShowThree
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Poll reset failed.');

      setMessage(`⚡ Success! Poll Grid Reset To Absolute Zero. New Round Activated Successfully!`);
      setNewShowOne('');
      setNewShowTwo('');
      setNewShowThree('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="w-full min-h-screen bg-[#6699cc] text-white font-eagle pb-16 flex flex-col items-center">

      {/* HEADER CONTROLS BANNER */}
      <header className="w-full bg-slate-900/80 backdrop-blur-md px-6 py-4 shadow-md text-center mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-red-500 uppercase tracking-widest">
          KartoonNetwork Control Center
        </h1>
        <p className="text-[10px] tracking-wider text-slate-400 mt-0.5 uppercase">Stealth Matrix Catalogue Management Workspace</p>
      </header>

      {/* FEEDBACK STATUS BANNERS */}
      <div className="w-full max-w-5xl px-4 mb-4">
        {message && <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs sm:text-sm p-3.5 rounded-xl text-center font-bold shadow-md">{message}</div>}
        {error && <div className="bg-red-950/60 border border-red-800 text-red-400 text-xs sm:text-sm p-3.5 rounded-xl text-center font-bold shadow-md">⚠️ Error: {error}</div>}
      </div>

      {/* MASTER TWO PANEL ROW INTERACTION GRIDS */}
      <main className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* PANEL ROW 1: BRAND NEW CONTENT REPOSITORY PROFILES COMPONENT INITIALIZER */}
        <section className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">1. Create New Content Card</h2>
            <p className="text-[11px] text-slate-400">Initialize a directory card asset inside MongoDB</p>
          </div>

          <form onSubmit={handleAddShow} className="flex flex-col gap-3.5">

            {/* 🍿 DROPDOWN FOR SHOW VS MOVIE SPLIT CONTROLS */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification Group Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-red-400 font-extrabold focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value="show">📺 MULTI-EPISODE TV SHOW SERIES</option>
                <option value="movie">🍿 SINGLE-PLAY FEATURE LENGTH MOVIE</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Ben 10 or Toy Story" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description Box Plot Summary</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Write cartoon or film narrative plots parameters details here..." className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600 h-16 resize-none" />
            </div>

            {/* 🖼️ SEPARATED BOX 1: FRONT WELCOME HOMEPAGE DISPLAY CARD IMAGE URL */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Featured Show Grid Card Image URL (Welcome Page Card Thumbnail)</label>
              <input type="url" value={cardUrl} onChange={(e) => setCardUrl(e.target.value)} required placeholder="https://site.com" className="bg-slate-950 border border-amber-900/50 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>

            {/* 🖼️ SEPARATED BOX 2: BACKEND DETAILS FULL INT VIEW COVER IMAGE URL */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Inner Show Page Hero Poster URL (Background Interior View Banner)</label>
              <input type="url" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} required placeholder="https://site.com" className="bg-slate-950 border border-sky-900/50 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Genres (Separate with commas)</label>
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} required placeholder="Action, Sci-Fi, Retro Classic" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:bg-red-800/40 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md mt-1 cursor-pointer">
              {loading ? 'Processing...' : 'Publish Content Profile'}
            </button>
          </form>
        </section>
        {/* PANEL ROW 2: SEQUENTIAL INJECTOR CONSOLE (ADAPTS LABELS TO MOVIE VS SERIES AUTOMATICALLY) */}
        <section className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">2. Fast Track Mirror Injector</h2>
            <p className="text-[11px] text-slate-400">Appends media link coordinates sequentially into selected profile tracking logs</p>
          </div>

          <form onSubmit={handleAddEpisodeSequential} className="flex flex-col gap-3.5">

            {/* Dynamic Selector dropdown logic */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Target Production Title</label>
              <select
                value={selectedShowId}
                onChange={(e) => setSelectedShowId(e.target.value)}
                required
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-600 cursor-pointer"
              >
                {globalShowsList.length === 0 ? (
                  <option value="">No profiles found inside database matrix indexes</option>
                ) : (
                  globalShowsList.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.contentType === 'movie' ? '🍿 [MOVIE]' : '📺 [SERIES]'} {s.title} ({s.episodes ? s.episodes.length : 0} Linked)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* THE DYNAMIC SWITCH: Adapts layout label tags safely based on matching selection objects */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {globalShowsList.find(s => s._id === selectedShowId)?.contentType === 'movie'
                  ? "Label / Streaming Quality tag (e.g., 1080p Bluray Direct)"
                  : "Episode Title Label (e.g., The Journey Begins)"}
              </label>
              <input type="text" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} required placeholder="Provide descriptive file title indicators..." className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Media Streaming URL (.mp4 file direct link source)</label>
              <input type="url" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} required placeholder="https://cdn-feed.com" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Speed Cloud Download Mirror URL (.zip/mega link paths)</label>
              <input type="url" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} required placeholder="https://mega.nz..." className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <button
              type="submit"
              disabled={loading || globalShowsList.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/40 text-white font-extrabold py-3 rounded-lg text-sm uppercase tracking-widest transition-colors shadow-xl mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Processing System Logs...' : '➕ Inject Media Direct Mirror'}</span>
            </button>

          </form>
        </section>

        {/* PANEL ROW 3: 100% INDEPENDENT CUSTOM LIVE TV SCHEDULER */}
        <section className="bg-slate-900/90 border border-slate-700/50 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col gap-4 col-span-1 md:col-span-2">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">3. Schedule Custom Live Premiere</h2>
            <p className="text-[11px] text-slate-400">Schedule any brand new title directly to Live TV without needing a show profile card first</p>
          </div>

          <form onSubmit={handleScheduleLive} className="flex flex-col gap-3.5">
            {/* 📝 HAND TYPED CUSTOM SHOW NAME BOX */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Custom Show / Production Title (e.g., Dragon Ball Z)</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
                placeholder="Type any brand new show name here..."
                className="bg-slate-950 border border-cyan-900/50 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Episode Title Input Block */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Episode Title Label (e.g., Episode 01: The Saiyan Invasion)</label>
              <input type="text" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} required placeholder="Enter episode plot sub-title..." className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            {/* Media Stream URL Input Block */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Streaming URL (.mp4 source)</label>
              <input type="text" value={streamUrl || 'https://player.kick.com/embed/kn-network?parent=knfrontend.vercel.app'} onChange={(e) => setStreamUrl(e.target.value)} required placeholder="https://f003.backblazeb2.com" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            {/* Time and Duration Sub Grid Matrix Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premiere Start Date & Time</label>
                <input type="datetime-local" value={liveStartTime} onChange={(e) => setLiveStartTime(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video Duration (In Seconds)</label>
                <input type="number" value={liveDuration} onChange={(e) => setLiveDuration(e.target.value)} required placeholder="e.g., 1800 for 30 minutes" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-lg text-sm uppercase tracking-widest transition-colors shadow-xl mt-2 cursor-pointer">
              <span>{loading ? 'Processing Schedule Logs...' : '📡 Broadcast Custom Premiere onto Live TV'}</span>
            </button>
          </form>
        </section>

        {/* CONTAINER 4: CARTOON THEATRE SUNDAYS SLOT CONTROLLER FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl mt-8 text-left">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <span className="text-xl">🎪</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Action 4: Cartoon Theatre Slot Controller</h2>
          </div>

          <form onSubmit={handleUpdateTheatre} className="flex flex-col gap-4">

            {/* Slot Dropdown Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Sunday Slot Number</label>
              <select
                value={theatreSlot}
                onChange={(e) => setTheatreSlot(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="1">Sunday Slot 1 (1st Week Movie)</option>
                <option value="2">Sunday Slot 2 (2nd Week Movie)</option>
                <option value="3">Sunday Slot 3 (3rd Week Movie)</option>
                <option value="4">Sunday Slot 4 (4th Week Movie)</option>
              </select>
            </div>

            {/* Movie Title Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Movie Title</label>
              <input
                type="text"
                value={theatreTitle}
                onChange={(e) => setTheatreTitle(e.target.value)}
                required
                placeholder="e.g. Dexter's Laboratory: Ego Trip"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Telecast Date Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telecast Sunday Date</label>
              <input
                type="date"
                value={theatreDate}
                onChange={(e) => setTheatreDate(e.target.value)}
                required
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Telecast Custom Time Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telecast Time Label</label>
              <input
                type="text"
                value={theatreTime}
                onChange={(e) => setTheatreTime(e.target.value)}
                required
                placeholder="e.g. 11:00 AM IST"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Template Poster Image URL Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Poster Image Link</label>
              <input
                type="text"
                value={theatrePoster}
                onChange={(e) => setTheatrePoster(e.target.value)}
                required
                placeholder="Paste Backblaze friendly link or image URL"
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Movie Synopsis Textarea */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Movie Synopsis / Description</label>
              <textarea
                value={theatreSynopsis}
                onChange={(e) => setTheatreSynopsis(e.target.value)}
                required
                rows="3"
                placeholder="Write a brief overview of the movie story line here..."
                className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xs uppercase tracking-wider p-3 rounded-lg transition shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? "⚙️ Saving Slot Data..." : "🔒 Lock Movie Into Theatre"}
            </button>

          </form>
        </div>

        {/* CONTAINER 5: MASTER POLL RESET AND SHOW UPDATER FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl mt-8 text-left">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <span className="text-xl">📊</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Action 5: Poll Master Cycle Reset</h2>
          </div>

          <form onSubmit={handleResetPollGrid} className="flex flex-col gap-4">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide">
              ⚠️ Warning: Submitting this form will permanently flush current vote results and wipe user blocks!
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Option 1 Show Name</label>
              <input type="text" value={newShowOne} onChange={(e) => setNewShowOne(e.target.value)} required placeholder="e.g. Courage the Cowardly Dog" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Option 2 Show Name</label>
              <input type="text" value={newShowTwo} onChange={(e) => setNewShowTwo(e.target.value)} required placeholder="e.g. Samurai Jack" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Option 3 Show Name</label>
              <input type="text" value={newShowThree} onChange={(e) => setNewShowThree(e.target.value)} required placeholder="e.g. Ben 10 (Classic)" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
            </div>

            <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider p-3 rounded-lg transition shadow-lg disabled:opacity-50 mt-2">
              {loading ? "⚙️ Flashing Database..." : "🔥 WIPE RESULTS & START NEW ROUND"}
            </button>
          </form>
        </div>

        {/* CONTAINER 6: NEW SHOWS ACCURATE CRUD SLOT CONTROLLER FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl mt-8 text-left">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <span className="text-xl">📺</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Action 6: New Shows Catalog Controller (CRUD)</h2>
          </div>

          {/* INTERNAL MANAGER ROUTER GATEWAY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT ROW: CREATE & UPDATE INTERFACE */}
            <div className="flex flex-col gap-4 border-r-0 md:border-r border-slate-800 pr-0 md:pr-6">
              <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest">Add / Update Card</h3>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Target Update Card ID (Leave Blank to Create New)</label>
                <input type="text" id="crud-id" placeholder="Paste MongoDB _id here only to modify existing cards" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Header Text</label>
                <input type="text" id="crud-header" placeholder="e.g. Dexter Special" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Optional Left Icon URL</label>
                <input type="text" id="crud-icon" placeholder="Paste small icon image link" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">1:1 Square Thumbnail Image URL</label>
                <input type="text" id="crud-thumb" placeholder="Paste square thumbnail image link" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Description Paragraph</label>
                <textarea id="crud-desc" rows="2" placeholder="Write full description metrics here..." className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none" />
              </div>

              <button
                onClick={async () => {
                  const id = document.getElementById('crud-id').value.trim();
                  const payload = {
                    headerText: document.getElementById('crud-header').value.trim(),
                    headerIconUrl: document.getElementById('crud-icon').value.trim(),
                    description: document.getElementById('crud-desc').value.trim(),
                    thumbnailUrl: document.getElementById('crud-thumb').value.trim()
                  };
                  const token = localStorage.getItem('token');
                  const url = id ? `https://kn-backend-e3sa.onrender.com/api/new-shows/update/${id}` : 'https://kn-backend-e3sa.onrender.com/api/new-shows/add';

                  const res = await fetch(url, {
                    method: id ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                  });
                  if (res.ok) { alert(id ? 'Card Updated!' : 'Card Added!'); window.location.reload(); } else { alert('Operation Failed!'); }
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase p-2.5 rounded-lg mt-2"
              >
                🔒 EXECUTE SAVE MATRIX
              </button>
            </div>

            {/* RIGHT ROW: DESTRUCTIVE DELETE INTERFACE */}
            <div className="flex flex-col gap-4 justify-start pt-6 md:pt-0">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Destructive Purge Terminal</h3>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Target Delete Card ID</label>
                <input type="text" id="crud-delete-id" placeholder="Paste exact MongoDB _id to erase" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" />
              </div>

              <button
                onClick={async () => {
                  const id = document.getElementById('crud-delete-id').value.trim();
                  if (!id) return alert('ID is mandatory!');
                  if (!window.confirm('Confirm permanent erasure?')) return;
                  const token = localStorage.getItem('token');

                  const res = await fetch(`https://kn-backend-e3sa.onrender.com/api/new-shows/delete/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (res.ok) { alert('Card Destroyed Safely!'); window.location.reload(); } else { alert('Destruction Aborted!'); }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase p-2.5 rounded-lg mt-2"
              >
                🔥 PURGE CARD FROM CLUSTER
              </button>
            </div>
          </div>
        </div>

        {/* CONTAINER 7: HIGH-VELOCITY BLOCK INTEGRATED WEEKLY SCHEDULE FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl mt-8 text-left">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <span className="text-xl">📺</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Action 7: 7-Day Timetable Core Controller</h2>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const payload = {
                showName: document.getElementById('week-show').value.trim(),
                programmingBlock: document.getElementById('week-block').value.trim(), // Toonami, Power Zone etc.
                startTime: document.getElementById('week-start').value,
                durationInMinutes: parseInt(document.getElementById('week-duration').value, 10)
              };
              const token = localStorage.getItem('token');

              const res = await fetch('https://kn-backend-e3sa.onrender.com/api/weekly-schedule/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
              });
              if (res.ok) {
                alert('Slot Successfully Logged into 7-Day Grid Matrix!');
                document.getElementById('week-show').value = '';
                document.getElementById('week-start').value = '';
              } else {
                alert('Transaction aborted by gatekeepers.');
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cartoon Show Name</label>
                <input type="text" id="week-show" required placeholder="e.g. Tom and Jerry Show" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Programming Block Name (Optional)</label>
                <input type="text" id="week-block" placeholder="e.g. Toonami, Power Zone, Tiny TV, Half Ticket Express" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Broadcast Start Time (Local System Clock)</label>
                <input type="datetime-local" id="week-start" required className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Show Duration (Minutes Block)</label>
                <select id="week-duration" className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600">
                  <option value="30">30 Minutes Slot (Standard Slot)</option>
                  <option value="60">60 Minutes Block</option>
                  <option value="15">15 Minutes Tiny TV Slot</option>
                  <option value="90">90 Minutes Feature Movie</option>
                </select>
              </div>
            </div>

            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider p-3 rounded-lg transition shadow-lg mt-2">
              🔒 LOCK SLOT INTO 7-DAY MATRIX
            </button>
          </form>
        </div>



      </main>

      <div className="w-full max-w-5xl px-4 mt-8">
        <AdminUpdatesManager />
      </div>

      {/* 🌟 ADDED COMPONENT BOX ROW RIGHT HERE */}
      <div className="w-full max-w-5xl px-4 mt-8">
        <AdminCommentModerator />
      </div>

      {/* DASHBOARD EXIT LINK */}
      <footer className="mt-12 text-center">
        <p
          onClick={() => navigate('/')}
          className="text-xs text-slate-900 font-bold bg-white/20 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/40 transition-all cursor-pointer shadow-md"
        >
          ⬅️ Leave Control Room Matrix & Return Home
        </p>
      </footer>

    </div>
  );
}
