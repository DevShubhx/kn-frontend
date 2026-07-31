import React, { useState, useEffect } from 'react';

function AdminUpdatesManager() {
  const [announcement, setAnnouncement] = useState('');
  const [updatesList, setUpdatesList] = useState([]); // Tracks live announcements
  const [status, setStatus] = useState('');

  // 🔄 Function to sync the active bulletins array from the database
  const fetchCurrentUpdates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/updates');
      if (res.ok) {
        const data = await res.json();
        setUpdatesList(data);
      }
    } catch (err) {
      console.error("Failed loading updates dashboard feed:", err);
    }
  };

  // Sync data automatically when the dashboard page boots
  useEffect(() => {
    fetchCurrentUpdates();
  }, []);

  // Action to post a brand-new live notification
  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: announcement })
      });
      
      if (res.ok) {
        setAnnouncement('');
        setStatus('✅ Bulletin point successfully broadcast to home dashboard catalog!');
        fetchCurrentUpdates(); // Refresh the list view instantly
        setTimeout(() => setStatus(''), 4000);
      } else {
        setStatus('❌ Server rejected announcement payload.');
      }
    } catch (err) {
      setStatus('❌ Network post transaction failed.');
    }
  };

  // 🗑️ Action to scrub an old announcement item out of MongoDB
  const handleDeleteUpdate = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Are you sure you want to permanently erase this announcement?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/updates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Passes your admin token verification headers safely
        }
      });

      if (res.ok) {
        setStatus('🗑️ Announcement erased successfully!');
        fetchCurrentUpdates(); // Sync interface arrays instantly
        setTimeout(() => setStatus(''), 4000);
      } else {
        const data = await res.json();
        setStatus(`❌ Authorization error: ${data.message || 'Deletion denied'}`);
      }
    } catch (err) {
      setStatus('❌ Network deletion transaction failed.');
    }
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 max-w-xl mx-auto my-6 text-white font-sans flex flex-col gap-6">
      
      {/* SECTION 1: Form Input Box */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-red-500 font-eagle uppercase tracking-wider">
          📣 Manual Site Updates Board
        </h3>
        <form onSubmit={handlePostUpdate} className="flex flex-col gap-3">
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Type announcement info text (e.g., Server Upgrade: Mediafire download speeds are now doubled!)..."
            className="bg-zinc-900 border border-zinc-700 p-3 rounded text-sm text-white focus:outline-none focus:border-red-500 h-24 resize-none leading-relaxed"
            required
          />
          <button 
            type="submit" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded transition-colors text-xs uppercase tracking-widest cursor-pointer"
          >
            Publish Notification Live
          </button>
        </form>
        {status && (
          <p className="text-xs mt-3 text-zinc-400 text-center font-medium animate-pulse">
            {status}
          </p>
        )}
      </div>

      {/* SECTION 2: Live Deletions List Manager Block */}
      <div className="border-t border-zinc-700 pt-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          📋 Active Live Notices ({updatesList.length})
        </h4>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {updatesList.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-2">No active announcements found in the database.</p>
          ) : (
            updatesList.map((item) => (
              <div 
                key={item._id} 
                className="bg-zinc-900/60 border border-zinc-700/50 p-2.5 rounded-md flex items-center justify-between gap-3"
              >
                <p className="text-xs text-zinc-300 m-0 leading-normal line-clamp-2">
                  📌 {item.text}
                </p>
                <button
                  onClick={() => handleDeleteUpdate(item._id)}
                  className="bg-red-600/10 hover:bg-red-600 border border-red-900 hover:border-red-600 text-red-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded cursor-pointer shrink-0"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default AdminUpdatesManager;
