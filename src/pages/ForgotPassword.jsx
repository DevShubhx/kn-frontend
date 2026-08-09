import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const navigate = useNavigate();
    
    // Form and UI step-flipping variables
    const [step, setStep] = useState(1); // 🎯 step 1 = ईमेल डालना, step 2 = ओटीपी और न्यू पासवर्ड डालना
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔥 एक्शन 1: ईमेल पर ओटीपी सेंड करने का हैंडलर
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Please enter your email address first.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://kn-backend-e3sa.onrender.com/api/users/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Something went wrong.');

            setMessage('Verification OTP sent successfully to your Inbox!');
            
            // 🌟 जादुई बदलाव: लॉगिन पेज पर भागने के बजाय, 2 सेकंड बाद फ़ॉर्म का अगला स्टेप खोलें
            setTimeout(() => {
                setMessage('');
                setStep(2); // 🎯 स्टेप 2 पर स्विच करें (ओटीपी इनपुट स्क्रीन)
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 एक्शन 2: ओटीपी वेरीफाई करके नया पासवर्ड डेटाबेस में सबमिट करने का हैंडलर
    const handleResetPasswordFinal = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!otp || !newPassword) {
            setError('Please enter the received OTP code and your new password.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://kn-backend-e3sa.onrender.com/api/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification Failed.');

            setMessage('Password Updated! Redirecting to login screen...');
            
            // ⏱️ सफलतापूर्वक पासवर्ड बदलने के बाद अब लॉगिन स्क्रीन पर भेजें
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

        return (
        <div className="bg-[#6699ff] text-white min-h-screen w-full flex flex-col items-center justify-center p-4">
            
            {/* 🎯 MAIN BOX CONTAINER (PC मॉनिटर स्टाइल बॉर्डर और शैडो) */}
            <div className="w-full max-w-md relative mt-34 mb-6 shrink-0">
                
                {/* 🐕 COURAGE THE COWARDLY DOG IMAGE OVER THE BOX */}
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-65 sm:w-75 h-auto z-30 pointer-events-none">
                    <img 
                        src="/src/assets/images/courage-pc.png" 
                        alt="Courage PC" 
                        className="w-full h-auto object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                    />
                </div>

                {/* 📺 THE RETRO PC BOX (येलो और एक्वा कॉमिक स्टाइल थीम) */}
                <div className="bg-[#fdd700] rounded-xl w-full flex justify-center p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative z-20">
                    
                    {/* Left Screen Lights Accents */}
                    <div className="flex flex-col justify-between py-10">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                    </div>
                    
                    {/* Inner Aquamarine PC Screen Form Panel */}
                    <div className="bg-[#99cccc] p-6 sm:p-8 rounded-xl w-full flex flex-col gap-5 ml-3 mr-3 mt-2 mb-2 border-4 border-zinc-900 shadow-inner">
                        
                        <div className="text-center mt-2">
                            <h2 className="text-red-600 text-xl sm:text-2xl font-eagle font-bold tracking-tight uppercase leading-tight drop-shadow-[1px_1px_0px_rgba(255,255,255,1)]">
                                {step === 1 ? 'Forgot your PASSWORD?!' : 'ENTER VERIFICATION'}
                            </h2>
                            <p className="font-sterling text-black text-xs mt-1.5 font-bold uppercase tracking-wider animate-pulse">
                                {step === 1 ? "Let's fix it here." : "Check SPAM at your Gmail Inbox "}
                            </p>
                        </div>

                        {/* सक्सेस या एरर अलर्ट संदेश */}
                        {error && (
                            <div className="bg-red-950/70 border-2 border-zinc-900 text-red-400 text-xs p-2.5 rounded text-center font-eagle font-bold">
                                ⚠️ {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-emerald-950/70 border-2 border-zinc-900 text-emerald-400 text-xs p-2.5 rounded text-center font-eagle font-bold animate-pulse">
                                ✅ {message}
                            </div>
                        )}

                        {/* 🌟 STEP 1: केवल रजिस्टर्ड ईमेल दर्ज करने का फॉर्म */}
                        {step === 1 && (
                            <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-eagle text-black uppercase tracking-wide font-black">
                                        Enter Registered Email
                                    </label>
                                    <input
                                        type="email"
                                        id="reset-email"         
                                        name="email"             
                                        autoComplete="email"  
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="eustace@nowhere.com"
                                        className="bg-slate-950 border-2 border-zinc-900 rounded p-2.5 text-xs font-eagle focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 hover:text-[#fdd700] disabled:bg-red-800/50 font-powerhouse font-bold py-2.5 rounded transition-all duration-150 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mt-2 text-sm cursor-pointer border-2 border-zinc-900 text-white uppercase tracking-wide"
                                >
                                    {loading ? 'Sending Code...' : 'Send Reset Code'}
                                </button>
                            </form>
                        )}

                        {/* 🌟 STEP 2: ओटीपी कोड और नया पासवर्ड दर्ज करने का जादुई फॉर्म */}
                        {step === 2 && (
                            <form className="flex flex-col gap-4" onSubmit={handleResetPasswordFinal}>
                                {/* OTP Code Box */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-eagle text-black uppercase tracking-wide font-black">
                                        6-Digit OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        id="reset-otp"         
                                        name="otp"             
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        className="bg-slate-950 border-2 border-zinc-900 rounded p-2.5 text-xs text-center font-mono font-bold tracking-widest focus:outline-none focus:border-red-600 transition-colors text-yellow-400 w-full shadow-inner"
                                        required
                                    />
                                </div>

                                {/* New Password Field */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-eagle text-black uppercase tracking-wide font-black">
                                        New Secure Password
                                    </label>
                                    <input
                                        type="password"
                                        id="reset-password"         
                                        name="newPassword"             
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-slate-950 border-2 border-zinc-900 rounded p-2.5 text-xs focus:outline-none focus:border-red-600 transition-colors text-white w-full shadow-inner"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-emerald-600 hover:bg-emerald-700 hover:text-[#fdd700] disabled:bg-emerald-800/50 font-powerhouse font-bold py-2.5 rounded transition-all duration-150 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mt-2 text-sm cursor-pointer border-2 border-zinc-900 text-white uppercase tracking-wide"
                                >
                                    {loading ? 'Updating...' : 'Verify & Save Password'}
                                </button>
                            </form>
                        )}

                        {/* Back to Login Trigger Link */}
                        <div className="text-center text-xs text-black border-t-2 border-dashed border-zinc-900/30 pt-4 flex flex-col gap-2">
                            <p
                                onClick={() => {
                                    if(step === 2) {
                                        setStep(1); // अगर स्टेप 2 पर हैं तो वापस ईमेल स्क्रीन पर जाने का विकल्प
                                    } else {
                                        navigate('/login');
                                    }
                                }}
                                className="text-zinc-900 hover:text-red-600 font-black font-sterling text-[11px] transition-colors cursor-pointer uppercase tracking-wider underline"
                            >
                                {step === 2 ? "⬅️ Back to Email Screen" : "⬅️ Back to Login Screen"}
                            </p>
                        </div>
                    </div>

                    {/* Right Screen Lights Accents */}
                    <div className="flex flex-col justify-between py-10 pl-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default ForgotPassword;
