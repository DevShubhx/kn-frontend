import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Catalog() {
  const navigate = useNavigate();

  // State engines for live database records
  const [shows, setShows] = useState([]);
  const [updates, setUpdates] = useState([]); // 🔔 New dynamic site updates state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 सर्च और 📄 पेजिनेशन के लिए नई स्टेट्स
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const showsPerPage = 8; // प्रति पेज केवल 8 शोज दिखेंगे

  // Asynchronously fetch catalog shows and live site announcements simultaneously
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        // 1. Fetch live sorted content rows
        const showsResponse = await fetch('http://localhost:5000/api/shows');
        if (!showsResponse.ok) throw new Error(`Shows API returned error status: ${showsResponse.status}`);
        const showsData = await showsResponse.json();

        // ⏱️ आपका ऑरिजिनल परफेक्ट सॉर्टिंग लॉजिक (अछूता और सुरक्षित)
        const sortedShows = showsData.sort((a, b) => {
          const dateB = new Date(b.lastEpisodeAddedAt || b.createdAt);
          const dateA = new Date(a.lastEpisodeAddedAt || a.createdAt);
          return dateB - dateA;
        });
        
        setShows(sortedShows);

        // 2. Fetch latest live manual site updates broadcast bulletins
        const updatesResponse = await fetch('http://localhost:5000/api/updates');
        if (updatesResponse.ok) {
          const updatesData = await updatesResponse.json();
          setUpdates(updatesData);
        }
      } catch (err) {
        console.error("Failed to load catalog dashboards:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently Updated";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // 🎯 सर्च फ़िल्टर लॉजिक
  const filteredShows = shows.filter(show =>
    show.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 📄 पेजिनेशन कैलकुलेशन
  const indexOfLastShow = currentPage * showsPerPage;
  const indexOfFirstShow = indexOfLastShow - showsPerPage;
  // वर्तमान पेज पर दिखने वाले 8 सटीक सॉर्टेड शोज
  const currentShows = filteredShows.slice(indexOfFirstShow, indexOfLastShow);
  const totalPages = Math.ceil(filteredShows.length / showsPerPage);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // सर्च करने पर वापस पहले पेज पर भेजें
  };

  return (
    <div className="bg-zinc-900 text-white min-h-screen w-full font-sans p-4 md:p-8">

      {/* Header Container */}
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-8">
        <h1 className="font-bold m-0 text-xl md:text-3xl">Latest Releases</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 md:px-6 rounded transition-colors"
        >
          ⬅ Back
        </button>
      </div>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 max-w-7xl mx-auto w-full">

        {/* LEFT COLUMN: Search Bar & Show Cards */}
        <div className="flex flex-col gap-5 w-full md:w-8/12">
          
          {/* 🔍 न्यू सर्च बार इनपुट */}
          <div className="w-full relative">
            <input
              type="text"
              placeholder="🔍 Search shows by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors text-sm"
            />
          </div>

          {loading && <div className="text-zinc-400 py-10 text-center animate-pulse">⏳ Syncing with media stream server...</div>}
          {error && <div className="bg-red-950/40 border border-red-900 text-red-400 p-4 rounded-lg text-sm">⚠️ <strong>Connection Error:</strong> {error}</div>}
          {!loading && !error && filteredShows.length === 0 && (
            <div className="text-zinc-500 py-10 text-center border border-dashed border-zinc-800 rounded-lg">No shows found.</div>
          )}

          {/* 🚀 वर्तमान पेज के 8 सॉर्टेड शोज */}
          {!loading && !error && currentShows.map((show) => (
            <div
              key={show._id}
              onClick={() => navigate(`/show/${show._id}`)}
              className="bg-zinc-800/50 rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center cursor-pointer transition-transform duration-200 hover:scale-[1.01] border border-zinc-800"
            >
              <div className="aspect-video bg-zinc-950 shrink-0 w-full md:w-60 relative overflow-hidden rounded-md">
                <img
                  src={show.cardUrl || show.posterUrl || 'https://unsplash.com'}
                  alt={show.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://unsplash.com';
                  }}
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <h3 className="m-0 font-semibold text-lg md:text-xl text-white">{show.title}</h3>
                </div>
                <span className="text-xs text-zinc-400 font-medium">📅 Updated: {formatDate(show.lastEpisodeAddedAt || show.createdAt)}</span>
              </div>
            </div>
          ))}

          {/* 📄 न्यू पेजिनेशन कंट्रोल्स */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-white font-medium py-1.5 px-3 rounded text-xs transition-colors"
              >
                
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all ${
                      currentPage === index + 1
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-white font-medium py-1.5 px-3 rounded text-xs transition-colors"
              >
               
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Site Updates Dynamic Database Read Feed */}
        <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-800 self-start w-full md:w-4/12">
          <h2 className="mt-0 mb-5 text-xl font-bold text-red-600 border-b-2 border-red-600 pb-2">
            🔔 Site Updates
          </h2>
          <div className="flex flex-col gap-4 text-zinc-300 text-sm">
            {updates.length > 0 ? (
              updates.map((update) => (
                <p key={update._id} className="m-0 border-b border-zinc-800 pb-2 last:border-b-0 leading-relaxed">
                  📌 {update.text}
                </p>
              ))
            ) : (
              <>
                <p className="m-0">📌 <strong>Server Upgrade:</strong> Mediafire downloading links are now 2x faster!</p>
                <p className="m-0">📌 <strong>Request Line:</strong> New request box feature is coming live next week.</p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Catalog;




