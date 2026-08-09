import React, { useState, useEffect } from 'react';

export default function AdminCommentModerator() {
  const [pendingComments, setPendingComments] = useState([]);
  const [replyText, setReplyText] = useState({}); // Tracks input values individually per comment ID
  const [status, setStatus] = useState('');

  const fetchPendingComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://kn-backend-e3sa.onrender.com/api/shows/admin/pending-comments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingComments(data);
      }
    } catch (err) {
      console.error("Failed loading comment moderation dashboard queues:", err);
    }
  };

  useEffect(() => {
    fetchPendingComments();
  }, []);

  const handleApprove = async (showId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://kn-backend-e3sa.onrender.com/api/shows/${showId}/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatus('✅ Comment approved cleanly!');
        fetchPendingComments();
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (err) {
      setStatus('❌ Approval connection failed.');
    }
  };

  const handleSendReply = async (e, showId, commentId) => {
    e.preventDefault();
    const text = replyText[commentId];
    if (!text || !text.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://kn-backend-e3sa.onrender.com/api/shows/${showId}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        setStatus('🚀 Reply attached and comment approved automatically!');
        setReplyText(prev => ({ ...prev, [commentId]: '' }));
        fetchPendingComments();
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (err) {
      setStatus('❌ Reply submission transmission failed.');
    }
  };

  const handleReplyChange = (commentId, value) => {
    setReplyText(prev => ({ ...prev, [commentId]: value }));
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 max-w-xl mx-auto my-6 text-white font-sans">
      <h3 className="text-xl font-bold mb-2 text-red-500 font-eagle uppercase tracking-wider">
        🛡️ Fan Discussion Moderation
      </h3>
      <p className="text-[11px] text-zinc-400 uppercase tracking-wider mb-4">Review pending entries and attach admin response replies</p>
      
      {status && <p className="text-xs text-center bg-zinc-900 border border-zinc-700 p-2 rounded text-amber-400 mb-4 animate-pulse">{status}</p>}

      <div className="flex flex-col gap-4 max-h-125 overflow-y-auto pr-1">
        {pendingComments.length === 0 ? (
          <p className="text-xs text-zinc-500 italic text-center py-6">🎉 Discussion clear! No pending comments awaiting review.</p>
        ) : (
          pendingComments.map((c) => (
            <div key={c.commentId} className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 flex flex-col gap-3 shadow-inner">
              <div className="flex flex-col gap-0.5 border-b border-zinc-800 pb-2">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">🎬 Target Show: {c.showTitle}</span>
                <span className="text-xs font-bold text-sky-400">@{c.username} says:</span>
                <p className="text-xs sm:text-sm text-zinc-200 mt-1 leading-relaxed italic">"{c.text}"</p>
              </div>

              {/* Interaction Form Area */}
              <form onSubmit={(e) => handleSendReply(e, c.showId, c.commentId)} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={replyText[c.commentId] || ''}
                  onChange={(e) => handleReplyChange(c.commentId, e.target.value)}
                  placeholder="Type an official admin response layer reply here..."
                  className="bg-zinc-950 border border-zinc-800 p-2 rounded text-xs text-white focus:outline-none focus:border-red-500"
                />
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => handleApprove(c.showId, c.commentId)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Approve Only
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    ⚡ Reply & Approve
                  </button>
                </div>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
