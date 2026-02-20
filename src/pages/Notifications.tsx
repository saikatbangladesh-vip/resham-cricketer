import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Bell, Heart, Upload, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Notification {
    id: string;
    type: 'upload' | 'like';
    actorId: string;
    actorName: string;
    actorAvatar: string | null;
    videoId: string;
    videoTitle: string;
    targetUserId: string;
    createdAt: { toDate: () => Date; toMillis: () => number } | any;
}

function getTimeAgo(createdAt: any): string {
    try {
        const d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
        return formatDistanceToNow(d, { addSuffix: true });
    } catch { return 'Just now'; }
}

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastReadAt, setLastReadAt] = useState<Date | null>(() => {
        if (typeof window === 'undefined') return null;
        // Moved initialization here to avoid effect-based setState
        return null;
    });

    // Load last-read timestamp from localStorage
    useEffect(() => {
        if (!user) return;
        const stored = localStorage.getItem(`notif_read_${user.uid}`);
        if (stored) {
            setLastReadAt(new Date(parseInt(stored)));
        }
    }, [user]);

    // Real-time listener: global ('all') + personal (user uid) notifications
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('targetUserId', 'in', ['all', user.uid])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Notification[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() } as Notification);
            });
            // Sort newest first client-side (avoids Firestore composite index)
            list.sort((a, b) => {
                const tA = a.createdAt?.toMillis?.() || 0;
                const tB = b.createdAt?.toMillis?.() || 0;
                return tB - tA;
            });
            setNotifications(list);
            setLoading(false);
        }, (error) => {
            console.error('Notifications error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAllRead = () => {
        if (!user) return;
        const now = Date.now();
        localStorage.setItem(`notif_read_${user.uid}`, String(now));
        setLastReadAt(new Date(now));
    };

    const isUnread = (notif: Notification): boolean => {
        if (!lastReadAt) return true;
        try {
            const d = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date(notif.createdAt);
            return d > lastReadAt;
        } catch { return false; }
    };

    const unreadCount = notifications.filter(isUnread).length;
    const now = new Date();

    const today = notifications.filter((n) => {
        try {
            const d = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
            return d.toDateString() === now.toDateString();
        } catch { return false; }
    });
    const earlier = notifications.filter((n) => {
        try {
            const d = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
            return d.toDateString() !== now.toDateString();
        } catch { return true; }
    });

    const NotifItem = ({ notif }: { notif: Notification }) => {
        const unread = isUnread(notif);
        const isLike = notif.type === 'like';

        return (
            <Link
                to={`/watch/${notif.videoId}`}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 ${unread
                    ? 'bg-primary/5 border border-primary/10'
                    : 'hover:bg-white/5 border border-transparent'
                    }`}
            >
                {/* Avatar */}
                <div className="relative shrink-0">
                    {notif.actorAvatar ? (
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/10">
                            <img src={notif.actorAvatar} alt={notif.actorName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-11 h-11 rounded-xl glass border border-white/10 flex items-center justify-center text-base font-bold text-primary bg-primary/10">
                            {notif.actorName?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                    {/* Type badge */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center border-2 border-background ${isLike ? 'bg-red-500' : 'bg-primary'}`}>
                        {isLike
                            ? <Heart className="w-2.5 h-2.5 text-white fill-current" />
                            : <Upload className="w-2.5 h-2.5 text-white" />
                        }
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                        <span className="font-semibold">{notif.actorName}</span>
                        {isLike
                            ? <span className="text-muted-foreground"> liked your clip </span>
                            : <span className="text-muted-foreground"> uploaded a new clip </span>
                        }
                        <span className="font-medium text-primary/90">"{notif.videoTitle}"</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(notif.createdAt)}</p>
                </div>

                {unread && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 animate-pulse" />}
            </Link>
        );
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass border-b border-white/5 sticky top-0 z-10 px-4 md:px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-heading font-bold text-lg leading-none">Notifications</h1>
                            {unreadCount > 0 && (
                                <p className="text-xs text-primary mt-0.5">{unreadCount} new</p>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg font-bold">All caught up!</h3>
                        <p className="text-muted-foreground text-sm mt-2 max-w-xs">
                            No notifications yet. You'll see alerts here when someone uploads a new clip or likes yours.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {today.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Today</h2>
                                <div className="space-y-1">
                                    {today.map((n) => <NotifItem key={n.id} notif={n} />)}
                                </div>
                            </div>
                        )}
                        {earlier.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Earlier</h2>
                                <div className="space-y-1">
                                    {earlier.map((n) => <NotifItem key={n.id} notif={n} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
