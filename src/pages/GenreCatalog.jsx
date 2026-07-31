import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function GenreCatalog() {
  const { genreName } = useParams(); 
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenreShows = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/shows?t=${new Date().getTime()}`);
        if (response.ok) {
          const data = await response.json();
          
          // 🎯 फ़िल्टर लॉजिक: सिर्फ वही शोज रखें जिनके जॉनर एरे में यह जॉनर शामिल है
          const filtered = data.filter(show => 
            show.genre && show.genre.some(g => g.toLowerCase() === genreName.toLowerCase())
          );

          // ⏱️ टाइमस्टैम्प सॉर्टिंग: नए एपिसोड/अपडेट वाले शोज सबसे ऊपर
          const sorted = filtered.sort((a, b) => {
            const dateB = new Date(b.lastEpisodeAddedAt || b.createdAt);
            const dateA = new Date(a.lastEpisodeAddedAt || a.createdAt);
            return dateB - dateA;
          });

          setShows(sorted);
        }
      } catch (err) {
        console.error("Failed to load genre collection:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenreShows();
  }, [genreName]);

  return (
    <div className="bg-zinc-900 text-white min-h-screen w-full font-sans p-4 md:p-8">
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-8 border-b border-zinc-800 pb-4">
        <h1 className="font-extrabold text-xl md:text-3xl uppercase tracking-wider text-red-500">
          🎬 {genreName} Collection
        </h1>
        <button 
          onClick={() => navigate('/')}
          className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded transition-colors text-sm"
        >
          ⬅ Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading && <p className="text-zinc-400 animate-pulse col-span-full text-center py-10">Syncing collection...</p>}
        
        {!loading && shows.length === 0 && (
          <p className="text-zinc-500 italic col-span-full text-center py-10 border border-dashed border-zinc-800 rounded-xl">
            No shows available in this category yet.
          </p>
        )}

        {!loading && shows.map((show) => (
          <div 
            key={show._id} 
            onClick={() => navigate(`/show/${show._id}`)}
            className="bg-zinc-800/40 rounded-xl overflow-hidden shadow-md border border-zinc-800/80 cursor-pointer hover:scale-[1.02] hover:border-zinc-700 transition-all duration-200 group"
          >
            <div className="aspect-16/10 bg-zinc-950 w-full overflow-hidden">
              <img 
                src={show.cardUrl || show.posterUrl} 
                alt={show.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-base text-zinc-200 group-hover:text-white line-clamp-1">{show.title}</h3>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-2 block">
                {show.contentType === 'movie' ? '🍿 Movie' : '📺 Series'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GenreCatalog;
