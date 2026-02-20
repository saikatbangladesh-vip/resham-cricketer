import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Zap, LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: any) {
            toast.error(err.message?.replace('Firebase: ', '') || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    displayName: user.displayName || 'Player',
                    email: user.email,
                    photoURL: user.photoURL || null,
                    bio: '',
                    createdAt: serverTimestamp(),
                });
            }
            navigate('/');
        } catch (err: any) {
            toast.error(err.message?.replace('Firebase: ', '') || 'Google login failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Visual Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-gradient flex-col items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-glow-gradient" />
                <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center mb-6 glow-primary-lg">
                        <Zap className="w-10 h-10 text-white fill-current" />
                    </div>
                    <h1 className="font-heading text-5xl font-bold mb-4">
                        Resham <span className="text-gradient">Cricketer</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
                        Your stage. Your shots. The world is watching.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-4 text-center">
                        {[
                            { value: '1.2K+', label: 'Clips' },
                            { value: '340+', label: 'Players' },
                            { value: '48K+', label: 'Views' },
                        ].map(s => (
                            <div key={s.label} className="glass rounded-2xl p-4 border border-white/5">
                                <div className="font-heading font-bold text-2xl text-primary">{s.value}</div>
                                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md animate-scale-in">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white fill-current" />
                        </div>
                        <span className="font-heading font-bold text-xl text-gradient">Resham Cricketer</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="font-heading text-3xl font-bold">Welcome back 👋</h2>
                        <p className="text-muted-foreground mt-2">Sign in to your account</p>
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 glass border border-white/10 py-3 rounded-xl text-sm font-semibold hover:border-white/20 hover:bg-white/5 transition-all duration-200 mb-6 disabled:opacity-60"
                    >
                        {googleLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-muted-foreground">or sign in with email</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email</label>
                            <input
                                type="email"
                                className="input-dark"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="input-dark pr-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 h-12"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        New here?{' '}
                        <Link to="/signup" className="text-primary font-semibold hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
