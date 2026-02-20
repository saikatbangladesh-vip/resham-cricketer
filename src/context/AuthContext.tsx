import { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { type UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    initializationError: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    initializationError: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializationError, setInitializationError] = useState(false);

    useEffect(() => {
        if (!auth) {
            console.error("Firebase Auth not initialized");
            setInitializationError(true);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && db) {
                try {
                    // Fetch user profile from Firestore
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data() as UserProfile);
                    } else {
                        setUserProfile(null);
                    }
                } catch (e) {
                    console.error("Error fetching user profile:", e);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, initializationError }}>
            {initializationError ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-2">Platform Unavailable</h2>
                        <p className="mb-4">We're having trouble connecting to the backend services. Please check your internet connection or try again later.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
                    {/* Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative flex flex-col items-center">
                        {/* Animated Logo Container */}
                        <div className="relative w-24 h-24 mb-8">
                            {/* Spinning Ring */}
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-[2rem] border-t-primary animate-[spin_2s_linear_infinite]" />
                            {/* Inner Pulse */}
                            <div className="absolute inset-2 bg-primary/10 rounded-[1.5rem] flex items-center justify-center">
                                <div className="w-10 h-10 text-primary animate-pulse flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Text Branding */}
                        <div className="text-center">
                            <h2 className="font-heading text-3xl font-bold tracking-tighter mb-1">
                                <span className="text-foreground">RESHAM </span>
                                <span className="text-primary">CRICKETER</span>
                            </h2>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-[2px] w-6 bg-primary/30 rounded-full" />
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.3em]">Loading</p>
                                <div className="h-[2px] w-6 bg-primary/30 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Tagline */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground/40 font-heading text-sm uppercase tracking-widest whitespace-nowrap">
                        <span>EST. {new Date().getFullYear()}</span>
                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
                        <span>Official Platform</span>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
