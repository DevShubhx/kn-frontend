import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    // Form state handling variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Form submission code targeting the Port 5000 backend API
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://kn-backend-e3sa.onrender.com/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid credentials');
            }

            // Save JSON Web Token locally to remember session profile status
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role); 
                localStorage.setItem('username', data.user.username); 
            }

            // Send admins straight to your stealth entrance path!
            if (data.user && data.user.role === 'admin') {
                navigate('/secret-admin-entrance-99'); 
            } else {
                navigate('/');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#6699ff] text-white min-h-screen w-full flex items-center justify-center p-4">
            
            {/* 🎯 MAIN SPLIT LAYOUT CONTAINER: मोबाइल पर वर्टिकल स्टैक, डेस्कटॉप पर दो हिस्से */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                
                {/* 📺 LEFT SIDE: CUSTOM SIGNUP BANNER IMAGE */}
                <div 
                    onClick={() => navigate('/register')}
                    className="w-full md:w-[45%] max-w-sm md:max-w-md flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-[1.02] shrink-0"
                >
                    <img 
                        src={'src/assets/images/signup-banner.png'} // या public फोल्डर के लिए "/signup-banner.png"
                        alt="Sign Up Banner" 
                        className="w-full h-auto object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,1)]"
                    />
                    <p className="font-sterling text-black text-center text-xs mt-3 uppercase tracking-wider animate-pulse">
                        👉 Click on the Banner to Register New Account!
                    </p>
                </div>

                {/* 📺 RIGHT SIDE: THE CARTOON LOGO BOX (पूरी तरह से रिस्पॉन्सिव बनाया गया) */}
                <div className="bg-[#fdd700] text-white rounded-xl w-full max-w-105 flex justify-center p-3 shrink-0 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] border-4 border-white">
                    
                    {/* Left CD Lights Graphic Accent */}
                    <div>
                        <img 
                            src="src/assets/images/cd_lights.gif" 
                            alt="light-img"
                            className="min-h-11 w-4 mr-3 mt-10" 
                        />
                    </div>
                    
                    {/* Inner Aquamarine Form Container */}
                    <div className="bg-[#99cccc] p-6 sm:p-8 rounded-xl w-full flex flex-col gap-6 ml-2 mr-2 mt-2 mb-2 border-2 border-white">
                        
                        <div className="text-center">
                            <h2 className="text-red-600 text-2xl md:text-3xl font-eagle font-bold tracking-tight uppercase">
                                Member Login
                            </h2>
                            <p className="font-sterling text-black text-[11px] mt-2">
                                Log in to Unlock Downloads & Live TV
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-950/50 border border-red-800 text-red-400 text-xs p-3 rounded text-center font-eagle">
                                {error}
                            </div>
                        )}

                        <form className="flex flex-col gap-4" onSubmit={handleLogin}>

                            {/* Email Input Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-eagle text-black uppercase tracking-wide font-bold">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="login-email"         
                                    name="email"             
                                    autoComplete="username"  
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="dexter@mail.com"
                                    className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-eagle focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                />
                            </div>

                            {/* Password Input Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-eagle text-black uppercase tracking-wide font-bold">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="login-password"             
                                    name="password"                 
                                    autoComplete="current-password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xs focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 hover:text-[#fdd700] disabled:bg-red-800/50 font-powerhouse font-bold py-2.5 rounded transition-all duration-150 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mt-2 text-sm cursor-pointer border border-black text-white uppercase tracking-wide"
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                             {/* 🎯 नया: भूल गए पासवर्ड लिंक (Sign In बटन के ठीक नीचे) */}
                            <div className="font-sterling font-normal text-center mt-1">
                                <span
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-xs text-zinc-900 hover:text-red-600 font-bold font-sterling cursor-pointer transition-colors uppercase tracking-wider underline"
                                >
                                    🔑 Forgot Password?
                                </span>
                            </div>
                        </form>

                        {/* Card Footer: Skip action trigger link */}
                        <div className="text-center text-xs text-black border-t font-sterling border-slate-800/20 pt-4 flex flex-col gap-2">
                            <p
                                onClick={() => navigate('/')}
                                className="text-zinc-800 hover:text-red-600 font-bold font-sterling text-xs transition-colors cursor-pointer mt-1 uppercase tracking-wide"
                            >
                                👉 Skip and Browse Shows
                            </p>
                        </div>
                    </div>

                    {/* Right CD Lights Graphic Accent */}
                    <div>
                        <img 
                            src="src/assets/images/cd_lights.gif" 
                            alt="light-img"
                            className="min-h-11 w-4 m-2 mt-40" 
                        />
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Login;
