import { useEffect, useState } from 'react';
import VideoFeed from '../components/VideoFeed';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Users, Video } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import SEO from '../components/SEO';

function formatStat(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
    return num.toString();
}

export default function Home() {
    const { user, userProfile } = useAuth();
    const [stats, setStats] = useState({ clips: 0, players: 0, views: 0 });
    const firstName = (userProfile?.displayName || user?.displayName || 'Player').split(' ')[0];

    useEffect(() => {
        // Real-time clips and views count
        const unsubVideos = onSnapshot(collection(db, 'videos'), (snapshot) => {
            let views = 0;
            snapshot.forEach(doc => {
                views += (doc.data().views || 0);
            });
            setStats(prev => ({ ...prev, clips: snapshot.size, views }));
        });

        // Real-time players count
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setStats(prev => ({ ...prev, players: snapshot.size }));
        });

        return () => {
            unsubVideos();
            unsubUsers();
        };
    }, []);

    return (
        <div className="min-h-screen">
            <SEO />
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-brand-gradient border-b border-white/5">
                <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative max-w-7xl mx-auto px-6 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="animate-fade-in">
                            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-semibold text-primary">Cricket Highlights Hub</span>
                            </div>
                            <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
                                Welcome back, <span className="text-gradient">{firstName}!</span>
                            </h1>
                            <p className="text-muted-foreground mt-2 max-w-md">
                                Your daily dose of cricket brilliance. Watch, share, and inspire.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3 animate-fade-in">
                            {[
                                { icon: Video, label: 'Clips', value: formatStat(stats.clips) },
                                { icon: Users, label: 'Players', value: formatStat(stats.players) },
                                { icon: TrendingUp, label: 'Views', value: formatStat(stats.views) },
                            ].map((stat) => (
                                <div key={stat.label} className="glass rounded-2xl p-4 text-center border border-white/5 min-w-[100px]">
                                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                                    <div className="font-heading font-bold text-lg">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Latest Highlights
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">Fresh cricket moments from the community</p>
                    </div>
                    <Link to="/explore" className="btn-ghost text-sm hidden md:flex items-center gap-1.5">
                        View All
                        <span>→</span>
                    </Link>
                </div>

                <VideoFeed />
            </div>
        </div>
    );
}
