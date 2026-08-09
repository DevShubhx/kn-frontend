import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const navigate = useNavigate();

    // Form state storage
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission to Port 5000 backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://kn-backend-e3sa.onrender.com/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Route user directly over to login card after database insertion
            navigate('/login');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

        return (
        <div className="bg-[#6699ff] text-white min-h-screen w-full flex items-center justify-center p-4">
            
            {/* 🎯 MAIN SPLIT CONTAINER: मोबाइल पर वर्टिकल, डेस्कटॉप पर दो हिस्से */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                
                {/* 📺 LEFT SIDE: DEXTER IMAGE & TEXT */}
                <div className="w-full md:w-[45%] max-w-sm md:max-w-md flex flex-col items-center justify-center shrink-0 text-center">
                    <img 
                        src={'/src/assets/images/rege-dexter.png'} // 👈 अपनी इमेज को public फोल्डर में 'reg-dexter.png' नाम से रखें
                        alt="Dexter Register" 
                        className="w-full max-w-70 sm:max-w-85 h-auto object-contain drop-shadow-[5px_5px_0px_rgba(0,0,0,1)]"
                    />
                    <p className="font-powerhouse text-black text-center text-xs sm:text-2xl uppercase tracking-wider font-bold max-w-xs sm:max-w-sm leading-relaxed">
                        "Become a Member and get access to the Live TV and Downloads."
                    </p>
                </div>

                {/* 📺 RIGHT SIDE: THE PC SCREEN STYLE REGISTRATION BOX */}
                <div className="bg-[#fdd700] rounded-xl w-full max-w-110 flex justify-center p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4 border-red-600 shrink-0 relative">
                    
                    {/* Left Screen Lights Accents */}
                    <div className="flex flex-col justify-between py-12">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                    </div>
                    
                    {/* Inner Aquamarine PC Screen Form Panel */}
                    <div className="bg-[#99cccc] p-5 sm:p-6 rounded-xl w-full flex flex-col gap-4 ml-3 mr-3 mt-1 mb-1 border-4 border-zinc-900 shadow-inner text-black">
                        
                        <div className="text-center">
                            <h2 className="text-red-600 text-2xl md:text-3xl font-eagle font-bold tracking-tight uppercase">
                                Create Account
                            </h2>
                            <p className="font-sterling text-black text-[11px] mt-1 font-bold">
                                Sign up to unlock Downloads & Live TV features
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-950/70 border-2 border-zinc-900 text-red-400 text-xs p-2.5 rounded text-center font-eagle font-bold">
                                ⚠️ {error}
                            </div>
                        )}

                        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>

                            {/* Username Field */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-eagle text-black uppercase tracking-wide font-black">Username</label>
                                <input
                                    type="text"
                                    id="signup-username"
                                    name="username"
                                    autoComplete="username" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="dexter_laboratory"
                                    className="bg-slate-950 border-2 border-zinc-900 rounded p-2 text-xs font-eagle focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-eagle text-black uppercase tracking-wide font-black">Email Address</label>
                                <input
                                    type="email"
                                    id="signup-email"
                                    name="email"
                                    autoComplete="email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="dexter@mail.com"
                                    className="bg-slate-950 border-2 border-zinc-900 rounded p-2 text-xs font-eagle focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-eagle text-black uppercase tracking-wide font-black">Password</label>
                                <input
                                    type="password"
                                    id="signup-password"
                                    name="password"
                                    autoComplete="new-password" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="bg-slate-950 border-2 border-zinc-900 rounded p-2 text-xs focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-eagle text-black uppercase tracking-wide font-black">Confirm Password</label>
                                <input
                                    type="password"
                                    id="signup-confirm-password"
                                    name="confirmPassword"
                                    autoComplete="new-password" 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="bg-slate-950 border-2 border-zinc-900 rounded p-2 text-xs focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 hover:text-[#fdd700] disabled:bg-red-800/50 font-powerhouse font-bold py-2.5 rounded transition-all duration-150 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mt-2 text-xs cursor-pointer border-2 border-zinc-900 text-white uppercase tracking-wide"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>

                        {/* Card Footer Toggles */}
                        <div className="text-center text-xs text-black border-t-2 border-dashed border-zinc-900/20 pt-3 flex flex-col gap-1.5 font-bold font-sterling">
                            <p className="text-[11px]">
                                Already have an account?{' '}
                                <span
                                    onClick={() => navigate('/login')}
                                    className="text-red-600 hover:underline cursor-pointer uppercase tracking-wider"
                                >
                                    Log in here
                                </span>
                            </p>
                            <p
                                onClick={() => navigate('/')}
                                className="text-zinc-700 hover:text-red-600 transition-colors cursor-pointer mt-0.5 uppercase tracking-wide text-[10px]"
                            >
                                ✨ Skip and Browse Shows
                            </p>
                        </div>
                    </div>

                    {/* Right Screen Lights Accents */}
                    <div className="flex flex-col justify-between py-12 pl-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Signup;
