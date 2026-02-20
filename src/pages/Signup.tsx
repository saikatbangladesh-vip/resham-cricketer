import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Zap, UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName });
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                displayName,
                email: result.user.email,
                photoURL: null,
                bio: '',
                createdAt: serverTimestamp(),
            });
            toast.success('Welcome to Resham Cricketer! 🏏');
            navigate('/');
        } catch (err: any) {
            toast.error(err.message?.replace('Firebase: ', '') || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
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
                toast.success('Account created! Welcome 🎉');
            }
            navigate('/');
        } catch (err: any) {
            toast.error(err.message?.replace('Firebase: ', '') || 'Google signup failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Visual Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-gradient flex-col items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-glow-gradient" />
                <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center mb-6 glow-primary-lg">
                        <Zap className="w-10 h-10 text-white fill-current" />
                    </div>
                    <h1 className="font-heading text-5xl font-bold mb-4">
                        Join<br /><span className="text-gradient">Resham</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
                        Share your best shots. Inspire a generation of cricketers.
                    </p>

                    <div className="mt-12 space-y-4 text-left">
                        {[
                            '🏏 Upload & share your cricket highlights',
                            '👥 Follow other players & get inspired',
                            '📊 Track your views and likes',
                            '🌟 Get discovered by coaches & fans',
                        ].map((item) => (
                            <div key={item} className="glass rounded-xl px-4 py-3 text-sm border border-white/5">{item}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Form */}
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
                        <h2 className="font-heading text-3xl font-bold">Create account 🏏</h2>
                        <p className="text-muted-foreground mt-2">Start your cricket journey today</p>
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogleSignup}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 glass border border-white/10 py-3 rounded-xl text-sm font-semibold hover:border-white/20 hover:bg-white/5 transition-all duration-200 mb-6 disabled:opacity-60"
                    >
                        {googleLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
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
                        <span className="text-xs text-muted-foreground">or create with email</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Your Name</label>
                            <input
                                type="text"
                                className="input-dark"
                                placeholder="e.g. Shakib Ahmed"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                required
                            />
                        </div>
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
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                                    <UserPlus className="w-4 h-4" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
