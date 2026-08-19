import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ShowPage() {
    const { id } = useParams(); // Extracts the database id from the URL address bar
    const navigate = useNavigate();

    // Dynamic state management containers
    const [show, setShow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Comments state handling
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentError, setCommentError] = useState('');
    const [successFeedback, setSuccessFeedback] = useState(null); // 🌟 Tracks words for user's submitted banner notification

    useEffect(() => {
        // 1. Verify authorization user log state parameter metrics
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        // 2. Fetch specific card collection item info profiles from MongoDB
        const fetchShowDetails = async () => {
            try {
                const response = await fetch(`https://kn-backend-e3sa.onrender.com/api/shows/${id}`);
                if (!response.ok) {
                    throw new Error('This cartoon title could not be located.');
                }
                const data = await response.json();
                setShow(data);
                setComments(data.comments || []); // Mounts the live embedded comment arrays dynamically!

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShowDetails();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        // Capture a local copy of the text words before resetting the input box area
        const userSavedWords = newComment.trim();

        try {
            const token = localStorage.getItem('token');
            const savedUsername = localStorage.getItem('username') || 'You';

            const response = await fetch(`https://kn-backend-e3sa.onrender.com/api/shows/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    text: userSavedWords,
                    username: savedUsername
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit comment.');

            // 🌟 Sets custom approval submission text notice box containing saved words
            setSuccessFeedback(userSavedWords);
            setNewComment('');
            setCommentError('');
        } catch (err) {
            setCommentError(err.message);
            setTimeout(() => setCommentError(''), 4000);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#6699cc] text-white font-eagle flex items-center justify-center text-xl font-bold animate-pulse">
                Loading Series Directory...
            </div>
        );
    }

    if (error || !show) {
        return (
            <div className="w-full min-h-screen bg-[#6699cc] text-white font-eagle flex flex-col items-center justify-center gap-4">
                <p className="text-xl bg-red-600/30 px-6 py-3 border border-red-500 rounded-xl">⚠️ Error: {error || 'Show missing.'}</p>
                <button onClick={() => navigate('/')} className="bg-slate-900/60 hover:bg-slate-900 px-6 py-2 rounded font-bold transition-colors">Go Back Home</button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#6699cc] text-white font-eagle pb-16 flex flex-col items-center">

            {/* MINIMAL HEADER NAVBAR */}
            <header className="w-full bg-slate-900/80 backdrop-blur-md px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-50">
                <div onClick={() => navigate('/')} className="text-xl font-bold tracking-wide cursor-pointer text-red-500 hover:text-red-400">
                    Kartoon<span className="text-white hover:text-blue-400">Network</span>
                </div>
                <button onClick={() => navigate('/catalog')} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors uppercase font-bold tracking-wider">
                    Back
                </button>
            </header>

            {/* MAIN CONTENT STRUCTURAL MATRIX */}
            <main className="w-full max-w-3xl px-4 mt-8 flex flex-col items-center text-center">

                {/* 1. TITLE & UPLOAD TIMESTAMP ELEMENT */}
                <h1 className="text-2xl sm:text-4xl font-extrabold text-red-500 drop-shadow-md tracking-wide mb-1 uppercase">
                    {show.title}
                </h1>
                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest bg-white/20 px-3 py-0.5 rounded-full mb-6">
                    📅 Added: {show.createdAt ? new Date(show.createdAt).toLocaleDateString() : 'Just Now'}
                </p>

                {/* 2. PORTRAIT ASSET CONTAINER RATIO POSTER BOX */}
                <div className="w-56 h-80 sm:w-64 sm:h-96 bg-slate-900 border-4 border-slate-900 rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.01] transition-transform duration-200 mb-6">
                    {show.posterUrl ? (
                        <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 italic text-xs">Poster Unavailable</div>
                    )}
                </div>

                {/* 3. SHOW DESCRIPTION TEXT LABELS */}
                <p className="w-full text-sm sm:text-base text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.6)] leading-relaxed px-4 max-w-2xl mb-10 text-justify sm:text-center font-light">
                    {show.description}
                </p>

                {/* 4. SEASON HEADING DESIGNATOR TRACK BAR */}
                <div className="w-full border-b-2 border-red-600 pb-2 mb-6 flex justify-start">
                    <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest bg-red-600 text-white px-4 py-1 rounded-t-xl">
                        {show.contentType === 'movie' ? '🍿 FEATURE FILM' : 'SEASON - 1'}
                    </h2>
                </div>

                {/* 5. INDIVIDUAL CHAPTER ENTRY STACK WRAPPER MENU */}
                <div className="w-full flex flex-col gap-6 mb-12">
                    {show.episodes && show.episodes.length > 0 ? (
                        show.episodes.map((ep) => (
                            <div
                                key={ep._id || ep.episodeNumber}
                                className="w-full bg-slate-900/90 border border-slate-700/50 p-4 rounded-xl shadow-xl flex flex-col items-center gap-3"
                            >
                                {/* Episode Tracking Key Labels */}
                                <h3 className="text-sm sm:text-base font-bold text-red-500 tracking-wide uppercase">
                                    {show.contentType === 'movie' ? '🎬 WATCH FILM' : `Episode ${ep.episodeNumber}`} — <span className="text-white normal-case font-medium">{ep.title}</span>
                                </h3>

                                {/* Inline Interaction Route Anchor Action Deck Grid */}
                                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 px-2">

                                    {/* Watch Online Button - Open to All Guest Users */}
                                    {ep.streamUrl ? (
                                        <button
                                            onClick={() => navigate(`/watch?show=${encodeURIComponent(show.title)}&ep=${ep.episodeNumber || ''}&title=${encodeURIComponent(ep.title)}&stream=${encodeURIComponent(ep.streamUrl)}`)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors text-center shadow-md cursor-pointer"
                                        >
                                            📺 Watch Online
                                        </button>
                                    ) : (
                                        <span className="bg-slate-800 text-slate-500 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider text-center border border-slate-700/30">Streaming Offline</span>
                                    )}

                                    {/* Secure File Download Link Button Anchor - Conditional Authentication Pass Check */}
                                    {isLoggedIn ? (
                                        ep.downloadUrl ? (
                                            <a
                                                href={ep.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors text-center shadow-md cursor-pointer flex items-center justify-center"
                                            >
                                                💾 High Speed Download
                                            </a>
                                        ) : (
                                            <span className="bg-slate-800 text-slate-500 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider text-center border border-slate-700/30">No Link Assigned</span>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors text-center shadow-md cursor-pointer"
                                        >
                                            🔒 Login to Download
                                        </button>
                                    )}

                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-6 bg-slate-900/40 rounded-xl text-xs italic text-blue-900">
                            No episodes have been logged for this show entry yet.
                        </div>
                    )}
                </div>

                {/* 6. COMMENT INDEX DATA MODULE BOARD FEED SECTION */}
                <section className="w-full border-t border-slate-800/40 pt-8 text-left">
                    <h2 className="text-lg sm:text-xl font-extrabold tracking-wide mb-4 text-slate-900 uppercase">
                        💬 Fan Discussion ({comments.filter(c => c.isApproved).length})
                    </h2>

                    {/* 🌟 USER SUBMISSION BANNER NOTIFICATION: Displays custom response containing text words */}
                    {successFeedback && (
                        <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 mb-5 shadow-lg flex flex-col gap-2">
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider m-0 flex items-center gap-1.5">
                                🔔 Your comment is submitted to be Approved by the Admin.
                            </p>
                            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg mt-1">
                                <p className="text-xs sm:text-sm text-zinc-300 italic m-0 leading-relaxed font-light">
                                    "{successFeedback}"
                                </p>
                            </div>
                        </div>
                    )}

                    {commentError && (
                        <div className="bg-red-950/60 border border-red-900 text-red-400 text-xs p-3 rounded-lg mb-4 text-center">
                            ⚠️ {commentError}
                        </div>
                    )}

                    {/* Conditional Comment Field Frame Wrapper Deck Control Box */}
                    {isLoggedIn ? (
                        <form onSubmit={handleAddComment} className="w-full flex flex-col gap-2 mb-6">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Leave your thoughts on this series..."
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 h-20 resize-none"
                            />
                            <button
                                type="submit"
                                className="self-end bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                            >
                                Post Comment
                            </button>
                        </form>
                    ) : (
                        <div className="w-full bg-red-950/40 border border-red-900/50 p-4 rounded-xl text-center flex flex-col gap-2 mb-6">
                            <p className="text-xs text-red-200">
                                ⚠️ Guest Mode Active. You must be signed into an account profile to participate in comments.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="self-center bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded text-xs transition-colors cursor-pointer"
                            >
                                Login or Sign Up to Comment
                            </button>
                        </div>
                    )}

                    {/* Render Comment Log Output Feeds List Items array */}
                    <div className="w-full flex flex-col gap-4">
                        {comments.filter(comment => comment.isApproved).length === 0 ? (
                            <p className="text-xs text-center py-4 text-blue-900/60 italic font-medium">
                                No comments published yet. Be the first to share your thoughts after review!
                            </p>
                        ) : (
                            comments
                            .filter(comment => comment.isApproved) // 🔒 Strictly hides unapproved guest posts
                            .map((comment) => (
                                <div key={comment._id} className="w-full flex flex-col gap-3">
                                    
                                    {/* FIRST LAYER: Main User Comment Box Card */}
                                    <div className="w-full bg-slate-900/60 border border-white/5 p-3.5 rounded-xl flex flex-col gap-1 shadow-md">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-xs font-bold text-red-400">@{comment.username}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">
                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-200 leading-normal font-light">
                                            {comment.text}
                                        </p>
                                    </div>

                                    {/* SECOND LAYER: Nested Administrator Response Threads Loops */}
                                    {comment.replies && comment.replies.map((reply, rIdx) => (
                                        <div 
                                            key={reply._id || rIdx} 
                                            className="w-11/12 ml-auto bg-slate-950/70 border border-red-900/30 p-3 rounded-xl flex flex-col gap-1 shadow-inner relative"
                                        >
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="text-xs font-extrabold text-blue-400 tracking-wide flex items-center gap-1">
                                                    {reply.username || 'Admin 🛡️'}
                                                </span>
                                                <span className="text-[9px] text-slate-500">
                                                    {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ''}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-300 leading-normal font-normal">
                                                {reply.text}
                                            </p>
                                        </div>
                                    ))}

                                </div>
                            ))
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}
